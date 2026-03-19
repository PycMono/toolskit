<!-- color-tools-I-01_路由_SEO_i18n_sitemap_ads_ga.md -->

# Color Tools — 路由 / SEO / i18n / sitemap / 广告 / GA (I-01)

> 工具标识符：`color-tools`
> 子工具前缀：`color-picker` / `color-palette` / `color-wheel` / `color-converter` / `color-contrast` / `color-gradient` / `color-image-picker` / `color-blindness` / `color-names` / `color-mixer` / `color-tailwind` / `color-visualizer`

---

## 1. Go 路由注册

```go
// routes/color.go
package routes

import (
    "github.com/gin-gonic/gin"
    "toolboxnova/handlers/color"
    "toolboxnova/middleware"
)

func RegisterColorRoutes(r *gin.Engine) {
    colorGroup := r.Group("/color")
    colorGroup.Use(middleware.LangDetect())
    colorGroup.Use(middleware.AdsConfig())
    colorGroup.Use(middleware.GAConfig())
    {
        colorGroup.GET("/tools", color.HandleToolsHub)
        colorGroup.GET("/picker", color.HandlePicker)
        colorGroup.GET("/palette", color.HandlePalette)
        colorGroup.GET("/wheel", color.HandleWheel)
        colorGroup.GET("/converter", color.HandleConverter)
        colorGroup.GET("/contrast", color.HandleContrast)
        colorGroup.GET("/gradient", color.HandleGradient)
        colorGroup.GET("/image-picker", color.HandleImagePicker)
        colorGroup.GET("/blindness", color.HandleBlindness)
        colorGroup.GET("/names", color.HandleNames)
        colorGroup.GET("/mixer", color.HandleMixer)
        colorGroup.GET("/tailwind", color.HandleTailwind)
        colorGroup.GET("/visualizer", color.HandleVisualizer)
    }
}
```

---

## 2. 页面 Handler（Hub 页示例）

```go
// handlers/color/hub.go
package color

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

func HandleToolsHub(c *gin.Context) {
    lang := c.GetString("lang")

    seoData := map[string]map[string]string{
        "en": {
            "title":       "Free Online Color Tools — Picker, Palette, Wheel, Converter & More | ToolboxNova",
            "description": "The ultimate free color toolkit. Pick colors, generate palettes, check contrast, create gradients, extract colors from images — all in your browser with zero uploads.",
            "keywords":    "color picker, palette generator, color wheel, hex to rgb, contrast checker, gradient generator, tailwind colors",
            "ogTitle":     "Color Tools Suite — 12 Professional Color Tools in One Place",
            "ogDesc":      "Pick, generate, convert, check and export colors. 100% free, 100% private, 100% browser-based.",
            "canonical":   "https://toolboxnova.com/color/tools",
        },
        "zh": {
            "title":       "免费在线颜色工具 — 拾色器、调色板、色轮、转换器等 | ToolboxNova",
            "description": "最全面的免费颜色工具套件。拾取颜色、生成调色板、检查对比度、创建渐变、从图片提取颜色——全部在浏览器中完成，零上传。",
            "keywords":    "拾色器, 调色板生成器, 色轮, HEX转RGB, 对比度检查, 渐变生成器, Tailwind颜色",
            "ogTitle":     "颜色工具套件 — 12 个专业颜色工具集于一体",
            "ogDesc":      "拾取、生成、转换、检查和导出颜色。100% 免费、100% 隐私、100% 浏览器端处理。",
            "canonical":   "https://toolboxnova.com/color/tools?lang=zh",
        },
    }

    seo := seoData["en"]
    if lang == "zh" { seo = seoData["zh"] }

    faqEN := []map[string]string{
        {"q": "Are my files uploaded to a server?", "a": "Never. All color operations run entirely in your browser using JavaScript. No data leaves your device — your images and color choices are 100% private."},
        {"q": "What color formats are supported?", "a": "We support HEX, RGB, HSL, HSV, CMYK, LAB, LCH, OKLCH, HWB, and XYZ. You can convert between any of these formats instantly."},
        {"q": "What is the APCA contrast algorithm?", "a": "APCA (Accessible Perceptual Contrast Algorithm) is the next-generation contrast standard being developed for WCAG 3.0. It provides more accurate readability predictions than the current WCAG 2.1 contrast ratio."},
        {"q": "Can I export palettes for Figma or Tailwind?", "a": "Yes! Export as CSS variables, SCSS variables, Tailwind config, JSON, ASE (Adobe Swatch Exchange), GPL (GIMP), PNG image, or SVG file."},
        {"q": "How does the palette generator work?", "a": "Press spacebar to generate harmonious palettes based on color theory rules (complementary, triadic, analogous, etc.). Lock colors you like and keep generating until the perfect combination appears."},
    }

    faqZH := []map[string]string{
        {"q": "我的文件会上传到服务器吗？", "a": "绝不会。所有颜色操作完全在您的浏览器中通过 JavaScript 运行，没有数据离开您的设备。"},
        {"q": "支持哪些颜色格式？", "a": "支持 HEX、RGB、HSL、HSV、CMYK、LAB、LCH、OKLCH、HWB 和 XYZ，可即时互转。"},
        {"q": "什么是 APCA 对比度算法？", "a": "APCA 是为 WCAG 3.0 开发的下一代对比度标准，比 WCAG 2.1 提供更准确的可读性预测。"},
        {"q": "可以将调色板导出到 Figma 或 Tailwind 吗？", "a": "当然！支持导出 CSS 变量、SCSS、Tailwind 配置、JSON、ASE、GPL、PNG 或 SVG。"},
        {"q": "调色板生成器如何工作？", "a": "按空格键根据色彩理论规则生成和谐调色板。锁定喜欢的颜色，继续生成直到找到完美组合。"},
    }

    faq := faqEN
    if lang == "zh" { faq = faqZH }

    c.HTML(http.StatusOK, "color/tools.html", gin.H{
        "Lang": lang, "SEO": seo, "FAQ": faq,
        "AdsEnabled": c.GetBool("adsEnabled"), "AdsClientID": c.GetString("adsClientID"),
        "EnableGA": c.GetBool("enableGA"), "GAID": c.GetString("gaID"),
        "ToolName": "color-tools",
    })
}
```

---

## 3. SEO `<head>` 模板

```html
{{ define "extraHead" }}
<title>{{ .SEO.title }}</title>
<meta name="description" content="{{ .SEO.description }}">
<meta name="keywords" content="{{ .SEO.keywords }}">
<meta name="robots" content="index, follow">
<meta name="author" content="ToolboxNova">

<meta property="og:type" content="website">
<meta property="og:site_name" content="ToolboxNova">
<meta property="og:title" content="{{ .SEO.ogTitle }}">
<meta property="og:description" content="{{ .SEO.ogDesc }}">
<meta property="og:url" content="{{ .SEO.canonical }}">
<meta property="og:image" content="https://toolboxnova.com/static/og/color-tools.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="{{ if eq .Lang "zh" }}zh_CN{{ else }}en_US{{ end }}">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{ .SEO.ogTitle }}">
<meta name="twitter:description" content="{{ .SEO.ogDesc }}">
<meta name="twitter:image" content="https://toolboxnova.com/static/og/color-tools.png">

<link rel="canonical" href="{{ .SEO.canonical }}">
<link rel="alternate" hreflang="en" href="https://toolboxnova.com/color/tools?lang=en">
<link rel="alternate" hreflang="zh" href="https://toolboxnova.com/color/tools?lang=zh">
<link rel="alternate" hreflang="x-default" href="https://toolboxnova.com/color/tools">

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "{{ if eq .Lang "zh" }}ToolboxNova 颜色工具{{ else }}ToolboxNova Color Tools{{ end }}",
  "description": "{{ .SEO.description }}",
  "url": "https://toolboxnova.com/color/tools",
  "applicationCategory": "DesignApplication",
  "operatingSystem": "Any (Web Browser)",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "featureList": [
    "Color Picker with 10+ color spaces",
    "Palette Generator with spacebar shortcut",
    "WCAG 2.1 + APCA Contrast Checker",
    "Gradient Generator with OKLCH interpolation",
    "Image Color Picker with K-means clustering",
    "Color Blindness Simulator (8 types)",
    "Tailwind CSS Color Generator"
  ]
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {{ range $i, $item := .FAQ }}{{ if $i }},{{ end }}
    { "@type": "Question", "name": "{{ $item.q }}", "acceptedAnswer": { "@type": "Answer", "text": "{{ $item.a }}" } }
    {{ end }}
  ]
}
</script>

{{ if .AdsEnabled }}
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={{ .AdsClientID }}" crossorigin="anonymous"></script>
{{ end }}

<script defer src="https://cdnjs.cloudflare.com/ajax/libs/chroma-js/2.6.0/chroma.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/colorjs.io@0.5.2/dist/color.global.min.js"></script>
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.3/Sortable.min.js"></script>
{{ end }}
```

---

## 4. 广告接入 & GA 事件追踪

### 4.1 广告位布局（3 个标准位 + SDK）

```html
{{/* ① extraHead: 条件加载 AdSense SDK */}}
{{ if .AdsEnabled }}
<script async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={{ .AdsClientID }}"
  crossorigin="anonymous"></script>
{{ end }}

{{/* ② 顶部横幅（Hero 下方） */}}
{{- template "partials/ad_slot.html" dict
    "SlotID" "color-tools-top" "Size" "728x90" "Mobile" "320x50"
    "ClientID" .AdsClientID "Enabled" .AdsEnabled }}

{{/* ③ 侧边栏（2 列 grid 右列，移动端 display:none） */}}
{{- template "partials/ad_slot.html" dict
    "SlotID" "color-tools-sidebar" "Size" "300x250" "MobileHide" true
    "ClientID" .AdsClientID "Enabled" .AdsEnabled }}

{{/* ④ 底部横幅 */}}
{{- template "partials/ad_slot.html" dict
    "SlotID" "color-tools-bottom" "Size" "728x90" "Mobile" "320x50"
    "ClientID" .AdsClientID "Enabled" .AdsEnabled }}
```

### 4.2 GA 事件追踪

```html
{{ define "extraScript" }}
<script>
(function () {
  var TOOL = 'color-tools';
  gaTrackToolOpen(TOOL, '{{ .Lang }}');

  window.gaTrackSubToolSwitch = function(subTool) {
    gaTrackSettingChange(TOOL, 'sub_tool', subTool);
  };
  window.gaTrackColorPick = function(format, value) {
    gaTrackSettingChange(TOOL, 'color_pick_' + format, value);
  };
  window.gaTrackPaletteGenerate = function(harmony, count) {
    gaTrackProcessDone(TOOL, count, 0);
  };
  window.gaTrackColorCopy = function(format) {
    gaTrackDownload(TOOL, format);
  };
  window.gaTrackPaletteExport = function(fmt, count) {
    gaTrackDownloadAll(TOOL, count);
  };
  window.gaTrackContrastCheck = function(ratio, passed) {
    gaTrackSettingChange(TOOL, 'contrast_result', passed ? 'pass' : 'fail');
  };
  window.gaTrackImageUpload = function(sizeMB) {
    gaTrackUpload(TOOL, 1, sizeMB);
  };
  window.gaTrackColorError = function(errType, errMsg) {
    gaTrackError(TOOL, errType, errMsg);
  };
})();
</script>
{{ end }}
```

### 4.3 三段式 Block 结构

| Block | 放置内容 | 位置 |
|-------|---------|------|
| `extraHead` | AdSense SDK + CDN 依赖 + 所有 SEO meta + JSON-LD | `</head>` 前 |
| `content` | 页面主体 HTML（Hero + 工具区 + 广告位 + FAQ + Toast） | `<main>` 区 |
| `extraScript` | GA 事件函数 + 工具初始化脚本 | `</body>` 前 |

---

## 5. 全量 i18n Key

### 英文 `i18n/en/color-tools.json`

```json
{
  "seo.title": "Free Online Color Tools — Picker, Palette, Wheel, Converter & More | ToolboxNova",
  "seo.description": "The ultimate free color toolkit. Pick colors, generate palettes, check contrast, create gradients — all in your browser.",
  "hero.title": "Color Tools Suite",
  "hero.subtitle": "12 professional color tools. Zero uploads. 100% browser-based.",
  "hero.badge.privacy": "100% Private",
  "hero.badge.free": "Completely Free",
  "hero.badge.tools": "12 Tools",
  "nav.hub": "All Tools",
  "nav.picker": "Color Picker",
  "nav.palette": "Palette Generator",
  "nav.wheel": "Color Wheel",
  "nav.converter": "Color Converter",
  "nav.contrast": "Contrast Checker",
  "nav.gradient": "Gradient Generator",
  "nav.imagePicker": "Image Picker",
  "nav.blindness": "Blindness Simulator",
  "nav.names": "Color Names",
  "nav.mixer": "Color Mixer",
  "nav.tailwind": "Tailwind Colors",
  "nav.visualizer": "Palette Visualizer",
  "picker.title": "Color Picker",
  "picker.subtitle": "Pick any color and get its values in 10+ formats",
  "picker.hexInput": "HEX",
  "picker.rgbInput": "RGB",
  "picker.hslInput": "HSL",
  "picker.hsvInput": "HSV",
  "picker.cmykInput": "CMYK",
  "picker.labInput": "LAB",
  "picker.lchInput": "LCH",
  "picker.oklchInput": "OKLCH",
  "picker.hwbInput": "HWB",
  "picker.xyzInput": "XYZ",
  "picker.copySuccess": "Copied!",
  "palette.title": "Palette Generator",
  "palette.subtitle": "Press Space to generate beautiful color palettes",
  "palette.generate": "Generate",
  "palette.lock": "Lock",
  "palette.unlock": "Unlock",
  "palette.shuffle": "Shuffle",
  "palette.addColor": "Add Color",
  "palette.removeColor": "Remove",
  "palette.dragHint": "Drag to reorder",
  "palette.harmonyLabel": "Harmony Rule",
  "palette.complementary": "Complementary",
  "palette.analogous": "Analogous",
  "palette.triadic": "Triadic",
  "palette.splitComplementary": "Split Complementary",
  "palette.square": "Square",
  "palette.monochromatic": "Monochromatic",
  "palette.random": "Random",
  "palette.colorsCount": "Colors: {count}",
  "palette.shareUrl": "Share URL",
  "palette.urlCopied": "Palette URL copied to clipboard!",
  "wheel.title": "Color Wheel",
  "wheel.subtitle": "Create harmonies based on color theory",
  "wheel.harmony": "Harmony",
  "wheel.baseColor": "Base Color",
  "converter.title": "Color Converter",
  "converter.subtitle": "Convert between 10 color formats instantly",
  "converter.from": "From",
  "converter.to": "To",
  "converter.inputPlaceholder": "Enter color value...",
  "converter.result": "Result",
  "converter.allFormats": "All Formats",
  "converter.swap": "Swap",
  "contrast.title": "Contrast Checker",
  "contrast.subtitle": "Check WCAG 2.1 & APCA accessibility compliance",
  "contrast.foreground": "Text Color",
  "contrast.background": "Background Color",
  "contrast.ratio": "Contrast Ratio",
  "contrast.wcagAA": "WCAG AA",
  "contrast.wcagAAA": "WCAG AAA",
  "contrast.apca": "APCA Score",
  "contrast.pass": "Pass",
  "contrast.fail": "Fail",
  "contrast.largeText": "Large Text (18pt+)",
  "contrast.normalText": "Normal Text",
  "contrast.swap": "Swap Colors",
  "contrast.suggest": "Suggest Fix",
  "gradient.title": "Gradient Generator",
  "gradient.subtitle": "Create gradients with perceptual color interpolation",
  "gradient.stops": "Color Stops",
  "gradient.addStop": "Add Stop",
  "gradient.angle": "Angle",
  "gradient.type": "Type",
  "gradient.linear": "Linear",
  "gradient.radial": "Radial",
  "gradient.conic": "Conic",
  "gradient.colorSpace": "Color Space",
  "gradient.cssOutput": "CSS Code",
  "gradient.copyCss": "Copy CSS",
  "imagepicker.title": "Image Color Picker",
  "imagepicker.subtitle": "Extract colors and palettes from any image",
  "imagepicker.upload": "Drop image here or click to upload",
  "imagepicker.paste": "or paste from clipboard (Ctrl+V)",
  "imagepicker.supported": "Supports JPG, PNG, WebP, SVG — max 10MB",
  "imagepicker.extract": "Extract Palette",
  "imagepicker.pickMode": "Click to pick pixel color",
  "imagepicker.paletteMode": "Auto-extract dominant colors",
  "imagepicker.dominantColors": "Dominant Colors",
  "imagepicker.colorCount": "Number of colors",
  "blindness.title": "Color Blindness Simulator",
  "blindness.subtitle": "See how your colors appear to people with color vision deficiency",
  "blindness.type": "Deficiency Type",
  "blindness.normal": "Normal Vision",
  "blindness.protanopia": "Protanopia (Red-blind)",
  "blindness.deuteranopia": "Deuteranopia (Green-blind)",
  "blindness.tritanopia": "Tritanopia (Blue-blind)",
  "blindness.protanomaly": "Protanomaly (Red-weak)",
  "blindness.deuteranomaly": "Deuteranomaly (Green-weak)",
  "blindness.tritanomaly": "Tritanomaly (Blue-weak)",
  "blindness.achromatopsia": "Achromatopsia (Total color blind)",
  "blindness.simulate": "Simulate",
  "names.title": "Color Names Library",
  "names.subtitle": "Browse 2000+ named colors with search",
  "names.search": "Search color by name or hex code...",
  "names.closest": "Closest Named Color",
  "names.showing": "Showing {count} colors",
  "names.noResults": "No colors match your search",
  "mixer.title": "Color Mixer",
  "mixer.subtitle": "Mix and blend two colors together",
  "mixer.color1": "Color 1",
  "mixer.color2": "Color 2",
  "mixer.ratio": "Mix Ratio",
  "mixer.blend": "Blend",
  "mixer.result": "Result",
  "mixer.mode": "Blend Mode",
  "mixer.additive": "Additive (Light)",
  "mixer.subtractive": "Subtractive (Paint)",
  "mixer.steps": "Intermediate Steps",
  "tailwind.title": "Tailwind CSS Color Generator",
  "tailwind.subtitle": "Generate perfect Tailwind shade scales from any base color",
  "tailwind.baseColor": "Base Color (500)",
  "tailwind.colorName": "Color Name",
  "tailwind.scale": "Shade Scale",
  "tailwind.preview": "UI Preview",
  "tailwind.config": "Tailwind Config",
  "tailwind.copyConfig": "Copy Config",
  "visualizer.title": "Palette Visualizer",
  "visualizer.subtitle": "Preview your color palette on real UI designs",
  "visualizer.template": "UI Template",
  "visualizer.dashboard": "Dashboard",
  "visualizer.landingPage": "Landing Page",
  "visualizer.mobileApp": "Mobile App",
  "visualizer.apply": "Apply Palette",
  "export.title": "Export Palette",
  "export.css": "CSS Variables",
  "export.scss": "SCSS Variables",
  "export.json": "JSON",
  "export.tailwind": "Tailwind Config",
  "export.ase": "Adobe ASE",
  "export.gpl": "GIMP GPL",
  "export.png": "PNG Image",
  "export.svg": "SVG File",
  "export.url": "Share URL",
  "export.copyAll": "Copy All",
  "export.download": "Download",
  "export.close": "Close",
  "error.invalidHex": "Invalid HEX color code",
  "error.invalidRgb": "Invalid RGB value (0-255)",
  "error.fileTooLarge": "File too large (max 10MB)",
  "error.unsupportedFormat": "Unsupported file format",
  "feature.privacy.title": "100% Private",
  "feature.privacy.desc": "All processing happens in your browser. No files uploaded. Your data stays on your device.",
  "feature.speed.title": "Lightning Fast",
  "feature.speed.desc": "Powered by Canvas APIs for instant color processing. No waiting, no loading.",
  "feature.free.title": "Completely Free",
  "feature.free.desc": "All 12 tools free with no limits. No sign-up. No watermarks. No premium locks.",
  "faq.q1": "Are my files uploaded to a server?",
  "faq.a1": "Never. All operations run in your browser. No data leaves your device.",
  "faq.q2": "What color formats are supported?",
  "faq.a2": "HEX, RGB, HSL, HSV, CMYK, LAB, LCH, OKLCH, HWB, and XYZ with instant conversion.",
  "faq.q3": "What is the APCA contrast algorithm?",
  "faq.a3": "APCA is the next-gen contrast standard for WCAG 3.0 with more accurate readability predictions.",
  "faq.q4": "Can I export palettes for Figma or Tailwind?",
  "faq.a4": "Yes! CSS, SCSS, Tailwind config, JSON, ASE, GPL, PNG, and SVG export formats.",
  "faq.q5": "How does the palette generator work?",
  "faq.a5": "Press spacebar for harmonious palettes. Lock favorites and keep generating.",
  "status.processing": "Processing...",
  "status.done": "Done",
  "status.ready": "Ready",
  "toast.copied": "Copied to clipboard!",
  "toast.exported": "Export complete!",
  "toast.error": "Something went wrong",
  "toast.urlCopied": "Share URL copied!",
  "keyboard.hint": "Keyboard shortcuts",
  "keyboard.space": "Space — Generate palette",
  "keyboard.lock": "L — Lock/unlock color",
  "keyboard.left": "← — Adjust hue left",
  "keyboard.right": "→ — Adjust hue right",
  "keyboard.copy": "C — Copy current color",
  "keyboard.delete": "Del — Remove color"
}
```

### 中文 `i18n/zh/color-tools.json`

```json
{
  "seo.title": "免费在线颜色工具 — 拾色器、调色板、色轮、转换器等 | ToolboxNova",
  "seo.description": "最全面的免费颜色工具套件。拾取颜色、生成调色板、检查对比度——全部在浏览器中完成。",
  "hero.title": "颜色工具套件",
  "hero.subtitle": "12 个专业颜色工具，零上传，100% 浏览器端处理。",
  "hero.badge.privacy": "100% 隐私",
  "hero.badge.free": "完全免费",
  "hero.badge.tools": "12 个工具",
  "nav.hub": "全部工具",
  "nav.picker": "拾色器",
  "nav.palette": "调色板生成器",
  "nav.wheel": "色轮",
  "nav.converter": "颜色转换器",
  "nav.contrast": "对比度检查器",
  "nav.gradient": "渐变生成器",
  "nav.imagePicker": "图片取色器",
  "nav.blindness": "色盲模拟器",
  "nav.names": "颜色名称库",
  "nav.mixer": "颜色混合器",
  "nav.tailwind": "Tailwind 颜色",
  "nav.visualizer": "调色板可视化",
  "picker.title": "拾色器",
  "picker.subtitle": "拾取任何颜色，获取 10+ 种格式的色值",
  "picker.hexInput": "HEX",
  "picker.rgbInput": "RGB",
  "picker.hslInput": "HSL",
  "picker.hsvInput": "HSV",
  "picker.cmykInput": "CMYK",
  "picker.labInput": "LAB",
  "picker.lchInput": "LCH",
  "picker.oklchInput": "OKLCH",
  "picker.hwbInput": "HWB",
  "picker.xyzInput": "XYZ",
  "picker.copySuccess": "已复制！",
  "palette.title": "调色板生成器",
  "palette.subtitle": "按空格键生成精美配色方案",
  "palette.generate": "生成",
  "palette.lock": "锁定",
  "palette.unlock": "解锁",
  "palette.shuffle": "打乱",
  "palette.addColor": "添加颜色",
  "palette.removeColor": "移除",
  "palette.dragHint": "拖拽排序",
  "palette.harmonyLabel": "和谐规则",
  "palette.complementary": "互补色",
  "palette.analogous": "类比色",
  "palette.triadic": "三角色",
  "palette.splitComplementary": "分裂互补",
  "palette.square": "方形色",
  "palette.monochromatic": "单色",
  "palette.random": "随机",
  "palette.colorsCount": "颜色数：{count}",
  "palette.shareUrl": "分享链接",
  "palette.urlCopied": "调色板链接已复制！",
  "wheel.title": "色轮",
  "wheel.subtitle": "基于色彩理论创建和谐配色",
  "wheel.harmony": "和谐模式",
  "wheel.baseColor": "基准色",
  "converter.title": "颜色转换器",
  "converter.subtitle": "10 种颜色格式即时互转",
  "converter.from": "从",
  "converter.to": "到",
  "converter.inputPlaceholder": "输入颜色值……",
  "converter.result": "结果",
  "converter.allFormats": "全部格式",
  "converter.swap": "交换",
  "contrast.title": "对比度检查器",
  "contrast.subtitle": "检查 WCAG 2.1 和 APCA 无障碍合规性",
  "contrast.foreground": "文本颜色",
  "contrast.background": "背景颜色",
  "contrast.ratio": "对比度比值",
  "contrast.wcagAA": "WCAG AA",
  "contrast.wcagAAA": "WCAG AAA",
  "contrast.apca": "APCA 分数",
  "contrast.pass": "通过",
  "contrast.fail": "未通过",
  "contrast.largeText": "大号文本 (18pt+)",
  "contrast.normalText": "正常文本",
  "contrast.swap": "交换颜色",
  "contrast.suggest": "建议修复",
  "gradient.title": "渐变生成器",
  "gradient.subtitle": "使用感知色彩插值创建精美渐变",
  "gradient.stops": "色标",
  "gradient.addStop": "添加色标",
  "gradient.angle": "角度",
  "gradient.type": "类型",
  "gradient.linear": "线性",
  "gradient.radial": "径向",
  "gradient.conic": "锥形",
  "gradient.colorSpace": "色彩空间",
  "gradient.cssOutput": "CSS 代码",
  "gradient.copyCss": "复制 CSS",
  "imagepicker.title": "图片取色器",
  "imagepicker.subtitle": "从任何图片中提取颜色和调色板",
  "imagepicker.upload": "拖拽图片到此处或点击上传",
  "imagepicker.paste": "或从剪贴板粘贴（Ctrl+V）",
  "imagepicker.supported": "支持 JPG、PNG、WebP、SVG — 最大 10MB",
  "imagepicker.extract": "提取调色板",
  "imagepicker.pickMode": "点击拾取像素颜色",
  "imagepicker.paletteMode": "自动提取主色调",
  "imagepicker.dominantColors": "主色调",
  "imagepicker.colorCount": "颜色数量",
  "blindness.title": "色盲模拟器",
  "blindness.subtitle": "查看色觉缺陷人群看到的颜色效果",
  "blindness.type": "缺陷类型",
  "blindness.normal": "正常视觉",
  "blindness.protanopia": "红色盲",
  "blindness.deuteranopia": "绿色盲",
  "blindness.tritanopia": "蓝色盲",
  "blindness.protanomaly": "红色弱",
  "blindness.deuteranomaly": "绿色弱",
  "blindness.tritanomaly": "蓝色弱",
  "blindness.achromatopsia": "全色盲",
  "blindness.simulate": "模拟",
  "names.title": "颜色名称库",
  "names.subtitle": "浏览 2000+ 命名颜色，支持搜索",
  "names.search": "按名称或代码搜索颜色……",
  "names.closest": "最接近的命名颜色",
  "names.showing": "显示 {count} 种颜色",
  "names.noResults": "没有匹配的颜色",
  "mixer.title": "颜色混合器",
  "mixer.subtitle": "将两种颜色混合在一起",
  "mixer.color1": "颜色 1",
  "mixer.color2": "颜色 2",
  "mixer.ratio": "混合比例",
  "mixer.blend": "混合",
  "mixer.result": "结果",
  "mixer.mode": "混合模式",
  "mixer.additive": "加色混合（光）",
  "mixer.subtractive": "减色混合（颜料）",
  "mixer.steps": "中间过渡色",
  "tailwind.title": "Tailwind CSS 颜色生成器",
  "tailwind.subtitle": "从任意基准色生成 Tailwind 色阶",
  "tailwind.baseColor": "基准色（500）",
  "tailwind.colorName": "颜色名称",
  "tailwind.scale": "色阶",
  "tailwind.preview": "UI 预览",
  "tailwind.config": "Tailwind 配置",
  "tailwind.copyConfig": "复制配置",
  "visualizer.title": "调色板可视化",
  "visualizer.subtitle": "在真实 UI 设计上预览调色板",
  "visualizer.template": "UI 模板",
  "visualizer.dashboard": "仪表盘",
  "visualizer.landingPage": "落地页",
  "visualizer.mobileApp": "移动应用",
  "visualizer.apply": "应用调色板",
  "export.title": "导出调色板",
  "export.css": "CSS 变量",
  "export.scss": "SCSS 变量",
  "export.json": "JSON",
  "export.tailwind": "Tailwind 配置",
  "export.ase": "Adobe ASE",
  "export.gpl": "GIMP GPL",
  "export.png": "PNG 图片",
  "export.svg": "SVG 文件",
  "export.url": "分享链接",
  "export.copyAll": "全部复制",
  "export.download": "下载",
  "export.close": "关闭",
  "error.invalidHex": "无效的 HEX 颜色代码",
  "error.invalidRgb": "无效的 RGB 值（0-255）",
  "error.fileTooLarge": "文件过大（最大 10MB）",
  "error.unsupportedFormat": "不支持的文件格式",
  "feature.privacy.title": "100% 隐私",
  "feature.privacy.desc": "所有处理在浏览器中完成。无文件上传。数据留在设备上。",
  "feature.speed.title": "极速处理",
  "feature.speed.desc": "基于 Canvas API 即时处理。无等待无加载。",
  "feature.free.title": "完全免费",
  "feature.free.desc": "全部 12 个工具免费无限使用。无需注册。无水印。无付费墙。",
  "faq.q1": "我的文件会上传到服务器吗？",
  "faq.a1": "绝不会。所有操作在浏览器中运行，无数据离开设备。",
  "faq.q2": "支持哪些颜色格式？",
  "faq.a2": "HEX、RGB、HSL、HSV、CMYK、LAB、LCH、OKLCH、HWB、XYZ 即时互转。",
  "faq.q3": "什么是 APCA 对比度算法？",
  "faq.a3": "APCA 是 WCAG 3.0 的下一代对比度标准，提供更准确的可读性预测。",
  "faq.q4": "可以导出到 Figma 或 Tailwind 吗？",
  "faq.a4": "支持 CSS、SCSS、Tailwind 配置、JSON、ASE、GPL、PNG、SVG 导出。",
  "faq.q5": "调色板生成器如何工作？",
  "faq.a5": "按空格键生成和谐调色板，锁定喜欢的颜色继续生成。",
  "status.processing": "处理中……",
  "status.done": "完成",
  "status.ready": "就绪",
  "toast.copied": "已复制到剪贴板！",
  "toast.exported": "导出完成！",
  "toast.error": "出了点问题",
  "toast.urlCopied": "分享链接已复制！",
  "keyboard.hint": "键盘快捷键",
  "keyboard.space": "Space — 生成调色板",
  "keyboard.lock": "L — 锁定/解锁",
  "keyboard.left": "← — 色相左移",
  "keyboard.right": "→ — 色相右移",
  "keyboard.copy": "C — 复制颜色",
  "keyboard.delete": "Del — 移除颜色"
}
```

---

## 6. sitemap 新增条目

```xml
<url>
  <loc>https://toolboxnova.com/color/tools</loc>
  <lastmod>2025-09-15</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>
</url>
<url>
  <loc>https://toolboxnova.com/color/tools?lang=zh</loc>
  <lastmod>2025-09-15</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
<url>
  <loc>https://toolboxnova.com/color/tools?lang=en</loc>
  <lastmod>2025-09-15</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
```

---

## 7. Header 导航新增子项

```html
<!-- partials/header.html 多媒体分类下新增 -->
<li class="nav-dropdown__group" data-category="multimedia">
  <span class="nav-dropdown__group-title">
    <svg class="icon" width="16" height="16"><use href="#icon-palette"/></svg>
    {{ T .Lang "nav.hub" }}
  </span>
  <ul class="nav-dropdown__sublist">
    <li><a href="/color/tools">{{ T .Lang "nav.hub" }}</a></li>
    <li><a href="/color/picker">{{ T .Lang "nav.picker" }}</a></li>
    <li><a href="/color/palette">{{ T .Lang "nav.palette" }}</a></li>
    <li><a href="/color/wheel">{{ T .Lang "nav.wheel" }}</a></li>
    <li><a href="/color/converter">{{ T .Lang "nav.converter" }}</a></li>
    <li><a href="/color/contrast">{{ T .Lang "nav.contrast" }}</a></li>
    <li><a href="/color/gradient">{{ T .Lang "nav.gradient" }}</a></li>
    <li><a href="/color/image-picker">{{ T .Lang "nav.imagePicker" }}</a></li>
    <li><a href="/color/blindness">{{ T .Lang "nav.blindness" }}</a></li>
    <li><a href="/color/names">{{ T .Lang "nav.names" }}</a></li>
    <li><a href="/color/mixer">{{ T .Lang "nav.mixer" }}</a></li>
    <li><a href="/color/tailwind">{{ T .Lang "nav.tailwind" }}</a></li>
    <li><a href="/color/visualizer">{{ T .Lang "nav.visualizer" }}</a></li>
  </ul>
</li>
```

---

## 8. 主页模块新增子项

```html
<!-- index.html 多媒体工具 grid 下 -->
<div class="tool-card" data-category="multimedia">
  <a href="/color/tools" class="tool-card__link">
    <div class="tool-card__icon" style="background:conic-gradient(#ef4444,#f59e0b,#10b981,#3b82f6,#8b5cf6,#ef4444)">
      <svg width="28" height="28"><use href="#icon-palette"/></svg>
    </div>
    <div class="tool-card__body">
      <h3 class="tool-card__title">{{ T .Lang "nav.hub" }}</h3>
      <p class="tool-card__desc">{{ T .Lang "hero.subtitle" }}</p>
    </div>
    <span class="tool-card__badge tool-card__badge--new">12 tools</span>
  </a>
</div>
```
