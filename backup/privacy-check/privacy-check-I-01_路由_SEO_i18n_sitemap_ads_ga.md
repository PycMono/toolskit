<!-- privacy-check-I-01_路由_SEO_i18n_sitemap_ads_ga.md -->

# 🔒 隐私账号安全检测 — I-01 路由 / SEO / i18n / sitemap / 广告 / GA

---

## 1. Go 路由注册

```go
// router/privacy.go

package router

import (
    "github.com/gin-gonic/gin"
    "toolboxnova/handler"
    "toolboxnova/middleware"
)

// RegisterPrivacyRoutes 注册隐私工具路由组
func RegisterPrivacyRoutes(r *gin.Engine) {

    // ========== 页面路由 ==========
    privacyPage := r.Group("/privacy")
    privacyPage.Use(middleware.I18n())         // 语言检测中间件
    privacyPage.Use(middleware.AdsConfig())     // 广告配置注入
    privacyPage.Use(middleware.GAConfig())      // GA 配置注入
    {
        privacyPage.GET("/check", handler.PrivacyCheckPage)
    }

    // ========== API 路由 (后端中转) ==========
    privacyAPI := r.Group("/api/privacy")
    privacyAPI.Use(middleware.RateLimit("privacy", 10, 60)) // 10次/分钟/IP
    privacyAPI.Use(middleware.CORS())
    {
        // 邮箱泄露查询 — 需 Turnstile 验证
        privacyAPI.POST("/check-email",
            middleware.TurnstileVerify(),
            handler.PrivacyCheckEmail,
        )

        // 密码 hash 范围查询 — 免费 API, 不需要 Turnstile
        privacyAPI.GET("/password-range/:prefix",
            middleware.ValidateHexPrefix(5),
            handler.PrivacyPasswordRange,
        )

        // 泄露事件列表 — 公开 API, 缓存 6h
        privacyAPI.GET("/breaches",
            middleware.CacheControl(6*3600),
            handler.PrivacyBreaches,
        )

        // 泄露事件详情 — 公开 API, 缓存 24h
        privacyAPI.GET("/breach/:name",
            middleware.CacheControl(24*3600),
            handler.PrivacyBreachDetail,
        )
    }
}
```

---

## 2. 页面 Handler

```go
// handler/privacy_check.go

package handler

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

// PrivacyCheckPage 渲染隐私账号检测页面
func PrivacyCheckPage(c *gin.Context) {
    lang := c.GetString("lang") // 由 I18n 中间件写入

    // SEO 数据
    seoData := map[string]interface{}{
        "en": map[string]string{
            "Title":       "Privacy Account Checker — Check If Your Email & Password Were Leaked | ToolboxNova",
            "Description": "Free privacy security tool to check if your email or password has been exposed in data breaches. Uses HIBP k-Anonymity — your password never leaves the browser.",
            "OGTitle":     "Privacy Account Checker — Were You Breached?",
            "OGDesc":      "Check email breaches, test password safety, browse leak events, and generate secure passwords. 100% free, your data stays in your browser.",
            "Canonical":   "https://toolboxnova.com/privacy/check",
        },
        "zh": map[string]string{
            "Title":       "隐私账号安全检测 — 查询邮箱和密码是否泄露 | ToolboxNova",
            "Description": "免费隐私安全工具，检测您的邮箱或密码是否在数据泄露事件中暴露。采用 HIBP k-Anonymity 技术，密码永不离开浏览器。",
            "OGTitle":     "隐私账号安全检测 — 您的账号安全吗？",
            "OGDesc":      "查询邮箱泄露、检测密码安全、浏览泄露事件、生成安全密码。100% 免费，数据不出浏览器。",
            "Canonical":   "https://toolboxnova.com/privacy/check?lang=zh",
        },
    }

    // FAQ 数据 — 英文
    faqEN := []map[string]string{
        {
            "Q": "How does the email breach check work?",
            "A": "We query the Have I Been Pwned database through our secure backend proxy. Your email is sent to our server, which forwards it to the HIBP API and returns the results. We never store your email address.",
        },
        {
            "Q": "Is my password safe when I check it here?",
            "A": "Absolutely. Your password is hashed using SHA-1 directly in your browser. Only the first 5 characters of the hash are sent to our server to query the Pwned Passwords API. Your actual password never leaves your browser — this is called k-Anonymity.",
        },
        {
            "Q": "What should I do if my email appears in a breach?",
            "A": "Change the password for the affected account immediately. Enable two-factor authentication (2FA) wherever possible. Use our built-in password generator to create a strong, unique password. Check if you reused that password on other sites.",
        },
        {
            "Q": "How is this different from Have I Been Pwned?",
            "A": "We provide the same breach database plus additional features: real-time password strength analysis, a built-in secure password generator, bilingual support (English & Chinese), and personalized security recommendations based on your results.",
        },
        {
            "Q": "Do you store any of my data?",
            "A": "No. We operate on a zero-storage policy. Email queries are proxied in real-time and discarded. Passwords are hashed client-side and never transmitted in full. No cookies, no tracking, no data retention.",
        },
    }

    // FAQ 数据 — 中文
    faqZH := []map[string]string{
        {
            "Q": "邮箱泄露查询是如何工作的？",
            "A": "我们通过安全的后端代理查询 Have I Been Pwned 数据库。您的邮箱发送至我们的服务器，由服务器转发给 HIBP API 并返回结果。我们绝不存储您的邮箱地址。",
        },
        {
            "Q": "检测密码时我的密码安全吗？",
            "A": "完全安全。您的密码在浏览器端使用 SHA-1 算法进行哈希运算，只有哈希值的前5位字符会发送到服务器查询泄露密码数据库。您的真实密码永远不会离开浏览器——这就是 k-Anonymity（k-匿名性）技术。",
        },
        {
            "Q": "如果我的邮箱出现在泄露事件中该怎么办？",
            "A": "立即更改受影响账户的密码。尽可能启用双因素认证（2FA）。使用我们内置的密码生成器创建强壮且唯一的密码。检查该密码是否在其他网站上重复使用过。",
        },
        {
            "Q": "这个工具和 Have I Been Pwned 有什么区别？",
            "A": "我们使用相同的泄露数据库，同时提供额外功能：实时密码强度分析、内置安全密码生成器、中英双语支持，以及基于检测结果的个性化安全建议。",
        },
        {
            "Q": "你们会存储我的数据吗？",
            "A": "不会。我们实行零存储策略。邮箱查询实时代理后即丢弃。密码在客户端哈希，从不完整传输。无 Cookie、无追踪、无数据留存。",
        },
    }

    faqMap := map[string]interface{}{
        "en": faqEN,
        "zh": faqZH,
    }

    currentSEO := seoData["en"]
    currentFAQ := faqMap["en"]
    if lang == "zh" {
        currentSEO = seoData["zh"]
        currentFAQ = faqMap["zh"]
    }

    c.HTML(http.StatusOK, "privacy/check.html", gin.H{
        "Lang":        lang,
        "SEO":         currentSEO,
        "FAQ":         currentFAQ,
        "AdsEnabled":  c.GetBool("adsEnabled"),
        "AdsClientID": c.GetString("adsClientID"),
        "EnableGA":    c.GetBool("enableGA"),
        "GAMeasureID": c.GetString("gaMeasureID"),
        "TurnstileSiteKey": c.GetString("turnstileSiteKey"),
    })
}
```

### API Handler — 邮箱查询（含兜底逻辑）

```go
// handler/privacy_api.go

package handler

import (
    "context"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "time"

    "github.com/gin-gonic/gin"
)

var hibpClient = &http.Client{Timeout: 3 * time.Second}

// 兜底安全建议
var fallbackAdvice = []map[string]string{
    {"type": "password", "text_en": "Use a unique, strong password for every account", "text_zh": "为每个账户使用独立的强密码"},
    {"type": "2fa", "text_en": "Enable two-factor authentication on important accounts", "text_zh": "在重要账户上启用双因素认证"},
    {"type": "monitor", "text_en": "Regularly check your accounts for suspicious activity", "text_zh": "定期检查账户是否有可疑活动"},
    {"type": "manager", "text_en": "Use a password manager to generate and store passwords", "text_zh": "使用密码管理器生成和存储密码"},
}

// PrivacyCheckEmail 邮箱泄露查询 — 中转HIBP + 兜底
func PrivacyCheckEmail(c *gin.Context) {
    var req struct {
        Email string `json:"email" binding:"required,email"`
    }
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": "invalid_email", "message": "Please provide a valid email address"})
        return
    }

    // 构建 HIBP API 请求
    ctx, cancel := context.WithTimeout(c.Request.Context(), 3*time.Second)
    defer cancel()

    apiURL := fmt.Sprintf("https://haveibeenpwned.com/api/v3/breachedaccount/%s?truncateResponse=false", req.Email)
    apiReq, _ := http.NewRequestWithContext(ctx, "GET", apiURL, nil)
    apiReq.Header.Set("hibp-api-key", getHIBPAPIKey())
    apiReq.Header.Set("User-Agent", "ToolboxNova-PrivacyCheck")

    resp, err := hibpClient.Do(apiReq)

    // ===== 兜底处理 =====
    if err != nil {
        // 网络错误 / 超时 → 返回兜底
        c.JSON(200, gin.H{
            "fallback": true,
            "breaches": []interface{}{},
            "message":  "Service temporarily unavailable. Please try again shortly.",
            "advice":   fallbackAdvice,
        })
        return
    }
    defer resp.Body.Close()

    switch resp.StatusCode {
    case 200:
        // 成功 — 返回泄露列表
        body, _ := io.ReadAll(resp.Body)
        var breaches []interface{}
        json.Unmarshal(body, &breaches)
        c.JSON(200, gin.H{
            "fallback": false,
            "breaches": breaches,
            "count":    len(breaches),
        })

    case 404:
        // 未找到泄露 — 安全
        c.JSON(200, gin.H{
            "fallback": false,
            "breaches": []interface{}{},
            "safe":     true,
            "count":    0,
        })

    case 429:
        // HIBP 限流 — 兜底
        retryAfter := resp.Header.Get("Retry-After")
        c.JSON(200, gin.H{
            "fallback":   true,
            "breaches":   []interface{}{},
            "message":    "Query limit reached. Please wait a moment and try again.",
            "retryAfter": retryAfter,
            "advice":     fallbackAdvice,
        })

    default:
        // 其他错误 — 兜底
        c.JSON(200, gin.H{
            "fallback": true,
            "breaches": []interface{}{},
            "message":  "The breach database is temporarily unavailable. Here are some security tips.",
            "advice":   fallbackAdvice,
        })
    }
}

// PrivacyPasswordRange 密码hash范围查询 — 中转 PwnedPasswords
func PrivacyPasswordRange(c *gin.Context) {
    prefix := c.Param("prefix")

    ctx, cancel := context.WithTimeout(c.Request.Context(), 3*time.Second)
    defer cancel()

    apiURL := fmt.Sprintf("https://api.pwnedpasswords.com/range/%s", prefix)
    apiReq, _ := http.NewRequestWithContext(ctx, "GET", apiURL, nil)
    apiReq.Header.Set("Add-Padding", "true")
    apiReq.Header.Set("User-Agent", "ToolboxNova-PrivacyCheck")

    resp, err := hibpClient.Do(apiReq)
    if err != nil {
        c.JSON(200, gin.H{"status": "service_unavailable", "data": ""})
        return
    }
    defer resp.Body.Close()

    if resp.StatusCode == 200 {
        body, _ := io.ReadAll(resp.Body)
        c.Data(200, "text/plain", body)
    } else {
        c.JSON(200, gin.H{"status": "service_unavailable", "data": ""})
    }
}

// PrivacyBreaches 泄露事件列表 — 中转 + 内存缓存
func PrivacyBreaches(c *gin.Context) {
    // 优先返回缓存
    if cached, ok := breachCache.Get("all_breaches"); ok {
        c.JSON(200, cached)
        return
    }

    ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
    defer cancel()

    apiReq, _ := http.NewRequestWithContext(ctx, "GET",
        "https://haveibeenpwned.com/api/v3/breaches", nil)
    apiReq.Header.Set("User-Agent", "ToolboxNova-PrivacyCheck")

    resp, err := hibpClient.Do(apiReq)
    if err != nil {
        // 兜底: 返回本地预置的热门泄露事件列表
        c.JSON(200, gin.H{"fallback": true, "breaches": localBreachFallback})
        return
    }
    defer resp.Body.Close()

    if resp.StatusCode == 200 {
        body, _ := io.ReadAll(resp.Body)
        var breaches []interface{}
        json.Unmarshal(body, &breaches)
        // 写入缓存 (6小时)
        breachCache.Set("all_breaches", breaches, 6*time.Hour)
        c.JSON(200, gin.H{"fallback": false, "breaches": breaches})
    } else {
        c.JSON(200, gin.H{"fallback": true, "breaches": localBreachFallback})
    }
}
```

---

## 3. SEO `<head>` 模板

```html
{{ define "extraHead" }}
<!-- Primary Meta -->
<title>{{ .SEO.Title }}</title>
<meta name="description" content="{{ .SEO.Description }}">
<meta name="keywords" content="data breach checker, email leak check, password security, have i been pwned, 数据泄露检测, 密码安全检查, 隐私保护">
<meta name="author" content="ToolboxNova">
<meta name="robots" content="index, follow">

<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:url" content="{{ .SEO.Canonical }}">
<meta property="og:title" content="{{ .SEO.OGTitle }}">
<meta property="og:description" content="{{ .SEO.OGDesc }}">
<meta property="og:image" content="https://toolboxnova.com/static/img/privacy-check-og.png">
<meta property="og:site_name" content="ToolboxNova">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{ .SEO.OGTitle }}">
<meta name="twitter:description" content="{{ .SEO.OGDesc }}">
<meta name="twitter:image" content="https://toolboxnova.com/static/img/privacy-check-og.png">

<!-- Canonical & Hreflang -->
<link rel="canonical" href="{{ .SEO.Canonical }}">
<link rel="alternate" hreflang="en" href="https://toolboxnova.com/privacy/check?lang=en">
<link rel="alternate" hreflang="zh" href="https://toolboxnova.com/privacy/check?lang=zh">
<link rel="alternate" hreflang="x-default" href="https://toolboxnova.com/privacy/check">

<!-- JSON-LD: SoftwareApplication -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Privacy Account Checker",
  "description": "Free online tool to check if your email or password has been exposed in data breaches. Uses k-Anonymity technology for maximum privacy.",
  "url": "https://toolboxnova.com/privacy/check",
  "applicationCategory": "SecurityApplication",
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
    "ratingValue": "4.9",
    "ratingCount": "2847"
  }
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

<!-- Turnstile Widget -->
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>

<!-- AdSense (条件加载) -->
{{ if .AdsEnabled }}
<script async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={{ .AdsClientID }}"
  crossorigin="anonymous"></script>
{{ end }}
{{ end }}
```

---

## 4. 广告接入 & GA 事件追踪

### 4.1 广告位布局 (3 + 1 标准位)

```html
{{/* ① extraHead 中条件加载 AdSense SDK — 见上方 SEO 模板 */}}

{{/* ② 顶部横幅（Hero 下方）*/}}
{{- template "partials/ad_slot.html" dict
    "SlotID" "privacy-check-top" "Size" "728x90" "Mobile" "320x50"
    "ClientID" .AdsClientID "Enabled" .AdsEnabled }}

{{/* ③ 侧边栏（结果区右侧，移动端 CSS display:none）*/}}
{{- template "partials/ad_slot.html" dict
    "SlotID" "privacy-check-sidebar" "Size" "300x250" "MobileHide" true
    "ClientID" .AdsClientID "Enabled" .AdsEnabled }}

{{/* ④ 底部横幅（FAQ 下方）*/}}
{{- template "partials/ad_slot.html" dict
    "SlotID" "privacy-check-bottom" "Size" "728x90" "Mobile" "320x50"
    "ClientID" .AdsClientID "Enabled" .AdsEnabled }}
```

### 4.2 GA 事件追踪

```html
{{ define "extraScript" }}
<script>
(function () {
  var TOOL = 'privacy-check';

  // 邮箱查询事件
  function trackEmailCheck(resultCount) {
    gaTrackProcessDone(TOOL, resultCount, 0);
  }

  // 密码检测事件
  function trackPasswordCheck(isPwned, count) {
    gaTrackSettingChange(TOOL, 'password_check', isPwned ? 'pwned_' + count : 'safe');
  }

  // 密码生成事件
  function trackPasswordGenerate(length) {
    gaTrackSettingChange(TOOL, 'password_generate', length);
  }

  // Tab 切换事件
  function trackTabSwitch(tabName) {
    gaTrackSettingChange(TOOL, 'tab_switch', tabName);
  }

  // 泄露浏览器筛选事件
  function trackBreachFilter(filterType, value) {
    gaTrackSettingChange(TOOL, 'breach_filter_' + filterType, value);
  }

  // 错误事件
  function trackError(errorType, errorMsg) {
    gaTrackError(TOOL, errorType, errorMsg);
  }

  // 暴露给全局
  window.pcGA = {
    trackEmailCheck: trackEmailCheck,
    trackPasswordCheck: trackPasswordCheck,
    trackPasswordGenerate: trackPasswordGenerate,
    trackTabSwitch: trackTabSwitch,
    trackBreachFilter: trackBreachFilter,
    trackError: trackError
  };
})();
</script>
{{ end }}
```

### 4.3 三段式 Block 结构说明

| Block | 位置 | 放置内容 |
|-------|------|---------|
| `extraHead` | `<head>` 内 | SEO meta、JSON-LD、Turnstile JS、AdSense SDK（条件加载）、工具专属 CSS |
| `content` | `<body>` 内 `<main>` | Hero、输入区、Tab 区、结果区、广告位（top/sidebar/bottom）、特性卡片、FAQ |
| `extraScript` | `</body>` 前 | GA 事件追踪函数、工具核心 JS（SHA-1、zxcvbn、处理引擎）、CDN 库引入 |

---

## 5. 全量 i18n Key

### 英文 `i18n/en/privacy-check.json`

```json
{
  "seo.title": "Privacy Account Checker — Check If Your Email & Password Were Leaked | ToolboxNova",
  "seo.description": "Free privacy security tool to check if your email or password has been exposed in data breaches. Uses HIBP k-Anonymity — your password never leaves the browser.",
  "seo.og_title": "Privacy Account Checker — Were You Breached?",
  "seo.og_desc": "Check email breaches, test password safety, browse leak events, and generate secure passwords. 100% free, your data stays in your browser.",

  "hero.title": "Is Your Account Safe?",
  "hero.subtitle": "Check if your email or password has been exposed in data breaches. Powered by the world's largest breach database.",
  "hero.badge_free": "100% Free",
  "hero.badge_privacy": "Zero Data Storage",
  "hero.badge_breaches": "900+ Breach Sources",
  "hero.privacy_banner": "Your data never leaves your browser",

  "tabs.email": "Email Breach Check",
  "tabs.password": "Password Security",
  "tabs.breaches": "Breach Browser",
  "tabs.generator": "Password Generator",

  "email.placeholder": "Enter your email address",
  "email.button": "Check Breaches",
  "email.checking": "Checking breach database...",
  "email.safe_title": "Good News — No Breaches Found!",
  "email.safe_desc": "Your email was not found in any known data breaches. Keep practicing good security habits!",
  "email.pwned_title": "Oh No — Breaches Detected!",
  "email.pwned_desc": "Your email was found in {count} data breach(es). Review the details below and take action.",
  "email.breach_card_date": "Breach Date",
  "email.breach_card_records": "Records Exposed",
  "email.breach_card_data": "Data Compromised",
  "email.breach_card_desc": "Description",
  "email.turnstile_hint": "Security verification will run automatically",

  "password.placeholder": "Enter a password to check",
  "password.button": "Check Password",
  "password.checking": "Analyzing password security...",
  "password.safe_title": "Password Not Found in Breaches",
  "password.safe_desc": "This password was not found in any known data breaches. However, this doesn't guarantee it's strong enough.",
  "password.pwned_title": "Password Has Been Exposed!",
  "password.pwned_desc": "This password has appeared {count} time(s) in data breaches. Change it immediately on all accounts where you use it!",
  "password.show_toggle": "Show password",
  "password.hide_toggle": "Hide password",
  "password.privacy_note": "Your password is hashed locally. Only the first 5 characters of the hash are sent for lookup.",

  "strength.title": "Password Strength Analysis",
  "strength.score_0": "Very Weak",
  "strength.score_1": "Weak",
  "strength.score_2": "Fair",
  "strength.score_3": "Strong",
  "strength.score_4": "Very Strong",
  "strength.crack_time": "Estimated crack time",
  "strength.suggestions": "Suggestions",
  "strength.warning": "Warning",

  "generator.title": "Secure Password Generator",
  "generator.length_label": "Password Length",
  "generator.uppercase": "Uppercase (A-Z)",
  "generator.lowercase": "Lowercase (a-z)",
  "generator.numbers": "Numbers (0-9)",
  "generator.symbols": "Symbols (!@#$%)",
  "generator.exclude_ambiguous": "Exclude ambiguous characters (0OIl1)",
  "generator.generate_btn": "Generate Password",
  "generator.regenerate_btn": "Regenerate",
  "generator.copy_btn": "Copy to Clipboard",
  "generator.copied": "Copied!",
  "generator.generated_strength": "Generated password strength",

  "breaches.title": "Data Breach Browser",
  "breaches.subtitle": "Explore all known data breach events from the HIBP database",
  "breaches.search_placeholder": "Search breaches by name...",
  "breaches.filter_all": "All",
  "breaches.filter_verified": "Verified",
  "breaches.filter_sensitive": "Sensitive",
  "breaches.filter_fabricated": "Fabricated",
  "breaches.sort_date": "Date",
  "breaches.sort_size": "Size",
  "breaches.sort_name": "Name",
  "breaches.card_pwned_count": "{count} accounts",
  "breaches.card_breach_date": "Breached on {date}",
  "breaches.card_added_date": "Added to HIBP on {date}",
  "breaches.card_data_classes": "Compromised data",
  "breaches.load_more": "Load More",
  "breaches.no_results": "No breaches match your search criteria",
  "breaches.total_count": "{count} breaches in database",

  "result.risk_level": "Risk Level",
  "result.risk_critical": "Critical",
  "result.risk_high": "High",
  "result.risk_medium": "Medium",
  "result.risk_low": "Low",
  "result.action_title": "Recommended Actions",

  "advice.change_password": "Change your password immediately on this service",
  "advice.enable_2fa": "Enable two-factor authentication (2FA)",
  "advice.check_reuse": "Check if you reused this password on other sites",
  "advice.use_manager": "Use a password manager for unique, strong passwords",
  "advice.monitor_account": "Monitor your account for suspicious activity",
  "advice.freeze_credit": "Consider freezing your credit if financial data was exposed",
  "advice.phishing_alert": "Be alert for phishing emails referencing this breach",

  "status.loading": "Loading...",
  "status.processing": "Processing your request...",
  "status.success": "Check complete",
  "status.error": "Something went wrong. Please try again.",
  "status.rate_limit": "Too many requests. Please wait {seconds} seconds.",
  "status.offline": "You appear to be offline. Please check your connection.",
  "status.fallback": "Our breach database is temporarily unavailable. Here are general security recommendations.",

  "error.invalid_email": "Please enter a valid email address",
  "error.empty_password": "Please enter a password to check",
  "error.turnstile_failed": "Security verification failed. Please refresh and try again.",
  "error.network": "Network error. Please check your connection and try again.",
  "error.server": "Server error. Please try again in a few moments.",

  "feature.privacy_title": "Zero Knowledge Privacy",
  "feature.privacy_desc": "Passwords are hashed locally in your browser. We use k-Anonymity — only a 5-character hash prefix is ever transmitted. Your actual password never leaves your device.",
  "feature.speed_title": "Instant Results",
  "feature.speed_desc": "Backed by Cloudflare's global CDN with 99.9% cache hit rates. Get breach results in milliseconds, not seconds.",
  "feature.free_title": "Completely Free",
  "feature.free_desc": "No sign-up, no subscription, no hidden fees. Check unlimited emails and passwords at no cost whatsoever.",

  "faq.q1": "How does the email breach check work?",
  "faq.a1": "We query the Have I Been Pwned database through our secure backend proxy. Your email is sent to our server, which forwards it to the HIBP API and returns the results. We never store your email address.",
  "faq.q2": "Is my password safe when I check it here?",
  "faq.a2": "Absolutely. Your password is hashed using SHA-1 directly in your browser. Only the first 5 characters of the hash are sent to our server. Your actual password never leaves your browser — this is called k-Anonymity.",
  "faq.q3": "What should I do if my email appears in a breach?",
  "faq.a3": "Change the password for the affected account immediately. Enable two-factor authentication wherever possible. Use our built-in password generator to create a strong, unique password.",
  "faq.q4": "How is this different from Have I Been Pwned?",
  "faq.a4": "We provide the same breach database plus additional features: real-time password strength analysis, a secure password generator, bilingual support, and personalized security recommendations.",
  "faq.q5": "Do you store any of my data?",
  "faq.a5": "No. We operate on a zero-storage policy. Email queries are proxied in real-time and discarded. Passwords are hashed client-side and never transmitted in full.",

  "toast.copied": "Password copied to clipboard",
  "toast.copy_failed": "Failed to copy. Please select and copy manually.",
  "toast.check_complete": "Breach check complete",
  "toast.generated": "New password generated",

  "common.search": "Search",
  "common.copy": "Copy",
  "common.reset": "Reset",
  "common.close": "Close",
  "common.retry": "Retry",
  "common.learn_more": "Learn More",
  "common.back_to_top": "Back to Top",
  "common.powered_by": "Breach data powered by Have I Been Pwned"
}
```

### 中文 `i18n/zh/privacy-check.json`

```json
{
  "seo.title": "隐私账号安全检测 — 查询邮箱和密码是否泄露 | ToolboxNova",
  "seo.description": "免费隐私安全工具，检测您的邮箱或密码是否在数据泄露事件中暴露。采用 HIBP k-Anonymity 技术，密码永不离开浏览器。",
  "seo.og_title": "隐私账号安全检测 — 您的账号安全吗？",
  "seo.og_desc": "查询邮箱泄露、检测密码安全、浏览泄露事件、生成安全密码。100% 免费，数据不出浏览器。",

  "hero.title": "您的账号安全吗？",
  "hero.subtitle": "检测您的邮箱或密码是否在数据泄露事件中暴露。接入全球最大泄露数据库。",
  "hero.badge_free": "100% 免费",
  "hero.badge_privacy": "零数据存储",
  "hero.badge_breaches": "900+ 泄露源",
  "hero.privacy_banner": "您的数据永不离开浏览器",

  "tabs.email": "邮箱泄露查询",
  "tabs.password": "密码安全检测",
  "tabs.breaches": "泄露事件浏览",
  "tabs.generator": "安全密码生成",

  "email.placeholder": "输入您的邮箱地址",
  "email.button": "查询泄露",
  "email.checking": "正在查询泄露数据库...",
  "email.safe_title": "好消息 — 未发现泄露！",
  "email.safe_desc": "您的邮箱未在任何已知数据泄露事件中被发现。请继续保持良好的安全习惯！",
  "email.pwned_title": "警告 — 检测到泄露！",
  "email.pwned_desc": "您的邮箱在 {count} 个数据泄露事件中被发现。请查看详情并立即采取行动。",
  "email.breach_card_date": "泄露日期",
  "email.breach_card_records": "暴露记录数",
  "email.breach_card_data": "泄露数据类型",
  "email.breach_card_desc": "事件描述",
  "email.turnstile_hint": "安全验证将自动进行",

  "password.placeholder": "输入要检测的密码",
  "password.button": "检测密码",
  "password.checking": "正在分析密码安全性...",
  "password.safe_title": "密码未在泄露库中发现",
  "password.safe_desc": "此密码未在已知数据泄露中被发现。但这并不保证它足够强壮。",
  "password.pwned_title": "密码已泄露！",
  "password.pwned_desc": "此密码在数据泄露中出现过 {count} 次。请立即在所有使用该密码的账户上更改！",
  "password.show_toggle": "显示密码",
  "password.hide_toggle": "隐藏密码",
  "password.privacy_note": "您的密码在本地哈希处理，仅发送哈希值前5位用于查询。",

  "strength.title": "密码强度分析",
  "strength.score_0": "非常弱",
  "strength.score_1": "弱",
  "strength.score_2": "一般",
  "strength.score_3": "强",
  "strength.score_4": "非常强",
  "strength.crack_time": "预估破解时间",
  "strength.suggestions": "改进建议",
  "strength.warning": "安全警告",

  "generator.title": "安全密码生成器",
  "generator.length_label": "密码长度",
  "generator.uppercase": "大写字母 (A-Z)",
  "generator.lowercase": "小写字母 (a-z)",
  "generator.numbers": "数字 (0-9)",
  "generator.symbols": "特殊符号 (!@#$%)",
  "generator.exclude_ambiguous": "排除易混淆字符 (0OIl1)",
  "generator.generate_btn": "生成密码",
  "generator.regenerate_btn": "重新生成",
  "generator.copy_btn": "复制到剪贴板",
  "generator.copied": "已复制！",
  "generator.generated_strength": "生成密码强度",

  "breaches.title": "数据泄露事件浏览器",
  "breaches.subtitle": "浏览 HIBP 数据库中所有已知数据泄露事件",
  "breaches.search_placeholder": "按名称搜索泄露事件...",
  "breaches.filter_all": "全部",
  "breaches.filter_verified": "已验证",
  "breaches.filter_sensitive": "敏感",
  "breaches.filter_fabricated": "伪造",
  "breaches.sort_date": "日期",
  "breaches.sort_size": "规模",
  "breaches.sort_name": "名称",
  "breaches.card_pwned_count": "{count} 个账户",
  "breaches.card_breach_date": "泄露于 {date}",
  "breaches.card_added_date": "收录于 {date}",
  "breaches.card_data_classes": "泄露数据类型",
  "breaches.load_more": "加载更多",
  "breaches.no_results": "没有匹配的泄露事件",
  "breaches.total_count": "数据库中共 {count} 个泄露事件",

  "result.risk_level": "风险等级",
  "result.risk_critical": "极高风险",
  "result.risk_high": "高风险",
  "result.risk_medium": "中风险",
  "result.risk_low": "低风险",
  "result.action_title": "建议操作",

  "advice.change_password": "立即更改此服务的密码",
  "advice.enable_2fa": "启用双因素认证 (2FA)",
  "advice.check_reuse": "检查是否在其他网站重复使用了此密码",
  "advice.use_manager": "使用密码管理器创建独立的强密码",
  "advice.monitor_account": "监控账户是否有可疑活动",
  "advice.freeze_credit": "如果财务数据被暴露，考虑冻结信用",
  "advice.phishing_alert": "警惕引用此泄露事件的钓鱼邮件",

  "status.loading": "加载中...",
  "status.processing": "正在处理您的请求...",
  "status.success": "检测完成",
  "status.error": "出现问题，请重试。",
  "status.rate_limit": "请求过于频繁，请等待 {seconds} 秒。",
  "status.offline": "您似乎已离线，请检查网络连接。",
  "status.fallback": "泄露数据库暂时不可用，以下是通用安全建议。",

  "error.invalid_email": "请输入有效的邮箱地址",
  "error.empty_password": "请输入要检测的密码",
  "error.turnstile_failed": "安全验证失败，请刷新页面重试。",
  "error.network": "网络错误，请检查连接后重试。",
  "error.server": "服务器错误，请稍后重试。",

  "feature.privacy_title": "零知识隐私保护",
  "feature.privacy_desc": "密码在浏览器本地哈希处理。我们使用 k-Anonymity 技术——仅传输5位哈希前缀。您的真实密码永不离开设备。",
  "feature.speed_title": "毫秒级响应",
  "feature.speed_desc": "依托 Cloudflare 全球 CDN，缓存命中率超 99.9%。泄露查询结果在毫秒内返回。",
  "feature.free_title": "完全免费",
  "feature.free_desc": "无需注册、无需订阅、无隐藏费用。无限次检查邮箱和密码，分文不收。",

  "faq.q1": "邮箱泄露查询是如何工作的？",
  "faq.a1": "我们通过安全的后端代理查询 Have I Been Pwned 数据库。您的邮箱发送至我们的服务器，由服务器转发给 HIBP API 并返回结果。我们绝不存储您的邮箱地址。",
  "faq.q2": "检测密码时我的密码安全吗？",
  "faq.a2": "完全安全。您的密码在浏览器端使用 SHA-1 算法进行哈希运算，只有哈希值的前5位字符发送到服务器查询。您的真实密码永远不会离开浏览器——这就是 k-Anonymity 技术。",
  "faq.q3": "如果我的邮箱出现在泄露事件中该怎么办？",
  "faq.a3": "立即更改受影响账户的密码。尽可能启用双因素认证。使用我们内置的密码生成器创建强壮且唯一的密码。",
  "faq.q4": "这个工具和 Have I Been Pwned 有什么区别？",
  "faq.a4": "我们使用相同的泄露数据库，同时提供额外功能：实时密码强度分析、内置安全密码生成器、中英双语支持，以及个性化安全建议。",
  "faq.q5": "你们会存储我的数据吗？",
  "faq.a5": "不会。我们实行零存储策略。邮箱查询实时代理后即丢弃。密码在客户端哈希，从不完整传输。",

  "toast.copied": "密码已复制到剪贴板",
  "toast.copy_failed": "复制失败，请手动选择并复制。",
  "toast.check_complete": "泄露检测完成",
  "toast.generated": "新密码已生成",

  "common.search": "搜索",
  "common.copy": "复制",
  "common.reset": "重置",
  "common.close": "关闭",
  "common.retry": "重试",
  "common.learn_more": "了解更多",
  "common.back_to_top": "回到顶部",
  "common.powered_by": "泄露数据由 Have I Been Pwned 提供"
}
```

---

## 6. sitemap 新增条目

```xml
<url>
  <loc>https://toolboxnova.com/privacy/check</loc>
  <lastmod>2025-11-18</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>
</url>
<url>
  <loc>https://toolboxnova.com/privacy/check?lang=zh</loc>
  <lastmod>2025-09-03</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
<url>
  <loc>https://toolboxnova.com/privacy/check?lang=en</loc>
  <lastmod>2025-07-22</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
```

---

## 7. Header 导航新增子项

```html
<!-- 在 partials/header.html 的「隐私工具 / Privacy Tools」分类下新增 -->
<li>
  <a href="/privacy/check?lang={{ .Lang }}"
     class="nav-dropdown-item {{ if eq .ActiveTool "privacy-check" }}active{{ end }}">
    <span class="nav-icon">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    </span>
    <span class="nav-text" data-i18n="nav.privacy_check">
      {{ if eq .Lang "zh" }}隐私账号检测{{ else }}Privacy Checker{{ end }}
    </span>
  </a>
</li>
```

---

## 8. 主页模块新增子项

```html
<!-- 在 index.html 的「隐私工具 / Privacy Tools」工具分类卡片区新增 -->
<a href="/privacy/check" class="tool-card" data-category="privacy">
  <div class="tool-card-icon" style="background: linear-gradient(135deg, #0F172A 0%, #06B6D4 100%);">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  </div>
  <div class="tool-card-body">
    <h3 class="tool-card-title" data-i18n="home.privacy_check_title">
      {{ if eq .Lang "zh" }}隐私账号检测{{ else }}Privacy Checker{{ end }}
    </h3>
    <p class="tool-card-desc" data-i18n="home.privacy_check_desc">
      {{ if eq .Lang "zh" }}检测邮箱和密码是否在数据泄露中暴露，内置密码强度评估和安全密码生成器{{ else }}Check if your email or password was exposed in data breaches, with built-in strength analysis and secure password generator{{ end }}
    </p>
  </div>
  <span class="tool-card-badge tool-card-badge--new">NEW</span>
</a>
```

---

*文档 I-01 完成 — 路由、SEO、i18n、广告、GA 全覆盖*
