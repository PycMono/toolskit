/* JSON Learn Articles: debugging */
window.LEARN_ARTICLES = window.LEARN_ARTICLES || {};

window.LEARN_ARTICLES["common-json-mistakes"] = {
zh: `<h1>20 个最常见的 JSON 语法错误及修复</h1>
<h2>一、引号错误</h2>
<h3>错误 1：使用单引号</h3>
<pre><code class="language-json">// ❌ {&#39;name&#39;: &#39;Alice&#39;}
// ✅ {&#34;name&#34;: &#34;Alice&#34;}</code></pre>
<h3>错误 2：键名无引号</h3>
<pre><code class="language-json">// ❌ {name: &#34;Alice&#34;}
// ✅ {&#34;name&#34;: &#34;Alice&#34;}</code></pre>
<h2>二、逗号错误</h2>
<h3>错误 3：尾随逗号</h3>
<pre><code class="language-json">// ❌ {&#34;name&#34;: &#34;Alice&#34;, &#34;age&#34;: 25,}
// ✅ {&#34;name&#34;: &#34;Alice&#34;, &#34;age&#34;: 25}</code></pre>
<h3>错误 4：缺少逗号</h3>
<pre><code class="language-json">// ❌ {&#34;name&#34;: &#34;Alice&#34; &#34;age&#34;: 25}
// ✅ {&#34;name&#34;: &#34;Alice&#34;, &#34;age&#34;: 25}</code></pre>
<h3>错误 5：数组尾随逗号</h3>
<pre><code class="language-json">// ❌ [1, 2, 3,]
// ✅ [1, 2, 3]</code></pre>
<h2>三、值类型错误</h2>
<h3>错误 6：布尔值大写</h3>
<pre><code class="language-json">// ❌ {&#34;active&#34;: True}  ← Python 风格
// ✅ {&#34;active&#34;: true}</code></pre>
<h3>错误 7：None 代替 null</h3>
<pre><code class="language-json">// ❌ {&#34;value&#34;: None}
// ✅ {&#34;value&#34;: null}</code></pre>
<h3>错误 8：undefined</h3>
<pre><code class="language-json">// ❌ {&#34;value&#34;: undefined}
// ✅ {&#34;value&#34;: null}</code></pre>
<h3>错误 9：NaN / Infinity</h3>
<pre><code class="language-json">// ❌ {&#34;ratio&#34;: NaN, &#34;max&#34;: Infinity}
// ✅ {&#34;ratio&#34;: null, &#34;max&#34;: 1.7976931348623157e+308}</code></pre>
<h2>四、字符串错误</h2>
<h3>错误 10：未转义换行</h3>
<pre><code class="language-json">// ❌ {&#34;text&#34;: &#34;line 1
line 2&#34;}
// ✅ {&#34;text&#34;: &#34;line 1\\nline 2&#34;}</code></pre>
<h3>错误 11：未转义反斜杠</h3>
<pre><code class="language-json">// ❌ {&#34;path&#34;: &#34;C:\\Users\\admin&#34;}  ← 实际文件中是单反斜杠
// ✅ {&#34;path&#34;: &#34;C:\\\\Users\\\\admin&#34;}</code></pre>
<h3>错误 12：未转义双引号</h3>
<pre><code class="language-json">// ❌ {&#34;quote&#34;: &#34;He said &#34;hello&#34;&#34;}
// ✅ {&#34;quote&#34;: &#34;He said \\&#34;hello\\&#34;&#34;}</code></pre>
<h2>五、数值错误</h2>
<h3>错误 13：前导零</h3>
<pre><code class="language-json">// ❌ {&#34;code&#34;: 007}
// ✅ {&#34;code&#34;: 7} 或 {&#34;code&#34;: &#34;007&#34;}</code></pre>
<h3>错误 14：十六进制</h3>
<pre><code class="language-json">// ❌ {&#34;color&#34;: 0xFF0000}
// ✅ {&#34;color&#34;: &#34;#FF0000&#34;}</code></pre>
<h2>六、结构错误</h2>
<h3>错误 15：注释</h3>
<pre><code class="language-json">// ❌ { /* 注释 */ &#34;name&#34;: &#34;Alice&#34; }
// ✅ {&#34;_comment&#34;: &#34;说明&#34;, &#34;name&#34;: &#34;Alice&#34;}</code></pre>
<h3>错误 16：括号不匹配</h3>
<pre><code class="language-json">// ❌ {&#34;hobbies&#34;: [&#34;reading&#34;, &#34;coding&#34;}
// ✅ {&#34;hobbies&#34;: [&#34;reading&#34;, &#34;coding&#34;]}</code></pre>
<h3>错误 17-20：其他常见问题</h3>
<ul>
<li>重复键名（建议唯一）</li>
<li>正号 <code>+3</code>（不合法）</li>
<li>小数点开头 <code>.5</code>（应为 <code>0.5</code>）</li>
<li>多余的外层包裹</li>
</ul>
<h2>快速排查命令</h2>
<pre><code class="language-bash">python3 -m json.tool file.json       # 验证
jq &#39;.&#39; file.json                     # 格式化验证
node -e &#34;JSON.parse(require(&#39;fs&#39;).readFileSync(&#39;f.json&#39;))&#34;  # Node 验证</code></pre>
<h2>小结</h2>
<p>大多数 JSON 错误归为：引号问题、逗号问题、值类型大小写、转义遗漏、数值格式。使用验证工具能快速定位错误。</p>
`,
en: `<h1>20 Common JSON Syntax Errors and How to Fix Them</h1>
<h2>1. Quote Errors</h2>
<h3>Error 1: Using Single Quotes</h3>
<pre><code class="language-json">// ❌ {&#39;name&#39;: &#39;Alice&#39;}
// ✅ {&#34;name&#34;: &#34;Alice&#34;}</code></pre>
<h3>Error 2: Missing Quotes around Key</h3>
<pre><code class="language-json">// ❌ {name: &#34;Alice&#34;}
// ✅ {&#34;name&#34;: &#34;Alice&#34;}</code></pre>
<h2>2. Comma Errors</h2>
<h3>Error 3: Trailing Comma</h3>
<pre><code class="language-json">// ❌ {&#34;name&#34;: &#34;Alice&#34;, &#34;age&#34;: 25,}
// ✅ {&#34;name&#34;: &#34;Alice&#34;, &#34;age&#34;: 25}</code></pre>
<h3>Error 4: Missing Comma</h3>
<pre><code class="language-json">// ❌ {&#34;name&#34;: &#34;Alice&#34; &#34;age&#34;: 25}
// ✅ {&#34;name&#34;: &#34;Alice&#34;, &#34;age&#34;: 25}</code></pre>
<h3>Error 5: Trailing Comma in Array</h3>
<pre><code class="language-json">// ❌ [1, 2, 3,]
// ✅ [1, 2, 3]</code></pre>
<h2>3. Value Type Errors</h2>
<h3>Error 6: Boolean Value Capitalized</h3>
<pre><code class="language-json">// ❌ {&#34;active&#34;: True}  ← Python style
// ✅ {&#34;active&#34;: true}</code></pre>
<h3>Error 7: None Instead of Null</h3>
<pre><code class="language-json">// ❌ {&#34;value&#34;: None}
// ✅ {&#34;value&#34;: null}</code></pre>
<h3>Error 8: Undefined</h3>
<pre><code class="language-json">// ❌ {&#34;value&#34;: undefined}
// ✅ {&#34;value&#34;: null}</code></pre>
<h3>Error 9: NaN / Infinity</h3>
<pre><code class="language-json">// ❌ {&#34;ratio&#34;: NaN, &#34;max&#34;: Infinity}
// ✅ {&#34;ratio&#34;: null, &#34;max&#34;: 1.7976931348623157e+308}</code></pre>
<h2>4. String Errors</h2>
<h3>Error 10: Unescaped Newline</h3>
<pre><code class="language-json">// ❌ {&#34;text&#34;: &#34;line 1
line 2&#34;}
// ✅ {&#34;text&#34;: &#34;line 1\\nline 2&#34;}</code></pre>
<h3>Error 11: Unescaped Backslash</h3>
<pre><code class="language-json">// ❌ {&#34;path&#34;: &#34;C:\\Users\\admin&#34;}  ← Actual files use single backslashes
// ✅ {&#34;path&#34;: &#34;C:\\\\Users\\\\admin&#34;}</code></pre>
<h3>Error 12: Unescaped Double Quote</h3>
<pre><code class="language-json">// ❌ {&#34;quote&#34;: &#34;He said &#34;hello&#34;&#34;}
// ✅ {&#34;quote&#34;: &#34;He said \\&#34;hello\\&#34;&#34;}</code></pre>
<h2>5. Number Errors</h2>
<h3>Error 13: Leading Zero</h3>
<pre><code class="language-json">// ❌ {&#34;code&#34;: 007}
// ✅ {&#34;code&#34;: 7} 或 {&#34;code&#34;: &#34;007&#34;}</code></pre>
<h3>Error 14: Hexadecimal</h3>
<pre><code class="language-json">// ❌ {&#34;color&#34;: 0xFF0000}
// ✅ {&#34;color&#34;: &#34;#FF0000&#34;}</code></pre>
<h2>6. Structural Errors</h2>
<h3>Error 15: Comments</h3>
<pre><code class="language-json">// ❌ { /* 注释 */ &#34;name&#34;: &#34;Alice&#34; }
// ✅ {&#34;_comment&#34;: &#34;说明&#34;, &#34;name&#34;: &#34;Alice&#34;}</code></pre>
<h3>Error 16: Mismatched Brackets</h3>
<pre><code class="language-json">// ❌ {&#34;hobbies&#34;: [&#34;reading&#34;, &#34;coding&#34;}
// ✅ {&#34;hobbies&#34;: [&#34;reading&#34;, &#34;coding&#34;]}</code></pre>
<h3>Error 17-20: Other Common Issues</h3>
<ul>
<li>Duplicate keys (should be unique)</li>
<li>Positive sign <code>+3</code> (invalid)</li>
<li>Decimal point at the start <code>.5</code> (should be <code>0.5</code>)</li>
<li>Extra outer wrapping</li>
</ul>
<h2>Quick Check Commands</h2>
<pre><code class="language-bash">python3 -m json.tool file.json       # Validate
jq &#39;.&#39; file.json                     # Format and validate
node -e &#34;JSON.parse(require(&#39;fs&#39;).readFileSync(&#39;f.json&#39;))&#34;  # Node validation</code></pre>
<h2>Summary</h2>
<p>Most JSON errors are due to: quote issues, comma issues, value type casing, escaping omissions, and numeric formats. Validation tools can quickly locate errors.</p>
`,
en: `<h1>20 Common JSON Syntax Errors and How to Fix Them</h1>
<h2>1. Quote Errors</h2>
<h3>Error 1: Using Single Quotes</h3>
<pre><code class="language-json">// ❌ {&#39;name&#39;: &#39;Alice&#39;}
// ✅ {&#34;name&#34;: &#34;Alice&#34;}</code></pre>
<h3>Error 2: Missing Quotes around Key</h3>
<pre><code class="language-json">// ❌ {name: &#34;Alice&#34;}
// ✅ {&#34;name&#34;: &#34;Alice&#34;}</code></pre>
<h2>2. Comma Errors</h2>
<h3>Error 3: Trailing Comma</h3>
<pre><code class="language-json">// ❌ {&#34;name&#34;: &#34;Alice&#34;, &#34;age&#34;: 25,}
// ✅ {&#34;name&#34;: &#34;Alice&#34;, &#34;age&#34;: 25}</code></pre>
<h3>Error 4: Missing Comma</h3>
<pre><code class="language-json">// ❌ {&#34;name&#34;: &#34;Alice&#34; &#34;age&#34;: 25}
// ✅ {&#34;name&#34;: &#34;Alice&#34;, &#34;age&#34;: 25}</code></pre>
<h3>Error 5: Trailing Comma in Array</h3>
<pre><code class="language-json">// ❌ [1, 2, 3,]
// ✅ [1, 2, 3]</code></pre>
<h2>3. Value Type Errors</h2>
<h3>Error 6: Boolean Value Capitalized</h3>
<pre><code class="language-json">// ❌ {&#34;active&#34;: True}  ← Python style
// ✅ {&#34;active&#34;: true}</code></pre>
<h3>Error 7: None Instead of Null</h3>
<pre><code class="language-json">// ❌ {&#34;value&#34;: None}
// ✅ {&#34;value&#34;: null}</code></pre>
<h3>Error 8: Undefined</h3>
<pre><code class="language-json">// ❌ {&#34;value&#34;: undefined}
// ✅ {&#34;value&#34;: null}</code></pre>
<h3>Error 9: NaN / Infinity</h3>
<pre><code class="language-json">// ❌ {&#34;ratio&#34;: NaN, &#34;max&#34;: Infinity}
// ✅ {&#34;ratio&#34;: null, &#34;max&#34;: 1.7976931348623157e+308}</code></pre>
<h2>4. String Errors</h2>
<h3>Error 10: Unescaped Newline</h3>
<pre><code class="language-json">// ❌ {&#34;text&#34;: &#34;line 1
line 2&#34;}
// ✅ {&#34;text&#34;: &#34;line 1\\nline 2&#34;}</code></pre>
<h3>Error 11: Unescaped Backslash</h3>
<pre><code class="language-json">// ❌ {&#34;path&#34;: &#34;C:\\Users\\admin&#34;}  ← Actual files use single backslashes
// ✅ {&#34;path&#34;: &#34;C:\\\\Users\\\\admin&#34;}</code></pre>
<h3>Error 12: Unescaped Double Quote</h3>
<pre><code class="language-json">// ❌ {&#34;quote&#34;: &#34;He said &#34;hello&#34;&#34;}
// ✅ {&#34;quote&#34;: &#34;He said \\&#34;hello\\&#34;&#34;}</code></pre>
<h2>5. Number Errors</h2>
<h3>Error 13: Leading Zero</h3>
<pre><code class="language-json">// ❌ {&#34;code&#34;: 007}
// ✅ {&#34;code&#34;: 7} 或 {&#34;code&#34;: &#34;007&#34;}</code></pre>
<h3>Error 14: Hexadecimal</h3>
<pre><code class="language-json">// ❌ {&#34;color&#34;: 0xFF0000}
// ✅ {&#34;color&#34;: &#34;#FF0000&#34;}</code></pre>
<h2>6. Structural Errors</h2>
<h3>Error 15: Comments</h3>
<pre><code class="language-json">// ❌ { /* 注释 */ &#34;name&#34;: &#34;Alice&#34; }
// ✅ {&#34;_comment&#34;: &#34;说明&#34;, &#34;name&#34;: &#34;Alice&#34;}</code></pre>
<h3>Error 16: Mismatched Brackets</h3>
<pre><code class="language-json">// ❌ {&#34;hobbies&#34;: [&#34;reading&#34;, &#34;coding&#34;}
// ✅ {&#34;hobbies&#34;: [&#34;reading&#34;, &#34;coding&#34;]}</code></pre>
<h3>Error 17-20: Other Common Issues</h3>
<ul>
<li>Duplicate keys (should be unique)</li>
<li>Positive sign <code>+3</code> (invalid)</li>
<li>Decimal point at the start <code>.5</code> (should be <code>0.5</code>)</li>
<li>Extra outer wrapping</li>
</ul>
<h2>Quick Check Commands</h2>
<pre><code class="language-bash">python3 -m json.tool file.json       # Validate
jq &#39;.&#39; file.json                     # Format and validate
node -e &#34;JSON.parse(require(&#39;fs&#39;).readFileSync(&#39;f.json&#39;))&#34;  # Node validation</code></pre>
<h2>Summary</h2>
<p>Most JSON errors are due to: quote issues, comma issues, value type casing, escaping omissions, and numeric formats. Validation tools can quickly locate errors.</p>
`,
en: `<h1>20 Common JSON Syntax Errors and How to Fix Them</h1>
<h2>1. Quote Errors</h2>
<h3>Error 1: Using Single Quotes</h3>
<pre><code class="language-json">// ❌ {&#39;name&#39;: &#39;Alice&#39;}
// ✅ {&#34;name&#34;: &#34;Alice&#34;}</code></pre>
<h3>Error 2: Missing Quotes around Key</h3>
<pre><code class="language-json">// ❌ {name: &#34;Alice&#34;}
// ✅ {&#34;name&#34;: &#34;Alice&#34;}</code></pre>
<h2>2. Comma Errors</h2>
<h3>Error 3: Trailing Comma</h3>
<pre><code class="language-json">// ❌ {&#34;name&#34;: &#34;Alice&#34;, &#34;age&#34;: 25,}
// ✅ {&#34;name&#34;: &#34;Alice&#34;, &#34;age&#34;: 25}</code></pre>
<h3>Error 4: Missing Comma</h3>
<pre><code class="language-json">// ❌ {&#34;name&#34;: &#34;Alice&#34; &#34;age&#34;: 25}
// ✅ {&#34;name&#34;: &#34;Alice&#34;, &#34;age&#34;: 25}</code></pre>
<h3>Error 5: Trailing Comma in Array</h3>
<pre><code class="language-json">// ❌ [1, 2, 3,]
// ✅ [1, 2, 3]</code></pre>
<h2>3. Value Type Errors</h2>
<h3>Error 6: Boolean Value Capitalized</h3>
<pre><code class="language-json">// ❌ {&#34;active&#34;: True}  ← Python style
// ✅ {&#34;active&#34;: true}</code></pre>
<h3>Error 7: None Instead of Null</h3>
<pre><code class="language-json">// ❌ {&#34;value&#34;: None}
// ✅ {&#34;value&#34;: null}</code></pre>
<h3>Error 8: Undefined</h3>
<pre><code class="language-json">// ❌ {&#34;value&#34;: undefined}
// ✅ {&#34;value&#34;: null}</code></pre>
<h3>Error 9: NaN / Infinity</h3>
<pre><code class="language-json">// ❌ {&#34;ratio&#34;: NaN, &#34;max&#34;: Infinity}
// ✅ {&#34;ratio&#34;: null, &#34;max&#34;: 1.7976931348623157e+308}</code></pre>
<h2>4. String Errors</h2>
<h3>Error 10: Unescaped Newline</h3>
<pre><code class="language-json">// ❌ {&#34;text&#34;: &#34;line 1
line 2&#34;}
// ✅ {&#34;text&#34;: &#34;line 1\\nline 2&#34;}</code></pre>
<h3>Error 11: Unescaped Backslash</h3>
<pre><code class="language-json">// ❌ {&#34;path&#34;: &#34;C:\\Users\\admin&#34;}  ← Actual files use single backslashes
// ✅ {&#34;path&#34;: &#34;C:\\\\Users\\\\admin&#34;}</code></pre>
<h3>Error 12: Unescaped Double Quote</h3>
<pre><code class="language-json">// ❌ {&#34;quote&#34;: &#34;He said &#34;hello&#34;&#34;}
// ✅ {&#34;quote&#34;: &#34;He said \\&#34;hello\\&#34;&#34;}</code></pre>
<h2>5. Number Errors</h2>
<h3>Error 13: Leading Zero</h3>
<pre><code class="language-json">// ❌ {&#34;code&#34;: 007}
// ✅ {&#34;code&#34;: 7} 或 {&#34;code&#34;: &#34;007&#34;}</code></pre>
<h3>Error 14: Hexadecimal</h3>
<pre><code class="language-json">// ❌ {&#34;color&#34;: 0xFF0000}
// ✅ {&#34;color&#34;: &#34;#FF0000&#34;}</code></pre>
<h2>6. Structural Errors</h2>
<h3>Error 15: Comments</h3>
<pre><code class="language-json">// ❌ { /* 注释 */ &#34;name&#34;: &#34;Alice&#34; }
// ✅ {&#34;_comment&#34;: &#34;说明&#34;, &#34;name&#34;: &#34;Alice&#34;}</code></pre>
<h3>Error 16: Mismatched Brackets</h3>
<pre><code class="language-json">// ❌ {&#34;hobbies&#34;: [&#34;reading&#34;, &#34;coding&#34;}
// ✅ {&#34;hobbies&#34;: [&#34;reading&#34;, &#34;coding&#34;]}</code></pre>
<h3>Error 17-20: Other Common Issues</h3>
<ul>
<li>Duplicate keys (should be unique)</li>
<li>Positive sign <code>+3</code> (invalid)</li>
<li>Decimal point at the start <code>.5</code> (should be <code>0.5</code>)</li>
<li>Extra outer wrapping</li>
</ul>
<h2>Quick Check Commands</h2>
<pre><code class="language-bash">python3 -m json.tool file.json       # Validate
jq &#39;.&#39; file.json                     # Format and validate
node -e &#34;JSON.parse(require(&#39;fs&#39;).readFileSync(&#39;f.json&#39;))&#34;  # Node validation</code></pre>
<h2>Summary</h2>
<p>Most JSON errors are due to: quote issues, comma issues, value type casing, escaping omissions, and numeric formats. Validation tools can quickly locate errors.</p>
`
};

window.LEARN_ARTICLES["json-parse-errors"] = {
zh: `<h1>JSON 解析错误排查完全指南</h1>
<h2>各语言解析错误处理</h2>
<h3>JavaScript</h3>
<pre><code class="language-javascript">try {
  const data = JSON.parse(badJson);
} catch (e) {
  console.error('Parse error:', e.message);
  // SyntaxError: Unexpected token , in JSON at position 15
}</code></pre>
<h3>Python</h3>
<pre><code class="language-python">import json

try:
    data = json.loads(bad_json)
except json.JSONDecodeError as e:
    print(f"第 {e.lineno} 行第 {e.colno} 列: {e.msg}")
    # 第 3 行第 8 列: Expecting ',' delimiter</code></pre>
<h3>Go</h3>
<pre><code class="language-go">var v interface{}
if err := json.Unmarshal(data, &v); err != nil {
    var syntaxErr *json.SyntaxError
    if errors.As(err, &syntaxErr) {
        fmt.Printf("位置 %d: %v\\n", syntaxErr.Offset, err)
    }
}</code></pre>
<h2>常见解析错误速查</h2>
<table>
<thead><tr><th>错误信息</th><th>原因</th><th>修复</th></tr></thead>
<tbody>
<tr><td>Unexpected token &lt;</td><td>服务器返回 HTML 而非 JSON</td><td>检查 Content-Type 和接口地址</td></tr>
<tr><td>Unexpected end of input</td><td>JSON 被截断或为空</td><td>检查网络响应和空响应处理</td></tr>
<tr><td>Unexpected token ,</td><td>尾随逗号</td><td>删除最后一个元素后的逗号</td></tr>
<tr><td>Unexpected token '</td><td>单引号字符串</td><td>改为双引号</td></tr>
<tr><td>Unexpected token .</td><td>.5 这样的数值</td><td>改为 0.5</td></tr>
<tr><td>Property must be a string</td><td>键名无引号</td><td>给键名加双引号</td></tr>
</tbody>
</table>
<h2>系统性排查流程</h2>
<ol>
<li><strong>检查原始字符串</strong>：打印长度和前 200 个字符</li>
<li><strong>检查 HTTP 响应</strong>：确认 Content-Type: application/json</li>
<li><strong>在线验证</strong>：粘贴到 <a href="/json/validate">JSON 验证器</a></li>
<li><strong>逐步缩小范围</strong>：二分法找到有问题的行</li>
<li><strong>检查编码</strong>：确认 UTF-8，无 BOM</li>
</ol>
<h2>网络请求中的常见模式</h2>
<pre><code class="language-javascript">async function fetchJSON(url) {
  const res = await fetch(url);
  
  // 检查 HTTP 状态
  if (!res.ok) {
    throw new Error(\`HTTP \${res.status}\`);
  }
  
  // 检查 Content-Type
  const ct = res.headers.get('content-type');
  if (!ct?.includes('application/json')) {
    const text = await res.text();
    throw new Error(\`Not JSON. Got: \${text.slice(0, 100)}\`);
  }
  
  return res.json();
}</code></pre>
<h2>小结</h2>
<ul>
<li>始终 try-catch JSON.parse() 调用</li>
<li>检查 HTTP Content-Type 头</li>
<li>处理空响应（204 No Content）</li>
<li>使用验证工具定位精确错误位置</li>
</ul>
`,
en: `<h1>Complete Guide to Debugging JSON Parse Errors</h1>
<h2>Error Handling by Language</h2>
<h3>JavaScript</h3>
<pre><code class="language-javascript">try {
  const data = JSON.parse(badJson);
} catch (e) {
  console.error('Parse error:', e.message);
  // SyntaxError: Unexpected token , in JSON at position 15
}</code></pre>
<h3>Python</h3>
<pre><code class="language-python">import json

try:
    data = json.loads(bad_json)
except json.JSONDecodeError as e:
    print(f"Line {e.lineno}, Col {e.colno}: {e.msg}")
    # Line 3, Col 8: Expecting ',' delimiter</code></pre>
<h3>Go</h3>
<pre><code class="language-go">var v interface{}
if err := json.Unmarshal(data, &v); err != nil {
    var syntaxErr *json.SyntaxError
    if errors.As(err, &syntaxErr) {
        fmt.Printf("Offset %d: %v\\n", syntaxErr.Offset, err)
    }
}</code></pre>
<h2>Common Parse Error Reference</h2>
<table>
<thead><tr><th>Error Message</th><th>Cause</th><th>Fix</th></tr></thead>
<tbody>
<tr><td>Unexpected token &lt;</td><td>Server returned HTML instead of JSON</td><td>Check Content-Type and URL</td></tr>
<tr><td>Unexpected end of input</td><td>Truncated or empty response</td><td>Handle empty responses, check network</td></tr>
<tr><td>Unexpected token ,</td><td>Trailing comma</td><td>Remove comma after last element</td></tr>
<tr><td>Unexpected token '</td><td>Single-quoted string</td><td>Use double quotes</td></tr>
<tr><td>Unexpected token .</td><td>Number like .5</td><td>Change to 0.5</td></tr>
<tr><td>Property must be a string</td><td>Unquoted key</td><td>Add double quotes around key</td></tr>
</tbody>
</table>
<h2>Systematic Debugging Process</h2>
<ol>
<li><strong>Check raw string</strong>: log length and first 200 characters</li>
<li><strong>Check HTTP response</strong>: confirm Content-Type: application/json</li>
<li><strong>Online validator</strong>: paste to <a href="/json/validate">JSON Validator</a></li>
<li><strong>Binary search</strong>: narrow down to the problematic line</li>
<li><strong>Check encoding</strong>: confirm UTF-8, no BOM</li>
</ol>
<h2>Robust Fetch Pattern</h2>
<pre><code class="language-javascript">async function fetchJSON(url) {
  const res = await fetch(url);
  
  if (!res.ok) {
    throw new Error(\`HTTP \${res.status}\`);
  }
  
  const ct = res.headers.get('content-type');
  if (!ct?.includes('application/json')) {
    const text = await res.text();
    throw new Error(\`Not JSON. Got: \${text.slice(0, 100)}\`);
  }
  
  return res.json();
}</code></pre>
<h2>Summary</h2>
<ul>
<li>Always wrap JSON.parse() in try-catch</li>
<li>Check HTTP Content-Type header</li>
<li>Handle empty responses (204 No Content)</li>
<li>Use validators to pinpoint exact error locations</li>
</ul>
`
};

window.LEARN_ARTICLES["unexpected-token"] = {
zh: `<h1>修复 JSON Unexpected Token 错误</h1>
<h2>错误含义</h2>
<p><code>SyntaxError: Unexpected token X in JSON at position N</code> 意味着解析器在不该出现字符 X 的位置遇到了它。</p>
<h2>最常见原因与修复</h2>
<h3>原因 1：服务器返回 HTML 错误页面</h3>
<p>这是最常见的原因——Unexpected token &lt;</p>
<pre><code class="language-javascript">const res = await fetch('/api/data');
const ct = res.headers.get('content-type');
if (!ct?.includes('application/json')) {
  throw new Error('服务器返回了非 JSON 响应: ' + await res.text());
}</code></pre>
<h3>原因 2：UTF-8 BOM 标记</h3>
<pre><code class="language-javascript">// 在解析前去除 BOM
const clean = rawText.replace(/^\\uFEFF/, '');
JSON.parse(clean);</code></pre>
<pre><code class="language-python"># Python：使用 utf-8-sig 自动去除 BOM
with open('data.json', 'r', encoding='utf-8-sig') as f:
    data = json.load(f)</code></pre>
<h3>原因 3：尾随逗号</h3>
<pre><code class="language-json">// ❌ 错误
{"name": "Alice", "age": 25,}

// ✅ 正确
{"name": "Alice", "age": 25}</code></pre>
<h3>原因 4：单引号</h3>
<pre><code class="language-json">// ❌ 错误
{'name': 'Alice'}

// ✅ 正确
{"name": "Alice"}</code></pre>
<h3>原因 5：JSON 中的注释</h3>
<pre><code class="language-json">// ❌ 错误
{
  // 这是注释
  "name": "Alice"
}

// ✅ 正确（删除注释）
{
  "name": "Alice"
}</code></pre>
<h3>原因 6：undefined 值</h3>
<pre><code class="language-javascript">// undefined 在序列化时被跳过，导致意外的 JSON 结构
const obj = { a: 1, b: undefined };
JSON.stringify(obj); // '{"a":1}' — b 消失了

// 如果需要表示空值，使用 null
const obj = { a: 1, b: null };
JSON.stringify(obj); // '{"a":1,"b":null}'</code></pre>
<h2>调试清单</h2>
<ul>
<li>打印原始响应体的前 200 个字符</li>
<li>检查 Content-Type: application/json 请求头</li>
<li>粘贴到 <a href="/json/validate">JSON 验证器</a>查看精确错误位置</li>
<li>使用 <a href="/json/repair">JSON 修复工具</a>自动修复</li>
</ul>
`,
en: `<h1>Fix JSON Unexpected Token Errors</h1>
<h2>What This Error Means</h2>
<p><code>SyntaxError: Unexpected token X in JSON at position N</code> means the parser found character X where it wasn't expected.</p>
<h2>Most Common Causes and Fixes</h2>
<h3>Cause 1: Server returned HTML error page</h3>
<p>The most common — "Unexpected token &lt;"</p>
<pre><code class="language-javascript">const res = await fetch('/api/data');
const ct = res.headers.get('content-type');
if (!ct?.includes('application/json')) {
  throw new Error('Server returned non-JSON: ' + await res.text());
}</code></pre>
<h3>Cause 2: UTF-8 BOM marker</h3>
<pre><code class="language-javascript">// Strip BOM before parsing
const clean = rawText.replace(/^\\uFEFF/, '');
JSON.parse(clean);</code></pre>
<pre><code class="language-python"># Python: use utf-8-sig to auto-strip BOM
with open('data.json', 'r', encoding='utf-8-sig') as f:
    data = json.load(f)</code></pre>
<h3>Cause 3: Trailing comma</h3>
<pre><code class="language-json">// ❌ Invalid
{"name": "Alice", "age": 25,}

// ✅ Valid
{"name": "Alice", "age": 25}</code></pre>
<h3>Cause 4: Single quotes</h3>
<pre><code class="language-json">// ❌ Invalid
{'name': 'Alice'}

// ✅ Valid
{"name": "Alice"}</code></pre>
<h3>Cause 5: Comment in JSON</h3>
<pre><code class="language-json">// ❌ Invalid
{
  // This is a comment
  "name": "Alice"
}

// ✅ Valid (remove comments)
{
  "name": "Alice"
}</code></pre>
<h3>Cause 6: undefined value</h3>
<pre><code class="language-javascript">// undefined gets silently dropped during serialization
const obj = { a: 1, b: undefined };
JSON.stringify(obj); // '{"a":1}' — b is gone!

// Use null to explicitly represent absence
const obj = { a: 1, b: null };
JSON.stringify(obj); // '{"a":1,"b":null}'</code></pre>
<h2>Debug Checklist</h2>
<ul>
<li>Log first 200 characters of raw response body</li>
<li>Verify Content-Type: application/json header</li>
<li>Paste to <a href="/json/validate">JSON Validator</a> for exact error location</li>
<li>Use <a href="/json/repair">JSON Repair</a> for auto-fix</li>
</ul>
`
};

window.LEARN_ARTICLES["unexpected-end-of-json"] = {
zh: `<h1>修复 Unexpected End of JSON Input</h1>
<h2>错误含义</h2>
<p><code>SyntaxError: Unexpected end of JSON input</code> 意味着 JSON 字符串在解析器完成读取完整值之前就结束了。</p>
<h2>常见原因与修复</h2>
<h3>原因 1：空字符串</h3>
<pre><code class="language-javascript">// ❌ 错误
JSON.parse('');    // SyntaxError
JSON.parse(null);  // SyntaxError
JSON.parse(undefined); // SyntaxError

// ✅ 防御性解析
function safeParseJSON(str, fallback = null) {
  if (!str) return fallback;
  try { return JSON.parse(str); }
  catch { return fallback; }
}</code></pre>
<h3>原因 2：网络响应被截断</h3>
<pre><code class="language-javascript">// ✅ 正确处理空响应（204 No Content）
const res = await fetch(url);
if (res.status === 204) return null;
return res.json();</code></pre>
<h3>原因 3：括号/引号未闭合</h3>
<pre><code class="language-json">// ❌ 括号未闭合
{"a": {"b": 1}

// ✅ 修复
{"a": {"b": 1}}</code></pre>
<pre><code class="language-json">// ❌ 字符串未闭合
{"name": "Alice}

// ✅ 修复
{"name": "Alice"}</code></pre>
<h3>原因 4：localStorage 数据损坏</h3>
<pre><code class="language-javascript">function safeGetItem(key) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  } catch {
    localStorage.removeItem(key); // 清除损坏数据
    return null;
  }
}</code></pre>
<h3>原因 5：文件被截断</h3>
<pre><code class="language-bash"># 检查文件完整性
python3 -m json.tool data.json > /dev/null && echo "OK" || echo "CORRUPT"

# 检查文件最后几行
tail -5 data.json</code></pre>
<h2>预防措施</h2>
<ul>
<li>始终检查字符串是否为空再解析</li>
<li>处理 204 No Content 响应</li>
<li>使用 try-catch 包裹所有 JSON.parse()</li>
<li>localStorage 读取时做容错处理</li>
</ul>
`,
en: `<h1>Fix Unexpected End of JSON Input</h1>
<h2>What This Error Means</h2>
<p><code>SyntaxError: Unexpected end of JSON input</code> means the JSON string ended before the parser finished reading a complete value.</p>
<h2>Common Causes and Fixes</h2>
<h3>Cause 1: Empty string</h3>
<pre><code class="language-javascript">// ❌ Invalid
JSON.parse('');    // SyntaxError
JSON.parse(null);  // SyntaxError

// ✅ Defensive parsing
function safeParseJSON(str, fallback = null) {
  if (!str) return fallback;
  try { return JSON.parse(str); }
  catch { return fallback; }
}</code></pre>
<h3>Cause 2: Truncated network response</h3>
<pre><code class="language-javascript">// ✅ Handle empty response (204 No Content)
const res = await fetch(url);
if (res.status === 204) return null;
return res.json();</code></pre>
<h3>Cause 3: Unclosed brackets or quotes</h3>
<pre><code class="language-json">// ❌ Unclosed bracket
{"a": {"b": 1}

// ✅ Fixed
{"a": {"b": 1}}</code></pre>
<pre><code class="language-json">// ❌ Unclosed string
{"name": "Alice}

// ✅ Fixed
{"name": "Alice"}</code></pre>
<h3>Cause 4: Corrupted localStorage</h3>
<pre><code class="language-javascript">function safeGetItem(key) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  } catch {
    localStorage.removeItem(key); // clear corrupt data
    return null;
  }
}</code></pre>
<h3>Cause 5: Truncated file</h3>
<pre><code class="language-bash"># Check file integrity
python3 -m json.tool data.json > /dev/null && echo "OK" || echo "CORRUPT"

# Check last few lines
tail -5 data.json</code></pre>
<h2>Prevention</h2>
<ul>
<li>Always check for empty/null before parsing</li>
<li>Handle 204 No Content responses</li>
<li>Wrap all JSON.parse() calls in try-catch</li>
<li>Add error recovery when reading from localStorage</li>
</ul>
`
};

window.LEARN_ARTICLES["json-syntax-error-debug"] = {
zh: `<h1>JSON 语法错误定位与调试技巧</h1>
<h2>精准定位错误</h2>
<h3>1. 使用在线验证器</h3>
<p>最快的方式：粘贴到 <a href="/json/validate">JSON 验证器</a>——直接显示错误行号和列号。</p>
<h3>2. 命令行工具</h3>
<pre><code class="language-bash"># Python（显示行号）
python3 -m json.tool data.json

# 输出：
# Expecting property name enclosed in double quotes: line 5 column 3 (char 89)

# jq
jq '.' data.json

# Node.js（含详细位置）
node -e "
try { JSON.parse(require('fs').readFileSync('data.json', 'utf8')); }
catch(e) { console.error(e.message); }"</code></pre>
<h3>3. 编辑器高亮</h3>
<ul>
<li><strong>VSCode</strong>：内置实时 JSON 验证，错误行有红色波浪线</li>
<li><strong>JetBrains</strong>：即时语法检查，Alt+Enter 快速修复</li>
</ul>
<h2>二分法定位</h2>
<p>对于大型 JSON 文件，使用二分法：</p>
<pre><code class="language-bash"># 提取前一半内容
head -n 500 big.json > half.json
python3 -m json.tool half.json 2>&1

# 如果前半没问题，检查后半
tail -n 500 big.json > half.json
# ...</code></pre>
<h2>常见错误定位表</h2>
<table>
<thead><tr><th>错误</th><th>定位方法</th></tr></thead>
<tbody>
<tr><td>尾随逗号</td><td>搜索 <code>,}</code> 和 <code>,]</code></td></tr>
<tr><td>单引号</td><td>搜索 <code>'</code></td></tr>
<tr><td>注释</td><td>搜索 <code>//</code> 或 <code>/*</code></td></tr>
<tr><td>未转义字符</td><td>验证器会指向具体位置</td></tr>
<tr><td>括号不匹配</td><td>编辑器括号高亮</td></tr>
</tbody>
</table>
<h2>CI 自动检查</h2>
<pre><code class="language-yaml"># GitHub Actions
- name: Validate JSON files
  run: |
    find . -name '*.json' -not -path '*/node_modules/*' | while read f; do
      python3 -m json.tool "$f" > /dev/null || { echo "INVALID: $f"; exit 1; }
    done</code></pre>
<pre><code class="language-bash"># pre-commit hook
# .git/hooks/pre-commit
for f in $(git diff --cached --name-only | grep '.json$'); do
  python3 -m json.tool "$f" > /dev/null || { echo "Invalid JSON: $f"; exit 1; }
done</code></pre>
<h2>小结</h2>
<ul>
<li>在线验证器是最快的调试工具</li>
<li><code>python3 -m json.tool</code> 提供精确行列号</li>
<li>大文件用二分法缩小范围</li>
<li>在 CI 中加入 JSON 验证防止问题进入代码库</li>
</ul>
`,
en: `<h1>Locating and Debugging JSON Syntax Errors</h1>
<h2>Pinpointing Errors</h2>
<h3>1. Online Validator</h3>
<p>Fastest method: paste into <a href="/json/validate">JSON Validator</a> — it shows exact line and column numbers.</p>
<h3>2. Command Line Tools</h3>
<pre><code class="language-bash"># Python (shows line number)
python3 -m json.tool data.json

# Output:
# Expecting property name enclosed in double quotes: line 5 column 3 (char 89)

# jq
jq '.' data.json

# Node.js
node -e "
try { JSON.parse(require('fs').readFileSync('data.json', 'utf8')); }
catch(e) { console.error(e.message); }"</code></pre>
<h3>3. Editor Highlighting</h3>
<ul>
<li><strong>VSCode</strong>: built-in real-time JSON validation with red underlines</li>
<li><strong>JetBrains</strong>: instant syntax checking with Alt+Enter quick-fix</li>
</ul>
<h2>Binary Search Method for Large Files</h2>
<pre><code class="language-bash"># Check first half
head -n 500 big.json > half.json
python3 -m json.tool half.json 2>&1

# If first half is fine, check second half
tail -n 500 big.json > half.json</code></pre>
<h2>Common Error Location Guide</h2>
<table>
<thead><tr><th>Error</th><th>How to Find</th></tr></thead>
<tbody>
<tr><td>Trailing comma</td><td>Search for <code>,}</code> and <code>,]</code></td></tr>
<tr><td>Single quotes</td><td>Search for <code>'</code></td></tr>
<tr><td>Comments</td><td>Search for <code>//</code> or <code>/*</code></td></tr>
<tr><td>Unescaped chars</td><td>Validator points to exact location</td></tr>
<tr><td>Bracket mismatch</td><td>Editor bracket highlighting</td></tr>
</tbody>
</table>
<h2>CI Automation</h2>
<pre><code class="language-yaml"># GitHub Actions
- name: Validate JSON files
  run: |
    find . -name '*.json' -not -path '*/node_modules/*' | while read f; do
      python3 -m json.tool "$f" > /dev/null || { echo "INVALID: $f"; exit 1; }
    done</code></pre>
<h2>Summary</h2>
<ul>
<li>Online validator is the fastest debugging tool</li>
<li><code>python3 -m json.tool</code> gives exact line and column numbers</li>
<li>Use binary search method for large files</li>
<li>Add JSON validation to CI to prevent bad JSON from being committed</li>
</ul>
`
};

window.LEARN_ARTICLES["json-debug-tools"] = {
zh: `<h1>JSON 调试工具完全指南</h1>
<h2>在线工具</h2>
<h3>JSONLint / ToolboxNova JSON 验证器</h3>
<ul>
<li>粘贴 JSON → 立即验证</li>
<li>显示精确错误位置（行号、列号）</li>
<li>格式化和高亮显示</li>
</ul>
<h2>命令行：jq</h2>
<p>jq 是 JSON 调试的瑞士军刀：</p>
<pre><code class="language-bash"># 安装
brew install jq       # macOS
apt install jq        # Ubuntu/Debian
choco install jq      # Windows

# 基本验证和格式化
jq '.' data.json

# 提取字段
jq '.name' data.json
jq '.users[0].email' data.json

# 过滤数组
jq '.users[] | select(.age > 25)' data.json

# 压缩
jq -c '.' data.json

# 统计数组长度
jq '.users | length' data.json

# 提取所有键名
jq 'keys' object.json</code></pre>
<h2>命令行：Python</h2>
<pre><code class="language-bash"># 验证并格式化
python3 -m json.tool data.json

# 提取字段
python3 -c "import json,sys; d=json.load(open('data.json')); print(d['name'])"

# 美化标准输入
echo '{"a":1}' | python3 -m json.tool</code></pre>
<h2>浏览器 DevTools</h2>
<ul>
<li><strong>Network 面板</strong>：点击请求 → Preview 标签，自动格式化 JSON 响应</li>
<li><strong>Console</strong>：<code>JSON.parse()</code> 错误包含位置信息</li>
<li><strong>断点调试</strong>：在 fetch() 或 JSON.parse() 处设置断点检查原始值</li>
</ul>
<h2>VS Code 内置工具</h2>
<ul>
<li>自动语法高亮和验证</li>
<li><code>Shift+Alt+F</code>：格式化</li>
<li>JSON Schema 支持：悬停查看字段文档</li>
<li><strong>插件</strong>：REST Client（发送请求并查看 JSON 响应）</li>
</ul>
<h2>专用 JSON 工具</h2>
<table>
<thead><tr><th>工具</th><th>用途</th><th>平台</th></tr></thead>
<tbody>
<tr><td><a href="/json/validate">ToolboxNova 验证器</a></td><td>验证 + 格式化</td><td>在线</td></tr>
<tr><td><a href="/json/repair">ToolboxNova 修复工具</a></td><td>自动修复常见错误</td><td>在线</td></tr>
<tr><td>jq</td><td>命令行查询和转换</td><td>CLI</td></tr>
<tr><td>JSONLint.com</td><td>在线验证</td><td>在线</td></tr>
<tr><td>Insomnia / Postman</td><td>API 测试和 JSON 查看</td><td>桌面</td></tr>
</tbody>
</table>
<h2>小结</h2>
<ul>
<li><strong>验证</strong>：在线验证器 + <code>python -m json.tool</code></li>
<li><strong>查询</strong>：jq（命令行）、JSONPath（编程语言）</li>
<li><strong>API 调试</strong>：浏览器 DevTools Network 面板</li>
<li><strong>编辑</strong>：VSCode 内置支持最好</li>
</ul>
`,
en: `<h1>Complete Guide to JSON Debug Tools</h1>
<h2>Online Tools</h2>
<h3>JSON Validator (e.g. ToolboxNova)</h3>
<ul>
<li>Paste JSON → instant validation</li>
<li>Shows exact error location (line number, column)</li>
<li>Formatting and syntax highlighting</li>
</ul>
<h2>Command Line: jq</h2>
<p>jq is the Swiss Army knife for JSON debugging:</p>
<pre><code class="language-bash"># Install
brew install jq       # macOS
apt install jq        # Ubuntu/Debian
choco install jq      # Windows

# Basic validation and formatting
jq '.' data.json

# Extract a field
jq '.name' data.json
jq '.users[0].email' data.json

# Filter array
jq '.users[] | select(.age > 25)' data.json

# Compact output
jq -c '.' data.json

# Count array length
jq '.users | length' data.json

# Get all keys
jq 'keys' object.json</code></pre>
<h2>Command Line: Python</h2>
<pre><code class="language-bash"># Validate and format
python3 -m json.tool data.json

# Extract a field
python3 -c "import json,sys; d=json.load(open('data.json')); print(d['name'])"

# Prettify stdin
echo '{"a":1}' | python3 -m json.tool</code></pre>
<h2>Browser DevTools</h2>
<ul>
<li><strong>Network tab</strong>: click a request → Preview tab — auto-formats JSON responses</li>
<li><strong>Console</strong>: JSON.parse() errors include position information</li>
<li><strong>Breakpoints</strong>: set at fetch() or JSON.parse() to inspect raw values</li>
</ul>
<h2>VS Code Built-in Tools</h2>
<ul>
<li>Automatic syntax highlighting and validation</li>
<li><code>Shift+Alt+F</code>: format document</li>
<li>JSON Schema support: hover to see field documentation</li>
<li><strong>Extension</strong>: REST Client (send requests and inspect JSON responses)</li>
</ul>
<h2>Specialized JSON Tools</h2>
<table>
<thead><tr><th>Tool</th><th>Purpose</th><th>Platform</th></tr></thead>
<tbody>
<tr><td><a href="/json/validate">ToolboxNova Validator</a></td><td>Validate + format</td><td>Online</td></tr>
<tr><td><a href="/json/repair">ToolboxNova Repair</a></td><td>Auto-fix common errors</td><td>Online</td></tr>
<tr><td>jq</td><td>Command-line queries and transforms</td><td>CLI</td></tr>
<tr><td>JSONLint.com</td><td>Online validation</td><td>Online</td></tr>
<tr><td>Insomnia / Postman</td><td>API testing and JSON viewing</td><td>Desktop</td></tr>
</tbody>
</table>
<h2>Summary</h2>
<ul>
<li><strong>Validation</strong>: online validator + <code>python -m json.tool</code></li>
<li><strong>Querying</strong>: jq (CLI), JSONPath (programming)</li>
<li><strong>API debugging</strong>: browser DevTools Network panel</li>
<li><strong>Editing</strong>: VSCode has the best built-in JSON support</li>
</ul>
`
};

