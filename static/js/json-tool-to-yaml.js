'use strict';
// to-yaml (uses js-yaml CDN when available, falls back to built-in serializer)
function initToolOptions() {}

function processJson() {
  clearErrorPanel();
  const parsed = parseInput();
  if (parsed === null) return;
  const yaml = window.jsyaml || window.YAML || null;
  if (yaml) {
    try {
      const yamlStr = yaml.dump(parsed, { indent: 2, lineWidth: 120 });
      setOutput(yamlStr, 'yaml');
      const el = document.getElementById('outputStats');
      if (el) el.innerHTML = '<span class="jt-success-badge">✅ JSON → YAML 转换成功</span>';
      return;
    } catch(e) { /* fall through to built-in */ }
  }
  // Built-in YAML serializer
  setOutput(_builtinJsonToYaml(parsed), 'yaml');
  const el = document.getElementById('outputStats');
  if (el) el.innerHTML = '<span class="jt-success-badge">✅ JSON → YAML 转换成功</span>';
}

function _builtinJsonToYaml(obj, indent) {
  indent = indent || 0;
  const pad = '  '.repeat(indent);
  if (obj === null || obj === undefined) return 'null';
  if (typeof obj === 'boolean' || typeof obj === 'number') return String(obj);
  if (typeof obj === 'string') {
    if (/[\n:#\[\]{},&*?|<>=!%@`'"]/.test(obj) || obj.trim() !== obj || obj === '') return JSON.stringify(obj);
    if (obj === 'true' || obj === 'false' || obj === 'null' || /^[0-9]/.test(obj)) return JSON.stringify(obj);
    return obj;
  }
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    return obj.map(v => {
      const s = _builtinJsonToYaml(v, indent + 1);
      return pad + '- ' + (typeof v === 'object' && v !== null ? '\n  ' + pad + s.trimStart() : s);
    }).join('\n');
  }
  const keys = Object.keys(obj);
  if (keys.length === 0) return '{}';
  return keys.map(k => {
    const v = obj[k];
    const yk = /[:#\[\]{},&*?|<>=!%@`'"\s]/.test(k) ? JSON.stringify(k) : k;
    if (typeof v === 'object' && v !== null) {
      return pad + yk + ':\n' + _builtinJsonToYaml(v, indent + 1).split('\n').map(l => '  ' + l).join('\n');
    }
    return pad + yk + ': ' + _builtinJsonToYaml(v, indent + 1);
  }).join('\n');
}
