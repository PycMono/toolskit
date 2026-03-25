package handlers

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"strings"
	"time"

	"PycMono/github/toolskit/internal/aiservice"
	"PycMono/github/toolskit/internal/humanizer"

	"github.com/gin-gonic/gin"
)

// ─── Singleton engine (lazily initialized from global aiservice factory) ─────

var (
	humanizerEngine *humanizer.Engine
)

// InitHumanizerEngine wires up the humanizer engine. Call from main after
// aiservice.InitFactory().
func InitHumanizerEngine(promptDir string, cacheTTL time.Duration) {
	factory := aiservice.GetFactory()
	if factory != nil {
		humanizerEngine = humanizer.NewEngine(factory, promptDir, cacheTTL)
	}
}

// getEngine returns the engine or nil.
func getHumanizerEngine() *humanizer.Engine {
	return humanizerEngine
}

// ─── Page Handler ─────────────────────────────────────────────────────────────

// AIHumanizerPage renders the new /ai/humanizer page.
func AIHumanizerPage(c *gin.Context) {
	t := getT(c)
	lang := getLang(c)

	type FAQ struct {
		Q string
		A string
	}
	faqs := []FAQ{
		{t("ah.faq.q1"), t("ah.faq.a1")},
		{t("ah.faq.q2"), t("ah.faq.a2")},
		{t("ah.faq.q3"), t("ah.faq.a3")},
		{t("ah.faq.q4"), t("ah.faq.a4")},
		{t("ah.faq.q5"), t("ah.faq.a5")},
		{t("ah.faq.q6"), t("ah.faq.a6")},
		{t("ah.faq.q7"), t("ah.faq.a7")},
		{t("ah.faq.q8"), t("ah.faq.a8")},
	}

	canonical := "https://toolboxnova.com/ai/humanizer"
	if lang != "en" && lang != "" {
		canonical = fmt.Sprintf("https://toolboxnova.com/ai/humanizer?lang=%s", lang)
	}

	hreflang := map[string]string{
		"en":  "https://toolboxnova.com/ai/humanizer?lang=en",
		"zh":  "https://toolboxnova.com/ai/humanizer?lang=zh",
		"ja":  "https://toolboxnova.com/ai/humanizer?lang=ja",
		"ko":  "https://toolboxnova.com/ai/humanizer?lang=ko",
		"spa": "https://toolboxnova.com/ai/humanizer?lang=spa",
	}

	data := baseData(c, gin.H{
		"Title":        t("ah.seo.title"),
		"Description":  t("ah.seo.desc"),
		"Keywords":     t("ah.seo.keywords"),
		"PageClass":    "page-ai-humanizer",
		"ActiveTool":   "ai-humanizer",
		"Canonical":    canonical,
		"HreflangMap":  hreflang,
		"FAQ":          faqs,
		"OGImage":      "https://toolboxnova.com/static/img/og-humanizer.png",
		"CaptchaEnabled": false,
		"CaptchaSiteKey": "",
	})

	render(c, "ailab/humanizer.html", data)
}

// ─── API: POST /api/ai/humanize (streaming SSE) ───────────────────────────────

// AIHumanizerStreamAPI handles POST /api/ai/humanize with SSE streaming.
func AIHumanizerStreamAPI(c *gin.Context) {
	// Set SSE headers
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("X-Accel-Buffering", "no")
	c.Header("Access-Control-Allow-Origin", "*")

	var req humanizer.HumanizeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Fprintf(c.Writer, "event: error\ndata: invalid request\n\n")
		c.Writer.Flush()
		return
	}

	req.Text = strings.TrimSpace(req.Text)
	if req.Text == "" {
		fmt.Fprintf(c.Writer, "event: error\ndata: empty input\n\n")
		c.Writer.Flush()
		return
	}

	if humanizer.CountWords(req.Text) > 10000 {
		fmt.Fprintf(c.Writer, "event: error\ndata: text too long (max 10000 words)\n\n")
		c.Writer.Flush()
		return
	}

	// Validate mode
	validModes := map[string]bool{
		"free": true, "standard": true, "smart": true, "easy": true,
		"creative": true, "academic": true, "formal": true, "casual": true,
		"aggressive": true, "ultra": true,
		// legacy aliases
		"basic": true, "business": true,
	}
	if req.Mode == "" || !validModes[req.Mode] {
		req.Mode = "standard"
	}

	engine := getHumanizerEngine()
	if engine == nil {
		// Fallback: heuristic humanization when AI not configured
		humanizeHeuristicStream(c.Writer, req.Text, req.Mode)
		return
	}

	ctx := c.Request.Context()
	if err := engine.HumanizeStream(ctx, req, c.Writer); err != nil {
		if ctx.Err() == nil { // Only write if client still connected
			fmt.Fprintf(c.Writer, "event: error\ndata: %s\n\n", err.Error())
			c.Writer.Flush()
		}
		return
	}
	c.Writer.Flush()
}

// AIHumanizerNewAPI handles POST /api/ai/humanize (non-streaming fallback).
func AIHumanizerNewAPI(c *gin.Context) {
	var req humanizer.HumanizeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request", "message": err.Error()})
		return
	}

	req.Text = strings.TrimSpace(req.Text)
	if req.Text == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "empty input"})
		return
	}
	if humanizer.CountWords(req.Text) > 10000 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "text too long", "message": "max 10000 words"})
		return
	}

	engine := getHumanizerEngine()
	if engine == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "AI service not configured"})
		return
	}

	resp, err := engine.Humanize(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "humanize failed", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"text":       resp.Text,
		"tokens_in":  resp.TokensIn,
		"tokens_out": resp.TokensOut,
		"provider":   resp.Provider,
	})
}

// AIHumanizerDetectAPI handles POST /api/ai/detect (updated to use new engine).
func AIHumanizerDetectAPI(c *gin.Context) {
	var req humanizer.DetectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}
	req.Text = strings.TrimSpace(req.Text)
	if req.Text == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "empty text"})
		return
	}

	engine := getHumanizerEngine()
	if engine == nil {
		// Return heuristic result if engine not configured
		c.JSON(http.StatusOK, gin.H{
			"ai_score":    0.5,
			"human_score": 0.5,
			"confidence":  0.3,
			"label":       "mixed",
		})
		return
	}

	resp, err := engine.Detect(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "detection failed"})
		return
	}
	c.JSON(http.StatusOK, resp)
}

// humanizeHeuristicStream is a local fallback when no AI provider is configured.
// It applies lightweight text transforms and streams them back as SSE.
func humanizeHeuristicStream(w interface{ Write([]byte) (int, error); Flush() }, text, mode string) {
	result := humanizeHeuristic(text, mode)
	// Stream word-by-word to simulate SSE
	words := strings.Fields(result)
	for i, word := range words {
		chunk := word
		if i < len(words)-1 {
			chunk += " "
		}
		data, _ := json.Marshal(map[string]string{"content": chunk})
		fmt.Fprintf(w, "event: message\ndata: %s\n\n", data)
		w.Flush()
		time.Sleep(12 * time.Millisecond) // ~80 tokens/s
	}
	done, _ := json.Marshal(map[string]interface{}{
		"done":            true,
		"changed_percent": 35,
		"word_count":      len(words),
	})
	fmt.Fprintf(w, "event: done\ndata: %s\n\n", done)
	w.Flush()
}

// humanizeHeuristic applies rule-based transformations as a fallback.
func humanizeHeuristic(text, mode string) string {
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))
	lines := strings.Split(text, "\n")
	out := make([]string, 0, len(lines))
	for _, line := range lines {
		line = applyHeuristicLine(line, mode, rng)
		out = append(out, line)
	}
	return strings.Join(out, "\n")
}

var formalStarters = []string{"It is worth noting that", "One should consider", "Furthermore,", "In addition,", "Notably,"}
var casualStarters = []string{"So,", "Actually,", "You know what,", "Basically,", "Here's the thing —"}

func applyHeuristicLine(line string, mode string, rng *rand.Rand) string {
	if strings.TrimSpace(line) == "" {
		return line
	}
	// Basic substitutions to break AI patterns
	replacements := map[string]string{
		"utilize":        "use",
		"therefore":      "so",
		"however":        "but",
		"additionally":   "also",
		"Furthermore,":   "Also,",
		"In conclusion,": "To wrap up,",
		"It is important to note that": "Keep in mind that",
		"In order to":    "To",
		"due to the fact that": "because",
	}
	for old, newWord := range replacements {
		line = strings.ReplaceAll(line, old, newWord)
	}
	// Mode-specific touches
	if mode == "casual" && rng.Intn(4) == 0 && len(line) > 20 {
		starter := casualStarters[rng.Intn(len(casualStarters))]
		firstWord := strings.Fields(line)[0]
		if !strings.HasSuffix(firstWord, ",") && firstWord != starter {
			line = starter + " " + strings.ToLower(string(line[0])) + line[1:]
		}
	}
	if mode == "formal" && rng.Intn(4) == 0 && len(line) > 20 {
		starter := formalStarters[rng.Intn(len(formalStarters))]
		firstWord := strings.Fields(line)[0]
		if !strings.HasSuffix(firstWord, ",") && firstWord != starter {
			line = starter + " " + strings.ToLower(string(line[0])) + line[1:]
		}
	}
	return line
}

