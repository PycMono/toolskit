package aiservice

import (
	"os"
)

type ProviderConfig struct {
	Enabled     bool    `json:"enabled"`
	APIKey      string  `json:"api_key"`
	BaseURL     string  `json:"base_url"`
	Model       string  `json:"model"`
	MaxTokens   int     `json:"max_tokens"`
	Temperature float64 `json:"temperature"`
	Timeout     int     `json:"timeout"`
}

type AIConfig struct {
	DefaultProvider  string            `json:"default_provider"`
	FallbackProvider string            `json:"fallback_provider"`
	TaskRouting      map[string]string `json:"task_routing"`
	Detector         string            `json:"detector"`
	Humanize         string            `json:"humanize"`
	OpenAI           ProviderConfig    `json:"openai"`
	DeepSeek         ProviderConfig    `json:"deepseek"`
	Gemini           ProviderConfig    `json:"gemini"`
	Doubao           ProviderConfig    `json:"doubao"`
	Claude           ProviderConfig    `json:"claude"`
}

// applyEnvOverrides applies environment variable overrides to the config.
func applyEnvOverrides(cfg *AIConfig) {
	envOverrides := map[string]*string{
		"OPENAI_API_KEY":   &cfg.OpenAI.APIKey,
		"DEEPSEEK_API_KEY": &cfg.DeepSeek.APIKey,
		"GEMINI_API_KEY":   &cfg.Gemini.APIKey,
		"DOUBAO_API_KEY":   &cfg.Doubao.APIKey,
		"CLAUDE_API_KEY":   &cfg.Claude.APIKey,
	}
	for env, ptr := range envOverrides {
		if v := os.Getenv(env); v != "" {
			*ptr = v
		}
	}
}

// AppAIConfig mirrors config.AIConfig to avoid circular imports.
// Call NewAIConfigFromFields instead of importing config package directly.
type AppProviderConfig struct {
	Enabled     bool
	APIKey      string
	BaseURL     string
	Model       string
	MaxTokens   int
	Temperature float64
	Timeout     int
}

type AppAIConfig struct {
	DefaultProvider  string
	FallbackProvider string
	TaskRouting      map[string]string
	Detector         string
	Humanize         string
	OpenAI           AppProviderConfig
	DeepSeek         AppProviderConfig
	Gemini           AppProviderConfig
	Doubao           AppProviderConfig
	Claude           AppProviderConfig
}

func toProviderConfig(p AppProviderConfig) ProviderConfig {
	return ProviderConfig{
		Enabled:     p.Enabled,
		APIKey:      p.APIKey,
		BaseURL:     p.BaseURL,
		Model:       p.Model,
		MaxTokens:   p.MaxTokens,
		Temperature: p.Temperature,
		Timeout:     p.Timeout,
	}
}

// NewAIConfigFromApp creates an AIConfig from the app-level config fields.
// This removes the dependency on configs/config.yaml entirely.
func NewAIConfigFromApp(app AppAIConfig) *AIConfig {
	cfg := &AIConfig{
		DefaultProvider:  app.DefaultProvider,
		FallbackProvider: app.FallbackProvider,
		TaskRouting:      app.TaskRouting,
		Detector:         app.Detector,
		Humanize:         app.Humanize,
		OpenAI:           toProviderConfig(app.OpenAI),
		DeepSeek:         toProviderConfig(app.DeepSeek),
		Gemini:           toProviderConfig(app.Gemini),
		Doubao:           toProviderConfig(app.Doubao),
		Claude:           toProviderConfig(app.Claude),
	}
	// 环境变量优先级高于配置文件
	applyEnvOverrides(cfg)
	return cfg
}

