'use strict';
// to-markdown
function initToolOptions() {}
function processJson() {
  clearErrorPanel();
  const parsed = parseInput(); if (parsed === null) return;
  if (!Array.isArray(parsed)) {
    showErrorPanel(new TypeError('输入必须为 JSON 数组（[...]）'), getInput().trim());
    return;
  }
  if (parsed.length === 0) { showToast('数组为空', 'info'); return; }
  const keys = [...new Set(parsed.flatMap(r => (r && typeof r === 'object') ? Object.keys(r) : []))];
  if (keys.length === 0) { showToast('无法识别列名', 'error'); return; }
  const pipeRe = /\|/g;
  const newlineRe = /\n/g;
  const escape = s => String(s == null ? '' : s).replace(pipeRe, '\\|').replace(newlineRe, ' ');
  const header  = '| ' + keys.map(escape).join(' | ') + ' |';
  const divider = '| ' + keys.map(() => '---').join(' | ') + ' |';
  const rows = parsed.map(row =>
    '| ' + keys.map(k => escape(row[k])).join(' | ') + ' |'
  );
  setOutput([header, divider, ...rows].join('\n'), 'markdown');
  const el = document.getElementById('outputStats');
  if (el) el.innerHTML = `<span class="jt-success-badge">✅ 转换成功，共 ${parsed.length} 行</span>`;
}
