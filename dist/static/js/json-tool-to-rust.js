'use strict';
// to-rust
function processJson() {
  const parsed = parseInput(); if (parsed === null) return;
  const rootName = getClassName(); const structs = [];
  function rustType(v) {
    if (v === null)             return 'Option<serde_json::Value>';
    if (typeof v === 'boolean') return 'bool';
    if (typeof v === 'number')  return Number.isInteger(v) ? 'i64' : 'f64';
    return 'String';
  }
  function gen(obj, name) {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return;
    const fields = Object.entries(obj).map(([k, v]) => {
      const snake  = toSnakeCase(k);
      const rename = snake !== k ? `    #[serde(rename = "${k}")]\n` : '';
      if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'object') { gen(v[0], toPascalCase(k)); return `${rename}    pub ${snake}: Vec<${toPascalCase(k)}>,`; }
      if (typeof v === 'object' && v !== null) { gen(v, toPascalCase(k)); return `${rename}    pub ${snake}: ${toPascalCase(k)},`; }
      return `${rename}    pub ${snake}: ${rustType(v)},`;
    }).join('\n');
    structs.push(`#[derive(Debug, Serialize, Deserialize)]\npub struct ${name} {\n${fields}\n}`);
  }
  gen(Array.isArray(parsed) ? parsed[0] : parsed, rootName);
  const hdr = 'use serde::{Deserialize, Serialize};\n\n';
  setOutput(hdr + structs.reverse().join('\n\n'), 'rust');
}

