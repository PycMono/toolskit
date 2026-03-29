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

// InternalServerErrorPage handles 500 errors
func InternalServerErrorPage(c *gin.Context) {
	t := getT(c)
	c.Status(http.StatusInternalServerError)
	data := baseData(c, gin.H{
		"Title":       t("error.500.title") + " | Tool Box Nova",
		"Description": t("error.500.desc"),
		"PageClass":   "page-error",
	})
	render(c, "500.html", data)
}

// RecoveryMiddleware recovers from panics and renders a 500 page
func RecoveryMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				c.Abort()
				InternalServerErrorPage(c)
			}
		}()
		c.Next()
	}
}

// HealthCheck handles /health endpoint
func HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "ok",
		"service": "toolboxnova",
	})
}
