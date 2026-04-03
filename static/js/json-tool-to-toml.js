'use strict';
// to-toml — Convert JSON to TOML format

function initToolOptions() {}

function processJson() {
  clearErrorPanel();
  const parsed = parseInput();
  if (parsed === null) return;

  try {
    const toml = jsonToToml(parsed);
    setOutput(toml, 'toml');
    const statsEl = document.getElementById('outputStats');
    if (statsEl) statsEl.innerHTML = '<span class="jt-success-badge">✅ JSON → TOML 转换成功</span>';
  } catch (err) {
    showError('转换失败: ' + err.message);
  }
}

function jsonToToml(obj, prefix = '') {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    throw new Error('根元素必须是对象');
  }

  let result = '';
  const tables = [];

  // Process key-value pairs
  for (const [key, value] of Object.entries(obj)) {
    const tomlKey = escapeKey(key);

    if (value === null) {
      result += `${tomlKey} = "null"\n`;
    } else if (typeof value === 'boolean') {
      result += `${tomlKey} = ${value}\n`;
    } else if (typeof value === 'number') {
      result += `${tomlKey} = ${value}\n`;
    } else if (typeof value === 'string') {
      result += `${tomlKey} = ${escapeString(value)}\n`;
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        result += `${tomlKey} = []\n`;
      } else if (value.every(v => typeof v !== 'object' || v === null)) {
        // Simple array
        const items = value.map(v => formatValue(v));
        result += `${tomlKey} = [${items.join(', ')}]\n`;
      } else {
        // Array of tables
        for (const item of value) {
          tables.push({ key: tomlKey, value: item, isArray: true });
        }
      }
    } else if (typeof value === 'object') {
      tables.push({ key: tomlKey, value: value, isArray: false });
    }
  }

  // Process nested tables
  for (const table of tables) {
    const tablePath = prefix ? `${prefix}.${table.key}` : table.key;

    if (table.isArray) {
      result += `\n[[${tablePath}]]\n`;
      result += objectToTomlFields(table.value);
    } else {
      result += `\n[${tablePath}]\n`;
      result += objectToTomlFields(table.value);
    }
  }

  return result;
}

function objectToTomlFields(obj) {
  if (typeof obj !== 'object' || obj === null) return '';

  let result = '';
  const nestedTables = [];

  for (const [key, value] of Object.entries(obj)) {
    const tomlKey = escapeKey(key);

    if (value === null) {
      result += `${tomlKey} = "null"\n`;
    } else if (typeof value === 'boolean') {
      result += `${tomlKey} = ${value}\n`;
    } else if (typeof value === 'number') {
      result += `${tomlKey} = ${value}\n`;
    } else if (typeof value === 'string') {
      result += `${tomlKey} = ${escapeString(value)}\n`;
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        result += `${tomlKey} = []\n`;
      } else if (value.every(v => typeof v !== 'object' || v === null)) {
        const items = value.map(v => formatValue(v));
        result += `${tomlKey} = [${items.join(', ')}]\n`;
      } else {
        // Inline table array
        for (const item of value) {
          const inline = objectToInlineTable(item);
          result += `${tomlKey} = ${inline}\n`;
        }
      }
    } else if (typeof value === 'object') {
      nestedTables.push({ key: tomlKey, value: value });
    }
  }

  // Handle nested objects as dotted keys
  for (const table of nestedTables) {
    const nested = objectToTomlFields(table.value);
    if (nested) {
      const lines = nested.split('\n').filter(l => l);
      for (const line of lines) {
        result += `${table.key}.${line}\n`;
      }
    }
  }

  return result;
}

function objectToInlineTable(obj) {
  if (typeof obj !== 'object' || obj === null) return '{}';

  const entries = Object.entries(obj).map(([k, v]) => {
    return `${escapeKey(k)} = ${formatValue(v)}`;
  });

  return '{ ' + entries.join(', ') + ' }';
}

function formatValue(value) {
  if (value === null) return '"null"';
  if (typeof value === 'boolean') return String(value);
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return escapeString(value);
  if (Array.isArray(value)) {
    const items = value.map(v => formatValue(v));
    return '[' + items.join(', ') + ']';
  }
  if (typeof value === 'object') {
    return objectToInlineTable(value);
  }
  return String(value);
}

function escapeKey(key) {
  // If key contains special chars, quote it
  if (/^[a-zA-Z0-9_-]+$/.test(key)) {
    return key;
  }
  return '"' + key.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
}

function escapeString(str) {
  const escaped = str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
  return '"' + escaped + '"';
}

function showError(msg) {
  const panel = document.getElementById('errorPanel');
  if (panel) {
    panel.style.display = 'block';
    panel.innerHTML = `<div class="jt-error">${msg}</div>`;
  }
}
