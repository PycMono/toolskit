'use strict';
// path (uses jsonpath-plus CDN when available, falls back to built-in engine)
function initToolOptions() {
  document.getElementById('toolOptions').innerHTML =
    '<span class="jt-options-label">JSONPath 表达式</span>' +
    '<input id="pathInput" type="text" placeholder="例如：$.store.book[*].author" class="jt-options-input" style="width:280px">';
}
function processJson() {
  clearErrorPanel();
  const parsed = parseInput(); if (parsed === null) return;
  const expr = (document.getElementById('pathInput') ? document.getElementById('pathInput').value : '').trim();
  if (!expr) { showToast('请输入 JSONPath 表达式','error'); return; }
  try {
    let results = null;
    // Try CDN library first
    if (window.JSONPath && typeof window.JSONPath.JSONPath === 'function') {
      results = window.JSONPath.JSONPath({ path: expr, json: parsed });
    } else if (typeof window.JSONPath === 'function') {
      results = window.JSONPath({ path: expr, json: parsed });
    } else if (window.jsonpath && typeof window.jsonpath.query === 'function') {
      results = window.jsonpath.query(parsed, expr);
    } else {
      // Built-in fallback
      results = _builtinJsonPath(parsed, expr);
    }
    if (!Array.isArray(results)) results = [results];
    setOutput(JSON.stringify(results, null, 2));
    const el = document.getElementById('outputStats');
    if (el) el.innerHTML = '<span class="jt-success-badge">✅ 匹配 ' + results.length + ' 条</span>';
  } catch(e) { showErrorPanel(e, JSON.stringify(parsed, null, 2)); }
}

/* ── Built-in JSONPath engine ────────────────────── */
function _builtinJsonPath(data, path) {
  if (path === '$') return [data];
  const results = [];
  function query(node, tokens) {
    if (tokens.length === 0) { results.push(node); return; }
    const [tok, ...rest] = tokens;
    if (tok === '**') { queryAll(node, rest); }
    else if (tok === '*') {
      if (typeof node === 'object' && node !== null) {
        (Array.isArray(node) ? node : Object.values(node)).forEach(v => query(v, rest));
      }
    } else if (/^\(\.\.\.([^)]+)\)$/.test(tok)) {
      // Deep scan: (...name)
      const name = tok.match(/^\(\.\.\.([^)]+)\)$/)[1];
      queryAllFiltered(node, name, rest);
    } else if (/^\.\./.test(tok)) {
      // Recursive descent: ..key
      const key = tok.replace(/^\.\./, '');
      queryAllFiltered(node, key, rest);
    } else if (/^\(([^)]+)\)$/.test(tok)) {
      // Filter: ?(expression) - basic support
      const filterExpr = tok.match(/^\(([^)]+)\)$/)[1];
      if (typeof node === 'object' && node !== null) {
        (Array.isArray(node) ? node : Object.values(node)).forEach((v, idx) => {
          try {
            if (_evalFilter(filterExpr, v, idx)) query(v, rest);
          } catch(e) {}
        });
      }
    } else if (/^\[(-?\d+)?:(-?\d+)?\]$/.test(tok)) {
      // Slice: [start:end]
      const m = tok.match(/^\[(-?\d+)?:(-?\d+)?\]$/);
      const start = m[1] ? parseInt(m[1]) : 0;
      const end = m[2] ? parseInt(m[2]) : undefined;
      if (Array.isArray(node)) {
        const slice = node.slice(start, end);
        slice.forEach(v => query(v, rest));
      }
    } else if (/^\[(-?\d+)\]$/.test(tok)) {
      const idx = parseInt(tok.slice(1, -1));
      if (Array.isArray(node) && node[idx] !== undefined) query(node[idx], rest);
    } else if (/^[-]?\d+$/.test(tok)) {
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
  function queryAllFiltered(node, key, rest) {
    if (typeof node === 'object' && node !== null) {
      if (Array.isArray(node)) {
        node.forEach(item => {
          if (typeof item === 'object' && item !== null && key in item) query(item[key], rest);
          queryAllFiltered(item, key, rest);
        });
      } else {
        if (key in node) query(node[key], rest);
        Object.values(node).forEach(v => queryAllFiltered(v, key, rest));
      }
    }
  }
  function _evalFilter(expr, item, idx) {
    // Support: @.key, @.key=="value", @.key > 5
    const match = expr.match(/@\.(\w+)\s*(==|!=|>=|<=|>|<)\s*(.+)/);
    if (match) {
      const key = match[1], op = match[2], val = match[3].trim().replace(/^['"]|['"]$/g, '');
      const itemVal = typeof item === 'object' && item !== null ? item[key] : undefined;
      const numVal = parseFloat(val);
      if (!isNaN(numVal)) {
        switch (op) {
          case '==': return itemVal == numVal;
          case '!=': return itemVal != numVal;
          case '>': return itemVal > numVal;
          case '<': return itemVal < numVal;
          case '>=': return itemVal >= numVal;
          case '<=': return itemVal <= numVal;
        }
      }
      switch (op) {
        case '==': return String(itemVal) === val;
        case '!=': return String(itemVal) !== val;
        default: return false;
      }
    }
    // Support: @.key (truthy check)
    const propMatch = expr.match(/@\.(\w+)$/);
    if (propMatch) {
      const val = typeof item === 'object' && item !== null ? item[propMatch[1]] : undefined;
      return !!val;
    }
    return false;
  }
  // Tokenize: $.a.b[0][*]..c, $.store.book[?(@.price < 10)]
  const tokens = _tokenizeJsonPath(path);
  query(data, tokens);
  return results;
}

function _tokenizeJsonPath(path) {
  path = path.replace(/^\$/, '');
  const tokens = [];
  let i = 0;
  while (i < path.length) {
    if (path[i] === '.') {
      if (path[i + 1] === '.') {
        // Recursive descent
        i += 2;
        let key = '';
        while (i < path.length && /[\w$-]/.test(path[i])) { key += path[i]; i++; }
        tokens.push('..' + key);
        continue;
      }
      i++; // skip single dot
      let key = '';
      while (i < path.length && /[\w$-]/.test(path[i])) { key += path[i]; i++; }
      if (key) tokens.push(key);
      continue;
    }
    if (path[i] === '[') {
      let j = i + 1;
      let depth = 1;
      while (j < path.length && depth > 0) {
        if (path[j] === '[') depth++;
        if (path[j] === ']') depth--;
        j++;
      }
      const bracket = path.substring(i + 1, j - 1);
      tokens.push('[' + bracket + ']');
      i = j;
      continue;
    }
    // Skip whitespace
    if (/\s/.test(path[i])) { i++; continue; }
    i++;
  }
  return tokens;
}
