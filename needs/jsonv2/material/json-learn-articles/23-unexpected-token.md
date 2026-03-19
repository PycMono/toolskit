# Unexpected Token 错误完全解决方案

> **分类**：错误排查　|　**级别**：中级　|　**标签**：JSON, Unexpected Token, 错误修复

## 什么是 Unexpected Token 错误

当 JSON 解析器遇到不符合预期的字符时，会抛出 Unexpected Token 错误。

## 常见原因与修复

### 原因 1：单引号

```javascript
// SyntaxError: Unexpected token ' in JSON
JSON.parse("{'name': 'Alice'}");

// 修复
JSON.parse('{"name": "Alice"}');

// 编程修复
function fixSingleQuotes(str) {
  return str.replace(/'/g, '"');  // 简单情况
}
```

### 原因 2：无引号键名

```javascript
// SyntaxError: Unexpected token n in JSON
JSON.parse('{name: "Alice"}');

// 修复
JSON.parse('{"name": "Alice"}');
```

### 原因 3：尾随逗号

```javascript
// SyntaxError: Unexpected token } in JSON
JSON.parse('{"a": 1, "b": 2,}');

// 编程修复
function removeTrailingCommas(str) {
  return str.replace(/,\s*([}\]])/g, '$1');
}
```

### 原因 4：注释

```javascript
// SyntaxError: Unexpected token /
JSON.parse('{ /* comment */ "name": "Alice" }');

// 编程修复
function removeComments(str) {
  return str
    .replace(/\/\*[\s\S]*?\*\//g, '')  // 块注释
    .replace(/\/\/.*$/gm, '');              // 行注释
}
```

### 原因 5：HTML 响应而非 JSON

```javascript
// 最常见场景：API 返回了 HTML 错误页面
fetch('/api/users')
  .then(res => res.json())  // SyntaxError: Unexpected token <

// 修复：检查响应类型
fetch('/api/users')
  .then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (!res.headers.get('content-type')?.includes('json')) {
      throw new Error('Response is not JSON');
    }
    return res.json();
  });
```

### 原因 6：空响应

```javascript
// SyntaxError: Unexpected end of JSON input
JSON.parse('');
JSON.parse(undefined);

// 修复
function safeJsonParse(str) {
  if (!str || typeof str !== 'string' || !str.trim()) return null;
  try { return JSON.parse(str); }
  catch { return null; }
}
```

### 原因 7：截断的响应

```javascript
// 网络超时或缓冲区截断导致 JSON 不完整
// {"name": "Alice", "data": [1, 2, 3
// → SyntaxError: Unexpected end of JSON input

// 修复：增加超时时间、检查响应完整性
```

## 系统化排查流程

1. **查看原始文本**：`console.log(typeof str, str.length, str.substring(0, 100))`
2. **检查第一个字符**：`<` = HTML，`{` 或 `[` = 可能是 JSON
3. **在线验证**：将文本粘贴到 JSON Validator
4. **检查编码**：确认 UTF-8 无 BOM
5. **检查网络**：确认响应完整（Content-Length）

## 小结

- Unexpected Token 多因格式不符合 JSON 标准
- 最常见：单引号、注释、尾随逗号、HTML 响应
- 封装安全解析函数，先检查再解析
- API 调用先验证 Content-Type 和 HTTP 状态码
