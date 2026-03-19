# Unexpected End of JSON Input 修复指南

> **分类**：错误排查　|　**级别**：中级　|　**标签**：JSON, Unexpected End, 不完整, 截断

## 错误含义

"Unexpected end of JSON input" 表示 JSON 解析器在到达输入末尾时，发现 JSON 结构不完整。

## 常见原因

### 1. 空字符串

```javascript
JSON.parse('');           // Error
JSON.parse(null);         // Error
JSON.parse(undefined);    // Error

// 修复
function parseJSON(str) {
  if (!str || !str.trim()) return null;
  return JSON.parse(str);
}
```

### 2. 截断的 JSON

```javascript
// 不完整的 JSON
JSON.parse('{"name": "Ali');     // 字符串未闭合
JSON.parse('{"items": [1, 2');   // 数组和对象未闭合
JSON.parse('{"key":');           // 缺少值

// 网络请求中的截断
// 服务器返回大 JSON 但连接中断
```

### 3. 错误的字符串拼接

```javascript
// 拼接 JSON 片段
let json = '{"part1": "a"}' + '{"part2": "b"}';
JSON.parse(json);  // Error - 两个对象连在一起不是合法 JSON

// 修复：放入数组
let json = '[' + '{"part1": "a"}' + ',' + '{"part2": "b"}' + ']';
```

### 4. 响应体为空

```javascript
// fetch 返回 204 No Content
const res = await fetch('/api/delete', { method: 'DELETE' });
const data = await res.json();  // Error!

// 修复
const data = res.status === 204 ? null : await res.json();
```

### 5. 读取文件失败

```python
import json
import os

filepath = "data.json"
if not os.path.exists(filepath) or os.path.getsize(filepath) == 0:
    data = {}
else:
    with open(filepath, 'r') as f:
        data = json.load(f)
```

## 防御性编程

### JavaScript

```javascript
async function fetchJSON(url) {
  const res = await fetch(url);

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const text = await res.text();
  if (!text.trim()) return null;

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('JSON parse failed:', text.substring(0, 200));
    throw e;
  }
}
```

### Python

```python
import json

def safe_load_json(filepath, default=None):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read().strip()
            if not content:
                return default
            return json.loads(content)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"JSON 加载失败: {e}")
        return default
```

## 小结

- 该错误表示 JSON 不完整或为空
- 解析前检查字符串非空
- API 调用检查 HTTP 状态码和 Content-Type
- 文件操作检查文件存在且非空
- 网络请求设置合理超时
