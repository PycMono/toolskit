window.LEARN_ARTICLES = window.LEARN_ARTICLES || {};
window.LEARN_ARTICLES["common-json-mistakes"] = {
en: `<h2>Top 10 JSON Mistakes</h2><h3>1. Trailing Comma</h3><pre><code>{"a":1,}</code></pre><p>Remove the comma after the last item.</p><h3>2. Single Quotes</h3><pre><code>{'a':'b'}</code></pre><p>JSON requires double quotes.</p><h3>3. Unquoted Keys</h3><pre><code>{a:1}</code></pre><p>Fix: {"a":1}</p><h3>4. Comments</h3><p>JSON has no comment syntax. Use JSONC or JSON5 if needed.</p><h3>5. NaN / Infinity</h3><p>Not valid in JSON. Use null instead.</p><h3>6. undefined</h3><pre><code class="language-javascript">JSON.stringify({a:undefined}) // '{}'</code></pre><h3>7. Unquoted String Values</h3><p>{"status":active} → fix to {"status":"active"}</p><h3>8. Wrong Boolean Casing</h3><p>{"ok":True} → fix to {"ok":true} (lowercase)</p><h3>9. Leading Zeros</h3><p>{"code":007} → fix to {"code":7}</p><h3>10. Duplicate Keys</h3><p>Avoid {"id":1,"id":2} — result is undefined by spec.</p><p>Use <a href="/json/validate">JSON Validator</a> or <a href="/json/repair">JSON Repair</a> to auto-fix.</p>`,
zh: `<h2>10 个最常见 JSON 错误</h2><h3>1. 尾随逗号</h3><pre><code>{"a":1,}</code></pre><p>删除最后一项后的逗号。</p><h3>2. 单引号</h3><p>JSON 需要双引号。</p><h3>3. 键未加引号</h3><pre><code>{a:1}</code></pre><p>修复：{"a":1}</p><h3>4. 注释</h3><p>JSON 不支持注释。如需注释请用 JSONC 或 JSON5。</p><h3>5. NaN / Infinity</h3><p>在 JSON 中无效。改用 null。</p><h3>6. undefined</h3><pre><code class="language-javascript">JSON.stringify({a:undefined}) // '{}'</code></pre><h3>7. 字符串值未加引号</h3><p>{"status":active} → 修复为 {"status":"active"}</p><h3>8. 布尔值大小写错误</h3><p>{"ok":True} → 修复为 {"ok":true}（小写）</p><h3>9. 前导零</h3><p>{"code":007} → 修复为 {"code":7}</p><h3>10. 重复键</h3><p>避免 {"id":1,"id":2}。使用 <a href="/json/validate">JSON 验证器</a>或 <a href="/json/repair">JSON 修复工具</a>。</p>`
};
window.LEARN_ARTICLES["fix-unexpected-end-of-json-input"] = {
en: `<h2>Error: Unexpected End of JSON Input</h2><p>The JSON string ended before the parser finished reading a complete value.</p><h2>Common Causes</h2><h3>1. Empty String</h3><pre><code class="language-javascript">JSON.parse(''); // SyntaxError</code></pre><h3>2. Truncated Network Response</h3><pre><code class="language-javascript">if (res.status !== 204) { const data = await res.json(); }</code></pre><h3>3. Unclosed Brackets</h3><p>{"a":{"b":1} — add missing }</p><h3>4. Corrupted localStorage</h3><pre><code class="language-javascript">function safeGet(key){ try{ return JSON.parse(localStorage.getItem(key)); } catch{ localStorage.removeItem(key); return null; } }</code></pre><h2>Diagnosis Steps</h2><ol><li>Log raw string length and first 100 chars</li><li>Check for empty / undefined</li><li>Paste to <a href="/json/validate">JSON Validator</a></li></ol>`,
zh: `<h2>错误：Unexpected End of JSON Input</h2><p>JSON 字符串在解析器完成读取前就结束了。</p><h2>常见原因</h2><h3>1. 空字符串</h3><pre><code class="language-javascript">JSON.parse(''); // SyntaxError</code></pre><h3>2. 网络响应被截断</h3><pre><code class="language-javascript">if (res.status !== 204) { const data = await res.json(); }</code></pre><h3>3. 括号未闭合</h3><p>{"a":{"b":1} — 补全缺少的 }</p><h3>4. localStorage 损坏</h3><pre><code class="language-javascript">function safeGet(key){ try{ return JSON.parse(localStorage.getItem(key)); } catch{ localStorage.removeItem(key); return null; } }</code></pre><h2>诊断步骤</h2><ol><li>打印原始字符串长度和前 100 个字符</li><li>检查是否为空或 undefined</li><li>粘贴到 <a href="/json/validate">JSON 验证器</a></li></ol>`
};
window.LEARN_ARTICLES["fix-unexpected-token-in-json"] = {
en: `<h2>Error: Unexpected Token in JSON</h2><p>The parser found a character it did not expect.</p><h2>Causes and Fixes</h2><h3>1. HTML Response Instead of JSON</h3><pre><code class="language-javascript">const res = await fetch(url);
if (!res.headers.get('content-type')?.includes('application/json')) {
  throw new Error('Not JSON: ' + await res.text());
}</code></pre><h3>2. UTF-8 BOM</h3><pre><code class="language-javascript">const clean = raw.replace(/^\\uFEFF/, '');
JSON.parse(clean);</code></pre><h3>3. Trailing Comma</h3><p>{"a":1,} is invalid — remove trailing comma.</p><h3>4. Single Quotes</h3><p>{'a':'b'} is invalid — use double quotes.</p><h3>5. Comment in JSON</h3><p>{"a":1 // comment} is invalid — remove comment.</p><h2>Debug Checklist</h2><ul><li>Check Content-Type: application/json header</li><li>Log first 200 chars of response body</li><li>Use <a href="/json/validate">JSON Validator</a> for exact position</li></ul>`,
zh: `<h2>错误：JSON 中的 Unexpected Token</h2><p>解析器发现了意外字符。</p><h2>原因与修复</h2><h3>1. 返回 HTML 而非 JSON</h3><pre><code class="language-javascript">const res = await fetch(url);
if (!res.headers.get('content-type')?.includes('application/json')) {
  throw new Error('Not JSON: ' + await res.text());
}</code></pre><h3>2. UTF-8 BOM</h3><pre><code class="language-javascript">const clean = raw.replace(/^\\uFEFF/, '');
JSON.parse(clean);</code></pre><h3>3. 尾随逗号</h3><p>{"a":1,} 无效——删除尾随逗号。</p><h3>4. 单引号</h3><p>{'a':'b'} 无效——使用双引号。</p><h3>5. JSON 中的注释</h3><p>{"a":1 // 注释} 无效——删除注释。</p><h2>调试清单</h2><ul><li>检查 Content-Type: application/json 头</li><li>打印响应体前 200 字符</li><li>使用 <a href="/json/validate">JSON 验证器</a>定位精确位置</li></ul>`
};
window.LEARN_ARTICLES["json-parse-error"] = {
en: `<h2>JSON Parse Errors by Language</h2><h3>JavaScript</h3><pre><code class="language-javascript">try { JSON.parse(bad); } catch(e) { console.log(e.message); }</code></pre><h3>Python</h3><pre><code class="language-python">try:
    json.loads(bad)
except json.JSONDecodeError as e:
    print(f'Line {e.lineno}: {e.msg}')</code></pre><h3>Go</h3><pre><code class="language-go">if err := json.Unmarshal(data, &v); err != nil { fmt.Println(err) }</code></pre><h2>Common Errors</h2><table style="width:100%;border-collapse:collapse;font-size:14px"><tr style="background:#f1f5f9"><th style="padding:8px;border:1px solid #e2e8f0">Error</th><th style="padding:8px;border:1px solid #e2e8f0">Cause</th></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">Unexpected token &lt;</td><td style="padding:8px;border:1px solid #e2e8f0">Got HTML not JSON</td></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">Unexpected end of input</td><td style="padding:8px;border:1px solid #e2e8f0">Truncated or empty</td></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">Unexpected token ,</td><td style="padding:8px;border:1px solid #e2e8f0">Trailing comma</td></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">Unexpected token '</td><td style="padding:8px;border:1px solid #e2e8f0">Single quotes</td></tr></table><p>Use <a href="/json/validate">JSON Validator</a> to pinpoint the exact error location.</p>`,
zh: `<h2>各语言的 JSON 解析错误</h2><h3>JavaScript</h3><pre><code class="language-javascript">try { JSON.parse(bad); } catch(e) { console.log(e.message); }</code></pre><h3>Python</h3><pre><code class="language-python">try:
    json.loads(bad)
except json.JSONDecodeError as e:
    print(f'第{e.lineno}行: {e.msg}')</code></pre><h2>常见错误</h2><table style="width:100%;border-collapse:collapse;font-size:14px"><tr style="background:#f1f5f9"><th style="padding:8px;border:1px solid #e2e8f0">错误</th><th style="padding:8px;border:1px solid #e2e8f0">原因</th></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">Unexpected token &lt;</td><td style="padding:8px;border:1px solid #e2e8f0">收到 HTML</td></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">Unexpected end</td><td style="padding:8px;border:1px solid #e2e8f0">截断/空响应</td></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">Unexpected token ,</td><td style="padding:8px;border:1px solid #e2e8f0">尾随逗号</td></tr></table><p>使用 <a href="/json/validate">JSON 验证器</a>定位精确错误位置。</p>`
};
window.LEARN_ARTICLES["json-syntax-error"] = {
en: `<h2>Finding and Fixing JSON Syntax Errors</h2><h2>Online Tool</h2><p>Paste your JSON into <a href="/json/validate">JSON Validator</a> — it shows the exact line and column of any error.</p><h2>Command Line</h2><pre><code class="language-bash">python3 -m json.tool data.json
jq '.' data.json</code></pre><h2>Fix Checklist</h2><ul><li>Remove all trailing commas</li><li>Change single quotes to double quotes</li><li>Quote all object keys</li><li>Remove all comments</li><li>Replace NaN / Infinity / undefined with null</li><li>Ensure all brackets are matched: {} []</li><li>Ensure all strings are properly closed</li></ul><h2>CI Validation (GitHub Actions)</h2><pre><code class="language-yaml">- name: Validate JSON files
  run: |
    find . -name '*.json' -not -path '*/node_modules/*' | while read f; do
      python3 -m json.tool "$f" > /dev/null || echo "INVALID: $f"
    done</code></pre>`,
zh: `<h2>查找并修复 JSON 语法错误</h2><h2>在线工具</h2><p>将 JSON 粘贴到 <a href="/json/validate">JSON 验证器</a>——它会显示任何错误的精确行和列。</p><h2>命令行</h2><pre><code class="language-bash">python3 -m json.tool data.json
jq '.' data.json</code></pre><h2>修复清单</h2><ul><li>删除所有尾随逗号</li><li>将单引号改为双引号</li><li>为所有对象键加引号</li><li>删除所有注释</li><li>将 NaN / Infinity / undefined 替换为 null</li><li>确保所有括号匹配：{} []</li><li>确保所有字符串正确闭合</li></ul><h2>CI 验证（GitHub Actions）</h2><pre><code class="language-yaml">- name: 验证 JSON 文件
  run: |
    find . -name '*.json' | while read f; do
      python3 -m json.tool "$f" > /dev/null || echo "无效: $f"
    done</code></pre>`
};
window.LEARN_ARTICLES["json-encoding-issues"] = {
en: `<h2>JSON Encoding: UTF-8, BOM and Special Characters</h2><h2>RFC 8259: UTF-8 is Mandatory</h2><p>All JSON transmitted over networks must use UTF-8 encoding. Other encodings (UTF-16, UTF-32) cause interoperability issues.</p><h2>BOM Issues</h2><pre><code class="language-javascript">// Strip BOM before parsing
const clean = text.replace(/^\\uFEFF/, '');
JSON.parse(clean);</code></pre><pre><code class="language-python"># Python: use utf-8-sig to strip BOM automatically
with open('data.json', 'r', encoding='utf-8-sig') as f:
    data = json.load(f)</code></pre><h2>Chinese / CJK Characters</h2><pre><code class="language-python">import json
# ensure_ascii=False keeps Chinese readable
json.dumps({"name": "张三"}, ensure_ascii=False)
# '{"name": "张三"}'</code></pre><h2>Escape Reference</h2><table style="width:100%;border-collapse:collapse;font-size:14px"><tr style="background:#f1f5f9"><th style="padding:8px;border:1px solid #e2e8f0">Character</th><th style="padding:8px;border:1px solid #e2e8f0">Escape Sequence</th></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">Double quote</td><td style="padding:8px;border:1px solid #e2e8f0">\\"</td></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">Backslash</td><td style="padding:8px;border:1px solid #e2e8f0">\\\\</td></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">Newline</td><td style="padding:8px;border:1px solid #e2e8f0">\\n</td></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">Tab</td><td style="padding:8px;border:1px solid #e2e8f0">\\t</td></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">Unicode</td><td style="padding:8px;border:1px solid #e2e8f0">\\uXXXX</td></tr></table><p>Use <a href="/json/escape">JSON Escape tool</a> for safe encoding.</p>`,
zh: `<h2>JSON 编码：UTF-8、BOM 与特殊字符</h2><h2>RFC 8259：强制使用 UTF-8</h2><p>通过网络传输的所有 JSON 必须使用 UTF-8 编码。其他编码会导致互操作性问题。</p><h2>BOM 问题</h2><pre><code class="language-javascript">// 解析前去除 BOM
const clean = text.replace(/^\\uFEFF/, '');
JSON.parse(clean);</code></pre><pre><code class="language-python"># Python：使用 utf-8-sig 自动去除 BOM
with open('data.json', 'r', encoding='utf-8-sig') as f:
    data = json.load(f)</code></pre><h2>中文/CJK 字符</h2><pre><code class="language-python">import json
# ensure_ascii=False 保留中文字符可读性
json.dumps({"name": "张三"}, ensure_ascii=False)
# '{"name": "张三"}'</code></pre><h2>转义参考</h2><table style="width:100%;border-collapse:collapse;font-size:14px"><tr style="background:#f1f5f9"><th style="padding:8px;border:1px solid #e2e8f0">字符</th><th style="padding:8px;border:1px solid #e2e8f0">转义序列</th></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">双引号</td><td style="padding:8px;border:1px solid #e2e8f0">\\"</td></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">反斜杠</td><td style="padding:8px;border:1px solid #e2e8f0">\\\\</td></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">换行符</td><td style="padding:8px;border:1px solid #e2e8f0">\\n</td></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">制表符</td><td style="padding:8px;border:1px solid #e2e8f0">\\t</td></tr><tr><td style="padding:8px;border:1px solid #e2e8f0">Unicode</td><td style="padding:8px;border:1px solid #e2e8f0">\\uXXXX</td></tr></table><p>使用 <a href="/json/escape">JSON 转义工具</a>安全编码。</p>`
};
