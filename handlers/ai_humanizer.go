package handlers

import (
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
		"Title":          t("ah.seo.title"),
		"Description":    t("ah.seo.desc"),
		"Keywords":       t("ah.seo.keywords"),
		"PageClass":      "page-ai-humanizer",
		"ActiveTool":     "ai-humanizer",
		"Canonical":      canonical,
		"HreflangMap":    hreflang,
		"FAQ":            faqs,
		"OGImage":        "https://toolboxnova.com/static/img/og-humanizer.png",
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

// AIHumanizerNewAPI handles POST /api/ai/humanize-json (non-streaming fallback).
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

	// Validate mode
	validModes := map[string]bool{
		"free": true, "standard": true, "smart": true, "easy": true,
		"creative": true, "academic": true, "formal": true, "casual": true,
		"aggressive": true, "ultra": true,
		"basic": true, "business": true,
	}
	if req.Mode == "" || !validModes[req.Mode] {
		req.Mode = "standard"
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
		// Fallback with heuristic detection
		result := transformDetectResponseHeuristic(req.Text)
		c.JSON(http.StatusOK, result)
		return
	}

	resp, err := engine.Detect(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "detection failed"})
		return
	}

	result := transformDetectResponse(req.Text, resp)
	c.JSON(http.StatusOK, result)
}

// transformDetectResponse converts full engine output to frontend-expected format.
func transformDetectResponse(text string, resp *humanizer.DetectResponse) gin.H {
	score := int(resp.AIScore * 100)
	confidencePct := int(resp.Confidence * 100)

	// Use real highlighted sentences from LLM if available
	var sentences []map[string]interface{}
	if len(resp.HighlightedSentences) > 0 {
		sentences = make([]map[string]interface{}, 0, len(resp.HighlightedSentences))
		for _, s := range resp.HighlightedSentences {
			sentenceType := "human"
			if s.AIProbability > 0.7 {
				sentenceType = "ai"
			} else if s.AIProbability > 0.4 {
				sentenceType = "mixed"
			}
			sentences = append(sentences, map[string]interface{}{
				"text":       s.Sentence,
				"score":      int(s.AIProbability * 100),
				"type":       sentenceType,
				"reason":     s.Reason,
			})
		}
	} else {
		// Fallback to heuristic sentence analysis
		sentences = generateSentenceAnalysis(text, resp.AIScore)
	}

	// Use real model signature as detector scores
	detectors := buildDetectorScores(resp)

	// Build forensic evidence for frontend
	var evidence []map[string]interface{}
	if len(resp.ForensicEvidence) > 0 {
		evidence = make([]map[string]interface{}, 0, len(resp.ForensicEvidence))
		for _, e := range resp.ForensicEvidence {
			evidence = append(evidence, map[string]interface{}{
				"dimension":      e.Dimension,
				"type":           e.Type,
				"detail":         e.Detail,
				"original_quote": e.OriginalQuote,
				"severity":       e.Severity,
			})
		}
	}

	// Build linguistic metrics for frontend
	metrics := map[string]interface{}{
		"sentence_length_sd":        resp.LinguisticMetrics.SentenceLengthSD,
		"paragraph_cv":              resp.LinguisticMetrics.ParagraphCV,
		"ttr_score":                 resp.LinguisticMetrics.TTRScore,
		"burstiness_score":          resp.LinguisticMetrics.BurstinessScore,
		"lexical_diversity":         resp.LinguisticMetrics.LexicalDiversity,
		"perplexity":                resp.LinguisticMetrics.Perplexity,
		"syntactic_predictability":  resp.LinguisticMetrics.SyntacticPredictability,
		"rhetorical_diversity":      resp.LinguisticMetrics.RhetoricalDiversity,
		"personal_anchor_count":     resp.LinguisticMetrics.PersonalAnchorCount,
	}

	// Model signature
	signature := map[string]interface{}{
		"gpt_match_score":            resp.ModelSignature.GPTMatchScore,
		"claude_match_score":         resp.ModelSignature.ClaudeMatchScore,
		"deepseek_gemini_match_score": resp.ModelSignature.DeepSeekGeminiScore,
		"dominant_signature":         resp.ModelSignature.DominantSignature,
	}

	// Word count
	wordCount := strings.Count(text, " ") + 1
	if strings.TrimSpace(text) == "" {
		wordCount = 0
	}

	return gin.H{
		"score":                score,
		"verdict":              resp.Label,
		"confidence":           confidencePct,
		"sentences":            sentences,
		"detectors":            detectors,
		"word_count":           wordCount,
		"language":             "en",
		"readability":          gin.H{"grade": "Standard"},
		"forensic_evidence":    evidence,
		"linguistic_metrics":   metrics,
		"model_signature":      signature,
		"verdict_summary":      resp.VerdictSummary,
		"confidence_reasoning": resp.ConfidenceReasoning,
		"detection_result": map[string]interface{}{
			"detected_genre":             resp.DetectionResult.DetectedGenre,
			"detected_model_signature":   resp.DetectionResult.DetectedModel,
			"anti_evasion_detected":      resp.DetectionResult.AntiEvasionDetected,
			"calibration_notes":          resp.DetectionResult.CalibrationNotes,
		},
	}
}

// buildDetectorScores converts model signature to detector-style scores.
func buildDetectorScores(resp *humanizer.DetectResponse) map[string]int {
	result := make(map[string]int)

	// Map model signature scores to detector names
	if resp.ModelSignature.GPTMatchScore > 0 {
		result["gptzero"] = int(resp.ModelSignature.GPTMatchScore * 100)
		result["turnitin"] = int(resp.ModelSignature.GPTMatchScore * 95)
	}
	if resp.ModelSignature.ClaudeMatchScore > 0 {
		result["copyleaks"] = int(resp.ModelSignature.ClaudeMatchScore * 100)
		result["originality"] = int(resp.ModelSignature.ClaudeMatchScore * 95)
	}
	if resp.ModelSignature.DeepSeekGeminiScore > 0 {
		result["zerogpt"] = int(resp.ModelSignature.DeepSeekGeminiScore * 100)
		result["writer"] = int(resp.ModelSignature.DeepSeekGeminiScore * 90)
	}

	// Fill in remaining detectors from main AI score if not set from signature
	mainScore := int(resp.AIScore * 100)
	defaultDetectors := []string{"gptzero", "turnitin", "copyleaks", "zerogpt", "writer", "sapling", "originality", "winston"}
	for _, det := range defaultDetectors {
		if _, exists := result[det]; !exists {
			result[det] = mainScore
		}
	}

	// Clamp all scores
	for k, v := range result {
		if v < 0 {
			result[k] = 0
		}
		if v > 100 {
			result[k] = 100
		}
	}

	return result
}

// transformDetectResponseHeuristic provides a fallback when AI engine is not available.
func transformDetectResponseHeuristic(text string) gin.H {
	aiScore := 0.5
	confidence := 0.3
	label := "mixed"
	score := int(aiScore * 100)

	sentences := generateSentenceAnalysis(text, aiScore)
	detectors := generateDetectorScores(score)

	wordCount := strings.Count(text, " ") + 1
	if strings.TrimSpace(text) == "" {
		wordCount = 0
	}

	return gin.H{
		"score":       score,
		"verdict":     label,
		"confidence":  int(confidence * 100),
		"sentences":   sentences,
		"detectors":   detectors,
		"word_count":  wordCount,
		"language":    "en",
		"readability": gin.H{"grade": "Standard"},
	}
}

// generateSentenceAnalysis splits text into sentences with AI scores.
func generateSentenceAnalysis(text string, aiScore float64) []map[string]interface{} {
	// Split into sentences (simple split on punctuation followed by space or end)
	sentences := splitSentences(text)
	if len(sentences) == 0 {
		return nil
	}

	rng := rand.New(rand.NewSource(time.Now().UnixNano()))
	result := make([]map[string]interface{}, 0, len(sentences))

	for _, s := range sentences {
		s = strings.TrimSpace(s)
		if s == "" {
			continue
		}
		// Add variance around the main score
		variance := (rng.Float64() - 0.5) * 0.3 // ±15%
		sentenceScore := aiScore + variance
		if sentenceScore < 0 {
			sentenceScore = 0
		}
		if sentenceScore > 1 {
			sentenceScore = 1
		}

		sentenceType := "human"
		if sentenceScore > 0.7 {
			sentenceType = "ai"
		} else if sentenceScore > 0.4 {
			sentenceType = "mixed"
		}

		result = append(result, map[string]interface{}{
			"text":  s,
			"score": int(sentenceScore * 100),
			"type":  sentenceType,
		})
	}
	return result
}

// splitSentences splits text into sentences.
func splitSentences(text string) []string {
	// Replace sentence-ending punctuation with marker + punctuation
	replaced := strings.ReplaceAll(text, ". ", ".\x00")
	replaced = strings.ReplaceAll(replaced, "! ", "!\x00")
	replaced = strings.ReplaceAll(replaced, "? ", "?\x00")
	replaced = strings.ReplaceAll(replaced, ".\n", ".\x00")
	replaced = strings.ReplaceAll(replaced, "!\n", "!\x00")
	replaced = strings.ReplaceAll(replaced, "?\n", "?\x00")

	sentences := strings.Split(replaced, "\x00")
	// Trim and filter empty
	result := make([]string, 0, len(sentences))
	for _, s := range sentences {
		s = strings.TrimSpace(s)
		if s != "" {
			result = append(result, s)
		}
	}
	return result
}

// generateDetectorScores produces simulated per-detector scores.
func generateDetectorScores(mainScore int) map[string]int {
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))
	detectors := []string{"gptzero", "turnitin", "copyleaks", "zerogpt", "writer", "sapling", "originality", "winston"}
	result := make(map[string]int)

	// Different detectors have different biases
	biases := map[string]float64{
		"gptzero":    1.0,  // Most accurate
		"turnitin":   0.95,
		"copyleaks":  0.9,
		"zerogpt":    1.1,  // Tends to over-detect
		"writer":     0.85,
		"sapling":    0.88,
		"originality": 1.05,
		"winston":    0.92,
	}

	for _, det := range detectors {
		bias := biases[det]
		variance := (rng.Float64() - 0.5) * 20 // ±10 points
		score := int(float64(mainScore)*bias + variance)
		if score < 0 {
			score = 0
		}
		if score > 100 {
			score = 100
		}
		result[det] = score
	}
	return result
}

// humanizeHeuristicStream is a local fallback when no AI provider is configured.
// It applies lightweight text transforms and streams them back as SSE.
// SSE format matches engine.HumanizeStream: "data: <token>\n\n" per token, "data: [DONE]\n\n" at end.
func humanizeHeuristicStream(w interface {
	Write([]byte) (int, error)
	Flush()
}, text, mode string) {
	result := humanizeHeuristic(text, mode)
	// Stream word-by-word to simulate SSE
	words := strings.Fields(result)
	for i, word := range words {
		chunk := word
		if i < len(words)-1 {
			chunk += " "
		}
		// Escape newlines in the chunk to match engine format
		chunk = strings.ReplaceAll(chunk, "\n", "\\n")
		fmt.Fprintf(w, "data: %s\n\n", chunk)
		w.Flush()
		time.Sleep(12 * time.Millisecond) // ~80 tokens/s
	}
	fmt.Fprintf(w, "data: [DONE]\n\n")
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
		"utilize":                      "use",
		"therefore":                    "so",
		"however":                      "but",
		"additionally":                 "also",
		"Furthermore,":                 "Also,",
		"In conclusion,":               "To wrap up,",
		"It is important to note that": "Keep in mind that",
		"In order to":                  "To",
		"due to the fact that":         "because",
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
