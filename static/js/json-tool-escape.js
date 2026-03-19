'use strict';
// escape
function initToolOptions() {}
function processJson() {
  const raw = getInput().trim(); if (!raw) return;
  try {
    JSON.parse(raw);
    const escaped = raw.replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/\n/g,'\\n').replace(/\r/g,'\\r').replace(/\t/g,'\\t');
    setOutput(escaped, 'plaintext');
  } catch(e) { showErrorPanel(e, raw); }
}

