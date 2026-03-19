# SMS 接码器开发快速参考

## 🚀 快速启动

```bash
# 启动开发服务器
cd /Users/pengyachuan/work/go/src/PycMono/github/toolskit
PORT=8086 go run main.go

# 访问页面
open http://localhost:8086/sms/buy
```

## 📍 页面路由

| 页面 | 路由 | 功能 |
|------|------|------|
| 购买页 | `/sms/buy` | S-06: 选择服务购买号码 |
| 活跃订单 | `/sms/active` | S-07: 管理进行中的订单 |
| 历史记录 | `/sms/history` | S-08: 查看历史订单 |
| 价格统计 | `/sms/prices` | S-09: 查看价格说明 |

## 🔌 API 接口

### 购号相关
```
POST   /api/sms/buy                  - 购买号码
GET    /api/sms/order/:id            - 查询订单状态
POST   /api/sms/order/:id/cancel     - 取消订单
POST   /api/sms/order/:id/finish     - 完成订单
```

### 列表相关
```
GET    /api/sms/orders/active        - 获取活跃订单列表
GET    /api/sms/orders/history       - 获取历史订单列表
GET    /api/sms/prices               - 获取价格列表
```

### 数据相关
```
GET    /api/sms/services             - 获取服务列表
GET    /api/sms/countries            - 获取国家列表
GET    /api/sms/operators            - 获取运营商列表
```

## 📁 关键文件位置

### S-06 购号与等待
```
templates/sms_buy_v2.html
static/css/sms-order.css
static/js/sms-order.js
handlers/sms.go (Line 464-699)
```

### S-07 活跃订单
```
templates/sms_active.html
static/css/sms-active.css
static/js/sms-active.js
handlers/sms.go (Line 614-653)
```

### S-08 历史记录
```
templates/sms_history.html
static/css/sms-history.css
static/js/sms-history.js
localStorage: 'sms_history'
```

### S-09 价格统计
```
templates/sms_prices.html
static/css/sms-prices.css
handlers/sms.go (Line 414-458)
```

## 🔧 常用操作

### 添加历史记录
```javascript
// 在 sms-order.js 中
saveToHistory('123456', '已使用');
```

### 读取历史记录
```javascript
// 在 sms-history.js 中
const history = getHistory();
```

### 启动订单轮询
```javascript
// 在 sms-active.js 中
startActivePoller(orderId);
```

### 复制到剪贴板
```javascript
navigator.clipboard.writeText(text);
```

## 🎨 样式类名

### 订单面板
```css
.order-panel                  /* 主容器 */
.order-panel__header          /* 头部 */
.order-status-badge           /* 状态徽章 */
.status-dot--waiting          /* 等待中（橙色脉冲）*/
.status-dot--received         /* 已收到（绿色）*/
.order-timer                  /* 倒计时 */
.order-timer--warning         /* 警告（橙色）*/
.order-timer--danger          /* 危险（红色闪烁）*/
.otp-area                     /* OTP 区域 */
.otp-code                     /* 验证码（3rem）*/
```

### 活跃订单
```css
.active-order-card            /* 订单卡片 */
.active-order-card--received  /* 已收到（绿色边框）*/
.active-otp                   /* OTP 区域 */
.waiting-dots-sm              /* 等待动画 */
```

### 历史记录
```css
.history-table                /* 历史表格 */
.filter-tab                   /* 筛选 Tab */
.filter-tab--active           /* 激活状态 */
.status-pill                  /* 状态徽章 */
.status-pill--received        /* 已接收 */
.status-pill--canceled        /* 已取消 */
.status-pill--timeout         /* 已超时 */
```

## 🐛 调试技巧

### 查看 localStorage
```javascript
// 浏览器控制台
localStorage.getItem('sms_history')
JSON.parse(localStorage.getItem('sms_history'))
```

### 清空历史记录
```javascript
localStorage.removeItem('sms_history')
```

### 查看活跃轮询
```javascript
// 在 sms-active.js 中
console.log(Object.keys(activePollers))
```

### 手动触发 OTP 显示
```javascript
onSMSReceived({ text: 'Your code is 123456', code: '123456' })
```

## 📊 性能监控

### 轮询频率
```
单订单: 1 req / 3s = 0.33 req/s
5 订单:  5 req / 3s = 1.67 req/s
10订单: 10 req / 3s = 3.33 req/s
```

### localStorage 容量
```
单条记录: ~250 bytes
200 条:   ~50 KB
500 条:   ~125 KB
```

## ✅ 测试检查点

### S-06 购号
- [ ] 点击购买显示订单面板
- [ ] 倒计时正常运行
- [ ] 轮询每 3 秒执行
- [ ] 收到 SMS 后 OTP 显示
- [ ] 取消/完成按钮工作

### S-07 活跃订单
- [ ] 空态正确显示
- [ ] 多订单网格布局
- [ ] 每个订单独立倒计时
- [ ] 收到 SMS 后绿色高亮
- [ ] 超时订单自动移除

### S-08 历史记录
- [ ] 表格正确显示
- [ ] 状态筛选工作
- [ ] 导出 CSV 无乱码
- [ ] 清空历史有确认框

### S-09 价格统计
- [ ] 三张卡片显示
- [ ] 功能列表完整
- [ ] CTA 按钮跳转正确

## 🔗 相关文档

- `SMS_S07_S08_S09_COMPLETION_REPORT.md` - 完成报告
- `SMS_FINAL_TEST_REPORT.md` - 测试报告
- `SMS_DEVELOPMENT_SUMMARY.md` - 开发总结
- `needs/sms/S-06_购号与等待SMS.md` - 需求文档
- `needs/sms/S-07_08_09_活跃历史价格.md` - 需求文档

## 💡 常见问题

### Q: 订单面板不显示？
A: 检查 `buyNumber()` 是否成功调用，查看浏览器控制台错误

### Q: 轮询不工作？
A: 检查 `startActivePoller()` 是否启动，查看网络请求

### Q: localStorage 丢失？
A: 检查是否跨域、是否隐私模式、是否手动清空

### Q: CSV 导出乱码？
A: 确保添加了 BOM (`\uFEFF`)，使用 UTF-8 编码

### Q: 倒计时不准确？
A: 检查服务器时间与本地时间差异

## 🎯 下一步开发

- [ ] S-10: 5SIM API 深度集成
- [ ] S-11: WebSocket 实时推送
- [ ] S-03: 用户账号系统
- [ ] 性能优化
- [ ] 单元测试
- [ ] API 文档

---

**最后更新**: 2026-03-13  
**版本**: v1.0.0

