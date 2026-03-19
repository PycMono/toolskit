# Developer Tools Suite — I-02 首页 Landing & 输入区

---

## 1. 竞品 UI 对标表

| UI 区域 | md5hashgenerator.com | base64encode.org | urlencoder.org | wordcounter.net | **本次实现** |
|--------|---------------------|-----------------|---------------|----------------|------------|
| 整体布局 | 单栏，极简 | 单栏，选项多 | 单栏 | 全屏编辑器 | **双栏 Split-Panel，左输入右结果** |
| 输入区域 | 普通 textarea | 普通 textarea | 普通 textarea | 全屏 contenteditable | **代码编辑器风格 + 行号 + 等宽字体** |
| 实时计算 | ❌ 按钮触发 | ❌ 按钮触发 | ❌ 按钮触发 | ✅ 实时 | **✅ 全部实时，300ms 防抖** |
| 多算法同屏 | ❌ 只有 MD5 | ❌ | ❌ | ❌ | **✅ Hash 工具 5 个算法卡片并排** |
| 文件输入 | ❌ | ✅（服务端） | ❌ | ❌ | **✅ 纯客户端 FileReader/ReadableStream** |
| 选项控件 | ❌ | 多选项 | 少量 | 大量 | **标签式 Tab 收折，不占主区空间** |
| 地图组件 | ❌ | ❌ | ❌ | ❌ | **✅ IP 工具内嵌 Leaflet 地图** |
| 暗黑模式 | ❌ | ❌ | ❌ | ❌ | **✅ 系统跟随 + 手动切换** |
| 移动适配 | 基础 | 基础 | 基础 | ✅ | **✅ 移动端单栏垂直布局** |
| 复制交互 | ❌ | ✅ | ✅ | ❌ | **✅ 逐行复制 + 全部复制 + 飞入动效** |

---

## 2. 页面 HTML 骨架（以 /dev/hash 为完整示例）

```html
{{/* templates/dev/hash.html */}}
{{ template "base.html" . }}

{{ define "content" }}

{{/* ① 顶部广告位 */}}
{{- template "partials/ad_slot.html" dict
    "SlotID" "dev-hash-top" "Size" "728x90" "Mobile" "320x50"
    "ClientID" .AdsClientID "Enabled" .AdsEnabled }}

<!-- ═══════════════════════════════════════
     HERO SECTION
═══════════════════════════════════════ -->
<section class="hero hero--dev" aria-labelledby="hero-title">
  <div class="hero__inner container">
    <h1 class="hero__title" id="hero-title">{{ t "hero.hash.title" }}</h1>
    <p class="hero__subtitle">{{ t "hero.hash.subtitle" }}</p>
    <div class="hero__badges" role="list">
      <span class="badge badge--blue"   role="listitem">{{ t "hero.hash.badge1" }}</span>
      <span class="badge badge--green"  role="listitem">{{ t "hero.hash.badge2" }}</span>
      <span class="badge badge--purple" role="listitem">{{ t "hero.hash.badge3" }}</span>
    </div>
  </div>
</section>

<!-- ═══════════════════════════════════════
     MAIN TOOL — Split-Panel Layout
═══════════════════════════════════════ -->
<main class="tool-wrapper container" id="tool-main">
  <div class="split-panel" role="application" aria-label="{{ t "hero.hash.title" }}">

    <!-- ─── LEFT: 输入区 ─── -->
    <div class="split-panel__input" id="panel-input">

      <!-- 文本输入 -->
      <div class="input-section">
        <label class="input-label" for="hashInput">{{ t "input.hash.placeholder" }}</label>
        <div class="code-editor-wrap">
          <div class="line-numbers" id="lineNumbers" aria-hidden="true"></div>
          <textarea
            id="hashInput"
            class="code-editor"
            placeholder="{{ t "input.hash.placeholder" }}"
            rows="10"
            spellcheck="false"
            autocomplete="off"
            autocorrect="off"
            oninput="DevHash.onInputChange()"
            aria-label="{{ t "input.hash.placeholder" }}"
          ></textarea>
        </div>
        <div class="input-footer">
          <span id="inputCharCount" class="char-count">0 chars</span>
          <button class="btn btn--ghost btn--sm" onclick="DevHash.clearInput()" type="button">Clear</button>
        </div>
      </div>

      <!-- 文件上传区 -->
      <div class="drop-zone" id="dropZone" role="button" tabindex="0"
           aria-label="{{ t "input.hash.file_label" }}"
           ondragover="DevHash.onDragOver(event)"
           ondragleave="DevHash.onDragLeave(event)"
           ondrop="DevHash.onDrop(event)"
           onclick="document.getElementById('fileInput').click()"
           onkeydown="if(event.key==='Enter'||event.key===' ')document.getElementById('fileInput').click()">
        <input type="file" id="fileInput" class="sr-only" multiple
               onchange="DevHash.onFileSelect(event)"
               aria-label="{{ t "input.hash.file_label" }}">
        <div class="drop-zone__idle">
          <svg class="drop-zone__icon" width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M20 8v16M12 16l8-8 8 8" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round"/>
            <rect x="4" y="28" width="32" height="8" rx="4" fill="var(--color-primary-light)"/>
          </svg>
          <p class="drop-zone__text">{{ t "input.hash.file_label" }}</p>
          <p class="drop-zone__hint">Any file type · Max 2GB</p>
        </div>
        <div class="drop-zone__hover" style="display:none">
          <p>Release to hash file</p>
        </div>
      </div>

      <!-- 选项面板 -->
      <div class="options-panel" id="optionsPanel">
        <button class="options-toggle" onclick="DevHash.toggleOptions()" type="button"
                aria-expanded="false" aria-controls="optionsBody">
          <svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="3" stroke="currentColor" fill="none"/></svg>
          Options
          <svg class="chevron" width="12" height="12" viewBox="0 0 12 12">
            <path d="M2 4l4 4 4-4" stroke="currentColor" fill="none"/>
          </svg>
        </button>
        <div class="options-body" id="optionsBody" hidden>
          <label class="option-row">
            <input type="checkbox" id="optUppercase" onchange="DevHash.onOptionsChange()">
            <span>{{ t "options.hash.uppercase" }}</span>
          </label>
          <label class="option-row">
            <input type="checkbox" id="optHMAC" onchange="DevHash.toggleHMAC()">
            <span>{{ t "options.hash.hmac_mode" }}</span>
          </label>
          <div id="hmacKeySection" class="option-sub" hidden>
            <label class="input-label" for="hmacKey">{{ t "input.hash.hmac_key" }}</label>
            <input type="text" id="hmacKey" class="text-input text-input--sm"
                   placeholder="{{ t "input.hash.hmac_placeholder" }}"
                   oninput="DevHash.onInputChange()">
          </div>
        </div>
      </div>

    </div><!-- /panel-input -->

    <!-- ─── RIGHT: 结果区 ─── -->
    <div class="split-panel__result" id="panel-result">

      <div class="result-status" id="resultStatus" aria-live="polite">
        <span class="status-dot status-dot--idle" id="statusDot"></span>
        <span id="statusText">Waiting for input…</span>
      </div>

      <!-- Hash 算法卡片列表 -->
      <div class="hash-cards" id="hashCards" role="list">

        <div class="hash-card" id="card-md5" role="listitem" data-algo="md5">
          <div class="hash-card__header">
            <span class="hash-card__label">MD5</span>
            <span class="hash-card__bits">128-bit</span>
            <span class="hash-card__warn" title="Not collision-resistant">⚠️</span>
          </div>
          <code id="val-md5" class="hash-value" aria-label="MD5 hash value">—</code>
          <button class="btn btn--icon" onclick="DevHash.copy('md5')" type="button"
                  aria-label="{{ t "result.hash.copy" }} MD5" data-tooltip="{{ t "result.hash.copy" }}">
            <svg width="16" height="16" viewBox="0 0 16 16"><rect x="5" y="5" width="9" height="9" rx="1" stroke="currentColor" fill="none"/><path d="M3 11V3h8" stroke="currentColor" fill="none"/></svg>
          </button>
        </div>

        <div class="hash-card" id="card-sha1" role="listitem" data-algo="sha1">
          <div class="hash-card__header">
            <span class="hash-card__label">SHA-1</span>
            <span class="hash-card__bits">160-bit</span>
            <span class="hash-card__warn" title="Deprecated for signatures">⚠️</span>
          </div>
          <code id="val-sha1" class="hash-value">—</code>
          <button class="btn btn--icon" onclick="DevHash.copy('sha1')" type="button"
                  aria-label="{{ t "result.hash.copy" }} SHA-1">
            <svg width="16" height="16" viewBox="0 0 16 16"><rect x="5" y="5" width="9" height="9" rx="1" stroke="currentColor" fill="none"/><path d="M3 11V3h8" stroke="currentColor" fill="none"/></svg>
          </button>
        </div>

        <div class="hash-card hash-card--featured" id="card-sha256" role="listitem" data-algo="sha256">
          <div class="hash-card__header">
            <span class="hash-card__label">SHA-256</span>
            <span class="hash-card__bits">256-bit</span>
            <span class="hash-card__recommended">✅ Recommended</span>
          </div>
          <code id="val-sha256" class="hash-value">—</code>
          <button class="btn btn--icon" onclick="DevHash.copy('sha256')" type="button"
                  aria-label="{{ t "result.hash.copy" }} SHA-256">
            <svg width="16" height="16" viewBox="0 0 16 16"><rect x="5" y="5" width="9" height="9" rx="1" stroke="currentColor" fill="none"/><path d="M3 11V3h8" stroke="currentColor" fill="none"/></svg>
          </button>
        </div>

        <div class="hash-card" id="card-sha512" role="listitem" data-algo="sha512">
          <div class="hash-card__header">
            <span class="hash-card__label">SHA-512</span>
            <span class="hash-card__bits">512-bit</span>
          </div>
          <code id="val-sha512" class="hash-value">—</code>
          <button class="btn btn--icon" onclick="DevHash.copy('sha512')" type="button"
                  aria-label="{{ t "result.hash.copy" }} SHA-512">
            <svg width="16" height="16" viewBox="0 0 16 16"><rect x="5" y="5" width="9" height="9" rx="1" stroke="currentColor" fill="none"/><path d="M3 11V3h8" stroke="currentColor" fill="none"/></svg>
          </button>
        </div>

        <div class="hash-card hash-card--hmac" id="card-hmac" role="listitem" data-algo="hmac" hidden>
          <div class="hash-card__header">
            <span class="hash-card__label">HMAC-SHA256</span>
            <span class="hash-card__bits">256-bit</span>
          </div>
          <code id="val-hmac" class="hash-value">—</code>
          <button class="btn btn--icon" onclick="DevHash.copy('hmac')" type="button"
                  aria-label="{{ t "result.hash.copy" }} HMAC">
            <svg width="16" height="16" viewBox="0 0 16 16"><rect x="5" y="5" width="9" height="9" rx="1" stroke="currentColor" fill="none"/><path d="M3 11V3h8" stroke="currentColor" fill="none"/></svg>
          </button>
        </div>

      </div><!-- /hashCards -->

      <div class="result-actions">
        <button class="btn btn--primary" onclick="DevHash.copyAll()" type="button">Copy All</button>
        <button class="btn btn--secondary" onclick="DevHash.downloadAll()" type="button">Download .txt</button>
      </div>

    </div><!-- /panel-result -->

  </div><!-- /split-panel -->

  <!-- 侧边广告（移动端 display:none） -->
  {{- template "partials/ad_slot.html" dict
      "SlotID" "dev-hash-sidebar" "Size" "300x250"
      "MobileHide" true "ClientID" .AdsClientID "Enabled" .AdsEnabled }}

</main>

<!-- ═══════════════════════════════════════
     FEATURE CARDS
═══════════════════════════════════════ -->
<section class="features container" aria-label="Key features">
  <div class="features__grid">
    <div class="feature-card">
      <div class="feature-card__icon">🛡️</div>
      <h3>{{ t "feature.privacy.title" }}</h3>
      <p>{{ t "feature.privacy.desc" }}</p>
    </div>
    <div class="feature-card">
      <div class="feature-card__icon">⚡</div>
      <h3>{{ t "feature.speed.title" }}</h3>
      <p>{{ t "feature.speed.desc" }}</p>
    </div>
    <div class="feature-card">
      <div class="feature-card__icon">🆓</div>
      <h3>{{ t "feature.free.title" }}</h3>
      <p>{{ t "feature.free.desc" }}</p>
    </div>
  </div>
</section>

<!-- ═══════════════════════════════════════
     FAQ
═══════════════════════════════════════ -->
<section class="faq container" aria-label="Frequently Asked Questions">
  <h2 class="section-title">FAQ</h2>
  <div class="faq-list" id="faqList">
    {{ range $i, $faq := .FAQs }}
    <div class="faq-item" id="faq-{{ $i }}">
      <button class="faq-question" type="button"
              aria-expanded="false"
              aria-controls="faq-answer-{{ $i }}"
              onclick="toggleFAQ({{ $i }})">
        {{ $faq.Q }}
        <svg class="faq-chevron" width="16" height="16" viewBox="0 0 16 16">
          <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none"/>
        </svg>
      </button>
      <div class="faq-answer" id="faq-answer-{{ $i }}" hidden>
        <p>{{ $faq.A }}</p>
      </div>
    </div>
    {{ end }}
  </div>
</section>

<!-- 底部广告 + Toast 容器 -->
{{- template "partials/ad_slot.html" dict
    "SlotID" "dev-hash-bottom" "Size" "728x90" "Mobile" "320x50"
    "ClientID" .AdsClientID "Enabled" .AdsEnabled }}

<div id="toastContainer" class="toast-container" aria-live="assertive" aria-atomic="true"></div>

{{ end }}
```

---

## 3. CSS 规范

### 3.1 CSS 变量定义

```css
/* static/css/dev-tools.css */
:root {
  /* ── 主色系 ── */
  --color-primary:         #2563EB;
  --color-primary-dark:    #1D4ED8;
  --color-primary-light:   #DBEAFE;
  --color-secondary:       #7C3AED;
  --color-secondary-light: #EDE9FE;

  /* ── 中性色 ── */
  --color-bg:              #F8FAFC;
  --color-surface:         #FFFFFF;
  --color-surface-alt:     #F1F5F9;
  --color-border:          #E2E8F0;
  --color-border-focus:    #93C5FD;
  --color-text-primary:    #0F172A;
  --color-text-secondary:  #64748B;
  --color-text-muted:      #94A3B8;

  /* ── 语义色 ── */
  --color-success:         #10B981;
  --color-success-light:   #D1FAE5;
  --color-warning:         #F59E0B;
  --color-error:           #EF4444;
  --color-error-light:     #FEE2E2;

  /* ── Hash 算法色 ── */
  --color-algo-md5:        #F59E0B;
  --color-algo-sha1:       #F97316;
  --color-algo-sha256:     #10B981;
  --color-algo-sha512:     #2563EB;
  --color-algo-hmac:       #7C3AED;

  /* ── 阴影 ── */
  --shadow-sm:  0 1px 2px 0 rgb(0 0 0 / .05);
  --shadow-md:  0 4px 6px -1px rgb(0 0 0 / .1), 0 2px 4px -2px rgb(0 0 0 / .1);
  --shadow-lg:  0 10px 15px -3px rgb(0 0 0 / .1), 0 4px 6px -4px rgb(0 0 0 / .1);
  --shadow-focus: 0 0 0 3px var(--color-border-focus);

  /* ── 圆角 ── */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-full: 9999px;

  /* ── 过渡 ── */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 400ms cubic-bezier(0.4, 0, 0.2, 1);

  /* ── 间距 ── */
  --space-xs:  4px;
  --space-sm:  8px;
  --space-md:  16px;
  --space-lg:  24px;
  --space-xl:  32px;
  --space-2xl: 48px;
}

[data-theme="dark"] {
  --color-bg:             #0F172A;
  --color-surface:        #1E293B;
  --color-surface-alt:    #334155;
  --color-border:         #334155;
  --color-border-focus:   #3B82F6;
  --color-text-primary:   #F1F5F9;
  --color-text-secondary: #94A3B8;
  --color-text-muted:     #64748B;
}
```

### 3.2 关键模块样式规则

#### Split-Panel 布局
```css
.split-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-lg);
  align-items: start;
}
@media (max-width: 768px) {
  .split-panel { grid-template-columns: 1fr; }
}
```

#### 代码编辑器输入框
```css
.code-editor-wrap {
  display: flex;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.code-editor-wrap:focus-within {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
}
.code-editor {
  flex: 1;
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.6;
  background: var(--color-surface);
  color: var(--color-text-primary);
  padding: var(--space-md);
  resize: vertical;
  border: none;
  outline: none;
}
.line-numbers {
  width: 40px;
  background: var(--color-surface-alt);
  border-right: 1px solid var(--color-border);
  padding: var(--space-md) var(--space-sm);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--color-text-muted);
  text-align: right;
  user-select: none;
  line-height: 1.6;
}
```

#### 拖放区域状态
```css
.drop-zone {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-base);
  background: var(--color-surface-alt);
}
.drop-zone:hover,
.drop-zone--hover {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  transform: scale(1.01);
}
.drop-zone--hover .drop-zone__idle  { display: none; }
.drop-zone--hover .drop-zone__hover { display: block; }
```

#### Hash 算法卡片
```css
.hash-card {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--color-algo-md5);
  margin-bottom: var(--space-sm);
  transition: box-shadow var(--transition-fast);
  animation: cardEnter 200ms ease-out;
}
.hash-card[data-algo="sha1"]   { border-left-color: var(--color-algo-sha1); }
.hash-card[data-algo="sha256"] { border-left-color: var(--color-algo-sha256); }
.hash-card[data-algo="sha512"] { border-left-color: var(--color-algo-sha512); }
.hash-card[data-algo="hmac"]   { border-left-color: var(--color-algo-hmac); }
.hash-card--featured {
  background: var(--color-success-light);
  border-color: var(--color-success);
}
.hash-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  word-break: break-all;
  color: var(--color-text-primary);
  background: var(--color-surface-alt);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
}
@keyframes cardEnter {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

#### Toast 容器
```css
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  pointer-events: none;
}
.toast {
  background: var(--color-text-primary);
  color: #fff;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  font-size: 14px;
  pointer-events: auto;
  animation: toastIn 300ms ease-out, toastOut 300ms ease-in 2700ms forwards;
}
.toast--success { background: var(--color-success); }
.toast--error   { background: var(--color-error); }
@keyframes toastIn  { from { opacity:0; transform:translateX(60px) } to { opacity:1; transform:translateX(0) } }
@keyframes toastOut { from { opacity:1 } to { opacity:0; transform:translateX(60px) } }
```

### 3.3 响应式断点

| 断点 | 宽度 | 变化 |
|------|------|------|
| Desktop | ≥ 1280px | 双栏 + 侧边广告 |
| Tablet | 768–1279px | 双栏，侧边广告隐藏 |
| Mobile | < 768px | 单栏，顶部广告 320×50 |

---

## 4. 验收标准 Checklist

### 视觉还原
- [ ] Split-Panel 左右等宽，分隔线用 1px border
- [ ] 代码编辑器 textarea 使用 JetBrains Mono 字体
- [ ] 行号区域宽度固定 40px，与 textarea 左对齐
- [ ] Hash 卡片左侧彩色边框对应算法色变量
- [ ] SHA-256 卡片背景为浅绿，突出"推荐"状态
- [ ] 拖放区虚线边框 2px dashed，hover 变实色
- [ ] 三特性卡片三列布局，移动端单列
- [ ] FAQ 手风琴折叠时 chevron 旋转 180°
- [ ] 暗黑模式下 surface 色为 #1E293B，border 为 #334155

### 交互动效
- [ ] 输入文字后 300ms 防抖触发实时计算
- [ ] 复制成功后按钮显示"Copied!"持续 1.5s 后恢复
- [ ] 复制成功 Toast 从右侧飞入，3s 后飞出
- [ ] 拖放文件进入区域时边框变蓝、scale(1.01) 放大
- [ ] Hash 卡片首次出现时有 cardEnter 动画（translateY 8px → 0）
- [ ] 选项面板展开/收折有 max-height 过渡动效
- [ ] HMAC 密钥输入区 hidden → 显示时 fadeIn 动效

### 响应式
- [ ] 移动端（< 768px）Split-Panel 变为单列垂直堆叠
- [ ] 移动端 textarea 行高与字体不被系统缩放影响
- [ ] 侧边广告在 < 1024px 时 display:none
- [ ] 顶部/底部广告在移动端切换为 320×50
- [ ] FAQ 在移动端点击区域足够大（min-height: 48px）
