package aiservice

import "context"

// DeepSeek API 与 OpenAI 完全兼容，使用相同的请求/响应格式。
// 文档：https://api-docs.deepseek.com/
type DeepSeekProvider struct {
	*OpenAIProvider
}

func NewDeepSeekProvider(cfg ProviderConfig) *DeepSeekProvider {
	if cfg.BaseURL == "" {
		cfg.BaseURL = "https://api.deepseek.com/v1"
	}
	if cfg.Model == "" {
		cfg.Model = "deepseek-chat"
	}
	if cfg.Timeout == 0 {
		cfg.Timeout = 60
	}
	return &DeepSeekProvider{OpenAIProvider: NewOpenAIProvider(cfg)}
}

func (p *DeepSeekProvider) GetProviderName() string { return "deepseek" }
func (p *DeepSeekProvider) IsAvailable() bool       { return p.cfg.APIKey != "" }

// Chat 调用 DeepSeek /v1/chat/completions（非流式）。
func (p *DeepSeekProvider) Chat(ctx context.Context, req ChatRequest) (*ChatResponse, error) {
	return p.chatAs(ctx, req, "deepseek")
}

// ChatStream 调用 DeepSeek /v1/chat/completions（SSE 流式）。
func (p *DeepSeekProvider) ChatStream(ctx context.Context, req ChatRequest) (<-chan StreamChunk, error) {
	return p.chatStreamAs(ctx, req)
}
