package middleware

import (
	"log"
	"os"
	"time"

	"PycMono/github/toolskit/internal/i18n"

	"github.com/gin-gonic/gin"
)

const (
	// i18nCookieName is the cookie key used to persist language preference
	i18nCookieName = "lang"
	// i18nCookieTTL is 1 year in seconds
	i18nCookieTTL = int(365 * 24 * time.Hour / time.Second)
	// i18nDefaultLang is the fallback language when no preference is detected
	i18nDefaultLang = "en"
	// i18nLocalesDir is the directory containing locale JSON files
	i18nLocalesDir = "i18n"
)

// i18nManager is the global singleton Manager, initialized once at startup.
var i18nManager *i18n.Manager

// i18nDetector is the global language detector, initialized with supported langs.
var i18nDetector *i18n.Detector

// i18nWatcher is the optional hot-reload file watcher (dev mode only).
var i18nWatcher *i18n.Watcher

// initI18n initialises the global Manager, Detector, and (in dev mode) Watcher.
// Panics on startup errors so misconfigured JSON is caught immediately.
func initI18n() {
	m, err := i18n.NewManager(i18n.Config{
		LocalesDir:  i18nLocalesDir,
		DefaultLang: i18nDefaultLang,
		// Fallback chains: more specific → less specific → default
		Fallbacks: map[string][]string{
			"zh-TW":  {"zh", "en"},
			"zh-HK":  {"zh", "en"},
			"ja-JP":  {"ja", "en"},
			"ko-KR":  {"ko", "en"},
			"es-419": {"spa", "en"},
		},
	})
	if err != nil {
		log.Panicf("i18n: failed to initialise: %v", err)
	}
	i18nManager = m
	i18nDetector = i18n.NewDetector(m.SupportedLangs(), i18nDefaultLang)
	log.Printf("✅ i18n loaded languages: %v", m.SupportedLangs())

	// Start hot-reload watcher in development mode only
	if os.Getenv("GIN_MODE") != "release" {
		w, werr := i18n.NewWatcher(m, i18nLocalesDir)
		if werr != nil {
			log.Printf("⚠️  i18n: could not create watcher: %v", werr)
		} else if serr := w.Start(); serr != nil {
			log.Printf("⚠️  i18n: could not start watcher: %v", serr)
			_ = w.Close() // release fsnotify resources on Start failure
		} else {
			i18nWatcher = w
		}
	}
}

// ReloadTranslations clears the translation cache and reloads all language
// files from disk. Safe to call at runtime (e.g. from an admin endpoint).
// It also refreshes the language detector with the updated supported langs list.
func ReloadTranslations() {
	if i18nManager == nil {
		return
	}
	if err := i18nManager.Reload(); err != nil {
		log.Printf("i18n: reload error: %v", err)
		return
	}
	// Refresh detector in case new languages were added
	i18nDetector = i18n.NewDetector(i18nManager.SupportedLangs(), i18nDefaultLang)
	log.Printf("i18n: reloaded successfully, langs: %v", i18nManager.SupportedLangs())
}

// CloseWatcher stops the hot-reload file watcher if it is running.
// Call this on application shutdown (e.g. in a defer in main()).
func CloseWatcher() {
	if i18nWatcher != nil {
		if err := i18nWatcher.Close(); err != nil {
			log.Printf("i18n: watcher close error: %v", err)
		}
		i18nWatcher = nil
	}
}

// I18nMiddleware detects the request language and injects the translation
// function into gin.Context.
//
// Injected context keys (unchanged from previous implementation):
//   - "lang"         string              — detected language code
//   - "T"            func(string)string  — translation function
//   - "translations" map[string]string   — full flat key→value map (for JS injection)
func I18nMiddleware() gin.HandlerFunc {
	// Initialise once at first call (safe: called during router setup, single goroutine)
	initI18n()

	return func(c *gin.Context) {
		// 1. Detect language via URL param > Cookie > Accept-Language > default
		lang := i18nDetector.Detect(c.Request)

		// 2. Persist preference in cookie
		c.SetCookie(i18nCookieName, lang, i18nCookieTTL, "/", "", false, false)

		// 3. Build translator for this request
		tr := i18nManager.Translator(lang)

		// 4. Inject into context — interface identical to old implementation:
		//      c.Set("T", tFunc)  where tFunc is func(string)string
		c.Set("lang", lang)
		c.Set("T", tr.FuncT())           // func(string)string — templates/handlers unchanged
		c.Set("translations", tr.All())  // map[string]string  — JS injection unchanged
		c.Set("translator", tr)          // *i18n.Translator   — new: handlers can use TF/TN directly

		// 5. Set Content-Language response header (I-04 requirement)
		c.Header("Content-Language", lang)

		c.Next()
	}
}

// GetTranslator retrieves the *Translator from gin.Context.
// Use this when you need TF(), TN(), Has() in a handler.
// Falls back to a no-op translator if middleware was not applied.
func GetTranslator(c *gin.Context) *i18n.Translator {
	if v, exists := c.Get("translator"); exists {
		if tr, ok := v.(*i18n.Translator); ok {
			return tr
		}
	}
	// Fallback: return a passthrough translator so callers never nil-deref
	if i18nManager != nil {
		return i18nManager.Translator(i18nDefaultLang)
	}
	return nil
}



