<!-- json-learn-I-01_路由_SEO_i18n_sitemap_ads_ga.md -->

# JSON Learn — 路由 / SEO / i18n / sitemap / 广告 / GA (I-01)

---

## 1. Go 路由注册

```go
// router/json_learn.go
func RegisterJSONLearnRoutes(r *gin.Engine, mw ...gin.HandlerFunc) {
    learn := r.Group("/json/learn", mw...)
    {
        learn.GET("", handler.JSONLearnHub)          // Hub 主页
        learn.GET("/:slug", handler.JSONLearnArticle) // 单篇文章
    }
    datasets := r.Group("/json/datasets", mw...)
    {
        datasets.GET("", handler.JSONDatasetList)       // 数据集列表
        datasets.GET("/:slug", handler.JSONDatasetDetail) // 数据集详情
    }
}
```

**中间件**：`LangMiddleware`（解析 `?lang=`）、`AdsMiddleware`、`GAMiddleware`

---

## 2. 页面 Handler

### 2.1 Hub Handler

```go
func JSONLearnHub(c *gin.Context) {
    lang := c.GetString("lang") // "en" | "zh"
    seo := learnHubSEO[lang]
    articles := getArticleList(lang)
    datasets := getDatasetList(lang)
    faq := getLearnHubFAQ(lang)

    c.HTML(http.StatusOK, "json-learn-hub.html", gin.H{
        "Lang": lang, "SEO": seo, "Articles": articles,
        "Datasets": datasets, "FAQ": faq,
        "AdsEnabled": c.GetBool("ads_enabled"),
        "AdsClientID": c.GetString("ads_client_id"),
        "ToolName": "json-learn",
    })
}
```

### 2.2 Article Handler

```go
func JSONLearnArticle(c *gin.Context) {
    slug := c.Param("slug")
    lang := c.GetString("lang")
    article, err := getArticleBySlug(slug, lang)
    if err != nil {
        c.HTML(http.StatusNotFound, "404.html", gin.H{"Lang": lang})
        return
    }
    breadcrumbs := []Breadcrumb{
        {Name: t(lang, "learn.breadcrumb.home"), URL: "/"},
        {Name: t(lang, "learn.breadcrumb.learn"), URL: "/json/learn"},
        {Name: article.Title, URL: ""},
    }
    related := getRelatedArticles(slug, article.Category, lang, 3)
    c.HTML(http.StatusOK, "json-learn-article.html", gin.H{
        "Lang": lang, "SEO": article.SEO, "Article": article,
        "Breadcrumbs": breadcrumbs, "Related": related,
        "FAQ": article.FAQ, "AdsEnabled": c.GetBool("ads_enabled"),
        "AdsClientID": c.GetString("ads_client_id"),
        "ToolName": "json-learn",
    })
}
```

### 2.3 FAQ — 英文 5 条

```go
var learnHubFAQ_EN = []FAQItem{
    {
        Question: "What is JSON and why should I learn it?",
        Answer: "JSON (JavaScript Object Notation) is a lightweight data interchange format used by virtually every modern web API, configuration system, and database. Learning JSON is essential for any developer working with web services, mobile apps, or data pipelines.",
    },
    {
        Question: "How long does it take to learn JSON?",
        Answer: "JSON basics can be mastered in 1-2 hours. Intermediate skills like multi-language parsing take a few days of practice. Advanced topics including JSON Schema, JSONPath, and security may take 1-2 weeks of focused study.",
    },
    {
        Question: "Are these tutorials and datasets free?",
        Answer: "Yes. All 53 tutorials and 70+ datasets are completely free. Datasets are open-source and can be used in personal or commercial projects. Tutorials are available in both English and Chinese.",
    },
    {
        Question: "Which programming languages are covered?",
        Answer: "Our language guides cover 10 languages: JavaScript, TypeScript, Python, Go, Java, Rust, PHP, C#, Ruby, and Swift. Each includes real-world examples, error handling, and performance tips.",
    },
    {
        Question: "What advanced JSON topics do you cover?",
        Answer: "We cover JSON Schema (Draft 2020-12), JSONPath queries, jq command-line processing, JSON Patch & Merge Patch, JSON Pointer, JWT/JWE/JWS security, performance optimization, REST API design, GraphQL integration, database JSON, and AI/LLM structured output.",
    },
}
```

### 2.4 FAQ — 中文 5 条

```go
var learnHubFAQ_ZH = []FAQItem{
    {
        Question: "什么是 JSON？为什么要学习它？",
        Answer: "JSON（JavaScript Object Notation）是一种轻量级数据交换格式，几乎所有现代 Web API、配置系统和数据库都在使用它。对于任何从事 Web 服务、移动开发或数据管道的开发者来说，学习 JSON 是必备技能。",
    },
    {
        Question: "学习 JSON 需要多长时间？",
        Answer: "JSON 基础语法可以在 1-2 小时内掌握。中级技能如多语言解析需要几天练习。高级主题包括 JSON Schema、JSONPath 和安全防护可能需要 1-2 周的专注学习。",
    },
    {
        Question: "这些教程和数据集是免费的吗？",
        Answer: "是的。所有 53 篇教程和 70+ 个数据集完全免费。数据集为开源许可，可用于个人或商业项目。教程支持中英文双语。",
    },
    {
        Question: "涵盖哪些编程语言？",
        Answer: "我们的语言指南覆盖 10 种语言：JavaScript、TypeScript、Python、Go、Java、Rust、PHP、C#、Ruby 和 Swift。每篇包含真实案例、错误处理和性能优化建议。",
    },
    {
        Question: "有哪些高级 JSON 主题？",
        Answer: "我们涵盖 JSON Schema（Draft 2020-12）、JSONPath 查询、jq 命令行处理、JSON Patch 与 Merge Patch、JSON Pointer、JWT/JWE/JWS 安全、性能优化、REST API 设计、GraphQL 集成、数据库 JSON 以及 AI/LLM 结构化输出。",
    },
}
```

---

## 3. SEO `<head>` 模板

```html
{{ define "extraHead" }}
<title>{{ .SEO.Title }}</title>
<meta name="description" content="{{ .SEO.Description }}">
<meta name="robots" content="index, follow">
<meta property="og:type" content="website">
<meta property="og:site_name" content="ToolboxNova">
<meta property="og:title" content="{{ .SEO.OGTitle }}">
<meta property="og:description" content="{{ .SEO.OGDesc }}">
<meta property="og:url" content="{{ .SEO.Canonical }}">
<meta property="og:image" content="https://toolboxnova.com/static/img/json-learn-og.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{ .SEO.OGTitle }}">
<meta name="twitter:description" content="{{ .SEO.OGDesc }}">
<link rel="canonical" href="{{ .SEO.Canonical }}">
<link rel="alternate" hreflang="en" href="https://toolboxnova.com/json/learn">
<link rel="alternate" hreflang="zh" href="https://toolboxnova.com/json/learn?lang=zh">
<link rel="alternate" hreflang="x-default" href="https://toolboxnova.com/json/learn">

<!-- JSON-LD: WebPage -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "{{ .SEO.OGTitle }}",
  "description": "{{ .SEO.Description }}",
  "url": "{{ .SEO.Canonical }}",
  "inLanguage": "{{ if eq .Lang "zh" }}zh-CN{{ else }}en-US{{ end }}",
  "publisher": {"@type":"Organization","name":"ToolboxNova","url":"https://toolboxnova.com"}
}
</script>

<!-- JSON-LD: FAQPage -->
{{ if .FAQ }}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {{ range $i, $f := .FAQ }}{{ if $i }},{{ end }}
    {"@type":"Question","name":"{{ $f.Question }}","acceptedAnswer":{"@type":"Answer","text":"{{ $f.Answer }}"}}
    {{ end }}
  ]
}
</script>
{{ end }}

<!-- JSON-LD: BreadcrumbList (文章页) -->
{{ if .Breadcrumbs }}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {{ range $i, $bc := .Breadcrumbs }}{{ if $i }},{{ end }}
    {"@type":"ListItem","position":{{ add $i 1 }},"name":"{{ $bc.Name }}"{{ if $bc.URL }},"item":"https://toolboxnova.com{{ $bc.URL }}"{{ end }}}
    {{ end }}
  ]
}
</script>
{{ end }}

<!-- JSON-LD: TechArticle (文章页) -->
{{ if .Article }}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "{{ .Article.Title }}",
  "description": "{{ .Article.Description }}",
  "datePublished": "{{ .Article.PublishedAt }}",
  "dateModified": "{{ .Article.UpdatedAt }}",
  "author": {"@type":"Organization","name":"ToolboxNova"},
  "publisher": {"@type":"Organization","name":"ToolboxNova","logo":{"@type":"ImageObject","url":"https://toolboxnova.com/static/img/logo.png"}},
  "url": "https://toolboxnova.com/json/learn/{{ .Article.Slug }}",
  "proficiencyLevel": "{{ .Article.Level }}",
  "timeRequired": "PT{{ .Article.ReadTime }}M"
}
</script>
{{ end }}

<!-- Prism CSS -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/line-numbers/prism-line-numbers.min.css">

<!-- AdSense -->
{{ if .AdsEnabled }}
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={{ .AdsClientID }}" crossorigin="anonymous"></script>
{{ end }}
{{ end }}
```

---

## 4. 广告接入 & GA 事件追踪

### 一、广告位（3 个标准位）

```html
{{/* ① extraHead — 见上方 AdSense SDK */}}

{{/* ② 顶部横幅（Hero 下方） */}}
{{- template "partials/ad_slot.html" dict
    "SlotID" "json-learn-top" "Size" "728x90" "Mobile" "320x50"
    "ClientID" .AdsClientID "Enabled" .AdsEnabled }}

{{/* ③ 侧边栏（文章页 TOC 下方，移动端隐藏） */}}
{{- template "partials/ad_slot.html" dict
    "SlotID" "json-learn-sidebar" "Size" "300x250" "MobileHide" true
    "ClientID" .AdsClientID "Enabled" .AdsEnabled }}

{{/* ④ 底部横幅（FAQ 上方） */}}
{{- template "partials/ad_slot.html" dict
    "SlotID" "json-learn-bottom" "Size" "728x90" "Mobile" "320x50"
    "ClientID" .AdsClientID "Enabled" .AdsEnabled }}
```

### 二、GA 事件追踪

```html
{{ define "extraScript" }}
<script>
(function () {
  var TOOL = 'json-learn';
  // Hub 页
  gaTrackEvent(TOOL, 'article_click', articleSlug);
  gaTrackEvent(TOOL, 'filter_category', categoryName);
  gaTrackEvent(TOOL, 'filter_level', levelName);
  gaTrackEvent(TOOL, 'search_query', searchTerm);
  // 文章页
  gaTrackEvent(TOOL, 'article_read_complete', articleSlug, readTimeSec);
  gaTrackEvent(TOOL, 'code_copy', articleSlug, lang);
  gaTrackEvent(TOOL, 'playground_use', articleSlug);
  gaTrackEvent(TOOL, 'toc_click', headingId);
  gaTrackEvent(TOOL, 'related_click', targetSlug);
  // 数据集
  gaTrackEvent(TOOL, 'dataset_copy', datasetSlug);
  gaTrackEvent(TOOL, 'dataset_download', datasetSlug);
  gaTrackEvent(TOOL, 'dataset_validate', datasetSlug);
  // 错误
  gaTrackError(TOOL, 'page_load_fail', errMsg);
})();
</script>
{{ end }}
```

### 三、三段式 Block 结构

| Block | 位置 | 内容 |
|-------|------|------|
| `extraHead` | `<head>` 底部 | SEO meta / OG / hreflang / JSON-LD ×4 / Prism CSS / AdSense SDK |
| `content` | `<body>` 主区域 | Hero + 学习路径 + 文章列表 + 数据集 + 广告位 + FAQ + Toast |
| `extraScript` | `</body>` 前 | Prism.js + Fuse.js + GA 事件 + 阅读进度 + 搜索逻辑 |

---

## 5. 全量 i18n Key

### 英文 `i18n/en/json-learn.json`

```json
{
  "learn.seo.hub_title": "Learn JSON - 53+ Tutorials, Guides & Free Datasets | ToolboxNova",
  "learn.seo.hub_description": "Master JSON from beginner to expert. 53+ in-depth tutorials on syntax, schemas, security, APIs, and 70+ free datasets for your projects.",
  "learn.seo.hub_og_title": "Learn JSON — The Most Comprehensive JSON Learning Center",
  "learn.seo.hub_og_desc": "Free tutorials, language guides, error troubleshooting, and real-world datasets.",
  "learn.hero.title": "Learn JSON",
  "learn.hero.subtitle": "Everything you need to master JSON. From basic syntax to advanced validation, security, and real-world applications — plus free datasets for your projects.",
  "learn.hero.badge_articles": "53+ Tutorials",
  "learn.hero.badge_datasets": "70+ Datasets",
  "learn.hero.badge_languages": "10 Languages",
  "learn.hero.badge_free": "100% Free",
  "learn.nav.all": "All",
  "learn.nav.getting_started": "Getting Started",
  "learn.nav.language_guides": "Language Guides",
  "learn.nav.error_fixing": "Error Troubleshooting",
  "learn.nav.comparisons": "Format Comparisons",
  "learn.nav.advanced": "Advanced Topics",
  "learn.nav.security": "Security & Performance",
  "learn.nav.real_world": "Real-World Applications",
  "learn.nav.datasets": "Datasets",
  "learn.filter.all_levels": "All Levels",
  "learn.filter.beginner": "Beginner",
  "learn.filter.intermediate": "Intermediate",
  "learn.filter.advanced": "Advanced",
  "learn.filter.search_placeholder": "Search tutorials and datasets...",
  "learn.filter.clear": "Clear filters",
  "learn.filter.showing": "Showing {count} of {total} resources",
  "learn.card.read_article": "Read Article",
  "learn.card.min_read": "{time} min read",
  "learn.card.featured": "Featured",
  "learn.card.new": "New",
  "learn.card.updated": "Updated",
  "learn.article.toc_title": "Table of Contents",
  "learn.article.prev_article": "Previous",
  "learn.article.next_article": "Next",
  "learn.article.related_title": "Related Articles",
  "learn.article.published": "Published",
  "learn.article.updated": "Last updated",
  "learn.article.try_it": "Try It",
  "learn.article.run": "Run",
  "learn.article.reset": "Reset",
  "learn.article.output": "Output",
  "learn.article.back_to_hub": "← Back to Learn",
  "learn.article.share": "Share",
  "learn.article.copy_link": "Copy link",
  "learn.dataset.title": "Free JSON Datasets",
  "learn.dataset.subtitle": "Use these datasets for testing, learning, or in your projects. All free and open source.",
  "learn.dataset.records": "{count} records",
  "learn.dataset.fields": "Fields",
  "learn.dataset.size": "Size",
  "learn.dataset.copy": "Copy",
  "learn.dataset.download": "Download",
  "learn.dataset.validate": "Validate",
  "learn.dataset.preview": "Preview",
  "learn.dataset.download_all": "Download All ({count})",
  "learn.dataset.category_all": "All ({count})",
  "learn.dataset.category_geographic": "Geographic",
  "learn.dataset.category_reference": "Reference",
  "learn.dataset.category_configuration": "Configuration",
  "learn.dataset.category_testing": "Testing",
  "learn.dataset.category_api_mocks": "API Mocks",
  "learn.dataset.category_ai_ml": "AI & ML",
  "learn.dataset.category_finance": "Finance",
  "learn.status.loading": "Loading resources...",
  "learn.status.no_results": "No resources found matching your filters.",
  "learn.status.no_results_hint": "Try adjusting your search or filters.",
  "learn.status.error": "Failed to load. Please refresh.",
  "learn.feature.comprehensive_title": "Comprehensive",
  "learn.feature.comprehensive_desc": "53+ tutorials from basics to JSON Schema, JSONPath, jq, security, and API design.",
  "learn.feature.free_title": "100% Free",
  "learn.feature.free_desc": "All tutorials, datasets, and code examples are completely free. No registration required.",
  "learn.feature.practical_title": "Practical",
  "learn.feature.practical_desc": "Real-world examples, interactive code playgrounds, and downloadable sample data.",
  "learn.faq.title": "Frequently Asked Questions",
  "learn.error.not_found_title": "Article Not Found",
  "learn.error.not_found_desc": "The article you're looking for doesn't exist or may have been moved.",
  "learn.error.back_to_learn": "Back to Learning Center",
  "learn.toast.copied": "Copied to clipboard!",
  "learn.toast.download_started": "Download started",
  "learn.toast.link_copied": "Link copied!",
  "learn.toast.copy_failed": "Copy failed. Please try manually.",
  "learn.breadcrumb.home": "Home",
  "learn.breadcrumb.learn": "Learn JSON",
  "learn.breadcrumb.datasets": "Datasets",
  "learn.progress.completed": "Completed",
  "learn.progress.reading": "Reading",
  "learn.progress.reset": "Reset progress",
  "learn.path.beginner_title": "Beginner Path",
  "learn.path.beginner_desc": "Learn JSON syntax, data types, and basic file operations.",
  "learn.path.beginner_count": "10 articles",
  "learn.path.intermediate_title": "Intermediate Path",
  "learn.path.intermediate_desc": "Use JSON in your language, fix errors, compare formats.",
  "learn.path.intermediate_count": "21 articles",
  "learn.path.advanced_title": "Advanced Path",
  "learn.path.advanced_desc": "JSON Schema, JSONPath, jq, security, databases, and AI.",
  "learn.path.advanced_count": "22 articles",
  "learn.download.json": "Download JSON",
  "learn.download.zip": "Download ZIP"
}
```

### 中文 `i18n/zh/json-learn.json`

```json
{
  "learn.seo.hub_title": "学习 JSON - 53+ 篇教程与 70+ 免费数据集 | ToolboxNova",
  "learn.seo.hub_description": "从入门到精通掌握 JSON。53+ 篇教程覆盖语法、Schema、安全、API，70+ 免费数据集。",
  "learn.seo.hub_og_title": "学习 JSON — 全球最全面的 JSON 学习中心",
  "learn.seo.hub_og_desc": "免费教程、多语言指南、错误排查与真实数据集。",
  "learn.hero.title": "学习 JSON",
  "learn.hero.subtitle": "掌握 JSON 所需的一切。从基础语法到高级验证、安全和实战应用——以及为你的项目准备的免费数据集。",
  "learn.hero.badge_articles": "53+ 篇教程",
  "learn.hero.badge_datasets": "70+ 数据集",
  "learn.hero.badge_languages": "10 种语言",
  "learn.hero.badge_free": "完全免费",
  "learn.nav.all": "全部",
  "learn.nav.getting_started": "基础入门",
  "learn.nav.language_guides": "多语言实战",
  "learn.nav.error_fixing": "错误排查",
  "learn.nav.comparisons": "格式对比",
  "learn.nav.advanced": "高级主题",
  "learn.nav.security": "安全与性能",
  "learn.nav.real_world": "实战应用",
  "learn.nav.datasets": "数据集",
  "learn.filter.all_levels": "全部难度",
  "learn.filter.beginner": "入门",
  "learn.filter.intermediate": "中级",
  "learn.filter.advanced": "高级",
  "learn.filter.search_placeholder": "搜索教程和数据集...",
  "learn.filter.clear": "清除筛选",
  "learn.filter.showing": "显示 {count} / {total} 项",
  "learn.card.read_article": "阅读文章",
  "learn.card.min_read": "{time} 分钟",
  "learn.card.featured": "精选",
  "learn.card.new": "新文章",
  "learn.card.updated": "已更新",
  "learn.article.toc_title": "目录",
  "learn.article.prev_article": "上一篇",
  "learn.article.next_article": "下一篇",
  "learn.article.related_title": "相关文章",
  "learn.article.published": "发布于",
  "learn.article.updated": "最后更新",
  "learn.article.try_it": "试试看",
  "learn.article.run": "运行",
  "learn.article.reset": "重置",
  "learn.article.output": "输出结果",
  "learn.article.back_to_hub": "← 返回学习中心",
  "learn.article.share": "分享",
  "learn.article.copy_link": "复制链接",
  "learn.dataset.title": "免费 JSON 数据集",
  "learn.dataset.subtitle": "用于测试、学习或集成到你的项目中。完全免费开源。",
  "learn.dataset.records": "{count} 条记录",
  "learn.dataset.fields": "字段",
  "learn.dataset.size": "大小",
  "learn.dataset.copy": "复制",
  "learn.dataset.download": "下载",
  "learn.dataset.validate": "验证",
  "learn.dataset.preview": "预览",
  "learn.dataset.download_all": "全部下载 ({count})",
  "learn.dataset.category_all": "全部 ({count})",
  "learn.dataset.category_geographic": "地理数据",
  "learn.dataset.category_reference": "参考数据",
  "learn.dataset.category_configuration": "配置模板",
  "learn.dataset.category_testing": "测试数据",
  "learn.dataset.category_api_mocks": "API 模拟",
  "learn.dataset.category_ai_ml": "AI 与 ML",
  "learn.dataset.category_finance": "金融数据",
  "learn.status.loading": "加载中...",
  "learn.status.no_results": "没有匹配的资源。",
  "learn.status.no_results_hint": "请调整搜索条件或筛选器。",
  "learn.status.error": "加载失败，请刷新页面。",
  "learn.feature.comprehensive_title": "全面覆盖",
  "learn.feature.comprehensive_desc": "53+ 篇教程，从基础到 Schema、JSONPath、jq、安全和 API 设计。",
  "learn.feature.free_title": "完全免费",
  "learn.feature.free_desc": "所有教程、数据集和代码示例完全免费，无需注册。",
  "learn.feature.practical_title": "注重实战",
  "learn.feature.practical_desc": "真实案例、交互式代码练习和可下载的样例数据。",
  "learn.faq.title": "常见问题",
  "learn.error.not_found_title": "文章未找到",
  "learn.error.not_found_desc": "你访问的文章不存在或已被移动。",
  "learn.error.back_to_learn": "返回学习中心",
  "learn.toast.copied": "已复制到剪贴板！",
  "learn.toast.download_started": "下载已开始",
  "learn.toast.link_copied": "链接已复制！",
  "learn.toast.copy_failed": "复制失败，请手动操作。",
  "learn.breadcrumb.home": "首页",
  "learn.breadcrumb.learn": "学习 JSON",
  "learn.breadcrumb.datasets": "数据集",
  "learn.progress.completed": "已完成",
  "learn.progress.reading": "阅读中",
  "learn.progress.reset": "重置进度",
  "learn.path.beginner_title": "入门路径",
  "learn.path.beginner_desc": "学习 JSON 语法、数据类型和基本文件操作。",
  "learn.path.beginner_count": "10 篇文章",
  "learn.path.intermediate_title": "中级路径",
  "learn.path.intermediate_desc": "在你的语言中使用 JSON，修复错误，对比格式。",
  "learn.path.intermediate_count": "21 篇文章",
  "learn.path.advanced_title": "高级路径",
  "learn.path.advanced_desc": "Schema、JSONPath、jq、安全、数据库与 AI。",
  "learn.path.advanced_count": "22 篇文章",
  "learn.download.json": "下载 JSON",
  "learn.download.zip": "下载 ZIP"
}
```

---

## 6. sitemap 新增条目（完整 53 篇，时间随机 2023-01 ~ 2026-01）

```xml
<url><loc>https://toolboxnova.com/json/learn</loc><lastmod>2026-01-15</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
<url><loc>https://toolboxnova.com/json/learn?lang=zh</loc><lastmod>2026-01-15</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn?lang=en</loc><lastmod>2026-01-15</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/datasets</loc><lastmod>2025-11-20</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<!-- A 基础入门 -->
<url><loc>https://toolboxnova.com/json/learn/what-is-json</loc><lastmod>2023-03-15</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-syntax-rules</loc><lastmod>2023-05-22</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-data-types</loc><lastmod>2023-07-10</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-objects-and-arrays</loc><lastmod>2023-09-18</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn/how-to-open-json-files</loc><lastmod>2023-11-05</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-comments</loc><lastmod>2024-01-20</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-stringify-and-parse</loc><lastmod>2024-03-08</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-formatting-pretty-print</loc><lastmod>2024-05-12</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-history-and-rfc</loc><lastmod>2024-07-25</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-cheat-sheet</loc><lastmod>2024-09-30</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<!-- B 多语言 -->
<url><loc>https://toolboxnova.com/json/learn/json-in-javascript</loc><lastmod>2025-01-10</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-in-typescript</loc><lastmod>2025-02-18</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-in-python</loc><lastmod>2024-11-05</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-in-go</loc><lastmod>2025-03-22</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-in-java</loc><lastmod>2024-08-15</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-in-rust</loc><lastmod>2025-06-01</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-in-php</loc><lastmod>2024-04-20</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-in-csharp</loc><lastmod>2024-06-08</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-in-ruby</loc><lastmod>2023-12-14</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-in-swift</loc><lastmod>2025-07-15</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<!-- C 错误排查 -->
<url><loc>https://toolboxnova.com/json/learn/common-json-mistakes</loc><lastmod>2024-02-14</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn/fix-unexpected-end-of-json-input</loc><lastmod>2023-08-20</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/fix-unexpected-token-in-json</loc><lastmod>2023-10-05</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-parse-error</loc><lastmod>2024-04-10</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-syntax-error</loc><lastmod>2024-06-22</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-encoding-issues</loc><lastmod>2024-08-30</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<!-- D 格式对比 -->
<url><loc>https://toolboxnova.com/json/learn/json-vs-xml</loc><lastmod>2023-06-18</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-vs-yaml</loc><lastmod>2023-09-25</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-vs-toml</loc><lastmod>2024-01-08</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-vs-csv</loc><lastmod>2024-03-15</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-vs-protobuf</loc><lastmod>2024-05-28</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<!-- E 高级主题 -->
<url><loc>https://toolboxnova.com/json/learn/json-schema-getting-started</loc><lastmod>2025-04-10</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-schema-advanced</loc><lastmod>2025-05-20</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-schema-cicd</loc><lastmod>2025-08-12</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-schema-openapi</loc><lastmod>2025-09-18</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/jsonpath-complete-guide</loc><lastmod>2025-10-05</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn/jq-command-line-guide</loc><lastmod>2024-10-15</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn/jq-devops-production</loc><lastmod>2024-12-20</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json5-and-jsonc</loc><lastmod>2023-04-28</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-patch-merge-patch</loc><lastmod>2025-11-10</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-pointer</loc><lastmod>2025-12-01</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<!-- F 安全与性能 -->
<url><loc>https://toolboxnova.com/json/learn/json-security-best-practices</loc><lastmod>2025-01-25</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-web-tokens-jwt</loc><lastmod>2024-09-10</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-performance-optimization</loc><lastmod>2025-02-28</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-compression</loc><lastmod>2024-07-05</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-encryption-signing</loc><lastmod>2025-03-15</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<!-- G 实战应用 -->
<url><loc>https://toolboxnova.com/json/learn/json-rest-api-design</loc><lastmod>2024-11-18</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-graphql</loc><lastmod>2025-04-22</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-in-databases</loc><lastmod>2024-10-28</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-configuration-files</loc><lastmod>2023-11-30</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-and-ai-llm</loc><lastmod>2025-12-15</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-web-scraping-pipelines</loc><lastmod>2025-06-20</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-ld-structured-data</loc><lastmod>2025-08-08</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
```

---

## 7. Header 导航新增子项

```html
<!-- partials/header.html — "Learn" 分类下 -->
<li class="nav-group">
  <span class="nav-group-title">Learn</span>
  <ul class="nav-sublist">
    <li><a href="/json/learn" class="nav-link"><svg><!-- 书本 --></svg><span>Learn JSON</span><span class="nav-badge">53+</span></a></li>
    <li><a href="/json/datasets" class="nav-link"><svg><!-- 数据库 --></svg><span>Datasets</span><span class="nav-badge">70+</span></a></li>
  </ul>
</li>
```

---

## 8. 主页模块新增子项

```html
<!-- index.html — "Learn & Resources" 分类下 -->
<div class="tool-card" data-category="learn">
  <div class="tool-card__icon"><svg viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div>
  <h3 class="tool-card__title">Learn JSON</h3>
  <p class="tool-card__desc">53+ tutorials from beginner to advanced. Schema, JSONPath, jq, security & more.</p>
  <div class="tool-card__badges"><span class="badge badge--blue">53+ Tutorials</span><span class="badge badge--green">Free</span></div>
  <a href="/json/learn" class="tool-card__link"></a>
</div>
<div class="tool-card" data-category="learn">
  <div class="tool-card__icon"><svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg></div>
  <h3 class="tool-card__title">JSON Datasets</h3>
  <p class="tool-card__desc">70+ free, open-source datasets for testing and development.</p>
  <div class="tool-card__badges"><span class="badge badge--purple">70+</span><span class="badge badge--green">Open Source</span></div>
  <a href="/json/datasets" class="tool-card__link"></a>
</div>
```
