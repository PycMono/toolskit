<!-- ai-humanizer-I-00_总览索引.md -->

# AI Humanizer — 总览索引文档

> 工具标识符：`ai-humanizer`
> 路由：`/ai/humanizer`
> 主色调：紫罗兰 `#6c47ff`（区别竞品蓝/绿系，传递「高级感 + 智能」）
> 域名：toolboxnova.com
> 技术栈：Go（Gin + Go Template）+ 纯前端处理 + CDN 依赖

---

## 一、产品架构图

```
用户访问 /ai/humanizer
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│                     Landing Page                         │
│  Hero区 → 功能模式选择 → 输入区 → 配置面板             │
└─────────────────────────────────────────────────────────┘
        │
        ▼ 粘贴/上传文本（TXT/PDF/DOCX 拖拽解析）
        │
┌─────────────────────────────────────────────────────────┐
│              前端处理引擎（strategy-engine.js）          │
│                                                          │
│  ┌─────────────┐   ┌──────────────────────────────────┐ │
│  │ 模式选择器   │   │  AI Factory（策略工厂）           │ │
│  │ Basic        │──▶│  ┌──────────┐  ┌─────────────┐ │ │
│  │ Standard     │   │  │OpenAI 策略│  │Anthropic 策略│ │ │
│  │ Aggressive   │   │  └──────────┘  └─────────────┘ │ │
│  │ Academic     │   │  ┌──────────┐  ┌─────────────┐ │ │
│  │ Creative     │   │  │Google 策略│  │DeepSeek 策略│ │ │
│  └─────────────┘   │  └──────────┘  └─────────────┘ │ │
│                     └──────────────────────────────────┘ │
│                                   │                      │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              后端 Go API (/api/humanize)             │ │
│  │  Gin Router → 策略路由器 → AI Provider Factory      │ │
│  │  ┌──────────────────────────────────────────────┐  │ │
│  │  │  prompts/humanize-basic.md                   │  │ │
│  │  │  prompts/humanize-aggressive.md              │  │ │
│  │  │  prompts/humanize-academic.md                │  │ │
│  │  │  prompts/humanize-creative.md                │  │ │
│  │  │  prompts/detect-ai.md                        │  │ │
│  │  └──────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
        │
        ▼ 流式返回 / SSE
        │
┌─────────────────────────────────────────────────────────┐
│                    结果展示区                            │
│  ┌─────────────────┐    ┌─────────────────────────────┐ │
│  │  原文输入面板    │    │  人性化输出面板              │ │
│  │  · 字数统计      │    │  · 实时流式输出              │ │
│  │  · AI检测分数    │    │  · AI检测分数（处理后）      │ │
│  │  · 高亮AI片段    │    │  · 可读性评分                │ │
│  └─────────────────┘    │  · 单词同义替换               │ │
│                          │  · 复制/下载按钮              │ │
│                          └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│  下载操作：复制到剪贴板 / 下载 .txt / 下载 .docx        │
└─────────────────────────────────────────────────────────┘
```

---

## 二、竞品功能对标表

| 功能点 | humanizeai.pro | aihumanize.io | humanizeai.io | quillbot | grammarly | **本次实现** | 差异化说明 |
|--------|:--------------:|:-------------:|:-------------:|:--------:|:---------:|:------------:|-----------|
| 基础人性化模式 | ✅ | ✅ | ✅ Basic | ✅ Basic | ✅ | ✅ Basic | — |
| 高级人性化模式 | ❌ | ✅ Aggressive | ✅ Aggressive/Enhanced | ✅ Premium | ✅ Premium | ✅ **全免费** | 竞品锁付费，我们全开放 |
| 学术写作模式 | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ Academic | 针对论文优化，保留引用格式 |
| 创意写作模式 | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ **Creative** | **差异化优势：全球首创创意模式** |
| 商务邮件模式 | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ Business | — |
| 双栏对比布局 | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ **增强版** | 左右分栏+实时AI分数对比 |
| 内置AI检测 | ✅（单独页）| ✅ | ✅ | ✅（外链）| ✅ | ✅ **集成到主界面** | 检测结果可视化图表（竞品无） |
| AI检测分数可视化 | ❌ | 文字显示 | 文字显示 | ❌ | ❌ | ✅ **圆形进度图表** | **差异化优势** |
| 文档上传 PDF/DOCX | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | 竞品大多不支持 |
| 同义词替换交互 | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ **增强版** | 右键点击任意词弹出同义词面板 |
| 流式输出（SSE） | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ **全球首家** | 打字机效果，体验碾压竞品 |
| 可读性评分（Flesch） | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | — |
| 语调选择器 | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ **Formal/Casual/Neutral** | — |
| 多语言支持 | ❌ | 有限 | ❌ | ✅ 7种 | ✅ 6种 | ✅ **12种语言** | 支持中/英/日/韩/西/法/德/葡/意/俄/阿/印 |
| 历史记录 | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ **LocalStorage本地** | 无需注册，本地保存最近10条 |
| 字数统计实时显示 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| 深色模式 | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | — |
| 多 AI 提供商后端 | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ **策略+工厂模式** | OpenAI/Anthropic/Google/DeepSeek 可切换 |
| 提示词外置管理 | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ **.md 文件管理** | 运维人员无需改代码即可调优 prompt |
| Captcha 验证 | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ **可选开关** | 后台配置项，可热切换 |
| 免费无限字数 | ✅ | 2000词/次 | 有限制 | 500词/次 | 有限制 | ✅ **单次10000词** | 单次处理上限大幅领先 |

---

## 三、Block 清单

| 文件名 | 核心内容 | 预估工时 |
|--------|---------|---------|
| `ai-humanizer-I-00_总览索引.md` | 架构图、竞品对标、Block清单、路由、依赖、i18n前缀、设计定调 | 2h |
| `ai-humanizer-I-01_路由_SEO_i18n_sitemap_ads_ga.md` | Go路由、SEO head模板、5语言i18n全量Key、广告位、GA事件 | 4h |
| `ai-humanizer-I-02_首页Landing_上传区.md` | HTML骨架、CSS规范、双栏布局、模式选择、配置面板 | 6h |
| `ai-humanizer-I-03_前端处理引擎.md` | strategy-engine.js架构、AI Factory、SSE流式、检测引擎、同义词 | 8h |
| `ai-humanizer-I-04_结果区UI.md` | 双栏结果UI、AI分数圆形图、同义词弹层、历史记录、深色模式 | 5h |
| `ai-humanizer-I-05_后端Go引擎.md` | Gin路由、策略模式+工厂模式、prompt加载器、SSE handler、多provider | 8h |
| `prompts/humanize-basic.md` | Basic模式人性化提示词 | 1h |
| `prompts/humanize-standard.md` | Standard模式提示词 | 1h |
| `prompts/humanize-aggressive.md` | Aggressive模式提示词 | 1h |
| `prompts/humanize-academic.md` | Academic学术模式提示词 | 1h |
| `prompts/humanize-creative.md` | Creative创意模式提示词 | 1h |
| `prompts/humanize-business.md` | Business商务模式提示词 | 1h |
| `prompts/detect-ai.md` | AI内容检测提示词 | 1h |

**总计工时：约 40 小时**

---

## 四、路由规划

```
主路由:
  GET  /ai/humanizer                    → 英文默认页
  GET  /ai/humanizer?lang=zh            → 中文页
  GET  /ai/humanizer?lang=en            → 英文页
  GET  /ai/humanizer?lang=ja            → 日文页
  GET  /ai/humanizer?lang=ko            → 韩文页
  GET  /ai/humanizer?lang=es            → 西班牙文页

API路由（后端 Gin）:
  POST /api/ai/humanize                 → 人性化处理（支持SSE流式）
  POST /api/ai/detect                   → AI检测
  GET  /api/ai/humanize/stream          → SSE 流式输出

检测子页（可选扩展）:
  GET  /ai/detector                     → AI 检测独立页（仿humanizeai.pro/detector）

注：无独立 API 路由对外暴露，全部经后端代理调用 AI 服务
```

---

## 五、前端依赖（CDN）

```html
<!-- 文档解析 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>

<!-- 文档下载 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/docx/8.2.2/docx.umd.min.js"></script>

<!-- 图表（AI分数可视化）-->
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>

<!-- Toast / 通知 -->
<!-- 使用原生自实现，无需引入 -->

<!-- 图标 -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

<!-- 可选：hCaptcha（若 CaptchaEnabled=true）-->
<script src="https://js.hcaptcha.com/1/api.js" async defer></script>
```

---

## 六、i18n Key 前缀清单

| 命名空间前缀 | 说明 | 示例 Key |
|------------|-----|---------|
| `seo.*` | SEO 元数据（title/desc/keywords） | `seo.title`, `seo.desc` |
| `hero.*` | Hero 区文案 | `hero.title`, `hero.subtitle`, `hero.badge.*` |
| `input.*` | 输入区文案 | `input.placeholder`, `input.wordcount`, `input.upload` |
| `mode.*` | 模式选择器 | `mode.basic`, `mode.standard`, `mode.aggressive`, `mode.academic`, `mode.creative`, `mode.business` |
| `tone.*` | 语调选择器 | `tone.formal`, `tone.casual`, `tone.neutral` |
| `options.*` | 选项面板 | `options.language`, `options.tone`, `options.preserve` |
| `action.*` | 操作按钮 | `action.humanize`, `action.detect`, `action.clear`, `action.copy`, `action.download` |
| `status.*` | 处理状态 | `status.processing`, `status.done`, `status.error`, `status.detecting` |
| `result.*` | 结果区文案 | `result.aiscore`, `result.humanscore`, `result.readability`, `result.wordcount` |
| `detect.*` | 检测结果 | `detect.ai_content`, `detect.human_content`, `detect.mixed` |
| `history.*` | 历史记录 | `history.title`, `history.empty`, `history.clear` |
| `synonym.*` | 同义词面板 | `synonym.title`, `synonym.apply` |
| `error.*` | 错误信息 | `error.too_long`, `error.api_fail`, `error.empty_input` |
| `feature.*` | 特性卡片 | `feature.privacy`, `feature.speed`, `feature.free`, `feature.multimode` |
| `faq.*` | FAQ 问答 | `faq.q1`, `faq.a1` ... `faq.q8`, `faq.a8` |
| `footer.*` | 底部文案 | `footer.tagline` |

---

## 七、sitemap 新增条目

```xml
<url>
  <loc>https://toolboxnova.com/ai/humanizer</loc>
  <lastmod>2025-11-15</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.95</priority>
</url>
<url>
  <loc>https://toolboxnova.com/ai/humanizer?lang=zh</loc>
  <lastmod>2025-11-15</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.85</priority>
</url>
<url>
  <loc>https://toolboxnova.com/ai/humanizer?lang=ja</loc>
  <lastmod>2025-11-15</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.80</priority>
</url>
<url>
  <loc>https://toolboxnova.com/ai/humanizer?lang=ko</loc>
  <lastmod>2025-11-15</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.80</priority>
</url>
<url>
  <loc>https://toolboxnova.com/ai/detector</loc>
  <lastmod>2024-06-20</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.75</priority>
</url>
```

---

## 八、设计风格定调

### 色彩系统

```css
/* 主色系 —— 紫罗兰智能感 */
--primary:        #6c47ff;   /* 主色：深紫罗兰 */
--primary-light:  #8b6dff;   /* 亮紫 */
--primary-dark:   #4d2fe0;   /* 深紫 */
--primary-glow:   rgba(108, 71, 255, 0.18); /* 发光效果 */

/* 渐变 */
--gradient-primary: linear-gradient(135deg, #6c47ff 0%, #a855f7 100%);
--gradient-hero:    linear-gradient(160deg, #0f0a1e 0%, #1a1035 50%, #0d1b2a 100%);

/* AI 分数颜色 */
--score-danger:  #ef4444;   /* 高AI率：红 */
--score-warning: #f59e0b;   /* 中AI率：橙 */
--score-good:    #22c55e;   /* 低AI率（人性化成功）：绿 */

/* 中性色 */
--bg-primary:    #0f0e17;   /* 深色背景 */
--bg-surface:    #1a1830;   /* 卡片背景 */
--bg-elevated:   #252340;   /* 悬浮卡片 */
--border:        rgba(255,255,255,0.08);
--text-primary:  #f0eeff;
--text-secondary:#a89fd8;
--text-muted:    #6b63a1;

/* 浅色模式镜像 */
--bg-primary-light:  #faf9ff;
--bg-surface-light:  #ffffff;
--bg-elevated-light: #f0eeff;
--border-light:      rgba(108, 71, 255, 0.15);
--text-primary-light:#1a0a4e;
```

### 布局风格

- **Hero 区**：深色宇宙渐变背景 + 浮动粒子效果（CSS only，无JS），标题使用渐变文字裁切（`background-clip: text`）
- **主功能区**：左右双栏（50/50），圆角 `16px`，内嵌 glass-morphism 效果
- **模式选择器**：横向滚动 pill 组，选中态发光描边
- **输入/输出面板**：等高 `min-height: 420px`，支持自由拉伸
- **AI 分数**：圆形甜甜圈图表（Chart.js），动画从0分增长到实际分数
- **流式输出**：光标闪烁打字机效果，每个字符淡入

### 三大差异化设计亮点

1. **「Before vs After AI Score」双图表**：输入区和输出区各一个圆形AI分数图表，可视化对比，竞品均无此设计
2. **流式打字机输出**：SSE技术实现逐字符流式输出，用户看到文字「生长」出来的过程，体验远超竞品
3. **暗色宇宙主题 + 粒子背景**：整体设计感碾压所有竞品（均为白色平淡布局），高端感突出，提升用户信任度
