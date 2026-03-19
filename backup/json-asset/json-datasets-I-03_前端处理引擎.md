<!-- json-datasets-I-03_前端处理引擎.md -->

# json-datasets · I-03 前端处理引擎

---

## 1. 技术选型表

| 功能场景 | 方案 | 原因 |
|----------|------|------|
| 数据集全文搜索 | **Fuse.js 7.x** | 轻量（< 10KB）、无需后端、支持字段权重、模糊匹配 |
| JSON 语法高亮 | **highlight.js 11.x** | 零依赖、支持 JSON 语言包按需加载、github-dark 主题与设计吻合 |
| 分类/排序过滤 | **原生 JS Array 方法** | 数据集规模 ≤ 200 条，无需引入重型库 |
| 数据集 JSON 加载 | **fetch + 内联 JS 对象** | 数据集元数据内联在 JS 中，无额外 HTTP 请求；实际 JSON 文件通过静态文件服务 |
| 批量下载 | **单文件直接下载（Blob URL）** | 每个数据集独立下载，无需 JSZip |
| 剪贴板操作 | **navigator.clipboard.writeText** | 现代浏览器原生支持，降级到 execCommand |
| Drawer 滑入 | **CSS Transform + JS class toggle** | 纯 CSS 动画，无额外依赖 |
| 懒加载 | **IntersectionObserver** | 仅在卡片进入视口时执行渲染，优化首屏性能 |

---

## 2. 引擎架构说明

### 全局状态对象

```javascript
const DS = (function () {

  // ===== 全局状态 =====
  const state = {
    allDatasets:      [],    // 完整数据集定义数组（见 I-04）
    filteredDatasets: [],    // 当前过滤/搜索/排序后的结果
    activeCategory:   'all', // 当前激活的分类 Tab
    searchQuery:      '',    // 当前搜索词
    sortOrder:        'popular', // 当前排序方式
    currentDrawerSlug: null,  // 当前 Drawer 打开的数据集 slug
    fuse:             null,   // Fuse.js 实例
    placeholderTimer: null,   // 搜索框 placeholder 轮播定时器
    lang:             document.documentElement.lang || 'en',
  };

  // ===== 常量 =====
  const STATIC_BASE = '/static/datasets/';
  const VALIDATOR_URL = '/json/validator';
  const PLACEHOLDER_EXAMPLES = [
    'Try "http status"',
    'Try "mock users"',
    'Try "countries"',
    'Try "crypto"',
    'Try "aws regions"',
    'Try "icd codes"',
  ];
```

### 核心函数职责

#### `init()`

```javascript
  function init() {
    // 1. 加载数据集元数据（来自内联 JS 对象 DATASETS_META，见 I-04）
    state.allDatasets = window.DATASETS_META || [];

    // 2. 初始化 Fuse.js
    state.fuse = new Fuse(state.allDatasets, {
      keys: [
        { name: 'name',        weight: 0.4 },
        { name: 'description', weight: 0.3 },
        { name: 'fields',      weight: 0.2 }, // fields 为字符串数组
        { name: 'tags',        weight: 0.1 },
      ],
      threshold: 0.35,
      includeScore: true,
    });

    // 3. 渲染分类 Tab
    renderTabs();

    // 4. 执行初始过滤+渲染
    applyFilters();

    // 5. 启动 placeholder 轮播
    startPlaceholderRotation();

    // 6. 绑定全局键盘事件（ESC 关闭 Drawer）
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && state.currentDrawerSlug) closeDrawer();
    });
  }
```

#### `applyFilters()`

```javascript
  function applyFilters() {
    let result = state.allDatasets;

    // 步骤 1：分类过滤
    if (state.activeCategory !== 'all') {
      result = result.filter(d => d.category === state.activeCategory);
    }

    // 步骤 2：搜索过滤（使用 Fuse.js）
    if (state.searchQuery.trim().length > 0) {
      const fuseResult = state.fuse.search(state.searchQuery);
      const slugSet = new Set(fuseResult.map(r => r.item.slug));
      result = result.filter(d => slugSet.has(d.slug));
      // 按 Fuse score 排序（score 越低越匹配）
      result.sort((a, b) => {
        const sa = fuseResult.find(r => r.item.slug === a.slug)?.score ?? 1;
        const sb = fuseResult.find(r => r.item.slug === b.slug)?.score ?? 1;
        return sa - sb;
      });
    } else {
      // 步骤 3：应用排序
      applySortOrder(result);
    }

    state.filteredDatasets = result;
    renderGrid(result);
    updateResultCount(result.length);
    toggleNoResults(result.length === 0);
  }
```

#### `applySortOrder(arr)`

```javascript
  function applySortOrder(arr) {
    switch (state.sortOrder) {
      case 'popular':
        arr.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        break;
      case 'records_desc':
        arr.sort((a, b) => b.records - a.records);
        break;
      case 'records_asc':
        arr.sort((a, b) => a.records - b.records);
        break;
      case 'size_desc':
        arr.sort((a, b) => b.sizeBytes - a.sizeBytes);
        break;
      case 'size_asc':
        arr.sort((a, b) => a.sizeBytes - b.sizeBytes);
        break;
    }
  }
```

#### `renderGrid(datasets)`

```javascript
  function renderGrid(datasets) {
    const grid = document.getElementById('ds-grid');
    grid.innerHTML = '';

    if (datasets.length === 0) return;

    const frag = document.createDocumentFragment();
    datasets.forEach(function (ds, index) {
      const card = buildCard(ds, index);
      frag.appendChild(card);
    });
    grid.appendChild(frag);
  }
```

#### `buildCard(ds, index)` — 卡片 DOM 构建

```javascript
  function buildCard(ds, index) {
    const card = document.createElement('div');
    card.className = 'ds-card';
    card.setAttribute('role', 'listitem');
    card.style.animationDelay = Math.min(index * 30, 300) + 'ms';
    card.addEventListener('click', function (e) {
      // 点击操作按钮不打开 Drawer
      if (e.target.closest('.ds-card__actions')) return;
      openDrawer(ds.slug);
    });

    const fieldsPreview = ds.fields.slice(0, 4).join(', ')
      + (ds.fields.length > 4 ? ` +${ds.fields.length - 4} more` : '');

    card.innerHTML = `
      <div class="ds-card__header">
        <span class="ds-badge ds-badge--${ds.category}">${getCategoryLabel(ds.category)}</span>
        <span class="ds-card__records">${formatRecords(ds.records)}</span>
      </div>
      <h3 class="ds-card__name">${escapeHTML(ds.name)}</h3>
      <p class="ds-card__desc">${escapeHTML(ds.description)}</p>
      <div class="ds-card__fields">
        <span class="ds-card__fields-label">Fields:</span>
        <span class="ds-card__fields-value">${escapeHTML(fieldsPreview)}</span>
      </div>
      <div class="ds-card__footer">
        <span class="ds-card__size">${formatSize(ds.sizeBytes)}</span>
        <div class="ds-card__actions">
          <button class="ds-btn ds-btn--ghost ds-btn--sm" onclick="DS.copyDataset('${ds.slug}', this)">Copy</button>
          <button class="ds-btn ds-btn--ghost ds-btn--sm" onclick="DS.validateDataset('${ds.slug}')">Validate</button>
          <button class="ds-btn ds-btn--primary ds-btn--sm" onclick="DS.downloadDataset('${ds.slug}')">Download</button>
        </div>
      </div>
    `;
    return card;
  }
```

#### `openDrawer(slug)` — Drawer 打开

```javascript
  function openDrawer(slug) {
    const ds = state.allDatasets.find(d => d.slug === slug);
    if (!ds) return;
    state.currentDrawerSlug = slug;

    // 填充 Drawer 内容
    document.getElementById('ds-drawer-title').textContent = ds.name;
    document.getElementById('ds-drawer-badge').className = `ds-badge ds-badge--${ds.category}`;
    document.getElementById('ds-drawer-badge').textContent = getCategoryLabel(ds.category);
    document.getElementById('ds-drawer-records').textContent = `${formatRecords(ds.records)} records`;
    document.getElementById('ds-drawer-size').textContent = formatSize(ds.sizeBytes);
    document.getElementById('ds-drawer-desc').textContent = ds.description;

    // 字段列表
    const fieldsList = document.getElementById('ds-drawer-fields');
    fieldsList.innerHTML = ds.fieldDefs.map(f => `
      <li class="ds-drawer__field-item">
        <span class="ds-drawer__field-name">${escapeHTML(f.name)}</span>
        <span class="ds-drawer__field-type ds-type--${f.type}">${f.type}</span>
        <span class="ds-drawer__field-example">${escapeHTML(String(f.example ?? ''))}</span>
      </li>
    `).join('');

    // 使用场景标签
    document.getElementById('ds-drawer-usecases').innerHTML =
      ds.useCases.map(u => `<span class="ds-tag">${escapeHTML(u)}</span>`).join('');

    // Raw URL
    const rawURL = `https://toolboxnova.com${STATIC_BASE}${ds.slug}.json`;
    document.getElementById('ds-drawer-url').textContent = rawURL;
    document.getElementById('ds-drawer-url').dataset.url = rawURL;

    // JSON 预览（取前 5 条，避免过长）
    fetchDatasetPreview(ds.slug).then(function (preview) {
      const codeEl = document.getElementById('ds-drawer-preview');
      codeEl.textContent = JSON.stringify(preview, null, 2);
      hljs.highlightElement(codeEl);
    });

    // 相关数据集
    const related = state.allDatasets
      .filter(d => d.category === ds.category && d.slug !== slug)
      .slice(0, 4);
    document.getElementById('ds-drawer-related').innerHTML = related.map(r => `
      <li class="ds-drawer__related-item" onclick="DS.openDrawer('${r.slug}')">
        <span class="ds-badge ds-badge--${r.category} ds-badge--xs">${getCategoryLabel(r.category)}</span>
        <span>${escapeHTML(r.name)}</span>
      </li>
    `).join('');

    // 打开 Drawer
    const drawer = document.getElementById('ds-drawer');
    const overlay = document.getElementById('ds-drawer-overlay');
    drawer.hidden = false;
    drawer.scrollTop = 0;
    requestAnimationFrame(function () {
      drawer.classList.add('ds-drawer--open');
      overlay.classList.add('ds-drawer-overlay--visible');
    });
    drawer.removeAttribute('aria-hidden');

    // 分发事件（供 GA 追踪）
    document.dispatchEvent(new CustomEvent('dataset:drawer_open', { detail: { slug } }));
  }
```

#### `closeDrawer()`

```javascript
  function closeDrawer() {
    const drawer = document.getElementById('ds-drawer');
    const overlay = document.getElementById('ds-drawer-overlay');
    drawer.classList.remove('ds-drawer--open');
    overlay.classList.remove('ds-drawer-overlay--visible');
    setTimeout(function () {
      drawer.hidden = true;
      drawer.setAttribute('aria-hidden', 'true');
    }, 280); // 等待动画结束
    state.currentDrawerSlug = null;
  }
```

#### `copyDataset(slug, btnEl)` — 复制 JSON

```javascript
  function copyDataset(slug, btnEl) {
    fetch(STATIC_BASE + slug + '.json')
      .then(r => r.text())
      .then(function (text) {
        return navigator.clipboard ? navigator.clipboard.writeText(text)
          : legacyCopy(text);
      })
      .then(function () {
        btnEl.textContent = 'Copied!';
        btnEl.classList.add('ds-btn--success');
        showToast('Copied to clipboard!', 'success');
        setTimeout(function () {
          btnEl.textContent = 'Copy';
          btnEl.classList.remove('ds-btn--success');
        }, 1500);
        document.dispatchEvent(new CustomEvent('dataset:copy', { detail: { slug } }));
      })
      .catch(function () {
        showToast('Copy failed. Please select and copy manually.', 'error');
      });
  }
```

#### `downloadDataset(slug)`

```javascript
  function downloadDataset(slug) {
    const ds = state.allDatasets.find(d => d.slug === slug);
    showToast('Preparing download…', 'info');
    fetch(STATIC_BASE + slug + '.json')
      .then(r => r.blob())
      .then(function (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = slug + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        // 500ms 后释放 Blob URL
        setTimeout(() => URL.revokeObjectURL(url), 500);
        document.dispatchEvent(new CustomEvent('dataset:download', {
          detail: { slug, category: ds?.category }
        }));
      })
      .catch(function () {
        showToast('Download failed. Please try again.', 'error');
        document.dispatchEvent(new CustomEvent('dataset:error', { detail: { slug } }));
      });
  }
```

#### `validateDataset(slug)`

```javascript
  function validateDataset(slug) {
    // 在新标签页打开验证器，URL 参数传递数据集 URL
    const rawURL = encodeURIComponent(`https://toolboxnova.com${STATIC_BASE}${slug}.json`);
    window.open(`${VALIDATOR_URL}?import=${rawURL}`, '_blank', 'noopener');
  }
```

#### `fetchDatasetPreview(slug)` — 获取前 5 条数据用于 Drawer 预览

```javascript
  function fetchDatasetPreview(slug) {
    return fetch(STATIC_BASE + slug + '.json')
      .then(r => r.json())
      .then(function (data) {
        if (Array.isArray(data)) return data.slice(0, 5);
        return data; // 对象类型直接返回
      })
      .catch(() => ({ error: 'Preview unavailable' }));
  }
```

#### `onSearch(query)` — 搜索防抖

```javascript
  let _searchTimer = null;
  function onSearch(query) {
    state.searchQuery = query;
    clearTimeout(_searchTimer);
    _searchTimer = setTimeout(function () {
      applyFilters();
      // 搜索词长度 > 2 时触发 GA
      if (query.length > 2) {
        document.dispatchEvent(new CustomEvent('dataset:search', {
          detail: { query, resultCount: state.filteredDatasets.length }
        }));
      }
    }, 200);
  }
```

#### `filterByCategory(category)` / `onSort(order)`

```javascript
  function filterByCategory(category) {
    state.activeCategory = category;
    // 更新 Tab aria 状态
    document.querySelectorAll('.ds-tab').forEach(function (btn) {
      btn.setAttribute('aria-selected', btn.dataset.category === category);
      btn.classList.toggle('ds-tab--active', btn.dataset.category === category);
    });
    applyFilters();
    document.dispatchEvent(new CustomEvent('dataset:filter', { detail: { category } }));
  }

  function onSort(order) {
    state.sortOrder = order;
    applyFilters();
  }
```

#### 工具函数

```javascript
  function formatRecords(n) {
    return n >= 1000 ? (n / 1000).toFixed(1) + 'K' : String(n);
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  }

  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
    });
  }

  function showToast(msg, type) {
    const toast = document.getElementById('ds-toast');
    toast.textContent = msg;
    toast.className = `ds-toast ds-toast--${type} ds-toast--visible`;
    setTimeout(function () { toast.className = 'ds-toast'; }, 2500);
  }

  function updateResultCount(count) {
    document.getElementById('ds-result-count').innerHTML =
      `Showing <strong>${count}</strong> dataset${count !== 1 ? 's' : ''}`;
  }

  function toggleNoResults(show) {
    document.getElementById('ds-no-results').hidden = !show;
    document.getElementById('ds-grid').hidden = show;
  }

  function startPlaceholderRotation() {
    const input = document.getElementById('ds-search-input');
    let i = 0;
    state.placeholderTimer = setInterval(function () {
      if (document.activeElement === input) return; // 聚焦时不切换
      input.setAttribute('placeholder', PLACEHOLDER_EXAMPLES[i % PLACEHOLDER_EXAMPLES.length]);
      i++;
    }, 2000);
  }

  function clearSearch() {
    const input = document.getElementById('ds-search-input');
    input.value = '';
    state.searchQuery = '';
    applyFilters();
    input.focus();
  }

  function getCategoryLabel(cat) {
    const labels = {
      geographic: 'Geographic', reference: 'Reference', configuration: 'Configuration',
      testing: 'Testing', api_mocks: 'API Mocks', finance: 'Finance',
      science: 'Science', sports: 'Sports', devops: 'DevOps',
      aiml: 'AI / ML', government: 'Government', social: 'Social',
      iot: 'IoT', healthcare: 'Healthcare',
    };
    return labels[cat] || cat;
  }

  function legacyCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:-9999px;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }

  // 公开接口
  return { init, filterByCategory, onSearch, onSort, clearSearch,
           openDrawer, closeDrawer, copyDataset, downloadDataset,
           validateDataset, copyDrawerURL, downloadFromDrawer,
           validateFromDrawer, toggleFAQ };
})();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', DS.init);
```

---

## 3. UI 事件绑定说明

### 分类 Tab 激活状态

Tab 使用 `aria-selected` + `ds-tab--active` 类双重管理，保证无障碍访问和视觉一致。

### 搜索防抖

`oninput` 触发后 200ms 防抖，避免每次按键都执行 Fuse.js 搜索（Fuse 本身也是 O(n) 操作）。

### Drawer onDragLeave 问题

Drawer 不含拖拽交互，故不适用。Drawer 关闭事件通过 Overlay `onclick` + `ESC` 键双重触发。

### FAQ 折叠

```javascript
  function toggleFAQ(btn) {
    const item = btn.closest('.ds-faq__item');
    const answer = item.querySelector('.ds-faq__a');
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!isOpen));
    answer.hidden = isOpen;
    // 旋转箭头
    btn.querySelector('.ds-faq__arrow').style.transform = isOpen ? '' : 'rotate(180deg)';
  }
```

### 移动端 Drawer 滑动关闭

```javascript
  // 触摸右滑手势关闭 Drawer
  let _touchStartX = 0;
  document.getElementById('ds-drawer').addEventListener('touchstart', function (e) {
    _touchStartX = e.touches[0].clientX;
  }, { passive: true });
  document.getElementById('ds-drawer').addEventListener('touchend', function (e) {
    if (e.changedTouches[0].clientX - _touchStartX > 80) closeDrawer();
  }, { passive: true });
```

---

## 4. 验收标准 Checklist

### 数据正确性

- [ ] 所有 85 个数据集元数据（slug / name / category / records / sizeBytes / fields / fieldDefs / useCases）加载正确
- [ ] Fuse.js 搜索结果与数据集名称/描述/字段/标签匹配
- [ ] 分类过滤后数量统计准确
- [ ] 排序顺序与选项语义一致（records_desc = 最多记录在前）

### 性能

- [ ] 首屏（85 条数据）渲染时间 < 200ms
- [ ] 搜索防抖 200ms，输入不卡顿
- [ ] Drawer JSON 预览加载 < 1s（本地静态文件）
- [ ] Tab 切换 < 50ms

### 内存安全

- [ ] 每次 downloadDataset 在 500ms 后调用 `URL.revokeObjectURL()` 释放 Blob URL
- [ ] Drawer 关闭时不保留对 DOM 节点的引用（innerHTML 覆盖即释放）
- [ ] 页面卸载前清除 `state.placeholderTimer`

### 交互体验

- [ ] Copy 按钮成功后显示 "Copied!" 1.5s 后恢复
- [ ] Download 按钮触发正确文件名（slug.json）下载
- [ ] Validate 按钮在新标签页打开并预填数据集 URL
- [ ] Drawer 右滑 80px 以上关闭
- [ ] ESC 键关闭 Drawer
- [ ] Overlay 点击关闭 Drawer

### 边界情况

- [ ] 搜索无结果时显示空状态，不报 JS 错误
- [ ] 数据集 JSON 文件 404 时 Download 显示 Toast 错误提示
- [ ] 非法 slug 打开 Drawer 时静默失败（不崩溃）
- [ ] 单对象类型数据集（Configuration 类）在 Drawer 预览中正确展示（不作 slice 截断）
