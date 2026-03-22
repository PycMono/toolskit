'use strict';
// jsonc — strip comments and trailing commas
function initToolOptions() {}
function processJson() {
  clearErrorPanel();
  const raw = getInput().trim(); if (!raw) return;
  try {
    const stripped = stripJsonComments(raw);
    const parsed = JSON.parse(stripped);
    setOutput(JSON.stringify(parsed, null, 2));
    const el = document.getElementById('outputStats');
    if (el) el.innerHTML = '<span class="jt-success-badge">✅ 注释移除成功</span>';
  } catch(e) { showErrorPanel(e, stripJsonComments(getInput().trim())); }
}
function stripJsonComments(str) {
  let res = '', inStr = false, esc = false, i = 0;
  while (i < str.length) {
    const ch = str[i], ch2 = str[i + 1];
    if (esc)                     { res += ch; esc = false; i++; continue; }
    if (ch === '\\' && inStr)    { res += ch; esc = true;  i++; continue; }
    if (ch === '"')              { inStr = !inStr; res += ch; i++; continue; }
    if (inStr)                   { res += ch; i++; continue; }
    // Single-line comment
    if (ch === '/' && ch2 === '/') { while (i < str.length && str[i] !== '\n') i++; continue; }
    // Block comment
    if (ch === '/' && ch2 === '*') {
      i += 2;
      while (i < str.length && !(str[i] === '*' && str[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    // Trailing comma: look ahead past whitespace for } or ]
    if (ch === ',') {
      let j = i + 1;
      while (j < str.length && /\s/.test(str[j])) j++;
      if (j < str.length && (str[j] === '}' || str[j] === ']')) { i++; continue; }
    }
    res += ch; i++;
  }
  return res;
}
