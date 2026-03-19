# Block QR-05 · 二维码生成工具 — 设计定制面板

> **文件**：`/static/js/media-qr-design.js` + CSS 追加  
> **预估工时**：3h  
> **依赖**：QR-04（引擎）  
> **交付粒度**：颜色选择器（含渐变）、6 种 Dot 形状、3 种角落方块、2 种角落点、Logo 上传、边距滑块、纠错级别

---

## 1. 竞品分析

| 设计项 | 竞品 | 本次实现 | 差异化 |
|--------|------|---------|------|
| 前景色 | ✅ 颜色选择器 | ✅ input[type=color] + Hex 输入 | — |
| 背景色 | ✅ | ✅ + 透明背景选项 | 透明背景免费 |
| 渐变色 | ✅ Pro 功能 | ✅ **免费** 线性/径向 | 核心差异 |
| Dot 形状 | ✅ 6 种 | ✅ 6 种可视化选择 | — |
| 角落形状 | ✅ | ✅ 方块 + 点各 2/3 种 | — |
| Logo | ✅ Pro 功能 | ✅ **免费** 上传 + 大小调节 | 核心差异 |
| 边距 | ✅ | ✅ 滑块 0~50px | — |
| 纠错级别 | ✅ | ✅ L/M/Q/H 四选一 | — |

---

## 2. 设计面板初始化 JS（`/static/js/media-qr-design.js`）

```javascript
// /static/js/media-qr-design.js
'use strict';

/* ══════════════════════════════════════════════
   初始化设计面板（向 designPanelBody 注入 HTML）
════════════════════════════════════════════════ */
function initDesignPanel() {
  const body = document.getElementById('designPanelBody');
  if (!body) return;

  body.innerHTML = `

    <!-- ── 颜色部分 ──────────────────────── -->
    <div class="qr-design-section">
      <h4 class="qr-design-section-title">颜色</h4>

      <!-- 渐变/纯色切换 -->
      <div class="qr-gradient-toggle">
        <label class="qr-radio-pill">
          <input type="radio" name="colorMode" value="solid" checked onchange="onColorModeChange('solid')">
          <span>纯色</span>
        </label>
        <label class="qr-radio-pill">
          <input type="radio" name="colorMode" value="linear" onchange="onColorModeChange('linear')">
          <span>线性渐变</span>
        </label>
        <label class="qr-radio-pill">
          <input type="radio" name="colorMode" value="radial" onchange="onColorModeChange('radial')">
          <span>径向渐变</span>
        </label>
      </div>

      <!-- 纯色模式 -->
      <div id="solidColorRow" class="qr-color-row">
        <div class="qr-color-item">
          <label class="qr-color-label">前景色</label>
          <div class="qr-color-pick">
            <input type="color" id="fgColorPicker" value="#000000"
                   oninput="onFgColorChange(this.value)">
            <input type="text"  id="fgColorHex"    value="#000000" maxlength="7"
                   class="qr-hex-input" oninput="onFgHexInput(this.value)">
          </div>
        </div>
        <div class="qr-color-item">
          <label class="qr-color-label">背景色</label>
          <div class="qr-color-pick">
            <input type="color" id="bgColorPicker" value="#ffffff"
                   oninput="onBgColorChange(this.value)">
            <input type="text"  id="bgColorHex"    value="#ffffff" maxlength="7"
                   class="qr-hex-input" oninput="onBgHexInput(this.value)">
          </div>
          <label class="qr-form-checkbox" style="margin-top:6px">
            <input type="checkbox" id="bgTransparent" onchange="onBgTransparentChange(this.checked)">
            <span style="font-size:0.75rem">透明背景（PNG/SVG）</span>
          </label>
        </div>
      </div>

      <!-- 渐变色模式 -->
      <div id="gradientColorRow" class="qr-color-row" style="display:none">
        <div class="qr-color-item">
          <label class="qr-color-label">渐变色 1</label>
          <div class="qr-color-pick">
            <input type="color" id="gradColor1" value="#4f46e5"
                   oninput="onGradientChange()">
            <input type="text"  id="gradHex1"   value="#4f46e5" maxlength="7"
                   class="qr-hex-input" oninput="onGradHexInput(1, this.value)">
          </div>
        </div>
        <div class="qr-color-item">
          <label class="qr-color-label">渐变色 2</label>
          <div class="qr-color-pick">
            <input type="color" id="gradColor2" value="#06b6d4"
                   oninput="onGradientChange()">
            <input type="text"  id="gradHex2"   value="#06b6d4" maxlength="7"
                   class="qr-hex-input" oninput="onGradHexInput(2, this.value)">
          </div>
        </div>
        <!-- 渐变预设 -->
        <div class="qr-gradient-presets">
          <span class="qr-design-sublabel">预设</span>
          <div class="qr-gradient-preset-list">
            ${GRADIENT_PRESETS.map((p, i) => `
              <button class="qr-gradient-preset"
                      style="background: linear-gradient(135deg, ${p.c1}, ${p.c2})"
                      onclick="applyGradientPreset(${i})"
                      title="${p.c1} → ${p.c2}"></button>
            `).join('')}
          </div>
        </div>
      </div>
    </div>

    <!-- ── Dot 形状 ────────────────────────── -->
    <div class="qr-design-section">
      <h4 class="qr-design-section-title">点形状</h4>
      <div class="qr-dot-grid" id="dotStyleGrid">
        ${DOT_STYLES.map(s => `
          <button class="qr-dot-btn ${s.value === 'rounded' ? 'active' : ''}"
                  data-value="${s.value}"
                  onclick="onDotStyleChange('${s.value}', this)"
                  title="${s.label}">
            <canvas class="qr-dot-preview" width="48" height="48"
                    data-style="${s.value}"></canvas>
            <span>${s.label}</span>
          </button>
        `).join('')}
      </div>
    </div>

    <!-- ── 角落形状 ────────────────────────── -->
    <div class="qr-design-section">
      <h4 class="qr-design-section-title">角落形状</h4>
      <div class="qr-corner-row">
        <div class="qr-corner-group">
          <label class="qr-design-sublabel">外框</label>
          <div class="qr-corner-options">
            ${CORNER_SQUARE_STYLES.map(s => `
              <button class="qr-corner-btn ${s.value === 'extra-rounded' ? 'active' : ''}"
                      data-value="${s.value}"
                      onclick="onCornerSquareChange('${s.value}', this)"
                      title="${s.label}">
                <span class="qr-corner-preview qr-corner-preview--sq-${s.value}"></span>
                <span>${s.label}</span>
              </button>
            `).join('')}
          </div>
        </div>
        <div class="qr-corner-group">
          <label class="qr-design-sublabel">内点</label>
          <div class="qr-corner-options">
            ${CORNER_DOT_STYLES.map(s => `
              <button class="qr-corner-btn ${s.value === 'dot' ? 'active' : ''}"
                      data-value="${s.value}"
                      onclick="onCornerDotChange('${s.value}', this)"
                      title="${s.label}">
                <span class="qr-corner-preview qr-corner-preview--dot-${s.value}"></span>
                <span>${s.label}</span>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    </div>

    <!-- ── Logo ──────────────────────────────── -->
    <div class="qr-design-section">
      <h4 class="qr-design-section-title">Logo</h4>
      <div class="qr-logo-upload-area" id="logoUploadArea" onclick="triggerLogoUpload()">
        <div id="logoEmpty">
          <span class="qr-logo-upload-icon">🖼️</span>
          <p>点击上传 Logo（JPG/PNG/SVG，≤ 2MB）</p>
        </div>
        <div id="logoPreview" style="display:none">
          <img id="logoPreviewImg" alt="Logo" style="max-width:80px;max-height:80px;border-radius:8px;">
          <button class="qr-logo-remove" onclick="removeLogo(event)" title="移除 Logo">✕</button>
        </div>
        <input type="file" id="logoFileInput" accept="image/jpeg,image/png,image/svg+xml,image/webp"
               style="display:none" onchange="onLogoFileSelect(this)">
      </div>

      <!-- Logo 大小滑块（有 Logo 时显示）-->
      <div id="logoSizeRow" style="display:none;margin-top:12px">
        <div class="qr-slider-row">
          <label class="qr-design-sublabel">Logo 大小</label>
          <span class="qr-slider-value" id="logoSizeValue">30%</span>
        </div>
        <input type="range" id="logoSizeSlider" min="10" max="40" value="30" step="5"
               class="qr-slider" oninput="onLogoSizeChange(this.value)">
        <p style="font-size:0.7rem;color:#a8a49e;margin-top:4px">
          ⚠️ Logo 较大时请提高纠错级别至 Q 或 H
        </p>
      </div>
    </div>

    <!-- ── 高级选项 ────────────────────────── -->
    <div class="qr-design-section">
      <h4 class="qr-design-section-title">高级</h4>

      <!-- 边距 -->
      <div class="qr-slider-row">
        <label class="qr-design-sublabel">边距</label>
        <span class="qr-slider-value" id="marginValue">16px</span>
      </div>
      <input type="range" id="marginSlider" min="0" max="50" value="16" step="2"
             class="qr-slider" oninput="onMarginChange(this.value)">

      <!-- 纠错级别 -->
      <div style="margin-top:16px">
        <label class="qr-design-sublabel" style="display:block;margin-bottom:8px">
          纠错级别
        </label>
        <div class="qr-ec-options">
          ${EC_LEVELS.map(l => `
            <label class="qr-ec-option ${l.value === 'M' ? 'active' : ''}">
              <input type="radio" name="ecLevel" value="${l.value}"
                     ${l.value === 'M' ? 'checked' : ''}
                     onchange="onEcLevelChange('${l.value}', this.closest('.qr-ec-option')}">
              <strong>${l.value}</strong>
              <span>${l.pct}</span>
            </label>
          `).join('')}
        </div>
        <p class="qr-form-hint" style="margin-top:6px">
          级别越高容错越强，二维码越复杂。含 Logo 时建议 Q 或 H。
        </p>
      </div>
    </div>
  `;

  // 渲染 Dot 形状小预览
  renderDotPreviews();
}

/* ══════════════════════════════════════════════
   常量配置
════════════════════════════════════════════════ */
const DOT_STYLES = [
  { value: 'square',         label: '方形' },
  { value: 'rounded',        label: '圆角' },
  { value: 'dots',           label: '圆点' },
  { value: 'classy',         label: '优雅' },
  { value: 'classy-rounded', label: '优雅圆' },
  { value: 'extra-rounded',  label: '超圆' },
];

const CORNER_SQUARE_STYLES = [
  { value: 'square',        label: '方形' },
  { value: 'extra-rounded', label: '圆角' },
  { value: 'dot',           label: '圆形' },
];

const CORNER_DOT_STYLES = [
  { value: 'square', label: '方形' },
  { value: 'dot',    label: '圆点' },
];

const EC_LEVELS = [
  { value: 'L', pct: '7%',  label: '低容错' },
  { value: 'M', pct: '15%', label: '推荐' },
  { value: 'Q', pct: '25%', label: '含Logo' },
  { value: 'H', pct: '30%', label: '高容错' },
];

const GRADIENT_PRESETS = [
  { c1: '#4f46e5', c2: '#06b6d4' }, // 靛蓝 → 青色
  { c1: '#f59e0b', c2: '#ef4444' }, // 橙 → 红
  { c1: '#10b981', c2: '#3b82f6' }, // 绿 → 蓝
  { c1: '#8b5cf6', c2: '#ec4899' }, // 紫 → 粉
  { c1: '#f97316', c2: '#facc15' }, // 橙 → 黄
  { c1: '#0f172a', c2: '#475569' }, // 深蓝 → 灰（商务）
];

/* ══════════════════════════════════════════════
   颜色事件处理
════════════════════════════════════════════════ */
function onColorModeChange(mode) {
  const solidRow    = document.getElementById('solidColorRow');
  const gradientRow = document.getElementById('gradientColorRow');

  if (mode === 'solid') {
    solidRow.style.display    = 'flex';
    gradientRow.style.display = 'none';
    QRState.design.gradient   = null;
  } else {
    solidRow.style.display    = 'none';
    gradientRow.style.display = 'flex';
    onGradientChange();
  }
  updatePreview();
}

function onFgColorChange(val) {
  QRState.design.fgColor = val;
  const hex = document.getElementById('fgColorHex');
  if (hex) hex.value = val;
  updatePreview();
}

function onFgHexInput(val) {
  if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
    QRState.design.fgColor = val;
    const picker = document.getElementById('fgColorPicker');
    if (picker) picker.value = val;
    updatePreview();
  }
}

function onBgColorChange(val) {
  QRState.design.bgColor = val;
  const hex = document.getElementById('bgColorHex');
  if (hex) hex.value = val;
  updatePreview();
}

function onBgHexInput(val) {
  if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
    QRState.design.bgColor = val;
    const picker = document.getElementById('bgColorPicker');
    if (picker) picker.value = val;
    updatePreview();
  }
}

function onBgTransparentChange(checked) {
  QRState.design.bgTransparent = checked;
  const bgPicker = document.getElementById('bgColorPicker');
  const bgHex    = document.getElementById('bgColorHex');
  if (bgPicker) bgPicker.disabled = checked;
  if (bgHex)    bgHex.disabled    = checked;
  updatePreview();
}

function onGradientChange() {
  const c1   = document.getElementById('gradColor1')?.value || '#4f46e5';
  const c2   = document.getElementById('gradColor2')?.value || '#06b6d4';
  const mode = document.querySelector('input[name="colorMode"]:checked')?.value || 'linear';

  QRState.design.gradient = { type: mode === 'radial' ? 'radial' : 'linear', color1: c1, color2: c2 };
  updatePreview();
}

function onGradHexInput(idx, val) {
  if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
    const picker = document.getElementById(`gradColor${idx}`);
    if (picker) picker.value = val;
    onGradientChange();
  }
}

function applyGradientPreset(idx) {
  const preset = GRADIENT_PRESETS[idx];
  if (!preset) return;
  const c1 = document.getElementById('gradColor1');
  const c2 = document.getElementById('gradColor2');
  const h1 = document.getElementById('gradHex1');
  const h2 = document.getElementById('gradHex2');
  if (c1) c1.value = preset.c1;
  if (c2) c2.value = preset.c2;
  if (h1) h1.value = preset.c1;
  if (h2) h2.value = preset.c2;
  onGradientChange();
}

/* ══════════════════════════════════════════════
   形状事件处理
════════════════════════════════════════════════ */
function onDotStyleChange(val, btn) {
  QRState.design.dotStyle = val;
  document.querySelectorAll('.qr-dot-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  updatePreview();
}

function onCornerSquareChange(val, btn) {
  QRState.design.cornerSquare = val;
  document.querySelectorAll('[data-corner="square"]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  updatePreview();
}

function onCornerDotChange(val, btn) {
  QRState.design.cornerDot = val;
  document.querySelectorAll('[data-corner="dot"]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  updatePreview();
}

/* ══════════════════════════════════════════════
   Logo 事件处理
════════════════════════════════════════════════ */
function triggerLogoUpload() {
  document.getElementById('logoFileInput')?.click();
}

function onLogoFileSelect(input) {
  const file = input.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    showToast('Logo 图片不能超过 2MB', 'error'); return;
  }

  const reader = new FileReader();
  reader.onload = e => {
    const dataUrl = e.target.result;
    QRState.design.logoUrl = dataUrl;

    // 显示预览
    const previewImg = document.getElementById('logoPreviewImg');
    const emptyDiv   = document.getElementById('logoEmpty');
    const prevDiv    = document.getElementById('logoPreview');
    const sizeRow    = document.getElementById('logoSizeRow');

    if (previewImg) previewImg.src = dataUrl;
    if (emptyDiv)   emptyDiv.style.display  = 'none';
    if (prevDiv)    prevDiv.style.display   = 'flex';
    if (sizeRow)    sizeRow.style.display   = 'block';

    // Logo 时自动建议提升纠错级别
    if (['L', 'M'].includes(QRState.design.ecLevel)) {
      setEcLevel('Q');
      showToast('已自动提升纠错级别至 Q（适合含 Logo 的二维码）', 'info');
    }

    updatePreview();
  };
  reader.readAsDataURL(file);
  input.value = '';
}

function removeLogo(e) {
  e.stopPropagation();
  QRState.design.logoUrl = null;

  const emptyDiv = document.getElementById('logoEmpty');
  const prevDiv  = document.getElementById('logoPreview');
  const sizeRow  = document.getElementById('logoSizeRow');

  if (emptyDiv) emptyDiv.style.display = 'block';
  if (prevDiv)  prevDiv.style.display  = 'none';
  if (sizeRow)  sizeRow.style.display  = 'none';

  updatePreview();
}

function onLogoSizeChange(val) {
  QRState.design.logoSize = parseInt(val) / 100;
  const valueEl = document.getElementById('logoSizeValue');
  if (valueEl) valueEl.textContent = `${val}%`;
  updatePreview();
}

/* ══════════════════════════════════════════════
   高级选项事件处理
════════════════════════════════════════════════ */
function onMarginChange(val) {
  QRState.design.margin = parseInt(val);
  const valueEl = document.getElementById('marginValue');
  if (valueEl) valueEl.textContent = `${val}px`;
  updatePreview();
}

function onEcLevelChange(val, labelEl) {
  QRState.design.ecLevel = val;
  document.querySelectorAll('.qr-ec-option').forEach(l => l.classList.remove('active'));
  if (labelEl) labelEl.classList.add('active');
  updatePreview();
}

function setEcLevel(val) {
  QRState.design.ecLevel = val;
  document.querySelectorAll('input[name="ecLevel"]').forEach(r => {
    r.checked = r.value === val;
    r.closest('.qr-ec-option')?.classList.toggle('active', r.value === val);
  });
}

/* ══════════════════════════════════════════════
   Dot 形状小预览渲染（用 Canvas 绘制示意图）
════════════════════════════════════════════════ */
function renderDotPreviews() {
  document.querySelectorAll('.qr-dot-preview').forEach(canvas => {
    const style = canvas.dataset.style;
    const ctx   = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#1a1a1a';

    // 绘制 3×3 点阵示意
    const dotSize = 10;
    const gap     = 5;
    const startX  = (w - 3 * dotSize - 2 * gap) / 2;
    const startY  = (h - 3 * dotSize - 2 * gap) / 2;

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const x = startX + c * (dotSize + gap);
        const y = startY + r * (dotSize + gap);
        drawDot(ctx, x, y, dotSize, style);
      }
    }
  });
}

function drawDot(ctx, x, y, size, style) {
  ctx.beginPath();
  const r = size / 2;
  const cx = x + r, cy = y + r;

  switch (style) {
    case 'square':
      ctx.rect(x, y, size, size);
      break;
    case 'rounded':
      ctx.roundRect(x, y, size, size, r * 0.4);
      break;
    case 'dots':
    case 'dot':
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      break;
    case 'classy':
      ctx.moveTo(x + r * 0.6, y);
      ctx.lineTo(x + size, y);
      ctx.lineTo(x + size, y + size - r * 0.6);
      ctx.arc(x + size - r * 0.6, y + size - r * 0.6, r * 0.6, 0, Math.PI / 2);
      ctx.lineTo(x, y + size);
      ctx.lineTo(x, y + r * 0.6);
      ctx.arc(x + r * 0.6, y + r * 0.6, r * 0.6, Math.PI, Math.PI * 1.5);
      ctx.closePath();
      break;
    case 'classy-rounded':
      ctx.roundRect(x, y, size, size, r * 0.5);
      break;
    case 'extra-rounded':
      ctx.arc(cx, cy, r * 0.95, 0, Math.PI * 2);
      break;
    default:
      ctx.rect(x, y, size, size);
  }
  ctx.fill();
}
```

---

## 3. 设计面板 CSS（追加到 `media-qr.css`）

```css
/* ── 设计面板通用 ──────────────────────────── */
.qr-design-section {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--qr-border);
}

.qr-design-section:last-child { border-bottom: none; margin-bottom: 0; }

.qr-design-section-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--qr-text);
  margin-bottom: 12px;
}

.qr-design-sublabel {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--qr-text-muted);
}

/* 渐变/纯色切换 */
.qr-gradient-toggle {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.qr-radio-pill input[type="radio"] { display: none; }

.qr-radio-pill span {
  display: block;
  padding: 5px 14px;
  border: 1.5px solid var(--qr-border);
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--qr-text-muted);
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
  user-select: none;
}

.qr-radio-pill input:checked + span {
  border-color: var(--qr-indigo);
  color: var(--qr-indigo);
  background: var(--qr-indigo-light);
}

/* 颜色行 */
.qr-color-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.qr-color-item {
  flex: 1;
  min-width: 120px;
}

.qr-color-label {
  font-size: 0.8125rem;
  color: var(--qr-text-muted);
  margin-bottom: 6px;
  display: block;
}

.qr-color-pick {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qr-color-pick input[type="color"] {
  width: 40px;
  height: 36px;
  border: 1.5px solid var(--qr-border);
  border-radius: 8px;
  cursor: pointer;
  padding: 2px;
  background: var(--qr-surface);
}

.qr-hex-input {
  flex: 1;
  height: 36px;
  padding: 0 10px;
  border: 1.5px solid var(--qr-border);
  border-radius: 8px;
  font-size: 0.875rem;
  font-family: monospace;
  color: var(--qr-text);
  background: var(--qr-surface);
  outline: none;
}

.qr-hex-input:focus { border-color: var(--qr-indigo); }

/* 渐变预设 */
.qr-gradient-presets { margin-top: 12px; }

.qr-gradient-preset-list {
  display: flex;
  gap: 8px;
  margin-top: 6px;
  flex-wrap: wrap;
}

.qr-gradient-preset {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.15s, border-color 0.15s;
}

.qr-gradient-preset:hover { transform: scale(1.2); border-color: var(--qr-indigo); }

/* Dot 形状网格 */
.qr-dot-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.qr-dot-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 10px 6px 8px;
  background: var(--qr-surface);
  border: 1.5px solid var(--qr-border);
  border-radius: var(--qr-radius-sm);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.qr-dot-btn:hover {
  border-color: var(--qr-indigo);
  background: var(--qr-indigo-light);
}

.qr-dot-btn.active {
  border-color: var(--qr-indigo);
  background: var(--qr-indigo-light);
  box-shadow: 0 0 0 3px rgba(79,70,229,0.12);
}

.qr-dot-btn canvas { display: block; }

.qr-dot-btn span {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--qr-text-muted);
}

/* 角落形状 */
.qr-corner-row {
  display: flex;
  gap: 20px;
}

.qr-corner-group { flex: 1; }

.qr-corner-options {
  display: flex;
  gap: 6px;
  margin-top: 6px;
  flex-wrap: wrap;
}

.qr-corner-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 10px;
  background: var(--qr-surface);
  border: 1.5px solid var(--qr-border);
  border-radius: var(--qr-radius-sm);
  cursor: pointer;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--qr-text-muted);
  transition: border-color 0.15s, background 0.15s;
}

.qr-corner-btn.active {
  border-color: var(--qr-indigo);
  background: var(--qr-indigo-light);
  color: var(--qr-indigo);
}

.qr-corner-preview {
  display: block;
  width: 24px;
  height: 24px;
  border: 3px solid currentColor;
}

.qr-corner-preview--sq-square      { border-radius: 0; }
.qr-corner-preview--sq-extra-rounded { border-radius: 8px; }
.qr-corner-preview--sq-dot         { border-radius: 50%; }
.qr-corner-preview--dot-square     { border-radius: 0; background: currentColor; transform: scale(0.5); }
.qr-corner-preview--dot-dot        { border-radius: 50%; background: currentColor; transform: scale(0.5); border: none; }

/* Logo 上传区 */
.qr-logo-upload-area {
  border: 2px dashed var(--qr-border);
  border-radius: var(--qr-radius-sm);
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  min-height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-logo-upload-area:hover {
  border-color: var(--qr-indigo);
  background: var(--qr-indigo-light);
}

.qr-logo-upload-icon { font-size: 1.5rem; display: block; margin-bottom: 6px; }

#logoEmpty p { font-size: 0.8125rem; color: var(--qr-text-muted); }

#logoPreview {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.qr-logo-remove {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 22px;
  height: 22px;
  background: #dc2626;
  color: #fff;
  border: none;
  border-radius: 50%;
  font-size: 0.7rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 滑块 */
.qr-slider-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.qr-slider-value {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--qr-indigo);
  min-width: 40px;
  text-align: right;
}

.qr-slider {
  width: 100%;
  -webkit-appearance: none;
  height: 6px;
  border-radius: 999px;
  background: #e8e4dc;
  outline: none;
  cursor: pointer;
}

.qr-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--qr-surface);
  border: 3px solid var(--qr-indigo);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(79,70,229,0.25);
}

/* 纠错级别 */
.qr-ec-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.qr-ec-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  border: 1.5px solid var(--qr-border);
  border-radius: var(--qr-radius-sm);
  cursor: pointer;
  font-size: 0.7rem;
  color: var(--qr-text-muted);
  transition: border-color 0.15s, background 0.15s;
  text-align: center;
  user-select: none;
}

.qr-ec-option input[type="radio"] { display: none; }

.qr-ec-option strong {
  font-size: 1rem;
  font-weight: 800;
  color: var(--qr-text);
  display: block;
  margin-bottom: 2px;
}

.qr-ec-option.active {
  border-color: var(--qr-indigo);
  background: var(--qr-indigo-light);
}

.qr-ec-option.active strong { color: var(--qr-indigo); }
```

---

## 4. 验收标准

- [ ] 颜色选择器：拖动取色器，Hex 输入框实时同步；手动输入 Hex，取色器颜色同步
- [ ] 渐变色：切换线性/径向，QR 码预览颜色立刻变化；点击预设色板正确应用
- [ ] 透明背景：勾选后背景色取色器 disabled，下载 PNG 时背景透明
- [ ] 6 种 Dot 形状：选中项有蓝色边框高亮，Canvas 预览小图形正确渲染
- [ ] 角落形状：3种外框 + 2种内点，选中状态视觉反馈正确
- [ ] Logo 上传：超过 2MB 提示错误；上传成功显示预览图 + 移除按钮；上传后自动提升纠错至 Q
- [ ] Logo 大小滑块：10%~40% 调节，百分比数字实时更新
- [ ] 边距滑块：0~50px 调节，QR 码留白随之变化
- [ ] 纠错级别：L/M/Q/H 四选一，选中有蓝色高亮
