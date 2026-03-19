package handlers

import (
	"github.com/gin-gonic/gin"
)

type QRFAQ struct{ Q, A string }

func getQRFAQs(lang string) []QRFAQ {
	if lang == "en" {
		return []QRFAQ{
			{Q: "Are the generated QR codes free?",
				A: "Yes, all QR codes generated on this tool are completely free. You can use them for personal or commercial purposes without any restrictions."},
			{Q: "Do the QR codes expire?",
				A: "No. Static QR codes never expire. As long as the destination content (e.g., the URL) remains valid, the QR code will keep working forever."},
			{Q: "Can I add my logo to the QR code?",
				A: "Yes! You can upload any image as a logo to embed in the center of your QR code. We recommend using high error correction level (Q or H) when adding logos."},
			{Q: "What image formats can I download?",
				A: "You can download in PNG (high-resolution 2048px), SVG (vector, infinite scale), JPG, and EPS (for professional printing)."},
			{Q: "What is the difference between QR code types?",
				A: "Different types encode different data: URL opens a website, vCard saves contact info, WiFi connects to a network, SMS sends a text, Email drafts a message, Bitcoin handles crypto payments, etc."},
			{Q: "How do I scan a QR code?",
				A: "On iOS and most Android devices, just open the camera app and point it at the QR code. A notification will appear to open the link or action. No app needed."},
		}
	}
	return []QRFAQ{
		{Q: "生成的二维码免费吗？",
			A: "是的，本工具生成的所有二维码完全免费，可用于个人或商业用途，无任何限制。"},
		{Q: "二维码会过期吗？",
			A: "不会。静态二维码永久有效，只要目标内容（如网址）依然可访问，二维码就会一直有效。"},
		{Q: "可以在二维码中加入 Logo 吗？",
			A: "可以！你可以上传任意图片作为 Logo 嵌入到二维码中央。添加 Logo 时建议使用较高的纠错级别（Q 或 H）。"},
		{Q: "可以下载哪些格式？",
			A: "支持下载 PNG（高清 2048px）、SVG（矢量图，无限缩放）、JPG 以及 EPS（专业印刷用）。"},
		{Q: "各种类型的二维码有什么区别？",
			A: "不同类型编码不同内容：URL 打开网站、vCard 保存联系人、WiFi 自动连接网络、短信预设文字、邮件预填内容、比特币用于加密货币支付等。"},
		{Q: "如何扫描二维码？",
			A: "在 iOS 和大多数 Android 设备上，只需打开相机 App 对准二维码即可。无需安装专门的扫码 App。"},
	}
}

// QRPage renders the QR code generator page
func QRPage(c *gin.Context) {
	lang := c.GetString("lang")

	seoTitle := map[string]string{
		"zh": "二维码生成器 — 免费在线生成 QR 码 | Tool Box Nova",
		"en": "QR Code Generator — Create Free QR Codes Online | Tool Box Nova",
	}
	seoDesc := map[string]string{
		"zh": "免费在线二维码生成器，支持 URL、名片、WiFi、短信、邮件、比特币等 8 种类型，自定义颜色、形状、Logo，下载 PNG/SVG/JPG/EPS。",
		"en": "Free online QR code generator. Create QR codes for URLs, vCards, WiFi, SMS, Email, Bitcoin and more. Custom colors, shapes, logos. Download PNG, SVG, JPG, EPS.",
	}
	seoKeywords := map[string]string{
		"zh": "二维码生成器,QR码生成,在线二维码,免费二维码,自定义二维码,URL二维码,WiFi二维码,名片二维码",
		"en": "qr code generator,free qr code,online qr code,custom qr code,url qr code,wifi qr code,vcard qr code",
	}

	// Default type from query param
	qrType := c.DefaultQuery("type", "url")
	validTypes := map[string]bool{
		"url": true, "vcard": true, "text": true, "sms": true,
		"email": true, "wifi": true, "twitter": true, "bitcoin": true,
	}
	if !validTypes[qrType] {
		qrType = "url"
	}

	data := baseData(c, gin.H{
		"Title":       seoTitle[lang],
		"Description": seoDesc[lang],
		"Keywords":    seoKeywords[lang],
		"PageClass":   "page-qr",
		"CurrentType": qrType,
		"FAQs":        getQRFAQs(lang),
	})
	render(c, "media/qr.html", data)
}

// QRGeneratorPage is an alias for QRPage (for legacy route compatibility)
func QRGeneratorPage(c *gin.Context) {
	QRPage(c)
}

