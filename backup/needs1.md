# DevToolBox 隐私工具网站 — 完整开发需求文档

## 项目概述

**项目名称**：DevToolBox（隐私账号工具集合）  
**技术栈**：后端 Go + Gin 框架，前端 HTML/CSS/JS（可选 Vue3 或纯静态模板），模板引擎使用 Go html/template 或前后端分离  
**目标**：面向 Google Ads 投放，SEO 友好，支持中英文切换，所有页面独立路由  
**部署**：单体应用，静态资源内嵌或独立 static 目录

---

## 整体路由规划（SEO 友好）

### 前端要求
- 响应式设计，兼容桌面和移动端
- 顶部导航栏固定，z-index 最高层（不被任何组件覆盖）
- 语言切换为下拉菜单（中文/English），切换后保持当前页面路由，仅重新渲染文字
- 搜索框在顶部导航栏，支持工具名称模糊搜索，回车或点击跳转对应工具页

---

## 路由设计（SEO 友好，所有页面独立路由）

| 页面 | 路由 | 说明 |
|------|------|------|
| 首页 | `/` | 工具导航聚合页 |
| SMS 接码平台 | `/sms` | 列表主页 |
| SMS 选号页 | `/sms/:country` | 按国家筛选号码 |
| SMS 验证码详情 | `/sms/inbox/:phone` | 单号码收件箱 |
| SMS 服务详情 | `/sms/service/:service` | 按服务商筛选 |
| 全球虚拟地址 | `/virtual-address` | 地址生成器 |
| 随机密码生成 | `/password-generator` | 密码生成器 |
| 匿名邮箱 | `/temp-email` | 临时邮箱 |
| 匿名代理 | `/proxy` | 在线代理 |
| 隐私政策 | `/privacy-policy` | SEO 必要页 |
| 服务条款 | `/terms-of-service` | SEO 必要页 |
| 关于我们 | `/about` | 关于页 |
| 联系我们 | `/contact` | 联系页 |
| 站点地图 | `/sitemap` | 页面站点地图 |
| sitemap.xml | `/sitemap.xml` | 给搜索引擎的 XML |
| robots.txt | `/robots.txt` | SEO 爬虫规则 |

---

## 全局组件

### 顶部导航栏（所有页面共用）

**结构**：
- 左侧：Logo（DevToolBox 图标 + 文字）
- 中部：导航菜单（隐私账号、编程开发、安全编解码、实时查询、多媒体、文案语言、AI 实验室）
- 右侧：搜索框 + 语言切换下拉（中文/English）

**语言切换要求**：
- 下拉选项：`🇨🇳 中文` / `🇺🇸 English`
- 切换通过 URL query `?lang=zh` 或 `?lang=en` 实现，Gin 中间件读取并注入模板变量
- 切换后页面刷新，保持当前路由不变
- 下拉菜单 z-index 设置为 9999，确保不被任何卡片、模态框遮挡

**搜索功能**：
- 搜索范围：所有工具的名称（中英文均可搜索）
- 搜索结果以下拉联想形式展示，点击跳转对应路由
- 后端提供 `/api/search?q=xxx` 接口，返回匹配的工具列表（name、description、url）

### 底部 Footer（所有页面共用）

**左栏**：
- DevToolBox Logo + 名称
- 描述：50+ free online tools for developers and everyday users. No registration, no data storage.
- 标签：`🛡 Data not stored` · `👤 Fully anonymous`

**中栏（Popular Tools）**：
- SMS Receiver (OTP) → `/sms`
- Temporary Email → `/temp-email`
- JSON Formatter → `/json`（预留路由）
- Base64 Encoder → `/base64`（预留路由）
- IP Address Lookup → `/ip`（预留路由）
- AI Content Detector → `/ai-detector`（预留路由）

**右栏（Resources & Legal）**：
- Privacy Policy → `/privacy-policy`
- Terms of Service → `/terms-of-service`
- About Us → `/about`
- Contact Us → `/contact`
- Sitemap → `/sitemap`
- sitemap.xml → `/sitemap.xml`

**底部版权行**：
- 左：`© 2025–2026 DevToolBox · All data processed server-side, never stored.`
- 右：`Sitemap` · `robots.txt`
- 背景色：深色（#0f172a）

---

## 功能一：SMS 接码平台

**参考**：https://5sim.net  
**路由**：`/sms`、`/sms/:country`、`/sms/inbox/:phone`、`/sms/service/:service`  
**数据来源**：后端调用第三方 API（5sim/sms-activate 等），通过 Gin 接口转发给前端

### 页面一：SMS 主页 `/sms`

**页面标题（SEO）**：`Free SMS Receiver - Virtual Phone Numbers | DevToolBox`  
**Meta Description**：Receive SMS online for free. Use virtual phone numbers to verify accounts without your real phone.

**页面布局**：

**Hero 区域**：
- 标题：`Free SMS Receiver Online`（大字）
- 副标题：Receive SMS verification codes instantly. No registration required.
- 统计数字展示区：总激活数、在线号码数、支持国家数、支持服务数（从后端 `/api/sms/stats` 获取）

**国家筛选区**：
- 顶部固定的国家 Tab 栏（热门国家：美国、英国、俄罗斯、印度、巴西、德国、法国、中国等）
- 每个 Tab 显示：国旗 emoji + 国家名 + 可用号码数
- 点击 Tab 切换当前展示的号码列表
- 支持"更多国家"下拉展开

**服务商筛选区**：
- 横向滚动的服务 Tag 列表（Google、WhatsApp、Telegram、Facebook、Twitter、TikTok、Amazon 等 50+ 个）
- 每个 Tag 显示服务 Logo（favicon）+ 名称
- 点击 Tag 过滤列表

**号码列表区**：
- 卡片式列表，每张卡片显示：
    - 国旗 + 国家名
    - 虚拟号码（格式：+1 234 567 8901，部分隐藏中间位）
    - 运营商名称
    - 状态标签（Active/Ready/Busy）
    - 最近接收时间
    - 按钮：`Get Messages`（跳转到 `/sms/inbox/:phone`）
- 分页或无限滚动加载
- 每页 20 条数据

**后端接口**：
GET /api/sms/numbers?country=US&service=google&page=1&limit=20
Response: { list: [{phone, country, operator, status, last_received}], total, page }

GET /api/sms/stats
Response: { total_activations, online_numbers, countries, services }

---

### 页面二：号码收件箱 `/sms/inbox/:phone`

**页面标题**：`SMS Inbox for +{phone} | DevToolBox`

**页面布局**：

**顶部号码信息栏**：
- 显示号码、国家国旗、运营商
- 复制号码按钮
- 刷新按钮（手动刷新）
- 自动刷新倒计时（每 10 秒自动请求一次）

**消息列表区**：
- 每条消息卡片显示：
    - 发件方（服务名称，如 Google、TWILIO）
    - 接收时间（相对时间，如 2 minutes ago）
    - 验证码高亮提取展示（用正则从短信内容中提取数字验证码，大字体蓝色高亮）
    - 完整短信内容
    - 复制验证码按钮
- 空状态：显示等待动画 + 文字 "Waiting for SMS..."
- 消息按时间降序排列

**右侧面板**：
- 当前可用号码推荐（同国家其他号码）
- 服务商支持列表

**后端接口**：
GET /api/sms/messages/:phone
Response: { messages: [{id, from, content, received_at, code}] }

---

### 页面三：按服务筛选 `/sms/service/:service`

- 标题：`Receive {Service} SMS Online Free`
- 显示支持该服务的所有可用号码
- 布局与主页号码列表相同
- 侧边栏显示该服务的注册教程（纯静态文字）

---

## 功能二：全球虚拟地址生成器

**路由**：`/virtual-address`  
**参考**：图三截图 + https://www.fakenamegenerator.com  
**实现方式**：纯前端 JavaScript 实现，无需后端

**页面标题**：`Global Virtual Address Generator - Fake Identity | DevToolBox`  
**Meta Description**：Generate realistic fake addresses, names, and identity info for testing and privacy protection.

### 页面布局

**控制面板区**：
- 国家/地区下拉选择框（含国旗，选项包含全球 50+ 国家 + "Global Random"）
- 数量选择（1/5/10/20/50）
- 性别选择（Random/Male/Female）
- 复选框选项：
    - ✅ 公司（包含公司名）
    - ☐ 经纬度（包含 GPS 坐标）
- 隐藏敏感字段开关（开启后隐藏证件号、信用卡完整号等）

**操作按钮栏**：
- 🔵 `生成地址 / Generate` 按钮（主要操作）
- ↻ `刷新当前` 按钮
- 📋 `复制当前` 按钮（复制 JSON）
- 📄 `导出 JSON` 按钮（下载 JSON 文件）
- 📊 `导出 CSV` 按钮（下载 CSV 文件）
- 🔴 `清空历史` 按钮

**结果展示区**（每条记录分为四个信息块）：

**基本信息块**：
- 姓名、用户名、性别+年龄、生日、证件号（可隐藏）、邮箱、电话

**地址信息块**：
- 国家、州/省、城市、街道、邮编、完整地址、时区

**就业信息 & 信用卡块**：
- 职位、部门、公司、年收入（隐藏）、工作电话（隐藏）、卡类型、卡号（部分隐藏）、有效期、CVV（隐藏）

**更多资料块**：
- 婚姻状态、学历、血型、护照号（隐藏）、驾照号（隐藏）、税号（隐藏）、网站、经纬度（可选）

**底部汇总表格**：
- 当批次生成的所有记录以表格形式展示（姓名、国家、城市、电话、邮箱、操作）

**右侧面板**：
- 关于工具说明
- 最近生成历史（最近 20 条，存 localStorage）

**前端实现要求**：
- 使用 Faker.js 或内置数据集生成虚拟数据（按国家规则生成）
- 信用卡号使用 Luhn 算法生成有效格式（非真实）
- 敏感字段隐藏用 `****` 或 `•••` 代替
- 导出 JSON/CSV 使用浏览器原生 Blob 下载

---

## 功能三：随机密码生成器

**路由**：`/password-generator`  
**参考**：图一截图 + https://bitwarden.com/password-generator  
**实现方式**：纯前端 JavaScript，使用 `window.crypto.getRandomValues` API

**页面标题**：`Strong Random Password Generator | DevToolBox`  
**Meta Description**：Generate cryptographically secure random passwords instantly. Free, private, no server transmission.

### 页面布局（左右两栏）

**左栏（生成器主体）**：

**密码展示框**：
- 大字体显示生成的密码
- 右侧复制按钮（点击复制 + Toast 提示）
- 密码强度进度条（Weak/Fair/Good/Strong/Very Strong，颜色从红到绿渐变）

**设置面板**（可折叠）：
- 密码长度滑块（范围 4–128，默认 16，实时显示数值）
- 字符类型复选框：
    - ✅ 大写字母 A-Z
    - ✅ 小写字母 a-z
    - ✅ 数字 0-9
    - ☐ 特殊符号 !@#$%^&*
    - ☐ 排除歧义字符（0O1lI）
- 生成数量下拉（1/5/10/20）

**操作按钮**：
- 🔵 `生成密码 / Generate` 按钮
- 📋 `复制 / Copy` 按钮
- 批量生成时显示列表，每条右侧有复制按钮

**右栏（说明面板）**：
- 关于随机密码生成器（标题 + 描述）
- 什么是强密码（emoji + 说明文字）
- 为什么要使用密码生成器（checkmark 列表）
- 安全建议（lightbulb 列表）

**前端实现**：
- 密码强度算法：基于长度、字符种类多样性评分
- 使用 `crypto.getRandomValues` 确保密码学安全随机
- 生成的密码不发送到任何服务器
- 支持键盘快捷键：`Ctrl+Enter` 生成，`Ctrl+C` 复制

---

## 功能四：匿名临时邮箱

**路由**：`/temp-email`  
**参考**：图二截图 + https://10minutemail.com + https://temp-mail.org  
**数据来源**：后端调用第三方临时邮箱 API（或自建邮件服务）

**页面标题**：`Free Temporary Email Address - 10 Minute Mail | DevToolBox`  
**Meta Description**：Get a free disposable temporary email address instantly. Auto-expires in 10 minutes, no registration needed.

### 页面布局（顶部 Tab 切换）

**顶部 Tab**：临时邮箱 | 匿名代理（两个功能共用顶部 Tab 导航）

**主体区域**：

**邮箱地址展示区**（绿色背景卡片）：
- 标题：您的临时邮箱
- 右上角：`⟳ 加载中...` / `✅ 已就绪` 状态
- 邮箱地址大字展示框（自动生成，如 `abc123@tempmail.dev`）
- 操作按钮行：
    - 📋 复制
    - ↻ 换号（随机生成新邮箱）
- 自定义地址前缀输入框（可选）+ `⚙ 设置` 按钮 + 🔴 `销毁并新建` 按钮

**收件箱区域**：
- 标题：收件箱
- 右上角：`↻ 刷新` + `🗑 清空` 按钮
- 邮件列表（每封邮件卡片显示：发件人、主题、时间、内容摘要）
- 点击展开完整邮件内容
- 空状态：转圈加载动画 + "正在等待邮件..."
- **底部提示**：每 15 秒自动检查新邮件（左下角绿点 + 文字）

**右侧说明面板**：
- 关于临时邮箱
- 什么是临时邮箱
- ✅ 适用场景（4 条列表）
- ⚠️ 注意事项（3 条列表）
- 统计数字：今日已创建、已拦截垃圾邮件

**后端接口**：
POST /api/email/create
Response: { address, expires_at }

GET /api/email/messages/:address
Response: { messages: [{id, from, subject, body, received_at}] }

DELETE /api/email/destroy/:address
Response: { success: true }

POST /api/email/custom
Body: { prefix: "myname" }
Response: { address: "myname@tempmail.dev
" }


**轮询机制**：前端每 15 秒调用一次 `/api/email/messages/:address`，有新邮件时提示音 + 页面 title 闪烁

---

## 功能五：匿名代理

**路由**：`/proxy`  
**参考**：图六截图 + https://hide.me/en/proxy + https://www.croxyproxy.com  
**数据来源**：后端实现代理转发逻辑

**页面标题**：`Free Anonymous Web Proxy - Browse Privately | DevToolBox`  
**Meta Description**：Browse the web anonymously with our free online proxy. Hide your IP address, no software required.

### 页面布局

**顶部 Tab**：临时邮箱 | 匿名代理

**主体区域**：

**URL 输入区**：
- `🔒 https://` 前缀标签 + 输入框（placeholder: 输入要访问的网址，如 example.com）
- 🔴 `▶ 访问 / Visit` 按钮

**快捷入口**（常用网站快速跳转）：
- Google、YouTube、Wikipedia、Reddit、GitHub、DuckDuckGo
- 以 Tag 按钮形式展示，点击直接通过代理访问

**选项配置行**：
- ✅ 加密连接
- ☐ 禁用脚本
- ✅ 屏蔽广告
- 代理节点选择：下拉框（🌍 自动选择 / 美国节点 / 欧洲节点 / 亚洲节点）

**特性说明三栏**：
- 🛡 隐藏真实 IP（说明文字）
- ⚡ 无需安装（说明文字）
- 🔒 加密传输（说明文字）

**使用说明区**（橙色背景卡片）：
1. 在上方地址栏输入目标网址（如 google.com）
2. 选择所需的代理节点和功能选项
3. 点击「访问」按钮，即可通过代理浏览网页
4. 浏览完成后点击「关闭代理」断开连接

**免责声明**（黄色背景）：
本工具仅用于合法的隐私保护目的，请勿用于访问非法内容或违反所在地区法律法规的活动。

**右侧统计面板**：
- 今日代理请求数
- 可用节点数

**后端接口**：
POST /api/proxy/fetch
Body: { url, encrypt: true, disable_scripts: false, block_ads: true, node: "auto" }
Response: 返回目标页面的 HTML 内容（后端做内容处理后返回）

GET /api/proxy/stats
Response: { today_requests, available_nodes }

GET /api/proxy/nodes
Response: { nodes: [{id, name, location, latency, available}] }

**代理实现说明（给 Copilot）**：
后端 Gin handler 接收 URL 参数，使用 `net/http` 客户端发起请求，对返回的 HTML 进行以下处理：
1. 替换所有 `href`、`src`、`action` 中的绝对链接，使其通过代理路由
2. 注入关闭代理的工具栏（顶部 banner）
3. 如开启广告屏蔽，移除常见广告 DOM 元素
4. 返回处理后的 HTML

---

## 功能六：首页工具导航

**路由**：`/`  
**页面标题**：`DevToolBox - Free Online Tools for Developers & Privacy | DevToolBox`

### 页面布局

**Hero 区域**：
- 大标题：Free Online Tools for Privacy & Development
- 副标题：50+ tools. No registration. No data stored.
- 搜索框（与顶部导航搜索联动）

**工具分类卡片区**（隐私账号分类）：
- SMS 接码平台（手机图标，蓝色）
- 全球虚拟地址（地址图标，蓝色，NEW 角标）
- 随机密码生成（钥匙图标，黄色）
- 匿名邮箱（邮件图标，绿色）
- 匿名代理（地球图标，橙色）

每个工具卡片包含：
- 大图标
- 工具名称（粗体）
- 一行描述
- 点击跳转对应路由

---

## 国际化（i18n）要求

**实现方式**：
- 翻译文件存放在 `/locales/zh.json` 和 `/locales/en.json`
- Gin 中间件读取请求中的 `lang` query 参数或 Cookie，注入到模板上下文
- 模板中使用 `{{ t "key" }}` 调用翻译

**需要翻译的内容**：
- 所有页面标题、描述、按钮文字、标签文字
- 错误提示信息
- 说明文字

**URL 示例**：
- `/sms?lang=en` → 英文
- `/sms?lang=zh` → 中文
- 切换后 302 重定向到带 `lang` 参数的当前 URL

---

## SEO 要求

每个页面必须包含：

```html
<title>{页面专属标题} | DevToolBox</title>
<meta name="description" content="{页面专属描述}">
<meta name="keywords" content="{页面关键词}">
<link rel="canonical" href="https://devtoolbox.dev{当前路由}">

<!-- Open Graph -->
<meta property="og:title" content="">
<meta property="og:description" content="">
<meta property="og:url" content="">
<meta property="og:type" content="website">

<!-- 结构化数据 JSON-LD -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "工具名称",
  "url": "工具URL",
  "description": "工具描述"
}
</script>


### 项目结构
devtoolbox/
├── main.go
├── config/
│   └── config.go
├── handlers/
│   ├── sms.go          # SMS 后端 API
│   ├── email.go        # 临时邮箱后端 API
│   ├── proxy.go        # 匿名代理后端 API
│   └── page.go         # 所有 HTML 页面渲染
├── middleware/
│   └── i18n.go         # 语言检测中间件
├── i18n/
│   ├── zh.json         # 中文翻译
│   └── en.json         # 英文翻译
├── static/
│   ├── css/
│   ├── js/
│   └── img/
├── templates/
│   ├── layout.html     # 公共布局（导航 + 底部 + 语言切换）
│   ├── index.html
│   ├── sms.html
│   ├── sms_buy.html
│   ├── sms_history.html
│   ├── sms_api.html
│   ├── virtual_address.html
│   ├── password.html
│   ├── temp_email.html
│   ├── proxy.html
│   ├── about.html
│   ├── privacy.html
│   └── terms.html
└── go.mod

sitemap.xml 由后端 /sitemap.xml 路由动态生成，包含所有静态路由
robots.txt 由后端 /robots.txt 路由返回，允许所有爬虫访问

### Google Ads 集成准备

每个页面 <head> 中预留 Google Ads 脚本插入位（通过配置文件开关控制）

页面布局预留侧边栏 300×250 广告位、内容中部 728×90 横幅广告位

广告位以 <div class="ad-slot" data-slot="sidebar"> 形式占位

开发优先级

Phase 1（MVP）：

项目骨架搭建（路由、模板、中间件、i18n）

顶部导航 + 底部 Footer 全局组件

首页工具导航

随机密码生成器（纯前端）

全球虚拟地址生成器（纯前端）

Phase 2：
6. SMS 接码平台（需对接第三方 API）
7. 匿名临时邮箱（需对接第三方 API）

Phase 3：
8. 匿名代理（后端代理转发）
9. 搜索功能完善
10. SEO 优化、sitemap、结构化数据

