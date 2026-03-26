# ai-compete · 前端引擎（I-03）

---

## 1. 技术选型表

| 功能 | 方案 | 原因 |
|---|---|---|
| AI 分析请求 | 原生 `EventSource`（SSE） | 流式推送，无需 WebSocket，浏览器兼容好 |
| AI 推荐竞品 | 原生 `fetch` + JSON | 一次性返回，无需流式 |
| Markdown 渲染 | `marked.js` + `DOMPurify` | 轻量、快速、XSS 安全 |
| 状态管理 | IIFE 内 `state` 对象 | 无框架依赖，与项目架构一致 |
| 导出 | Clipboard API + `<a>` download | 纯前端，无需后端参与 |

---

## 2. 文件结构与全局状态（static/js/ai-compete.js）

```javascript
/**
 * ai-compete.js — AI 竞品分析助手主引擎
 * 依赖（均由 base.html 全局加载）：
 *   - ga-events.js      GA 事件追踪
 *   - consent-engine.js Consent Mode v2
 *   - main.js           语言切换 / 主题切换
 * 页面级依赖（extraHead 中 defer 加载）：
 *   - marked.min.js     Markdown 渲染
 *   - purify.min.js     XSS 净化
 */
(function () {
  'use strict';

  // ── 常量 ──────────────────────────────────────────────────────────────
  var TOOL         = 'ai-compete';
  var MAX_COMPETITORS = 5;
  var API_ANALYZE  = '/api/ai-compete/analyze';
  var API_SUGGEST  = '/api/ai-compete/suggest';

  var DIM_META = {
    marketing:   { icon: '📣', key: 'ai-compete.dimension.marketing'   },
    product:     { icon: '🧩', key: 'ai-compete.dimension.product'     },
    pricing:     { icon: '💰', key: 'ai-compete.dimension.pricing'     },
    audience:    { icon: '👥', key: 'ai-compete.dimension.audience'    },
    sentiment:   { icon: '💬', key: 'ai-compete.dimension.sentiment'   },
    company:     { icon: '🏢', key: 'ai-compete.dimension.company'     },
    swot:        { icon: '📊', key: 'ai-compete.dimension.swot'        }
  };

  // ── 全局状态 ──────────────────────────────────────────────────────────
  var state = {
    competitors:  [],
    dimensions:   [],
    results:      {},
    analysisStart: 0,
    analyzing:    false,
    eventSource:  null
  };

  // ── i18n 工具 ─────────────────────────────────────────────────────────
  function t(key) {
    return (window.__I18N__ && window.__I18N__[key]) || key;
  }

  // ── DOM 引用 ──────────────────────────────────────────────────────────
  var $ = function (id) { return document.getElementById(id); };

  var elProductInput    = $('productInput');
  var elSuggestBtn      = $('suggestBtn');
  var elSuggestDropdown = $('suggestDropdown');
  var elSuggestList     = $('suggestList');
  var elCompetitorTags  = $('competitorTags');
  var elCompetitorInput = $('competitorInput');
  var elAddCompetitorBtn= $('addCompetitorBtn');
  var elCompetitorMax   = $('competitorMaxMsg');
  var elAnalyzeBtn      = $('analyzeBtn');
  var elClearBtn        = $('clearBtn');
  var elErrorMsg        = $('errorMsg');
  var elProgressSection = $('progressSection');
  var elProgressText    = $('progressText');
  var elProgressBar     = $('progressBar');
  var elProgressDims    = $('progressDimensions');
  var elResultsSection  = $('resultsSection');
  var elDimAccordion    = $('dimensionAccordion');
  var elExportBtn       = $('exportBtn');
  var elCopyResultBtn   = $('copyResultBtn');

  // ── 竞品管理 ─────────────────────────────────────────────────────────
  function addCompetitor(value) {
    var v = value.trim();
    if (!v) return;
    if (state.competitors.length >= MAX_COMPETITORS) {
      elCompetitorMax.hidden = false;
      return;
    }
    if (state.competitors.indexOf(v) !== -1) {
      showToast(v + ' already added', 'info');
      return;
    }
    state.competitors.push(v);
    renderCompetitorTags();
    elCompetitorInput.value = '';
    elCompetitorMax.hidden = state.competitors.length < MAX_COMPETITORS;
    gaTrackSettingChange(TOOL, 'competitor_add', v);
  }

  function removeCompetitor(idx) {
    state.competitors.splice(idx, 1);
    renderCompetitorTags();
    elCompetitorMax.hidden = state.competitors.length < MAX_COMPETITORS;
  }

  function renderCompetitorTags() {
    elCompetitorTags.innerHTML = '';
    state.competitors.forEach(function (comp, idx) {
      var tag = document.createElement('div');
      tag.className = 'competitor-tag';
      tag.setAttribute('role', 'listitem');
      var label = document.createTextNode(comp);
      var btn = document.createElement('button');
      btn.className = 'tag-remove';
      btn.type = 'button';
      btn.textContent = '×';
      btn.setAttribute('aria-label', 'Remove ' + comp);
      btn.addEventListener('click', function () { removeCompetitor(idx); });
      tag.appendChild(label);
      tag.appendChild(btn);
      elCompetitorTags.appendChild(tag);
    });
  }

  // ── AI 推荐竞品 ───────────────────────────────────────────────────────
  function suggestCompetitors() {
    var product = elProductInput.value.trim();
    if (!product) { showToast(t('ai-compete.error.empty_product'), 'error'); return; }

    elSuggestBtn.disabled = true;
    elSuggestBtn.textContent = t('ai-compete.suggest.loading');
    elSuggestDropdown.hidden = true;

    var lang = (window.__LANG__ || document.documentElement.lang || 'en');

    fetch(API_SUGGEST, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_desc: product, lang: lang })
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data.suggestions || !data.suggestions.length) {
          showToast('No suggestions found', 'info');
          return;
        }
        renderSuggestions(data.suggestions);
        elSuggestDropdown.hidden = false;
      })
      .catch(function (err) {
        gaTrackError(TOOL, 'suggest_error', err.message);
        showToast(t('ai-compete.error.network'), 'error');
      })
      .finally(function () {
        elSuggestBtn.disabled = false;
        elSuggestBtn.textContent = t('ai-compete.suggest.btn');
      });
  }

  function renderSuggestions(suggestions) {
    elSuggestList.innerHTML = '';
    suggestions.forEach(function (s) {
      var item = document.createElement('div');
      item.className = 'suggest-item';
      item.setAttribute('role', 'option');

      var info = document.createElement('div');
      info.className = 'suggest-item-info';
      var name = document.createElement('div');
      name.className = 'suggest-item-name';
      name.textContent = s.name;
      var reason = document.createElement('div');
      reason.className = 'suggest-item-reason';
      reason.textContent = s.reason || s.url || '';
      info.appendChild(name);
      info.appendChild(reason);

      var addBtn = document.createElement('button');
      addBtn.className = 'btn btn-sm btn-outline';
      addBtn.type = 'button';
      addBtn.textContent = t('ai-compete.suggest.add');
      addBtn.addEventListener('click', function () {
        addCompetitor(s.url || s.name);
        elSuggestDropdown.hidden = true;
      });

      item.appendChild(info);
      item.appendChild(addBtn);
      elSuggestList.appendChild(item);
    });
  }

  // ── 分析启动 ─────────────────────────────────────────────────────────
  function startAnalysis() {
    var product = elProductInput.value.trim();
    if (!product) { showError(t('ai-compete.error.empty_product')); return; }
    if (state.competitors.length === 0) { showError(t('ai-compete.error.no_competitor')); return; }

    hideError();
    state.dimensions = getCheckedDimensions();
    state.results = {};
    state.analyzing = true;
    state.analysisStart = Date.now();

    setAnalyzeBtnState(true);
    showProgressSection(state.dimensions);
    elResultsSection.hidden = true;
    elDimAccordion.innerHTML = '';

    var lang = (window.__LANG__ || document.documentElement.lang || 'en');
    var controller = new AbortController();
    state.controller = controller;

    fetch(API_ANALYZE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_desc: product,
        competitors:  state.competitors,
        dimensions:   state.dimensions,
        lang:         lang
      }),
      signal: controller.signal
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return processStream(res.body);
    }).catch(function (err) {
      if (err.name === 'AbortError') return;
      gaTrackError(TOOL, 'api_error', err.message);
      showToast(t('ai-compete.error.api_fail'), 'error');
    }).finally(function () {
      state.analyzing = false;
      setAnalyzeBtnState(false);
      hideProgressSection();
      if (Object.keys(state.results).length > 0) {
        elResultsSection.hidden = false;
        gaTrackProcessDone(TOOL, state.competitors.length, Date.now() - state.analysisStart);
      }
    });
  }

  // ── ReadableStream 解析 SSE ──────────────────────────────────────────
  function processStream(body) {
    var reader = body.getReader();
    var decoder = new TextDecoder();
    var buffer = '';
    var totalDims = state.dimensions.length * state.competitors.length;
    var doneDims  = 0;

    function read() {
      return reader.read().then(function (chunk) {
        if (chunk.done) return;
        buffer += decoder.decode(chunk.value, { stream: true });
        var lines = buffer.split('\n');
        buffer = lines.pop();

        lines.forEach(function (line) {
          if (line.startsWith('data:')) {
            var raw = line.slice(5).trim();
            if (raw === '[DONE]' || raw === '{}') return;
            try {
              var parsed = JSON.parse(raw);
              if (parsed.type === 'content_block_delta' && parsed.delta && parsed.delta.text) {
                var text = parsed.delta.text;
                text.split('\n').forEach(function (textLine) {
                  textLine = textLine.trim();
                  if (textLine.startsWith('DIMENSION:')) {
                    try {
                      var dimData = JSON.parse(textLine.slice(10));
                      handleDimensionData(dimData);
                      doneDims++;
                      updateProgress(doneDims / totalDims, dimData.dim, dimData.competitor);
                    } catch (e) { /* 不完整 JSON，等待下次 */ }
                  }
                });
              }
            } catch (e) { /* 非 JSON 行，忽略 */ }
          }
        });

        return read();
      });
    }
    return read();
  }

  // ── 维度数据处理 → 渲染 ─────────────────────────────────────────────
  function handleDimensionData(dimData) {
    var dim  = dimData.dim;
    var comp = dimData.competitor || state.competitors[0];
    var data = dimData.data;

    if (!state.results[comp]) state.results[comp] = {};
    state.results[comp][dim] = data;
    upsertDimSection(dim);
  }

  function upsertDimSection(dim) {
    var sectionId = 'dim-section-' + dim;
    var existing  = document.getElementById(sectionId);
    if (!existing) {
      var meta    = DIM_META[dim] || { icon: '📌', key: dim };
      var details = document.createElement('details');
      details.id        = sectionId;
      details.className = 'dim-section';
      details.open      = true;

      var summary = document.createElement('summary');
      summary.innerHTML = meta.icon + ' ' + t(meta.key);
      details.appendChild(summary);

      var body = document.createElement('div');
      body.className = 'dim-body';
      body.id = 'dim-body-' + dim;
      details.appendChild(body);

      details.style.opacity  = '0';
      details.style.transform= 'translateY(12px)';
      elDimAccordion.appendChild(details);
      requestAnimationFrame(function () {
        details.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        details.style.opacity    = '1';
        details.style.transform  = 'none';
      });
    }
    renderDimBody(dim);
  }

  function renderDimBody(dim) {
    var body = document.getElementById('dim-body-' + dim);
    if (!body) return;
    if (dim === 'swot') {
      renderSwot(body);
    } else {
      renderGenericDim(dim, body);
    }
  }

  // ── SWOT 四象限渲染 ──────────────────────────────────────────────────
  function renderSwot(container) {
    container.innerHTML = '';
    state.competitors.forEach(function (comp) {
      var data = (state.results[comp] || {}).swot;
      if (!data) return;

      var compTitle = document.createElement('h3');
      compTitle.textContent = comp;
      compTitle.style.cssText = 'font-size:0.95rem;margin:0 0 12px;color:var(--ac-accent)';
      container.appendChild(compTitle);

      var grid = document.createElement('div');
      grid.className = 'swot-grid';

      var cells = [
        { key: 'strengths',     cls: 'strengths',     label: t('ai-compete.result.strengths') },
        { key: 'weaknesses',    cls: 'weaknesses',    label: t('ai-compete.result.weaknesses') },
        { key: 'opportunities', cls: 'opportunities', label: t('ai-compete.result.opportunities') },
        { key: 'threats',       cls: 'threats',       label: t('ai-compete.result.threats') }
      ];
      cells.forEach(function (c) {
        var cell = document.createElement('div');
        cell.className = 'swot-cell ' + c.cls;
        var h4 = document.createElement('h4');
        h4.textContent = c.label;
        var ul = document.createElement('ul');
        var items = data[c.key] || [];
        items.forEach(function (item) {
          var li = document.createElement('li');
          li.textContent = item;
          ul.appendChild(li);
        });
        cell.appendChild(h4);
        cell.appendChild(ul);
        grid.appendChild(cell);
      });

      container.appendChild(grid);
      var sep = document.createElement('hr');
      sep.style.cssText = 'margin:20px 0;border:none;border-top:1px solid var(--color-border)';
      container.appendChild(sep);
    });
  }

  // ── 通用维度渲染 ─────────────────────────────────────────────────────
  function renderGenericDim(dim, container) {
    container.innerHTML = '';
    state.competitors.forEach(function (comp) {
      var data = (state.results[comp] || {})[dim];
      if (!data) return;

      var compTitle = document.createElement('h3');
      compTitle.textContent = comp;
      compTitle.style.cssText = 'font-size:0.95rem;margin:0 0 8px;color:var(--ac-accent)';
      container.appendChild(compTitle);

      var md = dataToMarkdown(data);
      var html = typeof marked !== 'undefined'
        ? (typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(marked.parse(md)) : marked.parse(md))
        : escapeHtml(JSON.stringify(data, null, 2));

      var div = document.createElement('div');
      div.className = 'dim-markdown';
      div.innerHTML = html;
      container.appendChild(div);

      var sep = document.createElement('hr');
      sep.style.cssText = 'margin:16px 0;border:none;border-top:1px solid var(--color-border)';
      container.appendChild(sep);
    });
  }

  // ── JSON → Markdown ──────────────────────────────────────────────────
  function dataToMarkdown(data) {
    if (typeof data !== 'object' || data === null) return String(data);
    var lines = [];
    Object.entries(data).forEach(function (entry) {
      var k = entry[0], v = entry[1];
      if (Array.isArray(v)) {
        lines.push('**' + k + '**');
        v.forEach(function (item) { lines.push('- ' + item); });
      } else if (typeof v === 'object' && v !== null) {
        lines.push('**' + k + '**');
        Object.entries(v).forEach(function (sub) {
          lines.push('  - **' + sub[0] + '**: ' + sub[1]);
        });
      } else {
        lines.push('**' + k + '**: ' + v);
      }
      lines.push('');
    });
    return lines.join('\n');
  }

  // ── 进度区控制 ───────────────────────────────────────────────────────
  function showProgressSection(dimensions) {
    elProgressSection.hidden = false;
    elProgressText.textContent = t('ai-compete.status.loading');
    elProgressBar.style.width = '0%';
    elProgressBar.parentElement.setAttribute('aria-valuenow', '0');

    elProgressDims.innerHTML = '';
    dimensions.forEach(function (dim) {
      var tag = document.createElement('span');
      tag.className = 'progress-dim-tag';
      tag.id = 'pdim-' + dim;
      tag.textContent = (DIM_META[dim] || {}).icon + ' ' + t((DIM_META[dim] || {}).key || dim);
      elProgressDims.appendChild(tag);
    });
  }

  function updateProgress(ratio, dim, comp) {
    var pct = Math.min(Math.round(ratio * 100), 100);
    elProgressBar.style.width = pct + '%';
    elProgressBar.parentElement.setAttribute('aria-valuenow', pct);
    elProgressText.textContent = t('ai-compete.status.analyzing').replace('{competitor}', comp || '');

    var prevActive = elProgressDims.querySelector('.active');
    if (prevActive) prevActive.classList.replace('active', 'done');
    var current = document.getElementById('pdim-' + dim);
    if (current) current.classList.add('active');
  }

  function hideProgressSection() {
    elProgressText.textContent = t('ai-compete.status.done');
    elProgressBar.style.width = '100%';
    elProgressDims.querySelectorAll('.progress-dim-tag').forEach(function (el) {
      el.className = 'progress-dim-tag done';
    });
    setTimeout(function () { elProgressSection.hidden = true; }, 1200);
  }

  // ── 导出 Markdown ────────────────────────────────────────────────────
  function exportMarkdown() {
    var lines = ['# ' + t('ai-compete.result.title'), ''];
    state.competitors.forEach(function (comp) {
      lines.push('## ' + comp);
      var res = state.results[comp] || {};
      Object.keys(res).forEach(function (dim) {
        lines.push('### ' + (DIM_META[dim] || {}).icon + ' ' + t((DIM_META[dim] || {}).key || dim));
        lines.push(dataToMarkdown(res[dim]));
      });
    });
    var md = lines.join('\n');
    copyToClipboard(md, function (ok) {
      if (ok) {
        showToast(t('ai-compete.btn.copied'), 'success');
        gaTrackExport(TOOL, 'markdown');
      } else {
        var blob = new Blob([md], { type: 'text/markdown' });
        var url  = URL.createObjectURL(blob);
        var a    = document.createElement('a');
        a.href = url; a.download = 'competitive-analysis.md';
        a.click();
        URL.revokeObjectURL(url);
        gaTrackExport(TOOL, 'markdown_download');
      }
    });
  }

  // ── 复制结果 ─────────────────────────────────────────────────────────
  function copyResult() {
    var text = elDimAccordion.innerText || elDimAccordion.textContent || '';
    copyToClipboard(text, function (ok) {
      var btn = elCopyResultBtn;
      if (ok) {
        var orig = btn.textContent;
        btn.textContent = t('ai-compete.btn.copied');
        setTimeout(function () { btn.textContent = orig; }, 2000);
        gaTrackShare(TOOL, 'copy_result');
      } else {
        showToast(t('ai-compete.error.api_fail'), 'error');
      }
    });
  }

  // ── 清空 ─────────────────────────────────────────────────────────────
  function clearAll() {
    if (state.controller) { state.controller.abort(); state.controller = null; }
    state.competitors = [];
    state.results     = {};
    state.analyzing   = false;

    elProductInput.value    = '';
    elCompetitorInput.value = '';
    elCompetitorTags.innerHTML  = '';
    elDimAccordion.innerHTML    = '';
    elProgressSection.hidden    = true;
    elResultsSection.hidden     = true;
    elCompetitorMax.hidden      = true;
    elSuggestDropdown.hidden    = true;
    hideError();
    setAnalyzeBtnState(false);
  }

  // ── 工具函数 ─────────────────────────────────────────────────────────
  function getCheckedDimensions() {
    var checked = [];
    document.querySelectorAll('input[name="dim"]:checked').forEach(function (el) {
      checked.push(el.value);
    });
    return checked.length ? checked : Object.keys(DIM_META);
  }

  function setAnalyzeBtnState(loading) {
    elAnalyzeBtn.disabled    = loading;
    elAnalyzeBtn.textContent = loading
      ? t('ai-compete.btn.analyzing')
      : t('ai-compete.btn.analyze');
  }

  function showError(msg) {
    elErrorMsg.textContent = msg;
    elErrorMsg.hidden      = false;
  }

  function hideError() {
    elErrorMsg.hidden = true;
    elErrorMsg.textContent = '';
  }

  function showToast(msg, type) {
    var container = $('toastContainer');
    if (!container) return;
    var toast = document.createElement('div');
    toast.className = 'toast ' + (type || 'info');
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(function () {
      toast.style.transition = 'opacity 0.3s';
      toast.style.opacity    = '0';
      setTimeout(function () { toast.remove(); }, 300);
    }, 2500);
  }

  function copyToClipboard(text, cb) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { cb(true); }).catch(function () { cb(false); });
    } else {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) {}
      ta.remove();
      cb(ok);
    }
  }

  function escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ── 事件绑定 ─────────────────────────────────────────────────────────
  function bindEvents() {
    elAddCompetitorBtn.addEventListener('click', function () {
      addCompetitor(elCompetitorInput.value);
    });
    elCompetitorInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); addCompetitor(elCompetitorInput.value); }
    });
    elSuggestBtn.addEventListener('click', suggestCompetitors);
    document.addEventListener('click', function (e) {
      if (!elSuggestDropdown.contains(e.target) && e.target !== elSuggestBtn) {
        elSuggestDropdown.hidden = true;
      }
    });
    elAnalyzeBtn.addEventListener('click', startAnalysis);
    elClearBtn.addEventListener('click', clearAll);
    elExportBtn.addEventListener('click', exportMarkdown);
    elCopyResultBtn.addEventListener('click', copyResult);
    document.querySelectorAll('input[name="dim"]').forEach(function (el) {
      el.addEventListener('change', function () {
        gaTrackSettingChange(TOOL, 'dimension', el.value + ':' + el.checked);
      });
    });
  }

  // ── 初始化 ───────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindEvents);
  } else {
    bindEvents();
  }
})();
```

---

## 3. 函数职责说明

| 函数 | 职责 |
|---|---|
| `addCompetitor(value)` | 校验去重 + 上限 + 追加 state + 重渲 Tag |
| `removeCompetitor(idx)` | 从 state 删除 + 重渲 Tag |
| `renderCompetitorTags()` | 根据 state.competitors 渲染 Tag 列表 DOM |
| `suggestCompetitors()` | POST `/api/ai-compete/suggest`，渲染推荐弹层 |
| `startAnalysis()` | 校验 → POST SSE 流 → 调 processStream |
| `processStream(body)` | ReadableStream 逐行扫描 `DIMENSION:` 前缀 |
| `handleDimensionData(dimData)` | 存入 state.results → 调 upsertDimSection |
| `upsertDimSection(dim)` | 创建或更新 accordion section，含入场动画 |
| `renderDimBody(dim)` | 分派 renderSwot / renderGenericDim |
| `renderSwot(container)` | 四象限卡片 DOM 渲染 |
| `renderGenericDim(dim, container)` | dataToMarkdown → marked.parse → DOMPurify |
| `dataToMarkdown(data)` | JSON 对象 → Markdown 字符串 |
| `showProgressSection(dims)` | 展示进度条 + 维度 tag 列表 |
| `updateProgress(ratio, dim, comp)` | 更新进度条宽度 + 维度 tag 状态 |
| `exportMarkdown()` | 构建 Markdown 字符串 → Clipboard / 文件下载 |
| `copyResult()` | innerText → Clipboard + 按钮反馈 |
| `clearAll()` | abort 流 + 重置 state + 清空 DOM |
| `showToast(msg, type)` | 2.5s 自动消失的浮层通知 |
| `copyToClipboard(text, cb)` | Clipboard API + execCommand 降级 |

---

## 4. 验收标准 Checklist

- [ ] 核心功能：`DIMENSION:` 行正确解析，各维度 JSON 写入 state.results
- [ ] SSE 流中断（网络异常）：AbortError 静默忽略，其他错误 Toast 提示
- [ ] AI 推荐：`/api/ai-compete/suggest` 返回 suggestions 数组，弹层正确渲染
- [ ] 竞品 Tag：最多 5 个，超出后添加按钮提示并禁止继续添加
- [ ] SWOT 四象限：颜色（绿/红/橙/紫）正确，items 数组正确渲染为 `<ul>`
- [ ] 通用维度：marked.js + DOMPurify 正确渲染 Markdown，无 XSS
- [ ] 进度条：`ratio * 100` 宽度动画流畅，维度 tag 状态（waiting/active/done）正确切换
- [ ] 导出 Markdown：Clipboard API 优先，降级触发文件下载
- [ ] copyToClipboard：HTTPS 和 localhost 均正常
- [ ] GA：`gaTrackProcessDone` / `gaTrackExport` / `gaTrackError` 在 consent granted 时触发
- [ ] clearAll：state 完全重置，DOM 清空，进行中的 fetch 被 abort
