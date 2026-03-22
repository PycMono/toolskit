'use strict';
// from-sql
function initToolOptions() {}
function processJson() {
  const raw = getInput().trim(); if (!raw) return;
  const regex = /INSERT\s+INTO\s+[`\[\]"']?\w+[`\[\]"']?\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/gi;
  const results = []; let match;
  while ((match = regex.exec(raw)) !== null) {
    const keys = match[1].split(',').map(k => k.trim().replace(/[`\[\]"']/g,''));
    const vals = parseValues(match[2]);
    const row  = {};
    keys.forEach((k, i) => { const v = vals[i]; row[k] = v==='NULL' ? null : isNaN(v) ? v : Number(v); });
    results.push(row);
  }
  if (results.length === 0) { showToast('未找到 INSERT 语句', 'error'); return; }
  setOutput(JSON.stringify(results, null, 2));
}
function parseValues(str) {
  const vals = []; let cur = '', inQ = false, qt = '';
  for (const ch of str) {
    if (!inQ && (ch==="'"||ch==='"')) { inQ = true; qt = ch; }
    else if (inQ && ch===qt)          { inQ = false; vals.push(cur); cur=''; }
    else if (!inQ && ch===',')        { vals.push(cur.trim()); cur=''; }
    else if (inQ || ch !== ' ')       { cur += ch; }
  }
  if (cur.trim()) vals.push(cur.trim());
  return vals;
}

