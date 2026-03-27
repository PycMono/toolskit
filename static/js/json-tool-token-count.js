'use strict';
// token-count
function initToolOptions() {
  // Put options in the input header next to Example/Clear buttons
  const target = document.getElementById('inputOptions') || document.getElementById('toolOptions');
  if (!target) return;
  target.innerHTML = `
    <span class="jt-options-label">模型</span>
    <select id="tokenModel" class="jt-options-select">
      <option value="gpt-4">GPT-4</option>
      <option value="gpt-4o">GPT-4o</option>
      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
      <option value="claude-3-5">Claude 3.5</option>
      <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
    </select>`;
}
async function processJson() {
  clearErrorPanel();
  const raw   = getInput(); if (!raw.trim()) return;
  const model = document.getElementById('tokenModel')?.value || 'gpt-4';
  const el    = document.getElementById('outputStats');
  if (el) el.textContent = '统计中...';
  try {
    const resp = await fetch('/json/api/token-count', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ text:raw, model })
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    const out = JSON.stringify({
      model:      data.model,
      tokens:     data.count,
      characters: data.chars,
      words:      data.words,
      bytes:      data.bytes,
      note:       data.note || ''
    }, null, 2);
    setOutput(out, 'json');
    if (el) el.innerHTML = `<span class="jt-success-badge">✅ ${data.count.toLocaleString()} tokens</span>`;
  } catch(e) {
    showErrorPanel(e, raw);
    if (el) el.textContent = '';
  }
}
