'use strict';
// python-dict — Convert between Python dict and JSON format

function initToolOptions() {
  const el = document.getElementById('toolOptions');
  if (!el) return;
  el.innerHTML = `
    <span class="jt-options-label">转换方向</span>
    <div class="jt-options-row" style="gap:8px">
      <button class="jt-btn jt-btn--sm" id="btnToJson" onclick="setDirection('to-json')" style="background:#eef2ff">Python → JSON</button>
      <button class="jt-btn jt-btn--sm" id="btnToPy" onclick="setDirection('to-py')">JSON → Python</button>
    </div>
  `;
  window._pyDictDirection = 'to-json';
}

function setDirection(dir) {
  window._pyDictDirection = dir;
  document.getElementById('btnToJson').style.background = dir === 'to-json' ? '#eef2ff' : '';
  document.getElementById('btnToPy').style.background = dir === 'to-py' ? '#eef2ff' : '';
}

function processJson() {
  clearErrorPanel();
  const input = getEditorValue ? getEditorValue() : (editor ? editor.getValue() : '');
  if (!input.trim()) {
    showError('请输入 Python dict 或 JSON');
    return;
  }

  const direction = window._pyDictDirection || 'to-json';

  try {
    let result, output;
    if (direction === 'to-json') {
      result = pythonDictToJson(input);
      output = JSON.stringify(result, null, 2);
      setOutput(output, 'json');
    } else {
      result = jsonToPythonDict(input);
      setOutput(result, 'python');
    }
    const statsEl = document.getElementById('outputStats');
    if (statsEl) {
      statsEl.innerHTML = `<span class="jt-success-badge">✅ ${direction === 'to-json' ? 'JSON' : 'Python Dict'} 转换完成</span>`;
    }
  } catch (err) {
    showError('转换失败: ' + err.message);
  }
}

function pythonDictToJson(str) {
  // Clean up the input
  str = str.trim();

  // Remove Python comments
  str = str.replace(/#.*$/gm, '');

  // Replace Python literals with JSON equivalents
  str = str.replace(/\bTrue\b/g, 'true');
  str = str.replace(/\bFalse\b/g, 'false');
  str = str.replace(/\bNone\b/g, 'null');

  // Handle single-quoted strings - convert to double-quoted
  // This is tricky because we need to handle escaped quotes
  str = convertQuotes(str);

  // Handle Python tuple to JSON array
  str = str.replace(/\(([^)]*)\)/g, '[$1]');

  // Handle trailing commas (not valid in JSON)
  str = str.replace(/,(\s*[\]}])/g, '$1');

  try {
    return JSON.parse(str);
  } catch (e) {
    throw new Error('无法解析 Python dict: ' + e.message);
  }
}

function convertQuotes(str) {
  // Simple approach: replace single quotes with double quotes
  // This handles most common cases but may not be perfect for all edge cases

  let result = '';
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let escaped = false;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const prevChar = i > 0 ? str[i - 1] : '';

    if (escaped) {
      escaped = false;
      // Convert escaped single quote inside single-quoted string
      if (inSingleQuote && char === "'") {
        result += "'";
        continue;
      }
      result += char;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      // In single-quoted string, escape double quotes for JSON
      if (inSingleQuote) {
        const nextChar = str[i + 1];
        if (nextChar === '"') {
          result += '\\';
          continue;
        }
      }
      result += char;
      continue;
    }

    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      result += '"';
      continue;
    }

    if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      result += '\\"';
      continue;
    }

    result += char;
  }

  return result;
}

function jsonToPythonDict(str) {
  let parsed;
  try {
    parsed = JSON.parse(str);
  } catch (e) {
    throw new Error('无效的 JSON: ' + e.message);
  }

  return valueToPython(parsed, 0);
}

function valueToPython(value, indent) {
  const spaces = '    '.repeat(indent);

  if (value === null) return 'None';
  if (typeof value === 'boolean') return value ? 'True' : 'False';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') {
    // Use single quotes for Python strings, escape internal single quotes
    const escaped = value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    return `'${escaped}'`;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const items = value.map(v => valueToPython(v, indent + 1));
    if (items.join('').length < 60) {
      return '[' + items.join(', ') + ']';
    }
    const innerSpaces = '    '.repeat(indent + 1);
    return '[\n' + items.map(i => innerSpaces + i).join(',\n') + ',\n' + spaces + ']';
  }

  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) return '{}';
    const entries = keys.map(k => {
      const pyKey = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(k) ? k : `'${k}'`;
      return `${pyKey}: ${valueToPython(value[k], indent + 1)}`;
    });
    if (entries.join('').length < 60) {
      return '{' + entries.join(', ') + '}';
    }
    const innerSpaces = '    '.repeat(indent + 1);
    return '{\n' + entries.map(e => innerSpaces + e).join(',\n') + ',\n' + spaces + '}';
  }

  return String(value);
}

function showError(msg) {
  const panel = document.getElementById('errorPanel');
  if (panel) {
    panel.style.display = 'block';
    panel.innerHTML = `<div class="jt-error">${msg}</div>`;
  }
}
