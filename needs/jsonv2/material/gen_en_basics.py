#!/usr/bin/env python3
"""Generate English content for all basics articles in basics.js.
Reads the existing basics.js and replaces all `en` properties with real English content.
"""
import re

BASICS_JS = "/Users/pengyachuan/work/go/src/PycMono/github/toolskit/static/js/learn-articles/basics.js"

# English content for each article
EN_CONTENT = {}

EN_CONTENT["json-syntax-rules"] = """<h1>The Definitive Guide to JSON Syntax Rules</h1>
<h2>JSON Syntax Overview</h2>
<p>JSON syntax rules are extremely concise — just a handful of core rules to remember. This article covers every syntax requirement specified in the RFC 8259 standard.</p>
<h2>Core Syntax Rules</h2>
<h3>Rule 1: Data exists as key-value pairs</h3>
<p>Every data item in a JSON object is a key-value pair, separated by a colon <code>:</code>:</p>
<pre><code class="language-json">{
  &#34;key&#34;: &#34;value&#34;
}</code></pre>
<h3>Rule 2: Keys must be double-quoted strings</h3>
<pre><code class="language-json">// ✅ Correct
{ &#34;name&#34;: &#34;Alice&#34; }

// ❌ Wrong: single quotes
{ &#39;name&#39;: &#39;Alice&#39; }

// ❌ Wrong: no quotes
{ name: &#34;Alice&#34; }</code></pre>
<h3>Rule 3: Items are separated by commas</h3>
<pre><code class="language-json">{
  &#34;name&#34;: &#34;Alice&#34;,
  &#34;age&#34;: 25,
  &#34;city&#34;: &#34;Beijing&#34;
}</code></pre>
<h3>Rule 4: No trailing comma after the last item</h3>
<pre><code class="language-json">// ✅ Correct
{ &#34;a&#34;: 1, &#34;b&#34;: 2 }

// ❌ Wrong: trailing comma
{ &#34;a&#34;: 1, &#34;b&#34;: 2, }</code></pre>
<h3>Rule 5: Curly braces for objects, square brackets for arrays</h3>
<pre><code class="language-json">{
  &#34;object&#34;: { &#34;nested&#34;: true },
  &#34;array&#34;: [1, 2, 3]
}</code></pre>
<h2>String Rules</h2>
<p>Strings must be wrapped in <strong>double quotes</strong>. The following characters require escaping:</p>
<table>
<thead><tr><th>Escape Sequence</th><th>Meaning</th></tr></thead>
<tbody>
<tr><td><code>\\&#34;</code></td><td>Double quote</td></tr>
<tr><td><code>\\\\</code></td><td>Backslash</td></tr>
<tr><td><code>\\/</code></td><td>Forward slash (optional)</td></tr>
<tr><td><code>\\b</code></td><td>Backspace</td></tr>
<tr><td><code>\\f</code></td><td>Form feed</td></tr>
<tr><td><code>\\n</code></td><td>Newline</td></tr>
<tr><td><code>\\r</code></td><td>Carriage return</td></tr>
<tr><td><code>\\t</code></td><td>Tab</td></tr>
<tr><td><code>\\uXXXX</code></td><td>Unicode character</td></tr>
</tbody>
</table>
<pre><code class="language-json">{
  &#34;quote&#34;: &#34;He said \\&#34;hello\\&#34;&#34;,
  &#34;path&#34;: &#34;C:\\\\Users\\\\admin&#34;,
  &#34;newline&#34;: &#34;Line 1\\nLine 2&#34;,
  &#34;unicode&#34;: &#34;\\u4F60\\u597D&#34;,
  &#34;emoji&#34;: &#34;\\uD83D\\uDE00&#34;
}</code></pre>
<h2>Number Rules</h2>
<p>JSON numbers follow these rules:</p>
<pre><code class="language-json">{
  &#34;integer&#34;: 42,
  &#34;negative&#34;: -17,
  &#34;float&#34;: 3.14159,
  &#34;exponent&#34;: 2.5e10,
  &#34;negativeExp&#34;: 1.23e-4
}</code></pre>
<p><strong>Forbidden number formats:</strong></p>
<pre><code class="language-json">// ❌ Leading zeros
{ &#34;bad&#34;: 07 }

// ❌ Plus sign
{ &#34;bad&#34;: +3 }

// ❌ Hexadecimal
{ &#34;bad&#34;: 0xFF }

// ❌ NaN and Infinity
{ &#34;bad&#34;: NaN }
{ &#34;bad&#34;: Infinity }

// ❌ Leading decimal point
{ &#34;bad&#34;: .5 }</code></pre>
<h2>Whitespace</h2>
<p>JSON allows whitespace (spaces, tabs, newlines, carriage returns) in these positions:</p>
<ul>
<li>Before and after values</li>
<li>Before and after the name separator (colon)</li>
<li>Before and after the value separator (comma)</li>
<li>Before and after curly and square brackets</li>
</ul>
<pre><code class="language-json">{&#34;compact&#34;:true,&#34;spaces&#34;:false}

{
  &#34;readable&#34; : true ,
  &#34;spaces&#34;   : true
}</code></pre>
<p>These two formats are syntactically identical.</p>
<h2>Encoding Requirements</h2>
<p>Per RFC 8259:</p>
<ul>
<li>JSON text <strong>must</strong> be encoded in UTF-8 (for network transmission)</li>
<li>JSON text <strong>should not</strong> contain a BOM (Byte Order Mark)</li>
<li>JSON text can be any JSON value (not limited to objects or arrays)</li>
</ul>
<pre><code>// ✅ All of these are valid JSON text
&#34;Hello&#34;
42
true
null
[1, 2, 3]
{&#34;key&#34;: &#34;value&#34;}</code></pre>
<h2>Common Syntax Pitfalls</h2>
<h3>Pitfall 1: Single quotes</h3>
<pre><code class="language-json">// ❌ Common mistake from Python developers
{&#39;name&#39;: &#39;Alice&#39;}

// ✅ Correct
{&#34;name&#34;: &#34;Alice&#34;}</code></pre>
<h3>Pitfall 2: Comments</h3>
<pre><code class="language-json">// ❌ JSON does not support comments
{
  // this is a username
  &#34;name&#34;: &#34;Alice&#34;
}</code></pre>
<h3>Pitfall 3: Trailing commas</h3>
<pre><code class="language-json">// ❌ Common mistake from JavaScript developers
{
  &#34;items&#34;: [1, 2, 3,]
}</code></pre>
<h3>Pitfall 4: Unescaped special characters</h3>
<pre><code class="language-json">// ❌ Unescaped newline in string
{
  &#34;text&#34;: &#34;line 1
  line 2&#34;
}

// ✅ Correct
{
  &#34;text&#34;: &#34;line 1\\nline 2&#34;
}</code></pre>
<h2>Recommended Validators</h2>
<ul>
<li><strong>Online</strong>: ToolboxNova JSON Validator</li>
<li><strong>Command line</strong>: <code>python -m json.tool file.json</code></li>
<li><strong>Editor plugin</strong>: VSCode built-in JSON validation</li>
</ul>
<h2>Summary</h2>
<table>
<thead><tr><th>Rule</th><th>Description</th></tr></thead>
<tbody>
<tr><td>Key names</td><td>Must use double quotes</td></tr>
<tr><td>Strings</td><td>Double quotes only</td></tr>
<tr><td>Commas</td><td>Required between items; not after last item</td></tr>
<tr><td>Comments</td><td>Not supported</td></tr>
<tr><td>Encoding</td><td>UTF-8</td></tr>
<tr><td>Numbers</td><td>No leading zeros, hex, NaN, or Infinity</td></tr>
<tr><td>Whitespace</td><td>Free to use between tokens</td></tr>
</tbody>
</table>
<h2>Next Steps</h2>
<p>Continue with <a href="/json/learn/json-data-types">JSON Data Types Explained</a> to learn about each data type in depth.</p>"""

EN_CONTENT["json-data-types"] = """<h1>JSON Data Types Explained in Depth</h1>
<h2>Overview of the 6 JSON Data Types</h2>
<p>JSON supports exactly six data types. Understanding each one is fundamental to working with JSON correctly.</p>
<table>
<thead><tr><th>Type</th><th>Example</th><th>Description</th></tr></thead>
<tbody>
<tr><td>String</td><td><code>&#34;Hello, World!&#34;</code></td><td>Text, always double-quoted</td></tr>
<tr><td>Number</td><td><code>42</code>, <code>3.14</code>, <code>-5</code>, <code>1e10</code></td><td>Integer or floating-point</td></tr>
<tr><td>Boolean</td><td><code>true</code>, <code>false</code></td><td>True or false, lowercase</td></tr>
<tr><td>null</td><td><code>null</code></td><td>Represents "no value"</td></tr>
<tr><td>Object</td><td><code>{&#34;key&#34;: &#34;value&#34;}</code></td><td>Unordered key-value collection</td></tr>
<tr><td>Array</td><td><code>[1, &#34;two&#34;, true]</code></td><td>Ordered list of values</td></tr>
</tbody>
</table>
<h2>1. String</h2>
<p>Strings are sequences of Unicode characters wrapped in double quotes.</p>
<pre><code class="language-json">{
  &#34;name&#34;: &#34;Alice&#34;,
  &#34;email&#34;: &#34;alice@example.com&#34;,
  &#34;greeting&#34;: &#34;Hello, \\&#34;World\\&#34;!&#34;,
  &#34;path&#34;: &#34;C:\\\\Program Files\\\\app&#34;,
  &#34;emoji&#34;: &#34;Hello \\uD83D\\uDE00&#34;
}</code></pre>
<p>Key rules for strings:</p>
<ul>
<li>Must use double quotes (not single quotes)</li>
<li>Special characters must be escaped with a backslash</li>
<li>Control characters (newline, tab) must be escaped</li>
<li>Supports full Unicode via <code>\\uXXXX</code> sequences</li>
</ul>
<h2>2. Number</h2>
<p>JSON numbers can be integers or floating-point values.</p>
<pre><code class="language-json">{
  &#34;integer&#34;: 100,
  &#34;negative&#34;: -25,
  &#34;float&#34;: 3.14159,
  &#34;scientific&#34;: 1.5e-3,
  &#34;large&#34;: 9.007199254740992e15
}</code></pre>
<p>Important restrictions:</p>
<ul>
<li>No leading zeros: <code>07</code> is invalid</li>
<li>No leading plus sign: <code>+3</code> is invalid</li>
<li>No hexadecimal: <code>0xFF</code> is invalid</li>
<li><code>NaN</code> and <code>Infinity</code> are not valid JSON numbers</li>
</ul>
<h2>3. Boolean</h2>
<p>Boolean values are either <code>true</code> or <code>false</code> — always lowercase.</p>
<pre><code class="language-json">{
  &#34;isActive&#34;: true,
  &#34;isDeleted&#34;: false,
  &#34;hasPermission&#34;: true
}</code></pre>
<p>Common mistakes: <code>True</code>, <code>False</code>, <code>TRUE</code>, <code>FALSE</code> are all invalid in JSON (they're Python/other language conventions).</p>
<h2>4. null</h2>
<p><code>null</code> represents the intentional absence of a value. Always lowercase.</p>
<pre><code class="language-json">{
  &#34;name&#34;: &#34;Alice&#34;,
  &#34;middleName&#34;: null,
  &#34;deletedAt&#34;: null,
  &#34;parentId&#34;: null
}</code></pre>
<p>Differences from other "empty" values:</p>
<table>
<thead><tr><th>Value</th><th>Meaning</th></tr></thead>
<tbody>
<tr><td><code>null</code></td><td>Value is explicitly absent</td></tr>
<tr><td><code>&#34;&#34;</code></td><td>Empty string (value exists, is empty)</td></tr>
<tr><td><code>0</code></td><td>Number zero (value exists)</td></tr>
<tr><td><code>false</code></td><td>Boolean false (value exists)</td></tr>
<tr><td><em>key absent</em></td><td>Key doesn't exist in object</td></tr>
</tbody>
</table>
<h2>5. Object</h2>
<p>An object is an unordered collection of key-value pairs.</p>
<pre><code class="language-json">{
  &#34;user&#34;: {
    &#34;id&#34;: 1001,
    &#34;name&#34;: &#34;Alice&#34;,
    &#34;email&#34;: &#34;alice@example.com&#34;,
    &#34;roles&#34;: [&#34;admin&#34;, &#34;editor&#34;],
    &#34;profile&#34;: {
      &#34;avatar&#34;: &#34;https://cdn.example.com/alice.jpg&#34;,
      &#34;bio&#34;: null
    }
  }
}</code></pre>
<p>Object rules:</p>
<ul>
<li>Keys must be unique strings within the same object</li>
<li>Order is not guaranteed (treat as unordered)</li>
<li>Can be nested to any depth</li>
<li>Empty object <code>{}</code> is valid</li>
</ul>
<h2>6. Array</h2>
<p>An array is an ordered list of values of any type.</p>
<pre><code class="language-json">{
  &#34;numbers&#34;: [1, 2, 3, 4, 5],
  &#34;mixed&#34;: [&#34;text&#34;, 42, true, null],
  &#34;matrix&#34;: [[1, 2], [3, 4], [5, 6]],
  &#34;objects&#34;: [
    {&#34;id&#34;: 1, &#34;name&#34;: &#34;Alice&#34;},
    {&#34;id&#34;: 2, &#34;name&#34;: &#34;Bob&#34;}
  ],
  &#34;empty&#34;: []
}</code></pre>
<p>Array rules:</p>
<ul>
<li>Order is preserved</li>
<li>Elements can be of any JSON type (including mixed types)</li>
<li>Duplicate values are allowed</li>
<li>Empty array <code>[]</code> is valid</li>
</ul>
<h2>Type Detection Across Languages</h2>
<table>
<thead><tr><th>JSON Type</th><th>JavaScript</th><th>Python</th><th>Go</th></tr></thead>
<tbody>
<tr><td>string</td><td>string</td><td>str</td><td>string</td></tr>
<tr><td>number</td><td>number</td><td>int/float</td><td>float64/int</td></tr>
<tr><td>boolean</td><td>boolean</td><td>bool</td><td>bool</td></tr>
<tr><td>null</td><td>null</td><td>None</td><td>nil</td></tr>
<tr><td>object</td><td>object</td><td>dict</td><td>map/struct</td></tr>
<tr><td>array</td><td>Array</td><td>list</td><td>slice</td></tr>
</tbody>
</table>
<h2>Summary</h2>
<ul>
<li>JSON has exactly 6 types: string, number, boolean, null, object, array</li>
<li>Strings require double quotes; booleans and null are lowercase</li>
<li>Numbers don't support NaN, Infinity, leading zeros, or hex</li>
<li>Objects are unordered; arrays are ordered</li>
<li>Any type can be used as an array element or object value</li>
</ul>"""

EN_CONTENT["json-objects"] = """<h1>Deep Dive into JSON Objects</h1>
<h2>What is a JSON Object</h2>
<p>A JSON object is an unordered collection of key-value pairs enclosed in curly braces. It's the most commonly used JSON structure and maps directly to a dictionary, map, or hash in most programming languages.</p>
<pre><code class="language-json">{
  &#34;id&#34;: 1,
  &#34;name&#34;: &#34;Alice&#34;,
  &#34;email&#34;: &#34;alice@example.com&#34;,
  &#34;isActive&#34;: true
}</code></pre>
<h2>Object Syntax Rules</h2>
<ul>
<li>Enclosed in curly braces <code>{}</code></li>
<li>Keys must be double-quoted strings</li>
<li>Keys and values separated by a colon <code>:</code></li>
<li>Key-value pairs separated by commas</li>
<li>No trailing comma after the last pair</li>
<li>Keys should be unique within the same object</li>
</ul>
<h2>Nested Objects</h2>
<p>Object values can themselves be objects, enabling complex data modeling:</p>
<pre><code class="language-json">{
  &#34;user&#34;: {
    &#34;id&#34;: 1001,
    &#34;name&#34;: &#34;Alice&#34;,
    &#34;address&#34;: {
      &#34;street&#34;: &#34;123 Main St&#34;,
      &#34;city&#34;: &#34;New York&#34;,
      &#34;country&#34;: &#34;US&#34;,
      &#34;geo&#34;: {
        &#34;lat&#34;: 40.7128,
        &#34;lng&#34;: -74.0060
      }
    }
  }
}</code></pre>
<h2>Objects with Mixed Value Types</h2>
<pre><code class="language-json">{
  &#34;product&#34;: {
    &#34;id&#34;: &#34;SKU-001&#34;,
    &#34;name&#34;: &#34;Wireless Headphones&#34;,
    &#34;price&#34;: 99.99,
    &#34;inStock&#34;: true,
    &#34;rating&#34;: 4.5,
    &#34;tags&#34;: [&#34;electronics&#34;, &#34;audio&#34;],
    &#34;specs&#34;: {
      &#34;weight&#34;: &#34;250g&#34;,
      &#34;battery&#34;: &#34;30h&#34;
    },
    &#34;discount&#34;: null
  }
}</code></pre>
<h2>Accessing Object Properties</h2>
<h3>JavaScript</h3>
<pre><code class="language-javascript">const user = JSON.parse(jsonString);

// Dot notation
console.log(user.name);

// Bracket notation (for dynamic keys)
const key = &#39;email&#39;;
console.log(user[key]);

// Nested access
console.log(user.address?.city);  // Optional chaining

// Destructuring
const { name, email } = user;</code></pre>
<h3>Python</h3>
<pre><code class="language-python">import json
user = json.loads(json_string)

# Direct access
print(user[&#34;name&#34;])

# Safe access with default
print(user.get(&#34;phone&#34;, &#34;N/A&#34;))

# Nested access
print(user[&#34;address&#34;][&#34;city&#34;])</code></pre>
<h2>Iterating Over Objects</h2>
<h3>JavaScript</h3>
<pre><code class="language-javascript">const config = {&#34;host&#34;: &#34;localhost&#34;, &#34;port&#34;: 3000, &#34;debug&#34;: true};

// Keys
Object.keys(config).forEach(key => console.log(key));

// Values
Object.values(config).forEach(val => console.log(val));

// Entries
Object.entries(config).forEach(([key, val]) => {
  console.log(`${key}: ${val}`);
});</code></pre>
<h2>Common Object Patterns</h2>
<h3>Configuration Object</h3>
<pre><code class="language-json">{
  &#34;database&#34;: {
    &#34;host&#34;: &#34;localhost&#34;,
    &#34;port&#34;: 5432,
    &#34;name&#34;: &#34;myapp&#34;,
    &#34;pool&#34;: { &#34;min&#34;: 2, &#34;max&#34;: 10 }
  },
  &#34;cache&#34;: {
    &#34;ttl&#34;: 3600,
    &#34;maxSize&#34;: 1000
  }
}</code></pre>
<h3>API Response Envelope</h3>
<pre><code class="language-json">{
  &#34;success&#34;: true,
  &#34;data&#34;: { &#34;id&#34;: 1, &#34;name&#34;: &#34;Alice&#34; },
  &#34;meta&#34;: { &#34;requestId&#34;: &#34;abc123&#34;, &#34;timestamp&#34;: &#34;2025-01-15T10:00:00Z&#34; }
}</code></pre>
<h2>Object Key Ordering</h2>
<p>The JSON specification does <strong>not</strong> guarantee key ordering. Different parsers may return keys in different orders. If order matters, use an array instead.</p>
<h2>Summary</h2>
<ul>
<li>JSON objects are unordered key-value collections enclosed in <code>{}</code></li>
<li>Keys must be unique, double-quoted strings</li>
<li>Values can be any JSON type, enabling deep nesting</li>
<li>Use dot/bracket notation to access nested properties in code</li>
<li>Don't rely on key ordering</li>
</ul>"""

EN_CONTENT["json-arrays"] = """<h1>The Complete Guide to JSON Arrays</h1>
<h2>What is a JSON Array</h2>
<p>A JSON array is an ordered list of values enclosed in square brackets. Elements can be of any JSON type, and duplicates are allowed.</p>
<pre><code class="language-json">[1, 2, 3, 4, 5]
[&#34;apple&#34;, &#34;banana&#34;, &#34;orange&#34;]
[true, false, null, 42, &#34;text&#34;]</code></pre>
<h2>Array Syntax Rules</h2>
<ul>
<li>Enclosed in square brackets <code>[]</code></li>
<li>Elements separated by commas</li>
<li>No trailing comma after the last element</li>
<li>Order is preserved</li>
<li>Elements can be of mixed types</li>
<li>Empty array <code>[]</code> is valid</li>
</ul>
<h2>Arrays of Objects — The Most Common Pattern</h2>
<p>The most frequent use case: an array of homogeneous objects (records/rows).</p>
<pre><code class="language-json">{
  &#34;users&#34;: [
    {&#34;id&#34;: 1, &#34;name&#34;: &#34;Alice&#34;, &#34;role&#34;: &#34;admin&#34;},
    {&#34;id&#34;: 2, &#34;name&#34;: &#34;Bob&#34;,   &#34;role&#34;: &#34;editor&#34;},
    {&#34;id&#34;: 3, &#34;name&#34;: &#34;Carol&#34;, &#34;role&#34;: &#34;viewer&#34;}
  ]
}</code></pre>
<h2>Nested Arrays (Multidimensional)</h2>
<pre><code class="language-json">{
  &#34;matrix&#34;: [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
  ],
  &#34;coordinates&#34;: [[120.15, 30.28], [116.40, 39.90]]
}</code></pre>
<h2>Mixed-Type Arrays</h2>
<pre><code class="language-json">{
  &#34;mixed&#34;: [&#34;string&#34;, 42, true, null, {&#34;key&#34;: &#34;value&#34;}, [1, 2, 3]]
}</code></pre>
<p>While valid, mixed-type arrays can make code harder to maintain. Prefer homogeneous arrays in production APIs.</p>
<h2>Working with Arrays in Code</h2>
<h3>JavaScript</h3>
<pre><code class="language-javascript">const data = JSON.parse(jsonString);
const users = data.users;

// Access by index
console.log(users[0].name);  // Alice

// Iterate
users.forEach(user => console.log(user.name));

// Filter
const admins = users.filter(u => u.role === &#39;admin&#39;);

// Map
const names = users.map(u => u.name);

// Find
const alice = users.find(u => u.name === &#39;Alice&#39;);</code></pre>
<h3>Python</h3>
<pre><code class="language-python">import json
data = json.loads(json_string)
users = data[&#34;users&#34;]

# Access by index
print(users[0][&#34;name&#34;])  # Alice

# Iterate
for user in users:
    print(user[&#34;name&#34;])

# List comprehension
names = [u[&#34;name&#34;] for u in users]
admins = [u for u in users if u[&#34;role&#34;] == &#34;admin&#34;]</code></pre>
<h2>Array Operations — Building and Modifying</h2>
<pre><code class="language-javascript">// Add to end
users.push({&#34;id&#34;: 4, &#34;name&#34;: &#34;Dave&#34;});

// Add to beginning
users.unshift({&#34;id&#34;: 0, &#34;name&#34;: &#34;Zero&#34;});

// Remove last
users.pop();

// Remove first
users.shift();

// Splice (remove at index)
users.splice(1, 1);

// Concatenate
const allUsers = [...users, ...moreUsers];</code></pre>
<h2>Arrays vs Objects — When to Use Which</h2>
<table>
<thead><tr><th>Use Case</th><th>Recommended</th></tr></thead>
<tbody>
<tr><td>Ordered list of items</td><td>Array</td></tr>
<tr><td>Collection of records</td><td>Array of objects</td></tr>
<tr><td>Named properties</td><td>Object</td></tr>
<tr><td>Key-value lookup</td><td>Object</td></tr>
<tr><td>Maintain insertion order</td><td>Array</td></tr>
</tbody>
</table>
<h2>Summary</h2>
<ul>
<li>Arrays are ordered, comma-separated lists in square brackets <code>[]</code></li>
<li>Elements can be any JSON type, including mixed types</li>
<li>Arrays of objects are the most common real-world pattern</li>
<li>Order is preserved; duplicates are allowed</li>
<li>Use index-based access and iteration methods in code</li>
</ul>"""

EN_CONTENT["json-strings-escaping"] = """<h1>JSON Strings and Escaping: Complete Guide</h1>
<h2>JSON String Basics</h2>
<p>In JSON, a string is a sequence of Unicode characters wrapped in <strong>double quotes</strong>. This is the only way to write a string in JSON — single quotes are not allowed.</p>
<pre><code class="language-json">{
  &#34;valid&#34;: &#34;Hello, World!&#34;,
  &#34;invalid&#34;: &#39;Hello, World!&#39;
}</code></pre>
<h2>All Escape Sequences</h2>
<table>
<thead><tr><th>Escape</th><th>Character</th><th>Use Case</th></tr></thead>
<tbody>
<tr><td><code>\\&#34;</code></td><td><code>&#34;</code> double quote</td><td>Embedding quotes in strings</td></tr>
<tr><td><code>\\\\</code></td><td><code>\\</code> backslash</td><td>File paths (Windows)</td></tr>
<tr><td><code>\\/</code></td><td><code>/</code> forward slash</td><td>Optional — usually not needed</td></tr>
<tr><td><code>\\b</code></td><td>backspace</td><td>Rarely used</td></tr>
<tr><td><code>\\f</code></td><td>form feed</td><td>Rarely used</td></tr>
<tr><td><code>\\n</code></td><td>newline</td><td>Multi-line strings</td></tr>
<tr><td><code>\\r</code></td><td>carriage return</td><td>Windows line endings</td></tr>
<tr><td><code>\\t</code></td><td>tab character</td><td>Indentation in strings</td></tr>
<tr><td><code>\\uXXXX</code></td><td>Unicode codepoint</td><td>Non-ASCII characters</td></tr>
</tbody>
</table>
<h2>Practical Escape Examples</h2>
<pre><code class="language-json">{
  &#34;greeting&#34;:     &#34;He said \\&#34;Hello!\\&#34;&#34;,
  &#34;windowsPath&#34;:  &#34;C:\\\\Users\\\\alice\\\\Documents&#34;,
  &#34;multiline&#34;:    &#34;Line 1\\nLine 2\\nLine 3&#34;,
  &#34;tabbed&#34;:       &#34;Name:\\tAlice&#34;,
  &#34;chinese&#34;:      &#34;\\u4F60\\u597D&#34;,
  &#34;emoji&#34;:        &#34;\\uD83D\\uDE00&#34;,
  &#34;url&#34;:          &#34;https://example.com/path&#34;
}</code></pre>
<h2>Unicode Escaping</h2>
<p>All Unicode characters can be represented as <code>\\uXXXX</code> (4-digit hex). For characters outside the Basic Multilingual Plane (BMP), use surrogate pairs:</p>
<pre><code class="language-json">{
  &#34;chinese_char&#34;: &#34;\\u4E2D\\u6587&#34;,
  &#34;arabic&#34;:       &#34;\\u0645\\u0631\\u062D\\u0628\\u0627&#34;,
  &#34;emoji_heart&#34;:  &#34;\\uD83D\\uDC96&#34;
}</code></pre>
<p>In practice, modern JSON serializers output UTF-8 directly rather than Unicode escapes, which is more readable:</p>
<pre><code class="language-json">{
  &#34;chinese_char&#34;: &#34;中文&#34;,
  &#34;arabic&#34;:       &#34;مرحبا&#34;,
  &#34;emoji_heart&#34;:  &#34;💖&#34;
}</code></pre>
<h2>Common Escaping Mistakes</h2>
<h3>Mistake 1: Forgetting to escape backslashes</h3>
<pre><code class="language-json">// ❌ Windows path — single backslash is invalid
{&#34;path&#34;: &#34;C:\\Users\\alice&#34;}

// ✅ Correct — double backslash
{&#34;path&#34;: &#34;C:\\\\Users\\\\alice&#34;}</code></pre>
<h3>Mistake 2: Raw newlines in strings</h3>
<pre><code class="language-json">// ❌ Invalid — literal newline in string
{&#34;text&#34;: &#34;line1
line2&#34;}

// ✅ Correct
{&#34;text&#34;: &#34;line1\\nline2&#34;}</code></pre>
<h3>Mistake 3: Unescaped double quotes</h3>
<pre><code class="language-json">// ❌ Invalid
{&#34;msg&#34;: &#34;She said &#34;hi&#34;&#34;}

// ✅ Correct
{&#34;msg&#34;: &#34;She said \\&#34;hi\\&#34;&#34;}</code></pre>
<h2>Language-Specific Escaping</h2>
<h3>JavaScript</h3>
<pre><code class="language-javascript">const obj = {
  path: &#34;C:\\\\Users\\\\alice&#34;,
  quote: &#34;He said \\&#34;hello\\&#34;&#34;
};
const json = JSON.stringify(obj);  // auto-escapes correctly</code></pre>
<h3>Python</h3>
<pre><code class="language-python">import json
obj = {&#34;path&#34;: r&#34;C:\Users\alice&#34;, &#34;quote&#34;: &#39;He said &#34;hello&#34;&#39;}
json.dumps(obj)  # auto-escapes backslashes and quotes</code></pre>
<h2>Summary</h2>
<ul>
<li>JSON strings must use double quotes</li>
<li>Backslash is the escape character — <code>\\</code>, <code>\\&#34;</code>, <code>\\n</code>, <code>\\t</code>, <code>\\uXXXX</code></li>
<li>Control characters (newline, tab) must always be escaped</li>
<li>Windows file paths need double backslashes</li>
<li>Unicode characters can be represented directly in UTF-8 or as <code>\\uXXXX</code></li>
</ul>"""

EN_CONTENT["json-numbers-booleans-null"] = """<h1>JSON Numbers, Booleans and Null Explained</h1>
<h2>Numbers in JSON</h2>
<p>JSON uses a single number type to represent all numeric values — both integers and floating-point. There's no distinction between <code>int</code> and <code>float</code> at the JSON level.</p>
<pre><code class="language-json">{
  &#34;integer&#34;: 42,
  &#34;negative&#34;: -17,
  &#34;float&#34;: 3.14159,
  &#34;scientific&#34;: 6.022e23,
  &#34;small&#34;: 1.5e-10,
  &#34;zero&#34;: 0
}</code></pre>
<h3>Valid Number Formats</h3>
<ul>
<li>Integers: <code>0</code>, <code>42</code>, <code>-100</code></li>
<li>Decimals: <code>3.14</code>, <code>-0.5</code></li>
<li>Scientific notation: <code>1e10</code>, <code>2.5e-3</code>, <code>1.23E+4</code></li>
</ul>
<h3>Invalid Number Formats</h3>
<pre><code class="language-json">// ❌ Leading zero (except 0 itself)
07, 00.5

// ❌ Plus sign prefix
+3, +0.5

// ❌ Hexadecimal
0xFF, 0b1010

// ❌ Special values
NaN, Infinity, -Infinity

// ❌ Leading decimal point
.5, .123</code></pre>
<h3>Number Precision Warning</h3>
<p>JSON numbers have no inherent size limit, but parsers may have precision limits. JavaScript's <code>Number</code> type (IEEE 754 double) can only safely represent integers up to 2⁵³ − 1. For large integers (e.g., database IDs), use strings instead:</p>
<pre><code class="language-json">{
  &#34;safeId&#34;: 9007199254740991,
  &#34;unsafeId&#34;: &#34;9007199254740993&#34;
}</code></pre>
<h2>Booleans in JSON</h2>
<p>JSON booleans are <code>true</code> and <code>false</code> — always lowercase.</p>
<pre><code class="language-json">{
  &#34;isLoggedIn&#34;: true,
  &#34;isDeleted&#34;: false,
  &#34;hasPermission&#34;: true,
  &#34;isVerified&#34;: false
}</code></pre>
<h3>Common Boolean Mistakes</h3>
<pre><code class="language-json">// ❌ Wrong — Python/Ruby style
{&#34;active&#34;: True}
{&#34;active&#34;: False}

// ❌ Wrong — uppercase
{&#34;active&#34;: TRUE}

// ✅ Correct
{&#34;active&#34;: true}</code></pre>
<h3>Boolean vs Truthy Strings</h3>
<p>In JSON, boolean <code>true</code> and the string <code>&#34;true&#34;</code> are different types. Be explicit:</p>
<pre><code class="language-json">{
  &#34;booleanTrue&#34;:  true,
  &#34;stringTrue&#34;:   &#34;true&#34;,
  &#34;numberOne&#34;:    1
}</code></pre>
<h2>null in JSON</h2>
<p><code>null</code> represents the intentional absence of any value. Always lowercase.</p>
<pre><code class="language-json">{
  &#34;name&#34;: &#34;Alice&#34;,
  &#34;middleName&#34;: null,
  &#34;lastLoginAt&#34;: null,
  &#34;parentUserId&#34;: null
}</code></pre>
<h3>When to Use null</h3>
<ul>
<li>Optional fields that haven't been set</li>
<li>Values that were explicitly cleared</li>
<li>Foreign keys that reference nothing</li>
<li>API responses where data is unavailable</li>
</ul>
<h3>null vs Missing Key</h3>
<pre><code class="language-json">// Key present with null value — field exists but has no value
{&#34;phone&#34;: null}

// Key absent — field is unknown/undefined
{}</code></pre>
<p>In most languages, accessing a missing key throws an error, while accessing a <code>null</code> value returns <code>null</code>/<code>None</code>/<code>nil</code>.</p>
<h2>Type Comparison Table</h2>
<table>
<thead><tr><th>JSON</th><th>JavaScript</th><th>Python</th><th>Go</th><th>Java</th></tr></thead>
<tbody>
<tr><td><code>true</code></td><td><code>true</code></td><td><code>True</code></td><td><code>true</code></td><td><code>true</code></td></tr>
<tr><td><code>false</code></td><td><code>false</code></td><td><code>False</code></td><td><code>false</code></td><td><code>false</code></td></tr>
<tr><td><code>null</code></td><td><code>null</code></td><td><code>None</code></td><td><code>nil</code></td><td><code>null</code></td></tr>
<tr><td><code>42</code></td><td><code>42</code></td><td><code>42</code></td><td><code>42</code></td><td><code>42</code></td></tr>
<tr><td><code>3.14</code></td><td><code>3.14</code></td><td><code>3.14</code></td><td><code>3.14</code></td><td><code>3.14</code></td></tr>
</tbody>
</table>
<h2>Summary</h2>
<ul>
<li>JSON has one number type covering integers and floats</li>
<li>NaN, Infinity, hexadecimal, and leading zeros are invalid</li>
<li>Use strings for integers exceeding 2⁵³ − 1</li>
<li>Booleans are <code>true</code>/<code>false</code> — always lowercase</li>
<li><code>null</code> represents explicitly absent values — always lowercase</li>
</ul>"""

EN_CONTENT["json-nesting"] = """<h1>JSON Nesting and Complex Data Modeling</h1>
<h2>Why Nesting Matters</h2>
<p>JSON's ability to nest objects and arrays within each other enables you to represent complex, hierarchical data structures in a single document. Real-world data — users with addresses, orders with line items, trees and graphs — all map naturally to nested JSON.</p>
<h2>Basic Nesting Patterns</h2>
<h3>Object inside Object</h3>
<pre><code class="language-json">{
  &#34;user&#34;: {
    &#34;id&#34;: 1,
    &#34;name&#34;: &#34;Alice&#34;,
    &#34;address&#34;: {
      &#34;street&#34;: &#34;123 Main St&#34;,
      &#34;city&#34;: &#34;New York&#34;,
      &#34;zipCode&#34;: &#34;10001&#34;
    }
  }
}</code></pre>
<h3>Array inside Object</h3>
<pre><code class="language-json">{
  &#34;order&#34;: {
    &#34;id&#34;: &#34;ORD-001&#34;,
    &#34;items&#34;: [
      {&#34;sku&#34;: &#34;A001&#34;, &#34;qty&#34;: 2, &#34;price&#34;: 9.99},
      {&#34;sku&#34;: &#34;B002&#34;, &#34;qty&#34;: 1, &#34;price&#34;: 24.99}
    ],
    &#34;total&#34;: 44.97
  }
}</code></pre>
<h3>Object inside Array</h3>
<pre><code class="language-json">[
  {&#34;id&#34;: 1, &#34;name&#34;: &#34;Alice&#34;, &#34;scores&#34;: [95, 87, 92]},
  {&#34;id&#34;: 2, &#34;name&#34;: &#34;Bob&#34;,   &#34;scores&#34;: [78, 83, 90]},
  {&#34;id&#34;: 3, &#34;name&#34;: &#34;Carol&#34;, &#34;scores&#34;: [91, 96, 88]}
]</code></pre>
<h2>Real-World Nesting Example: Blog Post</h2>
<pre><code class="language-json">{
  &#34;post&#34;: {
    &#34;id&#34;: &#34;post-001&#34;,
    &#34;title&#34;: &#34;Getting Started with JSON&#34;,
    &#34;author&#34;: {
      &#34;id&#34;: 42,
      &#34;name&#34;: &#34;Alice&#34;,
      &#34;avatar&#34;: &#34;https://cdn.example.com/alice.jpg&#34;
    },
    &#34;tags&#34;: [&#34;json&#34;, &#34;tutorial&#34;, &#34;beginner&#34;],
    &#34;comments&#34;: [
      {
        &#34;id&#34;: 1,
        &#34;text&#34;: &#34;Great article!&#34;,
        &#34;author&#34;: {&#34;id&#34;: 99, &#34;name&#34;: &#34;Bob&#34;},
        &#34;likes&#34;: 12
      }
    ],
    &#34;meta&#34;: {
      &#34;views&#34;: 1523,
      &#34;publishedAt&#34;: &#34;2025-01-15T08:00:00Z&#34;,
      &#34;updatedAt&#34;: &#34;2025-02-01T12:30:00Z&#34;
    }
  }
}</code></pre>
<h2>Accessing Deeply Nested Data</h2>
<h3>JavaScript</h3>
<pre><code class="language-javascript">const data = JSON.parse(json);

// Direct access
const city = data.user.address.city;

// Optional chaining (safe access)
const zip = data?.user?.address?.zipCode;

// Access array element
const firstItem = data.order.items[0].sku;

// Nested array
const firstScore = data[0].scores[0];</code></pre>
<h3>Python</h3>
<pre><code class="language-python">import json
data = json.loads(json_str)

city = data[&#34;user&#34;][&#34;address&#34;][&#34;city&#34;]
first_item = data[&#34;order&#34;][&#34;items&#34;][0][&#34;sku&#34;]

# Safe access
zip_code = data.get(&#34;user&#34;, {}).get(&#34;address&#34;, {}).get(&#34;zipCode&#34;)</code></pre>
<h2>Anti-Pattern: Over-Nesting</h2>
<p>Deep nesting (more than 4-5 levels) creates maintenance problems. Flatten where possible:</p>
<pre><code class="language-json">// ❌ Over-nested — hard to read and update
{&#34;a&#34;: {&#34;b&#34;: {&#34;c&#34;: {&#34;d&#34;: {&#34;value&#34;: 42}}}}}

// ✅ Flattened — clearer structure
{
  &#34;value&#34;: 42,
  &#34;path&#34;: &#34;a.b.c.d&#34;
}</code></pre>
<h2>Summary</h2>
<ul>
<li>JSON supports arbitrary nesting of objects and arrays</li>
<li>Nesting enables hierarchical data modeling (users, orders, trees)</li>
<li>Use optional chaining for safe deep access in JavaScript</li>
<li>Avoid nesting deeper than 4-5 levels for maintainability</li>
<li>Consider flattening relationships or using references for very deep structures</li>
</ul>"""

EN_CONTENT["first-json-file"] = """<h1>Creating Your First JSON File</h1>
<h2>What You'll Build</h2>
<p>In this tutorial you'll create a simple JSON file, read it in code, and write data back to it. No prior experience needed.</p>
<h2>Step 1: Create the File</h2>
<p>Create a file named <code>users.json</code> with your text editor:</p>
<pre><code class="language-json">{
  &#34;users&#34;: [
    {
      &#34;id&#34;: 1,
      &#34;name&#34;: &#34;Alice&#34;,
      &#34;email&#34;: &#34;alice@example.com&#34;,
      &#34;age&#34;: 28,
      &#34;isActive&#34;: true
    },
    {
      &#34;id&#34;: 2,
      &#34;name&#34;: &#34;Bob&#34;,
      &#34;email&#34;: &#34;bob@example.com&#34;,
      &#34;age&#34;: 32,
      &#34;isActive&#34;: false
    }
  ],
  &#34;total&#34;: 2,
  &#34;createdAt&#34;: &#34;2025-01-15&#34;
}</code></pre>
<h2>Step 2: Validate Your File</h2>
<p>Before using your JSON file, validate it:</p>
<pre><code class="language-bash"># Python (built-in)
python3 -m json.tool users.json

# jq
jq &#39;.&#39; users.json

# Node.js
node -e &#34;require(&#39;./users.json&#39;); console.log(&#39;Valid JSON&#39;)&#34;</code></pre>
<h2>Step 3: Read the File in Code</h2>
<h3>Python</h3>
<pre><code class="language-python">import json

# Read
with open(&#34;users.json&#34;, &#34;r&#34;, encoding=&#34;utf-8&#34;) as f:
    data = json.load(f)

# Access data
print(f&#34;Total users: {data[&#39;total&#39;]}&#34;)
for user in data[&#34;users&#34;]:
    print(f&#34;{user[&#39;name&#39;]}: {user[&#39;email&#39;]}&#34;)</code></pre>
<h3>JavaScript (Node.js)</h3>
<pre><code class="language-javascript">const fs = require(&#39;fs&#39;);

// Read synchronously
const data = JSON.parse(fs.readFileSync(&#39;users.json&#39;, &#39;utf8&#39;));
console.log(`Total users: ${data.total}`);
data.users.forEach(user => console.log(`${user.name}: ${user.email}`));

// Read asynchronously (recommended)
fs.readFile(&#39;users.json&#39;, &#39;utf8&#39;, (err, raw) => {
  if (err) throw err;
  const data = JSON.parse(raw);
  console.log(data.users.length);
});</code></pre>
<h3>Go</h3>
<pre><code class="language-go">package main

import (
    &#34;encoding/json&#34;
    &#34;fmt&#34;
    &#34;os&#34;
)

type User struct {
    ID      int    &#96;json:&#34;id&#34;&#96;
    Name    string &#96;json:&#34;name&#34;&#96;
    Email   string &#96;json:&#34;email&#34;&#96;
    Age     int    &#96;json:&#34;age&#34;&#96;
    Active  bool   &#96;json:&#34;isActive&#34;&#96;
}

type Data struct {
    Users []User &#96;json:&#34;users&#34;&#96;
    Total int    &#96;json:&#34;total&#34;&#96;
}

func main() {
    file, _ := os.ReadFile(&#34;users.json&#34;)
    var data Data
    json.Unmarshal(file, &amp;data)
    fmt.Printf(&#34;Total: %d\\n&#34;, data.Total)
    for _, u := range data.Users {
        fmt.Printf(&#34;%s: %s\\n&#34;, u.Name, u.Email)
    }
}</code></pre>
<h2>Step 4: Write Data Back</h2>
<h3>Python</h3>
<pre><code class="language-python">import json

# Add a new user
data[&#34;users&#34;].append({
    &#34;id&#34;: 3,
    &#34;name&#34;: &#34;Carol&#34;,
    &#34;email&#34;: &#34;carol@example.com&#34;,
    &#34;age&#34;: 25,
    &#34;isActive&#34;: True
})
data[&#34;total&#34;] = len(data[&#34;users&#34;])

with open(&#34;users.json&#34;, &#34;w&#34;, encoding=&#34;utf-8&#34;) as f:
    json.dump(data, f, indent=2, ensure_ascii=False)</code></pre>
<h2>Best Practices for JSON Files</h2>
<ul>
<li>Always save with UTF-8 encoding</li>
<li>Use 2-space indentation for readability</li>
<li>Validate after writing to avoid corrupt files</li>
<li>Use <code>.json</code> file extension</li>
<li>Include a schema or comment file for complex structures</li>
</ul>
<h2>Summary</h2>
<ul>
<li>Create JSON files with any text editor — just follow the syntax rules</li>
<li>Always validate before using in production</li>
<li>Use <code>json.load()</code> / <code>JSON.parse()</code> to read; <code>json.dump()</code> / <code>JSON.stringify()</code> to write</li>
<li>UTF-8 encoding, 2-space indent, proper escaping</li>
</ul>"""

EN_CONTENT["json-formatting-beautify"] = """<h1>JSON Formatting and Beautify Best Practices</h1>
<h2>Why JSON Formatting Matters</h2>
<p>JSON exists in two forms:</p>
<p><strong>Minified (compact):</strong> Smaller size, ideal for network transfer</p>
<pre><code class="language-json">{&#34;name&#34;:&#34;Alice&#34;,&#34;age&#34;:25,&#34;address&#34;:{&#34;city&#34;:&#34;New York&#34;,&#34;country&#34;:&#34;US&#34;}}</code></pre>
<p><strong>Prettified (formatted):</strong> Human-readable, ideal for development and debugging</p>
<pre><code class="language-json">{
  &#34;name&#34;: &#34;Alice&#34;,
  &#34;age&#34;: 25,
  &#34;address&#34;: {
    &#34;city&#34;: &#34;New York&#34;,
    &#34;country&#34;: &#34;US&#34;
  }
}</code></pre>
<h2>Formatting Tools</h2>
<h3>1. Online Tools</h3>
<ul>
<li><strong>ToolboxNova JSON Formatter</strong> — format, minify, validate in one place</li>
<li>Paste JSON → auto-format → one-click copy</li>
</ul>
<h3>2. Command-Line Tools</h3>
<pre><code class="language-bash"># Python (built-in)
echo &#39;{&#34;a&#34;:1,&#34;b&#34;:2}&#39; | python3 -m json.tool

# jq (recommended — most powerful)
echo &#39;{&#34;a&#34;:1,&#34;b&#34;:2}&#39; | jq &#39;.&#39;

# Node.js
echo &#39;{&#34;a&#34;:1,&#34;b&#34;:2}&#39; | node -e &#34;process.stdin.on(&#39;data&#39;,d=&gt;console.log(JSON.stringify(JSON.parse(d),null,2)))&#34;</code></pre>
<h3>3. Built-in Language Support</h3>
<p><strong>JavaScript:</strong></p>
<pre><code class="language-javascript">const obj = { name: &#34;Alice&#34;, age: 25 };

// Pretty-print (2-space indent)
JSON.stringify(obj, null, 2);

// Pretty-print (tab indent)
JSON.stringify(obj, null, &#39;\\t&#39;);

// Compact/minified
JSON.stringify(obj);</code></pre>
<p><strong>Python:</strong></p>
<pre><code class="language-python">import json

data = {&#34;name&#34;: &#34;Alice&#34;, &#34;age&#34;: 25}

# Pretty-print
print(json.dumps(data, indent=2, ensure_ascii=False))

# Compact
print(json.dumps(data, separators=(&#39;,&#39;, &#39;:&#39;)))

# Sort keys
print(json.dumps(data, indent=2, sort_keys=True))</code></pre>
<p><strong>Go:</strong></p>
<pre><code class="language-go">import &#34;encoding/json&#34;

data := map[string]interface{}{&#34;name&#34;: &#34;Alice&#34;, &#34;age&#34;: 25}

// Pretty-print
pretty, _ := json.MarshalIndent(data, &#34;&#34;, &#34;  &#34;)

// Compact
compact, _ := json.Marshal(data)</code></pre>
<h3>4. Editor Shortcuts</h3>
<table>
<thead><tr><th>Editor</th><th>Format Shortcut</th></tr></thead>
<tbody>
<tr><td>VS Code</td><td><code>Shift + Alt + F</code></td></tr>
<tr><td>Sublime Text</td><td><code>Ctrl+Shift+P</code> → Pretty JSON</td></tr>
<tr><td>Vim</td><td><code>:%!python -m json.tool</code></td></tr>
<tr><td>JetBrains</td><td><code>Ctrl + Alt + L</code></td></tr>
</tbody>
</table>
<h2>Indentation Style Guide</h2>
<table>
<thead><tr><th>Style</th><th>Example</th><th>Recommended For</th></tr></thead>
<tbody>
<tr><td>2 spaces</td><td><code>JSON.stringify(obj, null, 2)</code></td><td>Frontend projects (most common)</td></tr>
<tr><td>4 spaces</td><td><code>JSON.stringify(obj, null, 4)</code></td><td>Python projects</td></tr>
<tr><td>Tab</td><td><code>JSON.stringify(obj, null, &#39;\\t&#39;)</code></td><td>Personal preference</td></tr>
<tr><td>Compact</td><td><code>JSON.stringify(obj)</code></td><td>Production, API transfer</td></tr>
</tbody>
</table>
<h2>Minification</h2>
<p>Minifying JSON can significantly reduce file size:</p>
<pre><code class="language-bash"># jq minify
jq -c &#39;.&#39; pretty.json &gt; minified.json

# Python minify
python3 -c &#34;import json,sys; json.dump(json.load(sys.stdin), sys.stdout, separators=(&#39;,&#39;,&#39;:&#39;))&#34; &lt; pretty.json &gt; minified.json</code></pre>
<p><strong>Size savings:</strong></p>
<table>
<thead><tr><th>File</th><th>Pretty Size</th><th>Minified Size</th><th>Savings</th></tr></thead>
<tbody>
<tr><td>package.json</td><td>2.1 KB</td><td>1.4 KB</td><td>33%</td></tr>
<tr><td>API response</td><td>15.6 KB</td><td>8.2 KB</td><td>47%</td></tr>
<tr><td>Config file</td><td>5.3 KB</td><td>3.1 KB</td><td>42%</td></tr>
</tbody>
</table>
<h2>Key Sorting</h2>
<p>Sorting keys makes JSON easier to compare and find differences:</p>
<pre><code class="language-python">import json

data = {&#34;zebra&#34;: 1, &#34;apple&#34;: 2, &#34;mango&#34;: 3}
print(json.dumps(data, indent=2, sort_keys=True))</code></pre>
<pre><code class="language-json">{
  &#34;apple&#34;: 2,
  &#34;mango&#34;: 3,
  &#34;zebra&#34;: 1
}</code></pre>
<h2>JSON Diff</h2>
<p>Format first, then diff for clear change tracking:</p>
<pre><code class="language-bash"># Format then diff
jq -S &#39;.&#39; file1.json &gt; /tmp/a.json
jq -S &#39;.&#39; file2.json &gt; /tmp/b.json
diff /tmp/a.json /tmp/b.json</code></pre>
<h2>Summary</h2>
<ul>
<li>Pretty-print for development; minify for production API transfer</li>
<li><code>jq</code> and <code>python -m json.tool</code> are the most convenient CLI tools</li>
<li>Standardize on 2-space indentation for team projects</li>
<li>Sort keys for easier version control diffs</li>
<li>Minification saves 30-50% file size on average</li>
</ul>"""

with open(BASICS_JS, 'r', encoding='utf-8') as f:
    content = f.read()

for slug, en_html in EN_CONTENT.items():
    # Find the pattern: en: `...` for this slug's article
    # We need to find the en property after the zh property for this specific slug
    # Pattern: the en: ` block that follows the zh: ` block for this slug

    # Find the article start
    article_start = content.find(f'window.LEARN_ARTICLES["{slug}"]')
    if article_start == -1:
        print(f"WARNING: slug '{slug}' not found!")
        continue

    # Find the en: ` start within this article's section
    en_start = content.find('\nen: `', article_start)
    if en_start == -1:
        print(f"WARNING: en property not found for '{slug}'!")
        continue

    # Find the closing ` for the en property
    # It's the backtick followed by newline and }; or \n};
    en_content_start = en_start + len('\nen: `')

    # Find the end: look for `\n}; pattern
    en_end = content.find('\n`\n};', en_content_start)
    if en_end == -1:
        print(f"WARNING: en end not found for '{slug}'!")
        continue

    # Replace the content
    old_en = content[en_content_start:en_end]
    content = content[:en_content_start] + en_html + content[en_end:]
    print(f"✅ Replaced en for '{slug}' ({len(old_en)} → {len(en_html)} chars)")

with open(BASICS_JS, 'w', encoding='utf-8') as f:
    f.write(content)

print("\nDone! basics.js updated.")

