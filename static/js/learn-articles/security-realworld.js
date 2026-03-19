window.LEARN_ARTICLES = window.LEARN_ARTICLES || {};
window.LEARN_ARTICLES["json-security-best-practices"] =
window.LEARN_ARTICLES["json-injection-security"] = {
en: `<h2>JSON Injection and Security</h2><h2>1. Never eval() JSON</h2><pre><code class="language-javascript">// ❌ DANGEROUS — eval() executes arbitrary code
const data = eval('(' + jsonString + ')');

// ✅ SAFE — JSON.parse only parses JSON
const data = JSON.parse(jsonString);</code></pre><h2>2. Validate All Input</h2><pre><code class="language-javascript">// ✅ Always validate before using
import Ajv from 'ajv';
const ajv = new Ajv();
const validate = ajv.compile(schema);
if (!validate(parsedInput)) {
  throw new Error('Invalid input: ' + JSON.stringify(validate.errors));
}</code></pre><h2>3. JSON Injection in SQL</h2><pre><code class="language-sql">-- ❌ Vulnerable to injection via JSON value
SELECT * FROM users WHERE data->>'email' = '" + userInput + "';

-- ✅ Use parameterized queries
SELECT * FROM users WHERE data->>'email' = $1;</code></pre><h2>4. Sensitive Data in JSON</h2><pre><code class="language-javascript">// ❌ Never include sensitive fields in API responses
{
  "id": 1,
  "password": "hashed_secret",  // never
  "ssn": "123-45-6789"           // never
}

// ✅ Use allowlist serialization
const safe = JSON.stringify(user, ['id', 'name', 'email']);</code></pre><h2>5. Prototype Pollution</h2><pre><code class="language-javascript">// Malicious input
const input = '{"__proto__":{"isAdmin":true}}';
const obj = JSON.parse(input); // safe — JSON.parse doesn't pollute prototype

// But deep merge is dangerous:
function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (key === '__proto__') continue; // ✅ block prototype pollution
    // ...
  }
}</code></pre><h2>6. ReDoS in JSON Validators</h2><p>Use well-tested validators (AJV, jsonschema) rather than regex-based validators for JSON strings. Regex on untrusted JSON can cause ReDoS attacks.</p>`,
zh: `<h2>JSON 注入与安全</h2><h2>1. 绝不使用 eval() 解析 JSON</h2><pre><code class="language-javascript">// ❌ 危险——eval() 执行任意代码
const data = eval('(' + jsonString + ')');

// ✅ 安全——JSON.parse 只解析 JSON
const data = JSON.parse(jsonString);</code></pre><h2>2. 验证所有输入</h2><pre><code class="language-javascript">// ✅ 使用前始终验证
import Ajv from 'ajv';
const ajv = new Ajv();
const validate = ajv.compile(schema);
if (!validate(parsedInput)) {
  throw new Error('无效输入: ' + JSON.stringify(validate.errors));
}</code></pre><h2>3. SQL 中的 JSON 注入</h2><pre><code class="language-sql">-- ❌ 通过 JSON 值易受注入攻击
SELECT * FROM users WHERE data->>'email' = '" + userInput + "';

-- ✅ 使用参数化查询
SELECT * FROM users WHERE data->>'email' = $1;</code></pre><h2>4. JSON 中的敏感数据</h2><pre><code class="language-javascript">// ❌ 绝不在 API 响应中包含敏感字段
{
  "id": 1,
  "password": "hashed_secret",  // 绝对不行
  "ssn": "123-45-6789"           // 绝对不行
}

// ✅ 使用允许列表序列化
const safe = JSON.stringify(user, ['id', 'name', 'email']);</code></pre><h2>5. 原型污染</h2><pre><code class="language-javascript">// 恶意输入
const input = '{"__proto__":{"isAdmin":true}}';
const obj = JSON.parse(input); // 安全——JSON.parse 不会污染原型

// 但深度合并是危险的：
function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (key === '__proto__') continue; // ✅ 阻止原型污染
    // ...
  }
}</code></pre>`
};
window.LEARN_ARTICLES["json-rest-api-design"] =
window.LEARN_ARTICLES["json-api-design"] = {
en: `<h2>JSON API Design Best Practices</h2><h2>1. Use Consistent Key Naming</h2><pre><code class="language-json">// ✅ Choose one convention and stick to it
// camelCase (JavaScript standard)
{"userId": 1, "firstName": "Alice", "createdAt": "2025-01-01"}

// snake_case (Python/Ruby standard)
{"user_id": 1, "first_name": "Alice", "created_at": "2025-01-01"}</code></pre><h2>2. Always Wrap in an Object</h2><pre><code class="language-json">// ❌ Bare array (hard to extend)
[{"id":1},{"id":2}]

// ✅ Wrapped (easy to add metadata)
{
  "data": [{"id":1},{"id":2}],
  "total": 2,
  "page": 1
}</code></pre><h2>3. Consistent Error Format</h2><pre><code class="language-json">{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The email field is invalid.",
    "field": "email",
    "status": 422
  }
}</code></pre><h2>4. Use ISO 8601 for Dates</h2><pre><code class="language-json">// ✅ ISO 8601 — universally parseable
{"createdAt": "2025-03-15T10:00:00Z"}

// ❌ Ambiguous formats
{"createdAt": "03/15/2025"}</code></pre><h2>5. Pagination</h2><pre><code class="language-json">{
  "data": [...],
  "pagination": {
    "page": 2,
    "per_page": 20,
    "total": 150,
    "total_pages": 8,
    "next": "/api/users?page=3",
    "prev": "/api/users?page=1"
  }
}</code></pre><h2>6. Versioning</h2><pre><code class="language-bash"># URL versioning (most common)
GET /api/v1/users
GET /api/v2/users

# Header versioning
Accept: application/vnd.myapp.v2+json</code></pre>`,
zh: `<h2>JSON API 设计最佳实践</h2><h2>1. 使用一致的键命名</h2><pre><code class="language-json">// ✅ 选择一种约定并坚持使用
// camelCase（JavaScript 标准）
{"userId": 1, "firstName": "Alice", "createdAt": "2025-01-01"}

// snake_case（Python/Ruby 标准）
{"user_id": 1, "first_name": "Alice", "created_at": "2025-01-01"}</code></pre><h2>2. 始终用对象包裹</h2><pre><code class="language-json">// ❌ 裸数组（难以扩展）
[{"id":1},{"id":2}]

// ✅ 包裹（易于添加元数据）
{
  "data": [{"id":1},{"id":2}],
  "total": 2,
  "page": 1
}</code></pre><h2>3. 一致的错误格式</h2><pre><code class="language-json">{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "email 字段无效。",
    "field": "email",
    "status": 422
  }
}</code></pre><h2>4. 日期使用 ISO 8601</h2><pre><code class="language-json">// ✅ ISO 8601——通用可解析
{"createdAt": "2025-03-15T10:00:00Z"}

// ❌ 有歧义的格式
{"createdAt": "2025/03/15"}</code></pre><h2>5. 分页</h2><pre><code class="language-json">{
  "data": [...],
  "pagination": {
    "page": 2,
    "per_page": 20,
    "total": 150,
    "total_pages": 8
  }
}</code></pre>`
};
window.LEARN_ARTICLES["json-in-databases"] = {
en: `<h2>JSON in Databases</h2><h2>PostgreSQL JSONB</h2><pre><code class="language-sql">-- Create table with JSONB column
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT,
  metadata JSONB
);

-- Insert
INSERT INTO products (name, metadata)
VALUES ('Widget', '{"color":"red","tags":["sale","new"]}');

-- Query JSON field
SELECT name, metadata->>'color' as color
FROM products
WHERE metadata->>'color' = 'red';

-- GIN index for fast JSON search
CREATE INDEX idx_metadata ON products USING GIN (metadata);

-- Contains operator
SELECT * FROM products
WHERE metadata @> '{"tags":["sale"]}';</code></pre><h2>MySQL JSON</h2><pre><code class="language-sql">CREATE TABLE users (
  id INT PRIMARY KEY,
  profile JSON
);

SELECT JSON_EXTRACT(profile, '$.name') as name
FROM users;

-- Shorthand
SELECT profile->>'$.name' as name FROM users;</code></pre><h2>MongoDB</h2><pre><code class="language-javascript">// MongoDB stores BSON (Binary JSON)
db.users.insertOne({
  name: "Alice",
  email: "alice@example.com",
  tags: ["admin", "editor"]
});

db.users.find({ tags: "admin" });
db.users.find({ "address.city": "New York" }); // nested field</code></pre><h2>Redis</h2><pre><code class="language-bash"># RedisJSON module
JSON.SET user:1 $ '{"name":"Alice","age":30}'
JSON.GET user:1 $.name
JSON.SET user:1 $.age 31</code></pre>`,
zh: `<h2>数据库中的 JSON</h2><h2>PostgreSQL JSONB</h2><pre><code class="language-sql">-- 创建含 JSONB 列的表
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT,
  metadata JSONB
);

-- 插入
INSERT INTO products (name, metadata)
VALUES ('小部件', '{"color":"red","tags":["sale","new"]}');

-- 查询 JSON 字段
SELECT name, metadata->>'color' as color
FROM products
WHERE metadata->>'color' = 'red';

-- GIN 索引加速 JSON 搜索
CREATE INDEX idx_metadata ON products USING GIN (metadata);

-- 包含运算符
SELECT * FROM products
WHERE metadata @> '{"tags":["sale"]}';</code></pre><h2>MongoDB</h2><pre><code class="language-javascript">// MongoDB 存储 BSON（二进制 JSON）
db.users.insertOne({
  name: "Alice",
  email: "alice@example.com",
  tags: ["admin", "editor"]
});

db.users.find({ tags: "admin" });
db.users.find({ "address.city": "北京" }); // 嵌套字段</code></pre><h2>Redis JSON</h2><pre><code class="language-bash"># RedisJSON 模块
JSON.SET user:1 $ '{"name":"Alice","age":30}'
JSON.GET user:1 $.name
JSON.SET user:1 $.age 31</code></pre>`
};
window.LEARN_ARTICLES["json-streaming"] = {
en: `<h2>Streaming JSON Processing</h2><p>For files larger than 100MB, loading the entire JSON into memory is not practical. Streaming parsers process JSON token by token.</p><h2>Node.js: stream-json</h2><pre><code class="language-javascript">import { parser } from 'stream-json';
import { streamArray } from 'stream-json/streamers/StreamArray.js';
import { createReadStream } from 'fs';
import { pipeline } from 'stream/promises';

let count = 0;
await pipeline(
  createReadStream('huge.json'),
  parser(),
  streamArray(),
  async function* (source) {
    for await (const { value } of source) {
      count++;
      // process value without loading everything
    }
  }
);
console.log(\`Processed ${count} records\`);</code></pre><h2>Python: ijson</h2><pre><code class="language-python">import ijson

with open('huge.json', 'rb') as f:
    # Stream array items one at a time
    for item in ijson.items(f, 'users.item'):
        print(item['name'])  # each user dict

# With generator
with open('huge.json', 'rb') as f:
    parser = ijson.parse(f)
    for prefix, event, value in parser:
        if event == 'string' and prefix.endswith('.name'):
            print(value)</code></pre><h2>Go: json.Decoder</h2><pre><code class="language-go">file, _ := os.Open("huge.json")
defer file.Close()

dec := json.NewDecoder(file)
dec.Token() // consume '['

var item map[string]interface{}
for dec.More() {
    dec.Decode(&item)
    fmt.Println(item["id"])
}</code></pre><h2>Performance Tips</h2><ul><li>Use streaming for files over 10MB</li><li>Process one record at a time to keep memory constant</li><li>Use NDJSON (newline-delimited JSON) for large datasets — each line is valid JSON</li></ul>`,
zh: `<h2>流式 JSON 处理</h2><p>对于超过 100MB 的文件，将整个 JSON 加载到内存中并不可行。流式解析器逐 token 处理 JSON。</p><h2>Node.js: stream-json</h2><pre><code class="language-javascript">import { parser } from 'stream-json';
import { streamArray } from 'stream-json/streamers/StreamArray.js';
import { createReadStream } from 'fs';

let count = 0;
createReadStream('huge.json')
  .pipe(parser())
  .pipe(streamArray())
  .on('data', ({ value }) => {
    count++;
    // 处理 value，无需加载全部数据
  })
  .on('end', () => console.log(\`已处理 ${count} 条记录\`));</code></pre><h2>Python: ijson</h2><pre><code class="language-python">import ijson

with open('huge.json', 'rb') as f:
    # 逐条流式读取数组项
    for item in ijson.items(f, 'users.item'):
        print(item['name'])</code></pre><h2>Go: json.Decoder for Streams</h2><pre><code class="language-go">file, _ := os.Open("huge.json")
defer file.Close()

dec := json.NewDecoder(file)
dec.Token() // consume '['

var item Record
for dec.More() {
    dec.Decode(&item)
    processRecord(item)
}</code></pre><h2>性能建议</h2><ul><li>超过 10MB 的文件使用流式处理</li><li>每次处理一条记录以保持内存恒定</li><li>对大型数据集使用 NDJSON（换行符分隔的 JSON）——每行都是有效 JSON</li></ul>`
};

// ── json-web-tokens-jwt ───────────────────────────────────────────────────────
window.LEARN_ARTICLES["json-web-tokens-jwt"] = {
en: `<h2>JWT Deep Dive: How It Works & Best Practices</h2>
<h2>JWT Structure</h2>
<p>A JWT is three Base64URL-encoded parts separated by dots: <code>header.payload.signature</code></p>
<pre><code class="language-json">// Header
{ "alg": "HS256", "typ": "JWT" }

// Payload
{
  "sub": "user123",
  "name": "Alice",
  "iat": 1710000000,
  "exp": 1710086400
}

// Signature
HMACSHA256(base64url(header) + "." + base64url(payload), secret)</code></pre>
<h2>Creating & Verifying (Node.js)</h2>
<pre><code class="language-javascript">import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;

// Sign
const token = jwt.sign(
  { sub: 'user123', name: 'Alice', role: 'admin' },
  SECRET,
  { expiresIn: '1d', algorithm: 'HS256' }
);

// Verify
try {
  const payload = jwt.verify(token, SECRET);
  console.log(payload.sub); // 'user123'
} catch (err) {
  // TokenExpiredError, JsonWebTokenError, etc.
  console.error('Invalid token:', err.message);
}</code></pre>
<h2>Common Vulnerabilities</h2>
<table style="width:100%;border-collapse:collapse;font-size:14px">
<tr style="background:#f1f5f9"><th style="padding:8px;border:1px solid #e2e8f0">Vulnerability</th><th style="padding:8px;border:1px solid #e2e8f0">Description</th><th style="padding:8px;border:1px solid #e2e8f0">Fix</th></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0">alg:none</td><td style="padding:8px;border:1px solid #e2e8f0">Unsigned token accepted</td><td style="padding:8px;border:1px solid #e2e8f0">Whitelist allowed algorithms</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0">Key confusion</td><td style="padding:8px;border:1px solid #e2e8f0">RS256 switched to HS256</td><td style="padding:8px;border:1px solid #e2e8f0">Explicitly check alg in header</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0">Weak secret</td><td style="padding:8px;border:1px solid #e2e8f0">Brute-forceable HMAC key</td><td style="padding:8px;border:1px solid #e2e8f0">Use ≥256-bit random secret</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0">No expiry</td><td style="padding:8px;border:1px solid #e2e8f0">Tokens valid forever</td><td style="padding:8px;border:1px solid #e2e8f0">Always set exp claim</td></tr>
</table>
<h2>Best Practices</h2>
<ul>
  <li>Store JWTs in <code>httpOnly</code> cookies, not localStorage</li>
  <li>Use short expiry (15 min) + refresh token rotation</li>
  <li>Prefer RS256/ES256 for distributed systems</li>
  <li>Keep payload minimal — JWTs are visible to the client</li>
</ul>
<p>Decode JWTs instantly with our <a href="/json/jwt">JWT Decoder tool</a>.</p>`,
zh: `<h2>JWT 深入：原理与最佳实践</h2>
<h2>JWT 结构</h2>
<p>JWT 是由点分隔的三个 Base64URL 编码部分：<code>header.payload.signature</code></p>
<pre><code class="language-json">// Header（头部）
{ "alg": "HS256", "typ": "JWT" }

// Payload（载荷）
{
  "sub": "user123",
  "name": "Alice",
  "iat": 1710000000,
  "exp": 1710086400
}

// Signature（签名）
HMACSHA256(base64url(header) + "." + base64url(payload), secret)</code></pre>
<h2>创建与验证（Node.js）</h2>
<pre><code class="language-javascript">import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;

// 签名
const token = jwt.sign(
  { sub: 'user123', name: 'Alice', role: 'admin' },
  SECRET,
  { expiresIn: '1d', algorithm: 'HS256' }
);

// 验证
try {
  const payload = jwt.verify(token, SECRET);
  console.log(payload.sub); // 'user123'
} catch (err) {
  console.error('无效令牌:', err.message);
}</code></pre>
<h2>常见漏洞</h2>
<table style="width:100%;border-collapse:collapse;font-size:14px">
<tr style="background:#f1f5f9"><th style="padding:8px;border:1px solid #e2e8f0">漏洞</th><th style="padding:8px;border:1px solid #e2e8f0">描述</th><th style="padding:8px;border:1px solid #e2e8f0">修复</th></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0">alg:none</td><td style="padding:8px;border:1px solid #e2e8f0">接受未签名令牌</td><td style="padding:8px;border:1px solid #e2e8f0">白名单允许的算法</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0">密钥混淆</td><td style="padding:8px;border:1px solid #e2e8f0">RS256 切换到 HS256</td><td style="padding:8px;border:1px solid #e2e8f0">明确检查头部 alg</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0">弱密钥</td><td style="padding:8px;border:1px solid #e2e8f0">HMAC 密钥可被暴力破解</td><td style="padding:8px;border:1px solid #e2e8f0">使用 ≥256 位随机密钥</td></tr>
</table>
<h2>最佳实践</h2>
<ul>
  <li>将 JWT 存储在 <code>httpOnly</code> cookie 中，而非 localStorage</li>
  <li>使用短有效期（15 分钟）+ 刷新令牌轮换</li>
  <li>分布式系统优先使用 RS256/ES256</li>
  <li>保持载荷精简——JWT 对客户端可见</li>
</ul>
<p>使用我们的 <a href="/json/jwt">JWT 解码器工具</a>即时解码 JWT。</p>`
};

// ── json-performance-optimization ────────────────────────────────────────────
window.LEARN_ARTICLES["json-performance-optimization"] =
window.LEARN_ARTICLES["json-streaming"] = {
en: `<h2>JSON Performance: Parsing, Streaming & Large Files</h2>
<h2>Benchmark: JSON Parsers (Node.js)</h2>
<table style="width:100%;border-collapse:collapse;font-size:14px">
<tr style="background:#f1f5f9"><th style="padding:8px;border:1px solid #e2e8f0">Library</th><th style="padding:8px;border:1px solid #e2e8f0">Parse 10MB</th><th style="padding:8px;border:1px solid #e2e8f0">Notes</th></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0">JSON.parse (native)</td><td style="padding:8px;border:1px solid #e2e8f0">~50ms</td><td style="padding:8px;border:1px solid #e2e8f0">V8 optimized</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0">simdjson (C++ binding)</td><td style="padding:8px;border:1px solid #e2e8f0">~8ms</td><td style="padding:8px;border:1px solid #e2e8f0">SIMD instructions</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0">stream-json</td><td style="padding:8px;border:1px solid #e2e8f0">constant memory</td><td style="padding:8px;border:1px solid #e2e8f0">For very large files</td></tr>
</table>
<h2>Streaming Large Files (Node.js)</h2>
<pre><code class="language-javascript">import { parser } from 'stream-json';
import { streamArray } from 'stream-json/streamers/StreamArray.js';
import { createReadStream } from 'fs';

let count = 0;
createReadStream('huge.json')
  .pipe(parser())
  .pipe(streamArray())
  .on('data', ({ value }) => {
    count++;
    processRecord(value); // handles one record at a time
  })
  .on('end', () => console.log(\`Processed \${count} records\`));</code></pre>
<h2>Streaming in Python (ijson)</h2>
<pre><code class="language-python">import ijson

with open('huge.json', 'rb') as f:
    for item in ijson.items(f, 'users.item'):
        process_record(item)  # one user at a time</code></pre>
<h2>Go: json.Decoder for Streams</h2>
<pre><code class="language-go">file, _ := os.Open("huge.json")
defer file.Close()

dec := json.NewDecoder(file)
dec.Token() // consume '['

var item Record
for dec.More() {
    dec.Decode(&item)
    processRecord(item)
}</code></pre>
<h2>Performance Tips</h2>
<ul>
  <li>Use streaming for files over 10MB to keep memory constant</li>
  <li>Use NDJSON (newline-delimited JSON) for large datasets — each line is valid JSON</li>
  <li>Minify JSON in transit (gzip handles repetition well)</li>
  <li>Use integer IDs instead of string UUIDs where possible</li>
  <li>Profile before optimizing — <code>JSON.parse</code> is already very fast for &lt;1MB</li>
</ul>`,
zh: `<h2>JSON 性能：解析、流式与大文件</h2>
<h2>JSON 解析器基准测试（Node.js）</h2>
<table style="width:100%;border-collapse:collapse;font-size:14px">
<tr style="background:#f1f5f9"><th style="padding:8px;border:1px solid #e2e8f0">库</th><th style="padding:8px;border:1px solid #e2e8f0">解析 10MB</th><th style="padding:8px;border:1px solid #e2e8f0">备注</th></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0">JSON.parse（原生）</td><td style="padding:8px;border:1px solid #e2e8f0">约 50ms</td><td style="padding:8px;border:1px solid #e2e8f0">V8 优化</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0">simdjson（C++ 绑定）</td><td style="padding:8px;border:1px solid #e2e8f0">约 8ms</td><td style="padding:8px;border:1px solid #e2e8f0">SIMD 指令</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0">stream-json</td><td style="padding:8px;border:1px solid #e2e8f0">内存恒定</td><td style="padding:8px;border:1px solid #e2e8f0">适用于超大文件</td></tr>
</table>
<h2>Node.js 流式处理大文件</h2>
<pre><code class="language-javascript">import { parser } from 'stream-json';
import { streamArray } from 'stream-json/streamers/StreamArray.js';
import { createReadStream } from 'fs';

createReadStream('huge.json')
  .pipe(parser())
  .pipe(streamArray())
  .on('data', ({ value }) => processRecord(value))
  .on('end', () => console.log('完成'));</code></pre>
<h2>Python 流式处理（ijson）</h2>
<pre><code class="language-python">import ijson

with open('huge.json', 'rb') as f:
    for item in ijson.items(f, 'users.item'):
        process_record(item)</code></pre>
<h2>性能建议</h2>
<ul>
  <li>超过 10MB 的文件使用流式处理以保持内存恒定</li>
  <li>大型数据集使用 NDJSON（换行符分隔的 JSON）</li>
  <li>传输时压缩 JSON（gzip 对重复内容效果很好）</li>
  <li>优化前先性能分析——<code>JSON.parse</code> 对 1MB 以下文件已经很快</li>
</ul>`
};

// ── json-compression ──────────────────────────────────────────────────────────
window.LEARN_ARTICLES["json-compression"] = {
en: `<h2>JSON Compression: gzip, Brotli & Binary Formats</h2>
<h2>HTTP Compression (gzip / Brotli)</h2>
<p>The easiest win: enable gzip or Brotli on your server. JSON compresses very well (typically 70–90% reduction) due to repetitive keys.</p>
<pre><code class="language-nginx"># Nginx gzip config
gzip on;
gzip_types application/json text/plain text/css;
gzip_min_length 1000;
gzip_comp_level 6;</code></pre>
<pre><code class="language-javascript">// Node.js Express: gzip + Brotli
import compression from 'compression';
app.use(compression()); // auto-negotiates gzip/deflate

// Brotli (better compression, slower)
import shrinkRay from 'shrink-ray-current';
app.use(shrinkRay());</code></pre>
<h2>Compression Comparison (100KB JSON)</h2>
<table style="width:100%;border-collapse:collapse;font-size:14px">
<tr style="background:#f1f5f9"><th style="padding:8px;border:1px solid #e2e8f0">Method</th><th style="padding:8px;border:1px solid #e2e8f0">Size</th><th style="padding:8px;border:1px solid #e2e8f0">Reduction</th></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0">Raw JSON</td><td style="padding:8px;border:1px solid #e2e8f0">100 KB</td><td style="padding:8px;border:1px solid #e2e8f0">—</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0">Minified JSON</td><td style="padding:8px;border:1px solid #e2e8f0">85 KB</td><td style="padding:8px;border:1px solid #e2e8f0">15%</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0">JSON + gzip</td><td style="padding:8px;border:1px solid #e2e8f0">22 KB</td><td style="padding:8px;border:1px solid #e2e8f0">78%</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0">JSON + Brotli</td><td style="padding:8px;border:1px solid #e2e8f0">17 KB</td><td style="padding:8px;border:1px solid #e2e8f0">83%</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0">MessagePack</td><td style="padding:8px;border:1px solid #e2e8f0">75 KB</td><td style="padding:8px;border:1px solid #e2e8f0">25%</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0">MessagePack + gzip</td><td style="padding:8px;border:1px solid #e2e8f0">19 KB</td><td style="padding:8px;border:1px solid #e2e8f0">81%</td></tr>
</table>
<h2>MessagePack — Binary JSON</h2>
<pre><code class="language-javascript">import { encode, decode } from '@msgpack/msgpack';

const data = { id: 1, name: 'Alice', tags: ['admin'] };
const encoded = encode(data);     // Uint8Array, ~30% smaller than JSON
const decoded = decode(encoded);  // back to object</code></pre>
<h2>Field Name Optimization</h2>
<p>For large arrays with repetitive keys, short field names reduce payload significantly:</p>
<pre><code class="language-javascript">// Before: 500KB JSON with 10k records
{ "firstName": "Alice", "lastName": "Smith", "emailAddress": "..." }

// After: rename fields in API (or use a mapping layer)
{ "fn": "Alice", "ln": "Smith", "em": "..." }</code></pre>
<p>Minify your JSON with our <a href="/json/minify">JSON Minifier</a>.</p>`,
zh: `<h2>JSON 压缩：gzip、Brotli 与二进制格式</h2>
<h2>HTTP 压缩（gzip / Brotli）</h2>
<p>最简单的优化：在服务器上启用 gzip 或 Brotli。JSON 由于键名重复，压缩效果很好（通常减少 70–90%）。</p>
<pre><code class="language-nginx"># Nginx gzip 配置
gzip on;
gzip_types application/json text/plain;
gzip_comp_level 6;</code></pre>
<h2>压缩对比（100KB JSON）</h2>
<table style="width:100%;border-collapse:collapse;font-size:14px">
<tr style="background:#f1f5f9"><th style="padding:8px;border:1px solid #e2e8f0">方法</th><th style="padding:8px;border:1px solid #e2e8f0">大小</th><th style="padding:8px;border:1px solid #e2e8f0">减少</th></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0">原始 JSON</td><td style="padding:8px;border:1px solid #e2e8f0">100 KB</td><td style="padding:8px;border:1px solid #e2e8f0">—</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0">压缩 JSON</td><td style="padding:8px;border:1px solid #e2e8f0">85 KB</td><td style="padding:8px;border:1px solid #e2e8f0">15%</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0">JSON + gzip</td><td style="padding:8px;border:1px solid #e2e8f0">22 KB</td><td style="padding:8px;border:1px solid #e2e8f0">78%</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0">JSON + Brotli</td><td style="padding:8px;border:1px solid #e2e8f0">17 KB</td><td style="padding:8px;border:1px solid #e2e8f0">83%</td></tr>
<tr><td style="padding:8px;border:1px solid #e2e8f0">MessagePack</td><td style="padding:8px;border:1px solid #e2e8f0">75 KB</td><td style="padding:8px;border:1px solid #e2e8f0">25%</td></tr>
</table>
<h2>MessagePack — 二进制 JSON</h2>
<pre><code class="language-javascript">import { encode, decode } from '@msgpack/msgpack';

const data = { id: 1, name: 'Alice', tags: ['admin'] };
const encoded = encode(data);    // Uint8Array，比 JSON 小约 30%
const decoded = decode(encoded); // 恢复为对象</code></pre>
<p>使用我们的 <a href="/json/minify">JSON 压缩工具</a>压缩你的 JSON。</p>`
};

// ── json-encryption-signing ───────────────────────────────────────────────────
window.LEARN_ARTICLES["json-encryption-signing"] = {
en: `<h2>JSON Encryption & Signing: JWE & JWS</h2>
<h2>JOSE Standards Overview</h2>
<p>The JOSE (JSON Object Signing and Encryption) family of standards defines how to sign and encrypt JSON:</p>
<ul>
  <li><strong>JWS</strong> (RFC 7515) — JSON Web Signature: digitally sign JSON payloads</li>
  <li><strong>JWE</strong> (RFC 7516) — JSON Web Encryption: encrypt JSON payloads</li>
  <li><strong>JWK</strong> (RFC 7517) — JSON Web Key: represent cryptographic keys as JSON</li>
  <li><strong>JWT</strong> (RFC 7519) — JSON Web Token: compact claims representation using JWS or JWE</li>
</ul>
<h2>JWS — Signing JSON Payloads</h2>
<pre><code class="language-javascript">import { SignJWT, importPKCS8, exportSPKI } from 'jose';

// Generate key pair (RS256)
const { privateKey, publicKey } = await jose.generateKeyPair('RS256');

// Sign a payload
const jws = await new SignJWT({ action: 'transfer', amount: 100, to: 'bob' })
  .setProtectedHeader({ alg: 'RS256' })
  .setIssuedAt()
  .setExpirationTime('5m')
  .sign(privateKey);

// Verify
const { payload } = await jose.jwtVerify(jws, publicKey);
console.log(payload.action); // 'transfer'</code></pre>
<h2>JWE — Encrypting JSON Payloads</h2>
<pre><code class="language-javascript">import { CompactEncrypt, compactDecrypt } from 'jose';

// Encrypt
const enc = await new CompactEncrypt(
  new TextEncoder().encode(JSON.stringify({ ssn: '123-45-6789', dob: '1990-01-01' }))
)
  .setProtectedHeader({ alg: 'RSA-OAEP-256', enc: 'A256GCM' })
  .encrypt(publicKey);

// Decrypt (recipient's private key)
const { plaintext } = await compactDecrypt(enc, privateKey);
const data = JSON.parse(new TextDecoder().decode(plaintext));
console.log(data.ssn);</code></pre>
<h2>When to Use</h2>
<ul>
  <li><strong>JWS/JWT:</strong> API authentication, session tokens, inter-service authorization</li>
  <li><strong>JWE:</strong> Transmitting PII (SSN, medical records), client-side encrypted tokens</li>
</ul>`,
zh: `<h2>JSON 加密与签名：JWE 与 JWS</h2>
<h2>JOSE 标准概览</h2>
<p>JOSE（JSON Object Signing and Encryption）系列标准定义了如何签名和加密 JSON：</p>
<ul>
  <li><strong>JWS</strong>（RFC 7515）— JSON Web 签名：对 JSON 载荷进行数字签名</li>
  <li><strong>JWE</strong>（RFC 7516）— JSON Web 加密：加密 JSON 载荷</li>
  <li><strong>JWK</strong>（RFC 7517）— JSON Web 密钥：将加密密钥表示为 JSON</li>
  <li><strong>JWT</strong>（RFC 7519）— JSON Web 令牌：使用 JWS 或 JWE 的紧凑声明表示</li>
</ul>
<h2>JWS — 签名 JSON 载荷</h2>
<pre><code class="language-javascript">import { SignJWT, jwtVerify, generateKeyPair } from 'jose';

const { privateKey, publicKey } = await generateKeyPair('RS256');

// 签名
const jws = await new SignJWT({ action: 'transfer', amount: 100 })
  .setProtectedHeader({ alg: 'RS256' })
  .setExpirationTime('5m')
  .sign(privateKey);

// 验证
const { payload } = await jwtVerify(jws, publicKey);</code></pre>
<h2>JWE — 加密 JSON 载荷</h2>
<pre><code class="language-javascript">import { CompactEncrypt, compactDecrypt } from 'jose';

// 加密
const enc = await new CompactEncrypt(
  new TextEncoder().encode(JSON.stringify({ ssn: '123-45-6789' }))
)
  .setProtectedHeader({ alg: 'RSA-OAEP-256', enc: 'A256GCM' })
  .encrypt(publicKey);

// 解密
const { plaintext } = await compactDecrypt(enc, privateKey);
const data = JSON.parse(new TextDecoder().decode(plaintext));</code></pre>`
};

// ── json-graphql ──────────────────────────────────────────────────────────────
window.LEARN_ARTICLES["json-graphql"] = {
en: `<h2>JSON & GraphQL: Modern API Data Exchange</h2>
<h2>GraphQL Uses JSON for Everything</h2>
<p>All GraphQL requests and responses are JSON. Queries are sent as JSON POST bodies; responses are always JSON objects with <code>data</code> and optional <code>errors</code> keys.</p>
<pre><code class="language-json">// GraphQL request (HTTP POST /graphql)
{
  "query": "query GetUser($id: ID!) { user(id: $id) { name email } }",
  "variables": { "id": "123" },
  "operationName": "GetUser"
}

// GraphQL response
{
  "data": {
    "user": { "name": "Alice", "email": "alice@example.com" }
  }
}</code></pre>
<h2>Error Handling</h2>
<pre><code class="language-json">{
  "data": null,
  "errors": [
    {
      "message": "User not found",
      "locations": [{ "line": 3, "column": 5 }],
      "path": ["user"],
      "extensions": { "code": "NOT_FOUND", "httpStatus": 404 }
    }
  ]
}</code></pre>
<h2>JavaScript Client</h2>
<pre><code class="language-javascript">// Simple fetch-based GraphQL client
async function gql(query, variables = {}) {
  const res = await fetch('/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables })
  });
  const { data, errors } = await res.json();
  if (errors?.length) throw new Error(errors[0].message);
  return data;
}

const { user } = await gql(
  'query { user(id: "123") { name email } }'
);</code></pre>
<h2>Persisted Queries</h2>
<pre><code class="language-json">// Send hash instead of full query text (saves bandwidth)
{
  "extensions": {
    "persistedQuery": {
      "version": 1,
      "sha256Hash": "ecf4edb46db40b5132295c0291d62fb65d6759a9aeace87c6e1598ed45571f0e"
    }
  },
  "variables": { "id": "123" }
}</code></pre>`,
zh: `<h2>JSON 与 GraphQL 数据交换</h2>
<h2>GraphQL 全程使用 JSON</h2>
<p>所有 GraphQL 请求和响应都是 JSON。查询作为 JSON POST 体发送；响应始终是带有 <code>data</code> 和可选 <code>errors</code> 键的 JSON 对象。</p>
<pre><code class="language-json">// GraphQL 请求（HTTP POST /graphql）
{
  "query": "query GetUser($id: ID!) { user(id: $id) { name email } }",
  "variables": { "id": "123" },
  "operationName": "GetUser"
}

// GraphQL 响应
{
  "data": {
    "user": { "name": "Alice", "email": "alice@example.com" }
  }
}</code></pre>
<h2>错误处理</h2>
<pre><code class="language-json">{
  "data": null,
  "errors": [
    {
      "message": "用户未找到",
      "path": ["user"],
      "extensions": { "code": "NOT_FOUND", "httpStatus": 404 }
    }
  ]
}</code></pre>
<h2>JavaScript 客户端</h2>
<pre><code class="language-javascript">async function gql(query, variables = {}) {
  const res = await fetch('/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables })
  });
  const { data, errors } = await res.json();
  if (errors?.length) throw new Error(errors[0].message);
  return data;
}</code></pre>`
};

// ── json-configuration-files ──────────────────────────────────────────────────
window.LEARN_ARTICLES["json-configuration-files"] = {
en: `<h2>JSON Config Files: package.json, tsconfig & More</h2>
<h2>package.json — The Node.js Manifest</h2>
<pre><code class="language-json">{
  "name": "my-app",
  "version": "1.0.0",
  "description": "My Node.js app",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "test":  "jest"
  },
  "dependencies": {
    "express": "^4.18.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/express": "^4.17.0"
  },
  "engines": { "node": ">=18.0.0" }
}</code></pre>
<h2>tsconfig.json — TypeScript Compiler</h2>
<pre><code class="language-jsonc">{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "sourceMap": true,
    "lib": ["ES2022"],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}</code></pre>
<h2>ESLint (.eslintrc.json)</h2>
<pre><code class="language-json">{
  "env": { "browser": true, "node": true, "es2022": true },
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  "parser": "@typescript-eslint/parser",
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/no-explicit-any": "error"
  }
}</code></pre>
<h2>Common Gotchas</h2>
<ul>
  <li><code>package.json</code> scripts run in the project root — use relative paths</li>
  <li><code>tsconfig.json</code> supports JSONC (comments) — strip with <code>tsc --noEmit</code></li>
  <li>Version ranges: <code>^1.0.0</code> allows minor updates, <code>~1.0.0</code> patch-only</li>
</ul>`,
zh: `<h2>JSON 配置文件实战</h2>
<h2>package.json — Node.js 清单文件</h2>
<pre><code class="language-json">{
  "name": "my-app",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "test":  "jest"
  },
  "dependencies": {
    "express": "^4.18.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0"
  }
}</code></pre>
<h2>tsconfig.json — TypeScript 编译器</h2>
<pre><code class="language-jsonc">{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "strict": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}</code></pre>
<h2>常见问题</h2>
<ul>
  <li><code>package.json</code> 脚本在项目根目录运行——使用相对路径</li>
  <li><code>tsconfig.json</code> 支持 JSONC（注释）</li>
  <li>版本范围：<code>^1.0.0</code> 允许次版本更新，<code>~1.0.0</code> 仅补丁</li>
</ul>`
};

// ── json-web-scraping-pipelines ───────────────────────────────────────────────
window.LEARN_ARTICLES["json-web-scraping-pipelines"] = {
en: `<h2>JSON in Web Scraping & Data Pipelines</h2>
<h2>Extract JSON from Web Pages</h2>
<pre><code class="language-javascript">// Many sites embed JSON in <script type="application/json"> or window.__NEXT_DATA__
import * as cheerio from 'cheerio';
import axios from 'axios';

const { data: html } = await axios.get('https://example.com/products');
const $ = cheerio.load(html);

// Extract JSON-LD structured data
const jsonLd = $('script[type="application/ld+json"]').text();
const product = JSON.parse(jsonLd);

// Extract Next.js page data
const nextData = JSON.parse($('#__NEXT_DATA__').text());
const products = nextData.props.pageProps.products;</code></pre>
<h2>Build an ETL Pipeline</h2>
<pre><code class="language-python">import httpx
import json
from pathlib import Path

# Extract
async def fetch_data(url):
    async with httpx.AsyncClient() as client:
        resp = await client.get(url)
        return resp.json()

# Transform
def transform(records):
    return [
        {
            "id": r["id"],
            "name": r["name"].strip(),
            "price_usd": round(r["price"] / 100, 2),
            "in_stock": r["inventory"] > 0
        }
        for r in records
        if r.get("active")
    ]

# Load
def load(data, path):
    Path(path).write_text(json.dumps(data, indent=2, ensure_ascii=False))</code></pre>
<h2>JSON API Pagination</h2>
<pre><code class="language-javascript">async function fetchAllPages(baseUrl) {
  const results = [];
  let page = 1;
  
  while (true) {
    const res = await fetch(\`\${baseUrl}?page=\${page}&limit=100\`);
    const { data, pagination } = await res.json();
    results.push(...data);
    
    if (page >= pagination.total_pages) break;
    page++;
  }
  
  return results;
}</code></pre>
<h2>NDJSON for Large Datasets</h2>
<pre><code class="language-bash"># Write one JSON object per line (NDJSON)
curl -s https://api.example.com/stream | while IFS= read -r line; do
  echo "$line" | jq '.id, .name'
done</code></pre>`,
zh: `<h2>JSON 在数据管道中的应用</h2>
<h2>从网页提取 JSON</h2>
<pre><code class="language-javascript">// 许多网站在 &lt;script type="application/json"&gt; 或 window.__NEXT_DATA__ 中嵌入 JSON
import * as cheerio from 'cheerio';
import axios from 'axios';

const { data: html } = await axios.get('https://example.com/products');
const $ = cheerio.load(html);

// 提取 JSON-LD 结构化数据
const jsonLd = $('script[type="application/ld+json"]').text();
const product = JSON.parse(jsonLd);

// 提取 Next.js 页面数据
const nextData = JSON.parse($('#__NEXT_DATA__').text());</code></pre>
<h2>构建 ETL 管道（Python）</h2>
<pre><code class="language-python">import httpx, json
from pathlib import Path

async def fetch_data(url):
    async with httpx.AsyncClient() as client:
        return (await client.get(url)).json()

def transform(records):
    return [
        { "id": r["id"], "name": r["name"].strip(),
          "price_usd": round(r["price"] / 100, 2) }
        for r in records if r.get("active")
    ]

def load(data, path):
    Path(path).write_text(json.dumps(data, indent=2, ensure_ascii=False))</code></pre>
<h2>JSON API 分页</h2>
<pre><code class="language-javascript">async function fetchAllPages(baseUrl) {
  const results = [];
  let page = 1;
  while (true) {
    const { data, pagination } = await fetch(\`\${baseUrl}?page=\${page}\`).then(r => r.json());
    results.push(...data);
    if (page >= pagination.total_pages) break;
    page++;
  }
  return results;
}</code></pre>`
};

// ── json-ld-structured-data ───────────────────────────────────────────────────
window.LEARN_ARTICLES["json-ld-structured-data"] = {
en: `<h2>JSON-LD & Structured Data for SEO</h2>
<h2>What is JSON-LD?</h2>
<p>JSON-LD (JSON for Linked Data) is a method of encoding Linked Data using JSON. Google and other search engines use it to understand your content and display rich results (star ratings, FAQs, breadcrumbs, etc.).</p>
<h2>Article Schema</h2>
<pre><code class="language-html">&lt;script type="application/ld+json"&gt;
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "JSON Tutorial for Beginners",
  "description": "Learn JSON from scratch with examples",
  "author": {
    "@type": "Person",
    "name": "Alice Smith"
  },
  "datePublished": "2026-03-15",
  "dateModified": "2026-03-15",
  "image": "https://example.com/img/json-tutorial.jpg",
  "publisher": {
    "@type": "Organization",
    "name": "DevToolBox",
    "logo": { "@type": "ImageObject", "url": "https://example.com/logo.png" }
  }
}
&lt;/script&gt;</code></pre>
<h2>FAQ Schema (Rich Results)</h2>
<pre><code class="language-json">{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is JSON?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "JSON (JavaScript Object Notation) is a lightweight data interchange format."
      }
    },
    {
      "@type": "Question",
      "name": "Is JSON free to use?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, JSON is an open standard with no license restrictions."
      }
    }
  ]
}</code></pre>
<h2>BreadcrumbList</h2>
<pre><code class="language-json">{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://example.com/" },
    { "@type": "ListItem", "position": 2, "name": "Learn JSON", "item": "https://example.com/json/learn" },
    { "@type": "ListItem", "position": 3, "name": "JSON Tutorial", "item": "https://example.com/json/learn/what-is-json" }
  ]
}</code></pre>
<h2>Product Schema</h2>
<pre><code class="language-json">{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "JSON Validator",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "Web",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "1024" }
}</code></pre>
<h2>Validate Your Structured Data</h2>
<ul>
  <li><a href="https://search.google.com/test/rich-results" target="_blank">Google Rich Results Test</a></li>
  <li><a href="https://validator.schema.org/" target="_blank">Schema.org Validator</a></li>
</ul>`,
zh: `<h2>JSON-LD 与 SEO 结构化数据</h2>
<h2>什么是 JSON-LD？</h2>
<p>JSON-LD（JSON for Linked Data）是一种使用 JSON 编码关联数据的方法。Google 和其他搜索引擎用它来理解你的内容并显示富媒体结果（星级评分、FAQ、面包屑等）。</p>
<h2>Article Schema（文章）</h2>
<pre><code class="language-html">&lt;script type="application/ld+json"&gt;
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "JSON 入门教程",
  "description": "从零学习 JSON",
  "author": { "@type": "Person", "name": "Alice Smith" },
  "datePublished": "2026-03-15",
  "dateModified": "2026-03-15"
}
&lt;/script&gt;</code></pre>
<h2>FAQ Schema（常见问题富媒体结果）</h2>
<pre><code class="language-json">{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "什么是 JSON？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "JSON（JavaScript Object Notation）是一种轻量级数据交换格式。"
      }
    }
  ]
}</code></pre>
<h2>BreadcrumbList（面包屑）</h2>
<pre><code class="language-json">{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "首页", "item": "https://example.com/" },
    { "@type": "ListItem", "position": 2, "name": "学习 JSON", "item": "https://example.com/json/learn" }
  ]
}</code></pre>
<h2>验证结构化数据</h2>
<ul>
  <li><a href="https://search.google.com/test/rich-results" target="_blank">Google 富媒体结果测试</a></li>
  <li><a href="https://validator.schema.org/" target="_blank">Schema.org 验证器</a></li>
</ul>`
};
