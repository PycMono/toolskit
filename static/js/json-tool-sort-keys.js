'use strict';
// sort-keys
function initToolOptions() {
  document.getElementById('toolOptions').innerHTML = `
    <span class="jt-options-label">排序</span>
    <div class="jt-options-radio-group">
      <label class="jt-options-radio"><input type="radio" name="sortOrder" value="asc" checked><span>A → Z</span></label>
      <label class="jt-options-radio"><input type="radio" name="sortOrder" value="desc"><span>Z → A</span></label>
    </div>`;
}
function processJson() {
  clearErrorPanel();
  const parsed = parseInput(); if (parsed === null) return;
  const order = document.querySelector('input[name="sortOrder"]:checked')?.value || 'asc';
  setOutput(JSON.stringify(sortKeys(parsed, order), null, 2));
  const el = document.getElementById('outputStats');
  if (el) el.innerHTML = '<span class="jt-success-badge">✅ 排序完成</span>';
}
function sortKeys(obj, order) {
  if (Array.isArray(obj)) return obj.map(v => sortKeys(v, order));
  if (typeof obj !== 'object' || obj === null) return obj;
  const keys = Object.keys(obj).sort((a, b) => order === 'asc' ? a.localeCompare(b) : b.localeCompare(a));
  const res = {};
  for (const k of keys) res[k] = sortKeys(obj[k], order);
  return res;
}
