# Block S-10 · 5SIM API 代理层

> **所属模块**：SMS 接码器后端基础设施  
> **预估工时**：4h  
> **依赖**：无（所有后续 Block 均依赖此层）  
> **交付粒度**：封装所有 5sim.net REST API，含缓存、错误处理、限流、余额换算

---

## 1. 架构设计

```
前端/Handler
    ↓
SMSService（业务逻辑层）
    ↓
FiveSimClient（5SIM API 封装）
    ↓
5sim.net REST API
```

---

## 2. 5SIM API 客户端

```go
// internal/smsservice/fivesim_client.go
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

type FiveSimClient struct {
    apiKey     string
    httpClient *http.Client
}

func NewFiveSimClient() *FiveSimClient {
    return &FiveSimClient{
        apiKey: os.Getenv("FIVESIM_API_KEY"),
        httpClient: &http.Client{
            Timeout: 15 * time.Second,
        },
    }
}

func (c *FiveSimClient) get(path string, target interface{}) error {
    req, err := http.NewRequest("GET", fiveSimBaseURL+path, nil)
    if err != nil { return err }

    req.Header.Set("Authorization", "Bearer "+c.apiKey)
    req.Header.Set("Accept", "application/json")

    resp, err := c.httpClient.Do(req)
    if err != nil { return fmt.Errorf("5sim request failed: %w", err) }
    defer resp.Body.Close()

    if resp.StatusCode == 401 { return fmt.Errorf("invalid 5sim api key") }
    if resp.StatusCode == 503 { return fmt.Errorf("no numbers available") }
    if resp.StatusCode >= 400 {
        body, _ := io.ReadAll(resp.Body)
        return fmt.Errorf("5sim error %d: %s", resp.StatusCode, string(body))
    }

    return json.NewDecoder(resp.Body).Decode(target)
}

// ── 数据结构 ──────────────────────────────────────
type FiveSimOrder struct {
    ID        int       `json:"id"`
    Phone     string    `json:"phone"`
    Operator  string    `json:"operator"`
    Product   string    `json:"product"`
    Price     float64   `json:"price"`
    Status    string    `json:"status"`
    ExpiresAt time.Time `json:"expires"`
    SMS       []FiveSimSMS `json:"sms"`
    Country   string    `json:"country"`
}

type FiveSimSMS struct {
    CreatedAt time.Time `json:"created_at"`
    Date      time.Time `json:"date"`
    Sender    string    `json:"sender"`
    Text      string    `json:"text"`
    Code      string    `json:"code"`
}

type GuestProducts map[string]struct {
    Category string  `json:"Category"`
    Qty      int     `json:"Qty"`
    Price    float64 `json:"Price"`
}

type GuestPrices map[string]map[string]map[string]struct {
    Cost  float64 `json:"cost"`
    Count int     `json:"count"`
    Rate  float64 `json:"rate"`
}

// ── API 方法 ──────────────────────────────────────

// GetProducts 获取指定国家+运营商的产品列表（无需鉴权用 guest 接口）
func (c *FiveSimClient) GetProducts(country, operator string) (GuestProducts, error) {
    var result GuestProducts
    err := c.get(fmt.Sprintf("/guest/products/%s/%s", country, operator), &result)
    return result, err
}

// GetPrices 获取价格（支持按国家过滤）
func (c *FiveSimClient) GetPrices(country string) (GuestPrices, error) {
    path := "/guest/prices"
    if country != "" { path += "?country=" + country }
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

// BuyActivationNumber 购买激活号码（需鉴权）
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
```

---

## 3. SMSService 业务层（含缓存）

```go
// internal/smsservice/service.go
package smsservice

import (
    "fmt"
    "sync"
    "time"
)

type SMSService struct {
    client *FiveSimClient
    cache  *SimpleCache
}

func NewSMSService() *SMSService {
    return &SMSService{
        client: NewFiveSimClient(),
        cache:  NewSimpleCache(5 * time.Minute),
    }
}

// GetProductsForCountry 带缓存获取产品列表（TTL 5 分钟）
func (s *SMSService) GetProductsForCountry(country string) ([]ProductItem, error) {
    cacheKey := "products:" + country
    if cached, ok := s.cache.Get(cacheKey); ok {
        return cached.([]ProductItem), nil
    }

    raw, err := s.client.GetProducts(country, "any")
    if err != nil { return nil, err }

    items := make([]ProductItem, 0, len(raw))
    for name, info := range raw {
        if info.Category == "activation" && info.Qty > 0 {
            items = append(items, ProductItem{
                Name:        name,
                DisplayName: toDisplayName(name),
                Category:    info.Category,
                Qty:         info.Qty,
                Price:       int(info.Price * 100),  // 转换为分
            })
        }
    }

    s.cache.Set(cacheKey, items)
    return items, nil
}

// GetPricesAll 获取全量价格表（TTL 5 分钟）
func (s *SMSService) GetPricesAll() ([]PriceItem, error) {
    cacheKey := "prices:all"
    if cached, ok := s.cache.Get(cacheKey); ok {
        return cached.([]PriceItem), nil
    }

    raw, err := s.client.GetPrices("")
    if err != nil { return nil, err }

    var items []PriceItem
    for country, services := range raw {
        for service, operators := range services {
            for operator, info := range operators {
                items = append(items, PriceItem{
                    Country:  country,
                    Product:  service,
                    Operator: operator,
                    Cost:     int(info.Cost * 100),
                    Count:    info.Count,
                    Rate:     info.Rate,
                })
            }
        }
    }

    s.cache.Set(cacheKey, items)
    return items, nil
}

// GetPrice 获取单个价格
func (s *SMSService) GetPrice(product, country, operator string) (int, error) {
    prices, err := s.GetPricesAll()
    if err != nil { return 0, err }
    for _, p := range prices {
        if p.Product == product && p.Country == country && p.Operator == operator {
            return p.Cost, nil
        }
    }
    return 0, fmt.Errorf("price not found")
}

// BuyActivationNumber 购号
func (s *SMSService) BuyActivationNumber(product, country, operator string) (*FiveSimOrder, error) {
    return s.client.BuyActivationNumber(country, operator, product)
}

// CheckOrder 查询订单
func (s *SMSService) CheckOrder(orderID string) (*FiveSimOrder, error) {
    var id int
    fmt.Sscanf(orderID, "%d", &id)
    return s.client.CheckOrder(id)
}

// CancelOrder 取消
func (s *SMSService) CancelOrder(orderID string) error {
    var id int
    fmt.Sscanf(orderID, "%d", &id)
    return s.client.CancelOrder(id)
}

// FinishOrder 完成
func (s *SMSService) FinishOrder(orderID string) error {
    var id int
    fmt.Sscanf(orderID, "%d", &id)
    return s.client.FinishOrder(id)
}

// ── 简单内存缓存 ──────────────────────────────────
type cacheEntry struct {
    value     interface{}
    expiresAt time.Time
}

type SimpleCache struct {
    mu   sync.RWMutex
    data map[string]cacheEntry
    ttl  time.Duration
}

func NewSimpleCache(ttl time.Duration) *SimpleCache {
    c := &SimpleCache{ data: make(map[string]cacheEntry), ttl: ttl }
    go c.cleanupLoop()
    return c
}

func (c *SimpleCache) Get(key string) (interface{}, bool) {
    c.mu.RLock()
    defer c.mu.RUnlock()
    entry, ok := c.data[key]
    if !ok || time.Now().After(entry.expiresAt) { return nil, false }
    return entry.value, true
}

func (c *SimpleCache) Set(key string, value interface{}) {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.data[key] = cacheEntry{ value: value, expiresAt: time.Now().Add(c.ttl) }
}

func (c *SimpleCache) cleanupLoop() {
    ticker := time.NewTicker(10 * time.Minute)
    for range ticker.C {
        c.mu.Lock()
        now := time.Now()
        for k, v := range c.data {
            if now.After(v.expiresAt) { delete(c.data, k) }
        }
        c.mu.Unlock()
    }
}

// ── 数据结构 ──────────────────────────────────────
type ProductItem struct {
    Name        string `json:"name"`
    DisplayName string `json:"displayName"`
    Category    string `json:"category"`
    Qty         int    `json:"qty"`
    Price       int    `json:"price"`  // 分
}

type PriceItem struct {
    Country  string  `json:"country"`
    Product  string  `json:"product"`
    Operator string  `json:"operator"`
    Cost     int     `json:"cost"`   // 分
    Count    int     `json:"count"`
    Rate     float64 `json:"rate"`
}

// 服务名转显示名（简单映射）
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
}

func toDisplayName(name string) string {
    if d, ok := displayNames[name]; ok { return d }
    return strings.Title(strings.ReplaceAll(name, "_", " "))
}
```

---

## 4. API Handler 对接

```go
// internal/handler/sms_api.go

var smsService = smsservice.NewSMSService()

// GET /api/sms/products?country=any
func SMSGetProducts(c *gin.Context) {
    country := c.DefaultQuery("country", "any")
    items, err := smsService.GetProductsForCountry(country)
    if err != nil { c.JSON(500, gin.H{"error": err.Error()}); return }
    c.JSON(200, gin.H{"products": items})
}

// GET /api/sms/countries?service=whatsapp
func SMSGetCountries(c *gin.Context) {
    service := c.Query("service")
    prices, err := smsService.GetPricesAll()
    if err != nil { c.JSON(500, gin.H{"error": err.Error()}); return }

    // 聚合国家列表
    type CountryItem struct {
        Name        string `json:"name"`
        DisplayName string `json:"displayName"`
        Flag        string `json:"flag"`
        Qty         int    `json:"qty"`
    }
    countryMap := make(map[string]*CountryItem)
    for _, p := range prices {
        if service != "" && p.Product != service { continue }
        if _, exists := countryMap[p.Country]; !exists {
            countryMap[p.Country] = &CountryItem{
                Name:        p.Country,
                DisplayName: toCountryDisplayName(p.Country),
                Flag:        countryFlag(p.Country),
            }
        }
        countryMap[p.Country].Qty += p.Count
    }

    countries := make([]CountryItem, 0, len(countryMap))
    for _, v := range countryMap { countries = append(countries, *v) }
    c.JSON(200, gin.H{"countries": countries})
}

// GET /api/sms/operators?service=whatsapp&country=russia
func SMSGetOperators(c *gin.Context) {
    service := c.Query("service")
    country := c.Query("country")
    prices, err := smsService.GetPricesAll()
    if err != nil { c.JSON(500, gin.H{"error": err.Error()}); return }

    var operators []smsservice.PriceItem
    for _, p := range prices {
        if p.Product == service && p.Country == country {
            operators = append(operators, p)
        }
    }
    c.JSON(200, gin.H{"operators": operators})
}

// GET /api/sms/prices
func SMSGetPrices(c *gin.Context) {
    prices, err := smsService.GetPricesAll()
    if err != nil { c.JSON(500, gin.H{"error": err.Error()}); return }
    c.JSON(200, gin.H{"prices": prices, "updated_at": time.Now()})
}
```

---

## 5. 验收标准

- [ ] `GET /api/sms/products` 返回正确的产品列表，含 name/displayName/qty/price
- [ ] `GET /api/sms/countries?service=whatsapp` 返回有库存的国家列表
- [ ] `GET /api/sms/operators?service=whatsapp&country=russia` 返回运营商价格
- [ ] 价格数据缓存 5 分钟，相同请求不重复调用 5SIM API
- [ ] 5SIM API Key 无效时返回友好错误，不暴露内部细节
- [ ] 503（无号码）正确透传为 `{"error": "no numbers available"}`

---

---

# Block S-11 · WebSocket 实时 SMS 推送

> **预估工时**：3h｜**依赖**：S-10

---

## 1. 架构

```
前端 WebSocket 客户端
    ↕ WS /ws/sms/:orderId
Go WebSocket Handler
    ↓ goroutine 每 3 秒轮询
5SIM CheckOrder API
    → 有新 SMS → 推送到前端
```

---

## 2. WebSocket Handler

```go
// internal/handler/sms_websocket.go
package handler

import (
    "encoding/json"
    "log"
    "net/http"
    "strconv"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/gorilla/websocket"
    "devtoolbox/internal/smsservice"
)

var wsUpgrader = websocket.Upgrader{
    CheckOrigin:       func(r *http.Request) bool { return true },
    ReadBufferSize:    1024,
    WriteBufferSize:   4096,
    HandshakeTimeout: 10 * time.Second,
}

type WSMessage struct {
    Type   string              `json:"type"`   // "sms" | "status" | "ping"
    SMS    *smsservice.FiveSimSMS `json:"sms,omitempty"`
    Status string              `json:"status,omitempty"`
}

// GET /ws/sms/:orderId
func SMSWebSocket(c *gin.Context) {
    userID  := c.GetInt64("userID")
    orderID := c.Param("orderId")

    // 验证订单属于当前用户
    order, err := db.GetSMSOrderByExternalID(orderID, userID)
    if err != nil || order == nil {
        c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
        return
    }

    conn, err := wsUpgrader.Upgrade(c.Writer, c.Request, nil)
    if err != nil {
        log.Printf("WS upgrade failed: %v", err)
        return
    }
    defer conn.Close()

    log.Printf("WS connected: order=%s user=%d", orderID, userID)

    // 发送 ping 保持连接
    go func() {
        ticker := time.NewTicker(20 * time.Second)
        defer ticker.Stop()
        for range ticker.C {
            if err := conn.WriteJSON(WSMessage{Type: "ping"}); err != nil {
                return
            }
        }
    }()

    // 轮询 5SIM 等待 SMS（每 3 秒）
    ticker   := time.NewTicker(3 * time.Second)
    defer ticker.Stop()

    var lastSMSCount int
    externalID, _ := strconv.Atoi(orderID)

    for range ticker.C {
        fiveSimOrder, err := smsService.client.CheckOrder(externalID)
        if err != nil {
            log.Printf("WS poll error: %v", err)
            continue
        }

        // 有新 SMS
        if len(fiveSimOrder.SMS) > lastSMSCount {
            newSMSList := fiveSimOrder.SMS[lastSMSCount:]
            for _, sms := range newSMSList {
                smsCopy := sms
                if err := conn.WriteJSON(WSMessage{
                    Type: "sms",
                    SMS:  &smsCopy,
                }); err != nil {
                    log.Printf("WS write error: %v", err)
                    return
                }
            }
            lastSMSCount = len(fiveSimOrder.SMS)
        }

        // 状态变化
        if fiveSimOrder.Status == "RECEIVED" || fiveSimOrder.Status == "CANCELED" ||
           fiveSimOrder.Status == "TIMEOUT" || fiveSimOrder.Status == "BANNED" {
            conn.WriteJSON(WSMessage{Type: "status", Status: fiveSimOrder.Status})
            return  // 关闭连接
        }

        // 检查客户端是否主动断开
        conn.SetReadDeadline(time.Now().Add(1 * time.Millisecond))
        if _, _, err := conn.ReadMessage(); err != nil {
            if websocket.IsUnexpectedCloseError(err,
                websocket.CloseGoingAway, websocket.CloseNormalClosure) {
                log.Printf("WS client disconnected: order=%s", orderID)
            }
            return
        }
    }
}
```

---

## 3. WebSocket 连接管理（防内存泄漏）

```go
// internal/handler/sms_ws_manager.go

type WSManager struct {
    connections sync.Map  // orderID → *websocket.Conn
}

var wsManager = &WSManager{}

func (m *WSManager) Register(orderID string, conn *websocket.Conn) {
    // 若已有旧连接，先关闭
    if old, loaded := m.connections.LoadAndDelete(orderID); loaded {
        old.(*websocket.Conn).Close()
    }
    m.connections.Store(orderID, conn)
}

func (m *WSManager) Unregister(orderID string) {
    m.connections.Delete(orderID)
}

func (m *WSManager) Count() int {
    count := 0
    m.connections.Range(func(k, v interface{}) bool { count++; return true })
    return count
}
```

---

## 4. 前端重连逻辑（增强版，见 S-06 基础版）

```javascript
// static/js/sms-order.js（S-11 增强）

class SMSOrderWebSocket {
  constructor(orderId, onSMS, onStatus) {
    this.orderId   = orderId;
    this.onSMS     = onSMS;
    this.onStatus  = onStatus;
    this.retries   = 0;
    this.maxRetries = 5;
    this.ws        = null;
    this.closed    = false;
    this.connect();
  }

  connect() {
    if (this.closed) return;
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.ws = new WebSocket(`${proto}//${location.host}/ws/sms/${this.orderId}`);

    this.ws.onopen = () => {
      this.retries = 0;
      console.log(`WS connected: order ${this.orderId}`);
    };

    this.ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === 'sms'    && msg.sms)    this.onSMS(msg.sms);
      if (msg.type === 'status' && msg.status) this.onStatus(msg.status);
    };

    this.ws.onclose = () => {
      if (this.closed) return;
      this.retries++;
      const delay = Math.min(1000 * Math.pow(2, this.retries), 30000);
      console.log(`WS retry ${this.retries}/${this.maxRetries} in ${delay}ms`);

      if (this.retries <= this.maxRetries) {
        setTimeout(() => this.connect(), delay);
      } else {
        console.warn('WS max retries reached, falling back to polling');
        this.startPolling();
      }
    };
  }

  startPolling() {
    const poll = async () => {
      if (this.closed) return;
      try {
        const resp = await fetch(`/api/sms/order/${this.orderId}`);
        const data = await resp.json();
        if (data.sms?.length) data.sms.forEach(s => this.onSMS(s));
        if (['RECEIVED','CANCELED','TIMEOUT'].includes(data.status)) {
          this.onStatus(data.status);
          return;
        }
      } catch {}
      setTimeout(poll, 5000);
    };
    poll();
  }

  close() {
    this.closed = true;
    if (this.ws) this.ws.close();
  }
}
```

---

## 5. 验收标准

- [ ] `GET /ws/sms/:orderId` WebSocket 握手成功
- [ ] 未登录或非本人订单返回 403（HTTP 拒绝升级）
- [ ] 服务端每 3 秒轮询 5SIM，有新 SMS 立即推送 `{type:"sms", sms:{...}}`
- [ ] 订单完成/取消/超时推送 `{type:"status", status:"RECEIVED"}` 后关闭连接
- [ ] 服务端每 20 秒发送 `{type:"ping"}` 保持连接
- [ ] 客户端断开后服务端 goroutine 正常退出，无内存泄漏
- [ ] 同一订单重复连接时，旧连接自动关闭
- [ ] 客户端最多重试 5 次（指数退避），失败后降级轮询
- [ ] 并发 100 个 WebSocket 连接时服务正常
