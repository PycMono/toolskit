# Block B-04 · AI 人性化工具 — 后端 SSE 流式接口

> **所属模块**：AI 人性化工具（/ailab/humanize）  
> **预估工时**：3h  
> **依赖**：AI 服务工厂（C-01）已实现；若未完成，临时 hardcode OpenAI  
> **交付粒度**：仅负责 `POST /api/ailab/humanize` 的 Go SSE 流式实现，不含前端

---

## 1. 接口规范

### Request

```
POST /api/ailab/humanize
Content-Type: application/json
```

```json
{
  "text":     "AI 生成的文本内容...",
  "mode":     "standard",
  "language": "zh"
}
```

| 字段 | 类型 | 必填 | 可选值 |
|------|------|------|------|
| text | string | ✅ | — |
| mode | string | ❌ | standard / formal / casual / academic / creative，默认 standard |
| language | string | ❌ | zh / en，默认 auto |

### Response（SSE 流式）

```
Content-Type: text/event-stream
Cache-Control: no-cache
X-Accel-Buffering: no
```

```
event: message
data: {"content":"Transform"}

event: message
data: {"content":"ed text "}

event: done
data: {"done":true,"changed_percent":34,"word_count":156}

# 错误时：
event: error
data: {"message":"humanize failed"}
```

### Response（失败，非流式）

```json
{ "error": "text is required" }        // 400
{ "error": "text exceeds 5000 chars" } // 400
{ "error": "unsupported mode" }         // 400
```

---

## 2. Go 实现

### 文件：`internal/handler/ailab_humanize.go`

```go
package handler

import (
    "context"
    "fmt"
    "io"
    "net/http"
    "strings"
    "time"
    "unicode/utf8"

    "github.com/gin-gonic/gin"
    "devtoolbox/internal/aiservice"
)

const humanizeMaxChars = 5000

var validModes = map[string]bool{
    "standard": true,
    "formal":   true,
    "casual":   true,
    "academic": true,
    "creative": true,
}

// humanizePrompts 各模式的系统 Prompt
var humanizePrompts = map[string]string{
    "standard": `You are a professional text humanizer. Your task is to rewrite the given AI-generated text to sound more natural and authentically human.

Rules:
- Vary sentence lengths (mix short punchy sentences with longer ones)
- Use contractions naturally (it's, don't, I'm, you'll)
- Add subtle natural imperfections typical of human writing
- Include occasional transitional phrases (however, actually, in fact, that said)
- Preserve the original meaning completely
- DO NOT add new information or change facts
- Return ONLY the rewritten text, no explanation, no preamble`,

    "formal": `You are a professional business writer. Rewrite the given AI-generated text in a formal, professional business tone.

Rules:
- Use sophisticated but clear vocabulary
- Maintain a respectful, authoritative voice
- Avoid overly AI-like repetitive structures
- Keep sentences varied but grammatically precise
- Suitable for business emails, reports, and professional documents
- Return ONLY the rewritten text`,

    "casual": `You are writing in a casual, conversational style. Rewrite the given AI-generated text to sound like a real person talking to a friend.

Rules:
- Use contractions freely (it's, don't, gonna, wanna when natural)
- Include natural speech patterns and informal phrasing
- Keep it friendly and approachable
- Use shorter sentences and paragraphs
- Add personality without changing the core meaning
- Return ONLY the rewritten text`,

    "academic": `You are an academic writer. Rewrite the given AI-generated text in a scholarly academic style appropriate for research papers and essays.

Rules:
- Use precise academic vocabulary
- Include complex but clear sentence structures
- Maintain scholarly tone while sounding authentic (not robotic)
- Use appropriate academic transitions (furthermore, consequently, nonetheless)
- Avoid colloquialisms
- Return ONLY the rewritten text`,

    "creative": `You are a creative writer. Rewrite the given AI-generated text with creative flair that showcases authentic human creativity.

Rules:
- Use vivid imagery and varied metaphors
- Employ diverse sentence structures for rhythm
- Add personality and unique voice
- Make it engaging and memorable
- Preserve the core meaning while adding creative expression
- Return ONLY the rewritten text`,
}

// HumanizeStream 处理 AI 人性化请求（SSE 流式）
func HumanizeStream(c *gin.Context) {
    var req struct {
        Text     string `json:"text"     binding:"required"`
        Mode     string `json:"mode"`
        Language string `json:"language"`
    }
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "text is required"})
        return
    }

    req.Text = strings.TrimSpace(req.Text)
    if req.Text == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "text is empty"})
        return
    }
    if utf8.RuneCountInString(req.Text) > humanizeMaxChars {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": fmt.Sprintf("text exceeds %d chars", humanizeMaxChars),
        })
        return
    }

    // 默认 mode
    if req.Mode == "" {
        req.Mode = "standard"
    }
    if !validModes[req.Mode] {
        c.JSON(http.StatusBadRequest, gin.H{"error": "unsupported mode"})
        return
    }

    // 获取 AI 提供商（任务路由：humanize）
    factory  := aiservice.GetFactory()
    provider, err := factory.GetProviderForTask("humanize")
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "AI service unavailable"})
        return
    }

    // 语言提示追加
    systemPrompt := humanizePrompts[req.Mode]
    if req.Language == "zh" {
        systemPrompt += "\n\nIMPORTANT: The input text is in Chinese. Rewrite in Chinese."
    }

    chatReq := aiservice.ChatRequest{
        SystemPrompt: systemPrompt,
        Messages: []aiservice.Message{
            {Role: "user", Content: req.Text},
        },
        MaxTokens:   3000,
        Temperature: 0.85, // 略高温度，增加创造性变化
    }

    // 设置 SSE 响应头
    c.Header("Content-Type", "text/event-stream")
    c.Header("Cache-Control", "no-cache")
    c.Header("Connection", "keep-alive")
    c.Header("X-Accel-Buffering", "no")  // 关闭 Nginx 缓冲

    ctx, cancel := context.WithTimeout(c.Request.Context(), 60*time.Second)
    defer cancel()

    ch, err := provider.ChatStream(ctx, chatReq)
    if err != nil {
        // Fallback
        fallback, fErr := factory.GetDefaultProvider()
        if fErr != nil {
            c.SSEvent("error", gin.H{"message": "humanize service unavailable"})
            return
        }
        ch, err = fallback.ChatStream(ctx, chatReq)
        if err != nil {
            c.SSEvent("error", gin.H{"message": "humanize failed"})
            return
        }
    }

    // 收集完整输出用于计算统计
    var fullOutput strings.Builder

    c.Stream(func(w io.Writer) bool {
        chunk, ok := <-ch
        if !ok {
            return false
        }
        if chunk.Error != nil {
            c.SSEvent("error", gin.H{"message": chunk.Error.Error()})
            return false
        }
        if chunk.Done {
            // 计算修改百分比
            changedPct := estimateChangedPercent(req.Text, fullOutput.String())
            wordCount  := len(strings.Fields(fullOutput.String()))
            c.SSEvent("done", gin.H{
                "done":            true,
                "changed_percent": changedPct,
                "word_count":      wordCount,
            })
            return false
        }

        fullOutput.WriteString(chunk.Content)
        c.SSEvent("message", gin.H{"content": chunk.Content})
        return true
    })
}

// estimateChangedPercent 估算修改词汇的百分比
func estimateChangedPercent(original, humanized string) int {
    origWords := strings.Fields(strings.ToLower(original))
    newWords  := strings.Fields(strings.ToLower(humanized))

    if len(origWords) == 0 {
        return 0
    }

    // 构建原文词集合
    origSet := make(map[string]int)
    for _, w := range origWords {
        origSet[cleanWord(w)]++
    }

    // 计算新词中不在原文的词数
    changed := 0
    for _, w := range newWords {
        key := cleanWord(w)
        if cnt, ok := origSet[key]; ok && cnt > 0 {
            origSet[key]--
        } else {
            changed++
        }
    }

    total := max(len(origWords), len(newWords))
    pct   := changed * 100 / total
    if pct > 95 { pct = 95 }
    return pct
}

func cleanWord(w string) string {
    w = strings.Trim(w, ".,!?;:\"'()[]{}—-")
    return w
}

func max(a, b int) int {
    if a > b { return a }
    return b
}
```

---

## 3. 路由注册

```go
// internal/router/router.go（追加）
ailabAPI.POST("/humanize", handler.HumanizeStream)
```

---

## 4. config.yaml 任务路由

```yaml
ai:
  task_routing:
    humanize: "openai"     # GPT-4o-mini 语言质量更自然
    # 备用：deepseek 也可，成本更低
```

---

## 5. 验收标准

- [ ] `curl -N -X POST /api/ailab/humanize -d '{"text":"...","mode":"standard"}` 能看到 SSE 流式输出
- [ ] 每个 mode 都有不同的改写风格（standard vs formal vs casual 明显区别）
- [ ] `done` 事件携带 `changed_percent`（合理范围 15–80%）
- [ ] 空文本返回 400
- [ ] 无效 mode 返回 400
- [ ] 60 秒超时后连接自动断开
- [ ] 中文文本使用 `language: "zh"` 时改写结果仍为中文

