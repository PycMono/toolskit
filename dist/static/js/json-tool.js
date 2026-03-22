/* ========================================
   JSON Tool - Block J-03: Monaco Editor + Toolbar
   ======================================== */

let editor = null;
let currentIndent = 2;
let currentTheme = 'light';

console.log('📋 JSON Tool - Block J-03 loading...');

// ── Monaco Editor Initialization ──────────────────
require.config({
    paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' }
});

require(['vs/editor/editor.main'], function() {
    editor = monaco.editor.create(
        document.getElementById('monaco-container'),
        {
            value: '',
            language: 'json',
            theme: 'vs',
            fontSize: 14,
            lineNumbers: 'on',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            formatOnPaste: false,
            automaticLayout: true,
            tabSize: 2,
        }
    );

    // Preset JSON from URL param
    if (window.__PRESET_JSON__) {
        editor.setValue(window.__PRESET_JSON__);
        validateJSON();
    }

    // Preset URL from URL param
    if (window.__PRESET_URL__) {
        switchInputTab('url', document.querySelector('[data-tab="url"]'));
        document.getElementById('json-url-input').value = window.__PRESET_URL__;
        fetchJSONFromURL();
    }

    // Monitor content changes
    editor.onDidChangeModelContent(() => {
        clearValidationMarkers();
    });

    console.log('✅ Monaco Editor initialized');
});

// ── Input Tab Switching ───────────────────────────
function switchInputTab(tab, btn) {
    document.querySelectorAll('.editor-tab').forEach(el => el.classList.remove('editor-tab--active'));
    btn.classList.add('editor-tab--active');
    document.getElementById('url-input-bar').style.display = tab === 'url' ? 'flex' : 'none';
    document.getElementById('file-drop-zone').style.display = tab === 'file' ? 'flex' : 'none';
}

// ── Indent Selection ──────────────────────────────
function setIndent(indent, btn) {
    currentIndent = indent;
    document.querySelectorAll('.indent-tab').forEach(el => el.classList.remove('indent-tab--active'));
    btn.classList.add('indent-tab--active');
    if (editor) {
        editor.updateOptions({ tabSize: indent === 'tab' ? 4 : indent });
    }
}

// ── Copy Editor Content ───────────────────────────
function copyEditorContent() {
    if (!editor) return;
    const text = editor.getValue();
    const btnText = document.getElementById('copy-btn-text');
    const orig = btnText.textContent;

    navigator.clipboard.writeText(text).then(() => {
        btnText.textContent = '已复制 ✓';
        setTimeout(() => { btnText.textContent = orig; }, 2000);
    });
}

// ── Download JSON ─────────────────────────────────
function downloadJSON() {
    if (!editor) return;
    const content = editor.getValue();
    if (!content.trim()) return;

    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    a.click();
    URL.revokeObjectURL(url);
}

// ── Clear Editor ──────────────────────────────────
function clearEditor() {
    if (!editor) return;
    editor.setValue('');
    clearValidationMarkers();
    hideResultBar();
}

// ── Fill Sample JSON ──────────────────────────────
function fillSampleJSON() {
    const sample = JSON.stringify({
        "name": "Tool Box Nova",
        "version": "2.0.0",
        "description": "Free online developer tools",
        "features": ["JSON Validator", "AI Detector", "Background Remover"],
        "author": {
            "name": "Tool Box Nova Team",
            "url": "https://toolboxnova.com"
        },
        "active": true,
        "userCount": 50000,
        "tags": ["tools", "developer", "free"]
    }, null, getIndentValue());

    if (editor) {
        editor.setValue(sample);
        validateJSON();
    }
}

// ── Theme Toggle ──────────────────────────────────
function toggleEditorTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    monaco.editor.setTheme(currentTheme === 'dark' ? 'vs-dark' : 'vs');
    document.getElementById('editor-panel').classList.toggle('theme-dark', currentTheme === 'dark');
}

// ── Fetch JSON from URL ───────────────────────────
async function fetchJSONFromURL() {
    const url = document.getElementById('json-url-input')?.value?.trim();
    if (!url) return;

    const btn = document.querySelector('.url-bar-btn');
    const origText = btn.textContent;
    btn.textContent = '抓取中...';
    btn.disabled = true;

    try {
        // 使用后端代理避免 CORS 问题
        const resp = await fetch(
            '/api/tools/json/fetch?url=' + encodeURIComponent(url),
            { signal: AbortSignal.timeout(20000) }
        );

        if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            throw new Error(err.error || `Error ${resp.status}`);
        }

        const text = await resp.text();

        if (editor) {
            editor.setValue(text);
            // 自动格式化
            const result = parseJSON(text);
            if (result.valid) {
                const formatted = JSON.stringify(result.parsed, null, getIndentValue());
                editor.setValue(formatted);
                showValidStatus(result.parsed, formatted);
            } else {
                showInvalidStatus(result.error, result.line, result.col);
            }
            // 切换回文本 Tab
            switchInputTab('text', document.querySelector('[data-tab="text"]'));
        }
    } catch (err) {
        const msg = err.name === 'TimeoutError'
            ? 'Request timed out'
            : (err.message || 'URL 抓取失败，请检查地址或跨域限制');
        showToast(msg, 'error');
    } finally {
        btn.textContent = origText;
        btn.disabled = false;
    }
}

// ── File Handling ─────────────────────────────────
function handleJSONFileDrop(e) {
    e.preventDefault();
    document.getElementById('file-drop-zone').classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) readJSONFile(file);
}

function handleJSONFileSelect(input) {
    const file = input.files[0];
    if (file) readJSONFile(file);
}

function readJSONFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        if (editor) {
            editor.setValue(e.target.result);
            validateJSON();
            switchInputTab('text', document.querySelector('[data-tab="text"]'));
        }
    };
    reader.readAsText(file, 'UTF-8');
}

// ── ERROR HINTS ───────────────────────────────────
const ERROR_HINTS = {
    "Expecting 'STRING'": "Keys must be enclosed in double quotes. Example: { \"key\": \"value\" }",
    "Expecting 'EOF'": "Unexpected token. Possibly an extra comma or misplaced bracket.",
    "Expecting ':'": "Missing colon between key and value.",
    "Expecting ','": "Missing comma between values.",
    "Unexpected token": "Check for single quotes (use double quotes), trailing commas, or missing brackets.",
};

function getErrorHint(msg) {
    for (const [key, hint] of Object.entries(ERROR_HINTS)) {
        if (msg.includes(key)) return hint;
    }
    return '';
}

// ── Validation (J-04) ─────────────────────────────
function validateJSON() {
    if (!editor) return;
    const text = editor.getValue().trim();

    if (!text) {
        showToast('请先输入 JSON 内容', 'info');
        return;
    }

    const result = parseJSON(text);

    if (result.valid) {
        showValidStatus(result.parsed, text);
    } else {
        showInvalidStatus(result.error, result.line, result.col);
    }
}

function formatJSON() {
    if (!editor) return;
    const text = editor.getValue().trim();
    if (!text) return;

    const result = parseJSON(text);
    if (!result.valid) {
        validateJSON();
        return;
    }

    const indent = getIndentValue();
    const formatted = JSON.stringify(result.parsed, null, indent);
    const position = editor.getPosition();

    editor.setValue(formatted);
    editor.setPosition(position);

    showValidStatus(result.parsed, formatted);
}

function minifyJSON() {
    if (!editor) return;
    const text = editor.getValue().trim();
    if (!text) return;

    const result = parseJSON(text);
    if (!result.valid) {
        validateJSON();
        return;
    }

    const minified = JSON.stringify(result.parsed);
    editor.setValue(minified);
    showValidStatus(result.parsed, minified);
}

function parseJSON(text) {
    try {
        const parsed = JSON.parse(text);
        return { valid: true, parsed };
    } catch (e) {
        const { line, col } = extractErrorPosition(e.message, text);
        return { valid: false, error: e.message, line, col };
    }
}

function extractErrorPosition(errMsg, text) {
    const posMatch = errMsg.match(/at position (\d+)/);
    if (posMatch) {
        const pos = parseInt(posMatch[1], 10);
        const lines = text.substring(0, pos).split('\n');
        return { line: lines.length, col: lines[lines.length - 1].length + 1 };
    }
    const lineMatch = errMsg.match(/line (\d+) column (\d+)/);
    if (lineMatch) {
        return { line: parseInt(lineMatch[1], 10), col: parseInt(lineMatch[2], 10) };
    }
    return { line: 1, col: 1 };
}

function showValidStatus(parsed, rawText) {
    clearValidationMarkers();
    hideErrorPanel();

    const lines = rawText.split('\n').length;
    const size = formatBytes(new Blob([rawText]).size);
    const keys = countAllKeys(parsed);
    const depth = getMaxDepth(parsed);

    const badge = document.getElementById('statusbar-badge');
    badge.className = 'statusbar-badge statusbar-badge--valid';
    badge.textContent = '✅ Valid JSON';

    document.getElementById('stat-size').textContent = size;
    document.getElementById('stat-lines').textContent = `${lines} lines`;
    document.getElementById('stat-keys').textContent = `${keys} keys`;
    document.getElementById('stat-depth').textContent = `depth ${depth}`;

    document.getElementById('json-statusbar').style.display = 'flex';

    if (typeof renderTreeView === 'function') {
        renderTreeView(parsed);
    }
}

function showInvalidStatus(errMsg, line, col) {
    if (editor) {
        const model = editor.getModel();
        monaco.editor.setModelMarkers(model, 'json-lint', [{
            startLineNumber: line,
            endLineNumber: line,
            startColumn: Math.max(1, col - 1),
            endColumn: col + 10,
            message: errMsg,
            severity: monaco.MarkerSeverity.Error,
        }]);
        editor.revealLineInCenter(line);
        editor.setPosition({ lineNumber: line, column: col });
    }

    const badge = document.getElementById('statusbar-badge');
    badge.className = 'statusbar-badge statusbar-badge--invalid';
    badge.textContent = '❌ Invalid JSON';
    document.getElementById('stat-size').textContent = '';
    document.getElementById('stat-lines').textContent = '';
    document.getElementById('stat-keys').textContent = '';
    document.getElementById('stat-depth').textContent = '';
    document.getElementById('json-statusbar').style.display = 'flex';

    const errorList = document.getElementById('error-list');
    const hint = getErrorHint(errMsg);

    errorList.innerHTML = `
        <li class="error-item" onclick="gotoErrorLine(${line}, ${col})">
            <span class="error-item__location">L${line}:C${col}</span>
            <span class="error-item__message">
                ${escapeHTML(errMsg)}
                ${hint ? `<span class="error-item__hint">💡 ${escapeHTML(hint)}</span>` : ''}
            </span>
        </li>
    `;
    document.getElementById('json-error-panel').style.display = 'block';
}

function gotoErrorLine(line, col) {
    if (!editor) return;
    editor.revealLineInCenter(line);
    editor.setPosition({ lineNumber: line, column: col });
    editor.focus();
}

function hideErrorPanel() {
    document.getElementById('json-error-panel').style.display = 'none';
}

function hideResultBar() {
    document.getElementById('json-statusbar').style.display = 'none';
    document.getElementById('json-error-panel').style.display = 'none';
}

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function countAllKeys(obj, count = 0) {
    if (typeof obj !== 'object' || obj === null) return count;
    if (Array.isArray(obj)) {
        return obj.reduce((acc, item) => countAllKeys(item, acc), count);
    }
    const keys = Object.keys(obj);
    count += keys.length;
    return keys.reduce((acc, k) => countAllKeys(obj[k], acc), count);
}

function getMaxDepth(obj, depth = 0) {
    if (typeof obj !== 'object' || obj === null) return depth;
    const values = Array.isArray(obj) ? obj : Object.values(obj);
    if (values.length === 0) return depth;
    return Math.max(...values.map(v => getMaxDepth(v, depth + 1)));
}

function escapeHTML(str) {
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Utility Functions ─────────────────────────────
function getIndentValue() {
    return currentIndent === 'tab' ? '\t' : currentIndent;
}

function clearValidationMarkers() {
    if (editor) {
        monaco.editor.setModelMarkers(editor.getModel(), 'json-lint', []);
    }
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'error' ? '#fee2e2' : '#f0fdf4'};
        color: ${type === 'error' ? '#991b1b' : '#166534'};
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/* ── TREE VIEW (J-06) ───────────────────────────── */
let treeVisible = false;

function toggleTreePanel() {
    treeVisible = !treeVisible;
    const panel = document.getElementById('tree-panel');
    const workspace = document.querySelector('.json-workspace');
    const btn = document.getElementById('btn-tree-view');

    panel.style.display = treeVisible ? 'flex' : 'none';
    workspace.classList.toggle('show-tree', treeVisible);

    if (btn) btn.style.background = treeVisible ? '#eef2ff' : '';
}

function renderTreeView(data) {
    const emptyEl = document.getElementById('tree-empty');
    const rootEl = document.getElementById('tree-root');

    rootEl.innerHTML = '';
    rootEl.style.display = 'block';
    emptyEl.style.display = 'none';

    const node = buildTreeNode(data, null, 0);
    rootEl.appendChild(node);
}

function buildTreeNode(value, key, depth) {
    const li = document.createElement('li');
    li.className = 'tree-node';

    const isObject = value !== null && typeof value === 'object';
    const isArray = Array.isArray(value);
    const hasChildren = isObject && Object.keys(value).length > 0;

    const row = document.createElement('div');
    row.className = 'tree-node-row';
    row.style.setProperty('--depth', depth);

    const toggle = document.createElement('span');
    toggle.className = 'tree-toggle' + (hasChildren ? '' : ' tree-toggle--leaf');
    toggle.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>`;
    row.appendChild(toggle);

    if (key !== null) {
        const keyEl = document.createElement('span');
        keyEl.className = 'tree-key';
        keyEl.textContent = typeof key === 'number' ? `[${key}]` : `"${key}"`;
        row.appendChild(keyEl);

        const colon = document.createElement('span');
        colon.className = 'tree-colon';
        colon.textContent = ':';
        row.appendChild(colon);
    }

    if (isObject) {
        const preview = document.createElement('span');
        preview.className = 'tree-value-preview';
        const count = Object.keys(value).length;
        preview.textContent = isArray
            ? `[${count} item${count !== 1 ? 's' : ''}]`
            : `{${count} key${count !== 1 ? 's' : ''}}`;
        row.appendChild(preview);
    } else {
        const valEl = document.createElement('span');
        valEl.className = getValueClass(value);
        valEl.textContent = formatLeafValue(value);
        row.appendChild(valEl);
    }

    li.appendChild(row);

    if (hasChildren) {
        const children = document.createElement('ul');
        children.className = 'tree-children';

        const entries = isArray
            ? value.map((v, i) => [i, v])
            : Object.entries(value);

        const visibleEntries = entries.slice(0, 200);
        visibleEntries.forEach(([k, v]) => {
            children.appendChild(buildTreeNode(v, k, depth + 1));
        });

        if (entries.length > 200) {
            const more = document.createElement('li');
            more.innerHTML = `<div class="tree-node-row" style="--depth:${depth + 1}">
                <span class="tree-value-preview">...and ${entries.length - 200} more items</span>
            </div>`;
            children.appendChild(more);
        }

        li.appendChild(children);

        row.addEventListener('click', () => {
            const collapsed = children.classList.toggle('tree-children--collapsed');
            toggle.classList.toggle('tree-toggle--collapsed', collapsed);
        });
    }

    return li;
}

function getValueClass(val) {
    if (val === null) return 'tree-value-null';
    if (typeof val === 'string') return 'tree-value-string';
    if (typeof val === 'number') return 'tree-value-number';
    if (typeof val === 'boolean') return 'tree-value-boolean';
    return 'tree-value-preview';
}

function formatLeafValue(val) {
    if (val === null) return 'null';
    if (typeof val === 'string') return `"${val.length > 60 ? val.slice(0, 60) + '...' : val}"`;
    return String(val);
}

function expandAllNodes() {
    document.querySelectorAll('.tree-children').forEach(el => {
        el.classList.remove('tree-children--collapsed');
    });
    document.querySelectorAll('.tree-toggle').forEach(el => {
        el.classList.remove('tree-toggle--collapsed');
    });
}

function collapseAllNodes() {
    const allChildren = document.querySelectorAll('.tree-children');
    allChildren.forEach((el, idx) => {
        if (idx > 0) el.classList.add('tree-children--collapsed');
    });
    document.querySelectorAll('.tree-toggle:not(.tree-toggle--leaf)').forEach((el, idx) => {
        if (idx > 0) el.classList.add('tree-toggle--collapsed');
    });
}

// Toggle tree view (will be implemented in J-06)
function toggleTreeView() {
    const workspace = document.getElementById('json-workspace');
    const treePanel = document.getElementById('tree-panel');

    if (workspace && treePanel) {
        workspace.classList.toggle('show-tree');
        const isShown = workspace.classList.contains('show-tree');
        treePanel.style.display = isShown ? 'flex' : 'none';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ JSON Tool initialized');
});

