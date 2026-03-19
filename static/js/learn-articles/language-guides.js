/* JSON Learn Articles: language-guides */
window.LEARN_ARTICLES = window.LEARN_ARTICLES || {};

window.LEARN_ARTICLES["python-json"] = {
zh: `<h1>Python JSON 完全指南：从入门到精通</h1>
<h2>Python 内置 json 模块</h2>
<p>Python 标准库的 <code>json</code> 模块提供了完整的 JSON 编解码支持，无需安装第三方库。</p>
<h2>基本操作</h2>
<h3>序列化（Python → JSON）</h3>
<pre><code class="language-python">import json

data = {
    &#34;name&#34;: &#34;张三&#34;,
    &#34;age&#34;: 28,
    &#34;skills&#34;: [&#34;Python&#34;, &#34;Go&#34;, &#34;SQL&#34;],
    &#34;isActive&#34;: True,
    &#34;address&#34;: None
}

# 基本序列化
json_str = json.dumps(data)

# 美化输出 + 支持中文
json_str = json.dumps(data, indent=2, ensure_ascii=False)
print(json_str)</code></pre>
<h3>反序列化（JSON → Python）</h3>
<pre><code class="language-python">import json

json_str = &#39;{&#34;name&#34;: &#34;Alice&#34;, &#34;age&#34;: 25, &#34;scores&#34;: [98, 85, 92]}&#39;
data = json.loads(json_str)
print(data[&#34;name&#34;])      # Alice
print(data[&#34;scores&#34;][0]) # 98
print(type(data))        # &lt;class &#39;dict&#39;&gt;</code></pre>
<h3>类型映射</h3>
<table>
<thead><tr><th>JSON 类型</th><th>Python 类型</th></tr></thead>
<tbody>
<tr><td>object</td><td>dict</td></tr>
<tr><td>array</td><td>list</td></tr>
<tr><td>string</td><td>str</td></tr>
<tr><td>number (int)</td><td>int</td></tr>
<tr><td>number (float)</td><td>float</td></tr>
<tr><td>true</td><td>True</td></tr>
<tr><td>false</td><td>False</td></tr>
<tr><td>null</td><td>None</td></tr>
</tbody>
</table>
<h2>文件读写</h2>
<h3>写入 JSON 文件</h3>
<pre><code class="language-python">import json

data = {
    &#34;users&#34;: [
        {&#34;name&#34;: &#34;Alice&#34;, &#34;age&#34;: 25, &#34;city&#34;: &#34;Beijing&#34;},
        {&#34;name&#34;: &#34;Bob&#34;, &#34;age&#34;: 30, &#34;city&#34;: &#34;Shanghai&#34;}
    ]
}

with open(&#34;users.json&#34;, &#34;w&#34;, encoding=&#34;utf-8&#34;) as f:
    json.dump(data, f, indent=2, ensure_ascii=False)</code></pre>
<h3>读取 JSON 文件</h3>
<pre><code class="language-python">import json

with open(&#34;users.json&#34;, &#34;r&#34;, encoding=&#34;utf-8&#34;) as f:
    data = json.load(f)

for user in data[&#34;users&#34;]:
    print(f&#34;{user[&#39;name&#39;]} - {user[&#39;city&#39;]}&#34;)</code></pre>
<h2>dumps() 高级参数</h2>
<pre><code class="language-python">import json

data = {&#34;z_name&#34;: &#34;Alice&#34;, &#34;a_age&#34;: 25, &#34;m_city&#34;: &#34;Beijing&#34;}

json.dumps(data,
    indent=2,              # 缩进空格数
    ensure_ascii=False,    # 允许非 ASCII 字符
    sort_keys=True,        # 键名排序
    separators=(&#39;,&#39;, &#39;: &#39;),# 自定义分隔符
    default=str            # 不可序列化类型的处理函数
)</code></pre>
<h3>separators 参数</h3>
<pre><code class="language-python"># 默认（美化模式）
json.dumps(data, separators=(&#39;, &#39;, &#39;: &#39;))

# 紧凑模式（最小体积）
json.dumps(data, separators=(&#39;,&#39;, &#39;:&#39;))</code></pre>
<h2>处理自定义对象</h2>
<h3>方法 1：default 参数</h3>
<pre><code class="language-python">import json
from datetime import datetime, date
from decimal import Decimal
from enum import Enum

class UserRole(Enum):
    ADMIN = &#34;admin&#34;
    USER = &#34;user&#34;

def json_serializer(obj):
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    if isinstance(obj, Decimal):
        return str(obj)
    if isinstance(obj, set):
        return sorted(list(obj))
    if isinstance(obj, Enum):
        return obj.value
    if isinstance(obj, bytes):
        import base64
        return base64.b64encode(obj).decode(&#39;utf-8&#39;)
    raise TypeError(f&#34;Type {type(obj)} is not JSON serializable&#34;)

data = {
    &#34;timestamp&#34;: datetime.now(),
    &#34;amount&#34;: Decimal(&#34;99.99&#34;),
    &#34;tags&#34;: {&#34;python&#34;, &#34;json&#34;},
    &#34;role&#34;: UserRole.ADMIN
}

print(json.dumps(data, default=json_serializer, indent=2))</code></pre>
<h3>方法 2：自定义 JSONEncoder</h3>
<pre><code class="language-python">import json
from datetime import datetime

class CustomEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        if isinstance(obj, set):
            return list(obj)
        return super().default(obj)

data = {&#34;time&#34;: datetime.now(), &#34;items&#34;: {1, 2, 3}}
print(json.dumps(data, cls=CustomEncoder, indent=2))</code></pre>
<h3>方法 3：to_dict 模式</h3>
<pre><code class="language-python">import json

class User:
    def __init__(self, name, email):
        self.name = name
        self.email = email

    def to_dict(self):
        return {&#34;name&#34;: self.name, &#34;email&#34;: self.email}

user = User(&#34;Alice&#34;, &#34;alice@example.com&#34;)
print(json.dumps(user.to_dict(), indent=2))</code></pre>
<h2>反序列化高级用法</h2>
<h3>object_hook：自定义解码</h3>
<pre><code class="language-python">import json
from datetime import datetime

def custom_decoder(dct):
    for key, value in dct.items():
        if isinstance(value, str):
            try:
                dct[key] = datetime.fromisoformat(value)
            except (ValueError, TypeError):
                pass
    return dct

json_str = &#39;{&#34;name&#34;: &#34;Alice&#34;, &#34;createdAt&#34;: &#34;2025-01-15T10:30:00&#34;}&#39;
data = json.loads(json_str, object_hook=custom_decoder)
print(type(data[&#34;createdAt&#34;]))  # &lt;class &#39;datetime.datetime&#39;&gt;</code></pre>
<h3>object_pairs_hook：检测重复键</h3>
<pre><code class="language-python">import json

def detect_duplicates(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f&#34;Duplicate key: {key}&#34;)
        result[key] = value
    return result

try:
    data = json.loads(&#39;{&#34;name&#34;: &#34;Alice&#34;, &#34;name&#34;: &#34;Bob&#34;}&#39;, object_pairs_hook=detect_duplicates)
except ValueError as e:
    print(e)  # Duplicate key: name</code></pre>
<h2>错误处理</h2>
<pre><code class="language-python">import json

def safe_parse(json_string):
    try:
        return json.loads(json_string), None
    except json.JSONDecodeError as e:
        return None, {
            &#34;message&#34;: e.msg,
            &#34;line&#34;: e.lineno,
            &#34;column&#34;: e.colno,
            &#34;position&#34;: e.pos
        }

data, error = safe_parse(&#39;{&#34;name&#34;: &#34;Alice&#34;,}&#39;)
if error:
    print(f&#34;Line {error[&#39;line&#39;]}, Col {error[&#39;column&#39;]}: {error[&#39;message&#39;]}&#34;)</code></pre>
<h2>性能优化</h2>
<h3>大文件流式处理</h3>
<pre><code class="language-python">import json

def read_ndjson(filepath):
    with open(filepath, &#34;r&#34;, encoding=&#34;utf-8&#34;) as f:
        for line in f:
            line = line.strip()
            if line:
                yield json.loads(line)

for record in read_ndjson(&#34;large_data.ndjson&#34;):
    process(record)</code></pre>
<h3>使用 orjson 提升性能</h3>
<pre><code class="language-python"># pip install orjson
import orjson

data = {&#34;name&#34;: &#34;Alice&#34;, &#34;values&#34;: list(range(10000))}
json_bytes = orjson.dumps(data, option=orjson.OPT_INDENT_2)
parsed = orjson.loads(json_bytes)</code></pre>
<h3>性能对比</h3>
<table>
<thead><tr><th>库</th><th>序列化速度</th><th>反序列化速度</th><th>特点</th></tr></thead>
<tbody>
<tr><td>json（标准库）</td><td>1x</td><td>1x</td><td>无需安装</td></tr>
<tr><td>ujson</td><td>2-4x</td><td>2-3x</td><td>C 扩展</td></tr>
<tr><td>orjson</td><td>3-10x</td><td>2-5x</td><td>Rust 扩展，最快</td></tr>
<tr><td>simplejson</td><td>1-2x</td><td>1-2x</td><td>json 的增强版</td></tr>
</tbody>
</table>
<h2>常见陷阱</h2>
<h3>陷阱 1：元组变列表</h3>
<pre><code class="language-python">data = {&#34;coords&#34;: (39.9, 116.4)}
json.dumps(data)  # {&#34;coords&#34;: [39.9, 116.4]}  元组被转换为数组</code></pre>
<h3>陷阱 2：字典键类型</h3>
<pre><code class="language-python">data = {1: &#34;one&#34;, 2: &#34;two&#34;}
json.dumps(data)  # {&#34;1&#34;: &#34;one&#34;, &#34;2&#34;: &#34;two&#34;}  整数键变字符串</code></pre>
<h3>陷阱 3：浮点精度</h3>
<pre><code class="language-python">json.dumps({&#34;value&#34;: 0.1 + 0.2})  # {&#34;value&#34;: 0.30000000000000004}</code></pre>
<h2>小结</h2>
<ul>
<li><code>json.dumps()</code> / <code>json.dump()</code> 用于序列化</li>
<li><code>json.loads()</code> / <code>json.load()</code> 用于反序列化</li>
<li><code>ensure_ascii=False</code> 支持中文直接输出</li>
<li>自定义类型用 <code>default</code> 参数或 <code>JSONEncoder</code> 子类</li>
<li>生产环境考虑 <code>orjson</code> 提升性能</li>
<li>注意元组→列表、整数键→字符串键的隐式转换</li>
</ul>
`,
en: `<h1>Python JSON 完全指南：从入门到精通</h1>
<h2>Python 内置 json 模块</h2>
<p>Python 标准库的 <code>json</code> 模块提供了完整的 JSON 编解码支持，无需安装第三方库。</p>
<h2>基本操作</h2>
<h3>序列化（Python → JSON）</h3>
<pre><code class="language-python">import json

data = {
    &#34;name&#34;: &#34;张三&#34;,
    &#34;age&#34;: 28,
    &#34;skills&#34;: [&#34;Python&#34;, &#34;Go&#34;, &#34;SQL&#34;],
    &#34;isActive&#34;: True,
    &#34;address&#34;: None
}

# 基本序列化
json_str = json.dumps(data)

# 美化输出 + 支持中文
json_str = json.dumps(data, indent=2, ensure_ascii=False)
print(json_str)</code></pre>
<h3>反序列化（JSON → Python）</h3>
<pre><code class="language-python">import json

json_str = &#39;{&#34;name&#34;: &#34;Alice&#34;, &#34;age&#34;: 25, &#34;scores&#34;: [98, 85, 92]}&#39;
data = json.loads(json_str)
print(data[&#34;name&#34;])      # Alice
print(data[&#34;scores&#34;][0]) # 98
print(type(data))        # &lt;class &#39;dict&#39;&gt;</code></pre>
<h3>类型映射</h3>
<table>
<thead><tr><th>JSON 类型</th><th>Python 类型</th></tr></thead>
<tbody>
<tr><td>object</td><td>dict</td></tr>
<tr><td>array</td><td>list</td></tr>
<tr><td>string</td><td>str</td></tr>
<tr><td>number (int)</td><td>int</td></tr>
<tr><td>number (float)</td><td>float</td></tr>
<tr><td>true</td><td>True</td></tr>
<tr><td>false</td><td>False</td></tr>
<tr><td>null</td><td>None</td></tr>
</tbody>
</table>
<h2>文件读写</h2>
<h3>写入 JSON 文件</h3>
<pre><code class="language-python">import json

data = {
    &#34;users&#34;: [
        {&#34;name&#34;: &#34;Alice&#34;, &#34;age&#34;: 25, &#34;city&#34;: &#34;Beijing&#34;},
        {&#34;name&#34;: &#34;Bob&#34;, &#34;age&#34;: 30, &#34;city&#34;: &#34;Shanghai&#34;}
    ]
}

with open(&#34;users.json&#34;, &#34;w&#34;, encoding=&#34;utf-8&#34;) as f:
    json.dump(data, f, indent=2, ensure_ascii=False)</code></pre>
<h3>读取 JSON 文件</h3>
<pre><code class="language-python">import json

with open(&#34;users.json&#34;, &#34;r&#34;, encoding=&#34;utf-8&#34;) as f:
    data = json.load(f)

for user in data[&#34;users&#34;]:
    print(f&#34;{user[&#39;name&#39;]} - {user[&#39;city&#39;]}&#34;)</code></pre>
<h2>dumps() 高级参数</h2>
<pre><code class="language-python">import json

data = {&#34;z_name&#34;: &#34;Alice&#34;, &#34;a_age&#34;: 25, &#34;m_city&#34;: &#34;Beijing&#34;}

json.dumps(data,
    indent=2,              # 缩进空格数
    ensure_ascii=False,    # 允许非 ASCII 字符
    sort_keys=True,        # 键名排序
    separators=(&#39;,&#39;, &#39;: &#39;),# 自定义分隔符
    default=str            # 不可序列化类型的处理函数
)</code></pre>
<h3>separators 参数</h3>
<pre><code class="language-python"># 默认（美化模式）
json.dumps(data, separators=(&#39;, &#39;, &#39;: &#39;))

# 紧凑模式（最小体积）
json.dumps(data, separators=(&#39;,&#39;, &#39;:&#39;))</code></pre>
<h2>处理自定义对象</h2>
<h3>方法 1：default 参数</h3>
<pre><code class="language-python">import json
from datetime import datetime, date
from decimal import Decimal
from enum import Enum

class UserRole(Enum):
    ADMIN = &#34;admin&#34;
    USER = &#34;user&#34;

def json_serializer(obj):
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    if isinstance(obj, Decimal):
        return str(obj)
    if isinstance(obj, set):
        return sorted(list(obj))
    if isinstance(obj, Enum):
        return obj.value
    if isinstance(obj, bytes):
        import base64
        return base64.b64encode(obj).decode(&#39;utf-8&#39;)
    raise TypeError(f&#34;Type {type(obj)} is not JSON serializable&#34;)

data = {
    &#34;timestamp&#34;: datetime.now(),
    &#34;amount&#34;: Decimal(&#34;99.99&#34;),
    &#34;tags&#34;: {&#34;python&#34;, &#34;json&#34;},
    &#34;role&#34;: UserRole.ADMIN
}

print(json.dumps(data, default=json_serializer, indent=2))</code></pre>
<h3>方法 2：自定义 JSONEncoder</h3>
<pre><code class="language-python">import json
from datetime import datetime

class CustomEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        if isinstance(obj, set):
            return list(obj)
        return super().default(obj)

data = {&#34;time&#34;: datetime.now(), &#34;items&#34;: {1, 2, 3}}
print(json.dumps(data, cls=CustomEncoder, indent=2))</code></pre>
<h3>方法 3：to_dict 模式</h3>
<pre><code class="language-python">import json

class User:
    def __init__(self, name, email):
        self.name = name
        self.email = email

    def to_dict(self):
        return {&#34;name&#34;: self.name, &#34;email&#34;: self.email}

user = User(&#34;Alice&#34;, &#34;alice@example.com&#34;)
print(json.dumps(user.to_dict(), indent=2))</code></pre>
<h2>反序列化高级用法</h2>
<h3>object_hook：自定义解码</h3>
<pre><code class="language-python">import json
from datetime import datetime

def custom_decoder(dct):
    for key, value in dct.items():
        if isinstance(value, str):
            try:
                dct[key] = datetime.fromisoformat(value)
            except (ValueError, TypeError):
                pass
    return dct

json_str = &#39;{&#34;name&#34;: &#34;Alice&#34;, &#34;createdAt&#34;: &#34;2025-01-15T10:30:00&#34;}&#39;
data = json.loads(json_str, object_hook=custom_decoder)
print(type(data[&#34;createdAt&#34;]))  # &lt;class &#39;datetime.datetime&#39;&gt;</code></pre>
<h3>object_pairs_hook：检测重复键</h3>
<pre><code class="language-python">import json

def detect_duplicates(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f&#34;Duplicate key: {key}&#34;)
        result[key] = value
    return result

try:
    data = json.loads(&#39;{&#34;name&#34;: &#34;Alice&#34;, &#34;name&#34;: &#34;Bob&#34;}&#39;, object_pairs_hook=detect_duplicates)
except ValueError as e:
    print(e)  # Duplicate key: name</code></pre>
<h2>错误处理</h2>
<pre><code class="language-python">import json

def safe_parse(json_string):
    try:
        return json.loads(json_string), None
    except json.JSONDecodeError as e:
        return None, {
            &#34;message&#34;: e.msg,
            &#34;line&#34;: e.lineno,
            &#34;column&#34;: e.colno,
            &#34;position&#34;: e.pos
        }

data, error = safe_parse(&#39;{&#34;name&#34;: &#34;Alice&#34;,}&#39;)
if error:
    print(f&#34;Line {error[&#39;line&#39;]}, Col {error[&#39;column&#39;]}: {error[&#39;message&#39;]}&#34;)</code></pre>
<h2>性能优化</h2>
<h3>大文件流式处理</h3>
<pre><code class="language-python">import json

def read_ndjson(filepath):
    with open(filepath, &#34;r&#34;, encoding=&#34;utf-8&#34;) as f:
        for line in f:
            line = line.strip()
            if line:
                yield json.loads(line)

for record in read_ndjson(&#34;large_data.ndjson&#34;):
    process(record)</code></pre>
<h3>使用 orjson 提升性能</h3>
<pre><code class="language-python"># pip install orjson
import orjson

data = {&#34;name&#34;: &#34;Alice&#34;, &#34;values&#34;: list(range(10000))}
json_bytes = orjson.dumps(data, option=orjson.OPT_INDENT_2)
parsed = orjson.loads(json_bytes)</code></pre>
<h3>性能对比</h3>
<table>
<thead><tr><th>库</th><th>序列化速度</th><th>反序列化速度</th><th>特点</th></tr></thead>
<tbody>
<tr><td>json（标准库）</td><td>1x</td><td>1x</td><td>无需安装</td></tr>
<tr><td>ujson</td><td>2-4x</td><td>2-3x</td><td>C 扩展</td></tr>
<tr><td>orjson</td><td>3-10x</td><td>2-5x</td><td>Rust 扩展，最快</td></tr>
<tr><td>simplejson</td><td>1-2x</td><td>1-2x</td><td>json 的增强版</td></tr>
</tbody>
</table>
<h2>常见陷阱</h2>
<h3>陷阱 1：元组变列表</h3>
<pre><code class="language-python">data = {&#34;coords&#34;: (39.9, 116.4)}
json.dumps(data)  # {&#34;coords&#34;: [39.9, 116.4]}  元组被转换为数组</code></pre>
<h3>陷阱 2：字典键类型</h3>
<pre><code class="language-python">data = {1: &#34;one&#34;, 2: &#34;two&#34;}
json.dumps(data)  # {&#34;1&#34;: &#34;one&#34;, &#34;2&#34;: &#34;two&#34;}  整数键变字符串</code></pre>
<h3>陷阱 3：浮点精度</h3>
<pre><code class="language-python">json.dumps({&#34;value&#34;: 0.1 + 0.2})  # {&#34;value&#34;: 0.30000000000000004}</code></pre>
<h2>小结</h2>
<ul>
<li><code>json.dumps()</code> / <code>json.dump()</code> 用于序列化</li>
<li><code>json.loads()</code> / <code>json.load()</code> 用于反序列化</li>
<li><code>ensure_ascii=False</code> 支持中文直接输出</li>
<li>自定义类型用 <code>default</code> 参数或 <code>JSONEncoder</code> 子类</li>
<li>生产环境考虑 <code>orjson</code> 提升性能</li>
<li>注意元组→列表、整数键→字符串键的隐式转换</li>
</ul>
`
};

window.LEARN_ARTICLES["javascript-json"] = {
zh: `<h1>JavaScript JSON 操作大全</h1>
<h2>JavaScript 与 JSON 的天然关系</h2>
<p>JSON 源自 JavaScript 对象语法，因此 JS 对 JSON 的支持最为自然。全局对象 <code>JSON</code> 提供了两个核心方法。</p>
<h2>JSON.parse()</h2>
<h3>基本用法</h3>
<pre><code class="language-javascript">const jsonStr = &#39;{&#34;name&#34;: &#34;Alice&#34;, &#34;age&#34;: 25, &#34;hobbies&#34;: [&#34;reading&#34;, &#34;coding&#34;]}&#39;;
const obj = JSON.parse(jsonStr);
console.log(obj.name);       // &#34;Alice&#34;
console.log(obj.hobbies[0]); // &#34;reading&#34;</code></pre>
<h3>reviver 函数</h3>
<pre><code class="language-javascript">const jsonStr = &#39;{&#34;name&#34;: &#34;Alice&#34;, &#34;birthday&#34;: &#34;1999-03-15T00:00:00.000Z&#34;}&#39;;
const data = JSON.parse(jsonStr, (key, value) =&gt; {
  if (typeof value === &#39;string&#39; &amp;&amp; /^\\d{4}-\\d{2}-\\d{2}T/.test(value)) {
    return new Date(value);
  }
  return value;
});
console.log(data.birthday instanceof Date); // true</code></pre>
<h3>安全解析</h3>
<pre><code class="language-javascript">function safeParse(jsonStr, fallback = null) {
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error(&#39;JSON parse error:&#39;, e.message);
    return fallback;
  }
}</code></pre>
<h2>JSON.stringify()</h2>
<h3>基本用法</h3>
<pre><code class="language-javascript">const obj = { name: &#34;Alice&#34;, age: 25 };
JSON.stringify(obj);           // &#39;{&#34;name&#34;:&#34;Alice&#34;,&#34;age&#34;:25}&#39;
JSON.stringify(obj, null, 2);  // 美化输出</code></pre>
<h3>replacer 参数</h3>
<pre><code class="language-javascript">const user = { name: &#34;Alice&#34;, password: &#34;secret&#34;, email: &#34;alice@example.com&#34; };

// 数组方式：只保留指定字段
JSON.stringify(user, [&#34;name&#34;, &#34;email&#34;], 2);

// 函数方式：自定义逻辑
JSON.stringify(user, (key, value) =&gt; {
  if (key === &#39;password&#39;) return undefined;
  return value;
}, 2);</code></pre>
<h3>toJSON() 方法</h3>
<pre><code class="language-javascript">class User {
  constructor(name, password) {
    this.name = name;
    this.password = password;
    this.createdAt = new Date();
  }
  toJSON() {
    return { name: this.name, createdAt: this.createdAt.toISOString() };
  }
}
const user = new User(&#34;Alice&#34;, &#34;secret&#34;);
console.log(JSON.stringify(user, null, 2));</code></pre>
<h2>Fetch API 中的 JSON</h2>
<h3>GET 请求</h3>
<pre><code class="language-javascript">async function fetchUsers() {
  const response = await fetch(&#39;https://api.example.com/users&#39;);
  if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
  return response.json();
}</code></pre>
<h3>POST 请求</h3>
<pre><code class="language-javascript">async function createUser(userData) {
  const response = await fetch(&#39;https://api.example.com/users&#39;, {
    method: &#39;POST&#39;,
    headers: { &#39;Content-Type&#39;: &#39;application/json&#39; },
    body: JSON.stringify(userData),
  });
  return response.json();
}</code></pre>
<h2>深拷贝</h2>
<pre><code class="language-javascript">// JSON 方式（简单但有限制）
const clone = JSON.parse(JSON.stringify(original));

// 推荐：structuredClone（现代浏览器）
const clone2 = structuredClone(original);</code></pre>
<h2>不可序列化的类型</h2>
<pre><code class="language-javascript">JSON.stringify({
  func: function() {},     // 被忽略
  undef: undefined,        // 被忽略
  sym: Symbol(&#39;id&#39;),       // 被忽略
  inf: Infinity,           // null
  nan: NaN,                // null
  date: new Date(),        // ISO 字符串
  regex: /pattern/gi,      // {}
  map: new Map(),          // {}
  set: new Set(),          // {}
});
// BigInt 默认抛 TypeError</code></pre>
<h3>BigInt 处理</h3>
<pre><code class="language-javascript">JSON.stringify(data, (key, value) =&gt;
  typeof value === &#39;bigint&#39; ? value.toString() : value
);</code></pre>
<h3>循环引用处理</h3>
<pre><code class="language-javascript">function stringifyCircular(obj) {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) =&gt; {
    if (typeof value === &#39;object&#39; &amp;&amp; value !== null) {
      if (seen.has(value)) return &#39;[Circular]&#39;;
      seen.add(value);
    }
    return value;
  }, 2);
}</code></pre>
<h2>小结</h2>
<ul>
<li><code>JSON.parse(str, reviver)</code> 解析 JSON 字符串</li>
<li><code>JSON.stringify(obj, replacer, space)</code> 序列化为 JSON</li>
<li><code>reviver</code> 在解析时转换值（如日期字符串→Date）</li>
<li><code>replacer</code> 过滤/转换序列化输出</li>
<li><code>toJSON()</code> 自定义对象的序列化行为</li>
<li>注意 BigInt、循环引用、Map/Set 等不可直接序列化</li>
</ul>
`,
en: `<h1>JavaScript JSON 操作大全</h1>
<h2>JavaScript 与 JSON 的天然关系</h2>
<p>JSON 源自 JavaScript 对象语法，因此 JS 对 JSON 的支持最为自然。全局对象 <code>JSON</code> 提供了两个核心方法。</p>
<h2>JSON.parse()</h2>
<h3>基本用法</h3>
<pre><code class="language-javascript">const jsonStr = &#39;{&#34;name&#34;: &#34;Alice&#34;, &#34;age&#34;: 25, &#34;hobbies&#34;: [&#34;reading&#34;, &#34;coding&#34;]}&#39;;
const obj = JSON.parse(jsonStr);
console.log(obj.name);       // &#34;Alice&#34;
console.log(obj.hobbies[0]); // &#34;reading&#34;</code></pre>
<h3>reviver 函数</h3>
<pre><code class="language-javascript">const jsonStr = &#39;{&#34;name&#34;: &#34;Alice&#34;, &#34;birthday&#34;: &#34;1999-03-15T00:00:00.000Z&#34;}&#39;;
const data = JSON.parse(jsonStr, (key, value) =&gt; {
  if (typeof value === &#39;string&#39; &amp;&amp; /^\\d{4}-\\d{2}-\\d{2}T/.test(value)) {
    return new Date(value);
  }
  return value;
});
console.log(data.birthday instanceof Date); // true</code></pre>
<h3>安全解析</h3>
<pre><code class="language-javascript">function safeParse(jsonStr, fallback = null) {
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error(&#39;JSON parse error:&#39;, e.message);
    return fallback;
  }
}</code></pre>
<h2>JSON.stringify()</h2>
<h3>基本用法</h3>
<pre><code class="language-javascript">const obj = { name: &#34;Alice&#34;, age: 25 };
JSON.stringify(obj);           // &#39;{&#34;name&#34;:&#34;Alice&#34;,&#34;age&#34;:25}&#39;
JSON.stringify(obj, null, 2);  // 美化输出</code></pre>
<h3>replacer 参数</h3>
<pre><code class="language-javascript">const user = { name: &#34;Alice&#34;, password: &#34;secret&#34;, email: &#34;alice@example.com&#34; };

// 数组方式：只保留指定字段
JSON.stringify(user, [&#34;name&#34;, &#34;email&#34;], 2);

// 函数方式：自定义逻辑
JSON.stringify(user, (key, value) =&gt; {
  if (key === &#39;password&#39;) return undefined;
  return value;
}, 2);</code></pre>
<h3>toJSON() 方法</h3>
<pre><code class="language-javascript">class User {
  constructor(name, password) {
    this.name = name;
    this.password = password;
    this.createdAt = new Date();
  }
  toJSON() {
    return { name: this.name, createdAt: this.createdAt.toISOString() };
  }
}
const user = new User(&#34;Alice&#34;, &#34;secret&#34;);
console.log(JSON.stringify(user, null, 2));</code></pre>
<h2>Fetch API 中的 JSON</h2>
<h3>GET 请求</h3>
<pre><code class="language-javascript">async function fetchUsers() {
  const response = await fetch(&#39;https://api.example.com/users&#39;);
  if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
  return response.json();
}</code></pre>
<h3>POST 请求</h3>
<pre><code class="language-javascript">async function createUser(userData) {
  const response = await fetch(&#39;https://api.example.com/users&#39;, {
    method: &#39;POST&#39;,
    headers: { &#39;Content-Type&#39;: &#39;application/json&#39; },
    body: JSON.stringify(userData),
  });
  return response.json();
}</code></pre>
<h2>深拷贝</h2>
<pre><code class="language-javascript">// JSON 方式（简单但有限制）
const clone = JSON.parse(JSON.stringify(original));

// 推荐：structuredClone（现代浏览器）
const clone2 = structuredClone(original);</code></pre>
<h2>不可序列化的类型</h2>
<pre><code class="language-javascript">JSON.stringify({
  func: function() {},     // 被忽略
  undef: undefined,        // 被忽略
  sym: Symbol(&#39;id&#39;),       // 被忽略
  inf: Infinity,           // null
  nan: NaN,                // null
  date: new Date(),        // ISO 字符串
  regex: /pattern/gi,      // {}
  map: new Map(),          // {}
  set: new Set(),          // {}
});
// BigInt 默认抛 TypeError</code></pre>
<h3>BigInt 处理</h3>
<pre><code class="language-javascript">JSON.stringify(data, (key, value) =&gt;
  typeof value === &#39;bigint&#39; ? value.toString() : value
);</code></pre>
<h3>循环引用处理</h3>
<pre><code class="language-javascript">function stringifyCircular(obj) {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) =&gt; {
    if (typeof value === &#39;object&#39; &amp;&amp; value !== null) {
      if (seen.has(value)) return &#39;[Circular]&#39;;
      seen.add(value);
    }
    return value;
  }, 2);
}</code></pre>
<h2>小结</h2>
<ul>
<li><code>JSON.parse(str, reviver)</code> 解析 JSON 字符串</li>
<li><code>JSON.stringify(obj, replacer, space)</code> 序列化为 JSON</li>
<li><code>reviver</code> 在解析时转换值（如日期字符串→Date）</li>
<li><code>replacer</code> 过滤/转换序列化输出</li>
<li><code>toJSON()</code> 自定义对象的序列化行为</li>
<li>注意 BigInt、循环引用、Map/Set 等不可直接序列化</li>
</ul>
`
};

window.LEARN_ARTICLES["java-json"] = {
zh: `<h1>Java JSON 处理：Gson 与 Jackson 实战</h1>
<h2>Java 中的 JSON 库选型</h2>
<table>
<thead><tr><th>特性</th><th>Gson</th><th>Jackson</th></tr></thead>
<tbody>
<tr><td>开发者</td><td>Google</td><td>FasterXML</td></tr>
<tr><td>性能</td><td>中等</td><td>高</td></tr>
<tr><td>Spring 集成</td><td>可用</td><td>默认集成</td></tr>
</tbody>
</table>
<h2>Gson 基础</h2>
<pre><code class="language-xml">&lt;dependency&gt;
    &lt;groupId&gt;com.google.code.gson&lt;/groupId&gt;
    &lt;artifactId&gt;gson&lt;/artifactId&gt;
    &lt;version&gt;2.11.0&lt;/version&gt;
&lt;/dependency&gt;</code></pre>
<pre><code class="language-java">import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

Gson gson = new GsonBuilder().setPrettyPrinting().create();

// 序列化
User user = new User(&#34;Alice&#34;, 25, &#34;alice@example.com&#34;);
String json = gson.toJson(user);

// 反序列化
User parsed = gson.fromJson(jsonStr, User.class);

// 处理泛型
Type listType = new TypeToken&lt;List&lt;User&gt;&gt;(){}.getType();
List&lt;User&gt; users = gson.fromJson(jsonArray, listType);</code></pre>
<h2>Jackson 基础</h2>
<pre><code class="language-xml">&lt;dependency&gt;
    &lt;groupId&gt;com.fasterxml.jackson.core&lt;/groupId&gt;
    &lt;artifactId&gt;jackson-databind&lt;/artifactId&gt;
    &lt;version&gt;2.17.0&lt;/version&gt;
&lt;/dependency&gt;</code></pre>
<pre><code class="language-java">import com.fasterxml.jackson.databind.ObjectMapper;

ObjectMapper mapper = new ObjectMapper();
mapper.enable(SerializationFeature.INDENT_OUTPUT);

// 序列化与反序列化
String json = mapper.writeValueAsString(user);
User parsed = mapper.readValue(json, User.class);

// 树模型
JsonNode root = mapper.readTree(json);
String name = root.get(&#34;name&#34;).asText();</code></pre>
<h3>Jackson 注解</h3>
<pre><code class="language-java">public class User {
    @JsonProperty(&#34;user_name&#34;)
    private String name;

    @JsonIgnore
    private String password;

    @JsonFormat(pattern = &#34;yyyy-MM-dd HH:mm:ss&#34;)
    private LocalDateTime createdAt;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String nickname;
}</code></pre>
<h2>错误处理</h2>
<pre><code class="language-java">try {
    User user = mapper.readValue(invalidJson, User.class);
} catch (JsonProcessingException e) {
    System.err.println(&#34;位置: 行 &#34; + e.getLocation().getLineNr());
}</code></pre>
<h2>小结</h2>
<ul>
<li>Gson 简单易用，适合快速开发</li>
<li>Jackson 性能更好，Spring 默认集成</li>
<li>建议新项目使用 Jackson</li>
<li>使用 TypeToken/TypeReference 处理泛型</li>
</ul>
`,
en: `<h1>Java JSON 处理：Gson 与 Jackson 实战</h1>
<h2>Java 中的 JSON 库选型</h2>
<table>
<thead><tr><th>特性</th><th>Gson</th><th>Jackson</th></tr></thead>
<tbody>
<tr><td>开发者</td><td>Google</td><td>FasterXML</td></tr>
<tr><td>性能</td><td>中等</td><td>高</td></tr>
<tr><td>Spring 集成</td><td>可用</td><td>默认集成</td></tr>
</tbody>
</table>
<h2>Gson 基础</h2>
<pre><code class="language-xml">&lt;dependency&gt;
    &lt;groupId&gt;com.google.code.gson&lt;/groupId&gt;
    &lt;artifactId&gt;gson&lt;/artifactId&gt;
    &lt;version&gt;2.11.0&lt;/version&gt;
&lt;/dependency&gt;</code></pre>
<pre><code class="language-java">import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

Gson gson = new GsonBuilder().setPrettyPrinting().create();

// 序列化
User user = new User(&#34;Alice&#34;, 25, &#34;alice@example.com&#34;);
String json = gson.toJson(user);

// 反序列化
User parsed = gson.fromJson(jsonStr, User.class);

// 处理泛型
Type listType = new TypeToken&lt;List&lt;User&gt;&gt;(){}.getType();
List&lt;User&gt; users = gson.fromJson(jsonArray, listType);</code></pre>
<h2>Jackson 基础</h2>
<pre><code class="language-xml">&lt;dependency&gt;
    &lt;groupId&gt;com.fasterxml.jackson.core&lt;/groupId&gt;
    &lt;artifactId&gt;jackson-databind&lt;/artifactId&gt;
    &lt;version&gt;2.17.0&lt;/version&gt;
&lt;/dependency&gt;</code></pre>
<pre><code class="language-java">import com.fasterxml.jackson.databind.ObjectMapper;

ObjectMapper mapper = new ObjectMapper();
mapper.enable(SerializationFeature.INDENT_OUTPUT);

// 序列化与反序列化
String json = mapper.writeValueAsString(user);
User parsed = mapper.readValue(json, User.class);

// 树模型
JsonNode root = mapper.readTree(json);
String name = root.get(&#34;name&#34;).asText();</code></pre>
<h3>Jackson 注解</h3>
<pre><code class="language-java">public class User {
    @JsonProperty(&#34;user_name&#34;)
    private String name;

    @JsonIgnore
    private String password;

    @JsonFormat(pattern = &#34;yyyy-MM-dd HH:mm:ss&#34;)
    private LocalDateTime createdAt;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String nickname;
}</code></pre>
<h2>错误处理</h2>
<pre><code class="language-java">try {
    User user = mapper.readValue(invalidJson, User.class);
} catch (JsonProcessingException e) {
    System.err.println(&#34;位置: 行 &#34; + e.getLocation().getLineNr());
}</code></pre>
<h2>小结</h2>
<ul>
<li>Gson 简单易用，适合快速开发</li>
<li>Jackson 性能更好，Spring 默认集成</li>
<li>建议新项目使用 Jackson</li>
<li>使用 TypeToken/TypeReference 处理泛型</li>
</ul>
`
};

window.LEARN_ARTICLES["go-json"] = {
zh: `<h1>Go 语言 JSON 编解码完全指南</h1>
<h2>Go 标准库 encoding/json</h2>
<pre><code class="language-go">import &#34;encoding/json&#34;

type User struct {
    Name   string   \`json:&#34;name&#34;\`
    Age    int      \`json:&#34;age&#34;\`
    Email  string   \`json:&#34;email&#34;\`
    Skills []string \`json:&#34;skills&#34;\`
}

// 序列化
user := User{Name: &#34;Alice&#34;, Age: 25, Email: &#34;alice@example.com&#34;}
data, _ := json.MarshalIndent(user, &#34;&#34;, &#34;  &#34;)

// 反序列化
var parsed User
json.Unmarshal([]byte(jsonStr), &amp;parsed)</code></pre>
<h2>Struct Tag 详解</h2>
<pre><code class="language-go">type Product struct {
    ID      int64   \`json:&#34;id&#34;\`
    Name    string  \`json:&#34;name&#34;\`
    Stock   int     \`json:&#34;stock,omitempty&#34;\`  // 零值时省略
    Deleted bool    \`json:&#34;-&#34;\`                // 始终忽略
}</code></pre>
<h3>omitempty 行为</h3>
<table>
<thead><tr><th>类型</th><th>零值</th></tr></thead>
<tbody>
<tr><td>string</td><td><code>&#34;&#34;</code></td></tr>
<tr><td>int/float</td><td><code>0</code></td></tr>
<tr><td>bool</td><td><code>false</code></td></tr>
<tr><td>pointer</td><td><code>nil</code></td></tr>
<tr><td>slice</td><td><code>nil</code>（空切片不省略）</td></tr>
</tbody>
</table>
<h2>动态 JSON</h2>
<h3>map[string]interface{}</h3>
<pre><code class="language-go">var result map[string]interface{}
json.Unmarshal([]byte(jsonStr), &amp;result)
name := result[&#34;name&#34;].(string)
age := result[&#34;age&#34;].(float64)  // 数值默认 float64</code></pre>
<h3>json.RawMessage 延迟解析</h3>
<pre><code class="language-go">type Event struct {
    Type    string          \`json:&#34;type&#34;\`
    Payload json.RawMessage \`json:&#34;payload&#34;\`
}

var event Event
json.Unmarshal(data, &amp;event)
switch event.Type {
case &#34;user_created&#34;:
    var user User
    json.Unmarshal(event.Payload, &amp;user)
}</code></pre>
<h3>json.Number 精确数值</h3>
<pre><code class="language-go">decoder := json.NewDecoder(strings.NewReader(jsonStr))
decoder.UseNumber()
var result map[string]interface{}
decoder.Decode(&amp;result)
num := result[&#34;id&#34;].(json.Number)
id, _ := num.Int64()</code></pre>
<h2>自定义 Marshaler/Unmarshaler</h2>
<pre><code class="language-go">type Timestamp struct{ time.Time }

func (t Timestamp) MarshalJSON() ([]byte, error) {
    return json.Marshal(t.Unix())
}

func (t *Timestamp) UnmarshalJSON(data []byte) error {
    var unix int64
    if err := json.Unmarshal(data, &amp;unix); err != nil {
        return err
    }
    t.Time = time.Unix(unix, 0)
    return nil
}</code></pre>
<h2>流式编解码</h2>
<pre><code class="language-go">// HTTP 响应
func handler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set(&#34;Content-Type&#34;, &#34;application/json&#34;)
    json.NewEncoder(w).Encode(map[string]string{&#34;status&#34;: &#34;ok&#34;})
}</code></pre>
<h2>高性能替代库</h2>
<table>
<thead><tr><th>库</th><th>速度提升</th></tr></thead>
<tbody>
<tr><td>json-iterator/go</td><td>2-3x</td></tr>
<tr><td>bytedance/sonic</td><td>3-5x</td></tr>
<tr><td>goccy/go-json</td><td>2-4x</td></tr>
</tbody>
</table>
<h2>小结</h2>
<ul>
<li>struct tag 控制字段映射和序列化行为</li>
<li><code>omitempty</code> 省略零值，<code>-</code> 忽略字段</li>
<li><code>json.RawMessage</code> 延迟解析多态数据</li>
<li><code>json.Number</code> 避免大整数精度丢失</li>
<li>高性能场景使用 json-iterator 或 sonic</li>
</ul>
`,
en: `<h1>Go 语言 JSON 编解码完全指南</h1>
<h2>Go 标准库 encoding/json</h2>
<pre><code class="language-go">import &#34;encoding/json&#34;

type User struct {
    Name   string   \`json:&#34;name&#34;\`
    Age    int      \`json:&#34;age&#34;\`
    Email  string   \`json:&#34;email&#34;\`
    Skills []string \`json:&#34;skills&#34;\`
}

// 序列化
user := User{Name: &#34;Alice&#34;, Age: 25, Email: &#34;alice@example.com&#34;}
data, _ := json.MarshalIndent(user, &#34;&#34;, &#34;  &#34;)

// 反序列化
var parsed User
json.Unmarshal([]byte(jsonStr), &amp;parsed)</code></pre>
<h2>Struct Tag 详解</h2>
<pre><code class="language-go">type Product struct {
    ID      int64   \`json:&#34;id&#34;\`
    Name    string  \`json:&#34;name&#34;\`
    Stock   int     \`json:&#34;stock,omitempty&#34;\`  // 零值时省略
    Deleted bool    \`json:&#34;-&#34;\`                // 始终忽略
}</code></pre>
<h3>omitempty 行为</h3>
<table>
<thead><tr><th>类型</th><th>零值</th></tr></thead>
<tbody>
<tr><td>string</td><td><code>&#34;&#34;</code></td></tr>
<tr><td>int/float</td><td><code>0</code></td></tr>
<tr><td>bool</td><td><code>false</code></td></tr>
<tr><td>pointer</td><td><code>nil</code></td></tr>
<tr><td>slice</td><td><code>nil</code>（空切片不省略）</td></tr>
</tbody>
</table>
<h2>动态 JSON</h2>
<h3>map[string]interface{}</h3>
<pre><code class="language-go">var result map[string]interface{}
json.Unmarshal([]byte(jsonStr), &amp;result)
name := result[&#34;name&#34;].(string)
age := result[&#34;age&#34;].(float64)  // 数值默认 float64</code></pre>
<h3>json.RawMessage 延迟解析</h3>
<pre><code class="language-go">type Event struct {
    Type    string          \`json:&#34;type&#34;\`
    Payload json.RawMessage \`json:&#34;payload&#34;\`
}

var event Event
json.Unmarshal(data, &amp;event)
switch event.Type {
case &#34;user_created&#34;:
    var user User
    json.Unmarshal(event.Payload, &amp;user)
}</code></pre>
<h3>json.Number 精确数值</h3>
<pre><code class="language-go">decoder := json.NewDecoder(strings.NewReader(jsonStr))
decoder.UseNumber()
var result map[string]interface{}
decoder.Decode(&amp;result)
num := result[&#34;id&#34;].(json.Number)
id, _ := num.Int64()</code></pre>
<h2>自定义 Marshaler/Unmarshaler</h2>
<pre><code class="language-go">type Timestamp struct{ time.Time }

func (t Timestamp) MarshalJSON() ([]byte, error) {
    return json.Marshal(t.Unix())
}

func (t *Timestamp) UnmarshalJSON(data []byte) error {
    var unix int64
    if err := json.Unmarshal(data, &amp;unix); err != nil {
        return err
    }
    t.Time = time.Unix(unix, 0)
    return nil
}</code></pre>
<h2>流式编解码</h2>
<pre><code class="language-go">// HTTP 响应
func handler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set(&#34;Content-Type&#34;, &#34;application/json&#34;)
    json.NewEncoder(w).Encode(map[string]string{&#34;status&#34;: &#34;ok&#34;})
}</code></pre>
<h2>高性能替代库</h2>
<table>
<thead><tr><th>库</th><th>速度提升</th></tr></thead>
<tbody>
<tr><td>json-iterator/go</td><td>2-3x</td></tr>
<tr><td>bytedance/sonic</td><td>3-5x</td></tr>
<tr><td>goccy/go-json</td><td>2-4x</td></tr>
</tbody>
</table>
<h2>小结</h2>
<ul>
<li>struct tag 控制字段映射和序列化行为</li>
<li><code>omitempty</code> 省略零值，<code>-</code> 忽略字段</li>
<li><code>json.RawMessage</code> 延迟解析多态数据</li>
<li><code>json.Number</code> 避免大整数精度丢失</li>
<li>高性能场景使用 json-iterator 或 sonic</li>
</ul>
`
};

window.LEARN_ARTICLES["php-json"] = {
zh: `<h1>PHP JSON 处理实战指南</h1>
<h2>PHP JSON 核心函数</h2>
<pre><code class="language-php">&lt;?php
$data = [&#39;name&#39; =&gt; &#39;张三&#39;, &#39;age&#39; =&gt; 28, &#39;skills&#39; =&gt; [&#39;PHP&#39;, &#39;MySQL&#39;]];

// 编码
$json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

// 解码为关联数组
$arr = json_decode($jsonStr, true);

// 解码为对象
$obj = json_decode($jsonStr);
echo $obj-&gt;name;</code></pre>
<h2>常用选项</h2>
<table>
<thead><tr><th>选项</th><th>作用</th></tr></thead>
<tbody>
<tr><td><code>JSON_PRETTY_PRINT</code></td><td>美化输出</td></tr>
<tr><td><code>JSON_UNESCAPED_UNICODE</code></td><td>保留中文</td></tr>
<tr><td><code>JSON_UNESCAPED_SLASHES</code></td><td>不转义斜杠</td></tr>
<tr><td><code>JSON_THROW_ON_ERROR</code></td><td>错误时抛异常（PHP 7.3+）</td></tr>
</tbody>
</table>
<h2>错误处理</h2>
<pre><code class="language-php">&lt;?php
try {
    $data = json_decode($json, true, 512, JSON_THROW_ON_ERROR);
} catch (JsonException $e) {
    echo &#34;JSON 错误: &#34; . $e-&gt;getMessage();
}</code></pre>
<h2>API 响应封装</h2>
<pre><code class="language-php">&lt;?php
header(&#39;Content-Type: application/json; charset=utf-8&#39;);

function apiResponse($data, $code = 200, $message = &#39;success&#39;) {
    http_response_code($code);
    echo json_encode([
        &#39;code&#39; =&gt; $code, &#39;message&#39; =&gt; $message,
        &#39;data&#39; =&gt; $data, &#39;timestamp&#39; =&gt; date(&#39;c&#39;)
    ], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    exit;
}</code></pre>
<h2>常见陷阱</h2>
<pre><code class="language-php">&lt;?php
// 空数组 vs 空对象
echo json_encode([]);              // []
echo json_encode(new stdClass);    // {}

// 非连续索引数组变对象
echo json_encode([1 =&gt; &#39;a&#39;, 3 =&gt; &#39;b&#39;]); // {&#34;1&#34;:&#34;a&#34;,&#34;3&#34;:&#34;b&#34;}

// 浮点精度
ini_set(&#39;serialize_precision&#39;, 14);  // PHP 7.1+ 修复</code></pre>
<h2>小结</h2>
<ul>
<li><code>json_encode()</code> + <code>json_decode()</code> 是核心</li>
<li>使用 <code>JSON_THROW_ON_ERROR</code> 进行错误处理</li>
<li><code>JSON_UNESCAPED_UNICODE</code> 保留中文</li>
<li>注意空数组/空对象的差异</li>
</ul>
`,
en: `<h1>PHP JSON 处理实战指南</h1>
<h2>PHP JSON 核心函数</h2>
<pre><code class="language-php">&lt;?php
$data = [&#39;name&#39; =&gt; &#39;张三&#39;, &#39;age&#39; =&gt; 28, &#39;skills&#39; =&gt; [&#39;PHP&#39;, &#39;MySQL&#39;]];

// 编码
$json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

// 解码为关联数组
$arr = json_decode($jsonStr, true);

// 解码为对象
$obj = json_decode($jsonStr);
echo $obj-&gt;name;</code></pre>
<h2>常用选项</h2>
<table>
<thead><tr><th>选项</th><th>作用</th></tr></thead>
<tbody>
<tr><td><code>JSON_PRETTY_PRINT</code></td><td>美化输出</td></tr>
<tr><td><code>JSON_UNESCAPED_UNICODE</code></td><td>保留中文</td></tr>
<tr><td><code>JSON_UNESCAPED_SLASHES</code></td><td>不转义斜杠</td></tr>
<tr><td><code>JSON_THROW_ON_ERROR</code></td><td>错误时抛异常（PHP 7.3+）</td></tr>
</tbody>
</table>
<h2>错误处理</h2>
<pre><code class="language-php">&lt;?php
try {
    $data = json_decode($json, true, 512, JSON_THROW_ON_ERROR);
} catch (JsonException $e) {
    echo &#34;JSON 错误: &#34; . $e-&gt;getMessage();
}</code></pre>
<h2>API 响应封装</h2>
<pre><code class="language-php">&lt;?php
header(&#39;Content-Type: application/json; charset=utf-8&#39;);

function apiResponse($data, $code = 200, $message = &#39;success&#39;) {
    http_response_code($code);
    echo json_encode([
        &#39;code&#39; =&gt; $code, &#39;message&#39; =&gt; $message,
        &#39;data&#39; =&gt; $data, &#39;timestamp&#39; =&gt; date(&#39;c&#39;)
    ], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    exit;
}</code></pre>
<h2>常见陷阱</h2>
<pre><code class="language-php">&lt;?php
// 空数组 vs 空对象
echo json_encode([]);              // []
echo json_encode(new stdClass);    // {}

// 非连续索引数组变对象
echo json_encode([1 =&gt; &#39;a&#39;, 3 =&gt; &#39;b&#39;]); // {&#34;1&#34;:&#34;a&#34;,&#34;3&#34;:&#34;b&#34;}

// 浮点精度
ini_set(&#39;serialize_precision&#39;, 14);  // PHP 7.1+ 修复</code></pre>
<h2>小结</h2>
<ul>
<li><code>json_encode()</code> + <code>json_decode()</code> 是核心</li>
<li>使用 <code>JSON_THROW_ON_ERROR</code> 进行错误处理</li>
<li><code>JSON_UNESCAPED_UNICODE</code> 保留中文</li>
<li>注意空数组/空对象的差异</li>
</ul>
`
};

window.LEARN_ARTICLES["csharp-json"] = {
zh: `<h1>C# / .NET JSON 序列化指南</h1>
<h2>System.Text.Json（.NET 推荐）</h2>
<pre><code class="language-csharp">using System.Text.Json;

var options = new JsonSerializerOptions {
    WriteIndented = true,
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
};

// 序列化
string json = JsonSerializer.Serialize(user, options);

// 反序列化
User parsed = JsonSerializer.Deserialize&lt;User&gt;(json, options);</code></pre>
<h3>属性注解</h3>
<pre><code class="language-csharp">using System.Text.Json.Serialization;

public class Product {
    [JsonPropertyName(&#34;product_id&#34;)]
    public int Id { get; set; }

    [JsonIgnore]
    public string InternalCode { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Description { get; set; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public ProductStatus Status { get; set; }
}</code></pre>
<h2>Newtonsoft.Json</h2>
<pre><code class="language-csharp">using Newtonsoft.Json;

string json = JsonConvert.SerializeObject(user, Formatting.Indented);
User user = JsonConvert.DeserializeObject&lt;User&gt;(json);

// 动态解析
dynamic obj = JsonConvert.DeserializeObject(json);
string name = obj.name;</code></pre>
<h3>Newtonsoft 注解</h3>
<pre><code class="language-csharp">public class User {
    [JsonProperty(&#34;user_name&#34;)]
    public string Name { get; set; }

    [JsonIgnore]
    public string Password { get; set; }

    [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
    public string? Nickname { get; set; }
}</code></pre>
<h2>ASP.NET Core 配置</h2>
<pre><code class="language-csharp">builder.Services.AddControllers()
    .AddJsonOptions(options =&gt; {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });</code></pre>
<h2>小结</h2>
<ul>
<li>新项目推荐 System.Text.Json（性能更好）</li>
<li>复杂场景用 Newtonsoft.Json</li>
<li>使用属性注解控制序列化行为</li>
</ul>
`,
en: `<h1>C# / .NET JSON 序列化指南</h1>
<h2>System.Text.Json（.NET 推荐）</h2>
<pre><code class="language-csharp">using System.Text.Json;

var options = new JsonSerializerOptions {
    WriteIndented = true,
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
};

// 序列化
string json = JsonSerializer.Serialize(user, options);

// 反序列化
User parsed = JsonSerializer.Deserialize&lt;User&gt;(json, options);</code></pre>
<h3>属性注解</h3>
<pre><code class="language-csharp">using System.Text.Json.Serialization;

public class Product {
    [JsonPropertyName(&#34;product_id&#34;)]
    public int Id { get; set; }

    [JsonIgnore]
    public string InternalCode { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Description { get; set; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public ProductStatus Status { get; set; }
}</code></pre>
<h2>Newtonsoft.Json</h2>
<pre><code class="language-csharp">using Newtonsoft.Json;

string json = JsonConvert.SerializeObject(user, Formatting.Indented);
User user = JsonConvert.DeserializeObject&lt;User&gt;(json);

// 动态解析
dynamic obj = JsonConvert.DeserializeObject(json);
string name = obj.name;</code></pre>
<h3>Newtonsoft 注解</h3>
<pre><code class="language-csharp">public class User {
    [JsonProperty(&#34;user_name&#34;)]
    public string Name { get; set; }

    [JsonIgnore]
    public string Password { get; set; }

    [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
    public string? Nickname { get; set; }
}</code></pre>
<h2>ASP.NET Core 配置</h2>
<pre><code class="language-csharp">builder.Services.AddControllers()
    .AddJsonOptions(options =&gt; {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });</code></pre>
<h2>小结</h2>
<ul>
<li>新项目推荐 System.Text.Json（性能更好）</li>
<li>复杂场景用 Newtonsoft.Json</li>
<li>使用属性注解控制序列化行为</li>
</ul>
`
};

window.LEARN_ARTICLES["ruby-json"] = {
zh: `<h1>Ruby JSON 处理指南</h1>
<h2>Ruby 标准库 JSON</h2>
<pre><code class="language-ruby">require &#39;json&#39;

# Hash → JSON
data = { name: &#34;Alice&#34;, age: 25, skills: [&#34;Ruby&#34;, &#34;Rails&#34;] }
json_str = JSON.generate(data)
json_pretty = JSON.pretty_generate(data)

# JSON → Hash
parsed = JSON.parse(&#39;{&#34;name&#34;:&#34;Alice&#34;,&#34;age&#34;:25}&#39;)
puts parsed[&#34;name&#34;]  # Alice

# 符号化键名
parsed = JSON.parse(&#39;{&#34;name&#34;:&#34;Alice&#34;}&#39;, symbolize_names: true)
puts parsed[:name]   # Alice</code></pre>
<h2>文件操作</h2>
<pre><code class="language-ruby">require &#39;json&#39;

# 写入
File.write(&#34;data.json&#34;, JSON.pretty_generate(data))

# 读取
data = JSON.parse(File.read(&#34;data.json&#34;), symbolize_names: true)</code></pre>
<h2>自定义对象序列化</h2>
<pre><code class="language-ruby">class User
  attr_accessor :name, :email

  def to_json(*args)
    { name: @name, email: @email }.to_json(*args)
  end
end</code></pre>
<h2>Rails 中的 JSON</h2>
<pre><code class="language-ruby">class User &lt; ApplicationRecord
  def as_json(options = {})
    super(options.merge(
      only: [:id, :name, :email],
      include: { posts: { only: [:id, :title] } }
    ))
  end
end

# Controller
render json: users, status: :ok</code></pre>
<h2>高性能：Oj gem</h2>
<pre><code class="language-ruby">require &#39;oj&#39;
json = Oj.dump(data, mode: :compat)  # 比标准库快 2-3x
parsed = Oj.load(json)</code></pre>
<h2>小结</h2>
<ul>
<li><code>JSON.generate</code> / <code>JSON.parse</code> 是核心方法</li>
<li><code>symbolize_names: true</code> 将键转为 Symbol</li>
<li>Rails 用 <code>as_json</code> 和 <code>render json:</code> 控制输出</li>
<li>高性能场景使用 Oj gem</li>
</ul>
`,
en: `<h1>Ruby JSON 处理指南</h1>
<h2>Ruby 标准库 JSON</h2>
<pre><code class="language-ruby">require &#39;json&#39;

# Hash → JSON
data = { name: &#34;Alice&#34;, age: 25, skills: [&#34;Ruby&#34;, &#34;Rails&#34;] }
json_str = JSON.generate(data)
json_pretty = JSON.pretty_generate(data)

# JSON → Hash
parsed = JSON.parse(&#39;{&#34;name&#34;:&#34;Alice&#34;,&#34;age&#34;:25}&#39;)
puts parsed[&#34;name&#34;]  # Alice

# 符号化键名
parsed = JSON.parse(&#39;{&#34;name&#34;:&#34;Alice&#34;}&#39;, symbolize_names: true)
puts parsed[:name]   # Alice</code></pre>
<h2>文件操作</h2>
<pre><code class="language-ruby">require &#39;json&#39;

# 写入
File.write(&#34;data.json&#34;, JSON.pretty_generate(data))

# 读取
data = JSON.parse(File.read(&#34;data.json&#34;), symbolize_names: true)</code></pre>
<h2>自定义对象序列化</h2>
<pre><code class="language-ruby">class User
  attr_accessor :name, :email

  def to_json(*args)
    { name: @name, email: @email }.to_json(*args)
  end
end</code></pre>
<h2>Rails 中的 JSON</h2>
<pre><code class="language-ruby">class User &lt; ApplicationRecord
  def as_json(options = {})
    super(options.merge(
      only: [:id, :name, :email],
      include: { posts: { only: [:id, :title] } }
    ))
  end
end

# Controller
render json: users, status: :ok</code></pre>
<h2>高性能：Oj gem</h2>
<pre><code class="language-ruby">require &#39;oj&#39;
json = Oj.dump(data, mode: :compat)  # 比标准库快 2-3x
parsed = Oj.load(json)</code></pre>
<h2>小结</h2>
<ul>
<li><code>JSON.generate</code> / <code>JSON.parse</code> 是核心方法</li>
<li><code>symbolize_names: true</code> 将键转为 Symbol</li>
<li>Rails 用 <code>as_json</code> 和 <code>render json:</code> 控制输出</li>
<li>高性能场景使用 Oj gem</li>
</ul>
`
};

window.LEARN_ARTICLES["rust-json"] = {
zh: `<h1>Rust JSON 处理：serde_json 实战</h1>
<h2>serde + serde_json</h2>
<pre><code class="language-toml">[dependencies]
serde = { version = &#34;1.0&#34;, features = [&#34;derive&#34;] }
serde_json = &#34;1.0&#34;</code></pre>
<h2>强类型序列化</h2>
<pre><code class="language-rust">use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct User {
    name: String,
    age: u32,
    email: String,
    skills: Vec&lt;String&gt;,
}

fn main() -&gt; Result&lt;(), serde_json::Error&gt; {
    let user = User {
        name: &#34;Alice&#34;.into(), age: 25,
        email: &#34;alice@example.com&#34;.into(),
        skills: vec![&#34;Rust&#34;.into(), &#34;Go&#34;.into()],
    };

    let json = serde_json::to_string_pretty(&amp;user)?;
    let parsed: User = serde_json::from_str(&amp;json)?;
    Ok(())
}</code></pre>
<h2>serde 属性宏</h2>
<pre><code class="language-rust">#[derive(Serialize, Deserialize)]
#[serde(rename_all = &#34;camelCase&#34;)]
struct Product {
    #[serde(rename = &#34;product_id&#34;)]
    id: u64,
    product_name: String,
    #[serde(skip_serializing)]
    internal_code: String,
    #[serde(skip_serializing_if = &#34;Option::is_none&#34;)]
    description: Option&lt;String&gt;,
    #[serde(default)]
    stock: u32,
}</code></pre>
<h2>动态 JSON</h2>
<pre><code class="language-rust">use serde_json::{json, Value};

let data = json!({
    &#34;name&#34;: &#34;Alice&#34;,
    &#34;scores&#34;: [98, 85, 92]
});

println!(&#34;{}&#34;, data[&#34;name&#34;]);
if let Some(name) = data[&#34;name&#34;].as_str() {
    println!(&#34;Name: {}&#34;, name);
}</code></pre>
<h2>枚举序列化</h2>
<pre><code class="language-rust">#[derive(Serialize, Deserialize)]
#[serde(tag = &#34;type&#34;, content = &#34;data&#34;)]
enum Event {
    #[serde(rename = &#34;user_created&#34;)]
    UserCreated { name: String },
    #[serde(rename = &#34;order_placed&#34;)]
    OrderPlaced { order_id: String, amount: f64 },
}</code></pre>
<h2>小结</h2>
<ul>
<li><code>#[derive(Serialize, Deserialize)]</code> 自动实现</li>
<li><code>#[serde(...)]</code> 精确控制序列化行为</li>
<li><code>serde_json::Value</code> 处理动态 JSON</li>
<li><code>json!</code> 宏提供 JSON 字面量语法</li>
<li>编译时类型检查确保安全性</li>
</ul>
`,
en: `<h1>Rust JSON 处理：serde_json 实战</h1>
<h2>serde + serde_json</h2>
<pre><code class="language-toml">[dependencies]
serde = { version = &#34;1.0&#34;, features = [&#34;derive&#34;] }
serde_json = &#34;1.0&#34;</code></pre>
<h2>强类型序列化</h2>
<pre><code class="language-rust">use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct User {
    name: String,
    age: u32,
    email: String,
    skills: Vec&lt;String&gt;,
}

fn main() -&gt; Result&lt;(), serde_json::Error&gt; {
    let user = User {
        name: &#34;Alice&#34;.into(), age: 25,
        email: &#34;alice@example.com&#34;.into(),
        skills: vec![&#34;Rust&#34;.into(), &#34;Go&#34;.into()],
    };

    let json = serde_json::to_string_pretty(&amp;user)?;
    let parsed: User = serde_json::from_str(&amp;json)?;
    Ok(())
}</code></pre>
<h2>serde 属性宏</h2>
<pre><code class="language-rust">#[derive(Serialize, Deserialize)]
#[serde(rename_all = &#34;camelCase&#34;)]
struct Product {
    #[serde(rename = &#34;product_id&#34;)]
    id: u64,
    product_name: String,
    #[serde(skip_serializing)]
    internal_code: String,
    #[serde(skip_serializing_if = &#34;Option::is_none&#34;)]
    description: Option&lt;String&gt;,
    #[serde(default)]
    stock: u32,
}</code></pre>
<h2>动态 JSON</h2>
<pre><code class="language-rust">use serde_json::{json, Value};

let data = json!({
    &#34;name&#34;: &#34;Alice&#34;,
    &#34;scores&#34;: [98, 85, 92]
});

println!(&#34;{}&#34;, data[&#34;name&#34;]);
if let Some(name) = data[&#34;name&#34;].as_str() {
    println!(&#34;Name: {}&#34;, name);
}</code></pre>
<h2>枚举序列化</h2>
<pre><code class="language-rust">#[derive(Serialize, Deserialize)]
#[serde(tag = &#34;type&#34;, content = &#34;data&#34;)]
enum Event {
    #[serde(rename = &#34;user_created&#34;)]
    UserCreated { name: String },
    #[serde(rename = &#34;order_placed&#34;)]
    OrderPlaced { order_id: String, amount: f64 },
}</code></pre>
<h2>小结</h2>
<ul>
<li><code>#[derive(Serialize, Deserialize)]</code> 自动实现</li>
<li><code>#[serde(...)]</code> 精确控制序列化行为</li>
<li><code>serde_json::Value</code> 处理动态 JSON</li>
<li><code>json!</code> 宏提供 JSON 字面量语法</li>
<li>编译时类型检查确保安全性</li>
</ul>
`
};

window.LEARN_ARTICLES["swift-json"] = {
zh: `<h1>Swift JSON 编解码（Codable 协议）</h1>
<h2>Codable 基础</h2>
<pre><code class="language-swift">import Foundation

struct User: Codable {
    let name: String
    let age: Int
    let email: String
}

// 编码
let encoder = JSONEncoder()
encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
let jsonData = try encoder.encode(user)

// 解码
let decoder = JSONDecoder()
let user = try decoder.decode(User.self, from: jsonData)</code></pre>
<h2>CodingKeys 自定义</h2>
<pre><code class="language-swift">struct Product: Codable {
    let id: Int
    let productName: String

    enum CodingKeys: String, CodingKey {
        case id
        case productName = &#34;product_name&#34;
    }
}

// 或全局 snake_case 策略
decoder.keyDecodingStrategy = .convertFromSnakeCase
encoder.keyEncodingStrategy = .convertToSnakeCase</code></pre>
<h2>日期处理</h2>
<pre><code class="language-swift">decoder.dateDecodingStrategy = .iso8601
// 或自定义格式
let formatter = DateFormatter()
formatter.dateFormat = &#34;yyyy-MM-dd&#34;
decoder.dateDecodingStrategy = .formatted(formatter)</code></pre>
<h2>可选值与默认值</h2>
<pre><code class="language-swift">struct Config: Codable {
    let name: String
    let timeout: Int?

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        name = try container.decode(String.self, forKey: .name)
        timeout = try container.decodeIfPresent(Int.self, forKey: .timeout)
    }
}</code></pre>
<h2>泛型 API 响应</h2>
<pre><code class="language-swift">struct APIResponse&lt;T: Codable&gt;: Codable {
    let code: Int
    let message: String
    let data: T?
}

let response = try decoder.decode(APIResponse&lt;[User]&gt;.self, from: data)</code></pre>
<h2>错误处理</h2>
<pre><code class="language-swift">do {
    let user = try decoder.decode(User.self, from: data)
} catch DecodingError.keyNotFound(let key, _) {
    print(&#34;缺少字段: \\(key.stringValue)&#34;)
} catch DecodingError.typeMismatch(let type, _) {
    print(&#34;类型不匹配: \\(type)&#34;)
}</code></pre>
<h2>小结</h2>
<ul>
<li>Codable 协议提供编译时类型安全</li>
<li>CodingKeys 自定义字段映射</li>
<li><code>decodeIfPresent</code> 处理可选字段</li>
<li>泛型统一 API 响应解析</li>
</ul>
`,
en: `<h1>Swift JSON 编解码（Codable 协议）</h1>
<h2>Codable 基础</h2>
<pre><code class="language-swift">import Foundation

struct User: Codable {
    let name: String
    let age: Int
    let email: String
}

// 编码
let encoder = JSONEncoder()
encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
let jsonData = try encoder.encode(user)

// 解码
let decoder = JSONDecoder()
let user = try decoder.decode(User.self, from: jsonData)</code></pre>
<h2>CodingKeys 自定义</h2>
<pre><code class="language-swift">struct Product: Codable {
    let id: Int
    let productName: String

    enum CodingKeys: String, CodingKey {
        case id
        case productName = &#34;product_name&#34;
    }
}

// 或全局 snake_case 策略
decoder.keyDecodingStrategy = .convertFromSnakeCase
encoder.keyEncodingStrategy = .convertToSnakeCase</code></pre>
<h2>日期处理</h2>
<pre><code class="language-swift">decoder.dateDecodingStrategy = .iso8601
// 或自定义格式
let formatter = DateFormatter()
formatter.dateFormat = &#34;yyyy-MM-dd&#34;
decoder.dateDecodingStrategy = .formatted(formatter)</code></pre>
<h2>可选值与默认值</h2>
<pre><code class="language-swift">struct Config: Codable {
    let name: String
    let timeout: Int?

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        name = try container.decode(String.self, forKey: .name)
        timeout = try container.decodeIfPresent(Int.self, forKey: .timeout)
    }
}</code></pre>
<h2>泛型 API 响应</h2>
<pre><code class="language-swift">struct APIResponse&lt;T: Codable&gt;: Codable {
    let code: Int
    let message: String
    let data: T?
}

let response = try decoder.decode(APIResponse&lt;[User]&gt;.self, from: data)</code></pre>
<h2>错误处理</h2>
<pre><code class="language-swift">do {
    let user = try decoder.decode(User.self, from: data)
} catch DecodingError.keyNotFound(let key, _) {
    print(&#34;缺少字段: \\(key.stringValue)&#34;)
} catch DecodingError.typeMismatch(let type, _) {
    print(&#34;类型不匹配: \\(type)&#34;)
}</code></pre>
<h2>小结</h2>
<ul>
<li>Codable 协议提供编译时类型安全</li>
<li>CodingKeys 自定义字段映射</li>
<li><code>decodeIfPresent</code> 处理可选字段</li>
<li>泛型统一 API 响应解析</li>
</ul>
`
};

window.LEARN_ARTICLES["typescript-json"] = {
zh: `<h1>TypeScript 中的 JSON 类型安全</h1>
<h2>类型定义</h2>
<pre><code class="language-typescript">interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
  roles: string[];
  address: { city: string; country: string };
}

type APIResponse&lt;T&gt; = {
  code: number;
  message: string;
  data: T;
  pagination?: { page: number; total: number };
};</code></pre>
<h2>运行时验证：Zod（推荐）</h2>
<pre><code class="language-typescript">import { z } from &#39;zod&#39;;

const UserSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().min(0).optional(),
  roles: z.array(z.string()),
  address: z.object({ city: z.string(), country: z.string() }),
});

type User = z.infer&lt;typeof UserSchema&gt;;

// 安全解析
const result = UserSchema.safeParse(JSON.parse(jsonStr));
if (result.success) {
  console.log(result.data.name);
} else {
  console.error(result.error.errors);
}</code></pre>
<h2>类型守卫</h2>
<pre><code class="language-typescript">function isUser(obj: unknown): obj is User {
  return (
    typeof obj === &#39;object&#39; &amp;&amp; obj !== null &amp;&amp;
    typeof (obj as User).id === &#39;number&#39; &amp;&amp;
    typeof (obj as User).name === &#39;string&#39;
  );
}</code></pre>
<h2>Fetch 封装</h2>
<pre><code class="language-typescript">async function fetchJSON&lt;T&gt;(url: string, schema: z.ZodSchema&lt;T&gt;): Promise&lt;T&gt; {
  const response = await fetch(url);
  if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
  return schema.parse(await response.json());
}

const users = await fetchJSON(&#39;/api/users&#39;, z.array(UserSchema));</code></pre>
<h2>JSON 工具类型</h2>
<pre><code class="language-typescript">type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
type JSONObject = { [key: string]: JSONValue };
type JSONArray = JSONValue[];</code></pre>
<h2>小结</h2>
<ul>
<li><code>JSON.parse()</code> 返回 any，需额外类型安全措施</li>
<li>生产环境用 Zod 进行运行时验证</li>
<li><code>z.infer</code> 自动从 Schema 推导类型</li>
<li>封装 <code>fetchJSON&lt;T&gt;</code> 统一处理 API 请求</li>
</ul>
`,
en: `<h1>TypeScript 中的 JSON 类型安全</h1>
<h2>类型定义</h2>
<pre><code class="language-typescript">interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
  roles: string[];
  address: { city: string; country: string };
}

type APIResponse&lt;T&gt; = {
  code: number;
  message: string;
  data: T;
  pagination?: { page: number; total: number };
};</code></pre>
<h2>运行时验证：Zod（推荐）</h2>
<pre><code class="language-typescript">import { z } from &#39;zod&#39;;

const UserSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().min(0).optional(),
  roles: z.array(z.string()),
  address: z.object({ city: z.string(), country: z.string() }),
});

type User = z.infer&lt;typeof UserSchema&gt;;

// 安全解析
const result = UserSchema.safeParse(JSON.parse(jsonStr));
if (result.success) {
  console.log(result.data.name);
} else {
  console.error(result.error.errors);
}</code></pre>
<h2>类型守卫</h2>
<pre><code class="language-typescript">function isUser(obj: unknown): obj is User {
  return (
    typeof obj === &#39;object&#39; &amp;&amp; obj !== null &amp;&amp;
    typeof (obj as User).id === &#39;number&#39; &amp;&amp;
    typeof (obj as User).name === &#39;string&#39;
  );
}</code></pre>
<h2>Fetch 封装</h2>
<pre><code class="language-typescript">async function fetchJSON&lt;T&gt;(url: string, schema: z.ZodSchema&lt;T&gt;): Promise&lt;T&gt; {
  const response = await fetch(url);
  if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
  return schema.parse(await response.json());
}

const users = await fetchJSON(&#39;/api/users&#39;, z.array(UserSchema));</code></pre>
<h2>JSON 工具类型</h2>
<pre><code class="language-typescript">type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
type JSONObject = { [key: string]: JSONValue };
type JSONArray = JSONValue[];</code></pre>
<h2>小结</h2>
<ul>
<li><code>JSON.parse()</code> 返回 any，需额外类型安全措施</li>
<li>生产环境用 Zod 进行运行时验证</li>
<li><code>z.infer</code> 自动从 Schema 推导类型</li>
<li>封装 <code>fetchJSON&lt;T&gt;</code> 统一处理 API 请求</li>
</ul>
`
};

