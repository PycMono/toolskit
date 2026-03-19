'use strict';
// from-yaml (requires js-yaml)
function initToolOptions() {}
function processJson() {
  const raw = getInput().trim(); if (!raw) return;
  const yaml = window.jsyaml || window.YAML || window['js-yaml'];
  if (!yaml) { showToast('js-yaml 库未加载，请刷新页面重试', 'error'); return; }
  try {
    const parsed = yaml.load(raw);
    setOutput(JSON.stringify(parsed, null, 2));
    showToast('解析成功', 'success');
  } catch(e) { showToast('YAML 解析错误：' + e.message, 'error'); }
}
