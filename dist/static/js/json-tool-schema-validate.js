'use strict';
// schema-validate (requires Ajv CDN)
function initToolOptions() {}

// Resolve Ajv constructor from multiple possible CDN globals
function _resolveAjv() {
  // cdnjs ajv2020.min.js bundle exposes window.Ajv (the Ajv2020 class)
  // unpkg / jsdelivr bundles may expose window.Ajv2020 or window.ajv2020
  if (typeof window.Ajv2020 === 'function') return window.Ajv2020;
  if (window.ajv2020) {
    const m = window.ajv2020;
    return (typeof m.default === 'function') ? m.default : (typeof m === 'function' ? m : null);
  }
  if (typeof window.Ajv === 'function') return window.Ajv;
  if (window.ajv) {
    const m = window.ajv;
    return (typeof m.default === 'function') ? m.default : (typeof m === 'function' ? m : null);
  }
  // Last resort: scan globals for an Ajv-like constructor
  for (const k of Object.keys(window)) {
    const v = window[k];
    if (typeof v === 'function' && /^ajv/i.test(k)) return v;
    if (v && typeof v === 'object' && typeof v.default === 'function' && /^ajv/i.test(k)) return v.default;
  }
  return null;
}

// Load example data into BOTH schema editor and data editor
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

// Load example DATA (called by "示例" button next to data input)
function loadExample() {
  loadSchemaExample();
  if (typeof inputEditor !== 'undefined' && inputEditor) {
    inputEditor.setValue(JSON.stringify({
      name: 'Alice',
      age: 30,
      email: 'alice@example.com',
    }, null, 2));
  }
  clearErrorPanel();
}

function processJson() {
  const AjvClass = _resolveAjv();
  if (!AjvClass) {
    showToast('❌ Ajv 库未加载，请刷新页面后重试', 'error');
    setOutput('⚠️ Ajv 库加载失败\n\n请检查网络连接后刷新页面重试。\n如果问题持续，可能是 CDN 被屏蔽，建议使用代理访问。', 'plaintext');
    return;
  }

  const schemaRaw = window._schemaEditor ? window._schemaEditor.getValue().trim() : '';
  const dataRaw   = (typeof inputEditor !== 'undefined' && inputEditor) ? inputEditor.getValue().trim() : '';

  if (!schemaRaw) { showToast('请先填写 JSON Schema', 'error'); return; }
  if (!dataRaw)   { showToast('请先填写要验证的 JSON 数据', 'error'); return; }

  let schema, data;
  try { schema = JSON.parse(schemaRaw); }
  catch(e) { showToast('Schema 格式错误：' + e.message, 'error'); return; }
  try { data = JSON.parse(dataRaw); }
  catch(e) { showErrorPanel(e, dataRaw); return; }

  try {
    const ajv = new AjvClass({ allErrors: true, strict: false });
    const valid = ajv.validate(schema, data);
    if (valid) {
      setOutput('✅ 验证通过\n\nJSON 数据完全符合 Schema 规则，无任何错误。', 'plaintext');
      showToast('✅ 验证通过！', 'success');
    } else {
      const lines = ['❌ 验证失败，共发现 ' + ajv.errors.length + ' 个错误：', ''];
      ajv.errors.forEach(function(e, idx) {
        const path    = e.instancePath ? e.instancePath : '(root)';
        const keyword = e.keyword || '';
        const msg     = e.message || '';
        let detail    = '';
        if (e.params) {
          if (e.params.missingProperty)   detail = '  缺少字段: ' + e.params.missingProperty;
          else if (e.params.additionalProperty) detail = '  不允许的字段: ' + e.params.additionalProperty;
          else if (e.params.limit !== undefined) detail = '  限制值: ' + e.params.limit;
          else detail = '  ' + JSON.stringify(e.params);
        }
        lines.push((idx + 1) + '. 路径: ' + path);
        lines.push('   规则: ' + keyword + ' — ' + msg);
        if (detail) lines.push(detail);
        lines.push('');
      });
      setOutput(lines.join('\n'), 'plaintext');
      showToast('验证失败，' + ajv.errors.length + ' 个错误', 'error');
    }
  } catch(e) {
    showToast('Schema 验证异常：' + e.message, 'error');
    setOutput('⚠️ 验证时发生异常：\n\n' + e.message, 'plaintext');
  }
}
