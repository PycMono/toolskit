
/* ==================================================
   Tool Box Nova - AI Humanize Tool
   Block B-05: 前后端联调 + 流式打字机效果
   ================================================== */

const HUMANIZE_MAX_CHARS = 5000;
const HUMANIZE_MIN_CHARS = 20;

let currentMode = 'standard';
let humanizeAbortController = null;

// ========== 模式切换 ==========
function selectMode(mode, btn) {
  currentMode = mode;

  // 更新 Tab 激活状态
  document.querySelectorAll('.mode-tab').forEach(el => {
    el.classList.remove('mode-tab--active');
    el.removeAttribute('aria-selected');
  });

  btn.classList.add('mode-tab--active');
  btn.setAttribute('aria-selected', 'true');

  // 清空输出区（模式切换后输出失效）
  resetOutput();

  console.log('✅ Mode switched to:', mode);
}

// ========== 输入变化：更新字数 + 按钮状态 ==========
function onHumanizeInputChange(textarea) {
  const len = textarea.value.length;
  const counter = document.getElementById('humanize-char-count');

  if (counter) {
    counter.textContent = len + ' / ' + HUMANIZE_MAX_CHARS;
  }

  // 字数超限时截断
  if (len > HUMANIZE_MAX_CHARS) {
    textarea.value = textarea.value.substring(0, HUMANIZE_MAX_CHARS);
    return;
  }

  // 更新按钮状态 - 必须至少 20 个字符
  const btn = document.getElementById('btn-humanize');
  if (btn) {
    const trimmedLen = textarea.value.trim().length;
    btn.disabled = trimmedLen < HUMANIZE_MIN_CHARS;
  }
}

// ========== 开始人性化 ==========
async function startHumanize() {
  const inputEl = document.getElementById('humanize-input');
  if (!inputEl) return;

  const text = inputEl.value.trim();

  if (!text || text.length < HUMANIZE_MIN_CHARS) {
    showToast(`文本长度不足 ${HUMANIZE_MIN_CHARS} 个字符`, 'error');
    return;
  }

  // 若有上一次请求，先中断
  if (humanizeAbortController) {
    humanizeAbortController.abort();
  }
  humanizeAbortController = new AbortController();

  // 1. 进入 Loading 状态
  setHumanizeLoading(true);

  // 2. 重置输出区
  resetOutput();

  // 3. 检测当前语言
  const language = document.documentElement.lang === 'zh' ? 'zh' : 'en';

  try {
    const response = await fetch('/api/ailab/humanize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, mode: currentMode, language }),
      signal: humanizeAbortController.signal,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Server error: ${response.status}`);
    }

    // 4. 解析 SSE 流
    await parseSSEStream(response.body);

  } catch (err) {
    if (err.name === 'AbortError') return; // 用户主动取消，不提示

    console.error('Humanize error:', err);
    resetOutput();
    showToast(err.message || '改写失败，请稍后重试', 'error');
  } finally {
    setHumanizeLoading(false);
  }
}

// ========== 解析 SSE 流 ==========
async function parseSSEStream(readableStream) {
  const outputEmpty = document.getElementById('output-empty');
  const outputText = document.getElementById('humanize-output');

  // 显示输出文本区，隐藏空态
  if (outputEmpty) outputEmpty.style.display = 'none';
  if (outputText) {
    outputText.style.display = 'block';
    outputText.textContent = '';
  }

  const reader = readableStream.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // 按行解析 SSE
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // 保留最后不完整的行

    let eventType = '';
    for (const line of lines) {
      if (line.startsWith('event:')) {
        eventType = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        const dataStr = line.slice(5).trim();
        if (!dataStr) continue;

        try {
          const data = JSON.parse(dataStr);
          handleSSEData(eventType, data, outputText);
        } catch (e) {
          console.warn('Failed to parse SSE data:', dataStr, e);
        }
        eventType = '';
      }
    }
  }
}

// ========== 处理 SSE 数据 ==========
function handleSSEData(eventType, data, outputEl) {
  if (eventType === 'message' || (!eventType && data.content)) {
    // 追加文字（打字机效果）
    if (outputEl && data.content) {
      outputEl.textContent += data.content;
      // 自动滚动到最新内容
      outputEl.scrollTop = outputEl.scrollHeight;
    }

  } else if (eventType === 'done') {
    // 显示统计行和操作按钮
    showOutputStats(data.changed_percent, data.word_count);
    showOutputActions();

  } else if (eventType === 'error') {
    throw new Error(data.message || 'Stream error');
  }
}

// ========== 显示统计行 ==========
function showOutputStats(changedPercent, wordCount) {
  const statsEl = document.getElementById('humanize-stats');
  const changedText = document.getElementById('stat-changed-text');

  if (statsEl && changedText) {
    const percent = changedPercent || 0;
    changedText.textContent = `修改 ${percent}%`;
    statsEl.style.display = 'flex';
  }
}

// ========== 显示操作按钮 ==========
function showOutputActions() {
  const actionsEl = document.getElementById('output-actions');
  if (actionsEl) {
    actionsEl.style.display = 'flex';
  }

  // 「检测 AI 分数」按钮携带输出文本
  const outputText = document.getElementById('humanize-output');
  if (outputText) {
    sessionStorage.setItem('detect_input', outputText.textContent);
  }
}

// ========== Loading 状态 ==========
function setHumanizeLoading(loading) {
  const btn = document.getElementById('btn-humanize');
  const btnText = document.getElementById('btn-humanize-text');

  if (loading) {
    if (btn) btn.disabled = true;
    if (btnText) {
      btnText.innerHTML = `
        <svg class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.5">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        <span style="margin-left:6px">人性化处理中...</span>
      `;
    }
  } else {
    const inputEl = document.getElementById('humanize-input');
    if (btn) {
      btn.disabled = !inputEl || inputEl.value.trim().length < HUMANIZE_MIN_CHARS;
    }
    if (btnText) {
      btnText.textContent = '✨ 立即人性化';
    }
  }
}

// ========== 重置输出区 ==========
function resetOutput() {
  const outputEmpty = document.getElementById('output-empty');
  const outputText = document.getElementById('humanize-output');
  const statsEl = document.getElementById('humanize-stats');
  const actionsEl = document.getElementById('output-actions');

  if (outputText) outputText.textContent = '';
  if (outputEmpty) outputEmpty.style.display = 'flex';
  if (outputText) outputText.style.display = 'none';
  if (statsEl) statsEl.style.display = 'none';
  if (actionsEl) actionsEl.style.display = 'none';
}

// ========== 复制输出 ==========
function copyOutput() {
  const outputEl = document.getElementById('humanize-output');
  const text = outputEl ? outputEl.textContent || '' : '';

  if (!text) {
    showToast('没有可复制的内容', 'error');
    return;
  }

  navigator.clipboard.writeText(text).then(() => {
    const btnText = document.getElementById('btn-copy-text');
    if (btnText) {
      const original = btnText.textContent;
      btnText.textContent = '✓ 已复制';
      setTimeout(() => {
        btnText.textContent = original;
      }, 2000);
    }
    showToast('已复制到剪贴板', 'success');
  }).catch(err => {
    console.error('Copy failed:', err);
    showToast('复制失败', 'error');
  });
}

// ========== Toast 提示 ==========
function showToast(message, type = 'info') {
  const existing = document.getElementById('global-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'global-toast';
  toast.className = `toast toast--${type}`;

  const icon = type === 'error' ? '❌' : (type === 'success' ? '✅' : 'ℹ️');
  toast.innerHTML = `
    <span>${icon}</span>
    <span>${message}</span>
  `;

  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('toast--show'));

  setTimeout(() => {
    toast.classList.remove('toast--show');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// ========== 从 sessionStorage 读取预填文本 ==========
window.addEventListener('DOMContentLoaded', () => {
  // 从检测器传来的文本
  const prefillHumanize = sessionStorage.getItem('humanize_input');
  if (prefillHumanize) {
    const input = document.getElementById('humanize-input');
    if (input) {
      input.value = prefillHumanize;
      onHumanizeInputChange(input);
      sessionStorage.removeItem('humanize_input');
      console.log('✅ Pre-filled text from detector');
    }
  }
});

// ========== CSS 动画支持 ==========
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .spin {
    animation: spin 1s linear infinite;
  }
  
  /* Toast 样式 */
  .toast {
    position: fixed;
    top: 20px;
    right: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-size: 14px;
    font-weight: 500;
    z-index: 10000;
    opacity: 0;
    transform: translateX(100px);
    transition: all 0.3s ease;
  }
  
  .toast--show {
    opacity: 1;
    transform: translateX(0);
  }
  
  .toast--error {
    border-left: 4px solid #ef4444;
    color: #991b1b;
  }
  
  .toast--success {
    border-left: 4px solid #10b981;
    color: #065f46;
  }
  
  .toast--info {
    border-left: 4px solid #3b82f6;
    color: #1e40af;
  }
  
  @media (max-width: 768px) {
    .toast {
      left: 16px;
      right: 16px;
      top: 16px;
    }
  }
`;
document.head.appendChild(style);

// ========== 初始化 ==========
console.log('🎨 AI Humanize Tool - Block B-05 loaded (前后端联调 + 流式打字机)');

