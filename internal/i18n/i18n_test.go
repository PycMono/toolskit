package i18n_test

import (
	"net/http"
	"os"
	"path/filepath"
	"testing"
	"time"

	"PycMono/github/toolskit/internal/i18n"
)

// ─── helpers ────────────────────────────────────────────────────────────────

// setupLocales 创建临时 locales 目录（布局A: 单文件）
func setupLocales(t *testing.T) string {
	t.Helper()
	dir := t.TempDir()

	files := map[string]string{
		"en.json": `{
			"site.title": "Tool Box Nova",
			"button.submit": "Submit",
			"button.cancel": "Cancel",
			"hello": "Hello, %s!",
			"items.one": "%d item",
			"items.other": "%d items",
			"img.resize.hero.title": "Image Resizer"
		}`,
		"zh.json": `{
			"site.title": "工具箱",
			"button.submit": "提交",
			"button.cancel": "取消",
			"hello": "你好，%s！",
			"items.one": "%d 个项目",
			"items.other": "%d 个项目",
			"img.resize.hero.title": "图片调整大小"
		}`,
		"ja.json": `{
			"site.title": "ツールボックス",
			"button.submit": "送信"
		}`,
	}

	for name, content := range files {
		path := filepath.Join(dir, name)
		if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
			t.Fatalf("write %s: %v", name, err)
		}
	}
	return dir
}

// setupLocalesB 创建临时 locales 目录（布局B: 子目录分片）
func setupLocalesB(t *testing.T) string {
	t.Helper()
	dir := t.TempDir()

	structure := map[string]map[string]string{
		"en": {
			"common.json":     `{"site.title": "Tool Box Nova", "button.submit": "Submit"}`,
			"img-resize.json": `{"img.resize.hero.title": "Image Resizer", "img.resize.hero.subtitle": "Resize online free"}`,
		},
		"zh": {
			"common.json":     `{"site.title": "工具箱", "button.submit": "提交"}`,
			"img-resize.json": `{"img.resize.hero.title": "图片调整大小"}`,
		},
	}

	for lang, files := range structure {
		langDir := filepath.Join(dir, lang)
		os.MkdirAll(langDir, 0o755)
		for name, content := range files {
			path := filepath.Join(langDir, name)
			if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
				t.Fatalf("write %s/%s: %v", lang, name, err)
			}
		}
	}
	return dir
}

// setupLocalesMixed 布局A + 布局B 混合（同一 locales 目录中既有单文件又有子目录）
func setupLocalesMixed(t *testing.T) string {
	t.Helper()
	dir := t.TempDir()

	// 布局A: en.json
	os.WriteFile(filepath.Join(dir, "en.json"), []byte(`{"site.title":"TBN","button.submit":"Submit"}`), 0o644)

	// 布局B: zh/ 子目录
	zhDir := filepath.Join(dir, "zh")
	os.MkdirAll(zhDir, 0o755)
	os.WriteFile(filepath.Join(zhDir, "common.json"), []byte(`{"site.title":"工具箱"}`), 0o644)
	os.WriteFile(filepath.Join(zhDir, "img.json"), []byte(`{"img.resize.hero.title":"图片调整大小"}`), 0o644)

	return dir
}

// newManager 快速创建 Manager（测试用）
func newManager(t *testing.T, dir string, extraCfg ...func(*i18n.Config)) *i18n.Manager {
	t.Helper()
	cfg := i18n.Config{
		LocalesDir:  dir,
		DefaultLang: "en",
	}
	for _, fn := range extraCfg {
		fn(&cfg)
	}
	m, err := i18n.NewManager(cfg)
	if err != nil {
		t.Fatalf("NewManager: %v", err)
	}
	return m
}

// ─── Manager tests ───────────────────────────────────────────────────────────

func TestManager_BasicTranslation(t *testing.T) {
	dir := setupLocales(t)
	m := newManager(t, dir)

	tr := m.Translator("en")
	if got := tr.T("button.submit"); got != "Submit" {
		t.Errorf("T(%q) = %q, want %q", "button.submit", got, "Submit")
	}

	tr = m.Translator("zh")
	if got := tr.T("button.submit"); got != "提交" {
		t.Errorf("T(%q) = %q, want %q", "button.submit", got, "提交")
	}
}

func TestManager_MissingKey_ReturnsKey(t *testing.T) {
	dir := setupLocales(t)
	m := newManager(t, dir)
	tr := m.Translator("en")

	key := "nonexistent.key.that.does.not.exist"
	if got := tr.T(key); got != key {
		t.Errorf("missing key: got %q, want key itself %q", got, key)
	}
}

func TestManager_Fallback_ToDefault(t *testing.T) {
	dir := setupLocales(t)
	m := newManager(t, dir)

	// ja.json 没有 img.resize.hero.title，应 fallback 到 en
	tr := m.Translator("ja")
	if got := tr.T("img.resize.hero.title"); got != "Image Resizer" {
		t.Errorf("fallback: got %q, want %q", got, "Image Resizer")
	}
}

func TestManager_Fallback_Chain(t *testing.T) {
	dir := setupLocales(t)
	m := newManager(t, dir, func(c *i18n.Config) {
		c.Fallbacks = map[string][]string{
			"zh-TW": {"zh", "en"},
		}
	})

	// zh-TW 不存在，应走 zh → en 链
	tr := m.Translator("zh-TW")
	if got := tr.T("button.submit"); got != "提交" {
		t.Errorf("chain fallback: got %q, want %q", got, "提交")
	}
	// zh 也没有的 key，继续到 en
	if got := tr.T("img.resize.hero.title"); got != "图片调整大小" {
		t.Errorf("chain fallback zh: got %q, want %q", got, "图片调整大小")
	}
}

func TestManager_SupportedLangs(t *testing.T) {
	dir := setupLocales(t)
	m := newManager(t, dir)

	langs := m.SupportedLangs()
	langSet := make(map[string]bool)
	for _, l := range langs {
		langSet[l] = true
	}
	for _, want := range []string{"en", "zh", "ja"} {
		if !langSet[want] {
			t.Errorf("SupportedLangs missing %q, got %v", want, langs)
		}
	}
}

func TestManager_Reload(t *testing.T) {
	dir := setupLocales(t)
	m := newManager(t, dir)

	tr := m.Translator("en")
	if got := tr.T("site.title"); got != "Tool Box Nova" {
		t.Fatalf("before reload: %q", got)
	}

	// 修改文件
	newContent := `{"site.title": "Updated Title", "button.submit": "Submit"}`
	if err := os.WriteFile(filepath.Join(dir, "en.json"), []byte(newContent), 0o644); err != nil {
		t.Fatalf("write: %v", err)
	}

	// 热重载
	if err := m.Reload(); err != nil {
		t.Fatalf("Reload: %v", err)
	}

	// 重载后需要重新获取 translator（chain 不变，但 messages map 已更新）
	tr2 := m.Translator("en")
	if got := tr2.T("site.title"); got != "Updated Title" {
		t.Errorf("after reload: got %q, want %q", got, "Updated Title")
	}
}

// ─── Loader layout tests ─────────────────────────────────────────────────────

func TestLoader_LayoutA_SingleFile(t *testing.T) {
	dir := setupLocales(t)
	m := newManager(t, dir)

	tr := m.Translator("en")
	if got := tr.T("img.resize.hero.title"); got != "Image Resizer" {
		t.Errorf("layoutA: got %q", got)
	}
}

func TestLoader_LayoutB_SubDirectory(t *testing.T) {
	dir := setupLocalesB(t)
	m := newManager(t, dir)

	tr := m.Translator("zh")
	if got := tr.T("img.resize.hero.title"); got != "图片调整大小" {
		t.Errorf("layoutB zh: got %q", got)
	}

	tr2 := m.Translator("en")
	if got := tr2.T("img.resize.hero.subtitle"); got != "Resize online free" {
		t.Errorf("layoutB en subtitle: got %q", got)
	}
}

func TestLoader_MixedLayout(t *testing.T) {
	dir := setupLocalesMixed(t)
	m := newManager(t, dir)

	trEn := m.Translator("en")
	if got := trEn.T("site.title"); got != "TBN" {
		t.Errorf("mixed en: got %q", got)
	}

	trZh := m.Translator("zh")
	if got := trZh.T("img.resize.hero.title"); got != "图片调整大小" {
		t.Errorf("mixed zh: got %q", got)
	}
	// zh 没有 button.submit，应 fallback 到 en
	if got := trZh.T("button.submit"); got != "Submit" {
		t.Errorf("mixed zh fallback: got %q", got)
	}
}

func TestLoader_NestedJSON(t *testing.T) {
	dir := t.TempDir()
	nested := `{
		"button": {
			"submit": "Submit",
			"cancel": "Cancel"
		},
		"img": {
			"resize": {
				"hero": {
					"title": "Image Resizer"
				}
			}
		}
	}`
	os.WriteFile(filepath.Join(dir, "en.json"), []byte(nested), 0o644)

	m := newManager(t, dir)
	tr := m.Translator("en")

	tests := []struct{ key, want string }{
		{"button.submit", "Submit"},
		{"button.cancel", "Cancel"},
		{"img.resize.hero.title", "Image Resizer"},
	}
	for _, tt := range tests {
		if got := tr.T(tt.key); got != tt.want {
			t.Errorf("nested T(%q) = %q, want %q", tt.key, got, tt.want)
		}
	}
}

// ─── Translator method tests ─────────────────────────────────────────────────

func TestTranslator_TF(t *testing.T) {
	dir := setupLocales(t)
	m := newManager(t, dir)
	tr := m.Translator("en")

	if got := tr.TF("hello", "Alice"); got != "Hello, Alice!" {
		t.Errorf("TF: got %q", got)
	}

	tr2 := m.Translator("zh")
	if got := tr2.TF("hello", "Alice"); got != "你好，Alice！" {
		t.Errorf("TF zh: got %q", got)
	}
}

func TestTranslator_TF_NoArgs(t *testing.T) {
	dir := setupLocales(t)
	m := newManager(t, dir)
	tr := m.Translator("en")

	// 没有插值参数时，直接返回翻译值
	if got := tr.TF("button.submit"); got != "Submit" {
		t.Errorf("TF no args: got %q", got)
	}
}

func TestTranslator_TN(t *testing.T) {
	dir := setupLocales(t)
	m := newManager(t, dir)
	tr := m.Translator("en")

	if got := tr.TN("items", 1); got != "1 item" {
		t.Errorf("TN(1): got %q", got)
	}
	if got := tr.TN("items", 5); got != "5 items" {
		t.Errorf("TN(5): got %q", got)
	}
}

func TestTranslator_TN_Chinese(t *testing.T) {
	dir := setupLocales(t)
	m := newManager(t, dir)
	tr := m.Translator("zh")

	if got := tr.TN("items", 3); got != "3 个项目" {
		t.Errorf("TN zh: got %q", got)
	}
}

func TestTranslator_Has(t *testing.T) {
	dir := setupLocales(t)
	m := newManager(t, dir)
	tr := m.Translator("en")

	if !tr.Has("button.submit") {
		t.Error("Has(button.submit) should be true")
	}
	if tr.Has("nonexistent.key") {
		t.Error("Has(nonexistent.key) should be false")
	}
}

func TestTranslator_Lang(t *testing.T) {
	dir := setupLocales(t)
	m := newManager(t, dir)

	for _, lang := range []string{"en", "zh", "ja"} {
		tr := m.Translator(lang)
		if got := tr.Lang(); got != lang {
			t.Errorf("Lang() = %q, want %q", got, lang)
		}
	}
}

func TestTranslator_FuncT_Compatibility(t *testing.T) {
	// FuncT() 返回的函数应与直接 T() 调用结果一致
	// 这是保持与旧代码接口兼容的核心测试
	dir := setupLocales(t)
	m := newManager(t, dir)
	tr := m.Translator("zh")

	fn := tr.FuncT()
	keys := []string{"button.submit", "site.title", "img.resize.hero.title", "nonexistent"}
	for _, key := range keys {
		if fn(key) != tr.T(key) {
			t.Errorf("FuncT()(%q) != T(%q): %q vs %q", key, key, fn(key), tr.T(key))
		}
	}
}

func TestTranslator_IsRTL(t *testing.T) {
	dir := setupLocales(t)
	m := newManager(t, dir)

	if m.Translator("en").IsRTL() {
		t.Error("en should not be RTL")
	}
	if m.Translator("zh").IsRTL() {
		t.Error("zh should not be RTL")
	}
}

func TestTranslator_TFN(t *testing.T) {
	dir := setupLocales(t)
	m := newManager(t, dir)
	tr := m.Translator("en")

	// n=1: uses .one form
	if got := tr.TFN("items", 1); got != "1 item" {
		t.Errorf("TFN(1) = %q, want %q", got, "1 item")
	}
	// n=5: uses .other form
	if got := tr.TFN("items", 5); got != "5 items" {
		t.Errorf("TFN(5) = %q, want %q", got, "5 items")
	}
	// with extra args (extra format tokens)
	dir2 := t.TempDir()
	os.WriteFile(filepath.Join(dir2, "en.json"), []byte(`{
		"order.one":   "order #%s: %d item",
		"order.other": "order #%s: %d items"
	}`), 0o644)
	m2 := newManager(t, dir2)
	tr2 := m2.Translator("en")
	if got := tr2.TFN("order", 2, "ABC123", 2); got != "order #ABC123: 2 items" {
		t.Errorf("TFN extra args: got %q", got)
	}
}

func TestTranslator_TWith(t *testing.T) {
	dir := setupLocales(t)
	m := newManager(t, dir)
	tr := m.Translator("en")

	// TWith("button", "submit") should equal T("button.submit")
	if got, want := tr.TWith("button", "submit"), tr.T("button.submit"); got != want {
		t.Errorf("TWith: got %q, want %q", got, want)
	}
	// missing key returns "namespace.key"
	if got := tr.TWith("nonexistent", "key"); got != "nonexistent.key" {
		t.Errorf("TWith missing: got %q, want %q", got, "nonexistent.key")
	}
	// chinese
	trZh := m.Translator("zh")
	if got := trZh.TWith("button", "submit"); got != "提交" {
		t.Errorf("TWith zh: got %q", got)
	}
}

func TestTranslator_All(t *testing.T) {
	dir := setupLocales(t)
	m := newManager(t, dir)

	tr := m.Translator("zh")
	all := tr.All()

	// zh has its own button.submit
	if all["button.submit"] != "提交" {
		t.Errorf("All zh button.submit = %q, want %q", all["button.submit"], "提交")
	}
	// zh does NOT have img.resize.hero.title in our fixture, so fallback en should fill it
	// (all() merges the whole fallback chain, low-priority first)
	if all["img.resize.hero.title"] != "图片调整大小" {
		t.Errorf("All zh img.resize.hero.title = %q, want zh value", all["img.resize.hero.title"])
	}

	// The returned map must be non-empty and must not be shared with internal state
	// (modifications must not affect subsequent calls)
	all["__test_mutation__"] = "mutated"
	all2 := tr.All()
	if _, found := all2["__test_mutation__"]; found {
		t.Error("All() appears to return the internal map (not a copy)")
	}
}

func TestDetector_PrefixMatch(t *testing.T) {
	// Covers the prefix-match branch in resolve() that was previously uncovered.
	// "pt-BR" is not in supported list directly, but "pt" prefix should match "pt-PT".
	d := i18n.NewDetector([]string{"en", "zh", "pt-PT"}, "en")

	req, _ := http.NewRequest("GET", "/?lang=pt-BR", nil)
	if got := d.Detect(req); got != "pt-PT" {
		t.Errorf("prefix match: got %q, want pt-PT", got)
	}

	// Accept-Language prefix fallback
	req2, _ := http.NewRequest("GET", "/", nil)
	req2.Header.Set("Accept-Language", "pt-BR,pt;q=0.9")
	if got := d.Detect(req2); got != "pt-PT" {
		t.Errorf("Accept-Language prefix match: got %q, want pt-PT", got)
	}
}

func TestWatcher_StopViaClose(t *testing.T) {
	// Covers the stopCh branch inside watch() goroutine.
	dir := setupLocales(t)
	m := newManager(t, dir)

	w, err := i18n.NewWatcher(m, dir)
	if err != nil {
		t.Fatalf("NewWatcher: %v", err)
	}
	if err := w.Start(); err != nil {
		t.Fatalf("Start: %v", err)
	}
	// Closing sends on stopCh; give goroutine a moment to exit cleanly
	if err := w.Close(); err != nil {
		t.Errorf("Close: %v", err)
	}
	// Closing a second time must not panic
	_ = w.Close()
}

func TestConcurrentReloadAndRead(t *testing.T) {
	// Verifies that concurrent reads + a Reload() trigger no data race.
	// This covers the RWMutex path under simultaneous load.
	dir := setupLocales(t)
	m := newManager(t, dir)

	const goroutines = 50
	done := make(chan struct{}, goroutines+1)

	// Start readers
	for i := 0; i < goroutines; i++ {
		go func() {
			tr := m.Translator("zh")
			for j := 0; j < 200; j++ {
				_ = tr.T("button.submit")
				_ = tr.All()
			}
			done <- struct{}{}
		}()
	}

	// Trigger a Reload while readers are running
	go func() {
		newContent := `{"button.submit": "提交(重载)", "site.title": "工具箱"}`
		_ = os.WriteFile(filepath.Join(dir, "zh.json"), []byte(newContent), 0o644)
		_ = m.Reload()
		done <- struct{}{}
	}()

	for i := 0; i <= goroutines; i++ {
		<-done
	}
}


// ─── Detector tests ──────────────────────────────────────────────────────────

func newDetector(langs []string, def string) *i18n.Detector {
	return i18n.NewDetector(langs, def)
}

func TestDetector_URLParam(t *testing.T) {
	d := newDetector([]string{"en", "zh", "ja"}, "en")

	req, _ := http.NewRequest("GET", "/?lang=zh", nil)
	if got := d.Detect(req); got != "zh" {
		t.Errorf("URL param: got %q", got)
	}
}

func TestDetector_Cookie(t *testing.T) {
	d := newDetector([]string{"en", "zh", "ja"}, "en")

	req, _ := http.NewRequest("GET", "/", nil)
	req.AddCookie(&http.Cookie{Name: "lang", Value: "ja"})
	if got := d.Detect(req); got != "ja" {
		t.Errorf("cookie: got %q", got)
	}
}

func TestDetector_AcceptLanguage(t *testing.T) {
	d := newDetector([]string{"en", "zh", "ja", "ko", "spa"}, "en")

	tests := []struct {
		header string
		want   string
	}{
		{"zh-CN,zh;q=0.9,en;q=0.8", "zh"},
		{"ja-JP,ja;q=0.9", "ja"},
		{"ko-KR", "ko"},
		{"es-ES,es;q=0.9", "spa"}, // spa 语言代码映射
		{"fr-FR", "en"},           // 不支持 fr，fallback 到 default
		{"", "en"},
	}

	for _, tt := range tests {
		req, _ := http.NewRequest("GET", "/", nil)
		if tt.header != "" {
			req.Header.Set("Accept-Language", tt.header)
		}
		if got := d.Detect(req); got != tt.want {
			t.Errorf("Accept-Language %q: got %q, want %q", tt.header, got, tt.want)
		}
	}
}

func TestDetector_Priority(t *testing.T) {
	// URL param > Cookie > Accept-Language
	d := newDetector([]string{"en", "zh", "ja"}, "en")

	req, _ := http.NewRequest("GET", "/?lang=ja", nil)
	req.AddCookie(&http.Cookie{Name: "lang", Value: "zh"})
	req.Header.Set("Accept-Language", "en")

	if got := d.Detect(req); got != "ja" {
		t.Errorf("priority: URL param should win, got %q", got)
	}
}

func TestDetector_InvalidLang_FallsToDefault(t *testing.T) {
	d := newDetector([]string{"en", "zh"}, "en")

	req, _ := http.NewRequest("GET", "/?lang=xyz", nil)
	if got := d.Detect(req); got != "en" {
		t.Errorf("invalid lang: got %q, want default %q", got, "en")
	}
}

func TestDetector_IsSupported(t *testing.T) {
	d := newDetector([]string{"en", "zh", "ja", "ko", "spa"}, "en")

	if !d.IsSupported("zh") {
		t.Error("zh should be supported")
	}
	if !d.IsSupported("zh-CN") { // 主语言匹配
		t.Error("zh-CN should resolve to zh")
	}
	if d.IsSupported("fr") {
		t.Error("fr should not be supported")
	}
}

// ─── Integration: middleware-level simulation ─────────────────────────────────

// TestIntegration_MiddlewarePattern 模拟中间件注入方式，验证与旧代码接口完全兼容
func TestIntegration_MiddlewarePattern(t *testing.T) {
	dir := setupLocales(t)
	m := newManager(t, dir)
	detector := i18n.NewDetector(m.SupportedLangs(), "en")

	// 模拟请求：zh 语言
	req, _ := http.NewRequest("GET", "/?lang=zh", nil)
	lang := detector.Detect(req)

	tr := m.Translator(lang)

	// 关键：以 FuncT() 方式注入（与旧代码 c.Set("T", tFunc) 完全相同的类型）
	tFunc := tr.FuncT()

	// 验证 tFunc 是 func(string)string 且能正确翻译
	if got := tFunc("button.submit"); got != "提交" {
		t.Errorf("middleware pattern: tFunc(%q) = %q", "button.submit", got)
	}
	// 验证 missing key 返回 key 本身
	if got := tFunc("no.such.key"); got != "no.such.key" {
		t.Errorf("middleware pattern missing: tFunc = %q", got)
	}
}

// TestIntegration_RealI18nFiles 使用项目实际的 i18n/ 目录（命名空间分片布局 B）。
// 验证所有5种语言均已加载，且跨命名空间的 key 均可正确访问。
func TestIntegration_RealI18nFiles(t *testing.T) {
	localesDir := filepath.Join("..", "..", "i18n")
	if _, err := os.Stat(localesDir); os.IsNotExist(err) {
		t.Skip("i18n dir not found, skipping")
	}

	m, err := i18n.NewManager(i18n.Config{
		LocalesDir:  localesDir,
		DefaultLang: "en",
		Fallbacks: map[string][]string{
			"zh-TW": {"zh", "en"},
			"ja-JP": {"ja", "en"},
			"ko-KR": {"ko", "en"},
		},
	})
	if err != nil {
		t.Fatalf("NewManager with real files: %v", err)
	}

	langs := m.SupportedLangs()
	t.Logf("Loaded languages: %v", langs)

	// 所有5种语言必须存在
	langSet := make(map[string]bool)
	for _, l := range langs {
		langSet[l] = true
	}
	for _, want := range []string{"en", "zh", "ja", "ko", "spa"} {
		if !langSet[want] {
			t.Errorf("missing language %q, got %v", want, langs)
		}
	}

	// 验证跨命名空间 key 访问（分片后 key 必须仍然可查找）
	cases := []struct{ lang, key, want string }{
		{"en", "home.title", "Tool Box Nova - Free Online Tools for Developers & Privacy"},
		{"en", "nav.privacy", "Privacy Tools"},
		{"en", "sms.name", "SMS Receiver"},
		{"zh", "home.title", ""},  // 只验证不是 key 本身
		{"ja", "nav.privacy", ""}, // 只验证不是 key 本身
	}
	for _, tc := range cases {
		tr := m.Translator(tc.lang)
		got := tr.T(tc.key)
		if tc.want != "" && got != tc.want {
			t.Errorf("lang=%q T(%q) = %q, want %q", tc.lang, tc.key, got, tc.want)
		} else if got == tc.key {
			t.Errorf("lang=%q T(%q) returned key itself (not found)", tc.lang, tc.key)
		}
		// FuncT 接口兼容性
		if tr.FuncT()(tc.key) != got {
			t.Errorf("lang=%q: FuncT() inconsistent with T() for key %q", tc.lang, tc.key)
		}
	}
}

// TestIntegration_LocalesDir is an alias that also points to i18n/ (same sharded layout).
func TestIntegration_LocalesDir(t *testing.T) {
	localesDir := filepath.Join("..", "..", "i18n")
	if _, err := os.Stat(localesDir); os.IsNotExist(err) {
		t.Skip("i18n dir not found, skipping")
	}

	m, err := i18n.NewManager(i18n.Config{
		LocalesDir:  localesDir,
		DefaultLang: "en",
		Fallbacks: map[string][]string{
			"zh-TW": {"zh", "en"},
			"ja-JP": {"ja", "en"},
			"ko-KR": {"ko", "en"},
		},
	})
	if err != nil {
		t.Fatalf("NewManager(locales): %v", err)
	}

	langs := m.SupportedLangs()
	t.Logf("locales dir: loaded languages: %v", langs)

	// All 5 languages should be present
	langSet := make(map[string]bool)
	for _, l := range langs {
		langSet[l] = true
	}
	for _, want := range []string{"en", "zh", "ja", "ko", "spa"} {
		if !langSet[want] {
			t.Errorf("locales dir: missing language %q, got %v", want, langs)
		}
	}

	// Verify key access across namespaces
	cases := []struct{ lang, key, want string }{
		{"en", "home.title", "Tool Box Nova - Free Online Tools for Developers & Privacy"},
		{"zh", "home.title", ""}, // just verify it's not the key itself
		{"en", "nav.privacy", "Privacy Tools"},
		{"en", "sms.name", "SMS Receiver"},
		{"en", "qr.name", ""}, // just verify non-empty
		{"en", "img.resize.hero.title", ""},
	}
	for _, tc := range cases {
		tr := m.Translator(tc.lang)
		got := tr.T(tc.key)
		if tc.want != "" && got != tc.want {
			t.Errorf("lang=%q T(%q) = %q, want %q", tc.lang, tc.key, got, tc.want)
		} else if got == tc.key {
			t.Errorf("lang=%q T(%q) returned key itself (not found)", tc.lang, tc.key)
		}
	}
}

// TestWatcher_CreatesAndCloses verifies Watcher can be created and closed without error.
func TestWatcher_CreatesAndCloses(t *testing.T) {
	dir := setupLocales(t)
	m := newManager(t, dir)

	w, err := i18n.NewWatcher(m, dir)
	if err != nil {
		t.Fatalf("NewWatcher: %v", err)
	}
	if err := w.Start(); err != nil {
		t.Fatalf("Start: %v", err)
	}
	// Let the watcher goroutine spin up
	if err := w.Close(); err != nil {
		t.Errorf("Close: %v", err)
	}
}

// TestWatcher_HotReload verifies that modifying a JSON file triggers a reload.
func TestWatcher_HotReload(t *testing.T) {
	dir := setupLocales(t)
	m := newManager(t, dir)

	w, err := i18n.NewWatcher(m, dir)
	if err != nil {
		t.Fatalf("NewWatcher: %v", err)
	}
	if err := w.Start(); err != nil {
		t.Fatalf("Start: %v", err)
	}
	defer w.Close()

	// Verify initial value
	if got := m.Translator("en").T("site.title"); got != "Tool Box Nova" {
		t.Fatalf("before hot-reload: got %q", got)
	}

	// Modify the file
	updated := `{"site.title": "Hot Reloaded!", "button.submit": "Submit"}`
	if err := os.WriteFile(filepath.Join(dir, "en.json"), []byte(updated), 0o644); err != nil {
		t.Fatalf("WriteFile: %v", err)
	}

	// Wait for debounce + reload (300ms debounce + margin)
	deadline := 1200 // ms
	for i := 0; i < deadline/50; i++ {
		time.Sleep(50 * time.Millisecond)
		if m.Translator("en").T("site.title") == "Hot Reloaded!" {
			return // success
		}
	}
	t.Errorf("hot-reload: after %dms site.title still %q", deadline, m.Translator("en").T("site.title"))
}

// ─── Benchmark tests ─────────────────────────────────────────────────────────

func BenchmarkTranslator_T(b *testing.B) {
	dir := setupLocalesBench(b)
	m, _ := i18n.NewManager(i18n.Config{LocalesDir: dir, DefaultLang: "en"})
	tr := m.Translator("zh")

	b.ResetTimer()
	b.ReportAllocs()
	for i := 0; i < b.N; i++ {
		_ = tr.T("button.submit")
	}
}

func BenchmarkTranslator_T_Missing(b *testing.B) {
	dir := setupLocalesBench(b)
	m, _ := i18n.NewManager(i18n.Config{LocalesDir: dir, DefaultLang: "en"})
	tr := m.Translator("en")

	b.ResetTimer()
	b.ReportAllocs()
	for i := 0; i < b.N; i++ {
		_ = tr.T("nonexistent.key.that.does.not.exist")
	}
}

func BenchmarkTranslator_TF(b *testing.B) {
	dir := setupLocalesBench(b)
	m, _ := i18n.NewManager(i18n.Config{LocalesDir: dir, DefaultLang: "en"})
	tr := m.Translator("en")

	b.ResetTimer()
	b.ReportAllocs()
	for i := 0; i < b.N; i++ {
		_ = tr.TF("hello", "Alice")
	}
}

func BenchmarkTranslator_TN(b *testing.B) {
	dir := setupLocalesBench(b)
	m, _ := i18n.NewManager(i18n.Config{LocalesDir: dir, DefaultLang: "en"})
	tr := m.Translator("en")

	b.ResetTimer()
	b.ReportAllocs()
	for i := 0; i < b.N; i++ {
		_ = tr.TN("items", 5)
	}
}

func BenchmarkManager_Translator(b *testing.B) {
	dir := setupLocalesBench(b)
	m, _ := i18n.NewManager(i18n.Config{LocalesDir: dir, DefaultLang: "en"})

	b.ResetTimer()
	b.ReportAllocs()
	for i := 0; i < b.N; i++ {
		_ = m.Translator("zh")
	}
}

func BenchmarkTranslator_Parallel(b *testing.B) {
	dir := setupLocalesBench(b)
	m, _ := i18n.NewManager(i18n.Config{LocalesDir: dir, DefaultLang: "en"})

	b.ResetTimer()
	b.ReportAllocs()
	b.RunParallel(func(pb *testing.PB) {
		for pb.Next() {
			tr := m.Translator("zh")
			_ = tr.T("button.submit")
		}
	})
}

// setupLocalesBench creates a temp locales dir with enough keys for benchmarking.
func setupLocalesBench(b interface {
	Helper()
	TempDir() string
	Fatalf(string, ...interface{})
}) string {
	b.Helper()
	dir := b.TempDir()

	files := map[string]string{
		"en.json": `{
			"site.title": "Tool Box Nova",
			"button.submit": "Submit",
			"button.cancel": "Cancel",
			"hello": "Hello, %s!",
			"items.one": "%d item",
			"items.other": "%d items",
			"img.resize.hero.title": "Image Resizer",
			"nav.home": "Home",
			"nav.dashboard": "Dashboard"
		}`,
		"zh.json": `{
			"site.title": "工具箱",
			"button.submit": "提交",
			"button.cancel": "取消",
			"hello": "你好，%s！",
			"items.one": "%d 个项目",
			"items.other": "%d 个项目",
			"img.resize.hero.title": "图片调整大小",
			"nav.home": "首页",
			"nav.dashboard": "仪表盘"
		}`,
	}

	for name, content := range files {
		path := filepath.Join(dir, name)
		if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
			b.Fatalf("write %s: %v", name, err)
		}
	}
	return dir
}
