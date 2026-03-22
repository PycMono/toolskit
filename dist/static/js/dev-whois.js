// dev-whois.js — Whois Domain Lookup Engine

const DevWhois = (() => {
  const HISTORY_KEY = 'whois_history';
  const MAX_HISTORY = 10;
  const TIMEOUT_MS  = 10000;

  async function lookup(domain) {
    if (!domain) {
      const inp = document.getElementById('whoisInput');
      domain = inp ? inp.value.trim() : '';
    }
    if (!domain) return;

    // Basic domain validation
    const isDomain = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/.test(domain);
    const isIPv4   = /^\d{1,3}(\.\d{1,3}){3}$/.test(domain);
    if (!isDomain && !isIPv4) {
      showDevToast('Please enter a valid domain name.', 'error');
      return;
    }

    setLoadingState(true);
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const resp = await fetch('/api/whois?domain=' + encodeURIComponent(domain), {
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const data = await resp.json();

      showResults();
      renderStructured(data.parsed, domain);
      renderRaw(data.raw);
      saveHistory(domain);
    } catch (e) {
      const msg = e.name === 'AbortError' ? 'Request timed out.' : e.message;
      showDevToast(msg, 'error');
    } finally {
      setLoadingState(false);
    }
  }

  function showResults() {
    const res  = document.getElementById('whoisResults');
    const ph   = document.getElementById('whoisPlaceholder');
    if (res) res.style.display = 'block';
    if (ph)  ph.style.display  = 'none';
  }

  function renderStructured(parsed, domain) {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || '—'; };
    set('whois-domain-label', domain);
    set('whois-registrar',    parsed.registrar);
    set('whois-created',      formatDate(parsed.creationDate));
    set('whois-updated',      formatDate(parsed.updatedDate));

    const expiresEl = document.getElementById('whois-expires');
    if (expiresEl) expiresEl.textContent = formatDate(parsed.expirationDate);

    const badge = document.getElementById('whois-expiry-badge');
    if (badge && parsed.expirationDate) badge.innerHTML = expiryBadge(parsed.expirationDate);

    const statusArr = Array.isArray(parsed.status) ? parsed.status : (parsed.status ? [parsed.status] : []);
    set('whois-status', statusArr.join('\n'));

    const nsArr = Array.isArray(parsed.nameServers) ? parsed.nameServers : (parsed.nameServers ? [parsed.nameServers] : []);
    set('whois-nameservers', nsArr.join('\n'));
  }

  function renderRaw(raw) {
    const el = document.getElementById('whoisRaw');
    if (el) el.textContent = raw || 'No raw data available.';
  }

  function expiryBadge(expiresAt) {
    const days = Math.floor((new Date(expiresAt) - Date.now()) / 86400000);
    if (days < 0)  return '<span class="badge badge--error">Expired</span>';
    if (days < 30) return '<span class="badge badge--error">' + days + 'd left</span>';
    if (days < 90) return '<span class="badge badge--warning">' + Math.round(days / 30) + ' mo left</span>';
    return '<span class="badge badge--success">' + Math.round(days / 365) + ' yr left</span>';
  }

  function formatDate(d) {
    if (!d) return '—';
    try {
      return new Date(d).toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    } catch (_) { return d; }
  }

  function setLoadingState(loading) {
    const btn = document.getElementById('whoisBtn');
    if (btn) {
      btn.disabled    = loading;
      btn.textContent = loading ? 'Looking up…' : 'Whois Lookup';
    }
  }

  function saveHistory(domain) {
    let hist = [];
    try { hist = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch (_) {}
    hist = [domain, ...hist.filter(d => d !== domain)].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
    renderHistory(hist);
  }

  function renderHistory(hist) {
    const el = document.getElementById('whoisHistory');
    if (!el) return;
    el.innerHTML = hist.map(d =>
      '<button class="history-tag" onclick="DevWhois.lookupFromHistory(\'' + d.replace(/'/g, "\\'") + '\')">' + d + '</button>'
    ).join('');
  }

  function lookupFromHistory(domain) {
    const inp = document.getElementById('whoisInput');
    if (inp) inp.value = domain;
    lookup(domain);
  }

  function switchTab(tab) {
    ['structured', 'raw'].forEach(t => {
      const btn   = document.getElementById('tab-' + t);
      const panel = document.getElementById('panel-' + t);
      const active = t === tab;
      if (btn)   btn.setAttribute('aria-selected', String(active));
      if (panel) panel.hidden = !active;
    });
  }

  function init() {
    let hist = [];
    try { hist = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch (_) {}
    if (hist.length) renderHistory(hist);
    // Set default tab state
    switchTab('structured');
  }

  return { lookup, lookupFromHistory, switchTab, init };
})();

document.addEventListener('DOMContentLoaded', () => DevWhois.init());

