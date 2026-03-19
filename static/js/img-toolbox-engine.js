/**
 * img-toolbox-engine.js
 * 图片处理工具箱 — 公共处理引擎
 * 适用于：crop / to-jpg / jpg-to / photo-editor / remove-bg / watermark / rotate
 */

/* ═══════════════════════════════════════════════════════════
   全局常量
═══════════════════════════════════════════════════════════ */
const ITB_MAX_FILES     = 30;
const ITB_MAX_SIZE_MB   = 20;
const ITB_CONCURRENT    = 3;
const ITB_ALLOWED_TYPES = ['image/jpeg','image/png','image/webp','image/gif','image/bmp','image/svg+xml'];

/* ═══════════════════════════════════════════════════════════
   全局状态
═══════════════════════════════════════════════════════════ */
const ITB_STATE = {
  files:      [],       // Array<FileEntry>
  processing: false,
  objectURLs: [],       // 统一管理，clearAll 时批量释放
  _progressTimers: {},
};

/* ═══════════════════════════════════════════════════════════
   FileEntry 工厂
═══════════════════════════════════════════════════════════ */
function itbCreateEntry(file) {
  const id  = crypto.randomUUID ? crypto.randomUUID() : (Date.now() + Math.random()).toString(36);
  const url = URL.createObjectURL(file);
  ITB_STATE.objectURLs.push(url);
  const nameParts = file.name.split('.');
  const ext = nameParts.length > 1 ? nameParts.pop().toLowerCase() : 'jpg';
  return { id, file, name: file.name, ext, size: file.size, status: 'waiting', originalURL: url, outputURL: '', outputSize: 0, outputName: '', error: '' };
}

/* ═══════════════════════════════════════════════════════════
   addFiles — 文件入队
═══════════════════════════════════════════════════════════ */
function itbAddFiles(fileList) {
  const files = Array.from(fileList);
  let added = 0;
  for (const file of files) {
    if (!ITB_ALLOWED_TYPES.includes(file.type) && !file.type.startsWith('image/')) {
      itbToast(file.name + ': ' + itbI18n('error.common.format_not_supported'), 'error');
      continue;
    }
    if (file.size > ITB_MAX_SIZE_MB * 1024 * 1024) {
      itbToast(file.name + ': ' + itbI18n('error.common.file_too_large'), 'error');
      continue;
    }
    if (ITB_STATE.files.length >= ITB_MAX_FILES) {
      itbToast(itbI18n('error.common.too_many_files'), 'warning');
      break;
    }
    const isDup = ITB_STATE.files.some(f => f.name === file.name && f.size === file.size);
    if (isDup) continue;
    const entry = itbCreateEntry(file);
    ITB_STATE.files.push(entry);
    itbUpsertCard(entry);
    added++;
  }
  if (added > 0) {
    itbSetProcessBtn(true);
    itbUpdateUploadZonePreview();
    const totalMB = ITB_STATE.files.reduce((s,f) => s + f.size, 0) / 1048576;
    if (typeof gaTrackUpload === 'function') gaTrackUpload(ITB_TOOL, added, totalMB);
  }
  const optPanel = document.getElementById('itbOptionsPanel');
  if (optPanel) optPanel.hidden = false;
  const resSection = document.getElementById('itbResultsSection');
  if (resSection) resSection.hidden = false;
}

/* ═══════════════════════════════════════════════════════════
   Upload Zone Preview — 回显已上传图片，提供重新上传按钮
═══════════════════════════════════════════════════════════ */
function itbUpdateUploadZonePreview() {
  const zone = document.getElementById('itbUploadZone');
  const idle = document.getElementById('itbUploadIdle');
  if (!zone || !idle || !ITB_STATE.files.length) return;
  const oldPrev = zone.querySelector('.itb-upload-preview');
  if (oldPrev) oldPrev.remove();
  const files = ITB_STATE.files;
  const previewWrap = document.createElement('div');
  previewWrap.className = 'itb-upload-preview';
  const thumbsHtml = files.slice(0, 4).map(f =>
    `<img src="${f.originalURL}" class="itb-upload-preview__thumb" alt="${itbEsc(f.name)}">`
  ).join('');
  const moreCount = files.length > 4 ? `<span class="itb-upload-preview__more">+${files.length - 4}</span>` : '';
  const lang = window.ITB_LANG || 'en';
  previewWrap.innerHTML = `
    <div class="itb-upload-preview__thumbs">${thumbsHtml}${moreCount}</div>
    <p class="itb-upload-preview__info">${files.length} ${lang === 'zh' ? '张图片已上传' : 'image(s) uploaded'}</p>
    <label class="itb-upload-preview__reupload" onclick="event.stopPropagation()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
      ${lang === 'zh' ? '重新上传' : 'Re-upload'}
      <input type="file" multiple accept="image/*" style="display:none" onchange="itbReplaceFiles(this.files)">
    </label>
  `;
  zone.appendChild(previewWrap);
  idle.hidden = true;
}

function itbReplaceFiles(fileList) {
  for (const url of ITB_STATE.objectURLs) { try { URL.revokeObjectURL(url); } catch(e){} }
  ITB_STATE.objectURLs = [];
  ITB_STATE.files = [];
  ITB_STATE.processing = false;
  Object.values(ITB_STATE._progressTimers).forEach(clearInterval);
  ITB_STATE._progressTimers = {};
  const list = document.getElementById('itbResultsList');
  if (list) list.innerHTML = '';
  const zone = document.getElementById('itbUploadZone');
  if (zone) {
    const oldPrev = zone.querySelector('.itb-upload-preview');
    if (oldPrev) oldPrev.remove();
    const idle = document.getElementById('itbUploadIdle');
    if (idle) idle.hidden = false;
  }
  if (window._itbOnClearAll) window._itbOnClearAll();
  itbAddFiles(fileList);
}

/* ═══════════════════════════════════════════════════════════
   startProcess — 处理调度入口
═══════════════════════════════════════════════════════════ */
async function itbStartProcess() {
  if (ITB_STATE.processing) return;
  // Reset all files to 'waiting' so re-processing always works
  for (const f of ITB_STATE.files) {
    if (f.outputURL) {
      try { URL.revokeObjectURL(f.outputURL); } catch(e) {}
      f.outputURL = '';
    }
    f.status = 'waiting';
    f.error  = '';
    itbUpsertCard(f);
  }
  ITB_STATE.processing = true;
  itbSetProcessBtn(false);
  const opts = itbCollectOptions();
  const pending = ITB_STATE.files.slice();
  const t0 = Date.now();
  await itbRunConcurrent(pending, opts, ITB_CONCURRENT);
  ITB_STATE.processing = false;
  itbSetProcessBtn(true);
  itbUpdateSummary();
  const done = ITB_STATE.files.filter(f => f.status === 'done');
  if (typeof gaTrackProcessDone === 'function') gaTrackProcessDone(ITB_TOOL, done.length, Date.now() - t0);
}

/* ═══════════════════════════════════════════════════════════
   runConcurrent — 滑动窗口并发调度
═══════════════════════════════════════════════════════════ */
async function itbRunConcurrent(queue, opts, limit) {
  const iter = queue[Symbol.iterator]();
  const workers = Array.from({ length: limit }, () =>
    (async () => {
      for (const entry of iter) await itbProcessOne(entry, opts);
    })()
  );
  await Promise.all(workers);
}

/* ═══════════════════════════════════════════════════════════
   processOne — 单文件处理分发
═══════════════════════════════════════════════════════════ */
async function itbProcessOne(entry, opts) {
  entry.status = 'processing';
  itbUpsertCard(entry);
  itbStartFakeProgress(entry.id);
  try {
    let outputBlob;
    switch (ITB_TOOL) {
      case 'crop':         outputBlob = await itbProcessCrop(entry, opts);     break;
      case 'to-jpg':       outputBlob = await itbProcessToJpg(entry, opts);    break;
      case 'jpg-to':       outputBlob = await itbProcessJpgTo(entry, opts);    break;
      case 'photo-editor': outputBlob = await itbProcessEditor(entry, opts);   break;
      case 'remove-bg':    outputBlob = await itbProcessRemoveBg(entry, opts); break;
      case 'watermark':    outputBlob = await itbProcessWatermark(entry, opts);break;
      case 'rotate':       outputBlob = await itbProcessRotate(entry, opts);   break;
      default: throw new Error('Unknown tool: ' + ITB_TOOL);
    }
    const url = URL.createObjectURL(outputBlob);
    ITB_STATE.objectURLs.push(url);
    entry.status     = 'done';
    entry.outputURL  = url;
    entry.outputSize = outputBlob.size;
    entry.outputName = itbBuildOutputName(entry, opts, outputBlob.type);
    itbStopFakeProgress(entry.id, 100);
  } catch (err) {
    entry.status = 'error';
    entry.error  = err.message || itbI18n('error.common.process_failed');
    itbStopFakeProgress(entry.id, 0);
    if (typeof gaTrackError === 'function') gaTrackError(ITB_TOOL, 'process_failed', entry.name);
  }
  itbUpsertCard(entry);
}

/* ───────────────────── CROP ──────────────────────────────── */
async function itbProcessCrop(entry, opts) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = reject;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let x = 0, y = 0, w = img.naturalWidth, h = img.naturalHeight;
      if (opts.cropMode === 'custom' && opts.cropWidth > 0 && opts.cropHeight > 0) {
        w = Math.min(opts.cropWidth,  img.naturalWidth);
        h = Math.min(opts.cropHeight, img.naturalHeight);
        x = (img.naturalWidth  - w) / 2;
        y = (img.naturalHeight - h) / 2;
      } else if (opts.cropMode === 'ratio' && opts.cropRatio) {
        const [rw, rh] = opts.cropRatio.split('/').map(Number);
        const scale = Math.min(img.naturalWidth / rw, img.naturalHeight / rh);
        w = rw * scale; h = rh * scale;
        x = (img.naturalWidth  - w) / 2;
        y = (img.naturalHeight - h) / 2;
      } else if (opts.cropMode === 'free' && window._itbCropperInstance) {
        const d = window._itbCropperInstance.getData(true);
        x = d.x; y = d.y; w = d.width; h = d.height;
      }
      canvas.width = Math.max(1, Math.round(w));
      canvas.height = Math.max(1, Math.round(h));
      canvas.getContext('2d').drawImage(img, x, y, w, h, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), entry.file.type || 'image/jpeg', 0.95);
    };
    img.src = entry.originalURL;
  });
}

/* ───────────────────── TO JPG ───────────────────────────── */
async function itbProcessToJpg(entry, opts) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = reject;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/jpeg', (opts.quality || 92) / 100);
    };
    img.src = entry.originalURL;
  });
}

/* ───────────────────── JPG TO ───────────────────────────── */
async function itbProcessJpgTo(entry, opts) {
  const mimeMap = { png:'image/png', webp:'image/webp', gif:'image/gif', bmp:'image/bmp' };
  const mime = mimeMap[opts.targetFormat] || 'image/png';
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = reject;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext('2d').drawImage(img, 0, 0);
      canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), mime);
    };
    img.src = entry.originalURL;
  });
}

/* ───────────────────── PHOTO EDITOR ──────────────────────── */
async function itbProcessEditor(entry, opts) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = reject;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.filter = [
        `brightness(${opts.brightness || 100}%)`,
        `contrast(${opts.contrast   || 100}%)`,
        `saturate(${opts.saturation || 100}%)`,
        `blur(${opts.blur || 0}px)`,
      ].join(' ');
      ctx.drawImage(img, 0, 0);
      ctx.filter = 'none';
      if (opts.sharpness > 0) itbApplySharpness(ctx, canvas.width, canvas.height, opts.sharpness);
      canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), entry.file.type || 'image/jpeg', 0.95);
    };
    img.src = entry.originalURL;
  });
}

function itbApplySharpness(ctx, w, h, strength) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;
  const k = strength / 25;
  const kernel = [0, -k, 0, -k, 1 + 4 * k, -k, 0, -k, 0];
  const tmp = new Uint8ClampedArray(d);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) {
        d[i+c] = Math.min(255, Math.max(0,
          kernel[0]*tmp[((y-1)*w+(x-1))*4+c] + kernel[1]*tmp[((y-1)*w+x)*4+c] + kernel[2]*tmp[((y-1)*w+(x+1))*4+c] +
          kernel[3]*tmp[(y*w+(x-1))*4+c]     + kernel[4]*tmp[(y*w+x)*4+c]     + kernel[5]*tmp[(y*w+(x+1))*4+c] +
          kernel[6]*tmp[((y+1)*w+(x-1))*4+c] + kernel[7]*tmp[((y+1)*w+x)*4+c] + kernel[8]*tmp[((y+1)*w+(x+1))*4+c]
        ));
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

/* ───────────────────── REMOVE BG ────────────────────────── */
let _itbBgRemoverReady = false;
let _itbBgRemoverLoading = false;

const ITB_BG_CDNS = [
  'https://unpkg.com/@imgly/background-removal@1.4.5/dist/browser/index.js',
  'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.4.5/dist/browser/index.js',
];
function _itbBgPublicPath(cdn) {
  return cdn.replace(/index\.js$/, '');
}

async function itbInitBgRemover() {
  if (_itbBgRemoverReady) return;
  if (_itbBgRemoverLoading) {
    await new Promise(r => { const t = setInterval(() => { if (_itbBgRemoverReady || !_itbBgRemoverLoading) { clearInterval(t); r(); } }, 200); });
    if (!_itbBgRemoverReady) throw new Error(itbI18n('error.remove_bg.model_load_failed'));
    return;
  }
  _itbBgRemoverLoading = true;
  const toastEl = itbToast(itbI18n('status.remove_bg.loading_model'), 'info', 0);
  let lastErr;
  for (const cdn of ITB_BG_CDNS) {
    try {
      const cfg = { publicPath: _itbBgPublicPath(cdn) };
      const mod = await import(cdn);
      await mod.preload(cfg);
      _itbBgRemoverReady = true;
      window._itbBgModule = mod;
      window._itbBgCfg   = cfg;
      lastErr = null;
      break;
    } catch (e) {
      lastErr = e;
    }
  }
  itbRemoveToast(toastEl);
  _itbBgRemoverLoading = false;
  if (!_itbBgRemoverReady) {
    throw new Error((itbI18n('error.remove_bg.model_load_failed') || 'AI model load failed') + ': ' + (lastErr ? lastErr.message : ''));
  }
}

async function itbProcessRemoveBg(entry) {
  await itbInitBgRemover();
  const outputBlob = await window._itbBgModule.removeBackground(entry.file, window._itbBgCfg);
  return outputBlob;
}

/* ───────────────────── WATERMARK ────────────────────────── */
async function itbProcessWatermark(entry, opts) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = reject;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      ctx.globalAlpha = (opts.wmOpacity || 70) / 100;
      if (opts.wmType === 'image' && opts.wmImgURL) {
        const wi = new Image();
        wi.onload = () => {
          const ww = Math.min(canvas.width * 0.3, wi.naturalWidth);
          const wh = ww / wi.naturalWidth * wi.naturalHeight;
          const [px, py] = itbWmPos(canvas.width, canvas.height, opts.wmPosition || 'br', ww, wh);
          ctx.drawImage(wi, px, py, ww, wh);
          canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), entry.file.type || 'image/jpeg', 0.95);
        };
        wi.onerror = reject;
        wi.src = opts.wmImgURL;
      } else {
        const fs = opts.wmFontSize || 32;
        ctx.font = `bold ${fs}px Arial, sans-serif`;
        ctx.fillStyle = opts.wmColor || '#ffffff';
        const text = opts.wmText || 'Watermark';
        const tw = ctx.measureText(text).width;
        const [px, py] = itbWmPos(canvas.width, canvas.height, opts.wmPosition || 'br', tw, fs);
        ctx.fillText(text, px, py);
        canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), entry.file.type || 'image/jpeg', 0.95);
      }
    };
    img.src = entry.originalURL;
  });
}

function itbWmPos(cw, ch, pos, ww, wh) {
  const pad = 20;
  const map = {
    'tl':[(pad),(pad+wh)],       'tc':[(cw-ww)/2,(pad+wh)],        'tr':[(cw-ww-pad),(pad+wh)],
    'ml':[(pad),(ch+wh)/2],      'mc':[(cw-ww)/2,(ch+wh)/2],       'mr':[(cw-ww-pad),(ch+wh)/2],
    'bl':[(pad),(ch-pad)],       'bc':[(cw-ww)/2,(ch-pad)],         'br':[(cw-ww-pad),(ch-pad)],
  };
  return map[pos] || map['br'];
}

/* ───────────────────── ROTATE ───────────────────────────── */
async function itbProcessRotate(entry, opts) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = reject;
    img.onload = () => {
      const angle = opts.rotateAngle || 0;
      const rad = angle * Math.PI / 180;
      const sin = Math.abs(Math.sin(rad)), cos = Math.abs(Math.cos(rad));
      const outW = Math.ceil(img.naturalWidth * cos + img.naturalHeight * sin);
      const outH = Math.ceil(img.naturalWidth * sin + img.naturalHeight * cos);
      const canvas = document.createElement('canvas');
      canvas.width  = outW;
      canvas.height = outH;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, outW, outH);
      ctx.translate(outW / 2, outH / 2);
      ctx.rotate(rad);
      if (opts.flipH) ctx.scale(-1, 1);
      if (opts.flipV) ctx.scale(1, -1);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), entry.file.type || 'image/jpeg', 0.95);
    };
    img.src = entry.originalURL;
  });
}

/* ═══════════════════════════════════════════════════════════
   Card UI
═══════════════════════════════════════════════════════════ */
function itbUpsertCard(entry) {
  const list = document.getElementById('itbResultsList');
  if (!list) return;
  let card = document.getElementById('itbCard-' + entry.id);
  if (!card) {
    card = document.createElement('div');
    card.id = 'itbCard-' + entry.id;
    card.className = 'itb-card';
    card.setAttribute('role', 'listitem');
    card.style.opacity = '0';
    card.style.transform = 'translateY(12px)';
    list.appendChild(card);
    requestAnimationFrame(() => {
      card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    });
  }
  card.dataset.status = entry.status;
  card.innerHTML = itbBuildCardHTML(entry);
}

function itbBuildCardHTML(entry) {
  const saved = entry.outputSize > 0 ? Math.round((1 - entry.outputSize / entry.size) * 100) : 0;
  const savedCls = saved >= 50 ? 'green' : saved >= 20 ? 'orange' : saved < 0 ? 'red' : 'gray';
  return `
    <div class="itb-card__bar"></div>
    <div class="itb-card__thumb">
      <img src="${entry.originalURL}" alt="${itbEsc(entry.name)}" loading="lazy"
           onclick="itbOpenPreview('${entry.id}')" title="Before / After">
      ${(entry.outputName && entry.outputName.split('.').pop().toLowerCase() !== entry.ext)
        ? `<span class="itb-card__fmt-badge">${entry.outputName.split('.').pop().toUpperCase()}</span>` : ''}
    </div>
    <div class="itb-card__info">
      <p class="itb-card__name" title="${itbEsc(entry.name)}">${itbEsc(entry.name)}</p>
      ${entry.status === 'waiting' ? `<p class="itb-card__status-text">${itbI18n('status.common.waiting')}</p>` : ''}
      ${entry.status === 'processing' ? `
        <div class="itb-card__progress">
          <div class="itb-progress-bar"><div class="itb-progress-fill" id="itbPFill-${entry.id}" style="width:0%"></div></div>
          <span class="itb-progress-pct" id="itbPPct-${entry.id}">0%</span>
        </div>` : ''}
      ${entry.status === 'done' ? `
        <div class="itb-card__size-info">
          <span class="itb-size-orig">${itbFmtSize(entry.size)}</span>
          <span class="itb-size-arrow">→</span>
          <span class="itb-size-out">${itbFmtSize(entry.outputSize)}</span>
          <span class="itb-saved-badge itb-saved-badge--${savedCls}">${saved >= 0 ? '-' : '+'}${Math.abs(saved)}%</span>
        </div>` : ''}
      ${entry.status === 'error' ? `<p class="itb-card__error-text">${itbEsc(entry.error)}</p>` : ''}
    </div>
    <div class="itb-card__actions">
      ${entry.status === 'done' ? `
        <button class="itb-btn-icon itb-btn-icon--dl" onclick="itbDownloadOne('${entry.id}')" title="${itbI18n('result.common.download_btn')}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </button>
        <button class="itb-btn-icon" onclick="itbOpenPreview('${entry.id}')" title="${itbI18n('result.common.preview_btn')}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>` : ''}
      ${entry.status === 'error' ? `
        <button class="itb-btn-icon itb-btn-icon--retry" onclick="itbRetryOne('${entry.id}')" title="${itbI18n('result.common.retry_btn')}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
        </button>` : ''}
      <button class="itb-btn-icon itb-btn-icon--rm" onclick="itbRemoveCard('${entry.id}')" title="${itbI18n('result.common.remove_btn')}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>`;
}

/* ═══════════════════════════════════════════════════════════
   Fake Progress
═══════════════════════════════════════════════════════════ */
function itbStartFakeProgress(id) {
  let pct = 0;
  const timer = setInterval(() => {
    if (pct >= 85) { clearInterval(timer); return; }
    pct = Math.min(85, pct + Math.random() * 8 + 2);
    const fill  = document.getElementById('itbPFill-' + id);
    const label = document.getElementById('itbPPct-' + id);
    if (fill) || fill.style.width = Math.round(pct) + '%';
    if (label) label.textContent = Math.round(pct) + '%';
  }, 200);
  ITB_STATE._progressTimers[id] = timer;
}

function itbStopFakeProgress(id, final) {
  const timer = ITB_STATE._progressTimers[id];
  if (timer) { clearInterval(timer); delete ITB_STATE._progressTimers[id]; }
  const fill  = document.getElementById('itbPFill-' + id);
  const label = document.getElementById('itbPPct-' + id);
  if (fill) || fill.style.width = final + '%';
  if (label) label.textContent = final + '%';
}

/* ═══════════════════════════════════════════════════════════
   Download
═══════════════════════════════════════════════════════════ */
function itbDownloadOne(id) {
  const entry = ITB_STATE.files.find(f => f.id === id);
  if (!entry || !entry.outputURL) return;
  const a = document.createElement('a');
  a.href = entry.outputURL;
  a.download = entry.outputName || entry.name;
  a.click();
  if (typeof gaTrackDownload === 'function') gaTrackDownload(ITB_TOOL, entry.file.type || 'image/jpeg');
}

async function itbDownloadAll() {
  const done = ITB_STATE.files.filter(f => f.status === 'done');
  if (!done.length) return;
  const toastEl = itbToast(itbI18n('download.common.preparing'), 'info', 0);
  const zip = new JSZip();
  for (const entry of done) {
    const resp = await fetch(entry.outputURL);
    zip.file(entry.outputName || entry.name, await resp.blob());
  }
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, 'img-toolbox-' + Date.now() + '.zip');
  itbRemoveToast(toastEl);
  if (typeof gaTrackDownloadAll === 'function') gaTrackDownloadAll(ITB_TOOL, done.length);
}

/* ═══════════════════════════════════════════════════════════
   Retry / Remove / Clear
═══════════════════════════════════════════════════════════ */
function itbRetryOne(id) {
  const entry = ITB_STATE.files.find(f => f.id === id);
  if (!entry) return;
  entry.status = 'waiting'; entry.error = '';
  itbUpsertCard(entry);
  itbSetProcessBtn(true);
}

function itbRemoveCard(id) {
  const card = document.getElementById('itbCard-' + id);
  if (!card) return;
  card.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
  card.style.opacity = '0';
  card.style.transform = 'translateX(60px)';
  card.addEventListener('transitionend', () => {
    card.remove();
    ITB_STATE.files = ITB_STATE.files.filter(f => f.id !== id);
    itbUpdateSummary();
    if (!ITB_STATE.files.length) {
      const rs = document.getElementById('itbResultsSection');
      if (rs) rs.hidden = true;
      const op = document.getElementById('itbOptionsPanel');
      if (op) op.hidden = true;
    }
  }, { once: true });
}

function itbClearAll() {
  for (const url of ITB_STATE.objectURLs) { try { URL.revokeObjectURL(url); } catch(e){} }
  ITB_STATE.objectURLs = [];
  ITB_STATE.files = [];
  ITB_STATE.processing = false;
  Object.values(ITB_STATE._progressTimers).forEach(clearInterval);
  ITB_STATE._progressTimers = {};
  const list = document.getElementById('itbResultsList');
  if (list) list.innerHTML = '';
  const rs = document.getElementById('itbResultsSection');
  if (rs) rs.hidden = true;
  const op = document.getElementById('itbOptionsPanel');
  if (op) op.hidden = true;
  // Reset upload zone preview
  const zone = document.getElementById('itbUploadZone');
  if (zone) {
    const oldPrev = zone.querySelector('.itb-upload-preview');
    if (oldPrev) oldPrev.remove();
    const idle = document.getElementById('itbUploadIdle');
    if (idle) idle.hidden = false;
  }
  if (window._itbOnClearAll) window._itbOnClearAll();
  itbSetProcessBtn(false);
  itbUpdateSummary();
}

/* ═══════════════════════════════════════════════════════════
   Before/After Preview Modal
═══════════════════════════════════════════════════════════ */
function itbOpenPreview(id) {
  const entry = ITB_STATE.files.find(f => f.id === id);
  if (!entry || entry.status !== 'done') return;
  const modal  = document.getElementById('itbPreviewModal');
  if (!modal) return;
  document.getElementById('itbBeforeImg').src = entry.originalURL;
  document.getElementById('itbAfterImg').src  = entry.outputURL;
  document.getElementById('itbBeforeLbl').textContent = (window.ITB_LANG === 'zh' ? '原图 ' : 'Original ') + itbFmtSize(entry.size);
  document.getElementById('itbAfterLbl').textContent  = (window.ITB_LANG === 'zh' ? '处理后 ' : 'Result ') + itbFmtSize(entry.outputSize);
  document.getElementById('itbModalDlBtn').onclick = () => itbDownloadOne(entry.id);
  const bw = document.getElementById('itbBeforeWrap');
  const dv = document.getElementById('itbDivider');
  bw.style.width = '50%';
  dv.style.left  = '50%';
  modal.hidden = false;
  itbBindCompare();
}

function itbBindCompare() {
  const area = document.getElementById('itbCompareArea');
  const dv   = document.getElementById('itbDivider');
  const bw   = document.getElementById('itbBeforeWrap');
  let dragging = false;
  function onMove(cx) {
    const rect = area.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (cx - rect.left) / rect.width));
    bw.style.width = (pct * 100) + '%';
    dv.style.left  = (pct * 100) + '%';
  }
  dv.onmousedown = (e) => { dragging = true; e.preventDefault(); };
  document._itbMouseMove = (e) => { if (dragging) onMove(e.clientX); };
  document._itbMouseUp   = ()  => { dragging = false; };
  document.addEventListener('mousemove', document._itbMouseMove);
  document.addEventListener('mouseup',   document._itbMouseUp);
  area.onclick = (e) => { if (!dragging) onMove(e.clientX); };
  dv.ontouchstart = (e) => { dragging = true; e.preventDefault(); };
  document._itbTouchMove = (e) => { if (dragging) onMove(e.touches[0].clientX); };
  document._itbTouchEnd  = ()  => { dragging = false; };
  document.addEventListener('touchmove', document._itbTouchMove, { passive: false });
  document.addEventListener('touchend',  document._itbTouchEnd);
  document._itbEscHandler = (e) => { if (e.key === 'Escape') itbClosePreview(); };
  document.addEventListener('keydown', document._itbEscHandler);
}

function itbClosePreview(e) {
  if (e && e.currentTarget === document.getElementById('itbPreviewModal') && e.target !== e.currentTarget) return;
  const modal = document.getElementById('itbPreviewModal');
  if (modal) modal.hidden = true;
  document.removeEventListener('mousemove', document._itbMouseMove);
  document.removeEventListener('mouseup',   document._itbMouseUp);
  document.removeEventListener('touchmove', document._itbTouchMove);
  document.removeEventListener('touchend',  document._itbTouchEnd);
  document.removeEventListener('keydown',   document._itbEscHandler);
}

/* ═══════════════════════════════════════════════════════════
   Drag & Drop
═══════════════════════════════════════════════════════════ */
let _itbDragCounter = 0;
function itbDragOver(e) {
  e.preventDefault(); e.stopPropagation();
  _itbDragCounter++;
  if (_itbDragCounter === 1) {
    document.getElementById('itbUploadZone').classList.add('itb-upload-zone--drag-over');
    document.getElementById('itbUploadIdle').hidden    = true;
    document.getElementById('itbUploadDrop').hidden    = false;
  }
}
function itbDragLeave(e) {
  e.preventDefault();
  _itbDragCounter--;
  if (_itbDragCounter <= 0) {
    _itbDragCounter = 0;
    document.getElementById('itbUploadZone').classList.remove('itb-upload-zone--drag-over');
    document.getElementById('itbUploadIdle').hidden = false;
    document.getElementById('itbUploadDrop').hidden = true;
  }
}
function itbDrop(e) {
  e.preventDefault();
  _itbDragCounter = 0;
  document.getElementById('itbUploadZone').classList.remove('itb-upload-zone--drag-over');
  document.getElementById('itbUploadIdle').hidden = false;
  document.getElementById('itbUploadDrop').hidden = true;
  itbAddFiles(e.dataTransfer.files);
}

/* ═══════════════════════════════════════════════════════════
   FAQ
═══════════════════════════════════════════════════════════ */
function itbToggleFAQ(i) {
  const item   = document.getElementById('itbFaq-' + i);
  const isOpen = item.classList.contains('itb-faq-item--open');
  document.querySelectorAll('.itb-faq-item--open').forEach(el => el.classList.remove('itb-faq-item--open'));
  if (!isOpen) item.classList.add('itb-faq-item--open');
}

/* ═══════════════════════════════════════════════════════════
   Toast
═══════════════════════════════════════════════════════════ */
function itbToast(msg, type = 'info', duration = 3000) {
  let container = document.getElementById('itbToasts');
  if (!container) { container = document.createElement('div'); container.id = 'itbToasts'; container.className = 'itb-toasts'; document.body.appendChild(container); }
  const el = document.createElement('div');
  el.className = 'itb-toast itb-toast--' + type;
  el.textContent = msg;
  container.appendChild(el);
  requestAnimationFrame(() => el.classList.add('itb-toast--visible'));
  if (duration > 0) setTimeout(() => itbRemoveToast(el), duration);
  return el;
}
function itbRemoveToast(el) {
  if (!el) return;
  el.classList.remove('itb-toast--visible');
  el.addEventListener('transitionend', () => el.remove(), { once: true });
}

/* ═══════════════════════════════════════════════════════════
   Helpers
═══════════════════════════════════════════════════════════ */
function itbFmtSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(2) + ' MB';
}
function itbMimeToExt(mime) {
  const map = { 'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif','image/bmp':'bmp' };
  return map[mime] || 'jpg';
}
function itbBuildOutputName(entry, opts, outMime) {
  const extMap = { 'to-jpg': 'jpg', 'jpg-to': opts.targetFormat || 'png', 'remove-bg': 'png' };
  const ext = extMap[ITB_TOOL] || itbMimeToExt(outMime) || entry.ext;
  return entry.name.replace(/\.[^.]+$/, '') + '.' + ext;
}
function itbEsc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function itbI18n(key) {
  if (window.ITB_I18N && window.ITB_I18N[key]) return window.ITB_I18N[key];
  return key;
}
function itbSetProcessBtn(enabled) {
  const btn = document.getElementById('itbProcessBtn');
  if (!btn) return;
  btn.disabled = !enabled || ITB_STATE.files.length === 0;
}
function itbUpdateSummary() {
  const el = document.getElementById('itbSummaryStats');
  if (!el) return;
  const done = ITB_STATE.files.filter(f => f.status === 'done');
  if (!done.length) { el.textContent = ''; return; }
  const totalSaved = done.reduce((s, f) => s + Math.max(0, f.size - f.outputSize), 0);
  const avg = itbFmtSize(totalSaved / done.length);
  el.textContent = itbI18n('result.common.summary').replace('{count}', done.length).replace('{saved}', avg);
}

/* collectOptions — overridden by each tool's page script */
function itbCollectOptions() { return window._itbCollectOptions ? window._itbCollectOptions() : {}; }

