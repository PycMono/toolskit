package aiservice

import (
	"fmt"
	"sync"
)

type ProviderFactory struct {
	config    *AIConfig
	providers map[string]AIProvider
	mu        sync.RWMutex
}

var (
	globalFactory *ProviderFactory
	once          sync.Once
)

func InitFactory(cfg *AIConfig) *ProviderFactory {
	once.Do(func() {
		f := &ProviderFactory{
			config:    cfg,
			providers: make(map[string]AIProvider),
		}
		// 注册已启用且有 APIKey 的提供商
		register := func(name string, enabled bool, apiKey string, newFn func() AIProvider) {
			if enabled && apiKey != "" {
				f.providers[name] = newFn()
			}
		}
		register("openai", cfg.OpenAI.Enabled, cfg.OpenAI.APIKey, func() AIProvider { return NewOpenAIProvider(cfg.OpenAI) })
		register("deepseek", cfg.DeepSeek.Enabled, cfg.DeepSeek.APIKey, func() AIProvider { return NewDeepSeekProvider(cfg.DeepSeek) })
		register("gemini", cfg.Gemini.Enabled, cfg.Gemini.APIKey, func() AIProvider { return NewGeminiProvider(cfg.Gemini) })
		register("doubao", cfg.Doubao.Enabled, cfg.Doubao.APIKey, func() AIProvider { return NewDoubaoProvider(cfg.Doubao) })
		globalFactory = f
	})
	return globalFactory
}

func GetFactory() *ProviderFactory { return globalFactory }

func (f *ProviderFactory) GetProvider(name string) (AIProvider, error) {
	f.mu.RLock()
	defer f.mu.RUnlock()
	if p, ok := f.providers[name]; ok {
		return p, nil
	}
	return nil, fmt.Errorf("provider '%s' not found or not enabled", name)
}

// GetProviderForTask 根据任务类型返回最优提供商（支持 fallback）
func (f *ProviderFactory) GetProviderForTask(task string) (AIProvider, error) {
	// 1. 任务级路由
	if name, ok := f.config.TaskRouting[task]; ok {
		if p, err := f.GetProvider(name); err == nil {
			return p, nil
		}
	}
	// 2. 默认提供商
	if f.config.DefaultProvider != "" {
		if p, err := f.GetProvider(f.config.DefaultProvider); err == nil {
			return p, nil
		}
	}
	// 3. Fallback 提供商
	if f.config.FallbackProvider != "" {
		if p, err := f.GetProvider(f.config.FallbackProvider); err == nil {
			return p, nil
		}
	}
	// 4. 任意可用提供商
	for _, p := range f.providers {
		if p.IsAvailable() {
			return p, nil
		}
	}
	return nil, fmt.Errorf("no AI provider available")
}

func (f *ProviderFactory) GetDefaultProvider() (AIProvider, error) {
	return f.GetProviderForTask("__default__")
}
