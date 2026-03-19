// dev-url-encode.js — URL Encoder / Decoder Engine

const DevURLEncode = (() => {
  const STATE = {
    mode: 'encode',
    method: 'component',
    batchMode: false,
    showDiff: false,
    debounceTimer: null,
  };

  const ENCODE_FN = {
    component: encodeURIComponent,
    uri:       encodeURI,
    rfc3986:   (s) => encodeURIComponent(s).replace(/[!'()*]/g,
                 c => '%' + c.charCodeAt(0).toString(16).toUpperCase()),
  };

  const DECODE_FN = {
    component: decodeURIComponent,
    uri:       decodeURI,
    rfc3986:   decodeURIComponent,
  };

  function compute() {
    const input = document.getElementById('urlInput').value;
    const dot   = document.getElementById('urlStatusDot');
    const text  = document.getElementById('urlStatusText');

    if (!input.trim()) {
      setOutput('', '');
      if (dot)  dot.className   = 'status-dot status-dot--idle';
      if (text) text.textContent = 'Waiting for input…';
      return;
    }

    if (dot)  dot.className   = 'status-dot status-dot--done';
    if (text) text.textContent = 'Ready';

    const fn = STATE.mode === 'encode' ? ENCODE_FN[STATE.method] : DECODE_FN[STATE.method];

    if (STATE.batchMode) {
      const results = input.split('\n').map(line => {
        try { return fn(line); } catch { return '[ERROR]'; }
      });
      setOutput(results.join('\n'), input);
    } else {
      try {
        setOutput(fn(input), input);
      } catch (e) {
        showDevToast('Decode failed: ' + e.message, 'error');
        if (dot)  dot.className   = 'status-dot status-dot--error';
        if (text) text.textContent = 'Error';
      }
    }
  }

  function buildDiffHTML(original, encoded) {
    let html = '';
    const escHTML = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    let i = 0, j = 0;
    while (i < original.length && j < encoded.length) {
      if (original[i] === encoded[j]) {
        html += '<span class="diff-same">' + escHTML(encoded[j]) + '</span>';
        i++; j++;
      } else {
        let enc = '';
        while (j < encoded.length && (i >= original.length || original[i] !== encoded[j])) {
          enc += encoded[j++];
        }
        html += '<span class="diff-encoded">' + escHTML(enc) + '</span>';
        i++;
      }
    }
    if (j < encoded.length) html += escHTML(encoded.slice(j));
    return html;
  }

  function setOutput(val, original) {
    const el = document.getElementById('urlOutput');
    if (!el) return;
    if (STATE.showDiff && STATE.mode === 'encode' && original && val) {
      el.innerHTML = buildDiffHTML(original, val);
    } else {
      el.textContent = val;
    }
  }

  async function copyOutput() {
    const el  = document.getElementById('urlOutput');
    const val = el ? el.textContent : '';
    if (!val) return;
    await navigator.clipboard.writeText(val);
    showDevToast('Copied!', 'success');
  }

  function setMode(m) {
    STATE.mode = m;
    const encBtn = document.getElementById('url-mode-encode');
    const decBtn = document.getElementById('url-mode-decode');
    if (encBtn) { encBtn.classList.toggle('active', m === 'encode'); encBtn.setAttribute('aria-selected', String(m === 'encode')); }
    if (decBtn) { decBtn.classList.toggle('active', m === 'decode'); decBtn.setAttribute('aria-selected', String(m === 'decode')); }
    compute();
  }

  function setMethod(m) { STATE.method = m; compute(); }

  function toggleBatch() {
    STATE.batchMode = document.getElementById('optBatch').checked;
    const hint = document.getElementById('urlBatchHint');
    if (hint) hint.style.display = STATE.batchMode ? 'block' : 'none';
    compute();
  }

  function toggleDiff()  { STATE.showDiff  = document.getElementById('optDiff').checked; compute(); }

  function toggleOptions() {
    const body = document.getElementById('urlOptionsBody');
    const btn  = document.querySelector('[aria-controls="urlOptionsBody"]');
    const open = body.hidden;
    body.hidden = !open;
    if (btn) btn.setAttribute('aria-expanded', String(open));
  }

  function clearAll() {
    const ta = document.getElementById('urlInput');
    if (ta) ta.value = '';
    const cc = document.getElementById('urlInputCount');
    if (cc) cc.textContent = '0 chars';
    setOutput('', '');
    const dot  = document.getElementById('urlStatusDot');
    const text = document.getElementById('urlStatusText');
    if (dot)  dot.className   = 'status-dot status-dot--idle';
    if (text) text.textContent = 'Waiting for input…';
  }

  return {
    onInputChange: () => {
      clearTimeout(STATE.debounceTimer);
      STATE.debounceTimer = setTimeout(compute, 300);
      const ta = document.getElementById('urlInput');
      const cc = document.getElementById('urlInputCount');
      if (cc) cc.textContent = ta.value.length + ' chars';
    },
    setMode, setMethod, toggleBatch, toggleDiff, toggleOptions, copyOutput, clearAll,
  };
})();

