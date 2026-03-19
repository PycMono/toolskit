/* Article content: Getting Started (A01-A10) */
window.LEARN_ARTICLES = window.LEARN_ARTICLES || {};

window.LEARN_ARTICLES["what-is-json"] = {
en: `
<h2>What is JSON?</h2>
<p>JSON (<strong>JavaScript Object Notation</strong>) is a lightweight, text-based data interchange format. Despite the name, JSON is language-independent — it is used in virtually every modern programming language and platform.</p>
<p>A simple JSON document looks like this:</p>
<pre><code class="language-json">{
  "name": "Alice",
  "age": 30,
  "isAdmin": false,
  "scores": [95, 87, 92],
  "address": {
    "city": "New York",
    "country": "US"
  }
}</code></pre>

<h2>Why Was JSON Invented?</h2>
<p>In the early 2000s, web developers needed a way to transfer data between browsers and servers without full page reloads (AJAX). XML was the dominant format, but it was verbose and hard to parse in JavaScript. <strong>Douglas Crockford</strong> formalized JSON around 2001, drawing on the object literal syntax already built into JavaScript.</p>
<p>JSON became the RFC 4627 standard in 2006, and was later refined in RFC 7159 and RFC 8259.</p>

<h2>JSON vs XML — A Quick Comparison</h2>
<pre><code class="language-xml">&lt;!-- XML --&gt;
&lt;person&gt;
  &lt;name&gt;Alice&lt;/name&gt;
  &lt;age&gt;30&lt;/age&gt;
&lt;/person&gt;</code></pre>
<pre><code class="language-json">// JSON
{
  "name": "Alice",
  "age": 30
}</code></pre>
<p>JSON is significantly more compact and maps directly to native data structures in JavaScript (and most other languages).</p>

<h2>Where is JSON Used?</h2>
<ul>
  <li><strong>REST APIs</strong> — Nearly all modern web APIs return JSON responses.</li>
  <li><strong>Configuration files</strong> — <code>package.json</code>, <code>tsconfig.json</code>, VS Code settings.</li>
  <li><strong>Databases</strong> — MongoDB, PostgreSQL JSONB, Redis.</li>
  <li><strong>Mobile apps</strong> — iOS/Android communicate with backends via JSON.</li>
  <li><strong>Data pipelines</strong> — Log files, event streams, ETL workflows.</li>
</ul>

<h2>JSON Rules at a Glance</h2>
<ul>
  <li>Data is in <strong>name/value pairs</strong>: <code>"key": value</code></li>
  <li>Data is separated by <strong>commas</strong></li>
  <li>Curly braces <code>{}</code> hold <strong>objects</strong></li>
  <li>Square brackets <code>[]</code> hold <strong>arrays</strong></li>
  <li>Strings must use <strong>double quotes</strong> — single quotes are invalid</li>
  <li><strong>No comments</strong> are allowed in standard JSON</li>
  <li><strong>No trailing commas</strong> — <code>{"a":1,}</code> is invalid</li>
</ul>

<h2>Try It Now</h2>
<p>Paste any JSON into our <a href="/json/validate">JSON Validator</a> to check it instantly, or use the <a href="/json/pretty">JSON Formatter</a> to beautify minified JSON.</p>

<h2>Key Takeaways</h2>
<ul>
  <li>JSON stands for JavaScript Object Notation but works in all languages.</li>
  <li>It is the dominant format for web APIs and configuration files.</li>
  <li>JSON supports 6 data types: string, number, boolean, null, object, array.</li>
  <li>It was formalized by Douglas Crockford and standardized as RFC 8259.</li>
</ul>
`,
zh: `
<h2>什么是 JSON？</h2>
<p>JSON（<strong>JavaScript Object Notation</strong>，JavaScript 对象表示法）是一种轻量级、基于文本的数据交换格式。尽管名称中包含 "JavaScript"，JSON 实际上与语言无关——几乎所有现代编程语言和平台都支持它。</p>
<p>一个简单的 JSON 文档如下所示：</p>
<pre><code class="language-json">{
  "name": "Alice",
  "age": 30,
  "isAdmin": false,
  "scores": [95, 87, 92],
  "address": {
    "city": "北京",
    "country": "CN"
  }
}</code></pre>

<h2>JSON 为什么被发明？</h2>
<p>21 世纪初，Web 开发者需要一种在浏览器和服务器之间传输数据的方式，而无需刷新整个页面（即 AJAX）。XML 是当时的主流格式，但它冗长且难以在 JavaScript 中解析。<strong>Douglas Crockford</strong> 在 2001 年前后将 JSON 正式化，借鉴了 JavaScript 已内置的对象字面量语法。</p>
<p>JSON 于 2006 年成为 RFC 4627 标准，后来经 RFC 7159 和 RFC 8259 进一步完善。</p>

<h2>JSON vs XML — 快速对比</h2>
<pre><code class="language-xml">&lt;!-- XML --&gt;
&lt;person&gt;
  &lt;name&gt;Alice&lt;/name&gt;
  &lt;age&gt;30&lt;/age&gt;
&lt;/person&gt;</code></pre>
<pre><code class="language-json">// JSON
{
  "name": "Alice",
  "age": 30
}</code></pre>
<p>JSON 更紧凑，并且能直接映射到 JavaScript（及大多数其他语言）中的原生数据结构。</p>

<h2>JSON 的应用场景</h2>
<ul>
  <li><strong>REST API</strong> — 几乎所有现代 Web API 都返回 JSON 响应。</li>
  <li><strong>配置文件</strong> — <code>package.json</code>、<code>tsconfig.json</code>、VS Code 设置。</li>
  <li><strong>数据库</strong> — MongoDB、PostgreSQL JSONB、Redis。</li>
  <li><strong>移动应用</strong> — iOS/Android 通过 JSON 与后端通信。</li>
  <li><strong>数据管道</strong> — 日志文件、事件流、ETL 工作流。</li>
</ul>

<h2>JSON 规则速览</h2>
<ul>
  <li>数据以<strong>键值对</strong>形式存储：<code>"key": value</code></li>
  <li>数据之间用<strong>逗号</strong>分隔</li>
  <li>花括号 <code>{}</code> 表示<strong>对象</strong></li>
  <li>方括号 <code>[]</code> 表示<strong>数组</strong></li>
  <li>字符串必须使用<strong>双引号</strong>，单引号无效</li>
  <li>标准 JSON 中<strong>不允许注释</strong></li>
  <li><strong>不允许尾随逗号</strong>，如 <code>{"a":1,}</code> 是无效的</li>
</ul>

<h2>立即体验</h2>
<p>将任意 JSON 粘贴到我们的 <a href="/json/validate">JSON 验证器</a> 立即检查，或使用 <a href="/json/pretty">JSON 格式化工具</a> 美化压缩的 JSON。</p>

<h2>关键要点</h2>
<ul>
  <li>JSON 代表 JavaScript Object Notation，但适用于所有语言。</li>
  <li>它是 Web API 和配置文件的主流格式。</li>
  <li>JSON 支持 6 种数据类型：字符串、数字、布尔值、null、对象、数组。</li>
  <li>由 Douglas Crockford 正式化，并作为 RFC 8259 标准化。</li>
</ul>
`};

window.LEARN_ARTICLES["json-syntax-rules"] = {
en: `
<h2>The 6 Core Syntax Rules</h2>
<p>JSON has a very small, strict grammar. Violating any rule results in a parse error.</p>

<h3>Rule 1: Data is in Key/Value Pairs</h3>
<pre><code class="language-json">{ "name": "Alice" }</code></pre>
<p>The key must be a string wrapped in <strong>double quotes</strong>. Single quotes or bare identifiers are not valid.</p>

<h3>Rule 2: Data is Separated by Commas</h3>
<pre><code class="language-json">{ "a": 1, "b": 2, "c": 3 }</code></pre>
<p>⚠️ <strong>No trailing comma</strong> after the last item. This is the most common mistake.</p>
<pre><code class="language-json">// ❌ INVALID
{ "a": 1, "b": 2, }

// ✅ VALID
{ "a": 1, "b": 2 }</code></pre>

<h3>Rule 3: Curly Braces Hold Objects</h3>
<pre><code class="language-json">{
  "id": 1,
  "user": {
    "name": "Alice",
    "role": "admin"
  }
}</code></pre>

<h3>Rule 4: Square Brackets Hold Arrays</h3>
<pre><code class="language-json">{ "tags": ["json", "api", "web"] }</code></pre>

<h3>Rule 5: Strings Must Use Double Quotes</h3>
<pre><code class="language-json">// ❌ INVALID — single quotes
{ 'name': 'Alice' }

// ✅ VALID
{ "name": "Alice" }</code></pre>

<h3>Rule 6: No Comments Allowed</h3>
<pre><code class="language-json">// ❌ INVALID — JSON has no comment syntax
{
  // this is the user's name
  "name": "Alice"
}

// ✅ Use JSONC or JSON5 if you need comments</code></pre>

<h2>Valid JSON Values</h2>
<p>The root of a JSON document can be any of these:</p>
<pre><code class="language-json">// Object
{ "key": "value" }

// Array
[1, 2, 3]

// String
"hello"

// Number
42

// Boolean
true

// Null
null</code></pre>

<h2>String Escaping Rules</h2>
<p>Inside strings, these characters must be escaped with a backslash:</p>
<table style="width:100%;border-collapse:collapse;font-size:14px">
  <tr style="background:#f1f5f9"><th style="padding:8px;border:1px solid #e2e8f0;text-align:left">Character</th><th style="padding:8px;border:1px solid #e2e8f0;text-align:left">Escape Sequence</th></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">Double quote <code>"</code></td><td style="padding:8px;border:1px solid #e2e8f0"><code>\\"</code></td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">Backslash <code>\\</code></td><td style="padding:8px;border:1px solid #e2e8f0"><code>\\\\</code></td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">Newline</td><td style="padding:8px;border:1px solid #e2e8f0"><code>\\n</code></td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">Tab</td><td style="padding:8px;border:1px solid #e2e8f0"><code>\\t</code></td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">Unicode</td><td style="padding:8px;border:1px solid #e2e8f0"><code>\\uXXXX</code></td></tr>
</table>

<h2>Number Rules</h2>
<pre><code class="language-json">// ✅ Valid numbers
42
-17
3.14
1.5e10
-2.5E-3

// ❌ Invalid numbers
0777      // leading zeros not allowed
.5        // must start with a digit
NaN       // not valid in JSON
Infinity  // not valid in JSON</code></pre>

<h2>Complete Valid Example</h2>
<pre><code class="language-json">{
  "id": 1,
  "name": "Tool Box Nova",
  "active": true,
  "score": 9.8,
  "tags": ["json", "tools"],
  "meta": null,
  "address": {
    "city": "New York",
    "zip": "10001"
  }
}</code></pre>
`,
zh: `
<h2>6 条核心语法规则</h2>
<p>JSON 有非常精简且严格的语法。违反任何规则都会导致解析错误。</p>

<h3>规则 1：数据以键值对形式存储</h3>
<pre><code class="language-json">{ "name": "Alice" }</code></pre>
<p>键必须是用<strong>双引号</strong>括起来的字符串。单引号或裸标识符均无效。</p>

<h3>规则 2：数据之间用逗号分隔</h3>
<pre><code class="language-json">{ "a": 1, "b": 2, "c": 3 }</code></pre>
<p>⚠️ 最后一项后<strong>不能有尾随逗号</strong>，这是最常见的错误。</p>
<pre><code class="language-json">// ❌ 无效
{ "a": 1, "b": 2, }

// ✅ 有效
{ "a": 1, "b": 2 }</code></pre>

<h3>规则 3：花括号表示对象</h3>
<pre><code class="language-json">{
  "id": 1,
  "user": {
    "name": "Alice",
    "role": "admin"
  }
}</code></pre>

<h3>规则 4：方括号表示数组</h3>
<pre><code class="language-json">{ "tags": ["json", "api", "web"] }</code></pre>

<h3>规则 5：字符串必须使用双引号</h3>
<pre><code class="language-json">// ❌ 无效 — 不能用单引号
{ 'name': 'Alice' }

// ✅ 有效
{ "name": "Alice" }</code></pre>

<h3>规则 6：不允许注释</h3>
<pre><code class="language-json">// ❌ 无效 — JSON 没有注释语法
{
  // 这是用户名
  "name": "Alice"
}

// ✅ 如需注释，请使用 JSONC 或 JSON5</code></pre>

<h2>有效的 JSON 值类型</h2>
<p>JSON 文档的根节点可以是以下任意类型：</p>
<pre><code class="language-json">// 对象
{ "key": "value" }

// 数组
[1, 2, 3]

// 字符串
"hello"

// 数字
42

// 布尔值
true

// 空值
null</code></pre>

<h2>字符串转义规则</h2>
<p>在字符串内部，以下字符必须用反斜杠转义：</p>
<table style="width:100%;border-collapse:collapse;font-size:14px">
  <tr style="background:#f1f5f9"><th style="padding:8px;border:1px solid #e2e8f0;text-align:left">字符</th><th style="padding:8px;border:1px solid #e2e8f0;text-align:left">转义序列</th></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">双引号 <code>"</code></td><td style="padding:8px;border:1px solid #e2e8f0"><code>\\"</code></td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">反斜杠 <code>\\</code></td><td style="padding:8px;border:1px solid #e2e8f0"><code>\\\\</code></td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">换行符</td><td style="padding:8px;border:1px solid #e2e8f0"><code>\\n</code></td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">制表符</td><td style="padding:8px;border:1px solid #e2e8f0"><code>\\t</code></td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">Unicode 字符</td><td style="padding:8px;border:1px solid #e2e8f0"><code>\\uXXXX</code></td></tr>
</table>

<h2>数字规则</h2>
<pre><code class="language-json">// ✅ 有效数字
42
-17
3.14
1.5e10
-2.5E-3

// ❌ 无效数字
0777      // 不允许前导零
.5        // 必须以数字开头
NaN       // JSON 中无效
Infinity  // JSON 中无效</code></pre>

<h2>完整有效示例</h2>
<pre><code class="language-json">{
  "id": 1,
  "name": "Tool Box Nova",
  "active": true,
  "score": 9.8,
  "tags": ["json", "tools"],
  "meta": null,
  "address": {
    "city": "北京",
    "zip": "100000"
  }
}</code></pre>
`};

window.LEARN_ARTICLES["json-data-types"] = {
en: `
<h2>The 6 JSON Data Types</h2>
<p>JSON supports exactly six data types. Understanding each is fundamental to working with JSON correctly.</p>

<h2>1. String</h2>
<p>A sequence of Unicode characters enclosed in <strong>double quotes</strong>.</p>
<pre><code class="language-json">"Hello, World!"
"user@example.com"
"Line1\\nLine2"
"Unicode: \\u4e2d\\u6587"</code></pre>
<p>Key rules: Always double-quoted, backslash escaping for special characters.</p>

<h2>2. Number</h2>
<p>JSON has a single number type covering both integers and floating-point.</p>
<pre><code class="language-json">42          // integer
-17         // negative
3.14159     // float
1.5e10      // scientific notation
-2.5E-3     // negative scientific</code></pre>
<p>⚠️ No <code>NaN</code>, no <code>Infinity</code>, no hex (<code>0xFF</code>), no leading zeros (<code>07</code>).</p>

<h2>3. Boolean</h2>
<p>Exactly two values: <code>true</code> or <code>false</code> — always lowercase.</p>
<pre><code class="language-json">{ "active": true, "deleted": false }</code></pre>
<p>⚠️ <code>True</code>, <code>TRUE</code>, <code>1</code>, <code>"true"</code> are NOT boolean in JSON.</p>

<h2>4. Null</h2>
<p>Represents an intentionally absent value. Always lowercase: <code>null</code>.</p>
<pre><code class="language-json">{ "middleName": null, "deletedAt": null }</code></pre>

<h2>5. Object</h2>
<p>An unordered collection of key/value pairs enclosed in curly braces <code>{}</code>.</p>
<pre><code class="language-json">{
  "id": 1,
  "name": "Alice",
  "role": "admin",
  "scores": [98, 87, 95]
}</code></pre>
<p>Keys must be unique strings. Object property order is not guaranteed.</p>

<h2>6. Array</h2>
<p>An ordered list of values enclosed in square brackets <code>[]</code>.</p>
<pre><code class="language-json">[1, 2, 3]
["a", "b", "c"]
[true, null, 42, "mixed"]
[{"id": 1}, {"id": 2}]</code></pre>
<p>Arrays can hold any mix of types, including other arrays and objects.</p>

<h2>Type Comparison Table</h2>
<table style="width:100%;border-collapse:collapse;font-size:14px">
  <tr style="background:#f1f5f9"><th style="padding:8px;border:1px solid #e2e8f0">Type</th><th style="padding:8px;border:1px solid #e2e8f0">Example</th><th style="padding:8px;border:1px solid #e2e8f0">Notes</th></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">string</td><td style="padding:8px;border:1px solid #e2e8f0"><code>"hello"</code></td><td style="padding:8px;border:1px solid #e2e8f0">Double quotes required</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">number</td><td style="padding:8px;border:1px solid #e2e8f0"><code>42</code>, <code>3.14</code></td><td style="padding:8px;border:1px solid #e2e8f0">No NaN/Infinity</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">boolean</td><td style="padding:8px;border:1px solid #e2e8f0"><code>true</code>, <code>false</code></td><td style="padding:8px;border:1px solid #e2e8f0">Lowercase only</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">null</td><td style="padding:8px;border:1px solid #e2e8f0"><code>null</code></td><td style="padding:8px;border:1px solid #e2e8f0">Lowercase only</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">object</td><td style="padding:8px;border:1px solid #e2e8f0"><code>{}</code></td><td style="padding:8px;border:1px solid #e2e8f0">Key-value pairs</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">array</td><td style="padding:8px;border:1px solid #e2e8f0"><code>[]</code></td><td style="padding:8px;border:1px solid #e2e8f0">Ordered list</td></tr>
</table>

<h2>Real-World Example with All Types</h2>
<pre><code class="language-json">{
  "userId": 42,
  "username": "alice_w",
  "email": "alice@example.com",
  "isVerified": true,
  "balance": 99.99,
  "avatarUrl": null,
  "roles": ["user", "editor"],
  "profile": {
    "bio": "JSON enthusiast",
    "followers": 1200
  }
}</code></pre>
`,
zh: `
<h2>JSON 的 6 种数据类型</h2>
<p>JSON 支持恰好六种数据类型。理解每种类型是正确使用 JSON 的基础。</p>

<h2>1. 字符串（String）</h2>
<p>由<strong>双引号</strong>括起来的 Unicode 字符序列。</p>
<pre><code class="language-json">"Hello, World!"
"user@example.com"
"第一行\\n第二行"
"Unicode: \\u4e2d\\u6587"</code></pre>
<p>关键规则：必须使用双引号，特殊字符需用反斜杠转义。</p>

<h2>2. 数字（Number）</h2>
<p>JSON 只有一种数字类型，同时涵盖整数和浮点数。</p>
<pre><code class="language-json">42          // 整数
-17         // 负数
3.14159     // 浮点数
1.5e10      // 科学计数法
-2.5E-3     // 负科学计数法</code></pre>
<p>⚠️ 不支持 <code>NaN</code>、<code>Infinity</code>、十六进制（<code>0xFF</code>）或前导零（<code>07</code>）。</p>

<h2>3. 布尔值（Boolean）</h2>
<p>只有两个值：<code>true</code> 或 <code>false</code>——必须小写。</p>
<pre><code class="language-json">{ "active": true, "deleted": false }</code></pre>
<p>⚠️ <code>True</code>、<code>TRUE</code>、<code>1</code>、<code>"true"</code> 在 JSON 中都不是布尔类型。</p>

<h2>4. 空值（Null）</h2>
<p>表示有意缺失的值。始终小写：<code>null</code>。</p>
<pre><code class="language-json">{ "middleName": null, "deletedAt": null }</code></pre>

<h2>5. 对象（Object）</h2>
<p>用花括号 <code>{}</code> 括起来的无序键值对集合。</p>
<pre><code class="language-json">{
  "id": 1,
  "name": "Alice",
  "role": "admin",
  "scores": [98, 87, 95]
}</code></pre>
<p>键必须是唯一字符串，对象属性的顺序不保证。</p>

<h2>6. 数组（Array）</h2>
<p>用方括号 <code>[]</code> 括起来的有序值列表。</p>
<pre><code class="language-json">[1, 2, 3]
["a", "b", "c"]
[true, null, 42, "混合类型"]
[{"id": 1}, {"id": 2}]</code></pre>
<p>数组可以包含任何类型的混合值，包括其他数组和对象。</p>

<h2>类型对比表</h2>
<table style="width:100%;border-collapse:collapse;font-size:14px">
  <tr style="background:#f1f5f9"><th style="padding:8px;border:1px solid #e2e8f0">类型</th><th style="padding:8px;border:1px solid #e2e8f0">示例</th><th style="padding:8px;border:1px solid #e2e8f0">说明</th></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">string</td><td style="padding:8px;border:1px solid #e2e8f0"><code>"hello"</code></td><td style="padding:8px;border:1px solid #e2e8f0">必须用双引号</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">number</td><td style="padding:8px;border:1px solid #e2e8f0"><code>42</code>, <code>3.14</code></td><td style="padding:8px;border:1px solid #e2e8f0">不支持 NaN/Infinity</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">boolean</td><td style="padding:8px;border:1px solid #e2e8f0"><code>true</code>, <code>false</code></td><td style="padding:8px;border:1px solid #e2e8f0">仅小写</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">null</td><td style="padding:8px;border:1px solid #e2e8f0"><code>null</code></td><td style="padding:8px;border:1px solid #e2e8f0">仅小写</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">object</td><td style="padding:8px;border:1px solid #e2e8f0"><code>{}</code></td><td style="padding:8px;border:1px solid #e2e8f0">键值对集合</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">array</td><td style="padding:8px;border:1px solid #e2e8f0"><code>[]</code></td><td style="padding:8px;border:1px solid #e2e8f0">有序列表</td></tr>
</table>

<h2>包含所有类型的真实示例</h2>
<pre><code class="language-json">{
  "userId": 42,
  "username": "alice_w",
  "email": "alice@example.com",
  "isVerified": true,
  "balance": 99.99,
  "avatarUrl": null,
  "roles": ["user", "editor"],
  "profile": {
    "bio": "JSON 爱好者",
    "followers": 1200
  }
}</code></pre>
`};

window.LEARN_ARTICLES["json-objects-and-arrays"] = {
en: `
<h2>JSON Objects</h2>
<p>An object is an unordered collection of key/value pairs enclosed in curly braces.</p>
<pre><code class="language-json">{
  "id": 1,
  "name": "Alice",
  "email": "alice@example.com"
}</code></pre>

<h3>Key Rules for Objects</h3>
<ul>
  <li>Keys must be <strong>strings in double quotes</strong></li>
  <li>Keys should be <strong>unique</strong> within one object (duplicate keys produce undefined behavior)</li>
  <li>Key/value pairs separated by <strong>commas</strong></li>
  <li><strong>No trailing comma</strong> after the last pair</li>
</ul>

<h3>Nested Objects</h3>
<pre><code class="language-json">{
  "user": {
    "id": 1,
    "name": "Alice",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "country": "US"
    }
  }
}</code></pre>

<h2>JSON Arrays</h2>
<p>An array is an ordered list of values enclosed in square brackets.</p>
<pre><code class="language-json">["apple", "banana", "cherry"]
[1, 2, 3, 4, 5]
[true, false, null]</code></pre>

<h3>Arrays of Objects</h3>
<p>The most common pattern in APIs — a list of records:</p>
<pre><code class="language-json">{
  "users": [
    { "id": 1, "name": "Alice", "role": "admin" },
    { "id": 2, "name": "Bob",   "role": "user"  },
    { "id": 3, "name": "Carol", "role": "editor"}
  ]
}</code></pre>

<h3>Nested Arrays</h3>
<pre><code class="language-json">{
  "matrix": [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
  ]
}</code></pre>

<h2>Accessing Values</h2>
<pre><code class="language-javascript">const data = {
  "users": [
    { "id": 1, "name": "Alice" },
    { "id": 2, "name": "Bob" }
  ]
};

// Access object property
console.log(data.users);          // array of users

// Access array element by index (0-based)
console.log(data.users[0]);       // { id: 1, name: "Alice" }
console.log(data.users[0].name);  // "Alice"
console.log(data.users[1].id);    // 2</code></pre>

<h2>Common Patterns</h2>

<h3>Pagination Response</h3>
<pre><code class="language-json">{
  "data": [
    { "id": 1, "title": "Article 1" },
    { "id": 2, "title": "Article 2" }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "total_pages": 8
  }
}</code></pre>

<h3>API Error Response</h3>
<pre><code class="language-json">{
  "error": {
    "code": 404,
    "message": "Resource not found",
    "details": ["The user with id=99 does not exist"]
  }
}</code></pre>

<h2>Gotchas to Avoid</h2>
<ul>
  <li>❌ <code>{"key": value,}</code> — trailing comma in object</li>
  <li>❌ <code>[1, 2, 3,]</code> — trailing comma in array</li>
  <li>❌ <code>{key: "value"}</code> — unquoted key</li>
  <li>❌ <code>{'key': 'value'}</code> — single-quoted key/value</li>
  <li>✅ Always validate with <a href="/json/validate">our JSON validator</a></li>
</ul>
`,
zh: `
<h2>JSON 对象</h2>
<p>对象是用花括号括起来的无序键值对集合。</p>
<pre><code class="language-json">{
  "id": 1,
  "name": "Alice",
  "email": "alice@example.com"
}</code></pre>

<h3>对象的关键规则</h3>
<ul>
  <li>键必须是用<strong>双引号括起来的字符串</strong></li>
  <li>同一对象内键应当<strong>唯一</strong>（重复键会产生未定义行为）</li>
  <li>键值对之间用<strong>逗号</strong>分隔</li>
  <li>最后一对后面<strong>不能有尾随逗号</strong></li>
</ul>

<h3>嵌套对象</h3>
<pre><code class="language-json">{
  "user": {
    "id": 1,
    "name": "Alice",
    "address": {
      "street": "中关村大街1号",
      "city": "北京",
      "country": "CN"
    }
  }
}</code></pre>

<h2>JSON 数组</h2>
<p>数组是用方括号括起来的有序值列表。</p>
<pre><code class="language-json">["苹果", "香蕉", "樱桃"]
[1, 2, 3, 4, 5]
[true, false, null]</code></pre>

<h3>对象数组</h3>
<p>API 中最常见的模式——记录列表：</p>
<pre><code class="language-json">{
  "users": [
    { "id": 1, "name": "Alice", "role": "admin" },
    { "id": 2, "name": "Bob",   "role": "user"  },
    { "id": 3, "name": "Carol", "role": "editor"}
  ]
}</code></pre>

<h3>嵌套数组</h3>
<pre><code class="language-json">{
  "matrix": [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
  ]
}</code></pre>

<h2>访问值</h2>
<pre><code class="language-javascript">const data = {
  "users": [
    { "id": 1, "name": "Alice" },
    { "id": 2, "name": "Bob" }
  ]
};

// 访问对象属性
console.log(data.users);          // 用户数组

// 通过索引访问数组元素（从 0 开始）
console.log(data.users[0]);       // { id: 1, name: "Alice" }
console.log(data.users[0].name);  // "Alice"
console.log(data.users[1].id);    // 2</code></pre>

<h2>常见模式</h2>

<h3>分页响应</h3>
<pre><code class="language-json">{
  "data": [
    { "id": 1, "title": "文章 1" },
    { "id": 2, "title": "文章 2" }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "total_pages": 8
  }
}</code></pre>

<h3>API 错误响应</h3>
<pre><code class="language-json">{
  "error": {
    "code": 404,
    "message": "资源未找到",
    "details": ["id=99 的用户不存在"]
  }
}</code></pre>

<h2>需要避免的常见错误</h2>
<ul>
  <li>❌ <code>{"key": value,}</code> — 对象中的尾随逗号</li>
  <li>❌ <code>[1, 2, 3,]</code> — 数组中的尾随逗号</li>
  <li>❌ <code>{key: "value"}</code> — 未加引号的键</li>
  <li>❌ <code>{'key': 'value'}</code> — 单引号键/值</li>
  <li>✅ 请始终用<a href="/json/validate">我们的 JSON 验证器</a>进行验证</li>
</ul>
`};

window.LEARN_ARTICLES["json-stringify-and-parse"] = {
en: `
<h2>JSON.parse() — String to Object</h2>
<p><code>JSON.parse()</code> converts a JSON string into a JavaScript value.</p>
<pre><code class="language-javascript">const jsonString = '{"name":"Alice","age":30,"active":true}';
const obj = JSON.parse(jsonString);

console.log(obj.name);   // "Alice"
console.log(obj.age);    // 30
console.log(obj.active); // true</code></pre>

<h3>Parsing Arrays</h3>
<pre><code class="language-javascript">const arr = JSON.parse('[1, 2, 3]');
console.log(arr[0]); // 1</code></pre>

<h3>Error Handling</h3>
<pre><code class="language-javascript">try {
  const obj = JSON.parse('invalid json {');
} catch (e) {
  console.error('Parse failed:', e.message);
  // SyntaxError: Unexpected token i in JSON at position 0
}</code></pre>

<h3>The Reviver Parameter</h3>
<p>Transform values during parsing:</p>
<pre><code class="language-javascript">const json = '{"name":"Alice","createdAt":"2024-01-15T10:00:00Z"}';
const obj = JSON.parse(json, (key, value) => {
  if (key === 'createdAt') return new Date(value);
  return value;
});
console.log(obj.createdAt instanceof Date); // true</code></pre>

<h2>JSON.stringify() — Object to String</h2>
<p><code>JSON.stringify()</code> converts a JavaScript value into a JSON string.</p>
<pre><code class="language-javascript">const obj = { name: 'Alice', age: 30, active: true };
const json = JSON.stringify(obj);
console.log(json); // '{"name":"Alice","age":30,"active":true}'</code></pre>

<h3>Pretty Printing with Indentation</h3>
<pre><code class="language-javascript">const json = JSON.stringify(obj, null, 2);
// {
//   "name": "Alice",
//   "age": 30,
//   "active": true
// }</code></pre>

<h3>The Replacer Parameter</h3>
<pre><code class="language-javascript">// Array replacer — whitelist properties
const json = JSON.stringify(obj, ['name', 'age']);
// '{"name":"Alice","age":30}' — active is excluded

// Function replacer
const json2 = JSON.stringify(obj, (key, value) => {
  if (typeof value === 'boolean') return undefined; // remove booleans
  return value;
});
// '{"name":"Alice","age":30}'</code></pre>

<h3>Values That Don't Serialize</h3>
<pre><code class="language-javascript">JSON.stringify({ fn: () => {}, sym: Symbol(), undef: undefined });
// '{}'  — functions, symbols, undefined are omitted

JSON.stringify([undefined, Symbol(), () => {}]);
// '[null,null,null]'  — in arrays, they become null

JSON.stringify(NaN);     // 'null'
JSON.stringify(Infinity); // 'null'</code></pre>

<h3>Custom toJSON()</h3>
<pre><code class="language-javascript">class User {
  constructor(name, password) {
    this.name = name;
    this.password = password;
  }
  toJSON() {
    return { name: this.name }; // never serialize password
  }
}
const user = new User('Alice', 'secret');
console.log(JSON.stringify(user)); // '{"name":"Alice"}'</code></pre>

<h2>Deep Clone Pattern</h2>
<pre><code class="language-javascript">// Simple deep clone (loses Date, functions, undefined)
const clone = JSON.parse(JSON.stringify(original));

// Modern alternative (Node 17+, modern browsers)
const clone2 = structuredClone(original); // preserves Dates, Maps, Sets</code></pre>

<h2>Performance Tips</h2>
<ul>
  <li>For large JSON, consider <strong>streaming parsers</strong> (e.g., <code>stream-json</code> in Node.js)</li>
  <li><strong>orjson</strong> (Python), <strong>simdjson</strong> (C++/Go) are 5-10× faster than standard parsers</li>
  <li>Avoid repeated stringify/parse in hot loops</li>
</ul>
`,
zh: `
<h2>JSON.parse() — 字符串转对象</h2>
<p><code>JSON.parse()</code> 将 JSON 字符串转换为 JavaScript 值。</p>
<pre><code class="language-javascript">const jsonString = '{"name":"Alice","age":30,"active":true}';
const obj = JSON.parse(jsonString);

console.log(obj.name);   // "Alice"
console.log(obj.age);    // 30
console.log(obj.active); // true</code></pre>

<h3>解析数组</h3>
<pre><code class="language-javascript">const arr = JSON.parse('[1, 2, 3]');
console.log(arr[0]); // 1</code></pre>

<h3>错误处理</h3>
<pre><code class="language-javascript">try {
  const obj = JSON.parse('无效的 json {');
} catch (e) {
  console.error('解析失败:', e.message);
  // SyntaxError: Unexpected token ...
}</code></pre>

<h3>reviver 参数</h3>
<p>在解析时转换值：</p>
<pre><code class="language-javascript">const json = '{"name":"Alice","createdAt":"2024-01-15T10:00:00Z"}';
const obj = JSON.parse(json, (key, value) => {
  if (key === 'createdAt') return new Date(value);
  return value;
});
console.log(obj.createdAt instanceof Date); // true</code></pre>

<h2>JSON.stringify() — 对象转字符串</h2>
<p><code>JSON.stringify()</code> 将 JavaScript 值转换为 JSON 字符串。</p>
<pre><code class="language-javascript">const obj = { name: 'Alice', age: 30, active: true };
const json = JSON.stringify(obj);
console.log(json); // '{"name":"Alice","age":30,"active":true}'</code></pre>

<h3>美化缩进输出</h3>
<pre><code class="language-javascript">const json = JSON.stringify(obj, null, 2);
// {
//   "name": "Alice",
//   "age": 30,
//   "active": true
// }</code></pre>

<h3>replacer 参数</h3>
<pre><code class="language-javascript">// 数组 replacer —— 白名单属性
const json = JSON.stringify(obj, ['name', 'age']);
// '{"name":"Alice","age":30}' — active 被排除

// 函数 replacer
const json2 = JSON.stringify(obj, (key, value) => {
  if (typeof value === 'boolean') return undefined; // 移除布尔值
  return value;
});
// '{"name":"Alice","age":30}'</code></pre>

<h3>不会被序列化的值</h3>
<pre><code class="language-javascript">JSON.stringify({ fn: () => {}, sym: Symbol(), undef: undefined });
// '{}'  — 函数、Symbol、undefined 会被省略

JSON.stringify([undefined, Symbol(), () => {}]);
// '[null,null,null]'  — 在数组中变为 null

JSON.stringify(NaN);      // 'null'
JSON.stringify(Infinity); // 'null'</code></pre>

<h3>自定义 toJSON()</h3>
<pre><code class="language-javascript">class User {
  constructor(name, password) {
    this.name = name;
    this.password = password;
  }
  toJSON() {
    return { name: this.name }; // 永远不序列化密码
  }
}
const user = new User('Alice', 'secret');
console.log(JSON.stringify(user)); // '{"name":"Alice"}'</code></pre>

<h2>深拷贝模式</h2>
<pre><code class="language-javascript">// 简单深拷贝（会丢失 Date、函数、undefined）
const clone = JSON.parse(JSON.stringify(original));

// 现代替代方案（Node 17+，现代浏览器）
const clone2 = structuredClone(original); // 保留 Date、Map、Set</code></pre>

<h2>性能建议</h2>
<ul>
  <li>对于大型 JSON，考虑使用<strong>流式解析器</strong>（如 Node.js 中的 <code>stream-json</code>）</li>
  <li><strong>orjson</strong>（Python）、<strong>simdjson</strong>（C++/Go）比标准解析器快 5-10 倍</li>
  <li>避免在热循环中反复执行 stringify/parse</li>
</ul>
`};

window.LEARN_ARTICLES["json-formatting-pretty-print"] = {
en: `
<h2>What is JSON Formatting?</h2>
<p>JSON formatting (pretty-printing) adds whitespace and indentation to make JSON human-readable. Minification removes all unnecessary whitespace to reduce file size.</p>

<h2>Pretty-Print in JavaScript</h2>
<pre><code class="language-javascript">const obj = { name: "Alice", age: 30, tags: ["admin", "editor"] };

// Minified (no spaces)
JSON.stringify(obj);
// '{"name":"Alice","age":30,"tags":["admin","editor"]}'

// 2-space indentation
JSON.stringify(obj, null, 2);
// {
//   "name": "Alice",
//   "age": 30,
//   "tags": [
//     "admin",
//     "editor"
//   ]
// }

// Tab indentation
JSON.stringify(obj, null, '\\t');</code></pre>

<h2>Pretty-Print in Other Languages</h2>

<h3>Python</h3>
<pre><code class="language-python">import json
obj = {"name": "Alice", "age": 30}

# Pretty print
print(json.dumps(obj, indent=2, ensure_ascii=False))
# Sort keys
print(json.dumps(obj, indent=2, sort_keys=True))</code></pre>

<h3>Go</h3>
<pre><code class="language-go">import "encoding/json"

data := map[string]interface{}{"name": "Alice", "age": 30}
out, _ := json.MarshalIndent(data, "", "  ")
fmt.Println(string(out))</code></pre>

<h3>Command Line (jq)</h3>
<pre><code class="language-bash"># Pretty print any JSON file
jq '.' data.json

# Pretty print from curl
curl https://api.example.com/users | jq '.'

# Minify
jq -c '.' data.json</code></pre>

<h2>When to Minify vs Pretty-Print</h2>
<table style="width:100%;border-collapse:collapse;font-size:14px">
  <tr style="background:#f1f5f9"><th style="padding:8px;border:1px solid #e2e8f0">Use Case</th><th style="padding:8px;border:1px solid #e2e8f0">Recommendation</th></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">API responses in production</td><td style="padding:8px;border:1px solid #e2e8f0">✅ Minify to reduce bandwidth</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">Config files checked into git</td><td style="padding:8px;border:1px solid #e2e8f0">✅ Pretty-print for readability</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">Log files</td><td style="padding:8px;border:1px solid #e2e8f0">✅ Single-line (minified) per event</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">Debugging / development</td><td style="padding:8px;border:1px solid #e2e8f0">✅ Pretty-print always</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">Data transfer over network</td><td style="padding:8px;border:1px solid #e2e8f0">✅ Minify + gzip compression</td></tr>
</table>

<h2>Online Tool</h2>
<p>Use our <a href="/json/pretty">JSON Formatter & Beautifier</a> to instantly format any JSON, or our <a href="/json/minify">JSON Minifier</a> to compress it.</p>
`,
zh: `
<h2>什么是 JSON 格式化？</h2>
<p>JSON 格式化（美化输出）通过添加空格和缩进使 JSON 易于人类阅读。压缩则删除所有不必要的空格以减小文件大小。</p>

<h2>JavaScript 中的美化输出</h2>
<pre><code class="language-javascript">const obj = { name: "Alice", age: 30, tags: ["admin", "editor"] };

// 压缩（无空格）
JSON.stringify(obj);
// '{"name":"Alice","age":30,"tags":["admin","editor"]}'

// 2 空格缩进
JSON.stringify(obj, null, 2);
// {
//   "name": "Alice",
//   "age": 30,
//   "tags": [
//     "admin",
//     "editor"
//   ]
// }

// Tab 缩进
JSON.stringify(obj, null, '\\t');</code></pre>

<h2>其他语言中的美化输出</h2>

<h3>Python</h3>
<pre><code class="language-python">import json
obj = {"name": "Alice", "age": 30}

# 美化输出
print(json.dumps(obj, indent=2, ensure_ascii=False))
# 按键名排序
print(json.dumps(obj, indent=2, sort_keys=True))</code></pre>

<h3>Go</h3>
<pre><code class="language-go">import "encoding/json"

data := map[string]interface{}{"name": "Alice", "age": 30}
out, _ := json.MarshalIndent(data, "", "  ")
fmt.Println(string(out))</code></pre>

<h3>命令行（jq）</h3>
<pre><code class="language-bash"># 美化任意 JSON 文件
jq '.' data.json

# 美化 curl 输出
curl https://api.example.com/users | jq '.'

# 压缩
jq -c '.' data.json</code></pre>

<h2>何时压缩 vs 美化</h2>
<table style="width:100%;border-collapse:collapse;font-size:14px">
  <tr style="background:#f1f5f9"><th style="padding:8px;border:1px solid #e2e8f0">使用场景</th><th style="padding:8px;border:1px solid #e2e8f0">建议</th></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">生产环境 API 响应</td><td style="padding:8px;border:1px solid #e2e8f0">✅ 压缩以减少带宽</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">提交到 git 的配置文件</td><td style="padding:8px;border:1px solid #e2e8f0">✅ 美化以提高可读性</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">日志文件</td><td style="padding:8px;border:1px solid #e2e8f0">✅ 每条事件单行（压缩）</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">调试/开发</td><td style="padding:8px;border:1px solid #e2e8f0">✅ 始终美化</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">网络数据传输</td><td style="padding:8px;border:1px solid #e2e8f0">✅ 压缩 + gzip 压缩</td></tr>
</table>

<h2>在线工具</h2>
<p>使用我们的 <a href="/json/pretty">JSON 格式化/美化工具</a>即时格式化任何 JSON，或使用 <a href="/json/minify">JSON 压缩工具</a>进行压缩。</p>
`};

window.LEARN_ARTICLES["how-to-open-json-files"] = {
en: `
<h2>Opening JSON Files by Platform</h2>

<h3>Windows</h3>
<ul>
  <li><strong>Notepad</strong> — right-click the file → Open with → Notepad (basic, no highlighting)</li>
  <li><strong>Notepad++</strong> — free editor with JSON syntax highlighting and the JSTool plugin for formatting</li>
  <li><strong>VS Code</strong> — open the file, press <kbd>Shift+Alt+F</kbd> to auto-format JSON</li>
</ul>

<h3>macOS</h3>
<ul>
  <li><strong>TextEdit</strong> — File → Open, change "Enable:" to "All Files"</li>
  <li><strong>VS Code</strong> — drag and drop, then <kbd>Shift+Option+F</kbd> to format</li>
  <li><strong>Terminal</strong>: <code>cat file.json | python3 -m json.tool</code></li>
</ul>

<h3>Linux</h3>
<pre><code class="language-bash"># View formatted in terminal
cat data.json | python3 -m json.tool
cat data.json | jq '.'

# Open in nano/vim
nano data.json
vim data.json</code></pre>

<h2>VS Code — Best JSON Editor</h2>
<p>VS Code has built-in JSON support:</p>
<ul>
  <li><strong>Format Document</strong>: <kbd>Shift+Alt+F</kbd> (Windows) / <kbd>Shift+Option+F</kbd> (Mac)</li>
  <li><strong>Fold/Unfold</strong> sections with the arrows in the gutter</li>
  <li><strong>JSON Schema validation</strong>: add <code>"$schema"</code> to your JSON</li>
  <li><strong>IntelliSense</strong>: auto-complete for known JSON schemas (package.json, tsconfig.json, etc.)</li>
</ul>
<pre><code class="language-bash"># Open from terminal
code data.json
code .  # open folder</code></pre>

<h2>Online JSON Viewers</h2>
<ul>
  <li><a href="/json/pretty">ToolboxNova JSON Formatter</a> — format, validate, and explore JSON in browser</li>
  <li><a href="/json/tree">JSON Tree Viewer</a> — visual tree navigation</li>
  <li><a href="/json/validate">JSON Validator</a> — check for syntax errors</li>
</ul>

<h2>Opening Large JSON Files</h2>
<p>Files over 50MB need specialized tools:</p>
<pre><code class="language-bash"># Stream process with jq (handles GB-sized files)
jq '.users[] | .name' huge.json

# Python streaming
import json
with open('huge.json') as f:
    data = json.load(f)  # loads entire file

# ijson for streaming large files
import ijson
with open('huge.json', 'rb') as f:
    for item in ijson.items(f, 'users.item'):
        print(item['name'])</code></pre>
`,
zh: `
<h2>按平台打开 JSON 文件</h2>

<h3>Windows</h3>
<ul>
  <li><strong>记事本</strong> — 右键点击文件 → 打开方式 → 记事本（基础，无高亮）</li>
  <li><strong>Notepad++</strong> — 免费编辑器，支持 JSON 语法高亮和 JSTool 插件格式化</li>
  <li><strong>VS Code</strong> — 打开文件后按 <kbd>Shift+Alt+F</kbd> 自动格式化 JSON</li>
</ul>

<h3>macOS</h3>
<ul>
  <li><strong>TextEdit</strong> — 文件 → 打开，将"启用"改为"所有文件"</li>
  <li><strong>VS Code</strong> — 拖放文件，然后按 <kbd>Shift+Option+F</kbd> 格式化</li>
  <li><strong>终端</strong>: <code>cat file.json | python3 -m json.tool</code></li>
</ul>

<h3>Linux</h3>
<pre><code class="language-bash"># 在终端中格式化查看
cat data.json | python3 -m json.tool
cat data.json | jq '.'

# 在 nano/vim 中打开
nano data.json
vim data.json</code></pre>

<h2>VS Code — 最佳 JSON 编辑器</h2>
<p>VS Code 内置 JSON 支持：</p>
<ul>
  <li><strong>格式化文档</strong>：Windows <kbd>Shift+Alt+F</kbd> / Mac <kbd>Shift+Option+F</kbd></li>
  <li>使用装订线中的箭头<strong>折叠/展开</strong>部分</li>
  <li><strong>JSON Schema 验证</strong>：在 JSON 中添加 <code>"$schema"</code></li>
  <li><strong>智能感知</strong>：对已知 JSON Schema 自动补全（package.json、tsconfig.json 等）</li>
</ul>
<pre><code class="language-bash"># 从终端打开
code data.json
code .  # 打开文件夹</code></pre>

<h2>在线 JSON 查看器</h2>
<ul>
  <li><a href="/json/pretty">ToolboxNova JSON 格式化工具</a> — 在浏览器中格式化、验证和探索 JSON</li>
  <li><a href="/json/tree">JSON 树形查看器</a> — 可视化树形导航</li>
  <li><a href="/json/validate">JSON 验证器</a> — 检查语法错误</li>
</ul>

<h2>打开大型 JSON 文件</h2>
<p>超过 50MB 的文件需要专门工具：</p>
<pre><code class="language-bash"># 使用 jq 流式处理（支持 GB 级文件）
jq '.users[] | .name' huge.json

# Python 流式处理
import json
with open('huge.json') as f:
    data = json.load(f)  # 加载整个文件

# 使用 ijson 流式处理大文件
import ijson
with open('huge.json', 'rb') as f:
    for item in ijson.items(f, 'users.item'):
        print(item['name'])</code></pre>
`};

window.LEARN_ARTICLES["json-comments"] = {
en: `
<h2>Why JSON Has No Comments</h2>
<p>Douglas Crockford, JSON's creator, deliberately removed comments from the specification. In a 2012 post he explained:</p>
<blockquote style="border-left:4px solid #3b82f6;padding:12px 16px;background:#eff6ff;margin:16px 0;border-radius:4px">
  <p>"I removed comments from JSON because I saw people were using them to hold parsing directives... That kind of interoperability is fatal to JSON."</p>
</blockquote>
<p>The design goal was a minimal, unambiguous format for data interchange — not configuration.</p>

<h2>Alternatives for Adding Comments</h2>

<h3>Option 1: JSONC (JSON with Comments)</h3>
<p>JSONC is used by VS Code settings, TypeScript config, and more:</p>
<pre><code class="language-json">// .vscode/settings.json (JSONC)
{
  // Editor settings
  "editor.tabSize": 2,        // 2-space tabs
  "editor.formatOnSave": true /* auto-format */
}</code></pre>
<p>Strip JSONC comments before parsing: use our <a href="/json/jsonc">JSONC → JSON tool</a>.</p>

<h3>Option 2: JSON5</h3>
<p>JSON5 is a superset adding comments, trailing commas, and unquoted keys:</p>
<pre><code class="language-json5">// JSON5 example
{
  name: "Alice",          // unquoted key
  "age": 30,
  // This is a comment
  /* Multi-line
     comment */
  tags: ["admin",],       // trailing comma OK
}</code></pre>

<h3>Option 3: "Comment" Fields (Workaround)</h3>
<pre><code class="language-json">{
  "_comment": "Production database config — do not commit",
  "host": "db.prod.example.com",
  "port": 5432,
  "database": "myapp_prod"
}</code></pre>
<p>⚠️ The <code>_comment</code> field will be parsed as real data — ignore it in your code.</p>

<h3>Option 4: Use YAML Instead</h3>
<pre><code class="language-yaml"># Database config
host: db.prod.example.com  # production host
port: 5432
database: myapp_prod</code></pre>

<h2>When to Use Each</h2>
<table style="width:100%;border-collapse:collapse;font-size:14px">
  <tr style="background:#f1f5f9"><th style="padding:8px;border:1px solid #e2e8f0">Format</th><th style="padding:8px;border:1px solid #e2e8f0">Best For</th></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">Standard JSON</td><td style="padding:8px;border:1px solid #e2e8f0">API responses, data interchange, maximum compatibility</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">JSONC</td><td style="padding:8px;border:1px solid #e2e8f0">VS Code configs, TypeScript/ESLint settings</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">JSON5</td><td style="padding:8px;border:1px solid #e2e8f0">Config files where human authoring is important</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">YAML</td><td style="padding:8px;border:1px solid #e2e8f0">DevOps configs (Docker, Kubernetes, GitHub Actions)</td></tr>
</table>
`,
zh: `
<h2>为什么 JSON 没有注释</h2>
<p>JSON 的创建者 Douglas Crockford 有意从规范中去除了注释。他在 2012 年的一篇文章中解释道：</p>
<blockquote style="border-left:4px solid #3b82f6;padding:12px 16px;background:#eff6ff;margin:16px 0;border-radius:4px">
  <p>"我从 JSON 中删除了注释，因为我看到人们用它们来存放解析指令……这种互操作性对 JSON 来说是致命的。"</p>
</blockquote>
<p>设计目标是一种最简化、无歧义的数据交换格式——而不是配置格式。</p>

<h2>添加注释的替代方案</h2>

<h3>方案 1：JSONC（带注释的 JSON）</h3>
<p>JSONC 被 VS Code 设置、TypeScript 配置等使用：</p>
<pre><code class="language-json">// .vscode/settings.json（JSONC）
{
  // 编辑器设置
  "editor.tabSize": 2,        // 2 空格缩进
  "editor.formatOnSave": true /* 自动格式化 */
}</code></pre>
<p>解析前需去除 JSONC 注释：使用我们的 <a href="/json/jsonc">JSONC → JSON 工具</a>。</p>

<h3>方案 2：JSON5</h3>
<p>JSON5 是 JSON 的超集，增加了注释、尾随逗号和无引号键：</p>
<pre><code class="language-json5">// JSON5 示例
{
  name: "Alice",          // 无引号键
  "age": 30,
  // 这是一条注释
  /* 多行
     注释 */
  tags: ["admin",],       // 允许尾随逗号
}</code></pre>

<h3>方案 3："注释"字段（变通方案）</h3>
<pre><code class="language-json">{
  "_comment": "生产数据库配置——请勿提交",
  "host": "db.prod.example.com",
  "port": 5432,
  "database": "myapp_prod"
}</code></pre>
<p>⚠️ <code>_comment</code> 字段会被解析为真实数据——在代码中忽略它即可。</p>

<h3>方案 4：改用 YAML</h3>
<pre><code class="language-yaml"># 数据库配置
host: db.prod.example.com  # 生产主机
port: 5432
database: myapp_prod</code></pre>

<h2>各方案适用场景</h2>
<table style="width:100%;border-collapse:collapse;font-size:14px">
  <tr style="background:#f1f5f9"><th style="padding:8px;border:1px solid #e2e8f0">格式</th><th style="padding:8px;border:1px solid #e2e8f0">最适合</th></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">标准 JSON</td><td style="padding:8px;border:1px solid #e2e8f0">API 响应、数据交换、最大兼容性</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">JSONC</td><td style="padding:8px;border:1px solid #e2e8f0">VS Code 配置、TypeScript/ESLint 设置</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">JSON5</td><td style="padding:8px;border:1px solid #e2e8f0">需要人工编辑的配置文件</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">YAML</td><td style="padding:8px;border:1px solid #e2e8f0">DevOps 配置（Docker、Kubernetes、GitHub Actions）</td></tr>
</table>
`};

window.LEARN_ARTICLES["json-history-and-rfc"] = {
en: `
<h2>The Origin of JSON</h2>
<p>JSON was created by <strong>Douglas Crockford</strong> around 2001. The format itself was based on a subset of JavaScript's object literal syntax that had existed since the language's creation in 1995.</p>
<p>The key insight was that JavaScript objects could be serialized as text and deserialized back without any custom parsing — the browser's <code>eval()</code> function could parse JSON directly (though this was later deemed insecure).</p>

<h2>Timeline</h2>
<table style="width:100%;border-collapse:collapse;font-size:14px">
  <tr style="background:#f1f5f9"><th style="padding:8px;border:1px solid #e2e8f0">Year</th><th style="padding:8px;border:1px solid #e2e8f0">Event</th></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">1999</td><td style="padding:8px;border:1px solid #e2e8f0">JavaScript 1.2 introduces object literals; Crockford notices JSON-like patterns</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">2001</td><td style="padding:8px;border:1px solid #e2e8f0">json.org website launched; first JSON parser released</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">2005</td><td style="padding:8px;border:1px solid #e2e8f0">Ajax popularized; JSON becomes preferred over XML for web APIs</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">2006</td><td style="padding:8px;border:1px solid #e2e8f0"><strong>RFC 4627</strong> — first official JSON standard by Crockford</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">2013</td><td style="padding:8px;border:1px solid #e2e8f0"><strong>RFC 7158</strong> / <strong>ECMA-404</strong> — updated specification</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">2014</td><td style="padding:8px;border:1px solid #e2e8f0"><strong>RFC 7159</strong> — obsoletes RFC 4627, clarifies ambiguities</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">2017</td><td style="padding:8px;border:1cols solid #e2e8f0"><strong>RFC 8259</strong> — current standard (obsoletes RFC 7159), mandates UTF-8</td></tr>
</table>

<h2>RFC 4627 vs RFC 8259: Key Differences</h2>
<ul>
  <li><strong>RFC 4627</strong>: Only objects and arrays were valid top-level values</li>
  <li><strong>RFC 8259</strong>: Any JSON value can be the root (string, number, boolean, null are now valid)</li>
  <li><strong>RFC 8259</strong>: UTF-8 encoding is mandatory (previous RFCs allowed UTF-16, UTF-32)</li>
  <li><strong>RFC 8259</strong>: Duplicate object keys are explicitly "SHOULD NOT" (still not an error)</li>
</ul>

<h2>Why JSON Won Over XML</h2>
<ul>
  <li><strong>Native JavaScript parsing</strong> — no external library needed</li>
  <li><strong>Compact</strong> — typically 30-40% smaller than equivalent XML</li>
  <li><strong>Direct mapping</strong> to programming language types</li>
  <li><strong>Human readable</strong> without XML's verbose tag repetition</li>
  <li><strong>No namespace complexity</strong></li>
</ul>
`,
zh: `
<h2>JSON 的起源</h2>
<p>JSON 由 <strong>Douglas Crockford</strong> 在 2001 年前后创建。该格式本身基于 JavaScript 对象字面量语法的一个子集，该语法自 1995 年语言诞生之初就已存在。</p>
<p>核心洞见是：JavaScript 对象可以被序列化为文本，再无需自定义解析器即可反序列化——浏览器的 <code>eval()</code> 函数可以直接解析 JSON（尽管后来被认为不安全）。</p>

<h2>发展时间线</h2>
<table style="width:100%;border-collapse:collapse;font-size:14px">
  <tr style="background:#f1f5f9"><th style="padding:8px;border:1px solid #e2e8f0">年份</th><th style="padding:8px;border:1px solid #e2e8f0">事件</th></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">1999</td><td style="padding:8px;border:1px solid #e2e8f0">JavaScript 1.2 引入对象字面量；Crockford 注意到类 JSON 模式</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">2001</td><td style="padding:8px;border:1px solid #e2e8f0">json.org 网站上线；首个 JSON 解析器发布</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">2005</td><td style="padding:8px;border:1px solid #e2e8f0">Ajax 普及；JSON 成为 Web API 首选格式（胜过 XML）</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">2006</td><td style="padding:8px;border:1px solid #e2e8f0"><strong>RFC 4627</strong> — Crockford 发布首个官方 JSON 标准</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">2013</td><td style="padding:8px;border:1px solid #e2e8f0"><strong>RFC 7158</strong> / <strong>ECMA-404</strong> — 更新规范</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">2014</td><td style="padding:8px;border:1px solid #e2e8f0"><strong>RFC 7159</strong> — 废弃 RFC 4627，澄清歧义</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">2017</td><td style="padding:8px;border:1px solid #e2e8f0"><strong>RFC 8259</strong> — 现行标准（废弃 RFC 7159），强制使用 UTF-8</td></tr>
</table>

<h2>RFC 4627 与 RFC 8259：主要差异</h2>
<ul>
  <li><strong>RFC 4627</strong>：只有对象和数组才是有效的顶层值</li>
  <li><strong>RFC 8259</strong>：任何 JSON 值都可以作为根节点（字符串、数字、布尔值、null 现在均有效）</li>
  <li><strong>RFC 8259</strong>：强制使用 UTF-8 编码（之前的 RFC 允许 UTF-16、UTF-32）</li>
  <li><strong>RFC 8259</strong>：明确"不应"（SHOULD NOT）使用重复对象键（但仍不是错误）</li>
</ul>

<h2>为什么 JSON 击败了 XML</h2>
<ul>
  <li><strong>原生 JavaScript 解析</strong> — 无需外部库</li>
  <li><strong>体积小</strong> — 通常比等效 XML 小 30-40%</li>
  <li><strong>直接映射</strong>到编程语言类型</li>
  <li><strong>人类可读</strong>，无需 XML 繁琐的重复标签</li>
  <li><strong>无命名空间复杂性</strong></li>
</ul>
`};

window.LEARN_ARTICLES["json-cheat-sheet"] = {
en: `
<h2>JSON Syntax Quick Reference</h2>
<pre><code class="language-json">{
  "string":  "hello world",
  "number":  42,
  "float":   3.14,
  "boolean": true,
  "null":    null,
  "array":   [1, "two", true, null],
  "object":  { "nested": "value" }
}</code></pre>

<h2>Data Types</h2>
<table style="width:100%;border-collapse:collapse;font-size:14px">
  <tr style="background:#f1f5f9"><th style="padding:8px;border:1px solid #e2e8f0">Type</th><th style="padding:8px;border:1px solid #e2e8f0">Valid Examples</th><th style="padding:8px;border:1px solid #e2e8f0">Invalid</th></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">string</td><td style="padding:8px;border:1px solid #e2e8f0"><code>"hello"</code>, <code>"1+1=2"</code></td><td style="padding:8px;border:1px solid #e2e8f0"><code>'hello'</code></td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">number</td><td style="padding:8px;border:1px solid #e2e8f0"><code>42</code>, <code>-1.5</code>, <code>1e3</code></td><td style="padding:8px;border:1px solid #e2e8f0"><code>NaN</code>, <code>0x1F</code></td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">boolean</td><td style="padding:8px;border:1px solid #e2e8f0"><code>true</code>, <code>false</code></td><td style="padding:8px;border:1px solid #e2e8f0"><code>True</code>, <code>1</code></td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">null</td><td style="padding:8px;border:1px solid #e2e8f0"><code>null</code></td><td style="padding:8px;border:1px solid #e2e8f0"><code>Null</code>, <code>NULL</code></td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">array</td><td style="padding:8px;border:1px solid #e2e8f0"><code>[1,2,3]</code>, <code>[]</code></td><td style="padding:8px;border:1px solid #e2e8f0"><code>[1,2,3,]</code></td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">object</td><td style="padding:8px;border:1px solid #e2e8f0"><code>{"a":1}</code>, <code>{}</code></td><td style="padding:8px;border:1px solid #e2e8f0"><code>{a:1}</code></td></tr>
</table>

<h2>String Escape Sequences</h2>
<table style="width:100%;border-collapse:collapse;font-size:14px">
  <tr style="background:#f1f5f9"><th style="padding:8px;border:1px solid #e2e8f0">Escape</th><th style="padding:8px;border:1px solid #e2e8f0">Meaning</th></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0"><code>\\"</code></td><td style="padding:8px;border:1px solid #e2e8f0">Double quote</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0"><code>\\\\</code></td><td style="padding:8px;border:1px solid #e2e8f0">Backslash</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0"><code>\\n</code></td><td style="padding:8px;border:1px solid #e2e8f0">Newline</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0"><code>\\t</code></td><td style="padding:8px;border:1px solid #e2e8f0">Tab</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0"><code>\\r</code></td><td style="padding:8px;border:1px solid #e2e8f0">Carriage return</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0"><code>\\uXXXX</code></td><td style="padding:8px;border:1px solid #e2e8f0">Unicode code point</td></tr>
</table>

<h2>JavaScript Cheat Sheet</h2>
<pre><code class="language-javascript">// Parse
const obj = JSON.parse(jsonString);

// Stringify
const str = JSON.stringify(obj);           // compact
const pretty = JSON.stringify(obj, null, 2); // 2-space indent

// Safe parse
function safeParse(s, fallback = null) {
  try { return JSON.parse(s); }
  catch { return fallback; }
}

// Deep clone
const clone = JSON.parse(JSON.stringify(obj));</code></pre>

<h2>Python Cheat Sheet</h2>
<pre><code class="language-python">import json

# Parse
obj = json.loads(json_string)

# Stringify
s = json.dumps(obj)
pretty = json.dumps(obj, indent=2, ensure_ascii=False)

# File I/O
with open('data.json', 'r') as f:
    data = json.load(f)

with open('data.json', 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)</code></pre>

<h2>Common Gotchas</h2>
<ul>
  <li>❌ Trailing comma: <code>{"a":1,}</code> or <code>[1,2,]</code></li>
  <li>❌ Single quotes: <code>{'a':'b'}</code></li>
  <li>❌ Unquoted keys: <code>{a: 1}</code></li>
  <li>❌ Comments: <code>// comment</code> or <code>/* comment */</code></li>
  <li>❌ Undefined: <code>{"a": undefined}</code></li>
  <li>❌ NaN/Infinity: <code>{"x": NaN}</code></li>
  <li>✅ Use <a href="/json/validate">JSON Validator</a> to check</li>
</ul>
`,
zh: `
<h2>JSON 语法快速参考</h2>
<pre><code class="language-json">{
  "string":  "hello world",
  "number":  42,
  "float":   3.14,
  "boolean": true,
  "null":    null,
  "array":   [1, "two", true, null],
  "object":  { "nested": "value" }
}</code></pre>

<h2>数据类型</h2>
<table style="width:100%;border-collapse:collapse;font-size:14px">
  <tr style="background:#f1f5f9"><th style="padding:8px;border:1px solid #e2e8f0">类型</th><th style="padding:8px;border:1px solid #e2e8f0">有效示例</th><th style="padding:8px;border:1px solid #e2e8f0">无效示例</th></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">string</td><td style="padding:8px;border:1px solid #e2e8f0"><code>"hello"</code></td><td style="padding:8px;border:1px solid #e2e8f0"><code>'hello'</code></td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">number</td><td style="padding:8px;border:1px solid #e2e8f0"><code>42</code>, <code>-1.5</code></td><td style="padding:8px;border:1px solid #e2e8f0"><code>NaN</code>, <code>0x1F</code></td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">boolean</td><td style="padding:8px;border:1px solid #e2e8f0"><code>true</code>, <code>false</code></td><td style="padding:8px;border:1px solid #e2e8f0"><code>True</code>, <code>1</code></td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">null</td><td style="padding:8px;border:1px solid #e2e8f0"><code>null</code></td><td style="padding:8px;border:1px solid #e2e8f0"><code>Null</code></td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">array</td><td style="padding:8px;border:1px solid #e2e8f0"><code>[1,2,3]</code></td><td style="padding:8px;border:1px solid #e2e8f0"><code>[1,2,]</code></td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0">object</td><td style="padding:8px;border:1px solid #e2e8f0"><code>{"a":1}</code></td><td style="padding:8px;border:1px solid #e2e8f0"><code>{a:1}</code></td></tr>
</table>

<h2>字符串转义序列</h2>
<table style="width:100%;border-collapse:collapse;font-size:14px">
  <tr style="background:#f1f5f9"><th style="padding:8px;border:1px solid #e2e8f0">转义序列</th><th style="padding:8px;border:1px solid #e2e8f0">含义</th></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0"><code>\\"</code></td><td style="padding:8px;border:1px solid #e2e8f0">双引号</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0"><code>\\\\</code></td><td style="padding:8px;border:1px solid #e2e8f0">反斜杠</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0"><code>\\n</code></td><td style="padding:8px;border:1px solid #e2e8f0">换行符</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0"><code>\\t</code></td><td style="padding:8px;border:1px solid #e2e8f0">制表符</td></tr>
  <tr><td style="padding:8px;border:1px solid #e2e8f0"><code>\\uXXXX</code></td><td style="padding:8px;border:1px solid #e2e8f0">Unicode 码点</td></tr>
</table>

<h2>JavaScript 速查</h2>
<pre><code class="language-javascript">// 解析
const obj = JSON.parse(jsonString);

// 序列化
const str = JSON.stringify(obj);             // 紧凑
const pretty = JSON.stringify(obj, null, 2); // 2 空格缩进

// 安全解析
function safeParse(s, fallback = null) {
  try { return JSON.parse(s); }
  catch { return fallback; }
}

// 深拷贝
const clone = JSON.parse(JSON.stringify(obj));</code></pre>

<h2>Python 速查</h2>
<pre><code class="language-python">import json

# 解析
obj = json.loads(json_string)

# 序列化
s = json.dumps(obj)
pretty = json.dumps(obj, indent=2, ensure_ascii=False)

# 文件读写
with open('data.json', 'r') as f:
    data = json.load(f)

with open('data.json', 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)</code></pre>

<h2>常见陷阱</h2>
<ul>
  <li>❌ 尾随逗号：<code>{"a":1,}</code> 或 <code>[1,2,]</code></li>
  <li>❌ 单引号：<code>{'a':'b'}</code></li>
  <li>❌ 无引号键：<code>{a: 1}</code></li>
  <li>❌ 注释：<code>// 注释</code> 或 <code>/* 注释 */</code></li>
  <li>❌ undefined：<code>{"a": undefined}</code></li>
  <li>❌ NaN/Infinity：<code>{"x": NaN}</code></li>
  <li>✅ 使用 <a href="/json/validate">JSON 验证器</a> 检查</li>
</ul>
`};

