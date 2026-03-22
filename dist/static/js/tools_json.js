/* ==================================================
   Tool Box Nova - JSON 工具箱 JavaScript
   ================================================== */

// ========== Tab Source Switching ==========
document.querySelectorAll('.btn-tab[data-source]').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.btn-tab').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    const source = this.dataset.source;

    document.getElementById('jsonUrl').classList.toggle('hidden', source !== 'url');
    document.getElementById('fetchBtn').classList.toggle('hidden', source !== 'url');

    if (source === 'file') {
      document.getElementById('fileInput').click();
    }
  });
});

// File Upload
document.getElementById('fileInput')?.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      document.getElementById('jsonInput').value = evt.target.result;
      validateJSON();
    };
    reader.readAsText(file);
  }
});

// Fetch from URL
document.getElementById('fetchBtn')?.addEventListener('click', async function() {
  const url = document.getElementById('jsonUrl').value.trim();
  if (!url) return alert('请输入 URL');

  try {
    this.disabled = true;
    this.textContent = '抓取中...';
    const response = await fetch('/api/tools/fetch-json?url=' + encodeURIComponent(url));
    if (!response.ok) throw new Error('抓取失败');
    const data = await response.text();
    document.getElementById('jsonInput').value = data;
    validateJSON();
  } catch (err) {
    alert('抓取失败: ' + err.message);
  } finally {
    this.disabled = false;
    this.textContent = '抓取';
  }
});

// ========== JSON Validate & Format ==========
function validateJSON() {
  const input = document.getElementById('jsonInput').value.trim();
  const errorPanel = document.getElementById('errorPanel');
  const statusOk = document.getElementById('statusOk');
  const statusError = document.getElementById('statusError');
  const errorDetail = document.getElementById('errorDetail');
  const jsonStats = document.getElementById('jsonStats');

  errorPanel.classList.add('hidden');
  statusOk.classList.add('hidden');
  statusError.classList.add('hidden');

  if (!input) return;

  try {
    const parsed = JSON.parse(input);
    // Success
    statusOk.classList.remove('hidden');

    // Calculate stats
    const originalSize = new Blob([input]).size;
    const formatted = JSON.stringify(parsed, null, 4);
    const formattedSize = new Blob([formatted]).size;
    const keys = countKeys(parsed);
    const depth = getDepth(parsed);

    jsonStats.innerHTML = `
      <p><strong>原始大小:</strong> ${formatBytes(originalSize)}</p>
      <p><strong>格式化后:</strong> ${formatBytes(formattedSize)}</p>
      <p><strong>Key 数量:</strong> ${keys}</p>
      <p><strong>嵌套深度:</strong> ${depth}</p>
    `;
  } catch (err) {
    // Error
    statusError.classList.remove('hidden');
    const errorMsg = err.message;
    const match = errorMsg.match(/position (\d+)/);
    let line = 1, col = 1;

    if (match) {
      const pos = parseInt(match[1]);
      const lines = input.substring(0, pos).split('\n');
      line = lines.length;
      col = lines[lines.length - 1].length + 1;
    }

    errorDetail.innerHTML = `
      <p><strong>第 ${line} 行，第 ${col} 列</strong></p>
      <p>${errorMsg}</p>
    `;
    errorPanel.innerHTML = `❌ 第 ${line} 行，第 ${col} 列：${errorMsg}`;
    errorPanel.classList.remove('hidden');
  }
}

// Auto validate on input (debounced)
let validateTimer;
document.getElementById('jsonInput')?.addEventListener('input', function() {
  clearTimeout(validateTimer);
  validateTimer = setTimeout(validateJSON, 500);
});

document.getElementById('validateBtn')?.addEventListener('click', validateJSON);

// Format JSON
document.getElementById('formatBtn')?.addEventListener('click', function() {
  const input = document.getElementById('jsonInput').value.trim();
  if (!input) return;

  try {
    const parsed = JSON.parse(input);
    const indent = document.getElementById('indentSelect').value;
    const formatted = JSON.stringify(parsed, null, indent === 'tab' ? '\t' : parseInt(indent));
    document.getElementById('jsonInput').value = formatted;
    validateJSON();
  } catch (err) {
    alert('JSON 格式错误：' + err.message);
  }
});

// Clear
document.getElementById('clearBtn')?.addEventListener('click', function() {
  document.getElementById('jsonInput').value = '';
  document.getElementById('errorPanel').classList.add('hidden');
  document.getElementById('statusOk').classList.add('hidden');
  document.getElementById('statusError').classList.add('hidden');
});

// Copy
document.getElementById('copyBtn')?.addEventListener('click', function() {
  const text = document.getElementById('jsonInput').value;
  navigator.clipboard.writeText(text).then(() => {
    this.textContent = '✅ 已复制';
    setTimeout(() => { this.textContent = '📋 复制'; }, 2000);
  });
});

// Download
document.getElementById('downloadBtn')?.addEventListener('click', function() {
  const text = document.getElementById('jsonInput').value;
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'formatted.json';
  a.click();
  URL.revokeObjectURL(url);
});

// Helper functions
function countKeys(obj, count = 0) {
  if (typeof obj !== 'object' || obj === null) return count;
  for (let key in obj) {
    count++;
    count = countKeys(obj[key], count);
  }
  return count;
}

function getDepth(obj, depth = 0) {
  if (typeof obj !== 'object' || obj === null) return depth;
  let maxDepth = depth;
  for (let key in obj) {
    const d = getDepth(obj[key], depth + 1);
    if (d > maxDepth) maxDepth = d;
  }
  return maxDepth;
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// ========== Escape / Unescape ==========
document.getElementById('escapeBtn')?.addEventListener('click', function() {
  const input = document.getElementById('escapeInput').value;
  const escaped = JSON.stringify(input).slice(1, -1); // Remove outer quotes
  document.getElementById('escapeOutput').value = escaped;
});

document.getElementById('unescapeBtn')?.addEventListener('click', function() {
  const input = document.getElementById('escapeInput').value;
  try {
    const unescaped = JSON.parse('"' + input + '"');
    document.getElementById('escapeOutput').value = unescaped;
  } catch (err) {
    alert('反转义失败: ' + err.message);
  }
});

document.getElementById('swapBtn')?.addEventListener('click', function() {
  const input = document.getElementById('escapeInput');
  const output = document.getElementById('escapeOutput');
  [input.value, output.value] = [output.value, input.value];
});

document.getElementById('copyEscapeBtn')?.addEventListener('click', function() {
  const text = document.getElementById('escapeOutput').value;
  navigator.clipboard.writeText(text).then(() => {
    this.textContent = '✅ 已复制';
    setTimeout(() => { this.textContent = '📋 复制结果'; }, 2000);
  });
});

document.getElementById('clearEscapeBtn')?.addEventListener('click', function() {
  document.getElementById('escapeInput').value = '';
  document.getElementById('escapeOutput').value = '';
});

// ========== Minify ==========
document.getElementById('minifyBtn')?.addEventListener('click', function() {
  const input = document.getElementById('minifyInput').value.trim();
  if (!input) return;

  try {
    const parsed = JSON.parse(input);
    const minified = JSON.stringify(parsed);
    document.getElementById('minifyOutput').value = minified;

    const originalSize = new Blob([input]).size;
    const minifiedSize = new Blob([minified]).size;
    const ratio = ((1 - minifiedSize / originalSize) * 100).toFixed(1);
    const saved = originalSize - minifiedSize;

    document.getElementById('sizeInfo').innerHTML = `
      <p><strong>原始大小:</strong> ${formatBytes(originalSize)}</p>
      <p><strong>压缩后:</strong> ${formatBytes(minifiedSize)}</p>
      <p><strong>压缩率:</strong> ${ratio}%，节省 ${formatBytes(saved)}</p>
    `;
  } catch (err) {
    alert('JSON 格式错误: ' + err.message);
  }
});

document.getElementById('copyMinifyBtn')?.addEventListener('click', function() {
  const text = document.getElementById('minifyOutput').value;
  navigator.clipboard.writeText(text).then(() => {
    this.textContent = '✅ 已复制';
    setTimeout(() => { this.textContent = '📋 复制'; }, 2000);
  });
});

document.getElementById('downloadMinifyBtn')?.addEventListener('click', function() {
  const text = document.getElementById('minifyOutput').value;
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'minified.json';
  a.click();
  URL.revokeObjectURL(url);
});

// ========== Repair JSON ==========
document.getElementById('repairBtn')?.addEventListener('click', function() {
  const input = document.getElementById('repairInput').value.trim();
  if (!input) return;

  let repaired = input;
  const log = [];

  // Remove comments
  repaired = repaired.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  if (repaired !== input) log.push('✓ 移除注释');

  // Replace single quotes with double quotes (naive)
  const singleQuotePattern = /'([^'\\]*(\\.[^'\\]*)*)'/g;
  if (singleQuotePattern.test(repaired)) {
    repaired = repaired.replace(singleQuotePattern, '"$1"');
    log.push('✓ 单引号 → 双引号');
  }

  // Remove trailing commas
  repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
  if (repaired !== input) log.push('✓ 移除尾随逗号');

  // Replace undefined with null
  repaired = repaired.replace(/:\s*undefined\b/g, ': null');
  if (repaired !== input) log.push('✓ undefined → null');

  try {
    const parsed = JSON.parse(repaired);
    document.getElementById('repairOutput').value = JSON.stringify(parsed, null, 4);
    document.getElementById('repairLog').innerHTML = log.length > 0
      ? '<ul>' + log.map(l => '<li>' + l + '</li>').join('') + '</ul>'
      : '<p>未检测到常见错误</p>';
  } catch (err) {
    alert('修复后仍有错误: ' + err.message);
  }
});

document.getElementById('copyRepairBtn')?.addEventListener('click', function() {
  const text = document.getElementById('repairOutput').value;
  navigator.clipboard.writeText(text).then(() => {
    this.textContent = '✅ 已复制';
    setTimeout(() => { this.textContent = '📋 复制'; }, 2000);
  });
});

// ========== JWT Decoder ==========
document.getElementById('decodeJwtBtn')?.addEventListener('click', function() {
  const token = document.getElementById('jwtInput').value.trim();
  if (!token) return;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid JWT format');

    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));
    const signature = parts[2];

    document.getElementById('jwtHeaderContent').textContent = JSON.stringify(header, null, 2);
    document.getElementById('jwtPayloadContent').textContent = JSON.stringify(payload, null, 2);
    document.getElementById('jwtSignatureContent').textContent = signature;

    // Check expiry
    const expiryDiv = document.getElementById('jwtExpiry');
    if (payload.exp) {
      const expDate = new Date(payload.exp * 1000);
      const now = new Date();
      const isExpired = expDate < now;
      const diff = Math.abs(expDate - now) / 1000 / 86400;

      expiryDiv.innerHTML = `<p><strong>过期时间:</strong> ${expDate.toLocaleString()}</p>` +
        (isExpired
          ? `<p class="text-danger">❌ 已过期 ${Math.floor(diff)} 天</p>`
          : `<p class="text-success">✅ 剩余 ${Math.floor(diff)} 天</p>`
        );
    } else {
      expiryDiv.innerHTML = '';
    }

    document.getElementById('jwtOutput').classList.remove('hidden');
  } catch (err) {
    alert('JWT 解码失败: ' + err.message);
  }
});

// ========== Unescape ==========
document.getElementById('doUnescapeBtn')?.addEventListener('click', function () {
  const input = document.getElementById('unescapeInput').value;
  try {
    // wrap in quotes to use JSON.parse for proper unescape
    const result = JSON.parse('"' + input.replace(/"/g, '\\"') + '"');
    document.getElementById('unescapeOutput').value = result;
  } catch (e) {
    // fallback: manual replace
    const result = input
      .replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t')
      .replace(/\\"/g, '"').replace(/\\\\/g, '\\').replace(/\\\//g, '/');
    document.getElementById('unescapeOutput').value = result;
  }
});
document.getElementById('copyUnescapeBtn')?.addEventListener('click', function () {
  const t = document.getElementById('unescapeOutput').value;
  navigator.clipboard.writeText(t).then(() => { this.textContent = '✅ 已复制'; setTimeout(() => { this.textContent = '📋 复制结果'; }, 2000); });
});
document.getElementById('clearUnescapeBtn')?.addEventListener('click', function () {
  document.getElementById('unescapeInput').value = '';
  document.getElementById('unescapeOutput').value = '';
});

// ========== JSON Diff ==========
document.getElementById('compareDiffBtn')?.addEventListener('click', function () {
  const aText = document.getElementById('diffJsonA').value.trim();
  const bText = document.getElementById('diffJsonB').value.trim();
  if (!aText || !bText) return alert('请输入两个 JSON');
  let a, b;
  try { a = JSON.parse(aText); } catch (e) { return alert('JSON A 格式错误: ' + e.message); }
  try { b = JSON.parse(bText); } catch (e) { return alert('JSON B 格式错误: ' + e.message); }

  const mode = document.querySelector('input[name="diffMode"]:checked')?.value || 'semantic';
  const diffs = mode === 'semantic' ? semanticDiff(a, b, '$') : lineDiff(
    JSON.stringify(a, null, 2).split('\n'),
    JSON.stringify(b, null, 2).split('\n')
  );

  const stats = { added: 0, removed: 0, changed: 0 };
  let html = '';
  diffs.forEach(d => {
    if (d.type === 'added') { stats.added++; html += `<div class="diff-line diff-added">+ <span class="diff-path">${d.path}</span>: <code>${JSON.stringify(d.val)}</code></div>`; }
    else if (d.type === 'removed') { stats.removed++; html += `<div class="diff-line diff-removed">- <span class="diff-path">${d.path}</span>: <code>${JSON.stringify(d.val)}</code></div>`; }
    else if (d.type === 'changed') { stats.changed++; html += `<div class="diff-line diff-changed">~ <span class="diff-path">${d.path}</span>: <code>${JSON.stringify(d.from)}</code> → <code>${JSON.stringify(d.to)}</code></div>`; }
    else { html += `<div class="diff-line diff-same">  <span class="diff-path">${d.path}</span>: <code>${JSON.stringify(d.val)}</code></div>`; }
  });

  document.getElementById('diffStats').innerHTML =
    `<span class="diff-badge added">+${stats.added} 新增</span> ` +
    `<span class="diff-badge removed">-${stats.removed} 删除</span> ` +
    `<span class="diff-badge changed">~${stats.changed} 修改</span>`;
  document.getElementById('diffDisplay').innerHTML = html || '<p style="color:#10b981;padding:16px">✅ 两个 JSON 完全相同</p>';
  document.getElementById('diffResult').classList.remove('hidden');
});

function semanticDiff(a, b, path) {
  const diffs = [];
  if (typeof a !== typeof b || (Array.isArray(a) !== Array.isArray(b))) {
    diffs.push({ type: 'changed', path, from: a, to: b }); return diffs;
  }
  if (typeof a !== 'object' || a === null) {
    if (a !== b) diffs.push({ type: 'changed', path, from: a, to: b });
    else diffs.push({ type: 'same', path, val: a });
    return diffs;
  }
  const keysA = Object.keys(a), keysB = new Set(Object.keys(b));
  keysA.forEach(k => {
    const p = Array.isArray(a) ? `${path}[${k}]` : `${path}.${k}`;
    if (!keysB.has(k)) diffs.push({ type: 'removed', path: p, val: a[k] });
    else { diffs.push(...semanticDiff(a[k], b[k], p)); keysB.delete(k); }
  });
  keysB.forEach(k => diffs.push({ type: 'added', path: Array.isArray(b) ? `${path}[${k}]` : `${path}.${k}`, val: b[k] }));
  return diffs;
}

function lineDiff(linesA, linesB) {
  const diffs = [];
  const maxLen = Math.max(linesA.length, linesB.length);
  for (let i = 0; i < maxLen; i++) {
    const la = linesA[i], lb = linesB[i];
    if (la === undefined) diffs.push({ type: 'added', path: `L${i + 1}`, val: lb });
    else if (lb === undefined) diffs.push({ type: 'removed', path: `L${i + 1}`, val: la });
    else if (la !== lb) diffs.push({ type: 'changed', path: `L${i + 1}`, from: la, to: lb });
    else diffs.push({ type: 'same', path: `L${i + 1}`, val: la });
  }
  return diffs;
}

// ========== JSON Tree View ==========
document.getElementById('renderTreeBtn')?.addEventListener('click', renderTree);
document.getElementById('expandAllBtn')?.addEventListener('click', () => {
  document.querySelectorAll('.tree-children').forEach(el => el.classList.remove('collapsed'));
  document.querySelectorAll('.tree-toggle').forEach(el => el.textContent = '▼');
});
document.getElementById('collapseAllBtn')?.addEventListener('click', () => {
  document.querySelectorAll('.tree-children').forEach(el => el.classList.add('collapsed'));
  document.querySelectorAll('.tree-toggle').forEach(el => el.textContent = '▶');
});

function renderTree() {
  const input = document.getElementById('treeInput').value.trim();
  if (!input) return;
  let data;
  try { data = JSON.parse(input); } catch (e) { alert('JSON 格式错误: ' + e.message); return; }
  document.getElementById('treeDisplay').innerHTML = buildTreeHTML(data, '$', 0);
  attachTreeEvents();
}

function buildTreeHTML(val, key, depth) {
  const type = getType(val);
  const typeLabel = `<span class="tree-type tree-type-${type}">${type}</span>`;
  const keyLabel = key !== null ? `<span class="tree-key">"${key}"</span><span class="tree-colon">: </span>` : '';

  if (val === null || typeof val !== 'object') {
    const display = type === 'string' ? `<span class="tree-string">"${escapeHtml(String(val))}"</span>`
      : type === 'number' ? `<span class="tree-number">${val}</span>`
      : type === 'boolean' ? `<span class="tree-bool">${val}</span>`
      : `<span class="tree-null">null</span>`;
    return `<div class="tree-leaf">${keyLabel}${display} ${typeLabel}</div>`;
  }

  const isArray = Array.isArray(val);
  const entries = isArray ? val : Object.entries(val);
  const count = isArray ? val.length : entries.length;
  const bracket = isArray ? ['[', ']'] : ['{', '}'];
  const path = key;

  let children = '';
  if (isArray) val.forEach((v, i) => { children += buildTreeHTML(v, i, depth + 1); });
  else entries.forEach(([k, v]) => { children += buildTreeHTML(v, k, depth + 1); });

  return `<div class="tree-node">
    <div class="tree-row" data-path="${escapeHtml(path)}">
      <span class="tree-toggle">▼</span>
      ${keyLabel}${bracket[0]} ${typeLabel} <span class="tree-count">${count} 项</span>
      <button class="tree-copy-path" data-path="${escapeHtml(path)}" title="复制路径">📋</button>
    </div>
    <div class="tree-children">${children}</div>
    <div class="tree-close">${bracket[1]}</div>
  </div>`;
}

function attachTreeEvents() {
  document.querySelectorAll('.tree-toggle').forEach(btn => {
    btn.addEventListener('click', function () {
      const children = this.closest('.tree-node').querySelector('.tree-children');
      const collapsed = children.classList.toggle('collapsed');
      this.textContent = collapsed ? '▶' : '▼';
    });
  });
  document.querySelectorAll('.tree-copy-path').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      navigator.clipboard.writeText(this.dataset.path).then(() => {
        const old = this.textContent; this.textContent = '✅'; setTimeout(() => { this.textContent = old; }, 1500);
      });
    });
  });
}

function getType(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  return typeof v;
}
function escapeHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

// ========== JSONPath Query ==========
document.querySelectorAll('.path-example-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.getElementById('pathExpression').value = this.dataset.path;
    runJsonPath();
  });
});
document.getElementById('queryPathBtn')?.addEventListener('click', runJsonPath);
document.getElementById('pathExpression')?.addEventListener('keydown', e => { if (e.key === 'Enter') runJsonPath(); });

function runJsonPath() {
  const jsonText = document.getElementById('pathJsonInput').value.trim();
  const expr = document.getElementById('pathExpression').value.trim();
  if (!jsonText) return alert('请输入 JSON 数据');
  let data;
  try { data = JSON.parse(jsonText); } catch (e) { alert('JSON 格式错误: ' + e.message); return; }

  try {
    const results = jsonPathQuery(data, expr);
    const resultEl = document.getElementById('pathResult');
    if (results.length === 0) {
      resultEl.innerHTML = '<p class="path-empty">未匹配到结果</p>';
    } else {
      resultEl.innerHTML = `<p class="path-count">匹配 ${results.length} 个结果</p>` +
        results.map((r, i) => `<div class="path-result-item"><span class="path-index">[${i}]</span><pre>${JSON.stringify(r, null, 2)}</pre></div>`).join('');
    }
  } catch (e) {
    document.getElementById('pathResult').innerHTML = `<p class="path-error">查询错误: ${e.message}</p>`;
  }
}

// Minimal JSONPath engine supporting $, .key, [n], [*], ..key
function jsonPathQuery(data, path) {
  if (path === '$') return [data];
  const results = [];
  function query(node, tokens) {
    if (tokens.length === 0) { results.push(node); return; }
    const [tok, ...rest] = tokens;
    if (tok === '**') { // recursive
      queryAll(node, rest);
    } else if (tok === '*') {
      if (typeof node === 'object' && node !== null) {
        (Array.isArray(node) ? node : Object.values(node)).forEach(v => query(v, rest));
      }
    } else if (/^\d+$/.test(tok)) {
      if (Array.isArray(node) && node[+tok] !== undefined) query(node[+tok], rest);
    } else {
      if (typeof node === 'object' && node !== null && tok in node) query(node[tok], rest);
    }
  }
  function queryAll(node, rest) {
    query(node, rest);
    if (typeof node === 'object' && node !== null) {
      (Array.isArray(node) ? node : Object.values(node)).forEach(v => queryAll(v, rest));
    }
  }
  // Tokenize: $.a.b[0][*]..c
  const tokens = path.replace(/^\$/, '').split(/\.(?=(?:[^[\]]*\[[^\]]*\])*[^[\]]*$)/)
    .flatMap(t => {
      if (!t) return [];
      if (t === '*') return ['*'];
      if (t.startsWith('..')) return ['**', t.slice(2)];
      const m = t.match(/^([^[]+)?((?:\[\w+\])+)?$/);
      const res = [];
      if (m?.[1]) res.push(m[1]);
      if (m?.[2]) m[2].slice(1, -1).split('][').forEach(idx => res.push(idx === '*' ? '*' : idx));
      return res.length ? res : [t];
    });
  query(data, tokens);
  return results;
}

// ========== JSON to CSV ==========
document.getElementById('convertCsvBtn')?.addEventListener('click', function () {
  const input = document.getElementById('csvJsonInput').value.trim();
  if (!input) return;
  let data;
  try { data = JSON.parse(input); } catch (e) { alert('JSON 格式错误: ' + e.message); return; }
  if (!Array.isArray(data)) { alert('请输入 JSON 数组'); return; }

  const delimiter = document.getElementById('csvDelimiter').value;
  const hasHeader = document.getElementById('csvHeader').checked;
  const keys = [...new Set(data.flatMap(row => typeof row === 'object' && row ? Object.keys(row) : []))];

  let csv = '';
  if (hasHeader) csv += keys.map(k => csvEscape(k, delimiter)).join(delimiter) + '\n';
  data.forEach(row => {
    csv += keys.map(k => csvEscape(row?.[k] ?? '', delimiter)).join(delimiter) + '\n';
  });

  document.getElementById('csvOutput').value = csv;

  // Preview table
  const preview = data.slice(0, 10);
  let tableHtml = '<table class="csv-table"><thead><tr>' + keys.map(k => `<th>${escapeHtml(k)}</th>`).join('') + '</tr></thead><tbody>';
  preview.forEach(row => { tableHtml += '<tr>' + keys.map(k => `<td>${escapeHtml(String(row?.[k] ?? ''))}</td>`).join('') + '</tr>'; });
  tableHtml += '</tbody></table>';
  document.getElementById('csvPreview').innerHTML = tableHtml;
});

function csvEscape(val, delimiter) {
  const s = String(val ?? '');
  if (s.includes(delimiter) || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

document.getElementById('copyCsvBtn')?.addEventListener('click', function () {
  navigator.clipboard.writeText(document.getElementById('csvOutput').value).then(() => { this.textContent = '✅ 已复制'; setTimeout(() => { this.textContent = '📋 复制'; }, 2000); });
});
document.getElementById('downloadCsvBtn')?.addEventListener('click', function () {
  const blob = new Blob([document.getElementById('csvOutput').value], { type: 'text/csv' });
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'data.csv' });
  a.click(); URL.revokeObjectURL(a.href);
});

// ========== JSON to YAML ==========
function jsonToYaml(obj, indent) {
  indent = indent || 0;
  const pad = '  '.repeat(indent);
  if (obj === null) return 'null';
  if (typeof obj === 'boolean' || typeof obj === 'number') return String(obj);
  if (typeof obj === 'string') {
    if (/[\n:#\[\]{},&*?|<>=!%@`]/.test(obj) || obj.trim() !== obj || obj === '') return JSON.stringify(obj);
    return obj;
  }
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    return obj.map(v => {
      const s = jsonToYaml(v, indent + 1);
      return pad + '- ' + (typeof v === 'object' && v !== null ? '\n  ' + pad + s.trimStart() : s);
    }).join('\n');
  }
  const keys = Object.keys(obj);
  if (keys.length === 0) return '{}';
  return keys.map(k => {
    const v = obj[k];
    const yk = /[:#\[\]{},&*?|<>=!%@`\s]/.test(k) ? JSON.stringify(k) : k;
    if (typeof v === 'object' && v !== null) {
      return pad + yk + ':\n' + jsonToYaml(v, indent + 1).split('\n').map(l => '  ' + l).join('\n');
    }
    return pad + yk + ': ' + jsonToYaml(v, indent + 1);
  }).join('\n');
}

function yamlToJson(yaml) {
  // Minimal YAML→JSON: handles simple key: value and nested indentation
  const lines = yaml.split('\n');
  function parse(lines, baseIndent) {
    const result = {};
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (!line.trim() || line.trim().startsWith('#')) { i++; continue; }
      const indent = line.search(/\S/);
      if (indent < baseIndent) break;
      const m = line.match(/^(\s*)([\w\s"'-]+?)\s*:\s*(.*)/);
      if (!m) { i++; continue; }
      const key = m[2].trim().replace(/^["']|["']$/g, '');
      let val = m[3].trim();
      // Check if next lines are children
      const childLines = [];
      let j = i + 1;
      while (j < lines.length && (lines[j].search(/\S/) > indent || !lines[j].trim())) {
        childLines.push(lines[j]); j++;
      }
      if (!val && childLines.length) {
        result[key] = parse(childLines, indent + 2);
        i = j; continue;
      }
      // parse scalar
      if (val === 'null' || val === '~') result[key] = null;
      else if (val === 'true') result[key] = true;
      else if (val === 'false'
