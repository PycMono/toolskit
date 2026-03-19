# Block C-00 · 文件转换工具集 — 需求总览索引

> 竞品对标：https://www.freeconvert.com/video-converter  
> 技术方向：**后端 FFmpeg/LibreOffice 转换 + 前端拖拽上传**  
> 路由前缀：`/convert`  
> 主色调：靛青 `#0ea5e9`（与站内其他工具区分）

---

## 📐 产品架构图

```
用户拖拽 / 选择文件
        ↓
  前端上传（分片 or 直传）→ 临时存储（/tmp/convert/）
        ↓
  后端转换引擎
  ├─ 视频/音频  → FFmpeg
  ├─ 图片       → FFmpeg / Canvas API（前端）/ ImageMagick
  ├─ PDF/文档   → LibreOffice headless / Ghostscript / pdfcpu
  ├─ GIF        → FFmpeg
  └─ 其他       → 纯前端（单位/时间）/ 7zip（压缩包）
        ↓
  轮询任务状态（SSE 或 polling）
        ↓
  生成下载链接（有效期 1h，到期自动清理）
```

---

## 🎯 全量工具清单（38 个，对标 freeconvert.com）

### 一、Video & Audio（8 个）

| 路由 | 工具名 | 核心技术 | 输入 → 输出 |
|------|--------|---------|------------|
| `/convert/video` | Video Converter | FFmpeg | 任意视频 → MP4/AVI/MOV/MKV/WEBM/FLV/WMV/3GP |
| `/convert/audio` | Audio Converter | FFmpeg | 任意音频 → MP3/AAC/OGG/WAV/FLAC/WMA/AIFF/M4A |
| `/convert/mp3` | MP3 Converter | FFmpeg | 任意音频 → MP3（品质选项）|
| `/convert/mp4-to-mp3` | MP4 to MP3 | FFmpeg | MP4 → MP3（提取音轨）|
| `/convert/video-to-mp3` | Video to MP3 | FFmpeg | 任意视频 → MP3 |
| `/convert/mp4` | MP4 Converter | FFmpeg | 任意视频 → MP4 |
| `/convert/mov-to-mp4` | MOV to MP4 | FFmpeg | MOV → MP4 |
| `/convert/mp3-to-ogg` | MP3 to OGG | FFmpeg | MP3 → OGG |

### 二、Image（8 个）

| 路由 | 工具名 | 核心技术 | 输入 → 输出 |
|------|--------|---------|------------|
| `/convert/image` | Image Converter | Canvas / FFmpeg | 任意图片 → JPG/PNG/WEBP/GIF/BMP/TIFF/ICO |
| `/convert/webp-to-png` | WEBP to PNG | Canvas（前端）| WEBP → PNG |
| `/convert/jfif-to-png` | JFIF to PNG | Canvas（前端）| JFIF → PNG |
| `/convert/png-to-svg` | PNG to SVG | Potrace（后端）| PNG → SVG（矢量化）|
| `/convert/heic-to-jpg` | HEIC to JPG | libheif（后端）| HEIC/HEIF → JPG |
| `/convert/heic-to-png` | HEIC to PNG | libheif（后端）| HEIC/HEIF → PNG |
| `/convert/webp-to-jpg` | WEBP to JPG | Canvas（前端）| WEBP → JPG |
| `/convert/svg-converter` | SVG Converter | FFmpeg / Canvas | SVG → PNG/JPG/WEBP |

### 三、PDF & Documents（10 个）

| 路由 | 工具名 | 核心技术 | 输入 → 输出 |
|------|--------|---------|------------|
| `/convert/pdf` | PDF Converter | LibreOffice + Ghostscript | PDF → Word/JPG/PNG/HTML |
| `/convert/document` | Document Converter | LibreOffice | DOCX/ODT/RTF 互转 |
| `/convert/ebook` | Ebook Converter | Calibre | EPUB/MOBI/AZW3/FB2/TXT 互转 |
| `/convert/pdf-to-word` | PDF to Word | LibreOffice | PDF → DOCX |
| `/convert/pdf-to-jpg` | PDF to JPG | Ghostscript + pdfcpu | PDF → JPG（每页一张）|
| `/convert/pdf-to-epub` | PDF to EPUB | Calibre | PDF → EPUB |
| `/convert/epub-to-pdf` | EPUB to PDF | Calibre | EPUB → PDF |
| `/convert/heic-to-pdf` | HEIC to PDF | libheif + pdfcpu | HEIC → PDF |
| `/convert/docx-to-pdf` | DOCX to PDF | LibreOffice | DOCX → PDF |
| `/convert/jpg-to-pdf` | JPG to PDF | pdfcpu | JPG/PNG → PDF（合并多页）|

### 四、GIF（9 个）

| 路由 | 工具名 | 核心技术 | 输入 → 输出 |
|------|--------|---------|------------|
| `/convert/video-to-gif` | Video to GIF | FFmpeg + gifsicle | 视频 → GIF（帧率/尺寸可调）|
| `/convert/mp4-to-gif` | MP4 to GIF | FFmpeg + gifsicle | MP4 → GIF |
| `/convert/webm-to-gif` | WEBM to GIF | FFmpeg + gifsicle | WEBM → GIF |
| `/convert/apng-to-gif` | APNG to GIF | FFmpeg | APNG → GIF |
| `/convert/gif-to-mp4` | GIF to MP4 | FFmpeg | GIF → MP4 |
| `/convert/gif-to-apng` | GIF to APNG | FFmpeg | GIF → APNG |
| `/convert/image-to-gif` | Image to GIF | FFmpeg | 多张图片 → GIF（幻灯片）|
| `/convert/mov-to-gif` | MOV to GIF | FFmpeg + gifsicle | MOV → GIF |
| `/convert/avi-to-gif` | AVI to GIF | FFmpeg + gifsicle | AVI → GIF |

### 五、Others（3 个）

| 路由 | 工具名 | 核心技术 | 说明 |
|------|--------|---------|------|
| `/convert/unit` | Unit Converter | 纯前端 JS | 长度/重量/温度/面积/体积/速度/时间/数据 |
| `/convert/time` | Time Converter | 纯前端 JS | 时区转换 + 时间戳 + 倒计时 |
| `/convert/archive` | Archive Converter | 7zip（后端）| ZIP/RAR/7Z/TAR.GZ 互转 |

---

## 📋 Block 清单（共 9 块）

| Block | 文件 | 核心内容 | 工时 |
|-------|------|---------|------|
| **C-00** | 总览索引 | 本文档 | — |
| **C-01** | 路由/SEO/i18n/sitemap | 38 条路由注册 + Handler 工厂 + 全量 i18n + sitemap | 2h |
| **C-02** | 公共上传 UI | 拖拽上传组件 + 进度条 + 任务状态轮询 + 下载区 | 3h |
| **C-03** | 后端转换引擎 | 任务队列 + FFmpeg 封装 + 临时文件管理 + 进度推送（SSE）| 4h |
| **C-04** | Video & Audio | 8 个工具页面 + FFmpeg 参数配置 + 格式选项面板 | 4h |
| **C-05** | Image 转换 | 8 个工具：4 个纯前端 Canvas + 4 个后端（HEIC/PNG to SVG）| 3h |
| **C-06** | PDF & Documents | 10 个工具：LibreOffice + Ghostscript + Calibre + pdfcpu | 4h |
| **C-07** | GIF 工具 | 9 个工具：FFmpeg + gifsicle + GIF 参数控制 | 3h |
| **C-08** | Others | Unit/Time（纯前端）+ Archive（7zip 后端）| 2h |

**总计：约 25h（3~4 天）**

---

## 🔧 后端依赖（服务器需安装）

```bash
# Ubuntu/Debian
apt-get install -y \
  ffmpeg \               # 视频/音频/GIF 转换
  gifsicle \            # GIF 优化压缩
  libreoffice-headless \ # 文档/PDF 转换
  calibre \             # Ebook 转换
  libheif-examples \    # HEIC 转换（heif-convert 命令）
  potrace \             # PNG to SVG 矢量化
  ghostscript \         # PDF 光栅化
  p7zip-full            # 压缩包转换

# Go 依赖库
go get github.com/pdfcpu/pdfcpu        # JPG→PDF、PDF拆分合并
```

## 🖥️ 前端依赖（CDN）

```html
<!-- 图片转换（前端 Canvas 方案）-->
<script src="https://cdn.jsdelivr.net/npm/browser-image-compression@2.0.2/..."></script>

<!-- 进度条 UI -->
<!-- 无需额外库，原生 CSS + JS 实现 -->
```

---

## 🗺️ 路由全量规划

```
/convert                          ← 工具集主页（All Tools 聚合页）
/convert/video                    ← Video Converter
/convert/audio                    ← Audio Converter
/convert/mp3                      ← MP3 Converter
/convert/mp4-to-mp3               ← MP4 to MP3
/convert/video-to-mp3             ← Video to MP3
/convert/mp4                      ← MP4 Converter
/convert/mov-to-mp4               ← MOV to MP4
/convert/mp3-to-ogg               ← MP3 to OGG
/convert/image                    ← Image Converter
/convert/webp-to-png              ← WEBP to PNG（前端）
/convert/jfif-to-png              ← JFIF to PNG（前端）
/convert/png-to-svg               ← PNG to SVG（后端 potrace）
/convert/heic-to-jpg              ← HEIC to JPG（后端 libheif）
/convert/heic-to-png              ← HEIC to PNG（后端 libheif）
/convert/webp-to-jpg              ← WEBP to JPG（前端）
/convert/svg-converter            ← SVG Converter（后端）
/convert/pdf                      ← PDF Converter
/convert/document                 ← Document Converter
/convert/ebook                    ← Ebook Converter
/convert/pdf-to-word              ← PDF to Word
/convert/pdf-to-jpg               ← PDF to JPG
/convert/pdf-to-epub              ← PDF to EPUB
/convert/epub-to-pdf              ← EPUB to PDF
/convert/heic-to-pdf              ← HEIC to PDF
/convert/docx-to-pdf              ← DOCX to PDF
/convert/jpg-to-pdf               ← JPG to PDF
/convert/video-to-gif             ← Video to GIF
/convert/mp4-to-gif               ← MP4 to GIF
/convert/webm-to-gif              ← WEBM to GIF
/convert/apng-to-gif              ← APNG to GIF
/convert/gif-to-mp4               ← GIF to MP4
/convert/gif-to-apng              ← GIF to APNG
/convert/image-to-gif             ← Image to GIF
/convert/mov-to-gif               ← MOV to GIF
/convert/avi-to-gif               ← AVI to GIF
/convert/unit                     ← Unit Converter（纯前端）
/convert/time                     ← Time Converter（纯前端）
/convert/archive                  ← Archive Converter（后端 7zip）

# 后端 API（所有工具共用）
POST /convert/api/upload           ← 文件上传
GET  /convert/api/status/:jobId    ← 任务状态查询
GET  /convert/api/download/:jobId  ← 下载结果文件
DELETE /convert/api/job/:jobId     ← 手动取消任务

# SSE（实时进度推送，可选）
GET  /convert/api/progress/:jobId  ← Server-Sent Events 进度流
```

---

## 📌 设计风格定调

| 项目 | 规格 |
|------|------|
| 主色 | 靛青 `#0ea5e9`（Sky Blue）|
| 主色深 | `#0284c7` |
| 主色浅 | `#e0f2fe` |
| 背景 | 米白 `#fafaf8` |
| 卡片背景 | `#ffffff` |
| 边框 | `#e2e8f0` |
| 字体 | 同站内统一 |
| 上传区 | 超大虚线框，拖拽变蓝色 |
| 进度条 | 靛青渐变，百分比实时显示 |
| 结果区 | 文件名 + 大小 + 下载按钮，同页显示 |

---

## ⚙️ 文件大小与时长限制（对标 freeconvert 免费版）

| 类型 | 单文件上限 | 同时处理 | 结果保留 |
|------|-----------|---------|---------|
| 视频 | 1 GB | 1 个 | 1 小时 |
| 音频 | 200 MB | 3 个 | 1 小时 |
| 图片 | 50 MB | 10 个 | 1 小时 |
| PDF/文档 | 100 MB | 2 个 | 1 小时 |
| GIF | 200 MB | 2 个 | 1 小时 |
| 压缩包 | 500 MB | 1 个 | 1 小时 |

---

## 🔑 i18n Key 前缀清单

```
convert.common.*      公共文案（上传/进度/下载/错误）
convert.video.*       视频工具文案
convert.audio.*       音频工具文案
convert.image.*       图片工具文案
convert.pdf.*         PDF 工具文案
convert.gif.*         GIF 工具文案
convert.unit.*        单位换算文案
convert.time.*        时间换算文案
convert.archive.*     压缩包文案
```
