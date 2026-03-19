---
name: google-analytics
description: Google Analytics 4（GA4）接入工程规范技能，覆盖 Config 配置、中间件注入、模板埋点、事件追踪、存量页面迁移与新业务接入全流程。当用户提到以下任意情况时立即激活：「接入 GA」「Google Analytics 怎么加」「埋点」「gtag」「GA4」「统计页面访问」「追踪用户行为」「新页面加 GA」「GA 中间件」「帮我迁移硬编码 GA 代码」「参考历史需求写 GA」。激活后自动判断场景类型（存量迁移 / 新业务接入），按对应流程输出可直接使用的代码。
---

# Google Analytics 4 接入工程规范（存量迁移 + 新业务接入）

## 角色定义

你是负责本项目 **Google Analytics 全生命周期管理**的工程助手，熟悉 Go/Gin 模板体系。  
收到指令后，先判断场景类型，再按对应流程执行：

| 场景 | 触发关键词示例 |
|------|--------------|
| **A · 存量迁移** | 「GA 代码是写死的」「帮我迁移 gtag」「统一用中间件注入」 |
| **B · 新业务接入** | 「新工具」「新页面」「从零接 GA」「新增路由需要 GA」「参考历史需求」 |

---

## 一、Config 规范（唯一数据源）

### 1.1 Config 结构体扩展

在现有 Config 结构体中新增 GA 相关字段：

```go
// internal/config/config.go

type Config struct {
    Port          string
    GoogleAdsID   string
    EnableAds     bool
    SiteURL       string
    SMSAPIKey     string
    EmailAPIKey   string
    // ↓ 新增 GA 字段
    GAMeasurementID string // GA4 测量 ID，格式 "G-XXXXXXXXXX"
    EnableGA        bool   // GA 总开关，dev=false，prod=true
}
```

对应配置文件：

```yaml
# config/config.prod.yaml
GAMeasurementID: "G-XXXXXXXXXX"
EnableGA: true

# config/config.dev.yaml
GAMeasurementID: ""
EnableGA: false   # dev 环境关闭，避免污染统计数据
```

> ⚠️ **禁止在 Handler、模板、JS 任何位置硬编码 `G-` 开头的 Measurement ID，必须通过 Config 统一读取。**

---

## 二、后端规范

### 2.1 中间件

```go
// internal/middleware/ga.go

package middleware

import "github.com/gin-gonic/gin"

func GAConfig(cfg *config.Config) gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Set("GAMeasurementID", cfg.GAMeasurementID)
        c.Set("EnableGA",        cfg.EnableGA)
        c.Next()
    }
}
```

### 2.2 路由注册（三个中间件统一挂载）

```go
// internal/router/router.go

func SetupRouter(cfg *config.Config) *gin.Engine {
    r := gin.New()

    toolGroup := r.Group("/")
    toolGroup.Use(
        middleware.I18n(),
        middleware.AdsConfig(cfg), // 广告
        middleware.GAConfig(cfg),  // Google Analytics ← 新增
    )

    toolGroup.GET("/img/compress",  handler.ImgCompressPage)
    toolGroup.GET("/img/resize",    handler.ImgResizePage)
    toolGroup.GET("/img/metadata",  handler.ImgMetadataPage)
    // 新业务在此追加，禁止在 toolGroup 外单独注册
}
```

### 2.3 Handler 规范（三字段固定透传）

```go
func XxxPage(c *gin.Context) {
    lang := c.GetString("lang")
    c.HTML(200, "xxx/xxx.html", gin.H{
        "Lang":            lang,
        "Title":           i18n.T(lang, "xxx.seo.title"),
        "Desc":            i18n.T(lang, "xxx.seo.desc"),
        // 广告（已接入 ad-slot skill）
        "AdsClientID":     c.GetString("AdsClientID"),
        "AdsEnabled":      c.GetBool("AdsEnabled"),
        // Google Analytics ← 新增，固定写法
        "GAMeasurementID": c.GetString("GAMeasurementID"),
        "EnableGA":        c.GetBool("EnableGA"),
    })
}
```

> ⚠️ **禁止事项**
>
> | 写法 | 原因 |
> |------|------|
> | ❌ `"GAMeasurementID": "G-XXXXXXXXXX"` | 硬编码，无法按环境切换 |
> | ❌ `"GAMeasurementID": cfg.GAMeasurementID` | Handler 不应直接依赖 Config |
> | ✅ `"GAMeasurementID": c.GetString("GAMeasurementID")` | 唯一允许写法 |

---

## 三、前端规范

### 3.1 GA Partial 模板

```html
{{/* templates/partials/ga.html */}}
{{- if .EnableGA }}
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id={{ .GAMeasurementID }}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', '{{ .GAMeasurementID }}', {
    page_path:  window.location.pathname,
    page_title: document.title,
    anonymize_ip: true
  });
</script>
{{- end }}
```

> `EnableGA=false` 时整个 partial 不渲染任何 `<script>` 标签，dev 环境零污染。

### 3.2 在页面 `<head>` 中调用 Partial（唯一调用位置）

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ t .Lang "xxx.seo.title" }}</title>

  {{/* GA 必须放在 <head> 最前方，其他 <link>/<script> 之前 */}}
  {{- template "partials/ga.html" . }}

  <meta name="description" content="{{ t .Lang "xxx.seo.desc" }}">
  <link rel="stylesheet" href="/static/css/xxx.css">
</head>
```

---

### 3.3 事件追踪标准函数

统一封装到 `/static/js/ga-events.js`，全局引入一次，各页面直接调用：

```javascript
// /static/js/ga-events.js
'use strict';

/**
 * 安全封装 gtag 调用
 * EnableGA=false 时 window.gtag 不存在，此函数静默忽略
 */
function trackEvent(eventName, params = {}) {
  if (typeof gtag !== 'function') return;
  gtag('event', eventName, params);
}

/* ══════════════════════════════════════════
   通用事件：所有工具页面共用
══════════════════════════════════════════ */

// 文件上传
function gaTrackUpload(toolName, fileCount, totalSizeMB) {
  trackEvent('file_upload', {
    event_category: toolName,
    file_count:     fileCount,
    total_size_mb:  parseFloat(totalSizeMB.toFixed(2)),
  });
}

// 处理完成
function gaTrackProcessDone(toolName, fileCount, durationMs) {
  trackEvent('process_complete', {
    event_category: toolName,
    file_count:     fileCount,
    duration_ms:    durationMs,
  });
}

// 文件下载（单张）
function gaTrackDownload(toolName, fileType) {
  trackEvent('file_download', {
    event_category: toolName,
    file_type:      fileType,
  });
}

// 批量打包下载（ZIP）
function gaTrackDownloadAll(toolName, fileCount) {
  trackEvent('download_all_zip', {
    event_category: toolName,
    file_count:     fileCount,
  });
}

// 导出格式（JSON / CSV / TXT 等）
function gaTrackExport(toolName, format) {
  trackEvent('export', {
    event_category: toolName,
    export_format:  format,
  });
}

// 工具参数变更（如压缩质量、输出格式等）
function gaTrackSettingChange(toolName, settingName, value) {
  trackEvent('setting_change', {
    event_category: toolName,
    setting_name:   settingName,
    setting_value:  String(value),
  });
}

// 错误发生
function gaTrackError(toolName, errorType, errorMsg) {
  trackEvent('tool_error', {
    event_category: toolName,
    error_type:     errorType,
    error_message:  String(errorMsg).slice(0, 100), // GA 单字段限 100 字符
  });
}

// 分享 / 复制链接
function gaTrackShare(toolName, method) {
  trackEvent('share', {
    event_category: toolName,
    method:         method, // 'copy_link' | 'copy_field' | 'native_share'
  });
}
```

---

### 3.4 各工具页面事件埋点示例

```javascript
// 以图片压缩工具为例（img-compress-ui.js）

// 上传文件后触发
function onFilesAdded(files) {
  const totalMB = files.reduce((s, f) => s + f.size, 0) / (1024 * 1024);
  gaTrackUpload('img-compress', files.length, totalMB);
  // ... 业务逻辑
}

// 压缩完成后触发
function onCompressDone(fileCount, startTime) {
  gaTrackProcessDone('img-compress', fileCount, Date.now() - startTime);
}

// 下载单张
function onDownloadSingle(file) {
  gaTrackDownload('img-compress', file.type || 'image/jpeg');
  // ... 下载逻辑
}

// 打包下载
function onDownloadAll(files) {
  gaTrackDownloadAll('img-compress', files.length);
  // ... ZIP 逻辑
}

// 质量滑块变更
function onQualityChange(value) {
  gaTrackSettingChange('img-compress', 'quality', value);
}

// 格式切换
function onFormatChange(format) {
  gaTrackSettingChange('img-compress', 'output_format', format);
}

// 错误处理
function onError(type, msg) {
  gaTrackError('img-compress', type, msg);
  showToast(msg, 'error');
}
```

---

### 3.5 自定义维度规范（GA4 后台配置）

在 GA4 后台「自定义定义」中注册以下自定义维度，与事件参数对应：

| 参数名 | 范围 | 说明 |
|--------|------|------|
| `event_category` | 事件 | 工具名，如 `img-compress` |
| `file_count` | 事件 | 本次操作文件数量 |
| `file_type` | 事件 | 文件 MIME 类型 |
| `export_format` | 事件 | 导出格式：json / csv / txt |
| `setting_name` | 事件 | 被修改的设置项名称 |
| `setting_value` | 事件 | 设置项新值 |
| `error_type` | 事件 | 错误类型标识 |
| `duration_ms` | 事件 | 处理耗时（毫秒）|

---

## 四、场景 A · 存量迁移流程

### Step 1：扫描硬编码 GA 代码

识别以下所有模式，均视为需要迁移：

```html
<!-- 模式 1：直接写死 Measurement ID 的 gtag 初始化代码 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>

<!-- 模式 2：GA Universal Analytics（旧版 UA-）-->
<script async src="https://www.google-analytics.com/analytics.js"></script>
<script>
  window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};
  ga('create', 'UA-XXXXXXXX-X', 'auto');
  ga('send', 'pageview');
</script>

<!-- 模式 3：GTM 容器代码写死 -->
<script>(function(w,d,s,l,i){...})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>

<!-- 模式 4：Handler 中硬编码透传 -->
"GAID": "G-XXXXXXXXXX",
```

扫描后输出汇总：

```
发现 3 处硬编码 GA 代码：
  [1] templates/img/compress.html 第 8 行  — gtag 初始化，硬编码 G-XXXXXXXXXX
  [2] templates/img/resize.html   第 8 行  — 同上
  [3] internal/handler/img_compress.go 第 21 行 — Handler 硬编码透传 GAID
```

---

### Step 2：检查 Config 是否已有 GA 字段

```
✅ Config 已有 GAMeasurementID / EnableGA 字段 — 无需修改 Config
❌ Config 缺少 GA 字段 — 需按规范 1.1 扩展 Config 结构体
```

同时检查路由组是否已挂载 `middleware.GAConfig(cfg)`：

```
✅ 路由组已挂载 GAConfig 中间件 — 无需修改路由
❌ 路由组未挂载 — 需按规范 2.2 补加中间件
```

---

### Step 3：输出 diff

**Config 扩展（如缺少）：**

```diff
  type Config struct {
      Port          string
      GoogleAdsID   string
      EnableAds     bool
      SiteURL       string
      SMSAPIKey     string
      EmailAPIKey   string
+     GAMeasurementID string
+     EnableGA        bool
  }
```

**路由层（如缺少中间件）：**

```diff
  toolGroup.Use(
      middleware.I18n(),
      middleware.AdsConfig(cfg),
+     middleware.GAConfig(cfg),
  )
```

**Handler：**

```diff
  c.HTML(200, "img/compress.html", gin.H{
      "Lang":        lang,
      "Title":       i18n.T(lang, "img-compress.seo.title"),
      "AdsClientID": c.GetString("AdsClientID"),
      "AdsEnabled":  c.GetBool("AdsEnabled"),
+     "GAMeasurementID": c.GetString("GAMeasurementID"),
+     "EnableGA":        c.GetBool("EnableGA"),
  })
```

**模板 `<head>`：**

```diff
  <head>
    <meta charset="UTF-8">
+   {{- template "partials/ga.html" . }}
-   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
-   <script>
-     window.dataLayer = window.dataLayer || [];
-     function gtag(){dataLayer.push(arguments);}
-     gtag('js', new Date());
-     gtag('config', 'G-XXXXXXXXXX');
-   </script>
    <title>{{ t .Lang "img-compress.seo.title" }}</title>
  </head>
```

**引入事件追踪 JS（页面底部）：**

```diff
+ <script src="/static/js/ga-events.js"></script>
  <script src="/static/js/img-compress-engine.js"></script>
  <script src="/static/js/img-compress-ui.js"></script>
```

---

### Step 4：存量迁移验收清单

```markdown
- [ ] Config 结构体已添加 GAMeasurementID / EnableGA 字段
- [ ] config.prod.yaml 中 GAMeasurementID 填写真实 G-XXXXXXXXXX
- [ ] config.dev.yaml 中 EnableGA: false
- [ ] middleware.GAConfig(cfg) 已挂载到 toolGroup
- [ ] 所有 Handler 已按规范 2.3 透传 GAMeasurementID / EnableGA
- [ ] 模板 <head> 中硬编码 gtag 代码已全部删除
- [ ] 模板 <head> 最前方已调用 {{- template "partials/ga.html" . }}
- [ ] /static/js/ga-events.js 已在页面底部引入
- [ ] dev 环境启动后 <head> 中无任何 GA script 标签
- [ ] prod 环境 GA 后台实时报告可看到页面浏览事件
- [ ] 无硬编码 G-XXXXXXXXXX 残留（全局搜索确认）
```

---

## 五、场景 B · 新业务接入流程

### Step 1：路由注册（确认三个中间件均已挂载）

```go
// ✅ 新路由注册在 toolGroup 下，自动继承三个中间件
toolGroup.GET("/new-tool/feature", handler.NewToolPage)

// ❌ 单独注册，GA / Ads / i18n 中间件均不生效
r.GET("/new-tool/feature", handler.NewToolPage)
```

---

### Step 2：Handler（完整标准写法，复制即用）

```go
func NewToolPage(c *gin.Context) {
    lang := c.GetString("lang")
    c.HTML(200, "new-tool/feature.html", gin.H{
        // i18n
        "Lang":            lang,
        "Path":            c.Request.URL.Path,
        "Title":           i18n.T(lang, "new-tool.seo.title"),
        "Desc":            i18n.T(lang, "new-tool.seo.desc"),
        // 广告
        "AdsClientID":     c.GetString("AdsClientID"),
        "AdsEnabled":      c.GetBool("AdsEnabled"),
        // Google Analytics
        "GAMeasurementID": c.GetString("GAMeasurementID"),
        "EnableGA":        c.GetBool("EnableGA"),
        // 业务数据
        "FAQs":            getNewToolFAQs(lang),
    })
}
```

---

### Step 3：HTML 模板 `<head>` 标准结构

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  {{/* ① GA 必须最先加载 */}}
  {{- template "partials/ga.html" . }}

  <title>{{ t .Lang "new-tool.seo.title" }}</title>
  <meta name="description" content="{{ t .Lang "new-tool.seo.desc" }}">

  <link rel="alternate" hreflang="zh" href="{{ .SiteURL }}{{ .Path }}?lang=zh">
  <link rel="alternate" hreflang="en" href="{{ .SiteURL }}{{ .Path }}?lang=en">

  <meta property="og:title"  content="{{ t .Lang "new-tool.seo.title" }}">
  <meta property="og:locale" content="{{ if eq .Lang "zh" }}zh_CN{{ else }}en_US{{ end }}">

  <link rel="stylesheet" href="/static/css/new-tool.css">
</head>
```

页面底部 JS 引入顺序：

```html
  {{/* ② 事件追踪公共库（在业务 JS 之前）*/}}
  <script src="/static/js/ga-events.js"></script>
  <script src="/static/js/new-tool-engine.js"></script>
  <script src="/static/js/new-tool-ui.js"></script>
</body>
```

---

### Step 4：业务 JS 中添加埋点（新工具标准埋点集合）

```javascript
// new-tool-ui.js 中按需调用 ga-events.js 提供的函数

// ① 文件上传
function onFilesAdded(files) {
  const totalMB = files.reduce((s, f) => s + f.size, 0) / (1024 * 1024);
  gaTrackUpload('new-tool', files.length, totalMB);
}

// ② 处理完成
const _startTime = Date.now();
function onProcessDone(fileCount) {
  gaTrackProcessDone('new-tool', fileCount, Date.now() - _startTime);
}

// ③ 下载
function onDownload(file) {
  gaTrackDownload('new-tool', file.type);
}

// ④ 批量下载
function onDownloadAll(files) {
  gaTrackDownloadAll('new-tool', files.length);
}

// ⑤ 参数变更（根据工具实际参数替换）
function onSettingChange(name, value) {
  gaTrackSettingChange('new-tool', name, value);
}

// ⑥ 错误
function onError(type, msg) {
  gaTrackError('new-tool', type, msg);
}
```

---

### Step 5：新业务验收清单

```markdown
- [ ] 新路由注册在含 middleware.GAConfig(cfg) 的路由组下
- [ ] Handler 包含 GAMeasurementID / EnableGA 两个透传字段
- [ ] 模板 <head> 最前方调用了 {{- template "partials/ga.html" . }}
- [ ] 模板底部引入了 /static/js/ga-events.js
- [ ] 业务 JS 中核心操作均已添加 gaTrack* 调用
- [ ] dev 环境 EnableGA=false，<head> 中无 GA script
- [ ] prod 环境 GA 实时报告可看到该页面的 page_view 事件
- [ ] 上传、处理完成、下载事件在 GA 后台可正常接收
- [ ] 无硬编码 G-XXXXXXXXXX（全局搜索确认）
```

---

## 六、常见错误处理

| 错误情况 | 正确处理方式 |
|----------|------------|
| Handler 直接写 `cfg.GAMeasurementID` | 改为 `c.GetString("GAMeasurementID")`，依赖中间件注入 |
| 模板中出现硬编码 `G-XXXXXXXXXX` | 替换为 `{{ .GAMeasurementID }}`，并确保 partial 已正确调用 |
| dev 环境有真实 GA 数据混入 | 检查 `config.dev.yaml` 的 `EnableGA` 是否为 `false` |
| `gtag is not defined` 报错 | 检查 `ga-events.js` 是否在业务 JS 之前引入；`trackEvent` 已有 `typeof gtag` 守卫，不会崩溃 |
| 新路由未挂载 GAConfig 中间件 | 将路由移入正确路由组，或为该组补加 `middleware.GAConfig(cfg)` |
| GA 后台收不到事件 | 检查浏览器网络请求是否有 `collect?v=2` 请求；确认 `EnableGA=true`；确认 Measurement ID 正确 |
| 浏览器隐私插件拦截 GA | 属于正常现象，不影响真实用户统计，无需处理 |
| 旧版 UA- 代码需升级 | 删除 `analytics.js` 引用，统一改为 GA4 gtag 方式，旧 UA 属性不再使用 |

---

## 七、数据流全景图

```
config.prod.yaml
  GAMeasurementID: "G-XXXXXXXXXX"
  EnableGA: true
        ↓
Config 结构体（唯一数据源）
  .GAMeasurementID  .EnableGA
        ↓
middleware.GAConfig(cfg)
  c.Set("GAMeasurementID", cfg.GAMeasurementID)
  c.Set("EnableGA",         cfg.EnableGA)
        ↓
Handler gin.H{}
  "GAMeasurementID": c.GetString("GAMeasurementID")
  "EnableGA":        c.GetBool("EnableGA")
        ↓
HTML 模板 <head>
  {{- template "partials/ga.html" . }}
    EnableGA=false → 不渲染任何 script（dev 零污染）
    EnableGA=true  → 渲染 gtag.js + gtag('config', 'G-XXX')
        ↓
/static/js/ga-events.js（全局事件封装层）
  trackEvent() → 安全调用 window.gtag，不存在时静默忽略
        ↓
各工具业务 JS
  gaTrackUpload / gaTrackProcessDone / gaTrackDownload ...
        ↓
Google Analytics 4 后台
  page_view / file_upload / process_complete / file_download ...
```

---

## 八、三 Skill 协同：Handler 完整模板

当 i18n、ad-slot、google-analytics 三个 Skill 全部接入时，Handler 的完整标准写法如下，**复制即用，替换工具名**：

```go
func ToolNamePage(c *gin.Context) {
    lang := c.GetString("lang")
    c.HTML(200, "tool/name.html", gin.H{
        // ── i18n ──────────────────────────────
        "Lang":            lang,
        "Path":            c.Request.URL.Path,
        "Title":           i18n.T(lang, "tool-name.seo.title"),
        "Desc":            i18n.T(lang, "tool-name.seo.desc"),
        // ── 广告 ──────────────────────────────
        "AdsClientID":     c.GetString("AdsClientID"),
        "AdsEnabled":      c.GetBool("AdsEnabled"),
        // ── Google Analytics ──────────────────
        "GAMeasurementID": c.GetString("GAMeasurementID"),
        "EnableGA":        c.GetBool("EnableGA"),
        // ── 业务数据 ──────────────────────────
        "FAQs":            getToolNameFAQs(lang),
    })
}
```

对应模板 `<head>` 完整标准结构：

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  {{/* GA 最先加载 */}}
  {{- template "partials/ga.html" . }}

  <title>{{ t .Lang "tool-name.seo.title" }}</title>
  <meta name="description" content="{{ t .Lang "tool-name.seo.desc" }}">
  <link rel="alternate" hreflang="zh" href="{{ .SiteURL }}{{ .Path }}?lang=zh">
  <link rel="alternate" hreflang="en" href="{{ .SiteURL }}{{ .Path }}?lang=en">
  <meta property="og:title"  content="{{ t .Lang "tool-name.seo.title" }}">
  <meta property="og:locale" content="{{ if eq .Lang "zh" }}zh_CN{{ else }}en_US{{ end }}">
  <link rel="stylesheet" href="/static/css/tool-name.css">
</head>
<body>
  {{/* 广告位 */}}
  {{- template "partials/ad_slot.html" dict "SlotID" "tool-name-top" "Size" "728x90" "Mobile" "320x50" "ClientID" .AdsClientID "Enabled" .AdsEnabled }}

  <!-- 页面内容 -->

  {{/* 底部广告位 */}}
  {{- template "partials/ad_slot.html" dict "SlotID" "tool-name-bottom" "Size" "728x90" "Mobile" "320x50" "ClientID" .AdsClientID "Enabled" .AdsEnabled }}

  {{/* JS 引入顺序：ga-events 必须在业务 JS 之前 */}}
  <script src="/static/js/ga-events.js"></script>
  <script src="/static/js/tool-name-engine.js"></script>
  <script src="/static/js/tool-name-ui.js"></script>
</body>
```

---

## 九、输出规范

- **输出顺序**：Config diff → 中间件代码 → 路由 diff → Handler diff → 模板 diff → JS 埋点示例 → 验收清单
- **改动超过 10 处时**：输出完整替换后的文件，而非 diff
- **说明文字**：与用户当前对话语言一致
- **事件名**：统一英文小写 + 下划线（GA4 规范），如 `file_upload`、`process_complete`
- **工具名（event_category）**：统一英文小写 + 连字符，与路由路径末段一致