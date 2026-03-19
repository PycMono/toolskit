package aiservice

import (
	"context"
	"fmt"
)

// GeminiProvider Google Gemini 提供商（占位实现，后续完善）
type GeminiProvider struct {
	cfg ProviderConfig
}

func NewGeminiProvider(cfg ProviderConfig) *GeminiProvider {
	if cfg.Model == "" {
		cfg.Model = "gemini-1.5-flash"
	}
	return &GeminiProvider{cfg: cfg}
}

func (p *GeminiProvider) GetProviderName() string { return "gemini" }
func (p *GeminiProvider) IsAvailable() bool       { return p.cfg.APIKey != "" }

func (p *GeminiProvider) Chat(ctx context.Context, req ChatRequest) (*ChatResponse, error) {
	// TODO: 实现 Gemini API 调用
	return nil, fmt.Errorf("gemini provider not implemented yet")
}

func (p *GeminiProvider) ChatStream(ctx context.Context, req ChatRequest) (<-chan StreamChunk, error) {
	// TODO: 实现 Gemini 流式调用
	return nil, fmt.Errorf("gemini provider not implemented yet")
}
