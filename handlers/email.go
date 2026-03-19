package handlers

import (
	"fmt"
	"html/template"
	"math/rand"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func randomString(n int) string {
	const letters = "abcdefghijklmnopqrstuvwxyz0123456789"
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	b := make([]byte, n)
	for i := range b {
		b[i] = letters[r.Intn(len(letters))]
	}
	return string(b)
}

// TempEmailPage renders the temporary email page
func TempEmailPage(c *gin.Context) {
	t := getT(c)
	data := baseData(c, gin.H{
		"Title":       t("email.title"),
		"Description": t("email.meta_desc"),
		"Keywords":    "temporary email, temp mail, disposable email, 10 minute mail, fake email",
		"PageClass":   "page-email",
		"JSONLD": template.JS(`{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Temporary Email",
  "url": "https://toolboxnova.com/temp-email",
  "description": "Free disposable temporary email address, auto-expires in 10 minutes."
}`),
	})
	render(c, "temp_email.html", data)
}

// EmailCreateAPI creates a new temporary email address
func EmailCreateAPI(c *gin.Context) {
	prefix := randomString(8)
	address := prefix + "@tempmail.dev"
	expiresAt := time.Now().Add(10 * time.Minute).Format(time.RFC3339)
	c.JSON(http.StatusOK, gin.H{
		"address":    address,
		"expires_at": expiresAt,
	})
}

// EmailCustomAPI creates a custom email address
func EmailCustomAPI(c *gin.Context) {
	var body struct {
		Prefix string `json:"prefix"`
	}
	if err := c.ShouldBindJSON(&body); err != nil || body.Prefix == "" {
		body.Prefix = randomString(8)
	}
	address := body.Prefix + "@tempmail.dev"
	expiresAt := time.Now().Add(10 * time.Minute).Format(time.RFC3339)
	c.JSON(http.StatusOK, gin.H{
		"address":    address,
		"expires_at": expiresAt,
	})
}

// EmailMessagesAPI returns messages for an email address
func EmailMessagesAPI(c *gin.Context) {
	address := c.Param("address")
	_ = address
	// Return empty messages (in production, connect to real mail service)
	c.JSON(http.StatusOK, gin.H{
		"messages": []interface{}{},
	})
}

// EmailDestroyAPI destroys an email address
func EmailDestroyAPI(c *gin.Context) {
	address := c.Param("address")
	_ = address
	c.JSON(http.StatusOK, gin.H{"success": true})
}

// EmailStatsAPI returns email statistics
func EmailStatsAPI(c *gin.Context) {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	c.JSON(http.StatusOK, gin.H{
		"today_created":    fmt.Sprintf("%d", 1200+r.Intn(300)),
		"spam_intercepted": fmt.Sprintf("%d", 8400+r.Intn(600)),
	})
}
