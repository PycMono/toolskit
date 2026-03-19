# Block A-01 · AI 内容检测器 — 页面路由 / SEO / i18n / Ads

> **所属模块**：AI 内容检测器（/ailab/detector）  
> **竞品参考**：https://gptzero.me  
> **预估工时**：2h  
> **依赖**：项目基础路由已存在  
> **交付粒度**：仅负责路由注册、SEO Meta、i18n Key、广告位插槽、sitemap 条目

---

## 1. 路由注册

```go
// internal/router/router.go
// 在 ailab 分组下新增：
ailab.GET("/detector", handler.AIDetectorPage)

// Handler 骨架（暂时只渲染页面，不含逻辑）
// internal/handler/ailab_detector.go
func AIDetectorPage(c *gin.Context) {
    lang := c.GetString("lang") // 由 i18n 中间件注入
    c.HTML(http.StatusOK, "ailab/detector.html", gin.H{
        "Lang":  lang,
        "Title": i18n.T(lang, "ailab.detector.seo.title"),
        "Desc":  i18n.T(lang, "ailab.detector.seo.desc"),
    })
}
```

---

## 2. SEO Meta（模板内）

```html
<!-- templates/ailab/detector.html <head> 区域 -->

<title>{{ .Title }}</title>
<meta name="description" content="{{ .Desc }}">
<meta name="keywords" content="ai content detector, chatgpt detector, ai text checker, gptzero alternative, detect ai writing, free ai checker">

<!-- Open Graph -->
<meta property="og:title"       content="{{ .Title }}">
<meta property="og:description" content="{{ .Desc }}">
<meta property="og:type"        content="website">
<meta property="og:url"         content="https://devtoolbox.dev/ailab/detector">
<meta property="og:image"       content="https://devtoolbox.dev/static/og/detector.png">

<!-- Twitter Card -->
<meta name="twitter:card"        content="summary_large_image">
<meta name="twitter:title"       content="{{ .Title }}">
<meta name="twitter:description" content="{{ .Desc }}">

<!-- Canonical + hreflang -->
<link rel="canonical" href="https://devtoolbox.dev/ailab/detector">
<link rel="alternate" hreflang="en" href="https://devtoolbox.dev/ailab/detector?lang=en">
<link rel="alternate" hreflang="zh" href="https://devtoolbox.dev/ailab/detector?lang=zh">
<link rel="alternate" hreflang="x-default" href="https://devtoolbox.dev/ailab/detector">

<!-- JSON-LD 结构化数据 -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "AI Content Detector",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "Web",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "description": "Detect AI-generated content from ChatGPT, GPT-4, Gemini, Claude instantly.",
  "url": "https://devtoolbox.dev/ailab/detector"
}
</script>
```

---

## 3. i18n 翻译 Key

### locales/zh.json（新增）

```json
{
  "ailab.detector.seo.title": "免费 AI 内容检测器 — 检测 ChatGPT / Gemini 文本 | DevToolBox",
  "ailab.detector.seo.desc": "精准检测文本是否由 AI 生成，支持 ChatGPT、GPT-4、Gemini、Claude，句级高亮，完全免费。",

  "ailab.detector.name":  "AI 内容检测器",
  "ailab.detector.title": "AI 内容检测器",
  "ailab.detector.desc":  "精准检测文字是否由 AI 生成"
}
```

### i18n/en.json（新增）

```json
{
  "ailab.detector.seo.title": "Free AI Content Detector — Check ChatGPT, Gemini Text | DevToolBox",
  "ailab.detector.seo.desc": "Detect AI-generated content instantly. Identify text from ChatGPT, GPT-4, Gemini, Claude with sentence-level highlighting. Free, no signup.",

  "ailab.detector.name":  "AI Content Detector",
  "ailab.detector.title": "AI Content Detector",
  "ailab.detector.desc":  "Detect if text was written by AI"
}
```

---

## 4. 广告位插槽

```html
<!-- templates/ailab/detector.html -->
<!-- 页面顶部横幅广告（Hero 上方） -->
{{- template "partials/ad_slot.html" dict "SlotID" "detector-top" "Size" "728x90" "Mobile" "320x50" }}

<!-- 右侧结果面板广告（结果面板顶部） -->
{{- template "partials/ad_slot.html" dict "SlotID" "detector-sidebar" "Size" "300x250" }}

<!-- 页面底部横幅广告 -->
{{- template "partials/ad_slot.html" dict "SlotID" "detector-bottom" "Size" "728x90" "Mobile" "320x50" }}
```

> `ad_slot.html` 逻辑：读取 `config.ads.enabled`，
> - `false` → 显示虚线灰色占位框（标注尺寸，`display:none` 在生产环境可选隐藏）
> - `true`  → 输出真实 AdSense `<ins>` 代码

---

## 5. sitemap.xml 新增条目

```xml
<!-- sitemap.xml -->
<url>
  <loc>https://devtoolbox.dev/ailab/detector</loc>
  <lastmod>2026-03-12</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>
</url>
<url>
  <loc>https://devtoolbox.dev/ailab/detector?lang=en</loc>
  <lastmod>2026-03-12</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>
</url>
<url>
  <loc>https://devtoolbox.dev/ailab/detector?lang=zh</loc>
  <lastmod>2026-03-12</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>
</url>
```

---

## 6. 验收标准

- [ ] 访问 `/ailab/detector` 返回 200，不报路由 404
- [ ] `<title>` 标签显示翻译后文字，**不出现原始 i18n key**
- [ ] `?lang=en` 切换后 title / description 变为英文
- [ ] `<link rel="canonical">` 和 JSON-LD 正确输出
- [ ] 广告位占位框在 `ads.enabled=false` 时正常显示虚线框
- [ ] sitemap.xml 包含上述 3 条新 URL

