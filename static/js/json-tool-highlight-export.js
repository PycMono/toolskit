'use strict';
// json-highlight-export.js — Export JSON with syntax highlighting

function initToolOptions() {
  const el = document.getElementById('toolOptions');
  if (!el) return;
  el.innerHTML = `
    <span class="jt-options-label">导出格式</span>
    <div class="jt-options-row" style="gap:8px">
      <button class="jt-btn jt-btn--sm jt-btn--primary" id="btnHtml" onclick="setExportFormat('html')">HTML</button>
      <button class="jt-btn jt-btn--sm" id="btnRtf" onclick="setExportFormat('rtf')">RTF</button>
    </div>
    <label class="jt-checkbox" style="margin-left:12px">
      <input type="checkbox" id="optLineNum" checked>
      <span>行号</span>
    </label>
    <label class="jt-checkbox">
      <input type="checkbox" id="optTheme">
      <span>深色主题</span>
    </label>
  `;
  window._exportFormat = 'html';
}

function setExportFormat(format) {
  window._exportFormat = format;
  document.getElementById('btnHtml').classList.toggle('jt-btn--primary', format === 'html');
  document.getElementById('btnRtf').classList.toggle('jt-btn--primary', format === 'rtf');
  document.getElementById('btnHtml').classList.toggle('jt-btn--ghost', format !== 'html');
  document.getElementById('btnRtf').classList.toggle('jt-btn--ghost', format !== 'rtf');
}

function processJson() {
  clearErrorPanel();
  const parsed = parseInput();
  if (parsed === null) return;

  const lineNumbers = document.getElementById('optLineNum')?.checked ?? true;
  const darkTheme = document.getElementById('optTheme')?.checked ?? false;

  const formatted = JSON.stringify(parsed, null, 2);
  const lines = formatted.split('\n');

  const colors = darkTheme ? {
    key: '#9cdcfe',
    string: '#ce9178',
    number: '#b5cea8',
    boolean: '#569cd6',
    null: '#569cd6',
    bracket: '#ffd700',
    bg: '#1e1e1e',
    text: '#d4d4d4',
    lineNum: '#858585'
  } : {
    key: '#0451a5',
    string: '#a31515',
    number: '#098658',
    boolean: '#0000ff',
    null: '#800080',
    bracket: '#000000',
    bg: '#ffffff',
    text: '#000000',
    lineNum: '#999999'
  };

  const highlighted = lines.map((line, idx) => {
    let processed = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Highlight strings (including keys)
    processed = processed.replace(/"([^"\\]|\\.)*"(?=\s*:)/g, `<span style="color:${colors.key}">$&</span>`);
    processed = processed.replace(/:\s*("[^"\\]|\\.)*"/g, match => {
      return match.replace(/("[^"\\]|\\.)*"/, `<span style="color:${colors.string}">$&</span>`);
    });

    // Highlight numbers
    processed = processed.replace(/:\s*(-?\d+\.?\d*)/g, match => {
      return match.replace(/(-?\d+\.?\d*)/, `<span style="color:${colors.number}">$1</span>`);
    });

    // Highlight booleans
    processed = processed.replace(/:\s*(true|false)/g, match => {
      return match.replace(/(true|false)/, `<span style="color:${colors.boolean}">$1</span>`);
    });

    // Highlight null
    processed = processed.replace(/:\s*(null)/g, match => {
      return match.replace(/(null)/, `<span style="color:${colors.null}">$1</span>`);
    });

    // Highlight brackets
    processed = processed.replace(/([{}\[\]])/g, `<span style="color:${colors.bracket};font-weight:bold">$1</span>`);

    if (lineNumbers) {
      const lineNum = String(idx + 1).padStart(String(lines.length).length, ' ');
      processed = `<span style="color:${colors.lineNum};user-select:none">${lineNum}</span>  ${processed}`;
    }

    return processed;
  }).join('\n');

  const format = window._exportFormat || 'html';

  if (format === 'html') {
    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>JSON Export</title>
<style>
body {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
  background: ${colors.bg};
  color: ${colors.text};
  padding: 16px;
  margin: 0;
  white-space: pre;
}
</style>
</head>
<body>
${highlighted}
</body>
</html>`;
    setOutput(html, 'html');
  } else {
    // RTF format
    const rtfColors = darkTheme
      ? `\\red156\\green220\\blue254;\\red206\\green145\\blue120;\\red181\\green206\\blue168;\\red86\\green156\\blue214;\\red128\\green128\\blue128;`
      : `\\red4\\green81\\blue165;\\red163\\green21\\blue21;\\red9\\green134\\blue88;\\red0\\green0\\blue255;\\red128\\green0\\blue128;`;

    const rtfContent = lines.map((line, idx) => {
      let processed = line
        .replace(/\\/g, '\\\\')
        .replace(/{/g, '\\{')
        .replace(/}/g, '\\}');

      // Simple RTF with syntax highlighting would be complex
      // For now, just output plain text RTF
      if (lineNumbers) {
        const lineNum = String(idx + 1).padStart(String(lines.length).length, ' ');
        processed = `${lineNum}  ${processed}`;
      }
      return processed + '\\par\n';
    }).join('');

    const rtf = `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0\\fnil\\fcharset0 Consolas;}}
{\\colortbl;${rtfColors}}
\\viewkind4\\uc1\\pard\\f0\\fs24
${rtfContent}
}`;
    setOutput(rtf, 'rtf');
  }

  const statsEl = document.getElementById('outputStats');
  if (statsEl) statsEl.innerHTML = `<span class="jt-success-badge">✅ 高亮导出生成完成</span>`;
}
