# REST API 中的 JSON 最佳实践

> **分类**：实战应用　|　**级别**：高级　|　**标签**：REST, API设计, 规范, HTTP

## JSON 是 REST API 的标准语言

现代 REST API 几乎都使用 JSON 作为数据交换格式。一个设计良好的 JSON API 应该一致、直觉、易于使用。

## 请求与响应规范

### Content-Type

```http
# 请求
POST /api/users
Content-Type: application/json

# 响应
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
```

始终使用 `application/json`，不要用 `text/json` 或 `text/plain`。

### 命名风格

```json
// ✓ camelCase（JavaScript 社区主流）
{ "firstName": "Alice", "lastName": "Chen", "createdAt": "2025-01-15T08:00:00Z" }

// ✓ snake_case（Python/Ruby 社区主流）
{ "first_name": "Alice", "last_name": "Chen", "created_at": "2025-01-15T08:00:00Z" }
```

选择一种风格，全项目统一，不要混用。

## 成功响应设计

### 单个资源

```json
// GET /api/users/123
{
  "id": 123,
  "name": "Alice",
  "email": "alice@example.com",
  "role": "admin",
  "createdAt": "2025-01-15T08:00:00Z"
}
```

### 集合资源（带分页）

```json
// GET /api/users?page=2&pageSize=20
{
  "data": [
    { "id": 123, "name": "Alice", "email": "alice@example.com" },
    { "id": 124, "name": "Bob", "email": "bob@example.com" }
  ],
  "pagination": {
    "page": 2,
    "pageSize": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

> 集合响应始终用对象包裹，不要直接返回数组。这样方便后续扩展元数据。

### 创建资源

```http
POST /api/users
Content-Type: application/json

{ "name": "Carol", "email": "carol@example.com" }
```

```http
HTTP/1.1 201 Created
Location: /api/users/125
Content-Type: application/json

{ "id": 125, "name": "Carol", "email": "carol@example.com", "createdAt": "2025-01-15T10:30:00Z" }
```

## 错误响应设计

### 统一错误格式

```json
// 400 Bad Request
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "请求参数验证失败",
    "details": [
      { "field": "email", "message": "邮箱格式不正确" },
      { "field": "age", "message": "年龄必须大于 0" }
    ]
  }
}

// 404 Not Found
{
  "error": {
    "code": "NOT_FOUND",
    "message": "用户 ID 999 不存在"
  }
}

// 401 Unauthorized
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "认证令牌已过期"
  }
}

// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "服务器内部错误，请稍后重试",
    "requestId": "req_abc123"
  }
}
```

### 错误码映射

| HTTP 状态码 | 含义 | 使用场景 |
|-------------|------|----------|
| 400 | Bad Request | 参数验证失败 |
| 401 | Unauthorized | 未认证 |
| 403 | Forbidden | 权限不足 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突（如重复创建） |
| 422 | Unprocessable Entity | 语义错误 |
| 429 | Too Many Requests | 限流 |
| 500 | Internal Server Error | 服务端错误 |

## 日期和时间

```json
// ✓ ISO 8601 格式（UTC）
{ "createdAt": "2025-01-15T08:30:00Z" }

// ✓ 带时区偏移
{ "createdAt": "2025-01-15T16:30:00+08:00" }

// ✗ 避免使用
{ "createdAt": "2025/01/15 08:30:00" }
{ "createdAt": 1736928600 }  // Unix 时间戳不直观
```

始终使用 ISO 8601 格式，优先 UTC 时间（`Z` 后缀）。

## 空值处理

```json
// 方式一：字段存在但值为 null
{ "name": "Alice", "bio": null }

// 方式二：不包含该字段
{ "name": "Alice" }
```

选择一种方式并保持一致。通常建议：
- 显式 `null`：表示"字段存在但没有值"
- 省略字段：表示"使用默认值"或"不关心此字段"

## 版本控制

```http
# 方式一：URL 路径（最常见）
GET /api/v1/users
GET /api/v2/users

# 方式二：请求头
GET /api/users
Accept: application/vnd.myapp.v2+json

# 方式三：查询参数
GET /api/users?version=2
```

推荐 URL 路径方式，直观明了。

## 过滤、排序和字段选择

```http
# 过滤
GET /api/products?category=electronics&price_min=100&price_max=500

# 排序
GET /api/products?sort=price,-createdAt

# 字段选择
GET /api/products?fields=id,name,price

# 搜索
GET /api/products?q=mechanical+keyboard
```

## HATEOAS（超媒体链接）

```json
{
  "id": 123,
  "name": "Alice",
  "email": "alice@example.com",
  "_links": {
    "self": { "href": "/api/users/123" },
    "orders": { "href": "/api/users/123/orders" },
    "avatar": { "href": "/api/users/123/avatar" }
  }
}
```

## 设计清单

| 维度 | 建议 |
|------|------|
| Content-Type | 始终 `application/json` |
| 命名风格 | 全局统一 camelCase 或 snake_case |
| 集合响应 | 用对象包裹，不直接返回数组 |
| 分页 | 包含 page、total 等元数据 |
| 错误格式 | 统一的 error 结构，含 code 和 message |
| 日期格式 | ISO 8601 |
| 版本控制 | URL 路径或请求头 |
| 空值 | null 或省略，保持一致 |

## 小结

- 使用 `application/json` Content-Type，统一命名风格
- 集合用对象包裹并带分页元数据，不直接返回数组
- 统一错误响应格式，包含错误码、消息和请求 ID
- 日期使用 ISO 8601 格式
- HTTP 状态码表达语义，不要所有响应都返回 200
