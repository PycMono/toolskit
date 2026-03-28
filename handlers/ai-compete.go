package handlers

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// ─── Prompt Loader for AI Compete ─────────────────────────────────────

// noProxyTransport returns an HTTP transport that bypasses system proxy settings.
func noProxyTransport() *http.Transport {
	return &http.Transport{
		Proxy: func(*http.Request) (*url.URL, error) { return nil, nil },
	}
}

type competePrompt struct {
	system string
	user   string
}

type competePromptLoader struct {
	mu        sync.RWMutex
	promptDir string
	cache     map[string]*competePrompt
}

var competePromptLoaderInstance *competePromptLoader

// InitCompetePrompts initializes the AI Compete prompt loader. Call from main.go.
func InitCompetePrompts(promptDir string) {
	competePromptLoaderInstance = &competePromptLoader{
		promptDir: promptDir,
		cache:     make(map[string]*competePrompt),
	}
	// Pre-load prompts
	competePromptLoaderInstance.load("compete-analyze")
	competePromptLoaderInstance.load("compete-suggest")
}

func (l *competePromptLoader) load(name string) (*competePrompt, error) {
	l.mu.RLock()
	if p, ok := l.cache[name]; ok {
		l.mu.RUnlock()
		return p, nil
	}
	l.mu.RUnlock()

	path := filepath.Join(l.promptDir, name+".md")
	content, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("prompt file '%s' not found: %w", path, err)
	}

	p, err := parseCompetePromptMD(string(content))
	if err != nil {
		return nil, err
	}

	l.mu.Lock()
	l.cache[name] = p
	l.mu.Unlock()
	return p, nil
}

func parseCompetePromptMD(content string) (*competePrompt, error) {
	parts := strings.SplitN(content, "\n# USER\n", 2)
	if len(parts) != 2 {
		return nil, fmt.Errorf("prompt missing '# USER' section")
	}
	system := strings.TrimSpace(strings.TrimPrefix(strings.TrimSpace(parts[0]), "# SYSTEM"))
	user := strings.TrimSpace(parts[1])
	return &competePrompt{system: system, user: user}, nil
}

func (l *competePromptLoader) get(name string) (*competePrompt, error) {
	return l.load(name)
}

func (l *competePromptLoader) build(name string, vars map[string]string) (system string, user string, err error) {
	p, e := l.get(name)
	if e != nil {
		return "", "", e
	}
	system = p.system
	user = p.user
	for k, v := range vars {
		user = strings.ReplaceAll(user, "{{."+k+"}}", v)
	}
	return system, user, nil
}

// ── FAQ ──────────────────────────────────────────────────────────────
type AiCompeteFAQ struct{ Q, A string }

func buildAiCompeteFAQ(lang string) []AiCompeteFAQ {
	switch lang {
	case "zh":
		return []AiCompeteFAQ{
			{Q: "AI 竞品分析助手是如何工作的？", A: "您只需输入您的产品网址或一段产品描述，系统会通过 Claude AI 实时搜索互联网，从营销策略、产品特性、定价模型、目标受众、用户口碑、公司信息和 SWOT 七个维度，对您指定的竞品进行全面分析，并以结构化报告的形式呈现，整个过程通常只需 1-3 分钟。"},
			{Q: "我可以分析多少个竞品？", A: "目前每次分析最多支持 5 个竞品。您可以使用 AI 推荐功能，让系统根据您的产品自动发现市场上的主要竞争对手，也可以手动输入竞品网址或名称。建议先从 2-3 个最核心的竞品开始，获得最清晰的对比洞察。"},
			{Q: "分析结果的准确性如何保证？", A: "本工具通过 Claude AI 结合实时网络搜索来获取竞品的最新公开信息，包括官网、定价页、产品文档、App Store 评价以及 G2/Capterra 等评测平台的用户反馈。AI 会对这些信息进行综合分析并标注依据，但由于网络信息存在滞后性，建议将结果作为参考起点，再结合人工验证进行深度判断。"},
			{Q: "分析报告支持导出吗？", A: "支持。分析完成后，您可以一键将完整报告导出为 Markdown 格式，内容包含七大维度的详细分析和竞品对比表格，可以直接粘贴到 Notion、Confluence 或其他文档工具中使用，也可以复制后发送给团队成员共享。"},
			{Q: "我的产品信息和竞品数据会被保存吗？", A: "不会。您输入的产品描述和竞品信息仅在当次分析请求中使用，用于向 Claude AI 发起查询。分析完成后，服务器不会保留任何您的输入内容或生成的分析结果。所有数据仅在您的浏览器会话期间存在，关闭页面后即消失，请放心使用。"},
		}
	case "ja":
		return []AiCompeteFAQ{
			{Q: "AI競合分析アシスタントはどのように機能しますか？", A: "製品のURLまたは説明を入力するだけで、システムがClaude AIを使用してリアルタイムでインターネットを検索し、マーケティング戦略、製品機能、価格モデル、ターゲット層、顧客センチメント、企業情報、SWOT分析の7つの観点から、指定した競合他社を包括的に分析します。通常1〜3分で完了します。"},
			{Q: "何社の競合他社を分析できますか？", A: "現在、1回の分析で最大5社の競合他社をサポートしています。AI推奨機能を使用すると、製品に基づいて主要な競合他社を自動的に発見できます。また、競合他社のURLや名前を手動で入力することもできます。最初は2〜3社の主要な競合他社から始めることをお勧めします。"},
			{Q: "分析結果の精度はどのように保証されますか？", A: "このツールはClaude AIとリアルタイムのウェブ検索を組み合わせて、公式サイト、価格ページ、製品ドキュメント、App Storeのレビュー、G2やCapterraなどのプラットフォームからの最新情報を取得します。AIはこれらの情報を総合的に分析しますが、情報に遅延が生じる可能性があるため、結果を参考として活用し、さらに人工的な検証を行うことをお勧めします。"},
			{Q: "分析レポートはエクスポートできますか？", A: "はい、対応しています。分析が完了したら、完全なレポートをMarkdown形式でワンクリックでエクスポートできます。内容には7つの分析ディメンションと競合比較表が含まれており、Notion、Confluenceなどのドキュメントツールに直接貼り付けることができます。"},
			{Q: "製品情報や競合データは保存されますか？", A: "いいえ、保存されません。入力した製品の説明と競合情報は、現在の分析リクエストにのみ使用されます。分析完了後、サーバーはいかなる入力内容や生成された分析結果も保持しません。すべてのデータはブラウザセッション中にのみ存在し、ページを閉じると消えます。"},
		}
	case "ko":
		return []AiCompeteFAQ{
			{Q: "AI 경쟁사 분석 도우미는 어떻게 작동하나요?", A: "제품 URL이나 설명을 입력하기만 하면 시스템이 Claude AI를 사용하여 실시간으로 인터넷을 검색하고, 마케팅 전략, 제품 특성, 가격 모델, 타겟 고객, 사용자 감성, 기업 정보, SWOT 분석 등 7가지 차원에서 지정한 경쟁사를 종합 분석합니다. 전체 과정은 보통 1-3분이 소요됩니다."},
			{Q: "몇 개의 경쟁사를 분석할 수 있나요?", A: "현재 분석당 최대 5개의 경쟁사를 지원합니다. AI 추천 기능을 사용하면 제품을 기반으로 주요 경쟁사를 자동으로 발견할 수 있으며, 경쟁사 URL이나 이름을 직접 입력할 수도 있습니다. 처음에는 2-3개의 핵심 경쟁사부터 시작하는 것을 권장합니다."},
			{Q: "분석 결과의 정확성은 어떻게 보장되나요?", A: "이 도구는 Claude AI와 실시간 웹 검색을 결합하여 공식 웹사이트, 가격 페이지, G2, Capterra 등 플랫폼의 최신 정보를 수집합니다. AI가 이 정보를 종합 분석하지만 정보 지연이 있을 수 있으므로 결과를 참고 자료로 활용하고 추가적인 수동 검증을 권장합니다."},
			{Q: "분석 보고서를 내보낼 수 있나요?", A: "네, 지원합니다. 분석이 완료되면 클릭 한 번으로 전체 보고서를 Markdown 형식으로 내보낼 수 있습니다. 7가지 분석 차원과 경쟁사 비교 표가 포함되어 있으며, Notion, Confluence 등 문서 도구에 직접 붙여넣기하여 사용할 수 있습니다."},
			{Q: "제품 정보와 경쟁사 데이터가 저장되나요?", A: "아니요, 저장되지 않습니다. 입력한 제품 설명과 경쟁사 정보는 현재 분석 요청에만 사용됩니다. 분석 완료 후 서버는 입력 내용이나 생성된 분석 결과를 보관하지 않습니다. 모든 데이터는 브라우저 세션 동안에만 존재하며 페이지를 닫으면 사라집니다."},
		}
	case "spa":
		return []AiCompeteFAQ{
			{Q: "¿Cómo funciona el asistente de análisis de competidores con IA?", A: "Solo necesita ingresar la URL de su producto o una descripción, y el sistema utilizará Claude AI para buscar en Internet en tiempo real, analizando a sus competidores desde siete dimensiones: estrategias de marketing, características del producto, modelos de precios, público objetivo, sentimiento del cliente, información de la empresa y análisis SWOT. El proceso suele tomar entre 1 y 3 minutos."},
			{Q: "¿Cuántos competidores puedo analizar?", A: "Actualmente se admiten hasta 5 competidores por análisis. Puede usar la función de recomendación de IA para descubrir automáticamente a los principales competidores del mercado según su producto, o ingresar manualmente las URLs o nombres de los competidores. Se recomienda comenzar con los 2 o 3 competidores más importantes para obtener información más clara."},
			{Q: "¿Cómo se garantiza la precisión de los resultados del análisis?", A: "Esta herramienta combina Claude AI con búsqueda web en tiempo real para obtener la información pública más reciente de los competidores, incluyendo sitios web oficiales, páginas de precios, documentación del producto y reseñas de plataformas como G2 y Capterra. Aunque la IA analiza y cita estas fuentes, se recomienda usar los resultados como punto de partida y complementarlos con verificación manual."},
			{Q: "¿Se pueden exportar los informes de análisis?", A: "Sí. Una vez completado el análisis, puede exportar el informe completo en formato Markdown con un solo clic. El contenido incluye análisis detallados de las siete dimensiones y tablas comparativas de competidores, que pueden pegarse directamente en Notion, Confluence u otras herramientas de documentación."},
			{Q: "¿Se guardarán los datos de mi producto y los competidores?", A: "No. La información que ingrese se utiliza únicamente para el análisis actual. Una vez completado, el servidor no conserva ningún contenido de entrada ni los resultados generados. Todos los datos existen solo durante la sesión del navegador y desaparecen al cerrar la página, garantizando total privacidad."},
		}
	default: // en
		return []AiCompeteFAQ{
			{Q: "How does the AI competitive analysis assistant work?", A: "Simply enter your product URL or a short description, and our system uses Claude AI to search the web in real time. It then analyzes your competitors across seven dimensions: marketing strategies, product features, pricing models, target audience, customer sentiment, company info, and SWOT analysis — all delivered as a structured report, typically within 1 to 3 minutes."},
			{Q: "How many competitors can I analyze at once?", A: "You can analyze up to 5 competitors per session. Use the AI suggestion feature to automatically discover your top market rivals based on your product, or manually enter competitor URLs or names. We recommend starting with 2 to 3 core competitors to get the clearest, most actionable comparative insights before expanding your analysis."},
			{Q: "How accurate are the analysis results?", A: "The tool uses Claude AI combined with live web search to pull the latest publicly available information about your competitors, including their official websites, pricing pages, product documentation, App Store reviews, and user feedback from platforms like G2 and Capterra. AI synthesizes and cites these sources, but since web data can lag, treat results as a solid starting point and validate key findings manually."},
			{Q: "Can I export the analysis report?", A: "Yes. Once the analysis is complete, you can export the full report to Markdown format with one click. The export includes all seven analysis dimensions and side-by-side comparison tables, ready to paste into Notion, Confluence, or any other documentation tool — or share directly with your team."},
			{Q: "Is my product information or competitor data stored anywhere?", A: "No. Your product description and competitor inputs are used only for the current analysis request sent to Claude AI. After the analysis completes, our server retains no input content or generated results. All data exists only during your browser session and disappears when you close the page, ensuring full privacy."},
		}
	}
}

// ── Handler ───────────────────────────────────────────────────────────
func AiCompetePage(c *gin.Context) {
	t := getT(c)
	lang := getLang(c)
	faqs := buildAiCompeteFAQ(lang)

	render(c, "ai-compete.html", baseData(c, gin.H{
		"Title":       t("ai-compete.seo.title") + " | Tool Box Nova",
		"Description": t("ai-compete.seo.desc"),
		"Keywords":    t("ai-compete.seo.keywords"),
		"PageClass":   "page-ai-compete",
		"FAQs":        faqs,
		"Canonical":   "https://toolboxnova.com/ai/compete",
		"HreflangZH":  "https://toolboxnova.com/ai/compete?lang=zh",
		"HreflangEN":  "https://toolboxnova.com/ai/compete?lang=en",
		"HreflangJA":  "https://toolboxnova.com/ai/compete?lang=ja",
		"HreflangKO":  "https://toolboxnova.com/ai/compete?lang=ko",
		"HreflangSPA": "https://toolboxnova.com/ai/compete?lang=spa",
	}))
}

// ── SSE 分析接口 ──────────────────────────────────────────────────────
type AiCompeteAnalyzeRequest struct {
	ProductDesc string   `json:"product_desc"`
	Competitors []string `json:"competitors"`
	Dimensions  []string `json:"dimensions"`
	Lang        string   `json:"lang"`
}

func AiCompeteAnalyze(c *gin.Context) {
	var req AiCompeteAnalyzeRequest
	if err := c.ShouldBindJSON(&req); err != nil || strings.TrimSpace(req.ProductDesc) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "product_desc is required"})
		return
	}
	if len(req.Competitors) == 0 || len(req.Competitors) > 5 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "1-5 competitors required"})
		return
	}

	// SSE headers
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("X-Accel-Buffering", "no")

	flusher, ok := c.Writer.(http.Flusher)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "streaming unsupported"})
		return
	}

	dimensions := req.Dimensions
	if len(dimensions) == 0 {
		dimensions = []string{"marketing", "product", "pricing", "audience", "sentiment", "company", "swot"}
	}
	competitorList := strings.Join(req.Competitors, ", ")
	dimList := strings.Join(dimensions, ", ")

	// Build language instruction
	langInstruction := map[string]string{
		"zh":  "请用中文输出分析结果。",
		"ja":  "分析結果を日本語で出力してください。",
		"ko":  "분석 결과를 한국어로 출력하세요.",
		"spa": "Por favor, genera el análisis en español.",
	}[req.Lang]
	if langInstruction == "" {
		langInstruction = "Please output the analysis in English."
	}

	// Load prompt from file
	systemPrompt, userPrompt, err := competePromptLoaderInstance.build("compete-analyze", map[string]string{
		"ProductDesc":     req.ProductDesc,
		"Competitors":     competitorList,
		"Dimensions":      dimList,
		"LangInstruction": langInstruction,
	})
	if err != nil {
		fmt.Fprintf(c.Writer, "event: error\ndata: {\"msg\":\"prompt load error\"}\n\n")
		flusher.Flush()
		return
	}

	claudeAPIKey := os.Getenv("ANTHROPIC_API_KEY")
	claudeReqBody, _ := json.Marshal(map[string]interface{}{
		"model":      "claude-sonnet-4-6",
		"max_tokens": 8000,
		"stream":     true,
		"system":     systemPrompt,
		"tools": []map[string]interface{}{
			{"type": "web_search_20250305", "name": "web_search"},
		},
		"messages": []map[string]interface{}{
			{"role": "user", "content": userPrompt},
		},
	})

	claudeReq, _ := http.NewRequestWithContext(c.Request.Context(),
		"POST", "https://api.anthropic.com/v1/messages",
		bytes.NewBuffer(claudeReqBody))
	claudeReq.Header.Set("x-api-key", claudeAPIKey)
	claudeReq.Header.Set("anthropic-version", "2023-06-01")
	claudeReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 180 * time.Second, Transport: noProxyTransport()}
	resp, err := client.Do(claudeReq)
	if err != nil {
		fmt.Fprintf(c.Writer, "event: error\ndata: {\"msg\":\"claude api error\"}\n\n")
		flusher.Flush()
		return
	}
	defer resp.Body.Close()

	scanner := bufio.NewScanner(resp.Body)
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "data:") {
			fmt.Fprintf(c.Writer, "%s\n\n", line)
			flusher.Flush()
		}
	}
	fmt.Fprintf(c.Writer, "event: done\ndata: {}\n\n")
	flusher.Flush()
}

// ── AI 推荐竞品接口 ───────────────────────────────────────────────────
type AiCompeteSuggestRequest struct {
	ProductDesc string `json:"product_desc"`
	Lang        string `json:"lang"`
}

func AiCompeteSuggest(c *gin.Context) {
	var req AiCompeteSuggestRequest
	if err := c.ShouldBindJSON(&req); err != nil || strings.TrimSpace(req.ProductDesc) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "product_desc is required"})
		return
	}

	// Load prompt from file
	systemPrompt, userPrompt, err := competePromptLoaderInstance.build("compete-suggest", map[string]string{
		"ProductDesc": req.ProductDesc,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "prompt load error"})
		return
	}

	claudeAPIKey := os.Getenv("ANTHROPIC_API_KEY")
	claudeReqBody, _ := json.Marshal(map[string]interface{}{
		"model":      "claude-haiku-4-5-20251001",
		"max_tokens": 500,
		"system":     systemPrompt,
		"tools": []map[string]interface{}{
			{"type": "web_search_20250305", "name": "web_search"},
		},
		"messages": []map[string]interface{}{
			{"role": "user", "content": userPrompt},
		},
	})

	claudeReq, _ := http.NewRequest("POST", "https://api.anthropic.com/v1/messages",
		bytes.NewBuffer(claudeReqBody))
	claudeReq.Header.Set("x-api-key", claudeAPIKey)
	claudeReq.Header.Set("anthropic-version", "2023-06-01")
	claudeReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second, Transport: noProxyTransport()}
	resp, err := client.Do(claudeReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ai error"})
		return
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)

	var claudeResp struct {
		Content []struct {
			Text string `json:"text"`
		} `json:"content"`
	}
	if err := json.Unmarshal(body, &claudeResp); err != nil || len(claudeResp.Content) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "parse error"})
		return
	}

	text := strings.TrimSpace(claudeResp.Content[0].Text)
	text = strings.TrimPrefix(text, "```json")
	text = strings.TrimSuffix(text, "```")
	text = strings.TrimSpace(text)

	var suggestions []map[string]string
	json.Unmarshal([]byte(text), &suggestions)
	c.JSON(http.StatusOK, gin.H{"suggestions": suggestions})
}
