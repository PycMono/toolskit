package main

import (
	"fmt"
	"log"

	"PycMono/github/toolskit/config"
	"PycMono/github/toolskit/internal/aiservice"
	"PycMono/github/toolskit/internal/router"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()

	// 初始化 AI 服务工厂（Block C-01）
	aiCfg, err := aiservice.LoadAIConfig("configs/config.yaml")
	if err != nil {
		log.Printf("⚠️  Failed to load AI config: %v (AI features will be disabled)", err)
	} else {
		aiservice.InitFactory(aiCfg)
		log.Printf("✅ AI Service Factory initialized with providers: %v", getEnabledProviders(aiCfg))
	}

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
	return providers
}
