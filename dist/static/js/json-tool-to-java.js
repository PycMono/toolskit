'use strict';
// to-java
function processJson() {
  clearErrorPanel();
  const parsed = parseInput(); if (parsed === null) return;
  const rootName = getClassName(); const classes = [];
  function javaType(v) {
    if (v === null) return 'Object';
    if (typeof v === 'boolean') return 'boolean';
    if (typeof v === 'number')  return Number.isInteger(v) ? 'int' : 'double';
    if (typeof v === 'string')  return 'String';
    if (Array.isArray(v))       return v.length > 0 && typeof v[0] === 'object' ? `List<${toPascalCase('item')}>` : 'List<Object>';
    return 'Object';
  }
  function gen(obj, name) {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return;
    const fields = Object.entries(obj).map(([k, v]) => {
      const type = Array.isArray(v) && v.length > 0 && typeof v[0] === 'object'
        ? (gen(v[0], toPascalCase(k)), `List<${toPascalCase(k)}>`)
        : typeof v === 'object' && v !== null ? (gen(v, toPascalCase(k)), toPascalCase(k))
        : javaType(v);
      return `    private ${type} ${k};\n    public ${type} get${toPascalCase(k)}() { return ${k}; }\n    public void set${toPascalCase(k)}(${type} ${k}) { this.${k} = ${k}; }`;
    }).join('\n\n');
    classes.push(`public class ${name} {\n${fields}\n}`);
  }
  gen(Array.isArray(parsed) ? parsed[0] : parsed, rootName);
  const hdr = 'import java.util.List;\nimport com.fasterxml.jackson.annotation.JsonProperty;\n\n';
  setOutput(hdr + classes.reverse().join('\n\n'), 'java');
  const el = document.getElementById('outputStats');
  if (el) el.innerHTML = '<span class="jt-success-badge">✅ Java 类生成完成</span>';
}
