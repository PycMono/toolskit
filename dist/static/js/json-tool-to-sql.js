'use strict';
// to-sql
function initToolOptions() {
  document.getElementById('toolOptions').innerHTML = `
    <span class="jt-options-label">表名</span>
    <input id="sqlTableName" type="text" value="my_table" class="jt-options-input" style="width:130px">
    <span class="jt-options-label">方言</span>
    <select id="sqlDialect" class="jt-options-select">
      <option value="mysql">MySQL</option>
      <option value="postgres">PostgreSQL</option>
      <option value="mssql">SQL Server</option>
    </select>`;
}
function processJson() {
  const parsed = parseInput(); if (parsed === null) return;
  if (!Array.isArray(parsed)) { showToast('输入必须为 JSON 数组', 'error'); return; }
  const table   = document.getElementById('sqlTableName')?.value || 'my_table';
  const dialect = document.getElementById('sqlDialect')?.value   || 'mysql';
  const keys    = [...new Set(parsed.flatMap(r => Object.keys(r)))];
  const q  = dialect === 'postgres' ? '"' : dialect === 'mssql' ? '[' : '`';
  const qe = dialect === 'mssql' ? ']' : q;
  const colDefs   = keys.map(k => `  ${q}${k}${qe} TEXT`).join(',\n');
  const createSql = `CREATE TABLE ${q}${table}${qe} (\n${colDefs}\n);\n\n`;
  const inserts   = parsed.map(row => {
    const vals = keys.map(k => {
      const v = row[k];
      if (v === null || v === undefined) return 'NULL';
      if (typeof v === 'number') return String(v);
      return `'${String(v).replace(/'/g, "''")}'`;
    });
    return `INSERT INTO ${q}${table}${qe} (${keys.map(k=>`${q}${k}${qe}`).join(', ')}) VALUES (${vals.join(', ')});`;
  }).join('\n');
  setOutput(createSql + inserts, 'sql');
}

