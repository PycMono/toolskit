'use strict';
// from-yaml (uses js-yaml CDN when available, falls back to built-in parser)
function initToolOptions() {}

function processJson() {
  clearErrorPanel();
  const raw = getInput().trim();
  if (!raw) return;
  const yaml = window.jsyaml || window.YAML || null;
  if (yaml) {
    try {
      const parsed = yaml.load(raw);
      setOutput(JSON.stringify(parsed, null, 2));
      const el = document.getElementById('outputStats');
      if (el) el.innerHTML = '<span class="jt-success-badge">✅ YAML → JSON 转换成功</span>';
      return;
    } catch(e) { /* fall through to built-in */ }
  }
  // Built-in YAML parser
  try {
    const parsed = _builtinYamlToJson(raw);
    setOutput(JSON.stringify(parsed, null, 2));
    const el = document.getElementById('outputStats');
    if (el) el.innerHTML = '<span class="jt-success-badge">✅ YAML → JSON 转换成功</span>';
  } catch(e) {
    showErrorPanel(e, raw);
    setOutput('', 'plaintext');
  }
}

function _builtinYamlToJson(yaml) {
  const lines = yaml.split('\n');
  const root = {};
  const stack = [{ obj: root, indent: -1 }];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) { i++; continue; }
    const indent = line.search(/\S/);
    if (indent < 0) { i++; continue; }
    // Pop stack
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
    const ctx = stack[stack.length - 1].obj;
    // List item
    if (line.trim().startsWith('- ')) {
      const item = line.trim().substring(2).trim();
      if (!Array.isArray(ctx._list)) ctx._list = [];
      if (item === '' || item.includes(': ')) {
        const newObj = {};
        ctx._list.push(newObj);
        if (item && item.includes(': ')) {
          const ci = item.indexOf(': ');
          const key = item.substring(0, ci).replace(/^["']|["']$/g, '').trim();
          const val = item.substring(ci + 1).trim();
          newObj[key] = _parseYamlScalar(val);
        }
        stack.push({ obj: newObj, indent: indent + 2 });
      } else {
        ctx._list.push(_parseYamlScalar(item));
      }
      i++; continue;
    }
    // Key: value
    const m = line.match(/^(\s*)([\w\s"'-][^:]*?)\s*:\s*(.*)/);
    if (!m) { i++; continue; }
    const key = m[2].trim().replace(/^["']|["']$/g, '');
    let val = m[3].trim();
    // Remove inline comment
    const commentIdx = val.indexOf(' #');
    if (commentIdx > 0) val = val.substring(0, commentIdx).trim();
    if (!val || val === '|' || val === '>') {
      ctx[key] = {};
      stack.push({ obj: ctx[key], indent: indent + 2 });
    } else if (val.startsWith('[') && val.endsWith(']')) {
      ctx[key] = _parseYamlArray(val);
    } else if (val.startsWith('{') && val.endsWith('}')) {
      try { ctx[key] = JSON.parse(val.replace(/'/g, '"')); }
      catch(e) { ctx[key] = val; }
    } else {
      ctx[key] = _parseYamlScalar(val);
    }
    i++;
  }
  // Convert _list arrays
  _convertLists(root);
  return root;
}

function _parseYamlScalar(val) {
  if (val === '' || val === '~') return null;
  if (val === 'true') return true;
  if (val === 'false') return false;
  if (val === 'null') return null;
  // Quoted string
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    try { return JSON.parse(val); } catch(e) { return val.slice(1, -1); }
  }
  // Number
  if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(val)) {
    return Number(val);
  }
  // Inline array [a, b, c]
  if (val.startsWith('[') && val.endsWith(']')) {
    return _parseYamlArray(val);
  }
  return val;
}

function _parseYamlArray(val) {
  const inner = val.slice(1, -1).trim();
  if (!inner) return [];
  let result = [];
  let current = '';
  let inStr = false;
  let esc = false;
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (esc) { current += ch; esc = false; continue; }
    if (ch === '\\' && inStr) { current += ch; esc = true; continue; }
    if ((ch === '"' || ch === "'") && !inStr) { inStr = ch; current += ch; continue; }
    if (ch === inStr) { inStr = false; current += ch; continue; }
    if (ch === ',' && !inStr) {
      result.push(_parseYamlScalar(current.trim()));
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) result.push(_parseYamlScalar(current.trim()));
  return result;
}

function _convertLists(obj) {
  if (typeof obj !== 'object' || obj === null) return;
  if (Array.isArray(obj)) { obj.forEach(_convertLists); return; }
  for (const key of Object.keys(obj)) {
    if (key === '_list' && Array.isArray(obj._list)) {
      const items = obj._list;
      delete obj._list;
      obj[key] = items.map(item => {
        if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
          _convertLists(item);
          return item;
        }
        return item;
      });
      // Fix: if parent already has key, merge
      const parent = obj;
      if (parent._list === undefined) {
        // Already handled above
      }
    } else {
      _convertLists(obj[key]);
    }
  }
}
