'use strict';
// from-xml (requires fast-xml-parser UMD build)
function initToolOptions() {}

function _resolveXMLParser() {
  // fast-xml-parser UMD bundle may expose various globals
  if (window.fxparser && window.fxparser.XMLParser)        return window.fxparser.XMLParser;
  if (window.fxp && window.fxp.XMLParser)                  return window.fxp.XMLParser;
  if (typeof window.XMLParser === 'function')              return window.XMLParser;
  if (window.FastXmlParser && window.FastXmlParser.XMLParser) return window.FastXmlParser.XMLParser;
  // Scan globals for namespace containing XMLParser
  for (const key of Object.keys(window)) {
    const v = window[key];
    if (v && typeof v === 'object' && typeof v.XMLParser === 'function') return v.XMLParser;
    if (typeof v === 'function' && key === 'XMLParser') return v;
  }
  return null;
}

function processJson() {
  clearErrorPanel();
  const raw = getInput().trim();
  if (!raw) return;
  const XMLParser = _resolveXMLParser();
  if (!XMLParser) {
    showToast('❌ XML 解析库未加载，正在重试…', 'error');
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/fast-xml-parser@4.3.5/dist/fxp.js';
    s.onload = function() {
      const P2 = _resolveXMLParser();
      if (P2) { _doConvert(raw, P2); }
      else { showToast('❌ XML 解析库加载失败，请检查网络后刷新页面', 'error'); }
    };
    s.onerror = function() { showToast('❌ XML 解析库加载失败，请检查网络后刷新页面', 'error'); };
    document.head.appendChild(s);
    return;
  }
  _doConvert(raw, XMLParser);
}

function _doConvert(raw, XMLParser) {
  try {
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
    const result = parser.parse(raw);
    setOutput(JSON.stringify(result, null, 2));
    const el = document.getElementById('outputStats');
    if (el) el.innerHTML = '<span class="jt-success-badge">✅ XML → JSON 转换成功</span>';
  } catch(e) {
    showErrorPanel(e, raw);
    setOutput('', 'plaintext');
  }
}
