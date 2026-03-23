'use strict';
/**
 * json-tool-descriptions.js
 * SEO article content for JSON Validate & Format tools.
 * Loaded only on matching tool pages. Renders into #jt-desc-section.
 */

window.JT_DESCRIPTIONS = window.JT_DESCRIPTIONS || {};

/* ── 1. JSON Validator ─────────────────────────────────────────────────────── */
window.JT_DESCRIPTIONS['validate'] = {
zh: `
<h2>什么是 JSON 验证？</h2>
<p>JSON 验证用于检查数据是否符合 JSON 规范（RFC 8259）。有效的 JSON 文档必须具有正确匹配的括号、正确引用的键名、有效的值类型，且不能有多余的逗号。即使一个错位的字符也可能导致整个 API 响应或配置文件失效。</p>

<h2>为什么需要验证 JSON？</h2>
<ul>
  <li><strong>尽早发现语法错误</strong> — 在运行时故障发生前找到缺失的逗号、未闭合的括号和错误的引号</li>
  <li><strong>调试 API 响应</strong> — 快速定位第三方 API 返回的格式错误数据</li>
  <li><strong>检验配置文件</strong> — 确保配置文件在部署前是有效的</li>
  <li><strong>验证用户输入</strong> — 检查通过表单或文件上传提交的 JSON</li>
</ul>

<h2>常见 JSON 错误</h2>
<table class="jt-desc-table">
  <thead><tr><th>错误类型</th><th>示例</th><th>修复方法</th></tr></thead>
  <tbody>
    <tr><td>尾部多余逗号</td><td><code>{"a": 1,}</code></td><td>删除最后一个逗号</td></tr>
    <tr><td>使用单引号</td><td><code>{'key': 'value'}</code></td><td>使用双引号 <code>"key"</code></td></tr>
    <tr><td>键名未加引号</td><td><code>{name: "Alice"}</code></td><td>给所有键名加双引号</td></tr>
    <tr><td>缺少逗号</td><td><code>{"a": 1 "b": 2}</code></td><td>在键值对之间添加逗号</td></tr>
    <tr><td>包含注释</td><td><code>{"a": 1 // 注释}</code></td><td>删除注释（JSON 不支持注释）</td></tr>
  </tbody>
</table>

<h2>验证器工作原理</h2>
<ol>
  <li>在编辑器中<strong>粘贴或输入</strong> JSON</li>
  <li><strong>实时验证</strong>在输入时高亮错误</li>
  <li><strong>错误信息</strong>精确定位到行号和字符位置</li>
  <li><strong>自动格式化</strong>将有效 JSON 整理为规范缩进</li>
</ol>

<h2>编程验证方式</h2>
<p><strong>JavaScript</strong></p>
<pre><code class="language-javascript">function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}</code></pre>

<p><strong>Python</strong></p>
<pre><code class="language-python">import json

def is_valid_json(s):
    try:
        json.loads(s)
        return True
    except json.JSONDecodeError as e:
        print(f"第 {e.lineno} 行，第 {e.colno} 列错误：{e.msg}")
        return False</code></pre>

<h2>使用技巧</h2>
<ul>
  <li>💡 <strong>部署前验证</strong> — 在 CI/CD 流水线中加入 JSON 验证步骤，提前捕获配置错误</li>
  <li>💡 <strong>使用严格模式</strong> — 部分解析器比较宽松，本工具严格遵循 RFC 8259 规范</li>
  <li>💡 <strong>检查编码</strong> — 确保 JSON 使用 UTF-8 编码，BOM 字符可能导致验证失败</li>
</ul>
`,
en: `
<h2>What is JSON Validation?</h2>
<p>JSON validation checks whether your data conforms to the JSON specification (RFC 8259). A valid JSON document must have correctly matched brackets, properly quoted keys, valid value types, and no trailing commas. Even a single misplaced character can break an entire API response or configuration file.</p>

<h2>Why Validate JSON?</h2>
<ul>
  <li><strong>Catch syntax errors early</strong> — Find missing commas, unclosed brackets, and misquoted strings before they cause runtime failures</li>
  <li><strong>Debug API responses</strong> — Quickly identify malformed data from third-party APIs</li>
  <li><strong>Verify configuration files</strong> — Ensure config files are valid before deployment</li>
  <li><strong>Validate user input</strong> — Check JSON submitted through forms or file uploads</li>
</ul>

<h2>Common JSON Errors</h2>
<table class="jt-desc-table">
  <thead><tr><th>Error</th><th>Example</th><th>Fix</th></tr></thead>
  <tbody>
    <tr><td>Trailing comma</td><td><code>{"a": 1,}</code></td><td>Remove the last comma</td></tr>
    <tr><td>Single quotes</td><td><code>{'key': 'value'}</code></td><td>Use double quotes <code>"key"</code></td></tr>
    <tr><td>Unquoted keys</td><td><code>{name: "Alice"}</code></td><td>Quote all keys <code>"name"</code></td></tr>
    <tr><td>Missing comma</td><td><code>{"a": 1 "b": 2}</code></td><td>Add comma between pairs</td></tr>
    <tr><td>Comments</td><td><code>{"a": 1 // note}</code></td><td>Remove comments (not valid JSON)</td></tr>
  </tbody>
</table>

<h2>How Our Validator Works</h2>
<ol>
  <li><strong>Paste or type</strong> your JSON in the editor</li>
  <li><strong>Real-time validation</strong> highlights errors as you type</li>
  <li><strong>Error messages</strong> pinpoint the exact line and character position</li>
  <li><strong>Auto-format</strong> cleans up valid JSON with proper indentation</li>
</ol>

<h2>Programmatic Validation</h2>
<p><strong>JavaScript</strong></p>
<pre><code class="language-javascript">function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}</code></pre>

<p><strong>Python</strong></p>
<pre><code class="language-python">import json

def is_valid_json(s):
    try:
        json.loads(s)
        return True
    except json.JSONDecodeError as e:
        print(f"Error at line {e.lineno}, col {e.colno}: {e.msg}")
        return False</code></pre>

<p><strong>Command Line (with jq)</strong></p>
<pre><code class="language-bash">echo '{"key": "value"}' | jq . > /dev/null && echo "Valid" || echo "Invalid"</code></pre>

<h2>Pro Tips</h2>
<ul>
  <li>💡 <strong>Validate before deploying</strong> — Add JSON validation to your CI/CD pipeline to catch config errors</li>
  <li>💡 <strong>Use strict mode</strong> — Some parsers are lenient; our tool follows the strict RFC 8259 specification</li>
  <li>💡 <strong>Check encoding</strong> — Ensure your JSON is UTF-8 encoded; BOM characters can cause validation failures</li>
</ul>
`
};

/* ── 2. JSON Repair ─────────────────────────────────────────────────────────── */
window.JT_DESCRIPTIONS['repair'] = {
zh: `
<h2>什么是 JSON 修复？</h2>
<p>JSON 修复功能可以自动修正格式不正确的 JSON 中常见的语法错误，包括尾部逗号、单引号字符串、未加引号的键名、缺少引号等问题。这些问题通常在从日志文件、AI 大模型输出或代码注释中复制 JSON 时发生。</p>

<h2>修复前后对比</h2>
<p><strong>损坏的 JSON：</strong></p>
<pre><code>{
  name: 'Alice',
  age: 30,
  "hobbies": ["reading", "coding",],
  // 这是注释
  'active': True
}</code></pre>
<p><strong>修复后的 JSON：</strong></p>
<pre><code class="language-json">{
  "name": "Alice",
  "age": 30,
  "hobbies": ["reading", "coding"],
  "active": true
}</code></pre>

<h2>可修复的问题</h2>
<table class="jt-desc-table">
  <thead><tr><th>问题类型</th><th>修复前</th><th>修复后</th></tr></thead>
  <tbody>
    <tr><td>键名未加引号</td><td><code>{name: "Alice"}</code></td><td><code>{"name": "Alice"}</code></td></tr>
    <tr><td>使用单引号</td><td><code>{'key': 'val'}</code></td><td><code>{"key": "val"}</code></td></tr>
    <tr><td>尾部多余逗号</td><td><code>[1, 2, 3,]</code></td><td><code>[1, 2, 3]</code></td></tr>
    <tr><td>包含注释</td><td><code>{"a": 1 // 注释}</code></td><td><code>{"a": 1}</code></td></tr>
    <tr><td>Python 布尔值</td><td><code>True、False、None</code></td><td><code>true、false、null</code></td></tr>
    <tr><td>值未加引号</td><td><code>{key: value}</code></td><td><code>{"key": "value"}</code></td></tr>
  </tbody>
</table>

<h2>常见使用场景</h2>
<ul>
  <li><strong>AI 大模型输出</strong> — AI 模型有时会生成带注释、尾部逗号或单引号的 JSON</li>
  <li><strong>日志文件</strong> — 服务器日志中的 JSON 常有格式问题</li>
  <li><strong>复制粘贴错误</strong> — 从文档或代码注释中复制的 JSON 可能包含非标准语法</li>
  <li><strong>手动编辑</strong> — 手写 JSON 容易出现常见语法错误</li>
</ul>

<h2>使用技巧</h2>
<ul>
  <li>💡 <strong>务必检查修复结果</strong> — 自动修复基于假设，请核实输出是否符合预期</li>
  <li>💡 <strong>修复后再验证</strong> — 将修复后的 JSON 通过验证器确认正确性</li>
  <li>💡 <strong>JSONC 文件请用专门工具</strong> — 如果你有意使用注释，建议使用 JSONC 转 JSON 转换器</li>
</ul>
`,
en: `
<h2>What is JSON Repair?</h2>
<p>JSON Repair automatically fixes common syntax errors in malformed JSON. It handles issues like trailing commas, single-quoted strings, unquoted keys, missing quotes, and other problems that frequently occur when copying JSON from logs, LLM outputs, or code comments.</p>

<h2>Before and After</h2>
<p><strong>Broken JSON:</strong></p>
<pre><code>{
  name: 'Alice',
  age: 30,
  "hobbies": ["reading", "coding",],
  // This is a comment
  'active': True
}</code></pre>
<p><strong>Repaired JSON:</strong></p>
<pre><code class="language-json">{
  "name": "Alice",
  "age": 30,
  "hobbies": ["reading", "coding"],
  "active": true
}</code></pre>

<h2>What Gets Fixed?</h2>
<table class="jt-desc-table">
  <thead><tr><th>Issue</th><th>Before</th><th>After</th></tr></thead>
  <tbody>
    <tr><td>Unquoted keys</td><td><code>{name: "Alice"}</code></td><td><code>{"name": "Alice"}</code></td></tr>
    <tr><td>Single quotes</td><td><code>{'key': 'val'}</code></td><td><code>{"key": "val"}</code></td></tr>
    <tr><td>Trailing commas</td><td><code>[1, 2, 3,]</code></td><td><code>[1, 2, 3]</code></td></tr>
    <tr><td>Comments</td><td><code>{"a": 1 // note}</code></td><td><code>{"a": 1}</code></td></tr>
    <tr><td>Python booleans</td><td><code>True, False, None</code></td><td><code>true, false, null</code></td></tr>
    <tr><td>Missing quotes on values</td><td><code>{key: value}</code></td><td><code>{"key": "value"}</code></td></tr>
    <tr><td>Unescaped control characters</td><td>Newlines in strings</td><td>Escaped <code>\n</code></td></tr>
  </tbody>
</table>

<h2>Common Use Cases</h2>
<ul>
  <li><strong>LLM outputs</strong> — AI models sometimes produce JSON with comments, trailing commas, or single quotes</li>
  <li><strong>Log files</strong> — Server logs often contain semi-structured JSON with formatting issues</li>
  <li><strong>Copy-paste errors</strong> — JSON copied from documentation or code comments may include non-standard syntax</li>
  <li><strong>Manual editing</strong> — Hand-written JSON is prone to common syntax mistakes</li>
</ul>

<h2>Pro Tips</h2>
<ul>
  <li>💡 <strong>Always review repairs</strong> — Auto-repair makes assumptions; verify the output matches your intent</li>
  <li>💡 <strong>Use validation after repair</strong> — Run the repaired JSON through the validator to ensure correctness</li>
  <li>💡 <strong>For JSONC files</strong> — If you intentionally use comments, try the JSONC to JSON converter instead</li>
</ul>
`
};

/* ── 3. JSON Pretty Print ───────────────────────────────────────────────────── */
window.JT_DESCRIPTIONS['pretty'] = {
zh: `
<h2>什么是 JSON 格式化？</h2>
<p>JSON 格式化（也称为美化或 Pretty Print）会在 JSON 中添加空格、缩进和换行符，使其变为人类可读的格式。压缩后的 JSON 虽然节省带宽，但几乎无法阅读——格式化解决了这个问题。</p>

<h2>格式化前后对比</h2>
<p><strong>压缩版（66 字节）：</strong></p>
<pre><code>{"name":"John","age":30,"address":{"city":"New York","zip":"10001"}}</code></pre>
<p><strong>格式化后（138 字节）：</strong></p>
<pre><code class="language-json">{
  "name": "John",
  "age": 30,
  "address": {
    "city": "New York",
    "zip": "10001"
  }
}</code></pre>

<h2>格式化选项</h2>
<table class="jt-desc-table">
  <thead><tr><th>选项</th><th>说明</th><th>常见用途</th></tr></thead>
  <tbody>
    <tr><td>2 个空格</td><td>最流行的缩进方式</td><td>JavaScript、TypeScript、Node.js</td></tr>
    <tr><td>4 个空格</td><td>更宽的缩进</td><td>Java、Python、C#</td></tr>
    <tr><td>Tab</td><td>制表符缩进</td><td>Go、旧项目</td></tr>
    <tr><td>1 个空格</td><td>超紧凑可读格式</td><td>空间受限的显示场景</td></tr>
  </tbody>
</table>

<h2>格式化 vs 压缩</h2>
<table class="jt-desc-table">
  <thead><tr><th>格式化（Pretty Print）</th><th>压缩（Minify）</th></tr></thead>
  <tbody>
    <tr><td>添加空白字符</td><td>移除空白字符</td></tr>
    <tr><td>人类可读</td><td>机器优化</td></tr>
    <tr><td>文件体积更大</td><td>文件体积更小</td></tr>
    <tr><td>用于开发和调试</td><td>用于生产环境和网络传输</td></tr>
  </tbody>
</table>

<h2>编程实现</h2>
<p><strong>JavaScript</strong></p>
<pre><code class="language-javascript">// 2 空格缩进格式化
const formatted = JSON.stringify(JSON.parse(jsonString), null, 2);
// 第三个参数控制缩进：数字=空格数，字符串=字面量（如 "\t" 表示 Tab）</code></pre>

<p><strong>Python</strong></p>
<pre><code class="language-python">import json
formatted = json.dumps(json.loads(json_string), indent=2, ensure_ascii=False)
# 带键名排序
formatted = json.dumps(obj, indent=2, sort_keys=True)</code></pre>

<p><strong>命令行（jq）</strong></p>
<pre><code class="language-bash">cat data.json | jq '.'
# 带键名排序
cat data.json | jq -S '.'</code></pre>

<h2>使用技巧</h2>
<ul>
  <li>💡 <strong>排序键名便于对比</strong> — 开启键名排序可获得更清晰的版本控制差异</li>
  <li>💡 <strong>先验证再格式化</strong> — 如果格式化失败，你的 JSON 可能有语法错误</li>
  <li>💡 <strong>统一缩进风格</strong> — 与团队代码风格保持一致（检查 <code>.editorconfig</code> 或 <code>.prettierrc</code>）</li>
</ul>
`,
en: `
<h2>What is Pretty Printing?</h2>
<p>Pretty printing (also called beautifying or formatting) adds whitespace, indentation, and line breaks to JSON to make it human-readable. Minified JSON saves bandwidth but is nearly impossible to read—pretty printing solves this.</p>

<h2>Before and After</h2>
<p><strong>Minified (66 bytes):</strong></p>
<pre><code>{"name":"John","age":30,"address":{"city":"New York","zip":"10001"}}</code></pre>
<p><strong>Pretty Printed (138 bytes):</strong></p>
<pre><code class="language-json">{
  "name": "John",
  "age": 30,
  "address": {
    "city": "New York",
    "zip": "10001"
  }
}</code></pre>

<h2>Formatting Options</h2>
<table class="jt-desc-table">
  <thead><tr><th>Option</th><th>Description</th><th>Common Usage</th></tr></thead>
  <tbody>
    <tr><td>2 spaces</td><td>Most popular indentation</td><td>JavaScript, TypeScript, Node.js</td></tr>
    <tr><td>4 spaces</td><td>Wider indentation</td><td>Java, Python, C#</td></tr>
    <tr><td>Tab</td><td>Tab character indent</td><td>Go, legacy projects</td></tr>
    <tr><td>1 space</td><td>Ultra-compact readable</td><td>Space-constrained displays</td></tr>
  </tbody>
</table>

<h2>Pretty Print vs Minify</h2>
<table class="jt-desc-table">
  <thead><tr><th>Pretty Print</th><th>Minify</th></tr></thead>
  <tbody>
    <tr><td>Adds whitespace</td><td>Removes whitespace</td></tr>
    <tr><td>Human-readable</td><td>Machine-optimized</td></tr>
    <tr><td>Larger file size</td><td>Smaller file size</td></tr>
    <tr><td>For development &amp; debugging</td><td>For production &amp; network transfer</td></tr>
  </tbody>
</table>

<h2>Programmatic Pretty Print</h2>
<p><strong>JavaScript</strong></p>
<pre><code class="language-javascript">// Format with 2-space indentation
const formatted = JSON.stringify(JSON.parse(jsonString), null, 2);
// The third argument: number → spaces, string → literal (e.g. "\t" for tabs)</code></pre>

<p><strong>Python</strong></p>
<pre><code class="language-python">import json
formatted = json.dumps(json.loads(json_string), indent=2, ensure_ascii=False)
# With sorted keys
formatted = json.dumps(obj, indent=2, sort_keys=True)</code></pre>

<p><strong>Command Line (jq)</strong></p>
<pre><code class="language-bash">cat data.json | jq '.'
# With sorted keys
cat data.json | jq -S '.'</code></pre>

<h2>Pro Tips</h2>
<ul>
  <li>💡 <strong>Sort keys for diffs</strong> — Enable key sorting for cleaner version control diffs</li>
  <li>💡 <strong>Validate first</strong> — If formatting fails, your JSON likely has syntax errors</li>
  <li>💡 <strong>Consistent indentation</strong> — Match your team's code style (check <code>.editorconfig</code> or <code>.prettierrc</code>)</li>
</ul>
`
};

/* ── 4. JSON Minify ─────────────────────────────────────────────────────────── */
window.JT_DESCRIPTIONS['minify'] = {
zh: `
<h2>什么是 JSON 压缩？</h2>
<p>JSON 压缩（Minification）会移除 JSON 中所有不必要的空白字符（空格、制表符、换行符），同时保持 JSON 的有效性。结果是一个单行的紧凑字符串，体积更小但功能与原始数据完全相同。</p>

<h2>压缩前后对比</h2>
<p><strong>格式化版（287 字节）：</strong></p>
<pre><code class="language-json">{
  "user": {
    "name": "Alice",
    "email": "alice@example.com",
    "roles": ["admin", "editor"]
  }
}</code></pre>
<p><strong>压缩版（75 字节，缩小 74%）：</strong></p>
<pre><code>{"user":{"name":"Alice","email":"alice@example.com","roles":["admin","editor"]}}</code></pre>

<h2>何时应该压缩</h2>
<table class="jt-desc-table">
  <thead><tr><th>场景</th><th>是否压缩？</th></tr></thead>
  <tbody>
    <tr><td>生产环境 API 响应</td><td>✅ 是</td></tr>
    <tr><td>数据库存储</td><td>✅ 是（通常）</td></tr>
    <tr><td>版本控制中的配置文件</td><td>❌ 否（可读性更重要）</td></tr>
    <tr><td>开发 / 调试</td><td>❌ 否</td></tr>
    <tr><td>日志文件</td><td>✅ 是（节省磁盘空间）</td></tr>
    <tr><td>嵌入 HTML/JS</td><td>✅ 是</td></tr>
  </tbody>
</table>

<h2>压缩 vs 编码压缩</h2>
<p>JSON 压缩和编码压缩（gzip、Brotli）是互补的：</p>
<ul>
  <li><strong>JSON 压缩</strong> — 移除空白字符，体积减少约 60–80%</li>
  <li><strong>编码压缩</strong> — 算法压缩，额外减少约 70–90%</li>
  <li><strong>两者结合</strong> — 效果最佳，总体可减少高达 95%</li>
</ul>

<h2>编程实现</h2>
<p><strong>JavaScript</strong></p>
<pre><code class="language-javascript">const minified = JSON.stringify(JSON.parse(jsonString));</code></pre>

<p><strong>Python</strong></p>
<pre><code class="language-python">import json
minified = json.dumps(json.loads(json_string), separators=(',', ':'))</code></pre>

<p><strong>命令行（jq）</strong></p>
<pre><code class="language-bash">jq -c '.' data.json > data.min.json</code></pre>

<h2>使用技巧</h2>
<ul>
  <li>💡 <strong>先验证再压缩</strong> — 压缩前使用 JSON 验证器检查错误</li>
  <li>💡 <strong>保留原始文件</strong> — 在源代码管理中存储格式化版本，构建/部署时再压缩</li>
  <li>💡 <strong>启用服务器压缩</strong> — 配置服务器对 JSON 响应启用 gzip，获得最大节省</li>
</ul>
`,
en: `
<h2>What is JSON Minification?</h2>
<p>Minification removes all unnecessary whitespace (spaces, tabs, newlines) from JSON while keeping it valid. The result is a single-line, compact string that's smaller in size but functionally identical to the original.</p>

<h2>Before and After</h2>
<p><strong>Formatted (287 bytes):</strong></p>
<pre><code class="language-json">{
  "user": {
    "name": "Alice",
    "email": "alice@example.com",
    "roles": ["admin", "editor"]
  }
}</code></pre>
<p><strong>Minified (75 bytes — 74% smaller):</strong></p>
<pre><code>{"user":{"name":"Alice","email":"alice@example.com","roles":["admin","editor"]}}</code></pre>

<h2>When to Minify</h2>
<table class="jt-desc-table">
  <thead><tr><th>Scenario</th><th>Minify?</th></tr></thead>
  <tbody>
    <tr><td>Production API responses</td><td>✅ Yes</td></tr>
    <tr><td>Storing in databases</td><td>✅ Yes (usually)</td></tr>
    <tr><td>Config files in version control</td><td>❌ No (readability matters)</td></tr>
    <tr><td>Development / debugging</td><td>❌ No</td></tr>
    <tr><td>Log files</td><td>✅ Yes (saves disk space)</td></tr>
    <tr><td>Embedded in HTML/JS</td><td>✅ Yes</td></tr>
  </tbody>
</table>

<h2>Minification vs Compression</h2>
<p>Minification and compression (gzip, Brotli) are complementary:</p>
<ul>
  <li><strong>Minification</strong> — Removes whitespace, ~60–80% size reduction</li>
  <li><strong>Compression</strong> — Algorithmic compression, ~70–90% additional reduction</li>
  <li><strong>Both together</strong> — Best results, up to 95% total size reduction</li>
</ul>

<h2>Programmatic Minification</h2>
<p><strong>JavaScript</strong></p>
<pre><code class="language-javascript">const minified = JSON.stringify(JSON.parse(jsonString));</code></pre>

<p><strong>Python</strong></p>
<pre><code class="language-python">import json
minified = json.dumps(json.loads(json_string), separators=(',', ':'))</code></pre>

<p><strong>Command Line (jq)</strong></p>
<pre><code class="language-bash">jq -c '.' data.json > data.min.json</code></pre>

<h2>Pro Tips</h2>
<ul>
  <li>💡 <strong>Validate first</strong> — Use the JSON Validator before minifying to catch errors</li>
  <li>💡 <strong>Keep originals</strong> — Store formatted JSON in source control, minify during build/deploy</li>
  <li>💡 <strong>Enable server compression</strong> — Configure your server to gzip JSON responses for maximum savings</li>
</ul>
`
};

/* ── 5. JSON Sort Keys ──────────────────────────────────────────────────────── */
window.JT_DESCRIPTIONS['sort-keys'] = {
zh: `
<h2>什么是 JSON 键名排序？</h2>
<p>JSON 键名排序会按字母顺序重新排列 JSON 文档中所有对象的键名。虽然 JSON 对象在技术上是无序的，但一致的键名顺序能让数据更易于阅读、比较和在版本控制中管理。</p>

<h2>排序前后对比</h2>
<p><strong>排序前：</strong></p>
<pre><code class="language-json">{
  "zip": "10001",
  "name": "Alice",
  "age": 30,
  "city": "New York"
}</code></pre>
<p><strong>排序后（A → Z）：</strong></p>
<pre><code class="language-json">{
  "age": 30,
  "city": "New York",
  "name": "Alice",
  "zip": "10001"
}</code></pre>

<h2>为什么需要排序键名？</h2>
<ul>
  <li><strong>更干净的差异对比</strong> — 一致的键名顺序在 Git 中产生更小、更有意义的差异</li>
  <li><strong>更容易浏览</strong> — 大对象中按字母排序后能快速找到目标键</li>
  <li><strong>确定性输出</strong> — 排序的键名确保相同数据始终生成相同的 JSON 字符串</li>
  <li><strong>API 测试</strong> — 无论服务器端键名顺序如何，都能可靠地比较 API 响应</li>
</ul>

<h2>编程实现</h2>
<p><strong>JavaScript</strong></p>
<pre><code class="language-javascript">function sortKeys(obj) {
  if (Array.isArray(obj)) return obj.map(sortKeys);
  if (obj && typeof obj === 'object') {
    return Object.keys(obj).sort().reduce((sorted, key) => {
      sorted[key] = sortKeys(obj[key]);
      return sorted;
    }, {});
  }
  return obj;
}</code></pre>

<p><strong>Python</strong></p>
<pre><code class="language-python">import json
sorted_json = json.dumps(data, sort_keys=True, indent=2)</code></pre>

<p><strong>命令行（jq）</strong></p>
<pre><code class="language-bash">jq -S '.' data.json</code></pre>

<h2>使用技巧</h2>
<ul>
  <li>💡 <strong>提交前排序</strong> — 在 pre-commit 钩子中加入键名排序，保持 JSON 文件一致性</li>
  <li>💡 <strong>对比前排序</strong> — 比较两个 JSON 时先排序，消除键名重排产生的假差异</li>
  <li>💡 <strong>数组保持原序</strong> — 排序仅影响对象键名，数组元素顺序不变</li>
</ul>
`,
en: `
<h2>What is JSON Key Sorting?</h2>
<p>JSON key sorting alphabetically reorders all object keys throughout your JSON document. While JSON objects are technically unordered, consistent key ordering makes data easier to read, compare, and manage in version control.</p>

<h2>Before and After</h2>
<p><strong>Unsorted:</strong></p>
<pre><code class="language-json">{
  "zip": "10001",
  "name": "Alice",
  "age": 30,
  "city": "New York"
}</code></pre>
<p><strong>Sorted (A → Z):</strong></p>
<pre><code class="language-json">{
  "age": 30,
  "city": "New York",
  "name": "Alice",
  "zip": "10001"
}</code></pre>

<h2>Why Sort JSON Keys?</h2>
<ul>
  <li><strong>Cleaner diffs</strong> — Consistent key order produces minimal, meaningful diffs in Git</li>
  <li><strong>Easier scanning</strong> — Find keys quickly in large objects when they're alphabetized</li>
  <li><strong>Deterministic output</strong> — Sorted keys ensure the same data always produces the same JSON string</li>
  <li><strong>API testing</strong> — Compare API responses reliably regardless of server-side key ordering</li>
</ul>

<h2>Programmatic Key Sorting</h2>
<p><strong>JavaScript</strong></p>
<pre><code class="language-javascript">function sortKeys(obj) {
  if (Array.isArray(obj)) return obj.map(sortKeys);
  if (obj && typeof obj === 'object') {
    return Object.keys(obj).sort().reduce((sorted, key) => {
      sorted[key] = sortKeys(obj[key]);
      return sorted;
    }, {});
  }
  return obj;
}</code></pre>

<p><strong>Python</strong></p>
<pre><code class="language-python">import json
sorted_json = json.dumps(data, sort_keys=True, indent=2)</code></pre>

<p><strong>Command Line (jq)</strong></p>
<pre><code class="language-bash">jq -S '.' data.json</code></pre>

<h2>Pro Tips</h2>
<ul>
  <li>💡 <strong>Sort before committing</strong> — Add key sorting to your pre-commit hook for consistent JSON files</li>
  <li>💡 <strong>Sort before diffing</strong> — Sort both JSON documents before comparing to eliminate false positives from key reordering</li>
  <li>💡 <strong>Arrays stay ordered</strong> — Sorting only affects object keys; array element order is preserved</li>
</ul>
`
};

/* ── 6. JSON Escape ─────────────────────────────────────────────────────────── */
window.JT_DESCRIPTIONS['escape'] = {
zh: `
<h2>什么是 JSON 转义？</h2>
<p>JSON 转义通过在特殊字符前添加反斜杠（<code>\</code>）将 JSON 字符串转换为可安全嵌入的格式。当需要将 JSON 嵌入到另一个 JSON 字符串、JavaScript 变量或 HTML 属性中时，这是必要的操作。</p>

<h2>转义前后对比</h2>
<p><strong>原始 JSON：</strong></p>
<pre><code class="language-json">{"message": "Hello \"World\"", "path": "C:\\Users\\data"}</code></pre>
<p><strong>转义后：</strong></p>
<pre><code>{\"message\": \"Hello \\\"World\\\"\", \"path\": \"C:\\\\Users\\\\data\"}</code></pre>

<h2>被转义的字符</h2>
<table class="jt-desc-table">
  <thead><tr><th>字符</th><th>转义后</th><th>说明</th></tr></thead>
  <tbody>
    <tr><td><code>"</code></td><td><code>\"</code></td><td>双引号</td></tr>
    <tr><td><code>\</code></td><td><code>\\</code></td><td>反斜杠</td></tr>
    <tr><td><code>/</code></td><td><code>\/</code></td><td>正斜杠（可选）</td></tr>
    <tr><td>换行符</td><td><code>\\n</code></td><td>Newline</td></tr>
    <tr><td>制表符</td><td><code>\\t</code></td><td>Tab</td></tr>
    <tr><td>回车符</td><td><code>\\r</code></td><td>Carriage Return</td></tr>
  </tbody>
</table>

<h2>常见使用场景</h2>
<ul>
  <li><strong>嵌入 JSON 到字符串</strong> — 将 JSON 作为字符串值存储在另一个 JSON 文档中</li>
  <li><strong>API 请求体</strong> — 在特定 API 格式中将 JSON 数据包装在字符串字段中</li>
  <li><strong>JavaScript 模板</strong> — 在 JS 代码中安全嵌入 JSON</li>
  <li><strong>数据库存储</strong> — 将 JSON 字符串存储在文本列中</li>
</ul>

<h2>使用技巧</h2>
<ul>
  <li>💡 <strong>嵌套需要多重转义</strong> — 每一层嵌套都需要额外一轮转义</li>
  <li>💡 <strong>使用反转义还原</strong> — 收到转义后的 JSON 时，使用反转义工具还原</li>
  <li>💡 <strong>优先使用语言内置函数</strong> — 大多数编程语言内置了 <code>JSON.stringify()</code> 等自动处理转义的函数</li>
</ul>
`,
en: `
<h2>What is JSON Escaping?</h2>
<p>JSON escaping converts a JSON string into a safely embeddable format by adding backslash escapes to special characters. This is essential when you need to embed JSON inside another JSON string, a JavaScript variable, or an HTML attribute.</p>

<h2>Before and After</h2>
<p><strong>Original JSON:</strong></p>
<pre><code class="language-json">{"message": "Hello \"World\"", "path": "C:\\Users\\data"}</code></pre>
<p><strong>Escaped:</strong></p>
<pre><code>{\"message\": \"Hello \\\"World\\\"\", \"path\": \"C:\\\\Users\\\\data\"}</code></pre>

<h2>Characters That Get Escaped</h2>
<table class="jt-desc-table">
  <thead><tr><th>Character</th><th>Escaped</th><th>Description</th></tr></thead>
  <tbody>
    <tr><td><code>"</code></td><td><code>\"</code></td><td>Double quote</td></tr>
    <tr><td><code>\</code></td><td><code>\\</code></td><td>Backslash</td></tr>
    <tr><td><code>/</code></td><td><code>\/</code></td><td>Forward slash (optional)</td></tr>
    <tr><td>newline</td><td><code>\\n</code></td><td>Newline</td></tr>
    <tr><td>tab</td><td><code>\\t</code></td><td>Tab</td></tr>
    <tr><td>carriage return</td><td><code>\\r</code></td><td>Carriage return</td></tr>
  </tbody>
</table>

<h2>Common Use Cases</h2>
<ul>
  <li><strong>Embedding JSON in strings</strong> — Store JSON as a string value inside another JSON document</li>
  <li><strong>API payloads</strong> — Wrap JSON data in a string field for certain API formats</li>
  <li><strong>JavaScript template literals</strong> — Safely embed JSON in JS code</li>
  <li><strong>Database storage</strong> — Store JSON strings in text columns</li>
</ul>

<h2>Pro Tips</h2>
<ul>
  <li>💡 <strong>Double-escape for nesting</strong> — Each layer of embedding requires an additional round of escaping</li>
  <li>💡 <strong>Use Unescape to reverse</strong> — If you receive escaped JSON, use the Unescape tool to restore it</li>
  <li>💡 <strong>Check your language's built-in</strong> — Most languages have <code>JSON.stringify()</code> or equivalent that handles escaping automatically</li>
</ul>
`
};

/* ── 7. JSON Unescape ───────────────────────────────────────────────────────── */
window.JT_DESCRIPTIONS['unescape'] = {
zh: `
<h2>什么是 JSON 反转义？</h2>
<p>JSON 反转义是转义的逆过程——将转义字符（<code>\"</code>、<code>\\</code>、<code>\\n</code>）还原为原始形式，将字符串化的 JSON 还原为结构正确的 JSON 文档。</p>

<h2>反转义前后对比</h2>
<p><strong>转义后的字符串：</strong></p>
<pre><code>{\"name\":\"Alice\",\"message\":\"Hello\\nWorld\"}</code></pre>
<p><strong>反转义后的 JSON：</strong></p>
<pre><code class="language-json">{"name": "Alice", "message": "Hello\nWorld"}</code></pre>

<h2>何时需要反转义</h2>
<ul>
  <li><strong>API 调试</strong> — 某些 API 返回被字符串包裹的 JSON，需要反转义才能查看实际数据</li>
  <li><strong>日志分析</strong> — 日志条目中常包含需要解包的双重转义 JSON</li>
  <li><strong>数据库查询</strong> — 以转义字符串形式存储的 JSON 需要反转义以便阅读</li>
  <li><strong>嵌套 JSON 字符串</strong> — 从字符串字段中提取嵌入的 JSON</li>
</ul>

<h2>使用技巧</h2>
<ul>
  <li>💡 <strong>多层转义</strong> — 如果第一次反转义后仍有转义字符，可能存在嵌套转义，需再次运行</li>
  <li>💡 <strong>反转义后验证</strong> — 确保反转义结果是有效的 JSON</li>
  <li>💡 <strong>使用美化功能</strong> — 反转义后点击"JSON 美化"按钮，可以立即格式化为易读格式</li>
</ul>
`,
en: `
<h2>What is JSON Unescaping?</h2>
<p>JSON unescaping reverses the escaping process—it converts escaped characters (<code>\"</code>, <code>\\</code>, <code>\\n</code>) back to their original form, turning a stringified JSON back into a properly structured JSON document.</p>

<h2>Before and After</h2>
<p><strong>Escaped string:</strong></p>
<pre><code>{\"name\":\"Alice\",\"message\":\"Hello\\nWorld\"}</code></pre>
<p><strong>Unescaped JSON:</strong></p>
<pre><code class="language-json">{"name": "Alice", "message": "Hello\nWorld"}</code></pre>

<h2>When to Unescape</h2>
<ul>
  <li><strong>API debugging</strong> — Some APIs return JSON wrapped in a string; unescape to inspect the actual data</li>
  <li><strong>Log analysis</strong> — Log entries often contain double-escaped JSON that needs unwrapping</li>
  <li><strong>Database queries</strong> — JSON stored as escaped strings needs unescaping for readability</li>
  <li><strong>Nested JSON strings</strong> — Extract embedded JSON from string fields</li>
</ul>

<h2>Pro Tips</h2>
<ul>
  <li>💡 <strong>Multiple layers</strong> — If the first unescape still shows escaped characters, run it again for nested escaping</li>
  <li>💡 <strong>Validate after unescaping</strong> — Ensure the result is valid JSON after unescaping</li>
  <li>💡 <strong>Use Beautify</strong> — After unescaping, click the "Beautify" button to format the result for readability</li>
</ul>
`
};

/* ── 8. JSON Stringify ──────────────────────────────────────────────────────── */
window.JT_DESCRIPTIONS['stringify'] = {
zh: `
<h2>什么是 JSON 字符串化？</h2>
<p>JSON 字符串化（Stringify）将 JavaScript 对象或 JSON 值转换为 JSON 格式的字符串。这是序列化数据以进行存储、传输或嵌入的标准方法。本工具还可以将 JSON 文档转换为适合在代码中使用的字符串表示。</p>

<h2>字符串化前后对比</h2>
<p><strong>JSON 对象：</strong></p>
<pre><code class="language-json">{
  "name": "Alice",
  "scores": [95, 87, 92]
}</code></pre>
<p><strong>字符串化后：</strong></p>
<pre><code>"{\n  \"name\": \"Alice\",\n  \"scores\": [95, 87, 92]\n}"</code></pre>

<h2>常见使用场景</h2>
<ul>
  <li><strong>API 请求</strong> — 为 <code>fetch()</code> 或 <code>XMLHttpRequest</code> 的请求体序列化对象</li>
  <li><strong>localStorage</strong> — 将对象以 JSON 字符串形式存储在浏览器存储中</li>
  <li><strong>日志记录</strong> — 将对象转换为可读字符串用于控制台输出</li>
  <li><strong>代码生成</strong> — 生成 JSON 字符串字面量用于嵌入源代码</li>
</ul>

<h2>JSON.stringify() 参数说明</h2>
<pre><code class="language-javascript">// 基础用法
JSON.stringify({ name: "Alice", age: 30 });
// '{"name":"Alice","age":30}'

// 带缩进格式化
JSON.stringify(data, null, 2);

// 过滤字段
JSON.stringify(data, ["name", "email"]);

// 使用 replacer 函数
JSON.stringify(data, (key, value) =>
  typeof value === 'string' ? value.toUpperCase() : value
);</code></pre>

<h2>Python 实现</h2>
<pre><code class="language-python">import json
json_string = json.dumps(data, ensure_ascii=False)</code></pre>

<h2>使用技巧</h2>
<ul>
  <li>💡 <strong>循环引用</strong> — <code>JSON.stringify()</code> 遇到循环引用会抛出错误，需使用 replacer 处理</li>
  <li>💡 <strong>undefined 值</strong> — 值为 <code>undefined</code> 的属性会被静默忽略</li>
  <li>💡 <strong>Date 对象</strong> — 日期会被序列化为 ISO 格式字符串，而非 Date 对象</li>
</ul>
`,
en: `
<h2>What is JSON Stringify?</h2>
<p>JSON Stringify converts a JavaScript object or JSON value into a JSON-formatted string. It's the standard way to serialize data for storage, transmission, or embedding. This tool also lets you convert a JSON document into a string representation suitable for use in code.</p>

<h2>Before and After</h2>
<p><strong>JSON object:</strong></p>
<pre><code class="language-json">{
  "name": "Alice",
  "scores": [95, 87, 92]
}</code></pre>
<p><strong>Stringified:</strong></p>
<pre><code>"{\n  \"name\": \"Alice\",\n  \"scores\": [95, 87, 92]\n}"</code></pre>

<h2>Common Use Cases</h2>
<ul>
  <li><strong>API requests</strong> — Serialize objects for <code>fetch()</code> or <code>XMLHttpRequest</code> body</li>
  <li><strong>localStorage</strong> — Store objects as JSON strings in browser storage</li>
  <li><strong>Logging</strong> — Convert objects to readable strings for console output</li>
  <li><strong>Code generation</strong> — Generate JSON string literals for embedding in source code</li>
</ul>

<h2>JSON.stringify() Options</h2>
<pre><code class="language-javascript">// Basic stringify
JSON.stringify({ name: "Alice", age: 30 });
// '{"name":"Alice","age":30}'

// With indentation
JSON.stringify(data, null, 2);

// With replacer (filter properties)
JSON.stringify(data, ["name", "email"]);

// With replacer function
JSON.stringify(data, (key, value) =>
  typeof value === 'string' ? value.toUpperCase() : value
);</code></pre>

<h2>Python</h2>
<pre><code class="language-python">import json
json_string = json.dumps(data, ensure_ascii=False)</code></pre>

<h2>Pro Tips</h2>
<ul>
  <li>💡 <strong>Circular references</strong> — <code>JSON.stringify()</code> throws on circular references; use a replacer to handle them</li>
  <li>💡 <strong>Undefined values</strong> — Properties with <code>undefined</code> values are silently omitted</li>
  <li>💡 <strong>Date objects</strong> — Dates are serialized as ISO strings, not Date objects</li>
</ul>
`
};

/* ── Render on page load ─────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {
  var tool = window.JT_TOOL || '';
  var lang = window.JT_LANG || 'zh';
  var desc = window.JT_DESCRIPTIONS[tool];
  if (!desc) return;

  var section = document.getElementById('jt-desc-section');
  if (!section) return;

  var content = desc[lang] || desc['en'] || '';
  if (!content) return;

  section.innerHTML =
    '<div class="jt-container jt-desc-inner">' +
    '<div class="jt-desc-body">' + content + '</div>' +
    '</div>';
  section.style.display = '';
});

