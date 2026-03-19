# JSON 语法错误定位技巧

> **分类**：错误排查　|　**级别**：中级　|　**标签**：JSON, 语法错误, 定位, 调试技巧

## 快速定位策略

### 策略 1：利用错误信息

各语言解析器都会报告错误位置：

```python
# Python
try:
    json.loads(bad_json)
except json.JSONDecodeError as e:
    print(f"行 {e.lineno}, 列 {e.colno}: {e.msg}")
    # 显示错误附近的文本
    lines = bad_json.split('\n')
    if e.lineno <= len(lines):
        print(f">>> {lines[e.lineno - 1]}")
        print(f"    {' ' * (e.colno - 1)}^")
```

```javascript
// JavaScript
try {
  JSON.parse(badJson);
} catch (e) {
  // Chrome: "Unexpected token x in JSON at position 42"
  const pos = parseInt(e.message.match(/position (\d+)/)?.[1]);
  if (pos) {
    console.log('错误附近:', badJson.substring(Math.max(0, pos-20), pos+20));
    console.log('           ' + ' '.repeat(20) + '^');
  }
}
```

### 策略 2：二分法定位

```python
def binary_find_error(json_str):
    lo, hi = 0, len(json_str)
    while lo < hi:
        mid = (lo + hi) // 2
        try:
            json.loads(json_str[:mid])
            lo = mid + 1
        except:
            hi = mid
    return lo
```

### 策略 3：逐行验证

```bash
# 检查每一行
python3 -c "
import json, sys
for i, line in enumerate(open('data.json'), 1):
    try:
        json.loads(line)
    except:
        print(f'行 {i} 可能有问题: {line.strip()[:80]}')
"
```

### 策略 4：使用 jq 的详细错误

```bash
jq '.' bad.json
# parse error (Invalid numeric literal at line 5, column 12)
```

### 策略 5：在线工具高亮

将 JSON 粘贴到在线验证工具（如 ToolboxNova JSON Validator），错误行会被高亮标记。

## 常见错误模式速查

| 错误信息关键词 | 可能原因 |
|--------------|---------|
| Unexpected token ' | 单引号 |
| Unexpected token } | 尾随逗号 |
| Unexpected token < | 收到 HTML |
| Unexpected end | JSON 不完整 |
| Unexpected number | 前导零或非法数值 |
| Unexpected token u | undefined |

## 自动修复工具

```javascript
// 简单的 JSON 自动修复
function autoFixJSON(str) {
  return str
    .replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":')   // 无引号键名
    .replace(/'/g, '"')                               // 单引号→双引号
    .replace(/,\s*([}\]])/g, '$1')                  // 尾随逗号
    .replace(/\/\/.*/g, '')                          // 行注释
    .replace(/\/\*[\s\S]*?\*\//g, '');           // 块注释
}
```

## 小结

- 首先阅读错误信息中的行号和位置
- 用二分法或逐行验证缩小范围
- jq 和在线工具提供最友好的错误提示
- 建立常见错误模式的直觉
