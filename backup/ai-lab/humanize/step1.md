# Block B-01 · AI 人性化工具 — 页面路由 / SEO / i18n / Ads

> **所属模块**：AI 人性化工具（/ailab/humanize）  
> **竞品参考**：https://www.humanizeai.pro  
> **预估工时**：2h  
> **依赖**：项目基础路由已存在  
> **交付粒度**：仅负责路由注册、SEO Meta、i18n Key、广告位插槽、sitemap 条目

---

## 1. 路由注册

```go
// internal/router/router.go
ailab.GET("/humanize", handler.AIHumanizePage)

// internal/handler/ailab_humanize.go
func AIHumanizePage(c *gin.Context) {
    lang := c.GetString("lang")
    c.HTML(http.StatusOK, "ailab/humanize.html", gin.H{
        "Lang":  lang,
        "Title": i18n.T(lang, "ailab.humanize.seo.title"),
        "Desc":  i18n.T(lang, "ailab.humanize.seo.desc"),
    })
}
```

---

## 2. SEO Meta

```html
<!-- templates/ailab/humanize.html <head> -->

<title>{{ .Title }}</title>
<meta name="description" content="{{ .Desc }}">
<meta name="keywords"    content="ai humanizer, humanize ai text, ai to human text, bypass ai detector, chatgpt humanizer, undetectable ai, humanize chatgpt text">

<meta property="og:title"       content="{{ .Title }}">
<meta property="og:description" content="{{ .Desc }}">
<meta property="og:type"        content="website">
<meta property="og:url"         content="https://devtoolbox.dev/ailab/humanize">
<meta property="og:image"       content="https://devtoolbox.dev/static/og/humanize.png">

<meta name="twitter:card"        content="summary_large_image">
<meta name="twitter:title"       content="{{ .Title }}">
<meta name="twitter:description" content="{{ .Desc }}">

<link rel="canonical"  href="https://devtoolbox.dev/ailab/humanize">
<link rel="alternate"  hreflang="en"      href="https://devtoolbox.dev/ailab/humanize?lang=en">
<link rel="alternate"  hreflang="zh"      href="https://devtoolbox.dev/ailab/humanize?lang=zh">
<link rel="alternate"  hreflang="x-default" href="https://devtoolbox.dev/ailab/humanize">

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "AI Text Humanizer",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "Web",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "description": "Convert AI-generated text to natural human writing. Bypass AI detectors instantly.",
  "url": "https://devtoolbox.dev/ailab/humanize"
}
</script>
```

---

## 3. i18n 翻译 Key（本 Block 新增）

### locales/zh.json

```json
{
  "ailab.humanize.seo.title": "免费 AI 人性化工具 — 将 AI 文字转为人类写作风格 | DevToolBox",
  "ailab.humanize.seo.desc":  "一键将 ChatGPT、Gemini 等 AI 生成的文字改写为自然流畅的人类写作风格，绕过 AI 检测器，完全免费。",

  "ailab.humanize.name":  "AI 人性化工具",
  "ailab.humanize.title": "AI 文字人性化工具",
  "ailab.humanize.desc":  "将 AI 写的文字改成像人写的",

  "ailab.humanize.hero.title":    "AI 文字人性化工具",
  "ailab.humanize.hero.subtitle": "一键将 AI 生成的文字改写为自然流畅的人类写作风格",
  "ailab.humanize.hero.badge1":   "绕过所有 AI 检测器",
  "ailab.humanize.hero.badge2":   "保留原始含义",
  "ailab.humanize.hero.badge3":   "SEO 友好"
}
```

### locales/en.json

```json
{
  "ailab.humanize.seo.title": "Free AI Humanizer — Convert AI Text to Human Writing | DevToolBox",
  "ailab.humanize.seo.desc":  "Humanize AI-generated text instantly. Convert ChatGPT, Gemini, Claude output into natural human writing. Bypass AI detectors. Free, unlimited.",

  "ailab.humanize.name":  "AI Humanizer",
  "ailab.humanize.title": "AI Text Humanizer",
  "ailab.humanize.desc":  "Convert AI writing to natural human text",

  "ailab.humanize.hero.title":    "AI Text Humanizer",
  "ailab.humanize.hero.subtitle": "Transform AI-generated text into natural, human-like writing instantly",
  "ailab.humanize.hero.badge1":   "Bypass All AI Detectors",
  "ailab.humanize.hero.badge2":   "Preserves Original Meaning",
  "ailab.humanize.hero.badge3":   "SEO Friendly"
}
```

---

## 4. 广告位插槽

```html
<!-- templates/ailab/humanize.html -->
<!-- 顶部横幅 -->
{{- template "partials/ad_slot.html" dict "SlotID" "humanize-top" "Size" "728x90" "Mobile" "320x50" }}

<!-- 内容区底部 -->
{{- template "partials/ad_slot.html" dict "SlotID" "humanize-bottom" "Size" "728x90" "Mobile" "320x50" }}
```

> 注：人性化工具为左右双栏布局，侧边无广告位（避免干扰核心操作区）。

---

## 5. sitemap.xml 新增条目

```xml
<url>
  <loc>https://devtoolbox.dev/ailab/humanize</loc>
  <lastmod>2026-03-12</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>
</url>
<url>
  <loc>https://devtoolbox.dev/ailab/humanize?lang=en</loc>
  <lastmod>2026-03-12</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>
</url>
<url>
  <loc>https://devtoolbox.dev/ailab/humanize?lang=zh</loc>
  <lastmod>2026-03-12</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>
</url>
```

---

## 6. 验收标准

- [ ] 访问 `/ailab/humanize` 返回 200，无路由 404
- [ ] `<title>` 显示翻译后文字，不出现原始 i18n key
- [ ] `?lang=en` 切换后 SEO 文字变为英文
- [ ] canonical 和 hreflang 正确输出
- [ ] JSON-LD 正确输出
- [ ] 广告位占位框正常显示（ads.enabled=false 时）
- [ ] sitemap.xml 包含上述 3 条新 URL

