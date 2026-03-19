# JSON 性能优化指南

> **分类**：安全与性能　|　**级别**：高级　|　**标签**：性能, 序列化, 解析优化, 基准测试

## JSON 性能为什么重要

在高并发的 Web 应用中，JSON 的序列化（编码）和反序列化（解码）可能占 CPU 时间的 10-30%。优化 JSON 处理可以显著降低延迟和资源消耗。

## 优化策略一：选择高性能库

各语言的 JSON 库性能差异巨大。标准库往往不是最快的选择。

### JavaScript / Node.js

```javascript
// 标准 JSON.parse 已经很快（V8 引擎优化）
// 如果需要更快，可以用 simdjson
const simdjson = require("simdjson");
const parsed = simdjson.parse(jsonBuffer); // 比 JSON.parse 快 2-3x
```

### Python

```python
import json
# 标准库 json 模块（纯 Python + C 加速）

import orjson
# orjson：最快的 Python JSON 库（Rust 实现）
data = orjson.loads(json_bytes)
output = orjson.dumps(data)  # 返回 bytes

import ujson
# ujson：比标准库快 2-3x（C 实现）
data = ujson.loads(json_str)

# 性能对比（解析 1MB JSON）
# json.loads:   ~45ms
# ujson.loads:  ~18ms
# orjson.loads: ~8ms
```

### Go

```go
import (
    "encoding/json"     // 标准库
    jsoniter "github.com/json-iterator/go"  // 兼容标准库，快 3-5x
    "github.com/bytedance/sonic"            // 字节跳动，使用 SIMD，快 5-10x
)

// jsoniter 完全兼容标准库 API
var jsonApi = jsoniter.ConfigCompatibleWithStandardLibrary
data, err := jsonApi.Marshal(obj)

// sonic（需要 amd64）
import "github.com/bytedance/sonic"
data, err := sonic.Marshal(obj)
```

### Java

```java
// Jackson（标准选择）
ObjectMapper mapper = new ObjectMapper();

// DSL-JSON（编译时代码生成，更快）
// 需要注解处理器

// Jackson 优化配置
ObjectMapper mapper = new ObjectMapper();
mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL); // 不序列化 null
```

## 优化策略二：减少 JSON 大小

传输的 JSON 越小，网络延迟越低，解析速度越快。

### 缩短字段名

```json
// ❌ 长字段名
{
  "customer_first_name": "Alice",
  "customer_last_name": "Chen",
  "customer_email_address": "alice@example.com"
}

// ✓ 缩短字段名（配合文档说明）
{
  "fn": "Alice",
  "ln": "Chen",
  "email": "alice@example.com"
}
```

> 高频 API（每秒数万请求）场景适用。内部 API 优先考虑可读性。

### 去除 null 和默认值

```python
import orjson

# orjson 自动跳过 None
data = {"name": "Alice", "age": None, "city": None}
result = orjson.dumps(data, option=orjson.OPT_NON_STR_KEYS)

# 手动过滤
def compact(d):
    return {k: v for k, v in d.items() if v is not None}
```

```javascript
// JavaScript
JSON.stringify(data, (key, value) => value === null ? undefined : value);
```

### 分页而非全量

```json
// ❌ 返回所有 10000 条记录
{ "users": [ ... 10000 items ... ] }

// ✓ 分页
{
  "users": [ ... 20 items ... ],
  "pagination": { "page": 1, "pageSize": 20, "total": 10000 }
}
```

## 优化策略三：流式处理

大 JSON 不要一次性加载到内存：

### Python — ijson

```python
import ijson

# 流式解析 GB 级 JSON 文件
with open("huge_data.json", "rb") as f:
    for item in ijson.items(f, "results.item"):
        process(item)  # 逐条处理，内存使用恒定
```

### Node.js — stream-json

```javascript
const { parser } = require("stream-json");
const { streamArray } = require("stream-json/streamers/StreamArray");
const fs = require("fs");

fs.createReadStream("huge.json")
  .pipe(parser())
  .pipe(streamArray())
  .on("data", ({ value }) => {
    process(value);
  });
```

### Go

```go
decoder := json.NewDecoder(file)
// 跳过数组开始的 [
decoder.Token()
for decoder.More() {
    var item Item
    decoder.Decode(&item)
    process(item)
}
```

## 优化策略四：序列化优化

### 预编译 Schema（Go）

```go
// jsoniter 的 Schema 缓存
type User struct {
    Name  string `json:"name"`
    Email string `json:"email"`
}
// jsoniter 会自动缓存反射信息，首次慢，后续快
```

### 避免重复序列化

```python
import functools
import json

# 缓存不变的 JSON
@functools.lru_cache(maxsize=128)
def get_config_json():
    return json.dumps(load_config())
```

### 使用 Buffer Pool

```go
import (
    "bytes"
    "sync"
)

var bufPool = sync.Pool{
    New: func() interface{} { return new(bytes.Buffer) },
}

func marshalToBuffer(v interface{}) []byte {
    buf := bufPool.Get().(*bytes.Buffer)
    defer func() {
        buf.Reset()
        bufPool.Put(buf)
    }()
    encoder := json.NewEncoder(buf)
    encoder.Encode(v)
    return buf.Bytes()
}
```

## 优化策略五：考虑替代格式

当 JSON 性能不满足需求时，可以考虑二进制格式：

| 格式 | 大小 | 解析速度 | 人类可读 | Schema |
|------|------|---------|---------|--------|
| JSON | 大 | 中 | ✓ | 可选 |
| MessagePack | 小 30% | 快 2x | ✗ | 可选 |
| Protocol Buffers | 小 50% | 快 5-10x | ✗ | 必须 |
| FlatBuffers | 小 50% | 极快（零拷贝） | ✗ | 必须 |

> 建议：外部 API 用 JSON（通用性），内部高频服务间通信考虑 Protobuf/MessagePack。

## 性能测试建议

```python
import time
import json
import orjson

data = generate_test_data(10000)  # 生成测试数据

# 基准测试
def benchmark(name, func, iterations=100):
    start = time.perf_counter()
    for _ in range(iterations):
        func()
    elapsed = (time.perf_counter() - start) / iterations * 1000
    print(f"{name}: {elapsed:.2f}ms")

json_str = json.dumps(data)

benchmark("json.dumps", lambda: json.dumps(data))
benchmark("orjson.dumps", lambda: orjson.dumps(data))
benchmark("json.loads", lambda: json.loads(json_str))
benchmark("orjson.loads", lambda: orjson.loads(json_str))
```

## 小结

- 选择高性能 JSON 库（orjson/ujson/sonic/simdjson）可获得 2-10x 提升
- 减少 JSON 大小：缩短字段名、去除 null、分页
- 大文件使用流式解析，避免一次性加载到内存
- 缓存不变的 JSON 结果，使用 Buffer Pool 减少内存分配
- 内部高频通信考虑 Protobuf / MessagePack 替代 JSON
