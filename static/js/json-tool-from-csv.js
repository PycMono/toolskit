'use strict';
// from-csv (requires PapaParse)
function initToolOptions() {
  document.getElementById('toolOptions').innerHTML = `
    <label style="display:flex;align-items:center;gap:6px;font-size:0.8125rem">
      <input id="dynamicTyping" type="checkbox" checked>
      <span>自动识别数字类型</span>
    </label>`;
}
function processJson() {
  const raw = getInput().trim(); if (!raw) return;
  if (typeof Papa === 'undefined') { showToast('PapaParse 库未加载，请刷新页面重试', 'error'); return; }
  const result = Papa.parse(raw, {
    header: true,
    dynamicTyping: document.getElementById('dynamicTyping')?.checked !== false,
    skipEmptyLines: true,
  });
  if (result.errors.length > 0) showToast('CSV 解析错误：' + result.errors[0].message, 'error');
  setOutput(JSON.stringify(result.data, null, 2));
  showToast('转换成功', 'success');
}
