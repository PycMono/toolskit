<!-- ai-humanizer-I-05_后端Go引擎_策略工厂模式.md -->

# AI Humanizer — 后端 Go 引擎（策略 + 工厂模式）

---

## 1. 整体架构

```
/internal/ai/
├── interface.go          ← AIProvider 接口定义
├── factory.go            ← AIProviderFactory（工厂）
├── strategy.go           ← HumanizeStrategy（策略路由器）
├── providers/
│   ├── openai.go         ← OpenAI Provider
│   ├── anthropic.go      ← Anthropic Provider
│   ├── google.go         ← Google Gemini Provider
│   └── deepseek.go       ← DeepSeek Provider
├── prompt_loader.go      ← .md 文件提示词加载器
└── detector.go           ← AI 内容检测逻辑

/prompts/
├── humanize-basic.md
├── humanize-standard.md
├── humanize-aggressive.md
├── humanize-academic.md
├── humanize-creative.md
├── humanize-business.md
└── detect-ai.md

/internal/handler/ai/
├── humanize.go           ← POST /api/ai/humanize
├── humanize_stream.go    ← GET /api/ai/humanize/stream（SSE）
└── detect.go             ← POST /api/ai/detect
```

---

## 2. AIProvider 接口定义

```go
// internal/ai/interface.go
package ai

import (
    "context"
    "io"
)

// HumanizeRequest 人性化请求
type HumanizeRequest struct {
    Text             string  `json:"text"`
    Mode             string  `json:"mode"`             // basic|standard|aggressive|academic|creative|business
    Tone             string  `json:"tone"`             // neutral|formal|casual
    OutputLang       string  `json:"output_lang"`      // en|zh|ja|ko|es...
    PreserveFormat   bool    `json:"preserve_format"`
    PreserveCitations bool   `json:"preserve_citations"`
    SystemPrompt     string  `json:"-"`                // 由 PromptLoader 注入
    UserPrompt       string  `json:"-"`                // 拼装后的完整用户提示词
}

// HumanizeResponse 非流式响应
type HumanizeResponse struct {
    Text     string  `json:"text"`
    TokensIn int     `json:"tokens_in"`
    TokensOut int    `json:"tokens_out"`
}

// DetectRequest AI 检测请求
type DetectRequest struct {
    Text string `json:"text"`
}

// DetectResponse AI 检测响应
type DetectResponse struct {
    AIScore     float64 `json:"ai_score"`     // 0.0-1.0
    HumanScore  float64 `json:"human_score"`  // 0.0-1.0
    Confidence  float64 `json:"confidence"`   // 0.0-1.0
    Label       string  `json:"label"`        // "ai"|"human"|"mixed"
}

// AIProvider 接口：所有 AI 提供商必须实现
type AIProvider interface {
    // Name 返回提供商名称（用于日志和指标）
    Name() string

    // Humanize 非流式人性化（短文本用）
    Humanize(ctx context.Context, req HumanizeRequest) (*HumanizeResponse, error)

    // HumanizeStream 流式人性化，写入 writer
    HumanizeStream(ctx context.Context, req HumanizeRequest, writer io.Writer) error

    // Detect AI 检测
    Detect(ctx context.Context, req DetectRequest) (*DetectResponse, error)

    // Available 检查提供商是否可用（API Key 是否配置）
    Available() bool
}
```

---

## 3. 工厂模式

```go
// internal/ai/factory.go
package ai

import (
    "fmt"
    "sync"
    "toolboxnova/internal/ai/providers"
    "toolboxnova/internal/config"
)

// AIProviderFactory 提供商工厂
type AIProviderFactory struct {
    mu        sync.RWMutex
    providers map[string]AIProvider
    cfg       *config.AIConfig
}

// NewAIProviderFactory 创建工厂（单例，应用启动时初始化）
func NewAIProviderFactory(cfg *config.AIConfig) *AIProviderFactory {
    f := &AIProviderFactory{
        providers: make(map[string]AIProvider),
        cfg:       cfg,
    }
    f.registerAll()
    return f
}

// registerAll 注册所有支持的提供商
func (f *AIProviderFactory) registerAll() {
    // OpenAI
    if f.cfg.OpenAI.APIKey != "" {
        f.register("openai", providers.NewOpenAIProvider(f.cfg.OpenAI))
    }
    // Anthropic Claude
    if f.cfg.Anthropic.APIKey != "" {
        f.register("anthropic", providers.NewAnthropicProvider(f.cfg.Anthropic))
    }
    // Google Gemini
    if f.cfg.Google.APIKey != "" {
        f.register("google", providers.NewGoogleProvider(f.cfg.Google))
    }
    // DeepSeek
    if f.cfg.DeepSeek.APIKey != "" {
        f.register("deepseek", providers.NewDeepSeekProvider(f.cfg.DeepSeek))
    }
}

// register 注册提供商
func (f *AIProviderFactory) register(name string, p AIProvider) {
    f.mu.Lock()
    defer f.mu.Unlock()
    f.providers[name] = p
}

// Get 按名称获取提供商
func (f *AIProviderFactory) Get(name string) (AIProvider, error) {
    f.mu.RLock()
    defer f.mu.RUnlock()
    p, ok := f.providers[name]
    if !ok {
        return nil, fmt.Errorf("AI provider '%s' not registered", name)
    }
    if !p.Available() {
        return nil, fmt.Errorf("AI provider '%s' is not available (check API key)", name)
    }
    return p, nil
}

// GetDefault 获取第一个可用的提供商（按优先级）
func (f *AIProviderFactory) GetDefault() (AIProvider, error) {
    priority := []string{"openai", "anthropic", "google", "deepseek"}
    for _, name := range priority {
        if p, err := f.Get(name); err == nil {
            return p, nil
        }
    }
    return nil, fmt.Errorf("no AI provider available")
}

// List 列出所有已注册的提供商名称
func (f *AIProviderFactory) List() []string {
    f.mu.RLock()
    defer f.mu.RUnlock()
    names := make([]string, 0, len(f.providers))
    for name := range f.providers { names = append(names, name) }
    return names
}
```

---

## 4. 策略模式

```go
// internal/ai/strategy.go
package ai

import (
    "context"
    "fmt"
    "io"
    "toolboxnova/internal/config"
)

// HumanizeStrategy 人性化策略路由器
type HumanizeStrategy struct {
    factory      *AIProviderFactory
    promptLoader *PromptLoader
    cfg          *config.AIConfig
}

func NewHumanizeStrategy(factory *AIProviderFactory, loader *PromptLoader, cfg *config.AIConfig) *HumanizeStrategy {
    return &HumanizeStrategy{factory: factory, promptLoader: loader, cfg: cfg}
}

// selectProvider 根据模式和配置选择最适合的提供商
// 策略规则：
//   - aggressive / academic 模式 → 优先 Claude（指令遵从性最强）
//   - creative 模式 → 优先 GPT-4 / Gemini（创意输出更好）
//   - basic / standard / business → 优先 DeepSeek（成本最低）
//   - 若首选不可用，自动 fallback 到 GetDefault()
func (s *HumanizeStrategy) selectProvider(mode string) (AIProvider, error) {
    preferenceMap := map[string][]string{
        "basic":      {"deepseek", "openai", "google", "anthropic"},
        "standard":   {"deepseek", "openai", "google", "anthropic"},
        "aggressive": {"anthropic", "openai", "google", "deepseek"},
        "academic":   {"anthropic", "openai", "google", "deepseek"},
        "creative":   {"openai", "google", "anthropic", "deepseek"},
        "business":   {"deepseek", "openai", "anthropic", "google"},
    }

    // 若配置了强制指定的 provider，优先使用
    if s.cfg.ForceProvider != "" {
        return s.factory.Get(s.cfg.ForceProvider)
    }

    candidates, ok := preferenceMap[mode]
    if !ok {
        candidates = []string{"openai", "anthropic", "google", "deepseek"}
    }

    for _, name := range candidates {
        if p, err := s.factory.Get(name); err == nil {
            return p, nil
        }
    }
    return s.factory.GetDefault()
}

// Humanize 非流式人性化
func (s *HumanizeStrategy) Humanize(ctx context.Context, req HumanizeRequest) (*HumanizeResponse, error) {
    // 1. 加载提示词
    prompt, err := s.promptLoader.Load(req.Mode)
    if err != nil {
        return nil, fmt.Errorf("failed to load prompt for mode '%s': %w", req.Mode, err)
    }

    // 2. 组装提示词
    req.SystemPrompt = prompt.System
    req.UserPrompt   = prompt.BuildUserPrompt(req)

    // 3. 选择 Provider
    provider, err := s.selectProvider(req.Mode)
    if err != nil {
        return nil, fmt.Errorf("no available provider: %w", err)
    }

    // 4. 调用
    return provider.Humanize(ctx, req)
}

// HumanizeStream 流式人性化（SSE）
func (s *HumanizeStrategy) HumanizeStream(ctx context.Context, req HumanizeRequest, writer io.Writer) error {
    prompt, err := s.promptLoader.Load(req.Mode)
    if err != nil {
        return fmt.Errorf("failed to load prompt: %w", err)
    }
    req.SystemPrompt = prompt.System
    req.UserPrompt   = prompt.BuildUserPrompt(req)

    provider, err := s.selectProvider(req.Mode)
    if err != nil {
        return err
    }

    return provider.HumanizeStream(ctx, req, writer)
}

// Detect AI 检测（统一使用配置的检测 Provider）
func (s *HumanizeStrategy) Detect(ctx context.Context, req DetectRequest) (*DetectResponse, error) {
    // 检测功能优先用 OpenAI（稳定性好）
    provider, err := s.factory.Get(s.cfg.DetectProvider)
    if err != nil {
        provider, err = s.factory.GetDefault()
        if err != nil {
            return nil, err
        }
    }
    return provider.Detect(ctx, req)
}
```

---

## 5. Prompt 加载器

```go
// internal/ai/prompt_loader.go
package ai

import (
    "fmt"
    "os"
    "path/filepath"
    "strings"
    "sync"
    "time"
)

// Prompt 已加载的提示词
type Prompt struct {
    Mode       string
    System     string
    UserTpl    string  // 用户提示词模板（含 {{.Text}} 等占位符）
    LoadedAt   time.Time
}

// BuildUserPrompt 根据请求参数填充用户提示词
func (p *Prompt) BuildUserPrompt(req HumanizeRequest) string {
    result := p.UserTpl
    result = strings.ReplaceAll(result, "{{.Text}}", req.Text)
    result = strings.ReplaceAll(result, "{{.Tone}}", req.Tone)
    result = strings.ReplaceAll(result, "{{.OutputLang}}", req.OutputLang)
    if req.PreserveFormat {
        result = strings.ReplaceAll(result, "{{.PreserveFormatNote}}",
            "Preserve all original formatting including paragraphs, bullet points, and headings.")
    } else {
        result = strings.ReplaceAll(result, "{{.PreserveFormatNote}}", "")
    }
    return result
}

// PromptLoader 提示词加载器（带文件变更热重载）
type PromptLoader struct {
    mu       sync.RWMutex
    promptDir string
    cache    map[string]*Prompt
    ttl      time.Duration  // 缓存 TTL（默认60秒，开发模式0秒不缓存）
}

func NewPromptLoader(promptDir string, ttl time.Duration) *PromptLoader {
    return &PromptLoader{
        promptDir: promptDir,
        cache:     make(map[string]*Prompt),
        ttl:       ttl,
    }
}

// Load 按模式加载提示词（带缓存）
// 文件名约定：prompts/humanize-{mode}.md
func (l *PromptLoader) Load(mode string) (*Prompt, error) {
    l.mu.RLock()
    cached, ok := l.cache[mode]
    l.mu.RUnlock()

    // 命中缓存且未过期
    if ok && l.ttl > 0 && time.Since(cached.LoadedAt) < l.ttl {
        return cached, nil
    }

    // 读取文件
    filename := fmt.Sprintf("humanize-%s.md", mode)
    path := filepath.Join(l.promptDir, filename)
    content, err := os.ReadFile(path)
    if err != nil {
        return nil, fmt.Errorf("prompt file '%s' not found: %w", path, err)
    }

    prompt, err := parsePromptMD(mode, string(content))
    if err != nil {
        return nil, err
    }

    l.mu.Lock()
    l.cache[mode] = prompt
    l.mu.Unlock()

    return prompt, nil
}

// parsePromptMD 解析 .md 提示词文件
// 格式约定：
//   # SYSTEM
//   <系统提示词>
//
//   # USER
//   <用户提示词模板>
func parsePromptMD(mode, content string) (*Prompt, error) {
    parts := strings.SplitN(content, "\n# USER\n", 2)
    if len(parts) != 2 {
        return nil, fmt.Errorf("prompt file for mode '%s' must contain '# USER' section", mode)
    }

    system := strings.TrimPrefix(strings.TrimSpace(parts[0]), "# SYSTEM\n")
    system  = strings.TrimSpace(system)
    userTpl := strings.TrimSpace(parts[1])

    return &Prompt{
        Mode:     mode,
        System:   system,
        UserTpl:  userTpl,
        LoadedAt: time.Now(),
    }, nil
}

// InvalidateCache 手动使缓存失效（用于热更新提示词）
func (l *PromptLoader) InvalidateCache(mode string) {
    l.mu.Lock()
    defer l.mu.Unlock()
    if mode == "" {
        l.cache = make(map[string]*Prompt)
    } else {
        delete(l.cache, mode)
    }
}
```

---

## 6. OpenAI Provider 实现（参考实现）

```go
// internal/ai/providers/openai.go
package providers

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
    ai "toolboxnova/internal/ai"
    "toolboxnova/internal/config"
)

type OpenAIProvider struct {
    cfg    config.OpenAIConfig
    client *http.Client
}

func NewOpenAIProvider(cfg config.OpenAIConfig) *OpenAIProvider {
    return &OpenAIProvider{
        cfg: cfg,
        client: &http.Client{
            Timeout: 120 * time.Second,
        },
    }
}

func (p *OpenAIProvider) Name() string       { return "openai" }
func (p *OpenAIProvider) Available() bool    { return p.cfg.APIKey != "" }

// HumanizeStream 流式调用 OpenAI Chat Completions
func (p *OpenAIProvider) HumanizeStream(ctx context.Context, req ai.HumanizeRequest, writer io.Writer) error {
    payload := map[string]interface{}{
        "model":  p.cfg.Model, // 如 "gpt-4o"
        "stream": true,
        "messages": []map[string]string{
            {"role": "system",  "content": req.SystemPrompt},
            {"role": "user",    "content": req.UserPrompt},
        },
        "temperature": modeToTemperature(req.Mode),
        "max_tokens":  8192,
    }

    body, _ := json.Marshal(payload)
    httpReq, err := http.NewRequestWithContext(ctx, "POST",
        "https://api.openai.com/v1/chat/completions",
        bytes.NewBuffer(body))
    if err != nil { return err }

    httpReq.Header.Set("Authorization", "Bearer "+p.cfg.APIKey)
    httpReq.Header.Set("Content-Type", "application/json")

    resp, err := p.client.Do(httpReq)
    if err != nil { return err }
    defer resp.Body.Close()

    if resp.StatusCode != 200 {
        errBody, _ := io.ReadAll(resp.Body)
        return fmt.Errorf("OpenAI API error %d: %s", resp.StatusCode, string(errBody))
    }

    // 解析 SSE 流并转发给前端
    scanner := bufio.NewScanner(resp.Body)
    for scanner.Scan() {
        line := scanner.Text()
        if !strings.HasPrefix(line, "data: ") { continue }
        data := line[6:]
        if data == "[DONE]" {
            fmt.Fprintf(writer, "data: [DONE]\n\n")
            break
        }

        var chunk map[string]interface{}
        if err := json.Unmarshal([]byte(data), &chunk); err != nil { continue }

        // 提取 delta.content
        if choices, ok := chunk["choices"].([]interface{}); ok && len(choices) > 0 {
            choice := choices[0].(map[string]interface{})
            if delta, ok := choice["delta"].(map[string]interface{}); ok {
                if content, ok := delta["content"].(string); ok && content != "" {
                    // 转发 SSE token 给前端
                    fmt.Fprintf(writer, "data: %s\n\n", content)
                    if f, ok := writer.(http.Flusher); ok { f.Flush() }
                }
            }
        }
    }
    return scanner.Err()
}

// Detect 使用 GPT-4 进行 AI 内容检测
func (p *OpenAIProvider) Detect(ctx context.Context, req ai.DetectRequest) (*ai.DetectResponse, error) {
    // 加载检测提示词（从 prompts/detect-ai.md）
    // ... 实现省略，结构与 HumanizeStream 类似
    // 返回 JSON 格式：{"ai_score": 0.85, "human_score": 0.15, "label": "ai"}
    return nil, nil // 替换为实际实现
}

// modeToTemperature 根据模式返回温度参数
func modeToTemperature(mode string) float64 {
    switch mode {
    case "basic":      return 0.5
    case "standard":   return 0.7
    case "aggressive": return 0.9
    case "academic":   return 0.6
    case "creative":   return 1.0
    case "business":   return 0.5
    default:           return 0.7
    }
}
```

---

## 7. SSE Handler

```go
// internal/handler/ai/humanize_stream.go
package ai

import (
    "fmt"
    "net/http"
    "github.com/gin-gonic/gin"
    aiengine "toolboxnova/internal/ai"
)

// HumanizeStreamHandler GET /api/ai/humanize/stream（SSE）
// 也可用 POST + Transfer-Encoding: chunked
func HumanizeStreamHandler(c *gin.Context) {
    // 设置 SSE 响应头
    c.Header("Content-Type", "text/event-stream")
    c.Header("Cache-Control", "no-cache")
    c.Header("Connection", "keep-alive")
    c.Header("X-Accel-Buffering", "no") // 禁用 Nginx 缓冲

    // 解析请求体（从 query 或 body）
    var req aiengine.HumanizeRequest
    if err := c.ShouldBind(&req); err != nil {
        fmt.Fprintf(c.Writer, "event: error\ndata: invalid request\n\n")
        return
    }

    // 限制字数
    wordCount := countWords(req.Text)
    if wordCount > 10000 {
        fmt.Fprintf(c.Writer, "event: error\ndata: text too long\n\n")
        return
    }

    ctx := c.Request.Context()
    strategy := c.MustGet("aiStrategy").(*aiengine.HumanizeStrategy)

    // 流式处理
    if err := strategy.HumanizeStream(ctx, req, c.Writer); err != nil {
        fmt.Fprintf(c.Writer, "event: error\ndata: %s\n\n", err.Error())
    }

    // 发送完成信号
    fmt.Fprintf(c.Writer, "data: [DONE]\n\n")
    c.Writer.(http.Flusher).Flush()
}

// HumanizeHandler POST /api/ai/humanize（非流式，兼容旧客户端）
func HumanizeHandler(c *gin.Context) {
    var req aiengine.HumanizeRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": "invalid request", "message": err.Error()})
        return
    }

    strategy := c.MustGet("aiStrategy").(*aiengine.HumanizeStrategy)
    resp, err := strategy.Humanize(c.Request.Context(), req)
    if err != nil {
        c.JSON(500, gin.H{"error": "humanize failed", "message": err.Error()})
        return
    }

    c.JSON(200, gin.H{
        "text":       resp.Text,
        "tokens_in":  resp.TokensIn,
        "tokens_out": resp.TokensOut,
    })
}

// DetectHandler POST /api/ai/detect
func DetectHandler(c *gin.Context) {
    var req aiengine.DetectRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": "invalid request"})
        return
    }

    strategy := c.MustGet("aiStrategy").(*aiengine.HumanizeStrategy)
    resp, err := strategy.Detect(c.Request.Context(), req)
    if err != nil {
        c.JSON(500, gin.H{"error": "detection failed", "message": err.Error()})
        return
    }

    c.JSON(200, resp)
}
```

---

## 8. 配置文件结构

```go
// internal/config/ai.go
package config

type AIConfig struct {
    // 默认提供商（覆盖策略自动选择）
    ForceProvider  string `yaml:"force_provider" env:"AI_FORCE_PROVIDER"`
    // 检测专用提供商
    DetectProvider string `yaml:"detect_provider" env:"AI_DETECT_PROVIDER" default:"openai"`

    OpenAI    OpenAIConfig    `yaml:"openai"`
    Anthropic AnthropicConfig `yaml:"anthropic"`
    Google    GoogleConfig    `yaml:"google"`
    DeepSeek  DeepSeekConfig  `yaml:"deepseek"`

    // 提示词目录
    PromptDir string `yaml:"prompt_dir" default:"./prompts"`
    // 提示词缓存 TTL（开发模式设为0s）
    PromptCacheTTL string `yaml:"prompt_cache_ttl" default:"60s"`
}

type OpenAIConfig struct {
    APIKey  string `yaml:"api_key"  env:"OPENAI_API_KEY"`
    Model   string `yaml:"model"    env:"OPENAI_MODEL"   default:"gpt-4o"`
    BaseURL string `yaml:"base_url" env:"OPENAI_BASE_URL" default:"https://api.openai.com"`
}

type AnthropicConfig struct {
    APIKey string `yaml:"api_key" env:"ANTHROPIC_API_KEY"`
    Model  string `yaml:"model"   env:"ANTHROPIC_MODEL"   default:"claude-sonnet-4-6"`
}

type GoogleConfig struct {
    APIKey string `yaml:"api_key" env:"GOOGLE_API_KEY"`
    Model  string `yaml:"model"   env:"GOOGLE_MODEL"   default:"gemini-1.5-pro"`
}

type DeepSeekConfig struct {
    APIKey  string `yaml:"api_key"  env:"DEEPSEEK_API_KEY"`
    Model   string `yaml:"model"    env:"DEEPSEEK_MODEL"   default:"deepseek-chat"`
    BaseURL string `yaml:"base_url" env:"DEEPSEEK_BASE_URL" default:"https://api.deepseek.com"`
}
```

```yaml
# config/ai.yaml（示例）
ai:
  force_provider: ""           # 留空则由策略自动选择
  detect_provider: "openai"
  prompt_dir: "./prompts"
  prompt_cache_ttl: "60s"

  openai:
    api_key: "${OPENAI_API_KEY}"
    model: "gpt-4o"

  anthropic:
    api_key: "${ANTHROPIC_API_KEY}"
    model: "claude-sonnet-4-6"

  google:
    api_key: "${GOOGLE_API_KEY}"
    model: "gemini-1.5-pro"

  deepseek:
    api_key: "${DEEPSEEK_API_KEY}"
    model: "deepseek-chat"
    base_url: "https://api.deepseek.com"
```

---

## 9. 验收标准 Checklist

### 策略 + 工厂
- [ ] 新增 Provider 只需实现 `AIProvider` 接口并在 `factory.registerAll()` 中注册，无需改其他代码
- [ ] `ForceProvider` 配置项生效：强制指定后所有模式都使用该 Provider
- [ ] Provider 不可用时（API Key 为空）自动 fallback 到下一个可用 Provider
- [ ] 所有 4 个 Provider（OpenAI / Anthropic / Google / DeepSeek）单元测试通过

### Prompt 加载器
- [ ] 修改 `prompts/humanize-aggressive.md` 文件后，60秒内（一个 TTL 周期）新请求使用新提示词
- [ ] 开发模式（TTL=0）下每次请求都重新读取文件（热重载）
- [ ] 提示词文件不存在时返回 500 + 明确错误信息，不 panic
- [ ] `# SYSTEM` / `# USER` 分区解析正确

### SSE 流式
- [ ] 前端 `EventSource` 正确接收每个 `data:` 事件
- [ ] 客户端断开连接时（ctx cancel）后端停止生成
- [ ] `[DONE]` 信号正确发送，前端 `readStream()` 正确退出
- [ ] Nginx 反代场景下 `X-Accel-Buffering: no` 已设置

### 限流 & 安全
- [ ] 超过 10000 词的请求返回 400
- [ ] 每 IP 每分钟限流 60 次，超出返回 429
- [ ] CaptchaEnabled=true 时，未携带 captchaToken 的请求返回 400
