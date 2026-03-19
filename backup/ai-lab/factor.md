# Block C-01 · AI 服务层 — 多模型策略工厂（共用基础）

> **所属模块**：AI 服务层（所有 AI 工具共用）  
> **预估工时**：4h  
> **依赖**：无（此为基础设施 Block，A-06 和 B-04 都依赖它）  
> **交付粒度**：接口定义 + 工厂 + OpenAI + DeepSeek 两个 Provider 实现

---

## 1. 文件结构

```
internal/aiservice/
├── interface.go          ← AIProvider 接口 + 公共类型
├── factory.go            ← ProviderFactory（策略工厂）
├── config.go             ← 配置读取 + 环境变量覆盖
├── provider_openai.go    ← OpenAI / 兼容 OpenAI 协议的通用实现
├── provider_deepseek.go  ← DeepSeek（复用 OpenAI 实现）
├── provider_gemini.go    ← Google Gemini（独立实现）
└── provider_doubao.go    ← 字节豆包（复用 OpenAI 实现）
```

---

## 2. interface.go

```go
package aiservice

import "context"

// AIProvider 大模型统一接口（策略模式）
type AIProvider interface {
    Chat(ctx context.Context, req ChatRequest) (*ChatResponse, error)
    ChatStream(ctx context.Context, req ChatRequest) (<-chan StreamChunk, error)
    GetProviderName() string
    IsAvailable() bool
}

// ChatRequest 统一请求格式
type ChatRequest struct {
    Messages     []Message `json:"messages"`
    SystemPrompt string    `json:"system_prompt"`
    MaxTokens    int       `json:"max_tokens"`
    Temperature  float64   `json:"temperature"`
}

type Message struct {
    Role    string `json:"role"`    // "user" / "assistant" / "system"
    Content string `json:"content"`
}

// ChatResponse 统一响应格式
type ChatResponse struct {
    Content      string     `json:"content"`
    FinishReason string     `json:"finish_reason"`
    Usage        TokenUsage `json:"usage"`
    Provider     string     `json:"provider"`
    Model        string     `json:"model"`
    LatencyMs    int64      `json:"latency_ms"`
}

type StreamChunk struct {
    Content string `json:"content"`
    Done    bool   `json:"done"`
    Error   error  `json:"error,omitempty"`
}

type TokenUsage struct {
    PromptTokens     int `json:"prompt_tokens"`
    CompletionTokens int `json:"completion_tokens"`
    TotalTokens      int `json:"total_tokens"`
}
```

---

## 3. config.go

```go
package aiservice

import (
    "os"
    "gopkg.in/yaml.v3"
)

type ProviderConfig struct {
    Enabled     bool    `yaml:"enabled"`
    APIKey      string  `yaml:"api_key"`
    BaseURL     string  `yaml:"base_url"`
    Model       string  `yaml:"model"`
    MaxTokens   int     `yaml:"max_tokens"`
    Temperature float64 `yaml:"temperature"`
    Timeout     int     `yaml:"timeout"`
}

type AIConfig struct {
    DefaultProvider  string            `yaml:"default_provider"`
    FallbackProvider string            `yaml:"fallback_provider"`
    TaskRouting      map[string]string `yaml:"task_routing"`
    OpenAI           ProviderConfig    `yaml:"openai"`
    DeepSeek         ProviderConfig    `yaml:"deepseek"`
    Gemini           ProviderConfig    `yaml:"gemini"`
    Doubao           ProviderConfig    `yaml:"doubao"`
    Claude           ProviderConfig    `yaml:"claude"`
}

func LoadAIConfig(configPath string) (*AIConfig, error) {
    data, err := os.ReadFile(configPath)
    if err != nil {
        return nil, err
    }
    var wrapper struct {
        AI AIConfig `yaml:"ai"`
    }
    if err := yaml.Unmarshal(data, &wrapper); err != nil {
        return nil, err
    }
    cfg := &wrapper.AI

    // 环境变量优先级高于配置文件
    envOverrides := map[string]*string{
        "OPENAI_API_KEY":   &cfg.OpenAI.APIKey,
        "DEEPSEEK_API_KEY": &cfg.DeepSeek.APIKey,
        "GEMINI_API_KEY":   &cfg.Gemini.APIKey,
        "DOUBAO_API_KEY":   &cfg.Doubao.APIKey,
        "CLAUDE_API_KEY":   &cfg.Claude.APIKey,
    }
    for env, ptr := range envOverrides {
        if v := os.Getenv(env); v != "" {
            *ptr = v
        }
    }
    return cfg, nil
}
```

---

## 4. factory.go

```go
package aiservice

import (
    "fmt"
    "sync"
)

type ProviderFactory struct {
    config    *AIConfig
    providers map[string]AIProvider
    mu        sync.RWMutex
}

var (
    globalFactory *ProviderFactory
    once          sync.Once
)

func InitFactory(cfg *AIConfig) *ProviderFactory {
    once.Do(func() {
        f := &ProviderFactory{
            config:    cfg,
            providers: make(map[string]AIProvider),
        }
        // 注册已启用且有 APIKey 的提供商
        register := func(name string, enabled bool, apiKey string, newFn func() AIProvider) {
            if enabled && apiKey != "" {
                f.providers[name] = newFn()
            }
        }
        register("openai",   cfg.OpenAI.Enabled,   cfg.OpenAI.APIKey,   func() AIProvider { return NewOpenAIProvider(cfg.OpenAI) })
        register("deepseek", cfg.DeepSeek.Enabled,  cfg.DeepSeek.APIKey, func() AIProvider { return NewDeepSeekProvider(cfg.DeepSeek) })
        register("gemini",   cfg.Gemini.Enabled,    cfg.Gemini.APIKey,   func() AIProvider { return NewGeminiProvider(cfg.Gemini) })
        register("doubao",   cfg.Doubao.Enabled,    cfg.Doubao.APIKey,   func() AIProvider { return NewDoubaoProvider(cfg.Doubao) })
        globalFactory = f
    })
    return globalFactory
}

func GetFactory() *ProviderFactory { return globalFactory }

func (f *ProviderFactory) GetProvider(name string) (AIProvider, error) {
    f.mu.RLock()
    defer f.mu.RUnlock()
    if p, ok := f.providers[name]; ok {
        return p, nil
    }
    return nil, fmt.Errorf("provider '%s' not found or not enabled", name)
}

// GetProviderForTask 根据任务类型返回最优提供商（支持 fallback）
func (f *ProviderFactory) GetProviderForTask(task string) (AIProvider, error) {
    // 1. 任务级路由
    if name, ok := f.config.TaskRouting[task]; ok {
        if p, err := f.GetProvider(name); err == nil {
            return p, nil
        }
    }
    // 2. 默认提供商
    if f.config.DefaultProvider != "" {
        if p, err := f.GetProvider(f.config.DefaultProvider); err == nil {
            return p, nil
        }
    }
    // 3. Fallback 提供商
    if f.config.FallbackProvider != "" {
        if p, err := f.GetProvider(f.config.FallbackProvider); err == nil {
            return p, nil
        }
    }
    // 4. 任意可用提供商
    for _, p := range f.providers {
        if p.IsAvailable() {
            return p, nil
        }
    }
    return nil, fmt.Errorf("no AI provider available")
}

func (f *ProviderFactory) GetDefaultProvider() (AIProvider, error) {
    return f.GetProviderForTask("__default__")
}
```

---

## 5. provider_openai.go

```go
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

type OpenAIProvider struct {
    cfg    ProviderConfig
    client *http.Client
}

func NewOpenAIProvider(cfg ProviderConfig) *OpenAIProvider {
    if cfg.BaseURL == "" { cfg.BaseURL = "https://api.openai.com" }
    if cfg.Model   == "" { cfg.Model   = "gpt-4o-mini" }
    if cfg.Timeout == 0  { cfg.Timeout = 60 }
    return &OpenAIProvider{
        cfg:    cfg,
        client: &http.Client{Timeout: time.Duration(cfg.Timeout) * time.Second},
    }
}

func (p *OpenAIProvider) GetProviderName() string { return "openai" }
func (p *OpenAIProvider) IsAvailable() bool       { return p.cfg.APIKey != "" }

func (p *OpenAIProvider) Chat(ctx context.Context, req ChatRequest) (*ChatResponse, error) {
    start    := time.Now()
    messages := p.buildMessages(req)
    maxTok   := req.MaxTokens; if maxTok == 0 { maxTok = 2000 }
    temp     := req.Temperature; if temp == 0 { temp = 0.7 }

    payload := map[string]interface{}{
        "model": p.cfg.Model, "messages": messages,
        "max_tokens": maxTok, "temperature": temp, "stream": false,
    }
    body, _ := json.Marshal(payload)

    httpReq, err := http.NewRequestWithContext(ctx, "POST",
        p.cfg.BaseURL+"/v1/chat/completions", bytes.NewReader(body))
    if err != nil { return nil, err }
    httpReq.Header.Set("Authorization", "Bearer "+p.cfg.APIKey)
    httpReq.Header.Set("Content-Type", "application/json")

    resp, err := p.client.Do(httpReq)
    if err != nil { return nil, err }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        raw, _ := io.ReadAll(resp.Body)
        return nil, fmt.Errorf("openai error %d: %s", resp.StatusCode, string(raw))
    }

    var result struct {
        Choices []struct {
            Message      struct{ Content string `json:"content"` } `json:"message"`
            FinishReason string                                     `json:"finish_reason"`
        } `json:"choices"`
        Usage struct {
            PromptTokens int `json:"prompt_tokens"`
            CompletionTokens int `json:"completion_tokens"`
            TotalTokens  int `json:"total_tokens"`
        } `json:"usage"`
    }
    if err := json.NewDecoder(resp.Body).Decode(&result); err != nil { return nil, err }
    if len(result.Choices) == 0 { return nil, fmt.Errorf("no choices returned") }

    return &ChatResponse{
        Content:      result.Choices[0].Message.Content,
        FinishReason: result.Choices[0].FinishReason,
        Usage:        TokenUsage{result.Usage.PromptTokens, result.Usage.CompletionTokens, result.Usage.TotalTokens},
        Provider:     "openai", Model: p.cfg.Model,
        LatencyMs:    time.Since(start).Milliseconds(),
    }, nil
}

func (p *OpenAIProvider) ChatStream(ctx context.Context, req ChatRequest) (<-chan StreamChunk, error) {
    messages := p.buildMessages(req)
    maxTok   := req.MaxTokens; if maxTok == 0 { maxTok = 2000 }
    temp     := req.Temperature; if temp == 0 { temp = 0.7 }

    payload := map[string]interface{}{
        "model": p.cfg.Model, "messages": messages,
        "max_tokens": maxTok, "temperature": temp, "stream": true,
    }
    body, _ := json.Marshal(payload)

    httpReq, err := http.NewRequestWithContext(ctx, "POST",
        p.cfg.BaseURL+"/v1/chat/completions", bytes.NewReader(body))
    if err != nil { return nil, err }
    httpReq.Header.Set("Authorization", "Bearer "+p.cfg.APIKey)
    httpReq.Header.Set("Content-Type", "application/json")

    resp, err := p.client.Do(httpReq)
    if err != nil { return nil, err }

    ch := make(chan StreamChunk, 16)
    go func() {
        defer close(ch)
        defer resp.Body.Close()

        scanner := bufio.NewScanner(resp.Body)
        for scanner.Scan() {
            line := scanner.Text()
            if !strings.HasPrefix(line, "data: ") { continue }
            data := strings.TrimPrefix(line, "data: ")
            if data == "[DONE]" { ch <- StreamChunk{Done: true}; return }

            var chunk struct {
                Choices []struct {
                    Delta struct{ Content string `json:"content"` } `json:"delta"`
                } `json:"choices"`
            }
            if err := json.Unmarshal([]byte(data), &chunk); err != nil { continue }
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
```

---

## 6. provider_deepseek.go

```go
package aiservice

// DeepSeek API 与 OpenAI 完全兼容，直接复用
type DeepSeekProvider struct{ *OpenAIProvider }

func NewDeepSeekProvider(cfg ProviderConfig) *DeepSeekProvider {
    if cfg.BaseURL == "" { cfg.BaseURL = "https://api.deepseek.com" }
    if cfg.Model   == "" { cfg.Model   = "deepseek-chat" }
    return &DeepSeekProvider{OpenAIProvider: NewOpenAIProvider(cfg)}
}
func (p *DeepSeekProvider) GetProviderName() string { return "deepseek" }
```

---

## 7. provider_doubao.go

```go
package aiservice

// 豆包（火山引擎 Ark）与 OpenAI 兼容
type DoubaoProvider struct{ *OpenAIProvider }

func NewDoubaoProvider(cfg ProviderConfig) *DoubaoProvider {
    if cfg.BaseURL == "" {
        cfg.BaseURL = "https://ark.cn-beijing.volces.com/api/v3"
    }
    // cfg.Model 必须是火山引擎推理接入点 ID，如 ep-xxxxxxxx-xxxxx
    return &DoubaoProvider{OpenAIProvider: NewOpenAIProvider(cfg)}
}
func (p *DoubaoProvider) GetProviderName() string { return "doubao" }
```

---

## 8. configs/config.yaml（AI 配置段）

```yaml
ai:
  default_provider:  "deepseek"
  fallback_provider: "openai"

  task_routing:
    detector:  "deepseek"   # 逻辑分析，价格低
    humanize:  "openai"     # 语言质量，用 GPT-4o-mini

  openai:
    enabled:     true
    api_key:     ""          # 或环境变量 OPENAI_API_KEY
    base_url:    "https://api.openai.com"
    model:       "gpt-4o-mini"
    max_tokens:  2000
    temperature: 0.7
    timeout:     60

  deepseek:
    enabled:     true
    api_key:     ""          # 或 DEEPSEEK_API_KEY
    base_url:    "https://api.deepseek.com"
    model:       "deepseek-chat"
    max_tokens:  2000
    temperature: 0.7
    timeout:     60

  gemini:
    enabled:     false
    api_key:     ""
    model:       "gemini-1.5-flash"
    timeout:     60

  doubao:
    enabled:     false
    api_key:     ""
    base_url:    "https://ark.cn-beijing.volces.com/api/v3"
    model:       "ep-xxxxxxxxx-xxxxx"  # 替换为实际接入点 ID
    timeout:     60
```

---

## 9. main.go 初始化

```go
// cmd/main.go
func main() {
    // 加载 AI 配置并初始化工厂
    aiCfg, err := aiservice.LoadAIConfig("configs/config.yaml")
    if err != nil {
        log.Fatalf("Failed to load AI config: %v", err)
    }
    aiservice.InitFactory(aiCfg)

    // ... 启动 gin server
}
```

---

## 10. 验收标准

- [ ] `aiservice.InitFactory(cfg)` 不报错，`GetFactory()` 返回非 nil
- [ ] `GetProviderForTask("detector")` 在配置 deepseek 时返回 DeepSeek Provider
- [ ] `GetProviderForTask("humanize")` 返回 OpenAI Provider
- [ ] 若 deepseek 不可用，自动 fallback 到 openai
- [ ] 环境变量 `OPENAI_API_KEY` 覆盖 config.yaml 中的值
- [ ] OpenAI Chat 集成测试（需真实 key）返回正确响应
- [ ] OpenAI ChatStream 流式测试能正确接收 chunk

