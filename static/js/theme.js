/* ================================================================
   Tool Box Nova — Theme Switcher  (standalone, Cloudflare-safe)
   ================================================================ */
(function () {
  var THEMES = ['light', 'dark', 'forest', 'ocean', 'sunset'];
  var ICONS  = { light: '☀️', dark: '🌙', forest: '🌿', ocean: '🌊', sunset: '🌅' };

  /* ── Apply theme ── */
  function applyTheme(name) {
    if (THEMES.indexOf(name) < 0) name = 'light';
    document.documentElement.setAttribute('data-theme', name);
    localStorage.setItem('tbn-theme', name);
    var ic = document.getElementById('navThemeIcon');
    if (ic) ic.textContent = ICONS[name];
    // Mark active button
    document.querySelectorAll('.nav-theme-opt').forEach(function (b) {
      b.classList.toggle('active', b.dataset.theme === name);
    });
    closeThemeMenu();
    // Sync humanizer icons if present
    var sunIcon  = document.getElementById('ah-icon-sun');
    var moonIcon = document.getElementById('ah-icon-moon');
    if (sunIcon && moonIcon) {
      sunIcon.style.display  = (name === 'dark') ? 'none' : '';
      moonIcon.style.display = (name === 'dark') ? ''     : 'none';
    }
  }

  /* ── Close menu — use inline style (Cloudflare CSS-safe) ── */
  function closeThemeMenu() {
    var sw = document.getElementById('navThemeSwitcher');
    if (sw) sw.classList.remove('open');
    var dd = document.getElementById('navThemeDropdown');
    if (dd) dd.style.display = 'none';
  }

  /* ── Open/close toggle ── */
  function toggleThemeMenu(e) {
    e.stopPropagation();
    var sw = document.getElementById('navThemeSwitcher');
    var dd = document.getElementById('navThemeDropdown');
    if (!sw || !dd) return;
    var isOpen = dd.style.display === 'block';
    // Close lang dropdown if open
    document.querySelectorAll('.lang-switcher').forEach(function (s) {
      s.classList.remove('open');
      var d = s.querySelector('.lang-dropdown');
      if (d) d.style.display = 'none';
    });
    if (isOpen) {
      closeThemeMenu();
    } else {
      sw.classList.add('open');
      dd.style.display = 'block';
    }
  }

  /* ── Expose globally ── */
  window.applyTheme = applyTheme;

  /* ── Init on DOM ready ── */
  function init() {
    var saved = localStorage.getItem('tbn-theme');
    if (!saved || THEMES.indexOf(saved) < 0) saved = 'light';
    // Apply without closing menu (init only)
    document.documentElement.setAttribute('data-theme', saved);
    localStorage.setItem('tbn-theme', saved);
    var ic = document.getElementById('navThemeIcon');
    if (ic) ic.textContent = ICONS[saved];
    document.querySelectorAll('.nav-theme-opt').forEach(function (b) {
      b.classList.toggle('active', b.dataset.theme === saved);
    });

    // Force dropdown hidden via inline style (Cloudflare-safe — CSS rule may be stripped)
    var dd = document.getElementById('navThemeDropdown');
    if (dd) dd.style.display = 'none';

    var btn = document.getElementById('navThemeBtn');
    if (btn) btn.addEventListener('click', toggleThemeMenu);

    // Close on outside click
    document.addEventListener('click', function (e) {
      var target = e.target;
      var inside = false;
      while (target) {
        if (target.id === 'navThemeSwitcher') { inside = true; break; }
        target = target.parentElement;
      }
      if (!inside) closeThemeMenu();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
