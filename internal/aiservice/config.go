package aiservice

import (
	"os"

	"gopkg.in/yaml.v3"
)

type ProviderConfig struct {
	Enabled     bool    `yaml:"enabled"`
	APIKey      string  `yaml:"api_key"`
	BaseURL     string  `yaml:"base_url"`
	Model       string  `yaml:"model"`
	MaxTokens   int     `yaml:"max_tokens"`
	Temperature float64 `yaml:"temperature"`
	Timeout     int     `yaml:"timeout"`
}

type AIConfig struct {
	DefaultProvider  string            `yaml:"default_provider"`
	FallbackProvider string            `yaml:"fallback_provider"`
	TaskRouting      map[string]string `yaml:"task_routing"`
	OpenAI           ProviderConfig    `yaml:"openai"`
	DeepSeek         ProviderConfig    `yaml:"deepseek"`
	Gemini           ProviderConfig    `yaml:"gemini"`
	Doubao           ProviderConfig    `yaml:"doubao"`
	Claude           ProviderConfig    `yaml:"claude"`
}

func LoadAIConfig(configPath string) (*AIConfig, error) {
	data, err := os.ReadFile(configPath)
	if err != nil {
		return nil, err
	}
	var wrapper struct {
		AI AIConfig `yaml:"ai"`
	}
	if err := yaml.Unmarshal(data, &wrapper); err != nil {
		return nil, err
	}
	cfg := &wrapper.AI

	// 环境变量优先级高于配置文件
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
	return cfg, nil
}
