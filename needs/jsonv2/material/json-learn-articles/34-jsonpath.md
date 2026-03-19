# JSONPath 查询语法完全指南

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
