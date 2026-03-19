# Block I-01 · 图片压缩 — 路由 / SEO / i18n / 广告位 / sitemap

> **预估工时**：1h  
> **依赖**：无

---

## 1. Go 路由注册

```go
// internal/router/router.go

img := r.Group("/img")
img.Use(middleware.I18n(), middleware.AdsConfig())

// 图片压缩工具（纯前端，只有一个页面路由）
img.GET("/compress", handler.ImgCompressPage)

// 无后端 API 路由（压缩逻辑全部在前端完成）
```

---

## 2. 页面 Handler

```go
// internal/handler/img_compress.go
package handler

func ImgCompressPage(c *gin.Context) {
    lang := c.GetString("lang")

    seoTitle := map[string]string{
        "zh": "图片压缩 — 在线免费压缩 JPG/PNG/WebP | DevToolBox",
        "en": "Image Compressor — Compress JPG, PNG, WebP Online Free | DevToolBox",
    }
    seoDesc := map[string]string{
        "zh": "免费在线压缩图片，支持 JPG、PNG、WebP 批量处理，最高压缩 90%，文件不上传服务器，完全在浏览器内完成。",
        "en": "Free online image compressor. Compress JPG, PNG and WebP in bulk. Up to 90% size reduction. Files never leave your browser.",
    }

    c.HTML(200, "img/compress.html", gin.H{
        "Lang":  lang,
        "Title": seoTitle[lang],
        "Desc":  seoDesc[lang],
        "Path":  "/img/compress",
        "FAQs":  getImgCompressFAQs(lang),
    })
}

type ImgFAQ struct{ Q, A string }

func getImgCompressFAQs(lang string) []ImgFAQ {
    if lang == "en" {
        return []ImgFAQ{
            {Q: "Is image compression done on the server?",
             A: "No. All compression happens entirely in your browser using Canvas API and WebAssembly. Your images are never uploaded to any server."},
            {Q: "What formats are supported?",
             A: "JPG/JPEG, PNG, and WebP. GIF is not supported as frame-by-frame compression would significantly reduce quality."},
            {Q: "How much can images be compressed?",
             A: "Typically 40–80% for JPEG and 50–90% for PNG. Results vary by image content. You can adjust the quality slider to balance file size and visual quality."},
            {Q: "Is there a file size or count limit?",
             A: "Each file can be up to 10MB. You can process up to 20 images at once. There is no daily or monthly limit."},
            {Q: "Will the file name be changed?",
             A: "No. The original file name is preserved. Downloaded files have the same name as the original (with the extension updated if you convert the format)."},
        }
    }
    return []ImgFAQ{
        {Q: "图片会上传到服务器吗？",
         A: "不会。压缩全程在您的浏览器内完成，使用 Canvas API 和 WebAssembly 技术，图片文件不会发送到任何服务器。"},
        {Q: "支持哪些图片格式？",
         A: "支持 JPG/JPEG、PNG 和 WebP。GIF 动图暂不支持（逐帧压缩会严重影响质量）。"},
        {Q: "压缩效果大概有多少？",
         A: "JPEG 通常可压缩 40–80%，PNG 可压缩 50–90%，具体效果因图片内容而异。您可以调整质量滑块在文件大小与画质之间取得平衡。"},
        {Q: "有文件数量或大小限制吗？",
         A: "每张图片最大 10MB，每次最多同时处理 20 张，无每日/每月次数限制。"},
        {Q: "文件名会被修改吗？",
         A: "不会。下载的文件保留原始文件名（若转换了格式，扩展名会相应更新）。"},
    }
}
```

---

## 3. SEO `<head>` 模板

```html
<!-- templates/img/compress.html — <head> 部分 -->

<title>{{ .Title }}</title>
<meta name="description" content="{{ .Desc }}">
<meta name="keywords"    content="图片压缩,在线压缩图片,PNG压缩,JPG压缩,WebP压缩,免费压缩图片,不上传服务器">

<meta property="og:title"       content="{{ .Title }}">
<meta property="og:description" content="{{ .Desc }}">
<meta property="og:type"        content="website">
<meta property="og:url"         content="https://devtoolbox.dev/img/compress">
<meta property="og:image"       content="https://devtoolbox.dev/static/og/img-compress.png">

<link rel="canonical" href="https://devtoolbox.dev/img/compress">
<link rel="alternate" hreflang="zh" href="https://devtoolbox.dev/img/compress?lang=zh">
<link rel="alternate" hreflang="en" href="https://devtoolbox.dev/img/compress?lang=en">

<!-- JSON-LD：SoftwareApplication -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "{{ .Title }}",
  "applicationCategory": "MultimediaApplication",
  "operatingSystem": "Web Browser",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "description": "{{ .Desc }}",
  "url": "https://devtoolbox.dev/img/compress",
  "featureList": [
    "Compress JPG images",
    "Compress PNG images",
    "Compress WebP images",
    "Batch compression up to 20 images",
    "No upload required - browser-side processing",
    "Quality adjustment slider",
    "Format conversion to WebP/JPG/PNG",
    "Download all as ZIP"
  ]
}
</script>

<!-- FAQ JSON-LD -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {{- range $i, $faq := .FAQs }}
    {{- if $i }},{{ end }}
    {
      "@type": "Question",
      "name": {{ $faq.Q | jsonEscape }},
      "acceptedAnswer": { "@type": "Answer", "text": {{ $faq.A | jsonEscape }} }
    }
    {{- end }}
  ]
}
</script>
```

---

## 4. 广告位插槽

```html
<!-- 工具页顶部横幅 728×90 -->
{{- template "partials/ad_slot.html" dict "SlotID" "img-top" "Size" "728x90" "Mobile" "320x50" }}

<!-- 结果列表右侧 300×250（仅桌面）-->
{{- template "partials/ad_slot.html" dict "SlotID" "img-sidebar" "Size" "300x250" "MobileHide" true }}

<!-- 全部处理完成后（高曝光）300×250 -->
{{- template "partials/ad_slot.html" dict "SlotID" "img-done" "Size" "300x250" }}

<!-- 页面底部 728×90 -->
{{- template "partials/ad_slot.html" dict "SlotID" "img-bottom" "Size" "728x90" "Mobile" "320x50" }}
```

---

## 5. 全量 i18n Key

### locales/zh.json（img.compress 部分）

```json
{
  "img.compress.name":  "图片压缩",
  "img.compress.title": "在线图片压缩工具",
  "img.compress.desc":  "JPG/PNG/WebP 批量压缩，文件不上传服务器",

  "img.compress.seo.title": "图片压缩 — 在线免费压缩 JPG/PNG/WebP | DevToolBox",
  "img.compress.seo.desc":  "免费在线压缩图片，支持 JPG、PNG、WebP 批量处理，最高压缩 90%，文件不上传服务器，完全在浏览器内完成。",

  "img.compress.hero.title":    "免费在线图片压缩",
  "img.compress.hero.subtitle": "JPG · PNG · WebP 批量压缩，最高减小 90%，图片不离开浏览器",
  "img.compress.hero.badge1":   "文件不上传",
  "img.compress.hero.badge2":   "批量处理",
  "img.compress.hero.badge3":   "完全免费",

  "img.compress.upload.title":      "拖拽图片到此处",
  "img.compress.upload.or":         "或",
  "img.compress.upload.btn":        "选择图片",
  "img.compress.upload.hint":       "支持 JPG / PNG / WebP，单张最大 10MB，最多 20 张",
  "img.compress.upload.drop_active":"松开鼠标开始压缩",
  "img.compress.upload.multi":      "可同时拖入多张图片",

  "img.compress.options.quality.label":   "压缩质量",
  "img.compress.options.quality.hint":    "数值越低文件越小，数值越高画质越好",
  "img.compress.options.format.label":    "输出格式",
  "img.compress.options.format.original": "保持原格式",
  "img.compress.options.format.jpg":      "转为 JPG",
  "img.compress.options.format.png":      "转为 PNG",
  "img.compress.options.format.webp":     "转为 WebP（更小）",
  "img.compress.options.maxwidth.label":  "最大宽度（可选）",
  "img.compress.options.maxwidth.hint":   "留空则不缩放尺寸",

  "img.compress.status.waiting":    "等待处理",
  "img.compress.status.compressing":"压缩中...",
  "img.compress.status.done":       "压缩完成",
  "img.compress.status.error":      "压缩失败",

  "img.compress.result.before":     "原始大小",
  "img.compress.result.after":      "压缩后",
  "img.compress.result.saved":      "节省",
  "img.compress.result.ratio":      "压缩率",
  "img.compress.result.download":   "下载",
  "img.compress.result.preview":    "对比预览",

  "img.compress.download.all":      "⬇ 打包下载全部",
  "img.compress.download.all_hint": "将所有压缩图片打包为 ZIP 下载",
  "img.compress.download.clear":    "清空全部",

  "img.compress.error.too_large":   "文件过大，单张最大 10MB",
  "img.compress.error.too_many":    "最多同时处理 20 张图片",
  "img.compress.error.unsupported": "不支持的格式，请上传 JPG/PNG/WebP",
  "img.compress.error.compress":    "压缩失败，图片可能已损坏",
  "img.compress.error.gif":         "暂不支持 GIF，请转换为 PNG 后压缩",

  "img.compress.feature.privacy.title": "文件不上传",
  "img.compress.feature.privacy.desc":  "压缩完全在浏览器内完成，图片不会发送到任何服务器",
  "img.compress.feature.fast.title":    "极速批量处理",
  "img.compress.feature.fast.desc":     "多图并行处理，20 张图片数秒内完成",
  "img.compress.feature.free.title":    "无限免费使用",
  "img.compress.feature.free.desc":     "无数量限制，无需注册，无隐藏费用",

  "img.compress.faq.title": "常见问题"
}
```

### locales/en.json（img.compress 部分）

```json
{
  "img.compress.name":  "Image Compressor",
  "img.compress.title": "Online Image Compressor",
  "img.compress.desc":  "Compress JPG/PNG/WebP in bulk. Files never leave your browser.",

  "img.compress.hero.title":    "Free Online Image Compressor",
  "img.compress.hero.subtitle": "Compress JPG · PNG · WebP in batch. Up to 90% smaller. Files stay in your browser.",
  "img.compress.hero.badge1":   "No Upload",
  "img.compress.hero.badge2":   "Batch Processing",
  "img.compress.hero.badge3":   "100% Free",

  "img.compress.upload.title":      "Drop images here",
  "img.compress.upload.or":         "or",
  "img.compress.upload.btn":        "Choose Images",
  "img.compress.upload.hint":       "JPG / PNG / WebP · Max 10MB each · Up to 20 files",
  "img.compress.upload.drop_active":"Release to compress",
  "img.compress.upload.multi":      "You can drop multiple images at once",

  "img.compress.options.quality.label":   "Quality",
  "img.compress.options.quality.hint":    "Lower = smaller file, Higher = better quality",
  "img.compress.options.format.label":    "Output Format",
  "img.compress.options.format.original": "Keep original format",
  "img.compress.options.format.jpg":      "Convert to JPG",
  "img.compress.options.format.png":      "Convert to PNG",
  "img.compress.options.format.webp":     "Convert to WebP (smallest)",
  "img.compress.options.maxwidth.label":  "Max Width (optional)",
  "img.compress.options.maxwidth.hint":   "Leave empty to keep original size",

  "img.compress.status.waiting":    "Waiting",
  "img.compress.status.compressing":"Compressing...",
  "img.compress.status.done":       "Done",
  "img.compress.status.error":      "Failed",

  "img.compress.result.before":   "Original",
  "img.compress.result.after":    "Compressed",
  "img.compress.result.saved":    "Saved",
  "img.compress.result.ratio":    "Ratio",
  "img.compress.result.download": "Download",
  "img.compress.result.preview":  "Compare",

  "img.compress.download.all":      "⬇ Download All (ZIP)",
  "img.compress.download.all_hint": "Download all compressed images as a ZIP file",
  "img.compress.download.clear":    "Clear All",

  "img.compress.error.too_large":   "File too large. Max 10MB per image.",
  "img.compress.error.too_many":    "Maximum 20 images at once.",
  "img.compress.error.unsupported": "Unsupported format. Please use JPG, PNG or WebP.",
  "img.compress.error.compress":    "Compression failed. The image may be corrupted.",
  "img.compress.error.gif":         "GIF not supported. Convert to PNG first.",

  "img.compress.feature.privacy.title": "Privacy First",
  "img.compress.feature.privacy.desc":  "All compression happens in your browser. Images are never sent to a server.",
  "img.compress.feature.fast.title":    "Blazing Fast",
  "img.compress.feature.fast.desc":     "Parallel processing. 20 images done in seconds.",
  "img.compress.feature.free.title":    "Unlimited & Free",
  "img.compress.feature.free.desc":     "No limits. No signup. No hidden fees.",

  "img.compress.faq.title": "FAQ"
}
```

---

## 6. sitemap.xml 新增条目

```xml
<url>
  <loc>https://devtoolbox.dev/img/compress</loc>
  <lastmod>2026-03-01</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>
</url>
<url>
  <loc>https://devtoolbox.dev/img/compress?lang=zh</loc>
  <priority>0.85</priority>
</url>
<url>
  <loc>https://devtoolbox.dev/img/compress?lang=en</loc>
  <priority>0.85</priority>
</url>
```

---

## 7. 验收标准

- [ ] `/img/compress` 返回 200，页面 `<title>` 含关键词
- [ ] canonical + hreflang 正确输出
- [ ] JSON-LD SoftwareApplication + FAQPage 正确
- [ ] sitemap.xml 包含 3 条 img/compress 条目
- [ ] 中英文切换：所有文案正确替换，无遗漏
- [ ] 广告位在 `ads.enabled=false` 时显示占位灰块
