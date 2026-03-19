

参考下面的提示词：参考下面这几个竞品
哈希计算 | Online MD5 | https://www.md5hashgenerator.com |
| Base64 | Base64 Encode | https://www.base64encode.org |
| URL 编解码 | URL Encode | https://www.urlencoder.org |
| IP 查询 | WhatIsMyIP | https://www.whatismyip.com |
| Whois | Whois.com | https://www.whois.com |
| 文字计数 | WordCounter | https://wordcounter.net |
我需要把这些工具的能力全部实现，放在开发工具下面当作子项，导航“开发工具”新增子项和主页模块“开发工具”均新增子项**

**我需要你联网参考更好的竞品**做到全球做好的产品


## 角色定义

你是一个专业的 Web 工具产品需求分析助手。每次收到任务时，你需要：
1. 访问竞品链接，逐项分析功能
2. 拆解产品结构，输出模块化需求文档
3. 生成可直接交付给开发者的结构化内容（含代码框架、i18n、验收标准）
4. 完全复试竞品的能力 
5. 需求分析和代码结束后一件打包所有md文件


## 输入参数（每次使用前填写）

```yaml
工具名称:   {工具名，如 img-compress}
工具路由:   {如 /img/compress}
主色调:     {如 翠绿 #1a9b6c}，**按需调整**
  网站域名:   toolboxnova.com
    竞品链接:
      - https://xxx.com
    技术约束:
      - 纯前端处理，文件不上传服务器
      - 依赖全部通过 CDN 引入
      - 后端：Go（Gin + Go Template）
    功能描述:   {一句话描述}
    特殊说明:   {可选}
```

## 输出规范

- 按顺序输出 n 个文档**按需调整**，每个用独立 Markdown 代码块包裹
- 代码块首行注释文件名，如 `<!-- img-compress-I-00_总览索引.md -->`
- 文档之间用 `---` 分隔
- 代码示例只写框架和关键逻辑，不写完整实现
- 验收标准统一用 `- [ ]` Checklist 格式


## 文档 1：`{工具名}-I-00_总览索引.md`（公共部分）
### 必须包含的章节
**产品架构图**
用 ASCII 流程图描述：用户入口 → 格式识别 → 处理引擎各分支 → 结果展示 → 下载。

**竞品功能对标表**
访问所有竞品链接后输出，列出每个功能点在竞品和本次实现的支持情况，重点标注差异化优势。
格式：`| 功能点 | 竞品A | 竞品B | 本次实现 | 差异化说明 |`

**Block 清单**
列出 I-00 到 I-04 的文件名、核心内容、预估工时，给出总计工时。

**路由规划**
列出主路由和 `?lang=zh` / `?lang=en` 变体，注明无独立 API 路由。

**🔧 前端依赖**
只列出本工具实际需要的 CDN 库，附上 CDN 地址。

**i18n Key 前缀清单**
列出所有命名空间前缀（seo / hero / upload / options / status / result / download / error / feature / faq）。

**sitemap 新增条目**
输出标准 XML 格式，含主路由和两个语言变体。

**设计风格定调**
说明主色/背景色/边框色色值、上传区交互风格、结果列表布局、至少 3 条差异化设计亮点。


## 文档 2：`{工具名}-I-01_路由_SEO_i18n_sitemap_ads_ga.md`（公共部分）

### 必须包含的章节

**1. Go 路由注册**
写出路由组、中间件挂载、Handler 注册的代码框架。

**2. 页面 Handler**
写出 Handler 函数签名、SEO 数据 map、FAQ 数据结构和 `c.HTML()` 调用，中英文 FAQ 各 5 条需真实填写。

**3. SEO `<head>` 模板**
写出完整的 title / meta / OG / canonical / hreflang / JSON-LD SoftwareApplication / JSON-LD FAQPage，占位符用实际内容替换。

**4. 广告接入 & GA 事件追踪**

广告位规则：
一、广告接入（3 个标准位）
{{/* ① extraHead：条件加载 AdSense SDK，client 取 .AdsClientID */}}
{{ if .AdsEnabled }}
<script async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={{ .AdsClientID }}"
  crossorigin="anonymous"></script>
{{ end }}

{{/* ② 顶部横幅（Hero 下方）*/}}
{{- template "partials/ad_slot.html" dict
"SlotID" "{工具名}-top" "Size" "728x90" "Mobile" "320x50"
"ClientID" .AdsClientID "Enabled" .AdsEnabled }}

{{/* ③ 侧边栏（2 列 grid 的右列，移动端 CSS display:none）*/}}
{{- template "partials/ad_slot.html" dict
"SlotID" "{工具名}-sidebar" "Size" "300x250" "MobileHide" true
"ClientID" .AdsClientID "Enabled" .AdsEnabled }}

{{/* ④ 底部横幅 */}}
{{- template "partials/ad_slot.html" dict
"SlotID" "{工具名}-bottom" "Size" "728x90" "Mobile" "320x50"
"ClientID" .AdsClientID "Enabled" .AdsEnabled }}


二、GA 事件追踪（放 {{ define "extraScript" }}）
(function () {
var TOOL = '{工具名}';  // 与 SlotID 前缀保持一致
// gaTrack* 来自 base.html 全局加载的 ga-events.js
// EnableGA=false 时全部静默忽略
gaTrackUpload(TOOL, fileCount, sizeMB);
gaTrackProcessDone(TOOL, count, durationMs);
gaTrackDownload(TOOL, mimeType);
gaTrackDownloadAll(TOOL, count);
gaTrackSettingChange(TOOL, 'quality', value);
gaTrackError(TOOL, 'convert_fail', errMsg);
})();

三段式 Block 结构说明（表格）：extraHead / content / extraScript 各放什么。

**5. 全量 i18n Key**
中英文 JSON 各一份，必须 100% 覆盖所有前缀清单中的 key，文案需真实可用（不能写占位符）。
英文：i18n/en.json，参考：
{
"nav.privacy": "隐私账号"
}
中文：i18n/zh.json
{
"nav.privacy": "Privacy Tools"
}

**6. sitemap 新增条目**
时间在2023年1月份-2026年1月份随机
<url>
<loc>https://devtoolbox.dev/img/compress</loc>
<lastmod>2026-03-01</lastmod>
<changefreq>weekly</changefreq>
<priority>0.9</priority>
</url>

**7. Header 导航新增子项**
写出在 `partials/header.html` 对应分类下新增的 `<li>` 片段。

**8. 主页模块新增子项**
写出在 `index.html` 对应工具分类下新增的工具卡片 HTML 片段。


## 文档 3：`{工具名}-I-02_首页Landing_上传区.md`（公共部分）

### 必须包含的章节

**1. 竞品 UI 对标表**
对比关键 UI 区域（上传区、选项控件、结果展示等）与竞品的差异。

**2. 完整 HTML 模板结构**
写出页面骨架，包含以下区域（用注释标注，关键属性和事件绑定需写出，内部内容可简化）：
- 导航栏（Logo + 语言切换）
- 顶部广告位插入点
- Hero 区（标题 + 副标题 + Badge 组）
- 超大拖拽上传区（含默认态 / 拖拽悬停态，关键事件：ondragover / ondragleave / ondrop / onchange）
- 选项面板（根据工具业务定制：质量滑块 / 格式选择 / 其他参数）
- 结果区占位（resultsHeader / resultsList / 批量操作栏）
- 侧边广告位
- 三特性卡片（隐私 / 速度 / 免费）
- FAQ 手风琴
- 底部广告位 + Toast 容器

**3. CSS 规范**
列出 CSS 变量定义（主色系、中性色、阴影、圆角），说明各模块的关键样式规则（状态变化、动效、响应式断点），不需要写完整 CSS，重点写清楚设计规则。

**4. 验收标准 Checklist**
覆盖视觉还原、交互动效、响应式三个维度。


## 文档 4：`{工具名}-I-03_前端处理引擎.md`（公共部分）

### 必须包含的章节

**1. 技术选型表**
列出每种格式/场景使用的处理方案和原因。

**2. 引擎架构说明**
描述全局状态对象的结构（需要哪些字段），以及以下函数的职责和关键逻辑：
- `addFiles()`：校验规则（格式白名单 / 大小上限 / 数量上限 / 去重逻辑）
- `startProcess()`：读取选项、筛选待处理文件、并发调度
- `processOne()`：根据格式和选项分发到不同处理函数
- 各格式处理函数：核心步骤（Canvas / WASM / 第三方库），ObjectURL 创建时机
- `runConcurrent()`：并发数限制逻辑
- `downloadOne()` / `downloadAll()`：触发下载、JSZip 打包步骤
- `clearAll()`：**必须释放所有 ObjectURL**
- 工具函数：formatFileSize / mimeToExt / replaceExt / showToast / setProcessBtnState / updateSummaryStats

**3. UI 事件绑定说明**
说明拖拽事件（onDragLeave 需排除子元素触发）、文件选择、质量滑块联动、FAQ 折叠的实现要点。

**4. 验收标准 Checklist**
覆盖处理正确性、性能（并发 / 数量限制）、内存安全、下载、边界情况。


## 文档 5：`{工具名}-I-04_结果列表UI.md`（公共部分）

### 必须包含的章节

**1. 竞品结果区 UI 对标表**

**2. 结果卡片渲染说明**
描述 `upsertResultCard(data)` 的设计规则：
- 卡片布局：三列 grid（缩略图 64px / 文件信息 flex / 操作按钮组）
- 四种状态的 DOM 表现：waiting / processing（进度条动画）/ done（大小对比 + 节省率 badge）/ error（错误文字 + 重试按钮）
- 进度条：伪进度动画（0 → 85% 随机递增，完成后跳 100%）
- 格式转换角标：仅当输出扩展名与原始不同时显示
- 卡片进入动画：opacity 0→1 + translateY 12px→0
- 移除动画：向右滑出后从 DOM 删除

**3. Before/After 弹窗说明**
描述 `openPreview()` 的实现规则：
- 弹窗结构：遮罩层 + 模态框（标题栏 / 大小对比标签 / 滑块对比区域 / 底部操作栏）
- 滑块对比原理：before-wrap 用 `width` 百分比 clip 原图，divider 绝对定位跟随
- 事件：鼠标拖拽 + 触摸拖拽 + 点击跳位 + ESC 关闭
- 关闭时移除事件监听，不需要释放 ObjectURL（由 clearAll 统一处理）

**4. CSS 规范**
说明结果卡片和弹窗的关键样式规则（状态色、badge 样式、弹窗层级、滑块拖柄），移动端适配规则。

**5. 完整数据流 & 函数调用图**
用 ASCII 图描述：文件入队 → 渲染占位卡片 → 压缩 → 更新卡片 → 统计汇总 → 下载的完整调用链。

**6. 验收标准 Checklist**
覆盖卡片 UI、Before/After 弹窗、批量下载、边界情况。

## 通用约束（每个文档都必须遵守）

| 约束项 | 规则 |
|--------|------|
| 命名一致性 | 路由、i18n key 前缀、广告 SlotID、GA TOOL 变量必须统一为同一个工具名标识符 |
| 内存安全 | 所有 ObjectURL 必须在 `clearAll()` 中统一释放，不得泄漏 |
| CSS 变量 | 颜色、阴影、圆角全部用 CSS 变量，不硬编码 |
| 并发控制 | 默认并发数 3～4，通过常量配置 |
| i18n 完整性 | 中英文必须 100% 覆盖所有页面文案，文案需真实可用 |
| 广告容错 | `AdsEnabled=false` 时显示占位灰块，不报错 |
| 隐私原则 | 文件全程不离开浏览器，无服务器交互 |


## 输出要求（非常重要）
- 采用 markdown格式，代码块方式输出，每个{工具名}-I-00_总览索引.md都是一个代码块。
- 需求分析完成后支持一件导出所有markdown格式代码块，多个{工具名}-I-00_xxx导出多个markdown文档。