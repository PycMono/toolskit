'use strict';
// tree viewer
function initToolOptions() {}
function processJson() {
  clearErrorPanel();
  const parsed = parseInput(); if (parsed === null) return;
  const container = document.getElementById('treeOutput');
  container.innerHTML = '';
  container.appendChild(renderNode(parsed, 'root', '$'));
  const el = document.getElementById('outputStats');
  if (el) el.innerHTML = '<span class="jt-success-badge">✅ 树形渲染完成</span>';
}
function renderNode(value, key, path) {
  const wrap = document.createElement('div');
  wrap.className = 'jt-tree-node';
  if (value === null || typeof value !== 'object') {
    wrap.innerHTML = '<div class="jt-tree-leaf">' +
      '<span class="jt-tree-key" onclick="copyPath(\'' + escapeHtml(path) + '\')" title="复制路径">' + escapeHtml(String(key)) + '</span>' +
      '<span class="jt-tree-sep">: </span>' + renderValue(value) + '</div>';
    return wrap;
  }
  const isArr = Array.isArray(value);
  const keys  = Object.keys(value);
  const depth = (path.match(/[.\[]/g) || []).length;
  const open  = depth < 2;
  const header = document.createElement('div');
  header.className = 'jt-tree-header';
  header.innerHTML =
    '<button class="jt-tree-toggle" onclick="toggleNode(this)">' + (open ? '▼' : '▶') + '</button>' +
    '<span class="jt-tree-key" onclick="copyPath(\'' + escapeHtml(path) + '\')" title="复制路径">' + escapeHtml(String(key)) + '</span>' +
    '<span class="jt-tree-sep">: </span>' +
    '<span class="jt-tree-bracket">' + (isArr ? '[' : '{') + '</span>' +
    '<span class="jt-tree-preview">' + (isArr ? keys.length + ' items' : keys.length + ' keys') + '</span>' +
    '<span class="jt-tree-bracket">' + (isArr ? ']' : '}') + '</span>';
  const children = document.createElement('div');
  children.className = 'jt-tree-children';
  if (!open) children.style.display = 'none';
  for (const k of keys) {
    const cp = isArr ? path + '[' + k + ']' : path + '.' + k;
    children.appendChild(renderNode(value[k], k, cp));
  }
  wrap.appendChild(header); wrap.appendChild(children);
  return wrap;
}
function toggleNode(btn) {
  const c = btn.closest('.jt-tree-header').nextElementSibling;
  const h = c.style.display === 'none';
  c.style.display = h ? '' : 'none';
  btn.textContent = h ? '▼' : '▶';
}
function expandAll()   { document.querySelectorAll('.jt-tree-children').forEach(function(n){ n.style.display = ''; }); }
function collapseAll() { document.querySelectorAll('.jt-tree-children').forEach(function(n){ n.style.display = 'none'; }); }
function copyPath(path) {
  navigator.clipboard.writeText(path).then(function(){ showToast('已复制：' + path, 'success'); });
}
function renderValue(v) {
  if (v === null)             return '<span class="jt-val-null">null</span>';
  if (typeof v === 'boolean') return '<span class="jt-val-bool">' + v + '</span>';
  if (typeof v === 'number')  return '<span class="jt-val-num">' + v + '</span>';
  return '<span class="jt-val-str">"' + escapeHtml(String(v)) + '"</span>';
}
