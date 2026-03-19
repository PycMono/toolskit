package handlers

import (
	"github.com/gin-gonic/gin"
)

// ImgMetadataPage renders the image metadata viewer page
func ImgMetadataPage(c *gin.Context) {
	lang := c.GetString("lang")

	type ImgMetadataFAQ struct {
		Q string
		A string
	}

	var faqs []ImgMetadataFAQ

	if lang == "zh" {
		faqs = []ImgMetadataFAQ{
			{
				Q: "图片会上传到服务器吗？",
				A: "不会。元数据提取完全在您的浏览器内完成，使用 exifr.js 库进行解析，图片文件不会发送到任何服务器，完全保护您的隐私。",
			},
			{
				Q: "支持哪些图片格式？",
				A: "支持 JPEG/JPG、PNG、WebP、TIFF 和 HEIC/HEIF 格式。EXIF 数据最常见于数码相机和智能手机拍摄的 JPEG 文件。",
			},
			{
				Q: "可以查看哪些元数据？",
				A: "可查看 EXIF 数据（相机品牌/型号、光圈、快门速度、ISO、焦距、拍摄时间）、GPS 位置（经纬度、海拔，含地图预览）、IPTC 数据（版权、作者、关键词、描述）以及 XMP 数据（评级、软件、色彩空间）。",
			},
			{
				Q: "为什么某些元数据缺失？",
				A: "社交媒体平台、即时通讯软件或图片编辑器可能会在处理图片时自动删除元数据。从 Instagram、微信等平台下载的图片，大部分 EXIF 数据已被删除。",
			},
			{
				Q: "可以在地图上看到 GPS 位置吗？",
				A: "可以。如果图片包含 GPS 坐标，我们会显示一个嵌入式 OpenStreetMap 预览地图，精确显示照片的拍摄地点。",
			},
			{
				Q: "如何导出元数据？",
				A: "分析完成后，可将元数据导出为 JSON（结构化数据）、CSV（表格格式）或 TXT（人类可读报告）。多张图片时，可打包下载全部结果为 ZIP。",
			},
		}
	} else {
		faqs = []ImgMetadataFAQ{
			{
				Q: "Is my image uploaded to a server?",
				A: "No. All metadata extraction is performed entirely in your browser using the exifr.js library. Your images are never sent to any server, ensuring complete privacy.",
			},
			{
				Q: "What image formats are supported?",
				A: "JPEG/JPG, PNG, WebP, TIFF, and HEIC/HEIF are supported. EXIF data is most commonly embedded in JPEG files from digital cameras and smartphones.",
			},
			{
				Q: "What metadata can I see?",
				A: "You can view EXIF data (camera make/model, aperture, shutter speed, ISO, focal length, date/time), GPS location (latitude, longitude, altitude with map preview), IPTC data (copyright, author, keywords, caption), and XMP data (rating, software, color space).",
			},
			{
				Q: "Why is some metadata missing?",
				A: "Metadata can be stripped by social media platforms, messaging apps, or photo editors. If you download a photo from Instagram or WhatsApp, most EXIF data will have been removed for privacy reasons.",
			},
			{
				Q: "Can I see the GPS location on a map?",
				A: "Yes. If your image contains GPS coordinates, we display an interactive OpenStreetMap preview showing exactly where the photo was taken.",
			},
			{
				Q: "How do I export the metadata?",
				A: "After analyzing your image, you can export the metadata as JSON (structured data), CSV (spreadsheet-compatible), or TXT (human-readable report). For multiple images, you can download all results as a ZIP file.",
			},
		}
	}

	seoTitle := map[string]string{
		"zh": "图片元数据查看 — 在线免费读取 EXIF/GPS/IPTC 信息 | Tool Box Nova",
		"en": "Image Metadata Viewer — Read EXIF, GPS, IPTC Data Online Free | Tool Box Nova",
	}
	seoDesc := map[string]string{
		"zh": "免费在线查看图片隐藏的元数据，支持 EXIF、GPS 位置（地图预览）、IPTC 版权、XMP 信息，图片不上传服务器，完全在浏览器内完成，支持导出 JSON/CSV/TXT。",
		"en": "Free online image metadata viewer. Read EXIF, GPS location (map preview), IPTC copyright, and XMP data. Files never leave your browser. Export as JSON, CSV or TXT.",
	}
	seoKeywords := map[string]string{
		"zh": "图片元数据查看,EXIF查看器,GPS坐标提取,IPTC版权信息,XMP数据,在线免费查看图片信息,照片拍摄地点,相机参数查看",
		"en": "image metadata viewer,EXIF viewer,GPS photo location,IPTC copyright,XMP data,read image metadata online,photo location finder,camera data extractor",
	}

	data := baseData(c, gin.H{
		"Title":       seoTitle[lang],
		"Description": seoDesc[lang],
		"Keywords":    seoKeywords[lang],
		"PageClass":   "page-img-metadata",
		"FAQs":        faqs,
	})
	render(c, "img_metadata.html", data)
}

