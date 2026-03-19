# PostgreSQL JSON/JSONB 完全指南

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
