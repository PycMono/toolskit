# JavaScript JSON 操作大全

> **分类**：多语言实战　|　**级别**：中级　|　**标签**：JavaScript, JSON.parse, JSON.stringify, fetch

## JavaScript 与 JSON 的天然关系

JSON 源自 JavaScript 对象语法，因此 JS 对 JSON 的支持最为自然。全局对象 `JSON` 提供了两个核心方法。

## JSON.parse()

### 基本用法

```javascript
const jsonStr = '{"name": "Alice", "age": 25, "hobbies": ["reading", "coding"]}';
const obj = JSON.parse(jsonStr);
console.log(obj.name);       // "Alice"
console.log(obj.hobbies[0]); // "reading"
```

### reviver 函数

```javascript
const jsonStr = '{"name": "Alice", "birthday": "1999-03-15T00:00:00.000Z"}';
const data = JSON.parse(jsonStr, (key, value) => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return new Date(value);
  }
  return value;
});
console.log(data.birthday instanceof Date); // true
```

### 安全解析

```javascript
function safeParse(jsonStr, fallback = null) {
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('JSON parse error:', e.message);
    return fallback;
  }
}
```

## JSON.stringify()

### 基本用法

```javascript
const obj = { name: "Alice", age: 25 };
JSON.stringify(obj);           // '{"name":"Alice","age":25}'
JSON.stringify(obj, null, 2);  // 美化输出
```

### replacer 参数

```javascript
const user = { name: "Alice", password: "secret", email: "alice@example.com" };

// 数组方式：只保留指定字段
JSON.stringify(user, ["name", "email"], 2);

// 函数方式：自定义逻辑
JSON.stringify(user, (key, value) => {
  if (key === 'password') return undefined;
  return value;
}, 2);
```

### toJSON() 方法

```javascript
class User {
  constructor(name, password) {
    this.name = name;
    this.password = password;
    this.createdAt = new Date();
  }
  toJSON() {
    return { name: this.name, createdAt: this.createdAt.toISOString() };
  }
}
const user = new User("Alice", "secret");
console.log(JSON.stringify(user, null, 2));
```

## Fetch API 中的 JSON

### GET 请求

```javascript
async function fetchUsers() {
  const response = await fetch('https://api.example.com/users');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}
```

### POST 请求

```javascript
async function createUser(userData) {
  const response = await fetch('https://api.example.com/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return response.json();
}
```

## 深拷贝

```javascript
// JSON 方式（简单但有限制）
const clone = JSON.parse(JSON.stringify(original));

// 推荐：structuredClone（现代浏览器）
const clone2 = structuredClone(original);
```

## 不可序列化的类型

```javascript
JSON.stringify({
  func: function() {},     // 被忽略
  undef: undefined,        // 被忽略
  sym: Symbol('id'),       // 被忽略
  inf: Infinity,           // null
  nan: NaN,                // null
  date: new Date(),        // ISO 字符串
  regex: /pattern/gi,      // {}
  map: new Map(),          // {}
  set: new Set(),          // {}
});
// BigInt 默认抛 TypeError
```

### BigInt 处理

```javascript
JSON.stringify(data, (key, value) =>
  typeof value === 'bigint' ? value.toString() : value
);
```

### 循环引用处理

```javascript
function stringifyCircular(obj) {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return '[Circular]';
      seen.add(value);
    }
    return value;
  }, 2);
}
```

## 小结

- `JSON.parse(str, reviver)` 解析 JSON 字符串
- `JSON.stringify(obj, replacer, space)` 序列化为 JSON
- `reviver` 在解析时转换值（如日期字符串→Date）
- `replacer` 过滤/转换序列化输出
- `toJSON()` 自定义对象的序列化行为
- 注意 BigInt、循环引用、Map/Set 等不可直接序列化
