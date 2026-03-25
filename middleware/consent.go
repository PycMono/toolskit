package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
)

// ConsentConfig holds cookie-consent middleware configuration.
type ConsentConfig struct {
	CookieName   string // default: "cky_consent"
	CookieMaxAge int    // default: 365 days in seconds
	Domain       string // e.g. "toolboxnova.com"
}

// ConsentMiddleware reads the user's consent cookie and injects
// ConsentHasDecision / ConsentAnalytics / ConsentAds into the Gin context
// so templates can set Consent Mode v2 defaults server-side.
func ConsentMiddleware(cfg ConsentConfig) gin.HandlerFunc {
	if cfg.CookieName == "" {
		cfg.CookieName = "cky_consent"
	}
	if cfg.CookieMaxAge == 0 {
		cfg.CookieMaxAge = 365 * 24 * 3600
	}
	return func(c *gin.Context) {
		consentVal, err := c.Cookie(cfg.CookieName)

		analytics := "denied"
		ads := "denied"
		hasConsent := false

		if err == nil && consentVal != "" {
			hasConsent = true
			analytics = parseConsentField(consentVal, "analytics")
			ads = parseConsentField(consentVal, "ads")
		}

		c.Set("ConsentHasDecision", hasConsent)
		c.Set("ConsentAnalytics", analytics)
		c.Set("ConsentAds", ads)
		c.Set("ConsentCookieName", cfg.CookieName)

		c.Next()
	}
}

// parseConsentField extracts the value for a given key from the consent cookie.
// Cookie format: "necessary:granted,analytics:granted,ads:denied"
func parseConsentField(val, field string) string {
	prefix := field + ":"
	for _, part := range strings.Split(val, ",") {
		part = strings.TrimSpace(part)
		if strings.HasPrefix(part, prefix) {
			v := part[len(prefix):]
			if v == "granted" || v == "denied" {
				return v
			}
		}
	}
	return "denied"
}

