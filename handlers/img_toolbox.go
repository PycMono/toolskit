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
	switch lang {
	case "zh":
		faqs = []ToolboxFAQ{
			{Q: "支持哪些图片格式？", A: "支持 JPG、PNG、WEBP、GIF、BMP、SVG 等主流格式，上传后自动识别。"},
			{Q: "裁剪后图片质量会下降吗？", A: "不会。裁剪操作通过 Canvas 无损完成，输出画质与原图一致。"},
			{Q: "我的图片会上传到服务器吗？", A: "不会。所有处理均在您的浏览器本地完成，图片文件不会离开您的设备。"},
			{Q: "可以批量裁剪多张图片吗？", A: "支持！您可以一次上传多张图片，系统会按照相同的裁剪参数批量处理。"},
			{Q: "如何精确裁剪到指定尺寸？", A: "在选项面板中切换到「自定义尺寸」模式，输入目标宽高（像素）即可精确裁剪。"},
		}
	case "ja":
		faqs = []ToolboxFAQ{
			{Q: "対応している画像形式は？", A: "JPG・PNG・WebP・GIF・BMP・SVGなど主要形式に対応し、アップロード時に自動認識します。"},
			{Q: "切り抜き後に画質は落ちますか？", A: "いいえ。Canvas APIを使用した無損失処理で、出力画質は元の画像と同じです。"},
			{Q: "画像はサーバーにアップロードされますか？", A: "されません。すべての処理はブラウザ内でローカルに完結し、ファイルはデバイスを離れません。"},
			{Q: "複数の画像を一括切り抜きできますか？", A: "はい！複数ファイルをアップロードすると、同じ切り抜きパラメータが一括適用されます。"},
			{Q: "特定のサイズに正確に切り抜くには？", A: "「カスタムサイズ」モードに切り替え、目標の幅と高さ（ピクセル）を入力してください。"},
		}
	case "ko":
		faqs = []ToolboxFAQ{
			{Q: "어떤 이미지 형식을 지원하나요?", A: "JPG, PNG, WebP, GIF, BMP, SVG 등 주요 형식을 지원하며 업로드 시 자동 인식됩니다."},
			{Q: "자르기 후 화질이 저하되나요?", A: "아니요. Canvas API를 통한 무손실 처리로 출력 화질이 원본과 동일합니다."},
			{Q: "이미지가 서버에 업로드되나요?", A: "아니요. 모든 처리는 브라우저에서 로컬로 완료되며 파일이 기기를 벗어나지 않습니다."},
			{Q: "여러 이미지를 일괄 자를 수 있나요?", A: "네! 여러 파일을 업로드하면 동일한 자르기 설정이 일괄 적용됩니다."},
			{Q: "특정 크기로 정확히 자르려면?", A: "'사용자 지정 크기' 모드로 전환하고 목표 너비와 높이(픽셀)를 입력하세요."},
		}
	case "spa":
		faqs = []ToolboxFAQ{
			{Q: "¿Qué formatos de imagen son compatibles?", A: "JPG, PNG, WebP, GIF, BMP y SVG están soportados y se detectan automáticamente al subir."},
			{Q: "¿La calidad disminuye al recortar?", A: "No. El recorte se realiza sin pérdidas mediante Canvas API y la calidad de salida es idéntica al original."},
			{Q: "¿Mis imágenes se suben al servidor?", A: "Nunca. Todo el procesamiento ocurre localmente en tu navegador — los archivos no salen de tu dispositivo."},
			{Q: "¿Puedo recortar varias imágenes a la vez?", A: "¡Sí! Sube varios archivos y los mismos parámetros de recorte se aplicarán a todos en lote."},
			{Q: "¿Cómo recorto a un tamaño exacto en píxeles?", A: "Cambia al modo 'Tamaño personalizado' en el panel de opciones e introduce el ancho y alto objetivo en píxeles."},
		}
	default:
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
	switch lang {
	case "zh":
		faqs = []ToolboxFAQ{
			{Q: "支持哪些格式转换为JPG？", A: "支持 PNG、WEBP、GIF、BMP、SVG 和 TIFF 转换为 JPG。"},
			{Q: "质量滑块有什么作用？", A: "控制 JPG 压缩级别。质量越高文件越大；质量越低文件越小但会有损失。"},
			{Q: "图片透明背景会保留吗？", A: "JPG 不支持透明度。透明区域默认填充为白色背景。"},
			{Q: "有文件大小限制吗？", A: "每个文件不超过 20MB，一次最多处理 30 个文件。"},
			{Q: "可以转换动态GIF吗？", A: "可以，但只会转换 GIF 的第一帧为静态 JPG。"},
		}
	case "ja":
		faqs = []ToolboxFAQ{
			{Q: "JPGに変換できる形式は？", A: "PNG・WebP・GIF・BMP・SVG・TIFFをJPGに変換できます。"},
			{Q: "品質スライダーの役割は？", A: "JPGの圧縮レベルを制御します。高品質ほどファイルが大きくなり、低品質ほど小さくなりますが画質が低下します。"},
			{Q: "透明背景は保持されますか？", A: "JPGは透明度に対応していません。透明部分はデフォルトで白背景で塗りつぶされます。"},
			{Q: "ファイルサイズ制限はありますか？", A: "1ファイル最大20MB、一度に最大30ファイルまで処理できます。"},
			{Q: "アニメーションGIFを変換できますか？", A: "はい。ただしGIFの最初のフレームのみが静止JPGとして変換されます。"},
		}
	case "ko":
		faqs = []ToolboxFAQ{
			{Q: "JPG로 변환할 수 있는 형식은?", A: "PNG, WebP, GIF, BMP, SVG, TIFF를 JPG로 변환할 수 있습니다."},
			{Q: "품질 슬라이더의 역할은?", A: "JPG 압축 수준을 조절합니다. 높은 품질일수록 파일이 크고, 낮은 품질일수록 작아지지만 품질이 저하됩니다."},
			{Q: "투명 배경이 유지되나요?", A: "JPG는 투명도를 지원하지 않습니다. 투명 영역은 기본적으로 흰색 배경으로 채워집니다."},
			{Q: "파일 크기 제한이 있나요?", A: "파일당 최대 20MB, 한 번에 최대 30개 파일을 처리할 수 있습니다."},
			{Q: "애니메이션 GIF를 변환할 수 있나요?", A: "네. 단, GIF의 첫 번째 프레임만 정적 JPG로 변환됩니다."},
		}
	case "spa":
		faqs = []ToolboxFAQ{
			{Q: "¿Qué formatos puedo convertir a JPG?", A: "PNG, WebP, GIF, BMP, SVG y TIFF se pueden convertir a JPG."},
			{Q: "¿Para qué sirve el control de calidad?", A: "Controla el nivel de compresión JPG. Mayor calidad significa archivos más grandes; menor calidad significa archivos más pequeños con algo de pérdida."},
			{Q: "¿Se conserva el fondo transparente?", A: "JPG no admite transparencia. Las áreas transparentes se rellenan con fondo blanco por defecto."},
			{Q: "¿Hay límite de tamaño de archivo?", A: "Hasta 20 MB por archivo y 30 archivos a la vez."},
			{Q: "¿Puedo convertir GIFs animados?", A: "Sí, pero solo se convertirá el primer fotograma del GIF como JPG estático."},
		}
	default:
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
	switch lang {
	case "zh":
		faqs = []ToolboxFAQ{
			{Q: "JPG可以转换为哪些格式？", A: "可以将 JPG 转换为 PNG、WEBP、GIF、BMP 等格式。"},
			{Q: "哪种格式支持透明背景？", A: "PNG 和 WEBP 均支持透明背景，PNG 的兼容性更广泛。"},
			{Q: "WEBP是什么格式，有什么优势？", A: "WEBP 是 Google 开发的现代图片格式，在相同质量下比 JPG 体积更小。"},
			{Q: "转换会影响图片质量吗？", A: "转换为 PNG 是无损的。转换为 WEBP 在默认设置下质量损失极小。"},
			{Q: "可以批量转换多个JPG文件吗？", A: "支持！一次上传最多 30 个 JPG 文件，一键转换为您选择的格式。"},
		}
	case "ja":
		faqs = []ToolboxFAQ{
			{Q: "JPGをどの形式に変換できますか？", A: "JPGをPNG・WebP・GIF・BMPなどの形式に変換できます。"},
			{Q: "透明背景に対応している形式は？", A: "PNGとWebPが透明背景に対応しています。互換性を重視する場合はPNGをお選びください。"},
			{Q: "WebPとは何ですか？利点は？", A: "WebPはGoogleが開発した現代の画像形式で、同じ品質でJPGより小さいファイルサイズを実現します。"},
			{Q: "変換で画質は変わりますか？", A: "PNGへの変換はロスレスです。WebPへの変換はデフォルト設定で画質損失が極めて少ないです。"},
			{Q: "複数のJPGファイルを一括変換できますか？", A: "はい！最大30個のJPGファイルを一度にアップロードし、選択した形式に一括変換できます。"},
		}
	case "ko":
		faqs = []ToolboxFAQ{
			{Q: "JPG를 어떤 형식으로 변환할 수 있나요?", A: "JPG를 PNG, WebP, GIF, BMP 등의 형식으로 변환할 수 있습니다."},
			{Q: "투명 배경을 지원하는 형식은?", A: "PNG와 WebP 모두 투명 배경을 지원합니다. 최대 호환성을 위해서는 PNG를 선택하세요."},
			{Q: "WebP란 무엇이고 장점은?", A: "WebP는 Google이 개발한 현대적인 이미지 형식으로 동일한 품질에서 JPG보다 파일 크기가 작습니다."},
			{Q: "변환이 이미지 품질에 영향을 미치나요?", A: "PNG 변환은 무손실입니다. WebP 변환은 기본 설정에서 품질 손실이 최소화됩니다."},
			{Q: "여러 JPG 파일을 일괄 변환할 수 있나요?", A: "네! 최대 30개의 JPG 파일을 한 번에 업로드하여 선택한 형식으로 변환하세요."},
		}
	case "spa":
		faqs = []ToolboxFAQ{
			{Q: "¿A qué formatos puedo convertir JPG?", A: "Puedes convertir JPG a PNG, WebP, GIF, BMP y más formatos."},
			{Q: "¿Qué formato es mejor para fondo transparente?", A: "PNG y WebP admiten transparencia. Elige PNG para máxima compatibilidad."},
			{Q: "¿Qué es WebP y por qué usarlo?", A: "WebP es un formato moderno de Google que ofrece mejor compresión que JPG manteniendo la calidad."},
			{Q: "¿La conversión afecta la calidad?", A: "La conversión a PNG es sin pérdidas. La conversión a WebP tiene pérdida mínima con la configuración predeterminada."},
			{Q: "¿Puedo convertir varios JPG a la vez?", A: "Sí, sube hasta 30 archivos JPG y conviértelos todos al formato elegido de una vez."},
		}
	default:
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
	switch lang {
	case "zh":
		faqs = []ToolboxFAQ{
			{Q: "可以调整哪些图片参数？", A: "支持调整亮度、对比度、饱和度、锐化和模糊，拖动滑块实时预览。"},
			{Q: "可以在下载前预览效果吗？", A: "可以，Canvas 预览区会随着滑块实时更新（500ms防抖）。"},
			{Q: "如何重置所有调整？", A: "点击「重置」按钮，所有滑块恢复到默认中性值。"},
			{Q: "编辑会修改原始文件吗？", A: "不会。原始文件从不被修改，您下载的只是编辑后的副本。"},
			{Q: "可以批量编辑多张照片吗？", A: "支持！相同的调整参数会应用到所有上传的图片上。"},
		}
	case "ja":
		faqs = []ToolboxFAQ{
			{Q: "どのような写真パラメータを調整できますか？", A: "明るさ・コントラスト・彩度・シャープネス・ぼかしをスライダーでリアルタイム調整できます。"},
			{Q: "ダウンロード前に効果をプレビューできますか？", A: "はい。Canvasプレビューエリアがスライダー操作に合わせてリアルタイム更新されます（500ms デバウンス）。"},
			{Q: "すべての調整をリセットするには？", A: "「リセット」ボタンをクリックすると、すべてのスライダーがデフォルト値に戻ります。"},
			{Q: "編集で元のファイルは変更されますか？", A: "されません。元ファイルは常に変更されず、ダウンロードするのは編集後のコピーのみです。"},
			{Q: "複数の写真を一括編集できますか？", A: "はい！同じ調整パラメータがアップロードしたすべての画像に適用されます。"},
		}
	case "ko":
		faqs = []ToolboxFAQ{
			{Q: "어떤 이미지 파라미터를 조정할 수 있나요?", A: "밝기, 대비, 채도, 선명도, 블러를 슬라이더로 실시간 조정할 수 있습니다."},
			{Q: "다운로드 전에 효과를 미리 볼 수 있나요?", A: "네. Canvas 미리보기 영역이 슬라이더 조작에 따라 실시간 업데이트됩니다(500ms 디바운스)."},
			{Q: "모든 조정을 초기화하려면?", A: "'초기화' 버튼을 클릭하면 모든 슬라이더가 기본값으로 돌아갑니다."},
			{Q: "편집이 원본 파일을 수정하나요?", A: "아니요. 원본 파일은 절대 수정되지 않으며 편집된 사본만 다운로드됩니다."},
			{Q: "여러 사진을 일괄 편집할 수 있나요?", A: "네! 동일한 조정 설정이 업로드된 모든 이미지에 적용됩니다."},
		}
	case "spa":
		faqs = []ToolboxFAQ{
			{Q: "¿Qué parámetros de imagen puedo ajustar?", A: "Brillo, contraste, saturación, nitidez y desenfoque con control en tiempo real mediante sliders."},
			{Q: "¿Puedo previsualizar el efecto antes de descargar?", A: "Sí. El área de vista previa Canvas se actualiza en tiempo real al mover cualquier slider (500ms debounce)."},
			{Q: "¿Cómo restablecer todos los ajustes?", A: "Haz clic en 'Restablecer' y todos los sliders volverán a sus valores predeterminados neutrales."},
			{Q: "¿La edición modifica el archivo original?", A: "No. El archivo original nunca se modifica. Solo descargas la copia editada."},
			{Q: "¿Puedo editar varias fotos a la vez?", A: "¡Sí! Los mismos parámetros de ajuste se aplican a todas las imágenes subidas."},
		}
	default:
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
	switch lang {
	case "zh":
		faqs = []ToolboxFAQ{
			{Q: "AI抠图是如何工作的？", A: "我们使用基于 WebAssembly 的 AI 模型，完全在您的浏览器中运行，不会向任何服务器发送数据。"},
			{Q: "什么类型的图片效果最好？", A: "主体与背景对比清晰的图片效果最佳，如人像、产品图和 Logo。"},
			{Q: "处理需要多长时间？", A: "首次运行需下载 AI 模型（约10秒）。后续每张图片处理约需 2-5 秒。"},
			{Q: "输出格式是什么？", A: "输出为带透明背景的 PNG 文件，可直接用于任何背景。"},
			{Q: "图片大小有限制吗？", A: "每张图片建议不超过 20MB 以获得最佳性能，过大的图片可能会降低 AI 处理速度。"},
		}
	case "ja":
		faqs = []ToolboxFAQ{
			{Q: "AI背景除去はどのように機能しますか？", A: "WebAssemblyベースのAIモデルを使用し、完全にブラウザ内で動作します。いかなるサーバーにもデータを送信しません。"},
			{Q: "どんな画像が最も効果的ですか？", A: "被写体と背景のコントラストが明確な画像が最適です。人物・製品・ロゴ画像で優れた結果が得られます。"},
			{Q: "処理にどのくらい時間がかかりますか？", A: "初回はAIモデルのダウンロードが必要です（約10秒）。その後は1枚あたり2〜5秒で処理されます。"},
			{Q: "出力形式は何ですか？", A: "透明背景のPNGファイルとして出力され、どんな背景にも即座に使用できます。"},
			{Q: "画像サイズに制限はありますか？", A: "最良のパフォーマンスのために1枚20MB以下を推奨します。大きすぎる画像はAI処理が遅くなる場合があります。"},
		}
	case "ko":
		faqs = []ToolboxFAQ{
			{Q: "AI 배경 제거는 어떻게 작동하나요?", A: "WebAssembly 기반 AI 모델을 사용하여 브라우저에서 완전히 실행됩니다. 어떤 서버에도 데이터를 전송하지 않습니다."},
			{Q: "어떤 이미지가 가장 효과적인가요?", A: "피사체와 배경 간 대비가 명확한 이미지가 가장 좋습니다. 인물, 제품, 로고 이미지에서 훌륭한 결과를 얻을 수 있습니다."},
			{Q: "처리 시간이 얼마나 걸리나요?", A: "첫 번째 실행 시 AI 모델을 다운로드합니다(약 10초). 이후 각 이미지는 2~5초 안에 처리됩니다."},
			{Q: "출력 형식은 무엇인가요?", A: "투명 배경의 PNG 파일로 출력되어 어떤 배경에도 바로 사용할 수 있습니다."},
			{Q: "이미지 크기 제한이 있나요?", A: "최적의 성능을 위해 이미지당 20MB 이하를 권장합니다. 너무 큰 이미지는 AI 처리 속도가 느려질 수 있습니다."},
		}
	case "spa":
		faqs = []ToolboxFAQ{
			{Q: "¿Cómo funciona la eliminación de fondo por IA?", A: "Usamos un modelo de IA basado en WebAssembly que se ejecuta completamente en tu navegador sin enviar datos a ningún servidor."},
			{Q: "¿Qué tipo de imágenes dan mejores resultados?", A: "Las imágenes con contraste claro entre sujeto y fondo funcionan mejor. Retratos, productos y logos dan excelentes resultados."},
			{Q: "¿Cuánto tiempo tarda el procesamiento?", A: "La primera ejecución descarga el modelo de IA (unos 10 segundos). Las imágenes siguientes se procesan en 2-5 segundos cada una."},
			{Q: "¿En qué formato es la salida?", A: "La salida es un archivo PNG con fondo transparente, listo para usar sobre cualquier fondo."},
			{Q: "¿Hay límite de tamaño de imagen?", A: "Se recomienda menos de 20 MB por imagen para un rendimiento óptimo. Las imágenes demasiado grandes pueden ralentizar el procesamiento de IA."},
		}
	default:
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
	switch lang {
	case "zh":
		faqs = []ToolboxFAQ{
			{Q: "可以同时添加文字和图片水印吗？", A: "可以选择文字水印（自定义字体和颜色）或图片水印（上传您的Logo），两种模式独立使用。"},
			{Q: "如何选择水印位置？", A: "使用 3×3 位置网格，点击您想要的位置：左上、居中、右下等，非常直观。"},
			{Q: "可以调整水印透明度吗？", A: "可以，透明度滑块支持 10% 到 100% 的调节。"},
			{Q: "添加水印会影响图片质量吗？", A: "不会，水印渲染在图片副本的 Canvas 上，输出质量与原图一致。"},
			{Q: "可以批量添加水印吗？", A: "支持！上传多张图片，相同的水印设置会应用到所有图片上。"},
		}
	case "ja":
		faqs = []ToolboxFAQ{
			{Q: "テキストと画像の両方のウォーターマークを追加できますか？", A: "テキストウォーターマーク（カスタムフォント・色）または画像ウォーターマーク（ロゴをアップロード）を選択できます。2種類のモードは独立して使用します。"},
			{Q: "ウォーターマークの位置はどう選択しますか？", A: "3×3の位置グリッドで希望の位置をクリックします：左上・中央・右下など、直感的に操作できます。"},
			{Q: "ウォーターマークの透明度を調整できますか？", A: "はい。透明度スライダーで10%から100%の範囲で調整できます。"},
			{Q: "ウォーターマーク追加で画質は変わりますか？", A: "変わりません。ウォーターマークは画像コピーのCanvasにレンダリングされ、出力品質は元の画像と同じです。"},
			{Q: "複数の画像に一括でウォーターマークを追加できますか？", A: "はい！複数の画像をアップロードすると、同じウォーターマーク設定がすべてに適用されます。"},
		}
	case "ko":
		faqs = []ToolboxFAQ{
			{Q: "텍스트와 이미지 워터마크를 모두 추가할 수 있나요?", A: "텍스트 워터마크(커스텀 폰트와 색상) 또는 이미지 워터마크(로고 업로드)를 선택할 수 있습니다. 두 모드는 독립적으로 사용합니다."},
			{Q: "워터마크 위치는 어떻게 선택하나요?", A: "3×3 위치 격자에서 원하는 위치를 클릭합니다: 왼쪽 상단, 중앙, 오른쪽 하단 등 직관적으로 조작할 수 있습니다."},
			{Q: "워터마크 투명도를 조정할 수 있나요?", A: "네. 투명도 슬라이더로 10%부터 100%까지 조정할 수 있습니다."},
			{Q: "워터마크 추가가 이미지 품질에 영향을 미치나요?", A: "아니요. 워터마크는 이미지 복사본의 Canvas에 렌더링되며 출력 품질이 원본과 동일합니다."},
			{Q: "여러 이미지에 워터마크를 일괄 추가할 수 있나요?", A: "네! 여러 이미지를 업로드하면 동일한 워터마크 설정이 모두에 적용됩니다."},
		}
	case "spa":
		faqs = []ToolboxFAQ{
			{Q: "¿Puedo añadir marcas de agua de texto e imagen?", A: "Puedes elegir marca de agua de texto (fuente y color personalizados) o de imagen (sube tu logo). Ambos modos se usan de forma independiente."},
			{Q: "¿Cómo elijo la posición de la marca de agua?", A: "Usa la cuadrícula de posición 3×3 y haz clic donde quieras: arriba-izquierda, centro, abajo-derecha, etc. Muy intuitivo."},
			{Q: "¿Puedo ajustar la transparencia de la marca de agua?", A: "Sí. El slider de opacidad permite ajustar de 10% a 100%."},
			{Q: "¿Añadir la marca de agua afecta la calidad?", A: "No. La marca de agua se renderiza en el Canvas de una copia de la imagen y la calidad de salida es idéntica al original."},
			{Q: "¿Puedo añadir marcas de agua en lote?", A: "¡Sí! Sube varias imágenes y la misma configuración de marca de agua se aplicará a todas."},
		}
	default:
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
	switch lang {
	case "zh":
		faqs = []ToolboxFAQ{
			{Q: "只能旋转90度吗，还是可以旋转任意角度？", A: "支持任意角度旋转，在角度输入框中输入任意数字（如45°）即可精确旋转。"},
			{Q: "旋转后图片尺寸会变化吗？", A: "旋转90°/180°时宽高互换。其他角度旋转时，画布会扩展以容纳旋转后的图片，边缘填充白色。"},
			{Q: "可以水平和垂直翻转图片吗？", A: "可以，水平翻转和垂直翻转是独立操作，可与旋转组合使用。"},
			{Q: "可以批量旋转多张图片吗？", A: "支持！所有旋转和翻转设置会统一应用到所有上传的图片上。"},
			{Q: "旋转后输出什么格式？", A: "输出格式与输入保持一致（JPG保持JPG，PNG保持PNG）。"},
		}
	case "ja":
		faqs = []ToolboxFAQ{
			{Q: "90度以外の任意の角度で回転できますか？", A: "はい。角度入力欄に任意の値（例：45°）を入力すると精確に回転できます。"},
			{Q: "回転後に画像サイズは変わりますか？", A: "90°/180°回転時は幅と高さが入れ替わります。他の角度では回転後の画像に合わせてキャンバスが拡張され、端は白で塗りつぶされます。"},
			{Q: "水平・垂直に反転できますか？", A: "はい。水平反転と垂直反転は独立した操作で、回転と組み合わせて使用できます。"},
			{Q: "複数の画像を一括回転できますか？", A: "はい！すべての回転・反転設定が全アップロード画像に均一に適用されます。"},
			{Q: "回転後の出力形式は？", A: "入力と同じ形式で出力されます（JPGはJPG、PNGはPNGのまま）。"},
		}
	case "ko":
		faqs = []ToolboxFAQ{
			{Q: "90도 외에 임의 각도로 회전할 수 있나요?", A: "네. 각도 입력란에 원하는 값(예: 45°)을 입력하면 정확하게 회전됩니다."},
			{Q: "회전 후 이미지 크기가 변경되나요?", A: "90°/180° 회전 시 너비와 높이가 바뀝니다. 다른 각도에서는 회전된 이미지에 맞게 캔버스가 확장되고 가장자리는 흰색으로 채워집니다."},
			{Q: "수평 및 수직으로 뒤집을 수 있나요?", A: "네. 수평 뒤집기와 수직 뒤집기는 독립적인 작업으로 회전과 함께 사용할 수 있습니다."},
			{Q: "여러 이미지를 일괄 회전할 수 있나요?", A: "네! 모든 회전 및 뒤집기 설정이 업로드된 모든 이미지에 동일하게 적용됩니다."},
			{Q: "회전 후 출력 형식은?", A: "입력과 동일한 형식으로 출력됩니다(JPG는 JPG, PNG는 PNG 유지)."},
		}
	case "spa":
		faqs = []ToolboxFAQ{
			{Q: "¿Solo puedo rotar 90° o también ángulos arbitrarios?", A: "Puedes rotar cualquier ángulo. Escribe cualquier número en el campo de ángulo (p. ej. 45°) para rotación precisa."},
			{Q: "¿Cambia el tamaño de la imagen tras rotar?", A: "Al rotar 90°/180° el ancho y alto se intercambian. Para otros ángulos el lienzo se expande para contener la imagen rotada y los bordes se rellenan de blanco."},
			{Q: "¿Puedo voltear la imagen horizontal y verticalmente?", A: "Sí. El volteo horizontal y vertical son operaciones independientes combinables con la rotación."},
			{Q: "¿Puedo rotar varias imágenes a la vez?", A: "¡Sí! Todos los ajustes de rotación y volteo se aplican uniformemente a todas las imágenes subidas."},
			{Q: "¿En qué formato se descarga tras rotar?", A: "El formato de salida mantiene el mismo que la entrada (JPG sigue siendo JPG, PNG sigue siendo PNG)."},
		}
	default:
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

