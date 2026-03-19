# Block A-07 · AI 内容检测器 — 前后端联调 + Loading 状态

> **所属模块**：AI 内容检测器（/ailab/detector）  
> **竞品参考**：https://gptzero.me 检测流程体验  
> **预估工时**：2h  
> **依赖**：A-03（输入区）、A-04（结果面板）、A-05（高亮）、A-06（后端接口）均已完成  
> **交付粒度**：仅负责将前端 UI 与后端接口打通，包含 loading 状态、错误处理、Toast 提示

---

## 1. 完整检测流程

```
用户输入文本
    ↓
点击「检测 AI 内容」按钮
    ↓
[前端] 按钮进入 Loading 状态
    ↓
fetch POST /api/ailab/detect
    ↓
成功 ──→ renderResult(data) [A-04]
      ──→ renderHighlight(data.sentences) [A-05]
      ──→ 按钮恢复正常
失败 ──→ 显示错误 Toast
      ──→ 按钮恢复正常
```

---

## 2. JavaScript 实现

```javascript
// static/js/detector.js（追加 / 替换 startDetection 占位函数）

/**
 * 触发 AI 检测（点击按钮调用）
 */
async function startDetection() {
  const input = document.getElementById('detect-input');
  const text  = input.value.trim();

  if (!text || text.length < 50) return; // 前端二次校验

  // 1. 进入 Loading 状态
  setDetectLoading(true);

  // 2. 显示结果面板骨架屏
  showResultSkeleton();

  try {
    const resp = await fetch('/api/ailab/detect', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ text, language: 'auto' }),
      signal:  AbortSignal.timeout(35000),  // 35 秒超时
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error || `Server error: ${resp.status}`);
    }

    const data = await resp.json();

    // 3. 渲染结果
    renderResult(data);              // A-04
    renderHighlight(data.sentences); // A-05

    // 4. 平滑滚动到结果区域（移动端）
    if (window.innerWidth < 768) {
      document.getElementById('result-panel')
              .scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

  } catch (err) {
    hideResultSkeleton();  // 恢复结果面板空态

    if (err.name === 'TimeoutError' || err.message.includes('timeout')) {
      showToast(window.i18n?.['ailab.detector.error.timeout'] || 'Detection timed out, please try again', 'error');
    } else {
      showToast(window.i18n?.['ailab.detector.error.failed'] || 'Detection failed, please retry', 'error');
    }
  } finally {
    // 5. 恢复按钮状态
    setDetectLoading(false);
  }
}

/* ── Loading 状态 ───────────────────────────────── */
function setDetectLoading(loading) {
  const btn     = document.getElementById('btn-detect');
  const btnText = document.getElementById('btn-detect-text');

  if (loading) {
    btn.disabled = true;
    btnText.innerHTML = `
      <svg class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2.5">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
      ${window.i18n?.['ailab.detector.btn.checking'] || 'Checking...'}
    `;
  } else {
    btn.disabled = document.getElementById('detect-input').value.trim().length < 50;
    btnText.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      ${window.i18n?.['ailab.detector.btn.check'] || 'Check for AI'}
    `;
  }
}

/* ── 骨架屏 ─────────────────────────────────────── */
function showResultSkeleton() {
  const panel = document.getElementById('result-panel');
  panel.innerHTML = `
    <div class="skeleton-container">
      <div class="skeleton-circle"></div>
      <div class="skeleton-line skeleton-line--wide"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-grid">
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
      </div>
    </div>
  `;
}

function hideResultSkeleton() {
  // 恢复结果面板原始内容（通过重置 innerHTML 或存档 DOM）
  // 最简单方案：刷新结果面板为空态
  document.getElementById('result-empty').style.display   = 'block';
  document.getElementById('result-content').style.display = 'none';
}

/* ── Toast 通知 ─────────────────────────────────── */
function showToast(message, type = 'info') {
  // 复用全局 toast（若已有全局实现），否则创建
  const existing = document.getElementById('global-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id        = 'global-toast';
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <span class="toast__icon">${type === 'error' ? '❌' : 'ℹ️'}</span>
    <span class="toast__msg">${message}</span>
  `;
  document.body.appendChild(toast);

  // 300ms 后显示（CSS transition）
  requestAnimationFrame(() => toast.classList.add('toast--show'));

  // 4 秒后自动消失
  setTimeout(() => {
    toast.classList.remove('toast--show');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}
```

---

## 3. CSS — Loading + 骨架屏 + Toast

```css
/* static/css/detector.css — 联调状态样式 */

/* ── 按钮 Spin 动画 ──────────────────────────────── */
@keyframes spin {
  to { transform: rotate(360deg); }
}
.spin {
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

/* ── 骨架屏 ─────────────────────────────────────── */
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position:  400px 0; }
}

.skeleton-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 20px;
}

.skeleton-circle,
.skeleton-line,
.skeleton-card {
  background: linear-gradient(90deg, #f3f4f6 25%, #e9ebee 50%, #f3f4f6 75%);
  background-size: 400px 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 8px;
}

.skeleton-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
}

.skeleton-line {
  width: 70%;
  height: 16px;
}

.skeleton-line--wide {
  width: 85%;
  height: 20px;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  width: 100%;
}

.skeleton-card {
  height: 60px;
  border-radius: 8px;
}

/* ── Toast ──────────────────────────────────────── */
.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  opacity: 0;
  background: #1f2937;
  color: #f9fafb;
  border-radius: 10px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.875rem;
  font-weight: 500;
  z-index: 10000;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  transition: opacity 0.3s ease, transform 0.3s ease;
  white-space: nowrap;
  max-width: 90vw;
}

.toast--show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.toast--error {
  background: #dc2626;
}
```

---

## 4. i18n 翻译 Key（本 Block 新增）

### locales/zh.json

```json
{
  "ailab.detector.btn.checking":      "检测中...",
  "ailab.detector.error.failed":      "检测失败，请稍后重试",
  "ailab.detector.error.timeout":     "请求超时，请稍后重试",
  "ailab.detector.error.too_long":    "文本超过 5000 字符限制"
}
```

### locales/en.json

```json
{
  "ailab.detector.btn.checking":      "Checking...",
  "ailab.detector.error.failed":      "Detection failed, please try again",
  "ailab.detector.error.timeout":     "Request timed out, please retry",
  "ailab.detector.error.too_long":    "Text exceeds the 5000 character limit"
}
```

---

## 5. 验收标准

- [ ] 点击按钮后立即进入 loading 状态（spinner 动画，按钮 disabled）
- [ ] 结果面板出现骨架屏（灰色 shimmer 动画）
- [ ] 后端返回数据后，骨架屏消失，结果正确渲染（A-04 仪表盘 + A-05 高亮）
- [ ] 后端返回错误时，显示红色 Toast 提示
- [ ] 35 秒超时后，显示超时 Toast
- [ ] 检测完成后按钮恢复可点击状态
- [ ] 移动端检测完成后自动滚动到结果面板
- [ ] Toast 4 秒后自动消失

