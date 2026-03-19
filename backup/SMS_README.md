# SMS接码器开发指南

## 🎯 项目概述

SMS接码器是DevToolBox的核心功能模块，完全对标 [5sim.net](https://5sim.net)，提供在线虚拟手机号码接收SMS验证码服务。

## ✅ 已完成模块

### S-01: 路由、SEO、i18n基础架构 ✅
- 所有路由已注册
- 完整的中英文翻译
- SEO优化（sitemap + meta + JSON-LD）

### S-02: Landing首页 ✅
- Hero区域（深色渐变 + 搜索框）
- 数字统计（动画效果）
- 服务Logo滚动墙
- 三步使用说明
- FAQ区域

## 🚀 快速开始

### 1. 启动服务器

```bash
cd /Users/pengyachuan/work/go/src/PycMono/github/toolskit
go run main.go
```

### 2. 访问页面

- **Landing页面**: http://localhost:8086/sms
- **英文版**: http://localhost:8086/sms?lang=en
- **购买页面**: http://localhost:8086/sms/buy
- **价格页面**: http://localhost:8086/sms/prices
- **登录页面**: http://localhost:8086/sms/login

### 3. 测试功能

#### Hero搜索
1. 在搜索框输入服务名称（如"WhatsApp"）
2. 查看下拉建议列表
3. 点击服务跳转到购买页面

#### 数字统计动画
1. 滚动页面到统计区域
2. 观察数字从0滚动到目标值的动画效果

#### 服务Logo滚动
1. 观察服务Logo自动横向滚动
2. 边缘渐隐效果

#### FAQ折叠
1. 点击FAQ问题
2. 查看答案展开/折叠效果

## 📁 项目结构

```
toolskit/
├── handlers/
│   └── sms.go                 # SMS Handler函数
├── internal/
│   └── router/
│       └── router.go          # 路由配置
├── i18n/
│   ├── zh.json                # 中文翻译
│   └── en.json                # 英文翻译
├── static/
│   ├── css/
│   │   └── sms.css            # SMS样式
│   └── js/
│       └── sms-landing.js     # SMS交互
└── templates/
    ├── sms_landing.html       # Landing页面
    ├── sms_buy.html           # 购买页面（待开发）
    ├── sms_prices.html        # 价格页面（待开发）
    ├── sms_login.html         # 登录页面（待开发）
    ├── sms_register.html      # 注册页面（待开发）
    ├── sms_active.html        # 活跃订单页面（待开发）
    ├── sms_history.html       # 历史订单页面（待开发）
    └── sms_account.html       # 账户页面（待开发）
```

## 🎨 设计规范

### 颜色方案
- **主色**: `#4f46e5` (Indigo 600)
- **深色背景**: `#0f172a` → `#1e1b4b` → `#312e81` (渐变)
- **光晕**: `#6366f1`, `#8b5cf6`
- **成功**: `#28a745`
- **危险**: `#dc3545`

### 响应式断点
- **桌面**: > 768px
- **移动**: ≤ 768px

### CSS命名规范
- **BEM规范**: `.sms-hero__title`, `.sms-navbar__links`
- **状态类**: `.active`, `.disabled`
- **工具类**: `.hidden`, `.visible`

## 🔧 开发指南

### 添加新翻译

编辑 `i18n/zh.json` 和 `i18n/en.json`:

```json
{
  "sms.new_key": "中文文本"
}
```

模板中使用:

```html
{{ call .T "sms.new_key" }}
```

### 添加新页面

1. 创建模板文件 `templates/sms_xxx.html`
2. 在 `handlers/sms.go` 添加Handler函数
3. 在 `internal/router/router.go` 注册路由
4. 更新 `sitemap.xml`

### 添加API接口

1. 在 `handlers/sms.go` 添加API Handler
2. 在 `internal/router/router.go` 注册API路由
3. 添加限流中间件（如需要）

## 📋 待开发模块

按照优先级排序：

1. **S-10**: 5SIM API代理层（4h）- **最优先**
2. **S-03**: 用户认证系统（4h）
3. **S-04**: 用户中心与余额充值（3h）
4. **S-05**: 服务选择器三级联动（4h）
5. **S-06**: 购号与等待SMS（5h）
6. **S-07**: 活跃订单管理（3h）
7. **S-08**: 历史订单列表（2h）
8. **S-09**: 价格统计页面（3h）
9. **S-11**: WebSocket实时推送（3h）

## 🧪 测试

### 手动测试

```bash
# 测试中文版
curl http://localhost:8086/sms | grep "在线 SMS 接码器"

# 测试英文版
curl http://localhost:8086/sms?lang=en | grep "Online SMS Receiver"

# 测试CSS加载
curl -I http://localhost:8086/static/css/sms.css

# 测试JS加载
curl -I http://localhost:8086/static/js/sms-landing.js
```

### 浏览器测试

1. 打开 http://localhost:8086/sms
2. 测试Hero搜索功能
3. 滚动查看数字统计动画
4. 测试FAQ折叠功能
5. 切换语言（?lang=en）
6. 测试移动端响应式（F12 > 设备模拟）

## 📚 参考文档

- **竞品参考**: https://5sim.net
- **需求文档**: `needs/sms/S-00_总览索引.md`
- **API文档**: `needs/sms/S-10_11_5SIM代理层与WebSocket.md`
- **开发报告**: `SMS_S01_S02_SUMMARY.md`

## 🤝 贡献指南

1. 遵循现有代码风格和命名规范
2. 添加适当的注释（中文）
3. 更新相关文档
4. 测试所有功能后再提交

## 📞 联系方式

如有问题，请参考项目文档或查看代码注释。

---
**最后更新**: 2026-03-13  
**当前版本**: v0.2.0 (S-01 + S-02 完成)

