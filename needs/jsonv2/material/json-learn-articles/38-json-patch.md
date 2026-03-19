# JSON Patch：精确修改 JSON 文档

> **分类**：高级主题　|　**级别**：高级　|　**标签**：JSON Patch, RFC 6902, PATCH请求, 增量更新

## 什么是 JSON Patch

JSON Patch（RFC 6902）是一种描述 JSON 文档修改操作的格式。与整体替换不同，它只传输 **变更部分**，就像 `git diff` 之于文件。

为什么需要它？假设一个 10KB 的用户配置，你只想改一个字段。用 PUT 要传输完整的 10KB，而 JSON Patch 只传几十字节的修改指令。

```http
PATCH /api/users/123
Content-Type: application/json-patch+json

[
  { "op": "replace", "path": "/name", "value": "新名字" }
]
```

## 六种操作

JSON Patch 定义了六种操作（op）：

### 1. add — 添加

```json
// 添加字段
{ "op": "add", "path": "/email", "value": "alice@example.com" }

// 在数组指定位置插入
{ "op": "add", "path": "/tags/1", "value": "new-tag" }

// 在数组末尾追加
{ "op": "add", "path": "/tags/-", "value": "last-tag" }
```

### 2. remove — 删除

```json
// 删除字段
{ "op": "remove", "path": "/deprecated_field" }

// 删除数组元素
{ "op": "remove", "path": "/tags/2" }
```

### 3. replace — 替换

```json
{ "op": "replace", "path": "/name", "value": "Bob" }
{ "op": "replace", "path": "/settings/theme", "value": "dark" }
```

`replace` 等同于先 `remove` 再 `add`，但目标路径必须存在。

### 4. move — 移动

```json
{ "op": "move", "from": "/old_name", "path": "/new_name" }
```

### 5. copy — 复制

```json
{ "op": "copy", "from": "/billing_address", "path": "/shipping_address" }
```

### 6. test — 测试

```json
{ "op": "test", "path": "/version", "value": 2 }
```

`test` 不修改数据，而是断言某个值是否匹配。如果不匹配，**整个 Patch 操作回滚**。这对实现乐观锁非常有用。

## 路径语法

JSON Patch 使用 JSON Pointer（RFC 6901）表示路径：

| JSON Pointer | 对应的 JSON 位置 |
|--------------|------------------|
| `/name` | 根对象的 `name` 字段 |
| `/address/city` | 嵌套对象 `address.city` |
| `/tags/0` | 数组 `tags` 的第一个元素 |
| `/tags/-` | 数组末尾（仅用于 `add`） |
| `/a~0b` | 字段名包含 `~` 的（`~` 编码为 `~0`） |
| `/a~1b` | 字段名包含 `/` 的（`/` 编码为 `~1`） |

## 完整示例

原始文档：

```json
{
  "name": "Alice",
  "age": 25,
  "address": { "city": "Beijing", "zip": "100000" },
  "tags": ["developer", "writer"],
  "version": 1
}
```

Patch 操作：

```json
[
  { "op": "test", "path": "/version", "value": 1 },
  { "op": "replace", "path": "/name", "value": "Alice Chen" },
  { "op": "replace", "path": "/age", "value": 26 },
  { "op": "replace", "path": "/address/city", "value": "Shanghai" },
  { "op": "add", "path": "/tags/-", "value": "speaker" },
  { "op": "remove", "path": "/address/zip" },
  { "op": "add", "path": "/email", "value": "alice@example.com" },
  { "op": "replace", "path": "/version", "value": 2 }
]
```

结果：

```json
{
  "name": "Alice Chen",
  "age": 26,
  "address": { "city": "Shanghai" },
  "tags": ["developer", "writer", "speaker"],
  "email": "alice@example.com",
  "version": 2
}
```

## 各语言实现

### JavaScript（fast-json-patch）

```javascript
const jsonpatch = require("fast-json-patch");

const document = { name: "Alice", tags: ["dev"] };
const patch = [
  { op: "replace", path: "/name", value: "Bob" },
  { op: "add", path: "/tags/-", value: "writer" }
];

const result = jsonpatch.applyPatch(document, patch);
console.log(document);
// { name: "Bob", tags: ["dev", "writer"] }

// 自动生成 Patch（diff）
const before = { name: "Alice", age: 25 };
const after = { name: "Alice", age: 26, city: "Shanghai" };
const diff = jsonpatch.compare(before, after);
console.log(diff);
// [
//   { op: "replace", path: "/age", value: 26 },
//   { op: "add", path: "/city", value: "Shanghai" }
// ]
```

### Python（jsonpatch）

```python
import jsonpatch

doc = {"name": "Alice", "age": 25, "tags": ["dev"]}
patch = jsonpatch.JsonPatch([
    {"op": "replace", "path": "/age", "value": 26},
    {"op": "add", "path": "/tags/-", "value": "writer"}
])

result = patch.apply(doc)
print(result)
# {'name': 'Alice', 'age': 26, 'tags': ['dev', 'writer']}

# 生成 diff
src = {"name": "Alice", "age": 25}
dst = {"name": "Alice", "age": 26, "city": "Shanghai"}
diff = jsonpatch.make_patch(src, dst)
print(diff.to_string())
```

## REST API 中的应用

```python
# Flask 示例
from flask import Flask, request, jsonify
import jsonpatch

app = Flask(__name__)
users_db = {}

@app.route("/users/<uid>", methods=["PATCH"])
def patch_user(uid):
    if uid not in users_db:
        return jsonify(error="Not found"), 404

    try:
        patch = jsonpatch.JsonPatch(request.json)
        users_db[uid] = patch.apply(users_db[uid])
        return jsonify(users_db[uid])
    except jsonpatch.JsonPatchConflict as e:
        return jsonify(error=str(e)), 409
    except jsonpatch.JsonPatchException as e:
        return jsonify(error=str(e)), 400
```

## JSON Patch vs JSON Merge Patch

| 维度 | JSON Patch (RFC 6902) | JSON Merge Patch (RFC 7396) |
|------|----------------------|---------------------------|
| 格式 | 操作数组 | 部分 JSON 对象 |
| 删除字段 | `{ "op": "remove" }` | 设为 `null` |
| 数组操作 | 支持精确增删 | 只能整体替换 |
| 复杂度 | 高，支持丰富操作 | 低，直觉简单 |
| Content-Type | `application/json-patch+json` | `application/merge-patch+json` |

JSON Merge Patch 更简单，但能力有限。如果需要精确的数组操作或条件测试，选 JSON Patch。

## 小结

- JSON Patch 用六种操作（add/remove/replace/move/copy/test）描述增量修改
- `test` 操作可实现乐观锁
- 路径使用 JSON Pointer（RFC 6901）语法
- 比整体替换节省带宽，适合大文档的局部更新
- `compare/diff` 功能可自动生成两个 JSON 之间的 Patch
