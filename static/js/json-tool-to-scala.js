'use strict';
// to-scala — Generate Scala case classes from JSON

function initToolOptions() {
  document.getElementById('toolOptions').innerHTML = `
    <span class="jt-options-label">类名</span>
    <input id="className" type="text" value="Root" class="jt-options-input" style="width:140px">
    <label class="jt-checkbox" style="margin-left:12px">
      <input type="checkbox" id="optOption" checked>
      <span>Option[]</span>
    </label>
    <label class="jt-checkbox">
      <input type="checkbox" id="optPlayJson" checked>
      <span>Play JSON reads/writes</span>
    </label>`;
}

function processJson() {
  clearErrorPanel();
  const parsed = parseInput(); if (parsed === null) return;
  const rootName = getClassName();
  const useOption = document.getElementById('optOption')?.checked ?? true;
  const playJson = document.getElementById('optPlayJson')?.checked ?? true;
  const classes = [];

  function scalaType(value, key) {
    if (value === null) return useOption ? 'Option[Any]' : 'Any';
    if (typeof value === 'boolean') return 'Boolean';
    if (typeof value === 'number') return Number.isInteger(value) ? 'Long' : 'Double';
    if (typeof value === 'string') return 'String';
    if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
        return 'Seq[' + toPascalCase(key) + ']';
      }
      return 'Seq[' + scalaType(value[0] || 'null', key) + ']';
    }
    if (typeof value === 'object') return toPascalCase(key);
    return 'Any';
  }

  function gen(obj, name) {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return;

    const fields = Object.entries(obj).map(([k, v]) => {
      const camelKey = toCamelCase(k);
      let type = scalaType(v, k);
      if (useOption && v === null) type = 'Option[' + scalaType(v, k) + ']';
      return `  ${camelKey}: ${type}`;
    }).join(',\n');

    let companion = '';
    if (playJson) {
      const imports = [
        'import play.api.libs.json._',
        'import play.api.libs.functional.syntax._'
      ].join('\n');

      const reads = Object.entries(obj).map(([k, v]) => {
        const camelKey = toCamelCase(k);
        let readsType = scalaType(v, k);
        if (typeof v === 'boolean') readsType = 'Boolean';
        else if (typeof v === 'number' && Number.isInteger(v)) readsType = 'Long';
        else if (typeof v === 'number') readsType = 'Double';
        else if (typeof v === 'string') readsType = 'String';

        if (useOption && v === null) {
          return `      (${camelKey}: Option[${readsType}])`;
        }
        return `      (${camelKey}: ${readsType})`;
      }).join('\n');

      companion = `\n\nobject ${name} {\n  implicit val reads: Reads[${name}] = (\n${reads}\n  )(${name}.apply _)\n}`;
    }

    classes.push(`case class ${name}(\n${fields}\n)${companion}`);
  }

  let header = '';
  if (playJson) {
    header = 'import play.api.libs.json._\nimport play.api.libs.functional.syntax._\n\n';
  }

  gen(Array.isArray(parsed) ? parsed[0] : parsed, rootName);
  setOutput(header + classes.reverse().join('\n\n'), 'scala');
  const el = document.getElementById('outputStats');
  if (el) el.innerHTML = '<span class="jt-success-badge">✅ Scala case class 生成完成</span>';
}
