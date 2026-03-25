package handlers

import (
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
)

var funcMap = template.FuncMap{
	"call": func(fn func(string) string, key string) string {
		if fn == nil {
			return key
		}
		return fn(key)
	},
	"lower":    strings.ToLower,
	"upper":    strings.ToUpper,
	"safeJS":   func(s string) template.JS { return template.JS(s) },
	"safeHTML": func(s string) template.HTML { return template.HTML(s) },
	"toJSON": func(v interface{}) template.JS {
		b, err := json.Marshal(v)
		if err != nil {
			return template.JS("{}")
		}
		return template.JS(b)
	},
	"dict": func(values ...interface{}) (map[string]interface{}, error) {
		if len(values)%2 != 0 {
			return nil, fmt.Errorf("dict requires even number of arguments")
		}
		dict := make(map[string]interface{}, len(values)/2)
		for i := 0; i < len(values); i += 2 {
			key, ok := values[i].(string)
			if !ok {
				return nil, fmt.Errorf("dict keys must be strings")
			}
			dict[key] = values[i+1]
		}
		return dict, nil
	},
	// list creates a []string slice - used in JSON tool templates
	"list": func(items ...string) []string { return items },
	// groupCount counts JSON tools belonging to a group
	"groupCount": func(tools interface{}, group string) int {
		count := 0
		if metas, ok := tools.([]JsonToolMeta); ok {
			for _, m := range metas {
				if m.Group == group {
					count++
				}
			}
		}
		return count
	},
	// seq returns a range 0..n-1 (used for index checks)
	"seq": func(n int) []int {
		s := make([]int, n)
		for i := range s {
			s[i] = i
		}
		return s
	},
}

// render 每次动态解析 base.html + 页面模板，避免 Gin LoadHTMLGlob
// 全局命名空间中 define 块互相覆盖导致所有页面渲染同一内容的问题。
func render(c *gin.Context, page string, data gin.H) {
	// 构建模板文件列表（必须包含 partials）
	templateFiles := []string{
		filepath.Join("templates", "base.html"),
		filepath.Join("templates", page),
		filepath.Join("templates", "partials", "ad_slot.html"),
		filepath.Join("templates", "partials", "ga.html"),
		filepath.Join("templates", "partials", "cookie-consent.html"),
	}

	// 先注册 FuncMap，再解析文件（顺序很重要）
	tmpl, err := template.New("").Funcs(funcMap).ParseFiles(templateFiles...)
	if err != nil {
		log.Printf("❌ Template parse error (%s): %v", page, err)
		c.String(http.StatusInternalServerError, "Template parse error: %v", err)
		return
	}

	c.Status(http.StatusOK)
	c.Header("Content-Type", "text/html; charset=utf-8")

	// 执行模板并显示详细错误
	if err := tmpl.ExecuteTemplate(c.Writer, "base", data); err != nil {
		log.Printf("❌ Template execute error (%s): %v", page, err)
		_, _ = fmt.Fprintf(c.Writer, "\n\n<!-- Template Error: %v -->", err)
	}
}

// renderJSONTool renders a JSON tool standalone page (uses json/_base.html, not site base.html)
func renderJSONTool(c *gin.Context, page string, data gin.H) {
	templateFiles := []string{
		filepath.Join("templates", "json", "_base.html"),
		filepath.Join("templates", "json", page),
		filepath.Join("templates", "partials", "ga.html"),
		filepath.Join("templates", "partials", "ad_slot.html"),
	}

	tmpl, err := template.New("").Funcs(funcMap).ParseFiles(templateFiles...)
	if err != nil {
		log.Printf("❌ JSON Template parse error (%s): %v", page, err)
		c.String(http.StatusInternalServerError, "Template parse error: %v", err)
		return
	}

	c.Status(http.StatusOK)
	c.Header("Content-Type", "text/html; charset=utf-8")

	if err := tmpl.ExecuteTemplate(c.Writer, "json_base", data); err != nil {
		log.Printf("❌ JSON Template execute error (%s): %v", page, err)
		_, _ = fmt.Fprintf(c.Writer, "\n\n<!-- Template Error: %v -->", err)
	}
}

