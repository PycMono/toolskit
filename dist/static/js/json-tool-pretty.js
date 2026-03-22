'use strict';
// pretty
function initToolOptions() {
  document.getElementById('toolOptions').innerHTML = `
    <span class="jt-options-label">缩进</span>
    <select id="indentSelect" class="jt-options-select">
      <option value="2" selected>2 空格</option>
      <option value="4">4 空格</option>
      <option value="tab">Tab</option>
    </select>
  `;
}
function processJson() {
  const parsed = parseInput();
  if (parsed === null) return;
  const v = document.getElementById('indentSelect')?.value || '2';
  setOutput(JSON.stringify(parsed, null, v === 'tab' ? '\t' : parseInt(v)));
  const el = document.getElementById('outputStats');
  if (el) el.innerHTML = '<span class="jt-success-badge">✅ 格式化完成</span>';
}

