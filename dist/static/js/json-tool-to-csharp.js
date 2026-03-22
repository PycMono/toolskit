'use strict';
// to-csharp
function processJson() {
  const parsed = parseInput(); if (parsed === null) return;
  const rootName = getClassName(); const classes = [];
  function csType(v) {
    if (v === null) return 'object?';
    if (typeof v === 'boolean') return 'bool';
    if (typeof v === 'number')  return Number.isInteger(v) ? 'int' : 'double';
    if (typeof v === 'string')  return 'string';
    return 'object';
  }
  function gen(obj, name) {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return;
    const props = Object.entries(obj).map(([k, v]) => {
      const csName = toPascalCase(k);
      const ann    = k !== csName ? `    [JsonPropertyName("${k}")]\n` : '';
      const type   = Array.isArray(v) && v.length > 0 && typeof v[0] === 'object'
        ? (gen(v[0], toPascalCase(k)), `List<${toPascalCase(k)}>`)
        : typeof v === 'object' && v !== null ? (gen(v, toPascalCase(k)), toPascalCase(k))
        : csType(v);
      return `${ann}    public ${type} ${csName} { get; set; }`;
    }).join('\n\n');
    classes.push(`public class ${name}\n{\n${props}\n}`);
  }
  gen(Array.isArray(parsed) ? parsed[0] : parsed, rootName);
  const hdr = 'using System.Collections.Generic;\nusing System.Text.Json.Serialization;\n\n';
  setOutput(hdr + classes.reverse().join('\n\n'), 'csharp');
}

