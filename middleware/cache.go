package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
)

// StaticCacheHeaders sets long-lived Cache-Control headers for versioned static assets
// (CSS, JS, images) and prevents caching of HTML pages.
//
// Versioned static assets use ?v=... query params; Cloudflare must be configured
// to respect query strings. To ensure CF fetches fresh copies, we set a very long
// max-age for /static/* files (since they are cache-busted via ?v=...) and
// no-store for HTML pages.
func StaticCacheHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		path := c.Request.URL.Path

		if strings.HasPrefix(path, "/static/") {
			// Versioned static assets: cache for 1 year in browser and CDN.
			// The ?v= query string makes each new version a distinct URL.
			c.Header("Cache-Control", "public, max-age=31536000, immutable")
			c.Header("Vary", "Accept-Encoding")
		}
		// HTML pages: do NOT add a header here; they are handled per-handler or
		// by the NoCache middleware below.

		c.Next()
	}
}

// NoCacheHTML sets Cache-Control: no-store on HTML responses so CDNs (Cloudflare)
// always fetch fresh HTML from the origin, ensuring ?v=... asset URLs are up-to-date.
func NoCacheHTML() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		ct := c.GetHeader("Content-Type")
		if strings.Contains(ct, "text/html") {
			// Only override if no Cache-Control was already set by the handler.
			if c.GetHeader("Cache-Control") == "" {
				c.Header("Cache-Control", "no-store, no-cache, must-revalidate")
				c.Header("Pragma", "no-cache")
			}
		}
	}
}

