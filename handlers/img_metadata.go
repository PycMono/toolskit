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
			{Q: "图片会上传到服务器吗？", A: "不会。元数据提取完全在您的浏览器内完成，使用 exifr.js 库进行解析，图片文件不会发送到任何服务器，完全保护您的隐私。"},
			{Q: "支持哪些图片格式？", A: "支持 JPEG/JPG、PNG、WebP、TIFF 和 HEIC/HEIF 格式。EXIF 数据最常见于数码相机和智能手机拍摄的 JPEG 文件。"},
			{Q: "可以查看哪些元数据？", A: "可查看 EXIF 数据（相机品牌/型号、光圈、快门速度、ISO、焦距、拍摄时间）、GPS 位置（经纬度、海拔）、IPTC 数据（版权、作者、关键词、描述）以及 XMP 数据（评级、软件、色彩空间）。"},
			{Q: "为什么某些元数据缺失？", A: "社交媒体平台、即时通讯软件或图片编辑器可能会在处理图片时自动删除元数据。从 Instagram、微信等平台下载的图片，大部分 EXIF 数据已被删除。"},
			{Q: "可以在地图上看到 GPS 位置吗？", A: "可以。如果图片包含 GPS 坐标，我们会显示一个嵌入式 OpenStreetMap 预览地图，精确显示照片的拍摄地点。"},
			{Q: "如何导出元数据？", A: "分析完成后，可将元数据导出为 JSON（结构化数据）、CSV（表格格式）或 TXT（人类可读报告）。多张图片时，可打包下载全部结果为 ZIP。"},
		}
	} else if lang == "ja" {
		faqs = []ImgMetadataFAQ{
			{Q: "画像はサーバーにアップロードされますか？", A: "いいえ。メタデータ抽出はexifr.jsライブラリを使用してブラウザ内で完全に処理されます。画像ファイルはいかなるサーバーにも送信されません。"},
			{Q: "対応している画像形式は？", A: "JPEG/JPG・PNG・WebP・TIFF・HEIC/HEIFに対応。EXIFデータはデジタルカメラやスマートフォンで撮影したJPEGファイルに最も多く含まれています。"},
			{Q: "どんなメタデータを確認できますか？", A: "EXIFデータ（カメラメーカー/モデル・絞り・シャッタースピード・ISO・焦点距離・撮影日時）・GPS位置情報（緯度・経度・高度）・IPTCデータ（著作権・作者・キーワード）・XMPデータ（評価・ソフト・色空間）を表示できます。"},
			{Q: "一部のメタデータが見当たらないのはなぜ？", A: "SNSプラットフォーム・メッセージアプリ・画像編集ソフトが処理時にメタデータを削除する場合があります。Instagram等からダウンロードした画像はほとんどのEXIFデータが削除されています。"},
			{Q: "GPS位置情報をマップで確認できますか？", A: "はい。GPS座標が含まれる画像にはOpenStreetMapのインタラクティブプレビューが表示され、撮影場所を正確に確認できます。"},
			{Q: "メタデータをエクスポートするには？", A: "解析後、JSON（構造化データ）・CSV（スプレッドシート用）・TXT（人間が読みやすい形式）でエクスポートできます。複数画像はZIPにまとめてダウンロード可能です。"},
		}
	} else if lang == "ko" {
		faqs = []ImgMetadataFAQ{
			{Q: "이미지가 서버에 업로드되나요?", A: "아니요. 메타데이터 추출은 exifr.js 라이브러리를 사용하여 브라우저에서 완전히 처리됩니다. 이미지 파일은 어떤 서버에도 전송되지 않습니다."},
			{Q: "어떤 이미지 형식을 지원하나요?", A: "JPEG/JPG, PNG, WebP, TIFF, HEIC/HEIF를 지원합니다. EXIF 데이터는 디지털 카메라와 스마트폰으로 촬영한 JPEG 파일에 가장 많이 포함되어 있습니다."},
			{Q: "어떤 메타데이터를 볼 수 있나요?", A: "EXIF 데이터(카메라 제조사/모델, 조리개, 셔터 속도, ISO, 초점 거리, 촬영 날짜), GPS 위치(위도, 경도, 고도), IPTC 데이터(저작권, 작성자, 키워드), XMP 데이터(평점, 소프트웨어, 색 공간)를 확인할 수 있습니다."},
			{Q: "일부 메타데이터가 없는 이유는?", A: "SNS 플랫폼, 메시지 앱, 이미지 편집기가 처리 시 메타데이터를 삭제할 수 있습니다. Instagram 등에서 다운로드한 이미지는 대부분의 EXIF 데이터가 제거되어 있습니다."},
			{Q: "지도에서 GPS 위치를 볼 수 있나요?", A: "네. GPS 좌표가 포함된 이미지에는 OpenStreetMap 인터랙티브 미리보기가 표시되어 촬영 위치를 정확히 확인할 수 있습니다."},
			{Q: "메타데이터를 내보내려면?", A: "분석 후 JSON(구조화 데이터), CSV(스프레드시트 형식), TXT(읽기 쉬운 보고서)로 내보낼 수 있습니다. 여러 이미지는 ZIP으로 일괄 다운로드할 수 있습니다."},
		}
	} else if lang == "spa" {
		faqs = []ImgMetadataFAQ{
			{Q: "¿La imagen se sube al servidor?", A: "No. La extracción de metadatos se realiza completamente en tu navegador usando la biblioteca exifr.js. Los archivos de imagen nunca se envían a ningún servidor."},
			{Q: "¿Qué formatos de imagen son compatibles?", A: "JPEG/JPG, PNG, WebP, TIFF y HEIC/HEIF. Los datos EXIF se encuentran más comúnmente en archivos JPEG de cámaras digitales y smartphones."},
			{Q: "¿Qué metadatos puedo ver?", A: "Datos EXIF (marca/modelo de cámara, apertura, velocidad de obturación, ISO, longitud focal, fecha/hora), ubicación GPS (latitud, longitud, altitud), datos IPTC (copyright, autor, palabras clave) y datos XMP (valoración, software, espacio de color)."},
			{Q: "¿Por qué faltan algunos metadatos?", A: "Las redes sociales, apps de mensajería o editores de imagen pueden eliminar metadatos al procesar las fotos. Las imágenes descargadas de Instagram u otras plataformas suelen tener la mayoría de datos EXIF eliminados."},
			{Q: "¿Puedo ver la ubicación GPS en un mapa?", A: "Sí. Si la imagen contiene coordenadas GPS, mostramos un mapa interactivo de OpenStreetMap que indica exactamente dónde se tomó la foto."},
			{Q: "¿Cómo exporto los metadatos?", A: "Tras el análisis, puedes exportar como JSON (datos estructurados), CSV (formato hoja de cálculo) o TXT (informe legible). Para varias imágenes, descarga todos los resultados como un ZIP."},
		}
	} else {
		faqs = []ImgMetadataFAQ{
			{Q: "Is my image uploaded to a server?", A: "No. All metadata extraction is performed entirely in your browser using the exifr.js library. Your images are never sent to any server, ensuring complete privacy."},
			{Q: "What image formats are supported?", A: "JPEG/JPG, PNG, WebP, TIFF, and HEIC/HEIF are supported. EXIF data is most commonly embedded in JPEG files from digital cameras and smartphones."},
			{Q: "What metadata can I see?", A: "You can view EXIF data (camera make/model, aperture, shutter speed, ISO, focal length, date/time), GPS location (latitude, longitude, altitude with map preview), IPTC data (copyright, author, keywords, caption), and XMP data (rating, software, color space)."},
			{Q: "Why is some metadata missing?", A: "Metadata can be stripped by social media platforms, messaging apps, or photo editors. If you download a photo from Instagram or WhatsApp, most EXIF data will have been removed for privacy reasons."},
			{Q: "Can I see the GPS location on a map?", A: "Yes. If your image contains GPS coordinates, we display an interactive OpenStreetMap preview showing exactly where the photo was taken."},
			{Q: "How do I export the metadata?", A: "After analyzing your image, you can export the metadata as JSON (structured data), CSV (spreadsheet-compatible), or TXT (human-readable report). For multiple images, you can download all results as a ZIP file."},
		}
	}

	seoTitle := map[string]string{
		"zh":  "图片元数据查看 — 在线免费读取 EXIF/GPS/IPTC 信息 | Tool Box Nova",
		"en":  "Image Metadata Viewer — Read EXIF, GPS, IPTC Data Online Free | Tool Box Nova",
		"ja":  "画像メタデータビューアー — EXIF/GPS/IPTC情報を無料オンラインで読み取り | Tool Box Nova",
		"ko":  "이미지 메타데이터 뷰어 — EXIF/GPS/IPTC 정보 무료 온라인 조회 | Tool Box Nova",
		"spa": "Visor de metadatos de imágenes — Lee EXIF, GPS, IPTC gratis online | Tool Box Nova",
	}
	seoDesc := map[string]string{
		"zh":  "免费在线查看图片隐藏的元数据，支持 EXIF、GPS 位置、IPTC 版权、XMP 信息，图片不上传服务器，完全在浏览器内完成，支持导出 JSON/CSV/TXT。",
		"en":  "Free online image metadata viewer. Read EXIF, GPS location, IPTC copyright, and XMP data. Files never leave your browser. Export as JSON, CSV or TXT.",
		"ja":  "無料オンラインで画像のEXIF・GPS位置情報・IPTC著作権・XMPデータを表示。ファイルはブラウザ外に出ません。JSON/CSV/TXTエクスポート対応。",
		"ko":  "무료 온라인 이미지 메타데이터 뷰어. EXIF, GPS 위치, IPTC 저작권, XMP 데이터 읽기. 파일이 브라우저를 벗어나지 않습니다. JSON/CSV/TXT 내보내기 지원.",
		"spa": "Visor de metadatos de imágenes gratuito online. Lee EXIF, ubicación GPS, derechos IPTC y datos XMP. Los archivos no salen de tu navegador. Exporta como JSON, CSV o TXT.",
	}
	seoKeywords := map[string]string{
		"zh":  "图片元数据查看,EXIF查看器,GPS坐标提取,IPTC版权信息,XMP数据,在线免费查看图片信息,照片拍摄地点,相机参数查看",
		"en":  "image metadata viewer,EXIF viewer,GPS photo location,IPTC copyright,XMP data,read image metadata online,photo location finder,camera data extractor",
		"ja":  "画像メタデータ,EXIF閲覧,GPS位置情報,IPTC著作権,XMPデータ,オンラインメタデータ確認,写真撮影場所,カメラ情報",
		"ko":  "이미지 메타데이터,EXIF 뷰어,GPS 위치,IPTC 저작권,XMP 데이터,온라인 메타데이터 확인,사진 촬영 위치,카메라 정보",
		"spa": "visor metadatos imagen,lector EXIF,ubicación GPS foto,derechos IPTC,datos XMP,ver metadatos online,localización foto,datos cámara",
	}

	title, ok := seoTitle[lang]
	if !ok {
		title = seoTitle["en"]
	}
	desc, ok := seoDesc[lang]
	if !ok {
		desc = seoDesc["en"]
	}
	kw, ok := seoKeywords[lang]
	if !ok {
		kw = seoKeywords["en"]
	}

	data := baseData(c, gin.H{
		"Title":       title,
		"Description": desc,
		"Keywords":    kw,
		"PageClass":   "page-img-metadata",
		"FAQs":        faqs,
	})
	render(c, "img_metadata.html", data)
}

