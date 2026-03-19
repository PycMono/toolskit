# 二维码生成工具 — 需求代码块总览索引

> 竞品对标：https://www.qr-code-generator.com  
> 路由分组：`/media`（多媒体工具组）  
> 技术方向：**纯前端生成**（qr-code-styling + qrcode.js）  
> 唯一后端：EPS 高清矢量图下载（Go 后端 SVG→EPS 转换）  
> 主色：**靛蓝 #4f46e5**，与 PDF（红）/ 图片压缩（绿）/ JSON（橙）明显区分

---

## 📐 产品架构图

```
用户选择 QR 码类型（URL / vCard / 文本 / 短信 / 邮件 / WiFi / Twitter / 比特币）
        ↓
  填写内容表单（每种类型独立字段）
        ↓
  前端内容编码（格式化为 QR 标准字符串）
        ↓
  qr-code-styling 生成引擎（浏览器内完成）
  ├─ 基础 QR 矩阵生成
  ├─ 样式渲染（颜色 / 渐变 / Dot 形状 / 角落形状）
  ├─ Logo 合成（Canvas 叠加）
  └─ 边框（Frame）文字合成
        ↓
  实时预览（Canvas 300×300）
        ↓
  下载
  ├─ PNG（前端 Canvas.toBlob，高清 2048px）
  ├─ SVG（前端 qr-code-styling SVG 输出）
  ├─ JPG（前端 Canvas.toBlob，白底）
  └─ EPS（后端：SVG → EPS 转换，Go 处理）
```

---

## 🎯 竞品功能全量对标（qr-code-generator.com vs 本次实现）

### QR 码内容类型

| 类型 | 竞品 | 本次实现 | 说明 |
|------|------|---------|------|
| URL | ✅ | ✅ | 网址二维码 |
| vCard | ✅ | ✅ | 数字名片（含 Save to Phone）|
| Plain Text | ✅ | ✅ | 纯文本（最多 300 字符）|
| SMS | ✅ | ✅ | 预设短信内容 + 号码 |
| Email | ✅ | ✅ | 预设邮件主题 + 正文 |
| WiFi | ✅ | ✅ | SSID + 密码 + 加密类型 |
| Twitter/X | ✅ | ✅ | 预设推文内容 |
| Bitcoin / 加密货币 | ✅ | ✅ | 钱包地址 + 金额 |

### 设计定制

| 功能 | 竞品 | 本次实现 | 说明 |
|------|------|---------|------|
| 前景色 | ✅ | ✅ | 颜色选择器 |
| 背景色 | ✅ | ✅ | 颜色选择器 + 透明 |
| 渐变色 | ✅ Pro | ✅ **免费** | 线性/径向渐变 |
| Dot 形状 | ✅ | ✅ 6种 | square/rounded/dots/classy/classy-rounded/extra-rounded |
| 角落方块形状 | ✅ | ✅ 3种 | square/extra-rounded/dot |
| 角落点形状 | ✅ | ✅ 2种 | square/dot |
| Logo 嵌入 | ✅ Pro | ✅ **免费** | 上传图片到 QR 中心 |
| Logo 大小调整 | ✅ | ✅ | 滑块控制 |
| 边距调整 | ✅ | ✅ | 0~50px |
| 纠错级别 | ✅ | ✅ | L/M/Q/H |

### 边框（Frame）

| 功能 | 竞品 | 本次实现 | 说明 |
|------|------|---------|------|
| 无边框 | ✅ | ✅ | 默认 |
| 方形边框 + 文字 | ✅ | ✅ | 底部文字 |
| 圆角边框 + 文字 | ✅ | ✅ | 多种形状 |
| 边框颜色 | ✅ | ✅ | |
| 边框文字自定义 | ✅ | ✅ | 如「扫码查看」|
| 边框文字颜色 | ✅ | ✅ | |

### 下载格式

| 格式 | 竞品 | 本次实现 | 说明 |
|------|------|---------|------|
| JPG | ✅ 免费 | ✅ 前端 | Canvas toBlob |
| PNG | ✅ 注册 | ✅ 前端 | 高清 2048px |
| SVG | ✅ 注册 | ✅ 前端 | 矢量，无限缩放 |
| EPS | ✅ 注册（黑白）| ✅ **后端** | SVG→EPS，Go 转换 |

---

## 📋 Block 清单（共 8 块）

| Block | 文件 | 核心内容 | 工时 |
|-------|------|---------|------|
| **QR-00** | 总览索引 | 本文档 | — |
| **QR-01** | 路由+SEO+i18n+sitemap | 路由注册 / Handler / 全量 i18n Key / 广告位 / sitemap | 1.5h |
| **QR-02** | 主页 Landing + 布局 | Hero + 类型选择 Tab + 三步引导 + 特性介绍 + FAQ | 2h |
| **QR-03** | 内容输入面板 | 8 种类型的表单 HTML + 内容编码逻辑 | 2.5h |
| **QR-04** | 前端生成引擎 | qr-code-styling 封装 / 实时预览 / 高清导出 | 2h |
| **QR-05** | 设计定制面板 | 颜色/渐变/Dot形状/角落/Logo上传/边距/纠错 | 3h |
| **QR-06** | 边框（Frame）+ 下载 | 8种边框模板 / Canvas 合成 / PNG/SVG/JPG/EPS 下载 | 2.5h |
| **QR-07** | 后端 EPS 接口 | Go SVG→EPS 转换 API | 1h |

**总计：约 14.5h（1.5~2 天）**

---

## 🗺 路由规划

```
/media/qr                    ← 工具主页（Landing + 生成器一体）
/media/qr?type=url           ← URL 类型（默认）
/media/qr?type=vcard         ← vCard
/media/qr?type=text          ← 纯文本
/media/qr?type=sms           ← 短信
/media/qr?type=email         ← 邮件
/media/qr?type=wifi          ← WiFi
/media/qr?type=twitter       ← Twitter/X
/media/qr?type=bitcoin       ← 比特币

# 后端 API（唯一需要后端的接口）
POST /media/qr/api/eps       ← SVG → EPS 下载
```

---

## 🔧 前端依赖（全部 CDN 引入）

```html
<!-- qr-code-styling：支持自定义形状/颜色/Logo/渐变 -->
<script src="https://cdn.jsdelivr.net/npm/qr-code-styling@1.6.0/lib/qr-code-styling.js"></script>

<!-- FileSaver：触发浏览器下载 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>

<!-- html2canvas（边框文字合成备用方案）-->
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
```

---

## 🎨 设计风格定调

- **主色**：靛蓝 `#4f46e5`，hover 深色 `#4338ca`，浅背景 `#eef2ff`
- **背景**：浅米白 `#fafaf8`，卡片白色，边框 `#e8e4dc`
- **布局**：左侧内容配置区（类型选择 + 表单 + 设计选项）+ 右侧实时预览区
- **移动端**：上下堆叠，预览区在上，配置在下
- **预览区**：居中展示 QR 码 + 下载按钮，带扫码测试提示
- **差异化亮点**：渐变色免费用、Logo 嵌入免费用、SVG 下载免费、8 种 Dot 形状

---

## 🔑 i18n Key 前缀清单

```
qr.common.*        公共文案（生成/下载/复制/清空/提示）
qr.hero.*          Hero 区域文案
qr.type.*          类型选择文案（8种类型名称/描述）
qr.form.*          各类型表单字段标签
qr.design.*        设计面板文案
qr.frame.*         边框选择文案
qr.download.*      下载区文案（格式/尺寸）
qr.feature.*       特性介绍
qr.faq.*           FAQ
qr.error.*         错误提示
```

---

## 🗺 sitemap 新增条目

```xml
<url>
  <loc>https://devtoolbox.dev/media/qr</loc>
  <lastmod>2026-03-01</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>
</url>
<url>
  <loc>https://devtoolbox.dev/media/qr?lang=zh</loc>
  <priority>0.85</priority>
</url>
<url>
  <loc>https://devtoolbox.dev/media/qr?lang=en</loc>
  <priority>0.85</priority>
</url>
```
