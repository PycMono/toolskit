'use strict';
// diff
function initToolOptions() {}
function loadLeftExample() {
  if (!leftEditor) return;
  leftEditor.setValue(JSON.stringify({ name:'Alice', age:30, city:'Beijing', hobbies:['reading','coding'] }, null, 2));
}
function loadRightExample() {
  if (!rightEditor) return;
  rightEditor.setValue(JSON.stringify({ name:'Alice', age:31, city:'Shanghai', hobbies:['reading','music'], job:'Engineer' }, null, 2));
}
function processJson() {
  const leftRaw  = leftEditor  ? leftEditor.getValue()  : '';
  const rightRaw = rightEditor ? rightEditor.getValue() : '';
  let left, right;
  try { left  = JSON.parse(leftRaw);  } catch(e) { showToast(i18n('json.diff.left_error') || '左侧 JSON 格式错误','error'); return; }
  try { right = JSON.parse(rightRaw); } catch(e) { showToast(i18n('json.diff.right_error') || '右侧 JSON 格式错误','error'); return; }
  const diffs = diffJson(left, right);
  renderDiffResult(diffs, left, right);
}

function diffJson(a, b, path) {
  if (path === undefined) path = '$';
  const res = [];
  if (JSON.stringify(a) === JSON.stringify(b)) return res;
  if (typeof a !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
    res.push({ type:'changed', path:path, before:a, after:b }); return res;
  }
  if (typeof a !== 'object' || a === null) {
    if (a !== b) res.push({ type:'changed', path:path, before:a, after:b });
    return res;
  }
  const allKeys = new Set([].concat(Object.keys(a), Object.keys(b)));
  for (const k of allKeys) {
    const cp = Array.isArray(a) ? path + '[' + k + ']' : path + '.' + k;
    if (!(k in a)) res.push({ type:'added', path:cp, after:b[k] });
    else if (!(k in b)) res.push({ type:'removed', path:cp, before:a[k] });
    else res.push.apply(res, diffJson(a[k], b[k], cp));
  }
  return res;
}

function renderDiffResult(diffs, left, right) {
  const c = document.getElementById('diffResult');
  if (!c) return;
  if (diffs.length === 0) {
    c.innerHTML = '<div class="jt-diff-same">✅ ' + (i18n('json.diff.identical') || '两个 JSON 完全相同') + '</div>';
    return;
  }
  const added   = diffs.filter(d => d.type === 'added').length;
  const removed = diffs.filter(d => d.type === 'removed').length;
  const changed = diffs.filter(d => d.type === 'changed').length;

  // Calculate similarity percentage
  const leftStr = JSON.stringify(left);
  const rightStr = JSON.stringify(right);
  const maxLen = Math.max(leftStr.length, rightStr.length);
  const similarity = maxLen > 0 ? Math.round((1 - diffs.length / (maxLen / 20)) * 100) : 100;
  const simPct = Math.max(0, Math.min(100, similarity));

  c.innerHTML =
    '<div class="jt-diff-summary">' +
      '<span class="jt-diff-badge" style="background:#f3f4f6;color:#374151">📊 ' + (i18n('json.diff.similarity') || '相似度') + ' ' + simPct + '%</span>' +
      '<span class="jt-diff-badge jt-diff-badge--added">+' + added   + ' ' + (i18n('json.diff.added') || '新增') + '</span>' +
      '<span class="jt-diff-badge jt-diff-badge--removed">-' + removed + ' ' + (i18n('json.diff.removed') || '删除') + '</span>' +
      '<span class="jt-diff-badge jt-diff-badge--changed">~' + changed + ' ' + (i18n('json.diff.changed') || '修改') + '</span>' +
    '</div>' +
    diffs.map(d => {
      return '<div class="jt-diff-item jt-diff-item--' + d.type + '">' +
        '<span class="jt-diff-path">' + escapeHtml(d.path) + '</span>' +
        '<div>' +
          (d.before !== undefined ? '<del class="jt-diff-before">' + escapeHtml(JSON.stringify(d.before)) + '</del>' : '') +
          (d.after  !== undefined ? '<ins class="jt-diff-after">'  + escapeHtml(JSON.stringify(d.after))  + '</ins>' : '') +
        '</div></div>';
    }).join('');
}
