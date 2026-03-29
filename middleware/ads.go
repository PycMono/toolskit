package middleware

import (
	"PycMono/github/toolskit/config"

	"github.com/gin-gonic/gin"
)

// AdsConfig injects Google Ads configuration into the Gin context from Config.
// All page handlers must read AdsClientID / AdsEnabled from context, never from Config directly.
func AdsConfig(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Set("AdsClientID", cfg.GoogleAdsID)
		c.Set("AdsEnabled", cfg.EnableAds)
		// AssetVersion is used for cache busting static files (?v=xxx)
		v := cfg.AssetVersion
		if v == "" {
			v = "v1"
		}
		c.Set("AssetVersion", v)
		// Social Media Links
		c.Set("TwitterURL", cfg.TwitterURL)
		c.Set("GitHubURL", cfg.GitHubURL)
		c.Set("LinkedInURL", cfg.LinkedInURL)
		// Newsletter
		c.Set("NewsletterEnabled", cfg.NewsletterEnabled)
		c.Set("NewsletterProvider", cfg.NewsletterProvider)
		c.Next()
	}
}
