# Swift JSON 编解码（Codable 协议）

> **分类**：多语言实战　|　**级别**：中级　|　**标签**：Swift, Codable, JSONDecoder, JSONEncoder

## Codable 基础

```swift
import Foundation

struct User: Codable {
    let name: String
    let age: Int
    let email: String
}

// 编码
let encoder = JSONEncoder()
encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
let jsonData = try encoder.encode(user)

// 解码
let decoder = JSONDecoder()
let user = try decoder.decode(User.self, from: jsonData)
```

## CodingKeys 自定义

```swift
struct Product: Codable {
    let id: Int
    let productName: String

    enum CodingKeys: String, CodingKey {
        case id
        case productName = "product_name"
    }
}

// 或全局 snake_case 策略
decoder.keyDecodingStrategy = .convertFromSnakeCase
encoder.keyEncodingStrategy = .convertToSnakeCase
```

## 日期处理

```swift
decoder.dateDecodingStrategy = .iso8601
// 或自定义格式
let formatter = DateFormatter()
formatter.dateFormat = "yyyy-MM-dd"
decoder.dateDecodingStrategy = .formatted(formatter)
```

## 可选值与默认值

```swift
struct Config: Codable {
    let name: String
    let timeout: Int?

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        name = try container.decode(String.self, forKey: .name)
        timeout = try container.decodeIfPresent(Int.self, forKey: .timeout)
    }
}
```

## 泛型 API 响应

```swift
struct APIResponse<T: Codable>: Codable {
    let code: Int
    let message: String
    let data: T?
}

let response = try decoder.decode(APIResponse<[User]>.self, from: data)
```

## 错误处理

```swift
do {
    let user = try decoder.decode(User.self, from: data)
} catch DecodingError.keyNotFound(let key, _) {
    print("缺少字段: \(key.stringValue)")
} catch DecodingError.typeMismatch(let type, _) {
    print("类型不匹配: \(type)")
}
```

## 小结

- Codable 协议提供编译时类型安全
- CodingKeys 自定义字段映射
- `decodeIfPresent` 处理可选字段
- 泛型统一 API 响应解析
