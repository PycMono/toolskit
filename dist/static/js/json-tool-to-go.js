'use strict';
// to-go
function processJson() {
  const parsed = parseInput(); if (parsed === null) return;
  const rootName = getClassName(); const structs = [];
  function gen(obj, name) {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return;
    const fields = Object.entries(obj).map(([k, v]) => {
      const fieldName = toPascalCase(k);
      const tag = `\`json:"${k}"\``;
      if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'object') { gen(v[0], toPascalCase(k)); return `\t${fieldName} []${toPascalCase(k)} ${tag}`; }
      if (typeof v === 'object' && v !== null) { gen(v, toPascalCase(k)); return `\t${fieldName} ${toPascalCase(k)} ${tag}`; }
      return `\t${fieldName} ${inferType(v,'go')} ${tag}`;
    }).join('\n');
    structs.push(`type ${name} struct {\n${fields}\n}`);
  }
  gen(Array.isArray(parsed) ? parsed[0] : parsed, rootName);
  setOutput('package main\n\n' + structs.reverse().join('\n\n'), 'go');
}

