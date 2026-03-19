# Block QR-01 · 二维码生成工具 — 路由 / SEO / i18n / 广告位 / sitemap

> **预估工时**：1.5h  
> **依赖**：无  
> **路由前缀**：`/media/qr`

---

## 1. Go 路由注册

```go
// internal/router/router.go

media := r.Group("/media")
media.Use(middleware.I18n(), middleware.AdsConfig())

// 二维码生成工具（纯前端，一个页面搞定）
media.GET("/qr", handler.QRPage)

// 后端 API：SVG → EPS 转换（唯一需要后端的功能）
media.POST("/qr/api/eps", handler.QREpsDownload)
```

---

## 2. 页面 Handler

```go
// internal/handler/qr.go
package handler

func QRPage(c *gin.Context) {
    lang := c.GetString("lang")

    seoTitle := map[string]string{
        "zh": "二维码生成器 — 免费在线生成 QR 码 | DevToolBox",
        "en": "QR Code Generator — Create Free QR Codes Online | DevToolBox",
    }
    seoDesc := map[string]string{
        "zh": "免费在线二维码生成器，支持 URL、名片、WiFi、短信、邮件、比特币等 8 种类型，自定义颜色、形状、Logo，下载 PNG/SVG/JPG/EPS。",
        "en": "Free online QR code generator. Create QR codes for URLs, vCards, WiFi, SMS, Email, Bitcoin and more. Custom colors, shapes, logos. Download PNG, SVG, JPG, EPS.",
    }

    // 默认类型（从 query 参数读取）
    qrType := c.DefaultQuery("type", "url")
    validTypes := map[string]bool{
        "url": true, "vcard": true, "text": true, "sms": true,
        "email": true, "wifi": true, "twitter": true, "bitcoin": true,
    }
    if !validTypes[qrType] {
        qrType = "url"
    }

    c.HTML(200, "media/qr.html", gin.H{
        "Lang":        lang,
        "Title":       seoTitle[lang],
        "Desc":        seoDesc[lang],
        "Path":        "/media/qr",
        "CurrentType": qrType,
        "FAQs":        getQRFAQs(lang),
    })
}

// EPS 下载后端接口
func QREpsDownload(c *gin.Context) {
    var req struct {
        SVG string `json:"svg"` // 前端传入 SVG 字符串
    }
    if err := c.ShouldBindJSON(&req); err != nil || req.SVG == "" {
        c.JSON(400, gin.H{"error": "invalid svg"})
        return
    }

    // SVG → EPS（简单封装，使用 inkscape 或纯文本转换）
    eps, err := convertSVGToEPS(req.SVG)
    if err != nil {
        c.JSON(500, gin.H{"error": "conversion failed"})
        return
    }

    c.Header("Content-Disposition", `attachment; filename="qrcode.eps"`)
    c.Header("Content-Type", "application/postscript")
    c.String(200, eps)
}

type QRFAQ struct{ Q, A string }

func getQRFAQs(lang string) []QRFAQ {
    if lang == "en" {
        return []QRFAQ{
            {Q: "Are the generated QR codes free?",
             A: "Yes, all QR codes generated on this tool are completely free. You can use them for personal or commercial purposes without any restrictions."},
            {Q: "Do the QR codes expire?",
             A: "No. Static QR codes never expire. As long as the destination content (e.g., the URL) remains valid, the QR code will keep working forever."},
            {Q: "Can I add my logo to the QR code?",
             A: "Yes! You can upload any image as a logo to embed in the center of your QR code. We recommend using high error correction level (Q or H) when adding logos."},
            {Q: "What image formats can I download?",
             A: "You can download in PNG (high-resolution 2048px), SVG (vector, infinite scale), JPG, and EPS (for professional printing)."},
            {Q: "What is the difference between QR code types?",
             A: "Different types encode different data: URL opens a website, vCard saves contact info, WiFi connects to a network, SMS sends a text, Email drafts a message, Bitcoin handles crypto payments, etc."},
            {Q: "How do I scan a QR code?",
             A: "On iOS and most Android devices, just open the camera app and point it at the QR code. A notification will appear to open the link or action. No app needed."},
        }
    }
    return []QRFAQ{
        {Q: "生成的二维码免费吗？",
         A: "是的，本工具生成的所有二维码完全免费，可用于个人或商业用途，无任何限制。"},
        {Q: "二维码会过期吗？",
         A: "不会。静态二维码永久有效，只要目标内容（如网址）依然可访问，二维码就会一直有效。"},
        {Q: "可以在二维码中加入 Logo 吗？",
         A: "可以！你可以上传任意图片作为 Logo 嵌入到二维码中央。添加 Logo 时建议使用较高的纠错级别（Q 或 H）。"},
        {Q: "可以下载哪些格式？",
         A: "支持下载 PNG（高清 2048px）、SVG（矢量图，无限缩放）、JPG 以及 EPS（专业印刷用）。"},
        {Q: "各种类型的二维码有什么区别？",
         A: "不同类型编码不同内容：URL 打开网站、vCard 保存联系人、WiFi 自动连接网络、短信预设文字、邮件预填内容、比特币用于加密货币支付等。"},
        {Q: "如何扫描二维码？",
         A: "在 iOS 和大多数 Android 设备上，只需打开相机 App 对准二维码即可。无需安装专门的扫码 App。"},
    }
}
```

---

## 3. EPS 转换实现（Go）

```go
// internal/handler/qr_eps.go
package handler

import (
    "fmt"
    "strings"
    "regexp"
)

// convertSVGToEPS：将 SVG 字符串转换为 EPS 格式
// 简化实现：黑白 EPS（符合竞品行为）
func convertSVGToEPS(svgStr string) (string, error) {
    // 提取 SVG 宽高
    widthRe  := regexp.MustCompile(`width="(\d+)"`)
    heightRe := regexp.MustCompile(`height="(\d+)"`)

    wMatch := widthRe.FindStringSubmatch(svgStr)
    hMatch := heightRe.FindStringSubmatch(svgStr)

    width  := "500"
    height := "500"
    if len(wMatch) > 1 { width  = wMatch[1] }
    if len(hMatch) > 1 { height = hMatch[1] }

    // EPS Header
    eps := fmt.Sprintf(`%%!PS-Adobe-3.0 EPSF-3.0
%%%%BoundingBox: 0 0 %s %s
%%%%HiResBoundingBox: 0 0 %s %s
%%%%EndComments
%%%%BeginProlog
/inch {72 mul} def
%%%%EndProlog
%%%%Page: 1 1
gsave
%% SVG content embedded as PostScript path approximation
%% For production use, integrate inkscape/cairo SVG-to-EPS conversion
%s
grestore
%%%%EOF`, width, height, width, height, svgToPS(svgStr))

    return eps, nil
}

// svgToPS：提取 SVG 中的 rect 元素转为 PostScript 路径
// 生产环境建议调用 inkscape --export-eps 或 cairo
func svgToPS(svgStr string) string {
    var sb strings.Builder

    // 简单提取矩形（QR 码点阵）
    rectRe := regexp.MustCompile(`<rect[^>]+x="([^"]+)"[^>]+y="([^"]+)"[^>]+width="([^"]+)"[^>]+height="([^"]+)"`)
    matches := rectRe.FindAllStringSubmatch(svgStr, -1)

    sb.WriteString("0 0 0 setrgbcolor\n")
    for _, m := range matches {
        if len(m) < 5 { continue }
        sb.WriteString(fmt.Sprintf(
            "newpath %s %s moveto %s 0 rlineto 0 %s rlineto -%s 0 rlineto closepath fill\n",
            m[1], m[2], m[3], m[4], m[3],
        ))
    }

    return sb.String()
}
```

> **生产环境建议**：在服务器安装 Inkscape，调用 `inkscape --export-eps` 进行高质量转换，或使用 `github.com/srwiley/oksvg` + `rasterx` 自定义栅格化。

---

## 4. SEO `<head>` 模板

```html
<!-- templates/media/qr.html — <head> -->

<title>{{ .Title }}</title>
<meta name="description" content="{{ .Desc }}">
<meta name="keywords" content="二维码生成器,QR码生成,在线二维码,免费二维码,自定义二维码,URL二维码,WiFi二维码,名片二维码">

<meta property="og:title"       content="{{ .Title }}">
<meta property="og:description" content="{{ .Desc }}">
<meta property="og:type"        content="website">
<meta property="og:url"         content="https://devtoolbox.dev/media/qr">
<meta property="og:image"       content="https://devtoolbox.dev/static/og/media-qr.png">

<link rel="canonical" href="https://devtoolbox.dev/media/qr">
<link rel="alternate" hreflang="zh" href="https://devtoolbox.dev/media/qr?lang=zh">
<link rel="alternate" hreflang="en" href="https://devtoolbox.dev/media/qr?lang=en">

<!-- JSON-LD：SoftwareApplication -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "{{ .Title }}",
  "applicationCategory": "MultimediaApplication",
  "operatingSystem": "Web Browser",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "description": "{{ .Desc }}",
  "url": "https://devtoolbox.dev/media/qr",
  "featureList": [
    "Generate URL QR codes",
    "Generate vCard QR codes",
    "Generate WiFi QR codes",
    "Generate SMS QR codes",
    "Generate Email QR codes",
    "Generate Bitcoin QR codes",
    "Custom colors and gradients",
    "Embed logo in QR code",
    "Custom dot and corner shapes",
    "Download PNG, SVG, JPG, EPS"
  ]
}
</script>

<!-- FAQ JSON-LD -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {{- range $i, $faq := .FAQs }}
    {{- if $i }},{{ end }}
    {
      "@type": "Question",
      "name": {{ $faq.Q | jsonEscape }},
      "acceptedAnswer": { "@type": "Answer", "text": {{ $faq.A | jsonEscape }} }
    }
    {{- end }}
  ]
}
</script>
```

---

## 5. 广告位插槽

```html
<!-- 工具页顶部横幅 728×90 -->
{{- template "partials/ad_slot.html" dict "SlotID" "qr-top" "Size" "728x90" "Mobile" "320x50" }}

<!-- 预览区右侧（桌面）300×250 -->
{{- template "partials/ad_slot.html" dict "SlotID" "qr-sidebar" "Size" "300x250" "MobileHide" true }}

<!-- 页面底部 728×90 -->
{{- template "partials/ad_slot.html" dict "SlotID" "qr-bottom" "Size" "728x90" "Mobile" "320x50" }}
```

---

## 6. 全量 i18n Key

### locales/zh.json（qr 部分）

```json
{
  "qr.name":         "二维码生成器",
  "qr.title":        "在线二维码生成器",
  "qr.desc":         "免费生成自定义二维码，支持 URL、名片、WiFi 等 8 种类型",

  "qr.hero.title":    "免费在线二维码生成器",
  "qr.hero.subtitle": "支持 8 种类型，自定义颜色/形状/Logo，下载高清 PNG/SVG/EPS",
  "qr.hero.badge1":   "完全免费",
  "qr.hero.badge2":   "无需注册",
  "qr.hero.badge3":   "即刻下载",

  "qr.type.url":      "网址",
  "qr.type.url.desc": "打开网页链接",
  "qr.type.vcard":    "名片",
  "qr.type.vcard.desc":"数字名片，一键保存联系人",
  "qr.type.text":     "纯文本",
  "qr.type.text.desc":"显示任意文字（最多 300 字符）",
  "qr.type.sms":      "短信",
  "qr.type.sms.desc": "预填短信内容和号码",
  "qr.type.email":    "邮件",
  "qr.type.email.desc":"预填邮件主题和正文",
  "qr.type.wifi":     "WiFi",
  "qr.type.wifi.desc":"扫码自动连接 WiFi",
  "qr.type.twitter":  "Twitter/X",
  "qr.type.twitter.desc":"预填推文内容",
  "qr.type.bitcoin":  "比特币",
  "qr.type.bitcoin.desc":"加密货币收款二维码",

  "qr.form.url.label":       "网址",
  "qr.form.url.placeholder": "https://example.com",
  "qr.form.vcard.firstname":  "名",
  "qr.form.vcard.lastname":   "姓",
  "qr.form.vcard.phone":      "手机号码",
  "qr.form.vcard.email":      "电子邮件",
  "qr.form.vcard.company":    "公司",
  "qr.form.vcard.jobtitle":   "职位",
  "qr.form.vcard.website":    "网站",
  "qr.form.vcard.street":     "街道",
  "qr.form.vcard.city":       "城市",
  "qr.form.vcard.zip":        "邮编",
  "qr.form.vcard.country":    "国家",
  "qr.form.text.label":       "文字内容",
  "qr.form.text.placeholder": "请输入文字（最多 300 字符）",
  "qr.form.sms.phone":        "手机号码",
  "qr.form.sms.message":      "短信内容",
  "qr.form.email.address":    "收件人邮箱",
  "qr.form.email.subject":    "邮件主题",
  "qr.form.email.body":       "邮件正文",
  "qr.form.wifi.ssid":        "WiFi 名称（SSID）",
  "qr.form.wifi.password":    "密码",
  "qr.form.wifi.encryption":  "加密类型",
  "qr.form.wifi.enc.wpa":     "WPA/WPA2",
  "qr.form.wifi.enc.wep":     "WEP",
  "qr.form.wifi.enc.none":    "无密码",
  "qr.form.wifi.hidden":      "隐藏网络",
  "qr.form.twitter.tweet":    "推文内容",
  "qr.form.bitcoin.address":  "钱包地址",
  "qr.form.bitcoin.amount":   "金额（可选）",
  "qr.form.bitcoin.currency": "币种",
  "qr.form.bitcoin.message":  "备注（可选）",

  "qr.generate.btn":          "生成二维码",
  "qr.generate.loading":      "生成中...",

  "qr.design.title":          "自定义设计",
  "qr.design.colors":         "颜色",
  "qr.design.fg_color":       "前景色",
  "qr.design.bg_color":       "背景色",
  "qr.design.bg_transparent": "透明背景",
  "qr.design.gradient":       "渐变色",
  "qr.design.gradient.linear":"线性渐变",
  "qr.design.gradient.radial":"径向渐变",
  "qr.design.gradient.none":  "纯色",
  "qr.design.dot_style":      "点形状",
  "qr.design.dot.square":     "方形",
  "qr.design.dot.rounded":    "圆角",
  "qr.design.dot.dots":       "圆点",
  "qr.design.dot.classy":     "优雅",
  "qr.design.dot.classy_rounded":"优雅圆角",
  "qr.design.dot.extra_rounded":"超圆角",
  "qr.design.corner_square":  "角落方块",
  "qr.design.corner_dot":     "角落圆点",
  "qr.design.logo":           "Logo",
  "qr.design.logo.upload":    "上传 Logo",
  "qr.design.logo.size":      "Logo 大小",
  "qr.design.logo.remove":    "移除 Logo",
  "qr.design.margin":         "边距",
  "qr.design.ecLevel":        "纠错级别",
  "qr.design.ecLevel.L":      "L（7%）",
  "qr.design.ecLevel.M":      "M（15%）- 推荐",
  "qr.design.ecLevel.Q":      "Q（25%）- 含 Logo",
  "qr.design.ecLevel.H":      "H（30%）- 高容错",

  "qr.frame.title":           "选择边框",
  "qr.frame.none":            "无边框",
  "qr.frame.text":            "底部文字",
  "qr.frame.color":           "边框颜色",
  "qr.frame.text_content":    "文字内容",
  "qr.frame.text_placeholder":"扫码查看",
  "qr.frame.text_color":      "文字颜色",

  "qr.download.title":        "下载二维码",
  "qr.download.png":          "下载 PNG（高清）",
  "qr.download.svg":          "下载 SVG（矢量）",
  "qr.download.jpg":          "下载 JPG",
  "qr.download.eps":          "下载 EPS（印刷）",
  "qr.download.copying":      "复制到剪贴板",
  "qr.download.copy_done":    "已复制！",
  "qr.download.share":        "分享链接",

  "qr.preview.empty":         "请填写内容并点击「生成二维码」",
  "qr.preview.scan_hint":     "请用手机扫码测试是否正常",

  "qr.feature.free.title":    "完全免费",
  "qr.feature.free.desc":     "所有功能免费使用，无需注册，无任何隐藏费用",
  "qr.feature.custom.title":  "高度定制",
  "qr.feature.custom.desc":   "自定义颜色、形状、Logo，生成独一无二的品牌二维码",
  "qr.feature.hd.title":      "高清下载",
  "qr.feature.hd.desc":       "支持 PNG/SVG/EPS 高清格式，满足印刷和数字媒体需求",
  "qr.feature.types.title":   "8 种类型",
  "qr.feature.types.desc":    "URL、名片、WiFi、短信、邮件、比特币等，覆盖所有使用场景",

  "qr.faq.title":             "常见问题",

  "qr.error.url_invalid":     "请输入合法的网址（以 http:// 或 https:// 开头）",
  "qr.error.content_empty":   "请先填写内容",
  "qr.error.text_too_long":   "文字内容不能超过 300 字符",
  "qr.error.logo_too_large":  "Logo 图片不能超过 2MB",
  "qr.error.eps_failed":      "EPS 生成失败，请稍后重试"
}
```

### locales/en.json（qr 部分）

```json
{
  "qr.name":         "QR Code Generator",
  "qr.title":        "Online QR Code Generator",
  "qr.desc":         "Free QR code generator for URLs, vCards, WiFi and more",

  "qr.hero.title":    "Free Online QR Code Generator",
  "qr.hero.subtitle": "8 types supported. Custom colors, shapes & logos. Download PNG/SVG/EPS.",
  "qr.hero.badge1":   "100% Free",
  "qr.hero.badge2":   "No Sign-up",
  "qr.hero.badge3":   "Instant Download",

  "qr.type.url":      "URL",
  "qr.type.url.desc": "Open a website or link",
  "qr.type.vcard":    "vCard",
  "qr.type.vcard.desc":"Digital business card with save-to-phone",
  "qr.type.text":     "Plain Text",
  "qr.type.text.desc":"Display text up to 300 characters",
  "qr.type.sms":      "SMS",
  "qr.type.sms.desc": "Pre-fill a text message",
  "qr.type.email":    "Email",
  "qr.type.email.desc":"Pre-fill an email with subject and body",
  "qr.type.wifi":     "WiFi",
  "qr.type.wifi.desc":"Auto-connect to a WiFi network",
  "qr.type.twitter":  "Twitter/X",
  "qr.type.twitter.desc":"Pre-fill a tweet",
  "qr.type.bitcoin":  "Bitcoin",
  "qr.type.bitcoin.desc":"Crypto payment QR code",

  "qr.generate.btn":  "Generate QR Code",
  "qr.design.title":  "Customize Design",
  "qr.frame.title":   "Choose Frame",
  "qr.download.png":  "Download PNG (HD)",
  "qr.download.svg":  "Download SVG (Vector)",
  "qr.download.jpg":  "Download JPG",
  "qr.download.eps":  "Download EPS (Print)",
  "qr.faq.title":     "FAQ"
}
```

---

## 7. sitemap.xml 新增条目

```xml
<url>
  <loc>https://devtoolbox.dev/media/qr</loc>
  <lastmod>2026-03-01</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>
</url>
<url>
  <loc>https://devtoolbox.dev/media/qr?lang=zh</loc>
  <priority>0.85</priority>
</url>
<url>
  <loc>https://devtoolbox.dev/media/qr?lang=en</loc>
  <priority>0.85</priority>
</url>
```

---

## 8. 验收标准

- [ ] `/media/qr` 返回 200，`<title>` 含关键词
- [ ] canonical + hreflang 正确输出
- [ ] JSON-LD SoftwareApplication + FAQPage 正确
- [ ] sitemap.xml 包含 3 条 media/qr 条目
- [ ] `POST /media/qr/api/eps` 接受 SVG 字符串，返回 EPS 文件流（Content-Disposition: attachment）
- [ ] 中英文切换：所有文案正确替换
