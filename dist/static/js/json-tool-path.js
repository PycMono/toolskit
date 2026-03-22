'use strict';
// path (requires jsonpath-plus UMD global, or cdnjs jsonpath fallback)
function initToolOptions() {
  document.getElementById('toolOptions').innerHTML = `
    <span class="jt-options-label">JSONPath 表达式</span>
    <input id="pathInput" type="text" placeholder="例如：$.store.book[*].author" class="jt-options-input" style="width:280px">`;
}
function processJson() {
  clearErrorPanel();
  const parsed = parseInput(); if (parsed === null) return;
  const expr = (document.getElementById('pathInput') ? document.getElementById('pathInput').value : '').trim();
  if (!expr) { showToast('请输入 JSONPath 表达式','error'); return; }
  try {
    let results = null;
    // jsonpath-plus: exposes window.JSONPath.JSONPath or window.JSONPath as function
    if (window.JSONPath && typeof window.JSONPath.JSONPath === 'function') {
      results = window.JSONPath.JSONPath({ path: expr, json: parsed });
    } else if (typeof window.JSONPath === 'function') {
      results = window.JSONPath({ path: expr, json: parsed });
    }
    // cdnjs jsonpath fallback: exposes window.jsonpath.query
    else if (window.jsonpath && typeof window.jsonpath.query === 'function') {
      results = window.jsonpath.query(parsed, expr);
    }
    else {
      showToast('JSONPath 库未加载，请刷新重试', 'error');
      return;
    }
    if (!Array.isArray(results)) results = [results];
    setOutput(JSON.stringify(results, null, 2));
    const el = document.getElementById('outputStats');
    if (el) el.innerHTML = `<span class="jt-success-badge">✅ 匹配 ${results.length} 条</span>`;
  } catch(e) { showErrorPanel(e, JSON.stringify(parsed, null, 2)); }
}
