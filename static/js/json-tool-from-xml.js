'use strict';
// from-xml (uses fast-xml-parser CDN when available, falls back to DOMParser)
function initToolOptions() {}

function processJson() {
  clearErrorPanel();
  const raw = getInput().trim();
  if (!raw) return;

  // Try CDN library first
  const XMLParser = _resolveXMLParser();
  if (XMLParser) {
    try {
      const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
      const result = parser.parse(raw);
      setOutput(JSON.stringify(result, null, 2));
      const el = document.getElementById('outputStats');
      if (el) el.innerHTML = '<span class="jt-success-badge">✅ XML → JSON 转换成功</span>';
      return;
    } catch(e) { /* fall through to built-in */ }
  }

  // Built-in fallback using DOMParser
  try {
    const result = _xmlToJson(raw);
    setOutput(JSON.stringify(result, null, 2));
    const el = document.getElementById('outputStats');
    if (el) el.innerHTML = '<span class="jt-success-badge">✅ XML → JSON 转换成功</span>';
  } catch(e) {
    showErrorPanel(e, raw);
    setOutput('', 'plaintext');
  }
}

function _resolveXMLParser() {
  if (window.fxparser && window.fxparser.XMLParser) return window.fxparser.XMLParser;
  if (window.fxp && window.fxp.XMLParser) return window.fxp.XMLParser;
  if (typeof window.XMLParser === 'function') return window.XMLParser;
  if (window.FastXmlParser && window.FastXmlParser.XMLParser) return window.FastXmlParser.XMLParser;
  return null;
}

function _xmlToJson(xmlStr) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlStr, 'text/xml');
  const error = doc.querySelector('parsererror');
  if (error) throw new Error('XML 解析错误：' + error.textContent.split('\n')[0]);
  const result = _nodeToJson(doc.documentElement);
  const wrapper = {};
  wrapper[doc.documentElement.tagName] = result;
  return wrapper;
}

function _nodeToJson(node) {
  const obj = {};

  // Attributes with @_ prefix
  if (node.attributes && node.attributes.length > 0) {
    for (const attr of node.attributes) {
      obj['@_' + attr.name] = _parseValue(attr.value);
    }
  }

  // Child nodes
  if (node.childNodes && node.childNodes.length > 0) {
    const childMap = {};
    let hasElementChildren = false;

    for (const child of node.childNodes) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        hasElementChildren = true;
        const key = child.tagName;
        const value = _nodeToJson(child);
        if (childMap[key] !== undefined) {
          if (!Array.isArray(childMap[key])) {
            childMap[key] = [childMap[key]];
          }
          childMap[key].push(value);
        } else {
          childMap[key] = value;
        }
      }
    }

    if (hasElementChildren) {
      Object.assign(obj, childMap);
    } else {
      // Text content only
      const text = node.textContent.trim();
      if (text && Object.keys(obj).length === 0) {
        return _parseValue(text);
      }
      if (text && Object.keys(obj).length > 0) {
        obj['#text'] = _parseValue(text);
      }
    }
  }

  return Object.keys(obj).length === 0 ? null : obj;
}

function _parseValue(str) {
  if (!str) return '';
  str = String(str).trim();
  if (str === 'true') return true;
  if (str === 'false') return false;
  if (str === 'null') return null;
  if (/^-?\d+(\.\d+)?$/.test(str)) {
    const num = parseFloat(str);
    if (!isNaN(num) && isFinite(num)) return num;
  }
  return str;
}