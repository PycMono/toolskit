'use strict';
// from-yaml (requires js-yaml)
function initToolOptions() {}

function _resolveYaml() {
  // js-yaml 4.x CDN bundle exposes window.jsyaml
  return window.jsyaml || window.YAML || window['js-yaml'] || null;
}

function processJson() {
  clearErrorPanel();
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
    const el = document.getElementById('outputStats');
    if (el) el.innerHTML = '<span class="jt-success-badge">✅ YAML → JSON 转换成功</span>';
  } catch(e) {
    showErrorPanel(e, raw);
    setOutput('', 'plaintext');
  }
}
