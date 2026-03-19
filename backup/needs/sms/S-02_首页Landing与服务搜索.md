# Block S-02 · SMS 接码器 — 首页 Landing + 服务搜索

> **所属模块**：SMS 接码器（/sms）  
> **竞品参考**：https://5sim.net 首页  
> **预估工时**：3h  
> **依赖**：S-01（路由已注册）  
> **交付粒度**：仅 Landing 页面 UI，包含 Hero / 数字统计 / 服务 Logo 展墙 / 三步说明 / FAQ，纯 HTML+CSS+JS，无后端调用

---

## 1. 竞品分析（5sim.net 首页）

| 区域 | 竞品特点 | 本次实现 |
|------|---------|---------|
| 顶部导航 | Logo + 导航菜单 + 登录/余额 | ✅ |
| Hero | 深色渐变 + 大标题 + 服务搜索框 + CTA 按钮 | ✅ |
| 数字统计 | 500K+ Numbers / 180+ Countries / 700+ Services / 99.9% Uptime | ✅ 滚动计数动画 |
| 服务 Logo 展墙 | 热门服务图标横向滚动 | ✅ CSS 无限滚动 |
| 三步使用说明 | 选择服务 → 获取号码 → 接收验证码 | ✅ |
| FAQ 区域 | 常见问题折叠 | ✅ |

---

## 2. HTML 模板

```html
<!-- templates/sms/landing.html -->

<!-- ── 顶部导航 ──────────────────────────── -->
<nav class="sms-navbar">
  <div class="sms-container">
    <a class="sms-logo" href="/sms">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 14a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 10.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17v-.08z"/>
      </svg>
      <span>{{ t .Lang "sms.name" }}</span>
    </a>

    <div class="sms-navbar__links">
      <a href="/sms/buy">{{ t .Lang "sms.nav.buy" }}</a>
      <a href="/sms/prices">{{ t .Lang "sms.nav.prices" }}</a>
      {{ if .User }}
        <a href="/sms/active">{{ t .Lang "sms.nav.active" }}</a>
        <a href="/sms/account" class="sms-navbar__balance">
          💰 {{ .User.Balance }}
        </a>
      {{ else }}
        <a href="/sms/login"    class="sms-nav-btn sms-nav-btn--ghost">{{ t .Lang "sms.nav.login" }}</a>
        <a href="/sms/register" class="sms-nav-btn sms-nav-btn--primary">{{ t .Lang "sms.nav.register" }}</a>
      {{ end }}
    </div>
  </div>
</nav>

<!-- ── Hero 区域 ─────────────────────────── -->
<section class="sms-hero">
  <div class="sms-container">
    <h1 class="sms-hero__title">{{ t .Lang "sms.hero.title" }}</h1>
    <p  class="sms-hero__subtitle">{{ t .Lang "sms.hero.subtitle" }}</p>

    <!-- 徽章 -->
    <div class="sms-hero__badges">
      <span class="sms-badge">📱 {{ t .Lang "sms.hero.badge1" }}</span>
      <span class="sms-badge">🌐 {{ t .Lang "sms.hero.badge2" }}</span>
      <span class="sms-badge">⚡ {{ t .Lang "sms.hero.badge3" }}</span>
    </div>

    <!-- 搜索框 -->
    <div class="sms-hero__search">
      <div class="hero-search-box">
        <svg class="hero-search-icon" width="20" height="20" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          id="hero-search-input"
          class="hero-search-input"
          placeholder="{{ t .Lang "sms.search.placeholder" }}"
          oninput="onHeroSearch(this.value)"
          autocomplete="off"
        >
        <a href="/sms/buy" class="hero-search-btn">
          {{ t .Lang "sms.hero.cta_btn" }}
        </a>
      </div>

      <!-- 搜索建议下拉 -->
      <div class="hero-search-dropdown" id="hero-search-dropdown" style="display:none">
        <p class="dropdown-label">{{ t .Lang "sms.search.popular" }}</p>
        <ul class="dropdown-list" id="dropdown-list"></ul>
      </div>
    </div>

  </div>

  <!-- 背景装饰 -->
  <div class="sms-hero__bg-orb sms-hero__bg-orb--1"></div>
  <div class="sms-hero__bg-orb sms-hero__bg-orb--2"></div>
</section>

<!-- ── 数字统计 ───────────────────────────── -->
<section class="sms-stats-section">
  <div class="sms-container">
    <div class="sms-stats-grid">
      <div class="stat-card">
        <span class="stat-card__number" data-target="700">0</span>
        <span class="stat-card__suffix">+</span>
        <p class="stat-card__label">{{ t .Lang "sms.stats.services" }}</p>
      </div>
      <div class="stat-card">
        <span class="stat-card__number" data-target="180">0</span>
        <span class="stat-card__suffix">+</span>
        <p class="stat-card__label">{{ t .Lang "sms.stats.countries" }}</p>
      </div>
      <div class="stat-card">
        <span class="stat-card__number" data-target="50">0</span>
        <span class="stat-card__suffix">M+</span>
        <p class="stat-card__label">{{ t .Lang "sms.stats.deliveries" }}</p>
      </div>
      <div class="stat-card">
        <span class="stat-card__number" data-target="99">0</span>
        <span class="stat-card__suffix">.9%</span>
        <p class="stat-card__label">{{ t .Lang "sms.stats.uptime" }}</p>
      </div>
    </div>
  </div>
</section>

<!-- ── 服务 Logo 滚动展墙 ─────────────────── -->
<section class="sms-services-marquee">
  <div class="marquee-track">
    <div class="marquee-inner" id="marquee-inner">
      <!-- JS 动态生成服务 Logo -->
    </div>
  </div>
</section>

<!-- ── 三步使用说明 ───────────────────────── -->
<section class="sms-how-section">
  <div class="sms-container">
    <h2 class="sms-section-title">{{ t .Lang "sms.how.title" }}</h2>
    <div class="sms-steps">
      <div class="step-card">
        <div class="step-card__num">1</div>
        <div class="step-card__icon">🔍</div>
        <h3>{{ t .Lang "sms.how.step1.title" }}</h3>
        <p>{{ t .Lang "sms.how.step1.desc" }}</p>
      </div>
      <div class="step-card step-card--arrow">→</div>
      <div class="step-card">
        <div class="step-card__num">2</div>
        <div class="step-card__icon">📱</div>
        <h3>{{ t .Lang "sms.how.step2.title" }}</h3>
        <p>{{ t .Lang "sms.how.step2.desc" }}</p>
      </div>
      <div class="step-card step-card--arrow">→</div>
      <div class="step-card">
        <div class="step-card__num">3</div>
        <div class="step-card__icon">✅</div>
        <h3>{{ t .Lang "sms.how.step3.title" }}</h3>
        <p>{{ t .Lang "sms.how.step3.desc" }}</p>
      </div>
    </div>
  </div>
</section>

<!-- ── FAQ ───────────────────────────────── -->
<section class="sms-faq-section">
  <div class="sms-container">
    <h2 class="sms-section-title">{{ t .Lang "sms.faq.title" }}</h2>
    <div class="faq-list">
      <!-- 与 J-07 相同的 FAQ 折叠组件 -->
      {{- range $i, $faq := .FAQs }}
      <div class="faq-item" id="sms-faq-{{ $i }}">
        <button class="faq-question" onclick="toggleFAQ('sms-faq-{{ $i }}')">
          <span>{{ $faq.Q }}</span>
          <svg class="faq-chevron" width="16" height="16" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        <div class="faq-answer"><p>{{ $faq.A }}</p></div>
      </div>
      {{- end }}
    </div>
  </div>
</section>
```

---

## 3. CSS

```css
/* static/css/sms.css */

/* ── 全局 ─────────────────────────────────── */
.sms-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.sms-section-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #0f172a;
  text-align: center;
  margin: 0 0 36px;
}

/* ── 导航 ────────────────────────────────── */
.sms-navbar {
  position: sticky;
  top: 0;
  z-index: 200;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255,255,255,0.08);
  padding: 0;
}

.sms-navbar > .sms-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.sms-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ffffff;
  text-decoration: none;
  font-size: 1.125rem;
  font-weight: 700;
}

.sms-navbar__links {
  display: flex;
  align-items: center;
  gap: 24px;
}

.sms-navbar__links a {
  color: rgba(255,255,255,0.75);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.15s;
}

.sms-navbar__links a:hover { color: #ffffff; }

.sms-navbar__balance {
  background: rgba(79,70,229,0.25);
  border: 1px solid rgba(79,70,229,0.5);
  border-radius: 999px;
  padding: 4px 14px !important;
  color: #a5b4fc !important;
  font-weight: 600 !important;
}

.sms-nav-btn {
  height: 36px;
  padding: 0 18px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}

.sms-nav-btn--ghost {
  color: rgba(255,255,255,0.8) !important;
  border: 1px solid rgba(255,255,255,0.2);
}

.sms-nav-btn--primary {
  background: #4f46e5;
  color: #ffffff !important;
}

.sms-nav-btn--primary:hover { background: #4338ca; }

/* ── Hero ─────────────────────────────────── */
.sms-hero {
  position: relative;
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%);
  padding: 80px 0 72px;
  text-align: center;
  overflow: hidden;
}

.sms-hero__title {
  font-size: 3rem;
  font-weight: 900;
  color: #ffffff;
  margin: 0 0 16px;
  letter-spacing: -0.03em;
  line-height: 1.1;
}

.sms-hero__subtitle {
  font-size: 1.125rem;
  color: rgba(255,255,255,0.7);
  max-width: 540px;
  margin: 0 auto 28px;
  line-height: 1.6;
}

.sms-hero__badges {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 36px;
  flex-wrap: wrap;
}

.sms-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 16px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 999px;
  color: rgba(255,255,255,0.9);
  font-size: 0.875rem;
  font-weight: 500;
  backdrop-filter: blur(4px);
}

/* 搜索框 */
.sms-hero__search {
  position: relative;
  max-width: 600px;
  margin: 0 auto;
}

.hero-search-box {
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 14px;
  padding: 6px 6px 6px 16px;
  gap: 12px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.hero-search-icon { color: #9ca3af; flex-shrink: 0; }

.hero-search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 1rem;
  color: #111827;
  background: transparent;
}

.hero-search-btn {
  height: 44px;
  padding: 0 24px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: #ffffff;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 700;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  transition: opacity 0.15s;
}

.hero-search-btn:hover { opacity: 0.9; }

/* 搜索下拉 */
.hero-search-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 16px 48px rgba(0,0,0,0.15);
  z-index: 100;
  text-align: left;
}

.dropdown-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 8px;
  padding: 0 4px;
}

.dropdown-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
  transition: background 0.1s;
}

.dropdown-item:hover { background: #f3f4f6; }

.dropdown-item img {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  object-fit: contain;
}

/* 背景光晕 */
.sms-hero__bg-orb {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(80px);
  opacity: 0.25;
}
.sms-hero__bg-orb--1 {
  width: 500px; height: 500px;
  background: #6366f1;
  top: -200px; left: -100px;
}
.sms-hero__bg-orb--2 {
  width: 400px; height: 400px;
  background: #8b5cf6;
  bottom: -150px; right: -50px;
}

/* ── 数字统计 ─────────────────────────────── */
.sms-stats-section {
  background: #ffffff;
  padding: 48px 0;
  border-bottom: 1px solid #f3f4f6;
}

.sms-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-card {
  text-align: center;
  padding: 24px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
}

.stat-card__number {
  font-size: 2.5rem;
  font-weight: 900;
  color: #4f46e5;
  font-variant-numeric: tabular-nums;
}

.stat-card__suffix {
  font-size: 1.5rem;
  font-weight: 700;
  color: #4f46e5;
}

.stat-card__label {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 6px 0 0;
}

/* ── 服务 Logo 无限滚动 ────────────────────── */
.sms-services-marquee {
  background: #f8fafc;
  padding: 24px 0;
  overflow: hidden;
  border-bottom: 1px solid #f3f4f6;
}

.marquee-track {
  overflow: hidden;
  mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
}

.marquee-inner {
  display: flex;
  gap: 24px;
  width: max-content;
  animation: marquee-scroll 30s linear infinite;
}

.marquee-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  min-width: 80px;
  flex-shrink: 0;
}

.marquee-item img {
  width: 32px;
  height: 32px;
  object-fit: contain;
  border-radius: 6px;
}

.marquee-item span {
  font-size: 0.75rem;
  color: #6b7280;
  white-space: nowrap;
}

@keyframes marquee-scroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* ── 三步说明 ─────────────────────────────── */
.sms-how-section {
  background: #ffffff;
  padding: 64px 0;
}

.sms-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.step-card {
  flex: 1;
  max-width: 280px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 28px 24px;
  text-align: center;
  position: relative;
}

.step-card--arrow {
  flex: 0;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #d1d5db;
  padding: 0;
}

.step-card__num {
  position: absolute;
  top: -12px;
  left: 20px;
  width: 24px;
  height: 24px;
  background: #4f46e5;
  color: #fff;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-card__icon { font-size: 2rem; margin-bottom: 12px; }

.step-card h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px;
}

.step-card p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.6;
}

/* ── 响应式 ──────────────────────────────── */
@media (max-width: 768px) {
  .sms-hero__title { font-size: 2rem; }
  .sms-stats-grid  { grid-template-columns: repeat(2, 1fr); }
  .sms-steps       { flex-direction: column; }
  .step-card--arrow { display: none; }
  .sms-navbar__links a:not(.sms-nav-btn) { display: none; }
}
```

---

## 4. JavaScript — 搜索 + 统计数字动画 + Marquee

```javascript
// static/js/sms-landing.js

// ── 热门服务（配合 Logo 展墙）─────────────────────
const POPULAR_SERVICES = [
  { name: 'WhatsApp',  icon: '/static/icons/sms/whatsapp.png' },
  { name: 'Telegram',  icon: '/static/icons/sms/telegram.png' },
  { name: 'Google',    icon: '/static/icons/sms/google.png' },
  { name: 'Facebook',  icon: '/static/icons/sms/facebook.png' },
  { name: 'TikTok',    icon: '/static/icons/sms/tiktok.png' },
  { name: 'Twitter/X', icon: '/static/icons/sms/twitter.png' },
  { name: 'Instagram', icon: '/static/icons/sms/instagram.png' },
  { name: 'WeChat',    icon: '/static/icons/sms/wechat.png' },
  { name: 'LINE',      icon: '/static/icons/sms/line.png' },
  { name: 'Viber',     icon: '/static/icons/sms/viber.png' },
  { name: 'Amazon',    icon: '/static/icons/sms/amazon.png' },
  { name: 'Microsoft', icon: '/static/icons/sms/microsoft.png' },
];

// ── Hero 搜索 ───────────────────────────────────────
function onHeroSearch(query) {
  const dropdown = document.getElementById('hero-search-dropdown');
  const list     = document.getElementById('dropdown-list');

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
      <img src="${s.icon}" alt="${s.name}"
           onerror="this.src='/static/icons/sms/default.png'">
      <span>${s.name}</span>
    </li>
  `).join('');

  dropdown.style.display = 'block';
}

// 点击外部关闭下拉
document.addEventListener('click', (e) => {
  if (!e.target.closest('.sms-hero__search')) {
    document.getElementById('hero-search-dropdown').style.display = 'none';
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
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      animateCounters();
    }
  }, { threshold: 0.3 }).observe(statsSection);
}

// ── Marquee 服务 Logo 滚动 ──────────────────────────
function buildMarquee() {
  const inner = document.getElementById('marquee-inner');
  if (!inner) return;

  // 复制两份实现无缝循环
  const items = [...POPULAR_SERVICES, ...POPULAR_SERVICES];
  inner.innerHTML = items.map(s => `
    <div class="marquee-item">
      <img src="${s.icon}" alt="${s.name}"
           onerror="this.src='/static/icons/sms/default.png'">
      <span>${s.name}</span>
    </div>
  `).join('');
}

buildMarquee();
```

---

## 5. i18n 追加 Key（本 Block 新增）

### locales/zh.json

```json
{
  "sms.how.title":       "三步接码，简单快速",
  "sms.how.step1.title": "选择平台和国家",
  "sms.how.step1.desc":  "从 700+ 平台中搜索目标应用，选择国家和运营商",
  "sms.how.step2.title": "获取虚拟号码",
  "sms.how.step2.desc":  "一键购买，立即获得虚拟手机号，复制到目标平台",
  "sms.how.step3.title": "接收验证码",
  "sms.how.step3.desc":  "验证码短信自动到达，一键复制完成验证"
}
```

### locales/en.json

```json
{
  "sms.how.title":       "3 Simple Steps",
  "sms.how.step1.title": "Choose Service & Country",
  "sms.how.step1.desc":  "Search 700+ services, select your country and operator",
  "sms.how.step2.title": "Get Your Number",
  "sms.how.step2.desc":  "Buy instantly and get a virtual phone number to use",
  "sms.how.step3.title": "Receive SMS Code",
  "sms.how.step3.desc":  "Your verification code arrives automatically — copy and done"
}
```

---

## 6. 验收标准

- [ ] 导航固定顶部，深色磨砂玻璃效果
- [ ] 未登录显示「登录/注册」按钮，已登录显示余额和账户
- [ ] Hero 深色渐变背景 + 紫色光晕装饰
- [ ] 搜索框输入后显示服务下拉建议，点击跳转 `/sms/buy?service=...`
- [ ] 点击 Hero CTA 按钮跳转 `/sms/buy`
- [ ] 数字统计（700+ / 180+ / 50M+ / 99.9%）进入视口时触发滚动计数动画
- [ ] 服务 Logo 展墙无限横向滚动，边缘渐隐
- [ ] 三步说明卡片正确显示
- [ ] 移动端（<768px）适配，标题缩小，统计变两列
