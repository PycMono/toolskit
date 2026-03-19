package handlers

import (
	"github.com/gin-gonic/gin"
)

// ImgCompressPage renders the image compression page
func ImgCompressPage(c *gin.Context) {
	t := getT(c)
	lang := c.GetString("lang")

	type ImgFAQ struct {
		Q string
		A string
	}

	var faqs []ImgFAQ

	if lang == "zh" {
		faqs = []ImgFAQ{
			{Q: "图片会上传到服务器吗？",
				A: "不会。压缩全程在您的浏览器内完成，使用 Canvas API 和 WebAssembly 技术，图片文件不会发送到任何服务器。"},
			{Q: "支持哪些图片格式？",
				A: "支持所有主流图片格式，包括 JPG/JPEG、PNG、WebP、GIF、BMP、TIFF 等。所有格式都可以压缩和转换。"},
			{Q: "压缩效果大概有多少？",
				A: "JPEG 通常可压缩 40–80%，PNG 可压缩 50–90%，具体效果因图片内容而异。您可以调整质量滑块在文件大小与画质之间取得平衡。"},
			{Q: "有文件数量或大小限制吗？",
				A: "每张图片最大 10MB，每次最多同时处理 20 张，无每日/每月次数限制。"},
			{Q: "文件名会被修改吗？",
				A: "不会。下载的文件保留原始文件名（若转换了格式，扩展名会相应更新）。"},
		}
	} else {
		faqs = []ImgFAQ{
			{Q: "Is image compression done on the server?",
				A: "No. All compression happens entirely in your browser using Canvas API and WebAssembly. Your images are never uploaded to any server."},
			{Q: "What formats are supported?",
				A: "All major image formats are supported, including JPG/JPEG, PNG, WebP, GIF, BMP, TIFF, and more. All formats can be compressed and converted."},
			{Q: "How much can images be compressed?",
				A: "Typically 40–80% for JPEG and 50–90% for PNG. Results vary by image content. You can adjust the quality slider to balance file size and visual quality."},
			{Q: "Is there a file size or count limit?",
				A: "Each file can be up to 10MB. You can process up to 20 images at once. There is no daily or monthly limit."},
			{Q: "Will the file name be changed?",
				A: "No. The original file name is preserved. Downloaded files have the same name as the original (with the extension updated if you convert the format)."},
		}
	}

	data := baseData(c, gin.H{
		"Title":       t("img.compress.seo.title"),
		"Description": t("img.compress.seo.desc"),
		"Keywords":    "图片压缩,在线压缩图片,PNG压缩,JPG压缩,WebP压缩,免费压缩图片,不上传服务器,image compressor,compress jpg,compress png",
		"PageClass":   "page-img-compress",
		"FAQs":        faqs,
	})
	render(c, "img_compress.html", data)
}
