package middleware

import (
	"encoding/json"
	"os"
	"sync"

	"github.com/gin-gonic/gin"
)

var (
	translationsCache = make(map[string]map[string]string)
	mu                sync.RWMutex
)

// loadTranslations loads and caches translations per language.
// Cache is keyed by lang; always re-reads from disk if not cached.
func loadTranslations(lang string) map[string]string {
	mu.RLock()
	if t, ok := translationsCache[lang]; ok {
		mu.RUnlock()
		return t
	}
	mu.RUnlock()

	filePath := "i18n/" + lang + ".json"
	data, err := os.ReadFile(filePath)
	if err != nil {
		data, err = os.ReadFile("i18n/en.json")
		if err != nil {
			return map[string]string{}
		}
		lang = "en"
	}

	var t map[string]string
	if err := json.Unmarshal(data, &t); err != nil {
		// JSON parse error — return empty map so keys fall back to key name
		return map[string]string{}
	}

	mu.Lock()
	translationsCache[lang] = t
	mu.Unlock()
	return t
}

// ReloadTranslations clears the translation cache, forcing a reload from disk.
// Call this after updating i18n JSON files without restarting.
func ReloadTranslations() {
	mu.Lock()
	translationsCache = make(map[string]map[string]string)
	mu.Unlock()
}

// I18nMiddleware reads lang from query param or cookie, injects T func into context.
func I18nMiddleware() gin.HandlerFunc {
	// Pre-load both languages at startup to catch JSON errors early
	loadTranslations("zh")
	loadTranslations("en")
	loadTranslations("ja")
	loadTranslations("ko")
	loadTranslations("spa")

	return func(c *gin.Context) {
		lang := c.Query("lang")
		if lang == "" {
			if cookie, err := c.Cookie("lang"); err == nil {
				lang = cookie
			}
		}
		validLangs := map[string]bool{"zh": true, "en": true, "ja": true, "ko": true, "spa": true}
		if !validLangs[lang] {
			lang = "zh"
		}

		// Persist language preference in cookie (1 year)
		c.SetCookie("lang", lang, 86400*365, "/", "", false, false)

		t := loadTranslations(lang)

		tFunc := func(key string) string {
			if v, ok := t[key]; ok {
				return v
			}
			return key
		}

		c.Set("lang", lang)
		c.Set("T", tFunc)
		c.Set("translations", t)
		c.Next()
	}
}


