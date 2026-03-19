'use strict';
// jsonc — strip comments and trailing commas
function initToolOptions() {}
function processJson() {
  const raw = getInput().trim(); if (!raw) return;
  const stripped = stripJsonComments(raw);
  try {
    setOutput(JSON.stringify(JSON.parse(stripped), null, 2));
    showToast('✅ 注释移除成功','success');
  } catch(e) { showErrorPanel(e, stripped); }
}
function stripJsonComments(str) {
  let res='', inStr=false, esc=false, i=0;
  while (i < str.length) {
    const ch=str[i], ch2=str[i+1];
    if (esc)                    { res+=ch; esc=false; i++; continue; }
    if (ch==='\\'&&inStr)       { res+=ch; esc=true;  i++; continue; }
    if (ch==='"')               { inStr=!inStr; res+=ch; i++; continue; }
    if (inStr)                  { res+=ch; i++; continue; }
    if (ch==='/'&&ch2==='/')    { while(i<str.length&&str[i]!=='\n')i++; continue; }
    if (ch==='/'&&ch2==='*')    { i+=2; while(i<str.length&&!(str[i]==='*'&&str[i+1]==='/'))i++; i+=2; continue; }
    if (ch===','&&/\s*[}\]]/.test(str.slice(i+1,i+10))) { i++; continue; }
    res+=ch; i++;
  }
  return res;
}

