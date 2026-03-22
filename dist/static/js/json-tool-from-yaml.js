'use strict';
// from-yaml (requires js-yaml)
function initToolOptions() {}

function _resolveYaml() {
  // js-yaml 4.x CDN bundle exposes window.jsyaml
  return window.jsyaml || window.YAML || window['js-yaml'] || null;
}

function processJson() {
  const raw = getInput().trim();
  if (!raw) return;
  const yaml = _resolveYaml();
  if (!yaml) {
    showToast('❌ js-yaml 库未加载，正在重试…', 'error');
    // Dynamic fallback load
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.min.js';
    s.onload = function() {
      const y2 = _resolveYaml();
      if (y2) { _doConvert(raw, y2); }
      else { showToast('❌ js-yaml 加载失败，请检查网络后刷新页面', 'error'); }
    };
    s.onerror = function() { showToast('❌ js-yaml 加载失败，请检查网络后刷新页面', 'error'); };
    document.head.appendChild(s);
    return;
  }
  _doConvert(raw, yaml);
}

function _doConvert(raw, yaml) {
  try {
    const parsed = yaml.load(raw);
    setOutput(JSON.stringify(parsed, null, 2));
    showToast('✅ YAML → JSON 转换成功', 'success');
  } catch(e) {
    showToast('YAML 解析错误：' + e.message, 'error');
    setOutput('// YAML 解析错误:\n// ' + e.message, 'plaintext');
  }
}
