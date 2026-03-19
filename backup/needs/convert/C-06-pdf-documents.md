# Block C-06 · 文件转换工具集 — PDF & Documents（10 个工具）

> **涉及路由**：`/convert/pdf` `/convert/document` `/convert/ebook` `/convert/pdf-to-word` `/convert/pdf-to-jpg` `/convert/pdf-to-epub` `/convert/epub-to-pdf` `/convert/heic-to-pdf` `/convert/docx-to-pdf` `/convert/jpg-to-pdf`  
> **预估工时**：4h  
> **依赖**：C-02（公共 UI）、C-03（后端引擎）  
> **后端依赖**：LibreOffice headless、Ghostscript、Calibre（ebook-convert）、pdfcpu、libheif

---

## 1. 竞品对标（freeconvert.com PDF/Document Converter）

| 功能 | 竞品 | 本次实现 | 差异化 |
|------|------|---------|------|
| PDF→Word | ✅ | ✅ LibreOffice | 免费无限制 |
| PDF→JPG | ✅ DPI 可选 | ✅ 72/150/300 DPI | — |
| EPUB 互转 | ✅ Pro | ✅ **免费** Calibre | 核心差异 |
| DOCX→PDF | ✅ | ✅ LibreOffice | — |
| 多页 PDF→ZIP | ✅ | ✅ 超过 5 页自动打包 | — |
| JPG→PDF 排序 | ❌ | ✅ **拖拽排序** | 差异化 |

---

## 2. PDF 特定选项面板（`/static/js/convert-pdf-opts.js`）

```javascript
// /static/js/convert-pdf-opts.js
'use strict';

function initPDFOpts() {
  const slug = window.CV_CONFIG?.slug || '';

  // pdf-to-jpg：DPI 选项
  if (slug === 'pdf-to-jpg') {
    injectOpts(`
      <div class="cv-opt-group">
        <label class="cv-opt-label">输出质量（DPI）</label>
        <div class="cv-opt-pills">
          <label class="cv-opt-pill"><input type="radio" name="dpi" value="72"> 72 DPI（屏幕）</label>
          <label class="cv-opt-pill cv-opt-pill--active"><input type="radio" name="dpi" value="150" checked> 150 DPI（标准）</label>
          <label class="cv-opt-pill"><input type="radio" name="dpi" value="300"> 300 DPI（印刷）</label>
        </div>
      </div>
    `);
  }

  // jpg-to-pdf：拖拽排序提示
  if (slug === 'jpg-to-pdf') {
    injectOpts(`
      <div class="cv-opt-group">
        <span class="cv-opt-label">📌 提示：可在下方文件列表中拖拽调整页面顺序</span>
      </div>
    `);
    // 开启拖拽排序
    enableFileDragSort();
  }
}

function injectOpts(html) {
  const bar = document.getElementById('formatBar');
  const div = document.createElement('div');
  div.className = 'cv-extra-opts';
  div.innerHTML = html;
  const ref = bar || document.querySelector('.cv-upload-zone');
  if (ref) ref.insertAdjacentElement(bar ? 'afterend' : 'beforebegin', div);

  // 初始化 Pills 激活样式
  div.querySelectorAll('.cv-opt-pill input').forEach(input => {
    input.addEventListener('change', () => {
      input.closest('.cv-opt-pills').querySelectorAll('.cv-opt-pill').forEach(p =>
        p.classList.toggle('cv-opt-pill--active', p.querySelector('input')?.checked)
      );
    });
  });
}

/* ─── 文件列表拖拽排序（jpg-to-pdf 专用）─────── */
function enableFileDragSort() {
  // 等待文件列表出现后绑定 sortable
  const observer = new MutationObserver(() => {
    const list = document.getElementById('fileList');
    if (list) {
      makeSortable(list);
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function makeSortable(el) {
  let draggingEl = null;

  el.addEventListener('dragstart', e => {
    draggingEl = e.target.closest('.cv-file-item');
    if (draggingEl) draggingEl.style.opacity = '0.4';
  });

  el.addEventListener('dragover', e => {
    e.preventDefault();
    const target = e.target.closest('.cv-file-item');
    if (target && target !== draggingEl) {
      const rect = target.getBoundingClientRect();
      const after = e.clientY > rect.top + rect.height / 2;
      el.insertBefore(draggingEl, after ? target.nextSibling : target);
    }
  });

  el.addEventListener('dragend', () => {
    if (draggingEl) { draggingEl.style.opacity = ''; draggingEl = null; }
    // 同步 CVState.files 顺序
    const ids = [...el.querySelectorAll('.cv-file-item')].map(e => e.id.replace('item-', ''));
    CVState.files.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
  });

  // 给所有 item 加上 draggable
  const applyDraggable = () => {
    el.querySelectorAll('.cv-file-item').forEach(item => {
      item.setAttribute('draggable', 'true');
    });
  };
  new MutationObserver(applyDraggable).observe(el, { childList: true });
  applyDraggable();
}

window.getExtraOptions = function() {
  const opts = {};
  document.querySelectorAll('.cv-extra-opts input[type=radio]:checked').forEach(el => {
    opts[el.name] = el.value;
  });
  // jpg-to-pdf：传递文件顺序
  const slug = window.CV_CONFIG?.slug;
  if (slug === 'jpg-to-pdf') {
    const ids = [...document.querySelectorAll('.cv-file-item')].map(e => e.id.replace('item-',''));
    opts['order'] = ids.join(',');
  }
  return opts;
};

document.addEventListener('DOMContentLoaded', initPDFOpts);
```

---

## 3. 后端命令详表

### 3.1 PDF → Word（LibreOffice）

```bash
# 环境变量隔离（防止并发冲突）
HOME=/tmp/lo-{jobId} \
TMPDIR=/tmp/lo-{jobId} \
libreoffice --headless \
  --convert-to docx:"MS Word 2007 XML" \
  --outdir /tmp/devtoolbox/convert/ \
  input.pdf

# 说明：
# - LibreOffice PDF→DOCX 依赖 PDF 中是否有可选文本
# - 扫描版 PDF（纯图片）效果差，可在结果页提示"建议使用 OCR 工具"
```

### 3.2 PDF → JPG（Ghostscript）

```bash
# 每页输出一张 JPG
gs -dNOPAUSE -dBATCH -dSAFER \
   -sDEVICE=jpeg \
   -r{72|150|300} \
   -dJPEGQ=90 \
   -sOutputFile=/tmp/convert/{jobId}_%03d.jpg \
   input.pdf

# 多页处理逻辑（Go 代码）：
# 1. 统计页数：pdfcpu info input.pdf
# 2. 单页：直接输出 output.jpg
# 3. 多页（>1页）：全部图片打包为 ZIP 下载
```

```go
// internal/service/converter/document.go 补充
func GhostscriptRasterize(job *Job) error {
    dpi := job.Options["dpi"]
    if dpi == "" { dpi = "150" }

    outPattern := filepath.Join(filepath.Dir(job.OutputPath),
        job.ID + "_%03d.jpg")

    cmd := exec.Command("gs",
        "-dNOPAUSE", "-dBATCH", "-dSAFER",
        "-sDEVICE=jpeg",
        "-r"+dpi,
        "-dJPEGQ=90",
        "-sOutputFile="+outPattern,
        job.InputPath,
    )
    if out, err := cmd.CombinedOutput(); err != nil {
        return fmt.Errorf("gs: %s", out)
    }

    // 统计生成了几页
    pages := collectPages(filepath.Dir(job.OutputPath), job.ID)

    if len(pages) == 1 {
        // 单页：重命名为 output.jpg
        os.Rename(pages[0], job.OutputPath)
    } else {
        // 多页：打包为 ZIP
        zipPath := strings.TrimSuffix(job.OutputPath, ".jpg") + ".zip"
        files := make([]struct{ Path, Name string }, len(pages))
        for i, p := range pages {
            files[i] = struct{ Path, Name string }{
                Path: p,
                Name: fmt.Sprintf("page_%03d.jpg", i+1),
            }
        }
        CreateZip(files, zipPath)
        // 更新 job 输出路径为 ZIP
        UpdateJob(job.ID, func(j *Job) {
            j.OutputPath = zipPath
            j.OutputName = strings.TrimSuffix(j.OutputName, ".jpg") + ".zip"
        })
        // 清理单页图
        for _, p := range pages { os.Remove(p) }
    }
    return nil
}

func collectPages(dir, jobID string) []string {
    var pages []string
    for i := 1; ; i++ {
        p := filepath.Join(dir, fmt.Sprintf("%s_%03d.jpg", jobID, i))
        if _, err := os.Stat(p); err != nil { break }
        pages = append(pages, p)
    }
    return pages
}
```

### 3.3 DOCX → PDF（LibreOffice）

```bash
HOME=/tmp/lo-{jobId} libreoffice --headless \
  --convert-to pdf \
  --outdir /tmp/devtoolbox/convert/ \
  input.docx
```

### 3.4 JPG/PNG → PDF（pdfcpu）

```bash
# 单文件
pdfcpu import "f:A4, pos:full, scale:0.9" output.pdf input.jpg

# 多文件（按排序顺序）
pdfcpu import "f:A4, pos:full, scale:0.9" output.pdf \
  page1.jpg page2.jpg page3.jpg ...
```

后端处理多文件时需要接收文件顺序：

```go
func PDFCPUMergeMulti(job *Job, orderedPaths []string) error {
    args := []string{"import", "f:A4, pos:full, scale:0.9", job.OutputPath}
    args = append(args, orderedPaths...)
    cmd  := exec.Command("pdfcpu", args...)
    out, err := cmd.CombinedOutput()
    if err != nil {
        return fmt.Errorf("pdfcpu: %s", out)
    }
    return nil
}
```

### 3.5 PDF → EPUB / EPUB → PDF（Calibre）

```bash
# PDF → EPUB
ebook-convert input.pdf output.epub \
  --output-profile=tablet \
  --no-chapters-in-toc

# EPUB → PDF
ebook-convert input.epub output.pdf \
  --paper-size=a4

# 电子书互转（ebook）
ebook-convert input.epub  output.mobi
ebook-convert input.mobi  output.epub
ebook-convert input.epub  output.azw3
```

### 3.6 HEIC → PDF

```bash
# 1. HEIC → JPG（libheif）
heif-convert -q 90 input.heic /tmp/{jobId}.jpg

# 2. JPG → PDF（pdfcpu）
pdfcpu import "f:A4, pos:full, scale:0.9" output.pdf /tmp/{jobId}.jpg
```

### 3.7 Document Converter（LibreOffice 格式互转）

```bash
# DOCX → ODT
libreoffice --headless --convert-to odt input.docx --outdir /tmp/

# RTF → DOCX
libreoffice --headless --convert-to "docx:MS Word 2007 XML" input.rtf --outdir /tmp/

# 任意 → TXT
libreoffice --headless --convert-to txt:Text input.docx --outdir /tmp/
```

### 3.8 Ebook Converter（Calibre 支持格式）

| 输入格式 | 输出格式 |
|---------|---------|
| EPUB | MOBI, AZW3, PDF, FB2, TXT, DOCX |
| MOBI | EPUB, AZW3, PDF, TXT |
| AZW3 | EPUB, MOBI, PDF |
| FB2 | EPUB, PDF, TXT |
| TXT | EPUB, MOBI, PDF |

---

## 4. jpg-to-pdf 前端多文件上传优化

```javascript
// /static/js/convert-jpg-pdf.js
// jpg-to-pdf 工具的上传入口（覆盖默认 ConvertUpload 行为）
// 需要将多个文件的 jobId 关联，服务端合并

async function convertAll() {
  if (CVState.isConverting) return;
  const pending = CVState.files.filter(f => f.status === 'pending');
  if (!pending.length) return;

  CVState.isConverting = true;
  setBtnState('processing');

  try {
    // 1. 按顺序上传所有文件，获取 uploadId
    const uploadIds = [];
    for (const item of pending) {
      updateFileItem(item.id, { status: 'uploading', progress: 0 });
      const uploadId = await uploadFile(item);
      uploadIds.push(uploadId);
      updateFileItem(item.id, { status: 'processing', progress: 80 });
    }

    // 2. 发送合并请求
    const resp = await fetch('/convert/api/merge-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uploadIds, format: 'pdf' }),
    });
    if (!resp.ok) throw new Error('合并 PDF 失败');

    const { jobId, filename } = await resp.json();
    const resultUrl = `/convert/api/download/${jobId}`;

    // 3. 所有文件标记为完成（显示同一个下载链接）
    for (const item of pending) {
      updateFileItem(item.id, {
        status: 'done', progress: 100,
        resultUrl, resultName: filename,
      });
    }
    checkAllDone();

  } catch(e) {
    for (const item of pending) {
      updateFileItem(item.id, { status: 'error', error: e.message });
    }
  } finally {
    CVState.isConverting = false;
    setBtnState('idle');
  }
}

function setBtnState(s) {
  const btn  = document.getElementById('convertAllBtn');
  const text = document.getElementById('convertBtnText');
  if (!btn) return;
  btn.disabled = (s === 'processing');
  text.textContent = s === 'processing' ? '合并中...' : '合并为 PDF';
}
```

后端对应新增路由：
```go
api.POST("/merge-pdf", handler.ConvertMergePDF)
```

---

## 5. 验收标准

### 功能
- [ ] `pdf-to-word`：上传扫描 PDF（有文字层），下载 DOCX 文件可用 Word 打开并编辑
- [ ] `pdf-to-jpg`：3 页 PDF → 下载 ZIP 内含 3 张 JPG；单页 PDF → 直接下载 JPG
- [ ] `pdf-to-jpg` DPI=300：JPG 文件分辨率明显高于 DPI=72
- [ ] `docx-to-pdf`：下载 PDF 格式正确，中文字体正常显示（需服务器安装中文字体）
- [ ] `jpg-to-pdf`：上传 3 张 JPG，拖拽调整顺序，合并后 PDF 页面顺序正确
- [ ] `epub-to-pdf`：下载 PDF 可正常阅读，章节结构保留
- [ ] `pdf-to-epub`：下载 EPUB 可在 Calibre/iBooks 中打开
- [ ] `heic-to-pdf`：iPhone HEIC 转换后 PDF 可打开，画质清晰
- [ ] `document`：DOCX→ODT、RTF→DOCX、任意→TXT 均正常
- [ ] `ebook`：EPUB→MOBI、MOBI→EPUB 均正常，Kindle 可识别

### 中文支持
- [ ] LibreOffice 转换中文 DOCX→PDF：字体无乱码（需安装 `fonts-noto-cjk`）
- [ ] Calibre 转换中文 EPUB：正常显示

### 安全
- [ ] LibreOffice 各 Job 使用独立 HOME/TMPDIR，并发 5 个不相互干扰
