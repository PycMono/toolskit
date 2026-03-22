/* ============================================
   Tool Box Nova - Proxy JS
   ============================================ */

function visitProxy() {
  let url = document.getElementById('proxyUrl').value.trim();
  if (!url) { showToast('Please enter a URL'); return; }
  if (!url.startsWith('http')) url = 'https://' + url;

  const encrypt = document.getElementById('optEncrypt').checked;
  const disableScripts = document.getElementById('optDisableScripts').checked;
  const blockAds = document.getElementById('optBlockAds').checked;
  const node = document.getElementById('proxyNode').value;

  const resultDiv = document.getElementById('proxyResult');
  const resultUrl = document.getElementById('proxyResultUrl');
  const frame = document.getElementById('proxyFrame');

  // Show loading state
  resultDiv.style.display = 'block';
  resultUrl.textContent = '🔄 Loading: ' + url;
  frame.srcdoc = '<div style="display:flex;align-items:center;justify-content:center;height:200px;font-family:sans-serif;color:#94a3b8;">Loading...</div>';

  fetch('/api/proxy/fetch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, encrypt, disable_scripts: disableScripts, block_ads: blockAds, node }),
  })
    .then(r => r.json())
    .then(data => {
      if (data.error) {
        frame.srcdoc = `<div style="display:flex;align-items:center;justify-content:center;height:200px;font-family:sans-serif;color:#ef4444;padding:20px;text-align:center;">Error: ${data.error}</div>`;
        resultUrl.textContent = '❌ Failed: ' + url;
        return;
      }
      resultUrl.textContent = '✅ Proxy: ' + (data.url || url);
      frame.srcdoc = data.html || '';
      // Scroll to result
      resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    })
    .catch(err => {
      frame.srcdoc = `<div style="display:flex;align-items:center;justify-content:center;height:200px;font-family:sans-serif;color:#ef4444;padding:20px;text-align:center;">Network error. Please try again.</div>`;
      resultUrl.textContent = '❌ Error';
    });
}

function quickVisit(domain) {
  document.getElementById('proxyUrl').value = domain;
  visitProxy();
}

function closeProxy() {
  const resultDiv = document.getElementById('proxyResult');
  const frame = document.getElementById('proxyFrame');
  if (resultDiv) resultDiv.style.display = 'none';
  if (frame) frame.srcdoc = '';
}

// Load stats
function loadProxyStats() {
  fetch('/api/proxy/stats')
    .then(r => r.json())
    .then(d => {
      const reqEl = document.getElementById('todayRequests');
      const nodesEl = document.getElementById('availableNodes');
      if (reqEl) reqEl.textContent = d.today_requests ? d.today_requests.toLocaleString() : '-';
      if (nodesEl) nodesEl.textContent = d.available_nodes || '-';
    })
    .catch(() => {});
}

window.addEventListener('DOMContentLoaded', function () {
  if (document.getElementById('proxyUrl')) {
    loadProxyStats();
  }
});

