package aiservice

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

// noProxyTransport returns an HTTP transport that bypasses system proxy settings.
func noProxyTransport() *http.Transport {
	return &http.Transport{
		Proxy: func(*http.Request) (*url.URL, error) { return nil, nil },
	}
}

type OpenAIProvider struct {
	cfg    ProviderConfig
	client *http.Client
}

func NewOpenAIProvider(cfg ProviderConfig) *OpenAIProvider {
	if cfg.BaseURL == "" {
		cfg.BaseURL = "https://api.openai.com/v1"
	}
	if cfg.Model == "" {
		cfg.Model = "gpt-4o-mini"
	}
	if cfg.Timeout == 0 {
		cfg.Timeout = 60
	}
	return &OpenAIProvider{
		cfg:    cfg,
		client: &http.Client{Timeout: time.Duration(cfg.Timeout) * time.Second, Transport: noProxyTransport()},
	}
}

func (p *OpenAIProvider) GetProviderName() string { return "openai" }
func (p *OpenAIProvider) IsAvailable() bool       { return p.cfg.APIKey != "" }

// ── 公开方法（供接口调用）────────────────────────────────────

func (p *OpenAIProvider) Chat(ctx context.Context, req ChatRequest) (*ChatResponse, error) {
	return p.chatAs(ctx, req, "openai")
}

func (p *OpenAIProvider) ChatStream(ctx context.Context, req ChatRequest) (<-chan StreamChunk, error) {
	return p.chatStreamAs(ctx, req)
}

// ── 内部共享实现（子类通过显式调用复用）────────────────────────

// chatAs 执行非流式请求，providerName 用于填写响应中的 Provider 字段。
func (p *OpenAIProvider) chatAs(ctx context.Context, req ChatRequest, providerName string) (*ChatResponse, error) {
	start := time.Now()

	maxTok := req.MaxTokens
	if maxTok == 0 {
		maxTok = 2000
	}
	temp := req.Temperature
	if temp == 0 {
		temp = 0.7
	}

	payload := map[string]interface{}{
		"model":       p.cfg.Model,
		"messages":    p.buildMessages(req),
		"max_tokens":  maxTok,
		"temperature": temp,
		"stream":      false,
	}
	body, _ := json.Marshal(payload)

	httpReq, err := http.NewRequestWithContext(ctx, "POST",
		strings.TrimRight(p.cfg.BaseURL, "/")+"/chat/completions", bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	httpReq.Header.Set("Authorization", "Bearer "+p.cfg.APIKey)
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := p.client.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		raw, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("%s error %d: %s", providerName, resp.StatusCode, string(raw))
	}

	var result struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
			FinishReason string `json:"finish_reason"`
		} `json:"choices"`
		Usage struct {
			PromptTokens     int `json:"prompt_tokens"`
			CompletionTokens int `json:"completion_tokens"`
			TotalTokens      int `json:"total_tokens"`
		} `json:"usage"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}
	if len(result.Choices) == 0 {
		return nil, fmt.Errorf("%s: no choices returned", providerName)
	}

	return &ChatResponse{
		Content:      result.Choices[0].Message.Content,
		FinishReason: result.Choices[0].FinishReason,
		Usage: TokenUsage{
			PromptTokens:     result.Usage.PromptTokens,
			CompletionTokens: result.Usage.CompletionTokens,
			TotalTokens:      result.Usage.TotalTokens,
		},
		Provider:  providerName,
		Model:     p.cfg.Model,
		LatencyMs: time.Since(start).Milliseconds(),
	}, nil
}

// chatStreamAs 执行流式请求，返回 SSE chunk channel。
func (p *OpenAIProvider) chatStreamAs(ctx context.Context, req ChatRequest) (<-chan StreamChunk, error) {
	maxTok := req.MaxTokens
	if maxTok == 0 {
		maxTok = 2000
	}
	temp := req.Temperature
	if temp == 0 {
		temp = 0.7
	}

	payload := map[string]interface{}{
		"model":       p.cfg.Model,
		"messages":    p.buildMessages(req),
		"max_tokens":  maxTok,
		"temperature": temp,
		"stream":      true,
	}
	body, _ := json.Marshal(payload)

	httpReq, err := http.NewRequestWithContext(ctx, "POST",
		strings.TrimRight(p.cfg.BaseURL, "/")+"/chat/completions", bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	httpReq.Header.Set("Authorization", "Bearer "+p.cfg.APIKey)
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := p.client.Do(httpReq)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode != http.StatusOK {
		raw, _ := io.ReadAll(resp.Body)
		resp.Body.Close()
		return nil, fmt.Errorf("stream error %d: %s", resp.StatusCode, string(raw))
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
			if data == "[DONE]" {
				ch <- StreamChunk{Done: true}
				return
			}
			var chunk struct {
				Choices []struct {
					Delta struct {
						Content string `json:"content"`
					} `json:"delta"`
				} `json:"choices"`
			}
			if err := json.Unmarshal([]byte(data), &chunk); err != nil {
				continue
			}
			if len(chunk.Choices) > 0 && chunk.Choices[0].Delta.Content != "" {
				ch <- StreamChunk{Content: chunk.Choices[0].Delta.Content}
			}
		}
		if err := scanner.Err(); err != nil {
			ch <- StreamChunk{Error: err}
		}
	}()
	return ch, nil
}

// ── buildMessages ─────────────────────────────────────────────

func (p *OpenAIProvider) buildMessages(req ChatRequest) []map[string]string {
	var msgs []map[string]string
	if req.SystemPrompt != "" {
		msgs = append(msgs, map[string]string{"role": "system", "content": req.SystemPrompt})
	}
	for _, m := range req.Messages {
		msgs = append(msgs, map[string]string{"role": m.Role, "content": m.Content})
	}
	return msgs
}
