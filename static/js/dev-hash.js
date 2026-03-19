// dev-hash.js — Hash Generator Engine
// Supports: MD5 (via CryptoJS), SHA-1/256/512 (Web Crypto API), HMAC-SHA256 (CryptoJS)

const DevHash = (() => {
  const STATE = {
    text: '',
    fileBuffer: null,
    fileName: '',
    isUppercase: false,
    isHMACMode: false,
    hmacKey: '',
    results: { md5: '', sha1: '', sha256: '', sha512: '', hmac: '' },
    debounceTimer: null,
    DEBOUNCE_MS: 300,
    MAX_FILE_SIZE: 2 * 1024 * 1024 * 1024,
  };

  function onInputChange() {
    clearTimeout(STATE.debounceTimer);
    STATE.debounceTimer = setTimeout(compute, STATE.DEBOUNCE_MS);
    updateLineNumbers();
    const ta = document.getElementById('hashInput');
    const cc = document.getElementById('inputCharCount');
    if (cc) cc.textContent = ta.value.length + ' chars';
  }

  async function compute() {
    const text = document.getElementById('hashInput').value;
    STATE.text = text;
    STATE.fileBuffer = null;
    if (!text.trim()) { clearResults(); return; }
    const buffer = new TextEncoder().encode(text).buffer;
    await computeFromBuffer(buffer, text);
  }

  async function computeFromBuffer(buffer, label) {
    setStatus('processing');
    try {
      const [sha1, sha256, sha512] = await Promise.all([
        digestHex(buffer, 'SHA-1'),
        digestHex(buffer, 'SHA-256'),
        digestHex(buffer, 'SHA-512'),
      ]);
      const md5 = CryptoJS.MD5(CryptoJS.lib.WordArray.create(buffer)).toString();
      let hmac = '';
      if (STATE.isHMACMode && STATE.hmacKey) {
        hmac = CryptoJS.HmacSHA256(
          STATE.text || CryptoJS.lib.WordArray.create(buffer),
          STATE.hmacKey
        ).toString();
      }
      const fmt = s => STATE.isUppercase ? s.toUpperCase() : s.toLowerCase();
      STATE.results = { md5: fmt(md5), sha1: fmt(sha1), sha256: fmt(sha256), sha512: fmt(sha512), hmac: fmt(hmac) };
      renderResults(STATE.results);
      setStatus('done');
    } catch (err) {
      setStatus('error');
      showDevToast(err.message, 'error');
    }
  }

  async function digestHex(buffer, algo) {
    const hashBuffer = await crypto.subtle.digest(algo, buffer);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  function addFile(file) {
    if (file.size > STATE.MAX_FILE_SIZE) {
      showDevToast('File exceeds 2GB limit.', 'error'); return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      STATE.fileBuffer = e.target.result;
      STATE.fileName = file.name;
      document.getElementById('hashInput').value = '';
      const cc = document.getElementById('inputCharCount');
      if (cc) cc.textContent = 'File: ' + file.name;
      await computeFromBuffer(STATE.fileBuffer, file.name);
    };
    reader.readAsArrayBuffer(file);
  }

  function onDragOver(e) {
    e.preventDefault();
    document.getElementById('dropZone').classList.add('drop-zone--hover');
  }

  function onDragLeave(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX >= rect.right ||
        e.clientY < rect.top  || e.clientY >= rect.bottom) {
      e.currentTarget.classList.remove('drop-zone--hover');
    }
  }

  function onDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drop-zone--hover');
    const file = e.dataTransfer.files[0];
    if (file) addFile(file);
  }

  function onFileSelect(e) {
    const file = e.target.files[0];
    if (file) addFile(file);
  }

  async function copy(algo) {
    const val = STATE.results[algo];
    if (!val) return;
    await navigator.clipboard.writeText(val);
    const btn = document.getElementById('copy-' + algo);
    if (btn) {
      btn.classList.add('btn--copied');
      btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M3 8l4 4 6-7" stroke="currentColor" fill="none" stroke-width="2"/></svg>';
      setTimeout(() => {
        btn.classList.remove('btn--copied');
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16"><rect x="5" y="5" width="9" height="9" rx="1" stroke="currentColor" fill="none"/><path d="M3 11V3h8" stroke="currentColor" fill="none"/></svg>';
      }, 1500);
    }
    showDevToast('Copied!', 'success');
  }

  async function copyAll() {
    const lines = Object.entries(STATE.results)
      .filter(([, v]) => v)
      .map(([k, v]) => k.toUpperCase() + ': ' + v)
      .join('\n');
    if (!lines) return;
    await navigator.clipboard.writeText(lines);
    showDevToast('All hashes copied!', 'success');
  }

  function downloadAll() {
    const lines = Object.entries(STATE.results)
      .filter(([, v]) => v)
      .map(([k, v]) => k.toUpperCase() + ': ' + v)
      .join('\n');
    if (!lines) return;
    const blob = new Blob([lines], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'hashes.txt'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  function clearResults() {
    ['md5', 'sha1', 'sha256', 'sha512', 'hmac'].forEach(a => {
      const el = document.getElementById('val-' + a);
      if (el) el.textContent = '—';
    });
    STATE.results = { md5: '', sha1: '', sha256: '', sha512: '', hmac: '' };
    setStatus('idle');
  }

  function renderResults(res) {
    ['md5', 'sha1', 'sha256', 'sha512'].forEach(a => {
      const el = document.getElementById('val-' + a);
      if (el) el.textContent = res[a] || '—';
    });
    if (STATE.isHMACMode) {
      const el = document.getElementById('val-hmac');
      if (el) el.textContent = res.hmac || '—';
    }
  }

  function setStatus(s) {
    const map = {
      idle:       ['status-dot--idle',       'Waiting for input…'],
      processing: ['status-dot--processing', 'Computing…'],
      done:       ['status-dot--done',       'Ready'],
      error:      ['status-dot--error',      'Error'],
    };
    const dot  = document.getElementById('statusDot');
    const text = document.getElementById('statusText');
    if (dot)  dot.className  = 'status-dot ' + (map[s] ? map[s][0] : map.idle[0]);
    if (text) text.textContent = map[s] ? map[s][1] : '';
  }

  function updateLineNumbers() {
    const ta    = document.getElementById('hashInput');
    const lines = (ta.value.split('\n').length) || 1;
    const ln    = document.getElementById('lineNumbers');
    if (!ln) return;
    ln.innerHTML = Array.from({ length: lines }, (_, i) => '<div>' + (i + 1) + '</div>').join('');
  }

  function toggleHMAC() {
    STATE.isHMACMode = document.getElementById('optHMAC').checked;
    const sec  = document.getElementById('hmacKeySection');
    const card = document.getElementById('card-hmac');
    if (sec)  sec.hidden  = !STATE.isHMACMode;
    if (card) card.hidden = !STATE.isHMACMode;
    onInputChange();
  }

  function toggleOptions() {
    const body = document.getElementById('optionsBody');
    const btn  = document.querySelector('.options-toggle');
    const open = body.hidden;
    body.hidden = !open;
    if (btn) btn.setAttribute('aria-expanded', String(open));
  }

  function onOptionsChange() {
    STATE.isUppercase = document.getElementById('optUppercase').checked;
    if (STATE.text || STATE.fileBuffer) {
      const buffer = STATE.fileBuffer || new TextEncoder().encode(STATE.text).buffer;
      computeFromBuffer(buffer, STATE.text || STATE.fileName);
    }
  }

  function clearInput() {
    document.getElementById('hashInput').value = '';
    STATE.fileBuffer = null;
    STATE.text = '';
    clearResults();
    updateLineNumbers();
    const cc = document.getElementById('inputCharCount');
    if (cc) cc.textContent = '0 chars';
  }

  return {
    onInputChange, onDragOver, onDragLeave, onDrop, onFileSelect,
    copy, copyAll, downloadAll, clearInput, toggleOptions, toggleHMAC, onOptionsChange
  };
})();

// Shared toast utility for dev tools
function showDevToast(msg, type) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  // Limit to 3 toasts
  while (container.children.length >= 3) container.removeChild(container.firstChild);
  const el = document.createElement('div');
  el.className = 'toast' + (type ? ' toast--' + type : '');
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 3200);
}

