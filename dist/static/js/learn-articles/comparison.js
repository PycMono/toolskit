/* JSON Learn Articles: comparison */
window.LEARN_ARTICLES = window.LEARN_ARTICLES || {};

window.LEARN_ARTICLES["json-vs-xml"] = {
zh: `<h1>JSON vs XML：全面对比与选型指南</h1>
<h2>核心对比</h2>
<table>
<thead><tr><th>维度</th><th>JSON</th><th>XML</th></tr></thead>
<tbody>
<tr><td>可读性</td><td>⭐⭐⭐⭐⭐</td><td>⭐⭐⭐</td></tr>
<tr><td>数据体积</td><td>小</td><td>大（标签冗余）</td></tr>
<tr><td>解析速度</td><td>快</td><td>较慢</td></tr>
<tr><td>数据类型</td><td>原生支持</td><td>全部是文本</td></tr>
<tr><td>Schema</td><td>JSON Schema</td><td>XSD / DTD</td></tr>
<tr><td>注释</td><td>❌ 不支持</td><td>✅ 支持</td></tr>
<tr><td>命名空间</td><td>❌ 不支持</td><td>✅ 支持</td></tr>
<tr><td>属性</td><td>❌ 不支持</td><td>✅ 支持</td></tr>
<tr><td>XSLT 转换</td><td>❌</td><td>✅</td></tr>
</tbody>
</table>
<h2>语法对比</h2>
<pre><code class="language-json">{
  &#34;bookstore&#34;: {
    &#34;books&#34;: [
      { &#34;title&#34;: &#34;Go Programming&#34;, &#34;author&#34;: &#34;Rob Pike&#34;, &#34;price&#34;: 39.99, &#34;inStock&#34;: true },
      { &#34;title&#34;: &#34;Rust in Action&#34;, &#34;author&#34;: &#34;Tim McNamara&#34;, &#34;price&#34;: 49.99, &#34;inStock&#34;: false }
    ]
  }
}</code></pre>
<pre><code class="language-xml">&lt;?xml version=&#34;1.0&#34; encoding=&#34;UTF-8&#34;?&gt;
&lt;bookstore&gt;
  &lt;book inStock=&#34;true&#34;&gt;
    &lt;title&gt;Go Programming&lt;/title&gt;
    &lt;author&gt;Rob Pike&lt;/author&gt;
    &lt;price&gt;39.99&lt;/price&gt;
  &lt;/book&gt;
  &lt;book inStock=&#34;false&#34;&gt;
    &lt;title&gt;Rust in Action&lt;/title&gt;
    &lt;author&gt;Tim McNamara&lt;/author&gt;
    &lt;price&gt;49.99&lt;/price&gt;
  &lt;/book&gt;
&lt;/bookstore&gt;</code></pre>
<h2>体积对比</h2>
<table>
<thead><tr><th>场景</th><th>JSON 体积</th><th>XML 体积</th><th>差异</th></tr></thead>
<tbody>
<tr><td>简单对象</td><td>50B</td><td>120B</td><td>XML 大 140%</td></tr>
<tr><td>10 条记录</td><td>800B</td><td>1.6KB</td><td>XML 大 100%</td></tr>
<tr><td>1000 条记录</td><td>65KB</td><td>130KB</td><td>XML 大 100%</td></tr>
</tbody>
</table>
<h2>何时选择 JSON</h2>
<ul>
<li>REST API 数据交换</li>
<li>前端与后端通信</li>
<li>配置文件（package.json 等）</li>
<li>NoSQL 数据库存储</li>
<li>移动端数据传输</li>
</ul>
<h2>何时选择 XML</h2>
<ul>
<li>SOAP Web Services</li>
<li>文档标记（如 XHTML、SVG）</li>
<li>需要 Schema 严格验证的场景</li>
<li>遗留系统集成</li>
<li>需要命名空间和属性的场景</li>
<li>需要 XSLT 转换</li>
</ul>
<h2>互转示例</h2>
<pre><code class="language-javascript">// JSON → XML（使用 fast-xml-parser）
const { XMLBuilder } = require(&#39;fast-xml-parser&#39;);
const builder = new XMLBuilder({ format: true });
const xml = builder.build(jsonData);

// XML → JSON
const { XMLParser } = require(&#39;fast-xml-parser&#39;);
const parser = new XMLParser();
const json = parser.parse(xmlStr);</code></pre>
<h2>小结</h2>
<p>JSON 轻量快速，适合 Web API 和现代应用。XML 功能丰富，适合文档标记和企业集成。新项目优先选择 JSON。</p>
`,
en: `<h1>JSON vs XML：全面对比与选型指南</h1>
<h2>核心对比</h2>
<table>
<thead><tr><th>维度</th><th>JSON</th><th>XML</th></tr></thead>
<tbody>
<tr><td>可读性</td><td>⭐⭐⭐⭐⭐</td><td>⭐⭐⭐</td></tr>
<tr><td>数据体积</td><td>小</td><td>大（标签冗余）</td></tr>
<tr><td>解析速度</td><td>快</td><td>较慢</td></tr>
<tr><td>数据类型</td><td>原生支持</td><td>全部是文本</td></tr>
<tr><td>Schema</td><td>JSON Schema</td><td>XSD / DTD</td></tr>
<tr><td>注释</td><td>❌ 不支持</td><td>✅ 支持</td></tr>
<tr><td>命名空间</td><td>❌ 不支持</td><td>✅ 支持</td></tr>
<tr><td>属性</td><td>❌ 不支持</td><td>✅ 支持</td></tr>
<tr><td>XSLT 转换</td><td>❌</td><td>✅</td></tr>
</tbody>
</table>
<h2>语法对比</h2>
<pre><code class="language-json">{
  &#34;bookstore&#34;: {
    &#34;books&#34;: [
      { &#34;title&#34;: &#34;Go Programming&#34;, &#34;author&#34;: &#34;Rob Pike&#34;, &#34;price&#34;: 39.99, &#34;inStock&#34;: true },
      { &#34;title&#34;: &#34;Rust in Action&#34;, &#34;author&#34;: &#34;Tim McNamara&#34;, &#34;price&#34;: 49.99, &#34;inStock&#34;: false }
    ]
  }
}</code></pre>
<pre><code class="language-xml">&lt;?xml version=&#34;1.0&#34; encoding=&#34;UTF-8&#34;?&gt;
&lt;bookstore&gt;
  &lt;book inStock=&#34;true&#34;&gt;
    &lt;title&gt;Go Programming&lt;/title&gt;
    &lt;author&gt;Rob Pike&lt;/author&gt;
    &lt;price&gt;39.99&lt;/price&gt;
  &lt;/book&gt;
  &lt;book inStock=&#34;false&#34;&gt;
    &lt;title&gt;Rust in Action&lt;/title&gt;
    &lt;author&gt;Tim McNamara&lt;/author&gt;
    &lt;price&gt;49.99&lt;/price&gt;
  &lt;/book&gt;
&lt;/bookstore&gt;</code></pre>
<h2>体积对比</h2>
<table>
<thead><tr><th>场景</th><th>JSON 体积</th><th>XML 体积</th><th>差异</th></tr></thead>
<tbody>
<tr><td>简单对象</td><td>50B</td><td>120B</td><td>XML 大 140%</td></tr>
<tr><td>10 条记录</td><td>800B</td><td>1.6KB</td><td>XML 大 100%</td></tr>
<tr><td>1000 条记录</td><td>65KB</td><td>130KB</td><td>XML 大 100%</td></tr>
</tbody>
</table>
<h2>何时选择 JSON</h2>
<ul>
<li>REST API 数据交换</li>
<li>前端与后端通信</li>
<li>配置文件（package.json 等）</li>
<li>NoSQL 数据库存储</li>
<li>移动端数据传输</li>
</ul>
<h2>何时选择 XML</h2>
<ul>
<li>SOAP Web Services</li>
<li>文档标记（如 XHTML、SVG）</li>
<li>需要 Schema 严格验证的场景</li>
<li>遗留系统集成</li>
<li>需要命名空间和属性的场景</li>
<li>需要 XSLT 转换</li>
</ul>
<h2>互转示例</h2>
<pre><code class="language-javascript">// JSON → XML（使用 fast-xml-parser）
const { XMLBuilder } = require(&#39;fast-xml-parser&#39;);
const builder = new XMLBuilder({ format: true });
const xml = builder.build(jsonData);

// XML → JSON
const { XMLParser } = require(&#39;fast-xml-parser&#39;);
const parser = new XMLParser();
const json = parser.parse(xmlStr);</code></pre>
<h2>小结</h2>
<p>JSON 轻量快速，适合 Web API 和现代应用。XML 功能丰富，适合文档标记和企业集成。新项目优先选择 JSON。</p>
`
};

window.LEARN_ARTICLES["json-vs-yaml"] = {
zh: `<h1>JSON vs YAML：何时用哪个</h1>
<h2>核心对比</h2>
<table>
<thead><tr><th>维度</th><th>JSON</th><th>YAML</th></tr></thead>
<tbody>
<tr><td>可读性</td><td>好</td><td>极好</td></tr>
<tr><td>注释</td><td>❌</td><td>✅ <code>#</code></td></tr>
<tr><td>多行字符串</td><td>需转义</td><td>原生支持 \`</td><td><code> </code>>\`</td></tr>
<tr><td>数据类型</td><td>6 种</td><td>更丰富</td></tr>
<tr><td>引号要求</td><td>必须双引号</td><td>大多可省略</td></tr>
<tr><td>尾随逗号</td><td>❌</td><td>无逗号</td></tr>
<tr><td>解析复杂度</td><td>简单</td><td>复杂</td></tr>
<tr><td>安全性</td><td>高</td><td>需注意</td></tr>
</tbody>
</table>
<h2>语法对比</h2>
<p><strong>JSON：</strong></p>
<pre><code class="language-json">{
  &#34;server&#34;: {
    &#34;host&#34;: &#34;localhost&#34;,
    &#34;port&#34;: 8080,
    &#34;debug&#34;: true,
    &#34;cors&#34;: [&#34;http://localhost:3000&#34;, &#34;https://example.com&#34;],
    &#34;database&#34;: {
      &#34;driver&#34;: &#34;postgres&#34;,
      &#34;connection&#34;: &#34;postgres://user:pass@localhost/db&#34;
    }
  }
}</code></pre>
<p><strong>YAML：</strong></p>
<pre><code class="language-yaml"># 服务器配置
server:
  host: localhost
  port: 8080
  debug: true
  cors:
    - http://localhost:3000
    - https://example.com
  database:
    driver: postgres
    connection: postgres://user:pass@localhost/db</code></pre>
<h2>YAML 独有特性</h2>
<pre><code class="language-yaml"># 1. 注释
name: Alice  # 这是注释

# 2. 多行字符串
description: |
  这是一段
  多行文本
  保留换行符

summary: &gt;
  这段文本
  会被折叠成
  一行

# 3. 锚点和引用
defaults: &amp;defaults
  timeout: 30
  retries: 3

production:
  &lt;&lt;: *defaults
  timeout: 60</code></pre>
<h2>何时选择 JSON</h2>
<ul>
<li>API 数据交换</li>
<li>机器生成/消费的数据</li>
<li>需要严格解析的场景</li>
<li>浏览器环境</li>
<li>数据库存储</li>
</ul>
<h2>何时选择 YAML</h2>
<ul>
<li>配置文件（Docker Compose、Kubernetes、CI/CD）</li>
<li>需要注释的场景</li>
<li>人工编辑频繁的文件</li>
<li>多行文本较多的场景</li>
<li>Ansible Playbook</li>
</ul>
<h2>YAML 安全注意</h2>
<pre><code class="language-yaml"># 危险：某些 YAML 解析器会执行代码
!!python/object/apply:os.system [&#39;rm -rf /&#39;]

# 类型歧义
country: NO        # 被解析为 false！
version: 1.0       # 被解析为浮点数
time: 12:30        # 被解析为秒数

# 安全做法：加引号
country: &#34;NO&#34;
version: &#34;1.0&#34;</code></pre>
<h2>互转</h2>
<pre><code class="language-python">import json, yaml

# JSON → YAML
with open(&#39;config.json&#39;) as f:
    data = json.load(f)
with open(&#39;config.yaml&#39;, &#39;w&#39;) as f:
    yaml.dump(data, f, default_flow_style=False, allow_unicode=True)

# YAML → JSON
with open(&#39;config.yaml&#39;) as f:
    data = yaml.safe_load(f)
with open(&#39;config.json&#39;, &#39;w&#39;) as f:
    json.dump(data, f, indent=2)</code></pre>
<h2>小结</h2>
<p>JSON 适合数据交换和程序间通信。YAML 适合配置文件和人工编辑。注意 YAML 的安全隐患和类型歧义。</p>
`,
en: `<h1>JSON vs YAML：何时用哪个</h1>
<h2>核心对比</h2>
<table>
<thead><tr><th>维度</th><th>JSON</th><th>YAML</th></tr></thead>
<tbody>
<tr><td>可读性</td><td>好</td><td>极好</td></tr>
<tr><td>注释</td><td>❌</td><td>✅ <code>#</code></td></tr>
<tr><td>多行字符串</td><td>需转义</td><td>原生支持 \`</td><td><code> </code>>\`</td></tr>
<tr><td>数据类型</td><td>6 种</td><td>更丰富</td></tr>
<tr><td>引号要求</td><td>必须双引号</td><td>大多可省略</td></tr>
<tr><td>尾随逗号</td><td>❌</td><td>无逗号</td></tr>
<tr><td>解析复杂度</td><td>简单</td><td>复杂</td></tr>
<tr><td>安全性</td><td>高</td><td>需注意</td></tr>
</tbody>
</table>
<h2>语法对比</h2>
<p><strong>JSON：</strong></p>
<pre><code class="language-json">{
  &#34;server&#34;: {
    &#34;host&#34;: &#34;localhost&#34;,
    &#34;port&#34;: 8080,
    &#34;debug&#34;: true,
    &#34;cors&#34;: [&#34;http://localhost:3000&#34;, &#34;https://example.com&#34;],
    &#34;database&#34;: {
      &#34;driver&#34;: &#34;postgres&#34;,
      &#34;connection&#34;: &#34;postgres://user:pass@localhost/db&#34;
    }
  }
}</code></pre>
<p><strong>YAML：</strong></p>
<pre><code class="language-yaml"># 服务器配置
server:
  host: localhost
  port: 8080
  debug: true
  cors:
    - http://localhost:3000
    - https://example.com
  database:
    driver: postgres
    connection: postgres://user:pass@localhost/db</code></pre>
<h2>YAML 独有特性</h2>
<pre><code class="language-yaml"># 1. 注释
name: Alice  # 这是注释

# 2. 多行字符串
description: |
  这是一段
  多行文本
  保留换行符

summary: &gt;
  这段文本
  会被折叠成
  一行

# 3. 锚点和引用
defaults: &amp;defaults
  timeout: 30
  retries: 3

production:
  &lt;&lt;: *defaults
  timeout: 60</code></pre>
<h2>何时选择 JSON</h2>
<ul>
<li>API 数据交换</li>
<li>机器生成/消费的数据</li>
<li>需要严格解析的场景</li>
<li>浏览器环境</li>
<li>数据库存储</li>
</ul>
<h2>何时选择 YAML</h2>
<ul>
<li>配置文件（Docker Compose、Kubernetes、CI/CD）</li>
<li>需要注释的场景</li>
<li>人工编辑频繁的文件</li>
<li>多行文本较多的场景</li>
<li>Ansible Playbook</li>
</ul>
<h2>YAML 安全注意</h2>
<pre><code class="language-yaml"># 危险：某些 YAML 解析器会执行代码
!!python/object/apply:os.system [&#39;rm -rf /&#39;]

# 类型歧义
country: NO        # 被解析为 false！
version: 1.0       # 被解析为浮点数
time: 12:30        # 被解析为秒数

# 安全做法：加引号
country: &#34;NO&#34;
version: &#34;1.0&#34;</code></pre>
<h2>互转</h2>
<pre><code class="language-python">import json, yaml

# JSON → YAML
with open(&#39;config.json&#39;) as f:
    data = json.load(f)
with open(&#39;config.yaml&#39;, &#39;w&#39;) as f:
    yaml.dump(data, f, default_flow_style=False, allow_unicode=True)

# YAML → JSON
with open(&#39;config.yaml&#39;) as f:
    data = yaml.safe_load(f)
with open(&#39;config.json&#39;, &#39;w&#39;) as f:
    json.dump(data, f, indent=2)</code></pre>
<h2>小结</h2>
<p>JSON 适合数据交换和程序间通信。YAML 适合配置文件和人工编辑。注意 YAML 的安全隐患和类型歧义。</p>
`
};

window.LEARN_ARTICLES["json-vs-csv"] = {
zh: `<h1>JSON vs CSV：数据交换格式选择</h1>
<h2>核心对比</h2>
<table>
<thead><tr><th>维度</th><th>JSON</th><th>CSV</th></tr></thead>
<tbody>
<tr><td>结构</td><td>层次化</td><td>扁平化</td></tr>
<tr><td>数据类型</td><td>多种</td><td>全部是文本</td></tr>
<tr><td>嵌套</td><td>✅ 支持</td><td>❌ 不支持</td></tr>
<tr><td>文件大小</td><td>较大</td><td>较小</td></tr>
<tr><td>可读性</td><td>好</td><td>表格直观</td></tr>
<tr><td>Excel 兼容</td><td>需转换</td><td>直接打开</td></tr>
<tr><td>流式处理</td><td>困难</td><td>简单</td></tr>
</tbody>
</table>
<h2>格式对比</h2>
<p><strong>JSON：</strong></p>
<pre><code class="language-json">[
  {&#34;name&#34;: &#34;Alice&#34;, &#34;age&#34;: 25, &#34;skills&#34;: [&#34;Python&#34;, &#34;Go&#34;], &#34;address&#34;: {&#34;city&#34;: &#34;Beijing&#34;}},
  {&#34;name&#34;: &#34;Bob&#34;, &#34;age&#34;: 30, &#34;skills&#34;: [&#34;Java&#34;], &#34;address&#34;: {&#34;city&#34;: &#34;Shanghai&#34;}}
]</code></pre>
<p><strong>CSV：</strong></p>
<pre><code class="language-csv">name,age,skills,address_city
Alice,25,&#34;Python;Go&#34;,Beijing
Bob,30,Java,Shanghai</code></pre>
<h2>何时选择 JSON</h2>
<ul>
<li>层次化/嵌套数据</li>
<li>API 数据传输</li>
<li>数据类型需要保留（数值、布尔、null）</li>
<li>字段数量不固定</li>
<li>NoSQL 数据库导入</li>
</ul>
<h2>何时选择 CSV</h2>
<ul>
<li>表格化的扁平数据</li>
<li>数据分析和可视化</li>
<li>Excel/Google Sheets 使用</li>
<li>大数据量的简单记录</li>
<li>数据库批量导入</li>
</ul>
<h2>互转</h2>
<pre><code class="language-python">import json, csv

# JSON → CSV
with open(&#39;data.json&#39;) as jf:
    data = json.load(jf)

with open(&#39;data.csv&#39;, &#39;w&#39;, newline=&#39;&#39;, encoding=&#39;utf-8&#39;) as cf:
    writer = csv.DictWriter(cf, fieldnames=data[0].keys())
    writer.writeheader()
    writer.writerows(data)

# CSV → JSON
with open(&#39;data.csv&#39;, encoding=&#39;utf-8&#39;) as cf:
    reader = csv.DictReader(cf)
    data = list(reader)

with open(&#39;data.json&#39;, &#39;w&#39;, encoding=&#39;utf-8&#39;) as jf:
    json.dump(data, jf, indent=2, ensure_ascii=False)</code></pre>
<h2>小结</h2>
<p>JSON 适合结构化 API 数据，CSV 适合扁平表格数据。选择取决于数据结构和使用场景。</p>
`,
en: `<h1>JSON vs CSV：数据交换格式选择</h1>
<h2>核心对比</h2>
<table>
<thead><tr><th>维度</th><th>JSON</th><th>CSV</th></tr></thead>
<tbody>
<tr><td>结构</td><td>层次化</td><td>扁平化</td></tr>
<tr><td>数据类型</td><td>多种</td><td>全部是文本</td></tr>
<tr><td>嵌套</td><td>✅ 支持</td><td>❌ 不支持</td></tr>
<tr><td>文件大小</td><td>较大</td><td>较小</td></tr>
<tr><td>可读性</td><td>好</td><td>表格直观</td></tr>
<tr><td>Excel 兼容</td><td>需转换</td><td>直接打开</td></tr>
<tr><td>流式处理</td><td>困难</td><td>简单</td></tr>
</tbody>
</table>
<h2>格式对比</h2>
<p><strong>JSON：</strong></p>
<pre><code class="language-json">[
  {&#34;name&#34;: &#34;Alice&#34;, &#34;age&#34;: 25, &#34;skills&#34;: [&#34;Python&#34;, &#34;Go&#34;], &#34;address&#34;: {&#34;city&#34;: &#34;Beijing&#34;}},
  {&#34;name&#34;: &#34;Bob&#34;, &#34;age&#34;: 30, &#34;skills&#34;: [&#34;Java&#34;], &#34;address&#34;: {&#34;city&#34;: &#34;Shanghai&#34;}}
]</code></pre>
<p><strong>CSV：</strong></p>
<pre><code class="language-csv">name,age,skills,address_city
Alice,25,&#34;Python;Go&#34;,Beijing
Bob,30,Java,Shanghai</code></pre>
<h2>何时选择 JSON</h2>
<ul>
<li>层次化/嵌套数据</li>
<li>API 数据传输</li>
<li>数据类型需要保留（数值、布尔、null）</li>
<li>字段数量不固定</li>
<li>NoSQL 数据库导入</li>
</ul>
<h2>何时选择 CSV</h2>
<ul>
<li>表格化的扁平数据</li>
<li>数据分析和可视化</li>
<li>Excel/Google Sheets 使用</li>
<li>大数据量的简单记录</li>
<li>数据库批量导入</li>
</ul>
<h2>互转</h2>
<pre><code class="language-python">import json, csv

# JSON → CSV
with open(&#39;data.json&#39;) as jf:
    data = json.load(jf)

with open(&#39;data.csv&#39;, &#39;w&#39;, newline=&#39;&#39;, encoding=&#39;utf-8&#39;) as cf:
    writer = csv.DictWriter(cf, fieldnames=data[0].keys())
    writer.writeheader()
    writer.writerows(data)

# CSV → JSON
with open(&#39;data.csv&#39;, encoding=&#39;utf-8&#39;) as cf:
    reader = csv.DictReader(cf)
    data = list(reader)

with open(&#39;data.json&#39;, &#39;w&#39;, encoding=&#39;utf-8&#39;) as jf:
    json.dump(data, jf, indent=2, ensure_ascii=False)</code></pre>
<h2>小结</h2>
<p>JSON 适合结构化 API 数据，CSV 适合扁平表格数据。选择取决于数据结构和使用场景。</p>
`
};

window.LEARN_ARTICLES["json-vs-protobuf"] = {
zh: `<h1>JSON vs Protocol Buffers 性能对比</h1>
<h2>核心对比</h2>
<table>
<thead><tr><th>维度</th><th>JSON</th><th>Protocol Buffers</th></tr></thead>
<tbody>
<tr><td>格式</td><td>文本</td><td>二进制</td></tr>
<tr><td>可读性</td><td>✅ 人类可读</td><td>❌ 需工具</td></tr>
<tr><td>体积</td><td>较大</td><td>小 3-10x</td></tr>
<tr><td>速度</td><td>较慢</td><td>快 2-10x</td></tr>
<tr><td>Schema</td><td>可选</td><td>必须 (.proto)</td></tr>
<tr><td>语言支持</td><td>几乎所有</td><td>主流语言</td></tr>
<tr><td>浏览器</td><td>原生支持</td><td>需要库</td></tr>
<tr><td>版本兼容</td><td>灵活</td><td>内置向前/向后兼容</td></tr>
</tbody>
</table>
<h2>定义对比</h2>
<p><strong>JSON（无 Schema）：</strong></p>
<pre><code class="language-json">{
  &#34;id&#34;: 1,
  &#34;name&#34;: &#34;Alice&#34;,
  &#34;email&#34;: &#34;alice@example.com&#34;,
  &#34;age&#34;: 25,
  &#34;roles&#34;: [&#34;admin&#34;, &#34;editor&#34;]
}</code></pre>
<p><strong>Protocol Buffers Schema：</strong></p>
<pre><code class="language-protobuf">syntax = &#34;proto3&#34;;

message User {
  int32 id = 1;
  string name = 2;
  string email = 3;
  int32 age = 4;
  repeated string roles = 5;
}</code></pre>
<h2>性能对比</h2>
<table>
<thead><tr><th>指标</th><th>JSON</th><th>Protobuf</th><th>差异</th></tr></thead>
<tbody>
<tr><td>序列化大小</td><td>100B</td><td>35B</td><td>Protobuf 小 65%</td></tr>
<tr><td>序列化耗时</td><td>10μs</td><td>2μs</td><td>Protobuf 快 5x</td></tr>
<tr><td>反序列化耗时</td><td>15μs</td><td>3μs</td><td>Protobuf 快 5x</td></tr>
</tbody>
</table>
<h2>何时选择 JSON</h2>
<ul>
<li>Web 前端 API</li>
<li>公开 REST API</li>
<li>调试和日志记录需要可读性</li>
<li>配置文件</li>
<li>快速原型开发</li>
</ul>
<h2>何时选择 Protobuf</h2>
<ul>
<li>微服务间通信（gRPC）</li>
<li>高性能、低延迟场景</li>
<li>移动端节省带宽</li>
<li>大数据量传输</li>
<li>需要严格 Schema 和版本管理</li>
</ul>
<h2>混合使用</h2>
<p>很多系统同时使用两者：外部 API 用 JSON（兼容性好），内部微服务用 gRPC/Protobuf（性能高）。</p>
<h2>小结</h2>
<p>JSON 可读性好、生态广泛，适合面向外部的 API。Protobuf 体积小、速度快，适合内部高性能通信。</p>
`,
en: `<h1>JSON vs Protocol Buffers 性能对比</h1>
<h2>核心对比</h2>
<table>
<thead><tr><th>维度</th><th>JSON</th><th>Protocol Buffers</th></tr></thead>
<tbody>
<tr><td>格式</td><td>文本</td><td>二进制</td></tr>
<tr><td>可读性</td><td>✅ 人类可读</td><td>❌ 需工具</td></tr>
<tr><td>体积</td><td>较大</td><td>小 3-10x</td></tr>
<tr><td>速度</td><td>较慢</td><td>快 2-10x</td></tr>
<tr><td>Schema</td><td>可选</td><td>必须 (.proto)</td></tr>
<tr><td>语言支持</td><td>几乎所有</td><td>主流语言</td></tr>
<tr><td>浏览器</td><td>原生支持</td><td>需要库</td></tr>
<tr><td>版本兼容</td><td>灵活</td><td>内置向前/向后兼容</td></tr>
</tbody>
</table>
<h2>定义对比</h2>
<p><strong>JSON（无 Schema）：</strong></p>
<pre><code class="language-json">{
  &#34;id&#34;: 1,
  &#34;name&#34;: &#34;Alice&#34;,
  &#34;email&#34;: &#34;alice@example.com&#34;,
  &#34;age&#34;: 25,
  &#34;roles&#34;: [&#34;admin&#34;, &#34;editor&#34;]
}</code></pre>
<p><strong>Protocol Buffers Schema：</strong></p>
<pre><code class="language-protobuf">syntax = &#34;proto3&#34;;

message User {
  int32 id = 1;
  string name = 2;
  string email = 3;
  int32 age = 4;
  repeated string roles = 5;
}</code></pre>
<h2>性能对比</h2>
<table>
<thead><tr><th>指标</th><th>JSON</th><th>Protobuf</th><th>差异</th></tr></thead>
<tbody>
<tr><td>序列化大小</td><td>100B</td><td>35B</td><td>Protobuf 小 65%</td></tr>
<tr><td>序列化耗时</td><td>10μs</td><td>2μs</td><td>Protobuf 快 5x</td></tr>
<tr><td>反序列化耗时</td><td>15μs</td><td>3μs</td><td>Protobuf 快 5x</td></tr>
</tbody>
</table>
<h2>何时选择 JSON</h2>
<ul>
<li>Web 前端 API</li>
<li>公开 REST API</li>
<li>调试和日志记录需要可读性</li>
<li>配置文件</li>
<li>快速原型开发</li>
</ul>
<h2>何时选择 Protobuf</h2>
<ul>
<li>微服务间通信（gRPC）</li>
<li>高性能、低延迟场景</li>
<li>移动端节省带宽</li>
<li>大数据量传输</li>
<li>需要严格 Schema 和版本管理</li>
</ul>
<h2>混合使用</h2>
<p>很多系统同时使用两者：外部 API 用 JSON（兼容性好），内部微服务用 gRPC/Protobuf（性能高）。</p>
<h2>小结</h2>
<p>JSON 可读性好、生态广泛，适合面向外部的 API。Protobuf 体积小、速度快，适合内部高性能通信。</p>
`
};

window.LEARN_ARTICLES["json5-jsonc"] = {
zh: `<h1>JSON5 与 JSONC：JSON 的扩展格式</h1>
<h2>标准 JSON 的限制</h2>
<ul>
<li>不支持注释</li>
<li>不支持尾随逗号</li>
<li>键名必须双引号</li>
<li>不支持多行字符串</li>
<li>不支持十六进制数值</li>
</ul>
<h2>JSONC（JSON with Comments）</h2>
<p>JSONC 是 JSON 的超集，仅增加了注释支持，VSCode 的配置文件就使用 JSONC。</p>
<pre><code class="language-jsonc">{
  // 这是行注释
  &#34;name&#34;: &#34;my-project&#34;,
  /* 这是块注释 */
  &#34;version&#34;: &#34;1.0.0&#34;,
  &#34;scripts&#34;: {
    &#34;dev&#34;: &#34;vite&#34;,      // 开发服务器
    &#34;build&#34;: &#34;vite build&#34;
  },
  // 尾随逗号也支持
  &#34;dependencies&#34;: {
    &#34;react&#34;: &#34;^18.0.0&#34;,
  }
}</code></pre>
<p><strong>适用场景：</strong> VSCode settings.json、tsconfig.json、.vscode/*.json</p>
<h2>JSON5</h2>
<p>JSON5 是 JSON 的更大超集，目标是让 JSON 像 ECMAScript 5 一样灵活：</p>
<pre><code class="language-json5">{
  // 单行注释
  /* 块注释 */

  // 键名无需引号（如果是合法标识符）
  name: &#39;Alice&#39;,         // 单引号字符串
  age: 25,

  // 多行字符串
  bio: &#39;Hello, \\
World!&#39;,

  // 尾随逗号
  hobbies: [&#39;reading&#39;, &#39;coding&#39;,],

  // 特殊数值
  infinity: Infinity,
  nan: NaN,
  hex: 0xFF,
  leadingDot: .5,
  trailingDot: 5.,
  positiveSign: +3,
}</code></pre>
<h3>JSON5 新增特性</h3>
<table>
<thead><tr><th>特性</th><th>JSON</th><th>JSONC</th><th>JSON5</th></tr></thead>
<tbody>
<tr><td>行注释 //</td><td>❌</td><td>✅</td><td>✅</td></tr>
<tr><td>块注释 /<em> </em>/</td><td>❌</td><td>✅</td><td>✅</td></tr>
<tr><td>尾随逗号</td><td>❌</td><td>✅</td><td>✅</td></tr>
<tr><td>单引号字符串</td><td>❌</td><td>❌</td><td>✅</td></tr>
<tr><td>无引号键名</td><td>❌</td><td>❌</td><td>✅</td></tr>
<tr><td>多行字符串</td><td>❌</td><td>❌</td><td>✅</td></tr>
<tr><td>十六进制</td><td>❌</td><td>❌</td><td>✅</td></tr>
<tr><td>Infinity/NaN</td><td>❌</td><td>❌</td><td>✅</td></tr>
</tbody>
</table>
<h2>使用方式</h2>
<h3>JavaScript</h3>
<pre><code class="language-javascript">// JSONC（VSCode 内置，或使用 jsonc-parser）
const jsonc = require(&#39;jsonc-parser&#39;);
const data = jsonc.parse(jsoncStr);

// JSON5
const JSON5 = require(&#39;json5&#39;);
const data = JSON5.parse(json5Str);
const str = JSON5.stringify(data, null, 2);</code></pre>
<h3>Python</h3>
<pre><code class="language-python"># pip install json5
import json5

data = json5.loads(&#39;{name: &#34;Alice&#34;, age: 25,}&#39;)
print(data)  # {&#39;name&#39;: &#39;Alice&#39;, &#39;age&#39;: 25}</code></pre>
<h2>何时使用</h2>
<table>
<thead><tr><th>格式</th><th>推荐场景</th></tr></thead>
<tbody>
<tr><td>JSON</td><td>API 数据交换、数据存储、程序间通信</td></tr>
<tr><td>JSONC</td><td>IDE 配置、有注释需求的配置</td></tr>
<tr><td>JSON5</td><td>需要灵活语法的配置文件</td></tr>
</tbody>
</table>
<p><strong>注意：</strong> API 数据交换始终使用标准 JSON。扩展格式仅用于本地配置。</p>
<h2>小结</h2>
<ul>
<li>JSONC = JSON + 注释 + 尾随逗号</li>
<li>JSON5 = JSON + 注释 + 单引号 + 无引号键 + 更多数值格式</li>
<li>API 通信始终使用标准 JSON</li>
<li>配置文件可选 JSONC 或 JSON5</li>
</ul>
`,
en: `<h1>JSON5 与 JSONC：JSON 的扩展格式</h1>
<h2>标准 JSON 的限制</h2>
<ul>
<li>不支持注释</li>
<li>不支持尾随逗号</li>
<li>键名必须双引号</li>
<li>不支持多行字符串</li>
<li>不支持十六进制数值</li>
</ul>
<h2>JSONC（JSON with Comments）</h2>
<p>JSONC 是 JSON 的超集，仅增加了注释支持，VSCode 的配置文件就使用 JSONC。</p>
<pre><code class="language-jsonc">{
  // 这是行注释
  &#34;name&#34;: &#34;my-project&#34;,
  /* 这是块注释 */
  &#34;version&#34;: &#34;1.0.0&#34;,
  &#34;scripts&#34;: {
    &#34;dev&#34;: &#34;vite&#34;,      // 开发服务器
    &#34;build&#34;: &#34;vite build&#34;
  },
  // 尾随逗号也支持
  &#34;dependencies&#34;: {
    &#34;react&#34;: &#34;^18.0.0&#34;,
  }
}</code></pre>
<p><strong>适用场景：</strong> VSCode settings.json、tsconfig.json、.vscode/*.json</p>
<h2>JSON5</h2>
<p>JSON5 是 JSON 的更大超集，目标是让 JSON 像 ECMAScript 5 一样灵活：</p>
<pre><code class="language-json5">{
  // 单行注释
  /* 块注释 */

  // 键名无需引号（如果是合法标识符）
  name: &#39;Alice&#39;,         // 单引号字符串
  age: 25,

  // 多行字符串
  bio: &#39;Hello, \\
World!&#39;,

  // 尾随逗号
  hobbies: [&#39;reading&#39;, &#39;coding&#39;,],

  // 特殊数值
  infinity: Infinity,
  nan: NaN,
  hex: 0xFF,
  leadingDot: .5,
  trailingDot: 5.,
  positiveSign: +3,
}</code></pre>
<h3>JSON5 新增特性</h3>
<table>
<thead><tr><th>特性</th><th>JSON</th><th>JSONC</th><th>JSON5</th></tr></thead>
<tbody>
<tr><td>行注释 //</td><td>❌</td><td>✅</td><td>✅</td></tr>
<tr><td>块注释 /<em> </em>/</td><td>❌</td><td>✅</td><td>✅</td></tr>
<tr><td>尾随逗号</td><td>❌</td><td>✅</td><td>✅</td></tr>
<tr><td>单引号字符串</td><td>❌</td><td>❌</td><td>✅</td></tr>
<tr><td>无引号键名</td><td>❌</td><td>❌</td><td>✅</td></tr>
<tr><td>多行字符串</td><td>❌</td><td>❌</td><td>✅</td></tr>
<tr><td>十六进制</td><td>❌</td><td>❌</td><td>✅</td></tr>
<tr><td>Infinity/NaN</td><td>❌</td><td>❌</td><td>✅</td></tr>
</tbody>
</table>
<h2>使用方式</h2>
<h3>JavaScript</h3>
<pre><code class="language-javascript">// JSONC（VSCode 内置，或使用 jsonc-parser）
const jsonc = require(&#39;jsonc-parser&#39;);
const data = jsonc.parse(jsoncStr);

// JSON5
const JSON5 = require(&#39;json5&#39;);
const data = JSON5.parse(json5Str);
const str = JSON5.stringify(data, null, 2);</code></pre>
<h3>Python</h3>
<pre><code class="language-python"># pip install json5
import json5

data = json5.loads(&#39;{name: &#34;Alice&#34;, age: 25,}&#39;)
print(data)  # {&#39;name&#39;: &#39;Alice&#39;, &#39;age&#39;: 25}</code></pre>
<h2>何时使用</h2>
<table>
<thead><tr><th>格式</th><th>推荐场景</th></tr></thead>
<tbody>
<tr><td>JSON</td><td>API 数据交换、数据存储、程序间通信</td></tr>
<tr><td>JSONC</td><td>IDE 配置、有注释需求的配置</td></tr>
<tr><td>JSON5</td><td>需要灵活语法的配置文件</td></tr>
</tbody>
</table>
<p><strong>注意：</strong> API 数据交换始终使用标准 JSON。扩展格式仅用于本地配置。</p>
<h2>小结</h2>
<ul>
<li>JSONC = JSON + 注释 + 尾随逗号</li>
<li>JSON5 = JSON + 注释 + 单引号 + 无引号键 + 更多数值格式</li>
<li>API 通信始终使用标准 JSON</li>
<li>配置文件可选 JSONC 或 JSON5</li>
</ul>
`
};

