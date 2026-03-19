package aiservice

import (
	"testing"
)

func TestFactoryInit(t *testing.T) {
	cfg := &AIConfig{
		DefaultProvider:  "openai",
		FallbackProvider: "deepseek",
		TaskRouting: map[string]string{
			"detector": "deepseek",
			"humanize": "openai",
		},
		OpenAI: ProviderConfig{
			Enabled: true,
			APIKey:  "test-key",
			Model:   "gpt-4o-mini",
		},
		DeepSeek: ProviderConfig{
			Enabled: true,
			APIKey:  "test-key",
			Model:   "deepseek-chat",
		},
	}

	factory := InitFactory(cfg)
	if factory == nil {
		t.Fatal("Factory should not be nil")
	}

	// Test GetProvider
	provider, err := factory.GetProvider("openai")
	if err != nil {
		t.Errorf("GetProvider('openai') failed: %v", err)
	}
	if provider.GetProviderName() != "openai" {
		t.Errorf("Expected provider name 'openai', got '%s'", provider.GetProviderName())
	}

	// Test GetProviderForTask
	detectorProvider, err := factory.GetProviderForTask("detector")
	if err != nil {
		t.Errorf("GetProviderForTask('detector') failed: %v", err)
	}
	if detectorProvider.GetProviderName() != "deepseek" {
		t.Errorf("Expected 'deepseek' for detector task, got '%s'", detectorProvider.GetProviderName())
	}

	humanizeProvider, err := factory.GetProviderForTask("humanize")
	if err != nil {
		t.Errorf("GetProviderForTask('humanize') failed: %v", err)
	}
	if humanizeProvider.GetProviderName() != "openai" {
		t.Errorf("Expected 'openai' for humanize task, got '%s'", humanizeProvider.GetProviderName())
	}

	t.Log("✅ All factory tests passed")
}

func TestProviderAvailability(t *testing.T) {
	cfg := ProviderConfig{
		Enabled: true,
		APIKey:  "test-key",
	}

	provider := NewOpenAIProvider(cfg)
	if !provider.IsAvailable() {
		t.Error("Provider with API key should be available")
	}

	providerNoKey := NewOpenAIProvider(ProviderConfig{Enabled: true, APIKey: ""})
	if providerNoKey.IsAvailable() {
		t.Error("Provider without API key should not be available")
	}

	t.Log("✅ Availability tests passed")
}
