# JSON 格式化与美化：工具与技巧

> **分类**：基础入门　|　**级别**：入门　|　**标签**：JSON, 格式化, 美化, 压缩, 工具

## 为什么需要格式化 JSON

JSON 有两种常见形式：

**压缩格式（Minified）：** 体积小，适合网络传输

```json
{"name":"Alice","age":25,"address":{"city":"Beijing","country":"CN"},"hobbies":["reading","coding"]}
```

**美化格式（Prettified）：** 可读性好，适合开发调试

```json
{
  "name": "Alice",
  "age": 25,
  "address": {
    "city": "Beijing",
    "country": "CN"
  },
  "hobbies": [
    "reading",
    "coding"
  ]
}
```

## 格式化工具

### 1. 在线工具

- **ToolboxNova JSON Formatter** — 支持格式化、压缩、验证
- 粘贴 JSON → 自动格式化 → 一键复制

### 2. 命令行工具

```bash
# Python（内置）
echo '{"a":1,"b":2}' | python3 -m json.tool

# jq（推荐）
echo '{"a":1,"b":2}' | jq '.'

# Node.js
echo '{"a":1,"b":2}' | node -e "process.stdin.on('data',d=>console.log(JSON.stringify(JSON.parse(d),null,2)))"
```

### 3. 编程语言内置

**JavaScript：**
```javascript
const obj = { name: "Alice", age: 25 };

// 美化（2 空格缩进）
JSON.stringify(obj, null, 2);

// 美化（Tab 缩进）
JSON.stringify(obj, null, '\t');

// 压缩
JSON.stringify(obj);
```

**Python：**
```python
import json

data = {"name": "Alice", "age": 25}

# 美化
print(json.dumps(data, indent=2, ensure_ascii=False))

# 压缩
print(json.dumps(data, separators=(',', ':')))

# 排序键名
print(json.dumps(data, indent=2, sort_keys=True))
```

**Go：**
```go
import "encoding/json"

data := map[string]interface{}{"name": "Alice", "age": 25}

// 美化
pretty, _ := json.MarshalIndent(data, "", "  ")

// 压缩
compact, _ := json.Marshal(data)
```

### 4. 编辑器快捷键

| 编辑器 | 格式化快捷键 |
|--------|------------|
| VSCode | `Shift + Alt + F` |
| Sublime Text | `Ctrl + Shift + P` → Pretty JSON |
| Vim | `:%!python -m json.tool` |
| JetBrains | `Ctrl + Alt + L` |

## 缩进风格选择

| 风格 | 示例 | 适用场景 |
|------|------|---------|
| 2 空格 | `JSON.stringify(obj, null, 2)` | 前端项目（最常用） |
| 4 空格 | `JSON.stringify(obj, null, 4)` | Python 项目 |
| Tab | `JSON.stringify(obj, null, '\t')` | 个人偏好 |
| 压缩 | `JSON.stringify(obj)` | 生产环境、API 传输 |

## JSON 压缩

压缩（Minify）可以显著减小 JSON 体积：

```bash
# jq 压缩
jq -c '.' pretty.json > minified.json

# Python 压缩
python3 -c "import json,sys; json.dump(json.load(sys.stdin), sys.stdout, separators=(',',':'))" < pretty.json > minified.json
```

**压缩效果示例：**

| 文件 | 美化大小 | 压缩大小 | 节省 |
|------|---------|---------|------|
| package.json | 2.1 KB | 1.4 KB | 33% |
| API 响应 | 15.6 KB | 8.2 KB | 47% |
| 配置文件 | 5.3 KB | 3.1 KB | 42% |

## 键名排序

排序键名可以使 JSON 更容易比较和查找：

```python
import json

data = {"zebra": 1, "apple": 2, "mango": 3}
print(json.dumps(data, indent=2, sort_keys=True))
```

输出：
```json
{
  "apple": 2,
  "mango": 3,
  "zebra": 1
}
```

## JSON Diff 对比

格式化后的 JSON 可以使用标准 diff 工具进行对比：

```bash
# 先格式化再对比
jq -S '.' file1.json > /tmp/a.json
jq -S '.' file2.json > /tmp/b.json
diff /tmp/a.json /tmp/b.json

# 或者使用 diff 直接处理
diff <(jq -S '.' file1.json) <(jq -S '.' file2.json)
```

## 小结

- 格式化（美化）提高可读性，压缩减小传输体积
- `jq` 和 `python -m json.tool` 是最方便的命令行工具
- 统一团队的缩进风格（推荐 2 空格）
- API 传输使用压缩格式，开发调试使用美化格式
- 键名排序有助于版本对比
