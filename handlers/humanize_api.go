package handlers

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
	"unicode/utf8"

	"PycMono/github/toolskit/internal/aiservice"

	"github.com/gin-gonic/gin"
)

const humanizeMaxChars = 5000

var validModes = map[string]bool{
	"standard": true,
	"formal":   true,
	"casual":   true,
	"academic": true,
	"creative": true,
}

// humanizePrompts 各模式的系统 Prompt
var humanizePrompts = map[string]string{
	"standard": `You are a professional text humanizer. Your task is to rewrite the given AI-generated text to sound more natural and authentically human.

Rules:
- Vary sentence lengths (mix short punchy sentences with longer ones)
- Use contractions naturally (it's, don't, I'm, you'll)
- Add subtle natural imperfections typical of human writing
- Include occasional transitional phrases (however, actually, in fact, that said)
- Preserve the original meaning completely
- DO NOT add new information or change facts
- Return ONLY the rewritten text, no explanation, no preamble`,

	"formal": `You are a professional business writer. Rewrite the given AI-generated text in a formal, professional business tone.

Rules:
- Use sophisticated but clear vocabulary
- Maintain a respectful, authoritative voice
- Avoid overly AI-like repetitive structures
- Keep sentences varied but grammatically precise
- Suitable for business emails, reports, and professional documents
- Return ONLY the rewritten text`,

	"casual": `You are writing in a casual, conversational style. Rewrite the given AI-generated text to sound like a real person talking to a friend.

Rules:
- Use contractions freely (it's, don't, gonna, wanna when natural)
- Include natural speech patterns and informal phrasing
- Keep it friendly and approachable
- Use shorter sentences and paragraphs
- Add personality without changing the core meaning
- Return ONLY the rewritten text`,

	"academic": `You are an academic writer. Rewrite the given AI-generated text in a scholarly academic style appropriate for research papers and essays.

Rules:
- Use precise academic vocabulary
- Include complex but clear sentence structures
- Maintain scholarly tone while sounding authentic (not robotic)
- Use appropriate academic transitions (furthermore, consequently, nonetheless)
- Avoid colloquialisms
- Return ONLY the rewritten text`,

	"creative": `You are a creative writer. Rewrite the given AI-generated text with creative flair that showcases authentic human creativity.

Rules:
- Use vivid imagery and varied metaphors
- Employ diverse sentence structures for rhythm
- Add personality and unique voice
- Make it engaging and memorable
- Preserve the core meaning while adding creative expression
- Return ONLY the rewritten text`,
}

// HumanizeStreamLegacy is the original SSE streaming humanize handler (kept for reference)
// HumanizeStream is now declared in ailab.go
func HumanizeStreamLegacy(c *gin.Context) {
	var req struct {
		Text     string `json:"text" binding:"required"`
		Mode     string `json:"mode"`
		Language string `json:"language"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "text is required"})
		return
	}

	req.Text = strings.TrimSpace(req.Text)
	if req.Text == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "text is empty"})
		return
	}

	if utf8.RuneCountInString(req.Text) > humanizeMaxChars {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("text exceeds %d chars", humanizeMaxChars),
		})
		return
	}

	// 默认 mode
	if req.Mode == "" {
		req.Mode = "standard"
	}
	if !validModes[req.Mode] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "unsupported mode"})
		return
	}

	// 获取 AI 提供商
	factory := aiservice.GetFactory()
	if factory == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "AI service not initialized"})
		return
	}

	provider, err := factory.GetProviderForTask("humanize")
	if err != nil {
		// 尝试获取默认提供商
		provider, err = factory.GetDefaultProvider()
		if err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"error": "AI service unavailable"})
			return
		}
	}

	// 语言提示追加
	systemPrompt := humanizePrompts[req.Mode]
	if req.Language == "zh" {
		systemPrompt += "\n\nIMPORTANT: The input text is in Chinese. Rewrite in Chinese."
	} else if req.Language == "en" {
		systemPrompt += "\n\nIMPORTANT: The input text is in English. Rewrite in English."
	}

	chatReq := aiservice.ChatRequest{
		SystemPrompt: systemPrompt,
		Messages: []aiservice.Message{
			{Role: "user", Content: req.Text},
		},
		MaxTokens:   3000,
		Temperature: 0.85, // 略高温度，增加创造性变化
	}

	// 设置 SSE 响应头
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("X-Accel-Buffering", "no") // 关闭 Nginx 缓冲

	ctx, cancel := context.WithTimeout(c.Request.Context(), 60*time.Second)
	defer cancel()

	ch, err := provider.ChatStream(ctx, chatReq)
	if err != nil {
		c.SSEvent("error", gin.H{"message": "humanize service failed to start"})
		return
	}

	// 收集完整输出用于计算统计
	var fullOutput strings.Builder
	flusher, ok := c.Writer.(http.Flusher)
	if !ok {
		c.SSEvent("error", gin.H{"message": "streaming not supported"})
		return
	}

	c.Stream(func(w io.Writer) bool {
		select {
		case chunk, ok := <-ch:
			if !ok {
				return false
			}
			if chunk.Error != nil {
				c.SSEvent("error", gin.H{"message": chunk.Error.Error()})
				flusher.Flush()
				return false
			}
			if chunk.Done {
				// 计算修改百分比
				changedPct := estimateChangedPercent(req.Text, fullOutput.String())
				wordCount := len(strings.Fields(fullOutput.String()))
				c.SSEvent("done", gin.H{
					"done":            true,
					"changed_percent": changedPct,
					"word_count":      wordCount,
				})
				flusher.Flush()
				return false
			}

			fullOutput.WriteString(chunk.Content)
			c.SSEvent("message", gin.H{"content": chunk.Content})
			flusher.Flush()
			return true

		case <-ctx.Done():
			c.SSEvent("error", gin.H{"message": "request timeout"})
			flusher.Flush()
			return false
		}
	})
}

// estimateChangedPercent 估算修改词汇的百分比
func estimateChangedPercent(original, humanized string) int {
	origWords := strings.Fields(strings.ToLower(original))
	newWords := strings.Fields(strings.ToLower(humanized))

	if len(origWords) == 0 {
		return 0
	}

	// 构建原文词集合
	origSet := make(map[string]int)
	for _, w := range origWords {
		origSet[cleanWord(w)]++
	}

	// 计算新词中不在原文的词数
	changed := 0
	for _, w := range newWords {
		key := cleanWord(w)
		if cnt, ok := origSet[key]; ok && cnt > 0 {
			origSet[key]--
		} else {
			changed++
		}
	}

	total := maxInt(len(origWords), len(newWords))
	if total == 0 {
		return 0
	}
	pct := changed * 100 / total
	if pct > 95 {
		pct = 95
	}
	return pct
}

func cleanWord(w string) string {
	w = strings.Trim(w, ".,!?;:\"'()[]{}—-")
	return w
}

func maxInt(a, b int) int {
	if a > b {
		return a
	}
	return b
}
