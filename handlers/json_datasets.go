package handlers

import (
	"github.com/gin-gonic/gin"
)

// DatasetFAQItem holds a FAQ item
type DatasetFAQItem struct {
	Question string
	Answer   string
}

func getDatasetsFAQ(lang string) []DatasetFAQItem {
	if lang == "zh" {
		return []DatasetFAQItem{
			{Question: "这些 JSON 数据集可以免费用于商业项目吗？", Answer: "是的，所有数据集均采用开源授权，可免费用于个人和商业项目，无需注册或 API Key。"},
			{Question: "数据集多久更新一次？", Answer: "静态参考数据集（国家列表、HTTP 状态码等）几乎不会变动；动态类数据集每季度审核更新一次。"},
			{Question: "如何在代码中直接通过 URL 获取数据集？", Answer: "每个数据集都提供 Raw JSON URL（格式：toolboxnova.com/static/datasets/<slug>.json），可在 fetch/axios 中直接使用，已启用 CORS。"},
			{Question: "支持哪些下载格式？", Answer: "目前所有数据集均以标准 JSON 格式提供；CSV 和 YAML 导出格式即将支持。"},
			{Question: "我可以贡献自己的数据集吗？", Answer: "当然！请在 GitHub 提交 PR，附上数据来源、授权说明和字段文档，我们将在 48 小时内审核。"},
		}
	}
	return []DatasetFAQItem{
		{Question: "Are these JSON datasets free for commercial use?", Answer: "Yes, all datasets are open-source licensed and free for personal and commercial use. No registration or API key required."},
		{Question: "How often are the datasets updated?", Answer: "Static reference datasets (countries, HTTP codes) rarely change. Dynamic datasets are reviewed and updated quarterly."},
		{Question: "Can I fetch dataset JSON directly via URL in my code?", Answer: "Absolutely. Each dataset has a Raw JSON URL at toolboxnova.com/static/datasets/<slug>.json. CORS is enabled for browser and server-side fetch."},
		{Question: "What download formats are supported?", Answer: "All datasets are currently available as standard JSON. CSV and YAML export formats are coming soon."},
		{Question: "Can I contribute my own dataset?", Answer: "Yes! Submit a PR on GitHub with your data source, license info, and field documentation. We review contributions within 48 hours."},
	}
}

// JSONDatasetsPage renders the JSON datasets listing page
func JSONDatasetsPage(c *gin.Context) {
	lang := c.GetString("lang")
	if lang == "" {
		lang = "en"
	}
	t := getT(c)

	titleMap := map[string]string{
		"zh": "免费 JSON 数据集 — 85+ 开源合集 | ToolboxNova",
		"en": "Free JSON Datasets — 85+ Open Source Collections | ToolboxNova",
	}
	descMap := map[string]string{
		"zh": "下载 85+ 个免费开源 JSON 数据集，涵盖国家、货币、HTTP 状态码、Mock API、金融、AI 模型、物联网等，无需注册，即可使用。",
		"en": "Download 85+ free, open-source JSON datasets for testing, development, and learning. Covers countries, currencies, HTTP codes, mock APIs, finance, AI models, IoT, and more.",
	}

	data := baseData(c, gin.H{
		"Title":        titleMap[lang],
		"Description":  descMap[lang],
		"Keywords":     "json datasets, free json data, open source datasets, mock data, test data, json samples",
		"Lang":         lang,
		"T":            t,
		"FAQData":      getDatasetsFAQ(lang),
		"CanonicalURL": "https://toolboxnova.com/json/datasets",
		"HreflangEN":   "https://toolboxnova.com/json/datasets?lang=en",
		"HreflangZH":   "https://toolboxnova.com/json/datasets?lang=zh",
		"PageClass":    "page-json-datasets",
	})
	renderJSONTool(c, "datasets.html", data)
}


