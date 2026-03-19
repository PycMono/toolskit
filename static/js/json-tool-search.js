'use strict';
// search
function initToolOptions() {
  // Render search controls - try below-button slot first (new layout), fallback to top bar
  const target = document.getElementById('searchControls') || document.getElementById('toolOptions');
  if (!target) return;
  target.innerHTML =
    '<input id="searchInput" type="text" placeholder="搜索 Key 或 Value..." class="jt-options-input" style="width:200px;flex:1" oninput="processJson()">' +
    '<div class="jt-options-radio-group" style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<label class="jt-options-radio"><input type="radio" name="searchIn" value="both" checked><span>全部</span></label>' +
      '<label class="jt-options-radio"><input type="radio" name="searchIn" value="key"><span>仅 Key</span></label>' +
      '<label class="jt-options-radio"><input type="radio" name="searchIn" value="value"><span>仅 Value</span></label>' +
    '</div>';
}
function processJson() {
  const parsed = parseInput(); if (parsed === null) return;
  const qEl = document.getElementById('searchInput');
  const query = qEl ? qEl.value.trim() : '';
  if (!query) return;
  const checkedEl = document.querySelector('input[name="searchIn"]:checked');
  const searchIn = checkedEl ? checkedEl.value : 'both';
  const results = searchJson(parsed, query, searchIn, '$');
  renderSearchResults(results);
}
function searchJson(node, query, searchIn, path) {
  const res = [], q = query.toLowerCase();
  function walk(v, p) {
    if (typeof v === 'object' && v !== null) {
      for (const [k, child] of Object.entries(v)) {
        const cp = Array.isArray(v) ? p + '[' + k + ']' : p + '.' + k;
        if ((searchIn === 'key' || searchIn === 'both') && k.toLowerCase().includes(q))
          res.push({ path: cp, matchType: 'key', key: k, value: child });
        walk(child, cp);
      }
    } else if ((searchIn === 'value' || searchIn === 'both') && String(v).toLowerCase().includes(q)) {
      res.push({ path: p, matchType: 'value', value: v });
    }
  }
  walk(node, path); return res;
}
function renderSearchResults(results) {
  const c = document.getElementById('searchOutput');
  if (!c) return;
  if (results.length === 0) { c.innerHTML = '<p class="jt-search-empty">未找到匹配</p>'; return; }
  c.innerHTML = '<p class="jt-search-count">找到 ' + results.length + ' 处</p>' +
    results.map(function(r) {
      return '<div class="jt-search-item">' +
        '<span class="jt-search-path">' + escapeHtml(r.path) + '</span>' +
        '<span class="jt-search-badge jt-search-badge--' + r.matchType + '">' + r.matchType + '</span>' +
        '<span class="jt-search-value">' + escapeHtml(JSON.stringify(r.value)) + '</span>' +
        '</div>';
    }).join('');
}
