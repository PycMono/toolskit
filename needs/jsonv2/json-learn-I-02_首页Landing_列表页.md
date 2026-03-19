<!-- json-learn-I-02_首页Landing_列表页.md -->

# JSON Learn — 首页 Landing / 文章列表页

---

## 1. 竞品 UI 对标表

| UI 区域 | JSONLint Learn | W3Schools | MDN | **本次实现** | 差异化 |
|---------|---------------|-----------|-----|-------------|--------|
| Hero 区 | 简洁标题 + 4 Badge | 无 Hero | 无 Hero | **渐变背景 + 动态统计 Badge + 搜索框** | 更强视觉冲击力 |
| 路径卡片 | 3 张彩色顶条卡片 | 无 | 无 | **3 张卡片 + 进度条 + 悬停上浮** | 增加学习进度追踪 |
| 分类筛选 | 横向标签按钮组 | 左侧树状导航 | 左侧列表 | **双排筛选：分类 + 难度级别** | 多维度组合筛选 |
| 搜索 | 基础搜索框 | 全站搜索 | 全站搜索 | **Fuse.js 即时模糊搜索 + 高亮** | 前端零延迟 |
| 文章卡片 | 标题 + 分类 Badge + 难度 Badge | 简单列表 | 简单列表 | **封面图标 + 标题 + 摘要 + 分类/难度/时长** | 信息密度更高 |
| 广告位 | 顶部 + 底部 | 侧边栏 | 无 | **顶部 + 侧边 + 底部** | 3 位标准布局 |
| FAQ | 无 | 无 | 无 | **手风琴 FAQ + JSON-LD** | SEO 加分项 |
| 移动端 | 基础适配 | 优秀 | 优秀 | **移动优先设计** | 触摸友好交互 |

---

## 2. 完整 HTML 模板结构

```html
{{ define "content" }}

<!-- ===================== Hero 区域 ===================== -->
<section class="learn-hero">
  <div class="container">
    <h1 class="learn-hero__title" data-i18n="learn.hero.title">
      {{ i18n .Lang "learn.hero.title" }}
    </h1>
    <p class="learn-hero__subtitle" data-i18n="learn.hero.subtitle">
      {{ i18n .Lang "learn.hero.subtitle" }}
    </p>

    <!-- 统计 Badge 组 -->
    <div class="learn-hero__badges">
      <span class="hero-badge hero-badge--tutorials">
        <span class="hero-badge__icon">📚</span>
        <span data-i18n="learn.hero.badge_tutorials">{{ i18n .Lang "learn.hero.badge_tutorials" }}</span>
      </span>
      <span class="hero-badge hero-badge--datasets">
        <span class="hero-badge__icon">💾</span>
        <span data-i18n="learn.hero.badge_datasets">{{ i18n .Lang "learn.hero.badge_datasets" }}</span>
      </span>
      <span class="hero-badge hero-badge--languages">
        <span class="hero-badge__icon">🖥️</span>
        <span data-i18n="learn.hero.badge_languages">{{ i18n .Lang "learn.hero.badge_languages" }}</span>
      </span>
      <span class="hero-badge hero-badge--free">
        <span class="hero-badge__icon">🆓</span>
        <span data-i18n="learn.hero.badge_free">{{ i18n .Lang "learn.hero.badge_free" }}</span>
      </span>
    </div>
  </div>
</section>

<!-- ===================== 顶部广告位 ===================== -->
{{- template "partials/ad_slot.html" dict
  "SlotID" "json-learn-top" "Size" "728x90" "Mobile" "320x50"
  "ClientID" .AdsClientID "Enabled" .AdsEnabled }}

<!-- ===================== 路径选择器 ===================== -->
<section class="learn-paths" id="paths">
  <div class="container">
    <div class="paths-grid">

      <!-- 入门路径 -->
      <a href="#beginner" class="path-card path-card--beginner" data-level="beginner">
        <div class="path-card__top-bar"></div>
        <div class="path-card__body">
          <span class="path-card__icon">🌱</span>
          <h2 class="path-card__title" data-i18n="learn.path.beginner.title">
            {{ i18n .Lang "learn.path.beginner.title" }}
          </h2>
          <p class="path-card__desc" data-i18n="learn.path.beginner.desc">
            {{ i18n .Lang "learn.path.beginner.desc" }}
          </p>
          <span class="path-card__count" data-i18n="learn.path.beginner.count">
            {{ i18n .Lang "learn.path.beginner.count" }}
          </span>
          <!-- 进度条 -->
          <div class="path-card__progress">
            <div class="path-card__progress-bar" data-path="beginner" style="width: 0%"></div>
          </div>
        </div>
      </a>

      <!-- 中级路径 -->
      <a href="#intermediate" class="path-card path-card--intermediate" data-level="intermediate">
        <div class="path-card__top-bar"></div>
        <div class="path-card__body">
          <span class="path-card__icon">💻</span>
          <h2 class="path-card__title" data-i18n="learn.path.intermediate.title">
            {{ i18n .Lang "learn.path.intermediate.title" }}
          </h2>
          <p class="path-card__desc" data-i18n="learn.path.intermediate.desc">
            {{ i18n .Lang "learn.path.intermediate.desc" }}
          </p>
          <span class="path-card__count" data-i18n="learn.path.intermediate.count">
            {{ i18n .Lang "learn.path.intermediate.count" }}
          </span>
          <div class="path-card__progress">
            <div class="path-card__progress-bar" data-path="intermediate" style="width: 0%"></div>
          </div>
        </div>
      </a>

      <!-- 高级路径 -->
      <a href="#advanced" class="path-card path-card--advanced" data-level="advanced">
        <div class="path-card__top-bar"></div>
        <div class="path-card__body">
          <span class="path-card__icon">🚀</span>
          <h2 class="path-card__title" data-i18n="learn.path.advanced.title">
            {{ i18n .Lang "learn.path.advanced.title" }}
          </h2>
          <p class="path-card__desc" data-i18n="learn.path.advanced.desc">
            {{ i18n .Lang "learn.path.advanced.desc" }}
          </p>
          <span class="path-card__count" data-i18n="learn.path.advanced.count">
            {{ i18n .Lang "learn.path.advanced.count" }}
          </span>
          <div class="path-card__progress">
            <div class="path-card__progress-bar" data-path="advanced" style="width: 0%"></div>
          </div>
        </div>
      </a>

    </div>
  </div>
</section>

<!-- ===================== 搜索 + 筛选区 ===================== -->
<section class="learn-filters">
  <div class="container">

    <!-- 搜索框 -->
    <div class="filter-search">
      <span class="filter-search__icon">🔍</span>
      <input type="text" id="searchInput" class="filter-search__input"
        placeholder="{{ i18n .Lang "learn.filter.search_placeholder" }}"
        data-i18n-placeholder="learn.filter.search_placeholder"
        autocomplete="off">
    </div>

    <!-- 分类标签（第一排） -->
    <div class="filter-tags" id="categoryFilters">
      <button class="filter-tag filter-tag--active" data-filter="all"
        data-i18n="learn.filter.all">{{ i18n .Lang "learn.filter.all" }}</button>
      <button class="filter-tag" data-filter="basics"
        data-i18n="learn.filter.basics">{{ i18n .Lang "learn.filter.basics" }}</button>
      <button class="filter-tag" data-filter="multi_lang"
        data-i18n="learn.filter.multi_lang">{{ i18n .Lang "learn.filter.multi_lang" }}</button>
      <button class="filter-tag" data-filter="debugging"
        data-i18n="learn.filter.debugging">{{ i18n .Lang "learn.filter.debugging" }}</button>
      <button class="filter-tag" data-filter="comparison"
        data-i18n="learn.filter.comparison">{{ i18n .Lang "learn.filter.comparison" }}</button>
      <button class="filter-tag" data-filter="advanced_topics"
        data-i18n="learn.filter.advanced_topics">{{ i18n .Lang "learn.filter.advanced_topics" }}</button>
      <button class="filter-tag" data-filter="security"
        data-i18n="learn.filter.security">{{ i18n .Lang "learn.filter.security" }}</button>
      <button class="filter-tag" data-filter="practical"
        data-i18n="learn.filter.practical">{{ i18n .Lang "learn.filter.practical" }}</button>
    </div>

    <!-- 难度筛选（第二排） -->
    <div class="filter-levels" id="levelFilters">
      <button class="level-tag level-tag--active" data-level="all"
        data-i18n="learn.filter.level_all">{{ i18n .Lang "learn.filter.level_all" }}</button>
      <button class="level-tag level-tag--beginner" data-level="beginner"
        data-i18n="learn.filter.level_beginner">{{ i18n .Lang "learn.filter.level_beginner" }}</button>
      <button class="level-tag level-tag--intermediate" data-level="intermediate"
        data-i18n="learn.filter.level_intermediate">{{ i18n .Lang "learn.filter.level_intermediate" }}</button>
      <button class="level-tag level-tag--advanced" data-level="advanced"
        data-i18n="learn.filter.level_advanced">{{ i18n .Lang "learn.filter.level_advanced" }}</button>
    </div>

  </div>
</section>

<!-- ===================== 文章列表区 ===================== -->
<section class="learn-articles">
  <div class="container">
    <div class="articles-grid" id="articlesList">

      {{ range .Articles }}
      <a href="/json/learn/{{ .Slug }}" class="article-card"
        data-slug="{{ .Slug }}"
        data-category="{{ .Category }}"
        data-level="{{ .Level }}"
        data-title="{{ .Title }}"
        data-title-en="{{ .TitleEN }}"
        data-article-slug="{{ .Slug }}">

        <!-- 顶部彩色条 -->
        <div class="article-card__bar article-card__bar--{{ .Level }}"></div>

        <div class="article-card__body">
          <!-- 分类 + 难度 Badge -->
          <div class="article-card__meta">
            <span class="badge badge--category badge--{{ .Category }}">
              {{ categoryName $.Lang .Category }}
            </span>
            <span class="badge badge--level badge--{{ .Level }}">
              {{ levelName $.Lang .Level }}
            </span>
          </div>

          <!-- 标题 -->
          <h3 class="article-card__title">
            {{ if eq $.Lang "en" }}{{ .TitleEN }}{{ else }}{{ .Title }}{{ end }}
          </h3>

          <!-- 摘要 -->
          <p class="article-card__summary">
            {{ if eq $.Lang "en" }}{{ .SummaryEN }}{{ else }}{{ .Summary }}{{ end }}
          </p>

          <!-- 底部信息栏 -->
          <div class="article-card__footer">
            <span class="article-card__time">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
              </svg>
              {{ .ReadTime }} {{ if eq $.Lang "en" }}min{{ else }}分钟{{ end }}
            </span>
            <span class="article-card__date">{{ .UpdatedAt }}</span>
          </div>
        </div>
      </a>
      {{ end }}

    </div>

    <!-- 空状态 -->
    <div class="articles-empty" id="articlesEmpty" style="display:none;">
      <div class="articles-empty__icon">🔍</div>
      <p class="articles-empty__text" data-i18n="learn.status.empty">
        {{ i18n .Lang "learn.status.empty" }}
      </p>
    </div>

  </div>
</section>

<!-- ===================== 侧边广告位（桌面端） ===================== -->
{{- template "partials/ad_slot.html" dict
  "SlotID" "json-learn-sidebar" "Size" "300x250" "MobileHide" true
  "ClientID" .AdsClientID "Enabled" .AdsEnabled }}

<!-- ===================== 三特性卡片 ===================== -->
<section class="learn-features">
  <div class="container">
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-card__icon">🔒</div>
        <h3 class="feature-card__title" data-i18n="learn.feature.privacy_title">
          {{ i18n .Lang "learn.feature.privacy_title" }}
        </h3>
        <p class="feature-card__desc" data-i18n="learn.feature.privacy_desc">
          {{ i18n .Lang "learn.feature.privacy_desc" }}
        </p>
      </div>
      <div class="feature-card">
        <div class="feature-card__icon">⚡</div>
        <h3 class="feature-card__title" data-i18n="learn.feature.speed_title">
          {{ i18n .Lang "learn.feature.speed_title" }}
        </h3>
        <p class="feature-card__desc" data-i18n="learn.feature.speed_desc">
          {{ i18n .Lang "learn.feature.speed_desc" }}
        </p>
      </div>
      <div class="feature-card">
        <div class="feature-card__icon">🎁</div>
        <h3 class="feature-card__title" data-i18n="learn.feature.free_title">
          {{ i18n .Lang "learn.feature.free_title" }}
        </h3>
        <p class="feature-card__desc" data-i18n="learn.feature.free_desc">
          {{ i18n .Lang "learn.feature.free_desc" }}
        </p>
      </div>
    </div>
  </div>
</section>

<!-- ===================== FAQ 手风琴 ===================== -->
<section class="learn-faq">
  <div class="container">
    <h2 class="learn-faq__title" data-i18n="learn.faq.title">
      {{ i18n .Lang "learn.faq.title" }}
    </h2>
    <div class="faq-list" id="faqList">
      {{ range $i, $faq := .FAQs }}
      <div class="faq-item" data-faq-index="{{ $i }}">
        <button class="faq-item__question" onclick="toggleFAQ(this)" aria-expanded="false">
          <span>{{ $faq.Question }}</span>
          <svg class="faq-item__arrow" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2">
            <polyline points="6,9 12,15 18,9"/>
          </svg>
        </button>
        <div class="faq-item__answer" aria-hidden="true">
          <p>{{ $faq.Answer }}</p>
        </div>
      </div>
      {{ end }}
    </div>
  </div>
</section>

<!-- ===================== 底部广告位 ===================== -->
{{- template "partials/ad_slot.html" dict
  "SlotID" "json-learn-bottom" "Size" "728x90" "Mobile" "320x50"
  "ClientID" .AdsClientID "Enabled" .AdsEnabled }}

<!-- ===================== Toast 容器 ===================== -->
<div class="toast-container" id="toastContainer"></div>

{{ end }}
```

---

## 3. CSS 规范

### CSS 变量定义

```css
:root {
  /* 主色系 */
  --learn-primary: #3B82F6;
  --learn-primary-light: #60A5FA;
  --learn-primary-dark: #2563EB;
  --learn-primary-bg: #EFF6FF;

  /* 级别色 */
  --learn-beginner: #10B981;
  --learn-beginner-bg: #ECFDF5;
  --learn-intermediate: #F59E0B;
  --learn-intermediate-bg: #FFFBEB;
  --learn-advanced: #EF4444;
  --learn-advanced-bg: #FEF2F2;

  /* 分类色 */
  --learn-cat-basics: #3B82F6;
  --learn-cat-multilang: #8B5CF6;
  --learn-cat-debugging: #F97316;
  --learn-cat-comparison: #06B6D4;
  --learn-cat-advanced: #EC4899;
  --learn-cat-security: #EF4444;
  --learn-cat-practical: #10B981;

  /* 中性色 */
  --learn-bg-primary: #FFFFFF;
  --learn-bg-secondary: #F8FAFC;
  --learn-bg-tertiary: #F1F5F9;
  --learn-text-primary: #0F172A;
  --learn-text-secondary: #64748B;
  --learn-text-muted: #94A3B8;
  --learn-border: #E2E8F0;
  --learn-border-light: #F1F5F9;

  /* 阴影 */
  --learn-shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --learn-shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
  --learn-shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1);
  --learn-shadow-hover: 0 10px 25px rgba(59,130,246,0.15);

  /* 圆角 */
  --learn-radius-sm: 6px;
  --learn-radius-md: 10px;
  --learn-radius-lg: 16px;
  --learn-radius-full: 9999px;

  /* 过渡 */
  --learn-transition: 0.2s ease;
  --learn-transition-slow: 0.3s ease;
}
```

### 关键样式规则

**Hero 区域**：
- 背景使用 `linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 50%, #BFDBFE 100%)`
- 标题 `font-size: clamp(2rem, 5vw, 3.5rem)`，`font-weight: 800`
- Badge 组使用 `display: flex; flex-wrap: wrap; gap: 12px; justify-content: center`
- 每个 Badge 白色背景 + 圆角 + 微阴影，hover 时微微上浮 `translateY(-2px)`

**路径卡片**：
- 三列 grid `grid-template-columns: repeat(3, 1fr); gap: 24px`
- 顶部彩色条：`height: 4px; border-radius: var(--learn-radius-lg) var(--learn-radius-lg) 0 0`
- 入门 → `--learn-beginner`，中级 → `--learn-intermediate`，高级 → `--learn-advanced`
- hover 状态：`transform: translateY(-4px); box-shadow: var(--learn-shadow-hover)`
- 进度条：高度 4px，圆角，背景 `var(--learn-bg-tertiary)`，填充色跟随路径色

**分类筛选标签**：
- `display: flex; flex-wrap: wrap; gap: 8px; justify-content: center`
- 默认态：白色背景 + 灰色边框 + 灰色文字
- 激活态 `.filter-tag--active`：`background: var(--learn-primary); color: white; border-color: var(--learn-primary)`
- 过渡：`transition: all var(--learn-transition)`

**文章卡片**：
- 三列 grid，`gap: 20px`
- 白色背景 + 1px 边框 + 圆角 `var(--learn-radius-md)`
- 顶部彩色条同路径卡片规则
- 入场动画：`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`
- 每张卡片 `animation-delay` 递增 50ms
- hover 效果：上浮 + 阴影增强 + 标题变色

**FAQ 手风琴**：
- 问题按钮全宽，左文字 + 右箭头
- 答案区域 `max-height: 0; overflow: hidden; transition: max-height 0.3s ease`
- 展开时 `max-height: 500px`，箭头旋转 180°

### 响应式断点

```
/* 移动端 */
@media (max-width: 640px) {
  路径卡片 → 单列
  文章卡片 → 单列
  侧边广告 → display: none
  Badge 组 → 2x2 grid
}

/* 平板 */
@media (min-width: 641px) and (max-width: 1024px) {
  路径卡片 → 三列保持（缩小间距）
  文章卡片 → 两列
}

/* 桌面 */
@media (min-width: 1025px) {
  全部三列布局
  侧边广告显示
}
```

---

## 4. 验收标准 Checklist

### 视觉还原
- [ ] Hero 区渐变背景 + 大标题 + 副标题 + 4 个 Badge 正确显示
- [ ] 三张路径卡片彩色顶条（绿/橙/红）颜色准确
- [ ] 分类标签切换激活态样式正确
- [ ] 难度标签切换独立于分类标签
- [ ] 文章卡片三列布局，间距均匀
- [ ] 文章卡片分类 Badge 颜色与分类对应
- [ ] FAQ 手风琴箭头旋转动画流畅
- [ ] 广告位占位符在 AdsEnabled=false 时显示灰块
- [ ] 三特性卡片图标 + 标题 + 描述完整

### 交互动效
- [ ] 路径卡片 hover 上浮 + 阴影增强
- [ ] 文章卡片入场 staggered fade-in 动画
- [ ] 文章卡片 hover 上浮效果
- [ ] 分类标签点击切换即时过滤文章列表
- [ ] 难度标签点击切换即时过滤
- [ ] 分类 + 难度组合筛选正确
- [ ] 搜索框输入即时过滤（Fuse.js 模糊搜索）
- [ ] 搜索无结果时显示空状态提示
- [ ] FAQ 手风琴点击展开/收起，同时只展开一个
- [ ] Toast 消息显示 + 自动消失

### 响应式
- [ ] 移动端（< 640px）路径卡片单列，文章卡片单列
- [ ] 平板（641-1024px）文章卡片两列
- [ ] 桌面端（> 1024px）全部三列
- [ ] 移动端侧边广告隐藏
- [ ] 搜索框移动端全宽
- [ ] Badge 组移动端换行正确
- [ ] 触摸设备 FAQ 手风琴点击区域足够大（min-height: 48px）

### i18n
- [ ] 中英文切换所有文案正确替换
- [ ] 搜索框 placeholder 跟随语言
- [ ] 文章标题/摘要跟随语言显示

