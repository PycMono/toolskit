<!-- ai-humanizer-I-04_结果区UI.md -->

# AI Humanizer — 结果区 UI

---

## 1. 竞品结果区 UI 对标表

| UI 功能点 | humanizeai.pro | aihumanize.io | humanizeai.io | quillbot | **本次实现** |
|-----------|:--------------:|:-------------:|:-------------:|:--------:|:------------:|
| 输出区布局 | 单文本框 | 右栏文本框 | 右栏文本框 | 右栏文本框 | **右栏面板（含Header/Body/Footer三段）** |
| AI 分数展示 | 无 | 文字 % | 文字 % | 无 | **圆形甜甜圈图（动画+颜色）** |
| 流式打字输出 | 无 | 无 | 无 | 无 | **SSE 逐 token 打字机效果** |
| 可读性评分 | 无 | 无 | 无 | 无 | **Flesch-Kincaid 分数 + 等级标签** |
| 改善幅度徽章 | 无 | 无 | 无 | 无 | **前后AI分数差（动画滑入）** |
| 同义词交互 | 无 | 无 | 点击词语 | 无 | **右键/点击词语弹出同义词面板** |
| 复制按钮 | ✅ | ✅ | ✅ | ✅ | ✅ **含复制动画反馈** |
| 下载选项 | 无 | 无 | 无 | ✅（付费）| **免费下载 TXT + DOCX** |
| 再次人性化 | 无 | 无 | ✅ | ✅ | ✅ **「Try Again」按钮** |
| 历史记录面板 | 无 | 无 | 无 | 有限 | **抽屉式历史记录（本地10条）** |
| 深色模式 | 无 | 无 | 无 | 无 | **完整深/浅色双模式** |

---

## 2. 结果区详细 UI 渲染说明

### 输出面板状态机

输出面板共有 4 种状态，对应不同 DOM 展示：

```
┌──────────────────────────────────────────────────────────────────┐
│                        panel--output                              │
│                                                                    │
│  ┌─── state: idle ────────────────────────────────────────────┐  │
│  │  #output-empty (display:flex)                               │  │
│  │  · 居中图标 🧬 + 提示文字                                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌─── state: streaming ───────────────────────────────────────┐  │
│  │  #output-text (display:block)                               │  │
│  │  · 已生成文字（escapeHTML + 段落保留）                       │  │
│  │  · 末尾追加 <span class="processing-cursor"></span>          │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌─── state: done ────────────────────────────────────────────┐  │
│  │  #output-text (display:block)                               │  │
│  │  · 最终文字（光标消失）                                      │  │
│  │  · 每个单词包裹 <span class="word" data-word="xxx"> 用于     │  │
│  │    同义词交互                                                │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌─── state: error ───────────────────────────────────────────┐  │
│  │  #output-error (display:block)                              │  │
│  │  · 错误图标 + 错误文字 + 「Try Again」按钮                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### `finalizeOutput()` — 完成渲染

```javascript
function finalizeOutput() {
  const outputDiv = document.getElementById('output-text');

  // 1. 移除末尾光标
  const cursor = outputDiv.querySelector('.processing-cursor');
  if (cursor) cursor.remove();

  // 2. 将每个英文单词包裹为可点击的 span（用于同义词）
  const html = wrapWordsInSpans(STATE.outputText);
  outputDiv.innerHTML = html;

  // 3. 更新字数
  STATE.outputWordCount = countWords(STATE.outputText);
  document.getElementById('output-word-count').textContent =
    formatWordCount(STATE.outputWordCount);

  // 4. 计算可读性评分
  const readability = fleschKincaid(STATE.outputText);
  STATE.readabilityScore = readability;
  updateReadabilityBadge(readability);

  // 5. 显示「再次人性化」按钮
  document.getElementById('btn-humanize-again').style.display = 'inline-flex';

  // 6. 滚动到顶部
  outputDiv.scrollTop = 0;
}

// 将英文单词包裹为 span
function wrapWordsInSpans(text) {
  // 保留段落换行
  return escapeHTML(text).replace(/(\n)/g, '<br>').replace(
    /\b([A-Za-z]{3,})\b/g,
    (match) => {
      const hasSynonyms = getSynonyms(match).length > 0;
      return hasSynonyms
        ? `<span class="word word--has-synonyms" data-word="${match}">${match}</span>`
        : `<span class="word" data-word="${match}">${match}</span>`;
    }
  );
}
```

### AI 分数圆形图（输出面板）

```html
<!-- 圆形图容器（HTML 结构）-->
<div class="score-ring score-ring--output" id="score-ring-output">
  <canvas id="chart-output" width="52" height="52"></canvas>
  <div class="score-ring__label">
    <span class="score-ring__value" id="score-output-value">—</span>
    <span class="score-ring__unit">AI</span>
  </div>
</div>
```

圆形图颜色规则：
- AI 分数 > 70%：红色 `#ef4444`（危险，未充分人性化）
- AI 分数 40-70%：橙色 `#f59e0b`（中等，可再次处理）
- AI 分数 < 40%：绿色 `#22c55e`（安全，人性化成功）

### 改善幅度徽章

```html
<!-- 显示于输出面板 Footer 左侧 -->
<span class="improvement-badge" id="improvement-badge" style="display:none">
  <svg>↑</svg>
  <span id="improvement-text">-45% AI</span>
</span>
```

```css
.improvement-badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 8px; border-radius: 999px;
  font-size: 12px; font-weight: 600;
  animation: slide-in-right 0.4s ease forwards;
}
.improvement-badge--good {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.3);
}
.improvement-badge--bad {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3);
}
@keyframes slide-in-right {
  from { opacity: 0; transform: translateX(8px); }
  to   { opacity: 1; transform: translateX(0); }
}
```

### 可读性评分徽章

```javascript
function updateReadabilityBadge(score) {
  const badge = document.getElementById('readability-badge');
  const value = document.getElementById('readability-value');

  // Flesch 分数 → 等级
  let grade, color;
  if (score >= 90)      { grade = 'Very Easy';  color = '#22c55e'; }
  else if (score >= 70) { grade = 'Easy';        color = '#84cc16'; }
  else if (score >= 60) { grade = 'Standard';    color = '#f59e0b'; }
  else if (score >= 50) { grade = 'Fairly Diff'; color = '#f97316'; }
  else                  { grade = 'Difficult';   color = '#ef4444'; }

  value.textContent = grade;
  value.style.color = color;
  badge.style.display = 'flex';
}
```

---

## 3. 同义词面板详细说明

```javascript
// 同义词面板 DOM 结构
/*
<div class="synonym-panel" id="synonym-panel">
  <div class="synonym-panel__header">
    <span class="synonym-panel__original-word" id="synonym-word">utilize</span>
    <button onclick="closeSynonymPanel()">✕</button>
  </div>
  <p class="synonym-panel__hint">Click to replace</p>
  <div class="synonym-panel__list" id="synonym-list">
    <div class="synonym-item" onclick="applySynonym('utilize', 'use')">use</div>
    <div class="synonym-item" onclick="applySynonym('utilize', 'employ')">employ</div>
    ...
  </div>
</div>
*/

// 定位逻辑：贴近点击词语，自动避免超出屏幕
function showSynonymPanel(anchorEl, word, synonyms) {
  const panel  = document.getElementById('synonym-panel');
  const rect   = anchorEl.getBoundingClientRect();
  const panelW = 220;
  const panelH = Math.min(synonyms.length * 40 + 60, 250);

  // 默认显示在词语正下方
  let left = rect.left + window.scrollX;
  let top  = rect.bottom + window.scrollY + 6;

  // 右边界检测
  if (left + panelW > window.innerWidth - 16) {
    left = window.innerWidth - panelW - 16;
  }
  // 下边界检测：若超出则显示在词语上方
  if (rect.bottom + panelH > window.innerHeight - 16) {
    top = rect.top + window.scrollY - panelH - 6;
  }

  panel.style.left = left + 'px';
  panel.style.top  = top + 'px';
  panel.style.display = 'block';

  document.getElementById('synonym-word').textContent = word;
  document.getElementById('synonym-list').innerHTML = synonyms.map(syn => `
    <div class="synonym-item" role="button"
         onclick="AIHumanizer.applySynonym('${escapeHTML(word)}', '${escapeHTML(syn)}')">
      <span class="synonym-item__text">${escapeHTML(syn)}</span>
    </div>
  `).join('');

  // 自动聚焦第一个同义词
  const firstItem = panel.querySelector('.synonym-item');
  if (firstItem) firstItem.focus();
}

// 关闭：ESC 键 + 点击外部区域
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeSynonymPanel();
    closeHistoryDrawer();
    closeDownloadDropdown();
  }
});
document.addEventListener('click', (e) => {
  const panel = document.getElementById('synonym-panel');
  if (!panel.contains(e.target) && !e.target.closest('.word')) {
    closeSynonymPanel();
  }
});
```

---

## 4. 历史记录抽屉

```html
<!-- 历史记录抽屉（在 body 末尾）-->
<aside class="history-drawer" id="history-drawer" role="dialog"
       aria-modal="false" aria-label="Browsing history">
  <div class="history-drawer__header">
    <h3 class="history-drawer__title">Recent History</h3>
    <div class="history-drawer__actions">
      <button class="btn btn--ghost btn--sm" onclick="AIHumanizer.clearHistory()">
        Clear All
      </button>
      <button class="btn btn--ghost btn--icon" onclick="AIHumanizer.toggleHistory()">
        ✕
      </button>
    </div>
  </div>

  <ul class="history-list" id="history-list" role="list">
    <!-- 动态渲染 -->
    <!--
    <li class="history-item">
      <div class="history-item__meta">
        <span class="history-item__mode badge">aggressive</span>
        <span class="history-item__time">2 mins ago</span>
        <span class="history-item__score-delta">78% → 12% ↓</span>
      </div>
      <p class="history-item__preview">The implementation of machine learning...</p>
      <button class="btn btn--sm btn--ghost">Restore</button>
    </li>
    -->
  </ul>
</aside>

<!-- 历史记录遮罩（移动端用）-->
<div class="history-overlay" id="history-overlay"
     onclick="AIHumanizer.toggleHistory()"></div>
```

---

## 5. CSS 规范

### 结果面板 & 输出区

```css
/* 输出文本区 */
.output-text {
  padding: 16px;
  color: var(--c-text);
  font-size: 15px; line-height: 1.8;
  min-height: 380px; overflow-y: auto;
  white-space: pre-wrap; word-break: break-word;
}

/* 可点击的词语（有同义词）*/
.word--has-synonyms {
  cursor: pointer;
  border-bottom: 1px dashed var(--c-primary-light);
  transition: background var(--duration-fast);
}
.word--has-synonyms:hover {
  background: var(--c-primary-glow);
  border-radius: 3px;
}

/* 空状态 */
.output-empty {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  min-height: 380px; gap: 12px;
  color: var(--c-text-muted);
}
.output-empty__icon { font-size: 48px; opacity: 0.4; }
.output-empty__text { font-size: 14px; text-align: center; }

/* 同义词面板 */
.synonym-panel {
  position: fixed; z-index: 9999;
  background: var(--c-elevated);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg), var(--shadow-glow);
  padding: 8px;
  min-width: 180px; max-width: 260px;
  max-height: 280px; overflow-y: auto;
  animation: fade-scale-in 0.15s ease;
}
@keyframes fade-scale-in {
  from { opacity: 0; transform: scale(0.95) translateY(-4px); }
  to   { opacity: 1; transform: scale(1)    translateY(0); }
}
.synonym-panel__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 4px 8px 8px; margin-bottom: 4px;
  border-bottom: 1px solid var(--c-border);
}
.synonym-panel__original-word {
  font-weight: 700; color: var(--c-primary-light); font-size: 14px;
}
.synonym-item {
  padding: 8px 10px; border-radius: var(--radius-sm);
  cursor: pointer; font-size: 14px;
  color: var(--c-text-secondary);
  transition: all var(--duration-fast);
}
.synonym-item:hover {
  background: var(--c-primary-glow);
  color: var(--c-primary-light);
  padding-left: 14px;
}

/* 历史记录抽屉 */
.history-drawer {
  position: fixed; right: 0; top: 0; bottom: 0;
  width: 340px; z-index: 800;
  background: var(--c-surface);
  border-left: 1px solid var(--c-border);
  box-shadow: var(--shadow-lg);
  transform: translateX(100%);
  transition: transform var(--duration-normal) ease;
  overflow-y: auto;
  padding: 20px;
}
.history-drawer.open { transform: translateX(0); }

.history-overlay {
  position: fixed; inset: 0; z-index: 799;
  background: rgba(0,0,0,0.5);
  display: none;
}
.history-overlay.visible { display: block; }

.history-item {
  padding: 12px; border-radius: var(--radius-md);
  border: 1px solid var(--c-border);
  margin-bottom: 8px;
  transition: border-color var(--duration-fast);
}
.history-item:hover { border-color: var(--c-primary-border); }
.history-item__meta {
  display: flex; align-items: center; gap: 8px; margin-bottom: 6px;
  flex-wrap: wrap;
}
.history-item__mode {
  background: var(--c-primary-glow); color: var(--c-primary-light);
  padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600;
  text-transform: uppercase;
}
.history-item__score-delta { font-size: 11px; color: var(--c-score-good); }
.history-item__time { font-size: 11px; color: var(--c-text-muted); }
.history-item__preview {
  font-size: 13px; color: var(--c-text-secondary);
  line-height: 1.5; margin-bottom: 8px;
  overflow: hidden; display: -webkit-box;
  -webkit-line-clamp: 2; -webkit-box-orient: vertical;
}

/* 进度条 */
.progress-bar {
  height: 3px;
  background: var(--c-border);
  position: relative; overflow: hidden;
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
}
.progress-bar__fill {
  position: absolute; top: 0; left: 0;
  height: 100%;
  background: var(--gradient-primary);
  transition: width 0.3s ease;
  border-radius: 999px;
}
/* 进度条光晕扫描动效 */
.progress-bar__fill::after {
  content: ''; position: absolute; top: 0;
  right: 0; width: 60px; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  animation: shimmer 1.2s ease-in-out infinite;
}
@keyframes shimmer {
  from { transform: translateX(-60px); }
  to   { transform: translateX(60px); }
}

/* Toast 通知 */
.toast-container {
  position: fixed; bottom: 24px; right: 24px;
  z-index: 10000; display: flex; flex-direction: column;
  gap: 8px; pointer-events: none;
}
.toast {
  padding: 12px 18px; border-radius: var(--radius-md);
  font-size: 14px; font-weight: 500;
  max-width: 320px;
  transform: translateY(20px); opacity: 0;
  transition: all 0.3s ease;
  pointer-events: auto;
  box-shadow: var(--shadow-md);
}
.toast--visible { transform: translateY(0); opacity: 1; }
.toast--success { background: #166534; color: #bbf7d0; border: 1px solid #22c55e33; }
.toast--error   { background: #7f1d1d; color: #fecaca; border: 1px solid #ef444433; }
.toast--warning { background: #78350f; color: #fde68a; border: 1px solid #f59e0b33; }
.toast--info    { background: var(--c-elevated); color: var(--c-text); border: 1px solid var(--c-border); }

/* 移动端适配 */
@media (max-width: 768px) {
  .history-drawer { width: 100%; }
  .toast-container { bottom: 16px; right: 16px; left: 16px; }
  .toast { max-width: 100%; }
  .synonym-panel { position: fixed; left: 16px !important; right: 16px !important;
                   width: auto !important; bottom: 20px; top: auto !important; }
}
```

---

## 6. 完整数据流 & 函数调用图

```
用户粘贴文本 / 上传文件
        │
        ▼
  onInputChange() / parseFile()
        │ 更新 STATE.inputText
        │ 更新字数统计 UI
        ▼
  [可选] detectAI('input')
        │ POST /api/ai/detect
        │ 返回 ai_score
        ▼ animateScoreRing('input', score)
        │ Chart.js 圆形图动画
        │
  用户点击「Humanize Now」
        │
        ▼
  humanize()
        │ 校验（空/超限/处理中/captcha）
        │ STATE.isProcessing = true
        │ setHumanizeBtnState('loading')
        │ showOutputProcessing()
        │ startProgressBar()
        ▼
  fetch('/api/ai/humanize', { method:'POST', body: JSON })
        │
        │         ┌──── 后端处理流程 ────────────────┐
        │         │  prompts/<mode>.md → 加载提示词  │
        │         │  AI Factory → 选择 Provider      │
        │         │  Provider.stream() → SSE 流      │
        │         └──────────────────────────────────┘
        │
        ▼ ReadableStream（SSE）
  readStream(response, onChunk)
        │
        ├──── [每个 chunk] ────────────────────────────┐
        │   STATE.streamBuffer += chunk                │
        │   renderStreamOutput(STATE.streamBuffer)     │
        │   · 追加光标，滚动到底部                      │
        │   updateProgressBar(estimateProgress())      │
        └──────────────────────────────────────────────┘
        │ [流结束]
        ▼
  finalizeOutput()
        │ 移除光标
        │ wrapWordsInSpans() → 包裹可点击词语
        │ updateReadabilityBadge(fleschKincaid())
        │ 显示「再次人性化」按钮
        │ 更新输出字数
        ▼
  detectAI('output')
        │ POST /api/ai/detect（输出文字）
        │ 返回 ai_score
        ▼ animateScoreRing('output', score)
        │ showImprovementBadge()（计算前后差）
        ▼
  finishProgressBar()
  saveHistory()  → localStorage
  dispatch('humanize:done') → GA 事件

        │
        ▼ 用户点击词语（has-synonyms）
  showSynonymPanel(anchorEl, word, synonyms)
        │ getSynonyms(word) → 查内置词库
        │ 定位弹层（边界检测）
        ▼
  applySynonym(original, replacement)
        │ 替换 STATE.outputText 中的词
        │ 重新渲染 output-text innerHTML
        │ showToast('Replaced...')
        ▼

        │ 用户点击「Copy」
  navigator.clipboard.writeText(STATE.outputText)
        │ 按钮文字改「Copied!」1.5s 后恢复

        │ 用户点击「Download TXT/DOCX」
  downloadTxt() / downloadDocx()
        │ 生成 Blob → createObjectURL
        │ triggerDownload()
        │ setTimeout 5s → revokeObjectURL

        │ 用户点击「Clear All」
  clearAll()
        │ abortController.abort()（终止进行中请求）
        │ STATE 全面重置
        │ Chart.destroy() × 2
        │ UI 全面重置
```

---

## 7. 验收标准 Checklist

### 输出面板 UI
- [ ] 空状态：居中图标 🧬 + 提示文字，符合设计规范
- [ ] 流式状态：打字机光标闪烁（0.7s blink），文字逐步显示
- [ ] 完成状态：光标消失，词语已被 `<span>` 包裹
- [ ] 带同义词的词语有虚线下划线，hover 时有背景高亮
- [ ] 改善幅度徽章从右侧滑入（400ms 动画），颜色正确（绿/红）
- [ ] 可读性等级标签显示正确（Very Easy / Easy / Standard / Fairly Diff / Difficult）
- [ ] 「再次人性化」按钮仅在处理完成后显示
- [ ] 输出面板标题栏 AI 分数圆形图颜色随分数变化

### 同义词面板
- [ ] 点击带虚线下划线的词语弹出同义词面板
- [ ] 同义词面板定位到词语附近，不超出屏幕边界
- [ ] 点击同义词后替换成功，面板关闭，Toast 显示替换提示
- [ ] 同义词面板用 ESC 键可关闭
- [ ] 点击面板外部区域自动关闭
- [ ] 移动端：面板固定在屏幕底部（全宽）

### 历史记录
- [ ] 每次人性化完成后自动保存到 localStorage
- [ ] 最多保存 10 条，超出后删除最旧的
- [ ] 历史抽屉点击「Restore」恢复原文和输出
- [ ] 历史条目显示：模式徽章、时间（timeAgo 格式）、AI分数前后对比
- [ ] 「Clear All」后 localStorage 清空，UI 更新

### 批量下载 & 复制
- [ ] 「Copy」按钮点击后文字变为「Copied!」，1.5s 后恢复
- [ ] 下载 TXT：文件名为 `humanized-text.txt`，内容正确
- [ ] 下载 DOCX：文件可被 Word 正常打开，中文字符不乱码
- [ ] 下载后 5 秒内 ObjectURL 已释放（无内存泄漏）

### 边界情况
- [ ] 未处理时点击下载按钮无响应（STATE.outputText 为空）
- [ ] 流式处理中途关闭页面：AbortController 正确终止请求
- [ ] 历史记录 JSON 损坏（localStorage 写入异常）：catch 后初始化为空数组，不崩溃
- [ ] 同义词词库查不到词语时不弹出面板（getSynonyms 返回空数组）
