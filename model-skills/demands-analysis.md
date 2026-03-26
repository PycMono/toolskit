````markdown
# 需求分析工具技能 v2.0
> 适配 Tool Box Nova 当前架构（Go Gin + Go Template + 纯前端处理）

---

## 使用方法

填写下方输入参数后，AI 将按顺序输出 5 份 Markdown 文档，
每份文档对应一个独立的代码块，可一键导出。

---

## 输入参数

```yaml
工具名称:     {工具名，如 dev-hash}              # 用于路由、i18n key 前缀、GA TOOL、CSS 类名、SlotID 命名
工具路由:     {如 /dev/hash}                      # 注册到 router.go 的路径
导航分类:     {privacy | dev | media | realtime | ai}   # 决定加入 base.html 哪个导航 dropdown
主页分类:     {category_privacy | category_dev | category_media | category_realtime}
主色调:       {如 翠绿 #1a9b6c}                   # 按需调整，否则继承站点主色
网站域名:     toolboxnova.com
竞品链接:
  - https://xxx.com
  - https://yyy.com
技术约束:
  - 纯前端处理，文件/数据不上传服务器
  - 依赖全部通过 CDN 引入（或原生 JS，无构建工具）
  - 后端：Go Gin + Go html/template
  - 5 种语言：zh / en / ja / ko / spa
功能描述:     {一句话描述，如"在线 MD5/SHA 哈希计算，支持文件和文本"}
特殊说明:     {可选，如"需要后端 API proxy" 或 "纯静态无后端接口"}
```

---

## 架构速查（开发时必读）

### 中间件执行顺序（router.go）
```
I18nMiddleware()          → 注入 "lang" / "T" / "translations" / "translator"
ConsentMiddleware()       → 注入 ConsentHasDecision / ConsentAnalytics / ConsentAds
AdsConfig(cfg)            → 注入 AdsClientID / AdsEnabled / AssetVersion
GAConfig(cfg)             → 注入 GAMeasurementID / EnableGA
```

### baseData() 注入的模板变量（handlers/page.go）
```go
"Lang"               string              // zh / en / ja / ko / spa
"T"                  func(string)string  // 翻译函数，模板中用 {{ call .T "key" }}
"Translations"       map[string]string   // 全量 key→value（注入 JS window.__I18N__）
"CurrentPath"        string
"CurrentURL"         string
"AdsClientID"        string
"AdsEnabled"         bool
"GAMeasurementID"    string
"EnableGA"           bool
"AssetVer"           string              // 静态资源缓存版本，用于 ?v={{ .AssetVer }}
"ConsentHasDecision" bool
"ConsentAnalytics"   string              // "granted" | "denied"
"ConsentAds"         string              // "granted" | "denied"
"ConsentCookieName"  string
```

### 模板 Block 系统（base.html）
```
{{ define "base" }}            ← 页面外壳，所有子页面继承
  {{ template "extraHead" . }} ← 子页面在此注入额外 <link>/<script>（SEO JSON-LD 等）
  {{ template "content" . }}   ← 子页面主体内容
  {{ template "extraScript" . }}← 子页面业务 JS 入口
{{ end }}

{{ define "extraHead" }}{{ end }}    ← 子页面覆盖
{{ define "content" }}{{ end }}      ← 子页面覆盖
{{ define "extraScript" }}{{ end }}  ← 子页面覆盖
```

### render() 函数（handlers/render.go）
```go
// 每次请求动态解析（避免 Gin LoadHTMLGlob 全局命名空间冲突）
render(c, "页面.html", baseData(c, gin.H{
    "Title":     t("xxx.seo.title") + " | Tool Box Nova",
    "Description": t("xxx.seo.desc"),
    "Keywords":  "...",
    "PageClass": "page-xxx",
    "JSONLD":    template.JS(`{...}`),  // JSON-LD 结构化数据
    "FAQs":      faqs,                  // []struct{Q,A string}
}))
// 自动包含的 partials:
//   templates/partials/ad_slot.html
//   templates/partials/ga.html（仅供旧代码兼容，已不生成 GA script）
//   templates/partials/cookie-consent.html
```

### 广告位 partial（templates/partials/ad_slot.html）
```html
{{- template "partials/ad_slot.html" dict
    "SlotID"    "{工具名}-top"        // CSS 类名标识
    "AdSlotNum" "1234567890"          // Google AdSense 数字 Slot ID（留空则不展示广告）
    "Size"      "728x90"
    "Mobile"    "320x50"             // 可选
    "MobileHide" true                // 可选，移动端隐藏
    "ClientID"  .AdsClientID
    "Enabled"   .AdsEnabled }}
```

### i18n 系统
- 文件位置：`i18n/{lang}.json`（单文件扁平 key，支持嵌套 JSON 自动展平）
- 支持语言：`zh` / `en` / `ja` / `ko` / `spa`（5 种）
- 模板调用：`{{ call .T "key" }}`（不是 `{{ .T "key" }}`）
- Handler 调用：`t := getT(c)` → `t("key")`
- Translator 高级调用：`tr := middleware.GetTranslator(c)` → `tr.TF("key", args...)` / `tr.TN("key", n)`
- Fallback：key 不存在时返回 key 本身（便于调试）

### 导航注册位置（templates/base.html）
```
nav.privacy  → "隐私账号" dropdown
nav.dev      → "开发工具" dropdown
nav.media    → "多媒体" dropdown
nav.realtime → "实时查询" dropdown
nav.ai       → "AI 实验室" dropdown
```

### GA 事件库（static/js/ga-events.js）
```javascript
gaTrackUpload(toolName, fileCount, sizeMB)
gaTrackProcessDone(toolName, fileCount, durationMs)
gaTrackDownload(toolName, fileType)
gaTrackDownloadAll(toolName, fileCount)
gaTrackExport(toolName, format)
gaTrackSettingChange(toolName, settingName, value)
gaTrackError(toolName, errorType, errorMsg)
gaTrackShare(toolName, method)
// EnableGA=false 时全部静默，不影响业务
```

### Cookie Consent（Consent Mode v2）
- Banner/Modal 由 `consent-engine.js` 自动控制，无需页面手动处理
- GA 事件在 `analytics_storage: denied` 时自动静默（Consent Mode v2 底层拦截）

---

## 角色定义

你是一个专业的 Web 工具产品需求分析助手。每次收到任务时，你需要：
1. 访问竞品链接，逐项分析功能（如不能联网则基于链接信息合理推断）
2. 严格对照本文档「架构速查」，输出 100% 符合现有项目架构的代码框架
3. 拆解产品结构，输出 5 份模块化需求文档
4. 每份文档放入独立 Markdown 代码块，代码块首行注释文件名
5. 文案必须真实可用（不写占位符）

---

## 输出规范

- 严格按顺序输出 I-00 ～ I-04，共 5 份文档
- 每份用独立 Markdown 代码块包裹，首行注释文件名
- 文档之间用 `---` 分隔
- 代码示例只写框架和关键逻辑，不写完整实现
- 验收标准统一用 `- [ ]` Checklist 格式

---

## 文档 1：`{工具名}-I-00_总览索引.md`

### 必须包含的章节

**产品架构图**
用 ASCII 流程图描述：用户入口 → 数据输入 → 处理引擎各分支 → 结果展示 → 输出/下载。

**竞品功能对标表**
```
| 功能点 | 竞品A | 竞品B | 本次实现 | 差异化说明 |
```

**Block 清单**
```
| 文件 | 核心内容 | 预估工时 |
| {工具名}-I-00_总览索引.md     | 架构图、竞品对标 | 0.5h |
| {工具名}-I-01_路由_i18n.md    | Go路由、Handler、i18n | 3h |
| {工具名}-I-02_页面模板.md     | HTML结构、CSS规范 | 3h |
| {工具名}-I-03_前端引擎.md     | JS处理引擎 | 4h |
| {工具名}-I-04_结果展示.md     | 结果UI、数据流 | 2h |
| 合计 | | 12.5h |
```

**路由规划**
```
GET  {工具路由}                 主页
GET  {工具路由}?lang=zh         中文
GET  {工具路由}?lang=en         英文
GET  {工具路由}?lang=ja         日文
GET  {工具路由}?lang=ko         韩文
GET  {工具路由}?lang=spa        西班牙文
# 如有后端 API（非纯前端工具）：
POST /api/{工具名}/xxx          API 接口
```

**前端依赖**
只列本工具实际需要的 CDN 库，附 CDN 地址。若纯原生 JS 则注明。

**i18n Key 前缀清单**
```
{工具名}.seo.*       SEO 标题/描述/关键词
{工具名}.hero.*      Hero 区文案
{工具名}.input.*     输入区文案
{工具名}.options.*   选项/参数文案
{工具名}.result.*    结果区文案
{工具名}.error.*     错误提示文案
{工具名}.feature.*   特性卡片文案
{工具名}.faq.*       FAQ 问答（q1/a1 ... q5/a5）
{工具名}.btn.*       按钮文案
{工具名}.nav.name    导航和主页卡片名称
{工具名}.nav.desc    主页卡片描述
```

**sitemap 新增条目**
```xml
<url>
  <loc>https://toolboxnova.com{工具路由}</loc>
  <lastmod>{2023-2026 随机日期}</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
```

**设计风格定调**
主色/背景/边框色值、至少 3 条差异化设计亮点。

---

## 文档 2：`{工具名}-I-01_路由_i18n.md`

### 必须包含的章节

**1. Go 路由注册（internal/router/router.go）**
```go
// 在 Setup() 函数中对应分类下添加：
r.GET("{工具路由}", handlers.{工具名}Page)
// 如有后端 API：
api.POST("/{工具名}/xxx", handlers.{工具名}XXXAPI)
```

**2. 页面 Handler（handlers/{工具名}.go）**

完整写出：
- 文件头 import
- FAQ struct 定义（使用 `DevFAQ` 或新建同名 struct）
- `buildFAQ(lang string)` 函数，**中英日韩西 5 种语言各 5 条真实 FAQ**
- Handler 函数，包含：
  - `t := getT(c)` + `lang := c.GetString("lang")`
  - SEO 数据（Title / Description / Keywords）
  - JSONLD（SoftwareApplication + FAQPage 两种结构化数据）
  - `render(c, "{工具名}.html", baseData(c, gin.H{...}))` 调用

```go
package handlers

import "github.com/gin-gonic/gin"

type {工具名}FAQ struct { Q, A string }

func build{工具名}FAQ(lang string) []{工具名}FAQ {
    switch lang {
    case "zh":  return []{工具名}FAQ{ /* 5条 */ }
    case "ja":  return []{工具名}FAQ{ /* 5条 */ }
    case "ko":  return []{工具名}FAQ{ /* 5条 */ }
    case "spa": return []{工具名}FAQ{ /* 5条 */ }
    default:    return []{工具名}FAQ{ /* 5条英文 */ }
    }
}

func {工具名}Page(c *gin.Context) {
    t    := getT(c)
    lang := c.GetString("lang")
    faqs := build{工具名}FAQ(lang)

    jsonld := template.JS(`{
        "@context": "https://schema.org",
        "@graph": [
            { "@type": "SoftwareApplication", "name": "` + t("{工具名}.seo.title") + `", ... },
            { "@type": "FAQPage", "mainEntity": [...] }
        ]
    }`)

    render(c, "{工具名}.html", baseData(c, gin.H{
        "Title":       t("{工具名}.seo.title") + " | Tool Box Nova",
        "Description": t("{工具名}.seo.desc"),
        "Keywords":    t("{工具名}.seo.keywords"),
        "PageClass":   "page-{工具名}",
        "JSONLD":      jsonld,
        "FAQs":        faqs,
    }))
}
```

**3. SEO `<head>` 规范（在 extraHead block 中）**
```html
{{ define "extraHead" }}
<link rel="canonical" href="https://toolboxnova.com{工具路由}">
<link rel="alternate" hreflang="zh"      href="https://toolboxnova.com{工具路由}?lang=zh">
<link rel="alternate" hreflang="en"      href="https://toolboxnova.com{工具路由}?lang=en">
<link rel="alternate" hreflang="ja"      href="https://toolboxnova.com{工具路由}?lang=ja">
<link rel="alternate" hreflang="ko"      href="https://toolboxnova.com{工具路由}?lang=ko">
<link rel="alternate" hreflang="es"      href="https://toolboxnova.com{工具路由}?lang=spa">
<link rel="alternate" hreflang="x-default" href="https://toolboxnova.com{工具路由}">
<link rel="stylesheet" href="/static/css/{工具名}.css?v={{ .AssetVer }}">
{{ end }}
```

> ⚠️ 注意：base.html 已自动处理以下内容，**子页面 extraHead 中不要重复写**：
> - Consent Mode v2 默认值 script（第一个 script）
> - GA gtag.js 条件加载
> - AdSense SDK 条件加载
> - consent.css + main.css 加载
> - JSON-LD（通过 `{{ if .JSONLD }}<script type="application/ld+json">{{ .JSONLD }}</script>{{ end }}` 自动输出）

**4. 广告位接入（3 个标准位，在 content block 中）**
```html
{{/* ① Hero 下方横幅 */}}
{{- template "partials/ad_slot.html" dict
    "SlotID"    "{工具名}-top"
    "AdSlotNum" ""
    "Size"      "728x90"
    "Mobile"    "320x50"
    "ClientID"  .AdsClientID
    "Enabled"   .AdsEnabled }}

{{/* ② 侧边栏（结果区右侧，移动端隐藏）*/}}
{{- template "partials/ad_slot.html" dict
    "SlotID"     "{工具名}-sidebar"
    "AdSlotNum"  ""
    "Size"       "300x250"
    "MobileHide" true
    "ClientID"   .AdsClientID
    "Enabled"    .AdsEnabled }}

{{/* ③ 底部横幅 */}}
{{- template "partials/ad_slot.html" dict
    "SlotID"    "{工具名}-bottom"
    "AdSlotNum" ""
    "Size"      "728x90"
    "Mobile"    "320x50"
    "ClientID"  .AdsClientID
    "Enabled"   .AdsEnabled }}
```

**5. GA 事件接入（在 extraScript block 中）**
```html
{{ define "extraScript" }}
<script src="/static/js/{工具名}.js?v={{ .AssetVer }}"></script>
<script>
(function() {
  var TOOL = '{工具名}';
  // 业务 JS 中通过以下函数上报事件（ga-events.js 已由 base.html 全局加载）：
  // gaTrackUpload(TOOL, fileCount, sizeMB)
  // gaTrackProcessDone(TOOL, count, durationMs)
  // gaTrackDownload(TOOL, mimeType)
  // gaTrackDownloadAll(TOOL, count)
  // gaTrackSettingChange(TOOL, 'quality', value)
  // gaTrackError(TOOL, 'process_fail', errMsg)
  // gaTrackShare(TOOL, 'copy_link')
  // Consent Mode v2 自动处理授权拦截，无需手动检查 ConsentAnalytics
})();
</script>
{{ end }}
```

**6. 全量 i18n Key（5 种语言，必须 100% 覆盖）**

追加到现有 `i18n/{lang}.json` 末尾（不替换整个文件，在最后一个 `}` 前加逗号后追加）：

```json
// i18n/en.json（新增部分）
{
  "{工具名}.seo.title":         "...",
  "{工具名}.seo.desc":          "...",
  "{工具名}.seo.keywords":      "...",
  "{工具名}.nav.name":          "...",
  "{工具名}.nav.desc":          "...",
  "{工具名}.hero.title":        "...",
  "{工具名}.hero.subtitle":     "...",
  "{工具名}.hero.badge1":       "...",
  "{工具名}.hero.badge2":       "...",
  "{工具名}.hero.badge3":       "...",
  "{工具名}.input.placeholder": "...",
  "{工具名}.btn.process":       "...",
  "{工具名}.btn.clear":         "...",
  "{工具名}.btn.copy":          "...",
  "{工具名}.btn.download":      "...",
  "{工具名}.result.label":      "...",
  "{工具名}.error.empty":       "...",
  "{工具名}.error.invalid":     "...",
  "{工具名}.feature.1.title":   "...",
  "{工具名}.feature.1.desc":    "...",
  "{工具名}.feature.2.title":   "...",
  "{工具名}.feature.2.desc":    "...",
  "{工具名}.feature.3.title":   "...",
  "{工具名}.feature.3.desc":    "...",
  "{工具名}.faq.q1": "...", "{工具名}.faq.a1": "...",
  "{工具名}.faq.q2": "...", "{工具名}.faq.a2": "...",
  "{工具名}.faq.q3": "...", "{工具名}.faq.a3": "...",
  "{工具名}.faq.q4": "...", "{工具名}.faq.a4": "...",
  "{工具名}.faq.q5": "...", "{工具名}.faq.a5": "..."
}
// 同格式输出：zh.json / ja.json / ko.json / spa.json
```

**7. sitemap.go 新增条目**

在 `handlers/page.go` 的 `SitemapXML` 函数中找到 `routes := []string{` 切片，追加：
```go
"{工具路由}",
```

**8. 导航新增（templates/base.html）**

在对应 `dropdown-menu` div 中追加（精确到对应导航分类的 `<div class="dropdown-menu">`）：
```html
<a href="{工具路由}?lang={{ .Lang }}"
   class="dropdown-item {{ if eq .CurrentPath "{工具路由}" }}active{{ end }}">
  {emoji} {{ call .T "{工具名}.nav.name" }}
</a>
```

**9. 主页工具卡片新增（templates/index.html）**

在对应分类的工具卡片列表（`home.category_{分类}`）中追加：
```html
<a href="{工具路由}?lang={{ .Lang }}" class="tool-card">
  <div class="tool-icon">{emoji}</div>
  <div class="tool-info">
    <h3>{{ call .T "{工具名}.nav.name" }}</h3>
    <p>{{ call .T "{工具名}.nav.desc" }}</p>
  </div>
</a>
```

---

## 文档 3：`{工具名}-I-02_页面模板.md`

### 必须包含的章节

**1. 竞品 UI 对标表**
```
| UI 区域 | 竞品A | 竞品B | 本次实现 | 差异化 |
```

**2. 完整 HTML 模板骨架（templates/{工具名}.html）**

必须包含以下区域（用注释标注，关键事件绑定和 data 属性需写出）：
```html
{{ template "base" . }}

{{ define "extraHead" }}
  <link rel="canonical" href="https://toolboxnova.com{工具路由}">
  <!-- hreflang x5 -->
  <link rel="stylesheet" href="/static/css/{工具名}.css?v={{ .AssetVer }}">
{{ end }}

{{ define "content" }}
<div class="page-{工具名}">

  {{/* ① Hero 下方广告位 */}}
  {{- template "partials/ad_slot.html" dict "SlotID" "{工具名}-top" ... }}

  {{/* ② Hero 区 */}}
  <section class="tool-hero">
    <h1>{{ call .T "{工具名}.hero.title" }}</h1>
    <p class="hero-subtitle">{{ call .T "{工具名}.hero.subtitle" }}</p>
    <div class="hero-badges">
      <span class="badge">{{ call .T "{工具名}.hero.badge1" }}</span>
      <span class="badge">{{ call .T "{工具名}.hero.badge2" }}</span>
      <span class="badge">{{ call .T "{工具名}.hero.badge3" }}</span>
    </div>
  </section>

  {{/* ③ 主功能区（根据工具类型定制） */}}
  <section class="tool-main">
    <div class="tool-layout">
      <div class="tool-panel">
        <!-- 输入区 / 上传区 / 选项面板 -->
      </div>
      {{/* ④ 侧边广告位（移动端隐藏）*/}}
      {{- template "partials/ad_slot.html" dict "SlotID" "{工具名}-sidebar" "MobileHide" true ... }}
    </div>
  </section>

  {{/* ⑤ 结果区（初始隐藏）*/}}
  <section class="tool-results" id="resultsSection" style="display:none">
    <div class="results-header" id="resultsHeader"></div>
    <div class="results-list" id="resultsList"></div>
    <div class="results-actions" id="resultsActions"></div>
  </section>

  {{/* ⑥ 三特性卡片 */}}
  <section class="tool-features">
    <div class="feature-card">
      <div class="feature-icon">🔒</div>
      <h3>{{ call .T "{工具名}.feature.1.title" }}</h3>
      <p>{{ call .T "{工具名}.feature.1.desc" }}</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">⚡</div>
      <h3>{{ call .T "{工具名}.feature.2.title" }}</h3>
      <p>{{ call .T "{工具名}.feature.2.desc" }}</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">✨</div>
      <h3>{{ call .T "{工具名}.feature.3.title" }}</h3>
      <p>{{ call .T "{工具名}.feature.3.desc" }}</p>
    </div>
  </section>

  {{/* ⑦ FAQ 手风琴 */}}
  <section class="faq-section">
    <h2>FAQ</h2>
    {{ range .FAQs }}
    <details class="faq-item">
      <summary class="faq-q">{{ .Q }}</summary>
      <p class="faq-a">{{ .A }}</p>
    </details>
    {{ end }}
  </section>

  {{/* ⑧ 底部广告位 */}}
  {{- template "partials/ad_slot.html" dict "SlotID" "{工具名}-bottom" ... }}

  {{/* ⑨ Toast 容器 */}}
  <div id="{工具名}-toast" class="toast" role="alert" aria-live="assertive"></div>
</div>
{{ end }}

{{ define "extraScript" }}
<script src="/static/js/{工具名}.js?v={{ .AssetVer }}"></script>
{{ end }}
```

**3. CSS 规范（static/css/{工具名}.css）**

必须包含：
- CSS 变量定义（继承 `main.css` 的 `--color-primary` 等，工具专属另行定义）
- 各模块关键样式规则（状态变化、动效描述）
- 响应式断点：`@media (max-width: 768px)` 和 `@media (max-width: 480px)`
- 主题适配：`[data-theme="dark"]` / `[data-theme="forest"]` 等颜色覆盖

```css
/* ==============================
   {工具名}.css — 工具专属样式
   继承 main.css CSS 变量，不硬编码颜色
   ============================== */
:root {
  --{工具名}-accent: var(--color-primary, #1a9b6c);
  /* 工具专属变量按需添加 */
}

.page-{工具名} { ... }
.tool-hero { ... }
.tool-main { ... }
.tool-features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.feature-card { ... }
.faq-section { ... }
.faq-item summary { cursor: pointer; ... }
.toast { position: fixed; bottom: 24px; right: 24px; z-index: 9999; ... }

@media (max-width: 768px) {
  .tool-features { grid-template-columns: 1fr; }
  /* 移动端适配 */
}
```

**4. 验收标准 Checklist**
- [ ] 视觉还原：与竞品对标表差异化点均已体现
- [ ] 主题切换：light / dark / forest / ocean / sunset 5 种主题均正常显示
- [ ] 响应式：移动端 480px 下布局正常，无溢出
- [ ] 语言切换：5 种语言文案均正确渲染，无 i18n key 裸露
- [ ] 广告容错：`AdsEnabled=false` 时显示占位灰块，不报错
- [ ] FAQ 手风琴展开/折叠正常
- [ ] Toast 提示可正确显示并自动消失

---

## 文档 4：`{工具名}-I-03_前端引擎.md`

### 必须包含的章节

**1. 技术选型表**
```
| 功能 | 方案 | 原因 |
```

**2. 文件结构与全局状态（static/js/{工具名}.js）**

```javascript
/**
 * {工具名}.js — 主处理引擎
 * 依赖（均由 base.html 全局加载，无需重复引入）：
 *   - ga-events.js     GA 事件追踪
 *   - consent-engine.js Consent Mode v2（自动处理 GA 授权）
 */
(function() {
  'use strict';

  // ── 常量 ──────────────────────────────────────────────────────
  var TOOL        = '{工具名}';
  var MAX_FILES   = 20;       // 最大文件数（文件类工具适用）
  var MAX_SIZE_MB = 10;       // 单文件最大 MB
  var CONCURRENCY = 3;        // 并发处理数

  // ── 全局状态 ──────────────────────────────────────────────────
  var state = {
    // 按工具业务定义，示例：
    // inputText:  '',       // 文字类工具
    // files:      [],       // 文件类工具 [{id, file, status, result, objectURL}]
    // processing: false,
    // objectURLs: [],       // 所有 ObjectURL，clearAll 时统一释放
  };

  // ── 核心函数（下方详细说明） ──────────────────────────────────

  // ── UI 事件绑定 ───────────────────────────────────────────────
  function bindEvents() { ... }

  // ── 初始化 ────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindEvents);
  } else {
    bindEvents();
  }
})();
```

**3. 函数职责说明**

文字/代码类工具必须包含：
- `processInput(text)` — 输入校验 + 处理 + 显示结果
- `copyResult()` — Clipboard API + 降级（execCommand）+ Toast 提示
- `clearAll()` — 清空输入/输出 DOM + 重置 state

文件类工具必须包含：
- `addFiles(fileList)` — 校验（格式白名单/大小/数量/去重）+ 渲染占位卡片
- `startProcess()` — 读选项 + 筛待处理文件 + 并发调度
- `processOne(item)` — 核心处理（Canvas/WASM/第三方库），完成后 `URL.createObjectURL()`
- `runConcurrent(tasks, limit)` — 并发数 ≤ CONCURRENCY
- `downloadOne(id)` — 从 state 取 objectURL，创建临时 `<a>` 触发下载
- `downloadAll()` — JSZip 打包所有已完成文件 → gaTrackDownloadAll
- `clearAll()` — **必须 `URL.revokeObjectURL()` 逐一释放 state.objectURLs** + 清空 DOM + 重置 state

通用工具函数：
- `showToast(msg, type)` — type: 'success'|'error'|'info'，2.5s 后自动消失
- `formatFileSize(bytes)` — 自动换算 B/KB/MB
- `setProcessBtnState(loading)` — 按钮禁用/loading 态切换

**4. UI 事件绑定要点**

```javascript
// 拖拽：ondragleave 排除子元素触发
dropZone.addEventListener('dragleave', function(e) {
  if (!dropZone.contains(e.relatedTarget)) {
    dropZone.classList.remove('drag-over');
  }
});

// 文件选择：accept 与格式白名单保持一致
fileInput.accept = 'image/jpeg,image/png,image/webp,...';

// 参数变更：实时触发 GA
qualitySlider.addEventListener('input', function() {
  gaTrackSettingChange(TOOL, 'quality', this.value);
});

// FAQ：原生 <details>/<summary> 或手动 toggle 动画
```

**5. 验收标准 Checklist**
- [ ] 核心功能在各场景下输出正确
- [ ] 文件类：ObjectURL 无泄漏（clearAll 后 DevTools Memory 验证）
- [ ] 文件类：并发数严格限制为 CONCURRENCY
- [ ] 错误时 Toast 正确显示，页面不崩溃
- [ ] GA 事件在 `EnableGA=true` + consent granted 时触发
- [ ] GA 事件在 `EnableGA=false` 或 consent denied 时静默忽略
- [ ] 复制功能：HTTPS 和 localhost 均正常（Clipboard API 降级处理）

---

## 文档 5：`{工具名}-I-04_结果展示.md`

### 必须包含的章节

**1. 竞品结果区 UI 对标表**

**2. 结果渲染规则**

文字/代码类工具（单一结果区）：
- 结果框支持代码高亮（Prism.js / highlight.js 按需引入）
- 一键复制按钮（右上角浮动，点击后变为"✓ Copied"并恢复）
- 多字段结果（如哈希工具）：卡片列表，每行 `[算法标签] [哈希值] [复制按钮]`

文件类工具（结果卡片列表）：
```
卡片结构（三列 grid）：
[缩略图 64×64px] │ [文件名（截断）/ 原始大小 → 输出大小 / 节省率 badge] │ [预览/下载/删除 按钮组]
```

四种卡片状态 DOM 表现：
| 状态 | 视觉 |
|------|------|
| `waiting` | 灰色占位，操作按钮禁用 |
| `processing` | 进度条动画（伪进度 0→85% 随机递增，完成跳 100%）|
| `done` | 输出大小 + 节省率 badge（>50% 绿 / 20–50% 黄 / <20% 灰）|
| `error` | 红色错误文字 + 重试按钮 |

卡片动画：
- 入场：`opacity 0→1 + translateY(12px→0)`，300ms ease-out
- 移除：`translateX(100%) + opacity 0`，250ms，animationend 后从 DOM 删除

**3. 完整数据流 & 函数调用图**
```
用户输入 / 上传
       │
       ▼
addFiles() / processInput()
       │  渲染占位卡片 / 清空结果
       ▼
startProcess()
       │  读取选项参数
       ▼
runConcurrent(processOne, CONCURRENCY)
       │
       ├── processOne(item)
       │       │  Canvas / WASM / 第三方库处理
       │       ▼
       │   upsertResultCard(data)      ← 更新卡片 DOM
       │   gaTrackProcessDone(...)
       │
       └── （全部完成）
               │
               ▼
           updateSummary()            ← 汇总统计（压缩前后总大小、节省率）
           setProcessBtnState(false)

用户下载
  ├── downloadOne(id)    → URL.createObjectURL → <a>.click()  → gaTrackDownload
  └── downloadAll()      → JSZip 打包          → <a>.click()  → gaTrackDownloadAll

用户清空
  └── clearAll()
      ├── state.objectURLs.forEach(URL.revokeObjectURL)   ← 必须逐一释放
      ├── state = { ...初始值 }
      └── 清空结果 DOM
```

**4. Before/After 预览弹窗（文件类工具，有原始文件对比时）**
```
弹窗结构：
  遮罩层（点击关闭）
  └── 模态框
        ├── 标题栏（文件名 + 关闭按钮）
        ├── 大小对比标签（原始大小 → 压缩后大小，节省 X%）
        ├── 滑块对比区域
        │     ├── before-wrap（clip: inset(0 {100-pos}% 0 0)）
        │     ├── after-img（背底）
        │     └── divider（绝对定位，left: {pos}%，可拖拽）
        └── 底部操作栏（下载按钮）

事件：
  divider → mousedown/touchstart → mousemove/touchmove（文档级）→ mouseup/touchend
  ESC 键 → closePreview()
  关闭时：document.removeEventListener(mousemove/touchmove)
  注意：不在此释放 ObjectURL，由 clearAll() 统一处理
```

**5. CSS 关键规则**
- 节省率 badge 颜色：`var(--color-success)` / `var(--color-warning)` / `var(--color-muted)`
- 进度条：`transition: width 0.3s ease` + 动画结束后隐藏
- 弹窗层级：`z-index: 9000`（低于 consent banner 的 9000，或根据实际调整）
- 卡片列表：`display: flex; flex-direction: column; gap: 8px`
- 移动端卡片：缩略图缩小至 48px，按钮组换行

**6. 验收标准 Checklist**
- [ ] 结果卡片四种状态（waiting/processing/done/error）视觉均正确
- [ ] 进度条伪进度动画流畅，不跳帧
- [ ] 单个下载正常触发，文件名正确
- [ ] 批量 ZIP 下载内容完整，文件名无乱码
- [ ] clearAll 后 ObjectURL 无残留（DevTools Memory → Detached 验证）
- [ ] 预览弹窗滑块拖拽在桌面端和移动端均正常
- [ ] ESC 关闭弹窗正常
- [ ] 移动端结果列表单列布局，操作按钮足够大（最小 44px touch target）
- [ ] 复制按钮在 HTTPS 和 localhost 均正常

---

## 通用约束（每个文档都必须遵守）

| 约束项 | 规则 |
|--------|------|
| **命名一致性** | 路由、i18n key 前缀、广告 SlotID、GA TOOL 变量必须统一为同一个工具名标识符 |
| **模板调用** | `{{ call .T "key" }}`，不是 `{{ .T "key" }}` |
| **baseData 变量** | 直接用 `.AdsEnabled` `.EnableGA` `.AssetVer` 等，Handler 通过 `baseData()` 自动注入 |
| **render 函数** | 使用 `render(c, "page.html", data)` 而非 `c.HTML()`，render 自动包含所有 partials |
| **extraHead** | 只放 canonical/hreflang + 工具专属 CSS；GA/Ads/consent/main.css 由 base.html 处理 |
| **extraScript** | 工具 JS 文件引入 + GA 事件调用注释；不重复引入 ga-events.js / consent-engine.js |
| **内存安全** | 所有 ObjectURL 必须在 `clearAll()` 中统一 `URL.revokeObjectURL()` |
| **CSS 变量** | 颜色、阴影、圆角全部用 CSS 变量，继承 main.css，不硬编码 |
| **主题支持** | 所有颜色必须在 5 个主题（light/dark/forest/ocean/sunset）下均可辨认 |
| **并发控制** | 默认并发数 3～4，通过 `CONCURRENCY` 常量配置 |
| **i18n 完整性** | 5 种语言（zh/en/ja/ko/spa）必须 100% 覆盖所有 key，文案真实可用 |
| **广告容错** | `AdSlotNum` 为空时不展示广告；`AdsEnabled=false` 时显示占位灰块，不报错 |
| **Consent 集成** | 无需手动检查 ConsentAnalytics；Consent Mode v2 在底层自动拦截 GA 事件 |
| **资源版本** | 静态资源引用使用 `?v={{ .AssetVer }}` 缓存破坏 |
| **隐私原则** | 文件/数据全程不离开浏览器；如有例外在「特殊说明」中注明并补充后端 handler 设计 |

---

## 输出要求（非常重要）

- 采用 Markdown 格式，每份文档一个独立代码块
- 代码块首行注释文件名，如 `<!-- dev-hash-I-00_总览索引.md -->`
- 5 份文档（I-00 ～ I-04）全部输出完毕后，提示用户可以「导出所有文档」
- 文案必须真实可用，不写 `{placeholder}` 或 `TODO`
- 代码框架必须严格对照本文档「架构速查」，确保 0 改动可集成进现有项目
````
