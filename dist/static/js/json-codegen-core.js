'use strict';
// json-codegen-core.js — shared type inference and naming utilities

const _typeMap = {
  null:   { ts:'null',      py:'None',   java:'Object',  cs:'object',  go:'interface{}', kt:'Any?',     sw:'String?',  rs:'Option<serde_json::Value>', php:'mixed' },
  bool:   { ts:'boolean',   py:'bool',   java:'boolean', cs:'bool',    go:'bool',        kt:'Boolean',  sw:'Bool',     rs:'bool',                      php:'bool'  },
  int:    { ts:'number',    py:'int',    java:'int',     cs:'int',     go:'int',         kt:'Int',      sw:'Int',      rs:'i64',                       php:'int'   },
  float:  { ts:'number',    py:'float',  java:'double',  cs:'double',  go:'float64',     kt:'Double',   sw:'Double',   rs:'f64',                       php:'float' },
  string: { ts:'string',    py:'str',    java:'String',  cs:'string',  go:'string',      kt:'String',   sw:'String',   rs:'String',                    php:'string'},
  any:    { ts:'any',       py:'Any',    java:'Object',  cs:'object',  go:'interface{}', kt:'Any',      sw:'AnyCodable',rs:'serde_json::Value',         php:'mixed' },
};

function inferType(value, lang) {
  if (value === null)            return _typeMap.null[lang]    || 'null';
  if (typeof value === 'boolean') return _typeMap.bool[lang]   || 'bool';
  if (typeof value === 'number')
    return (Number.isInteger(value) ? _typeMap.int[lang] : _typeMap.float[lang]) || 'number';
  if (typeof value === 'string')  return _typeMap.string[lang] || 'string';
  if (Array.isArray(value)) {
    const item = value.length > 0 ? inferType(value[0], lang) : (_typeMap.any[lang] || 'any');
    return arrayOf(lang, item);
  }
  return _typeMap.any[lang] || 'any';
}

function arrayOf(lang, itemType) {
  if (lang === 'ts')   return `${itemType}[]`;
  if (lang === 'py')   return `List[${itemType}]`;
  if (lang === 'java') return `List<${itemType}>`;
  if (lang === 'cs')   return `List<${itemType}>`;
  if (lang === 'go')   return `[]${itemType}`;
  if (lang === 'kt')   return `List<${itemType}>`;
  if (lang === 'sw')   return `[${itemType}]`;
  if (lang === 'rs')   return `Vec<${itemType}>`;
  if (lang === 'php')  return `array`;
  return `${itemType}[]`;
}

function toPascalCase(str) {
  if (!str) return 'Root';
  return str
    .replace(/[-_\s]+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, c => c.toUpperCase());
}

function toCamelCase(str) {
  const p = toPascalCase(str);
  return p.charAt(0).toLowerCase() + p.slice(1);
}

function toSnakeCase(str) {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');
}

function getClassName() {
  return toPascalCase(document.getElementById('className')?.value || 'Root');
}

function initToolOptions() {
  document.getElementById('toolOptions').innerHTML = `
    <span class="jt-options-label">类/结构体名称</span>
    <input id="className" type="text" value="Root" class="jt-options-input" style="width:140px">`;
}

