#!/usr/bin/env python3
"""Generate advanced articles 47-53."""
import os

OUT = "/home/claude/json-learn-articles"
articles = {}

articles["47-mongodb-json.md"] = r'''# MongoDB 与 JSON：文档数据库实战

> **分类**：实战应用　|　**级别**：高级　|　**标签**：MongoDB, BSON, 文档数据库, NoSQL

## MongoDB 与 JSON 的关系

MongoDB 是最流行的文档数据库，数据以 **类 JSON 的 BSON（Binary JSON）** 格式存储。你可以用 JSON 格式插入、查询、更新数据，就像操作普通 JSON 对象一样。

### BSON vs JSON

| 维度 | JSON | BSON |
|------|------|------|
| 格式 | 文本 | 二进制 |
| 数据类型 | 6 种基本类型 | 扩展类型（Date, ObjectId, Decimal128, Binary...） |
| 性能 | 解析较慢 | 快速遍历 |
| 大小 | 通常更小 | 稍大（含类型和长度信息） |

你不需要直接操作 BSON。MongoDB 驱动自动完成 JSON ↔ BSON 的转换。

## CRUD 基础操作

### 插入文档

```javascript
// Node.js (mongodb 驱动)
const { MongoClient } = require("mongodb");
const client = new MongoClient("mongodb://localhost:27017");
const db = client.db("myapp");
const users = db.collection("users");

// 插入单条
await users.insertOne({
  name: "Alice",
  email: "alice@example.com",
  age: 28,
  tags: ["developer", "writer"],
  address: {
    city: "Beijing",
    zip: "100000"
  },
  createdAt: new Date()
});

// 批量插入
await users.insertMany([
  { name: "Bob", email: "bob@example.com", age: 32 },
  { name: "Carol", email: "carol@example.com", age: 25 }
]);
```

### 查询文档

```javascript
// 精确匹配
const alice = await users.findOne({ email: "alice@example.com" });

// 比较查询
const seniors = await users.find({ age: { $gte: 30 } }).toArray();

// 嵌套字段查询（点号语法）
const beijingUsers = await users.find({ "address.city": "Beijing" }).toArray();

// 数组查询
const developers = await users.find({ tags: "developer" }).toArray();

// 正则匹配
const aliceOrBob = await users.find({
  name: { $regex: /^(alice|bob)$/i }
}).toArray();

// 投影（只返回特定字段）
const names = await users.find({}, {
  projection: { name: 1, email: 1, _id: 0 }
}).toArray();
```

### 更新文档

```javascript
// 更新单个字段
await users.updateOne(
  { email: "alice@example.com" },
  { $set: { age: 29, "address.city": "Shanghai" } }
);

// 数组操作
await users.updateOne(
  { email: "alice@example.com" },
  { $push: { tags: "speaker" } }       // 数组追加
);

await users.updateOne(
  { email: "alice@example.com" },
  { $pull: { tags: "writer" } }        // 数组移除
);

// 自增
await users.updateOne(
  { email: "alice@example.com" },
  { $inc: { "stats.loginCount": 1 } }
);

// 不存在则创建（upsert）
await users.updateOne(
  { email: "dave@example.com" },
  { $set: { name: "Dave", age: 35 } },
  { upsert: true }
);
```

### 删除文档

```javascript
await users.deleteOne({ email: "bob@example.com" });
await users.deleteMany({ age: { $lt: 18 } });
```

## 聚合管道

聚合管道（Aggregation Pipeline）是 MongoDB 最强大的数据处理功能：

```javascript
const result = await users.aggregate([
  // 1. 筛选
  { $match: { age: { $gte: 20, $lte: 40 } } },

  // 2. 关联查询（类似 JOIN）
  { $lookup: {
    from: "orders",
    localField: "_id",
    foreignField: "userId",
    as: "orders"
  }},

  // 3. 添加计算字段
  { $addFields: {
    orderCount: { $size: "$orders" },
    totalSpent: { $sum: "$orders.amount" }
  }},

  // 4. 分组统计
  { $group: {
    _id: "$address.city",
    avgAge: { $avg: "$age" },
    userCount: { $sum: 1 },
    totalOrders: { $sum: "$orderCount" }
  }},

  // 5. 排序
  { $sort: { totalOrders: -1 } },

  // 6. 限制结果
  { $limit: 10 }
]).toArray();
```

## Python (PyMongo)

```python
from pymongo import MongoClient
from datetime import datetime

client = MongoClient("mongodb://localhost:27017")
db = client["myapp"]
users = db["users"]

# 插入
users.insert_one({
    "name": "Alice",
    "email": "alice@example.com",
    "age": 28,
    "tags": ["developer"],
    "created_at": datetime.utcnow()
})

# 查询
for user in users.find({"age": {"$gte": 25}}).sort("age", -1).limit(10):
    print(f"{user['name']}: {user['age']}")

# 聚合
pipeline = [
    {"$group": {"_id": "$address.city", "count": {"$sum": 1}}},
    {"$sort": {"count": -1}}
]
for city in users.aggregate(pipeline):
    print(f"{city['_id']}: {city['count']}")
```

## Schema 设计建议

### 嵌入 vs 引用

```javascript
// 嵌入（适合 1:1 或 1:少量的关系）
{
  "name": "Alice",
  "address": { "city": "Beijing", "zip": "100000" }
}

// 引用（适合 1:多 或 多:多的关系）
{
  "name": "Alice",
  "orderIds": [ObjectId("..."), ObjectId("...")]
}
```

选择原则：
- 经常一起读取 → 嵌入
- 独立更新 → 引用
- 数组会无限增长 → 引用
- 嵌入文档 < 16MB → 嵌入（MongoDB 文档大小限制是 16MB）

## 索引优化

```javascript
// 单字段索引
await users.createIndex({ email: 1 }, { unique: true });

// 复合索引
await users.createIndex({ "address.city": 1, age: -1 });

// 文本索引（全文搜索）
await users.createIndex({ name: "text", bio: "text" });
const results = await users.find({ $text: { $search: "developer Beijing" } }).toArray();

// 查看查询执行计划
const plan = await users.find({ age: { $gt: 25 } }).explain("executionStats");
console.log(plan.executionStats.totalDocsExamined);
```

## 数据导入导出

```bash
# 导出为 JSON（NDJSON 格式）
mongoexport --db myapp --collection users --out users.json

# 导入
mongoimport --db myapp --collection users --file users.json

# 导出为 JSON 数组
mongoexport --db myapp --collection users --jsonArray --out users_array.json
```

## 小结

- MongoDB 以 BSON（二进制 JSON）存储数据，API 使用 JSON 风格
- 支持嵌套文档、数组等复杂结构的增删改查
- 聚合管道是数据分析的强大工具
- Schema 设计时在嵌入和引用之间平衡
- 合理创建索引是查询性能的关键
'''

articles["48-postgresql-json.md"] = r'''# PostgreSQL JSON/JSONB 完全指南

> **分类**：实战应用　|　**级别**：高级　|　**标签**：PostgreSQL, JSONB, 关系数据库, SQL

## 为什么在关系数据库中用 JSON

现实世界中，数据结构并不总是规整的。用户设置、产品属性、事件日志等数据，每条记录的字段可能不同。PostgreSQL 的 JSONB 类型让你同时享受关系数据库的事务安全和 NoSQL 的灵活性。

## JSON vs JSONB

PostgreSQL 提供两种 JSON 类型：

| 特性 | json | jsonb |
|------|------|-------|
| 存储 | 文本原样 | 二进制解析后 |
| 保留格式 | ✓（空格、键序） | ✗（重新格式化） |
| 重复键 | 保留 | 只保留最后一个 |
| 索引 | ✗ | ✓（GIN 索引） |
| 查询性能 | 慢（每次解析） | 快 |

**结论：几乎总是选 JSONB**。除非你需要保留原始 JSON 格式。

## 基本操作

### 建表

```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10,2),
    attrs JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 插入数据

```sql
INSERT INTO products (name, price, attrs) VALUES
('MacBook Pro', 14999.00, '{
    "brand": "Apple",
    "cpu": "M3 Pro",
    "ram": 18,
    "storage": "512GB",
    "ports": ["USB-C", "HDMI", "MagSafe"],
    "colors": ["银色", "深空黑"]
}'),
('ThinkPad X1', 9999.00, '{
    "brand": "Lenovo",
    "cpu": "i7-1365U",
    "ram": 16,
    "storage": "512GB",
    "ports": ["USB-C", "USB-A", "HDMI"],
    "weight_kg": 1.12
}');
```

### 查询 JSON 字段

```sql
-- 提取文本值（->> 返回 text）
SELECT name, attrs->>'brand' AS brand, attrs->>'cpu' AS cpu
FROM products;

-- 提取 JSON 值（-> 返回 jsonb）
SELECT name, attrs->'ports' AS ports
FROM products;

-- 嵌套提取
SELECT attrs->'specs'->>'resolution' FROM products;

-- 路径提取（#>> 用路径数组）
SELECT attrs#>>'{ports,0}' AS first_port FROM products;
```

### 条件查询

```sql
-- 等值查询
SELECT * FROM products WHERE attrs->>'brand' = 'Apple';

-- 数值比较（先转换类型）
SELECT * FROM products WHERE (attrs->>'ram')::int >= 16;

-- 包含查询（@> 操作符：左侧包含右侧）
SELECT * FROM products WHERE attrs @> '{"brand": "Apple"}';

-- 数组包含
SELECT * FROM products WHERE attrs->'ports' @> '"HDMI"';

-- 键存在检查
SELECT * FROM products WHERE attrs ? 'weight_kg';

-- 任一键存在
SELECT * FROM products WHERE attrs ?| array['weight_kg', 'battery'];
```

### 修改 JSON

```sql
-- 更新字段
UPDATE products SET attrs = jsonb_set(attrs, '{ram}', '32') WHERE name = 'MacBook Pro';

-- 添加新字段
UPDATE products SET attrs = attrs || '{"warranty": "3 years"}' WHERE name = 'MacBook Pro';

-- 删除字段
UPDATE products SET attrs = attrs - 'weight_kg' WHERE name = 'ThinkPad X1';

-- 删除嵌套路径
UPDATE products SET attrs = attrs #- '{ports,2}';

-- 深层更新
UPDATE products SET attrs = jsonb_set(attrs, '{specs,resolution}', '"2560x1600"');
```

## 索引

JSONB 索引是查询性能的关键：

```sql
-- GIN 索引（支持 @>, ?, ?| 等操作符）
CREATE INDEX idx_products_attrs ON products USING GIN (attrs);

-- 表达式索引（针对特定字段）
CREATE INDEX idx_products_brand ON products ((attrs->>'brand'));
CREATE INDEX idx_products_ram ON products (((attrs->>'ram')::int));

-- 路径索引（jsonb_path_ops 更小更快，但只支持 @>）
CREATE INDEX idx_products_attrs_path ON products USING GIN (attrs jsonb_path_ops);
```

### 索引选择指南

| 查询模式 | 推荐索引 |
|---------|---------|
| `attrs @> '{"brand": "Apple"}'` | GIN (jsonb_path_ops) |
| `attrs->>'brand' = 'Apple'` | 表达式索引 (btree) |
| `attrs ? 'weight_kg'` | GIN (默认) |
| `(attrs->>'ram')::int > 16` | 表达式索引 (btree) |

## JSON 函数

```sql
-- 展开对象为键值对
SELECT * FROM jsonb_each('{"a":1,"b":2}');
-- key | value
-- a   | 1
-- b   | 2

-- 展开数组
SELECT * FROM jsonb_array_elements('["a","b","c"]');

-- 聚合为 JSON 数组
SELECT jsonb_agg(name) FROM products WHERE price > 10000;

-- 聚合为 JSON 对象
SELECT jsonb_object_agg(name, price) FROM products;

-- 获取所有键
SELECT DISTINCT jsonb_object_keys(attrs) AS key FROM products;

-- 统计各品牌数量
SELECT attrs->>'brand' AS brand, COUNT(*)
FROM products
GROUP BY attrs->>'brand'
ORDER BY COUNT(*) DESC;
```

## JSONPath（PostgreSQL 12+）

```sql
-- 查找 RAM >= 16 的产品
SELECT * FROM products WHERE attrs @? '$.ram ? (@ >= 16)';

-- 提取所有 USB-C 端口
SELECT jsonb_path_query(attrs, '$.ports[*] ? (@ starts with "USB")') FROM products;

-- 返回第一个匹配
SELECT jsonb_path_query_first(attrs, '$.ports[0]') FROM products;
```

## 实战模式

### 用户设置

```sql
CREATE TABLE user_settings (
    user_id INT PRIMARY KEY REFERENCES users(id),
    settings JSONB DEFAULT '{
        "theme": "light",
        "language": "zh-CN",
        "notifications": {"email": true, "push": true}
    }'
);

-- 更新单个设置
UPDATE user_settings
SET settings = jsonb_set(settings, '{theme}', '"dark"')
WHERE user_id = 1;

-- 读取特定设置
SELECT settings->>'theme' FROM user_settings WHERE user_id = 1;
```

### 事件日志

```sql
CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_type ON events (event_type, created_at);
CREATE INDEX idx_events_payload ON events USING GIN (payload);

-- 查询特定用户的购买事件
SELECT * FROM events
WHERE event_type = 'purchase'
  AND payload @> '{"user_id": 123}'
ORDER BY created_at DESC;
```

## 小结

- PostgreSQL JSONB 结合了关系型数据库的可靠性和文档存储的灵活性
- 几乎总是选 JSONB 而非 JSON
- `->` 提取 JSON 值，`->>` 提取文本值，`@>` 包含查询
- GIN 索引是 JSONB 查询性能的关键
- 适合用户设置、产品属性、事件日志等半结构化数据
'''

articles["49-elasticsearch-json.md"] = r'''# Elasticsearch 与 JSON：搜索引擎实战

> **分类**：实战应用　|　**级别**：高级　|　**标签**：Elasticsearch, 搜索, 全文检索, 索引

## Elasticsearch 与 JSON

Elasticsearch 是一个分布式搜索和分析引擎，它的核心就是 JSON：文档用 JSON 存储，查询用 JSON DSL 表达，结果以 JSON 返回。理解 JSON 就等于理解了 Elasticsearch 的大部分 API。

## 文档 CRUD

### 索引文档

```bash
# 创建/更新文档（指定 ID）
PUT /products/_doc/1
{
  "name": "机械键盘",
  "brand": "Cherry",
  "price": 599.00,
  "description": "Cherry MX 红轴机械键盘，87键紧凑布局",
  "tags": ["键盘", "机械", "Cherry"],
  "specs": {
    "switches": "MX Red",
    "keys": 87,
    "backlight": true
  },
  "created_at": "2025-01-15T10:00:00Z"
}

# 自动生成 ID
POST /products/_doc
{
  "name": "无线鼠标",
  "brand": "Logitech",
  "price": 299.00
}
```

### 查询文档

```bash
# 按 ID 查询
GET /products/_doc/1

# 简单搜索
GET /products/_search
{
  "query": {
    "match": { "description": "机械键盘" }
  }
}
```

### 更新文档

```bash
# 部分更新
POST /products/_update/1
{
  "doc": {
    "price": 549.00,
    "tags": ["键盘", "机械", "Cherry", "特价"]
  }
}

# 脚本更新
POST /products/_update/1
{
  "script": {
    "source": "ctx._source.price -= params.discount",
    "params": { "discount": 50 }
  }
}
```

### 删除文档

```bash
DELETE /products/_doc/1
```

## 查询 DSL

Elasticsearch 的查询 DSL 是一套强大的 JSON 查询语言：

### 全文搜索

```json
{
  "query": {
    "bool": {
      "must": [
        { "match": { "description": "机械键盘 红轴" } }
      ],
      "filter": [
        { "range": { "price": { "gte": 200, "lte": 1000 } } },
        { "term": { "brand": "Cherry" } }
      ],
      "should": [
        { "match": { "tags": "特价" } }
      ],
      "must_not": [
        { "term": { "specs.backlight": false } }
      ]
    }
  },
  "sort": [
    { "price": "asc" },
    "_score"
  ],
  "from": 0,
  "size": 20
}
```

查询类型解读：
- `must`：必须匹配，影响评分
- `filter`：必须匹配，不影响评分（更快，可缓存）
- `should`：可选匹配，匹配则加分
- `must_not`：必须不匹配

### 聚合分析

```json
{
  "size": 0,
  "aggs": {
    "brand_stats": {
      "terms": { "field": "brand.keyword", "size": 10 },
      "aggs": {
        "avg_price": { "avg": { "field": "price" } },
        "price_range": {
          "stats": { "field": "price" }
        }
      }
    },
    "price_histogram": {
      "histogram": {
        "field": "price",
        "interval": 200
      }
    }
  }
}
```

### 高亮显示

```json
{
  "query": { "match": { "description": "机械键盘" } },
  "highlight": {
    "pre_tags": ["<em>"],
    "post_tags": ["</em>"],
    "fields": {
      "description": {}
    }
  }
}
```

## Mapping（Schema 定义）

```json
PUT /products
{
  "mappings": {
    "properties": {
      "name": { "type": "text", "analyzer": "ik_max_word" },
      "brand": {
        "type": "text",
        "fields": { "keyword": { "type": "keyword" } }
      },
      "price": { "type": "float" },
      "description": { "type": "text", "analyzer": "ik_smart" },
      "tags": { "type": "keyword" },
      "specs": {
        "type": "object",
        "properties": {
          "switches": { "type": "keyword" },
          "keys": { "type": "integer" },
          "backlight": { "type": "boolean" }
        }
      },
      "created_at": { "type": "date" }
    }
  }
}
```

关键类型：
- `text`：全文搜索（分词）
- `keyword`：精确匹配（不分词）
- `object`：嵌套 JSON 对象
- `nested`：独立的嵌套文档（支持跨字段查询）

## 各语言客户端

### Python

```python
from elasticsearch import Elasticsearch

es = Elasticsearch("http://localhost:9200")

# 索引文档
es.index(index="products", id=1, document={
    "name": "机械键盘",
    "brand": "Cherry",
    "price": 599.00
})

# 搜索
result = es.search(index="products", query={
    "match": {"name": "键盘"}
})
for hit in result["hits"]["hits"]:
    print(f"{hit['_source']['name']}: {hit['_score']}")
```

### JavaScript

```javascript
const { Client } = require("@elastic/elasticsearch");
const client = new Client({ node: "http://localhost:9200" });

// 搜索
const result = await client.search({
  index: "products",
  query: { match: { name: "键盘" } }
});
result.hits.hits.forEach(hit => {
  console.log(hit._source.name, hit._score);
});
```

## 小结

- Elasticsearch 全面使用 JSON：文档存储、查询 DSL、API 交互
- 查询 DSL 中 `bool` 查询的四种子句覆盖绝大多数搜索场景
- `filter` 比 `must` 更快（不计算评分，可缓存）
- Mapping 定义文档结构，`text` 用于全文搜索，`keyword` 用于精确匹配
- 聚合功能强大，可用于统计分析和数据可视化
'''

articles["50-rest-api-json.md"] = r'''# REST API 中的 JSON 最佳实践

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
'''

articles["51-graphql-json.md"] = r'''# GraphQL 中的 JSON：灵活的数据查询

> **分类**：实战应用　|　**级别**：高级　|　**标签**：GraphQL, API, 查询语言, JSON响应

## GraphQL vs REST

REST API 常见的痛点：

1. **过度获取**：`GET /users/1` 返回 20 个字段，但你只需要 name 和 email
2. **获取不足**：获取用户信息后，还要再请求 `/users/1/orders` 获取订单
3. **多次往返**：一个页面需要调用 5-6 个 API 才能拿到所有数据

GraphQL 用一个请求解决所有问题：**客户端声明需要什么数据，服务端精确返回**。

## 基本查询

### 请求（JSON 包裹的 GraphQL 查询）

```json
{
  "query": "{ user(id: 123) { name email orders { id total } } }"
}
```

更可读的格式：

```graphql
{
  user(id: 123) {
    name
    email
    orders {
      id
      total
      items {
        productName
        quantity
      }
    }
  }
}
```

### 响应（标准 JSON）

```json
{
  "data": {
    "user": {
      "name": "Alice",
      "email": "alice@example.com",
      "orders": [
        {
          "id": "ORD-001",
          "total": 299.00,
          "items": [
            { "productName": "机械键盘", "quantity": 1 }
          ]
        }
      ]
    }
  }
}
```

一次请求，获取了用户信息 + 订单列表 + 订单商品详情。REST 需要 3 个请求。

## 变更操作（Mutation）

### 请求

```json
{
  "query": "mutation { createUser(input: { name: \"Bob\", email: \"bob@example.com\" }) { id name createdAt } }",
  "variables": {}
}
```

使用变量（推荐）：

```json
{
  "query": "mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id name createdAt } }",
  "variables": {
    "input": {
      "name": "Bob",
      "email": "bob@example.com",
      "role": "editor"
    }
  }
}
```

### 响应

```json
{
  "data": {
    "createUser": {
      "id": "125",
      "name": "Bob",
      "createdAt": "2025-01-15T10:30:00Z"
    }
  }
}
```

## 错误处理

GraphQL 错误和 REST 不同——即使有错误，HTTP 状态码通常仍是 200：

```json
{
  "data": {
    "user": null
  },
  "errors": [
    {
      "message": "用户不存在",
      "locations": [{ "line": 2, "column": 3 }],
      "path": ["user"],
      "extensions": {
        "code": "NOT_FOUND",
        "timestamp": "2025-01-15T10:00:00Z"
      }
    }
  ]
}
```

部分成功的情况（某些字段返回了数据，某些出错）：

```json
{
  "data": {
    "user": {
      "name": "Alice",
      "email": "alice@example.com",
      "creditScore": null
    }
  },
  "errors": [
    {
      "message": "信用评分服务暂时不可用",
      "path": ["user", "creditScore"],
      "extensions": { "code": "SERVICE_UNAVAILABLE" }
    }
  ]
}
```

## 实际代码示例

### 服务端（Node.js + Apollo Server）

```javascript
const { ApolloServer, gql } = require("apollo-server");

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    orders: [Order!]!
  }

  type Order {
    id: ID!
    total: Float!
    status: String!
  }

  type Query {
    user(id: ID!): User
    users(page: Int, pageSize: Int): [User!]!
  }

  input CreateUserInput {
    name: String!
    email: String!
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
  }
`;

const resolvers = {
  Query: {
    user: (_, { id }) => getUserById(id),
    users: (_, { page = 1, pageSize = 20 }) => getUsers(page, pageSize),
  },
  User: {
    orders: (user) => getOrdersByUserId(user.id), // 按需加载
  },
  Mutation: {
    createUser: (_, { input }) => createUser(input),
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
server.listen().then(({ url }) => console.log(`Server at ${url}`));
```

### 客户端请求

```javascript
async function fetchUser(userId) {
  const response = await fetch("/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query GetUser($id: ID!) {
          user(id: $id) {
            name
            email
            orders {
              id
              total
              status
            }
          }
        }
      `,
      variables: { id: userId }
    })
  });

  const { data, errors } = await response.json();
  if (errors) {
    console.error("GraphQL errors:", errors);
  }
  return data?.user;
}
```

## GraphQL JSON 响应与 REST 对比

| 维度 | REST JSON | GraphQL JSON |
|------|-----------|-------------|
| 数据结构 | 服务端决定 | 客户端声明 |
| 过度获取 | 常见 | 不存在 |
| 多资源获取 | 多次请求 | 一次请求 |
| 错误格式 | HTTP 状态码 + body | 200 + errors 数组 |
| 缓存 | HTTP 缓存友好 | 需要特殊处理 |
| 学习曲线 | 低 | 中 |

## 何时选择 GraphQL

适合 GraphQL 的场景：
- 移动端（带宽敏感，需要精确控制数据量）
- 复杂的关联数据查询
- 多种客户端需要不同的数据结构
- 快速迭代的前端需求

适合 REST 的场景：
- 简单的 CRUD API
- 需要 HTTP 缓存
- 文件上传/下载
- 公开 API（更直观）

## 小结

- GraphQL 请求和响应都是 JSON 格式
- 客户端声明需要的字段，服务端精确返回，避免过度获取
- 一次请求获取多层关联数据，减少网络往返
- 错误通过 `errors` 数组返回，支持部分成功
- 适合复杂数据需求和多客户端场景
'''

articles["52-json-config.md"] = r'''# JSON 配置文件最佳实践

> **分类**：实战应用　|　**级别**：高级　|　**标签**：配置文件, 最佳实践, package.json, tsconfig

## JSON 作为配置文件

JSON 是最常用的配置文件格式之一。`package.json`、`tsconfig.json`、`.eslintrc.json`、VS Code 的 `settings.json`——几乎每个现代开发工具都用 JSON 做配置。

## 常见配置文件解析

### package.json

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "description": "My awesome application",
  "main": "dist/index.js",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest",
    "lint": "eslint src/"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "license": "MIT"
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### .eslintrc.json

```json
{
  "root": true,
  "env": {
    "browser": true,
    "node": true,
    "es2022": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "prefer-const": "error"
  }
}
```

## 应用配置设计

### 多环境配置

```
config/
├── default.json      # 默认配置
├── development.json  # 开发环境覆盖
├── production.json   # 生产环境覆盖
└── test.json         # 测试环境覆盖
```

```json
// config/default.json
{
  "server": {
    "host": "0.0.0.0",
    "port": 3000
  },
  "database": {
    "host": "localhost",
    "port": 5432,
    "name": "myapp",
    "pool": {
      "min": 2,
      "max": 10
    }
  },
  "cache": {
    "ttl": 3600,
    "prefix": "myapp:"
  },
  "logging": {
    "level": "info",
    "format": "json"
  }
}
```

```json
// config/production.json — 只覆盖需要改变的部分
{
  "server": {
    "port": 8080
  },
  "database": {
    "host": "db.production.internal",
    "pool": { "min": 10, "max": 50 }
  },
  "logging": {
    "level": "warn"
  }
}
```

### 配置合并（Node.js）

```javascript
const defaultConfig = require("./config/default.json");
const envConfig = require(`./config/${process.env.NODE_ENV || "development"}.json`);

// 深度合并
function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

const config = deepMerge(defaultConfig, envConfig);
```

## JSON 配置的局限性

| 问题 | 说明 | 替代方案 |
|------|------|----------|
| 不支持注释 | 无法写说明 | JSON5 / JSONC |
| 不支持尾逗号 | 容易出错 | JSON5 / JSONC |
| 不支持多行字符串 | 长文本不方便 | YAML / TOML |
| 不支持环境变量引用 | `$DB_HOST` 无法内嵌 | 代码层面处理 |
| 不支持 include | 不能引用其他文件 | 代码层面处理 |

### JSONC（JSON with Comments）

VS Code 使用 JSONC 格式，支持注释和尾逗号：

```jsonc
{
  // 编辑器设置
  "editor.fontSize": 14,
  "editor.tabSize": 2,

  /* 终端设置 */
  "terminal.integrated.fontSize": 13,

  // 尾逗号是允许的
  "files.autoSave": "afterDelay",
}
```

## 安全注意事项

### 不要在 JSON 配置中存储密钥

```json
// ❌ 密钥不应在配置文件中
{
  "database": {
    "password": "super_secret_123"
  },
  "api_key": "sk-xxxxxxxxxxxx"
}

// ✓ 使用环境变量
{
  "database": {
    "password_env": "DB_PASSWORD"
  }
}
```

```javascript
// 代码中读取环境变量
const dbPassword = process.env[config.database.password_env];
```

### .gitignore

```gitignore
# 不要把敏感配置提交到代码仓库
config/local.json
config/secrets.json
.env
```

## JSON Schema 验证配置

为你的配置文件编写 JSON Schema，可以在编辑器中获得自动补全和错误提示：

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["server", "database"],
  "properties": {
    "server": {
      "type": "object",
      "properties": {
        "host": { "type": "string", "default": "0.0.0.0" },
        "port": { "type": "integer", "minimum": 1, "maximum": 65535 }
      }
    },
    "database": {
      "type": "object",
      "required": ["host", "name"],
      "properties": {
        "host": { "type": "string" },
        "port": { "type": "integer", "default": 5432 },
        "name": { "type": "string" }
      }
    }
  }
}
```

在 VS Code 中，`settings.json` 会自动根据 Schema 提供补全。你的自定义配置也可以享受同样的体验。

## 小结

- JSON 是最流行的配置文件格式，被主流开发工具广泛使用
- 多环境配置推荐"默认 + 覆盖"模式
- JSON 不支持注释是主要局限，JSONC/JSON5 是解决方案
- 密钥和敏感信息不要放在 JSON 配置中，使用环境变量
- 为配置文件编写 JSON Schema，获得编辑器辅助和验证
'''

articles["53-json-ai-llm.md"] = r'''# JSON 与 AI/LLM：构建智能应用的数据桥梁

> **分类**：实战应用　|　**级别**：高级　|　**标签**：AI, LLM, 大模型, 结构化输出, Function Calling

## JSON 在 AI 时代的核心角色

大语言模型（LLM）的崛起让 JSON 成为了人与 AI 交互的核心数据格式。从 API 调用到结构化输出，从 Function Calling 到 RAG 系统，JSON 无处不在。

## LLM API 的 JSON 交互

### OpenAI / 兼容 API 请求

```json
{
  "model": "gpt-4",
  "messages": [
    { "role": "system", "content": "你是一个专业的数据分析师。" },
    { "role": "user", "content": "分析这段销售数据的趋势。" }
  ],
  "temperature": 0.7,
  "max_tokens": 2000,
  "response_format": { "type": "json_object" }
}
```

### 响应

```json
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "model": "gpt-4",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "{\"trend\": \"上升\", \"growth_rate\": 15.3, \"peak_month\": \"11月\"}"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 156,
    "completion_tokens": 89,
    "total_tokens": 245
  }
}
```

## 结构化输出

让 LLM 输出结构化 JSON 而非自由文本，是构建可靠 AI 应用的关键。

### 方法一：System Prompt 约束

```json
{
  "messages": [
    {
      "role": "system",
      "content": "你是一个商品信息提取器。请从用户描述中提取信息，严格按以下 JSON 格式输出，不要输出其他内容：\n{\"name\": \"商品名\", \"price\": 数字, \"category\": \"分类\", \"features\": [\"特点1\", \"特点2\"]}"
    },
    {
      "role": "user",
      "content": "这款Cherry红轴机械键盘很不错，87键紧凑设计，RGB背光，售价599元"
    }
  ]
}
```

### 方法二：JSON Mode

```json
{
  "model": "gpt-4-turbo",
  "messages": [...],
  "response_format": { "type": "json_object" }
}
```

开启 JSON Mode 后，模型保证输出合法 JSON。

### 方法三：JSON Schema 约束（推荐）

```json
{
  "model": "gpt-4o",
  "messages": [...],
  "response_format": {
    "type": "json_schema",
    "json_schema": {
      "name": "product_extraction",
      "strict": true,
      "schema": {
        "type": "object",
        "required": ["name", "price", "category"],
        "properties": {
          "name": { "type": "string" },
          "price": { "type": "number" },
          "category": { "type": "string", "enum": ["电子产品", "服装", "食品", "其他"] },
          "features": {
            "type": "array",
            "items": { "type": "string" }
          }
        },
        "additionalProperties": false
      }
    }
  }
}
```

这是最可靠的方式——API 保证输出严格匹配 Schema。

## Function Calling / Tool Use

Function Calling 让 LLM 可以调用外部工具，定义和交互全部使用 JSON：

### 定义工具

```json
{
  "model": "gpt-4",
  "messages": [
    { "role": "user", "content": "北京今天天气怎么样？" }
  ],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "获取指定城市的天气信息",
        "parameters": {
          "type": "object",
          "required": ["city"],
          "properties": {
            "city": { "type": "string", "description": "城市名称" },
            "unit": { "type": "string", "enum": ["celsius", "fahrenheit"], "default": "celsius" }
          }
        }
      }
    }
  ]
}
```

### 模型调用工具

```json
{
  "choices": [{
    "message": {
      "role": "assistant",
      "tool_calls": [{
        "id": "call_abc123",
        "type": "function",
        "function": {
          "name": "get_weather",
          "arguments": "{\"city\": \"北京\", \"unit\": \"celsius\"}"
        }
      }]
    }
  }]
}
```

### 返回工具结果

```json
{
  "messages": [
    { "role": "user", "content": "北京今天天气怎么样？" },
    { "role": "assistant", "tool_calls": [{ "id": "call_abc123", ... }] },
    {
      "role": "tool",
      "tool_call_id": "call_abc123",
      "content": "{\"city\": \"北京\", \"temperature\": 5, \"condition\": \"晴\", \"humidity\": 30}"
    }
  ]
}
```

模型根据工具返回的 JSON 生成最终回答。

## RAG 系统中的 JSON

检索增强生成（RAG）系统中，JSON 用于存储和传递检索结果：

```json
{
  "messages": [
    {
      "role": "system",
      "content": "基于以下检索到的文档回答用户问题。如果文档中没有答案，请说明。"
    },
    {
      "role": "user",
      "content": "退货政策是什么？\n\n---检索到的文档---\n[{\"title\": \"退货政策\", \"content\": \"自购买之日起30天内可无理由退货...\", \"score\": 0.95}, {\"title\": \"运费说明\", \"content\": \"退货运费由买家承担...\", \"score\": 0.82}]"
    }
  ]
}
```

### 向量数据库的 JSON 交互

```python
# Pinecone 示例
index.upsert(vectors=[
    {
        "id": "doc-001",
        "values": embedding_vector,  # [0.1, 0.2, ...]
        "metadata": {
            "title": "退货政策",
            "category": "customer-service",
            "updated_at": "2025-01-15"
        }
    }
])

# 查询结果也是 JSON
results = index.query(
    vector=query_embedding,
    top_k=5,
    include_metadata=True
)
# results.matches = [
#   {"id": "doc-001", "score": 0.95, "metadata": {...}},
#   ...
# ]
```

## AI Agent 的 JSON 通信

AI Agent 使用 JSON 管理状态和行动计划：

```json
{
  "task": "分析竞品定价并生成报告",
  "steps": [
    {
      "action": "web_search",
      "params": { "query": "竞品 A 最新定价" },
      "status": "completed",
      "result": { "price": 999, "source": "official_site" }
    },
    {
      "action": "web_search",
      "params": { "query": "竞品 B 最新定价" },
      "status": "completed",
      "result": { "price": 1299, "source": "jd.com" }
    },
    {
      "action": "analyze",
      "params": { "type": "price_comparison" },
      "status": "in_progress"
    },
    {
      "action": "generate_report",
      "params": { "format": "markdown" },
      "status": "pending"
    }
  ],
  "memory": {
    "competitors": ["A", "B"],
    "our_price": 1099
  }
}
```

## 训练数据格式

微调 LLM 的训练数据通常使用 JSONL（NDJSON）格式：

```jsonl
{"messages": [{"role": "system", "content": "你是客服助手"}, {"role": "user", "content": "怎么退货？"}, {"role": "assistant", "content": "您好，30天内可以申请退货..."}]}
{"messages": [{"role": "user", "content": "运费多少？"}, {"role": "assistant", "content": "标准运费为10元..."}]}
```

每行一个训练样本，方便流式处理和追加。

## 小结

- JSON 是 LLM API 交互的标准格式（请求、响应、工具调用）
- 结构化输出通过 JSON Schema 约束保证可靠性
- Function Calling 用 JSON Schema 定义工具接口
- RAG 系统中 JSON 承载检索结果和上下文
- 训练数据使用 JSONL 格式，支持高效的流式处理
- 掌握 JSON 是构建 AI 应用的基础技能
'''

for filename, content in articles.items():
    filepath = os.path.join(OUT, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")
    print(f"✓ {filename} ({len(content)} bytes)")

print(f"\nDone: {len(articles)} articles written")
