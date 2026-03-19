---
name: ad-slot
description: 广告位工程规范技能，覆盖存量页面迁移与新业务接入两种场景。当用户提到以下任意情况时立即激活：「广告位写死了」「帮我迁移广告」「统一用 ad_slot partial」「新工具需要接入广告」「新页面怎么加广告」「参考历史需求写广告位」「把广告改成 ad_slot.html 方式」。激活后自动判断场景类型（存量迁移 / 新业务接入），按对应流程输出可直接使用的代码。
---

# Ad Slot 广告位工程规范（存量迁移 + 新业务接入）

## 角色定义

你是负责本项目**广告位全生命周期管理**的工程助手，熟悉 Go/Gin 模板体系。  
收到指令后，先判断场景类型，再按对应流程执行：

| 场景 | 触发关键词示例 |
|------|--------------|
| **A · 存量迁移** | 「广告位是写死的」「帮我改造/迁移」「统一用 ad_slot」 |
| **B · 新业务接入** | 「新工具」「新页面」「从零开始」「新增路由」「参考历史需求写广告位」 |

---

## 一、后端规范（存量 + 新业务通用）

### 1.1 Config 结构体（唯一数据源）

项目 Config 结构体定义如下，广告相关字段为 `GoogleAdsID` 和 `EnableAds`：

```go
// internal/config/config.go

type Config struct {
    Port        string
    GoogleAdsID string // Google Publisher ID，格式 "ca-pub-xxxxxxxxxxxxxxxxx"
    EnableAds   bool   // 广告总开关，dev=false，prod=true
    SiteURL     string
    SMSAPIKey   string
    EmailAPIKey string
}
```

**禁止在 Handler、模板、JS 任意位置硬编码 `ca-pub-` 开头的 ID，必须通过 Config 统一读取。**

对应配置文件示例：

```yaml
# config/config.prod.yaml
GoogleAdsID: "ca-pub-xxxxxxxxxxxxxxxxx"
EnableAds: true

# config/config.dev.yaml
GoogleAdsID: ""
EnableAds: false
```

---

### 1.2 中间件注入（路由层）

广告配置通过中间件注入到 Gin Context，**所有工具页面路由组都必须挂载**：

```go
// internal/router/router.go

func SetupRouter(cfg *config.Config) *gin.Engine {
    r := gin.New()

    // 工具页面路由组 — 统一挂载广告中间件
    toolGroup := r.Group("/")
    toolGroup.Use(
        middleware.I18n(),
        middleware.AdsConfig(cfg), // ← 传入 Config，由中间件统一注入
    )
}
```

中间件实现：

```go
// internal/middleware/ads.go

func AdsConfig(cfg *config.Config) gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Set("AdsClientID", cfg.GoogleAdsID) // 直接读取 Config.GoogleAdsID
        c.Set("AdsEnabled",  cfg.EnableAds)   // 直接读取 Config.EnableAds
        c.Next()
    }
}
```

---

### 1.3 Handler 规范（固定写法，复制即用）

Handler **不需要也不允许**自行读取 Config，统一从 Gin Context 取中间件注入的值：

```go
// 任意工具页面 Handler 的标准写法
func XxxPage(c *gin.Context) {
    c.HTML(200, "xxx/xxx.html", gin.H{
        "Lang":        c.GetString("lang"),
        "Title":       "...",
        "Desc":        "...",
        // ✅ 广告配置：固定从 Context 透传，禁止修改此两行
        "AdsClientID": c.GetString("AdsClientID"),
        "AdsEnabled":  c.GetBool("AdsEnabled"),
    })
}
```

> ⚠️ **禁止事项**
>
> | 写法 | 原因 |
> |------|------|
> | ❌ `"AdsClientID": "ca-pub-12345678"` | 硬编码，环境切换需改代码 |
> | ❌ `"AdsClientID": cfg.GoogleAdsID` | Handler 不应直接依赖 Config |
> | ✅ `"AdsClientID": c.GetString("AdsClientID")` | 唯一允许写法 |

---

## 二、前端规范（存量 + 新业务通用）

### 2.1 统一 Partial 调用语法

```html
{{- template "partials/ad_slot.html" dict
    "SlotID"     "工具名-位置"
    "Size"       "728x90"
    "Mobile"     "320x50"
    "MobileHide" true
    "ClientID"   .AdsClientID
    "Enabled"    .AdsEnabled
}}
```

**参数说明：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `SlotID` | string | ✅ | 广告位唯一标识，格式：`{工具名}-{位置}` |
| `Size` | string | ✅ | 桌面端尺寸：`728x90` / `300x250` / `160x600` |
| `Mobile` | string | ❌ | 移动端替换尺寸，不传则与桌面端一致 |
| `MobileHide` | bool | ❌ | `true` = 移动端隐藏，常用于侧边栏 |
| `ClientID` | string | ✅ | **固定写 `.AdsClientID`**，来源于 `Config.GoogleAdsID` |
| `Enabled` | bool | ✅ | **固定写 `.AdsEnabled`**，来源于 `Config.EnableAds` |

---

### 2.2 SlotID 命名规范

```
格式：{工具路径末段}-{位置}

位置枚举：
  top       → Hero 区下方横幅（728x90 / 移动端 320x50）
  bottom    → 页面底部横幅（728x90 / 移动端 320x50）
  sidebar   → 侧边栏方形（300x250 / 移动端隐藏）
  mid       → 结果区中部插入（300x250 或 728x90）
  inline-N  → 内容流中第 N 个广告（N 从 1 开始）

示例：
  img-compress-top      img-compress-sidebar      img-compress-bottom
  img-resize-top        img-resize-sidebar        img-resize-bottom
  img-metadata-top      img-metadata-sidebar      img-metadata-bottom
  pdf-merge-top         pdf-merge-mid             pdf-merge-bottom
```

---

### 2.3 各位置标准代码片段（直接复制，替换 `{工具名}` 即可）

```html
<!-- ① 顶部横幅（Hero 区下方）-->
{{- template "partials/ad_slot.html" dict "SlotID" "{工具名}-top" "Size" "728x90" "Mobile" "320x50" "ClientID" .AdsClientID "Enabled" .AdsEnabled }}

<!-- ② 底部横幅 -->
{{- template "partials/ad_slot.html" dict "SlotID" "{工具名}-bottom" "Size" "728x90" "Mobile" "320x50" "ClientID" .AdsClientID "Enabled" .AdsEnabled }}

<!-- ③ 侧边栏方块（移动端隐藏）-->
{{- template "partials/ad_slot.html" dict "SlotID" "{工具名}-sidebar" "Size" "300x250" "MobileHide" true "ClientID" .AdsClientID "Enabled" .AdsEnabled }}

<!-- ④ 结果区中部插入 -->
{{- template "partials/ad_slot.html" dict "SlotID" "{工具名}-mid" "Size" "300x250" "Mobile" "320x50" "ClientID" .AdsClientID "Enabled" .AdsEnabled }}
```

---

## 三、场景 A · 存量迁移流程

### Step 1：扫描硬编码广告位

识别页面中以下所有模式，均视为需要迁移：

```html
<!-- 模式 1：Google AdSense ins 标签（最常见）-->
<ins class="adsbygoogle"
     data-ad-client="ca-pub-..."
     data-ad-slot="..."></ins>
<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>

<!-- 模式 2：广告占位 div -->
<div class="ad-slot" data-slot-id="xxx" data-size="728x90"></div>
<div class="advertisement-top"> ... </div>
<div class="banner-slot"> ... </div>

<!-- 模式 3：注释占位 -->
<!-- AD SLOT: top banner 728x90 -->
<div class="ad-placeholder"></div>

<!-- 模式 4：含 ad / adsense / advertisement / banner 关键词的广告容器 -->
<div class="ad-wrap-top"> ... </div>
```

扫描后输出汇总：

```
发现 3 处硬编码广告位：
  [1] 第 42 行  — Hero 区横幅（728x90）→ 建议 SlotID: img-compress-top
  [2] 第 118 行 — 侧边栏方块（300x250）→ 建议 SlotID: img-compress-sidebar
  [3] 第 203 行 — 底部横幅（728x90）  → 建议 SlotID: img-compress-bottom
```

---

### Step 2：检查 Handler 是否已透传广告配置

检查对应 Handler 的 `gin.H{}` 是否包含 `AdsClientID` 和 `AdsEnabled`：

```
✅ Handler 已正确透传 — 无需修改
❌ Handler 缺少透传 — 需补充以下两行（参考规范 1.3）
```

同时检查路由注册处是否挂载了 `middleware.AdsConfig(cfg)`：

```
✅ 路由组已挂载中间件 — 无需修改路由
❌ 路由组未挂载中间件 — 需补充（参考规范 1.2）
```

---

### Step 3：输出 diff

```diff
  <!-- Hero 区域 -->
  <section class="ic-hero">
    <div class="ic-container">
-     <ins class="adsbygoogle"
-          style="display:block"
-          data-ad-client="ca-pub-12345678"
-          data-ad-slot="9876543210"
-          data-ad-format="auto"></ins>
-     <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
+     {{- template "partials/ad_slot.html" dict "SlotID" "img-compress-top" "Size" "728x90" "Mobile" "320x50" "ClientID" .AdsClientID "Enabled" .AdsEnabled }}

  <!-- 侧边栏 -->
  <aside class="ic-sidebar">
-     <div class="ad-placeholder-sidebar"></div>
+     {{- template "partials/ad_slot.html" dict "SlotID" "img-compress-sidebar" "Size" "300x250" "MobileHide" true "ClientID" .AdsClientID "Enabled" .AdsEnabled }}
  </aside>

  <!-- 页面底部 -->
- <div class="banner-slot-bottom"></div>
+ {{- template "partials/ad_slot.html" dict "SlotID" "img-compress-bottom" "Size" "728x90" "Mobile" "320x50" "ClientID" .AdsClientID "Enabled" .AdsEnabled }}
```

### Step 4：存量迁移验收清单

```markdown
- [ ] 所有硬编码 `ca-pub-` ID 已从模板中删除
- [ ] Handler 已按规范 1.3 透传 AdsClientID / AdsEnabled
- [ ] 路由组已挂载 middleware.AdsConfig(cfg)
- [ ] SlotID 命名符合 `{工具名}-{位置}` 规范，无重复
- [ ] 侧边栏广告已设置 MobileHide: true
- [ ] 移动端横幅广告已设置 Mobile: "320x50"
- [ ] .AdsClientID 来源可追溯至 Config.GoogleAdsID
- [ ] .AdsEnabled 来源可追溯至 Config.EnableAds
- [ ] dev 环境 EnableAds=false，广告位不渲染真实广告
```

## 四、场景 B · 新业务接入流程

### Step 1：路由注册

新路由**必须**注册在已挂载 `middleware.AdsConfig(cfg)` 的路由组下：

```go
// ✅ 正确：注册在 toolGroup 下，自动继承广告中间件
toolGroup.GET("/new-tool/feature", handler.NewToolPage)

// ❌ 错误：单独注册，广告中间件不生效
r.GET("/new-tool/feature", handler.NewToolPage)
```

### Step 2：Handler 模板数据

新 Handler 必须包含广告透传字段（固定写法，复制即用）：

```go
func NewToolPage(c *gin.Context) {
    c.HTML(200, "new-tool/feature.html", gin.H{
        "Lang":        c.GetString("lang"),
        "Title":       "...",
        "Desc":        "...",
        // 广告配置透传（固定写法，禁止修改）
        "AdsClientID": c.GetString("AdsClientID"), // → Config.GoogleAdsID
        "AdsEnabled":  c.GetBool("AdsEnabled"),    // → Config.EnableAds
    })
}
```

### Step 3：HTML 模板广告位标准布局

新工具页面**标准三广告位布局**（按需删减，不得新增其他广告加载方式）：

```html
<!DOCTYPE html>
<html lang="{{ .Lang }}">
<head>...</head>
<body>

<nav>...</nav>

<!-- ① 顶部广告位（Hero 区下方）-->
{{- template "partials/ad_slot.html" dict "SlotID" "{新工具名}-top" "Size" "728x90" "Mobile" "320x50" "ClientID" .AdsClientID "Enabled" .AdsEnabled }}

<!-- Hero + 工具主体 -->
<section class="hero">...</section>

<section class="tool-main">
  <div class="tool-layout">

    <!-- 主内容区 -->
    <main class="tool-content">
      <!-- ... 工具核心功能 ... -->

      <!-- ④ 可选：结果区中部广告 -->
      {{- template "partials/ad_slot.html" dict "SlotID" "{新工具名}-mid" "Size" "300x250" "Mobile" "320x50" "ClientID" .AdsClientID "Enabled" .AdsEnabled }}
    </main>

    <!-- 侧边栏广告 -->
    <aside class="tool-sidebar">
      {{- template "partials/ad_slot.html" dict "SlotID" "{新工具名}-sidebar" "Size" "300x250" "MobileHide" true "ClientID" .AdsClientID "Enabled" .AdsEnabled }}
    </aside>

  </div>
</section>

<!-- 特性 / FAQ -->
<section class="features">...</section>
<section class="faq">...</section>

<!-- ② 底部广告位 -->
{{- template "partials/ad_slot.html" dict "SlotID" "{新工具名}-bottom" "Size" "728x90" "Mobile" "320x50" "ClientID" .AdsClientID "Enabled" .AdsEnabled }}

</body>
</html>
```

### Step 4：新业务验收清单

```markdown
- [ ] 新路由注册在含 middleware.AdsConfig(cfg) 的路由组下
- [ ] Handler 包含 AdsClientID / AdsEnabled 两个透传字段
- [ ] 模板中 ClientID 使用 .AdsClientID（禁止硬编码）
- [ ] 模板中 Enabled 使用 .AdsEnabled（禁止硬编码）
- [ ] SlotID 遵循 {新工具名}-{位置} 规范，全局无重复
- [ ] 侧边栏广告设置了 MobileHide: true
- [ ] 移动端横幅广告设置了 Mobile: "320x50"
- [ ] dev 环境启动后广告位区域不渲染真实广告
- [ ] config.prod.yaml 中 GoogleAdsID 已填写真实 Publisher ID
```

## 五、常见错误处理

| 错误情况 | 正确处理方式 |
|----------|------------|
| Handler 直接写 `cfg.GoogleAdsID` | 改为 `c.GetString("AdsClientID")`，依赖中间件注入 |
| 模板中出现 `ca-pub-` 硬编码 | 全部替换为 `.AdsClientID` |
| 新路由未在 toolGroup 下注册 | 将路由移入正确路由组，或为该组补加 `middleware.AdsConfig(cfg)` |
| 不确定广告位尺寸 | 按位置推断：顶部/底部 → `728x90`，侧边栏 → `300x250` |
| SlotID 与已有页面重复 | 报警提示用户，确保工具名前缀唯一 |
| 多套 A/B 实验广告位 | SlotID 加后缀 `-a` / `-b`，并附注释说明实验目的 |
| 用户只说了路由没给文件内容 | 先列出假设条件请用户确认，再输出代码 |

## 六、数据流全景图

```
config.prod.yaml
  GoogleAdsID: "ca-pub-xxx"
  EnableAds: true
        ↓
Config 结构体（唯一数据源）
  .GoogleAdsID  .EnableAds
        ↓
middleware.AdsConfig(cfg)
  c.Set("AdsClientID", cfg.GoogleAdsID)
  c.Set("AdsEnabled",  cfg.EnableAds)
        ↓
Handler gin.H{}
  "AdsClientID": c.GetString("AdsClientID")
  "AdsEnabled":  c.GetBool("AdsEnabled")
        ↓
HTML 模板
  {{- template "partials/ad_slot.html" dict ... "ClientID" .AdsClientID "Enabled" .AdsEnabled }}
        ↓
ad_slot.html partial（统一渲染逻辑）
  Enabled=false → 不渲染任何广告 DOM
  Enabled=true  → 渲染 <ins> 标签，data-ad-client 来自 ClientID
```

## 七、输出规范

- **代码注释**：与原文件语言保持一致（原中文保留中文，原英文保留英文）
- **说明文字**：与用户当前对话语言一致
- **SlotID / 配置 Key**：统一英文小写 + 连字符
- **输出顺序**：扫描结果 → 后端改造结论 → diff 代码 → 验收清单
- **改动超过 10 处时**：输出完整替换后的文件，而非 diff
