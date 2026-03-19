# Elasticsearch 与 JSON：搜索引擎实战

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
