package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// LearnArticleMeta holds metadata for a learn article
type LearnArticleMeta struct {
	Slug          string
	Category      string
	Level         string // beginner | intermediate | advanced
	TitleEN       string
	TitleZH       string
	DescEN        string
	DescZH        string
	ReadTime      int
	Tags          []string
	CategoryLabel string
	LevelLabel    string
}

// learnArticles — 53 articles matching I-04 content plan
var learnArticles = []LearnArticleMeta{
	// ── Basics (10) ──────────────────────────────────────────────────
	{Slug: "what-is-json", Category: "basics", Level: "beginner",
		TitleZH: "什么是 JSON？零基础完全入门", TitleEN: "What is JSON? A Complete Beginner's Guide",
		DescZH: "从零开始理解 JSON 的概念、历史、语法基础和应用场景，配合可运行代码示例。",
		DescEN: "Understand JSON concepts, history, basic syntax and use cases from scratch, with runnable code examples.",
		ReadTime: 8, Tags: []string{"json", "basics", "introduction"}},
	{Slug: "json-syntax-rules", Category: "basics", Level: "beginner",
		TitleZH: "JSON 语法规则权威指南", TitleEN: "The Definitive Guide to JSON Syntax Rules",
		DescZH: "包含示例和常见陷阱的完整 JSON 语法规则可视化参考，覆盖 RFC 8259 全部要求。",
		DescEN: "Complete visual reference to every JSON syntax rule with examples and pitfalls, covering all RFC 8259 requirements.",
		ReadTime: 10, Tags: []string{"syntax", "rules", "RFC 8259"}},
	{Slug: "json-data-types", Category: "basics", Level: "beginner",
		TitleZH: "JSON 数据类型详解", TitleEN: "JSON Data Types Explained in Depth",
		DescZH: "深入讲解全部 6 种 JSON 数据类型：字符串、数字、布尔值、null、对象和数组。",
		DescEN: "Deep dive into all 6 JSON data types: strings, numbers, booleans, null, objects, and arrays.",
		ReadTime: 12, Tags: []string{"data types", "strings", "arrays", "objects"}},
	{Slug: "json-objects", Category: "basics", Level: "beginner",
		TitleZH: "JSON 对象深度解析", TitleEN: "Deep Dive into JSON Objects",
		DescZH: "全面讲解 JSON 对象的结构、嵌套、遍历和常用操作模式。",
		DescEN: "Comprehensive guide to JSON object structure, nesting, iteration and common operation patterns.",
		ReadTime: 10, Tags: []string{"objects", "keys", "values"}},
	{Slug: "json-arrays", Category: "basics", Level: "beginner",
		TitleZH: "JSON 数组完全指南", TitleEN: "The Complete Guide to JSON Arrays",
		DescZH: "从基本语法到多维数组，全面掌握 JSON 数组的使用方法和最佳实践。",
		DescEN: "From basic syntax to multi-dimensional arrays, master JSON array usage and best practices.",
		ReadTime: 10, Tags: []string{"arrays", "lists", "iteration"}},
	{Slug: "json-strings-escaping", Category: "basics", Level: "beginner",
		TitleZH: "JSON 字符串与转义字符详解", TitleEN: "JSON Strings and Escaping: Complete Guide",
		DescZH: "深入讲解 JSON 字符串语法、所有转义序列、Unicode 处理和常见陷阱。",
		DescEN: "In-depth guide to JSON string syntax, all escape sequences, Unicode handling and common pitfalls.",
		ReadTime: 8, Tags: []string{"strings", "escaping", "unicode"}},
	{Slug: "json-numbers-booleans-null", Category: "basics", Level: "beginner",
		TitleZH: "JSON 数值、布尔值与 null 详解", TitleEN: "JSON Numbers, Booleans and Null Explained",
		DescZH: "全面讲解 JSON 中数值的规则、布尔值的用法和 null 的语义。",
		DescEN: "Complete guide to JSON number rules, boolean usage and null semantics.",
		ReadTime: 8, Tags: []string{"numbers", "booleans", "null"}},
	{Slug: "json-nesting", Category: "basics", Level: "beginner",
		TitleZH: "JSON 嵌套结构与复杂数据建模", TitleEN: "JSON Nesting and Complex Data Modeling",
		DescZH: "学习如何用嵌套对象和数组表达复杂数据结构，避免过度嵌套的反模式。",
		DescEN: "Learn to model complex data with nested objects and arrays, and avoid over-nesting anti-patterns.",
		ReadTime: 12, Tags: []string{"nesting", "data modeling", "structure"}},
	{Slug: "first-json-file", Category: "basics", Level: "beginner",
		TitleZH: "创建你的第一个 JSON 文件", TitleEN: "Creating Your First JSON File",
		DescZH: "手把手教你创建、读取和写入 JSON 文件，适合绝对零基础的入门教程。",
		DescEN: "Step-by-step guide to creating, reading and writing JSON files for absolute beginners.",
		ReadTime: 8, Tags: []string{"files", "beginners", "tutorial"}},
	{Slug: "json-formatting-beautify", Category: "basics", Level: "beginner",
		TitleZH: "JSON 格式化与美化最佳实践", TitleEN: "JSON Formatting and Beautify Best Practices",
		DescZH: "如何格式化 JSON 以提高可读性，工具使用技巧以及何时压缩 JSON。",
		DescEN: "How to format JSON for readability, tooling tips, and when to minify for production.",
		ReadTime: 8, Tags: []string{"formatting", "pretty print", "minify"}},

	// ── Multi-Language (10) ──────────────────────────────────────────
	{Slug: "python-json", Category: "multi_lang", Level: "intermediate",
		TitleZH: "Python JSON 处理完全指南", TitleEN: "Complete Guide to JSON in Python",
		DescZH: "Python json 模块、自定义编解码器、Pydantic 模型和 orjson 性能优化全覆盖。",
		DescEN: "Python's json module, custom encoders/decoders, Pydantic models, and orjson for performance.",
		ReadTime: 15, Tags: []string{"Python", "json module", "Pydantic"}},
	{Slug: "javascript-json", Category: "multi_lang", Level: "intermediate",
		TitleZH: "JavaScript/Node.js JSON 操作大全", TitleEN: "Mastering JSON in JavaScript & Node.js",
		DescZH: "从 JSON.parse 到 JSON.stringify，高级模式、streaming 和 Node.js 生产实践。",
		DescEN: "From JSON.parse to JSON.stringify, advanced patterns, streaming and Node.js production tips.",
		ReadTime: 15, Tags: []string{"JavaScript", "Node.js", "JSON.parse"}},
	{Slug: "java-json", Category: "multi_lang", Level: "intermediate",
		TitleZH: "Java JSON 处理：Gson vs Jackson 深度对比", TitleEN: "Java JSON: Gson vs Jackson Deep Comparison",
		DescZH: "对比 Gson 与 Jackson 的特性、性能和 Spring Boot 集成，助你做出正确选型。",
		DescEN: "Compare Gson and Jackson features, performance and Spring Boot integration to make the right choice.",
		ReadTime: 18, Tags: []string{"Java", "Jackson", "Gson", "Spring Boot"}},
	{Slug: "go-json", Category: "multi_lang", Level: "intermediate",
		TitleZH: "Go 语言 JSON 编解码实战", TitleEN: "Go JSON Encoding & Decoding in Practice",
		DescZH: "encoding/json、struct 标签、自定义 marshaler、gjson 查询和大数据流式处理。",
		DescEN: "encoding/json, struct tags, custom marshalers, gjson for querying, and streaming large payloads.",
		ReadTime: 15, Tags: []string{"Go", "encoding/json", "struct tags"}},
	{Slug: "php-json", Category: "multi_lang", Level: "intermediate",
		TitleZH: "PHP JSON 处理实战指南", TitleEN: "Practical Guide to JSON in PHP",
		DescZH: "json_encode/json_decode 全部选项、错误处理、流式解析和安全陷阱。",
		DescEN: "All json_encode/json_decode options, error handling, streaming and security pitfalls.",
		ReadTime: 12, Tags: []string{"PHP", "json_encode", "json_decode"}},
	{Slug: "csharp-json", Category: "multi_lang", Level: "intermediate",
		TitleZH: "C# JSON 序列化与反序列化", TitleEN: "C# JSON Serialization & Deserialization",
		DescZH: "System.Text.Json vs Newtonsoft.Json 深度对比，含迁移指南和 .NET 8 新特性。",
		DescEN: "System.Text.Json vs Newtonsoft.Json deep comparison, migration guide and .NET 8 improvements.",
		ReadTime: 15, Tags: []string{"C#", ".NET", "System.Text.Json", "Newtonsoft"}},
	{Slug: "ruby-json", Category: "multi_lang", Level: "intermediate",
		TitleZH: "Ruby JSON 操作完全指南", TitleEN: "Complete Guide to JSON in Ruby",
		DescZH: "Ruby JSON gem、ActiveRecord 序列化、Oj 性能优化和 Rails API 实践。",
		DescEN: "Ruby JSON gem, ActiveRecord serialization, Oj for performance and Rails API patterns.",
		ReadTime: 10, Tags: []string{"Ruby", "Rails", "Oj gem"}},
	{Slug: "rust-json", Category: "multi_lang", Level: "intermediate",
		TitleZH: "Rust JSON 处理：serde 框架详解", TitleEN: "Rust JSON with serde: Complete Guide",
		DescZH: "serde_json 详解、自定义序列化、simd-json 超快解析和 Rust 错误处理模式。",
		DescEN: "serde_json in depth, custom serialization, simd-json for ultra-fast parsing and Rust error patterns.",
		ReadTime: 18, Tags: []string{"Rust", "serde", "serde_json", "performance"}},
	{Slug: "swift-json", Category: "multi_lang", Level: "intermediate",
		TitleZH: "Swift JSON Codable 协议完全指南", TitleEN: "Swift JSON Codable Protocol Complete Guide",
		DescZH: "Codable 协议、自定义 CodingKeys、嵌套编码策略和 Combine 集成。",
		DescEN: "Codable protocol, custom CodingKeys, nested encoding strategies and Combine integration.",
		ReadTime: 15, Tags: []string{"Swift", "iOS", "Codable", "Decodable"}},
	{Slug: "typescript-json", Category: "multi_lang", Level: "intermediate",
		TitleZH: "TypeScript 类型安全 JSON 处理", TitleEN: "Type-Safe JSON Handling in TypeScript",
		DescZH: "用 Zod、io-ts 和 TypeScript 泛型构建防弹 JSON 解析管道。",
		DescEN: "Use Zod, io-ts and TypeScript generics to build bulletproof JSON parsing pipelines.",
		ReadTime: 12, Tags: []string{"TypeScript", "Zod", "type safety"}},

	// ── Debugging (6) ────────────────────────────────────────────────
	{Slug: "common-json-mistakes", Category: "debugging", Level: "beginner",
		TitleZH: "JSON 常见语法错误大全与修复方案", TitleEN: "Common JSON Syntax Errors & How to Fix Them",
		DescZH: "30 个最常见 JSON 错误的完整目录，包含错误对比和一键修复示例。",
		DescEN: "A complete catalog of the 30 most frequent JSON errors with before/after fix examples.",
		ReadTime: 12, Tags: []string{"errors", "debugging", "syntax"}},
	{Slug: "json-parse-errors", Category: "debugging", Level: "intermediate",
		TitleZH: "JSON 解析错误排查完全指南", TitleEN: "Complete Guide to Debugging JSON Parse Errors",
		DescZH: "系统性排查每种 JSON 解析错误，包含各语言专用调试技巧。",
		DescEN: "Systematic guide to every type of JSON parse error with language-specific debugging tips.",
		ReadTime: 15, Tags: []string{"parse error", "debugging", "validation"}},
	{Slug: "unexpected-token", Category: "debugging", Level: "beginner",
		TitleZH: "修复 JSON Unexpected Token 错误", TitleEN: "Fix JSON Unexpected Token Errors",
		DescZH: "识别并修复由尾随逗号、BOM 标记、单引号和 HTML 注入引起的意外标记错误。",
		DescEN: "Identify and fix unexpected token errors from trailing commas, BOM markers, single quotes and HTML injection.",
		ReadTime: 8, Tags: []string{"unexpected token", "BOM", "trailing comma"}},
	{Slug: "unexpected-end-of-json", Category: "debugging", Level: "beginner",
		TitleZH: "修复 Unexpected End of JSON Input", TitleEN: "Fix Unexpected End of JSON Input",
		DescZH: "浏览器和 Node.js 中最常见 JSON 解析错误的根本原因和修复方法。",
		DescEN: "Root causes and fixes for the most common JSON parse error in browsers and Node.js.",
		ReadTime: 8, Tags: []string{"parse error", "Node.js", "truncated JSON"}},
	{Slug: "json-syntax-error-debug", Category: "debugging", Level: "beginner",
		TitleZH: "JSON 语法错误定位与调试技巧", TitleEN: "Locating and Debugging JSON Syntax Errors",
		DescZH: "如何精准定位 JSON 语法错误位置、使用验证器和构建 CI 自动检查。",
		DescEN: "How to pinpoint JSON syntax error locations, use validators and build CI checks.",
		ReadTime: 10, Tags: []string{"syntax error", "validation", "CI"}},
	{Slug: "json-debug-tools", Category: "debugging", Level: "intermediate",
		TitleZH: "JSON 调试工具完全指南", TitleEN: "Complete Guide to JSON Debug Tools",
		DescZH: "JSONLint、jq、VS Code、浏览器 DevTools 和 CLI 工具的完整 JSON 调试工作流。",
		DescEN: "Full JSON debugging workflow with JSONLint, jq, VS Code, browser DevTools and CLI tools.",
		ReadTime: 12, Tags: []string{"debug tools", "JSONLint", "jq", "DevTools"}},

	// ── Comparison (5) ───────────────────────────────────────────────
	{Slug: "json-vs-xml", Category: "comparison", Level: "intermediate",
		TitleZH: "JSON vs XML：全面深度对比", TitleEN: "JSON vs XML: A Comprehensive Deep Comparison",
		DescZH: "涵盖语法、工具链、性能和真实用例的 JSON vs XML 实用对比指南。",
		DescEN: "Practical comparison covering syntax, tooling, performance and real-world use cases.",
		ReadTime: 15, Tags: []string{"XML", "comparison", "data formats"}},
	{Slug: "json-vs-yaml", Category: "comparison", Level: "intermediate",
		TitleZH: "JSON vs YAML：配置文件选型指南", TitleEN: "JSON vs YAML: Configuration File Selection Guide",
		DescZH: "何时使用 YAML 而非 JSON 处理配置文件，以及 YAML 隐式类型的常见陷阱。",
		DescEN: "When to use YAML over JSON for config files and the pitfalls of YAML's implicit typing.",
		ReadTime: 12, Tags: []string{"YAML", "comparison", "configuration"}},
	{Slug: "json-vs-csv", Category: "comparison", Level: "intermediate",
		TitleZH: "JSON vs CSV：数据交换格式使用场景分析", TitleEN: "JSON vs CSV: Data Format Use Case Analysis",
		DescZH: "扁平 CSV 优于嵌套 JSON 的场景——文件大小、工具链和数据管道考量。",
		DescEN: "When flat CSV beats nested JSON — file size, tooling and data pipeline considerations.",
		ReadTime: 10, Tags: []string{"CSV", "comparison", "data processing"}},
	{Slug: "json-vs-protobuf", Category: "comparison", Level: "advanced",
		TitleZH: "JSON vs Protocol Buffers：性能与适用场景", TitleEN: "JSON vs Protocol Buffers: Performance & Use Cases",
		DescZH: "基准测试、二进制与文本的权衡，以及何时在微服务中从 JSON 迁移到 Protobuf。",
		DescEN: "Benchmarks, binary vs text trade-offs and when to migrate from JSON to Protobuf in microservices.",
		ReadTime: 12, Tags: []string{"Protobuf", "performance", "microservices"}},
	{Slug: "json5-jsonc", Category: "comparison", Level: "intermediate",
		TitleZH: "JSON5 与 JSONC：带注释的 JSON 扩展格式", TitleEN: "JSON5 & JSONC: Extended JSON Formats with Comments",
		DescZH: "何时使用 JSON5 或 JSONC 处理需要注释和尾随逗号的配置文件。",
		DescEN: "When to use JSON5 or JSONC for config files that need comments and trailing commas.",
		ReadTime: 8, Tags: []string{"JSON5", "JSONC", "comments", "config"}},

	// ── Advanced Topics (10) ─────────────────────────────────────────
	{Slug: "json-schema-intro", Category: "advanced_topics", Level: "advanced",
		TitleZH: "JSON Schema 从入门到精通", TitleEN: "JSON Schema: From Beginner to Expert",
		DescZH: "编写第一个 JSON Schema、理解关键字，并在 5 种语言中验证数据。",
		DescEN: "Write your first JSON Schema, understand keywords and validate data in 5 languages.",
		ReadTime: 20, Tags: []string{"JSON Schema", "validation", "Draft 2020-12"}},
	{Slug: "json-schema-advanced", Category: "advanced_topics", Level: "advanced",
		TitleZH: "JSON Schema 高级验证模式与实战", TitleEN: "Advanced JSON Schema Validation Patterns",
		DescZH: "高级模式：if/then/else、$ref、$defs、allOf/anyOf/oneOf 和递归 Schema。",
		DescEN: "Advanced patterns: if/then/else, $ref, $defs, allOf/anyOf/oneOf and recursive schemas.",
		ReadTime: 18, Tags: []string{"JSON Schema", "$ref", "conditionals"}},
	{Slug: "jsonpath", Category: "advanced_topics", Level: "advanced",
		TitleZH: "JSONPath 查询语法完全详解", TitleEN: "JSONPath Query Syntax: The Complete Reference",
		DescZH: "掌握 JSONPath 表达式、过滤器、递归下降，以及在 JavaScript、Python 和 Go 中的应用。",
		DescEN: "Master JSONPath expressions, filters, recursive descent and use with JavaScript, Python and Go.",
		ReadTime: 15, Tags: []string{"JSONPath", "querying", "data extraction"}},
	{Slug: "jq-guide", Category: "advanced_topics", Level: "advanced",
		TitleZH: "jq 命令行 JSON 处理神器完全指南", TitleEN: "jq: The Command-Line JSON Processing Powerhouse",
		DescZH: "从基本过滤器到高级转换、流式处理和真实 DevOps Shell 脚本。",
		DescEN: "From basic filters to advanced transformations, streaming and real DevOps shell scripts.",
		ReadTime: 20, Tags: []string{"jq", "command line", "terminal", "DevOps"}},
	{Slug: "jwt", Category: "advanced_topics", Level: "advanced",
		TitleZH: "JSON Web Token (JWT) 完全指南", TitleEN: "JSON Web Token (JWT) Complete Guide",
		DescZH: "JWT 结构、签名算法、常见漏洞（alg:none、密钥混淆）和安全存储最佳实践。",
		DescEN: "JWT structure, signing algorithms, common vulnerabilities (alg:none, key confusion) and secure storage.",
		ReadTime: 18, Tags: []string{"JWT", "security", "authentication", "tokens"}},
	{Slug: "json-ld", Category: "advanced_topics", Level: "advanced",
		TitleZH: "JSON-LD 结构化数据与 SEO 实战", TitleEN: "JSON-LD Structured Data & SEO in Practice",
		DescZH: "使用 JSON-LD 提升搜索排名：Article、FAQ、BreadcrumbList 和 Product schema。",
		DescEN: "Boost search rankings with JSON-LD: Article, FAQ, BreadcrumbList and Product schemas.",
		ReadTime: 15, Tags: []string{"JSON-LD", "SEO", "structured data", "schema.org"}},
	{Slug: "json-patch", Category: "advanced_topics", Level: "advanced",
		TitleZH: "JSON Patch（RFC 6902）操作指南", TitleEN: "JSON Patch (RFC 6902) Operation Guide",
		DescZH: "在 REST API 中使用 JSON Patch 操作实现部分更新，包含所有操作类型详解。",
		DescEN: "Implement partial updates in REST APIs with all JSON Patch operation types explained.",
		ReadTime: 12, Tags: []string{"JSON Patch", "RFC 6902", "REST API", "PATCH"}},
	{Slug: "json-pointer", Category: "advanced_topics", Level: "advanced",
		TitleZH: "JSON Pointer（RFC 6901）完全指南", TitleEN: "JSON Pointer (RFC 6901) Complete Guide",
		DescZH: "使用 RFC 6901 JSON Pointer 精确引用嵌套 JSON 文档中的任意值。",
		DescEN: "Use RFC 6901 JSON Pointers to precisely reference any value in nested JSON documents.",
		ReadTime: 10, Tags: []string{"JSON Pointer", "RFC 6901", "navigation"}},
	{Slug: "ndjson", Category: "advanced_topics", Level: "advanced",
		TitleZH: "NDJSON：换行符分隔 JSON 完全指南", TitleEN: "NDJSON: Newline-Delimited JSON Complete Guide",
		DescZH: "NDJSON 格式、流式处理应用场景和多语言实现示例。",
		DescEN: "NDJSON format, streaming use cases and multi-language implementation examples.",
		ReadTime: 10, Tags: []string{"NDJSON", "streaming", "newline-delimited"}},
	{Slug: "geojson", Category: "advanced_topics", Level: "advanced",
		TitleZH: "GeoJSON：地理数据标准完全指南", TitleEN: "GeoJSON: Complete Guide to Geographic Data Standard",
		DescZH: "GeoJSON 规范、几何类型、地图库集成和空间数据查询。",
		DescEN: "GeoJSON specification, geometry types, map library integration and spatial data queries.",
		ReadTime: 15, Tags: []string{"GeoJSON", "maps", "geographic data", "Leaflet"}},

	// ── Security & Performance (6) ───────────────────────────────────
	{Slug: "json-security", Category: "security", Level: "advanced",
		TitleZH: "JSON 安全最佳实践完全指南", TitleEN: "JSON Security Best Practices Complete Guide",
		DescZH: "防止 JSON 注入、原型污染、SSRF 通过 JSON URL 和不安全的反序列化。",
		DescEN: "Prevent JSON injection, prototype pollution, SSRF via JSON URLs and insecure deserialization.",
		ReadTime: 15, Tags: []string{"security", "injection", "SSRF", "prototype pollution"}},
	{Slug: "json-injection", Category: "security", Level: "advanced",
		TitleZH: "JSON 注入攻击原理与防御策略", TitleEN: "JSON Injection Attacks: Principles & Defense Strategies",
		DescZH: "JSON 注入的攻击向量、真实案例分析和全面的防御措施。",
		DescEN: "JSON injection attack vectors, real-world case analysis and comprehensive defense measures.",
		ReadTime: 15, Tags: []string{"injection", "XSS", "attack", "defense"}},
	{Slug: "json-performance", Category: "security", Level: "advanced",
		TitleZH: "大型 JSON 数据性能优化指南", TitleEN: "Large JSON Performance Optimization Guide",
		DescZH: "流式解析、二进制替代方案和各语言专用快速 JSON 库的性能优化策略。",
		DescEN: "Streaming parsing, binary alternatives and language-specific fast JSON libraries for optimization.",
		ReadTime: 18, Tags: []string{"performance", "streaming", "large files", "optimization"}},
	{Slug: "json-streaming", Category: "security", Level: "advanced",
		TitleZH: "JSON 流式解析技术详解", TitleEN: "JSON Streaming Parsing Techniques Explained",
		DescZH: "处理超大 JSON 文件的流式解析技术，含 Node.js、Python 和 Go 实现。",
		DescEN: "Streaming parsing techniques for large JSON files with Node.js, Python and Go implementations.",
		ReadTime: 15, Tags: []string{"streaming", "large files", "memory efficiency"}},
	{Slug: "json-compression", Category: "security", Level: "advanced",
		TitleZH: "JSON 压缩与传输优化实战", TitleEN: "JSON Compression & Transport Optimization",
		DescZH: "使用 gzip/Brotli、MessagePack、CBOR 和字段名优化减小 API 负载大小。",
		DescEN: "Reduce API payload sizes with gzip/Brotli, MessagePack, CBOR and field name optimization.",
		ReadTime: 12, Tags: []string{"compression", "gzip", "Brotli", "MessagePack"}},

	// ── Practical Applications (7) ───────────────────────────────────
	{Slug: "mongodb-json", Category: "practical", Level: "advanced",
		TitleZH: "MongoDB 与 JSON：文档数据库实战", TitleEN: "MongoDB & JSON: Document Database in Practice",
		DescZH: "MongoDB BSON vs JSON、CRUD 操作、索引、聚合管道和 JSON Schema 验证。",
		DescEN: "MongoDB BSON vs JSON, CRUD operations, indexing, aggregation pipelines and JSON Schema validation.",
		ReadTime: 18, Tags: []string{"MongoDB", "BSON", "NoSQL", "document database"}},
	{Slug: "postgresql-json", Category: "practical", Level: "advanced",
		TitleZH: "PostgreSQL JSON/JSONB 完全指南", TitleEN: "PostgreSQL JSON/JSONB Complete Guide",
		DescZH: "PostgreSQL 中 JSON vs JSONB 的选型、查询操作符、索引策略和性能调优。",
		DescEN: "JSON vs JSONB selection, query operators, indexing strategies and performance tuning in PostgreSQL.",
		ReadTime: 18, Tags: []string{"PostgreSQL", "JSONB", "SQL", "indexing"}},
	{Slug: "elasticsearch-json", Category: "practical", Level: "advanced",
		TitleZH: "Elasticsearch 与 JSON：全文搜索实战", TitleEN: "Elasticsearch & JSON: Full-Text Search in Practice",
		DescZH: "Elasticsearch 文档模型、Mapping 定义、查询 DSL 和聚合分析。",
		DescEN: "Elasticsearch document model, mapping definitions, query DSL and aggregation analysis.",
		ReadTime: 18, Tags: []string{"Elasticsearch", "full-text search", "mapping", "DSL"}},
	{Slug: "rest-api-json", Category: "practical", Level: "advanced",
		TitleZH: "RESTful API 中的 JSON 最佳实践", TitleEN: "JSON Best Practices in RESTful APIs",
		DescZH: "REST API 响应设计、错误格式、分页、版本控制和 HATEOAS。",
		DescEN: "REST API response design, error format, pagination, versioning and HATEOAS with JSON.",
		ReadTime: 18, Tags: []string{"REST API", "API design", "pagination", "versioning"}},
	{Slug: "graphql-json", Category: "practical", Level: "advanced",
		TitleZH: "JSON 与 GraphQL：现代 API 数据交互", TitleEN: "JSON & GraphQL: Modern API Data Interaction",
		DescZH: "GraphQL 如何使用 JSON 进行请求、响应和错误处理，包括持久化查询。",
		DescEN: "How GraphQL uses JSON for requests, responses and error handling, including persisted queries.",
		ReadTime: 15, Tags: []string{"GraphQL", "API", "queries", "mutations"}},
	{Slug: "json-config", Category: "practical", Level: "intermediate",
		TitleZH: "JSON 配置文件设计模式大全", TitleEN: "JSON Configuration File Design Patterns",
		DescZH: "package.json、tsconfig.json 等常见配置文件设计模式和最佳实践。",
		DescEN: "Design patterns and best practices for package.json, tsconfig.json and other JSON config files.",
		ReadTime: 15, Tags: []string{"configuration", "package.json", "tsconfig", "ESLint"}},
	{Slug: "json-ai-llm", Category: "practical", Level: "advanced",
		TitleZH: "JSON 与 AI/大语言模型应用实战", TitleEN: "JSON & AI/LLM Applications in Practice",
		DescZH: "强制 LLM 输出有效 JSON 的函数调用、结构化输出和验证管道实战。",
		DescEN: "Force LLMs to output valid JSON with function calling, structured outputs and validation pipelines.",
		ReadTime: 18, Tags: []string{"AI", "LLM", "structured output", "GPT", "Claude"}},
}

type LearnFAQItem struct {
	Question string
	Answer   string
}

// Category labels for all 5 languages
var catLabels = map[string]map[string]string{
	"en": {
		"basics": "Basics", "multi_lang": "Multi-Language", "debugging": "Debugging",
		"comparison": "Comparison", "advanced_topics": "Advanced Topics",
		"security": "Security & Performance", "practical": "Practical Apps",
	},
	"zh": {
		"basics": "基础入门", "multi_lang": "多语言实战", "debugging": "错误排查",
		"comparison": "格式对比", "advanced_topics": "高级主题",
		"security": "安全与性能", "practical": "实战应用",
	},
	"ja": {
		"basics": "基礎", "multi_lang": "マルチ言語", "debugging": "デバッグ",
		"comparison": "比較", "advanced_topics": "高度なトピック",
		"security": "セキュリティとパフォーマンス", "practical": "実践アプリ",
	},
	"ko": {
		"basics": "기초", "multi_lang": "다중 언어", "debugging": "디버깅",
		"comparison": "비교", "advanced_topics": "고급 주제",
		"security": "보안 및 성능", "practical": "실제 앱",
	},
	"spa": {
		"basics": "Fundamentos", "multi_lang": "Multiidioma", "debugging": "Depuración",
		"comparison": "Comparación", "advanced_topics": "Temas Avanzados",
		"security": "Seguridad y Rendimiento", "practical": "Aplicaciones Prácticas",
	},
}

// Level labels for all 5 languages
var levelLabels = map[string]map[string]string{
	"en":   {"beginner": "Beginner", "intermediate": "Intermediate", "advanced": "Advanced"},
	"zh":   {"beginner": "入门", "intermediate": "中级", "advanced": "高级"},
	"ja":   {"beginner": "入門", "intermediate": "中級", "advanced": "上級"},
	"ko":   {"beginner": "입문", "intermediate": "중급", "advanced": "고급"},
	"spa":  {"beginner": "Principiante", "intermediate": "Intermedio", "advanced": "Avanzado"},
}

// SEO title/description for all 5 languages
var seoTitles = map[string]string{
	"en":  "JSON Learning Hub — 53+ Free Tutorials | ToolboxNova",
	"zh":  "JSON 学习中心 — 53+ 篇免费教程 | ToolboxNova",
	"ja":  "JSON学習ハブ — 53以上の無料チュートリアル | ToolboxNova",
	"ko":  "JSON 학습 허브 — 53개 이상의 무료 튜토리얼 | ToolboxNova",
	"spa": "Centro de Aprendizaje JSON — Más de 53 Tutoriales Gratuitos | ToolboxNova",
}

var seoDescs = map[string]string{
	"en":  "From beginner to advanced, 53+ in-depth JSON tutorials covering syntax, multi-language practice, Schema, security & performance. Completely free.",
	"zh":  "从零基础到高级进阶，53+ 篇深度 JSON 教程，覆盖语法、多语言实战、Schema、安全与性能。完全免费，在线交互式学习。",
	"ja":  "初心者から上級者まで、構文、多言語実践、スキーマ、セキュリティとパフォーマンスをカバーする53以上の詳細なJSONチュートリアル。完全無料。",
	"ko":  "초보자부터 고급까지, 구문, 다중 언어 실습, 스키마, 보안 및 성능을 다루는 53개 이상의 심층 JSON 튜토리얼. 완전 무료.",
	"spa": "Desde principiante hasta avanzado, más de 53 tutoriales JSON en profundidad que cubren sintaxis, práctica multilingüe, Schema, seguridad y rendimiento. Completamente gratis.",
}

// UI translations for the learn page
var learnUITranslations = map[string]map[string]string{
	"en": {
		"nav_home":            "Home",
		"nav_learn":           "Learn JSON",
		"nav_datasets":        "Datasets",
		"hero_title":          "Learn JSON",
		"hero_subtitle":       "Everything you need to master JSON. From basic syntax to advanced validation, security, and real-world applications — plus free datasets.",
		"badge_tutorials":     "53+ Tutorials",
		"badge_datasets":      "70+ Datasets",
		"badge_languages":     "10 Languages",
		"badge_free":          "100% Free",
		"path_beginner":       "Beginner Path",
		"path_beginner_desc":  "Learn JSON syntax, data types, and basic file operations.",
		"path_intermediate":   "Intermediate Path",
		"path_intermediate_desc": "Multi-language practice, debugging, and format comparisons.",
		"path_advanced":       "Advanced Path",
		"path_advanced_desc":  "JSON Schema, JSONPath, jq, security, databases, and AI.",
		"articles":            "articles",
		"search_placeholder":  "Search tutorials…",
		"filter_all":          "All",
		"filter_basics":       "Basics",
		"filter_multi_lang":   "Multi-Language",
		"filter_debugging":    "Debugging",
		"filter_comparison":   "Comparison",
		"filter_advanced":     "Advanced",
		"filter_security":     "Security",
		"filter_practical":    "Practical",
		"level_all":           "All",
		"level_beginner":      "Beginner",
		"level_intermediate":  "Intermediate",
		"level_advanced":      "Advanced",
		"min_read":            "min",
		"read":                "Read",
		"no_results":          "No tutorials found",
		"no_results_desc":     "Try different keywords or clear filters.",
		"clear_filters":       "Clear filters",
		"feature_comprehensive": "Comprehensive",
		"feature_comprehensive_desc": "53+ tutorials from basics to JSON Schema, JSONPath, jq, security, and API design.",
		"feature_free":        "100% Free",
		"feature_free_desc":   "All tutorials, datasets, and code examples are completely free. No registration required.",
		"feature_practical":   "Practical",
		"feature_practical_desc": "Real-world examples, interactive code playgrounds, and downloadable sample data.",
		"faq_title":           "Frequently Asked Questions",
		"article_not_found":   "Article Not Found",
		"article_not_found_desc": "The article you're looking for doesn't exist or may have been moved.",
		"back_to_learn":       "Back to Learning Center",
		"article_in_progress": "📚 This article is being actively written. In the meantime, you can practice with our",
		"article_about":       "About This Topic",
		"article_tools":       "Recommended Tools",
		"article_related":     "Related Tools",
		"article_prev":        "Previous",
		"article_next":        "Next",
		"tool_validator":      "JSON Validator",
		"tool_formatter":      "JSON Formatter",
		"tool_diff":           "JSON Diff",
		"tool_schema":         "Schema Validator",
		"tool_free_datasets":  "Free Datasets",
		"minutes":             "minutes",
	},
	"zh": {
		"nav_home":            "首页",
		"nav_learn":           "学习 JSON",
		"nav_datasets":        "数据集",
		"hero_title":          "学习 JSON",
		"hero_subtitle":       "掌握 JSON 所需的一切。从基础语法到高级验证、安全和实战应用——以及为你的项目准备的免费数据集。",
		"badge_tutorials":     "53+ 篇教程",
		"badge_datasets":      "70+ 数据集",
		"badge_languages":     "10 种语言",
		"badge_free":          "完全免费",
		"path_beginner":       "入门路径",
		"path_beginner_desc":  "学习 JSON 语法、数据类型和基本文件操作。",
		"path_intermediate":   "中级路径",
		"path_intermediate_desc": "多语言实战、错误排查、格式对比。",
		"path_advanced":       "高级路径",
		"path_advanced_desc":  "Schema、JSONPath、jq、安全、数据库与 AI。",
		"articles":            "篇文章",
		"search_placeholder":  "搜索教程…",
		"filter_all":          "全部",
		"filter_basics":       "基础入门",
		"filter_multi_lang":   "多语言实战",
		"filter_debugging":    "错误排查",
		"filter_comparison":   "格式对比",
		"filter_advanced":     "高级主题",
		"filter_security":     "安全与性能",
		"filter_practical":    "实战应用",
		"level_all":           "全部",
		"level_beginner":      "入门",
		"level_intermediate":  "中级",
		"level_advanced":      "高级",
		"min_read":            "分钟",
		"read":                "已读",
		"no_results":          "没有找到匹配的教程",
		"no_results_desc":     "请尝试其他关键词或清除筛选。",
		"clear_filters":       "清除筛选",
		"feature_comprehensive": "全面覆盖",
		"feature_comprehensive_desc": "53+ 篇教程，从基础到 Schema、JSONPath、jq、安全和 API 设计。",
		"feature_free":        "完全免费",
		"feature_free_desc":   "所有教程、数据集和代码示例完全免费，无需注册。",
		"feature_practical":   "注重实战",
		"feature_practical_desc": "真实案例、交互式代码练习和可下载的样例数据。",
		"faq_title":           "常见问题",
		"article_not_found":   "文章未找到",
		"article_not_found_desc": "你访问的文章不存在或已被移动。",
		"back_to_learn":       "返回学习中心",
		"article_in_progress": "📚 本文正在持续完善中。你可以使用我们的",
		"article_about":       "关于本主题",
		"article_tools":       "推荐工具",
		"article_related":     "相关工具",
		"article_prev":        "上一篇",
		"article_next":        "下一篇",
		"tool_validator":      "JSON 验证器",
		"tool_formatter":      "JSON 格式化",
		"tool_diff":           "JSON 对比",
		"tool_schema":         "Schema 验证器",
		"tool_free_datasets":  "免费 JSON 数据集",
		"minutes":             "分钟",
	},
	"ja": {
		"nav_home":            "ホーム",
		"nav_learn":           "JSONを学ぶ",
		"nav_datasets":        "データセット",
		"hero_title":          "JSONを学ぶ",
		"hero_subtitle":       "JSONをマスターするために必要なすべて。基本的な構文から高度な検証、セキュリティ、実践的なアプリケーションまで — さらに無料のデータセット。",
		"badge_tutorials":     "53以上のチュートリアル",
		"badge_datasets":      "70以上のデータセット",
		"badge_languages":     "10言語",
		"badge_free":          "100%無料",
		"path_beginner":       "入門パス",
		"path_beginner_desc":  "JSONの構文、データ型、基本的なファイル操作を学ぶ。",
		"path_intermediate":   "中級パス",
		"path_intermediate_desc": "多言語実践、デバッグ、フォーマット比較。",
		"path_advanced":       "上級パス",
		"path_advanced_desc":  "JSONスキーマ、JSONPath、jq、セキュリティ、データベース、AI。",
		"articles":            "記事",
		"search_placeholder":  "チュートリアルを検索…",
		"filter_all":          "すべて",
		"filter_basics":       "基礎",
		"filter_multi_lang":   "マルチ言語",
		"filter_debugging":    "デバッグ",
		"filter_comparison":   "比較",
		"filter_advanced":     "高度なトピック",
		"filter_security":     "セキュリティ",
		"filter_practical":    "実践アプリ",
		"level_all":           "すべて",
		"level_beginner":      "入門",
		"level_intermediate":  "中級",
		"level_advanced":      "上級",
		"min_read":            "分",
		"read":                "読了",
		"no_results":          "チュートリアルが見つかりません",
		"no_results_desc":     "別のキーワードを試すか、フィルタをクリアしてください。",
		"clear_filters":       "フィルタをクリア",
		"feature_comprehensive": "包括的",
		"feature_comprehensive_desc": "基礎からJSONスキーマ、JSONPath、jq、セキュリティ、APIデザインまで53以上のチュートリアル。",
		"feature_free":        "100%無料",
		"feature_free_desc":   "すべてのチュートリアル、データセット、コード例は完全に無料。登録不要。",
		"feature_practical":   "実践的",
		"feature_practical_desc": "実世界の例、インタラクティブなコードプレイグラウンド、ダウンロード可能なサンプルデータ。",
		"faq_title":           "よくある質問",
		"article_not_found":   "記事が見つかりません",
		"article_not_found_desc": "お探しの記事は存在しないか、移動された可能性があります。",
		"back_to_learn":       "学習センターに戻る",
		"article_in_progress": "📚 この記事は現在執筆中です。その間、以下のツールで練習できます：",
		"article_about":       "このトピックについて",
		"article_tools":       "おすすめツール",
		"article_related":     "関連ツール",
		"article_prev":        "前へ",
		"article_next":        "次へ",
		"tool_validator":      "JSONバリデーター",
		"tool_formatter":      "JSONフォーマッター",
		"tool_diff":           "JSON差分",
		"tool_schema":         "スキーマバリデーター",
		"tool_free_datasets":  "無料データセット",
		"minutes":             "分",
	},
	"ko": {
		"nav_home":            "홈",
		"nav_learn":           "JSON 배우기",
		"nav_datasets":        "데이터셋",
		"hero_title":          "JSON 배우기",
		"hero_subtitle":       "JSON을 마스터하는 데 필요한 모든 것. 기본 구문에서 고급 검증, 보안 및 실제 응용 프로그램까지 — 그리고 무료 데이터셋.",
		"badge_tutorials":     "53개 이상의 튜토리얼",
		"badge_datasets":      "70개 이상의 데이터셋",
		"badge_languages":     "10개 언어",
		"badge_free":          "100% 무료",
		"path_beginner":       "입문 경로",
		"path_beginner_desc":  "JSON 구문, 데이터 유형 및 기본 파일 작업을 배웁니다.",
		"path_intermediate":   "중급 경로",
		"path_intermediate_desc": "다중 언어 실습, 디버깅 및 형식 비교.",
		"path_advanced":       "고급 경로",
		"path_advanced_desc":  "JSON 스키마, JSONPath, jq, 보안, 데이터베이스 및 AI.",
		"articles":            "개 글",
		"search_placeholder":  "튜토리얼 검색…",
		"filter_all":          "모두",
		"filter_basics":       "기초",
		"filter_multi_lang":   "다중 언어",
		"filter_debugging":    "디버깅",
		"filter_comparison":   "비교",
		"filter_advanced":     "고급 주제",
		"filter_security":     "보안",
		"filter_practical":    "실제 앱",
		"level_all":           "모두",
		"level_beginner":      "입문",
		"level_intermediate":  "중급",
		"level_advanced":      "고급",
		"min_read":            "분",
		"read":                "읽음",
		"no_results":          "튜토리얼을 찾을 수 없습니다",
		"no_results_desc":     "다른 키워드를 시도하거나 필터를 지우세요.",
		"clear_filters":       "필터 지우기",
		"feature_comprehensive": "포괄적",
		"feature_comprehensive_desc": "기본부터 JSON 스키마, JSONPath, jq, 보안 및 API 디자인까지 53개 이상의 튜토리얼.",
		"feature_free":        "100% 무료",
		"feature_free_desc":   "모든 튜토리얼, 데이터셋 및 코드 예제는 완전히 무료입니다. 등록 불필요.",
		"feature_practical":   "실용적",
		"feature_practical_desc": "실제 예제, 대화형 코드 놀이터 및 다운로드 가능한 샘플 데이터.",
		"faq_title":           "자주 묻는 질문",
		"article_not_found":   "글을 찾을 수 없습니다",
		"article_not_found_desc": "찾으시는 글이 존재하지 않거나 이동되었을 수 있습니다.",
		"back_to_learn":       "학습 센터로 돌아가기",
		"article_in_progress": "📚 이 글은 현재 작성 중입니다. 그 동안 다음 도구로 연습할 수 있습니다:",
		"article_about":       "이 주제에 대해",
		"article_tools":       "추천 도구",
		"article_related":     "관련 도구",
		"article_prev":        "이전",
		"article_next":        "다음",
		"tool_validator":      "JSON 검증기",
		"tool_formatter":      "JSON 포맷터",
		"tool_diff":           "JSON 비교",
		"tool_schema":         "스키마 검증기",
		"tool_free_datasets":  "무료 데이터셋",
		"minutes":             "분",
	},
	"spa": {
		"nav_home":            "Inicio",
		"nav_learn":           "Aprender JSON",
		"nav_datasets":        "Conjuntos de datos",
		"hero_title":          "Aprender JSON",
		"hero_subtitle":       "Todo lo que necesitas para dominar JSON. Desde sintaxis básica hasta validación avanzada, seguridad y aplicaciones del mundo real — más conjuntos de datos gratuitos.",
		"badge_tutorials":     "Más de 53 tutoriales",
		"badge_datasets":      "Más de 70 conjuntos de datos",
		"badge_languages":     "10 idiomas",
		"badge_free":          "100% gratis",
		"path_beginner":       "Ruta principiante",
		"path_beginner_desc":  "Aprende sintaxis JSON, tipos de datos y operaciones básicas de archivos.",
		"path_intermediate":   "Ruta intermedio",
		"path_intermediate_desc": "Práctica multilingüe, depuración y comparaciones de formatos.",
		"path_advanced":       "Ruta avanzado",
		"path_advanced_desc":  "JSON Schema, JSONPath, jq, seguridad, bases de datos e IA.",
		"articles":            "artículos",
		"search_placeholder":  "Buscar tutoriales…",
		"filter_all":          "Todo",
		"filter_basics":       "Fundamentos",
		"filter_multi_lang":   "Multiidioma",
		"filter_debugging":    "Depuración",
		"filter_comparison":   "Comparación",
		"filter_advanced":     "Temas avanzados",
		"filter_security":     "Seguridad",
		"filter_practical":    "Aplicaciones prácticas",
		"level_all":           "Todo",
		"level_beginner":      "Principiante",
		"level_intermediate":  "Intermedio",
		"level_advanced":      "Avanzado",
		"min_read":            "min",
		"read":                "Leído",
		"no_results":          "No se encontraron tutoriales",
		"no_results_desc":     "Intenta con otras palabras clave o limpia los filtros.",
		"clear_filters":       "Limpiar filtros",
		"feature_comprehensive": "Integral",
		"feature_comprehensive_desc": "Más de 53 tutoriales desde lo básico hasta JSON Schema, JSONPath, jq, seguridad y diseño de API.",
		"feature_free":        "100% gratis",
		"feature_free_desc":   "Todos los tutoriales, conjuntos de datos y ejemplos de código son completamente gratis. No se requiere registro.",
		"feature_practical":   "Práctico",
		"feature_practical_desc": "Ejemplos del mundo real, áreas de juego de código interactivo y datos de muestra descargables.",
		"faq_title":           "Preguntas frecuentes",
		"article_not_found":   "Artículo no encontrado",
		"article_not_found_desc": "El artículo que buscas no existe o puede haber sido movido.",
		"back_to_learn":       "Volver al centro de aprendizaje",
		"article_in_progress": "📚 Este artículo se está escribiendo activamente. Mientras tanto, puedes practicar con nuestras",
		"article_about":       "Sobre este tema",
		"article_tools":       "Herramientas recomendadas",
		"article_related":     "Herramientas relacionadas",
		"article_prev":        "Anterior",
		"article_next":        "Siguiente",
		"tool_validator":      "Validador JSON",
		"tool_formatter":      "Formateador JSON",
		"tool_diff":           "Diff JSON",
		"tool_schema":         "Validador de esquema",
		"tool_free_datasets":  "Conjuntos de datos gratis",
		"minutes":             "minutos",
	},
}

// getUITranslation returns the UI translation for a key in the given language
func getUITranslation(lang, key string) string {
	translations, ok := learnUITranslations[lang]
	if !ok {
		translations = learnUITranslations["en"]
	}
	if val, ok := translations[key]; ok {
		return val
	}
	// Fallback to English
	if enTranslations, ok := learnUITranslations["en"]; ok {
		if val, ok := enTranslations[key]; ok {
			return val
		}
	}
	return key
}

// getUITranslations returns all UI translations for a language
func getUITranslations(lang string) map[string]string {
	translations, ok := learnUITranslations[lang]
	if !ok {
		return learnUITranslations["en"]
	}
	return translations
}

func getLearnFAQ(lang string) []LearnFAQItem {
	// Chinese FAQ
	if lang == "zh" {
		return []LearnFAQItem{
			{Question: "ToolboxNova 的 JSON 教程适合完全零基础的人吗？",
				Answer: "完全适合。我们的入门路径从「什么是 JSON」讲起，用大量图解和可运行的代码示例，帮助零基础用户在 2 小时内掌握 JSON 核心概念。每篇文章都有难度标识，你可以按照入门 → 中级 → 高级的路径循序渐进。"},
			{Question: "这些教程覆盖哪些编程语言？",
				Answer: "覆盖 10 种主流语言：Python、JavaScript/Node.js、Java（Gson/Jackson）、Go、C#、PHP、Ruby、Rust（serde）、Swift 和 TypeScript。每种语言都有独立的深度教程，包含完整可运行的代码示例。"},
			{Question: "教程中的代码示例可以直接运行吗？",
				Answer: "是的。我们的教程内嵌了代码高亮和复制功能，JSON 相关的示例可以直接在 ToolboxNova 的 JSON 工具中验证和运行。你可以修改代码、实时查看结果，无需安装任何开发环境。"},
			{Question: "JSON 教程内容会持续更新吗？",
				Answer: "会。我们持续跟踪 JSON 生态的最新发展，包括新的 RFC 标准、JSON Schema 更新、安全最佳实践等。目前已有 53 篇教程，计划在 2026 年底扩展到 70+ 篇，新增 AI/大模型、边缘计算等前沿主题。"},
			{Question: "这些教程和 W3Schools、MDN 的 JSON 教程有什么不同？",
				Answer: "我们的教程更深入、更系统。W3Schools 侧重快速入门（约 15 篇），MDN 侧重 Web API 文档（约 8 篇）。我们提供 53+ 篇覆盖完整知识体系的教程，从基础语法到 JSON Schema、JSONPath、安全防御、性能优化，配备代码高亮、复制和中英文切换功能。"},
		}
	}
	// Japanese FAQ
	if lang == "ja" {
		return []LearnFAQItem{
			{Question: "ToolboxNovaのJSONチュートリアルは完全な初心者でも大丈夫ですか？",
				Answer: "もちろんです。初心者向けのパスは「JSONとは何か」から始まり、図解と実行可能なコード例で、初心者でも2時間以内にJSONの核心概念を理解できます。各記事には難易度表示があり、入門→中級→上級の順で学習できます。"},
			{Question: "どのプログラミング言語をカバーしていますか？",
				Answer: "10の主要言語をカバーしています：Python、JavaScript/Node.js、Java（Gson/Jackson）、Go、C#、PHP、Ruby、Rust（serde）、Swift、TypeScript。各言語には独立した詳細なチュートリアルと、完全に実行可能なコード例が含まれています。"},
			{Question: "チュートリアルのコード例は実行できますか？",
				Answer: "はい。チュートリアルにはシンタックスハイライトとワンクリックコピー機能があります。JSON関連の例は、ToolboxNovaのJSONツールで直接検証・テストでき、開発環境をインストールする必要はありません。"},
			{Question: "チュートリアルの内容は継続的に更新されますか？",
				Answer: "はい。新しいRFC標準、JSON Schemaの更新、セキュリティのベストプラクティスなど、JSONエコシステムの最新動向を追跡しています。現在53のチュートリアルがあり、2026年末までに70以上に拡張し、AI/LLMやエッジコンピューティングのトピックを追加する予定です。"},
			{Question: "W3SchoolsやMDNのJSONチュートリアルとどう違いますか？",
				Answer: "当サイトのチュートリアルはより深く、体系的です。W3Schoolsはクイックスタート（約15記事）、MDNはWeb APIドキュメント（約8記事）に焦点を当てています。当サイトは基礎構文からJSON Schema、JSONPath、セキュリティ、パフォーマンスまで完全な知識体系をカバーする53以上の記事を提供し、シンタックスハイライト、コピーボタン、バイリンガルサポートを備えています。"},
		}
	}
	// Korean FAQ
	if lang == "ko" {
		return []LearnFAQItem{
			{Question: "ToolboxNova의 JSON 튜토리얼은 완전 초보자도 이해할 수 있나요?",
				Answer: "물론입니다. 초보자 경로는 'JSON이란 무엇인가'부터 시작하여 다이어그램과 실행 가능한 코드 예제로 2시간 이내에 JSON 핵심 개념을 파악할 수 있습니다. 각 글에는 난이도 표시가 있으며, 입문 → 중급 → 고급 순서로 학습할 수 있습니다."},
			{Question: "어떤 프로그래밍 언어를 다루나요?",
				Answer: "10개의 주요 언어를 다룹니다: Python, JavaScript/Node.js, Java (Gson/Jackson), Go, C#, PHP, Ruby, Rust (serde), Swift, TypeScript. 각 언어에는 독립적인 심층 튜토리얼과 완전히 실행 가능한 코드 예제가 포함되어 있습니다."},
			{Question: "튜토리얼의 코드 예제를 직접 실행할 수 있나요?",
				Answer: "네. 튜토리얼에는 구문 강조와 원클릭 복사 기능이 있습니다. JSON 관련 예제는 개발 환경을 설치하지 않고도 ToolboxNova의 JSON 도구에서 직접 검증하고 테스트할 수 있습니다."},
			{Question: "튜토리얼 내용은 지속적으로 업데이트되나요?",
				Answer: "네. 새로운 RFC 표준, JSON Schema 업데이트, 보안 모범 사례 등 JSON 생태계의 최신 동향을 계속 추적하고 있습니다. 현재 53개의 튜토리얼이 있으며, 2026년 말까지 AI/LLM 및 엣지 컴퓨팅 주제를 포함하여 70개 이상으로 확장할 계획입니다."},
			{Question: "W3Schools나 MDN JSON 튜토리얼과 어떻게 다른가요?",
				Answer: "당사 튜토리얼은 더 깊고 체계적입니다. W3Schools는 빠른 시작(약 15개)에, MDN은 Web API 문서(약 8개)에 중점을 둡니다. 당사는 기본 구문부터 JSON Schema, JSONPath, 보안 및 성능까지 완전한 지식 체계를 다루는 53개 이상의 글을 제공하며, 구문 강조, 복사 버튼, 이중 언어 지원을 갖추고 있습니다."},
		}
	}
	// Spanish FAQ
	if lang == "spa" {
		return []LearnFAQItem{
			{Question: "¿Los tutoriales JSON de ToolboxNova son adecuados para principiantes completos?",
				Answer: "Absolutamente. Nuestra ruta para principiantes comienza desde '¿Qué es JSON?' con diagramas visuales y ejemplos de código ejecutables, ayudando a los principiantes a comprender los conceptos clave de JSON en 2 horas. Cada artículo tiene un indicador de dificultad, y puedes seguir la ruta principiante → intermedio → avanzado progresivamente."},
			{Question: "¿Qué lenguajes de programación cubren estos tutoriales?",
				Answer: "Cubrimos 10 lenguajes principales: Python, JavaScript/Node.js, Java (Gson/Jackson), Go, C#, PHP, Ruby, Rust (serde), Swift y TypeScript. Cada lenguaje tiene un tutorial dedicado con ejemplos de código completos y ejecutables."},
			{Question: "¿Puedo ejecutar los ejemplos de código en los tutoriales?",
				Answer: "Sí. Nuestros tutoriales incluyen resaltado de sintaxis y copia con un clic. Los ejemplos relacionados con JSON se pueden validar y probar directamente en las herramientas JSON de ToolboxNova sin necesidad de instalar ningún entorno de desarrollo."},
			{Question: "¿El contenido del tutorial se actualizará continuamente?",
				Answer: "Sí. Rastreamos continuamente los últimos desarrollos del ecosistema JSON, incluidos nuevos estándares RFC, actualizaciones de JSON Schema y mejores prácticas de seguridad. Actualmente tenemos 53 tutoriales y planeamos expandirnos a más de 70 para finales de 2026, cubriendo temas de IA/LLM y computación en el borde."},
			{Question: "¿En qué se diferencian de los tutoriales JSON de W3Schools o MDN?",
				Answer: "Nuestros tutoriales son más profundos y sistemáticos. W3Schools se centra en inicios rápidos (~15 artículos), MDN en documentación de Web API (~8 artículos). Nosotros proporcionamos más de 53 artículos que cubren el sistema de conocimiento completo, desde sintaxis básica hasta JSON Schema, JSONPath, seguridad y rendimiento, con resaltado de sintaxis, botones de copia y soporte bilingüe."},
		}
	}
	// English FAQ (default)
	return []LearnFAQItem{
		{Question: "Are ToolboxNova's JSON tutorials suitable for complete beginners?",
			Answer: "Absolutely. Our beginner path starts from 'What is JSON' with visual diagrams and runnable code examples, helping beginners grasp core JSON concepts within 2 hours. Each article has a difficulty indicator, and you can follow the beginner → intermediate → advanced path progressively."},
		{Question: "Which programming languages do these tutorials cover?",
			Answer: "We cover 10 mainstream languages: Python, JavaScript/Node.js, Java (Gson/Jackson), Go, C#, PHP, Ruby, Rust (serde), Swift and TypeScript. Each language has a dedicated in-depth tutorial with complete runnable code examples."},
		{Question: "Can I run the code examples in the tutorials?",
			Answer: "Yes. Our tutorials feature syntax highlighting and one-click copy. JSON-related examples can be validated and tested directly in ToolboxNova's JSON tools without installing any development environment."},
		{Question: "Will the tutorial content be continuously updated?",
			Answer: "Yes. We continuously track the latest JSON ecosystem developments, including new RFC standards, JSON Schema updates and security best practices. We currently have 53 tutorials and plan to expand to 70+ by end of 2026, covering AI/LLM and edge computing topics."},
		{Question: "How are these different from W3Schools or MDN JSON tutorials?",
			Answer: "Our tutorials are deeper and more systematic. W3Schools focuses on quick starts (~15 articles), MDN on Web API docs (~8 articles). We provide 53+ articles covering the complete knowledge system, from basic syntax to JSON Schema, JSONPath, security and performance, with syntax highlighting, copy buttons and bilingual support."},
	}
}

// getLabels returns the category and level labels for a given language
func getLabels(lang string) (map[string]string, map[string]string) {
	cat, ok := catLabels[lang]
	if !ok {
		cat = catLabels["en"]
	}
	lvl, ok := levelLabels[lang]
	if !ok {
		lvl = levelLabels["en"]
	}
	return cat, lvl
}

func getLearnArticleBySlug(slug, lang string) *LearnArticleMeta {
	catL, lvlL := getLabels(lang)

	for i := range learnArticles {
		if learnArticles[i].Slug == slug {
			a := learnArticles[i]
			a.LevelLabel = lvlL[a.Level]
			a.CategoryLabel = catL[a.Category]
			return &a
		}
	}
	return nil
}

// JSONLearnHub renders the JSON learn hub page
func JSONLearnHub(c *gin.Context) {
	lang := c.GetString("lang")
	if lang == "" {
		lang = "en"
	}
	t := getT(c)

	catL, lvlL := getLabels(lang)

	articles := make([]gin.H, 0, len(learnArticles))
	for _, a := range learnArticles {
		title, desc := a.TitleEN, a.DescEN
		if lang == "zh" {
			title, desc = a.TitleZH, a.DescZH
		}
		articles = append(articles, gin.H{
			"Slug":          a.Slug,
			"Category":      a.Category,
			"Level":         a.Level,
			"Title":         title,
			"TitleZH":       a.TitleZH,
			"TitleEN":       a.TitleEN,
			"Desc":          desc,
			"ReadTime":      a.ReadTime,
			"LevelLabel":    lvlL[a.Level],
			"CategoryLabel": catL[a.Category],
		})
	}

	title, ok := seoTitles[lang]
	if !ok {
		title = seoTitles["en"]
	}
	desc, ok := seoDescs[lang]
	if !ok {
		desc = seoDescs["en"]
	}

	data := baseData(c, gin.H{
		"Title":        title,
		"Description":  desc,
		"Keywords":     "learn json, json tutorial, json guide, json schema, jsonpath, json security, free json tutorials",
		"Lang":         lang,
		"T":            t,
		"Articles":     articles,
		"FAQ":          getLearnFAQ(lang),
		"UI":           getUITranslations(lang),
		"Canonical":    "https://toolboxnova.com/json/learn",
		"CanonicalURL": "https://toolboxnova.com/json/learn",
		"HreflangEN":   "https://toolboxnova.com/json/learn?lang=en",
		"HreflangZH":   "https://toolboxnova.com/json/learn?lang=zh",
		"HreflangJA":   "https://toolboxnova.com/json/learn?lang=ja",
		"HreflangKO":   "https://toolboxnova.com/json/learn?lang=ko",
		"HreflangSPA":  "https://toolboxnova.com/json/learn?lang=spa",
		"PageClass":    "page-json-learn",
	})
	renderJSONTool(c, "learn.html", data)
}

// JSONLearnArticle renders a single learn article page
func JSONLearnArticle(c *gin.Context) {
	slug := c.Param("slug")
	lang := c.GetString("lang")
	if lang == "" {
		lang = "en"
	}
	t := getT(c)

	article := getLearnArticleBySlug(slug, lang)
	if article == nil {
		c.HTML(http.StatusNotFound, "json/learn.html", gin.H{
			"Lang":      lang,
			"NotFound":  true,
			"UI":        getUITranslations(lang),
			"PageClass": "page-json-learn",
		})
		return
	}

	title, desc := article.TitleEN, article.DescEN
	if lang == "zh" {
		title, desc = article.TitleZH, article.DescZH
	}

	seoTitle, ok := seoTitles[lang]
	if !ok {
		seoTitle = seoTitles["en"]
	}

	// Find prev/next
	var prevArticle, nextArticle *gin.H
	for i, a := range learnArticles {
		if a.Slug == slug {
			if i > 0 {
				prev := learnArticles[i-1]
				prevTitle := prev.TitleEN
				if lang == "zh" {
					prevTitle = prev.TitleZH
				}
				h := gin.H{"Slug": prev.Slug, "Title": prevTitle}
				prevArticle = &h
			}
			if i < len(learnArticles)-1 {
				next := learnArticles[i+1]
				nextTitle := next.TitleEN
				if lang == "zh" {
					nextTitle = next.TitleZH
				}
				h := gin.H{"Slug": next.Slug, "Title": nextTitle}
				nextArticle = &h
			}
			break
		}
	}

	data := baseData(c, gin.H{
		"Title":        title + " | " + seoTitle,
		"Description":  desc,
		"Keywords":     "json learn, " + slug + ", json tutorial",
		"Lang":         lang,
		"T":            t,
		"Article":      article,
		"ArticleTitle": title,
		"ArticleDesc":  desc,
		"PrevArticle":  prevArticle,
		"NextArticle":  nextArticle,
		"UI":           getUITranslations(lang),
		"Canonical":    "https://toolboxnova.com/json/learn/" + slug,
		"CanonicalURL": "https://toolboxnova.com/json/learn/" + slug,
		"HreflangEN":   "https://toolboxnova.com/json/learn/" + slug + "?lang=en",
		"HreflangZH":   "https://toolboxnova.com/json/learn/" + slug + "?lang=zh",
		"HreflangJA":   "https://toolboxnova.com/json/learn/" + slug + "?lang=ja",
		"HreflangKO":   "https://toolboxnova.com/json/learn/" + slug + "?lang=ko",
		"HreflangSPA":  "https://toolboxnova.com/json/learn/" + slug + "?lang=spa",
		"PageClass":    "page-json-learn-article",
	})
	renderJSONTool(c, "learn.html", data)
}
