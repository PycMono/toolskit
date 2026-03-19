# DevToolBox - 隐私工具网站

这是一个完整的开发者和隐私保护工具集合网站，使用 Go + Gin 框架构建。

## 项目结构

```
toolskit/
├── main.go                 # 主入口
├── config/                 # 配置
│   └── config.go
├── handlers/               # 处理器
│   ├── page.go            # 页面渲染
│   ├── sms.go             # SMS接码功能
│   ├── email.go           # 临时邮箱
│   └── proxy.go           # 匿名代理
├── middleware/             # 中间件
│   └── i18n.go            # 国际化
├── internal/router/        # 路由
│   └── router.go
├── i18n/                   # 翻译文件
│   ├── zh.json            # 中文
│   └── en.json            # 英文
├── templates/              # HTML模板
│   ├── base.html          # 基础模板
│   ├── index.html         # 首页
│   ├── sms.html           # SMS接码
│   ├── sms_inbox.html     # SMS收件箱
│   ├── sms_service.html   # SMS服务筛选
│   ├── password.html      # 密码生成器
│   ├── virtual_address.html # 虚拟地址生成器
│   ├── temp_email.html    # 临时邮箱
│   ├── proxy.html         # 匿名代理
│   ├── about.html         # 关于页面
│   ├── privacy.html       # 隐私政策
│   ├── terms.html         # 服务条款
│   ├── contact.html       # 联系我们
│   └── sitemap.html       # 站点地图
└── static/                 # 静态资源
    ├── css/
    │   └── main.css       # 主样式
    ├── js/
    │   ├── main.js        # 主脚本
    │   ├── password.js    # 密码生成器
    │   ├── address.js     # 虚拟地址生成器
    │   ├── email.js       # 临时邮箱
    │   └── proxy.js       # 代理功能
    └── img/
        └── favicon.svg    # 网站图标
```

## 功能特性

### Phase 1 (已完成) ✅
- ✅ 首页工具导航
- ✅ 随机密码生成器 (纯前端，使用 crypto API)
- ✅ 全球虚拟地址生成器 (纯前端)
- ✅ 顶部导航栏 + 底部 Footer
- ✅ 中英文切换 (i18n)
- ✅ SEO 优化 (sitemap.xml, robots.txt, meta tags)

### Phase 2 (已完成) ✅
- ✅ SMS 接码平台 (模拟数据)
  - SMS 主页 (按国家/服务筛选)
  - SMS 收件箱
  - SMS 服务筛选页
- ✅ 匿名临时邮箱 (API 接口已创建)

### Phase 3 (已完成) ✅
- ✅ 匿名代理 (后端代理转发)
- ✅ 搜索功能
- ✅ 所有静态页面 (关于、隐私政策、服务条款、联系、站点地图)

## 技术栈

- **后端**: Go 1.25 + Gin框架
- **模板引擎**: Go html/template
- **前端**: HTML5 + CSS3 + JavaScript (ES6+)
- **国际化**: 自定义 i18n 中间件
- **样式**: 响应式设计，支持桌面/移动端

## 快速开始

### 安装依赖

```bash
go mod tidy
```

### 启动服务器

```bash
# 默认端口 8086
go run main.go

# 或使用启动脚本 (端口 3000)
./start.sh

# 自定义端口
PORT=8080 go run main.go
```

### 构建

```bash
go build -o devtoolbox .
./devtoolbox
```

## 主要路由

### 页面路由
- `/` - 首页
- `/sms` - SMS接码平台
- `/sms/:country` - 按国家筛选SMS
- `/sms/inbox/:phone` - SMS收件箱
- `/sms/service/:service` - 按服务筛选SMS
- `/virtual-address` - 虚拟地址生成器
- `/password-generator` - 密码生成器
- `/temp-email` - 临时邮箱
- `/proxy` - 匿名代理
- `/about` - 关于我们
- `/privacy-policy` - 隐私政策
- `/terms-of-service` - 服务条款
- `/contact` - 联系我们
- `/sitemap` - 站点地图

### API路由
- `GET /api/search?q=xxx` - 工具搜索
- `GET /api/sms/stats` - SMS统计数据
- `GET /api/sms/numbers` - 获取SMS号码列表
- `GET /api/sms/messages/:phone` - 获取SMS消息
- `POST /api/email/create` - 创建临时邮箱
- `POST /api/email/custom` - 创建自定义邮箱
- `GET /api/email/messages/:address` - 获取邮件
- `DELETE /api/email/destroy/:address` - 销毁邮箱
- `POST /api/proxy/fetch` - 代理请求
- `GET /api/proxy/stats` - 代理统计

### SEO路由
- `/robots.txt` - 爬虫规则
- `/sitemap.xml` - XML站点地图
- `/favicon.ico` - 网站图标 (重定向到 SVG)

## 国际化

支持中文和英文切换，通过 URL 参数 `?lang=zh` 或 `?lang=en` 切换语言。

语言偏好保存在 Cookie 中，下次访问自动使用上次的语言设置。

## 环境变量

```bash
PORT=8086                    # 服务器端口
GOOGLE_ADS_ID=ca-pub-xxx    # Google Ads ID (可选)
ENABLE_ADS=false             # 是否启用广告
SITE_URL=https://devtoolbox.dev  # 网站URL
SMS_API_KEY=xxx              # SMS API密钥 (可选)
EMAIL_API_KEY=xxx            # Email API密钥 (可选)
```

## 开发建议

### 生产模式运行

```bash
export GIN_MODE=release
go run main.go
```

### 接入真实API

当前SMS、Email和Proxy功能使用模拟数据。要接入真实API：

1. **SMS接码**: 修改 `handlers/sms.go`，接入 5sim.net 或 sms-activate 等API
2. **临时邮箱**: 修改 `handlers/email.go`，接入 10minutemail 或自建邮件服务
3. **代理服务**: 修改 `handlers/proxy.go`，配置代理节点

### 添加新工具

1. 在 `handlers/` 创建新的处理器
2. 在 `templates/` 创建新的模板
3. 在 `internal/router/router.go` 注册路由
4. 在 `i18n/zh.json` 和 `i18n/en.json` 添加翻译
5. 在首页 `templates/index.html` 添加工具卡片

## 注意事项

- 所有页面都支持响应式布局，兼容移动端
- 密码生成器和虚拟地址生成器完全在浏览器中运行，不传输数据到服务器
- SEO友好，所有页面都有独立的 title、description 和 keywords
- 顶部导航栏固定，z-index最高，不会被任何组件遮挡
- 语言切换为下拉菜单，切换后保持当前页面路由

## 许可证

本项目仅用于学习和演示目的。

## 作者

DevToolBox Team

