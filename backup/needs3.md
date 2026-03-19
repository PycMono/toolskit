# DevToolBox — 多媒体工具模块 + PDF 工具箱 + Google Ads 高价值功能扩展完整需求文档

> 本文档为增量补充，覆盖三个维度：
> 1. 截图中已有的多媒体工具（图片压缩、视频转换、颜色转换、单位换算）完整需求
> 2. PDF 工具箱完整需求（参考 pdfhouse.com + pdf24.org 全量功能）
> 3. Google Ads 高价值新功能模块推荐（附竞品）
>
> 所有页面延续已有规范：支持中英文切换、独立 SEO 路由、Google Ads 广告位、底部 Footer。

---

## 竞品参考汇总

| 模块 | 竞品 | 地址 |
|------|------|------|
| PDF 全套 | PDF House | https://pdfhouse.com |
| PDF 全套 | PDF24 Tools | https://tools.pdf24.org |
| PDF 全套 | Smallpdf | https://smallpdf.com |
| PDF 全套 | iLovePDF | https://www.ilovepdf.com |
| PDF 全套 | PDF2Go | https://www.pdf2go.com |
| 图片压缩 | Squoosh | https://squoosh.app |
| 图片压缩 | TinyPNG | https://tinypng.com |
| 图片压缩 | Compress PNG | https://compresspng.com |
| 视频转换 | Convertio | https://convertio.co |
| 视频转换 | CloudConvert | https://cloudconvert.com |
| 颜色工具 | Coolors | https://coolors.co |
| 颜色工具 | HTML Color Codes | https://htmlcolorcodes.com |
| 单位换算 | UnitConverters | https://www.unitconverters.net |
| 单位换算 | ConvertUnits | https://www.convertunits.com |
| 贷款计算器 | Bankrate | https://www.bankrate.com/calculators |
| 汇率换算 | Wise | https://wise.com/currency-converter |
| 二维码生成 | QR Code Generator | https://www.qr-code-generator.com |
| 哈希计算 | Online MD5 | https://www.md5hashgenerator.com |
| Base64 | Base64 Encode | https://www.base64encode.org |
| URL 编解码 | URL Encode | https://www.urlencoder.org |
| IP 查询 | WhatIsMyIP | https://www.whatismyip.com |
| Whois | Whois.com | https://www.whois.com |
| 文字计数 | WordCounter | https://wordcounter.net |
| OCR | OnlineOCR | https://www.onlineocr.net |

---

## 路由总表（本文档新增）

### 多媒体工具（`/tools/media`）

| 路由 | 工具 |
|------|------|
| `/tools/media` | 多媒体工具导航 |
| `/tools/media/image-compress` | 图片压缩 |
| `/tools/media/image-convert` | 图片格式转换 |
| `/tools/media/image-resize` | 图片裁剪/缩放 |
| `/tools/media/video-convert` | 视频格式转换 |
| `/tools/media/color-converter` | 颜色转换 |
| `/tools/media/color-picker` | 在线取色器 |
| `/tools/media/color-palette` | 配色方案生成器 |
| `/tools/media/unit-converter` | 单位换算 |
| `/tools/media/qr-generator` | 二维码生成器 |
| `/tools/media/qr-reader` | 二维码识别 |

### PDF 工具（`/tools/pdf`）

| 路由 | 工具 |
|------|------|
| `/tools/pdf` | PDF 工具导航首页 |
| `/tools/pdf/compress` | 压缩 PDF |
| `/tools/pdf/merge` | 合并 PDF |
| `/tools/pdf/split` | 拆分 PDF |
| `/tools/pdf/rotate` | 旋转 PDF |
| `/tools/pdf/watermark` | 添加水印 |
| `/tools/pdf/protect` | 加密 PDF |
| `/tools/pdf/unlock` | 解密 PDF |
| `/tools/pdf/to-word` | PDF 转 Word |
| `/tools/pdf/to-excel` | PDF 转 Excel |
| `/tools/pdf/to-ppt` | PDF 转 PowerPoint |
| `/tools/pdf/to-jpg` | PDF 转 JPG |
| `/tools/pdf/to-png` | PDF 转 PNG |
| `/tools/pdf/to-txt` | PDF 转文本 |
| `/tools/pdf/word-to-pdf` | Word 转 PDF |
| `/tools/pdf/excel-to-pdf` | Excel 转 PDF |
| `/tools/pdf/ppt-to-pdf` | PowerPoint 转 PDF |
| `/tools/pdf/jpg-to-pdf` | JPG 转 PDF |
| `/tools/pdf/png-to-pdf` | PNG 转 PDF |
| `/tools/pdf/html-to-pdf` | HTML 转 PDF |
| `/tools/pdf/txt-to-pdf` | TXT 转 PDF |
| `/tools/pdf/reorder` | 重排页面 |
| `/tools/pdf/delete-pages` | 删除页面 |
| `/tools/pdf/extract-pages` | 提取页面 |
| `/tools/pdf/page-numbers` | 添加页码 |
| `/tools/pdf/ocr` | PDF OCR 文字识别 |
| `/tools/pdf/sign` | PDF 电子签名 |
| `/tools/pdf/all` | 全部 PDF 工具 |

### 高价值新功能模块

| 路由 | 工具 |
|------|------|
| `/tools/security/hash` | 哈希计算器（MD5/SHA） |
| `/tools/security/base64` | Base64 编解码 |
| `/tools/security/url-encode` | URL 编解码 |
| `/tools/security/html-encode` | HTML 编解码 |
| `/finance/loan-calculator` | 贷款计算器 |
| `/finance/mortgage-calculator` | 房贷计算器 |
| `/finance/currency-converter` | 实时汇率换算 |
| `/finance/tax-calculator` | 个税计算器 |
| `/tools/network/ip-lookup` | IP 地址查询 |
| `/tools/network/whois` | 域名 Whois 查询 |
| `/tools/network/dns-lookup` | DNS 查询 |
| `/tools/text/word-counter` | 文字/字数统计 |
| `/tools/text/lorem-ipsum` | Lorem Ipsum 生成器 |
| `/tools/text/diff` | 文本对比工具 |
| `/tools/media/ocr` | 图片文字识别（OCR） |

---

## 一、多媒体工具模块（`/tools/media`）

### 多媒体工具导航首页（`/tools/media`）

**页面标题**：`Free Online Media Tools - Image Compress, Video Convert, Color | DevToolBox`

**工具卡片网格**（与截图一致的 Tab 卡片布局）：

| 卡片 | 图标颜色 | 副标题 |
|------|----------|--------|
| 图片压缩 | 蓝色 📷 | JPG/PNG 压缩 |
| 图片格式转换 | 蓝色 🖼 | JPG/PNG/WEBP 互转 |
| 图片裁剪缩放 | 蓝绿 ✂️ | 自由裁剪/指定尺寸 |
| 视频转换 | 红色 🎬 | 格式转换 |
| 颜色转换 | 彩色 🎨 | HEX/RGB/HSL |
| 在线取色器 | 彩色 🖌 | 从图片取色 |
| 配色方案 | 彩色 🌈 | 自动生成配色 |
| 单位换算 | 橙黄 📏 | 长度/重量/温度 |
| 二维码生成 | 紫色 ◼ | 自定义 QR Code |
| 二维码识别 | 紫色 🔍 | 上传识别 |

---

### 工具 M1：图片压缩（`/tools/media/image-compress`）

**页面标题**：`Free Image Compressor Online - Compress JPG PNG | DevToolBox`
**Meta Description**：Compress images online for free. Reduce JPG, PNG, WEBP file size without visible quality loss. No upload limit, batch compress up to 20 images.

**布局**：

**上传区（大面积拖拽区）**：
```
┌─────────────────────────────────────────────────────┐
│                   ☁ 上传图片图标                     │
│         拖放图片到此处，或点击选择                    │
│              [选择图片] 蓝色主按钮                   │
│         支持 JPG、PNG、WEBP，最大 20MB               │
│            支持批量上传（最多 20 张）                 │
└─────────────────────────────────────────────────────┘
```

**压缩设置栏**（上传后显示）：
- 压缩质量滑块（1–100，默认 80）
- 输出格式：`保持原格式` / `JPG` / `PNG` / `WEBP`
- 最大宽度限制（可选，空=不限制）
- 保留 EXIF 数据：开关

**图片列表区**（上传后，每张图片一行）：

```
┌──────────────────────────────────────────────────────────┐
│ 🖼 缩略图 │ 文件名.jpg  原始: 2.3MB  →  压缩后: 456KB  ▼80%│
│           │ 质量: [────●────] 80    [重新压缩] [下载] [删除]│
└──────────────────────────────────────────────────────────┘
```

- 每行显示：缩略图、文件名、原始大小、压缩后大小、节省比例（绿色百分比）
- 支持单张独立调整质量后重新压缩
- 压缩进度条（实时显示处理状态）

**批量操作按钮区**（底部）：
- `⚡ 全部压缩` 按钮（蓝色主按钮）
- `📦 下载全部（ZIP）` 按钮
- `🗑 清空全部` 按钮

**压缩统计汇总**（所有处理完成后）：
```
总计压缩了 5 张图片
原始总大小：12.4 MB → 压缩后：2.8 MB
共节省：9.6 MB（77.4%）🎉
```

**实现方式**：
- 使用 `browser-image-compression` JS 库（前端纯压缩）
- WEBP 转换使用 Canvas API（`toBlob('image/webp', quality)`）
- 不上传服务器，所有处理在浏览器完成
- 下载 ZIP 使用 `JSZip` 库

**右侧说明面板**：
- 关于工具
- 支持格式列表
- 压缩原理简介（有损/无损说明）

---

### 工具 M2：图片格式转换（`/tools/media/image-convert`）

**页面标题**：`Image Format Converter - Convert JPG PNG WEBP Online | DevToolBox`

**布局**：与图片压缩相同的上传区

**转换设置**：
- 目标格式选择：`JPG` / `PNG` / `WEBP` / `GIF` / `BMP` / `ICO`（ICO 仅支持 ≤256px）
- 输出质量（JPG/WEBP 有损格式时显示）
- 透明背景处理（PNG→JPG 时）：填充颜色选择器（默认白色）
- ICO 尺寸选择（16/32/64/128/256px）

**转换结果展示**：同图片压缩列表布局，显示格式变更信息

---

### 工具 M3：图片裁剪/缩放（`/tools/media/image-resize`）

**页面标题**：`Image Resizer & Cropper Online - Resize Images Free | DevToolBox`

**上传单张图片后进入编辑界面**：

**左侧预览区**（含裁剪框）：
- 使用 `Cropper.js` 实现可拖拽裁剪框
- 裁剪框可自由拖拽、调整大小
- 显示当前选区尺寸（px）

**右侧设置面板**：

**缩放设置**：
- 宽度输入框（px）
- 高度输入框（px）
- 锁定宽高比开关（默认开）
- 预设尺寸快捷按钮：
    - 社交媒体：`1080×1080`（Instagram）、`1200×630`（Facebook）、`1500×500`（Twitter 封面）
    - 头像：`200×200`、`400×400`
    - 壁纸：`1920×1080`、`2560×1440`

**裁剪设置**：
- 裁剪比例：`自由` / `1:1` / `4:3` / `16:9` / `3:4` / `9:16`
- 旋转：`-90°` / `+90°` / 自由输入角度
- 翻转：水平翻转 / 垂直翻转

**输出设置**：
- 格式：JPG / PNG / WEBP
- 质量滑块

**`应用 & 下载`** 按钮

---

### 工具 M4：视频转换（`/tools/media/video-convert`）

**页面标题**：`Free Online Video Converter - Convert MP4 AVI MOV | DevToolBox`
**Meta Description**：Convert video files online. MP4 to AVI, MOV to MP4, WebM to MP4 and more. Free, no software install needed.

**重要说明**：视频转换**需要后端处理**（FFmpeg），前端只负责上传和展示结果。

**布局**：

**上传区**：
- 拖拽或点击上传（支持 MP4、AVI、MOV、MKV、WEBM、FLV、WMV）
- 最大文件 500MB
- 显示上传进度条

**转换设置**（上传完成后显示）：

目标格式选择（大图标按钮网格）：
```
[ MP4 ]  [ AVI ]  [ MOV ]  [ MKV ]  [ WEBM ]  [ GIF ]  [ MP3 ]
```

高级选项（可折叠）：
- 视频分辨率：`保持原始` / `1080p` / `720p` / `480p` / `360p`
- 视频码率：自动 / 自定义（Kbps）
- 音频码率：自动 / 自定义（Kbps）
- 开始/结束时间裁剪（视频剪辑功能）：时间输入框（`00:00:00`）
- 静音（移除音频）

**转换进度**：
- 百分比进度条
- 预计剩余时间
- 实时日志输出（可折叠）

**结果展示**：
- 原始文件信息（格式/大小/时长/分辨率）
- 转换后文件信息
- `⬇ 下载` 大按钮
- 文件在服务器上保留 1 小时后自动删除（显示倒计时）

**后端接口**（Gin + FFmpeg）：
```
POST /api/media/video/upload     上传原始文件，返回 file_id
POST /api/media/video/convert    提交转换任务，返回 task_id
GET  /api/media/video/status/:task_id  查询进度（SSE 或轮询）
GET  /api/media/video/download/:task_id  下载转换结果
```

---

### 工具 M5：颜色转换（`/tools/media/color-converter`）

**页面标题**：`Color Converter - HEX RGB HSL CMYK Online | DevToolBox`

**布局**：大色块预览 + 多格式输入联动

**颜色预览区**（页面顶部）：
- 大面积色块（实时显示当前颜色）
- 颜色名称（如果是标准颜色，如 `Tomato`）

**格式输入联动区**（任意一个修改，其他实时同步）：

```
HEX    [ #FF6347      ]  📋
RGB    [ R:255 G:99 B:71 ]  📋
HSL    [ H:9° S:100% L:64% ]  📋
HSV    [ H:9° S:72% V:100% ]  📋
CMYK   [ C:0% M:61% Y:72% K:0% ]  📋
CSS    [ rgb(255, 99, 71)  ]  📋
```

**原生颜色选择器**（嵌入 `<input type="color">`）

**最近使用颜色**（存 localStorage，最多 20 个）：色块网格

**颜色对比度检查**（底部）：
- 前景色 / 背景色 各一个颜色选择器
- 实时计算对比度比例（如 `4.5:1`）
- WCAG 合规性标签：`AAA ✅` / `AA ✅` / `AA Large ✅` / `❌ 不合规`

---

### 工具 M6：在线取色器（`/tools/media/color-picker`）

**页面标题**：`Online Color Picker from Image | DevToolBox`

**功能**：上传图片，点击图片任意位置获取该位置的颜色值

**布局**：

**上传区**：上传图片（拖拽/点击）

**图片展示区**（上传后）：
- 显示图片，鼠标悬停时显示放大镜（10×10px 放大预览）
- 鼠标下方小浮窗显示当前像素颜色（色块 + HEX 值）
- 点击后颜色锁定到右侧面板

**右侧颜色面板**：
- 已选颜色列表（最多保留 20 个，可删除）
- 每个颜色显示：色块 + HEX + RGB + 复制按钮
- 导出所有颜色为 CSS 变量 / JSON

---

### 工具 M7：配色方案生成器（`/tools/media/color-palette`）

**页面标题**：`Color Palette Generator - Create Color Schemes | DevToolBox`

**功能**：

**生成方式**（Tab 切换）：
- **随机生成**：点击生成 5 色配色方案，空格键快速刷新
- **从颜色生成**：输入一个基础色，选择配色规则（互补色/三色组/四色组/同类色/分裂互补），生成方案
- **从图片生成**：上传图片，自动提取主色调（5 色）

**配色展示**（5 个等宽色块横排）：
- 每个色块显示 HEX 值
- 点击色块可编辑该颜色
- 色块右下角锁定图标（锁定后刷新时该颜色不变）
- 悬停时显示 RGB / HSL 值

**操作按钮**：
- `🎲 随机刷新` / `💾 保存方案` / `📋 复制全部 HEX` / `📤 导出（CSS/SCSS/JSON）`

**保存历史**（localStorage，最多 20 个方案）：
- 历史方案缩略图（5 色横条）
- 点击恢复

---

### 工具 M8：单位换算（`/tools/media/unit-converter`）

**页面标题**：`Unit Converter - Length, Weight, Temperature Online | DevToolBox`

**布局**：左侧分类导航 + 右侧换算区

**分类导航**（左侧竖排，点击切换）：

| 分类 | 图标 | 单位示例 |
|------|------|---------|
| 长度 | 📏 | km/m/cm/mm/mile/ft/in |
| 重量 | ⚖️ | kg/g/mg/lb/oz/ton |
| 温度 | 🌡 | °C / °F / K |
| 面积 | ⬜ | m²/km²/ft²/acre |
| 体积 | 🧴 | L/mL/m³/gallon/fl oz |
| 速度 | 💨 | km/h / mph / m/s / knot |
| 时间 | ⏱ | s/min/h/day/week/month/year |
| 数据 | 💾 | bit/Byte/KB/MB/GB/TB |
| 压力 | 🔧 | Pa/kPa/bar/psi/atm |
| 能量 | ⚡ | J/kJ/cal/kcal/kWh |
| 频率 | 📡 | Hz/kHz/MHz/GHz |
| 角度 | 📐 | °/rad/grad |
| 货币 | 💱 | 跳转到汇率换算工具 |

**右侧换算区**（通用模板）：

```
长度换算

输入值：  [ 1          ]  单位：[ 千米 (km) ▼ ]

────────────────────────────────────────
  1 千米 (km)  =
────────────────────────────────────────
  1,000    米 (m)             📋
  100,000  厘米 (cm)          📋
  0.621371 英里 (mile)        📋
  3,280.84 英尺 (ft)          📋
  39,370.1 英寸 (in)          📋
  ...（全部单位列表）
────────────────────────────────────────
```

- 输入框实时联动，所有单位同时更新
- 点击任意单位行，该单位变为"输入单位"
- 复制按钮在每行右侧

**温度换算**特殊处理：三个输入框并排（°C / °F / K），任意修改其他两个实时同步

---

### 工具 M9：二维码生成器（`/tools/media/qr-generator`）

**页面标题**：`QR Code Generator Free - Custom QR Codes Online | DevToolBox`
**Meta Description**：Generate free QR codes for URLs, text, WiFi, email, vCard. Customize colors, size, and add logo. Download PNG or SVG.

**布局**：左侧设置 + 右侧预览

**左侧设置区**：

**内容类型 Tab**（切换后显示对应表单）：

| Tab | 字段 |
|-----|------|
| 🔗 URL | 网址输入框 |
| 📝 文本 | 多行文本输入 |
| 📧 邮件 | 邮箱/主题/内容 |
| 📞 电话 | 电话号码 |
| 💬 短信 | 电话/内容 |
| 📶 WiFi | SSID/密码/加密类型 |
| 👤 联系人（vCard） | 姓名/电话/邮件/公司/网站 |
| 📍 地理位置 | 经纬度 |

**外观设置**：
- 前景色（颜色选择器，默认黑色）
- 背景色（颜色选择器，默认白色）
- 纠错级别：L(7%) / M(15%) / Q(25%) / H(30%)
- 尺寸滑块（100–2000px，默认 300px）
- 边距（0–10，默认 4）
- 圆角风格（方形/圆点/圆角，Premium 效果，可设为普通版）
- 中心 Logo 上传（可选，JPG/PNG，建议小于 15% QR 面积）

**右侧预览区**：
- 实时渲染 QR Code（使用 `qrcode.js` 或 `qrcodegen` 库）
- 下载按钮：`PNG` / `SVG` / `复制到剪贴板`

**使用 `qrcode-svg` 或 `qrcode` npm 包前端实现，不需要后端**

---

### 工具 M10：二维码识别（`/tools/media/qr-reader`）

**页面标题**：`QR Code Reader Online - Scan QR from Image | DevToolBox`

**功能**：
- 上传图片文件识别其中的 QR Code / 条形码
- 调用摄像头实时扫描（`getUserMedia` API）
- 支持识别：QR Code / Code 128 / Code 39 / EAN-13 / EAN-8 等

**使用 `jsQR` 或 `@zxing/library` 前端库实现**

**结果展示**：
- 识别到的内容类型（URL/文本/WiFi/vCard 等）
- 内容文本（一键复制）
- 如果是 URL，显示"打开链接"按钮（带安全提示）

---

## 二、PDF 工具箱（`/tools/pdf`）

**技术架构说明**：
- PDF 所有工具**需要后端处理**（Gin + Go 调用处理库）
- Go 后端使用 **pdfcpu** 库（纯 Go 实现，处理合并/拆分/压缩/旋转/水印/加解密/页面操作）
- PDF 转 Word/Excel/PPT 等格式需调用第三方 API（推荐 **LibreOffice** 或 **PDF.co API** 或 **ConvertAPI**）
- 文件临时存储在服务器，处理完成后 1 小时自动删除
- 最大文件大小：100MB（可配置）

---

### PDF 工具导航首页（`/tools/pdf`）

**页面标题**：`Free Online PDF Tools - Compress, Merge, Convert PDF | DevToolBox`
**Meta Description**：Complete free online PDF toolkit. Compress, merge, split, convert, edit, sign, watermark PDFs. No registration, files deleted after 1 hour.

**页面风格**：参考 pdfhouse.com 和 ilovepdf.com 的卡片网格风格

**Hero 区域**：
- 大标题：`All-in-One Free PDF Tools`
- 副标题：`Edit, convert, and manage your PDFs — no download needed`
- 大型拖拽上传框（居中，支持先上传再选择功能）
- `或选择工具开始 ↓` 引导文字

**工具分类卡片区**：

**第一行：最常用工具（大卡片，4个）**

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   🗜 压缩    │  │   🔗 合并    │  │   ✂️ 拆分   │  │   📝 编辑   │
│  Compress PDF│  │  Merge PDF   │  │  Split PDF   │  │  Edit PDF    │
│  缩小文件体积│  │  合并多个PDF │  │  按页拆分PDF │  │  添加文字图片│
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

**第二行：转换工具（标题 + 小卡片网格）**

标题：`🔄 转换为 PDF / 从 PDF 转换`

小卡片（两行，每行6个）：
```
Word转PDF  Excel转PDF  PPT转PDF  JPG转PDF  PNG转PDF  HTML转PDF
PDF转Word  PDF转Excel  PDF转PPT  PDF转JPG  PDF转PNG  PDF转TXT
```

**第三行：页面操作工具**

标题：`📄 页面操作`

```
旋转页面   重排页面   删除页面   提取页面   添加页码   页面裁剪
```

**第四行：安全与增强工具**

标题：`🔒 安全 & 增强`

```
加密PDF  解密PDF  添加水印  电子签名  OCR识别  添加书签
```

**底部特性说明**（三栏）：
- 🔒 **安全处理**：文件通过 HTTPS 传输，1 小时后自动删除
- ⚡ **极速处理**：服务器端快速处理，无需等待
- 🆓 **完全免费**：所有基础功能永久免费，无水印

---

### 统一 PDF 工具页面模板规范

所有 PDF 工具页面遵循以下统一布局：

```
┌──────────────────────────────────────────────────────────────┐
│  顶部导航（全站共用）                                          │
├──────────────────────────────────────────────────────────────┤
│  [广告位 A: 728×90]                                           │
├──────────────────────────────────────────────────────────────┤
│  工具标题 + 工具图标 + 一句话描述                              │
├──────────────────────┬───────────────────────────────────────┤
│                      │  [广告位 B: 300×250]                  │
│  主操作区             │                                       │
│  （上传→设置→处理→   ├───────────────────────────────────────┤
│   下载 四步流程）     │  工具说明面板                          │
│                      │  （用途/支持格式/注意事项）             │
│                      ├───────────────────────────────────────┤
│                      │  [广告位 C: 300×250]                  │
├──────────────────────┴───────────────────────────────────────┤
│  相关工具推荐（横向滚动卡片）                                  │
├──────────────────────────────────────────────────────────────┤
│  FAQ 区块（3-5条，Accordion）                                 │
├──────────────────────────────────────────────────────────────┤
│  [广告位 D: 728×90]                                           │
├──────────────────────────────────────────────────────────────┤
│  Footer                                                      │
└──────────────────────────────────────────────────────────────┘
```

**四步操作流程**（所有 PDF 工具统一的用户流程）：

```
Step 1: 上传文件           Step 2: 设置选项
[拖拽区 / 选择文件按钮]     [功能相关设置面板]
                    ↓
Step 4: 完成下载           Step 3: 处理中
[下载按钮 + 文件信息]       [进度条 + 百分比]
```

---

### 工具 P1：压缩 PDF（`/tools/pdf/compress`）

**页面标题**：`Compress PDF Online Free - Reduce PDF File Size | DevToolBox`
**Meta Description**：Compress PDF files online for free. Reduce PDF size without losing quality. Supports batch compression up to 10 files.

**上传区**：支持批量上传（最多 10 个 PDF，每个最大 100MB）

**压缩设置**：
- 压缩级别：
    - 🟢 **轻度压缩**（High Quality）：保留高质量，约减少 20-30%
    - 🟡 **中度压缩**（Recommended）：平衡质量与大小，约减少 50-60%（默认）
    - 🔴 **强力压缩**（Maximum Compression）：最小体积，质量有损，约减少 70-80%
- 是否删除元数据（去除作者/日期等信息，轻微减小体积）

**处理结果**（每个文件一行）：
```
文件名.pdf   原始: 12.3 MB → 压缩后: 3.2 MB  减少 74%  [⬇ 下载] [👁 预览]
```

**批量下载**：所有处理完成后，显示`下载全部（ZIP）` 按钮

**后端接口**：
```
POST /api/pdf/compress
  Body: multipart/form-data（PDF 文件 + level: low/medium/high）
  Response: { task_id, download_url, original_size, compressed_size }
```

---

### 工具 P2：合并 PDF（`/tools/pdf/merge`）

**页面标题**：`Merge PDF Files Online Free | DevToolBox`
**Meta Description**：Combine multiple PDF files into one. Drag to reorder pages before merging. Free online PDF merger.

**上传区**：支持上传多个 PDF（最多 20 个）

**文件排序区**（上传后显示）：
- 每个文件显示：序号 + 文件名 + 页数 + 缩略图（首页）
- **拖拽排序**（使用 `Sortable.js`）
- 每行右侧：删除按钮
- 文件间可选「分隔页」（插入空白页）

**合并设置**：
- 是否合并书签（将各文件的书签合并）
- 是否添加目录页（自动生成目录，列出各文件名对应页码）

**合并按钮**：`🔗 合并 PDF`

**后端接口**：
```
POST /api/pdf/merge
  Body: multipart/form-data（多个 PDF + order[] 数组 + options）
  Response: { download_url, total_pages, file_size }
```

---

### 工具 P3：拆分 PDF（`/tools/pdf/split`）

**页面标题**：`Split PDF Online Free - Extract Pages from PDF | DevToolBox`

**上传单个 PDF 后**：

**PDF 预览区**（缩略图网格）：
- 所有页面缩略图（每行 4-6 个）
- 点击选择/取消选择页面（选中高亮）
- 全选/全不选 按钮

**拆分模式 Tab**：
- **按页范围拆分**：输入页码范围（如 `1-3, 5, 7-10`），生成指定页面的新 PDF
- **每 N 页拆分**：每 N 页为一个文件（如每 5 页一个）
- **拆分所有页**：每页单独生成一个 PDF
- **按书签拆分**：以 PDF 的章节书签为分割点

**拆分预览**：拆分前显示将生成 X 个文件的提示

**后端接口**：
```
POST /api/pdf/split
  Body: { file_id, mode: "range|fixed|all|bookmarks", ranges: "1-3,5", every_n: 5 }
  Response: { files: [{name, pages, download_url}] }
```

---

### 工具 P4：旋转 PDF（`/tools/pdf/rotate`）

**功能**：旋转 PDF 的一个或多个页面

**布局**：上传后显示所有页面缩略图

**操作**：
- 单页旋转：每个缩略图下方有 `↺ -90°` 和 `↻ +90°` 按钮
- 批量旋转：勾选多页后，用顶部工具栏统一旋转
- 旋转方向：顺时针 90° / 逆时针 90° / 旋转 180°

**全部旋转**：一键将所有页面旋转相同角度

---

### 工具 P5：添加水印（`/tools/pdf/watermark`）

**页面标题**：`Add Watermark to PDF Online | DevToolBox`

**水印类型**：
- **文字水印**：输入文字（如 `CONFIDENTIAL`）
- **图片水印**：上传图片（PNG 带透明背景效果最佳）

**文字水印设置**：
- 文字内容输入框
- 字体：Helvetica / Times New Roman / Courier
- 字号（12–144pt）
- 颜色选择器
- 不透明度滑块（10%-100%）
- 位置：对角线（默认）/ 居中 / 平铺
- 旋转角度（-90°~90°，默认 -45°）
- 水印覆盖层级：内容上方 / 内容下方

**图片水印设置**：
- 上传图片
- 大小（相对页面宽度的百分比）
- 位置：九宫格定位选择器
- 不透明度

**应用范围**：全部页面 / 奇数页 / 偶数页 / 自定义页码范围

---

### 工具 P6：加密 PDF（`/tools/pdf/protect`）

**页面标题**：`Password Protect PDF Online Free | DevToolBox`

**设置**：
- 打开密码（用户密码）：加密后需输入才能打开
- 权限密码（所有者密码）：控制打印/复制/编辑权限
- 加密强度：`128-bit AES`（默认）/ `256-bit AES`

**权限设置**（勾选框）：
- ☑ 允许打印
- ☑ 允许复制文字
- ☑ 允许填写表单
- ☐ 允许修改文档

**密码强度指示器**（实时显示弱/中/强）

---

### 工具 P7：解密 PDF（`/tools/pdf/unlock`）

**功能**：移除 PDF 密码保护（需要知道当前密码）

**布局**：
- 上传 PDF
- 输入当前密码
- 点击解锁
- 下载无密码版本

**注意说明**：本工具仅用于解密用户自己有权限访问的文件

---

### 工具 P8：重排页面（`/tools/pdf/reorder`）

**功能**：调整 PDF 页面顺序

**布局**：上传后显示所有页面缩略图网格

**操作**：
- 拖拽缩略图调整顺序（`Sortable.js`）
- 页码实时更新显示
- 点击缩略图可选中，然后用方向按钮移动
- `全部反序` 按钮（将页面顺序颠倒）

---

### 工具 P9：删除页面（`/tools/pdf/delete-pages`）

**功能**：从 PDF 中删除指定页面

**布局**：上传后显示所有页面缩略图

**操作**：
- 点击缩略图选中（显示删除标记 ❌）
- 支持范围输入（如删除 `3,5-8,12`）
- 删除前预览剩余页面数量

---

### 工具 P10：提取页面（`/tools/pdf/extract-pages`）

**功能**：从 PDF 中提取指定页面生成新 PDF

**操作与删除页面相同**，但逻辑相反（选中=保留，未选中=丢弃）

额外选项：每页单独生成一个 PDF 文件（批量提取）

---

### 工具 P11：添加页码（`/tools/pdf/page-numbers`）

**设置**：
- 位置：页眉居左/居中/居右 / 页脚居左/居中/居右
- 起始页码（默认 1）
- 格式：`1` / `Page 1` / `1 of N` / `Page 1 of N`
- 字体/字号/颜色
- 应用范围：全部 / 从第 N 页开始

---

### 工具 P12：PDF OCR 文字识别（`/tools/pdf/ocr`）

**页面标题**：`PDF OCR - Extract Text from Scanned PDF | DevToolBox`
**Meta Description**：Convert scanned PDF to searchable text using OCR technology. Supports 100+ languages including Chinese, Japanese, Arabic.

**功能**：将扫描版 PDF（图片 PDF）转为可搜索/可复制的文字 PDF

**设置**：
- OCR 语言选择（支持：中文简体/繁体、英语、日语、韩语、阿拉伯语等 100+ 种）
- 输出格式：`可搜索 PDF`（保留原始外观，添加文字层）/ `纯文本 TXT`
- 图像预处理：自动纠偏 / 增强对比度

**后端实现**：
- 使用 **Tesseract** OCR 引擎（Go 调用 `gosseract` 库）
- 或调用第三方 OCR API（Google Vision API / Azure OCR）

---

### 工具 P13：格式转换（PDF ↔ 各格式）

所有转换工具共用相同的简单布局：

```
上传文件 → [转换按钮] → 下载结果
```

每个转换工具有独立路由和 SEO 页面。

**后端实现**：
- PDF → Word/Excel/PPT：使用 **LibreOffice** 命令行（`soffice --convert-to docx`）或 **ConvertAPI**
- Word/Excel/PPT → PDF：同上 LibreOffice
- PDF → JPG/PNG：使用 **pdftoppm**（Poppler 工具集）或 **pdfcpu**
- JPG/PNG → PDF：使用 **pdfcpu** 或 Go 内置图片库

**各转换工具 SEO 标题示例**：

| 路由 | 页面标题 |
|------|----------|
| `/tools/pdf/to-word` | `PDF to Word Converter Online Free \| DevToolBox` |
| `/tools/pdf/to-excel` | `PDF to Excel Converter Online Free \| DevToolBox` |
| `/tools/pdf/word-to-pdf` | `Word to PDF Converter Online \| DevToolBox` |
| `/tools/pdf/jpg-to-pdf` | `JPG to PDF Converter - Images to PDF Online \| DevToolBox` |

---

### 工具 P14：PDF 电子签名（`/tools/pdf/sign`）

**页面标题**：`Sign PDF Online Free - Add Digital Signature | DevToolBox`

**签名方式 Tab**：
- **手写签名**：鼠标/触摸板在画布上绘制签名
- **文字签名**：输入姓名，选择字体样式（草书风格）
- **上传图片签名**：上传签名图片（PNG 带透明背景）

**签名外观设置**：颜色、大小

**放置签名**：
- PDF 页面预览，点击位置放置签名
- 签名可拖拽移动、缩放
- 多页 PDF 可在不同页面添加多个签名

**保存并下载**：嵌入签名后下载新 PDF

**重要说明**：
- 本工具提供视觉签名（Appearance Signature），非数字证书签名（Cryptographic Signature）
- 如需法律效力的电子签名，需要使用数字证书

---

## 三、Google Ads 高价值功能扩展模块

> 以下功能对 Google Ads 广告友好，CPC 高、搜索量大，强烈建议开发。

---

### 模块 A：金融计算器（高 CPC，$5–$45/点击）

**竞品参考**：Bankrate（https://bankrate.com）、NerdWallet（https://nerdwallet.com）

---

#### A1：贷款计算器（`/finance/loan-calculator`）

**页面标题**：`Loan Calculator - Monthly Payment & Interest | DevToolBox`
**Meta Description**：Calculate monthly loan payments, total interest, and amortization schedule. Free online loan payment calculator for personal loans and auto loans.
**目标关键词 CPC**：loan calculator（$8–20）、monthly payment calculator（$12–30）

**输入参数**：
- 贷款金额（输入框，支持格式化显示，如 10,000）
- 年利率（%）
- 贷款期限（月数 或 年数，切换）
- 贷款类型：等额还款（Annuity）/ 等本金还款（Declining Balance）

**输出结果**（实时计算，无需点击按钮）：
```
月供金额：         ¥ 2,122.65   ← 大字高亮显示
总还款金额：       ¥ 127,359.00
总利息：          ¥ 27,359.00
首月利息：        ¥ 500.00
```

**还款计划表**（可折叠展开）：

| 期数 | 月供 | 本金 | 利息 | 剩余本金 |
|------|------|------|------|---------|
| 1 | 2,122.65 | 1,622.65 | 500.00 | 98,377.35 |
| ... | ... | ... | ... | ... |

**可视化图表**（Pie Chart）：本金 vs 利息 占比

---

#### A2：房贷计算器（`/finance/mortgage-calculator`）

**页面标题**：`Mortgage Calculator - Monthly Payment & Amortization | DevToolBox`
**目标关键词 CPC**：mortgage calculator（$15–45）

**输入**：房屋价格 / 首付比例（%）/ 贷款年限 / 年利率 / 房产税率（可选）/ 保险费率（可选）

**输出**：月供明细（本金+利息+税+保险）/ 总费用 / 分期偿还表 / 付清年份

**图表**：折线图（各年剩余本金趋势）+ 柱状图（每月各项目组成）

---

#### A3：汇率换算（`/finance/currency-converter`）

**页面标题**：`Currency Converter - Real-Time Exchange Rates | DevToolBox`
**目标关键词 CPC**：currency converter（$3–8）

**功能**：
- 实时汇率（调用免费 API：exchangerate-api.com 或 fixer.io）
- 支持 170+ 货币 + 主流加密货币（BTC/ETH/USDT）
- 快速换算：输入金额，选择源货币和目标货币，实时显示结果
- 汇率走势图（7天/30天/90天，折线图）
- 热门货币快捷对：USD/CNY、USD/EUR、USD/GBP、USD/JPY

**布局**：

```
[100] [USD 🇺🇸 ▼]  =  [¥ 724.50] [CNY 🇨🇳 ▼]

1 美元 = 7.2450 人民币    [⇄ 互换]
更新时间：2026-03-12 15:30 UTC

[热门货币对汇率表格]
```

**后端接口**：每小时缓存一次汇率数据，避免频繁调用外部 API

---

#### A4：个税计算器（`/finance/tax-calculator`）

**页面标题**：`Income Tax Calculator 2026 | DevToolBox`
**目标关键词 CPC**：income tax calculator（$5–15）

**功能**：支持多国税率计算（默认美国联邦税）

**输入**：年收入 / 纳税身份（单身/已婚/户主）/ 州税（美国可选择州）

**输出**：联邦税 + 州税 + FICA 税 / 有效税率 / 边际税率 / 税后净收入

---

### 模块 B：安全编码工具（中 CPC，$2–$8）

**竞品**：CyberChef（https://gchq.github.io/CyberChef）、DevUtils（https://devutils.com）

---

#### B1：哈希计算器（`/tools/security/hash`）

**页面标题**：`Hash Generator - MD5, SHA-1, SHA-256 Online | DevToolBox`
**Meta Description**：Generate MD5, SHA-1, SHA-256, SHA-512, SHA-3 hash values online. Hash text or files. Compare hashes for file integrity verification.

**功能**：

输入方式切换（Tab）：`文本` / `文件`

**文本模式**：
- 大文本输入框
- 下方并列显示所有哈希结果：
  ```
  MD5         5d41402abc4b2a76b9719d911017c592   📋
  SHA-1       aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d  📋
  SHA-256     2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c... 📋
  SHA-512     9b71d224bd62f3785d96d46ad3ea3d73319bfbc2... 📋
  SHA-3-256   ...  📋
  CRC32       858b8a0a  📋
  RIPEMD-160  ...  📋
  ```
- 大小写切换（HEX 结果）

**文件模式**：
- 上传文件（最大 50MB，使用 FileReader API 读取内容计算哈希）
- 显示文件名 + 大小 + 全部哈希值
- 哈希验证：输入期望的哈希值，自动对比是否匹配（文件完整性校验）

**使用 `crypto-js` 或 `WebCrypto API` 前端实现**

---

#### B2：Base64 编解码（`/tools/security/base64`）

**页面标题**：`Base64 Encoder & Decoder Online | DevToolBox`
**Meta Description**：Encode text or files to Base64, decode Base64 strings instantly. Supports standard, URL-safe, and MIME Base64.

**功能**：

**文本 Base64**：
- 左侧明文输入 ↔ 右侧 Base64 输出（双向实时）
- 编码变体：标准 Base64 / URL-Safe Base64 / MIME（每 76 字符换行）
- 字符集：UTF-8（默认）/ ASCII / Latin-1

**文件 Base64**：
- 上传文件，输出 Base64 字符串
- 输出格式：纯 Base64 / Data URI（`data:image/png;base64,...`）
- 反向：粘贴 Base64（Data URI），自动识别类型并下载文件

---

#### B3：URL 编解码（`/tools/security/url-encode`）

**页面标题**：`URL Encoder & Decoder Online | DevToolBox`

**功能**：
- 左右双栏（原始 URL ↔ 编码后 URL，双向实时）
- 编码模式：`encodeURIComponent`（默认）/ `encodeURI`（保留 `:/?#[]@!$&'()*+,;=`）
- 对差异字符高亮显示（哪些字符被编码了）

---

#### B4：HTML 编解码（`/tools/security/html-encode`）

**页面标题**：`HTML Encoder & Decoder Online | DevToolBox`

**功能**：
- HTML 实体编码：`<` → `&lt;`，`>` → `&gt;`，`"` → `&quot;` 等
- 编码模式：仅编码必要字符 / 编码所有非 ASCII 字符为 `&#xxxxx;`
- 双向转换

---

### 模块 C：网络工具（中高 CPC，$3–$12）放在编程开发下面

---

#### C1：IP 地址查询（`/tools/network/ip-lookup`）

**页面标题**：`My IP Address - What Is My IP Location | DevToolBox`
**Meta Description**：Find your public IP address and location. IP geolocation lookup with country, city, ISP, and timezone information.
**目标关键词 CPC**：what is my ip（$3–8）、ip address lookup（$5–12）

**功能**：

**我的 IP**（页面加载后自动显示）：
```
您的公网 IP 地址

  🌍  203.0.113.42

  国家：中国 🇨🇳           运营商：China Telecom
  地区：上海市              时区：Asia/Shanghai
  城市：上海                ASN：AS4134
  纬度：31.2304             经度：121.4737

  [📋 复制 IP]  [🗺 在地图上查看]
```

**IP 查询**（输入任意 IP 或域名查询）：
- 输入框 + 查询按钮
- 支持 IPv4 和 IPv6
- 域名自动解析为 IP 再查询

**后端接口**：
```
GET /api/network/my-ip         获取请求方 IP
GET /api/network/ip?q=xxx      查询指定 IP 或域名的地理信息
```

**数据源**：使用免费 API（ip-api.com 或 ipinfo.io）

---

#### C2：域名 Whois 查询（`/tools/network/whois`）

**页面标题**：`WHOIS Lookup - Domain Registration Info | DevToolBox`
**目标关键词 CPC**：whois lookup（$3–8）

**功能**：
- 输入域名（如 `example.com`），查询注册信息
- 显示：注册人/注册商/注册日期/到期日期/名称服务器/域名状态
- 高亮显示即将到期的域名（30天内，橙色警告）

**后端接口**：Go 调用系统 `whois` 命令或 Whois API

---

#### C3：DNS 查询（`/tools/network/dns-lookup`）

**页面标题**：`DNS Lookup Tool - Query DNS Records Online | DevToolBox`

**功能**：
- 输入域名，查询 DNS 记录
- 记录类型：A / AAAA / MX / NS / TXT / CNAME / SOA / PTR
- 可选 DNS 服务器：`系统默认` / `1.1.1.1（Cloudflare）` / `8.8.8.8（Google）` / `9.9.9.9（Quad9）`
- 结果以表格展示（类型 / 值 / TTL）

---

### 模块 D：文字工具（低CPC高流量）

---

#### D1：字数统计（`/tools/text/word-counter`）

**页面标题**：`Word Counter - Count Words, Characters & Sentences | DevToolBox`
**目标关键词**：word counter（高流量，低 CPC 但 CTR 高）

**功能**：
- 大文本输入框
- 实时统计：
  ```
  字数：1,234      字符数（含空格）：6,789
  字符数（不含空格）：5,432    句子数：45
  段落数：12       唯一词数：456
  平均阅读时间：5 分钟（按 200 字/分钟估算）
  平均说话时间：9 分钟（按 130 字/分钟估算）
  ```
- 词频统计（Top 10 最常用词，排除停用词）
- 关键词密度分析（输入目标关键词，计算密度%）
- 字符限制模式（如 Twitter 280 字限制，倒计时显示剩余字数）

---

#### D2：Lorem Ipsum 生成器（`/tools/text/lorem-ipsum`）

**页面标题**：`Lorem Ipsum Generator - Placeholder Text | DevToolBox`

**功能**：
- 生成数量设置：X 段 / X 句 / X 词
- 文本类型：
    - 经典 Lorem Ipsum
    - 随机拉丁语
    - 中文乱文（"忍者神龟型"中文占位文字）
    - Cicero 原文（Lorem Ipsum 来源）
- 开始于 `Lorem ipsum...`：开关（关闭后随机起始）
- 输出格式：纯文本 / HTML `<p>` 标签 / Markdown

---

#### D3：文本对比（`/tools/text/diff`）

**页面标题**：`Text Diff Tool - Compare Two Texts Online | DevToolBox`

**功能**：
- 左右两个文本输入框
- 对比模式：行级 / 字符级（词级）
- 差异高亮：绿色=新增，红色=删除，黄色=修改
- 差异统计：新增 N 行，删除 M 行
- 忽略选项：空白字符 / 大小写 / 空行

---

## 四、i18n 翻译 Key 补充（本文档新增工具）

`zh.json` 新增（仅列关键项，`en.json` 对应英文）：

```json
"pdf.title": "PDF 工具箱",
"pdf.hero_title": "一站式在线 PDF 工具",
"pdf.hero_desc": "编辑、转换、管理 PDF，无需下载软件",
"pdf.step1": "上传文件",
"pdf.step2": "设置选项",
"pdf.step3": "处理中",
"pdf.step4": "下载结果",
"pdf.file_delete_notice": "文件将在 {minutes} 分钟后自动删除",
"pdf.compress.title": "压缩 PDF",
"pdf.merge.title": "合并 PDF",
"pdf.split.title": "拆分 PDF",
"pdf.protect.title": "加密 PDF",
"pdf.sign.title": "PDF 电子签名",
"media.image_compress.title": "图片压缩",
"media.video_convert.title": "视频格式转换",
"media.color.title": "颜色转换",
"media.unit.title": "单位换算",
"media.qr.title": "二维码生成器",
"finance.loan.title": "贷款计算器",
"finance.mortgage.title": "房贷计算器",
"finance.currency.title": "汇率换算",
"security.hash.title": "哈希计算器",
"security.base64.title": "Base64 编解码",
"security.url.title": "URL 编解码",
"network.ip.title": "IP 地址查询",
"network.whois.title": "Whois 查询",
"text.wordcount.title": "字数统计",
"text.diff.title": "文本对比"
```

---

## 五、sitemap.xml 新增路由

```xml
<!-- 多媒体工具 -->
<url><loc>https://devtoolbox.dev/tools/media</loc><priority>0.9</priority></url>
<url><loc>https://devtoolbox.dev/tools/media/image-compress</loc><priority>0.8</priority></url>
<url><loc>https://devtoolbox.dev/tools/media/video-convert</loc><priority>0.8</priority></url>
<url><loc>https://devtoolbox.dev/tools/media/color-converter</loc><priority>0.7</priority></url>
<url><loc>https://devtoolbox.dev/tools/media/unit-converter</loc><priority>0.7</priority></url>
<url><loc>https://devtoolbox.dev/tools/media/qr-generator</loc><priority>0.8</priority></url>

<!-- PDF 工具 -->
<url><loc>https://devtoolbox.dev/tools/pdf</loc><priority>0.9</priority></url>
<url><loc>https://devtoolbox.dev/tools/pdf/compress</loc><priority>0.9</priority></url>
<url><loc>https://devtoolbox.dev/tools/pdf/merge</loc><priority>0.9</priority></url>
<url><loc>https://devtoolbox.dev/tools/pdf/split</loc><priority>0.9</priority></url>
<url><loc>https://devtoolbox.dev/tools/pdf/to-word</loc><priority>0.9</priority></url>
<url><loc>https://devtoolbox.dev/tools/pdf/to-jpg</loc><priority>0.8</priority></url>
<url><loc>https://devtoolbox.dev/tools/pdf/word-to-pdf</loc><priority>0.9</priority></url>
<url><loc>https://devtoolbox.dev/tools/pdf/jpg-to-pdf</loc><priority>0.8</priority></url>
<url><loc>https://devtoolbox.dev/tools/pdf/ocr</loc><priority>0.8</priority></url>
<url><loc>https://devtoolbox.dev/tools/pdf/sign</loc><priority>0.8</priority></url>

<!-- 金融计算器（高CPC） -->
<url><loc>https://devtoolbox.dev/finance/loan-calculator</loc><priority>0.9</priority></url>
<url><loc>https://devtoolbox.dev/finance/mortgage-calculator</loc><priority>0.9</priority></url>
<url><loc>https://devtoolbox.dev/finance/currency-converter</loc><priority>0.8</priority></url>

<!-- 安全编码 -->放在编程开发下面
<url><loc>https://devtoolbox.dev/tools/security/hash</loc><priority>0.8</priority></url>
<url><loc>https://devtoolbox.dev/tools/security/base64</loc><priority>0.8</priority></url>
<url><loc>https://devtoolbox.dev/tools/security/url-encode</loc><priority>0.7</priority></url>

<!-- 网络工具 -->放在编程开发下面
<url><loc>https://devtoolbox.dev/tools/network/ip-lookup</loc><priority>0.9</priority></url>
<url><loc>https://devtoolbox.dev/tools/network/whois</loc><priority>0.8</priority></url>
<url><loc>https://devtoolbox.dev/tools/network/dns-lookup</loc><priority>0.8</priority></url>

<!-- 文字工具 -->
<url><loc>https://devtoolbox.dev/tools/text/word-counter</loc><priority>0.8</priority></url>
<url><loc>https://devtoolbox.dev/tools/text/diff</loc><priority>0.7</priority></url>
```

---

## 六、Gin 路由注册（完整追加）

```go
// 多媒体工具
media := r.Group("/tools/media")
media.Use(middleware.I18n(), middleware.SEOMeta(), middleware.AdsConfig())
media.GET("",                     handler.MediaIndex)
media.GET("/image-compress",      handler.ImageCompress)
media.GET("/image-convert- done",       handler.ImageConvert)
media.GET("/image-resize",        handler.ImageResize)
media.GET("/video-convert",       handler.VideoConvert)
media.GET("/color-converter",     handler.ColorConverter)
media.GET("/color-picker",        handler.ColorPicker)
media.GET("/color-palette",       handler.ColorPalette)
media.GET("/unit-converter",      handler.UnitConverter)
media.GET("/qr-generator",        handler.QRGenerator)
media.GET("/qr-reader",           handler.QRReader)

// 视频转换后端接口
mediaAPI := r.Group("/api/media")
mediaAPI.POST("/video/upload",        handler.VideoUpload)
mediaAPI.POST("/video/convert",       handler.VideoConvertAPI)
mediaAPI.GET("/video/status/:id",     handler.VideoStatus)
mediaAPI.GET("/video/download/:id",   handler.VideoDownload)

// PDF 工具页面路由
pdf := r.Group("/tools/pdf")
pdf.Use(middleware.I18n(), middleware.SEOMeta(), middleware.AdsConfig())
pdf.GET("",               handler.PDFIndex)
pdf.GET("/all",           handler.PDFAllTools)
pdf.GET("/compress",      handler.PDFCompress)
pdf.GET("/merge",         handler.PDFMerge)
pdf.GET("/split",         handler.PDFSplit)
pdf.GET("/rotate",        handler.PDFRotate)
pdf.GET("/watermark",     handler.PDFWatermark)
pdf.GET("/protect",       handler.PDFProtect)
pdf.GET("/unlock",        handler.PDFUnlock)
pdf.GET("/to-word",       handler.PDFToWord)
pdf.GET("/to-excel",      handler.PDFToExcel)
pdf.GET("/to-ppt",        handler.PDFToPPT)
pdf.GET("/to-jpg",        handler.PDFToJPG)
pdf.GET("/to-png",        handler.PDFToPNG)
pdf.GET("/to-txt",        handler.PDFToTXT)
pdf.GET("/word-to-pdf",   handler.WordToPDF)
pdf.GET("/excel-to-pdf",  handler.ExcelToPDF)
pdf.GET("/ppt-to-pdf",    handler.PPTToPDF)
pdf.GET("/jpg-to-pdf",    handler.JPGToPDF)
pdf.GET("/png-to-pdf",    handler.PNGToPDF)
pdf.GET("/html-to-pdf",   handler.HTMLToPDF)
pdf.GET("/txt-to-pdf",    handler.TXTToPDF)
pdf.GET("/reorder",       handler.PDFReorder)
pdf.GET("/delete-pages",  handler.PDFDeletePages)
pdf.GET("/extract-pages", handler.PDFExtractPages)
pdf.GET("/page-numbers",  handler.PDFPageNumbers)
pdf.GET("/ocr",           handler.PDFOCR)
pdf.GET("/sign",          handler.PDFSign)

// PDF 后端处理接口
pdfAPI := r.Group("/api/pdf")
pdfAPI.POST("/upload",           handler.PDFUpload)
pdfAPI.POST("/compress",         handler.PDFCompressAPI)
pdfAPI.POST("/merge",            handler.PDFMergeAPI)
pdfAPI.POST("/split",            handler.PDFSplitAPI)
pdfAPI.POST("/rotate",           handler.PDFRotateAPI)
pdfAPI.POST("/watermark",        handler.PDFWatermarkAPI)
pdfAPI.POST("/protect",          handler.PDFProtectAPI)
pdfAPI.POST("/unlock",           handler.PDFUnlockAPI)
pdfAPI.POST("/convert",          handler.PDFConvertAPI)
pdfAPI.POST("/reorder",          handler.PDFReorderAPI)
pdfAPI.POST("/delete-pages",     handler.PDFDeletePagesAPI)
pdfAPI.POST("/extract-pages",    handler.PDFExtractPagesAPI)
pdfAPI.POST("/page-numbers",     handler.PDFPageNumbersAPI)
pdfAPI.POST("/ocr",              handler.PDFOCRInitAPI)
pdfAPI.GET("/status/:task_id",   handler.PDFTaskStatus)
pdfAPI.GET("/download/:task_id", handler.PDFDownload)

// 金融计算器
finance := r.Group("/finance")
finance.Use(middleware.I18n(), middleware.SEOMeta(), middleware.AdsConfig())
finance.GET("/loan-calculator",       handler.LoanCalculator)
finance.GET("/mortgage-calculator",   handler.MortgageCalculator)
finance.GET("/currency-converter",    handler.CurrencyConverter)
finance.GET("/tax-calculator",        handler.TaxCalculator)
finance.GET("/api/exchange-rates",    handler.ExchangeRates)

// 安全编码工具放在放在编程开发下面
security := r.Group("/tools/security")
security.Use(middleware.I18n(), middleware.SEOMeta(), middleware.AdsConfig())
security.GET("/hash",       handler.HashCalculator)
security.GET("/base64",     handler.Base64Tool)
security.GET("/url-encode", handler.URLEncode)
security.GET("/html-encode", handler.HTMLEncode)

// 网络工具
network := r.Group("/tools/network")
network.Use(middleware.I18n(), middleware.SEOMeta(), middleware.AdsConfig())
network.GET("/ip-lookup",  handler.IPLookup)
network.GET("/whois",      handler.WhoisLookup)
network.GET("/dns-lookup", handler.DNSLookup)
network.GET("/api/my-ip",  handler.MyIP)
network.GET("/api/ip",     handler.IPQuery)
network.GET("/api/whois",  handler.WhoisQuery)
network.GET("/api/dns",    handler.DNSQuery)

// 文字工具
text := r.Group("/tools/text")
text.Use(middleware.I18n(), middleware.SEOMeta(), middleware.AdsConfig())
text.GET("/word-counter",  handler.WordCounter)
text.GET("/lorem-ipsum",   handler.LoremIpsum)
text.GET("/diff",          handler.TextDiff)
```

---


