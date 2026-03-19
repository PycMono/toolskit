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

func getLearnFAQ(lang string) []LearnFAQItem {
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

func getLearnArticleBySlug(slug, lang string) *LearnArticleMeta {
	catLabelsEN := map[string]string{
		"basics": "Basics", "multi_lang": "Multi-Language", "debugging": "Debugging",
		"comparison": "Comparison", "advanced_topics": "Advanced Topics",
		"security": "Security & Performance", "practical": "Practical Apps",
	}
	catLabelsZH := map[string]string{
		"basics": "基础入门", "multi_lang": "多语言实战", "debugging": "错误排查",
		"comparison": "格式对比", "advanced_topics": "高级主题",
		"security": "安全与性能", "practical": "实战应用",
	}
	levelLabelsEN := map[string]string{"beginner": "Beginner", "intermediate": "Intermediate", "advanced": "Advanced"}
	levelLabelsZH := map[string]string{"beginner": "入门", "intermediate": "中级", "advanced": "高级"}

	for i := range learnArticles {
		if learnArticles[i].Slug == slug {
			a := learnArticles[i]
			if lang == "zh" {
				a.LevelLabel = levelLabelsZH[a.Level]
				a.CategoryLabel = catLabelsZH[a.Category]
			} else {
				a.LevelLabel = levelLabelsEN[a.Level]
				a.CategoryLabel = catLabelsEN[a.Category]
			}
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

	catLabelsEN := map[string]string{
		"basics": "Basics", "multi_lang": "Multi-Language", "debugging": "Debugging",
		"comparison": "Comparison", "advanced_topics": "Advanced Topics",
		"security": "Security & Performance", "practical": "Practical Apps",
	}
	catLabelsZH := map[string]string{
		"basics": "基础入门", "multi_lang": "多语言实战", "debugging": "错误排查",
		"comparison": "格式对比", "advanced_topics": "高级主题",
		"security": "安全与性能", "practical": "实战应用",
	}
	levelLabelsEN := map[string]string{"beginner": "Beginner", "intermediate": "Intermediate", "advanced": "Advanced"}
	levelLabelsZH := map[string]string{"beginner": "入门", "intermediate": "中级", "advanced": "高级"}

	articles := make([]gin.H, 0, len(learnArticles))
	for _, a := range learnArticles {
		title, desc, lvl, cat := a.TitleEN, a.DescEN, levelLabelsEN[a.Level], catLabelsEN[a.Category]
		if lang == "zh" {
			title, desc, lvl, cat = a.TitleZH, a.DescZH, levelLabelsZH[a.Level], catLabelsZH[a.Category]
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
			"LevelLabel":    lvl,
			"CategoryLabel": cat,
		})
	}

	titleMap := map[string]string{
		"zh": "JSON 学习中心 — 53+ 篇免费教程 | ToolboxNova",
		"en": "JSON Learning Hub — 53+ Free Tutorials | ToolboxNova",
	}
	descMap := map[string]string{
		"zh": "从零基础到高级进阶，53+ 篇深度 JSON 教程，覆盖语法、多语言实战、Schema、安全与性能。完全免费，在线交互式学习。",
		"en": "From beginner to advanced, 53+ in-depth JSON tutorials covering syntax, multi-language practice, Schema, security & performance. Completely free.",
	}

	data := baseData(c, gin.H{
		"Title":        titleMap[lang],
		"Description":  descMap[lang],
		"Keywords":     "learn json, json tutorial, json guide, json schema, jsonpath, json security, free json tutorials",
		"Lang":         lang,
		"T":            t,
		"Articles":     articles,
		"FAQ":          getLearnFAQ(lang),
		"CanonicalURL": "https://toolboxnova.com/json/learn",
		"HreflangEN":   "https://toolboxnova.com/json/learn?lang=en",
		"HreflangZH":   "https://toolboxnova.com/json/learn?lang=zh",
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
			"PageClass": "page-json-learn",
		})
		return
	}

	title, desc := article.TitleEN, article.DescEN
	if lang == "zh" {
		title, desc = article.TitleZH, article.DescZH
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
		"Title":        title + " | JSON 学习中心 | ToolboxNova",
		"Description":  desc,
		"Keywords":     "json learn, " + slug + ", json tutorial",
		"Lang":         lang,
		"T":            t,
		"Article":      article,
		"ArticleTitle": title,
		"ArticleDesc":  desc,
		"PrevArticle":  prevArticle,
		"NextArticle":  nextArticle,
		"CanonicalURL": "https://toolboxnova.com/json/learn/" + slug,
		"HreflangEN":   "https://toolboxnova.com/json/learn/" + slug + "?lang=en",
		"HreflangZH":   "https://toolboxnova.com/json/learn/" + slug + "?lang=zh",
		"PageClass":    "page-json-learn-article",
	})
	renderJSONTool(c, "learn.html", data)
}

