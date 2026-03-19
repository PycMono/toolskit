# Block I-02 · 图片压缩 — 首页 Landing + 拖拽上传 + 压缩选项面板

> **路由**：`/img/compress`  
> **预估工时**：2h  
> **依赖**：I-01  
> **交付粒度**：完整页面 HTML + CSS，包含 Hero 区、超大拖拽上传区、质量滑块、格式转换选项、三特性卡片、FAQ

---

## 1. 竞品分析（TinyPNG UI 对标）

| 区域 | TinyPNG | 本次实现 | 差异化 |
|------|---------|---------|------|
| 背景 | 深绿色纹理背景（熊猫主题）| 浅米白 + 翠绿主色 | 更简洁现代 |
| 上传区 | 页面中央超大虚线框 | ✅ 全宽超大虚线框 | — |
| 拖拽提示 | 简洁文字 | ✅ + 动态图标 | — |
| 批量提示 | 无 | ✅ 显示已选数量 | 差异化 |
| 质量控制 | ❌ 无法调整 | ✅ **质量滑块** | 核心差异 |
| 格式转换 | ✅ Pro 功能 | ✅ **免费** | 核心差异 |
| 最大宽度 | ❌ | ✅ 可选缩放 | 差异化 |
| 结果区 | 同页显示 | ✅ 同页显示 | — |

---

## 2. 完整 HTML 模板

```html
<!-- templates/img/compress.html -->
<!DOCTYPE html>
<html lang="{{ .Lang }}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ .Title }}</title>
  <meta name="description" content="{{ .Desc }}">
  <!-- SEO Meta（见 I-01）-->

  <!-- 依赖库（CDN）-->
  <script src="https://cdn.jsdelivr.net/npm/browser-image-compression@2.0.2/dist/browser-image-compression.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>

  <link rel="stylesheet" href="/static/css/img-compress.css">
</head>
<body class="img-compress-page">

<!-- ── 导航 ──────────────────────────────────── -->
<nav class="ic-navbar">
  <div class="ic-container">
    <a class="ic-logo" href="/img/compress">
      <span class="ic-logo__icon">🗜️</span>
      <span class="ic-logo__text">图片压缩</span>
    </a>
    <div class="ic-navbar__right">
      <div class="ic-lang-switch">
        <a href="?lang=zh" class="{{ if eq .Lang "zh" }}active{{ end }}">中文</a>
        <span>/</span>
        <a href="?lang=en" class="{{ if eq .Lang "en" }}active{{ end }}">EN</a>
      </div>
    </div>
  </div>
</nav>

<!-- 广告位：顶部 -->
{{- template "partials/ad_slot.html" dict "SlotID" "img-top" "Size" "728x90" "Mobile" "320x50" }}

<!-- ── Hero + 上传区（核心区域）──────────────── -->
<section class="ic-hero">
  <div class="ic-container">

    <!-- 标题 -->
    <div class="ic-hero__text">
      <h1 class="ic-hero__title">{{ t .Lang "img.compress.hero.title" }}</h1>
      <p class="ic-hero__subtitle">{{ t .Lang "img.compress.hero.subtitle" }}</p>
      <div class="ic-hero__badges">
        <span class="ic-badge">🔒 {{ t .Lang "img.compress.hero.badge1" }}</span>
        <span class="ic-badge">⚡ {{ t .Lang "img.compress.hero.badge2" }}</span>
        <span class="ic-badge">✅ {{ t .Lang "img.compress.hero.badge3" }}</span>
      </div>
    </div>

    <!-- ── 超大拖拽上传区 ── -->
    <div class="ic-upload-zone" id="uploadZone"
         ondragover="onDragOver(event)"
         ondragleave="onDragLeave(event)"
         ondrop="onDrop(event)">

      <!-- 默认态（无文件）-->
      <div class="ic-upload-zone__idle" id="uploadIdle">
        <div class="ic-upload-zone__graphic">
          <div class="ic-upload-icon-wrap">
            <!-- 图片堆叠动画图标 -->
            <div class="ic-img-stack">
              <div class="ic-img-stack__card ic-img-stack__card--3"></div>
              <div class="ic-img-stack__card ic-img-stack__card--2"></div>
              <div class="ic-img-stack__card ic-img-stack__card--1">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="3"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
            </div>
          </div>
          <div class="ic-upload-zone__arrow">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <polyline points="19 12 12 19 5 12"/>
            </svg>
          </div>
        </div>

        <p class="ic-upload-zone__title">{{ t .Lang "img.compress.upload.title" }}</p>
        <p class="ic-upload-zone__hint">{{ t .Lang "img.compress.upload.multi" }}</p>

        <label class="ic-upload-btn">
          {{ t .Lang "img.compress.upload.btn" }}
          <input type="file" id="fileInput"
                 accept="image/jpeg,image/png,image/webp"
                 multiple style="display:none"
                 onchange="onFileSelect(this)">
        </label>
        <p class="ic-upload-zone__limit">{{ t .Lang "img.compress.upload.hint" }}</p>
      </div>

      <!-- 拖拽激活态 -->
      <div class="ic-upload-zone__drop-overlay" id="dropOverlay">
        <div class="ic-drop-icon">📂</div>
        <p>{{ t .Lang "img.compress.upload.drop_active" }}</p>
      </div>

    </div><!-- /ic-upload-zone -->

    <!-- ── 压缩选项面板（上传后才显示）── -->
    <div class="ic-options-panel" id="optionsPanel" style="display:none">

      <!-- 质量滑块 -->
      <div class="ic-option-group">
        <div class="ic-option-group__header">
          <label class="ic-option-label">
            {{ t .Lang "img.compress.options.quality.label" }}
          </label>
          <div class="ic-quality-display">
            <span id="qualityValue">80</span>%
          </div>
        </div>
        <div class="ic-quality-slider-wrap">
          <span class="ic-slider-min">小文件</span>
          <input type="range" id="qualitySlider"
                 min="20" max="100" value="80" step="5"
                 oninput="onQualityChange(this.value)"
                 class="ic-quality-slider">
          <span class="ic-slider-max">高画质</span>
        </div>
        <p class="ic-option-hint">{{ t .Lang "img.compress.options.quality.hint" }}</p>
      </div>

      <!-- 输出格式 -->
      <div class="ic-option-group">
        <label class="ic-option-label">
          {{ t .Lang "img.compress.options.format.label" }}
        </label>
        <div class="ic-format-options" id="formatOptions">
          <label class="ic-format-card ic-format-card--active">
            <input type="radio" name="outputFormat" value="original" checked>
            <div class="ic-format-card__inner">
              <span class="ic-format-card__icon">🔄</span>
              <span class="ic-format-card__name">{{ t .Lang "img.compress.options.format.original" }}</span>
            </div>
          </label>
          <label class="ic-format-card">
            <input type="radio" name="outputFormat" value="image/jpeg">
            <div class="ic-format-card__inner">
              <span class="ic-format-card__icon">🖼️</span>
              <span class="ic-format-card__name">{{ t .Lang "img.compress.options.format.jpg" }}</span>
            </div>
          </label>
          <label class="ic-format-card">
            <input type="radio" name="outputFormat" value="image/png">
            <div class="ic-format-card__inner">
              <span class="ic-format-card__icon">🗺️</span>
              <span class="ic-format-card__name">{{ t .Lang "img.compress.options.format.png" }}</span>
            </div>
          </label>
          <label class="ic-format-card ic-format-card--recommended">
            <input type="radio" name="outputFormat" value="image/webp">
            <div class="ic-format-card__inner">
              <span class="ic-format-card__icon">⚡</span>
              <span class="ic-format-card__name">{{ t .Lang "img.compress.options.format.webp" }}</span>
              <span class="ic-format-card__tag">推荐</span>
            </div>
          </label>
        </div>
      </div>

      <!-- 最大宽度（可选）-->
      <div class="ic-option-group ic-option-group--inline">
        <label class="ic-option-label">
          {{ t .Lang "img.compress.options.maxwidth.label" }}
        </label>
        <div class="ic-maxwidth-input">
          <input type="number" id="maxWidth" min="100" max="10000"
                 placeholder="例如：1920（留空不缩放）" class="ic-input">
          <span class="ic-input-unit">px</span>
        </div>
        <p class="ic-option-hint">{{ t .Lang "img.compress.options.maxwidth.hint" }}</p>
      </div>

      <!-- 开始压缩按钮 -->
      <button class="ic-compress-btn" id="compressBtn" onclick="startCompress()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.5">
          <polyline points="16 16 12 12 8 16"/>
          <line x1="12" y1="12" x2="12" y2="21"/>
          <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
        </svg>
        <span id="compressBtnText">开始压缩</span>
      </button>

    </div><!-- /ic-options-panel -->

  </div><!-- /ic-container -->
</section>

<!-- ── 结果区（压缩后动态插入）────────────────── -->
<section class="ic-results-section" id="resultsSection" style="display:none">
  <div class="ic-container">
    <div class="ic-results-layout">

      <!-- 左：结果列表 -->
      <div class="ic-results-main">

        <!-- 结果头部 -->
        <div class="ic-results-header" id="resultsHeader">
          <!-- 由 JS 动态注入：X 张图片，共节省 YMB（压缩率 Z%）-->
        </div>

        <!-- 结果列表 -->
        <div class="ic-results-list" id="resultsList">
          <!-- 由 JS 动态插入结果卡片（见 I-04）-->
        </div>

        <!-- 批量操作栏 -->
        <div class="ic-bulk-actions" id="bulkActions">
          <button class="ic-btn-download-all" id="downloadAllBtn" onclick="downloadAll()">
            ⬇ {{ t .Lang "img.compress.download.all" }}
          </button>
          <span class="ic-bulk-hint">{{ t .Lang "img.compress.download.all_hint" }}</span>
          <button class="ic-btn-clear" onclick="clearAll()">
            🗑 {{ t .Lang "img.compress.download.clear" }}
          </button>
        </div>

        <!-- 继续添加更多图片 -->
        <div class="ic-add-more">
          <label class="ic-add-more-btn">
            + 继续添加图片
            <input type="file" accept="image/jpeg,image/png,image/webp"
                   multiple style="display:none"
                   onchange="onFileSelect(this)">
          </label>
        </div>

      </div><!-- /ic-results-main -->

      <!-- 右：广告位 + 相关工具 -->
      <div class="ic-results-sidebar">
        {{- template "partials/ad_slot.html" dict "SlotID" "img-sidebar" "Size" "300x250" "MobileHide" true }}
      </div>

    </div>
  </div>
</section>

<!-- ── 三特性介绍 ─────────────────────────────── -->
<section class="ic-features-section">
  <div class="ic-container">
    <div class="ic-features-grid">

      <div class="ic-feature-card">
        <div class="ic-feature-icon" style="background:#e6f9f2">🔒</div>
        <h3>{{ t .Lang "img.compress.feature.privacy.title" }}</h3>
        <p>{{ t .Lang "img.compress.feature.privacy.desc" }}</p>
      </div>

      <div class="ic-feature-card">
        <div class="ic-feature-icon" style="background:#e8f4fd">⚡</div>
        <h3>{{ t .Lang "img.compress.feature.fast.title" }}</h3>
        <p>{{ t .Lang "img.compress.feature.fast.desc" }}</p>
      </div>

      <div class="ic-feature-card">
        <div class="ic-feature-icon" style="background:#fef9e7">🎁</div>
        <h3>{{ t .Lang "img.compress.feature.free.title" }}</h3>
        <p>{{ t .Lang "img.compress.feature.free.desc" }}</p>
      </div>

    </div>
  </div>
</section>

<!-- ── FAQ ────────────────────────────────────── -->
<section class="ic-faq-section">
  <div class="ic-container">
    <h2 class="ic-section-title">{{ t .Lang "img.compress.faq.title" }}</h2>
    <div class="ic-faq-list">
      {{- range $i, $faq := .FAQs }}
      <div class="ic-faq-item" id="faq-{{ $i }}">
        <button class="ic-faq-question" onclick="toggleFAQ('faq-{{ $i }}')">
          <span>{{ $faq.Q }}</span>
          <svg class="ic-faq-chevron" width="16" height="16" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        <div class="ic-faq-answer"><p>{{ $faq.A }}</p></div>
      </div>
      {{- end }}
    </div>
  </div>
</section>

<!-- 广告位：底部 -->
{{- template "partials/ad_slot.html" dict "SlotID" "img-bottom" "Size" "728x90" "Mobile" "320x50" }}

<!-- Toast 容器 -->
<div id="toastContainer"></div>

<script src="/static/js/img-compress-engine.js"></script>
<script src="/static/js/img-compress-ui.js"></script>
</body>
</html>
```

---

## 3. CSS（`/static/css/img-compress.css`）

```css
/* ══════════════════════════════════════════════
   图片压缩工具 — 完整样式
   主色：翠绿 #1a9b6c
   背景：米白 #fafaf8
════════════════════════════════════════════════ */

:root {
  --ic-green:        #1a9b6c;
  --ic-green-dark:   #147a55;
  --ic-green-light:  #e6f9f2;
  --ic-bg:           #fafaf8;
  --ic-surface:      #ffffff;
  --ic-border:       #e8e4dc;
  --ic-border-focus: #1a9b6c;
  --ic-text:         #1a1a1a;
  --ic-text-muted:   #72726e;
  --ic-shadow-sm:    0 1px 3px rgba(0,0,0,0.06);
  --ic-shadow-md:    0 4px 16px rgba(0,0,0,0.08);
  --ic-shadow-lg:    0 12px 40px rgba(0,0,0,0.12);
  --ic-radius-sm:    8px;
  --ic-radius-md:    14px;
  --ic-radius-lg:    20px;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body.img-compress-page {
  font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', system-ui, sans-serif;
  background: var(--ic-bg);
  color: var(--ic-text);
  line-height: 1.6;
}

.ic-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px;
}

.ic-section-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--ic-text);
  text-align: center;
  margin-bottom: 28px;
}

/* ══ 导航 ═══════════════════════════════════════ */
.ic-navbar {
  background: var(--ic-surface);
  border-bottom: 1px solid var(--ic-border);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--ic-shadow-sm);
}

.ic-navbar > .ic-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 54px;
}

.ic-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  font-weight: 800;
  font-size: 1rem;
  color: var(--ic-green);
}

.ic-logo__icon { font-size: 1.25rem; }

.ic-lang-switch {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  color: var(--ic-text-muted);
}
.ic-lang-switch a {
  color: var(--ic-text-muted);
  text-decoration: none;
  font-weight: 500;
}
.ic-lang-switch a.active { color: var(--ic-green); font-weight: 700; }

/* ══ Hero ════════════════════════════════════════ */
.ic-hero {
  padding: 52px 0 40px;
  background: linear-gradient(180deg, #f0fdf8 0%, var(--ic-bg) 100%);
}

.ic-hero__text { text-align: center; margin-bottom: 36px; }

.ic-hero__title {
  font-size: 2.5rem;
  font-weight: 900;
  color: var(--ic-text);
  letter-spacing: -0.03em;
  line-height: 1.15;
  margin-bottom: 12px;
}

.ic-hero__subtitle {
  font-size: 1.0625rem;
  color: var(--ic-text-muted);
  max-width: 500px;
  margin: 0 auto 20px;
}

.ic-hero__badges {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.ic-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 14px;
  background: var(--ic-surface);
  border: 1px solid var(--ic-border);
  border-radius: 999px;
  font-size: 0.8125rem;
  color: var(--ic-text-muted);
  box-shadow: var(--ic-shadow-sm);
}

/* ══ 超大拖拽上传区 ═══════════════════════════════ */
.ic-upload-zone {
  position: relative;
  background: var(--ic-surface);
  border: 2.5px dashed var(--ic-border);
  border-radius: var(--ic-radius-lg);
  padding: 56px 32px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, transform 0.15s;
  box-shadow: var(--ic-shadow-md);
  overflow: hidden;
}

.ic-upload-zone:hover {
  border-color: var(--ic-green);
  background: var(--ic-green-light);
  transform: translateY(-2px);
  box-shadow: var(--ic-shadow-lg);
}

/* 拖拽激活态 */
.ic-upload-zone--dragover {
  border-color: var(--ic-green) !important;
  background: var(--ic-green-light) !important;
  transform: scale(1.01) !important;
}

.ic-upload-zone__idle { pointer-events: none; }

/* 图片堆叠图标 */
.ic-upload-zone__graphic {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
}

.ic-img-stack {
  position: relative;
  width: 72px;
  height: 72px;
}

.ic-img-stack__card {
  position: absolute;
  width: 60px;
  height: 64px;
  border-radius: 10px;
  border: 2px solid var(--ic-border);
  background: var(--ic-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s;
}

.ic-img-stack__card--3 {
  transform: rotate(-8deg) translate(-4px, 4px);
  background: #fef3cd;
  border-color: #fde68a;
  z-index: 1;
}

.ic-img-stack__card--2 {
  transform: rotate(-3deg) translate(-2px, 2px);
  background: #dbeafe;
  border-color: #93c5fd;
  z-index: 2;
}

.ic-img-stack__card--1 {
  transform: rotate(0deg);
  background: var(--ic-green-light);
  border-color: var(--ic-green);
  color: var(--ic-green);
  z-index: 3;
}

.ic-upload-zone:hover .ic-img-stack__card--3 { transform: rotate(-12deg) translate(-8px, 6px); }
.ic-upload-zone:hover .ic-img-stack__card--2 { transform: rotate(-5deg) translate(-4px, 3px); }

.ic-upload-zone__arrow {
  color: var(--ic-green);
  animation: ic-bounce 2s ease-in-out infinite;
}

@keyframes ic-bounce {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(6px); }
}

.ic-upload-zone__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--ic-text);
  margin-bottom: 6px;
}

.ic-upload-zone__hint {
  font-size: 0.875rem;
  color: var(--ic-text-muted);
  margin-bottom: 20px;
}

.ic-upload-btn {
  display: inline-flex;
  align-items: center;
  height: 46px;
  padding: 0 28px;
  background: var(--ic-green);
  color: #ffffff;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
  box-shadow: 0 4px 14px rgba(26,155,108,0.3);
  pointer-events: all;
}

.ic-upload-btn:hover   { background: var(--ic-green-dark); }
.ic-upload-btn:active  { transform: translateY(1px); }

.ic-upload-zone__limit {
  font-size: 0.75rem;
  color: #a8a49e;
  margin-top: 12px;
}

/* 拖拽悬浮层 */
.ic-upload-zone__drop-overlay {
  position: absolute;
  inset: 0;
  background: rgba(26,155,108,0.1);
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-radius: calc(var(--ic-radius-lg) - 2px);
  pointer-events: none;
}

.ic-upload-zone--dragover .ic-upload-zone__drop-overlay { display: flex; }

.ic-drop-icon { font-size: 3rem; }

.ic-upload-zone__drop-overlay p {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--ic-green);
}

/* ══ 选项面板 ════════════════════════════════════ */
.ic-options-panel {
  background: var(--ic-surface);
  border: 1px solid var(--ic-border);
  border-radius: var(--ic-radius-md);
  padding: 24px;
  margin-top: 16px;
  box-shadow: var(--ic-shadow-sm);
}

.ic-option-group {
  margin-bottom: 22px;
}

.ic-option-group__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.ic-option-label {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--ic-text);
  display: block;
  margin-bottom: 8px;
}

.ic-option-hint {
  font-size: 0.75rem;
  color: var(--ic-text-muted);
  margin-top: 6px;
}

/* 质量滑块 */
.ic-quality-display {
  font-size: 1.375rem;
  font-weight: 900;
  color: var(--ic-green);
  min-width: 60px;
  text-align: right;
}

.ic-quality-slider-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ic-slider-min, .ic-slider-max {
  font-size: 0.75rem;
  color: var(--ic-text-muted);
  flex-shrink: 0;
  white-space: nowrap;
}

.ic-quality-slider {
  flex: 1;
  -webkit-appearance: none;
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(
    to right,
    var(--ic-green) 0%,
    var(--ic-green) var(--slider-pct, 75%),
    #e8e4dc var(--slider-pct, 75%),
    #e8e4dc 100%
  );
  outline: none;
  cursor: pointer;
}

.ic-quality-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--ic-surface);
  border: 3px solid var(--ic-green);
  box-shadow: 0 2px 6px rgba(26,155,108,0.3);
  cursor: pointer;
  transition: transform 0.15s;
}

.ic-quality-slider::-webkit-slider-thumb:hover { transform: scale(1.2); }

/* 格式选项 */
.ic-format-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.ic-format-card input[type="radio"] { display: none; }

.ic-format-card__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border: 1.5px solid var(--ic-border);
  border-radius: var(--ic-radius-sm);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  text-align: center;
  position: relative;
}

.ic-format-card input:checked + .ic-format-card__inner {
  border-color: var(--ic-green);
  background: var(--ic-green-light);
  box-shadow: 0 0 0 3px rgba(26,155,108,0.12);
}

.ic-format-card--recommended .ic-format-card__inner {
  border-color: #92d5a7;
}

.ic-format-card__icon { font-size: 1.25rem; }
.ic-format-card__name { font-size: 0.75rem; font-weight: 600; color: var(--ic-text); }

.ic-format-card__tag {
  position: absolute;
  top: -8px;
  right: -6px;
  background: var(--ic-green);
  color: #fff;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 999px;
}

/* 最大宽度输入 */
.ic-option-group--inline .ic-option-label { margin-bottom: 8px; }

.ic-maxwidth-input {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 240px;
}

.ic-input {
  flex: 1;
  height: 38px;
  padding: 0 12px;
  border: 1.5px solid var(--ic-border);
  border-radius: var(--ic-radius-sm);
  font-size: 0.9rem;
  color: var(--ic-text);
  outline: none;
  transition: border-color 0.2s;
  background: var(--ic-surface);
}

.ic-input:focus {
  border-color: var(--ic-green);
  box-shadow: 0 0 0 3px rgba(26,155,108,0.1);
}

.ic-input-unit { font-size: 0.875rem; color: var(--ic-text-muted); }

/* 压缩按钮 */
.ic-compress-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  height: 52px;
  background: linear-gradient(135deg, var(--ic-green), var(--ic-green-dark));
  color: #ffffff;
  border: none;
  border-radius: 13px;
  font-size: 1.0625rem;
  font-weight: 800;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
  box-shadow: 0 6px 20px rgba(26,155,108,0.35);
  margin-top: 4px;
}

.ic-compress-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
.ic-compress-btn:active:not(:disabled) { transform: translateY(0); }
.ic-compress-btn:disabled {
  background: #e8e4dc;
  color: #a8a49e;
  box-shadow: none;
  cursor: not-allowed;
}

/* ══ 结果区 ══════════════════════════════════════ */
.ic-results-section {
  background: var(--ic-bg);
  padding: 32px 0 48px;
}

.ic-results-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 24px;
  align-items: start;
}

/* 结果统计头部 */
.ic-results-header {
  background: var(--ic-surface);
  border: 1px solid var(--ic-border);
  border-radius: var(--ic-radius-md);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  box-shadow: var(--ic-shadow-sm);
}

.ic-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ic-stat__label { font-size: 0.75rem; color: var(--ic-text-muted); }
.ic-stat__value { font-size: 1.125rem; font-weight: 800; color: var(--ic-text); }
.ic-stat__value--green { color: var(--ic-green); }

.ic-results-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

/* 批量操作栏 */
.ic-bulk-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  padding: 14px 0;
}

.ic-btn-download-all {
  height: 44px;
  padding: 0 24px;
  background: linear-gradient(135deg, var(--ic-green), var(--ic-green-dark));
  color: #ffffff;
  border: none;
  border-radius: 11px;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(26,155,108,0.3);
  transition: opacity 0.15s;
}
.ic-btn-download-all:hover { opacity: 0.9; }

.ic-bulk-hint {
  font-size: 0.8125rem;
  color: var(--ic-text-muted);
  flex: 1;
}

.ic-btn-clear {
  height: 36px;
  padding: 0 16px;
  background: transparent;
  border: 1px solid var(--ic-border);
  border-radius: 9px;
  font-size: 0.8125rem;
  color: var(--ic-text-muted);
  cursor: pointer;
  transition: background 0.15s;
}
.ic-btn-clear:hover { background: #fef2f2; color: #dc2626; border-color: #fecaca; }

/* 继续添加按钮 */
.ic-add-more-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 40px;
  width: 100%;
  max-width: 240px;
  background: transparent;
  border: 1.5px dashed var(--ic-border);
  border-radius: 10px;
  font-size: 0.875rem;
  color: var(--ic-text-muted);
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
  margin-top: 8px;
}
.ic-add-more-btn:hover { border-color: var(--ic-green); color: var(--ic-green); }

/* ══ 三特性 ══════════════════════════════════════ */
.ic-features-section {
  background: var(--ic-surface);
  padding: 56px 0;
  border-top: 1px solid var(--ic-border);
}

.ic-features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.ic-feature-card {
  text-align: center;
  padding: 32px 24px;
  background: var(--ic-bg);
  border: 1px solid var(--ic-border);
  border-radius: var(--ic-radius-md);
}

.ic-feature-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin: 0 auto 14px;
}

.ic-feature-card h3 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--ic-text);
  margin-bottom: 8px;
}

.ic-feature-card p {
  font-size: 0.875rem;
  color: var(--ic-text-muted);
  line-height: 1.65;
}

/* ══ FAQ ═════════════════════════════════════════ */
.ic-faq-section {
  background: var(--ic-bg);
  padding: 56px 0;
}

.ic-faq-list {
  max-width: 700px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ic-faq-item {
  background: var(--ic-surface);
  border: 1px solid var(--ic-border);
  border-radius: var(--ic-radius-sm);
  overflow: hidden;
}

.ic-faq-question {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: none;
  border: none;
  text-align: left;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--ic-text);
  cursor: pointer;
  gap: 12px;
}

.ic-faq-chevron { flex-shrink: 0; transition: transform 0.2s; color: var(--ic-text-muted); }
.ic-faq-item--open .ic-faq-chevron { transform: rotate(180deg); color: var(--ic-green); }

.ic-faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.ic-faq-item--open .ic-faq-answer { max-height: 300px; }

.ic-faq-answer p {
  padding: 0 20px 16px;
  font-size: 0.875rem;
  color: var(--ic-text-muted);
  margin: 0;
  line-height: 1.7;
}

/* ══ Toast ═══════════════════════════════════════ */
#toastContainer {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ic-toast {
  padding: 12px 18px;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #fff;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  opacity: 0;
  transform: translateX(20px);
  transition: opacity 0.25s, transform 0.25s;
  max-width: 300px;
}

.ic-toast--show    { opacity: 1; transform: translateX(0); }
.ic-toast--success { background: var(--ic-green); }
.ic-toast--error   { background: #dc2626; }
.ic-toast--info    { background: #374151; }

/* ══ 响应式 ══════════════════════════════════════ */
@media (max-width: 900px) {
  .ic-results-layout { grid-template-columns: 1fr; }
  .ic-results-sidebar { display: none; }
}

@media (max-width: 768px) {
  .ic-hero__title    { font-size: 1.75rem; }
  .ic-format-options { grid-template-columns: repeat(2, 1fr); }
  .ic-features-grid  { grid-template-columns: 1fr; }
  .ic-upload-zone    { padding: 36px 20px; }
}

@media (max-width: 480px) {
  .ic-hero__title { font-size: 1.5rem; }
  .ic-bulk-actions { flex-direction: column; align-items: flex-start; }
}
```

---

## 4. 验收标准

- [ ] 页面整体翠绿主色风格，与 PDF（红）/SMS（紫）工具明显区分
- [ ] 上传区占满容器，三张图片堆叠图标有 hover 展开动画
- [ ] 拖拽文件到上传区：边框变绿，背景色变浅绿，「松开鼠标」提示层出现
- [ ] 上传文件后，选项面板从下方平滑显示（`display:none → block + transition`）
- [ ] 质量滑块拖动时，右侧数字实时更新（20%~100%），滑槽颜色跟随
- [ ] 格式四选一卡片，选中绿色边框，WebP 卡片有「推荐」角标
- [ ] 压缩按钮点击后变 disabled 状态，文字变「压缩中...」
- [ ] 移动端（<768px）格式选项变两列，特性三列变单列
- [ ] FAQ 手风琴点击展开/收起，chevron 旋转 180°
