# ai-compete · 页面模板（I-02）

---

## 1. 竞品 UI 对标表

| UI 区域 | Competely.ai | Crayon | 本次实现 | 差异化 |
|---|---|---|---|---|
| 产品输入框 | 大号单行 URL | 表单多字段 | 大号 textarea（URL 或描述） | 更灵活，支持中文描述 |
| 竞品列表 | Tag 标签列 | 下拉选择 | Tag + 添加按钮 + AI 推荐弹层 | 交互更直觉 |
| 分析维度选择 | 无（固定全选） | 固定 | Checkbox 组，可自由勾选 | 用户可聚焦核心维度 |
| 分析进度 | 轮询 loading | loading | SSE 流式逐维度渐进渲染 | 实时感强，不焦虑等待 |
| 结果布局 | Tab 切换 | 卡片列表 | Accordion + 竞品横向对比列 | 一屏内对比更直观 |
| SWOT | 文字列表 | 无 | 四象限可视化矩阵卡 | 视觉冲击力强 |
| 导出 | PDF（付费） | Excel | Markdown 一键复制 | 免费，兼容 Notion |

---

## 2. 完整 HTML 模板骨架（templates/ai-compete.html）

```html
{{ template "base" . }}

{{ define "extraHead" }}
<link rel="canonical" href="{{ .Canonical }}">
<link rel="alternate" hreflang="zh"        href="{{ .HreflangZH }}">
<link rel="alternate" hreflang="en"        href="{{ .HreflangEN }}">
<link rel="alternate" hreflang="ja"        href="{{ .HreflangJA }}">
<link rel="alternate" hreflang="ko"        href="{{ .HreflangKO }}">
<link rel="alternate" hreflang="es"        href="{{ .HreflangSPA }}">
<link rel="alternate" hreflang="x-default" href="{{ .Canonical }}">
<link rel="stylesheet" href="/static/css/ai-compete.css?v={{ .AssetVer }}">
<script src="https://cdnjs.cloudflare.com/ajax/libs/marked/9.1.6/marked.min.js" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.6/purify.min.js" defer></script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "{{ .Title }}",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web Browser",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "description": "{{ .Description }}",
  "url": "{{ .Canonical }}"
}
</script>

{{ if .FAQs }}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {{ range $i, $faq := .FAQs }}{{ if $i }},{{ end }}
    {"@type":"Question","name":{{ $faq.Q | toJSON }},"acceptedAnswer":{"@type":"Answer","text":{{ $faq.A | toJSON }}}}
    {{ end }}
  ]
}
</script>
{{ end }}
{{ end }}

{{ define "content" }}
<div class="page-ai-compete">

  {{/* ① Hero 下方广告位 */}}
  {{- template "partials/ad_slot.html" (dict
      "SlotID"    "ai-compete-top"
      "AdSlotNum" ""
      "Size"      "728x90"
      "Mobile"    "320x50"
      "ClientID"  .AdsClientID
      "Enabled"   .AdsEnabled) }}

  {{/* ② Hero 区 */}}
  <section class="tool-hero" aria-labelledby="hero-title">
    <div class="container">
      <h1 id="hero-title">{{ call .T "ai-compete.hero.title" }}</h1>
      <p class="hero-subtitle">{{ call .T "ai-compete.hero.subtitle" }}</p>
      <div class="hero-badges" role="list">
        <span class="badge" role="listitem">{{ call .T "ai-compete.hero.badge1" }}</span>
        <span class="badge" role="listitem">{{ call .T "ai-compete.hero.badge2" }}</span>
        <span class="badge" role="listitem">{{ call .T "ai-compete.hero.badge3" }}</span>
      </div>
    </div>
  </section>

  {{/* ③ 主功能区 */}}
  <section class="tool-main container" aria-label="Competitive Analysis Tool">
    <div class="tool-layout">

      {{/* 输入面板 */}}
      <div class="tool-panel" id="inputPanel">

        {{/* 产品输入 */}}
        <div class="input-group">
          <label for="productInput" class="input-label">
            {{ call .T "ai-compete.input.product_label" }}
          </label>
          <textarea
            id="productInput"
            class="product-textarea"
            rows="3"
            placeholder="{{ call .T "ai-compete.input.product_placeholder" }}"
            aria-required="true"
            maxlength="1000"
          ></textarea>
        </div>

        {{/* 竞品列表 */}}
        <div class="input-group">
          <label class="input-label">
            {{ call .T "ai-compete.input.competitor_label" }}
          </label>

          {{/* AI 推荐按钮 */}}
          <button id="suggestBtn" class="btn btn-ghost btn-sm" type="button"
                  aria-label="{{ call .T "ai-compete.suggest.btn" }}">
            {{ call .T "ai-compete.suggest.btn" }}
          </button>

          {{/* 推荐竞品弹出层 */}}
          <div id="suggestDropdown" class="suggest-dropdown" hidden
               role="listbox" aria-label="Suggested competitors">
            <div id="suggestList" class="suggest-list"></div>
          </div>

          {{/* 已添加竞品 Tag 列表 */}}
          <div id="competitorTags" class="competitor-tags" role="list"
               aria-label="Added competitors"></div>

          {{/* 手动添加输入 */}}
          <div class="competitor-add-row">
            <input
              type="text"
              id="competitorInput"
              class="competitor-input"
              placeholder="{{ call .T "ai-compete.input.competitor_placeholder" }}"
              maxlength="200"
              aria-label="{{ call .T "ai-compete.input.competitor_label" }}"
            >
            <button id="addCompetitorBtn" class="btn btn-outline btn-sm" type="button">
              {{ call .T "ai-compete.input.competitor_add" }}
            </button>
          </div>
          <p id="competitorMaxMsg" class="input-hint error-text" hidden>
            {{ call .T "ai-compete.input.competitor_max" }}
          </p>
        </div>

        {{/* 分析维度勾选 */}}
        <div class="input-group">
          <span class="input-label">{{ call .T "ai-compete.dimension.label" }}</span>
          <div class="dimension-grid" role="group" aria-label="Analysis dimensions">
            <label class="dim-checkbox">
              <input type="checkbox" name="dim" value="marketing" checked>
              <span class="dim-icon">📣</span>
              {{ call .T "ai-compete.dimension.marketing" }}
            </label>
            <label class="dim-checkbox">
              <input type="checkbox" name="dim" value="product" checked>
              <span class="dim-icon">🧩</span>
              {{ call .T "ai-compete.dimension.product" }}
            </label>
            <label class="dim-checkbox">
              <input type="checkbox" name="dim" value="pricing" checked>
              <span class="dim-icon">💰</span>
              {{ call .T "ai-compete.dimension.pricing" }}
            </label>
            <label class="dim-checkbox">
              <input type="checkbox" name="dim" value="audience" checked>
              <span class="dim-icon">👥</span>
              {{ call .T "ai-compete.dimension.audience" }}
            </label>
            <label class="dim-checkbox">
              <input type="checkbox" name="dim" value="sentiment" checked>
              <span class="dim-icon">💬</span>
              {{ call .T "ai-compete.dimension.sentiment" }}
            </label>
            <label class="dim-checkbox">
              <input type="checkbox" name="dim" value="company" checked>
              <span class="dim-icon">🏢</span>
              {{ call .T "ai-compete.dimension.company" }}
            </label>
            <label class="dim-checkbox">
              <input type="checkbox" name="dim" value="swot" checked>
              <span class="dim-icon">📊</span>
              {{ call .T "ai-compete.dimension.swot" }}
            </label>
          </div>
        </div>

        {{/* 操作按钮 */}}
        <div class="tool-actions">
          <button id="analyzeBtn" class="btn btn-primary btn-lg" type="button"
                  aria-live="polite">
            {{ call .T "ai-compete.btn.analyze" }}
          </button>
          <button id="clearBtn" class="btn btn-ghost" type="button">
            {{ call .T "ai-compete.btn.clear" }}
          </button>
        </div>

        {{/* 错误提示 */}}
        <p id="errorMsg" class="error-text" role="alert" hidden></p>

      </div>{{/* /tool-panel */}}

      {{/* ④ 侧边广告位 */}}
      {{- template "partials/ad_slot.html" (dict
          "SlotID"     "ai-compete-sidebar"
          "AdSlotNum"  ""
          "Size"       "300x250"
          "MobileHide" true
          "ClientID"   .AdsClientID
          "Enabled"    .AdsEnabled) }}

    </div>{{/* /tool-layout */}}
  </section>

  {{/* ⑤ 分析进度条区 */}}
  <section class="analysis-progress container" id="progressSection" hidden
           aria-live="polite" aria-label="Analysis progress">
    <div class="progress-header">
      <span class="progress-spinner" aria-hidden="true"></span>
      <span id="progressText" class="progress-text"></span>
    </div>
    <div class="progress-bar-wrap" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
      <div id="progressBar" class="progress-bar"></div>
    </div>
    <div id="progressDimensions" class="progress-dimensions"></div>
  </section>

  {{/* ⑥ 结果区 */}}
  <section class="tool-results container" id="resultsSection" hidden
           aria-labelledby="resultsTitle">
    <div class="results-header">
      <h2 id="resultsTitle">{{ call .T "ai-compete.result.title" }}</h2>
      <div class="results-actions">
        <button id="exportBtn" class="btn btn-outline" type="button">
          {{ call .T "ai-compete.btn.export" }}
        </button>
        <button id="copyResultBtn" class="btn btn-ghost" type="button">
          {{ call .T "ai-compete.btn.copy" }}
        </button>
      </div>
    </div>
    {{/* 维度 Accordion 由 JS 动态生成 */}}
    <div id="dimensionAccordion" class="dimension-accordion"></div>
  </section>

  {{/* ⑦ 三特性卡片 */}}
  <section class="tool-features container" aria-label="Features">
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon" aria-hidden="true">⚡</div>
        <h3>{{ call .T "ai-compete.feature.1.title" }}</h3>
        <p>{{ call .T "ai-compete.feature.1.desc" }}</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon" aria-hidden="true">📊</div>
        <h3>{{ call .T "ai-compete.feature.2.title" }}</h3>
        <p>{{ call .T "ai-compete.feature.2.desc" }}</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon" aria-hidden="true">🔒</div>
        <h3>{{ call .T "ai-compete.feature.3.title" }}</h3>
        <p>{{ call .T "ai-compete.feature.3.desc" }}</p>
      </div>
    </div>
  </section>

  {{/* ⑧ FAQ */}}
  <section class="faq-section container" aria-labelledby="faq-title">
    <h2 id="faq-title">FAQ</h2>
    {{ range .FAQs }}
    <details class="faq-item">
      <summary class="faq-q">{{ .Q }}</summary>
      <div class="faq-a"><p>{{ .A }}</p></div>
    </details>
    {{ end }}
  </section>

  {{/* ⑨ 底部广告位 */}}
  {{- template "partials/ad_slot.html" (dict
      "SlotID"    "ai-compete-bottom"
      "AdSlotNum" ""
      "Size"      "728x90"
      "Mobile"    "320x50"
      "ClientID"  .AdsClientID
      "Enabled"   .AdsEnabled) }}

  {{/* ⑩ Toast 容器 */}}
  <div id="toastContainer" class="toast-container" role="status" aria-live="polite"></div>

</div>{{/* /page-ai-compete */}}
{{ end }}

{{ define "extraScript" }}
<script src="/static/js/ai-compete.js?v={{ .AssetVer }}"></script>
<script>
(function() {
  var TOOL = 'ai-compete';
  // gaTrackProcessDone(TOOL, competitorCount, durationMs)
  // gaTrackExport(TOOL, 'markdown')
  // gaTrackError(TOOL, 'api_error', errMsg)
  // gaTrackShare(TOOL, 'copy_result')
})();
</script>
{{ end }}
```

---

## 3. CSS 规范（static/css/ai-compete.css）

```css
/* static/css/ai-compete.css */

/* =========================================================
   1. CSS 变量（工具专属）
   ========================================================= */
:root {
  --ac-accent:       #6366f1;
  --ac-accent-light: #e0e7ff;
  --ac-accent-dark:  #4f46e5;
  --ac-amber:        #f59e0b;
  --ac-green:        var(--color-success, #22c55e);
  --ac-red:          var(--color-error,   #ef4444);
  --ac-dim-stripe:   3px solid var(--ac-accent);
  --ac-card-radius:  12px;
  --ac-shadow:       0 2px 12px rgba(99,102,241,0.10);
}

/* =========================================================
   2. 桌面端布局（默认，≥1024px）
   ========================================================= */
.page-ai-compete .tool-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 24px;
  align-items: flex-start;
}

.page-ai-compete .tool-hero {
  background: linear-gradient(135deg, var(--ac-accent-light) 0%, var(--color-bg) 100%);
  padding: 48px 0 32px;
  text-align: center;
}
.page-ai-compete .tool-hero h1 {
  font-size: clamp(1.6rem, 3.5vw, 2.5rem);
  color: var(--ac-accent-dark);
  font-weight: 800;
  margin-bottom: 12px;
}
.page-ai-compete .hero-subtitle {
  max-width: 620px;
  margin: 0 auto 20px;
  color: var(--color-text-secondary);
  line-height: 1.7;
}
.page-ai-compete .hero-badges {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}
.page-ai-compete .badge {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 4px 14px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
}

.page-ai-compete .tool-panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--ac-card-radius);
  padding: 24px;
  box-shadow: var(--ac-shadow);
}
.page-ai-compete .input-group { margin-bottom: 20px; }
.page-ai-compete .input-label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--color-text);
  font-size: 0.9rem;
}
.page-ai-compete .product-textarea {
  width: 100%;
  resize: vertical;
  min-height: 80px;
  padding: 10px 14px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.9rem;
  background: var(--color-bg);
  color: var(--color-text);
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.page-ai-compete .product-textarea:focus {
  border-color: var(--ac-accent);
  outline: none;
  box-shadow: 0 0 0 3px var(--ac-accent-light);
}

.page-ai-compete .competitor-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 36px;
  margin-bottom: 10px;
}
.page-ai-compete .competitor-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--ac-accent-light);
  color: var(--ac-accent-dark);
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 0.85rem;
  font-weight: 500;
}
.page-ai-compete .competitor-tag .tag-remove {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  color: var(--ac-accent);
  font-size: 1rem;
  min-height: 24px;
  min-width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.page-ai-compete .competitor-add-row {
  display: flex;
  gap: 8px;
}
.page-ai-compete .competitor-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg);
  color: var(--color-text);
  font-size: 0.9rem;
  min-height: 44px;
}
.page-ai-compete .competitor-input:focus {
  border-color: var(--ac-accent);
  outline: none;
}

.page-ai-compete .suggest-dropdown {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  padding: 8px;
  margin-bottom: 10px;
}
.page-ai-compete .suggest-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 8px;
  gap: 10px;
  cursor: default;
}
.page-ai-compete .suggest-item:hover { background: var(--ac-accent-light); }
.page-ai-compete .suggest-item-info { flex: 1; min-width: 0; }
.page-ai-compete .suggest-item-name { font-weight: 600; font-size: 0.9rem; }
.page-ai-compete .suggest-item-reason { font-size: 0.8rem; color: var(--color-text-secondary); }

.page-ai-compete .dimension-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
}
.page-ai-compete .dim-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.15s;
  min-height: 44px;
}
.page-ai-compete .dim-checkbox:has(input:checked) {
  background: var(--ac-accent-light);
  border-color: var(--ac-accent);
  color: var(--ac-accent-dark);
  font-weight: 500;
}
.page-ai-compete .dim-checkbox input[type="checkbox"] {
  accent-color: var(--ac-accent);
  width: 16px;
  height: 16px;
}

.page-ai-compete .tool-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 8px;
}
.page-ai-compete #analyzeBtn {
  background: var(--ac-accent);
  color: #fff;
  flex: 1;
  min-height: 48px;
  font-size: 1rem;
  font-weight: 700;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}
.page-ai-compete #analyzeBtn:hover  { background: var(--ac-accent-dark); }
.page-ai-compete #analyzeBtn:active { transform: scale(0.98); }
.page-ai-compete #analyzeBtn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.page-ai-compete .analysis-progress {
  margin-top: 24px;
  background: var(--color-surface);
  border-radius: var(--ac-card-radius);
  padding: 20px 24px;
  border: 1px solid var(--color-border);
}
.page-ai-compete .progress-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.page-ai-compete .progress-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid var(--ac-accent-light);
  border-top-color: var(--ac-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }
.page-ai-compete .progress-bar-wrap {
  background: var(--ac-accent-light);
  border-radius: 999px;
  height: 6px;
  overflow: hidden;
  margin-bottom: 16px;
}
.page-ai-compete .progress-bar {
  height: 100%;
  background: var(--ac-accent);
  border-radius: 999px;
  width: 0%;
  transition: width 0.4s ease;
}
.page-ai-compete .progress-dimensions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.page-ai-compete .progress-dim-tag {
  font-size: 0.8rem;
  padding: 3px 10px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}
.page-ai-compete .progress-dim-tag.done {
  background: var(--ac-accent-light);
  color: var(--ac-accent-dark);
  border-color: var(--ac-accent);
}
.page-ai-compete .progress-dim-tag.active {
  background: var(--ac-accent);
  color: #fff;
  border-color: var(--ac-accent);
  animation: pulse 1.2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.65; }
}

.page-ai-compete .results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}
.page-ai-compete .results-actions { display: flex; gap: 8px; }
.page-ai-compete .dimension-accordion { display: flex; flex-direction: column; gap: 12px; }
.page-ai-compete .dim-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--ac-card-radius);
  overflow: hidden;
  border-top: var(--ac-dim-stripe);
}
.page-ai-compete .dim-section summary {
  padding: 16px 20px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 56px;
  list-style: none;
  user-select: none;
}
.page-ai-compete .dim-section summary::-webkit-details-marker { display: none; }
.page-ai-compete .dim-section summary::after {
  content: "▾";
  margin-left: auto;
  transition: transform 0.2s;
  color: var(--color-text-secondary);
}
.page-ai-compete .dim-section[open] summary::after { transform: rotate(180deg); }
.page-ai-compete .dim-body { padding: 0 20px 20px; }

.page-ai-compete .swot-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 4px;
}
.page-ai-compete .swot-cell { border-radius: 10px; padding: 16px; }
.page-ai-compete .swot-cell.strengths     { background: rgba(34,197,94,0.10);  border: 1px solid rgba(34,197,94,0.25); }
.page-ai-compete .swot-cell.weaknesses    { background: rgba(239,68,68,0.10);  border: 1px solid rgba(239,68,68,0.25); }
.page-ai-compete .swot-cell.opportunities { background: rgba(245,158,11,0.10); border: 1px solid rgba(245,158,11,0.25); }
.page-ai-compete .swot-cell.threats       { background: rgba(99,102,241,0.10); border: 1px solid rgba(99,102,241,0.25); }
.page-ai-compete .swot-cell h4 {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 10px;
}
.page-ai-compete .swot-cell.strengths     h4 { color: var(--ac-green); }
.page-ai-compete .swot-cell.weaknesses    h4 { color: var(--ac-red); }
.page-ai-compete .swot-cell.opportunities h4 { color: var(--ac-amber); }
.page-ai-compete .swot-cell.threats       h4 { color: var(--ac-accent); }
.page-ai-compete .swot-cell ul { margin: 0; padding-left: 16px; font-size: 0.875rem; line-height: 1.7; }

.page-ai-compete .compare-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  overflow-x: auto;
  display: block;
}
.page-ai-compete .compare-table th,
.page-ai-compete .compare-table td {
  padding: 10px 14px;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}
.page-ai-compete .compare-table th {
  background: var(--ac-accent-light);
  color: var(--ac-accent-dark);
  font-weight: 700;
  position: sticky;
  top: 0;
}
.page-ai-compete .compare-table tr:last-child td { border-bottom: none; }

.page-ai-compete .features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 48px;
}
.page-ai-compete .feature-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--ac-card-radius);
  padding: 24px;
  text-align: center;
  transition: box-shadow 0.2s;
}
.page-ai-compete .feature-card:hover { box-shadow: var(--ac-shadow); }
.page-ai-compete .feature-icon { font-size: 2rem; margin-bottom: 12px; }
.page-ai-compete .feature-card h3 { font-size: 1rem; font-weight: 700; margin-bottom: 8px; }
.page-ai-compete .feature-card p  { font-size: 0.875rem; color: var(--color-text-secondary); line-height: 1.6; }

.page-ai-compete .faq-section { max-width: 760px; margin: 48px auto 0; }
.page-ai-compete .faq-section h2 { margin-bottom: 20px; }
.page-ai-compete .faq-item {
  border: 1px solid var(--color-border);
  border-radius: 10px;
  margin-bottom: 10px;
  overflow: hidden;
}
.page-ai-compete .faq-q {
  cursor: pointer;
  padding: 16px 20px;
  font-weight: 600;
  font-size: 0.95rem;
  min-height: 44px;
  display: flex;
  align-items: center;
  list-style: none;
}
.page-ai-compete .faq-q::-webkit-details-marker { display: none; }
.page-ai-compete .faq-a { padding: 0 20px 16px; color: var(--color-text-secondary); font-size: 0.9rem; line-height: 1.7; }

.page-ai-compete .toast-container { position: fixed; bottom: 24px; right: 24px; z-index: 9000; display: flex; flex-direction: column; gap: 8px; }
.page-ai-compete .toast {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 12px 20px;
  min-width: 200px;
  font-size: 0.9rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  animation: toastIn 0.3s ease;
}
@keyframes toastIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
.page-ai-compete .toast.success { border-left: 3px solid var(--ac-green); }
.page-ai-compete .toast.error   { border-left: 3px solid var(--ac-red); }
.page-ai-compete .error-text { color: var(--ac-red); font-size: 0.85rem; margin-top: 6px; }

/* =========================================================
   3. 平板端 @media (max-width: 1024px)
   ========================================================= */
@media (max-width: 1024px) {
  .page-ai-compete .tool-layout { grid-template-columns: 1fr; }
  .page-ai-compete .tool-layout > [class*="-sidebar"] { display: none; }
}

/* =========================================================
   4. 手机端 @media (max-width: 768px)
   ========================================================= */
@media (max-width: 768px) {
  .page-ai-compete .tool-hero { padding: 32px 0 24px; }
  .page-ai-compete .tool-hero h1 { font-size: clamp(1.4rem, 6vw, 2rem); }
  .page-ai-compete .features-grid { grid-template-columns: 1fr; gap: 12px; }
  .page-ai-compete .swot-grid { grid-template-columns: 1fr; }
  .page-ai-compete .tool-panel { padding: 16px; }
  .page-ai-compete .results-header { flex-direction: column; align-items: flex-start; }
  .page-ai-compete .toast-container { left: 12px; right: 12px; bottom: 80px; }
  .page-ai-compete .toast { min-width: 0; width: 100%; }
  .page-ai-compete .dim-section summary { padding: 14px 16px; }
  .page-ai-compete .dim-body { padding: 0 16px 16px; }
}

/* =========================================================
   5. 小手机端 @media (max-width: 480px)
   ========================================================= */
@media (max-width: 480px) {
  .page-ai-compete .ad-slot[data-size="728x90"] { overflow: hidden; max-width: 100%; }
  .page-ai-compete .tool-actions { flex-wrap: wrap; gap: 8px; }
  .page-ai-compete #analyzeBtn { flex: 1; min-width: 0; }
  .page-ai-compete .dimension-grid { grid-template-columns: repeat(2, 1fr); }
  .page-ai-compete .competitor-add-row { flex-wrap: wrap; }
  .page-ai-compete .competitor-input { min-width: 0; }
}

/* =========================================================
   6. 主题适配
   ========================================================= */
[data-theme="dark"]   .page-ai-compete { --ac-accent-light: rgba(99,102,241,0.15); }
[data-theme="forest"] .page-ai-compete { --ac-accent: #1a9b6c; --ac-accent-dark: #157a56; --ac-accent-light: rgba(26,155,108,0.12); }
[data-theme="ocean"]  .page-ai-compete { --ac-accent: #0ea5e9; --ac-accent-dark: #0284c7; --ac-accent-light: rgba(14,165,233,0.12); }
[data-theme="sunset"] .page-ai-compete { --ac-accent: #f97316; --ac-accent-dark: #ea6003; --ac-accent-light: rgba(249,115,22,0.12); }
```

---

## 4. 验收标准 Checklist

- [ ] 视觉：iPhone SE（375px）、iPad（768px）、Galaxy S8（360px）无横向滚动条
- [ ] 响应式：≤1024px 侧边广告自动隐藏；≤768px 单列布局，SWOT 矩阵变单列
- [ ] 触控：所有按钮/Tag 删除按钮/dim-checkbox touch target ≥ 44×44px
- [ ] 主题：5 种主题（light/dark/forest/ocean/sunset）下主色正确替换，SWOT 卡颜色可辨
- [ ] 语言切换：5 种语言文案均正确渲染，无 i18n key 裸露
- [ ] 广告：`AdsEnabled=false` 显示占位灰块；`AdSlotNum` 为空不展示广告
- [ ] FAQ：手风琴展开/折叠正常；`<details>` 语义正确
- [ ] Toast：不被底部 sticky 栏或系统导航遮挡（bottom: 80px on mobile）
- [ ] 进度条动画：维度 tag 状态（waiting/active/done）切换流畅
- [ ] SEO：JSON-LD SoftwareApplication + FAQPage 结构化数据在 Google Rich Results Test 通过
