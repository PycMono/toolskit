'use strict';
// from-toml — Parse TOML to JSON

function initToolOptions() {}

function processJson() {
  clearErrorPanel();
  const input = getEditorValue ? getEditorValue() : (editor ? editor.getValue() : '');
  if (!input.trim()) {
    showError('请输入 TOML 内容');
    return;
  }

  try {
    const result = parseToml(input);
    const output = JSON.stringify(result, null, 2);
    setOutput(output, 'json');
    const statsEl = document.getElementById('outputStats');
    if (statsEl) {
      const keyCount = Object.keys(result).length;
      statsEl.innerHTML = `<span class="jt-success-badge">✅ TOML → JSON 解析成功，${keyCount} 个顶层字段</span>`;
    }
  } catch (err) {
    showError('解析失败: ' + err.message);
  }
}

function parseToml(str) {
  const result = {};
  const lines = str.split('\n');
  let currentTable = result;
  let currentPath = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    // Skip empty lines and comments
    if (!line || line.startsWith('#')) continue;

    // Table header [section] or [[array.of.tables]]
    if (line.startsWith('[[')) {
      const match = line.match(/^\[\[([^\]]+)\]\]$/);
      if (!match) throw new Error(`第 ${i + 1} 行: 无效的数组表头`);
      const path = match[1].trim().split('.');
      currentPath = path;

      // Navigate/create nested structure
      const parent = navigateToParent(result, path.slice(0, -1));
      const lastKey = path[path.length - 1];

      if (!parent[lastKey]) parent[lastKey] = [];
      if (!Array.isArray(parent[lastKey])) {
        throw new Error(`第 ${i + 1} 行: ${lastKey} 不是数组`);
      }

      const newTable = {};
      parent[lastKey].push(newTable);
      currentTable = newTable;
      continue;
    }

    if (line.startsWith('[')) {
      const match = line.match(/^\[([^\]]+)\]$/);
      if (!match) throw new Error(`第 ${i + 1} 行: 无效的表头`);
      const path = match[1].trim().split('.');
      currentPath = path;
      currentTable = navigateToTable(result, path);
      continue;
    }

    // Key-value pair
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) {
      throw new Error(`第 ${i + 1} 行: 缺少等号`);
    }

    let key = line.slice(0, eqIdx).trim();
    let value = line.slice(eqIdx + 1).trim();

    // Parse key (handle dotted keys and quoted keys)
    const keys = parseKey(key);

    // Parse value
    const parsedValue = parseValue(value, lines, i);

    // Set value at nested path
    setNestedValue(currentTable, keys, parsedValue);
  }

  return result;
}

function parseKey(key) {
  const keys = [];
  let i = 0;

  while (i < key.length) {
    if (key[i] === '"' || key[i] === "'") {
      // Quoted key
      const quote = key[i];
      let end = i + 1;
      while (end < key.length && key[end] !== quote) {
        if (key[end] === '\\') end++;
        end++;
      }
      keys.push(key.slice(i + 1, end).replace(/\\(.)/g, '$1'));
      i = end + 1;
    } else {
      // Bare key
      let end = i;
      while (end < key.length && /[a-zA-Z0-9_-]/.test(key[end])) end++;
      keys.push(key.slice(i, end));
      i = end;
    }

    // Skip dot separator
    if (i < key.length && key[i] === '.') i++;
  }

  return keys;
}

function parseValue(value, lines, lineNum) {
  value = value.trim();

  // Remove trailing comment
  const commentIdx = value.indexOf('#');
  if (commentIdx > 0) {
    // Make sure it's not inside a string
    let inString = false;
    for (let i = 0; i < commentIdx; i++) {
      if (value[i] === '"' && (i === 0 || value[i - 1] !== '\\')) {
        inString = !inString;
      }
    }
    if (!inString) value = value.slice(0, commentIdx).trim();
  }

  // Boolean
  if (value === 'true') return true;
  if (value === 'false') return false;

  // Null (not standard TOML but useful)
  if (value === 'null' || value === 'nil') return null;

  // Number
  if (/^-?\d+$/.test(value)) return parseInt(value, 10);
  if (/^-?\d+\.\d+$/.test(value)) return parseFloat(value);
  if (/^0x[0-9a-fA-F]+$/.test(value)) return parseInt(value, 16);
  if (/^0o[0-7]+$/.test(value)) return parseInt(value, 8);
  if (/^0b[01]+$/.test(value)) return parseInt(value, 2);
  if (/^-?\d+(?:\.\d+)?(?:e[+-]?\d+)?$/i.test(value)) return parseFloat(value);

  // String
  if (value.startsWith('"""') || value.startsWith("'''")) {
    // Multiline string
    const quote = value.slice(0, 3);
    if (value.endsWith(quote) && value.length > 6) {
      return value.slice(3, -3);
    }
    // Would need multi-line handling for proper support
    throw new Error(`第 ${lineNum + 1} 行: 多行字符串未完全实现`);
  }

  if (value.startsWith('"')) {
    // Basic string
    const match = value.match(/^"((?:[^"\\]|\\.)*)"/);
    if (match) {
      return match[1]
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
    }
  }

  if (value.startsWith("'")) {
    // Literal string
    const match = value.match(/^'([^']*)'/);
    if (match) return match[1];
  }

  // Array
  if (value.startsWith('[')) {
    return parseArray(value);
  }

  // Inline table
  if (value.startsWith('{')) {
    return parseInlineTable(value);
  }

  // Bare key or unquoted value (not valid TOML but be lenient)
  return value;
}

function parseArray(str) {
  const result = [];
  let depth = 0;
  let current = '';
  let inString = false;
  let stringChar = '';

  for (let i = 1; i < str.length - 1; i++) {
    const char = str[i];

    if (inString) {
      current += char;
      if (char === stringChar && str[i - 1] !== '\\') {
        inString = false;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      inString = true;
      stringChar = char;
      current += char;
      continue;
    }

    if (char === '[' || char === '{') depth++;
    if (char === ']' || char === '}') depth--;

    if (char === ',' && depth === 0) {
      result.push(parseValue(current.trim(), [], 0));
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    result.push(parseValue(current.trim(), [], 0));
  }

  return result;
}

function parseInlineTable(str) {
  const result = {};
  const inner = str.slice(1, -1).trim();

  if (!inner) return result;

  let depth = 0;
  let current = '';
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < inner.length; i++) {
    const char = inner[i];

    if (inString) {
      current += char;
      if (char === stringChar && inner[i - 1] !== '\\') {
        inString = false;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      inString = true;
      stringChar = char;
      current += char;
      continue;
    }

    if (char === '[' || char === '{') depth++;
    if (char === ']' || char === '}') depth--;

    if (char === ',' && depth === 0) {
      parseInlineEntry(result, current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    parseInlineEntry(result, current.trim());
  }

  return result;
}

function parseInlineEntry(result, entry) {
  const eqIdx = entry.indexOf('=');
  if (eqIdx === -1) return;

  const key = entry.slice(0, eqIdx).trim();
  const value = entry.slice(eqIdx + 1).trim();
  const keys = parseKey(key);
  setNestedValue(result, keys, parseValue(value, [], 0));
}

function navigateToTable(obj, path) {
  let current = obj;
  for (const key of path) {
    if (current[key] === undefined) {
      current[key] = {};
    }
    current = current[key];
  }
  return current;
}

function navigateToParent(obj, path) {
  if (path.length === 0) return obj;
  let current = obj;
  for (const key of path) {
    if (current[key] === undefined) {
      current[key] = {};
    }
    current = current[key];
  }
  return current;
}

function setNestedValue(obj, keys, value) {
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (current[key] === undefined) {
      current[key] = {};
    }
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
}

function showError(msg) {
  const panel = document.getElementById('errorPanel');
  if (panel) {
    panel.style.display = 'block';
    panel.innerHTML = `<div class="jt-error">${msg}</div>`;
  }
}
