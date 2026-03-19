<!-- json-learn-I-02_首页Landing_上传区.md -->

# JSON Learn — 首页 Landing / 学习 Hub (I-02)

---

## 1. 竞品 UI 对标表

| UI 区域 | JSONLint | W3Schools | GeeksForGeeks | MDN | 本次实现 | 差异化 |
|---------|----------|-----------|---------------|-----|---------|--------|
| Hero | 简单标题+描述 | 无专属 Hero | 面包屑+标题 | 标题+描述 | **大 Hero + 4 Badge + 学习路径** | 视觉冲击力+明确价值主张 |
| 分类导航 | 二级标题分区 | 左侧菜单树 | 标签分类 | 侧边导航 | **Pill Tab + 难度筛选 + Fuse搜索** | 三维筛选 |
| 文章卡片 | 标题+描述 | 纯列表 | 卡片+缩略图 | 纯列表 | **色条卡片 + 难度Badge + 时长 + 已读标记** | 信息密度高 |
| Featured | 单篇置顶 | 无 | 无 | 无 | **3篇精选大卡片** | 引导核心内容 |
| 数据集 | 同页47个 | 无 | 无 | 无 | **独立Section + 分类Tab + Copy/Validate/Download** | 交互式操作 |
| 学习路径 | 无 | Study Plan | 无 | 无 | **3路径卡片 + localStorage 进度条** | 游戏化 |
| 搜索 | 无 | 全站搜索 | 全站搜索 | 无 | **前端 Fuse.js 即时搜索** | 零服务器延迟 |

---

## 2. 完整 HTML 模板结构

```html
{{ define "content" }}

<!-- ═══ HERO 区 ═══ -->
<section class="learn-hero" id="learnHero">
  <div class="learn-hero__container">
    <h1 class="learn-hero__title" data-i18n="learn.hero.title">Learn JSON</h1>
    <p class="learn-hero__subtitle" data-i18n="learn.hero.subtitle">Everything you need to master JSON...</p>
    <div class="learn-hero__badges">
      <span class="hero-badge hero-badge--blue"><svg><!-- doc --></svg><span>53+ Tutorials</span></span>
      <span class="hero-badge hero-badge--green"><svg><!-- db --></svg><span>70+ Datasets</span></span>
      <span class="hero-badge hero-badge--purple"><svg><!-- code --></svg><span>10 Languages</span></span>
      <span class="hero-badge hero-badge--orange"><svg><!-- free --></svg><span>100% Free</span></span>
    </div>
  </div>
</section>

<!-- ═══ 顶部广告 ═══ -->
{{- template "partials/ad_slot.html" dict "SlotID" "json-learn-top" "Size" "728x90" "Mobile" "320x50" "ClientID" .AdsClientID "Enabled" .AdsEnabled }}

<!-- ═══ 学习路径 ×3 ═══ -->
<section class="learn-paths" id="learnPaths">
  <div class="learn-paths__grid">
    <!-- 入门路径：绿色左边条 -->
    <a href="#getting-started" class="path-card path-card--beginner">
      <div class="path-card__icon"><svg><!-- 萌芽 --></svg></div>
      <h3 data-i18n="learn.path.beginner_title">Beginner Path</h3>
      <p data-i18n="learn.path.beginner_desc">Learn syntax, data types, and file ops.</p>
      <span data-i18n="learn.path.beginner_count">10 articles</span>
      <div class="path-card__progress"><div class="path-card__progress-bar" data-level="beginner"></div></div>
    </a>
    <!-- 中级路径：橙色 -->
    <a href="#language-guides" class="path-card path-card--intermediate">
      <div class="path-card__icon"><svg><!-- 代码 --></svg></div>
      <h3 data-i18n="learn.path.intermediate_title">Intermediate Path</h3>
      <p data-i18n="learn.path.intermediate_desc">Use JSON in your language, fix errors, compare formats.</p>
      <span data-i18n="learn.path.intermediate_count">21 articles</span>
      <div class="path-card__progress"><div class="path-card__progress-bar" data-level="intermediate"></div></div>
    </a>
    <!-- 高级路径：红色 -->
    <a href="#advanced" class="path-card path-card--advanced">
      <div class="path-card__icon"><svg><!-- 火箭 --></svg></div>
      <h3 data-i18n="learn.path.advanced_title">Advanced Path</h3>
      <p data-i18n="learn.path.advanced_desc">JSON Schema, JSONPath, jq, security, databases, and AI.</p>
      <span data-i18n="learn.path.advanced_count">22 articles</span>
      <div class="path-card__progress"><div class="path-card__progress-bar" data-level="advanced"></div></div>
    </a>
  </div>
</section>

<!-- ═══ 筛选 & 搜索 ═══ -->
<section class="learn-filters" id="learnFilters">
  <div class="learn-filters__container">
    <!-- 搜索框 -->
    <div class="learn-search">
      <svg class="learn-search__icon"><!-- 搜索 --></svg>
      <input type="text" id="learnSearchInput" placeholder="Search tutorials..." autocomplete="off">
      <button id="learnSearchClear" style="display:none"><svg><!-- X --></svg></button>
    </div>
    <!-- 分类 Pill Tab -->
    <div class="learn-tabs" id="learnTabs" role="tablist">
      <button class="learn-tab learn-tab--active" data-category="all">All</button>
      <button class="learn-tab" data-category="getting-started">Getting Started</button>
      <button class="learn-tab" data-category="language-guides">Language Guides</button>
      <button class="learn-tab" data-category="error-fixing">Error Fixing</button>
      <button class="learn-tab" data-category="comparisons">Comparisons</button>
      <button class="learn-tab" data-category="advanced">Advanced</button>
      <button class="learn-tab" data-category="security">Security</button>
      <button class="learn-tab" data-category="real-world">Real-World</button>
    </div>
    <!-- 难度筛选 -->
    <div class="learn-level-filter" id="learnLevelFilter">
      <button class="level-btn level-btn--active" data-level="all">All Levels</button>
      <button class="level-btn" data-level="beginner">Beginner</button>
      <button class="level-btn" data-level="intermediate">Intermediate</button>
      <button class="level-btn" data-level="advanced">Advanced</button>
    </div>
    <p class="learn-result-count" id="learnResultCount"></p>
  </div>
</section>

<!-- ═══ 精选文章大卡片 ═══ -->
<section class="learn-featured" id="learnFeatured">
  {{ range .FeaturedArticles }}
  <a href="/json/learn/{{ .Slug }}" class="featured-card">
    <span class="featured-card__badge">Featured</span>
    <h2>{{ .Title }}</h2>
    <p>{{ .Description }}</p>
    <div class="featured-card__meta"><span class="level-badge level-badge--{{ .Level }}">{{ .Level }}</span><span>{{ .ReadTime }}m</span></div>
  </a>
  {{ end }}
</section>

<!-- ═══ 文章网格 ═══ -->
<section class="learn-articles" id="learnArticles">
  <div class="learn-articles__grid" id="learnArticlesGrid">
    {{ range .Articles }}
    <a href="/json/learn/{{ .Slug }}" class="article-card"
       data-category="{{ .Category }}" data-level="{{ .Level }}"
       data-slug="{{ .Slug }}" data-title="{{ .Title }}" data-tags="{{ join .Tags "," }}">
      <div class="article-card__accent" data-category="{{ .Category }}"></div>
      <div class="article-card__body">
        <div class="article-card__header">
          <span class="article-card__category">{{ .CategoryLabel }}</span>
          <span class="level-badge level-badge--{{ .Level }}">{{ .LevelLabel }}</span>
        </div>
        <h3 class="article-card__title">{{ .Title }}</h3>
        <p class="article-card__desc">{{ .Description }}</p>
        <div class="article-card__footer">
          <span class="article-card__time"><svg><!-- clock --></svg>{{ .ReadTime }}m</span>
          <span class="article-card__status" data-slug="{{ .Slug }}" style="display:none"><svg><!-- check --></svg>Completed</span>
        </div>
      </div>
    </a>
    {{ end }}
  </div>
  <!-- 无结果 -->
  <div class="learn-no-results" id="learnNoResults" style="display:none">
    <svg><!-- empty --></svg>
    <h3>No resources found.</h3>
    <button id="learnClearFilters">Clear filters</button>
  </div>
</section>

<!-- ═══ 侧边广告 ═══ -->
{{- template "partials/ad_slot.html" dict "SlotID" "json-learn-sidebar" "Size" "300x250" "MobileHide" true "ClientID" .AdsClientID "Enabled" .AdsEnabled }}

<!-- ═══ 数据集预览 ═══ -->
<section class="learn-datasets-preview" id="learnDatasetsPreview">
  <h2 data-i18n="learn.dataset.title">Free JSON Datasets</h2>
  <p data-i18n="learn.dataset.subtitle">Use these datasets for testing, learning, or in your projects.</p>
  <div class="dataset-tabs" id="datasetTabs">
    <button class="dataset-tab dataset-tab--active" data-category="all">All (70+)</button>
    <button class="dataset-tab" data-category="geographic">Geographic</button>
    <button class="dataset-tab" data-category="reference">Reference</button>
    <button class="dataset-tab" data-category="configuration">Config</button>
    <button class="dataset-tab" data-category="testing">Testing</button>
    <button class="dataset-tab" data-category="api-mocks">API Mocks</button>
    <button class="dataset-tab" data-category="ai-ml">AI & ML</button>
    <button class="dataset-tab" data-category="finance">Finance</button>
  </div>
  <div class="dataset-grid" id="datasetGrid">
    {{ range .DatasetsPreview }}
    <div class="dataset-card" data-category="{{ .Category }}">
      <div class="dataset-card__header"><span class="dataset-card__cat">{{ .CategoryLabel }}</span><span>{{ .Records }} records</span></div>
      <h4><a href="/json/datasets/{{ .Slug }}">{{ .Title }}</a></h4>
      <p>{{ .Description }}</p>
      <div class="dataset-card__meta"><span>Fields: {{ join .Fields ", " }}</span><span>{{ .Size }}</span></div>
      <div class="dataset-card__actions">
        <button class="dataset-btn" onclick="copyDataset(this)" data-slug="{{ .Slug }}">Copy</button>
        <button class="dataset-btn" onclick="validateDataset(this)" data-slug="{{ .Slug }}">Validate</button>
        <button class="dataset-btn" onclick="downloadDataset(this)" data-slug="{{ .Slug }}">Download</button>
      </div>
    </div>
    {{ end }}
  </div>
  <a href="/json/datasets" class="btn btn--primary">View All 70+ Datasets →</a>
</section>

<!-- ═══ 三特性卡片 ═══ -->
<section class="learn-features" id="learnFeatures">
  <div class="feature-card"><div class="feature-card__icon feature-card__icon--blue"><svg></svg></div><h3>Comprehensive</h3><p>53+ tutorials from basics to JSON Schema, JSONPath, jq, security, and API design.</p></div>
  <div class="feature-card"><div class="feature-card__icon feature-card__icon--green"><svg></svg></div><h3>100% Free</h3><p>All tutorials, datasets, and code examples are completely free. No registration required.</p></div>
  <div class="feature-card"><div class="feature-card__icon feature-card__icon--purple"><svg></svg></div><h3>Practical</h3><p>Real-world examples, interactive code playgrounds, and downloadable sample data.</p></div>
</section>

<!-- ═══ FAQ 手风琴 ═══ -->
<section class="learn-faq" id="learnFAQ">
  <h2 data-i18n="learn.faq.title">FAQ</h2>
  <div class="faq-list" id="faqList">
    {{ range $i, $faq := .FAQ }}
    <details class="faq-item" {{ if eq $i 0 }}open{{ end }}>
      <summary class="faq-item__question"><span>{{ $faq.Question }}</span><svg class="faq-item__chevron"></svg></summary>
      <div class="faq-item__answer"><p>{{ $faq.Answer }}</p></div>
    </details>
    {{ end }}
  </div>
</section>

<!-- ═══ 底部广告 ═══ -->
{{- template "partials/ad_slot.html" dict "SlotID" "json-learn-bottom" "Size" "728x90" "Mobile" "320x50" "ClientID" .AdsClientID "Enabled" .AdsEnabled }}

<!-- ═══ Toast ═══ -->
<div class="toast-container" id="toastContainer" aria-live="polite"></div>
{{ end }}
```

---

## 3. CSS 规范

### CSS 变量

```css
:root {
  --learn-primary: #1e40af;      --learn-primary-light: #3b82f6;
  --learn-primary-bg: #eff6ff;   --learn-bg: #f8fafc;
  --learn-surface: #ffffff;      --learn-text: #1e293b;
  --learn-text-secondary: #64748b; --learn-border: #e2e8f0;
  --learn-beginner: #059669;     --learn-beginner-bg: #ecfdf5;
  --learn-intermediate: #d97706; --learn-intermediate-bg: #fffbeb;
  --learn-advanced: #dc2626;     --learn-advanced-bg: #fef2f2;
  --learn-code-bg: #1e293b;      --learn-shadow: 0 1px 3px rgba(0,0,0,0.08);
  --learn-shadow-hover: 0 8px 25px rgba(0,0,0,0.12);
  --learn-radius: 12px;         --learn-radius-sm: 6px;
  --learn-transition: 200ms ease;
}
```

### 关键样式规则

**Hero 区**
- `background: linear-gradient(180deg, var(--learn-primary-bg) 0%, var(--learn-surface) 100%)`
- 标题 `font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 800`
- Badge 组 `display: flex; gap: 12px; flex-wrap: wrap; justify-content: center`
- Badge `padding: 6px 14px; border-radius: 20px; font-size: 14px; font-weight: 600`

**学习路径卡片**
- 三列 grid `grid-template-columns: repeat(3, 1fr)` → 移动端 `1fr`
- 左侧 4px 色条 `border-left: 4px solid var(--learn-beginner|intermediate|advanced)`
- Hover `transform: translateY(-4px); box-shadow: var(--learn-shadow-hover)`
- 进度条 `height: 4px; border-radius: 2px; background: var(--learn-border)` 内部填充色

**文章卡片**
- Grid `grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px`
- 左侧色条 `width: 4px; transition: width var(--learn-transition)`
- Hover 色条 `width: 6px` + `translateY(-2px)` + shadow
- 已读标记 `color: var(--learn-beginner); font-size: 13px`

**难度 Badge**
- Beginner: `background: var(--learn-beginner-bg); color: var(--learn-beginner)`
- Intermediate: `background: var(--learn-intermediate-bg); color: var(--learn-intermediate)`
- Advanced: `background: var(--learn-advanced-bg); color: var(--learn-advanced)`
- 共同 `padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600`

**数据集卡片**
- Grid `grid-template-columns: repeat(4, 1fr)` → 平板 `repeat(2, 1fr)` → 手机 `1fr`
- 操作栏 `display: flex; gap: 8px` 三按钮等宽

**搜索框 & Pill Tab**
- 搜索 `border-radius: 20px; padding: 10px 40px 10px 16px`
- Pill `border-radius: 20px; padding: 6px 16px`
- Active `background: var(--learn-primary); color: white`
- Inactive `background: var(--learn-primary-bg); color: var(--learn-text)`

**FAQ 手风琴**
- `<details>` 原生元素，`border-bottom: 1px solid var(--learn-border)`
- Chevron `transition: transform 200ms; transform: rotate(0)` → open `rotate(180deg)`
- Answer `max-height: 0 → 500px; transition: max-height 350ms ease; overflow: hidden`

**响应式断点**
- `≤640px`：单列布局，Tab 横向滚动 `overflow-x: auto; white-space: nowrap`
- `641-1024px`：2 列文章卡片，隐藏侧边广告
- `>1024px`：3 列文章 + 侧广告，4 列数据集

---

## 4. 验收标准 Checklist

### 视觉还原
- [ ] Hero 渐变背景、Badge 4个正确显示（蓝/绿/紫/橙）
- [ ] 学习路径 3 卡片色条入门绿/中级橙/高级红
- [ ] 文章卡片网格等距、高度一致（min-height 对齐）
- [ ] 难度 Badge 3 色区分清晰
- [ ] 数据集三连按钮等宽对齐
- [ ] FAQ 手风琴第一条默认展开
- [ ] 精选卡片区视觉突出（更大、主色边框）
- [ ] CSS 变量全覆盖，无硬编码色值

### 交互动效
- [ ] 文章卡片 hover 色条展宽 4→6px + translateY(-2px) + 阴影加深，过渡 200ms
- [ ] Tab 切换即时筛选，无闪烁无布局跳动
- [ ] 搜索 debounce 300ms，清除按钮有内容时显示
- [ ] 数据集 Copy 点击后按钮文字 → "✓ Copied" 持续 1.5s 后恢复
- [ ] Toast 右下角滑入 3s 自动消失
- [ ] 学习路径进度条动画填充（CSS transition 300ms）
- [ ] FAQ 展开/折叠过渡流畅

### 响应式
- [ ] 320px（iPhone SE）可正常显示，无水平滚动
- [ ] Tab 横向滚动不换行，滚动条隐藏
- [ ] 侧边广告 ≤1024px 隐藏（CSS display:none）
- [ ] 数据集 4→2→1 列过渡自然
- [ ] 搜索框全宽（移动端）
- [ ] Hero Badge 换行不错位
