# JSON Schema 进阶：组合、引用与条件验证

> **分类**：高级主题　|　**级别**：高级　|　**标签**：JSON Schema, $ref, allOf, oneOf, if-then-else

## 组合关键字

JSON Schema 提供四个逻辑组合关键字，用于构建复杂的校验规则：

### allOf：同时满足

数据必须满足 **所有** 子 Schema：

```json
{
  "allOf": [
    { "type": "object", "required": ["name"] },
    { "type": "object", "required": ["email"] },
    {
      "properties": {
        "name": { "type": "string" },
        "email": { "type": "string", "format": "email" }
      }
    }
  ]
}
```

常见场景：Schema 继承——基础 Schema + 扩展字段。

### anyOf：满足任一

数据满足 **至少一个** 子 Schema 即可：

```json
{
  "anyOf": [
    { "type": "string", "minLength": 5 },
    { "type": "number", "minimum": 0 }
  ]
}
```

> 与 `oneOf` 的区别：`anyOf` 允许同时满足多个，`oneOf` 要求恰好满足一个。

### oneOf：恰好满足一个

```json
{
  "oneOf": [
    { "type": "integer" },
    { "type": "string", "pattern": "^\\d+$" }
  ]
}
```

注意：值 `42` 同时满足两者（`integer` 和 `"42"` 的 pattern），如果一个值能匹配多个子 Schema，`oneOf` 会失败。设计时要确保子 Schema 互斥。

### not：取反

```json
{
  "not": { "type": "null" }
}
```

表示值不能是 `null`。`not` 通常和其他关键字配合使用：

```json
{
  "type": "string",
  "not": { "enum": ["admin", "root"] }
}
```

## 条件验证：if / then / else

当数据结构取决于某个字段的值时，条件验证非常有用：

```json
{
  "type": "object",
  "properties": {
    "userType": { "type": "string", "enum": ["personal", "company"] }
  },
  "required": ["userType"],

  "if": {
    "properties": { "userType": { "const": "company" } }
  },
  "then": {
    "required": ["companyName", "taxId"],
    "properties": {
      "companyName": { "type": "string", "minLength": 1 },
      "taxId": { "type": "string", "pattern": "^[0-9A-Z]{15,20}$" }
    }
  },
  "else": {
    "required": ["firstName", "lastName"],
    "properties": {
      "firstName": { "type": "string" },
      "lastName": { "type": "string" }
    }
  }
}
```

实际效果：
- 当 `userType` 为 `"company"` 时，必须填 `companyName` 和 `taxId`
- 否则，必须填 `firstName` 和 `lastName`

### 多条件链

可以在 `allOf` 中嵌套多个 `if/then`：

```json
{
  "allOf": [
    {
      "if": { "properties": { "paymentMethod": { "const": "credit_card" } } },
      "then": { "required": ["cardNumber", "cvv", "expiry"] }
    },
    {
      "if": { "properties": { "paymentMethod": { "const": "bank_transfer" } } },
      "then": { "required": ["bankName", "accountNumber", "routingNumber"] }
    }
  ]
}
```

## $ref 引用与 $defs 复用

大型项目中，Schema 会有大量重复定义。`$ref` 允许引用其他 Schema：

### 内部引用

```json
{
  "$defs": {
    "address": {
      "type": "object",
      "required": ["street", "city", "country"],
      "properties": {
        "street": { "type": "string" },
        "city": { "type": "string" },
        "zipCode": { "type": "string", "pattern": "^\\d{5,6}$" },
        "country": { "type": "string", "minLength": 2, "maxLength": 2 }
      }
    }
  },
  "type": "object",
  "properties": {
    "homeAddress": { "$ref": "#/$defs/address" },
    "workAddress": { "$ref": "#/$defs/address" },
    "shippingAddress": { "$ref": "#/$defs/address" }
  }
}
```

`#/$defs/address` 表示当前文档中 `$defs.address` 的路径（JSON Pointer 格式）。

### 外部引用

```json
{
  "properties": {
    "address": { "$ref": "https://example.com/schemas/address.json" },
    "payment": { "$ref": "./payment.schema.json#/$defs/creditCard" }
  }
}
```

支持绝对 URL 和相对路径，方便将 Schema 拆分为独立文件管理。

### 引用 + 覆盖

`$ref` 可以和其他关键字组合（Draft 2019-09+）：

```json
{
  "properties": {
    "shippingAddress": {
      "$ref": "#/$defs/address",
      "required": ["street", "city", "country", "phone"],
      "properties": {
        "phone": { "type": "string" }
      }
    }
  }
}
```

在引用 `address` 的基础上，增加了 `phone` 字段要求。

## 递归 Schema

描述树形结构（如文件目录、评论嵌套）：

```json
{
  "$defs": {
    "node": {
      "type": "object",
      "required": ["name"],
      "properties": {
        "name": { "type": "string" },
        "children": {
          "type": "array",
          "items": { "$ref": "#/$defs/node" }
        }
      }
    }
  },
  "$ref": "#/$defs/node"
}
```

验证数据：

```json
{
  "name": "root",
  "children": [
    { "name": "child-1", "children": [] },
    {
      "name": "child-2",
      "children": [
        { "name": "grandchild-1" }
      ]
    }
  ]
}
```

## 实战：电商订单 Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Order",
  "type": "object",
  "required": ["orderId", "customer", "items", "payment"],
  "properties": {
    "orderId": { "type": "string", "pattern": "^ORD-\\d{8,}$" },
    "customer": { "$ref": "#/$defs/customer" },
    "items": {
      "type": "array",
      "minItems": 1,
      "items": { "$ref": "#/$defs/orderItem" }
    },
    "payment": { "$ref": "#/$defs/payment" },
    "notes": { "type": "string", "maxLength": 500 }
  },
  "$defs": {
    "customer": {
      "type": "object",
      "required": ["id", "name", "email"],
      "properties": {
        "id": { "type": "integer" },
        "name": { "type": "string", "minLength": 1 },
        "email": { "type": "string", "format": "email" }
      }
    },
    "orderItem": {
      "type": "object",
      "required": ["productId", "name", "quantity", "price"],
      "properties": {
        "productId": { "type": "string" },
        "name": { "type": "string" },
        "quantity": { "type": "integer", "minimum": 1 },
        "price": { "type": "number", "minimum": 0, "multipleOf": 0.01 }
      }
    },
    "payment": {
      "type": "object",
      "required": ["method", "amount"],
      "properties": {
        "method": { "enum": ["credit_card", "alipay", "wechat_pay", "bank_transfer"] },
        "amount": { "type": "number", "minimum": 0.01 }
      },
      "if": { "properties": { "method": { "const": "credit_card" } } },
      "then": { "required": ["method", "amount", "cardLast4"] },
      "else": {}
    }
  }
}
```

## 常用验证库对比

| 语言 | 库 | Draft 2020-12 | 特点 |
|------|-----|:---:|------|
| JavaScript | ajv | ✓ | 最快的 JS 验证器，支持代码生成 |
| Python | jsonschema | ✓ | 标准库风格，纯 Python |
| Go | santhosh-tekuri/jsonschema | ✓ | 高性能，完整规范支持 |
| Java | networknt/json-schema-validator | ✓ | 与 Jackson 深度集成 |
| Rust | jsonschema-rs | ✓ | Rust 原生，极致性能 |

## 小结

- `allOf` / `anyOf` / `oneOf` / `not` 构建复杂逻辑
- `if` / `then` / `else` 实现字段间的条件依赖
- `$ref` + `$defs` 实现 Schema 模块化复用
- 递归引用可以描述树形嵌套结构
- 大型项目建议拆分 Schema 文件，用外部引用组织
