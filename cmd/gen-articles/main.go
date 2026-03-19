// cmd/gen-articles/main.go
// Reads markdown articles from needs/jsonv2/material/json-learn-articles/
// and generates static/js/learn-articles/*.js files with HTML content.
// Run from the project root: go run ./cmd/gen-articles
package main

import (
	"bytes"
	"fmt"
	"html"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

const (
	articlesDir = "needs/jsonv2/material/json-learn-articles"
	outputDir   = "static/js/learn-articles"
)

// Article groups -> output file mapping
var groups = []struct {
	Name  string
	File  string
	Slugs []string
}{
	{
		Name: "basics",
		File: "basics.js",
		Slugs: []string{
			"what-is-json", "json-syntax-rules", "json-data-types", "json-objects",
			"json-arrays", "json-strings-escaping", "json-numbers-booleans-null",
			"json-nesting", "first-json-file", "json-formatting-beautify",
		},
	},
	{
		Name: "language-guides",
		File: "language-guides.js",
		Slugs: []string{
			"python-json", "javascript-json", "java-json", "go-json",
			"php-json", "csharp-json", "ruby-json", "rust-json",
			"swift-json", "typescript-json",
		},
	},
	{
		Name: "debugging",
		File: "debugging.js",
		Slugs: []string{
			"common-json-mistakes", "json-parse-errors", "unexpected-token",
			"unexpected-end-of-json", "json-syntax-error-debug", "json-debug-tools",
		},
	},
	{
		Name: "comparison",
		File: "comparison.js",
		Slugs: []string{
			"json-vs-xml", "json-vs-yaml", "json-vs-csv", "json-vs-protobuf", "json5-jsonc",
		},
	},
	{
		Name: "advanced",
		File: "advanced.js",
		Slugs: []string{
			"json-schema-intro", "json-schema-advanced", "jsonpath", "jq-guide",
			"jwt", "json-ld", "json-patch", "json-pointer", "ndjson", "geojson",
		},
	},
	{
		Name: "security-practical",
		File: "security-practical.js",
		Slugs: []string{
			"json-security", "json-injection", "json-performance", "json-streaming",
			"json-compression", "mongodb-json", "postgresql-json", "elasticsearch-json",
			"rest-api-json", "graphql-json", "json-config", "json-ai-llm",
		},
	},
}

// findMDFile finds the MD file for a given slug
func findMDFile(slug string) (string, error) {
	entries, err := os.ReadDir(articlesDir)
	if err != nil {
		return "", err
	}
	for _, e := range entries {
		name := e.Name()
		if !strings.HasSuffix(name, ".md") {
			continue
		}
		// Strip numeric prefix (e.g., "01-", "10-", "53-")
		stripped := regexp.MustCompile(`^\d+-`).ReplaceAllString(name, "")
		fileSlug := strings.TrimSuffix(stripped, ".md")
		if fileSlug == slug {
			return filepath.Join(articlesDir, name), nil
		}
	}
	return "", fmt.Errorf("no MD file found for slug: %s", slug)
}

// mdToHTML converts basic Markdown to HTML
func mdToHTML(md string) string {
	lines := strings.Split(md, "\n")
	var buf bytes.Buffer
	i := 0
	n := len(lines)

	for i < n {
		line := lines[i]

		// Skip meta blockquote line
		if strings.HasPrefix(line, "> **分类**") || strings.HasPrefix(line, "> **Category**") {
			i++
			continue
		}

		// Code block
		if strings.HasPrefix(line, "```") {
			lang := strings.TrimPrefix(line, "```")
			lang = strings.TrimSpace(lang)
			i++
			var codeLines []string
			for i < n && !strings.HasPrefix(lines[i], "```") {
				codeLines = append(codeLines, lines[i])
				i++
			}
			i++ // skip closing ```
			code := strings.Join(codeLines, "\n")
			code = html.EscapeString(code)
			langAttr := ""
			if lang != "" {
				langAttr = fmt.Sprintf(` class="language-%s"`, lang)
			}
			buf.WriteString(fmt.Sprintf("<pre><code%s>%s</code></pre>\n", langAttr, code))
			continue
		}

		// H1
		if strings.HasPrefix(line, "# ") {
			text := inlineMD(strings.TrimPrefix(line, "# "))
			buf.WriteString(fmt.Sprintf("<h1>%s</h1>\n", text))
			i++
			continue
		}
		// H2
		if strings.HasPrefix(line, "## ") {
			text := inlineMD(strings.TrimPrefix(line, "## "))
			buf.WriteString(fmt.Sprintf("<h2>%s</h2>\n", text))
			i++
			continue
		}
		// H3
		if strings.HasPrefix(line, "### ") {
			text := inlineMD(strings.TrimPrefix(line, "### "))
			buf.WriteString(fmt.Sprintf("<h3>%s</h3>\n", text))
			i++
			continue
		}
		// H4
		if strings.HasPrefix(line, "#### ") {
			text := inlineMD(strings.TrimPrefix(line, "#### "))
			buf.WriteString(fmt.Sprintf("<h4>%s</h4>\n", text))
			i++
			continue
		}

		// Horizontal rule
		if regexp.MustCompile(`^---+$`).MatchString(strings.TrimSpace(line)) {
			buf.WriteString("<hr>\n")
			i++
			continue
		}

		// Blockquote
		if strings.HasPrefix(line, "> ") {
			text := inlineMD(strings.TrimPrefix(line, "> "))
			buf.WriteString(fmt.Sprintf("<blockquote><p>%s</p></blockquote>\n", text))
			i++
			continue
		}

		// Table detection
		if strings.Contains(line, "|") && i+1 < n && regexp.MustCompile(`^\|[\s\-:|]+\|`).MatchString(lines[i+1]) {
			var tableLines []string
			for i < n && strings.Contains(lines[i], "|") {
				tableLines = append(tableLines, lines[i])
				i++
			}
			buf.WriteString(parseTable(tableLines))
			continue
		}

		// Unordered list
		if regexp.MustCompile(`^[-*+] `).MatchString(line) {
			buf.WriteString("<ul>\n")
			for i < n && regexp.MustCompile(`^[-*+] `).MatchString(lines[i]) {
				item := regexp.MustCompile(`^[-*+] `).ReplaceAllString(lines[i], "")
				buf.WriteString(fmt.Sprintf("<li>%s</li>\n", inlineMD(item)))
				i++
			}
			buf.WriteString("</ul>\n")
			continue
		}

		// Ordered list
		if regexp.MustCompile(`^\d+\. `).MatchString(line) {
			buf.WriteString("<ol>\n")
			for i < n && regexp.MustCompile(`^\d+\. `).MatchString(lines[i]) {
				item := regexp.MustCompile(`^\d+\. `).ReplaceAllString(lines[i], "")
				buf.WriteString(fmt.Sprintf("<li>%s</li>\n", inlineMD(item)))
				i++
			}
			buf.WriteString("</ol>\n")
			continue
		}

		// Empty line
		if strings.TrimSpace(line) == "" {
			i++
			continue
		}

		// Paragraph
		text := inlineMD(strings.TrimSpace(line))
		buf.WriteString(fmt.Sprintf("<p>%s</p>\n", text))
		i++
	}

	return buf.String()
}

// inlineMD converts inline Markdown elements
func inlineMD(text string) string {
	// Inline code (do first to avoid double-processing)
	text = regexp.MustCompile("`([^`]+)`").ReplaceAllStringFunc(text, func(m string) string {
		inner := regexp.MustCompile("`([^`]+)`").FindStringSubmatch(m)[1]
		return "<code>" + html.EscapeString(inner) + "</code>"
	})
	// Bold
	text = regexp.MustCompile(`\*\*([^*]+)\*\*`).ReplaceAllString(text, "<strong>$1</strong>")
	// Italic
	text = regexp.MustCompile(`\*([^*]+)\*`).ReplaceAllString(text, "<em>$1</em>")
	// Links
	text = regexp.MustCompile(`\[([^\]]+)\]\(([^)]+)\)`).ReplaceAllString(text, `<a href="$2">$1</a>`)
	return text
}

// parseTable converts markdown table lines to HTML
func parseTable(lines []string) string {
	var rows [][]string
	separatorRe := regexp.MustCompile(`^\|[\s\-:|]+\|$`)

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if separatorRe.MatchString(line) {
			continue
		}
		cells := strings.Split(strings.Trim(line, "|"), "|")
		var row []string
		for _, c := range cells {
			row = append(row, strings.TrimSpace(c))
		}
		rows = append(rows, row)
	}

	if len(rows) == 0 {
		return ""
	}

	var buf bytes.Buffer
	buf.WriteString("<table>\n<thead><tr>")
	for _, cell := range rows[0] {
		buf.WriteString(fmt.Sprintf("<th>%s</th>", inlineMD(cell)))
	}
	buf.WriteString("</tr></thead>\n")

	if len(rows) > 1 {
		buf.WriteString("<tbody>\n")
		for _, row := range rows[1:] {
			buf.WriteString("<tr>")
			for _, cell := range row {
				buf.WriteString(fmt.Sprintf("<td>%s</td>", inlineMD(cell)))
			}
			buf.WriteString("</tr>\n")
		}
		buf.WriteString("</tbody>\n")
	}
	buf.WriteString("</table>\n")
	return buf.String()
}

// escapeJSTemplateLiteral escapes content for use in JS template literals
func escapeJSTemplateLiteral(s string) string {
	s = strings.ReplaceAll(s, "\\", "\\\\")
	s = strings.ReplaceAll(s, "`", "\\`")
	s = strings.ReplaceAll(s, "${", "\\${")
	return s
}

func main() {
	for _, group := range groups {
		var buf bytes.Buffer
		buf.WriteString(fmt.Sprintf("/* JSON Learn Articles: %s */\n", group.Name))
		buf.WriteString("window.LEARN_ARTICLES = window.LEARN_ARTICLES || {};\n\n")

		for _, slug := range group.Slugs {
			mdPath, err := findMDFile(slug)
			var htmlContent string
			if err != nil {
				fmt.Printf("WARNING: %v\n", err)
				htmlContent = fmt.Sprintf("<h2>Coming Soon</h2><p>Content for <strong>%s</strong> is being prepared.</p>", slug)
			} else {
				mdBytes, err := os.ReadFile(mdPath)
				if err != nil {
					fmt.Printf("ERROR reading %s: %v\n", mdPath, err)
					continue
				}
				htmlContent = mdToHTML(string(mdBytes))
			}

			escaped := escapeJSTemplateLiteral(htmlContent)
			buf.WriteString(fmt.Sprintf("window.LEARN_ARTICLES[%q] = {\n", slug))
			buf.WriteString(fmt.Sprintf("zh: `%s`,\n", escaped))
			buf.WriteString(fmt.Sprintf("en: `%s`\n", escaped))
			buf.WriteString("};\n\n")
		}

		outPath := filepath.Join(outputDir, group.File)
		if err := os.WriteFile(outPath, buf.Bytes(), 0644); err != nil {
			fmt.Printf("ERROR writing %s: %v\n", outPath, err)
			continue
		}
		fmt.Printf("Generated: %s (%d articles)\n", outPath, len(group.Slugs))
	}
	fmt.Println("\nDone!")
}

