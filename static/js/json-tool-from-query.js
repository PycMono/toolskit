'use strict';
// from-query — Parse URL query string to JSON object

function initToolOptions() {
  const el = document.getElementById('toolOptions');
  if (!el) return;
  el.innerHTML = `
    <span class="jt-options-label">解析选项</span>
    <div class="jt-options-row">
      <label class="jt-checkbox">
        <input type="checkbox" id="optDecode" checked>
        <span>URL 解码值</span>
      </label>
      <label class="jt-checkbox">
        <input type="checkbox" id="optNest" checked>
        <span>还原嵌套结构</span>
      </label>
      <label class="jt-checkbox">
        <input type="checkbox" id="optParseNum" checked>
        <span>解析数字/布尔值</span>
      </label>
    </div>
  `;
}

function processJson() {
  clearErrorPanel();
  const input = getEditorValue ? getEditorValue() : (editor ? editor.getValue() : '');
  if (!input.trim()) {
    showError('请输入 URL 查询字符串');
    return;
  }

  const decode = document.getElementById('optDecode')?.checked ?? true;
  const nest = document.getElementById('optNest')?.checked ?? true;
  const parseNum = document.getElementById('optParseNum')?.checked ?? true;

  try {
    const result = queryStringToJson(input, { decode, nest, parseNum });
    const output = JSON.stringify(result, null, 2);
    setOutput(output, 'json');
    const statsEl = document.getElementById('outputStats');
    if (statsEl) {
      const keyCount = Object.keys(result).length;
      statsEl.innerHTML = `<span class="jt-success-badge">✅ 解析出 ${keyCount} 个字段</span>`;
    }
  } catch (err) {
    showError('解析失败: ' + err.message);
  }
}

function queryStringToJson(qs, opts) {
  const { decode, nest, parseNum } = opts;

  // Remove leading ? if present
  if (qs.startsWith('?')) qs = qs.slice(1);

  // Also handle full URLs
  if (qs.includes('?')) {
    qs = qs.split('?')[1];
  }
  // Remove hash
  if (qs.includes('#')) {
    qs = qs.split('#')[0];
  }

  if (!qs.trim()) return {};

  const result = {};
  const pairs = qs.split('&');

  for (const pair of pairs) {
    if (!pair) continue;

    const eqIdx = pair.indexOf('=');
    let key, value;

    if (eqIdx === -1) {
      key = pair;
      value = '';
    } else {
      key = pair.slice(0, eqIdx);
      value = pair.slice(eqIdx + 1);
    }

    if (decode) {
      try {
        key = decodeURIComponent(key.replace(/\+/g, ' '));
        value = decodeURIComponent(value.replace(/\+/g, ' '));
      } catch (e) { /* keep original */ }
    }

    // Parse value
    let parsedValue = value;
    if (parseNum && value !== '') {
      // Try boolean
      if (value.toLowerCase() === 'true') parsedValue = true;
      else if (value.toLowerCase() === 'false') parsedValue = false;
      else if (value === 'null') parsedValue = null;
      // Try number
      else if (/^-?\d+$/.test(value)) parsedValue = parseInt(value, 10);
      else if (/^-?\d+\.\d+$/.test(value)) parsedValue = parseFloat(value);
    }

    // Handle nested keys like user[name] or user.name
    if (nest && (key.includes('[') || key.includes('.'))) {
      setNestedValue(result, key, parsedValue);
    } else {
      // Handle arrays like tags[]
      if (key.endsWith('[]')) {
        const arrKey = key.slice(0, -2);
        if (!result[arrKey]) result[arrKey] = [];
        result[arrKey].push(parsedValue);
      } else if (result[key] !== undefined) {
        // Convert to array if duplicate key
        if (!Array.isArray(result[key])) result[key] = [result[key]];
        result[key].push(parsedValue);
      } else {
        result[key] = parsedValue;
      }
    }
  }

  return result;
}

function setNestedValue(obj, key, value) {
  // Convert user[name] to user.name notation
  const parts = key.replace(/\[/g, '.').replace(/\]/g, '').split('.');

  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!part) continue;

    const nextPart = parts[i + 1];
    const isNextArray = /^\d+$/.test(nextPart);

    if (current[part] === undefined) {
      current[part] = isNextArray ? [] : {};
    }
    current = current[part];
  }

  const lastPart = parts[parts.length - 1];
  if (lastPart) {
    // Handle array index
    if (/^\d+$/.test(lastPart)) {
      const idx = parseInt(lastPart, 10);
      while (current.length <= idx) current.push(undefined);
      current[idx] = value;
    } else {
      current[lastPart] = value;
    }
  }
}

function showError(msg) {
  const panel = document.getElementById('errorPanel');
  if (panel) {
    panel.style.display = 'block';
    panel.innerHTML = `<div class="jt-error">${msg}</div>`;
  }
}
