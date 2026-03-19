'use strict';
// base64
function initToolOptions() {
  document.getElementById('toolOptions').innerHTML =
    '<button class="jt-btn jt-btn--primary" onclick="encodeJson()">编码 Base64</button>' +
    '<button class="jt-btn jt-btn--ghost"   onclick="decodeJson()">解码 Base64</button>';
}
function processJson() { encodeJson(); }
function encodeJson() {
  const raw = getInput().trim(); if (!raw) return;
  try {
    JSON.parse(raw);
    setOutput(btoa(unescape(encodeURIComponent(raw))), 'plaintext');
    if (inputEditor) inputEditor.setValue('');
    showToast('Base64 编码完成', 'success');
  } catch(e) { showErrorPanel(e, raw); }
}
function decodeJson() {
  const raw = getInput().trim(); if (!raw) return;
  try {
    const decoded = decodeURIComponent(escape(atob(raw)));
    setOutput(JSON.stringify(JSON.parse(decoded), null, 2));
    if (inputEditor) inputEditor.setValue('');
    showToast('Base64 解码完成', 'success');
  } catch(e) { showToast('解码失败，请确认为合法 Base64 编码的 JSON', 'error'); }
}
