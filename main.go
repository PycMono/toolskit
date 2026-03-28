package main

import (
	"fmt"
	"log"
	"time"

	"PycMono/github/toolskit/config"
	"PycMono/github/toolskit/handlers"
	"PycMono/github/toolskit/internal/aiservice"
	"PycMono/github/toolskit/internal/router"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()

	// 初始化 AI 服务工厂 —— 直接使用 config.json 中的 AI 配置，无需单独的 configs/config.yaml
	aiCfg := aiservice.NewAIConfigFromApp(aiservice.AppAIConfig{
		DefaultProvider:  cfg.AI.DefaultProvider,
		FallbackProvider: cfg.AI.FallbackProvider,
		TaskRouting:      cfg.AI.TaskRouting,
		Detector:         cfg.AI.Detector,
		Humanize:         cfg.AI.Humanize,
		OpenAI: aiservice.AppProviderConfig{
			Enabled: cfg.AI.OpenAI.Enabled, APIKey: cfg.AI.OpenAI.APIKey,
			BaseURL: cfg.AI.OpenAI.BaseURL, Model: cfg.AI.OpenAI.Model,
			MaxTokens: cfg.AI.OpenAI.MaxTokens, Temperature: cfg.AI.OpenAI.Temperature,
			Timeout: cfg.AI.OpenAI.Timeout,
		},
		DeepSeek: aiservice.AppProviderConfig{
			Enabled: cfg.AI.DeepSeek.Enabled, APIKey: cfg.AI.DeepSeek.APIKey,
			BaseURL: cfg.AI.DeepSeek.BaseURL, Model: cfg.AI.DeepSeek.Model,
			MaxTokens: cfg.AI.DeepSeek.MaxTokens, Temperature: cfg.AI.DeepSeek.Temperature,
			Timeout: cfg.AI.DeepSeek.Timeout,
		},
		Gemini: aiservice.AppProviderConfig{
			Enabled: cfg.AI.Gemini.Enabled, APIKey: cfg.AI.Gemini.APIKey,
			BaseURL: cfg.AI.Gemini.BaseURL, Model: cfg.AI.Gemini.Model,
			MaxTokens: cfg.AI.Gemini.MaxTokens, Temperature: cfg.AI.Gemini.Temperature,
			Timeout: cfg.AI.Gemini.Timeout,
		},
		Doubao: aiservice.AppProviderConfig{
			Enabled: cfg.AI.Doubao.Enabled, APIKey: cfg.AI.Doubao.APIKey,
			BaseURL: cfg.AI.Doubao.BaseURL, Model: cfg.AI.Doubao.Model,
			MaxTokens: cfg.AI.Doubao.MaxTokens, Temperature: cfg.AI.Doubao.Temperature,
			Timeout: cfg.AI.Doubao.Timeout,
		},
		Claude: aiservice.AppProviderConfig{
			Enabled: cfg.AI.Claude.Enabled, APIKey: cfg.AI.Claude.APIKey,
			BaseURL: cfg.AI.Claude.BaseURL, Model: cfg.AI.Claude.Model,
			MaxTokens: cfg.AI.Claude.MaxTokens, Temperature: cfg.AI.Claude.Temperature,
			Timeout: cfg.AI.Claude.Timeout,
		},
	})

	aiservice.InitFactory(aiCfg)
	log.Printf("✅ AI Service Factory initialized with providers: %v", getEnabledProviders(aiCfg))
	// Wire humanizer engine (prompts dir + 60s cache TTL)
	handlers.InitHumanizerEngine("./prompts", 60*time.Second)
	log.Printf("✅ AI Humanizer Engine initialized")
	// Load AI Compete prompts
	handlers.InitCompetePrompts("./prompts")
	log.Printf("✅ AI Compete prompts initialized")

	r := gin.Default()

	// Setup all routes
	router.Setup(r, cfg)

	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("🚀 Tool Box Nova starting on http://localhost%s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func getEnabledProviders(cfg *aiservice.AIConfig) []string {
	var providers []string
	if cfg.OpenAI.Enabled && cfg.OpenAI.APIKey != "" {
		providers = append(providers, "openai")
	}
	if cfg.DeepSeek.Enabled && cfg.DeepSeek.APIKey != "" {
		providers = append(providers, "deepseek")
	}
	if cfg.Gemini.Enabled && cfg.Gemini.APIKey != "" {
		providers = append(providers, "gemini")
	}
	if cfg.Doubao.Enabled && cfg.Doubao.APIKey != "" {
		providers = append(providers, "doubao")
	}
	if cfg.Claude.Enabled && cfg.Claude.APIKey != "" {
		providers = append(providers, "claude")
	}
	return providers
}
