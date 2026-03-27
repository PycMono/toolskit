package handlers

import (
	"html/template"
	"strings"

	"github.com/gin-gonic/gin"
)

// buildToolsFAQ returns FAQ items for tools pages (regex, markdown, timestamp, base, case)
func buildToolsFAQ(lang, tool string) []DevFAQ {
	faqs := map[string]map[string][]DevFAQ{
		"en": {
			"regex": {
				{Q: "What is a regular expression?", A: "A regular expression (regex) is a sequence of characters that defines a search pattern. It's used for string matching, validation, and text manipulation in programming."},
				{Q: "What regex flavors does this tool support?", A: "This tool supports JavaScript regex by default (used in web browsers). The syntax is compatible with most modern regex engines including Python, Go, and PCRE with minor differences."},
				{Q: "What's the difference between greedy and non-greedy quantifiers?", A: "Greedy quantifiers (*, +) match as much text as possible. Non-greedy or lazy quantifiers (*?, +?) match as little as possible. For example, 'a.*b' on 'a1b2b3b' matches 'a1b2b3b', while 'a.*?b' matches 'a1b'."},
				{Q: "How do I match the start or end of a line?", A: "Use ^ to match the start of a line and $ to match the end. With multiline mode enabled, ^ and $ match at each line boundary instead of just the string start/end."},
				{Q: "What are lookahead and lookbehind assertions?", A: "Lookahead (?=...) and (?!...) check if a pattern follows or doesn't follow the current position without consuming characters. Lookbehind (?<=...) and (?<!...) check what precedes. These are useful for complex validations."},
			},
			"markdown": {
				{Q: "What is Markdown?", A: "Markdown is a lightweight markup language that uses simple text formatting to create rich text documents. It's widely used for documentation, README files, blogs, and forum posts."},
				{Q: "Does this editor support GitHub Flavored Markdown (GFM)?", A: "Yes, this editor supports GFM extensions including tables, task lists, strikethrough, autolinks, and code highlighting. These features go beyond standard Markdown."},
				{Q: "How do I create a table in Markdown?", A: "Use pipes (|) to separate columns and hyphens (-) for the header row separator. Example: | Header 1 | Header 2 | followed by |---|---| creates a two-column table."},
				{Q: "Can I export my Markdown as HTML?", A: "Yes, click the 'HTML' export button to download the rendered HTML. You can also copy the raw Markdown or the rendered preview content."},
				{Q: "Is my content saved or sent to a server?", A: "No. All editing and preview happens entirely in your browser. Your content is never transmitted to any server, ensuring complete privacy."},
			},
			"timestamp": {
				{Q: "What is a Unix timestamp?", A: "A Unix timestamp (also called epoch time) is the number of seconds since January 1, 1970 UTC. It's a standard way to represent time in computing that's timezone-independent."},
				{Q: "What's the difference between seconds and milliseconds timestamps?", A: "Seconds timestamps are 10 digits (e.g., 1700000000). Milliseconds timestamps are 13 digits (e.g., 1700000000000). JavaScript and many APIs use milliseconds, while Unix systems typically use seconds."},
				{Q: "How do I convert a timestamp to a specific timezone?", A: "Enter your timestamp, then use the timezone converter section to select your target timezone. The tool will show the date and time in that timezone."},
				{Q: "Why does my timestamp show a date in 1970?", A: "You're probably treating a seconds timestamp as milliseconds (or vice versa). Try switching between 'seconds' and 'milliseconds' mode to get the correct date."},
				{Q: "What is ISO 8601 format?", A: "ISO 8601 is an international standard for date/time representation (e.g., 2024-01-15T10:30:00Z). The 'Z' suffix indicates UTC timezone, making it unambiguous and machine-readable."},
			},
			"base": {
				{Q: "What are number bases?", A: "Number bases (or radix) are different ways to represent numbers. Common bases include binary (base-2, uses 0-1), octal (base-8, uses 0-7), decimal (base-10, uses 0-9), and hexadecimal (base-16, uses 0-9 and A-F)."},
				{Q: "Why would I need to convert between bases?", A: "Base conversion is essential in programming. Binary is used in digital systems, hexadecimal is common for memory addresses and color codes, and octal is used in Unix file permissions."},
				{Q: "How do I convert hexadecimal to decimal manually?", A: "Each hex digit represents 4 bits. Multiply each digit by 16^position (right to left, starting at 0) and sum them. For example, 0xFF = 15×16 + 15 = 255."},
				{Q: "What is the prefix notation for different bases?", A: "Binary uses 0b (0b1010), octal uses 0o or just 0 (0o17 or 017), and hexadecimal uses 0x (0xFF). These prefixes are common in programming languages."},
				{Q: "Can I convert negative numbers?", A: "Yes, this tool supports negative numbers. The conversion maintains the sign across all base representations."},
			},
			"case": {
				{Q: "What is camelCase?", A: "camelCase capitalizes the first letter of each word except the first, with no spaces or underscores. Example: 'helloWorld'. It's commonly used in JavaScript and Java for variable names."},
				{Q: "What's the difference between snake_case and kebab-case?", A: "snake_case uses underscores between words (hello_world), commonly used in Python and Ruby. kebab-case uses hyphens (hello-world), popular in CSS classes and URLs."},
				{Q: "What is PascalCase?", A: "PascalCase (also called UpperCamelCase) capitalizes the first letter of every word including the first. Example: 'HelloWorld'. It's commonly used for class names in many programming languages."},
				{Q: "When should I use SCREAMING_SNAKE_CASE?", A: "SCREAMING_SNAKE_CASE (all uppercase with underscores) is typically used for constants and environment variables. Example: 'MAX_CONNECTIONS' or 'API_KEY'."},
				{Q: "Can this tool handle non-ASCII characters?", A: "Yes, the tool handles Unicode characters correctly. Case conversion works for ASCII letters A-Z and a-z, while other characters are preserved as-is."},
			},
		},
		"zh": {
			"regex": {
				{Q: "什么是正则表达式？", A: "正则表达式（Regex）是一种用于描述字符串匹配模式的文本语法。它广泛用于文本搜索、数据验证、字符串替换等场景，是程序员的必备技能之一。"},
				{Q: "这个工具支持哪些正则语法？", A: "本工具默认使用 JavaScript 正则表达式引擎，兼容大多数现代正则语法。与 Python、Go、PCRE 等引擎基本兼容，但某些高级特性可能有差异。"},
				{Q: "贪婪匹配和非贪婪匹配有什么区别？", A: "贪婪量词（*、+）会尽可能匹配更多字符，非贪婪量词（*?、+?）则尽可能匹配更少字符。例如在 'a1b2b3b' 中，'a.*b' 匹配整个字符串，而 'a.*?b' 只匹配 'a1b'。"},
				{Q: "如何匹配行首或行尾？", A: "使用 ^ 匹配行首，$ 匹配行尾。如果启用了多行模式（m 标志），^ 和 $ 会匹配每一行的开头和结尾，而不仅仅是整个字符串的开头和结尾。"},
				{Q: "什么是先行断言和后行断言？", A: "先行断言 (?=...) 和 (?!...) 用于检查某个位置后面是否匹配（或不匹配）某个模式，但不消耗字符。后行断言 (?<=...) 和 (?<!...) 检查前面的内容。这些在复杂验证中非常有用。"},
			},
			"markdown": {
				{Q: "什么是 Markdown？", A: "Markdown 是一种轻量级标记语言，使用简单的文本格式来创建富文本文档。它广泛用于技术文档、README 文件、博客文章和论坛帖子等场景。"},
				{Q: "这个编辑器支持 GitHub Flavored Markdown 吗？", A: "是的，本编辑器支持 GFM 扩展语法，包括表格、任务列表、删除线、自动链接和代码高亮等功能，这些功能超出了标准 Markdown 的范围。"},
				{Q: "如何在 Markdown 中创建表格？", A: "使用管道符 (|) 分隔列，使用连字符 (-) 创建表头分隔行。例如：| 标题1 | 标题2 | 换行后跟 |---|---| 即可创建一个两列的表格。"},
				{Q: "可以导出 Markdown 为 HTML 吗？", A: "可以，点击 'HTML' 导出按钮即可下载渲染后的 HTML 文件。您也可以复制原始 Markdown 文本或渲染后的预览内容。"},
				{Q: "我的内容会被保存或发送到服务器吗？", A: "不会。所有编辑和预览都在您的浏览器本地完成，内容永远不会传输到任何服务器，确保完全的隐私保护。"},
			},
			"timestamp": {
				{Q: "什么是 Unix 时间戳？", A: "Unix 时间戳（也叫 Epoch 时间）是从 1970 年 1 月 1 日 UTC 起经过的秒数。它是计算中表示时间的标准方式，与时区无关。"},
				{Q: "秒级时间戳和毫秒时间戳有什么区别？", A: "秒级时间戳是 10 位数字（如 1700000000），毫秒时间戳是 13 位数字（如 1700000000000）。JavaScript 和许多 API 使用毫秒，而 Unix 系统通常使用秒。"},
				{Q: "如何将时间戳转换为特定时区？", A: "输入时间戳后，使用时区转换区域选择目标时区，工具会显示该时区的日期和时间。"},
				{Q: "为什么我的时间戳显示 1970 年的日期？", A: "您可能把秒级时间戳当作毫秒处理了（或相反）。尝试在「秒」和「毫秒」模式之间切换，通常可以解决这个问题。"},
				{Q: "什么是 ISO 8601 格式？", A: "ISO 8601 是国际标准的日期/时间表示格式（如 2024-01-15T10:30:00Z）。后缀 'Z' 表示 UTC 时区，这种格式明确且易于机器解析。"},
			},
			"base": {
				{Q: "什么是进制？", A: "进制（或基数）是表示数字的不同方式。常见的进制包括二进制（基数为 2，使用 0-1）、八进制（基数为 8，使用 0-7）、十进制（基数为 10，使用 0-9）和十六进制（基数为 16，使用 0-9 和 A-F）。"},
				{Q: "为什么需要在不同进制之间转换？", A: "进制转换在编程中非常重要。二进制用于数字系统，十六进制常用于内存地址和颜色代码，八进制用于 Unix 文件权限。"},
				{Q: "如何手动将十六进制转换为十进制？", A: "每个十六进制数字代表 4 位。将每个数字乘以 16^位置（从右到左，从 0 开始），然后求和。例如 0xFF = 15×16 + 15 = 255。"},
				{Q: "不同进制的前缀表示法是什么？", A: "二进制使用 0b（如 0b1010），八进制使用 0o 或 0（如 0o17 或 017），十六进制使用 0x（如 0xFF）。这些前缀在编程语言中很常见。"},
				{Q: "可以转换负数吗？", A: "可以，本工具支持负数转换。转换过程会在所有进制表示中保持符号不变。"},
			},
			"case": {
				{Q: "什么是 camelCase？", A: "camelCase（驼峰命名法）将每个单词的首字母大写（第一个单词除外），没有空格或下划线。例如：'helloWorld'。常用于 JavaScript 和 Java 的变量命名。"},
				{Q: "snake_case 和 kebab-case 有什么区别？", A: "snake_case 使用下划线连接单词（hello_world），常用于 Python 和 Ruby。kebab-case 使用连字符连接（hello-world），常用于 CSS 类名和 URL。"},
				{Q: "什么是 PascalCase？", A: "PascalCase（也叫大驼峰命名法）将每个单词的首字母都大写，包括第一个。例如：'HelloWorld'。常用于许多编程语言的类名。"},
				{Q: "什么时候应该使用 SCREAMING_SNAKE_CASE？", A: "SCREAMING_SNAKE_CASE（全大写加下划线）通常用于常量和环境变量。例如：'MAX_CONNECTIONS' 或 'API_KEY'。"},
				{Q: "这个工具能处理非 ASCII 字符吗？", A: "可以，工具能正确处理 Unicode 字符。大小写转换适用于 ASCII 字母 A-Z 和 a-z，其他字符保持不变。"},
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
		"Canonical":   "https://toolboxnova.com/tools/json",
		"HreflangZH":  "https://toolboxnova.com/tools/json?lang=zh",
		"HreflangEN":  "https://toolboxnova.com/tools/json?lang=en",
		"SEOArticle":  template.HTML(t("tools.json.seo.article")),
	})
	render(c, "tools_json.html", data)
}

// RegexToolPage renders the regex tester page
func RegexToolPage(c *gin.Context) {
	t := getT(c)
	lang := getLang(c)
	data := baseData(c, gin.H{
		"Title":       t("tools.regex.seo.title"),
		"Description": t("tools.regex.seo.description"),
		"Keywords":    t("tools.regex.seo.keywords"),
		"Canonical":   "https://toolboxnova.com/tools/regex",
		"HreflangZH":  "https://toolboxnova.com/tools/regex?lang=zh",
		"HreflangEN":  "https://toolboxnova.com/tools/regex?lang=en",
		"PageClass":   "page-regex-tool",
		"FAQs":        buildToolsFAQ(lang, "regex"),
		"SEOArticle":  template.HTML(t("tools.regex.seo.article")),
	})
	render(c, "tools_regex.html", data)
}

// MarkdownToolPage renders the Markdown editor page
func MarkdownToolPage(c *gin.Context) {
	t := getT(c)
	lang := getLang(c)
	data := baseData(c, gin.H{
		"Title":       t("tools.markdown.seo.title"),
		"Description": t("tools.markdown.seo.description"),
		"Keywords":    t("tools.markdown.seo.keywords"),
		"Canonical":   "https://toolboxnova.com/tools/markdown",
		"HreflangZH":  "https://toolboxnova.com/tools/markdown?lang=zh",
		"HreflangEN":  "https://toolboxnova.com/tools/markdown?lang=en",
		"PageClass":   "page-markdown-tool",
		"FAQs":        buildToolsFAQ(lang, "markdown"),
		"SEOArticle":  template.HTML(t("tools.markdown.seo.article")),
	})
	render(c, "tools_markdown.html", data)
}

// TimestampToolPage renders the timestamp converter page
func TimestampToolPage(c *gin.Context) {
	t := getT(c)
	lang := getLang(c)
	data := baseData(c, gin.H{
		"Title":       t("tools.timestamp.seo.title"),
		"Description": t("tools.timestamp.seo.description"),
		"Keywords":    t("tools.timestamp.seo.keywords"),
		"Canonical":   "https://toolboxnova.com/tools/timestamp",
		"HreflangZH":  "https://toolboxnova.com/tools/timestamp?lang=zh",
		"HreflangEN":  "https://toolboxnova.com/tools/timestamp?lang=en",
		"PageClass":   "page-timestamp-tool",
		"FAQs":        buildToolsFAQ(lang, "timestamp"),
		"SEOArticle":  template.HTML(t("tools.timestamp.seo.article")),
	})
	render(c, "tools_timestamp.html", data)
}

// BaseConverterPage renders the number base converter page
func BaseConverterPage(c *gin.Context) {
	t := getT(c)
	lang := getLang(c)
	data := baseData(c, gin.H{
		"Title":       t("tools.base.seo.title"),
		"Description": t("tools.base.seo.description"),
		"Keywords":    t("tools.base.seo.keywords"),
		"Canonical":   "https://toolboxnova.com/tools/base-converter",
		"HreflangZH":  "https://toolboxnova.com/tools/base-converter?lang=zh",
		"HreflangEN":  "https://toolboxnova.com/tools/base-converter?lang=en",
		"PageClass":   "page-base-converter",
		"FAQs":        buildToolsFAQ(lang, "base"),
		"SEOArticle":  template.HTML(t("tools.base.seo.article")),
	})
	render(c, "tools_base.html", data)
}

// CaseConverterPage renders the text case converter page
func CaseConverterPage(c *gin.Context) {
	t := getT(c)
	lang := getLang(c)
	data := baseData(c, gin.H{
		"Title":       t("tools.case.seo.title"),
		"Description": t("tools.case.seo.description"),
		"Keywords":    t("tools.case.seo.keywords"),
		"Canonical":   "https://toolboxnova.com/tools/case-converter",
		"HreflangZH":  "https://toolboxnova.com/tools/case-converter?lang=zh",
		"HreflangEN":  "https://toolboxnova.com/tools/case-converter?lang=en",
		"PageClass":   "page-case-converter",
		"FAQs":        buildToolsFAQ(lang, "case"),
		"SEOArticle":  template.HTML(t("tools.case.seo.article")),
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
