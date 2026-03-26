package handlers

import (
	"fmt"
	"html/template"
	"log"
	"math/rand"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"

	"PycMono/github/toolskit/internal/smsservice"

	"github.com/gin-gonic/gin"
)

// smsService 全局 SMS 业务层单例（对接真实 5SIM API）
var smsService = smsservice.NewSMSService()

var countries = []gin.H{
	{"code": "US", "name": "United States", "flag": "🇺🇸", "count": 142},
	{"code": "GB", "name": "United Kingdom", "flag": "🇬🇧", "count": 87},
	{"code": "RU", "name": "Russia", "flag": "🇷🇺", "count": 234},
	{"code": "IN", "name": "India", "flag": "🇮🇳", "count": 198},
	{"code": "BR", "name": "Brazil", "flag": "🇧🇷", "count": 76},
	{"code": "DE", "name": "Germany", "flag": "🇩🇪", "count": 65},
	{"code": "FR", "name": "France", "flag": "🇫🇷", "count": 54},
	{"code": "CN", "name": "China", "flag": "🇨🇳", "count": 43},
	{"code": "JP", "name": "Japan", "flag": "🇯🇵", "count": 38},
	{"code": "CA", "name": "Canada", "flag": "🇨🇦", "count": 52},
	{"code": "AU", "name": "Australia", "flag": "🇦🇺", "count": 41},
	{"code": "MX", "name": "Mexico", "flag": "🇲🇽", "count": 67},
	{"code": "PH", "name": "Philippines", "flag": "🇵🇭", "count": 89},
	{"code": "ID", "name": "Indonesia", "flag": "🇮🇩", "count": 112},
	{"code": "NG", "name": "Nigeria", "flag": "🇳🇬", "count": 45},
}

var services = []gin.H{
	{"id": "google", "name": "Google", "icon": "🔵"},
	{"id": "whatsapp", "name": "WhatsApp", "icon": "💚"},
	{"id": "telegram", "name": "Telegram", "icon": "🔷"},
	{"id": "facebook", "name": "Facebook", "icon": "📘"},
	{"id": "twitter", "name": "Twitter/X", "icon": "🐦"},
	{"id": "tiktok", "name": "TikTok", "icon": "🎵"},
	{"id": "amazon", "name": "Amazon", "icon": "📦"},
	{"id": "apple", "name": "Apple", "icon": "🍎"},
	{"id": "microsoft", "name": "Microsoft", "icon": "🪟"},
	{"id": "instagram", "name": "Instagram", "icon": "📷"},
	{"id": "uber", "name": "Uber", "icon": "🚗"},
	{"id": "paypal", "name": "PayPal", "icon": "💳"},
	{"id": "netflix", "name": "Netflix", "icon": "🎬"},
	{"id": "discord", "name": "Discord", "icon": "💜"},
	{"id": "snapchat", "name": "Snapchat", "icon": "👻"},
	{"id": "line", "name": "LINE", "icon": "💬"},
	{"id": "viber", "name": "Viber", "icon": "📞"},
	{"id": "wechat", "name": "WeChat", "icon": "🍀"},
	{"id": "airbnb", "name": "Airbnb", "icon": "🏠"},
	{"id": "ebay", "name": "eBay", "icon": "🛒"},
}

var operators = []string{"AT&T", "Verizon", "T-Mobile", "Vodafone", "O2", "MTS", "Beeline", "Jio", "Airtel", "Claro", "TIM", "Deutsche Telekom", "Orange", "China Mobile", "SoftBank"}
var statusList = []string{"Active", "Ready", "Active", "Ready", "Active"}

func randomPhone(country string) string {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	prefixes := map[string]string{
		"US": "+1", "GB": "+44", "RU": "+7", "IN": "+91", "BR": "+55",
		"DE": "+49", "FR": "+33", "CN": "+86", "JP": "+81", "CA": "+1",
		"AU": "+61", "MX": "+52", "PH": "+63", "ID": "+62", "NG": "+234",
	}
	prefix := "+1"
	if p, ok := prefixes[country]; ok {
		prefix = p
	}
	return fmt.Sprintf("%s %d%d%d %d%d%d %d%d%d%d",
		prefix,
		r.Intn(9)+1, r.Intn(10), r.Intn(10),
		r.Intn(10), r.Intn(10), r.Intn(10),
		r.Intn(10), r.Intn(10), r.Intn(10), r.Intn(10),
	)
}

func generateNumbers(country string, count int) []gin.H {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	var numbers []gin.H
	countryFlag := "🌍"
	countryName := country
	for _, c := range countries {
		if c["code"] == country {
			countryFlag = c["flag"].(string)
			countryName = c["name"].(string)
		}
	}
	for i := 0; i < count; i++ {
		phone := randomPhone(country)
		numbers = append(numbers, gin.H{
			"phone":         phone,
			"country":       countryName,
			"country_code":  country,
			"flag":          countryFlag,
			"operator":      operators[r.Intn(len(operators))],
			"status":        statusList[r.Intn(len(statusList))],
			"last_received": fmt.Sprintf("%d min ago", r.Intn(60)+1),
			"phone_url":     phone[1:], // strip + for URL
		})
	}
	return numbers
}

// SMSLandingPage renders the SMS landing page (S-01, S-02)
func SMSLandingPage(c *gin.Context) {
	t := getT(c)
	lang := c.GetString("lang")

	// Build FAQ data
	type FAQ struct {
		Q string
		A string
	}
	faqs := []FAQ{
		{Q: t("sms.faq.q1"), A: t("sms.faq.a1")},
		{Q: t("sms.faq.q2"), A: t("sms.faq.a2")},
		{Q: t("sms.faq.q3"), A: t("sms.faq.a3")},
		{Q: t("sms.faq.q4"), A: t("sms.faq.a4")},
		{Q: t("sms.faq.q5"), A: t("sms.faq.a5")},
	}

	data := baseData(c, gin.H{
		"Title":       t("sms.seo.landing.title"),
		"Description": t("sms.seo.landing.desc"),
		"Keywords":    "SMS receiver, virtual phone number, online SMS verification, temporary phone number, receive SMS online, OTP receiver, 5sim alternative",
		"PageClass":   "page-sms-landing",
		"Path":        "/sms",
		"Countries":   countries,
		"Services":    services,
		"FAQs":        faqs,
		"JSONLD": template.JS(`{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "SMS Receiver",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "Web",
  "offers": { "@type": "Offer", "price": "0.01", "priceCurrency": "USD" },
  "description": "Virtual phone numbers for SMS verification. 180+ countries, 700+ services.",
  "url": "https://toolboxnova.com/sms"
}`),
	})

	// 添加 hreflang 和 canonical
	if lang == "zh" {
		data["Canonical"] = "https://toolboxnova.com/sms?lang=zh"
	} else {
		data["Canonical"] = "https://toolboxnova.com/sms"
	}
	data["AlternateEN"] = "https://toolboxnova.com/sms?lang=en"
	data["AlternateZH"] = "https://toolboxnova.com/sms?lang=zh"

	render(c, "sms_landing.html", data)
}

// SMSBuyPage renders the buy number page (S-05, S-06)
func SMSBuyPage(c *gin.Context) {
	t := getT(c)

	data := baseData(c, gin.H{
		"Title":       t("sms.seo.buy.title"),
		"Description": t("sms.seo.buy.desc"),
		"Keywords":    "buy virtual number, purchase SMS number, virtual phone rental, online SMS activation",
		"PageClass":   "page-sms-buy",
		"Path":        "/sms/buy",
		"Countries":   countries,
		"Services":    services,
	})
	render(c, "sms_buy.html", data)
}

// SMSPricesPage renders the prices page (S-09)
func SMSPricesPage(c *gin.Context) {
	t := getT(c)

	data := baseData(c, gin.H{
		"Title":       t("sms.seo.prices.title"),
		"Description": t("sms.seo.prices.desc"),
		"Keywords":    "SMS prices, virtual number cost, SMS verification rates, phone number pricing",
		"PageClass":   "page-sms-prices",
		"Path":        "/sms/prices",
		"Services":    services,
		"Countries":   countries,
	})
	render(c, "sms_prices.html", data)
}

// SMSPage - 保留旧的 handler 用于兼容
func SMSPage(c *gin.Context) {
	SMSLandingPage(c)
}

// SMSActivePage renders the active orders page (S-07)
func SMSActivePage(c *gin.Context) {
	t := getT(c)

	data := baseData(c, gin.H{
		"Title":       t("sms.active.title") + " - SMS Receiver | Tool Box Nova",
		"Description": "Manage your active SMS orders and receive verification codes.",
		"Keywords":    "active SMS orders, SMS inbox",
		"PageClass":   "page-sms-active",
		"Path":        "/sms/active",
	})
	render(c, "sms_active.html", data)
}

// SMSHistoryPage renders the history page (S-08)
func SMSHistoryPage(c *gin.Context) {
	t := getT(c)

	data := baseData(c, gin.H{
		"Title":       t("sms.history.title") + " - SMS Receiver | Tool Box Nova",
		"Description": "View your SMS order history and past transactions.",
		"Keywords":    "SMS history, order history",
		"PageClass":   "page-sms-history",
		"Path":        "/sms/history",
	})
	render(c, "sms_history.html", data)
}

// SMSCountryPage renders SMS page filtered by country
func SMSCountryPage(c *gin.Context) {
	country := c.Param("country")
	numbers := generateNumbers(country, 20)

	data := baseData(c, gin.H{
		"Title":           fmt.Sprintf("Free %s Phone Numbers - SMS Receiver | Tool Box Nova", country),
		"Description":     fmt.Sprintf("Receive SMS online with free %s virtual phone numbers.", country),
		"Keywords":        fmt.Sprintf("free %s SMS, virtual phone number %s, online SMS receiver", country, country),
		"PageClass":       "page-sms",
		"Countries":       countries,
		"Services":        services,
		"Numbers":         numbers,
		"SelectedCountry": country,
	})
	render(c, "sms.html", data)
}

// SMSInboxPage renders the SMS inbox for a specific phone
func SMSInboxPage(c *gin.Context) {
	phone := c.Param("phone")

	data := baseData(c, gin.H{
		"Title":       fmt.Sprintf("SMS Inbox for +%s | Tool Box Nova", phone),
		"Description": fmt.Sprintf("View SMS messages received by virtual number +%s.", phone),
		"Keywords":    "SMS inbox, verify code, OTP, virtual number",
		"PageClass":   "page-sms-inbox",
		"Phone":       "+" + phone,
		"PhoneURL":    phone,
		"Countries":   countries,
	})
	render(c, "sms_inbox.html", data)
}

// SMSServicePage renders SMS filtered by service
func SMSServicePage(c *gin.Context) {
	service := c.Param("service")
	numbers := generateNumbers("US", 20)

	serviceName := service
	for _, s := range services {
		if s["id"] == service {
			serviceName = s["name"].(string)
		}
	}

	data := baseData(c, gin.H{
		"Title":       fmt.Sprintf("Receive %s SMS Online Free | Tool Box Nova", serviceName),
		"Description": fmt.Sprintf("Get a virtual phone number to receive %s verification codes for free.", serviceName),
		"Keywords":    fmt.Sprintf("%s SMS receiver, verify %s, OTP %s", serviceName, serviceName, serviceName),
		"PageClass":   "page-sms",
		"Countries":   countries,
		"Services":    services,
		"Numbers":     numbers,
		"ServiceName": serviceName,
		"ServiceID":   service,
	})
	render(c, "sms_service.html", data)
}

// SMSNumbersAPI returns numbers as JSON
func SMSNumbersAPI(c *gin.Context) {
	country := c.DefaultQuery("country", "US")
	numbers := generateNumbers(country, 20)
	c.JSON(http.StatusOK, gin.H{
		"list":  numbers,
		"total": 200,
		"page":  1,
	})
}

// SMSStatsAPI returns stats
func SMSStatsAPI(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"total_activations": 1284762,
		"online_numbers":    3421,
		"countries":         len(countries),
		"services":          len(services),
	})
}

// SMSMessagesAPI returns messages for a phone
func SMSMessagesAPI(c *gin.Context) {
	phone := c.Param("phone")
	_ = phone
	// Return mock messages for demo
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	mockMessages := []gin.H{
		{
			"id":          "1",
			"from":        "Google",
			"content":     fmt.Sprintf("Your Google verification code is %06d. Don't share it with anyone.", r.Intn(900000)+100000),
			"received_at": "2 minutes ago",
			"code":        fmt.Sprintf("%06d", r.Intn(900000)+100000),
		},
	}
	c.JSON(http.StatusOK, gin.H{"messages": mockMessages})
}

// ==================== S-01 新增 API Handlers（对标 5SIM API）====================

// serviceIconMap 平台图标 emoji 映射（与前端 PLATFORM_ICONS 对应）
var serviceIconMap = map[string]string{
	"google":    "🔵",
	"whatsapp":  "💚",
	"telegram":  "🔷",
	"facebook":  "📘",
	"twitter":   "🐦",
	"tiktok":    "🎵",
	"amazon":    "📦",
	"apple":     "🍎",
	"microsoft": "🪟",
	"instagram": "📷",
	"uber":      "🚗",
	"paypal":    "💳",
	"netflix":   "🎬",
	"discord":   "💜",
	"snapchat":  "👻",
	"line":      "💬",
	"viber":     "📞",
	"wechat":    "🍀",
	"airbnb":    "🏠",
	"ebay":      "🛒",
}

// SMSGetProducts 返回产品列表（真实 5SIM API） GET /api/sms/products?country=any
func SMSGetProducts(c *gin.Context) {
	country := c.DefaultQuery("country", "any")

	items, err := smsService.GetProductsForCountry(country)
	if err != nil {
		// 5SIM API 不可用时降级为 mock 数据
		log.Printf("5SIM GetProducts error: %v", err)
		c.JSON(http.StatusOK, gin.H{
			"products": services,
			"total":    len(services),
			"source":   "fallback",
		})
		return
	}

	// 将 ProductItem 转为前端期望的格式（id / name / icon / count）
	type ProductFE struct {
		ID    string `json:"id"`
		Name  string `json:"name"`
		Icon  string `json:"icon"`
		Count int    `json:"count"`
	}
	result := make([]ProductFE, 0, len(items))
	for _, it := range items {
		icon := serviceIconMap[strings.ToLower(it.Name)]
		if icon == "" {
			icon = "📱"
		}
		displayName := it.DisplayName
		if displayName == "" {
			displayName = it.Name
		}
		result = append(result, ProductFE{
			ID:    strings.ToLower(it.Name),
			Name:  displayName,
			Icon:  icon,
			Count: it.Qty,
		})
	}

	// 按库存倒序
	sort.Slice(result, func(i, j int) bool {
		return result[i].Count > result[j].Count
	})

	c.JSON(http.StatusOK, gin.H{
		"products": result,
		"total":    len(result),
		"country":  country,
	})
}

// SMSGetCountries 返回国家列表（真实 5SIM API）GET /api/sms/countries?service=whatsapp
func SMSGetCountries(c *gin.Context) {
	service := c.Query("service")

	prices, err := smsService.GetPricesAll()
	if err != nil {
		log.Printf("5SIM GetPrices error: %v", err)
		// 降级：返回 mock 国家列表（字段与前端一致）
		fallbackCountries := []gin.H{
			{"code": "us", "name": "United States", "flag": "🇺🇸", "count": 120},
			{"code": "gb", "name": "United Kingdom", "flag": "🇬🇧", "count": 85},
			{"code": "de", "name": "Germany", "flag": "🇩🇪", "count": 64},
			{"code": "fr", "name": "France", "flag": "🇫🇷", "count": 47},
			{"code": "in", "name": "India", "flag": "🇮🇳", "count": 210},
			{"code": "ru", "name": "Russia", "flag": "🇷🇺", "count": 380},
			{"code": "br", "name": "Brazil", "flag": "🇧🇷", "count": 55},
			{"code": "cn", "name": "China", "flag": "🇨🇳", "count": 33},
			{"code": "ca", "name": "Canada", "flag": "🇨🇦", "count": 41},
			{"code": "au", "name": "Australia", "flag": "🇦🇺", "count": 29},
		}
		c.JSON(http.StatusOK, gin.H{
			"countries": fallbackCountries,
			"total":     len(fallbackCountries),
			"source":    "fallback",
		})
		return
	}

	// 按国家聚合，计算总库存
	type countryEntry struct {
		Code  string `json:"code"`
		Name  string `json:"name"`
		Flag  string `json:"flag"`
		Count int    `json:"count"`
	}
	countryMap := make(map[string]*countryEntry)

	for _, p := range prices {
		if service != "" && p.Product != service {
			continue
		}
		key := p.Country
		if _, exists := countryMap[key]; !exists {
			countryMap[key] = &countryEntry{
				Code:  p.Country,
				Name:  smsservice.ToCountryDisplayName(p.Country),
				Flag:  smsservice.CountryFlag(p.Country),
				Count: 0,
			}
		}
		countryMap[key].Count += p.Count
	}

	list := make([]countryEntry, 0, len(countryMap))
	for _, v := range countryMap {
		list = append(list, *v)
	}

	// 按库存倒序排列
	sort.Slice(list, func(i, j int) bool {
		return list[i].Count > list[j].Count
	})

	c.JSON(http.StatusOK, gin.H{
		"countries": list,
		"total":     len(list),
	})
}

// SMSGetOperators 返回运营商价格列表（真实 5SIM API）GET /api/sms/operators?service=whatsapp&country=russia
func SMSGetOperators(c *gin.Context) {
	service := c.Query("service")
	country := c.Query("country")

	type OperatorItem struct {
		Operator string  `json:"operator"`
		Name     string  `json:"name"`
		Count    int     `json:"count"`
		Cost     int     `json:"cost"`
		Rate     float64 `json:"rate"`
	}

	prices, err := smsService.GetPricesAll()
	if err != nil {
		log.Printf("5SIM GetOperators error: %v", err)
		r := rand.New(rand.NewSource(time.Now().UnixNano()))
		fallback := []OperatorItem{
			{Operator: "any", Name: "自动分配", Count: 50 + r.Intn(150), Cost: 0, Rate: 85},
		}
		c.JSON(http.StatusOK, gin.H{
			"country":   country,
			"service":   service,
			"operators": fallback,
			"source":    "fallback",
		})
		return
	}

	var ops []OperatorItem
	for _, p := range prices {
		if p.Product == service && p.Country == country {
			ops = append(ops, OperatorItem{
				Operator: p.Operator,
				Name:     p.Operator,
				Count:    p.Count,
				Cost:     p.Cost,
				Rate:     p.Rate,
			})
		}
	}

	// 若无数据，返回 "any" 作为默认选项
	if len(ops) == 0 {
		r := rand.New(rand.NewSource(time.Now().UnixNano()))
		ops = []OperatorItem{
			{Operator: "any", Name: "自动分配", Count: 30 + r.Intn(100), Cost: 0, Rate: 80},
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"country":   country,
		"service":   service,
		"operators": ops,
		"total":     len(ops),
	})
}

// SMSGetPrices 返回分页价格表 GET /api/sms/prices?q=whatsapp&country=russia&page=1&size=20
func SMSGetPrices(c *gin.Context) {
	const defaultSize = 20

	q             := strings.ToLower(strings.TrimSpace(c.Query("q")))
	countryFilter := strings.ToLower(strings.TrimSpace(c.Query("country")))
	pageStr       := c.DefaultQuery("page", "1")
	sizeStr       := c.DefaultQuery("size", "20")

	page, _ := strconv.Atoi(pageStr)
	size, _ := strconv.Atoi(sizeStr)
	if page < 1            { page = 1 }
	if size < 1 || size > 100 { size = defaultSize }

	prices, err := smsService.GetPricesAll()
	if err != nil {
		log.Printf("5SIM GetPrices error: %v", err)
		r := rand.New(rand.NewSource(time.Now().UnixNano()))
		var mockPrices []gin.H
		for _, svc := range services {
			for j, cty := range countries {
				if j >= 5 { break }
				mockPrices = append(mockPrices, gin.H{
					"product":  svc["id"],
					"country":  cty["name"],
					"operator": "any",
					"cost":     10 + r.Intn(90),
					"count":    r.Intn(200),
					"rate":     60 + r.Intn(40),
				})
			}
		}
		total := len(mockPrices)
		start, end := paginate(total, page, size)
		c.JSON(http.StatusOK, gin.H{
			"prices":      mockPrices[start:end],
			"total":       total,
			"page":        page,
			"size":        size,
			"total_pages": (total + size - 1) / size,
			"updated_at":  time.Now().Format(time.RFC3339),
			"source":      "fallback",
		})
		return
	}

	// 过滤（country 大小写不敏感）
	var filtered []smsservice.PriceItem
	for _, p := range prices {
		if q != "" && !strings.Contains(strings.ToLower(p.Product), q) &&
			!strings.Contains(strings.ToLower(p.Country), q) {
			continue
		}
		if countryFilter != "" && strings.ToLower(p.Country) != countryFilter {
			continue
		}
		filtered = append(filtered, p)
	}

	total := len(filtered)
	start, end := paginate(total, page, size)

	c.JSON(http.StatusOK, gin.H{
		"prices":      filtered[start:end],
		"total":       total,
		"page":        page,
		"size":        size,
		"total_pages": (total + size - 1) / size,
		"updated_at":  time.Now().Format(time.RFC3339),
	})
}

// paginate 分页辅助：返回 start/end 下标（不越界）
func paginate(total, page, size int) (int, int) {
	start := (page - 1) * size
	end   := start + size
	if start > total { start = total }
	if end   > total { end   = total }
	return start, end
}

// SMSGetPriceCountries 返回全量国家列表（供价格页筛选下拉）GET /api/sms/price-countries
func SMSGetPriceCountries(c *gin.Context) {
	prices, err := smsService.GetPricesAll()
	if err != nil {
		// fallback：返回静态国家列表
		var list []gin.H
		for _, cty := range countries {
			list = append(list, gin.H{
				"code": cty["code"],
				"name": cty["name"],
				"flag": cty["flag"],
			})
		}
		c.JSON(http.StatusOK, gin.H{"countries": list})
		return
	}

	seen := make(map[string]bool)
	var list []gin.H
	for _, p := range prices {
		k := strings.ToLower(p.Country)
		if seen[k] { continue }
		seen[k] = true
		list = append(list, gin.H{
			"code": p.Country,
			"name": smsservice.ToCountryDisplayName(p.Country),
			"flag": smsservice.CountryFlag(p.Country),
		})
	}
	// 按 name 排序
	sort.Slice(list, func(i, j int) bool {
		return fmt.Sprint(list[i]["name"]) < fmt.Sprint(list[j]["name"])
	})
	c.JSON(http.StatusOK, gin.H{"countries": list, "total": len(list)})
}

// SMSGetStats 返回统计数据
func SMSGetStats(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"total_services":    700,
		"total_countries":   180,
		"total_deliveries":  "12.8M+",
		"uptime":            "99.9%",
		"online_numbers":    3421,
		"total_activations": 12847621,
	})
}

// SMSBuyNumber 购买虚拟号码（真实 5SIM API + fallback mock）POST /api/sms/buy
func SMSBuyNumber(c *gin.Context) {
	var req struct {
		Service  string `json:"service"`
		Country  string `json:"country"`
		Operator string `json:"operator"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误: " + err.Error()})
		return
	}

	// 参数防御
	req.Service  = strings.TrimSpace(req.Service)
	req.Country  = strings.TrimSpace(req.Country)
	req.Operator = strings.TrimSpace(req.Operator)

	if req.Service == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请选择服务平台"})
		return
	}
	if req.Country == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请选择国家"})
		return
	}
	if req.Operator == "" {
		req.Operator = "any"
	}

	order, err := smsService.BuyActivationNumber(req.Service, req.Country, req.Operator)
	if err != nil {
		errMsg := err.Error()
		log.Printf("5SIM BuyNumber error (service=%s country=%s): %v", req.Service, req.Country, err)

		// 业务级错误：无库存
		if strings.Contains(errMsg, "no numbers") || strings.Contains(errMsg, "not found") {
			c.JSON(http.StatusOK, gin.H{
				"error":  "no numbers available",
				"detail": "当前平台/国家暂无可用号码，请换一个组合试试",
			})
			return
		}

		// 其他错误（API Key 未配置/网络问题）→ 降级返回 mock 订单，让前端可以体验完整流程
		mockOrderID := fmt.Sprintf("MOCK-%d", time.Now().UnixNano()%100000000)
		mockPhone   := randomPhone("US")

		c.JSON(http.StatusOK, gin.H{
			"id":         mockOrderID,
			"phone":      mockPhone,
			"product":    req.Service,
			"country":    req.Country,
			"operator":   req.Operator,
			"price":      0,
			"status":     "WAITING",
			"expires_at": time.Now().Add(20 * time.Minute).Format(time.RFC3339),
			"created_at": time.Now().Format(time.RFC3339),
			"source":     "mock",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":         strconv.Itoa(order.ID),
		"phone":      order.Phone,
		"product":    order.Product,
		"country":    order.Country,
		"operator":   order.Operator,
		"price":      order.Price,
		"status":     order.Status,
		"expires_at": order.Expires.Format(time.RFC3339),
		"created_at": time.Now().Format(time.RFC3339),
	})
}

// SMSGetOrder 获取订单详情（真实 5SIM API）GET /api/sms/order/:orderId
func SMSGetOrder(c *gin.Context) {
	orderID := c.Param("orderId")

	// Mock 订单直接返回模拟状态，不调用 5SIM（避免 429）
	if strings.HasPrefix(orderID, "MOCK-") {
		c.JSON(http.StatusOK, gin.H{
			"id":     orderID,
			"status": "WAITING",
			"source": "mock",
		})
		return
	}

	order, err := smsService.CheckOrder(orderID)
	if err != nil {
		log.Printf("5SIM CheckOrder error (id=%s): %v", orderID, err)
		// 降级：返回 mock 等待状态
		c.JSON(http.StatusOK, gin.H{
			"id":     orderID,
			"status": "WAITING",
			"source": "fallback",
		})
		return
	}

	result := gin.H{
		"id":         strconv.Itoa(order.ID),
		"phone":      order.Phone,
		"product":    order.Product,
		"country":    order.Country,
		"operator":   order.Operator,
		"price":      order.Price,
		"status":     order.Status,
		"expires_at": order.Expires.Format(time.RFC3339),
	}

	if len(order.SMS) > 0 {
		var smsList []gin.H
		for _, sms := range order.SMS {
			smsList = append(smsList, gin.H{
				"sender":     sms.Sender,
				"text":       sms.Text,
				"code":       sms.Code,
				"created_at": sms.CreatedAt.Format(time.RFC3339),
			})
		}
		result["sms"] = smsList
	}

	c.JSON(http.StatusOK, result)
}

// SMSCancelOrder 取消订单（真实 5SIM API）POST /api/sms/order/:orderId/cancel
func SMSCancelOrder(c *gin.Context) {
	orderID := c.Param("orderId")

	if strings.HasPrefix(orderID, "MOCK-") {
		c.JSON(http.StatusOK, gin.H{"ok": true, "message": "订单已取消", "order_id": orderID})
		return
	}

	if err := smsService.CancelOrder(orderID); err != nil {
		log.Printf("5SIM CancelOrder error (id=%s): %v", orderID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to cancel order"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"ok":       true,
		"message":  "订单已取消",
		"order_id": orderID,
	})
}

// SMSFinishOrder 完成订单（真实 5SIM API）POST /api/sms/order/:orderId/finish
func SMSFinishOrder(c *gin.Context) {
	orderID := c.Param("orderId")

	if strings.HasPrefix(orderID, "MOCK-") {
		c.JSON(http.StatusOK, gin.H{"ok": true, "message": "订单已完成", "order_id": orderID})
		return
	}

	if err := smsService.FinishOrder(orderID); err != nil {
		log.Printf("5SIM FinishOrder error (id=%s): %v", orderID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to finish order"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"ok":       true,
		"message":  "订单已完成",
		"order_id": orderID,
	})
}

// SMSRebuyNumber 重新购买号码 (S-06)
func SMSRebuyNumber(c *gin.Context) {
	orderId := c.Param("id")

	// TODO: 实际应该获取原订单信息，然后重新购买
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	phone := randomPhone("US")
	newOrderId := fmt.Sprintf("ORD-%d", time.Now().Unix())

	c.JSON(http.StatusOK, gin.H{
		"success":      true,
		"old_order_id": orderId,
		"order": gin.H{
			"id":         newOrderId,
			"phone":      phone,
			"service":    "google",
			"country":    "US",
			"operator":   "Verizon",
			"price":      0.15 + float64(r.Intn(50))/100,
			"status":     "waiting",
			"expires_at": time.Now().Add(20 * time.Minute).Unix(),
			"created_at": time.Now().Unix(),
		},
	})
}

// SMSGetActiveOrders 获取活跃订单列表 (S-07)
func SMSGetActiveOrders(c *gin.Context) {
	// TODO: S-03实现后从数据库获取当前用户的活跃订单
	// 当前阶段：返回Mock数据

	r := rand.New(rand.NewSource(time.Now().UnixNano()))

	var orders []gin.H
	count := r.Intn(4) + 1 // 1-4个活跃订单

	for i := 0; i < count; i++ {
		product := []string{"google", "whatsapp", "telegram", "facebook"}[i%4]
		icon := map[string]string{
			"google":   "🔵",
			"whatsapp": "💚",
			"telegram": "🔷",
			"facebook": "📘",
		}[product]

		orders = append(orders, gin.H{
			"id":           fmt.Sprintf("ORD-%d-%d", time.Now().Unix(), i),
			"phone":        randomPhone("US"),
			"product":      product,
			"icon":         icon,
			"country":      "US",
			"country_flag": "🇺🇸",
			"operator":     "any",
			"price":        0.15 + float64(r.Intn(30))/100,
			"status":       "WAITING",
			"expires_at":   time.Now().Add(time.Duration(15+i*2) * time.Minute).Format(time.RFC3339),
			"created_at":   time.Now().Add(-time.Duration(5-i) * time.Minute).Format(time.RFC3339),
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"orders": orders,
		"total":  len(orders),
	})
}

// launchDate 项目上线日期（固定，用于计算历史订单动态增长）
var launchDate = time.Date(2025, 1, 1, 0, 0, 0, 0, time.UTC)

// seededRandInRange 基于 seed 的稳定随机数，范围 [min, max)
func seededRandInRange(seed int64, min, max int) int {
	r := rand.New(rand.NewSource(seed))
	return min + r.Intn(max-min)
}

// calcDynamicTotal 计算当前总订单数（每天固定，跨天增长）
func calcDynamicTotal() int {
	now  := time.Now().UTC()
	days := int(now.Sub(launchDate).Hours() / 24)
	if days < 0 {
		days = 0
	}
	total := 10000
	for d := 1; d <= days; d++ {
		seed := int64(launchDate.Unix()) + int64(d)*86400
		total += seededRandInRange(seed, 100, 201)
	}
	return total
}

// orderStatusByIdx 根据 idx 稳定推导订单状态（权重 RECEIVED=3, CANCELED=1, TIMEOUT=1）
func orderStatusByIdx(idx int) string {
	seed := int64(idx)*131 + 7919
	r := rand.New(rand.NewSource(seed))
	s := []string{"RECEIVED", "RECEIVED", "RECEIVED", "CANCELED", "TIMEOUT"}
	return s[r.Intn(5)]
}

// genHistoryOrder 根据 idx 生成一条稳定的历史订单 mock
func genHistoryOrder(idx, total int) gin.H {
	seed := int64(idx)*131 + 7919
	r    := rand.New(rand.NewSource(seed))

	type svcT  struct{ id, name string }
	type ctyT  struct{ code, name, flag string }

	svcs := []svcT{
		{"google","Google"}, {"whatsapp","WhatsApp"}, {"telegram","Telegram"},
		{"facebook","Facebook"}, {"instagram","Instagram"}, {"twitter","Twitter"},
		{"tiktok","TikTok"}, {"discord","Discord"}, {"amazon","Amazon"}, {"microsoft","Microsoft"},
	}
	ctys := []ctyT{
		{"us","United States","🇺🇸"}, {"gb","United Kingdom","🇬🇧"},
		{"ru","Russia","🇷🇺"}, {"in","India","🇮🇳"}, {"br","Brazil","🇧🇷"},
		{"de","Germany","🇩🇪"}, {"fr","France","🇫🇷"}, {"cn","China","🇨🇳"},
		{"mx","Mexico","🇲🇽"}, {"id","Indonesia","🇮🇩"},
	}
	statuses := []string{"RECEIVED","RECEIVED","RECEIVED","CANCELED","TIMEOUT"}

	svc := svcs[r.Intn(len(svcs))]
	cty := ctys[r.Intn(len(ctys))]
	st  := statuses[r.Intn(len(statuses))]

	minutesAgo := int64(idx) * int64(total) / 10000 * 10
	createdAt  := time.Now().Add(-time.Duration(minutesAgo) * time.Minute)

	order := gin.H{
		"id":           fmt.Sprintf("ORD-%07d", total-idx),
		"phone":        randomPhone(cty.code),
		"product":      svc.id,
		"product_name": svc.name,
		"country":      cty.name,
		"country_code": cty.code,
		"flag":         cty.flag,
		"operator":     "any",
		"status":       st,
		"price":        int64(10 + r.Intn(80)),
		"created_at":   createdAt.Format(time.RFC3339),
	}
	if st == "RECEIVED" {
		order["code"] = fmt.Sprintf("%06d", r.Intn(900000)+100000)
	}
	return order
}

// SMSGetOrderHistory 获取历史订单 (S-08) 动态增长 + 分页 + 状态筛选
func SMSGetOrderHistory(c *gin.Context) {
	pageStr      := c.DefaultQuery("page", "1")
	sizeStr      := c.DefaultQuery("size", "20")
	statusFilter := strings.ToUpper(strings.TrimSpace(c.DefaultQuery("status", "")))

	page, _ := strconv.Atoi(pageStr)
	size, _ := strconv.Atoi(sizeStr)
	if page < 1      { page = 1 }
	if size < 1 || size > 100 { size = 20 }

	total := calcDynamicTotal()

	var (
		orders       []gin.H
		filteredTotal int
	)

	if statusFilter == "" || statusFilter == "ALL" {
		// 无筛选：O(1) 直接定位当页范围
		filteredTotal = total
		start := (page-1) * size
		end   := start + size
		if end > total { end = total }
		for idx := start; idx < end; idx++ {
			orders = append(orders, genHistoryOrder(idx, total))
		}
	} else {
		// 有筛选：O(N) 扫描匹配索引，只生成当页数据
		var matchedIdxs []int
		for idx := 0; idx < total; idx++ {
			if orderStatusByIdx(idx) == statusFilter {
				matchedIdxs = append(matchedIdxs, idx)
			}
		}
		filteredTotal = len(matchedIdxs)
		start := (page-1) * size
		end   := start + size
		if start > filteredTotal { start = filteredTotal }
		if end > filteredTotal   { end = filteredTotal }
		for _, idx := range matchedIdxs[start:end] {
			orders = append(orders, genHistoryOrder(idx, total))
		}
	}

	totalPages := (filteredTotal + size - 1) / size
	if totalPages == 0 { totalPages = 1 }

	c.JSON(http.StatusOK, gin.H{
		"orders":      orders,
		"total":       filteredTotal,
		"page":        page,
		"size":        size,
		"total_pages": totalPages,
	})
}
