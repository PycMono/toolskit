# JSON 数据类型详解

> **分类**：基础入门　|　**级别**：入门　|　**标签**：JSON, 数据类型, 字符串, 数值, 布尔

## 概述

JSON 定义了六种数据类型，理解每种类型的特征和限制是正确使用 JSON 的基础。

## 六种数据类型

### 1. 字符串（String）

JSON 字符串是由双引号包裹的 Unicode 字符序列。

```json
{
  "simple": "Hello, World!",
  "chinese": "你好，世界！",
  "empty": "",
  "escaped": "Line 1\nLine 2\tTabbed",
  "unicode": "\u0048\u0065\u006C\u006C\u006F",
  "path": "C:\\Users\\Documents\\file.json",
  "quote": "She said \"goodbye\""
}
```

**字符串规则：**
- 必须使用双引号（不能用单引号）
- 支持 Unicode（UTF-8 编码）
- 特殊字符需要用反斜杠转义
- 不能包含未转义的控制字符（U+0000 到 U+001F）

### 2. 数值（Number）

JSON 数值支持整数和浮点数，使用十进制表示。

```json
{
  "integer": 42,
  "negative": -273,
  "zero": 0,
  "float": 3.14159265,
  "scientific": 6.022e23,
  "negExp": 1.6e-19,
  "small": 0.001
}
```

**数值规则：**
- 不支持前导零（`07` 不合法，`0.7` 合法）
- 不支持正号（`+3` 不合法）
- 不支持十六进制（`0xFF` 不合法）
- 不支持八进制（`0o77` 不合法）
- `NaN`、`Infinity`、`-Infinity` 不合法
- 没有整数/浮点数的区分，统一为 number
- 精度取决于解析器的实现（通常为 IEEE 754 双精度）

**精度警告：**

```json
{
  "safe": 9007199254740991,
  "unsafe": 9007199254740993
}
```

超过 `2^53 - 1`（9007199254740991）的整数在 JavaScript 中可能丢失精度。对于大整数，建议使用字符串表示。

### 3. 布尔值（Boolean）

```json
{
  "isActive": true,
  "isDeleted": false
}
```

**布尔值规则：**
- 只有 `true` 和 `false` 两个值
- **必须小写**（`True`、`FALSE`、`TRUE` 都不合法）

### 4. null

```json
{
  "middleName": null,
  "deletedAt": null
}
```

**null 规则：**
- 表示空值或未知值
- **必须小写**（`Null`、`NULL`、`None` 都不合法）
- 与空字符串 `""` 和数值 `0` 含义不同

### 5. 对象（Object）

```json
{
  "user": {
    "id": 1,
    "name": "Alice",
    "address": {
      "city": "Beijing",
      "zip": "100000"
    }
  }
}
```

**对象规则：**
- 用花括号 `{}` 包裹
- 键必须是字符串（双引号）
- 键和值用冒号分隔
- 键值对之间用逗号分隔
- RFC 8259 建议键名唯一（但不强制）
- 键值对无固定顺序

### 6. 数组（Array）

```json
{
  "numbers": [1, 2, 3, 4, 5],
  "mixed": ["text", 42, true, null, {"key": "value"}, [1, 2]],
  "empty": [],
  "matrix": [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
  ]
}
```

**数组规则：**
- 用方括号 `[]` 包裹
- 元素之间用逗号分隔
- 元素可以是任何 JSON 类型
- 同一数组中可以混合不同类型
- 有序的（顺序有意义）

## 类型对比表

| 类型 | 字面量示例 | 对应 JavaScript 类型 | 对应 Python 类型 | 对应 Go 类型 |
|------|----------|--------------------|-----------------| ------------|
| String | `"hello"` | `string` | `str` | `string` |
| Number | `42` | `number` | `int`/`float` | `float64` |
| Boolean | `true` | `boolean` | `bool` | `bool` |
| Null | `null` | `null` | `None` | `nil` |
| Object | `{}` | `Object` | `dict` | `map[string]interface{}` |
| Array | `[]` | `Array` | `list` | `[]interface{}` |

## JSON 不支持的类型

以下是 JSON **不支持**但常见编程语言支持的类型：

| 不支持类型 | 常见替代方案 |
|-----------|------------|
| 日期/时间 | ISO 8601 字符串：`"2025-01-15T10:30:00Z"` |
| 二进制数据 | Base64 编码字符串 |
| 正则表达式 | 字符串表示：`"^\\d{3}-\\d{4}$"` |
| undefined | 使用 `null` 或省略该字段 |
| 函数 | 不可序列化 |
| Symbol | 不可序列化 |
| BigInt | 字符串表示：`"9007199254740993"` |
| 注释 | 使用 `"_comment"` 字段 |
| 集合（Set） | 使用数组 |
| 元组（Tuple） | 使用数组 |

## 实际应用：设计 JSON 数据结构

一个结合所有类型的真实 API 响应示例：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "user": {
      "id": 10086,
      "username": "developer",
      "email": "dev@example.com",
      "isVerified": true,
      "avatar": null,
      "roles": ["admin", "editor"],
      "profile": {
        "bio": "Full-stack developer",
        "social": {
          "github": "https://github.com/dev",
          "twitter": null
        }
      },
      "createdAt": "2024-03-15T08:00:00Z",
      "loginCount": 1024
    }
  },
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 156,
    "hasMore": true
  }
}
```

## 小结

- JSON 有且仅有六种数据类型：字符串、数值、布尔值、null、对象、数组
- 字符串必须用双引号，特殊字符需转义
- 数值不支持前导零、十六进制、NaN
- 布尔值和 null 必须小写
- 对象键名必须唯一且为字符串
- 数组元素有序，可混合类型
- 日期、二进制等不支持的类型通常用字符串替代

## 下一步

继续阅读 [JSON 对象深入理解](/json/learn#article-4)，掌握对象的高级用法和设计模式。
