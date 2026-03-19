<!-- img-toolbox-I-01_路由_SEO_i18n_sitemap_ads_ga.md -->

# 图片处理工具箱 · 路由 / SEO / i18n / Sitemap / 广告 / GA

---

## 1. Go 路由注册

```go
// router/img_toolbox.go

func RegisterImgToolboxRoutes(r *gin.Engine, tpl *template.Template) {
    imgGroup := r.Group("/img")
    {
        imgGroup.GET("/crop",           handlers.ImgCropHandler(tpl))
        imgGroup.GET("/convert-to-jpg", handlers.ImgConvertToJpgHandler(tpl))
        imgGroup.GET("/jpg-to-image",   handlers.ImgJpgToImageHandler(tpl))
        imgGroup.GET("/photo-editor",   handlers.ImgPhotoEditorHandler(tpl))
        imgGroup.GET("/remove-bg",      handlers.ImgRemoveBgHandler(tpl))
        imgGroup.GET("/watermark",      handlers.ImgWatermarkHandler(tpl))
        imgGroup.GET("/rotate",         handlers.ImgRotateHandler(tpl))
    }
}
```

---

## 2. 页面 Handler（以 crop 为例，其余同构）

```go
// handlers/img_crop.go

func ImgCropHandler(tpl *template.Template) gin.HandlerFunc {
    return func(c *gin.Context) {
        lang := c.DefaultQuery("lang", "zh")
        adsEnabled := os.Getenv("ADS_ENABLED") == "true"

        seo := map[string]string{
            "title":       i18n.T(lang, "seo.crop.title"),
            "description": i18n.T(lang, "seo.crop.description"),
            "keywords":    i18n.T(lang, "seo.crop.keywords"),
            "canonical":   "https://toolboxnova.com/img/crop",
            "hreflangZh":  "https://toolboxnova.com/img/crop?lang=zh",
            "hreflangEn":  "https://toolboxnova.com/img/crop?lang=en",
        }

        faqs := buildFAQs(lang, "crop") // 返回 []FAQItem

        c.HTML(http.StatusOK, "img/crop.html", gin.H{
            "Lang":       lang,
            "SEO":        seo,
            "FAQs":       faqs,
            "AdsEnabled": adsEnabled,
            "I18n":       i18n.Namespace(lang, "crop"),
            "Tool":       "img-toolbox-crop",
        })
    }
}

// FAQ 数据结构
type FAQItem struct {
    Question string
    Answer   string
}

func buildFAQs(lang, tool string) []FAQItem {
    // 中文 FAQ（crop）
    zhFAQs := map[string][]FAQItem{
        "crop": {
            {Q: "支持哪些图片格式？", A: "支持 JPG、PNG、WEBP、GIF、BMP、SVG 等主流格式，上传后自动识别。"},
            {Q: "裁剪后的图片质量会下降吗？", A: "不会。裁剪操作通过 Canvas 无损完成，输出画质与原图一致。"},
            {Q: "我的图片会上传到服务器吗？", A: "不会。所有处理均在您的浏览器本地完成，图片文件不会离开您的设备。"},
            {Q: "可以批量裁剪多张图片吗？", A: "支持！您可以一次上传多张图片，系统会按照相同的裁剪参数批量处理。"},
            {Q: "如何精确裁剪到指定尺寸？", A: "在选项面板中切换到「自定义尺寸」模式，输入目标宽高（像素），即可精确裁剪。"},
        },
    }
    // 英文 FAQ（crop）
    enFAQs := map[string][]FAQItem{
        "crop": {
            {Q: "What image formats are supported?", A: "JPG, PNG, WEBP, GIF, BMP and SVG are all supported and auto-detected on upload."},
            {Q: "Will cropping reduce image quality?", A: "No. Cropping is performed losslessly via Canvas API and output quality matches the original."},
            {Q: "Are my images uploaded to your servers?", A: "Never. All processing happens locally in your browser — your files never leave your device."},
            {Q: "Can I crop multiple images at once?", A: "Yes! Upload multiple files and the same crop parameters will be applied to all of them in batch."},
            {Q: "How do I crop to an exact pixel size?", A: "Switch to 'Custom Size' mode in the options panel, enter your target width and height in pixels."},
        },
    }
    // ... 其他工具 FAQ 同理
}
```

---

## 3. SEO `<head>` 模板（通用，各工具页面 extends）

```html
<!-- templates/partials/seo_head.html -->
{{ define "seoHead" }}
<title>{{ .SEO.title }}</title>
<meta name="description" content="{{ .SEO.description }}">
<meta name="keywords"    content="{{ .SEO.keywords }}">
<meta name="viewport"    content="width=device-width, initial-scale=1">
<meta charset="UTF-8">

<!-- Open Graph -->
<meta property="og:title"       content="{{ .SEO.title }}">
<meta property="og:description" content="{{ .SEO.description }}">
<meta property="og:url"         content="{{ .SEO.canonical }}">
<meta property="og:type"        content="website">
<meta property="og:image"       content="https://toolboxnova.com/static/og/img-toolbox.png">

<!-- Twitter Card -->
<meta name="twitter:card"        content="summary_large_image">
<meta name="twitter:title"       content="{{ .SEO.title }}">
<meta name="twitter:description" content="{{ .SEO.description }}">

<!-- Canonical & hreflang -->
<link rel="canonical"      href="{{ .SEO.canonical }}">
<link rel="alternate" hreflang="zh" href="{{ .SEO.hreflangZh }}">
<link rel="alternate" hreflang="en" href="{{ .SEO.hreflangEn }}">
<link rel="alternate" hreflang="x-default" href="{{ .SEO.canonical }}">

<!-- JSON-LD: SoftwareApplication -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "{{ .SEO.title }}",
  "description": "{{ .SEO.description }}",
  "url": "{{ .SEO.canonical }}",
  "applicationCategory": "MultimediaApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "publisher": {
    "@type": "Organization",
    "name": "ToolboxNova",
    "url": "https://toolboxnova.com"
  }
}
</script>

<!-- JSON-LD: FAQPage -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {{ range $i, $faq := .FAQs }}
    {{ if $i }},{{ end }}
    {
      "@type": "Question",
      "name": "{{ $faq.Question }}",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "{{ $faq.Answer }}"
      }
    }
    {{ end }}
  ]
}
</script>
{{ end }}
```

---

## 4. 广告接入 & GA 事件追踪

### 三段式 Block 结构说明

| Block 名 | 放置内容 |
|----------|----------|
| `{{ define "extraHead" }}` | AdSense SDK 条件加载、工具专属 CSS CDN（Cropper.js CSS 等） |
| `{{ define "content" }}` | 页面主体 HTML（上传区、选项、结果区、FAQ、广告位插入点） |
| `{{ define "extraScript" }}` | 工具专属 JS CDN、GA 事件追踪代码、工具初始化脚本 |

### 广告位模板

```html
<!-- templates/partials/ad_slot.html -->
{{ define "adSlot" }}
{{ if .AdsEnabled }}
  <ins class="adsbygoogle"
       style="display:block"
       data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
       data-ad-slot="{{ .SlotID }}"
       data-ad-format="{{ .Format }}"
       data-full-width-responsive="true"></ins>
  <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
{{ else }}
  <div class="ad-placeholder" style="
    background:#F3F4F6;border:1px dashed #D1D5DB;
    border-radius:8px;display:flex;align-items:center;
    justify-content:center;color:#9CA3AF;font-size:12px;">
    广告位（{{ .Format }}）
  </div>
{{ end }}
{{ end }}
```

```html
<!-- extraHead 中条件加载 AdSense SDK -->
{{ define "extraHead" }}
{{ if .AdsEnabled }}
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
  data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
{{ end }}
{{ end }}
```

```html
<!-- 顶部横幅 (728×90 / 移动 320×50) -->
{{ template "adSlot" dict "AdsEnabled" .AdsEnabled "SlotID" "img-toolbox-crop-top" "Format" "horizontal" }}

<!-- 侧边栏 300×250（仅桌面） -->
<div class="sidebar-ad d-none d-lg-block">
  {{ template "adSlot" dict "AdsEnabled" .AdsEnabled "SlotID" "img-toolbox-crop-sidebar" "Format" "rectangle" }}
</div>

<!-- 底部横幅 -->
{{ template "adSlot" dict "AdsEnabled" .AdsEnabled "SlotID" "img-toolbox-crop-bottom" "Format" "horizontal" }}
```

### GA 事件追踪

```html
{{ define "extraScript" }}
<script>
const TOOL = 'img-toolbox-crop'; // 与 SlotID 前缀一致

// 上传文件事件 —— 触发时机：addFiles() 成功添加文件后
function gaTrackUpload(fileCount, totalSize) {
  gtag('event', 'upload', {
    event_category: TOOL,
    event_label: 'file_upload',
    value: fileCount,
    custom_total_size_kb: Math.round(totalSize / 1024)
  });
}

// 处理完成事件 —— 触发时机：所有文件处理完毕，updateSummaryStats() 调用后
function gaTrackProcessDone(fileCount, savedBytes) {
  gtag('event', 'process_done', {
    event_category: TOOL,
    event_label: 'process_complete',
    value: fileCount
  });
}

// 单文件下载 —— 触发时机：downloadOne() 触发下载后
function gaTrackDownloadOne() {
  gtag('event', 'download_single', { event_category: TOOL });
}

// 批量下载 ZIP —— 触发时机：downloadAll() ZIP 生成完成后
function gaTrackDownloadAll(fileCount) {
  gtag('event', 'download_all', {
    event_category: TOOL,
    value: fileCount
  });
}

// 参数变更 —— 触发时机：选项面板控件 change 事件（防抖 500ms）
function gaTrackOptionChange(paramName, paramValue) {
  gtag('event', 'option_change', {
    event_category: TOOL,
    event_label: paramName,
    value: paramValue
  });
}

// 错误事件 —— 触发时机：processOne() catch 块，文件处理失败时
function gaTrackError(errorType, fileName) {
  gtag('event', 'error', {
    event_category: TOOL,
    event_label: errorType,
    custom_file_name: fileName
  });
}
</script>
{{ end }}
```

---

## 5. 全量 i18n Key

### i18n/en.json（图片工具箱部分）

```json
{
  "seo.crop.title": "Crop Image Online Free – ToolboxNova",
  "seo.crop.description": "Crop your images online for free. Select crop area freely or by fixed ratio. Fast, private, no upload required.",
  "seo.crop.keywords": "crop image, image cropper, online crop, free image crop, photo crop",
  "seo.to_jpg.title": "Convert Image to JPG Free – ToolboxNova",
  "seo.to_jpg.description": "Convert PNG, WEBP, GIF, BMP and SVG images to JPG online for free. Adjust quality with a slider. All in your browser.",
  "seo.to_jpg.keywords": "convert to jpg, png to jpg, webp to jpg, image converter, free jpg converter",
  "seo.jpg_to.title": "Convert JPG to PNG, WEBP & More – ToolboxNova",
  "seo.jpg_to.description": "Convert JPG images to PNG, WEBP, GIF, BMP and more formats instantly in your browser. Free and private.",
  "seo.jpg_to.keywords": "jpg to png, jpg to webp, jpg converter, image format converter, free",
  "seo.editor.title": "Online Photo Editor Free – ToolboxNova",
  "seo.editor.description": "Edit photos online for free. Adjust brightness, contrast, saturation, sharpness and blur. Real-time preview. No upload needed.",
  "seo.editor.keywords": "photo editor, online photo editor, edit image, brightness contrast, free photo editor",
  "seo.remove_bg.title": "Remove Image Background Free – ToolboxNova",
  "seo.remove_bg.description": "Remove the background from any image instantly using AI. 100% local processing, your images never leave your device.",
  "seo.remove_bg.keywords": "remove background, background remover, AI background removal, transparent background, free",
  "seo.watermark.title": "Add Watermark to Image Free – ToolboxNova",
  "seo.watermark.description": "Add text or image watermarks to your photos online. Choose position, opacity and size. Free and private.",
  "seo.watermark.keywords": "add watermark, image watermark, text watermark, photo watermark, free watermark tool",
  "seo.rotate.title": "Rotate & Flip Image Online Free – ToolboxNova",
  "seo.rotate.description": "Rotate images by any angle and flip horizontally or vertically. Batch process multiple images. Free online tool.",
  "seo.rotate.keywords": "rotate image, flip image, rotate photo online, image rotation, free rotate tool",

  "hero.crop.title": "Crop Image Online",
  "hero.crop.subtitle": "Select any area or use preset ratios. Fast, free, and processed entirely in your browser.",
  "hero.crop.badge1": "Free",
  "hero.crop.badge2": "No Upload",
  "hero.crop.badge3": "Batch Support",
  "hero.to_jpg.title": "Convert Image to JPG",
  "hero.to_jpg.subtitle": "Convert PNG, WEBP, GIF, SVG and more to JPG with adjustable quality. All local, all free.",
  "hero.jpg_to.title": "Convert JPG to Any Format",
  "hero.jpg_to.subtitle": "Export your JPG images as PNG, WEBP, GIF or BMP in seconds. No server, no waiting.",
  "hero.editor.title": "Online Photo Editor",
  "hero.editor.subtitle": "Adjust brightness, contrast, saturation and more with real-time preview. Simple and powerful.",
  "hero.remove_bg.title": "Remove Image Background",
  "hero.remove_bg.subtitle": "AI-powered background removal running entirely in your browser. Private, instant, free.",
  "hero.watermark.title": "Add Watermark to Image",
  "hero.watermark.subtitle": "Protect your photos with custom text or logo watermarks. Choose position, opacity and more.",
  "hero.rotate.title": "Rotate & Flip Image",
  "hero.rotate.subtitle": "Rotate by any angle or flip your images horizontally and vertically. Supports batch processing.",

  "upload.common.drag_hint": "Drag & drop images here, or",
  "upload.common.browse_btn": "Browse Files",
  "upload.common.support_hint": "Supports JPG, PNG, WEBP, GIF, BMP, SVG · Max 20MB per file · Up to 30 files",
  "upload.common.drop_active": "Release to add images",

  "options.crop.mode_label": "Crop Mode",
  "options.crop.mode_free": "Free",
  "options.crop.mode_ratio": "Fixed Ratio",
  "options.crop.mode_custom": "Custom Size (px)",
  "options.crop.ratio_1_1": "1:1 Square",
  "options.crop.ratio_4_3": "4:3 Standard",
  "options.crop.ratio_16_9": "16:9 Widescreen",
  "options.crop.width_label": "Width (px)",
  "options.crop.height_label": "Height (px)",
  "options.to_jpg.quality_label": "Output Quality",
  "options.jpg_to.format_label": "Target Format",
  "options.editor.brightness": "Brightness",
  "options.editor.contrast": "Contrast",
  "options.editor.saturation": "Saturation",
  "options.editor.sharpness": "Sharpness",
  "options.editor.blur": "Blur",
  "options.remove_bg.threshold": "Threshold",
  "options.watermark.type_text": "Text Watermark",
  "options.watermark.type_image": "Image Watermark",
  "options.watermark.text_label": "Watermark Text",
  "options.watermark.font_size": "Font Size",
  "options.watermark.opacity": "Opacity",
  "options.watermark.color": "Color",
  "options.watermark.position_label": "Position",
  "options.rotate.angle_label": "Rotation Angle (°)",
  "options.rotate.flip_h": "Flip Horizontal",
  "options.rotate.flip_v": "Flip Vertical",
  "options.rotate.rotate_90l": "Rotate 90° Left",
  "options.rotate.rotate_90r": "Rotate 90° Right",

  "status.common.waiting": "Waiting",
  "status.common.processing": "Processing...",
  "status.common.done": "Done",
  "status.common.error": "Failed",
  "status.remove_bg.loading_model": "Loading AI model (first time may take 10s)...",

  "result.common.header": "Processed Files",
  "result.common.saved": "saved",
  "result.common.summary": "{count} files processed · {saved} saved on average",
  "result.common.preview_btn": "Preview",
  "result.common.download_btn": "Download",
  "result.common.retry_btn": "Retry",
  "result.common.remove_btn": "Remove",

  "download.common.all_btn": "Download All (ZIP)",
  "download.common.clear_btn": "Clear All",
  "download.common.preparing": "Preparing ZIP...",

  "error.common.format_not_supported": "Format not supported",
  "error.common.file_too_large": "File exceeds 20MB limit",
  "error.common.too_many_files": "Maximum 30 files allowed",
  "error.common.process_failed": "Processing failed, please try again",
  "error.remove_bg.model_load_failed": "Failed to load AI model",

  "feature.common.privacy_title": "100% Private",
  "feature.common.privacy_desc": "All processing happens locally in your browser. No files are ever sent to our servers.",
  "feature.common.speed_title": "Lightning Fast",
  "feature.common.speed_desc": "Powered by Canvas API and WebAssembly for instant processing, even for batch operations.",
  "feature.common.free_title": "Always Free",
  "feature.common.free_desc": "No subscriptions, no sign-ups, no hidden fees. Unlimited use, completely free.",

  "faq.crop.q1": "What image formats can I crop?",
  "faq.crop.a1": "JPG, PNG, WEBP, GIF, BMP and SVG are all supported and auto-detected on upload.",
  "faq.crop.q2": "Will cropping reduce image quality?",
  "faq.crop.a2": "No. Cropping is performed losslessly via Canvas API and output quality matches the original.",
  "faq.crop.q3": "Are my images uploaded to your servers?",
  "faq.crop.a3": "Never. All processing happens locally in your browser — your files never leave your device.",
  "faq.crop.q4": "Can I crop multiple images at once?",
  "faq.crop.a4": "Yes! Upload multiple files and the same crop parameters will be applied to all of them in batch.",
  "faq.crop.q5": "How do I crop to an exact pixel size?",
  "faq.crop.a5": "Switch to 'Custom Size' mode in the options panel, enter your target width and height in pixels.",

  "faq.to_jpg.q1": "Which formats can I convert to JPG?",
  "faq.to_jpg.a1": "PNG, WEBP, GIF, BMP, SVG and TIFF can all be converted to JPG.",
  "faq.to_jpg.q2": "What does the quality slider do?",
  "faq.to_jpg.a2": "It controls JPG compression level. Higher quality means larger file size; lower quality means smaller files with some loss.",
  "faq.to_jpg.q3": "Will transparent backgrounds be preserved?",
  "faq.to_jpg.a3": "JPG does not support transparency. Transparent areas will be filled with a white background by default.",
  "faq.to_jpg.q4": "Is there a file size limit?",
  "faq.to_jpg.a4": "Each file must be under 20MB, and you can process up to 30 files at once.",
  "faq.to_jpg.q5": "Can I convert animated GIFs to JPG?",
  "faq.to_jpg.a5": "Yes, but only the first frame of the GIF will be converted to a static JPG.",

  "faq.jpg_to.q1": "Which formats can I convert JPG to?",
  "faq.jpg_to.a1": "You can convert JPG to PNG, WEBP, GIF, BMP and more formats.",
  "faq.jpg_to.q2": "Which format should I choose for transparency?",
  "faq.jpg_to.a2": "PNG and WEBP both support transparency. Choose PNG for maximum compatibility.",
  "faq.jpg_to.q3": "What is WEBP and why use it?",
  "faq.jpg_to.a3": "WEBP is a modern format by Google that provides better compression than JPG while maintaining quality.",
  "faq.jpg_to.q4": "Will converting change the image quality?",
  "faq.jpg_to.a4": "Converting to PNG is lossless. Converting to WEBP may have minimal quality loss at default settings.",
  "faq.jpg_to.q5": "Can I batch convert multiple JPG files?",
  "faq.jpg_to.a5": "Yes, upload up to 30 JPG files and convert them all to your chosen format at once.",

  "faq.editor.q1": "What adjustments can I make to my photos?",
  "faq.editor.a1": "You can adjust brightness, contrast, saturation, sharpness and blur using real-time sliders.",
  "faq.editor.q2": "Can I preview changes before downloading?",
  "faq.editor.a2": "Yes, the canvas preview updates in real time as you move any slider (with a 500ms debounce).",
  "faq.editor.q3": "Can I reset all adjustments?",
  "faq.editor.a3": "Yes, click the 'Reset' button to restore all sliders to their default neutral values.",
  "faq.editor.q4": "Does editing affect the original file?",
  "faq.editor.a4": "No, your original file is never modified. You download only the edited version.",
  "faq.editor.q5": "Can I edit multiple photos at once?",
  "faq.editor.a5": "Yes, the same adjustment settings are applied to all uploaded photos in batch.",

  "faq.remove_bg.q1": "How does background removal work?",
  "faq.remove_bg.a1": "We use an AI model powered by WebAssembly that runs entirely in your browser — no data is sent to any server.",
  "faq.remove_bg.q2": "What types of images work best?",
  "faq.remove_bg.a2": "Images with clear subject-background contrast work best. Portraits, products and logos give great results.",
  "faq.remove_bg.q3": "How long does processing take?",
  "faq.remove_bg.a3": "The first run downloads the AI model (about 10 seconds). Subsequent images process in 2–5 seconds each.",
  "faq.remove_bg.q4": "What format is the output?",
  "faq.remove_bg.a4": "The output is a PNG with a transparent background, ready to use on any background.",
  "faq.remove_bg.q5": "Is there a limit on image size?",
  "faq.remove_bg.a5": "Each image should be under 20MB for best performance. Larger images may slow down the AI model.",

  "faq.watermark.q1": "Can I add both text and image watermarks?",
  "faq.watermark.a1": "Yes, you can choose between text watermark (custom font and color) or image watermark (upload your logo).",
  "faq.watermark.q2": "How do I choose the watermark position?",
  "faq.watermark.a2": "Use the 3×3 position grid to click where you want the watermark: top-left, center, bottom-right, etc.",
  "faq.watermark.q3": "Can I adjust watermark transparency?",
  "faq.watermark.a3": "Yes, the opacity slider lets you set transparency from 10% to 100%.",
  "faq.watermark.q4": "Will the watermark affect image quality?",
  "faq.watermark.a4": "No, watermarks are rendered on a Canvas copy of your image. The output quality is identical to the original.",
  "faq.watermark.q5": "Can I batch watermark multiple images?",
  "faq.watermark.a5": "Yes, upload multiple images and the same watermark settings will be applied to all of them.",

  "faq.rotate.q1": "Can I rotate by any angle, not just 90°?",
  "faq.rotate.a1": "Yes, type any angle (e.g. 45°) in the angle input box for precise rotation.",
  "faq.rotate.q2": "What happens to the canvas size after rotation?",
  "faq.rotate.a2": "For angles other than 90°/180°, the canvas expands to fit the rotated image; edges are filled with white.",
  "faq.rotate.q3": "Can I flip images horizontally and vertically?",
  "faq.rotate.a3": "Yes, the Flip Horizontal and Flip Vertical buttons are independent from rotation and can be combined.",
  "faq.rotate.q4": "Can I batch rotate multiple images?",
  "faq.rotate.a4": "Yes, all rotation and flip settings are applied uniformly to all uploaded images.",
  "faq.rotate.q5": "What is the output format after rotation?",
  "faq.rotate.a5": "The output keeps the same format as the input (JPG stays JPG, PNG stays PNG, etc.)."
}
```

### i18n/zh.json（图片工具箱部分）

```json
{
  "seo.crop.title": "在线免费裁剪图片 – ToolboxNova",
  "seo.crop.description": "免费在线裁剪图片，支持自由选区和固定比例裁剪，快速、安全，无需上传服务器。",
  "seo.crop.keywords": "在线裁剪图片, 图片裁剪, 免费裁剪, 照片裁剪, 图片剪切",
  "seo.to_jpg.title": "图片转JPG格式在线转换 – ToolboxNova",
  "seo.to_jpg.description": "免费将PNG、WEBP、GIF、BMP、SVG转换为JPG格式，支持质量调节，全程浏览器本地处理。",
  "seo.to_jpg.keywords": "图片转JPG, PNG转JPG, WEBP转JPG, 格式转换, 在线转JPG",
  "seo.jpg_to.title": "JPG转PNG/WEBP等格式 – ToolboxNova",
  "seo.jpg_to.description": "将JPG图片快速转换为PNG、WEBP、GIF、BMP等格式，免费在线使用，无需上传。",
  "seo.jpg_to.keywords": "JPG转PNG, JPG转WEBP, 图片格式转换, 在线格式转换, 免费",
  "seo.editor.title": "在线图片编辑器免费 – ToolboxNova",
  "seo.editor.description": "免费在线编辑图片，调整亮度、对比度、饱和度、锐化和模糊，实时预览，无需上传。",
  "seo.editor.keywords": "在线图片编辑, 图片调色, 亮度对比度, 免费图片编辑器, 照片编辑",
  "seo.remove_bg.title": "在线免费AI抠图去除背景 – ToolboxNova",
  "seo.remove_bg.description": "使用AI技术一键去除图片背景，完全在浏览器本地运行，图片不离开您的设备。",
  "seo.remove_bg.keywords": "AI抠图, 去除背景, 一键抠图, 透明背景, 免费抠图",
  "seo.watermark.title": "在线免费添加水印 – ToolboxNova",
  "seo.watermark.description": "在线为图片添加文字或图片水印，自定义位置、透明度和大小，免费批量处理。",
  "seo.watermark.keywords": "添加水印, 图片水印, 文字水印, 批量水印, 免费水印",
  "seo.rotate.title": "在线旋转翻转图片免费 – ToolboxNova",
  "seo.rotate.description": "在线旋转图片任意角度，支持水平翻转和垂直翻转，批量处理，免费使用。",
  "seo.rotate.keywords": "旋转图片, 翻转图片, 在线旋转, 图片旋转, 免费旋转",

  "hero.crop.title": "在线裁剪图片",
  "hero.crop.subtitle": "自由选区或按固定比例裁剪，快速、免费，全程浏览器本地处理。",
  "hero.crop.badge1": "完全免费",
  "hero.crop.badge2": "无需上传",
  "hero.crop.badge3": "支持批量",
  "hero.to_jpg.title": "图片转JPG格式",
  "hero.to_jpg.subtitle": "将PNG、WEBP、GIF、SVG等格式一键转换为JPG，质量可调，全部本地处理。",
  "hero.jpg_to.title": "JPG转其他格式",
  "hero.jpg_to.subtitle": "将JPG快速导出为PNG、WEBP、GIF或BMP，无需服务器，即刻完成。",
  "hero.editor.title": "在线图片编辑器",
  "hero.editor.subtitle": "实时调整亮度、对比度、饱和度等参数，所见即所得，简单强大。",
  "hero.remove_bg.title": "AI一键去除图片背景",
  "hero.remove_bg.subtitle": "AI驱动的抠图完全在浏览器运行，私密、即时、完全免费。",
  "hero.watermark.title": "图片添加水印",
  "hero.watermark.subtitle": "为照片添加自定义文字或Logo水印，选择位置、透明度等，保护您的版权。",
  "hero.rotate.title": "旋转与翻转图片",
  "hero.rotate.subtitle": "支持任意角度旋转和水平/垂直翻转，批量处理多张图片。",

  "upload.common.drag_hint": "拖拽图片到此处，或",
  "upload.common.browse_btn": "选择文件",
  "upload.common.support_hint": "支持 JPG、PNG、WEBP、GIF、BMP、SVG · 每个文件最大 20MB · 最多 30 个文件",
  "upload.common.drop_active": "松开鼠标以添加图片",

  "options.crop.mode_label": "裁剪模式",
  "options.crop.mode_free": "自由裁剪",
  "options.crop.mode_ratio": "固定比例",
  "options.crop.mode_custom": "自定义尺寸（像素）",
  "options.crop.ratio_1_1": "1:1 正方形",
  "options.crop.ratio_4_3": "4:3 标准",
  "options.crop.ratio_16_9": "16:9 宽屏",
  "options.crop.width_label": "宽度（px）",
  "options.crop.height_label": "高度（px）",
  "options.to_jpg.quality_label": "输出质量",
  "options.jpg_to.format_label": "目标格式",
  "options.editor.brightness": "亮度",
  "options.editor.contrast": "对比度",
  "options.editor.saturation": "饱和度",
  "options.editor.sharpness": "锐化",
  "options.editor.blur": "模糊",
  "options.remove_bg.threshold": "阈值",
  "options.watermark.type_text": "文字水印",
  "options.watermark.type_image": "图片水印",
  "options.watermark.text_label": "水印文字",
  "options.watermark.font_size": "字体大小",
  "options.watermark.opacity": "不透明度",
  "options.watermark.color": "颜色",
  "options.watermark.position_label": "位置",
  "options.rotate.angle_label": "旋转角度（°）",
  "options.rotate.flip_h": "水平翻转",
  "options.rotate.flip_v": "垂直翻转",
  "options.rotate.rotate_90l": "向左旋转90°",
  "options.rotate.rotate_90r": "向右旋转90°",

  "status.common.waiting": "等待处理",
  "status.common.processing": "处理中...",
  "status.common.done": "已完成",
  "status.common.error": "处理失败",
  "status.remove_bg.loading_model": "正在加载AI模型（首次可能需要10秒）...",

  "result.common.header": "处理结果",
  "result.common.saved": "已节省",
  "result.common.summary": "共处理 {count} 个文件 · 平均节省 {saved}",
  "result.common.preview_btn": "预览对比",
  "result.common.download_btn": "下载",
  "result.common.retry_btn": "重试",
  "result.common.remove_btn": "移除",

  "download.common.all_btn": "全部下载（ZIP）",
  "download.common.clear_btn": "清空全部",
  "download.common.preparing": "正在打包 ZIP...",

  "error.common.format_not_supported": "不支持该文件格式",
  "error.common.file_too_large": "文件超过 20MB 限制",
  "error.common.too_many_files": "最多支持 30 个文件",
  "error.common.process_failed": "处理失败，请重试",
  "error.remove_bg.model_load_failed": "AI模型加载失败",

  "feature.common.privacy_title": "100% 本地处理",
  "feature.common.privacy_desc": "所有图片处理均在您的浏览器中完成，文件永远不会发送到我们的服务器。",
  "feature.common.speed_title": "极速处理",
  "feature.common.speed_desc": "基于 Canvas API 和 WebAssembly，即使批量处理也能瞬间完成。",
  "feature.common.free_title": "永久免费",
  "feature.common.free_desc": "无需订阅、无需注册、无隐藏收费，无限次使用，完全免费。",

  "faq.crop.q1": "支持哪些图片格式？",
  "faq.crop.a1": "支持 JPG、PNG、WEBP、GIF、BMP、SVG 等主流格式，上传后自动识别。",
  "faq.crop.q2": "裁剪后图片质量会下降吗？",
  "faq.crop.a2": "不会。裁剪操作通过 Canvas 无损完成，输出画质与原图一致。",
  "faq.crop.q3": "我的图片会上传到服务器吗？",
  "faq.crop.a3": "不会。所有处理均在您的浏览器本地完成，图片文件不会离开您的设备。",
  "faq.crop.q4": "可以批量裁剪多张图片吗？",
  "faq.crop.a4": "支持！您可以一次上传多张图片，系统会按照相同的裁剪参数批量处理。",
  "faq.crop.q5": "如何精确裁剪到指定尺寸？",
  "faq.crop.a5": "在选项面板中切换到「自定义尺寸」模式，输入目标宽高（像素）即可精确裁剪。",

  "faq.to_jpg.q1": "支持哪些格式转换为JPG？",
  "faq.to_jpg.a1": "支持 PNG、WEBP、GIF、BMP、SVG 和 TIFF 转换为 JPG。",
  "faq.to_jpg.q2": "质量滑块有什么作用？",
  "faq.to_jpg.a2": "控制 JPG 压缩级别。质量越高文件越大；质量越低文件越小但会有损失。",
  "faq.to_jpg.q3": "图片透明背景会保留吗？",
  "faq.to_jpg.a3": "JPG 不支持透明度。透明区域默认填充为白色背景。",
  "faq.to_jpg.q4": "有文件大小限制吗？",
  "faq.to_jpg.a4": "每个文件不超过 20MB，一次最多处理 30 个文件。",
  "faq.to_jpg.q5": "可以转换动态GIF吗？",
  "faq.to_jpg.a5": "可以，但只会转换 GIF 的第一帧为静态 JPG。",

  "faq.jpg_to.q1": "JPG可以转换为哪些格式？",
  "faq.jpg_to.a1": "可以将 JPG 转换为 PNG、WEBP、GIF、BMP 等格式。",
  "faq.jpg_to.q2": "哪种格式支持透明背景？",
  "faq.jpg_to.a2": "PNG 和 WEBP 均支持透明背景，PNG 的兼容性更广泛。",
  "faq.jpg_to.q3": "WEBP是什么格式，有什么优势？",
  "faq.jpg_to.a3": "WEBP 是 Google 开发的现代图片格式，在相同质量下比 JPG 体积更小。",
  "faq.jpg_to.q4": "转换会影响图片质量吗？",
  "faq.jpg_to.a4": "转换为 PNG 是无损的。转换为 WEBP 在默认设置下质量损失极小。",
  "faq.jpg_to.q5": "可以批量转换多个JPG文件吗？",
  "faq.jpg_to.a5": "支持！一次上传最多 30 个 JPG 文件，一键转换为您选择的格式。",

  "faq.editor.q1": "可以调整哪些图片参数？",
  "faq.editor.a1": "支持调整亮度、对比度、饱和度、锐化和模糊，拖动滑块实时预览。",
  "faq.editor.q2": "可以在下载前预览效果吗？",
  "faq.editor.a2": "可以，Canvas 预览区会随着滑块实时更新（500ms防抖）。",
  "faq.editor.q3": "如何重置所有调整？",
  "faq.editor.a3": "点击「重置」按钮，所有滑块恢复到默认中性值。",
  "faq.editor.q4": "编辑会修改原始文件吗？",
  "faq.editor.a4": "不会。原始文件从不被修改，您下载的只是编辑后的副本。",
  "faq.editor.q5": "可以批量编辑多张照片吗？",
  "faq.editor.a5": "支持！相同的调整参数会应用到所有上传的图片上。",

  "faq.remove_bg.q1": "AI抠图是如何工作的？",
  "faq.remove_bg.a1": "我们使用基于 WebAssembly 的 AI 模型，完全在您的浏览器中运行，不会向任何服务器发送数据。",
  "faq.remove_bg.q2": "什么类型的图片效果最好？",
  "faq.remove_bg.a2": "主体与背景对比清晰的图片效果最佳，如人像、产品图和 Logo。",
  "faq.remove_bg.q3": "处理需要多长时间？",
  "faq.remove_bg.a3": "首次运行需下载 AI 模型（约10秒）。后续每张图片处理约需 2-5 秒。",
  "faq.remove_bg.q4": "输出格式是什么？",
  "faq.remove_bg.a4": "输出为带透明背景的 PNG 文件，可直接用于任何背景。",
  "faq.remove_bg.q5": "图片大小有限制吗？",
  "faq.remove_bg.a5": "每张图片建议不超过 20MB 以获得最佳性能，过大的图片可能会降低 AI 处理速度。",

  "faq.watermark.q1": "可以同时添加文字和图片水印吗？",
  "faq.watermark.a1": "可以选择文字水印（自定义字体和颜色）或图片水印（上传您的Logo），两种模式独立使用。",
  "faq.watermark.q2": "如何选择水印位置？",
  "faq.watermark.a2": "使用 3×3 位置网格，点击您想要的位置：左上、居中、右下等，非常直观。",
  "faq.watermark.q3": "可以调整水印透明度吗？",
  "faq.watermark.a3": "可以，透明度滑块支持 10% 到 100% 的调节。",
  "faq.watermark.q4": "添加水印会影响图片质量吗？",
  "faq.watermark.a4": "不会，水印渲染在图片副本的 Canvas 上，输出质量与原图一致。",
  "faq.watermark.q5": "可以批量添加水印吗？",
  "faq.watermark.a5": "支持！上传多张图片，相同的水印设置会应用到所有图片上。",

  "faq.rotate.q1": "只能旋转90度吗，还是可以旋转任意角度？",
  "faq.rotate.a1": "支持任意角度旋转，在角度输入框中输入任意数字（如45°）即可精确旋转。",
  "faq.rotate.q2": "旋转后图片尺寸会变化吗？",
  "faq.rotate.a2": "旋转90°/180°时尺寸不变。其他角度旋转时，画布会扩展以容纳旋转后的图片，边缘填充白色。",
  "faq.rotate.q3": "可以水平和垂直翻转图片吗？",
  "faq.rotate.a3": "可以，水平翻转和垂直翻转是独立操作，可与旋转组合使用。",
  "faq.rotate.q4": "可以批量旋转多张图片吗？",
  "faq.rotate.a4": "支持！所有旋转和翻转设置会统一应用到所有上传的图片上。",
  "faq.rotate.q5": "旋转后输出什么格式？",
  "faq.rotate.a5": "输出格式与输入保持一致（JPG保持JPG，PNG保持PNG）。"
}
```

---

## 6. Sitemap 新增条目

（详见 I-00 文档第七节，此处不重复）

---

## 7. Header 导航新增子项

```html
<!-- templates/partials/header.html 中「多媒体」分类下新增 -->
<!-- 在现有 <ul class="dropdown-menu"> 内追加以下 <li> 片段 -->

<li class="nav-subitem">
  <a href="/img/crop" class="nav-link">
    <span class="nav-icon">✂️</span>
    <span class="nav-label">{{ t "nav.img_crop" }}</span>
  </a>
</li>
<li class="nav-subitem">
  <a href="/img/convert-to-jpg" class="nav-link">
    <span class="nav-icon">🔄</span>
    <span class="nav-label">{{ t "nav.img_to_jpg" }}</span>
  </a>
</li>
<li class="nav-subitem">
  <a href="/img/jpg-to-image" class="nav-link">
    <span class="nav-icon">🖼️</span>
    <span class="nav-label">{{ t "nav.jpg_to_img" }}</span>
  </a>
</li>
<li class="nav-subitem">
  <a href="/img/photo-editor" class="nav-link">
    <span class="nav-icon">🎨</span>
    <span class="nav-label">{{ t "nav.photo_editor" }}</span>
  </a>
</li>
<li class="nav-subitem">
  <a href="/img/remove-bg" class="nav-link">
    <span class="nav-icon">🪄</span>
    <span class="nav-label">{{ t "nav.remove_bg" }}</span>
  </a>
</li>
<li class="nav-subitem">
  <a href="/img/watermark" class="nav-link">
    <span class="nav-icon">💧</span>
    <span class="nav-label">{{ t "nav.watermark" }}</span>
  </a>
</li>
<li class="nav-subitem">
  <a href="/img/rotate" class="nav-link">
    <span class="nav-icon">🔃</span>
    <span class="nav-label">{{ t "nav.rotate" }}</span>
  </a>
</li>
```

i18n key 补充：
```json
// en.json
"nav.img_crop": "Crop Image",
"nav.img_to_jpg": "Convert to JPG",
"nav.jpg_to_img": "JPG to Image",
"nav.photo_editor": "Photo Editor",
"nav.remove_bg": "Remove Background",
"nav.watermark": "Add Watermark",
"nav.rotate": "Rotate Image"

// zh.json
"nav.img_crop": "裁剪图片",
"nav.img_to_jpg": "转换为JPG",
"nav.jpg_to_img": "JPG转格式",
"nav.photo_editor": "图片编辑器",
"nav.remove_bg": "移除背景",
"nav.watermark": "添加水印",
"nav.rotate": "旋转图片"
```

---

## 8. 主页模块新增子项

```html
<!-- templates/index.html 中「多媒体」工具分类下新增工具卡片 -->

<!-- 裁剪图片 -->
<a href="/img/crop" class="tool-card tool-card--img">
  <div class="tool-card__icon">✂️</div>
  <div class="tool-card__info">
    <h3 class="tool-card__title">{{ t "nav.img_crop" }}</h3>
    <p class="tool-card__desc">{{ t "hero.crop.subtitle" }}</p>
  </div>
  <span class="tool-card__badge tool-card__badge--free">{{ t "hero.crop.badge1" }}</span>
</a>

<!-- 转换为 JPG -->
<a href="/img/convert-to-jpg" class="tool-card tool-card--img">
  <div class="tool-card__icon">🔄</div>
  <div class="tool-card__info">
    <h3 class="tool-card__title">{{ t "nav.img_to_jpg" }}</h3>
    <p class="tool-card__desc">{{ t "hero.to_jpg.subtitle" }}</p>
  </div>
  <span class="tool-card__badge tool-card__badge--free">免费</span>
</a>

<!-- JPG 转其他格式 -->
<a href="/img/jpg-to-image" class="tool-card tool-card--img">
  <div class="tool-card__icon">🖼️</div>
  <div class="tool-card__info">
    <h3 class="tool-card__title">{{ t "nav.jpg_to_img" }}</h3>
    <p class="tool-card__desc">{{ t "hero.jpg_to.subtitle" }}</p>
  </div>
  <span class="tool-card__badge tool-card__badge--free">免费</span>
</a>

<!-- 图片编辑器 -->
<a href="/img/photo-editor" class="tool-card tool-card--img">
  <div class="tool-card__icon">🎨</div>
  <div class="tool-card__info">
    <h3 class="tool-card__title">{{ t "nav.photo_editor" }}</h3>
    <p class="tool-card__desc">{{ t "hero.editor.subtitle" }}</p>
  </div>
  <span class="tool-card__badge tool-card__badge--new">NEW</span>
</a>

<!-- 移除背景 -->
<a href="/img/remove-bg" class="tool-card tool-card--img tool-card--hot">
  <div class="tool-card__icon">🪄</div>
  <div class="tool-card__info">
    <h3 class="tool-card__title">{{ t "nav.remove_bg" }}</h3>
    <p class="tool-card__desc">{{ t "hero.remove_bg.subtitle" }}</p>
  </div>
  <span class="tool-card__badge tool-card__badge--hot">热门</span>
</a>

<!-- 添加水印 -->
<a href="/img/watermark" class="tool-card tool-card--img">
  <div class="tool-card__icon">💧</div>
  <div class="tool-card__info">
    <h3 class="tool-card__title">{{ t "nav.watermark" }}</h3>
    <p class="tool-card__desc">{{ t "hero.watermark.subtitle" }}</p>
  </div>
  <span class="tool-card__badge tool-card__badge--free">免费</span>
</a>

<!-- 旋转图片 -->
<a href="/img/rotate" class="tool-card tool-card--img">
  <div class="tool-card__icon">🔃</div>
  <div class="tool-card__info">
    <h3 class="tool-card__title">{{ t "nav.rotate" }}</h3>
    <p class="tool-card__desc">{{ t "hero.rotate.subtitle" }}</p>
  </div>
  <span class="tool-card__badge tool-card__badge--free">免费</span>
</a>
```
