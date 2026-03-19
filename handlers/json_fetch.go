package handlers

import (
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

const (
	fetchMaxBodySize = 1 * 1024 * 1024 // 最大响应体：1MB
	fetchTimeout     = 15              // 超时秒数
)

// 禁止访问的内网地址段（安全限制）
var blockedHosts = []string{
	"localhost", "127.", "10.", "192.168.", "172.16.",
	"172.17.", "172.18.", "172.19.", "172.20.", "172.21.",
	"172.22.", "172.23.", "172.24.", "172.25.", "172.26.",
	"172.27.", "172.28.", "172.29.", "172.30.", "172.31.",
	"0.0.0.0", "::1", "fc00:", "fd00:",
}

// JSONFetch 代理抓取远程 JSON
func JSONFetch(c *gin.Context) {
	rawURL := strings.TrimSpace(c.Query("url"))
	if rawURL == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "url parameter is required"})
		return
	}

	// 验证 URL 格式
	parsedURL, err := url.ParseRequestURI(rawURL)
	if err != nil || (parsedURL.Scheme != "http" && parsedURL.Scheme != "https") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid url format (http/https only)"})
		return
	}

	// 安全检查：禁止内网地址
	host := strings.ToLower(parsedURL.Hostname())
	if isBlockedHost(host) {
		c.JSON(http.StatusForbidden, gin.H{"error": "private/local addresses not allowed"})
		return
	}

	// 执行 HTTP 请求
	client := &http.Client{
		Timeout: fetchTimeout * time.Second,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			if len(via) >= 5 {
				return fmt.Errorf("too many redirects")
			}
			return nil
		},
	}

	req, err := http.NewRequestWithContext(c.Request.Context(), "GET", rawURL, nil)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to create request"})
		return
	}

	// 设置请求头，模拟浏览器请求
	req.Header.Set("User-Agent", "Tool Box Nova/2.0 (+https://toolboxnova.com)")
	req.Header.Set("Accept", "application/json, text/plain, */*")
	req.Header.Set("Accept-Encoding", "gzip")

	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{
			"error": "fetch failed: " + simplifyError(err.Error()),
		})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		c.JSON(http.StatusBadGateway, gin.H{
			"error": fmt.Sprintf("remote server returned %d", resp.StatusCode),
		})
		return
	}

	// 限制响应体大小
	limitedBody := io.LimitReader(resp.Body, fetchMaxBodySize+1)
	body, err := io.ReadAll(limitedBody)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "failed to read response"})
		return
	}
	if int64(len(body)) > fetchMaxBodySize {
		c.JSON(http.StatusRequestEntityTooLarge, gin.H{
			"error": "response too large (max 1MB)",
		})
		return
	}

	// 返回原始内容（让前端处理 JSON 解析）
	contentType := resp.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "application/json"
	}

	c.Header("X-Content-Size", fmt.Sprintf("%d", len(body)))
	c.Header("Access-Control-Allow-Origin", "*") // 允许跨域（此接口是我们自己的）
	c.Data(http.StatusOK, contentType, body)
}

// isBlockedHost 检查是否为禁止访问的内网地址
func isBlockedHost(host string) bool {
	for _, blocked := range blockedHosts {
		if strings.HasPrefix(host, blocked) || host == blocked {
			return true
		}
	}
	// 额外检查：解析 IP 是否为内网
	if ip := net.ParseIP(host); ip != nil {
		if ip.IsLoopback() || ip.IsPrivate() || ip.IsLinkLocalUnicast() {
			return true
		}
	}
	return false
}

func simplifyError(err string) string {
	if strings.Contains(err, "timeout") {
		return "connection timeout"
	}
	if strings.Contains(err, "no such host") {
		return "host not found"
	}
	if strings.Contains(err, "connection refused") {
		return "connection refused"
	}
	return "network error"
}
