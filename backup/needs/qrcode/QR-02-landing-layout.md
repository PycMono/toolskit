# Block QR-02 · 二维码生成工具 — 主页 Landing + 整体布局

> **路由**：`/media/qr`  
> **预估工时**：2h  
> **依赖**：QR-01  
> **交付粒度**：完整页面 HTML + CSS，包含 Hero 区、类型选择 Tab、左右分栏布局、特性四格、FAQ

---

## 1. 竞品分析（qr-code-generator.com UI 对标）

| 区域 | 竞品 | 本次实现 | 差异化 |
|------|------|---------|------|
| 整体背景 | 白色 | 浅米白 + 靛蓝主色 | 更现代 |
| 类型选择 | 水平 Tab 栏 + 图标 | ✅ 水平 Tab 栏 + Emoji 图标 | — |
| 布局 | 左配置 + 右预览 | ✅ 同，60/40 分栏 | — |
| 预览区 | 白色卡片居中 QR | ✅ 圆角卡片 + 扫描提示 | — |
| 设计选项 | 折叠面板 | ✅ 折叠面板（默认展开）| — |
| 边框选择 | 图片网格选择器 | ✅ 可视化网格 | — |
| 下载按钮 | 独立 4 个按钮 | ✅ 主按钮(PNG) + 下拉(SVG/JPG/EPS) | 更简洁 |

---

## 2. 完整 HTML 模板

```html
<!-- templates/media/qr.html -->
<!DOCTYPE html>
<html lang="{{ .Lang }}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ .Title }}</title>
  <meta name="description" content="{{ .Desc }}">
  <!-- SEO Meta（见 QR-01）-->

  <!-- 依赖库（CDN）-->
  <script src="https://cdn.jsdelivr.net/npm/qr-code-styling@1.6.0/lib/qr-code-styling.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>

  <link rel="stylesheet" href="/static/css/media-qr.css">
</head>
<body class="qr-page">

<!-- ── 导航 ──────────────────────────────────── -->
<nav class="qr-navbar">
  <div class="qr-container">
    <a class="qr-logo" href="/media/qr">
      <span class="qr-logo__icon">▦</span>
      <span class="qr-logo__text">{{ t .Lang "qr.name" }}</span>
    </a>
    <div class="qr-navbar__right">
      <div class="qr-lang-switch">
        <a href="?lang=zh" class="{{ if eq .Lang "zh" }}active{{ end }}">中文</a>
        <span>/</span>
        <a href="?lang=en" class="{{ if eq .Lang "en" }}active{{ end }}">EN</a>
      </div>
    </div>
  </div>
</nav>

<!-- 广告位：顶部 -->
{{- template "partials/ad_slot.html" dict "SlotID" "qr-top" "Size" "728x90" "Mobile" "320x50" }}

<!-- ── Hero ──────────────────────────────────── -->
<section class="qr-hero">
  <div class="qr-container">
    <div class="qr-hero__text">
      <h1 class="qr-hero__title">{{ t .Lang "qr.hero.title" }}</h1>
      <p class="qr-hero__subtitle">{{ t .Lang "qr.hero.subtitle" }}</p>
      <div class="qr-hero__badges">
        <span class="qr-badge">✅ {{ t .Lang "qr.hero.badge1" }}</span>
        <span class="qr-badge">🚀 {{ t .Lang "qr.hero.badge2" }}</span>
        <span class="qr-badge">⬇ {{ t .Lang "qr.hero.badge3" }}</span>
      </div>
    </div>
  </div>
</section>

<!-- ── 主工作区 ────────────────────────────────── -->
<section class="qr-workspace">
  <div class="qr-container qr-container--wide">

    <!-- 类型选择 Tab 栏 -->
    <div class="qr-type-tabs" id="typeTabs">

      <button class="qr-type-tab {{ if eq .CurrentType "url" }}active{{ end }}"
              onclick="switchType('url')" data-type="url">
        <span class="qr-type-tab__icon">🌐</span>
        <span class="qr-type-tab__name">{{ t .Lang "qr.type.url" }}</span>
      </button>

      <button class="qr-type-tab {{ if eq .CurrentType "vcard" }}active{{ end }}"
              onclick="switchType('vcard')" data-type="vcard">
        <span class="qr-type-tab__icon">👤</span>
        <span class="qr-type-tab__name">{{ t .Lang "qr.type.vcard" }}</span>
      </button>

      <button class="qr-type-tab {{ if eq .CurrentType "text" }}active{{ end }}"
              onclick="switchType('text')" data-type="text">
        <span class="qr-type-tab__icon">📝</span>
        <span class="qr-type-tab__name">{{ t .Lang "qr.type.text" }}</span>
      </button>

      <button class="qr-type-tab {{ if eq .CurrentType "sms" }}active{{ end }}"
              onclick="switchType('sms')" data-type="sms">
        <span class="qr-type-tab__icon">💬</span>
        <span class="qr-type-tab__name">{{ t .Lang "qr.type.sms" }}</span>
      </button>

      <button class="qr-type-tab {{ if eq .CurrentType "email" }}active{{ end }}"
              onclick="switchType('email')" data-type="email">
        <span class="qr-type-tab__icon">✉️</span>
        <span class="qr-type-tab__name">{{ t .Lang "qr.type.email" }}</span>
      </button>

      <button class="qr-type-tab {{ if eq .CurrentType "wifi" }}active{{ end }}"
              onclick="switchType('wifi')" data-type="wifi">
        <span class="qr-type-tab__icon">📶</span>
        <span class="qr-type-tab__name">{{ t .Lang "qr.type.wifi" }}</span>
      </button>

      <button class="qr-type-tab {{ if eq .CurrentType "twitter" }}active{{ end }}"
              onclick="switchType('twitter')" data-type="twitter">
        <span class="qr-type-tab__icon">🐦</span>
        <span class="qr-type-tab__name">{{ t .Lang "qr.type.twitter" }}</span>
      </button>

      <button class="qr-type-tab {{ if eq .CurrentType "bitcoin" }}active{{ end }}"
              onclick="switchType('bitcoin')" data-type="bitcoin">
        <span class="qr-type-tab__icon">₿</span>
        <span class="qr-type-tab__name">{{ t .Lang "qr.type.bitcoin" }}</span>
      </button>

    </div><!-- /qr-type-tabs -->

    <!-- 左右分栏布局 -->
    <div class="qr-layout">

      <!-- ── 左侧：配置区 ── -->
      <div class="qr-layout__left">

        <!-- 内容输入面板（见 QR-03）-->
        <div class="qr-panel" id="contentPanel">
          <div class="qr-panel__header">
            <span class="qr-panel__number">1</span>
            <span class="qr-panel__title">{{ t .Lang "qr.step.content" }}</span>
          </div>
          <div class="qr-panel__body" id="formContainer">
            <!-- 由 JS 根据 currentType 动态渲染表单 -->
          </div>
        </div>

        <!-- 生成按钮 -->
        <button class="qr-generate-btn" id="generateBtn" onclick="generateQR()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
            <rect x="14" y="14" width="3" height="3"/>
            <rect x="18" y="14" width="3" height="3"/>
            <rect x="14" y="18" width="3" height="3"/>
            <rect x="18" y="18" width="3" height="3"/>
          </svg>
          <span id="generateBtnText">{{ t .Lang "qr.generate.btn" }}</span>
        </button>

        <!-- 设计定制面板（见 QR-05）-->
        <div class="qr-panel qr-panel--collapsible" id="designPanel">
          <div class="qr-panel__header qr-panel__header--toggle"
               onclick="togglePanel('designPanel')">
            <span class="qr-panel__number">2</span>
            <span class="qr-panel__title">{{ t .Lang "qr.design.title" }}</span>
            <svg class="qr-panel__chevron" width="16" height="16"
                 viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
          <div class="qr-panel__body" id="designPanelBody">
            <!-- 由 QR-05 注入设计选项 -->
          </div>
        </div>

        <!-- 边框选择面板（见 QR-06）-->
        <div class="qr-panel qr-panel--collapsible" id="framePanel">
          <div class="qr-panel__header qr-panel__header--toggle"
               onclick="togglePanel('framePanel')">
            <span class="qr-panel__number">3</span>
            <span class="qr-panel__title">{{ t .Lang "qr.frame.title" }}</span>
            <svg class="qr-panel__chevron" width="16" height="16"
                 viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
          <div class="qr-panel__body" id="framePanelBody">
            <!-- 由 QR-06 注入边框选项 -->
          </div>
        </div>

      </div><!-- /qr-layout__left -->

      <!-- ── 右侧：预览区 ── -->
      <div class="qr-layout__right">

        <!-- 广告位：右侧（仅桌面）-->
        {{- template "partials/ad_slot.html" dict "SlotID" "qr-sidebar" "Size" "300x250" "MobileHide" true }}

        <!-- QR 码预览卡片 -->
        <div class="qr-preview-card" id="previewCard">

          <!-- 空态提示 -->
          <div class="qr-preview__empty" id="previewEmpty">
            <div class="qr-preview__empty-icon">▦</div>
            <p>{{ t .Lang "qr.preview.empty" }}</p>
          </div>

          <!-- QR 码 Canvas 容器 -->
          <div class="qr-preview__canvas-wrap" id="qrCanvasWrap" style="display:none">
            <div id="qrCanvas"></div>
          </div>

          <!-- 扫码提示 -->
          <p class="qr-preview__scan-hint" id="scanHint" style="display:none">
            📱 {{ t .Lang "qr.preview.scan_hint" }}
          </p>

          <!-- 下载按钮区（见 QR-06）-->
          <div class="qr-download-group" id="downloadGroup" style="display:none">

            <!-- 主下载按钮（PNG）-->
            <button class="qr-btn-download-primary" onclick="downloadQR('png')">
              ⬇ {{ t .Lang "qr.download.png" }}
            </button>

            <!-- 格式下拉 -->
            <div class="qr-download-formats">
              <button class="qr-btn-format" onclick="downloadQR('svg')">SVG</button>
              <button class="qr-btn-format" onclick="downloadQR('jpg')">JPG</button>
              <button class="qr-btn-format" onclick="downloadQR('eps')">EPS</button>
            </div>

            <!-- 复制到剪贴板 -->
            <button class="qr-btn-copy" onclick="copyQRImage()" id="copyBtn">
              📋 {{ t .Lang "qr.download.copying" }}
            </button>

          </div><!-- /qr-download-group -->

        </div><!-- /qr-preview-card -->

      </div><!-- /qr-layout__right -->

    </div><!-- /qr-layout -->

  </div><!-- /qr-container -->
</section>

<!-- ── 四特性介绍 ────────────────────────────── -->
<section class="qr-features-section">
  <div class="qr-container">
    <div class="qr-features-grid">

      <div class="qr-feature-card">
        <div class="qr-feature-icon" style="background:#eef2ff">✅</div>
        <h3>{{ t .Lang "qr.feature.free.title" }}</h3>
        <p>{{ t .Lang "qr.feature.free.desc" }}</p>
      </div>

      <div class="qr-feature-card">
        <div class="qr-feature-icon" style="background:#fffbeb">🎨</div>
        <h3>{{ t .Lang "qr.feature.custom.title" }}</h3>
        <p>{{ t .Lang "qr.feature.custom.desc" }}</p>
      </div>

      <div class="qr-feature-card">
        <div class="qr-feature-icon" style="background:#f0fdf4">📐</div>
        <h3>{{ t .Lang "qr.feature.hd.title" }}</h3>
        <p>{{ t .Lang "qr.feature.hd.desc" }}</p>
      </div>

      <div class="qr-feature-card">
        <div class="qr-feature-icon" style="background:#fdf2f8">🔢</div>
        <h3>{{ t .Lang "qr.feature.types.title" }}</h3>
        <p>{{ t .Lang "qr.feature.types.desc" }}</p>
      </div>

    </div>
  </div>
</section>

<!-- ── FAQ ────────────────────────────────────── -->
<section class="qr-faq-section">
  <div class="qr-container">
    <h2 class="qr-section-title">{{ t .Lang "qr.faq.title" }}</h2>
    <div class="qr-faq-list">
      {{- range $i, $faq := .FAQs }}
      <div class="qr-faq-item" id="faq-{{ $i }}">
        <button class="qr-faq-question" onclick="toggleFAQ('faq-{{ $i }}')">
          <span>{{ $faq.Q }}</span>
          <svg class="qr-faq-chevron" width="16" height="16" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        <div class="qr-faq-answer"><p>{{ $faq.A }}</p></div>
      </div>
      {{- end }}
    </div>
  </div>
</section>

<!-- 广告位：底部 -->
{{- template "partials/ad_slot.html" dict "SlotID" "qr-bottom" "Size" "728x90" "Mobile" "320x50" }}

<!-- Toast 容器 -->
<div id="toastContainer"></div>

<script>
  // 服务端注入当前语言 i18n 字典（给前端 JS 使用）
  window.QR_LANG = "{{ .Lang }}";
  window.QR_TYPE = "{{ .CurrentType }}";
</script>
<script src="/static/js/media-qr-forms.js"></script>
<script src="/static/js/media-qr-engine.js"></script>
<script src="/static/js/media-qr-design.js"></script>
<script src="/static/js/media-qr-frames.js"></script>
<script src="/static/js/media-qr-ui.js"></script>
</body>
</html>
```

---

## 3. CSS（`/static/css/media-qr.css`）

```css
/* ══════════════════════════════════════════════
   二维码生成工具 — 全局样式
   主色：靛蓝 #4f46e5
   背景：米白 #fafaf8
════════════════════════════════════════════════ */

:root {
  --qr-indigo:        #4f46e5;
  --qr-indigo-dark:   #4338ca;
  --qr-indigo-light:  #eef2ff;
  --qr-bg:            #fafaf8;
  --qr-surface:       #ffffff;
  --qr-border:        #e8e4dc;
  --qr-text:          #1a1a1a;
  --qr-text-muted:    #72726e;
  --qr-shadow-sm:     0 1px 3px rgba(0,0,0,0.06);
  --qr-shadow-md:     0 4px 16px rgba(0,0,0,0.08);
  --qr-shadow-lg:     0 12px 40px rgba(0,0,0,0.12);
  --qr-radius-sm:     8px;
  --qr-radius-md:     14px;
  --qr-radius-lg:     20px;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body.qr-page {
  font-family: 'PingFang SC', 'Hiragino Sans GB', system-ui, sans-serif;
  background: var(--qr-bg);
  color: var(--qr-text);
  line-height: 1.6;
}

.qr-container       { max-width: 1000px; margin: 0 auto; padding: 0 20px; }
.qr-container--wide { max-width: 1200px; }

.qr-section-title {
  font-size: 1.5rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 28px;
}

/* ── 导航 ─────────────────────────────────────── */
.qr-navbar {
  background: var(--qr-surface);
  border-bottom: 1px solid var(--qr-border);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--qr-shadow-sm);
}

.qr-navbar > .qr-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 54px;
}

.qr-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  font-weight: 800;
  font-size: 1rem;
  color: var(--qr-indigo);
}

.qr-logo__icon { font-size: 1.25rem; }

.qr-lang-switch {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  color: var(--qr-text-muted);
}
.qr-lang-switch a { color: var(--qr-text-muted); text-decoration: none; font-weight: 500; }
.qr-lang-switch a.active { color: var(--qr-indigo); font-weight: 700; }

/* ── Hero ─────────────────────────────────────── */
.qr-hero {
  padding: 48px 0 32px;
  background: linear-gradient(180deg, #f0f0ff 0%, var(--qr-bg) 100%);
}

.qr-hero__text { text-align: center; }

.qr-hero__title {
  font-size: 2.25rem;
  font-weight: 900;
  color: var(--qr-text);
  letter-spacing: -0.03em;
  margin-bottom: 12px;
}

.qr-hero__subtitle {
  font-size: 1rem;
  color: var(--qr-text-muted);
  max-width: 520px;
  margin: 0 auto 18px;
}

.qr-hero__badges {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.qr-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 14px;
  background: var(--qr-surface);
  border: 1px solid var(--qr-border);
  border-radius: 999px;
  font-size: 0.8125rem;
  color: var(--qr-text-muted);
  box-shadow: var(--qr-shadow-sm);
}

/* ── 类型 Tab ─────────────────────────────────── */
.qr-workspace { padding: 28px 0 48px; }

.qr-type-tabs {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 6px;
  margin-bottom: 20px;
  scrollbar-width: none;
}
.qr-type-tabs::-webkit-scrollbar { display: none; }

.qr-type-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 16px;
  background: var(--qr-surface);
  border: 1.5px solid var(--qr-border);
  border-radius: var(--qr-radius-sm);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, transform 0.1s;
  white-space: nowrap;
  flex-shrink: 0;
}

.qr-type-tab:hover {
  border-color: var(--qr-indigo);
  background: var(--qr-indigo-light);
}

.qr-type-tab.active {
  border-color: var(--qr-indigo);
  background: var(--qr-indigo-light);
  box-shadow: 0 0 0 3px rgba(79,70,229,0.12);
}

.qr-type-tab__icon { font-size: 1.25rem; }
.qr-type-tab__name {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--qr-text);
}

/* ── 左右布局 ─────────────────────────────────── */
.qr-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 20px;
  align-items: start;
}

/* ── 面板 ─────────────────────────────────────── */
.qr-panel {
  background: var(--qr-surface);
  border: 1px solid var(--qr-border);
  border-radius: var(--qr-radius-md);
  margin-bottom: 14px;
  box-shadow: var(--qr-shadow-sm);
  overflow: hidden;
}

.qr-panel__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  background: var(--qr-surface);
}

.qr-panel__header--toggle {
  cursor: pointer;
  border-bottom: 1px solid var(--qr-border);
  user-select: none;
}

.qr-panel__header--toggle:hover { background: #f9fafb; }

.qr-panel__number {
  width: 24px;
  height: 24px;
  background: var(--qr-indigo);
  color: #fff;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.qr-panel__title {
  flex: 1;
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--qr-text);
}

.qr-panel__chevron {
  transition: transform 0.2s;
  color: var(--qr-text-muted);
}

.qr-panel--open .qr-panel__chevron { transform: rotate(180deg); }

.qr-panel__body { padding: 18px; }

/* 折叠面板默认关闭 */
.qr-panel--collapsible .qr-panel__body {
  display: none;
}
.qr-panel--collapsible.qr-panel--open .qr-panel__body {
  display: block;
}

/* ── 生成按钮 ─────────────────────────────────── */
.qr-generate-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  height: 52px;
  background: linear-gradient(135deg, var(--qr-indigo), var(--qr-indigo-dark));
  color: #ffffff;
  border: none;
  border-radius: 13px;
  font-size: 1.0625rem;
  font-weight: 800;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
  box-shadow: 0 6px 20px rgba(79,70,229,0.35);
  margin-bottom: 14px;
}

.qr-generate-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
.qr-generate-btn:active:not(:disabled) { transform: translateY(0); }
.qr-generate-btn:disabled {
  background: #e8e4dc;
  color: #a8a49e;
  box-shadow: none;
  cursor: not-allowed;
}

/* ── 预览卡片 ─────────────────────────────────── */
.qr-preview-card {
  background: var(--qr-surface);
  border: 1px solid var(--qr-border);
  border-radius: var(--qr-radius-lg);
  padding: 24px;
  box-shadow: var(--qr-shadow-md);
  text-align: center;
  position: sticky;
  top: 72px;
}

.qr-preview__empty {
  padding: 48px 20px;
  color: var(--qr-text-muted);
}

.qr-preview__empty-icon {
  font-size: 3rem;
  color: #d1d5db;
  margin-bottom: 12px;
  line-height: 1;
}

.qr-preview__empty p {
  font-size: 0.875rem;
  color: #a8a49e;
}

.qr-preview__canvas-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  padding: 16px 0;
}

/* qr-code-styling 渲染的 canvas 居中 */
#qrCanvas { display: inline-block; }

.qr-preview__scan-hint {
  font-size: 0.8125rem;
  color: var(--qr-text-muted);
  margin: 8px 0 16px;
  padding: 8px 14px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px dashed var(--qr-border);
}

/* ── 下载按钮区 ───────────────────────────────── */
.qr-download-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
}

.qr-btn-download-primary {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, var(--qr-indigo), var(--qr-indigo-dark));
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
  box-shadow: 0 4px 14px rgba(79,70,229,0.3);
}

.qr-btn-download-primary:hover { opacity: 0.9; }

.qr-download-formats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.qr-btn-format {
  height: 36px;
  background: var(--qr-surface);
  border: 1.5px solid var(--qr-border);
  border-radius: 9px;
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--qr-text-muted);
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}

.qr-btn-format:hover {
  border-color: var(--qr-indigo);
  color: var(--qr-indigo);
  background: var(--qr-indigo-light);
}

.qr-btn-copy {
  height: 36px;
  background: transparent;
  border: 1px solid var(--qr-border);
  border-radius: 9px;
  font-size: 0.8125rem;
  color: var(--qr-text-muted);
  cursor: pointer;
  transition: background 0.15s;
}

.qr-btn-copy:hover { background: #f3f4f6; color: var(--qr-text); }

/* ── 四特性 ───────────────────────────────────── */
.qr-features-section {
  background: var(--qr-surface);
  padding: 56px 0;
  border-top: 1px solid var(--qr-border);
}

.qr-features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.qr-feature-card {
  text-align: center;
  padding: 28px 20px;
  background: var(--qr-bg);
  border: 1px solid var(--qr-border);
  border-radius: var(--qr-radius-md);
}

.qr-feature-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.375rem;
  margin: 0 auto 12px;
}

.qr-feature-card h3 { font-size: 0.9375rem; font-weight: 700; margin-bottom: 6px; }
.qr-feature-card p  { font-size: 0.8125rem; color: var(--qr-text-muted); line-height: 1.65; }

/* ── FAQ ──────────────────────────────────────── */
.qr-faq-section { background: var(--qr-bg); padding: 56px 0; }

.qr-faq-list {
  max-width: 700px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.qr-faq-item {
  background: var(--qr-surface);
  border: 1px solid var(--qr-border);
  border-radius: var(--qr-radius-sm);
  overflow: hidden;
}

.qr-faq-question {
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
  color: var(--qr-text);
  cursor: pointer;
  gap: 12px;
}

.qr-faq-chevron { flex-shrink: 0; transition: transform 0.2s; color: var(--qr-text-muted); }
.qr-faq-item--open .qr-faq-chevron { transform: rotate(180deg); color: var(--qr-indigo); }

.qr-faq-answer { max-height: 0; overflow: hidden; transition: max-height 0.3s ease; }
.qr-faq-item--open .qr-faq-answer { max-height: 300px; }
.qr-faq-answer p {
  padding: 0 20px 16px;
  font-size: 0.875rem;
  color: var(--qr-text-muted);
  line-height: 1.7;
}

/* ── Toast ────────────────────────────────────── */
#toastContainer {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.qr-toast {
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

.qr-toast--show    { opacity: 1; transform: translateX(0); }
.qr-toast--success { background: #16a34a; }
.qr-toast--error   { background: #dc2626; }
.qr-toast--info    { background: #374151; }

/* ── 响应式 ───────────────────────────────────── */
@media (max-width: 900px) {
  .qr-layout { grid-template-columns: 1fr; }
  .qr-preview-card { position: static; }
  .qr-features-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 600px) {
  .qr-hero__title    { font-size: 1.75rem; }
  .qr-features-grid  { grid-template-columns: 1fr; }
  .qr-type-tab       { padding: 8px 12px; }
  .qr-type-tab__name { font-size: 0.6875rem; }
}
```

---

## 4. 通用 UI JS（`/static/js/media-qr-ui.js`）

```javascript
// /static/js/media-qr-ui.js

let currentType = window.QR_TYPE || 'url';

/* ── 类型切换 ──────────────────────────────── */
function switchType(type) {
  currentType = type;

  // 更新 Tab 激活状态
  document.querySelectorAll('.qr-type-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === type);
  });

  // 重新渲染表单
  renderForm(type);

  // 更新 URL（不刷新页面）
  history.replaceState(null, '', `?type=${type}`);
}

/* ── 面板折叠 ──────────────────────────────── */
function togglePanel(panelId) {
  const panel = document.getElementById(panelId);
  panel.classList.toggle('qr-panel--open');
}

/* ── FAQ 折叠 ──────────────────────────────── */
function toggleFAQ(id) {
  const item   = document.getElementById(id);
  const isOpen = item.classList.contains('qr-faq-item--open');
  document.querySelectorAll('.qr-faq-item--open')
    .forEach(i => i.classList.remove('qr-faq-item--open'));
  if (!isOpen) item.classList.add('qr-faq-item--open');
}

/* ── Toast ──────────────────────────────────── */
function showToast(msg, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const el = document.createElement('div');
  el.className   = `qr-toast qr-toast--${type}`;
  el.textContent = msg;
  container.appendChild(el);
  requestAnimationFrame(() => el.classList.add('qr-toast--show'));
  setTimeout(() => {
    el.classList.remove('qr-toast--show');
    setTimeout(() => el.remove(), 300);
  }, 3500);
}

/* ── 初始化 ──────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  renderForm(currentType);
  initDesignPanel();
  initFramePanel();
});
```

---

## 5. 验收标准

- [ ] 8 个类型 Tab 全部可点击，切换时对应表单正确渲染
- [ ] 页面 URL 随类型切换更新（`?type=vcard` 等），刷新后类型保持
- [ ] 设计面板、边框面板默认折叠，点击 Header 展开/收起，chevron 旋转
- [ ] 移动端（< 900px）左右布局变上下堆叠，预览区在下方
- [ ] 四特性网格在 < 600px 变单列
- [ ] FAQ 折叠手风琴正常工作
