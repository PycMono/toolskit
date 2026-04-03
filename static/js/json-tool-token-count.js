'use strict';
// token-count
const MODEL_PRICING = {
  'gpt-4':               { input: 0.03,  output: 0.06,   unit: '1K' },
  'gpt-4o':              { input: 0.0025, output: 0.01,  unit: '1K' },
  'gpt-4o-mini':         { input: 0.00015, output: 0.0006, unit: '1K' },
  'gpt-3.5-turbo':       { input: 0.0005, output: 0.0015, unit: '1K' },
  'claude-3-5-sonnet':   { input: 0.003,  output: 0.015,  unit: '1K' },
  'claude-3-opus':       { input: 0.015,  output: 0.075,  unit: '1K' },
  'claude-3-haiku':      { input: 0.00025, output: 0.00125, unit: '1K' },
  'gemini-1.5-pro':      { input: 0.00125, output: 0.005, unit: '1K' },
  'gemini-1.5-flash':    { input: 0.000075, output: 0.0003, unit: '1K' },
  'llama-3-70b':         { input: 0.001,  output: 0.001,  unit: '1K' },
  'llama-3-8b':          { input: 0.0001, output: 0.0001, unit: '1K' },
  'mistral-large':       { input: 0.004,  output: 0.012,  unit: '1K' },
  'deepseek-chat':       { input: 0.00014, output: 0.00028, unit: '1K' },
  'deepseek-reasoner':   { input: 0.00055, output: 0.00219, unit: '1K' },
};

const MODEL_GROUPS = {
  'OpenAI': ['gpt-4', 'gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
  'Anthropic': ['claude-3-5-sonnet', 'claude-3-opus', 'claude-3-haiku'],
  'Google': ['gemini-1.5-pro', 'gemini-1.5-flash'],
  'Meta': ['llama-3-70b', 'llama-3-8b'],
  'Mistral': ['mistral-large'],
  'DeepSeek': ['deepseek-chat', 'deepseek-reasoner'],
};

function initToolOptions() {
  const target = document.getElementById('inputOptions') || document.getElementById('toolOptions');
  if (!target) return;
  target.innerHTML =
    '<span class="jt-options-label">' + (i18n('json.tokens.model') || '模型') + '</span>' +
    '<select id="tokenModel" class="jt-options-select jt-options-select--sm" onchange="updateCostPreview()">' +
      Object.entries(MODEL_GROUPS).map(([group, models]) =>
        '<optgroup label="' + group + '">' +
        models.map(m => '<option value="' + m + '"' + (m === 'gpt-4o' ? ' selected' : '') + '>' + m + '</option>').join('') +
        '</optgroup>'
      ).join('') +
    '</select>' +
    '<label class="jt-checkbox" style="margin-left:8px">' +
      '<input type="checkbox" id="optShowCost" checked onchange="processJson()">' +
      '<span>' + (i18n('json.tokens.show_cost') || '显示成本估算') + '</span>' +
    '</label>';
}

async function processJson() {
  clearErrorPanel();
  const raw = getInput(); if (!raw.trim()) return;
  const model = document.getElementById('tokenModel')?.value || 'gpt-4o';
  const showCost = document.getElementById('optShowCost')?.checked ?? true;
  const el = document.getElementById('outputStats');
  if (el) el.textContent = i18n('json.tokens.counting') || '统计中...';

  try {
    const resp = await fetch('/json/api/token-count', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: raw, model })
    });
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const data = await resp.json();

    let result = {
      model: data.model,
      tokens: data.count,
      characters: data.chars,
      words: data.words,
      bytes: data.bytes,
      lines: (raw.match(/\n/g) || []).length + 1,
    };

    // Add cost estimation if enabled
    if (showCost && MODEL_PRICING[model]) {
      const pricing = MODEL_PRICING[model];
      const divisor = pricing.unit === '1K' ? 1000 : 1000000;
      const inputCost = (data.count / divisor) * pricing.input;
      result.cost = {
        input_per_1k: '$' + pricing.input.toFixed(4),
        output_per_1k: '$' + pricing.output.toFixed(4),
        estimated_input_cost: '$' + inputCost.toFixed(6),
        note: i18n('json.tokens.cost_note') || '成本基于输入 token 估算，实际费用取决于模型提供商'
      };
    }

    result.note = data.note || (i18n('json.tokens.approx_note') || '服务端近似估算');

    setOutput(JSON.stringify(result, null, 2), 'json');

    const tokenDisplay = data.count.toLocaleString() + ' tokens';
    const costDisplay = showCost && MODEL_PRICING[model] ?
      ' · ~$' + ((data.count / 1000) * MODEL_PRICING[model].input).toFixed(4) : '';
    if (el) el.innerHTML = '<span class="jt-success-badge">✅ ' + tokenDisplay + costDisplay + '</span>';
  } catch(e) {
    showErrorPanel(e, raw);
    if (el) el.textContent = '';
  }
}

function updateCostPreview() {
  // Re-run if there's input
  if (getInput().trim()) processJson();
}
