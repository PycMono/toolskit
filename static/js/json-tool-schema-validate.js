'use strict';
// schema-validate (requires Ajv CDN)
function initToolOptions() {}

function loadExample() {
  if (window._schemaEditor) {
    window._schemaEditor.setValue(JSON.stringify({
      '$schema': 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      required: ['name', 'age'],
      properties: {
        name: { type: 'string', minLength: 1 },
        age:  { type: 'number', minimum: 0, maximum: 150 },
        email: { type: 'string', format: 'email' },
      },
      additionalProperties: false,
    }, null, 2));
  }
  if (typeof inputEditor !== 'undefined' && inputEditor) {
    inputEditor.setValue(JSON.stringify({ name: 'Alice', age: 30, email: 'alice@example.com' }, null, 2));
  }
}

function processJson() {
  const schemaRaw = window._schemaEditor ? window._schemaEditor.getValue().trim() : '';
  const dataRaw   = (typeof inputEditor !== 'undefined' && inputEditor) ? inputEditor.getValue().trim() : '';

  if (!schemaRaw) { showToast('请输入 JSON Schema', 'error'); return; }
  if (!dataRaw)   { showToast('请输入要验证的 JSON 数据', 'error'); return; }

  let schema, data;
  try { schema = JSON.parse(schemaRaw); } catch(e) { showToast('Schema JSON 格式错误：' + e.message, 'error'); return; }
  try { data   = JSON.parse(dataRaw);   } catch(e) { showToast('数据 JSON 格式错误：' + e.message, 'error'); return; }

  // Resolve Ajv class — try multiple globals in priority order
  let AjvClass = null;
  if (window.Ajv2020) AjvClass = window.Ajv2020;
  else if (window.ajv2020) AjvClass = window.ajv2020.default ? window.ajv2020.default : window.ajv2020;
  else if (window.Ajv) AjvClass = window.Ajv;
  else if (window.ajv) AjvClass = window.ajv.default ? window.ajv.default : window.ajv;

  if (!AjvClass) { showToast('Ajv 库未加载，请刷新页面重试', 'error'); return; }

  try {
    const ajvInstance = new AjvClass({ allErrors: true });
    const valid = ajvInstance.validate(schema, data);
    if (valid) {
      setOutput('✅ 验证通过 — JSON 数据符合 Schema 规则', 'plaintext');
      showToast('✅ JSON 验证通过', 'success');
    } else {
      const errs = ajvInstance.errors.map(function(e) {
        const path = e.instancePath ? e.instancePath : '(root)';
        const params = e.params ? ' || ' + JSON.stringify(e.params) : '';
        return '❌ ' + path + ' || ' + e.message + params;
      }).join('\n');
      setOutput(errs, 'plaintext');
      showToast('验证失败，共 ' + ajvInstance.errors.length + ' 个错误', 'error');
    }
  } catch(e) { showToast('Schema 验证异常：' + e.message, 'error'); }
}
