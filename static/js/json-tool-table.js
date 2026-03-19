'use strict';
// table viewer
let _tableData = [], _tableKeys = [], _sortState = { key: null, dir: 'asc' };
function initToolOptions() {}
function processJson() {
  const parsed = parseInput(); if (parsed === null) return;
  if (!Array.isArray(parsed)) { showToast('输入必须为 JSON 数组', 'error'); return; }
  _tableKeys = [...new Set(parsed.flatMap(r => (typeof r==='object'&&r) ? Object.keys(r) : []))];
  _tableData = parsed;
  renderTable(_tableData, _tableKeys);
}
function renderTable(data, keys) {
  const container = document.getElementById('tableOutput');
  const search = document.getElementById('tableSearch')?.value?.toLowerCase() || '';
  const filtered = search ? data.filter(r => JSON.stringify(r).toLowerCase().includes(search)) : data;
  const thead = keys.map(k => `<th class="jt-table-th" onclick="sortTable('${escapeHtml(k)}')">${escapeHtml(k)}${_sortState.key===k?(_sortState.dir==='asc'?' ↑':' ↓'):''}</th>`).join('');
  const tbody = filtered.map(row => `<tr>${keys.map(k=>`<td class="jt-table-td">${escapeHtml(String(row?.[k]??''))}</td>`).join('')}</tr>`).join('');
  container.innerHTML = `
    <div class="jt-table-toolbar">
      <input id="tableSearch" type="text" class="jt-table-search" placeholder="搜索..." value="${search}" oninput="renderTable(_tableData,_tableKeys)">
      <span class="jt-table-count">共 ${filtered.length} 行</span>
    </div>
    <div class="jt-table-wrap"><table class="jt-table"><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table></div>`;
}
function sortTable(key) {
  const dir = _sortState.key===key && _sortState.dir==='asc' ? 'desc' : 'asc';
  _sortState = { key, dir };
  _tableData.sort((a,b)=>{ const va=String(a[key]??''),vb=String(b[key]??''); return dir==='asc'?va.localeCompare(vb):vb.localeCompare(va); });
  renderTable(_tableData, _tableKeys);
}

