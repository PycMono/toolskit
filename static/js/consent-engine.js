/**
 * consent-engine.js
 * Minimal Cookie Consent Bar + Google Consent Mode v2
 * Zero external dependencies.
 */
(function () {
  'use strict';

  /* ── Config ─────────────────────────────────────────────────── */
  var CFG = window.CKY_CONFIG || {
    cookieName:  'cky_consent',
    gaEnabled:   false,
    gaId:        '',
    adsEnabled:  false,
    hasDecision: false,
    analytics:   'denied',
    ads:         'denied'
  };

  var COOKIE_MAX_AGE = 365 * 24 * 3600;
  var COOKIE_NAME    = CFG.cookieName || 'cky_consent';

  /* ── State ──────────────────────────────────────────────────── */
  var state = {
    analytics: CFG.analytics || 'denied',
    ads:       CFG.ads       || 'denied',
    decided:   !!CFG.hasDecision
  };

  /* ── Cookie helpers ─────────────────────────────────────────── */
  function saveConsentCookie(analytics, ads) {
    var val = 'necessary:granted,analytics:' + analytics + ',ads:' + ads;
    var exp = new Date(Date.now() + COOKIE_MAX_AGE * 1000).toUTCString();
    document.cookie = [
      COOKIE_NAME + '=' + encodeURIComponent(val),
      'max-age=' + COOKIE_MAX_AGE,
      'expires=' + exp,
      'path=/',
      'SameSite=Lax'
    ].join('; ');
  }

  function readConsentCookie() {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var c = cookies[i].trim();
      if (c.indexOf(COOKIE_NAME + '=') === 0) {
        var raw = decodeURIComponent(c.slice(COOKIE_NAME.length + 1));
        var r   = { analytics: 'denied', ads: 'denied' };
        raw.split(',').forEach(function (part) {
          var idx = part.indexOf(':');
          if (idx < 0) return;
          var k = part.slice(0, idx).trim();
          var v = part.slice(idx + 1).trim();
          if (k === 'analytics') r.analytics = v;
          if (k === 'ads')       r.ads       = v;
        });
        return r;
      }
    }
    return null;
  }

  /* ── Consent Mode v2 ────────────────────────────────────────── */
  function updateConsentMode(analytics, ads) {
    if (typeof gtag !== 'function') return;
    gtag('consent', 'update', {
      ad_storage:            ads,
      ad_user_data:          ads,
      ad_personalization:    ads,
      analytics_storage:     analytics,
      functionality_storage: 'granted',
      security_storage:      'granted'
    });
  }

  /* ── GA dynamic load ────────────────────────────────────────── */
  var gaLoaded = false;
  function loadGA() {
    if (!CFG.gaEnabled || !CFG.gaId) return;
    if (gaLoaded) { if (typeof gtag === 'function') gtag('event', 'page_view'); return; }
    gaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src   = 'https://www.googletagmanager.com/gtag/js?id=' + CFG.gaId;
    document.head.appendChild(s);
  }

  /* ── DOM refs ───────────────────────────────────────────────── */
  var banner, modal, toast;

  function getDom() {
    banner = document.getElementById('cky-banner');
    modal  = document.getElementById('cky-modal');
    toast  = document.getElementById('cky-toast');
  }

  /* ── Banner ─────────────────────────────────────────────────── */
  function hideBanner() {
    if (!banner) return;
    banner.style.transition = 'opacity 0.22s, transform 0.22s';
    banner.style.opacity    = '0';
    banner.style.transform  = 'translateY(100%)';
    setTimeout(function () { banner.style.display = 'none'; }, 240);
  }

  /* ── Modal  (uses display:none — NOT hidden attribute) ──────── */
  function openModal() {
    if (!modal) return;
    // Sync toggles to current state
    var ana = document.getElementById('cky-toggle-analytics');
    var ads = document.getElementById('cky-toggle-ads');
    if (ana) ana.checked = (state.analytics === 'granted');
    if (ads) ads.checked = (state.ads       === 'granted');

    modal.style.display = 'flex';
    document.body.classList.add('cky-modal-open');
    document.addEventListener('keydown', onModalKey);

    // Focus first close/action button
    setTimeout(function () {
      var btn = modal.querySelector('.cky-modal__close');
      if (btn) btn.focus();
    }, 50);
  }

  function closeModal() {
    if (!modal) return;
    modal.style.display = 'none';
    document.body.classList.remove('cky-modal-open');
    document.removeEventListener('keydown', onModalKey);
  }

  function onModalKey(e) {
    if (e.key === 'Escape') closeModal();
  }

  /* ── Toast ──────────────────────────────────────────────────── */
  function showToast() {
    if (!toast) return;
    toast.hidden = false;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { toast.classList.add('cky-toast--show'); });
    });
    setTimeout(function () {
      toast.classList.remove('cky-toast--show');
      setTimeout(function () { toast.hidden = true; }, 240);
    }, 2500);
  }

  /* ── Core consent ───────────────────────────────────────────── */
  function applyConsent(analytics, ads) {
    state.analytics = analytics;
    state.ads       = ads;
    state.decided   = true;
    saveConsentCookie(analytics, ads);
    updateConsentMode(analytics, ads);
    if (analytics === 'granted') loadGA();
    hideBanner();
    closeModal();
    showToast();
  }

  function acceptAll()      { applyConsent('granted', 'granted'); }
  function rejectAll()      { applyConsent('denied',  'denied');  }
  function savePreferences() {
    var ana = document.getElementById('cky-toggle-analytics');
    var ads = document.getElementById('cky-toggle-ads');
    applyConsent(
      (ana && ana.checked) ? 'granted' : 'denied',
      (ads && ads.checked) ? 'granted' : 'denied'
    );
  }

  /* ── Footer "manage preferences" button ─────────────────────── */
  function bindReopenBtn() {
    var btn = document.getElementById('cky-reopen-btn');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      openModal();
    });
  }

  /* ── Init ───────────────────────────────────────────────────── */
  function init() {
    getDom();
    bindReopenBtn();

    if (CFG.hasDecision) {
      updateConsentMode(CFG.analytics, CFG.ads);
      if (CFG.analytics === 'granted') loadGA();
      return;
    }

    // CDN-cache fallback
    var existing = readConsentCookie();
    if (existing) {
      state.analytics = existing.analytics;
      state.ads       = existing.ads;
      state.decided   = true;
      updateConsentMode(existing.analytics, existing.ads);
      if (existing.analytics === 'granted') loadGA();
      if (banner) banner.style.display = 'none';
    }
  }

  /* ── Public API ─────────────────────────────────────────────── */
  window.CKY = {
    acceptAll:       acceptAll,
    rejectAll:       rejectAll,
    openModal:       openModal,
    closeModal:      closeModal,
    savePreferences: savePreferences
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
