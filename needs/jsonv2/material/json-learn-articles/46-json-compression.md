# JSON 压缩与传输优化

> **分类**：安全与性能　|　**级别**：高级　|　**标签**：压缩, Gzip, Brotli, 传输优化

## 为什么需要压缩 JSON

JSON 是文本格式，有大量冗余（重复的键名、空白、结构字符）。一个 1MB 的 JSON API 响应，经 Gzip 压缩后通常只有 100-200KB。压缩是最低成本、最高回报的优化手段。

## HTTP 压缩

### 服务端配置

#### Nginx

```nginx
http {
    gzip on;
    gzip_types application/json text/plain application/javascript;
    gzip_min_length 1024;     # 小于 1KB 不压缩
    gzip_comp_level 6;        # 压缩级别 1-9
    gzip_vary on;

    # Brotli（需要模块）
    brotli on;
    brotli_types application/json text/plain;
    brotli_comp_level 6;
}
```

#### Express.js

```javascript
const compression = require("compression");
const express = require("express");
const app = express();

app.use(compression({
  filter: (req, res) => {
    if (req.headers["x-no-compression"]) return false;
    return compression.filter(req, res);
  },
  threshold: 1024, // 小于 1KB 不压缩
  level: 6
}));
```

#### Go

```go
import "github.com/klauspost/compress/gzhttp"

handler := gzhttp.GzipHandler(myHandler)
http.ListenAndServe(":8080", handler)
```

### 客户端

浏览器自动在请求头中声明支持的压缩算法：

```http
GET /api/data HTTP/1.1
Accept-Encoding: gzip, deflate, br
```

服务端返回：

```http
HTTP/1.1 200 OK
Content-Type: application/json
Content-Encoding: br
```

浏览器自动解压，对 JavaScript 代码完全透明。

## 压缩算法对比

| 算法 | 压缩率 | 压缩速度 | 解压速度 | 浏览器支持 |
|------|--------|---------|---------|-----------|
| Gzip | 良好 | 快 | 快 | 所有浏览器 |
| Brotli | 更好（比 Gzip 小 15-25%） | 较慢 | 快 | 现代浏览器 |
| Deflate | 良好 | 快 | 快 | 所有浏览器 |
| Zstd | 最好 | 最快 | 最快 | Chrome 123+ |

**推荐策略**：静态资源用 Brotli（离线预压缩），动态 API 响应用 Gzip（实时压缩速度更快）。

## JSON 数据层面的优化

压缩算法之外，减少 JSON 本身的冗余同样重要。

### 去除空白

```javascript
// 紧凑输出（无缩进、无空格）
JSON.stringify(data);  // 默认就是紧凑的

// 确认没有美化
JSON.stringify(data, null, 0); // ≠ JSON.stringify(data, null, 2)
```

仅去除空白就能减少 20-30% 的体积。

### 列式格式

```json
// ❌ 行式：键名重复 N 次
{
  "users": [
    {"id": 1, "name": "Alice", "age": 25},
    {"id": 2, "name": "Bob", "age": 30},
    {"id": 3, "name": "Carol", "age": 28}
  ]
}

// ✓ 列式：键名只出现一次
{
  "columns": ["id", "name", "age"],
  "rows": [
    [1, "Alice", 25],
    [2, "Bob", 30],
    [3, "Carol", 28]
  ]
}
```

数据量大时，列式格式可以减少 40-60% 的体积。

### 枚举值用短标识

```json
// ❌ 冗长
{ "status": "payment_processing", "priority": "very_high" }

// ✓ 短标识（配合文档映射表）
{ "status": 3, "priority": 4 }
```

## 文件存储压缩

### Python

```python
import gzip
import json

data = {"users": [...]}  # 大量数据

# 压缩写入
with gzip.open("data.json.gz", "wt", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False)

# 压缩读取
with gzip.open("data.json.gz", "rt", encoding="utf-8") as f:
    data = json.load(f)
```

### Node.js

```javascript
const zlib = require("zlib");
const fs = require("fs");

// 压缩写入
const data = JSON.stringify(largeObject);
const compressed = zlib.gzipSync(data);
fs.writeFileSync("data.json.gz", compressed);

// 流式压缩
const readStream = fs.createReadStream("large.json");
const gzip = zlib.createGzip();
const writeStream = fs.createWriteStream("large.json.gz");
readStream.pipe(gzip).pipe(writeStream);
```

## 预压缩静态 JSON

对于不经常变化的 JSON 文件，可以提前压缩好：

```bash
# 预生成 Gzip 和 Brotli 版本
gzip -k -9 data.json          # data.json.gz
brotli -k -q 11 data.json     # data.json.br
```

Nginx 配置直接服务预压缩文件：

```nginx
location /api/static/ {
    gzip_static on;
    brotli_static on;
}
```

## 实际效果对比

以一个真实的用户列表 API（1000 条记录）为例：

| 格式 | 大小 |
|------|------|
| 美化 JSON（indent=2） | 1,200 KB |
| 紧凑 JSON | 850 KB |
| 紧凑 + Gzip | 95 KB |
| 紧凑 + Brotli | 78 KB |
| 列式 + Gzip | 52 KB |

从 1200KB 到 52KB，减少了 **95.7%** 的传输体积。

## 小结

- HTTP 压缩（Gzip/Brotli）是最低成本的优化，应默认开启
- 动态响应用 Gzip（速度快），静态资源用 Brotli（压缩率高）
- 去除空白、使用列式格式、缩短枚举值可进一步减少体积
- 大文件存储用 `.json.gz` 格式
- 综合优化可减少 90%+ 的传输体积
