package smsservice

import (
	"fmt"
	"strings"
	"sync"
	"time"
)

// SMSService 业务层，封装 5SIM 客户端，带缓存
type SMSService struct {
	Client *FiveSimClient // 导出，供 WebSocket handler 直接使用
	cache  *SimpleCache
}

// NewSMSService 创建 SMSService 单例
func NewSMSService() *SMSService {
	return &SMSService{
		Client: NewFiveSimClient(),
		cache:  NewSimpleCache(5 * time.Minute),
	}
}

// ── 产品 ──────────────────────────────────────────────────────────────────────

// GetProductsForCountry 带缓存获取产品列表（TTL 5 分钟）
func (s *SMSService) GetProductsForCountry(country string) ([]ProductItem, error) {
	cacheKey := "products:" + country
	if cached, ok := s.cache.Get(cacheKey); ok {
		return cached.([]ProductItem), nil
	}

	raw, err := s.Client.GetProducts(country, "any")
	if err != nil {
		return nil, err
	}

	items := make([]ProductItem, 0, len(raw))
	for name, info := range raw {
		if info.Category == "activation" && info.Qty > 0 {
			items = append(items, ProductItem{
				Name:        name,
				DisplayName: ToDisplayName(name),
				Category:    info.Category,
				Qty:         info.Qty,
				Price:       int(info.Price * 100), // 转换为分
			})
		}
	}

	s.cache.Set(cacheKey, items)
	return items, nil
}

// ── 价格 ──────────────────────────────────────────────────────────────────────

// GetPricesAll 获取全量价格表（TTL 5 分钟）
func (s *SMSService) GetPricesAll() ([]PriceItem, error) {
	cacheKey := "prices:all"
	if cached, ok := s.cache.Get(cacheKey); ok {
		return cached.([]PriceItem), nil
	}

	raw, err := s.Client.GetPrices("")
	if err != nil {
		return nil, err
	}

	var items []PriceItem
	for country, services := range raw {
		for service, operators := range services {
			for operator, info := range operators {
				items = append(items, PriceItem{
					Country:  country,
					Product:  service,
					Operator: operator,
					Cost:     int(info.Cost * 100), // 转换为分
					Count:    info.Count,
					Rate:     info.Rate,
				})
			}
		}
	}

	s.cache.Set(cacheKey, items)
	return items, nil
}

// GetPrice 获取单个产品的价格（分为单位）
func (s *SMSService) GetPrice(product, country, operator string) (int, error) {
	prices, err := s.GetPricesAll()
	if err != nil {
		return 0, err
	}
	for _, p := range prices {
		if p.Product == product && p.Country == country && p.Operator == operator {
			return p.Cost, nil
		}
	}
	return 0, fmt.Errorf("price not found for %s/%s/%s", product, country, operator)
}

// ── 订单操作 ──────────────────────────────────────────────────────────────────

// BuyActivationNumber 购号（转发到 5SIM）
func (s *SMSService) BuyActivationNumber(product, country, operator string) (*FiveSimOrder, error) {
	return s.Client.BuyActivationNumber(country, operator, product)
}

// CheckOrder 查询订单（字符串 ID → int）
func (s *SMSService) CheckOrder(orderID string) (*FiveSimOrder, error) {
	var id int
	fmt.Sscanf(orderID, "%d", &id)
	return s.Client.CheckOrder(id)
}

// CancelOrder 取消订单
func (s *SMSService) CancelOrder(orderID string) error {
	var id int
	fmt.Sscanf(orderID, "%d", &id)
	return s.Client.CancelOrder(id)
}

// FinishOrder 完成订单
func (s *SMSService) FinishOrder(orderID string) error {
	var id int
	fmt.Sscanf(orderID, "%d", &id)
	return s.Client.FinishOrder(id)
}

// ── 简单内存缓存 ──────────────────────────────────────────────────────────────

type cacheEntry struct {
	value     interface{}
	expiresAt time.Time
}

// SimpleCache 线程安全的内存缓存
type SimpleCache struct {
	mu   sync.RWMutex
	data map[string]cacheEntry
	ttl  time.Duration
}

// NewSimpleCache 创建缓存，并启动后台清理 goroutine
func NewSimpleCache(ttl time.Duration) *SimpleCache {
	c := &SimpleCache{
		data: make(map[string]cacheEntry),
		ttl:  ttl,
	}
	go c.cleanupLoop()
	return c
}

// Get 获取缓存值，过期返回 false
func (c *SimpleCache) Get(key string) (interface{}, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	entry, ok := c.data[key]
	if !ok || time.Now().After(entry.expiresAt) {
		return nil, false
	}
	return entry.value, true
}

// Set 设置缓存值
func (c *SimpleCache) Set(key string, value interface{}) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.data[key] = cacheEntry{
		value:     value,
		expiresAt: time.Now().Add(c.ttl),
	}
}

// cleanupLoop 每 10 分钟清理过期条目
func (c *SimpleCache) cleanupLoop() {
	ticker := time.NewTicker(10 * time.Minute)
	for range ticker.C {
		c.mu.Lock()
		now := time.Now()
		for k, v := range c.data {
			if now.After(v.expiresAt) {
				delete(c.data, k)
			}
		}
		c.mu.Unlock()
	}
}

// ── 数据结构 ──────────────────────────────────────────────────────────────────

// ProductItem 产品条目（API 响应格式）
type ProductItem struct {
	Name        string `json:"name"`
	DisplayName string `json:"displayName"`
	Category    string `json:"category"`
	Qty         int    `json:"qty"`
	Price       int    `json:"price"` // 分
}

// PriceItem 价格条目（API 响应格式）
type PriceItem struct {
	Country  string  `json:"country"`
	Product  string  `json:"product"`
	Operator string  `json:"operator"`
	Cost     int     `json:"cost"` // 分
	Count    int     `json:"count"`
	Rate     float64 `json:"rate"`
}

// CountryItem 国家条目（API 响应格式）
type CountryItem struct {
	Name        string `json:"name"`
	DisplayName string `json:"displayName"`
	Flag        string `json:"flag"`
	Qty         int    `json:"qty"`
}

// ── 辅助函数 ──────────────────────────────────────────────────────────────────

// displayNames 已知产品名称到显示名称的映射
var displayNames = map[string]string{
	"whatsapp":  "WhatsApp",
	"telegram":  "Telegram",
	"google":    "Google",
	"facebook":  "Facebook",
	"instagram": "Instagram",
	"twitter":   "Twitter/X",
	"tiktok":    "TikTok",
	"wechat":    "WeChat",
	"amazon":    "Amazon",
	"microsoft": "Microsoft",
	"apple":     "Apple",
	"uber":      "Uber",
	"netflix":   "Netflix",
	"discord":   "Discord",
	"snapchat":  "Snapchat",
	"paypal":    "PayPal",
	"airbnb":    "Airbnb",
	"ebay":      "eBay",
}

// ToDisplayName 服务名转显示名称
func ToDisplayName(name string) string {
	if d, ok := displayNames[name]; ok {
		return d
	}
	// 将下划线替换为空格，首字母大写
	words := strings.Fields(strings.ReplaceAll(name, "_", " "))
	for i, w := range words {
		if len(w) > 0 {
			words[i] = strings.ToUpper(w[:1]) + w[1:]
		}
	}
	return strings.Join(words, " ")
}

// countryISO2 maps 5SIM country names → ISO 3166-1 alpha-2 code
var countryISO2 = map[string]string{
	// A
	"afghanistan":              "AF",
	"albania":                  "AL",
	"algeria":                  "DZ",
	"angola":                   "AO",
	"antiguaandbarbuda":        "AG",
	"argentina":                "AR",
	"armenia":                  "AM",
	"aruba":                    "AW",
	"australia":                "AU",
	"austria":                  "AT",
	"azerbaijan":               "AZ",
	// B
	"bahamas":                  "BS",
	"bahrain":                  "BH",
	"bangladesh":               "BD",
	"barbados":                 "BB",
	"belarus":                  "BY",
	"belgium":                  "BE",
	"belize":                   "BZ",
	"benin":                    "BJ",
	"bhutane":                  "BT",
	"bih":                      "BA",
	"bolivia":                  "BO",
	"botswana":                 "BW",
	"brazil":                   "BR",
	"bulgaria":                 "BG",
	"burkinafaso":              "BF",
	"burundi":                  "BI",
	// C
	"cambodia":                 "KH",
	"cameroon":                 "CM",
	"canada":                   "CA",
	"capeverde":                "CV",
	"chad":                     "TD",
	"chile":                    "CL",
	"china":                    "CN",
	"colombia":                 "CO",
	"comoros":                  "KM",
	"congo":                    "CG",
	"costarica":                "CR",
	"croatia":                  "HR",
	"cyprus":                   "CY",
	"czech":                    "CZ",
	// D
	"denmark":                  "DK",
	"djibouti":                 "DJ",
	"dominicana":               "DO",
	// E
	"easttimor":                "TL",
	"ecuador":                  "EC",
	"egypt":                    "EG",
	"england":                  "GB",
	"equatorialguinea":         "GQ",
	"estonia":                  "EE",
	"ethiopia":                 "ET",
	// F
	"finland":                  "FI",
	"france":                   "FR",
	"frenchguiana":             "GF",
	// G
	"gabon":                    "GA",
	"gambia":                   "GM",
	"georgia":                  "GE",
	"germany":                  "DE",
	"ghana":                    "GH",
	"greece":                   "GR",
	"guadeloupe":               "GP",
	"guatemala":                "GT",
	"guinea":                   "GN",
	"guineabissau":             "GW",
	"guyana":                   "GY",
	// H
	"haiti":                    "HT",
	"honduras":                 "HN",
	"hongkong":                 "HK",
	"hungary":                  "HU",
	// I
	"india":                    "IN",
	"indonesia":                "ID",
	"iran":                     "IR",
	"iraq":                     "IQ",
	"ireland":                  "IE",
	"israel":                   "IL",
	"italy":                    "IT",
	"ivorycoast":               "CI",
	// J
	"jamaica":                  "JM",
	"japan":                    "JP",
	"jordan":                   "JO",
	// K
	"kazakhstan":               "KZ",
	"kenya":                    "KE",
	"kuwait":                   "KW",
	"kyrgyzstan":               "KG",
	// L
	"laos":                     "LA",
	"latvia":                   "LV",
	"lesotho":                  "LS",
	"liberia":                  "LR",
	"lithuania":                "LT",
	"luxembourg":               "LU",
	// M
	"macau":                    "MO",
	"madagascar":               "MG",
	"malawi":                   "MW",
	"malaysia":                 "MY",
	"maldives":                 "MV",
	"mauritania":               "MR",
	"mauritius":                "MU",
	"mexico":                   "MX",
	"moldova":                  "MD",
	"mongolia":                 "MN",
	"montenegro":               "ME",
	"morocco":                  "MA",
	"mozambique":               "MZ",
	"myanmar":                  "MM",
	// N
	"namibia":                  "NA",
	"nepal":                    "NP",
	"netherlands":              "NL",
	"newcaledonia":             "NC",
	"nicaragua":                "NI",
	"niger":                    "NE",
	"nigeria":                  "NG",
	"northmacedonia":           "MK",
	"norway":                   "NO",
	// O
	"oman":                     "OM",
	// P
	"pakistan":                 "PK",
	"panama":                   "PA",
	"papuanewguinea":           "PG",
	"paraguay":                 "PY",
	"peru":                     "PE",
	"philippines":              "PH",
	"poland":                   "PL",
	"portugal":                 "PT",
	"puertorico":               "PR",
	// R
	"reunion":                  "RE",
	"romania":                  "RO",
	"russia":                   "RU",
	"rwanda":                   "RW",
	// S
	"saintkittsandnevis":       "KN",
	"saintlucia":               "LC",
	"saintvincentandgrenadines":"VC",
	"salvador":                 "SV",
	"samoa":                    "WS",
	"saudiarabia":              "SA",
	"senegal":                  "SN",
	"serbia":                   "RS",
	"seychelles":               "SC",
	"sierraleone":              "SL",
	"singapore":                "SG",
	"slovakia":                 "SK",
	"slovenia":                 "SI",
	"solomonislands":           "SB",
	"southafrica":              "ZA",
	"southkorea":               "KR",
	"spain":                    "ES",
	"srilanka":                 "LK",
	"suriname":                 "SR",
	"swaziland":                "SZ",
	"sweden":                   "SE",
	// T
	"taiwan":                   "TW",
	"tajikistan":               "TJ",
	"tanzania":                 "TZ",
	"thailand":                 "TH",
	"togo":                     "TG",
	"tunisia":                  "TN",
	"turkey":                   "TR",
	"turkmenistan":             "TM",
	// U
	"uganda":                   "UG",
	"uk":                       "GB",
	"ukraine":                  "UA",
	"unitedkingdom":            "GB",
	"uruguay":                  "UY",
	"usa":                      "US",
	"uzbekistan":               "UZ",
	// V
	"venezuela":                "VE",
	"vietnam":                  "VN",
	// Z
	"zambia":                   "ZM",
	"zimbabwe":                 "ZW",
}

// countryDisplayNames 5SIM country name → human-readable display name
var countryDisplayNames = map[string]string{
	"afghanistan":               "Afghanistan",
	"albania":                   "Albania",
	"algeria":                   "Algeria",
	"angola":                    "Angola",
	"antiguaandbarbuda":         "Antigua & Barbuda",
	"argentina":                 "Argentina",
	"armenia":                   "Armenia",
	"aruba":                     "Aruba",
	"australia":                 "Australia",
	"austria":                   "Austria",
	"azerbaijan":                "Azerbaijan",
	"bahamas":                   "Bahamas",
	"bahrain":                   "Bahrain",
	"bangladesh":                "Bangladesh",
	"barbados":                  "Barbados",
	"belarus":                   "Belarus",
	"belgium":                   "Belgium",
	"belize":                    "Belize",
	"benin":                     "Benin",
	"bhutane":                   "Bhutan",
	"bih":                       "Bosnia & Herzegovina",
	"bolivia":                   "Bolivia",
	"botswana":                  "Botswana",
	"brazil":                    "Brazil",
	"bulgaria":                  "Bulgaria",
	"burkinafaso":               "Burkina Faso",
	"burundi":                   "Burundi",
	"cambodia":                  "Cambodia",
	"cameroon":                  "Cameroon",
	"canada":                    "Canada",
	"capeverde":                 "Cape Verde",
	"chad":                      "Chad",
	"chile":                     "Chile",
	"china":                     "China",
	"colombia":                  "Colombia",
	"comoros":                   "Comoros",
	"congo":                     "Congo",
	"costarica":                 "Costa Rica",
	"croatia":                   "Croatia",
	"cyprus":                    "Cyprus",
	"czech":                     "Czech Republic",
	"denmark":                   "Denmark",
	"djibouti":                  "Djibouti",
	"dominicana":                "Dominican Republic",
	"easttimor":                 "East Timor",
	"ecuador":                   "Ecuador",
	"egypt":                     "Egypt",
	"england":                   "United Kingdom",
	"equatorialguinea":          "Equatorial Guinea",
	"estonia":                   "Estonia",
	"ethiopia":                  "Ethiopia",
	"finland":                   "Finland",
	"france":                    "France",
	"frenchguiana":              "French Guiana",
	"gabon":                     "Gabon",
	"gambia":                    "Gambia",
	"georgia":                   "Georgia",
	"germany":                   "Germany",
	"ghana":                     "Ghana",
	"greece":                    "Greece",
	"guadeloupe":                "Guadeloupe",
	"guatemala":                 "Guatemala",
	"guinea":                    "Guinea",
	"guineabissau":              "Guinea-Bissau",
	"guyana":                    "Guyana",
	"haiti":                     "Haiti",
	"honduras":                  "Honduras",
	"hongkong":                  "Hong Kong",
	"hungary":                   "Hungary",
	"india":                     "India",
	"indonesia":                 "Indonesia",
	"iran":                      "Iran",
	"iraq":                      "Iraq",
	"ireland":                   "Ireland",
	"israel":                    "Israel",
	"italy":                     "Italy",
	"ivorycoast":                "Ivory Coast",
	"jamaica":                   "Jamaica",
	"japan":                     "Japan",
	"jordan":                    "Jordan",
	"kazakhstan":                "Kazakhstan",
	"kenya":                     "Kenya",
	"kuwait":                    "Kuwait",
	"kyrgyzstan":                "Kyrgyzstan",
	"laos":                      "Laos",
	"latvia":                    "Latvia",
	"lesotho":                   "Lesotho",
	"liberia":                   "Liberia",
	"lithuania":                 "Lithuania",
	"luxembourg":                "Luxembourg",
	"macau":                     "Macau",
	"madagascar":                "Madagascar",
	"malawi":                    "Malawi",
	"malaysia":                  "Malaysia",
	"maldives":                  "Maldives",
	"mauritania":                "Mauritania",
	"mauritius":                 "Mauritius",
	"mexico":                    "Mexico",
	"moldova":                   "Moldova",
	"mongolia":                  "Mongolia",
	"montenegro":                "Montenegro",
	"morocco":                   "Morocco",
	"mozambique":                "Mozambique",
	"myanmar":                   "Myanmar",
	"namibia":                   "Namibia",
	"nepal":                     "Nepal",
	"netherlands":               "Netherlands",
	"newcaledonia":              "New Caledonia",
	"nicaragua":                 "Nicaragua",
	"niger":                     "Niger",
	"nigeria":                   "Nigeria",
	"northmacedonia":            "North Macedonia",
	"norway":                    "Norway",
	"oman":                      "Oman",
	"pakistan":                  "Pakistan",
	"panama":                    "Panama",
	"papuanewguinea":            "Papua New Guinea",
	"paraguay":                  "Paraguay",
	"peru":                      "Peru",
	"philippines":               "Philippines",
	"poland":                    "Poland",
	"portugal":                  "Portugal",
	"puertorico":                "Puerto Rico",
	"reunion":                   "Réunion",
	"romania":                   "Romania",
	"russia":                    "Russia",
	"rwanda":                    "Rwanda",
	"saintkittsandnevis":        "Saint Kitts & Nevis",
	"saintlucia":                "Saint Lucia",
	"saintvincentandgrenadines": "Saint Vincent & Grenadines",
	"salvador":                  "El Salvador",
	"samoa":                     "Samoa",
	"saudiarabia":               "Saudi Arabia",
	"senegal":                   "Senegal",
	"serbia":                    "Serbia",
	"seychelles":                "Seychelles",
	"sierraleone":               "Sierra Leone",
	"singapore":                 "Singapore",
	"slovakia":                  "Slovakia",
	"slovenia":                  "Slovenia",
	"solomonislands":            "Solomon Islands",
	"southafrica":               "South Africa",
	"southkorea":                "South Korea",
	"spain":                     "Spain",
	"srilanka":                  "Sri Lanka",
	"suriname":                  "Suriname",
	"swaziland":                 "Eswatini",
	"sweden":                    "Sweden",
	"taiwan":                    "Taiwan",
	"tajikistan":                "Tajikistan",
	"tanzania":                  "Tanzania",
	"thailand":                  "Thailand",
	"tit":                       "Tit",
	"togo":                      "Togo",
	"tunisia":                   "Tunisia",
	"turkey":                    "Turkey",
	"turkmenistan":              "Turkmenistan",
	"uganda":                    "Uganda",
	"uk":                        "United Kingdom",
	"ukraine":                   "Ukraine",
	"unitedkingdom":             "United Kingdom",
	"uruguay":                   "Uruguay",
	"usa":                       "United States",
	"uzbekistan":                "Uzbekistan",
	"venezuela":                 "Venezuela",
	"vietnam":                   "Vietnam",
	"zambia":                    "Zambia",
	"zimbabwe":                  "Zimbabwe",
}

// ToCountryDisplayName 国家代码转显示名称
func ToCountryDisplayName(name string) string {
	key := strings.ToLower(name)
	if d, ok := countryDisplayNames[key]; ok {
		return d
	}
	// Fallback: capitalize first letter of each word
	words := strings.Fields(strings.ReplaceAll(name, "_", " "))
	for i, w := range words {
		if len(w) > 0 {
			words[i] = strings.ToUpper(w[:1]) + w[1:]
		}
	}
	return strings.Join(words, " ")
}

// isoToFlag 将 ISO 3166-1 alpha-2 代码转为 emoji 旗帜
func isoToFlag(iso string) string {
	iso = strings.ToUpper(iso)
	if len(iso) != 2 {
		return "🌍"
	}
	r1 := rune(0x1F1E6 + int(iso[0]-'A'))
	r2 := rune(0x1F1E6 + int(iso[1]-'A'))
	return string([]rune{r1, r2})
}

// CountryFlag 获取国家 emoji 旗帜（通过 ISO 2 码生成）
func CountryFlag(name string) string {
	key := strings.ToLower(name)
	if iso, ok := countryISO2[key]; ok {
		return isoToFlag(iso)
	}
	return "🌍"
}

