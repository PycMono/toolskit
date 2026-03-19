# Ruby JSON 处理指南

> **分类**：多语言实战　|　**级别**：中级　|　**标签**：Ruby, json, Rails, 序列化

## Ruby 标准库 JSON

```ruby
require 'json'

# Hash → JSON
data = { name: "Alice", age: 25, skills: ["Ruby", "Rails"] }
json_str = JSON.generate(data)
json_pretty = JSON.pretty_generate(data)

# JSON → Hash
parsed = JSON.parse('{"name":"Alice","age":25}')
puts parsed["name"]  # Alice

# 符号化键名
parsed = JSON.parse('{"name":"Alice"}', symbolize_names: true)
puts parsed[:name]   # Alice
```

## 文件操作

```ruby
require 'json'

# 写入
File.write("data.json", JSON.pretty_generate(data))

# 读取
data = JSON.parse(File.read("data.json"), symbolize_names: true)
```

## 自定义对象序列化

```ruby
class User
  attr_accessor :name, :email

  def to_json(*args)
    { name: @name, email: @email }.to_json(*args)
  end
end
```

## Rails 中的 JSON

```ruby
class User < ApplicationRecord
  def as_json(options = {})
    super(options.merge(
      only: [:id, :name, :email],
      include: { posts: { only: [:id, :title] } }
    ))
  end
end

# Controller
render json: users, status: :ok
```

## 高性能：Oj gem

```ruby
require 'oj'
json = Oj.dump(data, mode: :compat)  # 比标准库快 2-3x
parsed = Oj.load(json)
```

## 小结

- `JSON.generate` / `JSON.parse` 是核心方法
- `symbolize_names: true` 将键转为 Symbol
- Rails 用 `as_json` 和 `render json:` 控制输出
- 高性能场景使用 Oj gem
