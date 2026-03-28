// Package humanizer implements the AI text humanization engine using
// strategy + factory pattern. It wraps the existing aiservice layer.
package humanizer

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"PycMono/github/toolskit/internal/aiservice"
)

// ─── Request / Response Types ───────────────────────────────────────────────

// HumanizeRequest is the inbound request for humanization.
type HumanizeRequest struct {
	Text             string `json:"text"`
	Mode             string `json:"mode"`              // basic|standard|aggressive|academic|creative|business
	Tone             string `json:"tone"`              // neutral|formal|casual
	OutputLang       string `json:"output_lang"`       // en|zh|ja|ko|es …
	PreserveFormat   bool   `json:"preserve_format"`
	PreserveCitations bool  `json:"preserve_citations"`
}

// HumanizeResponse is the non-streaming response.
type HumanizeResponse struct {
	Text      string `json:"text"`
	TokensIn  int    `json:"tokens_in"`
	TokensOut int    `json:"tokens_out"`
	Provider  string `json:"provider"`
}

// DetectRequest is the inbound request for AI detection.
type DetectRequest struct {
	Text string `json:"text"`
}

// DetectResponse is the AI detection result.
type DetectResponse struct {
	AIScore    float64 `json:"ai_score"`
	HumanScore float64 `json:"human_score"`
	Confidence float64 `json:"confidence"`
	Label      string  `json:"label"` // "ai" | "human" | "mixed"
}

// ─── Prompt Loader ───────────────────────────────────────────────────────────

type prompt struct {
	mode     string
	system   string
	userTpl  string
	loadedAt time.Time
}

func (p *prompt) buildUser(req HumanizeRequest) string {
	r := p.userTpl
	r = strings.ReplaceAll(r, "{{.Text}}", req.Text)
	r = strings.ReplaceAll(r, "{{.Tone}}", req.Tone)
	lang := req.OutputLang
	if lang == "" {
		lang = "en"
	}
	r = strings.ReplaceAll(r, "{{.OutputLang}}", lang)
	note := ""
	if req.PreserveFormat {
		note = "Preserve all original formatting including paragraphs, bullet points, and headings."
	}
	r = strings.ReplaceAll(r, "{{.PreserveFormatNote}}", note)
	return r
}

type promptLoader struct {
	mu        sync.RWMutex
	promptDir string
	cache     map[string]*prompt
	ttl       time.Duration
}

func newPromptLoader(promptDir string, ttl time.Duration) *promptLoader {
	return &promptLoader{
		promptDir: promptDir,
		cache:     make(map[string]*prompt),
		ttl:       ttl,
	}
}

func (l *promptLoader) load(mode string) (*prompt, error) {
	// Resolve mode alias to canonical prompt-file mode
	mode = resolveMode(mode)

	l.mu.RLock()
	c, ok := l.cache[mode]
	l.mu.RUnlock()
	if ok && l.ttl > 0 && time.Since(c.loadedAt) < l.ttl {
		return c, nil
	}

	// Support both "humanize-<mode>.md" and "detect-ai.md" for detect
	var filename string
	if mode == "detect" {
		filename = "detect-ai.md"
	} else {
		filename = fmt.Sprintf("humanize-%s.md", mode)
	}
	path := filepath.Join(l.promptDir, filename)
	content, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("prompt file '%s' not found: %w", path, err)
	}

	p, err := parsePromptMD(mode, string(content))
	if err != nil {
		return nil, err
	}

	l.mu.Lock()
	l.cache[mode] = p
	l.mu.Unlock()
	return p, nil
}

func parsePromptMD(mode, content string) (*prompt, error) {
	parts := strings.SplitN(content, "\n# USER\n", 2)
	if len(parts) != 2 {
		return nil, fmt.Errorf("prompt for mode '%s' missing '# USER' section", mode)
	}
	system := strings.TrimSpace(strings.TrimPrefix(strings.TrimSpace(parts[0]), "# SYSTEM"))
	userTpl := strings.TrimSpace(parts[1])
	return &prompt{
		mode:     mode,
		system:   system,
		userTpl:  userTpl,
		loadedAt: time.Now(),
	}, nil
}

// ─── Strategy (mode → provider selection) ───────────────────────────────────

// modeAliases maps frontend-only modes to prompt-file modes.
var modeAliases = map[string]string{
	"free":   "standard",
	"smart":  "standard",
	"easy":   "basic",
	"formal": "business",
	"casual": "standard",
	"ultra":  "aggressive",
}

// resolveMode returns the canonical mode for prompt loading and temperature lookup.
func resolveMode(mode string) string {
	if alias, ok := modeAliases[mode]; ok {
		return alias
	}
	return mode
}

// modeToTemperature maps humanization mode to LLM temperature.
func modeToTemperature(mode string) float64 {
	switch mode {
	case "basic", "easy":
		return 0.5
	case "standard", "free", "smart", "casual":
		return 0.7
	case "aggressive", "ultra":
		return 0.9
	case "academic":
		return 0.6
	case "creative":
		return 1.0
	case "business", "formal":
		return 0.5
	default:
		return 0.7
	}
}

// modePreference returns ordered provider names for a given mode.
func modePreference(mode string) []string {
	switch mode {
	case "aggressive", "academic":
		return []string{"claude", "openai", "gemini", "deepseek", "doubao"}
	case "creative":
		return []string{"openai", "gemini", "claude", "deepseek", "doubao"}
	default: // basic, standard, business
		return []string{"deepseek", "doubao", "openai", "gemini", "claude"}
	}
}

// ─── Engine ─────────────────────────────────────────────────────────────────

// Engine is the main humanizer engine combining strategy + factory.
type Engine struct {
	factory *aiservice.ProviderFactory
	loader  *promptLoader
}

// NewEngine creates a new humanizer Engine.
func NewEngine(factory *aiservice.ProviderFactory, promptDir string, cacheTTL time.Duration) *Engine {
	return &Engine{
		factory: factory,
		loader:  newPromptLoader(promptDir, cacheTTL),
	}
}

// selectProvider picks the best available provider for the given mode.
func (e *Engine) selectProvider(mode string) (aiservice.AIProvider, error) {
	for _, name := range modePreference(mode) {
		if p, err := e.factory.GetProvider(name); err == nil && p.IsAvailable() {
			return p, nil
		}
	}
	return e.factory.GetDefaultProvider()
}

// Humanize performs non-streaming humanization.
func (e *Engine) Humanize(ctx context.Context, req HumanizeRequest) (*HumanizeResponse, error) {
	if req.Mode == "" {
		req.Mode = "standard"
	}
	if req.Tone == "" {
		req.Tone = "neutral"
	}

	p, err := e.loader.load(req.Mode)
	if err != nil {
		return nil, err
	}

	provider, err := e.selectProvider(req.Mode)
	if err != nil {
		return nil, fmt.Errorf("no provider available: %w", err)
	}

	chatReq := aiservice.ChatRequest{
		SystemPrompt: p.system,
		Messages: []aiservice.Message{
			{Role: "user", Content: p.buildUser(req)},
		},
		Temperature: modeToTemperature(req.Mode),
		MaxTokens:   8192,
	}

	resp, err := provider.Chat(ctx, chatReq)
	if err != nil {
		return nil, err
	}

	return &HumanizeResponse{
		Text:      resp.Content,
		TokensIn:  resp.Usage.PromptTokens,
		TokensOut: resp.Usage.CompletionTokens,
		Provider:  resp.Provider,
	}, nil
}

// HumanizeStream performs streaming humanization, writing SSE events to w.
// Each token is written as: "data: <token>\n\n"
// On completion: "data: [DONE]\n\n"
func (e *Engine) HumanizeStream(ctx context.Context, req HumanizeRequest, w io.Writer) error {
	if req.Mode == "" {
		req.Mode = "standard"
	}
	if req.Tone == "" {
		req.Tone = "neutral"
	}

	p, err := e.loader.load(req.Mode)
	if err != nil {
		return err
	}

	provider, err := e.selectProvider(req.Mode)
	if err != nil {
		return fmt.Errorf("no provider available: %w", err)
	}

	chatReq := aiservice.ChatRequest{
		SystemPrompt: p.system,
		Messages: []aiservice.Message{
			{Role: "user", Content: p.buildUser(req)},
		},
		Temperature: modeToTemperature(req.Mode),
		MaxTokens:   8192,
	}

	ch, err := provider.ChatStream(ctx, chatReq)
	if err != nil {
		return err
	}

	flusher, canFlush := w.(interface{ Flush() })

	for chunk := range ch {
		if chunk.Error != nil {
			return chunk.Error
		}
		if chunk.Done {
			_, err = fmt.Fprintf(w, "data: [DONE]\n\n")
			if canFlush {
				flusher.Flush()
			}
			return err
		}
		if chunk.Content != "" {
			// SSE-encode: escape newlines within a token
			token := strings.ReplaceAll(chunk.Content, "\n", "\\n")
			_, err = fmt.Fprintf(w, "data: %s\n\n", token)
			if err != nil {
				return err
			}
			if canFlush {
				flusher.Flush()
			}
		}
	}
	return nil
}

// Detect runs AI content detection on the given text.
func (e *Engine) Detect(ctx context.Context, req DetectRequest) (*DetectResponse, error) {
	p, err := e.loader.load("detect")
	if err != nil {
		// Fallback: use heuristic scoring if prompt file is missing
		return heuristicDetect(req.Text), nil
	}

	provider, err := e.selectProvider("standard")
	if err != nil {
		return heuristicDetect(req.Text), nil
	}

	userPrompt := strings.ReplaceAll(p.userTpl, "{{.Text}}", req.Text)

	chatReq := aiservice.ChatRequest{
		SystemPrompt: p.system,
		Messages: []aiservice.Message{
			{Role: "user", Content: userPrompt},
		},
		Temperature: 0.1,
		MaxTokens:   256,
	}

	resp, err := provider.Chat(ctx, chatReq)
	if err != nil {
		return heuristicDetect(req.Text), nil
	}

	// Parse JSON response
	var result DetectResponse
	content := strings.TrimSpace(resp.Content)
	// Strip markdown code fences if present
	if strings.HasPrefix(content, "```") {
		lines := strings.Split(content, "\n")
		if len(lines) > 2 {
			content = strings.Join(lines[1:len(lines)-1], "\n")
		}
	}
	if err := json.Unmarshal([]byte(content), &result); err != nil {
		return heuristicDetect(req.Text), nil
	}

	// Normalize
	if result.AIScore < 0 {
		result.AIScore = 0
	}
	if result.AIScore > 1 {
		result.AIScore = 1
	}
	result.HumanScore = 1.0 - result.AIScore
	if result.Label == "" {
		switch {
		case result.AIScore > 0.7:
			result.Label = "ai"
		case result.AIScore < 0.3:
			result.Label = "human"
		default:
			result.Label = "mixed"
		}
	}

	return &result, nil
}

// heuristicDetect provides a simple keyword-based AI detection fallback.
func heuristicDetect(text string) *DetectResponse {
	lower := strings.ToLower(text)
	aiWords := []string{
		"utilize", "implement", "facilitate", "leverage", "comprehensive",
		"delve", "nuanced", "paramount", "intricate", "commendable",
		"pivotal", "robust", "seamlessly", "streamline", "furthermore",
		"in conclusion", "in summary", "it is worth noting", "it is important to note",
	}
	score := 0
	for _, w := range aiWords {
		if strings.Contains(lower, w) {
			score++
		}
	}
	aiScore := float64(score) / float64(len(aiWords))
	if aiScore > 1 {
		aiScore = 1
	}
	label := "mixed"
	if aiScore > 0.7 {
		label = "ai"
	} else if aiScore < 0.25 {
		label = "human"
	}
	return &DetectResponse{
		AIScore:    aiScore,
		HumanScore: 1.0 - aiScore,
		Confidence: 0.5,
		Label:      label,
	}
}

// CountWords counts words supporting CJK characters.
func CountWords(text string) int {
	if strings.TrimSpace(text) == "" {
		return 0
	}
	cjk := 0
	for _, r := range text {
		if r >= 0x4E00 && r <= 0x9FFF {
			cjk++
		}
	}
	en := len(strings.Fields(strings.Map(func(r rune) rune {
		if r >= 0x4E00 && r <= 0x9FFF {
			return ' '
		}
		return r
	}, text)))
	return cjk + en
}

