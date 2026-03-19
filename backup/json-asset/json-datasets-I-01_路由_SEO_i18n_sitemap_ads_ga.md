<!-- json-datasets-I-01_路由_SEO_i18n_sitemap_ads_ga.md -->

# json-datasets · I-01 路由 / SEO / i18n / Sitemap / Ads / GA

---

## 1. Go 路由注册

```go
// routes/json_datasets.go
func RegisterJSONDatasetsRoutes(r *gin.Engine, cfg *config.Config) {
    jsonGroup := r.Group("/json")
    jsonGroup.Use(middleware.LangDetect())   // 设置 c.Set("lang", "en"/"zh")
    jsonGroup.Use(middleware.SEOHeaders())   // X-Robots-Tag 等

    // 数据集列表页
    jsonGroup.GET("/datasets", handlers.JSONDatasetsHandler(cfg))

    // 单个数据集详情页（SEO 独立 URL）
    jsonGroup.GET("/datasets/:slug", handlers.JSONDatasetDetailHandler(cfg))

    // 静态数据集 JSON 文件（由 Gin 静态文件服务）
    r.Static("/static/datasets", "./static/datasets")
}
```

---

## 2. 页面 Handler

```go
// handlers/json_datasets.go
package handlers

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

func JSONDatasetsHandler(cfg *config.Config) gin.HandlerFunc {
    return func(c *gin.Context) {
        lang := c.GetString("lang") // "en" or "zh"

        faqData := getDatasetsFAQ(lang)

        seoData := map[string]interface{}{
            "Title":           i18n.T(lang, "seo.datasets.title"),
            "Description":     i18n.T(lang, "seo.datasets.description"),
            "OGTitle":         i18n.T(lang, "seo.datasets.og_title"),
            "OGDescription":   i18n.T(lang, "seo.datasets.og_description"),
            "CanonicalURL":    "https://toolboxnova.com/json/datasets",
            "HreflangEN":      "https://toolboxnova.com/json/datasets?lang=en",
            "HreflangZH":      "https://toolboxnova.com/json/datasets?lang=zh",
            "AdsEnabled":      cfg.AdsEnabled,
            "AdsClientID":     cfg.AdsClientID,
            "EnableGA":        cfg.EnableGA,
            "GAMeasurementID": cfg.GAMeasurementID,
            "Lang":            lang,
            "FAQData":         faqData,
        }

        c.HTML(http.StatusOK, "json/datasets.html", seoData)
    }
}

// FAQ 数据结构
type FAQItem struct {
    Question string
    Answer   string
}

func getDatasetsFAQ(lang string) []FAQItem {
    if lang == "zh" {
        return []FAQItem{
            {
                Question: "这些 JSON 数据集可以免费用于商业项目吗？",
                Answer:   "是的，所有数据集均采用开源授权，可免费用于个人和商业项目，无需注册或 API Key。",
            },
            {
                Question: "数据集的数据多久更新一次？",
                Answer:   "静态参考数据集（如国家列表、HTTP 状态码）不会频繁变动；动态类数据集（如加密货币市值排名）我们每季度审核更新一次。",
            },
            {
                Question: "如何在代码中直接引用数据集 URL？",
                Answer:   "每个数据集都提供 Raw JSON URL（格式：toolboxnova.com/static/datasets/<slug>.json），可在 fetch/axios 等 HTTP 客户端中直接使用，支持 CORS。",
            },
            {
                Question: "数据集支持哪些下载格式？",
                Answer:   "目前所有数据集均以标准 JSON 格式提供下载，后续将陆续支持 CSV、YAML 格式导出。",
            },
            {
                Question: "我可以贡献自己的数据集吗？",
                Answer:   "当然可以！请在 GitHub 提交 PR，并附上数据来源、授权说明和字段文档，我们会在 48 小时内审核。",
            },
        }
    }
    // English FAQ
    return []FAQItem{
        {
            Question: "Are these JSON datasets free for commercial use?",
            Answer:   "Yes, all datasets are open-source licensed and free for personal and commercial use. No registration or API key required.",
        },
        {
            Question: "How often are the datasets updated?",
            Answer:   "Static reference datasets (countries, HTTP codes) rarely change. Dynamic datasets (e.g., crypto rankings) are reviewed and updated quarterly.",
        },
        {
            Question: "Can I fetch dataset JSON directly via URL in my code?",
            Answer:   "Absolutely. Each dataset has a Raw JSON URL (format: toolboxnova.com/static/datasets/<slug>.json) that you can use with fetch, axios, or any HTTP client. CORS is enabled.",
        },
        {
            Question: "What download formats are supported?",
            Answer:   "All datasets are currently available as standard JSON. CSV and YAML export formats are coming soon.",
        },
        {
            Question: "Can I contribute my own dataset?",
            Answer:   "Yes! Submit a PR on GitHub with your data source, license info, and field documentation. We review contributions within 48 hours.",
        },
    }
}
```

---

## 3. SEO `<head>` 模板

```html
{{/* templates/json/datasets.html - extraHead block */}}
{{ define "extraHead" }}

<title>{{ .Title }}</title>
<meta name="description" content="{{ .Description }}">

<!-- Open Graph -->
<meta property="og:type"        content="website">
<meta property="og:title"       content="{{ .OGTitle }}">
<meta property="og:description" content="{{ .OGDescription }}">
<meta property="og:url"         content="{{ .CanonicalURL }}">
<meta property="og:image"       content="https://toolboxnova.com/static/og/json-datasets.png">
<meta property="og:site_name"   content="ToolboxNova">

<!-- Twitter Card -->
<meta name="twitter:card"        content="summary_large_image">
<meta name="twitter:title"       content="{{ .OGTitle }}">
<meta name="twitter:description" content="{{ .OGDescription }}">
<meta name="twitter:image"       content="https://toolboxnova.com/static/og/json-datasets.png">

<!-- Canonical & hreflang -->
<link rel="canonical" href="{{ .CanonicalURL }}">
<link rel="alternate" hreflang="en" href="{{ .HreflangEN }}">
<link rel="alternate" hreflang="zh" href="{{ .HreflangZH }}">
<link rel="alternate" hreflang="x-default" href="{{ .HreflangEN }}">

<!-- JSON-LD: SoftwareApplication -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "DataCatalog",
  "name": "Free JSON Datasets — ToolboxNova",
  "description": "85+ curated open-source JSON datasets for testing, learning, and building applications. Covers geographic, reference, finance, AI/ML, IoT, and more.",
  "url": "https://toolboxnova.com/json/datasets",
  "provider": {
    "@type": "Organization",
    "name": "ToolboxNova",
    "url": "https://toolboxnova.com"
  },
  "keywords": ["JSON datasets", "open data", "mock data", "test data", "JSON samples"],
  "license": "https://creativecommons.org/licenses/by/4.0/"
}
</script>

<!-- JSON-LD: FAQPage -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Are these JSON datasets free for commercial use?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, all datasets are open-source licensed and free for personal and commercial use. No registration or API key required."
      }
    },
    {
      "@type": "Question",
      "name": "Can I fetch dataset JSON directly via URL in my code?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Each dataset has a Raw JSON URL at toolboxnova.com/static/datasets/<slug>.json. CORS is enabled for direct browser/server fetch."
      }
    },
    {
      "@type": "Question",
      "name": "How often are the datasets updated?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Static reference datasets rarely change. Dynamic datasets are reviewed and updated quarterly."
      }
    }
  ]
}
</script>

<!-- AdSense SDK -->
{{ if .AdsEnabled }}
<script async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={{ .AdsClientID }}"
  crossorigin="anonymous"></script>
{{ end }}

{{ end }}
```

---

## 4. 广告接入 & GA 事件追踪

### 广告位插入点

```html
{{/* ① 顶部横幅：Hero 区下方 */}}
{{- template "partials/ad_slot.html" dict
    "SlotID"   "json-datasets-top"
    "Size"     "728x90"
    "Mobile"   "320x50"
    "ClientID" .AdsClientID
    "Enabled"  .AdsEnabled }}

{{/* ② 侧边栏：卡片网格右侧（移动端隐藏）*/}}
{{- template "partials/ad_slot.html" dict
    "SlotID"    "json-datasets-sidebar"
    "Size"      "300x250"
    "MobileHide" true
    "ClientID"  .AdsClientID
    "Enabled"   .AdsEnabled }}

{{/* ③ 底部横幅：FAQ 下方 */}}
{{- template "partials/ad_slot.html" dict
    "SlotID"   "json-datasets-bottom"
    "Size"     "728x90"
    "Mobile"   "320x50"
    "ClientID" .AdsClientID
    "Enabled"  .AdsEnabled }}
```

### GA 事件追踪

```javascript
{{ define "extraScript" }}
(function () {
  var TOOL = 'json-datasets';

  // 数据集复制
  document.addEventListener('dataset:copy', function (e) {
    gaTrackSettingChange(TOOL, 'copy', e.detail.slug);
  });

  // 数据集下载
  document.addEventListener('dataset:download', function (e) {
    gaTrackDownload(TOOL, 'application/json');
    // 自定义维度：数据集 slug
    gtag('event', 'dataset_download', {
      tool: TOOL,
      dataset_slug: e.detail.slug,
      dataset_category: e.detail.category
    });
  });

  // 数据集详情 Drawer 打开
  document.addEventListener('dataset:drawer_open', function (e) {
    gtag('event', 'dataset_drawer_open', {
      tool: TOOL,
      dataset_slug: e.detail.slug
    });
  });

  // 搜索行为
  document.addEventListener('dataset:search', function (e) {
    if (e.detail.query.length > 2) {
      gtag('event', 'dataset_search', {
        tool: TOOL,
        search_term: e.detail.query,
        result_count: e.detail.resultCount
      });
    }
  });

  // 分类 Tab 切换
  document.addEventListener('dataset:filter', function (e) {
    gaTrackSettingChange(TOOL, 'category_filter', e.detail.category);
  });

  // 错误追踪
  document.addEventListener('dataset:error', function (e) {
    gaTrackError(TOOL, 'load_fail', e.detail.slug);
  });
})();
{{ end }}
```

### Block 结构说明

| Block | 放置内容 | 说明 |
|-------|----------|------|
| `extraHead` | AdSense SDK 条件加载、SEO meta、JSON-LD | 在 `<head>` 末尾注入 |
| `content` | 页面主体 HTML（Hero、Tab 筛选、卡片网格、Drawer、FAQ、广告位插槽） | 替换 base.html 的 `{{ block "content" }}` |
| `extraScript` | GA 自定义事件绑定、数据集 JS 引擎初始化 | 在 `</body>` 前注入 |

---

## 5. 全量 i18n Key

### i18n/en.json（json-datasets 命名空间）

```json
{
  "seo.datasets.title": "Free JSON Datasets — 85+ Open Source Collections | ToolboxNova",
  "seo.datasets.description": "Download 85+ free, open-source JSON datasets for testing, development, and learning. Covers countries, currencies, HTTP codes, mock APIs, finance, AI models, IoT, and more.",
  "seo.datasets.og_title": "Free JSON Datasets — ToolboxNova",
  "seo.datasets.og_description": "85+ curated JSON datasets. No API key required. Ready to copy, validate, or download.",

  "hero.title": "Free JSON Datasets",
  "hero.subtitle": "85+ curated, open-source datasets for testing, building, and learning. No sign-up. No API key. Just data.",
  "hero.badge.total": "85 Datasets",
  "hero.badge.categories": "14 Categories",
  "hero.badge.license": "Open Source",

  "filter.all": "All",
  "filter.geographic": "Geographic",
  "filter.reference": "Reference",
  "filter.configuration": "Configuration",
  "filter.testing": "Testing",
  "filter.api_mocks": "API Mocks",
  "filter.finance": "Finance",
  "filter.science": "Science",
  "filter.sports": "Sports",
  "filter.devops": "DevOps",
  "filter.aiml": "AI / ML",
  "filter.government": "Government",
  "filter.social": "Social",
  "filter.iot": "IoT",
  "filter.healthcare": "Healthcare",
  "filter.search_placeholder": "Search datasets by name, field, or keyword…",
  "filter.sort.records_asc": "Records: Low to High",
  "filter.sort.records_desc": "Records: High to Low",
  "filter.sort.size_asc": "Size: Small First",
  "filter.sort.size_desc": "Size: Large First",
  "filter.sort.popular": "Most Popular",
  "filter.no_results": "No datasets found for \"{{query}}\". Try a different keyword.",

  "card.fields_label": "Fields",
  "card.records_label": "records",
  "card.copy": "Copy",
  "card.copied": "Copied!",
  "card.validate": "Validate",
  "card.download": "Download",
  "card.view_details": "View Details",

  "drawer.title": "Dataset Details",
  "drawer.close": "Close",
  "drawer.fields_title": "Fields",
  "drawer.field_type.string": "string",
  "drawer.field_type.number": "number",
  "drawer.field_type.boolean": "boolean",
  "drawer.field_type.array": "array",
  "drawer.field_type.object": "object",
  "drawer.field_type.null": "null",
  "drawer.preview_title": "JSON Preview",
  "drawer.api_url_label": "Raw JSON URL",
  "drawer.api_url_copy": "Copy URL",
  "drawer.use_cases_title": "Use Cases",
  "drawer.related_title": "Related Datasets",
  "drawer.download_btn": "Download JSON",
  "drawer.validate_btn": "Validate in Tool",

  "badge.geographic": "Geographic",
  "badge.reference": "Reference",
  "badge.configuration": "Configuration",
  "badge.testing": "Testing",
  "badge.api_mocks": "API Mocks",
  "badge.finance": "Finance",
  "badge.science": "Science",
  "badge.sports": "Sports",
  "badge.devops": "DevOps",
  "badge.aiml": "AI / ML",
  "badge.government": "Government",
  "badge.social": "Social",
  "badge.iot": "IoT",
  "badge.healthcare": "Healthcare",

  "status.copying": "Copying…",
  "status.copy_success": "Copied to clipboard!",
  "status.copy_fail": "Copy failed. Please select and copy manually.",
  "status.downloading": "Preparing download…",
  "status.loading": "Loading datasets…",

  "error.load_fail": "Failed to load dataset. Please try again.",
  "error.not_found": "Dataset not found.",

  "contribute.title": "Have a dataset to share?",
  "contribute.description": "Submit a contribution on GitHub. Include your data source, license, and field documentation.",
  "contribute.cta": "Submit on GitHub",

  "faq.q1": "Are these JSON datasets free for commercial use?",
  "faq.a1": "Yes, all datasets are open-source licensed and free for personal and commercial use. No registration or API key required.",
  "faq.q2": "How often are the datasets updated?",
  "faq.a2": "Static reference datasets (countries, HTTP codes) rarely change. Dynamic datasets are reviewed and updated quarterly.",
  "faq.q3": "Can I fetch dataset JSON directly via URL in my code?",
  "faq.a3": "Absolutely. Each dataset has a Raw JSON URL at toolboxnova.com/static/datasets/<slug>.json. CORS is enabled for browser and server-side fetch.",
  "faq.q4": "What download formats are supported?",
  "faq.a4": "All datasets are currently available as standard JSON. CSV and YAML export formats are coming soon.",
  "faq.q5": "Can I contribute my own dataset?",
  "faq.a5": "Yes! Submit a PR on GitHub with your data source, license info, and field documentation. We review contributions within 48 hours.",

  "cta.title": "Work with your JSON data",
  "cta.description": "Use our free tools to validate, format, convert, and explore JSON.",
  "cta.validator": "JSON Validator",
  "cta.formatter": "JSON Formatter",
  "cta.schema": "Schema Validator",
  "cta.diff": "JSON Diff",

  "footer.copyright": "© 2026 ToolboxNova. Free tools for developers.",
  "footer.privacy": "Privacy",
  "footer.about": "About",
  "footer.github": "GitHub"
}
```

### i18n/zh.json（json-datasets 命名空间）

```json
{
  "seo.datasets.title": "免费 JSON 数据集 — 85+ 开源合集 | ToolboxNova",
  "seo.datasets.description": "下载 85+ 个免费开源 JSON 数据集，涵盖国家、货币、HTTP 状态码、Mock API、金融、AI 模型、物联网等，无需注册，即可使用。",
  "seo.datasets.og_title": "免费 JSON 数据集 — ToolboxNova",
  "seo.datasets.og_description": "85+ 精选 JSON 数据集，无需 API Key，支持一键复制、验证和下载。",

  "hero.title": "免费 JSON 数据集",
  "hero.subtitle": "85+ 个开源数据集，用于测试、开发和学习。无需注册，无需 API Key，直接使用。",
  "hero.badge.total": "85 个数据集",
  "hero.badge.categories": "14 个分类",
  "hero.badge.license": "开源免费",

  "filter.all": "全部",
  "filter.geographic": "地理",
  "filter.reference": "参考",
  "filter.configuration": "配置模板",
  "filter.testing": "测试数据",
  "filter.api_mocks": "API Mock",
  "filter.finance": "金融",
  "filter.science": "科学",
  "filter.sports": "体育",
  "filter.devops": "DevOps",
  "filter.aiml": "AI / ML",
  "filter.government": "政府开放",
  "filter.social": "社交",
  "filter.iot": "物联网",
  "filter.healthcare": "医疗健康",
  "filter.search_placeholder": "按名称、字段或关键词搜索数据集…",
  "filter.sort.records_asc": "记录数：从少到多",
  "filter.sort.records_desc": "记录数：从多到少",
  "filter.sort.size_asc": "文件大小：从小到大",
  "filter.sort.size_desc": "文件大小：从大到小",
  "filter.sort.popular": "最受欢迎",
  "filter.no_results": "未找到与"{{query}}"匹配的数据集，请尝试其他关键词。",

  "card.fields_label": "字段",
  "card.records_label": "条记录",
  "card.copy": "复制",
  "card.copied": "已复制！",
  "card.validate": "验证",
  "card.download": "下载",
  "card.view_details": "查看详情",

  "drawer.title": "数据集详情",
  "drawer.close": "关闭",
  "drawer.fields_title": "字段列表",
  "drawer.field_type.string": "字符串",
  "drawer.field_type.number": "数字",
  "drawer.field_type.boolean": "布尔",
  "drawer.field_type.array": "数组",
  "drawer.field_type.object": "对象",
  "drawer.field_type.null": "空值",
  "drawer.preview_title": "JSON 预览",
  "drawer.api_url_label": "Raw JSON 地址",
  "drawer.api_url_copy": "复制地址",
  "drawer.use_cases_title": "适用场景",
  "drawer.related_title": "相关数据集",
  "drawer.download_btn": "下载 JSON",
  "drawer.validate_btn": "在验证器中打开",

  "badge.geographic": "地理",
  "badge.reference": "参考",
  "badge.configuration": "配置",
  "badge.testing": "测试",
  "badge.api_mocks": "API Mock",
  "badge.finance": "金融",
  "badge.science": "科学",
  "badge.sports": "体育",
  "badge.devops": "DevOps",
  "badge.aiml": "AI / ML",
  "badge.government": "政府",
  "badge.social": "社交",
  "badge.iot": "物联网",
  "badge.healthcare": "医疗",

  "status.copying": "复制中…",
  "status.copy_success": "已复制到剪贴板！",
  "status.copy_fail": "复制失败，请手动选中并复制。",
  "status.downloading": "准备下载中…",
  "status.loading": "加载数据集中…",

  "error.load_fail": "数据集加载失败，请重试。",
  "error.not_found": "数据集不存在。",

  "contribute.title": "有数据集想分享？",
  "contribute.description": "在 GitHub 提交贡献，附上数据来源、授权协议和字段文档。",
  "contribute.cta": "在 GitHub 提交",

  "faq.q1": "这些 JSON 数据集可以免费用于商业项目吗？",
  "faq.a1": "是的，所有数据集均采用开源授权，可免费用于个人和商业项目，无需注册或 API Key。",
  "faq.q2": "数据集多久更新一次？",
  "faq.a2": "静态参考数据集（国家列表、HTTP 状态码等）几乎不会变动；动态类数据集每季度审核更新一次。",
  "faq.q3": "如何在代码中直接通过 URL 获取数据集？",
  "faq.a3": "每个数据集都提供 Raw JSON URL（格式：toolboxnova.com/static/datasets/<slug>.json），可在 fetch/axios 中直接使用，已启用 CORS。",
  "faq.q4": "支持哪些下载格式？",
  "faq.a4": "目前所有数据集均以标准 JSON 格式提供；CSV 和 YAML 导出格式即将支持。",
  "faq.q5": "我可以贡献自己的数据集吗？",
  "faq.a5": "当然！请在 GitHub 提交 PR，附上数据来源、授权说明和字段文档，我们将在 48 小时内审核。",

  "cta.title": "处理你的 JSON 数据",
  "cta.description": "使用我们的免费工具验证、格式化、转换和浏览 JSON。",
  "cta.validator": "JSON 验证器",
  "cta.formatter": "JSON 格式化",
  "cta.schema": "Schema 验证",
  "cta.diff": "JSON 对比",

  "footer.copyright": "© 2026 ToolboxNova，为开发者提供免费工具。",
  "footer.privacy": "隐私政策",
  "footer.about": "关于",
  "footer.github": "GitHub"
}
```

---

## 6. sitemap 新增条目

```xml
<url>
  <loc>https://toolboxnova.com/json/datasets</loc>
  <lastmod>2025-11-01</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>
</url>
<url>
  <loc>https://toolboxnova.com/json/datasets?lang=zh</loc>
  <lastmod>2025-11-01</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
<url>
  <loc>https://toolboxnova.com/json/datasets/http-status-codes</loc>
  <lastmod>2024-06-15</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.7</priority>
</url>
<url>
  <loc>https://toolboxnova.com/json/datasets/countries</loc>
  <lastmod>2024-03-20</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.7</priority>
</url>
<url>
  <loc>https://toolboxnova.com/json/datasets/mock-users</loc>
  <lastmod>2023-07-18</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.6</priority>
</url>
<url>
  <loc>https://toolboxnova.com/json/datasets/crypto-coins</loc>
  <lastmod>2025-02-28</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.7</priority>
</url>
<url>
  <loc>https://toolboxnova.com/json/datasets/aws-regions</loc>
  <lastmod>2024-09-10</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.6</priority>
</url>
```

---

## 7. Header 导航新增子项

```html
<!-- partials/header.html — JSON Tools 分类下 -->
<li class="nav-sub-item">
  <a href="/json/datasets" data-i18n="nav.json_datasets">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="3" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/>
      <rect x="3" y="17" width="18" height="4" rx="1"/>
    </svg>
    <span data-i18n="nav.json_datasets">JSON Datasets</span>
    <span class="nav-badge">85+</span>
  </a>
</li>
```

---

## 8. 主页模块新增子项

```html
<!-- index.html — JSON Tools 工具卡片区 -->
<div class="tool-card" data-category="json">
  <a href="/json/datasets">
    <div class="tool-card__icon tool-card__icon--amber">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="4" rx="1"/>
        <rect x="3" y="10" width="18" height="4" rx="1"/>
        <rect x="3" y="17" width="18" height="4" rx="1"/>
      </svg>
    </div>
    <div class="tool-card__body">
      <h3 class="tool-card__title" data-i18n="home.json_datasets.title">JSON Datasets</h3>
      <p class="tool-card__desc" data-i18n="home.json_datasets.desc">
        85+ free open-source JSON datasets for testing and building.
      </p>
    </div>
    <span class="tool-card__badge tool-card__badge--new">85+</span>
  </a>
</div>
```
