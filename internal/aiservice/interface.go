package aiservice

import "context"

// AIProvider 大模型统一接口（策略模式）
type AIProvider interface {
	Chat(ctx context.Context, req ChatRequest) (*ChatResponse, error)
	ChatStream(ctx context.Context, req ChatRequest) (<-chan StreamChunk, error)
	GetProviderName() string
	IsAvailable() bool
}

// ChatRequest 统一请求格式
type ChatRequest struct {
	Messages     []Message `json:"messages"`
	SystemPrompt string    `json:"system_prompt"`
	MaxTokens    int       `json:"max_tokens"`
	Temperature  float64   `json:"temperature"`
}

type Message struct {
	Role    string `json:"role"` // "user" / "assistant" / "system"
	Content string `json:"content"`
}

// ChatResponse 统一响应格式
type ChatResponse struct {
	Content      string     `json:"content"`
	FinishReason string     `json:"finish_reason"`
	Usage        TokenUsage `json:"usage"`
	Provider     string     `json:"provider"`
	Model        string     `json:"model"`
	LatencyMs    int64      `json:"latency_ms"`
}

type StreamChunk struct {
	Content string `json:"content"`
	Done    bool   `json:"done"`
	Error   error  `json:"error,omitempty"`
}

type TokenUsage struct {
	PromptTokens     int `json:"prompt_tokens"`
	CompletionTokens int `json:"completion_tokens"`
	TotalTokens      int `json:"total_tokens"`
}
