'use strict';
// to-csv (requires PapaParse)
function initToolOptions() {
  document.getElementById('toolOptions').innerHTML = `
    <span class="jt-options-label">分隔符</span>
    <select id="csvDelimiter" class="jt-options-select">
      <option value="," selected>逗号 (,)</option>
      <option value=";">分号 (;)</option>
      <option value="\t">Tab</option>
    </select>`;
}
function processJson() {
  const parsed = parseInput(); if (parsed === null) return;
  if (!Array.isArray(parsed)) { showToast('输入必须为 JSON 数组','error'); return; }
  if (typeof Papa === 'undefined') { showToast('PapaParse 库未加载，请刷新页面重试', 'error'); return; }
  const delimEl = document.getElementById('csvDelimiter');
  const delimiter = delimEl ? delimEl.value : ',';
  const csv = Papa.unparse(parsed, { quotes: true, delimiter: delimiter, header: true });
  setOutput(csv, 'plaintext');
  showToast('转换成功', 'success');
}
