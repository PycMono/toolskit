# Block I-04 · 图片压缩 — 结果列表 UI + Before/After 预览滑块

> **文件**：`/static/js/img-compress-ui.js` + 补充 CSS  
> **预估工时**：2h  
> **依赖**：I-03（引擎）、I-02（页面结构）  
> **交付粒度**：每张图的结果卡片渲染、进度动画、大小对比数字、Before/After 图片滑块对比弹窗、单张下载按钮、整体结果统计

---

## 1. 竞品对标（TinyPNG 结果区）

| 元素 | TinyPNG | 本次实现 | 差异化 |
|------|---------|---------|------|
| 每行布局 | 缩略图 + 文件名 + 节省率 | ✅ 同 + 原始/压缩大小对比 | 更详细 |
| 进度条 | ✅ 处理中显示加载动画 | ✅ 绿色进度条 | — |
| 节省率 | 绿色大字 | ✅ 绿色 + 百分比 badge | — |
| 格式标签 | ❌ | ✅ 显示转换后格式 | 差异化 |
| Before/After | ✅ 滑块对比（独立页面）| ✅ **弹窗内滑块对比** | 差异化 |
| 下载按钮 | ✅ | ✅ | — |
| 错误状态 | 红色提示 | ✅ 红色 + 重试按钮 | — |

---

## 2. UI 渲染 JS（`/static/js/img-compress-ui.js`）

```javascript
// /static/js/img-compress-ui.js
// 负责 DOM 渲染：结果卡片创建 / 状态更新 / Before-After 弹窗

'use strict';

/* ══════════════════════════════════════════════
   渲染新加入的图片（waiting 状态）
════════════════════════════════════════════════ */
function renderNewItems() {
  const list = document.getElementById('resultsList');

  // 找到还没有对应 DOM 的 item
  imageItems.forEach(item => {
    if (document.getElementById(`card-${item.id}`)) return; // 已渲染则跳过

    const card = document.createElement('div');
    card.className = 'ic-result-card';
    card.id        = `card-${item.id}`;

    // 生成原始缩略图预览 URL
    const thumbURL = URL.createObjectURL(item.file);

    card.innerHTML = `
      <!-- 左：缩略图 -->
      <div class="ic-result-card__thumb">
        <img src="${thumbURL}" alt="${escapeHtml(item.file.name)}"
             onload="URL.revokeObjectURL(this.src)">
      </div>

      <!-- 中：文件信息 + 进度 -->
      <div class="ic-result-card__body">
        <p class="ic-result-card__name" title="${escapeHtml(item.file.name)}">
          ${escapeHtml(item.file.name)}
        </p>
        <div class="ic-result-card__meta" id="meta-${item.id}">
          <span class="ic-result-size">
            原始 <strong>${formatBytes(item.originalSize)}</strong>
          </span>
          <span class="ic-result-arrow">→</span>
          <span class="ic-result-size ic-result-size--muted">等待压缩...</span>
        </div>
        <!-- 进度条 -->
        <div class="ic-result-progress" id="progress-${item.id}">
          <div class="ic-result-progress__bar" style="width:0%"></div>
        </div>
      </div>

      <!-- 右：状态徽章 + 操作按钮 -->
      <div class="ic-result-card__actions" id="actions-${item.id}">
        <span class="ic-status-badge ic-status-badge--waiting">等待中</span>
      </div>
    `;

    // 添加时播放进入动画
    card.style.opacity   = '0';
    card.style.transform = 'translateY(12px)';
    list.appendChild(card);

    requestAnimationFrame(() => {
      card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      card.style.opacity    = '1';
      card.style.transform  = 'translateY(0)';
    });
  });
}

/* ══════════════════════════════════════════════
   更新单张卡片 UI
   opts: { status, originalSize, compressedSize, savedPct, objectURL, outputName, error }
════════════════════════════════════════════════ */
function updateItemUI(id, opts) {
  const card = document.getElementById(`card-${id}`);
  if (!card) return;

  const metaEl    = document.getElementById(`meta-${id}`);
  const progressEl= document.getElementById(`progress-${id}`);
  const actionsEl = document.getElementById(`actions-${id}`);
  const item      = imageItems.find(i => i.id === id);

  switch (opts.status) {

    case 'compressing':
      // 进度条动画（伪进度：0 → 85%，完成后跳 100%）
      progressEl.style.display = 'block';
      animateProgress(progressEl.querySelector('.ic-result-progress__bar'));
      actionsEl.innerHTML = `
        <span class="ic-status-badge ic-status-badge--compressing">
          <span class="ic-spinner"></span> 压缩中
        </span>
      `;
      break;

    case 'done': {
      // 停止进度条，跳到 100%
      const bar = progressEl.querySelector('.ic-result-progress__bar');
      bar.style.transition = 'width 0.2s ease';
      bar.style.width      = '100%';
      setTimeout(() => { progressEl.style.display = 'none'; }, 400);

      // 大小对比
      const savedPct = opts.savedPct;
      const bigger   = opts.compressedSize > opts.originalSize;

      // 格式角标（若转换了格式则显示）
      const extBadge = getFormatBadge(opts.outputName, item?.file?.name);

      metaEl.innerHTML = `
        <span class="ic-result-size">
          ${formatBytes(opts.originalSize)}
        </span>
        <span class="ic-result-arrow">→</span>
        <span class="ic-result-size ic-result-size--after">
          ${formatBytes(opts.compressedSize)}
          ${extBadge}
        </span>
        <span class="ic-saved-badge ${bigger ? 'ic-saved-badge--bigger' : ''}">
          ${bigger ? '未压缩' : `-${savedPct}%`}
        </span>
      `;

      // 操作按钮
      actionsEl.innerHTML = `
        <button class="ic-btn-preview"
                onclick="openPreview('${id}')"
                title="对比预览">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          对比
        </button>
        <button class="ic-btn-download-one"
                onclick="downloadOne('${id}')">
          ⬇ 下载
        </button>
        <button class="ic-btn-remove"
                onclick="removeItem('${id}')"
                title="移除">✕</button>
      `;
      break;
    }

    case 'error':
      progressEl.style.display = 'none';
      metaEl.innerHTML = `
        <span class="ic-result-size">
          原始 <strong>${formatBytes(opts.originalSize || item?.originalSize || 0)}</strong>
        </span>
        <span class="ic-error-text">${escapeHtml(opts.error || '压缩失败')}</span>
      `;
      actionsEl.innerHTML = `
        <span class="ic-status-badge ic-status-badge--error">失败</span>
        <button class="ic-btn-retry" onclick="retryItem('${id}')">重试</button>
      `;
      break;
  }
}

/* ══════════════════════════════════════════════
   进度条伪进度动画（0 → 85%，每隔随机间隔递增）
════════════════════════════════════════════════ */
function animateProgress(barEl) {
  let pct = 0;
  barEl.style.width = '0%';

  const tick = () => {
    if (pct >= 85) return;
    const step   = Math.random() * 12 + 3;
    pct          = Math.min(85, pct + step);
    barEl.style.transition = `width ${0.3 + Math.random() * 0.4}s ease`;
    barEl.style.width      = pct + '%';
    setTimeout(tick, 300 + Math.random() * 500);
  };

  setTimeout(tick, 100);
}

/* ══════════════════════════════════════════════
   格式角标（只有转换了格式才显示）
════════════════════════════════════════════════ */
function getFormatBadge(outputName, originalName) {
  if (!outputName || !originalName) return '';
  const outExt  = outputName.split('.').pop()?.toUpperCase();
  const origExt = originalName.split('.').pop()?.toUpperCase();
  if (outExt === origExt) return '';
  return `<span class="ic-fmt-badge">${outExt}</span>`;
}

/* ══════════════════════════════════════════════
   移除单张 & 重试
════════════════════════════════════════════════ */
function removeItem(id) {
  const idx  = imageItems.findIndex(i => i.id === id);
  if (idx === -1) return;

  const item = imageItems[idx];
  if (item.objectURL) URL.revokeObjectURL(item.objectURL);
  imageItems.splice(idx, 1);

  const card = document.getElementById(`card-${id}`);
  if (card) {
    card.style.transition = 'opacity 0.2s, transform 0.2s';
    card.style.opacity    = '0';
    card.style.transform  = 'translateX(20px)';
    setTimeout(() => card.remove(), 220);
  }

  if (imageItems.length === 0) clearAll();
  else updateSummaryStats();
}

async function retryItem(id) {
  const item = imageItems.find(i => i.id === id);
  if (!item) return;
  item.status = 'waiting';
  updateItemUI(id, { status: 'compressing' });
  const opts = getCompressOptions();
  await compressOne(item, opts);
  updateSummaryStats();
}

/* ══════════════════════════════════════════════
   Before / After 滑块对比弹窗
════════════════════════════════════════════════ */
function openPreview(id) {
  const item = imageItems.find(i => i.id === id);
  if (!item || !item.compressedBlob) return;

  // 原图 URL
  const origURL = URL.createObjectURL(item.file);
  // 压缩后 URL（item.objectURL 已创建）
  const compURL = item.objectURL;

  const overlay = document.createElement('div');
  overlay.className = 'ic-preview-overlay';
  overlay.id        = 'previewOverlay';
  overlay.innerHTML = `
    <div class="ic-preview-modal">
      <!-- 标题栏 -->
      <div class="ic-preview-header">
        <h3 class="ic-preview-title">${escapeHtml(item.file.name)}</h3>
        <button class="ic-preview-close" onclick="closePreview()">✕</button>
      </div>

      <!-- 文件大小对比标签 -->
      <div class="ic-preview-labels">
        <div class="ic-preview-label ic-preview-label--before">
          原始 &nbsp;<strong>${formatBytes(item.originalSize)}</strong>
        </div>
        <div class="ic-preview-label ic-preview-label--after">
          压缩后 &nbsp;<strong>${formatBytes(item.compressedSize)}</strong>
          &nbsp;
          <span class="ic-saved-badge">-${item.savedPct}%</span>
        </div>
      </div>

      <!-- 滑块对比容器 -->
      <div class="ic-slider-compare" id="sliderCompare">
        <!-- 压缩后（底层完整显示）-->
        <img class="ic-compare-img ic-compare-img--after"
             src="${compURL}" alt="压缩后">

        <!-- 原图（顶层，clip 控制显示宽度）-->
        <div class="ic-compare-before-wrap" id="beforeWrap"
             style="width: 50%">
          <img class="ic-compare-img ic-compare-img--before"
               src="${origURL}" alt="原始"
               onload="URL.revokeObjectURL(this.src)">
        </div>

        <!-- 分割线 + 拖柄 -->
        <div class="ic-compare-divider" id="compareDivider"
             style="left: 50%">
          <div class="ic-compare-handle">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5">
              <polyline points="15 18 9 12 15 6"/>
              <polyline points="9 18 3 12 9 6" style="transform:translateX(12px)"/>
            </svg>
          </div>
        </div>

        <!-- 标签提示 -->
        <span class="ic-compare-tag ic-compare-tag--before">原始</span>
        <span class="ic-compare-tag ic-compare-tag--after">压缩后</span>
      </div>

      <!-- 底部操作 -->
      <div class="ic-preview-footer">
        <button class="ic-btn-download-one" onclick="downloadOne('${id}'); closePreview()">
          ⬇ 下载压缩版
        </button>
        <button class="ic-preview-close-btn" onclick="closePreview()">关闭</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('ic-preview-overlay--show'));

  // 绑定拖拽事件
  bindSliderEvents();

  // ESC 关闭
  overlay._keyHandler = e => { if (e.key === 'Escape') closePreview(); };
  document.addEventListener('keydown', overlay._keyHandler);
}

function closePreview() {
  const overlay = document.getElementById('previewOverlay');
  if (!overlay) return;
  document.removeEventListener('keydown', overlay._keyHandler);
  overlay.classList.remove('ic-preview-overlay--show');
  setTimeout(() => overlay.remove(), 250);
}

/* ── 滑块拖拽逻辑 ────────────────────────────── */
function bindSliderEvents() {
  const compare  = document.getElementById('sliderCompare');
  const divider  = document.getElementById('compareDivider');
  const beforeWrap = document.getElementById('beforeWrap');
  if (!compare || !divider) return;

  let dragging = false;

  function setPosition(clientX) {
    const rect = compare.getBoundingClientRect();
    let   pct  = ((clientX - rect.left) / rect.width) * 100;
    pct        = Math.max(2, Math.min(98, pct));
    divider.style.left    = pct + '%';
    beforeWrap.style.width = pct + '%';
  }

  // 鼠标
  divider.addEventListener('mousedown', e => { dragging = true; e.preventDefault(); });
  document.addEventListener('mousemove', e => { if (dragging) setPosition(e.clientX); });
  document.addEventListener('mouseup',   () => { dragging = false; });

  // 触摸
  divider.addEventListener('touchstart', e => { dragging = true; e.preventDefault(); });
  document.addEventListener('touchmove',  e => {
    if (dragging) setPosition(e.touches[0].clientX);
  });
  document.addEventListener('touchend',   () => { dragging = false; });

  // 点击对比区域也可直接跳到该位置
  compare.addEventListener('click', e => {
    if (e.target === divider || divider.contains(e.target)) return;
    setPosition(e.clientX);
  });
}

/* ══════════════════════════════════════════════
   工具函数
════════════════════════════════════════════════ */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
```

---

## 3. 结果卡片 + 弹窗 CSS（追加到 `img-compress.css`）

```css
/* ══ 结果卡片 ════════════════════════════════════ */
.ic-result-card {
  display: grid;
  grid-template-columns: 64px 1fr auto;
  gap: 14px;
  align-items: center;
  background: var(--ic-surface);
  border: 1px solid var(--ic-border);
  border-radius: var(--ic-radius-md);
  padding: 14px 16px;
  box-shadow: var(--ic-shadow-sm);
  transition: box-shadow 0.2s;
}

.ic-result-card:hover {
  box-shadow: var(--ic-shadow-md);
}

/* 缩略图 */
.ic-result-card__thumb {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--ic-bg);
  flex-shrink: 0;
  border: 1px solid var(--ic-border);
}

.ic-result-card__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* 文件信息 */
.ic-result-card__body {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ic-result-card__name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--ic-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ic-result-card__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.ic-result-size {
  font-size: 0.8125rem;
  color: var(--ic-text-muted);
}

.ic-result-size strong {
  color: var(--ic-text);
  font-weight: 700;
}

.ic-result-size--after strong { color: var(--ic-green); }
.ic-result-size--muted        { color: #a8a49e; }

.ic-result-arrow {
  font-size: 0.75rem;
  color: #c4bfb8;
}

/* 节省率徽章 */
.ic-saved-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  background: var(--ic-green-light);
  color: var(--ic-green-dark);
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.ic-saved-badge--bigger {
  background: #fef9e7;
  color: #92400e;
}

/* 格式转换角标 */
.ic-fmt-badge {
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  background: #eff6ff;
  color: #1d4ed8;
  border-radius: 999px;
  font-size: 0.6875rem;
  font-weight: 700;
  margin-left: 4px;
}

/* 进度条 */
.ic-result-progress {
  height: 4px;
  background: #eee;
  border-radius: 999px;
  overflow: hidden;
  display: none;
}

.ic-result-progress__bar {
  height: 100%;
  background: linear-gradient(90deg, var(--ic-green), #52c99b);
  border-radius: 999px;
  width: 0%;
}

/* 错误文字 */
.ic-error-text {
  font-size: 0.75rem;
  color: #dc2626;
}

/* ── 状态徽章 ─────────────────────────────────── */
.ic-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.ic-status-badge--waiting    { background: #f3f4f6; color: #6b7280; }
.ic-status-badge--compressing{ background: #eff6ff; color: #2563eb; }
.ic-status-badge--error      { background: #fef2f2; color: #dc2626; }

/* 加载 spinner */
.ic-spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid #93c5fd;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: ic-spin 0.7s linear infinite;
}

@keyframes ic-spin { to { transform: rotate(360deg); } }

/* ── 操作按钮组 ───────────────────────────────── */
.ic-result-card__actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.ic-btn-preview {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 32px;
  padding: 0 12px;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.ic-btn-preview:hover {
  background: var(--ic-green-light);
  border-color: var(--ic-green);
  color: var(--ic-green);
}

.ic-btn-download-one {
  height: 32px;
  padding: 0 14px;
  background: var(--ic-green);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;
  box-shadow: 0 2px 6px rgba(26,155,108,0.25);
}

.ic-btn-download-one:hover { background: var(--ic-green-dark); }

.ic-btn-remove {
  width: 28px;
  height: 28px;
  background: transparent;
  border: 1px solid var(--ic-border);
  border-radius: 50%;
  color: var(--ic-text-muted);
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
}

.ic-btn-remove:hover {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fecaca;
}

.ic-btn-retry {
  height: 30px;
  padding: 0 12px;
  background: #fff7ed;
  color: #c2410c;
  border: 1px solid #fed7aa;
  border-radius: 7px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}

/* 移动端卡片单列 */
@media (max-width: 600px) {
  .ic-result-card {
    grid-template-columns: 48px 1fr;
  }
  .ic-result-card__actions {
    grid-column: 1 / -1;
    justify-content: flex-start;
  }
  .ic-btn-preview { display: none; }
}

/* ══ Before/After 弹窗 ═══════════════════════════ */
.ic-preview-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  opacity: 0;
  transition: opacity 0.25s;
}

.ic-preview-overlay--show { opacity: 1; }

.ic-preview-modal {
  background: var(--ic-surface);
  border-radius: 20px;
  box-shadow: var(--ic-shadow-lg);
  width: 100%;
  max-width: 860px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transform: translateY(20px);
  transition: transform 0.25s;
}

.ic-preview-overlay--show .ic-preview-modal {
  transform: translateY(0);
}

/* 弹窗标题栏 */
.ic-preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--ic-border);
}

.ic-preview-title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--ic-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ic-preview-close {
  width: 32px;
  height: 32px;
  background: #f3f4f6;
  border: none;
  border-radius: 50%;
  font-size: 0.875rem;
  color: #6b7280;
  cursor: pointer;
  transition: background 0.15s;
  flex-shrink: 0;
}

.ic-preview-close:hover { background: #e5e7eb; }

/* 大小对比标签 */
.ic-preview-labels {
  display: flex;
  justify-content: space-between;
  padding: 10px 20px;
  background: #f9fafb;
  border-bottom: 1px solid var(--ic-border);
}

.ic-preview-label {
  font-size: 0.8125rem;
  color: var(--ic-text-muted);
}

.ic-preview-label strong { color: var(--ic-text); }

.ic-preview-label--after strong { color: var(--ic-green); }

/* 滑块对比区域 */
.ic-slider-compare {
  position: relative;
  flex: 1;
  overflow: hidden;
  cursor: ew-resize;
  background: #1a1a1a;
  min-height: 300px;
  max-height: 55vh;
}

.ic-compare-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  user-select: none;
  pointer-events: none;
}

/* 原图层（被 before-wrap clip 截断）*/
.ic-compare-before-wrap {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  overflow: hidden;
  z-index: 2;
}

.ic-compare-before-wrap .ic-compare-img--before {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%; /* 注意：这里 width 100% 相对于 before-wrap 的父容器 */
  min-width: var(--compare-full-width, 860px);
  height: 100%;
}

/* 分割线 */
.ic-compare-divider {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #ffffff;
  z-index: 10;
  transform: translateX(-50%);
  cursor: ew-resize;
  box-shadow: 0 0 8px rgba(0,0,0,0.5);
}

/* 拖柄圆圈 */
.ic-compare-handle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 44px;
  height: 44px;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #374151;
  cursor: ew-resize;
}

/* 标签 */
.ic-compare-tag {
  position: absolute;
  top: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #ffffff;
  z-index: 5;
  pointer-events: none;
  backdrop-filter: blur(4px);
}

.ic-compare-tag--before {
  left: 12px;
  background: rgba(0, 0, 0, 0.5);
}

.ic-compare-tag--after {
  right: 12px;
  background: rgba(26, 155, 108, 0.75);
}

/* 弹窗底部 */
.ic-preview-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--ic-border);
  justify-content: flex-end;
}

.ic-preview-close-btn {
  height: 38px;
  padding: 0 18px;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
  border-radius: 9px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.ic-preview-close-btn:hover { background: #e5e7eb; }

/* 移动端弹窗 */
@media (max-width: 600px) {
  .ic-preview-modal    { border-radius: 14px 14px 0 0; max-height: 95vh; }
  .ic-preview-overlay  { align-items: flex-end; padding: 0; }
  .ic-slider-compare   { min-height: 240px; }
  .ic-compare-handle   { width: 36px; height: 36px; }
}
```

---

## 4. 完整数据流 & 函数调用图

```
onFileSelect / onDrop
    ↓
addFiles(fileList)          ← 校验：格式 / 大小 / 数量 / 重复
    ↓
imageItems.push(item)       ← 状态: waiting
    ↓
renderNewItems()            ← 创建 DOM 卡片（waiting badge）
    ↓
[用户点击「开始压缩」]
    ↓
startCompress()
    ↓ 并行（最多 3 并发）
compressOne(item, opts)
    ├─ updateItemUI(id, {status:'compressing'})  ← 进度条动画
    ├─ canvasCompress() or pngCompress()
    └─ updateItemUI(id, {status:'done', ...})    ← 大小对比 + 下载按钮
    ↓（全部完成）
updateSummaryStats()        ← 头部统计：共节省 X MB（Y%）
showBulkActions()           ← 显示「打包下载全部」按钮

[用户点击「对比」]
    ↓
openPreview(id)             ← 创建弹窗 + Before/After 滑块
bindSliderEvents()          ← 鼠标/触摸拖拽

[用户点击「⬇ 下载」]
    ↓
downloadOne(id)             ← createObjectURL + <a>.click()

[用户点击「打包下载」]
    ↓
downloadAll()               ← JSZip + FileSaver.saveAs()
```

---

## 5. 验收标准

### 压缩功能
- [ ] JPEG 图片压缩后文件变小，画质无明显肉眼差异（quality=80）
- [ ] PNG 图片压缩后体积减小（测试：1MB PNG → 应小于 400KB）
- [ ] WebP 输出：选择「转为 WebP」后下载的文件扩展名为 `.webp`
- [ ] 格式转换：上传 PNG → 选「转为 JPG」→ 下载 `.jpg`，白色背景正常
- [ ] 最大宽度：输入 800，上传 2000px 宽图，压缩后图片宽度 ≤ 800px
- [ ] 20 张图片批量处理，页面不卡死（并发 3 个）

### 结果 UI
- [ ] 每张卡片：缩略图 + 文件名 + 原始大小 → 压缩后大小 + 节省率绿色 badge
- [ ] 压缩中：卡片内显示蓝色进度条动画（0 → 85% 伪进度）
- [ ] 处理完成：进度条消失，显示「对比」+「⬇ 下载」+ 「✕」按钮
- [ ] 若压缩后反而更大：badge 显示「未压缩」黄色，保留原文件供下载
- [ ] 格式转换时：文件名后显示蓝色格式 badge（如 `WEBP`）
- [ ] 「✕」移除按钮：卡片向右滑出消失动画

### Before/After 弹窗
- [ ] 点击「对比」弹窗打开，背景遮罩渐显，弹窗从下方弹入
- [ ] 滑块可拖拽：左侧显示原图，右侧显示压缩后
- [ ] 点击对比区域可直接跳到点击位置
- [ ] 触摸设备（手机）可触摸拖拽滑块
- [ ] ESC 键关闭弹窗，点击遮罩区域关闭

### 批量下载
- [ ] 「打包下载全部」生成 ZIP，包含所有 done 状态图片
- [ ] ZIP 内文件名与原始文件名一致（格式转换时扩展名正确）
- [ ] 打包过程中按钮变灰显示「打包中...」

### 边界情况
- [ ] 上传 GIF：显示 Toast「暂不支持 GIF，请转换为 PNG 后压缩」
- [ ] 上传超过 10MB 文件：Toast 提示，不进入队列
- [ ] 上传超过 20 张：第 21 张显示 Toast 提示，前 20 张正常处理
- [ ] 重复上传同一文件（同名同大小）：静默跳过，不重复添加
- [ ] 压缩失败时显示「失败」红色 badge + 「重试」按钮，点重试重新压缩
