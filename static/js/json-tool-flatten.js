'use strict';
// flatten
function initToolOptions() {
  document.getElementById('toolOptions').innerHTML = `
    <span class="jt-options-label">分隔符</span>
    <input id="flattenDelimiter" type="text" value="." maxlength="3" class="jt-options-input" style="width:50px">
    <div class="jt-options-radio-group">
      <label class="jt-options-radio"><input type="radio" name="flattenDir" value="flat" checked><span>扁平化</span></label>
      <label class="jt-options-radio"><input type="radio" name="flattenDir" value="unflatten"><span>还原嵌套</span></label>
    </div>`;
}
function processJson() {
  clearErrorPanel();
  const parsed = parseInput(); if (parsed === null) return;
  const delim = document.getElementById('flattenDelimiter')?.value || '.';
  const dir = document.querySelector('input[name="flattenDir"]:checked')?.value || 'flat';
  const result = dir === 'flat' ? flatten(parsed, '', delim) : unflatten(parsed, delim);
  setOutput(JSON.stringify(result, null, 2));
  const el = document.getElementById('outputStats');
  if (el) el.innerHTML = dir === 'flat'
    ? '<span class="jt-success-badge">✅ 扁平化完成</span>'
    : '<span class="jt-success-badge">✅ 还原完成</span>';
}
function flatten(obj, prefix, delim) {
  const res = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}${delim}${k}` : k;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) Object.assign(res, flatten(v, key, delim));
    else res[key] = v;
  }
  return res;
}
function unflatten(obj, delim) {
  const res = {};
  for (const [k, v] of Object.entries(obj)) {
    const keys = k.split(delim);
    let curr = res;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!curr[keys[i]]) curr[keys[i]] = {};
      curr = curr[keys[i]];
    }
    curr[keys[keys.length - 1]] = v;
  }
  return res;
}
