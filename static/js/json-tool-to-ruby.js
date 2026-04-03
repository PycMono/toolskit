'use strict';
// to-ruby — Generate Ruby classes from JSON

function initToolOptions() {
  document.getElementById('toolOptions').innerHTML = `
    <span class="jt-options-label">类名</span>
    <input id="className" type="text" value="Root" class="jt-options-input" style="width:140px">
    <label class="jt-checkbox" style="margin-left:12px">
      <input type="checkbox" id="optStruct" checked>
      <span>Struct</span>
    </label>
    <label class="jt-checkbox">
      <input type="checkbox" id="optTypes" checked>
      <span>类型注释 (RBS)</span>
    </label>`;
}

function processJson() {
  clearErrorPanel();
  const parsed = parseInput(); if (parsed === null) return;
  const rootName = getClassName();
  const useStruct = document.getElementById('optStruct')?.checked ?? true;
  const withTypes = document.getElementById('optTypes')?.checked ?? true;
  const classes = [];

  function rubyType(value) {
    if (value === null) return 'untyped';
    if (typeof value === 'boolean') return 'bool';
    if (typeof value === 'number') return Number.isInteger(value) ? 'Integer' : 'Float';
    if (typeof value === 'string') return 'String';
    if (Array.isArray(value)) return 'Array';
    return 'Object';
  }

  function gen(obj, name) {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return;

    const attrs = Object.entries(obj).map(([k, v]) => {
      const attrType = typeof v === 'object' && v !== null && !Array.isArray(v) ? toPascalCase(k) : rubyType(v);
      return `  attr_accessor :${toSnakeCase(k)} # ${attrType}`;
    }).join('\n');

    const fields = Object.entries(obj).map(([k, v]) => {
      return `    :${toSnakeCase(k)}`;
    }).join(',\n');

    let initBlock = '';
    if (useStruct) {
      initBlock = `\n\n  def initialize(${Object.entries(obj).map(([k]) => toSnakeCase(k) + ': nil').join(', ')})\n${Object.entries(obj).map(([k]) => `    @${toSnakeCase(k)} = ${toSnakeCase(k)}`).join('\n')}\n  end`;

      const toHBlock = `\n\n  def to_h\n    {\n${Object.entries(obj).map(([k]) => `      '${k}': @${toSnakeCase(k)}`).join(',\n')}\n    }\n  end`;

      const fromHBlock = `\n\n  def self.from_h(hash)\n    new(\n${Object.entries(obj).map(([k]) => `      ${toSnakeCase(k)}: hash['${k}']`).join(',\n')}\n    )\n  end`;

      initBlock += toHBlock + fromHBlock;
    }

    classes.push(`class ${name}\n${attrs}${initBlock}\nend`);
  }

  gen(Array.isArray(parsed) ? parsed[0] : parsed, rootName);
  setOutput(classes.reverse().join('\n\n'), 'ruby');
  const el = document.getElementById('outputStats');
  if (el) el.innerHTML = '<span class="jt-success-badge">✅ Ruby class 生成完成</span>';
}
