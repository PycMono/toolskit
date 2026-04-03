'use strict';
// to-cpp — Generate C++ structs from JSON

function initToolOptions() {
  document.getElementById('toolOptions').innerHTML = `
    <span class="jt-options-label">结构体名</span>
    <input id="className" type="text" value="Root" class="jt-options-input" style="width:140px">
    <label class="jt-checkbox" style="margin-left:12px">
      <input type="checkbox" id="optOptional" checked>
      <span>std::optional</span>
    </label>
    <label class="jt-checkbox">
      <input type="checkbox" id="optNlohmann" checked>
      <span>nlohmann/json</span>
    </label>`;
}

function processJson() {
  clearErrorPanel();
  const parsed = parseInput(); if (parsed === null) return;
  const rootName = getClassName();
  const useOptional = document.getElementById('optOptional')?.checked ?? true;
  const useNlohmann = document.getElementById('optNlohmann')?.checked ?? true;
  const structs = [];

  function cppType(value, key) {
    if (value === null) return useOptional ? 'std::optional<nlohmann::json>' : 'nlohmann::json';
    if (typeof value === 'boolean') return 'bool';
    if (typeof value === 'number') return Number.isInteger(value) ? 'int64_t' : 'double';
    if (typeof value === 'string') return 'std::string';
    if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
        return 'std::vector<' + toPascalCase(key) + '>';
      }
      const itemType = value.length > 0 ? cppType(value[0], key) : 'nlohmann::json';
      return 'std::vector<' + itemType + '>';
    }
    if (typeof value === 'object') return toPascalCase(key);
    return 'nlohmann::json';
  }

  function defaultForNull(v) {
    if (v === null) return ' = std::nullopt';
    return '';
  }

  function gen(obj, name) {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return;

    const fields = Object.entries(obj).map(([k, v]) => {
      const type = cppType(v, k);
      const defaultVal = (useOptional && v === null) ? ' = std::nullopt' : '';
      return `    ${type} ${k}${defaultVal};`;
    }).join('\n');

    let methods = '';
    if (useNlohmann) {
      const toJsonBody = Object.entries(obj).map(([k, v]) => {
        if (v === null) {
          return `        if (${k}.has_value()) j["${k}"] = ${k}.value();`;
        }
        return `        j["${k}"] = ${k};`;
      }).join('\n');

      const fromJsonBody = Object.entries(obj).map(([k, v]) => {
        if (v === null && useOptional) {
          return `        if (j.contains("${k}")) obj.${k} = j.at("${k}").get<std::optional<nlohmann::json>>();`;
        }
        const type = cppType(v, k);
        return `        if (j.contains("${k}")) obj.${k} = j.at("${k}").get<${type}>();`;
      }).join('\n');

      methods = `
    NLOHMANN_DEFINE_TYPE_INTRUSIVE(${name},
${Object.entries(obj).map(([k]) => `        ${k}`).join(',\n')})`;
    }

    structs.push(`struct ${name} {\n${fields}${methods}\n};`);
  }

  let header = '';
  if (useNlohmann) {
    header = '#include <nlohmann/json.hpp>\n#include <optional>\n#include <string>\n#include <vector>\n\nusing json = nlohmann::json;\n\n';
  }

  gen(Array.isArray(parsed) ? parsed[0] : parsed, rootName);
  setOutput(header + structs.reverse().join('\n\n'), 'cpp');
  const el = document.getElementById('outputStats');
  if (el) el.innerHTML = '<span class="jt-success-badge">✅ C++ struct 生成完成</span>';
}
