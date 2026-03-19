# JSON vs Protocol Buffers 性能对比

> **分类**：格式对比　|　**级别**：中级　|　**标签**：JSON, Protocol Buffers, gRPC, 二进制

## 核心对比

| 维度 | JSON | Protocol Buffers |
|------|------|-----------------|
| 格式 | 文本 | 二进制 |
| 可读性 | ✅ 人类可读 | ❌ 需工具 |
| 体积 | 较大 | 小 3-10x |
| 速度 | 较慢 | 快 2-10x |
| Schema | 可选 | 必须 (.proto) |
| 语言支持 | 几乎所有 | 主流语言 |
| 浏览器 | 原生支持 | 需要库 |
| 版本兼容 | 灵活 | 内置向前/向后兼容 |

## 定义对比

**JSON（无 Schema）：**
```json
{
  "id": 1,
  "name": "Alice",
  "email": "alice@example.com",
  "age": 25,
  "roles": ["admin", "editor"]
}
```

**Protocol Buffers Schema：**
```protobuf
syntax = "proto3";

message User {
  int32 id = 1;
  string name = 2;
  string email = 3;
  int32 age = 4;
  repeated string roles = 5;
}
```

## 性能对比

| 指标 | JSON | Protobuf | 差异 |
|------|------|----------|------|
| 序列化大小 | 100B | 35B | Protobuf 小 65% |
| 序列化耗时 | 10μs | 2μs | Protobuf 快 5x |
| 反序列化耗时 | 15μs | 3μs | Protobuf 快 5x |

## 何时选择 JSON

- Web 前端 API
- 公开 REST API
- 调试和日志记录需要可读性
- 配置文件
- 快速原型开发

## 何时选择 Protobuf

- 微服务间通信（gRPC）
- 高性能、低延迟场景
- 移动端节省带宽
- 大数据量传输
- 需要严格 Schema 和版本管理

## 混合使用

很多系统同时使用两者：外部 API 用 JSON（兼容性好），内部微服务用 gRPC/Protobuf（性能高）。

## 小结

JSON 可读性好、生态广泛，适合面向外部的 API。Protobuf 体积小、速度快，适合内部高性能通信。
