'use strict';
// to-yaml (requires js-yaml)
function initToolOptions() {}

function _resolveYaml() {
  return window.jsyaml || window.YAML || window['js-yaml'] || null;
}

function processJson() {
  const parsed = parseInput();
  if (parsed === null) return;
  const yaml = _resolveYaml();
  if (!yaml) {
    showToast('❌ js-yaml 库未加载，正在重试…', 'error');
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.min.js';
    s.onload = function() {
      const y2 = _resolveYaml();
      if (y2) { _doConvert(parsed, y2); }
      else { showToast('❌ js-yaml 加载失败，请检查网络后刷新页面', 'error'); }
    };
    s.onerror = function() { showToast('❌ js-yaml 加载失败，请检查网络后刷新页面', 'error'); };
    document.head.appendChild(s);
    return;
  }
  _doConvert(parsed, yaml);
}

function _doConvert(parsed, yaml) {
  try {
    const yamlStr = yaml.dump(parsed, { indent: 2, lineWidth: 120 });
    setOutput(yamlStr, 'yaml');
    showToast('✅ JSON → YAML 转换成功', 'success');
  } catch(e) {
    showToast('YAML 转换失败：' + e.message, 'error');
    setOutput('# YAML 转换失败:\n# ' + e.message, 'yaml');
  }
}
