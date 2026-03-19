# Block A-06 · AI 内容检测器 — 后端检测接口

> **所属模块**：AI 内容检测器（/ailab/detector）  
> **预估工时**：4h  
> **依赖**：AI 服务工厂（C-01）已实现；若 C-01 未完成，临时使用 OpenAI 直连  
> **交付粒度**：仅负责 `POST /api/ailab/detect` 接口的 Go 实现，不含前端

---

## 1. 接口规范

### Request

```
POST /api/ailab/detect
Content-Type: application/json
```

```json
{
  "text":     "要检测的文本内容...",
  "language": "auto"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| text | string | ✅ | 检测文本，最大 5000 字符 |
| language | string | ❌ | "auto"/"en"/"zh"，默认 "auto" |

### Response（成功）

```json
{
  "overall_score":   87,
  "assessment":      "likely_ai",
  "word_count":      342,
  "sentence_count":  18,
  "sentences": [
    {
      "text":        "Artificial intelligence has emerged...",
      "start_index": 0,
      "end_index":   45,
      "ai_score":    92,
      "label":       "ai_high",
      "explanation": "Highly uniform sentence structure with AI-typical phrasing"
    }
  ]
}
```

| assessment 值 | 含义 | overall_score 范围 |
|------|------|------|
| likely_ai | 极可能是 AI | ≥ 65 |
| mixed | 混合内容 | 35–64 |
| likely_human | 极可能是人工 | < 35 |

### Response（失败）

```json
{ "error": "text is required" }        // 400
{ "error": "text exceeds 5000 chars" } // 400
{ "error": "detection service error" } // 500
```

---

## 2. Go 实现

### 文件：`internal/handler/ailab_detector.go`

```go
package handler

import (
    "context"
    "encoding/json"
    "fmt"
    "net/http"
    "strings"
    "time"
    "unicode/utf8"

    "github.com/gin-gonic/gin"
    "devtoolbox/internal/aiservice"
)

const detectMaxChars = 5000

// DetectAI 处理 AI 内容检测请求
func DetectAI(c *gin.Context) {
    var req struct {
        Text     string `json:"text"     binding:"required"`
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
    if utf8.RuneCountInString(req.Text) > detectMaxChars {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": fmt.Sprintf("text exceeds %d chars", detectMaxChars),
        })
        return
    }
    if req.Language == "" {
        req.Language = "auto"
    }

    // 获取 AI 提供商（任务路由：detector）
    factory  := aiservice.GetFactory()
    provider, err := factory.GetProviderForTask("detector")
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "AI service unavailable"})
        return
    }

    // 构建检测 Prompt
    systemPrompt := buildDetectPrompt(req.Language)
    chatReq := aiservice.ChatRequest{
        SystemPrompt: systemPrompt,
        Messages: []aiservice.Message{
            {Role: "user", Content: "Analyze this text:\n\n" + req.Text},
        },
        MaxTokens:   2000,
        Temperature: 0.1, // 低温度保证结果稳定
    }

    ctx, cancel := context.WithTimeout(c.Request.Context(), 30*time.Second)
    defer cancel()

    resp, err := provider.Chat(ctx, chatReq)
    if err != nil {
        // Fallback 到默认提供商
        fallback, fErr := factory.GetDefaultProvider()
        if fErr != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "detection service error"})
            return
        }
        resp, err = fallback.Chat(ctx, chatReq)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "detection service error"})
            return
        }
    }

    // 解析 AI 返回的 JSON
    result, err := parseDetectResponse(resp.Content, req.Text)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to parse detection result"})
        return
    }

    c.JSON(http.StatusOK, result)
}

// buildDetectPrompt 构建 AI 检测 Prompt
func buildDetectPrompt(language string) string {
    langHint := ""
    if language == "zh" {
        langHint = "The text is in Chinese. "
    }
    return langHint + `You are an expert AI content detector analyzing text for AI-generated patterns.

Analyze the given text sentence by sentence and detect if it was written by AI or human.

Return ONLY valid JSON with this exact structure (no explanation outside JSON):
{
  "overall_score": <integer 0-100, AI probability>,
  "assessment": "<likely_ai|mixed|likely_human>",
  "word_count": <integer>,
  "sentence_count": <integer>,
  "sentences": [
    {
      "text": "<exact sentence text>",
      "start_index": <integer>,
      "end_index": <integer>,
      "ai_score": <integer 0-100>,
      "label": "<ai_high|ai_medium|human>",
      "explanation": "<brief reason in one sentence>"
    }
  ]
}

Label rules:
- ai_high:   ai_score >= 70  (strongly AI-like: uniform structure, no personality)
- ai_medium: ai_score 35-69  (uncertain: some AI patterns but not conclusive)
- human:     ai_score < 35   (human-like: varied structure, natural imperfections)

Assessment rules:
- likely_ai:    overall_score >= 65
- mixed:        overall_score 35-64
- likely_human: overall_score < 35`
}

// DetectResponse 检测结果
type DetectResponse struct {
    OverallScore  int              `json:"overall_score"`
    Assessment    string           `json:"assessment"`
    WordCount     int              `json:"word_count"`
    SentenceCount int              `json:"sentence_count"`
    Sentences     []SentenceResult `json:"sentences"`
}

type SentenceResult struct {
    Text        string `json:"text"`
    StartIndex  int    `json:"start_index"`
    EndIndex    int    `json:"end_index"`
    AIScore     int    `json:"ai_score"`
    Label       string `json:"label"`
    Explanation string `json:"explanation"`
}

// parseDetectResponse 解析 AI 返回的 JSON 字符串
func parseDetectResponse(content string, originalText string) (*DetectResponse, error) {
    // 清理可能的 markdown 代码块包裹
    content = strings.TrimSpace(content)
    content = strings.TrimPrefix(content, "```json")
    content = strings.TrimPrefix(content, "```")
    content = strings.TrimSuffix(content, "```")
    content = strings.TrimSpace(content)

    // 提取 JSON 对象（防止 AI 在 JSON 前后加了文字）
    start := strings.Index(content, "{")
    end   := strings.LastIndex(content, "}")
    if start == -1 || end == -1 || end <= start {
        return nil, fmt.Errorf("no valid JSON found in response")
    }
    content = content[start : end+1]

    var result DetectResponse
    if err := json.Unmarshal([]byte(content), &result); err != nil {
        return nil, fmt.Errorf("JSON unmarshal failed: %w", err)
    }

    // 数据校验和兜底
    if result.OverallScore < 0  { result.OverallScore = 0 }
    if result.OverallScore > 100 { result.OverallScore = 100 }
    if result.Assessment == "" {
        result.Assessment = scoreToAssessment(result.OverallScore)
    }
    if result.WordCount == 0 {
        result.WordCount = countWords(originalText)
    }
    if result.SentenceCount == 0 {
        result.SentenceCount = len(result.Sentences)
    }

    return &result, nil
}

func scoreToAssessment(score int) string {
    if score >= 65 { return "likely_ai" }
    if score >= 35 { return "mixed" }
    return "likely_human"
}

func countWords(text string) int {
    return len(strings.Fields(text))
}
```

---

## 3. 路由注册

```go
// internal/router/router.go（追加）
ailabAPI := r.Group("/api/ailab")
ailabAPI.POST("/detect", handler.DetectAI)
```

---

## 4. config.yaml 任务路由配置

```yaml
# configs/config.yaml
ai:
  default_provider: "deepseek"
  fallback_provider: "openai"
  task_routing:
    detector: "deepseek"   # DeepSeek 逻辑推理能力强，价格低，适合检测任务
```

---

## 5. 单元测试

```go
// internal/handler/ailab_detector_test.go

package handler_test

import (
    "testing"
)

func TestParseDetectResponse(t *testing.T) {
    validJSON := `{
        "overall_score": 87,
        "assessment": "likely_ai",
        "word_count": 100,
        "sentence_count": 5,
        "sentences": [
            {
                "text": "Test sentence.",
                "start_index": 0,
                "end_index": 14,
                "ai_score": 90,
                "label": "ai_high",
                "explanation": "Very uniform structure"
            }
        ]
    }`

    result, err := parseDetectResponse(validJSON, "Test sentence.")
    if err != nil {
        t.Fatalf("unexpected error: %v", err)
    }
    if result.OverallScore != 87 {
        t.Errorf("expected 87, got %d", result.OverallScore)
    }
    if len(result.Sentences) != 1 {
        t.Errorf("expected 1 sentence, got %d", len(result.Sentences))
    }
}

func TestParseDetectResponseWithMarkdown(t *testing.T) {
    // AI 有时会在 JSON 外包裹 markdown 代码块
    wrapped := "```json\n{\"overall_score\":50,\"assessment\":\"mixed\",\"word_count\":10,\"sentence_count\":1,\"sentences\":[]}\n```"
    result, err := parseDetectResponse(wrapped, "test")
    if err != nil {
        t.Fatalf("unexpected error: %v", err)
    }
    if result.Assessment != "mixed" {
        t.Errorf("expected mixed, got %s", result.Assessment)
    }
}

func TestScoreToAssessment(t *testing.T) {
    cases := []struct{ score int; want string }{
        {90, "likely_ai"},
        {65, "likely_ai"},
        {64, "mixed"},
        {35, "mixed"},
        {34, "likely_human"},
        {0,  "likely_human"},
    }
    for _, c := range cases {
        got := scoreToAssessment(c.score)
        if got != c.want {
            t.Errorf("score=%d: want %s, got %s", c.score, c.want, got)
        }
    }
}
```

---

## 6. 验收标准

- [ ] `POST /api/ailab/detect` 接口可正常调用，返回正确 JSON 格式
- [ ] 空文本返回 400 `{"error":"text is empty"}`
- [ ] 超过 5000 字符返回 400
- [ ] AI 典型文本（如维基百科风格段落）`overall_score >= 65`
- [ ] 人工口语文本 `overall_score <= 40`
- [ ] `sentences` 数组与文本句子数量匹配
- [ ] AI 返回带 markdown 代码块包裹时仍能正确解析
- [ ] 所有单元测试通过

