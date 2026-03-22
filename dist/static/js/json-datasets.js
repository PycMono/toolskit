// static/js/json-datasets.js
// Datasets page engine for ToolboxNova

var DS = (function () {
  var state = {
    allDatasets: [],
    filteredDatasets: [],
    activeCategory: 'all',
    searchQuery: '',
    sortOrder: 'popular',
    currentDrawerSlug: null,
    fuse: null,
    placeholderTimer: null,
    lang: document.documentElement.lang || 'en',
  };

  var STATIC_BASE = '/static/datasets/';
  var VALIDATOR_URL = '/json/validate';
  var PLACEHOLDER_EN = ['Try "http status"','Try "mock users"','Try "countries"','Try "crypto"','Try "aws regions"'];
  var PLACEHOLDER_ZH = ['搜索 "HTTP 状态码"','搜索 "Mock 用户"','搜索 "国家列表"','搜索 "加密货币"'];

  function init() {
    state.allDatasets = window.DATASETS_META || [];
    if (typeof Fuse !== 'undefined') {
      state.fuse = new Fuse(state.allDatasets, {
        keys: [
          { name: 'name', weight: 0.4 },
          { name: 'description', weight: 0.3 },
          { name: 'fields', weight: 0.2 },
          { name: 'tags', weight: 0.1 }
        ],
        threshold: 0.35,
        includeScore: true
      });
    }
    applyFilters();
    startPlaceholderRotation();
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && state.currentDrawerSlug) closeDrawer();
    });
    // Drawer touch gesture
    var drawer = document.getElementById('ds-drawer');
    if (drawer) {
      var _tx = 0;
      drawer.addEventListener('touchstart', function (e) { _tx = e.touches[0].clientX; }, { passive: true });
      drawer.addEventListener('touchend', function (e) { if (e.changedTouches[0].clientX - _tx > 80) closeDrawer(); }, { passive: true });
    }
  }

  function applyFilters() {
    var result = state.allDatasets.slice();
    if (state.activeCategory !== 'all') {
      result = result.filter(function (d) { return d.category === state.activeCategory; });
    }
    if (state.searchQuery.trim().length > 0 && state.fuse) {
      var fuseResult = state.fuse.search(state.searchQuery);
      var slugSet = {};
      fuseResult.forEach(function (r) { slugSet[r.item.slug] = r.score; });
      result = result.filter(function (d) { return slugSet[d.slug] !== undefined; });
      result.sort(function (a, b) { return (slugSet[a.slug] || 1) - (slugSet[b.slug] || 1); });
    } else {
      applySortOrder(result);
    }
    state.filteredDatasets = result;
    renderGrid(result);
    updateResultCount(result.length);
    var noResults = document.getElementById('ds-no-results');
    var grid = document.getElementById('ds-grid');
    if (noResults) noResults.style.display = result.length === 0 ? 'flex' : 'none';
    if (grid) grid.style.display = result.length === 0 ? 'none' : 'grid';
  }

  function applySortOrder(arr) {
    switch (state.sortOrder) {
      case 'popular': arr.sort(function (a, b) { return (b.popularity || 0) - (a.popularity || 0); }); break;
      case 'records_desc': arr.sort(function (a, b) { return b.records - a.records; }); break;
      case 'records_asc': arr.sort(function (a, b) { return a.records - b.records; }); break;
      case 'size_desc': arr.sort(function (a, b) { return b.sizeBytes - a.sizeBytes; }); break;
      case 'size_asc': arr.sort(function (a, b) { return a.sizeBytes - b.sizeBytes; }); break;
    }
  }

  function renderGrid(datasets) {
    var grid = document.getElementById('ds-grid');
    if (!grid) return;
    grid.innerHTML = '';
    if (datasets.length === 0) return;
    var frag = document.createDocumentFragment();
    datasets.forEach(function (ds, index) {
      frag.appendChild(buildCard(ds, index));
    });
    grid.appendChild(frag);
  }

  function buildCard(ds, index) {
    var card = document.createElement('div');
    card.className = 'ds-card';
    card.setAttribute('role', 'listitem');
    card.style.animationDelay = Math.min(index * 30, 300) + 'ms';
    card.addEventListener('click', function (e) {
      if (e.target.closest('.ds-card__actions')) return;
      openDrawer(ds.slug);
    });
    var fieldsPreview = ds.fields.slice(0, 4).join(', ') + (ds.fields.length > 4 ? ' +' + (ds.fields.length - 4) + ' more' : '');
    card.innerHTML =
      '<div class="ds-card__header">' +
        '<span class="ds-badge ds-badge--' + ds.category + '">' + escapeHTML(getCategoryLabel(ds.category)) + '</span>' +
        '<span class="ds-card__records">' + formatRecords(ds.records) + ' records</span>' +
      '</div>' +
      '<h3 class="ds-card__name">' + escapeHTML(ds.name) + '</h3>' +
      '<p class="ds-card__desc">' + escapeHTML(ds.description) + '</p>' +
      '<div class="ds-card__fields"><span class="ds-card__fields-label">Fields:</span><span>' + escapeHTML(fieldsPreview) + '</span></div>' +
      '<div class="ds-card__footer">' +
        '<span class="ds-card__size">' + formatSize(ds.sizeBytes) + '</span>' +
        '<div class="ds-card__actions">' +
          '<button class="ds-btn" onclick="DS.copyDataset(\'' + ds.slug + '\', this)">Copy</button>' +
          '<button class="ds-btn" onclick="DS.validateDataset(\'' + ds.slug + '\')">Validate</button>' +
          '<button class="ds-btn ds-btn--primary" onclick="DS.downloadDataset(\'' + ds.slug + '\')">Download</button>' +
        '</div>' +
      '</div>';
    return card;
  }

  function openDrawer(slug) {
    var ds = state.allDatasets.find(function (d) { return d.slug === slug; });
    if (!ds) return;
    state.currentDrawerSlug = slug;
    document.getElementById('ds-drawer-title').textContent = ds.name;
    var badge = document.getElementById('ds-drawer-badge');
    badge.className = 'ds-badge ds-badge--' + ds.category;
    badge.textContent = getCategoryLabel(ds.category);
    document.getElementById('ds-drawer-records').textContent = formatRecords(ds.records) + ' records';
    document.getElementById('ds-drawer-size').textContent = formatSize(ds.sizeBytes);
    document.getElementById('ds-drawer-desc').textContent = ds.description;
    // Fields
    var fieldsList = document.getElementById('ds-drawer-fields');
    fieldsList.innerHTML = (ds.fieldDefs || []).map(function (f) {
      return '<li class="ds-drawer__field-item">' +
        '<span class="ds-drawer__field-name">' + escapeHTML(f.name) + '</span>' +
        '<span class="ds-drawer__field-type ds-type--' + f.type + '">' + f.type + '</span>' +
        '<span class="ds-drawer__field-example">' + escapeHTML(String(f.example == null ? 'null' : (typeof f.example === 'object' ? JSON.stringify(f.example) : f.example))) + '</span>' +
        '</li>';
    }).join('');
    // Use cases
    document.getElementById('ds-drawer-usecases').innerHTML = (ds.useCases || []).map(function (u) {
      return '<span class="ds-tag">' + escapeHTML(u) + '</span>';
    }).join('');
    // URL
    var rawURL = 'https://toolboxnova.com' + STATIC_BASE + ds.slug + '.json';
    var urlEl = document.getElementById('ds-drawer-url');
    urlEl.textContent = rawURL;
    urlEl.dataset.url = rawURL;
    // Preview
    var previewEl = document.getElementById('ds-drawer-preview');
    previewEl.textContent = 'Loading preview...';
    fetch(STATIC_BASE + ds.slug + '.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var preview = Array.isArray(data) ? data.slice(0, 5) : data;
        previewEl.textContent = JSON.stringify(preview, null, 2);
      })
      .catch(function () { previewEl.textContent = '// Preview not available for this dataset'; });
    // Related
    var related = state.allDatasets.filter(function (d) { return d.category === ds.category && d.slug !== slug; }).slice(0, 4);
    document.getElementById('ds-drawer-related').innerHTML = related.map(function (r) {
      return '<li class="ds-drawer__related-item" onclick="DS.openDrawer(\'' + r.slug + '\')">' +
        '<span class="ds-badge ds-badge--' + r.category + '" style="font-size:10px;padding:2px 8px">' + getCategoryLabel(r.category) + '</span>' +
        '<span>' + escapeHTML(r.name) + '</span>' +
        '</li>';
    }).join('');
    // Open
    var drawer = document.getElementById('ds-drawer');
    var overlay = document.getElementById('ds-drawer-overlay');
    drawer.style.display = 'flex';
    drawer.style.flexDirection = 'column';
    requestAnimationFrame(function () {
      drawer.classList.add('ds-drawer--open');
      overlay.classList.add('ds-drawer-overlay--visible');
    });
    drawer.removeAttribute('aria-hidden');
    document.dispatchEvent(new CustomEvent('dataset:drawer_open', { detail: { slug: slug } }));
  }

  function closeDrawer() {
    var drawer = document.getElementById('ds-drawer');
    var overlay = document.getElementById('ds-drawer-overlay');
    drawer.classList.remove('ds-drawer--open');
    overlay.classList.remove('ds-drawer-overlay--visible');
    setTimeout(function () {
      drawer.style.display = 'none';
      state.currentDrawerSlug = null;
    }, 280);
  }

  function copyDataset(slug, btnEl) {
    fetch(STATIC_BASE + slug + '.json')
      .then(function (r) { return r.text(); })
      .then(function (text) {
        return navigator.clipboard ? navigator.clipboard.writeText(text) : legacyCopy(text);
      })
      .then(function () {
        var orig = btnEl.textContent;
        btnEl.textContent = 'Copied!';
        btnEl.classList.add('ds-btn--success');
        showToast('Copied to clipboard!', 'success');
        setTimeout(function () { btnEl.textContent = orig; btnEl.classList.remove('ds-btn--success'); }, 1500);
        document.dispatchEvent(new CustomEvent('dataset:copy', { detail: { slug: slug } }));
      })
      .catch(function () { showToast('Copy failed. Please select and copy manually.', 'error'); });
  }

  function downloadDataset(slug) {
    showToast('Preparing download…', 'info');
    var ds = state.allDatasets.find(function (d) { return d.slug === slug; });
    fetch(STATIC_BASE + slug + '.json')
      .then(function (r) { return r.blob(); })
      .then(function (blob) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url; a.download = slug + '.json';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 500);
        document.dispatchEvent(new CustomEvent('dataset:download', { detail: { slug: slug, category: ds && ds.category } }));
      })
      .catch(function () {
        showToast('Download failed. Please try again.', 'error');
        document.dispatchEvent(new CustomEvent('dataset:error', { detail: { slug: slug } }));
      });
  }

  function validateDataset(slug) {
    var rawURL = encodeURIComponent('https://toolboxnova.com' + STATIC_BASE + slug + '.json');
    window.open(VALIDATOR_URL + '?import=' + rawURL, '_blank', 'noopener');
  }

  function copyDrawerURL() {
    var urlEl = document.getElementById('ds-drawer-url');
    var url = urlEl.dataset.url || urlEl.textContent;
    (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.resolve(legacyCopy(url)))
      .then(function () { showToast('URL copied!', 'success'); })
      .catch(function () { showToast('Copy failed', 'error'); });
  }

  function downloadFromDrawer() {
    if (state.currentDrawerSlug) downloadDataset(state.currentDrawerSlug);
  }

  function validateFromDrawer() {
    if (state.currentDrawerSlug) validateDataset(state.currentDrawerSlug);
  }

  var _searchTimer = null;
  function onSearch(query) {
    state.searchQuery = query;
    var clearBtn = document.getElementById('ds-search-clear');
    if (clearBtn) clearBtn.style.display = query ? 'block' : 'none';
    clearTimeout(_searchTimer);
    _searchTimer = setTimeout(function () {
      applyFilters();
      if (query.length > 2) {
        document.dispatchEvent(new CustomEvent('dataset:search', { detail: { query: query, resultCount: state.filteredDatasets.length } }));
      }
    }, 200);
  }

  function filterByCategory(category) {
    state.activeCategory = category;
    document.querySelectorAll('.ds-tab').forEach(function (btn) {
      var active = btn.dataset.category === category;
      btn.setAttribute('aria-selected', String(active));
      btn.classList.toggle('ds-tab--active', active);
    });
    applyFilters();
    document.dispatchEvent(new CustomEvent('dataset:filter', { detail: { category: category } }));
  }

  function onSort(order) {
    state.sortOrder = order;
    applyFilters();
  }

  function clearSearch() {
    var input = document.getElementById('ds-search-input');
    if (input) { input.value = ''; }
    state.searchQuery = '';
    var clearBtn = document.getElementById('ds-search-clear');
    if (clearBtn) clearBtn.style.display = 'none';
    applyFilters();
    if (input) input.focus();
  }

  function toggleFAQ(btn) {
    var item = btn.closest('.ds-faq__item');
    var answer = item && item.querySelector('.ds-faq__a');
    if (!answer) return;
    var isOpen = answer.style.display === 'block';
    answer.style.display = isOpen ? 'none' : 'block';
    var arrow = btn.querySelector('.ds-faq__arrow');
    if (arrow) arrow.style.transform = isOpen ? '' : 'rotate(180deg)';
  }

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
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function showToast(msg, type) {
    var toast = document.getElementById('ds-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.className = 'ds-toast ds-toast--' + type + ' ds-toast--visible';
    setTimeout(function () { toast.className = 'ds-toast'; }, 2500);
  }

  function updateResultCount(count) {
    var el = document.getElementById('ds-result-count');
    if (!el) return;
    var lang = state.lang;
    if (lang === 'zh') {
      el.innerHTML = '显示 <strong>' + count + '</strong> 个数据集';
    } else {
      el.innerHTML = 'Showing <strong>' + count + '</strong> dataset' + (count !== 1 ? 's' : '');
    }
  }

  function getCategoryLabel(cat) {
    var lang = state.lang;
    if (lang === 'zh') {
      var zh = { geographic:'地理', reference:'参考', configuration:'配置', testing:'测试',
        api_mocks:'API Mock', finance:'金融', science:'科学', sports:'体育',
        devops:'DevOps', aiml:'AI/ML', government:'政府', social:'社交', iot:'物联网', healthcare:'医疗' };
      return zh[cat] || cat;
    }
    var en = { geographic:'Geographic', reference:'Reference', configuration:'Config',
      testing:'Testing', api_mocks:'API Mocks', finance:'Finance', science:'Science',
      sports:'Sports', devops:'DevOps', aiml:'AI/ML', government:'Government',
      social:'Social', iot:'IoT', healthcare:'Healthcare' };
    return en[cat] || cat;
  }

  function legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:-9999px;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }

  function startPlaceholderRotation() {
    var input = document.getElementById('ds-search-input');
    if (!input) return;
    var examples = state.lang === 'zh' ? PLACEHOLDER_ZH : PLACEHOLDER_EN;
    var i = 0;
    state.placeholderTimer = setInterval(function () {
      if (document.activeElement === input) return;
      input.setAttribute('placeholder', examples[i % examples.length]);
      i++;
    }, 2000);
  }

  return {
    init: init,
    filterByCategory: filterByCategory,
    onSearch: onSearch,
    onSort: onSort,
    clearSearch: clearSearch,
    openDrawer: openDrawer,
    closeDrawer: closeDrawer,
    copyDataset: copyDataset,
    downloadDataset: downloadDataset,
    validateDataset: validateDataset,
    copyDrawerURL: copyDrawerURL,
    downloadFromDrawer: downloadFromDrawer,
    validateFromDrawer: validateFromDrawer,
    toggleFAQ: toggleFAQ
  };
})();

// Load Fuse.js from CDN then init
(function () {
  var s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/fuse.js/7.0.0/fuse.min.js';
  s.onload = function () { DS.init(); };
  s.onerror = function () { DS.init(); }; // fallback without fuzzy search
  document.head.appendChild(s);
})();

