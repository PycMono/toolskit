package handlers

import (
	"fmt"
	"math"
	"net/http"
	"os/exec"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// math package usage to prevent unused import
var _ = math.Pi

type EPSRequest struct {
	SVG string `json:"svg" binding:"required"`
}

// QREpsDownload converts SVG to EPS format
func QREpsDownload(c *gin.Context) {
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

	// Try inkscape first (higher quality), fallback to builtin
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

// svgToEPSViaInkscape uses inkscape CLI for conversion (production preferred)
func svgToEPSViaInkscape(svgStr string) (string, error) {
	if _, err := exec.LookPath("inkscape"); err != nil {
		return "", fmt.Errorf("inkscape not found")
	}

	cmd := exec.Command("inkscape",
		"--pipe",
		"--export-type=eps",
		"--export-filename=-",
	)
	cmd.Stdin = strings.NewReader(svgStr)

	out, err := cmd.Output()
	if err != nil {
		return "", fmt.Errorf("inkscape error: %w", err)
	}
	return string(out), nil
}

// svgToEPSBuiltin is a zero-dependency fallback SVG→EPS converter
func svgToEPSBuiltin(svgStr string) (string, error) {
	w, h := extractSVGSize(svgStr)
	if w <= 0 {
		w, h = 500, 500
	}

	var sb strings.Builder

	sb.WriteString("%!PS-Adobe-3.0 EPSF-3.0\n")
	sb.WriteString(fmt.Sprintf("%%%%BoundingBox: 0 0 %d %d\n", w, h))
	sb.WriteString(fmt.Sprintf("%%%%HiResBoundingBox: 0.000 0.000 %d.000 %d.000\n", w, h))
	sb.WriteString("%%Creator: Tool Box Nova QR Generator\n")
	sb.WriteString(fmt.Sprintf("%%%%CreationDate: %s\n", time.Now().Format("2006-01-02")))
	sb.WriteString("%%EndComments\n\n")

	// Flip coordinate system (SVG top-left origin → EPS bottom-left origin)
	sb.WriteString(fmt.Sprintf("0 %d translate\n", h))
	sb.WriteString("1 -1 scale\n\n")

	// White background
	sb.WriteString("1 1 1 setrgbcolor\n")
	sb.WriteString(fmt.Sprintf("0 0 %d %d rectfill\n\n", w, h))

	writePathsEPS(&sb, svgStr)

	sb.WriteString("\n%%EOF\n")
	return sb.String(), nil
}

func extractSVGSize(svg string) (int, int) {
	var w, h int
	for _, attr := range []struct {
		key string
		out *int
	}{{"width", &w}, {"height", &h}} {
		key := attr.key + `="`
		if i := strings.Index(svg, key); i >= 0 {
			s := svg[i+len(key):]
			if j := strings.IndexByte(s, '"'); j >= 0 {
				_, _ = fmt.Sscanf(strings.TrimRight(s[:j], "px "), "%d", attr.out)
			}
		}
	}
	// Fallback: extract from viewBox
	if w <= 0 || h <= 0 {
		if i := strings.Index(svg, `viewBox="`); i >= 0 {
			s := svg[i+9:]
			if j := strings.IndexByte(s, '"'); j >= 0 {
				parts := strings.Fields(s[:j])
				if len(parts) == 4 {
					_, _ = fmt.Sscanf(parts[2], "%d", &w)
					_, _ = fmt.Sscanf(parts[3], "%d", &h)
				}
			}
		}
	}
	return w, h
}

func writePathsEPS(sb *strings.Builder, svg string) {
	sb.WriteString("0 0 0 setrgbcolor\n")

	rest := svg
	for len(rest) > 0 {
		pi := strings.Index(rest, "<path ")
		ri := strings.Index(rest, "<rect ")
		ci := strings.Index(rest, "<circle ")

		next := -1
		tag := ""
		for _, pair := range [][2]interface{}{
			{pi, "path"}, {ri, "rect"}, {ci, "circle"},
		} {
			idx := pair[0].(int)
			if idx >= 0 && (next < 0 || idx < next) {
				next = idx
				tag = pair[1].(string)
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

func svgDtoPS(d string) string {
	tokens := tokenizePath(d)
	var sb strings.Builder
	sb.WriteString("newpath ")

	var cx, cy float64
	i := 0
	for i < len(tokens) {
		cmd := tokens[i]
		i++
		switch cmd {
		case "M":
			x, y := pf(tokens, i), pf(tokens, i+1)
			i += 2
			cx, cy = x, y
			sb.WriteString(fmt.Sprintf("%.3f %.3f moveto ", x, y))
		case "m":
			x, y := pf(tokens, i), pf(tokens, i+1)
			i += 2
			cx += x
			cy += y
			sb.WriteString(fmt.Sprintf("%.3f %.3f moveto ", cx, cy))
		case "L":
			x, y := pf(tokens, i), pf(tokens, i+1)
			i += 2
			cx, cy = x, y
			sb.WriteString(fmt.Sprintf("%.3f %.3f lineto ", x, y))
		case "l":
			x, y := pf(tokens, i), pf(tokens, i+1)
			i += 2
			cx += x
			cy += y
			sb.WriteString(fmt.Sprintf("%.3f %.3f lineto ", cx, cy))
		case "H":
			x := pf(tokens, i)
			i++
			cx = x
			sb.WriteString(fmt.Sprintf("%.3f %.3f lineto ", cx, cy))
		case "h":
			x := pf(tokens, i)
			i++
			cx += x
			sb.WriteString(fmt.Sprintf("%.3f %.3f lineto ", cx, cy))
		case "V":
			y := pf(tokens, i)
			i++
			cy = y
			sb.WriteString(fmt.Sprintf("%.3f %.3f lineto ", cx, cy))
		case "v":
			y := pf(tokens, i)
			i++
			cy += y
			sb.WriteString(fmt.Sprintf("%.3f %.3f lineto ", cx, cy))
		case "C":
			x1, y1 := pf(tokens, i), pf(tokens, i+1)
			x2, y2 := pf(tokens, i+2), pf(tokens, i+3)
			x, y := pf(tokens, i+4), pf(tokens, i+5)
			i += 6
			cx, cy = x, y
			sb.WriteString(fmt.Sprintf("%.3f %.3f %.3f %.3f %.3f %.3f curveto ",
				x1, y1, x2, y2, x, y))
		case "c":
			x1, y1 := cx+pf(tokens, i), cy+pf(tokens, i+1)
			x2, y2 := cx+pf(tokens, i+2), cy+pf(tokens, i+3)
			x, y := cx+pf(tokens, i+4), cy+pf(tokens, i+5)
			i += 6
			cx, cy = x, y
			sb.WriteString(fmt.Sprintf("%.3f %.3f %.3f %.3f %.3f %.3f curveto ",
				x1, y1, x2, y2, x, y))
		case "Z", "z":
			sb.WriteString("closepath ")
		}
	}
	return strings.TrimSpace(sb.String())
}

func svgRectToPS(tag string) string {
	var x, y, w, h, rx float64
	for _, a := range []struct {
		k string
		v *float64
	}{
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
	// Rounded rect: four arcs
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

func tokenizePath(d string) []string {
	const cmds = "MmLlHhVvZzCcSsQqTtAa"
	var tokens []string
	var cur strings.Builder
	flush := func() {
		if cur.Len() > 0 {
			tokens = append(tokens, cur.String())
			cur.Reset()
		}
	}
	for _, ch := range d {
		if strings.ContainsRune(cmds, ch) {
			flush()
			tokens = append(tokens, string(ch))
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
	if i >= len(tokens) {
		return 0
	}
	var f float64
	_, _ = fmt.Sscanf(tokens[i], "%f", &f)
	return f
}

func extractAttrStr(tag, attr string) string {
	for _, q := range []string{`="`, `='`} {
		key := attr + q
		if i := strings.Index(tag, key); i >= 0 {
			s := tag[i+len(key):]
			end := strings.IndexByte(s, q[1])
			if end >= 0 {
				return s[:end]
			}
		}
	}
	return ""
}

func parseAttrF(tag, attr string, out *float64) {
	if v := extractAttrStr(tag, attr); v != "" {
		_, _ = fmt.Sscanf(strings.TrimRight(v, "px "), "%f", out)
	}
}

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
			_, _ = fmt.Sscanf(strings.TrimSpace(parts[0]), "%f", &ri)
			_, _ = fmt.Sscanf(strings.TrimSpace(parts[1]), "%f", &gi)
			_, _ = fmt.Sscanf(strings.TrimSpace(parts[2]), "%f", &bi)
			return ri / 255, gi / 255, bi / 255, true
		}
	}
	return 0, 0, 0, false
}

