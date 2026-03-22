'use strict';
// json-home.js — search filter + recent tools

function filterTools(query) {
  const q = (query || '').trim().toLowerCase();
  document.querySelectorAll('.jt-tool-card').forEach(card => {
    card.style.display = (!q || card.textContent.toLowerCase().includes(q)) ? '' : 'none';
  });
  document.querySelectorAll('.jt-tool-group').forEach(group => {
    const visible = [...group.querySelectorAll('.jt-tool-card')].some(c => c.style.display !== 'none');
    group.style.display = visible ? '' : 'none';
  });
}

function loadRecentTools() {
  try {
    const recent = JSON.parse(localStorage.getItem('jt_recent_tools') || '[]');
    if (recent.length === 0) return;
    const container = document.getElementById('recentList');
    const section   = document.getElementById('recentTools');
    if (!container || !section) return;
    container.innerHTML = recent.map(t =>
      `<a class="jt-recent-chip" href="/json/${t.key}"><span>${t.icon}</span>${t.name}</a>`
    ).join('');
    section.style.display = 'block';
  } catch(e) {}
}

document.addEventListener('DOMContentLoaded', loadRecentTools);

