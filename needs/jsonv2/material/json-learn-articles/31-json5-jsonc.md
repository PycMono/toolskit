# JSON5 与 JSONC：JSON 的扩展格式

> **分类**：格式对比　|　**级别**：中级　|　**标签**：JSON5, JSONC, 注释, 扩展格式

## 标准 JSON 的限制

- 不支持注释
- 不支持尾随逗号
- 键名必须双引号
- 不支持多行字符串
- 不支持十六进制数值

## JSONC（JSON with Comments）

JSONC 是 JSON 的超集，仅增加了注释支持，VSCode 的配置文件就使用 JSONC。

```jsonc
{
  // 这是行注释
  "name": "my-project",
  /* 这是块注释 */
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",      // 开发服务器
    "build": "vite build"
  },
  // 尾随逗号也支持
  "dependencies": {
    "react": "^18.0.0",
  }
}
```

**适用场景：** VSCode settings.json、tsconfig.json、.vscode/*.json

## JSON5

JSON5 是 JSON 的更大超集，目标是让 JSON 像 ECMAScript 5 一样灵活：

```json5
{
  // 单行注释
  /* 块注释 */

  // 键名无需引号（如果是合法标识符）
  name: 'Alice',         // 单引号字符串
  age: 25,

  // 多行字符串
  bio: 'Hello, \
World!',

  // 尾随逗号
  hobbies: ['reading', 'coding',],

  // 特殊数值
  infinity: Infinity,
  nan: NaN,
  hex: 0xFF,
  leadingDot: .5,
  trailingDot: 5.,
  positiveSign: +3,
}
```

### JSON5 新增特性

| 特性 | JSON | JSONC | JSON5 |
|------|------|-------|-------|
| 行注释 // | ❌ | ✅ | ✅ |
| 块注释 /* */ | ❌ | ✅ | ✅ |
| 尾随逗号 | ❌ | ✅ | ✅ |
| 单引号字符串 | ❌ | ❌ | ✅ |
| 无引号键名 | ❌ | ❌ | ✅ |
| 多行字符串 | ❌ | ❌ | ✅ |
| 十六进制 | ❌ | ❌ | ✅ |
| Infinity/NaN | ❌ | ❌ | ✅ |

## 使用方式

### JavaScript

```javascript
// JSONC（VSCode 内置，或使用 jsonc-parser）
const jsonc = require('jsonc-parser');
const data = jsonc.parse(jsoncStr);

// JSON5
const JSON5 = require('json5');
const data = JSON5.parse(json5Str);
const str = JSON5.stringify(data, null, 2);
```

### Python

```python
# pip install json5
import json5

data = json5.loads('{name: "Alice", age: 25,}')
print(data)  # {'name': 'Alice', 'age': 25}
```

## 何时使用

| 格式 | 推荐场景 |
|------|---------|
| JSON | API 数据交换、数据存储、程序间通信 |
| JSONC | IDE 配置、有注释需求的配置 |
| JSON5 | 需要灵活语法的配置文件 |

**注意：** API 数据交换始终使用标准 JSON。扩展格式仅用于本地配置。

## 小结

- JSONC = JSON + 注释 + 尾随逗号
- JSON5 = JSON + 注释 + 单引号 + 无引号键 + 更多数值格式
- API 通信始终使用标准 JSON
- 配置文件可选 JSONC 或 JSON5
