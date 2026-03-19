# 图片元数据查看工具 — 完整需求文档（M-00 ～ M-04）

> **竞品对标**：https://www.metadata2go.com/view-metadata
> **技术方向**：纯前端（exifr.js 解析，无需后端）
> **路由**：`/img/metadata`
> **主色**：琥珀橙 `#d97706`（与压缩工具翠绿、调整大小靛蓝、PDF 工具红色明显区分）
> **总工时**：约 8h

---

# Block M-00 · 总览索引

## 📐 产品架构图

```
用户拖拽 / 选择图片（JPG / PNG / WebP / TIFF / HEIC，最多 10 张）
        ↓
  前端 exifr.js 解析引擎（浏览器内完成）
  ├─ 解析 EXIF 数据（相机设置、快门、光圈、ISO 等）
  ├─ 解析 IPTC 数据（版权、作者、关键词等）
  ├─ 解析 XMP 数据（评级、标签、软件信息等）
  └─ 解析 GPS 数据（经纬度、海拔、地图预览）
        ↓
  结果展示（分类卡片：基础信息 / 相机参数 / GPS 位置 / 版权信息 / 原始数据）
  ├─ 每个字段可一键复制
  ├─ GPS 经纬度嵌入 OpenStreetMap 地图预览
  └─ 原始 JSON 折叠展示
        ↓
  导出功能
  ├─ 导出 JSON（单张或全部）
  ├─ 导出 CSV（字段表格）
  └─ 导出 TXT（人类可读格式）
```

---

## 🎯 竞品功能对标

| 功能 | metadata2go.com | 本次实现 | 说明 |
|------|----------------|---------|------|
| 拖拽上传 | ✅ | ✅ 最多 10 张 | — |
| EXIF 数据解析 | ✅ | ✅ 完整 EXIF | 核心功能 |
| IPTC 数据解析 | ✅ | ✅ | 版权/作者 |
| XMP 数据解析 | ✅ | ✅ | 软件/评级 |
| GPS 位置显示 | ✅ 文字 | ✅ **地图预览** | 核心差异化 |
| 分类展示 | ✅ | ✅ 五大分类卡片 | 差异化 |
| 字段一键复制 | ❌ | ✅ | 差异化 |
| 批量对比 | ❌ | ✅ 多图切换 | 差异化 |
| 导出 JSON | ✅ | ✅ | — |
| 导出 CSV | ❌ | ✅ | 差异化 |
| 导出 TXT | ❌ | ✅ 人类可读 | 差异化 |
| 原始数据查看 | ✅ | ✅ 折叠 JSON | — |
| 无需登录 | ✅ | ✅ | — |
| 隐私保护（不上传）| ❌（服务端处理）| ✅ **纯前端** | 核心差异化 |
| 支持 HEIC | ❌ | ✅（依赖 exifr）| 差异化 |

---

## 📋 Block 清单

| Block | 核心内容 | 工时 |
|-------|---------|------|
| **M-00** | 总览索引（本文档）| — |
| **M-01** | 路由 + SEO + i18n + sitemap | 1h |
| **M-02** | Landing 页 + 上传区 + 布局结构（HTML+CSS）| 2h |
| **M-03** | 前端元数据解析引擎（JS：exifr + GPS地图）| 3h |
| **M-04** | 结果展示 UI + 导出功能（JS+CSS）| 2h |

**总计：约 8h**

---

## 🗺 路由规划

```
/img/metadata              ← 工具主页
/img/metadata?lang=zh      ← 中文
/img/metadata?lang=en      ← 英文
```

---

## 🔧 前端依赖（CDN）

```html
<!-- EXIF / IPTC / XMP / GPS 解析（纯前端，支持 JPG/PNG/WebP/TIFF/HEIC）-->
<script src="https://cdnjs.cloudflare.com/ajax/libs/exifr/7.1.3/full.umd.js"></script>
<!-- CSV / ZIP 导出 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>
```

---

## 🔑 i18n Key 前缀清单

```
img.metadata.seo.*         SEO title/description
img.metadata.hero.*        Hero 区域
img.metadata.upload.*      上传区
img.metadata.section.*     五大分类标题
img.metadata.field.*       通用字段标签
img.metadata.export.*      导出相关
img.metadata.status.*      处理状态
img.metadata.error.*       错误提示
img.metadata.feature.*     三特性
img.metadata.faq.*         FAQ
img.metadata.map.*         地图相关
```

---

## 📌 设计风格

- **主色**：琥珀橙 `#d97706`，Hover 深橙 `#b45309`，浅背景 `#fffbeb`
- **背景**：浅米白 `#fafaf8`，卡片白色
- **上传区**：超大虚线边框，拖拽高亮橙色
- **结果区**：左侧缩略图 + 文件切换列表，右侧五大分类卡片展示
- **GPS 区**：内嵌 OpenStreetMap iframe 地图预览

---

---

# Block M-01 · 图片元数据查看 — 路由 / SEO / i18n / 广告位 / sitemap

> **预估工时**：1h
> **依赖**：无

---

## 1. Go 路由注册

```go
// internal/router/router.go

img := r.Group("/img")
img.Use(middleware.I18n(), middleware.AdsConfig())

img.GET("/metadata", handler.ImgMetadataPage)
// 无后端 API（纯前端 exifr.js 处理）
```

---

## 2. 页面 Handler

```go
// internal/handler/img_metadata.go
package handler

func ImgMetadataPage(c *gin.Context) {
    lang := c.GetString("lang")

    seoTitle := map[string]string{
        "zh": "图片元数据查看 — 在线免费读取 EXIF/GPS/IPTC 信息 | DevToolBox",
        "en": "Image Metadata Viewer — Read EXIF, GPS, IPTC Data Online Free | DevToolBox",
    }
    seoDesc := map[string]string{
        "zh": "免费在线查看图片隐藏的元数据，支持 EXIF、GPS 位置（地图预览）、IPTC 版权、XMP 信息，图片不上传服务器，完全在浏览器内完成，支持导出 JSON/CSV/TXT。",
        "en": "Free online image metadata viewer. Read EXIF, GPS location (map preview), IPTC copyright, and XMP data. Files never leave your browser. Export as JSON, CSV or TXT.",
    }

    c.HTML(200, "img/metadata.html", gin.H{
        "Lang":  lang,
        "Title": seoTitle[lang],
        "Desc":  seoDesc[lang],
        "Path":  "/img/metadata",
        "FAQs":  getImgMetadataFAQs(lang),
    })
}

type ImgMetadataFAQ struct{ Q, A string }

func getImgMetadataFAQs(lang string) []ImgMetadataFAQ {
    if lang == "en" {
        return []ImgMetadataFAQ{
            {
                Q: "Is my image uploaded to a server?",
                A: "No. All metadata extraction is performed entirely in your browser using the exifr.js library. Your images are never sent to any server, ensuring complete privacy.",
            },
            {
                Q: "What image formats are supported?",
                A: "JPEG/JPG, PNG, WebP, TIFF, and HEIC/HEIF are supported. EXIF data is most commonly embedded in JPEG files from digital cameras and smartphones.",
            },
            {
                Q: "What metadata can I see?",
                A: "You can view EXIF data (camera make/model, aperture, shutter speed, ISO, focal length, date/time), GPS location (latitude, longitude, altitude with map preview), IPTC data (copyright, author, keywords, caption), and XMP data (rating, software, color space).",
            },
            {
                Q: "Why is some metadata missing?",
                A: "Metadata can be stripped by social media platforms, messaging apps, or photo editors. If you download a photo from Instagram or WhatsApp, most EXIF data will have been removed for privacy reasons.",
            },
            {
                Q: "Can I see the GPS location on a map?",
                A: "Yes. If your image contains GPS coordinates, we display an interactive OpenStreetMap preview showing exactly where the photo was taken.",
            },
            {
                Q: "How do I export the metadata?",
                A: "After analyzing your image, you can export the metadata as JSON (structured data), CSV (spreadsheet-compatible), or TXT (human-readable report). For multiple images, you can download all results as a ZIP file.",
            },
        }
    }
    return []ImgMetadataFAQ{
        {
            Q: "图片会上传到服务器吗？",
            A: "不会。元数据提取完全在您的浏览器内完成，使用 exifr.js 库进行解析，图片文件不会发送到任何服务器，完全保护您的隐私。",
        },
        {
            Q: "支持哪些图片格式？",
            A: "支持 JPEG/JPG、PNG、WebP、TIFF 和 HEIC/HEIF 格式。EXIF 数据最常见于数码相机和智能手机拍摄的 JPEG 文件。",
        },
        {
            Q: "可以查看哪些元数据？",
            A: "可查看 EXIF 数据（相机品牌/型号、光圈、快门速度、ISO、焦距、拍摄时间）、GPS 位置（经纬度、海拔，含地图预览）、IPTC 数据（版权、作者、关键词、描述）以及 XMP 数据（评级、软件、色彩空间）。",
        },
        {
            Q: "为什么某些元数据缺失？",
            A: "社交媒体平台、即时通讯软件或图片编辑器可能会在处理图片时自动删除元数据。从 Instagram、微信等平台下载的图片，大部分 EXIF 数据已被删除。",
        },
        {
            Q: "可以在地图上看到 GPS 位置吗？",
            A: "可以。如果图片包含 GPS 坐标，我们会显示一个嵌入式 OpenStreetMap 预览地图，精确显示照片的拍摄地点。",
        },
        {
            Q: "如何导出元数据？",
            A: "分析完成后，可将元数据导出为 JSON（结构化数据）、CSV（表格格式）或 TXT（人类可读报告）。多张图片时，可打包下载全部结果为 ZIP。",
        },
    }
}
```

---

## 3. SEO `<head>` 模板

```html
<!-- templates/img/metadata.html — <head> 部分 -->

<title>{{ .Title }}</title>
<meta name="description" content="{{ .Desc }}">
<meta name="keywords" content="图片元数据查看,EXIF查看器,GPS位置查看,IPTC数据,XMP数据,图片信息提取,在线EXIF工具,不上传服务器">

<meta property="og:title"       content="{{ .Title }}">
<meta property="og:description" content="{{ .Desc }}">
<meta property="og:type"        content="website">
<meta property="og:url"         content="https://devtoolbox.dev/img/metadata">
<meta property="og:image"       content="https://devtoolbox.dev/static/og/img-metadata.png">

<link rel="canonical" href="https://devtoolbox.dev/img/metadata">
<link rel="alternate" hreflang="zh" href="https://devtoolbox.dev/img/metadata?lang=zh">
<link rel="alternate" hreflang="en" href="https://devtoolbox.dev/img/metadata?lang=en">

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
  "url": "https://devtoolbox.dev/img/metadata",
  "featureList": [
    "View EXIF data from images",
    "GPS location with map preview",
    "IPTC copyright and author data",
    "XMP rating and software data",
    "Export as JSON, CSV, TXT",
    "Batch analysis up to 10 images",
    "No upload required - browser-side only",
    "Supports JPG, PNG, WebP, TIFF, HEIC"
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
{{- template "partials/ad_slot.html" dict "SlotID" "img-metadata-top"     "Size" "728x90"  "Mobile" "320x50" }}
{{- template "partials/ad_slot.html" dict "SlotID" "img-metadata-sidebar" "Size" "300x250" "MobileHide" true }}
{{- template "partials/ad_slot.html" dict "SlotID" "img-metadata-bottom"  "Size" "728x90"  "Mobile" "320x50" }}
```

---

## 5. 全量 i18n Key

### locales/zh.json（img.metadata 部分）

```json
{
  "img.metadata.name":  "图片元数据查看",
  "img.metadata.title": "在线图片元数据查看工具",
  "img.metadata.desc":  "免费在线查看 JPG/PNG/WebP/TIFF/HEIC 图片隐藏的 EXIF/GPS/IPTC/XMP 元数据",

  "img.metadata.hero.title":    "免费在线查看图片隐藏元数据",
  "img.metadata.hero.subtitle": "读取 EXIF 相机参数、GPS 地图位置、IPTC 版权信息，图片不离开浏览器",
  "img.metadata.hero.badge1":   "文件不上传",
  "img.metadata.hero.badge2":   "GPS 地图预览",
  "img.metadata.hero.badge3":   "完全免费",

  "img.metadata.upload.title":      "拖拽图片到此处",
  "img.metadata.upload.btn":        "选择图片",
  "img.metadata.upload.hint":       "支持 JPG / PNG / WebP / TIFF / HEIC，最多 10 张",
  "img.metadata.upload.drop_active":"松开鼠标读取元数据",
  "img.metadata.upload.multi":      "可同时拖入多张图片进行对比",

  "img.metadata.section.basic":    "📋 基础信息",
  "img.metadata.section.camera":   "📷 相机参数",
  "img.metadata.section.gps":      "📍 GPS 位置",
  "img.metadata.section.iptc":     "©️ 版权信息（IPTC）",
  "img.metadata.section.xmp":      "🏷 XMP 数据",
  "img.metadata.section.raw":      "🔧 原始数据",

  "img.metadata.field.filename":    "文件名",
  "img.metadata.field.filesize":    "文件大小",
  "img.metadata.field.filetype":    "文件类型",
  "img.metadata.field.dimensions":  "图片尺寸",
  "img.metadata.field.colorspace":  "色彩空间",
  "img.metadata.field.make":        "相机品牌",
  "img.metadata.field.model":       "相机型号",
  "img.metadata.field.lens":        "镜头型号",
  "img.metadata.field.datetime":    "拍摄时间",
  "img.metadata.field.aperture":    "光圈值",
  "img.metadata.field.shutter":     "快门速度",
  "img.metadata.field.iso":         "ISO 感光度",
  "img.metadata.field.focal":       "焦距",
  "img.metadata.field.flash":       "闪光灯",
  "img.metadata.field.whitebalance":"白平衡",
  "img.metadata.field.metering":    "测光模式",
  "img.metadata.field.exposure":    "曝光模式",
  "img.metadata.field.gps_lat":     "纬度",
  "img.metadata.field.gps_lng":     "经度",
  "img.metadata.field.gps_alt":     "海拔",
  "img.metadata.field.gps_direction":"拍摄方向",
  "img.metadata.field.copyright":   "版权",
  "img.metadata.field.author":      "作者",
  "img.metadata.field.caption":     "图片说明",
  "img.metadata.field.keywords":    "关键词",
  "img.metadata.field.credit":      "来源",
  "img.metadata.field.rating":      "评级",
  "img.metadata.field.software":    "处理软件",
  "img.metadata.field.createdate":  "创建日期",

  "img.metadata.copy":              "复制",
  "img.metadata.copied":            "已复制",
  "img.metadata.no_data":           "未找到此类数据",
  "img.metadata.no_gps":            "此图片不含 GPS 信息",

  "img.metadata.map.open":          "在 OpenStreetMap 中打开",
  "img.metadata.map.copy_coords":   "复制坐标",

  "img.metadata.export.json":       "导出 JSON",
  "img.metadata.export.csv":        "导出 CSV",
  "img.metadata.export.txt":        "导出 TXT",
  "img.metadata.export.all_zip":    "打包下载全部（ZIP）",

  "img.metadata.status.reading":    "读取中...",
  "img.metadata.status.done":       "解析完成",
  "img.metadata.status.error":      "解析失败",

  "img.metadata.error.unsupported": "不支持的格式，请上传 JPG/PNG/WebP/TIFF/HEIC",
  "img.metadata.error.too_many":    "最多同时分析 10 张图片",
  "img.metadata.error.too_large":   "文件过大，单张最大 20MB",
  "img.metadata.error.parse":       "元数据解析失败，图片可能不含 EXIF 数据",

  "img.metadata.feature.privacy.title": "文件不上传",
  "img.metadata.feature.privacy.desc":  "元数据提取完全在浏览器内完成，图片不会发送到任何服务器",
  "img.metadata.feature.gps.title":     "GPS 地图预览",
  "img.metadata.feature.gps.desc":      "含 GPS 信息的图片自动显示 OpenStreetMap 拍摄地点地图",
  "img.metadata.feature.export.title":  "多格式导出",
  "img.metadata.feature.export.desc":   "元数据可导出为 JSON、CSV 或 TXT，方便存档与分析",

  "img.metadata.faq.title": "常见问题",

  "img.metadata.raw.toggle_show":   "展开原始数据",
  "img.metadata.raw.toggle_hide":   "收起原始数据",
  "img.metadata.raw.copy_all":      "复制全部 JSON"
}
```

### locales/en.json（img.metadata 部分）

```json
{
  "img.metadata.name":  "Image Metadata Viewer",
  "img.metadata.title": "Online Image Metadata Viewer",
  "img.metadata.desc":  "Read hidden EXIF, GPS, IPTC and XMP metadata from JPG, PNG, WebP, TIFF and HEIC images. Files never leave your browser.",

  "img.metadata.hero.title":    "Read Hidden Image Metadata Online",
  "img.metadata.hero.subtitle": "View EXIF camera settings, GPS map location, IPTC copyright info. Files stay in your browser.",
  "img.metadata.hero.badge1":   "No Upload",
  "img.metadata.hero.badge2":   "GPS Map Preview",
  "img.metadata.hero.badge3":   "100% Free",

  "img.metadata.upload.title":      "Drop images here",
  "img.metadata.upload.btn":        "Choose Images",
  "img.metadata.upload.hint":       "JPG / PNG / WebP / TIFF / HEIC · Max 20MB each · Up to 10 files",
  "img.metadata.upload.drop_active":"Release to read metadata",
  "img.metadata.upload.multi":      "Drop multiple images to compare their metadata",

  "img.metadata.section.basic":    "📋 Basic Info",
  "img.metadata.section.camera":   "📷 Camera Settings",
  "img.metadata.section.gps":      "📍 GPS Location",
  "img.metadata.section.iptc":     "©️ Copyright (IPTC)",
  "img.metadata.section.xmp":      "🏷 XMP Data",
  "img.metadata.section.raw":      "🔧 Raw Data",

  "img.metadata.field.filename":    "File Name",
  "img.metadata.field.filesize":    "File Size",
  "img.metadata.field.filetype":    "File Type",
  "img.metadata.field.dimensions":  "Dimensions",
  "img.metadata.field.colorspace":  "Color Space",
  "img.metadata.field.make":        "Camera Make",
  "img.metadata.field.model":       "Camera Model",
  "img.metadata.field.lens":        "Lens Model",
  "img.metadata.field.datetime":    "Date Taken",
  "img.metadata.field.aperture":    "Aperture",
  "img.metadata.field.shutter":     "Shutter Speed",
  "img.metadata.field.iso":         "ISO",
  "img.metadata.field.focal":       "Focal Length",
  "img.metadata.field.flash":       "Flash",
  "img.metadata.field.whitebalance":"White Balance",
  "img.metadata.field.metering":    "Metering Mode",
  "img.metadata.field.exposure":    "Exposure Mode",
  "img.metadata.field.gps_lat":     "Latitude",
  "img.metadata.field.gps_lng":     "Longitude",
  "img.metadata.field.gps_alt":     "Altitude",
  "img.metadata.field.gps_direction":"Direction",
  "img.metadata.field.copyright":   "Copyright",
  "img.metadata.field.author":      "Author",
  "img.metadata.field.caption":     "Caption",
  "img.metadata.field.keywords":    "Keywords",
  "img.metadata.field.credit":      "Credit",
  "img.metadata.field.rating":      "Rating",
  "img.metadata.field.software":    "Software",
  "img.metadata.field.createdate":  "Create Date",

  "img.metadata.copy":              "Copy",
  "img.metadata.copied":            "Copied!",
  "img.metadata.no_data":           "No data found",
  "img.metadata.no_gps":            "No GPS data in this image",

  "img.metadata.map.open":          "Open in OpenStreetMap",
  "img.metadata.map.copy_coords":   "Copy Coordinates",

  "img.metadata.export.json":       "Export JSON",
  "img.metadata.export.csv":        "Export CSV",
  "img.metadata.export.txt":        "Export TXT",
  "img.metadata.export.all_zip":    "Download All (ZIP)",

  "img.metadata.status.reading":    "Reading...",
  "img.metadata.status.done":       "Done",
  "img.metadata.status.error":      "Failed",

  "img.metadata.error.unsupported": "Unsupported format. Use JPG, PNG, WebP, TIFF or HEIC.",
  "img.metadata.error.too_many":    "Maximum 10 images at once.",
  "img.metadata.error.too_large":   "File too large. Max 20MB per image.",
  "img.metadata.error.parse":       "Failed to parse metadata. The image may not contain EXIF data.",

  "img.metadata.feature.privacy.title": "Privacy First",
  "img.metadata.feature.privacy.desc":  "All processing happens in your browser. Images are never sent to a server.",
  "img.metadata.feature.gps.title":     "GPS Map Preview",
  "img.metadata.feature.gps.desc":      "Images with GPS data show an interactive OpenStreetMap preview of where the photo was taken.",
  "img.metadata.feature.export.title":  "Multi-format Export",
  "img.metadata.feature.export.desc":   "Export metadata as JSON, CSV or TXT for archiving and analysis.",

  "img.metadata.faq.title": "FAQ",

  "img.metadata.raw.toggle_show":   "Show Raw Data",
  "img.metadata.raw.toggle_hide":   "Hide Raw Data",
  "img.metadata.raw.copy_all":      "Copy All JSON"
}
```

---

## 6. sitemap.xml 新增条目

```xml
<url>
  <loc>https://devtoolbox.dev/img/metadata</loc>
  <lastmod>2026-03-01</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>
</url>
<url>
  <loc>https://devtoolbox.dev/img/metadata?lang=zh</loc>
  <priority>0.85</priority>
</url>
<url>
  <loc>https://devtoolbox.dev/img/metadata?lang=en</loc>
  <priority>0.85</priority>
</url>
```

---

## 7. 验收标准

- [ ] `/img/metadata` 返回 200，`<title>` 含关键词
- [ ] canonical + hreflang 正确输出
- [ ] JSON-LD SoftwareApplication + FAQPage 正确
- [ ] sitemap 包含 3 条 img/metadata 条目
- [ ] 中英文切换所有文案正确替换，无遗漏

---

---

# Block M-02 · 图片元数据查看 — Landing 页 + 上传区 + 布局结构

> **路由**：`/img/metadata`
> **预估工时**：2h
> **依赖**：M-01
> **交付粒度**：完整 HTML + CSS，含 Hero 区、超大拖拽上传区、结果双栏布局（左侧文件列表 + 右侧元数据卡片）、三特性、FAQ

---

## 1. 完整 HTML 模板（`templates/img/metadata.html`）

```html
<!DOCTYPE html>
<html lang="{{ .Lang }}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ .Title }}</title>
  <meta name="description" content="{{ .Desc }}">
  <!-- SEO Meta（见 M-01）-->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/exifr/7.1.3/full.umd.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>
  <link rel="stylesheet" href="/static/css/img-metadata.css">
</head>
<body class="img-metadata-page">

<!-- ── 导航 ────────────────────────────────── -->
<nav class="im-navbar">
  <div class="im-container">
    <a class="im-logo" href="/img/metadata">
      <span class="im-logo__icon">🔍</span>
      <span class="im-logo__text">图片元数据查看</span>
    </a>
    <div class="im-navbar__right">
      <div class="im-lang-switch">
        <a href="?lang=zh" class="{{ if eq .Lang "zh" }}active{{ end }}">中文</a>
        <span>/</span>
        <a href="?lang=en" class="{{ if eq .Lang "en" }}active{{ end }}">EN</a>
      </div>
    </div>
  </div>
</nav>

<!-- 广告位：顶部 -->
{{- template "partials/ad_slot.html" dict "SlotID" "img-metadata-top" "Size" "728x90" "Mobile" "320x50" }}

<!-- ── Hero + 上传区 ────────────────────────── -->
<section class="im-hero">
  <div class="im-container">

    <div class="im-hero__text">
      <h1 class="im-hero__title">{{ t .Lang "img.metadata.hero.title" }}</h1>
      <p class="im-hero__subtitle">{{ t .Lang "img.metadata.hero.subtitle" }}</p>
      <div class="im-hero__badges">
        <span class="im-badge">🔒 {{ t .Lang "img.metadata.hero.badge1" }}</span>
        <span class="im-badge">📍 {{ t .Lang "img.metadata.hero.badge2" }}</span>
        <span class="im-badge">✅ {{ t .Lang "img.metadata.hero.badge3" }}</span>
      </div>
    </div>

    <!-- 超大拖拽上传区 -->
    <div class="im-upload-zone" id="uploadZone"
         ondragover="onDragOver(event)"
         ondragleave="onDragLeave(event)"
         ondrop="onDrop(event)">

      <div class="im-upload-zone__idle" id="uploadIdle">
        <div class="im-upload-zone__graphic">
          <!-- 元数据图标：放大镜 + 信息层 -->
          <div class="im-meta-icon">
            <div class="im-meta-icon__img-placeholder"></div>
            <div class="im-meta-icon__lines">
              <div class="im-meta-icon__line im-meta-icon__line--long"></div>
              <div class="im-meta-icon__line im-meta-icon__line--medium"></div>
              <div class="im-meta-icon__line im-meta-icon__line--short"></div>
            </div>
            <div class="im-meta-icon__magnifier">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2.5">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
          </div>
        </div>

        <p class="im-upload-zone__title">{{ t .Lang "img.metadata.upload.title" }}</p>
        <p class="im-upload-zone__hint">{{ t .Lang "img.metadata.upload.multi" }}</p>

        <label class="im-upload-btn">
          {{ t .Lang "img.metadata.upload.btn" }}
          <input type="file" id="fileInput"
                 accept="image/jpeg,image/png,image/webp,image/tiff,image/heic,image/heif"
                 multiple style="display:none"
                 onchange="onFileSelect(this)">
        </label>
        <p class="im-upload-zone__limit">{{ t .Lang "img.metadata.upload.hint" }}</p>
      </div>

      <!-- 拖拽激活层 -->
      <div class="im-upload-zone__drop-overlay" id="dropOverlay">
        <div class="im-drop-icon">🔍</div>
        <p>{{ t .Lang "img.metadata.upload.drop_active" }}</p>
      </div>

    </div><!-- /im-upload-zone -->

  </div><!-- /im-container -->
</section>

<!-- ── 结果区（双栏布局）──────────────────── -->
<section class="im-results-section" id="resultsSection" style="display:none">
  <div class="im-container">
    <div class="im-results-layout">

      <!-- 左侧：文件切换列表 + 广告 -->
      <aside class="im-file-sidebar">
        <div class="im-file-list" id="fileList"></div>
        <div class="im-add-more">
          <label class="im-add-more-btn">
            + 继续添加图片
            <input type="file"
                   accept="image/jpeg,image/png,image/webp,image/tiff,image/heic,image/heif"
                   multiple style="display:none"
                   onchange="onFileSelect(this)">
          </label>
        </div>
        <div class="im-sidebar-ad">
          {{- template "partials/ad_slot.html" dict "SlotID" "img-metadata-sidebar" "Size" "300x250" "MobileHide" true }}
        </div>
      </aside>

      <!-- 右侧：元数据详情 -->
      <main class="im-metadata-main" id="metadataMain">
        <!-- 顶部：缩略图 + 文件概览 + 导出按钮 -->
        <div class="im-result-header" id="resultHeader" style="display:none">
          <div class="im-result-header__thumb-wrap">
            <img class="im-result-header__thumb" id="resultThumb" src="" alt="">
          </div>
          <div class="im-result-header__info">
            <p class="im-result-header__name" id="resultName"></p>
            <p class="im-result-header__meta" id="resultMeta"></p>
          </div>
          <div class="im-result-header__export">
            <button class="im-export-btn im-export-btn--json" onclick="exportData('json')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              JSON
            </button>
            <button class="im-export-btn im-export-btn--csv" onclick="exportData('csv')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="3" y1="15" x2="21" y2="15"/>
                <line x1="9" y1="3" x2="9" y2="21"/>
              </svg>
              CSV
            </button>
            <button class="im-export-btn im-export-btn--txt" onclick="exportData('txt')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              TXT
            </button>
          </div>
        </div>

        <!-- 五大分类卡片区 -->
        <div class="im-sections-wrap" id="sectionsWrap" style="display:none">
          <!-- 1. 基础信息 -->
          <div class="im-section-card" id="sectionBasic">
            <div class="im-section-card__header" onclick="toggleSection('sectionBasic')">
              <h3 class="im-section-card__title">📋 基础信息</h3>
              <svg class="im-section-chevron" width="16" height="16" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
            <div class="im-section-card__body" id="bodyBasic"></div>
          </div>

          <!-- 2. 相机参数 -->
          <div class="im-section-card" id="sectionCamera">
            <div class="im-section-card__header" onclick="toggleSection('sectionCamera')">
              <h3 class="im-section-card__title">📷 相机参数</h3>
              <svg class="im-section-chevron" width="16" height="16" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
            <div class="im-section-card__body" id="bodyCamera"></div>
          </div>

          <!-- 3. GPS 位置 -->
          <div class="im-section-card" id="sectionGPS">
            <div class="im-section-card__header" onclick="toggleSection('sectionGPS')">
              <h3 class="im-section-card__title">📍 GPS 位置</h3>
              <svg class="im-section-chevron" width="16" height="16" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
            <div class="im-section-card__body" id="bodyGPS"></div>
          </div>

          <!-- 4. 版权信息（IPTC） -->
          <div class="im-section-card" id="sectionIPTC">
            <div class="im-section-card__header" onclick="toggleSection('sectionIPTC')">
              <h3 class="im-section-card__title">©️ 版权信息（IPTC）</h3>
              <svg class="im-section-chevron" width="16" height="16" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
            <div class="im-section-card__body" id="bodyIPTC"></div>
          </div>

          <!-- 5. XMP 数据 -->
          <div class="im-section-card" id="sectionXMP">
            <div class="im-section-card__header" onclick="toggleSection('sectionXMP')">
              <h3 class="im-section-card__title">🏷 XMP 数据</h3>
              <svg class="im-section-chevron" width="16" height="16" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
            <div class="im-section-card__body" id="bodyXMP"></div>
          </div>

          <!-- 6. 原始数据（折叠） -->
          <div class="im-section-card im-section-card--raw" id="sectionRaw">
            <div class="im-section-card__header" onclick="toggleSection('sectionRaw')">
              <h3 class="im-section-card__title">🔧 原始数据</h3>
              <div class="im-section-card__header-actions">
                <button class="im-raw-copy-btn" onclick="copyRawData(event)">
                  复制 JSON
                </button>
                <svg class="im-section-chevron" width="16" height="16" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>
            <div class="im-section-card__body" id="bodyRaw">
              <pre class="im-raw-pre" id="rawJsonPre"></pre>
            </div>
          </div>
        </div><!-- /im-sections-wrap -->

        <!-- 空状态 -->
        <div class="im-empty-state" id="emptyState">
          <div class="im-empty-state__icon">📷</div>
          <p>从左侧选择一张图片查看元数据</p>
        </div>

      </main><!-- /im-metadata-main -->
    </div><!-- /im-results-layout -->

    <!-- 批量导出 -->
    <div class="im-bulk-export" id="bulkExport" style="display:none">
      <button class="im-btn-download-all" onclick="exportAll()">
        ⬇ {{ t .Lang "img.metadata.export.all_zip" }}
      </button>
      <button class="im-btn-clear" onclick="clearAll()">
        🗑 清空全部
      </button>
    </div>

  </div><!-- /im-container -->
</section>

<!-- ── 三特性 ──────────────────────────────── -->
<section class="im-features-section">
  <div class="im-container">
    <div class="im-features-grid">
      <div class="im-feature-card">
        <div class="im-feature-icon" style="background:#fffbeb">🔒</div>
        <h3>{{ t .Lang "img.metadata.feature.privacy.title" }}</h3>
        <p>{{ t .Lang "img.metadata.feature.privacy.desc" }}</p>
      </div>
      <div class="im-feature-card">
        <div class="im-feature-icon" style="background:#fff7ed">📍</div>
        <h3>{{ t .Lang "img.metadata.feature.gps.title" }}</h3>
        <p>{{ t .Lang "img.metadata.feature.gps.desc" }}</p>
      </div>
      <div class="im-feature-card">
        <div class="im-feature-icon" style="background:#f0fdf4">📤</div>
        <h3>{{ t .Lang "img.metadata.feature.export.title" }}</h3>
        <p>{{ t .Lang "img.metadata.feature.export.desc" }}</p>
      </div>
    </div>
  </div>
</section>

<!-- ── FAQ ────────────────────────────────── -->
<section class="im-faq-section">
  <div class="im-container">
    <h2 class="im-section-title">{{ t .Lang "img.metadata.faq.title" }}</h2>
    <div class="im-faq-list">
      {{- range $i, $faq := .FAQs }}
      <div class="im-faq-item" id="faq-{{ $i }}">
        <button class="im-faq-question" onclick="toggleFAQ('faq-{{ $i }}')">
          <span>{{ $faq.Q }}</span>
          <svg class="im-faq-chevron" width="16" height="16" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        <div class="im-faq-answer"><p>{{ $faq.A }}</p></div>
      </div>
      {{- end }}
    </div>
  </div>
</section>

{{- template "partials/ad_slot.html" dict "SlotID" "img-metadata-bottom" "Size" "728x90" "Mobile" "320x50" }}

<div id="toastContainer"></div>

<script src="/static/js/img-metadata-engine.js"></script>
<script src="/static/js/img-metadata-ui.js"></script>
</body>
</html>
```

---

## 2. CSS（`/static/css/img-metadata.css`）

```css
/* ══════════════════════════════════════════════
   图片元数据查看工具 — 完整样式
   主色：琥珀橙 #d97706
   背景：米白 #fafaf8
════════════════════════════════════════════════ */

:root {
  --im-amber:       #d97706;
  --im-amber-dark:  #b45309;
  --im-amber-light: #fffbeb;
  --im-amber-mid:   #fef3c7;
  --im-bg:          #fafaf8;
  --im-surface:     #ffffff;
  --im-border:      #e8e4dc;
  --im-text:        #1a1a1a;
  --im-text-muted:  #72726e;
  --im-shadow-sm:   0 1px 3px rgba(0,0,0,0.06);
  --im-shadow-md:   0 4px 16px rgba(0,0,0,0.08);
  --im-shadow-lg:   0 12px 40px rgba(0,0,0,0.12);
  --im-radius-sm:   8px;
  --im-radius-md:   14px;
  --im-radius-lg:   20px;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body.img-metadata-page {
  font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', system-ui, sans-serif;
  background: var(--im-bg);
  color: var(--im-text);
  line-height: 1.6;
}

.im-container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
.im-section-title {
  font-size: 1.5rem; font-weight: 800; text-align: center; margin-bottom: 28px;
}

/* ══ 导航 ═══════════════════════════════════════ */
.im-navbar {
  background: var(--im-surface); border-bottom: 1px solid var(--im-border);
  position: sticky; top: 0; z-index: 100; box-shadow: var(--im-shadow-sm);
}
.im-navbar > .im-container {
  display: flex; align-items: center;
  justify-content: space-between; height: 54px;
}
.im-logo {
  display: flex; align-items: center; gap: 8px;
  text-decoration: none; font-weight: 800; font-size: 1rem;
  color: var(--im-amber);
}
.im-lang-switch {
  display: flex; align-items: center; gap: 6px;
  font-size: 0.8125rem; color: var(--im-text-muted);
}
.im-lang-switch a { color: var(--im-text-muted); text-decoration: none; font-weight: 500; }
.im-lang-switch a.active { color: var(--im-amber); font-weight: 700; }

/* ══ Hero ════════════════════════════════════════ */
.im-hero {
  padding: 52px 0 40px;
  background: linear-gradient(180deg, #fffbeb 0%, var(--im-bg) 100%);
}
.im-hero__text { text-align: center; margin-bottom: 36px; }
.im-hero__title {
  font-size: 2.5rem; font-weight: 900; letter-spacing: -0.03em;
  line-height: 1.15; margin-bottom: 12px;
}
.im-hero__subtitle {
  font-size: 1.0625rem; color: var(--im-text-muted);
  max-width: 520px; margin: 0 auto 20px;
}
.im-hero__badges { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; }
.im-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 14px;
  background: var(--im-surface); border: 1px solid var(--im-border);
  border-radius: 999px; font-size: 0.8125rem; color: var(--im-text-muted);
  box-shadow: var(--im-shadow-sm);
}

/* ══ 上传区 ══════════════════════════════════════ */
.im-upload-zone {
  position: relative; background: var(--im-surface);
  border: 2.5px dashed var(--im-border); border-radius: var(--im-radius-lg);
  padding: 56px 32px; text-align: center; cursor: pointer;
  transition: border-color 0.2s, background 0.2s, transform 0.15s;
  box-shadow: var(--im-shadow-md); overflow: hidden;
}
.im-upload-zone:hover {
  border-color: var(--im-amber); background: var(--im-amber-light);
  transform: translateY(-2px); box-shadow: var(--im-shadow-lg);
}
.im-upload-zone--dragover {
  border-color: var(--im-amber) !important;
  background: var(--im-amber-light) !important;
  transform: scale(1.01) !important;
}
.im-upload-zone__idle { pointer-events: none; }

/* 元数据图标动画 */
.im-upload-zone__graphic {
  display: flex; align-items: center; justify-content: center; margin-bottom: 20px;
}
.im-meta-icon {
  position: relative; width: 84px; height: 84px;
}
.im-meta-icon__img-placeholder {
  position: absolute; inset: 0; background: var(--im-amber-mid);
  border-radius: 10px; border: 2px solid var(--im-amber);
}
.im-meta-icon__lines {
  position: absolute; top: 18px; right: -30px;
  display: flex; flex-direction: column; gap: 6px;
}
.im-meta-icon__line {
  height: 6px; background: var(--im-border); border-radius: 999px;
  transition: background 0.3s;
}
.im-meta-icon__line--long   { width: 56px; }
.im-meta-icon__line--medium { width: 40px; }
.im-meta-icon__line--short  { width: 28px; }
.im-upload-zone:hover .im-meta-icon__line { background: var(--im-amber); opacity: 0.6; }
.im-meta-icon__magnifier {
  position: absolute; bottom: -8px; right: -16px;
  color: var(--im-amber);
  background: var(--im-surface); border-radius: 50%;
  padding: 2px;
}

.im-upload-zone__title { font-size: 1.25rem; font-weight: 700; margin-bottom: 6px; }
.im-upload-zone__hint  { font-size: 0.875rem; color: var(--im-text-muted); margin-bottom: 20px; }
.im-upload-zone__limit { font-size: 0.75rem; color: #a8a49e; margin-top: 12px; }

.im-upload-btn {
  display: inline-flex; align-items: center; height: 46px; padding: 0 28px;
  background: var(--im-amber); color: #ffffff; border-radius: 12px;
  font-size: 1rem; font-weight: 700; cursor: pointer;
  transition: background 0.15s, transform 0.1s;
  box-shadow: 0 4px 14px rgba(217,119,6,0.35); pointer-events: all;
}
.im-upload-btn:hover  { background: var(--im-amber-dark); }
.im-upload-btn:active { transform: translateY(1px); }

.im-upload-zone__drop-overlay {
  position: absolute; inset: 0;
  background: rgba(217,119,6,0.07); display: none;
  flex-direction: column; align-items: center; justify-content: center; gap: 12px;
  border-radius: calc(var(--im-radius-lg) - 2px); pointer-events: none;
}
.im-upload-zone--dragover .im-upload-zone__drop-overlay { display: flex; }
.im-drop-icon { font-size: 3rem; }
.im-upload-zone__drop-overlay p {
  font-size: 1.125rem; font-weight: 700; color: var(--im-amber);
}

/* ══ 结果区双栏布局 ══════════════════════════════ */
.im-results-section { padding: 32px 0 48px; }
.im-results-layout {
  display: grid; grid-template-columns: 260px 1fr; gap: 20px; align-items: start;
}

/* 左侧文件列表 */
.im-file-sidebar { position: sticky; top: 74px; display: flex; flex-direction: column; gap: 12px; }
.im-file-list    { display: flex; flex-direction: column; gap: 6px; }

.im-file-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; background: var(--im-surface);
  border: 1.5px solid var(--im-border); border-radius: var(--im-radius-sm);
  cursor: pointer; transition: all 0.15s;
}
.im-file-item:hover  { border-color: var(--im-amber); background: var(--im-amber-light); }
.im-file-item--active {
  border-color: var(--im-amber); background: var(--im-amber-light);
  box-shadow: 0 0 0 3px rgba(217,119,6,0.1);
}
.im-file-item__thumb {
  width: 40px; height: 40px; border-radius: 6px; object-fit: cover;
  flex-shrink: 0; background: var(--im-bg);
}
.im-file-item__info { min-width: 0; flex: 1; }
.im-file-item__name {
  font-size: 0.75rem; font-weight: 600;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.im-file-item__size { font-size: 0.6875rem; color: var(--im-text-muted); }
.im-file-item__status {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
}
.im-file-item__status--done       { background: #16a34a; }
.im-file-item__status--processing { background: var(--im-amber); animation: im-pulse 1s infinite; }
.im-file-item__status--error      { background: #dc2626; }
@keyframes im-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

.im-add-more-btn {
  display: flex; align-items: center; justify-content: center;
  height: 38px; width: 100%; background: transparent;
  border: 1.5px dashed var(--im-border); border-radius: var(--im-radius-sm);
  font-size: 0.8125rem; color: var(--im-text-muted); cursor: pointer;
}
.im-add-more-btn:hover { border-color: var(--im-amber); color: var(--im-amber); }

/* 右侧元数据主区 */
.im-metadata-main { min-width: 0; }

/* 顶部文件概览 */
.im-result-header {
  display: flex; align-items: center; gap: 16px;
  background: var(--im-surface); border: 1px solid var(--im-border);
  border-radius: var(--im-radius-md); padding: 16px 20px;
  margin-bottom: 14px; box-shadow: var(--im-shadow-sm);
  flex-wrap: wrap;
}
.im-result-header__thumb-wrap {
  width: 72px; height: 72px; border-radius: 10px; overflow: hidden;
  border: 1px solid var(--im-border); flex-shrink: 0;
  background: var(--im-bg);
}
.im-result-header__thumb { width: 100%; height: 100%; object-fit: cover; display: block; }
.im-result-header__info { flex: 1; min-width: 0; }
.im-result-header__name {
  font-size: 0.9375rem; font-weight: 700;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px;
}
.im-result-header__meta { font-size: 0.8125rem; color: var(--im-text-muted); }
.im-result-header__export { display: flex; gap: 6px; flex-wrap: wrap; }

.im-export-btn {
  display: inline-flex; align-items: center; gap: 5px;
  height: 32px; padding: 0 12px;
  border: 1.5px solid var(--im-border); border-radius: 8px;
  font-size: 0.8125rem; font-weight: 600; cursor: pointer; background: var(--im-bg);
  color: var(--im-text-muted); transition: all 0.15s;
}
.im-export-btn:hover { border-color: var(--im-amber); color: var(--im-amber); background: var(--im-amber-light); }
.im-export-btn--json:hover { background: #fffbeb; }
.im-export-btn--csv:hover  { background: #f0fdf4; }
.im-export-btn--txt:hover  { background: #eff6ff; }

/* ══ 分类卡片 ════════════════════════════════════ */
.im-sections-wrap { display: flex; flex-direction: column; gap: 10px; }

.im-section-card {
  background: var(--im-surface); border: 1px solid var(--im-border);
  border-radius: var(--im-radius-md); overflow: hidden;
  box-shadow: var(--im-shadow-sm);
}
.im-section-card__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px; cursor: pointer; user-select: none;
  transition: background 0.15s;
}
.im-section-card__header:hover { background: var(--im-bg); }
.im-section-card--open .im-section-card__header { background: var(--im-amber-light); }
.im-section-card__title { font-size: 0.9375rem; font-weight: 700; }
.im-section-chevron {
  flex-shrink: 0; transition: transform 0.2s; color: var(--im-text-muted);
}
.im-section-card--open .im-section-chevron { transform: rotate(180deg); color: var(--im-amber); }
.im-section-card__header-actions { display: flex; align-items: center; gap: 8px; }
.im-raw-copy-btn {
  height: 26px; padding: 0 10px; background: var(--im-bg);
  border: 1px solid var(--im-border); border-radius: 6px;
  font-size: 0.75rem; font-weight: 600; cursor: pointer; color: var(--im-text-muted);
  pointer-events: all;
}
.im-raw-copy-btn:hover { border-color: var(--im-amber); color: var(--im-amber); }
.im-section-card__body {
  max-height: 0; overflow: hidden; transition: max-height 0.35s ease;
}
.im-section-card--open .im-section-card__body { max-height: 2000px; }

/* 字段表格 */
.im-field-table { width: 100%; border-collapse: collapse; }
.im-field-row {
  display: grid; grid-template-columns: 160px 1fr auto;
  align-items: center; gap: 12px; padding: 10px 18px;
  border-top: 1px solid var(--im-border);
  transition: background 0.1s;
}
.im-field-row:hover { background: var(--im-bg); }
.im-field-label {
  font-size: 0.8125rem; font-weight: 600; color: var(--im-text-muted);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.im-field-value {
  font-size: 0.875rem; color: var(--im-text); word-break: break-all;
  font-family: 'SF Mono', 'Fira Code', monospace;
}
.im-field-value--highlight { color: var(--im-amber); font-weight: 700; }
.im-copy-field-btn {
  width: 28px; height: 28px; background: transparent;
  border: 1px solid transparent; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--im-text-muted); font-size: 0.75rem;
  transition: all 0.15s; flex-shrink: 0;
}
.im-copy-field-btn:hover { border-color: var(--im-border); background: var(--im-bg); }
.im-copy-field-btn--copied { color: #16a34a; }

/* 无数据状态 */
.im-no-data {
  padding: 24px 18px; text-align: center;
  font-size: 0.875rem; color: var(--im-text-muted); font-style: italic;
}

/* GPS 地图 */
.im-gps-map-wrap {
  margin: 10px 18px 16px;
  border-radius: 10px; overflow: hidden;
  border: 1px solid var(--im-border); aspect-ratio: 16/9;
}
.im-gps-map-wrap iframe {
  width: 100%; height: 100%; border: none; display: block;
}
.im-gps-map-actions {
  display: flex; gap: 8px; padding: 0 18px 14px;
}
.im-gps-action-btn {
  height: 30px; padding: 0 12px; background: var(--im-bg);
  border: 1px solid var(--im-border); border-radius: 8px;
  font-size: 0.75rem; font-weight: 600; cursor: pointer; color: var(--im-text-muted);
  transition: all 0.15s; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;
}
.im-gps-action-btn:hover { border-color: var(--im-amber); color: var(--im-amber); }

/* 原始 JSON */
.im-raw-pre {
  margin: 10px 18px 16px; padding: 16px;
  background: #1e1e2e; color: #cdd6f4; border-radius: 10px;
  font-family: 'SF Mono', 'Fira Code', monospace; font-size: 0.8125rem;
  line-height: 1.6; overflow-x: auto; max-height: 400px; overflow-y: auto;
  white-space: pre-wrap; word-break: break-all;
}

/* 空状态 */
.im-empty-state {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 12px;
  padding: 60px 20px; color: var(--im-text-muted);
  background: var(--im-surface); border: 1px dashed var(--im-border);
  border-radius: var(--im-radius-md);
}
.im-empty-state__icon { font-size: 2.5rem; opacity: 0.4; }

/* 批量导出 */
.im-bulk-export {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 0; margin-top: 8px;
}
.im-btn-download-all {
  height: 44px; padding: 0 24px;
  background: linear-gradient(135deg, var(--im-amber), var(--im-amber-dark));
  color: #fff; border: none; border-radius: 11px;
  font-size: 0.9375rem; font-weight: 700; cursor: pointer;
  box-shadow: 0 4px 14px rgba(217,119,6,0.3); transition: opacity 0.15s;
}
.im-btn-download-all:hover { opacity: 0.9; }
.im-btn-clear {
  height: 36px; padding: 0 16px; background: transparent;
  border: 1px solid var(--im-border); border-radius: 9px;
  font-size: 0.8125rem; color: var(--im-text-muted); cursor: pointer;
}
.im-btn-clear:hover { background: #fef2f2; color: #dc2626; border-color: #fecaca; }

/* ══ 三特性 ══════════════════════════════════════ */
.im-features-section {
  background: var(--im-surface); padding: 56px 0; border-top: 1px solid var(--im-border);
}
.im-features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.im-feature-card {
  text-align: center; padding: 32px 24px;
  background: var(--im-bg); border: 1px solid var(--im-border); border-radius: var(--im-radius-md);
}
.im-feature-icon {
  width: 56px; height: 56px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem; margin: 0 auto 14px;
}
.im-feature-card h3 { font-size: 1rem; font-weight: 700; margin-bottom: 8px; }
.im-feature-card p  { font-size: 0.875rem; color: var(--im-text-muted); line-height: 1.65; }

/* ══ FAQ ═════════════════════════════════════════ */
.im-faq-section { padding: 56px 0; }
.im-faq-list { max-width: 700px; margin: 0 auto; display: flex; flex-direction: column; gap: 8px; }
.im-faq-item {
  background: var(--im-surface); border: 1px solid var(--im-border);
  border-radius: var(--im-radius-sm); overflow: hidden;
}
.im-faq-question {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; background: none; border: none; text-align: left;
  font-size: 0.9375rem; font-weight: 600; cursor: pointer; gap: 12px;
}
.im-faq-chevron { flex-shrink: 0; transition: transform 0.2s; color: var(--im-text-muted); }
.im-faq-item--open .im-faq-chevron { transform: rotate(180deg); color: var(--im-amber); }
.im-faq-answer { max-height: 0; overflow: hidden; transition: max-height 0.3s ease; }
.im-faq-item--open .im-faq-answer { max-height: 400px; }
.im-faq-answer p { padding: 0 20px 16px; font-size: 0.875rem; color: var(--im-text-muted); line-height: 1.7; }

/* ══ Toast ═══════════════════════════════════════ */
#toastContainer {
  position: fixed; bottom: 24px; right: 24px; z-index: 9999;
  display: flex; flex-direction: column; gap: 8px;
}
.im-toast {
  padding: 12px 18px; border-radius: 10px; font-size: 0.875rem; font-weight: 500;
  color: #fff; box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  opacity: 0; transform: translateX(20px); transition: opacity 0.25s, transform 0.25s; max-width: 300px;
}
.im-toast--show    { opacity: 1; transform: translateX(0); }
.im-toast--success { background: #16a34a; }
.im-toast--error   { background: #dc2626; }
.im-toast--info    { background: #374151; }

/* ══ 响应式 ══════════════════════════════════════ */
@media (max-width: 960px) {
  .im-results-layout { grid-template-columns: 1fr; }
  .im-file-sidebar   { position: static; }
  .im-file-list      { flex-direction: row; overflow-x: auto; flex-wrap: nowrap; padding-bottom: 4px; }
  .im-file-item      { min-width: 160px; }
}
@media (max-width: 768px) {
  .im-hero__title   { font-size: 1.75rem; }
  .im-features-grid { grid-template-columns: 1fr; }
  .im-upload-zone   { padding: 36px 20px; }
  .im-field-row     { grid-template-columns: 120px 1fr auto; }
}
@media (max-width: 480px) {
  .im-hero__title            { font-size: 1.5rem; }
  .im-result-header          { flex-wrap: wrap; }
  .im-result-header__export  { width: 100%; }
  .im-field-row              { grid-template-columns: 1fr auto; }
  .im-field-label            { display: none; }
}
```

---

## 3. 验收标准

- [ ] 页面琥珀橙主色风格，与其他工具视觉上明显区分
- [ ] 上传区占满容器，元数据图标有 hover 动画
- [ ] 拖拽时边框变橙，背景浅黄
- [ ] 上传后左侧文件列表显示，点击切换右侧内容
- [ ] 六个分类卡片默认折叠，点击展开/收起有动画
- [ ] 移动端文件列表水平滚动，分类卡片正常展开
- [ ] 导出按钮 hover 状态各有不同颜色区分

---

---

# Block M-03 · 图片元数据查看 — 纯前端解析引擎

> **文件**：`/static/js/img-metadata-engine.js`
> **预估工时**：3h
> **核心原则**：文件全程不离开浏览器，使用 exifr.js 解析

---

## 1. 支持的元数据字段映射表

| 分类 | exifr 字段 | 显示标签（中文）| 说明 |
|------|-----------|--------------|------|
| 基础 | `Make` | 相机品牌 | — |
| 基础 | `Model` | 相机型号 | — |
| 基础 | `ImageWidth` / `ExifImageWidth` | 图片宽度 | px |
| 基础 | `ImageHeight` / `ExifImageHeight` | 图片高度 | px |
| 基础 | `ColorSpace` | 色彩空间 | sRGB/Adobe RGB |
| 基础 | `BitsPerSample` | 位深度 | — |
| 基础 | `Orientation` | 方向 | 1~8 转为文字 |
| 相机 | `ExposureTime` | 快门速度 | 转为 1/x 格式 |
| 相机 | `FNumber` | 光圈值 | f/x.x |
| 相机 | `ISOSpeedRatings` | ISO 感光度 | — |
| 相机 | `FocalLength` | 焦距 | mm |
| 相机 | `FocalLengthIn35mmFilm` | 等效焦距 | mm |
| 相机 | `Flash` | 闪光灯 | 0/1 转为文字 |
| 相机 | `WhiteBalance` | 白平衡 | 0=自动 1=手动 |
| 相机 | `MeteringMode` | 测光模式 | 数字转文字 |
| 相机 | `ExposureMode` | 曝光模式 | 0=自动 1=手动 |
| 相机 | `ExposureBiasValue` | 曝光补偿 | EV |
| 相机 | `LensModel` | 镜头型号 | — |
| 相机 | `DateTime` / `DateTimeOriginal` | 拍摄时间 | 格式化 |
| GPS | `GPSLatitude` | 纬度 | 十进制 |
| GPS | `GPSLongitude` | 经度 | 十进制 |
| GPS | `GPSAltitude` | 海拔 | 米 |
| GPS | `GPSImgDirection` | 拍摄方向 | 度 |
| GPS | `GPSSpeed` | GPS 速度 | km/h |
| IPTC | `Copyright` | 版权 | — |
| IPTC | `Artist` / `Creator` | 作者 | — |
| IPTC | `ImageDescription` / `Caption` | 图片说明 | — |
| IPTC | `Keywords` | 关键词 | 数组转逗号分隔 |
| IPTC | `Credit` | 来源 | — |
| IPTC | `Source` | 信息来源 | — |
| XMP | `Rating` | 评级 | 星级 ⭐ |
| XMP | `Software` | 处理软件 | — |
| XMP | `CreatorTool` | 创建工具 | — |
| XMP | `Label` | 标签颜色 | — |

---

## 2. 核心引擎代码（`/static/js/img-metadata-engine.js`）

```javascript
'use strict';

/* ═══════════════════════════════════════════════
   全局状态
═══════════════════════════════════════════════ */
const IMState = {
  files:         [],    // 原始 File 对象
  results:       {},    // { fileId: ParsedResult }
  activeId:      null,  // 当前显示的文件 ID
};

const IM_MAX_FILES   = 10;
const IM_MAX_SIZE_MB = 20;

/* ═══════════════════════════════════════════════
   文件校验 & 入队
═══════════════════════════════════════════════ */
function addFiles(fileList) {
  const allowed = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
    'image/tiff', 'image/heic', 'image/heif',
  ];
  let added = 0;

  for (const file of Array.from(fileList)) {
    if (IMState.files.length >= IM_MAX_FILES) {
      showToast(`最多同时分析 ${IM_MAX_FILES} 张图片`, 'error'); break;
    }
    const typeOk = allowed.includes(file.type) ||
      /\.(jpe?g|png|webp|tiff?|heic|heif)$/i.test(file.name);
    if (!typeOk) {
      showToast(`${file.name}：不支持的格式`, 'error'); continue;
    }
    if (file.size > IM_MAX_SIZE_MB * 1024 * 1024) {
      showToast(`${file.name} 超过 ${IM_MAX_SIZE_MB}MB 限制`, 'error'); continue;
    }
    const key = `${file.name}-${file.size}`;
    if (IMState.files.some(f => `${f.name}-${f.size}` === key)) continue;

    file._imId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    IMState.files.push(file);
    added++;
  }

  if (added > 0) processNewFiles();
}

/* ═══════════════════════════════════════════════
   处理新加入的文件（串行队列）
═══════════════════════════════════════════════ */
async function processNewFiles() {
  showResultsSection();

  const pending = IMState.files.filter(f => !IMState.results[f._imId]);

  for (const file of pending) {
    addFileItem(file, 'processing');
    try {
      const result = await parseMetadata(file);
      IMState.results[file._imId] = result;
      updateFileItem(file._imId, 'done');
      if (!IMState.activeId) selectFile(file._imId);
    } catch (err) {
      IMState.results[file._imId] = { error: err.message, file };
      updateFileItem(file._imId, 'error');
    }
  }
}

/* ═══════════════════════════════════════════════
   核心解析：exifr.js
═══════════════════════════════════════════════ */
async function parseMetadata(file) {
  // exifr 解析选项：读取所有段
  const options = {
    tiff: true, exif: true, gps: true, iptc: true, xmp: true,
    icc: false, jfif: false, ihdr: false,
    multiSegment: true, mergeOutput: true,
    translateKeys: true, translateValues: true, reviveValues: true,
  };

  let raw = {};
  try {
    raw = await exifr.parse(file, options) || {};
  } catch (e) {
    raw = {};
  }

  // 读取图片原始尺寸
  const dims = await getImageDimensions(file);

  return {
    id:       file._imId,
    file,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type || guessType(file.name),
    width:    dims.w,
    height:   dims.h,
    raw,
    thumbUrl: URL.createObjectURL(file),
    sections: buildSections(file, dims, raw),
  };
}

/* ═══════════════════════════════════════════════
   构建五大分类数据
═══════════════════════════════════════════════ */
function buildSections(file, dims, raw) {
  return {
    basic:  buildBasic(file, dims, raw),
    camera: buildCamera(raw),
    gps:    buildGPS(raw),
    iptc:   buildIPTC(raw),
    xmp:    buildXMP(raw),
  };
}

function buildBasic(file, dims, raw) {
  const fields = [];
  push(fields, '文件名',    file.name);
  push(fields, '文件大小',  formatFileSize(file.size));
  push(fields, '文件类型',  file.type || guessType(file.name));
  if (dims.w && dims.h) {
    push(fields, '图片尺寸', `${dims.w} × ${dims.h} px`, true);
  }
  push(fields, '色彩空间',  raw.ColorSpace === 1 ? 'sRGB' : (raw.ColorSpace === 65535 ? 'Uncalibrated' : raw.ColorSpace));
  push(fields, '位深度',    raw.BitsPerSample ? `${raw.BitsPerSample} bit` : null);
  push(fields, '方向',      formatOrientation(raw.Orientation));
  push(fields, '相机品牌',  raw.Make);
  push(fields, '相机型号',  raw.Model);
  push(fields, '拍摄时间',  formatDate(raw.DateTimeOriginal || raw.DateTime));
  return fields;
}

function buildCamera(raw) {
  const fields = [];
  push(fields, '快门速度',  formatShutter(raw.ExposureTime));
  push(fields, '光圈值',    raw.FNumber ? `f/${raw.FNumber.toFixed(1)}` : null, true);
  push(fields, 'ISO 感光度', raw.ISOSpeedRatings ? String(raw.ISOSpeedRatings) : null, true);
  push(fields, '焦距',      raw.FocalLength ? `${raw.FocalLength} mm` : null);
  push(fields, '等效焦距',  raw.FocalLengthIn35mmFilm ? `${raw.FocalLengthIn35mmFilm} mm` : null);
  push(fields, '镜头型号',  raw.LensModel || raw.LensID);
  push(fields, '闪光灯',    formatFlash(raw.Flash));
  push(fields, '白平衡',    formatWhiteBalance(raw.WhiteBalance));
  push(fields, '测光模式',  formatMeteringMode(raw.MeteringMode));
  push(fields, '曝光模式',  formatExposureMode(raw.ExposureMode));
  push(fields, '曝光补偿',  raw.ExposureBiasValue != null ? `${raw.ExposureBiasValue > 0 ? '+' : ''}${raw.ExposureBiasValue} EV` : null);
  push(fields, '软件',      raw.Software);
  return fields;
}

function buildGPS(raw) {
  const fields = [];
  const lat = raw.latitude  || raw.GPSLatitude;
  const lng = raw.longitude || raw.GPSLongitude;
  const alt = raw.GPSAltitude;
  const dir = raw.GPSImgDirection;
  const spd = raw.GPSSpeed;

  push(fields, '纬度',      lat  != null ? lat.toFixed(7) : null, true);
  push(fields, '经度',      lng  != null ? lng.toFixed(7) : null, true);
  push(fields, '海拔',      alt  != null ? `${alt.toFixed(1)} m` : null);
  push(fields, '拍摄方向',  dir  != null ? `${dir.toFixed(1)}°` : null);
  push(fields, 'GPS 速度',  spd  != null ? `${spd.toFixed(1)} km/h` : null);

  return { fields, lat, lng };
}

function buildIPTC(raw) {
  const fields = [];
  push(fields, '版权',      raw.Copyright);
  push(fields, '作者',      raw.Artist || raw['Creator'] || raw.By_line);
  push(fields, '图片说明',  raw.ImageDescription || raw.Caption || raw['Caption-Abstract']);
  push(fields, '关键词',    Array.isArray(raw.Keywords) ? raw.Keywords.join(', ') : raw.Keywords);
  push(fields, '来源',      raw.Credit);
  push(fields, '信息来源',  raw.Source);
  push(fields, '城市',      raw.City);
  push(fields, '省/州',     raw['Province-State']);
  push(fields, '国家',      raw.Country || raw['Country-PrimaryLocationName']);
  push(fields, '类别',      raw.Category);
  return fields;
}

function buildXMP(raw) {
  const fields = [];
  const rating = raw.Rating || raw['xmp:Rating'];
  push(fields, '评级',      rating != null ? '⭐'.repeat(Math.max(0, Math.min(5, parseInt(rating)))) + ` (${rating})` : null);
  push(fields, '创建工具',  raw.CreatorTool || raw['xmp:CreatorTool']);
  push(fields, '修改工具',  raw.HistorySoftwareAgent);
  push(fields, '标签颜色',  raw.Label || raw['xmp:Label']);
  push(fields, 'DPI（水平）', raw.XResolution ? `${raw.XResolution} DPI` : null);
  push(fields, 'DPI（垂直）', raw.YResolution ? `${raw.YResolution} DPI` : null);
  push(fields, '色彩配置文件', raw.ProfileDescription);
  return fields;
}

/* ═══════════════════════════════════════════════
   字段 push 工具
═══════════════════════════════════════════════ */
function push(arr, label, value, highlight = false) {
  if (value == null || value === '' || value === undefined) return;
  arr.push({ label, value: String(value), highlight });
}

/* ═══════════════════════════════════════════════
   格式化工具函数
═══════════════════════════════════════════════ */
function getImageDimensions(file) {
  return new Promise(resolve => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload  = () => { URL.revokeObjectURL(url); resolve({ w: img.naturalWidth, h: img.naturalHeight }); };
    img.onerror = () => { URL.revokeObjectURL(url); resolve({ w: null, h: null }); };
    img.src = url;
  });
}

function formatShutter(val) {
  if (val == null) return null;
  if (val >= 1) return `${val}s`;
  return `1/${Math.round(1 / val)}s`;
}

function formatDate(val) {
  if (!val) return null;
  if (val instanceof Date) {
    return val.toLocaleString('zh-CN', { hour12: false });
  }
  // EXIF 格式: "2023:06:15 14:30:00"
  if (typeof val === 'string') {
    return val.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1/$2/$3');
  }
  return String(val);
}

function formatOrientation(val) {
  const map = {
    1: '正常', 2: '水平翻转', 3: '旋转 180°', 4: '垂直翻转',
    5: '顺时针 90° + 水平翻转', 6: '顺时针 90°',
    7: '逆时针 90° + 水平翻转', 8: '逆时针 90°',
  };
  return val ? (map[val] || `值 ${val}`) : null;
}

function formatFlash(val) {
  if (val == null) return null;
  return (val & 0x1) ? '已闪光' : '未闪光';
}

function formatWhiteBalance(val) {
  if (val == null) return null;
  return val === 0 ? '自动' : (val === 1 ? '手动' : `值 ${val}`);
}

function formatMeteringMode(val) {
  const map = { 0:'未知', 1:'平均', 2:'中央重点', 3:'点测光', 4:'多点', 5:'多分区', 6:'局部' };
  return val != null ? (map[val] || `值 ${val}`) : null;
}

function formatExposureMode(val) {
  const map = { 0:'自动曝光', 1:'手动曝光', 2:'自动包围曝光' };
  return val != null ? (map[val] || `值 ${val}`) : null;
}

function guessType(filename) {
  const ext = filename.split('.').pop()?.toLowerCase();
  const map = { jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png',
                webp:'image/webp', tif:'image/tiff', tiff:'image/tiff',
                heic:'image/heic', heif:'image/heif' };
  return map[ext] || 'image/*';
}

function formatFileSize(bytes) {
  if (!bytes)              return '0 B';
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/* ═══════════════════════════════════════════════
   导出：JSON / CSV / TXT
═══════════════════════════════════════════════ */
function exportData(format) {
  const result = IMState.results[IMState.activeId];
  if (!result || result.error) { showToast('无可导出的数据', 'info'); return; }

  const base = result.fileName.replace(/\.[^.]+$/, '');

  if (format === 'json') {
    const blob = new Blob([JSON.stringify(result.raw, null, 2)], { type: 'application/json' });
    saveAs(blob, `${base}-metadata.json`);

  } else if (format === 'csv') {
    const rows = [['Category', 'Field', 'Value']];
    const { basic, camera, gps, iptc, xmp } = result.sections;
    const allSections = [
      ['Basic',  basic ],
      ['Camera', camera],
      ['GPS',    Array.isArray(gps) ? gps : gps.fields],
      ['IPTC',   iptc  ],
      ['XMP',    xmp   ],
    ];
    for (const [cat, fields] of allSections) {
      if (!fields) continue;
      for (const f of fields) {
        rows.push([cat, f.label, `"${f.value.replace(/"/g, '""')}"`]);
      }
    }
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `${base}-metadata.csv`);

  } else if (format === 'txt') {
    const lines = [
      `图片元数据报告`,
      `文件：${result.fileName}`,
      `生成时间：${new Date().toLocaleString('zh-CN')}`,
      '═'.repeat(50),
      '',
    ];
    const sectionNames = { basic:'基础信息', camera:'相机参数', gps:'GPS 位置', iptc:'版权信息（IPTC）', xmp:'XMP 数据' };
    for (const [key, name] of Object.entries(sectionNames)) {
      let fields = result.sections[key];
      if (key === 'gps') fields = fields.fields;
      if (!fields || fields.length === 0) continue;
      lines.push(`【${name}】`);
      for (const f of fields) {
        lines.push(`  ${f.label.padEnd(14)}${f.value}`);
      }
      lines.push('');
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `${base}-metadata.txt`);
  }

  showToast(`已导出 ${format.toUpperCase()}`, 'success');
}

/* ═══════════════════════════════════════════════
   批量 ZIP 导出
═══════════════════════════════════════════════ */
async function exportAll() {
  const done = Object.values(IMState.results).filter(r => !r.error);
  if (done.length === 0) { showToast('没有可导出的数据', 'info'); return; }

  const btn = document.querySelector('.im-btn-download-all');
  if (btn) { btn.disabled = true; btn.textContent = '打包中...'; }

  try {
    const zip = new JSZip();
    for (const r of done) {
      const base = r.fileName.replace(/\.[^.]+$/, '');
      zip.file(`${base}-metadata.json`, JSON.stringify(r.raw, null, 2));
    }
    const ts = new Date().toISOString().slice(0, 10);
    const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE',
      compressionOptions: { level: 1 } });
    saveAs(zipBlob, `image-metadata-${ts}.zip`);
    showToast(`已打包 ${done.length} 张图片的元数据`, 'success');
  } catch (err) {
    showToast('打包失败：' + err.message, 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '⬇ 打包下载全部（ZIP）'; }
  }
}

/* ═══════════════════════════════════════════════
   清空
═══════════════════════════════════════════════ */
function clearAll() {
  for (const r of Object.values(IMState.results)) {
    if (r.thumbUrl) URL.revokeObjectURL(r.thumbUrl);
  }
  IMState.files = []; IMState.results = {}; IMState.activeId = null;
  document.getElementById('fileList').innerHTML       = '';
  document.getElementById('resultsSection').style.display = 'none';
  document.getElementById('bulkExport').style.display     = 'none';
  showToast('已清空全部', 'info');
}

/* ═══════════════════════════════════════════════
   Toast
═══════════════════════════════════════════════ */
function showToast(msg, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const el = document.createElement('div');
  el.className   = `im-toast im-toast--${type}`;
  el.textContent = msg;
  container.appendChild(el);
  requestAnimationFrame(() => el.classList.add('im-toast--show'));
  setTimeout(() => {
    el.classList.remove('im-toast--show');
    setTimeout(() => el.remove(), 300);
  }, 3500);
}
```

---

## 3. 验收标准

- [ ] 上传 iPhone 拍摄的 JPG，能解析出 GPS 经纬度、相机型号、快门速度、ISO
- [ ] 上传从微信转发的 JPG，`raw` 对象为空或字段极少（元数据已被清除），不报错
- [ ] 上传 PNG 截图，能解析出基础信息（宽高、色彩空间），GPS/IPTC 显示「未找到数据」
- [ ] 上传 10 张图片，逐个解析，不卡死，文件列表逐一更新状态
- [ ] 导出 JSON：文件为有效 JSON，可在浏览器中打开
- [ ] 导出 CSV：UTF-8 BOM，Excel 打开中文不乱码，有表头
- [ ] 导出 TXT：格式整齐，字段对齐
- [ ] ZIP：包含所有 done 状态图片的 JSON 文件

---

---

# Block M-04 · 图片元数据查看 — 结果展示 UI + 地图预览

> **文件**：`/static/js/img-metadata-ui.js`
> **预估工时**：2h
> **依赖**：M-03（引擎）、M-02（页面结构）
> **交付粒度**：文件列表 UI、分类卡片渲染、GPS 地图 iframe、字段复制、FAQ 折叠

---

## 1. UI 交互 JS（`/static/js/img-metadata-ui.js`）

```javascript
'use strict';

/* ══════════════════════════════════════════════
   拖拽上传事件
════════════════════════════════════════════════ */
function onDragOver(e) {
  e.preventDefault(); e.stopPropagation();
  document.getElementById('uploadZone').classList.add('im-upload-zone--dragover');
}

function onDragLeave(e) {
  if (!e.currentTarget.contains(e.relatedTarget)) {
    document.getElementById('uploadZone').classList.remove('im-upload-zone--dragover');
  }
}

function onDrop(e) {
  e.preventDefault(); e.stopPropagation();
  document.getElementById('uploadZone').classList.remove('im-upload-zone--dragover');
  if (e.dataTransfer?.files?.length > 0) addFiles(e.dataTransfer.files);
}

function onFileSelect(input) {
  if (input.files?.length > 0) { addFiles(input.files); input.value = ''; }
}

/* ── 显示结果区 ────────────────────────────── */
function showResultsSection() {
  const sec = document.getElementById('resultsSection');
  sec.style.display = 'block';
  sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.getElementById('bulkExport').style.display = 'flex';
}

/* ══════════════════════════════════════════════
   文件列表
════════════════════════════════════════════════ */
function addFileItem(file, status) {
  const list = document.getElementById('fileList');
  const item = document.createElement('div');
  item.className = `im-file-item`;
  item.id        = `im-file-item-${file._imId}`;
  item.onclick   = () => selectFile(file._imId);

  const thumbSrc = URL.createObjectURL(file);

  item.innerHTML = `
    <img class="im-file-item__thumb" src="${thumbSrc}"
         onload="URL.revokeObjectURL(this.src)" alt="">
    <div class="im-file-item__info">
      <p class="im-file-item__name" title="${escapeHtml(file.name)}">${escapeHtml(file.name)}</p>
      <p class="im-file-item__size">${formatFileSize(file.size)}</p>
    </div>
    <div class="im-file-item__status im-file-item__status--${status}"
         id="im-status-${file._imId}"></div>
  `;

  list.appendChild(item);
}

function updateFileItem(id, status) {
  const statusDot = document.getElementById(`im-status-${id}`);
  if (statusDot) {
    statusDot.className = `im-file-item__status im-file-item__status--${status}`;
  }
}

function selectFile(id) {
  IMState.activeId = id;

  // 更新文件列表激活状态
  document.querySelectorAll('.im-file-item').forEach(item => {
    item.classList.remove('im-file-item--active');
  });
  const activeItem = document.getElementById(`im-file-item-${id}`);
  if (activeItem) activeItem.classList.add('im-file-item--active');

  // 渲染右侧详情
  renderMetadataDetail(id);
}

/* ══════════════════════════════════════════════
   元数据详情渲染
════════════════════════════════════════════════ */
function renderMetadataDetail(id) {
  const result = IMState.results[id];

  // 显示/隐藏空状态
  document.getElementById('emptyState').style.display   = result ? 'none' : 'flex';
  document.getElementById('resultHeader').style.display = result && !result.error ? 'flex' : 'none';
  document.getElementById('sectionsWrap').style.display = result && !result.error ? 'flex' : 'none';

  if (!result || result.error) return;

  // 顶部文件信息
  const thumb = document.getElementById('resultThumb');
  thumb.src = result.thumbUrl;
  document.getElementById('resultName').textContent = result.fileName;
  document.getElementById('resultMeta').textContent =
    `${result.width ? result.width + ' × ' + result.height + ' px  ·  ' : ''}${formatFileSize(result.fileSize)}  ·  ${result.fileType}`;

  // 渲染六个分类
  renderBasic(result);
  renderCamera(result);
  renderGPS(result);
  renderIPTC(result);
  renderXMP(result);
  renderRaw(result);

  // 默认展开基础信息和相机参数
  ['sectionBasic', 'sectionCamera'].forEach(id => {
    const card = document.getElementById(id);
    if (card && !card.classList.contains('im-section-card--open')) {
      card.classList.add('im-section-card--open');
    }
  });
}

/* ── 渲染通用字段表格 ──────────────────────── */
function renderFieldTable(bodyId, fields, emptyMsg = '未找到此类数据') {
  const body = document.getElementById(bodyId);
  if (!body) return;

  if (!fields || fields.length === 0) {
    body.innerHTML = `<div class="im-no-data">${emptyMsg}</div>`;
    return;
  }

  body.innerHTML = fields.map(f => `
    <div class="im-field-row">
      <span class="im-field-label">${escapeHtml(f.label)}</span>
      <span class="im-field-value ${f.highlight ? 'im-field-value--highlight' : ''}">
        ${escapeHtml(f.value)}
      </span>
      <button class="im-copy-field-btn" title="复制"
              onclick="copyField(this, '${escapeAttr(f.value)}')">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
      </button>
    </div>
  `).join('');
}

function renderBasic(result) {
  renderFieldTable('bodyBasic', result.sections.basic);
}

function renderCamera(result) {
  renderFieldTable('bodyCamera', result.sections.camera, '未找到相机参数数据');
}

function renderGPS(result) {
  const gps  = result.sections.gps;
  const body = document.getElementById('bodyGPS');
  if (!body) return;

  if (!gps.fields || gps.fields.length === 0) {
    body.innerHTML = `<div class="im-no-data">此图片不含 GPS 信息</div>`;
    return;
  }

  // 字段表格 + 地图
  const tableHtml = gps.fields.map(f => `
    <div class="im-field-row">
      <span class="im-field-label">${escapeHtml(f.label)}</span>
      <span class="im-field-value im-field-value--highlight">${escapeHtml(f.value)}</span>
      <button class="im-copy-field-btn" onclick="copyField(this, '${escapeAttr(f.value)}')">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
      </button>
    </div>
  `).join('');

  // OpenStreetMap iframe（仅 lat/lng 均存在时）
  let mapHtml = '';
  if (gps.lat != null && gps.lng != null) {
    const lat  = gps.lat.toFixed(6);
    const lng  = gps.lng.toFixed(6);
    const zoom = 14;
    const osmSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(lng)-0.01},${parseFloat(lat)-0.01},${parseFloat(lng)+0.01},${parseFloat(lat)+0.01}&layer=mapnik&marker=${lat},${lng}`;
    const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`;
    mapHtml = `
      <div class="im-gps-map-wrap">
        <iframe src="${osmSrc}" title="拍摄地点地图" loading="lazy"
                allow="geolocation 'none'"></iframe>
      </div>
      <div class="im-gps-map-actions">
        <a class="im-gps-action-btn" href="${osmUrl}" target="_blank" rel="noopener">
          🗺 在 OpenStreetMap 中打开
        </a>
        <button class="im-gps-action-btn"
                onclick="copyField(this, '${lat}, ${lng}')">
          📋 复制坐标
        </button>
      </div>
    `;
  }

  body.innerHTML = tableHtml + mapHtml;
}

function renderIPTC(result) {
  renderFieldTable('bodyIPTC', result.sections.iptc, '未找到 IPTC 版权数据');
}

function renderXMP(result) {
  renderFieldTable('bodyXMP', result.sections.xmp, '未找到 XMP 数据');
}

function renderRaw(result) {
  const pre = document.getElementById('rawJsonPre');
  if (!pre) return;
  const cleaned = cleanRawForDisplay(result.raw);
  pre.textContent = JSON.stringify(cleaned, null, 2);
}

/* 原始数据：过滤超大二进制字段 */
function cleanRawForDisplay(raw) {
  const result = {};
  for (const [k, v] of Object.entries(raw)) {
    if (v instanceof Uint8Array || v instanceof ArrayBuffer) {
      result[k] = `[Binary ${v.byteLength || v.length} bytes]`;
    } else {
      result[k] = v;
    }
  }
  return result;
}

/* ══════════════════════════════════════════════
   分类卡片折叠
════════════════════════════════════════════════ */
function toggleSection(id) {
  const card = document.getElementById(id);
  if (!card) return;
  card.classList.toggle('im-section-card--open');
}

/* ══════════════════════════════════════════════
   字段复制
════════════════════════════════════════════════ */
function copyField(btn, value) {
  navigator.clipboard.writeText(value).then(() => {
    btn.classList.add('im-copy-field-btn--copied');
    btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
    setTimeout(() => {
      btn.classList.remove('im-copy-field-btn--copied');
      btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2">
        <rect x="9" y="9" width="13" height="13" rx="2"/>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
      </svg>`;
    }, 2000);
  }).catch(() => showToast('复制失败', 'error'));
}

function copyRawData(e) {
  e.stopPropagation();
  const result = IMState.results[IMState.activeId];
  if (!result) return;
  navigator.clipboard.writeText(JSON.stringify(result.raw, null, 2)).then(() => {
    showToast('已复制全部 JSON', 'success');
  });
}

/* ══════════════════════════════════════════════
   FAQ
════════════════════════════════════════════════ */
function toggleFAQ(id) {
  const item   = document.getElementById(id);
  const isOpen = item.classList.contains('im-faq-item--open');
  document.querySelectorAll('.im-faq-item--open')
    .forEach(i => i.classList.remove('im-faq-item--open'));
  if (!isOpen) item.classList.add('im-faq-item--open');
}

/* ══════════════════════════════════════════════
   工具函数
════════════════════════════════════════════════ */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  return String(str).replace(/'/g, '&#39;').replace(/"/g, '&quot;');
}
```

---

## 2. 完整数据流

```
onFileSelect / onDrop
    ↓
addFiles(fileList)               ← 格式/大小/数量/去重校验
    ↓
IMState.files.push()
processNewFiles()                ← 逐个解析
    ├─ addFileItem({status:'processing'})
    ├─ parseMetadata(file)       ← exifr.js 解析全段
    │   ├─ exifr.parse(file, options)
    │   ├─ getImageDimensions(file)
    │   └─ buildSections()      ← 组装五大分类
    ├─ IMState.results[id] = result
    └─ updateFileItem({status:'done'})
        └─ selectFile(id)       ← 首张自动显示

[用户点击左侧文件列表]
    ↓
selectFile(id)
    └─ renderMetadataDetail(id)
        ├─ 顶部缩略图 + 文件信息 + 导出按钮
        ├─ renderBasic()         ← 字段表格
        ├─ renderCamera()        ← 字段表格
        ├─ renderGPS()           ← 字段表格 + OSM iframe
        ├─ renderIPTC()          ← 字段表格
        ├─ renderXMP()           ← 字段表格
        └─ renderRaw()           ← JSON pre

[用户点击字段复制按钮]
    └─ copyField()               ← navigator.clipboard

[用户点击导出]
    └─ exportData('json'/'csv'/'txt')

[用户点击打包下载全部]
    └─ exportAll()               ← JSZip + FileSaver.saveAs()
```

---

## 3. 验收标准

### 功能正确性
- [ ] iPhone JPG：GPS 纬度/经度显示正确，OpenStreetMap 显示拍摄地点
- [ ] GPS 卡片：「在 OpenStreetMap 中打开」链接跳转到正确坐标
- [ ] 「复制坐标」按钮：格式为 `lat, lng`，点击后 2 秒内图标变勾
- [ ] PNG 截图：GPS/IPTC/XMP 分类显示「未找到」，不报错
- [ ] 分类卡片折叠：点击标题展开/收起，动画流畅
- [ ] 默认展开：基础信息 + 相机参数，其他折叠

### 字段渲染
- [ ] 快门速度：< 1s 显示为 `1/250s`，≥ 1s 显示为 `1.3s`
- [ ] 光圈值：显示为 `f/2.8`（橙色高亮）
- [ ] ISO：橙色高亮
- [ ] 拍摄时间：`2023:06:15 14:30:00` 转为 `2023/06/15 14:30:00`
- [ ] 评级：5 星显示 `⭐⭐⭐⭐⭐ (5)`
- [ ] 二进制字段（如缩略图数据）：显示为 `[Binary 1024 bytes]`，不崩溃

### 文件列表
- [ ] 多图上传后左侧列表逐一显示状态点（橙=处理中，绿=完成，红=失败）
- [ ] 点击文件列表项右侧内容立即切换
- [ ] 移动端文件列表水平滚动，不撑破布局

### 导出
- [ ] JSON：有效 JSON，字段与 exifr 解析结果一致
- [ ] CSV：第一行为表头 `Category,Field,Value`，中文正常（UTF-8 BOM）
- [ ] TXT：分组清晰，字段对齐，包含文件名和生成时间
- [ ] ZIP：包含所有 done 状态图片的 JSON，文件名清晰

### 边界
- [ ] 上传无 EXIF 的 PNG：不崩溃，所有分类显示「未找到」
- [ ] 上传 > 20MB 文件：拒绝并显示 Toast 提示
- [ ] 上传重复文件：静默跳过
- [ ] 清空后重新上传：一切正常，无残留状态
```
