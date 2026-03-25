/* =========================================================
   Image Compress — UI Bridge  (self-contained)
   Requires: img-compress-engine.js loaded first
   ========================================================= */
'use strict';

/* ── Toast ── */
function showToast(msg, type) {
  type = type || 'info';
  var wrap = document.getElementById('ic-toast-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'ic-toast-wrap';
    wrap.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:99999;display:flex;flex-direction:column;gap:6px;pointer-events:none';
    document.body.appendChild(wrap);
  }
  var bg = { success:'#1a7a4a', error:'#dc2626', info:'#334155', warning:'#b45309' };
  var t = document.createElement('div');
  t.style.cssText = 'padding:9px 16px;border-radius:8px;font-size:13px;font-weight:600;color:#fff;pointer-events:none;opacity:0;transition:opacity .2s;background:' + (bg[type]||bg.info);
  t.textContent = msg;
  wrap.appendChild(t);
  requestAnimationFrame(function(){ t.style.opacity='1'; });
  setTimeout(function(){ t.style.opacity='0'; setTimeout(function(){ t.remove(); },250); }, 3000);
}

/* ── Show/hide panels ── */
function showResultsSection() {
  var el = document.getElementById('resultsSection');
  if (el) el.style.display = 'block';
  var ob = document.getElementById('optsBar');
  if (ob) ob.style.display = 'block';
}

/* ── Called by engine when files pass validation ── */
function onFilesAdded() {
  showResultsSection();
  startCompress();
}

/* ── Helpers ── */
function _fmt(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(2) + ' MB';
}
function _esc(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function _mimeLabel(mime) {
  if (!mime) return '';
  var m = mime.replace('image/','').toUpperCase();
  if (m === 'JPEG') return 'JPG';
  return m;
}

/* ─────────────────────────────────────────────────────────
   upsertResultCard — TinyPNG-style compact row
   Layout: [thumb 56px] [info: name + fmt + sizes + status] [actions]
   ───────────────────────────────────────────────────────── */
function upsertResultCard(result) {
  var list = document.getElementById('resultsList');
  if (!list) return;

  var id   = 'icc-' + result.id;
  var card = document.getElementById(id);
  if (!card) {
    card = document.createElement('div');
    card.id = id;
    list.appendChild(card);
  }

  var isPending = result.status === 'compressing';
  var isDone    = result.status === 'done';
  var isError   = result.status === 'error';

  /* State class */
  card.className = 'icc-row' + (isPending ? ' icc-pending' : isDone ? ' icc-done' : isError ? ' icc-error' : '');

  /* ── Thumbnail ── */
  var thumb;
  if (isDone && result.previewUrl) {
    thumb = '<img class="icc-thumb" src="' + _esc(result.previewUrl) + '" alt="">';
  } else if (isPending && result.origUrl) {
    thumb = '<div class="icc-thumb-loading"><img class="icc-thumb icc-thumb--blur" src="' + _esc(result.origUrl) + '" alt=""><span class="icc-spin"></span></div>';
  } else {
    var icon = isError ? '❌' : '🖼️';
    thumb = '<div class="icc-thumb icc-thumb--ph">' + icon + '</div>';
  }

  /* ── Format label ── */
  var origFmt = _mimeLabel(result.origType);
  var outFmt  = isDone && result.outputMime ? _mimeLabel(result.outputMime) : origFmt;
  var fmtLabel = '';
  if (isDone) {
    if (origFmt !== outFmt) {
      fmtLabel = '<span class="icc-fmt">' + origFmt + ' → ' + outFmt + '</span>';
    } else {
      fmtLabel = '<span class="icc-fmt">' + outFmt + '</span>';
    }
  } else if (isPending) {
    fmtLabel = '<span class="icc-fmt">' + origFmt + '</span>';
  }

  /* ── Size row ── */
  var sizeRow = '<span class="icc-orig">' + _fmt(result.origSize) + '</span>';
  if (isDone) {
    var pct = result.savedPct || 0;
    var grew = result.outputSize > result.origSize;
    var pctColor = grew ? '#dc2626' : pct >= 10 ? '#1a7a4a' : '#64748b';
    sizeRow +=
      '<span class="icc-arrow">→</span>' +
      '<span class="icc-new">' + _fmt(result.outputSize) + '</span>' +
      '<span class="icc-badge" style="background:' + pctColor + '">' + (grew ? '+' : '−') + Math.abs(pct) + '%</span>';
  } else if (isPending) {
    sizeRow += '<span class="icc-arrow icc-processing">compressing…</span>';
  }

  /* ── Status / error ── */
  var status = '';
  if (isError) {
    status = '<div class="icc-status icc-status--err">✕ ' + _esc(result.error || 'Compression failed') + '</div>';
  }

  /* ── Action buttons ── */
  var actions = '';
  if (isDone) {
    var dlLabel = outFmt ? outFmt : 'FILE';
    actions += '<button class="icc-btn icc-btn--dl" onclick="downloadOne(\'' + result.id + '\')" title="Download">' +
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="flex-shrink:0"><path d="M12 3v12M6 15l6 6 6-6"/><path d="M3 20h18"/></svg>' +
      '<span>' + _esc(dlLabel) + '</span>' +
    '</button>';
  }
  actions += '<button class="icc-btn icc-btn--rm" title="Remove" onclick="window._icRemove(\'' + result.id + '\')">' +
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
  '</button>';

  card.innerHTML =
    thumb +
    '<div class="icc-info">' +
      '<div class="icc-name" title="' + _esc(result.name) + '">' + _esc(result.name) + '</div>' +
      fmtLabel +
      '<div class="icc-sizes">' + sizeRow + '</div>' +
      status +
    '</div>' +
    '<div class="icc-actions">' + actions + '</div>';

  updateSummaryStats();
}

/* ── Remove card ── */
window._icRemove = function(id) {
  if (typeof ICState !== 'undefined') {
    var fi = ICState.files.findIndex(function(f){ return f._icId === id; });
    if (fi !== -1) ICState.files.splice(fi, 1);
    var ri = ICState.results.findIndex(function(r){ return r.id === id; });
    if (ri !== -1) {
      var r = ICState.results[ri];
      if (r.previewUrl) URL.revokeObjectURL(r.previewUrl);
      if (r.origUrl) URL.revokeObjectURL(r.origUrl);
      ICState.results.splice(ri, 1);
    }
  }
  var el = document.getElementById('icc-' + id);
  if (el) el.remove();
  if (typeof ICState !== 'undefined' && ICState.files.length === 0) {
    var s = document.getElementById('resultsSection');
    if (s) s.style.display = 'none';
    var o = document.getElementById('optsBar');
    if (o) o.style.display = 'none';
    var h = document.getElementById('resultsHeader');
    if (h) h.innerHTML = '';
  }
  if (typeof updateSummaryStats === 'function') updateSummaryStats();
};

/* ── clearAll override ── */
window.clearAll = function() {
  if (typeof ICState !== 'undefined') {
    ICState.results.forEach(function(r){
      if (r.previewUrl) URL.revokeObjectURL(r.previewUrl);
      if (r.origUrl) URL.revokeObjectURL(r.origUrl);
    });
    ICState.files = [];
    ICState.results = [];
  }
  ['resultsList','resultsHeader'].forEach(function(id){
    var el = document.getElementById(id);
    if (el) el.innerHTML = '';
  });
  ['resultsSection','optsBar'].forEach(function(id){
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  var fi = document.getElementById('fileInput');
  if (fi) fi.value = '';
  showToast('Cleared', 'info');
};

/* ── Re-compress all ── */
function _recompressAll() {
  if (typeof ICState === 'undefined' || !ICState.files || ICState.files.length === 0) return;
  if (ICState.isRunning) return;
  if (ICState.results) {
    ICState.results.forEach(function(r) {
      if (r.previewUrl) URL.revokeObjectURL(r.previewUrl);
      if (r.origUrl) URL.revokeObjectURL(r.origUrl);
    });
    ICState.results = [];
  }
  var list = document.getElementById('resultsList');
  if (list) list.innerHTML = '';
  startCompress();
}

/* ── DOM wiring ── */
document.addEventListener('DOMContentLoaded', function() {

  /* File input */
  var fileInput = document.getElementById('fileInput');
  if (fileInput) {
    fileInput.addEventListener('change', function(e) {
      if (e.target.files && e.target.files.length) addFiles(e.target.files);
      e.target.value = '';
    });
  }

  /* Quality slider — update display live, re-compress on release */
  var qs = document.getElementById('qualitySlider');
  var qv = document.getElementById('qualityValue');
  if (qs) {
    qs.addEventListener('input', function() {
      var v = parseInt(qs.value, 10);
      if (qv) qv.textContent = v + '%';
      if (typeof ICState !== 'undefined') ICState.quality = v;
    });
    qs.addEventListener('change', function() {
      _recompressAll();
    });
  }

  /* Format select — re-compress on change */
  var fmt = document.getElementById('outputFormat');
  function _applyFmt(recompress) {
    if (!fmt || typeof ICState === 'undefined') return;
    var v = fmt.value;
    ICState.outputFormat = v === 'auto' ? 'original' : v === 'jpg' ? 'image/jpeg' : v === 'png' ? 'image/png' : v === 'webp' ? 'image/webp' : v === 'gif' ? 'image/gif' : v === 'bmp' ? 'image/bmp' : 'original';
    if (recompress) _recompressAll();
  }
  if (fmt) { fmt.addEventListener('change', function() { _applyFmt(true); }); _applyFmt(false); }

  /* Max width — re-compress on blur/enter */
  var mw = document.getElementById('maxWidth');
  if (mw) {
    mw.addEventListener('input', function() {
      if (typeof ICState !== 'undefined') {
        var v = parseInt(mw.value, 10);
        ICState.maxWidth = v > 0 ? v : null;
      }
    });
    mw.addEventListener('change', function() {
      _recompressAll();
    });
  }
});

