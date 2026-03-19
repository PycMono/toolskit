# Go 语言 JSON 编解码完全指南

> **分类**：多语言实战　|　**级别**：中级　|　**标签**：Go, encoding/json, struct tag, 序列化

## Go 标准库 encoding/json

```go
import "encoding/json"

type User struct {
    Name   string   `json:"name"`
    Age    int      `json:"age"`
    Email  string   `json:"email"`
    Skills []string `json:"skills"`
}

// 序列化
user := User{Name: "Alice", Age: 25, Email: "alice@example.com"}
data, _ := json.MarshalIndent(user, "", "  ")

// 反序列化
var parsed User
json.Unmarshal([]byte(jsonStr), &parsed)
```

## Struct Tag 详解

```go
type Product struct {
    ID      int64   `json:"id"`
    Name    string  `json:"name"`
    Stock   int     `json:"stock,omitempty"`  // 零值时省略
    Deleted bool    `json:"-"`                // 始终忽略
}
```

### omitempty 行为

| 类型 | 零值 |
|------|------|
| string | `""` |
| int/float | `0` |
| bool | `false` |
| pointer | `nil` |
| slice | `nil`（空切片不省略） |

## 动态 JSON

### map[string]interface{}

```go
var result map[string]interface{}
json.Unmarshal([]byte(jsonStr), &result)
name := result["name"].(string)
age := result["age"].(float64)  // 数值默认 float64
```

### json.RawMessage 延迟解析

```go
type Event struct {
    Type    string          `json:"type"`
    Payload json.RawMessage `json:"payload"`
}

var event Event
json.Unmarshal(data, &event)
switch event.Type {
case "user_created":
    var user User
    json.Unmarshal(event.Payload, &user)
}
```

### json.Number 精确数值

```go
decoder := json.NewDecoder(strings.NewReader(jsonStr))
decoder.UseNumber()
var result map[string]interface{}
decoder.Decode(&result)
num := result["id"].(json.Number)
id, _ := num.Int64()
```

## 自定义 Marshaler/Unmarshaler

```go
type Timestamp struct{ time.Time }

func (t Timestamp) MarshalJSON() ([]byte, error) {
    return json.Marshal(t.Unix())
}

func (t *Timestamp) UnmarshalJSON(data []byte) error {
    var unix int64
    if err := json.Unmarshal(data, &unix); err != nil {
        return err
    }
    t.Time = time.Unix(unix, 0)
    return nil
}
```

## 流式编解码

```go
// HTTP 响应
func handler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}
```

## 高性能替代库

| 库 | 速度提升 |
|----|---------|
| json-iterator/go | 2-3x |
| bytedance/sonic | 3-5x |
| goccy/go-json | 2-4x |

## 小结

- struct tag 控制字段映射和序列化行为
- `omitempty` 省略零值，`-` 忽略字段
- `json.RawMessage` 延迟解析多态数据
- `json.Number` 避免大整数精度丢失
- 高性能场景使用 json-iterator 或 sonic
