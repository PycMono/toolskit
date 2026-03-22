/* JSON Learn Articles: security-practical */
window.LEARN_ARTICLES = window.LEARN_ARTICLES || {};

window.LEARN_ARTICLES["json-security"] = {
zh: `<h1>JSON 安全最佳实践</h1>
<h2>JSON 安全概览</h2>
<p>JSON 本身是纯数据格式，没有可执行代码。但在 <strong>解析、传输和使用</strong> JSON 的过程中，存在多种安全风险。</p>
<h2>1. 永远不要用 eval() 解析 JSON</h2>
<pre><code class="language-javascript">// ❌ 极度危险
const data = eval(&#34;(&#34; + jsonString + &#34;)&#34;);

// ✓ 安全
const data = JSON.parse(jsonString);</code></pre>
<p><code>eval()</code> 会执行任意 JavaScript 代码。如果 <code>jsonString</code> 被注入恶意内容，后果不堪设想。现代浏览器和 Node.js 都内置了 <code>JSON.parse()</code>，没有任何理由使用 <code>eval()</code>。</p>
<h2>2. XSS 防护</h2>
<p>将 JSON 嵌入 HTML 时，需要转义特殊字符：</p>
<pre><code class="language-html">&lt;!-- ❌ 危险：如果 data 包含 &lt;/script&gt;，会导致 XSS --&gt;
&lt;script&gt;
  var data = {{ json_data | raw }};
&lt;/script&gt;

&lt;!-- ✓ 安全：转义特殊字符 --&gt;
&lt;script&gt;
  var data = JSON.parse({{ json_data | escapejs | quote }});
&lt;/script&gt;</code></pre>
<h3>HTML 中嵌入 JSON 的安全方法</h3>
<pre><code class="language-javascript">// 服务端：转义 &lt; 和 &gt; 等字符
function safeJsonForHtml(data) {
  return JSON.stringify(data)
    .replace(/&lt;/g, &#34;\\\\u003c&#34;)
    .replace(/&gt;/g, &#34;\\\\u003e&#34;)
    .replace(/&amp;/g, &#34;\\\\u0026&#34;)
    .replace(/&#39;/g, &#34;\\\\u0027&#34;);
}</code></pre>
<pre><code class="language-html">&lt;script type=&#34;application/json&#34; id=&#34;app-data&#34;&gt;
  {{ safe_json }}
&lt;/script&gt;
&lt;script&gt;
  const data = JSON.parse(document.getElementById(&#34;app-data&#34;).textContent);
&lt;/script&gt;</code></pre>
<h2>3. 反序列化安全</h2>
<p>某些语言的 JSON 库在反序列化时可能执行代码：</p>
<h3>Python — 不要用 yaml.load</h3>
<pre><code class="language-python">import yaml, json

# ❌ yaml.load 可以执行任意 Python 代码
data = yaml.load(untrusted_input)  # 危险！

# ✓ json.loads 是安全的
data = json.loads(untrusted_input)

# ✓ 如果必须用 YAML，使用 safe_load
data = yaml.safe_load(untrusted_input)</code></pre>
<h3>Java — 防范 Gadget Chain 攻击</h3>
<pre><code class="language-java">// ❌ 某些 JSON 库支持多态反序列化，可被利用
// Jackson 默认类型推断
ObjectMapper mapper = new ObjectMapper();
mapper.enableDefaultTyping(); // 危险！

// ✓ 禁用默认类型推断
ObjectMapper mapper = new ObjectMapper();
// 不要调用 enableDefaultTyping()

// ✓ 如果需要多态，使用白名单
@JsonTypeInfo(use = Id.NAME)
@JsonSubTypes({
    @JsonSubTypes.Type(value = Cat.class, name = &#34;cat&#34;),
    @JsonSubTypes.Type(value = Dog.class, name = &#34;dog&#34;)
})
public abstract class Animal { }</code></pre>
<h2>4. 输入验证</h2>
<p>永远不要信任客户端传来的 JSON：</p>
<pre><code class="language-python">import json
from jsonschema import validate

schema = {
    &#34;type&#34;: &#34;object&#34;,
    &#34;required&#34;: [&#34;name&#34;, &#34;email&#34;],
    &#34;properties&#34;: {
        &#34;name&#34;: {&#34;type&#34;: &#34;string&#34;, &#34;minLength&#34;: 1, &#34;maxLength&#34;: 100},
        &#34;email&#34;: {&#34;type&#34;: &#34;string&#34;, &#34;format&#34;: &#34;email&#34;},
        &#34;age&#34;: {&#34;type&#34;: &#34;integer&#34;, &#34;minimum&#34;: 0, &#34;maximum&#34;: 150}
    },
    &#34;additionalProperties&#34;: False  # 拒绝未知字段
}

def process_user_input(raw_json: str):
    # 1. 安全解析
    try:
        data = json.loads(raw_json)
    except json.JSONDecodeError:
        return {&#34;error&#34;: &#34;Invalid JSON&#34;}

    # 2. Schema 验证
    try:
        validate(instance=data, schema=schema)
    except Exception as e:
        return {&#34;error&#34;: f&#34;Validation failed: {e.message}&#34;}

    # 3. 业务逻辑
    return create_user(data)</code></pre>
<h2>5. 原型污染（JavaScript）</h2>
<pre><code class="language-javascript">// ❌ 恶意 JSON
const malicious = &#39;{&#34;__proto__&#34;: {&#34;isAdmin&#34;: true}}&#39;;
const obj = JSON.parse(malicious);

// JSON.parse 本身是安全的，不会污染原型
// 但手动合并对象时要小心：
function merge(target, source) {
  for (const key in source) {
    // ❌ 没有检查 __proto__
    target[key] = source[key];
  }
}

// ✓ 安全的合并
function safeMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (key === &#34;__proto__&#34; || key === &#34;constructor&#34; || key === &#34;prototype&#34;) {
      continue; // 跳过危险键
    }
    if (typeof source[key] === &#34;object&#34; &amp;&amp; source[key] !== null) {
      target[key] = target[key] || {};
      safeMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
}</code></pre>
<h2>6. 敏感数据处理</h2>
<pre><code class="language-javascript">// ❌ 密码、密钥等不应出现在 JSON 响应中
{
  &#34;user&#34;: &#34;alice&#34;,
  &#34;password&#34;: &#34;secret123&#34;,
  &#34;api_key&#34;: &#34;sk-xxx...&#34;
}

// ✓ 返回前过滤敏感字段
function sanitizeUser(user) {
  const { password, api_key, ...safe } = user;
  return safe;
}

// ✓ 使用 toJSON 控制序列化
class User {
  constructor(name, email, password) {
    this.name = name;
    this.email = email;
    this.password = password;
  }
  toJSON() {
    return { name: this.name, email: this.email };
    // password 不会被序列化
  }
}</code></pre>
<h2>7. 大小限制和超时</h2>
<pre><code class="language-javascript">// Express.js — 限制 JSON body 大小
app.use(express.json({ limit: &#34;1mb&#34; }));

// 设置解析超时
const controller = new AbortController();
const timeout = setTimeout(() =&gt; controller.abort(), 5000);

try {
  const data = JSON.parse(hugeString);
} finally {
  clearTimeout(timeout);
}</code></pre>
<h2>安全清单</h2>
<table>
<thead><tr><th>检查项</th><th>说明</th></tr></thead>
<tbody>
<tr><td>✓ 使用 <code>JSON.parse()</code></td><td>永远不要用 <code>eval()</code></td></tr>
<tr><td>✓ 验证输入</td><td>使用 JSON Schema 校验结构</td></tr>
<tr><td>✓ 限制大小</td><td>防止 DoS 攻击</td></tr>
<tr><td>✓ 转义 HTML</td><td>嵌入页面时防 XSS</td></tr>
<tr><td>✓ 过滤敏感数据</td><td>响应不包含密码、密钥</td></tr>
<tr><td>✓ 禁用危险特性</td><td>Java 不开 defaultTyping</td></tr>
<tr><td>✓ 防原型污染</td><td>合并对象时检查 <code>__proto__</code></td></tr>
<tr><td>✓ 设置超时</td><td>防止巨型 JSON 阻塞线程</td></tr>
</tbody>
</table>
<h2>小结</h2>
<ul>
<li>JSON 本身是安全的数据格式，风险来自解析和使用环节</li>
<li>绝对不要用 <code>eval()</code> 解析 JSON</li>
<li>嵌入 HTML 时要转义特殊字符防 XSS</li>
<li>始终用 JSON Schema 验证外部输入</li>
<li>注意语言特有的反序列化漏洞（Java Gadget Chain、原型污染等）</li>
<li>响应中过滤敏感字段，限制请求体大小</li>
</ul>
`,
en: `<h1>JSON Security Best Practices</h1>
<h2>Overview</h2>
<p>JSON itself is a pure data format with no executable code. But multiple security risks arise during <strong>parsing, transmission, and use</strong>.</p>
<h2>1. Never Use eval() to Parse JSON</h2>
<pre><code class="language-javascript">// ❌ Extremely dangerous
const data = eval("(" + jsonString + ")");

// ✅ Safe
const data = JSON.parse(jsonString);</code></pre>
<p><code>eval()</code> executes arbitrary JavaScript code. Always use <code>JSON.parse()</code> instead.</p>
<h2>2. XSS Protection</h2>
<pre><code class="language-javascript">// Server-side: escape special characters before embedding in HTML
function safeJsonForHtml(data) {
  return JSON.stringify(data)
    .replace(/&lt;/g, "\\u003c")
    .replace(/&gt;/g, "\\u003e")
    .replace(/&amp;/g, "\\u0026");
}</code></pre>
<pre><code class="language-html">&lt;!-- ✅ Best practice: use a data element --&gt;
&lt;script type="application/json" id="app-data"&gt;{{ safe_json }}&lt;/script&gt;
&lt;script&gt;
  const data = JSON.parse(document.getElementById("app-data").textContent);
&lt;/script&gt;</code></pre>
<h2>3. Deserialization Safety</h2>
<pre><code class="language-python">import yaml, json
# ❌ yaml.load can execute arbitrary Python code
data = yaml.load(untrusted_input)  # DANGEROUS!
# ✅ json.loads is safe
data = json.loads(untrusted_input)
# ✅ If you must use YAML, use safe_load
data = yaml.safe_load(untrusted_input)</code></pre>
<pre><code class="language-java">// ❌ Jackson with default typing — exploitable
ObjectMapper mapper = new ObjectMapper();
mapper.enableDefaultTyping(); // DANGEROUS!
// ✅ Never enable default typing unless strictly required</code></pre>
<h2>4. Input Validation</h2>
<pre><code class="language-python">from jsonschema import validate

schema = {
    "type": "object",
    "required": ["name", "email"],
    "properties": {
        "name":  {"type": "string", "minLength": 1, "maxLength": 100},
        "email": {"type": "string", "format": "email"}
    },
    "additionalProperties": False
}

def process_input(raw_json: str):
    data = json.loads(raw_json)
    validate(instance=data, schema=schema)
    return create_user(data)</code></pre>
<h2>5. Prototype Pollution (JavaScript)</h2>
<pre><code class="language-javascript">// ✅ Safe merge — skip dangerous keys
function safeMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (["__proto__", "constructor", "prototype"].includes(key)) continue;
    if (typeof source[key] === "object" &amp;&amp; source[key] !== null) {
      target[key] = target[key] || {};
      safeMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
}</code></pre>
<h2>6. Sensitive Data &amp; Size Limits</h2>
<pre><code class="language-javascript">// Filter sensitive fields before responding
function sanitizeUser(user) {
  const { password, api_key, ...safe } = user;
  return safe;
}
// Limit JSON body size
app.use(express.json({ limit: "1mb" }));</code></pre>
<h2>Security Checklist</h2>
<table>
<thead><tr><th>Check</th><th>Description</th></tr></thead>
<tbody>
<tr><td>✅ Use <code>JSON.parse()</code></td><td>Never use <code>eval()</code></td></tr>
<tr><td>✅ Validate input</td><td>Use JSON Schema to verify structure</td></tr>
<tr><td>✅ Limit body size</td><td>Prevent DoS attacks</td></tr>
<tr><td>✅ Escape HTML</td><td>Prevent XSS when embedding JSON</td></tr>
<tr><td>✅ Filter sensitive data</td><td>Responses must not contain passwords/keys</td></tr>
<tr><td>✅ Prevent prototype pollution</td><td>Check <code>__proto__</code> when merging objects</td></tr>
</tbody>
</table>
<h2>Summary</h2>
<ul>
<li>JSON is a safe data format — risks come from parsing and usage</li>
<li>Never use <code>eval()</code> to parse JSON</li>
<li>Escape special characters when embedding JSON in HTML to prevent XSS</li>
<li>Always validate external input with JSON Schema</li>
<li>Filter sensitive fields in responses and limit request body size</li>
</ul>
`
};

window.LEARN_ARTICLES["json-injection"] = {
zh: `<h1>JSON 注入攻击与防御</h1>
<h2>什么是 JSON 注入</h2>
<p>JSON 注入是指攻击者通过操纵 JSON 数据的结构或内容，改变应用程序的预期行为。虽然 JSON 本身不可执行，但如果应用程序不当处理 JSON 输入，可能导致权限绕过、数据泄露等严重后果。</p>
<h2>类型一：JSON 结构注入</h2>
<h3>字符串拼接构建 JSON</h3>
<pre><code class="language-python"># ❌ 极度危险：用字符串拼接构建 JSON
username = request.form[&#34;username&#34;]
json_str = &#39;{&#34;username&#34;: &#34;&#39; + username + &#39;&#34;, &#34;role&#34;: &#34;user&#34;}&#39;</code></pre>
<p>如果攻击者提交：</p>
<pre><code>username = alice&#34;, &#34;role&#34;: &#34;admin&#34;, &#34;x&#34;: &#34;</code></pre>
<p>拼接后得到：</p>
<pre><code class="language-json">{&#34;username&#34;: &#34;alice&#34;, &#34;role&#34;: &#34;admin&#34;, &#34;x&#34;: &#34;&#34;, &#34;role&#34;: &#34;user&#34;}</code></pre>
<p>许多 JSON 解析器对重复键取最后一个值，但有些取第一个。攻击者可能借此提升权限。</p>
<h3>防御</h3>
<pre><code class="language-python">import json

# ✓ 始终使用 JSON 库构建 JSON
data = {
    &#34;username&#34;: request.form[&#34;username&#34;],  # 自动处理转义
    &#34;role&#34;: &#34;user&#34;
}
json_str = json.dumps(data)</code></pre>
<h2>类型二：NoSQL 注入</h2>
<p>MongoDB 等 NoSQL 数据库使用 JSON/BSON 查询，存在类似 SQL 注入的风险：</p>
<h3>攻击示例</h3>
<pre><code class="language-javascript">// ❌ 直接将用户输入用于查询
app.post(&#34;/login&#34;, async (req, res) =&gt; {
  const user = await db.collection(&#34;users&#34;).findOne({
    username: req.body.username,
    password: req.body.password
  });
});</code></pre>
<p>攻击者发送：</p>
<pre><code class="language-json">{
  &#34;username&#34;: &#34;admin&#34;,
  &#34;password&#34;: { &#34;$ne&#34;: &#34;&#34; }
}</code></pre>
<p><code>$ne</code>（不等于空字符串）使密码条件永远为真，绕过认证。</p>
<p>更多危险的 MongoDB 操作符：</p>
<pre><code class="language-json">{ &#34;$gt&#34;: &#34;&#34; }       // 大于空字符串 → 几乎任何非空值都匹配
{ &#34;$regex&#34;: &#34;.*&#34; }  // 正则匹配任何值
{ &#34;$exists&#34;: true } // 只要字段存在就匹配</code></pre>
<h3>防御</h3>
<pre><code class="language-javascript">// ✓ 方案一：类型检查
app.post(&#34;/login&#34;, async (req, res) =&gt; {
  const { username, password } = req.body;

  // 确保输入是字符串
  if (typeof username !== &#34;string&#34; || typeof password !== &#34;string&#34;) {
    return res.status(400).json({ error: &#34;Invalid input type&#34; });
  }

  const user = await db.collection(&#34;users&#34;).findOne({
    username: username,
    password: hashPassword(password) // 当然也要 hash 密码
  });
});

// ✓ 方案二：使用 JSON Schema 验证
const loginSchema = {
  type: &#34;object&#34;,
  required: [&#34;username&#34;, &#34;password&#34;],
  properties: {
    username: { type: &#34;string&#34;, minLength: 1, maxLength: 50 },
    password: { type: &#34;string&#34;, minLength: 8 }
  },
  additionalProperties: false
};

// ✓ 方案三：使用 mongo-sanitize
const sanitize = require(&#34;mongo-sanitize&#34;);
const cleanUsername = sanitize(req.body.username); // 移除 $ 开头的键</code></pre>
<h2>类型三：服务端模板注入</h2>
<p>某些模板引擎在渲染 JSON 时存在风险：</p>
<pre><code class="language-python"># ❌ Jinja2 中直接渲染未转义的 JSON
return render_template(&#34;page.html&#34;, config=json.dumps(user_config))</code></pre>
<pre><code class="language-html">&lt;!-- ❌ 如果 config 包含 &lt;/script&gt;，可能导致 XSS --&gt;
&lt;script&gt;var config = {{ config | safe }};&lt;/script&gt;</code></pre>
<h3>防御</h3>
<pre><code class="language-python"># ✓ 使用 tojson 过滤器（Jinja2 内置，自动转义）
&lt;script&gt;var config = {{ user_config | tojson }};&lt;/script&gt;</code></pre>
<h2>类型四：JSON 劫持（历史漏洞）</h2>
<p>早期浏览器存在 JSON 劫持漏洞，攻击者可以通过重写 <code>Array</code> 构造函数窃取跨域 JSON 数据。</p>
<pre><code class="language-javascript">// 历史攻击方式（现代浏览器已修复）
&lt;script&gt;
Array = function() { /* 窃取数据 */ };
&lt;/script&gt;
&lt;script src=&#34;https://victim.com/api/user/data&#34;&gt;&lt;/script&gt;</code></pre>
<p>现代防御措施（仍建议保留）：</p>
<pre><code class="language-javascript">// API 响应前加入不可解析前缀
)]}&#39;,\\n
{&#34;username&#34;: &#34;alice&#34;, &#34;email&#34;: &#34;alice@example.com&#34;}</code></pre>
<pre><code class="language-javascript">// 或者始终返回 JSON 对象而非数组
// ❌ 响应顶层是数组
[{&#34;id&#34;:1},{&#34;id&#34;:2}]

// ✓ 响应顶层是对象
{&#34;data&#34;: [{&#34;id&#34;:1},{&#34;id&#34;:2}]}</code></pre>
<h2>防御清单</h2>
<table>
<thead><tr><th>措施</th><th>说明</th></tr></thead>
<tbody>
<tr><td>不要字符串拼接 JSON</td><td>始终使用 JSON 序列化库</td></tr>
<tr><td>验证输入类型</td><td>检查字段类型是否符合预期</td></tr>
<tr><td>使用 JSON Schema</td><td>严格验证请求体结构</td></tr>
<tr><td>过滤 MongoDB 操作符</td><td>移除 <code>$</code> 开头的键</td></tr>
<tr><td>转义 HTML 嵌入</td><td>使用模板引擎的安全过滤器</td></tr>
<tr><td>限制请求大小</td><td>防止超大 JSON 导致 DoS</td></tr>
<tr><td>API 返回对象</td><td>顶层用对象而非数组</td></tr>
<tr><td>添加安全响应头</td><td><code>Content-Type: application/json</code></td></tr>
</tbody>
</table>
<h2>小结</h2>
<ul>
<li>JSON 注入是通过操纵 JSON 结构来改变程序行为的攻击</li>
<li>永远不要用字符串拼接构建 JSON，使用序列化库</li>
<li>NoSQL 注入是 JSON 注入最常见的形式，必须验证输入类型</li>
<li>模板渲染 JSON 时使用安全的转义过滤器</li>
<li>多层防御：类型检查 + Schema 验证 + 参数过滤</li>
</ul>
`,
en: `<h1>JSON Injection Attacks: Principles &amp; Defense</h1>
<h2>What is JSON Injection?</h2>
<p>JSON injection occurs when an attacker manipulates JSON data structure or content to change application behavior. Though JSON itself is not executable, improper handling can lead to privilege escalation and data leakage.</p>
<h2>Type 1: JSON Structure Injection</h2>
<pre><code class="language-python"># ❌ Extremely dangerous: building JSON with string concatenation
username = request.form["username"]
json_str = '{"username": "' + username + '", "role": "user"}'
# Attack: alice", "role": "admin", "x": "
# Result: {"username":"alice","role":"admin","x":"","role":"user"}</code></pre>
<pre><code class="language-python"># ✅ Always use a JSON library
import json
data = {"username": request.form["username"], "role": "user"}
json_str = json.dumps(data)  # Escaping handled automatically</code></pre>
<h2>Type 2: NoSQL Injection</h2>
<pre><code class="language-javascript">// ❌ Direct user input in MongoDB query
const user = await db.collection("users").findOne({
  username: req.body.username,
  password: req.body.password  // Attacker sends {"$ne": ""}
});</code></pre>
<pre><code class="language-json">// Attack payload:
{"username": "admin", "password": {"$ne": ""}}</code></pre>
<pre><code class="language-javascript">// ✅ Type checking
if (typeof username !== "string" || typeof password !== "string") {
  return res.status(400).json({ error: "Invalid input type" });
}
// ✅ mongo-sanitize removes $ prefix keys
const sanitize = require("mongo-sanitize");
const clean = sanitize(req.body);</code></pre>
<h2>Type 3: Template Injection</h2>
<pre><code class="language-html">&lt;!-- ❌ Unsafe — if config contains &lt;/script&gt;, causes XSS --&gt;
&lt;script&gt;var config = {{ config | safe }};&lt;/script&gt;
&lt;!-- ✅ Use Jinja2 tojson filter (auto-escapes) --&gt;
&lt;script&gt;var config = {{ user_config | tojson }};&lt;/script&gt;</code></pre>
<h2>Type 4: Top-Level Array (JSON Hijacking)</h2>
<pre><code class="language-javascript">// ✅ Always return an object at root level, not an array
// ❌ [{"id":1},{"id":2}]
// ✅ {"data": [{"id":1},{"id":2}]}</code></pre>
<h2>Defense Checklist</h2>
<table>
<thead><tr><th>Measure</th><th>Description</th></tr></thead>
<tbody>
<tr><td>No string-concatenated JSON</td><td>Always use serialization libraries</td></tr>
<tr><td>Validate input types</td><td>Ensure fields match expected types</td></tr>
<tr><td>Use JSON Schema</td><td>Strictly validate request body structure</td></tr>
<tr><td>Filter MongoDB operators</td><td>Remove keys starting with <code>$</code></td></tr>
<tr><td>Escape HTML embedding</td><td>Use template engine safety filters</td></tr>
<tr><td>Limit request size</td><td>Prevent oversized JSON causing DoS</td></tr>
</tbody>
</table>
<h2>Summary</h2>
<ul>
<li>Never build JSON with string concatenation — use serialization libraries</li>
<li>NoSQL injection is the most common form — always validate input types</li>
<li>Use template engine safety filters when rendering JSON in HTML</li>
<li>Multi-layered defense: type checking + Schema validation + operator filtering</li>
</ul>
`
};

window.LEARN_ARTICLES["json-performance"] = {
zh: `<h1>JSON 性能优化指南</h1>
<h2>JSON 性能为什么重要</h2>
<p>在高并发的 Web 应用中，JSON 的序列化（编码）和反序列化（解码）可能占 CPU 时间的 10-30%。优化 JSON 处理可以显著降低延迟和资源消耗。</p>
<h2>优化策略一：选择高性能库</h2>
<p>各语言的 JSON 库性能差异巨大。标准库往往不是最快的选择。</p>
<h3>JavaScript / Node.js</h3>
<pre><code class="language-javascript">// 标准 JSON.parse 已经很快（V8 引擎优化）
// 如果需要更快，可以用 simdjson
const simdjson = require(&#34;simdjson&#34;);
const parsed = simdjson.parse(jsonBuffer); // 比 JSON.parse 快 2-3x</code></pre>
<h3>Python</h3>
<pre><code class="language-python">import json
# 标准库 json 模块（纯 Python + C 加速）

import orjson
# orjson：最快的 Python JSON 库（Rust 实现）
data = orjson.loads(json_bytes)
output = orjson.dumps(data)  # 返回 bytes

import ujson
# ujson：比标准库快 2-3x（C 实现）
data = ujson.loads(json_str)

# 性能对比（解析 1MB JSON）
# json.loads:   ~45ms
# ujson.loads:  ~18ms
# orjson.loads: ~8ms</code></pre>
<h3>Go</h3>
<pre><code class="language-go">import (
    &#34;encoding/json&#34;     // 标准库
    jsoniter &#34;github.com/json-iterator/go&#34;  // 兼容标准库，快 3-5x
    &#34;github.com/bytedance/sonic&#34;            // 字节跳动，使用 SIMD，快 5-10x
)

// jsoniter 完全兼容标准库 API
var jsonApi = jsoniter.ConfigCompatibleWithStandardLibrary
data, err := jsonApi.Marshal(obj)

// sonic（需要 amd64）
import &#34;github.com/bytedance/sonic&#34;
data, err := sonic.Marshal(obj)</code></pre>
<h3>Java</h3>
<pre><code class="language-java">// Jackson（标准选择）
ObjectMapper mapper = new ObjectMapper();

// DSL-JSON（编译时代码生成，更快）
// 需要注解处理器

// Jackson 优化配置
ObjectMapper mapper = new ObjectMapper();
mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL); // 不序列化 null</code></pre>
<h2>优化策略二：减少 JSON 大小</h2>
<p>传输的 JSON 越小，网络延迟越低，解析速度越快。</p>
<h3>缩短字段名</h3>
<pre><code class="language-json">// ❌ 长字段名
{
  &#34;customer_first_name&#34;: &#34;Alice&#34;,
  &#34;customer_last_name&#34;: &#34;Chen&#34;,
  &#34;customer_email_address&#34;: &#34;alice@example.com&#34;
}

// ✓ 缩短字段名（配合文档说明）
{
  &#34;fn&#34;: &#34;Alice&#34;,
  &#34;ln&#34;: &#34;Chen&#34;,
  &#34;email&#34;: &#34;alice@example.com&#34;
}</code></pre>
<blockquote><p>高频 API（每秒数万请求）场景适用。内部 API 优先考虑可读性。</p></blockquote>
<h3>去除 null 和默认值</h3>
<pre><code class="language-python">import orjson

# orjson 自动跳过 None
data = {&#34;name&#34;: &#34;Alice&#34;, &#34;age&#34;: None, &#34;city&#34;: None}
result = orjson.dumps(data, option=orjson.OPT_NON_STR_KEYS)

# 手动过滤
def compact(d):
    return {k: v for k, v in d.items() if v is not None}</code></pre>
<pre><code class="language-javascript">// JavaScript
JSON.stringify(data, (key, value) =&gt; value === null ? undefined : value);</code></pre>
<h3>分页而非全量</h3>
<pre><code class="language-json">// ❌ 返回所有 10000 条记录
{ &#34;users&#34;: [ ... 10000 items ... ] }

// ✓ 分页
{
  &#34;users&#34;: [ ... 20 items ... ],
  &#34;pagination&#34;: { &#34;page&#34;: 1, &#34;pageSize&#34;: 20, &#34;total&#34;: 10000 }
}</code></pre>
<h2>优化策略三：流式处理</h2>
<p>大 JSON 不要一次性加载到内存：</p>
<h3>Python — ijson</h3>
<pre><code class="language-python">import ijson

# 流式解析 GB 级 JSON 文件
with open(&#34;huge_data.json&#34;, &#34;rb&#34;) as f:
    for item in ijson.items(f, &#34;results.item&#34;):
        process(item)  # 逐条处理，内存使用恒定</code></pre>
<h3>Node.js — stream-json</h3>
<pre><code class="language-javascript">const { parser } = require(&#34;stream-json&#34;);
const { streamArray } = require(&#34;stream-json/streamers/StreamArray&#34;);
const fs = require(&#34;fs&#34;);

fs.createReadStream(&#34;huge.json&#34;)
  .pipe(parser())
  .pipe(streamArray())
  .on(&#34;data&#34;, ({ value }) =&gt; {
    process(value);
  });</code></pre>
<h3>Go</h3>
<pre><code class="language-go">decoder := json.NewDecoder(file)
// 跳过数组开始的 [
decoder.Token()
for decoder.More() {
    var item Item
    decoder.Decode(&amp;item)
    process(item)
}</code></pre>
<h2>优化策略四：序列化优化</h2>
<h3>预编译 Schema（Go）</h3>
<pre><code class="language-go">// jsoniter 的 Schema 缓存
type User struct {
    Name  string \`json:&#34;name&#34;\`
    Email string \`json:&#34;email&#34;\`
}
// jsoniter 会自动缓存反射信息，首次慢，后续快</code></pre>
<h3>避免重复序列化</h3>
<pre><code class="language-python">import functools
import json

# 缓存不变的 JSON
@functools.lru_cache(maxsize=128)
def get_config_json():
    return json.dumps(load_config())</code></pre>
<h3>使用 Buffer Pool</h3>
<pre><code class="language-go">import (
    &#34;bytes&#34;
    &#34;sync&#34;
)

var bufPool = sync.Pool{
    New: func() interface{} { return new(bytes.Buffer) },
}

func marshalToBuffer(v interface{}) []byte {
    buf := bufPool.Get().(*bytes.Buffer)
    defer func() {
        buf.Reset()
        bufPool.Put(buf)
    }()
    encoder := json.NewEncoder(buf)
    encoder.Encode(v)
    return buf.Bytes()
}</code></pre>
<h2>优化策略五：考虑替代格式</h2>
<p>当 JSON 性能不满足需求时，可以考虑二进制格式：</p>
<table>
<thead><tr><th>格式</th><th>大小</th><th>解析速度</th><th>人类可读</th><th>Schema</th></tr></thead>
<tbody>
<tr><td>JSON</td><td>大</td><td>中</td><td>✓</td><td>可选</td></tr>
<tr><td>MessagePack</td><td>小 30%</td><td>快 2x</td><td>✗</td><td>可选</td></tr>
<tr><td>Protocol Buffers</td><td>小 50%</td><td>快 5-10x</td><td>✗</td><td>必须</td></tr>
<tr><td>FlatBuffers</td><td>小 50%</td><td>极快（零拷贝）</td><td>✗</td><td>必须</td></tr>
</tbody>
</table>
<blockquote><p>建议：外部 API 用 JSON（通用性），内部高频服务间通信考虑 Protobuf/MessagePack。</p></blockquote>
<h2>性能测试建议</h2>
<pre><code class="language-python">import time
import json
import orjson

data = generate_test_data(10000)  # 生成测试数据

# 基准测试
def benchmark(name, func, iterations=100):
    start = time.perf_counter()
    for _ in range(iterations):
        func()
    elapsed = (time.perf_counter() - start) / iterations * 1000
    print(f&#34;{name}: {elapsed:.2f}ms&#34;)

json_str = json.dumps(data)

benchmark(&#34;json.dumps&#34;, lambda: json.dumps(data))
benchmark(&#34;orjson.dumps&#34;, lambda: orjson.dumps(data))
benchmark(&#34;json.loads&#34;, lambda: json.loads(json_str))
benchmark(&#34;orjson.loads&#34;, lambda: orjson.loads(json_str))</code></pre>
<h2>小结</h2>
<ul>
<li>选择高性能 JSON 库（orjson/ujson/sonic/simdjson）可获得 2-10x 提升</li>
<li>减少 JSON 大小：缩短字段名、去除 null、分页</li>
<li>大文件使用流式解析，避免一次性加载到内存</li>
<li>缓存不变的 JSON 结果，使用 Buffer Pool 减少内存分配</li>
<li>内部高频通信考虑 Protobuf / MessagePack 替代 JSON</li>
</ul>
`,
en: `<h1>Large JSON Performance Optimization Guide</h1>
<h2>Why JSON Performance Matters</h2>
<p>In high-concurrency web applications, JSON serialization and deserialization can account for 10–30% of CPU time. The right library and technique choices yield dramatic improvements.</p>
<h2>Strategy 1: Choose a High-Performance Library</h2>
<h3>Python</h3>
<pre><code class="language-python">import orjson  # Rust implementation — fastest Python JSON library
data = orjson.loads(json_bytes)
output = orjson.dumps(data)  # Returns bytes

# Performance comparison (parsing 1MB JSON):
# json.loads:   ~45ms
# ujson.loads:  ~18ms
# orjson.loads: ~8ms</code></pre>
<h3>Go</h3>
<pre><code class="language-go">import (
    jsoniter "github.com/json-iterator/go"  // 100% compatible, 3-5x faster
    "github.com/bytedance/sonic"            // SIMD acceleration, 5-10x faster
)
var jsonApi = jsoniter.ConfigCompatibleWithStandardLibrary
data, err := jsonApi.Marshal(obj)</code></pre>
<h3>Java</h3>
<pre><code class="language-java">// Optimized Jackson configuration
ObjectMapper mapper = new ObjectMapper();
mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);</code></pre>
<h2>Strategy 2: Reduce JSON Size</h2>
<pre><code class="language-javascript">// Filter null values
JSON.stringify(data, (k, v) =&gt; v === null ? undefined : v);
// Paginate instead of returning all records
{ "users": [...20 items...], "pagination": { "page": 1, "total": 10000 } }</code></pre>
<h2>Strategy 3: Streaming for Large Files</h2>
<pre><code class="language-python">import ijson
with open("huge.json", "rb") as f:
    for item in ijson.items(f, "results.item"):
        process(item)  # Constant memory usage</code></pre>
<pre><code class="language-javascript">const { parser } = require("stream-json");
const { streamArray } = require("stream-json/streamers/StreamArray");
fs.createReadStream("huge.json")
  .pipe(parser()).pipe(streamArray())
  .on("data", ({ value }) =&gt; process(value));</code></pre>
<h2>Strategy 4: Cache Immutable JSON</h2>
<pre><code class="language-python">import functools, json

@functools.lru_cache(maxsize=128)
def get_config_json():
    return json.dumps(load_config())</code></pre>
<h2>Strategy 5: Binary Alternatives</h2>
<table>
<thead><tr><th>Format</th><th>Size</th><th>Parse Speed</th><th>Human-Readable</th></tr></thead>
<tbody>
<tr><td>JSON</td><td>Baseline</td><td>Medium</td><td>✅</td></tr>
<tr><td>MessagePack</td><td>-30%</td><td>2x faster</td><td>❌</td></tr>
<tr><td>Protocol Buffers</td><td>-50%</td><td>5-10x faster</td><td>❌</td></tr>
<tr><td>FlatBuffers</td><td>-50%</td><td>Zero-copy</td><td>❌</td></tr>
</tbody>
</table>
<h2>Summary</h2>
<ul>
<li>Choose a high-performance library (orjson/ujson/sonic/simdjson) for 2–10x improvement</li>
<li>Reduce JSON size: remove nulls, paginate, shorten field names</li>
<li>Use streaming for large files to avoid loading everything into memory</li>
<li>Consider Protobuf/MessagePack for internal high-frequency service communication</li>
</ul>
`
};


window.LEARN_ARTICLES["json-streaming"] = {
zh: `<h1>JSON 流式处理：大数据的实时传输</h1>
<h2>什么是 JSON 流式处理</h2>
<p>传统的 JSON API 必须等所有数据准备好后才能返回完整的 JSON 响应。流式处理则允许 <strong>边产生、边传输、边消费</strong> JSON 数据。</p>
<p>典型场景：</p>
<ul>
<li>ChatGPT 的逐字输出（SSE + JSON）</li>
<li>实时日志推送</li>
<li>大型数据集的导出</li>
<li>数据库查询结果的流式返回</li>
</ul>
<h2>Server-Sent Events (SSE)</h2>
<p>SSE 是最简单的服务端推送技术，基于 HTTP 长连接：</p>
<h3>服务端（Node.js）</h3>
<pre><code class="language-javascript">const express = require(&#34;express&#34;);
const app = express();

app.get(&#34;/stream&#34;, (req, res) =&gt; {
  res.setHeader(&#34;Content-Type&#34;, &#34;text/event-stream&#34;);
  res.setHeader(&#34;Cache-Control&#34;, &#34;no-cache&#34;);
  res.setHeader(&#34;Connection&#34;, &#34;keep-alive&#34;);

  let count = 0;
  const interval = setInterval(() =&gt; {
    count++;
    const data = JSON.stringify({
      id: count,
      message: \`Event \${count}\`,
      timestamp: new Date().toISOString()
    });
    res.write(\`data: \${data}\\n\\n\`);

    if (count &gt;= 10) {
      clearInterval(interval);
      res.write(&#34;data: [DONE]\\n\\n&#34;);
      res.end();
    }
  }, 500);

  req.on(&#34;close&#34;, () =&gt; clearInterval(interval));
});</code></pre>
<h3>服务端（Python / FastAPI）</h3>
<pre><code class="language-python">from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import json
import asyncio

app = FastAPI()

async def event_generator():
    for i in range(10):
        data = json.dumps({&#34;id&#34;: i, &#34;message&#34;: f&#34;Event {i}&#34;})
        yield f&#34;data: {data}\\n\\n&#34;
        await asyncio.sleep(0.5)
    yield &#34;data: [DONE]\\n\\n&#34;

@app.get(&#34;/stream&#34;)
async def stream():
    return StreamingResponse(
        event_generator(),
        media_type=&#34;text/event-stream&#34;
    )</code></pre>
<h3>客户端</h3>
<pre><code class="language-javascript">const evtSource = new EventSource(&#34;/stream&#34;);

evtSource.onmessage = (event) =&gt; {
  if (event.data === &#34;[DONE]&#34;) {
    evtSource.close();
    return;
  }
  const data = JSON.parse(event.data);
  console.log(data.message);
};

evtSource.onerror = () =&gt; {
  evtSource.close();
};</code></pre>
<h2>类 ChatGPT 流式输出</h2>
<p>ChatGPT API 使用 SSE 传输 JSON 数据块：</p>
<pre><code class="language-javascript">async function streamChat(prompt) {
  const response = await fetch(&#34;/api/chat&#34;, {
    method: &#34;POST&#34;,
    headers: { &#34;Content-Type&#34;: &#34;application/json&#34; },
    body: JSON.stringify({ prompt, stream: true })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = &#34;&#34;;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(&#34;\\n&#34;);
    buffer = lines.pop(); // 保留不完整的行

    for (const line of lines) {
      if (line.startsWith(&#34;data: &#34;)) {
        const data = line.slice(6);
        if (data === &#34;[DONE]&#34;) return;
        try {
          const chunk = JSON.parse(data);
          process.stdout.write(chunk.content || &#34;&#34;);
        } catch (e) {
          // 跳过无效行
        }
      }
    }
  }
}</code></pre>
<h2>NDJSON 流式传输</h2>
<p>NDJSON 天然适合流式处理：</p>
<pre><code class="language-javascript">// 服务端
app.get(&#34;/export&#34;, async (req, res) =&gt; {
  res.setHeader(&#34;Content-Type&#34;, &#34;application/x-ndjson&#34;);

  const cursor = db.collection(&#34;users&#34;).find().cursor();
  for await (const doc of cursor) {
    res.write(JSON.stringify(doc) + &#34;\\n&#34;);
  }
  res.end();
});

// 客户端
async function consumeNDJSON(url) {
  const response = await fetch(url);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = &#34;&#34;;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(&#34;\\n&#34;);
    buffer = lines.pop();

    for (const line of lines) {
      if (line.trim()) {
        const record = JSON.parse(line);
        processRecord(record);
      }
    }
  }
}</code></pre>
<h2>Go 流式编码</h2>
<pre><code class="language-go">func streamHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set(&#34;Content-Type&#34;, &#34;application/x-ndjson&#34;)
    flusher, _ := w.(http.Flusher)
    encoder := json.NewEncoder(w)

    rows, _ := db.Query(&#34;SELECT id, name, email FROM users&#34;)
    defer rows.Close()

    for rows.Next() {
        var user User
        rows.Scan(&amp;user.ID, &amp;user.Name, &amp;user.Email)
        encoder.Encode(user)  // 自动追加 \\n
        flusher.Flush()       // 立即发送
    }
}</code></pre>
<h2>WebSocket + JSON</h2>
<p>双向实时通信场景（聊天、游戏、协作编辑）：</p>
<pre><code class="language-javascript">// 服务端 (ws 库)
const WebSocket = require(&#34;ws&#34;);
const wss = new WebSocket.Server({ port: 8080 });

wss.on(&#34;connection&#34;, (ws) =&gt; {
  ws.on(&#34;message&#34;, (raw) =&gt; {
    const msg = JSON.parse(raw);
    // 广播给所有客户端
    wss.clients.forEach((client) =&gt; {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          user: msg.user,
          text: msg.text,
          ts: Date.now()
        }));
      }
    });
  });
});

// 客户端
const ws = new WebSocket(&#34;ws://localhost:8080&#34;);
ws.onmessage = (event) =&gt; {
  const data = JSON.parse(event.data);
  appendMessage(data);
};
ws.send(JSON.stringify({ user: &#34;Alice&#34;, text: &#34;Hello!&#34; }));</code></pre>
<h2>技术选型</h2>
<table>
<thead><tr><th>技术</th><th>方向</th><th>协议</th><th>适用场景</th></tr></thead>
<tbody>
<tr><td>SSE</td><td>服务端→客户端</td><td>HTTP</td><td>通知、实时更新、AI 流式输出</td></tr>
<tr><td>WebSocket</td><td>双向</td><td>WS</td><td>聊天、游戏、协作</td></tr>
<tr><td>NDJSON</td><td>服务端→客户端</td><td>HTTP</td><td>数据导出、日志流</td></tr>
<tr><td>gRPC Streaming</td><td>双向</td><td>HTTP/2</td><td>微服务间高性能通信</td></tr>
</tbody>
</table>
<h2>小结</h2>
<ul>
<li>流式 JSON 处理允许边产生边消费，降低延迟和内存使用</li>
<li>SSE 适合服务端单向推送（如 ChatGPT 流式输出）</li>
<li>NDJSON 是流式传输 JSON 记录的理想格式</li>
<li>WebSocket 适合双向实时通信</li>
<li>客户端需要处理不完整的数据块，维护缓冲区</li>
</ul>
`,
en: `<h1>JSON 流式处理：大数据的实时传输</h1>
<h2>什么是 JSON 流式处理</h2>
<p>传统的 JSON API 必须等所有数据准备好后才能返回完整的 JSON 响应。流式处理则允许 <strong>边产生、边传输、边消费</strong> JSON 数据。</p>
<p>典型场景：</p>
<ul>
<li>ChatGPT 的逐字输出（SSE + JSON）</li>
<li>实时日志推送</li>
<li>大型数据集的导出</li>
<li>数据库查询结果的流式返回</li>
</ul>
<h2>Server-Sent Events (SSE)</h2>
<p>SSE 是最简单的服务端推送技术，基于 HTTP 长连接：</p>
<h3>服务端（Node.js）</h3>
<pre><code class="language-javascript">const express = require(&#34;express&#34;);
const app = express();

app.get(&#34;/stream&#34;, (req, res) =&gt; {
  res.setHeader(&#34;Content-Type&#34;, &#34;text/event-stream&#34;);
  res.setHeader(&#34;Cache-Control&#34;, &#34;no-cache&#34;);
  res.setHeader(&#34;Connection&#34;, &#34;keep-alive&#34;);

  let count = 0;
  const interval = setInterval(() =&gt; {
    count++;
    const data = JSON.stringify({
      id: count,
      message: \`Event \${count}\`,
      timestamp: new Date().toISOString()
    });
    res.write(\`data: \${data}\\n\\n\`);

    if (count &gt;= 10) {
      clearInterval(interval);
      res.write(&#34;data: [DONE]\\n\\n&#34;);
      res.end();
    }
  }, 500);

  req.on(&#34;close&#34;, () =&gt; clearInterval(interval));
});</code></pre>
<h3>服务端（Python / FastAPI）</h3>
<pre><code class="language-python">from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import json
import asyncio

app = FastAPI()

async def event_generator():
    for i in range(10):
        data = json.dumps({&#34;id&#34;: i, &#34;message&#34;: f&#34;Event {i}&#34;})
        yield f&#34;data: {data}\\n\\n&#34;
        await asyncio.sleep(0.5)
    yield &#34;data: [DONE]\\n\\n&#34;

@app.get(&#34;/stream&#34;)
async def stream():
    return StreamingResponse(
        event_generator(),
        media_type=&#34;text/event-stream&#34;
    )</code></pre>
<h3>客户端</h3>
<pre><code class="language-javascript">const evtSource = new EventSource(&#34;/stream&#34;);

evtSource.onmessage = (event) =&gt; {
  if (event.data === &#34;[DONE]&#34;) {
    evtSource.close();
    return;
  }
  const data = JSON.parse(event.data);
  console.log(data.message);
};

evtSource.onerror = () =&gt; {
  evtSource.close();
};</code></pre>
<h2>类 ChatGPT 流式输出</h2>
<p>ChatGPT API 使用 SSE 传输 JSON 数据块：</p>
<pre><code class="language-javascript">async function streamChat(prompt) {
  const response = await fetch(&#34;/api/chat&#34;, {
    method: &#34;POST&#34;,
    headers: { &#34;Content-Type&#34;: &#34;application/json&#34; },
    body: JSON.stringify({ prompt, stream: true })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = &#34;&#34;;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(&#34;\\n&#34;);
    buffer = lines.pop(); // 保留不完整的行

    for (const line of lines) {
      if (line.startsWith(&#34;data: &#34;)) {
        const data = line.slice(6);
        if (data === &#34;[DONE]&#34;) return;
        try {
          const chunk = JSON.parse(data);
          process.stdout.write(chunk.content || &#34;&#34;);
        } catch (e) {
          // 跳过无效行
        }
      }
    }
  }
}</code></pre>
<h2>NDJSON 流式传输</h2>
<p>NDJSON 天然适合流式处理：</p>
<pre><code class="language-javascript">// 服务端
app.get(&#34;/export&#34;, async (req, res) =&gt; {
  res.setHeader(&#34;Content-Type&#34;, &#34;application/x-ndjson&#34;);

  const cursor = db.collection(&#34;users&#34;).find().cursor();
  for await (const doc of cursor) {
    res.write(JSON.stringify(doc) + &#34;\\n&#34;);
  }
  res.end();
});

// 客户端
async function consumeNDJSON(url) {
  const response = await fetch(url);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = &#34;&#34;;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(&#34;\\n&#34;);
    buffer = lines.pop();

    for (const line of lines) {
      if (line.trim()) {
        const record = JSON.parse(line);
        processRecord(record);
      }
    }
  }
}</code></pre>
<h2>Go 流式编码</h2>
<pre><code class="language-go">func streamHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set(&#34;Content-Type&#34;, &#34;application/x-ndjson&#34;)
    flusher, _ := w.(http.Flusher)
    encoder := json.NewEncoder(w)

    rows, _ := db.Query(&#34;SELECT id, name, email FROM users&#34;)
    defer rows.Close()

    for rows.Next() {
        var user User
        rows.Scan(&amp;user.ID, &amp;user.Name, &amp;user.Email)
        encoder.Encode(user)  // 自动追加 \\n
        flusher.Flush()       // 立即发送
    }
}</code></pre>
<h2>WebSocket + JSON</h2>
<p>双向实时通信场景（聊天、游戏、协作编辑）：</p>
<pre><code class="language-javascript">// 服务端 (ws 库)
const WebSocket = require(&#34;ws&#34;);
const wss = new WebSocket.Server({ port: 8080 });

wss.on(&#34;connection&#34;, (ws) =&gt; {
  ws.on(&#34;message&#34;, (raw) =&gt; {
    const msg = JSON.parse(raw);
    // 广播给所有客户端
    wss.clients.forEach((client) =&gt; {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          user: msg.user,
          text: msg.text,
          ts: Date.now()
        }));
      }
    });
  });
});

// 客户端
const ws = new WebSocket(&#34;ws://localhost:8080&#34;);
ws.onmessage = (event) =&gt; {
  const data = JSON.parse(event.data);
  appendMessage(data);
};
ws.send(JSON.stringify({ user: &#34;Alice&#34;, text: &#34;Hello!&#34; }));</code></pre>
<h2>技术选型</h2>
<table>
<thead><tr><th>技术</th><th>方向</th><th>协议</th><th>适用场景</th></tr></thead>
<tbody>
<tr><td>SSE</td><td>服务端→客户端</td><td>HTTP</td><td>通知、实时更新、AI 流式输出</td></tr>
<tr><td>WebSocket</td><td>双向</td><td>WS</td><td>聊天、游戏、协作</td></tr>
<tr><td>NDJSON</td><td>服务端→客户端</td><td>HTTP</td><td>数据导出、日志流</td></tr>
<tr><td>gRPC Streaming</td><td>双向</td><td>HTTP/2</td><td>微服务间高性能通信</td></tr>
</tbody>
</table>
<h2>小结</h2>
<ul>
<li>流式 JSON 处理允许边产生边消费，降低延迟和内存使用</li>
<li>SSE 适合服务端单向推送（如 ChatGPT 流式输出）</li>
<li>NDJSON 是流式传输 JSON 记录的理想格式</li>
<li>WebSocket 适合双向实时通信</li>
<li>客户端需要处理不完整的数据块，维护缓冲区</li>
</ul>
`
};

window.LEARN_ARTICLES["json-compression"] = {
zh: `<h1>JSON 压缩与传输优化</h1>
<h2>为什么需要压缩 JSON</h2>
<p>JSON 是文本格式，有大量冗余（重复的键名、空白、结构字符）。一个 1MB 的 JSON API 响应，经 Gzip 压缩后通常只有 100-200KB。压缩是最低成本、最高回报的优化手段。</p>
<h2>HTTP 压缩</h2>
<h3>服务端配置</h3>
<h4>Nginx</h4>
<pre><code class="language-nginx">http {
    gzip on;
    gzip_types application/json text/plain application/javascript;
    gzip_min_length 1024;     # 小于 1KB 不压缩
    gzip_comp_level 6;        # 压缩级别 1-9
    gzip_vary on;

    # Brotli（需要模块）
    brotli on;
    brotli_types application/json text/plain;
    brotli_comp_level 6;
}</code></pre>
<h4>Express.js</h4>
<pre><code class="language-javascript">const compression = require(&#34;compression&#34;);
const express = require(&#34;express&#34;);
const app = express();

app.use(compression({
  filter: (req, res) =&gt; {
    if (req.headers[&#34;x-no-compression&#34;]) return false;
    return compression.filter(req, res);
  },
  threshold: 1024, // 小于 1KB 不压缩
  level: 6
}));</code></pre>
<h4>Go</h4>
<pre><code class="language-go">import &#34;github.com/klauspost/compress/gzhttp&#34;

handler := gzhttp.GzipHandler(myHandler)
http.ListenAndServe(&#34;:8080&#34;, handler)</code></pre>
<h3>客户端</h3>
<p>浏览器自动在请求头中声明支持的压缩算法：</p>
<pre><code class="language-http">GET /api/data HTTP/1.1
Accept-Encoding: gzip, deflate, br</code></pre>
<p>服务端返回：</p>
<pre><code class="language-http">HTTP/1.1 200 OK
Content-Type: application/json
Content-Encoding: br</code></pre>
<p>浏览器自动解压，对 JavaScript 代码完全透明。</p>
<h2>压缩算法对比</h2>
<table>
<thead><tr><th>算法</th><th>压缩率</th><th>压缩速度</th><th>解压速度</th><th>浏览器支持</th></tr></thead>
<tbody>
<tr><td>Gzip</td><td>良好</td><td>快</td><td>快</td><td>所有浏览器</td></tr>
<tr><td>Brotli</td><td>更好（比 Gzip 小 15-25%）</td><td>较慢</td><td>快</td><td>现代浏览器</td></tr>
<tr><td>Deflate</td><td>良好</td><td>快</td><td>快</td><td>所有浏览器</td></tr>
<tr><td>Zstd</td><td>最好</td><td>最快</td><td>最快</td><td>Chrome 123+</td></tr>
</tbody>
</table>
<p><strong>推荐策略</strong>：静态资源用 Brotli（离线预压缩），动态 API 响应用 Gzip（实时压缩速度更快）。</p>
<h2>JSON 数据层面的优化</h2>
<p>压缩算法之外，减少 JSON 本身的冗余同样重要。</p>
<h3>去除空白</h3>
<pre><code class="language-javascript">// 紧凑输出（无缩进、无空格）
JSON.stringify(data);  // 默认就是紧凑的

// 确认没有美化
JSON.stringify(data, null, 0); // ≠ JSON.stringify(data, null, 2)</code></pre>
<p>仅去除空白就能减少 20-30% 的体积。</p>
<h3>列式格式</h3>
<pre><code class="language-json">// ❌ 行式：键名重复 N 次
{
  &#34;users&#34;: [
    {&#34;id&#34;: 1, &#34;name&#34;: &#34;Alice&#34;, &#34;age&#34;: 25},
    {&#34;id&#34;: 2, &#34;name&#34;: &#34;Bob&#34;, &#34;age&#34;: 30},
    {&#34;id&#34;: 3, &#34;name&#34;: &#34;Carol&#34;, &#34;age&#34;: 28}
  ]
}

// ✓ 列式：键名只出现一次
{
  &#34;columns&#34;: [&#34;id&#34;, &#34;name&#34;, &#34;age&#34;],
  &#34;rows&#34;: [
    [1, &#34;Alice&#34;, 25],
    [2, &#34;Bob&#34;, 30],
    [3, &#34;Carol&#34;, 28]
  ]
}</code></pre>
<p>数据量大时，列式格式可以减少 40-60% 的体积。</p>
<h3>枚举值用短标识</h3>
<pre><code class="language-json">// ❌ 冗长
{ &#34;status&#34;: &#34;payment_processing&#34;, &#34;priority&#34;: &#34;very_high&#34; }

// ✓ 短标识（配合文档映射表）
{ &#34;status&#34;: 3, &#34;priority&#34;: 4 }</code></pre>
<h2>文件存储压缩</h2>
<h3>Python</h3>
<pre><code class="language-python">import gzip
import json

data = {&#34;users&#34;: [...]}  # 大量数据

# 压缩写入
with gzip.open(&#34;data.json.gz&#34;, &#34;wt&#34;, encoding=&#34;utf-8&#34;) as f:
    json.dump(data, f, ensure_ascii=False)

# 压缩读取
with gzip.open(&#34;data.json.gz&#34;, &#34;rt&#34;, encoding=&#34;utf-8&#34;) as f:
    data = json.load(f)</code></pre>
<h3>Node.js</h3>
<pre><code class="language-javascript">const zlib = require(&#34;zlib&#34;);
const fs = require(&#34;fs&#34;);

// 压缩写入
const data = JSON.stringify(largeObject);
const compressed = zlib.gzipSync(data);
fs.writeFileSync(&#34;data.json.gz&#34;, compressed);

// 流式压缩
const readStream = fs.createReadStream(&#34;large.json&#34;);
const gzip = zlib.createGzip();
const writeStream = fs.createWriteStream(&#34;large.json.gz&#34;);
readStream.pipe(gzip).pipe(writeStream);</code></pre>
<h2>预压缩静态 JSON</h2>
<p>对于不经常变化的 JSON 文件，可以提前压缩好：</p>
<pre><code class="language-bash"># 预生成 Gzip 和 Brotli 版本
gzip -k -9 data.json          # data.json.gz
brotli -k -q 11 data.json     # data.json.br</code></pre>
<p>Nginx 配置直接服务预压缩文件：</p>
<pre><code class="language-nginx">location /api/static/ {
    gzip_static on;
    brotli_static on;
}</code></pre>
<h2>实际效果对比</h2>
<p>以一个真实的用户列表 API（1000 条记录）为例：</p>
<table>
<thead><tr><th>格式</th><th>大小</th></tr></thead>
<tbody>
<tr><td>美化 JSON（indent=2）</td><td>1,200 KB</td></tr>
<tr><td>紧凑 JSON</td><td>850 KB</td></tr>
<tr><td>紧凑 + Gzip</td><td>95 KB</td></tr>
<tr><td>紧凑 + Brotli</td><td>78 KB</td></tr>
<tr><td>列式 + Gzip</td><td>52 KB</td></tr>
</tbody>
</table>
<p>从 1200KB 到 52KB，减少了 <strong>95.7%</strong> 的传输体积。</p>
<h2>小结</h2>
<ul>
<li>HTTP 压缩（Gzip/Brotli）是最低成本的优化，应默认开启</li>
<li>动态响应用 Gzip（速度快），静态资源用 Brotli（压缩率高）</li>
<li>去除空白、使用列式格式、缩短枚举值可进一步减少体积</li>
<li>大文件存储用 <code>.json.gz</code> 格式</li>
<li>综合优化可减少 90%+ 的传输体积</li>
</ul>
`,
en: `<h1>JSON 压缩与传输优化</h1>
<h2>为什么需要压缩 JSON</h2>
<p>JSON 是文本格式，有大量冗余（重复的键名、空白、结构字符）。一个 1MB 的 JSON API 响应，经 Gzip 压缩后通常只有 100-200KB。压缩是最低成本、最高回报的优化手段。</p>
<h2>HTTP 压缩</h2>
<h3>服务端配置</h3>
<h4>Nginx</h4>
<pre><code class="language-nginx">http {
    gzip on;
    gzip_types application/json text/plain application/javascript;
    gzip_min_length 1024;     # 小于 1KB 不压缩
    gzip_comp_level 6;        # 压缩级别 1-9
    gzip_vary on;

    # Brotli（需要模块）
    brotli on;
    brotli_types application/json text/plain;
    brotli_comp_level 6;
}</code></pre>
<h4>Express.js</h4>
<pre><code class="language-javascript">const compression = require(&#34;compression&#34;);
const express = require(&#34;express&#34;);
const app = express();

app.use(compression({
  filter: (req, res) =&gt; {
    if (req.headers[&#34;x-no-compression&#34;]) return false;
    return compression.filter(req, res);
  },
  threshold: 1024, // 小于 1KB 不压缩
  level: 6
}));</code></pre>
<h4>Go</h4>
<pre><code class="language-go">import &#34;github.com/klauspost/compress/gzhttp&#34;

handler := gzhttp.GzipHandler(myHandler)
http.ListenAndServe(&#34;:8080&#34;, handler)</code></pre>
<h3>客户端</h3>
<p>浏览器自动在请求头中声明支持的压缩算法：</p>
<pre><code class="language-http">GET /api/data HTTP/1.1
Accept-Encoding: gzip, deflate, br</code></pre>
<p>服务端返回：</p>
<pre><code class="language-http">HTTP/1.1 200 OK
Content-Type: application/json
Content-Encoding: br</code></pre>
<p>浏览器自动解压，对 JavaScript 代码完全透明。</p>
<h2>压缩算法对比</h2>
<table>
<thead><tr><th>算法</th><th>压缩率</th><th>压缩速度</th><th>解压速度</th><th>浏览器支持</th></tr></thead>
<tbody>
<tr><td>Gzip</td><td>良好</td><td>快</td><td>快</td><td>所有浏览器</td></tr>
<tr><td>Brotli</td><td>更好（比 Gzip 小 15-25%）</td><td>较慢</td><td>快</td><td>现代浏览器</td></tr>
<tr><td>Deflate</td><td>良好</td><td>快</td><td>快</td><td>所有浏览器</td></tr>
<tr><td>Zstd</td><td>最好</td><td>最快</td><td>最快</td><td>Chrome 123+</td></tr>
</tbody>
</table>
<p><strong>推荐策略</strong>：静态资源用 Brotli（离线预压缩），动态 API 响应用 Gzip（实时压缩速度更快）。</p>
<h2>JSON 数据层面的优化</h2>
<p>压缩算法之外，减少 JSON 本身的冗余同样重要。</p>
<h3>去除空白</h3>
<pre><code class="language-javascript">// 紧凑输出（无缩进、无空格）
JSON.stringify(data);  // 默认就是紧凑的

// 确认没有美化
JSON.stringify(data, null, 0); // ≠ JSON.stringify(data, null, 2)</code></pre>
<p>仅去除空白就能减少 20-30% 的体积。</p>
<h3>列式格式</h3>
<pre><code class="language-json">// ❌ 行式：键名重复 N 次
{
  &#34;users&#34;: [
    {&#34;id&#34;: 1, &#34;name&#34;: &#34;Alice&#34;, &#34;age&#34;: 25},
    {&#34;id&#34;: 2, &#34;name&#34;: &#34;Bob&#34;, &#34;age&#34;: 30},
    {&#34;id&#34;: 3, &#34;name&#34;: &#34;Carol&#34;, &#34;age&#34;: 28}
  ]
}

// ✓ 列式：键名只出现一次
{
  &#34;columns&#34;: [&#34;id&#34;, &#34;name&#34;, &#34;age&#34;],
  &#34;rows&#34;: [
    [1, &#34;Alice&#34;, 25],
    [2, &#34;Bob&#34;, 30],
    [3, &#34;Carol&#34;, 28]
  ]
}</code></pre>
<p>数据量大时，列式格式可以减少 40-60% 的体积。</p>
<h3>枚举值用短标识</h3>
<pre><code class="language-json">// ❌ 冗长
{ &#34;status&#34;: &#34;payment_processing&#34;, &#34;priority&#34;: &#34;very_high&#34; }

// ✓ 短标识（配合文档映射表）
{ &#34;status&#34;: 3, &#34;priority&#34;: 4 }</code></pre>
<h2>文件存储压缩</h2>
<h3>Python</h3>
<pre><code class="language-python">import gzip
import json

data = {&#34;users&#34;: [...]}  # 大量数据

# 压缩写入
with gzip.open(&#34;data.json.gz&#34;, &#34;wt&#34;, encoding=&#34;utf-8&#34;) as f:
    json.dump(data, f, ensure_ascii=False)

# 压缩读取
with gzip.open(&#34;data.json.gz&#34;, &#34;rt&#34;, encoding=&#34;utf-8&#34;) as f:
    data = json.load(f)</code></pre>
<h3>Node.js</h3>
<pre><code class="language-javascript">const zlib = require(&#34;zlib&#34;);
const fs = require(&#34;fs&#34;);

// 压缩写入
const data = JSON.stringify(largeObject);
const compressed = zlib.gzipSync(data);
fs.writeFileSync(&#34;data.json.gz&#34;, compressed);

// 流式压缩
const readStream = fs.createReadStream(&#34;large.json&#34;);
const gzip = zlib.createGzip();
const writeStream = fs.createWriteStream(&#34;large.json.gz&#34;);
readStream.pipe(gzip).pipe(writeStream);</code></pre>
<h2>预压缩静态 JSON</h2>
<p>对于不经常变化的 JSON 文件，可以提前压缩好：</p>
<pre><code class="language-bash"># 预生成 Gzip 和 Brotli 版本
gzip -k -9 data.json          # data.json.gz
brotli -k -q 11 data.json     # data.json.br</code></pre>
<p>Nginx 配置直接服务预压缩文件：</p>
<pre><code class="language-nginx">location /api/static/ {
    gzip_static on;
    brotli_static on;
}</code></pre>
<h2>实际效果对比</h2>
<p>以一个真实的用户列表 API（1000 条记录）为例：</p>
<table>
<thead><tr><th>格式</th><th>大小</th></tr></thead>
<tbody>
<tr><td>美化 JSON（indent=2）</td><td>1,200 KB</td></tr>
<tr><td>紧凑 JSON</td><td>850 KB</td></tr>
<tr><td>紧凑 + Gzip</td><td>95 KB</td></tr>
<tr><td>紧凑 + Brotli</td><td>78 KB</td></tr>
<tr><td>列式 + Gzip</td><td>52 KB</td></tr>
</tbody>
</table>
<p>从 1200KB 到 52KB，减少了 <strong>95.7%</strong> 的传输体积。</p>
<h2>小结</h2>
<ul>
<li>HTTP 压缩（Gzip/Brotli）是最低成本的优化，应默认开启</li>
<li>动态响应用 Gzip（速度快），静态资源用 Brotli（压缩率高）</li>
<li>去除空白、使用列式格式、缩短枚举值可进一步减少体积</li>
<li>大文件存储用 <code>.json.gz</code> 格式</li>
<li>综合优化可减少 90%+ 的传输体积</li>
</ul>
`
};

window.LEARN_ARTICLES["mongodb-json"] = {
zh: `<h1>MongoDB 与 JSON：文档数据库实战</h1>
<h2>MongoDB 与 JSON 的关系</h2>
<p>MongoDB 是最流行的文档数据库，数据以 <strong>类 JSON 的 BSON（Binary JSON）</strong> 格式存储。你可以用 JSON 格式插入、查询、更新数据，就像操作普通 JSON 对象一样。</p>
<h3>BSON vs JSON</h3>
<table>
<thead><tr><th>维度</th><th>JSON</th><th>BSON</th></tr></thead>
<tbody>
<tr><td>格式</td><td>文本</td><td>二进制</td></tr>
<tr><td>数据类型</td><td>6 种基本类型</td><td>扩展类型（Date, ObjectId, Decimal128, Binary...）</td></tr>
<tr><td>性能</td><td>解析较慢</td><td>快速遍历</td></tr>
<tr><td>大小</td><td>通常更小</td><td>稍大（含类型和长度信息）</td></tr>
</tbody>
</table>
<p>你不需要直接操作 BSON。MongoDB 驱动自动完成 JSON ↔ BSON 的转换。</p>
<h2>CRUD 基础操作</h2>
<h3>插入文档</h3>
<pre><code class="language-javascript">// Node.js (mongodb 驱动)
const { MongoClient } = require(&#34;mongodb&#34;);
const client = new MongoClient(&#34;mongodb://localhost:27017&#34;);
const db = client.db(&#34;myapp&#34;);
const users = db.collection(&#34;users&#34;);

// 插入单条
await users.insertOne({
  name: &#34;Alice&#34;,
  email: &#34;alice@example.com&#34;,
  age: 28,
  tags: [&#34;developer&#34;, &#34;writer&#34;],
  address: {
    city: &#34;Beijing&#34;,
    zip: &#34;100000&#34;
  },
  createdAt: new Date()
});

// 批量插入
await users.insertMany([
  { name: &#34;Bob&#34;, email: &#34;bob@example.com&#34;, age: 32 },
  { name: &#34;Carol&#34;, email: &#34;carol@example.com&#34;, age: 25 }
]);</code></pre>
<h3>查询文档</h3>
<pre><code class="language-javascript">// 精确匹配
const alice = await users.findOne({ email: &#34;alice@example.com&#34; });

// 比较查询
const seniors = await users.find({ age: { $gte: 30 } }).toArray();

// 嵌套字段查询（点号语法）
const beijingUsers = await users.find({ &#34;address.city&#34;: &#34;Beijing&#34; }).toArray();

// 数组查询
const developers = await users.find({ tags: &#34;developer&#34; }).toArray();

// 正则匹配
const aliceOrBob = await users.find({
  name: { $regex: /^(alice|bob)$/i }
}).toArray();

// 投影（只返回特定字段）
const names = await users.find({}, {
  projection: { name: 1, email: 1, _id: 0 }
}).toArray();</code></pre>
<h3>更新文档</h3>
<pre><code class="language-javascript">// 更新单个字段
await users.updateOne(
  { email: &#34;alice@example.com&#34; },
  { $set: { age: 29, &#34;address.city&#34;: &#34;Shanghai&#34; } }
);

// 数组操作
await users.updateOne(
  { email: &#34;alice@example.com&#34; },
  { $push: { tags: &#34;speaker&#34; } }       // 数组追加
);

await users.updateOne(
  { email: &#34;alice@example.com&#34; },
  { $pull: { tags: &#34;writer&#34; } }        // 数组移除
);

// 自增
await users.updateOne(
  { email: &#34;alice@example.com&#34; },
  { $inc: { &#34;stats.loginCount&#34;: 1 } }
);

// 不存在则创建（upsert）
await users.updateOne(
  { email: &#34;dave@example.com&#34; },
  { $set: { name: &#34;Dave&#34;, age: 35 } },
  { upsert: true }
);</code></pre>
<h3>删除文档</h3>
<pre><code class="language-javascript">await users.deleteOne({ email: &#34;bob@example.com&#34; });
await users.deleteMany({ age: { $lt: 18 } });</code></pre>
<h2>聚合管道</h2>
<p>聚合管道（Aggregation Pipeline）是 MongoDB 最强大的数据处理功能：</p>
<pre><code class="language-javascript">const result = await users.aggregate([
  // 1. 筛选
  { $match: { age: { $gte: 20, $lte: 40 } } },

  // 2. 关联查询（类似 JOIN）
  { $lookup: {
    from: &#34;orders&#34;,
    localField: &#34;_id&#34;,
    foreignField: &#34;userId&#34;,
    as: &#34;orders&#34;
  }},

  // 3. 添加计算字段
  { $addFields: {
    orderCount: { $size: &#34;$orders&#34; },
    totalSpent: { $sum: &#34;$orders.amount&#34; }
  }},

  // 4. 分组统计
  { $group: {
    _id: &#34;$address.city&#34;,
    avgAge: { $avg: &#34;$age&#34; },
    userCount: { $sum: 1 },
    totalOrders: { $sum: &#34;$orderCount&#34; }
  }},

  // 5. 排序
  { $sort: { totalOrders: -1 } },

  // 6. 限制结果
  { $limit: 10 }
]).toArray();</code></pre>
<h2>Python (PyMongo)</h2>
<pre><code class="language-python">from pymongo import MongoClient
from datetime import datetime

client = MongoClient(&#34;mongodb://localhost:27017&#34;)
db = client[&#34;myapp&#34;]
users = db[&#34;users&#34;]

# 插入
users.insert_one({
    &#34;name&#34;: &#34;Alice&#34;,
    &#34;email&#34;: &#34;alice@example.com&#34;,
    &#34;age&#34;: 28,
    &#34;tags&#34;: [&#34;developer&#34;],
    &#34;created_at&#34;: datetime.utcnow()
})

# 查询
for user in users.find({&#34;age&#34;: {&#34;$gte&#34;: 25}}).sort(&#34;age&#34;, -1).limit(10):
    print(f&#34;{user[&#39;name&#39;]}: {user[&#39;age&#39;]}&#34;)

# 聚合
pipeline = [
    {&#34;$group&#34;: {&#34;_id&#34;: &#34;$address.city&#34;, &#34;count&#34;: {&#34;$sum&#34;: 1}}},
    {&#34;$sort&#34;: {&#34;count&#34;: -1}}
]
for city in users.aggregate(pipeline):
    print(f&#34;{city[&#39;_id&#39;]}: {city[&#39;count&#39;]}&#34;)</code></pre>
<h2>Schema 设计建议</h2>
<h3>嵌入 vs 引用</h3>
<pre><code class="language-javascript">// 嵌入（适合 1:1 或 1:少量的关系）
{
  &#34;name&#34;: &#34;Alice&#34;,
  &#34;address&#34;: { &#34;city&#34;: &#34;Beijing&#34;, &#34;zip&#34;: &#34;100000&#34; }
}

// 引用（适合 1:多 或 多:多的关系）
{
  &#34;name&#34;: &#34;Alice&#34;,
  &#34;orderIds&#34;: [ObjectId(&#34;...&#34;), ObjectId(&#34;...&#34;)]
}</code></pre>
<p>选择原则：</p>
<ul>
<li>经常一起读取 → 嵌入</li>
<li>独立更新 → 引用</li>
<li>数组会无限增长 → 引用</li>
<li>嵌入文档 < 16MB → 嵌入（MongoDB 文档大小限制是 16MB）</li>
</ul>
<h2>索引优化</h2>
<pre><code class="language-javascript">// 单字段索引
await users.createIndex({ email: 1 }, { unique: true });

// 复合索引
await users.createIndex({ &#34;address.city&#34;: 1, age: -1 });

// 文本索引（全文搜索）
await users.createIndex({ name: &#34;text&#34;, bio: &#34;text&#34; });
const results = await users.find({ $text: { $search: &#34;developer Beijing&#34; } }).toArray();

// 查看查询执行计划
const plan = await users.find({ age: { $gt: 25 } }).explain(&#34;executionStats&#34;);
console.log(plan.executionStats.totalDocsExamined);</code></pre>
<h2>数据导入导出</h2>
<pre><code class="language-bash"># 导出为 JSON（NDJSON 格式）
mongoexport --db myapp --collection users --out users.json

# 导入
mongoimport --db myapp --collection users --file users.json

# 导出为 JSON 数组
mongoexport --db myapp --collection users --jsonArray --out users_array.json</code></pre>
<h2>小结</h2>
<ul>
<li>MongoDB 以 BSON（二进制 JSON）存储数据，API 使用 JSON 风格</li>
<li>支持嵌套文档、数组等复杂结构的增删改查</li>
<li>聚合管道是数据分析的强大工具</li>
<li>Schema 设计时在嵌入和引用之间平衡</li>
<li>合理创建索引是查询性能的关键</li>
</ul>
`,
en: `<h1>MongoDB 与 JSON：文档数据库实战</h1>
<h2>MongoDB 与 JSON 的关系</h2>
<p>MongoDB 是最流行的文档数据库，数据以 <strong>类 JSON 的 BSON（Binary JSON）</strong> 格式存储。你可以用 JSON 格式插入、查询、更新数据，就像操作普通 JSON 对象一样。</p>
<h3>BSON vs JSON</h3>
<table>
<thead><tr><th>维度</th><th>JSON</th><th>BSON</th></tr></thead>
<tbody>
<tr><td>格式</td><td>文本</td><td>二进制</td></tr>
<tr><td>数据类型</td><td>6 种基本类型</td><td>扩展类型（Date, ObjectId, Decimal128, Binary...）</td></tr>
<tr><td>性能</td><td>解析较慢</td><td>快速遍历</td></tr>
<tr><td>大小</td><td>通常更小</td><td>稍大（含类型和长度信息）</td></tr>
</tbody>
</table>
<p>你不需要直接操作 BSON。MongoDB 驱动自动完成 JSON ↔ BSON 的转换。</p>
<h2>CRUD 基础操作</h2>
<h3>插入文档</h3>
<pre><code class="language-javascript">// Node.js (mongodb 驱动)
const { MongoClient } = require(&#34;mongodb&#34;);
const client = new MongoClient(&#34;mongodb://localhost:27017&#34;);
const db = client.db(&#34;myapp&#34;);
const users = db.collection(&#34;users&#34;);

// 插入单条
await users.insertOne({
  name: &#34;Alice&#34;,
  email: &#34;alice@example.com&#34;,
  age: 28,
  tags: [&#34;developer&#34;, &#34;writer&#34;],
  address: {
    city: &#34;Beijing&#34;,
    zip: &#34;100000&#34;
  },
  createdAt: new Date()
});

// 批量插入
await users.insertMany([
  { name: &#34;Bob&#34;, email: &#34;bob@example.com&#34;, age: 32 },
  { name: &#34;Carol&#34;, email: &#34;carol@example.com&#34;, age: 25 }
]);</code></pre>
<h3>查询文档</h3>
<pre><code class="language-javascript">// 精确匹配
const alice = await users.findOne({ email: &#34;alice@example.com&#34; });

// 比较查询
const seniors = await users.find({ age: { $gte: 30 } }).toArray();

// 嵌套字段查询（点号语法）
const beijingUsers = await users.find({ &#34;address.city&#34;: &#34;Beijing&#34; }).toArray();

// 数组查询
const developers = await users.find({ tags: &#34;developer&#34; }).toArray();

// 正则匹配
const aliceOrBob = await users.find({
  name: { $regex: /^(alice|bob)$/i }
}).toArray();

// 投影（只返回特定字段）
const names = await users.find({}, {
  projection: { name: 1, email: 1, _id: 0 }
}).toArray();</code></pre>
<h3>更新文档</h3>
<pre><code class="language-javascript">// 更新单个字段
await users.updateOne(
  { email: &#34;alice@example.com&#34; },
  { $set: { age: 29, &#34;address.city&#34;: &#34;Shanghai&#34; } }
);

// 数组操作
await users.updateOne(
  { email: &#34;alice@example.com&#34; },
  { $push: { tags: &#34;speaker&#34; } }       // 数组追加
);

await users.updateOne(
  { email: &#34;alice@example.com&#34; },
  { $pull: { tags: &#34;writer&#34; } }        // 数组移除
);

// 自增
await users.updateOne(
  { email: &#34;alice@example.com&#34; },
  { $inc: { &#34;stats.loginCount&#34;: 1 } }
);

// 不存在则创建（upsert）
await users.updateOne(
  { email: &#34;dave@example.com&#34; },
  { $set: { name: &#34;Dave&#34;, age: 35 } },
  { upsert: true }
);</code></pre>
<h3>删除文档</h3>
<pre><code class="language-javascript">await users.deleteOne({ email: &#34;bob@example.com&#34; });
await users.deleteMany({ age: { $lt: 18 } });</code></pre>
<h2>聚合管道</h2>
<p>聚合管道（Aggregation Pipeline）是 MongoDB 最强大的数据处理功能：</p>
<pre><code class="language-javascript">const result = await users.aggregate([
  // 1. 筛选
  { $match: { age: { $gte: 20, $lte: 40 } } },

  // 2. 关联查询（类似 JOIN）
  { $lookup: {
    from: &#34;orders&#34;,
    localField: &#34;_id&#34;,
    foreignField: &#34;userId&#34;,
    as: &#34;orders&#34;
  }},

  // 3. 添加计算字段
  { $addFields: {
    orderCount: { $size: &#34;$orders&#34; },
    totalSpent: { $sum: &#34;$orders.amount&#34; }
  }},

  // 4. 分组统计
  { $group: {
    _id: &#34;$address.city&#34;,
    avgAge: { $avg: &#34;$age&#34; },
    userCount: { $sum: 1 },
    totalOrders: { $sum: &#34;$orderCount&#34; }
  }},

  // 5. 排序
  { $sort: { totalOrders: -1 } },

  // 6. 限制结果
  { $limit: 10 }
]).toArray();</code></pre>
<h2>Python (PyMongo)</h2>
<pre><code class="language-python">from pymongo import MongoClient
from datetime import datetime

client = MongoClient(&#34;mongodb://localhost:27017&#34;)
db = client[&#34;myapp&#34;]
users = db[&#34;users&#34;]

# 插入
users.insert_one({
    &#34;name&#34;: &#34;Alice&#34;,
    &#34;email&#34;: &#34;alice@example.com&#34;,
    &#34;age&#34;: 28,
    &#34;tags&#34;: [&#34;developer&#34;],
    &#34;created_at&#34;: datetime.utcnow()
})

# 查询
for user in users.find({&#34;age&#34;: {&#34;$gte&#34;: 25}}).sort(&#34;age&#34;, -1).limit(10):
    print(f&#34;{user[&#39;name&#39;]}: {user[&#39;age&#39;]}&#34;)

# 聚合
pipeline = [
    {&#34;$group&#34;: {&#34;_id&#34;: &#34;$address.city&#34;, &#34;count&#34;: {&#34;$sum&#34;: 1}}},
    {&#34;$sort&#34;: {&#34;count&#34;: -1}}
]
for city in users.aggregate(pipeline):
    print(f&#34;{city[&#39;_id&#39;]}: {city[&#39;count&#39;]}&#34;)</code></pre>
<h2>Schema 设计建议</h2>
<h3>嵌入 vs 引用</h3>
<pre><code class="language-javascript">// 嵌入（适合 1:1 或 1:少量的关系）
{
  &#34;name&#34;: &#34;Alice&#34;,
  &#34;address&#34;: { &#34;city&#34;: &#34;Beijing&#34;, &#34;zip&#34;: &#34;100000&#34; }
}

// 引用（适合 1:多 或 多:多的关系）
{
  &#34;name&#34;: &#34;Alice&#34;,
  &#34;orderIds&#34;: [ObjectId(&#34;...&#34;), ObjectId(&#34;...&#34;)]
}</code></pre>
<p>选择原则：</p>
<ul>
<li>经常一起读取 → 嵌入</li>
<li>独立更新 → 引用</li>
<li>数组会无限增长 → 引用</li>
<li>嵌入文档 < 16MB → 嵌入（MongoDB 文档大小限制是 16MB）</li>
</ul>
<h2>索引优化</h2>
<pre><code class="language-javascript">// 单字段索引
await users.createIndex({ email: 1 }, { unique: true });

// 复合索引
await users.createIndex({ &#34;address.city&#34;: 1, age: -1 });

// 文本索引（全文搜索）
await users.createIndex({ name: &#34;text&#34;, bio: &#34;text&#34; });
const results = await users.find({ $text: { $search: &#34;developer Beijing&#34; } }).toArray();

// 查看查询执行计划
const plan = await users.find({ age: { $gt: 25 } }).explain(&#34;executionStats&#34;);
console.log(plan.executionStats.totalDocsExamined);</code></pre>
<h2>数据导入导出</h2>
<pre><code class="language-bash"># 导出为 JSON（NDJSON 格式）
mongoexport --db myapp --collection users --out users.json

# 导入
mongoimport --db myapp --collection users --file users.json

# 导出为 JSON 数组
mongoexport --db myapp --collection users --jsonArray --out users_array.json</code></pre>
<h2>小结</h2>
<ul>
<li>MongoDB 以 BSON（二进制 JSON）存储数据，API 使用 JSON 风格</li>
<li>支持嵌套文档、数组等复杂结构的增删改查</li>
<li>聚合管道是数据分析的强大工具</li>
<li>Schema 设计时在嵌入和引用之间平衡</li>
<li>合理创建索引是查询性能的关键</li>
</ul>
`
};

window.LEARN_ARTICLES["postgresql-json"] = {
zh: `<h1>PostgreSQL JSON/JSONB 完全指南</h1>
<h2>为什么在关系数据库中用 JSON</h2>
<p>现实世界中，数据结构并不总是规整的。用户设置、产品属性、事件日志等数据，每条记录的字段可能不同。PostgreSQL 的 JSONB 类型让你同时享受关系数据库的事务安全和 NoSQL 的灵活性。</p>
<h2>JSON vs JSONB</h2>
<p>PostgreSQL 提供两种 JSON 类型：</p>
<table>
<thead><tr><th>特性</th><th>json</th><th>jsonb</th></tr></thead>
<tbody>
<tr><td>存储</td><td>文本原样</td><td>二进制解析后</td></tr>
<tr><td>保留格式</td><td>✓（空格、键序）</td><td>✗（重新格式化）</td></tr>
<tr><td>重复键</td><td>保留</td><td>只保留最后一个</td></tr>
<tr><td>索引</td><td>✗</td><td>✓（GIN 索引）</td></tr>
<tr><td>查询性能</td><td>慢（每次解析）</td><td>快</td></tr>
</tbody>
</table>
<p><strong>结论：几乎总是选 JSONB</strong>。除非你需要保留原始 JSON 格式。</p>
<h2>基本操作</h2>
<h3>建表</h3>
<pre><code class="language-sql">CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10,2),
    attrs JSONB DEFAULT &#39;{}&#39;,
    created_at TIMESTAMPTZ DEFAULT NOW()
);</code></pre>
<h3>插入数据</h3>
<pre><code class="language-sql">INSERT INTO products (name, price, attrs) VALUES
(&#39;MacBook Pro&#39;, 14999.00, &#39;{
    &#34;brand&#34;: &#34;Apple&#34;,
    &#34;cpu&#34;: &#34;M3 Pro&#34;,
    &#34;ram&#34;: 18,
    &#34;storage&#34;: &#34;512GB&#34;,
    &#34;ports&#34;: [&#34;USB-C&#34;, &#34;HDMI&#34;, &#34;MagSafe&#34;],
    &#34;colors&#34;: [&#34;银色&#34;, &#34;深空黑&#34;]
}&#39;),
(&#39;ThinkPad X1&#39;, 9999.00, &#39;{
    &#34;brand&#34;: &#34;Lenovo&#34;,
    &#34;cpu&#34;: &#34;i7-1365U&#34;,
    &#34;ram&#34;: 16,
    &#34;storage&#34;: &#34;512GB&#34;,
    &#34;ports&#34;: [&#34;USB-C&#34;, &#34;USB-A&#34;, &#34;HDMI&#34;],
    &#34;weight_kg&#34;: 1.12
}&#39;);</code></pre>
<h3>查询 JSON 字段</h3>
<pre><code class="language-sql">-- 提取文本值（-&gt;&gt; 返回 text）
SELECT name, attrs-&gt;&gt;&#39;brand&#39; AS brand, attrs-&gt;&gt;&#39;cpu&#39; AS cpu
FROM products;

-- 提取 JSON 值（-&gt; 返回 jsonb）
SELECT name, attrs-&gt;&#39;ports&#39; AS ports
FROM products;

-- 嵌套提取
SELECT attrs-&gt;&#39;specs&#39;-&gt;&gt;&#39;resolution&#39; FROM products;

-- 路径提取（#&gt;&gt; 用路径数组）
SELECT attrs#&gt;&gt;&#39;{ports,0}&#39; AS first_port FROM products;</code></pre>
<h3>条件查询</h3>
<pre><code class="language-sql">-- 等值查询
SELECT * FROM products WHERE attrs-&gt;&gt;&#39;brand&#39; = &#39;Apple&#39;;

-- 数值比较（先转换类型）
SELECT * FROM products WHERE (attrs-&gt;&gt;&#39;ram&#39;)::int &gt;= 16;

-- 包含查询（@&gt; 操作符：左侧包含右侧）
SELECT * FROM products WHERE attrs @&gt; &#39;{&#34;brand&#34;: &#34;Apple&#34;}&#39;;

-- 数组包含
SELECT * FROM products WHERE attrs-&gt;&#39;ports&#39; @&gt; &#39;&#34;HDMI&#34;&#39;;

-- 键存在检查
SELECT * FROM products WHERE attrs ? &#39;weight_kg&#39;;

-- 任一键存在
SELECT * FROM products WHERE attrs ?| array[&#39;weight_kg&#39;, &#39;battery&#39;];</code></pre>
<h3>修改 JSON</h3>
<pre><code class="language-sql">-- 更新字段
UPDATE products SET attrs = jsonb_set(attrs, &#39;{ram}&#39;, &#39;32&#39;) WHERE name = &#39;MacBook Pro&#39;;

-- 添加新字段
UPDATE products SET attrs = attrs || &#39;{&#34;warranty&#34;: &#34;3 years&#34;}&#39; WHERE name = &#39;MacBook Pro&#39;;

-- 删除字段
UPDATE products SET attrs = attrs - &#39;weight_kg&#39; WHERE name = &#39;ThinkPad X1&#39;;

-- 删除嵌套路径
UPDATE products SET attrs = attrs #- &#39;{ports,2}&#39;;

-- 深层更新
UPDATE products SET attrs = jsonb_set(attrs, &#39;{specs,resolution}&#39;, &#39;&#34;2560x1600&#34;&#39;);</code></pre>
<h2>索引</h2>
<p>JSONB 索引是查询性能的关键：</p>
<pre><code class="language-sql">-- GIN 索引（支持 @&gt;, ?, ?| 等操作符）
CREATE INDEX idx_products_attrs ON products USING GIN (attrs);

-- 表达式索引（针对特定字段）
CREATE INDEX idx_products_brand ON products ((attrs-&gt;&gt;&#39;brand&#39;));
CREATE INDEX idx_products_ram ON products (((attrs-&gt;&gt;&#39;ram&#39;)::int));

-- 路径索引（jsonb_path_ops 更小更快，但只支持 @&gt;）
CREATE INDEX idx_products_attrs_path ON products USING GIN (attrs jsonb_path_ops);</code></pre>
<h3>索引选择指南</h3>
<table>
<thead><tr><th>查询模式</th><th>推荐索引</th></tr></thead>
<tbody>
<tr><td><code>attrs @&gt; &#39;{&#34;brand&#34;: &#34;Apple&#34;}&#39;</code></td><td>GIN (jsonb_path_ops)</td></tr>
<tr><td><code>attrs-&gt;&gt;&#39;brand&#39; = &#39;Apple&#39;</code></td><td>表达式索引 (btree)</td></tr>
<tr><td><code>attrs ? &#39;weight_kg&#39;</code></td><td>GIN (默认)</td></tr>
<tr><td><code>(attrs-&gt;&gt;&#39;ram&#39;)::int &gt; 16</code></td><td>表达式索引 (btree)</td></tr>
</tbody>
</table>
<h2>JSON 函数</h2>
<pre><code class="language-sql">-- 展开对象为键值对
SELECT * FROM jsonb_each(&#39;{&#34;a&#34;:1,&#34;b&#34;:2}&#39;);
-- key | value
-- a   | 1
-- b   | 2

-- 展开数组
SELECT * FROM jsonb_array_elements(&#39;[&#34;a&#34;,&#34;b&#34;,&#34;c&#34;]&#39;);

-- 聚合为 JSON 数组
SELECT jsonb_agg(name) FROM products WHERE price &gt; 10000;

-- 聚合为 JSON 对象
SELECT jsonb_object_agg(name, price) FROM products;

-- 获取所有键
SELECT DISTINCT jsonb_object_keys(attrs) AS key FROM products;

-- 统计各品牌数量
SELECT attrs-&gt;&gt;&#39;brand&#39; AS brand, COUNT(*)
FROM products
GROUP BY attrs-&gt;&gt;&#39;brand&#39;
ORDER BY COUNT(*) DESC;</code></pre>
<h2>JSONPath（PostgreSQL 12+）</h2>
<pre><code class="language-sql">-- 查找 RAM &gt;= 16 的产品
SELECT * FROM products WHERE attrs @? &#39;$.ram ? (@ &gt;= 16)&#39;;

-- 提取所有 USB-C 端口
SELECT jsonb_path_query(attrs, &#39;$.ports[*] ? (@ starts with &#34;USB&#34;)&#39;) FROM products;

-- 返回第一个匹配
SELECT jsonb_path_query_first(attrs, &#39;$.ports[0]&#39;) FROM products;</code></pre>
<h2>实战模式</h2>
<h3>用户设置</h3>
<pre><code class="language-sql">CREATE TABLE user_settings (
    user_id INT PRIMARY KEY REFERENCES users(id),
    settings JSONB DEFAULT &#39;{
        &#34;theme&#34;: &#34;light&#34;,
        &#34;language&#34;: &#34;zh-CN&#34;,
        &#34;notifications&#34;: {&#34;email&#34;: true, &#34;push&#34;: true}
    }&#39;
);

-- 更新单个设置
UPDATE user_settings
SET settings = jsonb_set(settings, &#39;{theme}&#39;, &#39;&#34;dark&#34;&#39;)
WHERE user_id = 1;

-- 读取特定设置
SELECT settings-&gt;&gt;&#39;theme&#39; FROM user_settings WHERE user_id = 1;</code></pre>
<h3>事件日志</h3>
<pre><code class="language-sql">CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_type ON events (event_type, created_at);
CREATE INDEX idx_events_payload ON events USING GIN (payload);

-- 查询特定用户的购买事件
SELECT * FROM events
WHERE event_type = &#39;purchase&#39;
  AND payload @&gt; &#39;{&#34;user_id&#34;: 123}&#39;
ORDER BY created_at DESC;</code></pre>
<h2>小结</h2>
<ul>
<li>PostgreSQL JSONB 结合了关系型数据库的可靠性和文档存储的灵活性</li>
<li>几乎总是选 JSONB 而非 JSON</li>
<li><code>-&gt;</code> 提取 JSON 值，<code>-&gt;&gt;</code> 提取文本值，<code>@&gt;</code> 包含查询</li>
<li>GIN 索引是 JSONB 查询性能的关键</li>
<li>适合用户设置、产品属性、事件日志等半结构化数据</li>
</ul>
`,
en: `<h1>PostgreSQL JSON/JSONB 完全指南</h1>
<h2>为什么在关系数据库中用 JSON</h2>
<p>现实世界中，数据结构并不总是规整的。用户设置、产品属性、事件日志等数据，每条记录的字段可能不同。PostgreSQL 的 JSONB 类型让你同时享受关系数据库的事务安全和 NoSQL 的灵活性。</p>
<h2>JSON vs JSONB</h2>
<p>PostgreSQL 提供两种 JSON 类型：</p>
<table>
<thead><tr><th>特性</th><th>json</th><th>jsonb</th></tr></thead>
<tbody>
<tr><td>存储</td><td>文本原样</td><td>二进制解析后</td></tr>
<tr><td>保留格式</td><td>✓（空格、键序）</td><td>✗（重新格式化）</td></tr>
<tr><td>重复键</td><td>保留</td><td>只保留最后一个</td></tr>
<tr><td>索引</td><td>✗</td><td>✓（GIN 索引）</td></tr>
<tr><td>查询性能</td><td>慢（每次解析）</td><td>快</td></tr>
</tbody>
</table>
<p><strong>结论：几乎总是选 JSONB</strong>。除非你需要保留原始 JSON 格式。</p>
<h2>基本操作</h2>
<h3>建表</h3>
<pre><code class="language-sql">CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10,2),
    attrs JSONB DEFAULT &#39;{}&#39;,
    created_at TIMESTAMPTZ DEFAULT NOW()
);</code></pre>
<h3>插入数据</h3>
<pre><code class="language-sql">INSERT INTO products (name, price, attrs) VALUES
(&#39;MacBook Pro&#39;, 14999.00, &#39;{
    &#34;brand&#34;: &#34;Apple&#34;,
    &#34;cpu&#34;: &#34;M3 Pro&#34;,
    &#34;ram&#34;: 18,
    &#34;storage&#34;: &#34;512GB&#34;,
    &#34;ports&#34;: [&#34;USB-C&#34;, &#34;HDMI&#34;, &#34;MagSafe&#34;],
    &#34;colors&#34;: [&#34;银色&#34;, &#34;深空黑&#34;]
}&#39;),
(&#39;ThinkPad X1&#39;, 9999.00, &#39;{
    &#34;brand&#34;: &#34;Lenovo&#34;,
    &#34;cpu&#34;: &#34;i7-1365U&#34;,
    &#34;ram&#34;: 16,
    &#34;storage&#34;: &#34;512GB&#34;,
    &#34;ports&#34;: [&#34;USB-C&#34;, &#34;USB-A&#34;, &#34;HDMI&#34;],
    &#34;weight_kg&#34;: 1.12
}&#39;);</code></pre>
<h3>查询 JSON 字段</h3>
<pre><code class="language-sql">-- 提取文本值（-&gt;&gt; 返回 text）
SELECT name, attrs-&gt;&gt;&#39;brand&#39; AS brand, attrs-&gt;&gt;&#39;cpu&#39; AS cpu
FROM products;

-- 提取 JSON 值（-&gt; 返回 jsonb）
SELECT name, attrs-&gt;&#39;ports&#39; AS ports
FROM products;

-- 嵌套提取
SELECT attrs-&gt;&#39;specs&#39;-&gt;&gt;&#39;resolution&#39; FROM products;

-- 路径提取（#&gt;&gt; 用路径数组）
SELECT attrs#&gt;&gt;&#39;{ports,0}&#39; AS first_port FROM products;</code></pre>
<h3>条件查询</h3>
<pre><code class="language-sql">-- 等值查询
SELECT * FROM products WHERE attrs-&gt;&gt;&#39;brand&#39; = &#39;Apple&#39;;

-- 数值比较（先转换类型）
SELECT * FROM products WHERE (attrs-&gt;&gt;&#39;ram&#39;)::int &gt;= 16;

-- 包含查询（@&gt; 操作符：左侧包含右侧）
SELECT * FROM products WHERE attrs @&gt; &#39;{&#34;brand&#34;: &#34;Apple&#34;}&#39;;

-- 数组包含
SELECT * FROM products WHERE attrs-&gt;&#39;ports&#39; @&gt; &#39;&#34;HDMI&#34;&#39;;

-- 键存在检查
SELECT * FROM products WHERE attrs ? &#39;weight_kg&#39;;

-- 任一键存在
SELECT * FROM products WHERE attrs ?| array[&#39;weight_kg&#39;, &#39;battery&#39;];</code></pre>
<h3>修改 JSON</h3>
<pre><code class="language-sql">-- 更新字段
UPDATE products SET attrs = jsonb_set(attrs, &#39;{ram}&#39;, &#39;32&#39;) WHERE name = &#39;MacBook Pro&#39;;

-- 添加新字段
UPDATE products SET attrs = attrs || &#39;{&#34;warranty&#34;: &#34;3 years&#34;}&#39; WHERE name = &#39;MacBook Pro&#39;;

-- 删除字段
UPDATE products SET attrs = attrs - &#39;weight_kg&#39; WHERE name = &#39;ThinkPad X1&#39;;

-- 删除嵌套路径
UPDATE products SET attrs = attrs #- &#39;{ports,2}&#39;;

-- 深层更新
UPDATE products SET attrs = jsonb_set(attrs, &#39;{specs,resolution}&#39;, &#39;&#34;2560x1600&#34;&#39;);</code></pre>
<h2>索引</h2>
<p>JSONB 索引是查询性能的关键：</p>
<pre><code class="language-sql">-- GIN 索引（支持 @&gt;, ?, ?| 等操作符）
CREATE INDEX idx_products_attrs ON products USING GIN (attrs);

-- 表达式索引（针对特定字段）
CREATE INDEX idx_products_brand ON products ((attrs-&gt;&gt;&#39;brand&#39;));
CREATE INDEX idx_products_ram ON products (((attrs-&gt;&gt;&#39;ram&#39;)::int));

-- 路径索引（jsonb_path_ops 更小更快，但只支持 @&gt;）
CREATE INDEX idx_products_attrs_path ON products USING GIN (attrs jsonb_path_ops);</code></pre>
<h3>索引选择指南</h3>
<table>
<thead><tr><th>查询模式</th><th>推荐索引</th></tr></thead>
<tbody>
<tr><td><code>attrs @&gt; &#39;{&#34;brand&#34;: &#34;Apple&#34;}&#39;</code></td><td>GIN (jsonb_path_ops)</td></tr>
<tr><td><code>attrs-&gt;&gt;&#39;brand&#39; = &#39;Apple&#39;</code></td><td>表达式索引 (btree)</td></tr>
<tr><td><code>attrs ? &#39;weight_kg&#39;</code></td><td>GIN (默认)</td></tr>
<tr><td><code>(attrs-&gt;&gt;&#39;ram&#39;)::int &gt; 16</code></td><td>表达式索引 (btree)</td></tr>
</tbody>
</table>
<h2>JSON 函数</h2>
<pre><code class="language-sql">-- 展开对象为键值对
SELECT * FROM jsonb_each(&#39;{&#34;a&#34;:1,&#34;b&#34;:2}&#39;);
-- key | value
-- a   | 1
-- b   | 2

-- 展开数组
SELECT * FROM jsonb_array_elements(&#39;[&#34;a&#34;,&#34;b&#34;,&#34;c&#34;]&#39;);

-- 聚合为 JSON 数组
SELECT jsonb_agg(name) FROM products WHERE price &gt; 10000;

-- 聚合为 JSON 对象
SELECT jsonb_object_agg(name, price) FROM products;

-- 获取所有键
SELECT DISTINCT jsonb_object_keys(attrs) AS key FROM products;

-- 统计各品牌数量
SELECT attrs-&gt;&gt;&#39;brand&#39; AS brand, COUNT(*)
FROM products
GROUP BY attrs-&gt;&gt;&#39;brand&#39;
ORDER BY COUNT(*) DESC;</code></pre>
<h2>JSONPath（PostgreSQL 12+）</h2>
<pre><code class="language-sql">-- 查找 RAM &gt;= 16 的产品
SELECT * FROM products WHERE attrs @? &#39;$.ram ? (@ &gt;= 16)&#39;;

-- 提取所有 USB-C 端口
SELECT jsonb_path_query(attrs, &#39;$.ports[*] ? (@ starts with &#34;USB&#34;)&#39;) FROM products;

-- 返回第一个匹配
SELECT jsonb_path_query_first(attrs, &#39;$.ports[0]&#39;) FROM products;</code></pre>
<h2>实战模式</h2>
<h3>用户设置</h3>
<pre><code class="language-sql">CREATE TABLE user_settings (
    user_id INT PRIMARY KEY REFERENCES users(id),
    settings JSONB DEFAULT &#39;{
        &#34;theme&#34;: &#34;light&#34;,
        &#34;language&#34;: &#34;zh-CN&#34;,
        &#34;notifications&#34;: {&#34;email&#34;: true, &#34;push&#34;: true}
    }&#39;
);

-- 更新单个设置
UPDATE user_settings
SET settings = jsonb_set(settings, &#39;{theme}&#39;, &#39;&#34;dark&#34;&#39;)
WHERE user_id = 1;

-- 读取特定设置
SELECT settings-&gt;&gt;&#39;theme&#39; FROM user_settings WHERE user_id = 1;</code></pre>
<h3>事件日志</h3>
<pre><code class="language-sql">CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_type ON events (event_type, created_at);
CREATE INDEX idx_events_payload ON events USING GIN (payload);

-- 查询特定用户的购买事件
SELECT * FROM events
WHERE event_type = &#39;purchase&#39;
  AND payload @&gt; &#39;{&#34;user_id&#34;: 123}&#39;
ORDER BY created_at DESC;</code></pre>
<h2>小结</h2>
<ul>
<li>PostgreSQL JSONB 结合了关系型数据库的可靠性和文档存储的灵活性</li>
<li>几乎总是选 JSONB 而非 JSON</li>
<li><code>-&gt;</code> 提取 JSON 值，<code>-&gt;&gt;</code> 提取文本值，<code>@&gt;</code> 包含查询</li>
<li>GIN 索引是 JSONB 查询性能的关键</li>
<li>适合用户设置、产品属性、事件日志等半结构化数据</li>
</ul>
`
};

window.LEARN_ARTICLES["elasticsearch-json"] = {
zh: `<h1>Elasticsearch 与 JSON：搜索引擎实战</h1>
<h2>Elasticsearch 与 JSON</h2>
<p>Elasticsearch 是一个分布式搜索和分析引擎，它的核心就是 JSON：文档用 JSON 存储，查询用 JSON DSL 表达，结果以 JSON 返回。理解 JSON 就等于理解了 Elasticsearch 的大部分 API。</p>
<h2>文档 CRUD</h2>
<h3>索引文档</h3>
<pre><code class="language-bash"># 创建/更新文档（指定 ID）
PUT /products/_doc/1
{
  &#34;name&#34;: &#34;机械键盘&#34;,
  &#34;brand&#34;: &#34;Cherry&#34;,
  &#34;price&#34;: 599.00,
  &#34;description&#34;: &#34;Cherry MX 红轴机械键盘，87键紧凑布局&#34;,
  &#34;tags&#34;: [&#34;键盘&#34;, &#34;机械&#34;, &#34;Cherry&#34;],
  &#34;specs&#34;: {
    &#34;switches&#34;: &#34;MX Red&#34;,
    &#34;keys&#34;: 87,
    &#34;backlight&#34;: true
  },
  &#34;created_at&#34;: &#34;2025-01-15T10:00:00Z&#34;
}

# 自动生成 ID
POST /products/_doc
{
  &#34;name&#34;: &#34;无线鼠标&#34;,
  &#34;brand&#34;: &#34;Logitech&#34;,
  &#34;price&#34;: 299.00
}</code></pre>
<h3>查询文档</h3>
<pre><code class="language-bash"># 按 ID 查询
GET /products/_doc/1

# 简单搜索
GET /products/_search
{
  &#34;query&#34;: {
    &#34;match&#34;: { &#34;description&#34;: &#34;机械键盘&#34; }
  }
}</code></pre>
<h3>更新文档</h3>
<pre><code class="language-bash"># 部分更新
POST /products/_update/1
{
  &#34;doc&#34;: {
    &#34;price&#34;: 549.00,
    &#34;tags&#34;: [&#34;键盘&#34;, &#34;机械&#34;, &#34;Cherry&#34;, &#34;特价&#34;]
  }
}

# 脚本更新
POST /products/_update/1
{
  &#34;script&#34;: {
    &#34;source&#34;: &#34;ctx._source.price -= params.discount&#34;,
    &#34;params&#34;: { &#34;discount&#34;: 50 }
  }
}</code></pre>
<h3>删除文档</h3>
<pre><code class="language-bash">DELETE /products/_doc/1</code></pre>
<h2>查询 DSL</h2>
<p>Elasticsearch 的查询 DSL 是一套强大的 JSON 查询语言：</p>
<h3>全文搜索</h3>
<pre><code class="language-json">{
  &#34;query&#34;: {
    &#34;bool&#34;: {
      &#34;must&#34;: [
        { &#34;match&#34;: { &#34;description&#34;: &#34;机械键盘 红轴&#34; } }
      ],
      &#34;filter&#34;: [
        { &#34;range&#34;: { &#34;price&#34;: { &#34;gte&#34;: 200, &#34;lte&#34;: 1000 } } },
        { &#34;term&#34;: { &#34;brand&#34;: &#34;Cherry&#34; } }
      ],
      &#34;should&#34;: [
        { &#34;match&#34;: { &#34;tags&#34;: &#34;特价&#34; } }
      ],
      &#34;must_not&#34;: [
        { &#34;term&#34;: { &#34;specs.backlight&#34;: false } }
      ]
    }
  },
  &#34;sort&#34;: [
    { &#34;price&#34;: &#34;asc&#34; },
    &#34;_score&#34;
  ],
  &#34;from&#34;: 0,
  &#34;size&#34;: 20
}</code></pre>
<p>查询类型解读：</p>
<ul>
<li><code>must</code>：必须匹配，影响评分</li>
<li><code>filter</code>：必须匹配，不影响评分（更快，可缓存）</li>
<li><code>should</code>：可选匹配，匹配则加分</li>
<li><code>must_not</code>：必须不匹配</li>
</ul>
<h3>聚合分析</h3>
<pre><code class="language-json">{
  &#34;size&#34;: 0,
  &#34;aggs&#34;: {
    &#34;brand_stats&#34;: {
      &#34;terms&#34;: { &#34;field&#34;: &#34;brand.keyword&#34;, &#34;size&#34;: 10 },
      &#34;aggs&#34;: {
        &#34;avg_price&#34;: { &#34;avg&#34;: { &#34;field&#34;: &#34;price&#34; } },
        &#34;price_range&#34;: {
          &#34;stats&#34;: { &#34;field&#34;: &#34;price&#34; }
        }
      }
    },
    &#34;price_histogram&#34;: {
      &#34;histogram&#34;: {
        &#34;field&#34;: &#34;price&#34;,
        &#34;interval&#34;: 200
      }
    }
  }
}</code></pre>
<h3>高亮显示</h3>
<pre><code class="language-json">{
  &#34;query&#34;: { &#34;match&#34;: { &#34;description&#34;: &#34;机械键盘&#34; } },
  &#34;highlight&#34;: {
    &#34;pre_tags&#34;: [&#34;&lt;em&gt;&#34;],
    &#34;post_tags&#34;: [&#34;&lt;/em&gt;&#34;],
    &#34;fields&#34;: {
      &#34;description&#34;: {}
    }
  }
}</code></pre>
<h2>Mapping（Schema 定义）</h2>
<pre><code class="language-json">PUT /products
{
  &#34;mappings&#34;: {
    &#34;properties&#34;: {
      &#34;name&#34;: { &#34;type&#34;: &#34;text&#34;, &#34;analyzer&#34;: &#34;ik_max_word&#34; },
      &#34;brand&#34;: {
        &#34;type&#34;: &#34;text&#34;,
        &#34;fields&#34;: { &#34;keyword&#34;: { &#34;type&#34;: &#34;keyword&#34; } }
      },
      &#34;price&#34;: { &#34;type&#34;: &#34;float&#34; },
      &#34;description&#34;: { &#34;type&#34;: &#34;text&#34;, &#34;analyzer&#34;: &#34;ik_smart&#34; },
      &#34;tags&#34;: { &#34;type&#34;: &#34;keyword&#34; },
      &#34;specs&#34;: {
        &#34;type&#34;: &#34;object&#34;,
        &#34;properties&#34;: {
          &#34;switches&#34;: { &#34;type&#34;: &#34;keyword&#34; },
          &#34;keys&#34;: { &#34;type&#34;: &#34;integer&#34; },
          &#34;backlight&#34;: { &#34;type&#34;: &#34;boolean&#34; }
        }
      },
      &#34;created_at&#34;: { &#34;type&#34;: &#34;date&#34; }
    }
  }
}</code></pre>
<p>关键类型：</p>
<ul>
<li><code>text</code>：全文搜索（分词）</li>
<li><code>keyword</code>：精确匹配（不分词）</li>
<li><code>object</code>：嵌套 JSON 对象</li>
<li><code>nested</code>：独立的嵌套文档（支持跨字段查询）</li>
</ul>
<h2>各语言客户端</h2>
<h3>Python</h3>
<pre><code class="language-python">from elasticsearch import Elasticsearch

es = Elasticsearch(&#34;http://localhost:9200&#34;)

# 索引文档
es.index(index=&#34;products&#34;, id=1, document={
    &#34;name&#34;: &#34;机械键盘&#34;,
    &#34;brand&#34;: &#34;Cherry&#34;,
    &#34;price&#34;: 599.00
})

# 搜索
result = es.search(index=&#34;products&#34;, query={
    &#34;match&#34;: {&#34;name&#34;: &#34;键盘&#34;}
})
for hit in result[&#34;hits&#34;][&#34;hits&#34;]:
    print(f&#34;{hit[&#39;_source&#39;][&#39;name&#39;]}: {hit[&#39;_score&#39;]}&#34;)</code></pre>
<h3>JavaScript</h3>
<pre><code class="language-javascript">const { Client } = require(&#34;@elastic/elasticsearch&#34;);
const client = new Client({ node: &#34;http://localhost:9200&#34; });

// 搜索
const result = await client.search({
  index: &#34;products&#34;,
  query: { match: { name: &#34;键盘&#34; } }
});
result.hits.hits.forEach(hit =&gt; {
  console.log(hit._source.name, hit._score);
});</code></pre>
<h2>小结</h2>
<ul>
<li>Elasticsearch 全面使用 JSON：文档存储、查询 DSL、API 交互</li>
<li>查询 DSL 中 <code>bool</code> 查询的四种子句覆盖绝大多数搜索场景</li>
<li><code>filter</code> 比 <code>must</code> 更快（不计算评分，可缓存）</li>
<li>Mapping 定义文档结构，<code>text</code> 用于全文搜索，<code>keyword</code> 用于精确匹配</li>
<li>聚合功能强大，可用于统计分析和数据可视化</li>
</ul>
`,
en: `<h1>Elasticsearch 与 JSON：搜索引擎实战</h1>
<h2>Elasticsearch 与 JSON</h2>
<p>Elasticsearch 是一个分布式搜索和分析引擎，它的核心就是 JSON：文档用 JSON 存储，查询用 JSON DSL 表达，结果以 JSON 返回。理解 JSON 就等于理解了 Elasticsearch 的大部分 API。</p>
<h2>文档 CRUD</h2>
<h3>索引文档</h3>
<pre><code class="language-bash"># 创建/更新文档（指定 ID）
PUT /products/_doc/1
{
  &#34;name&#34;: &#34;机械键盘&#34;,
  &#34;brand&#34;: &#34;Cherry&#34;,
  &#34;price&#34;: 599.00,
  &#34;description&#34;: &#34;Cherry MX 红轴机械键盘，87键紧凑布局&#34;,
  &#34;tags&#34;: [&#34;键盘&#34;, &#34;机械&#34;, &#34;Cherry&#34;],
  &#34;specs&#34;: {
    &#34;switches&#34;: &#34;MX Red&#34;,
    &#34;keys&#34;: 87,
    &#34;backlight&#34;: true
  },
  &#34;created_at&#34;: &#34;2025-01-15T10:00:00Z&#34;
}

# 自动生成 ID
POST /products/_doc
{
  &#34;name&#34;: &#34;无线鼠标&#34;,
  &#34;brand&#34;: &#34;Logitech&#34;,
  &#34;price&#34;: 299.00
}</code></pre>
<h3>查询文档</h3>
<pre><code class="language-bash"># 按 ID 查询
GET /products/_doc/1

# 简单搜索
GET /products/_search
{
  &#34;query&#34;: {
    &#34;match&#34;: { &#34;description&#34;: &#34;机械键盘&#34; }
  }
}</code></pre>
<h3>更新文档</h3>
<pre><code class="language-bash"># 部分更新
POST /products/_update/1
{
  &#34;doc&#34;: {
    &#34;price&#34;: 549.00,
    &#34;tags&#34;: [&#34;键盘&#34;, &#34;机械&#34;, &#34;Cherry&#34;, &#34;特价&#34;]
  }
}

# 脚本更新
POST /products/_update/1
{
  &#34;script&#34;: {
    &#34;source&#34;: &#34;ctx._source.price -= params.discount&#34;,
    &#34;params&#34;: { &#34;discount&#34;: 50 }
  }
}</code></pre>
<h3>删除文档</h3>
<pre><code class="language-bash">DELETE /products/_doc/1</code></pre>
<h2>查询 DSL</h2>
<p>Elasticsearch 的查询 DSL 是一套强大的 JSON 查询语言：</p>
<h3>全文搜索</h3>
<pre><code class="language-json">{
  &#34;query&#34;: {
    &#34;bool&#34;: {
      &#34;must&#34;: [
        { &#34;match&#34;: { &#34;description&#34;: &#34;机械键盘 红轴&#34; } }
      ],
      &#34;filter&#34;: [
        { &#34;range&#34;: { &#34;price&#34;: { &#34;gte&#34;: 200, &#34;lte&#34;: 1000 } } },
        { &#34;term&#34;: { &#34;brand&#34;: &#34;Cherry&#34; } }
      ],
      &#34;should&#34;: [
        { &#34;match&#34;: { &#34;tags&#34;: &#34;特价&#34; } }
      ],
      &#34;must_not&#34;: [
        { &#34;term&#34;: { &#34;specs.backlight&#34;: false } }
      ]
    }
  },
  &#34;sort&#34;: [
    { &#34;price&#34;: &#34;asc&#34; },
    &#34;_score&#34;
  ],
  &#34;from&#34;: 0,
  &#34;size&#34;: 20
}</code></pre>
<p>查询类型解读：</p>
<ul>
<li><code>must</code>：必须匹配，影响评分</li>
<li><code>filter</code>：必须匹配，不影响评分（更快，可缓存）</li>
<li><code>should</code>：可选匹配，匹配则加分</li>
<li><code>must_not</code>：必须不匹配</li>
</ul>
<h3>聚合分析</h3>
<pre><code class="language-json">{
  &#34;size&#34;: 0,
  &#34;aggs&#34;: {
    &#34;brand_stats&#34;: {
      &#34;terms&#34;: { &#34;field&#34;: &#34;brand.keyword&#34;, &#34;size&#34;: 10 },
      &#34;aggs&#34;: {
        &#34;avg_price&#34;: { &#34;avg&#34;: { &#34;field&#34;: &#34;price&#34; } },
        &#34;price_range&#34;: {
          &#34;stats&#34;: { &#34;field&#34;: &#34;price&#34; }
        }
      }
    },
    &#34;price_histogram&#34;: {
      &#34;histogram&#34;: {
        &#34;field&#34;: &#34;price&#34;,
        &#34;interval&#34;: 200
      }
    }
  }
}</code></pre>
<h3>高亮显示</h3>
<pre><code class="language-json">{
  &#34;query&#34;: { &#34;match&#34;: { &#34;description&#34;: &#34;机械键盘&#34; } },
  &#34;highlight&#34;: {
    &#34;pre_tags&#34;: [&#34;&lt;em&gt;&#34;],
    &#34;post_tags&#34;: [&#34;&lt;/em&gt;&#34;],
    &#34;fields&#34;: {
      &#34;description&#34;: {}
    }
  }
}</code></pre>
<h2>Mapping（Schema 定义）</h2>
<pre><code class="language-json">PUT /products
{
  &#34;mappings&#34;: {
    &#34;properties&#34;: {
      &#34;name&#34;: { &#34;type&#34;: &#34;text&#34;, &#34;analyzer&#34;: &#34;ik_max_word&#34; },
      &#34;brand&#34;: {
        &#34;type&#34;: &#34;text&#34;,
        &#34;fields&#34;: { &#34;keyword&#34;: { &#34;type&#34;: &#34;keyword&#34; } }
      },
      &#34;price&#34;: { &#34;type&#34;: &#34;float&#34; },
      &#34;description&#34;: { &#34;type&#34;: &#34;text&#34;, &#34;analyzer&#34;: &#34;ik_smart&#34; },
      &#34;tags&#34;: { &#34;type&#34;: &#34;keyword&#34; },
      &#34;specs&#34;: {
        &#34;type&#34;: &#34;object&#34;,
        &#34;properties&#34;: {
          &#34;switches&#34;: { &#34;type&#34;: &#34;keyword&#34; },
          &#34;keys&#34;: { &#34;type&#34;: &#34;integer&#34; },
          &#34;backlight&#34;: { &#34;type&#34;: &#34;boolean&#34; }
        }
      },
      &#34;created_at&#34;: { &#34;type&#34;: &#34;date&#34; }
    }
  }
}</code></pre>
<p>关键类型：</p>
<ul>
<li><code>text</code>：全文搜索（分词）</li>
<li><code>keyword</code>：精确匹配（不分词）</li>
<li><code>object</code>：嵌套 JSON 对象</li>
<li><code>nested</code>：独立的嵌套文档（支持跨字段查询）</li>
</ul>
<h2>各语言客户端</h2>
<h3>Python</h3>
<pre><code class="language-python">from elasticsearch import Elasticsearch

es = Elasticsearch(&#34;http://localhost:9200&#34;)

# 索引文档
es.index(index=&#34;products&#34;, id=1, document={
    &#34;name&#34;: &#34;机械键盘&#34;,
    &#34;brand&#34;: &#34;Cherry&#34;,
    &#34;price&#34;: 599.00
})

# 搜索
result = es.search(index=&#34;products&#34;, query={
    &#34;match&#34;: {&#34;name&#34;: &#34;键盘&#34;}
})
for hit in result[&#34;hits&#34;][&#34;hits&#34;]:
    print(f&#34;{hit[&#39;_source&#39;][&#39;name&#39;]}: {hit[&#39;_score&#39;]}&#34;)</code></pre>
<h3>JavaScript</h3>
<pre><code class="language-javascript">const { Client } = require(&#34;@elastic/elasticsearch&#34;);
const client = new Client({ node: &#34;http://localhost:9200&#34; });

// 搜索
const result = await client.search({
  index: &#34;products&#34;,
  query: { match: { name: &#34;键盘&#34; } }
});
result.hits.hits.forEach(hit =&gt; {
  console.log(hit._source.name, hit._score);
});</code></pre>
<h2>小结</h2>
<ul>
<li>Elasticsearch 全面使用 JSON：文档存储、查询 DSL、API 交互</li>
<li>查询 DSL 中 <code>bool</code> 查询的四种子句覆盖绝大多数搜索场景</li>
<li><code>filter</code> 比 <code>must</code> 更快（不计算评分，可缓存）</li>
<li>Mapping 定义文档结构，<code>text</code> 用于全文搜索，<code>keyword</code> 用于精确匹配</li>
<li>聚合功能强大，可用于统计分析和数据可视化</li>
</ul>
`
};

window.LEARN_ARTICLES["rest-api-json"] = {
zh: `<h1>REST API 中的 JSON 最佳实践</h1>
<h2>JSON 是 REST API 的标准语言</h2>
<p>现代 REST API 几乎都使用 JSON 作为数据交换格式。一个设计良好的 JSON API 应该一致、直觉、易于使用。</p>
<h2>请求与响应规范</h2>
<h3>Content-Type</h3>
<pre><code class="language-http"># 请求
POST /api/users
Content-Type: application/json

# 响应
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8</code></pre>
<p>始终使用 <code>application/json</code>，不要用 <code>text/json</code> 或 <code>text/plain</code>。</p>
<h3>命名风格</h3>
<pre><code class="language-json">// ✓ camelCase（JavaScript 社区主流）
{ &#34;firstName&#34;: &#34;Alice&#34;, &#34;lastName&#34;: &#34;Chen&#34;, &#34;createdAt&#34;: &#34;2025-01-15T08:00:00Z&#34; }

// ✓ snake_case（Python/Ruby 社区主流）
{ &#34;first_name&#34;: &#34;Alice&#34;, &#34;last_name&#34;: &#34;Chen&#34;, &#34;created_at&#34;: &#34;2025-01-15T08:00:00Z&#34; }</code></pre>
<p>选择一种风格，全项目统一，不要混用。</p>
<h2>成功响应设计</h2>
<h3>单个资源</h3>
<pre><code class="language-json">// GET /api/users/123
{
  &#34;id&#34;: 123,
  &#34;name&#34;: &#34;Alice&#34;,
  &#34;email&#34;: &#34;alice@example.com&#34;,
  &#34;role&#34;: &#34;admin&#34;,
  &#34;createdAt&#34;: &#34;2025-01-15T08:00:00Z&#34;
}</code></pre>
<h3>集合资源（带分页）</h3>
<pre><code class="language-json">// GET /api/users?page=2&amp;pageSize=20
{
  &#34;data&#34;: [
    { &#34;id&#34;: 123, &#34;name&#34;: &#34;Alice&#34;, &#34;email&#34;: &#34;alice@example.com&#34; },
    { &#34;id&#34;: 124, &#34;name&#34;: &#34;Bob&#34;, &#34;email&#34;: &#34;bob@example.com&#34; }
  ],
  &#34;pagination&#34;: {
    &#34;page&#34;: 2,
    &#34;pageSize&#34;: 20,
    &#34;total&#34;: 156,
    &#34;totalPages&#34;: 8
  }
}</code></pre>
<blockquote><p>集合响应始终用对象包裹，不要直接返回数组。这样方便后续扩展元数据。</p></blockquote>
<h3>创建资源</h3>
<pre><code class="language-http">POST /api/users
Content-Type: application/json

{ &#34;name&#34;: &#34;Carol&#34;, &#34;email&#34;: &#34;carol@example.com&#34; }</code></pre>
<pre><code class="language-http">HTTP/1.1 201 Created
Location: /api/users/125
Content-Type: application/json

{ &#34;id&#34;: 125, &#34;name&#34;: &#34;Carol&#34;, &#34;email&#34;: &#34;carol@example.com&#34;, &#34;createdAt&#34;: &#34;2025-01-15T10:30:00Z&#34; }</code></pre>
<h2>错误响应设计</h2>
<h3>统一错误格式</h3>
<pre><code class="language-json">// 400 Bad Request
{
  &#34;error&#34;: {
    &#34;code&#34;: &#34;VALIDATION_ERROR&#34;,
    &#34;message&#34;: &#34;请求参数验证失败&#34;,
    &#34;details&#34;: [
      { &#34;field&#34;: &#34;email&#34;, &#34;message&#34;: &#34;邮箱格式不正确&#34; },
      { &#34;field&#34;: &#34;age&#34;, &#34;message&#34;: &#34;年龄必须大于 0&#34; }
    ]
  }
}

// 404 Not Found
{
  &#34;error&#34;: {
    &#34;code&#34;: &#34;NOT_FOUND&#34;,
    &#34;message&#34;: &#34;用户 ID 999 不存在&#34;
  }
}

// 401 Unauthorized
{
  &#34;error&#34;: {
    &#34;code&#34;: &#34;UNAUTHORIZED&#34;,
    &#34;message&#34;: &#34;认证令牌已过期&#34;
  }
}

// 500 Internal Server Error
{
  &#34;error&#34;: {
    &#34;code&#34;: &#34;INTERNAL_ERROR&#34;,
    &#34;message&#34;: &#34;服务器内部错误，请稍后重试&#34;,
    &#34;requestId&#34;: &#34;req_abc123&#34;
  }
}</code></pre>
<h3>错误码映射</h3>
<table>
<thead><tr><th>HTTP 状态码</th><th>含义</th><th>使用场景</th></tr></thead>
<tbody>
<tr><td>400</td><td>Bad Request</td><td>参数验证失败</td></tr>
<tr><td>401</td><td>Unauthorized</td><td>未认证</td></tr>
<tr><td>403</td><td>Forbidden</td><td>权限不足</td></tr>
<tr><td>404</td><td>Not Found</td><td>资源不存在</td></tr>
<tr><td>409</td><td>Conflict</td><td>资源冲突（如重复创建）</td></tr>
<tr><td>422</td><td>Unprocessable Entity</td><td>语义错误</td></tr>
<tr><td>429</td><td>Too Many Requests</td><td>限流</td></tr>
<tr><td>500</td><td>Internal Server Error</td><td>服务端错误</td></tr>
</tbody>
</table>
<h2>日期和时间</h2>
<pre><code class="language-json">// ✓ ISO 8601 格式（UTC）
{ &#34;createdAt&#34;: &#34;2025-01-15T08:30:00Z&#34; }

// ✓ 带时区偏移
{ &#34;createdAt&#34;: &#34;2025-01-15T16:30:00+08:00&#34; }

// ✗ 避免使用
{ &#34;createdAt&#34;: &#34;2025/01/15 08:30:00&#34; }
{ &#34;createdAt&#34;: 1736928600 }  // Unix 时间戳不直观</code></pre>
<p>始终使用 ISO 8601 格式，优先 UTC 时间（<code>Z</code> 后缀）。</p>
<h2>空值处理</h2>
<pre><code class="language-json">// 方式一：字段存在但值为 null
{ &#34;name&#34;: &#34;Alice&#34;, &#34;bio&#34;: null }

// 方式二：不包含该字段
{ &#34;name&#34;: &#34;Alice&#34; }</code></pre>
<p>选择一种方式并保持一致。通常建议：</p>
<ul>
<li>显式 <code>null</code>：表示"字段存在但没有值"</li>
<li>省略字段：表示"使用默认值"或"不关心此字段"</li>
</ul>
<h2>版本控制</h2>
<pre><code class="language-http"># 方式一：URL 路径（最常见）
GET /api/v1/users
GET /api/v2/users

# 方式二：请求头
GET /api/users
Accept: application/vnd.myapp.v2+json

# 方式三：查询参数
GET /api/users?version=2</code></pre>
<p>推荐 URL 路径方式，直观明了。</p>
<h2>过滤、排序和字段选择</h2>
<pre><code class="language-http"># 过滤
GET /api/products?category=electronics&amp;price_min=100&amp;price_max=500

# 排序
GET /api/products?sort=price,-createdAt

# 字段选择
GET /api/products?fields=id,name,price

# 搜索
GET /api/products?q=mechanical+keyboard</code></pre>
<h2>HATEOAS（超媒体链接）</h2>
<pre><code class="language-json">{
  &#34;id&#34;: 123,
  &#34;name&#34;: &#34;Alice&#34;,
  &#34;email&#34;: &#34;alice@example.com&#34;,
  &#34;_links&#34;: {
    &#34;self&#34;: { &#34;href&#34;: &#34;/api/users/123&#34; },
    &#34;orders&#34;: { &#34;href&#34;: &#34;/api/users/123/orders&#34; },
    &#34;avatar&#34;: { &#34;href&#34;: &#34;/api/users/123/avatar&#34; }
  }
}</code></pre>
<h2>设计清单</h2>
<table>
<thead><tr><th>维度</th><th>建议</th></tr></thead>
<tbody>
<tr><td>Content-Type</td><td>始终 <code>application/json</code></td></tr>
<tr><td>命名风格</td><td>全局统一 camelCase 或 snake_case</td></tr>
<tr><td>集合响应</td><td>用对象包裹，不直接返回数组</td></tr>
<tr><td>分页</td><td>包含 page、total 等元数据</td></tr>
<tr><td>错误格式</td><td>统一的 error 结构，含 code 和 message</td></tr>
<tr><td>日期格式</td><td>ISO 8601</td></tr>
<tr><td>版本控制</td><td>URL 路径或请求头</td></tr>
<tr><td>空值</td><td>null 或省略，保持一致</td></tr>
</tbody>
</table>
<h2>小结</h2>
<ul>
<li>使用 <code>application/json</code> Content-Type，统一命名风格</li>
<li>集合用对象包裹并带分页元数据，不直接返回数组</li>
<li>统一错误响应格式，包含错误码、消息和请求 ID</li>
<li>日期使用 ISO 8601 格式</li>
<li>HTTP 状态码表达语义，不要所有响应都返回 200</li>
</ul>
`,
en: `<h1>REST API 中的 JSON 最佳实践</h1>
<h2>JSON 是 REST API 的标准语言</h2>
<p>现代 REST API 几乎都使用 JSON 作为数据交换格式。一个设计良好的 JSON API 应该一致、直觉、易于使用。</p>
<h2>请求与响应规范</h2>
<h3>Content-Type</h3>
<pre><code class="language-http"># 请求
POST /api/users
Content-Type: application/json

# 响应
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8</code></pre>
<p>始终使用 <code>application/json</code>，不要用 <code>text/json</code> 或 <code>text/plain</code>。</p>
<h3>命名风格</h3>
<pre><code class="language-json">// ✓ camelCase（JavaScript 社区主流）
{ &#34;firstName&#34;: &#34;Alice&#34;, &#34;lastName&#34;: &#34;Chen&#34;, &#34;createdAt&#34;: &#34;2025-01-15T08:00:00Z&#34; }

// ✓ snake_case（Python/Ruby 社区主流）
{ &#34;first_name&#34;: &#34;Alice&#34;, &#34;last_name&#34;: &#34;Chen&#34;, &#34;created_at&#34;: &#34;2025-01-15T08:00:00Z&#34; }</code></pre>
<p>选择一种风格，全项目统一，不要混用。</p>
<h2>成功响应设计</h2>
<h3>单个资源</h3>
<pre><code class="language-json">// GET /api/users/123
{
  &#34;id&#34;: 123,
  &#34;name&#34;: &#34;Alice&#34;,
  &#34;email&#34;: &#34;alice@example.com&#34;,
  &#34;role&#34;: &#34;admin&#34;,
  &#34;createdAt&#34;: &#34;2025-01-15T08:00:00Z&#34;
}</code></pre>
<h3>集合资源（带分页）</h3>
<pre><code class="language-json">// GET /api/users?page=2&amp;pageSize=20
{
  &#34;data&#34;: [
    { &#34;id&#34;: 123, &#34;name&#34;: &#34;Alice&#34;, &#34;email&#34;: &#34;alice@example.com&#34; },
    { &#34;id&#34;: 124, &#34;name&#34;: &#34;Bob&#34;, &#34;email&#34;: &#34;bob@example.com&#34; }
  ],
  &#34;pagination&#34;: {
    &#34;page&#34;: 2,
    &#34;pageSize&#34;: 20,
    &#34;total&#34;: 156,
    &#34;totalPages&#34;: 8
  }
}</code></pre>
<blockquote><p>集合响应始终用对象包裹，不要直接返回数组。这样方便后续扩展元数据。</p></blockquote>
<h3>创建资源</h3>
<pre><code class="language-http">POST /api/users
Content-Type: application/json

{ &#34;name&#34;: &#34;Carol&#34;, &#34;email&#34;: &#34;carol@example.com&#34; }</code></pre>
<pre><code class="language-http">HTTP/1.1 201 Created
Location: /api/users/125
Content-Type: application/json

{ &#34;id&#34;: 125, &#34;name&#34;: &#34;Carol&#34;, &#34;email&#34;: &#34;carol@example.com&#34;, &#34;createdAt&#34;: &#34;2025-01-15T10:30:00Z&#34; }</code></pre>
<h2>错误响应设计</h2>
<h3>统一错误格式</h3>
<pre><code class="language-json">// 400 Bad Request
{
  &#34;error&#34;: {
    &#34;code&#34;: &#34;VALIDATION_ERROR&#34;,
    &#34;message&#34;: &#34;请求参数验证失败&#34;,
    &#34;details&#34;: [
      { &#34;field&#34;: &#34;email&#34;, &#34;message&#34;: &#34;邮箱格式不正确&#34; },
      { &#34;field&#34;: &#34;age&#34;, &#34;message&#34;: &#34;年龄必须大于 0&#34; }
    ]
  }
}

// 404 Not Found
{
  &#34;error&#34;: {
    &#34;code&#34;: &#34;NOT_FOUND&#34;,
    &#34;message&#34;: &#34;用户 ID 999 不存在&#34;
  }
}

// 401 Unauthorized
{
  &#34;error&#34;: {
    &#34;code&#34;: &#34;UNAUTHORIZED&#34;,
    &#34;message&#34;: &#34;认证令牌已过期&#34;
  }
}

// 500 Internal Server Error
{
  &#34;error&#34;: {
    &#34;code&#34;: &#34;INTERNAL_ERROR&#34;,
    &#34;message&#34;: &#34;服务器内部错误，请稍后重试&#34;,
    &#34;requestId&#34;: &#34;req_abc123&#34;
  }
}</code></pre>
<h3>错误码映射</h3>
<table>
<thead><tr><th>HTTP 状态码</th><th>含义</th><th>使用场景</th></tr></thead>
<tbody>
<tr><td>400</td><td>Bad Request</td><td>参数验证失败</td></tr>
<tr><td>401</td><td>Unauthorized</td><td>未认证</td></tr>
<tr><td>403</td><td>Forbidden</td><td>权限不足</td></tr>
<tr><td>404</td><td>Not Found</td><td>资源不存在</td></tr>
<tr><td>409</td><td>Conflict</td><td>资源冲突（如重复创建）</td></tr>
<tr><td>422</td><td>Unprocessable Entity</td><td>语义错误</td></tr>
<tr><td>429</td><td>Too Many Requests</td><td>限流</td></tr>
<tr><td>500</td><td>Internal Server Error</td><td>服务端错误</td></tr>
</tbody>
</table>
<h2>日期和时间</h2>
<pre><code class="language-json">// ✓ ISO 8601 格式（UTC）
{ &#34;createdAt&#34;: &#34;2025-01-15T08:30:00Z&#34; }

// ✓ 带时区偏移
{ &#34;createdAt&#34;: &#34;2025-01-15T16:30:00+08:00&#34; }

// ✗ 避免使用
{ &#34;createdAt&#34;: &#34;2025/01/15 08:30:00&#34; }
{ &#34;createdAt&#34;: 1736928600 }  // Unix 时间戳不直观</code></pre>
<p>始终使用 ISO 8601 格式，优先 UTC 时间（<code>Z</code> 后缀）。</p>
<h2>空值处理</h2>
<pre><code class="language-json">// 方式一：字段存在但值为 null
{ &#34;name&#34;: &#34;Alice&#34;, &#34;bio&#34;: null }

// 方式二：不包含该字段
{ &#34;name&#34;: &#34;Alice&#34; }</code></pre>
<p>选择一种方式并保持一致。通常建议：</p>
<ul>
<li>显式 <code>null</code>：表示"字段存在但没有值"</li>
<li>省略字段：表示"使用默认值"或"不关心此字段"</li>
</ul>
<h2>版本控制</h2>
<pre><code class="language-http"># 方式一：URL 路径（最常见）
GET /api/v1/users
GET /api/v2/users

# 方式二：请求头
GET /api/users
Accept: application/vnd.myapp.v2+json

# 方式三：查询参数
GET /api/users?version=2</code></pre>
<p>推荐 URL 路径方式，直观明了。</p>
<h2>过滤、排序和字段选择</h2>
<pre><code class="language-http"># 过滤
GET /api/products?category=electronics&amp;price_min=100&amp;price_max=500

# 排序
GET /api/products?sort=price,-createdAt

# 字段选择
GET /api/products?fields=id,name,price

# 搜索
GET /api/products?q=mechanical+keyboard</code></pre>
<h2>HATEOAS（超媒体链接）</h2>
<pre><code class="language-json">{
  &#34;id&#34;: 123,
  &#34;name&#34;: &#34;Alice&#34;,
  &#34;email&#34;: &#34;alice@example.com&#34;,
  &#34;_links&#34;: {
    &#34;self&#34;: { &#34;href&#34;: &#34;/api/users/123&#34; },
    &#34;orders&#34;: { &#34;href&#34;: &#34;/api/users/123/orders&#34; },
    &#34;avatar&#34;: { &#34;href&#34;: &#34;/api/users/123/avatar&#34; }
  }
}</code></pre>
<h2>设计清单</h2>
<table>
<thead><tr><th>维度</th><th>建议</th></tr></thead>
<tbody>
<tr><td>Content-Type</td><td>始终 <code>application/json</code></td></tr>
<tr><td>命名风格</td><td>全局统一 camelCase 或 snake_case</td></tr>
<tr><td>集合响应</td><td>用对象包裹，不直接返回数组</td></tr>
<tr><td>分页</td><td>包含 page、total 等元数据</td></tr>
<tr><td>错误格式</td><td>统一的 error 结构，含 code 和 message</td></tr>
<tr><td>日期格式</td><td>ISO 8601</td></tr>
<tr><td>版本控制</td><td>URL 路径或请求头</td></tr>
<tr><td>空值</td><td>null 或省略，保持一致</td></tr>
</tbody>
</table>
<h2>小结</h2>
<ul>
<li>使用 <code>application/json</code> Content-Type，统一命名风格</li>
<li>集合用对象包裹并带分页元数据，不直接返回数组</li>
<li>统一错误响应格式，包含错误码、消息和请求 ID</li>
<li>日期使用 ISO 8601 格式</li>
<li>HTTP 状态码表达语义，不要所有响应都返回 200</li>
</ul>
`
};

window.LEARN_ARTICLES["graphql-json"] = {
zh: `<h1>GraphQL 中的 JSON：灵活的数据查询</h1>
<h2>GraphQL vs REST</h2>
<p>REST API 常见的痛点：</p>
<ol>
<li><strong>过度获取</strong>：<code>GET /users/1</code> 返回 20 个字段，但你只需要 name 和 email</li>
<li><strong>获取不足</strong>：获取用户信息后，还要再请求 <code>/users/1/orders</code> 获取订单</li>
<li><strong>多次往返</strong>：一个页面需要调用 5-6 个 API 才能拿到所有数据</li>
</ol>
<p>GraphQL 用一个请求解决所有问题：<strong>客户端声明需要什么数据，服务端精确返回</strong>。</p>
<h2>基本查询</h2>
<h3>请求（JSON 包裹的 GraphQL 查询）</h3>
<pre><code class="language-json">{
  &#34;query&#34;: &#34;{ user(id: 123) { name email orders { id total } } }&#34;
}</code></pre>
<p>更可读的格式：</p>
<pre><code class="language-graphql">{
  user(id: 123) {
    name
    email
    orders {
      id
      total
      items {
        productName
        quantity
      }
    }
  }
}</code></pre>
<h3>响应（标准 JSON）</h3>
<pre><code class="language-json">{
  &#34;data&#34;: {
    &#34;user&#34;: {
      &#34;name&#34;: &#34;Alice&#34;,
      &#34;email&#34;: &#34;alice@example.com&#34;,
      &#34;orders&#34;: [
        {
          &#34;id&#34;: &#34;ORD-001&#34;,
          &#34;total&#34;: 299.00,
          &#34;items&#34;: [
            { &#34;productName&#34;: &#34;机械键盘&#34;, &#34;quantity&#34;: 1 }
          ]
        }
      ]
    }
  }
}</code></pre>
<p>一次请求，获取了用户信息 + 订单列表 + 订单商品详情。REST 需要 3 个请求。</p>
<h2>变更操作（Mutation）</h2>
<h3>请求</h3>
<pre><code class="language-json">{
  &#34;query&#34;: &#34;mutation { createUser(input: { name: \\&#34;Bob\\&#34;, email: \\&#34;bob@example.com\\&#34; }) { id name createdAt } }&#34;,
  &#34;variables&#34;: {}
}</code></pre>
<p>使用变量（推荐）：</p>
<pre><code class="language-json">{
  &#34;query&#34;: &#34;mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id name createdAt } }&#34;,
  &#34;variables&#34;: {
    &#34;input&#34;: {
      &#34;name&#34;: &#34;Bob&#34;,
      &#34;email&#34;: &#34;bob@example.com&#34;,
      &#34;role&#34;: &#34;editor&#34;
    }
  }
}</code></pre>
<h3>响应</h3>
<pre><code class="language-json">{
  &#34;data&#34;: {
    &#34;createUser&#34;: {
      &#34;id&#34;: &#34;125&#34;,
      &#34;name&#34;: &#34;Bob&#34;,
      &#34;createdAt&#34;: &#34;2025-01-15T10:30:00Z&#34;
    }
  }
}</code></pre>
<h2>错误处理</h2>
<p>GraphQL 错误和 REST 不同——即使有错误，HTTP 状态码通常仍是 200：</p>
<pre><code class="language-json">{
  &#34;data&#34;: {
    &#34;user&#34;: null
  },
  &#34;errors&#34;: [
    {
      &#34;message&#34;: &#34;用户不存在&#34;,
      &#34;locations&#34;: [{ &#34;line&#34;: 2, &#34;column&#34;: 3 }],
      &#34;path&#34;: [&#34;user&#34;],
      &#34;extensions&#34;: {
        &#34;code&#34;: &#34;NOT_FOUND&#34;,
        &#34;timestamp&#34;: &#34;2025-01-15T10:00:00Z&#34;
      }
    }
  ]
}</code></pre>
<p>部分成功的情况（某些字段返回了数据，某些出错）：</p>
<pre><code class="language-json">{
  &#34;data&#34;: {
    &#34;user&#34;: {
      &#34;name&#34;: &#34;Alice&#34;,
      &#34;email&#34;: &#34;alice@example.com&#34;,
      &#34;creditScore&#34;: null
    }
  },
  &#34;errors&#34;: [
    {
      &#34;message&#34;: &#34;信用评分服务暂时不可用&#34;,
      &#34;path&#34;: [&#34;user&#34;, &#34;creditScore&#34;],
      &#34;extensions&#34;: { &#34;code&#34;: &#34;SERVICE_UNAVAILABLE&#34; }
    }
  ]
}</code></pre>
<h2>实际代码示例</h2>
<h3>服务端（Node.js + Apollo Server）</h3>
<pre><code class="language-javascript">const { ApolloServer, gql } = require(&#34;apollo-server&#34;);

const typeDefs = gql\`
  type User {
    id: ID!
    name: String!
    email: String!
    orders: [Order!]!
  }

  type Order {
    id: ID!
    total: Float!
    status: String!
  }

  type Query {
    user(id: ID!): User
    users(page: Int, pageSize: Int): [User!]!
  }

  input CreateUserInput {
    name: String!
    email: String!
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
  }
\`;

const resolvers = {
  Query: {
    user: (_, { id }) =&gt; getUserById(id),
    users: (_, { page = 1, pageSize = 20 }) =&gt; getUsers(page, pageSize),
  },
  User: {
    orders: (user) =&gt; getOrdersByUserId(user.id), // 按需加载
  },
  Mutation: {
    createUser: (_, { input }) =&gt; createUser(input),
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
server.listen().then(({ url }) =&gt; console.log(\`Server at \${url}\`));</code></pre>
<h3>客户端请求</h3>
<pre><code class="language-javascript">async function fetchUser(userId) {
  const response = await fetch(&#34;/graphql&#34;, {
    method: &#34;POST&#34;,
    headers: { &#34;Content-Type&#34;: &#34;application/json&#34; },
    body: JSON.stringify({
      query: \`
        query GetUser($id: ID!) {
          user(id: $id) {
            name
            email
            orders {
              id
              total
              status
            }
          }
        }
      \`,
      variables: { id: userId }
    })
  });

  const { data, errors } = await response.json();
  if (errors) {
    console.error(&#34;GraphQL errors:&#34;, errors);
  }
  return data?.user;
}</code></pre>
<h2>GraphQL JSON 响应与 REST 对比</h2>
<table>
<thead><tr><th>维度</th><th>REST JSON</th><th>GraphQL JSON</th></tr></thead>
<tbody>
<tr><td>数据结构</td><td>服务端决定</td><td>客户端声明</td></tr>
<tr><td>过度获取</td><td>常见</td><td>不存在</td></tr>
<tr><td>多资源获取</td><td>多次请求</td><td>一次请求</td></tr>
<tr><td>错误格式</td><td>HTTP 状态码 + body</td><td>200 + errors 数组</td></tr>
<tr><td>缓存</td><td>HTTP 缓存友好</td><td>需要特殊处理</td></tr>
<tr><td>学习曲线</td><td>低</td><td>中</td></tr>
</tbody>
</table>
<h2>何时选择 GraphQL</h2>
<p>适合 GraphQL 的场景：</p>
<ul>
<li>移动端（带宽敏感，需要精确控制数据量）</li>
<li>复杂的关联数据查询</li>
<li>多种客户端需要不同的数据结构</li>
<li>快速迭代的前端需求</li>
</ul>
<p>适合 REST 的场景：</p>
<ul>
<li>简单的 CRUD API</li>
<li>需要 HTTP 缓存</li>
<li>文件上传/下载</li>
<li>公开 API（更直观）</li>
</ul>
<h2>小结</h2>
<ul>
<li>GraphQL 请求和响应都是 JSON 格式</li>
<li>客户端声明需要的字段，服务端精确返回，避免过度获取</li>
<li>一次请求获取多层关联数据，减少网络往返</li>
<li>错误通过 <code>errors</code> 数组返回，支持部分成功</li>
<li>适合复杂数据需求和多客户端场景</li>
</ul>
`,
en: `<h1>GraphQL 中的 JSON：灵活的数据查询</h1>
<h2>GraphQL vs REST</h2>
<p>REST API 常见的痛点：</p>
<ol>
<li><strong>过度获取</strong>：<code>GET /users/1</code> 返回 20 个字段，但你只需要 name 和 email</li>
<li><strong>获取不足</strong>：获取用户信息后，还要再请求 <code>/users/1/orders</code> 获取订单</li>
<li><strong>多次往返</strong>：一个页面需要调用 5-6 个 API 才能拿到所有数据</li>
</ol>
<p>GraphQL 用一个请求解决所有问题：<strong>客户端声明需要什么数据，服务端精确返回</strong>。</p>
<h2>基本查询</h2>
<h3>请求（JSON 包裹的 GraphQL 查询）</h3>
<pre><code class="language-json">{
  &#34;query&#34;: &#34;{ user(id: 123) { name email orders { id total } } }&#34;
}</code></pre>
<p>更可读的格式：</p>
<pre><code class="language-graphql">{
  user(id: 123) {
    name
    email
    orders {
      id
      total
      items {
        productName
        quantity
      }
    }
  }
}</code></pre>
<h3>响应（标准 JSON）</h3>
<pre><code class="language-json">{
  &#34;data&#34;: {
    &#34;user&#34;: {
      &#34;name&#34;: &#34;Alice&#34;,
      &#34;email&#34;: &#34;alice@example.com&#34;,
      &#34;orders&#34;: [
        {
          &#34;id&#34;: &#34;ORD-001&#34;,
          &#34;total&#34;: 299.00,
          &#34;items&#34;: [
            { &#34;productName&#34;: &#34;机械键盘&#34;, &#34;quantity&#34;: 1 }
          ]
        }
      ]
    }
  }
}</code></pre>
<p>一次请求，获取了用户信息 + 订单列表 + 订单商品详情。REST 需要 3 个请求。</p>
<h2>变更操作（Mutation）</h2>
<h3>请求</h3>
<pre><code class="language-json">{
  &#34;query&#34;: &#34;mutation { createUser(input: { name: \\&#34;Bob\\&#34;, email: \\&#34;bob@example.com\\&#34; }) { id name createdAt } }&#34;,
  &#34;variables&#34;: {}
}</code></pre>
<p>使用变量（推荐）：</p>
<pre><code class="language-json">{
  &#34;query&#34;: &#34;mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id name createdAt } }&#34;,
  &#34;variables&#34;: {
    &#34;input&#34;: {
      &#34;name&#34;: &#34;Bob&#34;,
      &#34;email&#34;: &#34;bob@example.com&#34;,
      &#34;role&#34;: &#34;editor&#34;
    }
  }
}</code></pre>
<h3>响应</h3>
<pre><code class="language-json">{
  &#34;data&#34;: {
    &#34;createUser&#34;: {
      &#34;id&#34;: &#34;125&#34;,
      &#34;name&#34;: &#34;Bob&#34;,
      &#34;createdAt&#34;: &#34;2025-01-15T10:30:00Z&#34;
    }
  }
}</code></pre>
<h2>错误处理</h2>
<p>GraphQL 错误和 REST 不同——即使有错误，HTTP 状态码通常仍是 200：</p>
<pre><code class="language-json">{
  &#34;data&#34;: {
    &#34;user&#34;: null
  },
  &#34;errors&#34;: [
    {
      &#34;message&#34;: &#34;用户不存在&#34;,
      &#34;locations&#34;: [{ &#34;line&#34;: 2, &#34;column&#34;: 3 }],
      &#34;path&#34;: [&#34;user&#34;],
      &#34;extensions&#34;: {
        &#34;code&#34;: &#34;NOT_FOUND&#34;,
        &#34;timestamp&#34;: &#34;2025-01-15T10:00:00Z&#34;
      }
    }
  ]
}</code></pre>
<p>部分成功的情况（某些字段返回了数据，某些出错）：</p>
<pre><code class="language-json">{
  &#34;data&#34;: {
    &#34;user&#34;: {
      &#34;name&#34;: &#34;Alice&#34;,
      &#34;email&#34;: &#34;alice@example.com&#34;,
      &#34;creditScore&#34;: null
    }
  },
  &#34;errors&#34;: [
    {
      &#34;message&#34;: &#34;信用评分服务暂时不可用&#34;,
      &#34;path&#34;: [&#34;user&#34;, &#34;creditScore&#34;],
      &#34;extensions&#34;: { &#34;code&#34;: &#34;SERVICE_UNAVAILABLE&#34; }
    }
  ]
}</code></pre>
<h2>实际代码示例</h2>
<h3>服务端（Node.js + Apollo Server）</h3>
<pre><code class="language-javascript">const { ApolloServer, gql } = require(&#34;apollo-server&#34;);

const typeDefs = gql\`
  type User {
    id: ID!
    name: String!
    email: String!
    orders: [Order!]!
  }

  type Order {
    id: ID!
    total: Float!
    status: String!
  }

  type Query {
    user(id: ID!): User
    users(page: Int, pageSize: Int): [User!]!
  }

  input CreateUserInput {
    name: String!
    email: String!
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
  }
\`;

const resolvers = {
  Query: {
    user: (_, { id }) =&gt; getUserById(id),
    users: (_, { page = 1, pageSize = 20 }) =&gt; getUsers(page, pageSize),
  },
  User: {
    orders: (user) =&gt; getOrdersByUserId(user.id), // 按需加载
  },
  Mutation: {
    createUser: (_, { input }) =&gt; createUser(input),
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
server.listen().then(({ url }) =&gt; console.log(\`Server at \${url}\`));</code></pre>
<h3>客户端请求</h3>
<pre><code class="language-javascript">async function fetchUser(userId) {
  const response = await fetch(&#34;/graphql&#34;, {
    method: &#34;POST&#34;,
    headers: { &#34;Content-Type&#34;: &#34;application/json&#34; },
    body: JSON.stringify({
      query: \`
        query GetUser($id: ID!) {
          user(id: $id) {
            name
            email
            orders {
              id
              total
              status
            }
          }
        }
      \`,
      variables: { id: userId }
    })
  });

  const { data, errors } = await response.json();
  if (errors) {
    console.error(&#34;GraphQL errors:&#34;, errors);
  }
  return data?.user;
}</code></pre>
<h2>GraphQL JSON 响应与 REST 对比</h2>
<table>
<thead><tr><th>维度</th><th>REST JSON</th><th>GraphQL JSON</th></tr></thead>
<tbody>
<tr><td>数据结构</td><td>服务端决定</td><td>客户端声明</td></tr>
<tr><td>过度获取</td><td>常见</td><td>不存在</td></tr>
<tr><td>多资源获取</td><td>多次请求</td><td>一次请求</td></tr>
<tr><td>错误格式</td><td>HTTP 状态码 + body</td><td>200 + errors 数组</td></tr>
<tr><td>缓存</td><td>HTTP 缓存友好</td><td>需要特殊处理</td></tr>
<tr><td>学习曲线</td><td>低</td><td>中</td></tr>
</tbody>
</table>
<h2>何时选择 GraphQL</h2>
<p>适合 GraphQL 的场景：</p>
<ul>
<li>移动端（带宽敏感，需要精确控制数据量）</li>
<li>复杂的关联数据查询</li>
<li>多种客户端需要不同的数据结构</li>
<li>快速迭代的前端需求</li>
</ul>
<p>适合 REST 的场景：</p>
<ul>
<li>简单的 CRUD API</li>
<li>需要 HTTP 缓存</li>
<li>文件上传/下载</li>
<li>公开 API（更直观）</li>
</ul>
<h2>小结</h2>
<ul>
<li>GraphQL 请求和响应都是 JSON 格式</li>
<li>客户端声明需要的字段，服务端精确返回，避免过度获取</li>
<li>一次请求获取多层关联数据，减少网络往返</li>
<li>错误通过 <code>errors</code> 数组返回，支持部分成功</li>
<li>适合复杂数据需求和多客户端场景</li>
</ul>
`
};

window.LEARN_ARTICLES["json-config"] = {
zh: `<h1>JSON 配置文件最佳实践</h1>
<h2>JSON 作为配置文件</h2>
<p>JSON 是最常用的配置文件格式之一。<code>package.json</code>、<code>tsconfig.json</code>、<code>.eslintrc.json</code>、VS Code 的 <code>settings.json</code>——几乎每个现代开发工具都用 JSON 做配置。</p>
<h2>常见配置文件解析</h2>
<h3>package.json</h3>
<pre><code class="language-json">{
  &#34;name&#34;: &#34;my-app&#34;,
  &#34;version&#34;: &#34;1.0.0&#34;,
  &#34;description&#34;: &#34;My awesome application&#34;,
  &#34;main&#34;: &#34;dist/index.js&#34;,
  &#34;scripts&#34;: {
    &#34;dev&#34;: &#34;vite&#34;,
    &#34;build&#34;: &#34;tsc &amp;&amp; vite build&#34;,
    &#34;test&#34;: &#34;vitest&#34;,
    &#34;lint&#34;: &#34;eslint src/&#34;
  },
  &#34;dependencies&#34;: {
    &#34;react&#34;: &#34;^18.2.0&#34;,
    &#34;react-dom&#34;: &#34;^18.2.0&#34;
  },
  &#34;devDependencies&#34;: {
    &#34;typescript&#34;: &#34;^5.3.0&#34;,
    &#34;vite&#34;: &#34;^5.0.0&#34;,
    &#34;vitest&#34;: &#34;^1.0.0&#34;
  },
  &#34;engines&#34;: {
    &#34;node&#34;: &#34;&gt;=18.0.0&#34;
  },
  &#34;license&#34;: &#34;MIT&#34;
}</code></pre>
<h3>tsconfig.json</h3>
<pre><code class="language-json">{
  &#34;compilerOptions&#34;: {
    &#34;target&#34;: &#34;ES2022&#34;,
    &#34;module&#34;: &#34;ESNext&#34;,
    &#34;moduleResolution&#34;: &#34;bundler&#34;,
    &#34;strict&#34;: true,
    &#34;esModuleInterop&#34;: true,
    &#34;skipLibCheck&#34;: true,
    &#34;forceConsistentCasingInFileNames&#34;: true,
    &#34;outDir&#34;: &#34;./dist&#34;,
    &#34;rootDir&#34;: &#34;./src&#34;,
    &#34;declaration&#34;: true,
    &#34;sourceMap&#34;: true,
    &#34;baseUrl&#34;: &#34;.&#34;,
    &#34;paths&#34;: {
      &#34;@/*&#34;: [&#34;src/*&#34;],
      &#34;@components/*&#34;: [&#34;src/components/*&#34;]
    }
  },
  &#34;include&#34;: [&#34;src/**/*&#34;],
  &#34;exclude&#34;: [&#34;node_modules&#34;, &#34;dist&#34;, &#34;**/*.test.ts&#34;]
}</code></pre>
<h3>.eslintrc.json</h3>
<pre><code class="language-json">{
  &#34;root&#34;: true,
  &#34;env&#34;: {
    &#34;browser&#34;: true,
    &#34;node&#34;: true,
    &#34;es2022&#34;: true
  },
  &#34;extends&#34;: [
    &#34;eslint:recommended&#34;,
    &#34;plugin:@typescript-eslint/recommended&#34;,
    &#34;prettier&#34;
  ],
  &#34;parser&#34;: &#34;@typescript-eslint/parser&#34;,
  &#34;parserOptions&#34;: {
    &#34;ecmaVersion&#34;: &#34;latest&#34;,
    &#34;sourceType&#34;: &#34;module&#34;
  },
  &#34;rules&#34;: {
    &#34;no-console&#34;: &#34;warn&#34;,
    &#34;@typescript-eslint/no-unused-vars&#34;: [&#34;error&#34;, { &#34;argsIgnorePattern&#34;: &#34;^_&#34; }],
    &#34;prefer-const&#34;: &#34;error&#34;
  }
}</code></pre>
<h2>应用配置设计</h2>
<h3>多环境配置</h3>
<pre><code>config/
├── default.json      # 默认配置
├── development.json  # 开发环境覆盖
├── production.json   # 生产环境覆盖
└── test.json         # 测试环境覆盖</code></pre>
<pre><code class="language-json">// config/default.json
{
  &#34;server&#34;: {
    &#34;host&#34;: &#34;0.0.0.0&#34;,
    &#34;port&#34;: 3000
  },
  &#34;database&#34;: {
    &#34;host&#34;: &#34;localhost&#34;,
    &#34;port&#34;: 5432,
    &#34;name&#34;: &#34;myapp&#34;,
    &#34;pool&#34;: {
      &#34;min&#34;: 2,
      &#34;max&#34;: 10
    }
  },
  &#34;cache&#34;: {
    &#34;ttl&#34;: 3600,
    &#34;prefix&#34;: &#34;myapp:&#34;
  },
  &#34;logging&#34;: {
    &#34;level&#34;: &#34;info&#34;,
    &#34;format&#34;: &#34;json&#34;
  }
}</code></pre>
<pre><code class="language-json">// config/production.json — 只覆盖需要改变的部分
{
  &#34;server&#34;: {
    &#34;port&#34;: 8080
  },
  &#34;database&#34;: {
    &#34;host&#34;: &#34;db.production.internal&#34;,
    &#34;pool&#34;: { &#34;min&#34;: 10, &#34;max&#34;: 50 }
  },
  &#34;logging&#34;: {
    &#34;level&#34;: &#34;warn&#34;
  }
}</code></pre>
<h3>配置合并（Node.js）</h3>
<pre><code class="language-javascript">const defaultConfig = require(&#34;./config/default.json&#34;);
const envConfig = require(\`./config/\${process.env.NODE_ENV || &#34;development&#34;}.json\`);

// 深度合并
function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] &amp;&amp; typeof source[key] === &#34;object&#34; &amp;&amp; !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

const config = deepMerge(defaultConfig, envConfig);</code></pre>
<h2>JSON 配置的局限性</h2>
<table>
<thead><tr><th>问题</th><th>说明</th><th>替代方案</th></tr></thead>
<tbody>
<tr><td>不支持注释</td><td>无法写说明</td><td>JSON5 / JSONC</td></tr>
<tr><td>不支持尾逗号</td><td>容易出错</td><td>JSON5 / JSONC</td></tr>
<tr><td>不支持多行字符串</td><td>长文本不方便</td><td>YAML / TOML</td></tr>
<tr><td>不支持环境变量引用</td><td><code>$DB_HOST</code> 无法内嵌</td><td>代码层面处理</td></tr>
<tr><td>不支持 include</td><td>不能引用其他文件</td><td>代码层面处理</td></tr>
</tbody>
</table>
<h3>JSONC（JSON with Comments）</h3>
<p>VS Code 使用 JSONC 格式，支持注释和尾逗号：</p>
<pre><code class="language-jsonc">{
  // 编辑器设置
  &#34;editor.fontSize&#34;: 14,
  &#34;editor.tabSize&#34;: 2,

  /* 终端设置 */
  &#34;terminal.integrated.fontSize&#34;: 13,

  // 尾逗号是允许的
  &#34;files.autoSave&#34;: &#34;afterDelay&#34;,
}</code></pre>
<h2>安全注意事项</h2>
<h3>不要在 JSON 配置中存储密钥</h3>
<pre><code class="language-json">// ❌ 密钥不应在配置文件中
{
  &#34;database&#34;: {
    &#34;password&#34;: &#34;super_secret_123&#34;
  },
  &#34;api_key&#34;: &#34;sk-xxxxxxxxxxxx&#34;
}

// ✓ 使用环境变量
{
  &#34;database&#34;: {
    &#34;password_env&#34;: &#34;DB_PASSWORD&#34;
  }
}</code></pre>
<pre><code class="language-javascript">// 代码中读取环境变量
const dbPassword = process.env[config.database.password_env];</code></pre>
<h3>.gitignore</h3>
<pre><code class="language-gitignore"># 不要把敏感配置提交到代码仓库
config/local.json
config/secrets.json
.env</code></pre>
<h2>JSON Schema 验证配置</h2>
<p>为你的配置文件编写 JSON Schema，可以在编辑器中获得自动补全和错误提示：</p>
<pre><code class="language-json">{
  &#34;$schema&#34;: &#34;https://json-schema.org/draft/2020-12/schema&#34;,
  &#34;type&#34;: &#34;object&#34;,
  &#34;required&#34;: [&#34;server&#34;, &#34;database&#34;],
  &#34;properties&#34;: {
    &#34;server&#34;: {
      &#34;type&#34;: &#34;object&#34;,
      &#34;properties&#34;: {
        &#34;host&#34;: { &#34;type&#34;: &#34;string&#34;, &#34;default&#34;: &#34;0.0.0.0&#34; },
        &#34;port&#34;: { &#34;type&#34;: &#34;integer&#34;, &#34;minimum&#34;: 1, &#34;maximum&#34;: 65535 }
      }
    },
    &#34;database&#34;: {
      &#34;type&#34;: &#34;object&#34;,
      &#34;required&#34;: [&#34;host&#34;, &#34;name&#34;],
      &#34;properties&#34;: {
        &#34;host&#34;: { &#34;type&#34;: &#34;string&#34; },
        &#34;port&#34;: { &#34;type&#34;: &#34;integer&#34;, &#34;default&#34;: 5432 },
        &#34;name&#34;: { &#34;type&#34;: &#34;string&#34; }
      }
    }
  }
}</code></pre>
<p>在 VS Code 中，<code>settings.json</code> 会自动根据 Schema 提供补全。你的自定义配置也可以享受同样的体验。</p>
<h2>小结</h2>
<ul>
<li>JSON 是最流行的配置文件格式，被主流开发工具广泛使用</li>
<li>多环境配置推荐"默认 + 覆盖"模式</li>
<li>JSON 不支持注释是主要局限，JSONC/JSON5 是解决方案</li>
<li>密钥和敏感信息不要放在 JSON 配置中，使用环境变量</li>
<li>为配置文件编写 JSON Schema，获得编辑器辅助和验证</li>
</ul>
`,
en: `<h1>JSON 配置文件最佳实践</h1>
<h2>JSON 作为配置文件</h2>
<p>JSON 是最常用的配置文件格式之一。<code>package.json</code>、<code>tsconfig.json</code>、<code>.eslintrc.json</code>、VS Code 的 <code>settings.json</code>——几乎每个现代开发工具都用 JSON 做配置。</p>
<h2>常见配置文件解析</h2>
<h3>package.json</h3>
<pre><code class="language-json">{
  &#34;name&#34;: &#34;my-app&#34;,
  &#34;version&#34;: &#34;1.0.0&#34;,
  &#34;description&#34;: &#34;My awesome application&#34;,
  &#34;main&#34;: &#34;dist/index.js&#34;,
  &#34;scripts&#34;: {
    &#34;dev&#34;: &#34;vite&#34;,
    &#34;build&#34;: &#34;tsc &amp;&amp; vite build&#34;,
    &#34;test&#34;: &#34;vitest&#34;,
    &#34;lint&#34;: &#34;eslint src/&#34;
  },
  &#34;dependencies&#34;: {
    &#34;react&#34;: &#34;^18.2.0&#34;,
    &#34;react-dom&#34;: &#34;^18.2.0&#34;
  },
  &#34;devDependencies&#34;: {
    &#34;typescript&#34;: &#34;^5.3.0&#34;,
    &#34;vite&#34;: &#34;^5.0.0&#34;,
    &#34;vitest&#34;: &#34;^1.0.0&#34;
  },
  &#34;engines&#34;: {
    &#34;node&#34;: &#34;&gt;=18.0.0&#34;
  },
  &#34;license&#34;: &#34;MIT&#34;
}</code></pre>
<h3>tsconfig.json</h3>
<pre><code class="language-json">{
  &#34;compilerOptions&#34;: {
    &#34;target&#34;: &#34;ES2022&#34;,
    &#34;module&#34;: &#34;ESNext&#34;,
    &#34;moduleResolution&#34;: &#34;bundler&#34;,
    &#34;strict&#34;: true,
    &#34;esModuleInterop&#34;: true,
    &#34;skipLibCheck&#34;: true,
    &#34;forceConsistentCasingInFileNames&#34;: true,
    &#34;outDir&#34;: &#34;./dist&#34;,
    &#34;rootDir&#34;: &#34;./src&#34;,
    &#34;declaration&#34;: true,
    &#34;sourceMap&#34;: true,
    &#34;baseUrl&#34;: &#34;.&#34;,
    &#34;paths&#34;: {
      &#34;@/*&#34;: [&#34;src/*&#34;],
      &#34;@components/*&#34;: [&#34;src/components/*&#34;]
    }
  },
  &#34;include&#34;: [&#34;src/**/*&#34;],
  &#34;exclude&#34;: [&#34;node_modules&#34;, &#34;dist&#34;, &#34;**/*.test.ts&#34;]
}</code></pre>
<h3>.eslintrc.json</h3>
<pre><code class="language-json">{
  &#34;root&#34;: true,
  &#34;env&#34;: {
    &#34;browser&#34;: true,
    &#34;node&#34;: true,
    &#34;es2022&#34;: true
  },
  &#34;extends&#34;: [
    &#34;eslint:recommended&#34;,
    &#34;plugin:@typescript-eslint/recommended&#34;,
    &#34;prettier&#34;
  ],
  &#34;parser&#34;: &#34;@typescript-eslint/parser&#34;,
  &#34;parserOptions&#34;: {
    &#34;ecmaVersion&#34;: &#34;latest&#34;,
    &#34;sourceType&#34;: &#34;module&#34;
  },
  &#34;rules&#34;: {
    &#34;no-console&#34;: &#34;warn&#34;,
    &#34;@typescript-eslint/no-unused-vars&#34;: [&#34;error&#34;, { &#34;argsIgnorePattern&#34;: &#34;^_&#34; }],
    &#34;prefer-const&#34;: &#34;error&#34;
  }
}</code></pre>
<h2>应用配置设计</h2>
<h3>多环境配置</h3>
<pre><code>config/
├── default.json      # 默认配置
├── development.json  # 开发环境覆盖
├── production.json   # 生产环境覆盖
└── test.json         # 测试环境覆盖</code></pre>
<pre><code class="language-json">// config/default.json
{
  &#34;server&#34;: {
    &#34;host&#34;: &#34;0.0.0.0&#34;,
    &#34;port&#34;: 3000
  },
  &#34;database&#34;: {
    &#34;host&#34;: &#34;localhost&#34;,
    &#34;port&#34;: 5432,
    &#34;name&#34;: &#34;myapp&#34;,
    &#34;pool&#34;: {
      &#34;min&#34;: 2,
      &#34;max&#34;: 10
    }
  },
  &#34;cache&#34;: {
    &#34;ttl&#34;: 3600,
    &#34;prefix&#34;: &#34;myapp:&#34;
  },
  &#34;logging&#34;: {
    &#34;level&#34;: &#34;info&#34;,
    &#34;format&#34;: &#34;json&#34;
  }
}</code></pre>
<pre><code class="language-json">// config/production.json — 只覆盖需要改变的部分
{
  &#34;server&#34;: {
    &#34;port&#34;: 8080
  },
  &#34;database&#34;: {
    &#34;host&#34;: &#34;db.production.internal&#34;,
    &#34;pool&#34;: { &#34;min&#34;: 10, &#34;max&#34;: 50 }
  },
  &#34;logging&#34;: {
    &#34;level&#34;: &#34;warn&#34;
  }
}</code></pre>
<h3>配置合并（Node.js）</h3>
<pre><code class="language-javascript">const defaultConfig = require(&#34;./config/default.json&#34;);
const envConfig = require(\`./config/\${process.env.NODE_ENV || &#34;development&#34;}.json\`);

// 深度合并
function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] &amp;&amp; typeof source[key] === &#34;object&#34; &amp;&amp; !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

const config = deepMerge(defaultConfig, envConfig);</code></pre>
<h2>JSON 配置的局限性</h2>
<table>
<thead><tr><th>问题</th><th>说明</th><th>替代方案</th></tr></thead>
<tbody>
<tr><td>不支持注释</td><td>无法写说明</td><td>JSON5 / JSONC</td></tr>
<tr><td>不支持尾逗号</td><td>容易出错</td><td>JSON5 / JSONC</td></tr>
<tr><td>不支持多行字符串</td><td>长文本不方便</td><td>YAML / TOML</td></tr>
<tr><td>不支持环境变量引用</td><td><code>$DB_HOST</code> 无法内嵌</td><td>代码层面处理</td></tr>
<tr><td>不支持 include</td><td>不能引用其他文件</td><td>代码层面处理</td></tr>
</tbody>
</table>
<h3>JSONC（JSON with Comments）</h3>
<p>VS Code 使用 JSONC 格式，支持注释和尾逗号：</p>
<pre><code class="language-jsonc">{
  // 编辑器设置
  &#34;editor.fontSize&#34;: 14,
  &#34;editor.tabSize&#34;: 2,

  /* 终端设置 */
  &#34;terminal.integrated.fontSize&#34;: 13,

  // 尾逗号是允许的
  &#34;files.autoSave&#34;: &#34;afterDelay&#34;,
}</code></pre>
<h2>安全注意事项</h2>
<h3>不要在 JSON 配置中存储密钥</h3>
<pre><code class="language-json">// ❌ 密钥不应在配置文件中
{
  &#34;database&#34;: {
    &#34;password&#34;: &#34;super_secret_123&#34;
  },
  &#34;api_key&#34;: &#34;sk-xxxxxxxxxxxx&#34;
}

// ✓ 使用环境变量
{
  &#34;database&#34;: {
    &#34;password_env&#34;: &#34;DB_PASSWORD&#34;
  }
}</code></pre>
<pre><code class="language-javascript">// 代码中读取环境变量
const dbPassword = process.env[config.database.password_env];</code></pre>
<h3>.gitignore</h3>
<pre><code class="language-gitignore"># 不要把敏感配置提交到代码仓库
config/local.json
config/secrets.json
.env</code></pre>
<h2>JSON Schema 验证配置</h2>
<p>为你的配置文件编写 JSON Schema，可以在编辑器中获得自动补全和错误提示：</p>
<pre><code class="language-json">{
  &#34;$schema&#34;: &#34;https://json-schema.org/draft/2020-12/schema&#34;,
  &#34;type&#34;: &#34;object&#34;,
  &#34;required&#34;: [&#34;server&#34;, &#34;database&#34;],
  &#34;properties&#34;: {
    &#34;server&#34;: {
      &#34;type&#34;: &#34;object&#34;,
      &#34;properties&#34;: {
        &#34;host&#34;: { &#34;type&#34;: &#34;string&#34;, &#34;default&#34;: &#34;0.0.0.0&#34; },
        &#34;port&#34;: { &#34;type&#34;: &#34;integer&#34;, &#34;minimum&#34;: 1, &#34;maximum&#34;: 65535 }
      }
    },
    &#34;database&#34;: {
      &#34;type&#34;: &#34;object&#34;,
      &#34;required&#34;: [&#34;host&#34;, &#34;name&#34;],
      &#34;properties&#34;: {
        &#34;host&#34;: { &#34;type&#34;: &#34;string&#34; },
        &#34;port&#34;: { &#34;type&#34;: &#34;integer&#34;, &#34;default&#34;: 5432 },
        &#34;name&#34;: { &#34;type&#34;: &#34;string&#34; }
      }
    }
  }
}</code></pre>
<p>在 VS Code 中，<code>settings.json</code> 会自动根据 Schema 提供补全。你的自定义配置也可以享受同样的体验。</p>
<h2>小结</h2>
<ul>
<li>JSON 是最流行的配置文件格式，被主流开发工具广泛使用</li>
<li>多环境配置推荐"默认 + 覆盖"模式</li>
<li>JSON 不支持注释是主要局限，JSONC/JSON5 是解决方案</li>
<li>密钥和敏感信息不要放在 JSON 配置中，使用环境变量</li>
<li>为配置文件编写 JSON Schema，获得编辑器辅助和验证</li>
</ul>
`
};

window.LEARN_ARTICLES["json-ai-llm"] = {
zh: `<h1>JSON 与 AI/LLM：构建智能应用的数据桥梁</h1>
<h2>JSON 在 AI 时代的核心角色</h2>
<p>大语言模型（LLM）的崛起让 JSON 成为了人与 AI 交互的核心数据格式。从 API 调用到结构化输出，从 Function Calling 到 RAG 系统，JSON 无处不在。</p>
<h2>LLM API 的 JSON 交互</h2>
<h3>OpenAI / 兼容 API 请求</h3>
<pre><code class="language-json">{
  &#34;model&#34;: &#34;gpt-4&#34;,
  &#34;messages&#34;: [
    { &#34;role&#34;: &#34;system&#34;, &#34;content&#34;: &#34;你是一个专业的数据分析师。&#34; },
    { &#34;role&#34;: &#34;user&#34;, &#34;content&#34;: &#34;分析这段销售数据的趋势。&#34; }
  ],
  &#34;temperature&#34;: 0.7,
  &#34;max_tokens&#34;: 2000,
  &#34;response_format&#34;: { &#34;type&#34;: &#34;json_object&#34; }
}</code></pre>
<h3>响应</h3>
<pre><code class="language-json">{
  &#34;id&#34;: &#34;chatcmpl-xxx&#34;,
  &#34;object&#34;: &#34;chat.completion&#34;,
  &#34;model&#34;: &#34;gpt-4&#34;,
  &#34;choices&#34;: [
    {
      &#34;index&#34;: 0,
      &#34;message&#34;: {
        &#34;role&#34;: &#34;assistant&#34;,
        &#34;content&#34;: &#34;{\\&#34;trend\\&#34;: \\&#34;上升\\&#34;, \\&#34;growth_rate\\&#34;: 15.3, \\&#34;peak_month\\&#34;: \\&#34;11月\\&#34;}&#34;
      },
      &#34;finish_reason&#34;: &#34;stop&#34;
    }
  ],
  &#34;usage&#34;: {
    &#34;prompt_tokens&#34;: 156,
    &#34;completion_tokens&#34;: 89,
    &#34;total_tokens&#34;: 245
  }
}</code></pre>
<h2>结构化输出</h2>
<p>让 LLM 输出结构化 JSON 而非自由文本，是构建可靠 AI 应用的关键。</p>
<h3>方法一：System Prompt 约束</h3>
<pre><code class="language-json">{
  &#34;messages&#34;: [
    {
      &#34;role&#34;: &#34;system&#34;,
      &#34;content&#34;: &#34;你是一个商品信息提取器。请从用户描述中提取信息，严格按以下 JSON 格式输出，不要输出其他内容：\\n{\\&#34;name\\&#34;: \\&#34;商品名\\&#34;, \\&#34;price\\&#34;: 数字, \\&#34;category\\&#34;: \\&#34;分类\\&#34;, \\&#34;features\\&#34;: [\\&#34;特点1\\&#34;, \\&#34;特点2\\&#34;]}&#34;
    },
    {
      &#34;role&#34;: &#34;user&#34;,
      &#34;content&#34;: &#34;这款Cherry红轴机械键盘很不错，87键紧凑设计，RGB背光，售价599元&#34;
    }
  ]
}</code></pre>
<h3>方法二：JSON Mode</h3>
<pre><code class="language-json">{
  &#34;model&#34;: &#34;gpt-4-turbo&#34;,
  &#34;messages&#34;: [...],
  &#34;response_format&#34;: { &#34;type&#34;: &#34;json_object&#34; }
}</code></pre>
<p>开启 JSON Mode 后，模型保证输出合法 JSON。</p>
<h3>方法三：JSON Schema 约束（推荐）</h3>
<pre><code class="language-json">{
  &#34;model&#34;: &#34;gpt-4o&#34;,
  &#34;messages&#34;: [...],
  &#34;response_format&#34;: {
    &#34;type&#34;: &#34;json_schema&#34;,
    &#34;json_schema&#34;: {
      &#34;name&#34;: &#34;product_extraction&#34;,
      &#34;strict&#34;: true,
      &#34;schema&#34;: {
        &#34;type&#34;: &#34;object&#34;,
        &#34;required&#34;: [&#34;name&#34;, &#34;price&#34;, &#34;category&#34;],
        &#34;properties&#34;: {
          &#34;name&#34;: { &#34;type&#34;: &#34;string&#34; },
          &#34;price&#34;: { &#34;type&#34;: &#34;number&#34; },
          &#34;category&#34;: { &#34;type&#34;: &#34;string&#34;, &#34;enum&#34;: [&#34;电子产品&#34;, &#34;服装&#34;, &#34;食品&#34;, &#34;其他&#34;] },
          &#34;features&#34;: {
            &#34;type&#34;: &#34;array&#34;,
            &#34;items&#34;: { &#34;type&#34;: &#34;string&#34; }
          }
        },
        &#34;additionalProperties&#34;: false
      }
    }
  }
}</code></pre>
<p>这是最可靠的方式——API 保证输出严格匹配 Schema。</p>
<h2>Function Calling / Tool Use</h2>
<p>Function Calling 让 LLM 可以调用外部工具，定义和交互全部使用 JSON：</p>
<h3>定义工具</h3>
<pre><code class="language-json">{
  &#34;model&#34;: &#34;gpt-4&#34;,
  &#34;messages&#34;: [
    { &#34;role&#34;: &#34;user&#34;, &#34;content&#34;: &#34;北京今天天气怎么样？&#34; }
  ],
  &#34;tools&#34;: [
    {
      &#34;type&#34;: &#34;function&#34;,
      &#34;function&#34;: {
        &#34;name&#34;: &#34;get_weather&#34;,
        &#34;description&#34;: &#34;获取指定城市的天气信息&#34;,
        &#34;parameters&#34;: {
          &#34;type&#34;: &#34;object&#34;,
          &#34;required&#34;: [&#34;city&#34;],
          &#34;properties&#34;: {
            &#34;city&#34;: { &#34;type&#34;: &#34;string&#34;, &#34;description&#34;: &#34;城市名称&#34; },
            &#34;unit&#34;: { &#34;type&#34;: &#34;string&#34;, &#34;enum&#34;: [&#34;celsius&#34;, &#34;fahrenheit&#34;], &#34;default&#34;: &#34;celsius&#34; }
          }
        }
      }
    }
  ]
}</code></pre>
<h3>模型调用工具</h3>
<pre><code class="language-json">{
  &#34;choices&#34;: [{
    &#34;message&#34;: {
      &#34;role&#34;: &#34;assistant&#34;,
      &#34;tool_calls&#34;: [{
        &#34;id&#34;: &#34;call_abc123&#34;,
        &#34;type&#34;: &#34;function&#34;,
        &#34;function&#34;: {
          &#34;name&#34;: &#34;get_weather&#34;,
          &#34;arguments&#34;: &#34;{\\&#34;city\\&#34;: \\&#34;北京\\&#34;, \\&#34;unit\\&#34;: \\&#34;celsius\\&#34;}&#34;
        }
      }]
    }
  }]
}</code></pre>
<h3>返回工具结果</h3>
<pre><code class="language-json">{
  &#34;messages&#34;: [
    { &#34;role&#34;: &#34;user&#34;, &#34;content&#34;: &#34;北京今天天气怎么样？&#34; },
    { &#34;role&#34;: &#34;assistant&#34;, &#34;tool_calls&#34;: [{ &#34;id&#34;: &#34;call_abc123&#34;, ... }] },
    {
      &#34;role&#34;: &#34;tool&#34;,
      &#34;tool_call_id&#34;: &#34;call_abc123&#34;,
      &#34;content&#34;: &#34;{\\&#34;city\\&#34;: \\&#34;北京\\&#34;, \\&#34;temperature\\&#34;: 5, \\&#34;condition\\&#34;: \\&#34;晴\\&#34;, \\&#34;humidity\\&#34;: 30}&#34;
    }
  ]
}</code></pre>
<p>模型根据工具返回的 JSON 生成最终回答。</p>
<h2>RAG 系统中的 JSON</h2>
<p>检索增强生成（RAG）系统中，JSON 用于存储和传递检索结果：</p>
<pre><code class="language-json">{
  &#34;messages&#34;: [
    {
      &#34;role&#34;: &#34;system&#34;,
      &#34;content&#34;: &#34;基于以下检索到的文档回答用户问题。如果文档中没有答案，请说明。&#34;
    },
    {
      &#34;role&#34;: &#34;user&#34;,
      &#34;content&#34;: &#34;退货政策是什么？\\n\\n---检索到的文档---\\n[{\\&#34;title\\&#34;: \\&#34;退货政策\\&#34;, \\&#34;content\\&#34;: \\&#34;自购买之日起30天内可无理由退货...\\&#34;, \\&#34;score\\&#34;: 0.95}, {\\&#34;title\\&#34;: \\&#34;运费说明\\&#34;, \\&#34;content\\&#34;: \\&#34;退货运费由买家承担...\\&#34;, \\&#34;score\\&#34;: 0.82}]&#34;
    }
  ]
}</code></pre>
<h3>向量数据库的 JSON 交互</h3>
<pre><code class="language-python"># Pinecone 示例
index.upsert(vectors=[
    {
        &#34;id&#34;: &#34;doc-001&#34;,
        &#34;values&#34;: embedding_vector,  # [0.1, 0.2, ...]
        &#34;metadata&#34;: {
            &#34;title&#34;: &#34;退货政策&#34;,
            &#34;category&#34;: &#34;customer-service&#34;,
            &#34;updated_at&#34;: &#34;2025-01-15&#34;
        }
    }
])

# 查询结果也是 JSON
results = index.query(
    vector=query_embedding,
    top_k=5,
    include_metadata=True
)
# results.matches = [
#   {&#34;id&#34;: &#34;doc-001&#34;, &#34;score&#34;: 0.95, &#34;metadata&#34;: {...}},
#   ...
# ]</code></pre>
<h2>AI Agent 的 JSON 通信</h2>
<p>AI Agent 使用 JSON 管理状态和行动计划：</p>
<pre><code class="language-json">{
  &#34;task&#34;: &#34;分析竞品定价并生成报告&#34;,
  &#34;steps&#34;: [
    {
      &#34;action&#34;: &#34;web_search&#34;,
      &#34;params&#34;: { &#34;query&#34;: &#34;竞品 A 最新定价&#34; },
      &#34;status&#34;: &#34;completed&#34;,
      &#34;result&#34;: { &#34;price&#34;: 999, &#34;source&#34;: &#34;official_site&#34; }
    },
    {
      &#34;action&#34;: &#34;web_search&#34;,
      &#34;params&#34;: { &#34;query&#34;: &#34;竞品 B 最新定价&#34; },
      &#34;status&#34;: &#34;completed&#34;,
      &#34;result&#34;: { &#34;price&#34;: 1299, &#34;source&#34;: &#34;jd.com&#34; }
    },
    {
      &#34;action&#34;: &#34;analyze&#34;,
      &#34;params&#34;: { &#34;type&#34;: &#34;price_comparison&#34; },
      &#34;status&#34;: &#34;in_progress&#34;
    },
    {
      &#34;action&#34;: &#34;generate_report&#34;,
      &#34;params&#34;: { &#34;format&#34;: &#34;markdown&#34; },
      &#34;status&#34;: &#34;pending&#34;
    }
  ],
  &#34;memory&#34;: {
    &#34;competitors&#34;: [&#34;A&#34;, &#34;B&#34;],
    &#34;our_price&#34;: 1099
  }
}</code></pre>
<h2>训练数据格式</h2>
<p>微调 LLM 的训练数据通常使用 JSONL（NDJSON）格式：</p>
<pre><code class="language-jsonl">{&#34;messages&#34;: [{&#34;role&#34;: &#34;system&#34;, &#34;content&#34;: &#34;你是客服助手&#34;}, {&#34;role&#34;: &#34;user&#34;, &#34;content&#34;: &#34;怎么退货？&#34;}, {&#34;role&#34;: &#34;assistant&#34;, &#34;content&#34;: &#34;您好，30天内可以申请退货...&#34;}]}
{&#34;messages&#34;: [{&#34;role&#34;: &#34;user&#34;, &#34;content&#34;: &#34;运费多少？&#34;}, {&#34;role&#34;: &#34;assistant&#34;, &#34;content&#34;: &#34;标准运费为10元...&#34;}]}</code></pre>
<p>每行一个训练样本，方便流式处理和追加。</p>
<h2>小结</h2>
<ul>
<li>JSON 是 LLM API 交互的标准格式（请求、响应、工具调用）</li>
<li>结构化输出通过 JSON Schema 约束保证可靠性</li>
<li>Function Calling 用 JSON Schema 定义工具接口</li>
<li>RAG 系统中 JSON 承载检索结果和上下文</li>
<li>训练数据使用 JSONL 格式，支持高效的流式处理</li>
<li>掌握 JSON 是构建 AI 应用的基础技能</li>
</ul>
`,
en: `<h1>JSON 与 AI/LLM：构建智能应用的数据桥梁</h1>
<h2>JSON 在 AI 时代的核心角色</h2>
<p>大语言模型（LLM）的崛起让 JSON 成为了人与 AI 交互的核心数据格式。从 API 调用到结构化输出，从 Function Calling 到 RAG 系统，JSON 无处不在。</p>
<h2>LLM API 的 JSON 交互</h2>
<h3>OpenAI / 兼容 API 请求</h3>
<pre><code class="language-json">{
  &#34;model&#34;: &#34;gpt-4&#34;,
  &#34;messages&#34;: [
    { &#34;role&#34;: &#34;system&#34;, &#34;content&#34;: &#34;你是一个专业的数据分析师。&#34; },
    { &#34;role&#34;: &#34;user&#34;, &#34;content&#34;: &#34;分析这段销售数据的趋势。&#34; }
  ],
  &#34;temperature&#34;: 0.7,
  &#34;max_tokens&#34;: 2000,
  &#34;response_format&#34;: { &#34;type&#34;: &#34;json_object&#34; }
}</code></pre>
<h3>响应</h3>
<pre><code class="language-json">{
  &#34;id&#34;: &#34;chatcmpl-xxx&#34;,
  &#34;object&#34;: &#34;chat.completion&#34;,
  &#34;model&#34;: &#34;gpt-4&#34;,
  &#34;choices&#34;: [
    {
      &#34;index&#34;: 0,
      &#34;message&#34;: {
        &#34;role&#34;: &#34;assistant&#34;,
        &#34;content&#34;: &#34;{\\&#34;trend\\&#34;: \\&#34;上升\\&#34;, \\&#34;growth_rate\\&#34;: 15.3, \\&#34;peak_month\\&#34;: \\&#34;11月\\&#34;}&#34;
      },
      &#34;finish_reason&#34;: &#34;stop&#34;
    }
  ],
  &#34;usage&#34;: {
    &#34;prompt_tokens&#34;: 156,
    &#34;completion_tokens&#34;: 89,
    &#34;total_tokens&#34;: 245
  }
}</code></pre>
<h2>结构化输出</h2>
<p>让 LLM 输出结构化 JSON 而非自由文本，是构建可靠 AI 应用的关键。</p>
<h3>方法一：System Prompt 约束</h3>
<pre><code class="language-json">{
  &#34;messages&#34;: [
    {
      &#34;role&#34;: &#34;system&#34;,
      &#34;content&#34;: &#34;你是一个商品信息提取器。请从用户描述中提取信息，严格按以下 JSON 格式输出，不要输出其他内容：\\n{\\&#34;name\\&#34;: \\&#34;商品名\\&#34;, \\&#34;price\\&#34;: 数字, \\&#34;category\\&#34;: \\&#34;分类\\&#34;, \\&#34;features\\&#34;: [\\&#34;特点1\\&#34;, \\&#34;特点2\\&#34;]}&#34;
    },
    {
      &#34;role&#34;: &#34;user&#34;,
      &#34;content&#34;: &#34;这款Cherry红轴机械键盘很不错，87键紧凑设计，RGB背光，售价599元&#34;
    }
  ]
}</code></pre>
<h3>方法二：JSON Mode</h3>
<pre><code class="language-json">{
  &#34;model&#34;: &#34;gpt-4-turbo&#34;,
  &#34;messages&#34;: [...],
  &#34;response_format&#34;: { &#34;type&#34;: &#34;json_object&#34; }
}</code></pre>
<p>开启 JSON Mode 后，模型保证输出合法 JSON。</p>
<h3>方法三：JSON Schema 约束（推荐）</h3>
<pre><code class="language-json">{
  &#34;model&#34;: &#34;gpt-4o&#34;,
  &#34;messages&#34;: [...],
  &#34;response_format&#34;: {
    &#34;type&#34;: &#34;json_schema&#34;,
    &#34;json_schema&#34;: {
      &#34;name&#34;: &#34;product_extraction&#34;,
      &#34;strict&#34;: true,
      &#34;schema&#34;: {
        &#34;type&#34;: &#34;object&#34;,
        &#34;required&#34;: [&#34;name&#34;, &#34;price&#34;, &#34;category&#34;],
        &#34;properties&#34;: {
          &#34;name&#34;: { &#34;type&#34;: &#34;string&#34; },
          &#34;price&#34;: { &#34;type&#34;: &#34;number&#34; },
          &#34;category&#34;: { &#34;type&#34;: &#34;string&#34;, &#34;enum&#34;: [&#34;电子产品&#34;, &#34;服装&#34;, &#34;食品&#34;, &#34;其他&#34;] },
          &#34;features&#34;: {
            &#34;type&#34;: &#34;array&#34;,
            &#34;items&#34;: { &#34;type&#34;: &#34;string&#34; }
          }
        },
        &#34;additionalProperties&#34;: false
      }
    }
  }
}</code></pre>
<p>这是最可靠的方式——API 保证输出严格匹配 Schema。</p>
<h2>Function Calling / Tool Use</h2>
<p>Function Calling 让 LLM 可以调用外部工具，定义和交互全部使用 JSON：</p>
<h3>定义工具</h3>
<pre><code class="language-json">{
  &#34;model&#34;: &#34;gpt-4&#34;,
  &#34;messages&#34;: [
    { &#34;role&#34;: &#34;user&#34;, &#34;content&#34;: &#34;北京今天天气怎么样？&#34; }
  ],
  &#34;tools&#34;: [
    {
      &#34;type&#34;: &#34;function&#34;,
      &#34;function&#34;: {
        &#34;name&#34;: &#34;get_weather&#34;,
        &#34;description&#34;: &#34;获取指定城市的天气信息&#34;,
        &#34;parameters&#34;: {
          &#34;type&#34;: &#34;object&#34;,
          &#34;required&#34;: [&#34;city&#34;],
          &#34;properties&#34;: {
            &#34;city&#34;: { &#34;type&#34;: &#34;string&#34;, &#34;description&#34;: &#34;城市名称&#34; },
            &#34;unit&#34;: { &#34;type&#34;: &#34;string&#34;, &#34;enum&#34;: [&#34;celsius&#34;, &#34;fahrenheit&#34;], &#34;default&#34;: &#34;celsius&#34; }
          }
        }
      }
    }
  ]
}</code></pre>
<h3>模型调用工具</h3>
<pre><code class="language-json">{
  &#34;choices&#34;: [{
    &#34;message&#34;: {
      &#34;role&#34;: &#34;assistant&#34;,
      &#34;tool_calls&#34;: [{
        &#34;id&#34;: &#34;call_abc123&#34;,
        &#34;type&#34;: &#34;function&#34;,
        &#34;function&#34;: {
          &#34;name&#34;: &#34;get_weather&#34;,
          &#34;arguments&#34;: &#34;{\\&#34;city\\&#34;: \\&#34;北京\\&#34;, \\&#34;unit\\&#34;: \\&#34;celsius\\&#34;}&#34;
        }
      }]
    }
  }]
}</code></pre>
<h3>返回工具结果</h3>
<pre><code class="language-json">{
  &#34;messages&#34;: [
    { &#34;role&#34;: &#34;user&#34;, &#34;content&#34;: &#34;北京今天天气怎么样？&#34; },
    { &#34;role&#34;: &#34;assistant&#34;, &#34;tool_calls&#34;: [{ &#34;id&#34;: &#34;call_abc123&#34;, ... }] },
    {
      &#34;role&#34;: &#34;tool&#34;,
      &#34;tool_call_id&#34;: &#34;call_abc123&#34;,
      &#34;content&#34;: &#34;{\\&#34;city\\&#34;: \\&#34;北京\\&#34;, \\&#34;temperature\\&#34;: 5, \\&#34;condition\\&#34;: \\&#34;晴\\&#34;, \\&#34;humidity\\&#34;: 30}&#34;
    }
  ]
}</code></pre>
<p>模型根据工具返回的 JSON 生成最终回答。</p>
<h2>RAG 系统中的 JSON</h2>
<p>检索增强生成（RAG）系统中，JSON 用于存储和传递检索结果：</p>
<pre><code class="language-json">{
  &#34;messages&#34;: [
    {
      &#34;role&#34;: &#34;system&#34;,
      &#34;content&#34;: &#34;基于以下检索到的文档回答用户问题。如果文档中没有答案，请说明。&#34;
    },
    {
      &#34;role&#34;: &#34;user&#34;,
      &#34;content&#34;: &#34;退货政策是什么？\\n\\n---检索到的文档---\\n[{\\&#34;title\\&#34;: \\&#34;退货政策\\&#34;, \\&#34;content\\&#34;: \\&#34;自购买之日起30天内可无理由退货...\\&#34;, \\&#34;score\\&#34;: 0.95}, {\\&#34;title\\&#34;: \\&#34;运费说明\\&#34;, \\&#34;content\\&#34;: \\&#34;退货运费由买家承担...\\&#34;, \\&#34;score\\&#34;: 0.82}]&#34;
    }
  ]
}</code></pre>
<h3>向量数据库的 JSON 交互</h3>
<pre><code class="language-python"># Pinecone 示例
index.upsert(vectors=[
    {
        &#34;id&#34;: &#34;doc-001&#34;,
        &#34;values&#34;: embedding_vector,  # [0.1, 0.2, ...]
        &#34;metadata&#34;: {
            &#34;title&#34;: &#34;退货政策&#34;,
            &#34;category&#34;: &#34;customer-service&#34;,
            &#34;updated_at&#34;: &#34;2025-01-15&#34;
        }
    }
])

# 查询结果也是 JSON
results = index.query(
    vector=query_embedding,
    top_k=5,
    include_metadata=True
)
# results.matches = [
#   {&#34;id&#34;: &#34;doc-001&#34;, &#34;score&#34;: 0.95, &#34;metadata&#34;: {...}},
#   ...
# ]</code></pre>
<h2>AI Agent 的 JSON 通信</h2>
<p>AI Agent 使用 JSON 管理状态和行动计划：</p>
<pre><code class="language-json">{
  &#34;task&#34;: &#34;分析竞品定价并生成报告&#34;,
  &#34;steps&#34;: [
    {
      &#34;action&#34;: &#34;web_search&#34;,
      &#34;params&#34;: { &#34;query&#34;: &#34;竞品 A 最新定价&#34; },
      &#34;status&#34;: &#34;completed&#34;,
      &#34;result&#34;: { &#34;price&#34;: 999, &#34;source&#34;: &#34;official_site&#34; }
    },
    {
      &#34;action&#34;: &#34;web_search&#34;,
      &#34;params&#34;: { &#34;query&#34;: &#34;竞品 B 最新定价&#34; },
      &#34;status&#34;: &#34;completed&#34;,
      &#34;result&#34;: { &#34;price&#34;: 1299, &#34;source&#34;: &#34;jd.com&#34; }
    },
    {
      &#34;action&#34;: &#34;analyze&#34;,
      &#34;params&#34;: { &#34;type&#34;: &#34;price_comparison&#34; },
      &#34;status&#34;: &#34;in_progress&#34;
    },
    {
      &#34;action&#34;: &#34;generate_report&#34;,
      &#34;params&#34;: { &#34;format&#34;: &#34;markdown&#34; },
      &#34;status&#34;: &#34;pending&#34;
    }
  ],
  &#34;memory&#34;: {
    &#34;competitors&#34;: [&#34;A&#34;, &#34;B&#34;],
    &#34;our_price&#34;: 1099
  }
}</code></pre>
<h2>训练数据格式</h2>
<p>微调 LLM 的训练数据通常使用 JSONL（NDJSON）格式：</p>
<pre><code class="language-jsonl">{&#34;messages&#34;: [{&#34;role&#34;: &#34;system&#34;, &#34;content&#34;: &#34;你是客服助手&#34;}, {&#34;role&#34;: &#34;user&#34;, &#34;content&#34;: &#34;怎么退货？&#34;}, {&#34;role&#34;: &#34;assistant&#34;, &#34;content&#34;: &#34;您好，30天内可以申请退货...&#34;}]}
{&#34;messages&#34;: [{&#34;role&#34;: &#34;user&#34;, &#34;content&#34;: &#34;运费多少？&#34;}, {&#34;role&#34;: &#34;assistant&#34;, &#34;content&#34;: &#34;标准运费为10元...&#34;}]}</code></pre>
<p>每行一个训练样本，方便流式处理和追加。</p>
<h2>小结</h2>
<ul>
<li>JSON 是 LLM API 交互的标准格式（请求、响应、工具调用）</li>
<li>结构化输出通过 JSON Schema 约束保证可靠性</li>
<li>Function Calling 用 JSON Schema 定义工具接口</li>
<li>RAG 系统中 JSON 承载检索结果和上下文</li>
<li>训练数据使用 JSONL 格式，支持高效的流式处理</li>
<li>掌握 JSON 是构建 AI 应用的基础技能</li>
</ul>
`
};

