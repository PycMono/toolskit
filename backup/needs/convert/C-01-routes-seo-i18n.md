# Block C-01 · 文件转换工具集 — 路由 / SEO / i18n / sitemap

> **预估工时**：2h  
> **依赖**：无  
> **路由前缀**：`/convert`

---

## 1. Go 路由注册

```go
// internal/router/router.go

conv := r.Group("/convert")
conv.Use(middleware.I18n(), middleware.AdsConfig())

// ── 聚合首页 ──────────────────────────────────────
conv.GET("", handler.ConvertIndexPage)

// ── Video & Audio ─────────────────────────────────
conv.GET("/video",         handler.ConvertPage("video"))
conv.GET("/audio",         handler.ConvertPage("audio"))
conv.GET("/mp3",           handler.ConvertPage("mp3"))
conv.GET("/mp4-to-mp3",    handler.ConvertPage("mp4-to-mp3"))
conv.GET("/video-to-mp3",  handler.ConvertPage("video-to-mp3"))
conv.GET("/mp4",           handler.ConvertPage("mp4"))
conv.GET("/mov-to-mp4",    handler.ConvertPage("mov-to-mp4"))
conv.GET("/mp3-to-ogg",    handler.ConvertPage("mp3-to-ogg"))

// ── Image ─────────────────────────────────────────
conv.GET("/image",         handler.ConvertPage("image"))
conv.GET("/webp-to-png",   handler.ConvertPage("webp-to-png"))
conv.GET("/jfif-to-png",   handler.ConvertPage("jfif-to-png"))
conv.GET("/png-to-svg",    handler.ConvertPage("png-to-svg"))
conv.GET("/heic-to-jpg",   handler.ConvertPage("heic-to-jpg"))
conv.GET("/heic-to-png",   handler.ConvertPage("heic-to-png"))
conv.GET("/webp-to-jpg",   handler.ConvertPage("webp-to-jpg"))
conv.GET("/svg-converter", handler.ConvertPage("svg-converter"))

// ── PDF & Documents ───────────────────────────────
conv.GET("/pdf",           handler.ConvertPage("pdf"))
conv.GET("/document",      handler.ConvertPage("document"))
conv.GET("/ebook",         handler.ConvertPage("ebook"))
conv.GET("/pdf-to-word",   handler.ConvertPage("pdf-to-word"))
conv.GET("/pdf-to-jpg",    handler.ConvertPage("pdf-to-jpg"))
conv.GET("/pdf-to-epub",   handler.ConvertPage("pdf-to-epub"))
conv.GET("/epub-to-pdf",   handler.ConvertPage("epub-to-pdf"))
conv.GET("/heic-to-pdf",   handler.ConvertPage("heic-to-pdf"))
conv.GET("/docx-to-pdf",   handler.ConvertPage("docx-to-pdf"))
conv.GET("/jpg-to-pdf",    handler.ConvertPage("jpg-to-pdf"))

// ── GIF ───────────────────────────────────────────
conv.GET("/video-to-gif",  handler.ConvertPage("video-to-gif"))
conv.GET("/mp4-to-gif",    handler.ConvertPage("mp4-to-gif"))
conv.GET("/webm-to-gif",   handler.ConvertPage("webm-to-gif"))
conv.GET("/apng-to-gif",   handler.ConvertPage("apng-to-gif"))
conv.GET("/gif-to-mp4",    handler.ConvertPage("gif-to-mp4"))
conv.GET("/gif-to-apng",   handler.ConvertPage("gif-to-apng"))
conv.GET("/image-to-gif",  handler.ConvertPage("image-to-gif"))
conv.GET("/mov-to-gif",    handler.ConvertPage("mov-to-gif"))
conv.GET("/avi-to-gif",    handler.ConvertPage("avi-to-gif"))

// ── Others ────────────────────────────────────────
conv.GET("/unit",          handler.ConvertPage("unit"))
conv.GET("/time",          handler.ConvertPage("time"))
conv.GET("/archive",       handler.ConvertPage("archive"))

// ── 后端 API（所有工具共用）─────────────────────
api := conv.Group("/api")
api.POST("/upload",            handler.ConvertUpload)
api.GET("/status/:jobId",      handler.ConvertStatus)
api.GET("/download/:jobId",    handler.ConvertDownload)
api.DELETE("/job/:jobId",      handler.ConvertCancelJob)
api.GET("/progress/:jobId",    handler.ConvertProgress)  // SSE
```

---

## 2. Handler 工厂

```go
// internal/handler/convert.go
package handler

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

// ── 工具元数据注册表 ──────────────────────────────
type ConvertToolMeta struct {
    Slug     string
    Category string   // video | audio | image | pdf | gif | other
    TitleZh  string
    TitleEn  string
    DescZh   string
    DescEn   string
    AcceptZh string   // 接受的文件格式（中文描述）
    AcceptEn string
    Accept   []string // MIME types
    MaxSizeMB int
    // 前端处理（无需后端上传）
    FrontendOnly bool
}

var ConvertTools = map[string]ConvertToolMeta{
    // ── Video & Audio ──────────────────────────────
    "video": {
        Slug: "video", Category: "video",
        TitleZh: "在线视频格式转换器", TitleEn: "Online Video Converter",
        DescZh: "免费在线转换视频格式，支持 MP4、AVI、MOV、MKV、WEBM、FLV 等，无需安装软件。",
        DescEn: "Convert video files online for free. Supports MP4, AVI, MOV, MKV, WEBM, FLV and more.",
        AcceptZh: "MP4、AVI、MOV、MKV、WEBM、FLV、WMV、3GP、TS、VOB",
        AcceptEn: "MP4, AVI, MOV, MKV, WEBM, FLV, WMV, 3GP, TS, VOB",
        Accept: []string{"video/*"},
        MaxSizeMB: 1024,
    },
    "audio": {
        Slug: "audio", Category: "audio",
        TitleZh: "在线音频格式转换器", TitleEn: "Online Audio Converter",
        DescZh: "免费在线转换音频格式，支持 MP3、AAC、OGG、WAV、FLAC、WMA 等，批量处理。",
        DescEn: "Convert audio files online for free. Supports MP3, AAC, OGG, WAV, FLAC, WMA and more.",
        Accept: []string{"audio/*"},
        MaxSizeMB: 200,
    },
    "mp3": {
        Slug: "mp3", Category: "audio",
        TitleZh: "在线 MP3 转换器", TitleEn: "Online MP3 Converter",
        DescZh: "免费将任意音频文件转换为 MP3 格式，可调节比特率（64~320kbps）。",
        DescEn: "Free online MP3 converter. Convert any audio to MP3 with adjustable bitrate.",
        Accept: []string{"audio/*", "video/*"},
        MaxSizeMB: 200,
    },
    "mp4-to-mp3": {
        Slug: "mp4-to-mp3", Category: "audio",
        TitleZh: "MP4 转 MP3 — 在线提取音频", TitleEn: "MP4 to MP3 — Extract Audio Online",
        DescZh: "从 MP4 视频中免费提取 MP3 音频，无需安装软件，秒速转换。",
        DescEn: "Extract MP3 audio from MP4 video files free online. Fast and easy.",
        Accept: []string{"video/mp4", "video/quicktime", "video/*"},
        MaxSizeMB: 1024,
    },
    "video-to-mp3": {
        Slug: "video-to-mp3", Category: "audio",
        TitleZh: "视频转 MP3 — 在线提取音频", TitleEn: "Video to MP3 — Extract Audio Online",
        DescZh: "从任意视频格式提取 MP3 音频，支持 MP4、AVI、MOV、WEBM 等。",
        DescEn: "Extract MP3 audio from any video format online. Supports MP4, AVI, MOV, WEBM.",
        Accept: []string{"video/*"},
        MaxSizeMB: 1024,
    },
    "mp4": {
        Slug: "mp4", Category: "video",
        TitleZh: "在线 MP4 转换器", TitleEn: "Online MP4 Converter",
        DescZh: "免费将任意视频格式转换为 MP4，兼容所有设备和平台。",
        DescEn: "Convert any video to MP4 format online for free. Compatible with all devices.",
        Accept: []string{"video/*"},
        MaxSizeMB: 1024,
    },
    "mov-to-mp4": {
        Slug: "mov-to-mp4", Category: "video",
        TitleZh: "MOV 转 MP4 — 在线免费转换", TitleEn: "MOV to MP4 — Convert Online Free",
        DescZh: "将 Apple QuickTime MOV 视频免费转换为 MP4，无损画质。",
        DescEn: "Convert Apple QuickTime MOV files to MP4 online for free. No quality loss.",
        Accept: []string{"video/quicktime", "video/mov"},
        MaxSizeMB: 1024,
    },
    "mp3-to-ogg": {
        Slug: "mp3-to-ogg", Category: "audio",
        TitleZh: "MP3 转 OGG — 在线免费转换", TitleEn: "MP3 to OGG — Convert Online Free",
        DescZh: "将 MP3 音频免费转换为 OGG Vorbis 格式，适合网页和游戏开发。",
        DescEn: "Convert MP3 audio to OGG Vorbis format online for free. Perfect for web and games.",
        Accept: []string{"audio/mpeg", "audio/mp3"},
        MaxSizeMB: 200,
    },

    // ── Image ─────────────────────────────────────
    "image": {
        Slug: "image", Category: "image",
        TitleZh: "在线图片格式转换器", TitleEn: "Online Image Converter",
        DescZh: "免费在线转换图片格式，支持 JPG、PNG、WEBP、GIF、BMP、TIFF、ICO 等。",
        DescEn: "Convert image formats online for free. Supports JPG, PNG, WEBP, GIF, BMP, TIFF, ICO.",
        Accept: []string{"image/*"},
        MaxSizeMB: 50,
    },
    "webp-to-png": {
        Slug: "webp-to-png", Category: "image",
        TitleZh: "WEBP 转 PNG — 在线免费转换", TitleEn: "WEBP to PNG — Convert Online Free",
        DescZh: "将 WEBP 图片免费转换为 PNG 格式，保留透明通道，无损转换。",
        DescEn: "Convert WEBP images to PNG online for free. Preserves transparency. Lossless.",
        Accept: []string{"image/webp"},
        MaxSizeMB: 50,
        FrontendOnly: true,
    },
    "jfif-to-png": {
        Slug: "jfif-to-png", Category: "image",
        TitleZh: "JFIF 转 PNG — 在线免费转换", TitleEn: "JFIF to PNG — Convert Online Free",
        DescZh: "将 JFIF 图片免费转换为 PNG 格式，浏览器内完成，文件不上传服务器。",
        DescEn: "Convert JFIF images to PNG online for free. Browser-based, no upload.",
        Accept: []string{"image/jpeg", "image/jfif"},
        MaxSizeMB: 50,
        FrontendOnly: true,
    },
    "png-to-svg": {
        Slug: "png-to-svg", Category: "image",
        TitleZh: "PNG 转 SVG — 在线矢量化", TitleEn: "PNG to SVG — Vectorize Online",
        DescZh: "将 PNG 位图免费转换为 SVG 矢量图，使用 Potrace 算法，适合 Logo 矢量化。",
        DescEn: "Convert PNG bitmap to SVG vector online for free. Uses Potrace. Great for logos.",
        Accept: []string{"image/png"},
        MaxSizeMB: 10,
    },
    "heic-to-jpg": {
        Slug: "heic-to-jpg", Category: "image",
        TitleZh: "HEIC 转 JPG — 在线免费转换", TitleEn: "HEIC to JPG — Convert Online Free",
        DescZh: "将 iPhone/iPad 拍摄的 HEIC/HEIF 图片免费转换为通用 JPG 格式。",
        DescEn: "Convert iPhone/iPad HEIC/HEIF photos to JPG format online for free.",
        Accept: []string{"image/heic", "image/heif"},
        MaxSizeMB: 50,
    },
    "heic-to-png": {
        Slug: "heic-to-png", Category: "image",
        TitleZh: "HEIC 转 PNG — 在线免费转换", TitleEn: "HEIC to PNG — Convert Online Free",
        DescZh: "将 HEIC/HEIF 图片免费转换为 PNG 格式，保留原始画质。",
        DescEn: "Convert HEIC/HEIF images to PNG format online for free. Preserves quality.",
        Accept: []string{"image/heic", "image/heif"},
        MaxSizeMB: 50,
    },
    "webp-to-jpg": {
        Slug: "webp-to-jpg", Category: "image",
        TitleZh: "WEBP 转 JPG — 在线免费转换", TitleEn: "WEBP to JPG — Convert Online Free",
        DescZh: "将 WEBP 图片免费转换为 JPG 格式，兼容所有软件和设备。",
        DescEn: "Convert WEBP images to JPG format online for free. Compatible with all software.",
        Accept: []string{"image/webp"},
        MaxSizeMB: 50,
        FrontendOnly: true,
    },
    "svg-converter": {
        Slug: "svg-converter", Category: "image",
        TitleZh: "SVG 转换器 — SVG 转 PNG/JPG", TitleEn: "SVG Converter — SVG to PNG/JPG",
        DescZh: "免费将 SVG 矢量图转换为 PNG、JPG、WEBP 等位图格式，可自定义输出尺寸。",
        DescEn: "Convert SVG vector to PNG, JPG, WEBP bitmap online for free. Custom output size.",
        Accept: []string{"image/svg+xml"},
        MaxSizeMB: 10,
        FrontendOnly: true,
    },

    // ── PDF & Documents ───────────────────────────
    "pdf": {
        Slug: "pdf", Category: "pdf",
        TitleZh: "在线 PDF 转换器", TitleEn: "Online PDF Converter",
        DescZh: "免费在线 PDF 转换，支持 PDF 转 Word、JPG、PNG、HTML，或其他格式转 PDF。",
        DescEn: "Free online PDF converter. Convert PDF to Word, JPG, PNG, HTML or convert to PDF.",
        Accept: []string{"application/pdf", "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"},
        MaxSizeMB: 100,
    },
    "document": {
        Slug: "document", Category: "pdf",
        TitleZh: "在线文档格式转换器", TitleEn: "Online Document Converter",
        DescZh: "免费在线转换文档格式，支持 DOCX、ODT、RTF、TXT 等格式互转。",
        DescEn: "Convert document formats online for free. Supports DOCX, ODT, RTF, TXT and more.",
        Accept: []string{"application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.oasis.opendocument.text",
            "text/rtf", "text/plain"},
        MaxSizeMB: 100,
    },
    "ebook": {
        Slug: "ebook", Category: "pdf",
        TitleZh: "在线电子书格式转换器", TitleEn: "Online Ebook Converter",
        DescZh: "免费转换电子书格式，支持 EPUB、MOBI、AZW3、FB2、TXT 等格式互转。",
        DescEn: "Convert ebook formats online for free. Supports EPUB, MOBI, AZW3, FB2, TXT.",
        Accept: []string{"application/epub+zip", "application/x-mobipocket-ebook",
            "text/plain"},
        MaxSizeMB: 50,
    },
    "pdf-to-word": {
        Slug: "pdf-to-word", Category: "pdf",
        TitleZh: "PDF 转 Word — 在线免费转换", TitleEn: "PDF to Word — Convert Online Free",
        DescZh: "将 PDF 文件免费转换为可编辑的 Word（DOCX）文档，保留原始格式。",
        DescEn: "Convert PDF to editable Word (DOCX) online for free. Preserves formatting.",
        Accept: []string{"application/pdf"},
        MaxSizeMB: 100,
    },
    "pdf-to-jpg": {
        Slug: "pdf-to-jpg", Category: "pdf",
        TitleZh: "PDF 转 JPG — 每页转为图片", TitleEn: "PDF to JPG — Convert Each Page",
        DescZh: "将 PDF 每页免费转换为高清 JPG 图片，可调节图片质量（72~300 DPI）。",
        DescEn: "Convert each PDF page to high-quality JPG image. Adjustable DPI (72~300).",
        Accept: []string{"application/pdf"},
        MaxSizeMB: 100,
    },
    "pdf-to-epub": {
        Slug: "pdf-to-epub", Category: "pdf",
        TitleZh: "PDF 转 EPUB — 在线免费转换", TitleEn: "PDF to EPUB — Convert Online Free",
        DescZh: "将 PDF 文件免费转换为 EPUB 电子书格式，适合 Kindle、iBooks 等阅读器。",
        DescEn: "Convert PDF to EPUB ebook format online for free. Compatible with Kindle, iBooks.",
        Accept: []string{"application/pdf"},
        MaxSizeMB: 100,
    },
    "epub-to-pdf": {
        Slug: "epub-to-pdf", Category: "pdf",
        TitleZh: "EPUB 转 PDF — 在线免费转换", TitleEn: "EPUB to PDF — Convert Online Free",
        DescZh: "将 EPUB 电子书免费转换为 PDF 文件，保留章节结构和格式。",
        DescEn: "Convert EPUB ebook to PDF online for free. Preserves chapters and formatting.",
        Accept: []string{"application/epub+zip"},
        MaxSizeMB: 50,
    },
    "heic-to-pdf": {
        Slug: "heic-to-pdf", Category: "pdf",
        TitleZh: "HEIC 转 PDF — 在线免费转换", TitleEn: "HEIC to PDF — Convert Online Free",
        DescZh: "将 iPhone HEIC 图片免费转换为 PDF 文件，支持多张合并为一个 PDF。",
        DescEn: "Convert iPhone HEIC photos to PDF online for free. Merge multiple photos into one PDF.",
        Accept: []string{"image/heic", "image/heif"},
        MaxSizeMB: 50,
    },
    "docx-to-pdf": {
        Slug: "docx-to-pdf", Category: "pdf",
        TitleZh: "DOCX 转 PDF — 在线免费转换", TitleEn: "DOCX to PDF — Convert Online Free",
        DescZh: "将 Word DOCX 文档免费转换为 PDF 文件，保留格式、字体和图片。",
        DescEn: "Convert Word DOCX to PDF online for free. Preserves formatting, fonts and images.",
        Accept: []string{"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword"},
        MaxSizeMB: 100,
    },
    "jpg-to-pdf": {
        Slug: "jpg-to-pdf", Category: "pdf",
        TitleZh: "JPG 转 PDF — 图片合并为 PDF", TitleEn: "JPG to PDF — Merge Images to PDF",
        DescZh: "将多张 JPG/PNG 图片免费合并为一个 PDF 文件，可调整页面顺序。",
        DescEn: "Merge multiple JPG/PNG images into one PDF online for free. Reorder pages.",
        Accept: []string{"image/jpeg", "image/png", "image/webp"},
        MaxSizeMB: 50,
    },

    // ── GIF ──────────────────────────────────────
    "video-to-gif": {
        Slug: "video-to-gif", Category: "gif",
        TitleZh: "视频转 GIF — 在线免费制作动图", TitleEn: "Video to GIF — Create Animated GIF Online",
        DescZh: "免费将视频片段转换为 GIF 动图，可设置时间范围、帧率、尺寸、质量。",
        DescEn: "Convert video clips to animated GIF online for free. Set time range, FPS, size, quality.",
        Accept: []string{"video/*"},
        MaxSizeMB: 200,
    },
    "mp4-to-gif": {
        Slug: "mp4-to-gif", Category: "gif",
        TitleZh: "MP4 转 GIF — 在线免费转换", TitleEn: "MP4 to GIF — Convert Online Free",
        DescZh: "将 MP4 视频片段免费转换为 GIF 动图，支持设置开始时间、时长、帧率。",
        DescEn: "Convert MP4 video clips to GIF animation online for free. Set start time, duration, FPS.",
        Accept: []string{"video/mp4"},
        MaxSizeMB: 200,
    },
    "webm-to-gif": {
        Slug: "webm-to-gif", Category: "gif",
        TitleZh: "WEBM 转 GIF — 在线免费转换", TitleEn: "WEBM to GIF — Convert Online Free",
        DescZh: "将 WEBM 视频免费转换为 GIF 动图，适合分享到社交媒体。",
        DescEn: "Convert WEBM video to animated GIF online for free. Perfect for social media.",
        Accept: []string{"video/webm"},
        MaxSizeMB: 200,
    },
    "apng-to-gif": {
        Slug: "apng-to-gif", Category: "gif",
        TitleZh: "APNG 转 GIF — 在线免费转换", TitleEn: "APNG to GIF — Convert Online Free",
        DescZh: "将 APNG 动态图片免费转换为 GIF 格式，兼容所有浏览器和平台。",
        DescEn: "Convert APNG animated images to GIF format online for free.",
        Accept: []string{"image/apng", "image/png"},
        MaxSizeMB: 50,
    },
    "gif-to-mp4": {
        Slug: "gif-to-mp4", Category: "gif",
        TitleZh: "GIF 转 MP4 — 在线免费转换", TitleEn: "GIF to MP4 — Convert Online Free",
        DescZh: "将 GIF 动图免费转换为 MP4 视频，文件体积缩小 90%，画质更清晰。",
        DescEn: "Convert GIF animation to MP4 video online for free. Up to 90% smaller file size.",
        Accept: []string{"image/gif"},
        MaxSizeMB: 50,
    },
    "gif-to-apng": {
        Slug: "gif-to-apng", Category: "gif",
        TitleZh: "GIF 转 APNG — 在线免费转换", TitleEn: "GIF to APNG — Convert Online Free",
        DescZh: "将 GIF 动图免费转换为 APNG 格式，支持 Alpha 透明通道，画质更好。",
        DescEn: "Convert GIF to APNG format online for free. Supports alpha transparency, better quality.",
        Accept: []string{"image/gif"},
        MaxSizeMB: 50,
    },
    "image-to-gif": {
        Slug: "image-to-gif", Category: "gif",
        TitleZh: "图片转 GIF — 制作 GIF 幻灯片", TitleEn: "Image to GIF — Make Slideshow GIF",
        DescZh: "将多张图片免费合成 GIF 动图幻灯片，可设置每帧停留时间、循环次数。",
        DescEn: "Combine multiple images into an animated GIF slideshow. Set frame delay and loop count.",
        Accept: []string{"image/jpeg", "image/png", "image/webp"},
        MaxSizeMB: 50,
    },
    "mov-to-gif": {
        Slug: "mov-to-gif", Category: "gif",
        TitleZh: "MOV 转 GIF — 在线免费转换", TitleEn: "MOV to GIF — Convert Online Free",
        DescZh: "将 Apple MOV 视频免费转换为 GIF 动图，支持设置 GIF 参数。",
        DescEn: "Convert Apple MOV video to animated GIF online for free.",
        Accept: []string{"video/quicktime"},
        MaxSizeMB: 200,
    },
    "avi-to-gif": {
        Slug: "avi-to-gif", Category: "gif",
        TitleZh: "AVI 转 GIF — 在线免费转换", TitleEn: "AVI to GIF — Convert Online Free",
        DescZh: "将 AVI 视频文件免费转换为 GIF 动图，快速简单。",
        DescEn: "Convert AVI video files to animated GIF online for free. Fast and easy.",
        Accept: []string{"video/avi", "video/x-msvideo"},
        MaxSizeMB: 200,
    },

    // ── Others ────────────────────────────────────
    "unit": {
        Slug: "unit", Category: "other",
        TitleZh: "在线单位换算器", TitleEn: "Online Unit Converter",
        DescZh: "免费在线单位换算，支持长度、重量、温度、面积、体积、速度等 20+ 类别。",
        DescEn: "Free online unit converter. Length, weight, temperature, area, volume, speed and more.",
        FrontendOnly: true,
        MaxSizeMB: 0,
    },
    "time": {
        Slug: "time", Category: "other",
        TitleZh: "在线时间转换器", TitleEn: "Online Time Converter",
        DescZh: "免费在线时区转换、Unix 时间戳转换、日期计算工具。",
        DescEn: "Free online time zone converter, Unix timestamp converter and date calculator.",
        FrontendOnly: true,
        MaxSizeMB: 0,
    },
    "archive": {
        Slug: "archive", Category: "other",
        TitleZh: "在线压缩包格式转换器", TitleEn: "Online Archive Converter",
        DescZh: "免费在线转换压缩包格式，支持 ZIP、RAR、7Z、TAR.GZ、TAR.BZ2 互转。",
        DescEn: "Convert archive formats online for free. Supports ZIP, RAR, 7Z, TAR.GZ, TAR.BZ2.",
        Accept: []string{"application/zip", "application/x-rar-compressed",
            "application/x-7z-compressed", "application/gzip"},
        MaxSizeMB: 500,
    },
}

// ── 工厂函数：生成工具页 Handler ──────────────────
func ConvertPage(slug string) gin.HandlerFunc {
    return func(c *gin.Context) {
        lang := c.GetString("lang")
        meta, ok := ConvertTools[slug]
        if !ok {
            c.Status(http.StatusNotFound)
            return
        }

        title := meta.TitleZh
        desc  := meta.DescZh
        if lang == "en" {
            title = meta.TitleEn
            desc  = meta.DescEn
        }

        c.HTML(http.StatusOK, "convert/tool.html", gin.H{
            "Lang":         lang,
            "Title":        title + " | DevToolBox",
            "Desc":         desc,
            "Path":         "/convert/" + slug,
            "Slug":         slug,
            "Category":     meta.Category,
            "Meta":         meta,
            "FrontendOnly": meta.FrontendOnly,
            "FAQs":         getConvertFAQs(slug, lang),
        })
    }
}

// ── 首页：All Tools 聚合页 ─────────────────────────
func ConvertIndexPage(c *gin.Context) {
    lang := c.GetString("lang")
    c.HTML(http.StatusOK, "convert/index.html", gin.H{
        "Lang":  lang,
        "Title": map[string]string{
            "zh": "在线文件格式转换工具 | DevToolBox",
            "en": "Online File Converter Tools | DevToolBox",
        }[lang],
        "Desc": map[string]string{
            "zh": "38 种免费在线文件转换工具，支持视频、音频、图片、PDF、GIF、压缩包格式转换。",
            "en": "38 free online file conversion tools. Convert video, audio, image, PDF, GIF and archives.",
        }[lang],
        "Tools": ConvertTools,
    })
}
```

---

## 3. FAQ 工厂

```go
// internal/handler/convert_faq.go

type ConvertFAQ struct{ Q, A string }

func getConvertFAQs(slug, lang string) []ConvertFAQ {
    // 通用 FAQ（每个工具都有）+ 工具专属 FAQ
    common := commonFAQs(lang)
    specific := specificFAQs(slug, lang)
    return append(specific, common...)
}

func commonFAQs(lang string) []ConvertFAQ {
    if lang == "en" {
        return []ConvertFAQ{
            {Q: "Is it free to use?",
             A: "Yes, all tools on DevToolBox are completely free with no hidden fees or registration required."},
            {Q: "How long are files kept on the server?",
             A: "Uploaded files and conversion results are automatically deleted within 1 hour."},
            {Q: "Is my file secure?",
             A: "All uploads use HTTPS encryption. Files are processed on our servers and deleted automatically."},
            {Q: "What is the maximum file size?",
             A: "File size limits vary by type: video up to 1GB, audio 200MB, image 50MB, documents 100MB."},
        }
    }
    return []ConvertFAQ{
        {Q: "使用是否免费？",
         A: "是的，DevToolBox 所有工具完全免费，无需注册，无隐藏费用。"},
        {Q: "文件会保存多久？",
         A: "上传的文件和转换结果会在 1 小时内自动删除。"},
        {Q: "我的文件安全吗？",
         A: "所有上传均使用 HTTPS 加密传输，文件处理完成后会自动删除。"},
        {Q: "文件大小限制是多少？",
         A: "不同类型限制不同：视频最大 1GB，音频 200MB，图片 50MB，文档 100MB。"},
    }
}

func specificFAQs(slug, lang string) []ConvertFAQ {
    // 按 slug 返回各工具特有 FAQ（省略，各工具 Block 中详细定义）
    return nil
}
```

---

## 4. SEO `<head>` 模板（`templates/convert/tool.html` head 部分）

```html
<title>{{ .Title }}</title>
<meta name="description" content="{{ .Desc }}">

<meta property="og:title"       content="{{ .Title }}">
<meta property="og:description" content="{{ .Desc }}">
<meta property="og:type"        content="website">
<meta property="og:url"         content="https://devtoolbox.dev/convert/{{ .Slug }}">

<link rel="canonical" href="https://devtoolbox.dev/convert/{{ .Slug }}">
<link rel="alternate" hreflang="zh" href="https://devtoolbox.dev/convert/{{ .Slug }}?lang=zh">
<link rel="alternate" hreflang="en" href="https://devtoolbox.dev/convert/{{ .Slug }}?lang=en">

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "{{ .Title }}",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Web Browser",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "description": "{{ .Desc }}",
  "url": "https://devtoolbox.dev/convert/{{ .Slug }}"
}
</script>
```

---

## 5. 全量 i18n Key

### locales/zh.json（convert 部分）

```json
{
  "convert.common.upload.title":     "拖拽文件到此处上传",
  "convert.common.upload.or":        "或",
  "convert.common.upload.btn":       "选择文件",
  "convert.common.upload.multi":     "支持多文件同时上传",
  "convert.common.upload.drop":      "松开鼠标开始上传",
  "convert.common.upload.limit":     "单文件最大 {size}，文件不超过 {count} 个",

  "convert.common.output.label":     "输出格式",
  "convert.common.convert.btn":      "开始转换",
  "convert.common.converting":       "转换中...",

  "convert.common.status.waiting":   "等待中",
  "convert.common.status.uploading": "上传中",
  "convert.common.status.processing":"转换中",
  "convert.common.status.done":      "完成",
  "convert.common.status.error":     "失败",

  "convert.common.download.btn":     "下载",
  "convert.common.download.all":     "打包下载全部",
  "convert.common.download.hint":    "文件将在 1 小时后自动删除",

  "convert.common.error.size":       "文件过大，超过限制",
  "convert.common.error.format":     "不支持的文件格式",
  "convert.common.error.server":     "转换失败，请稍后重试",
  "convert.common.error.timeout":    "转换超时，请尝试更小的文件",

  "convert.video.output.mp4":        "MP4（最兼容）",
  "convert.video.output.avi":        "AVI",
  "convert.video.output.mov":        "MOV（Apple）",
  "convert.video.output.mkv":        "MKV",
  "convert.video.output.webm":       "WEBM（网页）",
  "convert.video.output.flv":        "FLV",
  "convert.video.output.wmv":        "WMV",
  "convert.video.output.3gp":        "3GP（手机）",

  "convert.audio.output.mp3":        "MP3（最兼容）",
  "convert.audio.output.aac":        "AAC",
  "convert.audio.output.ogg":        "OGG Vorbis",
  "convert.audio.output.wav":        "WAV（无损）",
  "convert.audio.output.flac":       "FLAC（无损）",
  "convert.audio.output.wma":        "WMA",
  "convert.audio.output.m4a":        "M4A（Apple）",

  "convert.audio.bitrate.label":     "比特率",
  "convert.video.quality.label":     "视频质量",
  "convert.video.quality.high":      "高质量（文件较大）",
  "convert.video.quality.medium":    "标准质量（推荐）",
  "convert.video.quality.low":       "快速压缩（文件较小）",

  "convert.gif.fps.label":           "帧率（FPS）",
  "convert.gif.width.label":         "宽度（px）",
  "convert.gif.start.label":         "开始时间（秒）",
  "convert.gif.duration.label":      "时长（秒）",

  "convert.pdf.dpi.label":           "图片质量（DPI）",
  "convert.pdf.dpi.72":              "72 DPI（屏幕显示）",
  "convert.pdf.dpi.150":             "150 DPI（标准）",
  "convert.pdf.dpi.300":             "300 DPI（印刷品质）"
}
```

### locales/en.json（convert 部分）

```json
{
  "convert.common.upload.title":     "Drop files here to upload",
  "convert.common.upload.or":        "or",
  "convert.common.upload.btn":       "Choose Files",
  "convert.common.upload.multi":     "Multiple files supported",
  "convert.common.upload.drop":      "Release to upload",
  "convert.common.upload.limit":     "Max {size} per file · Up to {count} files",

  "convert.common.output.label":     "Output Format",
  "convert.common.convert.btn":      "Convert",
  "convert.common.converting":       "Converting...",

  "convert.common.status.waiting":   "Waiting",
  "convert.common.status.uploading": "Uploading",
  "convert.common.status.processing":"Converting",
  "convert.common.status.done":      "Done",
  "convert.common.status.error":     "Failed",

  "convert.common.download.btn":     "Download",
  "convert.common.download.all":     "Download All (ZIP)",
  "convert.common.download.hint":    "Files will be deleted in 1 hour",

  "convert.common.error.size":       "File too large",
  "convert.common.error.format":     "Unsupported file format",
  "convert.common.error.server":     "Conversion failed. Please try again.",
  "convert.common.error.timeout":    "Conversion timed out. Try a smaller file.",

  "convert.video.output.mp4":        "MP4 (Most Compatible)",
  "convert.video.output.avi":        "AVI",
  "convert.video.output.mov":        "MOV (Apple)",
  "convert.video.output.mkv":        "MKV",
  "convert.video.output.webm":       "WEBM (Web)",
  "convert.video.output.flv":        "FLV",
  "convert.video.output.wmv":        "WMV",
  "convert.video.output.3gp":        "3GP (Mobile)",

  "convert.audio.output.mp3":        "MP3 (Most Compatible)",
  "convert.audio.output.aac":        "AAC",
  "convert.audio.output.ogg":        "OGG Vorbis",
  "convert.audio.output.wav":        "WAV (Lossless)",
  "convert.audio.output.flac":       "FLAC (Lossless)",
  "convert.audio.output.wma":        "WMA",
  "convert.audio.output.m4a":        "M4A (Apple)",

  "convert.audio.bitrate.label":     "Bitrate",
  "convert.video.quality.label":     "Video Quality",
  "convert.video.quality.high":      "High Quality (larger file)",
  "convert.video.quality.medium":    "Standard Quality (recommended)",
  "convert.video.quality.low":       "Fast Compress (smaller file)",

  "convert.gif.fps.label":           "Frame Rate (FPS)",
  "convert.gif.width.label":         "Width (px)",
  "convert.gif.start.label":         "Start Time (seconds)",
  "convert.gif.duration.label":      "Duration (seconds)",

  "convert.pdf.dpi.label":           "Image Quality (DPI)",
  "convert.pdf.dpi.72":              "72 DPI (Screen)",
  "convert.pdf.dpi.150":             "150 DPI (Standard)",
  "convert.pdf.dpi.300":             "300 DPI (Print Quality)"
}
```

---

## 6. sitemap.xml 新增条目（38 条，示例前 5）

```xml
<url><loc>https://devtoolbox.dev/convert</loc><priority>0.9</priority><changefreq>weekly</changefreq></url>
<url><loc>https://devtoolbox.dev/convert/video</loc><priority>0.85</priority></url>
<url><loc>https://devtoolbox.dev/convert/audio</loc><priority>0.85</priority></url>
<url><loc>https://devtoolbox.dev/convert/mp4-to-mp3</loc><priority>0.85</priority></url>
<url><loc>https://devtoolbox.dev/convert/pdf-to-word</loc><priority>0.85</priority></url>
<!-- ... 以此类推，所有 38 个工具各加 zh/en 双语版本，共 77 条 -->
```

---

## 7. 验收标准

- [ ] `/convert` 聚合页返回 200，展示 5 大分类 38 个工具入口
- [ ] 所有 38 条工具路由返回 200，标题含关键词
- [ ] canonical + hreflang 正确
- [ ] JSON-LD SoftwareApplication 正确
- [ ] sitemap.xml 包含所有工具条目（含双语 = 77 条）
- [ ] 中英文切换无遗漏
