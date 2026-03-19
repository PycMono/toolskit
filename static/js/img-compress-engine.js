/* ═══════════════════════════════════════════════
   Image Compress Engine - Block I-03
   纯前端压缩引擎（Canvas + browser-image-compression）
═══════════════════════════════════════════════ */

'use strict';

console.log('🔧 Image Compress Engine - Block I-03 loaded');

/* ═══════════════════════════════════════════════
   全局状态
═══════════════════════════════════════════════ */
const ICState = {
  files:       [],    // 原始 File 对象数组
  results:     [],    // 压缩结果数组
  isRunning:   false, // 是否正在压缩
  quality:     80,    // 当前质量 20~100
  outputFormat:'original', // 输出格式
  maxWidth:    null,  // 最大宽度（null = 不限制）
};

const IC_MAX_FILES   = 20;
const IC_MAX_SIZE_MB = 10;
const IC_CONCURRENCY = 4; // 并发压缩数

/* ═══════════════════════════════════════════════
   文件入口：校验 + 去重 + 入队
═══════════════════════════════════════════════ */
function addFiles(fileList) {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  let added = 0;

  for (const file of Array.from(fileList)) {
    // 数量上限
    if (ICState.files.length >= IC_MAX_FILES) {
      showToast(`最多同时处理 ${IC_MAX_FILES} 张图片`, 'error');
      break;
    }

    // 格式检查
    if (!allowed.includes(file.type)) {
      if (file.type === 'image/gif') {
        showToast(`${file.name}：暂不支持 GIF，请转为 PNG 后上传`, 'error');
      } else {
        showToast(`${file.name}：不支持的格式`, 'error');
      }
      continue;
    }

    // 大小检查
    if (file.size > IC_MAX_SIZE_MB * 1024 * 1024) {
      showToast(`${file.name} 超过 ${IC_MAX_SIZE_MB}MB 限制`, 'error');
      continue;
    }

    // 去重（按文件名+大小）
    const key = `${file.name}-${file.size}`;
    if (ICState.files.some(f => `${f.name}-${f.size}` === key)) continue;

    // 生成唯一 id
    file._icId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    ICState.files.push(file);
    added++;
  }

  if (added > 0) onFilesAdded();
}

/* ═══════════════════════════════════════════════
   主压缩流程
═══════════════════════════════════════════════ */
async function startCompress() {
  if (ICState.files.length === 0 || ICState.isRunning) return;
  ICState.isRunning = true;

  // 读取当前选项
  ICState.quality      = parseInt(document.getElementById('qualitySlider')?.value || 80);
  ICState.outputFormat = document.querySelector('input[name="outputFormat"]:checked')?.value || 'original';
  ICState.maxWidth     = parseInt(document.getElementById('maxWidth')?.value) || null;

  // 找出尚未压缩的文件
  const pending = ICState.files.filter(f =>
    !ICState.results.find(r => r.id === f._icId)
  );

  if (pending.length === 0) {
    ICState.isRunning = false;
    showToast('所有文件已处理完成', 'success');
    return;
  }

  // 更新 UI
  setCompressBtnState('running');
  showResultsSection();

  // 先为所有待处理文件插入「处理中」占位卡片
  for (const file of pending) {
    upsertResultCard({
      id:       file._icId,
      name:     file.name,
      origSize: file.size,
      origType: file.type,
      status:   'compressing',
    });
  }

  // 并发处理（限制 IC_CONCURRENCY 个同时执行）
  await runConcurrent(pending, IC_CONCURRENCY, async (file) => {
    try {
      const result = await compressOne(file);
      ICState.results.push(result);
      upsertResultCard(result);
    } catch (err) {
      console.error('压缩失败:', file.name, err);
      upsertResultCard({
        id:       file._icId,
        name:     file.name,
        origSize: file.size,
        origType: file.type,
        status:   'error',
        error:    err.message,
      });
    }
  });

  ICState.isRunning = false;
  setCompressBtnState('idle');
  updateSummaryStats();
  showToast(`成功压缩 ${ICState.results.filter(r => r.status === 'done').length} 张图片`, 'success');
}

/* ═══════════════════════════════════════════════
   单张图片压缩核心
═══════════════════════════════════════════════ */
async function compressOne(file) {
  const quality      = ICState.quality / 100;          // 0.0~1.0
  const outputFormat = ICState.outputFormat;
  const maxWidth     = ICState.maxWidth;

  // 确定最终输出 MIME
  let targetMime = file.type;
  if (outputFormat !== 'original') targetMime = outputFormat;

  // PNG 有损压缩仍用 JPEG 引擎，除非用户显式选 PNG
  if (targetMime === 'image/png' && outputFormat === 'original' && quality < 0.85) {
    // 保持 PNG 格式时使用 browser-image-compression（支持 PNG 有损）
    return await compressPNG(file, quality, maxWidth, targetMime);
  } else {
    // JPEG / WebP / 格式转换 → 用 Canvas
    return await compressViaCanvas(file, quality, maxWidth, targetMime);
  }
}

/* ── Canvas 压缩（JPEG / WebP / 格式转换）──── */
async function compressViaCanvas(file, quality, maxWidth, targetMime) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // 计算目标尺寸
      let { width, height } = img;
      if (maxWidth && width > maxWidth) {
        height = Math.round(height * (maxWidth / width));
        width  = maxWidth;
      }

      // 绘制到 Canvas
      const canvas = document.createElement('canvas');
      canvas.width  = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');

      // WebP/JPEG 不支持透明背景，PNG 转 JPG 时需要白底
      if (targetMime === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
      }

      ctx.drawImage(img, 0, 0, width, height);

      // 导出为目标格式
      const q = targetMime === 'image/png' ? undefined : quality;
      canvas.toBlob(blob => {
        if (!blob) { reject(new Error('Canvas toBlob 失败')); return; }

        const ext     = mimeToExt(targetMime);
        const outName = replaceExt(file.name, ext);

        resolve({
          id:         file._icId,
          name:       outName,
          origName:   file.name,
          origSize:   file.size,
          origType:   file.type,
          outputBlob: blob,
          outputSize: blob.size,
          outputMime: targetMime,
          width,
          height,
          status:     'done',
          savedBytes: file.size - blob.size,
          savedPct:   Math.max(0, Math.round((1 - blob.size / file.size) * 100)),
          previewUrl: URL.createObjectURL(blob),
          origUrl:    URL.createObjectURL(file),
        });
      }, targetMime, q);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('图片加载失败，文件可能已损坏'));
    };

    img.src = url;
  });
}

/* ── browser-image-compression（PNG 有损）─── */
async function compressPNG(file, quality, maxWidth, targetMime) {
  if (typeof imageCompression === 'undefined') {
    console.warn('browser-image-compression 未加载，降级使用 Canvas');
    return await compressViaCanvas(file, quality, maxWidth, targetMime);
  }

  const options = {
    maxSizeMB:          (file.size / (1024 * 1024)) * (1 - quality * 0.6),
    maxWidthOrHeight:   maxWidth || 99999,
    useWebWorker:       true,
    fileType:           targetMime,
    onProgress:         () => {},  // 可接 UI 进度
  };

  // quality 大于 0.85 时直接用 Canvas
  if (quality > 0.85) {
    options.maxSizeMB = file.size / (1024 * 1024) * 0.9;
  }

  const compressed = await imageCompression(file, options);

  const ext     = mimeToExt(targetMime);
  const outName = replaceExt(file.name, ext);

  return {
    id:         file._icId,
    name:       outName,
    origName:   file.name,
    origSize:   file.size,
    origType:   file.type,
    outputBlob: compressed,
    outputSize: compressed.size,
    outputMime: targetMime,
    width:      null,
    height:     null,
    status:     'done',
    savedBytes: file.size - compressed.size,
    savedPct:   Math.max(0, Math.round((1 - compressed.size / file.size) * 100)),
    previewUrl: URL.createObjectURL(compressed),
    origUrl:    URL.createObjectURL(file),
  };
}

/* ═══════════════════════════════════════════════
   并发控制工具
═══════════════════════════════════════════════ */
async function runConcurrent(items, concurrency, fn) {
  const queue   = [...items];
  const workers = [];

  async function worker() {
    while (queue.length > 0) {
      const item = queue.shift();
      if (item) await fn(item);
    }
  }

  for (let i = 0; i < Math.min(concurrency, items.length); i++) {
    workers.push(worker());
  }
  await Promise.all(workers);
}

/* ═══════════════════════════════════════════════
   单张下载
═══════════════════════════════════════════════ */
function downloadOne(id) {
  const result = ICState.results.find(r => r.id === id);
  if (!result || !result.outputBlob) return;

  if (typeof saveAs !== 'undefined') {
    saveAs(result.outputBlob, result.name);
  } else {
    // Fallback: 使用 a 标签下载
    const url = URL.createObjectURL(result.outputBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

/* ═══════════════════════════════════════════════
   全部打包 ZIP 下载
═══════════════════════════════════════════════ */
async function downloadAll() {
  const doneResults = ICState.results.filter(r => r.status === 'done' && r.outputBlob);
  if (doneResults.length === 0) {
    showToast('没有可下载的文件', 'info');
    return;
  }

  if (typeof JSZip === 'undefined') {
    showToast('JSZip 未加载，无法打包下载', 'error');
    return;
  }

  const btn = document.getElementById('downloadAllBtn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = '打包中...';
  }

  try {
    const zip = new JSZip();
    const folder = zip.folder('compressed-images');

    for (const result of doneResults) {
      folder.file(result.name, result.outputBlob);
    }

    const zipBlob = await zip.generateAsync({
      type:               'blob',
      compression:        'DEFLATE',
      compressionOptions: { level: 1 }, // 图片已压缩，ZIP 只做打包
    });

    const timestamp = new Date().toISOString().slice(0, 10);
    const zipName = `compressed-images-${timestamp}.zip`;

    if (typeof saveAs !== 'undefined') {
      saveAs(zipBlob, zipName);
    } else {
      // Fallback
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = zipName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    showToast(`已打包 ${doneResults.length} 张图片`, 'success');
  } catch (err) {
    console.error('打包失败:', err);
    showToast('打包失败：' + err.message, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = '⬇ 打包下载全部';
    }
  }
}

/* ═══════════════════════════════════════════════
   清空全部状态
═══════════════════════════════════════════════ */
function clearAll() {
  // 释放 ObjectURL 防内存泄漏
  for (const r of ICState.results) {
    if (r.previewUrl) URL.revokeObjectURL(r.previewUrl);
    if (r.origUrl)    URL.revokeObjectURL(r.origUrl);
  }

  ICState.files   = [];
  ICState.results = [];

  document.getElementById('resultsList').innerHTML = '';
  const resultsSection = document.getElementById('resultsSection');
  if (resultsSection) resultsSection.style.display = 'none';

  const optionsPanel = document.getElementById('optionsPanel');
  if (optionsPanel) optionsPanel.style.display = 'none';

  setCompressBtnState('idle');
  showToast('已清空全部文件', 'info');
}

/* ═══════════════════════════════════════════════
   工具函数
═══════════════════════════════════════════════ */
function mimeToExt(mime) {
  const map = {
    'image/jpeg': 'jpg',
    'image/png':  'png',
    'image/webp': 'webp',
  };
  return map[mime] || 'jpg';
}

function replaceExt(filename, newExt) {
  const dotIdx = filename.lastIndexOf('.');
  const base   = dotIdx > 0 ? filename.slice(0, dotIdx) : filename;
  return `${base}.${newExt}`;
}

function formatFileSize(bytes) {
  if (bytes === 0)          return '0 B';
  if (bytes < 1024)         return `${bytes} B`;
  if (bytes < 1024 * 1024)  return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function setCompressBtnState(state) {
  const btn  = document.getElementById('compressBtn');
  const text = document.getElementById('compressBtnText');
  if (!btn) return;

  if (state === 'running') {
    btn.disabled    = true;
    text.textContent = '压缩中...';
  } else {
    btn.disabled    = false;
    text.textContent = '开始压缩';
  }
}

function updateSummaryStats() {
  const done      = ICState.results.filter(r => r.status === 'done');
  const totalOrig = done.reduce((s, r) => s + r.origSize, 0);
  const totalOut  = done.reduce((s, r) => s + r.outputSize, 0);
  const savedPct  = totalOrig > 0
    ? Math.round((1 - totalOut / totalOrig) * 100) : 0;

  const headerEl = document.getElementById('resultsHeader');
  if (!headerEl) return;

  headerEl.innerHTML = `
    <div class="ic-stat">
      <span class="ic-stat__label">已处理</span>
      <span class="ic-stat__value">${done.length} 张</span>
    </div>
    <div class="ic-stat">
      <span class="ic-stat__label">原始大小</span>
      <span class="ic-stat__value">${formatFileSize(totalOrig)}</span>
    </div>
    <div class="ic-stat">
      <span class="ic-stat__label">压缩后</span>
      <span class="ic-stat__value">${formatFileSize(totalOut)}</span>
    </div>
    <div class="ic-stat">
      <span class="ic-stat__label">共节省</span>
      <span class="ic-stat__value ic-stat__value--green">
        ${formatFileSize(totalOrig - totalOut)} (-${savedPct}%)
      </span>
    </div>
  `;
}

console.log('✅ Image Compress Engine initialized');

