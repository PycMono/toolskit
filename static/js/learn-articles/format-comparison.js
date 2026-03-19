window.LEARN_ARTICLES = window.LEARN_ARTICLES || {};
window.LEARN_ARTICLES["json-vs-xml"] = {
en: `<h2>JSON vs XML</h2><p>JSON and XML are both text-based data formats, but they have very different designs.</p><h2>Side-by-Side Example</h2><pre><code class="language-xml">&lt;!-- XML --&gt;
&lt;user&gt;
  &lt;id&gt;1&lt;/id&gt;
  &lt;name&gt;Alice&lt;/name&gt;
  &lt;tags&gt;
    &lt;tag&gt;admin&lt;/tag&gt;
    &lt;tag&gt;editor&lt;/tag&gt;
  &lt;/tags&gt;
&lt;/user&gt;</code></pre><pre><code class="language-json">// JSON
{
  "id": 1,
  "name": "Alice",
  "tags": ["admin", "editor"]
}</code></pre><h2>Comparison Table</h2><table style="width:100%;border-collapse:collapse;font-size:14px"><tr style="background:#f1f5f9"><th style="padding:8px;border:1px solid #e2e8f0">Feature</th><th style="padding:8px;border:1px solid #e2e8f0">JSON</th><th style="padding:8px;border:1px solid #e2e8f0">XML</th></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">Verbosity</td><td style="padding:8px;border:1px solid #e2e8f0">Compact</td><td style="padding:8px;border:1px solid #e2e8f0">Verbose</td></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">Comments</td><td style="padding:8px;border:1px solid #e2e8f0">No</td><td style="padding:8px;border:1px solid #e2e8f0">Yes</td></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">Attributes</td><td style="padding:8px;border:1px solid #e2e8f0">No</td><td style="padding:8px;border:1px solid #e2e8f0">Yes</td></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">Schema</td><td style="padding:8px;border:1px solid #e2e8f0">JSON Schema</td><td style="padding:8px;border:1px solid #e2e8f0">XSD / DTD</td></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">Query</td><td style="padding:8px;border:1px solid #e2e8f0">JSONPath / jq</td><td style="padding:8px;border:1px solid #e2e8f0">XPath / XQuery</td></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">Web API default</td><td style="padding:8px;border:1px solid #e2e8f0">Yes</td><td style="padding:8px;border:1px solid #e2e8f0">Legacy</td></tr></table><h2>When to Use XML</h2><ul><li>Document-centric data needing mixed content</li><li>SOAP web services</li><li>Office formats (DOCX, XLSX)</li><li>Configuration requiring comments and attributes</li></ul><h2>When to Use JSON</h2><ul><li>REST APIs</li><li>Browser JavaScript communication</li><li>Configuration files</li><li>NoSQL databases</li></ul>`,
zh: `<h2>JSON vs XML</h2><p>JSON 和 XML 都是基于文本的数据格式，但设计理念差异很大。</p><h2>对比示例</h2><pre><code class="language-xml">&lt;!-- XML --&gt;
&lt;user&gt;
  &lt;id&gt;1&lt;/id&gt;
  &lt;name&gt;Alice&lt;/name&gt;
  &lt;tags&gt;
    &lt;tag&gt;admin&lt;/tag&gt;
  &lt;/tags&gt;
&lt;/user&gt;</code></pre><pre><code class="language-json">// JSON
{
  "id": 1,
  "name": "Alice",
  "tags": ["admin"]
}</code></pre><h2>对比表</h2><table style="width:100%;border-collapse:collapse;font-size:14px"><tr style="background:#f1f5f9"><th style="padding:8px;border:1px solid #e2e8f0">特性</th><th style="padding:8px;border:1px solid #e2e8f0">JSON</th><th style="padding:8px;border:1px solid #e2e8f0">XML</th></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">冗余度</td><td style="padding:8px;border:1px solid #e2e8f0">紧凑</td><td style="padding:8px;border:1px solid #e2e8f0">冗长</td></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">注释</td><td style="padding:8px;border:1px solid #e2e8f0">不支持</td><td style="padding:8px;border:1px solid #e2e8f0">支持</td></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">属性</td><td style="padding:8px;border:1px solid #e2e8f0">不支持</td><td style="padding:8px;border:1px solid #e2e8f0">支持</td></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">Schema</td><td style="padding:8px;border:1px solid #e2e8f0">JSON Schema</td><td style="padding:8px;border:1px solid #e2e8f0">XSD / DTD</td></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">查询</td><td style="padding:8px;border:1px solid #e2e8f0">JSONPath / jq</td><td style="padding:8px;border:1px solid #e2e8f0">XPath / XQuery</td></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">Web API 默认</td><td style="padding:8px;border:1px solid #e2e8f0">是</td><td style="padding:8px;border:1px solid #e2e8f0">遗留</td></tr></table><h2>适合使用 XML 的场景</h2><ul><li>需要混合内容的文档型数据</li><li>SOAP 服务</li><li>Office 格式（DOCX、XLSX）</li></ul><h2>适合使用 JSON 的场景</h2><ul><li>REST API</li><li>浏览器通信</li><li>配置文件</li><li>NoSQL 数据库</li></ul>`
};
window.LEARN_ARTICLES["json-vs-yaml"] = {
en: `<h2>JSON vs YAML</h2><p>YAML is a superset of JSON designed for human-readable configuration. JSON is a subset of YAML (valid JSON is valid YAML).</p><h2>Side-by-Side Example</h2><pre><code class="language-yaml"># YAML
name: Alice
age: 30
active: true
tags:
  - admin
  - editor
address:
  city: New York
  country: US</code></pre><pre><code class="language-json">// JSON
{
  "name": "Alice",
  "age": 30,
  "active": true,
  "tags": ["admin", "editor"],
  "address": {
    "city": "New York",
    "country": "US"
  }
}</code></pre><h2>Comparison</h2><table style="width:100%;border-collapse:collapse;font-size:14px"><tr style="background:#f1f5f9"><th style="padding:8px;border:1px solid #e2e8f0">Feature</th><th style="padding:8px;border:1px solid #e2e8f0">JSON</th><th style="padding:8px;border:1px solid #e2e8f0">YAML</th></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">Comments</td><td style="padding:8px;border:1px solid #e2e8f0">No</td><td style="padding:8px;border:1px solid #e2e8f0">Yes (#)</td></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">Readability</td><td style="padding:8px;border:1px solid #e2e8f0">Good</td><td style="padding:8px;border:1px solid #e2e8f0">Excellent</td></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">Parser complexity</td><td style="padding:8px;border:1px solid #e2e8f0">Simple</td><td style="padding:8px;border:1px solid #e2e8f0">Complex</td></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">API responses</td><td style="padding:8px;border:1px solid #e2e8f0">Standard</td><td style="padding:8px;border:1px solid #e2e8f0">Rare</td></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">DevOps configs</td><td style="padding:8px;border:1px solid #e2e8f0">Sometimes</td><td style="padding:8px;border:1px solid #e2e8f0">Standard</td></tr></table><h2>Use JSON for</h2><ul><li>APIs, databases, web apps</li><li>Anywhere machine parsing dominates</li></ul><h2>Use YAML for</h2><ul><li>Kubernetes, Docker Compose, GitHub Actions</li><li>Config files where humans author frequently</li></ul>`,
zh: `<h2>JSON vs YAML</h2><p>YAML 是 JSON 的超集，专为人类可读配置设计。有效的 JSON 也是有效的 YAML。</p><h2>对比示例</h2><pre><code class="language-yaml"># YAML
name: Alice
age: 30
tags:
  - admin
  - editor</code></pre><pre><code class="language-json">// JSON
{
  "name": "Alice",
  "age": 30,
  "tags": ["admin", "editor"]
}</code></pre><h2>对比</h2><table style="width:100%;border-collapse:collapse;font-size:14px"><tr style="background:#f1f5f9"><th style="padding:8px;border:1px solid #e2e8f0">特性</th><th style="padding:8px;border:1px solid #e2e8f0">JSON</th><th style="padding:8px;border:1px solid #e2e8f0">YAML</th></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">注释</td><td style="padding:8px;border:1px solid #e2e8f0">不支持</td><td style="padding:8px;border:1px solid #e2e8f0">支持（#）</td></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">可读性</td><td style="padding:8px;border:1px solid #e2e8f0">良好</td><td style="padding:8px;border:1px solid #e2e8f0">优秀</td></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">解析复杂度</td><td style="padding:8px;border:1px solid #e2e8f0">简单</td><td style="padding:8px;border:1px solid #e2e8f0">复杂</td></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">API 响应</td><td style="padding:8px;border:1px solid #e2e8f0">标准</td><td style="padding:8px;border:1px solid #e2e8f0">罕见</td></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">DevOps 配置</td><td style="padding:8px;border:1px solid #e2e8f0">有时</td><td style="padding:8px;border:1px solid #e2e8f0">标准</td></tr></table><h2>JSON 适用于</h2><ul><li>API、数据库、Web 应用</li><li>机器解析为主的场景</li></ul><h2>YAML 适用于</h2><ul><li>Kubernetes、Docker Compose、GitHub Actions</li><li>人工频繁编辑的配置文件</li></ul>`
};
window.LEARN_ARTICLES["json-vs-csv"] = {
en: `<h2>JSON vs CSV</h2><p>CSV (Comma-Separated Values) is flat, tabular data. JSON supports nested, hierarchical structures.</p><h2>Example</h2><pre><code class="language-csv">id,name,email,role
1,Alice,alice@example.com,admin
2,Bob,bob@example.com,user</code></pre><pre><code class="language-json">[
  {"id":1,"name":"Alice","email":"alice@example.com","role":"admin"},
  {"id":2,"name":"Bob","email":"bob@example.com","role":"user"}
]</code></pre><h2>Comparison</h2><table style="width:100%;border-collapse:collapse;font-size:14px"><tr style="background:#f1f5f9"><th style="padding:8px;border:1px solid #e2e8f0">Feature</th><th style="padding:8px;border:1px solid #e2e8f0">JSON</th><th style="padding:8px;border:1px solid #e2e8f0">CSV</th></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">Nested data</td><td style="padding:8px;border:1px solid #e2e8f0">Yes</td><td style="padding:8px;border:1px solid #e2e8f0">No</td></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">Mixed types</td><td style="padding:8px;border:1px solid #e2e8f0">Yes</td><td style="padding:8px;border:1px solid #e2e8f0">Strings only</td></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">Excel compatibility</td><td style="padding:8px;border:1px solid #e2e8f0">Indirect</td><td style="padding:8px;border:1px solid #e2e8f0">Native</td></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">File size</td><td style="padding:8px;border:1px solid #e2e8f0">Larger</td><td style="padding:8px;border:1px solid #e2e8f0">Smaller</td></tr></table><h2>Convert Between Formats</h2><ul><li><a href="/json/to-csv">JSON to CSV</a></li><li><a href="/json/from-csv">CSV to JSON</a></li></ul>`,
zh: `<h2>JSON vs CSV</h2><p>CSV（逗号分隔值）是扁平的表格数据。JSON 支持嵌套的层级结构。</p><h2>示例</h2><pre><code class="language-csv">id,name,email
1,Alice,alice@example.com
2,Bob,bob@example.com</code></pre><pre><code class="language-json">[
  {"id":1,"name":"Alice","email":"alice@example.com"},
  {"id":2,"name":"Bob","email":"bob@example.com"}
]</code></pre><h2>对比</h2><table style="width:100%;border-collapse:collapse;font-size:14px"><tr style="background:#f1f5f9"><th style="padding:8px;border:1px solid #e2e8f0">特性</th><th style="padding:8px;border:1px solid #e2e8f0">JSON</th><th style="padding:8px;border:1px solid #e2e8f0">CSV</th></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">嵌套数据</td><td style="padding:8px;border:1px solid #e2e8f0">支持</td><td style="padding:8px;border:1px solid #e2e8f0">不支持</td></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">混合类型</td><td style="padding:8px;border:1px solid #e2e8f0">支持</td><td style="padding:8px;border:1px solid #e2e8f0">仅字符串</td></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">Excel 兼容</td><td style="padding:8px;border:1px solid #e2e8f0">间接</td><td style="padding:8px;border:1px solid #e2e8f0">原生</td></tr></table><h2>格式转换</h2><ul><li><a href="/json/to-csv">JSON 转 CSV</a></li><li><a href="/json/from-csv">CSV 转 JSON</a></li></ul>`
};
window.LEARN_ARTICLES["json-vs-toml"] = {
en: `<h2>JSON vs TOML</h2><p>TOML (Tom's Obvious Minimal Language) is designed for configuration files. It's used by Rust (Cargo.toml), Python (pyproject.toml), and Hugo.</p><h2>Example</h2><pre><code class="language-toml"># TOML
title = "My App"

[database]
host = "localhost"
port = 5432
name = "myapp"

[server]
port = 8080
debug = false</code></pre><pre><code class="language-json">// JSON equivalent
{
  "title": "My App",
  "database": {
    "host": "localhost",
    "port": 5432,
    "name": "myapp"
  },
  "server": { "port": 8080, "debug": false }
}</code></pre><h2>When to Use TOML</h2><ul><li>Rust projects (Cargo.toml)</li><li>Python packaging (pyproject.toml)</li><li>Static site generators</li></ul><h2>When to Use JSON</h2><ul><li>APIs and data interchange</li><li>JavaScript / Node.js configs</li><li>When a JSON-only parser is available</li></ul>`,
zh: `<h2>JSON vs TOML</h2><p>TOML（Tom's Obvious Minimal Language）专为配置文件设计，被 Rust（Cargo.toml）、Python（pyproject.toml）和 Hugo 使用。</p><h2>示例</h2><pre><code class="language-toml"># TOML
title = "My App"

[database]
host = "localhost"
port = 5432</code></pre><pre><code class="language-json">// JSON 等价
{
  "title": "My App",
  "database": {
    "host": "localhost",
    "port": 5432
  }
}</code></pre><h2>适合使用 TOML 的场景</h2><ul><li>Rust 项目（Cargo.toml）</li><li>Python 打包（pyproject.toml）</li><li>静态站点生成器</li></ul><h2>适合使用 JSON 的场景</h2><ul><li>API 和数据交换</li><li>JavaScript / Node.js 配置</li></ul>`,
};
window.LEARN_ARTICLES["json-vs-protobuf"] = {
en: `<h2>JSON vs Protocol Buffers (Protobuf)</h2>
<p>Protocol Buffers (Protobuf) is Google's language-neutral, platform-neutral, extensible binary serialization format. Compared to JSON, it offers 3–10× smaller payloads and 5–10× faster serialization.</p>
<h2>Side-by-Side</h2>
<pre><code class="language-json">// JSON — 82 bytes
{"id":1,"name":"Alice","email":"alice@example.com","active":true}</code></pre>
<pre><code class="language-protobuf">// Protobuf .proto definition
syntax = "proto3";
message User {
  int32  id     = 1;
  string name   = 2;
  string email  = 3;
  bool   active = 4;
}
// Binary output: ~28 bytes</code></pre>
<h2>Benchmark (1M records)</h2>
<table style="width:100%;border-collapse:collapse;font-size:14px">
<tr style="background:#f1f5f9"><th style="padding:8px;border:1px solid #e2e8f0">Metric</th><th style="padding:8px;border:1px solid #e2e8f0">JSON</th><th style="padding:8px;border:1px solid #e2e8f0">Protobuf</th></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0">Payload size</td><td style="padding:8px;border:1px solid #e2e8f0">82 bytes</td><td style="padding:8px;border:1px solid #e2e8f0">~28 bytes</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0">Serialize (Go)</td><td style="padding:8px;border:1px solid #e2e8f0">450 ns/op</td><td style="padding:8px;border:1px solid #e2e8f0">90 ns/op</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0">Human readable</td><td style="padding:8px;border:1px solid #e2e8f0">Yes</td><td style="padding:8px;border:1px solid #e2e8f0">No (binary)</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0">Schema required</td><td style="padding:8px;border:1px solid #e2e8f0">Optional</td><td style="padding:8px;border:1px solid #e2e8f0">Required (.proto)</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0">Browser native</td><td style="padding:8px;border:1px solid #e2e8f0">Yes</td><td style="padding:8px;border:1px solid #e2e8f0">Library needed</td></tr>
</table>
<h2>When to Use Protobuf</h2>
<ul>
  <li>Internal microservice communication (gRPC)</li>
  <li>High-throughput data pipelines (Kafka messages)</li>
  <li>Mobile APIs where bandwidth matters</li>
  <li>When strict schema evolution control is needed</li>
</ul>
<h2>When to Stick with JSON</h2>
<ul>
  <li>Public REST APIs (human-readable, debuggable)</li>
  <li>Configuration files</li>
  <li>Browser-to-server communication</li>
  <li>Rapid prototyping</li>
</ul>
<h2>Using Both</h2>
<p>Many systems use JSON for external APIs and Protobuf for internal service-to-service calls. gRPC supports JSON transcoding, letting you expose a JSON REST endpoint backed by Protobuf services.</p>`,
zh: `<h2>JSON vs Protocol Buffers（Protobuf）</h2>
<p>Protocol Buffers（Protobuf）是 Google 的语言无关、平台无关的二进制序列化格式。与 JSON 相比，负载大小减少 3–10 倍，序列化速度提升 5–10 倍。</p>
<h2>对比示例</h2>
<pre><code class="language-json">// JSON — 82 字节
{"id":1,"name":"Alice","email":"alice@example.com","active":true}</code></pre>
<pre><code class="language-protobuf">// Protobuf .proto 定义
syntax = "proto3";
message User {
  int32  id     = 1;
  string name   = 2;
  string email  = 3;
  bool   active = 4;
}
// 二进制输出：约 28 字节</code></pre>
<h2>基准测试（100 万条记录）</h2>
<table style="width:100%;border-collapse:collapse;font-size:14px">
<tr style="background:#f1f5f9"><th style="padding:8px;border:1px solid #e2e8f0">指标</th><th style="padding:8px;border:1px solid #e2e8f0">JSON</th><th style="padding:8px;border:1px solid #e2e8f0">Protobuf</th></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0">负载大小</td><td style="padding:8px;border:1px solid #e2e8f0">82 字节</td><td style="padding:8px;border:1px solid #e2e8f0">约 28 字节</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0">序列化（Go）</td><td style="padding:8px;border:1px solid #e2e8f0">450 ns/op</td><td style="padding:8px;border:1px solid #e2e8f0">90 ns/op</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0">人类可读</td><td style="padding:8px;border:1px solid #e2e8f0">是</td><td style="padding:8px;border:1px solid #e2e8f0">否（二进制）</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0">需要 Schema</td><td style="padding:8px;border:1px solid #e2e8f0">可选</td><td style="padding:8px;border:1px solid #e2e8f0">必须（.proto）</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0">浏览器原生支持</td><td style="padding:8px;border:1px solid #e2e8f0">是</td><td style="padding:8px;border:1px solid #e2e8f0">需要库</td></tr>
</table>
<h2>适合使用 Protobuf 的场景</h2>
<ul>
  <li>内部微服务通信（gRPC）</li>
  <li>高吞吐量数据管道（Kafka 消息）</li>
  <li>对带宽敏感的移动 API</li>
  <li>需要严格 Schema 版本控制时</li>
</ul>
<h2>适合使用 JSON 的场景</h2>
<ul>
  <li>公开的 REST API（人类可读、易于调试）</li>
  <li>配置文件</li>
  <li>浏览器与服务器通信</li>
  <li>快速原型开发</li>
</ul>`
};
