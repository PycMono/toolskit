/* JSON Learn Articles: advanced */
window.LEARN_ARTICLES = window.LEARN_ARTICLES || {};

window.LEARN_ARTICLES["json-schema-intro"] = {
zh: `<h1>JSON Schema 入门：用 JSON 描述和验证 JSON</h1>
<h2>为什么需要 JSON Schema</h2>
<p>在团队协作和 API 对接中，一个常见的痛点是：<strong>JSON 数据的结构没有约束</strong>。前端传来的数据缺少字段、类型不对、格式错误……这些问题往往在运行时才暴露。</p>
<p>JSON Schema 正是解决这个问题的工具。它用 <strong>JSON 本身</strong>来描述 JSON 应该长什么样——哪些字段必填、值是什么类型、长度范围多少、满足什么格式。</p>
<pre><code>JSON Schema 就像数据库的 DDL (CREATE TABLE)，
但它描述的不是表结构，而是 JSON 文档的结构。</code></pre>
<h2>第一个 Schema</h2>
<p>假设我们有一个用户注册 API，要求请求体包含 <code>name</code>（字符串）、<code>email</code>（邮箱格式）和可选的 <code>age</code>（正整数）：</p>
<pre><code class="language-json">{
  &#34;$schema&#34;: &#34;https://json-schema.org/draft/2020-12/schema&#34;,
  &#34;$id&#34;: &#34;https://example.com/user.schema.json&#34;,
  &#34;title&#34;: &#34;User Registration&#34;,
  &#34;description&#34;: &#34;用户注册请求体&#34;,
  &#34;type&#34;: &#34;object&#34;,
  &#34;required&#34;: [&#34;name&#34;, &#34;email&#34;],
  &#34;properties&#34;: {
    &#34;name&#34;: {
      &#34;type&#34;: &#34;string&#34;,
      &#34;minLength&#34;: 1,
      &#34;maxLength&#34;: 100,
      &#34;description&#34;: &#34;用户姓名&#34;
    },
    &#34;email&#34;: {
      &#34;type&#34;: &#34;string&#34;,
      &#34;format&#34;: &#34;email&#34;,
      &#34;description&#34;: &#34;邮箱地址&#34;
    },
    &#34;age&#34;: {
      &#34;type&#34;: &#34;integer&#34;,
      &#34;minimum&#34;: 1,
      &#34;maximum&#34;: 150,
      &#34;description&#34;: &#34;年龄（可选）&#34;
    }
  },
  &#34;additionalProperties&#34;: false
}</code></pre>
<p>关键字段解读：</p>
<ul>
<li><code>$schema</code>：声明使用的 JSON Schema 版本（推荐 Draft 2020-12）</li>
<li><code>$id</code>：Schema 的唯一标识 URI</li>
<li><code>type</code>：根级数据类型，这里是 <code>object</code></li>
<li><code>required</code>：必填字段数组</li>
<li><code>properties</code>：各字段的约束定义</li>
<li><code>additionalProperties: false</code>：禁止出现未定义的字段</li>
</ul>
<h2>类型系统详解</h2>
<p>JSON Schema 支持 6 种基本类型：</p>
<pre><code class="language-json">{ &#34;type&#34;: &#34;string&#34; }     // 字符串
{ &#34;type&#34;: &#34;number&#34; }     // 数字（含小数）
{ &#34;type&#34;: &#34;integer&#34; }    // 整数
{ &#34;type&#34;: &#34;boolean&#34; }    // 布尔值
{ &#34;type&#34;: &#34;array&#34; }      // 数组
{ &#34;type&#34;: &#34;object&#34; }     // 对象
{ &#34;type&#34;: &#34;null&#34; }       // null</code></pre>
<p>允许多种类型：</p>
<pre><code class="language-json">{ &#34;type&#34;: [&#34;string&#34;, &#34;null&#34;] }</code></pre>
<h2>字符串约束</h2>
<pre><code class="language-json">{
  &#34;type&#34;: &#34;string&#34;,
  &#34;minLength&#34;: 1,
  &#34;maxLength&#34;: 255,
  &#34;pattern&#34;: &#34;^[A-Za-z0-9_]+$&#34;,
  &#34;format&#34;: &#34;email&#34;
}</code></pre>
<p>常用 <code>format</code> 值：</p>
<table>
<thead><tr><th>format</th><th>含义</th><th>示例</th></tr></thead>
<tbody>
<tr><td><code>email</code></td><td>邮箱地址</td><td><code>user@example.com</code></td></tr>
<tr><td><code>uri</code></td><td>URI 地址</td><td><code>https://example.com</code></td></tr>
<tr><td><code>date</code></td><td>ISO 日期</td><td><code>2025-01-15</code></td></tr>
<tr><td><code>date-time</code></td><td>ISO 日期时间</td><td><code>2025-01-15T08:30:00Z</code></td></tr>
<tr><td><code>ipv4</code></td><td>IPv4 地址</td><td><code>192.168.1.1</code></td></tr>
<tr><td><code>uuid</code></td><td>UUID</td><td><code>550e8400-e29b-41d4-a716-446655440000</code></td></tr>
<tr><td><code>regex</code></td><td>正则表达式</td><td><code>^\\\\d+$</code></td></tr>
</tbody>
</table>
<blockquote><p><strong>注意</strong>：<code>format</code> 关键字默认只做标注，不做验证。需要在验证器中显式开启 format 校验（如 ajv 的 <code>ajv-formats</code> 插件）。</p></blockquote>
<h2>数值约束</h2>
<pre><code class="language-json">{
  &#34;type&#34;: &#34;number&#34;,
  &#34;minimum&#34;: 0,
  &#34;maximum&#34;: 100,
  &#34;exclusiveMinimum&#34;: 0,
  &#34;multipleOf&#34;: 0.01
}</code></pre>
<ul>
<li><code>minimum</code> / <code>maximum</code>：闭区间，包含端点</li>
<li><code>exclusiveMinimum</code> / <code>exclusiveMaximum</code>：开区间，不包含端点</li>
<li><code>multipleOf</code>：必须是该值的倍数（<code>0.01</code> 表示最多两位小数）</li>
</ul>
<h2>对象约束</h2>
<pre><code class="language-json">{
  &#34;type&#34;: &#34;object&#34;,
  &#34;required&#34;: [&#34;id&#34;, &#34;name&#34;],
  &#34;properties&#34;: {
    &#34;id&#34;: { &#34;type&#34;: &#34;integer&#34; },
    &#34;name&#34;: { &#34;type&#34;: &#34;string&#34; },
    &#34;metadata&#34;: { &#34;type&#34;: &#34;object&#34; }
  },
  &#34;additionalProperties&#34;: false,
  &#34;minProperties&#34;: 1,
  &#34;maxProperties&#34;: 50,
  &#34;patternProperties&#34;: {
    &#34;^x-&#34;: { &#34;type&#34;: &#34;string&#34; }
  }
}</code></pre>
<ul>
<li><code>patternProperties</code>：用正则匹配字段名，如所有 <code>x-</code> 开头的自定义字段必须是字符串</li>
</ul>
<h2>数组约束</h2>
<pre><code class="language-json">{
  &#34;type&#34;: &#34;array&#34;,
  &#34;items&#34;: { &#34;type&#34;: &#34;string&#34; },
  &#34;minItems&#34;: 1,
  &#34;maxItems&#34;: 100,
  &#34;uniqueItems&#34;: true,
  &#34;contains&#34;: {
    &#34;type&#34;: &#34;string&#34;,
    &#34;const&#34;: &#34;admin&#34;
  }
}</code></pre>
<ul>
<li><code>items</code>：定义数组元素的 Schema</li>
<li><code>uniqueItems</code>：元素是否必须唯一</li>
<li><code>contains</code>：数组中至少包含一个匹配的元素</li>
</ul>
<h2>枚举与常量</h2>
<pre><code class="language-json">{ &#34;enum&#34;: [&#34;active&#34;, &#34;inactive&#34;, &#34;suspended&#34;] }

{ &#34;const&#34;: &#34;v2&#34; }</code></pre>
<h2>实战验证：JavaScript（ajv）</h2>
<pre><code class="language-javascript">const Ajv = require(&#34;ajv&#34;);
const addFormats = require(&#34;ajv-formats&#34;);

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const schema = {
  type: &#34;object&#34;,
  required: [&#34;name&#34;, &#34;email&#34;],
  properties: {
    name: { type: &#34;string&#34;, minLength: 1 },
    email: { type: &#34;string&#34;, format: &#34;email&#34; },
    age: { type: &#34;integer&#34;, minimum: 1 }
  },
  additionalProperties: false
};

const validate = ajv.compile(schema);

// 测试合法数据
console.log(validate({ name: &#34;Alice&#34;, email: &#34;alice@example.com&#34; }));
// true

// 测试非法数据
validate({ name: &#34;&#34;, email: &#34;not-email&#34;, extra: 1 });
console.log(validate.errors);
// [
//   { keyword: &#39;minLength&#39;, message: &#39;...&#39; },
//   { keyword: &#39;format&#39;, message: &#39;...&#39; },
//   { keyword: &#39;additionalProperties&#39;, message: &#39;...&#39; }
// ]</code></pre>
<h2>实战验证：Python（jsonschema）</h2>
<pre><code class="language-python">from jsonschema import validate, ValidationError, Draft202012Validator

schema = {
    &#34;type&#34;: &#34;object&#34;,
    &#34;required&#34;: [&#34;name&#34;, &#34;email&#34;],
    &#34;properties&#34;: {
        &#34;name&#34;: {&#34;type&#34;: &#34;string&#34;, &#34;minLength&#34;: 1},
        &#34;email&#34;: {&#34;type&#34;: &#34;string&#34;, &#34;format&#34;: &#34;email&#34;},
        &#34;age&#34;: {&#34;type&#34;: &#34;integer&#34;, &#34;minimum&#34;: 1}
    },
    &#34;additionalProperties&#34;: False
}

# 单次验证
try:
    validate(instance={&#34;name&#34;: &#34;Alice&#34;, &#34;email&#34;: &#34;a@b.com&#34;}, schema=schema)
    print(&#34;验证通过 ✓&#34;)
except ValidationError as e:
    print(f&#34;验证失败: {e.message}&#34;)

# 收集所有错误
validator = Draft202012Validator(schema)
errors = list(validator.iter_errors({&#34;name&#34;: &#34;&#34;, &#34;age&#34;: -1}))
for err in errors:
    print(f&#34;  - {err.json_path}: {err.message}&#34;)</code></pre>
<h2>在 API 开发中的应用</h2>
<p>JSON Schema 在 OpenAPI（Swagger）规范中被广泛使用：</p>
<pre><code class="language-yaml"># openapi.yaml 片段
components:
  schemas:
    User:
      type: object
      required: [name, email]
      properties:
        name:
          type: string
          minLength: 1
        email:
          type: string
          format: email</code></pre>
<p>许多 API 网关（Kong、AWS API Gateway）支持直接用 JSON Schema 做请求体校验，无需写业务代码。</p>
<h2>小结</h2>
<ul>
<li>JSON Schema 用 JSON 描述 JSON 的结构，实现声明式数据验证</li>
<li>支持类型、范围、格式、正则、枚举等丰富约束</li>
<li><code>required</code> 控制必填字段，<code>additionalProperties</code> 控制是否允许额外字段</li>
<li>主流语言都有成熟的验证库（ajv、jsonschema、gojsonschema）</li>
<li>在 OpenAPI/Swagger 中作为标准的数据模型描述语言</li>
</ul>
`,
en: `<h1>JSON Schema 入门：用 JSON 描述和验证 JSON</h1>
<h2>为什么需要 JSON Schema</h2>
<p>在团队协作和 API 对接中，一个常见的痛点是：<strong>JSON 数据的结构没有约束</strong>。前端传来的数据缺少字段、类型不对、格式错误……这些问题往往在运行时才暴露。</p>
<p>JSON Schema 正是解决这个问题的工具。它用 <strong>JSON 本身</strong>来描述 JSON 应该长什么样——哪些字段必填、值是什么类型、长度范围多少、满足什么格式。</p>
<pre><code>JSON Schema 就像数据库的 DDL (CREATE TABLE)，
但它描述的不是表结构，而是 JSON 文档的结构。</code></pre>
<h2>第一个 Schema</h2>
<p>假设我们有一个用户注册 API，要求请求体包含 <code>name</code>（字符串）、<code>email</code>（邮箱格式）和可选的 <code>age</code>（正整数）：</p>
<pre><code class="language-json">{
  &#34;$schema&#34;: &#34;https://json-schema.org/draft/2020-12/schema&#34;,
  &#34;$id&#34;: &#34;https://example.com/user.schema.json&#34;,
  &#34;title&#34;: &#34;User Registration&#34;,
  &#34;description&#34;: &#34;用户注册请求体&#34;,
  &#34;type&#34;: &#34;object&#34;,
  &#34;required&#34;: [&#34;name&#34;, &#34;email&#34;],
  &#34;properties&#34;: {
    &#34;name&#34;: {
      &#34;type&#34;: &#34;string&#34;,
      &#34;minLength&#34;: 1,
      &#34;maxLength&#34;: 100,
      &#34;description&#34;: &#34;用户姓名&#34;
    },
    &#34;email&#34;: {
      &#34;type&#34;: &#34;string&#34;,
      &#34;format&#34;: &#34;email&#34;,
      &#34;description&#34;: &#34;邮箱地址&#34;
    },
    &#34;age&#34;: {
      &#34;type&#34;: &#34;integer&#34;,
      &#34;minimum&#34;: 1,
      &#34;maximum&#34;: 150,
      &#34;description&#34;: &#34;年龄（可选）&#34;
    }
  },
  &#34;additionalProperties&#34;: false
}</code></pre>
<p>关键字段解读：</p>
<ul>
<li><code>$schema</code>：声明使用的 JSON Schema 版本（推荐 Draft 2020-12）</li>
<li><code>$id</code>：Schema 的唯一标识 URI</li>
<li><code>type</code>：根级数据类型，这里是 <code>object</code></li>
<li><code>required</code>：必填字段数组</li>
<li><code>properties</code>：各字段的约束定义</li>
<li><code>additionalProperties: false</code>：禁止出现未定义的字段</li>
</ul>
<h2>类型系统详解</h2>
<p>JSON Schema 支持 6 种基本类型：</p>
<pre><code class="language-json">{ &#34;type&#34;: &#34;string&#34; }     // 字符串
{ &#34;type&#34;: &#34;number&#34; }     // 数字（含小数）
{ &#34;type&#34;: &#34;integer&#34; }    // 整数
{ &#34;type&#34;: &#34;boolean&#34; }    // 布尔值
{ &#34;type&#34;: &#34;array&#34; }      // 数组
{ &#34;type&#34;: &#34;object&#34; }     // 对象
{ &#34;type&#34;: &#34;null&#34; }       // null</code></pre>
<p>允许多种类型：</p>
<pre><code class="language-json">{ &#34;type&#34;: [&#34;string&#34;, &#34;null&#34;] }</code></pre>
<h2>字符串约束</h2>
<pre><code class="language-json">{
  &#34;type&#34;: &#34;string&#34;,
  &#34;minLength&#34;: 1,
  &#34;maxLength&#34;: 255,
  &#34;pattern&#34;: &#34;^[A-Za-z0-9_]+$&#34;,
  &#34;format&#34;: &#34;email&#34;
}</code></pre>
<p>常用 <code>format</code> 值：</p>
<table>
<thead><tr><th>format</th><th>含义</th><th>示例</th></tr></thead>
<tbody>
<tr><td><code>email</code></td><td>邮箱地址</td><td><code>user@example.com</code></td></tr>
<tr><td><code>uri</code></td><td>URI 地址</td><td><code>https://example.com</code></td></tr>
<tr><td><code>date</code></td><td>ISO 日期</td><td><code>2025-01-15</code></td></tr>
<tr><td><code>date-time</code></td><td>ISO 日期时间</td><td><code>2025-01-15T08:30:00Z</code></td></tr>
<tr><td><code>ipv4</code></td><td>IPv4 地址</td><td><code>192.168.1.1</code></td></tr>
<tr><td><code>uuid</code></td><td>UUID</td><td><code>550e8400-e29b-41d4-a716-446655440000</code></td></tr>
<tr><td><code>regex</code></td><td>正则表达式</td><td><code>^\\\\d+$</code></td></tr>
</tbody>
</table>
<blockquote><p><strong>注意</strong>：<code>format</code> 关键字默认只做标注，不做验证。需要在验证器中显式开启 format 校验（如 ajv 的 <code>ajv-formats</code> 插件）。</p></blockquote>
<h2>数值约束</h2>
<pre><code class="language-json">{
  &#34;type&#34;: &#34;number&#34;,
  &#34;minimum&#34;: 0,
  &#34;maximum&#34;: 100,
  &#34;exclusiveMinimum&#34;: 0,
  &#34;multipleOf&#34;: 0.01
}</code></pre>
<ul>
<li><code>minimum</code> / <code>maximum</code>：闭区间，包含端点</li>
<li><code>exclusiveMinimum</code> / <code>exclusiveMaximum</code>：开区间，不包含端点</li>
<li><code>multipleOf</code>：必须是该值的倍数（<code>0.01</code> 表示最多两位小数）</li>
</ul>
<h2>对象约束</h2>
<pre><code class="language-json">{
  &#34;type&#34;: &#34;object&#34;,
  &#34;required&#34;: [&#34;id&#34;, &#34;name&#34;],
  &#34;properties&#34;: {
    &#34;id&#34;: { &#34;type&#34;: &#34;integer&#34; },
    &#34;name&#34;: { &#34;type&#34;: &#34;string&#34; },
    &#34;metadata&#34;: { &#34;type&#34;: &#34;object&#34; }
  },
  &#34;additionalProperties&#34;: false,
  &#34;minProperties&#34;: 1,
  &#34;maxProperties&#34;: 50,
  &#34;patternProperties&#34;: {
    &#34;^x-&#34;: { &#34;type&#34;: &#34;string&#34; }
  }
}</code></pre>
<ul>
<li><code>patternProperties</code>：用正则匹配字段名，如所有 <code>x-</code> 开头的自定义字段必须是字符串</li>
</ul>
<h2>数组约束</h2>
<pre><code class="language-json">{
  &#34;type&#34;: &#34;array&#34;,
  &#34;items&#34;: { &#34;type&#34;: &#34;string&#34; },
  &#34;minItems&#34;: 1,
  &#34;maxItems&#34;: 100,
  &#34;uniqueItems&#34;: true,
  &#34;contains&#34;: {
    &#34;type&#34;: &#34;string&#34;,
    &#34;const&#34;: &#34;admin&#34;
  }
}</code></pre>
<ul>
<li><code>items</code>：定义数组元素的 Schema</li>
<li><code>uniqueItems</code>：元素是否必须唯一</li>
<li><code>contains</code>：数组中至少包含一个匹配的元素</li>
</ul>
<h2>枚举与常量</h2>
<pre><code class="language-json">{ &#34;enum&#34;: [&#34;active&#34;, &#34;inactive&#34;, &#34;suspended&#34;] }

{ &#34;const&#34;: &#34;v2&#34; }</code></pre>
<h2>实战验证：JavaScript（ajv）</h2>
<pre><code class="language-javascript">const Ajv = require(&#34;ajv&#34;);
const addFormats = require(&#34;ajv-formats&#34;);

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const schema = {
  type: &#34;object&#34;,
  required: [&#34;name&#34;, &#34;email&#34;],
  properties: {
    name: { type: &#34;string&#34;, minLength: 1 },
    email: { type: &#34;string&#34;, format: &#34;email&#34; },
    age: { type: &#34;integer&#34;, minimum: 1 }
  },
  additionalProperties: false
};

const validate = ajv.compile(schema);

// 测试合法数据
console.log(validate({ name: &#34;Alice&#34;, email: &#34;alice@example.com&#34; }));
// true

// 测试非法数据
validate({ name: &#34;&#34;, email: &#34;not-email&#34;, extra: 1 });
console.log(validate.errors);
// [
//   { keyword: &#39;minLength&#39;, message: &#39;...&#39; },
//   { keyword: &#39;format&#39;, message: &#39;...&#39; },
//   { keyword: &#39;additionalProperties&#39;, message: &#39;...&#39; }
// ]</code></pre>
<h2>实战验证：Python（jsonschema）</h2>
<pre><code class="language-python">from jsonschema import validate, ValidationError, Draft202012Validator

schema = {
    &#34;type&#34;: &#34;object&#34;,
    &#34;required&#34;: [&#34;name&#34;, &#34;email&#34;],
    &#34;properties&#34;: {
        &#34;name&#34;: {&#34;type&#34;: &#34;string&#34;, &#34;minLength&#34;: 1},
        &#34;email&#34;: {&#34;type&#34;: &#34;string&#34;, &#34;format&#34;: &#34;email&#34;},
        &#34;age&#34;: {&#34;type&#34;: &#34;integer&#34;, &#34;minimum&#34;: 1}
    },
    &#34;additionalProperties&#34;: False
}

# 单次验证
try:
    validate(instance={&#34;name&#34;: &#34;Alice&#34;, &#34;email&#34;: &#34;a@b.com&#34;}, schema=schema)
    print(&#34;验证通过 ✓&#34;)
except ValidationError as e:
    print(f&#34;验证失败: {e.message}&#34;)

# 收集所有错误
validator = Draft202012Validator(schema)
errors = list(validator.iter_errors({&#34;name&#34;: &#34;&#34;, &#34;age&#34;: -1}))
for err in errors:
    print(f&#34;  - {err.json_path}: {err.message}&#34;)</code></pre>
<h2>在 API 开发中的应用</h2>
<p>JSON Schema 在 OpenAPI（Swagger）规范中被广泛使用：</p>
<pre><code class="language-yaml"># openapi.yaml 片段
components:
  schemas:
    User:
      type: object
      required: [name, email]
      properties:
        name:
          type: string
          minLength: 1
        email:
          type: string
          format: email</code></pre>
<p>许多 API 网关（Kong、AWS API Gateway）支持直接用 JSON Schema 做请求体校验，无需写业务代码。</p>
<h2>小结</h2>
<ul>
<li>JSON Schema 用 JSON 描述 JSON 的结构，实现声明式数据验证</li>
<li>支持类型、范围、格式、正则、枚举等丰富约束</li>
<li><code>required</code> 控制必填字段，<code>additionalProperties</code> 控制是否允许额外字段</li>
<li>主流语言都有成熟的验证库（ajv、jsonschema、gojsonschema）</li>
<li>在 OpenAPI/Swagger 中作为标准的数据模型描述语言</li>
</ul>
`
};

window.LEARN_ARTICLES["json-schema-advanced"] = {
zh: `<h1>JSON Schema 进阶：组合、引用与条件验证</h1>
<h2>组合关键字</h2>
<p>JSON Schema 提供四个逻辑组合关键字，用于构建复杂的校验规则：</p>
<h3>allOf：同时满足</h3>
<p>数据必须满足 <strong>所有</strong> 子 Schema：</p>
<pre><code class="language-json">{
  &#34;allOf&#34;: [
    { &#34;type&#34;: &#34;object&#34;, &#34;required&#34;: [&#34;name&#34;] },
    { &#34;type&#34;: &#34;object&#34;, &#34;required&#34;: [&#34;email&#34;] },
    {
      &#34;properties&#34;: {
        &#34;name&#34;: { &#34;type&#34;: &#34;string&#34; },
        &#34;email&#34;: { &#34;type&#34;: &#34;string&#34;, &#34;format&#34;: &#34;email&#34; }
      }
    }
  ]
}</code></pre>
<p>常见场景：Schema 继承——基础 Schema + 扩展字段。</p>
<h3>anyOf：满足任一</h3>
<p>数据满足 <strong>至少一个</strong> 子 Schema 即可：</p>
<pre><code class="language-json">{
  &#34;anyOf&#34;: [
    { &#34;type&#34;: &#34;string&#34;, &#34;minLength&#34;: 5 },
    { &#34;type&#34;: &#34;number&#34;, &#34;minimum&#34;: 0 }
  ]
}</code></pre>
<blockquote><p>与 <code>oneOf</code> 的区别：<code>anyOf</code> 允许同时满足多个，<code>oneOf</code> 要求恰好满足一个。</p></blockquote>
<h3>oneOf：恰好满足一个</h3>
<pre><code class="language-json">{
  &#34;oneOf&#34;: [
    { &#34;type&#34;: &#34;integer&#34; },
    { &#34;type&#34;: &#34;string&#34;, &#34;pattern&#34;: &#34;^\\\\d+$&#34; }
  ]
}</code></pre>
<p>注意：值 <code>42</code> 同时满足两者（<code>integer</code> 和 <code>&#34;42&#34;</code> 的 pattern），如果一个值能匹配多个子 Schema，<code>oneOf</code> 会失败。设计时要确保子 Schema 互斥。</p>
<h3>not：取反</h3>
<pre><code class="language-json">{
  &#34;not&#34;: { &#34;type&#34;: &#34;null&#34; }
}</code></pre>
<p>表示值不能是 <code>null</code>。<code>not</code> 通常和其他关键字配合使用：</p>
<pre><code class="language-json">{
  &#34;type&#34;: &#34;string&#34;,
  &#34;not&#34;: { &#34;enum&#34;: [&#34;admin&#34;, &#34;root&#34;] }
}</code></pre>
<h2>条件验证：if / then / else</h2>
<p>当数据结构取决于某个字段的值时，条件验证非常有用：</p>
<pre><code class="language-json">{
  &#34;type&#34;: &#34;object&#34;,
  &#34;properties&#34;: {
    &#34;userType&#34;: { &#34;type&#34;: &#34;string&#34;, &#34;enum&#34;: [&#34;personal&#34;, &#34;company&#34;] }
  },
  &#34;required&#34;: [&#34;userType&#34;],

  &#34;if&#34;: {
    &#34;properties&#34;: { &#34;userType&#34;: { &#34;const&#34;: &#34;company&#34; } }
  },
  &#34;then&#34;: {
    &#34;required&#34;: [&#34;companyName&#34;, &#34;taxId&#34;],
    &#34;properties&#34;: {
      &#34;companyName&#34;: { &#34;type&#34;: &#34;string&#34;, &#34;minLength&#34;: 1 },
      &#34;taxId&#34;: { &#34;type&#34;: &#34;string&#34;, &#34;pattern&#34;: &#34;^[0-9A-Z]{15,20}$&#34; }
    }
  },
  &#34;else&#34;: {
    &#34;required&#34;: [&#34;firstName&#34;, &#34;lastName&#34;],
    &#34;properties&#34;: {
      &#34;firstName&#34;: { &#34;type&#34;: &#34;string&#34; },
      &#34;lastName&#34;: { &#34;type&#34;: &#34;string&#34; }
    }
  }
}</code></pre>
<p>实际效果：</p>
<ul>
<li>当 <code>userType</code> 为 <code>&#34;company&#34;</code> 时，必须填 <code>companyName</code> 和 <code>taxId</code></li>
<li>否则，必须填 <code>firstName</code> 和 <code>lastName</code></li>
</ul>
<h3>多条件链</h3>
<p>可以在 <code>allOf</code> 中嵌套多个 <code>if/then</code>：</p>
<pre><code class="language-json">{
  &#34;allOf&#34;: [
    {
      &#34;if&#34;: { &#34;properties&#34;: { &#34;paymentMethod&#34;: { &#34;const&#34;: &#34;credit_card&#34; } } },
      &#34;then&#34;: { &#34;required&#34;: [&#34;cardNumber&#34;, &#34;cvv&#34;, &#34;expiry&#34;] }
    },
    {
      &#34;if&#34;: { &#34;properties&#34;: { &#34;paymentMethod&#34;: { &#34;const&#34;: &#34;bank_transfer&#34; } } },
      &#34;then&#34;: { &#34;required&#34;: [&#34;bankName&#34;, &#34;accountNumber&#34;, &#34;routingNumber&#34;] }
    }
  ]
}</code></pre>
<h2>$ref 引用与 $defs 复用</h2>
<p>大型项目中，Schema 会有大量重复定义。<code>$ref</code> 允许引用其他 Schema：</p>
<h3>内部引用</h3>
<pre><code class="language-json">{
  &#34;$defs&#34;: {
    &#34;address&#34;: {
      &#34;type&#34;: &#34;object&#34;,
      &#34;required&#34;: [&#34;street&#34;, &#34;city&#34;, &#34;country&#34;],
      &#34;properties&#34;: {
        &#34;street&#34;: { &#34;type&#34;: &#34;string&#34; },
        &#34;city&#34;: { &#34;type&#34;: &#34;string&#34; },
        &#34;zipCode&#34;: { &#34;type&#34;: &#34;string&#34;, &#34;pattern&#34;: &#34;^\\\\d{5,6}$&#34; },
        &#34;country&#34;: { &#34;type&#34;: &#34;string&#34;, &#34;minLength&#34;: 2, &#34;maxLength&#34;: 2 }
      }
    }
  },
  &#34;type&#34;: &#34;object&#34;,
  &#34;properties&#34;: {
    &#34;homeAddress&#34;: { &#34;$ref&#34;: &#34;#/$defs/address&#34; },
    &#34;workAddress&#34;: { &#34;$ref&#34;: &#34;#/$defs/address&#34; },
    &#34;shippingAddress&#34;: { &#34;$ref&#34;: &#34;#/$defs/address&#34; }
  }
}</code></pre>
<p><code>#/$defs/address</code> 表示当前文档中 <code>$defs.address</code> 的路径（JSON Pointer 格式）。</p>
<h3>外部引用</h3>
<pre><code class="language-json">{
  &#34;properties&#34;: {
    &#34;address&#34;: { &#34;$ref&#34;: &#34;https://example.com/schemas/address.json&#34; },
    &#34;payment&#34;: { &#34;$ref&#34;: &#34;./payment.schema.json#/$defs/creditCard&#34; }
  }
}</code></pre>
<p>支持绝对 URL 和相对路径，方便将 Schema 拆分为独立文件管理。</p>
<h3>引用 + 覆盖</h3>
<p><code>$ref</code> 可以和其他关键字组合（Draft 2019-09+）：</p>
<pre><code class="language-json">{
  &#34;properties&#34;: {
    &#34;shippingAddress&#34;: {
      &#34;$ref&#34;: &#34;#/$defs/address&#34;,
      &#34;required&#34;: [&#34;street&#34;, &#34;city&#34;, &#34;country&#34;, &#34;phone&#34;],
      &#34;properties&#34;: {
        &#34;phone&#34;: { &#34;type&#34;: &#34;string&#34; }
      }
    }
  }
}</code></pre>
<p>在引用 <code>address</code> 的基础上，增加了 <code>phone</code> 字段要求。</p>
<h2>递归 Schema</h2>
<p>描述树形结构（如文件目录、评论嵌套）：</p>
<pre><code class="language-json">{
  &#34;$defs&#34;: {
    &#34;node&#34;: {
      &#34;type&#34;: &#34;object&#34;,
      &#34;required&#34;: [&#34;name&#34;],
      &#34;properties&#34;: {
        &#34;name&#34;: { &#34;type&#34;: &#34;string&#34; },
        &#34;children&#34;: {
          &#34;type&#34;: &#34;array&#34;,
          &#34;items&#34;: { &#34;$ref&#34;: &#34;#/$defs/node&#34; }
        }
      }
    }
  },
  &#34;$ref&#34;: &#34;#/$defs/node&#34;
}</code></pre>
<p>验证数据：</p>
<pre><code class="language-json">{
  &#34;name&#34;: &#34;root&#34;,
  &#34;children&#34;: [
    { &#34;name&#34;: &#34;child-1&#34;, &#34;children&#34;: [] },
    {
      &#34;name&#34;: &#34;child-2&#34;,
      &#34;children&#34;: [
        { &#34;name&#34;: &#34;grandchild-1&#34; }
      ]
    }
  ]
}</code></pre>
<h2>实战：电商订单 Schema</h2>
<pre><code class="language-json">{
  &#34;$schema&#34;: &#34;https://json-schema.org/draft/2020-12/schema&#34;,
  &#34;title&#34;: &#34;Order&#34;,
  &#34;type&#34;: &#34;object&#34;,
  &#34;required&#34;: [&#34;orderId&#34;, &#34;customer&#34;, &#34;items&#34;, &#34;payment&#34;],
  &#34;properties&#34;: {
    &#34;orderId&#34;: { &#34;type&#34;: &#34;string&#34;, &#34;pattern&#34;: &#34;^ORD-\\\\d{8,}$&#34; },
    &#34;customer&#34;: { &#34;$ref&#34;: &#34;#/$defs/customer&#34; },
    &#34;items&#34;: {
      &#34;type&#34;: &#34;array&#34;,
      &#34;minItems&#34;: 1,
      &#34;items&#34;: { &#34;$ref&#34;: &#34;#/$defs/orderItem&#34; }
    },
    &#34;payment&#34;: { &#34;$ref&#34;: &#34;#/$defs/payment&#34; },
    &#34;notes&#34;: { &#34;type&#34;: &#34;string&#34;, &#34;maxLength&#34;: 500 }
  },
  &#34;$defs&#34;: {
    &#34;customer&#34;: {
      &#34;type&#34;: &#34;object&#34;,
      &#34;required&#34;: [&#34;id&#34;, &#34;name&#34;, &#34;email&#34;],
      &#34;properties&#34;: {
        &#34;id&#34;: { &#34;type&#34;: &#34;integer&#34; },
        &#34;name&#34;: { &#34;type&#34;: &#34;string&#34;, &#34;minLength&#34;: 1 },
        &#34;email&#34;: { &#34;type&#34;: &#34;string&#34;, &#34;format&#34;: &#34;email&#34; }
      }
    },
    &#34;orderItem&#34;: {
      &#34;type&#34;: &#34;object&#34;,
      &#34;required&#34;: [&#34;productId&#34;, &#34;name&#34;, &#34;quantity&#34;, &#34;price&#34;],
      &#34;properties&#34;: {
        &#34;productId&#34;: { &#34;type&#34;: &#34;string&#34; },
        &#34;name&#34;: { &#34;type&#34;: &#34;string&#34; },
        &#34;quantity&#34;: { &#34;type&#34;: &#34;integer&#34;, &#34;minimum&#34;: 1 },
        &#34;price&#34;: { &#34;type&#34;: &#34;number&#34;, &#34;minimum&#34;: 0, &#34;multipleOf&#34;: 0.01 }
      }
    },
    &#34;payment&#34;: {
      &#34;type&#34;: &#34;object&#34;,
      &#34;required&#34;: [&#34;method&#34;, &#34;amount&#34;],
      &#34;properties&#34;: {
        &#34;method&#34;: { &#34;enum&#34;: [&#34;credit_card&#34;, &#34;alipay&#34;, &#34;wechat_pay&#34;, &#34;bank_transfer&#34;] },
        &#34;amount&#34;: { &#34;type&#34;: &#34;number&#34;, &#34;minimum&#34;: 0.01 }
      },
      &#34;if&#34;: { &#34;properties&#34;: { &#34;method&#34;: { &#34;const&#34;: &#34;credit_card&#34; } } },
      &#34;then&#34;: { &#34;required&#34;: [&#34;method&#34;, &#34;amount&#34;, &#34;cardLast4&#34;] },
      &#34;else&#34;: {}
    }
  }
}</code></pre>
<h2>常用验证库对比</h2>
<table>
<thead><tr><th>语言</th><th>库</th><th>Draft 2020-12</th><th>特点</th></tr></thead>
<tbody>
<tr><td>JavaScript</td><td>ajv</td><td>✓</td><td>最快的 JS 验证器，支持代码生成</td></tr>
<tr><td>Python</td><td>jsonschema</td><td>✓</td><td>标准库风格，纯 Python</td></tr>
<tr><td>Go</td><td>santhosh-tekuri/jsonschema</td><td>✓</td><td>高性能，完整规范支持</td></tr>
<tr><td>Java</td><td>networknt/json-schema-validator</td><td>✓</td><td>与 Jackson 深度集成</td></tr>
<tr><td>Rust</td><td>jsonschema-rs</td><td>✓</td><td>Rust 原生，极致性能</td></tr>
</tbody>
</table>
<h2>小结</h2>
<ul>
<li><code>allOf</code> / <code>anyOf</code> / <code>oneOf</code> / <code>not</code> 构建复杂逻辑</li>
<li><code>if</code> / <code>then</code> / <code>else</code> 实现字段间的条件依赖</li>
<li><code>$ref</code> + <code>$defs</code> 实现 Schema 模块化复用</li>
<li>递归引用可以描述树形嵌套结构</li>
<li>大型项目建议拆分 Schema 文件，用外部引用组织</li>
</ul>
`,
en: `<h1>JSON Schema 进阶：组合、引用与条件验证</h1>
<h2>组合关键字</h2>
<p>JSON Schema 提供四个逻辑组合关键字，用于构建复杂的校验规则：</p>
<h3>allOf：同时满足</h3>
<p>数据必须满足 <strong>所有</strong> 子 Schema：</p>
<pre><code class="language-json">{
  &#34;allOf&#34;: [
    { &#34;type&#34;: &#34;object&#34;, &#34;required&#34;: [&#34;name&#34;] },
    { &#34;type&#34;: &#34;object&#34;, &#34;required&#34;: [&#34;email&#34;] },
    {
      &#34;properties&#34;: {
        &#34;name&#34;: { &#34;type&#34;: &#34;string&#34; },
        &#34;email&#34;: { &#34;type&#34;: &#34;string&#34;, &#34;format&#34;: &#34;email&#34; }
      }
    }
  ]
}</code></pre>
<p>常见场景：Schema 继承——基础 Schema + 扩展字段。</p>
<h3>anyOf：满足任一</h3>
<p>数据满足 <strong>至少一个</strong> 子 Schema 即可：</p>
<pre><code class="language-json">{
  &#34;anyOf&#34;: [
    { &#34;type&#34;: &#34;string&#34;, &#34;minLength&#34;: 5 },
    { &#34;type&#34;: &#34;number&#34;, &#34;minimum&#34;: 0 }
  ]
}</code></pre>
<blockquote><p>与 <code>oneOf</code> 的区别：<code>anyOf</code> 允许同时满足多个，<code>oneOf</code> 要求恰好满足一个。</p></blockquote>
<h3>oneOf：恰好满足一个</h3>
<pre><code class="language-json">{
  &#34;oneOf&#34;: [
    { &#34;type&#34;: &#34;integer&#34; },
    { &#34;type&#34;: &#34;string&#34;, &#34;pattern&#34;: &#34;^\\\\d+$&#34; }
  ]
}</code></pre>
<p>注意：值 <code>42</code> 同时满足两者（<code>integer</code> 和 <code>&#34;42&#34;</code> 的 pattern），如果一个值能匹配多个子 Schema，<code>oneOf</code> 会失败。设计时要确保子 Schema 互斥。</p>
<h3>not：取反</h3>
<pre><code class="language-json">{
  &#34;not&#34;: { &#34;type&#34;: &#34;null&#34; }
}</code></pre>
<p>表示值不能是 <code>null</code>。<code>not</code> 通常和其他关键字配合使用：</p>
<pre><code class="language-json">{
  &#34;type&#34;: &#34;string&#34;,
  &#34;not&#34;: { &#34;enum&#34;: [&#34;admin&#34;, &#34;root&#34;] }
}</code></pre>
<h2>条件验证：if / then / else</h2>
<p>当数据结构取决于某个字段的值时，条件验证非常有用：</p>
<pre><code class="language-json">{
  &#34;type&#34;: &#34;object&#34;,
  &#34;properties&#34;: {
    &#34;userType&#34;: { &#34;type&#34;: &#34;string&#34;, &#34;enum&#34;: [&#34;personal&#34;, &#34;company&#34;] }
  },
  &#34;required&#34;: [&#34;userType&#34;],

  &#34;if&#34;: {
    &#34;properties&#34;: { &#34;userType&#34;: { &#34;const&#34;: &#34;company&#34; } }
  },
  &#34;then&#34;: {
    &#34;required&#34;: [&#34;companyName&#34;, &#34;taxId&#34;],
    &#34;properties&#34;: {
      &#34;companyName&#34;: { &#34;type&#34;: &#34;string&#34;, &#34;minLength&#34;: 1 },
      &#34;taxId&#34;: { &#34;type&#34;: &#34;string&#34;, &#34;pattern&#34;: &#34;^[0-9A-Z]{15,20}$&#34; }
    }
  },
  &#34;else&#34;: {
    &#34;required&#34;: [&#34;firstName&#34;, &#34;lastName&#34;],
    &#34;properties&#34;: {
      &#34;firstName&#34;: { &#34;type&#34;: &#34;string&#34; },
      &#34;lastName&#34;: { &#34;type&#34;: &#34;string&#34; }
    }
  }
}</code></pre>
<p>实际效果：</p>
<ul>
<li>当 <code>userType</code> 为 <code>&#34;company&#34;</code> 时，必须填 <code>companyName</code> 和 <code>taxId</code></li>
<li>否则，必须填 <code>firstName</code> 和 <code>lastName</code></li>
</ul>
<h3>多条件链</h3>
<p>可以在 <code>allOf</code> 中嵌套多个 <code>if/then</code>：</p>
<pre><code class="language-json">{
  &#34;allOf&#34;: [
    {
      &#34;if&#34;: { &#34;properties&#34;: { &#34;paymentMethod&#34;: { &#34;const&#34;: &#34;credit_card&#34; } } },
      &#34;then&#34;: { &#34;required&#34;: [&#34;cardNumber&#34;, &#34;cvv&#34;, &#34;expiry&#34;] }
    },
    {
      &#34;if&#34;: { &#34;properties&#34;: { &#34;paymentMethod&#34;: { &#34;const&#34;: &#34;bank_transfer&#34; } } },
      &#34;then&#34;: { &#34;required&#34;: [&#34;bankName&#34;, &#34;accountNumber&#34;, &#34;routingNumber&#34;] }
    }
  ]
}</code></pre>
<h2>$ref 引用与 $defs 复用</h2>
<p>大型项目中，Schema 会有大量重复定义。<code>$ref</code> 允许引用其他 Schema：</p>
<h3>内部引用</h3>
<pre><code class="language-json">{
  &#34;$defs&#34;: {
    &#34;address&#34;: {
      &#34;type&#34;: &#34;object&#34;,
      &#34;required&#34;: [&#34;street&#34;, &#34;city&#34;, &#34;country&#34;],
      &#34;properties&#34;: {
        &#34;street&#34;: { &#34;type&#34;: &#34;string&#34; },
        &#34;city&#34;: { &#34;type&#34;: &#34;string&#34; },
        &#34;zipCode&#34;: { &#34;type&#34;: &#34;string&#34;, &#34;pattern&#34;: &#34;^\\\\d{5,6}$&#34; },
        &#34;country&#34;: { &#34;type&#34;: &#34;string&#34;, &#34;minLength&#34;: 2, &#34;maxLength&#34;: 2 }
      }
    }
  },
  &#34;type&#34;: &#34;object&#34;,
  &#34;properties&#34;: {
    &#34;homeAddress&#34;: { &#34;$ref&#34;: &#34;#/$defs/address&#34; },
    &#34;workAddress&#34;: { &#34;$ref&#34;: &#34;#/$defs/address&#34; },
    &#34;shippingAddress&#34;: { &#34;$ref&#34;: &#34;#/$defs/address&#34; }
  }
}</code></pre>
<p><code>#/$defs/address</code> 表示当前文档中 <code>$defs.address</code> 的路径（JSON Pointer 格式）。</p>
<h3>外部引用</h3>
<pre><code class="language-json">{
  &#34;properties&#34;: {
    &#34;address&#34;: { &#34;$ref&#34;: &#34;https://example.com/schemas/address.json&#34; },
    &#34;payment&#34;: { &#34;$ref&#34;: &#34;./payment.schema.json#/$defs/creditCard&#34; }
  }
}</code></pre>
<p>支持绝对 URL 和相对路径，方便将 Schema 拆分为独立文件管理。</p>
<h3>引用 + 覆盖</h3>
<p><code>$ref</code> 可以和其他关键字组合（Draft 2019-09+）：</p>
<pre><code class="language-json">{
  &#34;properties&#34;: {
    &#34;shippingAddress&#34;: {
      &#34;$ref&#34;: &#34;#/$defs/address&#34;,
      &#34;required&#34;: [&#34;street&#34;, &#34;city&#34;, &#34;country&#34;, &#34;phone&#34;],
      &#34;properties&#34;: {
        &#34;phone&#34;: { &#34;type&#34;: &#34;string&#34; }
      }
    }
  }
}</code></pre>
<p>在引用 <code>address</code> 的基础上，增加了 <code>phone</code> 字段要求。</p>
<h2>递归 Schema</h2>
<p>描述树形结构（如文件目录、评论嵌套）：</p>
<pre><code class="language-json">{
  &#34;$defs&#34;: {
    &#34;node&#34;: {
      &#34;type&#34;: &#34;object&#34;,
      &#34;required&#34;: [&#34;name&#34;],
      &#34;properties&#34;: {
        &#34;name&#34;: { &#34;type&#34;: &#34;string&#34; },
        &#34;children&#34;: {
          &#34;type&#34;: &#34;array&#34;,
          &#34;items&#34;: { &#34;$ref&#34;: &#34;#/$defs/node&#34; }
        }
      }
    }
  },
  &#34;$ref&#34;: &#34;#/$defs/node&#34;
}</code></pre>
<p>验证数据：</p>
<pre><code class="language-json">{
  &#34;name&#34;: &#34;root&#34;,
  &#34;children&#34;: [
    { &#34;name&#34;: &#34;child-1&#34;, &#34;children&#34;: [] },
    {
      &#34;name&#34;: &#34;child-2&#34;,
      &#34;children&#34;: [
        { &#34;name&#34;: &#34;grandchild-1&#34; }
      ]
    }
  ]
}</code></pre>
<h2>实战：电商订单 Schema</h2>
<pre><code class="language-json">{
  &#34;$schema&#34;: &#34;https://json-schema.org/draft/2020-12/schema&#34;,
  &#34;title&#34;: &#34;Order&#34;,
  &#34;type&#34;: &#34;object&#34;,
  &#34;required&#34;: [&#34;orderId&#34;, &#34;customer&#34;, &#34;items&#34;, &#34;payment&#34;],
  &#34;properties&#34;: {
    &#34;orderId&#34;: { &#34;type&#34;: &#34;string&#34;, &#34;pattern&#34;: &#34;^ORD-\\\\d{8,}$&#34; },
    &#34;customer&#34;: { &#34;$ref&#34;: &#34;#/$defs/customer&#34; },
    &#34;items&#34;: {
      &#34;type&#34;: &#34;array&#34;,
      &#34;minItems&#34;: 1,
      &#34;items&#34;: { &#34;$ref&#34;: &#34;#/$defs/orderItem&#34; }
    },
    &#34;payment&#34;: { &#34;$ref&#34;: &#34;#/$defs/payment&#34; },
    &#34;notes&#34;: { &#34;type&#34;: &#34;string&#34;, &#34;maxLength&#34;: 500 }
  },
  &#34;$defs&#34;: {
    &#34;customer&#34;: {
      &#34;type&#34;: &#34;object&#34;,
      &#34;required&#34;: [&#34;id&#34;, &#34;name&#34;, &#34;email&#34;],
      &#34;properties&#34;: {
        &#34;id&#34;: { &#34;type&#34;: &#34;integer&#34; },
        &#34;name&#34;: { &#34;type&#34;: &#34;string&#34;, &#34;minLength&#34;: 1 },
        &#34;email&#34;: { &#34;type&#34;: &#34;string&#34;, &#34;format&#34;: &#34;email&#34; }
      }
    },
    &#34;orderItem&#34;: {
      &#34;type&#34;: &#34;object&#34;,
      &#34;required&#34;: [&#34;productId&#34;, &#34;name&#34;, &#34;quantity&#34;, &#34;price&#34;],
      &#34;properties&#34;: {
        &#34;productId&#34;: { &#34;type&#34;: &#34;string&#34; },
        &#34;name&#34;: { &#34;type&#34;: &#34;string&#34; },
        &#34;quantity&#34;: { &#34;type&#34;: &#34;integer&#34;, &#34;minimum&#34;: 1 },
        &#34;price&#34;: { &#34;type&#34;: &#34;number&#34;, &#34;minimum&#34;: 0, &#34;multipleOf&#34;: 0.01 }
      }
    },
    &#34;payment&#34;: {
      &#34;type&#34;: &#34;object&#34;,
      &#34;required&#34;: [&#34;method&#34;, &#34;amount&#34;],
      &#34;properties&#34;: {
        &#34;method&#34;: { &#34;enum&#34;: [&#34;credit_card&#34;, &#34;alipay&#34;, &#34;wechat_pay&#34;, &#34;bank_transfer&#34;] },
        &#34;amount&#34;: { &#34;type&#34;: &#34;number&#34;, &#34;minimum&#34;: 0.01 }
      },
      &#34;if&#34;: { &#34;properties&#34;: { &#34;method&#34;: { &#34;const&#34;: &#34;credit_card&#34; } } },
      &#34;then&#34;: { &#34;required&#34;: [&#34;method&#34;, &#34;amount&#34;, &#34;cardLast4&#34;] },
      &#34;else&#34;: {}
    }
  }
}</code></pre>
<h2>常用验证库对比</h2>
<table>
<thead><tr><th>语言</th><th>库</th><th>Draft 2020-12</th><th>特点</th></tr></thead>
<tbody>
<tr><td>JavaScript</td><td>ajv</td><td>✓</td><td>最快的 JS 验证器，支持代码生成</td></tr>
<tr><td>Python</td><td>jsonschema</td><td>✓</td><td>标准库风格，纯 Python</td></tr>
<tr><td>Go</td><td>santhosh-tekuri/jsonschema</td><td>✓</td><td>高性能，完整规范支持</td></tr>
<tr><td>Java</td><td>networknt/json-schema-validator</td><td>✓</td><td>与 Jackson 深度集成</td></tr>
<tr><td>Rust</td><td>jsonschema-rs</td><td>✓</td><td>Rust 原生，极致性能</td></tr>
</tbody>
</table>
<h2>小结</h2>
<ul>
<li><code>allOf</code> / <code>anyOf</code> / <code>oneOf</code> / <code>not</code> 构建复杂逻辑</li>
<li><code>if</code> / <code>then</code> / <code>else</code> 实现字段间的条件依赖</li>
<li><code>$ref</code> + <code>$defs</code> 实现 Schema 模块化复用</li>
<li>递归引用可以描述树形嵌套结构</li>
<li>大型项目建议拆分 Schema 文件，用外部引用组织</li>
</ul>
`
};

window.LEARN_ARTICLES["jsonpath"] = {
zh: `<h1>JSONPath 查询语法完全指南</h1>
<h2>什么是 JSONPath</h2>
<p>JSONPath 是一种从 JSON 文档中提取数据的查询语言，类似于 XML 的 XPath。2024 年正式成为 IETF 标准（RFC 9535）。</p>
<p>假设你有一个包含 1000 个商品的 JSON，只需要提取所有价格大于 100 的商品名称——JSONPath 一行表达式就能搞定。</p>
<h2>基本语法</h2>
<p>以这个 JSON 为例：</p>
<pre><code class="language-json">{
  &#34;store&#34;: {
    &#34;name&#34;: &#34;TechShop&#34;,
    &#34;books&#34;: [
      { &#34;title&#34;: &#34;JSON权威指南&#34;, &#34;author&#34;: &#34;张三&#34;, &#34;price&#34;: 59.9, &#34;isbn&#34;: &#34;978-1-234&#34; },
      { &#34;title&#34;: &#34;Go语言实战&#34;, &#34;author&#34;: &#34;李四&#34;, &#34;price&#34;: 79.0, &#34;isbn&#34;: &#34;978-1-567&#34; },
      { &#34;title&#34;: &#34;深入Rust&#34;, &#34;author&#34;: &#34;王五&#34;, &#34;price&#34;: 128.0, &#34;isbn&#34;: &#34;978-1-890&#34; }
    ],
    &#34;electronics&#34;: [
      { &#34;name&#34;: &#34;键盘&#34;, &#34;price&#34;: 299.0 },
      { &#34;name&#34;: &#34;鼠标&#34;, &#34;price&#34;: 149.0 }
    ]
  }
}</code></pre>
<h3>核心操作符</h3>
<table>
<thead><tr><th>表达式</th><th>含义</th><th>结果</th></tr></thead>
<tbody>
<tr><td><code>$</code></td><td>根节点</td><td>整个文档</td></tr>
<tr><td><code>$.store.name</code></td><td>点号取属性</td><td><code>&#34;TechShop&#34;</code></td></tr>
<tr><td><code>$[&#39;store&#39;][&#39;name&#39;]</code></td><td>括号取属性</td><td><code>&#34;TechShop&#34;</code></td></tr>
<tr><td><code>$.store.books[0]</code></td><td>数组索引</td><td>第一本书</td></tr>
<tr><td><code>$.store.books[-1]</code></td><td>负索引</td><td>最后一本书</td></tr>
<tr><td><code>$.store.books[0,2]</code></td><td>多个索引</td><td>第1和第3本书</td></tr>
<tr><td><code>$.store.books[0:2]</code></td><td>切片</td><td>前2本书</td></tr>
<tr><td><code>$.store..price</code></td><td>递归下降</td><td>所有 price 值</td></tr>
<tr><td><code>$.store.books[*].title</code></td><td>通配符</td><td>所有书的标题</td></tr>
</tbody>
</table>
<h3>切片语法</h3>
<pre><code>[start:end:step]</code></pre>
<table>
<thead><tr><th>表达式</th><th>含义</th></tr></thead>
<tbody>
<tr><td><code>[0:3]</code></td><td>索引 0、1、2</td></tr>
<tr><td><code>[1:]</code></td><td>从索引 1 到末尾</td></tr>
<tr><td><code>[:2]</code></td><td>前 2 个元素</td></tr>
<tr><td><code>[::2]</code></td><td>每隔一个取一个</td></tr>
<tr><td><code>[-2:]</code></td><td>最后 2 个元素</td></tr>
</tbody>
</table>
<h2>过滤表达式</h2>
<p>过滤器是 JSONPath 最强大的功能，使用 <code>?()</code> 语法：</p>
<pre><code>$.store.books[?(@.price &gt; 100)]</code></pre>
<p><code>@</code> 表示当前元素。</p>
<h3>常用过滤示例</h3>
<pre><code># 价格大于 100 的书
$.store.books[?(@.price &gt; 100)]

# 作者是&#34;张三&#34;的书
$.store.books[?(@.author == &#39;张三&#39;)]

# 有 isbn 字段的书
$.store.books[?(@.isbn)]

# 价格在 50-100 之间的书
$.store.books[?(@.price &gt;= 50 &amp;&amp; @.price &lt;= 100)]

# 标题包含&#34;Go&#34;的书
$.store.books[?(@.title =~ /Go/)]</code></pre>
<h3>过滤操作符</h3>
<table>
<thead><tr><th>操作符</th><th>含义</th></tr></thead>
<tbody>
<tr><td><code>==</code>, <code>!=</code></td><td>等于、不等于</td></tr>
<tr><td><code>&gt;</code>, <code>&gt;=</code>, <code>&lt;</code>, <code>&lt;=</code></td><td>比较</td></tr>
<tr><td><code>&amp;&amp;</code></td><td>逻辑与</td></tr>
<tr><td>\`\\</td><td>\\</td><td>\`</td><td>逻辑或</td></tr>
<tr><td><code>!</code></td><td>逻辑非</td></tr>
<tr><td><code>=~</code></td><td>正则匹配（部分实现支持）</td></tr>
<tr><td><code>in</code></td><td>包含于（部分实现支持）</td></tr>
</tbody>
</table>
<h2>各语言实现</h2>
<h3>JavaScript（jsonpath-plus）</h3>
<pre><code class="language-javascript">const { JSONPath } = require(&#34;jsonpath-plus&#34;);

const data = { /* 上面的 JSON */ };

// 所有价格
const prices = JSONPath({ path: &#34;$.store..price&#34;, json: data });
console.log(prices); // [59.9, 79.0, 128.0, 299.0, 149.0]

// 价格大于 100 的书名
const expensive = JSONPath({
  path: &#39;$.store.books[?(@.price &gt; 100)].title&#39;,
  json: data
});
console.log(expensive); // [&#34;深入Rust&#34;]</code></pre>
<h3>Python（jsonpath-ng）</h3>
<pre><code class="language-python">from jsonpath_ng.ext import parse

data = { ... }

# 所有书的标题
expr = parse(&#34;$.store.books[*].title&#34;)
titles = [match.value for match in expr.find(data)]
print(titles)  # [&#39;JSON权威指南&#39;, &#39;Go语言实战&#39;, &#39;深入Rust&#39;]

# 价格大于 100 的
expr = parse(&#34;$.store.books[?price &gt; 100].title&#34;)
expensive = [m.value for m in expr.find(data)]</code></pre>
<h3>命令行（jq 中的等价操作）</h3>
<pre><code class="language-bash"># 所有价格（jq 不是 JSONPath，但功能类似）
echo &#34;$JSON&#34; | jq &#39;.store | .. | .price? // empty&#39;

# JSONPath CLI 工具
pip install jsonpath-ng
jsonpath &#34;$.store.books[*].title&#34; &lt; data.json</code></pre>
<h2>实际应用场景</h2>
<h3>1. API 响应数据提取</h3>
<pre><code class="language-javascript">// 从分页 API 响应中提取用户邮箱
const emails = JSONPath({
  path: &#34;$.data.users[*].email&#34;,
  json: apiResponse
});</code></pre>
<h3>2. 配置文件查询</h3>
<pre><code class="language-python"># 从复杂配置中提取所有数据库连接字符串
expr = parse(&#34;$.services[*].database.connectionString&#34;)
connections = [m.value for m in expr.find(config)]</code></pre>
<h3>3. 日志分析</h3>
<pre><code class="language-bash"># 提取所有错误级别的日志消息
cat logs.json | jsonpath &#39;$.entries[?(@.level==&#34;error&#34;)].message&#39;</code></pre>
<h3>4. 测试断言</h3>
<pre><code class="language-javascript">// 在 API 测试中验证响应结构
const orderIds = JSONPath({ path: &#34;$.orders[*].id&#34;, json: response });
expect(orderIds).toHaveLength(3);
expect(orderIds).toContain(&#34;ORD-001&#34;);</code></pre>
<h2>JSONPath vs jq</h2>
<table>
<thead><tr><th>维度</th><th>JSONPath</th><th>jq</th></tr></thead>
<tbody>
<tr><td>定位</td><td>查询语言</td><td>转换语言</td></tr>
<tr><td>标准化</td><td>RFC 9535</td><td>无正式标准</td></tr>
<tr><td>功能</td><td>读取 / 过滤</td><td>读取 / 过滤 / 转换 / 构造</td></tr>
<tr><td>学习曲线</td><td>低</td><td>中高</td></tr>
<tr><td>嵌入性</td><td>适合嵌入应用</td><td>适合命令行</td></tr>
</tbody>
</table>
<h2>小结</h2>
<ul>
<li>JSONPath 用类似 XPath 的语法从 JSON 中提取数据</li>
<li><code>$</code> 根节点、<code>.</code> 属性访问、<code>[*]</code> 通配、<code>..</code> 递归下降</li>
<li>过滤器 <code>?()</code> 支持条件筛选，是最强大的功能</li>
<li>已成为 IETF 标准（RFC 9535），各语言都有成熟实现</li>
<li>适合 API 响应处理、配置提取、测试断言等场景</li>
</ul>
`,
en: `<h1>JSONPath 查询语法完全指南</h1>
<h2>什么是 JSONPath</h2>
<p>JSONPath 是一种从 JSON 文档中提取数据的查询语言，类似于 XML 的 XPath。2024 年正式成为 IETF 标准（RFC 9535）。</p>
<p>假设你有一个包含 1000 个商品的 JSON，只需要提取所有价格大于 100 的商品名称——JSONPath 一行表达式就能搞定。</p>
<h2>基本语法</h2>
<p>以这个 JSON 为例：</p>
<pre><code class="language-json">{
  &#34;store&#34;: {
    &#34;name&#34;: &#34;TechShop&#34;,
    &#34;books&#34;: [
      { &#34;title&#34;: &#34;JSON权威指南&#34;, &#34;author&#34;: &#34;张三&#34;, &#34;price&#34;: 59.9, &#34;isbn&#34;: &#34;978-1-234&#34; },
      { &#34;title&#34;: &#34;Go语言实战&#34;, &#34;author&#34;: &#34;李四&#34;, &#34;price&#34;: 79.0, &#34;isbn&#34;: &#34;978-1-567&#34; },
      { &#34;title&#34;: &#34;深入Rust&#34;, &#34;author&#34;: &#34;王五&#34;, &#34;price&#34;: 128.0, &#34;isbn&#34;: &#34;978-1-890&#34; }
    ],
    &#34;electronics&#34;: [
      { &#34;name&#34;: &#34;键盘&#34;, &#34;price&#34;: 299.0 },
      { &#34;name&#34;: &#34;鼠标&#34;, &#34;price&#34;: 149.0 }
    ]
  }
}</code></pre>
<h3>核心操作符</h3>
<table>
<thead><tr><th>表达式</th><th>含义</th><th>结果</th></tr></thead>
<tbody>
<tr><td><code>$</code></td><td>根节点</td><td>整个文档</td></tr>
<tr><td><code>$.store.name</code></td><td>点号取属性</td><td><code>&#34;TechShop&#34;</code></td></tr>
<tr><td><code>$[&#39;store&#39;][&#39;name&#39;]</code></td><td>括号取属性</td><td><code>&#34;TechShop&#34;</code></td></tr>
<tr><td><code>$.store.books[0]</code></td><td>数组索引</td><td>第一本书</td></tr>
<tr><td><code>$.store.books[-1]</code></td><td>负索引</td><td>最后一本书</td></tr>
<tr><td><code>$.store.books[0,2]</code></td><td>多个索引</td><td>第1和第3本书</td></tr>
<tr><td><code>$.store.books[0:2]</code></td><td>切片</td><td>前2本书</td></tr>
<tr><td><code>$.store..price</code></td><td>递归下降</td><td>所有 price 值</td></tr>
<tr><td><code>$.store.books[*].title</code></td><td>通配符</td><td>所有书的标题</td></tr>
</tbody>
</table>
<h3>切片语法</h3>
<pre><code>[start:end:step]</code></pre>
<table>
<thead><tr><th>表达式</th><th>含义</th></tr></thead>
<tbody>
<tr><td><code>[0:3]</code></td><td>索引 0、1、2</td></tr>
<tr><td><code>[1:]</code></td><td>从索引 1 到末尾</td></tr>
<tr><td><code>[:2]</code></td><td>前 2 个元素</td></tr>
<tr><td><code>[::2]</code></td><td>每隔一个取一个</td></tr>
<tr><td><code>[-2:]</code></td><td>最后 2 个元素</td></tr>
</tbody>
</table>
<h2>过滤表达式</h2>
<p>过滤器是 JSONPath 最强大的功能，使用 <code>?()</code> 语法：</p>
<pre><code>$.store.books[?(@.price &gt; 100)]</code></pre>
<p><code>@</code> 表示当前元素。</p>
<h3>常用过滤示例</h3>
<pre><code># 价格大于 100 的书
$.store.books[?(@.price &gt; 100)]

# 作者是&#34;张三&#34;的书
$.store.books[?(@.author == &#39;张三&#39;)]

# 有 isbn 字段的书
$.store.books[?(@.isbn)]

# 价格在 50-100 之间的书
$.store.books[?(@.price &gt;= 50 &amp;&amp; @.price &lt;= 100)]

# 标题包含&#34;Go&#34;的书
$.store.books[?(@.title =~ /Go/)]</code></pre>
<h3>过滤操作符</h3>
<table>
<thead><tr><th>操作符</th><th>含义</th></tr></thead>
<tbody>
<tr><td><code>==</code>, <code>!=</code></td><td>等于、不等于</td></tr>
<tr><td><code>&gt;</code>, <code>&gt;=</code>, <code>&lt;</code>, <code>&lt;=</code></td><td>比较</td></tr>
<tr><td><code>&amp;&amp;</code></td><td>逻辑与</td></tr>
<tr><td>\`\\</td><td>\\</td><td>\`</td><td>逻辑或</td></tr>
<tr><td><code>!</code></td><td>逻辑非</td></tr>
<tr><td><code>=~</code></td><td>正则匹配（部分实现支持）</td></tr>
<tr><td><code>in</code></td><td>包含于（部分实现支持）</td></tr>
</tbody>
</table>
<h2>各语言实现</h2>
<h3>JavaScript（jsonpath-plus）</h3>
<pre><code class="language-javascript">const { JSONPath } = require(&#34;jsonpath-plus&#34;);

const data = { /* 上面的 JSON */ };

// 所有价格
const prices = JSONPath({ path: &#34;$.store..price&#34;, json: data });
console.log(prices); // [59.9, 79.0, 128.0, 299.0, 149.0]

// 价格大于 100 的书名
const expensive = JSONPath({
  path: &#39;$.store.books[?(@.price &gt; 100)].title&#39;,
  json: data
});
console.log(expensive); // [&#34;深入Rust&#34;]</code></pre>
<h3>Python（jsonpath-ng）</h3>
<pre><code class="language-python">from jsonpath_ng.ext import parse

data = { ... }

# 所有书的标题
expr = parse(&#34;$.store.books[*].title&#34;)
titles = [match.value for match in expr.find(data)]
print(titles)  # [&#39;JSON权威指南&#39;, &#39;Go语言实战&#39;, &#39;深入Rust&#39;]

# 价格大于 100 的
expr = parse(&#34;$.store.books[?price &gt; 100].title&#34;)
expensive = [m.value for m in expr.find(data)]</code></pre>
<h3>命令行（jq 中的等价操作）</h3>
<pre><code class="language-bash"># 所有价格（jq 不是 JSONPath，但功能类似）
echo &#34;$JSON&#34; | jq &#39;.store | .. | .price? // empty&#39;

# JSONPath CLI 工具
pip install jsonpath-ng
jsonpath &#34;$.store.books[*].title&#34; &lt; data.json</code></pre>
<h2>实际应用场景</h2>
<h3>1. API 响应数据提取</h3>
<pre><code class="language-javascript">// 从分页 API 响应中提取用户邮箱
const emails = JSONPath({
  path: &#34;$.data.users[*].email&#34;,
  json: apiResponse
});</code></pre>
<h3>2. 配置文件查询</h3>
<pre><code class="language-python"># 从复杂配置中提取所有数据库连接字符串
expr = parse(&#34;$.services[*].database.connectionString&#34;)
connections = [m.value for m in expr.find(config)]</code></pre>
<h3>3. 日志分析</h3>
<pre><code class="language-bash"># 提取所有错误级别的日志消息
cat logs.json | jsonpath &#39;$.entries[?(@.level==&#34;error&#34;)].message&#39;</code></pre>
<h3>4. 测试断言</h3>
<pre><code class="language-javascript">// 在 API 测试中验证响应结构
const orderIds = JSONPath({ path: &#34;$.orders[*].id&#34;, json: response });
expect(orderIds).toHaveLength(3);
expect(orderIds).toContain(&#34;ORD-001&#34;);</code></pre>
<h2>JSONPath vs jq</h2>
<table>
<thead><tr><th>维度</th><th>JSONPath</th><th>jq</th></tr></thead>
<tbody>
<tr><td>定位</td><td>查询语言</td><td>转换语言</td></tr>
<tr><td>标准化</td><td>RFC 9535</td><td>无正式标准</td></tr>
<tr><td>功能</td><td>读取 / 过滤</td><td>读取 / 过滤 / 转换 / 构造</td></tr>
<tr><td>学习曲线</td><td>低</td><td>中高</td></tr>
<tr><td>嵌入性</td><td>适合嵌入应用</td><td>适合命令行</td></tr>
</tbody>
</table>
<h2>小结</h2>
<ul>
<li>JSONPath 用类似 XPath 的语法从 JSON 中提取数据</li>
<li><code>$</code> 根节点、<code>.</code> 属性访问、<code>[*]</code> 通配、<code>..</code> 递归下降</li>
<li>过滤器 <code>?()</code> 支持条件筛选，是最强大的功能</li>
<li>已成为 IETF 标准（RFC 9535），各语言都有成熟实现</li>
<li>适合 API 响应处理、配置提取、测试断言等场景</li>
</ul>
`
};

window.LEARN_ARTICLES["jq-guide"] = {
zh: `<h1>jq 命令行 JSON 处理完全指南</h1>
<h2>什么是 jq</h2>
<p>jq 是命令行下的 JSON 处理神器。它就像是 JSON 的 <code>sed</code> + <code>awk</code>：能查询、过滤、转换、构造 JSON 数据，而且无需写完整程序。</p>
<pre><code class="language-bash"># 安装
# macOS
brew install jq
# Ubuntu/Debian
sudo apt install jq
# Windows
choco install jq</code></pre>
<h2>基础查询</h2>
<pre><code class="language-bash"># 美化输出
echo &#39;{&#34;name&#34;:&#34;Alice&#34;,&#34;age&#34;:25}&#39; | jq &#39;.&#39;

# 提取字段
echo &#39;{&#34;name&#34;:&#34;Alice&#34;,&#34;age&#34;:25}&#39; | jq &#39;.name&#39;
# &#34;Alice&#34;

# 提取嵌套字段
echo &#39;{&#34;user&#34;:{&#34;name&#34;:&#34;Alice&#34;,&#34;addr&#34;:{&#34;city&#34;:&#34;Beijing&#34;}}}&#39; | jq &#39;.user.addr.city&#39;
# &#34;Beijing&#34;

# 去掉字符串引号（raw output）
echo &#39;{&#34;name&#34;:&#34;Alice&#34;}&#39; | jq -r &#39;.name&#39;
# Alice</code></pre>
<h2>数组操作</h2>
<pre><code class="language-bash">DATA=&#39;[{&#34;name&#34;:&#34;Alice&#34;,&#34;age&#34;:25},{&#34;name&#34;:&#34;Bob&#34;,&#34;age&#34;:30},{&#34;name&#34;:&#34;Carol&#34;,&#34;age&#34;:28}]&#39;

# 取所有名字
echo &#34;$DATA&#34; | jq &#39;.[].name&#39;
# &#34;Alice&#34;
# &#34;Bob&#34;
# &#34;Carol&#34;

# 取第一个元素
echo &#34;$DATA&#34; | jq &#39;.[0]&#39;

# 切片
echo &#34;$DATA&#34; | jq &#39;.[:2]&#39;

# 数组长度
echo &#34;$DATA&#34; | jq &#39;length&#39;
# 3</code></pre>
<h2>过滤与条件</h2>
<pre><code class="language-bash"># 年龄大于 25 的人
echo &#34;$DATA&#34; | jq &#39;.[] | select(.age &gt; 25)&#39;

# 组合条件
echo &#34;$DATA&#34; | jq &#39;.[] | select(.age &gt; 25 and .name != &#34;Bob&#34;)&#39;

# 重新包装成数组
echo &#34;$DATA&#34; | jq &#39;[.[] | select(.age &gt; 25)]&#39;</code></pre>
<h2>数据转换</h2>
<h3>构造新对象</h3>
<pre><code class="language-bash">echo &#34;$DATA&#34; | jq &#39;.[] | { username: .name, birth_year: (2025 - .age) }&#39;
# { &#34;username&#34;: &#34;Alice&#34;, &#34;birth_year&#34;: 2000 }
# { &#34;username&#34;: &#34;Bob&#34;,   &#34;birth_year&#34;: 1995 }
# ...</code></pre>
<h3>map 和 map_values</h3>
<pre><code class="language-bash"># 对数组每个元素操作
echo &#34;$DATA&#34; | jq &#39;map({ name: .name, senior: (.age &gt;= 28) })&#39;

# 所有年龄加 1
echo &#34;$DATA&#34; | jq &#39;map(.age += 1)&#39;</code></pre>
<h3>字符串操作</h3>
<pre><code class="language-bash"># 拼接字符串
echo &#39;{&#34;first&#34;:&#34;John&#34;,&#34;last&#34;:&#34;Doe&#34;}&#39; | jq &#39;.first + &#34; &#34; + .last&#39;
# &#34;John Doe&#34;

# 字符串插值
echo &#39;{&#34;name&#34;:&#34;Alice&#34;,&#34;age&#34;:25}&#39; | jq &#39;&#34;\\(.name) is \\(.age) years old&#34;&#39;
# &#34;Alice is 25 years old&#34;

# 分割和连接
echo &#39;&#34;a,b,c&#34;&#39; | jq &#39;split(&#34;,&#34;)&#39;
# [&#34;a&#34;,&#34;b&#34;,&#34;c&#34;]
echo &#39;[&#34;a&#34;,&#34;b&#34;,&#34;c&#34;]&#39; | jq &#39;join(&#34;-&#34;)&#39;
# &#34;a-b-c&#34;</code></pre>
<h2>聚合函数</h2>
<pre><code class="language-bash">NUMS=&#39;[10, 20, 30, 40, 50]&#39;

echo &#34;$NUMS&#34; | jq &#39;add&#39;        # 150
echo &#34;$NUMS&#34; | jq &#39;min&#39;        # 10
echo &#34;$NUMS&#34; | jq &#39;max&#39;        # 50
echo &#34;$NUMS&#34; | jq &#39;add/length&#39; # 30（平均值）

# 对象数组的聚合
echo &#34;$DATA&#34; | jq &#39;[.[].age] | add / length&#39;
# 27.666...</code></pre>
<h2>分组与排序</h2>
<pre><code class="language-bash">ITEMS=&#39;[
  {&#34;category&#34;:&#34;fruit&#34;,&#34;name&#34;:&#34;apple&#34;,&#34;price&#34;:3},
  {&#34;category&#34;:&#34;fruit&#34;,&#34;name&#34;:&#34;banana&#34;,&#34;price&#34;:2},
  {&#34;category&#34;:&#34;veggie&#34;,&#34;name&#34;:&#34;carrot&#34;,&#34;price&#34;:4}
]&#39;

# 按价格排序
echo &#34;$ITEMS&#34; | jq &#39;sort_by(.price)&#39;

# 按类别分组
echo &#34;$ITEMS&#34; | jq &#39;group_by(.category) | map({ category: .[0].category, items: map(.name) })&#39;
# [{&#34;category&#34;:&#34;fruit&#34;,&#34;items&#34;:[&#34;banana&#34;,&#34;apple&#34;]}, ...]

# 去重
echo &#39;[1,2,2,3,3,3]&#39; | jq &#39;unique&#39;
# [1,2,3]</code></pre>
<h2>高级技巧</h2>
<h3>处理文件</h3>
<pre><code class="language-bash"># 读取文件
jq &#39;.users[] | select(.active)&#39; users.json

# 输出到文件
jq &#39;.data&#39; input.json &gt; output.json

# 紧凑输出（无换行）
jq -c &#39;.&#39; input.json</code></pre>
<h3>多文件合并</h3>
<pre><code class="language-bash"># 合并两个 JSON 对象
jq -s &#39;.[0] * .[1]&#39; defaults.json overrides.json

# 合并多个数组
jq -s &#39;add&#39; file1.json file2.json file3.json</code></pre>
<h3>处理 NDJSON</h3>
<pre><code class="language-bash"># 逐行处理（默认行为）
cat events.ndjson | jq &#39;select(.level == &#34;error&#34;)&#39;

# 收集为数组
cat events.ndjson | jq -s &#39;.&#39;</code></pre>
<h3>条件赋值和更新</h3>
<pre><code class="language-bash"># 更新特定字段
echo &#39;{&#34;name&#34;:&#34;Alice&#34;,&#34;status&#34;:&#34;active&#34;}&#39; | jq &#39;.status = &#34;inactive&#34;&#39;

# 条件更新
echo &#34;$DATA&#34; | jq &#39;map(if .age &gt; 28 then .category = &#34;senior&#34; else .category = &#34;junior&#34; end)&#39;

# 删除字段
echo &#39;{&#34;a&#34;:1,&#34;b&#34;:2,&#34;c&#34;:3}&#39; | jq &#39;del(.b)&#39;
# {&#34;a&#34;:1,&#34;c&#34;:3}</code></pre>
<h3>环境变量和参数</h3>
<pre><code class="language-bash"># 传入外部变量
NAME=&#34;Alice&#34;
echo &#34;$DATA&#34; | jq --arg name &#34;$NAME&#34; &#39;.[] | select(.name == $name)&#39;

# 传入 JSON 值
echo &#39;{}&#39; | jq --argjson count 42 &#39;. + {count: $count}&#39;</code></pre>
<h2>实战示例</h2>
<h3>API 响应处理</h3>
<pre><code class="language-bash"># 从 GitHub API 提取仓库信息
curl -s &#39;https://api.github.com/users/torvalds/repos?per_page=5&#39; | \\
  jq &#39;.[] | { name: .name, stars: .stargazers_count, language: .language }&#39; 

# 按 star 数排序取 Top 3
curl -s &#39;https://api.github.com/users/torvalds/repos&#39; | \\
  jq &#39;sort_by(-.stargazers_count) | .[:3] | .[] | &#34;\\(.name): \\(.stargazers_count) stars&#34;&#39;</code></pre>
<h3>日志分析</h3>
<pre><code class="language-bash"># 统计各级别日志数量
cat app.log.json | jq -s &#39;group_by(.level) | map({level: .[0].level, count: length})&#39;

# 提取最近 10 条错误
cat app.log.json | jq -s &#39;[.[] | select(.level==&#34;error&#34;)] | sort_by(.timestamp) | .[-10:]&#39;</code></pre>
<h3>CSV 转换</h3>
<pre><code class="language-bash"># JSON 数组转 CSV
echo &#34;$DATA&#34; | jq -r &#39;[&#34;name&#34;,&#34;age&#34;], (.[] | [.name, .age]) | @csv&#39;
# &#34;name&#34;,&#34;age&#34;
# &#34;Alice&#34;,25
# &#34;Bob&#34;,30</code></pre>
<h2>常用 jq 速查</h2>
<table>
<thead><tr><th>操作</th><th>语法</th></tr></thead>
<tbody>
<tr><td>美化</td><td><code>jq &#39;.&#39;</code></td></tr>
<tr><td>紧凑</td><td><code>jq -c &#39;.&#39;</code></td></tr>
<tr><td>提取字段</td><td><code>jq &#39;.key&#39;</code></td></tr>
<tr><td>数组元素</td><td><code>jq &#39;.[0]&#39;</code>、<code>jq &#39;.[]&#39;</code></td></tr>
<tr><td>过滤</td><td>\`jq '.[] \\</td><td>select(.x > 1)'\`</td></tr>
<tr><td>构造对象</td><td><code>jq &#39;{ a: .x, b: .y }&#39;</code></td></tr>
<tr><td>排序</td><td><code>jq &#39;sort_by(.key)&#39;</code></td></tr>
<tr><td>去重</td><td><code>jq &#39;unique&#39;</code></td></tr>
<tr><td>长度</td><td><code>jq &#39;length&#39;</code></td></tr>
<tr><td>键名</td><td><code>jq &#39;keys&#39;</code></td></tr>
<tr><td>类型</td><td><code>jq &#39;type&#39;</code></td></tr>
<tr><td>删除字段</td><td><code>jq &#39;del(.key)&#39;</code></td></tr>
</tbody>
</table>
<h2>小结</h2>
<ul>
<li>jq 是命令行下处理 JSON 的最佳工具</li>
<li>支持查询、过滤、转换、聚合、分组等全套操作</li>
<li><code>-r</code> 输出原始字符串，<code>-c</code> 紧凑输出，<code>-s</code> 收集为数组</li>
<li><code>select()</code> 过滤、<code>map()</code> 映射、<code>group_by()</code> 分组</li>
<li>结合 <code>curl</code> 可以快速处理 API 响应</li>
</ul>
`,
en: `<h1>jq 命令行 JSON 处理完全指南</h1>
<h2>什么是 jq</h2>
<p>jq 是命令行下的 JSON 处理神器。它就像是 JSON 的 <code>sed</code> + <code>awk</code>：能查询、过滤、转换、构造 JSON 数据，而且无需写完整程序。</p>
<pre><code class="language-bash"># 安装
# macOS
brew install jq
# Ubuntu/Debian
sudo apt install jq
# Windows
choco install jq</code></pre>
<h2>基础查询</h2>
<pre><code class="language-bash"># 美化输出
echo &#39;{&#34;name&#34;:&#34;Alice&#34;,&#34;age&#34;:25}&#39; | jq &#39;.&#39;

# 提取字段
echo &#39;{&#34;name&#34;:&#34;Alice&#34;,&#34;age&#34;:25}&#39; | jq &#39;.name&#39;
# &#34;Alice&#34;

# 提取嵌套字段
echo &#39;{&#34;user&#34;:{&#34;name&#34;:&#34;Alice&#34;,&#34;addr&#34;:{&#34;city&#34;:&#34;Beijing&#34;}}}&#39; | jq &#39;.user.addr.city&#39;
# &#34;Beijing&#34;

# 去掉字符串引号（raw output）
echo &#39;{&#34;name&#34;:&#34;Alice&#34;}&#39; | jq -r &#39;.name&#39;
# Alice</code></pre>
<h2>数组操作</h2>
<pre><code class="language-bash">DATA=&#39;[{&#34;name&#34;:&#34;Alice&#34;,&#34;age&#34;:25},{&#34;name&#34;:&#34;Bob&#34;,&#34;age&#34;:30},{&#34;name&#34;:&#34;Carol&#34;,&#34;age&#34;:28}]&#39;

# 取所有名字
echo &#34;$DATA&#34; | jq &#39;.[].name&#39;
# &#34;Alice&#34;
# &#34;Bob&#34;
# &#34;Carol&#34;

# 取第一个元素
echo &#34;$DATA&#34; | jq &#39;.[0]&#39;

# 切片
echo &#34;$DATA&#34; | jq &#39;.[:2]&#39;

# 数组长度
echo &#34;$DATA&#34; | jq &#39;length&#39;
# 3</code></pre>
<h2>过滤与条件</h2>
<pre><code class="language-bash"># 年龄大于 25 的人
echo &#34;$DATA&#34; | jq &#39;.[] | select(.age &gt; 25)&#39;

# 组合条件
echo &#34;$DATA&#34; | jq &#39;.[] | select(.age &gt; 25 and .name != &#34;Bob&#34;)&#39;

# 重新包装成数组
echo &#34;$DATA&#34; | jq &#39;[.[] | select(.age &gt; 25)]&#39;</code></pre>
<h2>数据转换</h2>
<h3>构造新对象</h3>
<pre><code class="language-bash">echo &#34;$DATA&#34; | jq &#39;.[] | { username: .name, birth_year: (2025 - .age) }&#39;
# { &#34;username&#34;: &#34;Alice&#34;, &#34;birth_year&#34;: 2000 }
# { &#34;username&#34;: &#34;Bob&#34;,   &#34;birth_year&#34;: 1995 }
# ...</code></pre>
<h3>map 和 map_values</h3>
<pre><code class="language-bash"># 对数组每个元素操作
echo &#34;$DATA&#34; | jq &#39;map({ name: .name, senior: (.age &gt;= 28) })&#39;

# 所有年龄加 1
echo &#34;$DATA&#34; | jq &#39;map(.age += 1)&#39;</code></pre>
<h3>字符串操作</h3>
<pre><code class="language-bash"># 拼接字符串
echo &#39;{&#34;first&#34;:&#34;John&#34;,&#34;last&#34;:&#34;Doe&#34;}&#39; | jq &#39;.first + &#34; &#34; + .last&#39;
# &#34;John Doe&#34;

# 字符串插值
echo &#39;{&#34;name&#34;:&#34;Alice&#34;,&#34;age&#34;:25}&#39; | jq &#39;&#34;\\(.name) is \\(.age) years old&#34;&#39;
# &#34;Alice is 25 years old&#34;

# 分割和连接
echo &#39;&#34;a,b,c&#34;&#39; | jq &#39;split(&#34;,&#34;)&#39;
# [&#34;a&#34;,&#34;b&#34;,&#34;c&#34;]
echo &#39;[&#34;a&#34;,&#34;b&#34;,&#34;c&#34;]&#39; | jq &#39;join(&#34;-&#34;)&#39;
# &#34;a-b-c&#34;</code></pre>
<h2>聚合函数</h2>
<pre><code class="language-bash">NUMS=&#39;[10, 20, 30, 40, 50]&#39;

echo &#34;$NUMS&#34; | jq &#39;add&#39;        # 150
echo &#34;$NUMS&#34; | jq &#39;min&#39;        # 10
echo &#34;$NUMS&#34; | jq &#39;max&#39;        # 50
echo &#34;$NUMS&#34; | jq &#39;add/length&#39; # 30（平均值）

# 对象数组的聚合
echo &#34;$DATA&#34; | jq &#39;[.[].age] | add / length&#39;
# 27.666...</code></pre>
<h2>分组与排序</h2>
<pre><code class="language-bash">ITEMS=&#39;[
  {&#34;category&#34;:&#34;fruit&#34;,&#34;name&#34;:&#34;apple&#34;,&#34;price&#34;:3},
  {&#34;category&#34;:&#34;fruit&#34;,&#34;name&#34;:&#34;banana&#34;,&#34;price&#34;:2},
  {&#34;category&#34;:&#34;veggie&#34;,&#34;name&#34;:&#34;carrot&#34;,&#34;price&#34;:4}
]&#39;

# 按价格排序
echo &#34;$ITEMS&#34; | jq &#39;sort_by(.price)&#39;

# 按类别分组
echo &#34;$ITEMS&#34; | jq &#39;group_by(.category) | map({ category: .[0].category, items: map(.name) })&#39;
# [{&#34;category&#34;:&#34;fruit&#34;,&#34;items&#34;:[&#34;banana&#34;,&#34;apple&#34;]}, ...]

# 去重
echo &#39;[1,2,2,3,3,3]&#39; | jq &#39;unique&#39;
# [1,2,3]</code></pre>
<h2>高级技巧</h2>
<h3>处理文件</h3>
<pre><code class="language-bash"># 读取文件
jq &#39;.users[] | select(.active)&#39; users.json

# 输出到文件
jq &#39;.data&#39; input.json &gt; output.json

# 紧凑输出（无换行）
jq -c &#39;.&#39; input.json</code></pre>
<h3>多文件合并</h3>
<pre><code class="language-bash"># 合并两个 JSON 对象
jq -s &#39;.[0] * .[1]&#39; defaults.json overrides.json

# 合并多个数组
jq -s &#39;add&#39; file1.json file2.json file3.json</code></pre>
<h3>处理 NDJSON</h3>
<pre><code class="language-bash"># 逐行处理（默认行为）
cat events.ndjson | jq &#39;select(.level == &#34;error&#34;)&#39;

# 收集为数组
cat events.ndjson | jq -s &#39;.&#39;</code></pre>
<h3>条件赋值和更新</h3>
<pre><code class="language-bash"># 更新特定字段
echo &#39;{&#34;name&#34;:&#34;Alice&#34;,&#34;status&#34;:&#34;active&#34;}&#39; | jq &#39;.status = &#34;inactive&#34;&#39;

# 条件更新
echo &#34;$DATA&#34; | jq &#39;map(if .age &gt; 28 then .category = &#34;senior&#34; else .category = &#34;junior&#34; end)&#39;

# 删除字段
echo &#39;{&#34;a&#34;:1,&#34;b&#34;:2,&#34;c&#34;:3}&#39; | jq &#39;del(.b)&#39;
# {&#34;a&#34;:1,&#34;c&#34;:3}</code></pre>
<h3>环境变量和参数</h3>
<pre><code class="language-bash"># 传入外部变量
NAME=&#34;Alice&#34;
echo &#34;$DATA&#34; | jq --arg name &#34;$NAME&#34; &#39;.[] | select(.name == $name)&#39;

# 传入 JSON 值
echo &#39;{}&#39; | jq --argjson count 42 &#39;. + {count: $count}&#39;</code></pre>
<h2>实战示例</h2>
<h3>API 响应处理</h3>
<pre><code class="language-bash"># 从 GitHub API 提取仓库信息
curl -s &#39;https://api.github.com/users/torvalds/repos?per_page=5&#39; | \\
  jq &#39;.[] | { name: .name, stars: .stargazers_count, language: .language }&#39; 

# 按 star 数排序取 Top 3
curl -s &#39;https://api.github.com/users/torvalds/repos&#39; | \\
  jq &#39;sort_by(-.stargazers_count) | .[:3] | .[] | &#34;\\(.name): \\(.stargazers_count) stars&#34;&#39;</code></pre>
<h3>日志分析</h3>
<pre><code class="language-bash"># 统计各级别日志数量
cat app.log.json | jq -s &#39;group_by(.level) | map({level: .[0].level, count: length})&#39;

# 提取最近 10 条错误
cat app.log.json | jq -s &#39;[.[] | select(.level==&#34;error&#34;)] | sort_by(.timestamp) | .[-10:]&#39;</code></pre>
<h3>CSV 转换</h3>
<pre><code class="language-bash"># JSON 数组转 CSV
echo &#34;$DATA&#34; | jq -r &#39;[&#34;name&#34;,&#34;age&#34;], (.[] | [.name, .age]) | @csv&#39;
# &#34;name&#34;,&#34;age&#34;
# &#34;Alice&#34;,25
# &#34;Bob&#34;,30</code></pre>
<h2>常用 jq 速查</h2>
<table>
<thead><tr><th>操作</th><th>语法</th></tr></thead>
<tbody>
<tr><td>美化</td><td><code>jq &#39;.&#39;</code></td></tr>
<tr><td>紧凑</td><td><code>jq -c &#39;.&#39;</code></td></tr>
<tr><td>提取字段</td><td><code>jq &#39;.key&#39;</code></td></tr>
<tr><td>数组元素</td><td><code>jq &#39;.[0]&#39;</code>、<code>jq &#39;.[]&#39;</code></td></tr>
<tr><td>过滤</td><td>\`jq '.[] \\</td><td>select(.x > 1)'\`</td></tr>
<tr><td>构造对象</td><td><code>jq &#39;{ a: .x, b: .y }&#39;</code></td></tr>
<tr><td>排序</td><td><code>jq &#39;sort_by(.key)&#39;</code></td></tr>
<tr><td>去重</td><td><code>jq &#39;unique&#39;</code></td></tr>
<tr><td>长度</td><td><code>jq &#39;length&#39;</code></td></tr>
<tr><td>键名</td><td><code>jq &#39;keys&#39;</code></td></tr>
<tr><td>类型</td><td><code>jq &#39;type&#39;</code></td></tr>
<tr><td>删除字段</td><td><code>jq &#39;del(.key)&#39;</code></td></tr>
</tbody>
</table>
<h2>小结</h2>
<ul>
<li>jq 是命令行下处理 JSON 的最佳工具</li>
<li>支持查询、过滤、转换、聚合、分组等全套操作</li>
<li><code>-r</code> 输出原始字符串，<code>-c</code> 紧凑输出，<code>-s</code> 收集为数组</li>
<li><code>select()</code> 过滤、<code>map()</code> 映射、<code>group_by()</code> 分组</li>
<li>结合 <code>curl</code> 可以快速处理 API 响应</li>
</ul>
`
};

window.LEARN_ARTICLES["jwt"] = {
zh: `<h1>JWT (JSON Web Token) 深入理解</h1>
<h2>什么是 JWT</h2>
<p>JWT（JSON Web Token）是一种紧凑的、URL 安全的令牌格式，用于在各方之间安全地传递 JSON 声明信息。它是现代 Web 应用中最流行的认证方案之一。</p>
<p>一个 JWT 看起来像这样：</p>
<pre><code>eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIiwiaWF0IjoxNjk5MDAwMDAwfQ.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c</code></pre>
<p>它由三部分组成，用 <code>.</code> 分隔：<strong>Header.Payload.Signature</strong></p>
<h2>JWT 结构详解</h2>
<h3>1. Header（头部）</h3>
<pre><code class="language-json">{
  &#34;alg&#34;: &#34;HS256&#34;,
  &#34;typ&#34;: &#34;JWT&#34;
}</code></pre>
<ul>
<li><code>alg</code>：签名算法（HS256、RS256、ES256 等）</li>
<li><code>typ</code>：令牌类型，固定为 <code>&#34;JWT&#34;</code></li>
</ul>
<p>Header 被 Base64URL 编码后成为 JWT 的第一部分。</p>
<h3>2. Payload（载荷）</h3>
<pre><code class="language-json">{
  &#34;sub&#34;: &#34;1234567890&#34;,
  &#34;name&#34;: &#34;Alice&#34;,
  &#34;email&#34;: &#34;alice@example.com&#34;,
  &#34;role&#34;: &#34;admin&#34;,
  &#34;iat&#34;: 1699000000,
  &#34;exp&#34;: 1699086400,
  &#34;iss&#34;: &#34;https://auth.example.com&#34;
}</code></pre>
<p>标准字段（Registered Claims）：</p>
<table>
<thead><tr><th>字段</th><th>全称</th><th>含义</th></tr></thead>
<tbody>
<tr><td><code>sub</code></td><td>Subject</td><td>主题（通常是用户 ID）</td></tr>
<tr><td><code>iss</code></td><td>Issuer</td><td>签发者</td></tr>
<tr><td><code>aud</code></td><td>Audience</td><td>接收方</td></tr>
<tr><td><code>exp</code></td><td>Expiration</td><td>过期时间（Unix 时间戳）</td></tr>
<tr><td><code>iat</code></td><td>Issued At</td><td>签发时间</td></tr>
<tr><td><code>nbf</code></td><td>Not Before</td><td>生效时间</td></tr>
<tr><td><code>jti</code></td><td>JWT ID</td><td>唯一标识</td></tr>
</tbody>
</table>
<blockquote><p><strong>重要</strong>：Payload 是 Base64URL 编码的，<strong>不是加密的</strong>。任何人都可以解码看到内容。不要在 Payload 中放密码、密钥等敏感信息。</p></blockquote>
<h3>3. Signature（签名）</h3>
<pre><code>HMACSHA256(
  base64UrlEncode(header) + &#34;.&#34; + base64UrlEncode(payload),
  secret
)</code></pre>
<p>签名确保令牌未被篡改。服务端用密钥验证签名，如果 Payload 被修改，签名就会不匹配。</p>
<h2>常用签名算法</h2>
<table>
<thead><tr><th>算法</th><th>类型</th><th>密钥</th><th>推荐场景</th></tr></thead>
<tbody>
<tr><td>HS256</td><td>对称</td><td>共享密钥</td><td>单服务、简单场景</td></tr>
<tr><td>RS256</td><td>非对称</td><td>公钥/私钥</td><td>多服务、微服务</td></tr>
<tr><td>ES256</td><td>非对称（椭圆曲线）</td><td>公钥/私钥</td><td>性能敏感场景</td></tr>
</tbody>
</table>
<p>RS256 更适合微服务：签发服务用私钥签名，其他服务用公钥验证。私钥不需要在所有服务间共享。</p>
<h2>工作流程</h2>
<pre><code>1. 用户登录 → POST /login { username, password }
2. 服务端验证凭据 → 生成 JWT（包含用户信息和过期时间）
3. 返回 JWT 给客户端
4. 客户端保存 JWT（通常在 localStorage 或 httpOnly Cookie）
5. 后续请求在 Header 中携带：Authorization: Bearer &lt;JWT&gt;
6. 服务端验证 JWT 签名 → 提取用户信息 → 处理请求</code></pre>
<h2>代码实战</h2>
<h3>Node.js</h3>
<pre><code class="language-javascript">const jwt = require(&#34;jsonwebtoken&#34;);

const SECRET = process.env.JWT_SECRET; // 至少 256 位随机字符串

// 签发
function generateToken(user) {
  return jwt.sign(
    { sub: user.id, name: user.name, role: user.role },
    SECRET,
    { expiresIn: &#34;2h&#34;, issuer: &#34;myapp&#34; }
  );
}

// 验证
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, SECRET, { issuer: &#34;myapp&#34; });
    return { valid: true, payload: decoded };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

// Express 中间件
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith(&#34;Bearer &#34;)) {
    return res.status(401).json({ error: &#34;Missing token&#34; });
  }
  const result = verifyToken(authHeader.slice(7));
  if (!result.valid) {
    return res.status(401).json({ error: result.error });
  }
  req.user = result.payload;
  next();
}</code></pre>
<h3>Python</h3>
<pre><code class="language-python">import jwt
import datetime
import os

SECRET = os.environ[&#34;JWT_SECRET&#34;]

def generate_token(user: dict) -&gt; str:
    payload = {
        &#34;sub&#34;: user[&#34;id&#34;],
        &#34;name&#34;: user[&#34;name&#34;],
        &#34;role&#34;: user[&#34;role&#34;],
        &#34;iat&#34;: datetime.datetime.utcnow(),
        &#34;exp&#34;: datetime.datetime.utcnow() + datetime.timedelta(hours=2),
        &#34;iss&#34;: &#34;myapp&#34;
    }
    return jwt.encode(payload, SECRET, algorithm=&#34;HS256&#34;)

def verify_token(token: str) -&gt; dict:
    try:
        payload = jwt.decode(token, SECRET, algorithms=[&#34;HS256&#34;], issuer=&#34;myapp&#34;)
        return {&#34;valid&#34;: True, &#34;payload&#34;: payload}
    except jwt.ExpiredSignatureError:
        return {&#34;valid&#34;: False, &#34;error&#34;: &#34;Token expired&#34;}
    except jwt.InvalidTokenError as e:
        return {&#34;valid&#34;: False, &#34;error&#34;: str(e)}</code></pre>
<h3>Go</h3>
<pre><code class="language-go">import (
    &#34;time&#34;
    &#34;github.com/golang-jwt/jwt/v5&#34;
)

var jwtSecret = []byte(os.Getenv(&#34;JWT_SECRET&#34;))

func GenerateToken(userID string, role string) (string, error) {
    claims := jwt.MapClaims{
        &#34;sub&#34;:  userID,
        &#34;role&#34;: role,
        &#34;iss&#34;:  &#34;myapp&#34;,
        &#34;iat&#34;:  time.Now().Unix(),
        &#34;exp&#34;:  time.Now().Add(2 * time.Hour).Unix(),
    }
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(jwtSecret)
}

func VerifyToken(tokenStr string) (*jwt.MapClaims, error) {
    token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
        return jwtSecret, nil
    })
    if err != nil {
        return nil, err
    }
    claims := token.Claims.(jwt.MapClaims)
    return &amp;claims, nil
}</code></pre>
<h2>安全最佳实践</h2>
<h3>必须做</h3>
<ol>
<li><strong>使用 HTTPS</strong> — JWT 本身不加密，必须通过 HTTPS 传输</li>
<li><strong>设置合理的过期时间</strong> — Access Token 短（15-30 分钟），配合 Refresh Token</li>
<li><strong>密钥强度</strong> — HS256 至少 256 位随机字符串；生产环境优先用 RS256/ES256</li>
<li><strong>验证所有标准字段</strong> — 检查 <code>exp</code>、<code>iss</code>、<code>aud</code>，不要只验签名</li>
<li><strong>指定 <code>algorithms</code> 参数</strong> — 防止算法混淆攻击</li>
</ol>
<h3>不要做</h3>
<ol>
<li><strong>不要在 Payload 存敏感数据</strong> — 它只是 Base64 编码，不是加密</li>
<li><strong>不要用 JWT 做会话管理</strong> — JWT 签发后无法撤销（除非配合黑名单）</li>
<li><strong>不要忽略 <code>exp</code></strong> — 永不过期的 JWT 是严重安全隐患</li>
<li><strong>不要在 URL 中传 JWT</strong> — URL 会被日志记录，用 Header 传递</li>
</ol>
<h3>Refresh Token 机制</h3>
<pre><code>Access Token (短期, 15min) ← 用于 API 请求
Refresh Token (长期, 7d)   ← 用于刷新 Access Token

Access Token 过期 → 用 Refresh Token 获取新的 Access Token
Refresh Token 存在数据库，可以随时撤销</code></pre>
<h2>JWT vs Session</h2>
<table>
<thead><tr><th>维度</th><th>JWT</th><th>Session</th></tr></thead>
<tbody>
<tr><td>状态</td><td>无状态</td><td>有状态（服务端存储）</td></tr>
<tr><td>扩展性</td><td>天然支持分布式</td><td>需要共享 Session 存储</td></tr>
<tr><td>撤销</td><td>困难（需黑名单）</td><td>简单（删除即可）</td></tr>
<tr><td>大小</td><td>较大（含 Payload）</td><td>较小（仅 Session ID）</td></tr>
<tr><td>适用</td><td>API、微服务、移动端</td><td>传统 Web 应用</td></tr>
</tbody>
</table>
<h2>小结</h2>
<ul>
<li>JWT 由 Header + Payload + Signature 三部分组成</li>
<li>Payload 是编码而非加密，不要存敏感数据</li>
<li>RS256（非对称）适合微服务，HS256（对称）适合简单场景</li>
<li>务必设置过期时间，配合 Refresh Token 使用</li>
<li>验证时检查签名、过期时间、签发者等所有标准字段</li>
</ul>
`,
en: `<h1>JWT (JSON Web Token) 深入理解</h1>
<h2>什么是 JWT</h2>
<p>JWT（JSON Web Token）是一种紧凑的、URL 安全的令牌格式，用于在各方之间安全地传递 JSON 声明信息。它是现代 Web 应用中最流行的认证方案之一。</p>
<p>一个 JWT 看起来像这样：</p>
<pre><code>eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIiwiaWF0IjoxNjk5MDAwMDAwfQ.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c</code></pre>
<p>它由三部分组成，用 <code>.</code> 分隔：<strong>Header.Payload.Signature</strong></p>
<h2>JWT 结构详解</h2>
<h3>1. Header（头部）</h3>
<pre><code class="language-json">{
  &#34;alg&#34;: &#34;HS256&#34;,
  &#34;typ&#34;: &#34;JWT&#34;
}</code></pre>
<ul>
<li><code>alg</code>：签名算法（HS256、RS256、ES256 等）</li>
<li><code>typ</code>：令牌类型，固定为 <code>&#34;JWT&#34;</code></li>
</ul>
<p>Header 被 Base64URL 编码后成为 JWT 的第一部分。</p>
<h3>2. Payload（载荷）</h3>
<pre><code class="language-json">{
  &#34;sub&#34;: &#34;1234567890&#34;,
  &#34;name&#34;: &#34;Alice&#34;,
  &#34;email&#34;: &#34;alice@example.com&#34;,
  &#34;role&#34;: &#34;admin&#34;,
  &#34;iat&#34;: 1699000000,
  &#34;exp&#34;: 1699086400,
  &#34;iss&#34;: &#34;https://auth.example.com&#34;
}</code></pre>
<p>标准字段（Registered Claims）：</p>
<table>
<thead><tr><th>字段</th><th>全称</th><th>含义</th></tr></thead>
<tbody>
<tr><td><code>sub</code></td><td>Subject</td><td>主题（通常是用户 ID）</td></tr>
<tr><td><code>iss</code></td><td>Issuer</td><td>签发者</td></tr>
<tr><td><code>aud</code></td><td>Audience</td><td>接收方</td></tr>
<tr><td><code>exp</code></td><td>Expiration</td><td>过期时间（Unix 时间戳）</td></tr>
<tr><td><code>iat</code></td><td>Issued At</td><td>签发时间</td></tr>
<tr><td><code>nbf</code></td><td>Not Before</td><td>生效时间</td></tr>
<tr><td><code>jti</code></td><td>JWT ID</td><td>唯一标识</td></tr>
</tbody>
</table>
<blockquote><p><strong>重要</strong>：Payload 是 Base64URL 编码的，<strong>不是加密的</strong>。任何人都可以解码看到内容。不要在 Payload 中放密码、密钥等敏感信息。</p></blockquote>
<h3>3. Signature（签名）</h3>
<pre><code>HMACSHA256(
  base64UrlEncode(header) + &#34;.&#34; + base64UrlEncode(payload),
  secret
)</code></pre>
<p>签名确保令牌未被篡改。服务端用密钥验证签名，如果 Payload 被修改，签名就会不匹配。</p>
<h2>常用签名算法</h2>
<table>
<thead><tr><th>算法</th><th>类型</th><th>密钥</th><th>推荐场景</th></tr></thead>
<tbody>
<tr><td>HS256</td><td>对称</td><td>共享密钥</td><td>单服务、简单场景</td></tr>
<tr><td>RS256</td><td>非对称</td><td>公钥/私钥</td><td>多服务、微服务</td></tr>
<tr><td>ES256</td><td>非对称（椭圆曲线）</td><td>公钥/私钥</td><td>性能敏感场景</td></tr>
</tbody>
</table>
<p>RS256 更适合微服务：签发服务用私钥签名，其他服务用公钥验证。私钥不需要在所有服务间共享。</p>
<h2>工作流程</h2>
<pre><code>1. 用户登录 → POST /login { username, password }
2. 服务端验证凭据 → 生成 JWT（包含用户信息和过期时间）
3. 返回 JWT 给客户端
4. 客户端保存 JWT（通常在 localStorage 或 httpOnly Cookie）
5. 后续请求在 Header 中携带：Authorization: Bearer &lt;JWT&gt;
6. 服务端验证 JWT 签名 → 提取用户信息 → 处理请求</code></pre>
<h2>代码实战</h2>
<h3>Node.js</h3>
<pre><code class="language-javascript">const jwt = require(&#34;jsonwebtoken&#34;);

const SECRET = process.env.JWT_SECRET; // 至少 256 位随机字符串

// 签发
function generateToken(user) {
  return jwt.sign(
    { sub: user.id, name: user.name, role: user.role },
    SECRET,
    { expiresIn: &#34;2h&#34;, issuer: &#34;myapp&#34; }
  );
}

// 验证
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, SECRET, { issuer: &#34;myapp&#34; });
    return { valid: true, payload: decoded };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

// Express 中间件
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith(&#34;Bearer &#34;)) {
    return res.status(401).json({ error: &#34;Missing token&#34; });
  }
  const result = verifyToken(authHeader.slice(7));
  if (!result.valid) {
    return res.status(401).json({ error: result.error });
  }
  req.user = result.payload;
  next();
}</code></pre>
<h3>Python</h3>
<pre><code class="language-python">import jwt
import datetime
import os

SECRET = os.environ[&#34;JWT_SECRET&#34;]

def generate_token(user: dict) -&gt; str:
    payload = {
        &#34;sub&#34;: user[&#34;id&#34;],
        &#34;name&#34;: user[&#34;name&#34;],
        &#34;role&#34;: user[&#34;role&#34;],
        &#34;iat&#34;: datetime.datetime.utcnow(),
        &#34;exp&#34;: datetime.datetime.utcnow() + datetime.timedelta(hours=2),
        &#34;iss&#34;: &#34;myapp&#34;
    }
    return jwt.encode(payload, SECRET, algorithm=&#34;HS256&#34;)

def verify_token(token: str) -&gt; dict:
    try:
        payload = jwt.decode(token, SECRET, algorithms=[&#34;HS256&#34;], issuer=&#34;myapp&#34;)
        return {&#34;valid&#34;: True, &#34;payload&#34;: payload}
    except jwt.ExpiredSignatureError:
        return {&#34;valid&#34;: False, &#34;error&#34;: &#34;Token expired&#34;}
    except jwt.InvalidTokenError as e:
        return {&#34;valid&#34;: False, &#34;error&#34;: str(e)}</code></pre>
<h3>Go</h3>
<pre><code class="language-go">import (
    &#34;time&#34;
    &#34;github.com/golang-jwt/jwt/v5&#34;
)

var jwtSecret = []byte(os.Getenv(&#34;JWT_SECRET&#34;))

func GenerateToken(userID string, role string) (string, error) {
    claims := jwt.MapClaims{
        &#34;sub&#34;:  userID,
        &#34;role&#34;: role,
        &#34;iss&#34;:  &#34;myapp&#34;,
        &#34;iat&#34;:  time.Now().Unix(),
        &#34;exp&#34;:  time.Now().Add(2 * time.Hour).Unix(),
    }
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(jwtSecret)
}

func VerifyToken(tokenStr string) (*jwt.MapClaims, error) {
    token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
        return jwtSecret, nil
    })
    if err != nil {
        return nil, err
    }
    claims := token.Claims.(jwt.MapClaims)
    return &amp;claims, nil
}</code></pre>
<h2>安全最佳实践</h2>
<h3>必须做</h3>
<ol>
<li><strong>使用 HTTPS</strong> — JWT 本身不加密，必须通过 HTTPS 传输</li>
<li><strong>设置合理的过期时间</strong> — Access Token 短（15-30 分钟），配合 Refresh Token</li>
<li><strong>密钥强度</strong> — HS256 至少 256 位随机字符串；生产环境优先用 RS256/ES256</li>
<li><strong>验证所有标准字段</strong> — 检查 <code>exp</code>、<code>iss</code>、<code>aud</code>，不要只验签名</li>
<li><strong>指定 <code>algorithms</code> 参数</strong> — 防止算法混淆攻击</li>
</ol>
<h3>不要做</h3>
<ol>
<li><strong>不要在 Payload 存敏感数据</strong> — 它只是 Base64 编码，不是加密</li>
<li><strong>不要用 JWT 做会话管理</strong> — JWT 签发后无法撤销（除非配合黑名单）</li>
<li><strong>不要忽略 <code>exp</code></strong> — 永不过期的 JWT 是严重安全隐患</li>
<li><strong>不要在 URL 中传 JWT</strong> — URL 会被日志记录，用 Header 传递</li>
</ol>
<h3>Refresh Token 机制</h3>
<pre><code>Access Token (短期, 15min) ← 用于 API 请求
Refresh Token (长期, 7d)   ← 用于刷新 Access Token

Access Token 过期 → 用 Refresh Token 获取新的 Access Token
Refresh Token 存在数据库，可以随时撤销</code></pre>
<h2>JWT vs Session</h2>
<table>
<thead><tr><th>维度</th><th>JWT</th><th>Session</th></tr></thead>
<tbody>
<tr><td>状态</td><td>无状态</td><td>有状态（服务端存储）</td></tr>
<tr><td>扩展性</td><td>天然支持分布式</td><td>需要共享 Session 存储</td></tr>
<tr><td>撤销</td><td>困难（需黑名单）</td><td>简单（删除即可）</td></tr>
<tr><td>大小</td><td>较大（含 Payload）</td><td>较小（仅 Session ID）</td></tr>
<tr><td>适用</td><td>API、微服务、移动端</td><td>传统 Web 应用</td></tr>
</tbody>
</table>
<h2>小结</h2>
<ul>
<li>JWT 由 Header + Payload + Signature 三部分组成</li>
<li>Payload 是编码而非加密，不要存敏感数据</li>
<li>RS256（非对称）适合微服务，HS256（对称）适合简单场景</li>
<li>务必设置过期时间，配合 Refresh Token 使用</li>
<li>验证时检查签名、过期时间、签发者等所有标准字段</li>
</ul>
`
};

window.LEARN_ARTICLES["json-ld"] = {
zh: `<h1>JSON-LD：让你的数据被搜索引擎理解</h1>
<h2>什么是 JSON-LD</h2>
<p>JSON-LD（JSON for Linking Data）是一种基于 JSON 的语义化数据格式，它让普通的 JSON 数据具有 <strong>机器可理解的含义</strong>。</p>
<p>普通 JSON 中 <code>&#34;name&#34;: &#34;Alice&#34;</code> 只是一个键值对。但 JSON-LD 可以告诉机器：这个 <code>name</code> 是一个 <code>Person</code>（人物）的名字，遵循 Schema.org 的定义。</p>
<p>最直接的好处：<strong>Google、Bing 等搜索引擎能理解你的页面内容，展示富摘要（Rich Snippets）</strong>。</p>
<h2>基础语法</h2>
<pre><code class="language-json">{
  &#34;@context&#34;: &#34;https://schema.org&#34;,
  &#34;@type&#34;: &#34;Person&#34;,
  &#34;name&#34;: &#34;张三&#34;,
  &#34;jobTitle&#34;: &#34;前端工程师&#34;,
  &#34;email&#34;: &#34;zhangsan@example.com&#34;,
  &#34;url&#34;: &#34;https://zhangsan.dev&#34;
}</code></pre>
<p>核心关键字：</p>
<table>
<thead><tr><th>关键字</th><th>含义</th></tr></thead>
<tbody>
<tr><td><code>@context</code></td><td>定义词汇表（通常是 Schema.org）</td></tr>
<tr><td><code>@type</code></td><td>数据的类型</td></tr>
<tr><td><code>@id</code></td><td>资源的唯一标识（URI）</td></tr>
<tr><td><code>@graph</code></td><td>包含多个关联资源</td></tr>
</tbody>
</table>
<h2>嵌入网页</h2>
<p>将 JSON-LD 放在 HTML 的 <code>&lt;script&gt;</code> 标签中：</p>
<pre><code class="language-html">&lt;head&gt;
  &lt;script type=&#34;application/ld+json&#34;&gt;
  {
    &#34;@context&#34;: &#34;https://schema.org&#34;,
    &#34;@type&#34;: &#34;Article&#34;,
    &#34;headline&#34;: &#34;JSON-LD 完全指南&#34;,
    &#34;author&#34;: {
      &#34;@type&#34;: &#34;Person&#34;,
      &#34;name&#34;: &#34;张三&#34;
    },
    &#34;datePublished&#34;: &#34;2025-01-15&#34;,
    &#34;publisher&#34;: {
      &#34;@type&#34;: &#34;Organization&#34;,
      &#34;name&#34;: &#34;TechBlog&#34;,
      &#34;logo&#34;: {
        &#34;@type&#34;: &#34;ImageObject&#34;,
        &#34;url&#34;: &#34;https://example.com/logo.png&#34;
      }
    }
  }
  &lt;/script&gt;
&lt;/head&gt;</code></pre>
<h2>常见 Schema.org 类型</h2>
<h3>组织/公司</h3>
<pre><code class="language-json">{
  &#34;@context&#34;: &#34;https://schema.org&#34;,
  &#34;@type&#34;: &#34;Organization&#34;,
  &#34;name&#34;: &#34;Acme 科技&#34;,
  &#34;url&#34;: &#34;https://acme.com&#34;,
  &#34;logo&#34;: &#34;https://acme.com/logo.png&#34;,
  &#34;contactPoint&#34;: {
    &#34;@type&#34;: &#34;ContactPoint&#34;,
    &#34;telephone&#34;: &#34;+86-10-12345678&#34;,
    &#34;contactType&#34;: &#34;customer service&#34;
  },
  &#34;sameAs&#34;: [
    &#34;https://twitter.com/acme&#34;,
    &#34;https://github.com/acme&#34;
  ]
}</code></pre>
<h3>产品</h3>
<pre><code class="language-json">{
  &#34;@context&#34;: &#34;https://schema.org&#34;,
  &#34;@type&#34;: &#34;Product&#34;,
  &#34;name&#34;: &#34;JSON 验证工具 Pro&#34;,
  &#34;description&#34;: &#34;专业的 JSON 在线验证和格式化工具&#34;,
  &#34;brand&#34;: { &#34;@type&#34;: &#34;Brand&#34;, &#34;name&#34;: &#34;ToolboxNova&#34; },
  &#34;offers&#34;: {
    &#34;@type&#34;: &#34;Offer&#34;,
    &#34;price&#34;: &#34;0&#34;,
    &#34;priceCurrency&#34;: &#34;USD&#34;,
    &#34;availability&#34;: &#34;https://schema.org/InStock&#34;
  },
  &#34;aggregateRating&#34;: {
    &#34;@type&#34;: &#34;AggregateRating&#34;,
    &#34;ratingValue&#34;: &#34;4.8&#34;,
    &#34;reviewCount&#34;: &#34;1250&#34;
  }
}</code></pre>
<h3>FAQ 页面</h3>
<pre><code class="language-json">{
  &#34;@context&#34;: &#34;https://schema.org&#34;,
  &#34;@type&#34;: &#34;FAQPage&#34;,
  &#34;mainEntity&#34;: [
    {
      &#34;@type&#34;: &#34;Question&#34;,
      &#34;name&#34;: &#34;什么是 JSON？&#34;,
      &#34;acceptedAnswer&#34;: {
        &#34;@type&#34;: &#34;Answer&#34;,
        &#34;text&#34;: &#34;JSON 是一种轻量级的数据交换格式...&#34;
      }
    },
    {
      &#34;@type&#34;: &#34;Question&#34;,
      &#34;name&#34;: &#34;JSON 和 XML 有什么区别？&#34;,
      &#34;acceptedAnswer&#34;: {
        &#34;@type&#34;: &#34;Answer&#34;,
        &#34;text&#34;: &#34;JSON 更轻量、易读，而 XML 支持属性和命名空间...&#34;
      }
    }
  ]
}</code></pre>
<h3>面包屑导航</h3>
<pre><code class="language-json">{
  &#34;@context&#34;: &#34;https://schema.org&#34;,
  &#34;@type&#34;: &#34;BreadcrumbList&#34;,
  &#34;itemListElement&#34;: [
    { &#34;@type&#34;: &#34;ListItem&#34;, &#34;position&#34;: 1, &#34;name&#34;: &#34;首页&#34;, &#34;item&#34;: &#34;https://example.com&#34; },
    { &#34;@type&#34;: &#34;ListItem&#34;, &#34;position&#34;: 2, &#34;name&#34;: &#34;教程&#34;, &#34;item&#34;: &#34;https://example.com/learn&#34; },
    { &#34;@type&#34;: &#34;ListItem&#34;, &#34;position&#34;: 3, &#34;name&#34;: &#34;JSON-LD 指南&#34; }
  ]
}</code></pre>
<h2>@graph：多个实体</h2>
<p>一个页面中描述多个实体：</p>
<pre><code class="language-json">{
  &#34;@context&#34;: &#34;https://schema.org&#34;,
  &#34;@graph&#34;: [
    {
      &#34;@type&#34;: &#34;WebPage&#34;,
      &#34;@id&#34;: &#34;https://example.com/article/json-ld&#34;,
      &#34;name&#34;: &#34;JSON-LD 教程&#34;
    },
    {
      &#34;@type&#34;: &#34;Article&#34;,
      &#34;isPartOf&#34;: { &#34;@id&#34;: &#34;https://example.com/article/json-ld&#34; },
      &#34;headline&#34;: &#34;JSON-LD 完全指南&#34;,
      &#34;author&#34;: { &#34;@type&#34;: &#34;Person&#34;, &#34;name&#34;: &#34;张三&#34; }
    },
    {
      &#34;@type&#34;: &#34;BreadcrumbList&#34;,
      &#34;itemListElement&#34;: [ ... ]
    }
  ]
}</code></pre>
<h2>验证工具</h2>
<ol>
<li><strong>Google 富摘要测试工具</strong> — search.google.com/test/rich-results</li>
<li><strong>Schema.org 验证器</strong> — validator.schema.org</li>
<li><strong>JSON-LD Playground</strong> — json-ld.org/playground</li>
</ol>
<h2>SEO 效果</h2>
<p>正确使用 JSON-LD 后，Google 搜索结果可能展示：</p>
<ul>
<li><strong>文章</strong>：标题、发布日期、作者头像</li>
<li><strong>产品</strong>：价格、评分、库存状态</li>
<li><strong>FAQ</strong>：问答折叠展示</li>
<li><strong>评价</strong>：星级评分</li>
<li><strong>事件</strong>：时间、地点、购票链接</li>
<li><strong>食谱</strong>：烹饪时间、热量、评分</li>
</ul>
<h2>JSON-LD vs Microdata vs RDFa</h2>
<table>
<thead><tr><th>维度</th><th>JSON-LD</th><th>Microdata</th><th>RDFa</th></tr></thead>
<tbody>
<tr><td>格式</td><td>独立 JSON 块</td><td>嵌入 HTML 属性</td><td>嵌入 HTML 属性</td></tr>
<tr><td>维护性</td><td>高（与 HTML 分离）</td><td>低（与 HTML 耦合）</td><td>低</td></tr>
<tr><td>Google 推荐</td><td>✓ 首选</td><td>支持</td><td>支持</td></tr>
<tr><td>实现难度</td><td>低</td><td>中</td><td>高</td></tr>
</tbody>
</table>
<p>Google 官方推荐 JSON-LD，因为它不需要修改 HTML 结构。</p>
<h2>小结</h2>
<ul>
<li>JSON-LD 用 <code>@context</code>、<code>@type</code>、<code>@id</code> 赋予 JSON 语义含义</li>
<li>嵌入 <code>&lt;script type=&#34;application/ld+json&#34;&gt;</code> 标签中</li>
<li>使用 Schema.org 词汇表描述文章、产品、组织、FAQ 等</li>
<li>正确使用可获得 Google 富摘要展示，提升 SEO 效果</li>
<li>Google 验证工具可以检查结构化数据是否正确</li>
</ul>
`,
en: `<h1>JSON-LD：让你的数据被搜索引擎理解</h1>
<h2>什么是 JSON-LD</h2>
<p>JSON-LD（JSON for Linking Data）是一种基于 JSON 的语义化数据格式，它让普通的 JSON 数据具有 <strong>机器可理解的含义</strong>。</p>
<p>普通 JSON 中 <code>&#34;name&#34;: &#34;Alice&#34;</code> 只是一个键值对。但 JSON-LD 可以告诉机器：这个 <code>name</code> 是一个 <code>Person</code>（人物）的名字，遵循 Schema.org 的定义。</p>
<p>最直接的好处：<strong>Google、Bing 等搜索引擎能理解你的页面内容，展示富摘要（Rich Snippets）</strong>。</p>
<h2>基础语法</h2>
<pre><code class="language-json">{
  &#34;@context&#34;: &#34;https://schema.org&#34;,
  &#34;@type&#34;: &#34;Person&#34;,
  &#34;name&#34;: &#34;张三&#34;,
  &#34;jobTitle&#34;: &#34;前端工程师&#34;,
  &#34;email&#34;: &#34;zhangsan@example.com&#34;,
  &#34;url&#34;: &#34;https://zhangsan.dev&#34;
}</code></pre>
<p>核心关键字：</p>
<table>
<thead><tr><th>关键字</th><th>含义</th></tr></thead>
<tbody>
<tr><td><code>@context</code></td><td>定义词汇表（通常是 Schema.org）</td></tr>
<tr><td><code>@type</code></td><td>数据的类型</td></tr>
<tr><td><code>@id</code></td><td>资源的唯一标识（URI）</td></tr>
<tr><td><code>@graph</code></td><td>包含多个关联资源</td></tr>
</tbody>
</table>
<h2>嵌入网页</h2>
<p>将 JSON-LD 放在 HTML 的 <code>&lt;script&gt;</code> 标签中：</p>
<pre><code class="language-html">&lt;head&gt;
  &lt;script type=&#34;application/ld+json&#34;&gt;
  {
    &#34;@context&#34;: &#34;https://schema.org&#34;,
    &#34;@type&#34;: &#34;Article&#34;,
    &#34;headline&#34;: &#34;JSON-LD 完全指南&#34;,
    &#34;author&#34;: {
      &#34;@type&#34;: &#34;Person&#34;,
      &#34;name&#34;: &#34;张三&#34;
    },
    &#34;datePublished&#34;: &#34;2025-01-15&#34;,
    &#34;publisher&#34;: {
      &#34;@type&#34;: &#34;Organization&#34;,
      &#34;name&#34;: &#34;TechBlog&#34;,
      &#34;logo&#34;: {
        &#34;@type&#34;: &#34;ImageObject&#34;,
        &#34;url&#34;: &#34;https://example.com/logo.png&#34;
      }
    }
  }
  &lt;/script&gt;
&lt;/head&gt;</code></pre>
<h2>常见 Schema.org 类型</h2>
<h3>组织/公司</h3>
<pre><code class="language-json">{
  &#34;@context&#34;: &#34;https://schema.org&#34;,
  &#34;@type&#34;: &#34;Organization&#34;,
  &#34;name&#34;: &#34;Acme 科技&#34;,
  &#34;url&#34;: &#34;https://acme.com&#34;,
  &#34;logo&#34;: &#34;https://acme.com/logo.png&#34;,
  &#34;contactPoint&#34;: {
    &#34;@type&#34;: &#34;ContactPoint&#34;,
    &#34;telephone&#34;: &#34;+86-10-12345678&#34;,
    &#34;contactType&#34;: &#34;customer service&#34;
  },
  &#34;sameAs&#34;: [
    &#34;https://twitter.com/acme&#34;,
    &#34;https://github.com/acme&#34;
  ]
}</code></pre>
<h3>产品</h3>
<pre><code class="language-json">{
  &#34;@context&#34;: &#34;https://schema.org&#34;,
  &#34;@type&#34;: &#34;Product&#34;,
  &#34;name&#34;: &#34;JSON 验证工具 Pro&#34;,
  &#34;description&#34;: &#34;专业的 JSON 在线验证和格式化工具&#34;,
  &#34;brand&#34;: { &#34;@type&#34;: &#34;Brand&#34;, &#34;name&#34;: &#34;ToolboxNova&#34; },
  &#34;offers&#34;: {
    &#34;@type&#34;: &#34;Offer&#34;,
    &#34;price&#34;: &#34;0&#34;,
    &#34;priceCurrency&#34;: &#34;USD&#34;,
    &#34;availability&#34;: &#34;https://schema.org/InStock&#34;
  },
  &#34;aggregateRating&#34;: {
    &#34;@type&#34;: &#34;AggregateRating&#34;,
    &#34;ratingValue&#34;: &#34;4.8&#34;,
    &#34;reviewCount&#34;: &#34;1250&#34;
  }
}</code></pre>
<h3>FAQ 页面</h3>
<pre><code class="language-json">{
  &#34;@context&#34;: &#34;https://schema.org&#34;,
  &#34;@type&#34;: &#34;FAQPage&#34;,
  &#34;mainEntity&#34;: [
    {
      &#34;@type&#34;: &#34;Question&#34;,
      &#34;name&#34;: &#34;什么是 JSON？&#34;,
      &#34;acceptedAnswer&#34;: {
        &#34;@type&#34;: &#34;Answer&#34;,
        &#34;text&#34;: &#34;JSON 是一种轻量级的数据交换格式...&#34;
      }
    },
    {
      &#34;@type&#34;: &#34;Question&#34;,
      &#34;name&#34;: &#34;JSON 和 XML 有什么区别？&#34;,
      &#34;acceptedAnswer&#34;: {
        &#34;@type&#34;: &#34;Answer&#34;,
        &#34;text&#34;: &#34;JSON 更轻量、易读，而 XML 支持属性和命名空间...&#34;
      }
    }
  ]
}</code></pre>
<h3>面包屑导航</h3>
<pre><code class="language-json">{
  &#34;@context&#34;: &#34;https://schema.org&#34;,
  &#34;@type&#34;: &#34;BreadcrumbList&#34;,
  &#34;itemListElement&#34;: [
    { &#34;@type&#34;: &#34;ListItem&#34;, &#34;position&#34;: 1, &#34;name&#34;: &#34;首页&#34;, &#34;item&#34;: &#34;https://example.com&#34; },
    { &#34;@type&#34;: &#34;ListItem&#34;, &#34;position&#34;: 2, &#34;name&#34;: &#34;教程&#34;, &#34;item&#34;: &#34;https://example.com/learn&#34; },
    { &#34;@type&#34;: &#34;ListItem&#34;, &#34;position&#34;: 3, &#34;name&#34;: &#34;JSON-LD 指南&#34; }
  ]
}</code></pre>
<h2>@graph：多个实体</h2>
<p>一个页面中描述多个实体：</p>
<pre><code class="language-json">{
  &#34;@context&#34;: &#34;https://schema.org&#34;,
  &#34;@graph&#34;: [
    {
      &#34;@type&#34;: &#34;WebPage&#34;,
      &#34;@id&#34;: &#34;https://example.com/article/json-ld&#34;,
      &#34;name&#34;: &#34;JSON-LD 教程&#34;
    },
    {
      &#34;@type&#34;: &#34;Article&#34;,
      &#34;isPartOf&#34;: { &#34;@id&#34;: &#34;https://example.com/article/json-ld&#34; },
      &#34;headline&#34;: &#34;JSON-LD 完全指南&#34;,
      &#34;author&#34;: { &#34;@type&#34;: &#34;Person&#34;, &#34;name&#34;: &#34;张三&#34; }
    },
    {
      &#34;@type&#34;: &#34;BreadcrumbList&#34;,
      &#34;itemListElement&#34;: [ ... ]
    }
  ]
}</code></pre>
<h2>验证工具</h2>
<ol>
<li><strong>Google 富摘要测试工具</strong> — search.google.com/test/rich-results</li>
<li><strong>Schema.org 验证器</strong> — validator.schema.org</li>
<li><strong>JSON-LD Playground</strong> — json-ld.org/playground</li>
</ol>
<h2>SEO 效果</h2>
<p>正确使用 JSON-LD 后，Google 搜索结果可能展示：</p>
<ul>
<li><strong>文章</strong>：标题、发布日期、作者头像</li>
<li><strong>产品</strong>：价格、评分、库存状态</li>
<li><strong>FAQ</strong>：问答折叠展示</li>
<li><strong>评价</strong>：星级评分</li>
<li><strong>事件</strong>：时间、地点、购票链接</li>
<li><strong>食谱</strong>：烹饪时间、热量、评分</li>
</ul>
<h2>JSON-LD vs Microdata vs RDFa</h2>
<table>
<thead><tr><th>维度</th><th>JSON-LD</th><th>Microdata</th><th>RDFa</th></tr></thead>
<tbody>
<tr><td>格式</td><td>独立 JSON 块</td><td>嵌入 HTML 属性</td><td>嵌入 HTML 属性</td></tr>
<tr><td>维护性</td><td>高（与 HTML 分离）</td><td>低（与 HTML 耦合）</td><td>低</td></tr>
<tr><td>Google 推荐</td><td>✓ 首选</td><td>支持</td><td>支持</td></tr>
<tr><td>实现难度</td><td>低</td><td>中</td><td>高</td></tr>
</tbody>
</table>
<p>Google 官方推荐 JSON-LD，因为它不需要修改 HTML 结构。</p>
<h2>小结</h2>
<ul>
<li>JSON-LD 用 <code>@context</code>、<code>@type</code>、<code>@id</code> 赋予 JSON 语义含义</li>
<li>嵌入 <code>&lt;script type=&#34;application/ld+json&#34;&gt;</code> 标签中</li>
<li>使用 Schema.org 词汇表描述文章、产品、组织、FAQ 等</li>
<li>正确使用可获得 Google 富摘要展示，提升 SEO 效果</li>
<li>Google 验证工具可以检查结构化数据是否正确</li>
</ul>
`
};

window.LEARN_ARTICLES["json-patch"] = {
zh: `<h1>JSON Patch：精确修改 JSON 文档</h1>
<h2>什么是 JSON Patch</h2>
<p>JSON Patch（RFC 6902）是一种描述 JSON 文档修改操作的格式。与整体替换不同，它只传输 <strong>变更部分</strong>，就像 <code>git diff</code> 之于文件。</p>
<p>为什么需要它？假设一个 10KB 的用户配置，你只想改一个字段。用 PUT 要传输完整的 10KB，而 JSON Patch 只传几十字节的修改指令。</p>
<pre><code class="language-http">PATCH /api/users/123
Content-Type: application/json-patch+json

[
  { &#34;op&#34;: &#34;replace&#34;, &#34;path&#34;: &#34;/name&#34;, &#34;value&#34;: &#34;新名字&#34; }
]</code></pre>
<h2>六种操作</h2>
<p>JSON Patch 定义了六种操作（op）：</p>
<h3>1. add — 添加</h3>
<pre><code class="language-json">// 添加字段
{ &#34;op&#34;: &#34;add&#34;, &#34;path&#34;: &#34;/email&#34;, &#34;value&#34;: &#34;alice@example.com&#34; }

// 在数组指定位置插入
{ &#34;op&#34;: &#34;add&#34;, &#34;path&#34;: &#34;/tags/1&#34;, &#34;value&#34;: &#34;new-tag&#34; }

// 在数组末尾追加
{ &#34;op&#34;: &#34;add&#34;, &#34;path&#34;: &#34;/tags/-&#34;, &#34;value&#34;: &#34;last-tag&#34; }</code></pre>
<h3>2. remove — 删除</h3>
<pre><code class="language-json">// 删除字段
{ &#34;op&#34;: &#34;remove&#34;, &#34;path&#34;: &#34;/deprecated_field&#34; }

// 删除数组元素
{ &#34;op&#34;: &#34;remove&#34;, &#34;path&#34;: &#34;/tags/2&#34; }</code></pre>
<h3>3. replace — 替换</h3>
<pre><code class="language-json">{ &#34;op&#34;: &#34;replace&#34;, &#34;path&#34;: &#34;/name&#34;, &#34;value&#34;: &#34;Bob&#34; }
{ &#34;op&#34;: &#34;replace&#34;, &#34;path&#34;: &#34;/settings/theme&#34;, &#34;value&#34;: &#34;dark&#34; }</code></pre>
<p><code>replace</code> 等同于先 <code>remove</code> 再 <code>add</code>，但目标路径必须存在。</p>
<h3>4. move — 移动</h3>
<pre><code class="language-json">{ &#34;op&#34;: &#34;move&#34;, &#34;from&#34;: &#34;/old_name&#34;, &#34;path&#34;: &#34;/new_name&#34; }</code></pre>
<h3>5. copy — 复制</h3>
<pre><code class="language-json">{ &#34;op&#34;: &#34;copy&#34;, &#34;from&#34;: &#34;/billing_address&#34;, &#34;path&#34;: &#34;/shipping_address&#34; }</code></pre>
<h3>6. test — 测试</h3>
<pre><code class="language-json">{ &#34;op&#34;: &#34;test&#34;, &#34;path&#34;: &#34;/version&#34;, &#34;value&#34;: 2 }</code></pre>
<p><code>test</code> 不修改数据，而是断言某个值是否匹配。如果不匹配，<strong>整个 Patch 操作回滚</strong>。这对实现乐观锁非常有用。</p>
<h2>路径语法</h2>
<p>JSON Patch 使用 JSON Pointer（RFC 6901）表示路径：</p>
<table>
<thead><tr><th>JSON Pointer</th><th>对应的 JSON 位置</th></tr></thead>
<tbody>
<tr><td><code>/name</code></td><td>根对象的 <code>name</code> 字段</td></tr>
<tr><td><code>/address/city</code></td><td>嵌套对象 <code>address.city</code></td></tr>
<tr><td><code>/tags/0</code></td><td>数组 <code>tags</code> 的第一个元素</td></tr>
<tr><td><code>/tags/-</code></td><td>数组末尾（仅用于 <code>add</code>）</td></tr>
<tr><td><code>/a~0b</code></td><td>字段名包含 <code>~</code> 的（<code>~</code> 编码为 <code>~0</code>）</td></tr>
<tr><td><code>/a~1b</code></td><td>字段名包含 <code>/</code> 的（<code>/</code> 编码为 <code>~1</code>）</td></tr>
</tbody>
</table>
<h2>完整示例</h2>
<p>原始文档：</p>
<pre><code class="language-json">{
  &#34;name&#34;: &#34;Alice&#34;,
  &#34;age&#34;: 25,
  &#34;address&#34;: { &#34;city&#34;: &#34;Beijing&#34;, &#34;zip&#34;: &#34;100000&#34; },
  &#34;tags&#34;: [&#34;developer&#34;, &#34;writer&#34;],
  &#34;version&#34;: 1
}</code></pre>
<p>Patch 操作：</p>
<pre><code class="language-json">[
  { &#34;op&#34;: &#34;test&#34;, &#34;path&#34;: &#34;/version&#34;, &#34;value&#34;: 1 },
  { &#34;op&#34;: &#34;replace&#34;, &#34;path&#34;: &#34;/name&#34;, &#34;value&#34;: &#34;Alice Chen&#34; },
  { &#34;op&#34;: &#34;replace&#34;, &#34;path&#34;: &#34;/age&#34;, &#34;value&#34;: 26 },
  { &#34;op&#34;: &#34;replace&#34;, &#34;path&#34;: &#34;/address/city&#34;, &#34;value&#34;: &#34;Shanghai&#34; },
  { &#34;op&#34;: &#34;add&#34;, &#34;path&#34;: &#34;/tags/-&#34;, &#34;value&#34;: &#34;speaker&#34; },
  { &#34;op&#34;: &#34;remove&#34;, &#34;path&#34;: &#34;/address/zip&#34; },
  { &#34;op&#34;: &#34;add&#34;, &#34;path&#34;: &#34;/email&#34;, &#34;value&#34;: &#34;alice@example.com&#34; },
  { &#34;op&#34;: &#34;replace&#34;, &#34;path&#34;: &#34;/version&#34;, &#34;value&#34;: 2 }
]</code></pre>
<p>结果：</p>
<pre><code class="language-json">{
  &#34;name&#34;: &#34;Alice Chen&#34;,
  &#34;age&#34;: 26,
  &#34;address&#34;: { &#34;city&#34;: &#34;Shanghai&#34; },
  &#34;tags&#34;: [&#34;developer&#34;, &#34;writer&#34;, &#34;speaker&#34;],
  &#34;email&#34;: &#34;alice@example.com&#34;,
  &#34;version&#34;: 2
}</code></pre>
<h2>各语言实现</h2>
<h3>JavaScript（fast-json-patch）</h3>
<pre><code class="language-javascript">const jsonpatch = require(&#34;fast-json-patch&#34;);

const document = { name: &#34;Alice&#34;, tags: [&#34;dev&#34;] };
const patch = [
  { op: &#34;replace&#34;, path: &#34;/name&#34;, value: &#34;Bob&#34; },
  { op: &#34;add&#34;, path: &#34;/tags/-&#34;, value: &#34;writer&#34; }
];

const result = jsonpatch.applyPatch(document, patch);
console.log(document);
// { name: &#34;Bob&#34;, tags: [&#34;dev&#34;, &#34;writer&#34;] }

// 自动生成 Patch（diff）
const before = { name: &#34;Alice&#34;, age: 25 };
const after = { name: &#34;Alice&#34;, age: 26, city: &#34;Shanghai&#34; };
const diff = jsonpatch.compare(before, after);
console.log(diff);
// [
//   { op: &#34;replace&#34;, path: &#34;/age&#34;, value: 26 },
//   { op: &#34;add&#34;, path: &#34;/city&#34;, value: &#34;Shanghai&#34; }
// ]</code></pre>
<h3>Python（jsonpatch）</h3>
<pre><code class="language-python">import jsonpatch

doc = {&#34;name&#34;: &#34;Alice&#34;, &#34;age&#34;: 25, &#34;tags&#34;: [&#34;dev&#34;]}
patch = jsonpatch.JsonPatch([
    {&#34;op&#34;: &#34;replace&#34;, &#34;path&#34;: &#34;/age&#34;, &#34;value&#34;: 26},
    {&#34;op&#34;: &#34;add&#34;, &#34;path&#34;: &#34;/tags/-&#34;, &#34;value&#34;: &#34;writer&#34;}
])

result = patch.apply(doc)
print(result)
# {&#39;name&#39;: &#39;Alice&#39;, &#39;age&#39;: 26, &#39;tags&#39;: [&#39;dev&#39;, &#39;writer&#39;]}

# 生成 diff
src = {&#34;name&#34;: &#34;Alice&#34;, &#34;age&#34;: 25}
dst = {&#34;name&#34;: &#34;Alice&#34;, &#34;age&#34;: 26, &#34;city&#34;: &#34;Shanghai&#34;}
diff = jsonpatch.make_patch(src, dst)
print(diff.to_string())</code></pre>
<h2>REST API 中的应用</h2>
<pre><code class="language-python"># Flask 示例
from flask import Flask, request, jsonify
import jsonpatch

app = Flask(__name__)
users_db = {}

@app.route(&#34;/users/&lt;uid&gt;&#34;, methods=[&#34;PATCH&#34;])
def patch_user(uid):
    if uid not in users_db:
        return jsonify(error=&#34;Not found&#34;), 404

    try:
        patch = jsonpatch.JsonPatch(request.json)
        users_db[uid] = patch.apply(users_db[uid])
        return jsonify(users_db[uid])
    except jsonpatch.JsonPatchConflict as e:
        return jsonify(error=str(e)), 409
    except jsonpatch.JsonPatchException as e:
        return jsonify(error=str(e)), 400</code></pre>
<h2>JSON Patch vs JSON Merge Patch</h2>
<table>
<thead><tr><th>维度</th><th>JSON Patch (RFC 6902)</th><th>JSON Merge Patch (RFC 7396)</th></tr></thead>
<tbody>
<tr><td>格式</td><td>操作数组</td><td>部分 JSON 对象</td></tr>
<tr><td>删除字段</td><td><code>{ &#34;op&#34;: &#34;remove&#34; }</code></td><td>设为 <code>null</code></td></tr>
<tr><td>数组操作</td><td>支持精确增删</td><td>只能整体替换</td></tr>
<tr><td>复杂度</td><td>高，支持丰富操作</td><td>低，直觉简单</td></tr>
<tr><td>Content-Type</td><td><code>application/json-patch+json</code></td><td><code>application/merge-patch+json</code></td></tr>
</tbody>
</table>
<p>JSON Merge Patch 更简单，但能力有限。如果需要精确的数组操作或条件测试，选 JSON Patch。</p>
<h2>小结</h2>
<ul>
<li>JSON Patch 用六种操作（add/remove/replace/move/copy/test）描述增量修改</li>
<li><code>test</code> 操作可实现乐观锁</li>
<li>路径使用 JSON Pointer（RFC 6901）语法</li>
<li>比整体替换节省带宽，适合大文档的局部更新</li>
<li><code>compare/diff</code> 功能可自动生成两个 JSON 之间的 Patch</li>
</ul>
`,
en: `<h1>JSON Patch：精确修改 JSON 文档</h1>
<h2>什么是 JSON Patch</h2>
<p>JSON Patch（RFC 6902）是一种描述 JSON 文档修改操作的格式。与整体替换不同，它只传输 <strong>变更部分</strong>，就像 <code>git diff</code> 之于文件。</p>
<p>为什么需要它？假设一个 10KB 的用户配置，你只想改一个字段。用 PUT 要传输完整的 10KB，而 JSON Patch 只传几十字节的修改指令。</p>
<pre><code class="language-http">PATCH /api/users/123
Content-Type: application/json-patch+json

[
  { &#34;op&#34;: &#34;replace&#34;, &#34;path&#34;: &#34;/name&#34;, &#34;value&#34;: &#34;新名字&#34; }
]</code></pre>
<h2>六种操作</h2>
<p>JSON Patch 定义了六种操作（op）：</p>
<h3>1. add — 添加</h3>
<pre><code class="language-json">// 添加字段
{ &#34;op&#34;: &#34;add&#34;, &#34;path&#34;: &#34;/email&#34;, &#34;value&#34;: &#34;alice@example.com&#34; }

// 在数组指定位置插入
{ &#34;op&#34;: &#34;add&#34;, &#34;path&#34;: &#34;/tags/1&#34;, &#34;value&#34;: &#34;new-tag&#34; }

// 在数组末尾追加
{ &#34;op&#34;: &#34;add&#34;, &#34;path&#34;: &#34;/tags/-&#34;, &#34;value&#34;: &#34;last-tag&#34; }</code></pre>
<h3>2. remove — 删除</h3>
<pre><code class="language-json">// 删除字段
{ &#34;op&#34;: &#34;remove&#34;, &#34;path&#34;: &#34;/deprecated_field&#34; }

// 删除数组元素
{ &#34;op&#34;: &#34;remove&#34;, &#34;path&#34;: &#34;/tags/2&#34; }</code></pre>
<h3>3. replace — 替换</h3>
<pre><code class="language-json">{ &#34;op&#34;: &#34;replace&#34;, &#34;path&#34;: &#34;/name&#34;, &#34;value&#34;: &#34;Bob&#34; }
{ &#34;op&#34;: &#34;replace&#34;, &#34;path&#34;: &#34;/settings/theme&#34;, &#34;value&#34;: &#34;dark&#34; }</code></pre>
<p><code>replace</code> 等同于先 <code>remove</code> 再 <code>add</code>，但目标路径必须存在。</p>
<h3>4. move — 移动</h3>
<pre><code class="language-json">{ &#34;op&#34;: &#34;move&#34;, &#34;from&#34;: &#34;/old_name&#34;, &#34;path&#34;: &#34;/new_name&#34; }</code></pre>
<h3>5. copy — 复制</h3>
<pre><code class="language-json">{ &#34;op&#34;: &#34;copy&#34;, &#34;from&#34;: &#34;/billing_address&#34;, &#34;path&#34;: &#34;/shipping_address&#34; }</code></pre>
<h3>6. test — 测试</h3>
<pre><code class="language-json">{ &#34;op&#34;: &#34;test&#34;, &#34;path&#34;: &#34;/version&#34;, &#34;value&#34;: 2 }</code></pre>
<p><code>test</code> 不修改数据，而是断言某个值是否匹配。如果不匹配，<strong>整个 Patch 操作回滚</strong>。这对实现乐观锁非常有用。</p>
<h2>路径语法</h2>
<p>JSON Patch 使用 JSON Pointer（RFC 6901）表示路径：</p>
<table>
<thead><tr><th>JSON Pointer</th><th>对应的 JSON 位置</th></tr></thead>
<tbody>
<tr><td><code>/name</code></td><td>根对象的 <code>name</code> 字段</td></tr>
<tr><td><code>/address/city</code></td><td>嵌套对象 <code>address.city</code></td></tr>
<tr><td><code>/tags/0</code></td><td>数组 <code>tags</code> 的第一个元素</td></tr>
<tr><td><code>/tags/-</code></td><td>数组末尾（仅用于 <code>add</code>）</td></tr>
<tr><td><code>/a~0b</code></td><td>字段名包含 <code>~</code> 的（<code>~</code> 编码为 <code>~0</code>）</td></tr>
<tr><td><code>/a~1b</code></td><td>字段名包含 <code>/</code> 的（<code>/</code> 编码为 <code>~1</code>）</td></tr>
</tbody>
</table>
<h2>完整示例</h2>
<p>原始文档：</p>
<pre><code class="language-json">{
  &#34;name&#34;: &#34;Alice&#34;,
  &#34;age&#34;: 25,
  &#34;address&#34;: { &#34;city&#34;: &#34;Beijing&#34;, &#34;zip&#34;: &#34;100000&#34; },
  &#34;tags&#34;: [&#34;developer&#34;, &#34;writer&#34;],
  &#34;version&#34;: 1
}</code></pre>
<p>Patch 操作：</p>
<pre><code class="language-json">[
  { &#34;op&#34;: &#34;test&#34;, &#34;path&#34;: &#34;/version&#34;, &#34;value&#34;: 1 },
  { &#34;op&#34;: &#34;replace&#34;, &#34;path&#34;: &#34;/name&#34;, &#34;value&#34;: &#34;Alice Chen&#34; },
  { &#34;op&#34;: &#34;replace&#34;, &#34;path&#34;: &#34;/age&#34;, &#34;value&#34;: 26 },
  { &#34;op&#34;: &#34;replace&#34;, &#34;path&#34;: &#34;/address/city&#34;, &#34;value&#34;: &#34;Shanghai&#34; },
  { &#34;op&#34;: &#34;add&#34;, &#34;path&#34;: &#34;/tags/-&#34;, &#34;value&#34;: &#34;speaker&#34; },
  { &#34;op&#34;: &#34;remove&#34;, &#34;path&#34;: &#34;/address/zip&#34; },
  { &#34;op&#34;: &#34;add&#34;, &#34;path&#34;: &#34;/email&#34;, &#34;value&#34;: &#34;alice@example.com&#34; },
  { &#34;op&#34;: &#34;replace&#34;, &#34;path&#34;: &#34;/version&#34;, &#34;value&#34;: 2 }
]</code></pre>
<p>结果：</p>
<pre><code class="language-json">{
  &#34;name&#34;: &#34;Alice Chen&#34;,
  &#34;age&#34;: 26,
  &#34;address&#34;: { &#34;city&#34;: &#34;Shanghai&#34; },
  &#34;tags&#34;: [&#34;developer&#34;, &#34;writer&#34;, &#34;speaker&#34;],
  &#34;email&#34;: &#34;alice@example.com&#34;,
  &#34;version&#34;: 2
}</code></pre>
<h2>各语言实现</h2>
<h3>JavaScript（fast-json-patch）</h3>
<pre><code class="language-javascript">const jsonpatch = require(&#34;fast-json-patch&#34;);

const document = { name: &#34;Alice&#34;, tags: [&#34;dev&#34;] };
const patch = [
  { op: &#34;replace&#34;, path: &#34;/name&#34;, value: &#34;Bob&#34; },
  { op: &#34;add&#34;, path: &#34;/tags/-&#34;, value: &#34;writer&#34; }
];

const result = jsonpatch.applyPatch(document, patch);
console.log(document);
// { name: &#34;Bob&#34;, tags: [&#34;dev&#34;, &#34;writer&#34;] }

// 自动生成 Patch（diff）
const before = { name: &#34;Alice&#34;, age: 25 };
const after = { name: &#34;Alice&#34;, age: 26, city: &#34;Shanghai&#34; };
const diff = jsonpatch.compare(before, after);
console.log(diff);
// [
//   { op: &#34;replace&#34;, path: &#34;/age&#34;, value: 26 },
//   { op: &#34;add&#34;, path: &#34;/city&#34;, value: &#34;Shanghai&#34; }
// ]</code></pre>
<h3>Python（jsonpatch）</h3>
<pre><code class="language-python">import jsonpatch

doc = {&#34;name&#34;: &#34;Alice&#34;, &#34;age&#34;: 25, &#34;tags&#34;: [&#34;dev&#34;]}
patch = jsonpatch.JsonPatch([
    {&#34;op&#34;: &#34;replace&#34;, &#34;path&#34;: &#34;/age&#34;, &#34;value&#34;: 26},
    {&#34;op&#34;: &#34;add&#34;, &#34;path&#34;: &#34;/tags/-&#34;, &#34;value&#34;: &#34;writer&#34;}
])

result = patch.apply(doc)
print(result)
# {&#39;name&#39;: &#39;Alice&#39;, &#39;age&#39;: 26, &#39;tags&#39;: [&#39;dev&#39;, &#39;writer&#39;]}

# 生成 diff
src = {&#34;name&#34;: &#34;Alice&#34;, &#34;age&#34;: 25}
dst = {&#34;name&#34;: &#34;Alice&#34;, &#34;age&#34;: 26, &#34;city&#34;: &#34;Shanghai&#34;}
diff = jsonpatch.make_patch(src, dst)
print(diff.to_string())</code></pre>
<h2>REST API 中的应用</h2>
<pre><code class="language-python"># Flask 示例
from flask import Flask, request, jsonify
import jsonpatch

app = Flask(__name__)
users_db = {}

@app.route(&#34;/users/&lt;uid&gt;&#34;, methods=[&#34;PATCH&#34;])
def patch_user(uid):
    if uid not in users_db:
        return jsonify(error=&#34;Not found&#34;), 404

    try:
        patch = jsonpatch.JsonPatch(request.json)
        users_db[uid] = patch.apply(users_db[uid])
        return jsonify(users_db[uid])
    except jsonpatch.JsonPatchConflict as e:
        return jsonify(error=str(e)), 409
    except jsonpatch.JsonPatchException as e:
        return jsonify(error=str(e)), 400</code></pre>
<h2>JSON Patch vs JSON Merge Patch</h2>
<table>
<thead><tr><th>维度</th><th>JSON Patch (RFC 6902)</th><th>JSON Merge Patch (RFC 7396)</th></tr></thead>
<tbody>
<tr><td>格式</td><td>操作数组</td><td>部分 JSON 对象</td></tr>
<tr><td>删除字段</td><td><code>{ &#34;op&#34;: &#34;remove&#34; }</code></td><td>设为 <code>null</code></td></tr>
<tr><td>数组操作</td><td>支持精确增删</td><td>只能整体替换</td></tr>
<tr><td>复杂度</td><td>高，支持丰富操作</td><td>低，直觉简单</td></tr>
<tr><td>Content-Type</td><td><code>application/json-patch+json</code></td><td><code>application/merge-patch+json</code></td></tr>
</tbody>
</table>
<p>JSON Merge Patch 更简单，但能力有限。如果需要精确的数组操作或条件测试，选 JSON Patch。</p>
<h2>小结</h2>
<ul>
<li>JSON Patch 用六种操作（add/remove/replace/move/copy/test）描述增量修改</li>
<li><code>test</code> 操作可实现乐观锁</li>
<li>路径使用 JSON Pointer（RFC 6901）语法</li>
<li>比整体替换节省带宽，适合大文档的局部更新</li>
<li><code>compare/diff</code> 功能可自动生成两个 JSON 之间的 Patch</li>
</ul>
`
};

window.LEARN_ARTICLES["json-pointer"] = {
zh: `<h1>JSON Pointer：精确定位 JSON 中的值</h1>
<h2>什么是 JSON Pointer</h2>
<p>JSON Pointer（RFC 6901）是一种用字符串路径精确定位 JSON 文档中某个值的标准语法。它被 JSON Schema（<code>$ref</code>）、JSON Patch（<code>path</code>）、OpenAPI 等规范广泛使用。</p>
<pre><code>/store/books/0/title</code></pre>
<p>这个指针表示：根对象 → <code>store</code> 属性 → <code>books</code> 属性 → 第 0 个元素 → <code>title</code> 属性。</p>
<h2>语法规则</h2>
<table>
<thead><tr><th>规则</th><th>说明</th></tr></thead>
<tbody>
<tr><td>空字符串 <code>&#34;&#34;</code></td><td>指向整个文档（根）</td></tr>
<tr><td>以 <code>/</code> 开头</td><td>每个 <code>/</code> 分隔一个层级</td></tr>
<tr><td>数组用数字索引</td><td><code>/items/0</code> 表示第一个元素</td></tr>
<tr><td><code>~0</code> 转义 <code>~</code></td><td>字段名含 <code>~</code> 时用 <code>~0</code></td></tr>
<tr><td><code>~1</code> 转义 <code>/</code></td><td>字段名含 <code>/</code> 时用 <code>~1</code></td></tr>
</tbody>
</table>
<h3>转义示例</h3>
<p>JSON 数据：</p>
<pre><code class="language-json">{
  &#34;a/b&#34;: 1,
  &#34;c~d&#34;: 2,
  &#34;m~n/o&#34;: 3
}</code></pre>
<table>
<thead><tr><th>JSON Pointer</th><th>目标值</th></tr></thead>
<tbody>
<tr><td><code>/a~1b</code></td><td><code>1</code>（<code>/</code> → <code>~1</code>）</td></tr>
<tr><td><code>/c~0d</code></td><td><code>2</code>（<code>~</code> → <code>~0</code>）</td></tr>
<tr><td><code>/m~0n~1o</code></td><td><code>3</code>（先 <code>~</code> → <code>~0</code>，再 <code>/</code> → <code>~1</code>）</td></tr>
</tbody>
</table>
<blockquote><p>转义顺序：先处理 <code>~0</code>（<code>~</code>），再处理 <code>~1</code>（<code>/</code>）。</p></blockquote>
<h2>完整示例</h2>
<pre><code class="language-json">{
  &#34;users&#34;: [
    {
      &#34;name&#34;: &#34;Alice&#34;,
      &#34;contacts&#34;: {
        &#34;email&#34;: &#34;alice@example.com&#34;,
        &#34;phones&#34;: [&#34;+86-138-0001-0001&#34;, &#34;+86-139-0002-0002&#34;]
      }
    },
    {
      &#34;name&#34;: &#34;Bob&#34;,
      &#34;contacts&#34;: {
        &#34;email&#34;: &#34;bob@example.com&#34;
      }
    }
  ],
  &#34;metadata&#34;: {
    &#34;version&#34;: 2,
    &#34;tags&#34;: [&#34;production&#34;, &#34;v2&#34;]
  }
}</code></pre>
<table>
<thead><tr><th>JSON Pointer</th><th>结果</th></tr></thead>
<tbody>
<tr><td>\`\` (空)</td><td>整个文档</td></tr>
<tr><td><code>/users</code></td><td>用户数组</td></tr>
<tr><td><code>/users/0</code></td><td>Alice 对象</td></tr>
<tr><td><code>/users/0/name</code></td><td><code>&#34;Alice&#34;</code></td></tr>
<tr><td><code>/users/0/contacts/phones/1</code></td><td><code>&#34;+86-139-0002-0002&#34;</code></td></tr>
<tr><td><code>/users/1/contacts/email</code></td><td><code>&#34;bob@example.com&#34;</code></td></tr>
<tr><td><code>/metadata/tags/0</code></td><td><code>&#34;production&#34;</code></td></tr>
</tbody>
</table>
<h2>各语言实现</h2>
<h3>JavaScript</h3>
<pre><code class="language-javascript">// 简单实现
function resolvePointer(obj, pointer) {
  if (pointer === &#34;&#34;) return obj;
  const tokens = pointer.slice(1).split(&#34;/&#34;).map(t =&gt;
    t.replace(/~1/g, &#34;/&#34;).replace(/~0/g, &#34;~&#34;)
  );
  let current = obj;
  for (const token of tokens) {
    if (current === null || current === undefined) return undefined;
    current = Array.isArray(current) ? current[parseInt(token)] : current[token];
  }
  return current;
}

// 使用
const data = { users: [{ name: &#34;Alice&#34; }] };
console.log(resolvePointer(data, &#34;/users/0/name&#34;)); // &#34;Alice&#34;</code></pre>
<h3>Python</h3>
<pre><code class="language-python">import jsonpointer

data = {
    &#34;users&#34;: [{&#34;name&#34;: &#34;Alice&#34;}, {&#34;name&#34;: &#34;Bob&#34;}],
    &#34;meta&#34;: {&#34;version&#34;: 2}
}

# 解析
print(jsonpointer.resolve_pointer(data, &#34;/users/0/name&#34;))  # &#34;Alice&#34;

# 设置值
jsonpointer.set_pointer(data, &#34;/meta/version&#34;, 3)
print(data[&#34;meta&#34;][&#34;version&#34;])  # 3</code></pre>
<h2>在 JSON Schema 中的应用</h2>
<pre><code class="language-json">{
  &#34;$defs&#34;: {
    &#34;address&#34;: {
      &#34;type&#34;: &#34;object&#34;,
      &#34;properties&#34;: {
        &#34;city&#34;: { &#34;type&#34;: &#34;string&#34; }
      }
    }
  },
  &#34;properties&#34;: {
    &#34;home&#34;: { &#34;$ref&#34;: &#34;#/$defs/address&#34; }
  }
}</code></pre>
<p><code>#/$defs/address</code> 中，<code>#</code> 代表当前文档，后面跟的就是 JSON Pointer。</p>
<h2>JSON Pointer vs JSONPath</h2>
<table>
<thead><tr><th>维度</th><th>JSON Pointer</th><th>JSONPath</th></tr></thead>
<tbody>
<tr><td>标准</td><td>RFC 6901</td><td>RFC 9535</td></tr>
<tr><td>定位</td><td>单个精确值</td><td>可匹配多个值</td></tr>
<tr><td>通配符</td><td>不支持</td><td><code>*</code>、<code>..</code></td></tr>
<tr><td>过滤</td><td>不支持</td><td><code>?(@.price &gt; 10)</code></td></tr>
<tr><td>用途</td><td>引用、Patch、Schema</td><td>查询、提取</td></tr>
</tbody>
</table>
<p>简单说：<strong>JSON Pointer 是地址，JSONPath 是查询语言</strong>。</p>
<h2>小结</h2>
<ul>
<li>JSON Pointer 用 <code>/</code> 分隔路径精确定位 JSON 中的单个值</li>
<li><code>~0</code> 转义 <code>~</code>，<code>~1</code> 转义 <code>/</code></li>
<li>被 JSON Schema、JSON Patch、OpenAPI 等标准广泛使用</li>
<li>与 JSONPath 互补：Pointer 定位精确位置，Path 做复杂查询</li>
</ul>
`,
en: `<h1>JSON Pointer：精确定位 JSON 中的值</h1>
<h2>什么是 JSON Pointer</h2>
<p>JSON Pointer（RFC 6901）是一种用字符串路径精确定位 JSON 文档中某个值的标准语法。它被 JSON Schema（<code>$ref</code>）、JSON Patch（<code>path</code>）、OpenAPI 等规范广泛使用。</p>
<pre><code>/store/books/0/title</code></pre>
<p>这个指针表示：根对象 → <code>store</code> 属性 → <code>books</code> 属性 → 第 0 个元素 → <code>title</code> 属性。</p>
<h2>语法规则</h2>
<table>
<thead><tr><th>规则</th><th>说明</th></tr></thead>
<tbody>
<tr><td>空字符串 <code>&#34;&#34;</code></td><td>指向整个文档（根）</td></tr>
<tr><td>以 <code>/</code> 开头</td><td>每个 <code>/</code> 分隔一个层级</td></tr>
<tr><td>数组用数字索引</td><td><code>/items/0</code> 表示第一个元素</td></tr>
<tr><td><code>~0</code> 转义 <code>~</code></td><td>字段名含 <code>~</code> 时用 <code>~0</code></td></tr>
<tr><td><code>~1</code> 转义 <code>/</code></td><td>字段名含 <code>/</code> 时用 <code>~1</code></td></tr>
</tbody>
</table>
<h3>转义示例</h3>
<p>JSON 数据：</p>
<pre><code class="language-json">{
  &#34;a/b&#34;: 1,
  &#34;c~d&#34;: 2,
  &#34;m~n/o&#34;: 3
}</code></pre>
<table>
<thead><tr><th>JSON Pointer</th><th>目标值</th></tr></thead>
<tbody>
<tr><td><code>/a~1b</code></td><td><code>1</code>（<code>/</code> → <code>~1</code>）</td></tr>
<tr><td><code>/c~0d</code></td><td><code>2</code>（<code>~</code> → <code>~0</code>）</td></tr>
<tr><td><code>/m~0n~1o</code></td><td><code>3</code>（先 <code>~</code> → <code>~0</code>，再 <code>/</code> → <code>~1</code>）</td></tr>
</tbody>
</table>
<blockquote><p>转义顺序：先处理 <code>~0</code>（<code>~</code>），再处理 <code>~1</code>（<code>/</code>）。</p></blockquote>
<h2>完整示例</h2>
<pre><code class="language-json">{
  &#34;users&#34;: [
    {
      &#34;name&#34;: &#34;Alice&#34;,
      &#34;contacts&#34;: {
        &#34;email&#34;: &#34;alice@example.com&#34;,
        &#34;phones&#34;: [&#34;+86-138-0001-0001&#34;, &#34;+86-139-0002-0002&#34;]
      }
    },
    {
      &#34;name&#34;: &#34;Bob&#34;,
      &#34;contacts&#34;: {
        &#34;email&#34;: &#34;bob@example.com&#34;
      }
    }
  ],
  &#34;metadata&#34;: {
    &#34;version&#34;: 2,
    &#34;tags&#34;: [&#34;production&#34;, &#34;v2&#34;]
  }
}</code></pre>
<table>
<thead><tr><th>JSON Pointer</th><th>结果</th></tr></thead>
<tbody>
<tr><td>\`\` (空)</td><td>整个文档</td></tr>
<tr><td><code>/users</code></td><td>用户数组</td></tr>
<tr><td><code>/users/0</code></td><td>Alice 对象</td></tr>
<tr><td><code>/users/0/name</code></td><td><code>&#34;Alice&#34;</code></td></tr>
<tr><td><code>/users/0/contacts/phones/1</code></td><td><code>&#34;+86-139-0002-0002&#34;</code></td></tr>
<tr><td><code>/users/1/contacts/email</code></td><td><code>&#34;bob@example.com&#34;</code></td></tr>
<tr><td><code>/metadata/tags/0</code></td><td><code>&#34;production&#34;</code></td></tr>
</tbody>
</table>
<h2>各语言实现</h2>
<h3>JavaScript</h3>
<pre><code class="language-javascript">// 简单实现
function resolvePointer(obj, pointer) {
  if (pointer === &#34;&#34;) return obj;
  const tokens = pointer.slice(1).split(&#34;/&#34;).map(t =&gt;
    t.replace(/~1/g, &#34;/&#34;).replace(/~0/g, &#34;~&#34;)
  );
  let current = obj;
  for (const token of tokens) {
    if (current === null || current === undefined) return undefined;
    current = Array.isArray(current) ? current[parseInt(token)] : current[token];
  }
  return current;
}

// 使用
const data = { users: [{ name: &#34;Alice&#34; }] };
console.log(resolvePointer(data, &#34;/users/0/name&#34;)); // &#34;Alice&#34;</code></pre>
<h3>Python</h3>
<pre><code class="language-python">import jsonpointer

data = {
    &#34;users&#34;: [{&#34;name&#34;: &#34;Alice&#34;}, {&#34;name&#34;: &#34;Bob&#34;}],
    &#34;meta&#34;: {&#34;version&#34;: 2}
}

# 解析
print(jsonpointer.resolve_pointer(data, &#34;/users/0/name&#34;))  # &#34;Alice&#34;

# 设置值
jsonpointer.set_pointer(data, &#34;/meta/version&#34;, 3)
print(data[&#34;meta&#34;][&#34;version&#34;])  # 3</code></pre>
<h2>在 JSON Schema 中的应用</h2>
<pre><code class="language-json">{
  &#34;$defs&#34;: {
    &#34;address&#34;: {
      &#34;type&#34;: &#34;object&#34;,
      &#34;properties&#34;: {
        &#34;city&#34;: { &#34;type&#34;: &#34;string&#34; }
      }
    }
  },
  &#34;properties&#34;: {
    &#34;home&#34;: { &#34;$ref&#34;: &#34;#/$defs/address&#34; }
  }
}</code></pre>
<p><code>#/$defs/address</code> 中，<code>#</code> 代表当前文档，后面跟的就是 JSON Pointer。</p>
<h2>JSON Pointer vs JSONPath</h2>
<table>
<thead><tr><th>维度</th><th>JSON Pointer</th><th>JSONPath</th></tr></thead>
<tbody>
<tr><td>标准</td><td>RFC 6901</td><td>RFC 9535</td></tr>
<tr><td>定位</td><td>单个精确值</td><td>可匹配多个值</td></tr>
<tr><td>通配符</td><td>不支持</td><td><code>*</code>、<code>..</code></td></tr>
<tr><td>过滤</td><td>不支持</td><td><code>?(@.price &gt; 10)</code></td></tr>
<tr><td>用途</td><td>引用、Patch、Schema</td><td>查询、提取</td></tr>
</tbody>
</table>
<p>简单说：<strong>JSON Pointer 是地址，JSONPath 是查询语言</strong>。</p>
<h2>小结</h2>
<ul>
<li>JSON Pointer 用 <code>/</code> 分隔路径精确定位 JSON 中的单个值</li>
<li><code>~0</code> 转义 <code>~</code>，<code>~1</code> 转义 <code>/</code></li>
<li>被 JSON Schema、JSON Patch、OpenAPI 等标准广泛使用</li>
<li>与 JSONPath 互补：Pointer 定位精确位置，Path 做复杂查询</li>
</ul>
`
};

window.LEARN_ARTICLES["ndjson"] = {
zh: `<h1>NDJSON：换行分隔的 JSON 流</h1>
<h2>什么是 NDJSON</h2>
<p>NDJSON（Newline Delimited JSON），也叫 JSON Lines / JSONL，是一种每行一个 JSON 对象的文本格式：</p>
<pre><code>{&#34;id&#34;:1,&#34;event&#34;:&#34;login&#34;,&#34;user&#34;:&#34;alice&#34;,&#34;ts&#34;:&#34;2025-01-15T08:00:00Z&#34;}
{&#34;id&#34;:2,&#34;event&#34;:&#34;view&#34;,&#34;user&#34;:&#34;alice&#34;,&#34;ts&#34;:&#34;2025-01-15T08:01:23Z&#34;}
{&#34;id&#34;:3,&#34;event&#34;:&#34;purchase&#34;,&#34;user&#34;:&#34;bob&#34;,&#34;ts&#34;:&#34;2025-01-15T08:02:45Z&#34;}</code></pre>
<p>每行是一个独立的、完整的 JSON 值，用 <code>\\n</code> 分隔。没有外层的 <code>[]</code> 包裹，也没有逗号分隔。</p>
<h2>为什么不用 JSON 数组</h2>
<p>普通 JSON 数组（<code>[{...}, {...}, ...]</code>）有几个严重问题：</p>
<ol>
<li><strong>内存</strong>：必须把整个数组读入内存才能解析</li>
<li><strong>追加</strong>：往数组末尾加元素需要先读取整个文件、修改、再写回</li>
<li><strong>流式</strong>：无法边产生边消费，必须等整个数组完成</li>
<li><strong>容错</strong>：数组中间任何一处语法错误，整个文件无法解析</li>
</ol>
<p>NDJSON 解决了所有这些问题：</p>
<table>
<thead><tr><th>维度</th><th>JSON Array</th><th>NDJSON</th></tr></thead>
<tbody>
<tr><td>内存占用</td><td>全部加载</td><td>逐行处理</td></tr>
<tr><td>追加数据</td><td>需要重写文件</td><td>直接 append</td></tr>
<tr><td>流式处理</td><td>不支持</td><td>天然支持</td></tr>
<tr><td>容错性</td><td>一处出错全废</td><td>跳过坏行继续</td></tr>
<tr><td>文件大小限制</td><td>受内存限制</td><td>几乎无限</td></tr>
</tbody>
</table>
<h2>使用场景</h2>
<ul>
<li><strong>日志收集</strong>：每条日志一行 JSON（ELK Stack、Fluentd）</li>
<li><strong>数据管道</strong>：ETL 中间格式</li>
<li><strong>AI/ML 数据集</strong>：训练数据通常是 JSONL 格式</li>
<li><strong>数据库导出</strong>：MongoDB <code>mongoexport</code> 默认输出 NDJSON</li>
<li><strong>API 流式响应</strong>：Server-Sent Events、ChatGPT API</li>
<li><strong>大文件处理</strong>：GB 级数据的逐行处理</li>
</ul>
<h2>各语言处理</h2>
<h3>Python</h3>
<pre><code class="language-python">import json

# 写入 NDJSON
events = [
    {&#34;id&#34;: 1, &#34;event&#34;: &#34;login&#34;, &#34;user&#34;: &#34;alice&#34;},
    {&#34;id&#34;: 2, &#34;event&#34;: &#34;view&#34;, &#34;user&#34;: &#34;bob&#34;},
    {&#34;id&#34;: 3, &#34;event&#34;: &#34;purchase&#34;, &#34;user&#34;: &#34;alice&#34;},
]

with open(&#34;events.jsonl&#34;, &#34;w&#34;) as f:
    for event in events:
        f.write(json.dumps(event, ensure_ascii=False) + &#34;\\n&#34;)

# 逐行读取（内存友好）
with open(&#34;events.jsonl&#34;) as f:
    for line in f:
        line = line.strip()
        if line:  # 跳过空行
            record = json.loads(line)
            print(record[&#34;event&#34;])

# 用生成器处理大文件
def read_ndjson(filepath):
    with open(filepath) as f:
        for lineno, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            try:
                yield json.loads(line)
            except json.JSONDecodeError as e:
                print(f&#34;Line {lineno} error: {e}&#34;)
                continue  # 跳过坏行

# 统计 alice 的事件数
alice_count = sum(1 for r in read_ndjson(&#34;events.jsonl&#34;) if r[&#34;user&#34;] == &#34;alice&#34;)</code></pre>
<h3>Node.js</h3>
<pre><code class="language-javascript">const fs = require(&#34;fs&#34;);
const readline = require(&#34;readline&#34;);

// 逐行流式读取
async function processNDJSON(filepath) {
  const rl = readline.createInterface({
    input: fs.createReadStream(filepath),
    crlfDelay: Infinity,
  });

  const results = [];
  for await (const line of rl) {
    if (line.trim()) {
      try {
        results.push(JSON.parse(line));
      } catch (e) {
        console.error(&#34;Bad line:&#34;, e.message);
      }
    }
  }
  return results;
}

// 写入
function writeNDJSON(filepath, records) {
  const stream = fs.createWriteStream(filepath);
  for (const record of records) {
    stream.write(JSON.stringify(record) + &#34;\\n&#34;);
  }
  stream.end();
}

// 追加一条记录
function appendNDJSON(filepath, record) {
  fs.appendFileSync(filepath, JSON.stringify(record) + &#34;\\n&#34;);
}</code></pre>
<h3>Go</h3>
<pre><code class="language-go">package main

import (
    &#34;bufio&#34;
    &#34;encoding/json&#34;
    &#34;fmt&#34;
    &#34;os&#34;
)

type Event struct {
    ID    int    \`json:&#34;id&#34;\`
    Event string \`json:&#34;event&#34;\`
    User  string \`json:&#34;user&#34;\`
}

func readNDJSON(filepath string) ([]Event, error) {
    f, err := os.Open(filepath)
    if err != nil {
        return nil, err
    }
    defer f.Close()

    var events []Event
    scanner := bufio.NewScanner(f)
    for scanner.Scan() {
        var e Event
        if err := json.Unmarshal(scanner.Bytes(), &amp;e); err != nil {
            fmt.Printf(&#34;Skipping bad line: %v\\n&#34;, err)
            continue
        }
        events = append(events, e)
    }
    return events, scanner.Err()
}</code></pre>
<h3>命令行（jq）</h3>
<pre><code class="language-bash"># 过滤特定用户的事件
cat events.jsonl | jq &#39;select(.user == &#34;alice&#34;)&#39;

# 统计每种事件的数量
cat events.jsonl | jq -s &#39;group_by(.event) | map({event: .[0].event, count: length})&#39;

# 提取所有用户名（去重）
cat events.jsonl | jq -r &#39;.user&#39; | sort -u</code></pre>
<h2>规范细节</h2>
<ol>
<li>每行必须是一个完整的 JSON 值（通常是对象）</li>
<li>行分隔符是 <code>\\n</code>（LF），<code>\\r\\n</code>（CRLF）也可接受</li>
<li>每行内部不应有换行（JSON 要紧凑格式）</li>
<li>文件扩展名：<code>.jsonl</code>、<code>.ndjson</code>、<code>.ldjson</code></li>
<li>MIME 类型：<code>application/x-ndjson</code></li>
</ol>
<h2>小结</h2>
<ul>
<li>NDJSON 是每行一个 JSON 值的简单格式</li>
<li>天然支持流式处理、追加写入、跳过坏行</li>
<li>是日志、数据管道、ML 数据集的标准格式</li>
<li>配合 jq 可以在命令行高效处理</li>
<li>处理大文件时比 JSON 数组更节省内存</li>
</ul>
`,
en: `<h1>NDJSON：换行分隔的 JSON 流</h1>
<h2>什么是 NDJSON</h2>
<p>NDJSON（Newline Delimited JSON），也叫 JSON Lines / JSONL，是一种每行一个 JSON 对象的文本格式：</p>
<pre><code>{&#34;id&#34;:1,&#34;event&#34;:&#34;login&#34;,&#34;user&#34;:&#34;alice&#34;,&#34;ts&#34;:&#34;2025-01-15T08:00:00Z&#34;}
{&#34;id&#34;:2,&#34;event&#34;:&#34;view&#34;,&#34;user&#34;:&#34;alice&#34;,&#34;ts&#34;:&#34;2025-01-15T08:01:23Z&#34;}
{&#34;id&#34;:3,&#34;event&#34;:&#34;purchase&#34;,&#34;user&#34;:&#34;bob&#34;,&#34;ts&#34;:&#34;2025-01-15T08:02:45Z&#34;}</code></pre>
<p>每行是一个独立的、完整的 JSON 值，用 <code>\\n</code> 分隔。没有外层的 <code>[]</code> 包裹，也没有逗号分隔。</p>
<h2>为什么不用 JSON 数组</h2>
<p>普通 JSON 数组（<code>[{...}, {...}, ...]</code>）有几个严重问题：</p>
<ol>
<li><strong>内存</strong>：必须把整个数组读入内存才能解析</li>
<li><strong>追加</strong>：往数组末尾加元素需要先读取整个文件、修改、再写回</li>
<li><strong>流式</strong>：无法边产生边消费，必须等整个数组完成</li>
<li><strong>容错</strong>：数组中间任何一处语法错误，整个文件无法解析</li>
</ol>
<p>NDJSON 解决了所有这些问题：</p>
<table>
<thead><tr><th>维度</th><th>JSON Array</th><th>NDJSON</th></tr></thead>
<tbody>
<tr><td>内存占用</td><td>全部加载</td><td>逐行处理</td></tr>
<tr><td>追加数据</td><td>需要重写文件</td><td>直接 append</td></tr>
<tr><td>流式处理</td><td>不支持</td><td>天然支持</td></tr>
<tr><td>容错性</td><td>一处出错全废</td><td>跳过坏行继续</td></tr>
<tr><td>文件大小限制</td><td>受内存限制</td><td>几乎无限</td></tr>
</tbody>
</table>
<h2>使用场景</h2>
<ul>
<li><strong>日志收集</strong>：每条日志一行 JSON（ELK Stack、Fluentd）</li>
<li><strong>数据管道</strong>：ETL 中间格式</li>
<li><strong>AI/ML 数据集</strong>：训练数据通常是 JSONL 格式</li>
<li><strong>数据库导出</strong>：MongoDB <code>mongoexport</code> 默认输出 NDJSON</li>
<li><strong>API 流式响应</strong>：Server-Sent Events、ChatGPT API</li>
<li><strong>大文件处理</strong>：GB 级数据的逐行处理</li>
</ul>
<h2>各语言处理</h2>
<h3>Python</h3>
<pre><code class="language-python">import json

# 写入 NDJSON
events = [
    {&#34;id&#34;: 1, &#34;event&#34;: &#34;login&#34;, &#34;user&#34;: &#34;alice&#34;},
    {&#34;id&#34;: 2, &#34;event&#34;: &#34;view&#34;, &#34;user&#34;: &#34;bob&#34;},
    {&#34;id&#34;: 3, &#34;event&#34;: &#34;purchase&#34;, &#34;user&#34;: &#34;alice&#34;},
]

with open(&#34;events.jsonl&#34;, &#34;w&#34;) as f:
    for event in events:
        f.write(json.dumps(event, ensure_ascii=False) + &#34;\\n&#34;)

# 逐行读取（内存友好）
with open(&#34;events.jsonl&#34;) as f:
    for line in f:
        line = line.strip()
        if line:  # 跳过空行
            record = json.loads(line)
            print(record[&#34;event&#34;])

# 用生成器处理大文件
def read_ndjson(filepath):
    with open(filepath) as f:
        for lineno, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            try:
                yield json.loads(line)
            except json.JSONDecodeError as e:
                print(f&#34;Line {lineno} error: {e}&#34;)
                continue  # 跳过坏行

# 统计 alice 的事件数
alice_count = sum(1 for r in read_ndjson(&#34;events.jsonl&#34;) if r[&#34;user&#34;] == &#34;alice&#34;)</code></pre>
<h3>Node.js</h3>
<pre><code class="language-javascript">const fs = require(&#34;fs&#34;);
const readline = require(&#34;readline&#34;);

// 逐行流式读取
async function processNDJSON(filepath) {
  const rl = readline.createInterface({
    input: fs.createReadStream(filepath),
    crlfDelay: Infinity,
  });

  const results = [];
  for await (const line of rl) {
    if (line.trim()) {
      try {
        results.push(JSON.parse(line));
      } catch (e) {
        console.error(&#34;Bad line:&#34;, e.message);
      }
    }
  }
  return results;
}

// 写入
function writeNDJSON(filepath, records) {
  const stream = fs.createWriteStream(filepath);
  for (const record of records) {
    stream.write(JSON.stringify(record) + &#34;\\n&#34;);
  }
  stream.end();
}

// 追加一条记录
function appendNDJSON(filepath, record) {
  fs.appendFileSync(filepath, JSON.stringify(record) + &#34;\\n&#34;);
}</code></pre>
<h3>Go</h3>
<pre><code class="language-go">package main

import (
    &#34;bufio&#34;
    &#34;encoding/json&#34;
    &#34;fmt&#34;
    &#34;os&#34;
)

type Event struct {
    ID    int    \`json:&#34;id&#34;\`
    Event string \`json:&#34;event&#34;\`
    User  string \`json:&#34;user&#34;\`
}

func readNDJSON(filepath string) ([]Event, error) {
    f, err := os.Open(filepath)
    if err != nil {
        return nil, err
    }
    defer f.Close()

    var events []Event
    scanner := bufio.NewScanner(f)
    for scanner.Scan() {
        var e Event
        if err := json.Unmarshal(scanner.Bytes(), &amp;e); err != nil {
            fmt.Printf(&#34;Skipping bad line: %v\\n&#34;, err)
            continue
        }
        events = append(events, e)
    }
    return events, scanner.Err()
}</code></pre>
<h3>命令行（jq）</h3>
<pre><code class="language-bash"># 过滤特定用户的事件
cat events.jsonl | jq &#39;select(.user == &#34;alice&#34;)&#39;

# 统计每种事件的数量
cat events.jsonl | jq -s &#39;group_by(.event) | map({event: .[0].event, count: length})&#39;

# 提取所有用户名（去重）
cat events.jsonl | jq -r &#39;.user&#39; | sort -u</code></pre>
<h2>规范细节</h2>
<ol>
<li>每行必须是一个完整的 JSON 值（通常是对象）</li>
<li>行分隔符是 <code>\\n</code>（LF），<code>\\r\\n</code>（CRLF）也可接受</li>
<li>每行内部不应有换行（JSON 要紧凑格式）</li>
<li>文件扩展名：<code>.jsonl</code>、<code>.ndjson</code>、<code>.ldjson</code></li>
<li>MIME 类型：<code>application/x-ndjson</code></li>
</ol>
<h2>小结</h2>
<ul>
<li>NDJSON 是每行一个 JSON 值的简单格式</li>
<li>天然支持流式处理、追加写入、跳过坏行</li>
<li>是日志、数据管道、ML 数据集的标准格式</li>
<li>配合 jq 可以在命令行高效处理</li>
<li>处理大文件时比 JSON 数组更节省内存</li>
</ul>
`
};

window.LEARN_ARTICLES["geojson"] = {
zh: `<h1>GeoJSON：地理数据的 JSON 表示</h1>
<h2>什么是 GeoJSON</h2>
<p>GeoJSON（RFC 7946）是用 JSON 格式表示地理空间数据的标准。它可以描述点、线、面等几何形状及其属性，被主流地图库（Leaflet、Mapbox、Google Maps）和 GIS 工具原生支持。</p>
<h2>几何类型</h2>
<h3>Point（点）</h3>
<pre><code class="language-json">{
  &#34;type&#34;: &#34;Point&#34;,
  &#34;coordinates&#34;: [116.4074, 39.9042]
}</code></pre>
<p>坐标顺序：<strong>[经度, 纬度]</strong>（注意不是纬度在前）。</p>
<h3>LineString（线）</h3>
<pre><code class="language-json">{
  &#34;type&#34;: &#34;LineString&#34;,
  &#34;coordinates&#34;: [
    [116.4074, 39.9042],
    [121.4737, 31.2304],
    [113.2644, 23.1291]
  ]
}</code></pre>
<h3>Polygon（面）</h3>
<pre><code class="language-json">{
  &#34;type&#34;: &#34;Polygon&#34;,
  &#34;coordinates&#34;: [[
    [116.0, 39.5],
    [117.0, 39.5],
    [117.0, 40.5],
    [116.0, 40.5],
    [116.0, 39.5]
  ]]
}</code></pre>
<p>多边形的第一个和最后一个坐标必须相同（闭合）。外层数组支持多环（外环 + 内部空洞）。</p>
<h3>MultiPoint / MultiLineString / MultiPolygon</h3>
<pre><code class="language-json">{
  &#34;type&#34;: &#34;MultiPoint&#34;,
  &#34;coordinates&#34;: [
    [116.4074, 39.9042],
    [121.4737, 31.2304]
  ]
}</code></pre>
<h3>GeometryCollection</h3>
<pre><code class="language-json">{
  &#34;type&#34;: &#34;GeometryCollection&#34;,
  &#34;geometries&#34;: [
    { &#34;type&#34;: &#34;Point&#34;, &#34;coordinates&#34;: [116.4, 39.9] },
    { &#34;type&#34;: &#34;LineString&#34;, &#34;coordinates&#34;: [[116.4, 39.9], [121.5, 31.2]] }
  ]
}</code></pre>
<h2>Feature 和 FeatureCollection</h2>
<p>实际应用中很少直接使用裸几何体。<strong>Feature</strong> 将几何体与属性绑定：</p>
<pre><code class="language-json">{
  &#34;type&#34;: &#34;Feature&#34;,
  &#34;geometry&#34;: {
    &#34;type&#34;: &#34;Point&#34;,
    &#34;coordinates&#34;: [116.4074, 39.9042]
  },
  &#34;properties&#34;: {
    &#34;name&#34;: &#34;天安门广场&#34;,
    &#34;city&#34;: &#34;北京&#34;,
    &#34;visitors_per_year&#34;: 15000000
  }
}</code></pre>
<p><strong>FeatureCollection</strong> 是 Feature 的集合：</p>
<pre><code class="language-json">{
  &#34;type&#34;: &#34;FeatureCollection&#34;,
  &#34;features&#34;: [
    {
      &#34;type&#34;: &#34;Feature&#34;,
      &#34;geometry&#34;: { &#34;type&#34;: &#34;Point&#34;, &#34;coordinates&#34;: [116.4074, 39.9042] },
      &#34;properties&#34;: { &#34;name&#34;: &#34;北京&#34;, &#34;population&#34;: 21540000 }
    },
    {
      &#34;type&#34;: &#34;Feature&#34;,
      &#34;geometry&#34;: { &#34;type&#34;: &#34;Point&#34;, &#34;coordinates&#34;: [121.4737, 31.2304] },
      &#34;properties&#34;: { &#34;name&#34;: &#34;上海&#34;, &#34;population&#34;: 24870000 }
    },
    {
      &#34;type&#34;: &#34;Feature&#34;,
      &#34;geometry&#34;: { &#34;type&#34;: &#34;Point&#34;, &#34;coordinates&#34;: [113.2644, 23.1291] },
      &#34;properties&#34;: { &#34;name&#34;: &#34;广州&#34;, &#34;population&#34;: 18676605 }
    }
  ]
}</code></pre>
<h2>实战：在地图上展示</h2>
<h3>Leaflet (JavaScript)</h3>
<pre><code class="language-html">&lt;link rel=&#34;stylesheet&#34; href=&#34;https://unpkg.com/leaflet/dist/leaflet.css&#34; /&gt;
&lt;script src=&#34;https://unpkg.com/leaflet/dist/leaflet.js&#34;&gt;&lt;/script&gt;

&lt;div id=&#34;map&#34; style=&#34;height: 500px;&#34;&gt;&lt;/div&gt;
&lt;script&gt;
const map = L.map(&#34;map&#34;).setView([35, 110], 4);
L.tileLayer(&#34;https://tile.openstreetmap.org/{z}/{x}/{y}.png&#34;).addTo(map);

const geojson = {
  type: &#34;FeatureCollection&#34;,
  features: [
    {
      type: &#34;Feature&#34;,
      geometry: { type: &#34;Point&#34;, coordinates: [116.4074, 39.9042] },
      properties: { name: &#34;北京&#34; }
    }
    // ... 更多 features
  ]
};

L.geoJSON(geojson, {
  onEachFeature: (feature, layer) =&gt; {
    layer.bindPopup(feature.properties.name);
  }
}).addTo(map);
&lt;/script&gt;</code></pre>
<h3>Python（shapely + geopandas）</h3>
<pre><code class="language-python">import geopandas as gpd
import json

# 从文件读取
gdf = gpd.read_file(&#34;cities.geojson&#34;)
print(gdf.head())

# 空间查询：找出某区域内的点
from shapely.geometry import box
bbox = box(110, 30, 120, 40)
cities_in_bbox = gdf[gdf.geometry.within(bbox)]

# 输出为 GeoJSON
print(cities_in_bbox.to_json())</code></pre>
<h2>注意事项</h2>
<ol>
<li><strong>坐标顺序是 [经度, 纬度]</strong>，不是 [纬度, 经度]。这是最常见的错误</li>
<li>坐标使用 WGS 84 坐标系（EPSG:4326），与 GPS 一致</li>
<li>多边形必须闭合（首尾坐标相同）</li>
<li>避免超大 GeoJSON 文件（>50MB），考虑使用 TopoJSON 或矢量切片</li>
<li><code>properties</code> 可以包含任意键值对，没有固定 Schema</li>
</ol>
<h2>GeoJSON vs TopoJSON</h2>
<table>
<thead><tr><th>维度</th><th>GeoJSON</th><th>TopoJSON</th></tr></thead>
<tbody>
<tr><td>标准</td><td>RFC 7946</td><td>D3.js 社区</td></tr>
<tr><td>体积</td><td>大（坐标重复）</td><td>小（共享边界，可减 80%）</td></tr>
<tr><td>兼容性</td><td>所有地图库原生支持</td><td>需要 topojson-client 转换</td></tr>
<tr><td>拓扑关系</td><td>无</td><td>有（相邻区域共享边界）</td></tr>
</tbody>
</table>
<h2>小结</h2>
<ul>
<li>GeoJSON 用 JSON 描述地理空间数据，支持点、线、面等几何类型</li>
<li>坐标顺序是 <code>[经度, 纬度]</code>，使用 WGS 84 坐标系</li>
<li>Feature 将几何体和属性绑定，FeatureCollection 是常用的顶层结构</li>
<li>主流地图库（Leaflet、Mapbox、Google Maps）原生支持</li>
<li>大数据量场景考虑 TopoJSON 或矢量切片优化</li>
</ul>
`,
en: `<h1>GeoJSON：地理数据的 JSON 表示</h1>
<h2>什么是 GeoJSON</h2>
<p>GeoJSON（RFC 7946）是用 JSON 格式表示地理空间数据的标准。它可以描述点、线、面等几何形状及其属性，被主流地图库（Leaflet、Mapbox、Google Maps）和 GIS 工具原生支持。</p>
<h2>几何类型</h2>
<h3>Point（点）</h3>
<pre><code class="language-json">{
  &#34;type&#34;: &#34;Point&#34;,
  &#34;coordinates&#34;: [116.4074, 39.9042]
}</code></pre>
<p>坐标顺序：<strong>[经度, 纬度]</strong>（注意不是纬度在前）。</p>
<h3>LineString（线）</h3>
<pre><code class="language-json">{
  &#34;type&#34;: &#34;LineString&#34;,
  &#34;coordinates&#34;: [
    [116.4074, 39.9042],
    [121.4737, 31.2304],
    [113.2644, 23.1291]
  ]
}</code></pre>
<h3>Polygon（面）</h3>
<pre><code class="language-json">{
  &#34;type&#34;: &#34;Polygon&#34;,
  &#34;coordinates&#34;: [[
    [116.0, 39.5],
    [117.0, 39.5],
    [117.0, 40.5],
    [116.0, 40.5],
    [116.0, 39.5]
  ]]
}</code></pre>
<p>多边形的第一个和最后一个坐标必须相同（闭合）。外层数组支持多环（外环 + 内部空洞）。</p>
<h3>MultiPoint / MultiLineString / MultiPolygon</h3>
<pre><code class="language-json">{
  &#34;type&#34;: &#34;MultiPoint&#34;,
  &#34;coordinates&#34;: [
    [116.4074, 39.9042],
    [121.4737, 31.2304]
  ]
}</code></pre>
<h3>GeometryCollection</h3>
<pre><code class="language-json">{
  &#34;type&#34;: &#34;GeometryCollection&#34;,
  &#34;geometries&#34;: [
    { &#34;type&#34;: &#34;Point&#34;, &#34;coordinates&#34;: [116.4, 39.9] },
    { &#34;type&#34;: &#34;LineString&#34;, &#34;coordinates&#34;: [[116.4, 39.9], [121.5, 31.2]] }
  ]
}</code></pre>
<h2>Feature 和 FeatureCollection</h2>
<p>实际应用中很少直接使用裸几何体。<strong>Feature</strong> 将几何体与属性绑定：</p>
<pre><code class="language-json">{
  &#34;type&#34;: &#34;Feature&#34;,
  &#34;geometry&#34;: {
    &#34;type&#34;: &#34;Point&#34;,
    &#34;coordinates&#34;: [116.4074, 39.9042]
  },
  &#34;properties&#34;: {
    &#34;name&#34;: &#34;天安门广场&#34;,
    &#34;city&#34;: &#34;北京&#34;,
    &#34;visitors_per_year&#34;: 15000000
  }
}</code></pre>
<p><strong>FeatureCollection</strong> 是 Feature 的集合：</p>
<pre><code class="language-json">{
  &#34;type&#34;: &#34;FeatureCollection&#34;,
  &#34;features&#34;: [
    {
      &#34;type&#34;: &#34;Feature&#34;,
      &#34;geometry&#34;: { &#34;type&#34;: &#34;Point&#34;, &#34;coordinates&#34;: [116.4074, 39.9042] },
      &#34;properties&#34;: { &#34;name&#34;: &#34;北京&#34;, &#34;population&#34;: 21540000 }
    },
    {
      &#34;type&#34;: &#34;Feature&#34;,
      &#34;geometry&#34;: { &#34;type&#34;: &#34;Point&#34;, &#34;coordinates&#34;: [121.4737, 31.2304] },
      &#34;properties&#34;: { &#34;name&#34;: &#34;上海&#34;, &#34;population&#34;: 24870000 }
    },
    {
      &#34;type&#34;: &#34;Feature&#34;,
      &#34;geometry&#34;: { &#34;type&#34;: &#34;Point&#34;, &#34;coordinates&#34;: [113.2644, 23.1291] },
      &#34;properties&#34;: { &#34;name&#34;: &#34;广州&#34;, &#34;population&#34;: 18676605 }
    }
  ]
}</code></pre>
<h2>实战：在地图上展示</h2>
<h3>Leaflet (JavaScript)</h3>
<pre><code class="language-html">&lt;link rel=&#34;stylesheet&#34; href=&#34;https://unpkg.com/leaflet/dist/leaflet.css&#34; /&gt;
&lt;script src=&#34;https://unpkg.com/leaflet/dist/leaflet.js&#34;&gt;&lt;/script&gt;

&lt;div id=&#34;map&#34; style=&#34;height: 500px;&#34;&gt;&lt;/div&gt;
&lt;script&gt;
const map = L.map(&#34;map&#34;).setView([35, 110], 4);
L.tileLayer(&#34;https://tile.openstreetmap.org/{z}/{x}/{y}.png&#34;).addTo(map);

const geojson = {
  type: &#34;FeatureCollection&#34;,
  features: [
    {
      type: &#34;Feature&#34;,
      geometry: { type: &#34;Point&#34;, coordinates: [116.4074, 39.9042] },
      properties: { name: &#34;北京&#34; }
    }
    // ... 更多 features
  ]
};

L.geoJSON(geojson, {
  onEachFeature: (feature, layer) =&gt; {
    layer.bindPopup(feature.properties.name);
  }
}).addTo(map);
&lt;/script&gt;</code></pre>
<h3>Python（shapely + geopandas）</h3>
<pre><code class="language-python">import geopandas as gpd
import json

# 从文件读取
gdf = gpd.read_file(&#34;cities.geojson&#34;)
print(gdf.head())

# 空间查询：找出某区域内的点
from shapely.geometry import box
bbox = box(110, 30, 120, 40)
cities_in_bbox = gdf[gdf.geometry.within(bbox)]

# 输出为 GeoJSON
print(cities_in_bbox.to_json())</code></pre>
<h2>注意事项</h2>
<ol>
<li><strong>坐标顺序是 [经度, 纬度]</strong>，不是 [纬度, 经度]。这是最常见的错误</li>
<li>坐标使用 WGS 84 坐标系（EPSG:4326），与 GPS 一致</li>
<li>多边形必须闭合（首尾坐标相同）</li>
<li>避免超大 GeoJSON 文件（>50MB），考虑使用 TopoJSON 或矢量切片</li>
<li><code>properties</code> 可以包含任意键值对，没有固定 Schema</li>
</ol>
<h2>GeoJSON vs TopoJSON</h2>
<table>
<thead><tr><th>维度</th><th>GeoJSON</th><th>TopoJSON</th></tr></thead>
<tbody>
<tr><td>标准</td><td>RFC 7946</td><td>D3.js 社区</td></tr>
<tr><td>体积</td><td>大（坐标重复）</td><td>小（共享边界，可减 80%）</td></tr>
<tr><td>兼容性</td><td>所有地图库原生支持</td><td>需要 topojson-client 转换</td></tr>
<tr><td>拓扑关系</td><td>无</td><td>有（相邻区域共享边界）</td></tr>
</tbody>
</table>
<h2>小结</h2>
<ul>
<li>GeoJSON 用 JSON 描述地理空间数据，支持点、线、面等几何类型</li>
<li>坐标顺序是 <code>[经度, 纬度]</code>，使用 WGS 84 坐标系</li>
<li>Feature 将几何体和属性绑定，FeatureCollection 是常用的顶层结构</li>
<li>主流地图库（Leaflet、Mapbox、Google Maps）原生支持</li>
<li>大数据量场景考虑 TopoJSON 或矢量切片优化</li>
</ul>
`
};

