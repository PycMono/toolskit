// Package template provides html/template FuncMap helpers for i18n integration.
//
// Usage in Gin router setup:
//
//	r.SetFuncMap(tmpl.BuildFuncMap())
//	r.LoadHTMLGlob("templates/**/*.html")
//
// In handlers, pass the *Translator as template data:
//
//	c.HTML(200, "page.html", gin.H{
//	    "T":    translator,      // *i18n.Translator — call .T "key" in template
//	    "Lang": translator.Lang(),
//	})
//
// In templates:
//
//	{{ .T.T  "common.button.submit" }}
//	{{ .T.TF "common.greeting" .Username }}
//	{{ .T.TN "common.items" .Count }}
package template

import (
	"html/template"
	"strings"
)

// BuildFuncMap returns a template.FuncMap with utility helpers.
// The actual translation functions are accessed via the *Translator object
// passed as template data (e.g. .T.T "key"), because Gin's html/template
// does not support runtime-dynamic FuncMap updates.
func BuildFuncMap() template.FuncMap {
	return template.FuncMap{
		// safeHTML marks a string as safe HTML (prevents escaping).
		// Use carefully — only with trusted content.
		// {{ safeHTML .RawHTML }}
		"safeHTML": func(s string) template.HTML {
			return template.HTML(s)
		},

		// safeURL marks a string as a safe URL.
		// {{ safeURL .RedirectURL }}
		"safeURL": func(s string) template.URL {
			return template.URL(s)
		},

		// safeJS marks a string as safe JavaScript.
		// {{ safeJS .InlineScript }}
		"safeJS": func(s string) template.JS {
			return template.JS(s)
		},

		// dict creates a map from alternating key-value pairs.
		// Useful for passing multiple values into a sub-template.
		// {{ template "widget" (dict "Title" .Title "Lang" .Lang) }}
		// dict creates a map from alternating key-value pairs.
		// Useful for passing multiple values into a sub-template.
		// {{ template "widget" (dict "Title" .Title "Lang" .Lang) }}
		// Odd number of args: the lone trailing key is stored with a nil value.
		"dict": func(values ...interface{}) map[string]interface{} {
			d := make(map[string]interface{}, (len(values)+1)/2)
			for i := 0; i < len(values); i += 2 {
				key, _ := values[i].(string)
				if i+1 < len(values) {
					d[key] = values[i+1]
				} else {
					d[key] = nil // lone trailing key
				}
			}
			return d
		},

		// contains reports whether substr is within s.
		// {{ if contains .Lang "zh" }}...{{ end }}
		"contains": strings.Contains,

		// hasPrefix reports whether s begins with prefix.
		// {{ if hasPrefix .Lang "zh" }}...{{ end }}
		"hasPrefix": strings.HasPrefix,

		// add returns a + b (useful for loop counters in templates).
		// {{ add .Index 1 }}
		"add": func(a, b int) int { return a + b },

		// sub returns a - b.
		"sub": func(a, b int) int { return a - b },

		// seq returns a slice of ints [start, start+1, ..., end-1].
		// Useful for pagination: {{ range seq 1 .TotalPages }}
		// Returns empty slice when start >= end (no panic on inverted range).
		"seq": func(start, end int) []int {
			if end <= start {
				return []int{}
			}
			s := make([]int, 0, end-start)
			for i := start; i < end; i++ {
				s = append(s, i)
			}
			return s
		},

		// default returns val if it is non-zero, otherwise returns def.
		// {{ default "N/A" .OptionalField }}
		"default": func(def, val interface{}) interface{} {
			if val == nil {
				return def
			}
			if s, ok := val.(string); ok && s == "" {
				return def
			}
			return val
		},
	}
}

