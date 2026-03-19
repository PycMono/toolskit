# JSON Pointer：精确定位 JSON 中的值

> **分类**：高级主题　|　**级别**：高级　|　**标签**：JSON Pointer, RFC 6901, 路径引用

## 什么是 JSON Pointer

JSON Pointer（RFC 6901）是一种用字符串路径精确定位 JSON 文档中某个值的标准语法。它被 JSON Schema（`$ref`）、JSON Patch（`path`）、OpenAPI 等规范广泛使用。

```
/store/books/0/title
```

这个指针表示：根对象 → `store` 属性 → `books` 属性 → 第 0 个元素 → `title` 属性。

## 语法规则

| 规则 | 说明 |
|------|------|
| 空字符串 `""` | 指向整个文档（根） |
| 以 `/` 开头 | 每个 `/` 分隔一个层级 |
| 数组用数字索引 | `/items/0` 表示第一个元素 |
| `~0` 转义 `~` | 字段名含 `~` 时用 `~0` |
| `~1` 转义 `/` | 字段名含 `/` 时用 `~1` |

### 转义示例

JSON 数据：

```json
{
  "a/b": 1,
  "c~d": 2,
  "m~n/o": 3
}
```

| JSON Pointer | 目标值 |
|-------------|--------|
| `/a~1b` | `1`（`/` → `~1`） |
| `/c~0d` | `2`（`~` → `~0`） |
| `/m~0n~1o` | `3`（先 `~` → `~0`，再 `/` → `~1`） |

> 转义顺序：先处理 `~0`（`~`），再处理 `~1`（`/`）。

## 完整示例

```json
{
  "users": [
    {
      "name": "Alice",
      "contacts": {
        "email": "alice@example.com",
        "phones": ["+86-138-0001-0001", "+86-139-0002-0002"]
      }
    },
    {
      "name": "Bob",
      "contacts": {
        "email": "bob@example.com"
      }
    }
  ],
  "metadata": {
    "version": 2,
    "tags": ["production", "v2"]
  }
}
```

| JSON Pointer | 结果 |
|-------------|------|
| `` (空) | 整个文档 |
| `/users` | 用户数组 |
| `/users/0` | Alice 对象 |
| `/users/0/name` | `"Alice"` |
| `/users/0/contacts/phones/1` | `"+86-139-0002-0002"` |
| `/users/1/contacts/email` | `"bob@example.com"` |
| `/metadata/tags/0` | `"production"` |

## 各语言实现

### JavaScript

```javascript
// 简单实现
function resolvePointer(obj, pointer) {
  if (pointer === "") return obj;
  const tokens = pointer.slice(1).split("/").map(t =>
    t.replace(/~1/g, "/").replace(/~0/g, "~")
  );
  let current = obj;
  for (const token of tokens) {
    if (current === null || current === undefined) return undefined;
    current = Array.isArray(current) ? current[parseInt(token)] : current[token];
  }
  return current;
}

// 使用
const data = { users: [{ name: "Alice" }] };
console.log(resolvePointer(data, "/users/0/name")); // "Alice"
```

### Python

```python
import jsonpointer

data = {
    "users": [{"name": "Alice"}, {"name": "Bob"}],
    "meta": {"version": 2}
}

# 解析
print(jsonpointer.resolve_pointer(data, "/users/0/name"))  # "Alice"

# 设置值
jsonpointer.set_pointer(data, "/meta/version", 3)
print(data["meta"]["version"])  # 3
```

## 在 JSON Schema 中的应用

```json
{
  "$defs": {
    "address": {
      "type": "object",
      "properties": {
        "city": { "type": "string" }
      }
    }
  },
  "properties": {
    "home": { "$ref": "#/$defs/address" }
  }
}
```

`#/$defs/address` 中，`#` 代表当前文档，后面跟的就是 JSON Pointer。

## JSON Pointer vs JSONPath

| 维度 | JSON Pointer | JSONPath |
|------|-------------|----------|
| 标准 | RFC 6901 | RFC 9535 |
| 定位 | 单个精确值 | 可匹配多个值 |
| 通配符 | 不支持 | `*`、`..` |
| 过滤 | 不支持 | `?(@.price > 10)` |
| 用途 | 引用、Patch、Schema | 查询、提取 |

简单说：**JSON Pointer 是地址，JSONPath 是查询语言**。

## 小结

- JSON Pointer 用 `/` 分隔路径精确定位 JSON 中的单个值
- `~0` 转义 `~`，`~1` 转义 `/`
- 被 JSON Schema、JSON Patch、OpenAPI 等标准广泛使用
- 与 JSONPath 互补：Pointer 定位精确位置，Path 做复杂查询
