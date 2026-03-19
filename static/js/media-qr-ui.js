// /static/js/media-qr-ui.js
// Handles: type switching, panel toggling, FAQ accordion, toast, sticky preview scroll follow

'use strict';

let currentType = window.QR_TYPE || 'url';

/* ── Type Switching ──────────────────────────── */
function switchType(type) {
  currentType = type;
  document.querySelectorAll('.qr-type-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === type);
  });
  renderForm(type);
  history.replaceState(null, '', `?type=${type}`);
}

/* ── Panel Toggle ────────────────────────────── */
function togglePanel(panelId) {
  const panel = document.getElementById(panelId);
  if (panel) panel.classList.toggle('qr-panel--open');
}

/* ── FAQ Accordion ───────────────────────────── */
function toggleFAQ(id) {
  const item   = document.getElementById(id);
  const isOpen = item.classList.contains('qr-faq-item--open');
  document.querySelectorAll('.qr-faq-item--open')
    .forEach(i => i.classList.remove('qr-faq-item--open'));
  if (!isOpen) item.classList.add('qr-faq-item--open');
}

/* ── Toast ───────────────────────────────────── */
function showToast(msg, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const el = document.createElement('div');
  el.className   = `qr-toast qr-toast--${type}`;
  el.textContent = msg;
  container.appendChild(el);
  requestAnimationFrame(() => el.classList.add('qr-toast--show'));
  setTimeout(() => {
    el.classList.remove('qr-toast--show');
    setTimeout(() => el.remove(), 300);
  }, 3500);
}

/* ── Preview Scroll Follow ───────────────────── */
// 让右侧预览卡片随滚轮联动：在左侧面板范围内 fixed 跟随视口，超出底部则贴底
function initPreviewScroll() {
  const previewCard = document.getElementById('previewCard');
  const leftCol     = document.querySelector('.qr-layout__left');
  const rightCol    = document.querySelector('.qr-layout__right');
  if (!previewCard || !leftCol || !rightCol) return;

  const GAP = 12; // px between navbar bottom and card top

  function getNavbarHeight() {
    const nav = document.querySelector('.navbar');
    return nav ? nav.getBoundingClientRect().height : 64;
  }

  function update() {
    // 移动端不做 JS sticky，交给 CSS static
    if (window.innerWidth <= 900) {
      previewCard.style.position = '';
      previewCard.style.top      = '';
      previewCard.style.width    = '';
      previewCard.style.left     = '';
      return;
    }

    const navH      = getNavbarHeight();
    const topOffset = navH + GAP;
    const scrollY   = window.scrollY;
    const previewH  = previewCard.offsetHeight;

    // 左侧面板在页面上的绝对顶部位置
    const leftTop    = leftCol.getBoundingClientRect().top + scrollY;
    // 左侧面板绝对底部位置
    const leftBottom = leftTop + leftCol.offsetHeight;

    // 预览卡片固定时，滚动到多少时底部会超出左侧面板
    const maxScroll  = leftBottom - previewH - topOffset;

    // 开始 sticky 的时机：预览卡片顶部到达导航栏底部
    const stickyStart = leftTop - topOffset;

    if (scrollY <= stickyStart) {
      // 未触发：自然位置
      previewCard.style.position = '';
      previewCard.style.top      = '';
      previewCard.style.width    = '';
      previewCard.style.left     = '';
    } else if (scrollY <= maxScroll) {
      // 跟随视口：fixed 定位
      const rightRect = rightCol.getBoundingClientRect();
      previewCard.style.position = 'fixed';
      previewCard.style.top      = topOffset + 'px';
      previewCard.style.left     = rightRect.left + 'px';
      previewCard.style.width    = rightCol.offsetWidth + 'px';
    } else {
      // 超出左侧底部：贴底（absolute 相对 rightCol）
      previewCard.style.position = 'absolute';
      previewCard.style.top      = (leftCol.offsetHeight - previewH - GAP) + 'px';
      previewCard.style.left     = '';
      previewCard.style.width    = '';
    }
  }

  // rightCol 需要 position:relative 以支持 absolute 贴底
  rightCol.style.position = 'relative';

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', () => {
    // resize 时重置 fixed left（宽度变化）
    previewCard.style.position = '';
    previewCard.style.left     = '';
    previewCard.style.width    = '';
    update();
  }, { passive: true });

  update();
}

/* ── Init ────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  renderForm(currentType);
  if (typeof initDesignPanel === 'function') initDesignPanel();
  // initFramePanel is registered by media-qr-frames.js DOMContentLoaded
  initPreviewScroll();
});
