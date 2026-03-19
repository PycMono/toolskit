# JSON 安全最佳实践

> **分类**：安全与性能　|　**级别**：高级　|　**标签**：安全, XSS, 注入, 反序列化

## JSON 安全概览

JSON 本身是纯数据格式，没有可执行代码。但在 **解析、传输和使用** JSON 的过程中，存在多种安全风险。

## 1. 永远不要用 eval() 解析 JSON

```javascript
// ❌ 极度危险
const data = eval("(" + jsonString + ")");

// ✓ 安全
const data = JSON.parse(jsonString);
```

`eval()` 会执行任意 JavaScript 代码。如果 `jsonString` 被注入恶意内容，后果不堪设想。现代浏览器和 Node.js 都内置了 `JSON.parse()`，没有任何理由使用 `eval()`。

## 2. XSS 防护

将 JSON 嵌入 HTML 时，需要转义特殊字符：

```html
<!-- ❌ 危险：如果 data 包含 </script>，会导致 XSS -->
<script>
  var data = {{ json_data | raw }};
</script>

<!-- ✓ 安全：转义特殊字符 -->
<script>
  var data = JSON.parse({{ json_data | escapejs | quote }});
</script>
```

### HTML 中嵌入 JSON 的安全方法

```javascript
// 服务端：转义 < 和 > 等字符
function safeJsonForHtml(data) {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/'/g, "\\u0027");
}
```

```html
<script type="application/json" id="app-data">
  {{ safe_json }}
</script>
<script>
  const data = JSON.parse(document.getElementById("app-data").textContent);
</script>
```

## 3. 反序列化安全

某些语言的 JSON 库在反序列化时可能执行代码：

### Python — 不要用 yaml.load

```python
import yaml, json

# ❌ yaml.load 可以执行任意 Python 代码
data = yaml.load(untrusted_input)  # 危险！

# ✓ json.loads 是安全的
data = json.loads(untrusted_input)

# ✓ 如果必须用 YAML，使用 safe_load
data = yaml.safe_load(untrusted_input)
```

### Java — 防范 Gadget Chain 攻击

```java
// ❌ 某些 JSON 库支持多态反序列化，可被利用
// Jackson 默认类型推断
ObjectMapper mapper = new ObjectMapper();
mapper.enableDefaultTyping(); // 危险！

// ✓ 禁用默认类型推断
ObjectMapper mapper = new ObjectMapper();
// 不要调用 enableDefaultTyping()

// ✓ 如果需要多态，使用白名单
@JsonTypeInfo(use = Id.NAME)
@JsonSubTypes({
    @JsonSubTypes.Type(value = Cat.class, name = "cat"),
    @JsonSubTypes.Type(value = Dog.class, name = "dog")
})
public abstract class Animal { }
```

## 4. 输入验证

永远不要信任客户端传来的 JSON：

```python
import json
from jsonschema import validate

schema = {
    "type": "object",
    "required": ["name", "email"],
    "properties": {
        "name": {"type": "string", "minLength": 1, "maxLength": 100},
        "email": {"type": "string", "format": "email"},
        "age": {"type": "integer", "minimum": 0, "maximum": 150}
    },
    "additionalProperties": False  # 拒绝未知字段
}

def process_user_input(raw_json: str):
    # 1. 安全解析
    try:
        data = json.loads(raw_json)
    except json.JSONDecodeError:
        return {"error": "Invalid JSON"}

    # 2. Schema 验证
    try:
        validate(instance=data, schema=schema)
    except Exception as e:
        return {"error": f"Validation failed: {e.message}"}

    # 3. 业务逻辑
    return create_user(data)
```

## 5. 原型污染（JavaScript）

```javascript
// ❌ 恶意 JSON
const malicious = '{"__proto__": {"isAdmin": true}}';
const obj = JSON.parse(malicious);

// JSON.parse 本身是安全的，不会污染原型
// 但手动合并对象时要小心：
function merge(target, source) {
  for (const key in source) {
    // ❌ 没有检查 __proto__
    target[key] = source[key];
  }
}

// ✓ 安全的合并
function safeMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      continue; // 跳过危险键
    }
    if (typeof source[key] === "object" && source[key] !== null) {
      target[key] = target[key] || {};
      safeMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
}
```

## 6. 敏感数据处理

```javascript
// ❌ 密码、密钥等不应出现在 JSON 响应中
{
  "user": "alice",
  "password": "secret123",
  "api_key": "sk-xxx..."
}

// ✓ 返回前过滤敏感字段
function sanitizeUser(user) {
  const { password, api_key, ...safe } = user;
  return safe;
}

// ✓ 使用 toJSON 控制序列化
class User {
  constructor(name, email, password) {
    this.name = name;
    this.email = email;
    this.password = password;
  }
  toJSON() {
    return { name: this.name, email: this.email };
    // password 不会被序列化
  }
}
```

## 7. 大小限制和超时

```javascript
// Express.js — 限制 JSON body 大小
app.use(express.json({ limit: "1mb" }));

// 设置解析超时
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000);

try {
  const data = JSON.parse(hugeString);
} finally {
  clearTimeout(timeout);
}
```

## 安全清单

| 检查项 | 说明 |
|--------|------|
| ✓ 使用 `JSON.parse()` | 永远不要用 `eval()` |
| ✓ 验证输入 | 使用 JSON Schema 校验结构 |
| ✓ 限制大小 | 防止 DoS 攻击 |
| ✓ 转义 HTML | 嵌入页面时防 XSS |
| ✓ 过滤敏感数据 | 响应不包含密码、密钥 |
| ✓ 禁用危险特性 | Java 不开 defaultTyping |
| ✓ 防原型污染 | 合并对象时检查 `__proto__` |
| ✓ 设置超时 | 防止巨型 JSON 阻塞线程 |

## 小结

- JSON 本身是安全的数据格式，风险来自解析和使用环节
- 绝对不要用 `eval()` 解析 JSON
- 嵌入 HTML 时要转义特殊字符防 XSS
- 始终用 JSON Schema 验证外部输入
- 注意语言特有的反序列化漏洞（Java Gadget Chain、原型污染等）
- 响应中过滤敏感字段，限制请求体大小
