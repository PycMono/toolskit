'use strict';
// to-dart — Generate Dart classes from JSON

function initToolOptions() {
  document.getElementById('toolOptions').innerHTML = `
    <span class="jt-options-label">类名</span>
    <input id="className" type="text" value="Root" class="jt-options-input" style="width:140px">
    <label class="jt-checkbox" style="margin-left:12px">
      <input type="checkbox" id="optNullable" checked>
      <span>nullable</span>
    </label>
    <label class="jt-checkbox">
      <input type="checkbox" id="optFromJson" checked>
      <span>fromJson</span>
    </label>`;
}

function processJson() {
  clearErrorPanel();
  const parsed = parseInput(); if (parsed === null) return;
  const rootName = getClassName();
  const nullable = document.getElementById('optNullable')?.checked ?? true;
  const fromJson = document.getElementById('optFromJson')?.checked ?? true;
  const classes = [];

  function dartType(value) {
    if (value === null) return 'dynamic';
    if (typeof value === 'boolean') return 'bool';
    if (typeof value === 'number') return Number.isInteger(value) ? 'int' : 'double';
    if (typeof value === 'string') return 'String';
    if (Array.isArray(value)) {
      if (value.length > 0) {
        const itemType = dartType(value[0]);
        return 'List<${itemType}>';
      }
      return 'List<dynamic>';
    }
    return 'dynamic';
  }

  function gen(obj, name) {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return;
    const fields = Object.entries(obj).map(([k, v]) => {
      let type;
      if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'object' && v[0] !== null) {
        gen(v[0], toPascalCase(k));
        type = 'List<${toPascalCase(k)}>';
      } else if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
        gen(v, toPascalCase(k));
        type = toPascalCase(k);
      } else {
        type = dartType(v);
      }
      const fieldKey = toSnakeCase(k);
      const q = (nullable && v === null) ? '?' : '';
      return '  ${fieldKey}${q}: ${type};';
    }).join('\n');

    const fromJsonBlock = fromJson ? `
  factory ${name}.fromJson(Map<String, dynamic> json) {
    return ${name}(
${Object.entries(obj).map(([k, v]) => {
  const fieldKey = toSnakeCase(k);
  const jsonKey = k;
  let cast = '';
  if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'object') {
    cast = `.map((e) => ${toPascalCase(k)}.fromJson(e as Map<String, dynamic>)).toList()`;
  } else if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
    cast = ` == null ? null : ${toPascalCase(k)}.fromJson(json['${jsonKey}'] as Map<String, dynamic>)`;
    return `      ${fieldKey}: json['${jsonKey}']${cast},`;
  }
  return `      ${fieldKey}: json['${jsonKey}']${cast},`;
}).join('\n')}
    );
  }` : '';

    const toJsonBlock = fromJson ? `
  Map<String, dynamic> toJson() {
    return {
${Object.entries(obj).map(([k, v]) => {
  const fieldKey = toSnakeCase(k);
  return `      '${k}': ${fieldKey},`;
}).join('\n')}
    };
  }` : '';

    classes.push(`class ${name} {\n${fields}${fromJsonBlock}${toJsonBlock}\n}`);
  }

  gen(Array.isArray(parsed) ? parsed[0] : parsed, rootName);
  setOutput(classes.reverse().join('\n\n'), 'dart');
  const el = document.getElementById('outputStats');
  if (el) el.innerHTML = '<span class="jt-success-badge">✅ Dart class 生成完成</span>';
}
