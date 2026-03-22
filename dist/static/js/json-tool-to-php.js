'use strict';
// to-php
function processJson() {
  clearErrorPanel();
  const parsed = parseInput(); if (parsed === null) return;
  const rootName = getClassName();
  function phpType(v) {
    if (v === null)             return '';
    if (typeof v === 'boolean') return 'bool ';
    if (typeof v === 'number')  return Number.isInteger(v) ? 'int ' : 'float ';
    return 'string ';
  }
  function gen(obj, name) {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return '';
    const props = Object.entries(obj).map(([k, v]) => `    public ${phpType(v)}$${k};`).join('\n');
    return `class ${name}\n{\n${props}\n\n    public static function fromArray(array $data): self\n    {\n        $obj = new self();\n        foreach ($data as $key => $value) { $obj->$key = $value; }\n        return $obj;\n    }\n}`;
  }
  const src = Array.isArray(parsed) ? parsed[0] : parsed;
  setOutput(`<?php\n\n${gen(src, rootName)}\n`, 'php');
  const el = document.getElementById('outputStats');
  if (el) el.innerHTML = '<span class="jt-success-badge">✅ PHP 类生成完成</span>';
}
