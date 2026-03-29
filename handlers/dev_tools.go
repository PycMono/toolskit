package handlers

import (
	"encoding/json"
	"fmt"
	"html/template"
	"io"
	"net"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// FAQ represents a FAQ item for dev tools pages
type DevFAQ struct {
	Q string
	A string
}

// buildDevFAQ returns FAQ items for a given tool and language
func buildDevFAQ(lang, tool string) []DevFAQ {
	faqs := map[string]map[string][]DevFAQ{
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
			"uuid": {
				{Q: "What is the difference between UUID v4 and v7?", A: "UUID v4 is completely random and has no inherent ordering. UUID v7 includes a Unix timestamp in milliseconds prefix, making it time-sortable - ideal for database primary keys where insertion order matters."},
				{Q: "Is a UUID globally unique?", A: "Practically yes. UUID v4 has a collision probability of approximately 1 in 2^122, which is negligible for any real-world application. UUID v7 further reduces collision risk due to its timestamp prefix."},
				{Q: "When should I use UUID v7 instead of v4?", A: "Use UUID v7 for database primary keys, event IDs, or any scenario where time-ordered identifiers improve performance (e.g., B-Tree index efficiency). Use UUID v4 for session tokens, temporary IDs, or when ordering does not matter."},
				{Q: "Are the generated UUIDs cryptographically secure?", A: "Yes. This tool uses crypto.getRandomValues() in your browser, which provides cryptographically secure randomness. However, UUIDs should not be used directly as encryption keys - use a dedicated key derivation function instead."},
				{Q: "Can I generate multiple UUIDs at once?", A: "Yes. You can generate up to 100 UUIDs in a single batch. Select the desired count and click generate."},
			},
			"lorem": {
				{Q: "What is Lorem Ipsum?", A: "Lorem Ipsum is placeholder text derived from a Latin work by Cicero in 45 BC. It has been used as dummy text in the typesetting and printing industry since the 1500s."},
				{Q: "What is the difference between classic and random mode?", A: "Classic mode starts with the traditional Lorem ipsum dolor sit amet... phrase, which is standard in the publishing industry. Random mode generates text from shuffled word dictionaries without a fixed opening, giving a more varied appearance."},
				{Q: "Why do designers use placeholder text?", A: "Placeholder text allows designers to focus on visual elements like layout, typography, and spacing without being distracted by the meaning of actual content. It is replaced with real content once the design is finalized."},
				{Q: "Can I control the type of text generated?", A: "Yes. This tool supports paragraphs, sentences, or words. Paragraph mode is ideal for filling large content areas, while sentence and word modes suit headings, buttons, and navigation elements."},
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
	if langFaqs, ok := faqs[lang]; ok {
		if toolFaqs, ok := langFaqs[tool]; ok {
			return toolFaqs
		}
	}
	// Fallback to English
	if toolFaqs, ok := faqs["en"][tool]; ok {
		return toolFaqs
	}
	return []DevFAQ{}
}

// DevHashPage serves /dev/hash
func DevHashPage(c *gin.Context) {
	t := getT(c)
	lang := getLang(c)
	data := baseData(c, gin.H{
		"Title":       t("seo.hash.title"),
		"Description": t("seo.hash.description"),
		"Keywords":    t("seo.hash.keywords"),
		"Canonical":   "https://toolboxnova.com/dev/hash",
		"HreflangZH":  "https://toolboxnova.com/dev/hash?lang=zh",
		"HreflangEN":  "https://toolboxnova.com/dev/hash?lang=en",
		"OGImage":     "https://toolboxnova.com/static/img/og.png",
		"FAQs":        buildDevFAQ(lang, "hash"),
		"SEOArticle":  template.HTML(t("tools.hash.seo.article")),
		"PageClass":   "page-dev-hash",
		"ToolName":    "hash",
	})
	renderDevTool(c, "dev/hash.html", data)
}

// DevBase64Page serves /dev/base64
func DevBase64Page(c *gin.Context) {
	t := getT(c)
	lang := getLang(c)
	data := baseData(c, gin.H{
		"Title":       t("seo.base64.title"),
		"Description": t("seo.base64.description"),
		"Keywords":    t("seo.base64.keywords"),
		"Canonical":   "https://toolboxnova.com/dev/base64",
		"HreflangZH":  "https://toolboxnova.com/dev/base64?lang=zh",
		"HreflangEN":  "https://toolboxnova.com/dev/base64?lang=en",
		"OGImage":     "https://toolboxnova.com/static/img/og.png",
		"FAQs":        buildDevFAQ(lang, "base64"),
		"SEOArticle":  template.HTML(t("tools.base64.seo.article")),
		"PageClass":   "page-dev-base64",
		"ToolName":    "base64",
	})
	renderDevTool(c, "dev/base64.html", data)
}

// DevURLEncodePage serves /dev/url-encode
func DevURLEncodePage(c *gin.Context) {
	t := getT(c)
	lang := getLang(c)
	data := baseData(c, gin.H{
		"Title":       t("seo.url_encode.title"),
		"Description": t("seo.url_encode.description"),
		"Keywords":    t("seo.url_encode.keywords"),
		"Canonical":   "https://toolboxnova.com/dev/url-encode",
		"HreflangZH":  "https://toolboxnova.com/dev/url-encode?lang=zh",
		"HreflangEN":  "https://toolboxnova.com/dev/url-encode?lang=en",
		"OGImage":     "https://toolboxnova.com/static/img/og.png",
		"FAQs":        buildDevFAQ(lang, "url_encode"),
		"SEOArticle":  template.HTML(t("tools.url_encode.seo.article")),
		"PageClass":   "page-dev-url-encode",
		"ToolName":    "url-encode",
	})
	renderDevTool(c, "dev/url-encode.html", data)
}

// DevIPPage serves /dev/ip
func DevIPPage(c *gin.Context) {
	t := getT(c)
	lang := getLang(c)
	data := baseData(c, gin.H{
		"Title":       t("seo.ip.title"),
		"Description": t("seo.ip.description"),
		"Keywords":    t("seo.ip.keywords"),
		"Canonical":   "https://toolboxnova.com/dev/ip",
		"HreflangZH":  "https://toolboxnova.com/dev/ip?lang=zh",
		"HreflangEN":  "https://toolboxnova.com/dev/ip?lang=en",
		"OGImage":     "https://toolboxnova.com/static/img/og.png",
		"FAQs":        buildDevFAQ(lang, "ip"),
		"SEOArticle":  template.HTML(t("tools.ip.seo.article")),
		"PageClass":   "page-dev-ip",
		"ToolName":    "ip",
	})
	renderDevTool(c, "dev/ip.html", data)
}

// DevWhoisPage serves /dev/whois
func DevWhoisPage(c *gin.Context) {
	t := getT(c)
	lang := getLang(c)
	data := baseData(c, gin.H{
		"Title":       t("seo.whois.title"),
		"Description": t("seo.whois.description"),
		"Keywords":    t("seo.whois.keywords"),
		"Canonical":   "https://toolboxnova.com/dev/whois",
		"HreflangZH":  "https://toolboxnova.com/dev/whois?lang=zh",
		"HreflangEN":  "https://toolboxnova.com/dev/whois?lang=en",
		"OGImage":     "https://toolboxnova.com/static/img/og.png",
		"FAQs":        buildDevFAQ(lang, "whois"),
		"SEOArticle":  template.HTML(t("tools.whois.seo.article")),
		"PageClass":   "page-dev-whois",
		"ToolName":    "whois",
	})
	renderDevTool(c, "dev/whois.html", data)
}

// DevWordCounterPage serves /dev/word-counter
func DevWordCounterPage(c *gin.Context) {
	t := getT(c)
	lang := getLang(c)
	data := baseData(c, gin.H{
		"Title":       t("seo.word_counter.title"),
		"Description": t("seo.word_counter.description"),
		"Keywords":    t("seo.word_counter.keywords"),
		"Canonical":   "https://toolboxnova.com/dev/word-counter",
		"HreflangZH":  "https://toolboxnova.com/dev/word-counter?lang=zh",
		"HreflangEN":  "https://toolboxnova.com/dev/word-counter?lang=en",
		"OGImage":     "https://toolboxnova.com/static/img/og.png",
		"FAQs":        buildDevFAQ(lang, "word_counter"),
		"SEOArticle":  template.HTML(t("tools.word_counter.seo.article")),
		"PageClass":   "page-dev-word-counter",
		"ToolName":    "word-counter",
	})
	renderDevTool(c, "dev/word-counter.html", data)
}

// ─────────────────────────────────────────────────────────────
// Whois API proxy
// ─────────────────────────────────────────────────────────────

type WhoisParsed struct {
	Registrar      string   `json:"registrar"`
	CreationDate   string   `json:"creationDate"`
	ExpirationDate string   `json:"expirationDate"`
	UpdatedDate    string   `json:"updatedDate"`
	Status         []string `json:"status"`
	NameServers    []string `json:"nameServers"`
	Registrant     string   `json:"registrant"`
}

type WhoisResult struct {
	Raw    string      `json:"raw"`
	Parsed WhoisParsed `json:"parsed"`
}

// WhoisAPI handles /api/whois?domain=xxx
func WhoisAPI(c *gin.Context) {
	domain := strings.TrimSpace(c.Query("domain"))
	if domain == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "domain required"})
		return
	}

	result, err := whoisLookup(domain)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, result)
}

// whoisLookup tries RDAP first, falls back to raw TCP whois
func whoisLookup(domain string) (*WhoisResult, error) {
	// 1. Try RDAP
	rdapURL := "https://rdap.org/domain/" + domain
	client := &http.Client{Timeout: 8 * time.Second}
	resp, err := client.Get(rdapURL)
	if err == nil && resp.StatusCode == 200 {
		defer resp.Body.Close()
		body, _ := io.ReadAll(resp.Body)
		parsed := parseRDAP(body)
		return &WhoisResult{
			Raw:    string(body),
			Parsed: parsed,
		}, nil
	}

	// 2. Fallback: raw Whois via TCP port 43
	raw, err := rawWhoisLookup(domain)
	if err != nil {
		return nil, fmt.Errorf("whois lookup failed: %w", err)
	}
	parsed := parseRawWhois(raw)
	return &WhoisResult{Raw: raw, Parsed: parsed}, nil
}

// parseRDAP parses RDAP JSON response into WhoisParsed
func parseRDAP(body []byte) WhoisParsed {
	var data map[string]interface{}
	if err := json.Unmarshal(body, &data); err != nil {
		return WhoisParsed{}
	}

	p := WhoisParsed{}

	// Events
	if events, ok := data["events"].([]interface{}); ok {
		for _, ev := range events {
			if e, ok := ev.(map[string]interface{}); ok {
				action, _ := e["eventAction"].(string)
				date, _ := e["eventDate"].(string)
				switch action {
				case "registration":
					p.CreationDate = date
				case "expiration":
					p.ExpirationDate = date
				case "last changed":
					p.UpdatedDate = date
				}
			}
		}
	}

	// Entities (registrar, registrant)
	if entities, ok := data["entities"].([]interface{}); ok {
		for _, ent := range entities {
			if e, ok := ent.(map[string]interface{}); ok {
				roles, _ := e["roles"].([]interface{})
				for _, role := range roles {
					if role == "registrar" {
						if vcardArray, ok := e["vcardArray"].([]interface{}); ok && len(vcardArray) > 1 {
							if vcards, ok := vcardArray[1].([]interface{}); ok {
								for _, vc := range vcards {
									if fields, ok := vc.([]interface{}); ok && len(fields) >= 4 {
										if fields[0] == "fn" {
											p.Registrar, _ = fields[3].(string)
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}

	// Status
	if statuses, ok := data["status"].([]interface{}); ok {
		for _, s := range statuses {
			if sv, ok := s.(string); ok {
				p.Status = append(p.Status, sv)
			}
		}
	}

	// Nameservers
	if nss, ok := data["nameservers"].([]interface{}); ok {
		for _, ns := range nss {
			if nsMap, ok := ns.(map[string]interface{}); ok {
				if ldhName, ok := nsMap["ldhName"].(string); ok {
					p.NameServers = append(p.NameServers, strings.ToLower(ldhName))
				}
			}
		}
	}

	return p
}

// rawWhoisLookup performs a raw TCP whois query
func rawWhoisLookup(domain string) (string, error) {
	server := whoisServer(domain)
	conn, err := net.DialTimeout("tcp", server+":43", 5*time.Second)
	if err != nil {
		return "", err
	}
	defer conn.Close()
	conn.SetDeadline(time.Now().Add(8 * time.Second))
	fmt.Fprintf(conn, "%s\r\n", domain)
	b, err := io.ReadAll(conn)
	if err != nil {
		return "", err
	}
	return string(b), nil
}

// whoisServer returns the best whois server for a given domain
func whoisServer(domain string) string {
	tld := domain
	if idx := strings.LastIndex(domain, "."); idx >= 0 {
		tld = domain[idx+1:]
	}
	servers := map[string]string{
		"com": "whois.verisign-grs.com",
		"net": "whois.verisign-grs.com",
		"org": "whois.pir.org",
		"io":  "whois.nic.io",
		"co":  "whois.nic.co",
		"cn":  "whois.cnnic.cn",
		"uk":  "whois.nic.uk",
		"de":  "whois.denic.de",
		"jp":  "whois.jprs.jp",
		"fr":  "whois.nic.fr",
		"au":  "whois.auda.org.au",
		"ru":  "whois.tcinet.ru",
	}
	if s, ok := servers[strings.ToLower(tld)]; ok {
		return s
	}
	return "whois.iana.org"
}

// parseRawWhois parses raw whois text into WhoisParsed
func parseRawWhois(raw string) WhoisParsed {
	p := WhoisParsed{}
	regs := map[string]*regexp.Regexp{
		"registrar":       regexp.MustCompile(`(?i)registrar:\s*(.+)`),
			"creation":   regexp.MustCompile(`(?i)(?:creation date|created):\s*(.+)`),
			"expiration": regexp.MustCompile(`(?i)(?:expiry date|expiration date|expires):\s*(.+)`),
			"updated":    regexp.MustCompile(`(?i)(?:updated date|last modified|last-modified):\s*(.+)`),
		"status":          regexp.MustCompile(`(?i)domain status:\s*(.+)`),
		"nameserver":      regexp.MustCompile(`(?i)name server:\s*(.+)`),
	}

	for _, line := range strings.Split(raw, "\n") {
		line = strings.TrimSpace(line)
		if m := regs["registrar"].FindStringSubmatch(line); m != nil && p.Registrar == "" {
			p.Registrar = strings.TrimSpace(m[1])
		}
		if m := regs["creation"].FindStringSubmatch(line); m != nil && p.CreationDate == "" {
			p.CreationDate = strings.TrimSpace(m[1])
		}
		if m := regs["expiration"].FindStringSubmatch(line); m != nil && p.ExpirationDate == "" {
			p.ExpirationDate = strings.TrimSpace(m[1])
		}
		if m := regs["updated"].FindStringSubmatch(line); m != nil && p.UpdatedDate == "" {
			p.UpdatedDate = strings.TrimSpace(m[1])
		}
		if m := regs["status"].FindStringSubmatch(line); m != nil {
			p.Status = append(p.Status, strings.TrimSpace(m[1]))
		}
		if m := regs["nameserver"].FindStringSubmatch(line); m != nil {
			p.NameServers = append(p.NameServers, strings.ToLower(strings.TrimSpace(m[1])))
		}
	}
	return p
}

// renderDevTool renders a dev tool page using the base template
func renderDevTool(c *gin.Context, page string, data gin.H) {
	render(c, page, data)
}

// ─────────────────────────────────────────────────────────────
//
//	UUID Generator & Lorem Ipsum (client-side, handlers only)
//
// ─────────────────────────────────────────────────────────────

// DevUUIDPage serves /dev/uuid
func DevUUIDPage(c *gin.Context) {
	t := getT(c)
	lang := getLang(c)
	data := baseData(c, gin.H{
		"Title":       t("seo.uuid.title"),
		"Description": t("seo.uuid.description"),
		"Keywords":    t("seo.uuid.keywords"),
		"Canonical":   "https://toolboxnova.com/dev/uuid",
		"HreflangZH":  "https://toolboxnova.com/dev/uuid?lang=zh",
		"HreflangEN":  "https://toolboxnova.com/dev/uuid?lang=en",
		"OGImage":     "https://toolboxnova.com/static/img/og.png",
		"FAQs":        buildDevFAQ(lang, "uuid"),
		"PageClass":   "page-dev-uuid",
		"ToolName":    "uuid",
	})
	renderDevTool(c, "dev/uuid.html", data)
}

// DevLoremPage serves /dev/lorem
func DevLoremPage(c *gin.Context) {
	t := getT(c)
	lang := getLang(c)
	data := baseData(c, gin.H{
		"Title":       t("seo.lorem.title"),
		"Description": t("seo.lorem.description"),
		"Keywords":    t("seo.lorem.keywords"),
		"Canonical":   "https://toolboxnova.com/dev/lorem",
		"HreflangZH":  "https://toolboxnova.com/dev/lorem?lang=zh",
		"HreflangEN":  "https://toolboxnova.com/dev/lorem?lang=en",
		"OGImage":     "https://toolboxnova.com/static/img/og.png",
		"FAQs":        buildDevFAQ(lang, "lorem"),
		"PageClass":   "page-dev-lorem",
		"ToolName":    "lorem",
	})
	renderDevTool(c, "dev/lorem.html", data)
}

// DevAESPage serves /dev/aes - AES encryption/decryption tool
func DevAESPage(c *gin.Context) {
	t := getT(c)
	lang := getLang(c)
	data := baseData(c, gin.H{
		"Title":       t("seo.aes.title"),
		"Description": t("seo.aes.description"),
		"Keywords":    t("seo.aes.keywords"),
		"Canonical":   "https://toolboxnova.com/dev/aes",
		"HreflangZH":  "https://toolboxnova.com/dev/aes?lang=zh",
		"HreflangEN":  "https://toolboxnova.com/dev/aes?lang=en",
		"OGImage":     "https://toolboxnova.com/static/img/og.png",
		"FAQs":        buildDevFAQ(lang, "aes"),
		"PageClass":   "page-dev-aes",
		"ToolName":    "aes",
	})
	renderDevTool(c, "dev/aes.html", data)
}

// DevHTMLEntitiesPage serves /dev/html-entities - HTML entity encoding/decoding tool
func DevHTMLEntitiesPage(c *gin.Context) {
	t := getT(c)
	lang := getLang(c)
	data := baseData(c, gin.H{
		"Title":       t("seo.html_entities.title"),
		"Description": t("seo.html_entities.description"),
		"Keywords":    t("seo.html_entities.keywords"),
		"Canonical":   "https://toolboxnova.com/dev/html-entities",
		"HreflangZH":  "https://toolboxnova.com/dev/html-entities?lang=zh",
		"HreflangEN":  "https://toolboxnova.com/dev/html-entities?lang=en",
		"OGImage":     "https://toolboxnova.com/static/img/og.png",
		"FAQs":        buildDevFAQ(lang, "html_entities"),
		"PageClass":   "page-dev-html-entities",
		"ToolName":    "html_entities",
	})
	renderDevTool(c, "dev/html_entities.html", data)
}

// DevDiffPage serves /dev/diff - Text diff checker tool
func DevDiffPage(c *gin.Context) {
	t := getT(c)
	lang := getLang(c)
	data := baseData(c, gin.H{
		"Title":       t("seo.diff.title"),
		"Description": t("seo.diff.description"),
		"Keywords":    t("seo.diff.keywords"),
		"Canonical":   "https://toolboxnova.com/dev/diff",
		"HreflangZH":  "https://toolboxnova.com/dev/diff?lang=zh",
		"HreflangEN":  "https://toolboxnova.com/dev/diff?lang=en",
		"OGImage":     "https://toolboxnova.com/static/img/og.png",
		"FAQs":        buildDevFAQ(lang, "diff"),
		"PageClass":   "page-dev-diff",
		"ToolName":    "diff",
	})
	renderDevTool(c, "dev/diff.html", data)
}

