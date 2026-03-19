'use strict';
// from-xml (requires fast-xml-parser UMD build)
function initToolOptions() {}
function processJson() {
  const raw = getInput().trim(); if (!raw) return;
  try {
    // fast-xml-parser UMD may expose: window.fxparser, window.fxp, or window.XMLParser directly
    let XMLParser = null;
    if (window.fxparser && window.fxparser.XMLParser)   XMLParser = window.fxparser.XMLParser;
    else if (window.fxp && window.fxp.XMLParser)         XMLParser = window.fxp.XMLParser;
    else if (window.XMLParser)                           XMLParser = window.XMLParser;
    else if (window.FastXmlParser && window.FastXmlParser.XMLParser) XMLParser = window.FastXmlParser.XMLParser;
    // unpkg UMD bundle may set the module directly as a namespace
    else {
      for (const key of Object.keys(window)) {
        if (window[key] && typeof window[key] === 'object' && typeof window[key].XMLParser === 'function') {
          XMLParser = window[key].XMLParser; break;
        }
        if (typeof window[key] === 'function' && key === 'XMLParser') {
          XMLParser = window[key]; break;
        }
      }
    }
    if (!XMLParser) { showToast('XML 解析库未加载，请刷新页面重试', 'error'); return; }
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
    const result = parser.parse(raw);
    setOutput(JSON.stringify(result, null, 2));
    showToast('解析成功', 'success');
  } catch(e) { showToast('XML 解析错误：' + e.message, 'error'); }
}
