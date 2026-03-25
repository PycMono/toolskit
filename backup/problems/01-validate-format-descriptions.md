<!-- 01-validate-format-descriptions.md -->
<!-- JSON Tools 工具描述 — 验证与格式化 / Validate & Format -->
<!-- 适用于 toolboxnova.com，支持中英文 i18n -->

---

# 1. JSON Validator / JSON 验证器

## English

### What is JSON Validation?

JSON validation checks whether your data conforms to the JSON specification (RFC 8259). A valid JSON document must have correctly matched brackets, properly quoted keys, valid value types, and no trailing commas. Even a single misplaced character can break an entire API response or configuration file.

### Why Validate JSON?

- **Catch syntax errors early** — Find missing commas, unclosed brackets, and misquoted strings before they cause runtime failures
- **Debug API responses** — Quickly identify malformed data from third-party APIs
- **Verify configuration files** — Ensure config files are valid before deployment
- **Validate user input** — Check JSON submitted through forms or file uploads

### Common JSON Errors

| Error | Example | Fix |
|-------|---------|-----|
| Trailing comma | `{"a": 1,}` | Remove the last comma |
| Single quotes | `{'key': 'value'}` | Use double quotes `"key"` |
| Unquoted keys | `{name: "Alice"}` | Quote all keys `"name"` |
| Missing comma | `{"a": 1 "b": 2}` | Add comma between pairs |
| Comments | `{"a": 1 // note}` | Remove comments (not valid JSON) |

### How Our Validator Works

1. **Paste or type** your JSON in the editor
2. **Real-time validation** highlights errors as you type
3. **Error messages** pinpoint the exact line and character position
4. **Auto-format** cleans up valid JSON with proper indentation

### Programmatic Validation

**JavaScript**
```javascript
function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}
```

**Python**
```python
import json

def is_valid_json(s):
    try:
        json.loads(s)
        return True
    except json.JSONDecodeError as e:
        print(f"Error at line {e.lineno}, col {e.colno}: {e.msg}")
        return False
```

**Command Line (with jq)**
```bash
echo '{"key": "value"}' | jq . > /dev/null && echo "Valid" || echo "Invalid"
```

### Pro Tips

- 💡 **Validate before deploying** — Add JSON validation to your CI/CD pipeline to catch config errors
- 💡 **Use strict mode** — Some parsers are lenient; our tool follows the strict RFC 8259 specification
- 💡 **Check encoding** — Ensure your JSON is UTF-8 encoded; BOM characters can cause validation failures

### Related Tools

- **JSON Repair** — Auto-fix common syntax errors
- **JSON Pretty Print** — Format validated JSON for readability
- **JSON Schema Validator** — Validate structure, not just syntax

---

## 中文

### 什么是 JSON 验证？

JSON 验证用于检查数据是否符合 JSON 规范（RFC 8259）。有效的 JSON 文档必须具有正确匹配的括号、正确引用的键名、有效的值类型，且不能有多余的逗号。即使一个错位的字符也可能导致整个 API 响应或配置文件失效。

### 为什么需要验证 JSON？

- **尽早发现语法错误** — 在运行时故障发生前找到缺失的逗号、未闭合的括号和错误的引号
- **调试 API 响应** — 快速定位第三方 API 返回的格式错误数据
- **检验配置文件** — 确保配置文件在部署前是有效的
- **验证用户输入** — 检查通过表单或文件上传提交的 JSON

### 常见 JSON 错误

| 错误类型 | 示例 | 修复方法 |
|---------|------|---------|
| 尾部多余逗号 | `{"a": 1,}` | 删除最后一个逗号 |
| 使用单引号 | `{'key': 'value'}` | 使用双引号 `"key"` |
| 键名未加引号 | `{name: "Alice"}` | 给所有键名加双引号 `"name"` |
| 缺少逗号 | `{"a": 1 "b": 2}` | 在键值对之间添加逗号 |
| 包含注释 | `{"a": 1 // 注释}` | 删除注释（JSON 不支持注释）|

### 验证器工作原理

1. 在编辑器中**粘贴或输入** JSON
2. **实时验证**在输入时高亮错误
3. **错误信息**精确定位到行号和字符位置
4. **自动格式化**将有效 JSON 整理为规范缩进

### 编程验证方式

**JavaScript**
```javascript
function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}
```

**Python**
```python
import json

def is_valid_json(s):
    try:
        json.loads(s)
        return True
    except json.JSONDecodeError as e:
        print(f"第 {e.lineno} 行，第 {e.colno} 列错误：{e.msg}")
        return False
```

### 使用技巧

- 💡 **部署前验证** — 在 CI/CD 流水线中加入 JSON 验证步骤，提前捕获配置错误
- 💡 **使用严格模式** — 部分解析器比较宽松，本工具严格遵循 RFC 8259 规范
- 💡 **检查编码** — 确保 JSON 使用 UTF-8 编码，BOM 字符可能导致验证失败

### 相关工具

- **JSON 修复** — 自动修复常见语法错误
- **JSON 格式化** — 将验证通过的 JSON 格式化为易读格式
- **JSON Schema 验证** — 验证数据结构，而非仅验证语法


---
---

# 2. JSON Repair / JSON 修复

## English

### What is JSON Repair?

JSON Repair automatically fixes common syntax errors in malformed JSON. It handles issues like trailing commas, single-quoted strings, unquoted keys, missing quotes, and other problems that frequently occur when copying JSON from logs, LLM outputs, or code comments.

### Before and After

**Broken JSON:**
```
{
  name: 'Alice',
  age: 30,
  "hobbies": ["reading", "coding",],
  // This is a comment
  'active': True
}
```

**Repaired JSON:**
```json
{
  "name": "Alice",
  "age": 30,
  "hobbies": ["reading", "coding"],
  "active": true
}
```

### What Gets Fixed?

| Issue | Before | After |
|-------|--------|-------|
| Unquoted keys | `{name: "Alice"}` | `{"name": "Alice"}` |
| Single quotes | `{'key': 'val'}` | `{"key": "val"}` |
| Trailing commas | `[1, 2, 3,]` | `[1, 2, 3]` |
| Comments | `{"a": 1 // note}` | `{"a": 1}` |
| Python booleans | `True`, `False`, `None` | `true`, `false`, `null` |
| Missing quotes on values | `{key: value}` | `{"key": "value"}` |
| Unescaped control characters | Newlines in strings | Escaped `\n` |

### Common Use Cases

- **LLM outputs** — AI models sometimes produce JSON with comments, trailing commas, or single quotes
- **Log files** — Server logs often contain semi-structured JSON with formatting issues
- **Copy-paste errors** — JSON copied from documentation or code comments may include non-standard syntax
- **Manual editing** — Hand-written JSON is prone to common syntax mistakes

### Pro Tips

- 💡 **Always review repairs** — Auto-repair makes assumptions; verify the output matches your intent
- 💡 **Use validation after repair** — Run the repaired JSON through the validator to ensure correctness
- 💡 **For JSONC files** — If you intentionally use comments, try the JSONC to JSON converter instead

### Related Tools

- **JSON Validator** — Validate repaired JSON
- **JSON Pretty Print** — Format the repaired output
- **JSONC to JSON** — Strip comments from JSON5/JSONC files

---

## 中文

### 什么是 JSON 修复？

JSON 修复功能可以自动修正格式不正确的 JSON 中常见的语法错误，包括尾部逗号、单引号字符串、未加引号的键名、缺少引号等问题。这些问题通常在从日志文件、AI 大模型输出或代码注释中复制 JSON 时发生。

### 修复前后对比

**损坏的 JSON：**
```
{
  name: 'Alice',
  age: 30,
  "hobbies": ["reading", "coding",],
  // 这是注释
  'active': True
}
```

**修复后的 JSON：**
```json
{
  "name": "Alice",
  "age": 30,
  "hobbies": ["reading", "coding"],
  "active": true
}
```

### 可修复的问题

| 问题类型 | 修复前 | 修复后 |
|---------|--------|-------|
| 键名未加引号 | `{name: "Alice"}` | `{"name": "Alice"}` |
| 使用单引号 | `{'key': 'val'}` | `{"key": "val"}` |
| 尾部多余逗号 | `[1, 2, 3,]` | `[1, 2, 3]` |
| 包含注释 | `{"a": 1 // 注释}` | `{"a": 1}` |
| Python 布尔值 | `True`、`False`、`None` | `true`、`false`、`null` |
| 值未加引号 | `{key: value}` | `{"key": "value"}` |

### 常见使用场景

- **AI 大模型输出** — AI 模型有时会生成带注释、尾部逗号或单引号的 JSON
- **日志文件** — 服务器日志中的 JSON 常有格式问题
- **复制粘贴错误** — 从文档或代码注释中复制的 JSON 可能包含非标准语法
- **手动编辑** — 手写 JSON 容易出现常见语法错误

### 使用技巧

- 💡 **务必检查修复结果** — 自动修复基于假设，请核实输出是否符合预期
- 💡 **修复后再验证** — 将修复后的 JSON 通过验证器确认正确性
- 💡 **JSONC 文件请用专门工具** — 如果你有意使用注释，建议使用 JSONC 转 JSON 转换器

### 相关工具

- **JSON 验证器** — 验证修复后的 JSON
- **JSON 格式化** — 格式化修复后的输出
- **JSONC 转 JSON** — 从 JSON5/JSONC 文件中去除注释


---
---

# 3. JSON Pretty Print / JSON 格式化

## English

### What is Pretty Printing?

Pretty printing (also called beautifying or formatting) adds whitespace, indentation, and line breaks to JSON to make it human-readable. Minified JSON saves bandwidth but is nearly impossible to read—pretty printing solves this.

### Before and After

**Minified (66 bytes):**
```
{"name":"John","age":30,"address":{"city":"New York","zip":"10001"}}
```

**Pretty Printed (138 bytes):**
```json
{
  "name": "John",
  "age": 30,
  "address": {
    "city": "New York",
    "zip": "10001"
  }
}
```

### Formatting Options

| Option | Description | Common Usage |
|--------|-------------|-------------|
| 2 spaces | Most popular indentation | JavaScript, TypeScript, Node.js |
| 4 spaces | Wider indentation | Java, Python, C# |
| Tab | Tab character indent | Go, legacy projects |
| 1 space | Ultra-compact readable | Space-constrained displays |

### Why Pretty Print JSON?

- **Debugging** — Quickly understand API responses and data structures
- **Code review** — Make JSON changes easier to review in pull requests
- **Documentation** — Create readable examples for API docs and tutorials
- **Configuration** — Keep config files human-readable in version control
- **Learning** — Visualize nested structures for beginners

### Pretty Print vs Minify

| Pretty Print | Minify |
|-------------|--------|
| Adds whitespace | Removes whitespace |
| Human-readable | Machine-optimized |
| Larger file size | Smaller file size |
| For development & debugging | For production & network transfer |

### Programmatic Pretty Print

**JavaScript**
```javascript
// Format with 2-space indentation
const formatted = JSON.stringify(JSON.parse(jsonString), null, 2);

// The third argument controls indent:
// number → spaces, string → literal (e.g., "\t" for tabs)
```

**Python**
```python
import json

formatted = json.dumps(json.loads(json_string), indent=2, ensure_ascii=False)

# With sorted keys
formatted = json.dumps(obj, indent=2, sort_keys=True)
```

**Command Line (jq)**
```bash
# Pretty print a file
cat data.json | jq '.'

# Pretty print with sorted keys
cat data.json | jq -S '.'
```

### Pro Tips

- 💡 **Sort keys for diffs** — Enable key sorting for cleaner version control diffs
- 💡 **Validate first** — If formatting fails, your JSON likely has syntax errors
- 💡 **Consistent indentation** — Match your team's code style (check `.editorconfig` or `.prettierrc`)

### Related Tools

- **JSON Minify** — Compress JSON by removing whitespace
- **JSON Validator** — Validate and fix syntax errors
- **JSON Sort Keys** — Alphabetically sort object keys

---

## 中文

### 什么是 JSON 格式化？

JSON 格式化（也称为美化或 Pretty Print）会在 JSON 中添加空格、缩进和换行符，使其变为人类可读的格式。压缩后的 JSON 虽然节省带宽，但几乎无法阅读——格式化解决了这个问题。

### 格式化前后对比

**压缩版（66 字节）：**
```
{"name":"John","age":30,"address":{"city":"New York","zip":"10001"}}
```

**格式化后（138 字节）：**
```json
{
  "name": "John",
  "age": 30,
  "address": {
    "city": "New York",
    "zip": "10001"
  }
}
```

### 格式化选项

| 选项 | 说明 | 常见用途 |
|------|------|---------|
| 2 个空格 | 最流行的缩进方式 | JavaScript、TypeScript、Node.js |
| 4 个空格 | 更宽的缩进 | Java、Python、C# |
| Tab | 制表符缩进 | Go、旧项目 |
| 1 个空格 | 超紧凑可读格式 | 空间受限的显示场景 |

### 为什么需要格式化 JSON？

- **调试** — 快速理解 API 响应和数据结构
- **代码审查** — 使 Pull Request 中的 JSON 变更更易于审查
- **文档编写** — 为 API 文档和教程创建可读的示例
- **配置管理** — 在版本控制中保持配置文件可读性
- **学习** — 帮助初学者直观理解嵌套结构

### 格式化 vs 压缩

| 格式化（Pretty Print） | 压缩（Minify） |
|----------------------|---------------|
| 添加空白字符 | 移除空白字符 |
| 人类可读 | 机器优化 |
| 文件体积更大 | 文件体积更小 |
| 用于开发和调试 | 用于生产环境和网络传输 |

### 使用技巧

- 💡 **排序键名便于对比** — 开启键名排序可获得更清晰的版本控制差异
- 💡 **先验证再格式化** — 如果格式化失败，你的 JSON 可能有语法错误
- 💡 **统一缩进风格** — 与团队代码风格保持一致（检查 `.editorconfig` 或 `.prettierrc`）

### 相关工具

- **JSON 压缩** — 移除空白字符压缩 JSON
- **JSON 验证器** — 验证并修复语法错误
- **JSON 键名排序** — 按字母顺序排列对象键名


---
---

# 4. JSON Minify / JSON 压缩

## English

### What is JSON Minification?

Minification removes all unnecessary whitespace (spaces, tabs, newlines) from JSON while keeping it valid. The result is a single-line, compact string that's smaller in size but functionally identical to the original.

### Before and After

**Formatted (287 bytes):**
```json
{
  "user": {
    "name": "Alice",
    "email": "alice@example.com",
    "roles": [
      "admin",
      "editor"
    ]
  }
}
```

**Minified (75 bytes — 74% smaller):**
```
{"user":{"name":"Alice","email":"alice@example.com","roles":["admin","editor"]}}
```

### Why Minify JSON?

- **Smaller payloads** — Reduce API response sizes by 60–80%
- **Faster transfers** — Less data means faster network transmission
- **Lower storage costs** — Store more data in less disk space
- **Bandwidth savings** — Especially important for mobile users on limited data plans

### When to Minify

| Scenario | Minify? |
|----------|---------|
| Production API responses | ✅ Yes |
| Storing in databases | ✅ Yes (usually) |
| Config files in version control | ❌ No (readability matters) |
| Development / debugging | ❌ No |
| Log files | ✅ Yes (saves disk space) |
| Embedded in HTML/JS | ✅ Yes |

### Minification vs Compression

Minification and compression (gzip, Brotli) are complementary:

- **Minification** — Removes whitespace, ~60–80% size reduction
- **Compression** — Algorithmic compression, ~70–90% additional reduction
- **Both together** — Best results, up to 95% total size reduction

Most web servers apply gzip/Brotli automatically. Minifying first gives compression algorithms less redundant data to work with, yielding better compression ratios.

### Programmatic Minification

**JavaScript**
```javascript
const minified = JSON.stringify(JSON.parse(jsonString));
```

**Python**
```python
import json
minified = json.dumps(json.loads(json_string), separators=(',', ':'))
```

**Command Line (jq)**
```bash
jq -c '.' data.json > data.min.json
```

### Pro Tips

- 💡 **Validate first** — Use the JSON Validator before minifying to catch errors
- 💡 **Keep originals** — Store formatted JSON in source control, minify during build/deploy
- 💡 **Enable server compression** — Configure your server to gzip JSON responses for maximum savings

### Limitations

Minification only removes whitespace. It does **not**:
- Shorten key names (that would break your code)
- Remove duplicate data
- Apply semantic compression

For deeper optimization, consider binary formats like Protocol Buffers or MessagePack.

### Related Tools

- **JSON Pretty Print** — Format minified JSON for readability
- **JSON Validator** — Validate JSON before minifying
- **JSON Diff** — Compare minified vs formatted versions

---

## 中文

### 什么是 JSON 压缩？

JSON 压缩（Minification）会移除 JSON 中所有不必要的空白字符（空格、制表符、换行符），同时保持 JSON 的有效性。结果是一个单行的紧凑字符串，体积更小但功能与原始数据完全相同。

### 压缩前后对比

**格式化版（287 字节）：**
```json
{
  "user": {
    "name": "Alice",
    "email": "alice@example.com",
    "roles": [
      "admin",
      "editor"
    ]
  }
}
```

**压缩版（75 字节 — 缩小 74%）：**
```
{"user":{"name":"Alice","email":"alice@example.com","roles":["admin","editor"]}}
```

### 为什么需要压缩 JSON？

- **减小传输体积** — 将 API 响应大小减少 60–80%
- **加速传输** — 数据量越少，网络传输越快
- **降低存储成本** — 用更少的磁盘空间存储更多数据
- **节省带宽** — 对使用有限流量的移动端用户尤为重要

### 何时应该压缩

| 场景 | 是否压缩？ |
|------|-----------|
| 生产环境 API 响应 | ✅ 是 |
| 数据库存储 | ✅ 是（通常） |
| 版本控制中的配置文件 | ❌ 否（可读性更重要） |
| 开发 / 调试 | ❌ 否 |
| 日志文件 | ✅ 是（节省磁盘空间） |
| 嵌入 HTML/JS | ✅ 是 |

### 压缩 vs 编码压缩

JSON 压缩和编码压缩（gzip、Brotli）是互补的：

- **JSON 压缩** — 移除空白字符，体积减少约 60–80%
- **编码压缩** — 算法压缩，额外减少约 70–90%
- **两者结合** — 效果最佳，总体可减少高达 95%

大多数 Web 服务器会自动应用 gzip/Brotli。先进行 JSON 压缩可以让压缩算法处理更少的冗余数据，获得更好的压缩比。

### 使用技巧

- 💡 **先验证再压缩** — 压缩前使用 JSON 验证器检查错误
- 💡 **保留原始文件** — 在源代码管理中存储格式化版本，构建/部署时再压缩
- 💡 **启用服务器压缩** — 配置服务器对 JSON 响应启用 gzip，获得最大节省

### 局限性

压缩仅移除空白字符，**不会**：
- 缩短键名（否则会破坏代码）
- 移除重复数据
- 进行语义压缩

如需更深层的优化，可以考虑 Protocol Buffers 或 MessagePack 等二进制格式。

### 相关工具

- **JSON 格式化** — 将压缩后的 JSON 格式化为可读格式
- **JSON 验证器** — 压缩前验证 JSON
- **JSON 对比** — 对比压缩版和格式化版的差异


---
---

# 5. JSON Sort Keys / JSON 键名排序

## English

### What is JSON Key Sorting?

JSON key sorting alphabetically reorders all object keys throughout your JSON document. While JSON objects are technically unordered, consistent key ordering makes data easier to read, compare, and manage in version control.

### Before and After

**Unsorted:**
```json
{
  "zip": "10001",
  "name": "Alice",
  "age": 30,
  "city": "New York"
}
```

**Sorted (A → Z):**
```json
{
  "age": 30,
  "city": "New York",
  "name": "Alice",
  "zip": "10001"
}
```

### Why Sort JSON Keys?

- **Cleaner diffs** — Consistent key order produces minimal, meaningful diffs in Git
- **Easier scanning** — Find keys quickly in large objects when they're alphabetized
- **Deterministic output** — Sorted keys ensure the same data always produces the same JSON string
- **API testing** — Compare API responses reliably regardless of server-side key ordering

### Sorting Options

| Option | Description |
|--------|-------------|
| A → Z (ascending) | Standard alphabetical order |
| Z → A (descending) | Reverse alphabetical order |
| Recursive | Sort keys at all nesting levels |
| Top-level only | Sort only the root object's keys |

### Programmatic Key Sorting

**JavaScript**
```javascript
function sortKeys(obj) {
  if (Array.isArray(obj)) return obj.map(sortKeys);
  if (obj && typeof obj === 'object') {
    return Object.keys(obj).sort().reduce((sorted, key) => {
      sorted[key] = sortKeys(obj[key]);
      return sorted;
    }, {});
  }
  return obj;
}
```

**Python**
```python
import json
sorted_json = json.dumps(data, sort_keys=True, indent=2)
```

**Command Line (jq)**
```bash
jq -S '.' data.json
```

### Pro Tips

- 💡 **Sort before committing** — Add key sorting to your pre-commit hook for consistent JSON files
- 💡 **Sort before diffing** — Sort both JSON documents before comparing to eliminate false positives from key reordering
- 💡 **Arrays stay ordered** — Sorting only affects object keys; array element order is preserved

### Related Tools

- **JSON Diff** — Compare sorted JSON documents
- **JSON Pretty Print** — Format after sorting
- **JSON Validator** — Validate sorted output

---

## 中文

### 什么是 JSON 键名排序？

JSON 键名排序会按字母顺序重新排列 JSON 文档中所有对象的键名。虽然 JSON 对象在技术上是无序的，但一致的键名顺序能让数据更易于阅读、比较和在版本控制中管理。

### 排序前后对比

**排序前：**
```json
{
  "zip": "10001",
  "name": "Alice",
  "age": 30,
  "city": "New York"
}
```

**排序后（A → Z）：**
```json
{
  "age": 30,
  "city": "New York",
  "name": "Alice",
  "zip": "10001"
}
```

### 为什么需要排序键名？

- **更干净的差异对比** — 一致的键名顺序在 Git 中产生更小、更有意义的差异
- **更容易浏览** — 大对象中按字母排序后能快速找到目标键
- **确定性输出** — 排序的键名确保相同数据始终生成相同的 JSON 字符串
- **API 测试** — 无论服务器端键名顺序如何，都能可靠地比较 API 响应

### 使用技巧

- 💡 **提交前排序** — 在 pre-commit 钩子中加入键名排序，保持 JSON 文件一致性
- 💡 **对比前排序** — 比较两个 JSON 时先排序，消除键名重排产生的假差异
- 💡 **数组保持原序** — 排序仅影响对象键名，数组元素顺序不变

### 相关工具

- **JSON 对比** — 对比排序后的 JSON 文档
- **JSON 格式化** — 排序后进行格式化
- **JSON 验证器** — 验证排序后的输出


---
---

# 6. JSON Escape / JSON 转义

## English

### What is JSON Escaping?

JSON escaping converts a JSON string into a safely embeddable format by adding backslash escapes to special characters. This is essential when you need to embed JSON inside another JSON string, a JavaScript variable, or an HTML attribute.

### Before and After

**Original JSON:**
```json
{"message": "Hello \"World\"", "path": "C:\\Users\\data"}
```

**Escaped:**
```
{\"message\": \"Hello \\\"World\\\"\", \"path\": \"C:\\\\Users\\\\data\"}
```

### Characters That Get Escaped

| Character | Escaped | Description |
|-----------|---------|-------------|
| `"` | `\"` | Double quote |
| `\` | `\\` | Backslash |
| `/` | `\/` | Forward slash (optional) |
| `\n` | `\\n` | Newline |
| `\t` | `\\t` | Tab |
| `\r` | `\\r` | Carriage return |

### Common Use Cases

- **Embedding JSON in strings** — Store JSON as a string value inside another JSON document
- **API payloads** — Wrap JSON data in a string field for certain API formats
- **JavaScript template literals** — Safely embed JSON in JS code
- **Database storage** — Store JSON strings in text columns

### Pro Tips

- 💡 **Double-escape for nesting** — Each layer of embedding requires an additional round of escaping
- 💡 **Use Unescape to reverse** — If you receive escaped JSON, use the Unescape tool to restore it
- 💡 **Check your language's built-in** — Most languages have `JSON.stringify()` or equivalent that handles escaping automatically

### Related Tools

- **JSON Unescape** — Reverse the escaping process
- **JSON Stringify** — Convert objects to escaped string format
- **JSON Validator** — Validate before escaping

---

## 中文

### 什么是 JSON 转义？

JSON 转义通过在特殊字符前添加反斜杠（`\`）将 JSON 字符串转换为可安全嵌入的格式。当需要将 JSON 嵌入到另一个 JSON 字符串、JavaScript 变量或 HTML 属性中时，这是必要的操作。

### 转义前后对比

**原始 JSON：**
```json
{"message": "Hello \"World\"", "path": "C:\\Users\\data"}
```

**转义后：**
```
{\"message\": \"Hello \\\"World\\\"\", \"path\": \"C:\\\\Users\\\\data\"}
```

### 被转义的字符

| 字符 | 转义后 | 说明 |
|------|-------|------|
| `"` | `\"` | 双引号 |
| `\` | `\\` | 反斜杠 |
| `/` | `\/` | 正斜杠（可选） |
| `\n` | `\\n` | 换行符 |
| `\t` | `\\t` | 制表符 |
| `\r` | `\\r` | 回车符 |

### 常见使用场景

- **嵌入 JSON 到字符串** — 将 JSON 作为字符串值存储在另一个 JSON 文档中
- **API 请求体** — 在特定 API 格式中将 JSON 数据包装在字符串字段中
- **JavaScript 模板** — 在 JS 代码中安全嵌入 JSON
- **数据库存储** — 将 JSON 字符串存储在文本列中

### 使用技巧

- 💡 **嵌套需要多重转义** — 每一层嵌套都需要额外一轮转义
- 💡 **使用反转义还原** — 收到转义后的 JSON 时，使用反转义工具还原
- 💡 **优先使用语言内置函数** — 大多数编程语言内置了 `JSON.stringify()` 等自动处理转义的函数

### 相关工具

- **JSON 反转义** — 反向还原转义过程
- **JSON Stringify** — 将对象转换为转义字符串格式
- **JSON 验证器** — 转义前先验证


---
---

# 7. JSON Unescape / JSON 反转义

## English

### What is JSON Unescaping?

JSON unescaping reverses the escaping process—it converts escaped characters (`\"`, `\\`, `\\n`) back to their original form, turning a stringified JSON back into a properly structured JSON document.

### Before and After

**Escaped string:**
```
{\"name\":\"Alice\",\"message\":\"Hello\\nWorld\"}
```

**Unescaped JSON:**
```json
{"name": "Alice", "message": "Hello\nWorld"}
```

### When to Unescape

- **API debugging** — Some APIs return JSON wrapped in a string; unescape to inspect the actual data
- **Log analysis** — Log entries often contain double-escaped JSON that needs unwrapping
- **Database queries** — JSON stored as escaped strings needs unescaping for readability
- **Nested JSON strings** — Extract embedded JSON from string fields

### Pro Tips

- 💡 **Multiple layers** — If the first unescape still shows escaped characters, run it again for nested escaping
- 💡 **Validate after unescaping** — Ensure the result is valid JSON after unescaping

### Related Tools

- **JSON Escape** — Escape JSON for embedding in strings
- **JSON Pretty Print** — Format unescaped JSON
- **JSON Validator** — Validate unescaped output

---

## 中文

### 什么是 JSON 反转义？

JSON 反转义是转义的逆过程——将转义字符（`\"`、`\\`、`\\n`）还原为原始形式，将字符串化的 JSON 还原为结构正确的 JSON 文档。

### 反转义前后对比

**转义后的字符串：**
```
{\"name\":\"Alice\",\"message\":\"Hello\\nWorld\"}
```

**反转义后的 JSON：**
```json
{"name": "Alice", "message": "Hello\nWorld"}
```

### 何时需要反转义

- **API 调试** — 某些 API 返回被字符串包裹的 JSON，需要反转义才能查看实际数据
- **日志分析** — 日志条目中常包含需要解包的双重转义 JSON
- **数据库查询** — 以转义字符串形式存储的 JSON 需要反转义以便阅读
- **嵌套 JSON 字符串** — 从字符串字段中提取嵌入的 JSON

### 使用技巧

- 💡 **多层转义** — 如果第一次反转义后仍有转义字符，可能存在嵌套转义，需再次运行
- 💡 **反转义后验证** — 确保反转义结果是有效的 JSON

### 相关工具

- **JSON 转义** — 将 JSON 转义以便嵌入字符串
- **JSON 格式化** — 格式化反转义后的 JSON
- **JSON 验证器** — 验证反转义后的输出


---
---

# 8. JSON Stringify / JSON 字符串化

## English

### What is JSON Stringify?

JSON Stringify converts a JavaScript object or JSON value into a JSON-formatted string. It's the standard way to serialize data for storage, transmission, or embedding. This tool also lets you convert a JSON document into a string representation suitable for use in code.

### Before and After

**JSON object:**
```json
{
  "name": "Alice",
  "scores": [95, 87, 92]
}
```

**Stringified:**
```
"{\n  \"name\": \"Alice\",\n  \"scores\": [95, 87, 92]\n}"
```

### `JSON.stringify()` Options

| Parameter | Description | Example |
|-----------|-------------|---------|
| `value` | The data to serialize | `{name: "Alice"}` |
| `replacer` | Filter or transform properties | `["name"]` (include only "name") |
| `space` | Indentation (number or string) | `2` for 2-space indent |

### Common Use Cases

- **API requests** — Serialize objects for `fetch()` or `XMLHttpRequest` body
- **localStorage** — Store objects as JSON strings in browser storage
- **Logging** — Convert objects to readable strings for console output
- **Code generation** — Generate JSON string literals for embedding in source code

### Programmatic Usage

**JavaScript**
```javascript
// Basic stringify
JSON.stringify({ name: "Alice", age: 30 });
// '{"name":"Alice","age":30}'

// With indentation
JSON.stringify(data, null, 2);

// With replacer (filter properties)
JSON.stringify(data, ["name", "email"]);

// With replacer function
JSON.stringify(data, (key, value) =>
  typeof value === 'string' ? value.toUpperCase() : value
);
```

**Python**
```python
import json
json_string = json.dumps(data, ensure_ascii=False)
```

### Pro Tips

- 💡 **Circular references** — `JSON.stringify()` throws on circular references; use a replacer to handle them
- 💡 **Undefined values** — Properties with `undefined` values are silently omitted
- 💡 **Date objects** — Dates are serialized as ISO strings, not Date objects

### Related Tools

- **JSON Escape** — Escape JSON for embedding
- **JSON Unescape** — Reverse stringification
- **JSON Validator** — Validate the stringified output

---

## 中文

### 什么是 JSON 字符串化？

JSON 字符串化（Stringify）将 JavaScript 对象或 JSON 值转换为 JSON 格式的字符串。这是序列化数据以进行存储、传输或嵌入的标准方法。本工具还可以将 JSON 文档转换为适合在代码中使用的字符串表示。

### 字符串化前后对比

**JSON 对象：**
```json
{
  "name": "Alice",
  "scores": [95, 87, 92]
}
```

**字符串化后：**
```
"{\n  \"name\": \"Alice\",\n  \"scores\": [95, 87, 92]\n}"
```

### 常见使用场景

- **API 请求** — 为 `fetch()` 或 `XMLHttpRequest` 的请求体序列化对象
- **localStorage** — 将对象以 JSON 字符串形式存储在浏览器存储中
- **日志记录** — 将对象转换为可读字符串用于控制台输出
- **代码生成** — 生成 JSON 字符串字面量用于嵌入源代码

### 使用技巧

- 💡 **循环引用** — `JSON.stringify()` 遇到循环引用会抛出错误，需使用 replacer 处理
- 💡 **undefined 值** — 值为 `undefined` 的属性会被静默忽略
- 💡 **Date 对象** — 日期会被序列化为 ISO 格式字符串，而非 Date 对象

