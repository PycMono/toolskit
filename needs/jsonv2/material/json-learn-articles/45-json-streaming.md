# JSON 流式处理：大数据的实时传输

> **分类**：安全与性能　|　**级别**：高级　|　**标签**：流式处理, SSE, WebSocket, 大文件

## 什么是 JSON 流式处理

传统的 JSON API 必须等所有数据准备好后才能返回完整的 JSON 响应。流式处理则允许 **边产生、边传输、边消费** JSON 数据。

典型场景：
- ChatGPT 的逐字输出（SSE + JSON）
- 实时日志推送
- 大型数据集的导出
- 数据库查询结果的流式返回

## Server-Sent Events (SSE)

SSE 是最简单的服务端推送技术，基于 HTTP 长连接：

### 服务端（Node.js）

```javascript
const express = require("express");
const app = express();

app.get("/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let count = 0;
  const interval = setInterval(() => {
    count++;
    const data = JSON.stringify({
      id: count,
      message: `Event ${count}`,
      timestamp: new Date().toISOString()
    });
    res.write(`data: ${data}\n\n`);

    if (count >= 10) {
      clearInterval(interval);
      res.write("data: [DONE]\n\n");
      res.end();
    }
  }, 500);

  req.on("close", () => clearInterval(interval));
});
```

### 服务端（Python / FastAPI）

```python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import json
import asyncio

app = FastAPI()

async def event_generator():
    for i in range(10):
        data = json.dumps({"id": i, "message": f"Event {i}"})
        yield f"data: {data}\n\n"
        await asyncio.sleep(0.5)
    yield "data: [DONE]\n\n"

@app.get("/stream")
async def stream():
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )
```

### 客户端

```javascript
const evtSource = new EventSource("/stream");

evtSource.onmessage = (event) => {
  if (event.data === "[DONE]") {
    evtSource.close();
    return;
  }
  const data = JSON.parse(event.data);
  console.log(data.message);
};

evtSource.onerror = () => {
  evtSource.close();
};
```

## 类 ChatGPT 流式输出

ChatGPT API 使用 SSE 传输 JSON 数据块：

```javascript
async function streamChat(prompt) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, stream: true })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop(); // 保留不完整的行

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") return;
        try {
          const chunk = JSON.parse(data);
          process.stdout.write(chunk.content || "");
        } catch (e) {
          // 跳过无效行
        }
      }
    }
  }
}
```

## NDJSON 流式传输

NDJSON 天然适合流式处理：

```javascript
// 服务端
app.get("/export", async (req, res) => {
  res.setHeader("Content-Type", "application/x-ndjson");

  const cursor = db.collection("users").find().cursor();
  for await (const doc of cursor) {
    res.write(JSON.stringify(doc) + "\n");
  }
  res.end();
});

// 客户端
async function consumeNDJSON(url) {
  const response = await fetch(url);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop();

    for (const line of lines) {
      if (line.trim()) {
        const record = JSON.parse(line);
        processRecord(record);
      }
    }
  }
}
```

## Go 流式编码

```go
func streamHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/x-ndjson")
    flusher, _ := w.(http.Flusher)
    encoder := json.NewEncoder(w)

    rows, _ := db.Query("SELECT id, name, email FROM users")
    defer rows.Close()

    for rows.Next() {
        var user User
        rows.Scan(&user.ID, &user.Name, &user.Email)
        encoder.Encode(user)  // 自动追加 \n
        flusher.Flush()       // 立即发送
    }
}
```

## WebSocket + JSON

双向实时通信场景（聊天、游戏、协作编辑）：

```javascript
// 服务端 (ws 库)
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", (ws) => {
  ws.on("message", (raw) => {
    const msg = JSON.parse(raw);
    // 广播给所有客户端
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          user: msg.user,
          text: msg.text,
          ts: Date.now()
        }));
      }
    });
  });
});

// 客户端
const ws = new WebSocket("ws://localhost:8080");
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  appendMessage(data);
};
ws.send(JSON.stringify({ user: "Alice", text: "Hello!" }));
```

## 技术选型

| 技术 | 方向 | 协议 | 适用场景 |
|------|------|------|----------|
| SSE | 服务端→客户端 | HTTP | 通知、实时更新、AI 流式输出 |
| WebSocket | 双向 | WS | 聊天、游戏、协作 |
| NDJSON | 服务端→客户端 | HTTP | 数据导出、日志流 |
| gRPC Streaming | 双向 | HTTP/2 | 微服务间高性能通信 |

## 小结

- 流式 JSON 处理允许边产生边消费，降低延迟和内存使用
- SSE 适合服务端单向推送（如 ChatGPT 流式输出）
- NDJSON 是流式传输 JSON 记录的理想格式
- WebSocket 适合双向实时通信
- 客户端需要处理不完整的数据块，维护缓冲区
