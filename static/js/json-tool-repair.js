'use strict';
// repair - robust JSON repair with string-aware processing
function initToolOptions() {}

function processJson() {
  clearErrorPanel();
  const raw = getInput().trim();
  if (!raw) return;
  try {
    const repaired = repairJson(raw);
    setOutput(repaired);
    const el = document.getElementById('outputStats');
    const changed = raw.trim() !== repaired.trim();
    if (el) el.innerHTML = changed
      ? '<span class="jt-success-badge">✅ 修复完成</span>'
      : '<span class="jt-success-badge">✅ JSON 无需修复</span>';
  } catch(e) {
    showErrorPanel(e, raw);
  }
}

function repairJson(raw) {
  let s = raw.trim();
  // Remove BOM
  s = s.replace(/^\uFEFF/, '');
  // Use string-aware processing
  s = repairStringAware(s);
  // Try to parse
  try {
    return JSON.stringify(JSON.parse(s), null, 2);
  } catch(e) {
    // Balance brackets and try again
    s = balanceBrackets(s);
    try {
      return JSON.stringify(JSON.parse(s), null, 2);
    } catch(e2) {
      // Return the best effort result
      return s;
    }
  }
}

// String-aware JSON repair - handles comments, quotes, trailing commas correctly
function repairStringAware(str) {
  let res = '';
  let inStr = false;
  let strQuote = '';
  let esc = false;
  let i = 0;
  const len = str.length;
  let lastNonWs = '';

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
    if ((ch === '"' || ch === "'") && !inStr) {
      inStr = true;
      strQuote = ch;
      // Convert single quotes to double quotes
      res += '"';
      i++;
      continue;
    }
    if (ch === strQuote && inStr) {
      inStr = false;
      strQuote = '';
      res += '"';
      i++;
      continue;
    }

    // Inside string - pass through unchanged (except quote conversion)
    if (inStr) {
      // Escape double quotes inside single-quoted strings
      if (ch === '"' && strQuote === "'") {
        res += '\\"';
        i++;
        continue;
      }
      res += ch;
      i++;
      continue;
    }

    // Skip whitespace (track for trailing comma detection)
    if (/\s/.test(ch)) {
      res += ch;
      i++;
      continue;
    }

    // Remove single-line comments
    if (ch === '/' && ch2 === '/') {
      while (i < len && str[i] !== '\n') i++;
      continue;
    }

    // Remove block comments
    if (ch === '/' && ch2 === '*') {
      i += 2;
      while (i < len && !(str[i] === '*' && str[i + 1] === '/')) i++;
      i += 2;
      continue;
    }

    // Handle trailing comma before } or ]
    if (ch === ',' && (ch2 === '}' || ch2 === ']' || /^\s*[}\]]/.test(str.slice(i + 1)))) {
      i++;
      continue;
    }

    // Quote unquoted keys (letters/numbers/underscore/dollar)
    if (/[{\[,]/.test(lastNonWs) && /[a-zA-Z_$]/.test(ch)) {
      // Check if this looks like an unquoted key
      let keyEnd = i;
      while (keyEnd < len && /[a-zA-Z0-9_$]/.test(str[keyEnd])) keyEnd++;
      const potentialKey = str.slice(i, keyEnd);
      // Skip whitespace after potential key
      let afterKey = keyEnd;
      while (afterKey < len && /\s/.test(str[afterKey])) afterKey++;
      // If followed by colon, it's an unquoted key
      if (str[afterKey] === ':') {
        res += '"' + potentialKey + '"';
        i = keyEnd;
        continue;
      }
    }

    // Replace special values
    if (ch === 'u' && str.slice(i, i + 9) === 'undefined') {
      const after = str.slice(i + 9).replace(/^\s+/, '');
      if (/^[,}\]:]/.test(after) || after === '') {
        res += 'null';
        i += 9;
        lastNonWs = 'l';
        continue;
      }
    }
    if (ch === 'N' && str.slice(i, i + 3) === 'NaN') {
      const after = str.slice(i + 3).replace(/^\s+/, '');
      if (/^[,}\]:]/.test(after) || after === '') {
        res += 'null';
        i += 3;
        lastNonWs = 'l';
        continue;
      }
    }
    if (ch === 'I' && str.slice(i, i + 8) === 'Infinity') {
      const after = str.slice(i + 8).replace(/^\s+/, '');
      if (/^[,}\]:]/.test(after) || after === '') {
        res += 'null';
        i += 8;
        lastNonWs = 'l';
        continue;
      }
    }

    // Normal character
    res += ch;
    lastNonWs = ch;
    i++;
  }

  return res;
}

function balanceBrackets(s) {
  const pairs = { '{': '}', '[': ']' };
  const stack = [];
  let inStr = false;
  let esc = false;

  for (const ch of s) {
    if (esc) { esc = false; continue; }
    if (ch === '\\' && inStr) { esc = true; continue; }
    if (ch === '"' && !inStr) { inStr = true; continue; }
    if (ch === '"' && inStr) { inStr = false; continue; }
    if (inStr) continue;
    if ('{['.includes(ch)) stack.push(ch);
    if ('}]'.includes(ch) && stack.length && pairs[stack[stack.length-1]] === ch) stack.pop();
  }

  while (stack.length) s += pairs[stack.pop()];
  return s;
}
