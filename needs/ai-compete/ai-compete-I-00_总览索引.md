# ai-compete · 总览索引（I-00）

---

用户输入自己的网址 + 1～3 个竞品网址

后端用爬虫抓取页面内容（定价页、首页、功能页）

调用 Claude/GPT API 生成结构化对比报告

定价对比

核心卖点差异

目标用户定位

SWOT 分析

"你应该怎么做"的建议

## 产品架构图

```
用户入口 /ai/compete
        │
        ▼
  ┌─────────────────────────────────────┐
  │   输入区                             │
  │   ① 我的产品 URL / 描述              │
  │   ② 竞品列表（AI 推荐 ＋ 手动添加）  │
  │   ③ 分析维度勾选（默认全选）         │
  └────────────────┬────────────────────┘
                   │ POST /api/ai-compete/analyze
                   ▼
  ┌─────────────────────────────────────┐
  │   Go Handler（ai-compete.go）        │
  │   → 调用 Claude API (web_search)    │
  │   → 流式 SSE 返回 JSON 块           │
  └────────────────┬────────────────────┘
                   │ SSE Stream
                   ▼
  ┌─────────────────────────────────────────────────────────┐
  │   前端结果渲染引擎（ai-compete.js）                      │
  │                                                         │
  │   ┌─────────┐ ┌────────┐ ┌────────┐ ┌───────┐          │
  │   │ 营销策略 │ │产品特性 │ │定价模型 │ │目标受众│  …      │
  │   └────┬────┘ └───┬────┘ └───┬────┘ └───┬───┘          │
  │        └──────────┴──────────┴───────────┘              │
  │                   │  侧边栏广告                          │
  │            ┌──────┴──────┐                              │
  │            │ SWOT 矩阵卡 │                              │
  │            └──────┬──────┘                              │
  │                   ▼                                     │
  │         对比表格 / 导出 PDF / 复制链接                   │
  └─────────────────────────────────────────────────────────┘
```

---

## 竞品功能对标表

| 功能点 | Competely.ai | Crayon | 本次实现 | 差异化说明 |
|---|---|---|---|---|
| 产品 URL / 描述输入 | ✅ | ✅ | ✅ | 同时支持中文描述 |
| AI 自动发现竞品 | ✅ | ✅ | ✅ | Claude + web_search 实时发现 |
| 手动添加竞品 | ✅ | ✅ | ✅ | 最多 5 个竞品 |
| 营销策略分析 | ✅ | ✅ | ✅ | 含 UVP / 关键词 / 渠道 |
| 产品特性对比 | ✅ | ✅ | ✅ | 特性矩阵表格，有无标记 |
| 定价模型分析 | ✅ | ✅ | ✅ | 含定价梯度 / 免费试用策略 |
| 目标受众画像 | ✅ | ❌ | ✅ | 用户角色 / 行业 / 公司规模 |
| 用户口碑情感分析 | ✅ | ✅ | ✅ | G2/Capterra/App Store 要点 |
| SWOT 矩阵 | ✅ | ❌ | ✅ | 可视化卡片矩阵 |
| 公司基础信息 | ✅ | ✅ | ✅ | 融资/规模/成立年份 |
| 流式输出进度 | ❌（轮询） | ❌ | ✅ | SSE 实时展示各维度 |
| 多语言界面 | ❌ | ❌ | ✅ | zh/en/ja/ko/spa 5 种 |
| 导出 Markdown | ❌ | ❌ | ✅ | 一键复制全文 Markdown |
| 免费使用 | ❌（付费） | ❌（付费） | ✅ | 工具箱内免费 |

---

## Block 清单

| 文件 | 核心内容 | 预估工时 |
|---|---|---|
| ai-compete-I-00_总览索引.md | 架构图、竞品对标 | 0.5h |
| ai-compete-I-01_路由_i18n.md | Go路由、Handler（SSE流）、i18n | 4h |
| ai-compete-I-02_页面模板.md | HTML结构、CSS规范、输入/结果布局 | 3h |
| ai-compete-I-03_前端引擎.md | JS处理引擎、SSE接收、渲染逻辑 | 4h |
| ai-compete-I-04_结果展示.md | 结果UI（7大维度）、SWOT矩阵、导出 | 3h |
| **合计** | | **14.5h** |

---

## 路由规划

```
GET  /ai/compete                    主页
GET  /ai/compete?lang=zh            中文
GET  /ai/compete?lang=en            英文
GET  /ai/compete?lang=ja            日文
GET  /ai/compete?lang=ko            韩文
GET  /ai/compete?lang=spa           西班牙文
POST /api/ai-compete/analyze        竞品分析 API（SSE 流式返回）
POST /api/ai-compete/suggest        AI 推荐竞品 API（JSON 一次性返回）
```

---

## 前端依赖

| 库 | 用途 | CDN 地址 |
|---|---|---|
| marked.js 9.x | Markdown → HTML 渲染分析结果 | `https://cdnjs.cloudflare.com/ajax/libs/marked/9.1.6/marked.min.js` |
| DOMPurify 3.x | Markdown XSS 净化 | `https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.6/purify.min.js` |
| 原生 EventSource | SSE 接收 | 浏览器原生，无需 CDN |
| 原生 Fetch API | suggest 接口 | 浏览器原生，无需 CDN |

> ⚠️ 无需 Chart.js / JSZip / Leaflet，本工具为文本分析型，不处理文件。

---

## i18n Key 前缀清单

```
ai-compete.seo.*          SEO 标题/描述/关键词
ai-compete.hero.*         Hero 区文案
ai-compete.input.*        输入区文案（产品URL、竞品列表、分析按钮）
ai-compete.suggest.*      AI推荐竞品相关文案
ai-compete.dimension.*    七大分析维度标签（marketing/product/pricing/audience/sentiment/company/swot）
ai-compete.result.*       结果区文案（标题、导出按钮）
ai-compete.error.*        错误提示文案
ai-compete.feature.*      特性卡片文案（3条）
ai-compete.faq.*          FAQ 问答（q1/a1 … q5/a5）
ai-compete.btn.*          按钮文案
ai-compete.nav.name       导航和主页卡片名称
ai-compete.nav.desc       主页卡片描述
ai-compete.status.*       流式分析状态提示（loading/analyzing/done）
```

---

## sitemap 新增条目

```xml
<url>
  <loc>https://toolboxnova.com/ai/compete</loc>
  <lastmod>2025-11-14</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
```

---

## 设计风格定调

- **主色**：靛紫蓝 `#6366f1`（AI 感强，区别于开发工具绿、隐私工具蓝紫）
- **强调色**：琥珀橙 `#f59e0b`（SWOT 矩阵机遇/威胁 badge）
- **背景色**：继承 `var(--color-bg)` / 卡片用 `var(--color-surface)`
- **边框色**：`var(--color-border)` + 维度卡片顶部带主色 3px 色条
- **差异化亮点**：
  1. **流式渐进输出**：SSE 实时推送，每个维度分析完成后立即渲染，而非等待全部完成
  2. **SWOT 可视化矩阵**：四象限卡片布局，配色区分优势（绿）/劣势（红）/机遇（橙）/威胁（灰）
  3. **维度手风琴 + 竞品对比列**：竞品名横向排列，维度纵向展开，一屏内完成核心比对
