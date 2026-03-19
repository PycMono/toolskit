<!-- json-datasets-I-02_首页Landing_数据集列表区.md -->

# json-datasets · I-02 首页 Landing / 数据集列表区

---

## 1. 竞品 UI 对标表

| UI 区域 | JSONLint Datasets | 本次实现 | 升级点 |
|---------|-------------------|----------|--------|
| 页面 Hero | 简单 H1 + 三个角标 | H1 + 副标题 + 三角标 + **搜索框** | 搜索框直接在 Hero 区，减少操作路径 |
| 分类 Tab | 6 个 Tab（All / Geographic / ...） | **14 个** Tab + 活跃数量气泡 | 覆盖更多专业分类 |
| 搜索 | 无 | **实时全文搜索（Fuse.js）** | 按名称/描述/字段即时过滤 |
| 排序 | 无 | **下拉排序**（热度/大小/记录数） | 快速定位目标数据集 |
| 卡片布局 | 3 列 + 简单文字 | 3 列 + **分类角标** + 字段类型预览 | 一眼看清数据结构 |
| 复制 | 一键复制全部 JSON | 同上，**+复制成功动效** | 体验更流畅 |
| 验证跳转 | 新标签页打开验证器 | **同页预填验证器（URL 参数传递）** | 无缝跳转 |
| 数据集详情 | 独立跳转页 | **右侧 Drawer（不离页）** | 保持上下文 |
| 暗色模式 | 无 | **全站暗色，跟随系统** | 开发者友好 |
| 数量统计 | 固定文字 | **动态实时显示当前过滤结果数** | 即时反馈 |
| 相关推荐 | 无 | **Drawer 内相关数据集推荐** | 引导发现 |
| 贡献入口 | Footer 链接 | **独立 CTA Banner** | 提升贡献率 |

---

## 2. 完整 HTML 模板结构

```html
{{/* templates/json/datasets.html */}}
{{ template "base.html" . }}

{{ define "extraHead" }}
  {{/* SEO 内容见 I-01 */}}
{{ end }}

{{ define "content" }}

<!-- ① 顶部广告位 -->
{{- template "partials/ad_slot.html" dict "SlotID" "json-datasets-top" "Size" "728x90" "Mobile" "320x50" "ClientID" .AdsClientID "Enabled" .AdsEnabled }}

<!-- ② Hero 区 -->
<section class="ds-hero" aria-labelledby="ds-hero-title">
  <div class="ds-hero__inner container">
    <h1 id="ds-hero-title" class="ds-hero__title" data-i18n="hero.title">Free JSON Datasets</h1>
    <p class="ds-hero__subtitle" data-i18n="hero.subtitle">
      85+ curated, open-source datasets for testing, building, and learning.
    </p>
    <div class="ds-hero__badges" role="list">
      <span class="ds-badge ds-badge--amber" role="listitem" data-i18n="hero.badge.total">85 Datasets</span>
      <span class="ds-badge ds-badge--blue"  role="listitem" data-i18n="hero.badge.categories">14 Categories</span>
      <span class="ds-badge ds-badge--green" role="listitem" data-i18n="hero.badge.license">Open Source</span>
    </div>
    <!-- 搜索框 -->
    <div class="ds-search" role="search">
      <input
        id="ds-search-input"
        type="search"
        class="ds-search__input"
        autocomplete="off"
        data-i18n-placeholder="filter.search_placeholder"
        aria-label="Search datasets"
        oninput="DS.onSearch(this.value)"
      >
      <svg class="ds-search__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <span id="ds-search-clear" class="ds-search__clear" onclick="DS.clearSearch()" aria-label="Clear search">✕</span>
    </div>
  </div>
</section>

<!-- ③ 主内容区 (2列布局：左主区 + 右侧边栏广告) -->
<div class="ds-layout container">

  <!-- 左：内容主区 -->
  <main class="ds-main" role="main">

    <!-- 分类 Tab 筛选 + 排序 -->
    <div class="ds-controls" role="toolbar" aria-label="Dataset filters">
      <div class="ds-tabs" role="tablist" id="ds-tab-list">
        <!-- Tab 列表由 JS 动态渲染，保持语义化 -->
        <button class="ds-tab ds-tab--active" role="tab" data-category="all"
          aria-selected="true" onclick="DS.filterByCategory('all')" data-i18n="filter.all">All</button>
        <button class="ds-tab" role="tab" data-category="geographic"
          aria-selected="false" onclick="DS.filterByCategory('geographic')" data-i18n="filter.geographic">Geographic</button>
        <!-- ... 其余 Tab 由 JS 循环渲染 ... -->
      </div>
      <div class="ds-sort-wrap">
        <select id="ds-sort-select" class="ds-sort-select" onchange="DS.onSort(this.value)" aria-label="Sort datasets">
          <option value="popular"      data-i18n="filter.sort.popular">Most Popular</option>
          <option value="records_desc" data-i18n="filter.sort.records_desc">Records: High to Low</option>
          <option value="records_asc"  data-i18n="filter.sort.records_asc">Records: Low to High</option>
          <option value="size_desc"    data-i18n="filter.sort.size_desc">Size: Large First</option>
          <option value="size_asc"     data-i18n="filter.sort.size_asc">Size: Small First</option>
        </select>
      </div>
    </div>

    <!-- 结果统计条 -->
    <div class="ds-result-bar" aria-live="polite">
      <span id="ds-result-count" class="ds-result-count">Showing <strong>85</strong> datasets</span>
    </div>

    <!-- 数据集卡片网格 -->
    <div id="ds-grid" class="ds-grid" role="list" aria-label="Dataset list">
      <!-- 卡片由 JS DS.renderGrid() 动态渲染 -->
      <!-- 加载骨架屏占位 -->
      <div class="ds-skeleton" aria-hidden="true"></div>
      <div class="ds-skeleton" aria-hidden="true"></div>
      <div class="ds-skeleton" aria-hidden="true"></div>
    </div>

    <!-- 无结果提示 -->
    <div id="ds-no-results" class="ds-no-results" hidden>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <p id="ds-no-results-text" data-i18n="filter.no_results"></p>
    </div>

    <!-- 贡献入口 CTA Banner -->
    <aside class="ds-contribute-banner" aria-label="Contribute a dataset">
      <div class="ds-contribute-banner__content">
        <strong data-i18n="contribute.title">Have a dataset to share?</strong>
        <span data-i18n="contribute.description">Submit a contribution on GitHub.</span>
      </div>
      <a href="https://github.com/toolboxnova/datasets/issues/new"
         target="_blank" rel="noopener"
         class="ds-btn ds-btn--outline"
         data-i18n="contribute.cta">Submit on GitHub</a>
    </aside>

    <!-- 特性卡片区（三列）-->
    <section class="ds-features" aria-label="Key features">
      <div class="ds-feature-card">
        <div class="ds-feature-card__icon ds-feature-card__icon--green">🔓</div>
        <h3 data-i18n="feature.open.title">Fully Open Source</h3>
        <p data-i18n="feature.open.desc">All datasets are MIT / CC-BY licensed. Use freely in any project.</p>
      </div>
      <div class="ds-feature-card">
        <div class="ds-feature-card__icon ds-feature-card__icon--blue">⚡</div>
        <h3 data-i18n="feature.instant.title">Instant Access</h3>
        <p data-i18n="feature.instant.desc">No registration, no API key. Copy, validate, or download in one click.</p>
      </div>
      <div class="ds-feature-card">
        <div class="ds-feature-card__icon ds-feature-card__icon--amber">🌐</div>
        <h3 data-i18n="feature.diverse.title">14 Categories</h3>
        <p data-i18n="feature.diverse.desc">From geographic and finance to AI/ML and IoT — datasets for every project.</p>
      </div>
    </section>

    <!-- FAQ 手风琴 -->
    <section class="ds-faq" aria-label="Frequently Asked Questions">
      <h2 class="ds-faq__title" data-i18n="faq.title">Frequently Asked Questions</h2>
      <div class="ds-faq__list" role="list">
        {{- range .FAQData }}
        <div class="ds-faq__item" role="listitem">
          <button class="ds-faq__q" aria-expanded="false"
            onclick="DS.toggleFAQ(this)">
            {{ .Question }}
            <svg class="ds-faq__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          <div class="ds-faq__a" hidden>
            <p>{{ .Answer }}</p>
          </div>
        </div>
        {{- end }}
      </div>
    </section>

    <!-- 底部广告位 -->
    {{- template "partials/ad_slot.html" dict "SlotID" "json-datasets-bottom" "Size" "728x90" "Mobile" "320x50" "ClientID" .AdsClientID "Enabled" .AdsEnabled }}

  </main>

  <!-- 右：侧边广告 -->
  <aside class="ds-sidebar" aria-label="Sidebar">
    {{- template "partials/ad_slot.html" dict "SlotID" "json-datasets-sidebar" "Size" "300x250" "MobileHide" true "ClientID" .AdsClientID "Enabled" .AdsEnabled }}

    <!-- CTA：其他 JSON 工具推荐 -->
    <div class="ds-sidebar__tools">
      <h4 data-i18n="cta.title">Work with your JSON</h4>
      <ul class="ds-sidebar__tool-list">
        <li><a href="/json/validator"  data-i18n="cta.validator">JSON Validator</a></li>
        <li><a href="/json/formatter"  data-i18n="cta.formatter">JSON Formatter</a></li>
        <li><a href="/json/schema"     data-i18n="cta.schema">Schema Validator</a></li>
        <li><a href="/json/diff"       data-i18n="cta.diff">JSON Diff</a></li>
      </ul>
    </div>
  </aside>

</div><!-- /.ds-layout -->

<!-- ④ 数据集详情 Drawer -->
<div id="ds-drawer-overlay" class="ds-drawer-overlay" onclick="DS.closeDrawer()" aria-hidden="true"></div>
<aside id="ds-drawer" class="ds-drawer" role="dialog" aria-modal="true" aria-labelledby="ds-drawer-title" hidden>
  <div class="ds-drawer__header">
    <h2 id="ds-drawer-title" class="ds-drawer__title" data-i18n="drawer.title">Dataset Details</h2>
    <button class="ds-drawer__close" onclick="DS.closeDrawer()" aria-label="Close drawer">✕</button>
  </div>
  <div class="ds-drawer__body">
    <!-- 分类角标 + 名称 -->
    <div class="ds-drawer__meta">
      <span id="ds-drawer-badge" class="ds-badge"></span>
      <span id="ds-drawer-records" class="ds-drawer__records"></span>
      <span id="ds-drawer-size" class="ds-drawer__size"></span>
    </div>
    <p id="ds-drawer-desc" class="ds-drawer__desc"></p>

    <!-- 字段列表 -->
    <h3 class="ds-drawer__section-title" data-i18n="drawer.fields_title">Fields</h3>
    <ul id="ds-drawer-fields" class="ds-drawer__fields" role="list"></ul>

    <!-- 使用场景标签 -->
    <h3 class="ds-drawer__section-title" data-i18n="drawer.use_cases_title">Use Cases</h3>
    <div id="ds-drawer-usecases" class="ds-drawer__tags"></div>

    <!-- API URL -->
    <h3 class="ds-drawer__section-title" data-i18n="drawer.api_url_label">Raw JSON URL</h3>
    <div class="ds-drawer__url-row">
      <code id="ds-drawer-url" class="ds-drawer__url"></code>
      <button class="ds-btn ds-btn--sm" onclick="DS.copyDrawerURL()" data-i18n="drawer.api_url_copy">Copy URL</button>
    </div>

    <!-- JSON 预览（语法高亮） -->
    <h3 class="ds-drawer__section-title" data-i18n="drawer.preview_title">JSON Preview</h3>
    <div class="ds-drawer__preview-wrap">
      <pre><code id="ds-drawer-preview" class="language-json"></code></pre>
    </div>

    <!-- 相关数据集 -->
    <h3 class="ds-drawer__section-title" data-i18n="drawer.related_title">Related Datasets</h3>
    <ul id="ds-drawer-related" class="ds-drawer__related" role="list"></ul>
  </div>
  <div class="ds-drawer__footer">
    <button class="ds-btn ds-btn--primary" id="ds-drawer-download-btn" onclick="DS.downloadFromDrawer()" data-i18n="drawer.download_btn">Download JSON</button>
    <button class="ds-btn ds-btn--secondary" id="ds-drawer-validate-btn" onclick="DS.validateFromDrawer()" data-i18n="drawer.validate_btn">Validate in Tool</button>
  </div>
</aside>

<!-- Toast 通知 -->
<div id="ds-toast" class="ds-toast" role="alert" aria-live="assertive" aria-atomic="true"></div>

{{ end }}
```

---

## 3. CSS 规范

```css
/* ========== CSS 变量 ========== */
:root {
  /* 主色 */
  --ds-color-primary:        #f59e0b;
  --ds-color-primary-dark:   #d97706;
  --ds-color-primary-light:  #fde68a;

  /* 背景/表面 */
  --ds-color-bg:             #0f0f0f;
  --ds-color-bg-card:        #1a1a1a;
  --ds-color-bg-card-hover:  #242424;
  --ds-color-bg-drawer:      #181818;
  --ds-color-bg-input:       #222;

  /* 边框 */
  --ds-color-border:         #2e2e2e;
  --ds-color-border-focus:   #f59e0b;

  /* 文字 */
  --ds-color-text:           #f5f5f5;
  --ds-color-text-muted:     #888;
  --ds-color-text-code:      #e6db74;

  /* 状态色 */
  --ds-color-success:        #22c55e;
  --ds-color-error:          #ef4444;
  --ds-color-info:           #3b82f6;

  /* 圆角 */
  --ds-radius-sm:   6px;
  --ds-radius-md:   10px;
  --ds-radius-lg:   16px;
  --ds-radius-full: 9999px;

  /* 阴影 */
  --ds-shadow-card:   0 2px 8px rgba(0,0,0,.4);
  --ds-shadow-drawer: -4px 0 32px rgba(0,0,0,.6);
  --ds-shadow-toast:  0 4px 16px rgba(0,0,0,.5);

  /* 间距 */
  --ds-space-xs: 4px;
  --ds-space-sm: 8px;
  --ds-space-md: 16px;
  --ds-space-lg: 24px;
  --ds-space-xl: 40px;

  /* 动效 */
  --ds-transition: 0.18s ease;
  --ds-transition-drawer: 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ========== 分类角标颜色 ========== */
.ds-badge--geographic  { background: linear-gradient(135deg, #16a34a, #15803d); }
.ds-badge--reference   { background: linear-gradient(135deg, #2563eb, #1d4ed8); }
.ds-badge--configuration { background: linear-gradient(135deg, #ea580c, #c2410c); }
.ds-badge--testing     { background: linear-gradient(135deg, #dc2626, #b91c1c); }
.ds-badge--api_mocks   { background: linear-gradient(135deg, #7c3aed, #6d28d9); }
.ds-badge--finance     { background: linear-gradient(135deg, #ca8a04, #a16207); }
.ds-badge--science     { background: linear-gradient(135deg, #0891b2, #0e7490); }
.ds-badge--sports      { background: linear-gradient(135deg, #65a30d, #4d7c0f); }
.ds-badge--devops      { background: linear-gradient(135deg, #475569, #334155); }
.ds-badge--aiml        { background: linear-gradient(135deg, #db2777, #be185d); }
.ds-badge--government  { background: linear-gradient(135deg, #1e40af, #1e3a8a); }
.ds-badge--social      { background: linear-gradient(135deg, #0284c7, #0369a1); }
.ds-badge--iot         { background: linear-gradient(135deg, #c2410c, #9a3412); }
.ds-badge--healthcare  { background: linear-gradient(135deg, #059669, #047857); }

/* ========== 卡片规则 ========== */
/*
  .ds-card {
    display: flex; flex-direction: column;
    border: 1px solid var(--ds-color-border);
    border-radius: var(--ds-radius-md);
    background: var(--ds-color-bg-card);
    padding: var(--ds-space-md);
    cursor: pointer;
    transition: transform var(--ds-transition), box-shadow var(--ds-transition), border-color var(--ds-transition);
  }
  .ds-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--ds-shadow-card);
    border-color: var(--ds-color-primary);
  }
  .ds-card__footer { margin-top: auto; }  → 操作栏始终贴底
*/

/* ========== Drawer 规则 ========== */
/*
  .ds-drawer {
    position: fixed; right: 0; top: 0; bottom: 0;
    width: min(480px, 100vw);
    background: var(--ds-color-bg-drawer);
    box-shadow: var(--ds-shadow-drawer);
    transform: translateX(100%);
    transition: transform var(--ds-transition-drawer);
    z-index: 1000;
    overflow-y: auto;
  }
  .ds-drawer--open { transform: translateX(0); }

  .ds-drawer-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,.5);
    backdrop-filter: blur(2px);
    z-index: 999;
    opacity: 0; pointer-events: none;
    transition: opacity var(--ds-transition-drawer);
  }
  .ds-drawer-overlay--visible { opacity: 1; pointer-events: auto; }
*/

/* ========== 搜索框动效 ========== */
/*
  .ds-search__input:focus {
    border-color: var(--ds-color-primary);
    box-shadow: 0 0 0 3px rgba(245,158,11,.2);
    outline: none;
  }
  动态 placeholder 通过 JS setInterval 每 2s 更换
*/

/* ========== Grid 响应式 ========== */
/*
  .ds-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--ds-space-md);
  }
  @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 640px)  { grid-template-columns: 1fr; }
*/

/* ========== 卡片进入动画 ========== */
/*
  @keyframes ds-card-enter {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .ds-card { animation: ds-card-enter 0.22s ease both; }
  卡片渲染时按 index 设置 animation-delay: calc(index * 30ms)，最多延迟 300ms
*/

/* ========== Toast ========== */
/*
  .ds-toast {
    position: fixed; bottom: 24px; right: 24px;
    background: var(--ds-color-bg-card);
    border: 1px solid var(--ds-color-border);
    color: var(--ds-color-text);
    padding: 10px 18px;
    border-radius: var(--ds-radius-md);
    box-shadow: var(--ds-shadow-toast);
    font-size: 14px;
    z-index: 9999;
    opacity: 0; transform: translateY(8px);
    transition: opacity .2s ease, transform .2s ease;
    pointer-events: none;
  }
  .ds-toast--visible { opacity: 1; transform: translateY(0); pointer-events: auto; }
  .ds-toast--success { border-color: var(--ds-color-success); }
  .ds-toast--error   { border-color: var(--ds-color-error); }
*/
```

---

## 4. 验收标准 Checklist

### 视觉还原

- [ ] Hero 区背景深黑 `#0f0f0f`，主色琥珀黄 `#f59e0b` 用于角标和 Hover 边框
- [ ] 14 个分类 Tab 各有独立渐变角标颜色，渲染正确
- [ ] 卡片等高，底部操作栏（Copy / Validate / Download）对齐
- [ ] Drawer 宽度 ≤ 480px，移动端占满屏幕宽
- [ ] JSON Preview 使用 highlight.js github-dark 主题渲染
- [ ] 骨架屏在数据加载完成前显示，加载完毕后淡出消失
- [ ] 无搜索结果状态显示空状态插图 + 文字提示

### 交互动效

- [ ] 卡片 Hover 有 `translateY(-2px)` + 主色边框高亮动效
- [ ] 卡片渲染时有错开的进入动画（stagger delay）
- [ ] Drawer 从右侧滑入，背景遮罩模糊层淡入
- [ ] Copy 按钮点击后变为 "Copied!" + 绿色，1.5s 后恢复
- [ ] Tab 切换卡片列表以 fade + translateY 动效重新渲染
- [ ] 搜索框 placeholder 每 2s 轮播不同示例词
- [ ] FAQ 手风琴展开/收起有高度过渡动画
- [ ] Drawer ESC 键关闭

### 响应式

- [ ] ≥ 1280px：3 列卡片 + 右侧广告侧栏
- [ ] 768px ~ 1279px：2 列卡片，侧栏广告隐藏
- [ ] < 768px：1 列卡片，侧栏广告隐藏，Drawer 全宽
- [ ] 移动端 Tab 可横向滑动（overflow-x: auto）
- [ ] 触摸设备 Drawer 可从右边缘向左滑动关闭
