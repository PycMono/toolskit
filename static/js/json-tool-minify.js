'use strict';
// minify
function initToolOptions() {}
function processJson() {
  clearErrorPanel();
  const parsed = parseInput();
  if (parsed === null) return;
  const minified = JSON.stringify(parsed);
  setOutput(minified);
  const original = new Blob([getInput()]).size;
  const compact  = new Blob([minified]).size;
  const saved    = Math.round((1 - compact / original) * 100);
  const el = document.getElementById('outputStats');
  if (el) el.innerHTML = `<span class="jt-success-badge">✅ 压缩完成</span> <span style="margin-left:6px;opacity:.7">节省 ${saved}%（${formatBytes(original)} → ${formatBytes(compact)}）</span>`;
}
