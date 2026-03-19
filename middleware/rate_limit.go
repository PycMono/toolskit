package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type rateLimitEntry struct {
	count   int
	resetAt time.Time
}

type rateLimiter struct {
	mu      sync.Mutex
	entries map[string]*rateLimitEntry
	max     int
	window  time.Duration
}

func newRateLimiter(max int, window time.Duration) *rateLimiter {
	rl := &rateLimiter{
		entries: make(map[string]*rateLimitEntry),
		max:     max,
		window:  window,
	}
	// 定期清理过期条目
	go func() {
		ticker := time.NewTicker(window)
		defer ticker.Stop()
		for range ticker.C {
			rl.mu.Lock()
			now := time.Now()
			for key, e := range rl.entries {
				if now.After(e.resetAt) {
					delete(rl.entries, key)
				}
			}
			rl.mu.Unlock()
		}
	}()
	return rl
}

func (rl *rateLimiter) allow(ip string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	e, ok := rl.entries[ip]
	if !ok || now.After(e.resetAt) {
		rl.entries[ip] = &rateLimitEntry{
			count:   1,
			resetAt: now.Add(rl.window),
		}
		return true
	}

	if e.count >= rl.max {
		return false
	}
	e.count++
	return true
}

// RateLimit 返回一个 Gin 中间件，每个 IP 在 window 时间窗口内最多允许 max 次请求
func RateLimit(max int, window time.Duration) gin.HandlerFunc {
	rl := newRateLimiter(max, window)
	return func(c *gin.Context) {
		ip := c.ClientIP()
		if !rl.allow(ip) {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "too many requests, please try again later",
			})
			c.Abort()
			return
		}
		c.Next()
	}
}
