# Block QR-04 · 二维码生成工具 — 前端生成引擎

> **文件**：`/static/js/media-qr-engine.js`  
> **预估工时**：2h  
> **依赖**：qr-code-styling CDN、QR-03（表单编码）  
> **核心原则**：全程浏览器内生成，零服务器交互（EPS 除外）

---

## 1. 技术选型

| 方案 | 优点 | 缺点 | 选择 |
|------|------|------|------|
| `qr-code-styling` | 支持 Dot 形状/颜色/渐变/Logo，输出 Canvas/SVG | 体积约 150KB | ✅ **选用** |
| `qrcode.js` | 轻量 | 不支持自定义样式 | ❌ |
| `node-qrcode` | 功能全 | 需 Node 环境 | ❌ |

---

## 2. 核心引擎代码（`/static/js/media-qr-engine.js`）

```javascript
// /static/js/media-qr-engine.js
// 负责：QR 码生成、实时预览、高清导出

'use strict';

/* ══════════════════════════════════════════════
   全局状态
════════════════════════════════════════════════ */
const QRState = {
  qrInstance:    null,    // QRCodeStyling 实例
  currentData:   '',      // 当前编码内容
  currentType:   window.QR_TYPE || 'url',
  hasGenerated:  false,

  // 设计选项（与 QR-05 设计面板同步）
  design: {
    fgColor:          '#000000',
    bgColor:          '#ffffff',
    bgTransparent:    false,
    gradient:         null,       // null | { type:'linear'|'radial', color1, color2 }
    dotStyle:         'rounded',  // square|rounded|dots|classy|classy-rounded|extra-rounded
    cornerSquare:     'extra-rounded',  // square|extra-rounded|dot
    cornerDot:        'dot',      // square|dot
    logoUrl:          null,       // base64 或 object URL
    logoSize:         0.3,
    logoMargin:       5,
    margin:           16,
    ecLevel:          'M',        // L|M|Q|H
  },
};

/* ══════════════════════════════════════════════
   主生成函数（按钮点击调用）
════════════════════════════════════════════════ */
function generateQR() {
  const type = currentType || window.QR_TYPE || 'url';
  const data = getQRContent(type);
  if (!data) return; // 编码器内部会 showToast 错误

  QRState.currentData = data;
  QRState.currentType = type;

  // UI 状态
  const btn = document.getElementById('generateBtn');
  const txt = document.getElementById('generateBtnText');
  if (btn) btn.disabled = true;
  if (txt) txt.textContent = '生成中...';

  const config = buildQRConfig(data, 300);

  // 挂载容器
  const canvasWrap = document.getElementById('qrCanvas');
  const emptyEl    = document.getElementById('previewEmpty');
  const wrapEl     = document.getElementById('qrCanvasWrap');

  try {
    if (!QRState.qrInstance) {
      // 首次生成
      canvasWrap.innerHTML = '';
      QRState.qrInstance = new QRCodeStyling(config);
      QRState.qrInstance.append(canvasWrap);
    } else {
      // 更新已有实例
      QRState.qrInstance.update(config);
    }

    if (emptyEl) emptyEl.style.display = 'none';
    if (wrapEl)  wrapEl.style.display  = 'flex';

    const dlGroup = document.getElementById('downloadGroup');
    const hint    = document.getElementById('scanHint');
    if (dlGroup) dlGroup.style.display = 'flex';
    if (hint)    hint.style.display    = 'block';

    QRState.hasGenerated = true;

    // 如有边框，延迟合成
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

/* ══════════════════════════════════════════════
   构建 QRCodeStyling 配置对象
════════════════════════════════════════════════ */
function buildQRConfig(data, size) {
  const d = QRState.design;

  const config = {
    width:   size,
    height:  size,
    data:    data,
    margin:  d.margin,
    qrOptions: {
      errorCorrectionLevel: d.ecLevel,
    },
    imageOptions: {
      crossOrigin:   'anonymous',
      margin:        d.logoMargin,
      imageSize:     d.logoSize,
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

  // 渐变色
  if (d.gradient) {
    const gradient = {
      type:      d.gradient.type, // 'linear' | 'radial'
      rotation:  45,
      colorStops: [
        { offset: 0, color: d.gradient.color1 },
        { offset: 1, color: d.gradient.color2 },
      ],
    };
    config.dotsOptions.gradient          = gradient;
    config.cornersSquareOptions.gradient = gradient;
    config.cornersDotOptions.gradient    = gradient;
    // 渐变时清除单色
    delete config.dotsOptions.color;
    delete config.cornersSquareOptions.color;
    delete config.cornersDotOptions.color;
  }

  // Logo
  if (d.logoUrl) {
    config.image = d.logoUrl;
  }

  return config;
}

/* ══════════════════════════════════════════════
   设计变更后实时更新预览
════════════════════════════════════════════════ */
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

/* ══════════════════════════════════════════════
   获取高分辨率 Canvas（用于 PNG/JPG 下载）
════════════════════════════════════════════════ */
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

/* ══════════════════════════════════════════════
   获取 SVG 字符串（用于 SVG 下载 & EPS 后端）
════════════════════════════════════════════════ */
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

/* ══════════════════════════════════════════════
   下载入口（由 QR-06 调用）
════════════════════════════════════════════════ */
async function downloadQR(format) {
  if (!QRState.hasGenerated) {
    showToast('请先生成二维码', 'error'); return;
  }

  const timestamp = new Date().toISOString().slice(0, 10);
  const filename  = `qrcode-${timestamp}`;

  switch (format) {
    case 'png':
      await downloadPNG(filename);
      break;
    case 'jpg':
      await downloadJPG(filename);
      break;
    case 'svg':
      await downloadSVG(filename);
      break;
    case 'eps':
      await downloadEPS(filename);
      break;
    default:
      showToast('不支持的格式', 'error');
  }
}

/* ── PNG 下载（高清 2048px）──────────────────── */
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

/* ── JPG 下载（白底 2048px）─────────────────── */
async function downloadJPG(filename) {
  const btn = showDownloadLoading('jpg');
  try {
    const srcCanvas = await getHighResQR(2048);
    if (!srcCanvas) { showToast('JPG 生成失败', 'error'); return; }

    // 合成白底（JPG 不支持透明）
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

/* ── SVG 下载（矢量，前端）──────────────────── */
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

/* ── EPS 下载（后端转换）───────────────────── */
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

/* ── 下载按钮加载状态 ───────────────────────── */
function showDownloadLoading(format) {
  const btns = document.querySelectorAll('.qr-btn-format');
  const btn  = [...btns].find(b => b.textContent.trim().toLowerCase() === format.toLowerCase());
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

/* ══════════════════════════════════════════════
   复制图片到剪贴板
════════════════════════════════════════════════ */
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
        // 回退到下载
        saveAs(blob, 'qrcode.png');
        showToast('已为您下载（浏览器不支持复制）', 'info');
      }
    }, 'image/png');
  } catch(e) {
    showToast('复制失败', 'error');
  }
}
```

---

## 3. 验收标准

- [ ] 输入 URL 后点击生成，Canvas 区域出现 QR 码（约 300×300px）
- [ ] 修改颜色/形状后调用 `updatePreview()`，预览实时更新（无需重新点击生成）
- [ ] `getHighResQR(2048)` 返回 2048×2048px Canvas，不失真
- [ ] `getQRSVGString()` 返回合法 SVG 字符串，可在浏览器直接打开预览
- [ ] PNG 下载：文件尺寸 ≥ 1MB（2048px 高清）
- [ ] JPG 下载：白色背景，无透明区域
- [ ] SVG 下载：文件可在 Illustrator/Inkscape 中打开并无限缩放
- [ ] EPS 下载：请求发送至 `/media/qr/api/eps`，返回 `.eps` 文件
- [ ] 复制按钮：在 Chrome/Edge 正常复制到剪贴板，不支持时自动下载
- [ ] 生成后 `downloadGroup` 显示，按钮 disabled 状态在生成完成后解除
- [ ] 快速连续点击生成：不崩溃，不重复挂载多个 Canvas
