# JWT (JSON Web Token) 深入理解

> **分类**：高级主题　|　**级别**：高级　|　**标签**：JWT, 认证, Token, 安全

## 什么是 JWT

JWT（JSON Web Token）是一种紧凑的、URL 安全的令牌格式，用于在各方之间安全地传递 JSON 声明信息。它是现代 Web 应用中最流行的认证方案之一。

一个 JWT 看起来像这样：

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIiwiaWF0IjoxNjk5MDAwMDAwfQ.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

它由三部分组成，用 `.` 分隔：**Header.Payload.Signature**

## JWT 结构详解

### 1. Header（头部）

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

- `alg`：签名算法（HS256、RS256、ES256 等）
- `typ`：令牌类型，固定为 `"JWT"`

Header 被 Base64URL 编码后成为 JWT 的第一部分。

### 2. Payload（载荷）

```json
{
  "sub": "1234567890",
  "name": "Alice",
  "email": "alice@example.com",
  "role": "admin",
  "iat": 1699000000,
  "exp": 1699086400,
  "iss": "https://auth.example.com"
}
```

标准字段（Registered Claims）：

| 字段 | 全称 | 含义 |
|------|------|------|
| `sub` | Subject | 主题（通常是用户 ID） |
| `iss` | Issuer | 签发者 |
| `aud` | Audience | 接收方 |
| `exp` | Expiration | 过期时间（Unix 时间戳） |
| `iat` | Issued At | 签发时间 |
| `nbf` | Not Before | 生效时间 |
| `jti` | JWT ID | 唯一标识 |

> **重要**：Payload 是 Base64URL 编码的，**不是加密的**。任何人都可以解码看到内容。不要在 Payload 中放密码、密钥等敏感信息。

### 3. Signature（签名）

```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

签名确保令牌未被篡改。服务端用密钥验证签名，如果 Payload 被修改，签名就会不匹配。

## 常用签名算法

| 算法 | 类型 | 密钥 | 推荐场景 |
|------|------|------|----------|
| HS256 | 对称 | 共享密钥 | 单服务、简单场景 |
| RS256 | 非对称 | 公钥/私钥 | 多服务、微服务 |
| ES256 | 非对称（椭圆曲线） | 公钥/私钥 | 性能敏感场景 |

RS256 更适合微服务：签发服务用私钥签名，其他服务用公钥验证。私钥不需要在所有服务间共享。

## 工作流程

```
1. 用户登录 → POST /login { username, password }
2. 服务端验证凭据 → 生成 JWT（包含用户信息和过期时间）
3. 返回 JWT 给客户端
4. 客户端保存 JWT（通常在 localStorage 或 httpOnly Cookie）
5. 后续请求在 Header 中携带：Authorization: Bearer <JWT>
6. 服务端验证 JWT 签名 → 提取用户信息 → 处理请求
```

## 代码实战

### Node.js

```javascript
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET; // 至少 256 位随机字符串

// 签发
function generateToken(user) {
  return jwt.sign(
    { sub: user.id, name: user.name, role: user.role },
    SECRET,
    { expiresIn: "2h", issuer: "myapp" }
  );
}

// 验证
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, SECRET, { issuer: "myapp" });
    return { valid: true, payload: decoded };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

// Express 中间件
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing token" });
  }
  const result = verifyToken(authHeader.slice(7));
  if (!result.valid) {
    return res.status(401).json({ error: result.error });
  }
  req.user = result.payload;
  next();
}
```

### Python

```python
import jwt
import datetime
import os

SECRET = os.environ["JWT_SECRET"]

def generate_token(user: dict) -> str:
    payload = {
        "sub": user["id"],
        "name": user["name"],
        "role": user["role"],
        "iat": datetime.datetime.utcnow(),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2),
        "iss": "myapp"
    }
    return jwt.encode(payload, SECRET, algorithm="HS256")

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET, algorithms=["HS256"], issuer="myapp")
        return {"valid": True, "payload": payload}
    except jwt.ExpiredSignatureError:
        return {"valid": False, "error": "Token expired"}
    except jwt.InvalidTokenError as e:
        return {"valid": False, "error": str(e)}
```

### Go

```go
import (
    "time"
    "github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte(os.Getenv("JWT_SECRET"))

func GenerateToken(userID string, role string) (string, error) {
    claims := jwt.MapClaims{
        "sub":  userID,
        "role": role,
        "iss":  "myapp",
        "iat":  time.Now().Unix(),
        "exp":  time.Now().Add(2 * time.Hour).Unix(),
    }
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(jwtSecret)
}

func VerifyToken(tokenStr string) (*jwt.MapClaims, error) {
    token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
        return jwtSecret, nil
    })
    if err != nil {
        return nil, err
    }
    claims := token.Claims.(jwt.MapClaims)
    return &claims, nil
}
```

## 安全最佳实践

### 必须做

1. **使用 HTTPS** — JWT 本身不加密，必须通过 HTTPS 传输
2. **设置合理的过期时间** — Access Token 短（15-30 分钟），配合 Refresh Token
3. **密钥强度** — HS256 至少 256 位随机字符串；生产环境优先用 RS256/ES256
4. **验证所有标准字段** — 检查 `exp`、`iss`、`aud`，不要只验签名
5. **指定 `algorithms` 参数** — 防止算法混淆攻击

### 不要做

1. **不要在 Payload 存敏感数据** — 它只是 Base64 编码，不是加密
2. **不要用 JWT 做会话管理** — JWT 签发后无法撤销（除非配合黑名单）
3. **不要忽略 `exp`** — 永不过期的 JWT 是严重安全隐患
4. **不要在 URL 中传 JWT** — URL 会被日志记录，用 Header 传递

### Refresh Token 机制

```
Access Token (短期, 15min) ← 用于 API 请求
Refresh Token (长期, 7d)   ← 用于刷新 Access Token

Access Token 过期 → 用 Refresh Token 获取新的 Access Token
Refresh Token 存在数据库，可以随时撤销
```

## JWT vs Session

| 维度 | JWT | Session |
|------|-----|---------|
| 状态 | 无状态 | 有状态（服务端存储） |
| 扩展性 | 天然支持分布式 | 需要共享 Session 存储 |
| 撤销 | 困难（需黑名单） | 简单（删除即可） |
| 大小 | 较大（含 Payload） | 较小（仅 Session ID） |
| 适用 | API、微服务、移动端 | 传统 Web 应用 |

## 小结

- JWT 由 Header + Payload + Signature 三部分组成
- Payload 是编码而非加密，不要存敏感数据
- RS256（非对称）适合微服务，HS256（对称）适合简单场景
- 务必设置过期时间，配合 Refresh Token 使用
- 验证时检查签名、过期时间、签发者等所有标准字段
