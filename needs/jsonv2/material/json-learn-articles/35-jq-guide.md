# jq 命令行 JSON 处理完全指南

> **分类**：高级主题　|　**级别**：高级　|　**标签**：jq, 命令行, JSON处理, 数据转换

## 什么是 jq

jq 是命令行下的 JSON 处理神器。它就像是 JSON 的 `sed` + `awk`：能查询、过滤、转换、构造 JSON 数据，而且无需写完整程序。

```bash
# 安装
# macOS
brew install jq
# Ubuntu/Debian
sudo apt install jq
# Windows
choco install jq
```

## 基础查询

```bash
# 美化输出
echo '{"name":"Alice","age":25}' | jq '.'

# 提取字段
echo '{"name":"Alice","age":25}' | jq '.name'
# "Alice"

# 提取嵌套字段
echo '{"user":{"name":"Alice","addr":{"city":"Beijing"}}}' | jq '.user.addr.city'
# "Beijing"

# 去掉字符串引号（raw output）
echo '{"name":"Alice"}' | jq -r '.name'
# Alice
```

## 数组操作

```bash
DATA='[{"name":"Alice","age":25},{"name":"Bob","age":30},{"name":"Carol","age":28}]'

# 取所有名字
echo "$DATA" | jq '.[].name'
# "Alice"
# "Bob"
# "Carol"

# 取第一个元素
echo "$DATA" | jq '.[0]'

# 切片
echo "$DATA" | jq '.[:2]'

# 数组长度
echo "$DATA" | jq 'length'
# 3
```

## 过滤与条件

```bash
# 年龄大于 25 的人
echo "$DATA" | jq '.[] | select(.age > 25)'

# 组合条件
echo "$DATA" | jq '.[] | select(.age > 25 and .name != "Bob")'

# 重新包装成数组
echo "$DATA" | jq '[.[] | select(.age > 25)]'
```

## 数据转换

### 构造新对象

```bash
echo "$DATA" | jq '.[] | { username: .name, birth_year: (2025 - .age) }'
# { "username": "Alice", "birth_year": 2000 }
# { "username": "Bob",   "birth_year": 1995 }
# ...
```

### map 和 map_values

```bash
# 对数组每个元素操作
echo "$DATA" | jq 'map({ name: .name, senior: (.age >= 28) })'

# 所有年龄加 1
echo "$DATA" | jq 'map(.age += 1)'
```

### 字符串操作

```bash
# 拼接字符串
echo '{"first":"John","last":"Doe"}' | jq '.first + " " + .last'
# "John Doe"

# 字符串插值
echo '{"name":"Alice","age":25}' | jq '"\(.name) is \(.age) years old"'
# "Alice is 25 years old"

# 分割和连接
echo '"a,b,c"' | jq 'split(",")'
# ["a","b","c"]
echo '["a","b","c"]' | jq 'join("-")'
# "a-b-c"
```

## 聚合函数

```bash
NUMS='[10, 20, 30, 40, 50]'

echo "$NUMS" | jq 'add'        # 150
echo "$NUMS" | jq 'min'        # 10
echo "$NUMS" | jq 'max'        # 50
echo "$NUMS" | jq 'add/length' # 30（平均值）

# 对象数组的聚合
echo "$DATA" | jq '[.[].age] | add / length'
# 27.666...
```

## 分组与排序

```bash
ITEMS='[
  {"category":"fruit","name":"apple","price":3},
  {"category":"fruit","name":"banana","price":2},
  {"category":"veggie","name":"carrot","price":4}
]'

# 按价格排序
echo "$ITEMS" | jq 'sort_by(.price)'

# 按类别分组
echo "$ITEMS" | jq 'group_by(.category) | map({ category: .[0].category, items: map(.name) })'
# [{"category":"fruit","items":["banana","apple"]}, ...]

# 去重
echo '[1,2,2,3,3,3]' | jq 'unique'
# [1,2,3]
```

## 高级技巧

### 处理文件

```bash
# 读取文件
jq '.users[] | select(.active)' users.json

# 输出到文件
jq '.data' input.json > output.json

# 紧凑输出（无换行）
jq -c '.' input.json
```

### 多文件合并

```bash
# 合并两个 JSON 对象
jq -s '.[0] * .[1]' defaults.json overrides.json

# 合并多个数组
jq -s 'add' file1.json file2.json file3.json
```

### 处理 NDJSON

```bash
# 逐行处理（默认行为）
cat events.ndjson | jq 'select(.level == "error")'

# 收集为数组
cat events.ndjson | jq -s '.'
```

### 条件赋值和更新

```bash
# 更新特定字段
echo '{"name":"Alice","status":"active"}' | jq '.status = "inactive"'

# 条件更新
echo "$DATA" | jq 'map(if .age > 28 then .category = "senior" else .category = "junior" end)'

# 删除字段
echo '{"a":1,"b":2,"c":3}' | jq 'del(.b)'
# {"a":1,"c":3}
```

### 环境变量和参数

```bash
# 传入外部变量
NAME="Alice"
echo "$DATA" | jq --arg name "$NAME" '.[] | select(.name == $name)'

# 传入 JSON 值
echo '{}' | jq --argjson count 42 '. + {count: $count}'
```

## 实战示例

### API 响应处理

```bash
# 从 GitHub API 提取仓库信息
curl -s 'https://api.github.com/users/torvalds/repos?per_page=5' | \
  jq '.[] | { name: .name, stars: .stargazers_count, language: .language }' 

# 按 star 数排序取 Top 3
curl -s 'https://api.github.com/users/torvalds/repos' | \
  jq 'sort_by(-.stargazers_count) | .[:3] | .[] | "\(.name): \(.stargazers_count) stars"'
```

### 日志分析

```bash
# 统计各级别日志数量
cat app.log.json | jq -s 'group_by(.level) | map({level: .[0].level, count: length})'

# 提取最近 10 条错误
cat app.log.json | jq -s '[.[] | select(.level=="error")] | sort_by(.timestamp) | .[-10:]'
```

### CSV 转换

```bash
# JSON 数组转 CSV
echo "$DATA" | jq -r '["name","age"], (.[] | [.name, .age]) | @csv'
# "name","age"
# "Alice",25
# "Bob",30
```

## 常用 jq 速查

| 操作 | 语法 |
|------|------|
| 美化 | `jq '.'` |
| 紧凑 | `jq -c '.'` |
| 提取字段 | `jq '.key'` |
| 数组元素 | `jq '.[0]'`、`jq '.[]'` |
| 过滤 | `jq '.[] \| select(.x > 1)'` |
| 构造对象 | `jq '{ a: .x, b: .y }'` |
| 排序 | `jq 'sort_by(.key)'` |
| 去重 | `jq 'unique'` |
| 长度 | `jq 'length'` |
| 键名 | `jq 'keys'` |
| 类型 | `jq 'type'` |
| 删除字段 | `jq 'del(.key)'` |

## 小结

- jq 是命令行下处理 JSON 的最佳工具
- 支持查询、过滤、转换、聚合、分组等全套操作
- `-r` 输出原始字符串，`-c` 紧凑输出，`-s` 收集为数组
- `select()` 过滤、`map()` 映射、`group_by()` 分组
- 结合 `curl` 可以快速处理 API 响应
