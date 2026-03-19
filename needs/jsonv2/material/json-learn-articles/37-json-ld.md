# JSON-LD：让你的数据被搜索引擎理解

> **分类**：高级主题　|　**级别**：高级　|　**标签**：JSON-LD, 语义化, SEO, Schema.org, 结构化数据

## 什么是 JSON-LD

JSON-LD（JSON for Linking Data）是一种基于 JSON 的语义化数据格式，它让普通的 JSON 数据具有 **机器可理解的含义**。

普通 JSON 中 `"name": "Alice"` 只是一个键值对。但 JSON-LD 可以告诉机器：这个 `name` 是一个 `Person`（人物）的名字，遵循 Schema.org 的定义。

最直接的好处：**Google、Bing 等搜索引擎能理解你的页面内容，展示富摘要（Rich Snippets）**。

## 基础语法

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "张三",
  "jobTitle": "前端工程师",
  "email": "zhangsan@example.com",
  "url": "https://zhangsan.dev"
}
```

核心关键字：

| 关键字 | 含义 |
|--------|------|
| `@context` | 定义词汇表（通常是 Schema.org） |
| `@type` | 数据的类型 |
| `@id` | 资源的唯一标识（URI） |
| `@graph` | 包含多个关联资源 |

## 嵌入网页

将 JSON-LD 放在 HTML 的 `<script>` 标签中：

```html
<head>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "JSON-LD 完全指南",
    "author": {
      "@type": "Person",
      "name": "张三"
    },
    "datePublished": "2025-01-15",
    "publisher": {
      "@type": "Organization",
      "name": "TechBlog",
      "logo": {
        "@type": "ImageObject",
        "url": "https://example.com/logo.png"
      }
    }
  }
  </script>
</head>
```

## 常见 Schema.org 类型

### 组织/公司

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Acme 科技",
  "url": "https://acme.com",
  "logo": "https://acme.com/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+86-10-12345678",
    "contactType": "customer service"
  },
  "sameAs": [
    "https://twitter.com/acme",
    "https://github.com/acme"
  ]
}
```

### 产品

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "JSON 验证工具 Pro",
  "description": "专业的 JSON 在线验证和格式化工具",
  "brand": { "@type": "Brand", "name": "ToolboxNova" },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "1250"
  }
}
```

### FAQ 页面

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "什么是 JSON？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "JSON 是一种轻量级的数据交换格式..."
      }
    },
    {
      "@type": "Question",
      "name": "JSON 和 XML 有什么区别？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "JSON 更轻量、易读，而 XML 支持属性和命名空间..."
      }
    }
  ]
}
```

### 面包屑导航

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "首页", "item": "https://example.com" },
    { "@type": "ListItem", "position": 2, "name": "教程", "item": "https://example.com/learn" },
    { "@type": "ListItem", "position": 3, "name": "JSON-LD 指南" }
  ]
}
```

## @graph：多个实体

一个页面中描述多个实体：

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://example.com/article/json-ld",
      "name": "JSON-LD 教程"
    },
    {
      "@type": "Article",
      "isPartOf": { "@id": "https://example.com/article/json-ld" },
      "headline": "JSON-LD 完全指南",
      "author": { "@type": "Person", "name": "张三" }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [ ... ]
    }
  ]
}
```

## 验证工具

1. **Google 富摘要测试工具** — search.google.com/test/rich-results
2. **Schema.org 验证器** — validator.schema.org
3. **JSON-LD Playground** — json-ld.org/playground

## SEO 效果

正确使用 JSON-LD 后，Google 搜索结果可能展示：

- **文章**：标题、发布日期、作者头像
- **产品**：价格、评分、库存状态
- **FAQ**：问答折叠展示
- **评价**：星级评分
- **事件**：时间、地点、购票链接
- **食谱**：烹饪时间、热量、评分

## JSON-LD vs Microdata vs RDFa

| 维度 | JSON-LD | Microdata | RDFa |
|------|---------|-----------|------|
| 格式 | 独立 JSON 块 | 嵌入 HTML 属性 | 嵌入 HTML 属性 |
| 维护性 | 高（与 HTML 分离） | 低（与 HTML 耦合） | 低 |
| Google 推荐 | ✓ 首选 | 支持 | 支持 |
| 实现难度 | 低 | 中 | 高 |

Google 官方推荐 JSON-LD，因为它不需要修改 HTML 结构。

## 小结

- JSON-LD 用 `@context`、`@type`、`@id` 赋予 JSON 语义含义
- 嵌入 `<script type="application/ld+json">` 标签中
- 使用 Schema.org 词汇表描述文章、产品、组织、FAQ 等
- 正确使用可获得 Google 富摘要展示，提升 SEO 效果
- Google 验证工具可以检查结构化数据是否正确
