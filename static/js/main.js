/* ============================================
   Tool Box Nova - Main JS
   ============================================ */

// ---- Toast Notification ----
function showToast(msg, duration = 2000) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

// ---- Language Switch ----
function switchLang(lang) {
  const url = new URL(window.location.href);
  url.searchParams.set('lang', lang);
  window.location.href = url.toString();
}

// ---- Navbar Search ----
const navSearchInput = document.getElementById('navSearch');
const navSearchResults = document.getElementById('navSearchResults');
let searchTimer;

if (navSearchInput) {
  navSearchInput.addEventListener('input', function () {
    clearTimeout(searchTimer);
    const q = this.value.trim();
    if (!q) { navSearchResults.classList.remove('show'); return; }
    searchTimer = setTimeout(() => doNavSearch(q), 250);
  });

  navSearchInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      const first = navSearchResults.querySelector('.search-result-item');
      if (first) window.location.href = first.href;
    }
    if (e.key === 'Escape') {
      navSearchResults.classList.remove('show');
      this.blur();
    }
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav-search-wrap')) {
      navSearchResults.classList.remove('show');
    }
  });
}

function doNavSearch(q) {
  const lang = document.cookie.match(/lang=(\w+)/)?.[1] || 'zh';
  fetch(`/api/search?q=${encodeURIComponent(q)}`)
    .then(r => r.json())
    .then(data => {
      if (!data.results || data.results.length === 0) {
        navSearchResults.classList.remove('show');
        return;
      }
      navSearchResults.innerHTML = data.results.map(r => `
        <a href="${r.url}?lang=${lang}" class="search-result-item">
          <strong>${lang === 'zh' ? r.name_zh : r.name_en}</strong>
          <span>${r.description}</span>
        </a>
      `).join('');
      navSearchResults.classList.add('show');
    })
    .catch(() => {});
}

// ---- Force lang dropdown hidden on load (Cloudflare-proof) ----
// We set inline style display:none so Cloudflare CSS minification can never override it.
(function() {
  function hideDropdowns() {
    document.querySelectorAll('.lang-dropdown').forEach(function(el) {
      el.style.display = 'none';
    });
  }
  hideDropdowns();
  // Also run after DOM ready in case elements are added late
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hideDropdowns);
  }
})();

// ---- Lang Dropdown Toggle ----
document.querySelectorAll('.lang-switcher').forEach(function(switcher) {
  var dropdown = switcher.querySelector('.lang-dropdown');
  var btn = switcher.querySelector('.lang-btn');
  if (!btn || !dropdown) return;

  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    var isOpen = dropdown.style.display === 'block';
    // Close all dropdowns first
    document.querySelectorAll('.lang-dropdown').forEach(function(d) { d.style.display = 'none'; });
    document.querySelectorAll('.lang-switcher').forEach(function(s) { s.classList.remove('open'); });
    if (!isOpen) {
      dropdown.style.display = 'block';
      switcher.classList.add('open');
    }
  });
});
document.addEventListener('click', function(e) {
  if (!e.target.closest('.lang-switcher')) {
    document.querySelectorAll('.lang-dropdown').forEach(function(d) { d.style.display = 'none'; });
    document.querySelectorAll('.lang-switcher').forEach(function(s) { s.classList.remove('open'); });
  }
});

// ---- Mobile Menu ----
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

if (hamburger) {
  hamburger.addEventListener('click', function (e) {
    e.stopPropagation();
    navMenu.classList.toggle('open');
    hamburger.textContent = navMenu.classList.contains('open') ? '✕' : '☰';
  });
}

// ---- Nav Dropdown (mobile: click toggle; desktop: CSS hover handles it) ----
document.querySelectorAll('.nav-item.has-dropdown > .nav-link').forEach(function (trigger) {
  trigger.addEventListener('click', function (e) {
    // Only intercept on mobile; desktop uses CSS :hover
    if (window.innerWidth > 768) return;
    e.preventDefault();
    const item = trigger.closest('.nav-item');
    const isOpen = item.classList.contains('open');
    // Close all other dropdowns
    document.querySelectorAll('.nav-item.has-dropdown').forEach(function (i) {
      i.classList.remove('open');
    });
    if (!isOpen) item.classList.add('open');
  });
});

// ---- Highlight active nav item based on current path ----
(function () {
  const path = window.location.pathname;
  document.querySelectorAll('.dropdown-item').forEach(function (a) {
    try {
      const itemPath = new URL(a.href).pathname;
      if (itemPath === path) {
        a.classList.add('active');
        a.closest('.nav-item')?.classList.add('active');
      }
    } catch (_) {}
  });
})();

// ---- Close mobile menu / dropdowns when clicking outside ----
document.addEventListener('click', function (e) {
  if (!e.target.closest('.nav-item.has-dropdown')) {
    document.querySelectorAll('.nav-item.has-dropdown').forEach(function (i) {
      i.classList.remove('open');
    });
  }
  if (!e.target.closest('#navMenu') && !e.target.closest('#hamburger')) {
    navMenu?.classList.remove('open');
    if (hamburger) hamburger.textContent = '☰';
  }
});

