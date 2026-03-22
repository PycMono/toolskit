'use strict';
// unescape
function initToolOptions() {}
function processJson() {
  clearErrorPanel();
  const raw = getInput().trim(); if (!raw) return;
  try {
    // Handle escaped JSON string (with or without outer quotes)
    let src = raw;
    if ((src.startsWith('"') && src.endsWith('"')) || (src.startsWith("'") && src.endsWith("'"))) {
      src = src.slice(1, -1);
    }
    const unescaped = src
      .replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t')
      .replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    const parsed = JSON.parse(unescaped);
    setOutput(JSON.stringify(parsed, null, 2));
    const el = document.getElementById('outputStats');
    if (el) el.innerHTML = '<span class="jt-success-badge">✅ 反转义完成</span>';
  } catch(e) {
    showErrorPanel(e, raw);
  }
}
function beautifyOutput() {
  if (!outputEditor) return;
  const raw = outputEditor.getValue().trim();
  if (!raw) { showToast('输出内容为空', 'info'); return; }
  try {
    const pretty = JSON.stringify(JSON.parse(raw), null, 2);
    outputEditor.setValue(pretty);
    showToast('美化完成', 'success');
  } catch(e) { showToast('JSON 格式错误，无法美化', 'error'); }
}
function loadExample() {
  if (inputEditor) {
    inputEditor.setValue('"{\\\"name\\\":\\\"Alice\\\",\\\"age\\\":30,\\\"city\\\":\\\"Beijing\\\"}"');
  }
  clearErrorPanel();
}
