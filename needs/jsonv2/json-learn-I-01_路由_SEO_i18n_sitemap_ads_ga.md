<!-- json-learn-I-01_路由_SEO_i18n_sitemap_ads_ga.md -->

# JSON Learn — 路由 / SEO / i18n / Sitemap / 广告 / GA

---

## 1. Go 路由注册

```go
// routes/json_learn.go
package routes

import (
    "github.com/gin-gonic/gin"
    "toolboxnova/handlers"
    "toolboxnova/middleware"
)

func RegisterJSONLearnRoutes(r *gin.RouterGroup) {
    learn := r.Group("/json/learn")
    learn.Use(middleware.I18n())         // 语言检测中间件
    learn.Use(middleware.AdsConfig())    // 广告配置注入
    learn.Use(middleware.GAConfig())     // GA 配置注入
    {
        // 学习中心首页（文章列表）
        learn.GET("", handlers.JSONLearnIndex)
        // 文章详情页
        learn.GET("/:slug", handlers.JSONLearnArticle)
    }
}
```

---

## 2. 页面 Handler

### 学习中心首页 Handler

```go
// handlers/json_learn.go
package handlers

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

// Article 文章元数据结构
type Article struct {
    Slug        string   `json:"slug"`
    Title       string   `json:"title"`
    TitleEN     string   `json:"title_en"`
    Summary     string   `json:"summary"`
    SummaryEN   string   `json:"summary_en"`
    Category    string   `json:"category"`
    Level       string   `json:"level"`       // beginner / intermediate / advanced
    ReadTime    int      `json:"read_time"`   // 分钟
    Icon        string   `json:"icon"`        // emoji 或图标类名
    Tags        []string `json:"tags"`
    UpdatedAt   string   `json:"updated_at"`
    SortOrder   int      `json:"sort_order"`
}

// FAQ 数据结构
type FAQ struct {
    Question string
    Answer   string
}

func JSONLearnIndex(c *gin.Context) {
    lang := c.GetString("lang") // 从 i18n 中间件获取

    // SEO 数据
    seo := map[string]string{
        "title":       "JSON 学习中心 — 53+ 篇免费教程 | ToolboxNova",
        "title_en":    "JSON Learning Hub — 53+ Free Tutorials | ToolboxNova",
        "description": "从零基础到高级进阶，53+ 篇深度 JSON 教程，覆盖语法、多语言实战、Schema、安全与性能。完全免费，在线交互式学习。",
        "description_en": "From beginner to advanced, 53+ in-depth JSON tutorials covering syntax, multi-language practice, Schema, security & performance. Completely free with interactive learning.",
        "canonical":   "https://toolboxnova.com/json/learn",
        "ogImage":     "https://toolboxnova.com/static/img/og-json-learn.png",
    }

    // 加载文章列表（从 JSON 文件或内存缓存）
    articles := loadArticles()

    // FAQ 数据（中文）
    faqZH := []FAQ{
        {
            Question: "ToolboxNova 的 JSON 教程适合完全零基础的人吗？",
            Answer:   "完全适合。我们的入门路径从「什么是 JSON」讲起，用大量图解和可运行的代码示例，帮助零基础用户在 2 小时内掌握 JSON 核心概念。每篇文章都有难度标识，你可以按照入门 → 中级 → 高级的路径循序渐进。",
        },
        {
            Question: "这些教程覆盖哪些编程语言？",
            Answer:   "我们覆盖 10 种主流编程语言的 JSON 处理教程：Python、JavaScript/Node.js、Java（Gson/Jackson）、Go、C#、PHP、Ruby、Rust（serde）、Swift 和 Kotlin。每种语言都有独立的深度教程，包含完整可运行的代码示例。",
        },
        {
            Question: "教程中的代码示例可以直接运行吗？",
            Answer:   "是的。我们的教程内嵌了交互式代码编辑器，JSON 相关的示例可以直接在浏览器中编辑和运行。你可以修改代码、实时查看结果，无需安装任何开发环境。其他语言的代码示例提供一键复制功能。",
        },
        {
            Question: "JSON 教程内容会持续更新吗？",
            Answer:   "会。我们持续跟踪 JSON 生态的最新发展，包括新的 RFC 标准、JSON Schema 更新、安全最佳实践等。目前已有 53 篇教程，计划在 2026 年扩展到 70+ 篇，新增 AI/大模型、边缘计算等前沿主题。",
        },
        {
            Question: "这些教程和 W3Schools、MDN 的 JSON 教程有什么不同？",
            Answer:   "我们的教程更深入、更系统。W3Schools 侧重快速入门（约 15 篇），MDN 侧重 Web API 文档（约 8 篇）。我们提供 53+ 篇覆盖完整知识体系的教程，从基础语法到 JSON Schema、JSONPath、jq、安全防御、性能优化，并配备交互式代码编辑器和练习题系统。",
        },
    }

    // FAQ 数据（英文）
    faqEN := []FAQ{
        {
            Question: "Are ToolboxNova's JSON tutorials suitable for complete beginners?",
            Answer:   "Absolutely. Our beginner path starts from 'What is JSON' with visual diagrams and runnable code examples, helping beginners grasp core JSON concepts within 2 hours. Each article has a difficulty indicator, and you can follow the beginner → intermediate → advanced path progressively.",
        },
        {
            Question: "Which programming languages do these tutorials cover?",
            Answer:   "We cover JSON processing tutorials for 10 mainstream languages: Python, JavaScript/Node.js, Java (Gson/Jackson), Go, C#, PHP, Ruby, Rust (serde), Swift, and Kotlin. Each language has a dedicated in-depth tutorial with complete runnable code examples.",
        },
        {
            Question: "Can I run the code examples directly in the tutorials?",
            Answer:   "Yes. Our tutorials include an interactive code editor where JSON-related examples can be edited and executed directly in the browser. You can modify code and see results in real-time without installing any development environment. Code examples for other languages offer a one-click copy feature.",
        },
        {
            Question: "Will the tutorial content be continuously updated?",
            Answer:   "Yes. We continuously track the latest developments in the JSON ecosystem, including new RFC standards, JSON Schema updates, and security best practices. We currently have 53 tutorials and plan to expand to 70+ in 2026, covering AI/LLM, edge computing, and other cutting-edge topics.",
        },
        {
            Question: "How are these tutorials different from W3Schools and MDN JSON tutorials?",
            Answer:   "Our tutorials are deeper and more systematic. W3Schools focuses on quick starts (~15 articles), MDN focuses on Web API documentation (~8 articles). We provide 53+ articles covering the complete knowledge system, from basic syntax to JSON Schema, JSONPath, jq, security, and performance, with an interactive code editor and quiz system.",
        },
    }

    faqs := faqZH
    if lang == "en" {
        faqs = faqEN
    }

    c.HTML(http.StatusOK, "json-learn/index.html", gin.H{
        "SEO":          seo,
        "Lang":         lang,
        "Articles":     articles,
        "FAQs":         faqs,
        "AdsEnabled":   c.GetBool("ads_enabled"),
        "AdsClientID":  c.GetString("ads_client_id"),
        "EnableGA":     c.GetBool("ga_enabled"),
        "ToolName":     "json-learn",
        "PageType":     "learn-index",
    })
}

// JSONLearnArticle 文章详情页 Handler
func JSONLearnArticle(c *gin.Context) {
    slug := c.Param("slug")
    lang := c.GetString("lang")

    article := findArticleBySlug(slug)
    if article == nil {
        c.HTML(http.StatusNotFound, "404.html", gin.H{})
        return
    }

    // 加载 Markdown 内容
    content := loadArticleContent(slug, lang)

    // 获取上下篇
    prev, next := getAdjacentArticles(slug)

    // 获取相关文章
    related := getRelatedArticles(article.Category, article.Level, slug, 3)

    // 文章级别 SEO
    seo := map[string]string{
        "title":       article.Title + " | JSON 学习中心 | ToolboxNova",
        "description": article.Summary,
        "canonical":   "https://toolboxnova.com/json/learn/" + slug,
        "ogImage":     "https://toolboxnova.com/static/img/og-json-learn-" + slug + ".png",
    }

    c.HTML(http.StatusOK, "json-learn/article.html", gin.H{
        "SEO":         seo,
        "Lang":        lang,
        "Article":     article,
        "Content":     content,
        "PrevArticle": prev,
        "NextArticle": next,
        "Related":     related,
        "AdsEnabled":  c.GetBool("ads_enabled"),
        "AdsClientID": c.GetString("ads_client_id"),
        "EnableGA":    c.GetBool("ga_enabled"),
        "ToolName":    "json-learn",
        "PageType":    "learn-article",
    })
}
```

---

## 3. SEO `<head>` 模板

```html
{{ define "extraHead" }}
<!-- ========== JSON Learn SEO Head ========== -->

<!-- 基础 Meta -->
<title>{{ if eq .Lang "en" }}{{ .SEO.title_en }}{{ else }}{{ .SEO.title }}{{ end }}</title>
<meta name="description" content="{{ if eq .Lang "en" }}{{ .SEO.description_en }}{{ else }}{{ .SEO.description }}{{ end }}">
<meta name="keywords" content="JSON, JSON教程, JSON学习, JSON Schema, JSONPath, JSON格式化, JSON验证, JSON tutorial, learn JSON">
<meta name="author" content="ToolboxNova">

<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:title" content="{{ if eq .Lang "en" }}{{ .SEO.title_en }}{{ else }}{{ .SEO.title }}{{ end }}">
<meta property="og:description" content="{{ if eq .Lang "en" }}{{ .SEO.description_en }}{{ else }}{{ .SEO.description }}{{ end }}">
<meta property="og:url" content="{{ .SEO.canonical }}">
<meta property="og:image" content="{{ .SEO.ogImage }}">
<meta property="og:site_name" content="ToolboxNova">
<meta property="og:locale" content="{{ if eq .Lang "en" }}en_US{{ else }}zh_CN{{ end }}">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{ if eq .Lang "en" }}{{ .SEO.title_en }}{{ else }}{{ .SEO.title }}{{ end }}">
<meta name="twitter:description" content="{{ if eq .Lang "en" }}{{ .SEO.description_en }}{{ else }}{{ .SEO.description }}{{ end }}">
<meta name="twitter:image" content="{{ .SEO.ogImage }}">

<!-- Canonical & Hreflang -->
<link rel="canonical" href="{{ .SEO.canonical }}">
<link rel="alternate" hreflang="zh" href="{{ .SEO.canonical }}?lang=zh">
<link rel="alternate" hreflang="en" href="{{ .SEO.canonical }}?lang=en">
<link rel="alternate" hreflang="x-default" href="{{ .SEO.canonical }}">

<!-- JSON-LD: SoftwareApplication -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "ToolboxNova JSON Learning Hub",
  "url": "https://toolboxnova.com/json/learn",
  "description": "Comprehensive JSON learning platform with 53+ free tutorials, interactive code editor, and multi-language support.",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "author": {
    "@type": "Organization",
    "name": "ToolboxNova",
    "url": "https://toolboxnova.com"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "2560"
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

<!-- JSON-LD: BreadcrumbList -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://toolboxnova.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "JSON Tools",
      "item": "https://toolboxnova.com/json"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Learn JSON",
      "item": "https://toolboxnova.com/json/learn"
    }
  ]
}
</script>

<!-- AdSense 条件加载 -->
{{ if .AdsEnabled }}
<script async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={{ .AdsClientID }}"
  crossorigin="anonymous"></script>
{{ end }}

<!-- Prism.js CSS -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css">

{{ end }}
```

---

## 4. 广告接入 & GA 事件追踪

### 广告位布局（3 个标准位）

```html
{{/* ① extraHead：条件加载 AdSense SDK，client 取 .AdsClientID */}}
{{ if .AdsEnabled }}
<script async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={{ .AdsClientID }}"
  crossorigin="anonymous"></script>
{{ end }}

{{/* ② 顶部横幅（Hero 下方） */}}
{{- template "partials/ad_slot.html" dict
  "SlotID" "json-learn-top" "Size" "728x90" "Mobile" "320x50"
  "ClientID" .AdsClientID "Enabled" .AdsEnabled }}

{{/* ③ 侧边栏（文章详情页右侧，移动端隐藏） */}}
{{- template "partials/ad_slot.html" dict
  "SlotID" "json-learn-sidebar" "Size" "300x250" "MobileHide" true
  "ClientID" .AdsClientID "Enabled" .AdsEnabled }}

{{/* ④ 底部横幅 */}}
{{- template "partials/ad_slot.html" dict
  "SlotID" "json-learn-bottom" "Size" "728x90" "Mobile" "320x50"
  "ClientID" .AdsClientID "Enabled" .AdsEnabled }}
```

### GA 事件追踪

```html
{{ define "extraScript" }}
<script>
(function () {
  var TOOL = 'json-learn';

  // 文章阅读追踪
  gaTrackPageView(TOOL, '{{ .PageType }}');

  // 文章点击
  document.querySelectorAll('[data-article-slug]').forEach(function(card) {
    card.addEventListener('click', function() {
      gaTrackEvent(TOOL, 'article_click', this.dataset.articleSlug);
    });
  });

  // 分类筛选切换
  document.querySelectorAll('[data-filter]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      gaTrackSettingChange(TOOL, 'filter_category', this.dataset.filter);
    });
  });

  // 难度筛选切换
  document.querySelectorAll('[data-level]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      gaTrackSettingChange(TOOL, 'filter_level', this.dataset.level);
    });
  });

  // 搜索事件（防抖）
  var searchInput = document.getElementById('searchInput');
  if (searchInput) {
    var debounceTimer;
    searchInput.addEventListener('input', function() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function() {
        gaTrackEvent(TOOL, 'search', searchInput.value);
      }, 500);
    });
  }

  // 代码复制
  document.addEventListener('click', function(e) {
    if (e.target.closest('.copy-btn')) {
      gaTrackEvent(TOOL, 'code_copy', e.target.closest('[data-lang]')?.dataset.lang || 'json');
    }
  });

  // 练习题提交
  document.addEventListener('click', function(e) {
    if (e.target.closest('.quiz-submit')) {
      gaTrackEvent(TOOL, 'quiz_submit', e.target.closest('[data-quiz-id]')?.dataset.quizId);
    }
  });

  // 阅读进度（滚动到底部）
  if (document.querySelector('.article-content')) {
    var tracked = false;
    window.addEventListener('scroll', function() {
      if (!tracked && (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 200) {
        tracked = true;
        gaTrackEvent(TOOL, 'article_complete', '{{ if .Article }}{{ .Article.Slug }}{{ end }}');
      }
    });
  }

  // 错误追踪
  window.addEventListener('error', function(e) {
    gaTrackError(TOOL, 'js_error', e.message);
  });
})();
</script>
{{ end }}
```

### 三段式 Block 结构

| Block | 放置内容 | 加载时机 |
|-------|---------|---------|
| `extraHead` | AdSense SDK、Prism CSS、SEO meta、JSON-LD、OG 标签 | `<head>` 内，页面加载前 |
| `content` | Hero、路径卡片、筛选器、文章列表、广告位、FAQ、Toast | `<body>` 主内容区 |
| `extraScript` | GA 事件绑定、Prism.js、Fuse.js 搜索、筛选逻辑、Monaco Editor | `</body>` 前，DOM 就绪后 |

---

## 5. 全量 i18n Key

### 英文：i18n/en/json-learn.json

```json
{
  "learn.seo.title": "JSON Learning Hub — 53+ Free Tutorials | ToolboxNova",
  "learn.seo.description": "From beginner to advanced, 53+ in-depth JSON tutorials covering syntax, multi-language practice, Schema, security & performance. Completely free.",
  "learn.seo.keywords": "JSON tutorial, learn JSON, JSON guide, JSON Schema, JSONPath, JSON format, JSON validation",

  "learn.hero.title": "JSON Learning Hub",
  "learn.hero.subtitle": "From zero to expert — the most comprehensive free JSON tutorial on the internet",
  "learn.hero.badge_tutorials": "53+ Tutorials",
  "learn.hero.badge_datasets": "70+ Datasets",
  "learn.hero.badge_languages": "10 Languages",
  "learn.hero.badge_free": "Completely Free",

  "learn.path.beginner.title": "Beginner Path",
  "learn.path.beginner.desc": "Learn JSON syntax, data types, and basic file operations.",
  "learn.path.beginner.count": "10 Articles",
  "learn.path.beginner.icon": "🌱",
  "learn.path.intermediate.title": "Intermediate Path",
  "learn.path.intermediate.desc": "Use JSON in your language, debug errors, compare formats.",
  "learn.path.intermediate.count": "21 Articles",
  "learn.path.intermediate.icon": "💻",
  "learn.path.advanced.title": "Advanced Path",
  "learn.path.advanced.desc": "Schema, JSONPath, jq, security, databases & AI.",
  "learn.path.advanced.count": "22 Articles",
  "learn.path.advanced.icon": "🚀",

  "learn.filter.all": "All",
  "learn.filter.basics": "Basics",
  "learn.filter.multi_lang": "Multi-Language",
  "learn.filter.debugging": "Debugging",
  "learn.filter.comparison": "Format Comparison",
  "learn.filter.advanced_topics": "Advanced Topics",
  "learn.filter.security": "Security & Performance",
  "learn.filter.practical": "Practical Applications",
  "learn.filter.search_placeholder": "Search tutorials...",
  "learn.filter.level_all": "All Levels",
  "learn.filter.level_beginner": "Beginner",
  "learn.filter.level_intermediate": "Intermediate",
  "learn.filter.level_advanced": "Advanced",

  "learn.card.read_time": "{n} min read",
  "learn.card.level_beginner": "Beginner",
  "learn.card.level_intermediate": "Intermediate",
  "learn.card.level_advanced": "Advanced",
  "learn.card.updated": "Updated {date}",

  "learn.article.toc_title": "Table of Contents",
  "learn.article.prev": "Previous Article",
  "learn.article.next": "Next Article",
  "learn.article.related": "Related Articles",
  "learn.article.back_to_list": "← Back to Learning Hub",
  "learn.article.share": "Share this article",
  "learn.article.print": "Print / PDF",
  "learn.article.progress": "Reading Progress",

  "learn.code.copy": "Copy",
  "learn.code.copied": "Copied!",
  "learn.code.run": "Run",
  "learn.code.reset": "Reset",
  "learn.code.output": "Output",
  "learn.code.editor_placeholder": "Edit JSON here and click Run...",

  "learn.quiz.title": "Practice Exercise",
  "learn.quiz.submit": "Submit Answer",
  "learn.quiz.correct": "Correct! Great job!",
  "learn.quiz.incorrect": "Not quite. Try again!",
  "learn.quiz.show_answer": "Show Answer",
  "learn.quiz.explanation": "Explanation",
  "learn.quiz.try_again": "Try Again",
  "learn.quiz.score": "Score: {correct}/{total}",

  "learn.status.loading": "Loading tutorials...",
  "learn.status.empty": "No tutorials found matching your criteria.",
  "learn.status.empty_search": "No results for \"{query}\". Try a different keyword.",

  "learn.download.pdf": "Download as PDF",
  "learn.download.print": "Print this article",

  "learn.error.not_found": "Article not found",
  "learn.error.not_found_desc": "The article you're looking for doesn't exist or has been moved.",
  "learn.error.load_failed": "Failed to load content. Please refresh the page.",
  "learn.error.back": "Back to Learning Hub",

  "learn.feature.privacy_title": "100% Privacy",
  "learn.feature.privacy_desc": "All code runs in your browser. No data is sent to any server.",
  "learn.feature.speed_title": "Lightning Fast",
  "learn.feature.speed_desc": "Instant page loads with optimized static rendering.",
  "learn.feature.free_title": "Completely Free",
  "learn.feature.free_desc": "No registration, no paywall. All 53+ tutorials are free forever.",

  "learn.faq.title": "Frequently Asked Questions",
  "learn.faq.q1": "Are these JSON tutorials suitable for complete beginners?",
  "learn.faq.a1": "Absolutely. Our beginner path starts from 'What is JSON' with visual diagrams and runnable code examples, helping beginners grasp core concepts within 2 hours.",
  "learn.faq.q2": "Which programming languages do these tutorials cover?",
  "learn.faq.a2": "We cover 10 mainstream languages: Python, JavaScript/Node.js, Java, Go, C#, PHP, Ruby, Rust, Swift, and Kotlin, each with dedicated in-depth tutorials.",
  "learn.faq.q3": "Can I run code examples directly in the browser?",
  "learn.faq.a3": "Yes. JSON-related examples can be edited and executed in our interactive code editor without installing any development environment.",
  "learn.faq.q4": "Will tutorials be updated with new content?",
  "learn.faq.a4": "Yes. We continuously update our tutorials and plan to expand to 70+ articles in 2026, covering AI/LLM integration and other cutting-edge topics.",
  "learn.faq.q5": "How are these different from W3Schools or MDN tutorials?",
  "learn.faq.a5": "Our tutorials are deeper and more systematic with 53+ articles, interactive code editors, and a progressive learning path system.",

  "learn.footer.copyright": "© 2026 ToolboxNova. All tutorials are free to read.",
  "learn.footer.contribute": "Found an error? Help us improve.",

  "learn.ad.placeholder": "Ad Space"
}
```

### 中文：i18n/zh/json-learn.json

```json
{
  "learn.seo.title": "JSON 学习中心 — 53+ 篇免费教程 | ToolboxNova",
  "learn.seo.description": "从零基础到高级进阶，53+ 篇深度 JSON 教程，覆盖语法、多语言实战、Schema、安全与性能。完全免费，在线交互式学习。",
  "learn.seo.keywords": "JSON教程, JSON学习, JSON入门, JSON Schema, JSONPath, JSON格式化, JSON验证, JSON语法",

  "learn.hero.title": "JSON 学习中心",
  "learn.hero.subtitle": "从零基础到专家——互联网上最全面的免费 JSON 教程体系",
  "learn.hero.badge_tutorials": "53+ 篇教程",
  "learn.hero.badge_datasets": "70+ 数据集",
  "learn.hero.badge_languages": "10 种语言",
  "learn.hero.badge_free": "完全免费",

  "learn.path.beginner.title": "入门路径",
  "learn.path.beginner.desc": "学习 JSON 语法、数据类型和基本文件操作。",
  "learn.path.beginner.count": "10 篇文章",
  "learn.path.beginner.icon": "🌱",
  "learn.path.intermediate.title": "中级路径",
  "learn.path.intermediate.desc": "在你的语言中使用 JSON，修复错误，对比格式。",
  "learn.path.intermediate.count": "21 篇文章",
  "learn.path.intermediate.icon": "💻",
  "learn.path.advanced.title": "高级路径",
  "learn.path.advanced.desc": "Schema、JSONPath、jq、安全、数据库与 AI。",
  "learn.path.advanced.count": "22 篇文章",
  "learn.path.advanced.icon": "🚀",

  "learn.filter.all": "全部",
  "learn.filter.basics": "基础入门",
  "learn.filter.multi_lang": "多语言实战",
  "learn.filter.debugging": "错误排查",
  "learn.filter.comparison": "格式对比",
  "learn.filter.advanced_topics": "高级主题",
  "learn.filter.security": "安全与性能",
  "learn.filter.practical": "实战应用",
  "learn.filter.search_placeholder": "搜索教程...",
  "learn.filter.level_all": "全部",
  "learn.filter.level_beginner": "入门",
  "learn.filter.level_intermediate": "中级",
  "learn.filter.level_advanced": "高级",

  "learn.card.read_time": "{n} 分钟阅读",
  "learn.card.level_beginner": "入门",
  "learn.card.level_intermediate": "中级",
  "learn.card.level_advanced": "高级",
  "learn.card.updated": "更新于 {date}",

  "learn.article.toc_title": "目录",
  "learn.article.prev": "上一篇",
  "learn.article.next": "下一篇",
  "learn.article.related": "相关文章",
  "learn.article.back_to_list": "← 返回学习中心",
  "learn.article.share": "分享本文",
  "learn.article.print": "打印 / 导出 PDF",
  "learn.article.progress": "阅读进度",

  "learn.code.copy": "复制",
  "learn.code.copied": "已复制！",
  "learn.code.run": "运行",
  "learn.code.reset": "重置",
  "learn.code.output": "输出结果",
  "learn.code.editor_placeholder": "在此编辑 JSON，然后点击运行...",

  "learn.quiz.title": "练习题",
  "learn.quiz.submit": "提交答案",
  "learn.quiz.correct": "回答正确！做得好！",
  "learn.quiz.incorrect": "不太对哦，再试一次！",
  "learn.quiz.show_answer": "查看答案",
  "learn.quiz.explanation": "解析",
  "learn.quiz.try_again": "重新作答",
  "learn.quiz.score": "得分：{correct}/{total}",

  "learn.status.loading": "教程加载中...",
  "learn.status.empty": "没有找到符合条件的教程。",
  "learn.status.empty_search": "没有找到「{query}」的相关结果，请尝试其他关键词。",

  "learn.download.pdf": "下载 PDF",
  "learn.download.print": "打印本文",

  "learn.error.not_found": "文章未找到",
  "learn.error.not_found_desc": "你要找的文章不存在或已被移除。",
  "learn.error.load_failed": "内容加载失败，请刷新页面重试。",
  "learn.error.back": "返回学习中心",

  "learn.feature.privacy_title": "100% 隐私保护",
  "learn.feature.privacy_desc": "所有代码在浏览器中运行，不会向任何服务器发送数据。",
  "learn.feature.speed_title": "极速加载",
  "learn.feature.speed_desc": "优化的静态渲染，页面瞬间加载完成。",
  "learn.feature.free_title": "完全免费",
  "learn.feature.free_desc": "无需注册，无付费墙。全部 53+ 篇教程永久免费。",

  "learn.faq.title": "常见问题",
  "learn.faq.q1": "这些 JSON 教程适合完全零基础的人吗？",
  "learn.faq.a1": "完全适合。我们的入门路径从「什么是 JSON」讲起，配合图解和可运行代码示例，帮助零基础用户在 2 小时内掌握核心概念。",
  "learn.faq.q2": "教程覆盖哪些编程语言？",
  "learn.faq.a2": "覆盖 10 种主流语言：Python、JavaScript/Node.js、Java、Go、C#、PHP、Ruby、Rust、Swift 和 Kotlin，每种都有独立深度教程。",
  "learn.faq.q3": "代码示例可以直接在浏览器运行吗？",
  "learn.faq.a3": "可以。JSON 相关示例可在交互式编辑器中直接编辑运行，无需安装任何开发环境。",
  "learn.faq.q4": "教程内容会持续更新吗？",
  "learn.faq.a4": "会。我们持续跟踪 JSON 生态最新发展，计划 2026 年扩展到 70+ 篇，新增 AI/大模型等前沿主题。",
  "learn.faq.q5": "和 W3Schools、MDN 的 JSON 教程有什么不同？",
  "learn.faq.a5": "我们的教程更深入系统，53+ 篇文章配合交互式代码编辑器和渐进式学习路径系统。",

  "learn.footer.copyright": "© 2026 ToolboxNova. 所有教程免费阅读。",
  "learn.footer.contribute": "发现错误？帮助我们改进。",

  "learn.ad.placeholder": "广告位"
}
```

---

## 6. sitemap 新增条目

```xml
<!-- 学习中心首页 -->
<url>
  <loc>https://toolboxnova.com/json/learn</loc>
  <lastmod>2025-12-15</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>
</url>
<url>
  <loc>https://toolboxnova.com/json/learn?lang=zh</loc>
  <lastmod>2025-12-15</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
<url>
  <loc>https://toolboxnova.com/json/learn?lang=en</loc>
  <lastmod>2025-12-15</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>

<!-- 入门路径（10 篇） -->
<url><loc>https://toolboxnova.com/json/learn/what-is-json</loc><lastmod>2024-03-15</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-syntax-rules</loc><lastmod>2024-05-20</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-data-types</loc><lastmod>2024-06-10</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-objects</loc><lastmod>2024-07-08</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-arrays</loc><lastmod>2024-04-22</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-nesting</loc><lastmod>2024-08-15</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-files</loc><lastmod>2024-09-03</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-comments</loc><lastmod>2024-10-18</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-javascript</loc><lastmod>2023-11-25</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-online-tools</loc><lastmod>2024-01-12</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>

<!-- 中级路径 — 多语言实战（10 篇） -->
<url><loc>https://toolboxnova.com/json/learn/python-json</loc><lastmod>2024-02-20</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn/javascript-json</loc><lastmod>2024-03-10</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn/java-json</loc><lastmod>2024-04-15</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/go-json</loc><lastmod>2024-05-22</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/csharp-json</loc><lastmod>2024-06-30</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/php-json</loc><lastmod>2024-07-18</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/ruby-json</loc><lastmod>2024-08-25</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/rust-json</loc><lastmod>2024-09-12</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/swift-json</loc><lastmod>2024-10-05</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/kotlin-json</loc><lastmod>2024-11-20</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>

<!-- 中级路径 — 错误排查（5 篇） -->
<url><loc>https://toolboxnova.com/json/learn/json-syntax-errors</loc><lastmod>2024-12-05</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-parse-errors</loc><lastmod>2025-01-15</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-encoding</loc><lastmod>2025-02-20</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-number-precision</loc><lastmod>2025-03-10</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-circular-reference</loc><lastmod>2025-04-18</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>

<!-- 中级路径 — 格式对比（6 篇） -->
<url><loc>https://toolboxnova.com/json/learn/json-vs-xml</loc><lastmod>2023-05-22</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-vs-yaml</loc><lastmod>2023-06-15</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-vs-csv</loc><lastmod>2023-07-28</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-vs-toml</loc><lastmod>2023-08-10</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-vs-protobuf</loc><lastmod>2023-09-20</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-vs-msgpack</loc><lastmod>2023-10-15</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>

<!-- 高级路径 — 高级主题（8 篇） -->
<url><loc>https://toolboxnova.com/json/learn/json-schema-intro</loc><lastmod>2025-05-10</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-schema-advanced</loc><lastmod>2025-06-22</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn/jsonpath</loc><lastmod>2025-07-15</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-patch</loc><lastmod>2025-08-20</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-merge-patch</loc><lastmod>2025-09-05</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/jq-command-line</loc><lastmod>2025-10-12</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-pointer</loc><lastmod>2025-11-08</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-ld</loc><lastmod>2025-12-01</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>

<!-- 高级路径 — 安全与性能（6 篇） -->
<url><loc>https://toolboxnova.com/json/learn/json-injection</loc><lastmod>2023-11-15</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-hijacking</loc><lastmod>2023-12-20</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-performance</loc><lastmod>2024-01-25</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-streaming</loc><lastmod>2024-02-18</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-compression</loc><lastmod>2024-03-22</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/jwt-security</loc><lastmod>2024-04-15</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>

<!-- 高级路径 — 实战应用（8 篇） -->
<url><loc>https://toolboxnova.com/json/learn/restful-api-json</loc><lastmod>2024-05-20</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-config-patterns</loc><lastmod>2024-06-15</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-databases</loc><lastmod>2024-07-22</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-graphql</loc><lastmod>2024-08-10</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-data-migration</loc><lastmod>2024-09-25</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-microservices</loc><lastmod>2024-10-18</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-websocket</loc><lastmod>2024-11-08</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://toolboxnova.com/json/learn/json-ai-llm</loc><lastmod>2025-12-10</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
```

---

## 7. Header 导航新增子项

```html
<!-- partials/header.html — JSON 工具分类下新增 -->
<li class="nav-dropdown-item">
  <a href="/json/learn" class="nav-link" data-i18n="nav.json_learn">
    <span class="nav-icon">📚</span>
    <span class="nav-text">JSON 学习中心</span>
    <span class="nav-badge nav-badge--new">53+</span>
  </a>
</li>
```

---

## 8. 主页模块新增子项

```html
<!-- index.html — JSON 工具分类下新增卡片 -->
<div class="tool-card tool-card--featured" data-category="json">
  <a href="/json/learn" class="tool-card__link">
    <div class="tool-card__icon">📚</div>
    <h3 class="tool-card__title" data-i18n="home.json_learn_title">JSON 学习中心</h3>
    <p class="tool-card__desc" data-i18n="home.json_learn_desc">
      53+ 篇免费教程，从入门到精通的完整 JSON 学习路径
    </p>
    <div class="tool-card__meta">
      <span class="tool-card__badge">🌱 入门</span>
      <span class="tool-card__badge">💻 中级</span>
      <span class="tool-card__badge">🚀 高级</span>
    </div>
  </a>
</div>
```

