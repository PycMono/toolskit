# Block C-03 · 文件转换工具集 — 后端转换引擎

> **文件**：`internal/handler/convert_api.go` + `internal/service/converter/`  
> **预估工时**：4h  
> **依赖**：C-01（路由）  
> **核心原则**：任务队列 + FFmpeg/LibreOffice 封装 + 临时文件自动清理 + SSE 进度推送

---

## 1. 目录结构

```
internal/
├── handler/
│   ├── convert.go          # 页面 Handler（C-01）
│   └── convert_api.go      # API Handler（本 Block）
├── service/
│   └── converter/
│       ├── job.go          # 任务结构体 + 内存存储
│       ├── ffmpeg.go       # FFmpeg 封装（视频/音频/GIF）
│       ├── image.go        # 图片转换（libheif/potrace/canvas）
│       ├── document.go     # 文档转换（LibreOffice/Calibre/pdfcpu）
│       └── cleanup.go      # 定时清理临时文件
```

---

## 2. 任务存储（`internal/service/converter/job.go`）

```go
package converter

import (
    "sync"
    "time"
)

type JobStatus string

const (
    StatusPending    JobStatus = "pending"
    StatusProcessing JobStatus = "processing"
    StatusDone       JobStatus = "done"
    StatusError      JobStatus = "error"
)

type Job struct {
    ID         string
    Slug       string     // 工具标识，如 "mp4-to-mp3"
    Format     string     // 目标格式，如 "mp3"
    InputPath  string     // 临时输入文件路径
    OutputPath string     // 临时输出文件路径
    OutputName string     // 下载文件名
    Status     JobStatus
    Progress   int        // 0~100
    Error      string
    CreatedAt  time.Time
    ExpiresAt  time.Time  // 创建后 1 小时
    Options    map[string]string // 附加参数（bitrate/quality/fps 等）
    ProgressCh chan int    // SSE 进度推送 channel
}

// 内存 Job 存储（生产环境可替换为 Redis）
var (
    jobsMu sync.RWMutex
    jobs   = map[string]*Job{}
)

func SaveJob(job *Job) {
    jobsMu.Lock()
    defer jobsMu.Unlock()
    jobs[job.ID] = job
}

func GetJob(id string) (*Job, bool) {
    jobsMu.RLock()
    defer jobsMu.RUnlock()
    j, ok := jobs[id]
    return j, ok
}

func UpdateJob(id string, fn func(*Job)) {
    jobsMu.Lock()
    defer jobsMu.Unlock()
    if j, ok := jobs[id]; ok {
        fn(j)
    }
}
```

---

## 3. API Handler（`internal/handler/convert_api.go`）

```go
// internal/handler/convert_api.go
package handler

import (
    "fmt"
    "io"
    "net/http"
    "os"
    "path/filepath"
    "strings"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/google/uuid"
    "your-module/internal/service/converter"
)

const (
    TmpDir     = "/tmp/devtoolbox/convert"
    MaxMemory  = 32 << 20 // 32MB 内存解析，超出写临时文件
)

/* ══════════════════════════════════════════════
   POST /convert/api/upload
   接收文件 + 参数，创建任务，异步转换
════════════════════════════════════════════════ */
func ConvertUpload(c *gin.Context) {
    if err := c.Request.ParseMultipartForm(MaxMemory); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid form"})
        return
    }

    slug   := c.PostForm("slug")
    format := c.PostForm("format")

    // 读取转换选项（quality/bitrate/fps/dpi/width/start/duration 等）
    options := map[string]string{}
    for _, key := range []string{"quality", "bitrate", "fps", "dpi", "width", "start", "duration", "delay"} {
        if v := c.PostForm(key); v != "" {
            options[key] = v
        }
    }

    fh, err := c.FormFile("file")
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "missing file"})
        return
    }

    // 校验工具合法性
    meta, ok := ConvertTools[slug]
    if !ok {
        c.JSON(http.StatusBadRequest, gin.H{"error": "unknown tool"})
        return
    }

    // 文件大小校验
    if fh.Size > int64(meta.MaxSizeMB)*1024*1024 {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": fmt.Sprintf("file too large, max %dMB", meta.MaxSizeMB),
        })
        return
    }

    // 保存上传文件
    os.MkdirAll(TmpDir, 0755)
    jobID    := uuid.NewString()
    ext      := filepath.Ext(fh.Filename)
    inputPath:= filepath.Join(TmpDir, jobID+"_input"+ext)

    src, _ := fh.Open()
    defer  src.Close()
    dst, _ := os.Create(inputPath)
    io.Copy(dst, src)
    dst.Close()

    // 确定输出路径
    if format == "" {
        // 自动推断：单输出格式的工具
        if formats := converter.FormatsFor(slug); len(formats) > 0 {
            format = formats[0]
        }
    }

    outputName := strings.TrimSuffix(fh.Filename, ext) + "." + format
    outputPath := filepath.Join(TmpDir, jobID+"_output."+format)

    // 创建任务
    job := &converter.Job{
        ID:         jobID,
        Slug:       slug,
        Format:     format,
        InputPath:  inputPath,
        OutputPath: outputPath,
        OutputName: outputName,
        Status:     converter.StatusPending,
        Options:    options,
        CreatedAt:  time.Now(),
        ExpiresAt:  time.Now().Add(1 * time.Hour),
        ProgressCh: make(chan int, 50),
    }
    converter.SaveJob(job)

    // 异步执行转换
    go converter.RunJob(job)

    c.JSON(http.StatusOK, gin.H{"jobId": jobID})
}

/* ══════════════════════════════════════════════
   GET /convert/api/status/:jobId
════════════════════════════════════════════════ */
func ConvertStatus(c *gin.Context) {
    job, ok := converter.GetJob(c.Param("jobId"))
    if !ok {
        c.JSON(http.StatusNotFound, gin.H{"error": "job not found"})
        return
    }

    resp := gin.H{
        "status":   job.Status,
        "progress": job.Progress,
    }
    if job.Status == converter.StatusDone {
        resp["filename"] = job.OutputName
    }
    if job.Status == converter.StatusError {
        resp["error"] = job.Error
    }

    c.JSON(http.StatusOK, resp)
}

/* ══════════════════════════════════════════════
   GET /convert/api/download/:jobId
════════════════════════════════════════════════ */
func ConvertDownload(c *gin.Context) {
    job, ok := converter.GetJob(c.Param("jobId"))
    if !ok || job.Status != converter.StatusDone {
        c.JSON(http.StatusNotFound, gin.H{"error": "file not ready"})
        return
    }

    c.Header("Content-Disposition",
        fmt.Sprintf(`attachment; filename="%s"`, job.OutputName))
    c.File(job.OutputPath)
}

/* ══════════════════════════════════════════════
   GET /convert/api/progress/:jobId  (SSE)
════════════════════════════════════════════════ */
func ConvertProgress(c *gin.Context) {
    job, ok := converter.GetJob(c.Param("jobId"))
    if !ok {
        c.JSON(http.StatusNotFound, gin.H{"error": "job not found"})
        return
    }

    c.Header("Content-Type",  "text/event-stream")
    c.Header("Cache-Control", "no-cache")
    c.Header("Connection",    "keep-alive")

    c.Stream(func(w io.Writer) bool {
        select {
        case pct, ok := <-job.ProgressCh:
            if !ok {
                return false
            }
            fmt.Fprintf(w, "data: %d\n\n", pct)
            return pct < 100
        case <-c.Request.Context().Done():
            return false
        case <-time.After(30 * time.Second):
            return false
        }
    })
}

/* ══════════════════════════════════════════════
   DELETE /convert/api/job/:jobId
════════════════════════════════════════════════ */
func ConvertCancelJob(c *gin.Context) {
    job, ok := converter.GetJob(c.Param("jobId"))
    if !ok {
        c.JSON(http.StatusNotFound, gin.H{"error": "job not found"})
        return
    }
    os.Remove(job.InputPath)
    os.Remove(job.OutputPath)
    c.JSON(http.StatusOK, gin.H{"ok": true})
}

/* ══════════════════════════════════════════════
   POST /convert/api/download-zip
   多文件打包 ZIP 下载
════════════════════════════════════════════════ */
func ConvertDownloadZip(c *gin.Context) {
    var req struct {
        JobIDs []string `json:"jobIds"`
    }
    if err := c.ShouldBindJSON(&req); err != nil || len(req.JobIDs) == 0 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
        return
    }

    // 收集输出文件
    type entry struct { path, name string }
    var files []entry
    for _, id := range req.JobIDs {
        if job, ok := converter.GetJob(id); ok && job.Status == converter.StatusDone {
            files = append(files, entry{job.OutputPath, job.OutputName})
        }
    }
    if len(files) == 0 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "no ready files"})
        return
    }

    zipPath := filepath.Join(TmpDir, uuid.NewString()+".zip")
    if err := converter.CreateZip(files, zipPath); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    defer os.Remove(zipPath)

    c.Header("Content-Disposition",
        fmt.Sprintf(`attachment; filename="converted-%d.zip"`, time.Now().Unix()))
    c.File(zipPath)
}
```

---

## 4. 任务调度（`internal/service/converter/job.go` 续）

```go
// RunJob 根据 slug 路由到对应转换函数
func RunJob(job *Job) {
    UpdateJob(job.ID, func(j *Job) { j.Status = StatusProcessing })

    var err error

    switch job.Slug {
    // ── Video / Audio ─────────────────────────
    case "video", "mp4", "mov-to-mp4":
        err = FFmpegVideo(job)
    case "audio", "mp3":
        err = FFmpegAudio(job)
    case "mp4-to-mp3", "video-to-mp3":
        err = FFmpegExtractAudio(job)
    case "mp3-to-ogg":
        err = FFmpegAudio(job) // 目标 format = ogg

    // ── Image ─────────────────────────────────
    case "image":
        err = ConvertImageGeneric(job)
    case "webp-to-png", "jfif-to-png", "webp-to-jpg":
        // 前端 Canvas 处理，后端兜底
        err = FFmpegImage(job)
    case "png-to-svg":
        err = PotraceConvert(job)
    case "heic-to-jpg", "heic-to-png":
        err = HeicConvert(job)
    case "svg-converter":
        err = FFmpegImage(job)

    // ── PDF / Documents ────────────────────────
    case "pdf", "document":
        err = LibreOfficeConvert(job)
    case "ebook", "pdf-to-epub", "epub-to-pdf":
        err = CalibreConvert(job)
    case "pdf-to-word":
        err = LibreOfficeConvert(job) // format = docx
    case "pdf-to-jpg":
        err = GhostscriptRasterize(job)
    case "docx-to-pdf":
        err = LibreOfficeConvert(job) // format = pdf
    case "jpg-to-pdf":
        err = PDFCPUMerge(job)
    case "heic-to-pdf":
        err = HeicToPDF(job)

    // ── GIF ───────────────────────────────────
    case "video-to-gif", "mp4-to-gif", "webm-to-gif", "mov-to-gif", "avi-to-gif":
        err = FFmpegToGIF(job)
    case "apng-to-gif":
        err = FFmpegImage(job)
    case "gif-to-mp4":
        err = FFmpegVideo(job)
    case "gif-to-apng":
        err = FFmpegImage(job)
    case "image-to-gif":
        err = FFmpegSlideshow(job)

    // ── Archive ───────────────────────────────
    case "archive":
        err = SevenZipConvert(job)

    default:
        err = fmt.Errorf("unsupported tool: %s", job.Slug)
    }

    // 清理输入文件
    os.Remove(job.InputPath)

    if err != nil {
        UpdateJob(job.ID, func(j *Job) {
            j.Status = StatusError
            j.Error  = err.Error()
        })
        return
    }

    UpdateJob(job.ID, func(j *Job) {
        j.Status   = StatusDone
        j.Progress = 100
    })

    // 关闭进度 channel
    close(job.ProgressCh)
}
```

---

## 5. FFmpeg 封装（`internal/service/converter/ffmpeg.go`）

```go
package converter

import (
    "fmt"
    "os/exec"
    "strconv"
    "strings"
)

/* ── 通用 FFmpeg 执行 + 进度解析 ─────────────── */
func runFFmpeg(job *Job, args []string) error {
    // 添加进度输出参数
    baseArgs := []string{
        "-y",              // 覆盖输出
        "-progress", "pipe:1", // 进度输出到 stdout
        "-stats_period", "0.5",
    }
    args = append(baseArgs, args...)

    cmd := exec.Command("ffmpeg", args...)

    stdout, _ := cmd.StdoutPipe()
    if err := cmd.Start(); err != nil {
        return fmt.Errorf("ffmpeg start failed: %w", err)
    }

    // 解析进度（简化：按文件时长估算）
    go parseFFmpegProgress(stdout, job)

    return cmd.Wait()
}

func parseFFmpegProgress(r interface{ Read([]byte) (int, error) }, job *Job) {
    buf := make([]byte, 512)
    for {
        n, err := r.Read(buf)
        if n > 0 {
            s := string(buf[:n])
            // 解析 out_time_ms=xxx
            if idx := strings.Index(s, "out_time_ms="); idx >= 0 {
                line := s[idx+12:]
                if end := strings.IndexByte(line, '\n'); end > 0 {
                    line = line[:end]
                }
                ms, _ := strconv.ParseInt(strings.TrimSpace(line), 10, 64)
                if ms > 0 && job.Options["duration_ms"] != "" {
                    totalMs, _ := strconv.ParseInt(job.Options["duration_ms"], 10, 64)
                    if totalMs > 0 {
                        pct := int(ms * 90 / totalMs) // 最高到 90%
                        if pct > 90 { pct = 90 }
                        job.ProgressCh <- pct
                    }
                }
            }
        }
        if err != nil { break }
    }
}

/* ── 视频转换 ─────────────────────────────────── */
func FFmpegVideo(job *Job) error {
    quality := job.Options["quality"] // high | medium | low
    crf := map[string]string{"high": "18", "medium": "23", "low": "28"}[quality]
    if crf == "" { crf = "23" }

    args := []string{"-i", job.InputPath}

    switch job.Format {
    case "mp4":
        args = append(args, "-c:v", "libx264", "-crf", crf, "-preset", "fast",
            "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart")
    case "webm":
        args = append(args, "-c:v", "libvpx-vp9", "-crf", crf, "-b:v", "0",
            "-c:a", "libopus")
    case "avi":
        args = append(args, "-c:v", "mpeg4", "-c:a", "mp3")
    case "mov":
        args = append(args, "-c:v", "libx264", "-crf", crf, "-c:a", "aac",
            "-f", "mov")
    case "mkv":
        args = append(args, "-c:v", "libx264", "-crf", crf, "-c:a", "aac")
    case "flv":
        args = append(args, "-c:v", "flv", "-c:a", "mp3")
    case "wmv":
        args = append(args, "-c:v", "wmv2", "-c:a", "wmav2")
    case "3gp":
        args = append(args, "-c:v", "libx264", "-vf", "scale=320:-2",
            "-c:a", "aac", "-b:a", "64k")
    default:
        args = append(args, "-c:v", "libx264", "-crf", crf, "-c:a", "aac")
    }

    args = append(args, job.OutputPath)
    return runFFmpeg(job, args)
}

/* ── 音频转换 ─────────────────────────────────── */
func FFmpegAudio(job *Job) error {
    bitrate := job.Options["bitrate"] // 64k|128k|192k|320k
    if bitrate == "" { bitrate = "192k" }

    args := []string{"-i", job.InputPath}

    switch job.Format {
    case "mp3":
        args = append(args, "-c:a", "libmp3lame", "-b:a", bitrate)
    case "aac":
        args = append(args, "-c:a", "aac", "-b:a", bitrate)
    case "ogg":
        args = append(args, "-c:a", "libvorbis", "-b:a", bitrate)
    case "wav":
        args = append(args, "-c:a", "pcm_s16le")
    case "flac":
        args = append(args, "-c:a", "flac")
    case "wma":
        args = append(args, "-c:a", "wmav2", "-b:a", bitrate)
    case "m4a":
        args = append(args, "-c:a", "aac", "-b:a", bitrate)
    case "aiff":
        args = append(args, "-c:a", "pcm_s16be")
    default:
        args = append(args, "-c:a", "libmp3lame", "-b:a", bitrate)
    }

    args = append(args, job.OutputPath)
    return runFFmpeg(job, args)
}

/* ── 视频提取音轨 ─────────────────────────────── */
func FFmpegExtractAudio(job *Job) error {
    bitrate := job.Options["bitrate"]
    if bitrate == "" { bitrate = "192k" }
    return runFFmpeg(job, []string{
        "-i", job.InputPath,
        "-vn",                           // 不要视频
        "-c:a", "libmp3lame", "-b:a", bitrate,
        job.OutputPath,
    })
}

/* ── 图片转换（FFmpeg 方案）───────────────────── */
func FFmpegImage(job *Job) error {
    args := []string{"-i", job.InputPath}

    switch job.Format {
    case "jpg":
        args = append(args, "-q:v", "2", // 1~31，1最好
            "-vf", "format=yuv420p") // 透明背景转白底
    case "png":
        args = append(args, "-compression_level", "6")
    case "webp":
        args = append(args, "-q:v", "85")
    case "gif":
        args = append(args, "-vf", "fps=10,scale=320:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse")
    case "apng":
        args = append(args, "-plays", "0")
    }

    args = append(args, job.OutputPath)
    return runFFmpeg(job, args)
}

/* ── 视频转 GIF ───────────────────────────────── */
func FFmpegToGIF(job *Job) error {
    fps      := job.Options["fps"]
    width    := job.Options["width"]
    start    := job.Options["start"]
    duration := job.Options["duration"]

    if fps == "" { fps = "10" }
    if width == "" { width = "480" }

    args := []string{"-i", job.InputPath}
    if start != "" { args = append(args, "-ss", start) }
    if duration != "" { args = append(args, "-t", duration) }

    filter := fmt.Sprintf(
        "fps=%s,scale=%s:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse",
        fps, width,
    )
    args = append(args, "-vf", filter, "-loop", "0", job.OutputPath)

    if err := runFFmpeg(job, args); err != nil {
        return err
    }

    // gifsicle 优化
    exec.Command("gifsicle", "-O3", "--batch", job.OutputPath).Run()
    return nil
}

/* ── 多图合成 GIF（幻灯片）──────────────────────── */
func FFmpegSlideshow(job *Job) error {
    delay := job.Options["delay"] // 每帧停留（百分之一秒）
    if delay == "" { delay = "100" } // 默认 1 秒

    // 此处 job.InputPath 为第一张图，实际需要多文件支持（见 C-07 详细设计）
    return runFFmpeg(job, []string{
        "-framerate", fmt.Sprintf("1/%s", delay),
        "-i", job.InputPath,
        "-vf", "scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse",
        "-loop", "0",
        job.OutputPath,
    })
}
```

---

## 6. LibreOffice / Calibre / Ghostscript / pdfcpu 封装（`internal/service/converter/document.go`）

```go
package converter

import (
    "fmt"
    "os"
    "os/exec"
    "path/filepath"
    "strings"
    "time"
)

/* ── LibreOffice headless ────────────────────── */
func LibreOfficeConvert(job *Job) error {
    // 确定 --convert-to 格式
    toFmt := job.Format
    if toFmt == "docx" { toFmt = "docx:MS Word 2007 XML" }

    outDir := filepath.Dir(job.OutputPath)

    cmd := exec.Command("libreoffice",
        "--headless",
        "--convert-to", toFmt,
        "--outdir", outDir,
        job.InputPath,
    )
    cmd.Env = append(os.Environ(),
        "HOME=/tmp",              // 避免并发冲突
        "TMPDIR=/tmp/lo-"+job.ID, // 独立临时目录
    )
    os.MkdirAll("/tmp/lo-"+job.ID, 0755)
    defer os.RemoveAll("/tmp/lo-" + job.ID)

    out, err := cmd.CombinedOutput()
    if err != nil {
        return fmt.Errorf("libreoffice failed: %s", string(out))
    }

    // LibreOffice 输出文件名由它自动生成，需要重命名
    base    := strings.TrimSuffix(filepath.Base(job.InputPath), filepath.Ext(job.InputPath))
    autoOut := filepath.Join(outDir, base+"."+strings.Split(toFmt, ":")[0])
    if autoOut != job.OutputPath {
        os.Rename(autoOut, job.OutputPath)
    }
    return nil
}

/* ── Calibre（ebook-convert）────────────────── */
func CalibreConvert(job *Job) error {
    cmd := exec.Command("ebook-convert",
        job.InputPath,
        job.OutputPath,
    )
    out, err := cmd.CombinedOutput()
    if err != nil {
        return fmt.Errorf("calibre failed: %s", string(out))
    }
    return nil
}

/* ── Ghostscript PDF→JPG（每页一张）──────────── */
func GhostscriptRasterize(job *Job) error {
    dpi := job.Options["dpi"]
    if dpi == "" { dpi = "150" }

    outPattern := strings.TrimSuffix(job.OutputPath, ".jpg") + "_%03d.jpg"

    cmd := exec.Command("gs",
        "-dNOPAUSE", "-dBATCH", "-dSAFER",
        "-sDEVICE=jpeg",
        fmt.Sprintf("-r%s", dpi),
        "-dJPEGQ=90",
        fmt.Sprintf("-sOutputFile=%s", outPattern),
        job.InputPath,
    )
    out, err := cmd.CombinedOutput()
    if err != nil {
        return fmt.Errorf("ghostscript failed: %s", string(out))
    }

    // 如果只有一页：直接重命名为 output.jpg
    // 如果多页：打包为 ZIP（见 PDFCPUMerge）
    firstPage := strings.TrimSuffix(outPattern, "_%03d.jpg") + "_001.jpg"
    if _, err := os.Stat(firstPage); err == nil {
        os.Rename(firstPage, job.OutputPath)
    }
    return nil
}

/* ── pdfcpu：JPG/PNG → PDF ───────────────────── */
func PDFCPUMerge(job *Job) error {
    // pdfcpu 命令行：将多张图片合并为 PDF
    cmd := exec.Command("pdfcpu", "import", "f:A4, pos:full, scale:0.9",
        job.OutputPath, job.InputPath)
    out, err := cmd.CombinedOutput()
    if err != nil {
        return fmt.Errorf("pdfcpu failed: %s", string(out))
    }
    return nil
}

/* ── libheif：HEIC → JPG/PNG ─────────────────── */
func HeicConvert(job *Job) error {
    outFmt := "--quality=90"
    if job.Format == "png" {
        outFmt = ""
    }

    args := []string{job.InputPath, job.OutputPath}
    if outFmt != "" {
        args = append([]string{outFmt}, args...)
    }

    cmd := exec.Command("heif-convert", args...)
    out, err := cmd.CombinedOutput()
    if err != nil {
        return fmt.Errorf("heif-convert failed: %s", string(out))
    }
    return nil
}

/* ── HEIC → PDF（先转 JPG 再合 PDF）───────────── */
func HeicToPDF(job *Job) error {
    tmpJpg := job.OutputPath + ".jpg"
    defer  os.Remove(tmpJpg)

    job2 := *job
    job2.Format     = "jpg"
    job2.OutputPath = tmpJpg
    if err := HeicConvert(&job2); err != nil { return err }

    job3 := *job
    job3.InputPath = tmpJpg
    return PDFCPUMerge(&job3)
}

/* ── Potrace：PNG → SVG ──────────────────────── */
func PotraceConvert(job *Job) error {
    // 先用 ImageMagick 将 PNG 转为 BMP（potrace 输入格式）
    tmpBmp := job.InputPath + ".bmp"
    defer  os.Remove(tmpBmp)

    im := exec.Command("convert", job.InputPath, tmpBmp)
    if out, err := im.CombinedOutput(); err != nil {
        return fmt.Errorf("imagemagick failed: %s", string(out))
    }

    cmd := exec.Command("potrace",
        "--svg",
        "-o", job.OutputPath,
        tmpBmp,
    )
    out, err := cmd.CombinedOutput()
    if err != nil {
        return fmt.Errorf("potrace failed: %s", string(out))
    }
    return nil
}

/* ── 7zip：压缩包转换 ────────────────────────── */
func SevenZipConvert(job *Job) error {
    // 先解压到临时目录，再重新压缩
    tmpExtract := filepath.Join(filepath.Dir(job.InputPath), job.ID+"_extract")
    os.MkdirAll(tmpExtract, 0755)
    defer os.RemoveAll(tmpExtract)

    // 解压
    extract := exec.Command("7z", "x", job.InputPath, "-o"+tmpExtract, "-y")
    if out, err := extract.CombinedOutput(); err != nil {
        return fmt.Errorf("7z extract failed: %s", string(out))
    }

    // 重新压缩为目标格式
    var compress *exec.Cmd
    switch job.Format {
    case "zip":
        compress = exec.Command("7z", "a", "-tzip", job.OutputPath, tmpExtract+"/*")
    case "7z":
        compress = exec.Command("7z", "a", "-t7z", job.OutputPath, tmpExtract+"/*")
    case "tar.gz":
        compress = exec.Command("tar", "-czf", job.OutputPath, "-C", tmpExtract, ".")
    case "tar.bz2":
        compress = exec.Command("tar", "-cjf", job.OutputPath, "-C", tmpExtract, ".")
    default:
        return fmt.Errorf("unsupported archive format: %s", job.Format)
    }

    if out, err := compress.CombinedOutput(); err != nil {
        return fmt.Errorf("compress failed: %s", string(out))
    }
    return nil
}

/* ── ZIP 打包多文件 ───────────────────────────── */
func CreateZip(files []struct{ Path, Name string }, zipPath string) error {
    args := []string{"a", "-tzip", zipPath}
    for _, f := range files {
        args = append(args, f.Path)
    }
    cmd := exec.Command("7z", args...)
    _, err := cmd.CombinedOutput()
    return err
}

/* ── 通用图片转换（FFmpeg 兜底）───────────────── */
func ConvertImageGeneric(job *Job) error {
    return FFmpegImage(job)
}

/* ── 格式查询 ─────────────────────────────────── */
func FormatsFor(slug string) []string {
    m := map[string][]string{
        "mp4-to-mp3": {"mp3"}, "video-to-mp3": {"mp3"},
        "mov-to-mp4": {"mp4"}, "mp3-to-ogg": {"ogg"},
        // ... 与 convert-formats.js 同步
    }
    return m[slug]
}

// 防 unused 引用
var _ = time.Now
```

---

## 7. 定时清理（`internal/service/converter/cleanup.go`）

```go
package converter

import (
    "os"
    "time"
)

// StartCleanup 每 10 分钟扫描过期 Job，删除临时文件
func StartCleanup() {
    go func() {
        for {
            time.Sleep(10 * time.Minute)
            cleanExpired()
        }
    }()
}

func cleanExpired() {
    jobsMu.Lock()
    defer jobsMu.Unlock()

    now := time.Now()
    for id, job := range jobs {
        if now.After(job.ExpiresAt) {
            os.Remove(job.InputPath)
            os.Remove(job.OutputPath)
            delete(jobs, id)
        }
    }
}
```

在 `main.go` 中调用：
```go
converter.StartCleanup()
```

---

## 8. 验收标准

### API
- [ ] `POST /convert/api/upload` 接收文件，返回 `{"jobId":"xxx"}`，响应 < 500ms
- [ ] `GET /convert/api/status/:jobId` 正确返回 `status/progress/filename`
- [ ] `GET /convert/api/download/:jobId` 仅在 status=done 时返回文件，其他返回 404
- [ ] `GET /convert/api/progress/:jobId` SSE 流实时推送 0~100 进度数值

### 转换正确性
- [ ] MP4 → MP3：下载文件可用音频播放器播放，无视频轨
- [ ] MOV → MP4：文件大小合理，可在 Windows 媒体播放器播放
- [ ] DOCX → PDF：格式保留，中文正常显示
- [ ] PNG → SVG：输出为合法 SVG 文件，可在 Inkscape 打开
- [ ] HEIC → JPG：iPhone 拍摄的 HEIC 正确转换，EXIF 尽量保留
- [ ] Video → GIF：宽度默认 480px，帧率 10fps，可在浏览器播放

### 安全 & 清理
- [ ] 上传文件大小超限：返回 400 而非接受文件
- [ ] 不合法 slug：返回 400
- [ ] 任务过期（1h）：输入/输出文件均被删除，内存 Job 记录清除
- [ ] 并发 10 个上传：系统稳定，无 panic，内存可控
