// /static/js/media-qr-engine.js
// Handles: QR code generation, real-time preview, high-res export

'use strict';

/* ══ Global State ════════════════════════════ */
const QRState = {
  qrInstance:   null,
  currentData:  '',
  currentType:  window.QR_TYPE || 'url',
  hasGenerated: false,

  design: {
    fgColor:       '#000000',
    bgColor:       '#ffffff',
    bgTransparent: false,
    gradient:      null,
    dotStyle:      'rounded',
    cornerSquare:  'extra-rounded',
    cornerDot:     'dot',
    logoUrl:       null,
    logoSize:      0.3,
    logoMargin:    5,
    margin:        16,
    ecLevel:       'M',
    frame:         false,
  },
};

/* ══ Main Generate Function ══════════════════ */
function generateQR() {
  const type = (typeof currentType !== 'undefined' ? currentType : null) || window.QR_TYPE || 'url';
  const data = getQRContent(type);
  if (!data) return;

  QRState.currentData = data;
  QRState.currentType = type;

  const btn = document.getElementById('generateBtn');
  const txt = document.getElementById('generateBtnText');
  if (btn) btn.disabled = true;
  if (txt) txt.textContent = '生成中...';

  const config     = buildQRConfig(data, 300);
  const canvasWrap = document.getElementById('qrCanvas');
  const emptyEl    = document.getElementById('previewEmpty');
  const wrapEl     = document.getElementById('qrCanvasWrap');

  try {
    if (!QRState.qrInstance) {
      canvasWrap.innerHTML = '';
      QRState.qrInstance = new QRCodeStyling(config);
      QRState.qrInstance.append(canvasWrap);
    } else {
      QRState.qrInstance.update(config);
    }

    if (emptyEl) emptyEl.style.display = 'none';
    if (wrapEl)  wrapEl.style.display  = 'flex';

    const dlGroup = document.getElementById('downloadGroup');
    const hint    = document.getElementById('scanHint');
    if (dlGroup) dlGroup.style.display = 'flex';
    if (hint)    hint.style.display    = 'block';

    QRState.hasGenerated = true;

    if (QRState.design.frame) {
      setTimeout(renderFrameComposite, 300);
    }
  } catch (err) {
    showToast('生成失败：' + err.message, 'error');
  } finally {
    setTimeout(() => {
      if (btn) btn.disabled = false;
      if (txt) txt.textContent = '生成二维码';
    }, 400);
  }
}

/* ══ Build QRCodeStyling Config ══════════════ */
function buildQRConfig(data, size) {
  const d = QRState.design;

  const config = {
    width:  size,
    height: size,
    data:   data,
    margin: d.margin,
    qrOptions: {
      errorCorrectionLevel: d.ecLevel,
    },
    imageOptions: {
      crossOrigin: 'anonymous',
      margin:      d.logoMargin,
      imageSize:   d.logoSize,
    },
    dotsOptions: {
      type:  d.dotStyle,
      color: d.fgColor,
    },
    cornersSquareOptions: {
      type:  d.cornerSquare,
      color: d.fgColor,
    },
    cornersDotOptions: {
      type:  d.cornerDot,
      color: d.fgColor,
    },
    backgroundOptions: {
      color: d.bgTransparent ? 'rgba(0,0,0,0)' : d.bgColor,
    },
  };

  if (d.gradient) {
    const gradient = {
      type:     d.gradient.type,
      rotation: 45,
      colorStops: [
        { offset: 0, color: d.gradient.color1 },
        { offset: 1, color: d.gradient.color2 },
      ],
    };
    config.dotsOptions.gradient          = gradient;
    config.cornersSquareOptions.gradient = gradient;
    config.cornersDotOptions.gradient    = gradient;
    delete config.dotsOptions.color;
    delete config.cornersSquareOptions.color;
    delete config.cornersDotOptions.color;
  }

  if (d.logoUrl) config.image = d.logoUrl;

  return config;
}

/* ══ Real-time Preview Update ════════════════ */
let updatePreviewTimer = null;

function updatePreview() {
  if (!QRState.qrInstance || !QRState.currentData) return;
  clearTimeout(updatePreviewTimer);
  updatePreviewTimer = setTimeout(() => {
    QRState.qrInstance.update(buildQRConfig(QRState.currentData, 300));
    if (QRState.design.frame) {
      setTimeout(renderFrameComposite, 200);
    }
  }, 100);
}

/* ══ High-res Canvas ═════════════════════════ */
async function getHighResQR(size = 2048) {
  return new Promise((resolve) => {
    const tempDiv = document.createElement('div');
    tempDiv.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:0;height:0;overflow:hidden;';
    document.body.appendChild(tempDiv);

    const highRes = new QRCodeStyling(buildQRConfig(QRState.currentData, size));
    highRes.append(tempDiv);

    setTimeout(() => {
      const canvas = tempDiv.querySelector('canvas');
      document.body.removeChild(tempDiv);
      resolve(canvas || null);
    }, 500);
  });
}

/* ══ SVG String ══════════════════════════════ */
async function getQRSVGString(size = 500) {
  return new Promise((resolve) => {
    const tempDiv = document.createElement('div');
    tempDiv.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:0;height:0;overflow:hidden;';
    document.body.appendChild(tempDiv);

    const svgConfig = { ...buildQRConfig(QRState.currentData, size), type: 'svg' };
    const svgQR = new QRCodeStyling(svgConfig);
    svgQR.append(tempDiv);

    setTimeout(() => {
      const svgEl  = tempDiv.querySelector('svg');
      const svgStr = svgEl ? new XMLSerializer().serializeToString(svgEl) : '';
      document.body.removeChild(tempDiv);
      resolve(svgStr);
    }, 400);
  });
}

/* ══ Download Entry (overridden by QR-06) ════ */
async function downloadQR(format) {
  if (!QRState.hasGenerated) {
    showToast('请先生成二维码', 'error'); return;
  }

  const timestamp = new Date().toISOString().slice(0, 10);
  const filename  = `qrcode-${timestamp}`;

  switch (format) {
    case 'png': await downloadPNG(filename); break;
    case 'jpg': await downloadJPG(filename); break;
    case 'svg': await downloadSVG(filename); break;
    case 'eps': await downloadEPS(filename); break;
    default: showToast('不支持的格式', 'error');
  }
}

async function downloadPNG(filename) {
  const btn = showDownloadLoading('png');
  try {
    const canvas = await getHighResQR(2048);
    if (!canvas) { showToast('PNG 生成失败', 'error'); return; }
    canvas.toBlob(blob => {
      saveAs(blob, `${filename}.png`);
      showToast('PNG 下载成功！', 'success');
    }, 'image/png');
  } finally {
    hideDownloadLoading(btn, 'PNG');
  }
}

async function downloadJPG(filename) {
  const btn = showDownloadLoading('jpg');
  try {
    const srcCanvas = await getHighResQR(2048);
    if (!srcCanvas) { showToast('JPG 生成失败', 'error'); return; }

    const canvas = document.createElement('canvas');
    canvas.width  = srcCanvas.width;
    canvas.height = srcCanvas.height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(srcCanvas, 0, 0);

    canvas.toBlob(blob => {
      saveAs(blob, `${filename}.jpg`);
      showToast('JPG 下载成功！', 'success');
    }, 'image/jpeg', 0.92);
  } finally {
    hideDownloadLoading(btn, 'JPG');
  }
}

async function downloadSVG(filename) {
  const btn = showDownloadLoading('svg');
  try {
    const svgStr = await getQRSVGString(500);
    if (!svgStr) { showToast('SVG 生成失败', 'error'); return; }
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    saveAs(blob, `${filename}.svg`);
    showToast('SVG 下载成功！', 'success');
  } finally {
    hideDownloadLoading(btn, 'SVG');
  }
}

async function downloadEPS(filename) {
  const btn = showDownloadLoading('eps');
  try {
    const svgStr = await getQRSVGString(500);
    if (!svgStr) { showToast('EPS 生成失败', 'error'); return; }

    const resp = await fetch('/media/qr/api/eps', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ svg: svgStr }),
    });

    if (!resp.ok) { showToast('EPS 生成失败，请稍后重试', 'error'); return; }

    const blob = await resp.blob();
    saveAs(blob, `${filename}.eps`);
    showToast('EPS 下载成功！', 'success');
  } catch(e) {
    showToast('EPS 下载失败：' + e.message, 'error');
  } finally {
    hideDownloadLoading(btn, 'EPS');
  }
}

function showDownloadLoading(format) {
  const btn = document.querySelector('.qr-btn-download-primary');
  if (format !== 'png') {
    const btns = document.querySelectorAll('.qr-btn-format');
    const found = [...btns].find(b => b.textContent.trim().toLowerCase() === format.toLowerCase());
    if (found) {
      found.dataset.origText = found.textContent;
      found.textContent = '...';
      found.disabled = true;
      return found;
    }
    return null;
  }
  if (btn) {
    btn.dataset.origText = btn.textContent;
    btn.textContent = '...';
    btn.disabled = true;
  }
  return btn;
}

function hideDownloadLoading(btn, label) {
  if (btn) {
    btn.textContent = btn.dataset.origText || label;
    btn.disabled = false;
  }
}

/* ══ Copy to Clipboard ═══════════════════════ */
async function copyQRImage() {
  if (!QRState.hasGenerated) { showToast('请先生成二维码', 'error'); return; }

  try {
    const canvas = document.getElementById('qrCanvas')?.querySelector('canvas');
    if (!canvas) return;

    canvas.toBlob(async blob => {
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        showToast('已复制到剪贴板！', 'success');
        const btn = document.getElementById('copyBtn');
        if (btn) {
          const orig = btn.textContent;
          btn.textContent = '✅ 已复制';
          setTimeout(() => { btn.textContent = orig; }, 2000);
        }
      } catch(e) {
        saveAs(blob, 'qrcode.png');
        showToast('已为您下载（浏览器不支持复制）', 'info');
      }
    }, 'image/png');
  } catch(e) {
    showToast('复制失败', 'error');
  }
}

