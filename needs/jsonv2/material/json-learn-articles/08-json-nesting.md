# JSON 嵌套结构与复杂数据建模

> **分类**：基础入门　|　**级别**：入门　|　**标签**：JSON, 嵌套, 数据建模, 结构设计

## 嵌套结构基础

JSON 的强大之处在于可以通过嵌套对象和数组表达复杂的层次化数据。

## 对象中嵌套对象

```json
{
  "user": {
    "name": "Alice",
    "address": {
      "street": "123 Main St",
      "city": "Beijing",
      "country": {
        "code": "CN",
        "name": "China"
      }
    }
  }
}
```

## 对象中嵌套数组

```json
{
  "order": {
    "id": "ORD-2025-001",
    "items": [
      { "product": "Laptop", "quantity": 1, "price": 999.99 },
      { "product": "Mouse", "quantity": 2, "price": 29.99 }
    ],
    "tags": ["electronics", "express"]
  }
}
```

## 数组中嵌套对象

```json
{
  "employees": [
    {
      "name": "Alice",
      "skills": ["Python", "Go"],
      "projects": [
        { "name": "API Gateway", "role": "lead" }
      ]
    },
    {
      "name": "Bob",
      "skills": ["React", "TypeScript"],
      "projects": [
        { "name": "Dashboard", "role": "developer" }
      ]
    }
  ]
}
```

## 数组中嵌套数组

```json
{
  "spreadsheet": [
    ["Name", "Age", "City"],
    ["Alice", 25, "Beijing"],
    ["Bob", 30, "Shanghai"],
    ["Charlie", 28, "Shenzhen"]
  ]
}
```

## 真实世界的复杂嵌套示例

### 电商商品数据

```json
{
  "product": {
    "id": "SKU-10086",
    "name": "Wireless Headphones Pro",
    "brand": "AudioTech",
    "price": {
      "amount": 199.99,
      "currency": "USD",
      "discount": {
        "type": "percentage",
        "value": 15,
        "validUntil": "2025-12-31"
      }
    },
    "variants": [
      {
        "color": "Black",
        "sku": "SKU-10086-BK",
        "stock": 150,
        "images": [
          { "url": "/img/headphones-bk-1.jpg", "alt": "Black front view" },
          { "url": "/img/headphones-bk-2.jpg", "alt": "Black side view" }
        ]
      },
      {
        "color": "White",
        "sku": "SKU-10086-WH",
        "stock": 80,
        "images": [
          { "url": "/img/headphones-wh-1.jpg", "alt": "White front view" }
        ]
      }
    ],
    "specs": {
      "weight": "250g",
      "battery": "30h",
      "connectivity": ["Bluetooth 5.3", "USB-C", "3.5mm"]
    },
    "reviews": {
      "average": 4.6,
      "count": 1280,
      "distribution": { "5": 800, "4": 300, "3": 100, "2": 50, "1": 30 }
    }
  }
}
```

## 嵌套深度控制

### 过深嵌套的问题

```json
{
  "a": {
    "b": {
      "c": {
        "d": {
          "e": {
            "f": {
              "value": "太深了！"
            }
          }
        }
      }
    }
  }
}
```

问题：
- 可读性差
- 访问路径冗长：`data.a.b.c.d.e.f.value`
- 容易产生空指针错误
- 解析性能下降

### 扁平化重构

```json
{
  "userId": "u_001",
  "userName": "Alice",
  "addressCity": "Beijing",
  "addressCountryCode": "CN"
}
```

或使用引用模式：

```json
{
  "users": {
    "u_001": { "name": "Alice", "addressId": "addr_001" }
  },
  "addresses": {
    "addr_001": { "city": "Beijing", "countryCode": "CN" }
  }
}
```

## 数据访问路径

用点号和方括号表示嵌套数据的访问路径：

```
product.name                    → "Wireless Headphones Pro"
product.price.amount            → 199.99
product.variants[0].color       → "Black"
product.variants[0].images[1].url → "/img/headphones-bk-2.jpg"
product.specs.connectivity[2]   → "3.5mm"
product.reviews.distribution.5  → 800
```

这种路径表示法在 JSONPath、jq 等工具中广泛使用。

## 设计原则

1. **合理嵌套**：3-4 层为宜，超过考虑扁平化
2. **一致的结构**：同类数据保持相同的嵌套结构
3. **明确的语义**：每层嵌套都应有明确含义
4. **避免循环引用**：JSON 不支持引用，不能表达循环结构
5. **考虑查询需求**：如果经常需要深层访问，考虑提升到更高层级

## 小结

- JSON 支持对象和数组的任意嵌套组合
- 嵌套使 JSON 能表达复杂的层次化数据
- 控制嵌套深度在 3-4 层以内
- 过深嵌套可通过扁平化或引用模式优化
- 设计嵌套结构时要考虑可读性和查询便利性
