/**
 * consent-engine.js
 * Cookie Consent Engine + Google Consent Mode v2 integration
 * Zero external dependencies. Works with server-injected window.CKY_CONFIG.
 */
(function () {
  'use strict';

  /* ── Configuration (injected by Go template via window.CKY_CONFIG) ── */
  var CFG = window.CKY_CONFIG || {
    cookieName:  'cky_consent',
    gaEnabled:   false,
    gaId:        '',
    adsEnabled:  false,
    hasDecision: false,
    analytics:   'denied',
    ads:         'denied'
  };

  var COOKIE_MAX_AGE = 365 * 24 * 3600; // 1 year in seconds
  var COOKIE_NAME    = CFG.cookieName || 'cky_consent';

  /* ── State ─────────────────────────────────────────────────────────── */
  var state = {
    analytics: CFG.analytics || 'denied',
    ads:       CFG.ads       || 'denied',
    decided:   !!CFG.hasDecision
  };

  /* ── Cookie helpers ─────────────────────────────────────────────────── */

  /**
   * Write the consent cookie.
   * Format: "necessary:granted,analytics:granted,ads:denied"
   */
  function saveConsentCookie(analytics, ads) {
    var val = [
      'necessary:granted',
      'analytics:' + analytics,
      'ads:' + ads
    ].join(',');

    var expires = new Date(Date.now() + COOKIE_MAX_AGE * 1000).toUTCString();
    document.cookie = [
      COOKIE_NAME + '=' + encodeURIComponent(val),
      'max-age=' + COOKIE_MAX_AGE,
      'expires=' + expires,
      'path=/',
      'SameSite=Lax'
    ].join('; ');
  }

  /**
   * Read the consent cookie and return {analytics, ads} or null.
   */
  function readConsentCookie() {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var c = cookies[i].trim();
      if (c.indexOf(COOKIE_NAME + '=') === 0) {
        var raw = decodeURIComponent(c.slice(COOKIE_NAME.length + 1));
        var result = { analytics: 'denied', ads: 'denied' };
        raw.split(',').forEach(function (part) {
          var idx = part.indexOf(':');
          if (idx < 0) return;
          var k = part.slice(0, idx).trim();
          var v = part.slice(idx + 1).trim();
          if (k === 'analytics') result.analytics = v;
          if (k === 'ads')       result.ads       = v;
        });
        return result;
      }
    }
    return null;
  }

  /* ── Google Consent Mode v2 ─────────────────────────────────────────── */

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

  /* ── GA dynamic loading ─────────────────────────────────────────────── */

  var gaLoaded = false;

  function loadGA() {
    if (!CFG.gaEnabled || !CFG.gaId) return;
    if (gaLoaded) {
      if (typeof gtag === 'function') gtag('event', 'page_view');
      return;
    }
    gaLoaded = true;
    var s    = document.createElement('script');
    s.async  = true;
    s.src    = 'https://www.googletagmanager.com/gtag/js?id=' + CFG.gaId;
    document.head.appendChild(s);
  }

  /* ── DOM references ─────────────────────────────────────────────────── */

  var banner = null;
  var modal  = null;
  var toast  = null;

  function getDom() {
    banner = document.getElementById('cky-banner');
    modal  = document.getElementById('cky-modal');
    toast  = document.getElementById('cky-toast');
  }

  /* ── Banner ─────────────────────────────────────────────────────────── */

  function hideBanner() {
    if (!banner) return;
    banner.style.transition = 'opacity 0.25s, transform 0.25s';
    banner.style.opacity    = '0';
    banner.style.transform  = 'translateY(100%)';
    setTimeout(function () {
      banner.style.display = 'none';
    }, 270);
  }

  /* ── Modal ──────────────────────────────────────────────────────────── */

  function openModal() {
    if (!modal) return;
    // Sync toggle state to current consent values
    var anaToggle = document.getElementById('cky-toggle-analytics');
    var adsToggle = document.getElementById('cky-toggle-ads');
    if (anaToggle) anaToggle.checked = (state.analytics === 'granted');
    if (adsToggle) adsToggle.checked = (state.ads       === 'granted');

    modal.hidden = false;
    document.body.classList.add('cky-modal-open');

    // Move focus to first focusable element
    var firstBtn = modal.querySelector('button:not(.cky-modal__close), [tabindex="0"]');
    if (!firstBtn) firstBtn = modal.querySelector('button');
    if (firstBtn) setTimeout(function () { firstBtn.focus(); }, 50);

    document.addEventListener('keydown', handleModalKey);
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove('cky-modal-open');
    document.removeEventListener('keydown', handleModalKey);
  }

  function handleModalKey(e) {
    if (e.key === 'Escape') closeModal();
  }

  /* ── Toast ──────────────────────────────────────────────────────────── */

  function showToast() {
    if (!toast) return;
    toast.hidden = false;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        toast.classList.add('cky-toast--show');
      });
    });
    setTimeout(function () {
      toast.classList.remove('cky-toast--show');
      setTimeout(function () { toast.hidden = true; }, 250);
    }, 2500);
  }

  /* ── Core consent operations ────────────────────────────────────────── */

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

  function acceptAll() {
    applyConsent('granted', 'granted');
  }

  function rejectAll() {
    applyConsent('denied', 'denied');
  }

  function savePreferences() {
    var anaToggle = document.getElementById('cky-toggle-analytics');
    var adsToggle = document.getElementById('cky-toggle-ads');
    var analytics = (anaToggle && anaToggle.checked) ? 'granted' : 'denied';
    var ads       = (adsToggle && adsToggle.checked) ? 'granted' : 'denied';
    applyConsent(analytics, ads);
  }

  /* ── Footer "reopen" button ─────────────────────────────────────────── */

  function bindReopenBtn() {
    var btn = document.getElementById('cky-reopen-btn');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      // Show banner again if hidden
      if (banner) {
        banner.style.display    = '';
        banner.style.opacity    = '';
        banner.style.transform  = '';
        banner.style.transition = '';
      }
      openModal();
    });
  }

  /* ── Init ───────────────────────────────────────────────────────────── */

  function init() {
    getDom();
    bindReopenBtn();

    // If Go middleware already detected a valid consent cookie, apply it
    if (CFG.hasDecision) {
      updateConsentMode(CFG.analytics, CFG.ads);
      if (CFG.analytics === 'granted') loadGA();
      return;
    }

    // CDN-cache fallback: cookie may exist but SSR missed it
    var existing = readConsentCookie();
    if (existing) {
      state.analytics = existing.analytics;
      state.ads       = existing.ads;
      state.decided   = true;
      updateConsentMode(existing.analytics, existing.ads);
      if (existing.analytics === 'granted') loadGA();
      if (banner) banner.style.display = 'none';
    }
    // Otherwise banner stays visible (shown by Go template)
  }

  /* ── Public API ─────────────────────────────────────────────────────── */

  window.CKY = {
    acceptAll:       acceptAll,
    rejectAll:       rejectAll,
    openModal:       openModal,
    closeModal:      closeModal,
    savePreferences: savePreferences
  };

  // DOM-ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

