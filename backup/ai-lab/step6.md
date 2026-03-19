# Block A-05 · AI 内容检测器 — 句级高亮渲染

> **所属模块**：AI 内容检测器（/ailab/detector）  
> **竞品参考**：https://gptzero.me 句子高亮 + Tooltip  
> **预估工时**：2h  
> **依赖**：A-03（输入区存在），A-04（结果数据格式已定义）  
> **交付粒度**：仅负责将句子数据渲染为带颜色高亮的 HTML + Hover Tooltip，不含后端

---

## 1. 竞品分析（gptzero.me 高亮效果）

| 特性 | 竞品 | 本次实现 |
|------|------|---------|
| 红色高亮 = AI（高概率）| ✅ | ✅ |
| 黄色高亮 = 混合/不确定 | ✅ | ✅ |
| 绿色高亮 = 人工 | ✅ | ✅ |
| Hover 显示 AI 概率 Tooltip | ✅ | ✅ |
| 高亮覆盖在文本上，非替换 | ✅ | ✅ |
| 文字仍可正常选中 | ✅ | ✅ |

---

## 2. HTML 结构

```html
<!-- 高亮区域替换原有 textarea（检测完成后切换） -->
<!-- 初始 display:none，检测后 display:block -->

<div class="highlight-container" id="highlight-container" style="display:none">
  <div class="highlight-text" id="highlight-text">
    <!-- JS 动态插入带高亮的句子 span -->
  </div>

  <!-- 悬停 Tooltip（全局唯一，JS 控制位置） -->
  <div class="sentence-tooltip" id="sentence-tooltip" style="display:none">
    <div class="tooltip-score">
      <span class="tooltip-score__bar">
        <span class="tooltip-score__fill" id="tooltip-bar-fill"></span>
      </span>
      <span class="tooltip-score__value" id="tooltip-score-value">92%</span>
    </div>
    <p class="tooltip-explanation" id="tooltip-explanation"></p>
  </div>
</div>
```

---

## 3. CSS 样式

```css
/* static/css/detector.css — 句级高亮 */

/* ── 高亮容器 ───────────────────────────────────── */
.highlight-container {
  position: relative;
  background: #ffffff;
  border-radius: 0 0 12px 12px;
}

.highlight-text {
  padding: 20px;
  font-size: 0.9375rem;
  line-height: 1.8;
  color: #111827;
  min-height: 240px;
  white-space: pre-wrap;
  word-break: break-word;
  user-select: text;
}

/* ── 句子高亮 span ───────────────────────────────── */
.sentence {
  border-radius: 3px;
  cursor: pointer;
  transition: opacity 0.15s;
  position: relative;
}

/* 高度 AI（红色） */
.sentence--ai-high {
  background: rgba(239, 68, 68, 0.14);
  border-bottom: 2px solid #ef4444;
}

.sentence--ai-high:hover {
  background: rgba(239, 68, 68, 0.24);
}

/* 中度 AI（黄色） */
.sentence--ai-medium {
  background: rgba(234, 179, 8, 0.12);
  border-bottom: 2px solid #eab308;
}

.sentence--ai-medium:hover {
  background: rgba(234, 179, 8, 0.22);
}

/* 人工撰写（绿色） */
.sentence--human {
  background: rgba(34, 197, 94, 0.10);
  border-bottom: 2px solid #22c55e;
}

.sentence--human:hover {
  background: rgba(34, 197, 94, 0.18);
}

/* ── Tooltip ────────────────────────────────────── */
.sentence-tooltip {
  position: fixed;               /* fixed 避免被父元素 overflow 裁剪 */
  z-index: 9999;
  background: #1f2937;
  color: #f9fafb;
  border-radius: 10px;
  padding: 12px 14px;
  max-width: 260px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.18);
  pointer-events: none;
  font-size: 0.8125rem;
  line-height: 1.5;
}

/* 小三角箭头 */
.sentence-tooltip::after {
  content: '';
  position: absolute;
  bottom: -7px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-top: 7px solid #1f2937;
}

.tooltip-score {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.tooltip-score__bar {
  flex: 1;
  height: 5px;
  background: rgba(255,255,255,0.15);
  border-radius: 999px;
  overflow: hidden;
}

.tooltip-score__fill {
  display: block;
  height: 100%;
  background: #ef4444;
  border-radius: 999px;
  transition: width 0.3s ease;
}

.tooltip-score__fill.score-medium { background: #eab308; }
.tooltip-score__fill.score-low    { background: #22c55e; }

.tooltip-score__value {
  font-size: 0.9rem;
  font-weight: 700;
  color: #f9fafb;
  white-space: nowrap;
}

.tooltip-explanation {
  margin: 0;
  color: rgba(249,250,251,0.8);
  font-size: 0.8rem;
}
```

---

## 4. JavaScript — 高亮渲染 + Tooltip

```javascript
// static/js/detector.js（追加）

/**
 * 将句子数组渲染为带高亮的 HTML，
 * 并切换输入区为高亮展示模式
 * @param {Array} sentences - SentenceResult[]
 */
function renderHighlight(sentences) {
  if (!sentences || sentences.length === 0) return;

  const container    = document.getElementById('highlight-container');
  const textArea     = document.getElementById('detect-input');
  const textWrapper  = document.querySelector('.textarea-wrapper');
  const highlightEl  = document.getElementById('highlight-text');

  // 构建 HTML：每句用 span 包裹
  let html = '';
  sentences.forEach((s, idx) => {
    const cls = labelToClass(s.label);
    const escapedText = escapeHTML(s.text);
    html += `<span
      class="sentence ${cls}"
      data-idx="${idx}"
      data-score="${s.ai_score}"
      data-label="${s.label}"
      data-explanation="${escapeAttr(s.explanation || '')}"
      onmouseenter="showTooltip(event, this)"
      onmouseleave="hideTooltip()"
    >${escapedText} </span>`;  /* 保留句子间空格 */
  });

  highlightEl.innerHTML = html;

  // 切换：隐藏 textarea，显示高亮区
  textWrapper.style.display   = 'none';
  container.style.display     = 'block';
}

function labelToClass(label) {
  switch (label) {
    case 'ai_high':   return 'sentence--ai-high';
    case 'ai_medium': return 'sentence--ai-medium';
    default:          return 'sentence--human';
  }
}

function escapeHTML(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;')
            .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function escapeAttr(str) {
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* ── Tooltip 显示/隐藏 ──────────────────────────── */
const tooltip = document.getElementById('sentence-tooltip');

function showTooltip(event, el) {
  const score       = parseInt(el.dataset.score, 10);
  const explanation = el.dataset.explanation || '';

  // 更新 tooltip 内容
  document.getElementById('tooltip-score-value').textContent = score + '%';
  document.getElementById('tooltip-explanation').textContent  = explanation;

  // 进度条颜色
  const fill = document.getElementById('tooltip-bar-fill');
  fill.style.width = score + '%';
  fill.className   = 'tooltip-score__fill';
  if      (score < 40) fill.classList.add('score-low');
  else if (score < 70) fill.classList.add('score-medium');

  // 定位 tooltip（出现在句子正上方）
  const rect = el.getBoundingClientRect();
  tooltip.style.display = 'block';

  const ttWidth  = tooltip.offsetWidth  || 260;
  const ttHeight = tooltip.offsetHeight || 70;

  let left = rect.left + rect.width / 2 - ttWidth / 2;
  let top  = rect.top + window.scrollY - ttHeight - 12;

  // 防止超出屏幕左右边界
  left = Math.max(8, Math.min(left, window.innerWidth - ttWidth - 8));

  tooltip.style.left = left + 'px';
  tooltip.style.top  = top  + 'px';
}

function hideTooltip() {
  tooltip.style.display = 'none';
}

/**
 * 重置高亮区域 → 恢复输入 textarea
 * 用于「重新检测」功能
 */
function resetHighlight() {
  const container   = document.getElementById('highlight-container');
  const textWrapper = document.querySelector('.textarea-wrapper');
  container.style.display   = 'none';
  textWrapper.style.display = 'block';
}
```

---

## 5. 与 A-06（联调）的接口约定

```javascript
// A-06 Block 在拿到后端数据后，依次调用：
renderResult(data);       // A-04: 渲染右侧结果面板
renderHighlight(data.sentences); // A-05: 渲染句级高亮
```

---

## 6. 验收标准

- [ ] 调用 `renderHighlight(mockSentences)` 后，输入框被替换为彩色高亮文本
- [ ] 红色高亮（`ai_high`）、黄色高亮（`ai_medium`）、绿色高亮（`human`）正确显示
- [ ] 鼠标悬停句子后出现深色 Tooltip，包含 AI 概率和说明文字
- [ ] Tooltip 进度条颜色与分数对应（红/黄/绿）
- [ ] Tooltip 不超出屏幕左右边界
- [ ] 高亮文字仍可正常鼠标选中复制
- [ ] `resetHighlight()` 可恢复原始 textarea 显示

