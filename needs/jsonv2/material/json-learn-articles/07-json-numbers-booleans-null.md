# JSON 数值、布尔值与 Null 完全指南

> **分类**：基础入门　|　**级别**：入门　|　**标签**：JSON, 数值, 布尔值, null, 精度

## JSON 数值（Number）

### 合法的数值格式

```json
{
  "integer": 42,
  "negative": -17,
  "zero": 0,
  "float": 3.14,
  "scientific": 6.022e23,
  "negExponent": 1.6e-19,
  "posExponent": 2.5E+10
}
```

### 不合法的数值格式

```json
// 以下全部不合法：
07          // 前导零
+3          // 正号
0xFF        // 十六进制
0b1010      // 二进制
0o17        // 八进制
.5          // 小数点开头
5.          // 小数点结尾
NaN         // 非数字
Infinity    // 无穷大
-Infinity   // 负无穷大
1_000_000   // 数字分隔符
```

### 数值精度问题

JSON 规范不限制数值精度，但实际解析器通常使用 IEEE 754 双精度浮点数：

**安全整数范围：**
```
最小安全整数：-9007199254740991 (-2^53 + 1)
最大安全整数：9007199254740991 (2^53 - 1)
```

**精度丢失示例：**

```javascript
// JavaScript
JSON.parse("9007199254740993")  // → 9007199254740992（精度丢失！）
JSON.parse("0.1")              // → 0.1（实际是 0.1000000000000000055511151231257827021181583404541015625）
```

**大数值解决方案：**

```json
{
  "orderId_safe": "9007199254740993",
  "amount_safe": "99999999999999999.99",
  
  "orderId_unsafe": 9007199254740993,
  "amount_unsafe": 99999999999999999.99
}
```

### 各语言的数值解析

| 语言 | 默认解析为 | 大整数方案 |
|------|----------|-----------|
| JavaScript | `number`（float64） | `BigInt` / 字符串 |
| Python | `int` 或 `float` | 原生支持大整数 |
| Go | `float64` | `json.Number` / `big.Int` |
| Java | `int`/`long`/`double` | `BigDecimal` / `BigInteger` |
| C# | `int`/`long`/`double` | `decimal` / `BigInteger` |

### 货币处理建议

不要用浮点数表示货币：

```json
{
  "bad": { "amount": 19.99, "currency": "USD" },
  "good_cents": { "amountCents": 1999, "currency": "USD" },
  "good_string": { "amount": "19.99", "currency": "USD" }
}
```

## JSON 布尔值（Boolean）

### 基本用法

```json
{
  "isActive": true,
  "isDeleted": false,
  "hasPermission": true,
  "emailVerified": false
}
```

### 严格的语法要求

```json
// ✅ 正确（只有这两种写法）
true
false

// ❌ 全部错误
True     // 首字母大写
FALSE    // 全大写
TRUE     // 全大写
"true"   // 字符串，不是布尔值
1        // 数字 1 不是 true
0        // 数字 0 不是 false
yes      // 不是合法 JSON 值
no       // 不是合法 JSON 值
```

### 命名约定

布尔值字段建议用 `is`、`has`、`can`、`should` 等前缀：

```json
{
  "isEnabled": true,
  "hasAccess": false,
  "canEdit": true,
  "shouldNotify": false,
  "allowPublic": true
}
```

## JSON Null

### 基本用法

```json
{
  "middleName": null,
  "deletedAt": null,
  "avatar": null
}
```

### null vs 缺失字段

```json
{
  "user_with_null": {
    "name": "Alice",
    "phone": null
  },
  "user_without_field": {
    "name": "Alice"
  }
}
```

- `"phone": null` — 字段存在，值为空
- 没有 `phone` — 字段不存在

在不同场景下含义可能不同，API 设计时需要明确语义。

### null 的常见用途

1. **表示未知值**：`"birthdate": null`
2. **表示未设置**：`"avatar": null`
3. **表示已删除**：`"deletedAt": null`（软删除）
4. **API 补丁操作**：`PATCH` 请求中 `null` 表示清空字段

### 各语言中的 null 映射

| 语言 | null 对应值 |
|------|-----------|
| JavaScript | `null` |
| Python | `None` |
| Go | `nil`（指针类型） |
| Java | `null` |
| Ruby | `nil` |
| Rust | `None`（Option 类型） |
| Swift | `nil` |

## 类型混淆陷阱

```json
{
  "string_zero": "0",
  "number_zero": 0,
  "boolean_false": false,
  "null_value": null,
  "empty_string": "",
  "empty_array": [],
  "empty_object": {}
}
```

以上七个值在 JSON 中完全不同，不要混淆。在 JavaScript 中，它们的真值判断也各不相同。

## 小结

- 数值不支持前导零、正号、十六进制、NaN、Infinity
- 超过 2^53 的整数建议用字符串
- 货币不要用浮点数
- 布尔值只有 `true`/`false`（小写）
- `null` 表示空值（小写），与缺失字段含义不同
- 不同类型的"空值"（`0`、`""`、`null`、`false`、`[]`、`{}`）语义不同
