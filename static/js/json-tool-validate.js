'use strict';
// validate
function initToolOptions() {
  const inputOpts = document.getElementById('inputOptions');
  if (inputOpts) {
    inputOpts.innerHTML = `
      <span class="jt-options-label">缩进</span>
      <select id="indentSize" class="jt-options-select jt-options-select--sm">
        <option value="2" selected>2 空格</option>
        <option value="4">4 空格</option>
        <option value="tab">Tab</option>
      </select>
    `;
  }
}
function processJson() {
  const raw = getInput().trim();
  if (!raw) return;
  clearErrorPanel();
  try {
    const parsed = JSON.parse(raw);
    const v = document.getElementById('indentSize')?.value || '2';
    setOutput(JSON.stringify(parsed, null, v === 'tab' ? '\t' : parseInt(v)));
    const el = document.getElementById('outputStats');
    if (el) el.innerHTML = '<span class="jt-success-badge">✅ JSON 合法</span>';
  } catch(e) {
    showErrorPanel(e, raw);
    setOutput('');
  }
}

