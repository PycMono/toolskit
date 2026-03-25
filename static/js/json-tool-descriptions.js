/* @license MIT */
/* cloudflare-skip-minify */
'use strict';
/**
 * json-tool-descriptions.js
 * SEO article content for JSON Validate & Format tools.
 * Loaded only on matching tool pages. Renders into #jt-desc-section.
 *
 * NOTE: Do NOT enable Cloudflare JS Auto-Minify for this file.
 * The multi-line template strings contain HTML that will be corrupted by minification.
 * Cloudflare Dashboard → Speed → Optimization → turn OFF "JavaScript" under Auto Minify.
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

/* ── 9. JSON Tree Viewer ────────────────────────────────────────────────────── */
window.JT_DESCRIPTIONS['tree'] = {
zh: `
<h2>什么是 JSON 树形查看器？</h2>
<p>JSON 树形查看器将 JSON 数据以可交互的树状结构展示，支持节点的折叠与展开。相比在编辑器中逐行阅读，树形视图能让你一目了然地掌握数据的嵌套层次，快速定位目标字段。</p>

<h2>主要功能</h2>
<ul>
  <li><strong>折叠/展开</strong> — 点击节点旁的箭头可自由收起或展开子树</li>
  <li><strong>一键全展/全折</strong> — 顶部按钮可批量展开或折叠所有节点</li>
  <li><strong>复制路径</strong> — 点击任意键名，自动复制该字段的 JSONPath 表达式（如 <code>$.user.address.city</code>）</li>
  <li><strong>类型着色</strong> — 字符串、数字、布尔值、null 分别用不同颜色标识，一眼识别数据类型</li>
</ul>

<h2>适用场景</h2>
<table class="jt-desc-table">
  <thead><tr><th>场景</th><th>说明</th></tr></thead>
  <tbody>
    <tr><td>调试 API 响应</td><td>快速浏览大型 API 返回的嵌套数据</td></tr>
    <tr><td>配置文件审查</td><td>检查复杂配置文件的结构与层级</td></tr>
    <tr><td>数据建模</td><td>分析真实 JSON 样本，辅助设计数据结构</td></tr>
    <tr><td>文档输出</td><td>截图树形视图，用于技术文档和汇报</td></tr>
  </tbody>
</table>

<h2>颜色规范</h2>
<table class="jt-desc-table">
  <thead><tr><th>颜色</th><th>数据类型</th><th>示例</th></tr></thead>
  <tbody>
    <tr><td>蓝色</td><td>字符串</td><td><code>"Hello"</code></td></tr>
    <tr><td>橙色</td><td>数字</td><td><code>42</code>, <code>3.14</code></td></tr>
    <tr><td>绿色</td><td>布尔值</td><td><code>true</code>, <code>false</code></td></tr>
    <tr><td>灰色</td><td>null</td><td><code>null</code></td></tr>
  </tbody>
</table>

<h2>使用技巧</h2>
<ul>
  <li>💡 <strong>超大 JSON</strong> — 对于超过 1000 个节点的 JSON，树形视图默认折叠深层节点以保持流畅</li>
  <li>💡 <strong>配合 JSONPath</strong> — 复制节点路径后，直接粘贴到 JSON Path 查询工具中提取数据</li>
  <li>💡 <strong>深度优先阅读</strong> — 先从根节点展开一级，了解顶层结构，再逐层深入</li>
</ul>
`,
en: `
<h2>What is a JSON Tree Viewer?</h2>
<p>A JSON Tree Viewer renders your JSON data as an interactive, collapsible tree structure. Instead of reading raw JSON line by line, the tree view lets you instantly grasp the nesting hierarchy and navigate directly to the field you care about.</p>

<h2>Key Features</h2>
<ul>
  <li><strong>Collapse / Expand</strong> — Click the arrow next to any node to toggle its children</li>
  <li><strong>Expand All / Collapse All</strong> — Buttons to batch-expand or collapse the entire tree</li>
  <li><strong>Copy Path</strong> — Click any key to copy its JSONPath expression (e.g. <code>$.user.address.city</code>)</li>
  <li><strong>Type Coloring</strong> — Strings, numbers, booleans and null each get a distinct color for instant type recognition</li>
</ul>

<h2>Common Use Cases</h2>
<table class="jt-desc-table">
  <thead><tr><th>Use Case</th><th>Description</th></tr></thead>
  <tbody>
    <tr><td>API response debugging</td><td>Browse deeply nested API responses at a glance</td></tr>
    <tr><td>Config file review</td><td>Audit the structure and nesting of complex config files</td></tr>
    <tr><td>Data modeling</td><td>Analyze real JSON samples to design data structures</td></tr>
    <tr><td>Documentation</td><td>Screenshot the tree view for technical docs and presentations</td></tr>
  </tbody>
</table>

<h2>Color Guide</h2>
<table class="jt-desc-table">
  <thead><tr><th>Color</th><th>Type</th><th>Example</th></tr></thead>
  <tbody>
    <tr><td>Blue</td><td>String</td><td><code>"Hello"</code></td></tr>
    <tr><td>Orange</td><td>Number</td><td><code>42</code>, <code>3.14</code></td></tr>
    <tr><td>Green</td><td>Boolean</td><td><code>true</code>, <code>false</code></td></tr>
    <tr><td>Gray</td><td>Null</td><td><code>null</code></td></tr>
  </tbody>
</table>

<h2>Pro Tips</h2>
<ul>
  <li>💡 <strong>Large JSON</strong> — For JSON with 1000+ nodes, deep levels are collapsed by default to keep the view responsive</li>
  <li>💡 <strong>Pair with JSONPath</strong> — Copy a node path, then paste it directly into the JSON Path tool to extract data</li>
  <li>💡 <strong>Top-down reading</strong> — Expand the root one level first to understand the top-level shape, then drill deeper</li>
</ul>
`
};

/* ── 10. JSON Table Viewer ──────────────────────────────────────────────────── */
window.JT_DESCRIPTIONS['table'] = {
zh: `
<h2>什么是 JSON 表格查看器？</h2>
<p>JSON 表格查看器将 JSON 数组渲染为可排序、可搜索的交互式表格。当你有一批结构相同的对象（如 API 返回的列表数据、CSV 导入的记录）时，表格视图比树形视图更直观，更方便横向比较各行数据。</p>

<h2>主要功能</h2>
<ul>
  <li><strong>可排序列</strong> — 点击列标题按升序/降序排列数据</li>
  <li><strong>实时搜索</strong> — 输入关键词实时过滤匹配的行</li>
  <li><strong>自动提取字段</strong> — 自动读取��有对象的键名作为列标题</li>
  <li><strong>行数统计</strong> — 实时显示当前过滤结果的行数</li>
</ul>

<h2>适用数据格式</h2>
<pre><code class="language-json">[
  { "name": "Alice", "age": 30, "city": "Beijing" },
  { "name": "Bob",   "age": 25, "city": "Shanghai" },
  { "name": "Carol", "age": 28, "city": "Shenzhen" }
]</code></pre>
<p>输入必须是 JSON <strong>数组</strong>，且数组元素应为对象。纯数字或字符串数组不适合表格展示。</p>

<h2>典型使用场景</h2>
<table class="jt-desc-table">
  <thead><tr><th>场景</th><th>说明</th></tr></thead>
  <tbody>
    <tr><td>分析列表 API</td><td>将 /users、/products 等列表接口返回数据可视化</td></tr>
    <tr><td>CSV 转 JSON 后浏览</td><td>将 CSV 转为 JSON 后用表格核对数据</td></tr>
    <tr><td>数据库查询结果</td><td>将数据库导出的 JSON 格式查询结果快速浏览</td></tr>
    <tr><td>日志分析</td><td>将结构化日志数组用表格过滤查找特定事件</td></tr>
  </tbody>
</table>

<h2>使用技巧</h2>
<ul>
  <li>💡 <strong>字段不一致</strong> — 各行字段不同时，缺失字段显示为空，不会报错</li>
  <li>💡 <strong>搜索支持子字符串</strong> — 搜索框对所有字段值做包含匹配，包括嵌套 JSON</li>
  <li>💡 <strong>先转再看</strong> — 可将 CSV / Excel 先转为 JSON 再用表格查看器浏览</li>
</ul>
`,
en: `
<h2>What is a JSON Table Viewer?</h2>
<p>The JSON Table Viewer renders a JSON array as an interactive, sortable, and searchable table. When you have a collection of similarly-structured objects—like API list responses or CSV-imported records—a table view is far more convenient than a tree for comparing rows side-by-side.</p>

<h2>Key Features</h2>
<ul>
  <li><strong>Sortable columns</strong> — Click any column header to sort ascending or descending</li>
  <li><strong>Live search</strong> — Filter rows in real time by typing a keyword</li>
  <li><strong>Auto-detect columns</strong> — Automatically extracts all unique keys as column headers</li>
  <li><strong>Row count</strong> — Shows how many rows match the current filter</li>
</ul>

<h2>Expected Input Format</h2>
<pre><code class="language-json">[
  { "name": "Alice", "age": 30, "city": "Beijing" },
  { "name": "Bob",   "age": 25, "city": "Shanghai" },
  { "name": "Carol", "age": 28, "city": "Shenzhen" }
]</code></pre>
<p>Input must be a JSON <strong>array</strong> of objects. Arrays of plain numbers or strings are not suited for table display.</p>

<h2>Typical Use Cases</h2>
<table class="jt-desc-table">
  <thead><tr><th>Use Case</th><th>Description</th></tr></thead>
  <tbody>
    <tr><td>Inspect list APIs</td><td>Visualize /users, /products and other list endpoints</td></tr>
    <tr><td>Post CSV-to-JSON</td><td>Convert CSV to JSON then browse and verify with the table</td></tr>
    <tr><td>Database exports</td><td>Quickly scan JSON-format query results from a database</td></tr>
    <tr><td>Log analysis</td><td>Filter structured log arrays to find specific events</td></tr>
  </tbody>
</table>

<h2>Pro Tips</h2>
<ul>
  <li>💡 <strong>Inconsistent fields</strong> — If rows have different keys, missing fields display as empty without errors</li>
  <li>💡 <strong>Full-value search</strong> — The search box matches against all field values, including nested JSON strings</li>
  <li>💡 <strong>Convert then view</strong> — Use CSV-to-JSON or Excel-to-JSON first, then open the result here</li>
</ul>
`
};

/* ── 11. JSON Diff ──────────────────────────────────────────────────────────── */
window.JT_DESCRIPTIONS['diff'] = {
zh: `
<h2>什么是 JSON 对比（Diff）？</h2>
<p>JSON Diff 工具将两段 JSON 并排对比，高亮显示新增、删除和修改的字段。无论是调试 API 版本差异、比对配置文件改动，还是审核数据变更，Diff 工具都能让你瞬间看清两段数据之间的所有不同。</p>

<h2>差异类型说明</h2>
<table class="jt-desc-table">
  <thead><tr><th>类型</th><th>颜色标记</th><th>含义</th></tr></thead>
  <tbody>
    <tr><td>新增 (+)</td><td>绿色</td><td>右侧有、左侧没有的字段</td></tr>
    <tr><td>删除 (-)</td><td>红色</td><td>左侧有、右侧没有的字段</td></tr>
    <tr><td>修改 (~)</td><td>黄色</td><td>两侧都有但值不同的字段</td></tr>
    <tr><td>相同</td><td>无标记</td><td>两侧完全一致的字段</td></tr>
  </tbody>
</table>

<h2>适用场景</h2>
<ul>
  <li><strong>API 版本对比</strong> — 对比 v1 和 v2 接口返回，找出新增/废弃的字段</li>
  <li><strong>配置文件审查</strong> — 部署前对比新旧配置，确保只有预期的改动</li>
  <li><strong>数据库迁移验证</strong> — 校验迁移前后的记录是否一致</li>
  <li><strong>代码审查辅助</strong> — 直观展示 JSON 数据的变更历史</li>
</ul>

<h2>对比示例</h2>
<p><strong>左侧（旧版）：</strong></p>
<pre><code class="language-json">{ "name": "Alice", "age": 30, "city": "Beijing" }</code></pre>
<p><strong>右侧（新版）：</strong></p>
<pre><code class="language-json">{ "name": "Alice", "age": 31, "city": "Shanghai", "job": "Engineer" }</code></pre>
<p><strong>差异结果：</strong><br>
• <code>$.age</code> 修改：<del>30</del> → <ins>31</ins><br>
• <code>$.city</code> 修改：<del>"Beijing"</del> → <ins>"Shanghai"</ins><br>
• <code>$.job</code> 新增：<ins>"Engineer"</ins>
</p>

<h2>使用技巧</h2>
<ul>
  <li>💡 <strong>先排序再对比</strong> — 若键名顺序不同，先用"JSON 排序 Keys"工具对两段 JSON 排序，可减少误报</li>
  <li>💡 <strong>深度递归</strong> — 本工具对嵌套对象和数组进行深度递归对比，精确定位到叶子节点</li>
  <li>💡 <strong>数组顺序敏感</strong> — 数组按下标对比，元素顺序不同会被识别为修改</li>
</ul>
`,
en: `
<h2>What is JSON Diff?</h2>
<p>JSON Diff compares two JSON documents side by side and highlights added, removed, and changed fields. Whether you're debugging API version differences, comparing config file changes, or auditing data mutations, Diff gives you an instant, precise view of everything that changed.</p>

<h2>Difference Types</h2>
<table class="jt-desc-table">
  <thead><tr><th>Type</th><th>Color</th><th>Meaning</th></tr></thead>
  <tbody>
    <tr><td>Added (+)</td><td>Green</td><td>Field exists in the right side but not the left</td></tr>
    <tr><td>Removed (-)</td><td>Red</td><td>Field exists in the left side but not the right</td></tr>
    <tr><td>Changed (~)</td><td>Yellow</td><td>Field exists on both sides but with different values</td></tr>
    <tr><td>Same</td><td>No mark</td><td>Field is identical on both sides</td></tr>
  </tbody>
</table>

<h2>Use Cases</h2>
<ul>
  <li><strong>API version comparison</strong> — Compare v1 vs v2 responses to find added/deprecated fields</li>
  <li><strong>Config file review</strong> — Compare old and new configs before deployment to verify only expected changes</li>
  <li><strong>Database migration validation</strong> — Verify records are consistent before and after migration</li>
  <li><strong>Code review</strong> — Visually present JSON data change history</li>
</ul>

<h2>Example</h2>
<p><strong>Left (old):</strong></p>
<pre><code class="language-json">{ "name": "Alice", "age": 30, "city": "Beijing" }</code></pre>
<p><strong>Right (new):</strong></p>
<pre><code class="language-json">{ "name": "Alice", "age": 31, "city": "Shanghai", "job": "Engineer" }</code></pre>
<p><strong>Result:</strong><br>
• <code>$.age</code> changed: <del>30</del> → <ins>31</ins><br>
• <code>$.city</code> changed: <del>"Beijing"</del> → <ins>"Shanghai"</ins><br>
• <code>$.job</code> added: <ins>"Engineer"</ins>
</p>

<h2>Pro Tips</h2>
<ul>
  <li>💡 <strong>Sort keys first</strong> — If key ordering differs, use Sort JSON Keys on both sides first to reduce noise</li>
  <li>💡 <strong>Deep recursion</strong> — The tool recursively diffs nested objects and arrays down to leaf nodes</li>
  <li>💡 <strong>Array order matters</strong> — Arrays are compared by index; different element order is treated as a change</li>
</ul>
`
};

/* ── 12. JSON Search ────────────────────────────────────────────────────────── */
window.JT_DESCRIPTIONS['search'] = {
zh: `
<h2>什么是 JSON 搜索？</h2>
<p>JSON 搜索工具让你在任意 JSON 数据中按 Key 或 Value 进行全文检索，并精确返回每个匹配结果的路径。无需手动翻查嵌套结构，输入关键词即可秒找目标字段。</p>

<h2>搜索模式</h2>
<table class="jt-desc-table">
  <thead><tr><th>模式</th><th>说明</th></tr></thead>
  <tbody>
    <tr><td>全部</td><td>同时搜索所有 Key 名和 Value 值</td></tr>
    <tr><td>仅 Key</td><td>只匹配字段名（键名），适合查找字段是否存在</td></tr>
    <tr><td>仅 Value</td><td>只匹配字段值，适合查找特定数据</td></tr>
  </tbody>
</table>

<h2>搜索结果示例</h2>
<p>在以下 JSON 中搜索 <code>Alice</code>：</p>
<pre><code class="language-json">{
  "users": [
    { "name": "Alice", "email": "alice@example.com" },
    { "name": "Bob",   "email": "bob@example.com" }
  ]
}</code></pre>
<p>返回结果：</p>
<ul>
  <li><code>$.users[0].name</code> = <strong>"Alice"</strong></li>
  <li><code>$.users[0].email</code> = <strong>"alice@example.com"</strong></li>
</ul>

<h2>使用场景</h2>
<ul>
  <li><strong>调试嵌套 API</strong> — 在深度嵌套的 API 响应中快速定位某个字段</li>
  <li><strong>敏感信息排查</strong> — 检查 JSON 中是否含有 password、token 等敏感键名</li>
  <li><strong>数据验证</strong> — 确认某个特定值在 JSON 中确实存在</li>
  <li><strong>字段审计</strong> — 找出所有包含某个关键字的字段路径</li>
</ul>

<h2>使用技巧</h2>
<ul>
  <li>💡 <strong>大小写不敏感</strong> — 搜索默认忽略大小写，<code>Alice</code> 和 <code>alice</code> 均可匹配</li>
  <li>💡 <strong>路径可复制</strong> — 搜索结果中的 JSONPath 路径可直接复制用于 JSON Path 查询工具</li>
  <li>💡 <strong>子字符串匹配</strong> — 搜索 <code>ali</code> 同样可以匹配 <code>Alice</code></li>
</ul>
`,
en: `
<h2>What is JSON Search?</h2>
<p>JSON Search lets you perform full-text search across any JSON document by key name or value, returning each match with its exact JSONPath location. No more manually scanning deeply nested structures—just type a keyword and find it instantly.</p>

<h2>Search Modes</h2>
<table class="jt-desc-table">
  <thead><tr><th>Mode</th><th>Description</th></tr></thead>
  <tbody>
    <tr><td>All</td><td>Search both key names and values simultaneously</td></tr>
    <tr><td>Keys only</td><td>Match only field names—useful for checking if a field exists</td></tr>
    <tr><td>Values only</td><td>Match only field values—useful for finding specific data</td></tr>
  </tbody>
</table>

<h2>Search Result Example</h2>
<p>Searching for <code>Alice</code> in this JSON:</p>
<pre><code class="language-json">{
  "users": [
    { "name": "Alice", "email": "alice@example.com" },
    { "name": "Bob",   "email": "bob@example.com" }
  ]
}</code></pre>
<p>Returns:</p>
<ul>
  <li><code>$.users[0].name</code> = <strong>"Alice"</strong></li>
  <li><code>$.users[0].email</code> = <strong>"alice@example.com"</strong></li>
</ul>

<h2>Use Cases</h2>
<ul>
  <li><strong>Debugging nested APIs</strong> — Quickly locate a field deep inside a complex API response</li>
  <li><strong>Sensitive data audit</strong> — Check whether a JSON payload contains keys like password or token</li>
  <li><strong>Data verification</strong> — Confirm that a specific value actually exists in the JSON</li>
  <li><strong>Field auditing</strong> — Find all paths that contain a given keyword</li>
</ul>

<h2>Pro Tips</h2>
<ul>
  <li>💡 <strong>Case-insensitive</strong> — Search ignores case by default; <code>Alice</code> and <code>alice</code> both match</li>
  <li>💡 <strong>Copy the path</strong> — JSONPath results can be copied directly into the JSON Path Query tool</li>
  <li>💡 <strong>Substring matching</strong> — Searching <code>ali</code> will still match <code>Alice</code></li>
</ul>
`
};

/* ── 13. JSON Size Analyzer ─────────────────────────────────────────────────── */
window.JT_DESCRIPTIONS['size'] = {
zh: `
<h2>什么是 JSON 大小分析？</h2>
<p>JSON 大小分析器对你的 JSON 数据进行全面统计：原始字节大小、压缩后大小、最大嵌套深度、总节点数，以及各类型节点（对象、数组、字符串、数字等）的数量和占比。帮助你快速评估 JSON 结构的复杂性和优化空间。</p>

<h2>分析指标说明</h2>
<table class="jt-desc-table">
  <thead><tr><th>指标</th><th>说明</th></tr></thead>
  <tbody>
    <tr><td>原始大小</td><td>带格式化空白字符的完整 JSON 字节数</td></tr>
    <tr><td>压缩大小</td><td>移除所有空白后的最小字节数（传输优化参考值）</td></tr>
    <tr><td>最大深度</td><td>JSON 嵌套层数，深度过大可能影响解析性能</td></tr>
    <tr><td>总节点数</td><td>所有值节点的总数量（含嵌套）</td></tr>
    <tr><td>类型分布</td><td>各数据类型节点数量及占总节点数的百分比</td></tr>
  </tbody>
</table>

<h2>大小基准参考</h2>
<table class="jt-desc-table">
  <thead><tr><th>压缩大小</th><th>评级</th><th>建议</th></tr></thead>
  <tbody>
    <tr><td>&lt; 10 KB</td><td>✅ 轻量</td><td>非常适合 API 传输</td></tr>
    <tr><td>10–100 KB</td><td>⚡ 适中</td><td>考虑启用 gzip 压缩</td></tr>
    <tr><td>100 KB–1 MB</td><td>⚠️ 偏大</td><td>建议分页或字段裁剪</td></tr>
    <tr><td>&gt; 1 MB</td><td>❌ 过大</td><td>应进行流式传输或拆分</td></tr>
  </tbody>
</table>

<h2>使用场景</h2>
<ul>
  <li><strong>API 响应优化</strong> — 分析响应体大小，找出可以删减的冗余字段</li>
  <li><strong>性能诊断</strong> — 深度过大（&gt;10 层）可能导致递归解析性能问题</li>
  <li><strong>数据结构评估</strong> — 了解数据以字符串为主还是以数字为主，指导存储方案选型</li>
</ul>

<h2>使用技巧</h2>
<ul>
  <li>💡 <strong>压缩比参考</strong> — 原始大小与压缩大小之差越大，说明格式化缩进越多，可通过压缩节省更多带宽</li>
  <li>💡 <strong>节点数与深度</strong> — 节点数多但深度浅（扁平化结构）性能优于节点数少但深度大的结构</li>
  <li>💡 <strong>配合压缩工具</strong> — 分析完毕后，切换到"JSON 压缩"工具直接生成最小化版本</li>
</ul>
`,
en: `
<h2>What is JSON Size Analysis?</h2>
<p>The JSON Size Analyzer gives you a comprehensive breakdown of your JSON: raw byte size, minified size, maximum nesting depth, total node count, and the number and percentage of each data type. It helps you quickly assess structural complexity and identify optimization opportunities.</p>

<h2>Metrics Explained</h2>
<table class="jt-desc-table">
  <thead><tr><th>Metric</th><th>Description</th></tr></thead>
  <tbody>
    <tr><td>Raw size</td><td>Full JSON byte count including formatting whitespace</td></tr>
    <tr><td>Minified size</td><td>Minimum byte count after removing all whitespace (transmission reference)</td></tr>
    <tr><td>Max depth</td><td>Nesting level count; excessive depth can impact parsing performance</td></tr>
    <tr><td>Total nodes</td><td>Count of all value nodes including nested ones</td></tr>
    <tr><td>Type distribution</td><td>Count and percentage of each data type</td></tr>
  </tbody>
</table>

<h2>Size Benchmarks</h2>
<table class="jt-desc-table">
  <thead><tr><th>Minified Size</th><th>Rating</th><th>Recommendation</th></tr></thead>
  <tbody>
    <tr><td>&lt; 10 KB</td><td>✅ Lightweight</td><td>Ideal for API transfer</td></tr>
    <tr><td>10–100 KB</td><td>⚡ Moderate</td><td>Consider enabling gzip compression</td></tr>
    <tr><td>100 KB–1 MB</td><td>⚠️ Large</td><td>Consider pagination or field trimming</td></tr>
    <tr><td>&gt; 1 MB</td><td>❌ Too large</td><td>Use streaming or split the payload</td></tr>
  </tbody>
</table>

<h2>Use Cases</h2>
<ul>
  <li><strong>API response optimization</strong> — Analyze response body size to identify redundant fields to prune</li>
  <li><strong>Performance diagnostics</strong> — Excessive depth (&gt;10 levels) can cause recursive parsing bottlenecks</li>
  <li><strong>Data modeling</strong> — Understand whether data is string-heavy or number-heavy to guide storage decisions</li>
</ul>

<h2>Pro Tips</h2>
<ul>
  <li>💡 <strong>Compression ratio</strong> — A large gap between raw and minified size means heavy indentation; compression saves more bandwidth</li>
  <li>💡 <strong>Flat vs deep</strong> — Many nodes at shallow depth outperforms fewer nodes at deep nesting for parser performance</li>
  <li>💡 <strong>Pair with Minify</strong> — After analysis, switch to the JSON Minify tool to generate the optimized version</li>
</ul>
`
};

/* ── 14. JSON Flatten ───────────────────────────────────────────────────────── */
window.JT_DESCRIPTIONS['flatten'] = {
zh: `
<h2>什么是 JSON 扁平化？</h2>
<p>JSON 扁平化将多层嵌套的 JSON 对象转换为单层键值对格式，使用点号（或自定义分隔符）连接各层级的键名。还原功能则做相反操作，将扁平结构重新组装为嵌套 JSON。</p>

<h2>扁平化前后对比</h2>
<p><strong>嵌套 JSON：</strong></p>
<pre><code class="language-json">{
  "user": {
    "name": "Alice",
    "address": {
      "city": "Beijing",
      "zip": "100000"
    }
  }
}</code></pre>
<p><strong>扁平化后（使用 <code>.</code> 分隔符）：</strong></p>
<pre><code class="language-json">{
  "user.name": "Alice",
  "user.address.city": "Beijing",
  "user.address.zip": "100000"
}</code></pre>

<h2>分隔符选项</h2>
<table class="jt-desc-table">
  <thead><tr><th>分隔符</th><th>示例键名</th><th>常见用途</th></tr></thead>
  <tbody>
    <tr><td><code>.</code>（默认）</td><td><code>user.name</code></td><td>通用、JSONPath 风格</td></tr>
    <tr><td><code>/</code></td><td><code>user/name</code></td><td>URL 路径风格</td></tr>
    <tr><td><code>_</code></td><td><code>user_name</code></td><td>数据库列名风格</td></tr>
    <tr><td><code>__</code></td><td><code>user__name</code></td><td>避免键名本身含点时冲突</td></tr>
  </tbody>
</table>

<h2>使用场景</h2>
<ul>
  <li><strong>数据库映射</strong> — 将嵌套 JSON 映射为数据库扁平列</li>
  <li><strong>环境变量</strong> — 将配置 JSON 扁平化为 <code>APP_DB_HOST=...</code> 格式的环境变量</li>
  <li><strong>表格导出</strong> — 扁平化后更容易转为 CSV/Excel</li>
  <li><strong>配置合并</strong> — 扁平键名更容易做深层字段合并和覆盖</li>
</ul>

<h2>使用技巧</h2>
<ul>
  <li>💡 <strong>数组不被展开</strong> — 默认情况下数组作为整体保留，不会按下标拆分</li>
  <li>💡 <strong>避免键名冲突</strong> — 若原始键名本身包含分隔符，选用其他分隔符以避免还原时歧义</li>
  <li>💡 <strong>还原有损</strong> — 扁平化后再还原时，数字下标键名会被解析为对象键，而非数组</li>
</ul>
`,
en: `
<h2>What is JSON Flatten?</h2>
<p>JSON Flatten converts a deeply nested JSON object into a single-level key-value format using dot notation (or a custom delimiter) to join key names across nesting levels. The unflatten operation does the reverse, reassembling a flat structure back into nested JSON.</p>

<h2>Before and After</h2>
<p><strong>Nested JSON:</strong></p>
<pre><code class="language-json">{
  "user": {
    "name": "Alice",
    "address": {
      "city": "Beijing",
      "zip": "100000"
    }
  }
}</code></pre>
<p><strong>Flattened (using <code>.</code> delimiter):</strong></p>
<pre><code class="language-json">{
  "user.name": "Alice",
  "user.address.city": "Beijing",
  "user.address.zip": "100000"
}</code></pre>

<h2>Delimiter Options</h2>
<table class="jt-desc-table">
  <thead><tr><th>Delimiter</th><th>Example Key</th><th>Common Usage</th></tr></thead>
  <tbody>
    <tr><td><code>.</code> (default)</td><td><code>user.name</code></td><td>General, JSONPath style</td></tr>
    <tr><td><code>/</code></td><td><code>user/name</code></td><td>URL path style</td></tr>
    <tr><td><code>_</code></td><td><code>user_name</code></td><td>Database column style</td></tr>
    <tr><td><code>__</code></td><td><code>user__name</code></td><td>Avoids conflicts when keys contain dots</td></tr>
  </tbody>
</table>

<h2>Use Cases</h2>
<ul>
  <li><strong>Database mapping</strong> — Map nested JSON to flat database columns</li>
  <li><strong>Environment variables</strong> — Flatten config JSON into <code>APP_DB_HOST=...</code> style env vars</li>
  <li><strong>Spreadsheet export</strong> — Flat keys are much easier to export as CSV/Excel columns</li>
  <li><strong>Config merging</strong> — Flat key names make deep field overrides straightforward</li>
</ul>

<h2>Pro Tips</h2>
<ul>
  <li>💡 <strong>Arrays are preserved</strong> — By default, arrays are kept intact and not expanded by index</li>
  <li>💡 <strong>Avoid key conflicts</strong> — If original keys contain the delimiter character, choose a different delimiter to prevent ambiguity on unflatten</li>
  <li>💡 <strong>Lossy round-trip</strong> — Flattening then unflattening may convert array-index keys into object keys rather than restoring arrays</li>
</ul>
`
};

/* ── 15. JSON Path Query ────────────────────────────────────────────────────── */
window.JT_DESCRIPTIONS['path'] = {
zh: `
<h2>什么是 JSONPath？</h2>
<p>JSONPath 是一种用于从 JSON 数据中提取特定节点的查询语言，类似于 XPath 对 XML 的作用。它让你通过简洁的表达式直接定位嵌套数据，无需手写递归遍历代码。</p>

<h2>常用 JSONPath 语法</h2>
<table class="jt-desc-table">
  <thead><tr><th>表达式</th><th>含义</th></tr></thead>
  <tbody>
    <tr><td><code>$</code></td><td>根节点</td></tr>
    <tr><td><code>$.name</code></td><td>根节点下的 <code>name</code> 字段</td></tr>
    <tr><td><code>$.users[0]</code></td><td>数组第一个元素</td></tr>
    <tr><td><code>$.users[*]</code></td><td>数组所有元素</td></tr>
    <tr><td><code>$.users[*].name</code></td><td>所有用户的 name 字段</td></tr>
    <tr><td><code>$..email</code></td><td>递归查找所有层级中的 email</td></tr>
    <tr><td><code>$.users[?(@.age > 18)]</code></td><td>过滤：年龄大于 18 的用户</td></tr>
    <tr><td><code>$.items[-1:]</code></td><td>数组最后一个元素</td></tr>
    <tr><td><code>$.items[0:3]</code></td><td>数组前 3 个元素</td></tr>
  </tbody>
</table>

<h2>实际示例</h2>
<pre><code class="language-json">{
  "store": {
    "books": [
      { "title": "JSON in Practice", "price": 29.99, "inStock": true },
      { "title": "API Design",       "price": 39.99, "inStock": false }
    ]
  }
}</code></pre>
<table class="jt-desc-table">
  <thead><tr><th>表达式</th><th>结果</th></tr></thead>
  <tbody>
    <tr><td><code>$.store.books[*].title</code></td><td>所有书名</td></tr>
    <tr><td><code>$.store.books[0].price</code></td><td>第一本书的价格</td></tr>
    <tr><td><code>$.store.books[?(@.inStock==true)]</code></td><td>所有有库存的书</td></tr>
    <tr><td><code>$..price</code></td><td>所有价格字段</td></tr>
  </tbody>
</table>

<h2>使用技巧</h2>
<ul>
  <li>💡 <strong>调试时用 <code>$</code> 开头</strong> — 所有合法 JSONPath 表达式必须以 <code>$</code> 开头</li>
  <li>💡 <strong>递归下降 <code>..</code></strong> — <code>$..</code> 会在所有层级递归搜索，适合结构不确定时使用</li>
  <li>💡 <strong>过滤器 <code>?(@.key)</code></strong> — 括号内的 <code>@</code> 代表当前节点，支持比较运算符</li>
</ul>
`,
en: `
<h2>What is JSONPath?</h2>
<p>JSONPath is a query language for extracting specific nodes from JSON data, similar to how XPath works for XML. It allows you to pinpoint nested data with concise expressions, without writing recursive traversal code.</p>

<h2>Common JSONPath Syntax</h2>
<table class="jt-desc-table">
  <thead><tr><th>Expression</th><th>Meaning</th></tr></thead>
  <tbody>
    <tr><td><code>$</code></td><td>The root node</td></tr>
    <tr><td><code>$.name</code></td><td>The <code>name</code> field at root</td></tr>
    <tr><td><code>$.users[0]</code></td><td>First element of the array</td></tr>
    <tr><td><code>$.users[*]</code></td><td>All elements of the array</td></tr>
    <tr><td><code>$.users[*].name</code></td><td>The name field of all users</td></tr>
    <tr><td><code>$..email</code></td><td>Recursively find all email fields</td></tr>
    <tr><td><code>$.users[?(@.age > 18)]</code></td><td>Filter: users with age greater than 18</td></tr>
    <tr><td><code>$.items[-1:]</code></td><td>Last element of the array</td></tr>
    <tr><td><code>$.items[0:3]</code></td><td>First 3 elements of the array</td></tr>
  </tbody>
</table>

<h2>Live Example</h2>
<pre><code class="language-json">{
  "store": {
    "books": [
      { "title": "JSON in Practice", "price": 29.99, "inStock": true },
      { "title": "API Design",       "price": 39.99, "inStock": false }
    ]
  }
}</code></pre>
<table class="jt-desc-table">
  <thead><tr><th>Expression</th><th>Result</th></tr></thead>
  <tbody>
    <tr><td><code>$.store.books[*].title</code></td><td>All book titles</td></tr>
    <tr><td><code>$.store.books[0].price</code></td><td>Price of the first book</td></tr>
    <tr><td><code>$.store.books[?(@.inStock==true)]</code></td><td>All in-stock books</td></tr>
    <tr><td><code>$..price</code></td><td>All price fields recursively</td></tr>
  </tbody>
</table>

<h2>Pro Tips</h2>
<ul>
  <li>💡 <strong>Start with <code>$</code></strong> — All valid JSONPath expressions must begin with <code>$</code></li>
  <li>💡 <strong>Recursive descent <code>..</code></strong> — <code>$..</code> searches all nesting levels; useful when structure is unknown</li>
  <li>💡 <strong>Filters <code>?(@.key)</code></strong> — Inside brackets, <code>@</code> refers to the current node; supports comparison operators</li>
</ul>
`
};

/* ── 16. JWT Decoder ────────────────────────────────────────────────────────── */
window.JT_DESCRIPTIONS['jwt'] = {
zh: `
<h2>什么是 JWT？</h2>
<p>JWT（JSON Web Token）是一种基于 JSON 的开放标准（RFC 7519），用于在各方之间安全地传递声明（Claims）。它被广泛用于身份认证和 API 授权，是现代 Web 应用最常见的 Token 格式。</p>

<h2>JWT 结构</h2>
<p>JWT 由三个 Base64URL 编码的部分组成，用 <code>.</code> 分隔：</p>
<pre><code>xxxxx.yyyyy.zzzzz
  │      │      └─ Signature（签名）
  │      └──────── Payload（载荷）
  └─────────────── Header（头部）</code></pre>

<table class="jt-desc-table">
  <thead><tr><th>部分</th><th>内容</th><th>示例</th></tr></thead>
  <tbody>
    <tr><td>Header</td><td>Token 类型和签名算法</td><td><code>{"alg":"HS256","typ":"JWT"}</code></td></tr>
    <tr><td>Payload</td><td>用户信息和声明（Claims）</td><td><code>{"sub":"123","name":"Alice","exp":1700000000}</code></td></tr>
    <tr><td>Signature</td><td>Header + Payload 的 HMAC 签名</td><td>防篡改校验</td></tr>
  </tbody>
</table>

<h2>常见 Payload 字段</h2>
<table class="jt-desc-table">
  <thead><tr><th>字段</th><th>含义</th></tr></thead>
  <tbody>
    <tr><td><code>sub</code></td><td>Subject — Token 对应的用户 ID</td></tr>
    <tr><td><code>iss</code></td><td>Issuer — 签发方</td></tr>
    <tr><td><code>aud</code></td><td>Audience — 接收方</td></tr>
    <tr><td><code>exp</code></td><td>Expiration — Unix 时间戳，Token 过期时间</td></tr>
    <tr><td><code>iat</code></td><td>Issued At — 签发时间</td></tr>
    <tr><td><code>nbf</code></td><td>Not Before — 生效时间</td></tr>
    <tr><td><code>jti</code></td><td>JWT ID — 唯一标识符，防止重放攻击</td></tr>
  </tbody>
</table>

<h2>安全注意事项</h2>
<ul>
  <li>⚠️ <strong>Payload 未加密</strong> — JWT 只进行 Base64 编码，任何人均可解码查看 Payload 内容，切勿在其中存放密码等敏感信息</li>
  <li>⚠️ <strong>签名需服务端验证</strong> — 本工具仅解码，不验证签名的合法性</li>
  <li>✅ <strong>检查过期时间</strong> — 本工具会自动高亮显示 Token 是否已过期</li>
</ul>

<h2>使用技巧</h2>
<ul>
  <li>💡 <strong>支持 Bearer 前缀</strong> — 直接粘贴包含 <code>Bearer </code> 前缀的 Token 字符串，工具会自动去除</li>
  <li>💡 <strong>时间戳转换</strong> — <code>exp</code> 和 <code>iat</code> 字段会自动转换为人类可读的 ISO 时间格式</li>
</ul>
`,
en: `
<h2>What is JWT?</h2>
<p>JWT (JSON Web Token) is an open standard (RFC 7519) for securely transmitting claims between parties as a JSON object. It is widely used for authentication and API authorization, and is the most common token format in modern web applications.</p>

<h2>JWT Structure</h2>
<p>A JWT consists of three Base64URL-encoded parts separated by <code>.</code>:</p>
<pre><code>xxxxx.yyyyy.zzzzz
  │      │      └─ Signature
  │      └──────── Payload
  └─────────────── Header</code></pre>

<table class="jt-desc-table">
  <thead><tr><th>Part</th><th>Contents</th><th>Example</th></tr></thead>
  <tbody>
    <tr><td>Header</td><td>Token type and signing algorithm</td><td><code>{"alg":"HS256","typ":"JWT"}</code></td></tr>
    <tr><td>Payload</td><td>User info and claims</td><td><code>{"sub":"123","name":"Alice","exp":1700000000}</code></td></tr>
    <tr><td>Signature</td><td>HMAC of Header + Payload</td><td>Tamper-detection</td></tr>
  </tbody>
</table>

<h2>Common Payload Claims</h2>
<table class="jt-desc-table">
  <thead><tr><th>Claim</th><th>Meaning</th></tr></thead>
  <tbody>
    <tr><td><code>sub</code></td><td>Subject — the user ID the token represents</td></tr>
    <tr><td><code>iss</code></td><td>Issuer — who issued the token</td></tr>
    <tr><td><code>aud</code></td><td>Audience — the intended recipient</td></tr>
    <tr><td><code>exp</code></td><td>Expiration — Unix timestamp when the token expires</td></tr>
    <tr><td><code>iat</code></td><td>Issued At — when the token was issued</td></tr>
    <tr><td><code>nbf</code></td><td>Not Before — when the token becomes valid</td></tr>
    <tr><td><code>jti</code></td><td>JWT ID — unique identifier to prevent replay attacks</td></tr>
  </tbody>
</table>

<h2>Security Notes</h2>
<ul>
  <li>⚠️ <strong>Payload is not encrypted</strong> — JWT only Base64-encodes the payload; anyone can decode it. Never store passwords or sensitive data in it</li>
  <li>⚠️ <strong>Signature requires server validation</strong> — This tool decodes only; it does not verify the signature's authenticity</li>
  <li>✅ <strong>Expiry checking</strong> — This tool automatically highlights whether the token has expired</li>
</ul>

<h2>Pro Tips</h2>
<ul>
  <li>💡 <strong>Bearer prefix supported</strong> — Paste the full <code>Bearer xxxxx.yyyyy.zzzzz</code> string; the tool strips the prefix automatically</li>
  <li>💡 <strong>Timestamp conversion</strong> — <code>exp</code> and <code>iat</code> are automatically converted to human-readable ISO date strings</li>
</ul>
`
};

/* ── 17. JSON Base64 ────────────────────────────────────────────────────────── */
window.JT_DESCRIPTIONS['base64'] = {
zh: `
<h2>什么是 Base64 编解码？</h2>
<p>Base64 是一种将二进制数据转换为 ASCII 字符串的编码方式，使用 A-Z、a-z、0-9、<code>+</code>、<code>/</code> 共 64 个字符表示数据。对 JSON 进行 Base64 编码，可以安全地将其嵌入 URL、HTTP 请求头、HTML 属性或其他只接受纯文本的场景。</p>

<h2>编码前后对比</h2>
<p><strong>原始 JSON：</strong></p>
<pre><code class="language-json">{"name":"Alice","role":"admin"}</code></pre>
<p><strong>Base64 编码后：</strong></p>
<pre><code>eyJuYW1lIjoiQWxpY2UiLCJyb2xlIjoiYWRtaW4ifQ==</code></pre>

<h2>适用场景</h2>
<table class="jt-desc-table">
  <thead><tr><th>场景</th><th>说明</th></tr></thead>
  <tbody>
    <tr><td>URL 参数传递</td><td>将 JSON 配置作为 URL 参数传递，避免特殊字符转义问题</td></tr>
    <tr><td>HTTP 请求头</td><td>在 Authorization 或自定义 Header 中传递 JSON 数据</td></tr>
    <tr><td>JWT Payload</td><td>JWT Token 的 Header 和 Payload 部分使用 Base64URL 编码</td></tr>
    <tr><td>数据库存储</td><td>将 JSON 以 Base64 文本形式存入不支持 JSON 类型的字段</td></tr>
    <tr><td>电子邮件/二维码</td><td>在仅支持 ASCII 字符的通道中传输 JSON</td></tr>
  </tbody>
</table>

<h2>Base64 vs Base64URL</h2>
<table class="jt-desc-table">
  <thead><tr><th>格式</th><th>特殊字符</th><th>用途</th></tr></thead>
  <tbody>
    <tr><td>Base64</td><td><code>+</code>、<code>/</code>、<code>=</code> 填充</td><td>通用编码</td></tr>
    <tr><td>Base64URL</td><td><code>-</code>、<code>_</code>，无填充</td><td>URL 安全，JWT 使用</td></tr>
  </tbody>
</table>

<h2>编程实现</h2>
<p><strong>JavaScript</strong></p>
<pre><code class="language-javascript">// 编码
const encoded = btoa(unescape(encodeURIComponent(jsonStr)));
// 解码
const decoded = decodeURIComponent(escape(atob(encodedStr)));</code></pre>

<p><strong>Python</strong></p>
<pre><code class="language-python">import base64, json
encoded = base64.b64encode(json.dumps(data).encode()).decode()
decoded = json.loads(base64.b64decode(encoded))</code></pre>

<h2>使用技巧</h2>
<ul>
  <li>💡 <strong>Base64 不是加密</strong> — Base64 只是编码，不提供任何安全保护，任何人均可解码</li>
  <li>💡 <strong>体积会增加</strong> — Base64 编码后体积约增加 33%</li>
  <li>💡 <strong>检查末尾填充</strong> — Base64 字符串末尾的 <code>=</code> 是填充符，是合法字符</li>
</ul>
`,
en: `
<h2>What is Base64 Encoding?</h2>
<p>Base64 converts binary data into an ASCII string using 64 characters: A-Z, a-z, 0-9, <code>+</code>, and <code>/</code>. Base64-encoding JSON lets you safely embed it in URLs, HTTP headers, HTML attributes, or any channel that only accepts plain text.</p>

<h2>Before and After</h2>
<p><strong>Original JSON:</strong></p>
<pre><code class="language-json">{"name":"Alice","role":"admin"}</code></pre>
<p><strong>Base64 encoded:</strong></p>
<pre><code>eyJuYW1lIjoiQWxpY2UiLCJyb2xlIjoiYWRtaW4ifQ==</code></pre>

<h2>Use Cases</h2>
<table class="jt-desc-table">
  <thead><tr><th>Use Case</th><th>Description</th></tr></thead>
  <tbody>
    <tr><td>URL parameters</td><td>Pass JSON config as a URL param without special-character escaping issues</td></tr>
    <tr><td>HTTP headers</td><td>Transmit JSON data in Authorization or custom headers</td></tr>
    <tr><td>JWT payload</td><td>JWT header and payload use Base64URL encoding</td></tr>
    <tr><td>Database storage</td><td>Store JSON as Base64 text in fields that don't support JSON type</td></tr>
    <tr><td>Email / QR codes</td><td>Transport JSON through ASCII-only channels</td></tr>
  </tbody>
</table>

<h2>Base64 vs Base64URL</h2>
<table class="jt-desc-table">
  <thead><tr><th>Format</th><th>Special Chars</th><th>Usage</th></tr></thead>
  <tbody>
    <tr><td>Base64</td><td><code>+</code>, <code>/</code>, <code>=</code> padding</td><td>General encoding</td></tr>
    <tr><td>Base64URL</td><td><code>-</code>, <code>_</code>, no padding</td><td>URL-safe, used in JWT</td></tr>
  </tbody>
</table>

<h2>Code Examples</h2>
<p><strong>JavaScript</strong></p>
<pre><code class="language-javascript">// Encode
const encoded = btoa(unescape(encodeURIComponent(jsonStr)));
// Decode
const decoded = decodeURIComponent(escape(atob(encodedStr)));</code></pre>

<p><strong>Python</strong></p>
<pre><code class="language-python">import base64, json
encoded = base64.b64encode(json.dumps(data).encode()).decode()
decoded = json.loads(base64.b64decode(encoded))</code></pre>

<h2>Pro Tips</h2>
<ul>
  <li>💡 <strong>Base64 is not encryption</strong> — It's just encoding; anyone can decode it. It provides no security</li>
  <li>💡 <strong>Size increases ~33%</strong> — Base64-encoded data is about 33% larger than the original</li>
  <li>💡 <strong>Padding is valid</strong> — The <code>=</code> characters at the end of a Base64 string are valid padding characters</li>
</ul>
`
};

/* ── 18. JSONC to JSON ──────────────────────────────────────────────────────── */
window.JT_DESCRIPTIONS['jsonc'] = {
zh: `
<h2>什么是 JSONC？</h2>
<p>JSONC（JSON with Comments）是 JSON 的超集扩展，允许在 JSON 中使用单行注释（<code>//</code>）、块注释（<code>/* */</code>）以及尾部逗号。JSONC 被 VS Code 的配置文件（<code>settings.json</code>、<code>tsconfig.json</code>）广泛采用。本工具将 JSONC 转换为标准 JSON，移除所有注释和尾部逗号。</p>

<h2>JSONC 与 JSON 的区别</h2>
<table class="jt-desc-table">
  <thead><tr><th>特性</th><th>标准 JSON</th><th>JSONC</th></tr></thead>
  <tbody>
    <tr><td>单行注释 <code>//</code></td><td>❌ 不支持</td><td>✅ 支持</td></tr>
    <tr><td>块注释 <code>/* */</code></td><td>❌ 不支持</td><td>✅ 支持</td></tr>
    <tr><td>尾部逗号</td><td>❌ 不支持</td><td>✅ 支持</td></tr>
    <tr><td>标准解析器兼容</td><td>✅ 完全兼容</td><td>❌ 需先转换</td></tr>
  </tbody>
</table>

<h2>转换示例</h2>
<p><strong>JSONC 输入：</strong></p>
<pre><code>{
  // 应用配置
  "name": "MyApp",
  "version": "1.0.0",
  /* 功能开关 */
  "features": {
    "darkMode": true,
    "analytics": false, // 暂时关闭
  }
}</code></pre>
<p><strong>标准 JSON 输出：</strong></p>
<pre><code class="language-json">{
  "name": "MyApp",
  "version": "1.0.0",
  "features": {
    "darkMode": true,
    "analytics": false
  }
}</code></pre>

<h2>常见应用场景</h2>
<ul>
  <li><strong>VS Code 配置</strong> — <code>settings.json</code>、<code>launch.json</code>、<code>tasks.json</code> 均为 JSONC 格式</li>
  <li><strong>TypeScript 配置</strong> — <code>tsconfig.json</code> 支持注释和尾部逗号</li>
  <li><strong>ESLint / Prettier</strong> — 部分配置文件使用 JSONC</li>
  <li><strong>构建工具配置</strong> — 注释有助于在配置文件中解释参数含义</li>
</ul>

<h2>使用技巧</h2>
<ul>
  <li>💡 <strong>注释内容不会保留</strong> — 转换后注释会被完全删除，若需保留说明，建议改用 YAML 等支持注释的格式</li>
  <li>💡 <strong>字符串内的注释不处理</strong> — <code>"//"</code> 在字符串值内不会被识别为注释</li>
</ul>
`,
en: `
<h2>What is JSONC?</h2>
<p>JSONC (JSON with Comments) is a superset of JSON that allows single-line comments (<code>//</code>), block comments (<code>/* */</code>), and trailing commas. It is widely adopted by VS Code configuration files like <code>settings.json</code> and <code>tsconfig.json</code>. This tool converts JSONC to standard JSON by stripping all comments and trailing commas.</p>

<h2>JSONC vs Standard JSON</h2>
<table class="jt-desc-table">
  <thead><tr><th>Feature</th><th>Standard JSON</th><th>JSONC</th></tr></thead>
  <tbody>
    <tr><td>Single-line <code>//</code></td><td>❌ Not allowed</td><td>✅ Supported</td></tr>
    <tr><td>Block <code>/* */</code></td><td>❌ Not allowed</td><td>✅ Supported</td></tr>
    <tr><td>Trailing commas</td><td>❌ Not allowed</td><td>✅ Supported</td></tr>
    <tr><td>Standard parser</td><td>✅ Full support</td><td>❌ Needs conversion first</td></tr>
  </tbody>
</table>

<h2>Conversion Example</h2>
<p><strong>JSONC input:</strong></p>
<pre><code>{
  // App configuration
  "name": "MyApp",
  "version": "1.0.0",
  /* Feature flags */
  "features": {
    "darkMode": true,
    "analytics": false, // temporarily disabled
  }
}</code></pre>
<p><strong>Standard JSON output:</strong></p>
<pre><code class="language-json">{
  "name": "MyApp",
  "version": "1.0.0",
  "features": {
    "darkMode": true,
    "analytics": false
  }
}</code></pre>

<h2>Common Use Cases</h2>
<ul>
  <li><strong>VS Code configs</strong> — <code>settings.json</code>, <code>launch.json</code>, <code>tasks.json</code> are all JSONC</li>
  <li><strong>TypeScript config</strong> — <code>tsconfig.json</code> supports comments and trailing commas</li>
  <li><strong>ESLint / Prettier</strong> — Some config files use JSONC format</li>
  <li><strong>Build tool configs</strong> — Comments help explain configuration parameters inline</li>
</ul>

<h2>Pro Tips</h2>
<ul>
  <li>💡 <strong>Comments are not preserved</strong> — All comments are stripped on conversion. If you need to keep annotations, consider YAML which natively supports comments</li>
  <li>💡 <strong>Comments inside strings are safe</strong> — <code>"//"</code> inside a string value is not treated as a comment</li>
</ul>
`
};

/* ── 19. Token Counter ──────────────────────────────────────────────────────── */
window.JT_DESCRIPTIONS['token-count'] = {
zh: `
<h2>什么是 Token 计数？</h2>
<p>大语言模型（LLM）处理文本时，不是按字符或单词计数，而是按"Token"计算。Token 是模型的基本处理单元，可能是一个完整单词、单词的一部分，或一个汉字。计费和上下文限制均基于 Token 数量，而非字符数。</p>

<h2>各模型 Token 限制</h2>
<table class="jt-desc-table">
  <thead><tr><th>模型</th><th>最大上下文 Token</th><th>编码方式</th></tr></thead>
  <tbody>
    <tr><td>GPT-4o</td><td>128,000</td><td>cl100k_base</td></tr>
    <tr><td>GPT-4</td><td>8,192 / 32,768</td><td>cl100k_base</td></tr>
    <tr><td>GPT-3.5 Turbo</td><td>16,385</td><td>cl100k_base</td></tr>
    <tr><td>Claude 3.5 Sonnet</td><td>200,000</td><td>BPE 变体</td></tr>
    <tr><td>Gemini 1.5 Pro</td><td>1,000,000</td><td>SentencePiece</td></tr>
  </tbody>
</table>

<h2>Token 估算规律</h2>
<table class="jt-desc-table">
  <thead><tr><th>语言/内容</th><th>近似规律</th></tr></thead>
  <tbody>
    <tr><td>英文文本</td><td>约 1 token / 4 个字符，或约 1 token / 0.75 个单词</td></tr>
    <tr><td>中文文本</td><td>约 1 token / 1-2 个汉字</td></tr>
    <tr><td>代码</td><td>与英文类似，关键字通常为 1 token</td></tr>
    <tr><td>JSON</td><td>键名、值、符号各占 token，嵌套结构消耗更多</td></tr>
  </tbody>
</table>

<h2>为什么 JSON 会消耗大量 Token？</h2>
<p>JSON 的符号（花括号、方括号、冒号、引号、逗号）都会消耗 Token。一段 500 字节的 JSON 可能需要 200+ Tokens，而同等信息量的纯文本只需 100 Tokens。发送 JSON 给 LLM 时建议：</p>
<ul>
  <li>先压缩 JSON（移除空白字符）</li>
  <li>只传递必要的字段，剔除冗余数据</li>
  <li>考虑将结构化数据转为简洁的自然语言描述</li>
</ul>

<h2>使用技巧</h2>
<ul>
  <li>💡 <strong>计费估算</strong> — 结合 Token 单价（如 GPT-4o 输入 $5/1M tokens），提前估算 API 费用</li>
  <li>💡 <strong>上下文规划</strong> — 将系统提示词、用户消息、JSON 数据的 Token 数求和，确保不超过模型限制</li>
  <li>💡 <strong>本工具为估算值</strong> — 精确计数需使用各模型官方的 tokenizer 库（如 tiktoken）</li>
</ul>
`,
en: `
<h2>What is Token Counting?</h2>
<p>Large language models (LLMs) process text in units called "tokens," not characters or words. A token can be a full word, part of a word, or a single CJK character. Both pricing and context window limits are based on token counts, not character counts.</p>

<h2>Model Context Limits</h2>
<table class="jt-desc-table">
  <thead><tr><th>Model</th><th>Max Context Tokens</th><th>Encoding</th></tr></thead>
  <tbody>
    <tr><td>GPT-4o</td><td>128,000</td><td>cl100k_base</td></tr>
    <tr><td>GPT-4</td><td>8,192 / 32,768</td><td>cl100k_base</td></tr>
    <tr><td>GPT-3.5 Turbo</td><td>16,385</td><td>cl100k_base</td></tr>
    <tr><td>Claude 3.5 Sonnet</td><td>200,000</td><td>BPE variant</td></tr>
    <tr><td>Gemini 1.5 Pro</td><td>1,000,000</td><td>SentencePiece</td></tr>
  </tbody>
</table>

<h2>Token Estimation Rules</h2>
<table class="jt-desc-table">
  <thead><tr><th>Language / Content</th><th>Approximate Rule</th></tr></thead>
  <tbody>
    <tr><td>English text</td><td>~1 token per 4 characters, or ~1 token per 0.75 words</td></tr>
    <tr><td>Chinese text</td><td>~1 token per 1-2 characters</td></tr>
    <tr><td>Code</td><td>Similar to English; keywords are typically 1 token</td></tr>
    <tr><td>JSON</td><td>Keys, values, and punctuation each consume tokens; nesting adds more</td></tr>
  </tbody>
</table>

<h2>Why Does JSON Use So Many Tokens?</h2>
<p>JSON punctuation (braces, brackets, colons, quotes, commas) all consume tokens. A 500-byte JSON might need 200+ tokens, while the same information as plain text needs only 100. When sending JSON to an LLM:</p>
<ul>
  <li>Minify the JSON first (remove whitespace)</li>
  <li>Only include necessary fields; strip redundant data</li>
  <li>Consider converting structured data to concise natural language</li>
</ul>

<h2>Pro Tips</h2>
<ul>
  <li>💡 <strong>Cost estimation</strong> — Combined with per-token pricing (e.g. GPT-4o input at $5/1M tokens), estimate your API costs in advance</li>
  <li>💡 <strong>Context planning</strong> — Sum up system prompt + user message + JSON data token counts to ensure you stay within the model's limit</li>
  <li>💡 <strong>This tool is an estimate</strong> — For exact counts, use each model's official tokenizer library (e.g. tiktoken)</li>
</ul>
`
};

/* ── 20. JSON Schema Generator ──────────────────────────────────────────────── */
window.JT_DESCRIPTIONS['schema-generate'] = {
zh: `
<h2>什么是 JSON Schema 生成？</h2>
<p>JSON Schema 生成工具根据你的 JSON 样本数据，自动推断并生成符合 JSON Schema Draft-7 规范的 Schema 文档。生成的 Schema 可用于数据验证、API 文档、表单生成等场景，省去手动编写的繁琐工作。</p>

<h2>生成示例</h2>
<p><strong>输入 JSON：</strong></p>
<pre><code class="language-json">{
  "name": "Alice",
  "age": 30,
  "email": "alice@example.com",
  "tags": ["admin", "editor"]
}</code></pre>
<p><strong>生成的 Schema：</strong></p>
<pre><code class="language-json">{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Root",
  "type": "object",
  "required": ["name", "age", "email", "tags"],
  "properties": {
    "name":  { "type": "string" },
    "age":   { "type": "integer" },
    "email": { "type": "string", "format": "email" },
    "tags":  { "type": "array", "items": { "type": "string" } }
  }
}</code></pre>

<h2>自动推断规则</h2>
<table class="jt-desc-table">
  <thead><tr><th>JSON 值</th><th>推断类型</th><th>附加推断</th></tr></thead>
  <tbody>
    <tr><td><code>"alice@example.com"</code></td><td>string</td><td>format: email</td></tr>
    <tr><td><code>"https://example.com"</code></td><td>string</td><td>format: uri</td></tr>
    <tr><td><code>"2024-01-01"</code></td><td>string</td><td>format: date-time</td></tr>
    <tr><td><code>42</code></td><td>integer</td><td>—</td></tr>
    <tr><td><code>3.14</code></td><td>number</td><td>—</td></tr>
    <tr><td><code>true</code></td><td>boolean</td><td>—</td></tr>
    <tr><td><code>[...]</code></td><td>array</td><td>根据第一个元素推断 items 类型</td></tr>
    <tr><td><code>{...}</code></td><td>object</td><td>递归生成 properties</td></tr>
  </tbody>
</table>

<h2>Schema 的用途</h2>
<ul>
  <li><strong>数据验证</strong> — 配合"JSON Schema 验证"工具，对其他 JSON 数据做合法性校验</li>
  <li><strong>API 文档</strong> — 作为 OpenAPI/Swagger 中请求/响应体的 Schema 定义</li>
  <li><strong>表单生成</strong> — 基于 Schema 动态渲染表单（如 React JSON Schema Form）</li>
  <li><strong>代码生成</strong> — 根据 Schema 生成 TypeScript interface、Python dataclass 等</li>
</ul>

<h2>使用技巧</h2>
<ul>
  <li>💡 <strong>提供多样本</strong> — 生成器基于单个样本推断，若字段可能为 null 或多种类型，生成后需手动补充</li>
  <li>💡 <strong>检查 required 字段</strong> — 默认将所有非 null 字段标为 required，按实际业务调整</li>
  <li>💡 <strong>添加约束</strong> — 生成后可手动添加 minLength、minimum、pattern 等约束条件</li>
</ul>
`,
en: `
<h2>What is JSON Schema Generation?</h2>
<p>The JSON Schema Generator automatically infers and generates a JSON Schema Draft-7 document from your sample JSON data. The generated schema can be used for data validation, API documentation, form generation, and more—saving you the tedium of writing it by hand.</p>

<h2>Generation Example</h2>
<p><strong>Input JSON:</strong></p>
<pre><code class="language-json">{
  "name": "Alice",
  "age": 30,
  "email": "alice@example.com",
  "tags": ["admin", "editor"]
}</code></pre>
<p><strong>Generated Schema:</strong></p>
<pre><code class="language-json">{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Root",
  "type": "object",
  "required": ["name", "age", "email", "tags"],
  "properties": {
    "name":  { "type": "string" },
    "age":   { "type": "integer" },
    "email": { "type": "string", "format": "email" },
    "tags":  { "type": "array", "items": { "type": "string" } }
  }
}</code></pre>

<h2>Inference Rules</h2>
<table class="jt-desc-table">
  <thead><tr><th>JSON Value</th><th>Inferred Type</th><th>Additional</th></tr></thead>
  <tbody>
    <tr><td><code>"alice@example.com"</code></td><td>string</td><td>format: email</td></tr>
    <tr><td><code>"https://example.com"</code></td><td>string</td><td>format: uri</td></tr>
    <tr><td><code>"2024-01-01"</code></td><td>string</td><td>format: date-time</td></tr>
    <tr><td><code>42</code></td><td>integer</td><td>—</td></tr>
    <tr><td><code>3.14</code></td><td>number</td><td>—</td></tr>
    <tr><td><code>true</code></td><td>boolean</td><td>—</td></tr>
    <tr><td><code>[...]</code></td><td>array</td><td>items inferred from first element</td></tr>
    <tr><td><code>{...}</code></td><td>object</td><td>properties generated recursively</td></tr>
  </tbody>
</table>

<h2>What to Do With the Schema</h2>
<ul>
  <li><strong>Data validation</strong> — Use with the JSON Schema Validator tool to check other JSON data</li>
  <li><strong>API documentation</strong> — Use as request/response body schema in OpenAPI/Swagger</li>
  <li><strong>Form generation</strong> — Dynamically render forms based on schema (e.g. React JSON Schema Form)</li>
  <li><strong>Code generation</strong> — Generate TypeScript interfaces, Python dataclasses, etc. from the schema</li>
</ul>

<h2>Pro Tips</h2>
<ul>
  <li>💡 <strong>Use representative samples</strong> — The generator infers from a single sample; if fields can be null or multi-type, add those manually after generation</li>
  <li>💡 <strong>Review required fields</strong> — All non-null fields are marked required by default; adjust to match actual business rules</li>
  <li>💡 <strong>Add constraints manually</strong> — After generation, add minLength, minimum, pattern, and other constraints as needed</li>
</ul>
`
};

/* ── 21. JSON Schema Validator ──────────────────────────────────────────────── */
window.JT_DESCRIPTIONS['schema-validate'] = {
zh: `
<h2>什么是 JSON Schema 验证？</h2>
<p>JSON Schema 验证器根据你定义的 Schema 规则，检查 JSON 数据是否满足类型、格式、约束等所有条件。与简单的 JSON 语法验证不同，Schema 验证可以检查字段是否必填、数值是否在范围内、字符串是否匹配正则等业务规则。</p>

<h2>使用方式</h2>
<ol>
  <li>在<strong>左侧</strong>编辑器输入 JSON Schema（规则定义）</li>
  <li>在<strong>右侧</strong>编辑器输入要验证的 JSON 数据</li>
  <li>点击中间<strong>橙色箭头</strong>执行验证</li>
  <li>查看下方结果面板中的验证通过或错误详情</li>
</ol>

<h2>Schema 关键字速查</h2>
<table class="jt-desc-table">
  <thead><tr><th>关键字</th><th>作用</th><th>示例</th></tr></thead>
  <tbody>
    <tr><td><code>type</code></td><td>数据类型约束</td><td><code>"type": "string"</code></td></tr>
    <tr><td><code>required</code></td><td>必填字段列表</td><td><code>"required": ["name","age"]</code></td></tr>
    <tr><td><code>properties</code></td><td>对象字段定义</td><td><code>"properties": {"name": {"type":"string"}}</code></td></tr>
    <tr><td><code>minimum</code> / <code>maximum</code></td><td>数值范围</td><td><code>"minimum": 0, "maximum": 150</code></td></tr>
    <tr><td><code>minLength</code> / <code>maxLength</code></td><td>字符串长度</td><td><code>"minLength": 1</code></td></tr>
    <tr><td><code>pattern</code></td><td>正则表达式匹配</td><td><code>"pattern": "^\\d{11}$"</code></td></tr>
    <tr><td><code>format</code></td><td>格式验证</td><td><code>"format": "email"</code></td></tr>
    <tr><td><code>enum</code></td><td>枚举值限制</td><td><code>"enum": ["admin","user"]</code></td></tr>
    <tr><td><code>additionalProperties</code></td><td>禁止额外字段</td><td><code>"additionalProperties": false</code></td></tr>
  </tbody>
</table>

<h2>完整示例</h2>
<pre><code class="language-json">{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["name", "age", "email"],
  "properties": {
    "name":  { "type": "string", "minLength": 1 },
    "age":   { "type": "number", "minimum": 0, "maximum": 150 },
    "email": { "type": "string", "format": "email" },
    "role":  { "type": "string", "enum": ["admin", "user", "guest"] }
  },
  "additionalProperties": false
}</code></pre>

<h2>支持的格式（format）</h2>
<table class="jt-desc-table">
  <thead><tr><th>format 值</th><th>验证规则</th></tr></thead>
  <tbody>
    <tr><td><code>email</code></td><td>合法邮箱格式</td></tr>
    <tr><td><code>uri</code> / <code>url</code></td><td>合法 URL 格式</td></tr>
    <tr><td><code>date</code></td><td>YYYY-MM-DD 日期格式</td></tr>
    <tr><td><code>date-time</code></td><td>ISO 8601 日期时间格式</td></tr>
    <tr><td><code>ipv4</code></td><td>IPv4 地址格式</td></tr>
  </tbody>
</table>

<h2>使用技巧</h2>
<ul>
  <li>💡 <strong>先生成再验证</strong> — 没有现成 Schema？先用"JSON Schema 生成"工具从样本数据自动生成，再修改完善</li>
  <li>💡 <strong>本工具内置验证器</strong> — 无需加载外部库，所有验证在浏览器本地完成，数据不会上传</li>
  <li>💡 <strong>allOf / anyOf / oneOf</strong> — 支持组合验证，可实现复杂的联合类型约束</li>
</ul>
`,
en: `
<h2>What is JSON Schema Validation?</h2>
<p>JSON Schema validation checks whether JSON data satisfies all the rules defined in a Schema—types, formats, constraints, and more. Unlike simple JSON syntax validation, Schema validation enforces business rules: required fields, numeric ranges, string patterns, and allowed values.</p>

<h2>How to Use</h2>
<ol>
  <li>Enter your JSON Schema (rule definitions) in the <strong>left</strong> editor</li>
  <li>Enter the JSON data to validate in the <strong>right</strong> editor</li>
  <li>Click the <strong>orange arrow</strong> in the middle to run validation</li>
  <li>Review the result panel below for pass/fail details</li>
</ol>

<h2>Schema Keywords Quick Reference</h2>
<table class="jt-desc-table">
  <thead><tr><th>Keyword</th><th>Purpose</th><th>Example</th></tr></thead>
  <tbody>
    <tr><td><code>type</code></td><td>Data type constraint</td><td><code>"type": "string"</code></td></tr>
    <tr><td><code>required</code></td><td>List of required fields</td><td><code>"required": ["name","age"]</code></td></tr>
    <tr><td><code>properties</code></td><td>Object field definitions</td><td><code>"properties": {"name": {"type":"string"}}</code></td></tr>
    <tr><td><code>minimum</code> / <code>maximum</code></td><td>Numeric range</td><td><code>"minimum": 0, "maximum": 150</code></td></tr>
    <tr><td><code>minLength</code> / <code>maxLength</code></td><td>String length</td><td><code>"minLength": 1</code></td></tr>
    <tr><td><code>pattern</code></td><td>Regex match</td><td><code>"pattern": "^\\d{10}$"</code></td></tr>
    <tr><td><code>format</code></td><td>Format validation</td><td><code>"format": "email"</code></td></tr>
    <tr><td><code>enum</code></td><td>Allowed values list</td><td><code>"enum": ["admin","user"]</code></td></tr>
    <tr><td><code>additionalProperties</code></td><td>Disallow extra fields</td><td><code>"additionalProperties": false</code></td></tr>
  </tbody>
</table>

<h2>Full Example</h2>
<pre><code class="language-json">{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["name", "age", "email"],
  "properties": {
    "name":  { "type": "string", "minLength": 1 },
    "age":   { "type": "number", "minimum": 0, "maximum": 150 },
    "email": { "type": "string", "format": "email" },
    "role":  { "type": "string", "enum": ["admin", "user", "guest"] }
  },
  "additionalProperties": false
}</code></pre>

<h2>Supported Formats</h2>
<table class="jt-desc-table">
  <thead><tr><th>format Value</th><th>Validation Rule</th></tr></thead>
  <tbody>
    <tr><td><code>email</code></td><td>Valid email address</td></tr>
    <tr><td><code>uri</code> / <code>url</code></td><td>Valid URL</td></tr>
    <tr><td><code>date</code></td><td>YYYY-MM-DD date format</td></tr>
    <tr><td><code>date-time</code></td><td>ISO 8601 datetime format</td></tr>
    <tr><td><code>ipv4</code></td><td>IPv4 address format</td></tr>
  </tbody>
</table>

<h2>Pro Tips</h2>
<ul>
  <li>💡 <strong>Generate then validate</strong> — No Schema yet? Use the JSON Schema Generator to auto-generate one from sample data, then refine it</li>
  <li>💡 <strong>Built-in validator</strong> — No external library needed; all validation runs locally in your browser, data is never uploaded</li>
  <li>💡 <strong>allOf / anyOf / oneOf</strong> — Supports compositional validation for complex union type constraints</li>
</ul>
`
};

/* ── 22. JSON to CSV ────────────────────────────────────────────────────────── */
window.JT_DESCRIPTIONS['to-csv'] = {
zh: `
<h2>什么是 JSON 转 CSV？</h2>
<p>JSON 转 CSV 工具将 JSON 数组转换为逗号分隔值（CSV）格式，可直接在 Excel、Google Sheets 或数据分析工具中打开。适合将 API 返回的数据快速导出为电子表格。</p>

<h2>转换示例</h2>
<p><strong>输入 JSON：</strong></p>
<pre><code class="language-json">[
  { "name": "Alice", "age": 30, "city": "Beijing" },
  { "name": "Bob",   "age": 25, "city": "Shanghai" }
]</code></pre>
<p><strong>输出 CSV：</strong></p>
<pre><code>name,age,city
Alice,30,Beijing
Bob,25,Shanghai</code></pre>

<h2>分隔符选项</h2>
<table class="jt-desc-table">
  <thead><tr><th>分隔符</th><th>用途</th></tr></thead>
  <tbody>
    <tr><td>逗号 <code>,</code></td><td>标准 CSV，最通用</td></tr>
    <tr><td>分号 <code>;</code></td><td>欧洲地区 Excel 常用</td></tr>
    <tr><td>制表符 <code>\t</code></td><td>TSV 格式，避免逗号冲突</td></tr>
    <tr><td>管道符 <code>|</code></td><td>数据库导出常用</td></tr>
  </tbody>
</table>

<h2>注意事项</h2>
<ul>
  <li><strong>输入必须为数组</strong> — 根对象必须是 JSON 数组 <code>[...]</code></li>
  <li><strong>嵌套对象会被序列化</strong> — 嵌套 JSON 对象会转为字符串形式填入单元格</li>
  <li><strong>含逗号的值会被引用</strong> — 值中含分隔符时自动加双引号包裹</li>
</ul>

<h2>使用技巧</h2>
<ul>
  <li>💡 <strong>先扁平化再转换</strong> — 若 JSON 有嵌套结构，先用"JSON 扁平化"工具展开，再转 CSV 效果更好</li>
  <li>💡 <strong>Excel 打开乱码</strong> — 用 Excel 打开时若出现乱码，选择"数据 → 从文本/CSV 导入"并指定 UTF-8 编码</li>
</ul>
`,
en: `
<h2>What is JSON to CSV?</h2>
<p>JSON to CSV converts a JSON array into comma-separated values (CSV) format that can be opened directly in Excel, Google Sheets, or data analysis tools. It's perfect for quickly exporting API response data into a spreadsheet.</p>

<h2>Conversion Example</h2>
<p><strong>Input JSON:</strong></p>
<pre><code class="language-json">[
  { "name": "Alice", "age": 30, "city": "Beijing" },
  { "name": "Bob",   "age": 25, "city": "Shanghai" }
]</code></pre>
<p><strong>Output CSV:</strong></p>
<pre><code>name,age,city
Alice,30,Beijing
Bob,25,Shanghai</code></pre>

<h2>Delimiter Options</h2>
<table class="jt-desc-table">
  <thead><tr><th>Delimiter</th><th>Usage</th></tr></thead>
  <tbody>
    <tr><td>Comma <code>,</code></td><td>Standard CSV, most universal</td></tr>
    <tr><td>Semicolon <code>;</code></td><td>Common in European Excel locales</td></tr>
    <tr><td>Tab <code>\t</code></td><td>TSV format, avoids comma conflicts</td></tr>
    <tr><td>Pipe <code>|</code></td><td>Common in database exports</td></tr>
  </tbody>
</table>

<h2>Requirements</h2>
<ul>
  <li><strong>Input must be an array</strong> — The root element must be a JSON array <code>[...]</code></li>
  <li><strong>Nested objects are serialized</strong> — Nested JSON objects are converted to strings within cells</li>
  <li><strong>Values with delimiters are quoted</strong> — Values containing the delimiter are automatically wrapped in double quotes</li>
</ul>

<h2>Pro Tips</h2>
<ul>
  <li>💡 <strong>Flatten first</strong> — If your JSON has nested structures, use JSON Flatten first for cleaner CSV output</li>
  <li>💡 <strong>Excel encoding issue</strong> — If Excel shows garbled text, use "Data → From Text/CSV" and specify UTF-8 encoding</li>
</ul>
`
};

/* ── 23. CSV to JSON ────────────────────────────────────────────────────────── */
window.JT_DESCRIPTIONS['from-csv'] = {
zh: `
<h2>什么是 CSV 转 JSON？</h2>
<p>CSV 转 JSON 工具将逗号分隔值文件解析为结构化的 JSON 数组。每行数据转为一个对象，第一行（表头）的列名作为 JSON 的键名。适合将 Excel 导出数据、数据库查询结果导入到 Web 应用或 API。</p>

<h2>转换示例</h2>
<p><strong>输入 CSV：</strong></p>
<pre><code>name,age,city
Alice,30,Beijing
Bob,25,Shanghai</code></pre>
<p><strong>输出 JSON：</strong></p>
<pre><code class="language-json">[
  { "name": "Alice", "age": "30", "city": "Beijing" },
  { "name": "Bob",   "age": "25", "city": "Shanghai" }
]</code></pre>

<h2>注意事项</h2>
<table class="jt-desc-table">
  <thead><tr><th>注意点</th><th>说明</th></tr></thead>
  <tbody>
    <tr><td>数字类型</td><td>默认所有值为字符串，需要数字类型请后处理</td></tr>
    <tr><td>首行表头</td><td>第一行必须是列标题，用作 JSON 键名</td></tr>
    <tr><td>引号内逗号</td><td>被双引号包裹的逗号视为值内容，不作分隔符</td></tr>
    <tr><td>空值处理</td><td>空单元格转为空字符串 <code>""</code></td></tr>
  </tbody>
</table>

<h2>使用技巧</h2>
<ul>
  <li>💡 <strong>Excel 文件</strong> — Excel 文件先另存为 CSV 格式，再粘贴到本工具；或直接使用"Excel 转 JSON"工具</li>
  <li>💡 <strong>类型转换</strong> — 转换后若需要将数字列转为 number 类型，可在 JavaScript 中用 <code>parseInt()</code> 或 <code>parseFloat()</code> 处理</li>
  <li>💡 <strong>编码问题</strong> — 若 CSV 含有中文，确保文件以 UTF-8 编码保存</li>
</ul>
`,
en: `
<h2>What is CSV to JSON?</h2>
<p>CSV to JSON parses a comma-separated values file into a structured JSON array. Each row becomes an object, and the first row (header) provides the key names. Perfect for importing Excel exports, database query results, or spreadsheet data into web applications or APIs.</p>

<h2>Conversion Example</h2>
<p><strong>Input CSV:</strong></p>
<pre><code>name,age,city
Alice,30,Beijing
Bob,25,Shanghai</code></pre>
<p><strong>Output JSON:</strong></p>
<pre><code class="language-json">[
  { "name": "Alice", "age": "30", "city": "Beijing" },
  { "name": "Bob",   "age": "25", "city": "Shanghai" }
]</code></pre>

<h2>Things to Know</h2>
<table class="jt-desc-table">
  <thead><tr><th>Point</th><th>Details</th></tr></thead>
  <tbody>
    <tr><td>Number types</td><td>All values are strings by default; post-process to convert numbers</td></tr>
    <tr><td>Header row</td><td>The first row must be column titles; they become JSON keys</td></tr>
    <tr><td>Commas in values</td><td>Commas inside double-quoted values are treated as content, not delimiters</td></tr>
    <tr><td>Empty cells</td><td>Empty cells are converted to empty strings <code>""</code></td></tr>
  </tbody>
</table>

<h2>Pro Tips</h2>
<ul>
  <li>💡 <strong>Excel files</strong> — Save Excel as CSV first, then paste here; or use the Excel to JSON tool directly</li>
  <li>💡 <strong>Type conversion</strong> — After conversion, use <code>parseInt()</code> or <code>parseFloat()</code> in JavaScript to convert numeric string columns</li>
  <li>💡 <strong>Encoding</strong> — Ensure your CSV file is saved as UTF-8 if it contains non-ASCII characters</li>
</ul>
`
};

/* ── 24. JSON to Excel ──────────────────────────────────────────────────────── */
window.JT_DESCRIPTIONS['to-excel'] = {
zh: `
<h2>什么是 JSON 转 Excel？</h2>
<p>JSON 转 Excel 工具将 JSON 数组导出为 <code>.xlsx</code> 格式的 Excel 电子表格文件，可直接下载并用 Microsoft Excel 或 Google Sheets 打开。相比 CSV，Excel 格式原生支持 UTF-8 编码，中文不会乱码。</p>

<h2>转换示例</h2>
<p><strong>输入 JSON：</strong></p>
<pre><code class="language-json">[
  { "产品": "苹果", "价格": 5.5, "库存": 100 },
  { "产品": "香蕉", "价格": 3.0, "库存": 200 }
]</code></pre>
<p>输出：一个包含表头和数据行的 <code>.xlsx</code> 文件，直接可在 Excel 中编辑。</p>

<h2>JSON 转 Excel vs JSON 转 CSV</h2>
<table class="jt-desc-table">
  <thead><tr><th>特性</th><th>Excel (.xlsx)</th><th>CSV (.csv)</th></tr></thead>
  <tbody>
    <tr><td>中文支持</td><td>✅ 原生支持</td><td>⚠️ 需手动指定编码</td></tr>
    <tr><td>多 Sheet</td><td>✅ 支持</td><td>❌ 不支持</td></tr>
    <tr><td>数字格式</td><td>✅ 保留数字类型</td><td>⚠️ 全部为文本</td></tr>
    <tr><td>文件大小</td><td>较大（压缩格式）</td><td>更小</td></tr>
    <tr><td>通用性</td><td>需 Excel/WPS 打开</td><td>任何文本编辑器</td></tr>
  </tbody>
</table>

<h2>使用技巧</h2>
<ul>
  <li>💡 <strong>自定义 Sheet 名</strong> — 顶部工具栏可设置工作表名称，默认为 <code>Sheet1</code></li>
  <li>💡 <strong>先扁平化</strong> — 嵌套 JSON 建议先用"扁平化"工具展开，再导出 Excel</li>
  <li>💡 <strong>大数据量</strong> — Excel 单 Sheet 最多支持约 100 万行，超出建议分批导出</li>
</ul>
`,
en: `
<h2>What is JSON to Excel?</h2>
<p>JSON to Excel exports a JSON array as a <code>.xlsx</code> Excel spreadsheet file that can be downloaded and opened directly in Microsoft Excel or Google Sheets. Unlike CSV, the Excel format natively handles UTF-8 encoding and preserves number types.</p>

<h2>Conversion Example</h2>
<p><strong>Input JSON:</strong></p>
<pre><code class="language-json">[
  { "product": "Apple",  "price": 5.5, "stock": 100 },
  { "product": "Banana", "price": 3.0, "stock": 200 }
]</code></pre>
<p>Output: a <code>.xlsx</code> file with a header row and data rows, ready to edit in Excel.</p>

<h2>JSON to Excel vs JSON to CSV</h2>
<table class="jt-desc-table">
  <thead><tr><th>Feature</th><th>Excel (.xlsx)</th><th>CSV (.csv)</th></tr></thead>
  <tbody>
    <tr><td>Unicode support</td><td>✅ Native</td><td>⚠️ Requires manual encoding</td></tr>
    <tr><td>Multiple sheets</td><td>✅ Supported</td><td>❌ Not supported</td></tr>
    <tr><td>Number types</td><td>✅ Preserved</td><td>⚠️ All text</td></tr>
    <tr><td>File size</td><td>Larger (compressed)</td><td>Smaller</td></tr>
    <tr><td>Portability</td><td>Requires Excel/WPS</td><td>Any text editor</td></tr>
  </tbody>
</table>

<h2>Pro Tips</h2>
<ul>
  <li>💡 <strong>Custom sheet name</strong> — Set the worksheet name in the toolbar; default is <code>Sheet1</code></li>
  <li>💡 <strong>Flatten nested JSON first</strong> — Use the JSON Flatten tool before exporting for cleaner columns</li>
  <li>💡 <strong>Large data</strong> — Excel supports up to ~1 million rows per sheet; export in batches for larger datasets</li>
</ul>
`
};

/* ── 25. Excel to JSON ──────────────────────────────────────────────────────── */
window.JT_DESCRIPTIONS['from-excel'] = {
zh: `
<h2>什么是 Excel 转 JSON？</h2>
<p>Excel 转 JSON 工具将 <code>.xlsx</code>/<code>.xls</code> 格式的 Excel 电子表格转换为 JSON 数组。第一行作为字段名（键），后续每行转为一个 JSON 对象。适合将业务人员维护的 Excel 数据导入到 Web 应用或数据库。</p>

<h2>使用方式</h2>
<ol>
  <li>点击上传区域或拖拽 Excel 文件（<code>.xlsx</code>/<code>.xls</code>/<code>.csv</code>）</li>
  <li>文件自动解析，右侧显示 JSON 结果</li>
  <li>复制或下载 JSON</li>
</ol>

<h2>转换规则</h2>
<table class="jt-desc-table">
  <thead><tr><th>Excel 内容</th><th>JSON 结果</th></tr></thead>
  <tbody>
    <tr><td>第一行（表头）</td><td>JSON 对象的键名</td></tr>
    <tr><td>数字单元格</td><td>JSON number 类型</td></tr>
    <tr><td>文本单元格</td><td>JSON string 类型</td></tr>
    <tr><td>日期单元格</td><td>JavaScript Date 序列化字符串</td></tr>
    <tr><td>空单元格</td><td>空字符串 <code>""</code> 或省略</td></tr>
    <tr><td>多 Sheet</td><td>默认读取第一个工作表</td></tr>
  </tbody>
</table>

<h2>使用技巧</h2>
<ul>
  <li>💡 <strong>合并单元格</strong> — 合并单元格只保留左上角的值，合并范围内其他单元格为空</li>
  <li>💡 <strong>公式单元格</strong> — 只读取计算后的值，不保留公式</li>
  <li>💡 <strong>大文件</strong> — 超大 Excel 文件（几十 MB）建议先在 Excel 中筛选或分割后再转换</li>
</ul>
`,
en: `
<h2>What is Excel to JSON?</h2>
<p>Excel to JSON converts <code>.xlsx</code>/<code>.xls</code> spreadsheets into a JSON array. The first row becomes the field names (keys), and each subsequent row becomes a JSON object. Perfect for importing Excel data maintained by business users into web applications or databases.</p>

<h2>How to Use</h2>
<ol>
  <li>Click the upload area or drag and drop an Excel file (<code>.xlsx</code>/<code>.xls</code>/<code>.csv</code>)</li>
  <li>The file is parsed automatically; JSON appears on the right</li>
  <li>Copy or download the JSON result</li>
</ol>

<h2>Conversion Rules</h2>
<table class="jt-desc-table">
  <thead><tr><th>Excel Content</th><th>JSON Result</th></tr></thead>
  <tbody>
    <tr><td>First row (header)</td><td>JSON object key names</td></tr>
    <tr><td>Number cell</td><td>JSON number type</td></tr>
    <tr><td>Text cell</td><td>JSON string type</td></tr>
    <tr><td>Date cell</td><td>JavaScript Date serialized string</td></tr>
    <tr><td>Empty cell</td><td>Empty string <code>""</code> or omitted</td></tr>
    <tr><td>Multiple sheets</td><td>First sheet is read by default</td></tr>
  </tbody>
</table>

<h2>Pro Tips</h2>
<ul>
  <li>💡 <strong>Merged cells</strong> — Only the top-left value is retained; merged range cells are empty</li>
  <li>💡 <strong>Formula cells</strong> — Only the calculated value is read, not the formula itself</li>
  <li>💡 <strong>Large files</strong> — For very large Excel files (tens of MB), filter or split in Excel first before converting</li>
</ul>
`
};

/* ── 26. JSON to YAML ───────────────────────────────────────────────────────── */
window.JT_DESCRIPTIONS['to-yaml'] = {
zh: `
<h2>什么是 JSON 转 YAML？</h2>
<p>YAML（YAML Ain't Markup Language）是一种人类可读的数据序列化格式，常用于配置文件（Docker Compose、Kubernetes、GitHub Actions 等）。JSON 转 YAML 工具将 JSON 数据转换为等价的 YAML 格式，更简洁易读。</p>

<h2>转换对比</h2>
<p><strong>JSON：</strong></p>
<pre><code class="language-json">{
  "server": {
    "host": "localhost",
    "port": 8080,
    "debug": true
  },
  "database": ["mysql", "redis"]
}</code></pre>
<p><strong>等价 YAML：</strong></p>
<pre><code class="language-yaml">server:
  host: localhost
  port: 8080
  debug: true
database:
  - mysql
  - redis</code></pre>

<h2>JSON vs YAML 对比</h2>
<table class="jt-desc-table">
  <thead><tr><th>特性</th><th>JSON</th><th>YAML</th></tr></thead>
  <tbody>
    <tr><td>注释支持</td><td>❌</td><td>✅（<code>#</code> 开头）</td></tr>
    <tr><td>多行字符串</td><td>复杂（需转义换行）</td><td>✅（<code>|</code> 或 <code>&gt;</code>）</td></tr>
    <tr><td>可读性</td><td>一般</td><td>更好（无括号引号）</td></tr>
    <tr><td>解析复杂度</td><td>简单</td><td>较复杂</td></tr>
    <tr><td>常见用途</td><td>API、数据传输</td><td>配置文件、CI/CD</td></tr>
  </tbody>
</table>

<h2>使用技巧</h2>
<ul>
  <li>💡 <strong>YAML 严格缩进</strong> — YAML 使用空格缩进（不能用 Tab），转换后请勿手动用 Tab 修改</li>
  <li>💡 <strong>特殊字符需引号</strong> — YAML 中含 <code>:</code>、<code>#</code>、<code>@</code> 等字符的字符串值需要加引号</li>
  <li>💡 <strong>Kubernetes 配置</strong> — 可将 JSON 格式的 K8s 资源定义转为更易阅读的 YAML 格式</li>
</ul>
`,
en: `
<h2>What is JSON to YAML?</h2>
<p>YAML (YAML Ain't Markup Language) is a human-readable data serialization format commonly used for configuration files (Docker Compose, Kubernetes, GitHub Actions, etc.). JSON to YAML converts your JSON data into equivalent, more readable YAML format.</p>

<h2>Conversion Comparison</h2>
<p><strong>JSON:</strong></p>
<pre><code class="language-json">{
  "server": {
    "host": "localhost",
    "port": 8080,
    "debug": true
  },
  "database": ["mysql", "redis"]
}</code></pre>
<p><strong>Equivalent YAML:</strong></p>
<pre><code class="language-yaml">server:
  host: localhost
  port: 8080
  debug: true
database:
  - mysql
  - redis</code></pre>

<h2>JSON vs YAML</h2>
<table class="jt-desc-table">
  <thead><tr><th>Feature</th><th>JSON</th><th>YAML</th></tr></thead>
  <tbody>
    <tr><td>Comments</td><td>❌</td><td>✅ (lines starting with <code>#</code>)</td></tr>
    <tr><td>Multi-line strings</td><td>Complex (escape newlines)</td><td>✅ (<code>|</code> or <code>&gt;</code> blocks)</td></tr>
    <tr><td>Readability</td><td>Moderate</td><td>Better (no brackets/quotes)</td></tr>
    <tr><td>Parse complexity</td><td>Simple</td><td>More complex</td></tr>
    <tr><td>Common usage</td><td>APIs, data transfer</td><td>Config files, CI/CD</td></tr>
  </tbody>
</table>

<h2>Pro Tips</h2>
<ul>
  <li>💡 <strong>YAML uses strict spaces</strong> — YAML indentation must use spaces (never tabs); don't manually edit with Tab</li>
  <li>💡 <strong>Special chars need quotes</strong> — String values containing <code>:</code>, <code>#</code>, or <code>@</code> need to be quoted in YAML</li>
  <li>💡 <strong>Kubernetes configs</strong> — Convert JSON-format K8s resource definitions to more readable YAML</li>
</ul>
`
};

/* ── 27. YAML to JSON ───────────────────────────────────────────────────────── */
window.JT_DESCRIPTIONS['from-yaml'] = {
zh: `
<h2>什么是 YAML 转 JSON？</h2>
<p>YAML 转 JSON 工具将 YAML 格式的配置或数据解析为标准 JSON。在需要通过 API 传递 YAML 配置数据、或在不支持 YAML 的环境中使用配置时非常有用。</p>

<h2>转换对比</h2>
<p><strong>YAML 输入：</strong></p>
<pre><code class="language-yaml">name: Alice
age: 30
hobbies:
  - reading
  - coding
address:
  city: Beijing
  country: China</code></pre>
<p><strong>JSON 输出：</strong></p>
<pre><code class="language-json">{
  "name": "Alice",
  "age": 30,
  "hobbies": ["reading", "coding"],
  "address": { "city": "Beijing", "country": "China" }
}</code></pre>

<h2>YAML 特有特性处理</h2>
<table class="jt-desc-table">
  <thead><tr><th>YAML 特性</th><th>JSON 转换结果</th></tr></thead>
  <tbody>
    <tr><td>注释（<code>#</code>）</td><td>转换时丢弃</td></tr>
    <tr><td>锚点 &amp; 别名（<code>&amp;</code>/<code>*</code>）</td><td>展开为完整值</td></tr>
    <tr><td>多行字符串（<code>|</code>/<code>&gt;</code>）</td><td>转为含换行符的字符串</td></tr>
    <tr><td>布尔值（<code>yes</code>/<code>no</code>/<code>on</code>/<code>off</code>）</td><td>转为 <code>true</code>/<code>false</code></td></tr>
    <tr><td>Null（<code>~</code> 或空值）</td><td>转为 <code>null</code></td></tr>
  </tbody>
</table>

<h2>使用技巧</h2>
<ul>
  <li>💡 <strong>注释会丢失</strong> — YAML 注释在转为 JSON 后无法保留，这是格式差异导致的必然结果</li>
  <li>💡 <strong>多文档 YAML</strong> — 含 <code>---</code> 分隔符的多文档 YAML，本工具解析第一个文档</li>
  <li>💡 <strong>验证 YAML 语法</strong> — 转换失败时通常是 YAML 缩进有问题，检查是否混用了 Tab 和空格</li>
</ul>
`,
en: `
<h2>What is YAML to JSON?</h2>
<p>YAML to JSON parses YAML-formatted configuration or data into standard JSON. It's useful when you need to pass YAML config data through an API, or use configuration in environments that don't support YAML natively.</p>

<h2>Conversion Comparison</h2>
<p><strong>YAML input:</strong></p>
<pre><code class="language-yaml">name: Alice
age: 30
hobbies:
  - reading
  - coding
address:
  city: Beijing
  country: China</code></pre>
<p><strong>JSON output:</strong></p>
<pre><code class="language-json">{
  "name": "Alice",
  "age": 30,
  "hobbies": ["reading", "coding"],
  "address": { "city": "Beijing", "country": "China" }
}</code></pre>

<h2>YAML-Specific Feature Handling</h2>
<table class="jt-desc-table">
  <thead><tr><th>YAML Feature</th><th>JSON Result</th></tr></thead>
  <tbody>
    <tr><td>Comments (<code>#</code>)</td><td>Discarded during conversion</td></tr>
    <tr><td>Anchors &amp; aliases (<code>&amp;</code>/<code>*</code>)</td><td>Expanded to full values</td></tr>
    <tr><td>Multi-line strings (<code>|</code>/<code>&gt;</code>)</td><td>Converted to strings with newlines</td></tr>
    <tr><td>Booleans (<code>yes</code>/<code>no</code>/<code>on</code>/<code>off</code>)</td><td>Converted to <code>true</code>/<code>false</code></td></tr>
    <tr><td>Null (<code>~</code> or empty)</td><td>Converted to <code>null</code></td></tr>
  </tbody>
</table>

<h2>Pro Tips</h2>
<ul>
  <li>💡 <strong>Comments are lost</strong> — YAML comments cannot be preserved in JSON; this is an inherent format difference</li>
  <li>💡 <strong>Multi-document YAML</strong> — For YAML with <code>---</code> separators, only the first document is parsed</li>
  <li>💡 <strong>Debug YAML syntax</strong> — If conversion fails, it's usually an indentation issue; check for mixed tabs and spaces</li>
</ul>
`
};

/* ── 28. JSON to XML ────────────────────────────────────────────────────────── */
window.JT_DESCRIPTIONS['to-xml'] = {
zh: `
<h2>什么是 JSON 转 XML？</h2>
<p>JSON 转 XML 工具将 JSON 对象转换为 XML（可扩展标记语言）格式。虽然现代 API 多数使用 JSON，但与遗留系统、SOAP Web Services、RSS/Atom Feed 集成时仍需要 XML 格式。</p>

<h2>转换示例</h2>
<p><strong>JSON 输入：</strong></p>
<pre><code class="language-json">{
  "person": {
    "name": "Alice",
    "age": 30,
    "email": "alice@example.com"
  }
}</code></pre>
<p><strong>XML 输出：</strong></p>
<pre><code class="language-xml">&lt;?xml version="1.0" encoding="UTF-8"?&gt;
&lt;root&gt;
  &lt;person&gt;
    &lt;name&gt;Alice&lt;/name&gt;
    &lt;age&gt;30&lt;/age&gt;
    &lt;email&gt;alice@example.com&lt;/email&gt;
  &lt;/person&gt;
&lt;/root&gt;</code></pre>

<h2>JSON vs XML 对比</h2>
<table class="jt-desc-table">
  <thead><tr><th>特性</th><th>JSON</th><th>XML</th></tr></thead>
  <tbody>
    <tr><td>可读性</td><td>更简洁</td><td>更冗长</td></tr>
    <tr><td>属性支持</td><td>无（只有值）</td><td>✅ 元素属性</td></tr>
    <tr><td>注释支持</td><td>❌</td><td>✅ <code>&lt;!-- --&gt;</code></td></tr>
    <tr><td>命名空间</td><td>❌</td><td>✅ xmlns</td></tr>
    <tr><td>Schema 验证</td><td>JSON Schema</td><td>XSD / DTD</td></tr>
    <tr><td>常见用途</td><td>REST API</td><td>SOAP、RSS、配置文件</td></tr>
  </tbody>
</table>

<h2>使用技巧</h2>
<ul>
  <li>💡 <strong>自定义根节点</strong> — 顶部工具栏可设置根节点名称，默认为 <code>root</code></li>
  <li>💡 <strong>数组转换</strong> — JSON 数组中的每个元素转为同名子节点，重复元素名是合法的 XML</li>
  <li>💡 <strong>特殊字符转义</strong> — JSON 值中的 <code>&lt;</code>、<code>&gt;</code>、<code>&amp;</code> 等字符会自动转义为 XML 实体</li>
</ul>
`,
en: `
<h2>What is JSON to XML?</h2>
<p>JSON to XML converts JSON objects into XML (Extensible Markup Language) format. While modern APIs mostly use JSON, XML is still required when integrating with legacy systems, SOAP web services, or RSS/Atom feeds.</p>

<h2>Conversion Example</h2>
<p><strong>JSON input:</strong></p>
<pre><code class="language-json">{
  "person": {
    "name": "Alice",
    "age": 30,
    "email": "alice@example.com"
  }
}</code></pre>
<p><strong>XML output:</strong></p>
<pre><code class="language-xml">&lt;?xml version="1.0" encoding="UTF-8"?&gt;
&lt;root&gt;
  &lt;person&gt;
    &lt;name&gt;Alice&lt;/name&gt;
    &lt;age&gt;30&lt;/age&gt;
    &lt;email&gt;alice@example.com&lt;/email&gt;
  &lt;/person&gt;
&lt;/root&gt;</code></pre>

<h2>JSON vs XML</h2>
<table class="jt-desc-table">
  <thead><tr><th>Feature</th><th>JSON</th><th>XML</th></tr></thead>
  <tbody>
    <tr><td>Verbosity</td><td>Concise</td><td>More verbose</td></tr>
    <tr><td>Attributes</td><td>No (values only)</td><td>✅ Element attributes</td></tr>
    <tr><td>Comments</td><td>❌</td><td>✅ <code>&lt;!-- --&gt;</code></td></tr>
    <tr><td>Namespaces</td><td>❌</td><td>✅ xmlns</td></tr>
    <tr><td>Schema validation</td><td>JSON Schema</td><td>XSD / DTD</td></tr>
    <tr><td>Common usage</td><td>REST APIs</td><td>SOAP, RSS, config files</td></tr>
  </tbody>
</table>

<h2>Pro Tips</h2>
<ul>
  <li>💡 <strong>Custom root node</strong> — Set the root element name in the toolbar; defaults to <code>root</code></li>
  <li>💡 <strong>Array conversion</strong> — Each element in a JSON array becomes a sibling node with the same tag name, which is valid XML</li>
  <li>💡 <strong>Special characters</strong> — <code>&lt;</code>, <code>&gt;</code>, <code>&amp;</code> in JSON values are automatically escaped as XML entities</li>
</ul>
`
};

/* ── 29. XML to JSON ────────────────────────────────────────────────────────── */
window.JT_DESCRIPTIONS['from-xml'] = {
zh: `
<h2>什么是 XML 转 JSON？</h2>
<p>XML 转 JSON 工具将 XML 文档解析为等价的 JSON 结构。适合对接遗留 SOAP 接口、RSS/Atom Feed、Android 资源文件等场景，将 XML 数据转换为现代应用更易处理的 JSON 格式。</p>

<h2>转换示例</h2>
<p><strong>XML 输入：</strong></p>
<pre><code class="language-xml">&lt;user id="1"&gt;
  &lt;name&gt;Alice&lt;/name&gt;
  &lt;email&gt;alice@example.com&lt;/email&gt;
  &lt;roles&gt;
    &lt;role&gt;admin&lt;/role&gt;
    &lt;role&gt;editor&lt;/role&gt;
  &lt;/roles&gt;
&lt;/user&gt;</code></pre>
<p><strong>JSON 输出：</strong></p>
<pre><code class="language-json">{
  "user": {
    "@id": "1",
    "name": "Alice",
    "email": "alice@example.com",
    "roles": {
      "role": ["admin", "editor"]
    }
  }
}</code></pre>

<h2>转换规则说明</h2>
<table class="jt-desc-table">
  <thead><tr><th>XML 结构</th><th>JSON 处理方式</th></tr></thead>
  <tbody>
    <tr><td>元素属性（如 <code>id="1"</code>）</td><td>转为带 <code>@</code> 前缀的键</td></tr>
    <tr><td>重复同名元素</td><td>转为数组</td></tr>
    <tr><td>纯文本内容</td><td>直接作为字符串值</td></tr>
    <tr><td>CDATA 块</td><td>提取其中的文本</td></tr>
    <tr><td>XML 注释</td><td>转换时丢弃</td></tr>
  </tbody>
</table>

<h2>使用技巧</h2>
<ul>
  <li>💡 <strong>命名空间</strong> — XML 命名空间前缀会保留在键名中（如 <code>ns:element</code>）</li>
  <li>💡 <strong>复杂 XML</strong> — SOAP 响应通常嵌套较深，转换后建议配合"JSON 扁平化"工具简化结构</li>
  <li>💡 <strong>RSS 解析</strong> — RSS/Atom Feed 转 JSON 后，可用 JSON Path 提取文章列表等信息</li>
</ul>
`,
en: `
<h2>What is XML to JSON?</h2>
<p>XML to JSON parses an XML document into an equivalent JSON structure. It's ideal for integrating with legacy SOAP APIs, RSS/Atom feeds, or Android resource files, converting XML data into a format that modern applications can work with more easily.</p>

<h2>Conversion Example</h2>
<p><strong>XML input:</strong></p>
<pre><code class="language-xml">&lt;user id="1"&gt;
  &lt;name&gt;Alice&lt;/name&gt;
  &lt;email&gt;alice@example.com&lt;/email&gt;
  &lt;roles&gt;
    &lt;role&gt;admin&lt;/role&gt;
    &lt;role&gt;editor&lt;/role&gt;
  &lt;/roles&gt;
&lt;/user&gt;</code></pre>
<p><strong>JSON output:</strong></p>
<pre><code class="language-json">{
  "user": {
    "@id": "1",
    "name": "Alice",
    "email": "alice@example.com",
    "roles": {
      "role": ["admin", "editor"]
    }
  }
}</code></pre>

<h2>Conversion Rules</h2>
<table class="jt-desc-table">
  <thead><tr><th>XML Structure</th><th>JSON Handling</th></tr></thead>
  <tbody>
    <tr><td>Element attributes (e.g. <code>id="1"</code>)</td><td>Prefixed with <code>@</code> in key names</td></tr>
    <tr><td>Repeated sibling elements</td><td>Converted to an array</td></tr>
    <tr><td>Plain text content</td><td>Used directly as a string value</td></tr>
    <tr><td>CDATA blocks</td><td>Text content is extracted</td></tr>
    <tr><td>XML comments</td><td>Discarded during conversion</td></tr>
  </tbody>
</table>

<h2>Pro Tips</h2>
<ul>
  <li>💡 <strong>Namespaces</strong> — XML namespace prefixes are preserved in key names (e.g. <code>ns:element</code>)</li>
  <li>💡 <strong>Complex XML</strong> — SOAP responses are often deeply nested; pair with JSON Flatten to simplify the structure</li>
  <li>💡 <strong>RSS parsing</strong> — After converting RSS/Atom to JSON, use JSON Path to extract article lists and metadata</li>
</ul>
`
};

/* ── 30. JSON to SQL ────────────────────────────────────────────────────────── */
window.JT_DESCRIPTIONS['to-sql'] = {
zh: `
<h2>什么是 JSON 转 SQL？</h2>
<p>JSON 转 SQL 工具根据 JSON 数组自动生成 SQL <code>INSERT INTO</code> 语句，用于将数据批量导入到关系型数据库（MySQL、PostgreSQL、SQLite 等）。免去手动编写重复 SQL 语句的繁琐工作。</p>

<h2>转换示例</h2>
<p><strong>JSON 输入：</strong></p>
<pre><code class="language-json">[
  { "name": "Alice", "age": 30, "email": "alice@example.com" },
  { "name": "Bob",   "age": 25, "email": "bob@example.com" }
]</code></pre>
<p><strong>SQL 输出：</strong></p>
<pre><code class="language-sql">INSERT INTO users (name, age, email) VALUES ('Alice', 30, 'alice@example.com');
INSERT INTO users (name, age, email) VALUES ('Bob', 25, 'bob@example.com');</code></pre>

<h2>使用技巧</h2>
<ul>
  <li>💡 <strong>设置表名</strong> — 顶部工具栏可自定义表名，默认为 <code>table_name</code></li>
  <li>💡 <strong>字符串自动加引号</strong> — 字符串值自动加单引号，数字和布尔值不加</li>
  <li>💡 <strong>批量插入优化</strong> — 大量数据建议改用 <code>INSERT INTO ... VALUES (...),(...)</code> 批量格式，效率更高</li>
  <li>💡 <strong>防 SQL 注入</strong> — 生成的 SQL 仅供本地数据导入，实际应用中应使用参数化查询</li>
</ul>
`,
en: `
<h2>What is JSON to SQL?</h2>
<p>JSON to SQL generates SQL <code>INSERT INTO</code> statements from a JSON array, ready to bulk-import data into relational databases (MySQL, PostgreSQL, SQLite, etc.). Eliminates the tedium of writing repetitive INSERT statements by hand.</p>

<h2>Conversion Example</h2>
<p><strong>JSON input:</strong></p>
<pre><code class="language-json">[
  { "name": "Alice", "age": 30, "email": "alice@example.com" },
  { "name": "Bob",   "age": 25, "email": "bob@example.com" }
]</code></pre>
<p><strong>SQL output:</strong></p>
<pre><code class="language-sql">INSERT INTO users (name, age, email) VALUES ('Alice', 30, 'alice@example.com');
INSERT INTO users (name, age, email) VALUES ('Bob', 25, 'bob@example.com');</code></pre>

<h2>Pro Tips</h2>
<ul>
  <li>💡 <strong>Set table name</strong> — Customize the table name in the toolbar; defaults to <code>table_name</code></li>
  <li>💡 <strong>Auto quoting</strong> — String values are automatically single-quoted; numbers and booleans are not</li>
  <li>💡 <strong>Batch insert optimization</strong> — For large datasets, consider rewriting to <code>INSERT INTO ... VALUES (...),(...)</code> batch format for better performance</li>
  <li>💡 <strong>SQL injection warning</strong> — Generated SQL is for local data import only; always use parameterized queries in production applications</li>
</ul>
`
};

/* ── 31. SQL to JSON ────────────────────────────────────────────────────────── */
window.JT_DESCRIPTIONS['from-sql'] = {
zh: `
<h2>什么是 SQL 转 JSON？</h2>
<p>SQL 转 JSON 工具将 SQL <code>INSERT INTO</code> 语句或 <code>CREATE TABLE</code> 定义解析为 JSON 格式。适合从数据库导出的 SQL 脚本中提取数据，或将表结构定义转换为 JSON Schema。</p>

<h2>转换示例</h2>
<p><strong>SQL 输入：</strong></p>
<pre><code class="language-sql">INSERT INTO users (name, age, email) VALUES ('Alice', 30, 'alice@example.com');
INSERT INTO users (name, age, email) VALUES ('Bob', 25, 'bob@example.com');</code></pre>
<p><strong>JSON 输出：</strong></p>
<pre><code class="language-json">[
  { "name": "Alice", "age": 30, "email": "alice@example.com" },
  { "name": "Bob",   "age": 25, "email": "bob@example.com" }
]</code></pre>

<h2>使用场景</h2>
<ul>
  <li><strong>数据库迁移</strong> — 将旧数据库导出的 SQL INSERT 语句转为 JSON，导入新系统</li>
  <li><strong>数据分析</strong> — 将 SQL 格式的数据提取为 JSON，用于数据分析工具</li>
  <li><strong>接口调试</strong> — 将数据库数据快速转为 JSON，模拟 API 响应进行测试</li>
</ul>

<h2>使用技巧</h2>
<ul>
  <li>💡 <strong>支持多行 INSERT</strong> — 可粘贴多条 INSERT 语句，批量转为 JSON 数组</li>
  <li>💡 <strong>数据类型推断</strong> — 带引号的值转为字符串，不带引号的数值转为 number</li>
</ul>
`,
en: `
<h2>What is SQL to JSON?</h2>
<p>SQL to JSON parses SQL <code>INSERT INTO</code> statements or <code>CREATE TABLE</code> definitions into JSON format. Useful for extracting data from database export scripts or converting table structure definitions into JSON Schema.</p>

<h2>Conversion Example</h2>
<p><strong>SQL input:</strong></p>
<pre><code class="language-sql">INSERT INTO users (name, age, email) VALUES ('Alice', 30, 'alice@example.com');
INSERT INTO users (name, age, email) VALUES ('Bob', 25, 'bob@example.com');</code></pre>
<p><strong>JSON output:</strong></p>
<pre><code class="language-json">[
  { "name": "Alice", "age": 30, "email": "alice@example.com" },
  { "name": "Bob",   "age": 25, "email": "bob@example.com" }
]</code></pre>

<h2>Use Cases</h2>
<ul>
  <li><strong>Database migration</strong> — Convert SQL INSERT statements from old database exports to JSON for new systems</li>
  <li><strong>Data analysis</strong> — Extract SQL-format data as JSON for data analysis tools</li>
  <li><strong>API mocking</strong> — Quickly convert database data to JSON to simulate API responses for testing</li>
</ul>

<h2>Pro Tips</h2>
<ul>
  <li>💡 <strong>Multiple INSERTs</strong> — Paste multiple INSERT statements; all rows are converted to a single JSON array</li>
  <li>💡 <strong>Type inference</strong> — Quoted values become strings; unquoted numeric values become numbers</li>
</ul>
`
};

/* ── 32. JSON to Markdown ───────────────────────────────────────────────────── */
window.JT_DESCRIPTIONS['to-markdown'] = {
zh: `
<h2>什么是 JSON 转 Markdown？</h2>
<p>JSON 转 Markdown 工具将 JSON 数组转换为 Markdown 格式的表格，可直接在 GitHub README、技术文档、博客文章中使用。Markdown 表格在渲染后呈现为整洁的 HTML 表格，兼具可读性和可复制性。</p>

<h2>转换示例</h2>
<p><strong>JSON 输入：</strong></p>
<pre><code class="language-json">[
  { "name": "Alice", "role": "Admin",  "status": "Active" },
  { "name": "Bob",   "role": "Editor", "status": "Inactive" }
]</code></pre>
<p><strong>Markdown 输出：</strong></p>
<pre><code>| name  | role   | status   |
|-------|--------|----------|
| Alice | Admin  | Active   |
| Bob   | Editor | Inactive |</code></pre>
<p><strong>渲染效果：</strong></p>
<table class="jt-desc-table">
  <thead><tr><th>name</th><th>role</th><th>status</th></tr></thead>
  <tbody>
    <tr><td>Alice</td><td>Admin</td><td>Active</td></tr>
    <tr><td>Bob</td><td>Editor</td><td>Inactive</td></tr>
  </tbody>
</table>

<h2>使用场景</h2>
<ul>
  <li><strong>GitHub README</strong> — 将配置项、API 参数、版本记录转为 Markdown 表格</li>
  <li><strong>技术文档</strong> — 在 Confluence、Notion、飞书文档中使用 Markdown 格式</li>
  <li><strong>变更日志</strong> — 将 JSON 格式的版本信息转为可读的更新日志</li>
</ul>

<h2>使用技巧</h2>
<ul>
  <li>💡 <strong>输入必须为数组</strong> — 根节点必须是 JSON 数组，数组元素为对象</li>
  <li>💡 <strong>嵌套对象</strong> — 嵌套的对象或数组值会序列化为字符串显示在单元格中</li>
  <li>💡 <strong>列宽自动对齐</strong> — 生成的 Markdown 表格按最长值自动对齐，提高源码可读性</li>
</ul>
`,
en: `
<h2>What is JSON to Markdown?</h2>
<p>JSON to Markdown converts a JSON array into a Markdown-formatted table, ready to use directly in GitHub READMEs, technical documentation, or blog posts. Markdown tables render as clean HTML tables while remaining readable and copyable as plain text.</p>

<h2>Conversion Example</h2>
<p><strong>JSON input:</strong></p>
<pre><code class="language-json">[
  { "name": "Alice", "role": "Admin",  "status": "Active" },
  { "name": "Bob",   "role": "Editor", "status": "Inactive" }
]</code></pre>
<p><strong>Markdown output:</strong></p>
<pre><code>| name  | role   | status   |
|-------|--------|----------|
| Alice | Admin  | Active   |
| Bob   | Editor | Inactive |</code></pre>

<h2>Use Cases</h2>
<ul>
  <li><strong>GitHub README</strong> — Convert config options, API parameters, or version history to Markdown tables</li>
  <li><strong>Technical docs</strong> — Use in Confluence, Notion, or other docs platforms that support Markdown</li>
  <li><strong>Changelogs</strong> — Convert JSON-format version info into readable update logs</li>
</ul>

<h2>Pro Tips</h2>
<ul>
  <li>💡 <strong>Input must be an array</strong> — Root element must be a JSON array of objects</li>
  <li>💡 <strong>Nested objects</strong> — Nested objects or array values are serialized as strings within cells</li>
  <li>💡 <strong>Auto-aligned columns</strong> — Generated Markdown tables are padded to the longest value for source readability</li>
</ul>
`
};

/* ── 33. JSON to TypeScript ─────────────────────────────────────────────────── */
window.JT_DESCRIPTIONS['to-typescript'] = {
zh: `
<h2>什么是 JSON 转 TypeScript？</h2>
<p>JSON 转 TypeScript 工具根据 JSON 样本数据自动推断并生成 TypeScript <code>interface</code> 定义。告别手写繁琐的类型定义，粘贴 API 响应 JSON 即可直接获得类型安全的接口声明。</p>

<h2>生成示例</h2>
<p><strong>JSON 输入：</strong></p>
<pre><code class="language-json">{ "name": "Alice", "age": 30, "tags": ["admin"], "address": { "city": "Beijing" } }</code></pre>
<p><strong>TypeScript 输出：</strong></p>
<pre><code class="language-typescript">interface Address {
  city: string;
}

interface Root {
  name: string;
  age: number;
  tags: string[];
  address: Address;
}</code></pre>

<h2>类型推断规则</h2>
<table class="jt-desc-table">
  <thead><tr><th>JSON 值</th><th>TypeScript 类型</th></tr></thead>
  <tbody>
    <tr><td><code>"string"</code></td><td><code>string</code></td></tr>
    <tr><td><code>42</code></td><td><code>number</code></td></tr>
    <tr><td><code>true</code></td><td><code>boolean</code></td></tr>
    <tr><td><code>null</code></td><td><code>null</code></td></tr>
    <tr><td><code>[...]</code></td><td><code>T[]</code></td></tr>
    <tr><td><code>{...}</code></td><td>嵌套 <code>interface</code></td></tr>
  </tbody>
</table>

<h2>使用技巧</h2>
<ul>
  <li>💡 <strong>可选字段</strong> — 若字段可能为 null 或不存在，生成后手动改为 <code>field?: T</code> 或 <code>field: T | null</code></li>
  <li>💡 <strong>配合 Zod</strong> — 生成 interface 后，可配合 Zod 库添加运行时验证</li>
  <li>💡 <strong>泛型</strong> — 生成器不支持泛型推断，复杂类型需手动调整</li>
</ul>
`,
en: `
<h2>What is JSON to TypeScript?</h2>
<p>JSON to TypeScript automatically infers and generates TypeScript <code>interface</code> definitions from sample JSON data. Stop writing type definitions by hand—paste any API response JSON and get type-safe interface declarations instantly.</p>

<h2>Generation Example</h2>
<p><strong>JSON input:</strong></p>
<pre><code class="language-json">{ "name": "Alice", "age": 30, "tags": ["admin"], "address": { "city": "Beijing" } }</code></pre>
<p><strong>TypeScript output:</strong></p>
<pre><code class="language-typescript">interface Address {
  city: string;
}

interface Root {
  name: string;
  age: number;
  tags: string[];
  address: Address;
}</code></pre>

<h2>Type Inference Rules</h2>
<table class="jt-desc-table">
  <thead><tr><th>JSON Value</th><th>TypeScript Type</th></tr></thead>
  <tbody>
    <tr><td><code>"string"</code></td><td><code>string</code></td></tr>
    <tr><td><code>42</code></td><td><code>number</code></td></tr>
    <tr><td><code>true</code></td><td><code>boolean</code></td></tr>
    <tr><td><code>null</code></td><td><code>null</code></td></tr>
    <tr><td><code>[...]</code></td><td><code>T[]</code></td></tr>
    <tr><td><code>{...}</code></td><td>Nested <code>interface</code></td></tr>
  </tbody>
</table>

<h2>Pro Tips</h2>
<ul>
  <li>💡 <strong>Optional fields</strong> — If a field can be absent or null, manually change to <code>field?: T</code> or <code>field: T | null</code></li>
  <li>💡 <strong>Pair with Zod</strong> — After generating interfaces, use Zod for runtime validation</li>
  <li>💡 <strong>Generics</strong> — The generator doesn't infer generics; adjust complex types manually</li>
</ul>
`
};

/* ── 34. JSON to Python ─────────────────────────────────────────────────────── */
window.JT_DESCRIPTIONS['to-python'] = {
zh: `
<h2>什么是 JSON 转 Python？</h2>
<p>JSON 转 Python 工具根据 JSON 数据自动生成 Python <code>dataclass</code> 定义（Python 3.7+）。生成的代码包含完整的类型注解，可直接用于数据建模、API 响应反序列化和类型检查。</p>

<h2>生成示例</h2>
<p><strong>JSON 输入：</strong></p>
<pre><code class="language-json">{ "name": "Alice", "age": 30, "email": "alice@example.com" }</code></pre>
<p><strong>Python 输出：</strong></p>
<pre><code class="language-python">from dataclasses import dataclass
from typing import Optional

@dataclass
class Root:
    name: str
    age: int
    email: str</code></pre>

<h2>使用技巧</h2>
<ul>
  <li>💡 <strong>Pydantic 兼容</strong> — 将 <code>@dataclass</code> 改为继承 <code>BaseModel</code>，即可用于 FastAPI/Pydantic</li>
  <li>💡 <strong>反序列化</strong> — 配合 <code>dacite</code> 库可将字典直接实例化为 dataclass</li>
  <li>💡 <strong>嵌套类</strong> — 嵌套 JSON 对象会生成独立的 dataclass，并在父类中引用</li>
</ul>
`,
en: `
<h2>What is JSON to Python?</h2>
<p>JSON to Python auto-generates Python <code>dataclass</code> definitions (Python 3.7+) from JSON data. The generated code includes full type annotations, ready for data modeling, API response deserialization, and static type checking.</p>

<h2>Generation Example</h2>
<p><strong>JSON input:</strong></p>
<pre><code class="language-json">{ "name": "Alice", "age": 30, "email": "alice@example.com" }</code></pre>
<p><strong>Python output:</strong></p>
<pre><code class="language-python">from dataclasses import dataclass

@dataclass
class Root:
    name: str
    age: int
    email: str</code></pre>

<h2>Pro Tips</h2>
<ul>
  <li>💡 <strong>Pydantic compatible</strong> — Change <code>@dataclass</code> to extend <code>BaseModel</code> for use with FastAPI/Pydantic</li>
  <li>💡 <strong>Deserialization</strong> — Use the <code>dacite</code> library to instantiate dataclasses directly from dictionaries</li>
  <li>💡 <strong>Nested classes</strong> — Nested JSON objects generate separate dataclasses that are referenced in the parent class</li>
</ul>
`
};

/* ── 35. JSON to Java ───────────────────────────────────────────────────────── */
window.JT_DESCRIPTIONS['to-java'] = {
zh: `
<h2>什么是 JSON 转 Java？</h2>
<p>JSON 转 Java 工具根据 JSON 数据自动生成 Java POJO（Plain Old Java Object）类定义，包含字段声明、getter/setter 方法，可直接与 Jackson、Gson 等库配合使用进行 JSON 序列化/反序列化。</p>

<h2>生成示例</h2>
<p><strong>JSON 输入：</strong></p>
<pre><code class="language-json">{ "name": "Alice", "age": 30, "active": true }</code></pre>
<p><strong>Java 输出：</strong></p>
<pre><code class="language-java">public class Root {
    private String name;
    private int age;
    private boolean active;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}</code></pre>

<h2>使用技巧</h2>
<ul>
  <li>💡 <strong>Jackson 注解</strong> — 生成后可手动添加 <code>@JsonProperty</code>、<code>@JsonIgnore</code> 等注解</li>
  <li>💡 <strong>Lombok</strong> — 将 getter/setter 替换为 <code>@Data</code> 注解，代码更简洁</li>
  <li>💡 <strong>Spring Boot</strong> — 生成的 POJO 可直接作为 <code>@RequestBody</code> 或 <code>@ResponseBody</code> 使用</li>
</ul>
`,
en: `
<h2>What is JSON to Java?</h2>
<p>JSON to Java auto-generates Java POJO (Plain Old Java Object) class definitions from JSON data, including field declarations and getter/setter methods, ready for use with Jackson, Gson, or other serialization libraries.</p>

<h2>Generation Example</h2>
<p><strong>JSON input:</strong></p>
<pre><code class="language-json">{ "name": "Alice", "age": 30, "active": true }</code></pre>
<p><strong>Java output:</strong></p>
<pre><code class="language-java">public class Root {
    private String name;
    private int age;
    private boolean active;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    // ... getters and setters
}</code></pre>

<h2>Pro Tips</h2>
<ul>
  <li>💡 <strong>Jackson annotations</strong> — Add <code>@JsonProperty</code>, <code>@JsonIgnore</code> annotations manually after generation</li>
  <li>💡 <strong>Lombok</strong> — Replace getters/setters with <code>@Data</code> annotation for cleaner code</li>
  <li>💡 <strong>Spring Boot</strong> — Generated POJOs work directly as <code>@RequestBody</code> or <code>@ResponseBody</code></li>
</ul>
`
};

/* ── 36. JSON to C# ─────────────────────────────────────────────────────────── */
window.JT_DESCRIPTIONS['to-csharp'] = {
zh: `
<h2>什么是 JSON 转 C#？</h2>
<p>JSON 转 C# 工具根据 JSON 数据自动生成 C# 类定义，包含属性和 <code>[JsonProperty]</code> 注解，可与 Newtonsoft.Json 或 System.Text.Json 配合进行 JSON 反序列化。</p>

<h2>生成示例</h2>
<p><strong>JSON 输入：</strong></p>
<pre><code class="language-json">{ "userName": "Alice", "age": 30, "isActive": true }</code></pre>
<p><strong>C# 输出：</strong></p>
<pre><code class="language-csharp">public class Root
{
    [JsonProperty("userName")]
    public string UserName { get; set; }

    [JsonProperty("age")]
    public int Age { get; set; }

    [JsonProperty("isActive")]
    public bool IsActive { get; set; }
}</code></pre>

<h2>使用技巧</h2>
<ul>
  <li>💡 <strong>记录类型</strong> — C# 9+ 可将 class 改为 <code>record</code>，自动获得不可变性和值相等性</li>
  <li>💡 <strong>Nullable 引用类型</strong> — C# 8+ 建议将可空字符串改为 <code>string?</code></li>
  <li>💡 <strong>System.Text.Json</strong> — 将 <code>[JsonProperty]</code> 替换为 <code>[JsonPropertyName]</code> 以使用 .NET 内置库</li>
</ul>
`,
en: `
<h2>What is JSON to C#?</h2>
<p>JSON to C# auto-generates C# class definitions from JSON data, with properties and <code>[JsonProperty]</code> attributes for use with Newtonsoft.Json or System.Text.Json deserialization.</p>

<h2>Generation Example</h2>
<p><strong>JSON input:</strong></p>
<pre><code class="language-json">{ "userName": "Alice", "age": 30, "isActive": true }</code></pre>
<p><strong>C# output:</strong></p>
<pre><code class="language-csharp">public class Root
{
    [JsonProperty("userName")]
    public string UserName { get; set; }

    [JsonProperty("age")]
    public int Age { get; set; }
}</code></pre>

<h2>Pro Tips</h2>
<ul>
  <li>💡 <strong>Records</strong> — In C# 9+, change <code>class</code> to <code>record</code> for immutability and value equality</li>
  <li>💡 <strong>Nullable references</strong> — In C# 8+, change nullable strings to <code>string?</code></li>
  <li>💡 <strong>System.Text.Json</strong> — Replace <code>[JsonProperty]</code> with <code>[JsonPropertyName]</code> to use the built-in .NET library</li>
</ul>
`
};

/* ── 37. JSON to Go ─────────────────────────────────────────────────────────── */
window.JT_DESCRIPTIONS['to-go'] = {
zh: `
<h2>什么是 JSON 转 Go？</h2>
<p>JSON 转 Go 工具根据 JSON 数据自动生成 Go <code>struct</code> 定义，包含 JSON tag（<code>json:"..."</code>），可与 <code>encoding/json</code> 标准库直接配合使用，无需任何额外依赖。</p>

<h2>生成示例</h2>
<p><strong>JSON 输入：</strong></p>
<pre><code class="language-json">{ "user_name": "Alice", "age": 30, "is_active": true }</code></pre>
<p><strong>Go 输出：</strong></p>
<pre><code class="language-go">type Root struct {
    UserName string &#96;json:"user_name"&#96;
    Age      int    &#96;json:"age"&#96;
    IsActive bool   &#96;json:"is_active"&#96;
}</code></pre>

<h2>使用技巧</h2>
<ul>
  <li>💡 <strong>omitempty</strong> — 可选字段建议加 <code>json:"field,omitempty"</code> tag，序列化时省略零值</li>
  <li>💡 <strong>指针字段</strong> — 可空字段改为指针类型（<code>*string</code>、<code>*int</code>），区分零值与缺失</li>
  <li>💡 <strong>命名转换</strong> — Go 结构体字段自动转为驼峰命名（<code>CamelCase</code>），JSON tag 保留原始键名</li>
</ul>
`,
en: `
<h2>What is JSON to Go?</h2>
<p>JSON to Go auto-generates Go <code>struct</code> definitions from JSON data, including JSON tags (<code>json:"..."</code>), ready for use with Go's standard <code>encoding/json</code> library—no external dependencies required.</p>

<h2>Generation Example</h2>
<p><strong>JSON input:</strong></p>
<pre><code class="language-json">{ "user_name": "Alice", "age": 30, "is_active": true }</code></pre>
<p><strong>Go output:</strong></p>
<pre><code class="language-go">type Root struct {
    UserName string &#96;json:"user_name"&#96;
    Age      int    &#96;json:"age"&#96;
    IsActive bool   &#96;json:"is_active"&#96;
}</code></pre>

<h2>Pro Tips</h2>
<ul>
  <li>💡 <strong>omitempty</strong> — Add <code>json:"field,omitempty"</code> to optional fields to skip zero values during serialization</li>
  <li>💡 <strong>Pointer fields</strong> — Use pointer types (<code>*string</code>, <code>*int</code>) for nullable fields to distinguish zero value from missing</li>
  <li>💡 <strong>Naming</strong> — Struct field names are auto-converted to CamelCase; JSON tags preserve the original key names</li>
</ul>
`
};

/* ── 38. JSON to Kotlin ─────────────────────────────────────────────────────── */
window.JT_DESCRIPTIONS['to-kotlin'] = {
zh: `
<h2>什么是 JSON 转 Kotlin？</h2>
<p>JSON 转 Kotlin 工具根据 JSON 数据自动生成 Kotlin <code>data class</code> 定义，包含 <code>@SerializedName</code> 注解，可与 Gson、Moshi 或 kotlinx.serialization 配合用于 Android 和服务端开发。</p>

<h2>生成示例</h2>
<p><strong>JSON 输入：</strong></p>
<pre><code class="language-json">{ "user_name": "Alice", "age": 30 }</code></pre>
<p><strong>Kotlin 输出：</strong></p>
<pre><code class="language-kotlin">data class Root(
    @SerializedName("user_name") val userName: String,
    @SerializedName("age") val age: Int
)</code></pre>

<h2>使用技巧</h2>
<ul>
  <li>💡 <strong>默认值</strong> — 可选字段建议添加默认值，如 <code>val name: String = ""</code></li>
  <li>💡 <strong>kotlinx.serialization</strong> — 将 <code>@SerializedName</code> 替换为 <code>@SerialName</code> 并添加 <code>@Serializable</code> 注解</li>
  <li>💡 <strong>Nullable 字段</strong> — 可空字段使用 <code>String?</code> 类型</li>
</ul>
`,
en: `
<h2>What is JSON to Kotlin?</h2>
<p>JSON to Kotlin auto-generates Kotlin <code>data class</code> definitions from JSON data, with <code>@SerializedName</code> annotations for use with Gson, Moshi, or kotlinx.serialization in Android and server-side Kotlin development.</p>

<h2>Generation Example</h2>
<p><strong>JSON input:</strong></p>
<pre><code class="language-json">{ "user_name": "Alice", "age": 30 }</code></pre>
<p><strong>Kotlin output:</strong></p>
<pre><code class="language-kotlin">data class Root(
    @SerializedName("user_name") val userName: String,
    @SerializedName("age") val age: Int
)</code></pre>

<h2>Pro Tips</h2>
<ul>
  <li>💡 <strong>Default values</strong> — Add defaults for optional fields, e.g. <code>val name: String = ""</code></li>
  <li>💡 <strong>kotlinx.serialization</strong> — Replace <code>@SerializedName</code> with <code>@SerialName</code> and add <code>@Serializable</code></li>
  <li>💡 <strong>Nullable fields</strong> — Use <code>String?</code> for fields that can be null</li>
</ul>
`
};

/* ── 39. JSON to Swift ──────────────────────────────────────────────────────── */
window.JT_DESCRIPTIONS['to-swift'] = {
zh: `
<h2>什么是 JSON 转 Swift？</h2>
<p>JSON 转 Swift 工具根据 JSON 数据自动生成符合 <code>Codable</code>（<code>Encodable + Decodable</code>）协议的 Swift struct 定义。Codable 是 Swift 4+ 推荐的 JSON 序列化方式，无需第三方库。</p>

<h2>生成示例</h2>
<p><strong>JSON 输入：</strong></p>
<pre><code class="language-json">{ "user_name": "Alice", "age": 30 }</code></pre>
<p><strong>Swift 输出：</strong></p>
<pre><code class="language-swift">struct Root: Codable {
    let userName: String
    let age: Int

    enum CodingKeys: String, CodingKey {
        case userName = "user_name"
        case age
    }
}</code></pre>

<h2>使用技巧</h2>
<ul>
  <li>💡 <strong>可选字段</strong> — 使用 <code>let field: String?</code> 处理可能缺失的字段</li>
  <li>💡 <strong>日期处理</strong> — 日期字段配合 <code>JSONDecoder().dateDecodingStrategy = .iso8601</code> 自动解析</li>
  <li>💡 <strong>class vs struct</strong> — 需要引用语义时改用 <code>class</code>，大多数 JSON 模型用 <code>struct</code> 即可</li>
</ul>
`,
en: `
<h2>What is JSON to Swift?</h2>
<p>JSON to Swift auto-generates Swift structs conforming to the <code>Codable</code> (<code>Encodable + Decodable</code>) protocol from JSON data. Codable is Swift 4+'s recommended JSON serialization approach, requiring no third-party libraries.</p>

<h2>Generation Example</h2>
<p><strong>JSON input:</strong></p>
<pre><code class="language-json">{ "user_name": "Alice", "age": 30 }</code></pre>
<p><strong>Swift output:</strong></p>
<pre><code class="language-swift">struct Root: Codable {
    let userName: String
    let age: Int

    enum CodingKeys: String, CodingKey {
        case userName = "user_name"
        case age
    }
}</code></pre>

<h2>Pro Tips</h2>
<ul>
  <li>💡 <strong>Optional fields</strong> — Use <code>let field: String?</code> for fields that may be absent</li>
  <li>💡 <strong>Date handling</strong> — Configure <code>JSONDecoder().dateDecodingStrategy = .iso8601</code> for automatic date parsing</li>
  <li>💡 <strong>class vs struct</strong> — Use <code>class</code> when reference semantics are needed; <code>struct</code> is recommended for most JSON models</li>
</ul>
`
};

/* ── 40. JSON to Rust ───────────────────────────────────────────────────────── */
window.JT_DESCRIPTIONS['to-rust'] = {
zh: `
<h2>什么是 JSON 转 Rust？</h2>
<p>JSON 转 Rust 工具根据 JSON 数据自动生成 Rust struct 定义，包含 <code>serde</code> 派生宏和 <code>rename</code> 注解，可与 <code>serde_json</code> 库配合进行高性能 JSON 序列化/反序列化。</p>

<h2>生成示例</h2>
<p><strong>JSON 输入：</strong></p>
<pre><code class="language-json">{ "user_name": "Alice", "age": 30 }</code></pre>
<p><strong>Rust 输出：</strong></p>
<pre><code class="language-rust">use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Root {
    #[serde(rename = "user_name")]
    pub user_name: String,
    pub age: i64,
}</code></pre>

<h2>使用技巧</h2>
<ul>
  <li>💡 <strong>可选字段</strong> — 可空字段改为 <code>Option&lt;String&gt;</code>，并添加 <code>#[serde(skip_serializing_if = "Option::is_none")]</code></li>
  <li>💡 <strong>Cargo.toml</strong> — 需要在 <code>Cargo.toml</code> 添加 <code>serde = { version = "1", features = ["derive"] }</code> 和 <code>serde_json = "1"</code></li>
  <li>💡 <strong>整数类型</strong> — 默认生成 <code>i64</code>，根据实际范围选择 <code>u32</code>、<code>i32</code> 等更精确的类型</li>
</ul>
`,
en: `
<h2>What is JSON to Rust?</h2>
<p>JSON to Rust auto-generates Rust struct definitions from JSON data, with serde derive macros and rename attributes, ready for high-performance JSON serialization/deserialization with the <code>serde_json</code> crate.</p>

<h2>Generation Example</h2>
<p><strong>JSON input:</strong></p>
<pre><code class="language-json">{ "user_name": "Alice", "age": 30 }</code></pre>
<p><strong>Rust output:</strong></p>
<pre><code class="language-rust">use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Root {
    #[serde(rename = "user_name")]
    pub user_name: String,
    pub age: i64,
}</code></pre>

<h2>Pro Tips</h2>
<ul>
  <li>💡 <strong>Optional fields</strong> — Change nullable fields to <code>Option&lt;String&gt;</code> and add <code>#[serde(skip_serializing_if = "Option::is_none")]</code></li>
  <li>💡 <strong>Cargo.toml</strong> — Add <code>serde = { version = "1", features = ["derive"] }</code> and <code>serde_json = "1"</code></li>
  <li>💡 <strong>Integer types</strong> — Default is <code>i64</code>; choose <code>u32</code>, <code>i32</code>, etc. based on the actual value range</li>
</ul>
`
};

/* ── 41. JSON to PHP ────────────────────────────────────────────────────────── */
window.JT_DESCRIPTIONS['to-php'] = {
zh: `
<h2>什么是 JSON 转 PHP？</h2>
<p>JSON 转 PHP 工具根据 JSON 数据自动生成 PHP 类定义，包含类型化属性（PHP 8+）和 <code>__construct</code> 方法，可与 <code>json_decode()</code> 配合进行 JSON 反序列化。</p>

<h2>生成示例</h2>
<p><strong>JSON 输入：</strong></p>
<pre><code class="language-json">{ "name": "Alice", "age": 30, "active": true }</code></pre>
<p><strong>PHP 输出：</strong></p>
<pre><code class="language-php">&lt;?php

class Root {
    public string $name;
    public int $age;
    public bool $active;

    public function __construct(string $name, int $age, bool $active) {
        $this->name = $name;
        $this->age = $age;
        $this->active = $active;
    }

    public static function fromJson(string $json): self {
        $data = json_decode($json, true);
        return new self($data['name'], $data['age'], $data['active']);
    }
}</code></pre>

<h2>使用技巧</h2>
<ul>
  <li>💡 <strong>PHP 8 命名参数</strong> — 生成的构造函数可配合 PHP 8 命名参数提高可读性</li>
  <li>💡 <strong>可空属性</strong> — PHP 8 中可空类型写为 <code>?string</code></li>
  <li>💡 <strong>Laravel</strong> — 可将生成的类改为继承 Eloquent Model 或 Laravel Data 对象</li>
</ul>
`,
en: `
<h2>What is JSON to PHP?</h2>
<p>JSON to PHP auto-generates PHP class definitions from JSON data, with typed properties (PHP 8+) and a <code>__construct</code> method, ready for use with <code>json_decode()</code> for JSON deserialization.</p>

<h2>Generation Example</h2>
<p><strong>JSON input:</strong></p>
<pre><code class="language-json">{ "name": "Alice", "age": 30, "active": true }</code></pre>
<p><strong>PHP output:</strong></p>
<pre><code class="language-php">&lt;?php

class Root {
    public string $name;
    public int $age;
    public bool $active;

    public function __construct(string $name, int $age, bool $active) {
        $this->name = $name;
        $this->age = $age;
        $this->active = $active;
    }
}</code></pre>

<h2>Pro Tips</h2>
<ul>
  <li>💡 <strong>PHP 8 named args</strong> — Generated constructors work well with PHP 8 named arguments for readability</li>
  <li>💡 <strong>Nullable properties</strong> — In PHP 8, nullable types are written as <code>?string</code></li>
  <li>💡 <strong>Laravel</strong> — Extend the generated class as an Eloquent Model or Laravel Data object</li>
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

  // ── Insert mid-article ad after the 3rd <h2> ──────────────────────────────
  // Only inject if Google Ads is enabled (AdsClientID is set on window by the template)
  var body = section.querySelector('.jt-desc-body');
  if (!body) return;
  var h2s = body.querySelectorAll('h2');
  var insertAfter = h2s[2] || h2s[h2s.length - 1]; // after 3rd h2, or last one
  if (!insertAfter) return;

  // Find the next sibling element to insert before (skip to after the h2's content block)
  // We want to insert after the <p> / <ul> that follows the h2, not right after the h2 title
  var anchor = insertAfter.nextElementSibling;
  if (anchor && anchor.nextElementSibling) {
    anchor = anchor.nextElementSibling; // skip one more block so ad sits between sections
  }

  var adEl = document.createElement('div');
  adEl.className = 'jt-desc-mid-ad';

  // Check if AdSense client is available (i.e. ads are enabled)
  var adsbygoogle = window.adsbygoogle;
  if (typeof adsbygoogle !== 'undefined' && window.JT_ADS_CLIENT) {
    adEl.innerHTML =
      '<ins class="adsbygoogle"' +
      ' style="display:block;text-align:center"' +
      ' data-ad-client="' + window.JT_ADS_CLIENT + '"' +
      ' data-ad-slot="json-tool-mid-article"' +
      ' data-ad-format="auto"' +
      ' data-full-width-responsive="true"></ins>';
    body.insertBefore(adEl, anchor || null);
    try { (adsbygoogle = window.adsbygoogle || []).push({}); } catch(e) {}
  } else if (!window.JT_ADS_ENABLED && window.JT_ADS_DEV) {
    // Dev placeholder
    adEl.innerHTML =
      '<div style="border:2px dashed #ccc;padding:12px 24px;text-align:center;' +
      'background:#f9f9f9;color:#888;font-size:13px;border-radius:6px;display:inline-block">' +
      '📢 广告位占位 · json-tool-mid-article · 728×90</div>';
    body.insertBefore(adEl, anchor || null);
  }
});

