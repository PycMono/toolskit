# Block S-01 · SMS 接码器 — 全站路由 / SEO / i18n / Ads / sitemap

> **所属模块**：SMS 接码器（全站）  
> **竞品参考**：https://5sim.net  
> **预估工时**：2h  
> **依赖**：无  
> **交付粒度**：注册所有路由、补全所有 i18n Key、sitemap、广告位配置

---

## 1. 路由注册

```go
// internal/router/router.go

sms := r.Group("/sms")
sms.Use(middleware.I18n(), middleware.AdsConfig())

// 公开页面
sms.GET("",          handler.SMSLandingPage)
sms.GET("/buy",      handler.SMSBuyPage)
sms.GET("/prices",   handler.SMSPricesPage)
sms.GET("/login",    handler.SMSLoginPage)
sms.GET("/register", handler.SMSRegisterPage)

// 需要登录
smsAuth := sms.Group("")
smsAuth.Use(middleware.JWTRequired())
smsAuth.GET("/active",  handler.SMSActivePage)
smsAuth.GET("/history", handler.SMSHistoryPage)
smsAuth.GET("/account", handler.SMSAccountPage)

// API 代理层（S-10 实现）
smsAPI := r.Group("/api/sms")
smsAPI.Use(middleware.RateLimit(100, time.Minute))
smsAPI.GET("/products",           handler.SMSGetProducts)
smsAPI.GET("/countries",          handler.SMSGetCountries)
smsAPI.GET("/operators",          handler.SMSGetOperators)
smsAPI.POST("/buy",               middleware.JWTRequired(), handler.SMSBuyNumber)
smsAPI.GET("/order/:id",          middleware.JWTRequired(), handler.SMSGetOrder)
smsAPI.POST("/order/:id/cancel",  middleware.JWTRequired(), handler.SMSCancelOrder)
smsAPI.POST("/order/:id/finish",  middleware.JWTRequired(), handler.SMSFinishOrder)
smsAPI.POST("/order/:id/rebuy",   middleware.JWTRequired(), handler.SMSRebuyNumber)
smsAPI.GET("/orders/active",      middleware.JWTRequired(), handler.SMSGetActiveOrders)
smsAPI.GET("/orders/history",     middleware.JWTRequired(), handler.SMSGetOrderHistory)
smsAPI.GET("/prices",             handler.SMSGetPrices)
smsAPI.GET("/stats",              handler.SMSGetStats)

// WebSocket（S-11 实现）
r.GET("/ws/sms/:orderId", middleware.JWTRequired(), handler.SMSWebSocket)
```

---

## 2. 各页面 SEO Meta

```go
// internal/handler/sms_pages.go
var smsSEOMeta = map[string]map[string]string{
    "landing": {
        "title_zh": "SMS 接码器 — 虚拟手机号码在线接收验证码 | DevToolBox",
        "desc_zh":  "免注册真实手机，在线接收 SMS 验证码，支持 180+ 国家、700+ 平台，低至 ¥0.1/条，即时收码，完全匿名。",
        "title_en": "SMS Receiver — Virtual Phone Numbers for Online Verification | DevToolBox",
        "desc_en":  "Receive SMS verification codes online with virtual phone numbers. 180+ countries, 700+ services (WhatsApp, Telegram, Gmail...). From $0.01. Instant delivery.",
    },
    "buy": {
        "title_zh": "购买虚拟号码接收短信 — 在线接码 | DevToolBox",
        "desc_zh":  "选择服务、国家和运营商，立即获取虚拟手机号并自动接收验证码。支持微信、QQ、抖音、Telegram 等 700+ 平台。",
        "title_en": "Buy Virtual Number & Receive SMS Online | DevToolBox",
        "desc_en":  "Select a service, country and operator to get a virtual phone number instantly. Receive SMS verification codes for 700+ platforms including WhatsApp, Telegram, Google.",
    },
    "prices": {
        "title_zh": "虚拟号码价格表 — 各平台接码费用 | DevToolBox",
        "desc_zh":  "查看 700+ 平台、180+ 国家的虚拟号码实时价格和短信接收成功率，选择性价比最高的接码方案。",
        "title_en": "Virtual Number Prices — SMS Verification Cost by Service | DevToolBox",
        "desc_en":  "Compare virtual number prices and SMS delivery success rates for 700+ services across 180+ countries. Find the best value for your SMS verification needs.",
    },
}
```

```html
<!-- templates/sms/layout.html — <head> 通用模板 -->

<title>{{ .Title }}</title>
<meta name="description" content="{{ .Desc }}">
<meta name="keywords"    content="{{ .Keywords }}">

<meta property="og:title"       content="{{ .Title }}">
<meta property="og:description" content="{{ .Desc }}">
<meta property="og:type"        content="website">
<meta property="og:url"         content="https://devtoolbox.dev{{ .Path }}">
<meta property="og:image"       content="https://devtoolbox.dev/static/og/sms.png">

<link rel="canonical"  href="https://devtoolbox.dev{{ .Path }}">
<link rel="alternate"  hreflang="en"        href="https://devtoolbox.dev{{ .Path }}?lang=en">
<link rel="alternate"  hreflang="zh"        href="https://devtoolbox.dev{{ .Path }}?lang=zh">
<link rel="alternate"  hreflang="x-default" href="https://devtoolbox.dev{{ .Path }}">

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "SMS Receiver",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "Web",
  "offers": { "@type": "Offer", "price": "0.01", "priceCurrency": "USD" },
  "description": "Virtual phone numbers for SMS verification. 180+ countries, 700+ services.",
  "url": "https://devtoolbox.dev/sms"
}
</script>
```

---

## 3. 广告位插槽

```html
<!-- templates/sms/layout.html — 广告位（仅非登录页、非支付页显示） -->

<!-- 顶部横幅 -->
{{- template "partials/ad_slot.html" dict "SlotID" "sms-top" "Size" "728x90" "Mobile" "320x50" }}

<!-- 服务选择器右侧（桌面端） -->
{{- template "partials/ad_slot.html" dict "SlotID" "sms-sidebar" "Size" "300x250" "MobileHide" true }}

<!-- 等待 SMS 时（订单面板下方） -->
{{- template "partials/ad_slot.html" dict "SlotID" "sms-waiting" "Size" "300x250" }}

<!-- 底部 -->
{{- template "partials/ad_slot.html" dict "SlotID" "sms-bottom" "Size" "728x90" "Mobile" "320x50" }}
```

---

## 4. 完整 i18n Key

### locales/zh.json

```json
{
  "sms.name":  "SMS 接码器",
  "sms.title": "在线 SMS 接码 & 虚拟号码",
  "sms.desc":  "在线接收 SMS 验证码，支持 180+ 国家、700+ 平台",

  "sms.seo.landing.title": "SMS 接码器 — 虚拟手机号码在线接收验证码 | DevToolBox",
  "sms.seo.landing.desc":  "免注册真实手机，在线接收 SMS 验证码，支持 180+ 国家、700+ 平台，低至 ¥0.1/条。",
  "sms.seo.buy.title":     "购买虚拟号码接收短信 | DevToolBox",
  "sms.seo.buy.desc":      "选择服务、国家和运营商，立即获取虚拟手机号并自动接收验证码。",
  "sms.seo.prices.title":  "虚拟号码价格表 | DevToolBox",
  "sms.seo.prices.desc":   "查看 700+ 平台、180+ 国家的实时价格和短信接收成功率。",

  "sms.hero.title":    "在线 SMS 接码器",
  "sms.hero.subtitle": "无需真实 SIM 卡，即时获取全球虚拟号码接收验证码",
  "sms.hero.badge1":   "180+ 国家",
  "sms.hero.badge2":   "700+ 平台",
  "sms.hero.badge3":   "秒级到达",
  "sms.hero.cta_btn":  "立即获取号码",

  "sms.stats.services":    "支持平台",
  "sms.stats.countries":   "覆盖国家",
  "sms.stats.deliveries":  "成功接码",
  "sms.stats.uptime":      "在线时间",

  "sms.nav.buy":     "购买号码",
  "sms.nav.active":  "活跃订单",
  "sms.nav.history": "历史订单",
  "sms.nav.prices":  "价格",
  "sms.nav.account": "账户",
  "sms.nav.login":   "登录",
  "sms.nav.register":"注册",

  "sms.search.placeholder": "搜索平台（微信、Telegram、Google...）",
  "sms.search.no_result":   "未找到相关平台",
  "sms.search.popular":     "热门平台",

  "sms.service.label":   "选择平台",
  "sms.country.label":   "选择国家",
  "sms.operator.label":  "选择运营商",
  "sms.operator.any":    "任意运营商",
  "sms.price.label":     "价格",
  "sms.stock.label":     "库存",
  "sms.rate.label":      "成功率",
  "sms.stock.out":       "暂无号码",

  "sms.buy.btn":      "🛒 购买号码",
  "sms.buy.buying":   "获取中...",
  "sms.buy.no_stock": "暂无可用号码",
  "sms.buy.balance_low": "余额不足，请先充值",

  "sms.order.number":     "虚拟号码",
  "sms.order.copy":       "复制",
  "sms.order.copied":     "已复制 ✓",
  "sms.order.expires_in": "剩余 {time}",
  "sms.order.expired":    "已超时",
  "sms.order.waiting":    "等待接收验证码...",
  "sms.order.received":   "✅ 已收到验证码",
  "sms.order.timeout":    "⏱ 等待超时",
  "sms.order.cancelled":  "已取消",

  "sms.otp.label":   "验证码",
  "sms.otp.copy":    "复制验证码",
  "sms.otp.copied":  "已复制",

  "sms.btn.cancel":  "❌ 取消",
  "sms.btn.finish":  "✅ 完成",
  "sms.btn.rebuy":   "🔄 换号重试",
  "sms.btn.another": "再次购买",

  "sms.balance.label":   "我的余额",
  "sms.balance.topup":   "充值",
  "sms.balance.unit":    "元",

  "sms.history.title":             "历史订单",
  "sms.history.status.all":        "全部",
  "sms.history.status.received":   "已接收",
  "sms.history.status.cancelled":  "已取消",
  "sms.history.status.timeout":    "已超时",
  "sms.history.empty":             "暂无订单记录",
  "sms.history.export_csv":        "导出 CSV",

  "sms.prices.title":       "价格 & 成功率",
  "sms.prices.success_rate":"成功率",
  "sms.prices.available":   "可用数量",
  "sms.prices.filter_all":  "全部平台",

  "sms.active.title":   "活跃订单",
  "sms.active.empty":   "暂无活跃订单",
  "sms.active.goto_buy":"去购买号码 →",

  "sms.error.insufficient_balance": "余额不足，请充值后重试",
  "sms.error.no_numbers":           "当前暂无可用号码，请换个运营商试试",
  "sms.error.network_error":        "网络错误，请刷新重试",
  "sms.error.order_expired":        "订单已超时，费用将自动退回",
  "sms.error.already_used":         "该号码已被使用，请重新购买",

  "sms.faq.title": "常见问题",

  "sms.login.title":         "登录",
  "sms.login.email":         "邮箱",
  "sms.login.password":      "密码",
  "sms.login.btn":           "登录",
  "sms.login.google":        "使用 Google 登录",
  "sms.login.no_account":    "没有账号？立即注册",
  "sms.login.forgot":        "忘记密码",

  "sms.register.title":      "注册",
  "sms.register.email":      "邮箱",
  "sms.register.password":   "密码",
  "sms.register.confirm_pwd":"确认密码",
  "sms.register.btn":        "注册",
  "sms.register.google":     "使用 Google 注册",
  "sms.register.has_account":"已有账号？去登录",

  "sms.account.title":       "账户设置",
  "sms.account.api_key":     "API Key",
  "sms.account.api_key_copy":"复制",
  "sms.account.api_key_regen":"重新生成",
  "sms.account.topup.title": "充值余额",
  "sms.account.topup.amount":"充值金额",
  "sms.account.topup.alipay":"支付宝",
  "sms.account.topup.wechat":"微信支付",
  "sms.account.topup.usdt":  "USDT"
}
```

### locales/en.json

```json
{
  "sms.name":  "SMS Receiver",
  "sms.title": "Online SMS Receiver & Virtual Numbers",
  "sms.desc":  "Receive SMS verification codes online. 180+ countries, 700+ services.",

  "sms.seo.landing.title": "SMS Receiver — Virtual Phone Numbers for Online Verification | DevToolBox",
  "sms.seo.landing.desc":  "Receive SMS online with virtual numbers. 180+ countries, 700+ services (WhatsApp, Telegram, Google...). From $0.01. Instant delivery.",
  "sms.seo.buy.title":     "Buy Virtual Number & Receive SMS | DevToolBox",
  "sms.seo.buy.desc":      "Get a virtual phone number instantly. Receive SMS verification codes for WhatsApp, Telegram, Google and 700+ more services.",
  "sms.seo.prices.title":  "Virtual Number Prices | DevToolBox",
  "sms.seo.prices.desc":   "Compare SMS verification prices and success rates for 700+ services across 180+ countries.",

  "sms.hero.title":    "Online SMS Receiver",
  "sms.hero.subtitle": "Get virtual phone numbers instantly. Receive SMS verification codes without a real SIM card.",
  "sms.hero.badge1":   "180+ Countries",
  "sms.hero.badge2":   "700+ Services",
  "sms.hero.badge3":   "Instant Delivery",
  "sms.hero.cta_btn":  "Get a Number Now",

  "sms.stats.services":    "Services",
  "sms.stats.countries":   "Countries",
  "sms.stats.deliveries":  "SMS Delivered",
  "sms.stats.uptime":      "Uptime",

  "sms.nav.buy":     "Buy Number",
  "sms.nav.active":  "Active Orders",
  "sms.nav.history": "Order History",
  "sms.nav.prices":  "Prices",
  "sms.nav.account": "Account",
  "sms.nav.login":   "Login",
  "sms.nav.register":"Sign Up",

  "sms.search.placeholder": "Search service (WhatsApp, Telegram, Google...)",
  "sms.search.no_result":   "No services found",
  "sms.search.popular":     "Popular Services",

  "sms.service.label":   "Select Service",
  "sms.country.label":   "Select Country",
  "sms.operator.label":  "Select Operator",
  "sms.operator.any":    "Any Operator",
  "sms.price.label":     "Price",
  "sms.stock.label":     "Available",
  "sms.rate.label":      "Success Rate",
  "sms.stock.out":       "Out of stock",

  "sms.buy.btn":          "🛒 Buy Number",
  "sms.buy.buying":       "Getting number...",
  "sms.buy.no_stock":     "No numbers available",
  "sms.buy.balance_low":  "Insufficient balance. Please top up first.",

  "sms.order.number":     "Virtual Number",
  "sms.order.copy":       "Copy",
  "sms.order.copied":     "Copied ✓",
  "sms.order.expires_in": "{time} remaining",
  "sms.order.expired":    "Expired",
  "sms.order.waiting":    "Waiting for SMS...",
  "sms.order.received":   "✅ SMS Received",
  "sms.order.timeout":    "⏱ Timed Out",
  "sms.order.cancelled":  "Cancelled",

  "sms.otp.label":   "Verification Code",
  "sms.otp.copy":    "Copy Code",
  "sms.otp.copied":  "Copied",

  "sms.btn.cancel":  "❌ Cancel",
  "sms.btn.finish":  "✅ Done",
  "sms.btn.rebuy":   "🔄 Try Another",
  "sms.btn.another": "Buy Again",

  "sms.balance.label":   "My Balance",
  "sms.balance.topup":   "Top Up",
  "sms.balance.unit":    "$",

  "sms.history.title":             "Order History",
  "sms.history.status.all":        "All",
  "sms.history.status.received":   "Received",
  "sms.history.status.cancelled":  "Cancelled",
  "sms.history.status.timeout":    "Timed Out",
  "sms.history.empty":             "No orders yet",
  "sms.history.export_csv":        "Export CSV",

  "sms.prices.title":        "Prices & Success Rates",
  "sms.prices.success_rate": "Success Rate",
  "sms.prices.available":    "Available",
  "sms.prices.filter_all":   "All Services",

  "sms.active.title":   "Active Orders",
  "sms.active.empty":   "No active orders",
  "sms.active.goto_buy":"Buy a number →",

  "sms.error.insufficient_balance": "Insufficient balance. Please top up.",
  "sms.error.no_numbers":           "No numbers available. Try a different operator.",
  "sms.error.network_error":        "Network error. Please refresh and try again.",
  "sms.error.order_expired":        "Order expired. Your balance has been refunded.",
  "sms.error.already_used":         "Number already used. Please buy a new one.",

  "sms.faq.title": "Frequently Asked Questions",

  "sms.login.title":         "Log In",
  "sms.login.email":         "Email",
  "sms.login.password":      "Password",
  "sms.login.btn":           "Log In",
  "sms.login.google":        "Continue with Google",
  "sms.login.no_account":    "No account? Sign up",
  "sms.login.forgot":        "Forgot password",

  "sms.register.title":      "Create Account",
  "sms.register.email":      "Email",
  "sms.register.password":   "Password",
  "sms.register.confirm_pwd":"Confirm Password",
  "sms.register.btn":        "Create Account",
  "sms.register.google":     "Continue with Google",
  "sms.register.has_account":"Already have an account? Log in",

  "sms.account.title":        "Account Settings",
  "sms.account.api_key":      "API Key",
  "sms.account.api_key_copy": "Copy",
  "sms.account.api_key_regen":"Regenerate",
  "sms.account.topup.title":  "Add Balance",
  "sms.account.topup.amount": "Amount",
  "sms.account.topup.alipay": "Alipay",
  "sms.account.topup.wechat": "WeChat Pay",
  "sms.account.topup.usdt":   "USDT"
}
```

---

## 5. sitemap.xml

```xml
<url>
  <loc>https://devtoolbox.dev/sms</loc>
  <lastmod>2026-03-12</lastmod>
  <changefreq>daily</changefreq>
  <priority>0.9</priority>
</url>
<url>
  <loc>https://devtoolbox.dev/sms/buy</loc>
  <lastmod>2026-03-12</lastmod>
  <changefreq>daily</changefreq>
  <priority>0.9</priority>
</url>
<url>
  <loc>https://devtoolbox.dev/sms/prices</loc>
  <lastmod>2026-03-12</lastmod>
  <changefreq>daily</changefreq>
  <priority>0.8</priority>
</url>
<url>
  <loc>https://devtoolbox.dev/sms?lang=en</loc>
  <priority>0.85</priority>
</url>
<url>
  <loc>https://devtoolbox.dev/sms?lang=zh</loc>
  <priority>0.85</priority>
</url>
```

---

## 6. 验收标准

- [ ] 所有 `/sms/*` 路由正常 200，无 404
- [ ] 未登录访问 `/sms/active`、`/sms/account` 自动跳转 `/sms/login`
- [ ] 所有页面 `<title>` 显示翻译文字，无原始 key
- [ ] canonical + hreflang + JSON-LD 正确输出
- [ ] sitemap.xml 包含所有 SMS 路由
- [ ] 广告位在 `ads.enabled=false` 时显示占位框
