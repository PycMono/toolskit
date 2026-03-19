<!-- json-learn-I-00_总览索引.md -->

# JSON Learn — 总览索引 (I-00)

```yaml
工具名称:   json-learn
工具路由:   /json/learn
主色调:     知识蓝 #1e40af，辅助色 #3b82f6
网站域名:   toolboxnova.com
竞品链接:
  - https://jsonlint.com/learn          # 13 篇文章 + 47 数据集
  - https://www.w3schools.com/js/js_json.asp  # JSON 基础 10+ 页
  - https://www.geeksforgeeks.org/javascript/json/  # 多篇教程
  - https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/JSON
  - https://www.tutorialspoint.com/json/index.htm
  - https://json-schema.org/learn
  - https://learnxinyminutes.com/json/
技术约束:
  - 纯前端渲染，文章由 Go Template 服务端注入
  - 代码高亮依赖 CDN（Prism.js）
  - 后端：Go（Gin + Go Template）
功能描述:   全球最全面的 JSON 学习中心——50+ 篇专业教程 + 70+ 免费数据集 + 交互 Playground
特殊说明:   学习中心为核心 SEO 流量入口，每篇文章独立路由，全站中英文双语
```

---

## 一、产品架构图

```
用户入口
│  Google / Bing / 站内导航 / 首页卡片
│
▼
┌───────────────────────────────────────────────────────────────┐
│                     Learn Hub 主页 /json/learn                 │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ Featured │ │ Category │ │ Level    │ │ Search   │          │
│  │ 精选推荐  │ │ 分类导航  │ │ 难度筛选  │ │ 模糊搜索  │          │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘          │
│       └────────────┴────────────┴────────────┘                 │
│  ┌───────────────────┐  ┌──────────────────────────────────┐  │
│  │  学习路径卡片 ×3    │  │  文章网格                        │  │
│  │  Beginner→Advanced │  │  50+ Article Cards               │  │
│  └───────────────────┘  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  数据集展示区（分类 Tab + 70+ Dataset Cards）             │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
│                              │
▼                              ▼
┌─────────────────────┐  ┌──────────────────────────────────────┐
│ 单篇文章页            │  │ 单个数据集详情页                      │
│ /json/learn/:slug    │  │ /json/datasets/:slug                 │
│ ┌─────────┐ ┌──────┐ │  │ ┌──────────┐ ┌──────────────────┐  │
│ │ 内容区   │ │ TOC  │ │  │ │ 字段说明  │ │ JSON 预览(高亮)   │  │
│ │ Markdown │ │ 浮动  │ │  │ └──────────┘ └──────────────────┘  │
│ │ +代码高亮 │ │ 目录  │ │  │ 操作栏: Copy / Download / Validate  │
│ │ +Playground│     │ │  │ 相关数据集推荐                       │
│ └─────────┘ └──────┘ │  └──────────────────────────────────────┘
│ 上一篇/下一篇 导航     │
│ 相关文章推荐           │
│ FAQ 折叠区             │
└─────────────────────┘
```

---

## 二、竞品功能对标表

| 功能点 | JSONLint | W3Schools | GeeksForGeeks | MDN | TutorialsPoint | json-schema.org | 本次实现 | 差异化说明 |
|--------|----------|-----------|---------------|-----|----------------|-----------------|---------|-----------|
| 基础语法教程 | ✅ 1篇 | ✅ 10+ 页 | ✅ 多篇 | ✅ 1篇 | ✅ 多章节 | ❌ | ✅ **10篇分层** | 按难度渐进，含交互练习 |
| 多语言实战 | ✅ Python 1篇 | ❌ JS only | ✅ 3语言 | ✅ JS only | ✅ 5语言 | ❌ | ✅ **10语言** | JS/TS/Python/Go/Java/Rust/PHP/C#/Ruby/Swift |
| 错误排查 | ✅ 5篇 | ❌ | ✅ 零散 | ❌ | ❌ | ❌ | ✅ **6篇系统化** | 按错误类型+可运行修复示例 |
| 格式对比 | ✅ 2篇 | ✅ 1页 | ✅ 1篇 | ❌ | ✅ 1页 | ❌ | ✅ **5篇** | JSON vs XML/YAML/TOML/CSV/Protobuf |
| JSON Schema | ❌ | ❌ | ❌ | ❌ | ✅ 1页 | ✅ 多篇 | ✅ **4篇深度** | 入门→高级→CI/CD→OpenAPI |
| JSONPath | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ **2篇** | 含交互式 Query Playground |
| jq 命令行 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ **2篇** | 基础到 DevOps 生产脚本 |
| JSON Patch/Pointer | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ **2篇** | RFC 6901/6902/7396 |
| 安全与性能 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ **5篇** | 注入/JWT/流式/压缩/加密 |
| REST API + JSON | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ **3篇** | 设计模式+OpenAPI+GraphQL |
| 数据库 JSON | ❌ | ❌ | ✅ 1篇 | ❌ | ❌ | ❌ | ✅ **2篇** | PostgreSQL/MongoDB/Redis |
| AI + JSON | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ **2篇** | LLM 结构化输出+Agent 通信 |
| 免费数据集 | ✅ 47个 | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ **70+ 个** | 新增 AI/ML/金融/体育/医疗 |
| 中英文双语 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 全站 i18n |
| 交互 Playground | ❌ | ✅ Try it | ❌ | ❌ | ❌ | ❌ | ✅ **内嵌编辑器** | JSON 实时验证+格式化 |
| 阅读进度追踪 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | localStorage 已读标记 |
| 学习路径 | ❌ | ✅ Study Plan | ❌ | ❌ | ❌ | ❌ | ✅ **3 条路径** | 入门→中级→高级游戏化 |
| 文章内 TOC | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ 浮动+滚动高亮 | IntersectionObserver |
| 暗色模式 | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | 跟随系统+手动切换 |

---

## 三、完整文章清单（53 篇）

### A. 基础入门 Getting Started (10 篇) — Beginner

| # | Slug | EN Title | ZH Title | 阅读 |
|---|------|----------|----------|------|
| A01 | `what-is-json` | What is JSON? Complete Beginner's Guide | 什么是 JSON？零基础完全入门 | 8m |
| A02 | `json-syntax-rules` | JSON Syntax Rules: Definitive Reference | JSON 语法规则权威指南 | 10m |
| A03 | `json-data-types` | JSON Data Types Explained with Examples | JSON 数据类型详解 | 8m |
| A04 | `json-objects-and-arrays` | JSON Objects & Arrays: Deep Dive | JSON 对象与数组深入解析 | 12m |
| A05 | `how-to-open-json-files` | How to Open JSON Files on Any Platform | 如何在任意平台打开 JSON 文件 | 6m |
| A06 | `json-comments` | JSON Comments: Why They Don't Exist & Alternatives | JSON 注释：为何不存在及替代方案 | 7m |
| A07 | `json-stringify-and-parse` | JSON.stringify() & JSON.parse() Complete Guide | JSON.stringify() 与 JSON.parse() 完全指南 | 12m |
| A08 | `json-formatting-pretty-print` | JSON Formatting & Pretty Print Best Practices | JSON 格式化与美化最佳实践 | 8m |
| A09 | `json-history-and-rfc` | History of JSON: From RFC 4627 to RFC 8259 | JSON 的历史：从 RFC 4627 到 RFC 8259 | 10m |
| A10 | `json-cheat-sheet` | JSON Cheat Sheet: Quick Reference Card | JSON 速查表：快速参考卡片 | 5m |

### B. 多语言实战 Language Guides (10 篇) — Intermediate

| # | Slug | EN Title | ZH Title | 阅读 |
|---|------|----------|----------|------|
| B01 | `json-in-javascript` | Mastering JSON in JavaScript: Advanced Patterns | JavaScript JSON 高级模式 | 15m |
| B02 | `json-in-typescript` | JSON in TypeScript: Type-Safe Parsing & Validation | TypeScript 中类型安全的 JSON 处理 | 12m |
| B03 | `json-in-python` | JSON in Python: Complete Guide with Examples | Python JSON 完全指南 | 15m |
| B04 | `json-in-go` | Working with JSON in Go: From Basics to Production | Go 语言 JSON 从入门到生产 | 15m |
| B05 | `json-in-java` | JSON in Java: Jackson, Gson & Modern Approaches | Java JSON：Jackson、Gson 与现代方案 | 14m |
| B06 | `json-in-rust` | JSON in Rust with Serde: Performance & Safety | Rust 中使用 Serde 处理 JSON | 12m |
| B07 | `json-in-php` | JSON in PHP: Encoding, Decoding & Best Practices | PHP JSON 编解码最佳实践 | 10m |
| B08 | `json-in-csharp` | JSON in C#: System.Text.Json vs Newtonsoft | C# JSON：System.Text.Json vs Newtonsoft | 12m |
| B09 | `json-in-ruby` | JSON in Ruby: Parsing, Generating & Optimization | Ruby JSON 解析与优化 | 10m |
| B10 | `json-in-swift` | JSON in Swift: Codable Protocol Deep Dive | Swift JSON：Codable 协议深入 | 12m |

### C. 错误排查 Error Troubleshooting (6 篇) — Beginner~Intermediate

| # | Slug | EN Title | ZH Title | 阅读 |
|---|------|----------|----------|------|
| C01 | `common-json-mistakes` | 30 Most Common JSON Mistakes and Fixes | 30 个最常见 JSON 错误及修复 | 15m |
| C02 | `fix-unexpected-end-of-json-input` | Fix 'Unexpected End of JSON Input' | 修复 'Unexpected End of JSON Input' | 8m |
| C03 | `fix-unexpected-token-in-json` | Fix 'Unexpected Token' in JSON | 修复 JSON 中 'Unexpected Token' | 8m |
| C04 | `json-parse-error` | JSON Parse Error: Causes & Solutions | JSON 解析错误：原因与解决方案 | 10m |
| C05 | `json-syntax-error` | JSON Syntax Error: Find and Fix | JSON 语法错误：定位与修复 | 10m |
| C06 | `json-encoding-issues` | JSON Encoding: UTF-8, Escaping & Special Characters | JSON 编码：UTF-8、转义与特殊字符 | 10m |

### D. 格式对比 Format Comparisons (5 篇) — Intermediate

| # | Slug | EN Title | ZH Title | 阅读 |
|---|------|----------|----------|------|
| D01 | `json-vs-xml` | JSON vs XML: When to Use Each | JSON vs XML：何时用哪个 | 12m |
| D02 | `json-vs-yaml` | JSON vs YAML: Practical Comparison | JSON vs YAML：实用对比 | 10m |
| D03 | `json-vs-toml` | JSON vs TOML: Configuration Showdown | JSON vs TOML：配置格式终极对比 | 8m |
| D04 | `json-vs-csv` | JSON vs CSV: Data Format Selection Guide | JSON vs CSV：数据格式选择指南 | 8m |
| D05 | `json-vs-protobuf` | JSON vs Protocol Buffers: Performance Deep Dive | JSON vs Protobuf：性能深度对比 | 10m |

### E. 高级主题 Advanced Topics (10 篇) — Advanced

| # | Slug | EN Title | ZH Title | 阅读 |
|---|------|----------|----------|------|
| E01 | `json-schema-getting-started` | JSON Schema: Getting Started (Draft 2020-12) | JSON Schema 入门（Draft 2020-12） | 12m |
| E02 | `json-schema-advanced` | JSON Schema: Conditionals, Refs & Composition | JSON Schema 高级：条件、引用与组合 | 15m |
| E03 | `json-schema-cicd` | JSON Schema in CI/CD: Automated Validation | JSON Schema 在 CI/CD 中的自动化验证 | 12m |
| E04 | `json-schema-openapi` | JSON Schema & OpenAPI: API Contract Design | JSON Schema 与 OpenAPI：API 契约设计 | 12m |
| E05 | `jsonpath-complete-guide` | JSONPath: Complete Query Language Guide | JSONPath 查询语言完全指南 | 14m |
| E06 | `jq-command-line-guide` | jq: Master JSON Processing in Terminal | jq：终端中的 JSON 处理大师 | 15m |
| E07 | `jq-devops-production` | jq in DevOps: CI/CD, K8s & Log Processing | jq 在 DevOps 中的应用 | 12m |
| E08 | `json5-and-jsonc` | JSON5 & JSONC: Extended Formats Explained | JSON5 与 JSONC 扩展格式详解 | 8m |
| E09 | `json-patch-merge-patch` | JSON Patch & Merge Patch (RFC 6902/7396) | JSON Patch 与 Merge Patch | 10m |
| E10 | `json-pointer` | JSON Pointer (RFC 6901): Navigate JSON Like a Pro | JSON Pointer（RFC 6901） | 8m |

### F. 安全与性能 Security & Performance (5 篇) — Advanced

| # | Slug | EN Title | ZH Title | 阅读 |
|---|------|----------|----------|------|
| F01 | `json-security-best-practices` | JSON Security: Injection, SSRF & Defense | JSON 安全：注入、SSRF 与防御 | 12m |
| F02 | `json-web-tokens-jwt` | JWT Deep Dive: How It Works & Best Practices | JWT 深入：原理与最佳实践 | 14m |
| F03 | `json-performance-optimization` | JSON Performance: Parsing, Streaming & Large Files | JSON 性能：解析、流式与大文件 | 14m |
| F04 | `json-compression` | JSON Compression: gzip, Brotli & Binary Formats | JSON 压缩：gzip、Brotli 与二进制 | 10m |
| F05 | `json-encryption-signing` | JSON Encryption & Signing: JWE & JWS | JSON 加密与签名：JWE 与 JWS | 10m |

### G. 实战应用 Real-World Applications (7 篇) — Intermediate~Advanced

| # | Slug | EN Title | ZH Title | 阅读 |
|---|------|----------|----------|------|
| G01 | `json-rest-api-design` | JSON in REST API Design: Patterns & Standards | JSON 与 REST API 设计模式 | 15m |
| G02 | `json-graphql` | JSON & GraphQL: Modern API Data Exchange | JSON 与 GraphQL 数据交换 | 12m |
| G03 | `json-in-databases` | JSON in Databases: PostgreSQL, MongoDB & Redis | 数据库中的 JSON 实战 | 15m |
| G04 | `json-configuration-files` | JSON Config Files: package.json, tsconfig & More | JSON 配置文件实战 | 10m |
| G05 | `json-and-ai-llm` | JSON & AI: LLM Structured Output & Agents | JSON 与 AI：LLM 结构化输出 | 12m |
| G06 | `json-web-scraping-pipelines` | JSON in Web Scraping & Data Pipelines | JSON 在数据管道中的应用 | 10m |
| G07 | `json-ld-structured-data` | JSON-LD & Structured Data for SEO | JSON-LD 与 SEO 结构化数据 | 10m |

---

## 四、数据集清单（70+ 个）

| 类别 | 竞品数量 | 本次数量 | 新增亮点 |
|------|---------|---------|---------|
| Geographic 地理 | 10 | 14 | +世界遗产、海洋深度、火山 |
| Reference 参考 | 21 | 28 | +设计色板、加密算法、Git命令 |
| Configuration 配置 | 4 | 7 | +Dockerfile、GitHub Actions、Vite |
| Testing 测试 | 4 | 7 | +性能压测、i18n测试、A11y测试 |
| API Mocks 模拟 | 8 | 10 | +聊天消息、Webhook事件 |
| **AI & ML（新增）** | 0 | 6 | 情感分析、NER、图像标签、分类 |
| **Finance（新增）** | 0 | 4 | 股票行情、加密货币、汇率 |

---

## 五、Block 清单 & 工时

| 文件 | 核心内容 | 工时 |
|------|---------|------|
| `json-learn-I-00_总览索引.md` | 架构图、竞品对标、53篇文章清单、70+数据集、路由、设计规范 | 4h |
| `json-learn-I-01_路由_SEO_i18n_sitemap_ads_ga.md` | Go路由、SEO、广告、GA事件、全量i18n、sitemap | 14h |
| `json-learn-I-02_首页Landing_上传区.md` | Hub 主页 HTML、学习路径、筛选搜索、文章卡片、数据集展示 | 12h |
| `json-learn-I-03_前端处理引擎.md` | 搜索/筛选引擎、阅读进度、TOC、Playground、数据集操作 | 12h |
| `json-learn-I-04_结果列表UI.md` | 文章卡片、文章详情页、数据集详情页、JSON预览弹窗 | 10h |
| **总计** | | **52h** |

---

## 六、路由规划

| 路由 | 说明 | 语言变体 |
|------|------|---------|
| `/json/learn` | 学习中心 Hub 主页 | `?lang=zh` / `?lang=en` |
| `/json/learn/:slug` | 单篇文章页（53 篇共用模板） | `?lang=zh` / `?lang=en` |
| `/json/datasets` | 数据集列表页 | `?lang=zh` / `?lang=en` |
| `/json/datasets/:slug` | 单个数据集详情页 | `?lang=zh` / `?lang=en` |

> 无独立 API 路由，所有内容通过 Go Template 服务端渲染注入。

---

## 七、🔧 前端依赖

| 库 | 用途 | CDN |
|----|------|-----|
| Prism.js 1.29+ | 代码高亮 | `https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js` |
| Prism Autoloader | 按需加载语言 | `https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js` |
| Prism Copy Button | 一键复制 | `https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js` |
| Prism Line Numbers | 行号 | `https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/line-numbers/prism-line-numbers.min.js` |
| Fuse.js 7.0+ | 模糊搜索 | `https://cdnjs.cloudflare.com/ajax/libs/fuse.js/7.0.0/fuse.min.js` |
| JSZip 3.10+ | 批量下载打包 | `https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js` |
| FileSaver.js 2.0+ | 触发下载 | `https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js` |

---

## 八、i18n Key 前缀清单

| 前缀 | 说明 |
|------|------|
| `learn.seo.*` | 页面 title / description / og |
| `learn.hero.*` | Hero 标题、副标题、Badge |
| `learn.nav.*` | 分类导航标签 |
| `learn.filter.*` | 搜索框、难度筛选 |
| `learn.card.*` | 文章卡片文案 |
| `learn.article.*` | 文章页内文案 |
| `learn.dataset.*` | 数据集页文案 |
| `learn.status.*` | 加载/无结果/错误 |
| `learn.feature.*` | 特性卡片 |
| `learn.faq.*` | FAQ 区域 |
| `learn.error.*` | 404/加载失败 |
| `learn.toast.*` | Toast 通知 |
| `learn.breadcrumb.*` | 面包屑 |
| `learn.progress.*` | 阅读进度 |
| `learn.path.*` | 学习路径 |
| `learn.download.*` | 下载相关 |

---

## 九、sitemap 新增条目

```xml
<url>
  <loc>https://toolboxnova.com/json/learn</loc>
  <lastmod>2026-01-15</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>
</url>
<url>
  <loc>https://toolboxnova.com/json/learn?lang=zh</loc>
  <lastmod>2026-01-15</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
<url>
  <loc>https://toolboxnova.com/json/learn?lang=en</loc>
  <lastmod>2026-01-15</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
<url>
  <loc>https://toolboxnova.com/json/datasets</loc>
  <lastmod>2025-12-20</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>
<!-- 53 篇文章各一条，此处仅示意格式 -->
<url>
  <loc>https://toolboxnova.com/json/learn/what-is-json</loc>
  <lastmod>2025-04-12</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>
```

---

## 十、设计风格定调

### 色值体系

| 变量 | 色值 | 用途 |
|------|------|------|
| `--learn-primary` | `#1e40af` | 主色深蓝 |
| `--learn-primary-light` | `#3b82f6` | 链接/hover |
| `--learn-primary-bg` | `#eff6ff` | Hero/卡片底 |
| `--learn-bg` | `#f8fafc` | 页面背景 |
| `--learn-surface` | `#ffffff` | 卡片表面 |
| `--learn-text` | `#1e293b` | 主文字 |
| `--learn-text-secondary` | `#64748b` | 副文字 |
| `--learn-border` | `#e2e8f0` | 边框 |
| `--learn-beginner` | `#059669` | 入门标签 |
| `--learn-intermediate` | `#d97706` | 中级标签 |
| `--learn-advanced` | `#dc2626` | 高级标签 |
| `--learn-code-bg` | `#1e293b` | 代码块深色底 |
| `--learn-shadow` | `0 1px 3px rgba(0,0,0,0.08)` | 卡片投影 |
| `--learn-shadow-hover` | `0 8px 25px rgba(0,0,0,0.12)` | hover 投影 |
| `--learn-radius` | `12px` | 大圆角 |
| `--learn-radius-sm` | `6px` | 小圆角 |

### 差异化设计亮点

1. **3 条学习路径（Learning Path）**— Hub 顶部 3 张路径卡片（入门/中级/高级），底部进度条跟踪已读文章数，localStorage 持久化
2. **文章卡片 Hover 微交互** — 左侧 4px 分类色条 hover 展宽到 6px + `translateY(-2px)` + 阴影递进
3. **代码块 "Try It" 浮层** — JSON 代码块右上角 `▶ Try It` 按钮，展开内嵌 Playground（textarea + 实时验证）
4. **暗色代码 × 亮色正文** — 文章正文白底舒适阅读，代码块深色（One Dark）形成强视觉对比
5. **数据集"即时体验"三连** — Copy / Validate / Download 一字排开，Validate 直接跳转站内验证器
6. **文章顶部阅读进度条** — 3px 主色渐变条固定顶部，滚到 95% 自动标记已读
7. **右侧浮动 TOC** — IntersectionObserver 滚动高亮当前 heading，移动端折叠为可展开面板
