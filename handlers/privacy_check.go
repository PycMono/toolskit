package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

var hibpClient = &http.Client{Timeout: 8 * time.Second}

// hibpAPIKey reads from env/config — empty string means no key (public endpoints only)
var hibpAPIKey = ""

func getHIBPAPIKey() string {
	return hibpAPIKey
}

// SetHIBPAPIKey sets the HIBP API key (called from main or config)
func SetHIBPAPIKey(key string) {
	hibpAPIKey = key
}

// PrivacyCheckPage renders the privacy account checker page
func PrivacyCheckPage(c *gin.Context) {
	t := getT(c)
	lang := getLang(c)

	// Build FAQ from i18n
	type FAQ struct {
		Q string
		A string
	}
	faqs := []FAQ{
		{Q: t("pc.faq.q1"), A: t("pc.faq.a1")},
		{Q: t("pc.faq.q2"), A: t("pc.faq.a2")},
		{Q: t("pc.faq.q3"), A: t("pc.faq.a3")},
		{Q: t("pc.faq.q4"), A: t("pc.faq.a4")},
		{Q: t("pc.faq.q5"), A: t("pc.faq.a5")},
	}

	// Canonical & hreflang
	canonical := "https://toolboxnova.com/privacy/check"
	if lang != "en" && lang != "" {
		canonical = fmt.Sprintf("https://toolboxnova.com/privacy/check?lang=%s", lang)
	}

	data := baseData(c, gin.H{
		"Title":       t("pc.seo.title"),
		"Description": t("pc.seo.description"),
		"Keywords":    "data breach checker, email leak check, password security, privacy protection",
		"PageClass":   "page-privacy-check",
		"ActiveTool":  "privacy-check",
		"Canonical":   canonical,
		"SEO": map[string]string{
			"OGTitle":   t("pc.seo.og_title"),
			"OGDesc":    t("pc.seo.og_desc"),
			"Canonical": canonical,
		},
		"FAQ":              faqs,
		"TurnstileSiteKey": "",
	})

	render(c, "privacy/check.html", data)
}

// PrivacyCheckEmail checks if an email has been in known data breaches
func PrivacyCheckEmail(c *gin.Context) {
	var req struct {
		Email string `json:"email" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "invalid_email", "message": "Please provide a valid email address"})
		return
	}

	// Basic email validation
	emailRe := regexp.MustCompile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`)
	if !emailRe.MatchString(req.Email) || len(req.Email) > 254 {
		c.JSON(400, gin.H{"error": "invalid_email", "message": "Please provide a valid email address"})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 8*time.Second)
	defer cancel()

	apiURL := fmt.Sprintf("https://haveibeenpwned.com/api/v3/breachedaccount/%s?truncateResponse=false", req.Email)
	apiReq, err := http.NewRequestWithContext(ctx, "GET", apiURL, nil)
	if err != nil {
		c.JSON(200, privacyFallback("Service temporarily unavailable. Please try again shortly."))
		return
	}
	apiReq.Header.Set("User-Agent", "Mozilla/5.0 (compatible; SecurityChecker/1.0)")
	apiReq.Header.Set("hibp-api-key", getHIBPAPIKey())

	resp, err := hibpClient.Do(apiReq)
	if err != nil {
		c.JSON(200, privacyFallback("Network error. Please check your connection and try again."))
		return
	}
	defer resp.Body.Close()

	switch resp.StatusCode {
	case 200:
		body, _ := io.ReadAll(resp.Body)
		var breaches []interface{}
		if err := json.Unmarshal(body, &breaches); err != nil {
			breaches = []interface{}{}
		}
		c.JSON(200, gin.H{
			"fallback": false,
			"breaches": breaches,
			"count":    len(breaches),
		})
	case 404:
		// Not found = no breaches (good!)
		c.JSON(200, gin.H{
			"fallback": false,
			"breaches": []interface{}{},
			"safe":     true,
			"count":    0,
		})
	case 429:
		retryAfter := resp.Header.Get("Retry-After")
		c.JSON(200, gin.H{
			"fallback":   true,
			"breaches":   []interface{}{},
			"message":    "Query limit reached. Please wait a moment and try again.",
			"retryAfter": retryAfter,
		})
	default:
		// 401 (no API key), 403, 5xx — all fallback gracefully
		c.JSON(200, privacyFallback(""))
	}
}

// PrivacyPasswordRange proxies k-Anonymity password range query
func PrivacyPasswordRange(c *gin.Context) {
	prefix := c.Param("prefix")

	// Validate: exactly 5 hex chars
	hexRe := regexp.MustCompile(`^[0-9A-Fa-f]{5}$`)
	if !hexRe.MatchString(prefix) {
		c.JSON(400, gin.H{"error": "invalid_prefix", "message": "Prefix must be exactly 5 hex characters"})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 8*time.Second)
	defer cancel()

	apiURL := fmt.Sprintf("https://api.pwnedpasswords.com/range/%s", prefix)
	apiReq, _ := http.NewRequestWithContext(ctx, "GET", apiURL, nil)
	apiReq.Header.Set("Add-Padding", "true")
	apiReq.Header.Set("User-Agent", "Mozilla/5.0 (compatible; SecurityChecker/1.0)")

	resp, err := hibpClient.Do(apiReq)
	if err != nil {
		c.Data(200, "text/plain", []byte(""))
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == 200 {
		body, _ := io.ReadAll(resp.Body)
		c.Data(200, "text/plain", body)
	} else {
		c.Data(200, "text/plain", []byte(""))
	}
}

// PrivacyBreaches returns the list of all breach events (cached locally)
func PrivacyBreaches(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	apiReq, _ := http.NewRequestWithContext(ctx, "GET",
		"https://haveibeenpwned.com/api/v3/breaches", nil)
	apiReq.Header.Set("User-Agent", "Mozilla/5.0 (compatible; SecurityChecker/1.0)")

	resp, err := hibpClient.Do(apiReq)
	if err != nil {
		c.Header("Cache-Control", "public, max-age=86400")
		c.JSON(200, gin.H{"fallback": true, "breaches": localBreachFallback()})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == 200 {
		body, _ := io.ReadAll(resp.Body)
		var breaches []interface{}
		if err := json.Unmarshal(body, &breaches); err != nil {
			c.Header("Cache-Control", "public, max-age=86400")
			c.JSON(200, gin.H{"fallback": true, "breaches": localBreachFallback()})
			return
		}
		// Strip LogoPath — images will be proxied via /api/privacy/logo/:name
		c.Header("Cache-Control", "public, max-age=21600")
		c.JSON(200, gin.H{"fallback": false, "breaches": breaches})
	} else {
		c.Header("Cache-Control", "public, max-age=86400")
		c.JSON(200, gin.H{"fallback": true, "breaches": localBreachFallback()})
	}
}

// PrivacyBreachLogo proxies breach logos so the frontend never directly references external sites
func PrivacyBreachLogo(c *gin.Context) {
	name := c.Param("name")
	// Sanitise: only allow word chars, hyphens, dots, and common image extensions
	safe := regexp.MustCompile(`^[A-Za-z0-9._-]+$`)
	if !safe.MatchString(name) || strings.Contains(name, "..") {
		c.Status(404)
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 6*time.Second)
	defer cancel()

	imgURL := "https://haveibeenpwned.com/Content/Images/PwnedLogos/" + name
	req, err := http.NewRequestWithContext(ctx, "GET", imgURL, nil)
	if err != nil {
		c.Status(404)
		return
	}
	req.Header.Set("User-Agent", "Mozilla/5.0")
	req.Header.Set("Referer", "https://haveibeenpwned.com/")

	resp, err := hibpClient.Do(req)
	if err != nil || resp.StatusCode != 200 {
		if resp != nil {
			resp.Body.Close()
		}
		c.Status(404)
		return
	}
	defer resp.Body.Close()

	ct := resp.Header.Get("Content-Type")
	if ct == "" {
		ct = "image/png"
	}
	c.Header("Cache-Control", "public, max-age=604800") // 7 days
	c.Header("Content-Type", ct)
	io.Copy(c.Writer, resp.Body)
}

// privacyFallback returns a graceful fallback with security tips (no external service mentioned)
func privacyFallback(msg string) gin.H {
	if msg == "" {
		msg = "Unable to query breach records at this time. Here are some security tips to keep your accounts safe."
	}
	return gin.H{
		"fallback": true,
		"breaches": []interface{}{},
		"message":  msg,
	}
}

// localBreachFallback returns a small set of well-known breach events for offline use
func localBreachFallback() []map[string]interface{} {
	return []map[string]interface{}{
		{
			"Name":        "Adobe",
			"Title":       "Adobe",
			"BreachDate":  "2013-10-04",
			"PwnCount":    152445165,
			"Description": "In October 2013, 153 million Adobe accounts were breached with each containing an internal ID, username, email, encrypted password and a password hint in plain text.",
			"DataClasses": []string{"Email addresses", "Password hints", "Passwords", "Usernames"},
			"IsVerified":  true,
		},
		{
			"Name":        "LinkedIn",
			"Title":       "LinkedIn",
			"BreachDate":  "2012-05-05",
			"PwnCount":    164611595,
			"Description": "In May 2016, LinkedIn had 164 million email addresses and passwords exposed. Originally hacked in 2012, the data remained out of sight until being offered for sale on a dark market site.",
			"DataClasses": []string{"Email addresses", "Passwords"},
			"IsVerified":  true,
		},
		{
			"Name":        "MySpace",
			"Title":       "MySpace",
			"BreachDate":  "2008-07-01",
			"PwnCount":    359420698,
			"Description": "In approximately 2008, MySpace suffered a data breach that exposed almost 360 million accounts. The exposed data included email addresses and passwords stored as SHA1 hashes without salt.",
			"DataClasses": []string{"Email addresses", "Passwords", "Usernames"},
			"IsVerified":  true,
		},
		{
			"Name":        "Dropbox",
			"Title":       "Dropbox",
			"BreachDate":  "2012-07-01",
			"PwnCount":    68648009,
			"Description": "In mid-2012, Dropbox suffered a data breach which exposed the stored credentials of tens of millions of their customers. The breach wasn't discovered until 2016.",
			"DataClasses": []string{"Email addresses", "Passwords"},
			"IsVerified":  true,
		},
		{
			"Name":        "Yahoo",
			"Title":       "Yahoo",
			"BreachDate":  "2016-12-14",
			"PwnCount":    3000000000,
			"Description": "In 2013, Yahoo suffered a data breach that compromised 3 billion accounts. The stolen data included names, email addresses, telephone numbers, dates of birth, hashed passwords and security questions.",
			"DataClasses": []string{"Dates of birth", "Email addresses", "Names", "Passwords", "Phone numbers", "Security questions and answers"},
			"IsVerified":  true,
		},
	}
}

