<!-- privacy-check-I-02_首页Landing_上传区.md -->

# 🔒 隐私账号安全检测 — I-02 首页 Landing / 输入区

---

## 1. 竞品 UI 对标表

| UI 区域 | HIBP | Mozilla Monitor | DeHashed | LeakCheck | **本次实现 (ToolboxNova)** |
|---------|------|-----------------|----------|-----------|---------------------------|
| **输入区样式** | 单行输入框 + 蓝色按钮，极简 | 输入框 + 紫色渐变按钮 | 搜索栏 + 类型下拉选择 | 单输入框 + 绿色按钮 | 居中大输入框 + 动态盾牌光圈 + Tab 切换多功能 |
| **功能切换** | 两个独立页面（Email/Password） | 无切换，仅邮箱 | 搜索类型下拉 | 搜索类型下拉 | 胶囊 Tab 组，4功能同页切换，带滑块动画 |
| **结果展示** | 文字列表 + 品牌 Logo | 仪表盘卡片 + 步骤指引 | 表格列表 | 表格列表 | 安全仪表盘风格：风险环形图 + 时间线 + Badge |
| **密码强度** | ❌ 无 | ❌ 无 | ❌ 无 | ❌ 无 | ✅ zxcvbn 实时评估条 + 破解时间 |
| **密码生成** | ❌ 无 | ❌ 无 | ❌ 无 | ❌ 无 | ✅ 参数可调生成器 + 一键复制 |
| **暗色模式** | ❌ 仅亮色 | ✅ 暗色 | ✅ 暗色 | ❌ 仅亮色 | ✅ 暗色默认 + 亮色可选 |
| **隐私提示** | 页脚说明 | 页面内嵌说明 | 无显著提示 | 无显著提示 | 顶部固定隐私承诺条 + 输入区内隐私说明 |
| **移动端** | 响应式基础 | PWA 级适配 | 一般 | 一般 | Mobile-First 触控优化 |
| **广告位** | 无 | 无 | 侧边 + 弹窗 | 弹窗 | 3 标准位，非侵入式 |
| **验证码** | Cloudflare Turnstile | 无 | reCAPTCHA | reCAPTCHA | Cloudflare Turnstile (invisible) |

---

## 2. 完整 HTML 模板结构

```html
{{ define "content" }}

<!-- ====== 隐私承诺条 (Fixed Top Banner) ====== -->
<div class="pc-privacy-banner" id="privacyBanner">
  <div class="pc-privacy-banner__inner">
    <svg class="pc-privacy-banner__icon" width="16" height="16" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
    <span data-i18n="hero.privacy_banner">Your data never leaves your browser</span>
  </div>
</div>

<!-- ====== 顶部广告位 ====== -->
{{- template "partials/ad_slot.html" dict
    "SlotID" "privacy-check-top" "Size" "728x90" "Mobile" "320x50"
    "ClientID" .AdsClientID "Enabled" .AdsEnabled }}

<!-- ====== Hero 区 ====== -->
<section class="pc-hero">
  <div class="pc-hero__container">
    <!-- Badge 组 -->
    <div class="pc-hero__badges">
      <span class="pc-badge pc-badge--cyan" data-i18n="hero.badge_free">100% Free</span>
      <span class="pc-badge pc-badge--green" data-i18n="hero.badge_privacy">Zero Data Storage</span>
      <span class="pc-badge pc-badge--amber" data-i18n="hero.badge_breaches">900+ Breach Sources</span>
    </div>

    <!-- 主标题 -->
    <h1 class="pc-hero__title" data-i18n="hero.title">Is Your Account Safe?</h1>
    <p class="pc-hero__subtitle" data-i18n="hero.subtitle">
      Check if your email or password has been exposed in data breaches.
      Powered by the world's largest breach database.
    </p>
  </div>
</section>

<!-- ====== 功能 Tab 切换区 ====== -->
<section class="pc-tabs-section">
  <div class="pc-tabs-container">
    <div class="pc-tabs" role="tablist">
      <button class="pc-tab pc-tab--active" role="tab"
              data-tab="email" aria-selected="true"
              onclick="switchTab('email')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2">
          <rect x="2" y="4" width="20" height="16" rx="2"/>
          <path d="M22 4L12 13 2 4"/>
        </svg>
        <span data-i18n="tabs.email">Email Breach Check</span>
      </button>
      <button class="pc-tab" role="tab"
              data-tab="password" aria-selected="false"
              onclick="switchTab('password')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2"/>
          <path d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>
        <span data-i18n="tabs.password">Password Security</span>
      </button>
      <button class="pc-tab" role="tab"
              data-tab="breaches" aria-selected="false"
              onclick="switchTab('breaches')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2">
          <path d="M12 9v4M12 17h.01"/>
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        </svg>
        <span data-i18n="tabs.breaches">Breach Browser</span>
      </button>
      <button class="pc-tab" role="tab"
              data-tab="generator" aria-selected="false"
              onclick="switchTab('generator')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2">
          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.78 7.78 5.5 5.5 0 017.78-7.78zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
        </svg>
        <span data-i18n="tabs.generator">Password Generator</span>
      </button>
      <!-- 滑块指示器 -->
      <div class="pc-tab-slider" id="tabSlider"></div>
    </div>
  </div>
</section>

<!-- ====== 主内容区 (两栏: 左内容 + 右侧边广告) ====== -->
<div class="pc-main-grid">
  <div class="pc-main-content">

    <!-- ====== Tab Panel: 邮箱检测 ====== -->
    <div class="pc-panel pc-panel--active" id="panel-email" role="tabpanel">
      <div class="pc-input-card">
        <!-- 盾牌动画容器 -->
        <div class="pc-shield-ring" id="shieldRing">
          <div class="pc-input-group">
            <div class="pc-input-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="M22 4L12 13 2 4"/>
              </svg>
            </div>
            <input type="email" class="pc-input" id="emailInput"
                   data-i18n-placeholder="email.placeholder"
                   placeholder="Enter your email address"
                   autocomplete="off" spellcheck="false"
                   onkeydown="if(event.key==='Enter') checkEmail()">
            <button class="pc-btn pc-btn--primary" id="emailBtn"
                    onclick="checkEmail()" data-i18n="email.button">
              Check Breaches
            </button>
          </div>
        </div>
        <!-- Turnstile 验证区域 -->
        <div class="pc-turnstile-wrap" id="turnstileWrap">
          <div class="cf-turnstile" id="turnstileWidget"
               data-sitekey="{{ .TurnstileSiteKey }}"
               data-callback="onTurnstileSuccess"
               data-theme="dark"
               data-size="flexible"></div>
          <p class="pc-hint" data-i18n="email.turnstile_hint">
            Security verification will run automatically
          </p>
        </div>
      </div>

      <!-- 邮箱结果区 -->
      <div class="pc-result-area" id="emailResultArea" style="display:none;">
        <!-- 由 JS 动态填充 -->
      </div>
    </div>

    <!-- ====== Tab Panel: 密码检测 ====== -->
    <div class="pc-panel" id="panel-password" role="tabpanel">
      <div class="pc-input-card">
        <div class="pc-shield-ring" id="passwordShieldRing">
          <div class="pc-input-group">
            <div class="pc-input-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
            </div>
            <input type="password" class="pc-input" id="passwordInput"
                   data-i18n-placeholder="password.placeholder"
                   placeholder="Enter a password to check"
                   autocomplete="off" spellcheck="false"
                   oninput="onPasswordInput(this.value)"
                   onkeydown="if(event.key==='Enter') checkPassword()">
            <button class="pc-btn pc-btn--ghost" id="passwordToggle"
                    onclick="togglePasswordVisibility()" type="button"
                    title="Toggle visibility">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" id="eyeIcon">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
            <button class="pc-btn pc-btn--primary" id="passwordBtn"
                    onclick="checkPassword()" data-i18n="password.button">
              Check Password
            </button>
          </div>
        </div>
        <p class="pc-privacy-note" data-i18n="password.privacy_note">
          Your password is hashed locally. Only the first 5 characters of the hash are sent for lookup.
        </p>
      </div>

      <!-- 密码强度评估区 -->
      <div class="pc-strength-area" id="strengthArea" style="display:none;">
        <h3 class="pc-section-title" data-i18n="strength.title">Password Strength Analysis</h3>
        <div class="pc-strength-bar-wrap">
          <div class="pc-strength-bar" id="strengthBar"></div>
        </div>
        <div class="pc-strength-info">
          <span class="pc-strength-label" id="strengthLabel"></span>
          <span class="pc-strength-time" id="strengthTime"></span>
        </div>
        <div class="pc-strength-suggestions" id="strengthSuggestions"></div>
      </div>

      <!-- 密码泄露结果区 -->
      <div class="pc-result-area" id="passwordResultArea" style="display:none;">
        <!-- 由 JS 动态填充 -->
      </div>
    </div>

    <!-- ====== Tab Panel: 泄露事件浏览器 ====== -->
    <div class="pc-panel" id="panel-breaches" role="tabpanel">
      <div class="pc-breaches-header">
        <h2 class="pc-section-title" data-i18n="breaches.title">Data Breach Browser</h2>
        <p class="pc-section-subtitle" data-i18n="breaches.subtitle">
          Explore all known data breach events from the HIBP database
        </p>
      </div>

      <!-- 搜索 + 筛选栏 -->
      <div class="pc-breaches-toolbar">
        <div class="pc-search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input type="text" class="pc-search-input" id="breachSearchInput"
                 data-i18n-placeholder="breaches.search_placeholder"
                 placeholder="Search breaches by name..."
                 oninput="filterBreaches()">
        </div>
        <div class="pc-filter-group">
          <button class="pc-filter-btn pc-filter-btn--active" data-filter="all"
                  onclick="setBreachFilter('all')" data-i18n="breaches.filter_all">All</button>
          <button class="pc-filter-btn" data-filter="verified"
                  onclick="setBreachFilter('verified')" data-i18n="breaches.filter_verified">Verified</button>
          <button class="pc-filter-btn" data-filter="sensitive"
                  onclick="setBreachFilter('sensitive')" data-i18n="breaches.filter_sensitive">Sensitive</button>
        </div>
        <div class="pc-sort-group">
          <label class="pc-sort-label">Sort:</label>
          <select class="pc-sort-select" id="breachSortSelect" onchange="sortBreaches(this.value)">
            <option value="date" data-i18n="breaches.sort_date">Date</option>
            <option value="size" data-i18n="breaches.sort_size">Size</option>
            <option value="name" data-i18n="breaches.sort_name">Name</option>
          </select>
        </div>
      </div>

      <!-- 泄露总计 -->
      <p class="pc-breaches-count" id="breachesCount"></p>

      <!-- 泄露卡片网格 -->
      <div class="pc-breaches-grid" id="breachesGrid">
        <!-- 由 JS 动态填充 -->
      </div>

      <!-- 加载更多 -->
      <div class="pc-load-more-wrap" id="loadMoreWrap" style="display:none;">
        <button class="pc-btn pc-btn--outline" onclick="loadMoreBreaches()"
                data-i18n="breaches.load_more">Load More</button>
      </div>
    </div>

    <!-- ====== Tab Panel: 密码生成器 ====== -->
    <div class="pc-panel" id="panel-generator" role="tabpanel">
      <div class="pc-generator-card">
        <h2 class="pc-section-title" data-i18n="generator.title">Secure Password Generator</h2>

        <!-- 生成结果展示 -->
        <div class="pc-generated-display" id="generatedDisplay">
          <code class="pc-generated-text" id="generatedText">Click generate to create a password</code>
          <button class="pc-btn pc-btn--ghost pc-btn--copy" onclick="copyGeneratedPassword()"
                  title="Copy" data-i18n="generator.copy_btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
          </button>
        </div>

        <!-- 生成密码的强度条 -->
        <div class="pc-strength-bar-wrap pc-strength-bar-wrap--small" id="genStrengthWrap" style="display:none;">
          <div class="pc-strength-bar" id="genStrengthBar"></div>
          <span class="pc-strength-label" id="genStrengthLabel"></span>
        </div>

        <!-- 参数设置 -->
        <div class="pc-generator-options">
          <div class="pc-option-row">
            <label data-i18n="generator.length_label">Password Length</label>
            <div class="pc-slider-group">
              <input type="range" class="pc-slider" id="genLength" min="8" max="64" value="20"
                     oninput="updateLengthDisplay(this.value); generatePassword()">
              <span class="pc-slider-value" id="genLengthValue">20</span>
            </div>
          </div>
          <div class="pc-option-row">
            <label class="pc-checkbox-label">
              <input type="checkbox" id="genUppercase" checked onchange="generatePassword()">
              <span data-i18n="generator.uppercase">Uppercase (A-Z)</span>
            </label>
          </div>
          <div class="pc-option-row">
            <label class="pc-checkbox-label">
              <input type="checkbox" id="genLowercase" checked onchange="generatePassword()">
              <span data-i18n="generator.lowercase">Lowercase (a-z)</span>
            </label>
          </div>
          <div class="pc-option-row">
            <label class="pc-checkbox-label">
              <input type="checkbox" id="genNumbers" checked onchange="generatePassword()">
              <span data-i18n="generator.numbers">Numbers (0-9)</span>
            </label>
          </div>
          <div class="pc-option-row">
            <label class="pc-checkbox-label">
              <input type="checkbox" id="genSymbols" checked onchange="generatePassword()">
              <span data-i18n="generator.symbols">Symbols (!@#$%)</span>
            </label>
          </div>
          <div class="pc-option-row">
            <label class="pc-checkbox-label">
              <input type="checkbox" id="genExcludeAmbiguous" onchange="generatePassword()">
              <span data-i18n="generator.exclude_ambiguous">Exclude ambiguous (0OIl1)</span>
            </label>
          </div>
        </div>

        <!-- 生成/重新生成按钮 -->
        <div class="pc-generator-actions">
          <button class="pc-btn pc-btn--primary pc-btn--large" onclick="generatePassword()"
                  data-i18n="generator.generate_btn">Generate Password</button>
        </div>
      </div>
    </div>

  </div><!-- /.pc-main-content -->

  <!-- 侧边广告位 -->
  <aside class="pc-sidebar">
    {{- template "partials/ad_slot.html" dict
        "SlotID" "privacy-check-sidebar" "Size" "300x250" "MobileHide" true
        "ClientID" .AdsClientID "Enabled" .AdsEnabled }}
  </aside>
</div><!-- /.pc-main-grid -->

<!-- ====== 三特性卡片 ====== -->
<section class="pc-features">
  <div class="pc-features__grid">
    <div class="pc-feature-card">
      <div class="pc-feature-card__icon pc-feature-card__icon--cyan">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="M12 8v4M12 16h.01"/>
        </svg>
      </div>
      <h3 data-i18n="feature.privacy_title">Zero Knowledge Privacy</h3>
      <p data-i18n="feature.privacy_desc">
        Passwords are hashed locally in your browser. We use k-Anonymity —
        only a 5-character hash prefix is ever transmitted.
      </p>
    </div>
    <div class="pc-feature-card">
      <div class="pc-feature-card__icon pc-feature-card__icon--green">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
      </div>
      <h3 data-i18n="feature.speed_title">Instant Results</h3>
      <p data-i18n="feature.speed_desc">
        Backed by Cloudflare's global CDN with 99.9% cache hit rates.
        Get breach results in milliseconds.
      </p>
    </div>
    <div class="pc-feature-card">
      <div class="pc-feature-card__icon pc-feature-card__icon--amber">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
      </div>
      <h3 data-i18n="feature.free_title">Completely Free</h3>
      <p data-i18n="feature.free_desc">
        No sign-up, no subscription, no hidden fees.
        Check unlimited emails and passwords at no cost.
      </p>
    </div>
  </div>
</section>

<!-- ====== FAQ 手风琴 ====== -->
<section class="pc-faq">
  <h2 class="pc-faq__title">FAQ</h2>
  <div class="pc-faq__list" id="faqList">
    {{ range $i, $faq := .FAQ }}
    <div class="pc-faq__item">
      <button class="pc-faq__question" onclick="toggleFAQ(this)" aria-expanded="false">
        <span>{{ $faq.Q }}</span>
        <svg class="pc-faq__arrow" width="20" height="20" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      <div class="pc-faq__answer">
        <p>{{ $faq.A }}</p>
      </div>
    </div>
    {{ end }}
  </div>
</section>

<!-- ====== 底部广告位 ====== -->
{{- template "partials/ad_slot.html" dict
    "SlotID" "privacy-check-bottom" "Size" "728x90" "Mobile" "320x50"
    "ClientID" .AdsClientID "Enabled" .AdsEnabled }}

<!-- ====== 数据来源声明 ====== -->
<div class="pc-attribution">
  <p data-i18n="common.powered_by">Breach data powered by Have I Been Pwned</p>
</div>

<!-- ====== Toast 容器 ====== -->
<div class="pc-toast-container" id="toastContainer"></div>

{{ end }}
```

---

## 3. CSS 规范

### 3.1 CSS 变量定义

```css
:root {
  /* ===== 色彩系统 — 暗色模式 (默认) ===== */
  --pc-bg-primary: #0F172A;
  --pc-bg-secondary: #1E293B;
  --pc-bg-tertiary: #334155;
  --pc-surface: #1E293B;
  --pc-surface-hover: #263548;
  --pc-border: #334155;
  --pc-border-light: #475569;

  --pc-text-primary: #F1F5F9;
  --pc-text-secondary: #94A3B8;
  --pc-text-muted: #64748B;

  --pc-accent-cyan: #06B6D4;
  --pc-accent-cyan-hover: #22D3EE;
  --pc-accent-cyan-bg: rgba(6, 182, 212, 0.1);
  --pc-accent-green: #10B981;
  --pc-accent-green-bg: rgba(16, 185, 129, 0.1);
  --pc-accent-amber: #F59E0B;
  --pc-accent-amber-bg: rgba(245, 158, 11, 0.1);
  --pc-accent-red: #EF4444;
  --pc-accent-red-bg: rgba(239, 68, 68, 0.1);

  /* ===== 间距 & 圆角 ===== */
  --pc-radius-sm: 6px;
  --pc-radius-md: 10px;
  --pc-radius-lg: 16px;
  --pc-radius-xl: 24px;
  --pc-radius-full: 9999px;

  /* ===== 阴影 ===== */
  --pc-shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
  --pc-shadow-md: 0 4px 12px rgba(0,0,0,0.4);
  --pc-shadow-lg: 0 8px 30px rgba(0,0,0,0.5);
  --pc-shadow-glow-cyan: 0 0 20px rgba(6, 182, 212, 0.3);
  --pc-shadow-glow-green: 0 0 20px rgba(16, 185, 129, 0.3);
  --pc-shadow-glow-red: 0 0 20px rgba(239, 68, 68, 0.3);

  /* ===== 动画 ===== */
  --pc-transition-fast: 150ms ease;
  --pc-transition-normal: 250ms ease;
  --pc-transition-slow: 400ms cubic-bezier(0.4, 0, 0.2, 1);

  /* ===== 字体 ===== */
  --pc-font-display: 'Plus Jakarta Sans', 'Noto Sans SC', system-ui, sans-serif;
  --pc-font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;

  /* ===== 布局 ===== */
  --pc-max-width: 1200px;
  --pc-content-max: 800px;
  --pc-sidebar-width: 320px;
}

/* ===== 亮色模式覆盖 ===== */
@media (prefers-color-scheme: light) {
  :root[data-theme="auto"], :root:not([data-theme]) {
    --pc-bg-primary: #F8FAFC;
    --pc-bg-secondary: #FFFFFF;
    --pc-bg-tertiary: #F1F5F9;
    --pc-surface: #FFFFFF;
    --pc-surface-hover: #F1F5F9;
    --pc-border: #E2E8F0;
    --pc-border-light: #CBD5E1;
    --pc-text-primary: #0F172A;
    --pc-text-secondary: #475569;
    --pc-text-muted: #94A3B8;
    --pc-shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
    --pc-shadow-md: 0 4px 12px rgba(0,0,0,0.1);
    --pc-shadow-lg: 0 8px 30px rgba(0,0,0,0.12);
  }
}
:root[data-theme="light"] {
  --pc-bg-primary: #F8FAFC;
  --pc-bg-secondary: #FFFFFF;
  --pc-bg-tertiary: #F1F5F9;
  --pc-surface: #FFFFFF;
  --pc-surface-hover: #F1F5F9;
  --pc-border: #E2E8F0;
  --pc-border-light: #CBD5E1;
  --pc-text-primary: #0F172A;
  --pc-text-secondary: #475569;
  --pc-text-muted: #94A3B8;
  --pc-shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
  --pc-shadow-md: 0 4px 12px rgba(0,0,0,0.1);
  --pc-shadow-lg: 0 8px 30px rgba(0,0,0,0.12);
}
```

### 3.2 关键模块样式规则

**隐私承诺条**: 固定顶部，`backdrop-filter: blur(10px)`，半透明背景 `rgba(6,182,212,0.08)`，高度 36px，左侧盾牌图标有 `pulse` 动画循环

**Tab 区域**: 胶囊 Tab 组横向排列，背景 `var(--pc-bg-secondary)`，圆角 `var(--pc-radius-full)`；滑块指示器为绝对定位 `div`，`transition: transform 0.3s, width 0.3s`，背景 `var(--pc-accent-cyan)`，跟随激活 Tab 滑动

**输入组**: 最大宽度 640px 居中，高度 56px，背景 `var(--pc-surface)`，边框 `var(--pc-border)`；focus 态: 边框变 `var(--pc-accent-cyan)`，显示 `box-shadow: var(--pc-shadow-glow-cyan)`

**盾牌光圈**: 输入组外层包裹 `.pc-shield-ring`，使用 `::before` 伪元素绘制圆角矩形光圈；默认态不可见；检测中态 `opacity:1` 并播放 `spin` 旋转动画；安全态光圈变绿并停止旋转；危险态变红并播放 `shake` 抖动

**密码强度条**: 高度 6px，圆角满圆角；分 5 段色值: 0=`#EF4444`, 1=`#F97316`, 2=`#EAB308`, 3=`#22C55E`, 4=`#06B6D4`；宽度过渡 `transition: width 0.5s ease, background 0.3s ease`

**结果卡片进入动画**: `opacity: 0; transform: translateY(16px)` → `opacity: 1; transform: translateY(0)`，`transition-duration: 0.4s`，逐张增加 `transition-delay`

**泄露浏览器卡片**: 网格 3 列，每张卡片 `hover` 时 `transform: translateY(-4px)` + `box-shadow` 增强；卡片背景根据 `PwnCount` 计算热力色: `rgba(239,68,68, Math.min(pwnCount/1e8, 0.2))`

**密码生成器显示区**: `font-family: var(--pc-font-mono)`，字号 1.25rem，字间距 0.1em，背景 `var(--pc-bg-tertiary)`，带左侧青色竖线装饰

### 3.3 响应式断点

| 断点 | 规则 |
|------|------|
| `≤ 640px` (手机) | 单栏布局；Tab 横滚 + 隐藏文字只留图标；侧边广告 `display:none`；泄露卡片单列；输入框按钮纵向排列 |
| `641px ~ 1024px` (平板) | 两栏：内容区 + 侧边广告；泄露卡片 2 列 |
| `≥ 1025px` (桌面) | 标准两栏；泄露卡片 3 列 |

---

## 4. 验收标准 Checklist

### 视觉还原
- [ ] 暗色模式为默认，色彩变量全部通过 CSS 变量控制
- [ ] 亮色模式跟随系统偏好正确切换
- [ ] Hero 区标题/副标题/Badge 对齐正确，字体使用 Plus Jakarta Sans
- [ ] Tab 滑块指示器正确跟随激活 Tab 滑动
- [ ] 盾牌光圈动画流畅：检测中旋转、安全变绿、危险变红抖动
- [ ] 密码强度条 5 段色值正确，宽度过渡平滑
- [ ] 泄露卡片热力色根据规模正确渲染
- [ ] 密码生成器等宽字体显示，左侧青色竖线装饰可见

### 交互动效
- [ ] Tab 切换时面板淡入，旧面板隐藏无闪烁
- [ ] 输入框 focus/blur 边框色和阴影过渡平滑
- [ ] 结果卡片逐张出现（stagger 延迟）
- [ ] FAQ 手风琴展开/折叠有 `max-height` 过渡动画
- [ ] Toast 消息从右下角滑入，3 秒后自动消失
- [ ] 复制按钮点击后有视觉反馈（图标变化 + 文字变"已复制"）

### 响应式
- [ ] 640px 以下：Tab 只显示图标，输入按钮纵向排列
- [ ] 侧边广告在移动端隐藏
- [ ] 泄露卡片网格在不同断点正确切换 1/2/3 列
- [ ] Turnstile Widget 在移动端自适应宽度
- [ ] 密码生成器滑块在触控设备可正常拖拽

---

*文档 I-02 完成 — Landing 页面模板与样式规范全覆盖*
