# JSON vs XML：全面对比与选型指南

> **分类**：格式对比　|　**级别**：中级　|　**标签**：JSON, XML, 对比, 数据格式

## 核心对比

| 维度 | JSON | XML |
|------|------|-----|
| 可读性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 数据体积 | 小 | 大（标签冗余） |
| 解析速度 | 快 | 较慢 |
| 数据类型 | 原生支持 | 全部是文本 |
| Schema | JSON Schema | XSD / DTD |
| 注释 | ❌ 不支持 | ✅ 支持 |
| 命名空间 | ❌ 不支持 | ✅ 支持 |
| 属性 | ❌ 不支持 | ✅ 支持 |
| XSLT 转换 | ❌ | ✅ |

## 语法对比

```json
{
  "bookstore": {
    "books": [
      { "title": "Go Programming", "author": "Rob Pike", "price": 39.99, "inStock": true },
      { "title": "Rust in Action", "author": "Tim McNamara", "price": 49.99, "inStock": false }
    ]
  }
}
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <book inStock="true">
    <title>Go Programming</title>
    <author>Rob Pike</author>
    <price>39.99</price>
  </book>
  <book inStock="false">
    <title>Rust in Action</title>
    <author>Tim McNamara</author>
    <price>49.99</price>
  </book>
</bookstore>
```

## 体积对比

| 场景 | JSON 体积 | XML 体积 | 差异 |
|------|----------|---------|------|
| 简单对象 | 50B | 120B | XML 大 140% |
| 10 条记录 | 800B | 1.6KB | XML 大 100% |
| 1000 条记录 | 65KB | 130KB | XML 大 100% |

## 何时选择 JSON

- REST API 数据交换
- 前端与后端通信
- 配置文件（package.json 等）
- NoSQL 数据库存储
- 移动端数据传输

## 何时选择 XML

- SOAP Web Services
- 文档标记（如 XHTML、SVG）
- 需要 Schema 严格验证的场景
- 遗留系统集成
- 需要命名空间和属性的场景
- 需要 XSLT 转换

## 互转示例

```javascript
// JSON → XML（使用 fast-xml-parser）
const { XMLBuilder } = require('fast-xml-parser');
const builder = new XMLBuilder({ format: true });
const xml = builder.build(jsonData);

// XML → JSON
const { XMLParser } = require('fast-xml-parser');
const parser = new XMLParser();
const json = parser.parse(xmlStr);
```

## 小结

JSON 轻量快速，适合 Web API 和现代应用。XML 功能丰富，适合文档标记和企业集成。新项目优先选择 JSON。
