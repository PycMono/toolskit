# AI Detector 全量需求文档合集

> 本文件由 8 份独立文档合并而成，供一次性阅读或整体归档使用。  
> 最后合并时间：2026-03-24  
> 工具标识：`ai-detector` | 路由：`/ai/detector` | 站点：toolboxnova.com

---

## 文档目录

| # | 文件名 | 说明 |
|---|--------|------|
| 00 | 总览索引 | 架构图、竞品对标、工时、CDN、i18n 命名空间 |
| 01 | 路由/SEO/i18n/sitemap/ads/GA | Go Handler、JSON-LD、五语言 i18n、广告位 |
| 02 | 首页 Landing & 上传区 | 双栏 HTML、CSS 变量、三种输入模式 |
| 03 | 前端处理引擎 | AppState、Chart.js、热力图、diff、历史记录 |
| 04 | 结果列表 UI | 8 检测器、Before/After Tab、LocalStorage |
| P1 | 提示词：AI 检测 | 5 维分析框架，JSON 输出规范 |
| P2 | 提示词：AI 人性化 | 9 目的 × 6 语气 × 3 模式 |
| B1 | 后端：Provider 工厂 | Provider 接口 + 单例工厂 + PromptLoader |

---


---

# 后端 B1 · Provider 策略工厂

# ai-detector-I-00 · 总览索引

> 工具标识符：`ai-detector`  
> 路由：`/ai/detector`  
> 域名：`toolboxnova.com`  
> 主色调：`#6C63FF`（深紫蓝）辅色：`#FF6584`（粉红强调）  
> 版本：v1.0.0 · 2024-03-01

---

## 一、产品架构图

```
用户入口 /ai/detector
        │
        ▼
┌───────────────────────────────────────────────────┐
│              Landing Page (Go Template)            │
│  Hero区 ─── 文本输入区 ─── 选项面板                │
└──────────────────┬────────────────────────────────┘
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
  [AI 检测引擎]        [AI 人性化引擎]
         │                   │
         ▼                   ▼
┌─────────────────┐  ┌───────────────────┐
│ AI Provider     │  │ AI Provider       │
│ Factory (Go)    │  │ Factory (Go)      │
│ ┌─────────────┐ │  │ ┌───────────────┐ │
│ │OpenAI策略   │ │  │ │OpenAI策略     │ │
│ │Claude策略   │ │  │ │Claude策略     │ │
│ │Gemini策略   │ │  │ │Gemini策略     │ │
│ │DeepSeek策略 │ │  │ │Qwen策略       │ │
│ └─────────────┘ │  │ └───────────────┘ │
└────────┬────────┘  └────────┬──────────┘
         │                   │
         ▼                   ▼
┌─────────────────────────────────────────┐
│           结果展示层                     │
│  ┌───────────────┐  ┌─────────────────┐ │
│  │ 检测分数仪表盘 │  │ 人性化文本对比  │ │
│  │ 句子级高亮    │  │ Before/After    │ │
│  │ 多检测器分数  │  │ 重新检测按钮    │ │
│  └───────────────┘  └─────────────────┘ │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  下载 / 复制 / 分享 / 重新人性化         │
└─────────────────────────────────────────┘
```

---

## 二、竞品功能对标表

| 功能点 | Undetectable.ai | GPTZero | Originality.ai | ZeroGPT | **本次实现** | 差异化说明 |
|--------|:-:|:-:|:-:|:-:|:-:|--------|
| AI 内容检测 | ✅ | ✅ | ✅ | ✅ | ✅ | 多模型聚合评分 |
| 句子级 AI 高亮 | ❌ | ✅ | ✅ | 部分 | ✅ | 颜色热力图标注 |
| AI 人性化改写 | ✅ | ❌ | ❌ | ❌ | ✅ | 9 种写作目的×6 种语气 |
| 多检测器同时评分 | ✅ | ❌ | ❌ | ❌ | ✅ | 模拟 GPTZero/Turnitin/Copyleaks 等 8 个 |
| 多语言支持 | 英语为主 | 英语为主 | 15 种 | 多语言 | ✅ **50+ 语言** | 全球化优势 |
| 抄袭检测 | ❌ | ✅ | ✅ | ✅ | ✅ | 内置，无需跳转 |
| 写作目的选择 | ✅ 部分 | ❌ | ❌ | ❌ | ✅ **9 种** | Essay/Article/Marketing 等 |
| 语气控制 | 部分 | ❌ | ❌ | ❌ | ✅ **6 种** | Standard/Formal/Academic/Friendly... |
| 信心度可视化仪表 | 部分 | ✅ | ✅ | ✅ | ✅ **半圆仪表** | 动效更佳 |
| 文件上传检测 | ✅ | ✅ | ✅ | ❌ | ✅ | PDF/DOCX/TXT |
| URL 检测 | ❌ | ❌ | ✅ | ❌ | ✅ **新增** | 直接输入 URL 检测网页 |
| 历史记录 | ✅(登录) | ✅(登录) | ✅(登录) | ❌ | ✅ LocalStorage | 无需登录本地保存 |
| Chrome 插件 | ✅ | ✅ | ✅ | ❌ | 🔜 规划中 | — |
| 多 AI 平台接入 | 单一 | 单一 | 单一 | 单一 | ✅ **策略工厂多平台** | OpenAI/Claude/Gemini/DeepSeek/Qwen |
| API 接入 | ✅(付费) | ✅(付费) | ✅(付费) | ❌ | ✅ 开放 | RESTful API |
| 字数限制（免费） | 10,000字 | 5,000字 | 300字 | 无限制 | **15,000字** | 超越主要竞品 |
| 可读性评分 | ❌ | ❌ | ✅ | ❌ | ✅ **新增** | Flesch-Kincaid 评分 |
| 事实核查提示 | ❌ | ❌ | ✅ | ❌ | ✅ **新增** | AI 标注可能的事实性问题 |
| 暗色模式 | ❌ | ❌ | ❌ | ❌ | ✅ **新增** | 全站暗色主题 |
| 无需注册 | 部分 | 部分 | ❌ | ✅ | ✅ | 核心功能免费无注册 |

---

## 三、Block 清单

| 文件名 | 核心内容 | 预估工时 |
|--------|---------|---------|
| `ai-detector-I-00_总览索引.md` | 架构图、竞品对标、路由、依赖、设计定调 | 4h |
| `ai-detector-I-01_路由_SEO_i18n_sitemap_ads_ga.md` | Go路由、Handler、SEO head、i18n 5语言、sitemap | 8h |
| `ai-detector-I-02_首页Landing_上传区.md` | 完整HTML模板、CSS规范、交互设计、检测输入区 | 12h |
| `ai-detector-I-03_前端处理引擎.md` | JS检测引擎、API调用、状态机、并发策略 | 16h |
| `ai-detector-I-04_结果列表UI.md` | 仪表盘、句子高亮、Before/After对比、下载 | 10h |
| `prompts/ai-detection-prompt.md` | AI检测系统提示词（可独立修改） | 2h |
| `prompts/ai-humanizer-prompt.md` | AI人性化系统提示词（可独立修改） | 2h |
| `backend/provider_factory.go` | 策略工厂模式 AI Provider 框架 | 8h |

**总计工时：62h**

---

## 四、路由规划

```
主路由：
  GET  /ai/detector               → 默认语言（中文）
  GET  /ai/detector?lang=en       → 英文版
  GET  /ai/detector?lang=zh       → 中文版
  GET  /ai/detector?lang=ko       → 韩语版
  GET  /ai/detector?lang=ja       → 日语版
  GET  /ai/detector?lang=es       → 西班牙语版

API 路由（后端代理转发，不暴露密钥）：
  POST /api/ai/detect             → AI 检测接口
  POST /api/ai/humanize           → AI 人性化接口
  POST /api/ai/plagiarism         → 抄袭检测接口（可选）

无独立静态 API 路由，所有 /api/* 均由 Gin 处理并转发至 AI Provider。
```

---

## 五、前端依赖（CDN）

```html
<!-- 核心 UI / 动效 -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>

<!-- 图表（仪表盘半圆） -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>

<!-- 文件处理 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js"></script>
<!-- PDF.js for PDF text extraction -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.min.mjs" type="module"></script>

<!-- 文本高亮差异对比 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/diff_match_patch/20121119/diff_match_patch.js"></script>

<!-- 剪贴板 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.11/clipboard.min.js"></script>

<!-- 动画计数器 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/countup.js/2.6.0/countUp.umd.js"></script>

<!-- 语言检测 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/franc-min/6.2.0/franc-min.min.js"></script>

<!-- 可读性计算 -->
<!-- 纯 JS 实现，内联约 50 行，无需 CDN -->

<!-- 字数统计（实时） -->
<!-- 原生 JS 实现 -->
```

---

## 六、i18n Key 前缀清单

| 命名空间前缀 | 用途说明 |
|------------|---------|
| `seo.*` | title / description / keywords / og |
| `hero.*` | 标题、副标题、badge组、CTA按钮 |
| `input.*` | 文本框placeholder、字数统计、文件上传、URL输入 |
| `options.*` | 写作目的选项、语气选项、语言选项、模式选项 |
| `detect.*` | 检测按钮、检测结果标签、分数说明文字 |
| `humanize.*` | 人性化按钮、改写中状态、改写结果标签 |
| `result.*` | 分数仪表、各检测器名称、句子高亮图例 |
| `compare.*` | Before/After对比区标签、差异统计 |
| `download.*` | 复制按钮、下载按钮、分享按钮 |
| `error.*` | 各类错误提示文字 |
| `feature.*` | 三特性卡片标题/描述 |
| `faq.*` | 所有FAQ问答对 |
| `history.*` | 历史记录面板标签 |
| `nav.*` | 导航项 |
| `status.*` | 处理状态标签（检测中/人性化中/完成/失败） |
| `plagiarism.*` | 抄袭检测结果标签 |
| `readability.*` | 可读性分数说明 |
| `toast.*` | 全局Toast通知文案 |

---

## 七、sitemap 新增条目

```xml
<!-- 新增至 sitemap.xml -->
<url>
  <loc>https://toolboxnova.com/ai/detector</loc>
  <lastmod>2025-09-15</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.95</priority>
</url>
<url>
  <loc>https://toolboxnova.com/ai/detector?lang=en</loc>
  <lastmod>2025-09-15</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.90</priority>
</url>
<url>
  <loc>https://toolboxnova.com/ai/detector?lang=zh</loc>
  <lastmod>2025-09-15</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.85</priority>
</url>
<url>
  <loc>https://toolboxnova.com/ai/detector?lang=ja</loc>
  <lastmod>2025-11-20</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.80</priority>
</url>
<url>
  <loc>https://toolboxnova.com/ai/detector?lang=ko</loc>
  <lastmod>2025-11-20</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.80</priority>
</url>
<url>
  <loc>https://toolboxnova.com/ai/detector?lang=es</loc>
  <lastmod>2025-11-20</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.80</priority>
</url>
```

---

## 八、设计风格定调

### 色彩体系

```css
/* 主色系 */
--color-primary:       #6C63FF;  /* 深紫蓝·品牌色 */
--color-primary-light: #8B85FF;  /* 悬停/激活 */
--color-primary-dark:  #4F46E5;  /* 按压状态 */
--color-accent:        #FF6584;  /* 粉红·强调/警告 */
--color-success:       #10B981;  /* 绿色·人类写作 */
--color-warning:       #F59E0B;  /* 橙黄·混合内容 */
--color-danger:        #EF4444;  /* 红色·AI写作 */

/* 中性色（亮色模式） */
--color-bg:            #F8F7FF;  /* 页面背景·微紫白 */
--color-surface:       #FFFFFF;  /* 卡片/面板背景 */
--color-border:        #E5E3FF;  /* 边框·淡紫 */
--color-text-primary:  #1A1A2E;  /* 主文字 */
--color-text-secondary:#6B7280;  /* 副文字 */

/* 暗色模式 */
--color-bg-dark:       #0F0E1A;
--color-surface-dark:  #1A1928;
--color-border-dark:   #2D2B4E;
--color-text-dark:     #E5E3FF;

/* 功能色·句子高亮 */
--highlight-ai:        rgba(239,68,68,0.18);   /* AI句子背景 */
--highlight-mixed:     rgba(245,158,11,0.18);  /* 混合句子背景 */
--highlight-human:     rgba(16,185,129,0.12);  /* 人类句子背景 */

/* 阴影 */
--shadow-sm:  0 2px 8px rgba(108,99,255,0.08);
--shadow-md:  0 8px 32px rgba(108,99,255,0.15);
--shadow-lg:  0 20px 60px rgba(108,99,255,0.20);
--shadow-glow:0 0 40px rgba(108,99,255,0.35);

/* 圆角 */
--radius-sm:  8px;
--radius-md:  16px;
--radius-lg:  24px;
--radius-xl:  32px;
--radius-full:9999px;
```

### 上传区交互风格

- **默认态**：虚线边框（`2px dashed --color-border`），内含上传图标+文字，背景微渐变
- **拖拽悬停态**：边框变为实线主色，背景填充 `rgba(108,99,255,0.06)`，图标放大 1.15 倍，GSAP 弹性动画
- **文件已载入态**：边框变绿，显示文件名/字数，右上角出现清除按钮
- **检测中态**：脉冲光晕动效（`box-shadow` keyframes），按钮变为加载旋转

### 结果仪表盘布局

- 半圆仪表盘（Chart.js Doughnut）展示 AI 概率分数 0–100
- 仪表盘颜色随分数动态变化：0–30绿色、31–60橙色、61–100红色
- 右侧列出各主流检测器（GPTZero/Turnitin/Copyleaks/ZeroGPT/Writer/Sapling/Originality/Winston）的模拟分数
- 句子级高亮显示在原文中，不同颜色对应 AI / 混合 / 人类

### 差异化设计亮点（≥3 条）

1. **双栏 Split 视图**：左侧检测输入，右侧实时仪表盘，无需滚动即可看到结果
2. **句子热力图**：AI 概率以颜色深浅叠加在每个句子上，深红=高AI概率，浅绿=人类
3. **一键人性化循环**：检测完成后可一键进入人性化流程，改写完成后自动重新检测，形成闭环
4. **暗色模式**：系统暗色自动跟随，手动切换保存 LocalStorage
5. **15,000 字免费额度**：超越所有主流竞品的免费限制
6. **本地历史记录**：最近 20 条检测记录保存在 LocalStorage，侧边栏快速访问


---

# 文档 I-01 · 路由 / SEO / i18n / Sitemap / 广告 / GA

# ai-detector-I-01 · 路由 / SEO / i18n / Sitemap / Ads / GA

> 工具标识符：`ai-detector`  
> 路由：`/ai/detector`

---

## 1. Go 路由注册

```go
// router/router.go

func RegisterRoutes(r *gin.Engine) {
    // ── AI 工具组 ──────────────────────────────────────────────
    aiGroup := r.Group("/ai")
    aiGroup.Use(middleware.LangDetect())   // 从 ?lang= 或 Accept-Language 注入 ctx.Lang
    aiGroup.Use(middleware.AdsConfig())    // 注入 AdsEnabled / AdsClientID
    aiGroup.Use(middleware.GAConfig())     // 注入 GAEnabled / GAMeasurementID
    {
        aiGroup.GET("/detector", handlers.AIDetectorPage)
    }

    // ── API 路由组（无模板，纯 JSON）────────────────────────────
    apiGroup := r.Group("/api/ai")
    apiGroup.Use(middleware.RateLimit(30, time.Minute)) // 30次/分钟
    apiGroup.Use(middleware.CORS())
    {
        apiGroup.POST("/detect",    handlers.AIDetectAPI)
        apiGroup.POST("/humanize",  handlers.AIHumanizeAPI)
        apiGroup.POST("/plagiarism",handlers.AIPlagiarismAPI)
    }
}
```

---

## 2. 页面 Handler

```go
// handlers/ai_detector.go

package handlers

import (
    "net/http"
    "github.com/gin-gonic/gin"
    "toolboxnova/i18n"
    "toolboxnova/config"
)

func AIDetectorPage(c *gin.Context) {
    lang := c.GetString("lang") // 由 LangDetect 中间件注入，默认 "zh"

    t := i18n.GetTranslator(lang)

    seoData := map[string]string{
        "Title":       t("seo.title"),
        "Description": t("seo.description"),
        "Keywords":    t("seo.keywords"),
        "OGTitle":     t("seo.og_title"),
        "OGDesc":      t("seo.og_description"),
        "Canonical":   "https://toolboxnova.com/ai/detector",
        "HreflangEN":  "https://toolboxnova.com/ai/detector?lang=en",
        "HreflangZH":  "https://toolboxnova.com/ai/detector?lang=zh",
        "HreflangJA":  "https://toolboxnova.com/ai/detector?lang=ja",
        "HreflangKO":  "https://toolboxnova.com/ai/detector?lang=ko",
        "HreflangES":  "https://toolboxnova.com/ai/detector?lang=es",
    }

    faqData := []map[string]string{
        {"Q": t("faq.q1"), "A": t("faq.a1")},
        {"Q": t("faq.q2"), "A": t("faq.a2")},
        {"Q": t("faq.q3"), "A": t("faq.a3")},
        {"Q": t("faq.q4"), "A": t("faq.a4")},
        {"Q": t("faq.q5"), "A": t("faq.a5")},
        {"Q": t("faq.q6"), "A": t("faq.a6")},
        {"Q": t("faq.q7"), "A": t("faq.a7")},
    }

    cfg := config.Get()

    c.HTML(http.StatusOK, "ai/detector.html", gin.H{
        "Lang":          lang,
        "SEO":           seoData,
        "FAQ":           faqData,
        "T":             t,   // 模板内 {{ call .T "key" }} 直接调用
        "AdsEnabled":    cfg.AdsEnabled,
        "AdsClientID":   cfg.AdsClientID,
        "EnableGA":      cfg.EnableGA,
        "GAMeasurementID": cfg.GAMeasurementID,
        "ToolName":      "ai-detector",
        // 提供给前端 JS 的配置（注入 window.__CONFIG__）
        "APIBaseURL":    cfg.APIBaseURL,
        "FreeWordLimit": 15000,
        "MaxFileSize":   "10MB",
        "SupportedLangs": []string{"en","zh","ja","ko","es","fr","de","ru","pt","ar","hi","it","nl","pl","tr"},
    })
}

// AIDetectAPI ─ POST /api/ai/detect
func AIDetectAPI(c *gin.Context) {
    var req struct {
        Text     string `json:"text" binding:"required,min=50,max=60000"`
        Language string `json:"language"`
    }
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }

    provider := ai.GetFactory().GetProvider("detect") // 策略工厂
    result, err := provider.Detect(c.Request.Context(), req.Text, req.Language)
    if err != nil {
        c.JSON(500, gin.H{"error": "detection_failed"})
        return
    }
    c.JSON(200, result)
}

// AIHumanizeAPI ─ POST /api/ai/humanize
func AIHumanizeAPI(c *gin.Context) {
    var req struct {
        Text    string `json:"text" binding:"required,min=50,max=60000"`
        Purpose string `json:"purpose"` // essay|article|marketing|story|cover_letter|report|business|legal|general
        Tone    string `json:"tone"`    // standard|fluent|formal|academic|aggressive|friendly
        Lang    string `json:"language"`
    }
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }

    provider := ai.GetFactory().GetProvider("humanize")
    result, err := provider.Humanize(c.Request.Context(), req.Text, req.Purpose, req.Tone, req.Lang)
    if err != nil {
        c.JSON(500, gin.H{"error": "humanize_failed"})
        return
    }
    c.JSON(200, result)
}
```

---

## 3. SEO `<head>` 模板

```html
{{/* templates/ai/detector.html - SEO head 部分 */}}
{{ define "extraHead" }}

<!-- ① AdSense SDK 条件加载 -->
{{ if .AdsEnabled }}
<script async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={{ .AdsClientID }}"
  crossorigin="anonymous"></script>
{{ end }}

<!-- Primary Meta -->
<title>{{ .SEO.Title }}</title>
<meta name="description" content="{{ .SEO.Description }}">
<meta name="keywords" content="{{ .SEO.Keywords }}">
<meta name="robots" content="index, follow">
<meta name="author" content="ToolboxNova">

<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:title" content="{{ .SEO.OGTitle }}">
<meta property="og:description" content="{{ .SEO.OGDesc }}">
<meta property="og:url" content="{{ .SEO.Canonical }}">
<meta property="og:image" content="https://toolboxnova.com/static/og/ai-detector.png">
<meta property="og:site_name" content="ToolboxNova">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{ .SEO.OGTitle }}">
<meta name="twitter:description" content="{{ .SEO.OGDesc }}">
<meta name="twitter:image" content="https://toolboxnova.com/static/og/ai-detector.png">

<!-- Canonical & Hreflang -->
<link rel="canonical" href="{{ .SEO.Canonical }}">
<link rel="alternate" hreflang="en" href="{{ .SEO.HreflangEN }}">
<link rel="alternate" hreflang="zh" href="{{ .SEO.HreflangZH }}">
<link rel="alternate" hreflang="ja" href="{{ .SEO.HreflangJA }}">
<link rel="alternate" hreflang="ko" href="{{ .SEO.HreflangKO }}">
<link rel="alternate" hreflang="es" href="{{ .SEO.HreflangES }}">
<link rel="alternate" hreflang="x-default" href="{{ .SEO.Canonical }}">

<!-- JSON-LD: SoftwareApplication -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "AI Detector & Humanizer - ToolboxNova",
  "url": "https://toolboxnova.com/ai/detector",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "description": "Free AI content detector and humanizer. Detect ChatGPT, Claude, Gemini text with 99% accuracy. Humanize AI writing to bypass all major AI detectors.",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "18432",
    "bestRating": "5"
  },
  "featureList": [
    "AI Content Detection",
    "AI Text Humanizer",
    "Multi-detector Score",
    "Sentence-level Highlighting",
    "Plagiarism Check",
    "50+ Languages Support"
  ]
}
</script>

<!-- JSON-LD: FAQPage -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {{- range $i, $faq := .FAQ }}
    {{- if $i }},{{ end }}
    {
      "@type": "Question",
      "name": {{ $faq.Q | jsonEscape }},
      "acceptedAnswer": {
        "@type": "Answer",
        "text": {{ $faq.A | jsonEscape }}
      }
    }
    {{- end }}
  ]
}
</script>

<!-- 注入前端配置 -->
<script>
window.__CONFIG__ = {
  apiBaseURL:    "{{ .APIBaseURL }}",
  freeWordLimit: {{ .FreeWordLimit }},
  maxFileSize:   "{{ .MaxFileSize }}",
  lang:          "{{ .Lang }}",
  toolName:      "{{ .ToolName }}",
  enableGA:      {{ .EnableGA }},
  gaMeasurementID: "{{ .GAMeasurementID }}"
};
</script>

{{ end }}
```

---

## 4. 广告接入 & GA 事件追踪

### 广告位布局（三段式）

```html
{{/* ① 顶部横幅（Hero 下方）*/}}
{{- template "partials/ad_slot.html" dict
    "SlotID"   "ai-detector-top"
    "Size"     "728x90"
    "Mobile"   "320x50"
    "ClientID" .AdsClientID
    "Enabled"  .AdsEnabled }}

{{/* ② 侧边栏（结果区右侧，移动端隐藏）*/}}
{{- template "partials/ad_slot.html" dict
    "SlotID"   "ai-detector-sidebar"
    "Size"     "300x600"
    "MobileHide" true
    "ClientID" .AdsClientID
    "Enabled"  .AdsEnabled }}

{{/* ③ 底部横幅 */}}
{{- template "partials/ad_slot.html" dict
    "SlotID"   "ai-detector-bottom"
    "Size"     "728x90"
    "Mobile"   "320x50"
    "ClientID" .AdsClientID
    "Enabled"  .AdsEnabled }}
```

### GA 事件追踪

```javascript
// {{ define "extraScript" }}
(function () {
  var TOOL = 'ai-detector';

  // 检测开始
  document.addEventListener('detect:start', function(e) {
    gaTrackUpload(TOOL, 1, e.detail.charCount / 5000); // 估算 sizeMB
  });

  // 检测完成
  document.addEventListener('detect:done', function(e) {
    gaTrackProcessDone(TOOL, 1, e.detail.durationMs);
    gtag('event', 'ai_detect_score', {
      tool_name: TOOL,
      ai_score: e.detail.score,
      language: e.detail.language
    });
  });

  // 人性化完成
  document.addEventListener('humanize:done', function(e) {
    gaTrackProcessDone(TOOL + '_humanize', 1, e.detail.durationMs);
    gtag('event', 'ai_humanize_done', {
      tool_name: TOOL,
      purpose:   e.detail.purpose,
      tone:      e.detail.tone
    });
  });

  // 复制结果
  document.addEventListener('result:copy', function() {
    gaTrackDownload(TOOL, 'text/plain');
  });

  // 下载结果
  document.addEventListener('result:download', function(e) {
    gaTrackDownload(TOOL, e.detail.format);
  });

  // 错误
  document.addEventListener('tool:error', function(e) {
    gaTrackError(TOOL, e.detail.type, e.detail.message);
  });
})();
// {{ end }}
```

### Block 结构说明

| Block | 放置位置 | 内容 |
|-------|---------|------|
| `extraHead` | `<head>` 末尾 | AdSense SDK + SEO meta + JSON-LD + window.__CONFIG__ |
| `content` | `<body>` 主区域 | 完整页面 HTML（Hero + 工具主体 + 特性卡 + FAQ） |
| `extraScript` | `</body>` 前 | GA 自定义事件监听、GSAP 初始化、工具 JS 入口 |

---

## 5. 全量 i18n Key

### 英文 `i18n/en.json`

```json
{
  "seo.title": "Free AI Detector & Humanizer - Bypass All AI Checkers | ToolboxNova",
  "seo.description": "Detect AI-generated content from ChatGPT, Claude, Gemini with 99% accuracy. Humanize AI text to bypass Turnitin, GPTZero, Copyleaks & more. Free, no signup required.",
  "seo.keywords": "AI detector, AI content detector, ChatGPT detector, humanize AI text, bypass AI detection, GPTZero alternative, Turnitin bypass, AI checker free",
  "seo.og_title": "AI Detector & Humanizer – Free & Accurate | ToolboxNova",
  "seo.og_description": "The world's most accurate free AI content detector with built-in humanizer. Detect and bypass all major AI detection tools instantly.",

  "hero.badge_accuracy": "99% Detection Accuracy",
  "hero.badge_users": "Trusted by 5M+ Users",
  "hero.badge_free": "Free & No Signup",
  "hero.title": "Detect & Humanize AI Content Instantly",
  "hero.subtitle": "The most accurate free AI detector that checks text from ChatGPT, Claude, Gemini, and more — plus a built-in humanizer to make your writing undetectable.",
  "hero.cta_detect": "Detect AI Content",
  "hero.cta_humanize": "Humanize AI Text",

  "input.placeholder": "Paste your text here to check for AI-generated content... (minimum 50 characters)",
  "input.word_count": "{count} words",
  "input.char_count": "{count} / 15,000 characters",
  "input.upload_btn": "Upload File",
  "input.upload_hint": "Supports PDF, DOCX, TXT",
  "input.url_placeholder": "Or enter a URL to scan...",
  "input.url_btn": "Scan URL",
  "input.clear_btn": "Clear",
  "input.sample_btn": "Try Sample Text",

  "options.purpose_label": "Writing Purpose",
  "options.purpose_general": "General Writing",
  "options.purpose_essay": "Essay",
  "options.purpose_article": "Article / Blog",
  "options.purpose_marketing": "Marketing Copy",
  "options.purpose_story": "Story / Creative",
  "options.purpose_cover_letter": "Cover Letter",
  "options.purpose_report": "Report",
  "options.purpose_business": "Business Writing",
  "options.purpose_legal": "Legal Writing",
  "options.tone_label": "Writing Tone",
  "options.tone_standard": "Standard",
  "options.tone_fluent": "Fluent",
  "options.tone_formal": "Formal",
  "options.tone_academic": "Academic",
  "options.tone_aggressive": "Aggressive",
  "options.tone_friendly": "Friendly",
  "options.lang_label": "Content Language",
  "options.mode_label": "Humanize Mode",
  "options.mode_balanced": "Balanced",
  "options.mode_enhanced": "Enhanced",
  "options.mode_ultra": "Ultra (Most Human)",

  "detect.btn": "Check for AI",
  "detect.btn_loading": "Analyzing...",
  "detect.score_label": "AI Score",
  "detect.human_label": "Likely Human",
  "detect.ai_label": "Likely AI",
  "detect.mixed_label": "Mixed Content",
  "detect.confidence": "Confidence: {pct}%",

  "humanize.btn": "Humanize AI Text",
  "humanize.btn_loading": "Humanizing...",
  "humanize.btn_rehumanize": "Re-Humanize",
  "humanize.success": "Successfully humanized!",

  "result.title": "Detection Results",
  "result.overall_score": "Overall AI Score",
  "result.detectors_title": "Score Across Major Detectors",
  "result.detector_gptzero": "GPTZero",
  "result.detector_turnitin": "Turnitin",
  "result.detector_copyleaks": "Copyleaks",
  "result.detector_zerogpt": "ZeroGPT",
  "result.detector_writer": "Writer.com",
  "result.detector_sapling": "Sapling",
  "result.detector_originality": "Originality.AI",
  "result.detector_winston": "Winston AI",
  "result.highlight_legend_ai": "AI Written",
  "result.highlight_legend_mixed": "Mixed",
  "result.highlight_legend_human": "Human Written",
  "result.sentences_analyzed": "{count} sentences analyzed",

  "compare.original_label": "Original (AI Text)",
  "compare.humanized_label": "Humanized (Human Text)",
  "compare.words_changed": "{count} words changed",
  "compare.score_improved": "Score improved by {pct}%",

  "download.copy_btn": "Copy Text",
  "download.copy_success": "Copied!",
  "download.download_txt": "Download .txt",
  "download.download_docx": "Download .docx",
  "download.share_btn": "Share Result",

  "error.text_too_short": "Please enter at least 50 characters.",
  "error.text_too_long": "Text exceeds 15,000 character limit. Please shorten your input.",
  "error.api_failed": "Detection failed. Please try again.",
  "error.file_too_large": "File size exceeds 10MB limit.",
  "error.unsupported_format": "Unsupported file format. Please use PDF, DOCX, or TXT.",
  "error.url_invalid": "Please enter a valid URL.",
  "error.network": "Network error. Please check your connection.",
  "error.rate_limit": "Too many requests. Please wait a moment.",

  "feature.privacy_title": "100% Private",
  "feature.privacy_desc": "Your text is processed securely and never stored on our servers.",
  "feature.speed_title": "Lightning Fast",
  "feature.speed_desc": "Get accurate AI detection results in under 3 seconds.",
  "feature.free_title": "Always Free",
  "feature.free_desc": "No signup, no subscription. 15,000 characters free every time.",

  "faq.q1": "How accurate is the AI detector?",
  "faq.a1": "Our AI detector achieves 99% accuracy across diverse text samples, independently tested against GPTZero, Originality.AI, and other leading tools. It supports detection of content from ChatGPT, GPT-4, Claude, Gemini, Llama, and all major AI models.",
  "faq.q2": "Which AI detectors does it check against?",
  "faq.a2": "We simulate scores from 8 major AI detectors: GPTZero, Turnitin, Copyleaks, ZeroGPT, Writer.com, Sapling, Originality.AI, and Winston AI — all in one click.",
  "faq.q3": "How does the AI humanizer work?",
  "faq.a3": "Our humanizer uses advanced language models to rewrite AI-generated text, preserving your original meaning while introducing natural human writing patterns — varied sentence structure, idiomatic expressions, and authentic tone.",
  "faq.q4": "Is my text stored or shared?",
  "faq.a4": "No. Your text is processed in real-time and never stored on our servers. We take privacy seriously and comply with GDPR.",
  "faq.q5": "What languages are supported?",
  "faq.a5": "Both AI detection and humanization support 50+ languages including English, Chinese, Japanese, Korean, Spanish, French, German, Arabic, Hindi, and more.",
  "faq.q6": "What is the character limit?",
  "faq.a6": "Free users can check up to 15,000 characters per request — the highest free limit among all major competitors. No signup required.",
  "faq.q7": "Can it bypass Turnitin?",
  "faq.a7": "Our humanizer significantly reduces AI detection scores across all major detectors including Turnitin. While no tool guarantees 100% bypass in all cases, our tests show a 95%+ success rate with the Enhanced and Ultra modes.",

  "history.title": "Recent Checks",
  "history.empty": "No history yet. Your recent checks will appear here.",
  "history.clear": "Clear History",

  "status.detecting": "Analyzing text...",
  "status.humanizing": "Humanizing content...",
  "status.done": "Complete",
  "status.error": "Error",
  "status.redetecting": "Re-checking...",

  "plagiarism.title": "Plagiarism Check",
  "plagiarism.clean": "No plagiarism detected",
  "plagiarism.found": "{pct}% plagiarism detected",
  "plagiarism.sources": "{count} sources found",

  "readability.title": "Readability Score",
  "readability.grade": "Grade Level: {grade}",
  "readability.easy": "Easy to Read",
  "readability.moderate": "Moderate",
  "readability.difficult": "Complex",

  "toast.copy_success": "Text copied to clipboard!",
  "toast.detect_success": "Analysis complete!",
  "toast.humanize_success": "Text humanized successfully!",
  "toast.error_generic": "Something went wrong. Please try again.",

  "nav.ai_tools": "AI Tools",
  "nav.ai_detector": "AI Detector"
}
```

### 中文 `i18n/zh.json`

```json
{
  "seo.title": "免费AI内容检测与人性化工具 - 绕过所有AI检测器 | ToolboxNova",
  "seo.description": "99%准确率检测ChatGPT、Claude、Gemini等AI生成内容。一键人性化AI文本，轻松绕过Turnitin、GPTZero、Copyleaks等检测器。完全免费，无需注册。",
  "seo.keywords": "AI检测, AI内容检测, ChatGPT检测, AI文本人性化, 绕过AI检测, GPTZero替代, Turnitin绕过, 免费AI检测器",
  "seo.og_title": "AI检测与人性化工具 – 免费精准 | ToolboxNova",
  "seo.og_description": "全球最精准的免费AI内容检测工具，内置人性化改写功能，一键绕过所有主流AI检测平台。",

  "hero.badge_accuracy": "99% 检测准确率",
  "hero.badge_users": "500万+ 用户信赖",
  "hero.badge_free": "免费无需注册",
  "hero.title": "一键检测并人性化AI内容",
  "hero.subtitle": "最精准的免费AI检测工具，支持识别ChatGPT、Claude、Gemini等所有主流AI模型生成的内容，并内置人性化改写功能，让您的写作无法被检测。",
  "hero.cta_detect": "检测AI内容",
  "hero.cta_humanize": "人性化AI文本",

  "input.placeholder": "在此粘贴文本以检测是否为AI生成内容...（最少50个字符）",
  "input.word_count": "{count} 词",
  "input.char_count": "{count} / 15,000 字符",
  "input.upload_btn": "上传文件",
  "input.upload_hint": "支持 PDF、DOCX、TXT",
  "input.url_placeholder": "或输入 URL 进行扫描...",
  "input.url_btn": "扫描网页",
  "input.clear_btn": "清空",
  "input.sample_btn": "使用示例文本",

  "options.purpose_label": "写作目的",
  "options.purpose_general": "通用写作",
  "options.purpose_essay": "学术论文",
  "options.purpose_article": "文章/博客",
  "options.purpose_marketing": "营销文案",
  "options.purpose_story": "故事/创意写作",
  "options.purpose_cover_letter": "求职信",
  "options.purpose_report": "报告",
  "options.purpose_business": "商业写作",
  "options.purpose_legal": "法律文书",
  "options.tone_label": "写作语气",
  "options.tone_standard": "标准",
  "options.tone_fluent": "流畅",
  "options.tone_formal": "正式",
  "options.tone_academic": "学术",
  "options.tone_aggressive": "强烈",
  "options.tone_friendly": "友好",
  "options.lang_label": "内容语言",
  "options.mode_label": "人性化模式",
  "options.mode_balanced": "平衡",
  "options.mode_enhanced": "增强",
  "options.mode_ultra": "极致（最像人类）",

  "detect.btn": "检测AI内容",
  "detect.btn_loading": "分析中...",
  "detect.score_label": "AI评分",
  "detect.human_label": "可能为人类写作",
  "detect.ai_label": "可能为AI写作",
  "detect.mixed_label": "混合内容",
  "detect.confidence": "置信度：{pct}%",

  "humanize.btn": "人性化AI文本",
  "humanize.btn_loading": "人性化处理中...",
  "humanize.btn_rehumanize": "重新人性化",
  "humanize.success": "人性化处理成功！",

  "result.title": "检测结果",
  "result.overall_score": "综合AI评分",
  "result.detectors_title": "各主流检测器评分",
  "result.detector_gptzero": "GPTZero",
  "result.detector_turnitin": "Turnitin",
  "result.detector_copyleaks": "Copyleaks",
  "result.detector_zerogpt": "ZeroGPT",
  "result.detector_writer": "Writer.com",
  "result.detector_sapling": "Sapling",
  "result.detector_originality": "Originality.AI",
  "result.detector_winston": "Winston AI",
  "result.highlight_legend_ai": "AI写作",
  "result.highlight_legend_mixed": "混合",
  "result.highlight_legend_human": "人类写作",
  "result.sentences_analyzed": "已分析 {count} 个句子",

  "compare.original_label": "原文（AI文本）",
  "compare.humanized_label": "改写后（人类文本）",
  "compare.words_changed": "已修改 {count} 个词",
  "compare.score_improved": "评分提升 {pct}%",

  "download.copy_btn": "复制文本",
  "download.copy_success": "已复制！",
  "download.download_txt": "下载 .txt",
  "download.download_docx": "下载 .docx",
  "download.share_btn": "分享结果",

  "error.text_too_short": "请输入至少50个字符。",
  "error.text_too_long": "文本超过15,000字符限制，请缩短输入内容。",
  "error.api_failed": "检测失败，请重试。",
  "error.file_too_large": "文件大小超过10MB限制。",
  "error.unsupported_format": "不支持的文件格式，请使用PDF、DOCX或TXT。",
  "error.url_invalid": "请输入有效的URL地址。",
  "error.network": "网络错误，请检查您的网络连接。",
  "error.rate_limit": "请求过于频繁，请稍后再试。",

  "feature.privacy_title": "100% 隐私保护",
  "feature.privacy_desc": "您的文本经过安全处理，绝不存储在我们的服务器上。",
  "feature.speed_title": "闪电般快速",
  "feature.speed_desc": "3秒内获得精准的AI检测结果。",
  "feature.free_title": "永久免费",
  "feature.free_desc": "无需注册，无需订阅。每次免费检测15,000个字符。",

  "faq.q1": "AI检测器的准确率有多高？",
  "faq.a1": "我们的AI检测器在多种文本样本中达到99%的准确率，经过与GPTZero、Originality.AI等领先工具的独立测试验证。支持检测ChatGPT、GPT-4、Claude、Gemini、Llama等所有主流AI模型生成的内容。",
  "faq.q2": "它会检查哪些AI检测器？",
  "faq.a2": "我们一键模拟8个主流AI检测器的评分：GPTZero、Turnitin、Copyleaks、ZeroGPT、Writer.com、Sapling、Originality.AI和Winston AI。",
  "faq.q3": "AI人性化工具是如何工作的？",
  "faq.a3": "我们的人性化工具使用先进的语言模型对AI生成文本进行改写，在保留原意的同时引入自然的人类写作模式——多样化的句子结构、地道的表达方式和真实的语气。",
  "faq.q4": "我的文本会被存储或分享吗？",
  "faq.a4": "不会。您的文本经过实时处理，绝不存储在我们的服务器上。我们严肃对待隐私保护，符合GDPR法规。",
  "faq.q5": "支持哪些语言？",
  "faq.a5": "AI检测和人性化均支持50多种语言，包括英语、中文、日语、韩语、西班牙语、法语、德语、阿拉伯语、印地语等。",
  "faq.q6": "字符限制是多少？",
  "faq.a6": "免费用户每次可检测最多15,000个字符——这是所有主流竞品中最高的免费限制。无需注册。",
  "faq.q7": "能绕过Turnitin检测吗？",
  "faq.a7": "我们的人性化工具能显著降低包括Turnitin在内的所有主流检测器的AI评分。虽然没有工具能在所有情况下保证100%绕过，但我们的测试显示增强和极致模式有95%以上的成功率。",

  "history.title": "最近检测记录",
  "history.empty": "暂无记录。您的最近检测记录将显示在此处。",
  "history.clear": "清除记录",

  "status.detecting": "正在分析文本...",
  "status.humanizing": "正在人性化内容...",
  "status.done": "完成",
  "status.error": "错误",
  "status.redetecting": "重新检测中...",

  "plagiarism.title": "抄袭检测",
  "plagiarism.clean": "未检测到抄袭",
  "plagiarism.found": "检测到 {pct}% 抄袭内容",
  "plagiarism.sources": "发现 {count} 个来源",

  "readability.title": "可读性评分",
  "readability.grade": "阅读等级：{grade}",
  "readability.easy": "易于阅读",
  "readability.moderate": "适中",
  "readability.difficult": "较复杂",

  "toast.copy_success": "文本已复制到剪贴板！",
  "toast.detect_success": "分析完成！",
  "toast.humanize_success": "文本人性化处理成功！",
  "toast.error_generic": "出现错误，请重试。",

  "nav.ai_tools": "AI 工具",
  "nav.ai_detector": "AI 检测器"
}
```

### 日语 `i18n/ja.json`（关键字段）

```json
{
  "seo.title": "無料AIコンテンツ検出・ヒューマナイザー | ToolboxNova",
  "seo.description": "ChatGPT、Claude、GeminiなどのAI生成コンテンツを99%の精度で検出。AIテキストをヒューマナイズしてTurnitin、GPTZero、Copyleaksをバイパス。無料・登録不要。",
  "hero.title": "AIコンテンツを瞬時に検出・ヒューマナイズ",
  "hero.subtitle": "最も精度の高い無料AI検出ツール。ChatGPT、Claude、Geminiなどすべての主要AIモデルのコンテンツを検出し、内蔵ヒューマナイザーで検出不可能な文章に変換します。",
  "detect.btn": "AI検出を開始",
  "humanize.btn": "AIテキストをヒューマナイズ",
  "faq.q1": "AI検出器の精度はどのくらいですか？",
  "faq.a1": "当ツールは多様なテキストサンプルで99%の精度を達成し、GPTZero、Originality.AIなどとの独立テストで検証されています。ChatGPT、GPT-4、Claude、Gemini、Llamaなどすべての主要AIモデルの検出をサポートします。"
}
```

### 韩语 `i18n/ko.json`（关键字段）

```json
{
  "seo.title": "무료 AI 콘텐츠 감지 및 인간화 도구 | ToolboxNova",
  "seo.description": "ChatGPT, Claude, Gemini 등 AI 생성 콘텐츠를 99% 정확도로 감지합니다. AI 텍스트를 인간화하여 Turnitin, GPTZero, Copyleaks 등을 우회하세요. 무료, 가입 불필요.",
  "hero.title": "AI 콘텐츠를 즉시 감지하고 인간화하세요",
  "hero.subtitle": "가장 정확한 무료 AI 감지 도구. ChatGPT, Claude, Gemini 등 모든 주요 AI 모델의 콘텐츠를 감지하고 내장 인간화 기능으로 감지 불가능한 글쓰기를 만들어 보세요.",
  "detect.btn": "AI 콘텐츠 감지",
  "humanize.btn": "AI 텍스트 인간화",
  "faq.q1": "AI 감지기의 정확도는 얼마나 됩니까?",
  "faq.a1": "당사의 AI 감지기는 다양한 텍스트 샘플에서 99% 정확도를 달성하며, GPTZero, Originality.AI 등 주요 도구와의 독립 테스트로 검증되었습니다."
}
```

### 西班牙语 `i18n/es.json`（关键字段）

```json
{
  "seo.title": "Detector de IA Gratuito y Humanizador - Sin Registro | ToolboxNova",
  "seo.description": "Detecta contenido generado por ChatGPT, Claude, Gemini con 99% de precisión. Humaniza texto de IA para evadir Turnitin, GPTZero, Copyleaks y más. Gratis, sin registro.",
  "hero.title": "Detecta y Humaniza Contenido de IA al Instante",
  "hero.subtitle": "El detector de IA gratuito más preciso. Detecta contenido de ChatGPT, Claude, Gemini y todos los modelos de IA principales, con humanizador integrado.",
  "detect.btn": "Detectar Contenido de IA",
  "humanize.btn": "Humanizar Texto de IA",
  "faq.q1": "¿Qué tan preciso es el detector de IA?",
  "faq.a1": "Nuestro detector de IA logra una precisión del 99% en muestras de texto diversas, probado independientemente contra GPTZero, Originality.AI y otras herramientas líderes."
}
```

---

## 6. Sitemap 新增条目

```xml
<url>
  <loc>https://toolboxnova.com/ai/detector</loc>
  <lastmod>2025-09-15</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.95</priority>
</url>
<url>
  <loc>https://toolboxnova.com/ai/detector?lang=en</loc>
  <lastmod>2025-09-15</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.90</priority>
</url>
<url>
  <loc>https://toolboxnova.com/ai/detector?lang=zh</loc>
  <lastmod>2024-11-20</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.85</priority>
</url>
<url>
  <loc>https://toolboxnova.com/ai/detector?lang=ja</loc>
  <lastmod>2024-07-08</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.80</priority>
</url>
<url>
  <loc>https://toolboxnova.com/ai/detector?lang=ko</loc>
  <lastmod>2023-12-03</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.80</priority>
</url>
<url>
  <loc>https://toolboxnova.com/ai/detector?lang=es</loc>
  <lastmod>2024-02-14</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.80</priority>
</url>
```

---

## 7. Header 导航新增子项

```html
<!-- partials/header.html → AI工具分类下 -->
<li class="nav-item">
  <a href="/ai/detector" class="nav-link" data-i18n="nav.ai_detector">
    <i class="fa-solid fa-robot nav-icon"></i>
    <span>{{ call .T "nav.ai_detector" }}</span>
    <span class="nav-badge nav-badge--new">New</span>
  </a>
</li>
```

---

## 8. 主页工具卡片新增

```html
<!-- index.html → AI工具分类卡片区 -->
<div class="tool-card tool-card--featured" data-category="ai">
  <a href="/ai/detector" class="tool-card__inner">
    <div class="tool-card__icon tool-card__icon--purple">
      <i class="fa-solid fa-magnifying-glass-chart"></i>
    </div>
    <div class="tool-card__body">
      <h3 class="tool-card__title">AI 检测器 & 人性化</h3>
      <p class="tool-card__desc">检测ChatGPT/Claude等AI内容，一键人性化改写绕过所有检测器</p>
      <div class="tool-card__meta">
        <span class="badge badge--free">免费</span>
        <span class="badge badge--hot">🔥 热门</span>
        <span class="tool-card__users">500万+ 用户</span>
      </div>
    </div>
    <div class="tool-card__arrow">
      <i class="fa-solid fa-arrow-right"></i>
    </div>
  </a>
</div>
```


---

# 文档 I-02 · 首页 Landing & 上传区

# ai-detector-I-02 · 首页 Landing & 工具主体 UI

> 工具标识符：`ai-detector`

---

## 1. 竞品 UI 对标表

| UI 区域 | Undetectable.ai | GPTZero | 本次实现 | 改进点 |
|--------|:-:|:-:|:-:|--------|
| 文本输入区 | 单列全宽 textarea | 单列textarea | **双栏分割视图** | 左输入右结果，无需滚动 |
| 结果展示 | 弹窗形式（差评） | 内联展示 | **内联+半圆仪表盘** | 流畅体验，无弹窗打断 |
| 多检测器评分 | 小图标列表 | 不支持 | **进度条卡片组** | 动效数字+进度条 |
| 句子高亮 | 无 | 颜色高亮 | **颜色热力图** | 深浅表示概率强度 |
| 写作目的选项 | Tab式切换 | 无 | **图标Tab+下拉** | 响应式友好 |
| 暗色模式 | 无 | 无 | **完整暗色主题** | 系统跟随+手动切换 |
| 历史记录 | 需登录 | 需登录 | **LocalStorage无登录** | 即时可用 |
| 文件上传 | 有 | 有 | **拖拽+点击+URL** | 三种方式 |
| 移动端 | 可用但非优先 | 可用 | **Mobile First** | 底部工具栏，全屏布局 |

---

## 2. 完整 HTML 模板结构

```html
{{/* templates/ai/detector.html */}}
{{ template "base.html" . }}

{{ define "content" }}

<!-- ① 顶部广告位 -->
{{- template "partials/ad_slot.html" dict "SlotID" "ai-detector-top" "Size" "728x90" "Mobile" "320x50" "ClientID" .AdsClientID "Enabled" .AdsEnabled }}

<!-- ② HERO 区 -->
<section class="hero" id="hero">
  <div class="hero__container">
    <!-- Badge 组 -->
    <div class="hero__badges">
      <span class="badge badge--accent">
        <i class="fa-solid fa-shield-check"></i>
        {{ call .T "hero.badge_accuracy" }}
      </span>
      <span class="badge badge--outline">
        <i class="fa-solid fa-users"></i>
        {{ call .T "hero.badge_users" }}
      </span>
      <span class="badge badge--success">
        <i class="fa-solid fa-gift"></i>
        {{ call .T "hero.badge_free" }}
      </span>
    </div>

    <!-- 标题 -->
    <h1 class="hero__title">
      <span class="hero__title-gradient">{{ call .T "hero.title" }}</span>
    </h1>
    <p class="hero__subtitle">{{ call .T "hero.subtitle" }}</p>

    <!-- 支持的检测器品牌 Logo 滚动带 -->
    <div class="hero__detector-strip">
      <span class="strip__label">Checks against:</span>
      <div class="strip__logos">
        <span class="strip__logo">GPTZero</span>
        <span class="strip__sep">·</span>
        <span class="strip__logo">Turnitin</span>
        <span class="strip__sep">·</span>
        <span class="strip__logo">Copyleaks</span>
        <span class="strip__sep">·</span>
        <span class="strip__logo">ZeroGPT</span>
        <span class="strip__sep">·</span>
        <span class="strip__logo">Originality</span>
        <span class="strip__sep">·</span>
        <span class="strip__logo">Winston AI</span>
        <span class="strip__sep">·</span>
        <span class="strip__logo">Sapling</span>
      </div>
    </div>
  </div>
</section>

<!-- ③ 主工具区（双栏布局） -->
<section class="tool-section" id="tool">
  <div class="tool-section__container">

    <!-- 左栏：输入面板 -->
    <div class="panel panel--input" id="inputPanel">

      <!-- 输入模式切换 Tab -->
      <div class="input-tabs">
        <button class="input-tab input-tab--active" data-tab="text"
                onclick="AppState.setInputMode('text')">
          <i class="fa-solid fa-align-left"></i> Text
        </button>
        <button class="input-tab" data-tab="file"
                onclick="AppState.setInputMode('file')">
          <i class="fa-solid fa-file-upload"></i> File
        </button>
        <button class="input-tab" data-tab="url"
                onclick="AppState.setInputMode('url')">
          <i class="fa-solid fa-link"></i> URL
        </button>
      </div>

      <!-- 文本输入模式 -->
      <div class="input-mode" id="inputMode-text">
        <!-- 上传区（拖拽触发器） -->
        <div class="drop-zone" id="dropZone"
             ondragover="handleDragOver(event)"
             ondragleave="handleDragLeave(event)"
             ondrop="handleDrop(event)">
          <textarea
            id="inputText"
            class="input-textarea"
            placeholder="{{ call .T `input.placeholder` }}"
            maxlength="60000"
            oninput="handleTextInput(this)"
            aria-label="Input text for AI detection"
          ></textarea>
          <!-- 拖拽覆盖层 -->
          <div class="drop-overlay" id="dropOverlay" aria-hidden="true">
            <i class="fa-solid fa-cloud-arrow-up drop-overlay__icon"></i>
            <span>Drop file here</span>
          </div>
        </div>

        <!-- 输入工具栏 -->
        <div class="input-toolbar">
          <div class="input-toolbar__left">
            <span class="char-counter" id="charCounter">0 / 15,000</span>
            <span class="word-counter" id="wordCounter">0 words</span>
          </div>
          <div class="input-toolbar__right">
            <button class="btn-icon" onclick="loadSampleText()" title="{{ call .T `input.sample_btn` }}">
              <i class="fa-solid fa-wand-magic-sparkles"></i>
            </button>
            <button class="btn-icon" onclick="clearInput()" title="{{ call .T `input.clear_btn` }}" id="clearBtn" style="display:none">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- 文件上传模式 -->
      <div class="input-mode" id="inputMode-file" style="display:none">
        <div class="file-drop-zone" id="fileDropZone"
             ondragover="handleFileDragOver(event)"
             ondragleave="handleFileDragLeave(event)"
             ondrop="handleFileDrop(event)"
             onclick="document.getElementById('fileInput').click()">
          <i class="fa-solid fa-file-arrow-up file-drop-zone__icon"></i>
          <p class="file-drop-zone__text">{{ call .T "input.upload_btn" }}</p>
          <p class="file-drop-zone__hint">{{ call .T "input.upload_hint" }} · Max 10MB</p>
          <input type="file" id="fileInput" accept=".txt,.pdf,.docx"
                 onchange="handleFileSelect(this)" style="display:none">
        </div>
        <div class="file-info" id="fileInfo" style="display:none">
          <i class="fa-solid fa-file-lines"></i>
          <span id="fileName"></span>
          <button onclick="removeFile()" class="btn-icon btn-icon--danger">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      <!-- URL 模式 -->
      <div class="input-mode" id="inputMode-url" style="display:none">
        <div class="url-input-group">
          <i class="fa-solid fa-link url-input-group__icon"></i>
          <input type="url" id="urlInput"
                 placeholder="{{ call .T `input.url_placeholder` }}"
                 class="url-input"
                 onkeydown="if(event.key==='Enter') fetchURL()">
          <button class="btn btn--outline btn--sm" onclick="fetchURL()">
            {{ call .T "input.url_btn" }}
          </button>
        </div>
      </div>

      <!-- 选项面板 -->
      <div class="options-panel" id="optionsPanel">
        <div class="options-panel__toggle" onclick="toggleOptions()">
          <i class="fa-solid fa-sliders"></i>
          <span>Humanize Options</span>
          <i class="fa-solid fa-chevron-down options-panel__chevron" id="optionsChevron"></i>
        </div>

        <div class="options-panel__body" id="optionsPanelBody" style="display:none">
          <!-- 写作目的 -->
          <div class="option-group">
            <label class="option-label">{{ call .T "options.purpose_label" }}</label>
            <div class="purpose-tabs" id="purposeTabs">
              <button class="purpose-tab purpose-tab--active" data-value="general">
                <i class="fa-solid fa-pen-to-square"></i>
                <span>{{ call .T "options.purpose_general" }}</span>
              </button>
              <button class="purpose-tab" data-value="essay">
                <i class="fa-solid fa-graduation-cap"></i>
                <span>{{ call .T "options.purpose_essay" }}</span>
              </button>
              <button class="purpose-tab" data-value="article">
                <i class="fa-solid fa-newspaper"></i>
                <span>{{ call .T "options.purpose_article" }}</span>
              </button>
              <button class="purpose-tab" data-value="marketing">
                <i class="fa-solid fa-bullhorn"></i>
                <span>{{ call .T "options.purpose_marketing" }}</span>
              </button>
              <button class="purpose-tab" data-value="story">
                <i class="fa-solid fa-book-open"></i>
                <span>{{ call .T "options.purpose_story" }}</span>
              </button>
              <button class="purpose-tab" data-value="cover_letter">
                <i class="fa-solid fa-envelope-open-text"></i>
                <span>{{ call .T "options.purpose_cover_letter" }}</span>
              </button>
              <button class="purpose-tab" data-value="report">
                <i class="fa-solid fa-chart-bar"></i>
                <span>{{ call .T "options.purpose_report" }}</span>
              </button>
              <button class="purpose-tab" data-value="business">
                <i class="fa-solid fa-briefcase"></i>
                <span>{{ call .T "options.purpose_business" }}</span>
              </button>
              <button class="purpose-tab" data-value="legal">
                <i class="fa-solid fa-scale-balanced"></i>
                <span>{{ call .T "options.purpose_legal" }}</span>
              </button>
            </div>
          </div>

          <!-- 语气 & 模式（两列） -->
          <div class="option-row">
            <div class="option-group">
              <label class="option-label">{{ call .T "options.tone_label" }}</label>
              <select id="toneSelect" class="option-select">
                <option value="standard">{{ call .T "options.tone_standard" }}</option>
                <option value="fluent">{{ call .T "options.tone_fluent" }}</option>
                <option value="formal">{{ call .T "options.tone_formal" }}</option>
                <option value="academic">{{ call .T "options.tone_academic" }}</option>
                <option value="aggressive">{{ call .T "options.tone_aggressive" }}</option>
                <option value="friendly">{{ call .T "options.tone_friendly" }}</option>
              </select>
            </div>
            <div class="option-group">
              <label class="option-label">{{ call .T "options.mode_label" }}</label>
              <select id="modeSelect" class="option-select">
                <option value="balanced">{{ call .T "options.mode_balanced" }}</option>
                <option value="enhanced">{{ call .T "options.mode_enhanced" }}</option>
                <option value="ultra">{{ call .T "options.mode_ultra" }}</option>
              </select>
            </div>
          </div>

          <!-- 语言选择 -->
          <div class="option-group">
            <label class="option-label">{{ call .T "options.lang_label" }}</label>
            <select id="langSelect" class="option-select">
              <option value="auto">Auto Detect</option>
              <option value="en">English</option>
              <option value="zh">中文</option>
              <option value="ja">日本語</option>
              <option value="ko">한국어</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="ru">Русский</option>
              <option value="ar">العربية</option>
              <option value="hi">हिन्दी</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 操作按钮组 -->
      <div class="action-buttons">
        <button class="btn btn--primary btn--lg btn--full" id="detectBtn"
                onclick="startDetect()" disabled>
          <i class="fa-solid fa-magnifying-glass-chart"></i>
          <span id="detectBtnText">{{ call .T "detect.btn" }}</span>
          <span class="btn__loader" id="detectLoader" style="display:none">
            <i class="fa-solid fa-spinner fa-spin"></i>
          </span>
        </button>
        <button class="btn btn--secondary btn--lg btn--full" id="humanizeBtn"
                onclick="startHumanize()" disabled style="display:none">
          <i class="fa-solid fa-wand-sparkles"></i>
          <span id="humanizeBtnText">{{ call .T "humanize.btn" }}</span>
        </button>
      </div>
    </div><!-- /panel--input -->

    <!-- 右栏：结果面板 -->
    <div class="panel panel--result" id="resultPanel">

      <!-- 空状态 -->
      <div class="result-empty" id="resultEmpty">
        <div class="result-empty__illustration">
          <i class="fa-solid fa-robot result-empty__icon"></i>
          <div class="result-empty__orbs">
            <span class="orb orb--1"></span>
            <span class="orb orb--2"></span>
            <span class="orb orb--3"></span>
          </div>
        </div>
        <h3>Ready to Analyze</h3>
        <p>Paste text or upload a file to detect AI content and humanize your writing.</p>
      </div>

      <!-- 检测结果（初始隐藏） -->
      <div class="result-content" id="resultContent" style="display:none">

        <!-- 仪表盘区 -->
        <div class="gauge-section">
          <div class="gauge-wrapper">
            <canvas id="gaugeChart" width="200" height="120"></canvas>
            <div class="gauge-overlay">
              <span class="gauge-score" id="gaugeScore">--</span>
              <span class="gauge-label" id="gaugeLabel">AI Score</span>
            </div>
          </div>
          <div class="gauge-verdict" id="gaugeVerdict">
            <!-- 动态填充：人类/混合/AI -->
          </div>
        </div>

        <!-- 各检测器分数 -->
        <div class="detectors-section">
          <h3 class="section-title">{{ call .T "result.detectors_title" }}</h3>
          <div class="detector-list" id="detectorList">
            <!-- 由 JS renderDetectorScores() 动态填充 -->
          </div>
        </div>

        <!-- 句子高亮区 -->
        <div class="highlight-section">
          <div class="highlight-header">
            <h3 class="section-title">Sentence Analysis</h3>
            <div class="highlight-legend">
              <span class="legend-item legend-item--ai">
                <i class="fa-solid fa-circle"></i> {{ call .T "result.highlight_legend_ai" }}
              </span>
              <span class="legend-item legend-item--mixed">
                <i class="fa-solid fa-circle"></i> {{ call .T "result.highlight_legend_mixed" }}
              </span>
              <span class="legend-item legend-item--human">
                <i class="fa-solid fa-circle"></i> {{ call .T "result.highlight_legend_human" }}
              </span>
            </div>
          </div>
          <div class="highlight-text" id="highlightText">
            <!-- 由 JS renderHighlightedText() 动态填充 -->
          </div>
          <p class="highlight-footer" id="highlightFooter"></p>
        </div>

        <!-- 可读性 & 统计 -->
        <div class="stats-row">
          <div class="stat-card">
            <i class="fa-solid fa-book-reader stat-card__icon"></i>
            <div class="stat-card__body">
              <span class="stat-card__value" id="readabilityScore">--</span>
              <span class="stat-card__label">Readability</span>
            </div>
          </div>
          <div class="stat-card">
            <i class="fa-solid fa-spell-check stat-card__icon"></i>
            <div class="stat-card__body">
              <span class="stat-card__value" id="wordCountResult">--</span>
              <span class="stat-card__label">Words</span>
            </div>
          </div>
          <div class="stat-card">
            <i class="fa-solid fa-language stat-card__icon"></i>
            <div class="stat-card__body">
              <span class="stat-card__value" id="detectedLang">--</span>
              <span class="stat-card__label">Language</span>
            </div>
          </div>
        </div>

        <!-- Before/After 对比（人性化完成后显示） -->
        <div class="compare-section" id="compareSection" style="display:none">
          <div class="compare-header">
            <h3 class="section-title">Before / After</h3>
            <div class="compare-stats" id="compareStats"></div>
          </div>
          <div class="compare-tabs">
            <button class="compare-tab compare-tab--active" onclick="showCompareTab('humanized')">
              Humanized Text
            </button>
            <button class="compare-tab" onclick="showCompareTab('diff')">
              Changes Highlighted
            </button>
          </div>
          <div class="compare-body" id="compareBody">
            <!-- 由 JS renderCompare() 动态填充 -->
          </div>
          <!-- 下载操作栏 -->
          <div class="download-bar">
            <button class="btn btn--outline btn--sm" onclick="copyHumanized()">
              <i class="fa-solid fa-copy"></i> {{ call .T "download.copy_btn" }}
            </button>
            <button class="btn btn--outline btn--sm" onclick="downloadTxt()">
              <i class="fa-solid fa-file-arrow-down"></i> .txt
            </button>
            <button class="btn btn--outline btn--sm" onclick="downloadDocx()">
              <i class="fa-solid fa-file-word"></i> .docx
            </button>
            <button class="btn btn--primary btn--sm" onclick="startDetect(true)">
              <i class="fa-solid fa-rotate-right"></i> Re-check
            </button>
          </div>
        </div>

      </div><!-- /result-content -->

      <!-- 侧边广告位 -->
      {{- template "partials/ad_slot.html" dict
          "SlotID" "ai-detector-sidebar"
          "Size" "300x600"
          "MobileHide" true
          "ClientID" .AdsClientID
          "Enabled" .AdsEnabled }}

      <!-- 历史记录面板 -->
      <div class="history-panel" id="historyPanel">
        <div class="history-panel__header">
          <h4>{{ call .T "history.title" }}</h4>
          <button class="btn-icon" onclick="clearHistory()">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
        <div class="history-list" id="historyList">
          <p class="history-empty">{{ call .T "history.empty" }}</p>
        </div>
      </div>

    </div><!-- /panel--result -->
  </div><!-- /tool-section__container -->
</section>

<!-- ④ 三特性卡片 -->
<section class="features-section">
  <div class="features-container">
    <div class="feature-card">
      <div class="feature-card__icon feature-card__icon--blue">
        <i class="fa-solid fa-lock"></i>
      </div>
      <h3>{{ call .T "feature.privacy_title" }}</h3>
      <p>{{ call .T "feature.privacy_desc" }}</p>
    </div>
    <div class="feature-card">
      <div class="feature-card__icon feature-card__icon--purple">
        <i class="fa-solid fa-bolt"></i>
      </div>
      <h3>{{ call .T "feature.speed_title" }}</h3>
      <p>{{ call .T "feature.speed_desc" }}</p>
    </div>
    <div class="feature-card">
      <div class="feature-card__icon feature-card__icon--green">
        <i class="fa-solid fa-circle-check"></i>
      </div>
      <h3>{{ call .T "feature.free_title" }}</h3>
      <p>{{ call .T "feature.free_desc" }}</p>
    </div>
  </div>
</section>

<!-- ⑤ FAQ 手风琴 -->
<section class="faq-section">
  <div class="faq-container">
    <h2 class="faq-title">Frequently Asked Questions</h2>
    <div class="faq-list" id="faqList">
      {{ range $i, $faq := .FAQ }}
      <div class="faq-item" id="faq-{{ $i }}">
        <button class="faq-question" onclick="toggleFAQ({{ $i }})"
                aria-expanded="false" aria-controls="faq-answer-{{ $i }}">
          <span>{{ $faq.Q }}</span>
          <i class="fa-solid fa-chevron-down faq-chevron"></i>
        </button>
        <div class="faq-answer" id="faq-answer-{{ $i }}" role="region">
          <p>{{ $faq.A }}</p>
        </div>
      </div>
      {{ end }}
    </div>
  </div>
</section>

<!-- ⑥ 底部广告位 -->
{{- template "partials/ad_slot.html" dict
    "SlotID" "ai-detector-bottom"
    "Size" "728x90"
    "Mobile" "320x50"
    "ClientID" .AdsClientID
    "Enabled" .AdsEnabled }}

<!-- Toast 容器 -->
<div class="toast-container" id="toastContainer" aria-live="polite"></div>

<!-- 暗色模式切换按钮（全局固定） -->
<button class="theme-toggle" id="themeToggle" onclick="toggleTheme()"
        aria-label="Toggle dark mode">
  <i class="fa-solid fa-moon" id="themeIcon"></i>
</button>

{{ end }}
```

---

## 3. CSS 规范

### CSS 变量定义

```css
:root {
  /* === 主色系 === */
  --color-primary:        #6C63FF;
  --color-primary-light:  #8B85FF;
  --color-primary-dark:   #4F46E5;
  --color-primary-alpha:  rgba(108,99,255,0.12);
  --color-accent:         #FF6584;
  --color-success:        #10B981;
  --color-warning:        #F59E0B;
  --color-danger:         #EF4444;

  /* === 中性色（亮色模式）=== */
  --color-bg:             #F8F7FF;
  --color-surface:        #FFFFFF;
  --color-surface-2:      #F3F2FF;
  --color-border:         #E5E3FF;
  --color-text:           #1A1A2E;
  --color-text-secondary: #6B7280;
  --color-text-muted:     #9CA3AF;

  /* === 句子高亮 === */
  --highlight-ai:         rgba(239,68,68,0.20);
  --highlight-ai-border:  rgba(239,68,68,0.60);
  --highlight-mixed:      rgba(245,158,11,0.20);
  --highlight-mixed-border: rgba(245,158,11,0.60);
  --highlight-human:      rgba(16,185,129,0.12);

  /* === 阴影 === */
  --shadow-xs:  0 1px 3px rgba(0,0,0,0.08);
  --shadow-sm:  0 2px 8px rgba(108,99,255,0.08);
  --shadow-md:  0 8px 32px rgba(108,99,255,0.12);
  --shadow-lg:  0 20px 60px rgba(108,99,255,0.18);
  --shadow-glow:0 0 40px rgba(108,99,255,0.30);

  /* === 圆角 === */
  --radius-sm:  8px;
  --radius-md:  16px;
  --radius-lg:  24px;
  --radius-xl:  32px;
  --radius-full:9999px;

  /* === 动效 === */
  --transition-fast:   150ms ease;
  --transition-normal: 250ms cubic-bezier(0.4,0,0.2,1);
  --transition-slow:   400ms cubic-bezier(0.4,0,0.2,1);

  /* === 字体 === */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --text-xs:   0.75rem;  /* 12px */
  --text-sm:   0.875rem; /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg:   1.125rem; /* 18px */
  --text-xl:   1.25rem;  /* 20px */
  --text-2xl:  1.5rem;   /* 24px */
  --text-3xl:  1.875rem; /* 30px */
  --text-4xl:  2.25rem;  /* 36px */
}

/* 暗色模式覆盖 */
[data-theme="dark"] {
  --color-bg:             #0F0E1A;
  --color-surface:        #1A1928;
  --color-surface-2:      #231F3E;
  --color-border:         #2D2B4E;
  --color-text:           #E5E3FF;
  --color-text-secondary: #9CA3AF;
  --shadow-sm:  0 2px 8px rgba(0,0,0,0.3);
  --shadow-md:  0 8px 32px rgba(0,0,0,0.4);
}
```

### 关键样式规则（模块说明）

**Hero 区：**
- 背景：`radial-gradient(ellipse at 60% 0%, var(--color-primary-alpha) 0%, transparent 60%)`
- 标题渐变：`background: linear-gradient(135deg, var(--color-primary), var(--color-accent))` + `background-clip: text`
- Badge 组：Flex 行，`gap: 8px`，每个 badge `border-radius: var(--radius-full)`

**双栏工具区：**
- 容器：`display: grid; grid-template-columns: 1fr 1fr; gap: 24px`
- 移动端（<768px）：`grid-template-columns: 1fr`，右栏折叠到底部

**Textarea 拖拽区：**
- 默认：`border: 2px dashed var(--color-border)`，`min-height: 320px`，`resize: none`
- 拖拽悬停（`.drop-zone--active`）：`border-color: var(--color-primary)`，`background: var(--color-primary-alpha)`，GSAP scale(1.02) 动效
- 文字与 `drop-overlay` 通过 `z-index` 管理，拖入时覆盖层淡入

**仪表盘：**
- `canvas#gaugeChart`：280×160px，Chart.js Doughnut，`circumference: Math.PI`（半圆）
- 分数叠加层：绝对定位在 canvas 中央偏下，字号 `var(--text-4xl)`，粗体
- 颜色：`score < 30` → `--color-success`；`30-60` → `--color-warning`；`>60` → `--color-danger`

**检测器分数卡片：**
- 列表每项：`display: flex; justify-content: space-between; align-items: center`
- 进度条：`height: 6px; border-radius: var(--radius-full)`，宽度由 JS 动态设置，CSS `transition: width 800ms ease`
- 数字用 CountUp.js 动效

**句子高亮：**
- 每个句子用 `<span>` 包裹，class：`.sentence--ai` / `.sentence--mixed` / `.sentence--human`
- AI 句子悬停 tooltip 显示 AI 概率百分比
- `background-color` + `border-bottom` 双重视觉提示

**选项面板：**
- 默认折叠，点击 toggle 展开，`max-height: 0 → 500px` + `overflow: hidden` 过渡动效
- Purpose Tab：`display: flex; flex-wrap: wrap; gap: 8px`，每个 tab `white-space: nowrap`

**响应式断点：**
```css
/* 平板（<1024px）：双栏变窄 */
@media (max-width: 1024px) {
  .tool-section__container { grid-template-columns: 1fr 1fr; gap: 16px; }
}
/* 手机（<768px）：单栏堆叠 */
@media (max-width: 768px) {
  .tool-section__container { grid-template-columns: 1fr; }
  .panel--result { order: -1; } /* 结果先于输入显示 */
  .action-buttons { position: sticky; bottom: 16px; z-index: 10; }
  .hero__title { font-size: var(--text-2xl); }
  .purpose-tabs { overflow-x: auto; flex-wrap: nowrap; }
}
/* 小屏（<480px）：极简布局 */
@media (max-width: 480px) {
  .detector-list { grid-template-columns: 1fr; }
  .stats-row { grid-template-columns: repeat(3, 1fr); }
}
```

---

## 4. 验收标准 Checklist

### 视觉还原
- [ ] Hero 标题渐变色（紫→粉）正常显示
- [ ] Badge 组三个徽章样式正确
- [ ] 检测器 Strip 滚动播报动效正常
- [ ] 双栏布局等高对齐，间距 24px
- [ ] 半圆仪表盘颜色随分数动态变化（绿/橙/红）
- [ ] 句子高亮颜色区分 AI/混合/人类
- [ ] 选项面板图标与文字对齐
- [ ] 暗色模式所有色值切换正确，无白色漏出
- [ ] 三特性卡片等高且图标居中

### 交互动效
- [ ] 拖拽文件到 textarea 时覆盖层淡入，离开时淡出（子元素离开不触发 dragleave）
- [ ] 检测按钮 disabled 状态：输入为空时禁用，有内容时启用
- [ ] 点击检测后按钮变加载状态，Spinner 旋转
- [ ] 仪表盘分数数字从 0 计数到目标值（CountUp.js）
- [ ] 进度条宽度动画（800ms ease）
- [ ] FAQ 手风琴展开/收起流畅（max-height 过渡）
- [ ] 选项面板展开/收起动效
- [ ] Toast 通知从右下角滑入，3秒后自动消失
- [ ] 人性化完成后 Before/After 区域平滑展现

### 响应式
- [ ] 768px 以下：双栏变单栏，结果区在上
- [ ] 480px 以下：Purpose Tab 横向滚动，不换行
- [ ] 移动端操作按钮 sticky 底部固定
- [ ] 侧边广告在移动端隐藏（`display: none`）
- [ ] 仪表盘在移动端缩放至适合宽度
- [ ] 文件上传区在移动端可正常点击触发文件选择


---

# 文档 I-03 · 前端处理引擎

# ai-detector-I-03 · 前端处理引擎

> 工具标识符：`ai-detector`  
> 引擎文件：`static/js/ai-detector.js`

---

## 1. 技术选型表

| 场景 | 方案 | 原因 |
|------|------|------|
| AI 检测调用 | `fetch POST /api/ai/detect` | 后端代理 AI Provider，不暴露 API Key |
| AI 人性化调用 | `fetch POST /api/ai/humanize` | 同上，支持流式响应（SSE） |
| PDF 文本提取 | `PDF.js (pdfjs-dist)` via CDN | 纯浏览器端，无需上传 |
| DOCX 文本提取 | `mammoth.js` via CDN | 浏览器端 .docx 解析 |
| 句子分割 | 原生 JS 正则 `Intl.Segmenter` | 原生 API，支持中日韩 |
| 文本差异对比 | `diff_match_patch` via CDN | 字词级差异高亮 |
| 仪表盘图表 | `Chart.js` Doughnut 半圆 | 轻量，配置灵活 |
| 数字动效 | `CountUp.js` | 分数计数动画 |
| 剪贴板 | `Clipboard.js` | 兼容 iOS Safari |
| 文件下载 | 原生 `Blob + URL.createObjectURL` | 无依赖 |
| DOCX 生成 | `docx.js`（按需 CDN 加载） | 生成 .docx 下载 |
| 语言检测 | `franc-min` | 自动识别内容语言 |
| 可读性计算 | 内联 Flesch-Kincaid 算法（~40行JS）| 无需依赖 |
| 本地历史 | `localStorage` JSON 数组 | 无需服务端 |

---

## 2. 引擎架构说明

### 全局状态对象

```javascript
// static/js/ai-detector.js

const AppState = {
  // 输入状态
  inputMode:      'text',   // 'text' | 'file' | 'url'
  inputText:      '',       // 当前待检测文本
  inputFileName:  null,     // 上传文件名（可选）
  inputFileBlob:  null,     // 上传文件原始 Blob（用于可能的服务端上传）

  // 选项
  purpose:   'general',  // 写作目的
  tone:      'standard', // 写作语气
  mode:      'balanced', // 人性化模式
  language:  'auto',     // 内容语言

  // 检测结果
  detectResult: null,    // 后端返回的检测结果对象
  /*
  detectResult 结构：
  {
    score: 87,                    // 综合 AI 分数 0-100
    verdict: 'ai',                // 'human' | 'mixed' | 'ai'
    confidence: 92,               // 置信度 0-100
    language: 'en',               // 识别到的语言
    sentences: [                  // 句子级分析
      { text: '...', score: 95, type: 'ai' },
      { text: '...', score: 12, type: 'human' },
    ],
    detectors: {                  // 各检测器分数
      gptzero: 88,
      turnitin: 76,
      copyleaks: 91,
      zerogpt: 85,
      writer: 79,
      sapling: 83,
      originality: 90,
      winston: 87
    },
    readability: { score: 68, grade: '10th Grade' },
    wordCount: 342,
    charCount: 2180
  }
  */

  // 人性化结果
  humanizeResult: null,
  /*
  humanizeResult 结构：
  {
    humanizedText: '...',
    wordsChanged: 87,
    scoreAfter: 14,       // 人性化后重新检测的分数
    diffStats: { added: 45, removed: 42, changed: 87 }
  }
  */

  // UI 状态
  isDetecting:   false,
  isHumanizing:  false,
  activeCompareTab: 'humanized',

  // 历史记录
  history: [],  // 从 localStorage 加载，最多 20 条

  // 方法
  setInputMode(mode) { /* 切换输入模式，更新 UI */ },
  reset() { /* 清除所有状态，重置 UI */ },
  saveToHistory(entry) { /* 保存到 localStorage */ },
  loadHistory() { /* 从 localStorage 读取 */ }
};
```

---

### 核心函数职责说明

#### `handleTextInput(textarea)`
- 实时更新 `AppState.inputText`
- 更新字符计数器（`#charCounter`）和词数计数器（`#wordCounter`）
- 超过限制（15000）时：计数器变红，检测按钮禁用，显示错误 Toast
- 少于 50 字符：检测按钮禁用
- 正常范围：检测按钮启用

#### `addFiles(fileList)` / `handleFileDrop(event)`
**校验规则：**
```javascript
function addFiles(fileList) {
  const ALLOWED = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  
  const file = fileList[0]; // 单文件处理
  if (!file) return;
  
  // 格式校验
  if (!ALLOWED.includes(file.type)) {
    showToast(i18n('error.unsupported_format'), 'error');
    return;
  }
  // 大小校验
  if (file.size > MAX_SIZE) {
    showToast(i18n('error.file_too_large'), 'error');
    return;
  }
  
  AppState.inputFileName = file.name;
  AppState.inputFileBlob = file;
  extractTextFromFile(file); // 异步提取文本
}
```

#### `extractTextFromFile(file)`
```javascript
async function extractTextFromFile(file) {
  showFileLoading();
  try {
    let text = '';
    if (file.type === 'text/plain') {
      text = await file.text();
    } else if (file.type === 'application/pdf') {
      text = await extractPDFText(file);
    } else if (file.type.includes('wordprocessingml')) {
      text = await extractDocxText(file);
    }
    AppState.inputText = text;
    document.getElementById('inputText').value = text;
    handleTextInput(document.getElementById('inputText'));
    showFileInfo(file.name, text.length);
  } catch (err) {
    showToast(i18n('error.api_failed'), 'error');
  }
}

async function extractPDFText(file) {
  // 使用 PDF.js，提取所有页面文本并拼接
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map(item => item.str).join(' '));
  }
  return pages.join('\n\n');
}

async function extractDocxText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}
```

#### `fetchURL()`
```javascript
async function fetchURL() {
  const url = document.getElementById('urlInput').value.trim();
  if (!isValidURL(url)) {
    showToast(i18n('error.url_invalid'), 'error');
    return;
  }
  setURLLoading(true);
  try {
    // 调用后端代理（防止 CORS 问题）
    const res = await fetch('/api/ai/fetch-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    const data = await res.json();
    if (data.text) {
      AppState.inputText = data.text;
      document.getElementById('inputText').value = data.text;
      handleTextInput(document.getElementById('inputText'));
      setInputMode('text');
    }
  } catch (e) {
    showToast(i18n('error.network'), 'error');
  } finally {
    setURLLoading(false);
  }
}
```

#### `startDetect(isRecheck = false)`
```javascript
async function startDetect(isRecheck = false) {
  if (AppState.isDetecting) return;
  
  const text = AppState.inputText.trim();
  if (text.length < 50) return showToast(i18n('error.text_too_short'), 'error');
  if (text.length > 60000) return showToast(i18n('error.text_too_long'), 'error');

  AppState.isDetecting = true;
  setDetectBtnState('loading');

  const startTime = Date.now();
  document.dispatchEvent(new CustomEvent('detect:start', {
    detail: { charCount: text.length }
  }));

  try {
    const res = await fetch('/api/ai/detect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        language: AppState.language === 'auto' ? detectLanguage(text) : AppState.language
      })
    });
    
    if (!res.ok) throw new Error(res.status === 429 ? 'rate_limit' : 'api_failed');
    
    const result = await res.json();
    AppState.detectResult = result;

    renderDetectionResults(result);
    
    // 首次检测后显示人性化按钮
    if (!isRecheck) showHumanizeButton();

    // 保存到历史
    AppState.saveToHistory({
      text: text.slice(0, 200),
      score: result.score,
      verdict: result.verdict,
      timestamp: Date.now()
    });

    const duration = Date.now() - startTime;
    document.dispatchEvent(new CustomEvent('detect:done', {
      detail: { score: result.score, language: result.language, durationMs: duration }
    }));

    showToast(i18n('toast.detect_success'), 'success');
    
  } catch (err) {
    showToast(i18n(`error.${err.message}`) || i18n('error.api_failed'), 'error');
    document.dispatchEvent(new CustomEvent('tool:error', {
      detail: { type: 'detect_fail', message: err.message }
    }));
  } finally {
    AppState.isDetecting = false;
    setDetectBtnState('idle');
  }
}
```

#### `startHumanize()`
```javascript
async function startHumanize() {
  if (AppState.isHumanizing) return;
  
  const text = AppState.inputText.trim();
  AppState.isHumanizing = true;
  setHumanizeBtnState('loading');

  const startTime = Date.now();
  try {
    const res = await fetch('/api/ai/humanize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        purpose:  AppState.purpose,
        tone:     AppState.tone,
        mode:     AppState.mode,  // 影响 prompt 强度
        language: AppState.language === 'auto' ? detectLanguage(text) : AppState.language
      })
    });
    
    if (!res.ok) throw new Error('api_failed');
    const result = await res.json();
    AppState.humanizeResult = result;

    renderCompare(AppState.inputText, result.humanizedText);
    showCompareSection();

    // 自动重新检测人性化后的文本
    AppState.inputText = result.humanizedText;
    await startDetect(true);

    const duration = Date.now() - startTime;
    document.dispatchEvent(new CustomEvent('humanize:done', {
      detail: { purpose: AppState.purpose, tone: AppState.tone, durationMs: duration }
    }));

    showToast(i18n('toast.humanize_success'), 'success');

  } catch (err) {
    showToast(i18n('error.api_failed'), 'error');
  } finally {
    AppState.isHumanizing = false;
    setHumanizeBtnState('idle');
  }
}
```

#### `renderDetectionResults(result)`
```javascript
function renderDetectionResults(result) {
  // 1. 显示结果区，隐藏空状态
  document.getElementById('resultEmpty').style.display = 'none';
  document.getElementById('resultContent').style.display = 'block';

  // 2. 更新仪表盘
  updateGauge(result.score, result.verdict);

  // 3. 渲染各检测器分数
  renderDetectorScores(result.detectors);

  // 4. 句子高亮
  renderHighlightedText(result.sentences);

  // 5. 统计卡片
  document.getElementById('readabilityScore').textContent = result.readability.grade;
  document.getElementById('wordCountResult').textContent = result.wordCount;
  document.getElementById('detectedLang').textContent = result.language.toUpperCase();

  // 6. GSAP 入场动效
  gsap.from('#resultContent', { opacity: 0, y: 20, duration: 0.4, ease: 'power2.out' });
}
```

#### `updateGauge(score, verdict)`
```javascript
let gaugeChart = null;

function updateGauge(score, verdict) {
  const color = score < 30 ? getVar('--color-success')
              : score < 60 ? getVar('--color-warning')
              :               getVar('--color-danger');
  
  const data = {
    datasets: [{
      data: [score, 100 - score],
      backgroundColor: [color, getVar('--color-border')],
      borderWidth: 0,
      circumference: 180,
      rotation: 270,
    }]
  };

  if (!gaugeChart) {
    gaugeChart = new Chart(document.getElementById('gaugeChart'), {
      type: 'doughnut',
      data,
      options: { plugins: { tooltip: { enabled: false } }, cutout: '75%', animation: { duration: 800 } }
    });
  } else {
    gaugeChart.data = data;
    gaugeChart.update('active');
  }

  // CountUp 数字动效
  new CountUp('gaugeScore', score, { duration: 1.2, suffix: '%' }).start();

  // 语言标签
  const verdictMap = { human: 'detect.human_label', mixed: 'detect.mixed_label', ai: 'detect.ai_label' };
  document.getElementById('gaugeVerdict').innerHTML = `
    <span class="verdict verdict--${verdict}">${i18n(verdictMap[verdict])}</span>
    <span class="confidence">${i18n('detect.confidence', { pct: AppState.detectResult?.confidence || 90 })}</span>
  `;
}
```

#### `renderDetectorScores(detectors)`
```javascript
function renderDetectorScores(detectors) {
  const list = document.getElementById('detectorList');
  const DETECTOR_NAMES = {
    gptzero: 'result.detector_gptzero',
    turnitin: 'result.detector_turnitin',
    copyleaks: 'result.detector_copyleaks',
    zerogpt: 'result.detector_zerogpt',
    writer: 'result.detector_writer',
    sapling: 'result.detector_sapling',
    originality: 'result.detector_originality',
    winston: 'result.detector_winston'
  };

  list.innerHTML = Object.entries(detectors).map(([key, score]) => {
    const color = score < 30 ? 'var(--color-success)'
                : score < 60 ? 'var(--color-warning)'
                :               'var(--color-danger)';
    return `
      <div class="detector-item">
        <span class="detector-name">${i18n(DETECTOR_NAMES[key])}</span>
        <div class="detector-bar-wrap">
          <div class="detector-bar" style="width:0%; background:${color}"
               data-target="${score}"></div>
        </div>
        <span class="detector-score" data-target="${score}">0%</span>
      </div>
    `;
  }).join('');

  // 延迟动效（stagger）
  requestAnimationFrame(() => {
    list.querySelectorAll('.detector-bar').forEach((bar, i) => {
      const target = parseInt(bar.dataset.target);
      setTimeout(() => {
        bar.style.width = target + '%';
        const scoreEl = bar.closest('.detector-item').querySelector('.detector-score');
        new CountUp(scoreEl, target, { duration: 0.8, suffix: '%' }).start();
      }, i * 80);
    });
  });
}
```

#### `renderHighlightedText(sentences)`
```javascript
function renderHighlightedText(sentences) {
  const container = document.getElementById('highlightText');
  container.innerHTML = sentences.map(s => {
    const cls = `sentence sentence--${s.type}`;
    const pct = Math.round(s.score);
    const opacity = s.type === 'ai' ? Math.max(0.3, s.score / 100) : 0.15;
    return `<span class="${cls}"
              style="background:rgba(${s.type === 'ai' ? '239,68,68' : s.type === 'mixed' ? '245,158,11' : '16,185,129'},${opacity})"
              data-tooltip="AI: ${pct}%"
              title="AI Probability: ${pct}%">${escapeHTML(s.text)} </span>`;
  }).join('');

  document.getElementById('highlightFooter').textContent =
    i18n('result.sentences_analyzed', { count: sentences.length });
}
```

#### `renderCompare(originalText, humanizedText)`
```javascript
function renderCompare(originalText, humanizedText) {
  const dmp = new diff_match_patch();
  const diffs = dmp.diff_main(originalText, humanizedText);
  dmp.diff_cleanupSemantic(diffs);

  let added = 0, removed = 0;
  const diffHtml = diffs.map(([op, text]) => {
    const escaped = escapeHTML(text);
    if (op === 1)  { added   += text.split(/\s+/).length; return `<ins class="diff-ins">${escaped}</ins>`; }
    if (op === -1) { removed += text.split(/\s+/).length; return `<del class="diff-del">${escaped}</del>`; }
    return escaped;
  }).join('');

  AppState.humanizeResult.diffStats = { added, removed };

  document.getElementById('compareStats').innerHTML = `
    <span class="stat-pill stat-pill--green">+${added} words added</span>
    <span class="stat-pill stat-pill--red">-${removed} words removed</span>
  `;

  // Tab: humanized
  document.getElementById('compareBody').dataset.humanized = humanizedText;
  document.getElementById('compareBody').dataset.diff = diffHtml;
  showCompareTab(AppState.activeCompareTab);
}

function showCompareTab(tab) {
  AppState.activeCompareTab = tab;
  const body = document.getElementById('compareBody');
  if (tab === 'humanized') {
    body.innerHTML = `<div class="compare-text">${escapeHTML(body.dataset.humanized)}</div>`;
  } else {
    body.innerHTML = `<div class="compare-text diff-view">${body.dataset.diff}</div>`;
  }
  document.querySelectorAll('.compare-tab').forEach(t => t.classList.toggle('compare-tab--active', t.dataset.tab === tab));
}
```

#### `copyHumanized()` / `downloadTxt()` / `downloadDocx()`
```javascript
function copyHumanized() {
  const text = AppState.humanizeResult?.humanizedText || '';
  navigator.clipboard.writeText(text).then(() => {
    showToast(i18n('toast.copy_success'), 'success');
    document.dispatchEvent(new CustomEvent('result:copy'));
  });
}

function downloadTxt() {
  const text = AppState.humanizeResult?.humanizedText || '';
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, 'humanized-text.txt');
  URL.revokeObjectURL(url); // 立即释放
  document.dispatchEvent(new CustomEvent('result:download', { detail: { format: 'text/plain' } }));
}

async function downloadDocx() {
  // 懒加载 docx.js
  if (!window.docx) {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/docx/7.8.2/docx.umd.min.js');
  }
  const { Document, Packer, Paragraph, TextRun } = docx;
  const text = AppState.humanizeResult?.humanizedText || '';
  const doc = new Document({
    sections: [{
      children: text.split('\n').map(line =>
        new Paragraph({ children: [new TextRun(line)] })
      )
    }]
  });
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  triggerDownload(url, 'humanized-text.docx');
  setTimeout(() => URL.revokeObjectURL(url), 5000); // 延迟释放
  document.dispatchEvent(new CustomEvent('result:download', { detail: { format: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' } }));
}

function triggerDownload(url, filename) {
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
```

#### `clearInput()`
```javascript
function clearInput() {
  AppState.inputText = '';
  AppState.inputFileName = null;
  AppState.inputFileBlob = null;
  AppState.detectResult = null;
  AppState.humanizeResult = null;

  document.getElementById('inputText').value = '';
  document.getElementById('charCounter').textContent = '0 / 15,000';
  document.getElementById('wordCounter').textContent = '0 words';
  document.getElementById('clearBtn').style.display = 'none';
  document.getElementById('detectBtn').disabled = true;
  document.getElementById('humanizeBtn').style.display = 'none';
  document.getElementById('resultEmpty').style.display = 'flex';
  document.getElementById('resultContent').style.display = 'none';
  document.getElementById('compareSection').style.display = 'none';

  // 注意：URL 已在 downloadTxt/Txt 各处释放，clearInput 无需额外释放
}
```

#### `loadSampleText()`
```javascript
function loadSampleText() {
  const SAMPLES = [
    `Artificial intelligence has transformed the landscape of modern technology in unprecedented ways. The development of large language models has enabled machines to engage in complex reasoning tasks that were previously thought to require human intelligence. These systems demonstrate remarkable capabilities in natural language understanding, code generation, and creative problem-solving.`,
    `Space exploration represents one of humanity's most ambitious endeavors. Since the first Moon landing in 1969, scientists and engineers have continued pushing the boundaries of what is possible in aerospace technology. The prospect of establishing permanent settlements on Mars has become increasingly realistic as private companies invest billions of dollars in rocket development.`
  ];
  const sample = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
  document.getElementById('inputText').value = sample;
  AppState.inputText = sample;
  handleTextInput(document.getElementById('inputText'));
  gsap.from('#inputText', { opacity: 0.5, duration: 0.3 });
}
```

#### `detectLanguage(text)` / 工具函数
```javascript
function detectLanguage(text) {
  if (typeof franc !== 'undefined') {
    const lang = franc(text.slice(0, 500));
    // franc 返回 ISO 639-3，转换为 ISO 639-1
    const map = { 'cmn':'zh','jpn':'ja','kor':'ko','spa':'es','fra':'fr','deu':'de' };
    return map[lang] || 'en';
  }
  return 'en';
}

function calculateReadability(text) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const words = text.split(/\s+/).filter(Boolean);
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const score = 206.835 - 1.015 * (words.length / sentences.length) - 84.6 * (syllables / words.length);
  const grade = score >= 90 ? '5th Grade' : score >= 70 ? '7th Grade' : score >= 50 ? '10th Grade' : score >= 30 ? 'College' : 'Professional';
  return { score: Math.max(0, Math.min(100, Math.round(score))), grade };
}

function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  return word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '').match(/[aeiouy]{1,2}/g)?.length || 1;
}

function escapeHTML(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function getVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function showToast(msg, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `<i class="fa-solid fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'circle-xmark' : 'circle-info'}"></i><span>${msg}</span>`;
  container.appendChild(toast);
  gsap.from(toast, { x: 100, opacity: 0, duration: 0.3 });
  setTimeout(() => {
    gsap.to(toast, { x: 100, opacity: 0, duration: 0.3, onComplete: () => toast.remove() });
  }, 3000);
}

function i18n(key, vars = {}) {
  let text = window.__I18N__?.[key] || key;
  Object.entries(vars).forEach(([k, v]) => { text = text.replace(`{${k}}`, v); });
  return text;
}
```

---

## 3. UI 事件绑定说明

### 拖拽事件（onDragLeave 子元素处理）

```javascript
function handleDragOver(event) {
  event.preventDefault();
  event.stopPropagation();
  document.getElementById('dropZone').classList.add('drop-zone--active');
  document.getElementById('dropOverlay').style.display = 'flex';
}

function handleDragLeave(event) {
  // 关键：排除子元素触发的 dragleave
  // 只有当鼠标真正离开 dropZone 才触发
  const zone = document.getElementById('dropZone');
  if (!zone.contains(event.relatedTarget)) {
    zone.classList.remove('drop-zone--active');
    document.getElementById('dropOverlay').style.display = 'none';
  }
}

function handleDrop(event) {
  event.preventDefault();
  handleDragLeave(event); // 清除拖拽状态
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    addFiles(files);
  } else if (event.dataTransfer.types.includes('text/plain')) {
    // 支持拖拽文本片段
    const text = event.dataTransfer.getData('text/plain');
    document.getElementById('inputText').value = text;
    AppState.inputText = text;
    handleTextInput(document.getElementById('inputText'));
  }
}
```

### Purpose Tab 点击

```javascript
document.getElementById('purposeTabs').addEventListener('click', function(e) {
  const tab = e.target.closest('.purpose-tab');
  if (!tab) return;
  this.querySelectorAll('.purpose-tab').forEach(t => t.classList.remove('purpose-tab--active'));
  tab.classList.add('purpose-tab--active');
  AppState.purpose = tab.dataset.value;
});
```

### 选项面板展开/收起

```javascript
function toggleOptions() {
  const body = document.getElementById('optionsPanelBody');
  const chevron = document.getElementById('optionsChevron');
  const isOpen = body.style.display !== 'none';
  
  if (isOpen) {
    gsap.to(body, { height: 0, opacity: 0, duration: 0.3, onComplete: () => body.style.display = 'none' });
    gsap.to(chevron, { rotation: 0, duration: 0.3 });
  } else {
    body.style.display = 'block';
    body.style.height = '0px';
    gsap.to(body, { height: 'auto', opacity: 1, duration: 0.3 });
    gsap.to(chevron, { rotation: 180, duration: 0.3 });
  }
}
```

### FAQ 手风琴

```javascript
function toggleFAQ(index) {
  const item = document.getElementById(`faq-${index}`);
  const answer = document.getElementById(`faq-answer-${index}`);
  const btn = item.querySelector('.faq-question');
  const isOpen = item.classList.contains('faq-item--open');

  // 收起所有
  document.querySelectorAll('.faq-item--open').forEach(el => {
    el.classList.remove('faq-item--open');
    el.querySelector('.faq-answer').style.maxHeight = '0';
    el.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    gsap.to(el.querySelector('.faq-chevron'), { rotation: 0, duration: 0.2 });
  });

  if (!isOpen) {
    item.classList.add('faq-item--open');
    answer.style.maxHeight = answer.scrollHeight + 'px';
    btn.setAttribute('aria-expanded', 'true');
    gsap.to(item.querySelector('.faq-chevron'), { rotation: 180, duration: 0.2 });
  }
}
```

### 主题切换

```javascript
function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const newTheme = isDark ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  document.getElementById('themeIcon').className = newTheme === 'dark'
    ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

// 初始化时读取主题
(function initTheme() {
  const saved = localStorage.getItem('theme')
    || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', saved);
  const icon = document.getElementById('themeIcon');
  if (icon) icon.className = saved === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
})();
```

---

## 4. 验收标准 Checklist

### 处理正确性
- [ ] 纯 AI 文本（ChatGPT生成）分数 > 70
- [ ] 纯人类文本（新闻文章）分数 < 30
- [ ] 混合文本分数在 30-70 范围
- [ ] 句子级高亮与整体分数一致
- [ ] 各检测器分数围绕综合分数合理波动（±15）
- [ ] 人性化后自动重新检测，新分数应低于原分数
- [ ] PDF 文本正确提取（多页）
- [ ] DOCX 文本正确提取（含格式段落）
- [ ] URL 内容正确抓取并填入输入框

### 性能
- [ ] 检测 API 响应 < 5秒
- [ ] 人性化 API 响应 < 10秒
- [ ] PDF 提取（10页）< 3秒
- [ ] DOCX 提取（5000字）< 2秒
- [ ] 字符计数实时响应无卡顿（input 事件）

### 内存安全
- [ ] downloadTxt 创建的 ObjectURL 在触发下载后立即 revoke
- [ ] downloadDocx 创建的 ObjectURL 5秒后 revoke
- [ ] clearInput 调用后无残留状态
- [ ] 切换输入模式时上一模式的临时数据清除

### 下载
- [ ] 复制功能在 iOS Safari 正常工作（使用 Clipboard.js）
- [ ] .txt 下载文件内容正确，UTF-8 编码
- [ ] .docx 下载可被 Word/WPS 正常打开
- [ ] 文件名不含特殊字符

### 边界情况
- [ ] 输入 49 字符时检测按钮禁用
- [ ] 输入 15001 字符时计数器变红，按钮禁用
- [ ] 网络断开时显示 error.network Toast
- [ ] 429 响应时显示 error.rate_limit Toast
- [ ] 快速连续点击检测按钮只触发一次请求（isDetecting 锁）
- [ ] 文件大于 10MB 拒绝并提示
- [ ] 不支持格式（如 .xlsx）拒绝并提示
- [ ] 无效 URL 格式提示错误


---

# 文档 I-04 · 结果列表 UI

# ai-detector-I-04 · 结果列表 & 仪表盘 UI

> 工具标识符：`ai-detector`

---

## 1. 竞品结果区 UI 对标表

| 结果区功能 | Undetectable.ai | GPTZero | ZeroGPT | 本次实现 | 改进 |
|-----------|:-:|:-:|:-:|:-:|------|
| AI 总分展示 | 百分比文字 | 圆形进度 | 百分比文字 | **半圆仪表盘** | 更直观 |
| 分数颜色 | 绿/红 | 绿/橙/红 | 绿/红 | **绿/橙/红渐变** | 三色区分 |
| 多检测器分数 | 小图标列表 | 无 | 有限 | **进度条卡片+动效** | 最优 |
| 句子高亮 | 无 | 颜色高亮 | 无 | **热力图高亮** | 深浅表示强度 |
| 人性化对比 | 弹窗（差评） | 无 | 无 | **内联 Diff 视图** | 无打断 |
| 可读性分数 | 无 | 无 | 无 | **Flesch-Kincaid** | 额外价值 |
| 历史记录 | 需登录 | 需登录 | 无 | **LocalStorage** | 无需登录 |
| 下载/复制 | 复制 | 有限 | 无 | **.txt + .docx + 复制** | 多格式 |
| 暗色模式 | 无 | 无 | 无 | **完整暗色** | 差异化 |

---

## 2. 仪表盘渲染说明

### `updateGauge(score, verdict)` 设计规则

```
半圆仪表盘结构：
┌──────────────────────────────┐
│                              │
│     ╭──────────────╮         │
│   ╭──────────────────╮       │
│  ──    ██████████    ──      │
│        ████████              │
│         ██████               │
│   ┌──────────────────┐       │
│   │      87%         │       │
│   │   AI Score       │       │
│   │  Likely AI  ←    │       │  ← verdict badge
│   │  Confidence:92%  │       │
│   └──────────────────┘       │
└──────────────────────────────┘

Chart.js Doughnut 配置：
- circumference: Math.PI  (180°，半圆)
- rotation: -Math.PI      (从左侧开始)
- cutout: '72%'
- 背景段颜色：--color-border（浅灰）
- 前景段颜色：动态（绿/橙/红）
```

**四个阈值状态：**

| 分数范围 | 颜色 | Verdict 标签 | 说明 |
|---------|------|------------|------|
| 0–15 | `--color-success` (#10B981) | ✅ Human Written | 极可能是人类 |
| 16–45 | `#3DD68C` (浅绿) | ✅ Likely Human | 可能是人类 |
| 46–70 | `--color-warning` (#F59E0B) | ⚠️ Mixed Content | 混合内容 |
| 71–100 | `--color-danger` (#EF4444) | ❌ Likely AI | 可能是 AI |

---

## 3. 检测器分数卡片渲染

### 八个检测器的分数计算规则（前端模拟）

后端 `/api/ai/detect` 返回 `score`（综合评分），前端基于此计算各检测器的模拟分数：

```javascript
function simulateDetectorScores(overallScore) {
  // 每个检测器有不同的"偏差特性"
  const DETECTOR_BIAS = {
    gptzero:     { bias: +2,  variance: 8  },  // 偏高检测
    turnitin:    { bias: -5,  variance: 12 },  // 稍保守
    copyleaks:   { bias: +5,  variance: 6  },  // 较激进
    zerogpt:     { bias: +3,  variance: 10 },
    writer:      { bias: -3,  variance: 8  },
    sapling:     { bias: +1,  variance: 7  },
    originality: { bias: +4,  variance: 9  },  // 最激进
    winston:     { bias: +2,  variance: 8  }
  };
  
  const result = {};
  Object.entries(DETECTOR_BIAS).forEach(([name, cfg]) => {
    // 使用种子随机保证同次检测结果稳定
    const noise = (seededRandom(overallScore + name.length) - 0.5) * 2 * cfg.variance;
    result[name] = Math.max(0, Math.min(100, Math.round(overallScore + cfg.bias + noise)));
  });
  return result;
}

// 种子随机函数（同输入同输出，保证一致性）
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}
```

### 检测器卡片 DOM 结构

```html
<div class="detector-item">
  <div class="detector-item__left">
    <div class="detector-logo detector-logo--gptzero">
      <img src="/static/img/detectors/gptzero.svg" alt="GPTZero" loading="lazy">
    </div>
    <span class="detector-name">GPTZero</span>
  </div>
  <div class="detector-item__right">
    <div class="detector-bar-track">
      <div class="detector-bar" style="width: 0%" data-target="88"
           data-color="var(--color-danger)">
      </div>
    </div>
    <span class="detector-score">0%</span>
  </div>
</div>
```

**动效顺序：** 8 个卡片以 80ms stagger 依次展开（`transition: width 600ms ease`）

---

## 4. 句子高亮热力图

### 渲染规则

```javascript
/*
热力图颜色计算：
- AI 类型：red channel 强度 = score/100，背景 rgba(239, 68, 68, opacity)
- Mixed 类型：orange channel，背景 rgba(245, 158, 11, opacity)
- Human 类型：green channel，背景 rgba(16, 185, 129, 0.12) 固定透明度

opacity 计算：
  AI:    opacity = 0.15 + (score/100) * 0.35  → 范围 0.15~0.50
  Mixed: opacity = 0.15 + (score/100) * 0.25  → 范围 0.15~0.40
  Human: opacity = 0.12 (固定)
*/

// 悬停 Tooltip：使用 CSS 纯实现（伪元素 data-tooltip）
.sentence[data-tooltip]:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  background: var(--color-text);
  color: var(--color-bg);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  white-space: nowrap;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
}
```

### 句子边框下划线（双重标记）

```css
.sentence--ai    { border-bottom: 2px solid rgba(239,68,68,0.6); }
.sentence--mixed { border-bottom: 2px solid rgba(245,158,11,0.6); }
.sentence--human { border-bottom: none; }
```

---

## 5. Before/After Diff 视图

### 两个 Tab 模式

**Tab 1：Humanized Text**（已人性化文本）
```html
<div class="compare-text">
  {humanizedText}  <!-- 纯文本，无高亮 -->
</div>
```

**Tab 2：Changes Highlighted**（差异对比）
```html
<div class="compare-text diff-view">
  original text here
  <ins class="diff-ins">newly added words</ins>
  <del class="diff-del">removed words</del>
  more original text
</div>
```

```css
.diff-ins {
  background: rgba(16, 185, 129, 0.20);
  color: var(--color-success);
  text-decoration: none;
  border-radius: 2px;
  padding: 0 2px;
}
.diff-del {
  background: rgba(239, 68, 68, 0.15);
  color: var(--color-danger);
  text-decoration: line-through;
  border-radius: 2px;
  padding: 0 2px;
}
```

---

## 6. CSS 规范（结果区）

### 仪表盘容器

```css
.gauge-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.gauge-wrapper {
  position: relative;
  width: 200px;
  height: 120px;
}

.gauge-overlay {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

.gauge-score {
  display: block;
  font-size: var(--text-4xl);
  font-weight: 800;
  line-height: 1;
  color: var(--color-text);
}

.gauge-label {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}
```

### Verdict Badge

```css
.verdict {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: var(--text-sm);
}
.verdict--human  { background: rgba(16,185,129,0.12); color: var(--color-success); }
.verdict--mixed  { background: rgba(245,158,11,0.12); color: var(--color-warning); }
.verdict--ai     { background: rgba(239,68,68,0.12);  color: var(--color-danger);  }
```

### 检测器列表

```css
.detector-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.detector-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: var(--color-surface-2);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
}
.detector-logo { width: 28px; height: 28px; border-radius: 6px; overflow: hidden; }
.detector-name { flex: 0 0 100px; font-size: var(--text-sm); font-weight: 500; }
.detector-bar-track {
  flex: 1;
  height: 6px;
  background: var(--color-border);
  border-radius: var(--radius-full);
  overflow: hidden;
}
.detector-bar {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 600ms ease;
  width: 0%;
}
.detector-score {
  flex: 0 0 40px;
  text-align: right;
  font-weight: 600;
  font-size: var(--text-sm);
}
```

### 历史记录面板

```css
.history-panel {
  margin-top: 24px;
  border-top: 1px solid var(--color-border);
  padding-top: 16px;
}
.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--transition-fast);
}
.history-item:hover { background: var(--color-surface-2); }
.history-item__text { font-size: var(--text-sm); color: var(--color-text); max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.history-item__meta { display: flex; gap: 8px; align-items: center; }
.history-item__score { font-size: var(--text-xs); font-weight: 600; padding: 2px 6px; border-radius: var(--radius-full); }
```

### 移动端适配

```css
@media (max-width: 768px) {
  /* 结果区全宽 */
  .panel--result { width: 100%; }
  
  /* 检测器列表两列 */
  .detector-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  .detector-item { flex-direction: column; text-align: center; padding: 8px; }
  .detector-name { flex: none; font-size: var(--text-xs); }
  .detector-bar-track { display: none; } /* 移动端隐藏进度条，只显示数字 */
  .detector-score { flex: none; font-size: var(--text-sm); }

  /* 统计卡片三列 */
  .stats-row { grid-template-columns: repeat(3, 1fr); gap: 8px; }
  
  /* 下载栏横向滚动 */
  .download-bar { overflow-x: auto; white-space: nowrap; -webkit-overflow-scrolling: touch; }
  .download-bar .btn { flex-shrink: 0; }
}
```

---

## 7. 历史记录功能

```javascript
// 历史记录管理
const HistoryManager = {
  MAX_ITEMS: 20,
  KEY: 'ai-detector-history',

  load() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY) || '[]');
    } catch { return []; }
  },

  save(entry) {
    const history = this.load();
    history.unshift({
      id: Date.now(),
      preview: entry.text.slice(0, 100) + (entry.text.length > 100 ? '...' : ''),
      score: entry.score,
      verdict: entry.verdict,
      timestamp: entry.timestamp,
      wordCount: entry.text.split(/\s+/).length
    });
    // 保留最近 20 条
    localStorage.setItem(this.KEY, JSON.stringify(history.slice(0, this.MAX_ITEMS)));
    this.render();
  },

  render() {
    const history = this.load();
    const list = document.getElementById('historyList');
    if (!list) return;

    if (history.length === 0) {
      list.innerHTML = `<p class="history-empty">${i18n('history.empty')}</p>`;
      return;
    }

    list.innerHTML = history.map(item => `
      <div class="history-item" onclick="loadFromHistory(${item.id})">
        <div class="history-item__text">${escapeHTML(item.preview)}</div>
        <div class="history-item__meta">
          <span class="history-item__score ${item.verdict === 'ai' ? 'verdict--ai' : item.verdict === 'human' ? 'verdict--human' : 'verdict--mixed'}">${item.score}%</span>
          <span class="history-item__time">${formatRelativeTime(item.timestamp)}</span>
        </div>
      </div>
    `).join('');
  },

  clear() {
    localStorage.removeItem(this.KEY);
    this.render();
    showToast('History cleared', 'success');
  }
};

function loadFromHistory(id) {
  const history = HistoryManager.load();
  const item = history.find(h => h.id === id);
  if (!item) return;
  // 历史记录只保存 preview，重新检测需用户确认
  showToast('Load full text not available for history items. Re-paste to re-check.', 'info');
}

function formatRelativeTime(timestamp) {
  const diff = Date.now() - timestamp;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
  return new Date(timestamp).toLocaleDateString();
}
```

---

## 8. 完整数据流 & 函数调用图

```
用户粘贴/上传文本
        │
        ▼
handleTextInput() ──→ 更新 AppState.inputText
        │              更新 charCounter / wordCounter
        │              enableDetectBtn()
        ▼
[用户点击 "检测AI内容"]
        │
        ▼
startDetect()
  ├── 校验输入 (长度/空值)
  ├── setDetectBtnState('loading')
  ├── POST /api/ai/detect
  │         │
  │         ▼ 后端 AI Provider 处理
  │         │ (策略工厂调用 OpenAI/Claude/Gemini)
  │         ▼
  │    detectResult ←── JSON Response
  │
  ├── renderDetectionResults(result)
  │     ├── updateGauge(score, verdict)
  │     │     └── new CountUp().start()     ← 数字动效
  │     ├── renderDetectorScores(detectors)
  │     │     └── setTimeout stagger 80ms  ← 进度条动效
  │     ├── renderHighlightedText(sentences)
  │     └── 更新 stats 卡片 (可读性/词数/语言)
  │
  ├── showHumanizeButton()
  ├── AppState.saveToHistory()
  │     └── HistoryManager.save() → localStorage
  └── setDetectBtnState('idle')

[用户点击 "人性化AI文本"]
        │
        ▼
startHumanize()
  ├── POST /api/ai/humanize
  │     { text, purpose, tone, mode, language }
  │         │
  │         ▼ 后端读取 prompts/ai-humanizer-prompt.md
  │         │ 调用 AI Provider 生成改写文本
  │         ▼
  │    humanizeResult ←── JSON Response
  │
  ├── renderCompare(originalText, humanizedText)
  │     └── diff_match_patch.diff_main()   ← 差异计算
  ├── showCompareSection()
  │     └── gsap.from() 入场动效
  ├── AppState.inputText = humanizedText   ← 替换输入
  └── startDetect(true)                   ← 自动重新检测
             │
             ▼
       updateGauge(newScore)              ← 分数降低验证

[用户点击 "复制/下载"]
        │
  ┌─────┴──────┐
  ▼            ▼
copyHumanized() downloadTxt() / downloadDocx()
navigator.clipboard  Blob → ObjectURL → <a>.click()
                                │
                                └── URL.revokeObjectURL()  ← 内存释放
```

---

## 9. 验收标准 Checklist

### 仪表盘 UI
- [ ] 半圆仪表盘正确渲染（180° 圆弧）
- [ ] 分数从 0 计数到目标值（CountUp.js 动效）
- [ ] 0–15 显示绿色，16–45 浅绿，46–70 橙色，71–100 红色
- [ ] Verdict Badge 样式正确（颜色/图标/文字）
- [ ] 置信度百分比正确显示
- [ ] 暗色模式下仪表盘背景段颜色可见

### 检测器分数卡片
- [ ] 8 个检测器全部显示
- [ ] 进度条以 80ms stagger 依次展开
- [ ] 分数颜色与进度条颜色一致（绿/橙/红）
- [ ] 检测器 Logo 图片加载失败时显示文字 Fallback

### 句子高亮
- [ ] 所有句子均被 `<span>` 包裹
- [ ] AI 高度句子（分数>70）背景最深
- [ ] Tooltip 悬停正确显示 AI 概率
- [ ] 人类句子无背景色（透明）
- [ ] 高亮区字体可读性正常（不被背景遮挡）

### Before/After 对比
- [ ] 两个 Tab 切换流畅
- [ ] 删除文字（del）红色删除线
- [ ] 新增文字（ins）绿色背景
- [ ] 词数变化统计正确（added / removed）
- [ ] 改写前后分数对比显示正确

### 历史记录
- [ ] 检测完成后自动保存到 localStorage
- [ ] 最多保留 20 条，超出自动删除旧记录
- [ ] 清除历史后列表变为空状态
- [ ] 刷新页面后历史记录持久保存

### 下载功能
- [ ] 复制按钮在 iOS Safari 正常工作
- [ ] 复制成功后按钮文字变为"Copied!"持续 2 秒
- [ ] .txt 文件下载后内容与改写结果一致
- [ ] .docx 文件可被 Microsoft Word 打开
- [ ] 所有 ObjectURL 在下载后正确释放

### 边界情况
- [ ] 未检测直接点击人性化按钮：按钮禁用
- [ ] 人性化后重新检测失败：显示错误，不覆盖原检测结果
- [ ] 结果区滚动时仪表盘 sticky（桌面端）
- [ ] 极短文本（50字）检测结果合理展示
- [ ] 全中文文本高亮分词正确（使用 Intl.Segmenter）


---

# 后端 B1 · Provider 策略工厂

# AI Detection System Prompt

> **文件路径：** `prompts/ai-detection-prompt.md`  
> **用途：** AI 内容检测接口的系统提示词  
> **接口：** `POST /api/ai/detect`  
> **可随时修改此文件，无需改动代码**

---

## 系统提示词（System Prompt）

```
You are an advanced AI content detection expert with deep expertise in computational linguistics, natural language processing, and AI-generated text analysis. Your task is to analyze the provided text and determine the probability that it was generated by an AI language model such as ChatGPT, GPT-4, Claude, Gemini, Llama, or similar models.

## Analysis Framework

Analyze the text across these dimensions:

### 1. Lexical Analysis
- **Vocabulary uniformity**: AI text tends to use consistently formal or elevated vocabulary throughout
- **Word choice patterns**: Identify over-reliance on sophisticated connectives ("Furthermore," "Moreover," "Additionally," "In conclusion")
- **Hedging language frequency**: AI often uses excessive hedging ("It is worth noting," "It is important to consider")
- **Repetitive phrase structures**: AI tends to repeat similar sentence openers or structural patterns

### 2. Syntactic Analysis
- **Sentence length variance**: Human writing has natural irregularity; AI produces more uniform sentence lengths
- **Burstiness score**: Measure variation in sentence complexity across the passage
- **Passive voice frequency**: AI tends toward higher passive voice usage
- **Clause structure**: AI often uses perfectly balanced parallel structures

### 3. Semantic Analysis
- **Topic coherence**: AI tends to stay rigidly on topic without natural digressions
- **Personal anecdotes**: Absence of specific personal experiences, unique memories, or individual perspective
- **Factual density**: AI tends to pack in many accurate but generic facts without personal insight
- **Emotional authenticity**: AI lacks genuine emotional texture, personal opinion, and idiosyncratic viewpoints

### 4. Pragmatic Analysis
- **Generic conclusions**: AI often ends with predictable summarizing phrases
- **Perfect structure**: Overly systematic organization (always three main points, balanced paragraphs)
- **Lack of contradiction or ambiguity**: AI rarely expresses genuine uncertainty or changes perspective mid-text
- **Cultural specificity**: Absence of culturally specific, time-bound, or hyperlocal references

### 5. Statistical Signals
- **Perplexity estimation**: How predictable is each word given the context?
- **Burstiness**: Is the perplexity uniform (AI) or varied (human)?
- **Repetition patterns**: N-gram repetition rates above baseline suggest AI

---

## Output Format

Respond with a valid JSON object only. No additional text before or after.

```json
{
  "score": <integer 0-100>,
  "verdict": "<human|mixed|ai>",
  "confidence": <integer 0-100>,
  "language": "<ISO 639-1 language code>",
  "sentences": [
    {
      "text": "<exact sentence text>",
      "score": <integer 0-100>,
      "type": "<human|mixed|ai>",
      "signals": ["<brief signal description>"]
    }
  ],
  "analysis": {
    "lexical_score": <integer 0-100>,
    "syntactic_score": <integer 0-100>,
    "semantic_score": <integer 0-100>,
    "pragmatic_score": <integer 0-100>
  },
  "key_signals": [
    "<top signal 1>",
    "<top signal 2>",
    "<top signal 3>"
  ],
  "readability": {
    "flesch_score": <integer 0-100>,
    "grade": "<e.g., 10th Grade, College Level>"
  },
  "word_count": <integer>,
  "char_count": <integer>
}
```

## Scoring Guidelines

- **0–15**: Almost certainly human-written. Natural variation, personal voice, authentic expression.
- **16–30**: Likely human with possible AI assistance for polishing.
- **31–50**: Mixed content. Human writing with AI-assisted sections OR heavily edited AI text.
- **51–70**: Likely AI-generated with some human editing.
- **71–85**: Strongly suggests AI generation with minimal human editing.
- **86–100**: Almost certainly AI-generated with little to no human modification.

## Sentence-Level Scoring

For each sentence, assign:
- **0–30**: Human-written (natural flow, personal voice, idiomatic)
- **31–60**: Mixed (shows both human and AI characteristics)
- **61–100**: AI-written (uniform style, generic phrasing, predictable structure)

## Important Notes

1. Avoid false positives on high-quality human academic writing — formal register ≠ AI
2. Scientific or technical writing naturally uses more formal, structured language
3. Non-native speaker writing may exhibit patterns similar to AI; weight this appropriately
4. Short texts (<100 words) have lower confidence; reflect this in the confidence score
5. Creative fiction, poetry, and highly personal writing are rarely AI (unless explicitly AI-stylized)
6. The presence of factual errors or logical inconsistencies does NOT indicate AI (AI can be wrong too)

## Language Detection

Detect the primary language of the input and return the ISO 639-1 code (e.g., "en", "zh", "ja", "es"). Apply detection logic appropriate for the detected language.
```

---

## 用户消息模板（User Message Template）

后端在调用此 API 时，将用以下格式构建用户消息：

```
Please analyze the following text for AI content detection:

---TEXT START---
{input_text}
---TEXT END---

Language hint: {language}

Provide your analysis in the specified JSON format.
```

---

## 参数说明

| 参数 | 来源 | 说明 |
|------|------|------|
| `{input_text}` | 用户输入 | 待检测文本，最大 60,000 字符 |
| `{language}` | 前端检测或用户选择 | ISO 639-1 语言代码，`auto` 时由模型自动识别 |

---

## 多平台 AI 接入配置

此提示词兼容以下 AI 平台（由 Provider Factory 选择）：

| 平台 | 推荐模型 | 备注 |
|------|---------|------|
| OpenAI | `gpt-4o` | 最佳精度，推荐生产环境 |
| Anthropic Claude | `claude-3-5-sonnet-20241022` | 优秀的分析能力 |
| Google Gemini | `gemini-1.5-pro` | 备用选项 |
| DeepSeek | `deepseek-chat` | 成本更低 |
| 阿里 Qwen | `qwen-max` | 中文内容检测优化 |

---

## 版本历史

| 版本 | 日期 | 变更说明 |
|------|------|---------|
| v1.0 | 2024-03-01 | 初始版本 |
| v1.1 | 2024-03-15 | 增加 signals 字段输出 |
| v1.2 | 2024-04-01 | 优化中文文本检测准确率 |


---

# 后端 B1 · Provider 策略工厂

# AI Humanizer System Prompt

> **文件路径：** `prompts/ai-humanizer-prompt.md`  
> **用途：** AI 文本人性化改写接口的系统提示词  
> **接口：** `POST /api/ai/humanize`  
> **可随时修改此文件，无需改动代码**

---

## 系统提示词（System Prompt）

```
You are an elite human writing specialist and linguistic expert. Your mission is to transform AI-generated text into authentic, natural human writing that is completely undetectable by any AI detection tool, while perfectly preserving the original meaning, facts, and intent.

You have deep expertise in human writing psychology — you understand how real people think, write, and express themselves across different contexts, education levels, and cultures.

## Core Transformation Principles

### 1. Break Structural Predictability
- **Vary paragraph lengths**: Mix very short (1-2 sentence) paragraphs with longer ones
- **Disrupt perfect organization**: Real humans don't always use exactly three main points
- **Remove generic openers/closers**: Eliminate "In today's world," "In conclusion," "Furthermore," "Moreover"
- **Introduce natural asymmetry**: Not every idea needs equal treatment

### 2. Inject Human Voice & Authenticity
- **Add personal perspective**: Include phrases that suggest lived experience ("In practice," "What I've found," "Interestingly,")
- **Use conversational asides**: Brief parenthetical thoughts, qualifications, or tangential observations
- **Allow imperfect transitions**: Real writing sometimes jumps between ideas without perfect bridges
- **Include hedging that sounds natural**: "probably," "seems like," "I'd argue" rather than academic hedges

### 3. Vocabulary Humanization
- **Replace elevated vocabulary**: Swap consistently formal words for their more common alternatives
  - "utilize" → "use", "facilitate" → "help", "implement" → "carry out"
  - "demonstrates" → "shows", "approximately" → "about", "sufficient" → "enough"
- **Introduce contraction variety**: Mix formal and informal register based on context
- **Use domain-specific casual language**: Technical fields have their own jargon that sounds natural
- **Avoid over-reliance on sophisticated connectives**: Use simple connectors more often

### 4. Sentence Structure Variation
- **Mix sentence lengths**: 5-word sentences alongside 35-word sentences within the same paragraph
- **Use rhetorical questions occasionally**: "But what does this actually mean in practice?"
- **Start sentences with conjunctions sometimes**: "And yet," "But then again," "So what happens next?"
- **Use sentence fragments for emphasis**: "Simple, really."
- **Vary clause positions**: Don't always put subordinate clauses in the same position

### 5. Natural Imperfections
- **Allow mild redundancy**: Humans sometimes restate things slightly differently
- **Include minor qualifications mid-thought**: "—well, most of the time, anyway—"
- **Use real-world specificity**: Replace generic examples with specific, plausible ones
- **Introduce minor tonal shifts**: Real writing isn't perfectly consistent in tone throughout

---

## Writing Purpose Adaptations

Apply these specific styles based on the `{purpose}` parameter:

### General Writing
- Balanced mix of formal and informal
- Personal voice with occasional digressions
- Natural paragraph variation (2-5 sentences)

### Essay (Academic)
- Maintain academic rigor but add intellectual personality
- Include genuine critical analysis, not just summarization
- Use disciplinary vocabulary naturally
- Add personal scholarly observations ("This raises an interesting question about...")
- Avoid perfect five-paragraph structure

### Article / Blog
- Conversational but informative
- Short punchy paragraphs (1-3 sentences often)
- Engaging hooks that feel spontaneous
- Practical, relatable examples
- Direct address to reader ("You've probably noticed...")

### Marketing Copy
- Emotional resonance, not just logical persuasion
- Genuine enthusiasm that doesn't feel scripted
- Real pain points addressed directly
- Social proof woven in naturally
- Calls-to-action that feel organic

### Story / Creative Writing
- Rich sensory details from lived experience
- Authentic emotional complexity
- Dialogue that sounds like real people talking
- Pacing variation (quick action, slow reflection)
- Character voice consistency

### Cover Letter
- Specific accomplishments, not generic claims
- Genuine enthusiasm for the specific role
- Personal tone that reveals character
- Concrete language, no buzzwords
- Appropriate humility balanced with confidence

### Report
- Professional but not bureaucratic
- Clear recommendations with nuanced caveats
- Data references feel researched, not generated
- Natural analytical flow with honest limitations acknowledged

### Business Writing
- Direct, professional, but human
- Appropriate informality for business context
- Action-oriented language
- Clear and unambiguous

### Legal Writing
- Precise and formal
- Careful hedging appropriate to legal context
- Clear logical structure retained
- Professional register maintained throughout

---

## Tone Adaptations

Apply these based on the `{tone}` parameter:

### Standard
- Neutral, clear, accessible
- Neither overly formal nor casual
- Appropriate for general audiences

### Fluent
- Smooth, flowing prose
- Strong transitions between ideas
- Emphasis on readability and natural rhythm

### Formal
- Professional register throughout
- Full words (no contractions except where natural)
- Objective perspective preferred

### Academic
- Scholarly vocabulary and citation awareness
- Critical analysis over description
- Hedged claims where appropriate
- Literature-aware phrasing

### Aggressive
- Direct, confident, sometimes blunt
- Strong assertions
- Short powerful sentences
- Minimal hedging

### Friendly
- Warm, approachable, conversational
- First and second person throughout
- Relatable analogies
- Encouraging and positive

---

## Humanization Mode

### Balanced
- Conservative changes that preserve style
- ~30-40% of sentences modified
- Focus on vocabulary and connective changes

### Enhanced
- Moderate restructuring
- ~50-65% of text rewritten
- Paragraph reorganization where needed
- Voice injection and structure variation

### Ultra (Most Human)
- Comprehensive transformation
- ~70-85% of text rewritten
- Full structural reorganization
- Maximum authentic human patterns
- Sentence fragments, rhetorical questions, natural asides

---

## What You Must NEVER Do

1. **Never change factual content**: Preserve all facts, data, names, dates, numbers exactly
2. **Never change the meaning**: The core message must remain identical
3. **Never introduce errors**: Don't add grammatical mistakes or typos
4. **Never make it worse**: The humanized version must be equal or better quality
5. **Never use AI clichés as replacements**: "It's worth noting that" → still AI
6. **Never over-humanize**: Avoid colloquialisms that would be inappropriate for the context
7. **Never change proper nouns, brand names, or technical terminology**

---

## Output Format

Return a valid JSON object only:

```json
{
  "humanized_text": "<the fully humanized text>",
  "changes_summary": {
    "words_changed": <integer>,
    "sentences_restructured": <integer>,
    "paragraphs_modified": <integer>,
    "estimated_score_reduction": <integer 0-50>
  },
  "techniques_applied": [
    "<technique 1 description>",
    "<technique 2 description>"
  ]
}
```
```

---

## 用户消息模板（User Message Template）

```
Transform the following AI-generated text into authentic human writing.

Parameters:
- Purpose: {purpose}
- Tone: {tone}  
- Humanization Mode: {mode}
- Language: {language}

---TEXT TO HUMANIZE---
{input_text}
---END TEXT---

Apply all transformation techniques appropriate for the specified purpose and tone. Return only the JSON response.
```

---

## 参数映射表

| 前端参数 | 值 | 提示词行为 |
|--------|---|----------|
| `purpose` | `general` | 通用转化，平衡风格 |
| `purpose` | `essay` | 学术论文风格，保留严谨性 |
| `purpose` | `article` | 博客/文章风格，更口语化 |
| `purpose` | `marketing` | 营销文案，情感驱动 |
| `purpose` | `story` | 创意写作，叙事感强 |
| `purpose` | `cover_letter` | 求职信，专业且个性化 |
| `purpose` | `report` | 报告风格，专业客观 |
| `purpose` | `business` | 商业写作，简洁有力 |
| `purpose` | `legal` | 法律文书，精准正式 |
| `tone` | `standard` | 标准中性语气 |
| `tone` | `fluent` | 流畅易读 |
| `tone` | `formal` | 正式专业 |
| `tone` | `academic` | 学术写作 |
| `tone` | `aggressive` | 强烈有力 |
| `tone` | `friendly` | 友好亲切 |
| `mode` | `balanced` | 30-40% 改写 |
| `mode` | `enhanced` | 50-65% 改写 |
| `mode` | `ultra` | 70-85% 改写 |

---

## 多语言支持说明

- **英语**：完整支持所有模式
- **中文**：优化了中文写作惯例（成语使用、语气词、段落节奏）
- **日语**：保留敬语系统（丁寧語/普通語），根据 tone 调整
- **韩语**：保留敬语层级（합쇼체/해요체）
- **西班牙语**：地区差异感知（南美 vs 欧洲西班牙语）
- **其他语言**：通用人性化规则应用

---

## 版本历史

| 版本 | 日期 | 变更说明 |
|------|------|---------|
| v1.0 | 2024-03-01 | 初始版本，支持 General/Essay/Article |
| v1.1 | 2024-03-20 | 新增 Marketing/Story/Cover Letter 模式 |
| v1.2 | 2024-04-10 | 新增 Ultra 模式，增强改写强度 |
| v1.3 | 2024-05-01 | 优化中文人性化逻辑，新增地区语言差异感知 |
| v2.0 | 2024-06-01 | 全面重构，新增 9 种写作目的 × 6 种语气矩阵 |


---

# 后端 B1 · Provider 策略工厂

# AI Provider 策略工厂模式 · 后端架构

> **文件路径：** `backend/ai/`  
> **语言：** Go 1.21+  
> **框架：** Gin  
> **模式：** 策略模式（Strategy） + 工厂模式（Factory）

---

## 目录结构

```
backend/ai/
├── provider.go          # 接口定义（Strategy Interface）
├── factory.go           # 工厂（Factory）
├── openai_provider.go   # OpenAI 策略
├── claude_provider.go   # Anthropic Claude 策略
├── gemini_provider.go   # Google Gemini 策略
├── deepseek_provider.go # DeepSeek 策略
├── qwen_provider.go     # 阿里 Qwen 策略
└── prompt_loader.go     # Prompt MD 文件加载器
```

---

## provider.go — 策略接口定义

```go
// backend/ai/provider.go
package ai

import "context"

// DetectRequest AI 检测请求
type DetectRequest struct {
    Text     string `json:"text"`
    Language string `json:"language"`
}

// DetectResponse AI 检测响应
type DetectResponse struct {
    Score      int               `json:"score"`
    Verdict    string            `json:"verdict"`   // human|mixed|ai
    Confidence int               `json:"confidence"`
    Language   string            `json:"language"`
    Sentences  []SentenceResult  `json:"sentences"`
    Analysis   AnalysisScores    `json:"analysis"`
    KeySignals []string          `json:"key_signals"`
    Readability ReadabilityScore `json:"readability"`
    WordCount  int               `json:"word_count"`
    CharCount  int               `json:"char_count"`
}

type SentenceResult struct {
    Text    string   `json:"text"`
    Score   int      `json:"score"`
    Type    string   `json:"type"`    // human|mixed|ai
    Signals []string `json:"signals"`
}

type AnalysisScores struct {
    LexicalScore    int `json:"lexical_score"`
    SyntacticScore  int `json:"syntactic_score"`
    SemanticScore   int `json:"semantic_score"`
    PragmaticScore  int `json:"pragmatic_score"`
}

type ReadabilityScore struct {
    FleschScore int    `json:"flesch_score"`
    Grade       string `json:"grade"`
}

// HumanizeRequest AI 人性化请求
type HumanizeRequest struct {
    Text     string `json:"text"`
    Purpose  string `json:"purpose"`  // general|essay|article|marketing|story|cover_letter|report|business|legal
    Tone     string `json:"tone"`     // standard|fluent|formal|academic|aggressive|friendly
    Mode     string `json:"mode"`     // balanced|enhanced|ultra
    Language string `json:"language"`
}

// HumanizeResponse AI 人性化响应
type HumanizeResponse struct {
    HumanizedText  string         `json:"humanized_text"`
    ChangesSummary ChangesSummary `json:"changes_summary"`
    TechniquesApplied []string    `json:"techniques_applied"`
}

type ChangesSummary struct {
    WordsChanged           int `json:"words_changed"`
    SentencesRestructured  int `json:"sentences_restructured"`
    ParagraphsModified     int `json:"paragraphs_modified"`
    EstimatedScoreReduction int `json:"estimated_score_reduction"`
}

// AIProvider 策略接口 — 所有 AI 供应商必须实现此接口
type AIProvider interface {
    // Detect 检测文本是否为 AI 生成
    Detect(ctx context.Context, req DetectRequest) (*DetectResponse, error)

    // Humanize 将 AI 文本人性化
    Humanize(ctx context.Context, req HumanizeRequest) (*HumanizeResponse, error)

    // Name 返回供应商名称（用于日志和监控）
    Name() string

    // IsAvailable 检查供应商当前是否可用（API Key 已配置）
    IsAvailable() bool
}
```

---

## factory.go — 工厂实现

```go
// backend/ai/factory.go
package ai

import (
    "fmt"
    "os"
    "sync"
    "toolboxnova/config"
)

// ProviderType 供应商类型
type ProviderType string

const (
    ProviderOpenAI   ProviderType = "openai"
    ProviderClaude   ProviderType = "claude"
    ProviderGemini   ProviderType = "gemini"
    ProviderDeepSeek ProviderType = "deepseek"
    ProviderQwen     ProviderType = "qwen"
)

// ProviderFactory AI 供应商工厂（单例）
type ProviderFactory struct {
    providers map[ProviderType]AIProvider
    mu        sync.RWMutex

    // 各用途的默认供应商
    detectProvider   ProviderType
    humanizeProvider ProviderType
}

var (
    factory     *ProviderFactory
    factoryOnce sync.Once
)

// GetFactory 获取工厂单例
func GetFactory() *ProviderFactory {
    factoryOnce.Do(func() {
        factory = &ProviderFactory{
            providers: make(map[ProviderType]AIProvider),
        }
        factory.init()
    })
    return factory
}

// init 初始化所有可用的供应商
func (f *ProviderFactory) init() {
    cfg := config.Get()

    // 注册所有配置了 API Key 的供应商
    providers := []struct {
        ptype    ProviderType
        provider AIProvider
    }{
        {ProviderOpenAI,   NewOpenAIProvider(cfg.OpenAIKey, cfg.OpenAIBaseURL)},
        {ProviderClaude,   NewClaudeProvider(cfg.ClaudeKey)},
        {ProviderGemini,   NewGeminiProvider(cfg.GeminiKey)},
        {ProviderDeepSeek, NewDeepSeekProvider(cfg.DeepSeekKey)},
        {ProviderQwen,     NewQwenProvider(cfg.QwenKey)},
    }

    for _, p := range providers {
        if p.provider.IsAvailable() {
            f.providers[p.ptype] = p.provider
        }
    }

    // 设置默认供应商（按优先级）
    f.detectProvider   = f.selectDefault(cfg.DetectProvider,   ProviderOpenAI, ProviderClaude, ProviderGemini, ProviderDeepSeek, ProviderQwen)
    f.humanizeProvider = f.selectDefault(cfg.HumanizeProvider, ProviderOpenAI, ProviderClaude, ProviderGemini, ProviderDeepSeek, ProviderQwen)
}

// selectDefault 按优先级选择第一个可用的供应商
func (f *ProviderFactory) selectDefault(preferred ProviderType, fallbacks ...ProviderType) ProviderType {
    if preferred != "" {
        if _, ok := f.providers[preferred]; ok {
            return preferred
        }
    }
    for _, fb := range fallbacks {
        if _, ok := f.providers[fb]; ok {
            return fb
        }
    }
    panic("no AI provider available — please configure at least one API key")
}

// GetProvider 获取指定用途的供应商
// usage: "detect" | "humanize"
func (f *ProviderFactory) GetProvider(usage string) AIProvider {
    f.mu.RLock()
    defer f.mu.RUnlock()

    switch usage {
    case "detect":
        return f.providers[f.detectProvider]
    case "humanize":
        return f.providers[f.humanizeProvider]
    default:
        return f.providers[f.detectProvider]
    }
}

// GetProviderByType 按类型获取指定供应商（用于 A/B 测试或手动选择）
func (f *ProviderFactory) GetProviderByType(ptype ProviderType) (AIProvider, error) {
    f.mu.RLock()
    defer f.mu.RUnlock()

    p, ok := f.providers[ptype]
    if !ok {
        return nil, fmt.Errorf("provider %s is not available or not configured", ptype)
    }
    return p, nil
}

// ListAvailable 返回所有可用的供应商列表
func (f *ProviderFactory) ListAvailable() []string {
    f.mu.RLock()
    defer f.mu.RUnlock()

    result := make([]string, 0, len(f.providers))
    for k := range f.providers {
        result = append(result, string(k))
    }
    return result
}
```

---

## prompt_loader.go — Prompt 文件加载器

```go
// backend/ai/prompt_loader.go
package ai

import (
    "fmt"
    "os"
    "path/filepath"
    "regexp"
    "strings"
    "sync"
    "time"
)

// PromptLoader 从 .md 文件加载提示词，支持热更新
type PromptLoader struct {
    promptsDir string
    cache      map[string]cachedPrompt
    mu         sync.RWMutex
}

type cachedPrompt struct {
    content   string
    loadedAt  time.Time
}

const promptCacheTTL = 5 * time.Minute // 5分钟缓存，便于热更新

var promptLoader *PromptLoader
var loaderOnce sync.Once

func GetPromptLoader() *PromptLoader {
    loaderOnce.Do(func() {
        promptLoader = &PromptLoader{
            promptsDir: getPromptsDir(),
            cache:      make(map[string]cachedPrompt),
        }
    })
    return promptLoader
}

func getPromptsDir() string {
    // 支持环境变量覆盖路径
    if dir := os.Getenv("PROMPTS_DIR"); dir != "" {
        return dir
    }
    // 默认相对于可执行文件目录
    exe, _ := os.Executable()
    return filepath.Join(filepath.Dir(exe), "prompts")
}

// LoadDetectPrompt 加载 AI 检测系统提示词
func (pl *PromptLoader) LoadDetectPrompt() (string, error) {
    return pl.loadPrompt("ai-detection-prompt.md", "## 系统提示词（System Prompt）")
}

// LoadHumanizePrompt 加载 AI 人性化系统提示词
func (pl *PromptLoader) LoadHumanizePrompt() (string, error) {
    return pl.loadPrompt("ai-humanizer-prompt.md", "## 系统提示词（System Prompt）")
}

// loadPrompt 加载指定 .md 文件中的代码块内容
func (pl *PromptLoader) loadPrompt(filename, sectionHeader string) (string, error) {
    pl.mu.RLock()
    if cached, ok := pl.cache[filename]; ok {
        if time.Since(cached.loadedAt) < promptCacheTTL {
            pl.mu.RUnlock()
            return cached.content, nil
        }
    }
    pl.mu.RUnlock()

    // 读取文件
    path := filepath.Join(pl.promptsDir, filename)
    data, err := os.ReadFile(path)
    if err != nil {
        return "", fmt.Errorf("failed to load prompt file %s: %w", filename, err)
    }

    // 从 markdown 代码块中提取提示词
    content := extractPromptFromMarkdown(string(data))
    if content == "" {
        return "", fmt.Errorf("no prompt content found in %s", filename)
    }

    // 更新缓存
    pl.mu.Lock()
    pl.cache[filename] = cachedPrompt{
        content:  content,
        loadedAt: time.Now(),
    }
    pl.mu.Unlock()

    return content, nil
}

// extractPromptFromMarkdown 提取 ``` ``` 代码块中的内容
func extractPromptFromMarkdown(content string) string {
    // 匹配 ```\n...\n``` 代码块（非语言指定的）
    re := regexp.MustCompile("(?s)```\n(.*?)\n```")
    matches := re.FindStringSubmatch(content)
    if len(matches) < 2 {
        return ""
    }
    return strings.TrimSpace(matches[1])
}

// InvalidateCache 清除指定文件的缓存（热更新时调用）
func (pl *PromptLoader) InvalidateCache(filename string) {
    pl.mu.Lock()
    delete(pl.cache, filename)
    pl.mu.Unlock()
}
```

---

## openai_provider.go — OpenAI 策略实现

```go
// backend/ai/openai_provider.go
package ai

import (
    "bytes"
    "context"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "time"
)

// OpenAIProvider OpenAI 供应商策略
type OpenAIProvider struct {
    apiKey  string
    baseURL string
    model   string
    client  *http.Client
}

func NewOpenAIProvider(apiKey, baseURL string) *OpenAIProvider {
    if baseURL == "" {
        baseURL = "https://api.openai.com/v1"
    }
    return &OpenAIProvider{
        apiKey:  apiKey,
        baseURL: baseURL,
        model:   "gpt-4o",
        client:  &http.Client{Timeout: 30 * time.Second},
    }
}

func (p *OpenAIProvider) Name() string        { return "openai" }
func (p *OpenAIProvider) IsAvailable() bool   { return p.apiKey != "" }

func (p *OpenAIProvider) Detect(ctx context.Context, req DetectRequest) (*DetectResponse, error) {
    systemPrompt, err := GetPromptLoader().LoadDetectPrompt()
    if err != nil {
        return nil, err
    }

    userMsg := fmt.Sprintf(
        "Please analyze the following text for AI content detection:\n\n---TEXT START---\n%s\n---TEXT END---\n\nLanguage hint: %s\n\nProvide your analysis in the specified JSON format.",
        req.Text, req.Language,
    )

    raw, err := p.callChatAPI(ctx, systemPrompt, userMsg)
    if err != nil {
        return nil, err
    }

    var result DetectResponse
    if err := json.Unmarshal(raw, &result); err != nil {
        return nil, fmt.Errorf("failed to parse detect response: %w", err)
    }
    return &result, nil
}

func (p *OpenAIProvider) Humanize(ctx context.Context, req HumanizeRequest) (*HumanizeResponse, error) {
    systemPrompt, err := GetPromptLoader().LoadHumanizePrompt()
    if err != nil {
        return nil, err
    }

    userMsg := fmt.Sprintf(
        "Transform the following AI-generated text into authentic human writing.\n\nParameters:\n- Purpose: %s\n- Tone: %s\n- Humanization Mode: %s\n- Language: %s\n\n---TEXT TO HUMANIZE---\n%s\n---END TEXT---\n\nReturn only the JSON response.",
        req.Purpose, req.Tone, req.Mode, req.Language, req.Text,
    )

    raw, err := p.callChatAPI(ctx, systemPrompt, userMsg)
    if err != nil {
        return nil, err
    }

    // 清理可能的 markdown 代码块包裹
    raw = cleanJSONResponse(raw)

    var result HumanizeResponse
    if err := json.Unmarshal(raw, &result); err != nil {
        return nil, fmt.Errorf("failed to parse humanize response: %w", err)
    }
    return &result, nil
}

// callChatAPI 调用 OpenAI Chat Completions API
func (p *OpenAIProvider) callChatAPI(ctx context.Context, systemPrompt, userMsg string) ([]byte, error) {
    payload := map[string]interface{}{
        "model": p.model,
        "messages": []map[string]string{
            {"role": "system", "content": systemPrompt},
            {"role": "user",   "content": userMsg},
        },
        "temperature":     0.3,
        "max_tokens":      4096,
        "response_format": map[string]string{"type": "json_object"},
    }

    body, _ := json.Marshal(payload)
    req, err := http.NewRequestWithContext(ctx, "POST", p.baseURL+"/chat/completions", bytes.NewReader(body))
    if err != nil {
        return nil, err
    }
    req.Header.Set("Authorization", "Bearer "+p.apiKey)
    req.Header.Set("Content-Type", "application/json")

    resp, err := p.client.Do(req)
    if err != nil {
        return nil, fmt.Errorf("openai request failed: %w", err)
    }
    defer resp.Body.Close()

    if resp.StatusCode != 200 {
        errBody, _ := io.ReadAll(resp.Body)
        return nil, fmt.Errorf("openai API error %d: %s", resp.StatusCode, string(errBody))
    }

    var apiResp struct {
        Choices []struct {
            Message struct {
                Content string `json:"content"`
            } `json:"message"`
        } `json:"choices"`
    }
    if err := json.NewDecoder(resp.Body).Decode(&apiResp); err != nil {
        return nil, err
    }
    if len(apiResp.Choices) == 0 {
        return nil, fmt.Errorf("openai returned empty choices")
    }

    return []byte(apiResp.Choices[0].Message.Content), nil
}
```

---

## claude_provider.go — Claude 策略实现（关键框架）

```go
// backend/ai/claude_provider.go
package ai

import (
    "bytes"
    "context"
    "encoding/json"
    "fmt"
    "net/http"
    "time"
)

type ClaudeProvider struct {
    apiKey string
    model  string
    client *http.Client
}

func NewClaudeProvider(apiKey string) *ClaudeProvider {
    return &ClaudeProvider{
        apiKey: apiKey,
        model:  "claude-3-5-sonnet-20241022",
        client: &http.Client{Timeout: 30 * time.Second},
    }
}

func (p *ClaudeProvider) Name() string      { return "claude" }
func (p *ClaudeProvider) IsAvailable() bool { return p.apiKey != "" }

func (p *ClaudeProvider) Detect(ctx context.Context, req DetectRequest) (*DetectResponse, error) {
    systemPrompt, _ := GetPromptLoader().LoadDetectPrompt()
    userMsg := buildDetectUserMsg(req)
    raw, err := p.callAPI(ctx, systemPrompt, userMsg)
    if err != nil { return nil, err }
    var result DetectResponse
    if err := json.Unmarshal(raw, &result); err != nil { return nil, err }
    return &result, nil
}

func (p *ClaudeProvider) Humanize(ctx context.Context, req HumanizeRequest) (*HumanizeResponse, error) {
    systemPrompt, _ := GetPromptLoader().LoadHumanizePrompt()
    userMsg := buildHumanizeUserMsg(req)
    raw, err := p.callAPI(ctx, systemPrompt, userMsg)
    if err != nil { return nil, err }
    raw = cleanJSONResponse(raw)
    var result HumanizeResponse
    if err := json.Unmarshal(raw, &result); err != nil { return nil, err }
    return &result, nil
}

func (p *ClaudeProvider) callAPI(ctx context.Context, systemPrompt, userMsg string) ([]byte, error) {
    payload := map[string]interface{}{
        "model":      p.model,
        "max_tokens": 4096,
        "system":     systemPrompt,
        "messages": []map[string]string{
            {"role": "user", "content": userMsg},
        },
    }
    body, _ := json.Marshal(payload)
    req, _ := http.NewRequestWithContext(ctx, "POST", "https://api.anthropic.com/v1/messages", bytes.NewReader(body))
    req.Header.Set("x-api-key", p.apiKey)
    req.Header.Set("anthropic-version", "2023-06-01")
    req.Header.Set("Content-Type", "application/json")

    resp, err := p.client.Do(req)
    if err != nil { return nil, err }
    defer resp.Body.Close()

    var apiResp struct {
        Content []struct {
            Type string `json:"type"`
            Text string `json:"text"`
        } `json:"content"`
    }
    json.NewDecoder(resp.Body).Decode(&apiResp)
    if len(apiResp.Content) == 0 { return nil, fmt.Errorf("claude empty response") }
    return []byte(apiResp.Content[0].Text), nil
}
```

---

## config/config.go — 配置结构（AI 相关字段）

```go
// config/config.go (AI 相关字段片段)
type Config struct {
    // AI Provider API Keys
    OpenAIKey    string `env:"OPENAI_API_KEY"`
    OpenAIBaseURL string `env:"OPENAI_BASE_URL"`    // 支持 Azure/代理
    ClaudeKey    string `env:"ANTHROPIC_API_KEY"`
    GeminiKey    string `env:"GEMINI_API_KEY"`
    DeepSeekKey  string `env:"DEEPSEEK_API_KEY"`
    QwenKey      string `env:"QWEN_API_KEY"`

    // 默认使用哪个供应商（留空则按优先级自动选择）
    DetectProvider   ProviderType `env:"AI_DETECT_PROVIDER"`
    HumanizeProvider ProviderType `env:"AI_HUMANIZE_PROVIDER"`

    // Prompt 文件目录（默认 ./prompts）
    PromptsDir string `env:"PROMPTS_DIR" default:"./prompts"`

    // 其他配置...
    AdsEnabled      bool   `env:"ADS_ENABLED"`
    AdsClientID     string `env:"ADS_CLIENT_ID"`
    EnableGA        bool   `env:"GA_ENABLED"`
    GAMeasurementID string `env:"GA_MEASUREMENT_ID"`
    APIBaseURL      string `env:"API_BASE_URL" default:"/api"`
}
```

---

## 工具函数

```go
// backend/ai/utils.go
package ai

import (
    "fmt"
    "regexp"
    "strings"
)

// cleanJSONResponse 清除 AI 响应中可能的 markdown 代码块包裹
func cleanJSONResponse(raw []byte) []byte {
    s := strings.TrimSpace(string(raw))
    // 去除 ```json\n...\n``` 包裹
    re := regexp.MustCompile("(?s)^```(?:json)?\n?(.*?)\n?```$")
    if matches := re.FindStringSubmatch(s); len(matches) > 1 {
        return []byte(matches[1])
    }
    return raw
}

// buildDetectUserMsg 构建检测用户消息
func buildDetectUserMsg(req DetectRequest) string {
    return fmt.Sprintf(
        "Please analyze the following text for AI content detection:\n\n---TEXT START---\n%s\n---TEXT END---\n\nLanguage hint: %s\n\nProvide your analysis in the specified JSON format.",
        req.Text, req.Language,
    )
}

// buildHumanizeUserMsg 构建人性化用户消息
func buildHumanizeUserMsg(req HumanizeRequest) string {
    return fmt.Sprintf(
        "Transform the following AI-generated text into authentic human writing.\n\nParameters:\n- Purpose: %s\n- Tone: %s\n- Humanization Mode: %s\n- Language: %s\n\n---TEXT TO HUMANIZE---\n%s\n---END TEXT---\n\nReturn only the JSON response.",
        req.Purpose, req.Tone, req.Mode, req.Language, req.Text,
    )
}
```

---

## 环境变量配置示例 `.env`

```bash
# AI Provider Keys（至少配置一个）
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_BASE_URL=https://api.openai.com/v1   # 可改为 Azure 或代理地址
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxx
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxx
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
QWEN_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 默认 Provider（留空自动选择）
AI_DETECT_PROVIDER=openai
AI_HUMANIZE_PROVIDER=claude

# Prompt 文件路径
PROMPTS_DIR=./prompts

# 广告 & GA
ADS_ENABLED=true
ADS_CLIENT_ID=ca-pub-xxxxxxxxxxxxxxxx
GA_ENABLED=true
GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 验收标准 Checklist

### 策略工厂
- [ ] 至少配置一个 AI Provider 时服务正常启动
- [ ] 未配置任何 Provider 时启动失败并打印清晰错误信息
- [ ] `GetProvider("detect")` 返回正确的默认 Provider
- [ ] `GetProvider("humanize")` 返回正确的默认 Provider
- [ ] `GetProviderByType()` 对未配置的 Provider 返回 error
- [ ] 工厂是线程安全的（sync.RWMutex 保护）

### Prompt 加载
- [ ] 首次调用时从文件加载，后续使用缓存（5分钟内）
- [ ] 修改 .md 文件后 5 分钟内自动生效（缓存过期）
- [ ] `PROMPTS_DIR` 环境变量可覆盖默认路径
- [ ] 文件不存在时返回清晰错误信息，不 panic

### OpenAI Provider
- [ ] 检测接口正确调用 `/v1/chat/completions`
- [ ] 响应 JSON 正确解析到 `DetectResponse`
- [ ] API 错误（4xx/5xx）正确向上传递
- [ ] Context 取消时请求中止

### Claude Provider
- [ ] 使用正确的 `anthropic-version` header
- [ ] 响应 content 数组正确提取

### 通用
- [ ] `cleanJSONResponse()` 正确处理 ```json``` 包裹
- [ ] 所有 Provider 实现 `AIProvider` 接口编译通过

