// dev-ip.js — IP Lookup Engine (Leaflet + ip-api.com + ipify)

const DevIP = (() => {
  let map    = null;
  let marker = null;

  async function loadMyIP() {
    setStatus('Detecting your IP…');
    try {
      const r4   = await fetch('https://api.ipify.org?format=json');
      const { ip: ipv4 } = await r4.json();
      const v4El = document.getElementById('myIPv4');
      if (v4El) v4El.textContent = ipv4;

      // IPv6 (optional, may fail silently)
      try {
        const r6 = await fetch('https://api64.ipify.org?format=json');
        const { ip: ipv6 } = await r6.json();
        if (ipv6 !== ipv4) {
          const v6El = document.getElementById('myIPv6');
          if (v6El) v6El.textContent = '(' + ipv6 + ')';
        }
      } catch (_) {}

      // Pre-fill input
      const inp = document.getElementById('ipInput');
      if (inp && !inp.value) inp.value = ipv4;

      await lookupIP(ipv4);
    } catch (e) {
      setStatus('Could not detect IP.');
      showDevToast('Failed to get your IP.', 'error');
    }
  }

  async function lookupIP(ip) {
    if (!ip) ip = (document.getElementById('ipInput') || {}).value || '';
    ip = ip.trim();
    if (!ip) { await loadMyIP(); return; }

    setStatus('Looking up ' + ip + '…');
    const fields = 'status,message,country,countryCode,regionName,city,zip,lat,lon,timezone,isp,org,as,query';
    try {
      const resp = await fetch('https://pro.ip-api.com/json/' + encodeURIComponent(ip) + '?fields=' + fields + '&key=');
      const data = await resp.json();
      if (data.status === 'fail') {
        // Try free endpoint
        const resp2 = await fetch('http://ip-api.com/json/' + encodeURIComponent(ip) + '?fields=' + fields);
        const data2 = await resp2.json();
        if (data2.status === 'fail') throw new Error(data2.message || 'Lookup failed');
        renderIPData(data2);
      } else {
        renderIPData(data);
      }
      setStatus('');
    } catch (e) {
      setStatus(e.message);
      showDevToast(e.message, 'error');
    }
  }

  function renderIPData(d) {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || '—'; };
    set('result-country',  d.country + (d.countryCode ? ' (' + d.countryCode + ')' : ''));
    set('result-region',   d.regionName);
    set('result-city',     d.city + (d.zip ? ' ' + d.zip : ''));
    set('result-isp',      d.isp || d.org);
    set('result-asn',      d.as);
    set('result-timezone', d.timezone);
    set('result-latlon',   d.lat + ', ' + d.lon);
    if (d.lat && d.lon) updateMap(d.lat, d.lon, d.city, d.country);
  }

  function initMap() {
    if (map) return;
    const mapEl = document.getElementById('ipMap');
    if (!mapEl || typeof L === 'undefined') return;
    map = L.map('ipMap', { zoomControl: true }).setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);
  }

  function updateMap(lat, lon, city, country) {
    initMap();
    if (!map) return;
    if (marker) map.removeLayer(marker);
    marker = L.marker([lat, lon])
      .addTo(map)
      .bindPopup('<b>' + (city || '') + '</b><br>' + (country || ''))
      .openPopup();
    map.flyTo([lat, lon], 10, { duration: 1.5 });
  }

  function setStatus(msg) {
    const el = document.getElementById('ipStatus');
    if (el) el.textContent = msg;
  }

  return { loadMyIP, lookupIP };
})();

document.addEventListener('DOMContentLoaded', () => DevIP.loadMyIP());

