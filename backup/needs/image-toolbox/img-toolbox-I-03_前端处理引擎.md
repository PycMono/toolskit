<!-- img-toolbox-I-03_前端处理引擎.md -->

# 图片处理工具箱 · 前端处理引擎

---

## 1. 技术选型表

| 工具 / 场景 | 处理方案 | 选用理由 |
|-------------|----------|----------|
| 裁剪图片（crop） | Cropper.js + Canvas API | Cropper.js 提供完整的交互式裁剪框，裁剪结果通过 `.getCroppedCanvas()` 导出 |
| 转换为 JPG（to-jpg） | Canvas API `toDataURL('image/jpeg', quality)` | 原生 Canvas 支持，无需第三方库，质量参数 0-1 精确控制 |
| JPG 转其他格式（jpg-to） | Canvas API `toDataURL('image/png'/'image/webp')` | 同上，WEBP 在现代浏览器中原生支持 |
| 图片编辑器（photo-editor） | Canvas API + CSS Filter / CanvasRenderingContext2D | 亮度/对比度/饱和度用 CSS filter 实现；锐化用卷积核矩阵（ConvolveMatrix）处理 |
| 移除背景（remove-bg） | @imgly/background-removal（WASM） | 纯浏览器 AI 推理，无需服务器，隐私最优；首次加载 WASM 模型约 10s |
| 添加水印（watermark） | Canvas API drawImage + fillText | 原生 Canvas 可精确控制位置、透明度、字体样式 |
| 旋转/翻转（rotate） | Canvas API rotate / scale(-1,1) | 任意角度旋转一次 canvas.rotate()，翻转用 scale(-1,1) + translate |
| 批量下载 | JSZip + FileSaver | JSZip 内存打包，`saveAs()` 触发浏览器下载 |

---

## 2. 引擎架构说明

### 全局状态对象

```javascript
// static/js/img-toolbox-engine.js

const STATE = {
  files: [],          // Array<FileEntry> 文件队列
  options: {},        // 当前选项面板参数（由各工具页面填充）
  processing: false,  // 是否正在处理中
  results: new Map(), // id -> ResultEntry，处理结果存储
  objectURLs: [],     // Array<string> 所有已创建的 ObjectURL，clearAll 时统一释放
};

// FileEntry 结构
const FileEntry = {
  id: '',            // crypto.randomUUID()
  file: null,        // File 对象
  name: '',          // 文件名
  ext: '',           // 原始扩展名
  size: 0,           // 原始大小（字节）
  status: 'waiting', // 'waiting' | 'processing' | 'done' | 'error'
  originalURL: '',   // ObjectURL of original（预览用）
  outputURL: '',     // ObjectURL of output（下载用）
  outputSize: 0,     // 输出大小
  outputName: '',    // 输出文件名
  error: '',         // 错误信息
};

const CONCURRENT_LIMIT = 3; // 并发处理数，通过常量配置
const MAX_FILES = 30;
const MAX_FILE_SIZE_MB = 20;
const ALLOWED_TYPES = ['image/jpeg','image/png','image/webp','image/gif','image/bmp','image/svg+xml'];
```

---

### `addFiles(fileList)` —— 文件入队

```javascript
function addFiles(fileList) {
  const files = Array.from(fileList);
  let added = 0;

  for (const file of files) {
    // 1. 格式白名单校验
    if (!ALLOWED_TYPES.includes(file.type)) {
      showToast(`${file.name}: ${i18n('error.common.format_not_supported')}`, 'error');
      gaTrackError('format_not_supported', file.name);
      continue;
    }
    // 2. 大小校验（20MB）
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      showToast(`${file.name}: ${i18n('error.common.file_too_large')}`, 'error');
      gaTrackError('file_too_large', file.name);
      continue;
    }
    // 3. 数量上限（30个）
    if (STATE.files.length >= MAX_FILES) {
      showToast(i18n('error.common.too_many_files'), 'warning');
      break;
    }
    // 4. 去重（同名同大小视为重复）
    const isDup = STATE.files.some(f => f.name === file.name && f.size === file.size);
    if (isDup) continue;

    const entry = createFileEntry(file);
    STATE.objectURLs.push(entry.originalURL); // 注册，统一释放
    STATE.files.push(entry);
    upsertResultCard(entry);   // 渲染占位卡片
    added++;
  }

  if (added > 0) {
    setProcessBtnState(true);
    gaTrackUpload(added, STATE.files.reduce((s,f) => s+f.size, 0));
  }

  // 显示选项面板
  document.getElementById('optionsPanel').hidden = false;
  document.getElementById('resultsSection').hidden = false;
}
```

---

### `startProcess()` —— 处理调度入口

```javascript
async function startProcess() {
  if (STATE.processing) return;
  STATE.processing = true;
  setProcessBtnState(false);

  // 读取当前选项面板参数
  const opts = collectOptions();

  // 筛选待处理文件（waiting 状态）
  const pending = STATE.files.filter(f => f.status === 'waiting');

  // 并发调度
  await runConcurrent(pending, opts, CONCURRENT_LIMIT);

  STATE.processing = false;
  setProcessBtnState(true);
  updateSummaryStats();
  gaTrackProcessDone(pending.length, calcTotalSaved());
}
```

---

### `runConcurrent(queue, opts, limit)` —— 并发调度

```javascript
async function runConcurrent(queue, opts, limit) {
  // 使用 "滑动窗口" 并发控制
  const iter = queue[Symbol.iterator]();
  const workers = Array.from({ length: limit }, () =>
    (async () => {
      for (let entry of iter) {
        await processOne(entry, opts);
      }
    })()
  );
  await Promise.all(workers);
}
```

---

### `processOne(entry, opts)` —— 单文件处理分发

```javascript
async function processOne(entry, opts) {
  entry.status = 'processing';
  upsertResultCard(entry);
  startFakeProgress(entry.id); // 伪进度动画 0→85%

  try {
    let outputBlob;
    switch (CURRENT_TOOL) {
      case 'crop':       outputBlob = await processCrop(entry, opts);       break;
      case 'to-jpg':     outputBlob = await processToJpg(entry, opts);      break;
      case 'jpg-to':     outputBlob = await processJpgTo(entry, opts);      break;
      case 'photo-editor': outputBlob = await processEditor(entry, opts);   break;
      case 'remove-bg':  outputBlob = await processRemoveBg(entry, opts);   break;
      case 'watermark':  outputBlob = await processWatermark(entry, opts);   break;
      case 'rotate':     outputBlob = await processRotate(entry, opts);     break;
    }

    const url = URL.createObjectURL(outputBlob);
    STATE.objectURLs.push(url);

    entry.status = 'done';
    entry.outputURL = url;
    entry.outputSize = outputBlob.size;
    entry.outputName = buildOutputName(entry, opts);

    stopFakeProgress(entry.id, 100); // 跳到 100%
  } catch (err) {
    entry.status = 'error';
    entry.error = err.message || i18n('error.common.process_failed');
    stopFakeProgress(entry.id, 0);
    gaTrackError('process_failed', entry.name);
  }

  upsertResultCard(entry);
}
```

---

### 各工具核心处理函数

#### 裁剪（processCrop）

```javascript
async function processCrop(entry, opts) {
  // Cropper 实例已在预览区初始化（单文件）
  // 批量模式：直接按参数用 Canvas 裁剪
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const { x, y, w, h } = resolveCropBox(img, opts);
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
      canvas.toBlob(resolve, entry.file.type || 'image/jpeg', 0.95);
    };
    img.src = entry.originalURL;
  });
}

function resolveCropBox(img, opts) {
  if (opts.mode === 'custom') {
    // 居中裁剪到目标尺寸
    const w = Math.min(opts.width, img.naturalWidth);
    const h = Math.min(opts.height, img.naturalHeight);
    return { x: (img.naturalWidth-w)/2, y: (img.naturalHeight-h)/2, w, h };
  }
  if (opts.mode === 'ratio') {
    // 按比例最大内切矩形
    const [rw, rh] = opts.ratio.split('/').map(Number);
    const scale = Math.min(img.naturalWidth/rw, img.naturalHeight/rh);
    const w = rw*scale, h = rh*scale;
    return { x: (img.naturalWidth-w)/2, y: (img.naturalHeight-h)/2, w, h };
  }
  // free: 使用 Cropper 实例的 getCropData（仅首张图适用）
  return cropperInstance ? cropperInstance.getData(true) : { x:0, y:0, w:img.naturalWidth, h:img.naturalHeight };
}
```

#### 转换为 JPG（processToJpg）

```javascript
async function processToJpg(entry, opts) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      // 填充白色背景（处理透明通道）
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(resolve, 'image/jpeg', opts.quality / 100);
    };
    img.src = entry.originalURL;
  });
}
```

#### JPG 转其他格式（processJpgTo）

```javascript
async function processJpgTo(entry, opts) {
  const mimeMap = { png:'image/png', webp:'image/webp', gif:'image/gif', bmp:'image/bmp' };
  const mime = mimeMap[opts.format] || 'image/png';
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      canvas.getContext('2d').drawImage(img, 0, 0);
      canvas.toBlob(resolve, mime);
    };
    img.src = entry.originalURL;
  });
}
```

#### 图片编辑器（processEditor）

```javascript
async function processEditor(entry, opts) {
  // opts: { brightness, contrast, saturation, sharpness, blur }
  // brightness/contrast/saturation 用 CSS filter 方式写入 Canvas
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');

      // 应用 CSS 风格滤镜
      ctx.filter = [
        `brightness(${opts.brightness}%)`,
        `contrast(${opts.contrast}%)`,
        `saturate(${opts.saturation}%)`,
        `blur(${opts.blur}px)`,
      ].join(' ');
      ctx.drawImage(img, 0, 0);
      ctx.filter = 'none';

      // 锐化：拉普拉斯卷积核
      if (opts.sharpness > 0) {
        applySharpness(ctx, canvas.width, canvas.height, opts.sharpness);
      }

      canvas.toBlob(resolve, entry.file.type || 'image/jpeg', 0.95);
    };
    img.src = entry.originalURL;
  });
}

function applySharpness(ctx, w, h, strength) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const kernel = [0,-1,0,-1, 4+strength/25, -1, 0,-1,0]; // 拉普拉斯锐化核
  const data = imageData.data;
  // 3×3 卷积（关键循环，完整实现省略）
  // ...
  ctx.putImageData(imageData, 0, 0);
}
```

#### 移除背景（processRemoveBg）

```javascript
// 首次调用时加载 WASM 模型
let bgRemoverConfig = null;

async function initBgRemover() {
  if (bgRemoverConfig) return;
  showToast(i18n('status.remove_bg.loading_model'), 'info', 0);
  const { Config, preload } = await import('https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.4.5/dist/browser/index.js');
  bgRemoverConfig = { publicPath: 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.4.5/dist/browser/' };
  await preload(bgRemoverConfig);
  hideToast();
}

async function processRemoveBg(entry, opts) {
  await initBgRemover();
  const { removeBackground } = await import('https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.4.5/dist/browser/index.js');
  // removeBackground 接受 Blob，返回 Blob（PNG with transparency）
  const outputBlob = await removeBackground(entry.file, bgRemoverConfig);
  return outputBlob;
}
```

#### 添加水印（processWatermark）

```javascript
async function processWatermark(entry, opts) {
  // opts: { type, text, fontSize, opacity, color, position, watermarkImgURL }
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      ctx.globalAlpha = opts.opacity / 100;

      if (opts.type === 'text') {
        ctx.font = `bold ${opts.fontSize}px Arial`;
        ctx.fillStyle = opts.color;
        const [x, y] = calcWatermarkPos(canvas.width, canvas.height, opts.position, ctx.measureText(opts.text).width, opts.fontSize);
        ctx.fillText(opts.text, x, y);
      } else {
        // 图片水印
        const wImg = new Image();
        wImg.onload = () => {
          const ww = Math.min(canvas.width * 0.3, wImg.naturalWidth);
          const wh = ww / wImg.naturalWidth * wImg.naturalHeight;
          const [x, y] = calcWatermarkPos(canvas.width, canvas.height, opts.position, ww, wh);
          ctx.drawImage(wImg, x, y, ww, wh);
          canvas.toBlob(resolve, entry.file.type || 'image/jpeg', 0.95);
        };
        wImg.src = opts.watermarkImgURL;
        return;
      }

      canvas.toBlob(resolve, entry.file.type || 'image/jpeg', 0.95);
    };
    img.src = entry.originalURL;
  });
}

// 9 宫格位置映射
function calcWatermarkPos(cw, ch, position, ww, wh) {
  const pad = 20;
  const posMap = {
    'tl': [pad, pad+wh],
    'tc': [(cw-ww)/2, pad+wh],
    'tr': [cw-ww-pad, pad+wh],
    'ml': [pad, (ch+wh)/2],
    'mc': [(cw-ww)/2, (ch+wh)/2],
    'mr': [cw-ww-pad, (ch+wh)/2],
    'bl': [pad, ch-pad],
    'bc': [(cw-ww)/2, ch-pad],
    'br': [cw-ww-pad, ch-pad],
  };
  return posMap[position] || posMap['br'];
}
```

#### 旋转/翻转（processRotate）

```javascript
async function processRotate(entry, opts) {
  // opts: { angle, flipH, flipV }
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const rad = opts.angle * Math.PI / 180;
      const sin = Math.abs(Math.sin(rad)), cos = Math.abs(Math.cos(rad));
      const outW = Math.ceil(img.naturalWidth * cos + img.naturalHeight * sin);
      const outH = Math.ceil(img.naturalWidth * sin + img.naturalHeight * cos);

      const canvas = document.createElement('canvas');
      canvas.width = outW; canvas.height = outH;
      const ctx = canvas.getContext('2d');

      // 白色填充（避免透明角落）
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, outW, outH);

      ctx.translate(outW / 2, outH / 2);
      ctx.rotate(rad);
      if (opts.flipH) ctx.scale(-1, 1);
      if (opts.flipV) ctx.scale(1, -1);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

      canvas.toBlob(resolve, entry.file.type || 'image/jpeg', 0.95);
    };
    img.src = entry.originalURL;
  });
}
```

---

### 下载函数

```javascript
function downloadOne(entry) {
  const a = document.createElement('a');
  a.href = entry.outputURL;
  a.download = entry.outputName;
  a.click();
  gaTrackDownloadOne();
}

async function downloadAll() {
  const done = STATE.files.filter(f => f.status === 'done');
  if (done.length === 0) return;
  showToast(i18n('download.common.preparing'), 'info', 0);

  const zip = new JSZip();
  for (const entry of done) {
    const resp = await fetch(entry.outputURL);
    const blob = await resp.blob();
    zip.file(entry.outputName, blob);
  }
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `img-toolbox-${Date.now()}.zip`);
  hideToast();
  gaTrackDownloadAll(done.length);
}
```

---

### `clearAll()` —— 内存释放

```javascript
function clearAll() {
  // 必须释放所有 ObjectURL，防止内存泄漏
  for (const url of STATE.objectURLs) {
    URL.revokeObjectURL(url);
  }
  STATE.objectURLs = [];
  STATE.files = [];
  STATE.results.clear();
  STATE.processing = false;

  document.getElementById('resultsList').innerHTML = '';
  document.getElementById('resultsSection').hidden = true;
  document.getElementById('optionsPanel').hidden = true;
  setProcessBtnState(false);
  updateSummaryStats();
}
```

---

### 工具函数

```javascript
function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes/1024).toFixed(1)} KB`;
  return `${(bytes/1024/1024).toFixed(2)} MB`;
}

function mimeToExt(mime) {
  const map = { 'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif','image/bmp':'bmp' };
  return map[mime] || 'jpg';
}

function replaceExt(filename, newExt) {
  return filename.replace(/\.[^.]+$/, '') + '.' + newExt;
}

function buildOutputName(entry, opts) {
  const toolSuffix = { 'to-jpg':'jpg', 'jpg-to': opts.format || 'png' };
  const ext = toolSuffix[CURRENT_TOOL] || entry.ext;
  return replaceExt(entry.name, ext);
}

function showToast(msg, type='info', duration=3000) {
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.textContent = msg;
  document.getElementById('toastContainer').appendChild(el);
  requestAnimationFrame(() => el.classList.add('toast--visible'));
  if (duration > 0) setTimeout(() => removeToast(el), duration);
  return el;
}

function removeToast(el) {
  el.classList.remove('toast--visible');
  el.addEventListener('transitionend', () => el.remove(), { once: true });
}

function setProcessBtnState(enabled) {
  const btn = document.getElementById('processBtn');
  btn.disabled = !enabled || STATE.files.filter(f=>f.status==='waiting').length === 0;
}

function updateSummaryStats() {
  const done = STATE.files.filter(f => f.status === 'done');
  if (done.length === 0) { document.getElementById('summaryStats').textContent = ''; return; }
  const totalSaved = done.reduce((s,f) => s + Math.max(0, f.size - f.outputSize), 0);
  const avgSaved = formatFileSize(totalSaved / done.length);
  document.getElementById('summaryStats').textContent =
    i18n('result.common.summary').replace('{count}', done.length).replace('{saved}', avgSaved);
}

// 伪进度动画
function startFakeProgress(id) {
  let pct = 0;
  const timer = setInterval(() => {
    if (pct >= 85) { clearInterval(timer); return; }
    pct += Math.random() * 8 + 2;
    pct = Math.min(pct, 85);
    setCardProgress(id, Math.round(pct));
  }, 200);
  STATE._progressTimers = STATE._progressTimers || {};
  STATE._progressTimers[id] = timer;
}

function stopFakeProgress(id, finalPct) {
  const timer = STATE._progressTimers?.[id];
  if (timer) clearInterval(timer);
  setCardProgress(id, finalPct);
}
```

---

## 3. UI 事件绑定说明

### 拖拽事件（关键：排除子元素触发 dragleave）

```javascript
let dragCounter = 0;

function handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  dragCounter++;
  if (dragCounter === 1) {
    document.getElementById('uploadZone').classList.add('upload-zone--drag-over');
    document.getElementById('uploadIdle').hidden = true;
    document.getElementById('uploadDropActive').hidden = false;
  }
}

function handleDragLeave(e) {
  e.preventDefault();
  dragCounter--;
  // dragCounter > 0 说明仍在子元素内，不触发离开态
  if (dragCounter <= 0) {
    dragCounter = 0;
    document.getElementById('uploadZone').classList.remove('upload-zone--drag-over');
    document.getElementById('uploadIdle').hidden = false;
    document.getElementById('uploadDropActive').hidden = true;
  }
}

function handleDrop(e) {
  e.preventDefault();
  dragCounter = 0;
  document.getElementById('uploadZone').classList.remove('upload-zone--drag-over');
  document.getElementById('uploadIdle').hidden = false;
  document.getElementById('uploadDropActive').hidden = true;
  addFiles(e.dataTransfer.files);
}
```

### 质量滑块联动（to-jpg 工具）

```javascript
const qualitySlider = document.getElementById('qualitySlider');
const qualityLabel = document.getElementById('qualityLabel');

qualitySlider.addEventListener('input', () => {
  qualityLabel.textContent = qualitySlider.value + '%';
  // 防抖 500ms 上报 GA
  clearTimeout(qualitySlider._gaTimer);
  qualitySlider._gaTimer = setTimeout(() => {
    gaTrackOptionChange('quality', qualitySlider.value);
  }, 500);
});
```

### photo-editor 实时预览（防抖 500ms）

```javascript
let editorPreviewTimer = null;

function onEditorSliderChange() {
  clearTimeout(editorPreviewTimer);
  editorPreviewTimer = setTimeout(renderEditorPreview, 500);
}

function renderEditorPreview() {
  const opts = collectOptions();
  const previewImg = document.getElementById('editorPreviewImg');
  // 用 CSS filter 实现即时视觉预览（无需 Canvas，速度更快）
  previewImg.style.filter = [
    `brightness(${opts.brightness}%)`,
    `contrast(${opts.contrast}%)`,
    `saturate(${opts.saturation}%)`,
    `blur(${opts.blur}px)`,
  ].join(' ');
}
```

### FAQ 折叠

```javascript
function toggleFAQ(index) {
  const item = document.getElementById(`faq-${index}`);
  const answer = document.getElementById(`faq-answer-${index}`);
  const isOpen = item.classList.contains('faq-item--open');
  // 关闭所有已展开项
  document.querySelectorAll('.faq-item--open').forEach(el => {
    el.classList.remove('faq-item--open');
    el.querySelector('.faq-item__answer').hidden = true;
    el.querySelector('.faq-item__question').setAttribute('aria-expanded', 'false');
  });
  if (!isOpen) {
    item.classList.add('faq-item--open');
    answer.hidden = false;
    item.querySelector('.faq-item__question').setAttribute('aria-expanded', 'true');
  }
}
```

---

## 4. 验收标准 Checklist

### 处理正确性

- [ ] 裁剪：free/ratio/custom 三种模式输出尺寸与预期一致
- [ ] 裁剪：固定比例模式下图片居中裁剪不拉伸
- [ ] 转JPG：PNG 透明区域填充白色，不出现黑块
- [ ] 转JPG：quality=95 vs quality=50 文件大小有明显差异
- [ ] JPG转PNG：输出为 PNG 格式，透明背景保留（如原图有 alpha 通道）
- [ ] JPG转WEBP：输出为合法 WEBP，现代浏览器可正常显示
- [ ] 图片编辑器：brightness/contrast/saturation 调节效果可见
- [ ] 图片编辑器：锐化参数 > 0 时边缘锐化效果可见
- [ ] 移除背景：输出为 PNG，主体保留，背景变透明
- [ ] 水印文字：文字渲染在正确的 9 宫格位置
- [ ] 水印图片：logo 缩放比例正确（不超过原图宽度 30%）
- [ ] 旋转90°：宽高互换，无多余白边
- [ ] 旋转45°：画布扩展，四角填充白色
- [ ] 水平翻转：图片左右镜像，无变形

### 性能（并发/数量限制）

- [ ] 同时处理 3 个文件时，正在处理的卡片同时显示进度条
- [ ] 第 4 个文件在前 3 个完成前不开始处理
- [ ] 上传第 31 个文件时，显示 Toast 警告"最多支持 30 个文件"
- [ ] 上传 20MB 以上文件，显示文件过大错误提示

### 内存安全

- [ ] 点击「清空全部」后，`STATE.objectURLs` 为空数组
- [ ] 清空后重新上传文件，页面无内存泄漏（Chrome DevTools Memory 验证）
- [ ] 处理 20 张图片后，页面 JS Heap 不超过 500MB

### 下载

- [ ] 单文件下载：文件名与 `entry.outputName` 一致
- [ ] 批量下载：ZIP 包含所有 done 状态文件
- [ ] ZIP 文件名包含时间戳，不重复
- [ ] remove-bg 输出文件扩展名为 `.png`

### 边界情况

- [ ] 上传同名同大小文件时，不重复入队
- [ ] 上传不支持格式（.pdf/.doc），显示格式错误 Toast
- [ ] 处理失败的文件显示「重试」按钮，点击后重新加入处理队列
- [ ] 处理过程中点击「清空全部」，处理立即停止，不再更新 DOM
- [ ] remove-bg 模型加载失败时，显示友好错误提示
