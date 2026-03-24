package handlers

import (
	"fmt"

	"github.com/gin-gonic/gin"
)

// WeatherQueryFAQ holds a single FAQ entry
type WeatherQueryFAQ struct {
	Q string
	A string
}

// WeatherQueryPage renders the weather query tool page
func WeatherQueryPage(c *gin.Context) {
	t := getT(c)
	lang := getLang(c)

	faqs := []WeatherQueryFAQ{
		{Q: t("wq.faq.q1"), A: t("wq.faq.a1")},
		{Q: t("wq.faq.q2"), A: t("wq.faq.a2")},
		{Q: t("wq.faq.q3"), A: t("wq.faq.a3")},
		{Q: t("wq.faq.q4"), A: t("wq.faq.a4")},
		{Q: t("wq.faq.q5"), A: t("wq.faq.a5")},
		{Q: t("wq.faq.q6"), A: t("wq.faq.a6")},
		{Q: t("wq.faq.q7"), A: t("wq.faq.a7")},
		{Q: t("wq.faq.q8"), A: t("wq.faq.a8")},
		{Q: t("wq.faq.q9"), A: t("wq.faq.a9")},
		{Q: t("wq.faq.q10"), A: t("wq.faq.a10")},
	}

	canonical := "https://toolboxnova.com/weather/query"
	hreflangZH := "https://toolboxnova.com/weather/query?lang=zh"
	hreflangEN := "https://toolboxnova.com/weather/query?lang=en"
	if lang != "en" && lang != "" {
		canonical = fmt.Sprintf("https://toolboxnova.com/weather/query?lang=%s", lang)
	}

	// JSON-LD structured data
	jsonld := fmt.Sprintf(`{
  "@context":"https://schema.org",
  "@type":"SoftwareApplication",
  "name":"%s",
  "description":"%s",
  "url":"https://toolboxnova.com/weather/query",
  "applicationCategory":"UtilitiesApplication",
  "operatingSystem":"Web",
  "offers":{"@type":"Offer","price":"0","priceCurrency":"USD"},
  "provider":{"@type":"Organization","name":"ToolboxNova","url":"https://toolboxnova.com"}
}`, t("wq.seo.title"), t("wq.seo.description"))

	data := baseData(c, gin.H{
		"Title":       t("wq.seo.title"),
		"Description": t("wq.seo.description"),
		"Keywords":    t("wq.seo.keywords"),
		"OGTitle":     t("wq.seo.og_title"),
		"OGDesc":      t("wq.seo.og_description"),
		"PageClass":   "page-weather-query",
		"ActiveTool":  "weather-query",
		"Canonical":   canonical,
		"HreflangZH":  hreflangZH,
		"HreflangEN":  hreflangEN,
		"JSONLD":      jsonld,
		"FAQs":        faqs,
		"DefaultCity": "Beijing",
	})

	render(c, "weather/query.html", data)
}

