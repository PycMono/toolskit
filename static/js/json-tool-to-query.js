'use strict';
// to-query — Convert JSON object to URL query string

function initToolOptions() {
  const el = document.getElementById('toolOptions');
  if (!el) return;
  el.innerHTML = `
    <span class="jt-options-label">编码选项</span>
    <div class="jt-options-row">
      <label class="jt-checkbox">
        <input type="checkbox" id="optEncode" checked>
        <span>URL 编码值</span>
      </label>
      <label class="jt-checkbox">
        <input type="checkbox" id="optFlatten" checked>
        <span>扁平化嵌套对象</span>
      </label>
    </div>
  `;
}

function processJson() {
  clearErrorPanel();
  const parsed = parseInput();
  if (parsed === null) return;

  const encode = document.getElementById('optEncode')?.checked ?? true;
  const flatten = document.getElementById('optFlatten')?.checked ?? true;

  try {
    const queryString = jsonToQueryString(parsed, { encode, flatten, prefix: '' });
    setOutput(queryString, 'text');
    const statsEl = document.getElementById('outputStats');
    if (statsEl) {
      const paramCount = queryString.split('&').filter(p => p).length;
      statsEl.innerHTML = `<span class="jt-success-badge">✅ 生成 ${paramCount} 个查询参数</span>`;
    }
  } catch (err) {
    showError('转换失败: ' + err.message);
  }
}

function jsonToQueryString(obj, opts) {
  const { encode, flatten, prefix } = opts;
  const pairs = [];

  function process(value, key) {
    if (value === null || value === undefined) {
      pairs.push(`${key}=`);
      return;
    }

    if (Array.isArray(value)) {
      if (flatten) {
        value.forEach((item, index) => {
          process(item, `${key}[${index}]`);
        });
      } else {
        const str = JSON.stringify(value);
        pairs.push(`${key}=${encode ? encodeURIComponent(str) : str}`);
      }
      return;
    }

    if (typeof value === 'object') {
      if (flatten) {
        Object.entries(value).forEach(([subKey, subVal]) => {
          const newKey = prefix ? `${key}.${subKey}` : `${key}[${subKey}]`;
          process(subVal, newKey);
        });
      } else {
        const str = JSON.stringify(value);
        pairs.push(`${key}=${encode ? encodeURIComponent(str) : str}`);
      }
      return;
    }

    // Primitive value
    const strVal = String(value);
    pairs.push(`${key}=${encode ? encodeURIComponent(strVal) : strVal}`);
  }

  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    throw new Error('输入必须是 JSON 对象');
  }

  Object.entries(obj).forEach(([key, value]) => {
    process(value, key);
  });

  return pairs.join('&');
}

function showError(msg) {
  const panel = document.getElementById('errorPanel');
  if (panel) {
    panel.style.display = 'block';
    panel.innerHTML = `<div class="jt-error">${msg}</div>`;
  }
}
