#!/usr/bin/env python3
"""
Regenerate static/js/learn-articles/security-practical.js
with proper English content for all en: fields.
Run from project root: python3 gen_security_practical.py
"""
import re, os, sys

BASE = os.path.dirname(os.path.abspath(__file__))
TARGET = os.path.join(BASE, "static/js/learn-articles/security-practical.js")

# ---------- English article content for each slug ----------

ARTICLES_EN = {}

ARTICLES_EN["json-security"] = r"""<h1>JSON Security Best Practices</h1>
<h2>Overview</h2>
<p>JSON itself is a pure data format with no executable code. But multiple security risks arise during <strong>parsing, transmission, and use</strong>.</p>
<h2>1. Never Use eval() to Parse JSON</h2>
<pre><code class="language-javascript">// ❌ Extremely dangerous
const data = eval("(" + jsonString + ")");

// ✅ Safe
const data = JSON.parse(jsonString);</code></pre>
<p><code>eval()</code> executes arbitrary JavaScript code. Always use <code>JSON.parse()</code> instead.</p>
<h2>2. XSS Protection</h2>
<pre><code class="language-javascript">// Server-side: escape special chars before embedding in HTML
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
// Limit body size
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
"""

ARTICLES_EN["json-injection"] = r"""<h1>JSON Injection Attacks: Principles &amp; Defense</h1>
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
"""

ARTICLES_EN["json-performance"] = r"""<h1>Large JSON Performance Optimization Guide</h1>
<h2>Why JSON Performance Matters</h2>
<p>In high-concurrency web applications, JSON serialization and deserialization can account for 10–30% of CPU time. The right library and technique choices yield dramatic improvements.</p>
<h2>Strategy 1: Choose a High-Performance Library</h2>
<h3>Python</h3>
<pre><code class="language-python">import orjson  # Rust implementation — fastest Python JSON lib
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
<pre><code class="language-go">decoder := json.NewDecoder(file)
decoder.Token() // Skip opening [
for decoder.More() {
    var item Item
    decoder.Decode(&amp;item)
    process(item)
}</code></pre>
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
"""

ARTICLES_EN["json-streaming"] = r"""<h1>JSON Streaming Parsing Techniques Explained</h1>
<h2>Why Streaming Parsing?</h2>
<p>When JSON files exceed a few hundred megabytes, loading them all at once exhausts memory. Streaming parsers process arbitrarily large JSON with constant memory usage.</p>
<h2>Python — ijson</h2>
<pre><code class="language-python">import ijson

with open("huge.json", "rb") as f:
    for item in ijson.items(f, "items.item"):
        process(item)  # One item at a time, constant memory

# Low-level event parsing
with open("data.json", "rb") as f:
    for prefix, event, value in ijson.parse(f):
        if event == "string":
            print(f"{prefix}: {value}")</code></pre>
<h2>Node.js — stream-json</h2>
<pre><code class="language-javascript">const { parser } = require("stream-json");
const { streamArray } = require("stream-json/streamers/StreamArray");

fs.createReadStream("huge.json")
  .pipe(parser())
  .pipe(streamArray())
  .on("data", ({ key, value }) =&gt; process(value))
  .on("end", () =&gt; console.log("Done"));</code></pre>
<h2>Go</h2>
<pre><code class="language-go">func streamProcessJSON(filename string) error {
    file, _ := os.Open(filename)
    defer file.Close()
    decoder := json.NewDecoder(file)
    decoder.Token() // Skip opening [
    for decoder.More() {
        var item map[string]interface{}
        decoder.Decode(&amp;item)
        processItem(item)
    }
    return nil
}</code></pre>
<h2>Java — Jackson Streaming API</h2>
<pre><code class="language-java">JsonFactory factory = new JsonFactory();
try (JsonParser parser = factory.createParser(new File("huge.json"))) {
    while (parser.nextToken() != JsonToken.START_ARRAY) {}
    while (parser.nextToken() != JsonToken.END_ARRAY) {
        MyObject item = mapper.readValue(parser, MyObject.class);
        processItem(item);
    }
}</code></pre>
<h2>NDJSON (Simplest)</h2>
<pre><code class="language-python">with open("data.ndjson") as f:
    for line in f:
        item = json.loads(line.strip())
        process(item)</code></pre>
<pre><code class="language-javascript">const rl = readline.createInterface({ input: fs.createReadStream("data.ndjson") });
rl.on("line", (line) =&gt; { process(JSON.parse(line)); });</code></pre>
<h2>Memory Comparison</h2>
<table>
<thead><tr><th>Approach</th><th>1GB File Memory</th><th>Notes</th></tr></thead>
<tbody>
<tr><td>Full load (json.load)</td><td>~3-5 GB RAM</td><td>Python multiplies size ~3-5x</td></tr>
<tr><td>Streaming (ijson)</td><td>~10-50 MB</td><td>Only current item in memory</td></tr>
<tr><td>NDJSON line by line</td><td>~1-5 MB</td><td>Simplest, requires NDJSON format</td></tr>
</tbody>
</table>
<h2>Summary</h2>
<ul>
<li>Streaming parsers process GB-scale JSON with constant memory</li>
<li>Python: ijson; Node.js: stream-json; Go: json.Decoder; Java: Jackson Streaming API</li>
<li>NDJSON is the easiest format for streaming — parse each line independently</li>
<li>For maximum simplicity, convert bulk JSON exports to NDJSON format</li>
</ul>
"""

ARTICLES_EN["json-compression"] = r"""<h1>JSON Compression &amp; Transport Optimization</h1>
<h2>Why Optimize JSON Transport?</h2>
<p>JSON is a text format — it can be verbose. For high-traffic APIs, even a 30% size reduction translates to significant cost and latency savings.</p>
<h2>Strategy 1: HTTP Compression (Most Impactful)</h2>
<pre><code class="language-nginx">gzip on;
gzip_types application/json text/plain;
gzip_min_length 1024;
gzip_comp_level 6;

brotli on;  # Better than gzip, ~15-20% smaller
brotli_comp_level 6;
brotli_types application/json;</code></pre>
<pre><code class="language-javascript">// Express.js
const compression = require("compression");
app.use(compression({
  filter: (req, res) =&gt; (res.getHeader("Content-Type")||"").includes("application/json"),
  level: 6,
  threshold: 1024
}));</code></pre>
<h2>Strategy 2: JSON Content Optimization</h2>
<pre><code class="language-javascript">// Minify — remove all whitespace
JSON.stringify(obj)

// Filter null values
JSON.stringify(obj, (k, v) =&gt; v === null ? undefined : v)</code></pre>
<h2>Strategy 3: Binary Alternatives</h2>
<pre><code class="language-javascript">const msgpack = require("@msgpack/msgpack");
const encoded = msgpack.encode(data);  // ~30% smaller than JSON
const decoded = msgpack.decode(encoded);</code></pre>
<pre><code class="language-python">import cbor2  # IETF standard (RFC 7049)
encoded = cbor2.dumps(data)  # ~20-40% smaller
decoded = cbor2.loads(encoded)</code></pre>
<h2>Compression Comparison</h2>
<table>
<thead><tr><th>Format</th><th>Raw Size</th><th>After gzip</th><th>Human-Readable</th></tr></thead>
<tbody>
<tr><td>JSON</td><td>100%</td><td>~25%</td><td>✅</td></tr>
<tr><td>JSON + gzip</td><td>~25%</td><td>n/a</td><td>After decompress</td></tr>
<tr><td>MessagePack</td><td>~70%</td><td>~20%</td><td>❌</td></tr>
<tr><td>Protobuf</td><td>~50%</td><td>~15%</td><td>❌</td></tr>
</tbody>
</table>
<h2>Recommendations</h2>
<table>
<thead><tr><th>Scenario</th><th>Recommendation</th></tr></thead>
<tbody>
<tr><td>Public REST API</td><td>JSON + gzip/Brotli</td></tr>
<tr><td>Internal microservices</td><td>MessagePack or Protobuf</td></tr>
<tr><td>Large data exports</td><td>NDJSON + gzip</td></tr>
<tr><td>Real-time WebSocket</td><td>MessagePack (native binary frames)</td></tr>
</tbody>
</table>
<h2>Summary</h2>
<ul>
<li>HTTP gzip/Brotli compression is the easiest win — typically 60–80% size reduction</li>
<li>Minify JSON responses in production — remove all whitespace</li>
<li>Filter null values and empty containers when possible</li>
<li>For high-frequency internal services, MessagePack offers ~30% size reduction</li>
</ul>
"""

ARTICLES_EN["mongodb-json"] = r"""<h1>MongoDB &amp; JSON: Document Database in Practice</h1>
<h2>BSON vs JSON</h2>
<p>MongoDB stores data internally as BSON (Binary JSON) — a binary extension with additional types:</p>
<table>
<thead><tr><th>BSON Type</th><th>JSON Equivalent</th><th>Notes</th></tr></thead>
<tbody>
<tr><td>ObjectId</td><td>String</td><td>12-byte unique ID</td></tr>
<tr><td>Date</td><td>String (ISO)</td><td>Stored as ms since epoch</td></tr>
<tr><td>Decimal128</td><td>String</td><td>High-precision decimal</td></tr>
<tr><td>Int32 / Int64</td><td>Number</td><td>Explicit integer types</td></tr>
</tbody>
</table>
<h2>CRUD Operations</h2>
<pre><code class="language-javascript">// Insert
const result = await db.collection("users").insertOne({
  name: "Alice", age: 25, email: "alice@example.com",
  tags: ["admin", "editor"], createdAt: new Date()
});

// Query with operators
const users = await db.collection("users")
  .find({ age: { $gte: 18 }, tags: "admin" })
  .sort({ createdAt: -1 }).limit(20).toArray();

// Update
await db.collection("users").updateOne(
  { _id: userId },
  { $set: { name: "Bob" }, $push: { tags: "moderator" } }
);

// Upsert (insert if not exists)
await db.collection("settings").updateOne(
  { userId }, { $set: { theme: "dark" } }, { upsert: true }
);</code></pre>
<h2>Aggregation Pipeline</h2>
<pre><code class="language-javascript">const results = await db.collection("orders").aggregate([
  { $match: { status: "completed", date: { $gte: new Date("2025-01-01") } } },
  { $group: {
    _id: "$userId",
    totalAmount: { $sum: "$amount" },
    orderCount: { $count: {} }
  }},
  { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
  { $unwind: "$user" },
  { $sort: { totalAmount: -1 } },
  { $limit: 10 }
]).toArray();</code></pre>
<h2>Indexing</h2>
<pre><code class="language-javascript">await db.collection("users").createIndex({ email: 1 }, { unique: true });
await db.collection("orders").createIndex({ userId: 1, createdAt: -1 });
// TTL index — auto-delete after 24h
await db.collection("sessions").createIndex(
  { createdAt: 1 }, { expireAfterSeconds: 86400 }
);</code></pre>
<h2>JSON Schema Validation</h2>
<pre><code class="language-javascript">await db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email"],
      properties: {
        name:  { bsonType: "string", minLength: 1, maxLength: 100 },
        email: { bsonType: "string", pattern: "^.+@.+\\..+$" },
        age:   { bsonType: "int", minimum: 0, maximum: 150 }
      }
    }
  },
  validationAction: "error"
});</code></pre>
<h2>Summary</h2>
<ul>
<li>MongoDB uses BSON internally — a superset of JSON with additional types like ObjectId and Date</li>
<li>All CRUD operations use JSON syntax with rich operators like <code>$gte</code>, <code>$set</code>, <code>$push</code></li>
<li>Aggregation pipelines process data through sequential stages: filter, group, join, sort</li>
<li>Indexing is critical for performance — index based on your most frequent query patterns</li>
<li>JSON Schema validation enforces document structure at the database level</li>
</ul>
"""

ARTICLES_EN["postgresql-json"] = r"""<h1>PostgreSQL JSON/JSONB Complete Guide</h1>
<h2>JSON vs JSONB: Always Use JSONB</h2>
<table>
<thead><tr><th>Feature</th><th>JSON</th><th>JSONB</th></tr></thead>
<tbody>
<tr><td>Storage format</td><td>Text (verbatim)</td><td>Binary (parsed)</td></tr>
<tr><td>Write speed</td><td>Faster</td><td>Slightly slower</td></tr>
<tr><td>Read speed</td><td>Slower (re-parses)</td><td>Faster</td></tr>
<tr><td>Index support</td><td>Function indexes only</td><td>GIN / GiST indexes</td></tr>
<tr><td>Operators</td><td>Basic</td><td>Full set</td></tr>
</tbody>
</table>
<h2>Creating Tables with JSONB</h2>
<pre><code class="language-sql">CREATE TABLE products (
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    data JSONB NOT NULL
);

INSERT INTO products (name, data) VALUES (
    'Laptop Pro',
    '{"brand":"TechCo","specs":{"ram":16,"storage":512},"tags":["laptop"],"price":1299.99}'
);</code></pre>
<h2>Querying JSONB</h2>
<pre><code class="language-sql">-- -&gt;  returns JSONB, -&gt;&gt; returns text
SELECT data -&gt; 'specs' FROM products;          -- {"ram":16,"storage":512}
SELECT data -&gt;&gt; 'brand' FROM products;         -- TechCo (text)
SELECT (data -&gt; 'specs' -&gt;&gt; 'ram')::integer;   -- 16 (integer)

-- Containment @&gt;
SELECT * FROM products WHERE data @&gt; '{"tags": ["laptop"]}';
SELECT * FROM products WHERE data @&gt; '{"specs": {"os": "macOS"}}';

-- Key existence
SELECT * FROM products WHERE data ? 'discount_price';
SELECT * FROM products WHERE data ?| ARRAY['discount', 'sale_price'];</code></pre>
<h2>Indexing</h2>
<pre><code class="language-sql">-- GIN index for @&gt; and ? operators
CREATE INDEX idx_products_data ON products USING GIN (data);

-- B-tree index on extracted value for range queries
CREATE INDEX idx_price ON products ((data -&gt;&gt; 'brand'), (data -&gt; 'price')::numeric);</code></pre>
<h2>Updating JSONB</h2>
<pre><code class="language-sql">-- Add a key
UPDATE products SET data = data || '{"discount": 0.1}' WHERE id = 1;

-- Update nested key with jsonb_set
UPDATE products SET data = jsonb_set(data, '{specs, ram}', '32') WHERE id = 1;

-- Remove a key
UPDATE products SET data = data - 'discount' WHERE id = 1;</code></pre>
<h2>Aggregation</h2>
<pre><code class="language-sql">SELECT
    data -&gt;&gt; 'brand' AS brand,
    COUNT(*) AS product_count,
    AVG((data -&gt;&gt; 'price')::numeric) AS avg_price
FROM products
GROUP BY data -&gt;&gt; 'brand'
ORDER BY avg_price DESC;</code></pre>
<h2>Summary</h2>
<ul>
<li>Always use <strong>JSONB</strong> — it's faster for reads and supports GIN indexing</li>
<li>Use <code>-&gt;&gt;</code> for text extraction, <code>-&gt;</code> for JSONB sub-documents</li>
<li>The <code>@&gt;</code> containment operator is the most powerful for flexible queries</li>
<li>Create GIN indexes on JSONB columns for efficient containment queries</li>
<li>Use <code>jsonb_set()</code> for targeted updates without rewriting entire documents</li>
</ul>
"""

ARTICLES_EN["elasticsearch-json"] = r"""<h1>Elasticsearch &amp; JSON: Full-Text Search in Practice</h1>
<h2>Document Model</h2>
<p>Every document in Elasticsearch is a JSON object stored in an index:</p>
<pre><code class="language-json">{
  "_index": "articles",
  "_id": "1",
  "_source": {
    "title": "Getting Started with JSON",
    "content": "JSON is a lightweight data interchange format...",
    "author": "Alice Chen",
    "published_at": "2025-01-15T10:00:00Z",
    "tags": ["json", "tutorial"],
    "rating": 4.8
  }
}</code></pre>
<h2>Index Mapping</h2>
<pre><code class="language-json">PUT /articles
{
  "mappings": {
    "properties": {
      "title":        { "type": "text",    "analyzer": "english" },
      "content":      { "type": "text",    "analyzer": "english" },
      "author":       { "type": "keyword" },
      "published_at": { "type": "date" },
      "tags":         { "type": "keyword" },
      "rating":       { "type": "float" }
    }
  }
}</code></pre>
<h2>Query DSL</h2>
<pre><code class="language-json">GET /articles/_search
{
  "query": {
    "bool": {
      "must":   [{ "match": { "content": "JSON tutorial" } }],
      "should": [{ "term": { "tags": "beginners" } }],
      "filter": [
        { "term": { "author": "Alice Chen" } },
        { "range": { "published_at": { "gte": "2025-01-01" } } },
        { "range": { "rating": { "gte": 4.0 } } }
      ]
    }
  },
  "sort": [{ "rating": "desc" }, { "_score": "desc" }],
  "size": 20
}</code></pre>
<h2>Aggregations</h2>
<pre><code class="language-json">GET /articles/_search
{
  "size": 0,
  "aggs": {
    "by_author": {
      "terms": { "field": "author", "size": 10 },
      "aggs": {
        "avg_rating": { "avg": { "field": "rating" } }
      }
    },
    "over_time": {
      "date_histogram": { "field": "published_at", "calendar_interval": "month" }
    }
  }
}</code></pre>
<h2>Python Client</h2>
<pre><code class="language-python">from elasticsearch import Elasticsearch

es = Elasticsearch(["http://localhost:9200"])

es.index(index="articles", id="1", body={
    "title": "JSON Best Practices", "author": "Alice", "tags": ["json"]
})

response = es.search(index="articles", body={
    "query": { "multi_match": { "query": "JSON performance", "fields": ["title^3","content"] } },
    "highlight": { "fields": { "content": {} } }
})

for hit in response["hits"]["hits"]:
    print(hit["_score"], hit["_source"]["title"])</code></pre>
<h2>Summary</h2>
<ul>
<li>Elasticsearch documents are JSON objects — structure directly determines searchability</li>
<li>Mappings define field types: <code>text</code> for full-text, <code>keyword</code> for exact matching</li>
<li>The Query DSL uses JSON to express complex searches with boolean logic and sorting</li>
<li>Aggregations provide analytics similar to SQL <code>GROUP BY</code></li>
<li>Explicit mapping gives better performance and control than dynamic mapping</li>
</ul>
"""

ARTICLES_EN["rest-api-json"] = r"""<h1>JSON Best Practices in RESTful APIs</h1>
<h2>Response Structure Design</h2>
<pre><code class="language-json">// ✅ Success — single resource
HTTP 200 OK
{ "data": { "id": 1, "name": "Alice", "email": "alice@example.com" } }

// ✅ Success — collection with pagination
HTTP 200 OK
{
  "data": [{"id":1,"name":"Alice"},{"id":2,"name":"Bob"}],
  "meta": { "total": 150, "page": 1, "perPage": 20, "totalPages": 8 }
}

// ✅ Error — RFC 7807 Problem Details
HTTP 422 Unprocessable Entity
{
  "type": "https://api.example.com/errors/validation",
  "title": "Validation Error",
  "status": 422,
  "errors": [
    { "field": "email", "code": "INVALID_FORMAT", "message": "Must be a valid email" }
  ]
}</code></pre>
<h2>HTTP Status Codes</h2>
<table>
<thead><tr><th>Status</th><th>Meaning</th><th>Response Body</th></tr></thead>
<tbody>
<tr><td>200 OK</td><td>Success</td><td>Resource data</td></tr>
<tr><td>201 Created</td><td>Resource created</td><td>Created resource</td></tr>
<tr><td>204 No Content</td><td>Success, no body</td><td>Empty (DELETE success)</td></tr>
<tr><td>400 Bad Request</td><td>Invalid syntax</td><td>Error details</td></tr>
<tr><td>401 Unauthorized</td><td>Not authenticated</td><td>Auth error</td></tr>
<tr><td>404 Not Found</td><td>Resource missing</td><td>Error message</td></tr>
<tr><td>422 Unprocessable</td><td>Validation failed</td><td>Field-level errors</td></tr>
<tr><td>429 Too Many Requests</td><td>Rate limited</td><td>Retry-After header</td></tr>
</tbody>
</table>
<h2>Pagination</h2>
<pre><code class="language-json">// Offset pagination: GET /api/users?page=2&amp;perPage=20
{
  "data": [],
  "meta": { "page": 2, "perPage": 20, "total": 850, "totalPages": 43 },
  "links": { "prev": "/api/users?page=1", "next": "/api/users?page=3" }
}

// Cursor pagination: GET /api/feed?after=cursor_abc&amp;limit=20
{ "data": [], "pagination": { "cursor": "cursor_xyz", "hasNextPage": true } }</code></pre>
<h2>Versioning</h2>
<pre><code class="language-bash"># URL versioning (most visible, cache-friendly)
GET /api/v1/users
GET /api/v2/users

# Header versioning
GET /api/users
API-Version: 2025-01-15</code></pre>
<h2>HATEOAS</h2>
<pre><code class="language-json">{
  "data": { "id": 1, "status": "pending", "amount": 99.99 },
  "links": {
    "self": "/api/orders/1",
    "pay":  "/api/orders/1/pay",
    "cancel": "/api/orders/1/cancel"
  }
}</code></pre>
<h2>Summary</h2>
<ul>
<li>Use consistent response envelopes: <code>data</code> for success, <code>errors</code> array for failures</li>
<li>Follow RFC 7807 Problem Details format for error responses</li>
<li>Include pagination metadata and navigation links</li>
<li>Use cursor-based pagination for large, frequently updated datasets</li>
<li>Version your API from day one — URL versioning is simplest to understand</li>
</ul>
"""

ARTICLES_EN["graphql-json"] = r"""<h1>JSON &amp; GraphQL: Modern API Data Interaction</h1>
<h2>GraphQL Uses JSON for Everything</h2>
<p>Unlike REST, GraphQL sends all requests as JSON POST bodies and always returns JSON responses.</p>
<h2>Request Format</h2>
<pre><code class="language-json">POST /graphql
Content-Type: application/json

{
  "query": "query GetUser($id: ID!) { user(id: $id) { id name email posts { title } } }",
  "variables": { "id": "usr_123" },
  "operationName": "GetUser"
}</code></pre>
<h2>Response Formats</h2>
<pre><code class="language-json">// ✅ Success
{ "data": { "user": { "id": "usr_123", "name": "Alice", "email": "alice@example.com" } } }

// ✅ Partial success with errors
{
  "data": { "user": { "id": "usr_123", "name": "Alice", "profilePicture": null } },
  "errors": [{
    "message": "Failed to load profile picture",
    "path": ["user", "profilePicture"],
    "extensions": { "code": "UPSTREAM_SERVICE_ERROR" }
  }]
}

// ✅ Complete error
{
  "data": null,
  "errors": [{ "message": "User not found", "extensions": { "code": "NOT_FOUND" } }]
}</code></pre>
<h2>Mutations</h2>
<pre><code class="language-json">POST /graphql
{
  "query": "mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id name } }",
  "variables": { "input": { "name": "Bob Smith", "email": "bob@example.com" } }
}</code></pre>
<h2>Batch Requests</h2>
<pre><code class="language-json">POST /graphql
[
  { "query": "query { user(id: 1) { name } }" },
  { "query": "query { user(id: 2) { name } }" }
]
// Response: [{"data":{"user":{"name":"Alice"}}},{"data":{"user":{"name":"Bob"}}}]</code></pre>
<h2>Client Usage</h2>
<pre><code class="language-javascript">const response = await fetch('/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: `query GetUser($id: ID!) { user(id: $id) { name email } }`,
    variables: { id: userId }
  })
});
const { data, errors } = await response.json();</code></pre>
<h2>Summary</h2>
<ul>
<li>GraphQL always uses POST with a JSON body containing <code>query</code>, <code>variables</code>, and <code>operationName</code></li>
<li>Responses always return HTTP 200 — errors are in the <code>errors</code> array, not HTTP status</li>
<li>Partial success is possible: <code>data</code> may be partially populated alongside <code>errors</code></li>
<li>Batch requests allow multiple operations in a single HTTP round-trip</li>
</ul>
"""

ARTICLES_EN["json-config"] = r"""<h1>JSON Configuration File Design Patterns</h1>
<h2>package.json — Node.js Project Config</h2>
<pre><code class="language-json">{
  "name": "my-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev":   "vite --host",
    "build": "tsc &amp;&amp; vite build",
    "test":  "vitest run",
    "lint":  "eslint src --ext .ts,.tsx"
  },
  "dependencies":    { "react": "^18.2.0" },
  "devDependencies": { "typescript": "^5.3.0", "vite": "^5.0.0" },
  "engines": { "node": "&gt;=18.0.0" }
}</code></pre>
<h2>tsconfig.json — TypeScript Configuration</h2>
<pre><code class="language-json">{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUnusedLocals": true,
    "jsx": "react-jsx",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}</code></pre>
<h2>.eslintrc.json — ESLint Configuration</h2>
<pre><code class="language-json">{
  "$schema": "https://json.schemastore.org/eslintrc",
  "root": true,
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "@typescript-eslint/no-explicit-any": "error"
  },
  "ignorePatterns": ["dist", "node_modules"]
}</code></pre>
<h2>JSON Schema for Config Validation</h2>
<pre><code class="language-json">{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["app", "database"],
  "properties": {
    "app": {
      "type": "object",
      "required": ["name", "port"],
      "properties": {
        "name": { "type": "string", "minLength": 1 },
        "port": { "type": "integer", "minimum": 1, "maximum": 65535 }
      }
    }
  }
}</code></pre>
<h2>Best Practices</h2>
<table>
<thead><tr><th>Practice</th><th>Reason</th></tr></thead>
<tbody>
<tr><td>Add <code>$schema</code> field</td><td>Enables editor auto-complete and validation</td></tr>
<tr><td>Use env vars for secrets</td><td>Never commit credentials to version control</td></tr>
<tr><td>Validate config at startup</td><td>Fail fast with clear error messages</td></tr>
<tr><td>Use JSONC for user-facing configs</td><td>Allow comments for self-documentation</td></tr>
<tr><td>Provide config.example.json</td><td>Template for new developers</td></tr>
</tbody>
</table>
<h2>Summary</h2>
<ul>
<li>JSON is the dominant format for developer tooling configuration (npm, TypeScript, ESLint)</li>
<li>Add a <code>$schema</code> field to enable IDE validation and auto-complete</li>
<li>Never hard-code secrets in JSON config — use environment variable references</li>
<li>Use JSONC for user-facing configs that benefit from inline documentation</li>
</ul>
"""

ARTICLES_EN["json-ai-llm"] = r"""<h1>JSON &amp; AI/LLM Applications in Practice</h1>
<h2>LLM APIs Are Entirely JSON-Based</h2>
<p>Modern Large Language Model APIs use JSON for all requests and responses. Mastering JSON is essential for building reliable AI applications.</p>
<h2>LLM API Request Format</h2>
<pre><code class="language-json">POST https://api.openai.com/v1/chat/completions
{
  "model": "gpt-4o",
  "messages": [
    { "role": "system", "content": "Respond only in valid JSON." },
    { "role": "user",   "content": "Extract product info from: 'iPhone 15 Pro costs $999'" }
  ],
  "response_format": { "type": "json_object" },
  "temperature": 0.1,
  "max_tokens": 1000
}</code></pre>
<h2>Structured Output with JSON Schema</h2>
<pre><code class="language-python">from pydantic import BaseModel
from openai import OpenAI

class Product(BaseModel):
    name: str
    price: float
    currency: str
    colors: list[str]

client = OpenAI()
completion = client.beta.chat.completions.parse(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Extract: 'iPhone 15 Pro costs $999, titanium black'"}],
    response_format=Product,
)
product = completion.choices[0].message.parsed
print(product.name, product.price)  # iPhone 15 Pro, 999.0</code></pre>
<h2>Function Calling (Tool Use)</h2>
<pre><code class="language-json">POST /v1/chat/completions
{
  "model": "gpt-4o",
  "messages": [{ "role": "user", "content": "What's the weather in Tokyo?" }],
  "tools": [{
    "type": "function",
    "function": {
      "name": "get_weather",
      "description": "Get current weather for a city",
      "parameters": {
        "type": "object",
        "properties": {
          "city": { "type": "string" },
          "unit": { "type": "string", "enum": ["celsius", "fahrenheit"] }
        },
        "required": ["city"]
      }
    }
  }]
}</code></pre>
<p>LLM response includes a structured tool call:</p>
<pre><code class="language-json">{
  "choices": [{ "message": {
    "role": "assistant",
    "tool_calls": [{
      "id": "call_abc123",
      "type": "function",
      "function": { "name": "get_weather", "arguments": "{\"city\":\"Tokyo\",\"unit\":\"celsius\"}" }
    }]
  }}]
}</code></pre>
<h2>Validating LLM JSON Output</h2>
<pre><code class="language-python">import json
from jsonschema import validate, ValidationError

schema = {
    "type": "object",
    "required": ["name", "price"],
    "properties": {
        "name":  {"type": "string", "minLength": 1},
        "price": {"type": "number", "minimum": 0}
    }
}

def parse_llm_json(response_text: str) -> dict | None:
    text = response_text.strip()
    # Strip markdown code blocks if present
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1])
    try:
        data = json.loads(text)
        validate(instance=data, schema=schema)
        return data
    except (json.JSONDecodeError, ValidationError) as e:
        print(f"LLM JSON error: {e}")
        return None</code></pre>
<h2>Training Data (JSONL Format)</h2>
<pre><code class="language-jsonl">{"messages":[{"role":"system","content":"You are a helpful assistant."},{"role":"user","content":"How do I parse JSON in Python?"},{"role":"assistant","content":"Use json.loads(): data = json.loads(json_string)"}]}
{"messages":[{"role":"user","content":"What is JSON?"},{"role":"assistant","content":"JSON (JavaScript Object Notation) is a lightweight data interchange format."}]}</code></pre>
<h2>Summary</h2>
<ul>
<li>JSON is the universal language for LLM API requests and responses</li>
<li>Structured outputs with JSON Schema guarantee valid, parseable responses</li>
<li>Function Calling uses JSON Schema to define available tools</li>
<li>Always validate LLM JSON output with a schema before using in production</li>
<li>Training data uses JSONL format for efficient streaming</li>
<li>Mastering JSON is a foundational skill for building AI-powered applications</li>
</ul>
"""


# ---------- Rewrite logic ----------

def replace_en_content(file_content, slug, en_html):
    """
    Replace the en: `...` block for a given slug.
    Pattern: after zh: `...`, pattern is  en: `...`
    We look for the line: en: `<h1>  (possibly starting right after previous backtick/comma)
    and replace everything up to the closing  `\n};\n
    """
    # Build a regex that finds the en: block for this article
    # The structure is:
    #   window.LEARN_ARTICLES["slug"] = {
    #   zh: `...`,
    #   en: `...`
    #   };
    #
    # We need to match the en: ` ... ` portion inside the specific slug's block.

    # First, find the article block
    slug_marker = f'window.LEARN_ARTICLES["{slug}"]'
    idx = file_content.find(slug_marker)
    if idx == -1:
        print(f"  WARNING: slug '{slug}' not found in file")
        return file_content

    # Find the en: ` start after this position
    en_start_pattern = r'\nen: `'
    en_match = re.search(en_start_pattern, file_content[idx:])
    if not en_match:
        print(f"  WARNING: en: block not found for '{slug}'")
        return file_content

    en_abs_start = idx + en_match.start()

    # Find the closing backtick that ends the en: template literal
    # We need to find the backtick that's followed by optional whitespace and `\n};`
    # Search from after the opening backtick
    content_start = en_abs_start + len('\nen: `')

    # Find the closing ` followed by \n};
    # The template literal ends with `\n};
    closing_pattern = r'`\s*\n\};\s*\n'
    closing_match = re.search(closing_pattern, file_content[content_start:])
    if not closing_match:
        # Try alternative: ` followed by newline and window. or end of string
        closing_pattern2 = r'`\s*\n\};\s*\n'
        # Try simpler: just find next `\n};\n after content_start
        pos = content_start
        while pos < len(file_content):
            bt_pos = file_content.find('`', pos)
            if bt_pos == -1:
                break
            remaining = file_content[bt_pos:]
            if re.match(r'`\s*\n\};\s*\n', remaining):
                closing_match_pos = bt_pos
                break
            pos = bt_pos + 1
        else:
            print(f"  WARNING: closing backtick not found for '{slug}'")
            return file_content
        closing_end = file_content.find('\n', closing_match_pos)
        closing_end = file_content.find('\n', closing_end + 1)  # after }; line
        closing_end += 1  # include the newline
    else:
        closing_match_pos = content_start + closing_match.start()
        closing_end = content_start + closing_match.end()

    # The full en block to replace: from \nen: ` to closing backtick + \n};\n
    old_block = file_content[en_abs_start:closing_end]
    new_block = f'\nen: `{en_html}`\n}};\n'

    new_content = file_content[:en_abs_start] + new_block + file_content[closing_end:]
    print(f"  ✓ Replaced en: block for '{slug}' ({len(old_block)} → {len(new_block)} chars)")
    return new_content


# Read file
with open(TARGET, "r", encoding="utf-8") as f:
    content = f.read()

print(f"Read {TARGET} ({len(content)} chars)")

# Apply replacements for each article
for slug, en_html in ARTICLES_EN.items():
    content = replace_en_content(content, slug, en_html)

# Write file
with open(TARGET, "w", encoding="utf-8") as f:
    f.write(content)

print(f"\nDone! Wrote {TARGET} ({len(content)} chars)")
