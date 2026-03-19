<!-- json-learn-I-03_前端处理引擎.md -->

# JSON Learn — 前端处理引擎 (I-03)

---

## 1. 技术选型表

| 模块 | 方案 | 原因 |
|------|------|------|
| 代码高亮 | Prism.js + Autoloader | 轻量 <10KB，按需加载，主题丰富 |
| 代码复制 | Prism Copy-to-Clipboard | 原生插件，无额外依赖 |
| 行号 | Prism Line-Numbers | 文章代码需行号参考 |
| 文章搜索 | Fuse.js | 前端模糊搜索，支持权重，零服务器 |
| 阅读进度 | 原生 JS + localStorage | 轻量，跨会话持久 |
| TOC | 原生 JS + IntersectionObserver | 从 h2/h3 自动生成，性能优 |
| Playground | textarea + JSON.parse() | 纯前端，零依赖 |
| 数据集操作 | Clipboard API + Blob + FileSaver.js | 全客户端处理 |
| 批量打包 | JSZip | 多数据集打 .zip |
| Toast | 自定义实现 | 不引入 UI 库 |

---

## 2. 引擎架构说明

### 2.1 全局状态对象

```javascript
var LearnState = {
  // Hub 页
  articles: [],            // 从 DOM data-* 解析的文章元数据
  filteredArticles: [],
  activeCategory: 'all',
  activeLevel: 'all',
  searchTerm: '',
  fuseInstance: null,
  readArticles: [],        // localStorage 已读 slug 列表
  STORAGE_KEY: 'tbx_learn_read',
  datasetCategory: 'all',

  // 文章页
  tocHeadings: [],
  tocObserver: null,
  activeTocId: '',
  readProgressPct: 0,

  // 常量
  SEARCH_DEBOUNCE_MS: 300,
  TOAST_DURATION_MS: 3000,
  FUSE_OPTIONS: {
    keys: [
      { name: 'title', weight: 0.5 },
      { name: 'tags', weight: 0.3 },
      { name: 'category', weight: 0.2 }
    ],
    threshold: 0.4
  }
};
```

### 2.2 核心函数职责

#### `initLearnHub()`

Hub 页初始化入口：
1. 从 DOM `.article-card` 的 `data-*` 解析文章元数据 → `LearnState.articles`
2. 从 localStorage 读取已读列表 → 更新已读标记 DOM
3. 初始化 Fuse.js 实例
4. 绑定 Tab / 难度筛选 / 搜索 / 数据集Tab 事件
5. 更新学习路径进度条

```javascript
function initLearnHub() {
  // 1. 解析文章元数据
  var cards = document.querySelectorAll('.article-card');
  LearnState.articles = Array.from(cards).map(function(card) {
    return {
      slug: card.dataset.slug,
      title: card.dataset.title,
      category: card.dataset.category,
      level: card.dataset.level,
      tags: (card.dataset.tags || '').split(','),
      el: card
    };
  });

  // 2. 已读状态
  loadReadProgress();

  // 3. Fuse 搜索
  LearnState.fuseInstance = new Fuse(LearnState.articles, LearnState.FUSE_OPTIONS);

  // 4. 事件绑定
  bindTabEvents();
  bindLevelFilterEvents();
  bindSearchEvents();
  bindDatasetTabEvents();

  // 5. 进度条
  updatePathProgressBars();
}
```

#### `filterArticles()`

三维联合筛选：
1. 如 `searchTerm` 非空 → Fuse.js 搜索获取匹配 slug 列表
2. 遍历 articles DOM → 显示/隐藏（category + level + search 三重过滤）
3. 更新结果计数；0 结果 → 显示空状态

```javascript
function filterArticles() {
  var matchSlugs = null;
  if (LearnState.searchTerm) {
    var results = LearnState.fuseInstance.search(LearnState.searchTerm);
    matchSlugs = results.map(function(r) { return r.item.slug; });
  }

  var shown = 0;
  LearnState.articles.forEach(function(a) {
    var catOK = LearnState.activeCategory === 'all' || a.category === LearnState.activeCategory;
    var lvlOK = LearnState.activeLevel === 'all' || a.level === LearnState.activeLevel;
    var searchOK = !matchSlugs || matchSlugs.indexOf(a.slug) !== -1;
    var visible = catOK && lvlOK && searchOK;
    a.el.style.display = visible ? '' : 'none';
    if (visible) shown++;
  });

  document.getElementById('learnResultCount').textContent =
    t('learn.filter.showing').replace('{count}', shown).replace('{total}', LearnState.articles.length);
  document.getElementById('learnNoResults').style.display = shown === 0 ? '' : 'none';
  document.getElementById('learnFeatured').style.display =
    (LearnState.activeCategory === 'all' && !LearnState.searchTerm) ? '' : 'none';
}
```

#### `loadReadProgress()` / `updateReadProgress(slug)`

```javascript
function loadReadProgress() {
  try {
    var raw = localStorage.getItem(LearnState.STORAGE_KEY);
    LearnState.readArticles = raw ? JSON.parse(raw) : [];
  } catch (e) {
    LearnState.readArticles = [];
  }
  // 更新卡片已读标记
  LearnState.readArticles.forEach(function(slug) {
    var badge = document.querySelector('.article-card__status[data-slug="' + slug + '"]');
    if (badge) badge.style.display = '';
  });
}

function updateReadProgress(slug) {
  if (LearnState.readArticles.indexOf(slug) !== -1) return;
  LearnState.readArticles.push(slug);
  try {
    localStorage.setItem(LearnState.STORAGE_KEY, JSON.stringify(LearnState.readArticles));
  } catch (e) { /* 隐私模式 fallback */ }
  var badge = document.querySelector('.article-card__status[data-slug="' + slug + '"]');
  if (badge) badge.style.display = '';
  updatePathProgressBars();
}
```

#### `updatePathProgressBars()`

计算各难度路径已读比例，更新进度条宽度：

```javascript
function updatePathProgressBars() {
  var levels = { beginner: 10, intermediate: 21, advanced: 22 };
  Object.keys(levels).forEach(function(level) {
    var total = levels[level];
    var read = LearnState.articles.filter(function(a) {
      return a.level === level && LearnState.readArticles.indexOf(a.slug) !== -1;
    }).length;
    var bar = document.querySelector('.path-card__progress-bar[data-level="' + level + '"]');
    if (bar) bar.style.width = Math.round((read / total) * 100) + '%';
  });
}
```

#### `initArticlePage()`

文章页初始化：
1. `buildTOC()` → 从 h2/h3 生成右侧浮动目录
2. `Prism.highlightAll()` → 代码高亮
3. `injectPlaygroundButtons()` → JSON 代码块注入 "Try It"
4. `initReadProgressBar()` → 顶部 3px 进度条
5. IntersectionObserver 监测底部 → 到达 95% 标记已读

```javascript
function initArticlePage(slug) {
  buildTOC();
  if (window.Prism) Prism.highlightAll();
  injectPlaygroundButtons();
  initReadProgressBar();
  initReadComplete(slug);
}
```

#### `buildTOC()`

1. 查询 `.article-content h2, h3`
2. 自动生成 slugify ID
3. 构建 TOC HTML（h2 一级 / h3 二级缩进）
4. IntersectionObserver 监听 heading 进入视口 → 高亮 TOC 项

```javascript
function buildTOC() {
  var container = document.getElementById('tocList');
  var headings = document.querySelectorAll('.article-content h2, .article-content h3');
  if (!container || headings.length === 0) return;

  var html = '';
  headings.forEach(function(h) {
    var id = h.id || slugify(h.textContent);
    h.id = id;
    var level = h.tagName === 'H2' ? 'toc-link--h2' : 'toc-link--h3';
    html += '<a href="#' + id + '" class="toc-link ' + level + '">' + h.textContent + '</a>';
  });
  container.innerHTML = html;

  initTOCObserver();
}
```

#### `injectPlaygroundButtons()`

1. 遍历 `pre > code.language-json`
2. 在 pre 右上角插入 `▶ Try It` 按钮
3. 点击 → 展开 Playground（textarea 预填代码 + Run/Reset + Output 区）

```javascript
function injectPlaygroundButtons() {
  document.querySelectorAll('pre > code.language-json').forEach(function(codeEl) {
    var pre = codeEl.parentElement;
    if (pre.querySelector('.playground-btn')) return;

    var btn = document.createElement('button');
    btn.className = 'playground-btn';
    btn.textContent = '▶ Try It';
    btn.onclick = function() { togglePlayground(pre, codeEl.textContent); };
    pre.style.position = 'relative';
    pre.appendChild(btn);
  });
}
```

#### `tryParseJSON(input)`

1. `try { JSON.parse(input) }`
2. 成功 → `JSON.stringify(parsed, null, 2)` + 绿色 "Valid ✓"
3. 失败 → 红色错误信息 + 行号定位

```javascript
function tryParseJSON(input) {
  try {
    var parsed = JSON.parse(input);
    return { valid: true, output: JSON.stringify(parsed, null, 2), error: null };
  } catch (e) {
    var match = e.message.match(/position (\d+)/);
    var pos = match ? parseInt(match[1]) : -1;
    var line = pos >= 0 ? input.substring(0, pos).split('\n').length : -1;
    return { valid: false, output: null, error: e.message, line: line };
  }
}
```

#### `copyDataset(btn)` / `downloadDataset(btn)` / `validateDataset(btn)`

- **Copy**: 读取隐藏 `<script type="application/json">` 内容 → `navigator.clipboard.writeText()` → Toast
- **Download**: `new Blob() → FileSaver.saveAs(blob, slug + '.json')` → Toast
- **Validate**: 编码为 URI → 跳转 `/json/validate?data=...`（大数据 → sessionStorage）

```javascript
function copyDataset(btn) {
  var slug = btn.dataset.slug;
  var script = document.querySelector('script[data-dataset="' + slug + '"]');
  if (!script) return;

  navigator.clipboard.writeText(script.textContent).then(function() {
    btn.textContent = '✓ Copied';
    showToast('learn.toast.copied', 'success');
    setTimeout(function() { btn.textContent = 'Copy'; }, 1500);
    gaTrackEvent('json-learn', 'dataset_copy', slug);
  }).catch(function() {
    showToast('learn.toast.copy_failed', 'error');
  });
}

function downloadDataset(btn) {
  var slug = btn.dataset.slug;
  var script = document.querySelector('script[data-dataset="' + slug + '"]');
  if (!script) return;

  var blob = new Blob([script.textContent], { type: 'application/json' });
  saveAs(blob, slug + '.json');
  showToast('learn.toast.download_started', 'info');
  gaTrackEvent('json-learn', 'dataset_download', slug);
}

function validateDataset(btn) {
  var slug = btn.dataset.slug;
  var script = document.querySelector('script[data-dataset="' + slug + '"]');
  if (!script) return;

  var data = script.textContent;
  if (data.length > 2000) {
    try { sessionStorage.setItem('tbx_validate_data', data); } catch (e) {}
    window.open('/json/validate?from=session', '_blank');
  } else {
    window.open('/json/validate?data=' + encodeURIComponent(data), '_blank');
  }
  gaTrackEvent('json-learn', 'dataset_validate', slug);
}
```

#### `showToast(key, type)`

创建 toast DOM → 插入 `#toastContainer` → 300ms slide-in → TOAST_DURATION_MS 后 slide-out → 移除

```javascript
function showToast(messageKey, type) {
  var container = document.getElementById('toastContainer');
  var toast = document.createElement('div');
  toast.className = 'toast toast--' + (type || 'info');
  toast.textContent = t(messageKey);

  container.appendChild(toast);
  requestAnimationFrame(function() { toast.classList.add('toast--visible'); });

  setTimeout(function() {
    toast.classList.remove('toast--visible');
    toast.addEventListener('transitionend', function() { toast.remove(); });
  }, LearnState.TOAST_DURATION_MS);
}
```

#### 工具函数

```javascript
function debounce(fn, ms) {
  var timer;
  return function() {
    var ctx = this, args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function() { fn.apply(ctx, args); }, ms);
  };
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function t(key) {
  return window.__i18n && window.__i18n[key] || key;
}
```

---

## 3. UI 事件绑定说明

### 分类 Tab 切换

```javascript
function bindTabEvents() {
  document.querySelectorAll('.learn-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.learn-tab').forEach(function(t) {
        t.classList.remove('learn-tab--active');
      });
      this.classList.add('learn-tab--active');
      LearnState.activeCategory = this.dataset.category;
      filterArticles();
      gaTrackEvent('json-learn', 'filter_category', LearnState.activeCategory);
    });
  });
}
```

### 难度筛选

```javascript
function bindLevelFilterEvents() {
  document.querySelectorAll('.level-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.level-btn').forEach(function(b) {
        b.classList.remove('level-btn--active');
      });
      this.classList.add('level-btn--active');
      LearnState.activeLevel = this.dataset.level;
      filterArticles();
      gaTrackEvent('json-learn', 'filter_level', LearnState.activeLevel);
    });
  });
}
```

### 搜索框

```javascript
function bindSearchEvents() {
  var searchInput = document.getElementById('learnSearchInput');
  var clearBtn = document.getElementById('learnSearchClear');

  searchInput.addEventListener('input', debounce(function(e) {
    LearnState.searchTerm = e.target.value.trim();
    clearBtn.style.display = LearnState.searchTerm ? 'block' : 'none';
    filterArticles();
    if (LearnState.searchTerm) {
      gaTrackEvent('json-learn', 'search_query', LearnState.searchTerm);
    }
  }, LearnState.SEARCH_DEBOUNCE_MS));

  clearBtn.addEventListener('click', function() {
    searchInput.value = '';
    LearnState.searchTerm = '';
    clearBtn.style.display = 'none';
    filterArticles();
  });

  document.getElementById('learnClearFilters').addEventListener('click', function() {
    searchInput.value = '';
    LearnState.searchTerm = '';
    LearnState.activeCategory = 'all';
    LearnState.activeLevel = 'all';
    document.querySelectorAll('.learn-tab').forEach(function(t, i) {
      t.classList.toggle('learn-tab--active', i === 0);
    });
    document.querySelectorAll('.level-btn').forEach(function(b, i) {
      b.classList.toggle('level-btn--active', i === 0);
    });
    clearBtn.style.display = 'none';
    filterArticles();
  });
}
```

### TOC 滚动高亮

```javascript
function initTOCObserver() {
  var headings = document.querySelectorAll('.article-content h2, .article-content h3');
  LearnState.tocObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        document.querySelectorAll('.toc-link').forEach(function(l) {
          l.classList.remove('toc-link--active');
        });
        var link = document.querySelector('.toc-link[href="#' + entry.target.id + '"]');
        if (link) link.classList.add('toc-link--active');
      }
    });
  }, { rootMargin: '-80px 0px -70% 0px' });
  headings.forEach(function(h) { LearnState.tocObserver.observe(h); });
}
```

### 阅读进度条

```javascript
function initReadProgressBar() {
  var bar = document.getElementById('readProgressBar');
  if (!bar) return;

  window.addEventListener('scroll', function() {
    var scrollTop = document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var pct = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
    bar.style.width = pct + '%';
  }, { passive: true });
}
```

### 阅读完成检测

```javascript
function initReadComplete(slug) {
  var sentinel = document.getElementById('articleEnd');
  if (!sentinel) return;
  var obs = new IntersectionObserver(function(entries) {
    if (entries[0].isIntersecting) {
      updateReadProgress(slug);
      obs.disconnect();
      gaTrackEvent('json-learn', 'article_read_complete', slug);
    }
  }, { threshold: 0.5 });
  obs.observe(sentinel);
}
```

### FAQ 折叠

使用原生 `<details>` + `<summary>`，CSS 过渡：

```css
details .faq-item__answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 350ms ease;
}
details[open] .faq-item__answer {
  max-height: 500px;
}
details summary .faq-item__chevron {
  transition: transform 200ms;
}
details[open] summary .faq-item__chevron {
  transform: rotate(180deg);
}
```

### 数据集 Tab 切换

```javascript
function bindDatasetTabEvents() {
  document.querySelectorAll('.dataset-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.dataset-tab').forEach(function(t) {
        t.classList.remove('dataset-tab--active');
      });
      this.classList.add('dataset-tab--active');
      LearnState.datasetCategory = this.dataset.category;
      filterDatasets();
    });
  });
}

function filterDatasets() {
  document.querySelectorAll('.dataset-card').forEach(function(card) {
    var visible = LearnState.datasetCategory === 'all' || card.dataset.category === LearnState.datasetCategory;
    card.style.display = visible ? '' : 'none';
  });
}
```

---

## 4. 验收标准 Checklist

### 搜索 & 筛选
- [ ] Fuse.js 模糊搜索匹配标题和标签
- [ ] 分类 + 难度 + 搜索三维联合过滤
- [ ] 清除搜索恢复全部
- [ ] 清除所有筛选按钮重置三维
- [ ] 无结果显示空状态 + 清除按钮
- [ ] 搜索时隐藏精选区

### 阅读进度
- [ ] localStorage 正确存储/读取已读列表
- [ ] 已读文章 Hub 页绿勾标记
- [ ] 学习路径进度条百分比正确（beginner/10, intermediate/21, advanced/22）
- [ ] 文章页顶部进度条跟随滚动 0→100%
- [ ] 滚到 95% 自动标记已读
- [ ] 重复访问已读文章不重复标记

### 代码高亮 & Playground
- [ ] Prism.js 正确高亮 JSON / JS / Python / Go / Java / Rust / PHP / C# / Ruby / Swift
- [ ] 行号显示正确
- [ ] 一键复制按钮 + 视觉反馈（✓ Copied）
- [ ] JSON 代码块 "Try It" 按钮
- [ ] Playground 展开/折叠流畅
- [ ] 有效 JSON → 绿色 "Valid ✓" + 格式化输出
- [ ] 无效 JSON → 红色错误 + 行号定位
- [ ] Reset 恢复原始代码

### TOC
- [ ] h2/h3 正确生成目录（h3 缩进）
- [ ] 滚动高亮当前 heading（rootMargin 正确）
- [ ] 点击 TOC 平滑滚动到对应 heading
- [ ] 无 heading 不显示 TOC 面板
- [ ] 移动端 TOC 折叠为可展开面板

### 数据集操作
- [ ] Copy 复制完整 JSON + Toast "已复制"
- [ ] Download 触发 .json 文件下载
- [ ] Validate 跳转验证器带数据（小数据 URL / 大数据 sessionStorage）
- [ ] 分类 Tab 筛选正确

### 性能 & 内存
- [ ] 搜索防抖 300ms
- [ ] IntersectionObserver 代替 scroll 事件（TOC / 已读检测）
- [ ] 滚动进度条使用 passive listener
- [ ] 离开页面 disconnect Observer
- [ ] Prism Autoloader 按需加载语言包

### 边界情况
- [ ] localStorage 不可用（隐私模式）→ 不报错，进度不持久
- [ ] 超长代码块横向滚动不破坏布局
- [ ] 超长标题 2 行 text-overflow ellipsis
- [ ] 复制失败 → fallback Toast 提示
- [ ] 53 篇文章全量渲染无性能问题
- [ ] sessionStorage 不可用 → Validate 降级为 URL 参数（截断警告）
