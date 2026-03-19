'use strict';
// to-excel (requires SheetJS + FileSaver)
function initToolOptions() {
  document.getElementById('toolOptions').innerHTML = `
    <span class="jt-options-label">Sheet 名称</span>
    <input id="sheetName" type="text" value="Sheet1" class="jt-options-input" style="width:120px">`;
}
function processJson() {
  const parsed = parseInput(); if (parsed === null) return;
  if (!Array.isArray(parsed)) { showToast('输入必须为 JSON 数组','error'); return; }
  const sheetName = document.getElementById('sheetName')?.value || 'Sheet1';
  const ws  = XLSX.utils.json_to_sheet(parsed);
  const wb  = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const buf  = XLSX.write(wb, { bookType:'xlsx', type:'array' });
  const blob = new Blob([buf], { type:'application/octet-stream' });
  if (window.saveAs) { saveAs(blob, 'output.xlsx'); }
  else { const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='output.xlsx'; a.click(); }
  showToast('Excel 已下载','success');
}

