<!-- privacy-check-I-00_总览索引.md -->

# 🔒 隐私账号安全检测工具 — 总览索引

> **工具名称**: `privacy-check`
> **工具路由**: `/privacy/check`
> **主色调**: 深空蓝 `#0F172A` / 网络青 `#06B6D4` / 警告红 `#EF4444`
> **网站域名**: `toolboxnova.com`
> **功能定位**: 全球领先的一站式隐私账号安全检测平台 — 涵盖邮箱泄露查询、密码安全检测、泄露事件浏览器、密码强度评估、域名批量监控、安全建议引擎

---

## 一、产品架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        用户入口 (浏览器)                                  │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│   │ 邮箱查询  │  │ 密码检测  │  │ 泄露浏览  │  │ 域名监控  │  │密码生成器│ │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ │
└────────┼─────────────┼──────────────┼──────────────┼─────────────┼──────┘
         │             │              │              │             │
         ▼             ▼              ▼              ▼             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      前端处理层 (JavaScript)                             │
│                                                                         │
│  ┌────────────┐  ┌────────────────┐  ┌───────────┐  ┌───────────────┐  │
│  │ SHA-1 Hash │  │ k-Anonymity    │  │ 密码强度   │  │ 密码生成器     │  │
│  │ 计算引擎   │  │ 前缀提取(5位)  │  │ zxcvbn评估 │  │ Crypto API    │  │
│  └─────┬──────┘  └───────┬────────┘  └─────┬─────┘  └──────┬────────┘  │
│        │                 │                  │               │           │
│        └────────┬────────┘                  │               │           │
│                 ▼                            ▼               ▼           │
│  ┌──────────────────────┐    ┌──────────────────────────────────────┐   │
│  │ 密码安全本地判定       │    │ 密码强度 + 生成结果 (纯前端, 不出浏览器)│   │
│  │ (前端对比hash后缀)    │    │                                      │   │
│  └──────────────────────┘    └──────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
         │ (仅密码hash前缀 & 邮箱查询走后端)
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    Go 后端中转层 (Gin)                                    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────┐            │
│  │  POST /api/privacy/check-email                          │            │
│  │  → 中转 HIBP API v3 (带 API Key + User-Agent)           │            │
│  │  → 失败时: 返回兜底数据 (缓存/通用安全建议)               │            │
│  ├─────────────────────────────────────────────────────────┤            │
│  │  GET /api/privacy/password-range/:prefix                │            │
│  │  → 中转 api.pwnedpasswords.com/range/{prefix}          │            │
│  │  → 免费API, 无需Key, k-Anonymity 模型                   │            │
│  │  → 失败时: 返回空列表 + 提示用户稍后重试                  │            │
│  ├─────────────────────────────────────────────────────────┤            │
│  │  GET /api/privacy/breaches                              │            │
│  │  → 中转 HIBP /api/v3/breaches (公开, 无需Key)           │            │
│  │  → 缓存策略: 内存缓存6小时                               │            │
│  │  → 失败时: 返回本地 JSON 兜底数据                         │            │
│  ├─────────────────────────────────────────────────────────┤            │
│  │  GET /api/privacy/breach/:name                          │            │
│  │  → 中转 HIBP /api/v3/breach/{name}                     │            │
│  │  → 缓存策略: 内存缓存24小时                              │            │
│  └─────────────────────────────────────────────────────────┘            │
│                                                                         │
│  兜底策略:                                                               │
│  1. 上游 API 超时 (3s) → 返回缓存数据 + fallback 标记                    │
│  2. 上游 API 返回 4xx/5xx → 返回预置安全建议 + 推荐手动检查              │
│  3. 限流保护: 每 IP 每分钟 10 次查询                                     │
│  4. Turnstile 验证码接入: 防止滥用                                       │
└─────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     上游 API 层                                          │
│                                                                         │
│  ┌──────────────────────┐  ┌──────────────────────────────────────────┐ │
│  │ HIBP API v3          │  │ Pwned Passwords API (Cloudflare CDN)    │ │
│  │ (需 API Key, 付费)   │  │ (免费, k-Anonymity, 月180亿次请求)      │ │
│  │ • /breachedaccount   │  │ • /range/{5charSHA1prefix}              │ │
│  │ • /breaches          │  │ • 返回~800个hash后缀+出现次数            │ │
│  │ • /breach/{name}     │  │ • 99.9% CDN缓存命中率                   │ │
│  │ • /pasteaccount      │  │                                          │ │
│  └──────────────────────┘  └──────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 二、竞品功能对标表

| 功能点 | HIBP | Mozilla Monitor | DeHashed | LeakCheck | **本次实现 (ToolboxNova)** | 差异化说明 |
|--------|------|-----------------|----------|-----------|---------------------------|-----------|
| 邮箱泄露查询 | ✅ 核心功能 | ✅ 基于HIBP数据 | ✅ 付费 | ✅ 付费 | ✅ **后端中转+兜底** | 后端代理隐藏API Key，失败时返回安全建议而非报错 |
| 密码泄露检测 | ✅ k-Anonymity | ❌ 无独立功能 | ✅ 直接暴露明文 | ✅ 付费 | ✅ **前端SHA-1+k-Anonymity** | 密码永不离开浏览器，前端计算hash后仅发送5位前缀 |
| 密码强度评估 | ❌ | ❌ | ❌ | ❌ | ✅ **zxcvbn 实时评估** | 独家：结合泄露检测+强度评估的双维度安全分析 |
| 安全密码生成器 | ❌ | ❌ | ❌ | ❌ | ✅ **Crypto API 生成** | 独家：一站式检测+修复流程闭环 |
| 泄露事件浏览器 | ✅ 列表页 | ❌ | ✅ 付费 | ❌ | ✅ **可搜索/筛选/排序** | 免费开放，支持按时间/规模/类型多维筛选 |
| 泄露详情卡片 | ✅ 简洁文字 | ❌ | ✅ 基础 | ❌ | ✅ **可视化数据卡片** | 泄露规模可视化、时间线、受影响数据类型图标化 |
| 域名搜索 | ✅ 需验证 | ❌ | ✅ 付费 | ✅ 付费 | ✅ **后端中转(预留)** | 后端预留接口，Phase 2 实现 |
| Paste 搜索 | ✅ | ❌ | ❌ | ❌ | ✅ **后端中转(预留)** | 后端预留接口，Phase 2 实现 |
| 通知订阅 | ✅ 邮件通知 | ✅ 邮件通知 | ✅ 监控报警 | ✅ 监控 | 🔜 Phase 2 | Phase 2 实现邮件订阅 |
| 多语言 | ❌ 仅英文 | ✅ 多语言 | ❌ 仅英文 | ❌ 仅英文 | ✅ **中/英双语** | 面向全球用户，完整i18n |
| 安全建议引擎 | ❌ 通用FAQ | ✅ 步骤指引 | ❌ | ❌ | ✅ **个性化安全建议** | 根据泄露类型动态推荐：改密码/启用2FA/冻结账户等 |
| Turnstile 防滥用 | ✅ Cloudflare | ❌ | ❌ | ✅ reCAPTCHA | ✅ **Cloudflare Turnstile** | 无感验证，用户体验优于传统CAPTCHA |
| 暗色模式 | ❌ | ✅ | ✅ | ❌ | ✅ **CSS 变量自适应** | 跟随系统偏好 + 手动切换 |
| 隐私保护说明 | ✅ 详细 | ✅ 详细 | ⚠️ 模糊 | ⚠️ 模糊 | ✅ **显著隐私承诺横幅** | 三重承诺：不存储/不上传/不追踪 |
| 移动端适配 | ✅ 响应式 | ✅ PWA | ⚠️ 一般 | ⚠️ 一般 | ✅ **Mobile-First 响应式** | 触控优化的输入区和结果卡片 |
| 批量查询 | ❌ 单次 | ❌ 单次 | ✅ 付费API | ✅ 付费 | 🔜 Phase 2 API | Phase 2 提供批量查询 API |
| SEO + 结构化数据 | ⚠️ 基础 | ✅ 良好 | ⚠️ 弱 | ⚠️ 弱 | ✅ **JSON-LD + FAQ Schema** | 完整的 SoftwareApplication + FAQPage 结构化数据 |

### 核心差异化优势
1. **双维度密码安全分析** — 泄露检测（是否已泄露）+ 强度评估（是否容易被破解），竞品只有其一
2. **检测→修复闭环** — 发现问题后立即提供安全密码生成器，一站式解决
3. **零信任隐私架构** — 密码永不离开浏览器，仅5位hash前缀经后端中转
4. **优雅降级兜底** — 上游API故障时仍能提供安全建议，不让用户空手而归
5. **中英双语 + 暗色模式** — 面向全球开发者的本地化体验

---

## 三、Block 清单

| 文档编号 | 文件名 | 核心内容 | 预估工时 |
|---------|--------|---------|---------|
| I-00 | `privacy-check-I-00_总览索引.md` | 架构图、竞品对标、Block 清单、路由、依赖、i18n 前缀、sitemap、设计风格 | 4h |
| I-01 | `privacy-check-I-01_路由_SEO_i18n_sitemap_ads_ga.md` | Go 路由注册、Handler、SEO head、广告接入、GA 事件、全量 i18n、Header/首页卡片 | 8h |
| I-02 | `privacy-check-I-02_首页Landing_上传区.md` | 竞品UI对标、完整HTML模板、CSS 规范、交互态说明 | 10h |
| I-03 | `privacy-check-I-03_前端处理引擎.md` | 技术选型、SHA-1 计算、k-Anonymity 实现、zxcvbn 集成、密码生成器、并发控制 | 12h |
| I-04 | `privacy-check-I-04_结果列表UI.md` | 结果卡片渲染、泄露详情弹窗、安全建议面板、泄露浏览器、数据流图 | 10h |
| **总计** | | | **44h** |

---

## 四、路由规划

| 路由 | 说明 | 备注 |
|------|------|------|
| `/privacy/check` | 主页面（默认英文） | 根据 Accept-Language 自动跳转 |
| `/privacy/check?lang=zh` | 中文版 | i18n 切换 |
| `/privacy/check?lang=en` | 英文版 | i18n 切换 |
| **后端 API（非页面路由）** | | |
| `POST /api/privacy/check-email` | 邮箱泄露查询（中转HIBP） | Rate Limit: 10/min/IP |
| `GET /api/privacy/password-range/:prefix` | 密码 hash 范围查询（中转 PwnedPasswords） | 免费，无需 Key |
| `GET /api/privacy/breaches` | 所有泄露事件列表（中转HIBP） | 缓存6h |
| `GET /api/privacy/breach/:name` | 单个泄露事件详情（中转HIBP） | 缓存24h |

> 无独立前端 API 路由，所有数据接口通过 Go 后端中转。

---

## 五、🔧 前端依赖

| 库名 | 用途 | CDN 地址 |
|------|------|----------|
| `js-sha1` | 前端 SHA-1 计算（密码检测） | `https://cdnjs.cloudflare.com/ajax/libs/js-sha1/0.7.0/sha1.min.js` |
| `zxcvbn` | 密码强度评估 | `https://cdnjs.cloudflare.com/ajax/libs/zxcvbn/4.4.2/zxcvbn.js` |
| `Turnstile Widget` | Cloudflare 人机验证 | `https://challenges.cloudflare.com/turnstile/v0/api.js` |
| `day.js` | 泄露事件日期格式化 | `https://cdnjs.cloudflare.com/ajax/libs/dayjs/1.11.10/dayjs.min.js` |
| `dayjs/locale/zh-cn` | 中文日期本地化 | `https://cdnjs.cloudflare.com/ajax/libs/dayjs/1.11.10/locale/zh-cn.min.js` |
| `dayjs/relativeTime` | 相对时间插件 | `https://cdnjs.cloudflare.com/ajax/libs/dayjs/1.11.10/plugin/relativeTime.min.js` |

> 所有依赖通过 CDN 引入，不使用 npm/webpack 构建流程。

---

## 六、i18n Key 前缀清单

| 前缀 | 覆盖范围 |
|------|---------|
| `seo.` | 页面 title / description / og:title / og:description |
| `hero.` | 主标题 / 副标题 / Badge 文案 |
| `tabs.` | 功能 Tab 标签（邮箱检测/密码检测/泄露浏览/密码生成） |
| `email.` | 邮箱检测模块全部文案 |
| `password.` | 密码检测模块全部文案 |
| `strength.` | 密码强度评估相关文案 |
| `generator.` | 密码生成器模块文案 |
| `breaches.` | 泄露事件浏览器模块文案 |
| `result.` | 查询结果展示区文案 |
| `advice.` | 安全建议引擎文案 |
| `status.` | 状态提示（loading / success / error / rate-limit） |
| `error.` | 错误信息 |
| `feature.` | 三特性卡片（隐私/速度/免费） |
| `faq.` | FAQ 手风琴 |
| `toast.` | Toast 通知消息 |
| `common.` | 通用按钮/标签（搜索/复制/重置/关闭等） |

---

## 七、sitemap 新增条目

```xml
<url>
  <loc>https://toolboxnova.com/privacy/check</loc>
  <lastmod>2025-11-18</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>
</url>
<url>
  <loc>https://toolboxnova.com/privacy/check?lang=zh</loc>
  <lastmod>2025-11-18</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
<url>
  <loc>https://toolboxnova.com/privacy/check?lang=en</loc>
  <lastmod>2025-11-18</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
```

---

## 八、设计风格定调

### 色彩体系

| 角色 | 色值 | 用途 |
|------|------|------|
| 主色 (深空蓝) | `#0F172A` | 页面背景、卡片背景 |
| 强调色 (网络青) | `#06B6D4` | 按钮、链接、图标高亮 |
| 安全绿 | `#10B981` | 安全状态、未泄露提示 |
| 警告橙 | `#F59E0B` | 中等风险、密码强度一般 |
| 危险红 | `#EF4444` | 高危状态、已泄露提示 |
| 表面色 | `#1E293B` | 卡片背景、输入框背景 |
| 边框色 | `#334155` | 卡片边框、分割线 |
| 文字主色 | `#F1F5F9` | 主要文字 |
| 文字副色 | `#94A3B8` | 次要说明文字 |
| 亮色表面 (Light Mode) | `#FFFFFF` | 白色模式卡片背景 |
| 亮色背景 | `#F8FAFC` | 白色模式页面背景 |

### 交互风格

- **输入区**: 居中大输入框，类似搜索引擎体验；左侧图标（邮箱/锁），右侧搜索按钮；底部 Turnstile 验证区域
- **Tab 切换**: 顶部胶囊 Tab 组，4个功能模块平滑切换，带底部滑块动画指示器
- **结果区**: 卡片式布局，泄露信息用色块 Badge 标记严重程度；安全建议用独立面板浮层展示
- **泄露浏览器**: 网格卡片布局，每张卡片含 Logo + 名称 + 日期 + 规模 + 数据类型标签
- **密码生成器**: 实时预览 + 一键复制 + 参数滑块（长度/字符类型），生成后自动检测强度

### 差异化设计亮点

1. **"安全仪表盘" 结果呈现** — 查询结果不是简单文字列表，而是类似安全仪表盘的可视化卡片组，包含风险等级环形图、泄露时间线、数据类型分布
2. **密码输入的"盾牌动画"** — 输入密码时，输入框周围有动态盾牌光圈效果，检测安全时盾牌变绿，危险时盾牌变红并震动
3. **泄露事件卡片的"威胁热力图"** — 泄露浏览器中，每张卡片背景根据泄露规模显示不同深度的热力色
4. **三重隐私承诺视觉锚点** — 页面顶部固定一条极简的隐私承诺条："🔒 Your data never leaves your browser" 配合微动画
5. **暗色优先的安全感设计** — 默认暗色模式，营造专业安全工具的信任感；亮色模式可选

---

## 九、后端 API 中转 & 兜底架构详解

### 9.1 邮箱泄露查询 — 中转 + 兜底

```
前端 POST /api/privacy/check-email { email: "user@example.com", turnstileToken: "xxx" }
  │
  ▼
Go 后端:
  1. 校验 Turnstile Token (调用 Cloudflare 验证接口)
  2. Rate Limit 检查 (10次/分钟/IP)
  3. 调用 HIBP API v3:
     GET https://haveibeenpwned.com/api/v3/breachedaccount/{email}
     Headers: hibp-api-key: {KEY}, user-agent: ToolboxNova-PrivacyCheck
  4. 成功 → 返回泄露列表 JSON
  5. 失败兜底:
     - 401/403 (Key问题) → 返回 { fallback: true, message: "服务暂时不可用，请稍后重试", advice: [...] }
     - 404 (未找到) → 返回 { breaches: [], safe: true }
     - 429 (限流) → 返回 { fallback: true, retryAfter: N }
     - 超时/5xx → 返回缓存数据 or 通用安全建议
```

### 9.2 密码范围查询 — 中转（免费 API）

```
前端 GET /api/privacy/password-range/A94A8
  │
  ▼
Go 后端:
  1. 校验 prefix 格式 (5位十六进制)
  2. 调用 Pwned Passwords API:
     GET https://api.pwnedpasswords.com/range/A94A8
     Header: Add-Padding: true
  3. 成功 → 原样返回 hash 后缀列表 (text/plain)
  4. 失败兜底:
     - 超时 → 返回空 + status: "service_unavailable"
     - 5xx → 返回空 + 提示稍后重试
  注: 前端收到后缀列表后，在本地比对完整hash，密码永不上传
```

### 9.3 Cloudflare Turnstile 验证流程

```
前端:
  1. 加载 Turnstile Widget (invisible 模式)
  2. 用户提交查询前自动获取 token
  3. 将 token 随请求发送给后端

后端:
  POST https://challenges.cloudflare.com/turnstile/v0/siteverify
  Body: { secret: TURNSTILE_SECRET, response: token, remoteip: clientIP }
  → 验证通过才执行后续查询
  → 验证失败返回 403
```

---

*本文档为总览索引，详细实现见 I-01 ~ I-04*
