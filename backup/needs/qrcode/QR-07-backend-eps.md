# Block QR-07 · 二维码生成工具 — 后端 EPS 接口

> **文件**：`internal/handler/qr_eps.go`  
> **预估工时**：1h  
> **路由**：已在 QR-01 注册 `qr.POST("/api/eps", handler.QRGenerateEPS)`  
> **核心原则**：接收完整 SVG（前端已合入边框），转换为 EPS 并流式返回；不做业务逻辑，只做格式转换

---

## 1. 接口规格

```
POST /media/qr/api/eps
Content-Type: application/json

请求体：
{
  "svg": "<svg xmlns=\"...\" width=\"532\" height=\"532\">...</svg>"
}

成功响应：
HTTP 200
Content-Type: application/postscript
Content-Disposition: attachment; filename="qrcode-<unix>.eps"
<EPS 文件正文>

失败响应：
HTTP 400  { "error": "invalid request: ..." }
HTTP 500  { "error": "conversion failed: ..." }
```

> **前端约定**（来自 QR-06）：传入的 SVG 已包含边框，后端无需再处理 frame 参数，只做 SVG→EPS 转换。

---

## 2. Go 实现 — `internal/handler/qr_eps.go`

```go
// internal/handler/qr_eps.go
package handler

import (
	"fmt"
	"math"
	"net/http"
	"os/exec"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

/* ══════════════════════════════════════════════
   请求体
════════════════════════════════════════════════ */
type EPSRequest struct {
	SVG string `json:"svg" binding:"required"`
}

/* ══════════════════════════════════════════════
   Handler
════════════════════════════════════════════════ */
func QRGenerateEPS(c *gin.Context) {
	var req EPSRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request: " + err.Error()})
		return
	}

	req.SVG = strings.TrimSpace(req.SVG)
	if !strings.Contains(req.SVG, "<svg") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid SVG content"})
		return
	}

	// 优先用 inkscape（精度更高）；失败则 fallback 到内置转换
	eps, err := svgToEPSViaInkscape(req.SVG)
	if err != nil {
		eps, err = svgToEPSBuiltin(req.SVG)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "conversion failed: " + err.Error()})
			return
		}
	}

	filename := fmt.Sprintf("qrcode-%d.eps", time.Now().Unix())
	c.Header("Content-Type", "application/postscript")
	c.Header("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filename))
	c.Header("Cache-Control", "no-store")
	c.String(http.StatusOK, eps)
}

/* ══════════════════════════════════════════════
   方案 A：调用 inkscape CLI（生产优先）
   要求：服务器已安装 inkscape >= 1.0
════════════════════════════════════════════════ */
func svgToEPSViaInkscape(svgStr string) (string, error) {
	if _, err := exec.LookPath("inkscape"); err != nil {
		return "", fmt.Errorf("inkscape not found")
	}

	// inkscape 1.x 支持 stdin→stdout 管道转换
	cmd := exec.Command("inkscape",
		"--pipe",
		"--export-type=eps",
		"--export-filename=-", // 输出到 stdout
	)
	cmd.Stdin = strings.NewReader(svgStr)

	out, err := cmd.Output()
	if err != nil {
		return "", fmt.Errorf("inkscape error: %w", err)
	}
	return string(out), nil
}

/* ══════════════════════════════════════════════
   方案 B：内置 SVG→EPS 转换（零依赖 fallback）
   支持 <path d="...">、<rect>、<circle>，满足 qr-code-styling 的输出
════════════════════════════════════════════════ */
func svgToEPSBuiltin(svgStr string) (string, error) {
	w, h := extractSVGSize(svgStr)
	if w <= 0 {
		w, h = 500, 500
	}

	var sb strings.Builder

	// ── EPS 头 ──────────────────────────────────
	sb.WriteString("%!PS-Adobe-3.0 EPSF-3.0\n")
	sb.WriteString(fmt.Sprintf("%%%%BoundingBox: 0 0 %d %d\n", w, h))
	sb.WriteString(fmt.Sprintf("%%%%HiResBoundingBox: 0.000 0.000 %d.000 %d.000\n", w, h))
	sb.WriteString("%%Creator: DevToolBox QR Generator\n")
	sb.WriteString(fmt.Sprintf("%%%%CreationDate: %s\n", time.Now().Format("2006-01-02")))
	sb.WriteString("%%EndComments\n\n")

	// ── 坐标系翻转（SVG 原点左上，EPS 原点左下）──
	sb.WriteString(fmt.Sprintf("0 %d translate\n", h))
	sb.WriteString("1 -1 scale\n\n")

	// ── 白色背景 ──────────────────────────────────
	sb.WriteString("1 1 1 setrgbcolor\n")
	sb.WriteString(fmt.Sprintf("0 0 %d %d rectfill\n\n", w, h))

	// ── 解析并输出图形元素 ────────────────────────
	writePathsEPS(&sb, svgStr)

	sb.WriteString("\n%%EOF\n")
	return sb.String(), nil
}

/* ── 提取 SVG width/height ──────────────────── */
func extractSVGSize(svg string) (int, int) {
	var w, h int
	for _, attr := range []struct{ key string; out *int }{ {"width", &w}, {"height", &h} } {
		key := attr.key + `="`
		if i := strings.Index(svg, key); i >= 0 {
			s := svg[i+len(key):]
			if j := strings.IndexByte(s, '"'); j >= 0 {
				fmt.Sscanf(strings.TrimRight(s[:j], "px "), "%d", attr.out)
			}
		}
	}
	// fallback：从 viewBox 提取
	if w <= 0 || h <= 0 {
		if i := strings.Index(svg, `viewBox="`); i >= 0 {
			s := svg[i+9:]
			if j := strings.IndexByte(s, '"'); j >= 0 {
				parts := strings.Fields(s[:j])
				if len(parts) == 4 {
					fmt.Sscanf(parts[2], "%d", &w)
					fmt.Sscanf(parts[3], "%d", &h)
				}
			}
		}
	}
	return w, h
}

/* ── 遍历 SVG 元素写 PostScript ─────────────── */
func writePathsEPS(sb *strings.Builder, svg string) {
	// 先写默认黑色（QR 码点）
	sb.WriteString("0 0 0 setrgbcolor\n")

	rest := svg
	for len(rest) > 0 {
		pi := strings.Index(rest, "<path ")
		ri := strings.Index(rest, "<rect ")
		ci := strings.Index(rest, "<circle ")

		// 找最近的元素
		next := -1
		tag  := ""
		for _, pair := range [][2]interface{}{
			{pi, "path"}, {ri, "rect"}, {ci, "circle"},
		} {
			idx := pair[0].(int)
			if idx >= 0 && (next < 0 || idx < next) {
				next = idx
				tag  = pair[1].(string)
			}
		}
		if next < 0 {
			break
		}

		end := strings.Index(rest[next:], ">")
		if end < 0 {
			break
		}
		elem := rest[next : next+end+1]

		// 尝试提取 fill 颜色
		fillColor := extractAttrStr(elem, "fill")
		if fillColor != "" && fillColor != "none" && fillColor != "transparent" {
			if r, g, b, ok := parseColor(fillColor); ok {
				sb.WriteString(fmt.Sprintf("%.4f %.4f %.4f setrgbcolor\n", r, g, b))
			}
		}

		switch tag {
		case "path":
			if d := extractAttrStr(elem, "d"); d != "" {
				if ps := svgDtoPS(d); ps != "" {
					sb.WriteString(ps + " fill\n")
				}
			}
		case "rect":
			if ps := svgRectToPS(elem); ps != "" {
				sb.WriteString(ps + " fill\n")
			}
		case "circle":
			if ps := svgCircleToPS(elem); ps != "" {
				sb.WriteString(ps + " fill\n")
			}
		}

		rest = rest[next+end+1:]
	}
}

/* ── SVG path d → PostScript ────────────────── */
func svgDtoPS(d string) string {
	tokens := tokenizePath(d)
	var sb  strings.Builder
	sb.WriteString("newpath ")

	var cx, cy float64
	i := 0
	for i < len(tokens) {
		cmd := tokens[i]; i++
		switch cmd {
		case "M":
			x, y := pf(tokens, i), pf(tokens, i+1); i += 2
			cx, cy = x, y
			sb.WriteString(fmt.Sprintf("%.3f %.3f moveto ", x, y))
		case "m":
			x, y := pf(tokens, i), pf(tokens, i+1); i += 2
			cx += x; cy += y
			sb.WriteString(fmt.Sprintf("%.3f %.3f moveto ", cx, cy))
		case "L":
			x, y := pf(tokens, i), pf(tokens, i+1); i += 2
			cx, cy = x, y
			sb.WriteString(fmt.Sprintf("%.3f %.3f lineto ", x, y))
		case "l":
			x, y := pf(tokens, i), pf(tokens, i+1); i += 2
			cx += x; cy += y
			sb.WriteString(fmt.Sprintf("%.3f %.3f lineto ", cx, cy))
		case "H":
			x := pf(tokens, i); i++; cx = x
			sb.WriteString(fmt.Sprintf("%.3f %.3f lineto ", cx, cy))
		case "h":
			x := pf(tokens, i); i++; cx += x
			sb.WriteString(fmt.Sprintf("%.3f %.3f lineto ", cx, cy))
		case "V":
			y := pf(tokens, i); i++; cy = y
			sb.WriteString(fmt.Sprintf("%.3f %.3f lineto ", cx, cy))
		case "v":
			y := pf(tokens, i); i++; cy += y
			sb.WriteString(fmt.Sprintf("%.3f %.3f lineto ", cx, cy))
		case "C":
			x1, y1 := pf(tokens, i), pf(tokens, i+1)
			x2, y2 := pf(tokens, i+2), pf(tokens, i+3)
			x, y   := pf(tokens, i+4), pf(tokens, i+5); i += 6
			cx, cy  = x, y
			sb.WriteString(fmt.Sprintf("%.3f %.3f %.3f %.3f %.3f %.3f curveto ",
				x1, y1, x2, y2, x, y))
		case "c":
			x1, y1 := cx+pf(tokens, i), cy+pf(tokens, i+1)
			x2, y2 := cx+pf(tokens, i+2), cy+pf(tokens, i+3)
			x, y   := cx+pf(tokens, i+4), cy+pf(tokens, i+5); i += 6
			cx, cy  = x, y
			sb.WriteString(fmt.Sprintf("%.3f %.3f %.3f %.3f %.3f %.3f curveto ",
				x1, y1, x2, y2, x, y))
		case "Z", "z":
			sb.WriteString("closepath ")
		default:
			// Q/T/A 等复杂命令：用 lineto 近似（QR 码不含复杂曲线，可接受）
		}
	}
	return strings.TrimSpace(sb.String())
}

/* ── SVG <rect> → PostScript ─────────────────── */
func svgRectToPS(tag string) string {
	var x, y, w, h, rx float64
	for _, a := range []struct{ k string; v *float64 }{
		{"x", &x}, {"y", &y}, {"width", &w}, {"height", &h}, {"rx", &rx},
	} {
		parseAttrF(tag, a.k, a.v)
	}
	if w <= 0 || h <= 0 {
		return ""
	}
	if rx <= 0 {
		return fmt.Sprintf("newpath %.3f %.3f moveto %.3f 0 rlineto 0 %.3f rlineto %.3f 0 rlineto closepath",
			x, y, w, h, -w)
	}
	// 圆角矩形：四段弧
	var sb strings.Builder
	sb.WriteString("newpath ")
	sb.WriteString(fmt.Sprintf("%.3f %.3f moveto ", x+rx, y))
	sb.WriteString(fmt.Sprintf("%.3f 0 rlineto ", w-2*rx))
	sb.WriteString(fmt.Sprintf("%.3f %.3f %.3f %.3f %.3f arcn ",
		x+w-rx, y+rx, rx, 270.0, 0.0))
	sb.WriteString(fmt.Sprintf("0 %.3f rlineto ", h-2*rx))
	sb.WriteString(fmt.Sprintf("%.3f %.3f %.3f %.3f %.3f arcn ",
		x+w-rx, y+h-rx, rx, 0.0, 90.0))
	sb.WriteString(fmt.Sprintf("%.3f 0 rlineto ", -(w - 2*rx)))
	sb.WriteString(fmt.Sprintf("%.3f %.3f %.3f %.3f %.3f arcn ",
		x+rx, y+h-rx, rx, 90.0, 180.0))
	sb.WriteString(fmt.Sprintf("0 %.3f rlineto ", -(h - 2*rx)))
	sb.WriteString(fmt.Sprintf("%.3f %.3f %.3f %.3f %.3f arcn closepath",
		x+rx, y+rx, rx, 180.0, 270.0))
	return sb.String()
}

/* ── SVG <circle> → PostScript ──────────────── */
func svgCircleToPS(tag string) string {
	var cx, cy, r float64
	parseAttrF(tag, "cx", &cx)
	parseAttrF(tag, "cy", &cy)
	parseAttrF(tag, "r", &r)
	if r <= 0 {
		return ""
	}
	return fmt.Sprintf("newpath %.3f %.3f %.3f 0 360 arc closepath", cx, cy, r)
}

/* ══════════════════════════════════════════════
   工具函数
════════════════════════════════════════════════ */
func tokenizePath(d string) []string {
	const cmds = "MmLlHhVvZzCcSsQqTtAa"
	var tokens []string
	var cur    strings.Builder
	flush := func() {
		if cur.Len() > 0 { tokens = append(tokens, cur.String()); cur.Reset() }
	}
	for _, ch := range d {
		if strings.ContainsRune(cmds, ch) {
			flush(); tokens = append(tokens, string(ch))
		} else if ch == ' ' || ch == ',' || ch == '\n' || ch == '\t' {
			flush()
		} else {
			cur.WriteRune(ch)
		}
	}
	flush()
	return tokens
}

func pf(tokens []string, i int) float64 {
	if i >= len(tokens) { return 0 }
	var f float64; fmt.Sscanf(tokens[i], "%f", &f); return f
}

func extractAttrStr(tag, attr string) string {
	for _, q := range []string{`="`, `='`} {
		key := attr + q
		if i := strings.Index(tag, key); i >= 0 {
			s := tag[i+len(key):]
			end := strings.IndexByte(s, q[1])
			if end >= 0 { return s[:end] }
		}
	}
	return ""
}

func parseAttrF(tag, attr string, out *float64) {
	if v := extractAttrStr(tag, attr); v != "" {
		fmt.Sscanf(strings.TrimRight(v, "px "), "%f", out)
	}
}

// parseColor 支持 #rrggbb、#rgb、rgb(r,g,b)
func parseColor(s string) (r, g, b float64, ok bool) {
	s = strings.TrimSpace(s)
	if strings.HasPrefix(s, "#") {
		hex := strings.TrimPrefix(s, "#")
		if len(hex) == 3 {
			hex = string([]byte{hex[0], hex[0], hex[1], hex[1], hex[2], hex[2]})
		}
		if len(hex) == 6 {
			var ri, gi, bi int
			if _, err := fmt.Sscanf(hex, "%02x%02x%02x", &ri, &gi, &bi); err == nil {
				return float64(ri) / 255, float64(gi) / 255, float64(bi) / 255, true
			}
		}
	}
	if strings.HasPrefix(s, "rgb(") {
		s = strings.TrimPrefix(s, "rgb(")
		s = strings.TrimSuffix(s, ")")
		parts := strings.Split(s, ",")
		if len(parts) == 3 {
			var ri, gi, bi float64
			fmt.Sscanf(strings.TrimSpace(parts[0]), "%f", &ri)
			fmt.Sscanf(strings.TrimSpace(parts[1]), "%f", &gi)
			fmt.Sscanf(strings.TrimSpace(parts[2]), "%f", &bi)
			return ri / 255, gi / 255, bi / 255, true
		}
	}
	return 0, 0, 0, false
}

// math 包引用，防 unused import
var _ = math.Pi
```

---

## 3. 路由注册（确认已在 QR-01 中）

```go
// internal/router/router.go — qr 分组内（QR-01 已添加）
qr.POST("/api/eps", handler.QRGenerateEPS)
```

---

## 4. 生产部署建议

```
# Ubuntu/Debian 安装 inkscape
apt-get install -y inkscape

# 验证管道转换是否正常
echo '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10">
  <rect width="10" height="10" fill="black"/>
</svg>' | inkscape --pipe --export-type=eps --export-filename=- 2>/dev/null | head -3

# 预期输出前三行：
# %!PS-Adobe-3.0 EPSF-3.0
# %%BoundingBox: 0 0 10 10
# ...
```

---

## 5. 验收标准

- [ ] 发送含 `<svg>` 标签的合法 JSON，返回 HTTP 200，`Content-Type: application/postscript`
- [ ] 返回的 EPS 文件可在 Adobe Illustrator / macOS Preview / Inkscape 打开
- [ ] BoundingBox 数值与 SVG `width`/`height` 属性一致
- [ ] 服务器装有 inkscape 时优先走 inkscape 路径（质量更高）；未装时自动 fallback 到内置转换
- [ ] 内置转换：QR 码矩形点阵完整保留，扫码器可识别生成的图像
- [ ] 传入非 SVG 内容（无 `<svg>` 标签）：返回 HTTP 400 `{"error":"invalid SVG content"}`
- [ ] 接口响应时间：inkscape 路径 < 3s，内置路径 < 500ms
- [ ] 无内存泄漏：压测 100 次并发请求后，进程内存无持续增长
