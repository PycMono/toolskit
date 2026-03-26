# Gin 中间件

## internal/middleware/i18n.go

```go
package middleware

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"yourproject/internal/i18n"
)

const (
	// ContextKeyTranslator 是注入 gin.Context 的 key
	ContextKeyTranslator = "i18n_translator"
	// CookieName 是语言 Cookie 的名称
	CookieName = "lang"
	// CookieTTL Cookie 有效期（30天）
	CookieTTL = 30 * 24 * int(time.Hour/time.Second)
)

// I18nMiddleware 返回 i18n 检测和注入中间件
func I18nMiddleware(manager *i18n.Manager) gin.HandlerFunc {
	detector := i18n.NewDetector(manager.SupportedLangs(), "en-US")

	return func(c *gin.Context) {
		// 1. 检测语言
		lang := detector.Detect(c.Request)

		// 2. 如果是通过 URL param 切换语言，设置 Cookie 持久化
		if urlLang := c.Query("lang"); urlLang != "" {
			c.SetCookie(CookieName, lang, CookieTTL, "/", "", false, true)
			// 重定向去掉 URL 中的 lang 参数（保持 URL 整洁）
			// 仅 GET 请求做重定向
			if c.Request.Method == http.MethodGet {
				query := c.Request.URL.Query()
				query.Del("lang")
				c.Request.URL.RawQuery = query.Encode()
				// 不强制重定向，继续处理当前请求（也可选 302 重定向）
			}
		}

		// 3. 创建 Translator 并注入 Context
		t := manager.Translator(lang)
		c.Set(ContextKeyTranslator, t)

		// 4. 设置响应头
		c.Header("Content-Language", lang)

		c.Next()
	}
}

// MustTranslator 从 gin.Context 获取 Translator，panic 如果未注入
func MustTranslator(c *gin.Context) *i18n.Translator {
	t, exists := c.Get(ContextKeyTranslator)
	if !exists {
		panic("i18n: translator not found in context, did you use I18nMiddleware?")
	}
	return t.(*i18n.Translator)
}

// GetTranslator 从 gin.Context 安全获取 Translator
func GetTranslator(c *gin.Context) (*i18n.Translator, bool) {
	t, exists := c.Get(ContextKeyTranslator)
	if !exists {
		return nil, false
	}
	tr, ok := t.(*i18n.Translator)
	return tr, ok
}
```

## router/router.go（注册示例）

```go
package router

import (
	"html/template"
	"net/http"

	"github.com/gin-gonic/gin"
	"yourproject/internal/i18n"
	"yourproject/internal/middleware"
	tmpl "yourproject/internal/template"
)

func Setup(manager *i18n.Manager) *gin.Engine {
	r := gin.Default()

	// ── 模板引擎 ──────────────────────────────────────────
	// 注意：FuncMap 需要在 LoadHTMLGlob 之前设置
	r.SetFuncMap(tmpl.BuildFuncMap(nil)) // 传 nil，每次请求会动态注入
	r.LoadHTMLGlob("templates/**/*.html")

	// ── 全局中间件 ────────────────────────────────────────
	r.Use(middleware.I18nMiddleware(manager))

	// ── 路由 ─────────────────────────────────────────────
	r.GET("/", homeHandler)
	r.GET("/login", loginHandler)

	return r
}

func homeHandler(c *gin.Context) {
	t := middleware.MustTranslator(c)

	c.HTML(http.StatusOK, "home/index.html", gin.H{
		"T":     t,           // 将 Translator 传入模板
		"Lang":  t.Lang(),
		"IsRTL": t.IsRTL(),
		"Title": t.T("home.page.title"),
	})
}

func loginHandler(c *gin.Context) {
	t := middleware.MustTranslator(c)
	c.HTML(http.StatusOK, "auth/login.html", gin.H{
		"T":    t,
		"Lang": t.Lang(),
	})
}
```
