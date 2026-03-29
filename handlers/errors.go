package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// NotFoundPage handles 404 errors
func NotFoundPage(c *gin.Context) {
	t := getT(c)
	c.Status(http.StatusNotFound)
	data := baseData(c, gin.H{
		"Title":       t("error.404.title") + " | Tool Box Nova",
		"Description": t("error.404.desc"),
		"PageClass":   "page-error",
	})
	render(c, "404.html", data)
}

// HealthCheck handles /health endpoint
func HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "ok",
		"service": "toolboxnova",
	})
}
