package i18n

import (
	"net/http"
	"strings"
)

// langAliases maps common Accept-Language / BCP-47 codes to the project's
// internal language codes when they differ (e.g. "es" → "spa").
// Keys are lowercase; values must match a code in supportedLangs.
var langAliases = map[string]string{
	"es":     "spa",
	"es-es":  "spa",
	"es-419": "spa",
	"es-mx":  "spa",
	"es-ar":  "spa",
	"es-co":  "spa",
	"es-cl":  "spa",
}

// Detector 从 HTTP 请求中检测用户语言偏好。
// 优先级: URL ?lang= > Cookie(lang) > Accept-Language > defaultLang
type Detector struct {
	supported   map[string]string // 规范化 lower-key → internal lang code
	defaultLang string
}

// NewDetector 创建语言检测器。
func NewDetector(supported []string, defaultLang string) *Detector {
	m := make(map[string]string, len(supported)*3)
	for _, l := range supported {
		lower := strings.ToLower(l)
		m[lower] = l
		base := strings.SplitN(lower, "-", 2)[0]
		if _, exists := m[base]; !exists {
			m[base] = l
		}
	}
	return &Detector{supported: m, defaultLang: defaultLang}
}

// Detect 按优先级检测请求语言，始终返回一个受支持的语言代码
func (d *Detector) Detect(r *http.Request) string {
	if lang := r.URL.Query().Get("lang"); lang != "" {
		if l := d.resolve(lang); l != "" {
			return l
		}
	}
	if cookie, err := r.Cookie("lang"); err == nil && cookie.Value != "" {
		if l := d.resolve(cookie.Value); l != "" {
			return l
		}
	}
	if lang := d.parseAcceptLanguage(r.Header.Get("Accept-Language")); lang != "" {
		return lang
	}
	return d.defaultLang
}

// resolve 将任意语言标识解析为已支持的规范代码，找不到返回 ""
func (d *Detector) resolve(lang string) string {
	lower := strings.ToLower(lang)
	// 0. 全局别名表（例如 es → spa）
	if alias, ok := langAliases[lower]; ok {
		if l, ok2 := d.supported[strings.ToLower(alias)]; ok2 {
			return l
		}
	}
	// 1. 精确匹配
	if l, ok := d.supported[lower]; ok {
		return l
	}
	// 2. 主语言部分匹配: "zh-TW" → "zh"
	base := strings.SplitN(lower, "-", 2)[0]
	if alias, ok := langAliases[base]; ok {
		if l, ok2 := d.supported[strings.ToLower(alias)]; ok2 {
			return l
		}
	}
	if l, ok := d.supported[base]; ok {
		return l
	}
	// 3. 前缀匹配
	for k, v := range d.supported {
		if strings.HasPrefix(k, base+"-") {
			return v
		}
	}
	return ""
}

// parseAcceptLanguage 解析 Accept-Language: "zh-CN,zh;q=0.9,en;q=0.8"
func (d *Detector) parseAcceptLanguage(header string) string {
	if header == "" {
		return ""
	}
	for _, part := range strings.Split(header, ",") {
		tag := strings.TrimSpace(strings.SplitN(part, ";", 2)[0])
		if l := d.resolve(tag); l != "" {
			return l
		}
	}
	return ""
}

// IsSupported 检查语言代码是否受支持
func (d *Detector) IsSupported(lang string) bool {
	return d.resolve(lang) != ""
}
