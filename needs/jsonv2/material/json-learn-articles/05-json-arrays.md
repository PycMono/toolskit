# JSON 数组（Array）完全指南

> **分类**：基础入门　|　**级别**：入门　|　**标签**：JSON, 数组, 列表, 集合

## 什么是 JSON 数组

JSON 数组是由方括号 `[]` 包裹的有序值列表。数组中的每个元素可以是任何合法的 JSON 类型。

## 基本语法

```json
[1, 2, 3, 4, 5]
```

## 数组元素类型

### 同类型数组（推荐）

```json
{
  "names": ["Alice", "Bob", "Charlie"],
  "scores": [98, 85, 72, 91],
  "flags": [true, false, true, true]
}
```

### 混合类型数组（合法但需谨慎）

```json
["text", 42, true, null, {"key": "value"}, [1, 2]]
```

虽然 JSON 语法允许混合类型，但在实际开发中应避免，因为它会导致类型安全问题。

## 常见数组模式

### 记录列表

最常见的模式——对象数组：

```json
{
  "users": [
    { "id": 1, "name": "Alice", "role": "admin" },
    { "id": 2, "name": "Bob", "role": "editor" },
    { "id": 3, "name": "Charlie", "role": "viewer" }
  ]
}
```

### 二维数组（矩阵）

```json
{
  "matrix": [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
  ],
  "chessboard": [
    ["r", "n", "b", "q", "k", "b", "n", "r"],
    ["p", "p", "p", "p", "p", "p", "p", "p"]
  ]
}
```

### 元组模拟

JSON 没有元组类型，但可以用固定长度数组模拟：

```json
{
  "coordinates": [39.9042, 116.4074],
  "rgb": [255, 128, 0],
  "range": [1, 100]
}
```

### 标签/分类列表

```json
{
  "tags": ["json", "tutorial", "beginner"],
  "categories": ["web-development", "data-format"]
}
```

## 空数组

```json
{
  "items": [],
  "results": []
}
```

空数组表示"有这个字段，但目前没有元素"，与 `null` 含义不同。

## 嵌套数组

```json
{
  "departments": [
    {
      "name": "Engineering",
      "teams": [
        {
          "name": "Frontend",
          "members": ["Alice", "Bob"]
        },
        {
          "name": "Backend",
          "members": ["Charlie", "David"]
        }
      ]
    }
  ]
}
```

## 数组的分页模式

API 中返回数组数据时，通常配合分页信息：

```json
{
  "data": [
    { "id": 1, "title": "Article 1" },
    { "id": 2, "title": "Article 2" }
  ],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "total": 156,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 数组大小的最佳实践

- **API 响应**：单次返回不超过 100-200 条记录
- **配置文件**：没有硬限制，但保持可读性
- **日志数据**：考虑使用 NDJSON（每行一条）替代大数组

## 数组排序

JSON 数组是有序的，元素顺序有意义。如果需要表达排序信息：

```json
{
  "leaderboard": [
    { "rank": 1, "name": "Alice", "score": 9800 },
    { "rank": 2, "name": "Bob", "score": 9500 },
    { "rank": 3, "name": "Charlie", "score": 9200 }
  ],
  "sortBy": "score",
  "sortOrder": "desc"
}
```

## 小结

- 数组是有序的值列表，用方括号包裹
- 元素可以是任何 JSON 类型，但建议保持同类型
- 对象数组是最常用的模式
- 空数组 `[]` 合法且有明确含义
- 在 API 设计中注意数组大小和分页
