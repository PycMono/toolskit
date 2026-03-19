package handlers

import (
	"github.com/gin-gonic/gin"
)

// colorSEO returns SEO data for a given color sub-tool and language.
func colorSEO(tool, lang string) map[string]string {
	type entry struct{ en, zh string }
	data := map[string]map[string]entry{
		"tools": {
			"title":       {"Free Online Color Tools — Picker, Palette, Wheel, Converter & More | ToolboxNova", "免费在线颜色工具 — 拾色器、调色板、色轮、转换器等 | ToolboxNova"},
			"description": {"The ultimate free color toolkit. Pick colors, generate palettes, check contrast, create gradients, extract from images — 100% browser-based.", "最全面的免费颜色工具套件。拾取颜色、生成调色板、检查对比度——全部在浏览器中完成，零上传。"},
			"keywords":    {"color picker, palette generator, color wheel, hex to rgb, contrast checker, gradient generator, tailwind colors", "拾色器,调色板生成器,色轮,HEX转RGB,对比度检查,渐变生成器,Tailwind颜色"},
			"ogTitle":     {"Color Tools Suite — 12 Professional Color Tools in One Place", "颜色工具套件 — 12 个专业颜色工具集于一体"},
			"ogDesc":      {"Pick, generate, convert, check and export colors. 100% free, 100% private, 100% browser-based.", "拾取、生成、转换、检查和导出颜色。100% 免费、100% 隐私、100% 浏览器端处理。"},
			"canonical":   {"https://toolboxnova.com/color/tools", "https://toolboxnova.com/color/tools?lang=zh"},
		},
		"picker": {
			"title":       {"Free Color Picker — HEX, RGB, HSL, OKLCH, LAB & 10 Formats | ToolboxNova", "免费拾色器 — HEX、RGB、HSL、OKLCH、LAB 等10种格式 | ToolboxNova"},
			"description": {"Pick any color and instantly get its value in HEX, RGB, HSL, HSV, CMYK, LAB, LCH, OKLCH, HWB and XYZ. Free, no signup.", "拾取任何颜色，即时获取 HEX、RGB、HSL、HSV、CMYK、LAB、LCH、OKLCH、HWB 和 XYZ 格式的色值。"},
			"keywords":    {"color picker, hex color picker, rgb color picker, oklch, lab color", "拾色器,颜色选择器,HEX,RGB,OKLCH"},
			"ogTitle":     {"Advanced Color Picker — 10+ Color Space Formats", "高级拾色器 — 支持 10+ 种色彩空间"},
			"ogDesc":      {"Get color values in HEX, RGB, HSL, HSV, CMYK, LAB, LCH, OKLCH, HWB, XYZ instantly.", "即时获取颜色的 HEX、RGB、HSL 等多种格式色值。"},
			"canonical":   {"https://toolboxnova.com/color/picker", "https://toolboxnova.com/color/picker?lang=zh"},
		},
		"palette": {
			"title":       {"Palette Generator — Press Space for Harmonious Color Palettes | ToolboxNova", "调色板生成器 — 按空格键生成和谐配色 | ToolboxNova"},
			"description": {"Generate beautiful color palettes with one keypress. Lock colors, apply harmony rules, share via URL, export CSS/SCSS/Tailwind.", "一键生成精美配色方案，锁定喜欢的颜色，导出 CSS/SCSS/Tailwind 配置。"},
			"keywords":    {"palette generator, color palette, color scheme generator, harmonious colors", "调色板生成器,配色方案,和谐配色"},
			"ogTitle":     {"Color Palette Generator — Spacebar to Generate", "调色板生成器 — 空格键一键生成"},
			"ogDesc":      {"Harmonious palettes in seconds. Lock, drag, share, export.", "几秒生成和谐调色板，锁定、拖拽、分享、导出。"},
			"canonical":   {"https://toolboxnova.com/color/palette", "https://toolboxnova.com/color/palette?lang=zh"},
		},
		"wheel": {
			"title":       {"Color Wheel — 6 Harmony Rules, Real-Time CSS Output | ToolboxNova", "色轮 — 6 种和谐规则，实时 CSS 输出 | ToolboxNova"},
			"description": {"Explore color harmonies with our interactive color wheel. Complementary, triadic, analogous, square and more.", "使用交互式色轮探索颜色和谐。互补色、三角色、类比色等多种规则。"},
			"keywords":    {"color wheel, color harmony, complementary colors, color theory", "色轮,颜色和谐,互补色,色彩理论"},
			"ogTitle":     {"Interactive Color Wheel — 6 Harmony Rules", "交互式色轮 — 6 种和谐规则"},
			"ogDesc":      {"Pick a base color and explore 6 harmony types with live CSS output.", "选择基准色，探索 6 种和谐类型，实时 CSS 输出。"},
			"canonical":   {"https://toolboxnova.com/color/wheel", "https://toolboxnova.com/color/wheel?lang=zh"},
		},
		"converter": {
			"title":       {"Color Converter — HEX, RGB, HSL, CMYK, OKLCH, LAB & More | ToolboxNova", "颜色转换器 — HEX、RGB、HSL、CMYK、OKLCH、LAB 等10种格式 | ToolboxNova"},
			"description": {"Convert colors between HEX, RGB, HSL, HSV, CMYK, LAB, LCH, OKLCH, HWB, XYZ instantly. The most complete free color converter.", "即时在 HEX、RGB、HSL、HSV、CMYK、LAB、LCH、OKLCH、HWB、XYZ 之间互转颜色。"},
			"keywords":    {"color converter, hex to rgb, rgb to hsl, cmyk converter, oklch converter", "颜色转换器,HEX转RGB,RGB转HSL,CMYK转换器"},
			"ogTitle":     {"Color Converter — 10 Formats, Instant Conversion", "颜色转换器 — 10 种格式即时转换"},
			"ogDesc":      {"The most complete color converter: HEX, RGB, HSL, HSV, CMYK, LAB, LCH, OKLCH, HWB, XYZ.", "最全面的颜色转换器：10 种色彩格式即时互转。"},
			"canonical":   {"https://toolboxnova.com/color/converter", "https://toolboxnova.com/color/converter?lang=zh"},
		},
		"contrast": {
			"title":       {"Contrast Checker — WCAG 2.1 & APCA Accessibility Tool | ToolboxNova", "对比度检查器 — WCAG 2.1 和 APCA 无障碍检查 | ToolboxNova"},
			"description": {"Check color contrast ratios against WCAG 2.1 AA/AAA and the new APCA standard. Ensure accessible designs.", "根据 WCAG 2.1 AA/AAA 和新的 APCA 标准检查颜色对比度，确保无障碍设计。"},
			"keywords":    {"contrast checker, wcag contrast, color accessibility, apca contrast, wcag aa aaa", "对比度检查器,WCAG对比度,颜色无障碍,APCA"},
			"ogTitle":     {"Contrast Checker — WCAG 2.1 + APCA Dual Standard", "对比度检查器 — WCAG 2.1 + APCA 双标准"},
			"ogDesc":      {"Industry's first tool showing both WCAG 2.1 ratio and APCA score side by side.", "全球首个同时展示 WCAG 2.1 比值和 APCA 分数的工具。"},
			"canonical":   {"https://toolboxnova.com/color/contrast", "https://toolboxnova.com/color/contrast?lang=zh"},
		},
		"gradient": {
			"title":       {"Gradient Generator — OKLCH Perceptual Interpolation | ToolboxNova", "渐变生成器 — OKLCH 感知均匀插值 | ToolboxNova"},
			"description": {"Create beautiful gradients with perceptual color interpolation in OKLCH, LCH, LAB, and HSL. No more muddy grey zones.", "使用 OKLCH、LCH、LAB、HSL 感知色彩插值创建精美渐变，彻底消除灰暗死区。"},
			"keywords":    {"gradient generator, css gradient, oklch gradient, linear gradient, perceptual gradient", "渐变生成器,CSS渐变,OKLCH渐变,线性渐变"},
			"ogTitle":     {"Gradient Generator — OKLCH Perceptual Interpolation, No Grey Zones", "渐变生成器 — OKLCH 感知插值，无灰色死区"},
			"ogDesc":      {"8 color space interpolation options. Copy CSS in one click.", "8 种色彩空间插值，一键复制 CSS 代码。"},
			"canonical":   {"https://toolboxnova.com/color/gradient", "https://toolboxnova.com/color/gradient?lang=zh"},
		},
		"image-picker": {
			"title":       {"Image Color Picker — Extract Palette from Any Image | ToolboxNova", "图片取色器 — 从任意图片提取调色板 | ToolboxNova"},
			"description": {"Extract dominant colors and precise pixel colors from images using K-means clustering. Supports JPG, PNG, WebP, SVG.", "使用 K-means 聚类从图片提取主色调和精确像素颜色。支持 JPG、PNG、WebP、SVG。"},
			"keywords":    {"image color picker, extract colors from image, dominant colors, color palette from image", "图片取色器,图片提取颜色,主色调提取"},
			"ogTitle":     {"Image Color Picker — K-means Clustering + Pixel Picker", "图片取色器 — K-means 聚类 + 像素取色"},
			"ogDesc":      {"Pick exact pixel colors or auto-extract dominant palette from any image.", "精确像素取色或自动提取主色调调色板。"},
			"canonical":   {"https://toolboxnova.com/color/image-picker", "https://toolboxnova.com/color/image-picker?lang=zh"},
		},
		"blindness": {
			"title":       {"Color Blindness Simulator — 8 Vision Types | ToolboxNova", "色盲模拟器 — 8 种色觉缺陷 | ToolboxNova"},
			"description": {"Simulate how your colors look for people with 8 types of color vision deficiency including protanopia, deuteranopia, and achromatopsia.", "模拟 8 种色觉缺陷下的颜色效果，包括红色盲、绿色盲和全色盲。"},
			"keywords":    {"color blindness simulator, protanopia, deuteranopia, tritanopia, color accessibility", "色盲模拟器,红色盲,绿色盲,色觉缺陷"},
			"ogTitle":     {"Color Blindness Simulator — 8 Deficiency Types", "色盲模拟器 — 8 种色觉缺陷类型"},
			"ogDesc":      {"See your palette through 8 types of color vision deficiency. Before/After comparison.", "通过 8 种色觉缺陷查看调色板效果，前后对比。"},
			"canonical":   {"https://toolboxnova.com/color/blindness", "https://toolboxnova.com/color/blindness?lang=zh"},
		},
		"names": {
			"title":       {"Color Names Library — 2000+ Named Colors with Search | ToolboxNova", "颜色名称库 — 2000+ 命名颜色搜索 | ToolboxNova"},
			"description": {"Browse and search 2000+ named colors. Find the closest named color to any HEX value. Copy CSS color names instantly.", "浏览搜索 2000+ 命名颜色，查找任意 HEX 值最接近的命名颜色。"},
			"keywords":    {"color names, css color names, named colors, color library, web colors", "颜色名称,CSS颜色名,命名颜色,颜色库"},
			"ogTitle":     {"Color Names Library — 2000+ Colors, Instant Search", "颜色名称库 — 2000+ 颜色即时搜索"},
			"ogDesc":      {"Find any color name by HEX or search by name. Copy CSS in one click.", "通过 HEX 或名称查找颜色，一键复制 CSS。"},
			"canonical":   {"https://toolboxnova.com/color/names", "https://toolboxnova.com/color/names?lang=zh"},
		},
		"mixer": {
			"title":       {"Color Mixer — Blend Colors with Multiple Modes | ToolboxNova", "颜色混合器 — 多种混合模式 | ToolboxNova"},
			"description": {"Mix and blend two colors using additive, subtractive, and multiply blend modes. See intermediate gradient steps.", "使用加色、减色和正片叠底混合模式混合两种颜色，查看中间渐变色阶。"},
			"keywords":    {"color mixer, blend colors, color blending, mix colors online", "颜色混合器,颜色混合,混合颜色"},
			"ogTitle":     {"Color Mixer — Additive, Subtractive & Multiply Blend Modes", "颜色混合器 — 加色、减色和正片叠底"},
			"ogDesc":      {"Mix any two colors and see the result in multiple blend modes.", "混合任意两种颜色，查看多种混合模式结果。"},
			"canonical":   {"https://toolboxnova.com/color/mixer", "https://toolboxnova.com/color/mixer?lang=zh"},
		},
		"tailwind": {
			"title":       {"Tailwind CSS Color Generator — Full Shade Scale from Any Color | ToolboxNova", "Tailwind CSS 颜色生成器 — 从任意颜色生成完整色阶 | ToolboxNova"},
			"description": {"Generate a complete Tailwind CSS shade scale (50-950) from any base color. Copy ready-to-use Tailwind config.", "从任意基准色生成完整的 Tailwind CSS 色阶（50-950），复制即用的配置代码。"},
			"keywords":    {"tailwind color generator, tailwind palette, tailwind color scale, custom tailwind colors", "Tailwind颜色生成器,Tailwind调色板,Tailwind色阶"},
			"ogTitle":     {"Tailwind Color Generator — 50 to 950 Shade Scale", "Tailwind 颜色生成器 — 50 到 950 色阶"},
			"ogDesc":      {"Instant Tailwind shade scale from any base color with UI preview.", "从任意基准色即时生成 Tailwind 色阶，带 UI 预览。"},
			"canonical":   {"https://toolboxnova.com/color/tailwind", "https://toolboxnova.com/color/tailwind?lang=zh"},
		},
	}

	seo, ok := data[tool]
	if !ok {
		seo = data["tools"]
	}
	pick := func(e entry) string {
		if lang == "zh" {
			return e.zh
		}
		return e.en
	}
	return map[string]string{
		"title":       pick(seo["title"]),
		"description": pick(seo["description"]),
		"keywords":    pick(seo["keywords"]),
		"ogTitle":     pick(seo["ogTitle"]),
		"ogDesc":      pick(seo["ogDesc"]),
		"canonical":   pick(seo["canonical"]),
	}
}

// colorFAQ returns FAQ items for the color tools hub.
func colorFAQ(lang string) []map[string]string {
	if lang == "zh" {
		return []map[string]string{
			{"q": "我的图片或颜色数据会上传到服务器吗？", "a": "绝不会。所有颜色操作完全在您的浏览器中通过 JavaScript 运行，没有任何数据离开您的设备。您的图片和颜色选择 100% 私密。"},
			{"q": "支持哪些颜色格式？", "a": "支持 HEX、RGB、HSL、HSV、CMYK、LAB、LCH、OKLCH、HWB 和 XYZ，可即时互转。其中 OKLCH 和 HWB 为 CSS Color Level 4 标准。"},
			{"q": "什么是 APCA 对比度算法？", "a": "APCA（Accessible Perceptual Contrast Algorithm）是为 WCAG 3.0 开发的下一代对比度标准，比 WCAG 2.1 的简单比值提供更准确的可读性预测。"},
			{"q": "可以将调色板导出到 Figma 或 Tailwind 吗？", "a": "当然！支持导出 CSS 变量、SCSS 变量、Tailwind 配置、JSON、ASE（Adobe 色板）、GPL（GIMP）、PNG 图片或 SVG 文件。"},
			{"q": "调色板生成器如何工作？", "a": "按空格键根据色彩理论规则（互补色、三角色、类比色等）生成和谐调色板。锁定喜欢的颜色，继续生成直到找到完美组合，然后通过 URL 分享。"},
		}
	}
	return []map[string]string{
		{"q": "Are my images or color data uploaded to a server?", "a": "Never. All color operations run entirely in your browser using JavaScript. No data leaves your device — your images and color choices are 100% private."},
		{"q": "What color formats are supported?", "a": "We support HEX, RGB, HSL, HSV, CMYK, LAB, LCH, OKLCH, HWB, and XYZ with instant conversion. OKLCH and HWB are CSS Color Level 4 standards."},
		{"q": "What is the APCA contrast algorithm?", "a": "APCA (Accessible Perceptual Contrast Algorithm) is the next-generation standard being developed for WCAG 3.0. It provides more accurate readability predictions than the WCAG 2.1 contrast ratio."},
		{"q": "Can I export palettes for Figma or Tailwind?", "a": "Yes! Export as CSS variables, SCSS variables, Tailwind config, JSON, ASE (Adobe Swatch Exchange), GPL (GIMP palette), PNG image, or SVG file — all free."},
		{"q": "How does the palette generator work?", "a": "Press the spacebar to generate harmonious palettes based on color theory rules (complementary, triadic, analogous, etc.). Lock colors you like and keep generating until you find the perfect combination, then share via URL."},
	}
}

func colorPageData(c *gin.Context, tool string) gin.H {
	lang := c.GetString("lang")
	if lang == "" {
		lang = "en"
	}
	t := getT(c)
	seo := colorSEO(tool, lang)
	faq := colorFAQ(lang)

	return baseData(c, gin.H{
		"Title":        seo["title"],
		"Description":  seo["description"],
		"Keywords":     seo["keywords"],
		"Lang":         lang,
		"T":            t,
		"SEO":          seo,
		"FAQ":          faq,
		"ToolName":     "color-" + tool,
		"ActiveTool":   tool,
		"CanonicalURL": seo["canonical"],
		"HreflangEN":   "https://toolboxnova.com/color/" + tool + "?lang=en",
		"HreflangZH":   "https://toolboxnova.com/color/" + tool + "?lang=zh",
		"PageClass":    "page-color-" + tool,
	})
}

// ColorToolsHub renders the color tools hub page.
func ColorToolsHub(c *gin.Context) {
	render(c, "color/tools.html", colorPageData(c, "tools"))
}

// ColorPickerPage renders the advanced color picker.
func ColorPickerPage(c *gin.Context) {
	render(c, "color/tools.html", colorPageData(c, "picker"))
}

// ColorPalettePage renders the palette generator.
func ColorPalettePage(c *gin.Context) {
	render(c, "color/tools.html", colorPageData(c, "palette"))
}

// ColorWheelPage renders the color wheel.
func ColorWheelPage(c *gin.Context) {
	render(c, "color/tools.html", colorPageData(c, "wheel"))
}

// ColorConverterV2Page renders the full color converter.
func ColorConverterV2Page(c *gin.Context) {
	render(c, "color/tools.html", colorPageData(c, "converter"))
}

// ColorContrastPage renders the WCAG+APCA contrast checker.
func ColorContrastPage(c *gin.Context) {
	render(c, "color/tools.html", colorPageData(c, "contrast"))
}

// ColorGradientPage renders the gradient generator.
func ColorGradientPage(c *gin.Context) {
	render(c, "color/tools.html", colorPageData(c, "gradient"))
}

// ColorImagePickerPage renders the image color extractor.
func ColorImagePickerPage(c *gin.Context) {
	render(c, "color/tools.html", colorPageData(c, "image-picker"))
}

// ColorBlindnessPage renders the color blindness simulator.
func ColorBlindnessPage(c *gin.Context) {
	render(c, "color/tools.html", colorPageData(c, "blindness"))
}

// ColorNamesPage renders the color names library.
func ColorNamesPage(c *gin.Context) {
	render(c, "color/tools.html", colorPageData(c, "names"))
}

// ColorMixerPage renders the color mixer.
func ColorMixerPage(c *gin.Context) {
	render(c, "color/tools.html", colorPageData(c, "mixer"))
}

// ColorTailwindPage renders the Tailwind color generator.
func ColorTailwindPage(c *gin.Context) {
	render(c, "color/tools.html", colorPageData(c, "tailwind"))
}

