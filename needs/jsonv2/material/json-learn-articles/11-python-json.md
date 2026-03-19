# Python JSON 完全指南：从入门到精通

> **分类**：多语言实战　|　**级别**：中级　|　**标签**：Python, json模块, 序列化, 反序列化

## Python 内置 json 模块

Python 标准库的 `json` 模块提供了完整的 JSON 编解码支持，无需安装第三方库。

## 基本操作

### 序列化（Python → JSON）

```python
import json

data = {
    "name": "张三",
    "age": 28,
    "skills": ["Python", "Go", "SQL"],
    "isActive": True,
    "address": None
}

# 基本序列化
json_str = json.dumps(data)

# 美化输出 + 支持中文
json_str = json.dumps(data, indent=2, ensure_ascii=False)
print(json_str)
```

### 反序列化（JSON → Python）

```python
import json

json_str = '{"name": "Alice", "age": 25, "scores": [98, 85, 92]}'
data = json.loads(json_str)
print(data["name"])      # Alice
print(data["scores"][0]) # 98
print(type(data))        # <class 'dict'>
```

### 类型映射

| JSON 类型 | Python 类型 |
|----------|------------|
| object | dict |
| array | list |
| string | str |
| number (int) | int |
| number (float) | float |
| true | True |
| false | False |
| null | None |

## 文件读写

### 写入 JSON 文件

```python
import json

data = {
    "users": [
        {"name": "Alice", "age": 25, "city": "Beijing"},
        {"name": "Bob", "age": 30, "city": "Shanghai"}
    ]
}

with open("users.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
```

### 读取 JSON 文件

```python
import json

with open("users.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for user in data["users"]:
    print(f"{user['name']} - {user['city']}")
```

## dumps() 高级参数

```python
import json

data = {"z_name": "Alice", "a_age": 25, "m_city": "Beijing"}

json.dumps(data,
    indent=2,              # 缩进空格数
    ensure_ascii=False,    # 允许非 ASCII 字符
    sort_keys=True,        # 键名排序
    separators=(',', ': '),# 自定义分隔符
    default=str            # 不可序列化类型的处理函数
)
```

### separators 参数

```python
# 默认（美化模式）
json.dumps(data, separators=(', ', ': '))

# 紧凑模式（最小体积）
json.dumps(data, separators=(',', ':'))
```

## 处理自定义对象

### 方法 1：default 参数

```python
import json
from datetime import datetime, date
from decimal import Decimal
from enum import Enum

class UserRole(Enum):
    ADMIN = "admin"
    USER = "user"

def json_serializer(obj):
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    if isinstance(obj, Decimal):
        return str(obj)
    if isinstance(obj, set):
        return sorted(list(obj))
    if isinstance(obj, Enum):
        return obj.value
    if isinstance(obj, bytes):
        import base64
        return base64.b64encode(obj).decode('utf-8')
    raise TypeError(f"Type {type(obj)} is not JSON serializable")

data = {
    "timestamp": datetime.now(),
    "amount": Decimal("99.99"),
    "tags": {"python", "json"},
    "role": UserRole.ADMIN
}

print(json.dumps(data, default=json_serializer, indent=2))
```

### 方法 2：自定义 JSONEncoder

```python
import json
from datetime import datetime

class CustomEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        if isinstance(obj, set):
            return list(obj)
        return super().default(obj)

data = {"time": datetime.now(), "items": {1, 2, 3}}
print(json.dumps(data, cls=CustomEncoder, indent=2))
```

### 方法 3：to_dict 模式

```python
import json

class User:
    def __init__(self, name, email):
        self.name = name
        self.email = email

    def to_dict(self):
        return {"name": self.name, "email": self.email}

user = User("Alice", "alice@example.com")
print(json.dumps(user.to_dict(), indent=2))
```

## 反序列化高级用法

### object_hook：自定义解码

```python
import json
from datetime import datetime

def custom_decoder(dct):
    for key, value in dct.items():
        if isinstance(value, str):
            try:
                dct[key] = datetime.fromisoformat(value)
            except (ValueError, TypeError):
                pass
    return dct

json_str = '{"name": "Alice", "createdAt": "2025-01-15T10:30:00"}'
data = json.loads(json_str, object_hook=custom_decoder)
print(type(data["createdAt"]))  # <class 'datetime.datetime'>
```

### object_pairs_hook：检测重复键

```python
import json

def detect_duplicates(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"Duplicate key: {key}")
        result[key] = value
    return result

try:
    data = json.loads('{"name": "Alice", "name": "Bob"}', object_pairs_hook=detect_duplicates)
except ValueError as e:
    print(e)  # Duplicate key: name
```

## 错误处理

```python
import json

def safe_parse(json_string):
    try:
        return json.loads(json_string), None
    except json.JSONDecodeError as e:
        return None, {
            "message": e.msg,
            "line": e.lineno,
            "column": e.colno,
            "position": e.pos
        }

data, error = safe_parse('{"name": "Alice",}')
if error:
    print(f"Line {error['line']}, Col {error['column']}: {error['message']}")
```

## 性能优化

### 大文件流式处理

```python
import json

def read_ndjson(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                yield json.loads(line)

for record in read_ndjson("large_data.ndjson"):
    process(record)
```

### 使用 orjson 提升性能

```python
# pip install orjson
import orjson

data = {"name": "Alice", "values": list(range(10000))}
json_bytes = orjson.dumps(data, option=orjson.OPT_INDENT_2)
parsed = orjson.loads(json_bytes)
```

### 性能对比

| 库 | 序列化速度 | 反序列化速度 | 特点 |
|----|----------|------------|------|
| json（标准库） | 1x | 1x | 无需安装 |
| ujson | 2-4x | 2-3x | C 扩展 |
| orjson | 3-10x | 2-5x | Rust 扩展，最快 |
| simplejson | 1-2x | 1-2x | json 的增强版 |

## 常见陷阱

### 陷阱 1：元组变列表
```python
data = {"coords": (39.9, 116.4)}
json.dumps(data)  # {"coords": [39.9, 116.4]}  元组被转换为数组
```

### 陷阱 2：字典键类型
```python
data = {1: "one", 2: "two"}
json.dumps(data)  # {"1": "one", "2": "two"}  整数键变字符串
```

### 陷阱 3：浮点精度
```python
json.dumps({"value": 0.1 + 0.2})  # {"value": 0.30000000000000004}
```

## 小结

- `json.dumps()` / `json.dump()` 用于序列化
- `json.loads()` / `json.load()` 用于反序列化
- `ensure_ascii=False` 支持中文直接输出
- 自定义类型用 `default` 参数或 `JSONEncoder` 子类
- 生产环境考虑 `orjson` 提升性能
- 注意元组→列表、整数键→字符串键的隐式转换
