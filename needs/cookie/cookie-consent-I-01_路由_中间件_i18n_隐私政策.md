# cookie-consent-I-01_路由_中间件_i18n_隐私政策.md

---

## 1. Go 中间件新增：ConsentMiddleware

### middleware/consent.go

```go
package middleware

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

type ConsentConfig struct {
    CookieName   string // 默认 "cky_consent"
    CookieMaxAge int    // 默认 365 天（秒）
    Domain       string // 如 "toolboxnova.com"
}

// ConsentMiddleware 读取用户同意 Cookie，注入模板变量
// 供 base.html 中 Consent Mode v2 默认值使用
func ConsentMiddleware(cfg ConsentConfig) gin.HandlerFunc {
    if cfg.CookieName == "" {
        cfg.CookieName = "cky_consent"
    }
    if cfg.CookieMaxAge == 0 {
        cfg.CookieMaxAge = 365 * 24 * 3600
    }
    return func(c *gin.Context) {
        consentVal, err := c.Cookie(cfg.CookieName)

        // 解析同意状态，格式: "analytics:granted,ads:granted"
        analytics := "denied"
        ads := "denied"
        hasConsent := false

        if err == nil && consentVal != "" {
            hasConsent = true
            analytics = parseConsentField(consentVal, "analytics")
            ads = parseConsentField(consentVal, "ads")
        }

        // 注入模板变量
        c.Set("ConsentHasDecision", hasConsent)    // 用户是否已做过选择
        c.Set("ConsentAnalytics", analytics)       // "granted" | "denied"
        c.Set("ConsentAds", ads)                   // "granted" | "denied"
        c.Set("ConsentCookieName", cfg.CookieName)

        c.Next()
    }
}

// parseConsentField 从 Cookie 值中提取指定字段
// Cookie 格式: "necessary:granted,analytics:granted,ads:denied"
func parseConsentField(val, field string) string {
    // 实现简单 key:value 解析
    prefix := field + ":"
    for _, part := range splitConsent(val) {
        if len(part) > len(prefix) && part[:len(prefix)] == prefix {
            return part[len(prefix):]
        }
    }
    return "denied"
}

func splitConsent(val string) []string {
    // 按逗号分割
    var parts []string
    start := 0
    for i, c := range val {
        if c == ',' {
            parts = append(parts, val[start:i])
            start = i + 1
        }
    }
    parts = append(parts, val[start:])
    return parts
}
```

### 路由注册（main.go / router.go）

```go
// 在现有中间件链中插入 ConsentMiddleware，必须在 GAConfig 和 AdsConfig 之前
r.Use(middleware.I18nMiddleware())
r.Use(middleware.ConsentMiddleware(middleware.ConsentConfig{
    CookieName:   cfg.ConsentCookieName, // 从配置读取
    CookieMaxAge: 365 * 24 * 3600,
    Domain:       cfg.Domain,
}))
r.Use(middleware.AdsConfig(cfg))
r.Use(middleware.GAConfig(cfg))

// 隐私政策页路由
r.GET("/privacy", handler.PrivacyHandler)
```

---

## 2. 隐私政策 Handler

### handler/privacy.go

```go
package handler

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

func PrivacyHandler(c *gin.Context) {
    lang := c.GetString("lang") // 由 I18nMiddleware 注入

    seoData := map[string]interface{}{
        "Title":       i18n(lang, "privacy.seo.title"),
        "Description": i18n(lang, "privacy.seo.description"),
        "Canonical":   "https://toolboxnova.com/privacy",
        "HreflangZh":  "https://toolboxnova.com/privacy?lang=zh",
        "HreflangEn":  "https://toolboxnova.com/privacy?lang=en",
        "LastUpdated": "2024-07-15",
    }

    c.HTML(http.StatusOK, "privacy.html", gin.H{
        // SEO
        "SEO": seoData,
        // 中间件注入的通用变量
        "AdsEnabled":          c.GetBool("AdsEnabled"),
        "AdsClientID":         c.GetString("AdsClientID"),
        "GAEnabled":           c.GetBool("GAEnabled"),
        "GATrackingID":        c.GetString("GATrackingID"),
        "ConsentHasDecision":  c.GetBool("ConsentHasDecision"),
        "ConsentAnalytics":    c.GetString("ConsentAnalytics"),
        "ConsentAds":          c.GetString("ConsentAds"),
        "ConsentCookieName":   c.GetString("ConsentCookieName"),
        "Lang":                lang,
        // 隐私政策内容各 Section（从 i18n 读取）
        "Sections": buildPrivacySections(lang),
    })
}

func buildPrivacySections(lang string) []map[string]string {
    keys := []string{
        "collect", "use", "cookies", "thirdparty", "rights", "contact",
    }
    var sections []map[string]string
    for _, k := range keys {
        sections = append(sections, map[string]string{
            "Title":   i18n(lang, "privacy.content."+k+".title"),
            "Content": i18n(lang, "privacy.content."+k+".body"),
        })
    }
    return sections
}
```

---

## 3. base.html 修改：Consent Mode v2 集成

在 `<head>` 最顶部（其他所有脚本之前）插入以下 Block：

```html
{{/* ── Consent Mode v2 默认值 ── 必须是页面第一个 script ──────── */}}
{{ define "extraHead" }}
<script>
  // 读取服务端注入的同意状态，作为 Consent Mode v2 的默认值
  // 若用户尚未做选择，全部 denied（符合 GDPR 默认拒绝原则）
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('consent', 'default', {
    ad_storage:              '{{ .ConsentAds }}',
    ad_user_data:            '{{ .ConsentAds }}',
    ad_personalization:      '{{ .ConsentAds }}',
    analytics_storage:       '{{ .ConsentAnalytics }}',
    functionality_storage:   'granted',
    security_storage:        'granted',
    wait_for_update:         500  // 等待 JS 端更新，单位 ms
  });
  gtag('js', new Date());
</script>

{{/* ── GA 脚本：仅在 GA 启用时加载 ── */}}
{{ if .GAEnabled }}
<script async src="https://www.googletagmanager.com/gtag/js?id={{ .GATrackingID }}"></script>
<script>
  gtag('config', '{{ .GATrackingID }}', {
    send_page_view: {{ if eq .ConsentAnalytics "granted" }}true{{ else }}false{{ end }}
  });
</script>
{{ end }}

{{/* ── AdSense SDK：仅在 Ads 启用时加载 ── */}}
{{ if .AdsEnabled }}
<script async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={{ .AdsClientID }}"
  crossorigin="anonymous"></script>
{{ end }}
{{ end }}
```

在 `</body>` 前插入 Cookie Banner partial：

```html
{{/* ── Cookie Consent Banner ── */}}
{{ template "partials/cookie-consent.html" . }}

{{/* ── Consent Engine JS ── */}}
<script src="/static/js/consent-engine.js"></script>
```

---

## 4. GAConfig 和 AdsConfig 中间件调整

在现有 `GAConfig` 中，将 GA 是否真正触发的控制权交给前端 Consent Engine，
后端只控制脚本是否加载：

```go
// middleware/ga_config.go - 保持不变，GAEnabled 仍然注入
// GA 脚本加载由 base.html 控制，实际数据发送由 Consent Mode v2 控制

// middleware/ads_config.go - 保持不变
// AdSense 脚本即使加载，也会被 Consent Mode 阻断数据收集
```

---

## 5. 广告位规则（复用现有规范）

Banner 本身**不包含广告位**，隐私政策页仅放底部一个广告位：

```html
{{/* 隐私政策页 - 底部横幅 */}}
{{- template "partials/ad_slot.html" dict
    "SlotID"   "privacy-bottom"
    "Size"     "728x90"
    "Mobile"   "320x50"
    "ClientID" .AdsClientID
    "Enabled"  .AdsEnabled }}
```

---

## 6. 全量 i18n Key

### i18n/en.json（新增部分）

```json
{
  "consent.banner.title": "We value your privacy",
  "consent.banner.desc": "We use cookies to enhance your browsing experience, analyze site traffic, and serve personalized ads. You can choose which cookies to allow.",
  "consent.banner.learnmore": "Learn more",
  "consent.banner.privacy_link": "/privacy",

  "consent.btn.accept_all": "Accept All",
  "consent.btn.reject_all": "Reject All",
  "consent.btn.customize": "Customize",
  "consent.btn.save": "Save My Preferences",
  "consent.btn.close": "Close",

  "consent.modal.title": "Cookie Preferences",
  "consent.modal.desc": "Choose which cookies you allow. Your preferences will be saved for 1 year.",

  "consent.category.necessary.name": "Necessary",
  "consent.category.necessary.desc": "Essential for the website to function. Cannot be disabled.",
  "consent.category.analytics.name": "Analytics",
  "consent.category.analytics.desc": "Help us understand how visitors interact with our site (Google Analytics).",
  "consent.category.ads.name": "Advertising",
  "consent.category.ads.desc": "Used to show you relevant ads and measure ad performance (Google Ads).",

  "consent.toast.saved": "Preferences saved",

  "privacy.seo.title": "Privacy Policy – ToolboxNova",
  "privacy.seo.description": "Learn how ToolboxNova collects, uses, and protects your data. GDPR and CCPA compliant.",

  "privacy.content.collect.title": "What We Collect",
  "privacy.content.collect.body": "We collect anonymized usage data through Google Analytics when you consent, including pages visited, time on site, and browser type. We do not collect personal identifiable information.",

  "privacy.content.use.title": "How We Use Your Data",
  "privacy.content.use.body": "Usage data is used solely to improve the website's content and performance. Advertising data is used to show relevant advertisements through Google Ads.",

  "privacy.content.cookies.title": "Cookies",
  "privacy.content.cookies.body": "We use first-party cookies (cky_consent) to remember your cookie preferences, and third-party cookies from Google Analytics and Google Ads when you consent.",

  "privacy.content.thirdparty.title": "Third-Party Services",
  "privacy.content.thirdparty.body": "We use Google Analytics (data processed by Google LLC) and Google Ads. Please refer to Google's Privacy Policy for details on how they handle your data.",

  "privacy.content.rights.title": "Your Rights",
  "privacy.content.rights.body": "Under GDPR, you have the right to access, rectify, or delete your data. Under CCPA, you have the right to opt out of the sale of personal information. You can change your cookie preferences at any time via the link in the footer.",

  "privacy.content.contact.title": "Contact",
  "privacy.content.contact.body": "For privacy-related inquiries, please contact us at privacy@toolboxnova.com.",

  "nav.privacy": "Privacy Policy"
}
```

### i18n/zh.json（新增部分）

```json
{
  "consent.banner.title": "我们重视您的隐私",
  "consent.banner.desc": "我们使用 Cookie 来提升浏览体验、分析网站流量并投放个性化广告。您可以选择允许哪些 Cookie。",
  "consent.banner.learnmore": "了解更多",
  "consent.banner.privacy_link": "/privacy?lang=zh",

  "consent.btn.accept_all": "全部接受",
  "consent.btn.reject_all": "全部拒绝",
  "consent.btn.customize": "自定义设置",
  "consent.btn.save": "保存我的偏好",
  "consent.btn.close": "关闭",

  "consent.modal.title": "Cookie 偏好设置",
  "consent.modal.desc": "选择您允许的 Cookie 类型，您的偏好将保存 1 年。",

  "consent.category.necessary.name": "必要",
  "consent.category.necessary.desc": "网站正常运行所必需，无法关闭。",
  "consent.category.analytics.name": "分析",
  "consent.category.analytics.desc": "帮助我们了解访客如何与网站互动（Google Analytics）。",
  "consent.category.ads.name": "广告",
  "consent.category.ads.desc": "用于展示相关广告并衡量广告效果（Google Ads）。",

  "consent.toast.saved": "偏好已保存",

  "privacy.seo.title": "隐私政策 – ToolboxNova",
  "privacy.seo.description": "了解 ToolboxNova 如何收集、使用和保护您的数据。符合 GDPR 和 CCPA 要求。",

  "privacy.content.collect.title": "我们收集的信息",
  "privacy.content.collect.body": "在您同意的前提下，我们通过 Google Analytics 收集匿名使用数据，包括访问页面、停留时间和浏览器类型。我们不收集任何个人身份信息。",

  "privacy.content.use.title": "数据用途",
  "privacy.content.use.body": "使用数据仅用于改善网站内容和性能。广告数据用于通过 Google Ads 展示相关广告。",

  "privacy.content.cookies.title": "Cookie 说明",
  "privacy.content.cookies.body": "我们使用第一方 Cookie（cky_consent）记录您的 Cookie 偏好，以及在您同意后使用来自 Google Analytics 和 Google Ads 的第三方 Cookie。",

  "privacy.content.thirdparty.title": "第三方服务",
  "privacy.content.thirdparty.body": "我们使用 Google Analytics（数据由 Google LLC 处理）和 Google Ads。有关 Google 如何处理您的数据，请参阅 Google 隐私政策。",

  "privacy.content.rights.title": "您的权利",
  "privacy.content.rights.body": "根据 GDPR，您有权访问、更正或删除您的数据。根据 CCPA，您有权拒绝出售个人信息。您可以随时通过页脚链接更改 Cookie 偏好。",

  "privacy.content.contact.title": "联系我们",
  "privacy.content.contact.body": "如有隐私相关问题，请联系 privacy@toolboxnova.com。",

  "nav.privacy": "隐私政策"
}
```

---

## 7. Header 导航新增

```html
<!-- partials/header.html - 在 Footer 链接区域新增 -->
<li class="nav-item">
  <a href="/privacy{{ if eq .Lang "zh" }}?lang=zh{{ end }}" class="nav-link nav-link--secondary">
    {{ t "nav.privacy" }}
  </a>
</li>
```

Footer 新增"管理 Cookie 偏好"链接：

```html
<!-- partials/footer.html -->
<a href="javascript:void(0)" id="cky-reopen-btn" class="footer-link">
  {{ t "consent.btn.customize" }}
</a>
```

---

## 8. sitemap 新增条目

```xml
<url>
  <loc>https://toolboxnova.com/privacy</loc>
  <lastmod>2024-07-15</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.4</priority>
</url>
```
