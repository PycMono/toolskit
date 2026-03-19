'use strict';
// to-kotlin
function processJson() {
  const parsed = parseInput(); if (parsed === null) return;
  const rootName = getClassName(); const classes = [];
  function ktType(v) {
    if (v === null)             return 'Any?';
    if (typeof v === 'boolean') return 'Boolean';
    if (typeof v === 'number')  return Number.isInteger(v) ? 'Int' : 'Double';
    if (typeof v === 'string')  return 'String';
    return 'Any';
  }
  function gen(obj, name) {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return;
    const fields = Object.entries(obj).map(([k, v]) => {
      const prop = toCamelCase(k);
      const ann  = k !== prop ? `@SerialName("${k}") ` : '';
      if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'object') { gen(v[0], toPascalCase(k)); return `  ${ann}val ${prop}: List<${toPascalCase(k)}>`; }
      if (typeof v === 'object' && v !== null) { gen(v, toPascalCase(k)); return `  ${ann}val ${prop}: ${toPascalCase(k)}`; }
      return `  ${ann}val ${prop}: ${ktType(v)}`;
    }).join(',\n');
    classes.push(`@Serializable\ndata class ${name}(\n${fields}\n)`);
  }
  gen(Array.isArray(parsed) ? parsed[0] : parsed, rootName);
  const hdr = 'import kotlinx.serialization.*\nimport kotlinx.serialization.json.*\n\n';
  setOutput(hdr + classes.reverse().join('\n\n'), 'kotlin');
}

