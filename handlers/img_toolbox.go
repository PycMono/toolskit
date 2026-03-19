package handlers

import (
	"github.com/gin-gonic/gin"
)

// ─── shared FAQ type ──────────────────────────────────────────
type ToolboxFAQ struct {
	Q string
	A string
}

// ─── /img/crop ───────────────────────────────────────────────
func ImgCropPage(c *gin.Context) {
	t := getT(c)
	lang := getLang(c)

	var faqs []ToolboxFAQ
	if lang == "zh" {
		faqs = []ToolboxFAQ{
			{Q: "支持哪些图片格式？", A: "支持 JPG、PNG、WEBP、GIF、BMP、SVG 等主流格式，上传后自动识别。"},
			{Q: "裁剪后图片质量会下降吗？", A: "不会。裁剪操作通过 Canvas 无损完成，输出画质与原图一致。"},
			{Q: "我的图片会上传到服务器吗？", A: "不会。所有处理均在您的浏览器本地完成，图片文件不会离开您的设备。"},
			{Q: "可以批量裁剪多张图片吗？", A: "支持！您可以一次上传多张图片，系统会按照相同的裁剪参数批量处理。"},
			{Q: "如何精确裁剪到指定尺寸？", A: "在选项面板中切换到「自定义尺寸」模式，输入目标宽高（像素）即可精确裁剪。"},
		}
	} else {
		faqs = []ToolboxFAQ{
			{Q: "What image formats can I crop?", A: "JPG, PNG, WEBP, GIF, BMP and SVG are all supported and auto-detected on upload."},
			{Q: "Will cropping reduce image quality?", A: "No. Cropping is performed losslessly via Canvas API and output quality matches the original."},
			{Q: "Are my images uploaded to your servers?", A: "Never. All processing happens locally in your browser — your files never leave your device."},
			{Q: "Can I crop multiple images at once?", A: "Yes! Upload multiple files and the same crop parameters will be applied to all of them in batch."},
			{Q: "How do I crop to an exact pixel size?", A: "Switch to 'Custom Size' mode in the options panel, enter your target width and height in pixels."},
		}
	}

	data := baseData(c, gin.H{
		"Title":       t("seo.crop.title"),
		"Description": t("seo.crop.description"),
		"Keywords":    t("seo.crop.keywords"),
		"PageClass":   "page-img-crop",
		"FAQs":        faqs,
		"CurrentTool": "crop",
	})
	render(c, "img/crop.html", data)
}

// ─── /img/convert-to-jpg ─────────────────────────────────────
func ImgConvertToJpgPage(c *gin.Context) {
	t := getT(c)
	lang := getLang(c)

	var faqs []ToolboxFAQ
	if lang == "zh" {
		faqs = []ToolboxFAQ{
			{Q: "支持哪些格式转换为JPG？", A: "支持 PNG、WEBP、GIF、BMP、SVG 和 TIFF 转换为 JPG。"},
			{Q: "质量滑块有什么作用？", A: "控制 JPG 压缩级别。质量越高文件越大；质量越低文件越小但会有损失。"},
			{Q: "图片透明背景会保留吗？", A: "JPG 不支持透明度。透明区域默认填充为白色背景。"},
			{Q: "有文件大小限制吗？", A: "每个文件不超过 20MB，一次最多处理 30 个文件。"},
			{Q: "可以转换动态GIF吗？", A: "可以，但只会转换 GIF 的第一帧为静态 JPG。"},
		}
	} else {
		faqs = []ToolboxFAQ{
			{Q: "Which formats can I convert to JPG?", A: "PNG, WEBP, GIF, BMP, SVG and TIFF can all be converted to JPG."},
			{Q: "What does the quality slider do?", A: "It controls JPG compression level. Higher quality means larger file size; lower quality means smaller files with some loss."},
			{Q: "Will transparent backgrounds be preserved?", A: "JPG does not support transparency. Transparent areas will be filled with a white background by default."},
			{Q: "Is there a file size limit?", A: "Each file must be under 20MB, and you can process up to 30 files at once."},
			{Q: "Can I convert animated GIFs to JPG?", A: "Yes, but only the first frame of the GIF will be converted to a static JPG."},
		}
	}

	data := baseData(c, gin.H{
		"Title":       t("seo.to_jpg.title"),
		"Description": t("seo.to_jpg.description"),
		"Keywords":    t("seo.to_jpg.keywords"),
		"PageClass":   "page-img-to-jpg",
		"FAQs":        faqs,
		"CurrentTool": "to-jpg",
	})
	render(c, "img/convert_to_jpg.html", data)
}

// ─── /img/jpg-to-image ───────────────────────────────────────
func ImgJpgToImagePage(c *gin.Context) {
	t := getT(c)
	lang := getLang(c)

	var faqs []ToolboxFAQ
	if lang == "zh" {
		faqs = []ToolboxFAQ{
			{Q: "JPG可以转换为哪些格式？", A: "可以将 JPG 转换为 PNG、WEBP、GIF、BMP 等格式。"},
			{Q: "哪种格式支持透明背景？", A: "PNG 和 WEBP 均支持透明背景，PNG 的兼容性更广泛。"},
			{Q: "WEBP是什么格式，有什么优势？", A: "WEBP 是 Google 开发的现代图片格式，在相同质量下比 JPG 体积更小。"},
			{Q: "转换会影响图片质量吗？", A: "转换为 PNG 是无损的。转换为 WEBP 在默认设置下质量损失极小。"},
			{Q: "可以批量转换多个JPG文件吗？", A: "支持！一次上传最多 30 个 JPG 文件，一键转换为您选择的格式。"},
		}
	} else {
		faqs = []ToolboxFAQ{
			{Q: "Which formats can I convert JPG to?", A: "You can convert JPG to PNG, WEBP, GIF, BMP and more formats."},
			{Q: "Which format should I choose for transparency?", A: "PNG and WEBP both support transparency. Choose PNG for maximum compatibility."},
			{Q: "What is WEBP and why use it?", A: "WEBP is a modern format by Google that provides better compression than JPG while maintaining quality."},
			{Q: "Will converting change the image quality?", A: "Converting to PNG is lossless. Converting to WEBP may have minimal quality loss at default settings."},
			{Q: "Can I batch convert multiple JPG files?", A: "Yes, upload up to 30 JPG files and convert them all to your chosen format at once."},
		}
	}

	data := baseData(c, gin.H{
		"Title":       t("seo.jpg_to.title"),
		"Description": t("seo.jpg_to.description"),
		"Keywords":    t("seo.jpg_to.keywords"),
		"PageClass":   "page-jpg-to-image",
		"FAQs":        faqs,
		"CurrentTool": "jpg-to",
	})
	render(c, "img/jpg_to_image.html", data)
}

// ─── /img/photo-editor ───────────────────────────────────────
func ImgPhotoEditorPage(c *gin.Context) {
	t := getT(c)
	lang := getLang(c)

	var faqs []ToolboxFAQ
	if lang == "zh" {
		faqs = []ToolboxFAQ{
			{Q: "可以调整哪些图片参数？", A: "支持调整亮度、对比度、饱和度、锐化和模糊，拖动滑块实时预览。"},
			{Q: "可以在下载前预览效果吗？", A: "可以，Canvas 预览区会随着滑块实时更新（500ms防抖）。"},
			{Q: "如何重置所有调整？", A: "点击「重置」按钮，所有滑块恢复到默认中性值。"},
			{Q: "编辑会修改原始文件吗？", A: "不会。原始文件从不被修改，您下载的只是编辑后的副本。"},
			{Q: "可以批量编辑多张照片吗？", A: "支持！相同的调整参数会应用到所有上传的图片上。"},
		}
	} else {
		faqs = []ToolboxFAQ{
			{Q: "What adjustments can I make to my photos?", A: "You can adjust brightness, contrast, saturation, sharpness and blur using real-time sliders."},
			{Q: "Can I preview changes before downloading?", A: "Yes, the canvas preview updates in real time as you move any slider (with a 500ms debounce)."},
			{Q: "Can I reset all adjustments?", A: "Yes, click the 'Reset' button to restore all sliders to their default neutral values."},
			{Q: "Does editing affect the original file?", A: "No, your original file is never modified. You download only the edited version."},
			{Q: "Can I edit multiple photos at once?", A: "Yes, the same adjustment settings are applied to all uploaded photos in batch."},
		}
	}

	data := baseData(c, gin.H{
		"Title":       t("seo.editor.title"),
		"Description": t("seo.editor.description"),
		"Keywords":    t("seo.editor.keywords"),
		"PageClass":   "page-photo-editor",
		"FAQs":        faqs,
		"CurrentTool": "photo-editor",
	})
	render(c, "img/photo_editor.html", data)
}

// ─── /img/remove-bg ──────────────────────────────────────────
func ImgRemoveBgPage(c *gin.Context) {
	t := getT(c)
	lang := getLang(c)

	var faqs []ToolboxFAQ
	if lang == "zh" {
		faqs = []ToolboxFAQ{
			{Q: "AI抠图是如何工作的？", A: "我们使用基于 WebAssembly 的 AI 模型，完全在您的浏览器中运行，不会向任何服务器发送数据。"},
			{Q: "什么类型的图片效果最好？", A: "主体与背景对比清晰的图片效果最佳，如人像、产品图和 Logo。"},
			{Q: "处理需要多长时间？", A: "首次运行需下载 AI 模型（约10秒）。后续每张图片处理约需 2-5 秒。"},
			{Q: "输出格式是什么？", A: "输出为带透明背景的 PNG 文件，可直接用于任何背景。"},
			{Q: "图片大小有限制吗？", A: "每张图片建议不超过 20MB 以获得最佳性能，过大的图片可能会降低 AI 处理速度。"},
		}
	} else {
		faqs = []ToolboxFAQ{
			{Q: "How does background removal work?", A: "We use an AI model powered by WebAssembly that runs entirely in your browser — no data is sent to any server."},
			{Q: "What types of images work best?", A: "Images with clear subject-background contrast work best. Portraits, products and logos give great results."},
			{Q: "How long does processing take?", A: "The first run downloads the AI model (about 10 seconds). Subsequent images process in 2–5 seconds each."},
			{Q: "What format is the output?", A: "The output is a PNG with a transparent background, ready to use on any background."},
			{Q: "Is there a limit on image size?", A: "Each image should be under 20MB for best performance. Larger images may slow down the AI model."},
		}
	}

	data := baseData(c, gin.H{
		"Title":       t("seo.remove_bg.title"),
		"Description": t("seo.remove_bg.description"),
		"Keywords":    t("seo.remove_bg.keywords"),
		"PageClass":   "page-remove-bg",
		"FAQs":        faqs,
		"CurrentTool": "remove-bg",
	})
	render(c, "img/remove_bg.html", data)
}

// ─── /img/watermark ──────────────────────────────────────────
func ImgWatermarkPage(c *gin.Context) {
	t := getT(c)
	lang := getLang(c)

	var faqs []ToolboxFAQ
	if lang == "zh" {
		faqs = []ToolboxFAQ{
			{Q: "可以同时添加文字和图片水印吗？", A: "可以选择文字水印（自定义字体和颜色）或图片水印（上传您的Logo），两种模式独立使用。"},
			{Q: "如何选择水印位置？", A: "使用 3×3 位置网格，点击您想要的位置：左上、居中、右下等，非常直观。"},
			{Q: "可以调整水印透明度吗？", A: "可以，透明度滑块支持 10% 到 100% 的调节。"},
			{Q: "添加水印会影响图片质量吗？", A: "不会，水印渲染在图片副本的 Canvas 上，输出质量与原图一致。"},
			{Q: "可以批量添加水印吗？", A: "支持！上传多张图片，相同的水印设置会应用到所有图片上。"},
		}
	} else {
		faqs = []ToolboxFAQ{
			{Q: "Can I add both text and image watermarks?", A: "Yes, you can choose between text watermark (custom font and color) or image watermark (upload your logo)."},
			{Q: "How do I choose the watermark position?", A: "Use the 3×3 position grid to click where you want the watermark: top-left, center, bottom-right, etc."},
			{Q: "Can I adjust watermark transparency?", A: "Yes, the opacity slider lets you set transparency from 10% to 100%."},
			{Q: "Will the watermark affect image quality?", A: "No, watermarks are rendered on a Canvas copy of your image. The output quality is identical to the original."},
			{Q: "Can I batch watermark multiple images?", A: "Yes, upload multiple images and the same watermark settings will be applied to all of them."},
		}
	}

	data := baseData(c, gin.H{
		"Title":       t("seo.watermark.title"),
		"Description": t("seo.watermark.description"),
		"Keywords":    t("seo.watermark.keywords"),
		"PageClass":   "page-watermark",
		"FAQs":        faqs,
		"CurrentTool": "watermark",
	})
	render(c, "img/watermark.html", data)
}

// ─── /img/rotate ─────────────────────────────────────────────
func ImgRotatePage(c *gin.Context) {
	t := getT(c)
	lang := getLang(c)

	var faqs []ToolboxFAQ
	if lang == "zh" {
		faqs = []ToolboxFAQ{
			{Q: "只能旋转90度吗，还是可以旋转任意角度？", A: "支持任意角度旋转，在角度输入框中输入任意数字（如45°）即可精确旋转。"},
			{Q: "旋转后图片尺寸会变化吗？", A: "旋转90°/180°时宽高互换。其他角度旋转时，画布会扩展以容纳旋转后的图片，边缘填充白色。"},
			{Q: "可以水平和垂直翻转图片吗？", A: "可以，水平翻转和垂直翻转是独立操作，可与旋转组合使用。"},
			{Q: "可以批量旋转多张图片吗？", A: "支持！所有旋转和翻转设置会统一应用到所有上传的图片上。"},
			{Q: "旋转后输出什么格式？", A: "输出格式与输入保持一致（JPG保持JPG，PNG保持PNG）。"},
		}
	} else {
		faqs = []ToolboxFAQ{
			{Q: "Can I rotate by any angle, not just 90°?", A: "Yes, type any angle (e.g. 45°) in the angle input box for precise rotation."},
			{Q: "What happens to the canvas size after rotation?", A: "For angles other than 90°/180°, the canvas expands to fit the rotated image; edges are filled with white."},
			{Q: "Can I flip images horizontally and vertically?", A: "Yes, the Flip Horizontal and Flip Vertical buttons are independent from rotation and can be combined."},
			{Q: "Can I batch rotate multiple images?", A: "Yes, all rotation and flip settings are applied uniformly to all uploaded images."},
			{Q: "What is the output format after rotation?", A: "The output keeps the same format as the input (JPG stays JPG, PNG stays PNG, etc.)."},
		}
	}

	data := baseData(c, gin.H{
		"Title":       t("seo.rotate.title"),
		"Description": t("seo.rotate.description"),
		"Keywords":    t("seo.rotate.keywords"),
		"PageClass":   "page-rotate",
		"FAQs":        faqs,
		"CurrentTool": "rotate",
	})
	render(c, "img/rotate.html", data)
}

