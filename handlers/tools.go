package handlers

import (
	"strings"

	"github.com/gin-gonic/gin"
)

// ToolsPage renders the developer tools navigation page
func ToolsPage(c *gin.Context) {
	t := getT(c)
	data := baseData(c, gin.H{
		"Title":       t("tools.title"),
		"Description": "Free online developer tools. JSON formatter, Regex tester, Markdown editor, Timestamp converter, Base converter, Case converter and more.",
		"Keywords":    "developer tools, json formatter, regex tester, markdown editor, timestamp converter, base converter, case converter",
		"PageClass":   "page-tools",
	})
	render(c, "tools.html", data)
}

// JSONToolPage renders the JSON toolkit page (handles all /tools/json/* sub-routes)
func JSONToolPage(c *gin.Context) {
	t := getT(c)
	lang := c.GetString("lang")

	// Determine active tab from path
	path := c.Request.URL.Path
	activeTab := "format"
	switch {
	case strings.HasSuffix(path, "/escape"):
		activeTab = "escape"
	case strings.HasSuffix(path, "/unescape"):
		activeTab = "unescape"
	case strings.HasSuffix(path, "/repair"):
		activeTab = "repair"
	case strings.HasSuffix(path, "/minify"):
		activeTab = "minify"
	case strings.HasSuffix(path, "/diff"):
		activeTab = "diff"
	case strings.HasSuffix(path, "/tree"):
		activeTab = "tree"
	case strings.HasSuffix(path, "/path"):
		activeTab = "path"
	case strings.HasSuffix(path, "/csv"):
		activeTab = "csv"
	case strings.HasSuffix(path, "/yaml"):
		activeTab = "yaml"
	case strings.HasSuffix(path, "/schema"):
		activeTab = "schema"
	case strings.HasSuffix(path, "/jwt"):
		activeTab = "jwt"
	}

	// Support URL parameters for preset JSON (compatible with jsonlint.com)
	presetJSON := c.Query("json")
	presetURL := c.Query("url")

	// FAQ data structure
	type FAQ struct {
		Q string
		A string
	}
	var faqs []FAQ

	if lang == "zh" {
		faqs = []FAQ{
			{"什么是 JSON？",
				"JSON（JavaScript Object Notation）是一种轻量级的数据交换格式，易于人类阅读和编写，也易于机器解析和生成。它基于 JavaScript 的一个子集，但独立于编程语言，被广泛用于 Web API 和配置文件。"},
			{"如何校验 JSON 是否有效？",
				"将 JSON 文本粘贴到上方编辑器，然后点击「校验 JSON」按钮。工具会立即检测语法错误，并精确指出错误所在的行和列号，附带友好的错误说明。"},
			{"JSON 格式化有什么用？",
				"格式化（美化）JSON 会添加适当的缩进和换行，使嵌套结构更易于阅读和调试。点击「格式化」按钮即可一键美化，支持 2 空格、4 空格或 Tab 缩进。"},
			{"JSON 压缩（Minify）是什么？",
				"JSON 压缩会移除所有多余的空格和换行符，将 JSON 压缩为最小体积的单行文本。这在生产环境中可以减少网络传输体积，加快 API 响应速度。"},
			{"JSON 中常见的语法错误有哪些？",
				"最常见的错误包括：键名未用双引号包裹、末尾多余的逗号、使用单引号替代双引号、数组或对象括号不匹配、数字前有前导零等。本工具会精确指出每种错误的位置和原因。"},
			{"数据会上传到服务器吗？",
				"不会。所有 JSON 的校验、格式化和压缩操作均在您的浏览器本地完成，数据不会发送到任何服务器，完全保护您的数据隐私。"},
			{"如何从 URL 导入 JSON？",
				"切换到「抓取 URL」标签，输入包含 JSON 的网址，点击「抓取」按钮。工具会通过服务器代理获取内容并填入编辑器，随后自动格式化展示。"},
		}
	} else {
		faqs = []FAQ{
			{"What is JSON?",
				"JSON (JavaScript Object Notation) is a lightweight, text-based data interchange format that is easy to read and write for humans and easy to parse for machines. Though derived from JavaScript, it is language-independent and widely used in web APIs and configuration files."},
			{"How do I validate JSON?",
				"Paste your JSON into the editor above and click the Validate JSON button. The tool instantly detects syntax errors and pinpoints the exact line and column number where the error occurs, with a helpful description of what went wrong."},
			{"What does JSON formatting do?",
				"Formatting (pretty-printing) JSON adds proper indentation and line breaks to make nested structures easy to read and debug. Click Format to beautify instantly — choose 2-space, 4-space, or tab indentation."},
			{"What is JSON minification?",
				"Minification removes all unnecessary whitespace and newlines to produce a compact, single-line JSON string. This reduces payload size for APIs and configuration files in production environments."},
			{"What are common JSON syntax errors?",
				"The most common errors include: unquoted keys (use double quotes), trailing commas, single quotes instead of double quotes, mismatched brackets, and leading zeros in numbers. Our tool pinpoints each error with a clear description."},
			{"Is my data sent to a server?",
				"No. All validation, formatting, and minification operations run entirely in your browser. Your JSON data is never transmitted to any server, ensuring complete data privacy."},
			{"How do I import JSON from a URL?",
				"Switch to the Fetch URL tab, enter the URL of a JSON resource, and click Fetch. The tool will retrieve the content via a server proxy and load it into the editor, automatically formatting it."},
		}
	}

	data := baseData(c, gin.H{
		"Title":       t("tools.json.seo.title"),
		"Description": t("tools.json.seo.desc"),
		"Keywords":    "json validator, json formatter, json lint, json beautifier, json minifier, online json tool, json checker, json pretty print, jsonlint, validate json online",
		"PageClass":   "page-json-tool",
		"ActiveTab":   activeTab,
		"PresetJSON":  presetJSON,
		"PresetURL":   presetURL,
		"FAQs":        faqs,
	})
	render(c, "tools_json.html", data)
}

// RegexToolPage renders the regex tester page
func RegexToolPage(c *gin.Context) {
	data := baseData(c, gin.H{
		"Title":       "Regex Tester - Test Regular Expressions Online | Tool Box Nova",
		"Description": "Test and debug regular expressions online with real-time highlighting. Support JavaScript, Python, PCRE flavors with explanation and cheat sheet.",
		"Keywords":    "regex tester online, regular expression tester, regex101 alternative, regexp",
		"PageClass":   "page-regex-tool",
	})
	render(c, "tools_regex.html", data)
}

// MarkdownToolPage renders the Markdown editor page
func MarkdownToolPage(c *gin.Context) {
	data := baseData(c, gin.H{
		"Title":       "Markdown Editor - Live Preview | Tool Box Nova",
		"Description": "Free online Markdown editor with real-time synchronized preview. Supports GFM, tables, code highlight, export to HTML.",
		"Keywords":    "markdown editor online, markdown preview, dillinger alternative, stackedit alternative",
		"PageClass":   "page-markdown-tool",
	})
	render(c, "tools_markdown.html", data)
}

// TimestampToolPage renders the timestamp converter page
func TimestampToolPage(c *gin.Context) {
	data := baseData(c, gin.H{
		"Title":       "Unix Timestamp Converter | Tool Box Nova",
		"Description": "Convert Unix timestamps to human-readable dates. Get current timestamp, batch convert, support all timezones.",
		"Keywords":    "unix timestamp converter, epoch time, timestamp to date, epoch converter",
		"PageClass":   "page-timestamp-tool",
	})
	render(c, "tools_timestamp.html", data)
}

// BaseConverterPage renders the number base converter page
func BaseConverterPage(c *gin.Context) {
	data := baseData(c, gin.H{
		"Title":       "Number Base Converter - Binary Hex Octal Decimal | Tool Box Nova",
		"Description": "Convert numbers between binary (base-2), octal (base-8), decimal (base-10), and hexadecimal (base-16) instantly.",
		"Keywords":    "binary to decimal converter, hex converter, number base converter, binary octal hex",
		"PageClass":   "page-base-converter",
	})
	render(c, "tools_base.html", data)
}

// CaseConverterPage renders the text case converter page
func CaseConverterPage(c *gin.Context) {
	data := baseData(c, gin.H{
		"Title":       "Text Case Converter - camelCase snake_case kebab-case | Tool Box Nova",
		"Description": "Convert text between camelCase, PascalCase, snake_case, kebab-case, SCREAMING_SNAKE_CASE, Title Case and more.",
		"Keywords":    "camelcase converter, snake case converter, text case converter, kebab case",
		"PageClass":   "page-case-converter",
	})
	render(c, "tools_case.html", data)
}

// MediaToolsPage renders the media tools navigation page
func MediaToolsPage(c *gin.Context) {
	data := baseData(c, gin.H{
		"Title":       "Free Online Media Tools - Image Compress, Video Convert, Color | Tool Box Nova",
		"Description": "Free online media tools. Compress images, convert video formats, color picker, unit converter, QR code generator and more.",
		"Keywords":    "image compressor, video converter, color picker, qr code generator, unit converter",
		"PageClass":   "page-media-tools",
	})
	render(c, "tools_media.html", data)
}

// ImageCompressPage renders the image compression tool
func ImageCompressPage(c *gin.Context) {
	data := baseData(c, gin.H{
		"Title":       "Free Image Compressor Online - Compress JPG PNG | Tool Box Nova",
		"Description": "Compress images online for free. Reduce JPG, PNG, WEBP file size without visible quality loss. No upload limit, batch compress up to 20 images.",
		"Keywords":    "image compressor, compress jpg, compress png, reduce image size, optimize images",
		"PageClass":   "page-image-compress",
	})
	render(c, "tools_media_image_compress.html", data)
}

// ColorConverterPage renders the color converter tool
func ColorConverterPage(c *gin.Context) {
	data := baseData(c, gin.H{
		"Title":       "Color Converter - HEX RGB HSL CMYK Online | Tool Box Nova",
		"Description": "Convert colors between HEX, RGB, HSL, HSV, CMYK formats. Color picker with contrast checker and WCAG compliance validator.",
		"Keywords":    "color converter, hex to rgb, rgb to hsl, color picker, wcag contrast checker",
		"PageClass":   "page-color-converter",
	})
	render(c, "tools_media_color.html", data)
}

// UnitConverterPage renders the unit converter tool
func UnitConverterPage(c *gin.Context) {
	data := baseData(c, gin.H{
		"Title":       "Unit Converter - Length, Weight, Temperature Online | Tool Box Nova",
		"Description": "Convert units of length, weight, temperature, area, volume, speed, time, data, pressure, energy, frequency and more.",
		"Keywords":    "unit converter, length converter, temperature converter, weight converter, convert units",
		"PageClass":   "page-unit-converter",
	})
	render(c, "tools_media_unit.html", data)
}

//// QRGeneratorPage renders the QR code generator tool
//func QRGeneratorPage(c *gin.Context) {
//	data := baseData(c, gin.H{
//		"Title":       "QR Code Generator Free - Custom QR Codes Online | Tool Box Nova",
//		"Description": "Generate free QR codes for URLs, text, WiFi, email, vCard. Customize colors, size, and add logo. Download PNG or SVG.",
//		"Keywords":    "qr code generator, create qr code, custom qr code, qr code maker, generate qr code free",
//		"PageClass":   "page-qr-generator",
//	})
//	render(c, "tools_media_qr.html", data)
//}
