package router

import (
	"time"

	"PycMono/github/toolskit/config"
	"PycMono/github/toolskit/handlers"
	"PycMono/github/toolskit/middleware"

	"github.com/gin-gonic/gin"
)

func Setup(r *gin.Engine, cfg *config.Config) {
	// Apply i18n + Ads + GA middleware globally
	r.Use(middleware.I18nMiddleware())
	r.Use(middleware.AdsConfig(cfg))
	r.Use(middleware.GAConfig(cfg))

	// Static files
	r.Static("/static", "./static")

	// SEO files
	r.GET("/robots.txt", handlers.RobotsTxt)
	r.GET("/sitemap.xml", handlers.SitemapXML)
	// Favicon redirect
	r.GET("/favicon.ico", func(c *gin.Context) {
		c.Redirect(302, "/static/img/favicon.svg")
	})

	// Page routes
	r.GET("/", handlers.IndexPage)

	// SMS Receiver routes (S-01)
	r.GET("/sms", handlers.SMSLandingPage)
	r.GET("/sms/buy", handlers.SMSBuyPage)
	r.GET("/sms/prices", handlers.SMSPricesPage)
	r.GET("/sms/active", handlers.SMSActivePage)
	r.GET("/sms/history", handlers.SMSHistoryPage)

	// Privacy Check routes
	privacy := r.Group("/privacy")
	{
		privacy.GET("/check", handlers.PrivacyCheckPage)
	}
        privacyAPI := r.Group("/api/privacy")
        {
                privacyAPI.POST("/check-email", handlers.PrivacyCheckEmail)
                privacyAPI.GET("/password-range/:prefix", handlers.PrivacyPasswordRange)
                privacyAPI.GET("/breaches", handlers.PrivacyBreaches)
                // Proxy breach logos so frontend never directly loads from external sites
                privacyAPI.GET("/logo/:name", handlers.PrivacyBreachLogo)
        }

	r.GET("/virtual-address", handlers.VirtualAddressPage)
	r.GET("/password-generator", handlers.PasswordPage)
	r.GET("/temp-email", handlers.TempEmailPage)
	r.GET("/proxy", handlers.ProxyPage)
	r.GET("/about", handlers.AboutPage)
	r.GET("/privacy-policy", handlers.PrivacyPage)
	r.GET("/terms-of-service", handlers.TermsPage)
	r.GET("/contact", handlers.ContactPage)
	r.GET("/sitemap", handlers.SitemapPage)

	// Developer Tools routes
	r.GET("/tools", handlers.ToolsPage)
	tools := r.Group("/tools")
	{
		// Redirect old JSON tool routes to new /json/* routes
		tools.GET("/json", func(c *gin.Context) { c.Redirect(301, "/json") })
		tools.GET("/json-formatter", func(c *gin.Context) { c.Redirect(301, "/json/pretty") })
		tools.GET("/json-validator", func(c *gin.Context) { c.Redirect(301, "/json/validate") })
		tools.GET("/json-minifier", func(c *gin.Context) { c.Redirect(301, "/json/minify") })
		tools.GET("/json/escape", func(c *gin.Context) { c.Redirect(301, "/json/escape") })
		tools.GET("/json/unescape", func(c *gin.Context) { c.Redirect(301, "/json/unescape") })
		tools.GET("/json/repair", func(c *gin.Context) { c.Redirect(301, "/json/repair") })
		tools.GET("/json/minify", func(c *gin.Context) { c.Redirect(301, "/json/minify") })
		tools.GET("/json/diff", func(c *gin.Context) { c.Redirect(301, "/json/diff") })
		tools.GET("/json/tree", func(c *gin.Context) { c.Redirect(301, "/json/tree") })
		tools.GET("/json/path", func(c *gin.Context) { c.Redirect(301, "/json/path") })
		tools.GET("/json/csv", func(c *gin.Context) { c.Redirect(301, "/json/to-csv") })
		tools.GET("/json/yaml", func(c *gin.Context) { c.Redirect(301, "/json/to-yaml") })
		tools.GET("/json/schema", func(c *gin.Context) { c.Redirect(301, "/json/schema-validate") })
		tools.GET("/json/jwt", func(c *gin.Context) { c.Redirect(301, "/json/jwt") })

		tools.GET("/regex", handlers.RegexToolPage)
		tools.GET("/markdown", handlers.MarkdownToolPage)
		tools.GET("/timestamp", handlers.TimestampToolPage)
		tools.GET("/base-converter", handlers.BaseConverterPage)
		tools.GET("/case-converter", handlers.CaseConverterPage)

		// Media tools
		tools.GET("/media", handlers.MediaToolsPage)
		tools.GET("/media/image-compress", handlers.ImageCompressPage)
		tools.GET("/media/color-converter", handlers.ColorConverterPage)
		tools.GET("/media/unit-converter", handlers.UnitConverterPage)
		tools.GET("/media/qr-generator", handlers.QRGeneratorPage)
	}

	// ── New JSON Toolkit routes (/json/*)  ──────────────────────
	jt := r.Group("/json")
	{
		// Home
		jt.GET("", handlers.JsonToolsHome)
		jt.GET("/", handlers.JsonToolsHome)

		// Validate & Format
		jt.GET("/validate", handlers.JsonToolPage("validate"))
		jt.GET("/repair", handlers.JsonToolPage("repair"))
		jt.GET("/pretty", handlers.JsonToolPage("pretty"))
		jt.GET("/minify", handlers.JsonToolPage("minify"))
		jt.GET("/sort-keys", handlers.JsonToolPage("sort-keys"))
		jt.GET("/escape", handlers.JsonToolPage("escape"))
		jt.GET("/unescape", handlers.JsonToolPage("unescape"))
		jt.GET("/stringify", handlers.JsonToolPage("stringify"))

		// View & Query
		jt.GET("/tree", handlers.JsonToolPage("tree"))
		jt.GET("/table", handlers.JsonToolPage("table"))
		jt.GET("/diff", handlers.JsonToolPage("diff"))
		jt.GET("/path", handlers.JsonToolPage("path"))
		jt.GET("/search", handlers.JsonToolPage("search"))
		jt.GET("/size", handlers.JsonToolPage("size"))
		jt.GET("/flatten", handlers.JsonToolPage("flatten"))

		// Data Converters
		jt.GET("/to-csv", handlers.JsonToolPage("to-csv"))
		jt.GET("/from-csv", handlers.JsonToolPage("from-csv"))
		jt.GET("/to-excel", handlers.JsonToolPage("to-excel"))
		jt.GET("/from-excel", handlers.JsonToolPage("from-excel"))
		jt.GET("/to-yaml", handlers.JsonToolPage("to-yaml"))
		jt.GET("/from-yaml", handlers.JsonToolPage("from-yaml"))
		jt.GET("/to-xml", handlers.JsonToolPage("to-xml"))
		jt.GET("/from-xml", handlers.JsonToolPage("from-xml"))
		jt.GET("/to-sql", handlers.JsonToolPage("to-sql"))
		jt.GET("/from-sql", handlers.JsonToolPage("from-sql"))
		jt.GET("/to-markdown", handlers.JsonToolPage("to-markdown"))

		// Code Generators
		jt.GET("/to-typescript", handlers.JsonToolPage("to-typescript"))
		jt.GET("/to-python", handlers.JsonToolPage("to-python"))
		jt.GET("/to-java", handlers.JsonToolPage("to-java"))
		jt.GET("/to-csharp", handlers.JsonToolPage("to-csharp"))
		jt.GET("/to-go", handlers.JsonToolPage("to-go"))
		jt.GET("/to-kotlin", handlers.JsonToolPage("to-kotlin"))
		jt.GET("/to-swift", handlers.JsonToolPage("to-swift"))
		jt.GET("/to-rust", handlers.JsonToolPage("to-rust"))
		jt.GET("/to-php", handlers.JsonToolPage("to-php"))

		// Schema
		jt.GET("/schema-validate", handlers.JsonToolPage("schema-validate"))
		jt.GET("/schema-generate", handlers.JsonToolPage("schema-generate"))

		// Encoding & Misc
		jt.GET("/base64", handlers.JsonToolPage("base64"))
		jt.GET("/jwt", handlers.JsonToolPage("jwt"))
		jt.GET("/jsonc", handlers.JsonToolPage("jsonc"))
		jt.GET("/token-count", handlers.JsonToolPage("token-count"))

		// Token Count backend API
		jt.POST("/api/token-count", handlers.JsonTokenCountAPI)

		// JSON Datasets
		jt.GET("/datasets", handlers.JSONDatasetsPage)
		jt.GET("/datasets/:slug", handlers.JSONDatasetsPage) // detail page reuses same template

		// JSON Learn Hub
		jt.GET("/learn", handlers.JSONLearnHub)
		jt.GET("/learn/:slug", handlers.JSONLearnArticle)
	}
	// AI Lab routes
	ailab := r.Group("/ailab")
	{
		ailab.GET("/detector", handlers.AIDetectorPage)
		ailab.GET("/humanize", handlers.AIHumanizePage)
	}

	// Image/Multimedia tools
	img := r.Group("/img")
	{
		img.GET("/compress", handlers.ImgCompressPage)
		img.GET("/resize", handlers.ImgResizePage)
		img.GET("/metadata", handlers.ImgMetadataPage)
		// Image Toolbox (I-00 ~ I-04)
		img.GET("/crop", handlers.ImgCropPage)
		img.GET("/convert-to-jpg", handlers.ImgConvertToJpgPage)
		img.GET("/jpg-to-image", handlers.ImgJpgToImagePage)
		img.GET("/photo-editor", handlers.ImgPhotoEditorPage)
		img.GET("/remove-bg", handlers.ImgRemoveBgPage)
		img.GET("/watermark", handlers.ImgWatermarkPage)
		img.GET("/rotate", handlers.ImgRotatePage)
	}

	// Media tools (alias for img)
	media := r.Group("/media")
	{
		media.GET("/image-compress", handlers.ImgCompressPage)
		media.GET("/image-resize", handlers.ImgResizePage)
		media.GET("/image-metadata", handlers.ImgMetadataPage)
		// QR Code Generator
		media.GET("/qr", handlers.QRPage)
		media.POST("/qr/api/eps", handlers.QREpsDownload)
	}

	// ── Color Tools Suite — /color/* ──────────────────────────────
	color := r.Group("/color")
	{
		color.GET("/tools",        handlers.ColorToolsHub)
		color.GET("/picker",       handlers.ColorPickerPage)
		color.GET("/palette",      handlers.ColorPalettePage)
		color.GET("/wheel",        handlers.ColorWheelPage)
		color.GET("/converter",    handlers.ColorConverterV2Page)
		color.GET("/contrast",     handlers.ColorContrastPage)
		color.GET("/gradient",     handlers.ColorGradientPage)
		color.GET("/image-picker", handlers.ColorImagePickerPage)
		color.GET("/blindness",    handlers.ColorBlindnessPage)
		color.GET("/names",        handlers.ColorNamesPage)
		color.GET("/mixer",        handlers.ColorMixerPage)
		color.GET("/tailwind",     handlers.ColorTailwindPage)
	}

	// Developer Tools Suite — /dev/*
	dev := r.Group("/dev")
	{
		dev.GET("/hash",         handlers.DevHashPage)
		dev.GET("/base64",       handlers.DevBase64Page)
		dev.GET("/url-encode",   handlers.DevURLEncodePage)
		dev.GET("/ip",           handlers.DevIPPage)
		dev.GET("/whois",        handlers.DevWhoisPage)
		dev.GET("/word-counter", handlers.DevWordCounterPage)
	}

	// API routes
	api := r.Group("/api")
	{
		api.GET("/search", handlers.SearchAPI)

		// AI Lab API
		ailabAPI := api.Group("/ailab")
		{
			ailabAPI.POST("/detect", handlers.AIDetectAPI)
			ailabAPI.POST("/detect-file", handlers.AIDetectFileAPI)
			ailabAPI.POST("/detect-url", handlers.AIDetectURLAPI)
			ailabAPI.POST("/humanize", handlers.HumanizeStream)
		}

		// SMS API (S-05, S-06, S-07, S-08, S-09)
		sms := api.Group("/sms")
		{
			// S-10: 5SIM API 代理层
			sms.GET("/products", handlers.SMSGetProducts)
			sms.GET("/countries", handlers.SMSGetCountries)
			sms.GET("/operators", handlers.SMSGetOperators)
			sms.GET("/prices", handlers.SMSGetPrices)
			sms.GET("/price-countries", handlers.SMSGetPriceCountries)
			sms.GET("/stats", handlers.SMSGetStats)

			// S-06: 订单管理
			sms.POST("/buy", handlers.SMSBuyNumber)
			sms.GET("/order/:orderId", handlers.SMSGetOrder)
			sms.POST("/order/:orderId/cancel", handlers.SMSCancelOrder)
			sms.POST("/order/:orderId/finish", handlers.SMSFinishOrder)
			sms.POST("/order/:orderId/rebuy", handlers.SMSRebuyNumber)

			// S-07: 活跃订单列表
			sms.GET("/orders/active", handlers.SMSGetActiveOrders)

			// S-08: 历史订单列表（分页+筛选）
			sms.GET("/orders/history", handlers.SMSGetOrderHistory)
		}

		// 价格快捷路径 /api/prices（与 /api/sms/prices 相同）
		api.GET("/prices", handlers.SMSGetPrices)

		// Email API
		email := api.Group("/email")
		{
			email.POST("/create", handlers.EmailCreateAPI)
			email.POST("/custom", handlers.EmailCustomAPI)
			email.GET("/messages/:address", handlers.EmailMessagesAPI)
			email.DELETE("/destroy/:address", handlers.EmailDestroyAPI)
			email.GET("/stats", handlers.EmailStatsAPI)
		}

		// Proxy API
		proxy := api.Group("/proxy")
		{
			proxy.POST("/fetch", handlers.ProxyFetchAPI)
			proxy.GET("/stats", handlers.ProxyStatsAPI)
			proxy.GET("/nodes", handlers.ProxyNodesAPI)
		}

		// Whois proxy (for /dev/whois)
		api.GET("/whois", handlers.WhoisAPI)

		// Tools API
		toolsAPI := api.Group("/tools")
		{
			// JSON URL 代理抓取（每 IP 每分钟最多 30 次）
			toolsAPI.GET("/json/fetch",
				middleware.RateLimit(30, time.Minute),
				handlers.JSONFetch,
			)
		}
	}

}
