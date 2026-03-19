# JSON 字符串与转义字符详解

> **分类**：基础入门　|　**级别**：入门　|　**标签**：JSON, 字符串, 转义, Unicode, 编码

## JSON 字符串基础

JSON 字符串是由双引号包裹的 Unicode 字符序列。它是 JSON 中最常用的数据类型，也是唯一可以作为对象键名的类型。

## 转义字符完全列表

JSON 定义了以下转义序列：

```json
{
  "doubleQuote": "She said \"hello\"",
  "backslash": "C:\\Users\\admin\\file.json",
  "forwardSlash": "date: 2025\/01\/15",
  "backspace": "back\bspace",
  "formFeed": "form\ffeed",
  "newline": "line1\nline2",
  "carriageReturn": "return\rhere",
  "tab": "col1\tcol2",
  "unicode4": "\u0041\u0042\u0043",
  "unicodeChinese": "\u4F60\u597D\u4E16\u754C"
}
```

## Unicode 转义

`\uXXXX` 格式可以表示任何 Unicode 字符（BMP 范围 U+0000 到 U+FFFF）：

```json
{
  "letterA": "\u0041",
  "copyright": "\u00A9",
  "chinese": "\u4E2D\u6587",
  "japanese": "\u65E5\u672C\u8A9E",
  "korean": "\uD55C\uAD6D\uC5B4"
}
```

### 补充平面字符（Emoji 等）

对于 U+FFFF 以上的字符（如 Emoji），需要使用 UTF-16 代理对：

```json
{
  "smile": "\uD83D\uDE00",
  "heart": "\uD83D\uDC96",
  "flag": "\uD83C\uDDE8\uD83C\uDDF3"
}
```

在大多数现代解析器中，可以直接使用 UTF-8 字符：

```json
{
  "smile": "😀",
  "heart": "💖"
}
```

## 必须转义的字符

以下字符在 JSON 字符串中**必须**转义：

| 字符 | Unicode | 转义写法 |
|------|---------|---------|
| 双引号 `"` | U+0022 | `\"` |
| 反斜杠 `\` | U+005C | `\\` |
| 控制字符 U+0000 到 U+001F | — | `\uXXXX` |

控制字符包括：

```
U+0000 到 U+001F（共 32 个控制字符）
常见的有：
  \u0000 NUL（空字符）
  \u0009 TAB（制表符）→ 也可写 \t
  \u000A LF（换行）→ 也可写 \n
  \u000D CR（回车）→ 也可写 \r
```

## 多行字符串

JSON 不支持多行字符串字面量。表示多行文本的方式：

```json
{
  "method1_escape": "第一行\n第二行\n第三行",
  "method2_array": [
    "第一行",
    "第二行",
    "第三行"
  ]
}
```

## 字符串编码最佳实践

### 日期时间

```json
{
  "iso8601": "2025-01-15T10:30:00Z",
  "withTimezone": "2025-01-15T18:30:00+08:00",
  "dateOnly": "2025-01-15",
  "timeOnly": "10:30:00"
}
```

### URL 和路径

```json
{
  "url": "https://example.com/path?q=hello&lang=zh",
  "windowsPath": "C:\\Users\\admin\\Documents",
  "unixPath": "/home/user/documents"
}
```

### HTML 内容

```json
{
  "html": "<p class=\"highlight\">Hello <strong>World</strong></p>"
}
```

### Base64 编码的二进制数据

```json
{
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "certificate": "LS0tLS1CRUdJTi..."
}
```

## 常见错误

```json
// ❌ 单引号
{ "name": 'Alice' }

// ❌ 未转义的换行
{ "text": "line1
line2" }

// ❌ 未转义的制表符（实际的 Tab 字符）
{ "text": "col1	col2" }

// ❌ 未转义的反斜杠
{ "path": "C:\Users\admin" }

// ✅ 正确
{ "path": "C:\\Users\\admin" }
```

## 各语言的字符串处理

| 语言 | 序列化 | 反序列化 |
|------|--------|---------|
| JavaScript | `JSON.stringify(str)` | `JSON.parse(str)` |
| Python | `json.dumps(str)` | `json.loads(str)` |
| Go | `json.Marshal(str)` | `json.Unmarshal(data, &str)` |
| Java | `mapper.writeValueAsString(str)` | `mapper.readValue(str, String.class)` |

## 小结

- JSON 字符串必须用双引号包裹
- 双引号、反斜杠和控制字符必须转义
- Unicode 字符用 `\uXXXX` 表示
- 补充平面字符（Emoji）需要代理对或直接 UTF-8
- 不支持多行字符串字面量
- 日期建议用 ISO 8601 格式
