'use strict';
// to-python
function processJson() {
  clearErrorPanel();
  const parsed = parseInput(); if (parsed === null) return;
  const rootName = getClassName(); const classes = [];
  function gen(obj, name) {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return;
    const fields = Object.entries(obj).map(([k, v]) => {
      if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'object') { gen(v[0], toPascalCase(k)); return `    ${k}: List[${toPascalCase(k)}]`; }
      if (typeof v === 'object' && v !== null && !Array.isArray(v))     { gen(v, toPascalCase(k));    return `    ${k}: ${toPascalCase(k)}`; }
      return `    ${k}: ${inferType(v, 'py')}`;
    }).join('\n');
    classes.push(`@dataclass\nclass ${name}:\n${fields}`);
  }
  gen(Array.isArray(parsed) ? parsed[0] : parsed, rootName);
  const hdr = 'from dataclasses import dataclass\nfrom typing import List, Optional, Any\n\n';
  setOutput(hdr + classes.reverse().join('\n\n'), 'python');
  const el = document.getElementById('outputStats');
  if (el) el.innerHTML = '<span class="jt-success-badge">✅ Python dataclass 生成完成</span>';
}
