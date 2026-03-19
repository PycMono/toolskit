# JSON 注入攻击与防御

> **分类**：安全与性能　|　**级别**：高级　|　**标签**：JSON注入, 安全, 防御, NoSQL注入

## 什么是 JSON 注入

JSON 注入是指攻击者通过操纵 JSON 数据的结构或内容，改变应用程序的预期行为。虽然 JSON 本身不可执行，但如果应用程序不当处理 JSON 输入，可能导致权限绕过、数据泄露等严重后果。

## 类型一：JSON 结构注入

### 字符串拼接构建 JSON

```python
# ❌ 极度危险：用字符串拼接构建 JSON
username = request.form["username"]
json_str = '{"username": "' + username + '", "role": "user"}'
```

如果攻击者提交：

```
username = alice", "role": "admin", "x": "
```

拼接后得到：

```json
{"username": "alice", "role": "admin", "x": "", "role": "user"}
```

许多 JSON 解析器对重复键取最后一个值，但有些取第一个。攻击者可能借此提升权限。

### 防御

```python
import json

# ✓ 始终使用 JSON 库构建 JSON
data = {
    "username": request.form["username"],  # 自动处理转义
    "role": "user"
}
json_str = json.dumps(data)
```

## 类型二：NoSQL 注入

MongoDB 等 NoSQL 数据库使用 JSON/BSON 查询，存在类似 SQL 注入的风险：

### 攻击示例

```javascript
// ❌ 直接将用户输入用于查询
app.post("/login", async (req, res) => {
  const user = await db.collection("users").findOne({
    username: req.body.username,
    password: req.body.password
  });
});
```

攻击者发送：

```json
{
  "username": "admin",
  "password": { "$ne": "" }
}
```

`$ne`（不等于空字符串）使密码条件永远为真，绕过认证。

更多危险的 MongoDB 操作符：

```json
{ "$gt": "" }       // 大于空字符串 → 几乎任何非空值都匹配
{ "$regex": ".*" }  // 正则匹配任何值
{ "$exists": true } // 只要字段存在就匹配
```

### 防御

```javascript
// ✓ 方案一：类型检查
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // 确保输入是字符串
  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Invalid input type" });
  }

  const user = await db.collection("users").findOne({
    username: username,
    password: hashPassword(password) // 当然也要 hash 密码
  });
});

// ✓ 方案二：使用 JSON Schema 验证
const loginSchema = {
  type: "object",
  required: ["username", "password"],
  properties: {
    username: { type: "string", minLength: 1, maxLength: 50 },
    password: { type: "string", minLength: 8 }
  },
  additionalProperties: false
};

// ✓ 方案三：使用 mongo-sanitize
const sanitize = require("mongo-sanitize");
const cleanUsername = sanitize(req.body.username); // 移除 $ 开头的键
```

## 类型三：服务端模板注入

某些模板引擎在渲染 JSON 时存在风险：

```python
# ❌ Jinja2 中直接渲染未转义的 JSON
return render_template("page.html", config=json.dumps(user_config))
```

```html
<!-- ❌ 如果 config 包含 </script>，可能导致 XSS -->
<script>var config = {{ config | safe }};</script>
```

### 防御

```python
# ✓ 使用 tojson 过滤器（Jinja2 内置，自动转义）
<script>var config = {{ user_config | tojson }};</script>
```

## 类型四：JSON 劫持（历史漏洞）

早期浏览器存在 JSON 劫持漏洞，攻击者可以通过重写 `Array` 构造函数窃取跨域 JSON 数据。

```javascript
// 历史攻击方式（现代浏览器已修复）
<script>
Array = function() { /* 窃取数据 */ };
</script>
<script src="https://victim.com/api/user/data"></script>
```

现代防御措施（仍建议保留）：

```javascript
// API 响应前加入不可解析前缀
)]}',\n
{"username": "alice", "email": "alice@example.com"}
```

```javascript
// 或者始终返回 JSON 对象而非数组
// ❌ 响应顶层是数组
[{"id":1},{"id":2}]

// ✓ 响应顶层是对象
{"data": [{"id":1},{"id":2}]}
```

## 防御清单

| 措施 | 说明 |
|------|------|
| 不要字符串拼接 JSON | 始终使用 JSON 序列化库 |
| 验证输入类型 | 检查字段类型是否符合预期 |
| 使用 JSON Schema | 严格验证请求体结构 |
| 过滤 MongoDB 操作符 | 移除 `$` 开头的键 |
| 转义 HTML 嵌入 | 使用模板引擎的安全过滤器 |
| 限制请求大小 | 防止超大 JSON 导致 DoS |
| API 返回对象 | 顶层用对象而非数组 |
| 添加安全响应头 | `Content-Type: application/json` |

## 小结

- JSON 注入是通过操纵 JSON 结构来改变程序行为的攻击
- 永远不要用字符串拼接构建 JSON，使用序列化库
- NoSQL 注入是 JSON 注入最常见的形式，必须验证输入类型
- 模板渲染 JSON 时使用安全的转义过滤器
- 多层防御：类型检查 + Schema 验证 + 参数过滤
