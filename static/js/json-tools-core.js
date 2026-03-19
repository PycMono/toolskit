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
    }
    const inputEl = document.getElementById('inputEditor');
    if (inputEl) {
      inputEditor = monaco.editor.create(inputEl, {
        ...opts, value: '', language: 'json', theme: 'vs',
      });
    }
    const outputEl = document.getElementById('outputEditor');
    if (outputEl) {
      outputEditor = monaco.editor.create(outputEl, {
        ...opts, value: '', language: 'plaintext', theme: 'vs', readOnly: true,
      });
    }
  } else {
    const inputEl = document.getElementById('inputEditor');
    if (inputEl) {
      const inputLang = { 'from-yaml': 'yaml', 'from-xml': 'xml', 'from-sql': 'sql',
        'from-csv': 'plaintext', 'base64': 'plaintext', 'jwt': 'plaintext',
        'jsonc': 'plaintext' }[tool] || 'json';
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
    'jsonc':     '{\n  // This is a comment\n || "name": "John", // inline comment\n  /* block comment */\n || "age": 30\n}',
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

function swapEditors() {
  const a = getInput(), b = getOutput();
  inputEditor?.setValue(b);
  if (outputEditor) {
    outputEditor.updateOptions({ readOnly: false });
    outputEditor.setValue(a);
    outputEditor.updateOptions({ readOnly: true });
  }
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
  if (bodyEl) || bodyEl.innerHTML = `
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

function toggleFAQ(id) {
  const item   = document.getElementById(id);
  const isOpen = item.classList.contains('jt-faq-item--open');
  document.querySelectorAll('.jt-faq-item--open').forEach(i => i.classList.remove('jt-faq-item--open'));
  if (!isOpen) item.classList.add('jt-faq-item--open');
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
});

