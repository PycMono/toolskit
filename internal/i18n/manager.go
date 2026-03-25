package i18n

import (
	"fmt"
	"sync"
)

// Manager 是 i18n 核心管理器，负责管理所有语言和命名空间。
// 线程安全，支持热重载。
type Manager struct {
	mu          sync.RWMutex
	defaultLang string
	fallbacks   map[string][]string // lang -> fallback 语言链
	messages    map[string]Messages // lang -> 扁平化 key->value（合并所有命名空间文件）
	loader      *Loader
}

// Messages 是某语言所有 key 的扁平化翻译 map。
// 支持两种 key 格式：
//   - 完整路径: "img.resize.hero.title"（当前文件中直接存储）
//   - 命名空间分片后: "hero.title"（从 img-resize.json 加载，Loader 不追加前缀）
type Messages map[string]string

// Config 管理器配置
type Config struct {
	// LocalesDir 是语言文件根目录。
	// 支持两种布局（自动识别）：
	//   布局A（当前）: {LocalesDir}/{lang}.json         → e.g. i18n/zh.json
	//   布局B（分片）: {LocalesDir}/{lang}/{ns}.json    → e.g. i18n/zh/img-resize.json
	LocalesDir string

	// DefaultLang 是最终 fallback 语言，找不到 key 时的兜底
	DefaultLang string

	// Fallbacks 语言 fallback 链配置
	// 例: {"zh-TW": ["zh", "en"], "ja-JP": ["ja", "en"]}
	Fallbacks map[string][]string

	// SupportedLangs 明确声明支持的语言列表（用于语言检测）
	// 留空时从加载的文件中自动推断
	SupportedLangs []string
}

// NewManager 创建并初始化管理器，启动时全量加载所有语言文件
func NewManager(cfg Config) (*Manager, error) {
	m := &Manager{
		defaultLang: cfg.DefaultLang,
		fallbacks:   cfg.Fallbacks,
		messages:    make(map[string]Messages),
		loader:      NewLoader(cfg.LocalesDir),
	}
	if m.fallbacks == nil {
		m.fallbacks = make(map[string][]string)
	}
	if err := m.load(); err != nil {
		return nil, err
	}
	return m, nil
}

// load 从磁盘全量加载，写时加锁
func (m *Manager) load() error {
	data, err := m.loader.LoadAll()
	if err != nil {
		return fmt.Errorf("i18n: load failed: %w", err)
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	m.messages = data
	return nil
}

// Reload 热重载，清空缓存重新读取所有文件（可由 HTTP endpoint 或 fsnotify 触发）
func (m *Manager) Reload() error {
	return m.load()
}

// Translator 返回指定语言的翻译器（轻量级，不持有锁）
func (m *Manager) Translator(lang string) *Translator {
	chain := m.buildFallbackChain(lang)
	return &Translator{
		manager: m,
		lang:    lang,
		chain:   chain,
	}
}

// SupportedLangs 返回已加载的语言列表
func (m *Manager) SupportedLangs() []string {
	m.mu.RLock()
	defer m.mu.RUnlock()
	langs := make([]string, 0, len(m.messages))
	for lang := range m.messages {
		langs = append(langs, lang)
	}
	return langs
}

// buildFallbackChain 构建 fallback 语言链（去重）
// 例: "zh-TW" → ["zh-TW", "zh", "en"]
func (m *Manager) buildFallbackChain(lang string) []string {
	chain := []string{lang}
	if fallbacks, ok := m.fallbacks[lang]; ok {
		chain = append(chain, fallbacks...)
	}
	if lang != m.defaultLang {
		chain = append(chain, m.defaultLang)
	}
	// 去重，保持顺序
	seen := make(map[string]bool, len(chain))
	result := make([]string, 0, len(chain))
	for _, l := range chain {
		if !seen[l] {
			seen[l] = true
			result = append(result, l)
		}
	}
	return result
}

// lookup 在 fallback 链中查找 key（读锁）
func (m *Manager) lookup(chain []string, key string) (string, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	for _, lang := range chain {
		if msgs, ok := m.messages[lang]; ok {
			if val, ok := msgs[key]; ok {
				return val, true
			}
		}
	}
	return "", false
}

