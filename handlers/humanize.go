package handlers

import (
	"github.com/gin-gonic/gin"
)

// AIHumanizePage renders the AI humanize page
func AIHumanizePage(c *gin.Context) {
	t := getT(c)
	data := baseData(c, gin.H{
		"Title":       t("ailab.humanize.seo.title"),
		"Description": t("ailab.humanize.seo.desc"),
		"Keywords":    "ai humanizer, humanize ai text, bypass ai detector, chatgpt humanizer, convert ai to human text",
		"PageClass":   "page-ai-humanize",
	})
	render(c, "ailab/humanize.html", data)
}
