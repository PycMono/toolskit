'use strict';
// jsonc — strip comments and trailing commas (string-aware)
function initToolOptions() {}

function processJson() {
  clearErrorPanel();
  const raw = getInput().trim();
  if (!raw) return;
  try {
    const stripped = stripJsonComments(raw);
    const parsed = JSON.parse(stripped);
    setOutput(JSON.stringify(parsed, null, 2));
    const el = document.getElementById('outputStats');
    if (el) el.innerHTML = '<span class="jt-success-badge">✅ 注释移除成功</span>';
  } catch(e) {
    showErrorPanel(e, stripJsonComments(getInput().trim()));
  }
}

function stripJsonComments(str) {
  let res = '';
  let inStr = false;
  let esc = false;
  let i = 0;
  const len = str.length;

  while (i < len) {
    const ch = str[i];
    const ch2 = str[i + 1] || '';

    // Handle escape sequences inside strings
    if (esc) {
      res += ch;
      esc = false;
      i++;
      continue;
    }
    if (ch === '\\' && inStr) {
      res += ch;
      esc = true;
      i++;
      continue;
    }

    // Handle string boundaries
    if (ch === '"' && !inStr) {
      inStr = true;
      res += ch;
      i++;
      continue;
    }
    if (ch === '"' && inStr) {
      inStr = false;
      res += ch;
      i++;
      continue;
    }

    // Inside string - pass through unchanged
    if (inStr) {
      res += ch;
      i++;
      continue;
    }

    // Skip whitespace
    if (/\s/.test(ch)) {
      res += ch;
      i++;
      continue;
    }

    // Single-line comment
    if (ch === '/' && ch2 === '/') {
      while (i < len && str[i] !== '\n') i++;
      continue;
    }

    // Block comment
    if (ch === '/' && ch2 === '*') {
      i += 2;
      while (i < len && !(str[i] === '*' && str[i + 1] === '/')) i++;
      i += 2;
      continue;
    }

    // Trailing comma: check if comma is followed only by whitespace then } or ]
    if (ch === ',') {
      let j = i + 1;
      while (j < len && /\s/.test(str[j])) j++;
      if (j < len && (str[j] === '}' || str[j] === ']')) {
        i++;
        continue;
      }
    }

    res += ch;
    i++;
  }

  return res;
}
