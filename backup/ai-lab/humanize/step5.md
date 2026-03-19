# Block B-05 · AI 人性化工具 — 前后端联调 + 流式打字机效果

> **所属模块**：AI 人性化工具（/ailab/humanize）  
> **竞品参考**：https://www.humanizeai.pro 实时输出效果  
> **预估工时**：2h  
> **依赖**：B-03（双栏 UI）、B-04（后端 SSE 接口）均已完成  
> **交付粒度**：将前端 UI 与后端 SSE 接口联调，实现打字机效果、统计展示、跨页传值

---

## 1. 完整人性化流程

```
用户输入 AI 文本，选择模式
    ↓
点击「立即人性化」按钮
    ↓
[前端] 按钮 Loading，清空右侧输出区
    ↓
建立 SSE 连接 POST /api/ailab/humanize
    ↓
接收 event:message → 右侧输出区追加文字（打字机效果）
    ↓
接收 event:done → 显示统计行 + 操作按钮
    ↓
接收 event:error → 显示错误 Toast
```

---

## 2. JavaScript 实现

```javascript
// static/js/humanize.js（替换 startHumanize 占位函数）

let humanizeAbortController = null;

/**
 * 触发 AI 人性化（点击按钮调用）
 */
async function startHumanize() {
  const inputEl = document.getElementById('humanize-input');
  const text    = inputEl.value.trim();

  if (!text || text.length < 20) return;

  // 若有上一次请求，先中断
  if (humanizeAbortController) {
    humanizeAbortController.abort();
  }
  humanizeAbortController = new AbortController();

  // 1. 进入 Loading 状态
  setHumanizeLoading(true);

  // 2. 重置输出区
  resetOutput();

  // 3. 检测当前语言（根据页面 lang 变量）
  const language = document.documentElement.lang === 'zh' ? 'zh' : 'en';

  try {
    const response = await fetch('/api/ailab/humanize', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ text, mode: currentMode, language }),
      signal:  humanizeAbortController.signal,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Server error: ${response.status}`);
    }

    // 4. 解析 SSE 流
    await parseSSEStream(response.body);

  } catch (err) {
    if (err.name === 'AbortError') return; // 用户主动取消，不提示

    resetOutput();  // 清空未完成的输出
    showToast(window.i18n?.['ailab.humanize.error.failed'] || 'Humanize failed, please retry', 'error');
  } finally {
    setHumanizeLoading(false);
  }
}

/**
 * 解析 SSE 流并逐字追加到输出区
 */
async function parseSSEStream(readableStream) {
  const outputEmpty = document.getElementById('output-empty');
  const outputText  = document.getElementById('humanize-output');

  // 显示输出文本区，隐藏空态
  outputEmpty.style.display = 'none';
  outputText.style.display  = 'block';

  const reader  = readableStream.getReader();
  const decoder = new TextDecoder('utf-8');
  let   buffer  = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // 按行解析 SSE
    const lines = buffer.split('\n');
    buffer = lines.pop(); // 保留最后不完整的行

    let eventType = '';
    for (const line of lines) {
      if (line.startsWith('event: ')) {
        eventType = line.slice(7).trim();
      } else if (line.startsWith('data: ')) {
        const dataStr = line.slice(6).trim();
        try {
          const data = JSON.parse(dataStr);
          handleSSEData(eventType, data, outputText);
        } catch (_) {
          // 解析失败，跳过
        }
        eventType = '';
      }
    }
  }
}

function handleSSEData(eventType, data, outputEl) {
  if (eventType === 'message' || (!eventType && data.content)) {
    // 追加文字（打字机效果：直接 append，浏览器渲染速度即为打字机效果）
    outputEl.textContent += data.content;

    // 自动滚动到最新内容
    outputEl.scrollTop = outputEl.scrollHeight;

  } else if (eventType === 'done') {
    // 显示统计行和操作按钮
    showOutputStats(data.changed_percent, data.word_count);
    showOutputActions();

  } else if (eventType === 'error') {
    throw new Error(data.message || 'Stream error');
  }
}

/* ── 统计行 ─────────────────────────────────────── */
function showOutputStats(changedPercent, wordCount) {
  const statsEl = document.getElementById('humanize-stats');
  const changedText = document.getElementById('stat-changed-text');

  changedPercent = changedPercent || 0;
  const label = window.i18n?.['ailab.humanize.changed_percent'] || 'Changed {percent}% of words';
  changedText.textContent = label.replace('{percent}', changedPercent);

  statsEl.style.display = 'flex';
}

function showOutputActions() {
  const actionsEl = document.getElementById('output-actions');
  actionsEl.style.display = 'flex';

  // 「检测 AI 分数」按钮携带输出文本
  const outputText = document.getElementById('humanize-output').textContent;
  sessionStorage.setItem('detect_input', outputText);
}

/* ── Loading 状态 ───────────────────────────────── */
function setHumanizeLoading(loading) {
  const btn     = document.getElementById('btn-humanize');
  const btnText = document.getElementById('btn-humanize-text');

  if (loading) {
    btn.disabled = true;
    btnText.innerHTML = `
      <svg class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2.5">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
      ${window.i18n?.['ailab.humanize.btn.processing'] || 'Humanizing...'}
    `;
  } else {
    btn.disabled = document.getElementById('humanize-input').value.trim().length < 20;
    btnText.innerHTML = window.i18n?.['ailab.humanize.btn.humanize'] || '✨ Humanize Now';
  }
}

/* ── 重置输出区 ─────────────────────────────────── */
function resetOutput() {
  const outputEmpty   = document.getElementById('output-empty');
  const outputText    = document.getElementById('humanize-output');
  const statsEl       = document.getElementById('humanize-stats');
  const actionsEl     = document.getElementById('output-actions');

  outputText.textContent  = '';
  outputEmpty.style.display = 'flex';
  outputText.style.display  = 'none';
  statsEl.style.display     = 'none';
  actionsEl.style.display   = 'none';
}

/* ── 复制输出（绑定 btn-copy-text） ─────────────── */
function copyOutput() {
  const outputEl = document.getElementById('humanize-output');
  const text     = outputEl.textContent || '';
  if (!text) return;

  navigator.clipboard.writeText(text).then(() => {
    const btnText = document.getElementById('btn-copy-text');
    const original = btnText.textContent;
    btnText.textContent = window.i18n?.['ailab.humanize.btn.copied'] || '✓ Copied!';
    setTimeout(() => { btnText.textContent = original; }, 2000);
  });
}

/* ── Toast（与检测器共用全局 toast） ─────────────── */
function showToast(message, type) {
  // 复用 detector.js 中已定义的 showToast，
  // 若为独立页面则在此重新实现
  const existing = document.getElementById('global-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id        = 'global-toast';
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <span>${type === 'error' ? '❌' : 'ℹ️'}</span>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('toast--show'));
  setTimeout(() => {
    toast.classList.remove('toast--show');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}
```

---

## 3. 从检测器跳转时自动填入文本

```javascript
// static/js/humanize.js — DOMContentLoaded（在 B-02 基础上扩展）
window.addEventListener('DOMContentLoaded', () => {
  // 从 AI 检测器传来的文本（A-07 Block 写入）
  const prefillHumanize = sessionStorage.getItem('humanize_input');
  if (prefillHumanize) {
    const input = document.getElementById('humanize-input');
    if (input) {
      input.value = prefillHumanize;
      onHumanizeInputChange(input);
      sessionStorage.removeItem('humanize_input');
    }
  }

  // 从本工具「检测 AI 分数」跳转回来时（在检测器页面自动填入输出文本）
  // 此逻辑在检测器 JS 中处理，这里不需要
});
```

---

## 4. 检测器联动（从人性化结果跳转到检测器）

在 `detector.js` 中补充读取 `detect_input` 的逻辑：

```javascript
// static/js/detector.js — DOMContentLoaded 追加
window.addEventListener('DOMContentLoaded', () => {
  const prefillDetect = sessionStorage.getItem('detect_input');
  if (prefillDetect) {
    const input = document.getElementById('detect-input');
    if (input) {
      input.value = prefillDetect;
      onInputChange(input);
      sessionStorage.removeItem('detect_input');
    }
  }
});
```

---

## 5. i18n 翻译 Key（本 Block 新增）

### locales/zh.json

```json
{
  "ailab.humanize.btn.processing":     "人性化处理中...",
  "ailab.humanize.btn.copied":         "✓ 已复制",
  "ailab.humanize.changed_percent":    "已修改 {percent}% 的词汇",
  "ailab.humanize.error.failed":       "改写失败，请稍后重试",
  "ailab.humanize.error.timeout":      "请求超时，请稍后重试"
}
```

### locales/en.json

```json
{
  "ailab.humanize.btn.processing":     "Humanizing...",
  "ailab.humanize.btn.copied":         "✓ Copied!",
  "ailab.humanize.changed_percent":    "Changed {percent}% of words",
  "ailab.humanize.error.failed":       "Humanize failed, please retry",
  "ailab.humanize.error.timeout":      "Request timed out, please retry"
}
```

---

## 6. 验收标准

- [ ] 输入文本后点击「立即人性化」，按钮进入 Loading（spinner）
- [ ] 右侧输出区文字逐步追加（打字机效果，流畅不卡顿）
- [ ] 流式完成后显示「已修改 xx% 的词汇」统计行
- [ ] 「复制文本」按钮点击后临时显示「已复制 ✓」（2秒恢复）
- [ ] 「再次改写」再次触发人性化（清空旧输出，重新流式输出）
- [ ] 「检测 AI 分数」点击后跳转 `/ailab/detector`，输出文本自动填入检测器输入框
- [ ] 从检测器点击「人性化此文本」跳转后，文本自动填入人性化输入框
- [ ] 错误时显示红色 Toast，输出区恢复空态
- [ ] 切换写作模式后再点击「立即人性化」，以新模式重新改写

