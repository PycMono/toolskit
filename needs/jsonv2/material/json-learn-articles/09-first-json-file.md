# 第一个 JSON 文件：创建、读取与编辑

> **分类**：基础入门　|　**级别**：入门　|　**标签**：JSON, 文件, 创建, 读取, 编辑器

## 创建你的第一个 JSON 文件

### 方法 1：使用文本编辑器

用任何文本编辑器（记事本、TextEdit、Vim）创建一个 `data.json` 文件：

```json
{
  "name": "My First JSON",
  "version": "1.0.0",
  "description": "这是我的第一个 JSON 文件",
  "author": "Your Name",
  "tags": ["learning", "json", "beginner"],
  "config": {
    "debug": false,
    "maxRetries": 3,
    "timeout": 5000
  }
}
```

### 方法 2：使用命令行

```bash
# Linux / macOS
echo '{"message": "Hello JSON"}' > hello.json

# 使用 Python 格式化
echo '{"name":"Alice","age":25}' | python3 -m json.tool > formatted.json

# 使用 jq 格式化
echo '{"name":"Alice","age":25}' | jq '.' > formatted.json
```

### 方法 3：使用编程语言

**Python：**

```python
import json

data = {
    "users": [
        {"name": "Alice", "age": 25},
        {"name": "Bob", "age": 30}
    ],
    "count": 2
}

with open("users.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
```

**JavaScript / Node.js：**

```javascript
const fs = require('fs');

const data = {
  users: [
    { name: "Alice", age: 25 },
    { name: "Bob", age: 30 }
  ],
  count: 2
};

fs.writeFileSync('users.json', JSON.stringify(data, null, 2));
```

**Go：**

```go
package main

import (
    "encoding/json"
    "os"
)

func main() {
    data := map[string]interface{}{
        "message": "Hello from Go",
        "count":   42,
    }
    file, _ := os.Create("data.json")
    defer file.Close()
    encoder := json.NewEncoder(file)
    encoder.SetIndent("", "  ")
    encoder.Encode(data)
}
```

## 读取 JSON 文件

### Python 读取

```python
import json

with open("users.json", "r", encoding="utf-8") as f:
    data = json.load(f)

print(data["users"][0]["name"])  # Alice
print(data["count"])              # 2
```

### JavaScript 读取

```javascript
// Node.js
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('users.json', 'utf-8'));
console.log(data.users[0].name);  // Alice

// 浏览器 Fetch
fetch('/api/users.json')
  .then(res => res.json())
  .then(data => console.log(data));
```

### 命令行读取

```bash
# 使用 cat 查看原始内容
cat data.json

# 使用 python 格式化显示
python3 -m json.tool data.json

# 使用 jq 查询
jq '.users[0].name' users.json
# 输出: "Alice"

# 使用 jq 筛选
jq '.users[] | select(.age > 25)' users.json
```

## 编辑 JSON 文件

### 推荐编辑器及配置

**VSCode（强烈推荐）：**
- 内置 JSON 语法高亮和验证
- 自动补全键名
- 格式化快捷键：`Shift + Alt + F`
- 悬停显示 Schema 提示
- 推荐插件：`Prettier`

**VSCode settings.json 配置：**
```json
{
  "editor.formatOnSave": true,
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.tabSize": 2
  },
  "json.schemas": []
}
```

**其他推荐：**
- Sublime Text + Pretty JSON 插件
- JetBrains IDE（内置强大的 JSON 支持）
- Vim + `:%!python -m json.tool` 格式化
- 在线工具：ToolboxNova JSON Formatter

## JSON 文件编码

- **始终使用 UTF-8 编码**（RFC 8259 要求）
- **不要添加 BOM**（UTF-8 BOM 可能导致解析错误）
- **换行符**：`\n`（LF）推荐，`\r\n`（CRLF）也可以

## 常见的 JSON 配置文件

| 文件名 | 用途 |
|--------|------|
| `package.json` | Node.js 项目配置 |
| `tsconfig.json` | TypeScript 配置 |
| `.eslintrc.json` | ESLint 规则配置 |
| `.prettierrc` | Prettier 格式化配置 |
| `composer.json` | PHP Composer 配置 |
| `appsettings.json` | .NET 应用配置 |
| `manifest.json` | 浏览器扩展/PWA 配置 |

## 验证 JSON 文件

### 命令行验证

```bash
# Python
python3 -m json.tool data.json > /dev/null && echo "Valid" || echo "Invalid"

# Node.js
node -e "JSON.parse(require('fs').readFileSync('data.json'))" && echo "Valid"

# jq
jq empty data.json && echo "Valid" || echo "Invalid"
```

### 在线验证

将 JSON 粘贴到 ToolboxNova JSON Validator 即可快速验证。

## 小结

- 创建 JSON 文件可用编辑器、命令行或编程语言
- 读取 JSON 文件时注意指定 UTF-8 编码
- VSCode 是编辑 JSON 的最佳选择
- 始终在保存后验证 JSON 的合法性
- 养成格式化（美化）JSON 的习惯
