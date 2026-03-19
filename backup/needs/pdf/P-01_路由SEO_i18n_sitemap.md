# Block P-01 · PDF 工具套件 — 全站路由 / SEO / i18n / 广告位 / sitemap

> **所属模块**：PDF 工具套件（全站）  
> **竞品参考**：https://pdfhouse.com  
> **预估工时**：2h  
> **依赖**：无  
> **交付粒度**：注册所有路由、补全所有 i18n Key、sitemap、广告位配置

---

## 1. 路由注册

```go
// internal/router/router.go

pdf := r.Group("/pdf")
pdf.Use(middleware.I18n(), middleware.AdsConfig())

// ── 首页 ──────────────────────────────────────────
pdf.GET("", handler.PDFLandingPage)

// ── 编辑工具 ──────────────────────────────────────
pdf.GET("/merge",     handler.PDFToolPage("merge"))
pdf.GET("/split",     handler.PDFToolPage("split"))
pdf.GET("/compress",  handler.PDFToolPage("compress"))
pdf.GET("/rotate",    handler.PDFToolPage("rotate"))
pdf.GET("/watermark", handler.PDFToolPage("watermark"))
pdf.GET("/encrypt",   handler.PDFToolPage("encrypt"))
pdf.GET("/decrypt",   handler.PDFToolPage("decrypt"))
pdf.GET("/ocr",       handler.PDFToolPage("ocr"))

// ── PDF 转出 ──────────────────────────────────────
pdf.GET("/to-word",  handler.PDFToolPage("to-word"))
pdf.GET("/to-excel", handler.PDFToolPage("to-excel"))
pdf.GET("/to-ppt",   handler.PDFToolPage("to-ppt"))
pdf.GET("/to-jpg",   handler.PDFToolPage("to-jpg"))
pdf.GET("/to-png",   handler.PDFToolPage("to-png"))
pdf.GET("/to-txt",   handler.PDFToolPage("to-txt"))
pdf.GET("/to-html",  handler.PDFToolPage("to-html"))

// ── 转入 PDF ──────────────────────────────────────
pdf.GET("/from-word",  handler.PDFToolPage("from-word"))
pdf.GET("/from-excel", handler.PDFToolPage("from-excel"))
pdf.GET("/from-ppt",   handler.PDFToolPage("from-ppt"))
pdf.GET("/from-jpg",   handler.PDFToolPage("from-jpg"))
pdf.GET("/from-png",   handler.PDFToolPage("from-png"))
pdf.GET("/from-txt",   handler.PDFToolPage("from-txt"))

// ── API 路由（后端处理，P-10 实现）────────────────
pdfAPI := r.Group("/api/pdf")
pdfAPI.Use(middleware.RateLimit(30, time.Minute))
pdfAPI.POST("/upload",           handler.PDFUpload)
pdfAPI.POST("/process",          handler.PDFProcess)
pdfAPI.GET("/task/:taskId",      handler.PDFTaskStatus)
pdfAPI.GET("/download/:taskId",  handler.PDFDownload)
pdfAPI.DELETE("/file/:fileId",   handler.PDFDeleteFile)
```

---

## 2. 通用页面 Handler（模板数据注入）

```go
// internal/handler/pdf_pages.go

// 所有工具页 Meta 配置（SEO）
var pdfToolMeta = map[string]struct {
    TitleZH, DescZH, TitleEN, DescEN string
    Accept  string   // 接受的文件类型
    Icon    string   // emoji 图标
    Color   string   // 主题色（用于 Hero 渐变）
}{
    "merge": {
        TitleZH: "合并 PDF — 在线免费合并多个 PDF 文件 | DevToolBox",
        DescZH:  "免费在线合并多个 PDF 文件为一个，支持拖拽排序，无需注册，文件不上传服务器，处理完即删。",
        TitleEN: "Merge PDF — Combine PDF Files Online Free | DevToolBox",
        DescEN:  "Merge multiple PDF files into one online. Drag to reorder pages. Free, no signup required. Files deleted after processing.",
        Accept:  ".pdf",
        Icon:    "🔗",
        Color:   "#e53e3e,#c53030",
    },
    "split": {
        TitleZH: "拆分 PDF — 在线免费拆分 PDF 文件 | DevToolBox",
        DescZH:  "将 PDF 按页码范围或固定间隔拆分成多个文件，也可提取指定页面。在线免费，处理后自动删除文件。",
        TitleEN: "Split PDF — Separate PDF Pages Online Free | DevToolBox",
        DescEN:  "Split PDF by page range or fixed interval. Extract specific pages. Free online tool, files deleted after processing.",
        Accept:  ".pdf",
        Icon:    "✂️",
        Color:   "#d69e2e,#b7791f",
    },
    "compress": {
        TitleZH: "压缩 PDF — 在线减小 PDF 文件大小 | DevToolBox",
        DescZH:  "在线压缩 PDF 文件大小，提供四种画质档位，最高可压缩 90%，保留原始排版效果。",
        TitleEN: "Compress PDF — Reduce PDF File Size Online | DevToolBox",
        DescEN:  "Compress PDF file size online. 4 quality levels, up to 90% size reduction. Free, fast, and secure.",
        Accept:  ".pdf",
        Icon:    "🗜️",
        Color:   "#38a169,#276749",
    },
    "rotate": {
        TitleZH: "旋转 PDF — 在线旋转 PDF 页面方向 | DevToolBox",
        DescZH:  "在线旋转 PDF 页面，支持顺时针/逆时针 90°/180°，可只旋转指定页或全部页面。",
        TitleEN: "Rotate PDF — Fix PDF Page Orientation Online | DevToolBox",
        DescEN:  "Rotate PDF pages online. Clockwise or counterclockwise, 90° or 180°. Rotate all pages or specific ones.",
        Accept:  ".pdf",
        Icon:    "🔄",
        Color:   "#3182ce,#2b6cb0",
    },
    "watermark": {
        TitleZH: "PDF 加水印 — 在线添加文字或图片水印 | DevToolBox",
        DescZH:  "在线为 PDF 添加文字水印或图片水印，可自定义字体、颜色、透明度、位置。",
        TitleEN: "Add Watermark to PDF — Online PDF Watermark Tool | DevToolBox",
        DescEN:  "Add text or image watermarks to PDF files online. Customize font, color, opacity, and position.",
        Accept:  ".pdf",
        Icon:    "🔏",
        Color:   "#805ad5,#6b46c1",
    },
    "encrypt": {
        TitleZH: "PDF 加密 — 在线为 PDF 添加密码保护 | DevToolBox",
        DescZH:  "在线为 PDF 文件设置密码，支持用户密码（打开密码）和权限密码（编辑/打印限制）。",
        TitleEN: "Encrypt PDF — Password Protect PDF Online | DevToolBox",
        DescEN:  "Add password protection to PDF files online. Set open password and permission password.",
        Accept:  ".pdf",
        Icon:    "🔒",
        Color:   "#e53e3e,#9b2c2c",
    },
    "decrypt": {
        TitleZH: "PDF 解密 — 在线移除 PDF 密码保护 | DevToolBox",
        DescZH:  "在线解除 PDF 文件密码，输入原始密码即可移除访问限制。",
        TitleEN: "Decrypt PDF — Remove PDF Password Online | DevToolBox",
        DescEN:  "Remove password from PDF files online. Enter the original password to unlock your PDF.",
        Accept:  ".pdf",
        Icon:    "🔓",
        Color:   "#38a169,#22543d",
    },
    "ocr": {
        TitleZH: "PDF OCR — 在线识别扫描版 PDF 文字 | DevToolBox",
        DescZH:  "使用 OCR 技术识别扫描版 PDF 中的文字，生成可搜索、可复制的 PDF 文件。支持中英文。",
        TitleEN: "PDF OCR — Convert Scanned PDF to Searchable Text | DevToolBox",
        DescEN:  "Extract text from scanned PDF using OCR. Generate searchable, copy-able PDFs. Supports Chinese and English.",
        Accept:  ".pdf",
        Icon:    "🔍",
        Color:   "#d69e2e,#744210",
    },
    "to-word": {
        TitleZH: "PDF 转 Word — 在线将 PDF 转换为 Word 文档 | DevToolBox",
        DescZH:  "免费在线将 PDF 转换为可编辑的 Word (.docx) 文档，保留原始排版、字体和图片。",
        TitleEN: "PDF to Word — Convert PDF to Editable Word Online | DevToolBox",
        DescEN:  "Convert PDF to editable Word (.docx) online. Preserve original layout, fonts and images. Free.",
        Accept:  ".pdf",
        Icon:    "📝",
        Color:   "#2b6cb0,#1a365d",
    },
    "to-excel": {
        TitleZH: "PDF 转 Excel — 在线将 PDF 表格转为 Excel | DevToolBox",
        DescZH:  "将 PDF 中的表格数据转换为可编辑的 Excel (.xlsx) 文件，自动识别行列结构。",
        TitleEN: "PDF to Excel — Convert PDF Tables to Excel Online | DevToolBox",
        DescEN:  "Convert PDF tables to editable Excel (.xlsx). Automatic row and column detection.",
        Accept:  ".pdf",
        Icon:    "📊",
        Color:   "#276749,#1c4532",
    },
    "to-ppt": {
        TitleZH: "PDF 转 PPT — 在线将 PDF 转换为 PowerPoint | DevToolBox",
        DescZH:  "将 PDF 转换为可编辑的 PowerPoint (.pptx) 文件，每页 PDF 对应一张幻灯片。",
        TitleEN: "PDF to PowerPoint — Convert PDF to PPT Online | DevToolBox",
        DescEN:  "Convert PDF to editable PowerPoint (.pptx). Each PDF page becomes a slide.",
        Accept:  ".pdf",
        Icon:    "📑",
        Color:   "#c05621,#7b341e",
    },
    "to-jpg": {
        TitleZH: "PDF 转 JPG — 在线将 PDF 每页转为 JPG 图片 | DevToolBox",
        DescZH:  "将 PDF 每页转换为高清 JPG 图片，可选择分辨率（72/150/300 DPI），批量打包下载。",
        TitleEN: "PDF to JPG — Convert PDF Pages to JPG Images Online | DevToolBox",
        DescEN:  "Convert each PDF page to high-quality JPG images. Choose DPI (72/150/300). Download as ZIP.",
        Accept:  ".pdf",
        Icon:    "🖼️",
        Color:   "#d53f8c,#97266d",
    },
    "to-png": {
        TitleZH: "PDF 转 PNG — 在线将 PDF 每页转为 PNG 图片 | DevToolBox",
        DescZH:  "将 PDF 每页转换为 PNG 图片（透明背景支持），可选择分辨率，批量打包下载。",
        TitleEN: "PDF to PNG — Convert PDF Pages to PNG Images Online | DevToolBox",
        DescEN:  "Convert PDF pages to PNG images with transparent background support. Choose DPI. Download as ZIP.",
        Accept:  ".pdf",
        Icon:    "🎨",
        Color:   "#6b46c1,#44337a",
    },
    "to-txt": {
        TitleZH: "PDF 转 TXT — 在线提取 PDF 文字内容 | DevToolBox",
        DescZH:  "从 PDF 文件中提取纯文本内容，保留段落结构，支持中英文。",
        TitleEN: "PDF to TXT — Extract Text from PDF Online | DevToolBox",
        DescEN:  "Extract plain text from PDF files. Preserve paragraph structure. Supports Chinese and English.",
        Accept:  ".pdf",
        Icon:    "📄",
        Color:   "#4a5568,#2d3748",
    },
    "to-html": {
        TitleZH: "PDF 转 HTML — 在线将 PDF 转换为网页 | DevToolBox",
        DescZH:  "将 PDF 文件转换为 HTML 网页格式，保留文字、图片和基本样式。",
        TitleEN: "PDF to HTML — Convert PDF to Web Page Online | DevToolBox",
        DescEN:  "Convert PDF to HTML web page. Preserve text, images and basic styles.",
        Accept:  ".pdf",
        Icon:    "🌐",
        Color:   "#e53e3e,#742a2a",
    },
    "from-word": {
        TitleZH: "Word 转 PDF — 在线将 Word 文档转换为 PDF | DevToolBox",
        DescZH:  "免费在线将 Word (.doc/.docx) 文件转换为 PDF，完美保留排版格式。",
        TitleEN: "Word to PDF — Convert Word Document to PDF Online | DevToolBox",
        DescEN:  "Convert Word (.doc/.docx) to PDF online. Perfect layout preservation. Free.",
        Accept:  ".doc,.docx",
        Icon:    "📝",
        Color:   "#2b6cb0,#1a365d",
    },
    "from-excel": {
        TitleZH: "Excel 转 PDF — 在线将 Excel 表格转换为 PDF | DevToolBox",
        DescZH:  "免费在线将 Excel (.xls/.xlsx) 转换为 PDF 文件，保留表格格式和公式结果。",
        TitleEN: "Excel to PDF — Convert Excel Spreadsheet to PDF Online | DevToolBox",
        DescEN:  "Convert Excel (.xls/.xlsx) to PDF. Preserve table formatting. Free online tool.",
        Accept:  ".xls,.xlsx",
        Icon:    "📊",
        Color:   "#276749,#1c4532",
    },
    "from-ppt": {
        TitleZH: "PPT 转 PDF — 在线将 PowerPoint 转换为 PDF | DevToolBox",
        DescZH:  "将 PowerPoint (.ppt/.pptx) 幻灯片转换为 PDF 文件，保留动画效果的最终画面。",
        TitleEN: "PPT to PDF — Convert PowerPoint to PDF Online | DevToolBox",
        DescEN:  "Convert PowerPoint (.ppt/.pptx) to PDF. Preserves slide content and images.",
        Accept:  ".ppt,.pptx",
        Icon:    "📑",
        Color:   "#c05621,#7b341e",
    },
    "from-jpg": {
        TitleZH: "JPG 转 PDF — 在线将 JPG 图片转换为 PDF | DevToolBox",
        DescZH:  "将 JPG 图片转换为 PDF 文件，支持批量多张图片合并为一个 PDF。",
        TitleEN: "JPG to PDF — Convert JPG Images to PDF Online | DevToolBox",
        DescEN:  "Convert JPG images to PDF online. Merge multiple images into one PDF. Free.",
        Accept:  ".jpg,.jpeg",
        Icon:    "🖼️",
        Color:   "#d53f8c,#97266d",
    },
    "from-png": {
        TitleZH: "PNG 转 PDF — 在线将 PNG 图片转换为 PDF | DevToolBox",
        DescZH:  "将 PNG 图片转换为 PDF 文件，支持透明背景，批量多张图片合并为一个 PDF。",
        TitleEN: "PNG to PDF — Convert PNG Images to PDF Online | DevToolBox",
        DescEN:  "Convert PNG images to PDF. Transparent background support. Merge multiple images.",
        Accept:  ".png",
        Icon:    "🎨",
        Color:   "#6b46c1,#44337a",
    },
    "from-txt": {
        TitleZH: "TXT 转 PDF — 在线将文本文件转换为 PDF | DevToolBox",
        DescZH:  "将纯文本 (.txt) 文件转换为 PDF 文档，可自定义字体、字号、页面大小。",
        TitleEN: "TXT to PDF — Convert Text File to PDF Online | DevToolBox",
        DescEN:  "Convert text (.txt) files to PDF. Customize font, size and page format.",
        Accept:  ".txt",
        Icon:    "📄",
        Color:   "#4a5568,#2d3748",
    },
}

// PDFToolPage 通用工具页 Handler
func PDFToolPage(toolName string) gin.HandlerFunc {
    return func(c *gin.Context) {
        meta, ok := pdfToolMeta[toolName]
        if !ok {
            c.Status(404); return
        }
        lang  := c.GetString("lang")
        title := meta.TitleZH
        desc  := meta.DescZH
        if lang == "en" { title = meta.TitleEN; desc = meta.DescEN }

        c.HTML(200, "pdf/tool.html", gin.H{
            "ToolName": toolName,
            "Title":    title,
            "Desc":     desc,
            "Icon":     meta.Icon,
            "Color":    meta.Color,
            "Accept":   meta.Accept,
            "Lang":     lang,
            "Path":     "/pdf/" + toolName,
            "FAQs":     getPDFFAQs(toolName, lang),
        })
    }
}
```

---

## 3. SEO Meta 模板（`<head>`）

```html
<!-- templates/pdf/layout.html -->

<title>{{ .Title }}</title>
<meta name="description" content="{{ .Desc }}">
<meta name="keywords"    content="{{ .Keywords }}">

<meta property="og:title"       content="{{ .Title }}">
<meta property="og:description" content="{{ .Desc }}">
<meta property="og:type"        content="website">
<meta property="og:url"         content="https://devtoolbox.dev{{ .Path }}">
<meta property="og:image"       content="https://devtoolbox.dev/static/og/pdf-{{ .ToolName }}.png">

<link rel="canonical" href="https://devtoolbox.dev{{ .Path }}">
<link rel="alternate" hreflang="zh" href="https://devtoolbox.dev{{ .Path }}?lang=zh">
<link rel="alternate" hreflang="en" href="https://devtoolbox.dev{{ .Path }}?lang=en">

<!-- JSON-LD：SoftwareApplication -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "{{ .Title }}",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "Web",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "description": "{{ .Desc }}",
  "url": "https://devtoolbox.dev{{ .Path }}"
}
</script>

<!-- FAQ JSON-LD（Rich Snippets）-->
{{ if .FAQs }}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {{ range $i, $faq := .FAQs }}
    {{ if $i }},{{ end }}
    {
      "@type": "Question",
      "name": {{ $faq.Q | jsonEscape }},
      "acceptedAnswer": { "@type": "Answer", "text": {{ $faq.A | jsonEscape }} }
    }
    {{ end }}
  ]
}
</script>
{{ end }}
```

---

## 4. 广告位插槽

```html
<!-- templates/pdf/layout.html -->

<!-- 工具页顶部 728×90 -->
{{- template "partials/ad_slot.html" dict "SlotID" "pdf-top" "Size" "728x90" "Mobile" "320x50" }}

<!-- 工具区右侧 300×250（桌面）-->
{{- template "partials/ad_slot.html" dict "SlotID" "pdf-sidebar" "Size" "300x250" "MobileHide" true }}

<!-- 下载结果后（高曝光位）300×250 -->
{{- template "partials/ad_slot.html" dict "SlotID" "pdf-result" "Size" "300x250" }}

<!-- 页面底部 728×90 -->
{{- template "partials/ad_slot.html" dict "SlotID" "pdf-bottom" "Size" "728x90" "Mobile" "320x50" }}
```

---

## 5. 全量 i18n Key

### locales/zh.json（PDF 部分）

```json
{
  "pdf.name":  "PDF 工具",
  "pdf.title": "在线 PDF 工具套件",
  "pdf.desc":  "PDF 合并、拆分、压缩、转换，20+ 工具，免费在线使用",

  "pdf.hero.title":       "免费在线 PDF 工具套件",
  "pdf.hero.subtitle":    "合并、拆分、压缩、转换 PDF，20+ 专业工具，无需安装软件",
  "pdf.hero.badge1":      "20+ 工具",
  "pdf.hero.badge2":      "文件不留存",
  "pdf.hero.badge3":      "完全免费",
  "pdf.hero.upload_cta":  "选择文件开始使用",

  "pdf.categories.all":       "全部",
  "pdf.categories.edit":      "编辑工具",
  "pdf.categories.from_pdf":  "PDF 转出",
  "pdf.categories.to_pdf":    "转入 PDF",

  "pdf.tool.merge.name":      "合并 PDF",
  "pdf.tool.merge.desc":      "将多个 PDF 合并为一个文件",
  "pdf.tool.split.name":      "拆分 PDF",
  "pdf.tool.split.desc":      "按页码拆分或提取指定页面",
  "pdf.tool.compress.name":   "压缩 PDF",
  "pdf.tool.compress.desc":   "减小 PDF 文件大小，最高压缩 90%",
  "pdf.tool.rotate.name":     "旋转 PDF",
  "pdf.tool.rotate.desc":     "旋转 PDF 页面方向",
  "pdf.tool.watermark.name":  "加水印",
  "pdf.tool.watermark.desc":  "添加文字或图片水印",
  "pdf.tool.encrypt.name":    "PDF 加密",
  "pdf.tool.encrypt.desc":    "为 PDF 添加密码保护",
  "pdf.tool.decrypt.name":    "PDF 解密",
  "pdf.tool.decrypt.desc":    "移除 PDF 密码",
  "pdf.tool.ocr.name":        "OCR 识别",
  "pdf.tool.ocr.desc":        "识别扫描版 PDF 文字",
  "pdf.tool.to-word.name":    "PDF 转 Word",
  "pdf.tool.to-word.desc":    "导出为可编辑 Word 文档",
  "pdf.tool.to-excel.name":   "PDF 转 Excel",
  "pdf.tool.to-excel.desc":   "提取表格数据为 Excel",
  "pdf.tool.to-ppt.name":     "PDF 转 PPT",
  "pdf.tool.to-ppt.desc":     "转换为 PowerPoint 文件",
  "pdf.tool.to-jpg.name":     "PDF 转 JPG",
  "pdf.tool.to-jpg.desc":     "每页转为高清 JPG 图片",
  "pdf.tool.to-png.name":     "PDF 转 PNG",
  "pdf.tool.to-png.desc":     "每页转为 PNG（支持透明）",
  "pdf.tool.to-txt.name":     "PDF 转 TXT",
  "pdf.tool.to-txt.desc":     "提取纯文本内容",
  "pdf.tool.to-html.name":    "PDF 转 HTML",
  "pdf.tool.to-html.desc":    "转换为网页格式",
  "pdf.tool.from-word.name":  "Word 转 PDF",
  "pdf.tool.from-word.desc":  "Word 文档转为 PDF",
  "pdf.tool.from-excel.name": "Excel 转 PDF",
  "pdf.tool.from-excel.desc": "Excel 表格转为 PDF",
  "pdf.tool.from-ppt.name":   "PPT 转 PDF",
  "pdf.tool.from-ppt.desc":   "PowerPoint 转为 PDF",
  "pdf.tool.from-jpg.name":   "JPG 转 PDF",
  "pdf.tool.from-jpg.desc":   "JPG 图片转为 PDF",
  "pdf.tool.from-png.name":   "PNG 转 PDF",
  "pdf.tool.from-png.desc":   "PNG 图片转为 PDF",
  "pdf.tool.from-txt.name":   "TXT 转 PDF",
  "pdf.tool.from-txt.desc":   "文本文件转为 PDF",

  "pdf.upload.title":        "拖拽文件到此处",
  "pdf.upload.or":           "或",
  "pdf.upload.btn":          "选择文件",
  "pdf.upload.hint":         "最大 50MB",
  "pdf.upload.multi_hint":   "可同时上传多个文件",
  "pdf.upload.drop_active":  "松开鼠标上传",

  "pdf.process.btn":         "开始处理",
  "pdf.process.processing":  "处理中...",
  "pdf.process.uploading":   "上传中...",
  "pdf.process.waiting":     "等待处理...",
  "pdf.process.done":        "处理完成！",

  "pdf.result.download":     "⬇ 下载文件",
  "pdf.result.download_all": "⬇ 打包下载全部",
  "pdf.result.process_new":  "处理新文件",
  "pdf.result.size_before":  "处理前",
  "pdf.result.size_after":   "处理后",
  "pdf.result.size_saved":   "节省",
  "pdf.result.pages":        "页",
  "pdf.result.files":        "个文件",

  "pdf.error.file_too_large":    "文件过大，最大支持 50MB",
  "pdf.error.invalid_type":      "不支持的文件格式",
  "pdf.error.upload_failed":     "上传失败，请重试",
  "pdf.error.process_failed":    "处理失败，请检查文件是否损坏",
  "pdf.error.wrong_password":    "密码错误",
  "pdf.error.encrypted":         "文件已加密，请先解密",
  "pdf.error.no_file":           "请先上传文件",
  "pdf.error.too_many_files":    "最多同时处理 10 个文件",

  "pdf.merge.add_more":      "+ 添加更多文件",
  "pdf.merge.page_count":    "{n} 页",
  "pdf.merge.drag_hint":     "拖拽调整顺序",
  "pdf.merge.remove":        "移除",

  "pdf.split.mode.range":    "按页码范围",
  "pdf.split.mode.interval": "按固定间隔",
  "pdf.split.mode.extract":  "提取指定页",
  "pdf.split.range_hint":    "例如：1-3, 5, 7-9",
  "pdf.split.interval_label":"每 {n} 页拆分一次",
  "pdf.split.extract_hint":  "例如：1,3,5",

  "pdf.compress.quality.high":   "高画质（压缩少）",
  "pdf.compress.quality.medium": "均衡（推荐）",
  "pdf.compress.quality.low":    "低画质（压缩多）",
  "pdf.compress.quality.screen": "屏幕显示（最小）",
  "pdf.compress.estimated":      "预估压缩率",

  "pdf.rotate.angle.90cw":  "顺时针 90°",
  "pdf.rotate.angle.90ccw": "逆时针 90°",
  "pdf.rotate.angle.180":   "180°",
  "pdf.rotate.pages.all":   "全部页面",
  "pdf.rotate.pages.select":"指定页面",

  "pdf.watermark.type.text":    "文字水印",
  "pdf.watermark.type.image":   "图片水印",
  "pdf.watermark.text_label":   "水印文字",
  "pdf.watermark.opacity":      "透明度",
  "pdf.watermark.font_size":    "字号",
  "pdf.watermark.color":        "颜色",
  "pdf.watermark.position":     "位置",
  "pdf.watermark.angle":        "角度",
  "pdf.watermark.pos.center":   "居中",
  "pdf.watermark.pos.tile":     "平铺",
  "pdf.watermark.pos.diagonal": "对角线",

  "pdf.encrypt.open_pwd":   "打开密码",
  "pdf.encrypt.owner_pwd":  "权限密码",
  "pdf.encrypt.restrict_print": "禁止打印",
  "pdf.encrypt.restrict_copy":  "禁止复制",
  "pdf.encrypt.restrict_edit":  "禁止编辑",

  "pdf.decrypt.pwd_label":  "输入 PDF 密码",
  "pdf.decrypt.pwd_hint":   "用于解除访问限制的密码",

  "pdf.to_jpg.dpi.label":   "输出分辨率",
  "pdf.to_jpg.dpi.72":      "72 DPI（网页）",
  "pdf.to_jpg.dpi.150":     "150 DPI（标准）",
  "pdf.to_jpg.dpi.300":     "300 DPI（高清）",
  "pdf.to_jpg.quality":     "JPG 画质",

  "pdf.ocr.lang.label":     "识别语言",
  "pdf.ocr.lang.zh":        "中文",
  "pdf.ocr.lang.en":        "英文",
  "pdf.ocr.lang.zh_en":     "中英混合",

  "pdf.faq.title": "常见问题",
  "pdf.feature.safe.title": "文件安全",
  "pdf.feature.safe.desc":  "所有文件在处理完成后 1 小时内自动删除，全程 HTTPS 加密传输",
  "pdf.feature.fast.title": "极速处理",
  "pdf.feature.fast.desc":  "服务器端多核并行处理，大多数文件在几秒内完成",
  "pdf.feature.free.title": "完全免费",
  "pdf.feature.free.desc":  "所有功能免费使用，无需注册账号，无隐藏费用"
}
```

### locales/en.json（PDF 部分）

```json
{
  "pdf.name":  "PDF Tools",
  "pdf.title": "Online PDF Tool Suite",
  "pdf.desc":  "Merge, split, compress, convert PDFs. 20+ tools, free online.",

  "pdf.hero.title":      "Free Online PDF Tools",
  "pdf.hero.subtitle":   "Merge, split, compress, and convert PDFs. 20+ professional tools. No software to install.",
  "pdf.hero.badge1":     "20+ Tools",
  "pdf.hero.badge2":     "Files Not Stored",
  "pdf.hero.badge3":     "100% Free",
  "pdf.hero.upload_cta": "Choose File to Start",

  "pdf.categories.all":      "All",
  "pdf.categories.edit":     "Edit & Organize",
  "pdf.categories.from_pdf": "Convert from PDF",
  "pdf.categories.to_pdf":   "Convert to PDF",

  "pdf.upload.title":       "Drag & Drop your file here",
  "pdf.upload.or":          "or",
  "pdf.upload.btn":         "Browse File",
  "pdf.upload.hint":        "Max file size: 50MB",
  "pdf.upload.multi_hint":  "Multiple files supported",
  "pdf.upload.drop_active": "Drop to upload",

  "pdf.process.btn":         "Start Processing",
  "pdf.process.processing":  "Processing...",
  "pdf.process.uploading":   "Uploading...",
  "pdf.process.waiting":     "Waiting...",
  "pdf.process.done":        "Done!",

  "pdf.result.download":     "⬇ Download",
  "pdf.result.download_all": "⬇ Download All (ZIP)",
  "pdf.result.process_new":  "Process Another File",
  "pdf.result.size_before":  "Before",
  "pdf.result.size_after":   "After",
  "pdf.result.size_saved":   "Saved",
  "pdf.result.pages":        "pages",
  "pdf.result.files":        "files",

  "pdf.error.file_too_large":  "File too large. Max 50MB.",
  "pdf.error.invalid_type":    "Unsupported file format.",
  "pdf.error.upload_failed":   "Upload failed. Please try again.",
  "pdf.error.process_failed":  "Processing failed. File may be corrupted.",
  "pdf.error.wrong_password":  "Incorrect password.",
  "pdf.error.encrypted":       "File is encrypted. Please decrypt first.",
  "pdf.error.no_file":         "Please upload a file first.",
  "pdf.error.too_many_files":  "Maximum 10 files at once.",

  "pdf.compress.quality.high":   "High Quality (less compression)",
  "pdf.compress.quality.medium": "Balanced (recommended)",
  "pdf.compress.quality.low":    "Low Quality (more compression)",
  "pdf.compress.quality.screen": "Screen Quality (smallest)",
  "pdf.compress.estimated":      "Estimated compression",

  "pdf.faq.title": "Frequently Asked Questions",
  "pdf.feature.safe.title": "Secure & Private",
  "pdf.feature.safe.desc":  "All files are automatically deleted within 1 hour. HTTPS encrypted throughout.",
  "pdf.feature.fast.title": "Lightning Fast",
  "pdf.feature.fast.desc":  "Server-side parallel processing. Most files done in seconds.",
  "pdf.feature.free.title": "100% Free",
  "pdf.feature.free.desc":  "All tools are free. No signup required. No hidden fees."
}
```

---

## 6. sitemap.xml 新增条目

```xml
<!-- 优先级 0.9：高流量核心工具 -->
<url><loc>https://devtoolbox.dev/pdf</loc><priority>0.9</priority><changefreq>weekly</changefreq></url>
<url><loc>https://devtoolbox.dev/pdf/merge</loc><priority>0.9</priority></url>
<url><loc>https://devtoolbox.dev/pdf/compress</loc><priority>0.9</priority></url>
<url><loc>https://devtoolbox.dev/pdf/split</loc><priority>0.9</priority></url>
<url><loc>https://devtoolbox.dev/pdf/to-word</loc><priority>0.9</priority></url>
<url><loc>https://devtoolbox.dev/pdf/to-jpg</loc><priority>0.9</priority></url>
<url><loc>https://devtoolbox.dev/pdf/from-word</loc><priority>0.9</priority></url>
<url><loc>https://devtoolbox.dev/pdf/from-jpg</loc><priority>0.9</priority></url>

<!-- 优先级 0.8：中等工具 -->
<url><loc>https://devtoolbox.dev/pdf/to-excel</loc><priority>0.8</priority></url>
<url><loc>https://devtoolbox.dev/pdf/to-ppt</loc><priority>0.8</priority></url>
<url><loc>https://devtoolbox.dev/pdf/to-png</loc><priority>0.8</priority></url>
<url><loc>https://devtoolbox.dev/pdf/from-excel</loc><priority>0.8</priority></url>
<url><loc>https://devtoolbox.dev/pdf/from-ppt</loc><priority>0.8</priority></url>
<url><loc>https://devtoolbox.dev/pdf/from-png</loc><priority>0.8</priority></url>
<url><loc>https://devtoolbox.dev/pdf/rotate</loc><priority>0.8</priority></url>
<url><loc>https://devtoolbox.dev/pdf/watermark</loc><priority>0.8</priority></url>
<url><loc>https://devtoolbox.dev/pdf/encrypt</loc><priority>0.8</priority></url>
<url><loc>https://devtoolbox.dev/pdf/decrypt</loc><priority>0.8</priority></url>
<url><loc>https://devtoolbox.dev/pdf/ocr</loc><priority>0.8</priority></url>
<url><loc>https://devtoolbox.dev/pdf/to-txt</loc><priority>0.7</priority></url>
<url><loc>https://devtoolbox.dev/pdf/to-html</loc><priority>0.7</priority></url>
<url><loc>https://devtoolbox.dev/pdf/from-txt</loc><priority>0.7</priority></url>
```

---

## 7. 验收标准

- [ ] 所有 22 个工具路由正常 200，无 404
- [ ] 每个工具页 `<title>` 包含工具名 + 关键词 + 品牌名
- [ ] canonical + hreflang + JSON-LD SoftwareApplication 正确输出
- [ ] FAQ JSON-LD 在有 FAQ 数据时正确输出
- [ ] sitemap.xml 包含所有 22 条 PDF 路由
- [ ] i18n 切换后工具名/描述正确显示中英文
- [ ] 广告位在 `ads.enabled=false` 时显示灰色占位框
