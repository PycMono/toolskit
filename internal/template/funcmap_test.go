package template_test

import (
	"html/template"
	"strings"
	"testing"

	tmpl "PycMono/github/toolskit/internal/template"
)

// TestBuildFuncMap verifies every helper registered by BuildFuncMap.
func TestBuildFuncMap(t *testing.T) {
	fm := tmpl.BuildFuncMap()

	t.Run("safeHTML", func(t *testing.T) {
		fn, ok := fm["safeHTML"].(func(string) template.HTML)
		if !ok {
			t.Fatal("safeHTML: wrong type")
		}
		got := fn("<b>bold</b>")
		if string(got) != "<b>bold</b>" {
			t.Errorf("safeHTML: got %q", got)
		}
	})

	t.Run("safeURL", func(t *testing.T) {
		fn, ok := fm["safeURL"].(func(string) template.URL)
		if !ok {
			t.Fatal("safeURL: wrong type")
		}
		got := fn("https://example.com/path?q=1")
		if string(got) != "https://example.com/path?q=1" {
			t.Errorf("safeURL: got %q", got)
		}
	})

	t.Run("safeJS", func(t *testing.T) {
		fn, ok := fm["safeJS"].(func(string) template.JS)
		if !ok {
			t.Fatal("safeJS: wrong type")
		}
		got := fn("console.log('hi')")
		if string(got) != "console.log('hi')" {
			t.Errorf("safeJS: got %q", got)
		}
	})

	t.Run("dict", func(t *testing.T) {
		fn, ok := fm["dict"].(func(...interface{}) map[string]interface{})
		if !ok {
			t.Fatal("dict: wrong type")
		}
		// even pairs
		d := fn("key1", "val1", "key2", 42)
		if d["key1"] != "val1" {
			t.Errorf("dict key1: got %v", d["key1"])
		}
		if d["key2"] != 42 {
			t.Errorf("dict key2: got %v", d["key2"])
		}
		// odd number of args — last key maps to nil (not panic)
		d2 := fn("lone")
		if _, exists := d2["lone"]; !exists {
			t.Error("dict odd args: key 'lone' should be present (with nil value)")
		}
		// empty args
		d3 := fn()
		if len(d3) != 0 {
			t.Errorf("dict empty: got len %d", len(d3))
		}
	})

	t.Run("contains", func(t *testing.T) {
		fn, ok := fm["contains"].(func(string, string) bool)
		if !ok {
			t.Fatal("contains: wrong type")
		}
		if !fn("hello world", "world") {
			t.Error("contains: expected true for 'world' in 'hello world'")
		}
		if fn("hello world", "xyz") {
			t.Error("contains: expected false for 'xyz'")
		}
		_ = strings.Contains // just confirm we use stdlib under the hood
	})

	t.Run("hasPrefix", func(t *testing.T) {
		fn, ok := fm["hasPrefix"].(func(string, string) bool)
		if !ok {
			t.Fatal("hasPrefix: wrong type")
		}
		if !fn("zh-CN", "zh") {
			t.Error("hasPrefix: zh-CN should have prefix zh")
		}
		if fn("en", "zh") {
			t.Error("hasPrefix: en should not have prefix zh")
		}
	})

	t.Run("add", func(t *testing.T) {
		fn, ok := fm["add"].(func(int, int) int)
		if !ok {
			t.Fatal("add: wrong type")
		}
		if got := fn(3, 4); got != 7 {
			t.Errorf("add(3,4) = %d, want 7", got)
		}
		if got := fn(0, 0); got != 0 {
			t.Errorf("add(0,0) = %d, want 0", got)
		}
	})

	t.Run("sub", func(t *testing.T) {
		fn, ok := fm["sub"].(func(int, int) int)
		if !ok {
			t.Fatal("sub: wrong type")
		}
		if got := fn(10, 4); got != 6 {
			t.Errorf("sub(10,4) = %d, want 6", got)
		}
		if got := fn(5, 5); got != 0 {
			t.Errorf("sub(5,5) = %d, want 0", got)
		}
	})

	t.Run("seq", func(t *testing.T) {
		fn, ok := fm["seq"].(func(int, int) []int)
		if !ok {
			t.Fatal("seq: wrong type")
		}
		got := fn(1, 4)
		if len(got) != 3 {
			t.Fatalf("seq(1,4) len = %d, want 3", len(got))
		}
		if got[0] != 1 || got[1] != 2 || got[2] != 3 {
			t.Errorf("seq(1,4) = %v, want [1 2 3]", got)
		}
		// empty range
		if len(fn(5, 5)) != 0 {
			t.Error("seq(5,5) should be empty")
		}
		// negative range
		if len(fn(5, 3)) != 0 {
			t.Error("seq(5,3) should be empty")
		}
	})

	t.Run("default", func(t *testing.T) {
		fn, ok := fm["default"].(func(interface{}, interface{}) interface{})
		if !ok {
			t.Fatal("default: wrong type")
		}
		// empty string → use fallback
		if got := fn("fallback", ""); got != "fallback" {
			t.Errorf("default(\"\") = %v, want fallback", got)
		}
		// nil → use fallback
		if got := fn("fallback", nil); got != "fallback" {
			t.Errorf("default(nil) = %v, want fallback", got)
		}
		// non-empty string → keep value
		if got := fn("fallback", "actual"); got != "actual" {
			t.Errorf("default(\"actual\") = %v, want actual", got)
		}
		// non-string non-nil → keep value
		if got := fn("fallback", 42); got != 42 {
			t.Errorf("default(42) = %v, want 42", got)
		}
	})
}

// TestBuildFuncMap_RegisteredKeys ensures no key is accidentally removed.
func TestBuildFuncMap_RegisteredKeys(t *testing.T) {
	fm := tmpl.BuildFuncMap()
	required := []string{
		"safeHTML", "safeURL", "safeJS",
		"dict", "contains", "hasPrefix",
		"add", "sub", "seq", "default",
	}
	for _, key := range required {
		if _, ok := fm[key]; !ok {
			t.Errorf("BuildFuncMap: missing key %q", key)
		}
	}
}

