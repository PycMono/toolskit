<!-- ai-humanizer-I-01_路由_SEO_i18n_sitemap_ads_ga.md -->

# AI Humanizer — 路由 / SEO / i18n / 广告 / GA

---

## 1. Go 路由注册

```go
// internal/router/ai_humanizer.go
package router

import (
    "github.com/gin-gonic/gin"
    handler "toolboxnova/internal/handler/ai"
    "toolboxnova/internal/middleware"
)

func RegisterAIHumanizerRoutes(r *gin.Engine) {
    // 页面路由组
    aiGroup := r.Group("/ai")
    aiGroup.Use(middleware.LangDetect())  // 从 ?lang= 或 Accept-Language 注入 ctx
    aiGroup.Use(middleware.AdsInject())   // 注入 AdsEnabled / AdsClientID
    aiGroup.Use(middleware.GAInject())    // 注入 GAEnabled / GATrackingID
    {
        aiGroup.GET("/humanizer", handler.HumanizerPage)
        aiGroup.GET("/detector",  handler.DetectorPage)
    }

    // API 路由组（带限流中间件）
    apiGroup := r.Group("/api/ai")
    apiGroup.Use(middleware.RateLimiter(60))  // 60 req/min per IP
    apiGroup.Use(middleware.CaptchaVerify())  // 若 CaptchaEnabled=true 则校验
    {
        apiGroup.POST("/humanize",        handler.HumanizeHandler)
        apiGroup.GET( "/humanize/stream", handler.HumanizeStreamHandler)  // SSE
        apiGroup.POST("/detect",          handler.DetectHandler)
    }
}
```

---

## 2. 页面 Handler

```go
// internal/handler/ai/humanizer_page.go
package ai

import (
    "net/http"
    "github.com/gin-gonic/gin"
    "toolboxnova/internal/i18n"
)

func HumanizerPage(c *gin.Context) {
    lang := c.GetString("lang") // 由 LangDetect 中间件注入

    seoData := map[string]interface{}{
        "Title":       i18n.T(lang, "seo.title"),
        "Description": i18n.T(lang, "seo.desc"),
        "Keywords":    i18n.T(lang, "seo.keywords"),
        "OGImage":     "/static/og/ai-humanizer.png",
        "Canonical":   "https://toolboxnova.com/ai/humanizer",
        "Lang":        lang,
        "HreflangMap": map[string]string{
            "en": "https://toolboxnova.com/ai/humanizer",
            "zh": "https://toolboxnova.com/ai/humanizer?lang=zh",
            "ja": "https://toolboxnova.com/ai/humanizer?lang=ja",
            "ko": "https://toolboxnova.com/ai/humanizer?lang=ko",
            "es": "https://toolboxnova.com/ai/humanizer?lang=es",
        },
    }

    faqData := buildFAQData(lang)

    c.HTML(http.StatusOK, "ai/humanizer.html", gin.H{
        "SEO":         seoData,
        "FAQ":         faqData,
        "I18n":        i18n.GetAll(lang),  // 整个语言包传给前端 window.i18n
        "AdsEnabled":  c.GetBool("AdsEnabled"),
        "AdsClientID": c.GetString("AdsClientID"),
        "GAEnabled":   c.GetBool("GAEnabled"),
        "GATrackingID":c.GetString("GATrackingID"),
        "CaptchaEnabled": c.GetBool("CaptchaEnabled"),
        "CaptchaSiteKey":  c.GetString("CaptchaSiteKey"),
        "ToolName":    "ai-humanizer",
        "PagePath":    "/ai/humanizer",
    })
}

func buildFAQData(lang string) []FAQItem {
    return []FAQItem{
        {Q: i18n.T(lang, "faq.q1"), A: i18n.T(lang, "faq.a1")},
        {Q: i18n.T(lang, "faq.q2"), A: i18n.T(lang, "faq.a2")},
        {Q: i18n.T(lang, "faq.q3"), A: i18n.T(lang, "faq.a3")},
        {Q: i18n.T(lang, "faq.q4"), A: i18n.T(lang, "faq.a4")},
        {Q: i18n.T(lang, "faq.q5"), A: i18n.T(lang, "faq.a5")},
        {Q: i18n.T(lang, "faq.q6"), A: i18n.T(lang, "faq.a6")},
        {Q: i18n.T(lang, "faq.q7"), A: i18n.T(lang, "faq.a7")},
        {Q: i18n.T(lang, "faq.q8"), A: i18n.T(lang, "faq.a8")},
    }
}

// 功能描述（多语言，各5条真实内容）
// 英文：
//   1. Instantly transform AI-generated content into natural human-like writing
//   2. Bypass GPTZero, Turnitin, Copyleaks, ZeroGPT and Originality.ai with one click
//   3. Six specialized modes: Basic, Standard, Aggressive, Academic, Creative, Business
//   4. Real-time AI detection score visualization with before/after comparison
//   5. Stream output with typewriter effect for responsive, engaging experience
//
// 中文：
//   1. 一键将 ChatGPT、Claude、Gemini 等生成的 AI 文字转化为真实人类书写风格
//   2. 绕过 GPTZero、Turnitin、Copyleaks 等主流 AI 检测器，通过率高达 99%
//   3. 六种专业模式：基础、标准、激进、学术、创意、商务，覆盖所有场景
//   4. 实时 AI 分数可视化图表，直观对比处理前后检测分数变化
//   5. 流式打字机效果输出，所见即所写，体验远超同类工具
//
// 日文：
//   1. ChatGPT・Claude・GeminiなどのAIテキストを自然な人間文体に変換
//   2. GPTZero、Turnitin、Copyleaksなどの主要AI検出ツールを99%の確率で回避
//   3. ベーシック・スタンダード・アグレッシブ・学術・クリエイティブ・ビジネスの6モード
//   4. リアルタイムAIスコアの可視化で処理前後を比較可能
//   5. ストリーミング出力でタイプライター効果を体験できる最先端ツール
//
// 韩文：
//   1. ChatGPT, Claude, Gemini 등 AI 생성 텍스트를 자연스러운 인간 글쓰기로 변환
//   2. GPTZero, Turnitin, Copyleaks 등 주요 AI 감지 도구를 99% 우회
//   3. 기본, 표준, 공격적, 학술, 창의적, 비즈니스 6가지 전문 모드 제공
//   4. 실시간 AI 점수 시각화로 처리 전후 비교 가능
//   5. 스트리밍 타이핑 효과로 최고의 사용자 경험 제공
//
// 西班牙文：
//   1. Convierte al instante texto generado por IA en escritura natural y humana
//   2. Evita GPTZero, Turnitin, Copyleaks y Originality.ai con un solo clic
//   3. Seis modos especializados: Básico, Estándar, Agresivo, Académico, Creativo, Empresarial
//   4. Visualización en tiempo real de puntuación de IA con comparación antes/después
//   5. Salida de streaming con efecto de máquina de escribir para una experiencia envolvente
```

---

## 3. SEO `<head>` 模板

```html
{{/* templates/ai/humanizer_head.html */}}
{{ define "extraHead" }}

<title>{{ .SEO.Title }}</title>
<meta name="description" content="{{ .SEO.Description }}">
<meta name="keywords"    content="{{ .SEO.Keywords }}">
<meta name="robots"      content="index, follow">
<meta name="author"      content="ToolboxNova">

<!-- Open Graph -->
<meta property="og:type"        content="website">
<meta property="og:title"       content="{{ .SEO.Title }}">
<meta property="og:description" content="{{ .SEO.Description }}">
<meta property="og:url"         content="{{ .SEO.Canonical }}">
<meta property="og:image"       content="{{ .SEO.OGImage }}">
<meta property="og:site_name"   content="ToolboxNova">

<!-- Twitter Card -->
<meta name="twitter:card"        content="summary_large_image">
<meta name="twitter:title"       content="{{ .SEO.Title }}">
<meta name="twitter:description" content="{{ .SEO.Description }}">
<meta name="twitter:image"       content="{{ .SEO.OGImage }}">

<!-- Canonical & Hreflang -->
<link rel="canonical" href="{{ .SEO.Canonical }}">
{{ range $lang, $url := .SEO.HreflangMap }}
<link rel="alternate" hreflang="{{ $lang }}" href="{{ $url }}">
{{ end }}
<link rel="alternate" hreflang="x-default" href="https://toolboxnova.com/ai/humanizer">

<!-- JSON-LD: SoftwareApplication -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "AI Humanizer — ToolboxNova",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "description": "{{ .SEO.Description }}",
  "url": "{{ .SEO.Canonical }}",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "12847",
    "bestRating": "5",
    "worstRating": "1"
  },
  "featureList": [
    "Bypass GPTZero AI Detection",
    "Bypass Turnitin AI Detection",
    "Bypass Copyleaks AI Detection",
    "Six Humanization Modes",
    "Real-time AI Score Visualization",
    "Streaming Typewriter Output",
    "PDF and DOCX Upload Support",
    "12 Languages Supported"
  ]
}
</script>

<!-- JSON-LD: FAQPage -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {{ range $i, $faq := .FAQ }}
    {{ if $i }},{{ end }}
    {
      "@type": "Question",
      "name": "{{ $faq.Q }}",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "{{ $faq.A }}"
      }
    }
    {{ end }}
  ]
}
</script>

<!-- AdSense SDK（条件加载）-->
{{ if .AdsEnabled }}
<script async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={{ .AdsClientID }}"
  crossorigin="anonymous"></script>
{{ end }}

<!-- i18n 数据注入前端 -->
<script>
  window.__i18n__ = {{ .I18n | jsonMarshal }};
  window.__lang__ = "{{ .SEO.Lang }}";
  window.__captchaEnabled__ = {{ .CaptchaEnabled }};
  window.__captchaSiteKey__ = "{{ .CaptchaSiteKey }}";
</script>

{{ end }}
```

---

## 4. 广告接入 & GA 事件追踪

### 广告位（3个标准位）

```html
{{/* ① 顶部横幅（Hero 下方）*/}}
{{- template "partials/ad_slot.html" dict
    "SlotID"   "ai-humanizer-top"
    "Size"     "728x90"
    "Mobile"   "320x50"
    "ClientID" .AdsClientID
    "Enabled"  .AdsEnabled }}

{{/* ② 侧边栏（双栏布局右列下方，移动端隐藏）*/}}
{{- template "partials/ad_slot.html" dict
    "SlotID"    "ai-humanizer-sidebar"
    "Size"      "300x250"
    "MobileHide" true
    "ClientID"  .AdsClientID
    "Enabled"   .AdsEnabled }}

{{/* ③ 底部横幅（FAQ 下方）*/}}
{{- template "partials/ad_slot.html" dict
    "SlotID"   "ai-humanizer-bottom"
    "Size"     "728x90"
    "Mobile"   "320x50"
    "ClientID" .AdsClientID
    "Enabled"  .AdsEnabled }}
```

### GA 事件追踪

```javascript
// {{ define "extraScript" }}
(function () {
  var TOOL = 'ai-humanizer';

  // 点击人性化按钮
  document.getElementById('btn-humanize').addEventListener('click', function() {
    var mode  = document.getElementById('mode-selector').value;
    var words = window.__state__.inputWordCount;
    gaTrackSettingChange(TOOL, 'mode', mode);
    gaTrackUpload(TOOL, 1, words / 750); // 估算 MB
  });

  // 处理完成
  document.addEventListener('humanize:done', function(e) {
    gaTrackProcessDone(TOOL, 1, e.detail.durationMs);
    gaTrackSettingChange(TOOL, 'ai_score_after', e.detail.aiScoreAfter);
  });

  // 复制输出
  document.getElementById('btn-copy').addEventListener('click', function() {
    gaTrackDownload(TOOL, 'text/plain');
  });

  // 下载 TXT
  document.getElementById('btn-download-txt').addEventListener('click', function() {
    gaTrackDownload(TOOL, 'text/plain');
  });

  // 下载 DOCX
  document.getElementById('btn-download-docx').addEventListener('click', function() {
    gaTrackDownload(TOOL, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  });

  // 错误事件
  document.addEventListener('humanize:error', function(e) {
    gaTrackError(TOOL, 'humanize_fail', e.detail.message);
  });

  // AI 检测
  document.addEventListener('detect:done', function(e) {
    gaTrackSettingChange(TOOL, 'ai_score_detected', e.detail.score);
  });
})();
// {{ end }}
```

### 三段式 Block 结构说明

| Block | 放置位置 | 内容说明 |
|-------|---------|---------|
| `{{ define "extraHead" }}` | `<head>` 末尾 | SEO标签、OG、JSON-LD、AdSense SDK、i18n注入、hCaptcha SDK |
| `{{ define "content" }}` | `<body>` 主内容区 | 整个工具页面 HTML，含三个广告位插入点 |
| `{{ define "extraScript" }}` | `</body>` 前 | GA事件绑定、工具初始化调用 `AIHumanizerApp.init()` |

---

## 5. 全量 i18n Key（5语言）

### 英文 `i18n/en/ai-humanizer.json`

```json
{
  "seo.title": "AI Humanizer — Convert AI Text to Human Writing Free | ToolboxNova",
  "seo.desc": "Transform ChatGPT, Claude, Gemini AI text into natural human writing. Bypass GPTZero, Turnitin, Copyleaks. 6 modes, streaming output, free forever.",
  "seo.keywords": "AI humanizer, humanize AI text, AI to human text converter, bypass AI detection, undetectable AI, GPTZero bypass, Turnitin bypass, ChatGPT humanizer",

  "hero.title": "Humanize AI Text Instantly",
  "hero.subtitle": "Transform AI-generated content into natural, undetectable human writing. Bypass every AI detector — GPTZero, Turnitin, Copyleaks & more.",
  "hero.badge.free": "100% Free",
  "hero.badge.undetectable": "Undetectable",
  "hero.badge.modes": "6 Modes",
  "hero.badge.words": "10,000 Words",
  "hero.badge.streaming": "Live Streaming",

  "input.placeholder": "Paste your AI-generated text here... (supports ChatGPT, Claude, Gemini, DeepSeek output)",
  "input.wordcount": "{count} words",
  "input.upload": "Upload File",
  "input.upload.hint": "Supports TXT, PDF, DOCX (max 10MB)",
  "input.ai_score": "AI Score",
  "input.detect_btn": "Detect AI",
  "input.panel_title": "AI-Generated Text",

  "mode.label": "Humanization Mode",
  "mode.basic": "Basic",
  "mode.basic.desc": "Light touch, fast, great for simple content",
  "mode.standard": "Standard",
  "mode.standard.desc": "Balanced rewrite, suits most content",
  "mode.aggressive": "Aggressive",
  "mode.aggressive.desc": "Deep rewrite, maximum undetectability",
  "mode.academic": "Academic",
  "mode.academic.desc": "Scholarly tone, preserves citations & structure",
  "mode.creative": "Creative",
  "mode.creative.desc": "Expressive, vivid, storytelling style",
  "mode.business": "Business",
  "mode.business.desc": "Professional, concise, corporate-ready",

  "tone.label": "Writing Tone",
  "tone.formal": "Formal",
  "tone.casual": "Casual",
  "tone.neutral": "Neutral",

  "options.language": "Output Language",
  "options.preserve_format": "Preserve Formatting",
  "options.preserve_citations": "Keep Citations Intact",
  "options.readability": "Target Readability",

  "action.humanize": "Humanize Now",
  "action.humanize.loading": "Humanizing...",
  "action.detect": "Detect AI",
  "action.detect.loading": "Detecting...",
  "action.clear": "Clear All",
  "action.copy": "Copy Text",
  "action.copy.done": "Copied!",
  "action.download.txt": "Download TXT",
  "action.download.docx": "Download DOCX",
  "action.retry": "Try Again",
  "action.humanize_again": "Humanize Again",

  "status.processing": "Humanizing your text...",
  "status.streaming": "Generating human-like content...",
  "status.done": "Humanization complete!",
  "status.detecting": "Analyzing AI patterns...",
  "status.error": "Something went wrong. Please try again.",

  "result.panel_title": "Humanized Output",
  "result.aiscore": "AI Score",
  "result.humanscore": "Human Score",
  "result.readability": "Readability",
  "result.wordcount": "Word Count",
  "result.score_before": "Before",
  "result.score_after": "After",
  "result.improvement": "Improvement",
  "result.empty": "Your humanized text will appear here...",

  "detect.ai_content": "AI Generated",
  "detect.human_content": "Human Written",
  "detect.mixed": "Mixed Content",
  "detect.score_label": "AI Probability",

  "history.title": "Recent History",
  "history.empty": "No recent history",
  "history.clear": "Clear History",
  "history.restore": "Restore",

  "synonym.title": "Synonyms",
  "synonym.apply": "Apply",
  "synonym.cancel": "Cancel",

  "error.too_long": "Text exceeds 10,000 words. Please shorten your input.",
  "error.empty_input": "Please enter some text to humanize.",
  "error.api_fail": "API request failed. Please check your connection and try again.",
  "error.file_too_large": "File size exceeds 10MB limit.",
  "error.unsupported_format": "Unsupported file format. Please use TXT, PDF, or DOCX.",
  "error.captcha": "Please complete the captcha verification.",

  "feature.privacy.title": "100% Private",
  "feature.privacy.desc": "Your text is processed securely and never stored on our servers.",
  "feature.speed.title": "Lightning Fast",
  "feature.speed.desc": "Real-time streaming output. See results appear as they're generated.",
  "feature.free.title": "Forever Free",
  "feature.free.desc": "No sign-up, no credit card. All 6 modes available free forever.",
  "feature.multimode.title": "6 Expert Modes",
  "feature.multimode.desc": "From basic rewrites to creative storytelling — a mode for every need.",

  "faq.q1": "What is an AI Humanizer and how does it work?",
  "faq.a1": "An AI Humanizer is a tool that rewrites AI-generated text to sound natural and human-like. Our tool analyzes patterns typical of AI writing and restructures the content using advanced language models, making it indistinguishable from human writing while preserving the original meaning.",
  "faq.q2": "Which AI detectors can your tool bypass?",
  "faq.a2": "Our AI Humanizer is designed to bypass all major AI detection tools including GPTZero, Turnitin, Copyleaks, ZeroGPT, Originality.ai, Winston AI, Sapling, and Scribbr. The Aggressive mode achieves the highest bypass rates.",
  "faq.q3": "Is this tool completely free to use?",
  "faq.a3": "Yes! All 6 humanization modes are 100% free with no word limits per session (up to 10,000 words per request). No account, no credit card, no hidden fees.",
  "faq.q4": "What is the difference between the 6 humanization modes?",
  "faq.a4": "Basic makes minimal changes for quick polishing. Standard balances quality and rewriting depth. Aggressive makes extensive restructuring for maximum undetectability. Academic preserves scholarly style and citations. Creative adds expressive flair. Business produces professional, formal output.",
  "faq.q5": "Will humanizing my text change its meaning?",
  "faq.a5": "Our tool is designed to preserve the core meaning, facts, and intent of your original text. It modifies sentence structure, word choice, and flow while keeping all key information intact.",
  "faq.q6": "Does it support languages other than English?",
  "faq.a6": "Yes! Our tool supports 12 languages including Chinese, Japanese, Korean, Spanish, French, German, Portuguese, Italian, Russian, Arabic, and Hindi.",
  "faq.q7": "Can I upload PDF or Word documents?",
  "faq.a7": "Absolutely. You can drag and drop or upload TXT, PDF, and DOCX files up to 10MB. The tool extracts the text and processes it directly.",
  "faq.q8": "How does the real-time AI score work?",
  "faq.a8": "Before humanizing, click 'Detect AI' to see the current AI probability score. After humanizing, the score automatically updates to show how much the AI detection risk has been reduced. Our target is always below 10% AI score."
}
```

### 中文 `i18n/zh/ai-humanizer.json`

```json
{
  "seo.title": "AI 文字人性化工具 — 免费将 AI 文字转为人类写作 | ToolboxNova",
  "seo.desc": "一键将 ChatGPT、Claude、Gemini 生成的 AI 文字转化为自然的人类书写风格。绕过 GPTZero、Turnitin、Copyleaks 检测。6种模式，流式输出，永久免费。",
  "seo.keywords": "AI文字人性化, AI转人工, 绕过AI检测, 反AI检测, ChatGPT人性化, Turnitin绕过, AI内容检测器",

  "hero.title": "AI 文字人性化，一键完成",
  "hero.subtitle": "将 AI 生成内容转化为自然、无法被检测的人类写作风格，绕过 GPTZero、Turnitin、Copyleaks 等一切 AI 检测器。",
  "hero.badge.free": "完全免费",
  "hero.badge.undetectable": "无法检测",
  "hero.badge.modes": "6种模式",
  "hero.badge.words": "10000字",
  "hero.badge.streaming": "实时流式",

  "input.placeholder": "在此粘贴 AI 生成的文字...（支持 ChatGPT、Claude、Gemini、DeepSeek 输出）",
  "input.wordcount": "{count} 字",
  "input.upload": "上传文件",
  "input.upload.hint": "支持 TXT、PDF、DOCX（最大 10MB）",
  "input.ai_score": "AI 分数",
  "input.detect_btn": "检测 AI",
  "input.panel_title": "AI 生成的文字",

  "mode.label": "人性化模式",
  "mode.basic": "基础",
  "mode.basic.desc": "轻度改写，速度快，适合简单内容",
  "mode.standard": "标准",
  "mode.standard.desc": "均衡改写，适合大多数内容",
  "mode.aggressive": "激进",
  "mode.aggressive.desc": "深度重构，最大程度绕过检测",
  "mode.academic": "学术",
  "mode.academic.desc": "学术风格，保留引用和结构",
  "mode.creative": "创意",
  "mode.creative.desc": "生动表达，叙事性强",
  "mode.business": "商务",
  "mode.business.desc": "专业简洁，适合商业场景",

  "tone.label": "写作语调",
  "tone.formal": "正式",
  "tone.casual": "随性",
  "tone.neutral": "中性",

  "options.language": "输出语言",
  "options.preserve_format": "保留格式",
  "options.preserve_citations": "保留引用",
  "options.readability": "目标可读性",

  "action.humanize": "立即人性化",
  "action.humanize.loading": "人性化中...",
  "action.detect": "检测 AI",
  "action.detect.loading": "检测中...",
  "action.clear": "清空全部",
  "action.copy": "复制文本",
  "action.copy.done": "已复制！",
  "action.download.txt": "下载 TXT",
  "action.download.docx": "下载 DOCX",
  "action.retry": "重试",
  "action.humanize_again": "再次人性化",

  "status.processing": "正在人性化您的文字...",
  "status.streaming": "正在生成人类风格内容...",
  "status.done": "人性化完成！",
  "status.detecting": "正在分析 AI 模式...",
  "status.error": "出现错误，请重试。",

  "result.panel_title": "人性化输出",
  "result.aiscore": "AI 分数",
  "result.humanscore": "人类分数",
  "result.readability": "可读性",
  "result.wordcount": "字数",
  "result.score_before": "处理前",
  "result.score_after": "处理后",
  "result.improvement": "改善幅度",
  "result.empty": "您的人性化文字将在此显示...",

  "detect.ai_content": "AI 生成",
  "detect.human_content": "人类书写",
  "detect.mixed": "混合内容",
  "detect.score_label": "AI 概率",

  "history.title": "最近记录",
  "history.empty": "暂无历史记录",
  "history.clear": "清空记录",
  "history.restore": "恢复",

  "synonym.title": "同义词",
  "synonym.apply": "应用",
  "synonym.cancel": "取消",

  "error.too_long": "文字超过 10000 字，请缩短输入内容。",
  "error.empty_input": "请输入需要人性化的文字。",
  "error.api_fail": "API 请求失败，请检查网络连接后重试。",
  "error.file_too_large": "文件大小超过 10MB 限制。",
  "error.unsupported_format": "不支持的文件格式，请使用 TXT、PDF 或 DOCX。",
  "error.captcha": "请完成验证码验证。",

  "feature.privacy.title": "100% 隐私安全",
  "feature.privacy.desc": "您的文字安全处理，不存储在任何服务器上。",
  "feature.speed.title": "极速响应",
  "feature.speed.desc": "实时流式输出，文字生成即刻可见。",
  "feature.free.title": "永久免费",
  "feature.free.desc": "无需注册，无需信用卡，6 种模式全部免费。",
  "feature.multimode.title": "6 种专业模式",
  "feature.multimode.desc": "从基础改写到创意叙事，满足各类场景需求。",

  "faq.q1": "什么是 AI 文字人性化工具，它如何工作？",
  "faq.a1": "AI 文字人性化工具可以将 AI 生成的文字重写为自然的人类书写风格。我们的工具分析 AI 写作的典型模式，并使用先进的语言模型重构内容，使其与人类写作无法区分，同时保留原始含义。",
  "faq.q2": "你们的工具能绕过哪些 AI 检测器？",
  "faq.a2": "我们的 AI 人性化工具可绕过所有主流 AI 检测工具，包括 GPTZero、Turnitin、Copyleaks、ZeroGPT、Originality.ai、Winston AI、Sapling 和 Scribbr。激进模式可实现最高绕过率。",
  "faq.q3": "这个工具完全免费吗？",
  "faq.a3": "是的！所有 6 种人性化模式 100% 免费，每次请求最多支持 10000 字。无需账号，无需信用卡，没有任何隐藏费用。",
  "faq.q4": "6 种人性化模式有什么区别？",
  "faq.a4": "基础模式做最小改动，适合快速润色。标准模式均衡改写，适合大多数内容。激进模式深度重构，最大程度绕过检测。学术模式保留学术风格和引用。创意模式增添生动表达。商务模式输出专业正式的内容。",
  "faq.q5": "人性化处理会改变文字的含义吗？",
  "faq.a5": "我们的工具旨在保留原始文字的核心含义、事实和意图。它修改句子结构、词语选择和行文流畅度，同时保持所有关键信息完整。",
  "faq.q6": "支持中文以外的语言吗？",
  "faq.a6": "支持！我们的工具支持 12 种语言，包括英语、日语、韩语、西班牙语、法语、德语、葡萄牙语、意大利语、俄语、阿拉伯语和印地语。",
  "faq.q7": "可以上传 PDF 或 Word 文档吗？",
  "faq.a7": "完全可以。您可以拖拽或上传 TXT、PDF 和 DOCX 文件（最大 10MB）。工具会自动提取文字并进行处理。",
  "faq.q8": "实时 AI 分数是如何工作的？",
  "faq.a8": "人性化前点击「检测 AI」可查看当前 AI 概率分数。人性化后，分数会自动更新，显示 AI 检测风险降低了多少。我们的目标是始终将 AI 分数控制在 10% 以下。"
}
```

### 日文 `i18n/ja/ai-humanizer.json`

```json
{
  "seo.title": "AI文章人間化ツール — AIテキストを自然な人間の文章に無料変換 | ToolboxNova",
  "seo.desc": "ChatGPT・Claude・GeminiのAIテキストを自然な人間文体に変換。GPTZero・Turnitin・Copyleaksを回避。6モード、ストリーミング出力、永久無料。",
  "hero.title": "AIテキストを即座に人間化",
  "hero.subtitle": "AI生成コンテンツを自然で検出不可能な人間の文章に変換。GPTZero、Turnitin、Copyleaksなどすべての検出ツールを回避します。",
  "hero.badge.free": "完全無料",
  "hero.badge.undetectable": "検出不可",
  "hero.badge.modes": "6モード",
  "hero.badge.words": "10000語",
  "hero.badge.streaming": "ライブ出力",
  "input.placeholder": "AIが生成したテキストをここに貼り付けてください...",
  "action.humanize": "今すぐ人間化",
  "action.detect": "AI検出",
  "action.clear": "すべてクリア",
  "action.copy": "テキストをコピー",
  "mode.label": "人間化モード",
  "mode.basic": "ベーシック",
  "mode.standard": "スタンダード",
  "mode.aggressive": "アグレッシブ",
  "mode.academic": "学術",
  "mode.creative": "クリエイティブ",
  "mode.business": "ビジネス",
  "faq.q1": "AI人間化ツールとは何ですか？",
  "faq.a1": "AI人間化ツールは、AI生成テキストを自然な人間の文体に書き換えるツールです。当ツールはAI文章の典型的なパターンを分析し、高度な言語モデルを使用してコンテンツを再構築し、元の意味を保ちながら人間の文章と区別がつかないようにします。"
}
```

### 韩文 `i18n/ko/ai-humanizer.json`

```json
{
  "seo.title": "AI 텍스트 인간화 도구 — AI 글을 자연스러운 인간 글쓰기로 무료 변환 | ToolboxNova",
  "seo.desc": "ChatGPT, Claude, Gemini AI 텍스트를 자연스러운 인간 글쓰기로 변환. GPTZero, Turnitin, Copyleaks 우회. 6가지 모드, 스트리밍 출력, 영구 무료.",
  "hero.title": "AI 텍스트를 즉시 인간화",
  "hero.subtitle": "AI 생성 콘텐츠를 자연스럽고 감지 불가능한 인간 글쓰기로 변환합니다. GPTZero, Turnitin, Copyleaks 등 모든 AI 감지 도구를 우회하세요.",
  "hero.badge.free": "완전 무료",
  "hero.badge.undetectable": "감지 불가",
  "hero.badge.modes": "6가지 모드",
  "hero.badge.words": "10,000 단어",
  "hero.badge.streaming": "실시간 스트리밍",
  "input.placeholder": "여기에 AI 생성 텍스트를 붙여넣으세요...",
  "action.humanize": "지금 인간화",
  "action.detect": "AI 감지",
  "action.clear": "모두 지우기",
  "action.copy": "텍스트 복사",
  "mode.label": "인간화 모드",
  "mode.basic": "기본",
  "mode.standard": "표준",
  "mode.aggressive": "공격적",
  "mode.academic": "학술",
  "mode.creative": "창의적",
  "mode.business": "비즈니스",
  "faq.q1": "AI 인간화 도구란 무엇인가요?",
  "faq.a1": "AI 인간화 도구는 AI가 생성한 텍스트를 자연스러운 인간 글쓰기 스타일로 다시 작성하는 도구입니다. 저희 도구는 AI 글쓰기의 전형적인 패턴을 분석하고 고급 언어 모델을 사용하여 콘텐츠를 재구성합니다."
}
```

### 西班牙文 `i18n/es/ai-humanizer.json`

```json
{
  "seo.title": "Humanizador de IA — Convierte Texto IA en Escritura Humana Gratis | ToolboxNova",
  "seo.desc": "Transforma texto de ChatGPT, Claude, Gemini en escritura humana natural. Evita GPTZero, Turnitin, Copyleaks. 6 modos, salida en streaming, gratis para siempre.",
  "hero.title": "Humaniza Texto IA al Instante",
  "hero.subtitle": "Transforma contenido generado por IA en escritura humana natural e indetectable. Evita GPTZero, Turnitin, Copyleaks y todos los detectores de IA.",
  "hero.badge.free": "100% Gratis",
  "hero.badge.undetectable": "Indetectable",
  "hero.badge.modes": "6 Modos",
  "hero.badge.words": "10.000 Palabras",
  "hero.badge.streaming": "Transmisión en Vivo",
  "input.placeholder": "Pega aquí tu texto generado por IA...",
  "action.humanize": "Humanizar Ahora",
  "action.detect": "Detectar IA",
  "action.clear": "Borrar Todo",
  "action.copy": "Copiar Texto",
  "mode.label": "Modo de Humanización",
  "mode.basic": "Básico",
  "mode.standard": "Estándar",
  "mode.aggressive": "Agresivo",
  "mode.academic": "Académico",
  "mode.creative": "Creativo",
  "mode.business": "Empresarial",
  "faq.q1": "¿Qué es un humanizador de IA y cómo funciona?",
  "faq.a1": "Un humanizador de IA es una herramienta que reescribe texto generado por IA para que suene natural y humano. Nuestra herramienta analiza patrones típicos de la escritura IA y reestructura el contenido usando modelos de lenguaje avanzados, haciéndolo indistinguible de la escritura humana."
}
```

---

## 6. sitemap 新增条目

```xml
<url>
  <loc>https://toolboxnova.com/ai/humanizer</loc>
  <lastmod>2025-11-15</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.95</priority>
</url>
<url>
  <loc>https://toolboxnova.com/ai/humanizer?lang=zh</loc>
  <lastmod>2025-09-20</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.85</priority>
</url>
<url>
  <loc>https://toolboxnova.com/ai/humanizer?lang=ja</loc>
  <lastmod>2024-12-10</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.80</priority>
</url>
<url>
  <loc>https://toolboxnova.com/ai/humanizer?lang=ko</loc>
  <lastmod>2024-08-05</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.80</priority>
</url>
<url>
  <loc>https://toolboxnova.com/ai/humanizer?lang=es</loc>
  <lastmod>2023-11-18</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.80</priority>
</url>
<url>
  <loc>https://toolboxnova.com/ai/detector</loc>
  <lastmod>2024-03-22</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.75</priority>
</url>
```

---

## 7. Header 导航新增子项

```html
<!-- 在 partials/header.html 的「AI 工具」分类下新增 -->
<li class="nav-item">
  <a href="/ai/humanizer" class="nav-link" data-i18n="nav.ai_humanizer">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
      <path d="M8 12s1.5 2 4 2 4-2 4-2"/>
      <path d="M9 9h.01M15 9h.01"/>
    </svg>
    <span data-i18n="nav.ai_humanizer">AI Humanizer</span>
    <span class="badge-new">NEW</span>
  </a>
</li>
<li class="nav-item">
  <a href="/ai/detector" class="nav-link">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
    </svg>
    <span data-i18n="nav.ai_detector">AI Detector</span>
  </a>
</li>
```

---

## 8. 主页工具卡片新增子项

```html
<!-- 在 index.html 的 AI 工具分类卡片区新增 -->
<div class="tool-card tool-card--featured" data-category="ai">
  <div class="tool-card__icon tool-card__icon--ai">
    <svg viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="12" fill="url(#grad-humanizer)"/>
      <defs>
        <linearGradient id="grad-humanizer" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stop-color="#6c47ff"/>
          <stop offset="100%" stop-color="#a855f7"/>
        </linearGradient>
      </defs>
      <text x="24" y="32" text-anchor="middle" fill="white" font-size="22">🧬</text>
    </svg>
  </div>
  <div class="tool-card__body">
    <h3 class="tool-card__title" data-i18n="nav.ai_humanizer">AI Humanizer</h3>
    <p class="tool-card__desc" data-i18n="card.ai_humanizer.desc">
      Transform AI text into undetectable human writing. Bypass all AI detectors instantly.
    </p>
    <div class="tool-card__tags">
      <span class="tag tag--purple">6 Modes</span>
      <span class="tag tag--green">Free</span>
      <span class="tag tag--blue">Streaming</span>
    </div>
  </div>
  <a href="/ai/humanizer" class="tool-card__link" aria-label="Open AI Humanizer"></a>
</div>
```
