'use strict';
// to-swift
function processJson() {
  clearErrorPanel();
  const parsed = parseInput(); if (parsed === null) return;
  const rootName = getClassName(); const structs = [];
  function swType(v) {
    if (v === null)             return 'String?';
    if (typeof v === 'boolean') return 'Bool';
    if (typeof v === 'number')  return Number.isInteger(v) ? 'Int' : 'Double';
    return 'String';
  }
  function gen(obj, name) {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return;
    const fields = Object.entries(obj).map(([k, v]) => {
      const prop = toCamelCase(k);
      if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'object') { gen(v[0], toPascalCase(k)); return `    let ${prop}: [${toPascalCase(k)}]`; }
      if (typeof v === 'object' && v !== null) { gen(v, toPascalCase(k)); return `    let ${prop}: ${toPascalCase(k)}`; }
      return `    let ${prop}: ${swType(v)}`;
    }).join('\n');
    const needsCK = Object.keys(obj).some(k => k !== toCamelCase(k));
    const ck = needsCK
      ? '\n\n    enum CodingKeys: String, CodingKey {\n' +
        Object.keys(obj).filter(k => k !== toCamelCase(k)).map(k => `        case ${toCamelCase(k)} = "${k}"`).join('\n') +
        '\n    }' : '';
    structs.push(`struct ${name}: Codable {\n${fields}${ck}\n}`);
  }
  gen(Array.isArray(parsed) ? parsed[0] : parsed, rootName);
  setOutput(structs.reverse().join('\n\n'), 'swift');
  const el = document.getElementById('outputStats');
  if (el) el.innerHTML = '<span class="jt-success-badge">✅ Swift struct 生成完成</span>';
}
