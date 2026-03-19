# Developer Tools Suite — I-03 前端处理引擎

---

## 1. 技术选型表

| 工具 | 核心 API / 库 | 选型原因 |
|------|-------------|---------|
| Hash（MD5/SHA-1/SHA-256/SHA-512） | **Web Crypto API** (`crypto.subtle.digest`) | 原生浏览器，无需 CDN，支持 ArrayBuffer 流式处理 |
| Hash（文件大于 512MB） | `FileReader.readAsArrayBuffer` + Web Crypto 分块 | 避免内存溢出，支持 2GB 以内文件 |
| HMAC-SHA256 | **crypto-js 4.2.0** | Web Crypto HMAC 需要导入密钥步骤，crypto-js 更简洁 |
| Base64 文本 | 原生 `btoa / atob` + `TextEncoder` | 零依赖，UTF-8 安全包装 |
| Base64 文件 | `FileReader.readAsDataURL` + 正则提取 | 纯客户端，不上传服务器 |
| URL 编解码 | 原生 `encodeURIComponent / decodeURIComponent` | 零依赖，RFC 3986 实现 |
| IP 查询（本机） | `https://api64.ipify.org?format=json`（IPv4+IPv6） | 免费，支持双栈，无需 API key |
| IP 地理信息 | `http://ip-api.com/json/{ip}?fields=...` | 免费，字段丰富，无需 API key |
| IP 地图 | **Leaflet 1.9.4** + OpenStreetMap 瓦片 | 免费，无 API key |
| Whois | **后端 Go 代理** `/api/whois?domain=...` | 浏览器不能直接 TCP 43 端口 |
| Word Counter | 原生 JS + **Web Worker** | 大文本不阻塞 UI 线程 |
| 关键词图表 | **Chart.js 4.4.0** | CDN 可用，轻量 |
| 批量下载 | **JSZip + FileSaver.js** | Hash 导出多算法结果 |

---

## 2. 各引擎架构说明

### 2.1 Hash 引擎 (`static/js/dev-hash.js`)

```javascript
const DevHash = (() => {
  const STATE = {
    text: '',
    fileBuffer: null,       // ArrayBuffer | null
    fileName: '',
    isUppercase: false,
    isHMACMode: false,
    hmacKey: '',
    results: { md5: '', sha1: '', sha256: '', sha512: '', hmac: '' },
    isProcessing: false,
    debounceTimer: null,
    DEBOUNCE_MS: 300,
    MAX_FILE_SIZE: 2 * 1024 * 1024 * 1024,  // 2GB
  };

  function onInputChange() {
    clearTimeout(STATE.debounceTimer);
    STATE.debounceTimer = setTimeout(compute, STATE.DEBOUNCE_MS);
    updateLineNumbers();
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
      renderResults(STATE.results, label);
      setStatus('done');
      if (window.DevHashGA) DevHashGA.onHashComplete('all', 0);
    } catch (err) {
      setStatus('error');
      showToast(err.message, 'error');
      if (window.DevHashGA) DevHashGA.onError(err.message);
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
      showToast('File exceeds 2GB limit.', 'error'); return;
    }
    if (window.DevHashGA) DevHashGA.onFileSelected(file.size / 1024 / 1024);
    const reader = new FileReader();
    reader.onload = async (e) => {
      STATE.fileBuffer = e.target.result;
      STATE.fileName = file.name;
      document.getElementById('hashInput').value = '';
      document.getElementById('inputCharCount').textContent = `File: ${file.name}`;
      await computeFromBuffer(STATE.fileBuffer, file.name);
    };
    reader.readAsArrayBuffer(file);
  }

  // 拖放事件（排除子元素触发 DragLeave）
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
    const btn = document.querySelector(`#card-${algo} .btn--icon`);
    btn.setAttribute('data-tooltip', 'Copied!');
    setTimeout(() => btn.setAttribute('data-tooltip', 'Copy'), 1500);
    showToast('Copied!', 'success');
    if (window.DevHashGA) DevHashGA.onCopy(algo);
  }

  async function copyAll() {
    const lines = Object.entries(STATE.results)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
      .join('\n');
    await navigator.clipboard.writeText(lines);
    showToast('All hashes copied!', 'success');
  }

  function downloadAll() {
    const lines = Object.entries(STATE.results)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
      .join('\n');
    const blob = new Blob([lines], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'hashes.txt'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  function clearResults() {
    ['md5', 'sha1', 'sha256', 'sha512', 'hmac'].forEach(a => {
      const el = document.getElementById(`val-${a}`);
      if (el) el.textContent = '—';
    });
    STATE.results = { md5: '', sha1: '', sha256: '', sha512: '', hmac: '' };
    setStatus('idle');
  }

  function clearInput() {
    document.getElementById('hashInput').value = '';
    STATE.fileBuffer = null;
    clearResults();
    updateLineNumbers();
  }

  function renderResults(res) {
    ['md5', 'sha1', 'sha256', 'sha512'].forEach(a => {
      const el = document.getElementById(`val-${a}`);
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
    document.getElementById('statusDot').className = `status-dot ${map[s][0]}`;
    document.getElementById('statusText').textContent = map[s][1];
  }

  function updateLineNumbers() {
    const ta = document.getElementById('hashInput');
    const lines = ta.value.split('\n').length;
    document.getElementById('lineNumbers').innerHTML =
      Array.from({ length: lines }, (_, i) => `<div>${i + 1}</div>`).join('');
  }

  function toggleHMAC() {
    STATE.isHMACMode = document.getElementById('optHMAC').checked;
    document.getElementById('hmacKeySection').hidden = !STATE.isHMACMode;
    document.getElementById('card-hmac').hidden = !STATE.isHMACMode;
    onInputChange();
  }

  function toggleOptions() {
    const body = document.getElementById('optionsBody');
    const btn  = document.querySelector('.options-toggle');
    const open = body.hidden;
    body.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
  }

  function onOptionsChange() {
    STATE.isUppercase = document.getElementById('optUppercase').checked;
    if (STATE.text || STATE.fileBuffer) compute();
  }

  return {
    onInputChange, onDragOver, onDragLeave, onDrop, onFileSelect,
    copy, copyAll, downloadAll, clearInput, toggleOptions, toggleHMAC, onOptionsChange
  };
})();
```

---

### 2.2 Base64 引擎 (`static/js/dev-base64.js`)

```javascript
const DevBase64 = (() => {
  const STATE = {
    mode: 'encode',    // 'encode' | 'decode'
    input: '',
    output: '',
    opts: {
      charset: 'UTF-8',
      newline: 'LF',
      eachLine: false,
      splitChunks: false,
      urlSafe: false,
    },
    MAX_FILE: 50 * 1024 * 1024,  // 50MB
    debounceTimer: null,
  };

  function onInputChange() {
    clearTimeout(STATE.debounceTimer);
    STATE.debounceTimer = setTimeout(compute, 300);
  }

  function compute() {
    const input = document.getElementById('base64Input').value;
    STATE.input = input;
    if (!input.trim()) { setOutput(''); return; }
    try {
      const result = STATE.mode === 'encode'
        ? encodeText(input, STATE.opts)
        : decodeText(input, STATE.opts);
      setOutput(result);
    } catch (e) {
      showToast('Invalid Base64 string.', 'error');
      setOutput('');
    }
  }

  function encodeText(str, opts) {
    const bytes = new TextEncoder().encode(str);
    let b64 = btoa(String.fromCharCode(...bytes));
    if (opts.urlSafe) {
      b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    }
    if (opts.splitChunks) {
      b64 = b64.match(/.{1,76}/g).join(opts.newline === 'CRLF' ? '\r\n' : '\n');
    }
    if (opts.eachLine) {
      b64 = str.split('\n').map(line => {
        const b = new TextEncoder().encode(line);
        return btoa(String.fromCharCode(...b));
      }).join('\n');
    }
    return b64;
  }

  function decodeText(b64, opts) {
    let str = b64;
    if (opts.urlSafe) {
      str = str.replace(/-/g, '+').replace(/_/g, '/');
      while (str.length % 4) str += '=';
    }
    const binary = atob(str.replace(/\s/g, ''));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder(opts.charset).decode(bytes);
  }

  function processFile(file) {
    if (file.size > STATE.MAX_FILE) {
      showToast('File exceeds 50MB.', 'error'); return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      // dataURL = "data:{mime};base64,{b64}"
      let b64 = e.target.result.split(',')[1];
      if (STATE.opts.urlSafe) b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      setOutput(b64);
      document.getElementById('downloadSection').hidden = false;
    };
    reader.readAsDataURL(file);
  }

  function setOutput(val) {
    STATE.output = val;
    document.getElementById('base64Output').textContent = val;
    const count = document.getElementById('outputCharCount');
    if (count) count.textContent = `${val.length} characters`;
  }

  async function copyOutput() {
    if (!STATE.output) return;
    await navigator.clipboard.writeText(STATE.output);
    showToast('Copied!', 'success');
  }

  function downloadOutput() {
    const blob = new Blob([STATE.output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'base64_output.txt'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  return { onInputChange, processFile, copyOutput, downloadOutput };
})();
```

---

### 2.3 URL 编解码引擎 (`static/js/dev-url-encode.js`)

```javascript
const DevURLEncode = (() => {
  const STATE = {
    mode: 'encode',
    method: 'component',   // 'component' | 'uri' | 'rfc3986'
    batchMode: false,
    showDiff: false,
    debounceTimer: null,
  };

  const ENCODE_FN = {
    component: encodeURIComponent,
    uri:       encodeURI,
    rfc3986:   (s) => encodeURIComponent(s).replace(/[!'()*]/g, c =>
                 '%' + c.charCodeAt(0).toString(16).toUpperCase()),
  };

  const DECODE_FN = {
    component: decodeURIComponent,
    uri:       decodeURI,
    rfc3986:   decodeURIComponent,
  };

  function compute() {
    const input = document.getElementById('urlInput').value;
    if (!input.trim()) { setOutput('', ''); return; }

    const fn = STATE.mode === 'encode'
      ? ENCODE_FN[STATE.method]
      : DECODE_FN[STATE.method];

    if (STATE.batchMode) {
      const results = input.split('\n').map(line => {
        try { return fn(line); } catch { return '[ERROR]'; }
      });
      setOutput(results.join('\n'), input);
    } else {
      try {
        setOutput(fn(input), input);
      } catch (e) {
        showToast('Decoding failed: ' + e.message, 'error');
      }
    }
  }

  function buildDiffHTML(original, encoded) {
    let html = '';
    let i = 0, j = 0;
    while (i < original.length && j < encoded.length) {
      if (original[i] === encoded[j]) {
        html += `<span class="diff-same">${escapeHTML(encoded[j])}</span>`;
        i++; j++;
      } else {
        let enc = '';
        while (j < encoded.length && (i >= original.length || original[i] !== encoded[j])) {
          enc += encoded[j++];
        }
        html += `<span class="diff-encoded">${escapeHTML(enc)}</span>`;
        i++;
      }
    }
    html += escapeHTML(encoded.slice(j));
    return html;
  }

  function escapeHTML(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function setOutput(val, original) {
    const el = document.getElementById('urlOutput');
    if (STATE.showDiff && STATE.mode === 'encode' && original) {
      el.innerHTML = buildDiffHTML(original, val);
    } else {
      el.textContent = val;
    }
  }

  async function copyOutput() {
    const val = document.getElementById('urlOutput').textContent;
    if (!val) return;
    await navigator.clipboard.writeText(val);
    showToast('Copied!', 'success');
  }

  return {
    onInputChange: () => {
      clearTimeout(STATE.debounceTimer);
      STATE.debounceTimer = setTimeout(compute, 300);
    },
    setMode:    (m) => { STATE.mode = m; compute(); },
    setMethod:  (m) => { STATE.method = m; compute(); },
    toggleBatch: () => { STATE.batchMode = !STATE.batchMode; compute(); },
    toggleDiff:  () => { STATE.showDiff  = !STATE.showDiff;  compute(); },
    copyOutput,
  };
})();
```

---

### 2.4 IP 查询引擎 (`static/js/dev-ip.js`)

```javascript
const DevIP = (() => {
  let map = null;
  let marker = null;

  async function loadMyIP() {
    setStatus('Detecting your IP…');
    try {
      const r4 = await fetch('https://api.ipify.org?format=json');
      const { ip: ipv4 } = await r4.json();
      document.getElementById('myIPv4').textContent = ipv4;

      // IPv6（可能失败，静默忽略）
      try {
        const r6 = await fetch('https://api64.ipify.org?format=json');
        const { ip: ipv6 } = await r6.json();
        if (ipv6 !== ipv4) document.getElementById('myIPv6').textContent = ipv6;
      } catch {}

      await lookupIP(ipv4);
    } catch (e) {
      setStatus('Could not detect IP.');
      showToast('Failed to get your IP.', 'error');
    }
  }

  async function lookupIP(ip) {
    if (!ip) ip = document.getElementById('ipInput').value.trim();
    if (!ip) { await loadMyIP(); return; }

    setStatus(`Looking up ${ip}…`);
    const fields = 'status,message,country,countryCode,regionName,city,zip,lat,lon,timezone,isp,org,as,query';
    try {
      const resp = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=${fields}`);
      const data = await resp.json();
      if (data.status === 'fail') throw new Error(data.message);
      renderIPData(data);
      setStatus('');
    } catch (e) {
      setStatus(e.message);
      showToast(e.message, 'error');
    }
  }

  function renderIPData(d) {
    const fields = {
      'result-country':  `${d.country} (${d.countryCode})`,
      'result-region':    d.regionName,
      'result-city':      `${d.city} ${d.zip}`,
      'result-isp':       d.isp,
      'result-org':       d.org,
      'result-asn':       d.as,
      'result-timezone':  d.timezone,
      'result-latlon':    `${d.lat}, ${d.lon}`,
      'result-query':     d.query,
    };
    Object.entries(fields).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val || '—';
    });
    updateMap(d.lat, d.lon, d.city, d.country);
  }

  function initMap() {
    if (map) return;
    map = L.map('ipMap', { zoomControl: true }).setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);
  }

  function updateMap(lat, lon, city, country) {
    initMap();
    if (marker) map.removeLayer(marker);
    marker = L.marker([lat, lon])
      .addTo(map)
      .bindPopup(`<b>${city}</b><br>${country}`)
      .openPopup();
    map.flyTo([lat, lon], 10, { duration: 1.5 });
  }

  function setStatus(msg) {
    const el = document.getElementById('ipStatus');
    if (el) el.textContent = msg;
  }

  return { loadMyIP, lookupIP };
})();

document.addEventListener('DOMContentLoaded', DevIP.loadMyIP);
```

---

### 2.5 Whois 查询引擎 (`static/js/dev-whois.js`)

```javascript
const DevWhois = (() => {
  const HISTORY_KEY = 'whois_history';
  const MAX_HISTORY = 10;
  const TIMEOUT_MS  = 10000;

  async function lookup(domain) {
    if (!domain) domain = document.getElementById('whoisInput').value.trim();
    if (!domain) return;

    // 基础域名验证
    if (!/^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/.test(domain)
        && !/^\d{1,3}(\.\d{1,3}){3}$/.test(domain)) {
      showToast('Please enter a valid domain name.', 'error');
      return;
    }

    setLoadingState(true);
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const resp = await fetch(`/api/whois?domain=${encodeURIComponent(domain)}`, {
        signal: controller.signal
      });
      clearTimeout(timer);

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();

      renderStructured(data.parsed, domain);
      renderRaw(data.raw);
      saveHistory(domain);
    } catch (e) {
      const msg = e.name === 'AbortError' ? 'Request timed out.' : e.message;
      showToast(msg, 'error');
    } finally {
      setLoadingState(false);
    }
  }

  function renderStructured(parsed, domain) {
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val || '—';
    };
    set('whois-domain',      domain);
    set('whois-registrar',   parsed.registrar);
    set('whois-created',     formatDate(parsed.creationDate));
    set('whois-updated',     formatDate(parsed.updatedDate));
    set('whois-expires',     formatDate(parsed.expirationDate));
    set('whois-status',      Array.isArray(parsed.status) ? parsed.status.join(', ') : parsed.status);
    set('whois-nameservers', Array.isArray(parsed.nameServers) ? parsed.nameServers.join('\n') : parsed.nameServers);

    // 到期 Badge
    const badge = document.getElementById('whois-expiry-badge');
    if (badge && parsed.expirationDate) {
      badge.innerHTML = expiryBadge(parsed.expirationDate);
    }
  }

  function renderRaw(raw) {
    const el = document.getElementById('whoisRaw');
    if (el) el.textContent = raw || 'No raw data available.';
  }

  function expiryBadge(expiresAt) {
    const days = Math.floor((new Date(expiresAt) - Date.now()) / 86400000);
    if (days < 0)  return `<span class="badge badge--error">Expired</span>`;
    if (days < 30) return `<span class="badge badge--error">${days}d left</span>`;
    if (days < 90) return `<span class="badge badge--warning">${Math.round(days / 30)} mo left</span>`;
    return `<span class="badge badge--success">${Math.round(days / 365)} yr left</span>`;
  }

  function formatDate(d) {
    if (!d) return '—';
    return new Date(d).toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
  }

  function setLoadingState(loading) {
    const btn = document.getElementById('whoisBtn');
    if (btn) {
      btn.disabled = loading;
      btn.textContent = loading ? 'Looking up…' : 'Whois Lookup';
    }
  }

  function saveHistory(domain) {
    let hist = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    hist = [domain, ...hist.filter(d => d !== domain)].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
    renderHistory(hist);
  }

  function renderHistory(hist) {
    const el = document.getElementById('whoisHistory');
    if (!el) return;
    el.innerHTML = hist.map(d =>
      `<button class="history-tag" onclick="DevWhois.lookupFromHistory('${d}')">${d}</button>`
    ).join('');
  }

  function lookupFromHistory(domain) {
    document.getElementById('whoisInput').value = domain;
    lookup(domain);
  }

  function switchTab(tab) {
    ['structured', 'raw'].forEach(t => {
      const btn   = document.getElementById(`tab-${t}`);
      const panel = document.getElementById(`panel-${t}`);
      const active = t === tab;
      btn.setAttribute('aria-selected', String(active));
      panel.hidden = !active;
    });
  }

  // 初始化历史记录
  function init() {
    const hist = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    if (hist.length) renderHistory(hist);
  }

  return { lookup, lookupFromHistory, switchTab, init };
})();

document.addEventListener('DOMContentLoaded', DevWhois.init);
```

---

### 2.6 Word Counter 引擎 (`static/js/dev-word-counter.js`)

```javascript
const DevWordCounter = (() => {
  let worker = null;
  let chart  = null;
  const STATE = { debounceTimer: null };

  function init() {
    worker = new Worker('/static/js/workers/word-counter-worker.js');
    worker.onmessage = ({ data }) => renderStats(data);

    const ta = document.getElementById('wcInput');
    ta.addEventListener('input', () => {
      clearTimeout(STATE.debounceTimer);
      STATE.debounceTimer = setTimeout(() => worker.postMessage(ta.value), 200);
    });
  }

  function renderStats(stats) {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('stat-words',      stats.wordCount.toLocaleString());
    set('stat-chars',      stats.charCount.toLocaleString());
    set('stat-chars-ns',   stats.charNoSpace.toLocaleString());
    set('stat-sentences',  stats.sentences.toLocaleString());
    set('stat-paragraphs', stats.paragraphs.toLocaleString());
    set('stat-unique',     stats.uniqueWords.toLocaleString());
    set('stat-reading',    formatTime(stats.readingMin));
    set('stat-speaking',   formatTime(stats.speakingMin));
    set('stat-flesch',     stats.fleschScore);
    set('stat-level',      stats.fleschLevel);
    set('stat-avg-sent',   stats.avgSentenceLen);

    renderKeywordChart(stats.keywords);
    renderFlowHighlight(stats.flowData);
    updateFleschBar(stats.fleschScore);

    // numberPop 动画
    document.querySelectorAll('.stat-card__number').forEach(el => {
      el.classList.remove('stat-card__number--updated');
      void el.offsetWidth; // reflow
      el.classList.add('stat-card__number--updated');
    });
  }

  function renderKeywordChart(keywords) {
    const ctx = document.getElementById('kwChart');
    if (!ctx) return;
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: keywords.map(k => k.word),
        datasets: [{
          label: 'Count',
          data: keywords.map(k => k.count),
          backgroundColor: 'rgba(37, 99, 235, 0.6)',
          borderColor: 'rgba(37, 99, 235, 1)',
          borderWidth: 1,
        }]
      },
      options: {
        responsive: true,
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: { x: { beginAtZero: true } },
      }
    });
  }

  function updateFleschBar(score) {
    const fill = document.getElementById('fleschFill');
    if (fill) fill.style.width = `${Math.max(0, Math.min(100, score))}%`;
  }

  function renderFlowHighlight(flowData) {
    const bar = document.getElementById('flowBar');
    if (!bar) return;
    bar.innerHTML = flowData.map(n => {
      const cls = n <= 1 ? 'flow-1' : n <= 6 ? 'flow-6' : n <= 15 ? 'flow-15' :
                  n <= 25 ? 'flow-25' : n <= 39 ? 'flow-39' : 'flow-40';
      return `<div class="flow-seg ${cls}" title="${n} words" style="flex:${n}"></div>`;
    }).join('');
  }

  function formatTime(minutes) {
    if (minutes < 1) return `< 1 min`;
    const m = Math.floor(minutes);
    const s = Math.round((minutes - m) * 60);
    return s > 0 ? `${m} min ${s} sec` : `${m} min`;
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', DevWordCounter.init);
```

#### Web Worker 核心分析函数 (`static/js/workers/word-counter-worker.js`)

```javascript
// word-counter-worker.js — 在 Worker 线程中执行，不阻塞 UI

self.onmessage = ({ data: text }) => {
  self.postMessage(analyze(text));
};

function analyze(text) {
  if (!text || !text.trim()) return emptyStats();

  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const charCount = text.length;
  const charNoSpace = text.replace(/\s/g, '').length;
  const cjkCount = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length;

  // 句子（处理常见缩写避免误切）
  const sentences = text
    .split(/(?<![A-Z][a-z]\.|Dr\.|Mr\.|Ms\.|Mrs\.|etc\.|vs\.)[.!?]+/)
    .filter(s => s.trim().length > 0).length;

  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;

  const readingMin  = (wordCount + cjkCount / 2) / 238;
  const speakingMin = (wordCount + cjkCount / 2) / 130;

  const syllables = countSyllables(words);
  const avgSentenceLen = wordCount / Math.max(sentences, 1);
  const avgSyllablesPerWord = syllables / Math.max(wordCount, 1);
  const fleschScore = Math.round(206.835 - 1.015 * avgSentenceLen - 84.6 * avgSyllablesPerWord);
  const fleschLevel = getFleschLevel(Math.max(0, Math.min(100, fleschScore)));

  const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^a-z0-9]/g, ''))).size;

  // 关键词频率（去英文停用词）
  const stopWords = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with',
    'by','is','are','was','were','be','been','have','has','had','do','does','did','will','would',
    'could','should','may','might','it','this','that','they','we','you','he','she','i','my','your']);
  const freqMap = {};
  words.forEach(w => {
    const clean = w.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (clean.length > 2 && !stopWords.has(clean)) {
      freqMap[clean] = (freqMap[clean] || 0) + 1;
    }
  });
  const keywords = Object.entries(freqMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({ word, count, pct: (count / wordCount * 100).toFixed(1) }));

  const sentenceTexts = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const flowData = sentenceTexts.map(s => s.trim().split(/\s+/).length);

  return {
    wordCount, charCount, charNoSpace, cjkCount, sentences, paragraphs,
    readingMin, speakingMin,
    fleschScore: Math.max(0, Math.min(100, fleschScore)),
    fleschLevel, uniqueWords,
    avgSentenceLen: avgSentenceLen.toFixed(1),
    keywords, flowData
  };
}

function countSyllables(words) {
  return words.reduce((acc, word) => {
    const clean = word.toLowerCase().replace(/[^a-z]/g, '');
    if (!clean) return acc;
    const vowels = clean.match(/[aeiouy]+/g);
    let count = vowels ? vowels.length : 1;
    if (clean.endsWith('e') && count > 1) count--;
    return acc + Math.max(1, count);
  }, 0);
}

function getFleschLevel(score) {
  if (score >= 90) return 'Very Easy';
  if (score >= 80) return 'Easy';
  if (score >= 70) return 'Fairly Easy';
  if (score >= 60) return 'Standard';
  if (score >= 50) return 'Fairly Difficult';
  if (score >= 30) return 'Difficult';
  return 'Very Confusing';
}

function emptyStats() {
  return {
    wordCount: 0, charCount: 0, charNoSpace: 0, cjkCount: 0,
    sentences: 0, paragraphs: 0, readingMin: 0, speakingMin: 0,
    fleschScore: 0, fleschLevel: '—', uniqueWords: 0,
    avgSentenceLen: '0', keywords: [], flowData: []
  };
}
```

---

## 3. UI 事件绑定说明

| 事件 | 元素 | 实现要点 |
|------|------|---------|
| `dragover` | drop-zone | `e.preventDefault()` 阻止默认；添加 hover 类 |
| `dragleave` | drop-zone | 用 `getBoundingClientRect` 判断鼠标是否真正离开，排除子元素触发 |
| `drop` | drop-zone | `e.preventDefault()`；`e.dataTransfer.files[0]` 取文件 |
| `input` | textarea | 300ms 防抖；更新行号；触发实时计算 |
| `change` | options checkboxes | 立即重新计算，无防抖 |
| `input` | HMAC key | 与文本 input 共享 300ms 防抖 |
| `click` | FAQ question button | `toggleFAQ(i)`：切换 `hidden`、更新 `aria-expanded`、旋转 chevron |
| `keydown` | drop-zone | Enter/Space 触发 `fileInput.click()` |
| `click` | copy buttons | `navigator.clipboard.writeText`；按钮状态 1.5s 后恢复 |
| `input` | word-counter textarea | 200ms 防抖；通过 Worker.postMessage 异步计算 |

---

## 4. 验收标准 Checklist

### 处理正确性
- [ ] MD5("hello") = 5d41402abc4b2a76b9719d911017c592
- [ ] SHA-256("hello") = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
- [ ] Base64("Hello World") = SGVsbG8gV29ybGQ=
- [ ] Base64URL 结果不含 +/= 字符
- [ ] encodeURIComponent(" ") = %20（不是 +）
- [ ] URL decode("%E4%B8%AD%E6%96%87") = "中文"
- [ ] HMAC-SHA256("hello", "secret") 结果与 CryptoJS 标准实现一致
- [ ] Word count for "Hello World" = 2
- [ ] 空输入不触发计算，清空显示"—"

### 性能
- [ ] 文本 hash 计算（1KB 以内）< 50ms
- [ ] 10MB 文件 hash 计算 < 3s
- [ ] Word counter Web Worker 不阻塞 UI 滚动
- [ ] Base64 编码 1MB 文本 < 500ms
- [ ] IP 查询首次响应 < 2s（网络正常）

### 内存安全
- [ ] Base64 下载后 60s 内 `URL.revokeObjectURL` 被调用
- [ ] Hash 下载后 60s 内 `URL.revokeObjectURL` 被调用
- [ ] FileReader 读取后 ArrayBuffer 在 `clearInput` 后置为 null
- [ ] Chart.js 图表在重新渲染前调用 `chart.destroy()`

### 下载
- [ ] Hash 下载 .txt 内容包含所有已计算算法名称和值
- [ ] Base64 下载 .txt 包含完整输出内容
- [ ] 文件名无特殊字符，在 Windows/macOS/Linux 均可保存

### 边界情况
- [ ] 超长单行文字（> 100KB）不溢出卡片
- [ ] 2GB 文件选择时显示 toast 错误，不崩溃
- [ ] Base64 decode 传入非 Base64 字符串时显示 toast 错误
- [ ] URL decode 传入非法序列（如 %GG）时显示 toast 错误
- [ ] IP 查询传入 localhost/127.0.0.1 时正确显示错误
- [ ] Whois 查询传入未注册域名时显示"域名未注册"而非崩溃
- [ ] Word counter 输入纯中文文字时正确计算字符数
- [ ] Whois 查询超时 10s 后显示"Request timed out."
