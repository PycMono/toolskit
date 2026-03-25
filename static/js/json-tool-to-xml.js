'use strict';
// to-xml
function initToolOptions() {
  document.getElementById('toolOptions').innerHTML = `
    <span class="jt-options-label">根节点名称</span>
    <input id="xmlRoot" type="text" value="root" class="jt-options-input" style="width:120px">`;
}
function processJson() {
  clearErrorPanel();
  const parsed = parseInput(); if (parsed === null) return;
  const rootName = document.getElementById('xmlRoot')?.value || 'root';
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n${jsonToXml(parsed, rootName)}`;
  setOutput(xml, 'xml');
  const el = document.getElementById('outputStats');
  if (el) el.innerHTML = '<span class="jt-success-badge">✅ JSON → XML 转换成功</span>';
}
function jsonToXml(obj, name) {
  if (Array.isArray(obj)) return obj.map(item => jsonToXml(item, name.replace(/s$/,''))).join('\n');
  if (typeof obj !== 'object' || obj === null) return `<${name}>${escapeXml(String(obj))}</${name}>`;
  const inner = Object.entries(obj).map(([k,v]) => jsonToXml(v,k)).join('\n  ');
  return `<${name}>\n  ${inner}\n</${name}>`;
}
function escapeXml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
}
