package handlers

import (
	"github.com/gin-gonic/gin"
)

// ImgResizePage renders the image resize page
func ImgResizePage(c *gin.Context) {
	t := getT(c)
	lang := c.GetString("lang")

	type ImgFAQ struct {
		Q string
		A string
	}

	var faqs []ImgFAQ

	if lang == "zh" {
		faqs = []ImgFAQ{
			{Q: "调整大小会上传到服务器吗？",
				A: "不会。调整大小的操作全程在您的浏览器内完成，使用 Canvas API 技术处理，图片文件不会发送到任何服务器，完全保护您的隐私。"},
			{Q: "支持哪些图片格式？",
				A: "支持 JPG/JPEG、PNG 和 WebP 的输入与输出。调整大小的同时还可以转换图片格式。"},
			{Q: "调整大小后画质会受影响吗？",
				A: "缩小图片通常能很好地保持画质。放大图片会有一定程度的画质损失。您可以通过质量滑块（适用于 JPG 和 WebP）在文件大小和画质之间取得平衡。"},
			{Q: "可以批量调整多张图片吗？",
				A: "可以。最多同时上传 20 张图片，所有图片将按您设置的尺寸统一处理，可单张下载或打包为 ZIP 一次性下载。"},
			{Q: "如何保持图片宽高比？",
				A: "默认启用宽高比锁定（宽高输入框之间显示链条图标）。点击链条图标可解锁，独立输入宽度和高度。"},
			{Q: "有哪些预设尺寸？",
				A: "预设包含常用社交媒体尺寸：Instagram 帖子（1080×1080）、Instagram 故事（1080×1920）、Facebook 封面（820×312）、Twitter/X 帖子（1200×675）、YouTube 缩略图（1280×720）、LinkedIn 帖子（1200×627）等。"},
		}
	} else {
		faqs = []ImgFAQ{
			{Q: "Does resizing happen on the server?",
				A: "No. All resizing is done entirely in your browser using the Canvas API. Your images are never uploaded to any server, ensuring complete privacy."},
			{Q: "What image formats are supported?",
				A: "JPG/JPEG, PNG, and WebP are supported for both input and output. You can also convert between formats while resizing."},
			{Q: "Will resizing affect image quality?",
				A: "Scaling down generally preserves quality well. When scaling up, some quality loss is expected. You can adjust the output quality slider (for JPG and WebP) to balance file size and visual quality."},
			{Q: "Can I resize multiple images at once?",
				A: "Yes. You can upload up to 20 images at a time. All images will be resized to the same dimensions you set. Download them individually or as a ZIP file."},
			{Q: "How do I keep the aspect ratio?",
				A: "The aspect ratio lock is enabled by default (shown as a chain icon between width and height). Click the chain icon to unlock and enter custom width and height independently."},
			{Q: "What are the preset sizes?",
				A: "Presets include common social media sizes: Instagram Post (1080×1080), Instagram Story (1080×1920), Facebook Cover (820×312), Twitter/X Post (1200×675), YouTube Thumbnail (1280×720), LinkedIn Post (1200×627), and more."},
		}
	}

	data := baseData(c, gin.H{
		"Title":       t("img.resize.seo.title"),
		"Description": t("img.resize.seo.desc"),
		"Keywords":    "图片调整大小,在线调整图片尺寸,图片缩放,调整图片像素,批量调整大小,免费调整图片,不上传服务器,image resizer,resize jpg,resize png,resize image online",
		"PageClass":   "page-img-resize",
		"FAQs":        faqs,
	})
	render(c, "img_resize.html", data)
}

