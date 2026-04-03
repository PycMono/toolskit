'use strict';
// search
let _searchParsed = null;

function initToolOptions() {
  const target = document.getElementById('searchControls') || document.getElementById('toolOptions');
  if (!target) return;
  target.innerHTML =
    '<input id="searchInput" type="text" placeholder="' + (i18n('json.search.placeholder') || '搜索 Key 或 Value...') + '" class="jt-options-input" style="width:180px;flex:1" oninput="_runSearch()">' +
    '<div class="jt-options-radio-group" style="display:flex;gap:6px;flex-wrap:wrap">' +
      '<label class="jt-options-radio"><input type="radio" name="searchIn" value="both" checked><span>' + (i18n('json.search.all') || '全部') + '</span></label>' +
      '<label class="jt-options-radio"><input type="radio" name="searchIn" value="key"><span>' + (i18n('json.search.key_only') || '仅 Key') + '</span></label>' +
      '<label class="jt-options-radio"><input type="radio" name="searchIn" value="value"><span>' + (i18n('json.search.value_only') || '仅 Value') + '</span></label>' +
    '</div>' +
    '<div style="display:flex;gap:8px;align-items:center;margin-top:6px">' +
      '<label class="jt-options-radio"><input type="checkbox" id="searchRegex"> <span>' + (i18n('json.search.regex') || '正则') + '</span></label>' +
      '<label class="jt-options-radio"><input type="checkbox" id="searchCaseSensitive"> <span>' + (i18n('json.search.case_sensitive') || '区分大小写') + '</span></label>' +
      '<label class="jt-options-radio"><input type="checkbox" id="searchWholeWord"> <span>' + (i18n('json.search.whole_word') || '整词匹配') + '</span></label>' +
    '</div>';
  target.querySelectorAll('input[name="searchIn"]').forEach(r => r.addEventListener('change', _runSearch));
  ['searchRegex', 'searchCaseSensitive', 'searchWholeWord'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', _runSearch);
  });
}

function processJson() {
  clearErrorPanel();
  const parsed = parseInput(); if (parsed === null) return;
  _searchParsed = parsed;
  _runSearch();
  const el = document.getElementById('outputStats');
  if (el) el.innerHTML = '<span class="jt-success-badge">✅ ' + (i18n('json.search.parse_ok') || '解析成功，可输入关键词搜索') + '</span>';
}

function _matchQuery(text, query) {
  const useRegex = document.getElementById('searchRegex')?.checked;
  const caseSensitive = document.getElementById('searchCaseSensitive')?.checked;
  const wholeWord = document.getElementById('searchWholeWord')?.checked;

  if (useRegex) {
    try {
      const flags = caseSensitive ? '' : 'i';
      let pattern = query;
      if (wholeWord) pattern = '\\b' + pattern + '\\b';
      const re = new RegExp(pattern, flags);
      return re.test(text);
    } catch(e) {
      return false; // Invalid regex
    }
  }

  const t = caseSensitive ? text : text.toLowerCase();
  const q = caseSensitive ? query : query.toLowerCase();

  if (wholeWord) {
    const re = new RegExp('\\b' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', caseSensitive ? '' : 'i');
    return re.test(text);
  }

  return t.includes(q);
}

function _runSearch() {
  if (!_searchParsed) return;
  const qEl = document.getElementById('searchInput');
  const query = qEl ? qEl.value.trim() : '';
  const container = document.getElementById('searchOutput');
  if (!container) return;
  if (!query) {
    container.innerHTML = '<p class="jt-search-empty" style="color:var(--jt-muted);padding:16px">' + (i18n('json.search.enter_query') || '请在上方输入搜索关键词') + '</p>';
    return;
  }
  const checkedEl = document.querySelector('input[name="searchIn"]:checked');
  const searchIn = checkedEl ? checkedEl.value : 'both';
  const results = searchJson(_searchParsed, query, searchIn, '$');
  renderSearchResults(results);
}

function searchJson(node, query, searchIn, path) {
  const res = [];
  function walk(v, p) {
    if (typeof v === 'object' && v !== null) {
      for (const [k, child] of Object.entries(v)) {
        const cp = Array.isArray(v) ? p + '[' + k + ']' : p + '.' + k;
        if ((searchIn === 'key' || searchIn === 'both') && _matchQuery(k, query))
          res.push({ path: cp, matchType: 'key', key: k, value: child });
        walk(child, cp);
      }
    } else if ((searchIn === 'value' || searchIn === 'both') && _matchQuery(String(v), query)) {
      res.push({ path: p, matchType: 'value', value: v });
    }
  }
  walk(node, path); return res;
}

function renderSearchResults(results) {
  const c = document.getElementById('searchOutput');
  if (!c) return;
  if (results.length === 0) {
    c.innerHTML = '<p class="jt-search-empty">' + (i18n('json.search.no_results') || '未找到匹配') + '</p>';
    return;
  }
  c.innerHTML = '<p class="jt-search-count">' + (i18n('json.search.found') || '找到') + ' ' + results.length + ' ' + (i18n('json.search.matches') || '处') + '</p>' +
    results.map(r => {
      return '<div class="jt-search-item">' +
        '<span class="jt-search-path">' + escapeHtml(r.path) + '</span>' +
        '<span class="jt-search-badge jt-search-badge--' + r.matchType + '">' + r.matchType + '</span>' +
        '<span class="jt-search-value">' + escapeHtml(JSON.stringify(r.value)) + '</span>' +
      '</div>';
    }).join('');
}
