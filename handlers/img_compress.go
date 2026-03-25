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

	switch lang {
	case "zh":
		faqs = []ImgFAQ{
			{Q: "图片会上传到服务器吗？", A: "不会。压缩全程在您的浏览器内完成，使用 Canvas API 和 WebAssembly 技术，图片文件不会发送到任何服务器。"},
			{Q: "支持哪些图片格式？", A: "支持所有主流图片格式，包括 JPG/JPEG、PNG、WebP、GIF、BMP、TIFF 等，所有格式都可以压缩和转换。"},
			{Q: "压缩效果大概有多少？", A: "JPEG 通常可压缩 40–80%，PNG 可压缩 50–90%，具体效果因图片内容而异。可调整质量滑块在文件大小与画质之间取得平衡。"},
			{Q: "有文件数量或大小限制吗？", A: "每张图片最大 10MB，每次最多同时处理 20 张，无每日/每月次数限制，完全免费。"},
			{Q: "可以批量转换图片格式吗？", A: "可以。在压缩的同时选择目标格式（JPG/PNG/WebP），所有图片会在压缩时一并转换，无需额外操作。"},
		}
	case "ja":
		faqs = []ImgFAQ{
			{Q: "画像はサーバーにアップロードされますか？", A: "いいえ。圧縮はすべてブラウザ内でCanvas APIとWebAssemblyを使用して行われます。画像ファイルはいかなるサーバーにも送信されません。"},
			{Q: "対応している画像形式は？", A: "JPG/JPEG、PNG、WebP、GIF、BMP、TIFFなどすべての主要形式に対応。すべての形式を圧縮・変換できます。"},
			{Q: "どれくらい圧縮できますか？", A: "JPEGは通常40〜80%、PNGは50〜90%削減できます。品質スライダーでファイルサイズと画質のバランスを調整できます。"},
			{Q: "ファイル数やサイズの制限はありますか？", A: "1ファイル最大10MB、同時に最大20枚まで処理可能。毎日・毎月の利用制限はなく、完全無料です。"},
			{Q: "一括で形式変換できますか？", A: "はい。圧縮と同時に出力形式（JPG/PNG/WebP）を選択すれば、すべての画像が自動的に変換されます。"},
		}
	case "ko":
		faqs = []ImgFAQ{
			{Q: "이미지가 서버에 업로드되나요?", A: "아니요. 모든 압축은 Canvas API와 WebAssembly를 사용하여 브라우저 내에서 완전히 처리됩니다. 이미지 파일은 어떤 서버에도 전송되지 않습니다."},
			{Q: "어떤 이미지 형식을 지원하나요?", A: "JPG/JPEG, PNG, WebP, GIF, BMP, TIFF 등 모든 주요 형식을 지원합니다. 모든 형식을 압축하고 변환할 수 있습니다."},
			{Q: "압축 효과는 얼마나 됩니까?", A: "JPEG는 일반적으로 40~80%, PNG는 50~90% 줄일 수 있습니다. 품질 슬라이더로 파일 크기와 화질의 균형을 조절하세요."},
			{Q: "파일 수나 크기 제한이 있나요?", A: "파일당 최대 10MB, 한 번에 최대 20장 처리 가능. 일별·월별 이용 제한 없이 완전 무료입니다."},
			{Q: "일괄 형식 변환이 가능한가요?", A: "네. 압축과 동시에 출력 형식(JPG/PNG/WebP)을 선택하면 모든 이미지가 자동으로 변환됩니다."},
		}
	case "spa":
		faqs = []ImgFAQ{
			{Q: "¿Las imágenes se suben al servidor?", A: "No. Toda la compresión se realiza en tu navegador usando la API Canvas y WebAssembly. Tus archivos de imagen nunca se envían a ningún servidor."},
			{Q: "¿Qué formatos de imagen son compatibles?", A: "Todos los formatos principales: JPG/JPEG, PNG, WebP, GIF, BMP, TIFF y más. Todos pueden comprimirse y convertirse."},
			{Q: "¿Cuánto se pueden comprimir las imágenes?", A: "Normalmente un 40–80% para JPEG y 50–90% para PNG. Los resultados varían según el contenido. Ajusta el control deslizante para equilibrar tamaño y calidad."},
			{Q: "¿Hay límite de archivos o tamaño?", A: "Hasta 10 MB por archivo y 20 imágenes a la vez. Sin límite diario ni mensual. Completamente gratis."},
			{Q: "¿Se puede convertir el formato en lote?", A: "Sí. Al comprimir, elige el formato de salida (JPG/PNG/WebP) y todas las imágenes se convierten automáticamente al mismo tiempo."},
		}
	default:
		faqs = []ImgFAQ{
			{Q: "Is image compression done on the server?", A: "No. All compression happens entirely in your browser using Canvas API and WebAssembly. Your images are never uploaded to any server."},
			{Q: "What formats are supported?", A: "All major formats: JPG/JPEG, PNG, WebP, GIF, BMP, TIFF and more. All can be compressed and converted."},
			{Q: "How much can images be compressed?", A: "Typically 40–80% for JPEG and 50–90% for PNG. Results vary by image content. Adjust the quality slider to balance file size and visual quality."},
			{Q: "Is there a file size or count limit?", A: "Up to 10 MB per file, 20 images at once, no daily or monthly limit. Completely free."},
			{Q: "Can I batch convert image formats?", A: "Yes. While compressing, choose your output format (JPG/PNG/WebP) and all images convert automatically at the same time."},
		}
	}

	data := baseData(c, gin.H{
		"Title":       t("img.compress.seo.title"),
		"Description": t("img.compress.seo.desc"),
		"Keywords":    "image compressor, compress jpg online, compress png online, compress webp, batch image compress, reduce image size, optimize images, no upload, browser image compression, free image compressor",
		"PageClass":   "page-img-compress",
		"FAQs":        faqs,
	})
	render(c, "img_compress.html", data)
}
