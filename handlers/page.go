package handlers

import (
	"html/template"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// getT extracts the translation function from context
func getT(c *gin.Context) func(string) string {
	if v, exists := c.Get("T"); exists {
		if fn, ok := v.(func(string) string); ok {
			return fn
		}
	}
	return func(key string) string { return key }
}

func getLang(c *gin.Context) string {
	if v, exists := c.Get("lang"); exists {
		if lang, ok := v.(string); ok {
			return lang
		}
	}
	return "zh"
}

func getTranslations(c *gin.Context) map[string]string {
	if v, exists := c.Get("translations"); exists {
		if t, ok := v.(map[string]string); ok {
			return t
		}
	}
	return map[string]string{}
}

func baseData(c *gin.Context, extraData gin.H) gin.H {
	t := getT(c)
	lang := getLang(c)
	translations := getTranslations(c)
	data := gin.H{
		"Lang":         lang,
		"T":            t,
		"Translations": translations,
		"CurrentPath":  c.Request.URL.Path,
		"CurrentURL":   c.Request.URL.String(),
		// Ads (injected by middleware.AdsConfig)
		"AdsClientID": c.GetString("AdsClientID"),
		"AdsEnabled":  c.GetBool("AdsEnabled"),
		// Google Analytics (injected by middleware.GAConfig)
		"GAMeasurementID": c.GetString("GAMeasurementID"),
		"EnableGA":        c.GetBool("EnableGA"),
		// Google Ads Conversion Tracking
		"GoogleAdsConversionID":    c.GetString("GoogleAdsConversionID"),
		"GoogleAdsConversionLabel": c.GetString("GoogleAdsConversionLabel"),
		// Asset version for cache busting (injected by middleware.AdsConfig or set globally)
		"AssetVer": c.GetString("AssetVersion"),
		// Cookie Consent (injected by middleware.ConsentMiddleware)
		"ConsentHasDecision": c.GetBool("ConsentHasDecision"),
		"ConsentAnalytics":   c.GetString("ConsentAnalytics"),
		"ConsentAds":         c.GetString("ConsentAds"),
		"ConsentCookieName":  c.GetString("ConsentCookieName"),
		// Social Media Links
		"TwitterURL":  c.GetString("TwitterURL"),
		"GitHubURL":   c.GetString("GitHubURL"),
		"LinkedInURL": c.GetString("LinkedInURL"),
		// Newsletter
		"NewsletterEnabled":  c.GetBool("NewsletterEnabled"),
		"NewsletterProvider": c.GetString("NewsletterProvider"),
	}
	for k, v := range extraData {
		data[k] = v
	}
	return data
}

// IndexPage renders the homepage
func IndexPage(c *gin.Context) {
	t := getT(c)
	lang := getLang(c)

	// WebSite + Organization structured data for SEO
	jsonld := `{
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "WebSite",
				"name": "Tool Box Nova",
				"url": "https://toolboxnova.com",
				"description": "` + t("home.hero_sub") + `",
				"potentialAction": {
					"@type": "SearchAction",
					"target": "https://toolboxnova.com/?q={search_term_string}",
					"query-input": "required name=search_term_string"
				}
			},
			{
				"@type": "Organization",
				"name": "Tool Box Nova",
				"url": "https://toolboxnova.com",
				"logo": "https://toolboxnova.com/static/img/logo.svg",
				"sameAs": []
			}
		]
	}`

	// Build hreflang map for homepage
	hreflangMap := map[string]string{
		"en":  "https://toolboxnova.com/?lang=en",
		"zh":  "https://toolboxnova.com/?lang=zh",
		"ja":  "https://toolboxnova.com/?lang=ja",
		"ko":  "https://toolboxnova.com/?lang=ko",
		"spa": "https://toolboxnova.com/?lang=spa",
	}

	// Homepage FAQ items
	type FAQItem struct {
		Q, A string
	}
	faqs := []FAQItem{
		{Q: t("home.faq.q1"), A: t("home.faq.a1")},
		{Q: t("home.faq.q2"), A: t("home.faq.a2")},
		{Q: t("home.faq.q3"), A: t("home.faq.a3")},
		{Q: t("home.faq.q4"), A: t("home.faq.a4")},
		{Q: t("home.faq.q5"), A: t("home.faq.a5")},
	}

	// Build FAQPage JSON-LD for structured data
	faqJSONLD := `{
		"@context": "https://schema.org",
		"@type": "FAQPage",
		"mainEntity": [`
	for i, faq := range faqs {
		if i > 0 {
			faqJSONLD += ","
		}
		faqJSONLD += `{
			"@type": "Question",
			"name": "` + strings.ReplaceAll(faq.Q, `"`, `\"`) + `",
			"acceptedAnswer": {
				"@type": "Answer",
				"text": "` + strings.ReplaceAll(faq.A, `"`, `\"`) + `"
			}
		}`
	}
	faqJSONLD += `]
	}`

	// Combine with existing JSON-LD
	combinedJSONLD := jsonld[:len(jsonld)-3] + `,
		{
			"@type": "FAQPage",
			"mainEntity": ` + faqJSONLD[strings.Index(faqJSONLD, "["):] + `
		}
	]
}`

	data := baseData(c, gin.H{
		"Title":       t("home.title") + " | Tool Box Nova",
		"Description": t("home.hero_sub"),
		"Keywords":    "online tools, developer tools, privacy tools, SMS receiver, temporary email, password generator",
		"PageClass":   "page-home",
		"JSONLD":      template.HTML(combinedJSONLD),
		"HreflangMap": hreflangMap,
		"Lang":        lang,
		"FAQs":        faqs,
	})
	render(c, "index.html", data)
}

// AboutPage renders the about page
func AboutPage(c *gin.Context) {
	t := getT(c)
	data := baseData(c, gin.H{
		"Title":       t("about.title"),
		"Description": "Learn more about Tool Box Nova - your free privacy tool collection.",
		"Keywords":    "about toolboxnova, privacy tools, free online tools",
		"PageClass":   "page-about",
	})
	render(c, "about.html", data)
}

// PrivacyPage renders privacy policy
func PrivacyPage(c *gin.Context) {
	t := getT(c)
	data := baseData(c, gin.H{
		"Title":       t("privacy.title"),
		"Description": "Tool Box Nova Privacy Policy - we never store your data.",
		"Keywords":    "privacy policy, data protection, toolboxnova",
		"PageClass":   "page-privacy",
	})
	render(c, "privacy.html", data)
}

// TermsPage renders terms of service
func TermsPage(c *gin.Context) {
	t := getT(c)
	data := baseData(c, gin.H{
		"Title":       t("terms.title"),
		"Description": "Tool Box Nova Terms of Service.",
		"Keywords":    "terms of service, user agreement, toolboxnova",
		"PageClass":   "page-terms",
	})
	render(c, "terms.html", data)
}

// ContactPage renders contact page
func ContactPage(c *gin.Context) {
	t := getT(c)
	data := baseData(c, gin.H{
		"Title":       t("contact.title"),
		"Description": "Contact Tool Box Nova team.",
		"Keywords":    "contact, support, toolboxnova",
		"PageClass":   "page-contact",
	})
	render(c, "contact.html", data)
}

// SitemapPage renders the HTML sitemap page
func SitemapPage(c *gin.Context) {
	t := getT(c)
	data := baseData(c, gin.H{
		"Title":       t("sitemap.title"),
		"Description": "Tool Box Nova sitemap - all pages and tools.",
		"Keywords":    "sitemap, toolboxnova",
		"PageClass":   "page-sitemap",
	})
	render(c, "sitemap.html", data)
}

// SitemapXML generates the XML sitemap
func SitemapXML(c *gin.Context) {
	routes := []string{
		"/", "/about", "/privacy-policy",
		"/terms-of-service", "/contact", "/sitemap",
		
		// SMS Receiver (S-01)
		"/sms", "/sms/buy", "/sms/prices", "/sms/login", "/sms/register",
		
                // Privacy Tools
                "/virtual-address", "/password-generator", "/temp-email", "/proxy",
                "/privacy/check",

                // Weather Tools
                "/weather/query",
		
		// AI Lab
		"/ai/detector",
		"/ai/detector?lang=en", "/ai/detector?lang=zh",
		"/ai/detector?lang=ja", "/ai/detector?lang=ko", "/ai/detector?lang=es",
		// AI Humanizer (new)
		"/ai/humanizer",
		"/ai/humanizer?lang=en", "/ai/humanizer?lang=zh",
		"/ai/humanizer?lang=ja", "/ai/humanizer?lang=ko", "/ai/humanizer?lang=spa",
		// AI Competitive Analysis
		"/ai/compete",
		"/ai/compete?lang=en", "/ai/compete?lang=zh",
		"/ai/compete?lang=ja", "/ai/compete?lang=ko", "/ai/compete?lang=spa",

		// Dev Tools
		"/tools", "/tools/json", "/tools/json-formatter", "/tools/json-validator",
		"/tools/regex", "/tools/markdown", "/tools/timestamp",
		"/tools/base-converter", "/tools/case-converter",

		// Media / Multimedia Tools
		"/media/image-compress", "/img/compress",
		"/media/image-resize", "/img/resize",
		"/img/metadata", "/media/image-metadata",
		"/media/qr",

		// Image Toolbox
		"/img/crop", "/img/convert-to-jpg", "/img/jpg-to-image",
		"/img/photo-editor", "/img/remove-bg", "/img/watermark", "/img/rotate",

		// JSON Toolkit
		"/json",
		"/json/validate", "/json/repair", "/json/pretty", "/json/minify",
		"/json/sort-keys", "/json/escape", "/json/unescape", "/json/stringify",
		"/json/tree", "/json/table", "/json/diff", "/json/path",
		"/json/search", "/json/size", "/json/flatten",
		"/json/to-csv", "/json/from-csv", "/json/to-yaml", "/json/from-yaml",
		"/json/to-xml", "/json/from-xml", "/json/to-sql", "/json/from-sql",
		"/json/to-markdown", "/json/to-excel", "/json/from-excel",
		"/json/to-typescript", "/json/to-python", "/json/to-java",
		"/json/to-csharp", "/json/to-go", "/json/to-kotlin",
		"/json/to-swift", "/json/to-rust", "/json/to-php",
		"/json/schema-validate", "/json/schema-generate",
		"/json/base64", "/json/jwt", "/json/jsonc", "/json/token-count",

		// JSON Learn & Datasets
		"/json/learn", "/json/datasets",
		// Basics (10)
		"/json/learn/what-is-json", "/json/learn/json-syntax-rules", "/json/learn/json-data-types",
		"/json/learn/json-objects", "/json/learn/json-arrays",
		"/json/learn/json-strings-escaping", "/json/learn/json-numbers-booleans-null",
		"/json/learn/json-nesting", "/json/learn/first-json-file", "/json/learn/json-formatting-beautify",
		// Multi-Language (10)
		"/json/learn/python-json", "/json/learn/javascript-json", "/json/learn/java-json",
		"/json/learn/go-json", "/json/learn/php-json", "/json/learn/csharp-json",
		"/json/learn/ruby-json", "/json/learn/rust-json", "/json/learn/swift-json", "/json/learn/typescript-json",
		// Debugging (6)
		"/json/learn/common-json-mistakes", "/json/learn/json-parse-errors",
		"/json/learn/unexpected-token", "/json/learn/unexpected-end-of-json",
		"/json/learn/json-syntax-error-debug", "/json/learn/json-debug-tools",
		// Comparison (5)
		"/json/learn/json-vs-xml", "/json/learn/json-vs-yaml", "/json/learn/json-vs-csv",
		"/json/learn/json-vs-protobuf", "/json/learn/json5-jsonc",
		// Advanced Topics (10)
		"/json/learn/json-schema-intro", "/json/learn/json-schema-advanced",
		"/json/learn/jsonpath", "/json/learn/jq-guide", "/json/learn/jwt",
		"/json/learn/json-ld", "/json/learn/json-patch", "/json/learn/json-pointer",
		"/json/learn/ndjson", "/json/learn/geojson",
		// Security & Performance (5)
		"/json/learn/json-security", "/json/learn/json-injection", "/json/learn/json-performance",
		"/json/learn/json-streaming", "/json/learn/json-compression",
		// Practical Applications (7)
		"/json/learn/mongodb-json", "/json/learn/postgresql-json", "/json/learn/elasticsearch-json",
		"/json/learn/rest-api-json", "/json/learn/graphql-json",
		"/json/learn/json-config", "/json/learn/json-ai-llm",

		// Developer Tools Suite
		"/dev/hash", "/dev/base64", "/dev/url-encode",
		"/dev/ip", "/dev/whois", "/dev/word-counter",
			"/dev/uuid", "/dev/lorem",

		// Color Tools Suite
		"/color/tools",
		"/color/picker", "/color/palette", "/color/wheel",
		"/color/converter", "/color/contrast", "/color/gradient",
		"/color/image-picker", "/color/blindness", "/color/names",
		"/color/mixer", "/color/tailwind",
	}
	
	c.Header("Content-Type", "application/xml")
	xml := "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n"
	siteURL := "https://toolboxnova.com"
	lastMod := time.Now().Format("2006-01-02")
	
	for _, r := range routes {
		priority := "0.8"
		changefreq := "weekly"
		
		// 首页最高优先级
		if r == "/" {
			priority = "1.0"
		} else if r == "/sms" || r == "/sms/buy" {
			// SMS 主页和购买页优先级
			priority = "0.9"
			changefreq = "daily"
		} else if r == "/sms/prices" {
			priority = "0.85"
			changefreq = "daily"
		} else if r == "/tools/json" || r == "/tools" || r == "/ai/detector" {
			priority = "0.9"
		} else if r == "/media/qr" {
			priority = "0.9"
		} else if r == "/media/image-compress" || r == "/img/compress" ||
			r == "/media/image-resize" || r == "/img/resize" ||
			r == "/img/metadata" || r == "/media/image-metadata" {
			priority = "0.85"
		} else if r == "/img/crop" || r == "/img/convert-to-jpg" || r == "/img/jpg-to-image" ||
			r == "/img/photo-editor" || r == "/img/remove-bg" ||
			r == "/img/watermark" || r == "/img/rotate" {
			priority = "0.9"
		} else if r == "/json" {
			priority = "0.9"
		} else if r == "/json/validate" || r == "/json/diff" || r == "/json/pretty" ||
			r == "/json/jwt" || r == "/json/to-typescript" || r == "/json/to-yaml" ||
			r == "/json/schema-validate" || r == "/json/repair" {
			priority = "0.85"
		} else if r == "/dev/hash" || r == "/dev/base64" || r == "/dev/ip" {
			priority = "0.9"
		} else if r == "/dev/url-encode" || r == "/dev/whois" || r == "/dev/word-counter" {
			priority = "0.8"
		} else if r == "/color/tools" {
			priority = "0.9"
		} else if r == "/color/picker" || r == "/color/palette" || r == "/color/converter" ||
			r == "/color/contrast" || r == "/color/gradient" || r == "/color/image-picker" {
			priority = "0.85"
		} else if r == "/color/wheel" || r == "/color/blindness" || r == "/color/names" ||
			r == "/color/mixer" || r == "/color/tailwind" {
			priority = "0.8"
		} else if r == "/json/learn" || r == "/json/datasets" {
			priority = "0.9"
		} else if len(r) > 11 && r[:11] == "/json/learn" {
			priority = "0.8"
		}
		
		xml += "  <url>\n"
		xml += "    <loc>" + siteURL + r + "</loc>\n"
		xml += "    <lastmod>" + lastMod + "</lastmod>\n"
		xml += "    <changefreq>" + changefreq + "</changefreq>\n"
		xml += "    <priority>" + priority + "</priority>\n"
		xml += "  </url>\n"
		
		// 为 SMS 主页添加多语言版本
		if r == "/sms" || r == "/sms/buy" || r == "/sms/prices" {
			for _, lang := range []string{"en", "zh"} {
				xml += "  <url>\n"
				xml += "    <loc>" + siteURL + r + "?lang=" + lang + "</loc>\n"
				xml += "    <lastmod>" + lastMod + "</lastmod>\n"
				xml += "    <changefreq>" + changefreq + "</changefreq>\n"
				xml += "    <priority>0.85</priority>\n"
				xml += "  </url>\n"
			}
		}

		// 为多媒体和 QR 工具添加多语言版本
		if r == "/media/qr" || r == "/img/metadata" || r == "/media/image-compress" ||
			r == "/media/image-resize" {
			for _, lang := range []string{"zh", "en"} {
				xml += "  <url>\n"
				xml += "    <loc>" + siteURL + r + "?lang=" + lang + "</loc>\n"
				xml += "    <lastmod>" + lastMod + "</lastmod>\n"
				xml += "    <changefreq>" + changefreq + "</changefreq>\n"
				xml += "    <priority>0.80</priority>\n"
				xml += "  </url>\n"
			}
		}

		// 为 Color 工具添加多语言版本
		if r == "/color/tools" || r == "/color/picker" || r == "/color/palette" ||
			r == "/color/converter" || r == "/color/contrast" || r == "/color/gradient" ||
			r == "/color/image-picker" {
			for _, lang := range []string{"zh", "en"} {
				xml += "  <url>\n"
				xml += "    <loc>" + siteURL + r + "?lang=" + lang + "</loc>\n"
				xml += "    <lastmod>" + lastMod + "</lastmod>\n"
				xml += "    <changefreq>" + changefreq + "</changefreq>\n"
				xml += "    <priority>0.80</priority>\n"
				xml += "  </url>\n"
			}
		}
	}
	
	xml += "</urlset>"
	c.String(http.StatusOK, xml)
}

// RobotsTxt returns robots.txt
func RobotsTxt(c *gin.Context) {
	robots := `User-agent: *
Allow: /

# Disallow API endpoints (no SEO value)
Disallow: /api/

# Disallow admin/auth pages
Disallow: /sms/login
Disallow: /sms/register
Disallow: /sms/buy/success
Disallow: /sms/buy/cancel

# Sitemap
Sitemap: https://toolboxnova.com/sitemap.xml

# Crawl-delay (optional, for politeness)
Crawl-delay: 1
`
	c.String(http.StatusOK, robots)
}

// SearchAPI returns search results
func SearchAPI(c *gin.Context) {
	q := strings.ToLower(c.Query("q"))
	if q == "" {
		c.JSON(http.StatusOK, gin.H{"results": []interface{}{}})
		return
	}
	tools := []gin.H{
		{"name_zh": "SMS 接码平台", "name_en": "SMS Receiver", "description": "Receive SMS online for free", "url": "/sms", "search": "sms 接码平台 receiver phone"},
		{"name_zh": "全球虚拟地址", "name_en": "Virtual Address Generator", "description": "Generate fake addresses", "url": "/virtual-address", "search": "virtual address 虚拟地址 fake identity"},
		{"name_zh": "随机密码生成器", "name_en": "Password Generator", "description": "Generate secure passwords", "url": "/password-generator", "search": "password generator 密码 random secure"},
		{"name_zh": "匿名临时邮箱", "name_en": "Temporary Email", "description": "Disposable email address", "url": "/temp-email", "search": "temp email 临时邮箱 temporary disposable"},
		{"name_zh": "匿名代理", "name_en": "Anonymous Proxy", "description": "Browse anonymously", "url": "/proxy", "search": "proxy 代理 anonymous vpn"},
		{"name_zh": "图片压缩", "name_en": "Image Compress", "description": "Compress images online, supports JPG/PNG/WebP", "url": "/media/image-compress", "search": "image compress 图片 压缩 media jpg png webp"},
		{"name_zh": "图片调整大小", "name_en": "Image Resizer", "description": "Resize images online, supports pixel/percent/presets", "url": "/media/image-resize", "search": "image resize 调整大小 尺寸 图片 png jpg"},
		{"name_zh": "图片元数据查看", "name_en": "Image Metadata Viewer", "description": "View EXIF, GPS, IPTC metadata from images", "url": "/img/metadata", "search": "exif metadata 元数据 gps iptc image photo 图片"},
		{"name_zh": "二维码生成器", "name_en": "QR Code Generator", "description": "Generate free QR codes for URLs, WiFi, vCard, SMS and more", "url": "/media/qr", "search": "qr code 二维码 generator wifi vcard url sms bitcoin"},
		// JSON Toolkit
		{"name_zh": "JSON 验证器", "name_en": "JSON Validator", "description": "Validate JSON online with error highlighting", "url": "/json/validate", "search": "json validator 验证 lint format"},
		{"name_zh": "JSON 美化", "name_en": "JSON Pretty Print", "description": "Format and pretty print JSON", "url": "/json/pretty", "search": "json format pretty print beautify 格式化"},
		{"name_zh": "JSON 压缩", "name_en": "JSON Minify", "description": "Compress JSON by removing whitespace", "url": "/json/minify", "search": "json minify compress 压缩"},
		{"name_zh": "JSON 修复", "name_en": "JSON Repair", "description": "Auto-fix broken JSON", "url": "/json/repair", "search": "json repair fix 修复"},
		{"name_zh": "JSON 对比", "name_en": "JSON Diff", "description": "Compare two JSON objects side-by-side", "url": "/json/diff", "search": "json diff compare 对比 差异"},
		{"name_zh": "JSON 树形查看", "name_en": "JSON Tree Viewer", "description": "Interactive collapsible tree visualization", "url": "/json/tree", "search": "json tree viewer 树形 可视化"},
		{"name_zh": "JSON 转 TypeScript", "name_en": "JSON to TypeScript", "description": "Generate TypeScript interfaces from JSON", "url": "/json/to-typescript", "search": "json typescript interface type 代码生成"},
		{"name_zh": "JSON 转 Go", "name_en": "JSON to Go", "description": "Generate Go structs from JSON", "url": "/json/to-go", "search": "json go struct golang 代码生成"},
		{"name_zh": "JSON 转 Python", "name_en": "JSON to Python", "description": "Generate Python dataclasses from JSON", "url": "/json/to-python", "search": "json python dataclass 代码生成"},
		{"name_zh": "JSON 转 YAML", "name_en": "JSON to YAML", "description": "Convert JSON to YAML format", "url": "/json/to-yaml", "search": "json yaml convert 转换"},
		{"name_zh": "JWT 解码", "name_en": "JWT Decoder", "description": "Decode and inspect JWT tokens", "url": "/json/jwt", "search": "jwt decode token header payload"},
		{"name_zh": "JSON Schema 验证", "name_en": "JSON Schema Validator", "description": "Validate JSON against a schema", "url": "/json/schema-validate", "search": "json schema validate 验证"},
		{"name_zh": "JSON 工具箱", "name_en": "JSON Toolkit", "description": "40+ free online JSON tools", "url": "/json", "search": "json tools 工具箱 toolkit all"},
		{"name_zh": "AI 检测器", "name_en": "AI Content Detector", "description": "Detect AI-generated content", "url": "/ai/detector", "search": "ai detector detect ai检测 检测器 gptzero"},
		{"name_zh": "AI 人性化改写", "name_en": "AI Humanizer", "description": "Humanize AI-generated text to bypass detection", "url": "/ai/humanizer", "search": "ai humanize 人性化 bypass humanize rewrite"},
		{"name_zh": "AI 竞品分析", "name_en": "AI Competitive Analysis", "description": "Analyze competitors across 7 dimensions with AI", "url": "/ai/compete", "search": "competitive analysis 竞品分析 swot marketing pricing competitor"},
		// Developer Tools Suite
		{"name_zh": "哈希计算器", "name_en": "Hash Generator", "description": "MD5 SHA-1 SHA-256 SHA-512 HMAC hash calculator, client-side", "url": "/dev/hash", "search": "hash md5 sha256 sha512 hmac 哈希 摘要 加密 generator"},
		{"name_zh": "Base64 编解码", "name_en": "Base64 Encoder Decoder", "description": "Encode or decode Base64 text and files up to 50MB", "url": "/dev/base64", "search": "base64 encode decode 编码 解码 base64url mime"},
		{"name_zh": "URL 编解码", "name_en": "URL Encoder Decoder", "description": "Percent-encode or decode URLs, batch mode, diff highlight", "url": "/dev/url-encode", "search": "url encode decode 百分号 编码 解码 percent encoding"},
		{"name_zh": "IP 地址查询", "name_en": "IP Address Lookup", "description": "Find your public IP, geolocation, ISP, ASN with map", "url": "/dev/ip", "search": "ip lookup 查询 地址 geolocation isp asn ipv4 ipv6 我的ip"},
		{"name_zh": "Whois 域名查询", "name_en": "Whois Domain Lookup", "description": "RDAP and raw Whois data for any domain", "url": "/dev/whois", "search": "whois domain 域名 查询 rdap registrar 注册商 到期"},
			{"name_zh": "文字计数器", "name_en": "Word Counter", "description": "Count words, characters, readability score and keyword density", "url": "/dev/word-counter", "search": "word counter 文字 计数 字数 词数 可读性 readability flesch keyword"},
			{"name_zh": "UUID 生成器", "name_en": "UUID Generator", "description": "Generate random UUID v4 and v7 instantly, batch up to 100", "url": "/dev/uuid", "search": "uuid generator guid v4 v7 随机 唯一 标识符"},
			{"name_zh": "Lorem Ipsum 生成器", "name_en": "Lorem Ipsum Generator", "description": "Generate placeholder text for design and prototypes", "url": "/dev/lorem", "search": "lorem ipsum placeholder text dummy 占位 文本 生成"},
			// Image Tools
			{"name_zh": "图片裁剪", "name_en": "Image Cropper", "description": "Crop images online, free/pixel/fixed ratio modes, batch up to 30", "url": "/img/crop", "search": "image crop 裁剪 cut trim 图片 free ratio pixel"},
			{"name_zh": "图片格式转换", "name_en": "Image Format Converter", "description": "Convert PNG/WebP/GIF to JPG and JPG to PNG/WebP/GIF/BMP", "url": "/img/convert-to-jpg", "search": "image convert 转换 format png jpg webp gif bmp"},
			{"name_zh": "图片编辑器", "name_en": "Photo Editor", "description": "Adjust brightness, contrast, saturation, blur in browser", "url": "/img/photo-editor", "search": "photo editor 图片 编辑 brightness contrast saturation blur"},
			{"name_zh": "背景去除", "name_en": "Background Remover", "description": "AI-powered background removal, runs locally in browser", "url": "/img/remove-bg", "search": "remove background 去除 背景 ai transparent png"},
			{"name_zh": "图片水印", "name_en": "Image Watermark", "description": "Add text or image watermark, batch support up to 30", "url": "/img/watermark", "search": "watermark 水印 image text logo copyright"},
			{"name_zh": "图片旋转", "name_en": "Image Rotator", "description": "Rotate and flip images, arbitrary angle support", "url": "/img/rotate", "search": "image rotate 旋转 flip 翻转 angle"},
			// Color Tools
			{"name_zh": "颜色选择器", "name_en": "Color Picker", "description": "Pick colors from screen or input HEX/RGB/HSL values", "url": "/color/picker", "search": "color picker 选色 颜色 hex rgb hsl"},
			{"name_zh": "调色板生成器", "name_en": "Color Palette Generator", "description": "Generate harmonious color palettes from a base color", "url": "/color/palette", "search": "color palette 调色板 配色 生成 harmony"},
			{"name_zh": "颜色转换器", "name_en": "Color Converter", "description": "Convert between HEX, RGB, HSL, HSV, CMYK formats", "url": "/color/converter", "search": "color convert 转换 hex rgb hsl hsv cmyk"},
			{"name_zh": "对比度检查", "name_en": "Color Contrast Checker", "description": "Check WCAG accessibility contrast ratios", "url": "/color/contrast", "search": "color contrast 对比度 accessibility wcag a11y"},
			{"name_zh": "渐变生成器", "name_en": "Gradient Generator", "description": "Create CSS gradients with live preview", "url": "/color/gradient", "search": "gradient 渐变 css linear radial"},
			{"name_zh": "Tailwind 颜色", "name_en": "Tailwind Color Reference", "description": "Browse all Tailwind CSS colors with copy-paste", "url": "/color/tailwind", "search": "tailwind color 颜色 css reference"},
			// Text & Dev Tools
			{"name_zh": "正则表达式测试", "name_en": "Regex Tester", "description": "Test and debug regular expressions with real-time matching", "url": "/tools/regex", "search": "regex regular expression 正则 测试 test debug"},
			{"name_zh": "Markdown 编辑器", "name_en": "Markdown Editor", "description": "Live preview Markdown editor", "url": "/tools/markdown", "search": "markdown editor 编辑器 preview live 实时预览"},
			{"name_zh": "时间戳转换", "name_en": "Timestamp Converter", "description": "Convert between Unix timestamp and dates", "url": "/tools/timestamp", "search": "timestamp 时间戳 unix date 日期 转换"},
			{"name_zh": "进制转换", "name_en": "Base Converter", "description": "Convert between binary, octal, decimal, hex", "url": "/tools/base-converter", "search": "base converter 进制 binary octal decimal hex"},
			{"name_zh": "大小写转换", "name_en": "Case Converter", "description": "Convert between camelCase, snake_case, UPPER_CASE", "url": "/tools/case-converter", "search": "case converter 大小写 camelCase snake_case UPPER"},
			{"name_zh": "单位转换器", "name_en": "Unit Converter", "description": "Convert length, weight, temperature, area, volume", "url": "/tools/media/unit-converter", "search": "unit converter 单位 转换 length weight temperature"},
			// More JSON subtools
			{"name_zh": "JSON 转义", "name_en": "JSON Escape", "description": "Escape or unescape JSON strings", "url": "/json/escape", "search": "json escape unescape 转义"},
			{"name_zh": "JSON 搜索", "name_en": "JSON Search", "description": "Search for keys and values in JSON data", "url": "/json/search", "search": "json search 搜索 find key value"},
			{"name_zh": "JSON 转 CSV", "name_en": "JSON to CSV", "description": "Convert JSON arrays to CSV format", "url": "/json/to-csv", "search": "json csv convert 转换 table"},
			{"name_zh": "JSON 转 SQL", "name_en": "JSON to SQL", "description": "Generate SQL INSERT statements from JSON", "url": "/json/to-sql", "search": "json sql convert insert 转换"},
			{"name_zh": "JSON 数据集", "name_en": "JSON Datasets", "description": "85+ free open-source JSON datasets", "url": "/json/datasets", "search": "json dataset 数据集 sample test free"},
			{"name_zh": "JSON 教程", "name_en": "JSON Learn", "description": "53+ free JSON tutorials from beginner to advanced", "url": "/json/learn", "search": "json learn tutorial 教程 beginner 入门"},
			// Privacy
			{"name_zh": "隐私泄露检查", "name_en": "Privacy Check", "description": "Check if your email or password was exposed in data breaches", "url": "/privacy/check", "search": "privacy check 隐私 泄露 breach data password email"},
		}
	var results []gin.H
	for _, tool := range tools {
		if strings.Contains(strings.ToLower(tool["search"].(string)), q) {
			results = append(results, gin.H{
				"name_zh":     tool["name_zh"],
				"name_en":     tool["name_en"],
				"description": tool["description"],
				"url":         tool["url"],
			})
		}
	}
	if results == nil {
		results = []gin.H{}
	}
	c.JSON(http.StatusOK, gin.H{"results": results})
}

// PasswordPage renders password generator page
func PasswordPage(c *gin.Context) {
	t := getT(c)

	// Build FAQ data
	type FAQ struct {
		Q string
		A string
	}
	faqs := []FAQ{
		{Q: t("password.faq.q1"), A: t("password.faq.a1")},
		{Q: t("password.faq.q2"), A: t("password.faq.a2")},
		{Q: t("password.faq.q3"), A: t("password.faq.a3")},
		{Q: t("password.faq.q4"), A: t("password.faq.a4")},
		{Q: t("password.faq.q5"), A: t("password.faq.a5")},
	}

	data := baseData(c, gin.H{
		"Title":       t("password.title"),
		"Description": t("password.meta_desc"),
		"Keywords":    "password generator, random password, secure password, strong password",
		"PageClass":   "page-password",
		"FAQs":        faqs,
		"JSONLD": template.JS(`{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Random Password Generator",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "Web Browser",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "description": "Generate cryptographically secure random passwords instantly.",
  "url": "https://toolboxnova.com/password-generator"
}`),
	})
	render(c, "password.html", data)
}

// VirtualAddressPage renders virtual address generator page
func VirtualAddressPage(c *gin.Context) {
	t := getT(c)

	// Build FAQ data
	type FAQ struct {
		Q string
		A string
	}
	faqs := []FAQ{
		{Q: t("address.faq.q1"), A: t("address.faq.a1")},
		{Q: t("address.faq.q2"), A: t("address.faq.a2")},
		{Q: t("address.faq.q3"), A: t("address.faq.a3")},
		{Q: t("address.faq.q4"), A: t("address.faq.a4")},
		{Q: t("address.faq.q5"), A: t("address.faq.a5")},
	}

	data := baseData(c, gin.H{
		"Title":       t("address.title"),
		"Description": t("address.meta_desc"),
		"Keywords":    "fake address generator, virtual address, fake identity, random address",
		"PageClass":   "page-address",
		"FAQs":        faqs,
		"JSONLD": template.JS(`{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Virtual Address Generator",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "Web Browser",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "description": "Generate realistic fake addresses and identity info.",
  "url": "https://toolboxnova.com/virtual-address"
}`),
	})
	render(c, "virtual_address.html", data)
}
