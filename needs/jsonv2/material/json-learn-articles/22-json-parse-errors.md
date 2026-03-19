# JSON 解析错误排查与修复大全

> **分类**：错误排查　|　**级别**：中级　|　**标签**：JSON, 解析错误, 调试, parse error

## 常见解析错误分类

### 1. SyntaxError: Unexpected token（JavaScript）

```javascript
// 原因：JSON 格式不正确
JSON.parse("{'name': 'Alice'}");  // 单引号
JSON.parse("{name: 'Alice'}");     // 无引号键

// 修复：使用正确格式
JSON.parse('{"name": "Alice"}');
```

### 2. SyntaxError: Unexpected end of JSON input

```javascript
// 原因：JSON 不完整
JSON.parse('{"name": "Alice"');   // 缺少 }
JSON.parse('');                    // 空字符串

// 修复
function safeParse(str) {
  if (!str || !str.trim()) return null;
  try { return JSON.parse(str); }
  catch (e) { console.error(e.message); return null; }
}
```

### 3. Python json.JSONDecodeError

```python
import json

# 常见场景
json.loads("{'name': 'Alice'}")     # 单引号
json.loads('{"trailing": "comma",}') # 尾随逗号
json.loads('')                        # 空字符串

# 详细错误信息
try:
    json.loads(bad_json)
except json.JSONDecodeError as e:
    print(f"错误: {e.msg}")
    print(f"行 {e.lineno}, 列 {e.colno}")
    print(f"位置: {e.pos}")
```

### 4. Go json.SyntaxError

```go
var data map[string]interface{}
err := json.Unmarshal([]byte(jsonStr), &data)
if err != nil {
    if synErr, ok := err.(*json.SyntaxError); ok {
        fmt.Printf("语法错误，位置 %d\n", synErr.Offset)
    }
    if typeErr, ok := err.(*json.UnmarshalTypeError); ok {
        fmt.Printf("类型不匹配: %s\n", typeErr.Field)
    }
}
```

### 5. Java JsonProcessingException

```java
try {
    mapper.readValue(json, User.class);
} catch (JsonParseException e) {
    System.err.println("解析错误: " + e.getOriginalMessage());
    System.err.println("位置: " + e.getLocation());
} catch (JsonMappingException e) {
    System.err.println("映射错误: " + e.getPathReference());
}
```

## 调试技巧

### 1. 逐步缩小范围

```python
import json

def find_json_error(text):
    for i in range(len(text), 0, -1):
        try:
            json.loads(text[:i])
            return f"错误在位置 {i} 附近: ...{text[max(0,i-20):i+20]}..."
        except:
            continue
    return "整个文本都不是有效 JSON"
```

### 2. 常见 API 响应问题

```javascript
// 问题：响应不是 JSON
fetch('/api/data')
  .then(res => {
    const contentType = res.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw new Error(`Expected JSON, got ${contentType}`);
    }
    return res.json();
  });
```

### 3. BOM 问题

```python
# UTF-8 BOM 导致解析失败
with open('data.json', 'r', encoding='utf-8-sig') as f:  # 自动去除 BOM
    data = json.load(f)
```

### 4. 编码问题

```python
# 非 UTF-8 编码
with open('data.json', 'rb') as f:
    content = f.read()
    # 检测编码
    if content[:3] == b'\xef\xbb\xbf':
        content = content[3:]  # 去除 BOM
    text = content.decode('utf-8')
    data = json.loads(text)
```

## 小结

- 仔细阅读错误信息中的行号和位置
- 使用在线验证工具快速定位
- API 响应先检查 Content-Type
- 文件读取注意 BOM 和编码
- 封装安全解析函数作为兜底
