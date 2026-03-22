/**
 * img-metadata-ui.js
 * UI 交互层：拖拽上传、文件列表、元数据卡片渲染、GPS 地图、字段复制、导出
 * 依赖：img-metadata-engine.js（IMState、addFiles、exportData、exportAll、clearAll）
 */
'use strict';

/* ══════════════════════════════════════════════
   上传区初始化
════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
  const zone = document.getElementById('uploadZone');
  if (!zone) return;

  zone.addEventListener('dragover', function (e) {
    e.preventDefault(); e.stopPropagation();
    zone.classList.add('im-upload-zone--dragover');
  });

  zone.addEventListener('dragleave', function (e) {
    if (!zone.contains(e.relatedTarget)) {
      zone.classList.remove('im-upload-zone--dragover');
    }
  });

  zone.addEventListener('drop', function (e) {
    e.preventDefault(); e.stopPropagation();
    zone.classList.remove('im-upload-zone--dragover');
    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  });

  zone.addEventListener('click', function (e) {
    // 排除上传按钮本身（label 已处理）
    if (e.target.tagName === 'LABEL' || e.target.closest('label')) return;
    const input = document.getElementById('fileInput');
    if (input) input.click();
  });
});

/* 全局拖拽事件（inline 调用兼容） */
function onDragOver(e) {
  e.preventDefault(); e.stopPropagation();
  const zone = document.getElementById('uploadZone');
  if (zone) zone.classList.add('im-upload-zone--dragover');
}

function onDragLeave(e) {
  const zone = document.getElementById('uploadZone');
  if (zone && !zone.contains(e.relatedTarget)) {
    zone.classList.remove('im-upload-zone--dragover');
  }
}

function onDrop(e) {
  e.preventDefault(); e.stopPropagation();
  const zone = document.getElementById('uploadZone');
  if (zone) zone.classList.remove('im-upload-zone--dragover');
  if (e.dataTransfer && e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
}

function onFileSelect(input) {
  if (input.files && input.files.length > 0) { addFiles(input.files); input.value = ''; }
}

/* ── 显示结果区 ────────────────────────────── */
function showResultsSection() {
  const sec = document.getElementById('resultsSection');
  if (sec) {
    sec.style.display = 'block';
    setTimeout(function () { sec.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
  }
  const bulk = document.getElementById('bulkExport');
  if (bulk) bulk.style.display = 'flex';
}

/* ══════════════════════════════════════════════
   文件列表
════════════════════════════════════════════════ */
function addFileItem(file, status) {
  const list = document.getElementById('fileList');
  if (!list) return;

  const item = document.createElement('div');
  item.className = 'im-file-item';
  item.id        = 'im-file-item-' + file._imId;
  item.onclick   = function () { selectFile(file._imId); };

  // 创建临时 thumb URL（onload 后释放）
  const thumbUrl = URL.createObjectURL(file);
  item.innerHTML =
    '<img class="im-file-item__thumb" src="' + thumbUrl + '"' +
    ' onload="URL.revokeObjectURL(this.src)" alt="">' +
    '<div class="im-file-item__info">' +
      '<p class="im-file-item__name" title="' + escapeHtml(file.name) + '">' + escapeHtml(file.name) + '</p>' +
      '<p class="im-file-item__size">' + formatFileSize(file.size) + '</p>' +
    '</div>' +
    '<div class="im-file-item__status im-file-item__status--' + status + '"' +
    ' id="im-status-' + file._imId + '"></div>';

  list.appendChild(item);
}

function updateFileItem(id, status) {
  const dot = document.getElementById('im-status-' + id);
  if (dot) dot.className = 'im-file-item__status im-file-item__status--' + status;
}

function selectFile(id) {
  IMState.activeId = id;

  document.querySelectorAll('.im-file-item').forEach(function (el) {
    el.classList.remove('im-file-item--active');
  });
  const active = document.getElementById('im-file-item-' + id);
  if (active) active.classList.add('im-file-item--active');

  renderMetadataDetail(id);
}

/* ══════════════════════════════════════════════
   元数据详情渲染
════════════════════════════════════════════════ */
function renderMetadataDetail(id) {
  const result = IMState.results[id];

  const empty     = document.getElementById('emptyState');
  const header    = document.getElementById('resultHeader');
  const sections  = document.getElementById('sectionsWrap');

  if (empty)    empty.style.display    = result ? 'none' : 'flex';
  if (header)   header.style.display   = result && !result.error ? 'flex' : 'none';
  if (sections) sections.style.display = result && !result.error ? 'flex' : 'none';

  if (!result || result.error) {
    if (result && result.error && empty) {
      empty.style.display = 'flex';
      const icon = empty.querySelector('.im-empty-state__icon');
      if (icon) icon.textContent = '⚠️';
      const msg = empty.querySelector('p');
      if (msg) msg.textContent = '解析失败：' + result.error;
    }
    return;
  }

  // 顶部文件信息
  const thumb = document.getElementById('resultThumb');
  if (thumb) thumb.src = result.thumbUrl;
  const nameEl = document.getElementById('resultName');
  if (nameEl) nameEl.textContent = result.fileName;
  const metaEl = document.getElementById('resultMeta');
  if (metaEl) {
    const dims = result.width && result.height ? result.width + ' × ' + result.height + ' px  ·  ' : '';
    metaEl.textContent = dims + formatFileSize(result.fileSize) + '  ·  ' + result.fileType;
  }

  // 渲染六个分类
  renderBasic(result);
  renderCamera(result);
  renderGPS(result);
  renderIPTC(result);
  renderXMP(result);
  renderRaw(result);

  // 默认展开基础信息和相机参数
  ['sectionBasic', 'sectionCamera'].forEach(function (sid) {
    const card = document.getElementById(sid);
    if (card && !card.classList.contains('im-section-card--open')) {
      card.classList.add('im-section-card--open');
    }
  });
}

/* ── 渲染通用字段表格 ──────────────────────── */
function renderFieldTable(bodyId, fields, emptyMsg) {
  const body = document.getElementById(bodyId);
  if (!body) return;
  emptyMsg = emptyMsg || '未找到此类数据';

  if (!fields || fields.length === 0) {
    body.innerHTML = '<div class="im-no-data">' + emptyMsg + '</div>';
    return;
  }

  body.innerHTML = fields.map(function (f) {
    return '<div class="im-field-row">' +
      '<span class="im-field-label">' + escapeHtml(f.label) + '</span>' +
      '<span class="im-field-value' + (f.highlight ? ' im-field-value--highlight' : '') + '">' +
        escapeHtml(f.value) +
      '</span>' +
      '<button class="im-copy-field-btn" title="复制"' +
        ' onclick="copyField(this, \'' + escapeAttr(f.value) + '\')">' +
        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none"' +
          ' stroke="currentColor" stroke-width="2">' +
          '<rect x="9" y="9" width="13" height="13" rx="2"/>' +
          '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>' +
        '</svg>' +
      '</button>' +
    '</div>';
  }).join('');
}

function renderBasic(result) {
  renderFieldTable('bodyBasic', result.sections.basic);
}

function renderCamera(result) {
  renderFieldTable('bodyCamera', result.sections.camera, '未找到相机参数数据');
}

function renderGPS(result) {
  const gps  = result.sections.gps;
  const body = document.getElementById('bodyGPS');
  if (!body) return;

  if (!gps.fields || gps.fields.length === 0) {
    body.innerHTML = '<div class="im-no-data">此图片不含 GPS 信息</div>';
    return;
  }

  // 字段表格
  var tableHtml = gps.fields.map(function (f) {
    return '<div class="im-field-row">' +
      '<span class="im-field-label">' + escapeHtml(f.label) + '</span>' +
      '<span class="im-field-value im-field-value--highlight">' + escapeHtml(f.value) + '</span>' +
      '<button class="im-copy-field-btn" onclick="copyField(this, \'' + escapeAttr(f.value) + '\')">' +
        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
          '<rect x="9" y="9" width="13" height="13" rx="2"/>' +
          '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>' +
        '</svg>' +
      '</button>' +
    '</div>';
  }).join('');

  // OpenStreetMap iframe（lat/lng 均存在时）
  var mapHtml = '';
  if (gps.lat != null && gps.lng != null) {
    var lat  = gps.lat.toFixed(6);
    var lng  = gps.lng.toFixed(6);
    var zoom = 14;
    var dLat = 0.01, dLng = 0.01;
    var osmSrc = 'https://www.openstreetmap.org/export/embed.html' +
      '?bbox=' + (parseFloat(lng) - dLng) + ',' + (parseFloat(lat) - dLat) + ',' +
               (parseFloat(lng) + dLng) + ',' + (parseFloat(lat) + dLat) +
      '&layer=mapnik&marker=' + lat + ',' + lng;
    var osmUrl = 'https://www.openstreetmap.org/?mlat=' + lat + '&mlon=' + lng +
      '#map=' + zoom + '/' + lat + '/' + lng;
    var coords = lat + ', ' + lng;

    mapHtml =
      '<div class="im-gps-map-wrap">' +
        '<iframe src="' + osmSrc + '" title="拍摄地点地图" loading="lazy"' +
          ' allow="geolocation \'none\'"></iframe>' +
      '</div>' +
      '<div class="im-gps-map-actions">' +
        '<a class="im-gps-action-btn" href="' + osmUrl + '" target="_blank" rel="noopener">' +
          '🗺 在 OpenStreetMap 中打开' +
        '</a>' +
        '<button class="im-gps-action-btn" onclick="copyField(this, \'' + coords + '\')">' +
          '📋 复制坐标' +
        '</button>' +
      '</div>';
  }

  body.innerHTML = tableHtml + mapHtml;
}

function renderIPTC(result) {
  renderFieldTable('bodyIPTC', result.sections.iptc, '未找到 IPTC 版权数据');
}

function renderXMP(result) {
  renderFieldTable('bodyXMP', result.sections.xmp, '未找到 XMP 数据');
}

function renderRaw(result) {
  const pre = document.getElementById('rawJsonPre');
  if (!pre) return;
  pre.textContent = JSON.stringify(cleanRawForDisplay(result.raw), null, 2);
}

/* 过滤超大二进制字段，避免显示乱码 */
function cleanRawForDisplay(raw) {
  const out = {};
  for (const k in raw) {
    if (!Object.prototype.hasOwnProperty.call(raw, k)) continue;
    const v = raw[k];
    if (v instanceof Uint8Array || v instanceof ArrayBuffer) {
      out[k] = '[Binary ' + (v.byteLength || v.length) + ' bytes]';
    } else {
      out[k] = v;
    }
  }
  return out;
}

/* ══════════════════════════════════════════════
   分类卡片折叠
════════════════════════════════════════════════ */
function toggleSection(id) {
  const card = document.getElementById(id);
  if (card) card.classList.toggle('im-section-card--open');
}

/* ══════════════════════════════════════════════
   字段复制
════════════════════════════════════════════════ */
function copyField(btn, value) {
  navigator.clipboard.writeText(value).then(function () {
    btn.classList.add('im-copy-field-btn--copied');
    btn.innerHTML =
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none"' +
        ' stroke="currentColor" stroke-width="2.5">' +
        '<polyline points="20 6 9 17 4 12"/>' +
      '</svg>';
    setTimeout(function () {
      btn.classList.remove('im-copy-field-btn--copied');
      btn.innerHTML =
        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none"' +
          ' stroke="currentColor" stroke-width="2">' +
          '<rect x="9" y="9" width="13" height="13" rx="2"/>' +
          '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>' +
        '</svg>';
    }, 2000);
  }).catch(function () { showToast('复制失败', 'error'); });
}

function copyRawData(e) {
  e.stopPropagation();
  const result = IMState.results[IMState.activeId];
  if (!result) return;
  navigator.clipboard.writeText(JSON.stringify(result.raw, null, 2)).then(function () {
    showToast('已复制全部 JSON', 'success');
  });
}

/* ══════════════════════════════════════════════
   FAQ 折叠
════════════════════════════════════════════════ */
function toggleFAQ(id) {
  const item   = document.getElementById(id);
  if (!item) return;
  const isOpen = item.classList.contains('im-faq-item--open');
  document.querySelectorAll('.im-faq-item--open').forEach(function (i) {
    i.classList.remove('im-faq-item--open');
  });
  if (!isOpen) item.classList.add('im-faq-item--open');
}

/* ══════════════════════════════════════════════
   Toast（供 engine.js 调用）
════════════════════════════════════════════════ */
function showToast(msg, type) {
  type = type || 'info';
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const el = document.createElement('div');
  el.className   = 'im-toast im-toast--' + type;
  el.textContent = msg;
  container.appendChild(el);
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { el.classList.add('im-toast--show'); });
  });
  setTimeout(function () {
    el.classList.remove('im-toast--show');
    setTimeout(function () { el.remove(); }, 300);
  }, 3500);
}

/* ══════════════════════════════════════════════
   工具函数
════════════════════════════════════════════════ */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  return String(str).replace(/'/g, '&#39;').replace(/"/g, '&quot;');
}

