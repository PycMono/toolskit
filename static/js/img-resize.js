// Image Resize Tool — img-resize.js

/* ══════════════════════════════════════════════
   State Management
   ══════════════════════════════════════════════ */
let uploadedFiles = [];
let resizedResults = [];
let currentMode = 'pixel';
let aspectRatioLocked = true;
let originalRatio = 1;

const MAX_FILES = 20;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/* ══════════════════════════════════════════════
   Initialization
   ══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initUploadZone();
  initDimensionInputs();
  initQualitySlider();
});

/* ══════════════════════════════════════════════
   Upload Zone
   ══════════════════════════════════════════════ */
function initUploadZone() {
  const zone = document.getElementById('uploadZone');
  const input = document.getElementById('fileInput');
  const btn = document.getElementById('selectFilesBtn');

  if (!zone || !input || !btn) return;

  btn.addEventListener('click', () => input.click());
  input.addEventListener('change', (e) => handleFiles(e.target.files));

  zone.addEventListener('click', (e) => {
    if (e.target === zone || e.target.closest('.ir-upload-icon, .ir-upload-title, .ir-upload-hint')) {
      input.click();
    }
  });

  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('drag-over');
  });

  zone.addEventListener('dragleave', () => {
    zone.classList.remove('drag-over');
  });

  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
  });
}

function handleFiles(files) {
  if (!files || files.length === 0) return;

  const validFiles = [];
  const errors = [];

  for (const file of files) {
    if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) {
      errors.push(`${file.name}: 不支持的格式`);
      continue;
    }
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`${file.name}: 文件过大（最大10MB）`);
      continue;
    }
    if (uploadedFiles.length + validFiles.length >= MAX_FILES) {
      errors.push(`最多同时处理 ${MAX_FILES} 张图片`);
      break;
    }
    validFiles.push(file);
  }

  if (errors.length > 0) {
    showToast(errors.join('\\n'), 'error');
  }

  if (validFiles.length === 0) return;

  validFiles.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        uploadedFiles.push({
          file,
          img,
          width: img.width,
          height: img.height,
          ratio: img.width / img.height,
        });

        if (uploadedFiles.length === 1) {
          // 首张图片：初始化尺寸
          document.getElementById('widthInput').value = img.width;
          document.getElementById('heightInput').value = img.height;
          originalRatio = img.width / img.height;
        }

        updateUI();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function updateUI() {
  const uploadCard = document.getElementById('uploadCard');
  const optionsCard = document.getElementById('optionsCard');
  const startBtn = document.getElementById('startBtn');

  if (uploadedFiles.length > 0) {
    if (uploadCard) uploadCard.style.display = 'none';
    if (optionsCard) optionsCard.style.display = 'block';
    if (startBtn) startBtn.disabled = false;
  } else {
    if (uploadCard) uploadCard.style.display = 'block';
    if (optionsCard) optionsCard.style.display = 'none';
    if (startBtn) startBtn.disabled = true;
  }
}

/* ══════════════════════════════════════════════
   Mode Switching
   ══════════════════════════════════════════════ */
function switchMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.ir-mode-tab').forEach(tab => {
    tab.classList.toggle('ir-mode-tab--active', tab.dataset.mode === mode);
  });
  document.querySelectorAll('.ir-mode-panel').forEach(panel => {
    panel.style.display = panel.id === `mode-${mode}` ? 'block' : 'none';
  });
}

/* ══════════════════════════════════════════════
   Dimension Inputs (Aspect Ratio Lock)
   ══════════════════════════════════════════════ */
function initDimensionInputs() {
  const widthInput = document.getElementById('widthInput');
  const heightInput = document.getElementById('heightInput');

  if (!widthInput || !heightInput) return;

  widthInput.addEventListener('input', () => {
    if (aspectRatioLocked && originalRatio) {
      heightInput.value = Math.round(widthInput.value / originalRatio);
    }
  });

  heightInput.addEventListener('input', () => {
    if (aspectRatioLocked && originalRatio) {
      widthInput.value = Math.round(heightInput.value * originalRatio);
    }
  });
}

function toggleLock() {
  aspectRatioLocked = !aspectRatioLocked;
  const btn = document.getElementById('lockBtn');
  const icon = document.getElementById('lockIcon');
  if (btn) btn.classList.toggle('unlocked', !aspectRatioLocked);
  if (icon && !aspectRatioLocked) {
    icon.innerHTML = '<path d="M7 11V8c0-2.8 2.2-5 5-5 1.4 0 2.6.5 3.5 1.5M5 11h14v10H5z"/>';
  } else if (icon) {
    icon.innerHTML = '<path d="M17 11V8c0-2.8-2.2-5-5-5S7 5.2 7 8v3M5 11h14v10H5z"/>';
  }
}

function selectPreset(w, h) {
  document.getElementById('widthInput').value = w;
  document.getElementById('heightInput').value = h;
  originalRatio = w / h;
  showToast(`已选择预设尺寸：${w}×${h}`, 'success');
}

/* ══════════════════════════════════════════════
   Quality Slider
   ══════════════════════════════════════════════ */
function initQualitySlider() {
  const slider = document.getElementById('qualitySlider');
  const value = document.getElementById('qualityValue');
  if (!slider || !value) return;

  slider.addEventListener('input', () => {
    value.textContent = slider.value;
  });
}

/* ══════════════════════════════════════════════
   Resize Processing
   ══════════════════════════════════════════════ */
async function startResize() {
  if (uploadedFiles.length === 0) return;

  const startBtn = document.getElementById('startBtn');
  if (startBtn) {
    startBtn.disabled = true;
    startBtn.textContent = '处理中...';
  }

  // Get target dimensions
  let targetWidth, targetHeight;

  if (currentMode === 'pixel') {
    targetWidth = parseInt(document.getElementById('widthInput').value) || 800;
    targetHeight = parseInt(document.getElementById('heightInput').value) || 600;
  } else if (currentMode === 'percent') {
    const percent = parseInt(document.getElementById('percentInput').value) || 100;
    const first = uploadedFiles[0];
    targetWidth = Math.round(first.width * percent / 100);
    targetHeight = Math.round(first.height * percent / 100);
  } else {
    // preset mode - already set in widthInput/heightInput
    targetWidth = parseInt(document.getElementById('widthInput').value) || 800;
    targetHeight = parseInt(document.getElementById('heightInput').value) || 600;
  }

  if (targetWidth < 1 || targetWidth > 10000 || targetHeight < 1 || targetHeight > 10000) {
    showToast('请输入有效的尺寸（1~10000px）', 'error');
    if (startBtn) { startBtn.disabled = false; startBtn.textContent = '开始调整大小'; }
    return;
  }

  const format = document.getElementById('formatSelect').value;
  const quality = parseInt(document.getElementById('qualitySlider').value) / 100;

  resizedResults = [];
  showResultsCard();

  for (const item of uploadedFiles) {
    const resultItem = addResultItem(item.file.name, 'processing');

    try {
      const blob = await resizeImage(item.img, targetWidth, targetHeight, format, quality, item.file.type);
      const url = URL.createObjectURL(blob);

      resizedResults.push({
        name: getOutputFilename(item.file.name, format),
        blob,
        url,
        originalSize: item.file.size,
        newSize: blob.size,
        originalDim: `${item.width}×${item.height}`,
        newDim: `${targetWidth}×${targetHeight}`,
      });

      updateResultItem(resultItem, 'done', url, item.file.size, blob.size, `${item.width}×${item.height}`, `${targetWidth}×${targetHeight}`);

    } catch (err) {
      console.error('Resize failed:', err);
      updateResultItem(resultItem, 'error');
    }
  }

  if (startBtn) {
    startBtn.disabled = false;
    startBtn.textContent = '开始调整大小';
  }

  const downloadAllBtn = document.getElementById('downloadAllBtn');
  if (downloadAllBtn) downloadAllBtn.disabled = resizedResults.length === 0;

  showToast(`✅ 已完成 ${resizedResults.length} 张图片调整`, 'success');
}

/* ══════════════════════════════════════════════
   Resize Engine (Canvas API)
   ══════════════════════════════════════════════ */
function resizeImage(img, targetW, targetH, format, quality, originalType) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, targetW, targetH);

    let mimeType;
    if (format === 'original') {
      mimeType = originalType;
    } else if (format === 'jpg') {
      mimeType = 'image/jpeg';
    } else if (format === 'png') {
      mimeType = 'image/png';
    } else if (format === 'webp') {
      mimeType = 'image/webp';
    } else {
      mimeType = originalType;
    }

    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas toBlob failed'));
    }, mimeType, quality);
  });
}

function getOutputFilename(original, format) {
  const base = original.replace(/\.[^.]+$/, '');
  if (format === 'original') return original;
  const ext = format === 'jpg' ? '.jpg' : format === 'png' ? '.png' : format === 'webp' ? '.webp' : '.jpg';
  return base + ext;
}

/* ══════════════════════════════════════════════
   Results UI
   ══════════════════════════════════════════════ */
function showResultsCard() {
  const card = document.getElementById('resultsCard');
  if (card) card.style.display = 'block';
}

function addResultItem(name, status) {
  const list = document.getElementById('resultsList');
  if (!list) return null;

  const item = document.createElement('div');
  item.className = 'ir-result-item';
  item.innerHTML = `
    <div class="ir-result-preview"><div style="width:100%;height:100%;background:#e5e7eb"></div></div>
    <div class="ir-result-info">
      <p class="ir-result-name">${name}</p>
      <div class="ir-result-meta">
        <span class="ir-result-status ir-result-status--${status}">处理中...</span>
      </div>
    </div>
    <div class="ir-result-actions"></div>
  `;
  list.appendChild(item);
  return item;
}

function updateResultItem(item, status, url, originalSize, newSize, originalDim, newDim) {
  if (!item) return;

  const preview = item.querySelector('.ir-result-preview');
  const statusEl = item.querySelector('.ir-result-status');
  const meta = item.querySelector('.ir-result-meta');
  const actions = item.querySelector('.ir-result-actions');

  if (status === 'done' && url) {
    if (preview) preview.innerHTML = `<img src="${url}" alt="">`;
    if (statusEl) {
      statusEl.className = 'ir-result-status ir-result-status--done';
      statusEl.textContent = '完成';
    }
    if (meta) {
      const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(0);
      meta.innerHTML = `
        <span class="ir-result-status ir-result-status--done">完成</span>
        <span>${originalDim} → ${newDim}</span>
        <span>${formatSize(originalSize)} → ${formatSize(newSize)}</span>
        <span style="color:#22c55e;font-weight:600">${reduction > 0 ? `-${reduction}%` : '0%'}</span>
      `;
    }
    if (actions) {
      const idx = resizedResults.length - 1;
      actions.innerHTML = `
        <button class="ir-result-btn" onclick="previewResult(${idx})">预览</button>
        <button class="ir-result-btn ir-result-btn--download" onclick="downloadSingle(${idx})">下载</button>
      `;
    }
  } else if (status === 'error') {
    if (statusEl) {
      statusEl.className = 'ir-result-status ir-result-status--error';
      statusEl.textContent = '失败';
    }
  }
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/* ══════════════════════════════════════════════
   Download
   ══════════════════════════════════════════════ */
function downloadSingle(idx) {
  const result = resizedResults[idx];
  if (!result) return;
  const a = document.createElement('a');
  a.href = result.url;
  a.download = result.name;
  a.click();
}

async function downloadAll() {
  if (resizedResults.length === 0) return;
  if (typeof JSZip === 'undefined') {
    showToast('ZIP 库未加载，请刷新页面', 'error');
    return;
  }

  const zip = new JSZip();
  resizedResults.forEach((r) => {
    zip.file(r.name, r.blob);
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `resized-images-${Date.now()}.zip`);
  showToast(`已打包 ${resizedResults.length} 张图片`, 'success');
}

function clearAll() {
  if (!confirm('确定清空所有结果？')) return;
  uploadedFiles = [];
  resizedResults = [];
  document.getElementById('fileInput').value = '';
  const list = document.getElementById('resultsList');
  if (list) list.innerHTML = '';
  const resultsCard = document.getElementById('resultsCard');
  if (resultsCard) resultsCard.style.display = 'none';
  updateUI();
}

/* ══════════════════════════════════════════════
   Preview Modal
   ══════════════════════════════════════════════ */
function previewResult(idx) {
  const result = resizedResults[idx];
  if (!result) return;

  const modal = document.createElement('div');
  modal.className = 'ir-preview-modal';
  modal.innerHTML = `
    <div class="ir-preview-content">
      <button class="ir-preview-close" onclick="this.closest('.ir-preview-modal').remove()">✕</button>
      <h3>${result.name}</h3>
      <img src="${result.url}" alt="${result.name}" style="max-width:100%;max-height:70vh;border-radius:8px">
      <div class="ir-preview-meta">
        <span>${result.originalDim} → ${result.newDim}</span>
        <span>${formatSize(result.originalSize)} → ${formatSize(result.newSize)}</span>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

/* ══════════════════════════════════════════════
   Helpers
   ══════════════════════════════════════════════ */
function showToast(msg, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `ir-toast ir-toast--${type}`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

