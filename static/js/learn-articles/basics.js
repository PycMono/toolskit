/* JSON Learn Articles: basics */
window.LEARN_ARTICLES = window.LEARN_ARTICLES || {};

window.LEARN_ARTICLES["what-is-json"] = {
zh: `<h1>什么是 JSON？零基础完全入门</h1>
<h2>什么是 JSON</h2>
<p>JSON（JavaScript Object Notation）是一种轻量级的数据交换格式。尽管名字中包含 JavaScript，但它是一种<strong>语言无关</strong>的格式，几乎所有主流编程语言都提供了 JSON 的解析和生成支持。</p>
<h2>为什么 JSON 如此流行</h2>
<ol>
<li><strong>人类可读</strong>：纯文本格式，不需要特殊工具即可阅读和编写</li>
<li><strong>机器友好</strong>：解析速度快，生成简单</li>
<li><strong>语言无关</strong>：Python、Java、Go、C#、PHP、Ruby、Rust 等几乎所有语言都原生支持</li>
<li><strong>体积小巧</strong>：相比 XML 等格式，JSON 的数据冗余更少</li>
</ol>
<h2>JSON 的基本结构</h2>
<pre><code class="language-json">{
  &#34;name&#34;: &#34;张三&#34;,
  &#34;age&#34;: 28,
  &#34;isStudent&#34;: false,
  &#34;courses&#34;: [&#34;数学&#34;, &#34;物理&#34;],
  &#34;address&#34;: { &#34;city&#34;: &#34;北京&#34; }
}</code></pre>
<h2>JSON 支持的数据类型</h2>
<table>
<thead><tr><th>类型</th><th>示例</th></tr></thead>
<tbody>
<tr><td>字符串</td><td><code>&#34;Hello&#34;</code></td></tr>
<tr><td>数值</td><td><code>42</code>, <code>3.14</code></td></tr>
<tr><td>布尔值</td><td><code>true</code>, <code>false</code></td></tr>
<tr><td>null</td><td><code>null</code></td></tr>
<tr><td>对象</td><td><code>{&#34;key&#34;: &#34;value&#34;}</code></td></tr>
<tr><td>数组</td><td><code>[1, 2, 3]</code></td></tr>
</tbody>
</table>
<h2>小结</h2>
<ul>
<li>JSON 是一种轻量级、语言无关的数据交换格式</li>
<li>由对象 <code>{}</code> 和数组 <code>[]</code> 两种基本结构组成</li>
<li>键名<strong>必须</strong>使用双引号，不支持注释和尾随逗号</li>
</ul>
`,
en: `<h1>What is JSON? A Complete Beginner's Guide</h1>
<h2>What is JSON</h2>
<p>JSON (JavaScript Object Notation) is a lightweight data interchange format. Despite having "JavaScript" in its name, JSON is a <strong>language-independent</strong> format supported natively by virtually every major programming language.</p>
<h2>Why JSON is So Popular</h2>
<ol>
<li><strong>Human-readable</strong>: Plain text anyone can read and write without special tools</li>
<li><strong>Machine-friendly</strong>: Fast to parse, simple to generate</li>
<li><strong>Language-independent</strong>: Supported by Python, Java, Go, C#, PHP, Ruby, Rust and more</li>
<li><strong>Compact</strong>: Less redundancy compared to XML</li>
</ol>
<h2>Basic JSON Structure</h2>
<pre><code class="language-json">{
  &#34;name&#34;: &#34;Alice&#34;,
  &#34;age&#34;: 28,
  &#34;isStudent&#34;: false,
  &#34;courses&#34;: [&#34;Math&#34;, &#34;Physics&#34;],
  &#34;address&#34;: { &#34;city&#34;: &#34;Beijing&#34; }
}</code></pre>
<h2>JSON Data Types</h2>
<table>
<thead><tr><th>Type</th><th>Example</th></tr></thead>
<tbody>
<tr><td>String</td><td><code>&#34;Hello&#34;</code></td></tr>
<tr><td>Number</td><td><code>42</code>, <code>3.14</code></td></tr>
<tr><td>Boolean</td><td><code>true</code>, <code>false</code></td></tr>
<tr><td>null</td><td><code>null</code></td></tr>
<tr><td>Object</td><td><code>{&#34;key&#34;: &#34;value&#34;}</code></td></tr>
<tr><td>Array</td><td><code>[1, 2, 3]</code></td></tr>
</tbody>
</table>
<h2>Summary</h2>
<ul>
<li>JSON is a lightweight, language-independent data interchange format</li>
<li>Built from objects <code>{}</code> and arrays <code>[]</code></li>
<li>Keys <strong>must</strong> use double quotes; no comments or trailing commas</li>
</ul>
`
};

window.LEARN_ARTICLES["json-data-types"] = {
zh: `<h1>JSON 数据类型详解</h1>
<h2>六种数据类型</h2>
<p>JSON 支持且仅支持以下六种数据类型：字符串、数值、布尔值、null、对象、数组。</p>
<h2>字符串（String）</h2>
<pre><code class="language-json">{
  &#34;name&#34;: &#34;Alice&#34;,
  &#34;escaped&#34;: &#34;He said \\&#34;hello\\&#34;&#34;,
  &#34;path&#34;: &#34;C:\\\\Users\\\\admin&#34;,
  &#34;unicode&#34;: &#34;\\u4F60\\u597D&#34;
}</code></pre>
<h2>数值（Number）</h2>
<pre><code class="language-json">{ &#34;integer&#34;: 42, &#34;float&#34;: 3.14, &#34;scientific&#34;: 2.5e10 }</code></pre>
<p>不支持：前导零（<code>07</code>）、正号（<code>+3</code>）、十六进制（<code>0xFF</code>）、NaN、Infinity。</p>
<h2>布尔值（Boolean）</h2>
<pre><code class="language-json">{ &#34;isActive&#34;: true, &#34;isDeleted&#34;: false }</code></pre>
<h2>Null</h2>
<pre><code class="language-json">{ &#34;middleName&#34;: null }</code></pre>
<h2>类型对比表</h2>
<table>
<thead><tr><th>JSON 类型</th><th>JavaScript</th><th>Python</th><th>Go</th></tr></thead>
<tbody>
<tr><td>string</td><td>string</td><td>str</td><td>string</td></tr>
<tr><td>number</td><td>number</td><td>int/float</td><td>float64</td></tr>
<tr><td>boolean</td><td>boolean</td><td>bool</td><td>bool</td></tr>
<tr><td>null</td><td>null</td><td>None</td><td>nil</td></tr>
<tr><td>object</td><td>Object</td><td>dict</td><td>map/struct</td></tr>
<tr><td>array</td><td>Array</td><td>list</td><td>slice</td></tr>
</tbody>
</table>
`,
en: `<h1>JSON Data Types Explained</h1>
<h2>Six Data Types</h2>
<p>JSON supports exactly six data types: String, Number, Boolean, null, Object, and Array.</p>
<h2>String</h2>
<pre><code class="language-json">{
  &#34;name&#34;: &#34;Alice&#34;,
  &#34;escaped&#34;: &#34;He said \\&#34;hello\\&#34;&#34;,
  &#34;path&#34;: &#34;C:\\\\Users\\\\admin&#34;
}</code></pre>
<h2>Number</h2>
<pre><code class="language-json">{ &#34;integer&#34;: 42, &#34;float&#34;: 3.14, &#34;scientific&#34;: 2.5e10 }</code></pre>
<h2>Boolean</h2>
<pre><code class="language-json">{ &#34;isActive&#34;: true, &#34;isDeleted&#34;: false }</code></pre>
<h2>Null</h2>
<pre><code class="language-json">{ &#34;middleName&#34;: null }</code></pre>
<h2>Type Comparison</h2>
<table>
<thead><tr><th>JSON type</th><th>JavaScript</th><th>Python</th><th>Go</th></tr></thead>
<tbody>
<tr><td>string</td><td>string</td><td>str</td><td>string</td></tr>
<tr><td>number</td><td>number</td><td>int/float</td><td>float64</td></tr>
<tr><td>boolean</td><td>boolean</td><td>bool</td><td>bool</td></tr>
<tr><td>null</td><td>null</td><td>None</td><td>nil</td></tr>
<tr><td>object</td><td>Object</td><td>dict</td><td>map/struct</td></tr>
<tr><td>array</td><td>Array</td><td>list</td><td>slice</td></tr>
</tbody>
</table>
`
};

window.LEARN_ARTICLES["json-nesting"] = {
zh: `<h1>JSON 嵌套结构设计最佳实践</h1>
<h2>嵌套示例</h2>
<pre><code class="language-json">{
  &#34;order&#34;: {
    &#34;id&#34;: &#34;ORD-001&#34;,
    &#34;customer&#34;: { &#34;name&#34;: &#34;Alice&#34;, &#34;city&#34;: &#34;北京&#34; },
    &#34;items&#34;: [
      { &#34;name&#34;: &#34;键盘&#34;, &#34;qty&#34;: 1, &#34;price&#34;: 599 }
    ]
  }
}</code></pre>
<h2>嵌套深度建议</h2>
<table>
<thead><tr><th>深度</th><th>建议</th></tr></thead>
<tbody>
<tr><td>1-2 层</td><td>✅ 最易读</td></tr>
<tr><td>3-4 层</td><td>✅ 合理上限</td></tr>
<tr><td>5+ 层</td><td>⚠️ 考虑扁平化</td></tr>
</tbody>
</table>
<h2>小结</h2>
<ul>
<li>嵌套让 JSON 可以表达复杂树状数据关系</li>
<li>建议不超过 3-4 层嵌套</li>
<li>对象数组是最常用的嵌套模式</li>
</ul>
`,
en: `<h1>JSON Nesting: Structure Design Best Practices</h1>
<h2>Nesting Example</h2>
<pre><code class="language-json">{
  &#34;order&#34;: {
    &#34;id&#34;: &#34;ORD-001&#34;,
    &#34;customer&#34;: { &#34;name&#34;: &#34;Alice&#34;, &#34;city&#34;: &#34;Beijing&#34; },
    &#34;items&#34;: [
      { &#34;name&#34;: &#34;Keyboard&#34;, &#34;qty&#34;: 1, &#34;price&#34;: 599 }
    ]
  }
}</code></pre>
<h2>Nesting Depth Guidelines</h2>
<table>
<thead><tr><th>Depth</th><th>Recommendation</th></tr></thead>
<tbody>
<tr><td>1-2 levels</td><td>✅ Most readable</td></tr>
<tr><td>3-4 levels</td><td>✅ Reasonable limit</td></tr>
<tr><td>5+ levels</td><td>⚠️ Consider flattening</td></tr>
</tbody>
</table>
<h2>Summary</h2>
<ul>
<li>Nesting allows complex tree-shaped data representation</li>
<li>Recommended limit: 3-4 levels</li>
<li>Array-of-objects is the most common nesting pattern</li>
</ul>
`
};

window.LEARN_ARTICLES["json-formatting-beautify"] = {
zh: `<h1>JSON 格式化与美化：工具与技巧</h1>
<h2>压缩 vs 美化</h2>
<p><strong>压缩：</strong></p>
<pre><code class="language-json">{&#34;name&#34;:&#34;Alice&#34;,&#34;age&#34;:25}</code></pre>
<p><strong>美化：</strong></p>
<pre><code class="language-json">{
  &#34;name&#34;: &#34;Alice&#34;,
  &#34;age&#34;: 25
}</code></pre>
<h2>各语言格式化</h2>
<pre><code class="language-javascript">JSON.stringify(obj, null, 2);  // 美化
JSON.stringify(obj);           // 压缩</code></pre>
<pre><code class="language-python">json.dumps(data, indent=2, ensure_ascii=False)  # 美化
json.dumps(data, separators=(',', ':'))          # 压缩</code></pre>
<pre><code class="language-go">json.MarshalIndent(data, &#34;&#34;, &#34;  &#34;)  // 美化
json.Marshal(data)                    // 压缩</code></pre>
<h2>命令行工具</h2>
<pre><code class="language-bash">echo &#39;{&#34;a&#34;:1}&#39; | python3 -m json.tool  # Python
echo &#39;{&#34;a&#34;:1}&#39; | jq &#39;.&#39;               # jq</code></pre>
<h2>小结</h2>
<ul>
<li>格式化提高可读性，压缩减小传输体积</li>
<li>API 传输用压缩，开发调试用美化</li>
</ul>
`,
en: `<h1>JSON Formatting and Beautification</h1>
<h2>Compact vs Pretty</h2>
<p><strong>Compact:</strong></p>
<pre><code class="language-json">{&#34;name&#34;:&#34;Alice&#34;,&#34;age&#34;:25}</code></pre>
<p><strong>Pretty:</strong></p>
<pre><code class="language-json">{
  &#34;name&#34;: &#34;Alice&#34;,
  &#34;age&#34;: 25
}</code></pre>
<h2>Formatting by Language</h2>
<pre><code class="language-javascript">JSON.stringify(obj, null, 2);  // pretty
JSON.stringify(obj);           // compact</code></pre>
<pre><code class="language-python">json.dumps(data, indent=2, ensure_ascii=False)  # pretty
json.dumps(data, separators=(',', ':'))          # compact</code></pre>
<pre><code class="language-go">json.MarshalIndent(data, &#34;&#34;, &#34;  &#34;)  // pretty
json.Marshal(data)                    // compact</code></pre>
<h2>CLI Tools</h2>
<pre><code class="language-bash">echo &#39;{&#34;a&#34;:1}&#39; | python3 -m json.tool  # Python
echo &#39;{&#34;a&#34;:1}&#39; | jq &#39;.&#39;               # jq</code></pre>
<h2>Summary</h2>
<ul>
<li>Formatting improves readability; compact reduces transfer size</li>
<li>Use compact for API transfer, pretty for development debugging</li>
</ul>
`
};

window.LEARN_ARTICLES["json-syntax-rules"] = {
zh: `<h1>JSON 语法规则权威指南</h1>
<h2>核心语法规则</h2>
<h3>规则 1：键名必须是双引号字符串</h3>
<pre><code class="language-json">{ &#34;name&#34;: &#34;Alice&#34; }  // ✅
{ &#39;name&#39;: &#39;Alice&#39; }  // ❌ 单引号
{ name: &#34;Alice&#34; }    // ❌ 无引号</code></pre>
<h3>规则 2：最后一项不能有尾随逗号</h3>
<pre><code class="language-json">{ &#34;a&#34;: 1, &#34;b&#34;: 2 }   // ✅
{ &#34;a&#34;: 1, &#34;b&#34;: 2, }  // ❌</code></pre>
<h2>字符串转义</h2>
<table>
<thead><tr><th>转义</th><th>含义</th></tr></thead>
<tbody>
<tr><td><code>\\&#34;</code></td><td>双引号</td></tr>
<tr><td><code>\\\\</code></td><td>反斜杠</td></tr>
<tr><td><code>\\n</code></td><td>换行</td></tr>
<tr><td><code>\\t</code></td><td>制表符</td></tr>
<tr><td><code>\\uXXXX</code></td><td>Unicode</td></tr>
</tbody>
</table>
<h2>不合法数值</h2>
<pre><code class="language-json">07 / +3 / 0xFF / NaN / Infinity  // 全部无效</code></pre>
<h2>小结</h2>
<ul>
<li>键名必须双引号，字符串只能双引号</li>
<li>不支持注释、尾随逗号</li>
<li>必须 UTF-8 编码</li>
</ul>
`,
en: `<h1>The Definitive Guide to JSON Syntax Rules</h1>
<h2>Core Rules</h2>
<h3>Rule 1: Keys must be double-quoted strings</h3>
<pre><code class="language-json">{ &#34;name&#34;: &#34;Alice&#34; }  // ✅ Valid
{ &#39;name&#39;: &#39;Alice&#39; }  // ❌ single quotes
{ name: &#34;Alice&#34; }    // ❌ unquoted</code></pre>
<h3>Rule 2: No trailing comma on last item</h3>
<pre><code class="language-json">{ &#34;a&#34;: 1, &#34;b&#34;: 2 }   // ✅
{ &#34;a&#34;: 1, &#34;b&#34;: 2, }  // ❌</code></pre>
<h2>String Escapes</h2>
<table>
<thead><tr><th>Escape</th><th>Meaning</th></tr></thead>
<tbody>
<tr><td><code>\\&#34;</code></td><td>Double quote</td></tr>
<tr><td><code>\\\\</code></td><td>Backslash</td></tr>
<tr><td><code>\\n</code></td><td>Newline</td></tr>
<tr><td><code>\\t</code></td><td>Tab</td></tr>
<tr><td><code>\\uXXXX</code></td><td>Unicode</td></tr>
</tbody>
</table>
<h2>Invalid Numbers</h2>
<pre><code class="language-json">07 / +3 / 0xFF / NaN / Infinity  // all invalid</code></pre>
<h2>Summary</h2>
<ul>
<li>Keys must use double quotes; strings use double quotes only</li>
<li>No comments, no trailing commas</li>
<li>Must be UTF-8 encoded</li>
</ul>
`
};

window.LEARN_ARTICLES["json-objects"] = {
zh: `<h1>JSON 对象（Object）深入理解</h1>
<h2>什么是 JSON 对象</h2>
<p>JSON 对象是由花括号 <code>{}</code> 包裹的无序键值对集合。</p>
<h2>键名命名约定</h2>
<table>
<thead><tr><th>风格</th><th>示例</th><th>场景</th></tr></thead>
<tbody>
<tr><td>camelCase</td><td><code>&#34;firstName&#34;</code></td><td>JavaScript/前端</td></tr>
<tr><td>snake_case</td><td><code>&#34;first_name&#34;</code></td><td>Python/数据库</td></tr>
<tr><td>PascalCase</td><td><code>&#34;FirstName&#34;</code></td><td>C#/.NET</td></tr>
</tbody>
</table>
<h2>信封模式</h2>
<pre><code class="language-json">{
  &#34;status&#34;: &#34;success&#34;,
  &#34;data&#34;: { },
  &#34;meta&#34;: { &#34;requestId&#34;: &#34;abc&#34; }
}</code></pre>
<h2>小结</h2>
<ul>
<li>JSON 对象是无序的键值对集合</li>
<li>键名必须是双引号字符串，建议唯一</li>
<li>在同一项目中保持一致的命名风格</li>
</ul>
`,
en: `<h1>Deep Dive into JSON Objects</h1>
<h2>What is a JSON Object</h2>
<p>A JSON object is an unordered collection of key-value pairs enclosed in curly braces <code>{}</code>.</p>
<h2>Key Naming Conventions</h2>
<table>
<thead><tr><th>Style</th><th>Example</th><th>Usage</th></tr></thead>
<tbody>
<tr><td>camelCase</td><td><code>&#34;firstName&#34;</code></td><td>JavaScript/frontend</td></tr>
<tr><td>snake_case</td><td><code>&#34;first_name&#34;</code></td><td>Python/databases</td></tr>
<tr><td>PascalCase</td><td><code>&#34;FirstName&#34;</code></td><td>C#/.NET</td></tr>
</tbody>
</table>
<h2>Envelope Pattern</h2>
<pre><code class="language-json">{
  &#34;status&#34;: &#34;success&#34;,
  &#34;data&#34;: { },
  &#34;meta&#34;: { &#34;requestId&#34;: &#34;abc&#34; }
}</code></pre>
<h2>Summary</h2>
<ul>
<li>JSON objects are unordered key-value collections</li>
<li>Keys must be double-quoted strings; should be unique</li>
<li>Use consistent naming conventions within a project</li>
</ul>
`
};

window.LEARN_ARTICLES["json-arrays"] = {
zh: `<h1>JSON 数组（Array）完全指南</h1>
<h2>数组语法</h2>
<pre><code class="language-json">{
  &#34;names&#34;: [&#34;Alice&#34;, &#34;Bob&#34;],
  &#34;users&#34;: [
    { &#34;id&#34;: 1, &#34;name&#34;: &#34;Alice&#34; },
    { &#34;id&#34;: 2, &#34;name&#34;: &#34;Bob&#34; }
  ],
  &#34;empty&#34;: []
}</code></pre>
<h2>分页模式</h2>
<pre><code class="language-json">{
  &#34;data&#34;: [{ &#34;id&#34;: 1 }, { &#34;id&#34;: 2 }],
  &#34;pagination&#34;: { &#34;page&#34;: 1, &#34;total&#34;: 156, &#34;hasNext&#34;: true }
}</code></pre>
<h2>小结</h2>
<ul>
<li>数组是有序的值列表，保持元素同类型</li>
<li>空数组 <code>[]</code> 与 <code>null</code> 语义不同</li>
<li>大量数据需分页或用 NDJSON</li>
</ul>
`,
en: `<h1>The Complete Guide to JSON Arrays</h1>
<h2>Array Syntax</h2>
<pre><code class="language-json">{
  &#34;names&#34;: [&#34;Alice&#34;, &#34;Bob&#34;],
  &#34;users&#34;: [
    { &#34;id&#34;: 1, &#34;name&#34;: &#34;Alice&#34; },
    { &#34;id&#34;: 2, &#34;name&#34;: &#34;Bob&#34; }
  ],
  &#34;empty&#34;: []
}</code></pre>
<h2>Pagination Pattern</h2>
<pre><code class="language-json">{
  &#34;data&#34;: [{ &#34;id&#34;: 1 }, { &#34;id&#34;: 2 }],
  &#34;pagination&#34;: { &#34;page&#34;: 1, &#34;total&#34;: 156, &#34;hasNext&#34;: true }
}</code></pre>
<h2>Summary</h2>
<ul>
<li>Arrays are ordered — keep elements the same type</li>
<li>Empty <code>[]</code> and <code>null</code> have different semantics</li>
<li>Paginate large datasets or use NDJSON</li>
</ul>
`
};

window.LEARN_ARTICLES["json-strings-escaping"] = {
zh: `<h1>JSON 字符串与转义字符详解</h1>
<h2>转义字符</h2>
<pre><code class="language-json">{
  &#34;quote&#34;: &#34;She said \\&#34;hello\\&#34;&#34;,
  &#34;path&#34;: &#34;C:\\\\Users\\\\admin&#34;,
  &#34;newline&#34;: &#34;line1\\nline2&#34;,
  &#34;unicode&#34;: &#34;\\u4F60\\u597D&#34;
}</code></pre>
<h2>常见错误</h2>
<pre><code class="language-json">// ❌ 单引号
{ &#34;name&#34;: &#39;Alice&#39; }

// ❌ 未转义换行
{ &#34;text&#34;: &#34;line1
line2&#34; }

// ❌ 未转义反斜杠
{ &#34;path&#34;: &#34;C:\\Users\\admin&#34; }

// ✅ 正确
{ &#34;path&#34;: &#34;C:\\\\Users\\\\admin&#34; }</code></pre>
<h2>小结</h2>
<ul>
<li>必须用双引号，双引号和反斜杠需转义</li>
<li>不支持多行字符串，换行用 <code>\\n</code></li>
</ul>
`,
en: `<h1>JSON Strings and Escaping</h1>
<h2>Escape Sequences</h2>
<pre><code class="language-json">{
  &#34;quote&#34;: &#34;She said \\&#34;hello\\&#34;&#34;,
  &#34;path&#34;: &#34;C:\\\\Users\\\\admin&#34;,
  &#34;newline&#34;: &#34;line1\\nline2&#34;,
  &#34;unicode&#34;: &#34;\\u0048\\u0065\\u006C\\u006C\\u006F&#34;
}</code></pre>
<h2>Common Mistakes</h2>
<pre><code class="language-json">// ❌ Single quotes
{ &#34;name&#34;: &#39;Alice&#39; }

// ❌ Unescaped newline
{ &#34;text&#34;: &#34;line1
line2&#34; }

// ❌ Unescaped backslash
{ &#34;path&#34;: &#34;C:\\Users\\admin&#34; }

// ✅ Correct
{ &#34;path&#34;: &#34;C:\\\\Users\\\\admin&#34; }</code></pre>
<h2>Summary</h2>
<ul>
<li>Must use double quotes; escape double quotes and backslashes</li>
<li>No multiline string literals — use <code>\\n</code></li>
</ul>
`
};

window.LEARN_ARTICLES["json-numbers-booleans-null"] = {
zh: `<h1>JSON 数值、布尔值与 Null</h1>
<h2>数值</h2>
<pre><code class="language-json">{ &#34;int&#34;: 42, &#34;float&#34;: 3.14, &#34;sci&#34;: 6.022e23 }
// 无效：07 / +3 / 0xFF / NaN / Infinity</code></pre>
<p>货币建议用整数（分）或字符串，避免浮点精度问题。</p>
<h2>布尔值</h2>
<pre><code class="language-json">{ &#34;active&#34;: true, &#34;deleted&#34;: false }
// 无效：True / FALSE / &#34;true&#34; / 1</code></pre>
<h2>Null</h2>
<pre><code class="language-json">{ &#34;phone&#34;: null }
// 无效：None / NULL / Null</code></pre>
<p><code>null</code> vs 缺失字段：<code>null</code> 表示字段存在但值为空，缺失字段表示字段不存在。</p>
<h2>小结</h2>
<ul>
<li>布尔值和 null 都只有全小写一种写法</li>
<li>大整数（>2^53）用字符串表示</li>
</ul>
`,
en: `<h1>JSON Numbers, Booleans and Null</h1>
<h2>Numbers</h2>
<pre><code class="language-json">{ &#34;int&#34;: 42, &#34;float&#34;: 3.14, &#34;sci&#34;: 6.022e23 }
// Invalid: 07 / +3 / 0xFF / NaN / Infinity</code></pre>
<p>For currency: use integer cents or strings to avoid floating-point precision issues.</p>
<h2>Booleans</h2>
<pre><code class="language-json">{ &#34;active&#34;: true, &#34;deleted&#34;: false }
// Invalid: True / FALSE / &#34;true&#34; / 1</code></pre>
<h2>Null</h2>
<pre><code class="language-json">{ &#34;phone&#34;: null }
// Invalid: None / NULL / Null</code></pre>
<p><code>null</code> vs missing field: <code>null</code> means field exists but is empty; missing field means field doesn't exist.</p>
<h2>Summary</h2>
<ul>
<li>Booleans and null have only one form — all lowercase</li>
<li>Large integers (&gt;2^53) should be strings</li>
</ul>
`
};

window.LEARN_ARTICLES["first-json-file"] = {
zh: `<h1>第一个 JSON 文件：创建与读取</h1>
<h2>创建 JSON 文件</h2>
<pre><code class="language-json">{
  &#34;name&#34;: &#34;My First JSON&#34;,
  &#34;version&#34;: &#34;1.0.0&#34;,
  &#34;tags&#34;: [&#34;learning&#34;, &#34;json&#34;],
  &#34;config&#34;: {
    &#34;debug&#34;: false,
    &#34;maxRetries&#34;: 3
  }
}</code></pre>
<h2>用代码读写</h2>
<pre><code class="language-python">import json

# 写入
data = {&#34;name&#34;: &#34;Alice&#34;, &#34;age&#34;: 25}
with open(&#34;data.json&#34;, &#34;w&#34;, encoding=&#34;utf-8&#34;) as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

# 读取
with open(&#34;data.json&#34;, &#34;r&#34;, encoding=&#34;utf-8&#34;) as f:
    data = json.load(f)</code></pre>
<pre><code class="language-javascript">const fs = require(&#39;fs&#39;);
// 写入
fs.writeFileSync(&#39;data.json&#39;, JSON.stringify(data, null, 2));
// 读取
const data = JSON.parse(fs.readFileSync(&#39;data.json&#39;));</code></pre>
<h2>验证</h2>
<pre><code class="language-bash">python3 -m json.tool data.json &amp;&amp; echo &#34;Valid&#34;</code></pre>
<h2>小结</h2>
<ul>
<li>任何文本编辑器都可以创建 JSON 文件，使用 UTF-8 编码</li>
<li>VSCode 内置 JSON 验证和格式化</li>
</ul>
`,
en: `<h1>Your First JSON File</h1>
<h2>Create a JSON File</h2>
<pre><code class="language-json">{
  &#34;name&#34;: &#34;My First JSON&#34;,
  &#34;version&#34;: &#34;1.0.0&#34;,
  &#34;tags&#34;: [&#34;learning&#34;, &#34;json&#34;],
  &#34;config&#34;: {
    &#34;debug&#34;: false,
    &#34;maxRetries&#34;: 3
  }
}</code></pre>
<h2>Read and Write with Code</h2>
<pre><code class="language-python">import json

# Write
data = {&#34;name&#34;: &#34;Alice&#34;, &#34;age&#34;: 25}
with open(&#34;data.json&#34;, &#34;w&#34;, encoding=&#34;utf-8&#34;) as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

# Read
with open(&#34;data.json&#34;, &#34;r&#34;, encoding=&#34;utf-8&#34;) as f:
    data = json.load(f)</code></pre>
<pre><code class="language-javascript">const fs = require(&#39;fs&#39;);
// Write
fs.writeFileSync(&#39;data.json&#39;, JSON.stringify(data, null, 2));
// Read
const data = JSON.parse(fs.readFileSync(&#39;data.json&#39;));</code></pre>
<h2>Validate</h2>
<pre><code class="language-bash">python3 -m json.tool data.json &amp;&amp; echo &#34;Valid&#34;</code></pre>
<h2>Summary</h2>
<ul>
<li>Any text editor works — use UTF-8 encoding</li>
<li>VSCode has built-in JSON validation and formatting</li>
</ul>
`
};
