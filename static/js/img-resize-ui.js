/**
 * img-resize-ui.js
 * UI 交互层：上传、选项联动、结果卡片渲染、Before/After 预览、下载
 * 依赖：img-resize-engine.js（window.IREngine）
 *
 * 架构：
 *   state.files[]    — 待处理 File[]，每个 file 带 ._irId
 *   state.cardMeta{} — id → { file, blob, url, outName, origW, origH,
 *                             outW, outH, origSize, outSize, origName }
 */

;(function () {
  'use strict';

  /* ═══════════ 状态 ═══════════ */
  var state = {
    files:      [],
    cardMeta:   {},
    mode:       'pixel',
    lockRatio:  true,
    preset:     null,
    processing: false,
    _origW:     null,
    _origH:     null,
  };

  var $ = function (id) { return document.getElementById(id); };

  function uid() { return Math.random().toString(36).slice(2, 9) + Date.now().toString(36); }
  function fmtSize(b) { return IREngine.fmtSize(b); }
  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ═══════════ DOMContentLoaded ═══════════ */
  document.addEventListener('DOMContentLoaded', function () {
    initUploadZone();
    initFileInput();
    initQualitySlider();
    initFormatQualityLink();
    initFormatCards();
    initDimInputs();
    initPercentSlider();
    updateStartBtn();
  });

  /* ═══════════ 上传区拖拽 ═══════════ */
  function initUploadZone() {
    var zone = $('uploadZone');
    if (!zone) return;
    zone.addEventListener('click', function (e) { if (!e.target.closest('label')) $('fileInput').click(); });
    zone.addEventListener('dragover',  function (e) { e.preventDefault(); zone.classList.add('ir-upload-zone--dragover'); });
    zone.addEventListener('dragleave', function (e) { if (!zone.contains(e.relatedTarget)) zone.classList.remove('ir-upload-zone--dragover'); });
    zone.addEventListener('drop', function (e) {
      e.preventDefault(); zone.classList.remove('ir-upload-zone--dragover');
      handleFiles(Array.from(e.dataTransfer.files));
    });
  }

  function initFileInput() {
    var input = $('fileInput');
    if (!input) return;
    input.addEventListener('change', function () { handleFiles(Array.from(input.files)); input.value = ''; });
  }

  window.onFileSelect = function (input) { handleFiles(Array.from(input.files)); input.value = ''; };

  /* ═══════════ 文件处理 ═══════════ */
  function handleFiles(files) {
    var valid = files.filter(function (f) { return /^image\/(jpeg|png|webp)$/.test(f.type); });
    if (!valid.length) { showToast('只支持 JPG、PNG、WebP 图片', 'error'); return; }
    if (valid.length !== files.length) showToast('已过滤不支持的文件格式', 'info');
    valid = valid.slice(0, 20);
    valid.forEach(function (f) { if (!f._irId) f._irId = uid(); });
    state.files = state.files.concat(valid);
    updateOrigDimHint(valid[0]);
    showOptionsPanel();
    updateStartBtn();
  }

  function updateOrigDimHint(file) {
    if (!file) return;
    var hint = $('origDimHint'); if (!hint) return;
    var url = URL.createObjectURL(file), img = new Image();
    img.onload = function () {
      state._origW = img.naturalWidth; state._origH = img.naturalHeight;
      hint.textContent = '原始尺寸：' + img.naturalWidth + ' × ' + img.naturalHeight + ' px';
      var wp = $('pixelWidth'), hp = $('pixelHeight');
      if (wp && !wp.value) wp.value = img.naturalWidth;
      if (hp && !hp.value) hp.value = img.naturalHeight;
      updatePercentPreview(); URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  function showOptionsPanel() {
    var p = $('optionsPanel');
    if (p) { p.style.display = ''; p.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
  }

  /* ═══════════ 模式切换 ═══════════ */
  window.switchMode = function (mode) {
    state.mode = mode;
    document.querySelectorAll('.ir-mode-tab').forEach(function (b) {
      b.classList.toggle('ir-mode-tab--active', b.dataset.mode === mode);
    });
    ['pixel','percent','preset'].forEach(function (m) {
      var el = $('panel' + m.charAt(0).toUpperCase() + m.slice(1));
      if (el) el.style.display = m === mode ? '' : 'none';
    });
    updateStartBtn();
  };

  /* ═══════════ 像素联动 ═══════════ */
  function initDimInputs() {
    var wp = $('pixelWidth'), hp = $('pixelHeight');
    if (!wp || !hp) return;
    wp.addEventListener('input', function () {
      if (state.lockRatio && wp.value && state._origW) hp.value = Math.round(+wp.value * state._origH / state._origW);
      updateStartBtn();
    });
    hp.addEventListener('input', function () {
      if (state.lockRatio && hp.value && state._origH) wp.value = Math.round(+hp.value * state._origW / state._origH);
      updateStartBtn();
    });
  }

  window.toggleLock = function () {
    state.lockRatio = !state.lockRatio;
    var btn = $('lockBtn'), icon = $('lockIcon');
    if (!btn) return;
    btn.classList.toggle('ir-lock-btn--locked', state.lockRatio);
    if (icon) icon.innerHTML = state.lockRatio
      ? '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'
      : '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>';
  };

  /* ═══════════ 质量滑块 ═══════════ */
  function initQualitySlider() {
    var s = $('qualitySlider'), d = $('qualityValue');
    if (!s || !d) return;
    var upd = function () { d.textContent = s.value; setSliderBg(s); };
    s.addEventListener('input', upd); upd();
  }
  function setSliderBg(s) {
    s.style.setProperty('--slider-pct', ((+s.value - +s.min) / (+s.max - +s.min) * 100).toFixed(1) + '%');
  }

  /* ═══════════ 格式 → 质量联动 ═══════════ */
  function initFormatQualityLink() {
    document.querySelectorAll('input[name="outputFormat"]').forEach(function (r) {
      r.addEventListener('change', function () {
        var g = $('qualityGroup'), s = $('qualitySlider'), png = r.value === 'image/png';
        if (g) g.style.opacity = png ? '0.4' : '1';
        if (s) s.disabled = png;
      });
    });
  }

  function initFormatCards() {
    document.querySelectorAll('.ir-format-card').forEach(function (l) {
      l.addEventListener('click', function () {
        document.querySelectorAll('.ir-format-card__inner').forEach(function (el) { el.style.borderColor = ''; });
      });
    });
  }

  /* ═══════════ 百分比滑块 ═══════════ */
  function initPercentSlider() {
    var s = $('percentSlider'), d = $('percentValue');
    if (!s || !d) return;
    s.addEventListener('input', function () { d.textContent = s.value; setSliderBg(s); updatePercentPreview(); });
    setSliderBg(s);
  }
  function updatePercentPreview() {
    var preview = $('percentPreview'), s = $('percentSlider');
    if (!preview || !s || !state._origW) { if (preview) preview.innerHTML = ''; return; }
    var p = parseInt(s.value) / 100;
    preview.innerHTML = '原始：<strong>' + state._origW + '×' + state._origH + '</strong>  →  输出：<strong>' +
      Math.round(state._origW * p) + '×' + Math.round(state._origH * p) + '</strong>';
  }

  /* ═══════════ 预设 ═══════════ */
  window.applyPreset = function (w, h, name) {
    state.preset = { w: w, h: h, name: name };
    document.querySelectorAll('.ir-preset-btn').forEach(function (b) { b.classList.remove('ir-preset-btn--active'); });
    event.currentTarget.classList.add('ir-preset-btn--active');
    var sp = $('selectedPreset'), sn = $('selectedPresetName'), sd = $('selectedPresetDim');
    if (sp) sp.style.display = ''; if (sn) sn.textContent = name; if (sd) sd.textContent = w + '×' + h;
    updateStartBtn();
  };

  /* ═══════════ 开始按钮 ═══════════ */
  function updateStartBtn() {
    var btn = $('startBtn'); if (!btn) return;
    var ok = state.files.length > 0 && !state.processing;
    if (state.mode === 'preset' && !state.preset) ok = false;
    btn.disabled = !ok;
  }

  /* ═══════════ 收集选项 ═══════════ */
  function collectOptions() {
    var fe = document.querySelector('input[name="outputFormat"]:checked');
    var qs = $('qualitySlider');
    var opts = { mode: state.mode, format: fe ? fe.value : '', quality: qs ? parseInt(qs.value)/100 : 0.9, lockRatio: state.lockRatio };
    if (state.mode === 'pixel')   { opts.width = parseInt($('pixelWidth').value)||800; opts.height = parseInt($('pixelHeight').value)||600; }
    else if (state.mode === 'percent') { opts.percent = parseInt($('percentSlider').value)||100; }
    else if (state.mode === 'preset' && state.preset) { opts.width = state.preset.w; opts.height = state.preset.h; }
    return opts;
  }

  /* ═══════════ 开始处理 ═══════════ */
  window.startResize = async function () {
    if (state.processing || !state.files.length) return;
    state.processing = true; updateStartBtn();
    var opts = collectOptions(), files = state.files.slice();

    var sec = $('resultsSection'); if (sec) sec.style.display = '';
    var list = $('resultsList');   if (list) list.innerHTML = '';

    files.forEach(function (f) {
      upsertResultCard({ id: f._irId, name: f.name, origSize: f.size, status: 'processing' });
    });

    var btnText = $('startBtnText'); if (btnText) btnText.textContent = '处理中…';
    var allOk = true;

    await IREngine.resizeBatch(files, opts, function (done, total, last) {
      var file = last.ok ? last.data.file : last.file, cardId = file._irId;
      if (last.ok) {
        var d = last.data;
        state.cardMeta[cardId] = { file: file, blob: d.blob, url: d.url, outName: d.outName, origName: file.name,
          origW: d.origW, origH: d.origH, outW: d.outW, outH: d.outH, origSize: d.origSize, outSize: d.outSize };
        upsertResultCard({ id: cardId, status: 'done', name: d.outName, origName: file.name, previewUrl: d.url,
          origW: d.origW, origH: d.origH, targetW: d.outW, targetH: d.outH, origSize: d.origSize, outputSize: d.outSize });
      } else {
        allOk = false;
        upsertResultCard({ id: cardId, status: 'error', name: file.name, origSize: file.size, error: last.error });
      }
      updateSummaryStats(done, total);
    });

    state.processing = false;
    if (btnText) btnText.textContent = '重新处理';
    updateStartBtn();
    var dlBtn = $('downloadAllBtn'); if (dlBtn) dlBtn.disabled = false;
    if (sec) setTimeout(function () { sec.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
    showToast(allOk ? '全部处理完成！' : '部分文件处理失败', allOk ? 'success' : 'info');
  };

  /* ═══════════ upsertResultCard ═══════════ */
  function upsertResultCard(data) {
    var list = $('resultsList'); if (!list) return;
    var domId = 'ir-card-' + data.id, card = document.getElementById(domId), isNew = !card;
    if (isNew) {
      card = document.createElement('div');
      card.className = 'ir-result-card'; card.id = domId;
      card.style.opacity = '0'; card.style.transform = 'translateY(12px)';
      list.appendChild(card);
      requestAnimationFrame(function () {
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        card.style.opacity = '1'; card.style.transform = 'translateY(0)';
      });
    }

    if (data.status === 'processing') {
      card.innerHTML =
        '<div class="ir-result-card__thumb"></div>' +
        '<div class="ir-result-card__body">' +
          '<p class="ir-result-card__name" title="' + escHtml(data.name) + '">' + escHtml(data.name) + '</p>' +
          '<div class="ir-result-card__meta"><span class="ir-result-dim">' + fmtSize(data.origSize) + '</span></div>' +
          '<div class="ir-result-progress"><div class="ir-result-progress__bar"></div></div>' +
        '</div>' +
        '<div class="ir-result-card__actions">' +
          '<span class="ir-status-badge ir-status-badge--processing"><span class="ir-spinner"></span> 处理中</span>' +
        '</div>';
      animateProgress(card.querySelector('.ir-result-progress__bar'));

    } else if (data.status === 'done') {
      var badge = getFormatBadge(data.name, data.origName);
      var sc    = data.outputSize < data.origSize ? 'ir-size--smaller' : 'ir-size--larger';
      card.innerHTML =
        '<div class="ir-result-card__thumb"><img src="' + data.previewUrl + '" alt="' + escHtml(data.name) + '" loading="lazy"></div>' +
        '<div class="ir-result-card__body">' +
          '<p class="ir-result-card__name" title="' + escHtml(data.name) + '">' + escHtml(data.name) + '</p>' +
          '<div class="ir-result-card__meta">' +
            '<span class="ir-result-dim">' + data.origW + '×' + data.origH + '</span>' +
            '<span class="ir-result-arrow">→</span>' +
            '<span class="ir-result-dim ir-result-dim--new">' + data.targetW + '×' + data.targetH + ' px ' + badge + '</span>' +
          '</div>' +
          '<div class="ir-result-card__sizes">' +
            '<span>' + fmtSize(data.origSize) + '</span><span class="ir-result-arrow">→</span>' +
            '<span class="' + sc + '">' + fmtSize(data.outputSize) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="ir-result-card__actions">' +
          '<button class="ir-btn-preview" onclick="openPreview(\'' + data.id + '\')">' +
            '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
              '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>' +
            '</svg> 对比</button>' +
          '<button class="ir-btn-download-one" onclick="downloadOne(\'' + data.id + '\')">⬇ 下载</button>' +
          '<button class="ir-btn-remove" onclick="removeItem(\'' + data.id + '\')">✕</button>' +
        '</div>';

    } else if (data.status === 'error') {
      card.innerHTML =
        '<div class="ir-result-card__thumb ir-result-card__thumb--error">⚠</div>' +
        '<div class="ir-result-card__body">' +
          '<p class="ir-result-card__name">' + escHtml(data.name) + '</p>' +
          '<p class="ir-error-text">' + escHtml(data.error || '处理失败') + '</p>' +
        '</div>' +
        '<div class="ir-result-card__actions">' +
          '<span class="ir-status-badge ir-status-badge--error">失败</span>' +
          '<button class="ir-btn-retry" onclick="retryItem(\'' + data.id + '\')">重试</button>' +
        '</div>';
    }
  }

  /* ═══════════ 进度条动画 ═══════════ */
  function animateProgress(barEl) {
    if (!barEl) return;
    var pct = 0; barEl.style.width = '0%';
    var tick = function () {
      if (pct >= 85) return;
      pct = Math.min(85, pct + Math.random() * 15 + 3);
      barEl.style.transition = 'width ' + (0.3 + Math.random() * 0.4) + 's ease';
      barEl.style.width = pct + '%';
      setTimeout(tick, 300 + Math.random() * 400);
    };
    setTimeout(tick, 80);
  }

  /* ═══════════ 格式角标 ═══════════ */
  function getFormatBadge(outName, origName) {
    if (!outName || !origName) return '';
    var a = (outName.split('.').pop()  || '').toUpperCase();
    var b = (origName.split('.').pop() || '').toUpperCase();
    return a !== b ? '<span class="ir-fmt-badge">' + a + '</span>' : '';
  }

  /* ═══════════ 统计头 ═══════════ */
  function updateSummaryStats(done, total) {
    var hdr = $('resultsHeader'); if (!hdr) return;
    var keys = Object.keys(state.cardMeta);
    var saved = keys.reduce(function (acc, id) {
      var m = state.cardMeta[id]; return acc + (m ? Math.max(0, m.origSize - m.outSize) : 0);
    }, 0);
    hdr.innerHTML =
      '<div class="ir-stat"><span class="ir-stat__label">已处理</span><span class="ir-stat__value ir-stat__value--blue">' +
        (done !== undefined ? done : keys.length) + ' / ' + (total !== undefined ? total : state.files.length) + '</span></div>' +
      '<div class="ir-stat"><span class="ir-stat__label">成功</span><span class="ir-stat__value">' + keys.length + '</span></div>' +
      '<div class="ir-stat"><span class="ir-stat__label">节省空间</span><span class="ir-stat__value">' + fmtSize(saved) + '</span></div>';
  }

  /* ═══════════ 移除单项 ═══════════ */
  window.removeItem = function (id) {
    var meta = state.cardMeta[id];
    if (meta && meta.url) URL.revokeObjectURL(meta.url);
    delete state.cardMeta[id];
    state.files = state.files.filter(function (f) { return f._irId !== id; });
    var card = document.getElementById('ir-card-' + id);
    if (card) {
      card.style.transition = 'opacity 0.2s, transform 0.2s';
      card.style.opacity = '0'; card.style.transform = 'translateX(20px)';
      setTimeout(function () { card.remove(); }, 220);
    }
    updateSummaryStats();
  };

  /* ═══════════ 重试单项 ═══════════ */
  window.retryItem = async function (id) {
    var file = state.files.find(function (f) { return f._irId === id; });
    if (!file) return;
    var opts = collectOptions();
    upsertResultCard({ id: id, name: file.name, origSize: file.size, status: 'processing' });
    try {
      var d = await IREngine.resizeFile(file, opts);
      state.cardMeta[id] = { file: file, blob: d.blob, url: d.url, outName: d.outName, origName: file.name,
        origW: d.origW, origH: d.origH, outW: d.outW, outH: d.outH, origSize: d.origSize, outSize: d.outSize };
      upsertResultCard({ id: id, status: 'done', name: d.outName, origName: file.name, previewUrl: d.url,
        origW: d.origW, origH: d.origH, targetW: d.outW, targetH: d.outH, origSize: d.origSize, outputSize: d.outSize });
    } catch (e) {
      upsertResultCard({ id: id, name: file.name, origSize: file.size, status: 'error', error: e.message });
    }
    updateSummaryStats();
  };

  /* ═══════════ 下载 ═══════════ */
  window.downloadOne = function (id) {
    var meta = state.cardMeta[id]; if (!meta) return;
    var a = document.createElement('a'); a.href = meta.url; a.download = meta.outName;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };
  window.downloadSingle = window.downloadOne;

  window.downloadAll = async function () {
    var metas = Object.keys(state.cardMeta).map(function (id) { return state.cardMeta[id]; }).filter(Boolean);
    if (!metas.length) { showToast('没有可下载的结果', 'info'); return; }
    if (metas.length === 1) {
      var a = document.createElement('a'); a.href = metas[0].url; a.download = metas[0].outName;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); return;
    }
    if (typeof JSZip !== 'undefined' && typeof saveAs !== 'undefined') {
      var zip = new JSZip(), nc = {};
      metas.forEach(function (m) {
        var n = m.outName;
        if (nc[n]) { nc[n]++; n = n.replace(/(\.[^.]+)$/, '_' + nc[m.outName] + '$1'); } else nc[m.outName] = 1;
        zip.file(n, m.blob);
      });
      showToast('正在打包 ZIP…', 'info');
      saveAs(await zip.generateAsync({ type: 'blob' }), 'resized_images.zip');
    } else {
      metas.forEach(function (m, i) {
        setTimeout(function () {
          var a = document.createElement('a'); a.href = m.url; a.download = m.outName;
          document.body.appendChild(a); a.click(); document.body.removeChild(a);
        }, i * 200);
      });
    }
  };

  /* ═══════════ 清空 ═══════════ */
  window.clearAll = function () {
    Object.keys(state.cardMeta).forEach(function (id) { var m = state.cardMeta[id]; if (m && m.url) URL.revokeObjectURL(m.url); });
    state.cardMeta = {}; state.files = []; state.preset = null; state.processing = false; state._origW = null; state._origH = null;
    ['resultsSection','resultsList','optionsPanel'].forEach(function (id) {
      var el = $(id); if (!el) return;
      if (id === 'resultsList') el.innerHTML = ''; else el.style.display = 'none';
    });
    var hint = $('origDimHint'); if (hint) hint.textContent = '';
    var sp = $('selectedPreset'); if (sp) sp.style.display = 'none';
    document.querySelectorAll('.ir-preset-btn').forEach(function (b) { b.classList.remove('ir-preset-btn--active'); });
    var t = $('startBtnText'); if (t) t.textContent = '开始调整';
    updateStartBtn(); showToast('已清空所有结果', 'info');
  };

  /* ═══════════ FAQ ═══════════ */
  window.toggleFAQ = function (id) {
    var item = document.getElementById(id); if (!item) return;
    item.classList.toggle('ir-faq-item--open');
  };

  /* ═══════════ Toast ═══════════ */
  function showToast(msg, type) {
    var c = $('toastContainer'); if (!c) return;
    var t = document.createElement('div');
    t.className = 'ir-toast ir-toast--' + (type || 'info'); t.textContent = msg; c.appendChild(t);
    requestAnimationFrame(function () { requestAnimationFrame(function () { t.classList.add('ir-toast--show'); }); });
    setTimeout(function () { t.classList.remove('ir-toast--show'); setTimeout(function () { t.remove(); }, 300); }, 3000);
  }
  window.showToast = showToast;

  /* ═══════════ Before/After 预览弹窗 ═══════════ */
  window.openPreview = function (id) {
    var meta = state.cardMeta[id]; if (!meta) return;
    var origUrl = URL.createObjectURL(meta.file);
    var ov = document.createElement('div');
    ov.className = 'ir-preview-overlay'; ov.id = 'irPreviewOverlay';
    var sc = meta.outSize < meta.origSize ? 'ir-size--smaller' : 'ir-size--larger';
    ov.innerHTML =
      '<div class="ir-preview-modal">' +
        '<div class="ir-preview-header">' +
          '<h3 class="ir-preview-title">' + escHtml(meta.outName) + '</h3>' +
          '<button class="ir-preview-close" onclick="closePreview()">✕</button>' +
        '</div>' +
        '<div class="ir-preview-info">' +
          '<div class="ir-preview-info__block">' +
            '<p class="ir-preview-info__label">原始尺寸</p>' +
            '<p class="ir-preview-info__value">' + meta.origW + ' × ' + meta.origH + ' px</p>' +
            '<p class="ir-preview-info__sub">' + fmtSize(meta.origSize) + '</p>' +
          '</div>' +
          '<div class="ir-preview-info__arrow">→</div>' +
          '<div class="ir-preview-info__block ir-preview-info__block--new">' +
            '<p class="ir-preview-info__label">调整后</p>' +
            '<p class="ir-preview-info__value">' + meta.outW + ' × ' + meta.outH + ' px</p>' +
            '<p class="ir-preview-info__sub ' + sc + '">' + fmtSize(meta.outSize) + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="ir-slider-compare" id="irSliderCompare">' +
          '<img class="ir-compare-img ir-compare-img--after" src="' + meta.url + '" alt="after">' +
          '<div class="ir-compare-before-wrap" id="irBeforeWrap" style="width:50%">' +
            '<img class="ir-compare-img ir-compare-img--before" src="' + origUrl + '" alt="before" id="irOrigImg">' +
          '</div>' +
          '<div class="ir-compare-divider" id="irCompareDivider" style="left:50%">' +
            '<div class="ir-compare-handle">' +
              '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
                '<polyline points="15 18 9 12 15 6"/><polyline points="9 6 3 12 9 18"/>' +
              '</svg></div></div>' +
          '<span class="ir-compare-tag ir-compare-tag--before">原始</span>' +
          '<span class="ir-compare-tag ir-compare-tag--after">调整后</span>' +
        '</div>' +
        '<div class="ir-preview-footer">' +
          '<button class="ir-btn-download-one" style="height:38px;font-size:.875rem;padding:0 18px"' +
            ' onclick="downloadOne(\'' + id + '\');closePreview()">⬇ 下载调整后图片</button>' +
          '<button class="ir-preview-close-btn" onclick="closePreview()">关闭</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(ov);
    var oi = document.getElementById('irOrigImg');
    if (oi) { oi.onload = oi.onerror = function () { URL.revokeObjectURL(origUrl); }; }
    requestAnimationFrame(function () { ov.classList.add('ir-preview-overlay--show'); });
    bindSliderEvents('irSliderCompare', 'irCompareDivider', 'irBeforeWrap');
    ov._kh = function (e) { if (e.key === 'Escape') closePreview(); };
    document.addEventListener('keydown', ov._kh);
    ov.addEventListener('click', function (e) { if (e.target === ov) closePreview(); });
  };

  window.closePreview = function () {
    var ov = document.getElementById('irPreviewOverlay'); if (!ov) return;
    document.removeEventListener('keydown', ov._kh);
    ov.classList.remove('ir-preview-overlay--show');
    setTimeout(function () { ov.remove(); }, 250);
  };

  function bindSliderEvents(cId, dId, wId) {
    var cmp = document.getElementById(cId), div = document.getElementById(dId), wrap = document.getElementById(wId);
    if (!cmp || !div || !wrap) return;
    cmp.style.setProperty('--compare-full-width', cmp.offsetWidth + 'px');
    var drag = false;
    var setPos = function (x) {
      var r = cmp.getBoundingClientRect(), p = Math.max(2, Math.min(98, (x - r.left) / r.width * 100));
      div.style.left = p + '%'; wrap.style.width = p + '%';
    };
    div.addEventListener('mousedown',  function (e) { drag = true; e.preventDefault(); });
    document.addEventListener('mousemove', function (e) { if (drag) setPos(e.clientX); });
    document.addEventListener('mouseup',   function ()  { drag = false; });
    div.addEventListener('touchstart', function (e) { drag = true; e.preventDefault(); });
    document.addEventListener('touchmove', function (e) { if (drag) setPos(e.touches[0].clientX); }, { passive: false });
    document.addEventListener('touchend',  function ()  { drag = false; });
    cmp.addEventListener('click', function (e) { if (e.target === div || div.contains(e.target)) return; setPos(e.clientX); });
  }

})();

