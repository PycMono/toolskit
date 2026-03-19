'use strict';
// schema-generate
function initToolOptions() {}
function processJson() {
  const parsed = parseInput(); if (parsed === null) return;
  setOutput(JSON.stringify(generateSchema(parsed, 'Root'), null, 2));
  showToast('Schema 生成完成','success');
}
function generateSchema(value, title) {
  if (value === null) return { type:['null','string'] };
  if (Array.isArray(value)) return { type:'array', items: value.length > 0 ? generateSchema(value[0]) : {} };
  if (typeof value === 'object') {
    const properties = {}, required = [];
    for (const [k, v] of Object.entries(value)) {
      properties[k] = generateSchema(v);
      if (v !== null && v !== undefined) required.push(k);
    }
    const s = { type:'object', properties };
    if (required.length > 0) s.required = required;
    if (title) s.title = title;
    return s;
  }
  if (typeof value === 'boolean') return { type:'boolean' };
  if (typeof value === 'number')  return Number.isInteger(value) ? { type:'integer' } : { type:'number' };
  if (typeof value === 'string') {
    const s = { type:'string' };
    if (/^\d{4}-\d{2}-\d{2}/.test(value))        s.format = 'date-time';
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) s.format = 'email';
    if (/^https?:\/\//.test(value))                s.format = 'uri';
    return s;
  }
  return {};
}

