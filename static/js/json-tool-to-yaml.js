'use strict';
// to-yaml (requires js-yaml)
function initToolOptions() {}
function processJson() {
  const parsed = parseInput(); if (parsed === null) return;
  const yaml = window.jsyaml || window.YAML || window['js-yaml'];
  if (!yaml) { showToast('js-yaml 库未加载，请刷新页面重试', 'error'); return; }
  try {
    const yamlStr = yaml.dump(parsed, { indent: 2, lineWidth: 120 });
    setOutput(yamlStr, 'yaml');
    showToast('转换成功', 'success');
  } catch(e) { showToast('YAML 转换失败：' + e.message, 'error'); }
}
