# JSON 对象（Object）深入理解

> **分类**：基础入门　|　**级别**：入门　|　**标签**：JSON, 对象, 键值对, 嵌套

## 什么是 JSON 对象

JSON 对象是由花括号 `{}` 包裹的无序键值对集合。它是 JSON 中最重要的数据结构，类似于其他语言中的字典（dict）、哈希表（hash map）或关联数组。

## 基本语法

```json
{
  "key1": "value1",
  "key2": "value2"
}
```

## 键名规则

### 必须是字符串

```json
// ✅ 正确
{ "name": "Alice" }

// ❌ 错误
{ name: "Alice" }
{ 'name': "Alice" }
{ 123: "Alice" }
```

### 建议唯一性

RFC 8259 标准规定键名**应该**（SHOULD）唯一，但**不是**必须（MUST）。如果出现重复键名，不同解析器的行为不一致：

```json
{
  "name": "Alice",
  "name": "Bob"
}
```

- **JavaScript**：后值覆盖前值 → `"Bob"`
- **Python**：后值覆盖前值 → `"Bob"`
- **Go**：后值覆盖前值 → `"Bob"`
- 某些解析器可能报错

**最佳实践：始终保持键名唯一。**

### 键名命名约定

| 风格 | 示例 | 常用场景 |
|------|------|---------|
| camelCase | `"firstName"` | JavaScript API、前端 |
| snake_case | `"first_name"` | Python API、Ruby、数据库 |
| kebab-case | `"first-name"` | CSS、配置文件 |
| PascalCase | `"FirstName"` | C#/.NET API |

建议在同一项目中保持一致的命名风格。

## 嵌套对象

JSON 对象可以嵌套，形成树状结构：

```json
{
  "company": {
    "name": "TechCorp",
    "address": {
      "street": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "country": {
        "code": "US",
        "name": "United States"
      }
    },
    "departments": {
      "engineering": {
        "headCount": 50,
        "lead": "Alice"
      },
      "marketing": {
        "headCount": 20,
        "lead": "Bob"
      }
    }
  }
}
```

**嵌套深度建议：** 不超过 3-4 层。过深的嵌套会降低可读性和解析性能。

## 空对象

空对象是完全合法的 JSON：

```json
{}
```

常见用途：
- 表示初始状态
- 占位符
- 表示"无配置"

## 对象与数组的选择

| 场景 | 用对象 | 用数组 |
|------|--------|--------|
| 唯一标识访问 | ✅ | ❌ |
| 有序集合 | ❌ | ✅ |
| 键值映射 | ✅ | ❌ |
| 列表/队列 | ❌ | ✅ |
| 配置项 | ✅ | ❌ |
| 搜索结果 | ❌ | ✅ |

```json
{
  "byObject": {
    "user_1": { "name": "Alice" },
    "user_2": { "name": "Bob" }
  },
  "byArray": [
    { "id": "user_1", "name": "Alice" },
    { "id": "user_2", "name": "Bob" }
  ]
}
```

## 设计模式

### 信封模式（Envelope Pattern）

API 响应中常见：

```json
{
  "status": "success",
  "code": 200,
  "data": { },
  "meta": {
    "requestId": "abc-123",
    "timestamp": "2025-01-15T10:00:00Z"
  }
}
```

### 多态模式（Polymorphic Pattern）

用 `type` 字段区分不同类型：

```json
{
  "events": [
    { "type": "click", "x": 100, "y": 200 },
    { "type": "scroll", "direction": "down", "amount": 50 },
    { "type": "input", "field": "email", "value": "test@test.com" }
  ]
}
```

### 扁平化 vs 嵌套

```json
{
  "flat": {
    "user_name": "Alice",
    "user_email": "alice@example.com",
    "user_address_city": "Beijing"
  },
  "nested": {
    "user": {
      "name": "Alice",
      "email": "alice@example.com",
      "address": {
        "city": "Beijing"
      }
    }
  }
}
```

扁平化更简单，嵌套结构更清晰。根据实际需求选择。

## 对象的大小限制

JSON 规范本身不限制对象大小，但实际解析器会有限制：

| 解析器 | 默认大小限制 |
|--------|-------------|
| Node.js `JSON.parse` | V8 堆内存限制（约 1.7 GB） |
| Python `json.loads` | 系统内存限制 |
| Go `json.Unmarshal` | 系统内存限制 |
| Nginx（请求体） | 默认 1 MB |
| Express.js | 默认 100 KB |

## 小结

- JSON 对象是无序的键值对集合
- 键名必须是双引号字符串，建议唯一
- 支持嵌套，但不宜过深（3-4 层）
- 在统一命名风格和合理的结构设计上投入时间，长远来看能节省大量维护成本
