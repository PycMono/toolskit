# Block C-05 · 文件转换工具集 — Image 转换（8 个工具）

> **涉及路由**：`/convert/image` `/convert/webp-to-png` `/convert/jfif-to-png` `/convert/png-to-svg` `/convert/heic-to-jpg` `/convert/heic-to-png` `/convert/webp-to-jpg` `/convert/svg-converter`  
> **预估工时**：3h  
> **依赖**：C-02（公共 UI）、C-03（后端引擎）  
> **技术分流**：4 个纯前端（Canvas）/ 4 个后端

---

## 1. 技术分流一览

| 工具 | 方案 | 理由 |
|------|------|------|
| WEBP→PNG | 前端 Canvas | 浏览器原生支持，零延迟，文件不离开浏览器 |
| JFIF→PNG | 前端 Canvas | JFIF 是 JPEG 变体，浏览器直接解码 |
| WEBP→JPG | 前端 Canvas | 同上 |
| SVG→PNG/JPG/WEBP | 前端 Canvas | SVG 可在 Canvas 渲染 |
| Image Converter | 前端优先，后端兜底 | 常见格式前端处理；BMP/TIFF/ICO 走后端 |
| PNG→SVG | 后端 Potrace | 矢量化算法，需服务端运算 |
| HEIC→JPG | 后端 libheif | 浏览器不支持 HEIC 解码 |
| HEIC→PNG | 后端 libheif | 同上 |

---

## 2. 前端 Canvas 转换引擎（`/static/js/convert-frontend.js`）

```javascript
// /static/js/convert-frontend.js
// 纯前端图片转换：无需上传到服务器
// 适用于：webp-to-png, jfif-to-png, webp-to-jpg, svg-converter, image(常见格式)

'use strict';

/* ─── 覆盖 convertAll，实现纯前端转换 ────────── */
async function convertAll() {
  if (CVState.isConverting) return;
  const pending = CVState.files.filter(f => f.status === 'pending' || f.status === 'error');
  if (!pending.length) return;

  CVState.isConverting = true;
  document.getElementById('convertAllBtn').disabled = true;
  document.getElementById('convertBtnText').textContent = '转换中...';

  const fmt = window.CV_SELECTED_FORMAT || getDefaultFmt();
  const slug = window.CV_CONFIG?.slug || '';

  await Promise.all(pending.map(item => convertFrontend(item, fmt, slug)));

  CVState.isConverting = false;
  document.getElementById('convertAllBtn').disabled = false;
  document.getElementById('convertBtnText').textContent = '开始转换';
}

function getDefaultFmt() {
  const slug = window.CV_CONFIG?.slug || '';
  const map = {
    'webp-to-png': 'png', 'jfif-to-png': 'png',
    'webp-to-jpg': 'jpg', 'svg-converter': 'png',
  };
  return map[slug] || 'png';
}

/* ─── 单文件前端转换 ─────────────────────────── */
async function convertFrontend(item, fmt, slug) {
  updateFileItem(item.id, { status: 'processing', progress: 30 });

  try {
    let blob;

    if (slug === 'svg-converter' || item.file.type === 'image/svg+xml') {
      blob = await svgToRaster(item.file, fmt);
    } else {
      blob = await imageToFormat(item.file, fmt);
    }

    if (!blob) throw new Error('转换失败');

    // 生成下载 URL（ObjectURL）
    const url      = URL.createObjectURL(blob);
    const outName  = replaceExt(item.file.name, fmt);

    updateFileItem(item.id, {
      status:     'done',
      progress:   100,
      resultUrl:  url,
      resultName: outName,
    });

  } catch(e) {
    updateFileItem(item.id, { status: 'error', error: e.message });
  }
}

/* ─── Canvas 图片格式转换 ────────────────────── */
function imageToFormat(file, fmt) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement('canvas');
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');

      // JPG 不支持透明，白底填充
      if (fmt === 'jpg' || fmt === 'jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      const mimeMap = {
        'jpg': 'image/jpeg', 'jpeg': 'image/jpeg',
        'png': 'image/png',  'webp': 'image/webp',
      };
      const mime = mimeMap[fmt] || 'image/png';
      const quality = (fmt === 'jpg' || fmt === 'webp') ? 0.92 : undefined;

      canvas.toBlob(blob => {
        blob ? resolve(blob) : reject(new Error('Canvas 转换失败'));
      }, mime, quality);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('图片加载失败，文件可能已损坏'));
    };

    img.src = url;
  });
}

/* ─── SVG → 位图（Canvas 渲染）─────────────── */
function svgToRaster(file, fmt) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const svgStr  = e.target.result;
      const blob    = new Blob([svgStr], { type: 'image/svg+xml' });
      const url     = URL.createObjectURL(blob);
      const img     = new Image();

      img.onload = () => {
        URL.revokeObjectURL(url);

        // 读取 SVG 中定义的宽高（或 viewBox）
        const parser  = new DOMParser();
        const svgDoc  = parser.parseFromString(svgStr, 'image/svg+xml');
        const svgEl   = svgDoc.documentElement;
        const w = parseInt(svgEl.getAttribute('width'))  || img.naturalWidth  || 512;
        const h = parseInt(svgEl.getAttribute('height')) || img.naturalHeight || 512;

        const canvas  = document.createElement('canvas');
        // 可从选项获取输出尺寸
        const outW    = parseInt(window.CV_SVG_WIDTH || w);
        const outH    = Math.round(h * (outW / w));
        canvas.width  = outW;
        canvas.height = outH;

        const ctx = canvas.getContext('2d');
        if (fmt === 'jpg') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,outW,outH); }
        ctx.drawImage(img, 0, 0, outW, outH);

        const mimeMap = { 'jpg':'image/jpeg', 'png':'image/png', 'webp':'image/webp' };
        canvas.toBlob(blob => {
          blob ? resolve(blob) : reject(new Error('SVG 渲染失败'));
        }, mimeMap[fmt] || 'image/png', 0.92);
      };

      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('SVG 解析失败')); };
      img.src = url;
    };
    reader.readAsText(file);
  });
}

/* ─── 工具函数 ───────────────────────────────── */
function replaceExt(filename, newExt) {
  const i = filename.lastIndexOf('.');
  return (i > 0 ? filename.slice(0, i) : filename) + '.' + newExt;
}
```

---

## 3. SVG Converter 附加选项（输出尺寸）

```javascript
// /static/js/convert-svg-opts.js
// 仅在 svg-converter 工具页加载

function initSVGOpts() {
  const slug = window.CV_CONFIG?.slug;
  if (slug !== 'svg-converter') return;

  const bar = document.getElementById('formatBar');
  if (!bar) return;

  const div = document.createElement('div');
  div.className = 'cv-extra-opts';
  div.innerHTML = `
    <div class="cv-opt-group">
      <label class="cv-opt-label">输出宽度（px）</label>
      <input type="number" id="svgWidth" class="cv-input-small"
             min="64" max="8192" value="1024" placeholder="1024">
      <span class="cv-opt-label" style="color:#999">（留空保持原始尺寸）</span>
    </div>
  `;
  bar.insertAdjacentElement('afterend', div);

  document.getElementById('svgWidth').addEventListener('input', function() {
    window.CV_SVG_WIDTH = this.value || '';
  });
}

document.addEventListener('DOMContentLoaded', initSVGOpts);
```

---

## 4. Image Converter 智能分流（前端 + 后端）

`/convert/image` 工具支持输入输出均为多种格式，分流逻辑：

```javascript
// /static/js/convert-image-smart.js
// 智能判断走前端 Canvas 还是后端 API

const CANVAS_SUPPORTED_INPUT  = new Set(['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']);
const CANVAS_SUPPORTED_OUTPUT = new Set(['jpg','jpeg','png','webp']);

async function convertAll() {
  // ... 同 C-02 convertAll 结构，按文件分流

  for (const item of pending) {
    const fmt = window.CV_SELECTED_FORMAT || 'jpg';
    if (CANVAS_SUPPORTED_INPUT.has(item.file.type) && CANVAS_SUPPORTED_OUTPUT.has(fmt)) {
      // 走前端 Canvas
      await convertFrontend(item, fmt, 'image');
    } else {
      // 走后端（BMP/TIFF/ICO 输出，或 HEIC 输入）
      await processFile(item, fmt);
    }
  }
}
```

---

## 5. 后端图片转换参数

### PNG to SVG（Potrace）

```bash
# 1. PNG → BMP（ImageMagick 预处理）
convert -threshold 50% input.png input.bmp

# 2. BMP → SVG（Potrace）
potrace --svg -o output.svg input.bmp

# 高级选项：
#   --blacklevel 0.5   黑色阈值
#   --alphamax 1.0     角落平滑度
#   --opttolerance 0.2 贝塞尔曲线优化
```

### HEIC to JPG / PNG（libheif）

```bash
# HEIC → JPG
heif-convert -q 90 input.heic output.jpg

# HEIC → PNG
heif-convert input.heic output.png

# 批量处理注意：libheif 不支持并发写入同一目录
# 须为每个 Job 使用独立输出路径（已在 C-03 实现）
```

### Image Converter 后端兜底（FFmpeg）

```bash
# 转 BMP
ffmpeg -y -i input.png output.bmp

# 转 TIFF
ffmpeg -y -i input.jpg output.tiff

# 转 ICO（多尺寸）
convert input.png -resize 256x256 -define icon:auto-resize="256,64,48,32,16" output.ico
```

---

## 6. 工具页面对应的加载脚本列表

```html
<!-- webp-to-png / jfif-to-png / webp-to-jpg -->
<script src="/static/js/convert-upload.js"></script>
<script src="/static/js/convert-formats.js"></script>
<script src="/static/js/convert-frontend.js"></script>

<!-- svg-converter -->
<script src="/static/js/convert-upload.js"></script>
<script src="/static/js/convert-formats.js"></script>
<script src="/static/js/convert-frontend.js"></script>
<script src="/static/js/convert-svg-opts.js"></script>

<!-- image（智能分流）-->
<script src="/static/js/convert-upload.js"></script>
<script src="/static/js/convert-formats.js"></script>
<script src="/static/js/convert-frontend.js"></script>
<script src="/static/js/convert-image-smart.js"></script>

<!-- png-to-svg / heic-to-jpg / heic-to-png（后端）-->
<script src="/static/js/convert-upload.js"></script>
<script src="/static/js/convert-formats.js"></script>
<script src="/static/js/convert-api.js"></script>
```

---

## 7. 验收标准

### 前端转换
- [ ] WEBP→PNG：上传 webp，点击转换，下载 PNG，透明背景保留
- [ ] JFIF→PNG：上传 .jfif 文件，下载 PNG，画质无损
- [ ] WEBP→JPG：下载 JPG，透明区域变白色背景
- [ ] SVG→PNG：1024px 宽度，矢量清晰渲染，下载后可打开
- [ ] 全程浏览器内完成，Network 面板无文件上传请求

### 后端转换
- [ ] PNG→SVG：上传 Logo PNG（双色），下载 SVG，可在 Inkscape 编辑
- [ ] HEIC→JPG：上传 iPhone 拍摄的 .heic，下载 JPG，可在 Windows 打开
- [ ] HEIC→PNG：下载 PNG，透明通道（如存在）正确处理
- [ ] Image Converter：PNG→ICO 走后端，输出 ICO 可设为 Windows 图标

### 性能
- [ ] 10 张 WEBP（各 2MB）前端批量转 PNG：10 秒内完成，页面不卡顿
- [ ] HEIC 文件 8MB：后端处理 < 5 秒
