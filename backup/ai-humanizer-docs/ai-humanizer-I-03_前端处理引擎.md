<!-- ai-humanizer-I-03_前端处理引擎.md -->

# AI Humanizer — 前端处理引擎

---

## 1. 技术选型表

| 场景 | 技术方案 | 选型原因 |
|------|---------|---------|
| 文本处理 & AI 调用 | Fetch API → 后端 Go `/api/ai/humanize` | 复杂 prompt 逻辑统一在服务端，前端轻量 |
| 流式输出（SSE） | `EventSource` / `fetch + ReadableStream` | 逐 token 打字机效果，体验远超竞品 |
| AI 检测可视化 | Chart.js 4.x（甜甜圈图） | 轻量、动画流畅、CDN 可用 |
| PDF 解析 | PDF.js 3.x | 浏览器内纯前端解析，无服务端依赖 |
| DOCX 解析 | mammoth.js | 精准提取 Word 文档文字内容 |
| DOCX 下载 | docx.js（UMD） | 浏览器内生成 .docx，格式保真 |
| 同义词查询 | 内置词库（小型 JSON）+ 可选后端词库 | 常见 AI 词汇提前缓存，网络请求 fallback |
| 可读性评分 | Flesch-Kincaid 算法（纯JS实现） | 无需外部依赖 |
| 历史记录 | `localStorage`（JSON 序列化）| 无需后端，离线可用 |
| 主题切换 | CSS `data-theme` 属性 + `localStorage` 持久化 | 无闪烁切换 |

---

## 2. 引擎架构说明

### 全局状态对象

```javascript
// static/js/ai-humanizer.js
const AIHumanizer = (() => {
  // ============================
  // 全局状态
  // ============================
  const STATE = {
    // 输入
    inputText:        '',
    inputWordCount:   0,
    inputCharCount:   0,
    inputAIScore:     null,   // 0-100，null 表示未检测

    // 配置
    mode:             'basic',       // basic | standard | aggressive | academic | creative | business
    tone:             'neutral',     // neutral | formal | casual
    outputLang:       'en',
    preserveFormat:   true,
    preserveCitations:false,

    // 输出
    outputText:       '',
    outputWordCount:  0,
    outputAIScore:    null,
    readabilityScore: null,

    // 处理状态
    isProcessing:     false,
    isDetecting:      false,
    abortController:  null,   // 用于中止 SSE/fetch

    // 流式状态
    streamBuffer:     '',
    streamTimer:      null,

    // 历史记录（最多10条）
    history:          [],

    // UI 状态
    themeMode:        'dark',    // dark | light
    historyOpen:      false,
    synonymTarget:    null,      // 当前点击的词语 DOM 节点

    // Chart.js 实例
    chartInput:       null,
    chartOutput:      null,
  };

  // ============================
  // 常量
  // ============================
  const MAX_WORDS      = 10000;
  const MAX_FILE_SIZE  = 10 * 1024 * 1024; // 10MB
  const HISTORY_LIMIT  = 10;
  const STREAM_CHUNK_DELAY = 16; // ms，流式输出间隔（60fps）

  // ...（以下为各函数实现）
})();
```

### 核心函数职责说明

#### `onInputChange(event)`
```javascript
// 职责：实时更新字数/字符数统计，同步到 STATE
function onInputChange(event) {
  STATE.inputText      = event.target.value;
  STATE.inputWordCount = countWords(STATE.inputText);
  STATE.inputCharCount = STATE.inputText.length;

  // 更新 UI 统计
  document.getElementById('input-word-count').textContent =
    formatWordCount(STATE.inputWordCount);
  document.getElementById('input-char-count').textContent =
    `${STATE.inputCharCount} chars`;

  // 超限警告
  if (STATE.inputWordCount > MAX_WORDS) {
    showToast(t('error.too_long'), 'error');
    // 截断到 MAX_WORDS
    event.target.value = truncateToWords(STATE.inputText, MAX_WORDS);
    STATE.inputText = event.target.value;
  }

  // 重置 AI 分数（输入变化后，旧分数失效）
  if (STATE.inputAIScore !== null) {
    STATE.inputAIScore = null;
    updateScoreRing('input', null);
  }
}
```

#### `onDragOver(event)` / `onDragLeave(event)` / `onDrop(event)`
```javascript
// 关键：onDragLeave 需排除子元素触发
function onDragLeave(event) {
  // 只在真正离开面板时（relatedTarget 不是面板内子元素）才移除样式
  const panel = document.getElementById('panel-input');
  if (!panel.contains(event.relatedTarget)) {
    panel.classList.remove('drag-over');
  }
}

function onDrop(event) {
  event.preventDefault();
  const panel = document.getElementById('panel-input');
  panel.classList.remove('drag-over');

  const file = event.dataTransfer.files[0];
  if (file) parseFile(file);
}
```

#### `parseFile(file)`
```javascript
// 职责：校验文件类型/大小，分发到对应解析器
async function parseFile(file) {
  // 大小校验
  if (file.size > MAX_FILE_SIZE) {
    return showToast(t('error.file_too_large'), 'error');
  }

  const ext = file.name.split('.').pop().toLowerCase();
  let text = '';

  if (ext === 'txt') {
    text = await file.text();
  } else if (ext === 'pdf') {
    text = await parsePDF(file);      // 使用 PDF.js
  } else if (ext === 'docx') {
    text = await parseDOCX(file);     // 使用 mammoth.js
  } else {
    return showToast(t('error.unsupported_format'), 'error');
  }

  // 填入输入框
  const textarea = document.getElementById('input-text');
  textarea.value = text;
  onInputChange({ target: textarea });
  showToast(`File loaded: ${file.name}`, 'success');
}
```

#### `parsePDF(file)` — PDF.js 解析
```javascript
async function parsePDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page    = await pdf.getPage(i);
    const content = await page.getTextContent();
    fullText += content.items.map(item => item.str).join(' ') + '\n';
  }
  return fullText.trim();
}
```

#### `parseDOCX(file)` — mammoth.js 解析
```javascript
async function parseDOCX(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result      = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}
```

#### `humanize(isRetry = false)`
```javascript
// 职责：校验输入，构建请求，启动 SSE 流式或普通 fetch
async function humanize(isRetry = false) {
  // 1. 校验
  if (!STATE.inputText.trim()) {
    return showToast(t('error.empty_input'), 'error');
  }
  if (STATE.isProcessing) return;

  // 2. Captcha 校验（若启用）
  if (window.__captchaEnabled__ && !STATE.captchaToken) {
    return showToast(t('error.captcha'), 'warning');
  }

  // 3. 设置处理状态
  STATE.isProcessing = true;
  STATE.abortController = new AbortController();
  setHumanizeBtnState('loading');
  showOutputProcessing();
  startProgressBar();

  // 记录开始时间（用于 GA 事件）
  const startTime = Date.now();

  try {
    const response = await fetch('/api/ai/humanize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: STATE.abortController.signal,
      body: JSON.stringify({
        text:             STATE.inputText,
        mode:             STATE.mode,
        tone:             STATE.tone,
        outputLang:       STATE.outputLang,
        preserveFormat:   STATE.preserveFormat,
        captchaToken:     STATE.captchaToken || '',
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'API Error');
    }

    // 4. 流式读取（SSE / ReadableStream）
    await readStream(response, (chunk) => {
      STATE.streamBuffer += chunk;
      renderStreamOutput(STATE.streamBuffer);
      updateProgressBar(estimateProgress(STATE.streamBuffer, STATE.inputWordCount));
    });

    // 5. 完成处理
    STATE.outputText = STATE.streamBuffer;
    STATE.outputWordCount = countWords(STATE.outputText);
    STATE.streamBuffer = '';

    finalizeOutput();
    finishProgressBar();

    // 自动检测输出 AI 分数
    await detectAI('output');

    // 保存历史
    saveHistory();

    // GA 事件
    const durationMs = Date.now() - startTime;
    document.dispatchEvent(new CustomEvent('humanize:done', {
      detail: { durationMs, aiScoreAfter: STATE.outputAIScore }
    }));

  } catch (err) {
    if (err.name === 'AbortError') return; // 用户主动中止
    showToast(t('error.api_fail'), 'error');
    document.dispatchEvent(new CustomEvent('humanize:error', {
      detail: { message: err.message }
    }));
  } finally {
    STATE.isProcessing = false;
    setHumanizeBtnState('idle');
    STATE.captchaToken = null; // 重置 captcha
  }
}
```

#### `readStream(response, onChunk)` — SSE 流式读取
```javascript
async function readStream(response, onChunk) {
  const reader  = response.body.getReader();
  const decoder = new TextDecoder('utf-8');

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    // SSE 格式解析：`data: <token>\n\n`
    const lines = chunk.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const token = line.slice(6);
        if (token === '[DONE]') break;
        onChunk(token);
      }
    }
  }
}
```

#### `renderStreamOutput(text)` — 打字机渲染
```javascript
function renderStreamOutput(text) {
  const outputDiv = document.getElementById('output-text');
  const emptyDiv  = document.getElementById('output-empty');
  const procDiv   = document.getElementById('output-processing');

  if (outputDiv.style.display === 'none') {
    emptyDiv.style.display  = 'none';
    procDiv.style.display   = 'none';
    outputDiv.style.display = 'block';
  }

  // 使用 innerHTML 渲染（支持换行），注意 XSS 转义
  outputDiv.innerHTML = escapeHTML(text) + '<span class="processing-cursor"></span>';

  // 自动滚动到底部
  outputDiv.scrollTop = outputDiv.scrollHeight;
}
```

#### `detectAI(panel = 'input')` — AI 检测
```javascript
async function detectAI(panel = 'input') {
  const text = panel === 'input' ? STATE.inputText : STATE.outputText;
  if (!text.trim()) return;

  const isInput = panel === 'input';
  if (isInput) {
    STATE.isDetecting = true;
    document.getElementById('btn-detect').textContent = t('action.detect.loading');
  }

  try {
    const res = await fetch('/api/ai/detect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();

    const score = Math.round(data.ai_score * 100); // 0-100

    if (isInput) {
      STATE.inputAIScore = score;
      animateScoreRing('input', score);
    } else {
      STATE.outputAIScore = score;
      animateScoreRing('output', score);
      showImprovementBadge();
    }

    document.dispatchEvent(new CustomEvent('detect:done', {
      detail: { score, panel }
    }));
  } catch (err) {
    showToast(t('error.api_fail'), 'error');
  } finally {
    if (isInput) {
      STATE.isDetecting = false;
      document.getElementById('btn-detect').textContent = t('action.detect');
    }
  }
}
```

#### `animateScoreRing(panel, score)` — Chart.js 分数动画
```javascript
function animateScoreRing(panel, score) {
  const canvasId  = `chart-${panel}`;
  const valueId   = `score-${panel}-value`;
  const chartKey  = panel === 'input' ? 'chartInput' : 'chartOutput';

  const color = score > 70 ? getVar('--c-score-danger')
              : score > 40 ? getVar('--c-score-warning')
              :               getVar('--c-score-good');

  const data = {
    datasets: [{
      data: [score, 100 - score],
      backgroundColor: [color, 'rgba(255,255,255,0.05)'],
      borderWidth: 0,
      borderRadius: 4,
    }]
  };

  // 销毁旧图表
  if (STATE[chartKey]) STATE[chartKey].destroy();

  const ctx = document.getElementById(canvasId).getContext('2d');
  STATE[chartKey] = new Chart(ctx, {
    type: 'doughnut',
    data,
    options: {
      cutout: '72%',
      animation: { duration: 1200, easing: 'easeInOutQuart' },
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
    }
  });

  // 数字滚动动效
  animateNumber(document.getElementById(valueId), 0, score, 1200, '%');
}
```

#### `showImprovementBadge()` — 改善幅度徽章
```javascript
function showImprovementBadge() {
  if (STATE.inputAIScore === null || STATE.outputAIScore === null) return;
  const improvement = STATE.inputAIScore - STATE.outputAIScore;
  const badge = document.getElementById('improvement-badge');
  const text  = document.getElementById('improvement-text');

  text.textContent = `${improvement > 0 ? '-' : '+'}${Math.abs(improvement)}% AI`;
  badge.style.display = 'inline-flex';
  badge.className = `improvement-badge ${improvement > 0 ? 'improvement-badge--good' : 'improvement-badge--bad'}`;
}
```

#### `downloadTxt()`
```javascript
function downloadTxt() {
  if (!STATE.outputText) return;
  const blob = new Blob([STATE.outputText], { type: 'text/plain;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  triggerDownload(url, 'humanized-text.txt');
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
```

#### `downloadDocx()`
```javascript
async function downloadDocx() {
  if (!STATE.outputText) return;

  const { Document, Paragraph, TextRun, Packer } = docx;
  const paragraphs = STATE.outputText.split('\n').map(line =>
    new Paragraph({
      children: [new TextRun({ text: line, size: 24 })]
    })
  );

  const doc  = new Document({ sections: [{ children: paragraphs }] });
  const blob = await Packer.toBlob(doc);
  const url  = URL.createObjectURL(blob);
  triggerDownload(url, 'humanized-text.docx');
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
```

#### `clearAll()`
```javascript
function clearAll() {
  // 中止进行中的请求
  if (STATE.abortController) STATE.abortController.abort();

  // 重置 STATE
  STATE.inputText     = '';
  STATE.outputText    = '';
  STATE.inputAIScore  = null;
  STATE.outputAIScore = null;
  STATE.readabilityScore = null;
  STATE.isProcessing  = false;
  STATE.streamBuffer  = '';

  // 销毁 Chart 实例（释放内存）
  if (STATE.chartInput)  { STATE.chartInput.destroy();  STATE.chartInput  = null; }
  if (STATE.chartOutput) { STATE.chartOutput.destroy(); STATE.chartOutput = null; }

  // 注意：此处不释放 ObjectURL，因为 txt/docx 下载已在下载后即时释放

  // 重置 UI
  document.getElementById('input-text').value = '';
  document.getElementById('output-text').innerHTML = '';
  document.getElementById('output-text').style.display = 'none';
  document.getElementById('output-empty').style.display = 'flex';
  document.getElementById('output-processing').style.display = 'none';
  document.getElementById('input-word-count').textContent = '0 words';
  document.getElementById('output-word-count').textContent = '0 words';
  document.getElementById('improvement-badge').style.display = 'none';
  document.getElementById('btn-humanize-again').style.display = 'none';
  document.getElementById('progress-bar').style.display = 'none';
  document.getElementById('progress-fill').style.width = '0%';

  setHumanizeBtnState('idle');
}
```

#### 工具函数
```javascript
// 字数统计（支持中英混合）
function countWords(text) {
  if (!text.trim()) return 0;
  // 中文按字符计，英文按空格分词
  const zhChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const enWords = text.replace(/[\u4e00-\u9fa5]/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  return zhChars + enWords;
}

// Flesch-Kincaid 可读性评分（英文）
function fleschKincaid(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length || 1;
  const words     = text.trim().split(/\s+/).filter(Boolean).length || 1;
  const syllables = countSyllables(text);
  const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
  return Math.max(0, Math.min(100, Math.round(score)));
}

// Toast 通知
function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  const toast     = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  toast.setAttribute('role', 'alert');
  container.appendChild(toast);

  // 入场动画
  requestAnimationFrame(() => toast.classList.add('toast--visible'));

  // 自动消失
  setTimeout(() => {
    toast.classList.remove('toast--visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, duration);
}

// i18n 翻译帮手
function t(key) {
  return (window.__i18n__ && window.__i18n__[key]) || key;
}

// 进度条伪进度（0→85%，完成后立即跳100%）
let progressInterval = null;
function startProgressBar() {
  const fill = document.getElementById('progress-fill');
  document.getElementById('progress-bar').style.display = 'block';
  let progress = 0;
  progressInterval = setInterval(() => {
    progress += Math.random() * 3;
    if (progress >= 85) { clearInterval(progressInterval); progress = 85; }
    fill.style.width = progress + '%';
  }, 200);
}
function finishProgressBar() {
  clearInterval(progressInterval);
  const fill = document.getElementById('progress-fill');
  fill.style.width = '100%';
  setTimeout(() => {
    document.getElementById('progress-bar').style.display = 'none';
    fill.style.width = '0%';
  }, 600);
}

// 历史记录
function saveHistory() {
  const item = {
    id:        Date.now(),
    mode:      STATE.mode,
    inputText: STATE.inputText.slice(0, 200) + (STATE.inputText.length > 200 ? '...' : ''),
    fullInput: STATE.inputText,
    output:    STATE.outputText,
    scoreBefore: STATE.inputAIScore,
    scoreAfter:  STATE.outputAIScore,
    createdAt: new Date().toISOString(),
  };
  STATE.history.unshift(item);
  if (STATE.history.length > HISTORY_LIMIT) STATE.history.pop();
  localStorage.setItem('ai-humanizer-history', JSON.stringify(STATE.history));
  renderHistoryList();
}

function loadHistory() {
  try {
    const saved = localStorage.getItem('ai-humanizer-history');
    STATE.history = saved ? JSON.parse(saved) : [];
  } catch { STATE.history = []; }
  renderHistoryList();
}

function renderHistoryList() {
  const list = document.getElementById('history-list');
  if (STATE.history.length === 0) {
    list.innerHTML = `<li class="history-empty" data-i18n="history.empty">${t('history.empty')}</li>`;
    return;
  }
  list.innerHTML = STATE.history.map(item => `
    <li class="history-item" role="listitem">
      <div class="history-item__meta">
        <span class="history-item__mode">${item.mode}</span>
        <span class="history-item__time">${timeAgo(item.createdAt)}</span>
        ${item.scoreBefore !== null ? `<span class="history-item__score">
          ${item.scoreBefore}% → ${item.scoreAfter}%
        </span>` : ''}
      </div>
      <p class="history-item__preview">${escapeHTML(item.inputText)}</p>
      <button class="btn btn--sm btn--ghost"
              onclick="AIHumanizer.restoreHistory(${item.id})"
              data-i18n="history.restore">Restore</button>
    </li>
  `).join('');
}

// 数字滚动动效
function animateNumber(el, from, to, duration, suffix = '') {
  const start = performance.now();
  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.round(from + (to - from) * easeInOut(progress));
    el.textContent = value + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// 同义词（内置基础词库，约200个AI常用词）
const SYNONYM_MAP = {
  'utilize': ['use', 'employ', 'apply', 'leverage', 'adopt'],
  'implement': ['carry out', 'execute', 'put in place', 'apply', 'introduce'],
  'facilitate': ['help', 'support', 'enable', 'assist', 'aid'],
  'demonstrate': ['show', 'prove', 'display', 'reveal', 'exhibit'],
  'significant': ['important', 'major', 'key', 'substantial', 'notable'],
  'comprehensive': ['thorough', 'complete', 'detailed', 'full', 'extensive'],
  'leverage': ['use', 'apply', 'employ', 'exploit', 'tap'],
  'innovative': ['new', 'fresh', 'creative', 'original', 'novel'],
  'streamline': ['simplify', 'improve', 'optimize', 'refine', 'smooth'],
  'paramount': ['crucial', 'vital', 'essential', 'critical', 'key'],
  // ...（扩展至200+条）
};

function getSynonyms(word) {
  const lower = word.toLowerCase().replace(/[.,!?;:'"]/g, '');
  return SYNONYM_MAP[lower] || [];
}

function initSynonymInteraction() {
  const outputDiv = document.getElementById('output-text');
  outputDiv.addEventListener('click', function(e) {
    // 查找点击的词语
    const selection = window.getSelection();
    const word = selection.toString().trim() || getWordAtCaret(e);
    if (!word) return;

    const synonyms = getSynonyms(word);
    if (synonyms.length === 0) return;

    showSynonymPanel(e.clientX, e.clientY, word, synonyms);
  });
}

function showSynonymPanel(x, y, word, synonyms) {
  const panel = document.getElementById('synonym-panel');
  document.getElementById('synonym-word').textContent = word;

  const list = document.getElementById('synonym-list');
  list.innerHTML = synonyms.map(syn => `
    <div class="synonym-item" role="listitem"
         onclick="AIHumanizer.applySynonym('${escapeHTML(word)}', '${escapeHTML(syn)}')">
      ${escapeHTML(syn)}
    </div>
  `).join('');

  // 定位
  panel.style.left = `${Math.min(x, window.innerWidth - 290)}px`;
  panel.style.top  = `${Math.min(y + 10, window.innerHeight - 200)}px`;
  panel.style.display = 'block';
}

function applySynonym(original, replacement) {
  // 替换输出文字中第一个匹配的词
  const regex = new RegExp(`\\b${escapeRegex(original)}\\b`, 'i');
  STATE.outputText = STATE.outputText.replace(regex, replacement);
  document.getElementById('output-text').innerHTML =
    escapeHTML(STATE.outputText);
  closeSynonymPanel();
  showToast(`Replaced "${original}" → "${replacement}"`, 'success', 2000);
}

// XSS 防护
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// 主题切换
function toggleTheme() {
  STATE.themeMode = STATE.themeMode === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', STATE.themeMode);
  localStorage.setItem('ai-humanizer-theme', STATE.themeMode);

  document.getElementById('icon-sun').style.display  = STATE.themeMode === 'dark' ? '' : 'none';
  document.getElementById('icon-moon').style.display = STATE.themeMode === 'dark' ? 'none' : '';
}

// 初始化
function init() {
  // 恢复主题
  const savedTheme = localStorage.getItem('ai-humanizer-theme') || 'dark';
  STATE.themeMode = savedTheme;
  document.documentElement.setAttribute('data-theme', savedTheme);

  // 加载历史
  loadHistory();

  // 绑定同义词交互
  initSynonymInteraction();

  // 注入 i18n（Go Template 已将语言包写入 window.__i18n__）
  applyI18n();

  // 恢复用户语言设置
  const savedLang = localStorage.getItem('ai-humanizer-lang') || window.__lang__ || 'en';
  document.getElementById('lang-selector').value = savedLang;
  STATE.outputLang = savedLang;
}

document.addEventListener('DOMContentLoaded', init);
```

---

## 3. UI 事件绑定说明

| 事件 | 触发元素 | 处理要点 |
|------|---------|---------|
| `oninput` | `#input-text` | 实时字数统计，超限截断，重置AI分数 |
| `ondragover` | `#panel-input` | `e.preventDefault()` 允许drop，添加 `drag-over` 类 |
| `ondragleave` | `#panel-input` | 检查 `e.relatedTarget` 是否为面板子元素，只有真正离开才移除样式 |
| `ondrop` | `#panel-input` | `e.preventDefault()`，读取 `e.dataTransfer.files[0]`，调用 `parseFile()` |
| `onchange` | `#file-upload` | 读取 `e.target.files[0]`，调用 `parseFile()` |
| `onclick` | `.mode-btn` | 更新 `STATE.mode`，切换 `mode-btn--active` 类，更新模式说明文字 |
| `onchange` | `#tone-selector` | 更新 `STATE.tone` |
| `onchange` | `#lang-selector` | 更新 `STATE.outputLang`，持久化到 localStorage |
| `onchange` | `#preserve-format` | 更新 `STATE.preserveFormat` |
| `onclick` | `#btn-humanize` | 防抖（isProcessing），调用 `humanize()` |
| `onclick` | `#btn-detect` | 调用 `detectAI('input')` |
| `onclick` | `#btn-copy` | `navigator.clipboard.writeText()`，按钮文字改为「Copied!」1.5s |
| `onclick` | `.faq-question` | 切换 `aria-expanded`，展开/收起 `.faq-answer` |
| `click` | `#output-text`（词语） | 查找同义词，显示 `#synonym-panel`，定位到点击坐标 |
| `keydown` | `document` | `Escape` 关闭同义词面板和历史记录抽屉 |
| `click` | `document`（outside） | 关闭下载下拉菜单和同义词面板 |

---

## 4. 验收标准 Checklist

### 处理正确性
- [ ] Basic 模式：输出与原文含义一致，改动幅度轻微
- [ ] Aggressive 模式：输出句式结构明显重排，与原文不同
- [ ] Academic 模式：保留段落编号、引用格式（[1]、Author, Year）
- [ ] PDF 上传：正确提取文字（含多页），填入输入框
- [ ] DOCX 上传：正确提取文字，不含 XML 标签残留
- [ ] AI 分数检测返回 0-100 范围数值，非 null
- [ ] 处理后自动触发输出区 AI 分数检测

### 性能
- [ ] 文字处理（5000词）在 15 秒内完成，流式输出无卡顿
- [ ] 字数统计更新延迟 < 50ms（输入时无明显滞后）
- [ ] Chart.js 圆形图动画流畅（60fps），无掉帧
- [ ] 同义词面板点击响应 < 100ms

### 内存安全
- [ ] `clearAll()` 调用后，两个 Chart 实例均已 `.destroy()`
- [ ] 下载触发后 5 秒内 ObjectURL 已 `revokeObjectURL`
- [ ] 中止请求（AbortController）后 STATE 正确重置

### 下载
- [ ] 下载 TXT：文件内容与输出区文字完全一致
- [ ] 下载 DOCX：文件可正常被 Word 打开，内容正确，格式基本保留

### 边界情况
- [ ] 空输入时点击 Humanize 显示 Toast 错误，不发送请求
- [ ] 超过 10000 词时自动截断，显示 Toast 提示
- [ ] 上传超过 10MB 文件显示 Toast 错误
- [ ] 网络断开时显示 Toast 错误（`error.api_fail`）
- [ ] 处理中再次点击 Humanize 无效（`isProcessing` 防抖）
- [ ] 历史记录超过10条时最旧的一条被删除
