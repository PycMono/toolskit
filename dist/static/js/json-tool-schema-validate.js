'use strict';
// schema-validate — built-in lightweight JSON Schema validator (no CDN needed)
// Supports JSON Schema draft-7 core keywords: type, required, properties,
// additionalProperties, minimum/maximum, minLength/maxLength, pattern,
// enum, const, format (email/uri/date), items, minItems/maxItems, allOf/anyOf/oneOf/not

function initToolOptions() {}

// ─── Built-in validator ───────────────────────────────────────────────────────
function _validateSchema(schema, data, path) {
  if (path === undefined) path = '';
  const errors = [];
  if (typeof schema !== 'object' || schema === null) return errors;

  // $ref — skip (not supported inline)

  // type
  if (schema.type !== undefined) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some(function(t) { return _checkType(data, t); })) {
      errors.push({ path: path || '(root)', msg: '类型应为 ' + types.join(' 或 ') + '，实际为 ' + _typeName(data) });
    }
  }

  // enum
  if (schema.enum !== undefined) {
    if (!schema.enum.some(function(v) { return JSON.stringify(v) === JSON.stringify(data); })) {
      errors.push({ path: path || '(root)', msg: '值必须是以下之一: ' + JSON.stringify(schema.enum) });
    }
  }

  // const
  if (schema.const !== undefined) {
    if (JSON.stringify(schema.const) !== JSON.stringify(data)) {
      errors.push({ path: path || '(root)', msg: '值必须为 ' + JSON.stringify(schema.const) });
    }
  }

  // string keywords
  if (typeof data === 'string') {
    if (schema.minLength !== undefined && data.length < schema.minLength)
      errors.push({ path: path || '(root)', msg: '字符串长度 ' + data.length + ' 小于 minLength(' + schema.minLength + ')' });
    if (schema.maxLength !== undefined && data.length > schema.maxLength)
      errors.push({ path: path || '(root)', msg: '字符串长度 ' + data.length + ' 超过 maxLength(' + schema.maxLength + ')' });
    if (schema.pattern !== undefined) {
      try {
        if (!new RegExp(schema.pattern).test(data))
          errors.push({ path: path || '(root)', msg: '不匹配 pattern: ' + schema.pattern });
      } catch(e) {}
    }
    if (schema.format !== undefined) {
      const fmtErr = _checkFormat(data, schema.format);
      if (fmtErr) errors.push({ path: path || '(root)', msg: fmtErr });
    }
  }

  // number/integer keywords
  if (typeof data === 'number') {
    if (schema.minimum  !== undefined && data <  schema.minimum)  errors.push({ path: path || '(root)', msg: '值 ' + data + ' 小于 minimum(' + schema.minimum + ')' });
    if (schema.maximum  !== undefined && data >  schema.maximum)  errors.push({ path: path || '(root)', msg: '值 ' + data + ' 大于 maximum(' + schema.maximum + ')' });
    if (schema.exclusiveMinimum !== undefined && typeof schema.exclusiveMinimum === 'number' && data <= schema.exclusiveMinimum)
      errors.push({ path: path || '(root)', msg: '值 ' + data + ' 应大于 exclusiveMinimum(' + schema.exclusiveMinimum + ')' });
    if (schema.exclusiveMaximum !== undefined && typeof schema.exclusiveMaximum === 'number' && data >= schema.exclusiveMaximum)
      errors.push({ path: path || '(root)', msg: '值 ' + data + ' 应小于 exclusiveMaximum(' + schema.exclusiveMaximum + ')' });
    if (schema.multipleOf !== undefined && schema.multipleOf !== 0 && data % schema.multipleOf !== 0)
      errors.push({ path: path || '(root)', msg: '值 ' + data + ' 不是 multipleOf(' + schema.multipleOf + ') 的倍数' });
    if (schema.type === 'integer' && !Number.isInteger(data))
      errors.push({ path: path || '(root)', msg: '值 ' + data + ' 不是整数' });
  }

  // object keywords
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    // required
    if (Array.isArray(schema.required)) {
      schema.required.forEach(function(key) {
        if (!(key in data))
          errors.push({ path: path || '(root)', msg: '缺少必填字段: "' + key + '"' });
      });
    }
    // properties
    if (schema.properties && typeof schema.properties === 'object') {
      Object.keys(schema.properties).forEach(function(key) {
        if (key in data) {
          const sub = _validateSchema(schema.properties[key], data[key], (path ? path + '.' : '') + key);
          sub.forEach(function(e) { errors.push(e); });
        }
      });
    }
    // additionalProperties
    if (schema.additionalProperties === false && schema.properties) {
      const allowed = new Set(Object.keys(schema.properties));
      if (Array.isArray(schema.patternProperties)) {
        // ignore for simplicity
      }
      Object.keys(data).forEach(function(key) {
        if (!allowed.has(key))
          errors.push({ path: (path ? path + '.' : '') + key, msg: '不允许的附加字段: "' + key + '"' });
      });
    }
    // minProperties / maxProperties
    const numKeys = Object.keys(data).length;
    if (schema.minProperties !== undefined && numKeys < schema.minProperties)
      errors.push({ path: path || '(root)', msg: '对象属性数 ' + numKeys + ' 少于 minProperties(' + schema.minProperties + ')' });
    if (schema.maxProperties !== undefined && numKeys > schema.maxProperties)
      errors.push({ path: path || '(root)', msg: '对象属性数 ' + numKeys + ' 超过 maxProperties(' + schema.maxProperties + ')' });
  }

  // array keywords
  if (Array.isArray(data)) {
    if (schema.minItems !== undefined && data.length < schema.minItems)
      errors.push({ path: path || '(root)', msg: '数组长度 ' + data.length + ' 少于 minItems(' + schema.minItems + ')' });
    if (schema.maxItems !== undefined && data.length > schema.maxItems)
      errors.push({ path: path || '(root)', msg: '数组长度 ' + data.length + ' 超过 maxItems(' + schema.maxItems + ')' });
    if (schema.items && typeof schema.items === 'object') {
      if (Array.isArray(schema.items)) {
        schema.items.forEach(function(itemSchema, i) {
          if (i < data.length) {
            const sub = _validateSchema(itemSchema, data[i], path + '[' + i + ']');
            sub.forEach(function(e) { errors.push(e); });
          }
        });
      } else {
        data.forEach(function(item, i) {
          const sub = _validateSchema(schema.items, item, path + '[' + i + ']');
          sub.forEach(function(e) { errors.push(e); });
        });
      }
    }
    if (schema.uniqueItems) {
      const seen = [];
      data.forEach(function(item, i) {
        const s = JSON.stringify(item);
        if (seen.includes(s))
          errors.push({ path: path + '[' + i + ']', msg: '数组元素不唯一 (uniqueItems)' });
        else seen.push(s);
      });
    }
  }

  // allOf / anyOf / oneOf / not
  if (Array.isArray(schema.allOf)) {
    schema.allOf.forEach(function(sub, i) {
      const subErrs = _validateSchema(sub, data, path);
      subErrs.forEach(function(e) { errors.push({ path: e.path, msg: '[allOf[' + i + ']] ' + e.msg }); });
    });
  }
  if (Array.isArray(schema.anyOf)) {
    const anyPassed = schema.anyOf.some(function(sub) { return _validateSchema(sub, data, path).length === 0; });
    if (!anyPassed)
      errors.push({ path: path || '(root)', msg: '不满足 anyOf 中任何一个子 Schema' });
  }
  if (Array.isArray(schema.oneOf)) {
    const passing = schema.oneOf.filter(function(sub) { return _validateSchema(sub, data, path).length === 0; });
    if (passing.length !== 1)
      errors.push({ path: path || '(root)', msg: 'oneOf 要求恰好满足 1 个子 Schema，实际满足 ' + passing.length + ' 个' });
  }
  if (schema.not !== undefined) {
    if (_validateSchema(schema.not, data, path).length === 0)
      errors.push({ path: path || '(root)', msg: '不应满足 not 中的 Schema' });
  }

  // if / then / else
  if (schema.if !== undefined) {
    const ifPassed = _validateSchema(schema.if, data, path).length === 0;
    if (ifPassed && schema.then !== undefined) {
      _validateSchema(schema.then, data, path).forEach(function(e) { errors.push(e); });
    } else if (!ifPassed && schema.else !== undefined) {
      _validateSchema(schema.else, data, path).forEach(function(e) { errors.push(e); });
    }
  }

  return errors;
}

function _checkType(value, type) {
  if (type === 'null')    return value === null;
  if (type === 'boolean') return typeof value === 'boolean';
  if (type === 'integer') return typeof value === 'number' && Number.isInteger(value);
  if (type === 'number')  return typeof value === 'number';
  if (type === 'string')  return typeof value === 'string';
  if (type === 'array')   return Array.isArray(value);
  if (type === 'object')  return typeof value === 'object' && value !== null && !Array.isArray(value);
  return true;
}

function _typeName(value) {
  if (value === null)           return 'null';
  if (Array.isArray(value))     return 'array';
  return typeof value;
}

function _checkFormat(value, format) {
  if (format === 'email') {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : 'email 格式不正确';
  }
  if (format === 'uri' || format === 'url') {
    try { new URL(value); return null; } catch(e) { return 'URI 格式不正确'; }
  }
  if (format === 'date') {
    return /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(new Date(value)) ? null : 'date 格式不正确 (应为 YYYY-MM-DD)';
  }
  if (format === 'date-time') {
    return !isNaN(new Date(value)) ? null : 'date-time 格式不正确';
  }
  if (format === 'ipv4') {
    return /^(\d{1,3}\.){3}\d{1,3}$/.test(value) ? null : 'IPv4 格式不正确';
  }
  return null; // unknown formats pass
}

// ─── UI helpers ──────────────────────────────────────────────────────────────
function _showResult(html, text) {
  const panel = document.getElementById('schemaResultPanel');
  const body  = document.getElementById('schemaResultBody');
  if (panel) panel.style.display = '';
  if (body)  body.innerHTML = html;
  // Store plain text for copy
  window._schemaResultText = text;
}

function copySchemaResult() {
  const text = window._schemaResultText || '';
  if (!text) return;
  navigator.clipboard.writeText(text).then(function() {
    showToast('已复制！', 'success');
    const btn = document.getElementById('copyBtn');
    if (btn) { const o = btn.textContent; btn.textContent = '✅'; setTimeout(function() { btn.textContent = o; }, 2000); }
  });
}

// ─── Example loaders ─────────────────────────────────────────────────────────
function loadSchemaExample() {
  const schemaSample = {
    '$schema': 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    required: ['name', 'age'],
    properties: {
      name:  { type: 'string', minLength: 1 },
      age:   { type: 'number', minimum: 0, maximum: 150 },
      email: { type: 'string', format: 'email' },
    },
    additionalProperties: false,
  };
  if (window._schemaEditor) {
    window._schemaEditor.setValue(JSON.stringify(schemaSample, null, 2));
  }
}

function loadExample() {
  loadSchemaExample();
  if (typeof inputEditor !== 'undefined' && inputEditor) {
    inputEditor.setValue(JSON.stringify({ name: 'Alice', age: 30, email: 'alice@example.com' }, null, 2));
  }
  clearErrorPanel();
}

// ─── Main entry ──────────────────────────────────────────────────────────────
function processJson() {
  clearErrorPanel();

  const schemaRaw = window._schemaEditor ? window._schemaEditor.getValue().trim() : '';
  const dataRaw   = (typeof inputEditor !== 'undefined' && inputEditor) ? inputEditor.getValue().trim() : '';

  if (!schemaRaw) { showToast('请先在左侧填写 JSON Schema', 'error'); return; }
  if (!dataRaw)   { showToast('请先在右侧填写要验证的 JSON 数据', 'error'); return; }

  let schema, data;
  try { schema = JSON.parse(schemaRaw); }
  catch(e) {
    showToast('Schema JSON 格式错误', 'error');
    // Highlight the schema editor
    if (window._schemaEditor) {
      const msg = e.message || String(e);
      const el = document.getElementById('schemaResultPanel');
      const body = document.getElementById('schemaResultBody');
      if (el) el.style.display = '';
      if (body) body.innerHTML =
        '<div class="jt-error-location" style="padding:12px 16px">❌ Schema JSON 解析失败：<strong>' +
        escapeHtml(msg) + '</strong></div>';
      window._schemaResultText = 'Schema JSON 解析失败：' + msg;
    }
    return;
  }
  try { data = JSON.parse(dataRaw); }
  catch(e) { showErrorPanel(e, dataRaw); return; }

  const errors = _validateSchema(schema, data);

  const statsEl = document.getElementById('outputStats');

  if (errors.length === 0) {
    const html = '<div style="padding:16px 20px;display:flex;align-items:center;gap:10px">' +
      '<span style="font-size:2rem">✅</span>' +
      '<div><div style="font-weight:700;font-size:1rem;color:#065f46">验证通过</div>' +
      '<div style="color:#6b7280;font-size:0.875rem;margin-top:2px">JSON 数据完全符合 Schema 规则，无任何错误。</div></div>' +
      '</div>';
    _showResult(html, '✅ 验证通过\n\nJSON 数据完全符合 Schema 规则，无任何错误。');
    if (statsEl) statsEl.innerHTML = '<span class="jt-success-badge">✅ 验证通过</span>';
  } else {
    const lines = ['❌ 验证失败，共发现 ' + errors.length + ' 个错误：', ''];
    const rows = errors.map(function(e, i) {
      lines.push((i + 1) + '. 路径: ' + e.path);
      lines.push('   ' + e.msg);
      lines.push('');
      return '<div class="jt-diff-item jt-diff-item--removed" style="padding:8px 12px;margin-bottom:4px;border-radius:6px">' +
        '<span style="font-weight:600;color:#dc2626;margin-right:8px">' + (i + 1) + '.</span>' +
        '<span class="jt-search-path" style="margin-right:8px">' + escapeHtml(e.path) + '</span>' +
        '<span style="color:#374151">' + escapeHtml(e.msg) + '</span>' +
        '</div>';
    }).join('');
    const html =
      '<div style="padding:10px 16px;font-weight:700;color:#dc2626;border-bottom:1px solid var(--jt-border)">' +
      '❌ 验证失败，共 ' + errors.length + ' 个错误</div>' +
      '<div style="padding:12px">' + rows + '</div>';
    _showResult(html, lines.join('\n'));
    if (statsEl) statsEl.innerHTML = '<span style="color:#dc2626;font-size:0.8rem;font-weight:700">❌ ' + errors.length + ' 个错误</span>';
  }
}
