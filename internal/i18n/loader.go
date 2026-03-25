package i18n

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// Loader 负责从磁盘加载语言文件，支持两种目录布局：
//
//	布局A（单文件）: {dir}/{lang}.json          → 当前使用方式
//	布局B（分片）:   {dir}/{lang}/{ns}.json      → 未来拆分后的方式
//
// 两种布局可以共存，Loader 自动合并同一语言的所有 key。
type Loader struct {
	dir string
}

// NewLoader 创建 Loader
func NewLoader(dir string) *Loader {
	return &Loader{dir: dir}
}

// LoadAll 扫描 locales 目录，加载所有语言的所有文件。
// 返回: lang -> Messages（扁平化 key->value）
func (l *Loader) LoadAll() (map[string]Messages, error) {
	result := make(map[string]Messages)

	entries, err := os.ReadDir(l.dir)
	if err != nil {
		return nil, fmt.Errorf("cannot read locales dir %q: %w", l.dir, err)
	}

	for _, entry := range entries {
		name := entry.Name()

		if entry.IsDir() {
			// 布局B: {dir}/{lang}/ 子目录 → 合并目录内所有 .json 文件
			lang := name
			langDir := filepath.Join(l.dir, name)
			msgs, err := l.loadDir(langDir)
			if err != nil {
				return nil, fmt.Errorf("load lang dir %q: %w", langDir, err)
			}
			if existing, ok := result[lang]; ok {
				mergeMsgs(existing, msgs) // 与同语言已有 key 合并
			} else {
				result[lang] = msgs
			}
		} else if filepath.Ext(name) == ".json" {
			// 布局A: {dir}/{lang}.json 单文件
			lang := strings.TrimSuffix(name, ".json")
			filePath := filepath.Join(l.dir, name)
			msgs, err := l.loadFile(filePath)
			if err != nil {
				return nil, fmt.Errorf("load lang file %q: %w", filePath, err)
			}
			if existing, ok := result[lang]; ok {
				mergeMsgs(existing, msgs)
			} else {
				result[lang] = msgs
			}
		}
	}

	return result, nil
}

// loadDir 加载一个语言子目录内的所有 .json 文件，合并为一个 Messages
func (l *Loader) loadDir(langDir string) (Messages, error) {
	merged := make(Messages)

	files, err := os.ReadDir(langDir)
	if err != nil {
		return nil, err
	}

	for _, f := range files {
		if f.IsDir() || filepath.Ext(f.Name()) != ".json" {
			continue
		}
		filePath := filepath.Join(langDir, f.Name())
		msgs, err := l.loadFile(filePath)
		if err != nil {
			return nil, fmt.Errorf("load %q: %w", filePath, err)
		}
		mergeMsgs(merged, msgs)
	}

	return merged, nil
}

// loadFile 加载单个 JSON 文件，展平嵌套结构为点分 key。
// 同时支持：
//   - 扁平格式: {"img.resize.hero.title": "Image Resizer"}
//   - 嵌套格式: {"img": {"resize": {"hero": {"title": "Image Resizer"}}}}
//   - 混合格式: 同一文件中两种格式共存
func (l *Loader) loadFile(path string) (Messages, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var raw map[string]interface{}
	if err := json.Unmarshal(data, &raw); err != nil {
		return nil, fmt.Errorf("invalid JSON in %q: %w", path, err)
	}

	msgs := make(Messages, len(raw))
	flattenJSON("", raw, msgs)
	return msgs, nil
}

// flattenJSON 将嵌套 JSON 展开为点分 key，写入 out。
// 示例:
//
//	{"button": {"submit": "Submit"}} → out["button.submit"] = "Submit"
//	{"button.submit": "Submit"}      → out["button.submit"] = "Submit"（已是扁平，直接存）
func flattenJSON(prefix string, obj map[string]interface{}, out Messages) {
	for k, v := range obj {
		fullKey := k
		if prefix != "" {
			fullKey = prefix + "." + k
		}
		switch val := v.(type) {
		case string:
			out[fullKey] = val
		case map[string]interface{}:
			flattenJSON(fullKey, val, out)
		default:
			// 数字、bool 等转为字符串
			out[fullKey] = fmt.Sprintf("%v", val)
		}
	}
}

// mergeMsgs 将 src 中的 key 合并入 dst（src 覆盖 dst 中同名 key）
func mergeMsgs(dst, src Messages) {
	for k, v := range src {
		dst[k] = v
	}
}

