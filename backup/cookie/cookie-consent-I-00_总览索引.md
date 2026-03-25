# cookie-consent-I-00_总览索引.md

---

## 产品背景

网站已接入 Google Analytics + Google Ads，依据 GDPR / ePrivacy Directive（欧洲）
及 CCPA / CPRA（加州）要求，必须在用户主动授权前阻断所有非必要 Cookie 的写入，
并向 Google Consent Mode v2 上报同意状态。

---

## 产品架构图

```
用户首次访问
      │
      ▼
┌─────────────────────┐
│  Go Gin 中间件层      │
│  ConsentMiddleware   │  ← 读取 Cookie "cky_consent"
│  GAConfig            │  ← 注入 .GAEnabled / .GATrackingID
│  AdsConfig           │  ← 注入 .AdsEnabled / .AdsClientID
└────────┬────────────┘
         │ 模板变量注入
         ▼
┌─────────────────────┐
│   base.html          │
│  extraHead Block     │  ← Consent Mode v2 默认值（denied）
│  GA Script（条件）   │  ← .GAEnabled && consent=granted 才加载
│  Ads Script（条件）  │  ← .AdsEnabled && consent=granted 才加载
└────────┬────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────┐
│              partials/cookie-consent.html            │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  Banner（底部固定）                           │  │
│  │  ┌──────────┐  ┌────────────┐  ┌──────────┐ │  │
│  │  │  拒绝全部 │  │  自定义偏好 │  │ 接受全部  │ │  │
│  │  └──────────┘  └────────────┘  └──────────┘ │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  自定义弹窗（Modal）                           │  │
│  │  ✅ 必要 Cookie（锁定）                       │  │
│  │  ☑️  分析 Cookie（GA）                        │  │
│  │  ☑️  广告 Cookie（Ads）                       │  │
│  │  [保存我的偏好]                               │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
         │
         ▼
  JS consent-engine.js
  ├── 读 / 写 cky_consent Cookie（1年）
  ├── 调用 gtag('consent', 'update', {...})
  ├── 动态加载 GA gtag.js（consent granted 后）
  └── 触发 gaTrack* 事件
```

---

## 竞品功能对标表

| 功能点 | Cookiebot | CookieYes | OneTrust | 本次实现 | 差异化说明 |
|---|---|---|---|---|---|
| GDPR 合规横幅 | ✅ | ✅ | ✅ | ✅ | 原生集成，无第三方 SDK |
| Consent Mode v2 | ✅ | ✅ | ✅ | ✅ | 直接写入 gtag consent |
| 分类开关（分析/广告） | ✅ | ✅ | ✅ | ✅ | 细粒度控制 |
| 记住用户偏好 | ✅ | ✅ | ✅ | ✅ | Cookie 持久化 1 年 |
| i18n 多语言 | ✅(付费) | ✅(部分) | ✅(付费) | ✅ | 复用站点现有 i18n 体系 |
| 自定义样式 | ❌ | 有限 | ❌ | ✅ | CSS 变量，完全匹配站点风格 |
| 无第三方依赖 | ❌(需注册) | ❌(需注册) | ❌(需注册) | ✅ | **零外部依赖，隐私友好** |
| 同意日志记录 | ✅(付费) | ✅(付费) | ✅ | ⚠️ | 记录在客户端 Cookie，不上报服务器 |
| 重新管理偏好入口 | ✅ | ✅ | ✅ | ✅ | Footer 链接触发 |
| 隐私政策页联动 | ✅ | ✅ | ✅ | ✅ | 链接到 /privacy |
| Go 后端中间件 | ❌ | ❌ | ❌ | ✅ | **独有：与现有中间件链对齐** |

---

## Block 清单

| 文件 | 核心内容 | 预估工时 |
|---|---|---|
| I-00_总览索引.md | 架构图、竞品对标、依赖清单 | 0.5h |
| I-01_路由_SEO_i18n.md | Go 中间件、模板变量、i18n Key 全量、隐私政策路由 | 3h |
| I-02_Banner_UI.md | HTML 横幅 + 自定义 Modal 完整模板、CSS 规范 | 3h |
| I-03_consent-engine.md | JS 同意引擎、Consent Mode v2、GA 动态加载、Cookie 读写 | 4h |
| I-04_状态与集成.md | 与 GAConfig/AdsConfig 中间件集成、状态流转图、验收清单 | 2h |
| **合计** | | **12.5h** |

---

## 路由规划

| 路由 | 说明 |
|---|---|
| `GET /privacy` | 隐私政策页（新增） |
| `GET /privacy?lang=zh` | 中文隐私政策 |
| `GET /privacy?lang=en` | 英文隐私政策 |
| `POST /api/consent` | 可选：服务端记录同意日志（当前版本不实现） |

Cookie Consent Banner 本身无独立路由，作为 `partials/cookie-consent.html` 嵌入 base.html。

---

## 前端依赖

本功能**零外部 CDN 依赖**，完全使用原生 JS。

| 依赖 | 说明 |
|---|---|
| 原生 JS（ES6+） | consent-engine.js，无框架 |
| gtag.js | 由 Google 提供，ConsentMode 初始化后条件加载 |
| 现有 ga-events.js | 站点已有，复用 gaTrack* 函数 |

---

## i18n Key 前缀清单

| 命名空间 | 用途 |
|---|---|
| `consent.banner.*` | 横幅主体文案 |
| `consent.modal.*` | 自定义偏好弹窗文案 |
| `consent.category.*` | Cookie 分类名称和描述 |
| `consent.btn.*` | 所有按钮文案 |
| `consent.toast.*` | 保存成功提示 |
| `privacy.seo.*` | 隐私政策页 SEO |
| `privacy.content.*` | 隐私政策页正文各章节 |

---

## sitemap 新增条目

```xml
<url>
  <loc>https://toolboxnova.com/privacy</loc>
  <lastmod>2024-07-15</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.4</priority>
</url>
<url>
  <loc>https://toolboxnova.com/privacy?lang=en</loc>
  <lastmod>2024-07-15</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.3</priority>
</url>
<url>
  <loc>https://toolboxnova.com/privacy?lang=zh</loc>
  <lastmod>2024-07-15</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.3</priority>
</url>
```

---

## 设计风格定调

| 项目 | 规范 |
|---|---|
| 主色 | `--color-primary: #1a9b6c`（与站点一致） |
| 横幅背景 | `--color-surface: #1e1e2e`（深色，视觉隔离） |
| 文字色 | `--color-text: #f0f0f0` |
| 边框色 | `--color-border: rgba(255,255,255,0.1)` |
| 圆角 | `--radius-md: 12px`；按钮 `--radius-btn: 8px` |
| 阴影 | `--shadow-banner: 0 -4px 24px rgba(0,0,0,0.3)` |

**差异化设计亮点：**
1. **横幅从底部滑入**，不遮挡内容，动效 `translateY(100%) → 0`，300ms ease-out
2. **接受按钮使用主色高亮**，拒绝/自定义为幽灵按钮，视觉引导符合 GDPR"同等易用"要求
3. **自定义 Modal 使用 Toggle Switch** 而非 checkbox，现代感更强，禁用状态（必要 Cookie）锁定样式清晰
