# Rust JSON 处理：serde_json 实战

> **分类**：多语言实战　|　**级别**：中级　|　**标签**：Rust, serde, serde_json, 序列化

## serde + serde_json

```toml
[dependencies]
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
```

## 强类型序列化

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct User {
    name: String,
    age: u32,
    email: String,
    skills: Vec<String>,
}

fn main() -> Result<(), serde_json::Error> {
    let user = User {
        name: "Alice".into(), age: 25,
        email: "alice@example.com".into(),
        skills: vec!["Rust".into(), "Go".into()],
    };

    let json = serde_json::to_string_pretty(&user)?;
    let parsed: User = serde_json::from_str(&json)?;
    Ok(())
}
```

## serde 属性宏

```rust
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Product {
    #[serde(rename = "product_id")]
    id: u64,
    product_name: String,
    #[serde(skip_serializing)]
    internal_code: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    description: Option<String>,
    #[serde(default)]
    stock: u32,
}
```

## 动态 JSON

```rust
use serde_json::{json, Value};

let data = json!({
    "name": "Alice",
    "scores": [98, 85, 92]
});

println!("{}", data["name"]);
if let Some(name) = data["name"].as_str() {
    println!("Name: {}", name);
}
```

## 枚举序列化

```rust
#[derive(Serialize, Deserialize)]
#[serde(tag = "type", content = "data")]
enum Event {
    #[serde(rename = "user_created")]
    UserCreated { name: String },
    #[serde(rename = "order_placed")]
    OrderPlaced { order_id: String, amount: f64 },
}
```

## 小结

- `#[derive(Serialize, Deserialize)]` 自动实现
- `#[serde(...)]` 精确控制序列化行为
- `serde_json::Value` 处理动态 JSON
- `json!` 宏提供 JSON 字面量语法
- 编译时类型检查确保安全性
