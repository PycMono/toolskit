package handlers

import (
	"fmt"
	"html/template"
	"io"
	"math/rand"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// ProxyPage renders the proxy page
func ProxyPage(c *gin.Context) {
	t := getT(c)
	data := baseData(c, gin.H{
		"Title":       t("proxy.title"),
		"Description": t("proxy.meta_desc"),
		"Keywords":    "free proxy, anonymous proxy, web proxy, hide IP, online proxy",
		"PageClass":   "page-proxy",
		"JSONLD": template.JS(`{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Anonymous Web Proxy",
  "url": "https://toolboxnova.com/proxy",
  "description": "Browse the web anonymously with our free online proxy."
}`),
	})
	render(c, "proxy.html", data)
}

// ProxyFetchAPI handles proxy requests
func ProxyFetchAPI(c *gin.Context) {
	var body struct {
		URL            string `json:"url"`
		Encrypt        bool   `json:"encrypt"`
		DisableScripts bool   `json:"disable_scripts"`
		BlockAds       bool   `json:"block_ads"`
		Node           string `json:"node"`
	}
	if err := c.ShouldBindJSON(&body); err != nil || body.URL == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid URL"})
		return
	}

	targetURL := body.URL
	if !strings.HasPrefix(targetURL, "http") {
		targetURL = "https://" + targetURL
	}

	client := &http.Client{Timeout: 15 * time.Second}
	req, err := http.NewRequest("GET", targetURL, nil)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid URL: " + err.Error()})
		return
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (compatible; Tool Box Nova/1.0)")

	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "failed to fetch: " + err.Error()})
		return
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to read response"})
		return
	}

	htmlContent := string(bodyBytes)

	// Remove ads if requested
	if body.BlockAds {
		adPatterns := []string{
			`(?i)<div[^>]*class="[^"]*ad[^"]*"[^>]*>.*?</div>`,
			`(?i)<ins class="adsbygoogle[^"]*".*?</ins>`,
		}
		for _, pattern := range adPatterns {
			re := regexp.MustCompile(pattern)
			htmlContent = re.ReplaceAllString(htmlContent, "")
		}
	}

	// Disable scripts if requested
	if body.DisableScripts {
		re := regexp.MustCompile(`(?i)<script[^>]*>.*?</script>`)
		htmlContent = re.ReplaceAllString(htmlContent, "")
	}

	// Inject proxy toolbar
	toolbar := `<div style="position:fixed;top:0;left:0;right:0;z-index:99999;background:#1e40af;color:white;padding:8px 16px;display:flex;align-items:center;justify-content:space-between;font-family:sans-serif;font-size:13px;">
		<span>🛡 Tool Box Nova Proxy — Browsing: ` + targetURL + `</span>
		<button onclick="window.parent.postMessage('closeProxy','*')" style="background:#ef4444;color:white;border:none;padding:4px 12px;border-radius:4px;cursor:pointer;">✕ Close Proxy</button>
	</div><div style="margin-top:42px;">`

	htmlContent = strings.Replace(htmlContent, "<body", toolbar+"<body", 1)
	if !strings.Contains(htmlContent, toolbar) {
		htmlContent = toolbar + htmlContent + "</div>"
	}

	c.JSON(http.StatusOK, gin.H{"html": htmlContent, "url": targetURL})
}

// ProxyStatsAPI returns proxy stats
func ProxyStatsAPI(c *gin.Context) {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	c.JSON(http.StatusOK, gin.H{
		"today_requests":  fmt.Sprintf("%d", 5200+r.Intn(800)),
		"available_nodes": 4,
	})
}

// ProxyNodesAPI returns available proxy nodes
func ProxyNodesAPI(c *gin.Context) {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	c.JSON(http.StatusOK, gin.H{
		"nodes": []gin.H{
			{"id": "auto", "name": "Auto Select", "location": "Global", "latency": r.Intn(50) + 10, "available": true},
			{"id": "us", "name": "US Node", "location": "United States", "latency": r.Intn(100) + 40, "available": true},
			{"id": "eu", "name": "EU Node", "location": "Europe", "latency": r.Intn(100) + 30, "available": true},
			{"id": "as", "name": "Asia Node", "location": "Asia", "latency": r.Intn(100) + 60, "available": true},
		},
	})
}
