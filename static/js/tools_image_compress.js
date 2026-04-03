/* ==================================================
   Tool Box Nova - Image Compressor
   Browser-based image compression using browser-image-compression library
   ================================================== */

let images = []; // { file, id, originalSize, compressedBlob, compressedSize, quality, status }
let globalQuality = 80;

const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const selectFilesBtn = document.getElementById('selectFilesBtn');
const settingsPanel = document.getElementById('settingsPanel');
const imageList = document.getElementById('imageList');
const batchActions = document.getElementById('batchActions');
const compressSummary = document.getElementById('compressSummary');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');

// ========== File Selection & Drop ==========
selectFilesBtn?.addEventListener('click', () => fileInput.click());
fileInput?.addEventListener('change', (e) => handleFiles(e.target.files));

// Drag & Drop
uploadZone?.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadZone.classList.add('dragover');
});
uploadZone?.addEventListener('dragleave', () => {
  uploadZone.classList.remove('dragover');
});
uploadZone?.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadZone.classList.remove('dragover');
  handleFiles(e.dataTransfer.files);
});

// ========== Handle Files ==========
function handleFiles(files) {
  if (!files || files.length === 0) return;
  if (images.length + files.length > 20) {
    alert('最多支持 20 张图片');
    return;
  }

  Array.from(files).forEach(file => {
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      alert(`跳过不支持的格式: ${file.name}`);
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      alert(`文件过大（>${file.name} > 100MB）`);
      return;
    }

    const id = 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    images.push({
      id,
      file,
      originalSize: file.size,
      compressedBlob: null,
      compressedSize: null,
      quality: globalQuality,
      status: 'pending' // pending / compressing / done / error
    });
  });

  renderImageList();
  showPanels();
}

// ========== Render Image List ==========
function renderImageList() {
  imageList.innerHTML = images.map(img => {
    const originalSizeMB = (img.originalSize / 1024 / 1024).toFixed(2);
    const compressedSizeMB = img.compressedSize ? (img.compressedSize / 1024 / 1024).toFixed(2) : '—';
    const savedPercent = img.compressedSize ? (((img.originalSize - img.compressedSize) / img.originalSize) * 100).toFixed(1) : '—';
    const statusIcon = {
      pending: '⏳',
      compressing: '🔄',
      done: '✅',
      error: '❌'
    }[img.status];

    return `
      <div class="image-item" data-id="${img.id}">
        <div class="image-item-row">
          <div class="image-thumb">
            <img src="${URL.createObjectURL(img.file)}" alt="${img.file.name}">
          </div>
          <div class="image-info">
            <div class="image-name">${statusIcon} ${img.file.name}</div>
            <div class="image-size">
              原始: <strong>${originalSizeMB} MB</strong> → 
              压缩后: <strong>${compressedSizeMB}</strong> 
              ${img.compressedSize ? `<span class="saved-badge">▼ 节省 ${savedPercent}%</span>` : ''}
            </div>
          </div>
          <div class="image-actions">
            ${img.status === 'pending' || img.status === 'done' ? `
              <button class="btn btn-sm btn-outline compress-single-btn" data-id="${img.id}">
                ${img.status === 'pending' ? '压缩' : '重新压缩'}
              </button>
            ` : ''}
            ${img.status === 'done' ? `
              <button class="btn btn-sm btn-primary download-single-btn" data-id="${img.id}">下载</button>
            ` : ''}
            ${img.status === 'compressing' ? `<div class="spinner-sm"></div>` : ''}
            <button class="btn btn-sm btn-icon delete-btn" data-id="${img.id}">🗑</button>
          </div>
        </div>
        ${img.status === 'pending' || img.status === 'done' ? `
          <div class="image-quality-row">
            <label>质量：</label>
            <input type="range" class="quality-slider-mini" min="1" max="100" value="${img.quality}" data-id="${img.id}">
            <span class="quality-value-mini">${img.quality}</span>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  attachImageEvents();
}

// ========== Attach Events ==========
function attachImageEvents() {
  document.querySelectorAll('.compress-single-btn').forEach(btn => {
    btn.addEventListener('click', () => compressSingle(btn.dataset.id));
  });
  document.querySelectorAll('.download-single-btn').forEach(btn => {
    btn.addEventListener('click', () => downloadSingle(btn.dataset.id));
  });
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteImage(btn.dataset.id));
  });
  document.querySelectorAll('.quality-slider-mini').forEach(slider => {
    slider.addEventListener('input', (e) => {
      const img = images.find(i => i.id === slider.dataset.id);
      if (img) img.quality = parseInt(e.target.value);
      e.target.nextElementSibling.textContent = e.target.value;
    });
  });
}

// ========== Compress Single ==========
async function compressSingle(id) {
  const img = images.find(i => i.id === id);
  if (!img) return;

  img.status = 'compressing';
  renderImageList();

  try {
    const options = {
      maxSizeMB: 10,
      maxWidthOrHeight: document.getElementById('maxWidth').value ? parseInt(document.getElementById('maxWidth').value) : undefined,
      useWebWorker: true,
      quality: img.quality / 100,
      fileType: getOutputFormat(img.file.type),
      preserveExif: document.getElementById('keepExif').checked
    };

    const compressedBlob = await imageCompression(img.file, options);
    img.compressedBlob = compressedBlob;
    img.compressedSize = compressedBlob.size;
    img.status = 'done';
  } catch (error) {
    console.error('Compression error:', error);
    img.status = 'error';
    alert(`压缩失败: ${img.file.name} - ${error.message}`);
  }

  renderImageList();
  updateSummary();
}

// ========== Output Format ==========
function getOutputFormat(originalType) {
  const format = document.getElementById('outputFormat').value;
  if (format === 'auto') return originalType;
  if (format === 'jpg') return 'image/jpeg';
  if (format === 'png') return 'image/png';
  if (format === 'webp') return 'image/webp';
  return originalType;
}

// ========== Download Single ==========
function downloadSingle(id) {
  const img = images.find(i => i.id === id);
  if (!img || !img.compressedBlob) return;

  const ext = img.compressedBlob.type.split('/')[1].replace('jpeg', 'jpg');
  const filename = img.file.name.replace(/\.[^.]+$/, '') + '_compressed.' + ext;
  const url = URL.createObjectURL(img.compressedBlob);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}

// ========== Delete Image ==========
function deleteImage(id) {
  images = images.filter(i => i.id !== id);
  if (images.length === 0) {
    hidePanels();
    fileInput.value = '';
  }
  renderImageList();
  updateSummary();
}

// ========== Compress All ==========
document.getElementById('compressAllBtn')?.addEventListener('click', async () => {
  const pending = images.filter(i => i.status === 'pending');
  for (const img of pending) {
    await compressSingle(img.id);
  }
});

// ========== Download All (ZIP) ==========
document.getElementById('downloadAllBtn')?.addEventListener('click', async () => {
  const done = images.filter(i => i.status === 'done' && i.compressedBlob);
  if (done.length === 0) {
    alert('没有已压缩的图片');
    return;
  }

  const zip = new JSZip();
  done.forEach(img => {
    const ext = img.compressedBlob.type.split('/')[1].replace('jpeg', 'jpg');
    const filename = img.file.name.replace(/\.[^.]+$/, '') + '_compressed.' + ext;
    zip.file(filename, img.compressedBlob);
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: 'compressed_images.zip' });
  a.click();
  URL.revokeObjectURL(url);
});

// ========== Clear All ==========
document.getElementById('clearAllBtn')?.addEventListener('click', () => {
  if (confirm('确定清空所有图片吗？')) {
    images = [];
    fileInput.value = '';
    hidePanels();
  }
});

// ========== Global Quality Slider ==========
qualitySlider?.addEventListener('input', (e) => {
  globalQuality = parseInt(e.target.value);
  qualityValue.textContent = globalQuality;
  images.forEach(img => {
    if (img.status === 'pending') img.quality = globalQuality;
  });
  renderImageList();
});

// ========== Show/Hide Panels ==========
function showPanels() {
  uploadZone.classList.add('hidden');
  settingsPanel.classList.remove('hidden');
  imageList.classList.remove('hidden');
  batchActions.classList.remove('hidden');
}

function hidePanels() {
  uploadZone.classList.remove('hidden');
  settingsPanel.classList.add('hidden');
  imageList.classList.add('hidden');
  batchActions.classList.add('hidden');
  compressSummary.classList.add('hidden');
}

// ========== Update Summary ==========
function updateSummary() {
  const done = images.filter(i => i.status === 'done' && i.compressedSize);
  if (done.length === 0) {
    compressSummary.classList.add('hidden');
    return;
  }

  const totalOriginal = done.reduce((sum, i) => sum + i.originalSize, 0);
  const totalCompressed = done.reduce((sum, i) => sum + i.compressedSize, 0);
  const totalSaved = totalOriginal - totalCompressed;
  const savedPercent = ((totalSaved / totalOriginal) * 100).toFixed(1);

  compressSummary.innerHTML = `
    <h3>🎉 压缩完成！</h3>
    <p>总计压缩了 <strong>${done.length}</strong> 张图片</p>
    <p>原始总大小：<strong>${(totalOriginal / 1024 / 1024).toFixed(2)} MB</strong> → 
       压缩后：<strong>${(totalCompressed / 1024 / 1024).toFixed(2)} MB</strong></p>
    <p class="saved-highlight">共节省：<strong>${(totalSaved / 1024 / 1024).toFixed(2)} MB</strong>（${savedPercent}%）</p>
  `;
  compressSummary.classList.remove('hidden');
}

