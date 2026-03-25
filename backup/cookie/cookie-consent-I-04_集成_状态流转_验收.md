# cookie-consent-I-04_集成_状态流转_验收.md

---

## 1. 与现有中间件的完整集成

### 中间件执行顺序（关键）

```go
// router.go 或 main.go

r := gin.Default()

// 顺序非常重要：
// 1. I18n 先于其他，确保语言变量可用
r.Use(middleware.I18nMiddleware())

// 2. Consent 读取 Cookie，注入 ConsentAnalytics / ConsentAds
r.Use(middleware.ConsentMiddleware(middleware.ConsentConfig{
    CookieName:   cfg.ConsentCookieName,
    CookieMaxAge: 365 * 24 * 3600,
    Domain:       cfg.Domain,
}))

// 3. AdsConfig 依赖 Consent 状态（未来可扩展：服务端屏蔽 Ads 槽位）
r.Use(middleware.AdsConfig(cfg))

// 4. GAConfig 同上
r.Use(middleware.GAConfig(cfg))
```

### config.go 新增字段

```go
type Config struct {
    // 现有字段...
    GAEnabled       bool   `mapstructure:"ga_enabled"`
    GATrackingID    string `mapstructure:"ga_tracking_id"`
    AdsEnabled      bool   `mapstructure:"ads_enabled"`
    AdsClientID     string `mapstructure:"ads_client_id"`

    // 新增
    ConsentCookieName string `mapstructure:"consent_cookie_name"` // 默认 "cky_consent"
    Domain            string `mapstructure:"domain"`               // "toolboxnova.com"
}
```

### config.yaml 新增

```yaml
consent_cookie_name: "cky_consent"
domain: "toolboxnova.com"
```

---

## 2. base.html 完整修改清单

```html
<!DOCTYPE html>
<html lang="{{ .Lang }}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  {{/* ① Consent Mode v2 默认值 —— 必须是第一个 script，其他脚本之前 */}}
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('consent', 'default', {
      ad_storage:            '{{ .ConsentAds }}',
      ad_user_data:          '{{ .ConsentAds }}',
      ad_personalization:    '{{ .ConsentAds }}',
      analytics_storage:     '{{ .ConsentAnalytics }}',
      functionality_storage: 'granted',
      security_storage:      'granted',
      wait_for_update:       500
    });
    gtag('js', new Date());
  </script>

  {{/* ② GA 脚本（GAEnabled 控制加载，Consent Mode 控制数据发送）*/}}
  {{ if .GAEnabled }}
  <script async src="https://www.googletagmanager.com/gtag/js?id={{ .GATrackingID }}"></script>
  <script>
    gtag('config', '{{ .GATrackingID }}', {
      send_page_view: {{ if eq .ConsentAnalytics "granted" }}true{{ else }}false{{ end }}
    });
  </script>
  {{ end }}

  {{/* ③ AdSense SDK */}}
  {{ if .AdsEnabled }}
  <script async
    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={{ .AdsClientID }}"
    crossorigin="anonymous"></script>
  {{ end }}

  {{/* ④ Consent CSS */}}
  <link rel="stylesheet" href="/static/css/consent.css">

  {{/* ⑤ 子页面 extraHead Block */}}
  {{ block "extraHead" . }}{{ end }}

  <!-- 其余 head 内容（title, meta, etc.）-->
</head>
<body>

  {{ template "partials/header.html" . }}

  {{ block "content" . }}{{ end }}

  {{ template "partials/footer.html" . }}

  {{/* ⑥ Cookie Banner & Modal */}}
  {{ template "partials/cookie-consent.html" . }}

  {{/* ⑦ GA Events 工具库 */}}
  <script src="/static/js/ga-events.js"></script>

  {{/* ⑧ Consent Engine（必须在 banner partial 之后）*/}}
  <script src="/static/js/consent-engine.js"></script>

  {{ block "extraScript" . }}{{ end }}
</body>
</html>
```

---

## 3. 状态流转图

```
              ┌─────────────────────────────────────────────────────┐
              │                   用户状态机                          │
              └─────────────────────────────────────────────────────┘

  ┌──────────┐    首次访问       ┌──────────────────┐
  │          │ ──────────────► │   Banner 显示     │
  │  无 Cookie│                 │  (ConsentHasDecision│
  │          │                 │      = false)     │
  └──────────┘                 └────────┬─────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
                    ▼                    ▼                    ▼
             [接受全部]           [自定义设置]           [拒绝全部]
                    │                    │                    │
                    │              [Modal 弹出]               │
                    │              [修改 Toggle]              │
                    │              [保存偏好]                  │
                    │                    │                    │
                    └────────────────────┼────────────────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │  applyConsent()       │
                              │  ─ 写 Cookie（1年）   │
                              │  ─ updateConsentMode  │
                              │  ─ loadGA（条件）     │
                              │  ─ hideBanner         │
                              │  ─ showToast          │
                              └──────────┬───────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │   已有同意记录状态    │
                              │  ConsentHasDecision   │
                              │       = true          │
                              └──────────┬───────────┘
                                         │
                              ┌──────────┼──────────┐
                              │                     │
                    [用户再次访问]            [用户点击"管理偏好"]
                              │                     │
                              ▼                     ▼
                    Go 中间件读 Cookie        Footer 按钮
                    注入 ConsentAnalytics    openModal()
                    Banner 不显示（hidden）  可修改后重新保存
                    GA/Ads 按状态初始化
```

---

## 4. 文件目录结构

```
项目根目录
├── middleware/
│   ├── consent.go          ← 新增
│   ├── ga_config.go        ← 已有，无需修改
│   └── ads_config.go       ← 已有，无需修改
│
├── handler/
│   └── privacy.go          ← 新增
│
├── templates/
│   ├── base.html           ← 修改：注入 Consent Mode v2 + 引入 partial
│   ├── privacy.html        ← 新增
│   └── partials/
│       ├── cookie-consent.html  ← 新增
│       ├── header.html          ← 修改：Footer 链接新增"管理偏好"
│       └── footer.html          ← 修改：新增 #cky-reopen-btn 和 /privacy 链接
│
├── static/
│   ├── css/
│   │   └── consent.css     ← 新增
│   └── js/
│       ├── consent-engine.js  ← 新增
│       └── ga-events.js       ← 已有，无需修改
│
├── i18n/
│   ├── en.json             ← 新增 consent.* 和 privacy.* 键
│   └── zh.json             ← 新增 consent.* 和 privacy.* 键
│
└── config.yaml             ← 新增 consent_cookie_name, domain
```

---

## 5. Google Search Console / Ads 验证清单

接入完成后，需在 Google 平台验证 Consent Mode v2 工作正常：

| 验证项 | 工具 | 预期结果 |
|---|---|---|
| Consent Mode v2 已启用 | Google Tag Assistant | 显示 "Consent Mode v2 detected" |
| 未同意时无 GA 请求 | Chrome DevTools Network | 过滤 `google-analytics`，无请求 |
| 同意后 GA 请求正常 | Chrome DevTools Network | 看到 `collect` 请求 |
| Cookie 写入正确 | Chrome DevTools Application > Cookies | `cky_consent=necessary:granted,...` |
| Ads 再营销功能 | Google Ads → 受众群体 | 欧洲用户数据正常回传 |

---

## 6. 完整验收标准 Checklist

### 中间件集成
- [ ] `ConsentMiddleware` 在 `AdsConfig` 和 `GAConfig` 之前执行
- [ ] 有效 Cookie 时 `ConsentHasDecision = true`，`ConsentAnalytics`/`ConsentAds` 正确解析
- [ ] 无 Cookie 时三个变量默认值为 `false` / `denied` / `denied`
- [ ] Cookie 格式 `necessary:granted,analytics:xxx,ads:xxx` 正确解析

### 页面渲染
- [ ] `base.html` 中 Consent Mode v2 `<script>` 是第一个脚本
- [ ] 已同意用户：Banner 不显示（`display:none`）
- [ ] 未同意用户：Banner 显示，GA 脚本不在 `<head>` 中（由 JS 动态加载）
- [ ] `window.CKY_CONFIG` 包含正确的服务端状态

### 功能流程
- [ ] 接受全部 → Cookie 写入 → GA 动态加载 → Consent Mode 更新 → Banner 消失 → Toast 显示
- [ ] 拒绝全部 → Cookie 写入 → GA 不加载 → Banner 消失 → Toast 显示
- [ ] 自定义保存 → Toggle 状态正确写入 Cookie
- [ ] Footer "管理偏好" → Banner 重现 + Modal 打开 → 可修改 → 保存生效

### 合规性
- [ ] 接受前：DevTools Network 中无任何 `google-analytics` / `doubleclick` 请求
- [ ] Cookie 设置有 `path=/` 和 `SameSite=Lax`
- [ ] 拒绝按钮与接受按钮视觉上同等易用（GDPR 要求）
- [ ] 隐私政策页可访问，内容完整
- [ ] 用户可随时通过 Footer 修改偏好

### 性能
- [ ] consent-engine.js 体积 < 8KB（gzip 后 < 3KB）
- [ ] Banner 首次渲染无 CLS（Cumulative Layout Shift）
- [ ] consent.css 不阻塞首屏渲染（可改为异步加载）
