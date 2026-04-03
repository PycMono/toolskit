'use strict';
// json-codegen-core.js — shared type inference and naming utilities

const _typeMap = {
  null:   { ts:'null',      py:'None',   java:'Object',  cs:'object',  go:'interface{}', kt:'Any?',     sw:'String?',  rs:'Option<serde_json::Value>', php:'mixed', dart:'dynamic', objc:'id', cpp:'std::nullptr_t', ruby:'nil', scala:'Null' },
  bool:   { ts:'boolean',   py:'bool',   java:'boolean', cs:'bool',    go:'bool',        kt:'Boolean',  sw:'Bool',     rs:'bool',                      php:'bool',  dart:'bool', objc:'BOOL', cpp:'bool', ruby:'true', scala:'Boolean' },
  int:    { ts:'number',    py:'int',    java:'int',     cs:'int',     go:'int',         kt:'Int',      sw:'Int',      rs:'i64',                       php:'int',   dart:'int', objc:'NSInteger', cpp:'int64_t', ruby:'Integer', scala:'Int' },
  float:  { ts:'number',    py:'float',  java:'double',  cs:'double',  go:'float64',     kt:'Double',   sw:'Double',   rs:'f64',                       php:'float', dart:'double', objc:'double', cpp:'double', ruby:'Float', scala:'Double' },
  string: { ts:'string',    py:'str',    java:'String',  cs:'string',  go:'string',      kt:'String',   sw:'String',   rs:'String',                    php:'string', dart:'String', objc:'NSString *', cpp:'std::string', ruby:'String', scala:'String' },
  date:   { ts:'string',    py:'str',    java:'String',  cs:'string',  go:'time.Time',   kt:'String',   sw:'String',   rs:'String',                    php:'string', dart:'String', objc:'NSString *', cpp:'std::string', ruby:'String', scala:'String' },
  any:    { ts:'any',       py:'Any',    java:'Object',  cs:'object',  go:'interface{}', kt:'Any',      sw:'AnyCodable',rs:'serde_json::Value',         php:'mixed', dart:'dynamic', objc:'id', cpp:'std::any', ruby:'Object', scala:'Any' },
};

// ISO date regex
const _isoDateRe = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$/;

// Detect if a string looks like an ISO date
function isDateString(v) {
  return typeof v === 'string' && _isoDateRe.test(v);
}

// Detect enum candidates: collect string values across array items or object properties
function detectEnums(values) {
  const strings = values.filter(v => typeof v === 'string');
  if (strings.length < 2) return null;
  const unique = [...new Set(strings)];
  // If there are few unique values relative to total, treat as enum
  if (unique.length <= 10 && unique.length <= strings.length * 0.5) {
    return unique;
  }
  return null;
}

// Infer union type from array elements (all elements, not just first)
function inferArrayType(arr, lang) {
  if (!arr.length) return _typeMap.any[lang] || 'any';

  const types = new Set();
  for (const item of arr) {
    types.add(inferType(item, lang, true));
  }

  if (types.size === 1) return [...types][0];

  // Union types for certain languages
  if (lang === 'ts') return [...types].join(' | ');
  if (lang === 'rs') return [...types].join(' | ');

  return _typeMap.any[lang] || 'any';
}

function inferType(value, lang, skipArrayUnion) {
  if (value === null) return _typeMap.null[lang] || 'null';
  if (typeof value === 'boolean') return _typeMap.bool[lang] || 'bool';
  if (typeof value === 'number')
    return (Number.isInteger(value) ? _typeMap.int[lang] : _typeMap.float[lang]) || 'number';
  if (typeof value === 'string') {
    // Detect date type
    if (isDateString(value)) return _typeMap.date[lang] || 'string';
    return _typeMap.string[lang] || 'string';
  }
  if (Array.isArray(value)) {
    if (skipArrayUnion) {
      const item = value.length > 0 ? inferType(value[0], lang, true) : (_typeMap.any[lang] || 'any');
      return arrayOf(lang, item);
    }
    const itemType = inferArrayType(value, lang);
    return arrayOf(lang, itemType);
  }
  return _typeMap.any[lang] || 'any';
}

// Check if a field should be optional (appears in some objects but not all in an array)
function inferOptionalField(objects, key) {
  let present = 0;
  for (const obj of objects) {
    if (obj && typeof obj === 'object' && !Array.isArray(obj) && key in obj) present++;
  }
  return present < objects.length;
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
  if (lang === 'dart') return `List<${itemType}>`;
  if (lang === 'cpp')  return `std::vector<${itemType}>`;
  if (lang === 'ruby') return `Array<${itemType}>`;
  if (lang === 'scala') return `Seq[${itemType}]`;
  if (lang === 'objc') return `NSArray<${itemType}> *`;
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
  document.getElementById('toolOptions').innerHTML =
    '<span class="jt-options-label">' + (i18n('json.codegen.class_name') || '类/结构体名称') + '</span>' +
    '<input id="className" type="text" value="Root" class="jt-options-input" style="width:140px">';
}
