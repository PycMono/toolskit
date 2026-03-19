/* ==================================================
   Tool Box Nova - AI Content Detector
   Block A-04: 结果面板 UI + 圆形仪表盘动画
   ================================================== */

const MIN_CHARS = 50;    // 最小字数才能检测
const MAX_CHARS = 5000;
const CIRCUMFERENCE = 314.16; // 2 * π * r(50)

// ========== Tab 切换 ==========
function switchTab(tabName, btn) {
  // ...existing code...
  document.querySelectorAll('.tab-content').forEach(el => {
    el.style.display = 'none';
    el.classList.remove('tab-content--active');
  });
  document.querySelectorAll('.input-tab').forEach(el => {
    el.classList.remove('input-tab--active');
  });
  const targetTab = document.getElementById('tab-' + tabName);
  if (targetTab) {
    targetTab.style.display = 'block';
    targetTab.classList.add('tab-content--active');
  }
  btn.classList.add('input-tab--active');
}

// ========== 输入变化：更新字数 + 按钮状态 ==========
function onInputChange(textarea) {
  // ...existing code...
  const len = textarea.value.length;
  const counter = document.getElementById('char-count');

  if (counter) {
    counter.textContent = len + ' / ' + MAX_CHARS;
    counter.classList.toggle('char-count--warning', len >= MAX_CHARS * 0.9);
  }

  if (len > MAX_CHARS) {
    textarea.value = textarea.value.substring(0, MAX_CHARS);
  }

  const btn = document.getElementById('btn-detect');
  if (btn) {
    btn.disabled = textarea.value.trim().length < MIN_CHARS;
  }
}

// ========== 填入示例文本（AI 生成的段落） + 自动展示 Mock 结果 ==========
function fillExample() {
  const example = `Artificial intelligence has emerged as one of the most transformative technologies of the twenty-first century, fundamentally reshaping how humans interact with information, make decisions, and organize their daily lives. The development of large language models has enabled machines to generate coherent text, answer complex questions, and assist with creative tasks in ways that were previously unimaginable. These systems are trained on vast corpora of text data, learning patterns and relationships between words and concepts to produce highly sophisticated outputs. As AI capabilities continue to advance, researchers and policymakers are increasingly focused on understanding both the potential benefits and the significant risks associated with widespread deployment of these technologies.`;

  const textarea = document.getElementById('detect-input');
  if (textarea) {
    textarea.value = example;
    onInputChange(textarea);
  }

  // 切换到文本 Tab（如果不在）
  const textTabBtn = document.querySelector('[data-tab="text"]');
  if (textTabBtn) {
    switchTab('text', textTabBtn);
  }

  // 延迟 500ms 后展示 mock 结果（模拟检测流程）
  setTimeout(() => {
    renderResult({
      overall_score:  87,
      assessment:     'likely_ai',
      word_count:     342,
      sentence_count: 4,
      sentences: [
        {
          text: 'Artificial intelligence has emerged as one of the most transformative technologies of the twenty-first century, fundamentally reshaping how humans interact with information, make decisions, and organize their daily lives.',
          start_index: 0,
          end_index: 221,
          ai_score: 92,
          label: 'ai_high',
          explanation: 'Highly uniform sentence structure with AI-typical phrasing'
        },
        {
          text: 'The development of large language models has enabled machines to generate coherent text, answer complex questions, and assist with creative tasks in ways that were previously unimaginable.',
          start_index: 222,
          end_index: 410,
          ai_score: 88,
          label: 'ai_high',
          explanation: 'Formal language and predictable structure common in AI text'
        },
        {
          text: 'These systems are trained on vast corpora of text data, learning patterns and relationships between words and concepts to produce highly sophisticated outputs.',
          start_index: 411,
          end_index: 574,
          ai_score: 56,
          label: 'ai_medium',
          explanation: 'Mixed indicators - technical content but natural flow'
        },
        {
          text: 'As AI capabilities continue to advance, researchers and policymakers are increasingly focused on understanding both the potential benefits and the significant risks associated with widespread deployment of these technologies.',
          start_index: 575,
          end_index: 799,
          ai_score: 85,
          label: 'ai_high',
          explanation: 'Generic concluding statement typical of AI-generated content'
        }
      ]
    });
  }, 500);
}

// ========== Block A-07: 开始检测（完整实现） ==========
/**
 * 触发 AI 检测（点击按钮调用）
 */
async function startDetection() {
  const input = document.getElementById('detect-input');
  const text  = input.value.trim();

  if (!text || text.length < MIN_CHARS) {
    showToast(`请输入至少 ${MIN_CHARS} 个字符`, 'error');
    return;
  }

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
    renderHighlight(data.sentences); // A-05b

    // 4. 平滑滚动到结果区域（移动端）
    if (window.innerWidth < 768) {
      document.getElementById('result-panel')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }

  } catch (err) {
    hideResultSkeleton();  // 恢复结果面板空态

    if (err.name === 'TimeoutError' || err.message.includes('timeout')) {
      showToast(window.i18n?.['ailab.detector.error.timeout'] || '请求超时，请稍后重试', 'error');
    } else {
      showToast(window.i18n?.['ailab.detector.error.failed'] || '检测失败，请稍后重试', 'error');
    }
    console.error('Detection error:', err);
  } finally {
    // 5. 恢复按钮状态
    setDetectLoading(false);
  }
}

/* ── Loading 状态 ───────────────────────────────── */
function setDetectLoading(loading) {
  const btn     = document.getElementById('btn-detect');
  const btnText = document.getElementById('btn-detect-text');

  if (!btn || !btnText) return;

  if (loading) {
    btn.disabled = true;
    btnText.innerHTML = `
      <svg class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2.5">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
      ${window.i18n?.['ailab.detector.btn.checking'] || '检测中...'}
    `;
  } else {
    const input = document.getElementById('detect-input');
    btn.disabled = input ? input.value.trim().length < MIN_CHARS : true;
    btnText.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      ${window.i18n?.['ailab.detector.btn.check'] || '检测 AI 内容'}
    `;
  }
}

/* ── 骨架屏 ─────────────────────────────────────── */
function showResultSkeleton() {
  const panel = document.getElementById('result-panel');
  if (!panel) return;

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
  // 恢复结果面板原始内容为空态
  const panel = document.getElementById('result-panel');
  if (!panel) return;

  // 重建结果面板结构
  panel.innerHTML = `
    <!-- 空态（检测前） -->
    <div class="result-empty" id="result-empty">
      <div class="result-empty__icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
             stroke="#d1d5db" stroke-width="1.5">
          <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7l-9-5z"/>
        </svg>
      </div>
      <p class="result-empty__title">等待检测</p>
      <p class="result-empty__desc">输入文本后点击检测按钮查看结果</p>
      <div class="result-empty__models">
        <p class="models-label">支持的 AI 模型：</p>
        <ul class="models-list">
          <li>✓ GPT-4 / GPT-3.5</li>
          <li>✓ Claude</li>
          <li>✓ Gemini</li>
          <li>✓ DeepSeek</li>
          <li>✓ 文心一言</li>
          <li>✓ 通义千问</li>
        </ul>
      </div>
    </div>

    <!-- 结果态（初始隐藏） -->
    <div class="result-content" id="result-content" style="display:none">
      <!-- 结果内容将由 renderResult 动态插入 -->
    </div>
  `;
}

/* ── Toast 通知 ─────────────────────────────────── */
function showToast(message, type = 'info') {
  // 复用或创建全局 toast
  const existing = document.getElementById('global-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id        = 'global-toast';
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <span class="toast__icon">${type === 'error' ? '❌' : 'ℹ️'}</span>
    <span class="toast__msg">${escapeHtml(message)}</span>
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

// ========== Block A-04: 渲染结果面板 ==========
/**
 * 渲染结果面板（接受后端数据或 mock 数据）
 * @param {Object} data - DetectResponse 格式
 */
function renderResult(data) {
  // 切换显示状态
  document.getElementById('result-empty').style.display   = 'none';
  document.getElementById('result-content').style.display = 'block';

  const score = Math.round(data.overall_score); // 0–100

  // 1. 仪表盘动画
  animateGauge(score);

  // 2. 总体评估
  renderAssessment(score, data.assessment);

  // 3. 统计数据
  document.getElementById('stat-words').textContent     = data.word_count || 0;
  document.getElementById('stat-sentences').textContent = data.sentence_count || 0;

  const aiCount    = data.sentences ? data.sentences.filter(s => s.label !== 'human').length : 0;
  const humanCount = data.sentences ? data.sentences.filter(s => s.label === 'human').length  : 0;
  document.getElementById('stat-ai-sent').textContent    = aiCount;
  document.getElementById('stat-human-sent').textContent = humanCount;

  // 4. 进度条
  const total = aiCount + humanCount || 1;
  document.getElementById('breakdown-ai').style.width    = (aiCount    / total * 100) + '%';
  document.getElementById('breakdown-human').style.width = (humanCount / total * 100) + '%';

  // 5. 逐句分析 (Block A-05)
  renderSentences(data.sentences || []);

  // 6. 句级高亮渲染 (Block A-05b)
  renderHighlight(data.sentences || []);

  // 7. 人性化按钮携带文本（通过 sessionStorage 传递）
  const inputText = document.getElementById('detect-input').value;
  sessionStorage.setItem('humanize_input', inputText);
}

// ========== Block A-05: 渲染逐句分析 ==========
/**
 * 渲染逐句分析列表
 * @param {Array} sentences - 句子数组
 */
function renderSentences(sentences) {
  const listEl = document.getElementById('sentence-list');
  if (!listEl) return;

  if (!sentences || sentences.length === 0) {
    listEl.innerHTML = '<p style="text-align:center;color:#9ca3af;padding:20px;">无句子数据</p>';
    return;
  }

  listEl.innerHTML = sentences.map((s, idx) => {
    const score = s.ai_score || 0;
    const label = s.label || 'human';

    // 徽章样式（根据 label）
    let badgeClass = 'sentence-item__badge--low';
    if (label === 'ai_high' || score >= 70) {
      badgeClass = 'sentence-item__badge--high';
    } else if (label === 'ai_medium' || (score >= 40 && score < 70)) {
      badgeClass = 'sentence-item__badge--medium';
    }

    // 标签样式
    let labelClass = 'sentence-item__label--human';
    let labelText = '人工';
    if (label === 'ai_high' || score >= 70) {
      labelClass = 'sentence-item__label--ai-high';
      labelText = '高度 AI';
    } else if (label === 'ai_medium' || (score >= 40 && score < 70)) {
      labelClass = 'sentence-item__label--ai-medium';
      labelText = '混合';
    }

    // 转义 HTML
    const escapedText = escapeHtml(s.text || '');
    const escapedExplanation = escapeHtml(s.explanation || '未提供分析');

    return `
      <div class="sentence-item">
        <div class="sentence-item__badge ${badgeClass}">
          ${score}%
        </div>
        <div class="sentence-item__content">
          <p class="sentence-item__text">${escapedText}</p>
          <div class="sentence-item__meta">
            <span class="sentence-item__label ${labelClass}">${labelText}</span>
            <span class="sentence-item__explanation">${escapedExplanation}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * 转义 HTML 特殊字符
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function animateGauge(targetScore) {
  const progress  = document.getElementById('gauge-progress');
  const percentEl = document.getElementById('gauge-percent');

  // 设置颜色
  progress.className = 'gauge-progress';
  if      (targetScore < 40) progress.classList.add('score-low');
  else if (targetScore < 70) progress.classList.add('score-medium');
  else                       progress.classList.add('score-high');

  // stroke-dashoffset 动画（从满圆到目标值）
  const targetOffset = CIRCUMFERENCE * (1 - targetScore / 100);
  let   startTime    = null;
  const duration     = 1000; // 1秒

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed  = timestamp - startTime;
    const t        = Math.min(elapsed / duration, 1);
    const eased    = 1 - Math.pow(1 - t, 3); // ease-out cubic

    // 圆弧进度
    progress.style.strokeDashoffset = CIRCUMFERENCE - (CIRCUMFERENCE - targetOffset) * eased;

    // 数字从 0 滚动到目标值
    percentEl.textContent = Math.round(targetScore * eased) + '%';

    if (t < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

function renderAssessment(score, assessment) {
  const box  = document.getElementById('assessment-box');
  const icon = document.getElementById('assessment-icon');
  const text = document.getElementById('assessment-text');

  // i18n key → 从 window.i18n 对象获取（由后端注入 JS 变量）
  const msgs = window.i18n || {};

  box.className = 'assessment-box';
  if (assessment === 'likely_ai') {
    box.classList.add('assessment-ai');
    icon.textContent = '🔴';
    text.textContent = msgs['ailab.detector.result.assessment.likely_ai']
        || `该文本极可能由 AI 生成（${score}% 置信度）`;
  } else if (assessment === 'likely_human') {
    box.classList.add('assessment-human');
    icon.textContent = '🟢';
    text.textContent = msgs['ailab.detector.result.assessment.likely_human']
        || '该文本极可能由人工撰写';
  } else {
    box.classList.add('assessment-mixed');
    icon.textContent = '🟡';
    text.textContent = msgs['ailab.detector.result.assessment.mixed']
        || '该文本包含 AI 和人工混合内容';
  }
}

// exportPDF 占位（A-07 实现）
function exportPDF() {
  console.log('Export PDF — implement in Block A-07');
  alert('导出 PDF 功能将在后续 Block 实现');
}

// ========== Block A-05b: 句级高亮渲染 + Tooltip ==========
/**
 * 将句子数组渲染为带高亮的 HTML，并切换输入区为高亮展示模式
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
    const escapedExplanation = escapeAttr(s.explanation || '未提供分析');
    html += `<span
      class="sentence ${cls}"
      data-idx="${idx}"
      data-score="${s.ai_score}"
      data-label="${s.label}"
      data-explanation="${escapedExplanation}"
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

// ========== 文件上传功能 ==========
let selectedFile = null;

function handleFileDrop(event) {
  event.preventDefault();
  event.stopPropagation();

  const zone = document.getElementById('upload-zone');
  zone.classList.remove('drag-over');

  const files = event.dataTransfer.files;
  if (files.length > 0) {
    processFile(files[0]);
  }
}

function handleFileSelect(input) {
  if (input.files && input.files[0]) {
    processFile(input.files[0]);
  }
}

function processFile(file) {
  // 检查文件大小
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    alert('文件大小超过 5MB 限制');
    return;
  }

  // 检查文件格式
  const allowedExts = ['txt', 'pdf', 'docx'];
  const ext = file.name.split('.').pop().toLowerCase();
  if (!allowedExts.includes(ext)) {
    alert('不支持的文件格式。仅支持 .txt, .pdf, .docx');
    return;
  }

  selectedFile = file;

  // 更新 UI 显示文件信息
  const zone = document.getElementById('upload-zone');
  zone.innerHTML = `
    <div class="file-selected">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="12" y1="18" x2="12" y2="12"/>
        <line x1="9" y1="15" x2="15" y2="15"/>
      </svg>
      <p class="file-name">${file.name}</p>
      <p class="file-size">${formatFileSize(file.size)}</p>
      <button class="btn-secondary" onclick="resetFileUpload()">重新选择</button>
    </div>
  `;

  // 启用检测按钮
  const btn = document.getElementById('btn-detect');
  if (btn) btn.disabled = false;
}

function resetFileUpload() {
  selectedFile = null;
  const zone = document.getElementById('upload-zone');
  zone.innerHTML = `
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
    <p class="upload-zone__text">拖放文件到此处，或点击选择</p>
    <p class="upload-zone__formats">支持 .txt · .pdf · .docx，最大 5MB</p>
    <input type="file" id="file-input" accept=".txt,.pdf,.docx" style="display:none" onchange="handleFileSelect(this)">
    <button class="btn-secondary" onclick="document.getElementById('file-input').click()">选择文件</button>
  `;

  const btn = document.getElementById('btn-detect');
  if (btn) btn.disabled = true;
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ========== URL 提取功能 ==========
function fetchURL() {
  const urlInput = document.getElementById('url-input');
  const url = urlInput ? urlInput.value.trim() : '';

  if (!url) {
    showToast('请输入 URL', 'error');
    return;
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    showToast('URL 格式错误，必须以 http:// 或 https:// 开头', 'error');
    return;
  }

  setDetectLoading(true);
  showResultSkeleton();

  fetch('/api/ailab/detect-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
    signal: AbortSignal.timeout(35000),
  })
  .then(response => response.json())
  .then(data => {
    setDetectLoading(false);
    if (data.success) {
      renderResult(data);
      if (data.sentences) renderHighlight(data.sentences);
    } else {
      hideResultSkeleton();
      showToast(data.message || (window.i18n?.['ailab.detector.error.failed'] || '检测失败'), 'error');
    }
  })
  .catch(err => {
    setDetectLoading(false);
    hideResultSkeleton();
    if (err.name === 'TimeoutError' || err.message.includes('timeout')) {
      showToast(window.i18n?.['ailab.detector.error.timeout'] || '请求超时，请稍后重试', 'error');
    } else {
      showToast(window.i18n?.['ailab.detector.error.failed'] || '检测失败，请稍后重试', 'error');
    }
  });
}

// ========== 修改检测按钮功能以支持三种输入方式 ==========
function detectContent() {
  // 获取当前激活的 Tab
  const activeTab = document.querySelector('.input-tab--active');
  if (!activeTab) return;

  const tabType = activeTab.dataset.tab;

  if (tabType === 'text') {
    // 文本检测 — 委托给完整实现的 startDetection()
    startDetection();

  } else if (tabType === 'file') {
    // 文件检测
    if (!selectedFile) {
      showToast('请先选择文件', 'error');
      return;
    }

    setDetectLoading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    fetch('/api/ailab/detect-file', {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(35000),
    })
    .then(response => response.json())
    .then(data => {
      setDetectLoading(false);
      if (data.success) {
        renderResult(data);
      } else {
        showToast(data.message || (window.i18n?.['ailab.detector.error.failed'] || '检测失败'), 'error');
      }
    })
    .catch(err => {
      setDetectLoading(false);
      if (err.name === 'TimeoutError' || err.message.includes('timeout')) {
        showToast(window.i18n?.['ailab.detector.error.timeout'] || '请求超时，请稍后重试', 'error');
      } else {
        showToast(window.i18n?.['ailab.detector.error.failed'] || '检测失败，请稍后重试', 'error');
      }
    });

  } else if (tabType === 'url') {
    // URL 检测
    fetchURL();
  }
}


// ========== 初始化 + 预填功能 ==========
window.addEventListener('DOMContentLoaded', () => {
  // 从人性化工具跳转过来的预填文本
  const prefillDetect = sessionStorage.getItem('detect_input');
  if (prefillDetect) {
    const input = document.getElementById('detect-input');
    if (input) {
      input.value = prefillDetect;
      onInputChange(input);
      sessionStorage.removeItem('detect_input');
      console.log('✅ Pre-filled text from humanizer');
    }
  }
});

console.log('🤖 AI Content Detector - Block A-04 loaded (Result Panel UI)');

