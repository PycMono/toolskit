'use strict';
// stringify
function initToolOptions() {}
function processJson() {
  clearErrorPanel();
  const parsed = parseInput(); if (parsed === null) return;
  setOutput(JSON.stringify(JSON.stringify(parsed)), 'plaintext');
  const el = document.getElementById('outputStats');
  if (el) el.innerHTML = '<span class="jt-success-badge">✅ 序列化完成</span>';
}
