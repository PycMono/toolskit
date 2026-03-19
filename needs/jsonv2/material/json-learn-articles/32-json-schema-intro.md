# JSON Schema 入门：用 JSON 描述和验证 JSON

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
