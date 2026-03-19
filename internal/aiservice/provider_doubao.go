package aiservice

// 豆包（火山引擎 Ark）与 OpenAI 兼容
type DoubaoProvider struct {
	*OpenAIProvider
}

func NewDoubaoProvider(cfg ProviderConfig) *DoubaoProvider {
	if cfg.BaseURL == "" {
		cfg.BaseURL = "https://ark.cn-beijing.volces.com/api/v3"
	}
	// cfg.Model 必须是火山引擎推理接入点 ID，如 ep-xxxxxxxx-xxxxx
	return &DoubaoProvider{OpenAIProvider: NewOpenAIProvider(cfg)}
}

func (p *DoubaoProvider) GetProviderName() string { return "doubao" }
