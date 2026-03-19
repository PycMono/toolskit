# Developer Tools Suite — I-00 总览索引

**工具标识符：** `dev-tools`
**路由前缀：** `/dev/`
**网站域名：** toolboxnova.com
**主色调：** 极光蓝 `#2563EB` / 辅色 `#7C3AED`
**子工具数量：** 6

---

## 一、产品架构图

```
用户入口 /dev/*
        │
        ├─ /dev/hash ──────► 哈希引擎
        │    输入：文本 / 文件        │
        │    ↓                        ├─ MD5
        │    格式识别                 ├─ SHA-1
        │    ↓                        ├─ SHA-256
        │    Web Crypto API           ├─ SHA-512
        │    ↓                        └─ HMAC-SHA256
        │    结果展示（多算法并排）
        │    ↓
        │    复制 / 下载 .txt
        │
        ├─ /dev/base64 ────► Base64 引擎
        │    输入：文本 / 文件（≤50MB）
        │    ↓
        │    模式选择：Encode / Decode
        │    ↓
        │    选项：URL-safe / MIME-split / 逐行
        │    ↓
        │    TextEncoder + btoa / atob
        │    ↓
        │    结果区 + 文件下载
        │
        ├─ /dev/url-encode ─► URL 编解码引擎
        │    输入：文本 / 完整 URL
        │    ↓
        │    模式：encodeURIComponent / encodeURI /
        │          RFC3986 / decodeURIComponent
        │    ↓
        │    差异高亮对比视图
        │    ↓
        │    结果区 + 复制
        │
        ├─ /dev/ip ─────────► IP 查询引擎
        │    ↓
        │    自动检测本机 IP（ipify API）
        │    ↓
        │    输入任意 IP / 域名
        │    ↓
        │    ip-api.com（JSON）查询地理信息
        │    ↓
        │    Leaflet 地图 + 信息卡片
        │
        ├─ /dev/whois ──────► Whois 查询引擎
        │    输入：域名
        │    ↓
        │    后端 Go 代理（whois 协议 / RDAP）
        │    ↓
        │    原始文本 + 结构化解析视图
        │    ↓
        │    历史记录（localStorage）
        │
        └─ /dev/word-counter ► 文字统计引擎
             输入：实时文本编辑器
             ↓
             实时统计引擎（Web Worker）
             ↓
             统计维度：词数 / 字符 / 句子 / 段落
                       / 阅读时间 / 关键词密度
                       / 可读性评分（Flesch-Kincaid）
             ↓
             可视化图表（Chart.js）
             ↓
             导出 .txt / .pdf
```

---

## 二、竞品功能对标表

| 功能点 | md5hashgenerator | base64encode.org | urlencoder.org | whatismyip.com | wordcounter.net | **本次实现** | 差异化说明 |
|--------|:-:|:-:|:-:|:-:|:-:|:-:|------|
| MD5 哈希 | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | 同页展示 MD5/SHA1/256/512/HMAC |
| SHA-1/256/512 | ❌（独立页） | ❌ | ❌ | ❌ | ❌ | ✅ | 多算法一键对比，无需切页 |
| 文件哈希 | ❌ | ✅（服务端） | ❌ | ❌ | ❌ | ✅ | 支持大文件流式计算，无内存溢出 |
| HMAC | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 行业首创免费在线 HMAC 计算 |
| Base64 编码 | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | 支持 Base64URL、MIME 分行 |
| Base64 文件 | ❌ | ✅（服务端） | ❌ | ❌ | ❌ | ✅ | 纯客户端，文件不离开浏览器 |
| URL 编码 | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | 差异高亮，原文对比视图 |
| URL 批量处理 | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 多行批量编解码 |
| 本机 IP | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | IPv4+IPv6 双栈 + 地理信息 |
| IP 地理定位 | ❌ | ❌ | ❌ | ✅（收费详情） | ❌ | ✅ | 免费 + 地图可视化 |
| ISP / ASN | ❌ | ❌ | ❌ | ✅（会员） | ❌ | ✅ | 免费提供 ASN 信息 |
| Whois 查询 | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | RDAP + 原始文本双视图 |
| Whois 历史 | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 本地历史记录 |
| 词数统计 | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | 中文分词 + 英文词频 |
| 可读性评分 | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | Flesch-Kincaid + 雾指数 |
| 关键词密度 | ❌ | ❌ | ❌ | ❌ | ✅（慢） | ✅ | 实时更新，前 20 词图表 |
| 深色模式 | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 全站统一暗黑主题 |
| 实时处理 | ❌ | ❌（按钮触发） | ❌ | ❌ | ✅ | ✅ | 全部工具支持实时计算 |
| 移动端适配 | ⚠️（基础） | ⚠️ | ⚠️ | ✅ | ✅ | ✅ | 移动优先响应式设计 |
| 无广告 | ❌ | ❌ | ❌ | ❌ | ❌ | ✅（可选） | AdsEnabled 开关 |
| 隐私承诺 | ❌ | ❌（文件上传服务端） | ❌ | ❌ | ❌ | ✅ | 纯客户端，无任何数据上传 |

---

## 三、Block 清单

| 文档编号 | 文件名 | 核心内容 | 预估工时 |
|---------|--------|---------|---------|
| I-00 | `dev-tools-I-00_总览索引.md` | 架构图、竞品对标、路由规划、依赖、i18n 前缀、sitemap、设计风格 | 已完成 |
| I-01 | `dev-tools-I-01_路由_SEO_i18n_sitemap_ads_ga.md` | Go 路由注册（6 个子路由）、Handler、SEO head、广告位、GA、i18n JSON、sitemap XML、导航新增 | 8h |
| I-02 | `dev-tools-I-02_首页Landing_上传区.md` | 6 个工具页面 HTML 骨架、CSS 变量规范、交互说明 | 16h |
| I-03 | `dev-tools-I-03_前端处理引擎.md` | Hash/Base64/URL/IP/Whois/WordCounter 6 引擎 JS 架构、并发、API 调用、Web Worker | 24h |
| I-04 | `dev-tools-I-04_结果列表UI.md` | 各工具结果区 UI、复制动效、历史记录、地图组件、词频图表 | 12h |

**总计预估工时：60h**

---

## 四、路由规划

| 路由 | 工具 | 中文变体 | 英文变体 |
|------|------|---------|---------|
| `/dev/hash` | Hash 计算器 | `/dev/hash?lang=zh` | `/dev/hash?lang=en` |
| `/dev/base64` | Base64 编解码 | `/dev/base64?lang=zh` | `/dev/base64?lang=en` |
| `/dev/url-encode` | URL 编解码 | `/dev/url-encode?lang=zh` | `/dev/url-encode?lang=en` |
| `/dev/ip` | IP 查询 | `/dev/ip?lang=zh` | `/dev/ip?lang=en` |
| `/dev/whois` | Whois 查询 | `/dev/whois?lang=zh` | `/dev/whois?lang=en` |
| `/dev/word-counter` | 文字计数 | `/dev/word-counter?lang=zh` | `/dev/word-counter?lang=en` |

> 无独立 API 路由。Whois 查询通过 `/api/whois?domain=xxx` 后端代理（Go），其余全部纯前端。

---

## 五、🔧 前端依赖（CDN）

| 库 | 用途 | CDN 地址 |
|----|------|---------|
| crypto-js 4.2.0 | HMAC-SHA256（Web Crypto 不支持 HMAC 部分场景） | `https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js` |
| Chart.js 4.4.0 | 词频图表、可读性雷达图 | `https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js` |
| Leaflet 1.9.4 | IP 查询地图 | `https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js` |
| Leaflet CSS | 地图样式 | `https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css` |
| JSZip 3.10.1 | 批量下载打包（hash 多结果导出） | `https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js` |
| FileSaver.js 2.0.5 | 触发浏览器下载 | `https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js` |

> Web Crypto API、TextEncoder、FileReader、Web Worker 均为原生浏览器 API，无需 CDN。

---

## 六、i18n Key 前缀清单

| 前缀 | 命名空间 | 适用工具 |
|------|---------|---------|
| `seo.*` | 页面 title / description / keywords | 全部（含子工具前缀 `seo.hash.*` 等） |
| `hero.*` | 大标题 / 副标题 / Badge | 全部 |
| `input.*` | 输入区标签 / 占位符 / 按钮 | 全部 |
| `options.*` | 选项控件标签 / 提示 | hash / base64 / url-encode |
| `status.*` | 处理状态文案 | 全部 |
| `result.*` | 结果区标签 / 统计数字 | 全部 |
| `copy.*` | 复制按钮 / 复制成功 Toast | 全部 |
| `download.*` | 下载按钮 / 文件名模板 | hash / base64 / word-counter |
| `error.*` | 错误提示文案 | 全部 |
| `feature.*` | 三特性卡片（隐私/速度/免费） | 全部 |
| `faq.*` | FAQ 手风琴（各工具独立 key） | 全部 |
| `map.*` | 地图组件 / 地理信息字段标签 | ip |
| `whois.*` | Whois 字段标签 | whois |
| `stats.*` | 文字统计维度标签 | word-counter |
| `nav.*` | 导航菜单 | 全局 |

---

## 七、sitemap 新增条目

```xml
<!-- 新增至 sitemap.xml -->
<url>
  <loc>https://toolboxnova.com/dev/hash</loc>
  <lastmod>2025-06-15</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>
</url>
<url>
  <loc>https://toolboxnova.com/dev/base64</loc>
  <lastmod>2024-11-20</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>
</url>
<url>
  <loc>https://toolboxnova.com/dev/url-encode</loc>
  <lastmod>2024-03-08</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
<url>
  <loc>https://toolboxnova.com/dev/ip</loc>
  <lastmod>2025-09-12</lastmod>
  <changefreq>daily</changefreq>
  <priority>0.9</priority>
</url>
<url>
  <loc>https://toolboxnova.com/dev/whois</loc>
  <lastmod>2023-07-03</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
<url>
  <loc>https://toolboxnova.com/dev/word-counter</loc>
  <lastmod>2026-01-18</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
```

---

## 八、设计风格定调

### 色彩系统

```css
/* 主色系 */
--color-primary: #2563EB;          /* 极光蓝 - 按钮/链接 */
--color-primary-dark: #1D4ED8;     /* 深蓝 - hover */
--color-primary-light: #DBEAFE;    /* 浅蓝 - 背景/Badge */
--color-secondary: #7C3AED;        /* 深紫 - 辅色/特殊 Badge */
--color-secondary-light: #EDE9FE;

/* 中性色 */
--color-bg: #F8FAFC;               /* 页面背景 */
--color-surface: #FFFFFF;          /* 卡片背景 */
--color-border: #E2E8F0;           /* 边框 */
--color-text-primary: #0F172A;     /* 主文字 */
--color-text-secondary: #64748B;   /* 次级文字 */
--color-text-muted: #94A3B8;       /* 占位文字 */

/* 语义色 */
--color-success: #10B981;          /* 成功/复制完成 */
--color-warning: #F59E0B;
--color-error: #EF4444;

/* 暗黑模式覆盖 */
[data-theme="dark"] {
  --color-bg: #0F172A;
  --color-surface: #1E293B;
  --color-border: #334155;
  --color-text-primary: #F1F5F9;
  --color-text-secondary: #94A3B8;
}
```

### 差异化设计亮点

1. **双栏 Split-Panel 布局**：输入区（左/上）与结果区（右/下）实时联动，无需点击按钮，输入即出结果，体验优于所有竞品的"点按钮触发"模式。

2. **算法徽章（Algorithm Badge）**：Hash 工具将 MD5/SHA-1/SHA-256/SHA-512 结果以彩色 Badge + 卡片形式横向并排展示，用户一目了然，无需切换页面，竞品均需跳转独立页面。

3. **代码编辑器风格 Textarea**：等宽字体 `JetBrains Mono`（CDN 加载），行号显示，语法区分输入/输出背景色（`#F0FDF4` 绿色代表输出），视觉上区别于普通文本框。

4. **IP 地图固定高度卡片**：Leaflet 地图嵌入右侧，无需跳转 Google Maps，ISP/ASN/时区/坐标字段结构化排列，视觉密度高于 WhatIsMyIP。

5. **Word Counter Flow Score 指示器**：借鉴 wordcounter.net 的句长可视化，用颜色区分不同句长区间，实时在段落旁显示，提升写作体验。

6. **一键全部复制 + 格式切换**：Base64 / URL Encode 工具支持输出格式即时切换（如 Base64URL vs 标准 Base64），无需重新计算，动画过渡。
