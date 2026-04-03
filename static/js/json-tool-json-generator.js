'use strict';
// json-generator — Generate random JSON test data from schema or template

function initToolOptions() {
  const el = document.getElementById('toolOptions');
  if (!el) return;
  el.innerHTML = `
    <span class="jt-options-label">生成选项</span>
    <div class="jt-options-row">
      <label class="jt-checkbox">
        <input type="checkbox" id="optArray" checked>
        <span>生成数组</span>
      </label>
      <label class="jt-checkbox">
        <input type="checkbox" id="optNull" checked>
        <span>包含 null</span>
      </label>
      <label style="margin-left:12px">
        <span style="font-size:12px;color:#666">数组长度:</span>
        <input type="number" id="optCount" value="5" min="1" max="100" style="width:60px;margin-left:4px">
      </label>
    </div>
  `;
}

function processJson() {
  clearErrorPanel();
  const input = getEditorValue ? getEditorValue() : (editor ? editor.getValue() : '');
  const generateArray = document.getElementById('optArray')?.checked ?? true;
  const includeNull = document.getElementById('optNull')?.checked ?? true;
  const count = parseInt(document.getElementById('optCount')?.value || '5', 10);

  let schema = null;
  if (input.trim()) {
    try {
      schema = JSON.parse(input);
    } catch (e) {
      showError('输入的 JSON Schema 无效，将使用默认模板生成');
      schema = null;
    }
  }

  // Default template schema
  if (!schema) {
    schema = {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        email: { type: 'string', format: 'email' },
        age: { type: 'integer', minimum: 18, maximum: 65 },
        active: { type: 'boolean' },
        role: { type: 'string', enum: ['admin', 'user', 'guest'] },
        createdAt: { type: 'string', format: 'date-time' },
        tags: { type: 'array', items: { type: 'string' } }
      }
    };
  }

  try {
    const result = generateFromSchema(schema, { generateArray, includeNull, count });
    const output = JSON.stringify(result, null, 2);
    setOutput(output, 'json');
    const statsEl = document.getElementById('outputStats');
    if (statsEl) statsEl.innerHTML = '<span class="jt-success-badge">✅ 随机 JSON 生成完成</span>';
  } catch (err) {
    showError('生成失败: ' + err.message);
  }
}

function generateFromSchema(schema, opts, depth = 0) {
  if (depth > 10) return null; // Prevent infinite recursion

  const { includeNull } = opts;

  // Handle $ref (simple local refs)
  if (schema.$ref && schema.$ref.startsWith('#/')) {
    // For simplicity, just generate a basic object
    return { _ref: schema.$ref };
  }

  // Handle examples
  if (schema.example !== undefined) {
    return schema.example;
  }

  // Handle enum
  if (schema.enum && Array.isArray(schema.enum)) {
    return schema.enum[Math.floor(Math.random() * schema.enum.length)];
  }

  // Handle const
  if (schema.const !== undefined) {
    return schema.const;
  }

  // Handle oneOf/anyOf
  if (schema.oneOf || schema.anyOf) {
    const options = schema.oneOf || schema.anyOf;
    const chosen = options[Math.floor(Math.random() * options.length)];
    return generateFromSchema(chosen, opts, depth + 1);
  }

  // Determine type
  let type = schema.type;
  if (!type) {
    if (schema.properties) type = 'object';
    else if (schema.items) type = 'array';
    else type = 'string';
  }

  // Handle null possibility
  if (includeNull && Math.random() < 0.05) {
    return null;
  }

  switch (type) {
    case 'null':
      return null;

    case 'boolean':
      return Math.random() < 0.5;

    case 'integer':
    case 'number': {
      const min = schema.minimum ?? schema.exclusiveMinimum ?? (type === 'integer' ? 0 : 0);
      const max = schema.maximum ?? schema.exclusiveMaximum ?? (type === 'integer' ? 1000 : 1000);
      let val = min + Math.random() * (max - min);
      if (type === 'integer') val = Math.floor(val);
      if (schema.multipleOf) val = Math.round(val / schema.multipleOf) * schema.multipleOf;
      return val;
    }

    case 'string': {
      const format = schema.format;
      const minLength = schema.minLength ?? 0;
      const maxLength = schema.maxLength ?? 50;

      if (format === 'email') {
        return generateEmail();
      }
      if (format === 'uri' || format === 'url') {
        return 'https://' + generateWord() + '.com/' + generateWord();
      }
      if (format === 'date') {
        return generateDate().split('T')[0];
      }
      if (format === 'date-time') {
        return generateDate();
      }
      if (format === 'uuid') {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          const r = Math.random() * 16 | 0;
          return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
      }
      if (format === 'ipv4') {
        return `${randInt(1,255)}.${randInt(0,255)}.${randInt(0,255)}.${randInt(1,254)}`;
      }
      if (format === 'hostname') {
        return generateWord() + '.example.com';
      }
      if (format === 'phone') {
        return `+1-${randInt(200,999)}-${randInt(100,999)}-${randInt(1000,9999)}`;
      }

      // Default string
      const len = randInt(Math.max(3, minLength), Math.min(maxLength, 20));
      return generateSentence(len);
    }

    case 'array': {
      const minItems = schema.minItems ?? 0;
      const maxItems = schema.maxItems ?? 10;
      const itemCount = randInt(Math.max(1, minItems), maxItems);
      const itemsSchema = schema.items || {};

      const arr = [];
      for (let i = 0; i < itemCount; i++) {
        arr.push(generateFromSchema(itemsSchema, opts, depth + 1));
      }
      return arr;
    }

    case 'object':
    default: {
      const props = schema.properties || {};
      const required = schema.required || [];
      const obj = {};

      for (const [key, propSchema] of Object.entries(props)) {
        // Skip optional properties sometimes
        if (!required.includes(key) && Math.random() < 0.2) continue;
        obj[key] = generateFromSchema(propSchema, opts, depth + 1);
      }

      // Handle additionalProperties
      if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
        const extraCount = randInt(0, 3);
        for (let i = 0; i < extraCount; i++) {
          obj[generateWord()] = generateFromSchema(schema.additionalProperties, opts, depth + 1);
        }
      }

      return obj;
    }
  }
}

// Helper functions
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateWord() {
  const words = ['user', 'data', 'item', 'product', 'order', 'message', 'file', 'task', 'project', 'report', 'config', 'setting', 'profile', 'account', 'session'];
  return words[Math.floor(Math.random() * words.length)];
}

function generateSentence(maxLen) {
  const words = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua'];
  const count = Math.min(randInt(3, 8), Math.floor(maxLen / 6));
  return Array.from({ length: count }, () => words[Math.floor(Math.random() * words.length)]).join(' ');
}

function generateEmail() {
  const names = ['john', 'jane', 'admin', 'support', 'info', 'contact', 'user', 'demo', 'test'];
  const domains = ['example.com', 'test.org', 'sample.net', 'demo.io', 'mail.com'];
  return names[Math.floor(Math.random() * names.length)] + '@' + domains[Math.floor(Math.random() * domains.length)];
}

function generateDate() {
  const now = new Date();
  const past = new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000);
  return past.toISOString();
}

function showError(msg) {
  const panel = document.getElementById('errorPanel');
  if (panel) {
    panel.style.display = 'block';
    panel.innerHTML = `<div class="jt-error">${msg}</div>`;
  }
}
