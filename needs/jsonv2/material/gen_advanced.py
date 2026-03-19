#!/usr/bin/env python3
"""Generate all 22 advanced-level JSON tutorial articles (32-53) with rich content."""
import os

OUT = "/home/claude/json-learn-articles"

articles = {}

# ── 32 ──────────────────────────────────────────────
articles["32-json-schema-intro.md"] = r'''# JSON Schema 入门：用 JSON 描述和验证 JSON

> **分类**：高级主题　|　**级别**：高级　|　**标签**：JSON Schema, 验证, Draft 2020-12

## 为什么需要 JSON Schema

在团队协作和 API 对接中，一个常见的痛点是：**JSON 数据的结构没有约束**。前端传来的数据缺少字段、类型不对、格式错误……这些问题往往在运行时才暴露。

JSON Schema 正是解决这个问题的工具。它用 **JSON 本身**来描述 JSON 应该长什么样——哪些字段必填、值是什么类型、长度范围多少、满足什么格式。

```
JSON Schema 就像数据库的 DDL (CREATE TABLE)，
但它描述的不是表结构，而是 JSON 文档的结构。
```

## 第一个 Schema

假设我们有一个用户注册 API，要求请求体包含 `name`（字符串）、`email`（邮箱格式）和可选的 `age`（正整数）：

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/user.schema.json",
  "title": "User Registration",
  "description": "用户注册请求体",
  "type": "object",
  "required": ["name", "email"],
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100,
      "description": "用户姓名"
    },
    "email": {
      "type": "string",
      "format": "email",
      "description": "邮箱地址"
    },
    "age": {
      "type": "integer",
      "minimum": 1,
      "maximum": 150,
      "description": "年龄（可选）"
    }
  },
  "additionalProperties": false
}
```

关键字段解读：

- `$schema`：声明使用的 JSON Schema 版本（推荐 Draft 2020-12）
- `$id`：Schema 的唯一标识 URI
- `type`：根级数据类型，这里是 `object`
- `required`：必填字段数组
- `properties`：各字段的约束定义
- `additionalProperties: false`：禁止出现未定义的字段

## 类型系统详解

JSON Schema 支持 6 种基本类型：

```json
{ "type": "string" }     // 字符串
{ "type": "number" }     // 数字（含小数）
{ "type": "integer" }    // 整数
{ "type": "boolean" }    // 布尔值
{ "type": "array" }      // 数组
{ "type": "object" }     // 对象
{ "type": "null" }       // null
```

允许多种类型：

```json
{ "type": ["string", "null"] }
```

## 字符串约束

```json
{
  "type": "string",
  "minLength": 1,
  "maxLength": 255,
  "pattern": "^[A-Za-z0-9_]+$",
  "format": "email"
}
```

常用 `format` 值：

| format | 含义 | 示例 |
|--------|------|------|
| `email` | 邮箱地址 | `user@example.com` |
| `uri` | URI 地址 | `https://example.com` |
| `date` | ISO 日期 | `2025-01-15` |
| `date-time` | ISO 日期时间 | `2025-01-15T08:30:00Z` |
| `ipv4` | IPv4 地址 | `192.168.1.1` |
| `uuid` | UUID | `550e8400-e29b-41d4-a716-446655440000` |
| `regex` | 正则表达式 | `^\\d+$` |

> **注意**：`format` 关键字默认只做标注，不做验证。需要在验证器中显式开启 format 校验（如 ajv 的 `ajv-formats` 插件）。

## 数值约束

```json
{
  "type": "number",
  "minimum": 0,
  "maximum": 100,
  "exclusiveMinimum": 0,
  "multipleOf": 0.01
}
```

- `minimum` / `maximum`：闭区间，包含端点
- `exclusiveMinimum` / `exclusiveMaximum`：开区间，不包含端点
- `multipleOf`：必须是该值的倍数（`0.01` 表示最多两位小数）

## 对象约束

```json
{
  "type": "object",
  "required": ["id", "name"],
  "properties": {
    "id": { "type": "integer" },
    "name": { "type": "string" },
    "metadata": { "type": "object" }
  },
  "additionalProperties": false,
  "minProperties": 1,
  "maxProperties": 50,
  "patternProperties": {
    "^x-": { "type": "string" }
  }
}
```

- `patternProperties`：用正则匹配字段名，如所有 `x-` 开头的自定义字段必须是字符串

## 数组约束

```json
{
  "type": "array",
  "items": { "type": "string" },
  "minItems": 1,
  "maxItems": 100,
  "uniqueItems": true,
  "contains": {
    "type": "string",
    "const": "admin"
  }
}
```

- `items`：定义数组元素的 Schema
- `uniqueItems`：元素是否必须唯一
- `contains`：数组中至少包含一个匹配的元素

## 枚举与常量

```json
{ "enum": ["active", "inactive", "suspended"] }

{ "const": "v2" }
```

## 实战验证：JavaScript（ajv）

```javascript
const Ajv = require("ajv");
const addFormats = require("ajv-formats");

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const schema = {
  type: "object",
  required: ["name", "email"],
  properties: {
    name: { type: "string", minLength: 1 },
    email: { type: "string", format: "email" },
    age: { type: "integer", minimum: 1 }
  },
  additionalProperties: false
};

const validate = ajv.compile(schema);

// 测试合法数据
console.log(validate({ name: "Alice", email: "alice@example.com" }));
// true

// 测试非法数据
validate({ name: "", email: "not-email", extra: 1 });
console.log(validate.errors);
// [
//   { keyword: 'minLength', message: '...' },
//   { keyword: 'format', message: '...' },
//   { keyword: 'additionalProperties', message: '...' }
// ]
```

## 实战验证：Python（jsonschema）

```python
from jsonschema import validate, ValidationError, Draft202012Validator

schema = {
    "type": "object",
    "required": ["name", "email"],
    "properties": {
        "name": {"type": "string", "minLength": 1},
        "email": {"type": "string", "format": "email"},
        "age": {"type": "integer", "minimum": 1}
    },
    "additionalProperties": False
}

# 单次验证
try:
    validate(instance={"name": "Alice", "email": "a@b.com"}, schema=schema)
    print("验证通过 ✓")
except ValidationError as e:
    print(f"验证失败: {e.message}")

# 收集所有错误
validator = Draft202012Validator(schema)
errors = list(validator.iter_errors({"name": "", "age": -1}))
for err in errors:
    print(f"  - {err.json_path}: {err.message}")
```

## 在 API 开发中的应用

JSON Schema 在 OpenAPI（Swagger）规范中被广泛使用：

```yaml
# openapi.yaml 片段
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
          format: email
```

许多 API 网关（Kong、AWS API Gateway）支持直接用 JSON Schema 做请求体校验，无需写业务代码。

## 小结

- JSON Schema 用 JSON 描述 JSON 的结构，实现声明式数据验证
- 支持类型、范围、格式、正则、枚举等丰富约束
- `required` 控制必填字段，`additionalProperties` 控制是否允许额外字段
- 主流语言都有成熟的验证库（ajv、jsonschema、gojsonschema）
- 在 OpenAPI/Swagger 中作为标准的数据模型描述语言
'''

# ── 33 ──────────────────────────────────────────────
articles["33-json-schema-advanced.md"] = r'''# JSON Schema 进阶：组合、引用与条件验证

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
'''

# ── 34 ──────────────────────────────────────────────
articles["34-jsonpath.md"] = r'''# JSONPath 查询语法完全指南

> **分类**：高级主题　|　**级别**：高级　|　**标签**：JSONPath, 查询, 数据提取, RFC 9535

## 什么是 JSONPath

JSONPath 是一种从 JSON 文档中提取数据的查询语言，类似于 XML 的 XPath。2024 年正式成为 IETF 标准（RFC 9535）。

假设你有一个包含 1000 个商品的 JSON，只需要提取所有价格大于 100 的商品名称——JSONPath 一行表达式就能搞定。

## 基本语法

以这个 JSON 为例：

```json
{
  "store": {
    "name": "TechShop",
    "books": [
      { "title": "JSON权威指南", "author": "张三", "price": 59.9, "isbn": "978-1-234" },
      { "title": "Go语言实战", "author": "李四", "price": 79.0, "isbn": "978-1-567" },
      { "title": "深入Rust", "author": "王五", "price": 128.0, "isbn": "978-1-890" }
    ],
    "electronics": [
      { "name": "键盘", "price": 299.0 },
      { "name": "鼠标", "price": 149.0 }
    ]
  }
}
```

### 核心操作符

| 表达式 | 含义 | 结果 |
|--------|------|------|
| `$` | 根节点 | 整个文档 |
| `$.store.name` | 点号取属性 | `"TechShop"` |
| `$['store']['name']` | 括号取属性 | `"TechShop"` |
| `$.store.books[0]` | 数组索引 | 第一本书 |
| `$.store.books[-1]` | 负索引 | 最后一本书 |
| `$.store.books[0,2]` | 多个索引 | 第1和第3本书 |
| `$.store.books[0:2]` | 切片 | 前2本书 |
| `$.store..price` | 递归下降 | 所有 price 值 |
| `$.store.books[*].title` | 通配符 | 所有书的标题 |

### 切片语法

```
[start:end:step]
```

| 表达式 | 含义 |
|--------|------|
| `[0:3]` | 索引 0、1、2 |
| `[1:]` | 从索引 1 到末尾 |
| `[:2]` | 前 2 个元素 |
| `[::2]` | 每隔一个取一个 |
| `[-2:]` | 最后 2 个元素 |

## 过滤表达式

过滤器是 JSONPath 最强大的功能，使用 `?()` 语法：

```
$.store.books[?(@.price > 100)]
```

`@` 表示当前元素。

### 常用过滤示例

```
# 价格大于 100 的书
$.store.books[?(@.price > 100)]

# 作者是"张三"的书
$.store.books[?(@.author == '张三')]

# 有 isbn 字段的书
$.store.books[?(@.isbn)]

# 价格在 50-100 之间的书
$.store.books[?(@.price >= 50 && @.price <= 100)]

# 标题包含"Go"的书
$.store.books[?(@.title =~ /Go/)]
```

### 过滤操作符

| 操作符 | 含义 |
|--------|------|
| `==`, `!=` | 等于、不等于 |
| `>`, `>=`, `<`, `<=` | 比较 |
| `&&` | 逻辑与 |
| `\|\|` | 逻辑或 |
| `!` | 逻辑非 |
| `=~` | 正则匹配（部分实现支持） |
| `in` | 包含于（部分实现支持） |

## 各语言实现

### JavaScript（jsonpath-plus）

```javascript
const { JSONPath } = require("jsonpath-plus");

const data = { /* 上面的 JSON */ };

// 所有价格
const prices = JSONPath({ path: "$.store..price", json: data });
console.log(prices); // [59.9, 79.0, 128.0, 299.0, 149.0]

// 价格大于 100 的书名
const expensive = JSONPath({
  path: '$.store.books[?(@.price > 100)].title',
  json: data
});
console.log(expensive); // ["深入Rust"]
```

### Python（jsonpath-ng）

```python
from jsonpath_ng.ext import parse

data = { ... }

# 所有书的标题
expr = parse("$.store.books[*].title")
titles = [match.value for match in expr.find(data)]
print(titles)  # ['JSON权威指南', 'Go语言实战', '深入Rust']

# 价格大于 100 的
expr = parse("$.store.books[?price > 100].title")
expensive = [m.value for m in expr.find(data)]
```

### 命令行（jq 中的等价操作）

```bash
# 所有价格（jq 不是 JSONPath，但功能类似）
echo "$JSON" | jq '.store | .. | .price? // empty'

# JSONPath CLI 工具
pip install jsonpath-ng
jsonpath "$.store.books[*].title" < data.json
```

## 实际应用场景

### 1. API 响应数据提取

```javascript
// 从分页 API 响应中提取用户邮箱
const emails = JSONPath({
  path: "$.data.users[*].email",
  json: apiResponse
});
```

### 2. 配置文件查询

```python
# 从复杂配置中提取所有数据库连接字符串
expr = parse("$.services[*].database.connectionString")
connections = [m.value for m in expr.find(config)]
```

### 3. 日志分析

```bash
# 提取所有错误级别的日志消息
cat logs.json | jsonpath '$.entries[?(@.level=="error")].message'
```

### 4. 测试断言

```javascript
// 在 API 测试中验证响应结构
const orderIds = JSONPath({ path: "$.orders[*].id", json: response });
expect(orderIds).toHaveLength(3);
expect(orderIds).toContain("ORD-001");
```

## JSONPath vs jq

| 维度 | JSONPath | jq |
|------|----------|----|
| 定位 | 查询语言 | 转换语言 |
| 标准化 | RFC 9535 | 无正式标准 |
| 功能 | 读取 / 过滤 | 读取 / 过滤 / 转换 / 构造 |
| 学习曲线 | 低 | 中高 |
| 嵌入性 | 适合嵌入应用 | 适合命令行 |

## 小结

- JSONPath 用类似 XPath 的语法从 JSON 中提取数据
- `$` 根节点、`.` 属性访问、`[*]` 通配、`..` 递归下降
- 过滤器 `?()` 支持条件筛选，是最强大的功能
- 已成为 IETF 标准（RFC 9535），各语言都有成熟实现
- 适合 API 响应处理、配置提取、测试断言等场景
'''

# ── 35 ──────────────────────────────────────────────
articles["35-jq-guide.md"] = r'''# jq 命令行 JSON 处理完全指南

> **分类**：高级主题　|　**级别**：高级　|　**标签**：jq, 命令行, JSON处理, 数据转换

## 什么是 jq

jq 是命令行下的 JSON 处理神器。它就像是 JSON 的 `sed` + `awk`：能查询、过滤、转换、构造 JSON 数据，而且无需写完整程序。

```bash
# 安装
# macOS
brew install jq
# Ubuntu/Debian
sudo apt install jq
# Windows
choco install jq
```

## 基础查询

```bash
# 美化输出
echo '{"name":"Alice","age":25}' | jq '.'

# 提取字段
echo '{"name":"Alice","age":25}' | jq '.name'
# "Alice"

# 提取嵌套字段
echo '{"user":{"name":"Alice","addr":{"city":"Beijing"}}}' | jq '.user.addr.city'
# "Beijing"

# 去掉字符串引号（raw output）
echo '{"name":"Alice"}' | jq -r '.name'
# Alice
```

## 数组操作

```bash
DATA='[{"name":"Alice","age":25},{"name":"Bob","age":30},{"name":"Carol","age":28}]'

# 取所有名字
echo "$DATA" | jq '.[].name'
# "Alice"
# "Bob"
# "Carol"

# 取第一个元素
echo "$DATA" | jq '.[0]'

# 切片
echo "$DATA" | jq '.[:2]'

# 数组长度
echo "$DATA" | jq 'length'
# 3
```

## 过滤与条件

```bash
# 年龄大于 25 的人
echo "$DATA" | jq '.[] | select(.age > 25)'

# 组合条件
echo "$DATA" | jq '.[] | select(.age > 25 and .name != "Bob")'

# 重新包装成数组
echo "$DATA" | jq '[.[] | select(.age > 25)]'
```

## 数据转换

### 构造新对象

```bash
echo "$DATA" | jq '.[] | { username: .name, birth_year: (2025 - .age) }'
# { "username": "Alice", "birth_year": 2000 }
# { "username": "Bob",   "birth_year": 1995 }
# ...
```

### map 和 map_values

```bash
# 对数组每个元素操作
echo "$DATA" | jq 'map({ name: .name, senior: (.age >= 28) })'

# 所有年龄加 1
echo "$DATA" | jq 'map(.age += 1)'
```

### 字符串操作

```bash
# 拼接字符串
echo '{"first":"John","last":"Doe"}' | jq '.first + " " + .last'
# "John Doe"

# 字符串插值
echo '{"name":"Alice","age":25}' | jq '"\(.name) is \(.age) years old"'
# "Alice is 25 years old"

# 分割和连接
echo '"a,b,c"' | jq 'split(",")'
# ["a","b","c"]
echo '["a","b","c"]' | jq 'join("-")'
# "a-b-c"
```

## 聚合函数

```bash
NUMS='[10, 20, 30, 40, 50]'

echo "$NUMS" | jq 'add'        # 150
echo "$NUMS" | jq 'min'        # 10
echo "$NUMS" | jq 'max'        # 50
echo "$NUMS" | jq 'add/length' # 30（平均值）

# 对象数组的聚合
echo "$DATA" | jq '[.[].age] | add / length'
# 27.666...
```

## 分组与排序

```bash
ITEMS='[
  {"category":"fruit","name":"apple","price":3},
  {"category":"fruit","name":"banana","price":2},
  {"category":"veggie","name":"carrot","price":4}
]'

# 按价格排序
echo "$ITEMS" | jq 'sort_by(.price)'

# 按类别分组
echo "$ITEMS" | jq 'group_by(.category) | map({ category: .[0].category, items: map(.name) })'
# [{"category":"fruit","items":["banana","apple"]}, ...]

# 去重
echo '[1,2,2,3,3,3]' | jq 'unique'
# [1,2,3]
```

## 高级技巧

### 处理文件

```bash
# 读取文件
jq '.users[] | select(.active)' users.json

# 输出到文件
jq '.data' input.json > output.json

# 紧凑输出（无换行）
jq -c '.' input.json
```

### 多文件合并

```bash
# 合并两个 JSON 对象
jq -s '.[0] * .[1]' defaults.json overrides.json

# 合并多个数组
jq -s 'add' file1.json file2.json file3.json
```

### 处理 NDJSON

```bash
# 逐行处理（默认行为）
cat events.ndjson | jq 'select(.level == "error")'

# 收集为数组
cat events.ndjson | jq -s '.'
```

### 条件赋值和更新

```bash
# 更新特定字段
echo '{"name":"Alice","status":"active"}' | jq '.status = "inactive"'

# 条件更新
echo "$DATA" | jq 'map(if .age > 28 then .category = "senior" else .category = "junior" end)'

# 删除字段
echo '{"a":1,"b":2,"c":3}' | jq 'del(.b)'
# {"a":1,"c":3}
```

### 环境变量和参数

```bash
# 传入外部变量
NAME="Alice"
echo "$DATA" | jq --arg name "$NAME" '.[] | select(.name == $name)'

# 传入 JSON 值
echo '{}' | jq --argjson count 42 '. + {count: $count}'
```

## 实战示例

### API 响应处理

```bash
# 从 GitHub API 提取仓库信息
curl -s 'https://api.github.com/users/torvalds/repos?per_page=5' | \
  jq '.[] | { name: .name, stars: .stargazers_count, language: .language }' 

# 按 star 数排序取 Top 3
curl -s 'https://api.github.com/users/torvalds/repos' | \
  jq 'sort_by(-.stargazers_count) | .[:3] | .[] | "\(.name): \(.stargazers_count) stars"'
```

### 日志分析

```bash
# 统计各级别日志数量
cat app.log.json | jq -s 'group_by(.level) | map({level: .[0].level, count: length})'

# 提取最近 10 条错误
cat app.log.json | jq -s '[.[] | select(.level=="error")] | sort_by(.timestamp) | .[-10:]'
```

### CSV 转换

```bash
# JSON 数组转 CSV
echo "$DATA" | jq -r '["name","age"], (.[] | [.name, .age]) | @csv'
# "name","age"
# "Alice",25
# "Bob",30
```

## 常用 jq 速查

| 操作 | 语法 |
|------|------|
| 美化 | `jq '.'` |
| 紧凑 | `jq -c '.'` |
| 提取字段 | `jq '.key'` |
| 数组元素 | `jq '.[0]'`、`jq '.[]'` |
| 过滤 | `jq '.[] \| select(.x > 1)'` |
| 构造对象 | `jq '{ a: .x, b: .y }'` |
| 排序 | `jq 'sort_by(.key)'` |
| 去重 | `jq 'unique'` |
| 长度 | `jq 'length'` |
| 键名 | `jq 'keys'` |
| 类型 | `jq 'type'` |
| 删除字段 | `jq 'del(.key)'` |

## 小结

- jq 是命令行下处理 JSON 的最佳工具
- 支持查询、过滤、转换、聚合、分组等全套操作
- `-r` 输出原始字符串，`-c` 紧凑输出，`-s` 收集为数组
- `select()` 过滤、`map()` 映射、`group_by()` 分组
- 结合 `curl` 可以快速处理 API 响应
'''

# ── 36 ──────────────────────────────────────────────
articles["36-jwt.md"] = r'''# JWT (JSON Web Token) 深入理解

> **分类**：高级主题　|　**级别**：高级　|　**标签**：JWT, 认证, Token, 安全

## 什么是 JWT

JWT（JSON Web Token）是一种紧凑的、URL 安全的令牌格式，用于在各方之间安全地传递 JSON 声明信息。它是现代 Web 应用中最流行的认证方案之一。

一个 JWT 看起来像这样：

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIiwiaWF0IjoxNjk5MDAwMDAwfQ.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

它由三部分组成，用 `.` 分隔：**Header.Payload.Signature**

## JWT 结构详解

### 1. Header（头部）

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

- `alg`：签名算法（HS256、RS256、ES256 等）
- `typ`：令牌类型，固定为 `"JWT"`

Header 被 Base64URL 编码后成为 JWT 的第一部分。

### 2. Payload（载荷）

```json
{
  "sub": "1234567890",
  "name": "Alice",
  "email": "alice@example.com",
  "role": "admin",
  "iat": 1699000000,
  "exp": 1699086400,
  "iss": "https://auth.example.com"
}
```

标准字段（Registered Claims）：

| 字段 | 全称 | 含义 |
|------|------|------|
| `sub` | Subject | 主题（通常是用户 ID） |
| `iss` | Issuer | 签发者 |
| `aud` | Audience | 接收方 |
| `exp` | Expiration | 过期时间（Unix 时间戳） |
| `iat` | Issued At | 签发时间 |
| `nbf` | Not Before | 生效时间 |
| `jti` | JWT ID | 唯一标识 |

> **重要**：Payload 是 Base64URL 编码的，**不是加密的**。任何人都可以解码看到内容。不要在 Payload 中放密码、密钥等敏感信息。

### 3. Signature（签名）

```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

签名确保令牌未被篡改。服务端用密钥验证签名，如果 Payload 被修改，签名就会不匹配。

## 常用签名算法

| 算法 | 类型 | 密钥 | 推荐场景 |
|------|------|------|----------|
| HS256 | 对称 | 共享密钥 | 单服务、简单场景 |
| RS256 | 非对称 | 公钥/私钥 | 多服务、微服务 |
| ES256 | 非对称（椭圆曲线） | 公钥/私钥 | 性能敏感场景 |

RS256 更适合微服务：签发服务用私钥签名，其他服务用公钥验证。私钥不需要在所有服务间共享。

## 工作流程

```
1. 用户登录 → POST /login { username, password }
2. 服务端验证凭据 → 生成 JWT（包含用户信息和过期时间）
3. 返回 JWT 给客户端
4. 客户端保存 JWT（通常在 localStorage 或 httpOnly Cookie）
5. 后续请求在 Header 中携带：Authorization: Bearer <JWT>
6. 服务端验证 JWT 签名 → 提取用户信息 → 处理请求
```

## 代码实战

### Node.js

```javascript
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET; // 至少 256 位随机字符串

// 签发
function generateToken(user) {
  return jwt.sign(
    { sub: user.id, name: user.name, role: user.role },
    SECRET,
    { expiresIn: "2h", issuer: "myapp" }
  );
}

// 验证
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, SECRET, { issuer: "myapp" });
    return { valid: true, payload: decoded };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

// Express 中间件
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing token" });
  }
  const result = verifyToken(authHeader.slice(7));
  if (!result.valid) {
    return res.status(401).json({ error: result.error });
  }
  req.user = result.payload;
  next();
}
```

### Python

```python
import jwt
import datetime
import os

SECRET = os.environ["JWT_SECRET"]

def generate_token(user: dict) -> str:
    payload = {
        "sub": user["id"],
        "name": user["name"],
        "role": user["role"],
        "iat": datetime.datetime.utcnow(),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2),
        "iss": "myapp"
    }
    return jwt.encode(payload, SECRET, algorithm="HS256")

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET, algorithms=["HS256"], issuer="myapp")
        return {"valid": True, "payload": payload}
    except jwt.ExpiredSignatureError:
        return {"valid": False, "error": "Token expired"}
    except jwt.InvalidTokenError as e:
        return {"valid": False, "error": str(e)}
```

### Go

```go
import (
    "time"
    "github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte(os.Getenv("JWT_SECRET"))

func GenerateToken(userID string, role string) (string, error) {
    claims := jwt.MapClaims{
        "sub":  userID,
        "role": role,
        "iss":  "myapp",
        "iat":  time.Now().Unix(),
        "exp":  time.Now().Add(2 * time.Hour).Unix(),
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
    return &claims, nil
}
```

## 安全最佳实践

### 必须做

1. **使用 HTTPS** — JWT 本身不加密，必须通过 HTTPS 传输
2. **设置合理的过期时间** — Access Token 短（15-30 分钟），配合 Refresh Token
3. **密钥强度** — HS256 至少 256 位随机字符串；生产环境优先用 RS256/ES256
4. **验证所有标准字段** — 检查 `exp`、`iss`、`aud`，不要只验签名
5. **指定 `algorithms` 参数** — 防止算法混淆攻击

### 不要做

1. **不要在 Payload 存敏感数据** — 它只是 Base64 编码，不是加密
2. **不要用 JWT 做会话管理** — JWT 签发后无法撤销（除非配合黑名单）
3. **不要忽略 `exp`** — 永不过期的 JWT 是严重安全隐患
4. **不要在 URL 中传 JWT** — URL 会被日志记录，用 Header 传递

### Refresh Token 机制

```
Access Token (短期, 15min) ← 用于 API 请求
Refresh Token (长期, 7d)   ← 用于刷新 Access Token

Access Token 过期 → 用 Refresh Token 获取新的 Access Token
Refresh Token 存在数据库，可以随时撤销
```

## JWT vs Session

| 维度 | JWT | Session |
|------|-----|---------|
| 状态 | 无状态 | 有状态（服务端存储） |
| 扩展性 | 天然支持分布式 | 需要共享 Session 存储 |
| 撤销 | 困难（需黑名单） | 简单（删除即可） |
| 大小 | 较大（含 Payload） | 较小（仅 Session ID） |
| 适用 | API、微服务、移动端 | 传统 Web 应用 |

## 小结

- JWT 由 Header + Payload + Signature 三部分组成
- Payload 是编码而非加密，不要存敏感数据
- RS256（非对称）适合微服务，HS256（对称）适合简单场景
- 务必设置过期时间，配合 Refresh Token 使用
- 验证时检查签名、过期时间、签发者等所有标准字段
'''

# ── 37 ──────────────────────────────────────────────
articles["37-json-ld.md"] = r'''# JSON-LD：让你的数据被搜索引擎理解

> **分类**：高级主题　|　**级别**：高级　|　**标签**：JSON-LD, 语义化, SEO, Schema.org, 结构化数据

## 什么是 JSON-LD

JSON-LD（JSON for Linking Data）是一种基于 JSON 的语义化数据格式，它让普通的 JSON 数据具有 **机器可理解的含义**。

普通 JSON 中 `"name": "Alice"` 只是一个键值对。但 JSON-LD 可以告诉机器：这个 `name` 是一个 `Person`（人物）的名字，遵循 Schema.org 的定义。

最直接的好处：**Google、Bing 等搜索引擎能理解你的页面内容，展示富摘要（Rich Snippets）**。

## 基础语法

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "张三",
  "jobTitle": "前端工程师",
  "email": "zhangsan@example.com",
  "url": "https://zhangsan.dev"
}
```

核心关键字：

| 关键字 | 含义 |
|--------|------|
| `@context` | 定义词汇表（通常是 Schema.org） |
| `@type` | 数据的类型 |
| `@id` | 资源的唯一标识（URI） |
| `@graph` | 包含多个关联资源 |

## 嵌入网页

将 JSON-LD 放在 HTML 的 `<script>` 标签中：

```html
<head>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "JSON-LD 完全指南",
    "author": {
      "@type": "Person",
      "name": "张三"
    },
    "datePublished": "2025-01-15",
    "publisher": {
      "@type": "Organization",
      "name": "TechBlog",
      "logo": {
        "@type": "ImageObject",
        "url": "https://example.com/logo.png"
      }
    }
  }
  </script>
</head>
```

## 常见 Schema.org 类型

### 组织/公司

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Acme 科技",
  "url": "https://acme.com",
  "logo": "https://acme.com/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+86-10-12345678",
    "contactType": "customer service"
  },
  "sameAs": [
    "https://twitter.com/acme",
    "https://github.com/acme"
  ]
}
```

### 产品

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "JSON 验证工具 Pro",
  "description": "专业的 JSON 在线验证和格式化工具",
  "brand": { "@type": "Brand", "name": "ToolboxNova" },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "1250"
  }
}
```

### FAQ 页面

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "什么是 JSON？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "JSON 是一种轻量级的数据交换格式..."
      }
    },
    {
      "@type": "Question",
      "name": "JSON 和 XML 有什么区别？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "JSON 更轻量、易读，而 XML 支持属性和命名空间..."
      }
    }
  ]
}
```

### 面包屑导航

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "首页", "item": "https://example.com" },
    { "@type": "ListItem", "position": 2, "name": "教程", "item": "https://example.com/learn" },
    { "@type": "ListItem", "position": 3, "name": "JSON-LD 指南" }
  ]
}
```

## @graph：多个实体

一个页面中描述多个实体：

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://example.com/article/json-ld",
      "name": "JSON-LD 教程"
    },
    {
      "@type": "Article",
      "isPartOf": { "@id": "https://example.com/article/json-ld" },
      "headline": "JSON-LD 完全指南",
      "author": { "@type": "Person", "name": "张三" }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [ ... ]
    }
  ]
}
```

## 验证工具

1. **Google 富摘要测试工具** — search.google.com/test/rich-results
2. **Schema.org 验证器** — validator.schema.org
3. **JSON-LD Playground** — json-ld.org/playground

## SEO 效果

正确使用 JSON-LD 后，Google 搜索结果可能展示：

- **文章**：标题、发布日期、作者头像
- **产品**：价格、评分、库存状态
- **FAQ**：问答折叠展示
- **评价**：星级评分
- **事件**：时间、地点、购票链接
- **食谱**：烹饪时间、热量、评分

## JSON-LD vs Microdata vs RDFa

| 维度 | JSON-LD | Microdata | RDFa |
|------|---------|-----------|------|
| 格式 | 独立 JSON 块 | 嵌入 HTML 属性 | 嵌入 HTML 属性 |
| 维护性 | 高（与 HTML 分离） | 低（与 HTML 耦合） | 低 |
| Google 推荐 | ✓ 首选 | 支持 | 支持 |
| 实现难度 | 低 | 中 | 高 |

Google 官方推荐 JSON-LD，因为它不需要修改 HTML 结构。

## 小结

- JSON-LD 用 `@context`、`@type`、`@id` 赋予 JSON 语义含义
- 嵌入 `<script type="application/ld+json">` 标签中
- 使用 Schema.org 词汇表描述文章、产品、组织、FAQ 等
- 正确使用可获得 Google 富摘要展示，提升 SEO 效果
- Google 验证工具可以检查结构化数据是否正确
'''

# ── 38 ──────────────────────────────────────────────
articles["38-json-patch.md"] = r'''# JSON Patch：精确修改 JSON 文档

> **分类**：高级主题　|　**级别**：高级　|　**标签**：JSON Patch, RFC 6902, PATCH请求, 增量更新

## 什么是 JSON Patch

JSON Patch（RFC 6902）是一种描述 JSON 文档修改操作的格式。与整体替换不同，它只传输 **变更部分**，就像 `git diff` 之于文件。

为什么需要它？假设一个 10KB 的用户配置，你只想改一个字段。用 PUT 要传输完整的 10KB，而 JSON Patch 只传几十字节的修改指令。

```http
PATCH /api/users/123
Content-Type: application/json-patch+json

[
  { "op": "replace", "path": "/name", "value": "新名字" }
]
```

## 六种操作

JSON Patch 定义了六种操作（op）：

### 1. add — 添加

```json
// 添加字段
{ "op": "add", "path": "/email", "value": "alice@example.com" }

// 在数组指定位置插入
{ "op": "add", "path": "/tags/1", "value": "new-tag" }

// 在数组末尾追加
{ "op": "add", "path": "/tags/-", "value": "last-tag" }
```

### 2. remove — 删除

```json
// 删除字段
{ "op": "remove", "path": "/deprecated_field" }

// 删除数组元素
{ "op": "remove", "path": "/tags/2" }
```

### 3. replace — 替换

```json
{ "op": "replace", "path": "/name", "value": "Bob" }
{ "op": "replace", "path": "/settings/theme", "value": "dark" }
```

`replace` 等同于先 `remove` 再 `add`，但目标路径必须存在。

### 4. move — 移动

```json
{ "op": "move", "from": "/old_name", "path": "/new_name" }
```

### 5. copy — 复制

```json
{ "op": "copy", "from": "/billing_address", "path": "/shipping_address" }
```

### 6. test — 测试

```json
{ "op": "test", "path": "/version", "value": 2 }
```

`test` 不修改数据，而是断言某个值是否匹配。如果不匹配，**整个 Patch 操作回滚**。这对实现乐观锁非常有用。

## 路径语法

JSON Patch 使用 JSON Pointer（RFC 6901）表示路径：

| JSON Pointer | 对应的 JSON 位置 |
|--------------|------------------|
| `/name` | 根对象的 `name` 字段 |
| `/address/city` | 嵌套对象 `address.city` |
| `/tags/0` | 数组 `tags` 的第一个元素 |
| `/tags/-` | 数组末尾（仅用于 `add`） |
| `/a~0b` | 字段名包含 `~` 的（`~` 编码为 `~0`） |
| `/a~1b` | 字段名包含 `/` 的（`/` 编码为 `~1`） |

## 完整示例

原始文档：

```json
{
  "name": "Alice",
  "age": 25,
  "address": { "city": "Beijing", "zip": "100000" },
  "tags": ["developer", "writer"],
  "version": 1
}
```

Patch 操作：

```json
[
  { "op": "test", "path": "/version", "value": 1 },
  { "op": "replace", "path": "/name", "value": "Alice Chen" },
  { "op": "replace", "path": "/age", "value": 26 },
  { "op": "replace", "path": "/address/city", "value": "Shanghai" },
  { "op": "add", "path": "/tags/-", "value": "speaker" },
  { "op": "remove", "path": "/address/zip" },
  { "op": "add", "path": "/email", "value": "alice@example.com" },
  { "op": "replace", "path": "/version", "value": 2 }
]
```

结果：

```json
{
  "name": "Alice Chen",
  "age": 26,
  "address": { "city": "Shanghai" },
  "tags": ["developer", "writer", "speaker"],
  "email": "alice@example.com",
  "version": 2
}
```

## 各语言实现

### JavaScript（fast-json-patch）

```javascript
const jsonpatch = require("fast-json-patch");

const document = { name: "Alice", tags: ["dev"] };
const patch = [
  { op: "replace", path: "/name", value: "Bob" },
  { op: "add", path: "/tags/-", value: "writer" }
];

const result = jsonpatch.applyPatch(document, patch);
console.log(document);
// { name: "Bob", tags: ["dev", "writer"] }

// 自动生成 Patch（diff）
const before = { name: "Alice", age: 25 };
const after = { name: "Alice", age: 26, city: "Shanghai" };
const diff = jsonpatch.compare(before, after);
console.log(diff);
// [
//   { op: "replace", path: "/age", value: 26 },
//   { op: "add", path: "/city", value: "Shanghai" }
// ]
```

### Python（jsonpatch）

```python
import jsonpatch

doc = {"name": "Alice", "age": 25, "tags": ["dev"]}
patch = jsonpatch.JsonPatch([
    {"op": "replace", "path": "/age", "value": 26},
    {"op": "add", "path": "/tags/-", "value": "writer"}
])

result = patch.apply(doc)
print(result)
# {'name': 'Alice', 'age': 26, 'tags': ['dev', 'writer']}

# 生成 diff
src = {"name": "Alice", "age": 25}
dst = {"name": "Alice", "age": 26, "city": "Shanghai"}
diff = jsonpatch.make_patch(src, dst)
print(diff.to_string())
```

## REST API 中的应用

```python
# Flask 示例
from flask import Flask, request, jsonify
import jsonpatch

app = Flask(__name__)
users_db = {}

@app.route("/users/<uid>", methods=["PATCH"])
def patch_user(uid):
    if uid not in users_db:
        return jsonify(error="Not found"), 404

    try:
        patch = jsonpatch.JsonPatch(request.json)
        users_db[uid] = patch.apply(users_db[uid])
        return jsonify(users_db[uid])
    except jsonpatch.JsonPatchConflict as e:
        return jsonify(error=str(e)), 409
    except jsonpatch.JsonPatchException as e:
        return jsonify(error=str(e)), 400
```

## JSON Patch vs JSON Merge Patch

| 维度 | JSON Patch (RFC 6902) | JSON Merge Patch (RFC 7396) |
|------|----------------------|---------------------------|
| 格式 | 操作数组 | 部分 JSON 对象 |
| 删除字段 | `{ "op": "remove" }` | 设为 `null` |
| 数组操作 | 支持精确增删 | 只能整体替换 |
| 复杂度 | 高，支持丰富操作 | 低，直觉简单 |
| Content-Type | `application/json-patch+json` | `application/merge-patch+json` |

JSON Merge Patch 更简单，但能力有限。如果需要精确的数组操作或条件测试，选 JSON Patch。

## 小结

- JSON Patch 用六种操作（add/remove/replace/move/copy/test）描述增量修改
- `test` 操作可实现乐观锁
- 路径使用 JSON Pointer（RFC 6901）语法
- 比整体替换节省带宽，适合大文档的局部更新
- `compare/diff` 功能可自动生成两个 JSON 之间的 Patch
'''

# ── 39 ──────────────────────────────────────────────
articles["39-json-pointer.md"] = r'''# JSON Pointer：精确定位 JSON 中的值

> **分类**：高级主题　|　**级别**：高级　|　**标签**：JSON Pointer, RFC 6901, 路径引用

## 什么是 JSON Pointer

JSON Pointer（RFC 6901）是一种用字符串路径精确定位 JSON 文档中某个值的标准语法。它被 JSON Schema（`$ref`）、JSON Patch（`path`）、OpenAPI 等规范广泛使用。

```
/store/books/0/title
```

这个指针表示：根对象 → `store` 属性 → `books` 属性 → 第 0 个元素 → `title` 属性。

## 语法规则

| 规则 | 说明 |
|------|------|
| 空字符串 `""` | 指向整个文档（根） |
| 以 `/` 开头 | 每个 `/` 分隔一个层级 |
| 数组用数字索引 | `/items/0` 表示第一个元素 |
| `~0` 转义 `~` | 字段名含 `~` 时用 `~0` |
| `~1` 转义 `/` | 字段名含 `/` 时用 `~1` |

### 转义示例

JSON 数据：

```json
{
  "a/b": 1,
  "c~d": 2,
  "m~n/o": 3
}
```

| JSON Pointer | 目标值 |
|-------------|--------|
| `/a~1b` | `1`（`/` → `~1`） |
| `/c~0d` | `2`（`~` → `~0`） |
| `/m~0n~1o` | `3`（先 `~` → `~0`，再 `/` → `~1`） |

> 转义顺序：先处理 `~0`（`~`），再处理 `~1`（`/`）。

## 完整示例

```json
{
  "users": [
    {
      "name": "Alice",
      "contacts": {
        "email": "alice@example.com",
        "phones": ["+86-138-0001-0001", "+86-139-0002-0002"]
      }
    },
    {
      "name": "Bob",
      "contacts": {
        "email": "bob@example.com"
      }
    }
  ],
  "metadata": {
    "version": 2,
    "tags": ["production", "v2"]
  }
}
```

| JSON Pointer | 结果 |
|-------------|------|
| `` (空) | 整个文档 |
| `/users` | 用户数组 |
| `/users/0` | Alice 对象 |
| `/users/0/name` | `"Alice"` |
| `/users/0/contacts/phones/1` | `"+86-139-0002-0002"` |
| `/users/1/contacts/email` | `"bob@example.com"` |
| `/metadata/tags/0` | `"production"` |

## 各语言实现

### JavaScript

```javascript
// 简单实现
function resolvePointer(obj, pointer) {
  if (pointer === "") return obj;
  const tokens = pointer.slice(1).split("/").map(t =>
    t.replace(/~1/g, "/").replace(/~0/g, "~")
  );
  let current = obj;
  for (const token of tokens) {
    if (current === null || current === undefined) return undefined;
    current = Array.isArray(current) ? current[parseInt(token)] : current[token];
  }
  return current;
}

// 使用
const data = { users: [{ name: "Alice" }] };
console.log(resolvePointer(data, "/users/0/name")); // "Alice"
```

### Python

```python
import jsonpointer

data = {
    "users": [{"name": "Alice"}, {"name": "Bob"}],
    "meta": {"version": 2}
}

# 解析
print(jsonpointer.resolve_pointer(data, "/users/0/name"))  # "Alice"

# 设置值
jsonpointer.set_pointer(data, "/meta/version", 3)
print(data["meta"]["version"])  # 3
```

## 在 JSON Schema 中的应用

```json
{
  "$defs": {
    "address": {
      "type": "object",
      "properties": {
        "city": { "type": "string" }
      }
    }
  },
  "properties": {
    "home": { "$ref": "#/$defs/address" }
  }
}
```

`#/$defs/address` 中，`#` 代表当前文档，后面跟的就是 JSON Pointer。

## JSON Pointer vs JSONPath

| 维度 | JSON Pointer | JSONPath |
|------|-------------|----------|
| 标准 | RFC 6901 | RFC 9535 |
| 定位 | 单个精确值 | 可匹配多个值 |
| 通配符 | 不支持 | `*`、`..` |
| 过滤 | 不支持 | `?(@.price > 10)` |
| 用途 | 引用、Patch、Schema | 查询、提取 |

简单说：**JSON Pointer 是地址，JSONPath 是查询语言**。

## 小结

- JSON Pointer 用 `/` 分隔路径精确定位 JSON 中的单个值
- `~0` 转义 `~`，`~1` 转义 `/`
- 被 JSON Schema、JSON Patch、OpenAPI 等标准广泛使用
- 与 JSONPath 互补：Pointer 定位精确位置，Path 做复杂查询
'''

# ── 40 ──────────────────────────────────────────────
articles["40-ndjson.md"] = r'''# NDJSON：换行分隔的 JSON 流

> **分类**：高级主题　|　**级别**：高级　|　**标签**：NDJSON, JSON Lines, 流式处理, 日志

## 什么是 NDJSON

NDJSON（Newline Delimited JSON），也叫 JSON Lines / JSONL，是一种每行一个 JSON 对象的文本格式：

```
{"id":1,"event":"login","user":"alice","ts":"2025-01-15T08:00:00Z"}
{"id":2,"event":"view","user":"alice","ts":"2025-01-15T08:01:23Z"}
{"id":3,"event":"purchase","user":"bob","ts":"2025-01-15T08:02:45Z"}
```

每行是一个独立的、完整的 JSON 值，用 `\n` 分隔。没有外层的 `[]` 包裹，也没有逗号分隔。

## 为什么不用 JSON 数组

普通 JSON 数组（`[{...}, {...}, ...]`）有几个严重问题：

1. **内存**：必须把整个数组读入内存才能解析
2. **追加**：往数组末尾加元素需要先读取整个文件、修改、再写回
3. **流式**：无法边产生边消费，必须等整个数组完成
4. **容错**：数组中间任何一处语法错误，整个文件无法解析

NDJSON 解决了所有这些问题：

| 维度 | JSON Array | NDJSON |
|------|-----------|--------|
| 内存占用 | 全部加载 | 逐行处理 |
| 追加数据 | 需要重写文件 | 直接 append |
| 流式处理 | 不支持 | 天然支持 |
| 容错性 | 一处出错全废 | 跳过坏行继续 |
| 文件大小限制 | 受内存限制 | 几乎无限 |

## 使用场景

- **日志收集**：每条日志一行 JSON（ELK Stack、Fluentd）
- **数据管道**：ETL 中间格式
- **AI/ML 数据集**：训练数据通常是 JSONL 格式
- **数据库导出**：MongoDB `mongoexport` 默认输出 NDJSON
- **API 流式响应**：Server-Sent Events、ChatGPT API
- **大文件处理**：GB 级数据的逐行处理

## 各语言处理

### Python

```python
import json

# 写入 NDJSON
events = [
    {"id": 1, "event": "login", "user": "alice"},
    {"id": 2, "event": "view", "user": "bob"},
    {"id": 3, "event": "purchase", "user": "alice"},
]

with open("events.jsonl", "w") as f:
    for event in events:
        f.write(json.dumps(event, ensure_ascii=False) + "\n")

# 逐行读取（内存友好）
with open("events.jsonl") as f:
    for line in f:
        line = line.strip()
        if line:  # 跳过空行
            record = json.loads(line)
            print(record["event"])

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
                print(f"Line {lineno} error: {e}")
                continue  # 跳过坏行

# 统计 alice 的事件数
alice_count = sum(1 for r in read_ndjson("events.jsonl") if r["user"] == "alice")
```

### Node.js

```javascript
const fs = require("fs");
const readline = require("readline");

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
        console.error("Bad line:", e.message);
      }
    }
  }
  return results;
}

// 写入
function writeNDJSON(filepath, records) {
  const stream = fs.createWriteStream(filepath);
  for (const record of records) {
    stream.write(JSON.stringify(record) + "\n");
  }
  stream.end();
}

// 追加一条记录
function appendNDJSON(filepath, record) {
  fs.appendFileSync(filepath, JSON.stringify(record) + "\n");
}
```

### Go

```go
package main

import (
    "bufio"
    "encoding/json"
    "fmt"
    "os"
)

type Event struct {
    ID    int    `json:"id"`
    Event string `json:"event"`
    User  string `json:"user"`
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
        if err := json.Unmarshal(scanner.Bytes(), &e); err != nil {
            fmt.Printf("Skipping bad line: %v\n", err)
            continue
        }
        events = append(events, e)
    }
    return events, scanner.Err()
}
```

### 命令行（jq）

```bash
# 过滤特定用户的事件
cat events.jsonl | jq 'select(.user == "alice")'

# 统计每种事件的数量
cat events.jsonl | jq -s 'group_by(.event) | map({event: .[0].event, count: length})'

# 提取所有用户名（去重）
cat events.jsonl | jq -r '.user' | sort -u
```

## 规范细节

1. 每行必须是一个完整的 JSON 值（通常是对象）
2. 行分隔符是 `\n`（LF），`\r\n`（CRLF）也可接受
3. 每行内部不应有换行（JSON 要紧凑格式）
4. 文件扩展名：`.jsonl`、`.ndjson`、`.ldjson`
5. MIME 类型：`application/x-ndjson`

## 小结

- NDJSON 是每行一个 JSON 值的简单格式
- 天然支持流式处理、追加写入、跳过坏行
- 是日志、数据管道、ML 数据集的标准格式
- 配合 jq 可以在命令行高效处理
- 处理大文件时比 JSON 数组更节省内存
'''

# ── 41 ──────────────────────────────────────────────
articles["41-geojson.md"] = r'''# GeoJSON：地理数据的 JSON 表示

> **分类**：高级主题　|　**级别**：高级　|　**标签**：GeoJSON, 地理信息, 地图, RFC 7946

## 什么是 GeoJSON

GeoJSON（RFC 7946）是用 JSON 格式表示地理空间数据的标准。它可以描述点、线、面等几何形状及其属性，被主流地图库（Leaflet、Mapbox、Google Maps）和 GIS 工具原生支持。

## 几何类型

### Point（点）

```json
{
  "type": "Point",
  "coordinates": [116.4074, 39.9042]
}
```

坐标顺序：**[经度, 纬度]**（注意不是纬度在前）。

### LineString（线）

```json
{
  "type": "LineString",
  "coordinates": [
    [116.4074, 39.9042],
    [121.4737, 31.2304],
    [113.2644, 23.1291]
  ]
}
```

### Polygon（面）

```json
{
  "type": "Polygon",
  "coordinates": [[
    [116.0, 39.5],
    [117.0, 39.5],
    [117.0, 40.5],
    [116.0, 40.5],
    [116.0, 39.5]
  ]]
}
```

多边形的第一个和最后一个坐标必须相同（闭合）。外层数组支持多环（外环 + 内部空洞）。

### MultiPoint / MultiLineString / MultiPolygon

```json
{
  "type": "MultiPoint",
  "coordinates": [
    [116.4074, 39.9042],
    [121.4737, 31.2304]
  ]
}
```

### GeometryCollection

```json
{
  "type": "GeometryCollection",
  "geometries": [
    { "type": "Point", "coordinates": [116.4, 39.9] },
    { "type": "LineString", "coordinates": [[116.4, 39.9], [121.5, 31.2]] }
  ]
}
```

## Feature 和 FeatureCollection

实际应用中很少直接使用裸几何体。**Feature** 将几何体与属性绑定：

```json
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [116.4074, 39.9042]
  },
  "properties": {
    "name": "天安门广场",
    "city": "北京",
    "visitors_per_year": 15000000
  }
}
```

**FeatureCollection** 是 Feature 的集合：

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [116.4074, 39.9042] },
      "properties": { "name": "北京", "population": 21540000 }
    },
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [121.4737, 31.2304] },
      "properties": { "name": "上海", "population": 24870000 }
    },
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [113.2644, 23.1291] },
      "properties": { "name": "广州", "population": 18676605 }
    }
  ]
}
```

## 实战：在地图上展示

### Leaflet (JavaScript)

```html
<link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>

<div id="map" style="height: 500px;"></div>
<script>
const map = L.map("map").setView([35, 110], 4);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

const geojson = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [116.4074, 39.9042] },
      properties: { name: "北京" }
    }
    // ... 更多 features
  ]
};

L.geoJSON(geojson, {
  onEachFeature: (feature, layer) => {
    layer.bindPopup(feature.properties.name);
  }
}).addTo(map);
</script>
```

### Python（shapely + geopandas）

```python
import geopandas as gpd
import json

# 从文件读取
gdf = gpd.read_file("cities.geojson")
print(gdf.head())

# 空间查询：找出某区域内的点
from shapely.geometry import box
bbox = box(110, 30, 120, 40)
cities_in_bbox = gdf[gdf.geometry.within(bbox)]

# 输出为 GeoJSON
print(cities_in_bbox.to_json())
```

## 注意事项

1. **坐标顺序是 [经度, 纬度]**，不是 [纬度, 经度]。这是最常见的错误
2. 坐标使用 WGS 84 坐标系（EPSG:4326），与 GPS 一致
3. 多边形必须闭合（首尾坐标相同）
4. 避免超大 GeoJSON 文件（>50MB），考虑使用 TopoJSON 或矢量切片
5. `properties` 可以包含任意键值对，没有固定 Schema

## GeoJSON vs TopoJSON

| 维度 | GeoJSON | TopoJSON |
|------|---------|----------|
| 标准 | RFC 7946 | D3.js 社区 |
| 体积 | 大（坐标重复） | 小（共享边界，可减 80%） |
| 兼容性 | 所有地图库原生支持 | 需要 topojson-client 转换 |
| 拓扑关系 | 无 | 有（相邻区域共享边界） |

## 小结

- GeoJSON 用 JSON 描述地理空间数据，支持点、线、面等几何类型
- 坐标顺序是 `[经度, 纬度]`，使用 WGS 84 坐标系
- Feature 将几何体和属性绑定，FeatureCollection 是常用的顶层结构
- 主流地图库（Leaflet、Mapbox、Google Maps）原生支持
- 大数据量场景考虑 TopoJSON 或矢量切片优化
'''

# ── 42 ──────────────────────────────────────────────
articles["42-json-security.md"] = r'''# JSON 安全最佳实践

> **分类**：安全与性能　|　**级别**：高级　|　**标签**：安全, XSS, 注入, 反序列化

## JSON 安全概览

JSON 本身是纯数据格式，没有可执行代码。但在 **解析、传输和使用** JSON 的过程中，存在多种安全风险。

## 1. 永远不要用 eval() 解析 JSON

```javascript
// ❌ 极度危险
const data = eval("(" + jsonString + ")");

// ✓ 安全
const data = JSON.parse(jsonString);
```

`eval()` 会执行任意 JavaScript 代码。如果 `jsonString` 被注入恶意内容，后果不堪设想。现代浏览器和 Node.js 都内置了 `JSON.parse()`，没有任何理由使用 `eval()`。

## 2. XSS 防护

将 JSON 嵌入 HTML 时，需要转义特殊字符：

```html
<!-- ❌ 危险：如果 data 包含 </script>，会导致 XSS -->
<script>
  var data = {{ json_data | raw }};
</script>

<!-- ✓ 安全：转义特殊字符 -->
<script>
  var data = JSON.parse({{ json_data | escapejs | quote }});
</script>
```

### HTML 中嵌入 JSON 的安全方法

```javascript
// 服务端：转义 < 和 > 等字符
function safeJsonForHtml(data) {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/'/g, "\\u0027");
}
```

```html
<script type="application/json" id="app-data">
  {{ safe_json }}
</script>
<script>
  const data = JSON.parse(document.getElementById("app-data").textContent);
</script>
```

## 3. 反序列化安全

某些语言的 JSON 库在反序列化时可能执行代码：

### Python — 不要用 yaml.load

```python
import yaml, json

# ❌ yaml.load 可以执行任意 Python 代码
data = yaml.load(untrusted_input)  # 危险！

# ✓ json.loads 是安全的
data = json.loads(untrusted_input)

# ✓ 如果必须用 YAML，使用 safe_load
data = yaml.safe_load(untrusted_input)
```

### Java — 防范 Gadget Chain 攻击

```java
// ❌ 某些 JSON 库支持多态反序列化，可被利用
// Jackson 默认类型推断
ObjectMapper mapper = new ObjectMapper();
mapper.enableDefaultTyping(); // 危险！

// ✓ 禁用默认类型推断
ObjectMapper mapper = new ObjectMapper();
// 不要调用 enableDefaultTyping()

// ✓ 如果需要多态，使用白名单
@JsonTypeInfo(use = Id.NAME)
@JsonSubTypes({
    @JsonSubTypes.Type(value = Cat.class, name = "cat"),
    @JsonSubTypes.Type(value = Dog.class, name = "dog")
})
public abstract class Animal { }
```

## 4. 输入验证

永远不要信任客户端传来的 JSON：

```python
import json
from jsonschema import validate

schema = {
    "type": "object",
    "required": ["name", "email"],
    "properties": {
        "name": {"type": "string", "minLength": 1, "maxLength": 100},
        "email": {"type": "string", "format": "email"},
        "age": {"type": "integer", "minimum": 0, "maximum": 150}
    },
    "additionalProperties": False  # 拒绝未知字段
}

def process_user_input(raw_json: str):
    # 1. 安全解析
    try:
        data = json.loads(raw_json)
    except json.JSONDecodeError:
        return {"error": "Invalid JSON"}

    # 2. Schema 验证
    try:
        validate(instance=data, schema=schema)
    except Exception as e:
        return {"error": f"Validation failed: {e.message}"}

    # 3. 业务逻辑
    return create_user(data)
```

## 5. 原型污染（JavaScript）

```javascript
// ❌ 恶意 JSON
const malicious = '{"__proto__": {"isAdmin": true}}';
const obj = JSON.parse(malicious);

// JSON.parse 本身是安全的，不会污染原型
// 但手动合并对象时要小心：
function merge(target, source) {
  for (const key in source) {
    // ❌ 没有检查 __proto__
    target[key] = source[key];
  }
}

// ✓ 安全的合并
function safeMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      continue; // 跳过危险键
    }
    if (typeof source[key] === "object" && source[key] !== null) {
      target[key] = target[key] || {};
      safeMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
}
```

## 6. 敏感数据处理

```javascript
// ❌ 密码、密钥等不应出现在 JSON 响应中
{
  "user": "alice",
  "password": "secret123",
  "api_key": "sk-xxx..."
}

// ✓ 返回前过滤敏感字段
function sanitizeUser(user) {
  const { password, api_key, ...safe } = user;
  return safe;
}

// ✓ 使用 toJSON 控制序列化
class User {
  constructor(name, email, password) {
    this.name = name;
    this.email = email;
    this.password = password;
  }
  toJSON() {
    return { name: this.name, email: this.email };
    // password 不会被序列化
  }
}
```

## 7. 大小限制和超时

```javascript
// Express.js — 限制 JSON body 大小
app.use(express.json({ limit: "1mb" }));

// 设置解析超时
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000);

try {
  const data = JSON.parse(hugeString);
} finally {
  clearTimeout(timeout);
}
```

## 安全清单

| 检查项 | 说明 |
|--------|------|
| ✓ 使用 `JSON.parse()` | 永远不要用 `eval()` |
| ✓ 验证输入 | 使用 JSON Schema 校验结构 |
| ✓ 限制大小 | 防止 DoS 攻击 |
| ✓ 转义 HTML | 嵌入页面时防 XSS |
| ✓ 过滤敏感数据 | 响应不包含密码、密钥 |
| ✓ 禁用危险特性 | Java 不开 defaultTyping |
| ✓ 防原型污染 | 合并对象时检查 `__proto__` |
| ✓ 设置超时 | 防止巨型 JSON 阻塞线程 |

## 小结

- JSON 本身是安全的数据格式，风险来自解析和使用环节
- 绝对不要用 `eval()` 解析 JSON
- 嵌入 HTML 时要转义特殊字符防 XSS
- 始终用 JSON Schema 验证外部输入
- 注意语言特有的反序列化漏洞（Java Gadget Chain、原型污染等）
- 响应中过滤敏感字段，限制请求体大小
'''

# ── 43 ──────────────────────────────────────────────
articles["43-json-injection.md"] = r'''# JSON 注入攻击与防御

> **分类**：安全与性能　|　**级别**：高级　|　**标签**：JSON注入, 安全, 防御, NoSQL注入

## 什么是 JSON 注入

JSON 注入是指攻击者通过操纵 JSON 数据的结构或内容，改变应用程序的预期行为。虽然 JSON 本身不可执行，但如果应用程序不当处理 JSON 输入，可能导致权限绕过、数据泄露等严重后果。

## 类型一：JSON 结构注入

### 字符串拼接构建 JSON

```python
# ❌ 极度危险：用字符串拼接构建 JSON
username = request.form["username"]
json_str = '{"username": "' + username + '", "role": "user"}'
```

如果攻击者提交：

```
username = alice", "role": "admin", "x": "
```

拼接后得到：

```json
{"username": "alice", "role": "admin", "x": "", "role": "user"}
```

许多 JSON 解析器对重复键取最后一个值，但有些取第一个。攻击者可能借此提升权限。

### 防御

```python
import json

# ✓ 始终使用 JSON 库构建 JSON
data = {
    "username": request.form["username"],  # 自动处理转义
    "role": "user"
}
json_str = json.dumps(data)
```

## 类型二：NoSQL 注入

MongoDB 等 NoSQL 数据库使用 JSON/BSON 查询，存在类似 SQL 注入的风险：

### 攻击示例

```javascript
// ❌ 直接将用户输入用于查询
app.post("/login", async (req, res) => {
  const user = await db.collection("users").findOne({
    username: req.body.username,
    password: req.body.password
  });
});
```

攻击者发送：

```json
{
  "username": "admin",
  "password": { "$ne": "" }
}
```

`$ne`（不等于空字符串）使密码条件永远为真，绕过认证。

更多危险的 MongoDB 操作符：

```json
{ "$gt": "" }       // 大于空字符串 → 几乎任何非空值都匹配
{ "$regex": ".*" }  // 正则匹配任何值
{ "$exists": true } // 只要字段存在就匹配
```

### 防御

```javascript
// ✓ 方案一：类型检查
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // 确保输入是字符串
  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Invalid input type" });
  }

  const user = await db.collection("users").findOne({
    username: username,
    password: hashPassword(password) // 当然也要 hash 密码
  });
});

// ✓ 方案二：使用 JSON Schema 验证
const loginSchema = {
  type: "object",
  required: ["username", "password"],
  properties: {
    username: { type: "string", minLength: 1, maxLength: 50 },
    password: { type: "string", minLength: 8 }
  },
  additionalProperties: false
};

// ✓ 方案三：使用 mongo-sanitize
const sanitize = require("mongo-sanitize");
const cleanUsername = sanitize(req.body.username); // 移除 $ 开头的键
```

## 类型三：服务端模板注入

某些模板引擎在渲染 JSON 时存在风险：

```python
# ❌ Jinja2 中直接渲染未转义的 JSON
return render_template("page.html", config=json.dumps(user_config))
```

```html
<!-- ❌ 如果 config 包含 </script>，可能导致 XSS -->
<script>var config = {{ config | safe }};</script>
```

### 防御

```python
# ✓ 使用 tojson 过滤器（Jinja2 内置，自动转义）
<script>var config = {{ user_config | tojson }};</script>
```

## 类型四：JSON 劫持（历史漏洞）

早期浏览器存在 JSON 劫持漏洞，攻击者可以通过重写 `Array` 构造函数窃取跨域 JSON 数据。

```javascript
// 历史攻击方式（现代浏览器已修复）
<script>
Array = function() { /* 窃取数据 */ };
</script>
<script src="https://victim.com/api/user/data"></script>
```

现代防御措施（仍建议保留）：

```javascript
// API 响应前加入不可解析前缀
)]}',\n
{"username": "alice", "email": "alice@example.com"}
```

```javascript
// 或者始终返回 JSON 对象而非数组
// ❌ 响应顶层是数组
[{"id":1},{"id":2}]

// ✓ 响应顶层是对象
{"data": [{"id":1},{"id":2}]}
```

## 防御清单

| 措施 | 说明 |
|------|------|
| 不要字符串拼接 JSON | 始终使用 JSON 序列化库 |
| 验证输入类型 | 检查字段类型是否符合预期 |
| 使用 JSON Schema | 严格验证请求体结构 |
| 过滤 MongoDB 操作符 | 移除 `$` 开头的键 |
| 转义 HTML 嵌入 | 使用模板引擎的安全过滤器 |
| 限制请求大小 | 防止超大 JSON 导致 DoS |
| API 返回对象 | 顶层用对象而非数组 |
| 添加安全响应头 | `Content-Type: application/json` |

## 小结

- JSON 注入是通过操纵 JSON 结构来改变程序行为的攻击
- 永远不要用字符串拼接构建 JSON，使用序列化库
- NoSQL 注入是 JSON 注入最常见的形式，必须验证输入类型
- 模板渲染 JSON 时使用安全的转义过滤器
- 多层防御：类型检查 + Schema 验证 + 参数过滤
'''

# ── 44 ──────────────────────────────────────────────
articles["44-json-performance.md"] = r'''# JSON 性能优化指南

> **分类**：安全与性能　|　**级别**：高级　|　**标签**：性能, 序列化, 解析优化, 基准测试

## JSON 性能为什么重要

在高并发的 Web 应用中，JSON 的序列化（编码）和反序列化（解码）可能占 CPU 时间的 10-30%。优化 JSON 处理可以显著降低延迟和资源消耗。

## 优化策略一：选择高性能库

各语言的 JSON 库性能差异巨大。标准库往往不是最快的选择。

### JavaScript / Node.js

```javascript
// 标准 JSON.parse 已经很快（V8 引擎优化）
// 如果需要更快，可以用 simdjson
const simdjson = require("simdjson");
const parsed = simdjson.parse(jsonBuffer); // 比 JSON.parse 快 2-3x
```

### Python

```python
import json
# 标准库 json 模块（纯 Python + C 加速）

import orjson
# orjson：最快的 Python JSON 库（Rust 实现）
data = orjson.loads(json_bytes)
output = orjson.dumps(data)  # 返回 bytes

import ujson
# ujson：比标准库快 2-3x（C 实现）
data = ujson.loads(json_str)

# 性能对比（解析 1MB JSON）
# json.loads:   ~45ms
# ujson.loads:  ~18ms
# orjson.loads: ~8ms
```

### Go

```go
import (
    "encoding/json"     // 标准库
    jsoniter "github.com/json-iterator/go"  // 兼容标准库，快 3-5x
    "github.com/bytedance/sonic"            // 字节跳动，使用 SIMD，快 5-10x
)

// jsoniter 完全兼容标准库 API
var jsonApi = jsoniter.ConfigCompatibleWithStandardLibrary
data, err := jsonApi.Marshal(obj)

// sonic（需要 amd64）
import "github.com/bytedance/sonic"
data, err := sonic.Marshal(obj)
```

### Java

```java
// Jackson（标准选择）
ObjectMapper mapper = new ObjectMapper();

// DSL-JSON（编译时代码生成，更快）
// 需要注解处理器

// Jackson 优化配置
ObjectMapper mapper = new ObjectMapper();
mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL); // 不序列化 null
```

## 优化策略二：减少 JSON 大小

传输的 JSON 越小，网络延迟越低，解析速度越快。

### 缩短字段名

```json
// ❌ 长字段名
{
  "customer_first_name": "Alice",
  "customer_last_name": "Chen",
  "customer_email_address": "alice@example.com"
}

// ✓ 缩短字段名（配合文档说明）
{
  "fn": "Alice",
  "ln": "Chen",
  "email": "alice@example.com"
}
```

> 高频 API（每秒数万请求）场景适用。内部 API 优先考虑可读性。

### 去除 null 和默认值

```python
import orjson

# orjson 自动跳过 None
data = {"name": "Alice", "age": None, "city": None}
result = orjson.dumps(data, option=orjson.OPT_NON_STR_KEYS)

# 手动过滤
def compact(d):
    return {k: v for k, v in d.items() if v is not None}
```

```javascript
// JavaScript
JSON.stringify(data, (key, value) => value === null ? undefined : value);
```

### 分页而非全量

```json
// ❌ 返回所有 10000 条记录
{ "users": [ ... 10000 items ... ] }

// ✓ 分页
{
  "users": [ ... 20 items ... ],
  "pagination": { "page": 1, "pageSize": 20, "total": 10000 }
}
```

## 优化策略三：流式处理

大 JSON 不要一次性加载到内存：

### Python — ijson

```python
import ijson

# 流式解析 GB 级 JSON 文件
with open("huge_data.json", "rb") as f:
    for item in ijson.items(f, "results.item"):
        process(item)  # 逐条处理，内存使用恒定
```

### Node.js — stream-json

```javascript
const { parser } = require("stream-json");
const { streamArray } = require("stream-json/streamers/StreamArray");
const fs = require("fs");

fs.createReadStream("huge.json")
  .pipe(parser())
  .pipe(streamArray())
  .on("data", ({ value }) => {
    process(value);
  });
```

### Go

```go
decoder := json.NewDecoder(file)
// 跳过数组开始的 [
decoder.Token()
for decoder.More() {
    var item Item
    decoder.Decode(&item)
    process(item)
}
```

## 优化策略四：序列化优化

### 预编译 Schema（Go）

```go
// jsoniter 的 Schema 缓存
type User struct {
    Name  string `json:"name"`
    Email string `json:"email"`
}
// jsoniter 会自动缓存反射信息，首次慢，后续快
```

### 避免重复序列化

```python
import functools
import json

# 缓存不变的 JSON
@functools.lru_cache(maxsize=128)
def get_config_json():
    return json.dumps(load_config())
```

### 使用 Buffer Pool

```go
import (
    "bytes"
    "sync"
)

var bufPool = sync.Pool{
    New: func() interface{} { return new(bytes.Buffer) },
}

func marshalToBuffer(v interface{}) []byte {
    buf := bufPool.Get().(*bytes.Buffer)
    defer func() {
        buf.Reset()
        bufPool.Put(buf)
    }()
    encoder := json.NewEncoder(buf)
    encoder.Encode(v)
    return buf.Bytes()
}
```

## 优化策略五：考虑替代格式

当 JSON 性能不满足需求时，可以考虑二进制格式：

| 格式 | 大小 | 解析速度 | 人类可读 | Schema |
|------|------|---------|---------|--------|
| JSON | 大 | 中 | ✓ | 可选 |
| MessagePack | 小 30% | 快 2x | ✗ | 可选 |
| Protocol Buffers | 小 50% | 快 5-10x | ✗ | 必须 |
| FlatBuffers | 小 50% | 极快（零拷贝） | ✗ | 必须 |

> 建议：外部 API 用 JSON（通用性），内部高频服务间通信考虑 Protobuf/MessagePack。

## 性能测试建议

```python
import time
import json
import orjson

data = generate_test_data(10000)  # 生成测试数据

# 基准测试
def benchmark(name, func, iterations=100):
    start = time.perf_counter()
    for _ in range(iterations):
        func()
    elapsed = (time.perf_counter() - start) / iterations * 1000
    print(f"{name}: {elapsed:.2f}ms")

json_str = json.dumps(data)

benchmark("json.dumps", lambda: json.dumps(data))
benchmark("orjson.dumps", lambda: orjson.dumps(data))
benchmark("json.loads", lambda: json.loads(json_str))
benchmark("orjson.loads", lambda: orjson.loads(json_str))
```

## 小结

- 选择高性能 JSON 库（orjson/ujson/sonic/simdjson）可获得 2-10x 提升
- 减少 JSON 大小：缩短字段名、去除 null、分页
- 大文件使用流式解析，避免一次性加载到内存
- 缓存不变的 JSON 结果，使用 Buffer Pool 减少内存分配
- 内部高频通信考虑 Protobuf / MessagePack 替代 JSON
'''

# ── 45 ──────────────────────────────────────────────
articles["45-json-streaming.md"] = r'''# JSON 流式处理：大数据的实时传输

> **分类**：安全与性能　|　**级别**：高级　|　**标签**：流式处理, SSE, WebSocket, 大文件

## 什么是 JSON 流式处理

传统的 JSON API 必须等所有数据准备好后才能返回完整的 JSON 响应。流式处理则允许 **边产生、边传输、边消费** JSON 数据。

典型场景：
- ChatGPT 的逐字输出（SSE + JSON）
- 实时日志推送
- 大型数据集的导出
- 数据库查询结果的流式返回

## Server-Sent Events (SSE)

SSE 是最简单的服务端推送技术，基于 HTTP 长连接：

### 服务端（Node.js）

```javascript
const express = require("express");
const app = express();

app.get("/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let count = 0;
  const interval = setInterval(() => {
    count++;
    const data = JSON.stringify({
      id: count,
      message: `Event ${count}`,
      timestamp: new Date().toISOString()
    });
    res.write(`data: ${data}\n\n`);

    if (count >= 10) {
      clearInterval(interval);
      res.write("data: [DONE]\n\n");
      res.end();
    }
  }, 500);

  req.on("close", () => clearInterval(interval));
});
```

### 服务端（Python / FastAPI）

```python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import json
import asyncio

app = FastAPI()

async def event_generator():
    for i in range(10):
        data = json.dumps({"id": i, "message": f"Event {i}"})
        yield f"data: {data}\n\n"
        await asyncio.sleep(0.5)
    yield "data: [DONE]\n\n"

@app.get("/stream")
async def stream():
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )
```

### 客户端

```javascript
const evtSource = new EventSource("/stream");

evtSource.onmessage = (event) => {
  if (event.data === "[DONE]") {
    evtSource.close();
    return;
  }
  const data = JSON.parse(event.data);
  console.log(data.message);
};

evtSource.onerror = () => {
  evtSource.close();
};
```

## 类 ChatGPT 流式输出

ChatGPT API 使用 SSE 传输 JSON 数据块：

```javascript
async function streamChat(prompt) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, stream: true })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop(); // 保留不完整的行

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") return;
        try {
          const chunk = JSON.parse(data);
          process.stdout.write(chunk.content || "");
        } catch (e) {
          // 跳过无效行
        }
      }
    }
  }
}
```

## NDJSON 流式传输

NDJSON 天然适合流式处理：

```javascript
// 服务端
app.get("/export", async (req, res) => {
  res.setHeader("Content-Type", "application/x-ndjson");

  const cursor = db.collection("users").find().cursor();
  for await (const doc of cursor) {
    res.write(JSON.stringify(doc) + "\n");
  }
  res.end();
});

// 客户端
async function consumeNDJSON(url) {
  const response = await fetch(url);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop();

    for (const line of lines) {
      if (line.trim()) {
        const record = JSON.parse(line);
        processRecord(record);
      }
    }
  }
}
```

## Go 流式编码

```go
func streamHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/x-ndjson")
    flusher, _ := w.(http.Flusher)
    encoder := json.NewEncoder(w)

    rows, _ := db.Query("SELECT id, name, email FROM users")
    defer rows.Close()

    for rows.Next() {
        var user User
        rows.Scan(&user.ID, &user.Name, &user.Email)
        encoder.Encode(user)  // 自动追加 \n
        flusher.Flush()       // 立即发送
    }
}
```

## WebSocket + JSON

双向实时通信场景（聊天、游戏、协作编辑）：

```javascript
// 服务端 (ws 库)
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", (ws) => {
  ws.on("message", (raw) => {
    const msg = JSON.parse(raw);
    // 广播给所有客户端
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          user: msg.user,
          text: msg.text,
          ts: Date.now()
        }));
      }
    });
  });
});

// 客户端
const ws = new WebSocket("ws://localhost:8080");
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  appendMessage(data);
};
ws.send(JSON.stringify({ user: "Alice", text: "Hello!" }));
```

## 技术选型

| 技术 | 方向 | 协议 | 适用场景 |
|------|------|------|----------|
| SSE | 服务端→客户端 | HTTP | 通知、实时更新、AI 流式输出 |
| WebSocket | 双向 | WS | 聊天、游戏、协作 |
| NDJSON | 服务端→客户端 | HTTP | 数据导出、日志流 |
| gRPC Streaming | 双向 | HTTP/2 | 微服务间高性能通信 |

## 小结

- 流式 JSON 处理允许边产生边消费，降低延迟和内存使用
- SSE 适合服务端单向推送（如 ChatGPT 流式输出）
- NDJSON 是流式传输 JSON 记录的理想格式
- WebSocket 适合双向实时通信
- 客户端需要处理不完整的数据块，维护缓冲区
'''

# ── 46 ──────────────────────────────────────────────
articles["46-json-compression.md"] = r'''# JSON 压缩与传输优化

> **分类**：安全与性能　|　**级别**：高级　|　**标签**：压缩, Gzip, Brotli, 传输优化

## 为什么需要压缩 JSON

JSON 是文本格式，有大量冗余（重复的键名、空白、结构字符）。一个 1MB 的 JSON API 响应，经 Gzip 压缩后通常只有 100-200KB。压缩是最低成本、最高回报的优化手段。

## HTTP 压缩

### 服务端配置

#### Nginx

```nginx
http {
    gzip on;
    gzip_types application/json text/plain application/javascript;
    gzip_min_length 1024;     # 小于 1KB 不压缩
    gzip_comp_level 6;        # 压缩级别 1-9
    gzip_vary on;

    # Brotli（需要模块）
    brotli on;
    brotli_types application/json text/plain;
    brotli_comp_level 6;
}
```

#### Express.js

```javascript
const compression = require("compression");
const express = require("express");
const app = express();

app.use(compression({
  filter: (req, res) => {
    if (req.headers["x-no-compression"]) return false;
    return compression.filter(req, res);
  },
  threshold: 1024, // 小于 1KB 不压缩
  level: 6
}));
```

#### Go

```go
import "github.com/klauspost/compress/gzhttp"

handler := gzhttp.GzipHandler(myHandler)
http.ListenAndServe(":8080", handler)
```

### 客户端

浏览器自动在请求头中声明支持的压缩算法：

```http
GET /api/data HTTP/1.1
Accept-Encoding: gzip, deflate, br
```

服务端返回：

```http
HTTP/1.1 200 OK
Content-Type: application/json
Content-Encoding: br
```

浏览器自动解压，对 JavaScript 代码完全透明。

## 压缩算法对比

| 算法 | 压缩率 | 压缩速度 | 解压速度 | 浏览器支持 |
|------|--------|---------|---------|-----------|
| Gzip | 良好 | 快 | 快 | 所有浏览器 |
| Brotli | 更好（比 Gzip 小 15-25%） | 较慢 | 快 | 现代浏览器 |
| Deflate | 良好 | 快 | 快 | 所有浏览器 |
| Zstd | 最好 | 最快 | 最快 | Chrome 123+ |

**推荐策略**：静态资源用 Brotli（离线预压缩），动态 API 响应用 Gzip（实时压缩速度更快）。

## JSON 数据层面的优化

压缩算法之外，减少 JSON 本身的冗余同样重要。

### 去除空白

```javascript
// 紧凑输出（无缩进、无空格）
JSON.stringify(data);  // 默认就是紧凑的

// 确认没有美化
JSON.stringify(data, null, 0); // ≠ JSON.stringify(data, null, 2)
```

仅去除空白就能减少 20-30% 的体积。

### 列式格式

```json
// ❌ 行式：键名重复 N 次
{
  "users": [
    {"id": 1, "name": "Alice", "age": 25},
    {"id": 2, "name": "Bob", "age": 30},
    {"id": 3, "name": "Carol", "age": 28}
  ]
}

// ✓ 列式：键名只出现一次
{
  "columns": ["id", "name", "age"],
  "rows": [
    [1, "Alice", 25],
    [2, "Bob", 30],
    [3, "Carol", 28]
  ]
}
```

数据量大时，列式格式可以减少 40-60% 的体积。

### 枚举值用短标识

```json
// ❌ 冗长
{ "status": "payment_processing", "priority": "very_high" }

// ✓ 短标识（配合文档映射表）
{ "status": 3, "priority": 4 }
```

## 文件存储压缩

### Python

```python
import gzip
import json

data = {"users": [...]}  # 大量数据

# 压缩写入
with gzip.open("data.json.gz", "wt", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False)

# 压缩读取
with gzip.open("data.json.gz", "rt", encoding="utf-8") as f:
    data = json.load(f)
```

### Node.js

```javascript
const zlib = require("zlib");
const fs = require("fs");

// 压缩写入
const data = JSON.stringify(largeObject);
const compressed = zlib.gzipSync(data);
fs.writeFileSync("data.json.gz", compressed);

// 流式压缩
const readStream = fs.createReadStream("large.json");
const gzip = zlib.createGzip();
const writeStream = fs.createWriteStream("large.json.gz");
readStream.pipe(gzip).pipe(writeStream);
```

## 预压缩静态 JSON

对于不经常变化的 JSON 文件，可以提前压缩好：

```bash
# 预生成 Gzip 和 Brotli 版本
gzip -k -9 data.json          # data.json.gz
brotli -k -q 11 data.json     # data.json.br
```

Nginx 配置直接服务预压缩文件：

```nginx
location /api/static/ {
    gzip_static on;
    brotli_static on;
}
```

## 实际效果对比

以一个真实的用户列表 API（1000 条记录）为例：

| 格式 | 大小 |
|------|------|
| 美化 JSON（indent=2） | 1,200 KB |
| 紧凑 JSON | 850 KB |
| 紧凑 + Gzip | 95 KB |
| 紧凑 + Brotli | 78 KB |
| 列式 + Gzip | 52 KB |

从 1200KB 到 52KB，减少了 **95.7%** 的传输体积。

## 小结

- HTTP 压缩（Gzip/Brotli）是最低成本的优化，应默认开启
- 动态响应用 Gzip（速度快），静态资源用 Brotli（压缩率高）
- 去除空白、使用列式格式、缩短枚举值可进一步减少体积
- 大文件存储用 `.json.gz` 格式
- 综合优化可减少 90%+ 的传输体积
'''

# ── 47-53 will continue in next part ──
# Splitting due to string size, we write remaining articles separately

for filename, content in articles.items():
    filepath = os.path.join(OUT, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")
    print(f"✓ {filename} ({len(content)} bytes)")

print(f"\nDone: {len(articles)} articles written")
