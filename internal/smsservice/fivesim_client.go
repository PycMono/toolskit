package smsservice

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

const fiveSimBaseURL = "https://5sim.net/v1"

// FiveSimClient 封装 5SIM REST API
type FiveSimClient struct {
	apiKey     string
	httpClient *http.Client
}

// NewFiveSimClient 创建新的 5SIM 客户端
func NewFiveSimClient() *FiveSimClient {
	return &FiveSimClient{
		apiKey: os.Getenv("FIVESIM_API_KEY"),
		httpClient: &http.Client{
			Timeout: 15 * time.Second,
		},
	}
}

// get 执行 GET 请求并解析 JSON 响应
func (c *FiveSimClient) get(path string, target interface{}) error {
	req, err := http.NewRequest("GET", fiveSimBaseURL+path, nil)
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", "Bearer "+c.apiKey)
	req.Header.Set("Accept", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("5sim request failed: %w", err)
	}
	defer resp.Body.Close()

	switch resp.StatusCode {
	case 401:
		return fmt.Errorf("invalid 5sim api key")
	case 503:
		return fmt.Errorf("no numbers available")
	}
	if resp.StatusCode >= 400 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("5sim error %d: %s", resp.StatusCode, string(body))
	}

	return json.NewDecoder(resp.Body).Decode(target)
}

// ── 数据结构 ──────────────────────────────────────────────────────────────────

// FiveSimOrder 5SIM 订单结构
type FiveSimOrder struct {
	ID       int          `json:"id"`
	Phone    string       `json:"phone"`
	Operator string       `json:"operator"`
	Product  string       `json:"product"`
	Price    float64      `json:"price"`
	Status   string       `json:"status"`
	Expires  time.Time    `json:"expires"`
	SMS      []FiveSimSMS `json:"sms"`
	Country  string       `json:"country"`
}

// FiveSimSMS 短信结构
type FiveSimSMS struct {
	CreatedAt time.Time `json:"created_at"`
	Date      time.Time `json:"date"`
	Sender    string    `json:"sender"`
	Text      string    `json:"text"`
	Code      string    `json:"code"`
}

// GuestProducts 产品列表（guest 接口返回格式）
type GuestProducts map[string]struct {
	Category string  `json:"Category"`
	Qty      int     `json:"Qty"`
	Price    float64 `json:"Price"`
}

// GuestPricesEntry 价格条目
type GuestPricesEntry struct {
	Cost  float64 `json:"cost"`
	Count int     `json:"count"`
	Rate  float64 `json:"rate"`
}

// GuestPrices 价格表：country → service → operator → entry
type GuestPrices map[string]map[string]map[string]GuestPricesEntry

// ── API 方法 ──────────────────────────────────────────────────────────────────

// GetProducts 获取指定国家+运营商的产品列表（无需鉴权的 guest 接口）
func (c *FiveSimClient) GetProducts(country, operator string) (GuestProducts, error) {
	var result GuestProducts
	err := c.get(fmt.Sprintf("/guest/products/%s/%s", country, operator), &result)
	return result, err
}

// GetPrices 获取价格表（支持按国家过滤）
func (c *FiveSimClient) GetPrices(country string) (GuestPrices, error) {
	path := "/guest/prices"
	if country != "" {
		path += "?country=" + country
	}
	var result GuestPrices
	err := c.get(path, &result)
	return result, err
}

// GetCountries 获取国家列表
func (c *FiveSimClient) GetCountries() (map[string]interface{}, error) {
	var result map[string]interface{}
	err := c.get("/guest/countries", &result)
	return result, err
}

// BuyActivationNumber 购买激活号码（需要鉴权）
func (c *FiveSimClient) BuyActivationNumber(country, operator, product string) (*FiveSimOrder, error) {
	var order FiveSimOrder
	err := c.get(fmt.Sprintf("/user/buy/activation/%s/%s/%s", country, operator, product), &order)
	return &order, err
}

// CheckOrder 查询订单状态（含 SMS）
func (c *FiveSimClient) CheckOrder(orderID int) (*FiveSimOrder, error) {
	var order FiveSimOrder
	err := c.get(fmt.Sprintf("/user/check/%d", orderID), &order)
	return &order, err
}

// CancelOrder 取消订单
func (c *FiveSimClient) CancelOrder(orderID int) error {
	var result interface{}
	return c.get(fmt.Sprintf("/user/cancel/%d", orderID), &result)
}

// FinishOrder 完成订单（标记成功）
func (c *FiveSimClient) FinishOrder(orderID int) error {
	var result interface{}
	return c.get(fmt.Sprintf("/user/finish/%d", orderID), &result)
}

// BanOrder 拒绝号码（已被使用）
func (c *FiveSimClient) BanOrder(orderID int) error {
	var result interface{}
	return c.get(fmt.Sprintf("/user/ban/%d", orderID), &result)
}

