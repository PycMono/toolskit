<!-- json-learn-I-04_结果列表UI.md -->

# JSON Learn — 结果列表 UI (I-04)

---

## 1. 竞品结果区 UI 对标表

| UI 特性 | JSONLint | W3Schools | GFG | MDN | 本次实现 | 差异化 |
|---------|----------|-----------|-----|-----|---------|--------|
| 卡片信息密度 | 标题+描述 | 标题 | 标题+描述+难度 | 标题 | **标题+描述+分类+难度+时长+已读** | 6维信息 |
| Hover 动效 | 无 | 背景色 | 边框 | 无 | **色条展宽+上浮+阴影** | 多层动效 |
| 文章页 TOC | 无 | 左侧菜单 | 右侧浮动 | 侧边 | **右侧浮动+滚动高亮+进度** | 沉浸阅读 |
| 代码交互 | 无 | Try It 编辑器 | 无 | 无 | **内嵌 Playground+实时验证** | 零跳转 |
| 数据集预览 | 纯表格 | 无 | 无 | 无 | **JSON高亮+字段说明+3按钮** | 即时操作 |
| 阅读进度 | 无 | 无 | 无 | 无 | **顶部进度条+已读标记** | 游戏化 |
| 面包屑 | 无 | ✅ | ✅ | ✅ | **✅ + JSON-LD** | SEO 增强 |
| 上下篇导航 | 无 | ✅ | ✅ | 无 | **✅ + 分类感知** | 连续学习 |
| 相关推荐 | 无 | 无 | ✅ | ✅ | **3篇同分类推荐卡片** | 降低跳出 |

---

## 2. 文章卡片渲染说明

### `renderArticleCard(article)` 设计规则

**卡片布局**

```
┌──┬────────────────────────────────────────────┐
│色│  [分类标签]              [难度Badge]         │
│条│  标题（h3，最多2行 ellipsis）                │
│4px│ 描述（p，最多3行 ellipsis）                 │
│  │  ─────────────────────────────────────       │
│  │  🕐 12m        ✅ Completed (条件显示)       │
└──┴────────────────────────────────────────────┘
```

**色条颜色按分类**

| 分类 | 色条颜色 |
|------|---------|
| getting-started | `#3b82f6`（蓝） |
| language-guides | `#8b5cf6`（紫） |
| error-fixing | `#ef4444`（红） |
| comparisons | `#f59e0b`（琥珀） |
| advanced | `#ec4899`（粉） |
| security | `#10b981`（绿） |
| real-world | `#06b6d4`（青） |

**交互状态**

| 状态 | 表现 |
|------|------|
| 默认 | `box-shadow: var(--learn-shadow); border-left: 4px solid {catColor}` |
| Hover | `border-left-width: 6px; transform: translateY(-2px); box-shadow: var(--learn-shadow-hover)` |
| 已读 | 右下角绿色 ✅ + "Completed" 文字 |
| 搜索匹配高亮 | 标题中匹配词 `<mark>` 黄底 |

**卡片进入动画**

```css
.article-card {
  opacity: 0;
  transform: translateY(12px);
  animation: cardFadeIn 400ms ease forwards;
}
@keyframes cardFadeIn {
  to { opacity: 1; transform: translateY(0); }
}
/* 错位延迟 */
.article-card:nth-child(1) { animation-delay: 0ms; }
.article-card:nth-child(2) { animation-delay: 50ms; }
.article-card:nth-child(3) { animation-delay: 100ms; }
/* ... 最多到第 9 个，之后统一 400ms */
```

---

## 3. 文章详情页结构说明

### 页面布局

```
┌─────────────────────────────────────────────────────┐
│  阅读进度条 (固定顶部 3px，主色渐变)                    │
├─────────────────────────────────────────────────────┤
│  面包屑: Home > Learn JSON > {Article Title}          │
├─────────────────────────────────────────────────────┤
│  ← Back to Learn                                      │
├──────────────────────────────────┬──────────────────┤
│                                  │  TOC 浮动面板     │
│  文章标题 (h1)                    │  ├ h2 Heading 1  │
│  [分类] [难度] [时长] [发布日期]   │  │ ├ h3 Sub 1    │
│                                  │  │ ├ h3 Sub 2    │
│  ───────────────────────         │  ├ h2 Heading 2  │
│                                  │  │ ├ h3 Sub 3    │
│  文章正文                         │  │               │
│  (Markdown 渲染 + Prism 高亮)     │  │  [侧边广告]    │
│                                  │  │  300x250      │
│  ┌─────────────────────────┐    │  │               │
│  │ ```json                  │    │  │               │
│  │ { "key": "value" }      │    │  │               │
│  │ ```        [▶ Try It]   │    │  │               │
│  └─────────────────────────┘    │  │               │
│                                  │  │               │
│  [展开的 Playground]              │  │               │
│  ┌──────────────────────────┐   │  │               │
│  │ textarea (可编辑)          │   │  │               │
│  │ [Run] [Reset]             │   │  │               │
│  │ Output: Valid ✓           │   │  │               │
│  └──────────────────────────┘   │  │               │
│                                  │  │               │
│  <div id="articleEnd"></div>     │                  │
├──────────────────────────────────┴──────────────────┤
│  上一篇 / 下一篇 导航                                │
│  ← JSON Syntax Rules    JSON Data Types →            │
├─────────────────────────────────────────────────────┤
│  相关文章推荐 (3 篇同分类卡片)                         │
├─────────────────────────────────────────────────────┤
│  FAQ 手风琴 (3~5 条文章专属 FAQ)                       │
├─────────────────────────────────────────────────────┤
│  底部广告 728x90                                      │
└─────────────────────────────────────────────────────┘
```

### 上下篇导航

```html
<nav class="article-nav" aria-label="Article navigation">
  {{ if .PrevArticle }}
  <a href="/json/learn/{{ .PrevArticle.Slug }}" class="article-nav__link article-nav__link--prev">
    <span class="article-nav__label">← Previous</span>
    <span class="article-nav__title">{{ .PrevArticle.Title }}</span>
  </a>
  {{ else }}<div></div>{{ end }}

  {{ if .NextArticle }}
  <a href="/json/learn/{{ .NextArticle.Slug }}" class="article-nav__link article-nav__link--next">
    <span class="article-nav__label">Next →</span>
    <span class="article-nav__title">{{ .NextArticle.Title }}</span>
  </a>
  {{ end }}
</nav>
```

### 相关文章推荐

```html
<section class="article-related">
  <h2 data-i18n="learn.article.related_title">Related Articles</h2>
  <div class="article-related__grid">
    {{ range .Related }}
    <a href="/json/learn/{{ .Slug }}" class="related-card">
      <span class="level-badge level-badge--{{ .Level }}">{{ .LevelLabel }}</span>
      <h3>{{ .Title }}</h3>
      <p>{{ .Description }}</p>
      <span>{{ .ReadTime }}m read</span>
    </a>
    {{ end }}
  </div>
</section>
```

---

## 4. 数据集详情页结构说明

### 页面布局

```
┌─────────────────────────────────────────────────────┐
│  面包屑: Home > Datasets > {Dataset Title}            │
├─────────────────────────────────────────────────────┤
│  数据集标题 (h1)                                      │
│  [分类Badge] [记录数] [大小]                           │
│  描述段落                                             │
├──────────────────────────────────┬──────────────────┤
│  字段说明表                       │  操作面板          │
│  | 字段名 | 类型 | 说明 |         │  [Copy JSON]      │
│  |--------|------|------|         │  [Download .json] │
│  | id     | int  | ... |         │  [Validate]       │
│  | name   | str  | ... |         │  [Download All]   │
│                                  │                   │
├──────────────────────────────────┴──────────────────┤
│  JSON 预览 (Prism 高亮, 折叠前 50 行 + "Show All")     │
│  ┌──────────────────────────────────────────────┐   │
│  │  [                                            │   │
│  │    { "id": 1, "name": "..." },                │   │
│  │    ...                                        │   │
│  │  ]                                            │   │
│  │  ────────────────────────────────────          │   │
│  │  [Show All 250 records ▼]                     │   │
│  └──────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│  相关数据集推荐 (3~4 个同分类)                         │
├─────────────────────────────────────────────────────┤
│  底部广告 728x90                                      │
└─────────────────────────────────────────────────────┘
```

### JSON 预览弹窗 `openDatasetFullPreview()`

```javascript
function openDatasetFullPreview(slug) {
  var script = document.querySelector('script[data-dataset="' + slug + '"]');
  if (!script) return;

  var overlay = document.createElement('div');
  overlay.className = 'preview-overlay';

  var modal = document.createElement('div');
  modal.className = 'preview-modal';
  modal.innerHTML =
    '<div class="preview-modal__header">' +
      '<h3>' + slug + '.json</h3>' +
      '<button class="preview-modal__close" aria-label="Close">&times;</button>' +
    '</div>' +
    '<div class="preview-modal__body">' +
      '<pre class="line-numbers"><code class="language-json">' +
        escapeHTML(formatJSON(script.textContent)) +
      '</code></pre>' +
    '</div>' +
    '<div class="preview-modal__footer">' +
      '<button class="btn btn--secondary" onclick="copyDataset(this)" data-slug="' + slug + '">Copy</button>' +
      '<button class="btn btn--primary" onclick="downloadDataset(this)" data-slug="' + slug + '">Download</button>' +
    '</div>';

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // 高亮
  if (window.Prism) Prism.highlightAllUnder(modal);

  // 关闭事件
  var closeBtn = modal.querySelector('.preview-modal__close');
  closeBtn.onclick = function() { closePreview(overlay); };
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closePreview(overlay);
  });
  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape') {
      closePreview(overlay);
      document.removeEventListener('keydown', escHandler);
    }
  });

  // 防止背景滚动
  document.body.style.overflow = 'hidden';
}

function closePreview(overlay) {
  overlay.classList.add('preview-overlay--closing');
  overlay.addEventListener('animationend', function() {
    overlay.remove();
    document.body.style.overflow = '';
  });
}
```

---

## 5. CSS 规范

### 文章卡片

```css
.article-card {
  display: flex;
  background: var(--learn-surface);
  border-radius: var(--learn-radius);
  box-shadow: var(--learn-shadow);
  overflow: hidden;
  transition: transform var(--learn-transition), box-shadow var(--learn-transition);
  cursor: pointer;
  text-decoration: none;
  color: inherit;
}
.article-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--learn-shadow-hover);
}
.article-card__accent {
  width: 4px;
  flex-shrink: 0;
  transition: width var(--learn-transition);
}
.article-card:hover .article-card__accent { width: 6px; }
.article-card__body { padding: 16px 20px; flex: 1; display: flex; flex-direction: column; }
.article-card__title {
  font-size: 16px; font-weight: 600; line-height: 1.4;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.article-card__desc {
  font-size: 14px; color: var(--learn-text-secondary); margin-top: 6px;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}
```

### 文章页 TOC

```css
.article-toc {
  position: sticky; top: 80px; max-height: calc(100vh - 100px);
  overflow-y: auto; padding: 16px; border-left: 2px solid var(--learn-border);
}
.toc-link {
  display: block; padding: 4px 0; font-size: 14px;
  color: var(--learn-text-secondary); text-decoration: none;
  border-left: 2px solid transparent; padding-left: 12px; margin-left: -18px;
  transition: color 150ms, border-color 150ms;
}
.toc-link--active {
  color: var(--learn-primary);
  border-left-color: var(--learn-primary);
  font-weight: 600;
}
.toc-link--h3 { padding-left: 24px; font-size: 13px; }
```

### 阅读进度条

```css
.read-progress {
  position: fixed; top: 0; left: 0; height: 3px; z-index: 9999;
  background: linear-gradient(90deg, var(--learn-primary), var(--learn-primary-light));
  width: 0%; transition: width 100ms linear;
}
```

### 预览弹窗

```css
.preview-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 10000;
  display: flex; align-items: center; justify-content: center;
  animation: overlayFadeIn 200ms ease;
}
.preview-modal {
  background: var(--learn-surface); border-radius: var(--learn-radius);
  width: 90vw; max-width: 900px; max-height: 85vh;
  display: flex; flex-direction: column;
  animation: modalSlideUp 300ms ease;
}
.preview-modal__body {
  flex: 1; overflow-y: auto; padding: 0 24px;
}
.preview-modal__body pre {
  background: var(--learn-code-bg); border-radius: var(--learn-radius-sm);
  max-height: none;
}
@keyframes overlayFadeIn { from { opacity: 0; } }
@keyframes modalSlideUp { from { transform: translateY(20px); opacity: 0; } }
.preview-overlay--closing { animation: overlayFadeOut 200ms ease forwards; }
@keyframes overlayFadeOut { to { opacity: 0; } }
```

### 移动端适配

```css
@media (max-width: 1024px) {
  .article-toc { display: none; }
  .article-toc--mobile-open { display: block; position: fixed; /* ... */ }
  .toc-toggle-btn { display: block; }
}
@media (max-width: 640px) {
  .article-nav { flex-direction: column; gap: 12px; }
  .article-related__grid { grid-template-columns: 1fr; }
  .preview-modal { width: 95vw; max-height: 90vh; }
}
```

---

## 6. 完整数据流 & 函数调用图

### Hub 页流程

```
页面加载
│
▼
initLearnHub()
├── 解析 DOM → LearnState.articles[]
├── loadReadProgress() → localStorage → 更新已读标记
├── new Fuse(articles) → LearnState.fuseInstance
├── bindTabEvents()
├── bindLevelFilterEvents()
├── bindSearchEvents()
├── bindDatasetTabEvents()
└── updatePathProgressBars()

用户交互
│
├── 点击 Tab → activeCategory → filterArticles() → 显示/隐藏卡片 → 更新计数
├── 点击难度 → activeLevel → filterArticles()
├── 输入搜索 → debounce → searchTerm → Fuse.search() → filterArticles()
├── 点击数据集Tab → filterDatasets() → 显示/隐藏数据集卡片
├── Copy → copyDataset() → clipboard.writeText() → showToast()
├── Download → downloadDataset() → Blob + saveAs() → showToast()
└── Validate → validateDataset() → sessionStorage/URL → window.open()
```

### 文章页流程

```
页面加载
│
▼
initArticlePage(slug)
├── buildTOC()
│   ├── querySelectorAll('h2,h3')
│   ├── 生成 slugify ID
│   ├── 构建 TOC HTML
│   └── initTOCObserver() → IntersectionObserver
│
├── Prism.highlightAll() → 代码高亮
│
├── injectPlaygroundButtons()
│   └── 遍历 code.language-json → 注入 "▶ Try It"
│
├── initReadProgressBar()
│   └── scroll → 更新进度条 width
│
└── initReadComplete(slug)
    └── IntersectionObserver(#articleEnd)
        └── 可见 → updateReadProgress(slug)
            ├── localStorage 写入
            ├── 更新卡片已读标记
            └── updatePathProgressBars()

用户交互
│
├── 点击 TOC 链接 → smooth scroll 到 heading
├── 滚动 → Observer 高亮当前 TOC
├── 点击 "Try It" → togglePlayground()
│   ├── 展开 textarea + Run/Reset/Output
│   ├── Run → tryParseJSON() → 显示结果
│   └── Reset → 恢复原始代码
├── 点击代码 Copy → clipboard → Toast
└── 滚到底部 → 自动标记已读
```

### 数据集详情页流程

```
页面加载
│
▼
initDatasetPage()
├── Prism.highlightAll() → JSON 预览高亮
├── 折叠逻辑 → 前 50 行可见 + "Show All"
└── 绑定操作按钮

用户交互
│
├── Copy → clipboard.writeText(全量JSON) → Toast
├── Download → Blob + saveAs() → Toast
├── Validate → 跳转验证器
├── Show All → 展开完整 JSON 预览
└── 全屏预览 → openDatasetFullPreview()
    ├── 创建 overlay + modal
    ├── Prism 高亮
    ├── ESC / 点击外部 → closePreview()
    └── 恢复 body overflow
```

---

## 7. 验收标准 Checklist

### 文章卡片
- [ ] 6 维信息完整（分类/难度/标题/描述/时长/已读）
- [ ] 色条颜色 7 分类正确对应
- [ ] Hover 色条 4→6px + translateY(-2px) + 阴影
- [ ] 标题 2 行 ellipsis / 描述 3 行 ellipsis
- [ ] 进入动画 opacity+translateY 错位延迟
- [ ] 已读绿勾正确显示

### 文章详情页
- [ ] 面包屑 3 级 + JSON-LD BreadcrumbList
- [ ] 阅读进度条固定顶部 3px，滚动联动
- [ ] TOC 右侧浮动，滚动高亮当前 heading
- [ ] TOC 移动端隐藏 + 可展开面板
- [ ] Prism 代码高亮 + 行号 + Copy
- [ ] JSON 代码块 "Try It" Playground
- [ ] 上下篇导航正确链接
- [ ] 相关文章 3 篇同分类
- [ ] FAQ 折叠正确
- [ ] 广告位正确（侧边 + 底部）

### 数据集详情页
- [ ] 字段说明表正确
- [ ] JSON 预览折叠（50 行 + Show All）
- [ ] Copy / Download / Validate 三按钮
- [ ] 全屏预览弹窗正确打开/关闭
- [ ] ESC 关闭弹窗
- [ ] 关闭时恢复 body 滚动
- [ ] 相关数据集推荐

### 批量下载
- [ ] Hub 页 "Download All" → JSZip 打包所有可见数据集 → .zip 下载
- [ ] 打包进度 Toast 提示

### 边界情况
- [ ] 文章不存在 → 404 页面
- [ ] 数据集不存在 → 404 页面
- [ ] 超长 JSON（>1MB）预览不卡顿（虚拟滚动或行数限制）
- [ ] 代码块超宽 → 横向滚动
- [ ] Playground 输入超长 JSON 不崩溃
- [ ] 弹窗打开时禁止背景滚动，关闭后恢复
- [ ] 多次快速点击 Copy 不重复 Toast
