'use strict';
// from-excel (requires SheetJS)
function initToolOptions() {}

// Override uploadFile for Excel binary reading
function handleExcelUpload(input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const data = new Uint8Array(e.target.result);
    const wb = XLSX.read(data, { type: 'array' });

    // Show sheet selector if multiple sheets
    if (wb.SheetNames.length > 1) {
      showSheetSelector(wb);
    } else {
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(ws, { defval: null });
      setOutput(JSON.stringify(json, null, 2));
      showToast(i18n('json.convert.excel_rows') || `读取 ${json.length} 行数据`, 'success');
    }
  };
  reader.readAsArrayBuffer(file);
  input.value = '';
}

function showSheetSelector(wb) {
  const panel = document.getElementById('schemaResultPanel');
  if (!panel) return;
  panel.style.display = 'block';
  const body = document.getElementById('schemaResultBody');
  if (!body) return;

  let html = '<div style="margin-bottom:12px"><strong>' + (i18n('json.convert.select_sheet') || '选择工作表') + '</strong></div>';
  html += '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px">';
  wb.SheetNames.forEach((name, i) => {
    html += `<button class="jt-btn jt-btn--ghost" onclick="loadExcelSheet(${i})" id="sheetBtn${i}">${escapeHtml(name)}</button>`;
  });
  html += '</div>';
  html += `<label style="display:flex;align-items:center;gap:6px;font-size:0.8125rem;color:var(--jt-muted);cursor:pointer;margin-bottom:12px">
    <input type="checkbox" id="optAllSheets"> ${i18n('json.convert.all_sheets') || '导出所有工作表（合并为对象）'}
  </label>`;
  body.innerHTML = html;

  // Store workbook for later use
  window._excelWorkbook = wb;
}

function loadExcelSheet(index) {
  const wb = window._excelWorkbook;
  if (!wb) return;

  const useAll = document.getElementById('optAllSheets')?.checked;
  let output;

  if (useAll) {
    const result = {};
    wb.SheetNames.forEach(name => {
      const ws = wb.Sheets[name];
      result[name] = XLSX.utils.sheet_to_json(ws, { defval: null });
    });
    output = JSON.stringify(result, null, 2);
  } else {
    const ws = wb.Sheets[wb.SheetNames[index]];
    const json = XLSX.utils.sheet_to_json(ws, { defval: null });
    output = JSON.stringify(json, null, 2);
  }

  setOutput(output);
  // Highlight active sheet button
  wb.SheetNames.forEach((_, i) => {
    const btn = document.getElementById('sheetBtn' + i);
    if (btn) btn.classList.toggle('jt-btn--primary', i === index);
  });
  showToast(i18n('json.convert.excel_rows') || `读取工作表: ${wb.SheetNames[index]}`, 'success');
}

function processJson() { showToast(i18n('json.convert.upload_excel') || '请上传 Excel 文件', 'info'); }
