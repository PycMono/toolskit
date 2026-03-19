# JSON 与 AI/LLM：构建智能应用的数据桥梁

> **分类**：实战应用　|　**级别**：高级　|　**标签**：AI, LLM, 大模型, 结构化输出, Function Calling

## JSON 在 AI 时代的核心角色

大语言模型（LLM）的崛起让 JSON 成为了人与 AI 交互的核心数据格式。从 API 调用到结构化输出，从 Function Calling 到 RAG 系统，JSON 无处不在。

## LLM API 的 JSON 交互

### OpenAI / 兼容 API 请求

```json
{
  "model": "gpt-4",
  "messages": [
    { "role": "system", "content": "你是一个专业的数据分析师。" },
    { "role": "user", "content": "分析这段销售数据的趋势。" }
  ],
  "temperature": 0.7,
  "max_tokens": 2000,
  "response_format": { "type": "json_object" }
}
```

### 响应

```json
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "model": "gpt-4",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "{\"trend\": \"上升\", \"growth_rate\": 15.3, \"peak_month\": \"11月\"}"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 156,
    "completion_tokens": 89,
    "total_tokens": 245
  }
}
```

## 结构化输出

让 LLM 输出结构化 JSON 而非自由文本，是构建可靠 AI 应用的关键。

### 方法一：System Prompt 约束

```json
{
  "messages": [
    {
      "role": "system",
      "content": "你是一个商品信息提取器。请从用户描述中提取信息，严格按以下 JSON 格式输出，不要输出其他内容：\n{\"name\": \"商品名\", \"price\": 数字, \"category\": \"分类\", \"features\": [\"特点1\", \"特点2\"]}"
    },
    {
      "role": "user",
      "content": "这款Cherry红轴机械键盘很不错，87键紧凑设计，RGB背光，售价599元"
    }
  ]
}
```

### 方法二：JSON Mode

```json
{
  "model": "gpt-4-turbo",
  "messages": [...],
  "response_format": { "type": "json_object" }
}
```

开启 JSON Mode 后，模型保证输出合法 JSON。

### 方法三：JSON Schema 约束（推荐）

```json
{
  "model": "gpt-4o",
  "messages": [...],
  "response_format": {
    "type": "json_schema",
    "json_schema": {
      "name": "product_extraction",
      "strict": true,
      "schema": {
        "type": "object",
        "required": ["name", "price", "category"],
        "properties": {
          "name": { "type": "string" },
          "price": { "type": "number" },
          "category": { "type": "string", "enum": ["电子产品", "服装", "食品", "其他"] },
          "features": {
            "type": "array",
            "items": { "type": "string" }
          }
        },
        "additionalProperties": false
      }
    }
  }
}
```

这是最可靠的方式——API 保证输出严格匹配 Schema。

## Function Calling / Tool Use

Function Calling 让 LLM 可以调用外部工具，定义和交互全部使用 JSON：

### 定义工具

```json
{
  "model": "gpt-4",
  "messages": [
    { "role": "user", "content": "北京今天天气怎么样？" }
  ],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "获取指定城市的天气信息",
        "parameters": {
          "type": "object",
          "required": ["city"],
          "properties": {
            "city": { "type": "string", "description": "城市名称" },
            "unit": { "type": "string", "enum": ["celsius", "fahrenheit"], "default": "celsius" }
          }
        }
      }
    }
  ]
}
```

### 模型调用工具

```json
{
  "choices": [{
    "message": {
      "role": "assistant",
      "tool_calls": [{
        "id": "call_abc123",
        "type": "function",
        "function": {
          "name": "get_weather",
          "arguments": "{\"city\": \"北京\", \"unit\": \"celsius\"}"
        }
      }]
    }
  }]
}
```

### 返回工具结果

```json
{
  "messages": [
    { "role": "user", "content": "北京今天天气怎么样？" },
    { "role": "assistant", "tool_calls": [{ "id": "call_abc123", ... }] },
    {
      "role": "tool",
      "tool_call_id": "call_abc123",
      "content": "{\"city\": \"北京\", \"temperature\": 5, \"condition\": \"晴\", \"humidity\": 30}"
    }
  ]
}
```

模型根据工具返回的 JSON 生成最终回答。

## RAG 系统中的 JSON

检索增强生成（RAG）系统中，JSON 用于存储和传递检索结果：

```json
{
  "messages": [
    {
      "role": "system",
      "content": "基于以下检索到的文档回答用户问题。如果文档中没有答案，请说明。"
    },
    {
      "role": "user",
      "content": "退货政策是什么？\n\n---检索到的文档---\n[{\"title\": \"退货政策\", \"content\": \"自购买之日起30天内可无理由退货...\", \"score\": 0.95}, {\"title\": \"运费说明\", \"content\": \"退货运费由买家承担...\", \"score\": 0.82}]"
    }
  ]
}
```

### 向量数据库的 JSON 交互

```python
# Pinecone 示例
index.upsert(vectors=[
    {
        "id": "doc-001",
        "values": embedding_vector,  # [0.1, 0.2, ...]
        "metadata": {
            "title": "退货政策",
            "category": "customer-service",
            "updated_at": "2025-01-15"
        }
    }
])

# 查询结果也是 JSON
results = index.query(
    vector=query_embedding,
    top_k=5,
    include_metadata=True
)
# results.matches = [
#   {"id": "doc-001", "score": 0.95, "metadata": {...}},
#   ...
# ]
```

## AI Agent 的 JSON 通信

AI Agent 使用 JSON 管理状态和行动计划：

```json
{
  "task": "分析竞品定价并生成报告",
  "steps": [
    {
      "action": "web_search",
      "params": { "query": "竞品 A 最新定价" },
      "status": "completed",
      "result": { "price": 999, "source": "official_site" }
    },
    {
      "action": "web_search",
      "params": { "query": "竞品 B 最新定价" },
      "status": "completed",
      "result": { "price": 1299, "source": "jd.com" }
    },
    {
      "action": "analyze",
      "params": { "type": "price_comparison" },
      "status": "in_progress"
    },
    {
      "action": "generate_report",
      "params": { "format": "markdown" },
      "status": "pending"
    }
  ],
  "memory": {
    "competitors": ["A", "B"],
    "our_price": 1099
  }
}
```

## 训练数据格式

微调 LLM 的训练数据通常使用 JSONL（NDJSON）格式：

```jsonl
{"messages": [{"role": "system", "content": "你是客服助手"}, {"role": "user", "content": "怎么退货？"}, {"role": "assistant", "content": "您好，30天内可以申请退货..."}]}
{"messages": [{"role": "user", "content": "运费多少？"}, {"role": "assistant", "content": "标准运费为10元..."}]}
```

每行一个训练样本，方便流式处理和追加。

## 小结

- JSON 是 LLM API 交互的标准格式（请求、响应、工具调用）
- 结构化输出通过 JSON Schema 约束保证可靠性
- Function Calling 用 JSON Schema 定义工具接口
- RAG 系统中 JSON 承载检索结果和上下文
- 训练数据使用 JSONL 格式，支持高效的流式处理
- 掌握 JSON 是构建 AI 应用的基础技能
