// SMS Landing 页面交互 - S-02

// ── 热门服务（配合 Logo 展墙）─────────────────────
const POPULAR_SERVICES = [
  { name: 'WhatsApp',  icon: '💚' },
  { name: 'Telegram',  icon: '🔷' },
  { name: 'Google',    icon: '🔵' },
  { name: 'Facebook',  icon: '📘' },
  { name: 'TikTok',    icon: '🎵' },
  { name: 'Twitter/X', icon: '🐦' },
  { name: 'Instagram', icon: '📷' },
  { name: 'WeChat',    icon: '🍀' },
  { name: 'LINE',      icon: '💬' },
  { name: 'Viber',     icon: '📞' },
  { name: 'Amazon',    icon: '📦' },
  { name: 'Microsoft', icon: '🪟' },
  { name: 'Apple',     icon: '🍎' },
  { name: 'Netflix',   icon: '🎬' },
  { name: 'Discord',   icon: '💜' },
  { name: 'Snapchat',  icon: '👻' },
  { name: 'Uber',      icon: '🚗' },
  { name: 'PayPal',    icon: '💳' },
];

// ── Hero 搜索 ───────────────────────────────────────
function onHeroSearch(query) {
  const dropdown = document.getElementById('hero-search-dropdown');
  const list     = document.getElementById('dropdown-list');

  if (!dropdown || !list) return;

  const results = query.trim()
    ? POPULAR_SERVICES.filter(s =>
        s.name.toLowerCase().includes(query.toLowerCase())
      )
    : POPULAR_SERVICES.slice(0, 8);

  if (results.length === 0) {
    dropdown.style.display = 'none';
    return;
  }

  list.innerHTML = results.map(s => `
    <li class="dropdown-item"
        onclick="window.location='/sms/buy?service=${encodeURIComponent(s.name.toLowerCase())}'">
      <span class="service-icon">${s.icon}</span>
      <span>${s.name}</span>
    </li>
  `).join('');

  dropdown.style.display = 'block';
}

// 点击外部关闭下拉
document.addEventListener('click', (e) => {
  if (!e.target.closest('.sms-hero__search')) {
    const dropdown = document.getElementById('hero-search-dropdown');
    if (dropdown) dropdown.style.display = 'none';
  }
});

// ── 数字统计滚动动画 ────────────────────────────────
function animateCounters() {
  const counters = document.querySelectorAll('.stat-card__number[data-target]');
  counters.forEach(el => {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1500;
    let   start    = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  });
}

// Intersection Observer：数字进入视口时触发
const statsSection = document.querySelector('.sms-stats-section');
if (statsSection) {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      animateCounters();
      observer.disconnect(); // 只触发一次
    }
  }, { threshold: 0.3 });
  observer.observe(statsSection);
}

// ── Marquee 服务 Logo 滚动 ──────────────────────────
function buildMarquee() {
  const inner = document.getElementById('marquee-inner');
  if (!inner) return;

  // 复制两份实现无缝循环
  const items = [...POPULAR_SERVICES, ...POPULAR_SERVICES];
  inner.innerHTML = items.map(s => `
    <div class="marquee-item">
      <span class="service-icon">${s.icon}</span>
      <span>${s.name}</span>
    </div>
  `).join('');
}

// ── FAQ 折叠 ──────────────────────────────────────
function toggleFAQ(id) {
  const item = document.getElementById(id);
  if (!item) return;
  
  // 关闭其他FAQ
  document.querySelectorAll('.faq-item').forEach(el => {
    if (el.id !== id) el.classList.remove('active');
  });
  
  // 切换当前FAQ
  item.classList.toggle('active');
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
  buildMarquee();
  console.log('[SMS Landing] S-02 initialized');
});

