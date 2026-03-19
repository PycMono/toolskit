'use strict';
// to-typescript
function processJson() {
  const parsed = parseInput(); if (parsed === null) return;
  const rootName = getClassName(); const ifaces = [];
  function gen(obj, name) {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return;
    const fields = Object.entries(obj).map(([k, v]) => {
      if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'object') { gen(v[0], toPascalCase(k)); return `  ${k}: ${toPascalCase(k)}[];`; }
      if (typeof v === 'object' && v !== null && !Array.isArray(v))     { gen(v, toPascalCase(k));    return `  ${k}: ${toPascalCase(k)};`; }
      return `  ${k}: ${inferType(v, 'ts')};`;
    }).join('\n');
    ifaces.push(`export interface ${name} {\n${fields}\n}`);
  }
  gen(Array.isArray(parsed) ? parsed[0] : parsed, rootName);
  setOutput(ifaces.reverse().join('\n\n'), 'typescript');
}

