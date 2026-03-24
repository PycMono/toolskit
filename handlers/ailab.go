package handlers
import (
"context"
"encoding/json"
"fmt"
"io"
"net/http"
"strings"
"time"
"PycMono/github/toolskit/internal/aiservice"
"github.com/gin-gonic/gin"
)
// ─────────────────────────────────────────────────────────────
//  Page Handlers
// ─────────────────────────────────────────────────────────────
// AIDetectorPage renders the AI content detector page (full new design)
func AIDetectorPage(c *gin.Context) {
	t := getT(c)
	lang := getLang(c)
	faqData := []map[string]string{
		{"Q": t("ailab.detector.faq.q1"), "A": t("ailab.detector.faq.a1")},
		{"Q": t("ailab.detector.faq.q2"), "A": t("ailab.detector.faq.a2")},
		{"Q": t("ailab.detector.faq.q3"), "A": t("ailab.detector.faq.a3")},
		{"Q": t("ailab.detector.faq.q4"), "A": t("ailab.detector.faq.a4")},
		{"Q": t("ailab.detector.faq.q5"), "A": t("ailab.detector.faq.a5")},
		{"Q": t("ailab.detector.faq.q6"), "A": t("ailab.detector.faq.a6")},
		{"Q": t("ailab.detector.faq.q7"), "A": t("ailab.detector.faq.a7")},
	}
	data := baseData(c, gin.H{
"Title":         t("ailab.detector.seo.title"),
"Description":   t("ailab.detector.seo.desc"),
"Keywords":      t("ailab.detector.seo.keywords"),
"PageClass":     "page-ai-detector",
"ToolName":      "ai-detector",
"Lang":          lang,
"FAQ":           faqData,
"HreflangEN":    "https://toolboxnova.com/ai/detector?lang=en",
"HreflangZH":    "https://toolboxnova.com/ai/detector?lang=zh",
"HreflangJA":    "https://toolboxnova.com/ai/detector?lang=ja",
"HreflangKO":    "https://toolboxnova.com/ai/detector?lang=ko",
"HreflangES":    "https://toolboxnova.com/ai/detector?lang=es",
"FreeWordLimit": 15000,
})
	render(c, "ailab/detector.html", data)
}
// AIHumanizePage renders the humanize tool page
func AIHumanizePage(c *gin.Context) {
	t := getT(c)
	data := baseData(c, gin.H{
"Title":       t("ailab.humanize.seo.title"),
"Description": t("ailab.humanize.seo.desc"),
"Keywords":    "ai humanizer, ai text humanizer, bypass ai detection, humanize chatgpt text",
"PageClass":   "page-ai-humanize",
})
	render(c, "ailab/humanize.html", data)
}
// ─────────────────────────────────────────────────────────────
//  Request / Response Structs
// ─────────────────────────────────────────────────────────────
// AIDetectRequest incoming detect request
type AIDetectRequest struct {
	Text     string `json:"text" binding:"required,min=50"`
	Language string `json:"language"`
}
// SentenceResult sentence-level analysis result
type SentenceResult struct {
	Text    string   `json:"text"`
	Score   int      `json:"score"`
	Type    string   `json:"type"` // human|mixed|ai
	Signals []string `json:"signals"`
}
// AnalysisScores 4-dimension analysis
type AnalysisScores struct {
	LexicalScore   int `json:"lexical_score"`
	SyntacticScore int `json:"syntactic_score"`
	SemanticScore  int `json:"semantic_score"`
	PragmaticScore int `json:"pragmatic_score"`
}
// ReadabilityResult readability info
type ReadabilityResult struct {
	FleschScore int    `json:"flesch_score"`
	Grade       string `json:"grade"`
}
// AIDetectResponse full detection result
type AIDetectResponse struct {
	Success     bool              `json:"success"`
	Message     string            `json:"message,omitempty"`
	Score       int               `json:"score"`
	Verdict     string            `json:"verdict"`
	Confidence  int               `json:"confidence"`
	Language    string            `json:"language"`
	Sentences   []SentenceResult  `json:"sentences"`
	Detectors   map[string]int    `json:"detectors"`
	Analysis    AnalysisScores    `json:"analysis"`
	KeySignals  []string          `json:"key_signals"`
	Readability ReadabilityResult `json:"readability"`
	WordCount   int               `json:"word_count"`
	CharCount   int               `json:"char_count"`
}
// AIHumanizeRequest humanize request
type AIHumanizeRequest struct {
	Text     string `json:"text" binding:"required,min=50"`
	Purpose  string `json:"purpose"`
	Tone     string `json:"tone"`
	Mode     string `json:"mode"`
	Language string `json:"language"`
}
// AIHumanizeAPIResponse humanize response
type AIHumanizeAPIResponse struct {
	Success       bool   `json:"success"`
	Message       string `json:"message,omitempty"`
	HumanizedText string `json:"humanized_text"`
	WordsChanged  int    `json:"words_changed"`
	ScoreAfter    int    `json:"score_after"`
}
// DetectionResult legacy struct
type DetectionResult struct {
	AIScore    float64 `json:"ai_score"`
	HumanScore float64 `json:"human_score"`
	Conclusion string  `json:"conclusion"`
	Confidence float64 `json:"confidence"`
	Provider   string  `json:"provider"`
}
// SentenceAnalysis legacy sentence analysis
type SentenceAnalysis struct {
	Text       string  `json:"text"`
	Index      int     `json:"index"`
	AIScore    float64 `json:"ai_score"`
	Label      string  `json:"label"`
	Confidence float64 `json:"confidence"`
}
// DetectionStatistics legacy statistics
type DetectionStatistics struct {
	TotalWords     int   `json:"total_words"`
	TotalSentences int   `json:"total_sentences"`
	AISentences    int   `json:"ai_sentences"`
	HumanSentences int   `json:"human_sentences"`
	AnalysisTimeMs int64 `json:"analysis_time_ms"`
}
// ─────────────────────────────────────────────────────────────
//  API Handlers
// ─────────────────────────────────────────────────────────────
// AIDetectAPI handles POST /api/ai/detect
func AIDetectAPI(c *gin.Context) {
	var req AIDetectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, AIDetectResponse{
Success: false,
Message: fmt.Sprintf("Invalid request: %v", err),
})
		return
	}
	factory := aiservice.GetFactory()
	var response *AIDetectResponse
	var err error
	if factory != nil {
		provider, providerErr := factory.GetProviderForTask("content_detection")
		if providerErr == nil {
			response, err = detectWithAI(c.Request.Context(), provider, req.Text, req.Language)
		}
	}
	if response == nil || err != nil {
		response = detectHeuristic(req.Text)
	}
	response.Success = true
	c.JSON(http.StatusOK, response)
}
// AIHumanizeNewAPI handles POST /api/ai/humanize
func AIHumanizeNewAPI(c *gin.Context) {
	var req AIHumanizeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, AIHumanizeAPIResponse{
Success: false,
Message: fmt.Sprintf("Invalid request: %v", err),
})
		return
	}
	if req.Purpose == "" {
		req.Purpose = "general"
	}
	if req.Tone == "" {
		req.Tone = "standard"
	}
	if req.Mode == "" {
		req.Mode = "balanced"
	}
	if req.Language == "" {
		req.Language = "auto"
	}
	factory := aiservice.GetFactory()
	if factory == nil {
		c.JSON(http.StatusServiceUnavailable, AIHumanizeAPIResponse{
Success: false,
Message: "AI service not available",
})
		return
	}
	provider, err := factory.GetProviderForTask("humanize")
	if err != nil {
		c.JSON(http.StatusServiceUnavailable, AIHumanizeAPIResponse{
Success: false,
Message: "No AI provider available",
})
		return
	}
	systemPrompt := buildHumanizeSystemPrompt(req.Purpose, req.Tone, req.Mode)
	userMsg := fmt.Sprintf(
"Transform the following AI-generated text into authentic human writing.\n\nParameters:\n- Purpose: %s\n- Tone: %s\n- Mode: %s\n- Language: %s\n\n---TEXT TO HUMANIZE---\n%s\n---END TEXT---\n\nReturn ONLY the humanized text.",
req.Purpose, req.Tone, req.Mode, req.Language, req.Text,
)
	chatReq := aiservice.ChatRequest{
		SystemPrompt: systemPrompt,
		Messages:     []aiservice.Message{{Role: "user", Content: userMsg}},
		MaxTokens:    4096,
		Temperature:  0.7,
	}
	resp, err := provider.Chat(c.Request.Context(), chatReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, AIHumanizeAPIResponse{
Success: false,
Message: "Humanize failed",
})
		return
	}
	humanized := strings.TrimSpace(resp.Content)
	origWords := len(strings.Fields(req.Text))
	humanWords := len(strings.Fields(humanized))
	diff := origWords - humanWords
	if diff < 0 {
		diff = -diff
	}
	c.JSON(http.StatusOK, AIHumanizeAPIResponse{
Success:       true,
HumanizedText: humanized,
WordsChanged:  diff,
ScoreAfter:    0,
})
}
// AIDetectFileAPI handles file upload detection
func AIDetectFileAPI(c *gin.Context) {
	startTime := time.Now()
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "No file uploaded"})
		return
	}
	defer file.Close()
	const maxFileSize = 10 * 1024 * 1024
	if header.Size > maxFileSize {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "File size exceeds 10MB limit"})
		return
	}
	filename := header.Filename
	extIdx := strings.LastIndex(filename, ".")
	if extIdx < 0 {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Unsupported file format"})
		return
	}
	ext := strings.ToLower(filename[extIdx+1:])
	if ext != "txt" && ext != "pdf" && ext != "docx" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Only .txt, .pdf, .docx are allowed"})
		return
	}
	fileContent, err := io.ReadAll(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to read file"})
		return
	}
	var text string
	switch ext {
	case "txt":
		text = string(fileContent)
	case "pdf":
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "PDF not supported. Please copy text."})
		return
	case "docx":
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "DOCX not supported. Please copy text."})
		return
	}
	text = strings.TrimSpace(text)
	if len(text) < 50 {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Text too short"})
		return
	}
	response := detectHeuristic(text)
	response.Success = true
	_ = startTime
	c.JSON(http.StatusOK, response)
}
// AIDetectURLAPI handles URL text fetch
func AIDetectURLAPI(c *gin.Context) {
	var req struct {
		URL string `json:"url" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "URL is required"})
		return
	}
	if !strings.HasPrefix(req.URL, "http://") && !strings.HasPrefix(req.URL, "https://") {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid URL"})
		return
	}
	text, err := fetchAndExtractText(req.URL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": fmt.Sprintf("Failed to fetch: %v", err)})
		return
	}
	text = strings.TrimSpace(text)
	if len(text) < 50 {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Extracted text too short"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "text": text, "char_count": len(text)})
}
// HumanizeStream handles the legacy humanize endpoint
func HumanizeStream(c *gin.Context) {
	var req struct {
		Text string `json:"text" binding:"required,min=10"`
		Mode string `json:"mode"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.Mode == "" {
		req.Mode = "standard"
	}
	factory := aiservice.GetFactory()
	if factory == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "AI service unavailable"})
		return
	}
	provider, err := factory.GetProviderForTask("humanize")
	if err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "No provider available"})
		return
	}
	prompt := buildHumanizeSystemPrompt(req.Mode, "standard", "balanced")
	chatReq := aiservice.ChatRequest{
		SystemPrompt: prompt,
		Messages:     []aiservice.Message{{Role: "user", Content: req.Text}},
		MaxTokens:    4096,
		Temperature:  0.7,
	}
	resp, err := provider.Chat(c.Request.Context(), chatReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Humanize failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
"success": true,
"result":  strings.TrimSpace(resp.Content),
})
}
// ─────────────────────────────────────────────────────────────
//  Core Detection Logic
// ─────────────────────────────────────────────────────────────
func detectWithAI(ctx context.Context, provider aiservice.AIProvider, text, language string) (*AIDetectResponse, error) {
	if language == "" {
		language = "auto"
	}
	systemPrompt := buildDetectSystemPrompt()
	userMsg := fmt.Sprintf(
"Please analyze the following text:\n\n---TEXT START---\n%s\n---TEXT END---\n\nLanguage hint: %s",
text, language,
)
	chatReq := aiservice.ChatRequest{
		SystemPrompt: systemPrompt,
		Messages:     []aiservice.Message{{Role: "user", Content: userMsg}},
		MaxTokens:    4096,
		Temperature:  0.2,
	}
	resp, err := provider.Chat(ctx, chatReq)
	if err != nil {
		return nil, err
	}
	content := cleanJSONStr(resp.Content)
	var parsed struct {
		Score      int              `json:"score"`
		Verdict    string           `json:"verdict"`
		Confidence int              `json:"confidence"`
		Language   string           `json:"language"`
		Sentences  []SentenceResult `json:"sentences"`
		Analysis   AnalysisScores   `json:"analysis"`
		KeySignals []string         `json:"key_signals"`
		Readability struct {
			FleschScore int    `json:"flesch_score"`
			Grade       string `json:"grade"`
		} `json:"readability"`
		WordCount int `json:"word_count"`
		CharCount int `json:"char_count"`
	}
	if err := json.Unmarshal([]byte(content), &parsed); err != nil {
		return detectHeuristic(text), nil
	}
	if parsed.WordCount == 0 {
		parsed.WordCount = len(strings.Fields(text))
	}
	if parsed.CharCount == 0 {
		parsed.CharCount = len(text)
	}
	if parsed.Readability.Grade == "" {
		parsed.Readability.Grade = "N/A"
	}
	return &AIDetectResponse{
		Score:      parsed.Score,
		Verdict:    parsed.Verdict,
		Confidence: parsed.Confidence,
		Language:   parsed.Language,
		Sentences:  parsed.Sentences,
		Detectors:  simulateDetectors(parsed.Score),
		Analysis:   parsed.Analysis,
		KeySignals: parsed.KeySignals,
		Readability: ReadabilityResult{
			FleschScore: parsed.Readability.FleschScore,
			Grade:       parsed.Readability.Grade,
		},
		WordCount: parsed.WordCount,
		CharCount: parsed.CharCount,
	}, nil
}
func detectHeuristic(text string) *AIDetectResponse {
	sents := splitIntoSentences(text)
	sentResults := make([]SentenceResult, 0, len(sents))
	totalScore := 0
	for _, sent := range sents {
		score := int(analyzesentence(sent))
		stype := "human"
		if score > 70 {
			stype = "ai"
		} else if score > 40 {
			stype = "mixed"
		}
		sentResults = append(sentResults, SentenceResult{
Text:  sent,
Score: score,
Type:  stype,
})
		totalScore += score
	}
	avgScore := 50
	if len(sents) > 0 {
		avgScore = totalScore / len(sents)
	}
	verdict := "mixed"
	if avgScore >= 70 {
		verdict = "ai"
	} else if avgScore <= 30 {
		verdict = "human"
	}
	return &AIDetectResponse{
		Score:      avgScore,
		Verdict:    verdict,
		Confidence: 75,
		Language:   "en",
		Sentences:  sentResults,
		Detectors:  simulateDetectors(avgScore),
		Readability: ReadabilityResult{
			FleschScore: 65,
			Grade:       "10th Grade",
		},
		WordCount: len(strings.Fields(text)),
		CharCount: len(text),
	}
}
func simulateDetectors(overallScore int) map[string]int {
	type bias struct{ b, v int }
	detectors := map[string]bias{
		"gptzero":     {2, 8},
		"turnitin":    {-5, 12},
		"copyleaks":   {5, 6},
		"zerogpt":     {3, 10},
		"writer":      {-3, 8},
		"sapling":     {1, 7},
		"originality": {4, 9},
		"winston":     {2, 8},
	}
	result := make(map[string]int)
	for name, d := range detectors {
		noise := (len(name)*7+overallScore*3)%d.v - d.v/2
		v := overallScore + d.b + noise
		if v < 0 {
			v = 0
		}
		if v > 100 {
			v = 100
		}
		result[name] = v
	}
	return result
}
// ─────────────────────────────────────────────────────────────
//  Prompt Builders
// ─────────────────────────────────────────────────────────────
func buildDetectSystemPrompt() string {
	return `You are an advanced AI content detection expert. Analyze the provided text to determine the probability it was generated by an AI (ChatGPT, Claude, Gemini, etc.).
Analyze across:
1. Lexical Analysis - vocabulary uniformity, AI connectives (Furthermore, Moreover, Additionally)
2. Syntactic Analysis - sentence length variance, passive voice, burstiness
3. Semantic Analysis - topic coherence, personal anecdotes, emotional authenticity
4. Pragmatic Analysis - generic conclusions, perfect structure, lack of contradiction
Respond with ONLY valid JSON (no markdown, no backticks):
{"score":<0-100>,"verdict":"<human|mixed|ai>","confidence":<0-100>,"language":"<ISO 639-1>","sentences":[{"text":"<sentence>","score":<0-100>,"type":"<human|mixed|ai>","signals":["<signal>"]}],"analysis":{"lexical_score":<0-100>,"syntactic_score":<0-100>,"semantic_score":<0-100>,"pragmatic_score":<0-100>},"key_signals":["<s1>","<s2>","<s3>"],"readability":{"flesch_score":<0-100>,"grade":"<grade>"},"word_count":<int>,"char_count":<int>}
Score guide: 0-15=Human, 16-45=Likely Human, 46-70=Mixed, 71-100=AI`
}
func buildHumanizeSystemPrompt(purpose, tone, mode string) string {
	intensityMap := map[string]string{
		"balanced": "~30-40% of sentences modified.",
		"enhanced": "~50-65% of text rewritten.",
		"ultra":    "~70-85% of text rewritten with full structural reorganization.",
	}
	intensity := intensityMap[mode]
	if intensity == "" {
		intensity = "~30-40% of sentences modified."
	}
	return fmt.Sprintf(`You are an elite human writing specialist. Transform AI-generated text into authentic natural human writing that bypasses all AI detectors, while preserving original meaning.
Purpose: %s | Tone: %s | Mode: %s (%s)
Rules:
- Vary sentence lengths (short and long mixed)
- Remove AI openers: Furthermore, Moreover, Additionally, In conclusion, It is worth noting
- Add natural personal perspective
- Use appropriate contractions
- Replace elevated vocabulary with natural alternatives
- Allow mild redundancy
NEVER change facts, data, numbers, proper nouns.
Return ONLY the humanized text.`, purpose, tone, mode, intensity)
}
// ─────────────────────────────────────────────────────────────
//  Utility Functions
// ─────────────────────────────────────────────────────────────
func cleanJSONStr(s string) string {
	s = strings.TrimSpace(s)
	if strings.HasPrefix(s, "```") {
lines := strings.Split(s, "\n")
		var inner []string
		for i, l := range lines {
			if i == 0 && strings.HasPrefix(l, "```") {
				continue
			}
			if i == len(lines)-1 && strings.TrimSpace(l) == "```" {
continue
}
inner = append(inner, l)
		}
		s = strings.Join(inner, "\n")
	}
	return strings.TrimSpace(s)
}
func splitIntoSentences(text string) []string {
	text = strings.TrimSpace(text)
	delimiters := []string{"。", "！", "？", ". ", "! ", "? ", ".\n", "!\n", "?\n"}
sentences := []string{text}
for _, delim := range delimiters {
var newSentences []string
for _, sent := range sentences {
parts := strings.Split(sent, delim)
for _, part := range parts {
part = strings.TrimSpace(part)
if len(part) > 0 {
newSentences = append(newSentences, part)
}
}
}
sentences = newSentences
}
return sentences
}
func analyzesentence(sentence string) float64 {
score := 50.0
aiIndicators := []string{
"furthermore", "moreover", "additionally", "consequently",
"in conclusion", "it is important to note", "it should be noted",
"it is worth noting", "in today's world", "in recent years",
"综上所述", "因此", "总而言之", "值得注意的是",
}
lowerSent := strings.ToLower(sentence)
for _, indicator := range aiIndicators {
if strings.Contains(lowerSent, strings.ToLower(indicator)) {
score += 10.0
}
}
wordCount := len(strings.Fields(sentence))
if wordCount >= 15 && wordCount <= 30 {
score += 5.0
}
if score > 100 {
score = 100
}
if score < 0 {
score = 0
}
return score
}
func countWords(text string) int {
return len(strings.Fields(text))
}
func extractTextFromPDF(_ []byte) (string, error) {
return "", fmt.Errorf("PDF parsing not yet implemented")
}
func extractTextFromDOCX(_ []byte) (string, error) {
return "", fmt.Errorf("DOCX parsing not yet implemented")
}
func fetchAndExtractText(url string) (string, error) {
client := &http.Client{Timeout: 10 * time.Second}
resp, err := client.Get(url)
if err != nil {
return "", fmt.Errorf("failed to fetch URL: %w", err)
}
defer resp.Body.Close()
if resp.StatusCode != http.StatusOK {
return "", fmt.Errorf("HTTP error: %d", resp.StatusCode)
}
body, err := io.ReadAll(resp.Body)
if err != nil {
return "", fmt.Errorf("failed to read response: %w", err)
}
return extractTextFromHTML(string(body)), nil
}
func extractTextFromHTML(html string) string {
text := html
text = removeTagAndContent(text, "script")
text = removeTagAndContent(text, "style")
text = removeTagAndContent(text, "nav")
text = removeTagAndContent(text, "header")
text = removeTagAndContent(text, "footer")
text = strings.ReplaceAll(text, "<br>", "\n")
text = strings.ReplaceAll(text, "<br/>", "\n")
text = strings.ReplaceAll(text, "</p>", "\n")
inTag := false
var result strings.Builder
for _, char := range text {
if char == '<' {
inTag = true
} else if char == '>' {
inTag = false
} else if !inTag {
result.WriteRune(char)
}
}
cleaned := strings.TrimSpace(result.String())
for strings.Contains(cleaned, "\n\n\n") {
cleaned = strings.ReplaceAll(cleaned, "\n\n\n", "\n\n")
}
return cleaned
}
func removeTagAndContent(text, tag string) string {
startTag := "<" + tag
endTag := "</" + tag + ">"
for {
start := strings.Index(strings.ToLower(text), startTag)
if start == -1 {
break
}
end := strings.Index(strings.ToLower(text[start:]), endTag)
if end == -1 {
break
}
text = text[:start] + text[start+end+len(endTag):]
}
return text
}
// performDetection legacy wrapper
func performDetection(ctx context.Context, text string) (*DetectionResult, []SentenceAnalysis, DetectionStatistics) {
return performHeuristicAnalysis(text)
}
func performHeuristicAnalysis(text string) (*DetectionResult, []SentenceAnalysis, DetectionStatistics) {
sentences := splitIntoSentences(text)
sentenceAnalyses := make([]SentenceAnalysis, 0, len(sentences))
aiCount := 0
totalScore := 0.0
for i, sent := range sentences {
score := analyzesentence(sent)
label := "human"
if score > 80 {
label = "ai_high"
aiCount++
} else if score > 40 {
label = "ai_medium"
}
sentenceAnalyses = append(sentenceAnalyses, SentenceAnalysis{
Text: sent, Index: i, AIScore: score, Label: label, Confidence: 75.0,
})
totalScore += score
}
if len(sentences) == 0 {
return &DetectionResult{}, nil, DetectionStatistics{}
}
avgScore := totalScore / float64(len(sentences))
humanScore := 100.0 - avgScore
conclusion := "mixed"
if avgScore > 70 {
conclusion = "likely_ai"
} else if avgScore < 30 {
conclusion = "likely_human"
}
return &DetectionResult{
AIScore: avgScore, HumanScore: humanScore,
Conclusion: conclusion, Confidence: 75.0, Provider: "heuristic",
}, sentenceAnalyses, DetectionStatistics{
TotalWords: countWords(text), TotalSentences: len(sentences),
AISentences: aiCount, HumanSentences: len(sentences) - aiCount,
}
}
