'use strict';
// base64
function initToolOptions() {
  document.getElementById('toolOptions').innerHTML =
    '<button class="jt-btn jt-btn--primary" onclick="encodeJson()">编码 Base64</button>' +
    '<button class="jt-btn jt-btn--ghost"   onclick="decodeJson()">解码 Base64</button>';
}
function processJson() { encodeJson(); }
function encodeJson() {
  clearErrorPanel();
  const raw = getInput().trim(); if (!raw) return;
  try {
    JSON.parse(raw);
    setOutput(btoa(unescape(encodeURIComponent(raw))), 'plaintext');
    if (inputEditor) inputEditor.setValue('');
    const el = document.getElementById('outputStats');
    if (el) el.innerHTML = '<span class="jt-success-badge">✅ Base64 编码完成</span>';
  } catch(e) { showErrorPanel(e, raw); }
}
function decodeJson() {
  clearErrorPanel();
  const raw = getInput().trim(); if (!raw) return;
  try {
    const decoded = decodeURIComponent(escape(atob(raw)));
    setOutput(JSON.stringify(JSON.parse(decoded), null, 2));
    if (inputEditor) inputEditor.setValue('');
    const el = document.getElementById('outputStats');
    if (el) el.innerHTML = '<span class="jt-success-badge">✅ Base64 解码完成</span>';
  } catch(e) { showErrorPanel(e, raw); }
}
