# 什么是 JSON？零基础完全入门

> **分类**：基础入门　|　**级别**：入门　|　**标签**：JSON, 入门, 数据格式, 基础概念

## 什么是 JSON

JSON（JavaScript Object Notation）是一种轻量级的数据交换格式。尽管名字中包含 JavaScript，但它是一种**语言无关**的格式，几乎所有主流编程语言都提供了 JSON 的解析和生成支持。

JSON 由 Douglas Crockford 在 2001 年左右推广，并于 2006 年被 RFC 4627 标准化，后来由 RFC 8259（2017）和 ECMA-404 进行了更新。

## 为什么 JSON 如此流行

JSON 成为互联网数据交换事实标准的原因：

1. **人类可读**：纯文本格式，不需要特殊工具即可阅读和编写
2. **机器友好**：解析速度快，生成简单
3. **语言无关**：Python、Java、Go、C#、PHP、Ruby、Rust 等几乎所有语言都原生支持
4. **体积小巧**：相比 XML 等格式，JSON 的数据冗余更少
5. **结构灵活**：支持嵌套，可以表达复杂的数据关系

## JSON 的基本结构

JSON 只有两种基本结构：

### 对象（Object）

用花括号 `{}` 包裹的键值对集合：

```json
{
  "name": "张三",
  "age": 28,
  "city": "北京"
}
```

### 数组（Array）

用方括号 `[]` 包裹的有序值列表：

```json
["苹果", "香蕉", "橙子"]
```

## JSON 支持的数据类型

JSON 支持以下六种数据类型：

| 类型 | 示例 | 说明 |
|------|------|------|
| 字符串 | `"Hello"` | 必须用双引号 |
| 数值 | `42`, `3.14`, `-1`, `2.5e10` | 整数或浮点数 |
| 布尔值 | `true`, `false` | 小写 |
| null | `null` | 表示空值，小写 |
| 对象 | `{"key": "value"}` | 键值对集合 |
| 数组 | `[1, 2, 3]` | 有序列表 |

## 一个完整的 JSON 示例

```json
{
  "company": "ToolboxNova",
  "founded": 2024,
  "isPublic": false,
  "headquarters": {
    "city": "San Francisco",
    "country": "US"
  },
  "products": [
    {
      "name": "JSON Formatter",
      "type": "web-tool",
      "free": true
    },
    {
      "name": "Image Compressor",
      "type": "web-tool",
      "free": true
    }
  ],
  "investors": null
}
```

## JSON 与 JavaScript 对象的区别

虽然 JSON 源自 JavaScript 对象语法，但有几个重要区别：

| 特性 | JSON | JavaScript 对象 |
|------|------|----------------|
| 键名引号 | **必须**用双引号 | 可以不用引号 |
| 字符串引号 | 只能用双引号 | 单引号或双引号 |
| 注释 | ❌ 不支持 | ✅ 支持 |
| 尾随逗号 | ❌ 不允许 | ✅ 允许 |
| 函数 | ❌ 不支持 | ✅ 支持 |
| undefined | ❌ 不支持 | ✅ 支持 |

```javascript
// ✅ JavaScript 对象（合法）
const obj = {
  name: 'Alice',  // 单引号、无引号键名、注释都可以
  age: 25,        // 尾随逗号合法
};

// ✅ JSON（合法）
{
  "name": "Alice",
  "age": 25
}
```

## JSON 的常见应用场景

1. **Web API 数据传输**：REST API 和 GraphQL 最常用的数据格式
2. **配置文件**：`package.json`、`tsconfig.json`、`.eslintrc.json` 等
3. **数据存储**：MongoDB 文档、浏览器 localStorage
4. **日志记录**：结构化日志（Structured Logging）
5. **数据序列化**：进程间通信、消息队列

## MIME 类型与文件扩展名

- **MIME 类型**：`application/json`
- **文件扩展名**：`.json`
- **HTTP 请求头**：`Content-Type: application/json`

## 在线验证你的第一个 JSON

将以下内容复制到 JSON 验证工具中进行验证：

```json
{
  "message": "Hello, JSON!",
  "timestamp": "2025-01-15T10:30:00Z",
  "success": true,
  "data": {
    "items": [1, 2, 3],
    "count": 3
  }
}
```

如果验证通过，恭喜你已经理解了 JSON 的基本结构！

## 小结

- JSON 是一种轻量级、语言无关的数据交换格式
- 由对象 `{}` 和数组 `[]` 两种基本结构组成
- 支持字符串、数值、布尔值、null、对象、数组六种类型
- 键名**必须**使用双引号
- 不支持注释和尾随逗号
- 已成为 Web 数据交换的事实标准

## 下一步

继续阅读 [JSON 语法规则权威指南](/json/learn#article-2)，深入了解 JSON 的语法细节和规范要求。
