'use strict';
// to-markdown
function initToolOptions() {}
function processJson() {
  const parsed = parseInput(); if (parsed === null) return;
  if (!Array.isArray(parsed)) { showToast('输入必须为 JSON 数组', 'error'); return; }
  if (parsed.length === 0) { showToast('数组为空', 'error'); return; }
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
  showToast('转换成功', 'success');
}
