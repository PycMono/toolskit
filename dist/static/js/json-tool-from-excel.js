'use strict';
// from-excel (requires SheetJS)
function initToolOptions() {}
// Override uploadFile for Excel binary reading
function handleExcelUpload(input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const data  = new Uint8Array(e.target.result);
    const wb    = XLSX.read(data, { type:'array' });
    const ws    = wb.Sheets[wb.SheetNames[0]];
    const json  = XLSX.utils.sheet_to_json(ws, { defval:null });
    setOutput(JSON.stringify(json, null, 2));
    showToast(`读取 ${json.length} 行数据`, 'success');
  };
  reader.readAsArrayBuffer(file);
  input.value = '';
}
function processJson() { showToast('请上传 Excel 文件', 'info'); }

