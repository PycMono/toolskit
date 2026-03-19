# 20 个最常见的 JSON 语法错误及修复

> **分类**：错误排查　|　**级别**：中级　|　**标签**：JSON, 错误, 调试, 语法错误

## 一、引号错误

### 错误 1：使用单引号
```json
// ❌ {'name': 'Alice'}
// ✅ {"name": "Alice"}
```

### 错误 2：键名无引号
```json
// ❌ {name: "Alice"}
// ✅ {"name": "Alice"}
```

## 二、逗号错误

### 错误 3：尾随逗号
```json
// ❌ {"name": "Alice", "age": 25,}
// ✅ {"name": "Alice", "age": 25}
```

### 错误 4：缺少逗号
```json
// ❌ {"name": "Alice" "age": 25}
// ✅ {"name": "Alice", "age": 25}
```

### 错误 5：数组尾随逗号
```json
// ❌ [1, 2, 3,]
// ✅ [1, 2, 3]
```

## 三、值类型错误

### 错误 6：布尔值大写
```json
// ❌ {"active": True}  ← Python 风格
// ✅ {"active": true}
```

### 错误 7：None 代替 null
```json
// ❌ {"value": None}
// ✅ {"value": null}
```

### 错误 8：undefined
```json
// ❌ {"value": undefined}
// ✅ {"value": null}
```

### 错误 9：NaN / Infinity
```json
// ❌ {"ratio": NaN, "max": Infinity}
// ✅ {"ratio": null, "max": 1.7976931348623157e+308}
```

## 四、字符串错误

### 错误 10：未转义换行
```json
// ❌ {"text": "line 1
line 2"}
// ✅ {"text": "line 1\nline 2"}
```

### 错误 11：未转义反斜杠
```json
// ❌ {"path": "C:\Users\admin"}  ← 实际文件中是单反斜杠
// ✅ {"path": "C:\\Users\\admin"}
```

### 错误 12：未转义双引号
```json
// ❌ {"quote": "He said "hello""}
// ✅ {"quote": "He said \"hello\""}
```

## 五、数值错误

### 错误 13：前导零
```json
// ❌ {"code": 007}
// ✅ {"code": 7} 或 {"code": "007"}
```

### 错误 14：十六进制
```json
// ❌ {"color": 0xFF0000}
// ✅ {"color": "#FF0000"}
```

## 六、结构错误

### 错误 15：注释
```json
// ❌ { /* 注释 */ "name": "Alice" }
// ✅ {"_comment": "说明", "name": "Alice"}
```

### 错误 16：括号不匹配
```json
// ❌ {"hobbies": ["reading", "coding"}
// ✅ {"hobbies": ["reading", "coding"]}
```

### 错误 17-20：其他常见问题
- 重复键名（建议唯一）
- 正号 `+3`（不合法）
- 小数点开头 `.5`（应为 `0.5`）
- 多余的外层包裹

## 快速排查命令

```bash
python3 -m json.tool file.json       # 验证
jq '.' file.json                     # 格式化验证
node -e "JSON.parse(require('fs').readFileSync('f.json'))"  # Node 验证
```

## 小结

大多数 JSON 错误归为：引号问题、逗号问题、值类型大小写、转义遗漏、数值格式。使用验证工具能快速定位错误。
