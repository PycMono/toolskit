# Developer Tools Suite — I-01 路由 / SEO / i18n / sitemap / 广告 / GA

---

## 1. Go 路由注册

```go
// router/dev_tools.go

package router

import (
    "github.com/gin-gonic/gin"
    "toolboxnova/handler"
    "toolboxnova/middleware"
)

func RegisterDevToolsRoutes(r *gin.Engine) {
    devGroup := r.Group("/dev", middleware.LangDetect(), middleware.SEOMeta())
    {
        devGroup.GET("/hash",         handler.DevHashPage)
        devGroup.GET("/base64",       handler.DevBase64Page)
        devGroup.GET("/url-encode",   handler.DevURLEncodePage)
        devGroup.GET("/ip",           handler.DevIPPage)
        devGroup.GET("/whois",        handler.DevWhoisPage)
        devGroup.GET("/word-counter", handler.DevWordCounterPage)
    }

    // 后端代理：Whois 查询（唯一需要服务端的子工具）
    apiGroup := r.Group("/api")
    {
        apiGroup.GET("/whois", handler.WhoisProxy) // ?domain=example.com
    }
}
```

---

## 2. 页面 Handler

```go
// handler/dev_tools.go

package handler

import (
    "net/http"
    "github.com/gin-gonic/gin"
    "toolboxnova/i18n"
)

// ──────────────────────────────────────────
// /dev/hash
// ──────────────────────────────────────────
func DevHashPage(c *gin.Context) {
    lang := c.GetString("lang") // 由 LangDetect 中间件注入
    t := i18n.Get(lang)

    seo := map[string]interface{}{
        "Title":       t("seo.hash.title"),
        "Description": t("seo.hash.description"),
        "Keywords":    t("seo.hash.keywords"),
        "Canonical":   "https://toolboxnova.com/dev/hash",
        "HreflangZH":  "https://toolboxnova.com/dev/hash?lang=zh",
        "HreflangEN":  "https://toolboxnova.com/dev/hash?lang=en",
        "OGImage":     "https://toolboxnova.com/static/og/dev-hash.png",
    }

    faqs := buildFAQ(lang, "hash")

    c.HTML(http.StatusOK, "dev/hash.html", gin.H{
        "SEO":         seo,
        "FAQs":        faqs,
        "Lang":        lang,
        "AdsEnabled":  getAdsEnabled(),
        "AdsClientID": getAdsClientID(),
        "GAEnabled":   getGAEnabled(),
    })
}

// ──────────────────────────────────────────
// /dev/base64
// ──────────────────────────────────────────
func DevBase64Page(c *gin.Context) {
    lang := c.GetString("lang")
    t := i18n.Get(lang)
    seo := map[string]interface{}{
        "Title":       t("seo.base64.title"),
        "Description": t("seo.base64.description"),
        "Keywords":    t("seo.base64.keywords"),
        "Canonical":   "https://toolboxnova.com/dev/base64",
        "HreflangZH":  "https://toolboxnova.com/dev/base64?lang=zh",
        "HreflangEN":  "https://toolboxnova.com/dev/base64?lang=en",
        "OGImage":     "https://toolboxnova.com/static/og/dev-base64.png",
    }
    c.HTML(http.StatusOK, "dev/base64.html", gin.H{
        "SEO": seo, "FAQs": buildFAQ(lang, "base64"),
        "Lang": lang, "AdsEnabled": getAdsEnabled(), "AdsClientID": getAdsClientID(),
    })
}

// ──────────────────────────────────────────
// /dev/url-encode
// ──────────────────────────────────────────
func DevURLEncodePage(c *gin.Context) {
    lang := c.GetString("lang")
    t := i18n.Get(lang)
    seo := map[string]interface{}{
        "Title":       t("seo.url_encode.title"),
        "Description": t("seo.url_encode.description"),
        "Keywords":    t("seo.url_encode.keywords"),
        "Canonical":   "https://toolboxnova.com/dev/url-encode",
        "HreflangZH":  "https://toolboxnova.com/dev/url-encode?lang=zh",
        "HreflangEN":  "https://toolboxnova.com/dev/url-encode?lang=en",
        "OGImage":     "https://toolboxnova.com/static/og/dev-url-encode.png",
    }
    c.HTML(http.StatusOK, "dev/url-encode.html", gin.H{
        "SEO": seo, "FAQs": buildFAQ(lang, "url_encode"),
        "Lang": lang, "AdsEnabled": getAdsEnabled(), "AdsClientID": getAdsClientID(),
    })
}

// ──────────────────────────────────────────
// /dev/ip
// ──────────────────────────────────────────
func DevIPPage(c *gin.Context) {
    lang := c.GetString("lang")
    t := i18n.Get(lang)
    seo := map[string]interface{}{
        "Title":       t("seo.ip.title"),
        "Description": t("seo.ip.description"),
        "Keywords":    t("seo.ip.keywords"),
        "Canonical":   "https://toolboxnova.com/dev/ip",
        "HreflangZH":  "https://toolboxnova.com/dev/ip?lang=zh",
        "HreflangEN":  "https://toolboxnova.com/dev/ip?lang=en",
        "OGImage":     "https://toolboxnova.com/static/og/dev-ip.png",
    }
    c.HTML(http.StatusOK, "dev/ip.html", gin.H{
        "SEO": seo, "FAQs": buildFAQ(lang, "ip"),
        "Lang": lang, "AdsEnabled": getAdsEnabled(), "AdsClientID": getAdsClientID(),
    })
}

// ──────────────────────────────────────────
// /dev/whois
// ──────────────────────────────────────────
func DevWhoisPage(c *gin.Context) {
    lang := c.GetString("lang")
    t := i18n.Get(lang)
    seo := map[string]interface{}{
        "Title":       t("seo.whois.title"),
        "Description": t("seo.whois.description"),
        "Keywords":    t("seo.whois.keywords"),
        "Canonical":   "https://toolboxnova.com/dev/whois",
        "HreflangZH":  "https://toolboxnova.com/dev/whois?lang=zh",
        "HreflangEN":  "https://toolboxnova.com/dev/whois?lang=en",
        "OGImage":     "https://toolboxnova.com/static/og/dev-whois.png",
    }
    c.HTML(http.StatusOK, "dev/whois.html", gin.H{
        "SEO": seo, "FAQs": buildFAQ(lang, "whois"),
        "Lang": lang, "AdsEnabled": getAdsEnabled(), "AdsClientID": getAdsClientID(),
    })
}

// ──────────────────────────────────────────
// /dev/word-counter
// ──────────────────────────────────────────
func DevWordCounterPage(c *gin.Context) {
    lang := c.GetString("lang")
    t := i18n.Get(lang)
    seo := map[string]interface{}{
        "Title":       t("seo.word_counter.title"),
        "Description": t("seo.word_counter.description"),
        "Keywords":    t("seo.word_counter.keywords"),
        "Canonical":   "https://toolboxnova.com/dev/word-counter",
        "HreflangZH":  "https://toolboxnova.com/dev/word-counter?lang=zh",
        "HreflangEN":  "https://toolboxnova.com/dev/word-counter?lang=en",
        "OGImage":     "https://toolboxnova.com/static/og/dev-word-counter.png",
    }
    c.HTML(http.StatusOK, "dev/word-counter.html", gin.H{
        "SEO": seo, "FAQs": buildFAQ(lang, "word_counter"),
        "Lang": lang, "AdsEnabled": getAdsEnabled(), "AdsClientID": getAdsClientID(),
    })
}

// ──────────────────────────────────────────
// Whois 后端代理
// ──────────────────────────────────────────
func WhoisProxy(c *gin.Context) {
    domain := c.Query("domain")
    if domain == "" {
        c.JSON(400, gin.H{"error": "domain required"})
        return
    }
    // 1. 尝试 RDAP: https://rdap.org/domain/{domain}
    // 2. 回退原始 Whois TCP 43 端口查询
    // 3. 返回 JSON: { raw: string, parsed: {...} }
    result, err := whoisLookup(domain)
    if err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }
    c.JSON(200, result)
}

// ──────────────────────────────────────────
// FAQ 数据构建
// ──────────────────────────────────────────
type FAQ struct {
    Q string
    A string
}

func buildFAQ(lang, tool string) []FAQ {
    faqs := map[string]map[string][]FAQ{
        "en": {
            "hash": {
                {Q: "What is the difference between MD5 and SHA-256?", A: "MD5 produces a 128-bit hash and is considered cryptographically broken. SHA-256 produces a 256-bit hash and is part of the SHA-2 family, still considered secure for most use cases."},
                {Q: "Can I reverse a hash to get the original text?", A: "No. Hash functions are one-way by design. You cannot mathematically reverse a hash, though weak hashes like MD5 can sometimes be cracked via rainbow tables."},
                {Q: "Is it safe to hash passwords with MD5?", A: "No. MD5 is not suitable for password hashing due to speed and vulnerability to rainbow table attacks. Use bcrypt, scrypt, or Argon2 instead."},
                {Q: "What is HMAC and when should I use it?", A: "HMAC (Hash-based Message Authentication Code) combines a hash function with a secret key to verify both data integrity and authenticity. Use it for API signatures and webhook verification."},
                {Q: "Why does the same text produce different SHA results?", A: "Different SHA algorithms (SHA-1, SHA-256, SHA-512) use different internal structures and produce different output lengths, which is why results differ even for the same input."},
            },
            "base64": {
                {Q: "What is Base64 encoding?", A: "Base64 is a binary-to-text encoding scheme that represents binary data using only 64 ASCII characters. It is commonly used to embed images in HTML, send email attachments, and store binary data in JSON."},
                {Q: "What is the difference between Base64 and Base64URL?", A: "Standard Base64 uses '+' and '/' characters which must be percent-encoded in URLs. Base64URL replaces them with '-' and '_', making it safe for use in URLs and filenames without extra encoding."},
                {Q: "Does Base64 increase file size?", A: "Yes, Base64 encoding increases data size by approximately 33% because every 3 bytes of binary data are represented as 4 ASCII characters."},
                {Q: "Is Base64 a form of encryption?", A: "No. Base64 is an encoding scheme, not encryption. It does not protect your data. Anyone can decode a Base64 string without a key."},
                {Q: "Can I encode an image to Base64 with this tool?", A: "Yes. Use the file upload area to select any image or binary file up to 50MB. The tool will encode it entirely in your browser without uploading to any server."},
            },
            "url_encode": {
                {Q: "What is URL encoding?", A: "URL encoding (percent-encoding) converts characters that are not allowed in URLs into a '%XX' format where XX is the hexadecimal code. For example, a space becomes %20."},
                {Q: "What is the difference between encodeURI and encodeURIComponent?", A: "encodeURI encodes a full URL and leaves characters like '/', '?', '&' intact. encodeURIComponent encodes a URL component (like a query value) and converts those characters too."},
                {Q: "Why does my URL have %20 instead of +?", A: "%20 is the RFC 3986 standard for spaces in URLs. The '+' sign is only valid for encoding spaces in HTML form data (application/x-www-form-urlencoded), not in general URL paths."},
                {Q: "Can I decode multiple URLs at once?", A: "Yes. Paste multiple URLs separated by newlines into the input area and enable batch mode. Each line will be encoded or decoded independently."},
                {Q: "Why are some characters not encoded?", A: "RFC 3986 defines a set of 'unreserved characters' (A-Z, a-z, 0-9, -, _, ., ~) that are safe in URLs and do not need encoding. Our tool follows this standard."},
            },
            "ip": {
                {Q: "What is my public IP address?", A: "Your public IP is the address your Internet Service Provider assigns to your network. It is used to identify your device on the internet and differs from your private (local) IP."},
                {Q: "What is IPv4 vs IPv6?", A: "IPv4 uses 32-bit addresses (e.g., 192.168.1.1) supporting ~4.3 billion addresses. IPv6 uses 128-bit addresses (e.g., 2001:db8::1) supporting virtually unlimited addresses to solve the IPv4 exhaustion problem."},
                {Q: "Can someone find my location from my IP address?", A: "Only approximately. IP geolocation can usually identify your country and city-level area, but not your exact street address. VPNs and proxies can mask your real IP."},
                {Q: "What is an ASN?", A: "An Autonomous System Number (ASN) is a unique identifier assigned to a network of IP addresses operated by an ISP or large organization for routing internet traffic."},
                {Q: "Why does my IP geolocation show the wrong city?", A: "IP databases are not always accurate. They rely on registration data from ISPs, which may not reflect the actual physical location of the end user, especially for mobile or VPN users."},
            },
            "whois": {
                {Q: "What is a Whois lookup?", A: "Whois is a protocol that queries databases storing information about registered domain names, including owner, registrar, registration date, and expiry date."},
                {Q: "Is Whois information always accurate?", A: "Not necessarily. Domain owners can use privacy protection services to mask their personal contact information, showing registrar proxy details instead."},
                {Q: "What is RDAP?", A: "RDAP (Registration Data Access Protocol) is the modern replacement for Whois. It returns structured JSON data instead of plain text and supports better authentication and access control."},
                {Q: "Can I look up IP address ownership with Whois?", A: "Yes. You can enter an IP address to query ARIN, RIPE, APNIC, or other regional internet registries for ownership and network allocation data."},
                {Q: "Why is some Whois data redacted?", A: "GDPR and other privacy regulations have led registrars to redact personal data like owner names and email addresses. You may need to contact the registrar for ownership disputes."},
            },
            "word_counter": {
                {Q: "How is reading time calculated?", A: "Reading time is estimated at 238 words per minute for English text, which is the average adult silent reading speed according to research. For Chinese text, 500 characters per minute is used."},
                {Q: "What is the Flesch-Kincaid readability score?", A: "The Flesch Reading Ease score ranges from 0 to 100. Higher scores indicate easier text. A score of 60-70 is considered standard for the general public, while below 30 indicates academic or technical text."},
                {Q: "Does the word counter support Chinese text?", A: "Yes. Chinese characters are counted individually as words (since Chinese has no spaces between words). The tool also counts total characters separately from word count."},
                {Q: "What is keyword density?", A: "Keyword density is the percentage of times a specific word appears in a text relative to the total word count. It is used in SEO analysis to avoid keyword stuffing (typically keep below 2-3%)."},
                {Q: "How are sentences counted?", A: "Sentences are delimited by periods, exclamation marks, and question marks. Abbreviations like 'Dr.' or 'U.S.' are handled by the parser to avoid false splits."},
            },
        },
        "zh": {
            "hash": {
                {Q: "MD5 和 SHA-256 有什么区别？", A: "MD5 生成 128 位哈希值，已被证明存在碰撞漏洞，不适合安全场景。SHA-256 生成 256 位哈希值，属于 SHA-2 家族，目前仍被认为在大多数场景下安全可靠。"},
                {Q: "能从哈希值反推出原始内容吗？", A: "不能。哈希函数是单向的，在数学上无法逆推原始内容。不过，弱哈希如 MD5 可能通过彩虹表碰撞破解简单密码。"},
                {Q: "可以用 MD5 存储密码吗？", A: "不推荐。MD5 速度极快且容易遭受彩虹表攻击，不适合密码存储。请改用 bcrypt、scrypt 或 Argon2 等专为密码设计的算法。"},
                {Q: "什么是 HMAC？什么时候用它？", A: "HMAC（基于哈希的消息认证码）将哈希函数与密钥结合，用于同时验证数据完整性和来源真实性。常用于 API 请求签名和 Webhook 身份验证。"},
                {Q: "为什么同样的文字在不同算法下结果不同？", A: "不同哈希算法（SHA-1、SHA-256、SHA-512）内部结构不同，输出长度也不同，因此同一输入在不同算法下会产生完全不同的哈希值，这是设计上的正常行为。"},
            },
            "base64": {
                {Q: "什么是 Base64 编码？", A: "Base64 是一种将二进制数据转换为 ASCII 文本的编码方案，使用 64 个可打印字符表示任意二进制数据。常用于在 HTML 中嵌入图片、发送邮件附件、在 JSON 中存储二进制数据。"},
                {Q: "Base64 和 Base64URL 有什么区别？", A: "标准 Base64 使用 '+' 和 '/' 字符，在 URL 中需要额外转义。Base64URL 将它们替换为 '-' 和 '_'，可以直接用在 URL 路径和文件名中，无需再次转义。"},
                {Q: "Base64 编码会增大文件体积吗？", A: "会，增加约 33%。这是因为每 3 字节的二进制数据被表示为 4 个 ASCII 字符，是 Base64 编码的固有特性。"},
                {Q: "Base64 是加密吗？", A: "不是。Base64 只是编码，不提供任何安全性保障。任何人都可以无需密钥直接解码 Base64 字符串。如需保密，请先对数据加密再进行 Base64 编码。"},
                {Q: "这个工具可以把图片转成 Base64 吗？", A: "可以。在文件上传区选择任意图片或二进制文件（最大 50MB），工具将完全在您的浏览器内处理，不会上传到任何服务器。"},
            },
            "url_encode": {
                {Q: "什么是 URL 编码？", A: "URL 编码（百分号编码）将 URL 中不允许出现的字符转换为 '%XX' 格式，其中 XX 是该字符的十六进制码。例如空格变为 %20。"},
                {Q: "encodeURI 和 encodeURIComponent 有什么区别？", A: "encodeURI 对完整 URL 编码，保留 '/'、'?'、'&' 等结构字符不变；encodeURIComponent 对 URL 的某个部分（如查询参数值）编码，会转义这些结构字符。"},
                {Q: "URL 中的空格应该用 %20 还是 +？", A: "%20 是 RFC 3986 的标准写法，适用于所有 URL 路径和参数。'+' 只在 HTML 表单数据（application/x-www-form-urlencoded）中合法代表空格，两者不可混用。"},
                {Q: "可以批量对多个 URL 进行编码吗？", A: "可以。将多个 URL 每行一个粘贴到输入框，开启批量模式后，工具将对每一行独立进行编码或解码处理。"},
                {Q: "为什么有些字符没有被编码？", A: "RFC 3986 定义了一组「非保留字符」（A-Z、a-z、0-9、-、_、.、~），这些字符在 URL 中天然安全，无需编码。本工具严格遵循此标准。"},
            },
            "ip": {
                {Q: "什么是公网 IP 地址？", A: "公网 IP 是您的网络运营商（ISP）分配给您网络的地址，用于在互联网上标识您的设备，与路由器内部使用的私有 IP（如 192.168.x.x）不同。"},
                {Q: "IPv4 和 IPv6 有什么区别？", A: "IPv4 使用 32 位地址（如 192.168.1.1），约 43 亿个地址空间已近耗尽。IPv6 使用 128 位地址（如 2001:db8::1），可提供近乎无限的地址空间来解决这一问题。"},
                {Q: "别人能通过我的 IP 找到我的准确位置吗？", A: "不能精确定位。IP 地理位置数据库通常只能确定您所在的国家和大致城市，无法获知具体街道地址。使用 VPN 可以隐藏您的真实 IP。"},
                {Q: "什么是 ASN？", A: "自治系统编号（ASN）是分配给由运营商或大型组织管理的 IP 地址网络的唯一标识符，用于互联网路由协议中标识不同网络主体。"},
                {Q: "为什么 IP 地理位置显示的城市不正确？", A: "IP 数据库依赖 ISP 的注册信息，更新可能有延迟，移动网络和 VPN 用户的位置尤其不准确。这是 IP 定位技术本身的局限性。"},
            },
            "whois": {
                {Q: "什么是 Whois 查询？", A: "Whois 是一种查询协议，用于获取已注册域名的信息，包括域名所有者、注册商、注册日期和到期日期等数据。"},
                {Q: "Whois 信息准确吗？", A: "不一定。域名注册者可以使用隐私保护服务隐藏个人联系信息，此时查询结果会显示注册商代理机构的信息而非真实所有者。"},
                {Q: "什么是 RDAP？", A: "RDAP（注册数据访问协议）是 Whois 的现代替代方案，返回结构化的 JSON 数据而非纯文本，支持更好的访问控制和国际化。本工具优先使用 RDAP 查询。"},
                {Q: "可以查询 IP 地址的归属吗？", A: "可以。输入 IP 地址可查询 ARIN、RIPE、APNIC 等地区互联网注册机构的数据，获取该 IP 的网段所有者和分配信息。"},
                {Q: "为什么某些 Whois 信息被隐藏了？", A: "GDPR 等隐私法规要求注册商隐去个人数据，如所有者姓名和邮箱。如需进行域名所有权核实，需联系域名注册商通过官方渠道处理。"},
            },
            "word_counter": {
                {Q: "阅读时间是怎么计算的？", A: "英文文本按每分钟 238 词计算（成年人平均默读速度），中文文本按每分钟 500 字计算。这是根据阅读速度研究得出的参考数值。"},
                {Q: "什么是 Flesch-Kincaid 可读性评分？", A: "Flesch 阅读便捷度评分范围 0-100，分数越高表示文章越易读。60-70 分适合普通大众阅读，30 分以下通常为学术或技术性文本。"},
                {Q: "支持中文字数统计吗？", A: "支持。中文字符按单个汉字计为一个单词（因为中文没有空格分隔词语），同时单独提供总字符数统计，满足不同统计需求。"},
                {Q: "什么是关键词密度？", A: "关键词密度是某个词在全文中出现次数占总词数的百分比，用于 SEO 分析。通常建议关键词密度保持在 2-3% 以内，过高会被搜索引擎判定为堆砌关键词。"},
                {Q: "句子数量是怎么统计的？", A: "工具以句号、叹号、问号作为句子分隔符，同时内置了缩写词识别规则（如 Dr.、U.S.），避免因缩写中的句点导致统计错误。"},
            },
        },
    }
    return faqs[lang][tool]
}
```

---

## 3. SEO `<head>` 模板示例（以 /dev/hash 为例）

```html
{{/* templates/dev/hash.html - define "extraHead" block */}}
{{ define "extraHead" }}

<title>{{ .SEO.Title }}</title>
<meta name="description" content="{{ .SEO.Description }}">
<meta name="keywords" content="{{ .SEO.Keywords }}">
<meta name="robots" content="index, follow">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<meta property="og:type" content="website">
<meta property="og:title" content="{{ .SEO.Title }}">
<meta property="og:description" content="{{ .SEO.Description }}">
<meta property="og:image" content="{{ .SEO.OGImage }}">
<meta property="og:url" content="{{ .SEO.Canonical }}">
<meta property="og:site_name" content="ToolboxNova">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{ .SEO.Title }}">
<meta name="twitter:description" content="{{ .SEO.Description }}">
<meta name="twitter:image" content="{{ .SEO.OGImage }}">

<link rel="canonical" href="{{ .SEO.Canonical }}">
<link rel="alternate" hreflang="zh" href="{{ .SEO.HreflangZH }}">
<link rel="alternate" hreflang="en" href="{{ .SEO.HreflangEN }}">
<link rel="alternate" hreflang="x-default" href="{{ .SEO.Canonical }}">

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Hash Generator — MD5 SHA-1 SHA-256 SHA-512 HMAC",
  "url": "https://toolboxnova.com/dev/hash",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "Any",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "description": "Free online hash generator supporting MD5, SHA-1, SHA-256, SHA-512, and HMAC. All computation runs in your browser — no data uploaded.",
  "featureList": [
    "MD5 Hash Generation", "SHA-1 Hash Generation", "SHA-256 Hash Generation",
    "SHA-512 Hash Generation", "HMAC-SHA256 with Custom Key",
    "File Hash Support", "Real-time Hash Computation", "100% Client-side Processing"
  ]
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {{ range $i, $faq := .FAQs }}
    {{ if $i }},{{ end }}
    {
      "@type": "Question",
      "name": "{{ $faq.Q }}",
      "acceptedAnswer": { "@type": "Answer", "text": "{{ $faq.A }}" }
    }
    {{ end }}
  ]
}
</script>

{{ if .AdsEnabled }}
<script async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={{ .AdsClientID }}"
  crossorigin="anonymous"></script>
{{ end }}

{{ end }}
```

---

## 4. 广告接入 & GA 事件追踪

### 4.1 广告位（三段式）

```html
{{/* ① 顶部横幅 — Hero 下方 */}}
{{- template "partials/ad_slot.html" dict
    "SlotID"   "dev-hash-top"
    "Size"     "728x90"
    "Mobile"   "320x50"
    "ClientID" .AdsClientID
    "Enabled"  .AdsEnabled }}

{{/* ② 侧边栏 — 结果区右侧，移动端隐藏 */}}
{{- template "partials/ad_slot.html" dict
    "SlotID"     "dev-hash-sidebar"
    "Size"       "300x250"
    "MobileHide" true
    "ClientID"   .AdsClientID
    "Enabled"    .AdsEnabled }}

{{/* ③ 底部横幅 — FAQ 下方 */}}
{{- template "partials/ad_slot.html" dict
    "SlotID"   "dev-hash-bottom"
    "Size"     "728x90"
    "Mobile"   "320x50"
    "ClientID" .AdsClientID
    "Enabled"  .AdsEnabled }}
```

SlotID 命名规则：`dev-{工具名}-{位置}`（top / sidebar / bottom）

### 4.2 GA 事件追踪

```javascript
{{ define "extraScript" }}
(function () {
  var TOOL = 'dev-hash';

  function onHashComplete(algorithm, durationMs) {
    gaTrackProcessDone(TOOL, 1, durationMs);
    gaTrackSettingChange(TOOL, 'algorithm', algorithm);
  }
  function onFileSelected(sizeMB) {
    gaTrackUpload(TOOL, 1, sizeMB);
  }
  function onCopy(algorithm) {
    gaTrackDownload(TOOL, 'text/plain');
    gaTrackSettingChange(TOOL, 'copy_algorithm', algorithm);
  }
  function onError(errMsg) {
    gaTrackError(TOOL, 'hash_fail', errMsg);
  }

  window.DevHashGA = { onHashComplete, onFileSelected, onCopy, onError };
})();
{{ end }}
```

### 4.3 三段式 Block 结构说明

| Block | 位置 | 内容 |
|-------|------|------|
| `extraHead` | `<head>` 内 | AdSense SDK 条件加载、JSON-LD、hreflang |
| `content` | `<body>` 主体 | 广告位插入点（top/sidebar/bottom）+ 页面主体 HTML |
| `extraScript` | `</body>` 前 | GA 事件绑定函数、工具特定 JS 初始化 |

---

## 5. 全量 i18n Key

### 英文 `i18n/en.json`（新增部分）

```json
{
  "nav.dev_tools": "Developer Tools",
  "nav.dev_hash": "Hash Generator",
  "nav.dev_base64": "Base64 Encoder",
  "nav.dev_url_encode": "URL Encoder",
  "nav.dev_ip": "IP Lookup",
  "nav.dev_whois": "Whois Lookup",
  "nav.dev_word_counter": "Word Counter",

  "seo.hash.title": "Free Hash Generator — MD5, SHA-1, SHA-256, SHA-512, HMAC Online | ToolboxNova",
  "seo.hash.description": "Calculate MD5, SHA-1, SHA-256, SHA-512, and HMAC hashes instantly. Supports text and file input. 100% client-side — your data never leaves your browser.",
  "seo.hash.keywords": "MD5 generator, SHA256 online, hash calculator, HMAC SHA256, file hash, SHA512 generator",
  "seo.base64.title": "Free Base64 Encoder & Decoder Online — Text and File | ToolboxNova",
  "seo.base64.description": "Encode or decode Base64 instantly. Supports text, files up to 50MB, Base64URL, and MIME line splitting. All processing happens in your browser.",
  "seo.base64.keywords": "Base64 encode, Base64 decode, Base64URL, MIME encode, online base64 converter",
  "seo.url_encode.title": "URL Encode & Decode Online — Percent Encoding Tool | ToolboxNova",
  "seo.url_encode.description": "Encode or decode URLs using encodeURIComponent or RFC 3986 standard. Supports batch processing, difference highlighting, and real-time conversion.",
  "seo.url_encode.keywords": "URL encode, URL decode, percent encoding, encodeURIComponent, URL encoding tool",
  "seo.ip.title": "What Is My IP Address — IP Lookup & Geolocation | ToolboxNova",
  "seo.ip.description": "Find your public IPv4 and IPv6 address instantly. Look up any IP for geolocation, ISP, ASN, and map visualization. Free and no sign-up required.",
  "seo.ip.keywords": "what is my IP, IP lookup, IP geolocation, IP address checker, ASN lookup",
  "seo.whois.title": "Whois Domain Lookup — RDAP & Raw Whois Data | ToolboxNova",
  "seo.whois.description": "Look up domain registration information using RDAP and Whois protocol. Get registrar, owner, creation date, expiry, and nameservers in one click.",
  "seo.whois.keywords": "Whois lookup, domain RDAP, domain registration info, who owns a domain, DNS lookup",
  "seo.word_counter.title": "Word Counter & Text Analyzer — Characters, Sentences, Readability | ToolboxNova",
  "seo.word_counter.description": "Count words, characters, sentences, and paragraphs. Get reading time, Flesch-Kincaid readability score, keyword density, and Flow Score in real time.",
  "seo.word_counter.keywords": "word counter, character counter, readability score, keyword density, word count tool",

  "hero.hash.title": "Hash Generator",
  "hero.hash.subtitle": "MD5 · SHA-1 · SHA-256 · SHA-512 · HMAC — calculate all at once",
  "hero.hash.badge1": "Client-side Only",
  "hero.hash.badge2": "File Support",
  "hero.hash.badge3": "Real-time",
  "hero.base64.title": "Base64 Encoder & Decoder",
  "hero.base64.subtitle": "Encode or decode text and files — Base64URL and MIME supported",
  "hero.base64.badge1": "Files up to 50MB",
  "hero.base64.badge2": "Base64URL",
  "hero.base64.badge3": "No Upload",
  "hero.url_encode.title": "URL Encoder & Decoder",
  "hero.url_encode.subtitle": "Percent-encode or decode URLs with diff highlighting and batch mode",
  "hero.url_encode.badge1": "Batch Mode",
  "hero.url_encode.badge2": "RFC 3986",
  "hero.url_encode.badge3": "Diff View",
  "hero.ip.title": "IP Address Lookup",
  "hero.ip.subtitle": "Find your public IP and look up any IP's geolocation, ISP, and ASN",
  "hero.ip.badge1": "IPv4 & IPv6",
  "hero.ip.badge2": "Map View",
  "hero.ip.badge3": "ASN Info",
  "hero.whois.title": "Whois Domain Lookup",
  "hero.whois.subtitle": "RDAP + raw Whois data for any domain or IP address",
  "hero.whois.badge1": "RDAP Support",
  "hero.whois.badge2": "History",
  "hero.whois.badge3": "Structured View",
  "hero.word_counter.title": "Word Counter & Analyzer",
  "hero.word_counter.subtitle": "Real-time word, character, sentence, readability and keyword analysis",
  "hero.word_counter.badge1": "Readability Score",
  "hero.word_counter.badge2": "Keyword Density",
  "hero.word_counter.badge3": "Chinese Support",

  "input.hash.placeholder": "Type or paste text to hash...",
  "input.hash.file_label": "Or drop a file to calculate its hash",
  "input.hash.hmac_key": "HMAC Secret Key",
  "input.hash.hmac_placeholder": "Enter secret key for HMAC",
  "input.base64.placeholder": "Type or paste text to encode / decode...",
  "input.base64.file_label": "Or drop a file (up to 50MB)",
  "input.base64.mode_encode": "Encode",
  "input.base64.mode_decode": "Decode",
  "input.url_encode.placeholder": "Paste a URL or text to encode / decode...",
  "input.url_encode.mode_encode": "Encode",
  "input.url_encode.mode_decode": "Decode",
  "input.url_encode.batch_hint": "One URL per line for batch mode",
  "input.ip.placeholder": "Enter an IP address or domain (leave empty for your IP)",
  "input.ip.btn_lookup": "Look Up",
  "input.ip.btn_my_ip": "My IP",
  "input.whois.placeholder": "Enter a domain name (e.g. example.com)",
  "input.whois.btn_lookup": "Whois Lookup",
  "input.word_counter.placeholder": "Start typing or paste your text here...",

  "options.hash.uppercase": "Uppercase output",
  "options.hash.hmac_mode": "HMAC mode",
  "options.base64.charset": "Character Set",
  "options.base64.newline": "Newline Style",
  "options.base64.each_line": "Encode each line separately",
  "options.base64.split_chunks": "Split into 76-char lines (MIME)",
  "options.base64.url_safe": "URL-safe encoding (Base64URL)",
  "options.url_encode.method": "Encoding Method",
  "options.url_encode.method_component": "encodeURIComponent (recommended)",
  "options.url_encode.method_uri": "encodeURI (full URL)",
  "options.url_encode.method_rfc3986": "RFC 3986 strict",
  "options.url_encode.batch": "Batch mode (one per line)",
  "options.url_encode.diff": "Show diff highlight",

  "result.hash.copy": "Copy",
  "result.hash.copied": "Copied!",
  "result.hash.label_md5": "MD5",
  "result.hash.label_sha1": "SHA-1",
  "result.hash.label_sha256": "SHA-256",
  "result.hash.label_sha512": "SHA-512",
  "result.hash.label_hmac": "HMAC-SHA256",
  "result.base64.output_label": "Output",
  "result.base64.copy": "Copy",
  "result.base64.download": "Download .txt",
  "result.base64.char_count": "{n} characters",
  "result.url_encode.output_label": "Result",
  "result.url_encode.copy": "Copy",
  "result.ip.my_ip_label": "Your Public IP",
  "result.ip.country": "Country",
  "result.ip.region": "Region / State",
  "result.ip.city": "City",
  "result.ip.isp": "ISP",
  "result.ip.asn": "ASN",
  "result.ip.timezone": "Time Zone",
  "result.ip.lat_lng": "Coordinates",
  "result.whois.tab_structured": "Structured",
  "result.whois.tab_raw": "Raw Data",
  "result.whois.registrar": "Registrar",
  "result.whois.created": "Created",
  "result.whois.expires": "Expires",
  "result.whois.updated": "Updated",
  "result.whois.nameservers": "Nameservers",
  "result.whois.status": "Status",
  "result.word_counter.words": "Words",
  "result.word_counter.characters": "Characters",
  "result.word_counter.chars_no_space": "Chars (no spaces)",
  "result.word_counter.sentences": "Sentences",
  "result.word_counter.paragraphs": "Paragraphs",
  "result.word_counter.reading_time": "Reading Time",
  "result.word_counter.speaking_time": "Speaking Time",
  "result.word_counter.reading_level": "Reading Level",
  "result.word_counter.flesch_score": "Flesch Score",
  "result.word_counter.unique_words": "Unique Words",
  "result.word_counter.avg_sentence": "Avg. Sentence Length",
  "result.word_counter.keyword_density": "Keyword Density (Top 10)",

  "error.hash.file_too_large": "File exceeds 2GB limit.",
  "error.base64.invalid": "Invalid Base64 string. Please check your input.",
  "error.base64.file_too_large": "File exceeds 50MB limit.",
  "error.url_encode.empty": "Input is empty. Please enter a URL or text.",
  "error.ip.invalid": "Invalid IP address or domain name.",
  "error.ip.fetch_fail": "Could not retrieve IP information. Please try again.",
  "error.whois.invalid_domain": "Please enter a valid domain name (e.g. example.com).",
  "error.whois.fetch_fail": "Whois lookup failed. The domain may not be registered.",
  "error.word_counter.empty": "Please enter some text to analyze.",

  "feature.privacy.title": "100% Private",
  "feature.privacy.desc": "All processing runs in your browser. No data is sent to our servers.",
  "feature.speed.title": "Instant Results",
  "feature.speed.desc": "Real-time computation as you type — no button required.",
  "feature.free.title": "Always Free",
  "feature.free.desc": "No sign-up, no limits, no hidden fees. Use it anytime.",

  "download.hash.filename": "hashes.txt",
  "download.base64.filename": "base64_output.txt",
  "download.word_counter.filename": "word_stats.txt"
}
```

### 中文 `i18n/zh.json`（新增部分）

```json
{
  "nav.dev_tools": "开发工具",
  "nav.dev_hash": "哈希计算",
  "nav.dev_base64": "Base64 编解码",
  "nav.dev_url_encode": "URL 编解码",
  "nav.dev_ip": "IP 查询",
  "nav.dev_whois": "Whois 查询",
  "nav.dev_word_counter": "文字计数",

  "seo.hash.title": "在线哈希计算器 — MD5、SHA-1、SHA-256、SHA-512、HMAC | ToolboxNova",
  "seo.hash.description": "免费在线计算 MD5、SHA-1、SHA-256、SHA-512 和 HMAC 哈希值，支持文本和文件输入，全程客户端计算，数据不离开您的浏览器。",
  "seo.hash.keywords": "MD5计算,SHA256在线,哈希生成器,HMAC SHA256,文件哈希,SHA512",
  "seo.base64.title": "免费在线 Base64 编解码 — 支持文本和文件 | ToolboxNova",
  "seo.base64.description": "在线 Base64 编码和解码工具，支持文本和最大 50MB 的文件，支持 Base64URL 和 MIME 分行模式，全程浏览器本地处理。",
  "seo.base64.keywords": "Base64编码,Base64解码,Base64URL,MIME编码,在线Base64",
  "seo.url_encode.title": "URL 编码解码在线工具 — 百分号编码 | ToolboxNova",
  "seo.url_encode.description": "在线对 URL 进行百分号编码或解码，支持 encodeURIComponent、encodeURI、RFC 3986 多种模式，提供差异高亮对比视图和批量处理。",
  "seo.url_encode.keywords": "URL编码,URL解码,百分号编码,encodeURIComponent,URL转义",
  "seo.ip.title": "我的 IP 地址查询 — IP 地理位置 ISP ASN | ToolboxNova",
  "seo.ip.description": "查询您的公网 IPv4 和 IPv6 地址，支持查询任意 IP 的地理位置、ISP、ASN，附带地图可视化，免费无需注册。",
  "seo.ip.keywords": "我的IP地址,IP查询,IP地理位置,IP归属地,ASN查询",
  "seo.whois.title": "Whois 域名查询 — RDAP 结构化与原始数据 | ToolboxNova",
  "seo.whois.description": "在线查询域名注册信息，支持 RDAP 和原始 Whois 协议，获取注册商、所有者、注册日期、到期日期和域名服务器信息。",
  "seo.whois.keywords": "Whois查询,域名查询,RDAP,域名注册信息,域名到期查询",
  "seo.word_counter.title": "在线文字计数器 — 词数字符数可读性关键词密度 | ToolboxNova",
  "seo.word_counter.description": "实时统计文字词数、字符数、句子数、段落数，并提供阅读时间、Flesch 可读性评分、关键词密度和句子流畅度分析，支持中英文。",
  "seo.word_counter.keywords": "文字计数,词数统计,字符计数,可读性评分,关键词密度",

  "hero.hash.title": "哈希计算器",
  "hero.hash.subtitle": "MD5 · SHA-1 · SHA-256 · SHA-512 · HMAC — 一次计算全部算法",
  "hero.hash.badge1": "纯客户端",
  "hero.hash.badge2": "支持文件",
  "hero.hash.badge3": "实时计算",
  "hero.base64.title": "Base64 编解码",
  "hero.base64.subtitle": "文本和文件 Base64 编码解码，支持 Base64URL 和 MIME 分行",
  "hero.base64.badge1": "文件最大 50MB",
  "hero.base64.badge2": "Base64URL",
  "hero.base64.badge3": "不上传服务器",
  "hero.url_encode.title": "URL 编码解码",
  "hero.url_encode.subtitle": "支持差异高亮对比、批量处理和多种编码标准",
  "hero.url_encode.badge1": "批量处理",
  "hero.url_encode.badge2": "RFC 3986",
  "hero.url_encode.badge3": "差异对比",
  "hero.ip.title": "IP 地址查询",
  "hero.ip.subtitle": "查询公网 IP，获取任意 IP 的地理位置、ISP 和 ASN 信息",
  "hero.ip.badge1": "IPv4 & IPv6",
  "hero.ip.badge2": "地图可视化",
  "hero.ip.badge3": "ASN 信息",
  "hero.whois.title": "Whois 域名查询",
  "hero.whois.subtitle": "RDAP + 原始 Whois 数据，支持域名和 IP 查询",
  "hero.whois.badge1": "RDAP 支持",
  "hero.whois.badge2": "查询历史",
  "hero.whois.badge3": "结构化视图",
  "hero.word_counter.title": "文字计数与分析",
  "hero.word_counter.subtitle": "实时统计词数、字符、句子、可读性评分和关键词密度",
  "hero.word_counter.badge1": "可读性评分",
  "hero.word_counter.badge2": "关键词密度",
  "hero.word_counter.badge3": "支持中文",

  "input.hash.placeholder": "在此输入或粘贴要计算哈希的文本…",
  "input.hash.file_label": "或拖放文件计算文件哈希",
  "input.hash.hmac_key": "HMAC 密钥",
  "input.hash.hmac_placeholder": "输入 HMAC 密钥",
  "input.base64.placeholder": "在此输入或粘贴要编码/解码的文本…",
  "input.base64.file_label": "或拖放文件（最大 50MB）",
  "input.base64.mode_encode": "编码",
  "input.base64.mode_decode": "解码",
  "input.url_encode.placeholder": "粘贴要编码/解码的 URL 或文本…",
  "input.url_encode.mode_encode": "编码",
  "input.url_encode.mode_decode": "解码",
  "input.url_encode.batch_hint": "批量模式：每行一个 URL",
  "input.ip.placeholder": "输入 IP 地址或域名（留空查询本机 IP）",
  "input.ip.btn_lookup": "查询",
  "input.ip.btn_my_ip": "我的 IP",
  "input.whois.placeholder": "输入域名（如 example.com）",
  "input.whois.btn_lookup": "查询 Whois",
  "input.word_counter.placeholder": "在此开始输入或粘贴文字…",

  "options.hash.uppercase": "大写输出",
  "options.hash.hmac_mode": "HMAC 模式",
  "options.base64.charset": "字符集",
  "options.base64.newline": "换行符风格",
  "options.base64.each_line": "逐行独立编码",
  "options.base64.split_chunks": "分割为 76 字符行（MIME）",
  "options.base64.url_safe": "URL 安全编码（Base64URL）",
  "options.url_encode.method": "编码方式",
  "options.url_encode.method_component": "encodeURIComponent（推荐）",
  "options.url_encode.method_uri": "encodeURI（完整 URL）",
  "options.url_encode.method_rfc3986": "RFC 3986 严格模式",
  "options.url_encode.batch": "批量模式（每行一个）",
  "options.url_encode.diff": "显示差异高亮",

  "result.hash.copy": "复制",
  "result.hash.copied": "已复制！",
  "result.hash.label_md5": "MD5",
  "result.hash.label_sha1": "SHA-1",
  "result.hash.label_sha256": "SHA-256",
  "result.hash.label_sha512": "SHA-512",
  "result.hash.label_hmac": "HMAC-SHA256",
  "result.base64.output_label": "输出",
  "result.base64.copy": "复制",
  "result.base64.download": "下载 .txt",
  "result.base64.char_count": "{n} 个字符",
  "result.url_encode.output_label": "结果",
  "result.url_encode.copy": "复制",
  "result.ip.my_ip_label": "您的公网 IP",
  "result.ip.country": "国家/地区",
  "result.ip.region": "省份/州",
  "result.ip.city": "城市",
  "result.ip.isp": "运营商",
  "result.ip.asn": "自治系统号",
  "result.ip.timezone": "时区",
  "result.ip.lat_lng": "经纬度坐标",
  "result.whois.tab_structured": "结构化视图",
  "result.whois.tab_raw": "原始数据",
  "result.whois.registrar": "注册商",
  "result.whois.created": "注册时间",
  "result.whois.expires": "到期时间",
  "result.whois.updated": "更新时间",
  "result.whois.nameservers": "域名服务器",
  "result.whois.status": "域名状态",
  "result.word_counter.words": "词数",
  "result.word_counter.characters": "字符数",
  "result.word_counter.chars_no_space": "字符数（不含空格）",
  "result.word_counter.sentences": "句子数",
  "result.word_counter.paragraphs": "段落数",
  "result.word_counter.reading_time": "阅读时间",
  "result.word_counter.speaking_time": "朗读时间",
  "result.word_counter.reading_level": "阅读难度",
  "result.word_counter.flesch_score": "Flesch 评分",
  "result.word_counter.unique_words": "独特词数",
  "result.word_counter.avg_sentence": "平均句子长度",
  "result.word_counter.keyword_density": "关键词密度（前 10）",

  "error.hash.file_too_large": "文件超过 2GB 限制。",
  "error.base64.invalid": "无效的 Base64 字符串，请检查输入内容。",
  "error.base64.file_too_large": "文件超过 50MB 限制。",
  "error.url_encode.empty": "输入为空，请输入 URL 或文本。",
  "error.ip.invalid": "无效的 IP 地址或域名。",
  "error.ip.fetch_fail": "无法获取 IP 信息，请稍后重试。",
  "error.whois.invalid_domain": "请输入有效的域名（如 example.com）。",
  "error.whois.fetch_fail": "Whois 查询失败，该域名可能尚未注册。",
  "error.word_counter.empty": "请输入要分析的文字。",

  "feature.privacy.title": "完全隐私",
  "feature.privacy.desc": "所有处理均在浏览器本地完成，任何数据都不会发送至服务器。",
  "feature.speed.title": "即时结果",
  "feature.speed.desc": "边输入边计算，无需点击按钮，结果实时更新。",
  "feature.free.title": "永久免费",
  "feature.free.desc": "无需注册、无使用限制、无任何隐性收费，随时免费使用。",

  "download.hash.filename": "哈希结果.txt",
  "download.base64.filename": "base64输出.txt",
  "download.word_counter.filename": "文字统计.txt"
}
```

---

## 6. sitemap 新增条目

```xml
<url>
  <loc>https://toolboxnova.com/dev/hash</loc>
  <lastmod>2025-06-15</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>
</url>
<url>
  <loc>https://toolboxnova.com/dev/base64</loc>
  <lastmod>2024-11-20</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>
</url>
<url>
  <loc>https://toolboxnova.com/dev/url-encode</loc>
  <lastmod>2024-03-08</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
<url>
  <loc>https://toolboxnova.com/dev/ip</loc>
  <lastmod>2025-09-12</lastmod>
  <changefreq>daily</changefreq>
  <priority>0.9</priority>
</url>
<url>
  <loc>https://toolboxnova.com/dev/whois</loc>
  <lastmod>2023-07-03</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
<url>
  <loc>https://toolboxnova.com/dev/word-counter</loc>
  <lastmod>2026-01-18</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
```

---

## 7. Header 导航新增子项

```html
{{/* partials/header.html — 在 "开发工具 / Developer Tools" 分组下新增 */}}
<li class="nav-group">
  <a href="#" class="nav-group-title" aria-haspopup="true">
    {{ t "nav.dev_tools" }}
    <svg class="nav-chevron" width="12" height="12" viewBox="0 0 12 12">
      <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none"/>
    </svg>
  </a>
  <ul class="nav-dropdown">
    <li><a href="/dev/hash" class="nav-item"><span class="nav-icon">🔐</span><span>{{ t "nav.dev_hash" }}</span></a></li>
    <li><a href="/dev/base64" class="nav-item"><span class="nav-icon">🔄</span><span>{{ t "nav.dev_base64" }}</span></a></li>
    <li><a href="/dev/url-encode" class="nav-item"><span class="nav-icon">🔗</span><span>{{ t "nav.dev_url_encode" }}</span></a></li>
    <li><a href="/dev/ip" class="nav-item"><span class="nav-icon">🌐</span><span>{{ t "nav.dev_ip" }}</span></a></li>
    <li><a href="/dev/whois" class="nav-item"><span class="nav-icon">🔍</span><span>{{ t "nav.dev_whois" }}</span></a></li>
    <li><a href="/dev/word-counter" class="nav-item"><span class="nav-icon">📝</span><span>{{ t "nav.dev_word_counter" }}</span></a></li>
  </ul>
</li>
```

---

## 8. 主页模块新增子项

```html
{{/* index.html — 开发工具模块区域，新增 6 个工具卡片 */}}

<a href="/dev/hash" class="tool-card tool-card--dev">
  <div class="tool-card__icon" aria-hidden="true">🔐</div>
  <div class="tool-card__body">
    <h3 class="tool-card__name">{{ t "nav.dev_hash" }}</h3>
    <p class="tool-card__desc">MD5 · SHA-256 · SHA-512 · HMAC，一键计算全部算法</p>
  </div>
  <span class="tool-card__badge tool-card__badge--new">New</span>
</a>

<a href="/dev/base64" class="tool-card tool-card--dev">
  <div class="tool-card__icon" aria-hidden="true">🔄</div>
  <div class="tool-card__body">
    <h3 class="tool-card__name">{{ t "nav.dev_base64" }}</h3>
    <p class="tool-card__desc">文本与文件 Base64 编解码，支持 Base64URL</p>
  </div>
</a>

<a href="/dev/url-encode" class="tool-card tool-card--dev">
  <div class="tool-card__icon" aria-hidden="true">🔗</div>
  <div class="tool-card__body">
    <h3 class="tool-card__name">{{ t "nav.dev_url_encode" }}</h3>
    <p class="tool-card__desc">百分号编码/解码，差异高亮 + 批量模式</p>
  </div>
</a>

<a href="/dev/ip" class="tool-card tool-card--dev">
  <div class="tool-card__icon" aria-hidden="true">🌐</div>
  <div class="tool-card__body">
    <h3 class="tool-card__name">{{ t "nav.dev_ip" }}</h3>
    <p class="tool-card__desc">查询公网 IP · 地理位置 · ISP · ASN 地图可视化</p>
  </div>
</a>

<a href="/dev/whois" class="tool-card tool-card--dev">
  <div class="tool-card__icon" aria-hidden="true">🔍</div>
  <div class="tool-card__body">
    <h3 class="tool-card__name">{{ t "nav.dev_whois" }}</h3>
    <p class="tool-card__desc">RDAP + 原始 Whois 数据，支持域名和 IP</p>
  </div>
</a>

<a href="/dev/word-counter" class="tool-card tool-card--dev">
  <div class="tool-card__icon" aria-hidden="true">📝</div>
  <div class="tool-card__body">
    <h3 class="tool-card__name">{{ t "nav.dev_word_counter" }}</h3>
    <p class="tool-card__desc">词数·字符·可读性·关键词密度，支持中英文</p>
  </div>
</a>
```
