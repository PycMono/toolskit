package aiservice

import "context"

// 豆包（火山引擎 Ark）兼容 OpenAI 格式。
// 文档：https://www.volcengine.com/docs/82379/1302008
// ⚠️  cfg.Model 必须填写推理接入点 ID，格式：ep-xxxxxxxx-xxxxx
type DoubaoProvider struct {
	*OpenAIProvider
}

func NewDoubaoProvider(cfg ProviderConfig) *DoubaoProvider {
	if cfg.BaseURL == "" {
		cfg.BaseURL = "https://ark.cn-beijing.volces.com/api/v3"
	}
	if cfg.Timeout == 0 {
		cfg.Timeout = 60
	}
	return &DoubaoProvider{OpenAIProvider: NewOpenAIProvider(cfg)}
}

func (p *DoubaoProvider) GetProviderName() string { return "doubao" }
func (p *DoubaoProvider) IsAvailable() bool       { return p.cfg.APIKey != "" }

// Chat 调用豆包 /api/v3/chat/completions（非流式）。
func (p *DoubaoProvider) Chat(ctx context.Context, req ChatRequest) (*ChatResponse, error) {
	return p.chatAs(ctx, req, "doubao")
}

// ChatStream 调用豆包 /api/v3/chat/completions（SSE 流式）。
func (p *DoubaoProvider) ChatStream(ctx context.Context, req ChatRequest) (<-chan StreamChunk, error) {
	return p.chatStreamAs(ctx, req)
}
