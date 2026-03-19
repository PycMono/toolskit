'use strict';
// path (requires jsonpath-plus UMD global)
function initToolOptions() {
  document.getElementById('toolOptions').innerHTML = `
    <span class="jt-options-label">JSONPath 表达式</span>
    <input id="pathInput" type="text" placeholder="例如：$.store.book[*].author" class="jt-options-input" style="width:280px">`;
}
function processJson() {
  const parsed = parseInput(); if (parsed === null) return;
  const expr = (document.getElementById('pathInput') ? document.getElementById('pathInput').value : '').trim();
  if (!expr) { showToast('请输入 JSONPath 表达式','error'); return; }
  try {
    // jsonpath-plus UMD exposes window.JSONPath or window.jsonpathPlus.JSONPath
    let JPFn = null;
    if (window.JSONPath && typeof window.JSONPath.JSONPath === 'function') JPFn = window.JSONPath.JSONPath;
    else if (typeof window.JSONPath === 'function') JPFn = window.JSONPath;
    else if (window.jsonpathPlus && typeof window.jsonpathPlus.JSONPath === 'function') JPFn = window.jsonpathPlus.JSONPath;
    if (!JPFn) { showToast('JSONPath 库未加载，请刷新重试', 'error'); return; }
    const results = JPFn({ path: expr, json: parsed });
    setOutput(JSON.stringify(results, null, 2));
    const el = document.getElementById('outputStats');
    if (el) el.textContent = '匹配 ' + (Array.isArray(results) ? results.length : 1) + ' 条';
  } catch(e) { showToast('JSONPath 错误：' + e.message, 'error'); }
}
