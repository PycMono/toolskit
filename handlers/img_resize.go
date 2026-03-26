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

	switch lang {
	case "zh":
		faqs = []ImgFAQ{
			{Q: "支持哪些图片格式？",
				A: "支持 JPG/JPEG、PNG 和 WebP 的输入与输出。调整大小的同时还可以转换图片格式，无需额外操作。"},
			{Q: "调整大小后画质会受影响吗？",
				A: "缩小图片通常能很好地保持画质。放大图片会有一定程度的画质损失。您可以通过质量滑块（适用于 JPG 和 WebP）在文件大小和画质之间取得平衡。"},
			{Q: "如何保持图片宽高比？",
				A: "默认启用宽高比锁定（宽高输入框之间显示链条图标）。点击链条图标可解锁，独立输入宽度和高度，适合创意裁剪或特殊格式需求。"},
			{Q: "像素、百分比和预设三种模式有何区别？",
				A: "像素模式用于指定精确的输出尺寸（如 1920×1080）；百分比模式按原图比例缩放（如 50% 即缩小一半）；预设模式提供常用社交媒体尺寸，一键应用，无需手动计算。"},
			{Q: "调整大小的操作安全吗？图片会上传到服务器吗？",
				A: "完全安全。调整大小的操作全程在您的浏览器内完成，使用 Canvas API 技术处理，图片文件不会发送到任何服务器，完全保护您的隐私。"},
			{Q: "输出格式有哪些选择？",
				A: "可选保持原格式、转为 JPG（兼容性最广）、转为 PNG（无损高质量）或转为 WebP（文件体积最小）。JPG 和 WebP 还支持质量滑块，方便您精细控制文件大小。"},
		}
	case "ja":
		faqs = []ImgFAQ{
			{Q: "対応している画像形式は？",
				A: "JPG/JPEG・PNG・WebPの入出力に対応。リサイズと同時に形式変換も可能です。"},
			{Q: "リサイズ後に画質は劣化しますか？",
				A: "縮小は画質をよく保ちます。拡大は多少の劣化が生じます。品質スライダー（JPG・WebP）でサイズと画質のバランスを調整できます。"},
			{Q: "アスペクト比を維持するには？",
				A: "デフォルトでアスペクト比ロックが有効です（幅・高さ入力間にチェーンアイコン）。クリックでロック解除し、独立した値を入力できます。"},
			{Q: "ピクセル・パーセンテージ・プリセットの違いは？",
				A: "ピクセルモードは正確な出力サイズを指定します。パーセンテージモードは元の割合でスケーリングします。プリセットモードはSNS向けの定番サイズをワンクリックで適用できます。"},
			{Q: "画像はサーバーに送信されますか？",
				A: "送信されません。すべての処理はCanvas APIを使用してブラウザ内で完結します。画像ファイルはいかなるサーバーにも送信されません。"},
			{Q: "出力形式はどれを選べますか？",
				A: "元の形式を維持・JPG（最大互換性）・PNG（ロスレス品質）・WebP（最小ファイルサイズ）から選択できます。JPGとWebPは品質スライダーでファイルサイズと画質のバランスを調整できます。"},
		}
	case "ko":
		faqs = []ImgFAQ{
			{Q: "어떤 이미지 형식을 지원하나요?",
				A: "JPG/JPEG, PNG, WebP 입출력을 지원합니다. 크기 조정과 동시에 형식 변환도 가능합니다."},
			{Q: "크기 조정 후 화질이 저하되나요?",
				A: "축소는 화질을 잘 유지합니다. 확대 시 약간의 품질 손실이 발생할 수 있습니다. 품질 슬라이더(JPG/WebP)로 파일 크기와 화질의 균형을 조절하세요."},
			{Q: "가로세로 비율을 유지하려면?",
				A: "기본적으로 비율 잠금이 활성화되어 있습니다(너비·높이 입력 사이의 체인 아이콘). 클릭하여 잠금 해제하면 독립적인 값을 입력할 수 있습니다."},
			{Q: "픽셀·퍼센트·프리셋 모드의 차이는?",
				A: "픽셀 모드는 정확한 출력 크기를 지정합니다. 퍼센트 모드는 원본 비율로 크기를 조절합니다. 프리셋 모드는 SNS 맞춤 크기를 한 번에 적용합니다."},
			{Q: "이미지가 서버에 업로드되나요?",
				A: "아니요. 모든 처리는 Canvas API를 사용하여 브라우저 내에서 완전히 이루어집니다. 이미지 파일은 어떤 서버에도 전송되지 않습니다."},
			{Q: "출력 형식은 어떤 것을 선택할 수 있나요?",
				A: "원본 유지, JPG(최대 호환성), PNG(무손실 품질), WebP(가장 작은 파일)를 선택할 수 있습니다. JPG·WebP는 품질 슬라이더로 파일 크기와 화질을 세밀하게 조절할 수 있습니다."},
		}
	case "spa":
		faqs = []ImgFAQ{
			{Q: "¿Qué formatos de imagen son compatibles?",
				A: "JPG/JPEG, PNG y WebP son compatibles tanto para entrada como para salida. También puedes convertir entre formatos mientras redimensionas."},
			{Q: "¿Se pierde calidad al redimensionar?",
				A: "Reducir el tamaño generalmente preserva bien la calidad. Al ampliar puede producirse alguna pérdida. El control deslizante de calidad (JPG/WebP) te permite equilibrar tamaño y calidad."},
			{Q: "¿Cómo mantengo la relación de aspecto?",
				A: "El bloqueo de relación de aspecto está activado por defecto (icono de cadena entre ancho y alto). Haz clic para desbloquear e introducir valores independientes."},
			{Q: "¿Cuál es la diferencia entre píxeles, porcentaje y presets?",
				A: "El modo Píxeles especifica dimensiones exactas de salida. El modo Porcentaje escala la imagen en relación al tamaño original. El modo Presets aplica tamaños habituales de redes sociales con un solo clic."},
			{Q: "¿Se sube el archivo al servidor al redimensionar?",
				A: "No. Todo el procesamiento se realiza localmente en tu navegador usando la API Canvas. Los archivos de imagen nunca se envían a ningún servidor."},
			{Q: "¿Qué formatos de salida puedo elegir?",
				A: "Puedes mantener el formato original, convertir a JPG (máxima compatibilidad), PNG (calidad sin pérdidas) o WebP (archivo más pequeño). Para JPG y WebP, el control de calidad permite ajustar el equilibrio entre tamaño y fidelidad visual."},
		}
	default:
		faqs = []ImgFAQ{
			{Q: "What image formats are supported?",
				A: "JPG/JPEG, PNG, and WebP are supported for both input and output. You can also convert between formats while resizing in a single step."},
			{Q: "Will resizing affect image quality?",
				A: "Scaling down generally preserves quality well. When scaling up, some quality loss is expected. You can adjust the output quality slider (for JPG and WebP) to balance file size and visual quality."},
			{Q: "How do I keep the aspect ratio?",
				A: "The aspect ratio lock is enabled by default (shown as a chain icon between width and height). Click the chain icon to unlock and enter custom width and height independently."},
			{Q: "What is the difference between Pixels, Percentage and Preset modes?",
				A: "Pixel mode lets you specify exact output dimensions. Percentage mode scales the image relative to its original size. Preset mode applies common social media sizes with a single click — no manual calculation needed."},
			{Q: "Are my images uploaded to a server?",
				A: "No. All processing is done entirely in your browser using the Canvas API. Your images are never uploaded to any server, ensuring complete privacy."},
			{Q: "What output formats can I choose?",
				A: "You can keep the original format, convert to JPG (widest compatibility), PNG (lossless quality), or WebP (smallest file size). A quality slider is available for JPG and WebP to fine-tune the file-size-to-quality trade-off."},
		}
	}

	data := baseData(c, gin.H{
		"Title":       t("img.resize.seo.title"),
		"Description": t("img.resize.seo.desc"),
		"Keywords":    "image resizer,resize image online,resize jpg,resize png,resize webp,social media image sizes,instagram resize,facebook resize,twitter resize,batch image resize,free image resizer,browser image resize,no upload,image format converter,aspect ratio resize,percentage resize,tiktok resize,youtube resize,linkedin resize,pinterest resize,webp converter",
		"PageClass":   "page-img-resize",
		"FAQs":        faqs,
	})
	render(c, "img_resize.html", data)
}

