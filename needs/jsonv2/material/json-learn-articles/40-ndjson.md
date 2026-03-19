# NDJSON：换行分隔的 JSON 流

> **分类**：高级主题　|　**级别**：高级　|　**标签**：NDJSON, JSON Lines, 流式处理, 日志

## 什么是 NDJSON

NDJSON（Newline Delimited JSON），也叫 JSON Lines / JSONL，是一种每行一个 JSON 对象的文本格式：

```
{"id":1,"event":"login","user":"alice","ts":"2025-01-15T08:00:00Z"}
{"id":2,"event":"view","user":"alice","ts":"2025-01-15T08:01:23Z"}
{"id":3,"event":"purchase","user":"bob","ts":"2025-01-15T08:02:45Z"}
```

每行是一个独立的、完整的 JSON 值，用 `\n` 分隔。没有外层的 `[]` 包裹，也没有逗号分隔。

## 为什么不用 JSON 数组

普通 JSON 数组（`[{...}, {...}, ...]`）有几个严重问题：

1. **内存**：必须把整个数组读入内存才能解析
2. **追加**：往数组末尾加元素需要先读取整个文件、修改、再写回
3. **流式**：无法边产生边消费，必须等整个数组完成
4. **容错**：数组中间任何一处语法错误，整个文件无法解析

NDJSON 解决了所有这些问题：

| 维度 | JSON Array | NDJSON |
|------|-----------|--------|
| 内存占用 | 全部加载 | 逐行处理 |
| 追加数据 | 需要重写文件 | 直接 append |
| 流式处理 | 不支持 | 天然支持 |
| 容错性 | 一处出错全废 | 跳过坏行继续 |
| 文件大小限制 | 受内存限制 | 几乎无限 |

## 使用场景

- **日志收集**：每条日志一行 JSON（ELK Stack、Fluentd）
- **数据管道**：ETL 中间格式
- **AI/ML 数据集**：训练数据通常是 JSONL 格式
- **数据库导出**：MongoDB `mongoexport` 默认输出 NDJSON
- **API 流式响应**：Server-Sent Events、ChatGPT API
- **大文件处理**：GB 级数据的逐行处理

## 各语言处理

### Python

```python
import json

# 写入 NDJSON
events = [
    {"id": 1, "event": "login", "user": "alice"},
    {"id": 2, "event": "view", "user": "bob"},
    {"id": 3, "event": "purchase", "user": "alice"},
]

with open("events.jsonl", "w") as f:
    for event in events:
        f.write(json.dumps(event, ensure_ascii=False) + "\n")

# 逐行读取（内存友好）
with open("events.jsonl") as f:
    for line in f:
        line = line.strip()
        if line:  # 跳过空行
            record = json.loads(line)
            print(record["event"])

# 用生成器处理大文件
def read_ndjson(filepath):
    with open(filepath) as f:
        for lineno, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            try:
                yield json.loads(line)
            except json.JSONDecodeError as e:
                print(f"Line {lineno} error: {e}")
                continue  # 跳过坏行

# 统计 alice 的事件数
alice_count = sum(1 for r in read_ndjson("events.jsonl") if r["user"] == "alice")
```

### Node.js

```javascript
const fs = require("fs");
const readline = require("readline");

// 逐行流式读取
async function processNDJSON(filepath) {
  const rl = readline.createInterface({
    input: fs.createReadStream(filepath),
    crlfDelay: Infinity,
  });

  const results = [];
  for await (const line of rl) {
    if (line.trim()) {
      try {
        results.push(JSON.parse(line));
      } catch (e) {
        console.error("Bad line:", e.message);
      }
    }
  }
  return results;
}

// 写入
function writeNDJSON(filepath, records) {
  const stream = fs.createWriteStream(filepath);
  for (const record of records) {
    stream.write(JSON.stringify(record) + "\n");
  }
  stream.end();
}

// 追加一条记录
function appendNDJSON(filepath, record) {
  fs.appendFileSync(filepath, JSON.stringify(record) + "\n");
}
```

### Go

```go
package main

import (
    "bufio"
    "encoding/json"
    "fmt"
    "os"
)

type Event struct {
    ID    int    `json:"id"`
    Event string `json:"event"`
    User  string `json:"user"`
}

func readNDJSON(filepath string) ([]Event, error) {
    f, err := os.Open(filepath)
    if err != nil {
        return nil, err
    }
    defer f.Close()

    var events []Event
    scanner := bufio.NewScanner(f)
    for scanner.Scan() {
        var e Event
        if err := json.Unmarshal(scanner.Bytes(), &e); err != nil {
            fmt.Printf("Skipping bad line: %v\n", err)
            continue
        }
        events = append(events, e)
    }
    return events, scanner.Err()
}
```

### 命令行（jq）

```bash
# 过滤特定用户的事件
cat events.jsonl | jq 'select(.user == "alice")'

# 统计每种事件的数量
cat events.jsonl | jq -s 'group_by(.event) | map({event: .[0].event, count: length})'

# 提取所有用户名（去重）
cat events.jsonl | jq -r '.user' | sort -u
```

## 规范细节

1. 每行必须是一个完整的 JSON 值（通常是对象）
2. 行分隔符是 `\n`（LF），`\r\n`（CRLF）也可接受
3. 每行内部不应有换行（JSON 要紧凑格式）
4. 文件扩展名：`.jsonl`、`.ndjson`、`.ldjson`
5. MIME 类型：`application/x-ndjson`

## 小结

- NDJSON 是每行一个 JSON 值的简单格式
- 天然支持流式处理、追加写入、跳过坏行
- 是日志、数据管道、ML 数据集的标准格式
- 配合 jq 可以在命令行高效处理
- 处理大文件时比 JSON 数组更节省内存
