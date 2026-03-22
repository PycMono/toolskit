/* ========================================
   Image Compress Tool - Full Implementation
   ======================================== */

console.log('📸 Image Compress Tool loaded');

// Global state
const state = {
  files: [], // Array of { id, file, original, compressed, blob }
  quality: 0.8,
  format: 'auto',
  maxWidth: null
};

let fileIdCounter = 0;

// DOM elements
let uploadZone, fileInput, selectFilesBtn;
let optionsPanel, qualitySlider, qualityValue, outputFormat, maxWidth;
let resultsSection, resultsList;
let downloadAllBtn;

document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ Image Compress Tool initialized');
  
  // Check libraries
  if (typeof imageCompression === 'undefined') {
    console.error('❌ browser-image-compression not loaded');
    return;
  }
  if (typeof JSZip === 'undefined') {
    console.error('❌ JSZip not loaded');
    return;
  }
  if (typeof saveAs === 'undefined') {
    console.error('❌ FileSaver not loaded');
    return;
  }
  
  initializeElements();
  setupEventListeners();
});

function initializeElements() {
  uploadZone = document.getElementById('uploadZone');
  fileInput = document.getElementById('fileInput');
  selectFilesBtn = document.getElementById('selectFilesBtn');
  
  optionsPanel = document.getElementById('optionsPanel');
  qualitySlider = document.getElementById('qualitySlider');
  qualityValue = document.getElementById('qualityValue');
  outputFormat = document.getElementById('outputFormat');
  maxWidth = document.getElementById('maxWidth');
  
  resultsSection = document.getElementById('resultsSection');
  resultsList = document.getElementById('resultsList');
  downloadAllBtn = document.getElementById('downloadAllBtn');
}

function setupEventListeners() {
  // File selection button - Bug 1 修复：移除 preventDefault，允许默认点击行为
  selectFilesBtn?.addEventListener('click', (e) => {
    console.log('📂 Select Files button clicked');
    e.stopPropagation(); // 只阻止事件冒泡，不阻止默认行为
    if (fileInput) {
      console.log('✅ Triggering file input click');
      fileInput.click();
    } else {
      console.error('❌ fileInput element not found');
    }
  });
  
  // Bug 2 修复：添加日志确认 change 事件被触发
  fileInput?.addEventListener('change', handleFileSelect);
  
  // Drag and drop on upload zone
  uploadZone?.addEventListener('click', (e) => {
    // Don't trigger if clicking the button itself
    if (e.target === selectFilesBtn || selectFilesBtn?.contains(e.target)) {
      return;
    }
    console.log('📦 Upload zone clicked');
    e.stopPropagation(); // 只阻止冒泡，不阻止默认行为
    if (fileInput) {
      fileInput.click();
    }
  });
  
  uploadZone?.addEventListener('dragover', handleDragOver);
  uploadZone?.addEventListener('dragleave', handleDragLeave);
  uploadZone?.addEventListener('drop', handleDrop);
  
  // Options
  qualitySlider?.addEventListener('input', (e) => {
    state.quality = e.target.value / 100;
    if (qualityValue) qualityValue.textContent = e.target.value + '%';
  });
  
  outputFormat?.addEventListener('change', (e) => {
    state.format = e.target.value;
  });
  
  maxWidth?.addEventListener('change', (e) => {
    const val = parseInt(e.target.value);
    state.maxWidth = val > 0 ? val : null;
  });
}

function handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  uploadZone?.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  uploadZone?.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  uploadZone?.classList.remove('drag-over');
  
  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
  if (files.length > 0) {
    processFiles(files);
  }
}

function handleFileSelect(e) {
  // Bug 2 修复：添加日志确认函数被调用
  console.log('📁 handleFileSelect called');
  const files = Array.from(e.target.files);
  console.log(`📊 Files selected: ${files.length}`);
  
  if (files.length > 0) {
    processFiles(files);
  } else {
    console.warn('⚠️ No files selected');
  }
  
  // Bug 2 修复：重置 input 的 value，确保下次选择同一文件也能触发
  e.target.value = '';
  console.log('✅ Input value reset');
}

async function processFiles(files) {
  console.log(`🔄 Processing ${files.length} file(s)`);
  
  // Limit to 20 files
  const limited = files.slice(0, 20);
  
  if (files.length > 20) {
    console.warn(`⚠️ Limited to 20 files (selected ${files.length})`);
    alert(`Maximum 20 files at once. Processing first 20 files.`);
  }
  
  // Bug 2 修复：改为 for...of 循环，确保异步顺序处理
  for (const file of limited) {
    // Validate file type - accept all image types
    if (!file.type.startsWith('image/')) {
      console.warn(`⚠️ Skipping non-image file: ${file.name} (${file.type})`);
      continue;
    }
    
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.error(`❌ File too large: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB > 10MB)`);
      alert(`File too large: ${file.name} (max 10MB)`);
      continue;
    }
    
    console.log(`✅ Adding file: ${file.name} (${(file.size / 1024).toFixed(2)}KB)`);
    
    const fileObj = {
      id: fileIdCounter++,
      file: file,
      original: {
        name: file.name,
        size: file.size,
        type: file.type
      },
      compressed: null,
      blob: null,
      status: 'pending'
    };
    
    state.files.push(fileObj);
    addFileToUI(fileObj);
    
    // Bug 2 修复：立即开始压缩，await 确保按顺序完成
    await compressFile(fileObj);
  }
  
  // Show options and results
  if (optionsPanel) optionsPanel.style.display = 'block';
  if (resultsSection) resultsSection.style.display = 'block';
  
  console.log(`✅ All ${limited.length} file(s) processed`);
}

function addFileToUI(fileObj) {
  const item = document.createElement('div');
  item.className = 'ic-result-item';
  item.id = `file-${fileObj.id}`;
  
  // Thumbnail
  const thumb = document.createElement('img');
  thumb.className = 'ic-result-thumb';
  thumb.alt = fileObj.original.name;
  const reader = new FileReader();
  reader.onload = (e) => thumb.src = e.target.result;
  reader.readAsDataURL(fileObj.file);
  
  // Info
  const info = document.createElement('div');
  info.className = 'ic-result-info';
  info.innerHTML = `
    <div class="ic-result-name">${escapeHtml(fileObj.original.name)}</div>
    <div class="ic-result-size">${formatFileSize(fileObj.original.size)}</div>
    <div class="ic-result-status" id="status-${fileObj.id}">⏳ Compressing...</div>
  `;
  
  // Actions
  const actions = document.createElement('div');
  actions.className = 'ic-result-actions';
  actions.innerHTML = `
    <button class="ic-btn-download" id="download-${fileObj.id}" disabled>⬇ Download</button>
    <button class="ic-btn-remove" onclick="removeFile(${fileObj.id})">🗑 Remove</button>
  `;
  
  item.appendChild(thumb);
  item.appendChild(info);
  item.appendChild(actions);
  
  resultsList?.appendChild(item);
}

async function compressFile(fileObj) {
  try {
    fileObj.status = 'compressing';
    updateFileStatus(fileObj.id, '⏳ Compressing...');
    
    // Compression options
    const options = {
      maxSizeMB: 10,
      useWebWorker: true,
      initialQuality: state.quality
    };
    
    if (state.maxWidth) {
      options.maxWidthOrHeight = state.maxWidth;
    }
    
    // Compress
    let compressedFile = await imageCompression(fileObj.file, options);
    
    // Handle format conversion
    if (state.format !== 'auto') {
      const targetMime = getMimeType(state.format);
      compressedFile = await convertFormat(compressedFile, targetMime);
    }
    
    fileObj.compressed = {
      name: getOutputFilename(fileObj.original.name, state.format),
      size: compressedFile.size,
      type: compressedFile.type
    };
    fileObj.blob = compressedFile;
    fileObj.status = 'done';
    
    // Update UI
    updateFileUI(fileObj);
    
  } catch (error) {
    console.error(`Compression failed for ${fileObj.original.name}:`, error);
    fileObj.status = 'error';
    updateFileStatus(fileObj.id, '❌ Failed');
  }
}

function updateFileUI(fileObj) {
  const statusEl = document.getElementById(`status-${fileObj.id}`);
  const downloadBtn = document.getElementById(`download-${fileObj.id}`);
  const infoEl = document.querySelector(`#file-${fileObj.id} .ic-result-info`);
  
  const savings = ((1 - fileObj.compressed.size / fileObj.original.size) * 100).toFixed(0);
  
  if (infoEl) {
    infoEl.innerHTML = `
      <div class="ic-result-name">${escapeHtml(fileObj.compressed.name)}</div>
      <div class="ic-result-size">
        ${formatFileSize(fileObj.original.size)} → ${formatFileSize(fileObj.compressed.size)}
        <span class="ic-result-savings">-${savings}%</span>
      </div>
      <div class="ic-result-status">✅ Ready to download</div>
    `;
  }
  
  if (downloadBtn) {
    downloadBtn.disabled = false;
    downloadBtn.onclick = () => downloadFile(fileObj.id);
  }
}

function updateFileStatus(id, text) {
  const el = document.getElementById(`status-${id}`);
  if (el) el.textContent = text;
}

function downloadFile(id) {
  const fileObj = state.files.find(f => f.id === id);
  if (!fileObj || !fileObj.blob) return;
  
  saveAs(fileObj.blob, fileObj.compressed.name);
}

window.removeFile = function(id) {
  const index = state.files.findIndex(f => f.id === id);
  if (index === -1) return;
  
  state.files.splice(index, 1);
  
  const el = document.getElementById(`file-${id}`);
  if (el) el.remove();
  
  if (state.files.length === 0) {
    if (optionsPanel) optionsPanel.style.display = 'none';
    if (resultsSection) resultsSection.style.display = 'none';
  }
};

window.downloadAll = async function() {
  const readyFiles = state.files.filter(f => f.status === 'done' && f.blob);
  
  if (readyFiles.length === 0) {
    alert('No files ready to download');
    return;
  }
  
  if (readyFiles.length === 1) {
    downloadFile(readyFiles[0].id);
    return;
  }
  
  // Create ZIP
  const zip = new JSZip();
  readyFiles.forEach(fileObj => {
    zip.file(fileObj.compressed.name, fileObj.blob);
  });
  
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, 'compressed-images.zip');
};

window.clearAll = function() {
  if (!confirm('Clear all images?')) return;
  
  state.files = [];
  if (resultsList) resultsList.innerHTML = '';
  if (optionsPanel) optionsPanel.style.display = 'none';
  if (resultsSection) resultsSection.style.display = 'none';
};

// Helper functions
function getMimeType(format) {
  const types = {
    'jpg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp'
  };
  return types[format] || 'image/jpeg';
}

function getOutputFilename(originalName, format) {
  if (format === 'auto') return originalName;
  
  const baseName = originalName.replace(/\.[^.]+$/, '');
  const ext = format === 'jpg' ? 'jpg' : format;
  return `${baseName}.${ext}`;
}

async function convertFormat(file, targetMime) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(resolve, targetMime, state.quality);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
