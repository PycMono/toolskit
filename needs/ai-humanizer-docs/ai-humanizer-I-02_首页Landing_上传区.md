<!-- ai-humanizer-I-02_首页Landing_上传区.md -->

# AI Humanizer — 首页 Landing & 上传区

---

## 1. 竞品 UI 对标表

| UI 区域 | humanizeai.pro | aihumanize.io | humanizeai.io | quillbot | **本次实现** |
|---------|:--------------:|:-------------:|:-------------:|:--------:|:------------:|
| 整体布局 | 单栏，上输入下输出 | 双栏分割 | 单栏，左右面板 | 双栏 | **双栏 50/50，等高联动** |
| 主题风格 | 白色简洁 | 白色+蓝 | 白色+绿 | 白色+绿 | **深色宇宙主题（暗/亮双模式）** |
| 模式选择器 | 无/隐藏 | 标签页3个 | 3个按钮 | 2档按钮 | **6个 Pill 横滚（带说明tooltip）** |
| 语调选择器 | 无 | 无 | 无 | 无 | **3档下拉选择** |
| AI分数展示 | 无 | 文字百分比 | 文字百分比 | 无 | **圆形甜甜圈图表（动画）** |
| 输入区特性 | 单文本框 | 文本框+上传 | 文本框 | 文本框 | **文本框+拖拽上传+字数统计+AI检测** |
| 输出区特性 | 文本框 | 文本框+复制 | 文本框+复制 | 文本框+复制 | **打字机流式+同义词点击+复制+下载TXT/DOCX** |
| 历史记录 | 无 | 无 | 无 | 无 | **LocalStorage 本地历史10条** |
| 深色模式 | 无 | 无 | 无 | 无 | **完整深/浅色双模式切换** |
| Hero 设计 | 普通标题 | 普通标题 | 普通标题 | 无Hero | **渐变宇宙背景+粒子+渐变裁切文字** |
| 响应式 | 基础 | 良好 | 一般 | 良好 | **Mobile-first，完美适配所有尺寸** |

---

## 2. 完整 HTML 模板结构

```html
{{/* templates/ai/humanizer.html */}}
{{ template "base.html" . }}

{{ define "content" }}

<!-- ① 顶部广告位（Hero 下方）-->
{{- template "partials/ad_slot.html" dict
    "SlotID" "ai-humanizer-top" "Size" "728x90" "Mobile" "320x50"
    "ClientID" .AdsClientID "Enabled" .AdsEnabled }}

<!-- ② Hero 区 -->
<section class="hero hero--humanizer" aria-label="AI Humanizer Hero">
  <!-- 粒子背景（纯CSS实现，无JS） -->
  <div class="hero__particles" aria-hidden="true">
    <span class="particle"></span><span class="particle"></span>
    <span class="particle"></span><span class="particle"></span>
    <span class="particle"></span>
  </div>

  <div class="container">
    <div class="hero__content">
      <!-- 标题徽章组 -->
      <div class="hero__badges" role="list">
        <span class="badge badge--glow" role="listitem" data-i18n="hero.badge.free">100% Free</span>
        <span class="badge" role="listitem" data-i18n="hero.badge.undetectable">Undetectable</span>
        <span class="badge" role="listitem" data-i18n="hero.badge.modes">6 Modes</span>
        <span class="badge badge--new" role="listitem" data-i18n="hero.badge.streaming">Live Streaming</span>
      </div>

      <!-- 主标题（渐变文字）-->
      <h1 class="hero__title">
        <span class="hero__title-gradient" data-i18n="hero.title">Humanize AI Text Instantly</span>
      </h1>

      <!-- 副标题 -->
      <p class="hero__subtitle" data-i18n="hero.subtitle">
        Transform AI-generated content into natural, undetectable human writing.
        Bypass every AI detector — GPTZero, Turnitin, Copyleaks &amp; more.
      </p>

      <!-- 可信度指标 -->
      <div class="hero__trust-bar" aria-label="Trust indicators">
        <div class="trust-item">
          <svg class="trust-icon" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 12l2 2 4-4M7.835 4.697A3 3 0 0012 3a3 3 0 014.165 1.697..."/>
          </svg>
          <span>GPTZero ✓</span>
        </div>
        <div class="trust-item"><span>Turnitin ✓</span></div>
        <div class="trust-item"><span>Copyleaks ✓</span></div>
        <div class="trust-item"><span>ZeroGPT ✓</span></div>
        <div class="trust-item"><span>Originality.ai ✓</span></div>
      </div>
    </div>
  </div>
</section>

<!-- ③ 主工具区（双栏）-->
<main class="tool-main" id="tool-app" role="main">
  <div class="container">

    <!-- 模式选择器 -->
    <div class="mode-selector" role="tablist" aria-label="Humanization modes">
      <div class="mode-selector__scroll">
        <button class="mode-btn mode-btn--active" role="tab"
                data-mode="basic" aria-selected="true"
                aria-describedby="mode-tooltip-basic">
          <span class="mode-btn__icon">⚡</span>
          <span class="mode-btn__label" data-i18n="mode.basic">Basic</span>
        </button>
        <button class="mode-btn" role="tab" data-mode="standard"
                aria-selected="false" aria-describedby="mode-tooltip-standard">
          <span class="mode-btn__icon">⚖️</span>
          <span class="mode-btn__label" data-i18n="mode.standard">Standard</span>
        </button>
        <button class="mode-btn" role="tab" data-mode="aggressive"
                aria-selected="false" aria-describedby="mode-tooltip-aggressive">
          <span class="mode-btn__icon">🔥</span>
          <span class="mode-btn__label" data-i18n="mode.aggressive">Aggressive</span>
          <span class="mode-btn__badge">Best</span>
        </button>
        <button class="mode-btn" role="tab" data-mode="academic"
                aria-selected="false" aria-describedby="mode-tooltip-academic">
          <span class="mode-btn__icon">🎓</span>
          <span class="mode-btn__label" data-i18n="mode.academic">Academic</span>
        </button>
        <button class="mode-btn" role="tab" data-mode="creative"
                aria-selected="false" aria-describedby="mode-tooltip-creative">
          <span class="mode-btn__icon">🎨</span>
          <span class="mode-btn__label" data-i18n="mode.creative">Creative</span>
        </button>
        <button class="mode-btn" role="tab" data-mode="business"
                aria-selected="false" aria-describedby="mode-tooltip-business">
          <span class="mode-btn__icon">💼</span>
          <span class="mode-btn__label" data-i18n="mode.business">Business</span>
        </button>
      </div>
      <!-- 模式描述 Tooltip（动态显示当前选中模式说明）-->
      <div class="mode-desc" id="mode-current-desc" aria-live="polite">
        <span data-i18n="mode.basic.desc">Light touch, fast, great for simple content</span>
      </div>
    </div>

    <!-- 双栏工作区 -->
    <div class="workspace" id="workspace">

      <!-- 左栏：输入面板 -->
      <div class="panel panel--input" id="panel-input"
           ondragover="AIHumanizer.onDragOver(event)"
           ondragleave="AIHumanizer.onDragLeave(event)"
           ondrop="AIHumanizer.onDrop(event)">

        <!-- 面板标题栏 -->
        <div class="panel__header">
          <h2 class="panel__title" data-i18n="input.panel_title">AI-Generated Text</h2>
          <div class="panel__header-actions">
            <!-- AI 检测分数圆形图（输入端）-->
            <div class="score-ring score-ring--input" id="score-ring-input"
                 title="AI Detection Score" aria-label="Input AI score">
              <canvas id="chart-input" width="52" height="52"
                      aria-hidden="true"></canvas>
              <div class="score-ring__label">
                <span class="score-ring__value" id="score-input-value">—</span>
                <span class="score-ring__unit">AI</span>
              </div>
            </div>
            <!-- 检测按钮 -->
            <button class="btn btn--sm btn--outline" id="btn-detect"
                    onclick="AIHumanizer.detectAI()"
                    data-i18n="action.detect">Detect AI</button>
            <!-- 文件上传 -->
            <label class="btn btn--sm btn--ghost" for="file-upload"
                   data-i18n="input.upload">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
              </svg>
              Upload
            </label>
            <input type="file" id="file-upload" class="sr-only"
                   accept=".txt,.pdf,.docx"
                   onchange="AIHumanizer.onFileSelect(event)">
          </div>
        </div>

        <!-- 文本输入区 -->
        <div class="panel__body">
          <div class="textarea-wrapper" id="drop-zone">
            <textarea
              id="input-text"
              class="panel__textarea"
              placeholder="{{ t "input.placeholder" . }}"
              oninput="AIHumanizer.onInputChange(event)"
              aria-label="Input AI-generated text"
              spellcheck="false"
              autocomplete="off"
            ></textarea>
            <!-- 拖拽覆盖层 -->
            <div class="drop-overlay" id="drop-overlay" aria-hidden="true">
              <div class="drop-overlay__content">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
                <p>Drop your file here</p>
                <small>TXT, PDF, DOCX supported</small>
              </div>
            </div>
          </div>
        </div>

        <!-- 面板底部工具栏 -->
        <div class="panel__footer">
          <div class="panel__stats">
            <span class="word-count" id="input-word-count">0 words</span>
            <span class="char-count" id="input-char-count">0 chars</span>
          </div>
          <div class="panel__footer-actions">
            <button class="btn btn--sm btn--ghost" id="btn-clear-input"
                    onclick="AIHumanizer.clearInput()"
                    title="Clear input">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 中间分隔栏（含主操作按钮）-->
      <div class="workspace__divider">
        <div class="divider__controls">
          <!-- 语调选择 -->
          <div class="control-group">
            <label class="control-label" data-i18n="tone.label">Tone</label>
            <select class="control-select" id="tone-selector"
                    onchange="AIHumanizer.onToneChange(event)">
              <option value="neutral" data-i18n="tone.neutral">Neutral</option>
              <option value="formal"  data-i18n="tone.formal">Formal</option>
              <option value="casual"  data-i18n="tone.casual">Casual</option>
            </select>
          </div>

          <!-- 语言选择 -->
          <div class="control-group">
            <label class="control-label" data-i18n="options.language">Language</label>
            <select class="control-select" id="lang-selector"
                    onchange="AIHumanizer.onLangChange(event)">
              <option value="en">English</option>
              <option value="zh">中文</option>
              <option value="ja">日本語</option>
              <option value="ko">한국어</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="pt">Português</option>
              <option value="it">Italiano</option>
              <option value="ru">Русский</option>
              <option value="ar">العربية</option>
              <option value="hi">हिन्दी</option>
            </select>
          </div>

          <!-- 保留格式开关 -->
          <div class="control-group control-group--toggle">
            <label class="toggle-label">
              <input type="checkbox" id="preserve-format" checked
                     onchange="AIHumanizer.onOptionChange()">
              <span class="toggle-switch"></span>
              <span class="toggle-text" data-i18n="options.preserve_format">Preserve Format</span>
            </label>
          </div>

          <!-- 主操作按钮 -->
          <button class="btn btn--primary btn--humanize" id="btn-humanize"
                  onclick="AIHumanizer.humanize()"
                  data-i18n="action.humanize">
            <span class="btn-icon">🧬</span>
            <span class="btn-text">Humanize Now</span>
            <span class="btn-arrow">→</span>
          </button>
        </div>
      </div>

      <!-- 右栏：输出面板 -->
      <div class="panel panel--output" id="panel-output">

        <!-- 面板标题栏 -->
        <div class="panel__header">
          <h2 class="panel__title" data-i18n="result.panel_title">Humanized Output</h2>
          <div class="panel__header-actions">
            <!-- AI 检测分数圆形图（输出端）-->
            <div class="score-ring score-ring--output" id="score-ring-output"
                 title="Humanized AI Score" aria-label="Output AI score">
              <canvas id="chart-output" width="52" height="52"
                      aria-hidden="true"></canvas>
              <div class="score-ring__label">
                <span class="score-ring__value" id="score-output-value">—</span>
                <span class="score-ring__unit">AI</span>
              </div>
            </div>
            <!-- 可读性 -->
            <div class="readability-badge" id="readability-badge" aria-live="polite">
              <span class="readability-badge__label" data-i18n="result.readability">Readability</span>
              <span class="readability-badge__value" id="readability-value">—</span>
            </div>
          </div>
        </div>

        <!-- 输出内容区 -->
        <div class="panel__body">
          <div class="output-wrapper" id="output-wrapper">
            <!-- 空状态 -->
            <div class="output-empty" id="output-empty" aria-live="polite">
              <div class="output-empty__icon">🧬</div>
              <p class="output-empty__text" data-i18n="result.empty">
                Your humanized text will appear here...
              </p>
            </div>
            <!-- 输出文本（流式写入）-->
            <div class="output-text" id="output-text"
                 style="display:none"
                 aria-live="polite"
                 aria-label="Humanized output text"></div>
            <!-- 处理中状态 -->
            <div class="output-processing" id="output-processing"
                 style="display:none" aria-live="assertive">
              <div class="processing-cursor"></div>
              <span class="processing-text" data-i18n="status.streaming">Generating...</span>
            </div>
          </div>
        </div>

        <!-- 面板底部操作栏 -->
        <div class="panel__footer">
          <div class="panel__stats">
            <span class="word-count" id="output-word-count">0 words</span>
            <!-- 分数改善幅度 -->
            <span class="improvement-badge" id="improvement-badge"
                  style="display:none" aria-live="polite">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 17L17 7M7 7h10v10"/>
              </svg>
              <span id="improvement-text">—</span>
            </span>
          </div>
          <div class="panel__footer-actions">
            <!-- 再次人性化 -->
            <button class="btn btn--sm btn--outline" id="btn-humanize-again"
                    onclick="AIHumanizer.humanize(true)"
                    style="display:none"
                    data-i18n="action.humanize_again">Try Again</button>
            <!-- 复制 -->
            <button class="btn btn--sm btn--primary" id="btn-copy"
                    onclick="AIHumanizer.copyOutput()"
                    data-i18n="action.copy">Copy</button>
            <!-- 下载菜单 -->
            <div class="dropdown" id="download-dropdown">
              <button class="btn btn--sm btn--ghost dropdown__toggle"
                      onclick="AIHumanizer.toggleDownloadMenu()"
                      aria-haspopup="true" aria-expanded="false">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                </svg>
              </button>
              <div class="dropdown__menu" role="menu">
                <button class="dropdown__item" role="menuitem"
                        onclick="AIHumanizer.downloadTxt()"
                        data-i18n="action.download.txt">Download TXT</button>
                <button class="dropdown__item" role="menuitem"
                        onclick="AIHumanizer.downloadDocx()"
                        data-i18n="action.download.docx">Download DOCX</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 进度条（全宽，双栏下方）-->
    <div class="progress-bar" id="progress-bar" style="display:none" aria-hidden="true">
      <div class="progress-bar__fill" id="progress-fill"></div>
    </div>

    <!-- 全局操作栏 -->
    <div class="global-actions">
      <button class="btn btn--ghost btn--sm" id="btn-clear-all"
              onclick="AIHumanizer.clearAll()"
              data-i18n="action.clear">Clear All</button>
      <button class="btn btn--ghost btn--sm" id="btn-history"
              onclick="AIHumanizer.toggleHistory()"
              data-i18n="history.title">History</button>
      <button class="btn btn--ghost btn--sm btn--icon" id="btn-theme"
              onclick="AIHumanizer.toggleTheme()"
              aria-label="Toggle dark/light mode">
        <svg id="icon-sun" width="16" height="16" viewBox="0 0 24 24"
             fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
        <svg id="icon-moon" width="16" height="16" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" style="display:none">
          <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 0010 9.79z"/>
        </svg>
      </button>
    </div>

  </div>
</main>

<!-- 历史记录抽屉 -->
<aside class="history-drawer" id="history-drawer"
       aria-label="Recent history" role="complementary">
  <div class="history-drawer__header">
    <h3 data-i18n="history.title">Recent History</h3>
    <button class="btn btn--ghost btn--sm"
            onclick="AIHumanizer.clearHistory()"
            data-i18n="history.clear">Clear</button>
    <button class="btn btn--ghost btn--icon"
            onclick="AIHumanizer.toggleHistory()"
            aria-label="Close history">✕</button>
  </div>
  <ul class="history-list" id="history-list" role="list">
    <!-- 由 JS 动态渲染 -->
  </ul>
</aside>

<!-- ④ 侧边广告位（桌面端）-->
{{- template "partials/ad_slot.html" dict
    "SlotID" "ai-humanizer-sidebar" "Size" "300x250" "MobileHide" true
    "ClientID" .AdsClientID "Enabled" .AdsEnabled }}

<!-- ⑤ 特性卡片区 -->
<section class="features-section" aria-label="Key features">
  <div class="container">
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-card__icon feature-card__icon--shield">🔒</div>
        <h3 data-i18n="feature.privacy.title">100% Private</h3>
        <p data-i18n="feature.privacy.desc">
          Your text is processed securely and never stored on our servers.
        </p>
      </div>
      <div class="feature-card">
        <div class="feature-card__icon feature-card__icon--bolt">⚡</div>
        <h3 data-i18n="feature.speed.title">Lightning Fast</h3>
        <p data-i18n="feature.speed.desc">
          Real-time streaming output. See results appear as they're generated.
        </p>
      </div>
      <div class="feature-card">
        <div class="feature-card__icon feature-card__icon--gift">🎁</div>
        <h3 data-i18n="feature.free.title">Forever Free</h3>
        <p data-i18n="feature.free.desc">
          No sign-up, no credit card. All 6 modes available free forever.
        </p>
      </div>
      <div class="feature-card">
        <div class="feature-card__icon feature-card__icon--star">✨</div>
        <h3 data-i18n="feature.multimode.title">6 Expert Modes</h3>
        <p data-i18n="feature.multimode.desc">
          From basic rewrites to creative storytelling — a mode for every need.
        </p>
      </div>
    </div>
  </div>
</section>

<!-- ⑥ FAQ 手风琴 -->
<section class="faq-section" aria-label="Frequently Asked Questions">
  <div class="container">
    <h2 class="section-title">Frequently Asked Questions</h2>
    <div class="faq-accordion" id="faq-accordion" role="list">
      {{ range $i, $faq := .FAQ }}
      <div class="faq-item" role="listitem">
        <button class="faq-question" aria-expanded="false"
                aria-controls="faq-answer-{{ $i }}"
                onclick="toggleFAQ(this)">
          <span>{{ $faq.Q }}</span>
          <span class="faq-icon" aria-hidden="true">+</span>
        </button>
        <div class="faq-answer" id="faq-answer-{{ $i }}" role="region" hidden>
          <p>{{ $faq.A }}</p>
        </div>
      </div>
      {{ end }}
    </div>
  </div>
</section>

<!-- ⑦ 底部广告位 -->
{{- template "partials/ad_slot.html" dict
    "SlotID" "ai-humanizer-bottom" "Size" "728x90" "Mobile" "320x50"
    "ClientID" .AdsClientID "Enabled" .AdsEnabled }}

<!-- Toast 容器 -->
<div class="toast-container" id="toast-container"
     role="alert" aria-live="assertive" aria-atomic="true"></div>

<!-- 同义词弹层 -->
<div class="synonym-panel" id="synonym-panel"
     style="display:none" role="dialog"
     aria-modal="true" aria-label="Synonym suggestions">
  <div class="synonym-panel__header">
    <span class="synonym-panel__word" id="synonym-word"></span>
    <button class="btn btn--ghost btn--icon"
            onclick="AIHumanizer.closeSynonymPanel()">✕</button>
  </div>
  <div class="synonym-panel__list" id="synonym-list" role="list"></div>
</div>

<!-- hCaptcha（若启用）-->
{{ if .CaptchaEnabled }}
<div class="captcha-wrapper" id="captcha-wrapper">
  <div class="h-captcha"
       data-sitekey="{{ .CaptchaSiteKey }}"
       data-callback="onCaptchaVerified"
       data-theme="dark"></div>
</div>
{{ end }}

{{ end }}
```

---

## 3. CSS 规范

### CSS 变量定义

```css
/* static/css/ai-humanizer.css */
:root {
  /* === 主色系 === */
  --c-primary:        #6c47ff;
  --c-primary-light:  #8b6dff;
  --c-primary-dark:   #4d2fe0;
  --c-primary-glow:   rgba(108, 71, 255, 0.18);
  --c-primary-border: rgba(108, 71, 255, 0.35);
  --gradient-primary: linear-gradient(135deg, #6c47ff 0%, #a855f7 100%);

  /* === AI 分数色 === */
  --c-score-danger:   #ef4444;  /* AI率 > 70% */
  --c-score-warning:  #f59e0b;  /* AI率 40-70% */
  --c-score-good:     #22c55e;  /* AI率 < 40% */

  /* === 深色背景（默认）=== */
  --c-bg:             #0f0e17;
  --c-surface:        #1a1830;
  --c-elevated:       #252340;
  --c-border:         rgba(255,255,255,0.08);
  --c-border-hover:   rgba(255,255,255,0.16);
  --c-text:           #f0eeff;
  --c-text-secondary: #a89fd8;
  --c-text-muted:     #6b63a1;

  /* === 圆角 === */
  --radius-sm:   8px;
  --radius-md:  12px;
  --radius-lg:  16px;
  --radius-xl:  24px;

  /* === 阴影 === */
  --shadow-sm:  0 2px 8px rgba(0,0,0,0.3);
  --shadow-md:  0 4px 24px rgba(0,0,0,0.4);
  --shadow-lg:  0 8px 48px rgba(0,0,0,0.5);
  --shadow-glow: 0 0 32px var(--c-primary-glow);

  /* === 动效时长 === */
  --duration-fast:   150ms;
  --duration-normal: 300ms;
  --duration-slow:   500ms;
}

/* 浅色模式覆盖 */
[data-theme="light"] {
  --c-bg:             #faf9ff;
  --c-surface:        #ffffff;
  --c-elevated:       #f0eeff;
  --c-border:         rgba(108, 71, 255, 0.12);
  --c-border-hover:   rgba(108, 71, 255, 0.25);
  --c-text:           #1a0a4e;
  --c-text-secondary: #4a3a7a;
  --c-text-muted:     #9080c0;
}
```

### 关键样式规则

```css
/* Hero 渐变背景 */
.hero--humanizer {
  background: linear-gradient(160deg, #0f0a1e 0%, #1a1035 50%, #0d1b2a 100%);
  position: relative;
  overflow: hidden;
  padding: 80px 0 60px;
}

/* 纯CSS粒子（5个伪随机漂浮圆点）*/
.particle {
  position: absolute;
  border-radius: 50%;
  background: var(--c-primary-glow);
  animation: float-particle var(--dur, 8s) ease-in-out infinite;
  animation-delay: var(--delay, 0s);
}
@keyframes float-particle {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.4; }
  50%       { transform: translateY(-30px) scale(1.2); opacity: 0.8; }
}

/* 渐变裁切标题 */
.hero__title-gradient {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  line-height: 1.15;
}

/* 工作区双栏布局 */
.workspace {
  display: grid;
  grid-template-columns: 1fr 140px 1fr;
  gap: 0;
  min-height: 480px;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--c-surface);
  box-shadow: var(--shadow-md);
}

/* 面板通用 */
.panel {
  display: flex;
  flex-direction: column;
  min-height: 480px;
}
.panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--c-border);
  background: var(--c-elevated);
}
.panel__textarea {
  flex: 1;
  width: 100%;
  min-height: 380px;
  padding: 16px;
  background: transparent;
  border: none;
  outline: none;
  color: var(--c-text);
  font-size: 15px;
  line-height: 1.7;
  resize: vertical;
  font-family: inherit;
}
.panel__textarea::placeholder { color: var(--c-text-muted); }

/* 拖拽悬停态 */
.panel--input.drag-over { border: 2px dashed var(--c-primary); }
.panel--input.drag-over .drop-overlay { display: flex !important; }

/* 模式选择器 Pill */
.mode-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 999px;
  border: 1.5px solid var(--c-border);
  background: transparent;
  color: var(--c-text-secondary);
  cursor: pointer; white-space: nowrap;
  transition: all var(--duration-fast);
}
.mode-btn--active,
.mode-btn:hover {
  border-color: var(--c-primary);
  background: var(--c-primary-glow);
  color: var(--c-primary-light);
  box-shadow: 0 0 12px var(--c-primary-glow);
}

/* AI 分数圆形图 */
.score-ring {
  position: relative; width: 52px; height: 52px;
  cursor: help;
}
.score-ring__label {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
}
.score-ring__value {
  font-size: 11px; font-weight: 700;
  color: var(--c-text);
  line-height: 1;
}
.score-ring__unit {
  font-size: 8px; color: var(--c-text-muted);
  text-transform: uppercase;
}

/* 主按钮人性化 */
.btn--humanize {
  width: 100%; padding: 14px 20px;
  background: var(--gradient-primary);
  border: none; border-radius: var(--radius-md);
  color: white; font-size: 15px; font-weight: 700;
  cursor: pointer; position: relative; overflow: hidden;
  transition: all var(--duration-normal);
  box-shadow: 0 4px 20px rgba(108,71,255,0.4);
}
.btn--humanize:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(108,71,255,0.5);
}
.btn--humanize:active { transform: translateY(0); }
.btn--humanize::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(rgba(255,255,255,0.1), transparent);
  pointer-events: none;
}

/* 输出区打字机光标 */
.processing-cursor {
  display: inline-block; width: 2px; height: 18px;
  background: var(--c-primary);
  animation: blink-cursor 0.7s step-end infinite;
  vertical-align: text-bottom; margin-left: 2px;
}
@keyframes blink-cursor {
  0%, 100% { opacity: 1; } 50% { opacity: 0; }
}

/* 进度条 */
.progress-bar {
  height: 3px; background: var(--c-border); border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  overflow: hidden;
}
.progress-bar__fill {
  height: 100%; width: 0%;
  background: var(--gradient-primary);
  transition: width 0.3s ease;
  border-radius: 999px;
}

/* 同义词面板 */
.synonym-panel {
  position: fixed; z-index: 1000;
  background: var(--c-elevated);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  min-width: 200px; max-width: 280px;
  padding: 12px;
}
.synonym-item {
  padding: 8px 12px; border-radius: var(--radius-sm);
  cursor: pointer; color: var(--c-text-secondary);
  transition: background var(--duration-fast);
}
.synonym-item:hover {
  background: var(--c-primary-glow); color: var(--c-primary-light);
}

/* 响应式断点 */
@media (max-width: 768px) {
  .workspace {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
  }
  .workspace__divider { padding: 16px; }
  .mode-selector__scroll { overflow-x: auto; }
  .panel__textarea { min-height: 240px; }
  .hero__title-gradient { font-size: 1.8rem; }
  .hero__trust-bar { flex-wrap: wrap; gap: 8px; }
}

@media (max-width: 480px) {
  .panel__header { padding: 8px 12px; }
  .score-ring { width: 40px; height: 40px; }
}
```

---

## 4. 验收标准 Checklist

### 视觉还原
- [ ] Hero 区显示宇宙渐变背景，5个粒子浮动动画流畅（CSS only）
- [ ] 标题使用渐变文字裁切（紫→粉），各浏览器无白块
- [ ] 双栏布局左右等宽，等高（`min-height: 480px`），竖向分隔线可见
- [ ] 6个模式 Pill 按钮横向滚动，选中态有紫色发光描边
- [ ] 两侧 AI 分数圆形图（Chart.js）渲染正确，颜色根据分数动态变化
- [ ] 深色/浅色主题切换无闪烁，图标正确切换
- [ ] 所有按钮 hover 状态有过渡效果
- [ ] Toast 通知样式符合规范（成功绿/错误红）

### 交互动效
- [ ] 拖拽文件进入面板时出现蓝色虚线边框 + 覆盖层提示
- [ ] `ondragleave` 排除子元素触发（使用 `relatedTarget` 检测）
- [ ] 文件拖放后自动解析文字并填入输入框，同步更新字数
- [ ] 点击「Humanize Now」按钮触发进度条动画（0→85%伪进度）
- [ ] 输出区流式打字机效果（每个token淡入，光标持续闪烁）
- [ ] 处理完成后 AI 分数圆形图动画（从0增长到实际分数，1.2秒）
- [ ] 改善幅度徽章从右侧滑入显示（opacity 0→1 + translateX 8px→0）
- [ ] 同义词面板点击词语时正确定位到词语旁边

### 响应式
- [ ] 768px 以下切换为单栏竖向布局
- [ ] 480px 以下按钮文字隐藏，只保留图标
- [ ] 模式选择器在移动端可横向滑动，不超出屏幕
- [ ] 历史记录抽屉在移动端全屏展开
- [ ] 侧边广告在 768px 以下隐藏（`display:none`）
