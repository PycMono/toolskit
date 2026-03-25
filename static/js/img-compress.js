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
   upsertResultCard — TinyPNG-inspired card
   Layout:
     [thumbnail]
     [filename]
     [orig-fmt → out-fmt]  [orig-size → out-size  -XX%]
     [status / error]
     [Download btn]  [Remove btn]
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

  card.className = 'icc-card' + (isPending ? ' icc-pending' : isDone ? ' icc-done' : isError ? ' icc-error' : '');

  /* ── Thumbnail ── */
  var thumbHtml;
  if (isDone && result.previewUrl) {
    thumbHtml = '<div class="icc-thumb-wrap"><img class="icc-thumb" src="' + _esc(result.previewUrl) + '" alt=""></div>';
  } else if (isPending && result.origUrl) {
    thumbHtml = '<div class="icc-thumb-wrap icc-thumb-wrap--loading"><img class="icc-thumb icc-thumb--blur" src="' + _esc(result.origUrl) + '" alt=""><div class="icc-thumb-spinner"><span class="icc-spin"></span></div></div>';
  } else {
    var icon = isError ? '❌' : '🖼️';
    thumbHtml = '<div class="icc-thumb-wrap"><div class="icc-thumb icc-thumb--ph">' + icon + '</div></div>';
  }

  /* ── File name (truncated) ── */
  var displayName = isDone ? _esc(result.name) : _esc(result.origName || result.name);
  var nameHtml = '<div class="icc-name" title="' + displayName + '">' + displayName + '</div>';

  /* ── Format row: ORIG → OUT ── */
  var fmtHtml = '';
  if (isDone) {
    var origFmt = _mimeLabel(result.origType);
    var outFmt  = _mimeLabel(result.outputMime);
    if (origFmt !== outFmt) {
      fmtHtml = '<div class="icc-fmt-row"><span class="icc-fmt icc-fmt--orig">' + origFmt + '</span><span class="icc-fmt-arrow">→</span><span class="icc-fmt icc-fmt--out">' + outFmt + '</span></div>';
    } else {
      fmtHtml = '<div class="icc-fmt-row"><span class="icc-fmt icc-fmt--same">' + outFmt + '</span></div>';
    }
  } else if (isPending) {
    var origFmtP = _mimeLabel(result.origType);
    fmtHtml = '<div class="icc-fmt-row"><span class="icc-fmt icc-fmt--same">' + origFmtP + '</span></div>';
  }

  /* ── Size row: orig → compressed  -XX% ── */
  var sizeHtml = '';
  if (isDone) {
    var pct = result.savedPct || 0;
    var grew = result.outputSize > result.origSize;
    var pctClass = grew ? 'icc-pct icc-pct--grew' : pct >= 10 ? 'icc-pct icc-pct--good' : 'icc-pct icc-pct--mild';
    var pctLabel = grew ? ('+' + Math.abs(pct) + '%') : ('-' + pct + '%');
    sizeHtml =
      '<div class="icc-size-row">' +
        '<span class="icc-size-orig">' + _fmt(result.origSize) + '</span>' +
        '<span class="icc-size-sep">→</span>' +
        '<span class="icc-size-out">' + _fmt(result.outputSize) + '</span>' +
        '<span class="' + pctClass + '">' + pctLabel + '</span>' +
      '</div>';
  } else if (isPending) {
    sizeHtml = '<div class="icc-size-row"><span class="icc-size-orig">' + _fmt(result.origSize) + '</span><span class="icc-size-sep icc-processing">compressing…</span></div>';
  } else if (isError) {
    sizeHtml = '<div class="icc-size-row"><span class="icc-size-orig">' + _fmt(result.origSize) + '</span></div>';
  }

  /* ── Status / error ── */
  var statusHtml = '';
  if (isError) {
    statusHtml = '<div class="icc-status icc-status--err">✕ ' + _esc(result.error || 'Compression failed') + '</div>';
  }

  /* ── Action buttons ── */
  var actionsHtml = '<div class="icc-actions">';
  if (isDone) {
    actionsHtml += '<button class="icc-btn icc-btn--dl" onclick="downloadOne(\'' + result.id + '\')">⬇ Download</button>';
  }
  actionsHtml += '<button class="icc-btn icc-btn--rm" title="Remove" onclick="window._icRemove(\'' + result.id + '\')">✕</button>';
  actionsHtml += '</div>';

  card.innerHTML =
    thumbHtml +
    '<div class="icc-body">' +
      nameHtml +
      fmtHtml +
      sizeHtml +
      statusHtml +
    '</div>' +
    actionsHtml;

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

/* ── Re-compress all when settings change ── */
function _recompressAll() {
  if (typeof ICState === 'undefined' || ICState.files.length === 0 || ICState.isRunning) return;
  // Clear previous results so engine reprocesses everything
  if (ICState.results) {
    ICState.results.forEach(function(r){
      if (r.previewUrl) URL.revokeObjectURL(r.previewUrl);
      if (r.origUrl) URL.revokeObjectURL(r.origUrl);
    });
    ICState.results = [];
  }
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

  /* Format select — re-compress immediately on change */
  var fmt = document.getElementById('outputFormat');
  function _applyFmt(recompress) {
    if (!fmt || typeof ICState === 'undefined') return;
    var v = fmt.value;
    ICState.outputFormat =
      v === 'auto'  ? 'original'   :
      v === 'jpg'   ? 'image/jpeg' :
      v === 'png'   ? 'image/png'  :
      v === 'webp'  ? 'image/webp' :
      v === 'gif'   ? 'image/gif'  :
      v === 'bmp'   ? 'image/bmp'  : 'original';
    if (recompress) _recompressAll();
  }
  if (fmt) {
    fmt.addEventListener('change', function(){ _applyFmt(true); });
    _applyFmt(false);
  }

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

/* ─────────────────────────────────────────────────────────
   upsertResultCard — TinyPNG-style row card
   Layout: [thumb 56x56] [info: name + sizes + status] [actions]
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

  var isPending     = result.status === 'compressing';
  var isDone        = result.status === 'done';
  var isError       = result.status === 'error';

  /* State class */
  card.className = 'icc-row' + (isPending ? ' icc-pending' : isDone ? ' icc-done' : isError ? ' icc-error' : '');

  /* Thumbnail */
  var thumb;
  if (isDone && result.previewUrl) {
    thumb = '<img class="icc-thumb" src="' + result.previewUrl + '" alt="">';
  } else {
    var icon = isError ? '❌' : '🖼️';
    thumb = '<div class="icc-thumb icc-thumb--ph">' + icon + '</div>';
  }

  /* Size info */
  var sizeRow = '<span class="icc-orig">' + _fmt(result.origSize) + '</span>';
  if (isDone) {
    var pct = result.savedPct || 0;
    var pctColor = pct >= 10 ? '#1a7a4a' : '#64748b';
    sizeRow +=
      '<span class="icc-arrow">→</span>' +
      '<span class="icc-new">' + _fmt(result.outputSize) + '</span>' +
      (pct > 0 ? '<span class="icc-badge" style="background:' + pctColor + '">−' + pct + '%</span>' : '');
  }

  /* Format label under filename */
  var fmtLabel = '';
  if (isDone && result.outputMime) {
    fmtLabel = '<span class="icc-fmt">' + result.outputMime.replace('image/','').toUpperCase() + '</span>';
  }

  /* Status msg */
  var status = '';
  if (isPending) {
    status = '<span class="icc-status"><span class="icc-spin"></span> Compressing…</span>';
  } else if (isError) {
    status = '<span class="icc-status icc-status--err">✕ ' + _esc(result.error || 'Failed') + '</span>';
  }

  /* Action buttons */
  var actions = '';
  if (isDone) {
    actions += '<button class="icc-btn icc-btn--dl" onclick="downloadOne(\'' + result.id + '\')">⬇ Download</button>';
  }
  actions += '<button class="icc-btn icc-btn--rm" title="Remove" onclick="window._icRemove(\'' + result.id + '\')">✕</button>';

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

  /* Quality slider */
  var qs = document.getElementById('qualitySlider');
  var qv = document.getElementById('qualityValue');
  if (qs) {
    qs.addEventListener('input', function() {
      var v = parseInt(qs.value, 10);
      if (qv) qv.textContent = v + '%';
      if (typeof ICState !== 'undefined') ICState.quality = v;
    });
  }

  /* Format select */
  var fmt = document.getElementById('outputFormat');
  function _applyFmt() {
    if (!fmt || typeof ICState === 'undefined') return;
    var v = fmt.value;
    ICState.outputFormat = v === 'auto' ? 'original' : v === 'jpg' ? 'image/jpeg' : v === 'png' ? 'image/png' : v === 'webp' ? 'image/webp' : v === 'gif' ? 'image/gif' : v === 'bmp' ? 'image/bmp' : 'original';
  }
  if (fmt) { fmt.addEventListener('change', _applyFmt); _applyFmt(); }

  /* Max width */
  var mw = document.getElementById('maxWidth');
  if (mw) {
    mw.addEventListener('input', function() {
      if (typeof ICState !== 'undefined') {
        var v = parseInt(mw.value, 10);
        ICState.maxWidth = v > 0 ? v : null;
      }
    });
  }
});

