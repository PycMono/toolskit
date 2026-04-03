'use strict';
// json-tools-core.js — Monaco Editor init + all common utilities

let inputEditor  = null;
let outputEditor = null;
let leftEditor   = null;  // diff tool
let rightEditor  = null;  // diff tool

require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }});

require(['vs/editor/editor.main'], function() {
  const opts = {
    fontSize: 13, minimap: { enabled: false },
    scrollBeyondLastLine: false, automaticLayout: true, wordWrap: 'on',
  };

  const tool = window.JT_TOOL || '';

  if (tool === 'diff') {
    leftEditor = monaco.editor.create(document.getElementById('diffLeftEditor'), {
      ...opts, value: '', language: 'json', theme: 'vs',
    });
    rightEditor = monaco.editor.create(document.getElementById('diffRightEditor'), {
      ...opts, value: '', language: 'json', theme: 'vs',
    });
  } else if (tool === 'schema-validate') {
    const schemaEl = document.getElementById('schemaEditor');
    if (schemaEl) {
      window._schemaEditor = monaco.editor.create(schemaEl, {
        ...opts, value: JSON.stringify({ '$schema': 'http://json-schema.org/draft-07/schema#', type: 'object', properties: {} }, null, 2),
        language: 'json', theme: 'vs',
      });
      window._schemaEditor.onDidChangeModelContent(function() {
        const el = document.getElementById('schemaSize');
        if (el) el.textContent = formatBytes(new Blob([window._schemaEditor.getValue()]).size);
      });
    }
    const inputEl = document.getElementById('inputEditor');
    if (inputEl) {
      inputEditor = monaco.editor.create(inputEl, {
        ...opts, value: '', language: 'json', theme: 'vs',
      });
      inputEditor.onDidChangeModelContent(updateInputStats);
    }
  } else {
    const inputEl = document.getElementById('inputEditor');
    if (inputEl) {
      const inputLang = { 'from-yaml': 'yaml', 'from-xml': 'xml', 'from-sql': 'sql',
        'from-csv': 'plaintext', 'base64': 'plaintext', 'jwt': 'plaintext',
        'jsonc': 'plaintext', 'from-toml': 'toml', 'from-query': 'plaintext',
        'python-dict': 'python' }[tool] || 'json';
      inputEditor = monaco.editor.create(inputEl, {
        ...opts, value: '', language: inputLang, theme: 'vs',
      });
      inputEditor.onDidChangeModelContent(updateInputStats);
    }

    const outputEl = document.getElementById('outputEditor');
    if (outputEl) {
      const outputLang = {
        'to-csv': 'plaintext', 'to-yaml': 'yaml', 'to-xml': 'xml',
        'to-sql': 'sql', 'to-markdown': 'markdown',
        'to-typescript': 'typescript', 'to-python': 'python',
        'to-java': 'java', 'to-csharp': 'csharp', 'to-go': 'go',
        'to-kotlin': 'kotlin', 'to-swift': 'swift', 'to-rust': 'rust',
        'to-php': 'php', 'from-yaml': 'json', 'from-xml': 'json',
        'escape': 'plaintext', 'stringify': 'plaintext',
        'base64': 'plaintext', 'jwt': 'json', 'jsonc': 'json',
        'to-dart': 'dart', 'to-objc': 'objc', 'to-cpp': 'cpp',
        'to-ruby': 'ruby', 'to-scala': 'scala',
        'to-toml': 'toml', 'to-query': 'plaintext', 'from-query': 'json',
        'python-dict': 'python', 'json-generator': 'json',
      }[tool] || 'json';
      outputEditor = monaco.editor.create(outputEl, {
        ...opts, value: '', language: outputLang, theme: 'vs', readOnly: true,
      });
    }
  }

  // Restore from URL hash
  const hash = location.hash.slice(1);
  if (hash && inputEditor) {
    try { inputEditor.setValue(decodeURIComponent(hash)); } catch(e) {}
  }

  // Init tool-specific options bar
  if (typeof initToolOptions === 'function') initToolOptions();
});

/* ── Core API ─────────────────────────────────── */
function getInput()  { return inputEditor?.getValue()  || ''; }
function getOutput() { return outputEditor?.getValue() || ''; }

function setOutput(val, lang) {
  if (!outputEditor) return;
  outputEditor.setValue(val || '');
  if (lang) {
    const langMap = { typescript: 'typescript', python: 'python', java: 'java',
      csharp: 'csharp', go: 'go', kotlin: 'kotlin', swift: 'swift',
      rust: 'rust', php: 'php', yaml: 'yaml', xml: 'xml', sql: 'sql',
      markdown: 'markdown', json: 'json', plaintext: 'plaintext' };
    const monacoLang = langMap[lang] || lang;
    try {
      monaco.editor.setModelLanguage(outputEditor.getModel(), monacoLang);
    } catch(e) {}
  }
  updateOutputStats(val || '');
  // Reset tree view so expand/collapse re-renders with new data
  outputTreeViewVisible = false;
  // If tree was visible, switch back to code view
  const editorDiv = document.getElementById('outputEditor');
  const treeDiv = document.getElementById('outputTree');
  if (editorDiv && treeDiv) {
    editorDiv.style.display = '';
    treeDiv.classList.remove('visible');
    treeDiv.style.display = 'none';
  }
}

function parseInput() {
  const raw = getInput().trim();
  if (!raw) {
    showToast(i18n('json.common.error.empty') || '请先输入 JSON', 'error');
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch(e) {
    showErrorPanel(e, raw);
    return null;
  }
}

function loadExample() {
  const examples = {
    'from-yaml': 'name: John\nage: 30\ncity: Beijing',
    'from-xml':  '<?xml version="1.0"?>\n<root>\n  <name>John</name>\n  <age>30</age>\n</root>',
    'from-csv':  'name,age,city\nAlice,30,Beijing\nBob,25,Shanghai',
    'from-sql':  "INSERT INTO users (name, age) VALUES ('Alice', 30);\nINSERT INTO users (name, age) VALUES ('Bob', 25);",
    'base64':    '{"name":"John","age":30}',
    'jwt':       'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    'jsonc':     '{\n  // This is a comment\n  "name": "John", // inline comment\n  /* block comment */\n  "age": 30, // trailing comma allowed in JSONC\n}',
    'from-toml': '[server]\nhost = "localhost"\nport = 8080\n\n[database]\nurl = "postgres://localhost/mydb"\nmax_connections = 100',
    'from-query': '?name=John&age=30&city=Beijing&active=true&tags=dev&tags=coder',
    'python-dict': "{'name': 'John', 'age': 30, 'hobbies': ['coding', 'reading'], 'active': True, 'address': None}",
  };
  const defaultEx = {
    name: 'John Doe', age: 30, email: 'john@example.com',
    address: { city: 'Beijing', country: 'China' },
    hobbies: ['coding', 'reading', 'hiking'],
    scores: [98.5, 87, 92.3],
  };
  const tool = window.JT_TOOL || '';
  const val  = examples[tool] || JSON.stringify(defaultEx, null, 2);
  inputEditor?.setValue(val);
  clearErrorPanel();
}

function clearInput()  { inputEditor?.setValue(''); clearErrorPanel(); }
function clearOutput() { outputEditor?.setValue(''); }

function copyOutput() {
  const text = getOutput();
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    showToast(i18n('json.common.copy_done') || '已复制！', 'success');
    const btn = document.getElementById('copyBtn');
    if (btn) { const o = btn.textContent; btn.textContent = '✅'; setTimeout(() => btn.textContent = o, 2000); }
  });
}

function downloadOutput(filename, ext) {
  const text = getOutput();
  if (!text) return;
  const tool = window.JT_TOOL || '';
  const extMap = {
    'to-yaml': 'yaml', 'from-yaml': 'json',
    'to-csv':  'csv',  'from-csv':  'json',
    'to-xml':  'xml',  'from-xml':  'json',
    'to-sql':  'sql',  'from-sql':  'json',
    'to-markdown': 'md',
    'to-typescript': 'ts', 'to-python': 'py',
    'to-java': 'java',     'to-csharp': 'cs',
    'to-go':   'go',       'to-kotlin': 'kt',
    'to-swift':'swift',    'to-rust':   'rs',
    'to-php':  'php',
    'to-dart': 'dart',    'to-objc': 'h',
    'to-cpp':  'hpp',     'to-ruby':  'rb',
    'to-scala':'scala',   'to-toml': 'toml',
  };
  const defaultExt = ext || extMap[tool] || 'json';
  const fn = filename || `output.${defaultExt}`;
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  if (window.saveAs) { saveAs(blob, fn); return; }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = fn;
  a.click();
  URL.revokeObjectURL(a.href);
}

// Reverse tool mapping: tool -> its inverse tool
const REVERSE_TOOLS = {
  'escape': 'unescape', 'unescape': 'escape',
  'pretty': 'minify', 'minify': 'pretty',
  'to-yaml': 'from-yaml', 'from-yaml': 'to-yaml',
  'to-xml': 'from-xml', 'from-xml': 'to-xml',
  'to-csv': 'from-csv', 'from-csv': 'to-csv',
  'to-sql': 'from-sql', 'from-sql': 'to-sql',
  'to-excel': 'from-excel', 'from-excel': 'to-excel',
  'to-toml': 'from-toml', 'from-toml': 'to-toml',
  'to-query': 'from-query', 'from-query': 'to-query',
  'stringify': 'unescape',
  'jsonc': 'validate',
  'schema-generate': 'schema-validate',
};

function swapEditors() {
  const a = getInput(), b = getOutput();
  if (!a && !b) {
    showToast(i18n('json.common.swap_empty') || '输入和输出都为空，无法交换', 'info');
    return;
  }
  if (!b) {
    showToast(i18n('json.common.swap_no_output') || '请先执行操作生成输出', 'info');
    return;
  }

  const currentTool = window.JT_TOOL || '';
  const reverseTool = REVERSE_TOOLS[currentTool];

  // If this tool has a reverse/inverse tool, navigate to it with the output as input
  if (reverseTool && b) {
    const maxHash = 8000;
    let hash = '';
    if (b.length <= maxHash) {
      hash = '#' + encodeURIComponent(b);
    }
    const lang = window.JT_LANG || 'en';
    location.href = `/json/${reverseTool}?lang=${lang}${hash}`;
    return;
  }

  // No reverse tool: swap in place
  inputEditor?.setValue(b);
  if (outputEditor) {
    outputEditor.updateOptions({ readOnly: false });
    outputEditor.setValue(a);
    outputEditor.updateOptions({ readOnly: true });
  }
  clearErrorPanel();
  outputTreeViewVisible = false;
  const editorDiv = document.getElementById('outputEditor');
  const treeDiv = document.getElementById('outputTree');
  if (editorDiv && treeDiv) {
    editorDiv.style.display = '';
    treeDiv.classList.remove('visible');
    treeDiv.style.display = 'none';
  }
  showToast(i18n('json.common.swap') || '已交换输入/输出', 'success');
}

// Swap left/right editors for diff tool
function swapDiffEditors() {
  if (!leftEditor || !rightEditor) return;
  const leftVal = leftEditor.getValue();
  const rightVal = rightEditor.getValue();
  leftEditor.setValue(rightVal);
  rightEditor.setValue(leftVal);
  showToast(i18n('json.common.swap') || '已交换左右 JSON', 'success');
}

function uploadFile(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    inputEditor?.setValue(e.target.result);
    clearErrorPanel();
  };
  reader.readAsText(file, 'utf-8');
  input.value = '';
}

// Fetch JSON from URL
async function fetchJsonFromUrl() {
  const input = document.getElementById('jsonUrlInput');
  const url = input?.value?.trim();
  if (!url) {
    showToast(i18n('json.common.url_empty') || '请输入 URL', 'error');
    return;
  }

  const btn = input?.nextElementSibling;
  const origText = btn?.innerHTML;
  if (btn) btn.innerHTML = '...';

  try {
    const resp = await fetch('/api/tools/json/fetch?url=' + encodeURIComponent(url), {
      signal: AbortSignal.timeout(20000)
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error || `Error ${resp.status}`);
    }

    const text = await resp.text();

    if (inputEditor) {
      inputEditor.setValue(text);
      // Auto-format if valid JSON
      try {
        const parsed = JSON.parse(text);
        const formatted = JSON.stringify(parsed, null, 2);
        inputEditor.setValue(formatted);
        showToast(i18n('json.common.fetch_success') || '已加载 JSON', 'success');
      } catch (e) {
        // Not valid JSON, just set as-is
        showToast(i18n('json.common.fetch_success_raw') || '已加载内容（非 JSON）', 'info');
      }
    }
    clearErrorPanel();
  } catch (err) {
    const msg = err.name === 'TimeoutError'
      ? (i18n('json.common.fetch_timeout') || '请求超时')
      : (err.message || (i18n('json.common.fetch_error') || 'URL 抓取失败'));
    showToast(msg, 'error');
  } finally {
    if (btn && origText) btn.innerHTML = origText;
  }
}

function updateInputStats() {
  const text = getInput();
  const el   = document.getElementById('inputSize');
  if (el) el.textContent = formatBytes(new Blob([text]).size);
}

function updateOutputStats(text) {
  const el = document.getElementById('outputSize');
  if (el) el.textContent = formatBytes(new Blob([text || '']).size);
}

/* ── Error Panel ──────────────────────────────── */
function showErrorPanel(err, raw) {
  const panel = document.getElementById('errorPanel');
  const titleEl = document.getElementById('errorTitle');
  const bodyEl  = document.getElementById('errorBody');
  if (!panel) return;

  const analysis = analyzeJsonError(err, raw || '');
  if (titleEl) titleEl.textContent = '❌ JSON 格式错误';
  if (bodyEl) bodyEl.innerHTML = `
    <div class="jt-error-location">📍 第 <strong>${analysis.line}</strong> 行，第 <strong>${analysis.col}</strong> 列</div>
    <div class="jt-error-message">${escapeHtml(analysis.message)}</div>
    ${analysis.suggestion ? `<div class="jt-error-suggestion">💡 ${escapeHtml(analysis.suggestion)}</div>` : ''}
    ${analysis.context ? `<pre class="jt-error-context">${escapeHtml(analysis.context)}</pre>` : ''}
  `;
  panel.style.display = 'block';

  if (analysis.line && inputEditor) {
    inputEditor.deltaDecorations([], [{
      range: new monaco.Range(analysis.line, 1, analysis.line, 9999),
      options: { isWholeLine: true, className: 'jt-error-line' },
    }]);
    inputEditor.revealLineInCenter(analysis.line);
  }
}

function hideErrorPanel() {
  const panel = document.getElementById('errorPanel');
  if (panel) panel.style.display = 'none';
  if (inputEditor) {
    try {
      const decorations = inputEditor.getModel()?.getAllDecorations() || [];
      inputEditor.deltaDecorations(decorations.map(d => d.id), []);
    } catch(e) {}
  }
}

function clearErrorPanel() { hideErrorPanel(); }

function analyzeJsonError(err, raw) {
  const msg   = err?.message || String(err);
  const lines = raw.split('\n');
  let line = 1, col = 1;
  const posMatch = msg.match(/position (\d+)/i);
  if (posMatch) {
    const pos = parseInt(posMatch[1]);
    let count = 0;
    for (let i = 0; i < lines.length; i++) {
      if (count + lines[i].length + 1 > pos) {
        line = i + 1; col = pos - count + 1; break;
      }
      count += lines[i].length + 1;
    }
  }
  const context = lines.slice(Math.max(0, line - 2), line + 1).join('\n');
  const near    = lines[line - 1]?.substring(0, col + 5) || '';
  let suggestion = '';
  if (/,\s*[}\]]/.test(raw))           suggestion = '移除尾随逗号（最后一个元素后不能有逗号）';
  else if (/[^\\]'/.test(near))        suggestion = '使用双引号 " 代替单引号 \'';
  else if (/:\s*undefined/.test(near)) suggestion = 'undefined 不是合法 JSON 值，请使用 null';
  else if (/\/\//.test(raw))           suggestion = 'JSON 不支持注释，请使用 /json/jsonc 工具先处理';
  else if (/{[^}]*$/.test(raw))        suggestion = '对象括号 { 未闭合';
  else if (/\[[^\]]*$/.test(raw))      suggestion = '数组括号 [ 未闭合';
  return { line, col, message: msg, suggestion, context };
}

/* ── Utilities ────────────────────────────────── */
function formatBytes(bytes) {
  if (bytes < 1024)      return `${bytes} B`;
  if (bytes < 1048576)   return `${(bytes/1024).toFixed(1)} KB`;
  return `${(bytes/1048576).toFixed(2)} MB`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function i18n(key) {
  return (window.JT_I18N || {})[key] || key;
}

function showToast(msg, type = 'info') {
  const c = document.getElementById('toastContainer');
  if (!c) return;
  const el = document.createElement('div');
  el.className   = `jt-toast jt-toast--${type}`;
  el.textContent = msg;
  c.appendChild(el);
  requestAnimationFrame(() => el.classList.add('jt-toast--show'));
  setTimeout(() => { el.classList.remove('jt-toast--show'); setTimeout(() => el.remove(), 300); }, 3000);
}


// Record recent tool visit
function recordVisit(key, icon, name) {
  try {
    let recent = JSON.parse(localStorage.getItem('jt_recent_tools') || '[]');
    recent = recent.filter(t => t.key !== key);
    recent.unshift({ key, icon, name });
    recent = recent.slice(0, 6);
    localStorage.setItem('jt_recent_tools', JSON.stringify(recent));
  } catch(e) {}
}

// Auto-record on load
document.addEventListener('DOMContentLoaded', () => {
  const tool = window.JT_TOOL;
  if (tool) {
    const icon = document.querySelector('.jt-tool-hero__icon')?.textContent?.trim() || '🔧';
    const name = document.querySelector('.jt-tool-hero__title')?.textContent?.trim() || tool;
    recordVisit(tool, icon, name);
  }
  loadHistory();
  restoreSidebarState();
  initKeyboardShortcuts();
});

/* ── Keyboard Shortcuts ─────────────────────────── */
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter: Run processJson
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (isFullscreen) {
        processJsonFullscreen();
      } else if (typeof processJson === 'function') {
        processJson();
      }
    }
    // Escape: Close fullscreen or error panel
    if (e.key === 'Escape' && !isFullscreen) {
      hideErrorPanel();
    }
  });
}

/* ── History Sidebar ───────────────────────────── */
const HISTORY_KEY = 'jt_input_history';
const MAX_HISTORY = 50;
const MAX_INPUT_SIZE = 10000; // 10KB per entry

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch(e) { return []; }
}

function saveHistory(list) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch(e) {}
}

function recordHistory(toolKey, toolName, icon, input) {
  if (!input || !input.trim()) return;
  let history = getHistory();
  // Remove duplicate (same input)
  history = history.filter(h => h.input !== input);
  // Truncate input if too long
  const savedInput = input.length > MAX_INPUT_SIZE ? input.slice(0, MAX_INPUT_SIZE) : input;
  // Add to front
  history.unshift({
    toolKey, toolName, icon,
    input: savedInput,
    timestamp: Date.now()
  });
  // Keep max
  if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);
  saveHistory(history);
  renderHistory();
}

function loadHistory() {
  renderHistory();
}

function renderHistory() {
  const container = document.getElementById('historyList');
  if (!container) return;
  const history = getHistory();
  if (history.length === 0) {
    container.innerHTML = `<div class="jt-history-empty">${i18n('json.history.empty')}</div>`;
    return;
  }
  container.innerHTML = history.map((h, i) => {
    const preview = h.input.slice(0, 40).replace(/\n/g, ' ');
    const time = formatHistoryTime(h.timestamp);
    return `
      <div class="jt-history-item" onclick="restoreHistory(${i})" title="${i18n('json.history.restore')}">
        <button class="jt-history-item__delete" onclick="event.stopPropagation();deleteHistoryItem(${i})" title="🗑️">✕</button>
        <div class="jt-history-item__header">
          <span class="jt-history-item__icon">${h.icon}</span>
          <span class="jt-history-item__tool">${escapeHtml(h.toolName)}</span>
          <span class="jt-history-item__time">${time}</span>
        </div>
        <div class="jt-history-item__preview">${escapeHtml(preview)}${h.input.length > 40 ? '...' : ''}</div>
      </div>
    `;
  }).join('');
}

function restoreHistory(index) {
  const history = getHistory();
  const item = history[index];
  if (!item) return;

  const currentTool = window.JT_TOOL || '';

  // If history item is from a different tool, navigate to that tool
  if (item.toolKey && item.toolKey !== currentTool) {
    const input = item.input || '';
    const maxHash = 8000;
    let hash = '';
    if (input && input.length <= maxHash) {
      hash = '#' + encodeURIComponent(input);
    }
    const lang = window.JT_LANG || 'en';
    location.href = `/json/${item.toolKey}?lang=${lang}${hash}`;
    return;
  }

  // Same tool: just restore input
  if (inputEditor) {
    inputEditor.setValue(item.input);
    clearErrorPanel();
  }
  showToast(i18n('json.history.restore') || '已恢复', 'success');
}

function clearHistory() {
  if (!confirm(i18n('json.history.clear_confirm'))) return;
  saveHistory([]);
  renderHistory();
  showToast(i18n('json.history.cleared') || '已清空', 'info');
}

function deleteHistoryItem(index) {
  let history = getHistory();
  if (index >= 0 && index < history.length) {
    history.splice(index, 1);
    saveHistory(history);
    renderHistory();
  }
}

function formatHistoryTime(ts) {
  const d = new Date(ts);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return i18n('json.history.time.just_now') || '刚刚';
  if (diff < 3600000) return Math.floor(diff/60000) + i18n('json.history.time.minutes');
  if (diff < 86400000) return Math.floor(diff/3600000) + i18n('json.history.time.hours');
  if (diff < 604800000) return Math.floor(diff/86400000) + i18n('json.history.time.days');
  return d.toLocaleDateString();
}

function toggleHistorySidebar() {
  const sidebar = document.getElementById('historySidebar');
  const toggle = document.getElementById('sidebarToggle');
  if (!sidebar) return;
  const isOpen = sidebar.classList.toggle('open');
  if (toggle) {
    toggle.style.left = isOpen ? '280px' : '0';
    // Update arrow direction
    const arrow = toggle.querySelector('.jt-sidebar-toggle__arrow');
    if (arrow) arrow.textContent = isOpen ? '◀' : '▶';
  }
  // Save state
  try { localStorage.setItem('jt_sidebar_open', isOpen); } catch(e) {}
}

function restoreSidebarState() {
  try {
    // Default to open if no saved state
    const savedState = localStorage.getItem('jt_sidebar_open');
    const isOpen = savedState === null ? true : savedState === 'true';
    const sidebar = document.getElementById('historySidebar');
    const toggle = document.getElementById('sidebarToggle');
    if (isOpen && sidebar) {
      sidebar.classList.add('open');
      if (toggle) {
        toggle.style.left = '280px';
        const arrow = toggle.querySelector('.jt-sidebar-toggle__arrow');
        if (arrow) arrow.textContent = '◀';
      }
    } else if (toggle) {
      const arrow = toggle.querySelector('.jt-sidebar-toggle__arrow');
      if (arrow) arrow.textContent = '▶';
    }
  } catch(e) {}
}

/* ── Tool Selector Dropdown ────────────────────── */
function toggleToolSelector() {
  const sel = document.getElementById('toolSelector');
  if (!sel) return;
  sel.classList.toggle('open');
  // Focus search input
  const search = document.getElementById('toolSearchInput');
  if (sel.classList.contains('open') && search) {
    setTimeout(() => search.focus(), 50);
  }
}

function filterToolDropdown(query) {
  const q = (query || '').toLowerCase().trim();
  let visibleCount = 0;
  document.querySelectorAll('.jt-tool-dropdown__item').forEach(item => {
    const name = (item.dataset.name || '').toLowerCase();
    const keywords = (item.dataset.keywords || '').toLowerCase();
    const visible = !q || name.includes(q) || keywords.includes(q);
    item.style.display = visible ? '' : 'none';
    if (visible) visibleCount++;
  });
  document.querySelectorAll('.jt-tool-dropdown__group').forEach(g => {
    const visible = [...g.querySelectorAll('.jt-tool-dropdown__item')].some(i => i.style.display !== 'none');
    g.style.display = visible ? '' : 'none';
  });
  // Show/hide "no results" message
  const dropdown = document.getElementById('toolDropdown');
  if (dropdown) {
    let noResults = dropdown.querySelector('.jt-tool-dropdown__no-results');
    if (q && visibleCount === 0) {
      if (!noResults) {
        noResults = document.createElement('div');
        noResults.className = 'jt-tool-dropdown__no-results';
        dropdown.appendChild(noResults);
      }
      noResults.textContent = i18n('json.selector.no_results') || '没有找到匹配的工具';
      noResults.style.display = '';
    } else if (noResults) {
      noResults.style.display = 'none';
    }
  }
}

// Keyboard navigation for tool selector dropdown
let toolDropdownHighlightIdx = -1;

function handleToolSearchKeydown(e) {
  const items = [...document.querySelectorAll('.jt-tool-dropdown__item')].filter(i => i.style.display !== 'none');
  if (!items.length) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    toolDropdownHighlightIdx = Math.min(toolDropdownHighlightIdx + 1, items.length - 1);
    updateToolDropdownHighlight(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    toolDropdownHighlightIdx = Math.max(toolDropdownHighlightIdx - 1, 0);
    updateToolDropdownHighlight(items);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (toolDropdownHighlightIdx >= 0 && items[toolDropdownHighlightIdx]) {
      const key = items[toolDropdownHighlightIdx].dataset.key;
      if (key) selectTool(key);
    }
  } else if (e.key === 'Escape') {
    e.preventDefault();
    const sel = document.getElementById('toolSelector');
    if (sel) sel.classList.remove('open');
  }
}

function updateToolDropdownHighlight(items) {
  items.forEach((item, i) => {
    item.classList.toggle('highlighted', i === toolDropdownHighlightIdx);
  });
  if (items[toolDropdownHighlightIdx]) {
    items[toolDropdownHighlightIdx].scrollIntoView({ block: 'nearest' });
  }
}

function selectTool(toolKey) {
  if (toolKey === window.JT_TOOL) {
    toggleToolSelector();
    return;
  }
  // Get current input and encode for URL hash
  const input = getInput().trim();
  const maxHash = 8000; // URL length limit
  let hash = '';
  if (input && input.length <= maxHash) {
    hash = '#' + encodeURIComponent(input);
  } else if (input && input.length > maxHash) {
    showToast(i18n('json.selector.input_too_long') || '输入过长', 'info');
  }
  // Navigate
  const lang = window.JT_LANG || 'en';
  location.href = `/json/${toolKey}?lang=${lang}${hash}`;
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const sel = document.getElementById('toolSelector');
  if (sel && !sel.contains(e.target)) {
    sel.classList.remove('open');
  }
});

/* ── Output Tree View ──────────────────────────── */
let outputTreeViewVisible = false;

function showOutputTreeView() {
  const editorDiv = document.getElementById('outputEditor');
  const treeDiv = document.getElementById('outputTree');
  if (!editorDiv || !treeDiv) return false;

  // Render tree from output
  const output = getOutput();
  if (!output || !output.trim()) {
    showToast(i18n('json.common.error.empty') || '请先执行操作生成输出', 'info');
    return false;
  }
  try {
    const parsed = JSON.parse(output);
    treeDiv.innerHTML = '';
    treeDiv.appendChild(renderOutputTreeNode(parsed, 'root', '$'));
  } catch(e) {
    treeDiv.innerHTML = '<div class="jt-history-empty">' + (i18n('json.output.tree_parse_error') || '无法渲染树视图：JSON 解析失败') + '</div>';
  }
  editorDiv.style.display = 'none';
  treeDiv.classList.add('visible');
  treeDiv.style.display = 'block';
  outputTreeViewVisible = true;
  return true;
}

function toggleOutputTreeView() {
  const editorDiv = document.getElementById('outputEditor');
  const treeDiv = document.getElementById('outputTree');
  const btn = document.getElementById('treeViewBtn');

  outputTreeViewVisible = !outputTreeViewVisible;

  if (outputTreeViewVisible) {
    showOutputTreeView();
    if (btn) btn.classList.add('active');
  } else {
    editorDiv.style.display = '';
    treeDiv.classList.remove('visible');
    treeDiv.style.display = 'none';
    if (btn) btn.classList.remove('active');
  }
}

function renderOutputTreeNode(value, key, path) {
  const wrap = document.createElement('div');
  wrap.className = 'jt-tree-node';
  if (value === null || typeof value !== 'object') {
    wrap.innerHTML = '<div class="jt-tree-leaf">' +
      '<span class="jt-tree-key" onclick="copyOutputTreePath(\'' + escapeHtml(path) + '\')" title="复制路径">' + escapeHtml(String(key)) + '</span>' +
      '<span class="jt-tree-sep">: </span>' + renderOutputTreeValue(value) + '</div>';
    return wrap;
  }
  const isArr = Array.isArray(value);
  const keys = Object.keys(value);
  const open = (path.match(/[.\[]/g) || []).length < 2;
  const header = document.createElement('div');
  header.className = 'jt-tree-header';
  header.innerHTML =
    '<button class="jt-tree-toggle" onclick="toggleOutputTreeNode(this)">' + (open ? '▼' : '▶') + '</button>' +
    '<span class="jt-tree-key" onclick="copyOutputTreePath(\'' + escapeHtml(path) + '\')" title="复制路径">' + escapeHtml(String(key)) + '</span>' +
    '<span class="jt-tree-sep">: </span>' +
    '<span class="jt-tree-bracket">' + (isArr ? '[' : '{') + '</span>' +
    '<span class="jt-tree-preview">' + (isArr ? keys.length + ' items' : keys.length + ' keys') + '</span>' +
    '<span class="jt-tree-bracket">' + (isArr ? ']' : '}') + '</span>';
  const children = document.createElement('div');
  children.className = 'jt-tree-children';
  if (!open) children.style.display = 'none';
  for (const k of keys) {
    const cp = isArr ? path + '[' + k + ']' : path + '.' + k;
    children.appendChild(renderOutputTreeNode(value[k], k, cp));
  }
  wrap.appendChild(header);
  wrap.appendChild(children);
  return wrap;
}

function renderOutputTreeValue(v) {
  if (v === null) return '<span class="jt-val-null">null</span>';
  if (typeof v === 'boolean') return '<span class="jt-val-bool">' + v + '</span>';
  if (typeof v === 'number') return '<span class="jt-val-num">' + v + '</span>';
  return '<span class="jt-val-str">"' + escapeHtml(String(v)) + '"</span>';
}

function toggleOutputTreeNode(btn) {
  const c = btn.closest('.jt-tree-header').nextElementSibling;
  const h = c.style.display === 'none';
  c.style.display = h ? '' : 'none';
  btn.textContent = h ? '▼' : '▶';
}

function expandAllOutputTree() {
  if (!showOutputTreeView()) return;
  document.querySelectorAll('#outputTree .jt-tree-children').forEach(n => n.style.display = '');
  document.querySelectorAll('#outputTree .jt-tree-toggle').forEach(n => n.textContent = '▼');
}

function collapseAllOutputTree() {
  if (!showOutputTreeView()) return;
  document.querySelectorAll('#outputTree .jt-tree-children').forEach(n => n.style.display = 'none');
  document.querySelectorAll('#outputTree .jt-tree-toggle').forEach(n => n.textContent = '▶');
}

function copyOutputTreePath(path) {
  navigator.clipboard.writeText(path).then(() => showToast((i18n('json.output.copy_path') || '已复制') + '：' + path, 'success'));
}

/* ── Fullscreen Modal ──────────────────────────── */
let fullscreenInputEditor = null;
let fullscreenOutputEditor = null;
let isFullscreen = false;

function openFullscreen() {
  const overlay = document.getElementById('fullscreenOverlay');
  if (!overlay) return;

  isFullscreen = true;
  overlay.classList.add('visible');
  document.body.style.overflow = 'hidden';

  // Initialize Monaco editors in fullscreen
  require(['vs/editor/editor.main'], function() {
    const opts = {
      fontSize: 14, minimap: { enabled: false },
      scrollBeyondLastLine: false, automaticLayout: true, wordWrap: 'on',
    };

    // Create input editor
    const inputEl = document.getElementById('fullscreenInputEditor');
    if (inputEl && !fullscreenInputEditor) {
      fullscreenInputEditor = monaco.editor.create(inputEl, {
        ...opts, value: getInput(), language: 'json', theme: 'vs',
      });
    } else if (fullscreenInputEditor) {
      fullscreenInputEditor.setValue(getInput());
    }

    // Create output editor
    const outputEl = document.getElementById('fullscreenOutputEditor');
    if (outputEl && !fullscreenOutputEditor) {
      fullscreenOutputEditor = monaco.editor.create(outputEl, {
        ...opts, value: getOutput(), language: 'json', theme: 'vs', readOnly: true,
      });
    } else if (fullscreenOutputEditor) {
      fullscreenOutputEditor.setValue(getOutput());
    }

    updateFullscreenStats();
  });

  // Add Escape key listener
  document.addEventListener('keydown', handleFullscreenEsc);
}

function processJsonFullscreen() {
  if (!isFullscreen) return;
  // Sync fullscreen input to main input
  if (fullscreenInputEditor && inputEditor) {
    inputEditor.setValue(fullscreenInputEditor.getValue());
  }
  // Call the tool-specific processJson
  if (typeof processJson === 'function') {
    processJson();
  }
  // Sync main output to fullscreen output (after a short delay for async operations)
  setTimeout(() => {
    if (fullscreenOutputEditor && outputEditor) {
      fullscreenOutputEditor.setValue(getOutput());
      updateFullscreenStats();
    }
  }, 50);
}

function closeFullscreen() {
  const overlay = document.getElementById('fullscreenOverlay');
  if (!overlay) return;

  isFullscreen = false;
  overlay.classList.remove('visible');
  document.body.style.overflow = '';

  // Sync content back
  if (fullscreenInputEditor && inputEditor) {
    inputEditor.setValue(fullscreenInputEditor.getValue());
  }

  // Remove Escape key listener
  document.removeEventListener('keydown', handleFullscreenEsc);
}

function closeFullscreenOnBackdrop(e) {
  if (e.target.id === 'fullscreenOverlay') {
    closeFullscreen();
  }
}

function handleFullscreenEsc(e) {
  if (e.key === 'Escape' && isFullscreen) {
    closeFullscreen();
  }
}

function updateFullscreenStats() {
  const inputEl = document.getElementById('fullscreenInputSize');
  const outputEl = document.getElementById('fullscreenOutputSize');
  if (inputEl) inputEl.textContent = formatBytes(new Blob([getInput()]).size);
  if (outputEl) outputEl.textContent = formatBytes(new Blob([getOutput()]).size);
}

/* ── History-aware Process Wrapper ─────────────── */
function runProcessJson() {
  // Record history before processing
  const tool = window.JT_TOOL;
  let inputText = '';
  if (tool === 'diff') {
    inputText = (leftEditor?.getValue() || '') + '\n---\n' + (rightEditor?.getValue() || '');
  } else if (tool === 'schema-validate') {
    inputText = window._schemaEditor?.getValue() || '';
  } else {
    inputText = getInput();
  }
  if (tool && inputText.trim()) {
    const icon = document.querySelector('.jt-tool-hero__icon')?.textContent?.trim() || '🔧';
    const name = document.querySelector('.jt-tool-hero__title')?.textContent?.trim() || tool;
    recordHistory(tool, name, icon, inputText);
  }
  // Call the tool-specific processJson
  if (typeof processJson === 'function') {
    return processJson.apply(this, arguments);
  }
}

