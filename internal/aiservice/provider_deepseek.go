package aiservice

// DeepSeek API 与 OpenAI 完全兼容，直接复用
type DeepSeekProvider struct {
	*OpenAIProvider
}

func NewDeepSeekProvider(cfg ProviderConfig) *DeepSeekProvider {
	if cfg.BaseURL == "" {
		cfg.BaseURL = "https://api.deepseek.com"
	}
	if cfg.Model == "" {
		cfg.Model = "deepseek-chat"
	}
	return &DeepSeekProvider{OpenAIProvider: NewOpenAIProvider(cfg)}
}

func (p *DeepSeekProvider) GetProviderName() string { return "deepseek" }
