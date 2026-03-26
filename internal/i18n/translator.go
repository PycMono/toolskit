package i18n

import (
	"fmt"
)

// Translator 是请求级别的翻译器，轻量级，不持有锁。
// 每个请求创建一个实例，通过 Manager.Translator(lang) 获取。
type Translator struct {
	manager *Manager
	lang    string
	chain   []string // fallback 语言链，e.g. ["zh-TW","zh","en"]
}

// T 翻译一个 key，未找到时返回 key 本身（永不 panic）。
//
// key 格式完全透明，Translator 不做任何拆分 —— 直接用完整 key 查找。
// 这样既兼容当前的 "img.resize.hero.title" 扁平 key，
// 也兼容未来分片后仅含短路径 "hero.title" 的 key。
//
// 用法（模板中）:
//
//	{{ call .T "img.resize.hero.title" }}
//
// 用法（Go 代码中）:
//
//	title := translator.T("img.resize.hero.title")
func (t *Translator) T(key string) string {
	if val, ok := t.manager.lookup(t.chain, key); ok {
		return val
	}
	return key // fallback: 返回 key 本身，便于调试
}

// TF 带 fmt.Sprintf 插值的翻译。
// JSON: "hello": "Hello, %s! You have %d messages."
// 用法: translator.TF("hello", "Alice", 5)
func (t *Translator) TF(key string, args ...interface{}) string {
	val := t.T(key)
	if len(args) == 0 {
		return val
	}
	return fmt.Sprintf(val, args...)
}

// TN 复数翻译。
// JSON 中需要定义 key.one 和 key.other 两个子 key：
//
//	"items.one":   "%d item"
//	"items.other": "%d items"
//
// 用法: translator.TN("items", 3) → "3 items"
func (t *Translator) TN(key string, n int) string {
	var pluralKey string
	if n == 1 {
		pluralKey = key + ".one"
	} else {
		pluralKey = key + ".other"
	}
	// 如果复数 key 不存在，fallback 到基础 key
	if val, ok := t.manager.lookup(t.chain, pluralKey); ok {
		return fmt.Sprintf(val, n)
	}
	return fmt.Sprintf(t.T(key), n)
}

// TFN 带插值的复数翻译（TF + TN 组合）。
// JSON: "cart.items.one": "1 item in cart", "cart.items.other": "%d items in cart"
func (t *Translator) TFN(key string, n int, args ...interface{}) string {
	var pluralKey string
	if n == 1 {
		pluralKey = key + ".one"
	} else {
		pluralKey = key + ".other"
	}
	val := t.T(pluralKey)
	if len(args) == 0 {
		return fmt.Sprintf(val, n)
	}
	return fmt.Sprintf(val, args...)
}

// TWith 指定命名空间翻译。与 T() 的区别是：T() 用完整 key（含命名空间前缀）查找，
// 而 TWith() 允许传入独立的 namespace + subKey，适合动态拼接场景。
// 示例: TWith("common", "button.submit") 等价于 T("common.button.submit")
func (t *Translator) TWith(namespace, key string) string {
	fullKey := namespace + "." + key
	if val, ok := t.manager.lookup(t.chain, fullKey); ok {
		return val
	}
	return fullKey
}

// Has 检查 key 是否存在于当前语言链中（不触发 fallback 返回 key 本身的逻辑）
func (t *Translator) Has(key string) bool {
	_, ok := t.manager.lookup(t.chain, key)
	return ok
}

// Lang 返回当前请求的语言代码，e.g. "zh", "en", "ja"
func (t *Translator) Lang() string {
	return t.lang
}

// FuncT 返回可直接用于 gin.H 或模板 FuncMap 的翻译函数。
// 这是兼容旧代码的关键适配器：
//
//	c.Set("T", translator.FuncT())   ← 注入方式与旧代码完全一致
//	{{ call .T "key" }}              ← 模板调用方式不变
func (t *Translator) FuncT() func(string) string {
	return t.T
}

// All 返回当前语言（含 fallback 链）的完整扁平 key→value map。
// 用于中间件将 "translations" 注入 gin.Context，供 JS 端使用。
// 高优先级语言的 key 会覆盖低优先级语言的同名 key。
func (t *Translator) All() map[string]string {
	t.manager.mu.RLock()
	defer t.manager.mu.RUnlock()

	// 估算容量
	size := 0
	for _, lang := range t.chain {
		if msgs, ok := t.manager.messages[lang]; ok {
			size += len(msgs)
		}
	}
	merged := make(map[string]string, size)
	// 从低优先级到高优先级写入（后写覆盖先写）
	for i := len(t.chain) - 1; i >= 0; i-- {
		lang := t.chain[i]
		if msgs, ok := t.manager.messages[lang]; ok {
			for k, v := range msgs {
				merged[k] = v
			}
		}
	}
	return merged
}

// IsRTL 判断当前语言是否为从右到左书写
func (t *Translator) IsRTL() bool {
	rtlLangs := map[string]bool{
		"ar": true, "ar-SA": true, "ar-EG": true,
		"he": true, "he-IL": true,
		"fa": true, "fa-IR": true,
		"ur": true, "ur-PK": true,
	}
	return rtlLangs[t.lang]
}

