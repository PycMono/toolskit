# JSON 语法规则权威指南

> **分类**：基础入门　|　**级别**：入门　|　**标签**：JSON, 语法, 规则, RFC 8259

## JSON 语法概述

JSON 的语法规则极其简洁，只需记住少数几条核心规则。本文将完整覆盖 RFC 8259 标准中规定的所有语法要求。

## 核心语法规则

### 规则 1：数据以键值对形式存在

JSON 对象中的每个数据项都是一个键值对，键和值之间用冒号 `:` 分隔：

```json
{
  "key": "value"
}
```

### 规则 2：键名必须是双引号字符串

```json
// ✅ 正确
{ "name": "Alice" }

// ❌ 错误：单引号
{ 'name': 'Alice' }

// ❌ 错误：无引号
{ name: "Alice" }
```

### 规则 3：数据项之间用逗号分隔

```json
{
  "name": "Alice",
  "age": 25,
  "city": "Beijing"
}
```

### 规则 4：最后一项不能有尾随逗号

```json
// ✅ 正确
{ "a": 1, "b": 2 }

// ❌ 错误：尾随逗号
{ "a": 1, "b": 2, }
```

### 规则 5：花括号包裹对象，方括号包裹数组

```json
{
  "object": { "nested": true },
  "array": [1, 2, 3]
}
```

## 字符串规则

字符串必须用**双引号**包裹，以下字符需要转义：

| 转义序列 | 含义 |
|---------|------|
| `\"` | 双引号 |
| `\\` | 反斜杠 |
| `\/` | 正斜杠（可选转义） |
| `\b` | 退格符 |
| `\f` | 换页符 |
| `\n` | 换行符 |
| `\r` | 回车符 |
| `\t` | 制表符 |
| `\uXXXX` | Unicode 字符 |

```json
{
  "quote": "He said \"hello\"",
  "path": "C:\\Users\\admin",
  "newline": "Line 1\nLine 2",
  "unicode": "\u4F60\u597D",
  "emoji": "\uD83D\uDE00"
}
```

## 数值规则

JSON 数值遵循以下规则：

```json
{
  "integer": 42,
  "negative": -17,
  "float": 3.14159,
  "exponent": 2.5e10,
  "negativeExp": 1.23e-4
}
```

**禁止的数值格式：**

```json
// ❌ 前导零
{ "bad": 07 }

// ❌ 正号
{ "bad": +3 }

// ❌ 十六进制
{ "bad": 0xFF }

// ❌ NaN 和 Infinity
{ "bad": NaN }
{ "bad": Infinity }

// ❌ 小数点开头
{ "bad": .5 }
```

## 空白字符

JSON 允许在以下位置使用空白字符（空格、制表符、换行符、回车符）：

- 值之前和之后
- 名称分隔符（冒号）之前和之后
- 值分隔符（逗号）之前和之后
- 花括号和方括号之前和之后

```json
{"compact":true,"spaces":false}

{
  "readable" : true ,
  "spaces"   : true
}
```

以上两种格式在语法上完全等价。

## 编码要求

根据 RFC 8259 规范：

- JSON 文本**必须**使用 UTF-8 编码（在网络传输中）
- JSON 文本**不应**包含 BOM（字节顺序标记）
- JSON 文本可以是任何 JSON 值（不限于对象或数组）

```
// ✅ 以下都是合法的 JSON 文本
"Hello"
42
true
null
[1, 2, 3]
{"key": "value"}
```

## JSON 语法的 ABNF 形式化定义

RFC 8259 使用 ABNF 语法定义了 JSON 的完整文法：

```
json-text = ws value ws

value = false / null / true / object / array / number / string

object = begin-object [ member *( value-separator member ) ] end-object
member = string name-separator value

array = begin-array [ value *( value-separator value ) ] end-array
```

## 常见语法陷阱

### 陷阱 1：单引号

```json
// ❌ Python 开发者常犯
{'name': 'Alice'}

// ✅ 正确
{"name": "Alice"}
```

### 陷阱 2：注释

```json
// ❌ JSON 不支持注释
{
  // 这是用户名
  "name": "Alice"
}
```

### 陷阱 3：尾随逗号

```json
// ❌ JavaScript 开发者常犯
{
  "items": [1, 2, 3,]
}
```

### 陷阱 4：未转义的特殊字符

```json
// ❌ 字符串中的未转义换行
{
  "text": "line 1
  line 2"
}

// ✅ 正确
{
  "text": "line 1\nline 2"
}
```

## 验证工具推荐

- **在线验证**：ToolboxNova JSON Validator
- **命令行**：`python -m json.tool file.json`
- **编辑器插件**：VSCode 内置 JSON 验证

## 小结

| 规则 | 说明 |
|------|------|
| 键名 | 必须使用双引号 |
| 字符串 | 只能使用双引号 |
| 逗号 | 项之间必须有，最后一项不能有 |
| 注释 | 不支持 |
| 编码 | UTF-8 |
| 数值 | 不支持前导零、十六进制、NaN、Infinity |
| 空白 | 在标记之间可自由使用 |

## 下一步

继续阅读 [JSON 数据类型详解](/json/learn#article-3)，全面了解每种数据类型的使用方式和注意事项。
