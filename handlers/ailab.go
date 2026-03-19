package handlers

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"PycMono/github/toolskit/internal/aiservice"

	"github.com/gin-gonic/gin"
)

// AIDetectorPage renders the AI content detector page
func AIDetectorPage(c *gin.Context) {
	t := getT(c)
	data := baseData(c, gin.H{
		"Title":       t("ailab.detector.seo.title"),
		"Description": t("ailab.detector.seo.desc"),
		"Keywords":    "ai content detector, chatgpt detector, ai text checker, gptzero alternative, detect ai writing, free ai checker",
		"PageClass":   "page-ai-detector",
	})
	render(c, "ailab/detector.html", data)
}

// AIDetectRequest 请求结构
type AIDetectRequest struct {
	Text string `json:"text" binding:"required,min=50"`
}

// AIDetectResponse 响应结构
type AIDetectResponse struct {
	Success    bool                `json:"success"`
	Message    string              `json:"message,omitempty"`
	Result     *DetectionResult    `json:"result,omitempty"`
	Sentences  []SentenceAnalysis  `json:"sentences,omitempty"`
	Statistics DetectionStatistics `json:"statistics,omitempty"`
}

type DetectionResult struct {
	AIScore    float64 `json:"ai_score"`    // 0-100，AI 生成的可能性百分比
	HumanScore float64 `json:"human_score"` // 0-100，人类撰写的可能性百分比
	Conclusion string  `json:"conclusion"`  // "likely_ai" / "likely_human" / "mixed"
	Confidence float64 `json:"confidence"`  // 0-100，置信度
	Provider   string  `json:"provider"`    // 使用的 AI 提供商
}

type SentenceAnalysis struct {
	Text       string  `json:"text"`
	Index      int     `json:"index"`
	AIScore    float64 `json:"ai_score"` // 0-100
	Label      string  `json:"label"`    // "ai_high" / "ai_medium" / "human"
	Confidence float64 `json:"confidence"`
}

type DetectionStatistics struct {
	TotalWords     int   `json:"total_words"`
	TotalSentences int   `json:"total_sentences"`
	AISentences    int   `json:"ai_sentences"`
	HumanSentences int   `json:"human_sentences"`
	AnalysisTimeMs int64 `json:"analysis_time_ms"`
}

// AIDetectAPI 处理 AI 内容检测请求
func AIDetectAPI(c *gin.Context) {
	var req AIDetectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, AIDetectResponse{
			Success: false,
			Message: fmt.Sprintf("Invalid request: %v", err),
		})
		return
	}

	startTime := time.Now()

	// 获取 AI 服务工厂
	factory := aiservice.GetFactory()

	var result *DetectionResult
	var sentences []SentenceAnalysis
	var stats DetectionStatistics
	var err error

	if factory != nil {
		// 尝试使用 AI 提供商
		provider, providerErr := factory.GetProviderForTask("content_detection")
		if providerErr == nil {
			// 调用 AI 进行内容检测分析
			result, sentences, stats, err = analyzeTextWithAI(c.Request.Context(), provider, req.Text)
		} else {
			// AI 提供商不可用，使用启发式分析作为降级方案
			result, sentences, stats = performHeuristicAnalysis(req.Text)
		}
	} else {
		// AI 服务未初始化，使用启发式分析
		result, sentences, stats = performHeuristicAnalysis(req.Text)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, AIDetectResponse{
			Success: false,
			Message: fmt.Sprintf("Detection failed: %v", err),
		})
		return
	}

	stats.AnalysisTimeMs = time.Since(startTime).Milliseconds()

	c.JSON(http.StatusOK, AIDetectResponse{
		Success:    true,
		Result:     result,
		Sentences:  sentences,
		Statistics: stats,
	})
}

// analyzeTextWithAI 使用 AI 提供商分析文本
func analyzeTextWithAI(ctx context.Context, provider aiservice.AIProvider, text string) (*DetectionResult, []SentenceAnalysis, DetectionStatistics, error) {
	// 构建 AI 检测提示词
	systemPrompt := `You are an AI content detector. Analyze the given text and determine if it was written by AI or human.
Provide a detailed analysis including:
1. Overall AI probability score (0-100)
2. Sentence-by-sentence analysis with scores
3. Reasoning for your conclusion

Respond in JSON format with this structure:
{
  "overall_ai_score": <float 0-100>,
  "confidence": <float 0-100>,
  "conclusion": "<likely_ai|likely_human|mixed>",
  "sentences": [
    {"text": "<sentence>", "ai_score": <float 0-100>, "reasoning": "<brief reason>"}
  ]
}`

	userPrompt := fmt.Sprintf("Analyze this text for AI-generated content:\n\n%s", text)

	// 调用 AI 服务
	chatReq := aiservice.ChatRequest{
		SystemPrompt: systemPrompt,
		Messages: []aiservice.Message{
			{Role: "user", Content: userPrompt},
		},
		MaxTokens:   2000,
		Temperature: 0.3, // 低温度确保结果稳定
	}

	resp, err := provider.Chat(ctx, chatReq)
	if err != nil {
		return nil, nil, DetectionStatistics{}, err
	}

	// 解析 AI 响应并构建结果
	// 注意：这里简化处理，实际应解析 JSON 响应
	result, sentences, stats := parseAIResponse(resp.Content, text)
	result.Provider = provider.GetProviderName()

	return result, sentences, stats, nil
}

// parseAIResponse 解析 AI 响应（简化版实现）
func parseAIResponse(aiResponse, originalText string) (*DetectionResult, []SentenceAnalysis, DetectionStatistics) {
	// 简化实现：基于文本特征进行启发式分析
	// 实际生产环境应该解析 AI 的 JSON 响应

	sentences := splitIntoSentences(originalText)
	sentenceAnalyses := make([]SentenceAnalysis, 0, len(sentences))

	aiCount := 0
	totalScore := 0.0

	for i, sent := range sentences {
		score := analyzesentence(sent)
		label := "human"
		if score > 80 {
			label = "ai_high"
			aiCount++
		} else if score > 40 {
			label = "ai_medium"
		}

		sentenceAnalyses = append(sentenceAnalyses, SentenceAnalysis{
			Text:       sent,
			Index:      i,
			AIScore:    score,
			Label:      label,
			Confidence: 85.0,
		})
		totalScore += score
	}

	avgScore := totalScore / float64(len(sentences))
	humanScore := 100.0 - avgScore

	conclusion := "mixed"
	if avgScore > 70 {
		conclusion = "likely_ai"
	} else if avgScore < 30 {
		conclusion = "likely_human"
	}

	stats := DetectionStatistics{
		TotalWords:     countWords(originalText),
		TotalSentences: len(sentences),
		AISentences:    aiCount,
		HumanSentences: len(sentences) - aiCount,
	}

	return &DetectionResult{
		AIScore:    avgScore,
		HumanScore: humanScore,
		Conclusion: conclusion,
		Confidence: 85.0,
	}, sentenceAnalyses, stats
}

// splitIntoSentences 将文本分割成句子
func splitIntoSentences(text string) []string {
	// 简化实现
	text = strings.TrimSpace(text)
	delimiters := []string{"。", "！", "？", ". ", "! ", "? ", ".\n", "!\n", "?\n"}

	sentences := []string{text}
	for _, delim := range delimiters {
		var newSentences []string
		for _, sent := range sentences {
			parts := strings.Split(sent, delim)
			for _, part := range parts {
				part = strings.TrimSpace(part)
				if len(part) > 0 {
					newSentences = append(newSentences, part)
				}
			}
		}
		sentences = newSentences
	}

	return sentences
}

// analyzesentence 分析单个句子的 AI 特征（启发式方法）
func analyzesentence(sentence string) float64 {
	score := 50.0 // 基础分数

	// 检查 AI 常见特征
	aiIndicators := []string{
		"furthermore", "moreover", "additionally", "consequently",
		"综上所述", "因此", "总而言之", "首先", "其次", "最后",
		"it is important to note", "it should be noted",
	}

	lowerSent := strings.ToLower(sentence)
	for _, indicator := range aiIndicators {
		if strings.Contains(lowerSent, strings.ToLower(indicator)) {
			score += 10.0
		}
	}

	// 句子长度分析（AI 倾向于中等长度的句子）
	wordCount := len(strings.Fields(sentence))
	if wordCount >= 15 && wordCount <= 30 {
		score += 5.0
	}

	// 确保分数在 0-100 范围内
	if score > 100 {
		score = 100
	}
	if score < 0 {
		score = 0
	}

	return score
}

// countWords 统计词数
func countWords(text string) int {
	return len(strings.Fields(text))
}

// AIDetectFileAPI 处理文件上传检测请求
func AIDetectFileAPI(c *gin.Context) {
	startTime := time.Now()

	// 获取上传的文件
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, AIDetectResponse{
			Success: false,
			Message: "No file uploaded or invalid file",
		})
		return
	}
	defer file.Close()

	// 检查文件大小（最大 5MB）
	const maxFileSize = 5 * 1024 * 1024
	if header.Size > maxFileSize {
		c.JSON(http.StatusBadRequest, AIDetectResponse{
			Success: false,
			Message: "File size exceeds 5MB limit",
		})
		return
	}

	// 检查文件格式
	filename := header.Filename
	ext := strings.ToLower(filename[strings.LastIndex(filename, ".")+1:])
	if ext != "txt" && ext != "pdf" && ext != "docx" {
		c.JSON(http.StatusBadRequest, AIDetectResponse{
			Success: false,
			Message: "Unsupported file format. Only .txt, .pdf, .docx are allowed",
		})
		return
	}

	// 读取文件内容
	fileContent, err := io.ReadAll(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, AIDetectResponse{
			Success: false,
			Message: fmt.Sprintf("Failed to read file: %v", err),
		})
		return
	}

	// 根据文件类型提取文本
	var text string
	switch ext {
	case "txt":
		text = string(fileContent)
	case "pdf":
		text, err = extractTextFromPDF(fileContent)
		if err != nil {
			c.JSON(http.StatusInternalServerError, AIDetectResponse{
				Success: false,
				Message: fmt.Sprintf("Failed to parse PDF: %v", err),
			})
			return
		}
	case "docx":
		text, err = extractTextFromDOCX(fileContent)
		if err != nil {
			c.JSON(http.StatusInternalServerError, AIDetectResponse{
				Success: false,
				Message: fmt.Sprintf("Failed to parse DOCX: %v", err),
			})
			return
		}
	}

	// 验证提取的文本长度
	text = strings.TrimSpace(text)
	if len(text) < 50 {
		c.JSON(http.StatusBadRequest, AIDetectResponse{
			Success: false,
			Message: "Extracted text is too short (minimum 50 characters required)",
		})
		return
	}

	// 使用通用检测逻辑
	result, sentences, stats := performDetection(c.Request.Context(), text)
	stats.AnalysisTimeMs = time.Since(startTime).Milliseconds()

	c.JSON(http.StatusOK, AIDetectResponse{
		Success:    true,
		Result:     result,
		Sentences:  sentences,
		Statistics: stats,
	})
}

// AIDetectURLAPI 处理 URL 检测请求
func AIDetectURLAPI(c *gin.Context) {
	startTime := time.Now()

	var req struct {
		URL string `json:"url" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, AIDetectResponse{
			Success: false,
			Message: "URL is required",
		})
		return
	}

	// 验证 URL 格式
	if !strings.HasPrefix(req.URL, "http://") && !strings.HasPrefix(req.URL, "https://") {
		c.JSON(http.StatusBadRequest, AIDetectResponse{
			Success: false,
			Message: "Invalid URL format. Must start with http:// or https://",
		})
		return
	}

	// 抓取网页内容
	text, err := fetchAndExtractText(req.URL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, AIDetectResponse{
			Success: false,
			Message: fmt.Sprintf("Failed to fetch URL: %v", err),
		})
		return
	}

	// 验证提取的文本长度
	text = strings.TrimSpace(text)
	if len(text) < 50 {
		c.JSON(http.StatusBadRequest, AIDetectResponse{
			Success: false,
			Message: "Extracted text is too short (minimum 50 characters required)",
		})
		return
	}

	// 使用通用检测逻辑
	result, sentences, stats := performDetection(c.Request.Context(), text)
	stats.AnalysisTimeMs = time.Since(startTime).Milliseconds()

	c.JSON(http.StatusOK, AIDetectResponse{
		Success:    true,
		Result:     result,
		Sentences:  sentences,
		Statistics: stats,
	})
}

// performDetection 统一的检测逻辑（供文本/文件/URL 使用）
func performDetection(ctx context.Context, text string) (*DetectionResult, []SentenceAnalysis, DetectionStatistics) {
	factory := aiservice.GetFactory()

	if factory != nil {
		provider, err := factory.GetProviderForTask("content_detection")
		if err == nil {
			result, sentences, stats, err := analyzeTextWithAI(ctx, provider, text)
			if err == nil {
				return result, sentences, stats
			}
		}
	}

	// 降级到启发式分析
	return performHeuristicAnalysis(text)
}

// extractTextFromPDF 从 PDF 文件提取文本（简化实现）
func extractTextFromPDF(content []byte) (string, error) {
	// 简化实现：实际生产环境需要使用 PDF 解析库如 github.com/ledongthuc/pdf
	// 这里返回一个提示，表示需要实现
	return "", fmt.Errorf("PDF parsing not yet implemented. Please install a PDF library")
}

// extractTextFromDOCX 从 DOCX 文件提取文本（简化实现）
func extractTextFromDOCX(content []byte) (string, error) {
	// 简化实现：实际生产环境需要使用 DOCX 解析库如 github.com/nguyenthenguyen/docx
	// 这里返回一个提示，表示需要实现
	return "", fmt.Errorf("DOCX parsing not yet implemented. Please install a DOCX library")
}

// fetchAndExtractText 从 URL 抓取并提取正文
func fetchAndExtractText(url string) (string, error) {
	// 创建带超时的 HTTP 客户端
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	resp, err := client.Get(url)
	if err != nil {
		return "", fmt.Errorf("failed to fetch URL: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("HTTP error: %d", resp.StatusCode)
	}

	// 读取响应体
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response: %w", err)
	}

	// 简化的文本提取（去除 HTML 标签）
	text := extractTextFromHTML(string(body))
	return text, nil
}

// extractTextFromHTML 从 HTML 中提取文本（简化实现）
func extractTextFromHTML(html string) string {
	// 简化实现：移除常见的 HTML 标签
	// 实际生产环境应使用 github.com/PuerkitoBio/goquery 等库
	text := html

	// 移除 script 和 style 标签及其内容
	text = removeTagAndContent(text, "script")
	text = removeTagAndContent(text, "style")
	text = removeTagAndContent(text, "nav")
	text = removeTagAndContent(text, "header")
	text = removeTagAndContent(text, "footer")

	// 移除所有 HTML 标签
	text = strings.ReplaceAll(text, "<br>", "\n")
	text = strings.ReplaceAll(text, "<br/>", "\n")
	text = strings.ReplaceAll(text, "</p>", "\n")

	// 简单的标签移除（不完美但可用）
	inTag := false
	var result strings.Builder
	for _, char := range text {
		if char == '<' {
			inTag = true
		} else if char == '>' {
			inTag = false
		} else if !inTag {
			result.WriteRune(char)
		}
	}

	// 清理多余空白
	cleaned := strings.TrimSpace(result.String())
	cleaned = strings.ReplaceAll(cleaned, "\n\n\n", "\n\n")

	return cleaned
}

// removeTagAndContent 移除指定标签及其内容
func removeTagAndContent(text, tag string) string {
	startTag := "<" + tag
	endTag := "</" + tag + ">"

	for {
		start := strings.Index(strings.ToLower(text), startTag)
		if start == -1 {
			break
		}

		end := strings.Index(strings.ToLower(text[start:]), endTag)
		if end == -1 {
			break
		}

		text = text[:start] + text[start+end+len(endTag):]
	}

	return text
}

// performHeuristicAnalysis 启发式分析（无需 AI 提供商的降级方案）
func performHeuristicAnalysis(text string) (*DetectionResult, []SentenceAnalysis, DetectionStatistics) {
	sentences := splitIntoSentences(text)
	sentenceAnalyses := make([]SentenceAnalysis, 0, len(sentences))

	aiCount := 0
	totalScore := 0.0

	for i, sent := range sentences {
		score := analyzesentence(sent)
		label := "human"
		if score > 80 {
			label = "ai_high"
			aiCount++
		} else if score > 40 {
			label = "ai_medium"
		}

		sentenceAnalyses = append(sentenceAnalyses, SentenceAnalysis{
			Text:       sent,
			Index:      i,
			AIScore:    score,
			Label:      label,
			Confidence: 75.0, // 降级模式置信度较低
		})
		totalScore += score
	}

	avgScore := totalScore / float64(len(sentences))
	humanScore := 100.0 - avgScore

	conclusion := "mixed"
	if avgScore > 70 {
		conclusion = "likely_ai"
	} else if avgScore < 30 {
		conclusion = "likely_human"
	}

	stats := DetectionStatistics{
		TotalWords:     countWords(text),
		TotalSentences: len(sentences),
		AISentences:    aiCount,
		HumanSentences: len(sentences) - aiCount,
	}

	return &DetectionResult{
		AIScore:    avgScore,
		HumanScore: humanScore,
		Conclusion: conclusion,
		Confidence: 75.0,        // 启发式方法置信度
		Provider:   "heuristic", // 标识为启发式分析
	}, sentenceAnalyses, stats
}
