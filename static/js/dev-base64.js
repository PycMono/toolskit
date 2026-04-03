// dev-base64.js — Base64 Encoder / Decoder Engine

const DevBase64 = (() => {
  const STATE = {
    mode: 'encode',
    output: '',
    opts: { urlSafe: false, splitChunks: false, eachLine: false },
    MAX_FILE: 100 * 1024 * 1024,
    debounceTimer: null,
  };

  function onInputChange() {
    clearTimeout(STATE.debounceTimer);
    STATE.debounceTimer = setTimeout(compute, 300);
    const ta = document.getElementById('base64Input');
    const cc = document.getElementById('b64InputCount');
    if (cc) cc.textContent = ta.value.length + ' chars';
  }

  function compute() {
    const input = document.getElementById('base64Input').value;
    if (!input.trim()) { setOutput(''); setStatus('idle'); return; }
    try {
      const result = STATE.mode === 'encode'
        ? encodeText(input, STATE.opts)
        : decodeText(input, STATE.opts);
      setOutput(result);
      setStatus('done');
    } catch (e) {
      showDevToast('Invalid Base64 string. Please check your input.', 'error');
      setOutput('');
      setStatus('error');
    }
  }

  function encodeText(str, opts) {
    let bytes;
    try {
      bytes = new TextEncoder().encode(str);
    } catch (e) {
      throw new Error('Encoding failed');
    }
    // btoa only handles latin1; convert via char codes
    let b64;
    if (bytes.length > 512 * 1024) {
      // Large strings: chunk to avoid stack overflow
      let binary = '';
      const CHUNK = 8192;
      for (let i = 0; i < bytes.length; i += CHUNK) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
      }
      b64 = btoa(binary);
    } else {
      b64 = btoa(String.fromCharCode.apply(null, bytes));
    }
    if (opts.urlSafe) {
      b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    }
    if (opts.splitChunks && !opts.eachLine) {
      b64 = b64.match(/.{1,76}/g).join('\n');
    }
    if (opts.eachLine) {
      b64 = str.split('\n').map(line => {
        const b = new TextEncoder().encode(line);
        let bin = '';
        for (let i = 0; i < b.length; i++) bin += String.fromCharCode(b[i]);
        return btoa(bin);
      }).join('\n');
    }
    return b64;
  }

  function decodeText(b64, opts) {
    let str = b64.replace(/\s/g, '');
    if (opts.urlSafe) {
      str = str.replace(/-/g, '+').replace(/_/g, '/');
      while (str.length % 4) str += '=';
    }
    try {
      const binary = atob(str);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return new TextDecoder('utf-8').decode(bytes);
    } catch (e) {
      throw new Error('Invalid Base64');
    }
  }

  function processFile(file) {
    if (file.size > STATE.MAX_FILE) {
      showDevToast('File exceeds 50MB limit.', 'error'); return;
    }
    setStatus('processing');
    const reader = new FileReader();
    reader.onload = (e) => {
      let b64 = e.target.result.split(',')[1];
      if (!b64) { showDevToast('Could not read file.', 'error'); return; }
      if (STATE.opts.urlSafe) b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      setOutput(b64);
      setStatus('done');
    };
    reader.onerror = () => { showDevToast('File read error.', 'error'); setStatus('error'); };
    reader.readAsDataURL(file);
  }

  function setOutput(val) {
    STATE.output = val;
    const el = document.getElementById('base64Output');
    if (el) el.textContent = val;
    const count = document.getElementById('outputCharCount');
    if (count) count.textContent = val.length.toLocaleString() + ' characters';
  }

  function setStatus(s) {
    const map = {
      idle:       ['status-dot--idle',       'Waiting for input…'],
      processing: ['status-dot--processing', 'Processing…'],
      done:       ['status-dot--done',       'Ready'],
      error:      ['status-dot--error',      'Error'],
    };
    const dot  = document.getElementById('b64StatusDot');
    const text = document.getElementById('b64StatusText');
    if (dot)  dot.className  = 'status-dot ' + (map[s] ? map[s][0] : map.idle[0]);
    if (text) text.textContent = map[s] ? map[s][1] : '';
  }

  async function copyOutput() {
    if (!STATE.output) return;
    await navigator.clipboard.writeText(STATE.output);
    showDevToast('Copied!', 'success');
  }

  function downloadOutput() {
    if (!STATE.output) return;
    const blob = new Blob([STATE.output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'base64_output.txt'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  function setMode(m) {
    STATE.mode = m;
    document.getElementById('mode-encode').classList.toggle('active', m === 'encode');
    document.getElementById('mode-decode').classList.toggle('active', m === 'decode');
    document.getElementById('mode-encode').setAttribute('aria-selected', String(m === 'encode'));
    document.getElementById('mode-decode').setAttribute('aria-selected', String(m === 'decode'));
    compute();
  }

  function onOptionsChange() {
    STATE.opts.urlSafe      = document.getElementById('optUrlSafe').checked;
    STATE.opts.splitChunks  = document.getElementById('optSplitChunks').checked;
    STATE.opts.eachLine     = document.getElementById('optEachLine').checked;
    compute();
  }

  function toggleOptions() {
    const body = document.getElementById('b64OptionsBody');
    const btn  = document.querySelector('[aria-controls="b64OptionsBody"]');
    const open = body.hidden;
    body.hidden = !open;
    if (btn) btn.setAttribute('aria-expanded', String(open));
  }

  function onDragOver(e) {
    e.preventDefault();
    document.getElementById('b64DropZone').classList.add('drop-zone--hover');
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
    if (file) processFile(file);
  }

  function onFileSelect(e) {
    const file = e.target.files[0];
    if (file) processFile(file);
  }

  function clearAll() {
    const ta = document.getElementById('base64Input');
    if (ta) ta.value = '';
    const cc = document.getElementById('b64InputCount');
    if (cc) cc.textContent = '0 chars';
    setOutput('');
    setStatus('idle');
  }

  return {
    onInputChange, compute, setMode, onOptionsChange, toggleOptions,
    copyOutput, downloadOutput, clearAll,
    onDragOver, onDragLeave, onDrop, onFileSelect,
  };
})();

