// /static/js/media-qr-frames.js
// Handles: Frame panel UI, Canvas composite preview, overrides downloadQR for framed output

'use strict';

/* ══ Frame State ═════════════════════════════ */
const FrameState = {
  type:     'none',
  color:    '#4f46e5',
  text:     'SCAN ME',
  fontSize: 15,
};

const FRAME_HAS_LABEL = new Set([
  'rect-bottom', 'rect-top', 'rounded-bottom', 'banner-top', 'banner-bottom',
]);

/* ══ Init Frame Panel ════════════════════════ */
function initFramePanel() {
  const body = document.getElementById('framePanelBody');
  if (!body) return;

  body.innerHTML = `
    <div class="qr-frame-grid" id="frameGrid">

      <label class="qr-frame-item qr-frame-item--active">
        <input type="radio" name="qrFrame" value="none" checked>
        <div class="qr-frame-preview">
          <div class="qr-frame-qr-mock"></div>
        </div>
        <span class="qr-frame-label">无边框</span>
      </label>

      <label class="qr-frame-item">
        <input type="radio" name="qrFrame" value="rect-bottom">
        <div class="qr-frame-preview qr-frame-preview--bordered">
          <div class="qr-frame-qr-mock"></div>
          <div class="qr-frame-mock-label">SCAN ME</div>
        </div>
        <span class="qr-frame-label">底部文字</span>
      </label>

      <label class="qr-frame-item">
        <input type="radio" name="qrFrame" value="rect-top">
        <div class="qr-frame-preview qr-frame-preview--bordered">
          <div class="qr-frame-mock-label">SCAN ME</div>
          <div class="qr-frame-qr-mock"></div>
        </div>
        <span class="qr-frame-label">顶部文字</span>
      </label>

      <label class="qr-frame-item">
        <input type="radio" name="qrFrame" value="rounded-bottom">
        <div class="qr-frame-preview qr-frame-preview--rounded">
          <div class="qr-frame-qr-mock"></div>
          <div class="qr-frame-mock-label">SCAN ME</div>
        </div>
        <span class="qr-frame-label">圆角底字</span>
      </label>

      <label class="qr-frame-item">
        <input type="radio" name="qrFrame" value="bubble">
        <div class="qr-frame-preview qr-frame-preview--bubble">
          <div class="qr-frame-qr-mock"></div>
          <div class="qr-frame-bubble-tail"></div>
        </div>
        <span class="qr-frame-label">气泡框</span>
      </label>

      <label class="qr-frame-item">
        <input type="radio" name="qrFrame" value="banner-top">
        <div class="qr-frame-preview qr-frame-preview--banner">
          <div class="qr-frame-mock-banner">SCAN ME</div>
          <div class="qr-frame-qr-mock"></div>
        </div>
        <span class="qr-frame-label">彩色顶条</span>
      </label>

      <label class="qr-frame-item">
        <input type="radio" name="qrFrame" value="banner-bottom">
        <div class="qr-frame-preview qr-frame-preview--banner">
          <div class="qr-frame-qr-mock"></div>
          <div class="qr-frame-mock-banner">SCAN ME</div>
        </div>
        <span class="qr-frame-label">彩色底条</span>
      </label>

      <label class="qr-frame-item">
        <input type="radio" name="qrFrame" value="double-border">
        <div class="qr-frame-preview qr-frame-preview--double">
          <div class="qr-frame-qr-mock"></div>
        </div>
        <span class="qr-frame-label">双线边框</span>
      </label>

    </div>

    <div class="qr-frame-opts" id="frameOpts" style="display:none">
      <div class="qr-option-row">
        <label class="qr-option-label">边框颜色</label>
        <div class="qr-color-picker-mini">
          <input type="color" id="frameColor" value="#4f46e5"
                 oninput="onFrameColorChange(this.value)">
          <input type="text" id="frameColorHex" value="#4f46e5" maxlength="7"
                 class="qr-hex-input" oninput="onFrameHexInput(this.value)">
        </div>
      </div>
      <div class="qr-option-row" id="frameLabelRow">
        <label class="qr-option-label">标签文字</label>
        <input type="text" id="frameText" value="SCAN ME" maxlength="20"
               class="qr-input" placeholder="SCAN ME"
               oninput="onFrameTextChange(this.value)">
      </div>
      <div class="qr-option-row" id="frameFontRow">
        <label class="qr-option-label">字号</label>
        <div class="qr-slider-row">
          <input type="range" id="frameFontSize" min="10" max="28" value="15" step="1"
                 oninput="onFrameFontSizeChange(this.value)" class="qr-slider">
          <span class="qr-slider-val" id="frameFontSizeVal">15</span>px
        </div>
      </div>
    </div>
  `;

  // Inject composite canvas into preview area
  const canvasWrap = document.getElementById('qrCanvasWrap');
  if (canvasWrap && !document.getElementById('frameCanvas')) {
    const fc = document.createElement('canvas');
    fc.id = 'frameCanvas';
    fc.style.cssText = 'display:none;max-width:100%;border-radius:8px;';
    canvasWrap.appendChild(fc);
  }

  document.querySelectorAll('input[name="qrFrame"]').forEach(r => {
    r.addEventListener('change', () => onFrameChange(r.value));
  });
}

/* ══ Frame Events ════════════════════════════ */
function onFrameChange(type) {
  FrameState.type = type;

  document.querySelectorAll('.qr-frame-item').forEach(el =>
    el.classList.toggle('qr-frame-item--active',
      el.querySelector('input')?.value === type)
  );

  const opts = document.getElementById('frameOpts');
  if (opts) opts.style.display = type !== 'none' ? 'flex' : 'none';

  const hasLabel = FRAME_HAS_LABEL.has(type);
  const lr = document.getElementById('frameLabelRow');
  const fr = document.getElementById('frameFontRow');
  if (lr) lr.style.display = hasLabel ? '' : 'none';
  if (fr) fr.style.display = hasLabel ? '' : 'none';

  if (typeof QRState !== 'undefined') QRState.design.frame = (type !== 'none');

  renderFrameComposite();
}

function onFrameColorChange(val) {
  FrameState.color = val;
  const hex = document.getElementById('frameColorHex');
  if (hex) hex.value = val;
  if (typeof QRState !== 'undefined' && QRState.hasGenerated) renderFrameComposite();
}

function onFrameHexInput(val) {
  if (/^#[0-9a-fA-F]{6}$/.test(val)) {
    FrameState.color = val;
    const picker = document.getElementById('frameColor');
    if (picker) picker.value = val;
    if (typeof QRState !== 'undefined' && QRState.hasGenerated) renderFrameComposite();
  }
}

function onFrameTextChange(val) {
  FrameState.text = val || 'SCAN ME';
  if (typeof QRState !== 'undefined' && QRState.hasGenerated) renderFrameComposite();
}

function onFrameFontSizeChange(val) {
  FrameState.fontSize = parseInt(val);
  const disp = document.getElementById('frameFontSizeVal');
  if (disp) disp.textContent = val;
  if (typeof QRState !== 'undefined' && QRState.hasGenerated) renderFrameComposite();
}

/* ══ Real-time Composite Preview ════════════ */
function renderFrameComposite() {
  const qrEl = document.getElementById('qrCanvas')?.querySelector('canvas');
  const fc   = document.getElementById('frameCanvas');

  if (FrameState.type === 'none' || !fc) {
    if (qrEl) qrEl.style.display = '';
    if (fc)   fc.style.display   = 'none';
    return;
  }

  if (!qrEl || (typeof QRState !== 'undefined' && !QRState.hasGenerated)) return;

  qrEl.style.display = 'none';
  fc.style.display   = '';

  compositeFrame(fc, qrEl, qrEl.width || 300, FrameState);
}

/* ══ Composite Frame (shared by preview & download) ══ */
function compositeFrame(target, qrSrc, qrSize, fs) {
  const scale   = qrSize / 300;
  const PAD     = Math.round(12 * scale);
  const FONT_PX = Math.round(fs.fontSize * scale);
  const LABEL_H = FRAME_HAS_LABEL.has(fs.type) ? FONT_PX + Math.round(18 * scale) : 0;
  const RADIUS  = Math.round(14 * scale);
  const W       = qrSize + PAD * 2;
  const H       = qrSize + PAD * 2 + LABEL_H;

  target.width  = W;
  target.height = H;
  const ctx = target.getContext('2d');
  ctx.clearRect(0, 0, W, H);

  switch (fs.type) {
    case 'rect-bottom':
      _drawBorderedFrame(ctx, qrSrc, qrSize, PAD, LABEL_H, FONT_PX, W, H, fs, 0, false);
      break;
    case 'rect-top':
      _drawBorderedFrame(ctx, qrSrc, qrSize, PAD, LABEL_H, FONT_PX, W, H, fs, 0, true);
      break;
    case 'rounded-bottom':
      _drawBorderedFrame(ctx, qrSrc, qrSize, PAD, LABEL_H, FONT_PX, W, H, fs, RADIUS, false);
      break;
    case 'bubble':
      _drawBubbleFrame(ctx, qrSrc, qrSize, PAD, W, H, fs, RADIUS);
      break;
    case 'banner-top':
      _drawBannerFrame(ctx, qrSrc, qrSize, PAD, LABEL_H, FONT_PX, W, H, fs, true);
      break;
    case 'banner-bottom':
      _drawBannerFrame(ctx, qrSrc, qrSize, PAD, LABEL_H, FONT_PX, W, H, fs, false);
      break;
    case 'double-border':
      _drawDoubleFrame(ctx, qrSrc, qrSize, PAD, W, H, fs);
      break;
  }
}

function _drawBorderedFrame(ctx, src, qrSize, pad, labelH, fontPx, W, H, fs, radius, top) {
  const lw = Math.max(2, Math.round(qrSize / 100));
  ctx.fillStyle = '#ffffff';
  _roundRectPath(ctx, 0, 0, W, H, radius); ctx.fill();
  ctx.strokeStyle = fs.color; ctx.lineWidth = lw;
  _roundRectPath(ctx, lw / 2, lw / 2, W - lw, H - lw, radius); ctx.stroke();
  const qrY = top ? pad + labelH : pad;
  ctx.drawImage(src, pad, qrY, qrSize, qrSize);
  if (fs.text && FRAME_HAS_LABEL.has(fs.type)) {
    ctx.fillStyle = fs.color;
    ctx.font = `bold ${fontPx}px Arial,sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(fs.text, W / 2, top ? labelH / 2 : qrY + qrSize + labelH / 2);
  }
}

function _drawBubbleFrame(ctx, src, qrSize, pad, W, H, fs, radius) {
  const tailH = Math.round(18 * (qrSize / 300));
  const bodyH = H - tailH;
  const lw    = Math.max(2, Math.round(qrSize / 100));
  ctx.fillStyle = '#ffffff';
  _roundRectPath(ctx, 0, 0, W, bodyH, radius); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(W / 2 - 12, bodyH);
  ctx.lineTo(W / 2, bodyH + tailH);
  ctx.lineTo(W / 2 + 12, bodyH);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = fs.color; ctx.lineWidth = lw;
  _roundRectPath(ctx, lw / 2, lw / 2, W - lw, bodyH - lw / 2, radius); ctx.stroke();
  ctx.drawImage(src, pad, pad, qrSize, qrSize);
}

function _drawBannerFrame(ctx, src, qrSize, pad, bannerH, fontPx, W, H, fs, top) {
  const lw = Math.max(2, Math.round(qrSize / 100));
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
  const bannerY = top ? 0 : H - bannerH;
  ctx.fillStyle = fs.color; ctx.fillRect(0, bannerY, W, bannerH);
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${fontPx}px Arial,sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(fs.text, W / 2, bannerY + bannerH / 2);
  ctx.drawImage(src, pad, top ? bannerH + pad / 2 : pad / 2, qrSize, qrSize);
  ctx.strokeStyle = fs.color; ctx.lineWidth = lw;
  ctx.strokeRect(lw / 2, lw / 2, W - lw, H - lw);
}

function _drawDoubleFrame(ctx, src, qrSize, pad, W, H, fs) {
  const lw1 = Math.max(3, Math.round(qrSize / 80));
  const lw2 = Math.max(1, Math.round(qrSize / 150));
  const gap  = Math.round(6 * (qrSize / 300));
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = fs.color;
  ctx.lineWidth = lw1; ctx.strokeRect(lw1 / 2, lw1 / 2, W - lw1, H - lw1);
  ctx.lineWidth = lw2; ctx.strokeRect(gap, gap, W - gap * 2, H - gap * 2);
  ctx.drawImage(src, pad, pad, qrSize, qrSize);
}

function _roundRectPath(ctx, x, y, w, h, r) {
  r = Math.min(r || 0, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y,     x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x,     y + h, r);
  ctx.arcTo(x,     y + h, x,     y,     r);
  ctx.arcTo(x,     y,     x + w, y,     r);
  ctx.closePath();
}

/* ══ High-res Framed Canvas ══════════════════ */
async function _getHighResWithFrame(size = 2048) {
  const qrCanvas = await getHighResQR(size);
  if (!qrCanvas) return null;
  if (FrameState.type === 'none') return qrCanvas;
  const composite = document.createElement('canvas');
  compositeFrame(composite, qrCanvas, size, FrameState);
  return composite;
}

/* ══ SVG with Frame Wrapper ══════════════════ */
async function _getSVGWithFrame(size = 500) {
  const inner = await getQRSVGString(size);
  if (!inner) return null;
  if (FrameState.type === 'none') return inner;

  const fs      = FrameState;
  const PAD     = 16;
  const FONT    = fs.fontSize;
  const LABEL_H = FRAME_HAS_LABEL.has(fs.type) ? FONT + 18 : 0;
  const W       = size + PAD * 2;
  const H       = size + PAD * 2 + LABEL_H;
  const RADIUS  = (fs.type === 'rounded-bottom' || fs.type === 'bubble') ? 14 : 0;

  const innerBody = inner
    .replace(/<\?xml[^>]*\?>/g, '')
    .replace(/<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '');

  const isBannerTop    = fs.type === 'banner-top';
  const isBannerBottom = fs.type === 'banner-bottom';
  const isBanner       = isBannerTop || isBannerBottom;
  const isTop          = fs.type === 'rect-top' || isBannerTop;

  const bannerEl = isBanner
    ? `<rect x="0" y="${isBannerTop ? 0 : H - LABEL_H}" width="${W}" height="${LABEL_H}" fill="${fs.color}"/>`
    : '';

  const borderEl = `<rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}"
    rx="${RADIUS}" fill="none" stroke="${fs.color}" stroke-width="3"/>`;

  const textEl = FRAME_HAS_LABEL.has(fs.type)
    ? `<text x="${W / 2}"
           y="${isTop ? LABEL_H / 2 + FONT * 0.35 : H - LABEL_H / 2 + FONT * 0.35}"
           font-family="Arial,sans-serif" font-size="${FONT}" font-weight="bold"
           text-anchor="middle" fill="${isBanner ? '#ffffff' : fs.color}"
      >${_xmlEsc(fs.text)}</text>`
    : '';

  const qrY = isTop ? LABEL_H + PAD / 2 : PAD;

  return `<svg xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#ffffff"/>
  ${bannerEl}
  ${borderEl}
  <g transform="translate(${PAD},${qrY})">${innerBody}</g>
  ${textEl}
</svg>`;
}

function _xmlEsc(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ══ Override downloadQR (loaded after engine) ══ */
async function downloadQR(format) {
  if (!QRState.hasGenerated) {
    showToast('请先生成二维码', 'error');
    return;
  }

  const ts  = new Date().toISOString().slice(0, 10);
  const fn  = `qrcode-${ts}`;
  const btn = _dlBtn(format);
  if (btn) { btn.dataset.orig = btn.textContent; btn.textContent = '...'; btn.disabled = true; }

  try {
    switch (format) {

      case 'png': {
        const c = await _getHighResWithFrame(2048);
        if (!c) { showToast('PNG 生成失败', 'error'); break; }
        c.toBlob(b => {
          saveAs(b, `${fn}.png`);
          showToast('PNG 下载成功！', 'success');
        }, 'image/png');
        break;
      }

      case 'jpg': {
        const src = await _getHighResWithFrame(2048);
        if (!src) { showToast('JPG 生成失败', 'error'); break; }
        const out = document.createElement('canvas');
        out.width = src.width; out.height = src.height;
        const ctx = out.getContext('2d');
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, out.width, out.height);
        ctx.drawImage(src, 0, 0);
        out.toBlob(b => {
          saveAs(b, `${fn}.jpg`);
          showToast('JPG 下载成功！', 'success');
        }, 'image/jpeg', 0.92);
        break;
      }

      case 'svg': {
        const svg = await _getSVGWithFrame(500);
        if (!svg) { showToast('SVG 生成失败', 'error'); break; }
        saveAs(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }), `${fn}.svg`);
        showToast('SVG 下载成功！', 'success');
        break;
      }

      case 'eps': {
        const svg = await _getSVGWithFrame(500);
        if (!svg) { showToast('EPS 生成失败', 'error'); break; }
        const resp = await fetch('/media/qr/api/eps', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ svg }),
        });
        if (!resp.ok) { showToast('EPS 生成失败，请稍后重试', 'error'); break; }
        saveAs(await resp.blob(), `${fn}.eps`);
        showToast('EPS 下载成功！', 'success');
        break;
      }

      default:
        showToast('不支持的格式', 'error');
    }
  } catch (e) {
    showToast(`下载失败：${e.message}`, 'error');
  } finally {
    if (btn) { btn.textContent = btn.dataset.orig || format.toUpperCase(); btn.disabled = false; }
  }
}

function _dlBtn(format) {
  if (format === 'png') return document.querySelector('.qr-btn-download-primary');
  return [...document.querySelectorAll('.qr-btn-format')]
    .find(b => b.textContent.trim().toLowerCase() === format) || null;
}

document.addEventListener('DOMContentLoaded', initFramePanel);

