'use strict';
// repair
function initToolOptions() {}
function processJson() {
  clearErrorPanel();
  const raw = getInput().trim(); if (!raw) return;
  try {
    const repaired = repairJson(raw);
    setOutput(repaired);
    const el = document.getElementById('outputStats');
    const changed = raw !== repaired;
    if (el) el.innerHTML = changed
      ? '<span class="jt-success-badge">✅ 修复完成</span>'
      : '<span class="jt-success-badge">✅ JSON 无需修复</span>';
  } catch(e) {
    showErrorPanel(e, raw);
  }
}
function repairJson(raw) {
  let s = raw.trim();
  s = s.replace(/^\uFEFF/, '');
  s = s.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
  s = s.replace(/([{,]\s*)'([^']+)'\s*:/g, '$1"$2":');
  s = s.replace(/:\s*'([^']*)'/g, ': "$1"');
  s = s.replace(/,(\s*[}\]])/g, '$1');
  s = s.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');
  s = s.replace(/:\s*undefined/g, ': null');
  s = s.replace(/:\s*NaN/g, ': null');
  s = s.replace(/:\s*Infinity/g, ': null');
  try { return JSON.stringify(JSON.parse(s), null, 2); } catch(e) {
    s = balanceBrackets(s);
    try { return JSON.stringify(JSON.parse(s), null, 2); } catch(e2) { return s; }
  }
}
function balanceBrackets(s) {
  const pairs = { '{': '}', '[': ']' };
  const stack = [];
  for (const ch of s) {
    if ('{['.includes(ch)) stack.push(ch);
    if ('}]'.includes(ch) && stack.length && pairs[stack[stack.length-1]] === ch) stack.pop();
  }
  while (stack.length) s += pairs[stack.pop()];
  return s;
}
