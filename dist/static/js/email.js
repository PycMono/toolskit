/* ============================================
   Tool Box Nova - Temp Email JS
   ============================================ */

let currentAddress = '';
let pollTimer;
const POLL_INTERVAL = 15000;
let messages = [];

function updateStatus(ready) {
  const dot = document.querySelector('.status-dot');
  const text = document.getElementById('emailStatusText');
  if (!dot || !text) return;
  if (ready) {
    dot.className = 'status-dot ready';
    text.textContent = '✅ Ready';
  } else {
    dot.className = 'status-dot loading';
    text.textContent = '⟳ Loading...';
  }
}

function createEmail() {
  updateStatus(false);
  const addrInput = document.getElementById('emailAddress');
  if (addrInput) addrInput.value = '';

  fetch('/api/email/create', { method: 'POST' })
    .then(r => r.json())
    .then(data => {
      currentAddress = data.address;
      if (addrInput) addrInput.value = currentAddress;
      updateStatus(true);
      startPolling();
    })
    .catch(() => {
      // fallback
      currentAddress = randomPrefix() + '@tempmail.dev';
      if (addrInput) addrInput.value = currentAddress;
      updateStatus(true);
      startPolling();
    });
}

function randomPrefix() {
  return Math.random().toString(36).substring(2, 10);
}

function copyEmail() {
  if (currentAddress) {
    navigator.clipboard.writeText(currentAddress);
    showToast('Email address copied!');
  }
}

function changeEmail() {
  stopPolling();
  messages = [];
  renderMessages();
  createEmail();
}

function setCustomEmail() {
  const prefix = document.getElementById('customPrefix').value.trim();
  if (!prefix) { showToast('Enter a prefix first'); return; }
  updateStatus(false);
  stopPolling();
  messages = [];
  renderMessages();

  fetch('/api/email/custom', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefix }),
  })
    .then(r => r.json())
    .then(data => {
      currentAddress = data.address;
      document.getElementById('emailAddress').value = currentAddress;
      updateStatus(true);
      startPolling();
    })
    .catch(() => {
      currentAddress = prefix + '@tempmail.dev';
      document.getElementById('emailAddress').value = currentAddress;
      updateStatus(true);
      startPolling();
    });
}

function destroyEmail() {
  stopPolling();
  if (currentAddress) {
    fetch(`/api/email/destroy/${encodeURIComponent(currentAddress)}`, { method: 'DELETE' }).catch(() => {});
  }
  messages = [];
  renderMessages();
  createEmail();
}

function refreshInbox() {
  if (!currentAddress) return;
  fetch(`/api/email/messages/${encodeURIComponent(currentAddress)}`)
    .then(r => r.json())
    .then(data => {
      const newMsgs = data.messages || [];
      const prevCount = messages.length;
      messages = newMsgs;
      renderMessages();
      if (messages.length > prevCount && prevCount > 0) {
        // New mail notification
        notifyNewMail();
      }
    })
    .catch(() => {});
}

function clearInbox() {
  messages = [];
  renderMessages();
}

function notifyNewMail() {
  showToast('📧 New email received!', 3000);
  // Title flicker
  let flickers = 0;
  const origTitle = document.title;
  const timer = setInterval(() => {
    document.title = flickers % 2 === 0 ? '📧 New Mail!' : origTitle;
    flickers++;
    if (flickers > 8) { clearInterval(timer); document.title = origTitle; }
  }, 500);
}

function renderMessages() {
  const waiting = document.getElementById('emailWaiting');
  const container = document.getElementById('emailMessages');
  if (!waiting || !container) return;

  if (!messages || messages.length === 0) {
    waiting.style.display = 'flex';
    container.innerHTML = '';
  } else {
    waiting.style.display = 'none';
    container.innerHTML = messages.map((m, i) => `
      <div class="email-message-card">
        <div class="email-msg-header" onclick="toggleMsg(${i})">
          <div>
            <div class="email-msg-from">${m.from || 'Unknown Sender'}</div>
            <div class="email-msg-subject">${m.subject || '(No Subject)'}</div>
          </div>
          <div class="email-msg-time">${m.received_at || ''}</div>
        </div>
        <div class="email-msg-body" id="msgBody${i}">
          <pre style="white-space:pre-wrap;font-family:inherit;font-size:13px;">${m.body || m.content || ''}</pre>
        </div>
      </div>
    `).join('');
  }
}

function toggleMsg(i) {
  const body = document.getElementById(`msgBody${i}`);
  if (body) body.classList.toggle('expanded');
}

function startPolling() {
  stopPolling();
  pollTimer = setInterval(refreshInbox, POLL_INTERVAL);
  refreshInbox();
}

function stopPolling() {
  clearInterval(pollTimer);
}

// Load stats
function loadStats() {
  fetch('/api/email/stats')
    .then(r => r.json())
    .then(d => {
      const todayEl = document.getElementById('todayCreated');
      const spamEl = document.getElementById('spamIntercepted');
      if (todayEl) todayEl.textContent = d.today_created || '-';
      if (spamEl) spamEl.textContent = d.spam_intercepted || '-';
    })
    .catch(() => {});
}

window.addEventListener('DOMContentLoaded', function () {
  if (document.getElementById('emailAddress')) {
    createEmail();
    loadStats();
  }
});

