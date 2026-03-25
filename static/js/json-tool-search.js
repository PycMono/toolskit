'use strict';
// search
// Parsed cache — set when processJson() succeeds, used for live re-search on input change
let _searchParsed = null;

function initToolOptions() {
  // searchControls is now in the right-panel header (new layout)
  const target = document.getElementById('searchControls') || document.getElementById('toolOptions');
  if (!target) return;
  target.innerHTML =
    '<input id="searchInput" type="text" placeholder="搜索 Key 或 Value..." class="jt-options-input" style="width:180px;flex:1" oninput="_runSearch()">' +
    '<div class="jt-options-radio-group" style="display:flex;gap:6px;flex-wrap:wrap">' +
      '<label class="jt-options-radio"><input type="radio" name="searchIn" value="both" checked><span>全部</span></label>' +
      '<label class="jt-options-radio"><input type="radio" name="searchIn" value="key"><span>仅 Key</span></label>' +
      '<label class="jt-options-radio"><input type="radio" name="searchIn" value="value"><span>仅 Value</span></label>' +
    '</div>';
  // Re-wire radio buttons to also trigger live search
  target.querySelectorAll('input[name="searchIn"]').forEach(function(r) {
    r.addEventListener('change', _runSearch);
  });
}

function processJson() {
  clearErrorPanel();
  const parsed = parseInput(); if (parsed === null) return;
  _searchParsed = parsed;
  // Auto-run search immediately if a query is already typed
  _runSearch();
  const el = document.getElementById('outputStats');
  if (el) el.innerHTML = '<span class="jt-success-badge">✅ 解析成功，可输入关键词搜索</span>';
}

function _runSearch() {
  if (!_searchParsed) return;
  const qEl = document.getElementById('searchInput');
  const query = qEl ? qEl.value.trim() : '';
  const container = document.getElementById('searchOutput');
  if (!container) return;
  if (!query) {
    container.innerHTML = '<p class="jt-search-empty" style="color:var(--jt-muted);padding:16px">请在上方输入搜索关键词</p>';
    return;
  }
  const checkedEl = document.querySelector('input[name="searchIn"]:checked');
  const searchIn = checkedEl ? checkedEl.value : 'both';
  const results = searchJson(_searchParsed, query, searchIn, '$');
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
