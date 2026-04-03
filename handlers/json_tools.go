package handlers

import (
	"net/http"
	"strings"
	"unicode"

	"github.com/gin-gonic/gin"
)

// JsonToolMeta holds metadata for each JSON tool
type JsonToolMeta struct {
	Key      string
	Icon     string
	Group    string
	TitleZH  string
	TitleEN  string
	DescZH   string
	DescEN   string
	Keywords string
}

// AllJsonToolMetas is the master list of all JSON tools
var AllJsonToolMetas = []JsonToolMeta{
	// Validate & Format
	{Key: "validate", Icon: "✅", Group: "validate", TitleZH: "JSON 验证器", TitleEN: "JSON Validator", DescZH: "在线验证 JSON 格式，错误行高亮显示，支持自动修复建议", DescEN: "Validate JSON online with error highlighting and fix suggestions", Keywords: "json validator, json lint, json checker"},
	{Key: "repair", Icon: "🔧", Group: "validate", TitleZH: "JSON 修复", TitleEN: "JSON Repair", DescZH: "自动修复损坏的 JSON，修复 LLM 输出和粘贴错误", DescEN: "Auto-fix broken JSON from LLMs and copy-paste errors", Keywords: "json repair, fix json, json fixer"},
	{Key: "pretty", Icon: "🎨", Group: "validate", TitleZH: "JSON 美化", TitleEN: "JSON Pretty Print", DescZH: "格式化 JSON，支持 2/4 空格或 Tab 缩进", DescEN: "Format and pretty print JSON with customizable indentation", Keywords: "json formatter, json pretty print, json beautifier"},
	{Key: "minify", Icon: "⚡", Group: "validate", TitleZH: "JSON 压缩", TitleEN: "JSON Minify", DescZH: "压缩 JSON，移除空白字符，最小化文件体积", DescEN: "Compress JSON by removing whitespace and formatting", Keywords: "json minify, json compress, json minifier"},
	{Key: "sort-keys", Icon: "🔤", Group: "validate", TitleZH: "JSON 排序 Keys", TitleEN: "Sort JSON Keys", DescZH: "递归排序 JSON 对象的所有 Key，方便对比和阅读", DescEN: "Alphabetically sort all JSON object keys recursively", Keywords: "json sort keys, json sort, alphabetical json"},
	{Key: "escape", Icon: "🔒", Group: "validate", TitleZH: "JSON 转义", TitleEN: "JSON Escape", DescZH: "转义 JSON 字符串，用于嵌入代码或 HTTP 请求", DescEN: "Escape JSON for safe embedding in strings and code", Keywords: "json escape, escape json string"},
	{Key: "unescape", Icon: "🔓", Group: "validate", TitleZH: "JSON 反转义", TitleEN: "JSON Unescape", DescZH: "反转义 JSON 字符串，还原可读格式", DescEN: "Unescape stringified JSON back to readable format", Keywords: "json unescape, unescape json"},
	{Key: "stringify", Icon: "📝", Group: "validate", TitleZH: "JSON Stringify", TitleEN: "JSON Stringify", DescZH: "将 JSON 转换为转义字符串格式，用于程序传输", DescEN: "Convert JSON to escaped string format for transmission", Keywords: "json stringify, json to string"},
	// View & Query
	{Key: "tree", Icon: "🌳", Group: "view", TitleZH: "JSON 树形查看", TitleEN: "JSON Tree Viewer", DescZH: "交互式树形可视化 JSON，支持折叠/展开，复制节点路径", DescEN: "Interactive collapsible tree visualization for JSON data", Keywords: "json tree viewer, json visualizer, json explorer"},
	{Key: "table", Icon: "📊", Group: "view", TitleZH: "JSON 表格查看", TitleEN: "JSON Table Viewer", DescZH: "将 JSON 数组渲染为可排序表格，方便数据浏览", DescEN: "Display JSON arrays as interactive sortable tables", Keywords: "json table, json to table, json grid"},
	{Key: "diff", Icon: "🔀", Group: "view", TitleZH: "JSON 对比", TitleEN: "JSON Diff", DescZH: "左右对比两个 JSON，高亮差异部分", DescEN: "Compare two JSON objects side-by-side with diff highlighting", Keywords: "json diff, json compare, compare json"},
	{Key: "path", Icon: "🎯", Group: "view", TitleZH: "JSON Path 查询", TitleEN: "JSON Path", DescZH: "使用 JSONPath 表达式提取 JSON 数据", DescEN: "Query JSON data using JSONPath expressions", Keywords: "jsonpath, json path, json query"},
	{Key: "search", Icon: "🔍", Group: "view", TitleZH: "JSON 搜索", TitleEN: "JSON Search", DescZH: "在 JSON 中搜索 Key 或 Value，支持正则", DescEN: "Search for keys and values with text or regex search", Keywords: "json search, search json, find in json"},
	{Key: "size", Icon: "📐", Group: "view", TitleZH: "JSON 大小分析", TitleEN: "JSON Size Analyzer", DescZH: "分析 JSON 大小、深度、节点数量、各字段占比", DescEN: "Analyze JSON size, depth, node count, and field distribution", Keywords: "json size, json analyzer, json statistics"},
	{Key: "flatten", Icon: "📄", Group: "view", TitleZH: "JSON 扁平化", TitleEN: "JSON Flatten", DescZH: "将嵌套 JSON 转换为点号展开格式（或还原）", DescEN: "Convert nested JSON to flat dot notation and back", Keywords: "json flatten, flatten json, json unflatten"},
	// Data Converters
	{Key: "to-csv", Icon: "📋", Group: "convert", TitleZH: "JSON 转 CSV", TitleEN: "JSON to CSV", DescZH: "将 JSON 数组转换为 CSV 格式，可直接下载", DescEN: "Convert JSON arrays to CSV format and download", Keywords: "json to csv, convert json csv"},
	{Key: "from-csv", Icon: "📋", Group: "convert", TitleZH: "CSV 转 JSON", TitleEN: "CSV to JSON", DescZH: "将 CSV 文件解析为 JSON 格式", DescEN: "Parse CSV files into structured JSON", Keywords: "csv to json, csv converter"},
	{Key: "to-excel", Icon: "📗", Group: "convert", TitleZH: "JSON 转 Excel", TitleEN: "JSON to Excel", DescZH: "将 JSON 导出为 Excel 电子表格（.xlsx）", DescEN: "Export JSON data to Excel spreadsheet (.xlsx)", Keywords: "json to excel, json xlsx"},
	{Key: "from-excel", Icon: "📗", Group: "convert", TitleZH: "Excel 转 JSON", TitleEN: "Excel to JSON", DescZH: "将 Excel 文件（.xlsx/.xls）转换为 JSON", DescEN: "Import Excel spreadsheet data as JSON", Keywords: "excel to json, xlsx to json"},
	{Key: "to-yaml", Icon: "📑", Group: "convert", TitleZH: "JSON 转 YAML", TitleEN: "JSON to YAML", DescZH: "将 JSON 转换为 YAML 格式", DescEN: "Convert JSON to clean YAML format", Keywords: "json to yaml, convert json yaml"},
	{Key: "from-yaml", Icon: "📑", Group: "convert", TitleZH: "YAML 转 JSON", TitleEN: "YAML to JSON", DescZH: "将 YAML 解析为 JSON 格式", DescEN: "Parse YAML into JSON", Keywords: "yaml to json, yaml converter"},
	{Key: "to-xml", Icon: "🏷️", Group: "convert", TitleZH: "JSON 转 XML", TitleEN: "JSON to XML", DescZH: "将 JSON 转换为 XML 格式", DescEN: "Transform JSON to XML structure", Keywords: "json to xml, convert json xml"},
	{Key: "from-xml", Icon: "🏷️", Group: "convert", TitleZH: "XML 转 JSON", TitleEN: "XML to JSON", DescZH: "将 XML 解析为 JSON", DescEN: "Parse XML into JSON structure", Keywords: "xml to json, xml converter"},
	{Key: "to-sql", Icon: "🗄️", Group: "convert", TitleZH: "JSON 转 SQL", TitleEN: "JSON to SQL", DescZH: "根据 JSON 数组生成 SQL INSERT 语句", DescEN: "Generate SQL INSERT statements from JSON arrays", Keywords: "json to sql, json sql insert"},
	{Key: "from-sql", Icon: "🗄️", Group: "convert", TitleZH: "SQL 转 JSON", TitleEN: "SQL to JSON", DescZH: "将 SQL 查询结果（DDL）转换为 JSON 结构", DescEN: "Convert SQL table definitions to JSON structure", Keywords: "sql to json, sql insert to json"},
	{Key: "to-markdown", Icon: "📖", Group: "convert", TitleZH: "JSON 转 Markdown", TitleEN: "JSON to Markdown", DescZH: "将 JSON 数组生成 Markdown 表格", DescEN: "Generate Markdown tables from JSON arrays", Keywords: "json to markdown, json table markdown"},
	// Code Generators
	{Key: "to-typescript", Icon: "🔷", Group: "codegen", TitleZH: "JSON 转 TypeScript", TitleEN: "JSON to TypeScript", DescZH: "根据 JSON 自动生成 TypeScript interface 定义", DescEN: "Generate TypeScript interfaces from JSON data", Keywords: "json to typescript, json typescript interface"},
	{Key: "to-python", Icon: "🐍", Group: "codegen", TitleZH: "JSON 转 Python", TitleEN: "JSON to Python", DescZH: "根据 JSON 生成 Python dataclass", DescEN: "Generate Python dataclasses from JSON", Keywords: "json to python, json python dataclass"},
	{Key: "to-java", Icon: "☕", Group: "codegen", TitleZH: "JSON 转 Java", TitleEN: "JSON to Java", DescZH: "根据 JSON 生成 Java POJO 类", DescEN: "Generate Java POJO classes from JSON", Keywords: "json to java, json java class pojo"},
	{Key: "to-csharp", Icon: "💠", Group: "codegen", TitleZH: "JSON 转 C#", TitleEN: "JSON to C#", DescZH: "根据 JSON 生成 C# class 定义", DescEN: "Generate C# classes from JSON", Keywords: "json to csharp, json c# class"},
	{Key: "to-go", Icon: "🐹", Group: "codegen", TitleZH: "JSON 转 Go", TitleEN: "JSON to Go", DescZH: "根据 JSON 生成 Go struct 定义", DescEN: "Generate Go structs from JSON", Keywords: "json to go, json golang struct"},
	{Key: "to-kotlin", Icon: "🎯", Group: "codegen", TitleZH: "JSON 转 Kotlin", TitleEN: "JSON to Kotlin", DescZH: "根据 JSON 生成 Kotlin data class", DescEN: "Generate Kotlin data classes from JSON", Keywords: "json to kotlin, json kotlin data class"},
	{Key: "to-swift", Icon: "🍎", Group: "codegen", TitleZH: "JSON 转 Swift", TitleEN: "JSON to Swift", DescZH: "根据 JSON 生成 Swift Codable struct", DescEN: "Generate Swift Codable structs from JSON", Keywords: "json to swift, json swift codable"},
	{Key: "to-rust", Icon: "🦀", Group: "codegen", TitleZH: "JSON 转 Rust", TitleEN: "JSON to Rust", DescZH: "根据 JSON 生成 Rust serde struct", DescEN: "Generate Rust structs with serde from JSON", Keywords: "json to rust, json rust serde"},
	{Key: "to-php", Icon: "🐘", Group: "codegen", TitleZH: "JSON 转 PHP", TitleEN: "JSON to PHP", DescZH: "根据 JSON 生成 PHP class 定义", DescEN: "Generate PHP classes from JSON", Keywords: "json to php, json php class"},
	// Schema
	{Key: "schema-validate", Icon: "🛡️", Group: "schema", TitleZH: "JSON Schema 验证", TitleEN: "JSON Schema Validator", DescZH: "根据 JSON Schema 验证 JSON 数据合法性", DescEN: "Validate JSON data against JSON Schema", Keywords: "json schema validator, jsonschema"},
	{Key: "schema-generate", Icon: "🏗️", Group: "schema", TitleZH: "JSON Schema 生成", TitleEN: "JSON Schema Generator", DescZH: "根据 JSON 数据自动推断生成 JSON Schema", DescEN: "Auto-generate JSON Schema from sample data", Keywords: "json schema generator, generate schema"},
	// Encoding
	{Key: "base64", Icon: "🔐", Group: "encode", TitleZH: "Base64 编解码", TitleEN: "Base64 Encode/Decode", DescZH: "对 JSON 进行 Base64 编码或解码", DescEN: "Encode or decode JSON as Base64", Keywords: "json base64, base64 encode decode"},
	{Key: "jwt", Icon: "🎫", Group: "encode", TitleZH: "JWT 解码", TitleEN: "JWT Decoder", DescZH: "解析 JWT Token，查看 Header/Payload/Signature", DescEN: "Decode and inspect JWT token Header, Payload and Signature", Keywords: "jwt decoder, jwt parser, decode jwt"},
	{Key: "jsonc", Icon: "💬", Group: "encode", TitleZH: "JSONC 转 JSON", TitleEN: "JSONC to JSON", DescZH: "移除 JSONC/JSON5 注释，转为标准 JSON", DescEN: "Strip comments from JSONC/JSON5 files", Keywords: "jsonc to json, json5, json comments"},
	{Key: "token-count", Icon: "🔢", Group: "encode", TitleZH: "Token 计数", TitleEN: "Token Counter", DescZH: "统计 GPT-4/Claude/Gemini 等模型的 Token 数量", DescEN: "Count tokens for GPT-4, Claude, Gemini and other LLMs", Keywords: "token counter, gpt token count, llm tokens"},
	// Generate & Transform
	{Key: "json-generator", Icon: "🎲", Group: "generate", TitleZH: "JSON 随机生成器", TitleEN: "JSON Generator", DescZH: "根据 Schema 或模板生成随机 JSON 测试数据", DescEN: "Generate random JSON test data from schema or template", Keywords: "json generator, random json, mock data"},
	{Key: "to-query", Icon: "🔗", Group: "generate", TitleZH: "JSON 转 URL 参数", TitleEN: "JSON to URL Query", DescZH: "将 JSON 对象转换为 URL 查询字符串参数", DescEN: "Convert JSON object to URL query string", Keywords: "json to query, json to url, query string"},
	{Key: "from-query", Icon: "🔗", Group: "generate", TitleZH: "URL 参数转 JSON", TitleEN: "URL Query to JSON", DescZH: "将 URL 查询字符串解析为 JSON 对象", DescEN: "Parse URL query string to JSON object", Keywords: "query to json, url to json, parse query"},
	{Key: "python-dict", Icon: "🐍", Group: "generate", TitleZH: "Python Dict 转换", TitleEN: "Python Dict Converter", DescZH: "Python 字典格式与 JSON 互转，处理单引号双引号", DescEN: "Convert between Python dict and JSON format", Keywords: "python dict to json, dict converter, python json"},
	// TOML Converter
	{Key: "to-toml", Icon: "📝", Group: "convert", TitleZH: "JSON 转 TOML", TitleEN: "JSON to TOML", DescZH: "将 JSON 转换为 TOML 配置格式", DescEN: "Convert JSON to TOML configuration format", Keywords: "json to toml, toml converter, toml config"},
	{Key: "from-toml", Icon: "📝", Group: "convert", TitleZH: "TOML 转 JSON", TitleEN: "TOML to JSON", DescZH: "将 TOML 配置文件解析为 JSON", DescEN: "Parse TOML configuration to JSON", Keywords: "toml to json, parse toml, toml parser"},
	// Additional Code Generators
	{Key: "to-dart", Icon: "🎯", Group: "codegen", TitleZH: "JSON 转 Dart", TitleEN: "JSON to Dart", DescZH: "根据 JSON 生成 Dart 类，支持 Flutter 开发", DescEN: "Generate Dart classes from JSON for Flutter", Keywords: "json to dart, dart class, flutter json"},
	{Key: "to-objc", Icon: "🍎", Group: "codegen", TitleZH: "JSON 转 Objective-C", TitleEN: "JSON to Objective-C", DescZH: "根据 JSON 生成 Objective-C 模型类", DescEN: "Generate Objective-C model classes from JSON", Keywords: "json to objective-c, objc model, ios json"},
	{Key: "to-cpp", Icon: "⚙️", Group: "codegen", TitleZH: "JSON 转 C++", TitleEN: "JSON to C++", DescZH: "根据 JSON 生成 C++ 结构体定义", DescEN: "Generate C++ structs from JSON", Keywords: "json to cpp, c++ struct, cpp json"},
	{Key: "to-ruby", Icon: "💎", Group: "codegen", TitleZH: "JSON 转 Ruby", TitleEN: "JSON to Ruby", DescZH: "根据 JSON 生成 Ruby 类或 Struct", DescEN: "Generate Ruby classes or structs from JSON", Keywords: "json to ruby, ruby class, rails json"},
	{Key: "to-scala", Icon: "☕", Group: "codegen", TitleZH: "JSON 转 Scala", TitleEN: "JSON to Scala", DescZH: "根据 JSON 生成 Scala case class", DescEN: "Generate Scala case classes from JSON", Keywords: "json to scala, scala case class, play json"},
	{Key: "highlight-export", Icon: "🎨", Group: "encode", TitleZH: "JSON 着色导出", TitleEN: "JSON Highlight Export", DescZH: "将 JSON 导出为带语法高亮的 HTML 或 RTF 文件", DescEN: "Export JSON with syntax highlighting as HTML or RTF", Keywords: "json highlight, json export, syntax highlighting, json to html"},
}

// jsonOutputTools indicates which tools produce valid JSON output (for tree view)
var jsonOutputTools = map[string]bool{
	"validate": true, "pretty": true, "minify": true, "sort-keys": true,
	"unescape": true, "flatten": true, "repair": true, "jsonc": true,
	"jwt": true, "path": true, "token-count": true,
	"from-csv": true, "from-yaml": true, "from-xml": true, "from-sql": true,
	"schema-generate": true, "from-toml": true, "from-query": true,
	"python-dict": true, "json-generator": true,
}

// hotToolKeys is the list of hot tools shown in the topbar
var hotToolKeys = []string{"validate", "pretty", "diff", "tree", "jwt", "to-typescript", "to-yaml", "schema-generate"}

// JsonLearnResource is a card for learn/datasets on the home page
type JsonLearnResource struct {
	Icon    string
	TitleZH string
	TitleEN string
	DescZH  string
	DescEN  string
	URL     string
	Badge   string
}

func getJsonToolMeta(key string) JsonToolMeta {
	for _, m := range AllJsonToolMetas {
		if m.Key == key {
			return m
		}
	}
	return JsonToolMeta{Key: key, Icon: "🔧", TitleZH: key, TitleEN: key}
}

func getHotTools() []JsonToolMeta {
	var hot []JsonToolMeta
	for _, k := range hotToolKeys {
		hot = append(hot, getJsonToolMeta(k))
	}
	return hot
}

func getRelatedTools(currentKey string) []JsonToolMeta {
	current := getJsonToolMeta(currentKey)
	var related []JsonToolMeta
	for _, m := range AllJsonToolMetas {
		if m.Key != currentKey && m.Group == current.Group {
			related = append(related, m)
			if len(related) >= 4 {
				break
			}
		}
	}
	return related
}


// JsonToolPage returns a gin.HandlerFunc for a specific JSON tool
func JsonToolPage(toolKey string) gin.HandlerFunc {
	return func(c *gin.Context) {
		lang := c.GetString("lang")
		if lang == "" {
			lang = "zh"
		}
		t := getT(c)
		meta := getJsonToolMeta(toolKey)

		title := meta.TitleZH
		desc := meta.DescZH
		if lang == "en" {
			title = meta.TitleEN
			desc = meta.DescEN
		}

		siteTitle := title + " — " + map[string]string{
			"zh": "免费在线 JSON 工具 | Tool Box Nova",
			"en": "Free Online JSON Tool | Tool Box Nova",
		}[lang]

		// Canonical URL
		canonical := "https://toolboxnova.com/json/" + toolKey
		hreflangZH := "https://toolboxnova.com/json/" + toolKey + "?lang=zh"
		hreflangEN := "https://toolboxnova.com/json/" + toolKey + "?lang=en"

		data := baseData(c, gin.H{
			"Title":        siteTitle,
			"Description":  desc,
			"Keywords":     meta.Keywords,
			"Canonical":    canonical,
			"HreflangZH":   hreflangZH,
			"HreflangEN":   hreflangEN,
			"Lang":         lang,
			"T":            t,
			"ToolKey":      toolKey,
			"Meta":         meta,
			"HotTools":     getHotTools(),
			"RelatedTools": getRelatedTools(toolKey),
			"AllTools":     AllJsonToolMetas,
			"PageClass":    "page-json-tool",
			"OutputIsJSON": jsonOutputTools[toolKey],
		})
		renderJSONTool(c, "tool.html", data)
	}
}

// JsonToolsHome renders the JSON tools landing page
func JsonToolsHome(c *gin.Context) {
	lang := c.GetString("lang")
	if lang == "" {
		lang = "zh"
	}
	t := getT(c)

	titleMap := map[string]string{
		"zh": "JSON 工具箱 — 40+ 免费在线 JSON 工具 | Tool Box Nova",
		"en": "JSON Toolkit — 40+ Free Online JSON Tools | Tool Box Nova",
	}
	descMap := map[string]string{
		"zh": "免费在线 JSON 工具集：验证、格式化、压缩、对比、转换、代码生成，支持 TypeScript/Go/Python 等 9 种语言",
		"en": "Free online JSON tools: validate, format, diff, convert, generate code for TypeScript, Go, Python and more",
	}

	learnResources := []JsonLearnResource{
		{Icon: "📚", TitleZH: "学习 JSON", TitleEN: "Learn JSON", DescZH: "53+ 篇教程，从基础到 Schema、安全和实战应用", DescEN: "53+ tutorials from beginner to advanced. Schema, JSONPath, jq, security & more.", URL: "/json/learn", Badge: "53+"},
		{Icon: "🗃️", TitleZH: "JSON 数据集", TitleEN: "JSON Datasets", DescZH: "85+ 免费开源数据集，用于测试和开发", DescEN: "85+ free, open-source datasets for testing and development.", URL: "/json/datasets", Badge: "85+"},
	}

	data := baseData(c, gin.H{
		"Title":          titleMap[lang],
		"Description":    descMap[lang],
		"Keywords":       "json tools, json formatter, json validator, json converter, free online json",
		"Lang":           lang,
		"T":              t,
		"AllTools":       AllJsonToolMetas,
		"HotTools":       getHotTools(),
		"LearnResources": learnResources,
		"PageClass":      "page-json-home",
	})
	renderJSONTool(c, "home.html", data)
}

// JsonTokenCountAPI handles the token counting API (backend fallback)
func JsonTokenCountAPI(c *gin.Context) {
	var req struct {
		Text  string `json:"text"`
		Model string `json:"model"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	text := req.Text
	chars := len([]rune(text))
	bytes := len(text)

	// Simple word count
	words := len(strings.Fields(text))

	// Approximate token count (cl100k_base average: ~4 chars/token for English, ~2 for CJK)
	hasCJK := false
	for _, r := range text {
		if unicode.Is(unicode.Han, r) || unicode.Is(unicode.Hangul, r) || unicode.Is(unicode.Hiragana, r) || unicode.Is(unicode.Katakana, r) {
			hasCJK = true
			break
		}
	}
	tokens := chars / 4
	if hasCJK {
		tokens = chars / 2
	}
	if tokens < 1 && chars > 0 {
		tokens = 1
	}

	model := req.Model
	if model == "" {
		model = "gpt-4"
	}

	c.JSON(http.StatusOK, gin.H{
		"count":      tokens,
		"model":      model,
		"chars":      chars,
		"bytes":      bytes,
		"words":      words,
		"note":       "approximate (server-side estimation)",
	})
}

