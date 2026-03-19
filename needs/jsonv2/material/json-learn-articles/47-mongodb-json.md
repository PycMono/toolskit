# MongoDB 与 JSON：文档数据库实战

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
