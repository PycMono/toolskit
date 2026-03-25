package config

import "github.com/jinzhu/configor"

type Config struct {
	// 服务基础
	Port         string `json:"port"          default:"8086"                    env:"PORT"`
	Debug        bool   `json:"debug"         default:"false"                   env:"DEBUG"`
	SiteURL      string `json:"site_url"      default:"https://toolboxnova.com" env:"SITE_URL"`
	AssetVersion string `json:"asset_version" default:"v1"                      env:"ASSET_VERSION"`

	// 通知
	SMSAPIKey   string `json:"sms_api_key"   default:"" env:"SMS_API_KEY"`
	EmailAPIKey string `json:"email_api_key" default:"" env:"EMAIL_API_KEY"`

	// 广告 & Analytics
	GoogleAdsID     string `json:"google_ads_id"     default:"" env:"GOOGLE_ADS_ID"`
	EnableAds       bool   `json:"enable_ads"        default:"true" env:"ENABLE_ADS"`
	GAMeasurementID string `json:"ga_measurement_id" default:"" env:"GA_MEASUREMENT_ID"`
	EnableGA        bool   `json:"enable_ga"         default:"true" env:"ENABLE_GA"`

	// Cookie Consent (GDPR / CCPA)
	ConsentCookieName string `json:"consent_cookie_name" default:"cky_consent"     env:"CONSENT_COOKIE_NAME"`
	Domain            string `json:"domain"              default:"toolboxnova.com" env:"DOMAIN"`

	// AI
	AI AIConfig `json:"ai"`
}

// ProviderConfig 每个 AI 提供商的通用配置
type ProviderConfig struct {
	Enabled     bool    `json:"enabled"     default:"false"`
	APIKey      string  `json:"api_key"     default:""`
	BaseURL     string  `json:"base_url"    default:""`
	Model       string  `json:"model"       default:""`
	MaxTokens   int     `json:"max_tokens"  default:"2000"`
	Temperature float64 `json:"temperature" default:"0.7"`
	Timeout     int     `json:"timeout"     default:"60"`
}

// AIConfig AI 路由 + 各提供商配置
type AIConfig struct {
	DefaultProvider  string            `json:"default_provider"  default:"deepseek"`
	FallbackProvider string            `json:"fallback_provider" default:"openai"`
	TaskRouting      map[string]string `json:"task_routing"` // task -> provider
	Detector         string            `json:"detector"          default:"deepseek"`
	Humanize         string            `json:"humanize"          default:"openai"`

	OpenAI   ProviderConfig `json:"openai"`
	DeepSeek ProviderConfig `json:"deepseek"`
	Gemini   ProviderConfig `json:"gemini"`
	Doubao   ProviderConfig `json:"doubao"`
	Claude   ProviderConfig `json:"claude"`
}

var cfg Config

func Load() *Config {
	if err := configor.Load(&cfg, "config.json"); err != nil {
		panic(err)
	}
	return &cfg
}
