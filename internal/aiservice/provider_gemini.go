package aiservice

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// GeminiProvider Google Gemini REST API 实现
// 文档：https://ai.google.dev/api/generate-content
type GeminiProvider struct {
	cfg    ProviderConfig
	client *http.Client
}

func NewGeminiProvider(cfg ProviderConfig) *GeminiProvider {
	if cfg.BaseURL == "" {
		cfg.BaseURL = "https://generativelanguage.googleapis.com"
	}
	if cfg.Model == "" {
		cfg.Model = "gemini-1.5-flash"
	}
	if cfg.Timeout == 0 {
		cfg.Timeout = 60
	}
	return &GeminiProvider{
		cfg:    cfg,
		client: &http.Client{Timeout: time.Duration(cfg.Timeout) * time.Second, Transport: noProxyTransport()},
	}
}

func (p *GeminiProvider) GetProviderName() string { return "gemini" }
func (p *GeminiProvider) IsAvailable() bool       { return p.cfg.APIKey != "" }

// ── 内部请求/响应结构 ──────────────────────────────────────────

type geminiContent struct {
	Role  string       `json:"role,omitempty"` // "user" / "model"
	Parts []geminiPart `json:"parts"`
}

type geminiPart struct {
	Text string `json:"text"`
}

type geminiRequest struct {
	Contents          []geminiContent   `json:"contents"`
	SystemInstruction *geminiContent    `json:"systemInstruction,omitempty"`
	GenerationConfig  geminiGenConfig   `json:"generationConfig"`
}

type geminiGenConfig struct {
	MaxOutputTokens int     `json:"maxOutputTokens,omitempty"`
	Temperature     float64 `json:"temperature,omitempty"`
}

type geminiResponse struct {
	Candidates []struct {
		Content      geminiContent `json:"content"`
		FinishReason string        `json:"finishReason"`
	} `json:"candidates"`
	UsageMetadata struct {
		PromptTokenCount     int `json:"promptTokenCount"`
		CandidatesTokenCount int `json:"candidatesTokenCount"`
		TotalTokenCount      int `json:"totalTokenCount"`
	} `json:"usageMetadata"`
}

// ── Chat（非流式）────────────────────────────────────────────

func (p *GeminiProvider) Chat(ctx context.Context, req ChatRequest) (*ChatResponse, error) {
	start := time.Now()

	gemReq := p.buildRequest(req)
	body, _ := json.Marshal(gemReq)

	url := fmt.Sprintf("%s/v1beta/models/%s:generateContent?key=%s",
		p.cfg.BaseURL, p.cfg.Model, p.cfg.APIKey)

	httpReq, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := p.client.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		raw, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("gemini error %d: %s", resp.StatusCode, string(raw))
	}

	var result geminiResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}
	if len(result.Candidates) == 0 {
		return nil, fmt.Errorf("gemini: no candidates returned")
	}

	content := ""
	if len(result.Candidates[0].Content.Parts) > 0 {
		content = result.Candidates[0].Content.Parts[0].Text
	}

	return &ChatResponse{
		Content:      content,
		FinishReason: result.Candidates[0].FinishReason,
		Usage: TokenUsage{
			PromptTokens:     result.UsageMetadata.PromptTokenCount,
			CompletionTokens: result.UsageMetadata.CandidatesTokenCount,
			TotalTokens:      result.UsageMetadata.TotalTokenCount,
		},
		Provider:  "gemini",
		Model:     p.cfg.Model,
		LatencyMs: time.Since(start).Milliseconds(),
	}, nil
}

// ── ChatStream（SSE 流式）────────────────────────────────────

func (p *GeminiProvider) ChatStream(ctx context.Context, req ChatRequest) (<-chan StreamChunk, error) {
	gemReq := p.buildRequest(req)
	body, _ := json.Marshal(gemReq)

	url := fmt.Sprintf("%s/v1beta/models/%s:streamGenerateContent?key=%s&alt=sse",
		p.cfg.BaseURL, p.cfg.Model, p.cfg.APIKey)

	httpReq, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := p.client.Do(httpReq)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode != http.StatusOK {
		raw, _ := io.ReadAll(resp.Body)
		resp.Body.Close()
		return nil, fmt.Errorf("gemini stream error %d: %s", resp.StatusCode, string(raw))
	}

	ch := make(chan StreamChunk, 16)
	go func() {
		defer close(ch)
		defer resp.Body.Close()

		scanner := bufio.NewScanner(resp.Body)
		for scanner.Scan() {
			line := scanner.Text()
			if !strings.HasPrefix(line, "data: ") {
				continue
			}
			data := strings.TrimPrefix(line, "data: ")
			if data == "" {
				continue
			}

			var chunk geminiResponse
			if err := json.Unmarshal([]byte(data), &chunk); err != nil {
				continue
			}
			if len(chunk.Candidates) == 0 {
				continue
			}
			cand := chunk.Candidates[0]
			if len(cand.Content.Parts) > 0 && cand.Content.Parts[0].Text != "" {
				ch <- StreamChunk{Content: cand.Content.Parts[0].Text}
			}
			// STOP / MAX_TOKENS 等结束信号
			if cand.FinishReason != "" && cand.FinishReason != "FINISH_REASON_UNSPECIFIED" {
				ch <- StreamChunk{Done: true}
				return
			}
		}
		if err := scanner.Err(); err != nil {
			ch <- StreamChunk{Error: err}
			return
		}
		ch <- StreamChunk{Done: true}
	}()
	return ch, nil
}

// ── 构建请求 ─────────────────────────────────────────────────

func (p *GeminiProvider) buildRequest(req ChatRequest) geminiRequest {
	maxTok := req.MaxTokens
	if maxTok == 0 {
		maxTok = 2000
	}
	temp := req.Temperature
	if temp == 0 {
		temp = 0.7
	}

	var contents []geminiContent
	for _, m := range req.Messages {
		role := m.Role
		// Gemini 只支持 "user" / "model"；assistant → model
		if role == "assistant" {
			role = "model"
		}
		contents = append(contents, geminiContent{
			Role:  role,
			Parts: []geminiPart{{Text: m.Content}},
		})
	}

	gemReq := geminiRequest{
		Contents: contents,
		GenerationConfig: geminiGenConfig{
			MaxOutputTokens: maxTok,
			Temperature:     temp,
		},
	}

	// system prompt → systemInstruction（Gemini 1.5+）
	if req.SystemPrompt != "" {
		gemReq.SystemInstruction = &geminiContent{
			Parts: []geminiPart{{Text: req.SystemPrompt}},
		}
	}

	return gemReq
}
