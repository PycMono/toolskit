<!-- color-tools-I-02_首页Landing_上传区.md -->

# Color Tools — 首页 Landing / 上传区 (I-02)

---

## 1. 竞品 UI 对标表

| UI 区域 | Coolors | HTMLColorCodes | Adobe Color | Paletton | **本次实现** | 差异化 |
|---------|---------|----------------|-------------|----------|:----------:|--------|
| **首页布局** | 单页滚动瀑布 | 分区独立交互 | Tab切换 | 单页色轮 | Hub网格+子工具独立页 | 双层架构 |
| **拾色器** | 基础HEX/RGB | 全屏渐变+3格式 | 色轮+滑杆 | 仅色轮 | 全屏光谱+10格式同步 | 独家OKLCH/LAB/HWB |
| **调色板展示** | 全宽5色竖条 | 无独立调色板 | 5色条+标签 | 5色扇形 | 全宽横条+拖拽+锁定+键盘 | 空格键+拖拽+URL分享 |
| **上传区** | 小按钮触发弹窗 | 小区域点击 | 拖拽区简洁 | 无 | 超大拖拽+彩虹边框+粘贴 | 3种输入+放大镜光标 |
| **选项控件** | 最少(锁定) | 滑杆H/S/L | 和谐下拉 | 模式选择 | 和谐+色彩空间+数量+阈值 | 丰富统一面板 |
| **导出** | PDF/PNG(Pro付费) | 无批量 | CC Library | 多格式 | 8种全免费 | 零付费墙 |
| **Dark Mode** | ❌ | ❌ | ✅ | ❌ | ✅自动+手动 | 全站自适应 |
| **移动端** | 竖条 | 响应式堆叠 | 受限 | 受限 | 全面响应式+触摸 | 针对触摸优化 |

---

## 2. 完整 HTML 模板结构

```html
{{ define "content" }}

<!-- ===== 顶部广告位 ===== -->
<section class="ad-banner ad-banner--top" id="adTop">
  {{- template "partials/ad_slot.html" dict
      "SlotID" "color-tools-top" "Size" "728x90" "Mobile" "320x50"
      "ClientID" .AdsClientID "Enabled" .AdsEnabled }}
</section>

<!-- ===== Hero 区 ===== -->
<section class="hero hero--color-tools" id="hero">
  <div class="hero__glow" aria-hidden="true"></div><!-- 彩虹微光 -->
  <div class="hero__content container">
    <div class="hero__badges">
      <span class="badge badge--primary"><svg width="14" height="14"><use href="#icon-shield"/></svg> {{ T .Lang "hero.badge.privacy" }}</span>
      <span class="badge badge--success"><svg width="14" height="14"><use href="#icon-zap"/></svg> {{ T .Lang "hero.badge.free" }}</span>
      <span class="badge badge--accent"><svg width="14" height="14"><use href="#icon-grid"/></svg> {{ T .Lang "hero.badge.tools" }}</span>
    </div>
    <h1 class="hero__title">{{ T .Lang "hero.title" }}</h1>
    <p class="hero__subtitle">{{ T .Lang "hero.subtitle" }}</p>
    <!-- 快速拾色器迷你版 -->
    <div class="hero__quick-picker" id="quickPicker">
      <div class="quick-picker__swatch" id="quickSwatch" style="background:#6366F1;"></div>
      <input type="text" class="quick-picker__input" id="quickHexInput" value="#6366F1" maxlength="7" onchange="handleQuickColorInput(this.value)">
      <button class="btn btn--sm btn--ghost" onclick="copyToClipboard(document.getElementById('quickHexInput').value)"><svg width="16" height="16"><use href="#icon-copy"/></svg></button>
      <button class="btn btn--sm btn--primary" onclick="generateRandomColor()"><svg width="16" height="16"><use href="#icon-shuffle"/></svg> Random</button>
    </div>
  </div>
</section>

<!-- ===== 工具导航网格 ===== -->
<section class="tools-grid container" id="toolsGrid">
  <div class="tools-grid__list">
    <!-- 12 个工具入口卡片 -->
    <a href="/color/picker" class="tool-tile" data-tool="picker">
      <div class="tool-tile__icon tool-tile__icon--picker"><svg width="32" height="32"><use href="#icon-eyedropper"/></svg></div>
      <h3 class="tool-tile__title">{{ T .Lang "nav.picker" }}</h3>
      <p class="tool-tile__desc">{{ T .Lang "picker.subtitle" }}</p>
    </a>
    <a href="/color/palette" class="tool-tile" data-tool="palette">
      <div class="tool-tile__icon tool-tile__icon--palette"><svg width="32" height="32"><use href="#icon-palette"/></svg></div>
      <h3 class="tool-tile__title">{{ T .Lang "nav.palette" }}</h3>
      <p class="tool-tile__desc">{{ T .Lang "palette.subtitle" }}</p>
      <span class="tool-tile__badge">Space ⌨️</span>
    </a>
    <a href="/color/wheel" class="tool-tile" data-tool="wheel">
      <div class="tool-tile__icon tool-tile__icon--wheel"><svg width="32" height="32"><use href="#icon-circle"/></svg></div>
      <h3 class="tool-tile__title">{{ T .Lang "nav.wheel" }}</h3>
      <p class="tool-tile__desc">{{ T .Lang "wheel.subtitle" }}</p>
    </a>
    <a href="/color/converter" class="tool-tile" data-tool="converter">
      <div class="tool-tile__icon tool-tile__icon--converter"><svg width="32" height="32"><use href="#icon-refresh"/></svg></div>
      <h3 class="tool-tile__title">{{ T .Lang "nav.converter" }}</h3>
      <p class="tool-tile__desc">{{ T .Lang "converter.subtitle" }}</p>
    </a>
    <a href="/color/contrast" class="tool-tile" data-tool="contrast">
      <div class="tool-tile__icon tool-tile__icon--contrast"><svg width="32" height="32"><use href="#icon-contrast"/></svg></div>
      <h3 class="tool-tile__title">{{ T .Lang "nav.contrast" }}</h3>
      <p class="tool-tile__desc">{{ T .Lang "contrast.subtitle" }}</p>
      <span class="tool-tile__badge tool-tile__badge--new">APCA</span>
    </a>
    <a href="/color/gradient" class="tool-tile" data-tool="gradient">
      <div class="tool-tile__icon tool-tile__icon--gradient"><svg width="32" height="32"><use href="#icon-gradient"/></svg></div>
      <h3 class="tool-tile__title">{{ T .Lang "nav.gradient" }}</h3>
      <p class="tool-tile__desc">{{ T .Lang "gradient.subtitle" }}</p>
      <span class="tool-tile__badge">OKLCH</span>
    </a>
    <a href="/color/image-picker" class="tool-tile" data-tool="image-picker">
      <div class="tool-tile__icon tool-tile__icon--image"><svg width="32" height="32"><use href="#icon-image"/></svg></div>
      <h3 class="tool-tile__title">{{ T .Lang "nav.imagePicker" }}</h3>
      <p class="tool-tile__desc">{{ T .Lang "imagepicker.subtitle" }}</p>
    </a>
    <a href="/color/blindness" class="tool-tile" data-tool="blindness">
      <div class="tool-tile__icon tool-tile__icon--blindness"><svg width="32" height="32"><use href="#icon-eye"/></svg></div>
      <h3 class="tool-tile__title">{{ T .Lang "nav.blindness" }}</h3>
      <p class="tool-tile__desc">{{ T .Lang "blindness.subtitle" }}</p>
    </a>
    <a href="/color/names" class="tool-tile" data-tool="names">
      <div class="tool-tile__icon tool-tile__icon--names"><svg width="32" height="32"><use href="#icon-tag"/></svg></div>
      <h3 class="tool-tile__title">{{ T .Lang "nav.names" }}</h3>
      <p class="tool-tile__desc">{{ T .Lang "names.subtitle" }}</p>
      <span class="tool-tile__badge">2000+</span>
    </a>
    <a href="/color/mixer" class="tool-tile" data-tool="mixer">
      <div class="tool-tile__icon tool-tile__icon--mixer"><svg width="32" height="32"><use href="#icon-droplets"/></svg></div>
      <h3 class="tool-tile__title">{{ T .Lang "nav.mixer" }}</h3>
      <p class="tool-tile__desc">{{ T .Lang "mixer.subtitle" }}</p>
    </a>
    <a href="/color/tailwind" class="tool-tile" data-tool="tailwind">
      <div class="tool-tile__icon tool-tile__icon--tailwind"><svg width="32" height="32"><use href="#icon-wind"/></svg></div>
      <h3 class="tool-tile__title">{{ T .Lang "nav.tailwind" }}</h3>
      <p class="tool-tile__desc">{{ T .Lang "tailwind.subtitle" }}</p>
    </a>
    <a href="/color/visualizer" class="tool-tile" data-tool="visualizer">
      <div class="tool-tile__icon tool-tile__icon--visualizer"><svg width="32" height="32"><use href="#icon-layout"/></svg></div>
      <h3 class="tool-tile__title">{{ T .Lang "nav.visualizer" }}</h3>
      <p class="tool-tile__desc">{{ T .Lang "visualizer.subtitle" }}</p>
    </a>
  </div>
</section>

<!-- ===== 内嵌式调色板快速生成器 ===== -->
<section class="palette-quick container" id="paletteQuick">
  <h2 class="section-title">{{ T .Lang "palette.title" }}</h2>
  <div class="palette-bar" id="paletteBar" role="application" aria-label="Palette generator">
    <!-- JS 动态填充 5 色块 -->
  </div>
  <div class="palette-bar__actions">
    <button class="btn btn--primary btn--lg" id="btnGenerate" onclick="generatePalette()">
      <svg width="18" height="18"><use href="#icon-shuffle"/></svg> {{ T .Lang "palette.generate" }} <kbd>Space</kbd>
    </button>
    <select class="select select--sm" id="harmonySelect" onchange="setHarmonyRule(this.value)">
      <option value="random">{{ T .Lang "palette.random" }}</option>
      <option value="complementary">{{ T .Lang "palette.complementary" }}</option>
      <option value="analogous">{{ T .Lang "palette.analogous" }}</option>
      <option value="triadic">{{ T .Lang "palette.triadic" }}</option>
      <option value="splitComplementary">{{ T .Lang "palette.splitComplementary" }}</option>
      <option value="square">{{ T .Lang "palette.square" }}</option>
      <option value="monochromatic">{{ T .Lang "palette.monochromatic" }}</option>
    </select>
    <button class="btn btn--ghost btn--sm" onclick="openExportModal()"><svg width="16" height="16"><use href="#icon-download"/></svg> {{ T .Lang "export.title" }}</button>
    <button class="btn btn--ghost btn--sm" onclick="sharePaletteUrl()"><svg width="16" height="16"><use href="#icon-share"/></svg> {{ T .Lang "palette.shareUrl" }}</button>
  </div>
</section>

<!-- ===== 图片取色上传区 ===== -->
<section class="image-upload container" id="imageUploadSection" style="display:none;">
  <div class="upload-zone upload-zone--rainbow" id="uploadZone"
       ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)" ondrop="handleDrop(event)">
    <div class="upload-zone__inner" id="uploadZoneInner">
      <div class="upload-zone__default" id="uploadDefault">
        <svg width="56" height="56"><use href="#icon-image-plus"/></svg>
        <p class="upload-zone__text">{{ T .Lang "imagepicker.upload" }}</p>
        <p class="upload-zone__hint">{{ T .Lang "imagepicker.paste" }}</p>
        <p class="upload-zone__formats">{{ T .Lang "imagepicker.supported" }}</p>
        <input type="file" id="fileInput" class="sr-only" accept="image/*" onchange="handleFileSelect(event)">
        <label for="fileInput" class="btn btn--primary btn--lg">{{ T .Lang "imagepicker.upload" }}</label>
      </div>
      <div class="upload-zone__hover" id="uploadHover" style="display:none;">
        <svg width="64" height="64"><use href="#icon-download-cloud"/></svg>
        <p>Drop your image here</p>
      </div>
    </div>
  </div>
  <div class="image-canvas-wrapper" id="imageCanvasWrapper" style="display:none;">
    <canvas id="imageCanvas" class="image-canvas"></canvas>
    <div class="image-canvas__loupe" id="colorLoupe" style="display:none;">
      <canvas id="loupeCanvas" width="100" height="100"></canvas>
      <span class="loupe__label" id="loupeLabel">#000000</span>
    </div>
  </div>
</section>

<!-- ===== 侧边广告位 ===== -->
<aside class="ad-sidebar" id="adSidebar">
  {{- template "partials/ad_slot.html" dict "SlotID" "color-tools-sidebar" "Size" "300x250" "MobileHide" true "ClientID" .AdsClientID "Enabled" .AdsEnabled }}
</aside>

<!-- ===== 三特性卡片 ===== -->
<section class="features container" id="features">
  <div class="features__grid">
    <div class="feature-card">
      <div class="feature-card__icon feature-card__icon--privacy"><svg width="28" height="28"><use href="#icon-shield"/></svg></div>
      <h3>{{ T .Lang "feature.privacy.title" }}</h3>
      <p>{{ T .Lang "feature.privacy.desc" }}</p>
    </div>
    <div class="feature-card">
      <div class="feature-card__icon feature-card__icon--speed"><svg width="28" height="28"><use href="#icon-zap"/></svg></div>
      <h3>{{ T .Lang "feature.speed.title" }}</h3>
      <p>{{ T .Lang "feature.speed.desc" }}</p>
    </div>
    <div class="feature-card">
      <div class="feature-card__icon feature-card__icon--free"><svg width="28" height="28"><use href="#icon-gift"/></svg></div>
      <h3>{{ T .Lang "feature.free.title" }}</h3>
      <p>{{ T .Lang "feature.free.desc" }}</p>
    </div>
  </div>
</section>

<!-- ===== FAQ ===== -->
<section class="faq container" id="faqSection">
  <h2 class="section-title">FAQ</h2>
  <div class="faq__list">
    {{ range $i, $item := .FAQ }}
    <details class="faq__item" {{ if eq $i 0 }}open{{ end }}>
      <summary class="faq__question"><span>{{ $item.q }}</span><svg class="faq__chevron" width="20" height="20"><use href="#icon-chevron-down"/></svg></summary>
      <div class="faq__answer"><p>{{ $item.a }}</p></div>
    </details>
    {{ end }}
  </div>
</section>

<!-- ===== 底部广告+Toast ===== -->
<section class="ad-banner ad-banner--bottom">
  {{- template "partials/ad_slot.html" dict "SlotID" "color-tools-bottom" "Size" "728x90" "Mobile" "320x50" "ClientID" .AdsClientID "Enabled" .AdsEnabled }}
</section>
<div class="toast-container" id="toastContainer" aria-live="polite"></div>

<!-- ===== 导出弹窗 ===== -->
<div class="modal" id="exportModal" style="display:none;" role="dialog" aria-modal="true">
  <div class="modal__overlay" onclick="closeExportModal()"></div>
  <div class="modal__content">
    <div class="modal__header"><h3>{{ T .Lang "export.title" }}</h3><button class="modal__close" onclick="closeExportModal()"><svg width="20" height="20"><use href="#icon-x"/></svg></button></div>
    <div class="modal__body"><div class="export-tabs" id="exportTabs"></div><div class="export-output" id="exportOutput"><pre><code id="exportCode"></code></pre></div></div>
    <div class="modal__footer">
      <button class="btn btn--ghost" onclick="closeExportModal()">{{ T .Lang "export.close" }}</button>
      <button class="btn btn--primary" onclick="copyExportCode()">{{ T .Lang "export.copyAll" }}</button>
      <button class="btn btn--primary" onclick="downloadExport()">{{ T .Lang "export.download" }}</button>
    </div>
  </div>
</div>

<!-- ===== 键盘快捷键浮层 ===== -->
<div class="keyboard-hints" id="keyboardHints" aria-hidden="true">
  <button class="keyboard-hints__toggle" onclick="toggleKeyboardHints()"><kbd>⌨</kbd></button>
  <div class="keyboard-hints__panel" id="keyboardPanel" style="display:none;">
    <p><kbd>Space</kbd> {{ T .Lang "keyboard.space" }}</p>
    <p><kbd>L</kbd> {{ T .Lang "keyboard.lock" }}</p>
    <p><kbd>←</kbd><kbd>→</kbd> {{ T .Lang "keyboard.left" }}</p>
    <p><kbd>C</kbd> {{ T .Lang "keyboard.copy" }}</p>
    <p><kbd>Del</kbd> {{ T .Lang "keyboard.delete" }}</p>
  </div>
</div>

{{ end }}
```

---

## 3. CSS 规范

### 3.1 CSS 变量

```css
:root {
  --color-primary: #6366F1;
  --color-primary-hover: #4F46E5;
  --color-primary-light: #EEF2FF;
  --color-success: #10B981;
  --color-success-light: #D1FAE5;
  --color-warning: #F59E0B;
  --color-warning-light: #FEF3C7;
  --color-error: #EF4444;
  --color-error-light: #FEE2E2;
  --color-bg: #FAFBFC;
  --color-bg-card: #FFFFFF;
  --color-border: #E2E8F0;
  --color-border-hover: #CBD5E1;
  --color-text: #0F172A;
  --color-text-secondary: #64748B;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04);
  --shadow-lg: 0 4px 6px rgba(0,0,0,0.05), 0 10px 40px rgba(0,0,0,0.08);
  --radius-sm: 6px; --radius-md: 10px; --radius-lg: 16px; --radius-full: 9999px;
  --transition-fast: 150ms ease; --transition-normal: 250ms ease;
  --font-sans: 'Plus Jakarta Sans','Noto Sans SC',system-ui,sans-serif;
  --font-mono: 'JetBrains Mono','Fira Code',monospace;
}
[data-theme="dark"] {
  --color-bg: #0F172A; --color-bg-card: #1E293B;
  --color-border: #334155; --color-text: #F1F5F9;
  --color-text-secondary: #94A3B8; --color-primary-light: #312E81;
}
```

### 3.2 关键样式规则

- **Hero 彩虹微光**：`.hero__glow` → `conic-gradient(from 0deg, #ef4444 0%,…#ef4444 100%)` + `opacity:.08` + `filter:blur(80px)` + 绝对定位铺满
- **工具网格**：`grid-template-columns: repeat(auto-fill, minmax(260px,1fr))`，悬停 `translateY(-4px)` + `shadow-lg`，逐卡片 `animation-delay: 50ms`
- **上传区**：`min-height:280px`，彩虹边框 `conic-gradient` 在 `background-image` + `background-origin:border-box`
- **调色板横条**：`flex` 等分，色块 `min-height:120px`（移动80px），悬停底部滑出 HEX+操作按钮
- **FAQ**：`<details>/<summary>` 原生，箭头旋转，`max-height` 过渡
- **断点**：Desktop `≥1024px` 3列 / Tablet `768-1023` 2列 / Mobile `<768` 单列

---

## 4. 验收标准 Checklist

### 视觉还原
- [ ] Hero彩虹微光背景正确渲染，Dark Mode下opacity自适应
- [ ] 12工具卡片均有独立渐变图标背景色
- [ ] 调色板横条HEX标签文字根据亮度自动黑/白
- [ ] Badge组样式：圆角+半透明背景+图标+文字
- [ ] 字体正确加载：Plus Jakarta Sans + Noto Sans SC
- [ ] Dark Mode所有CSS变量正确覆盖无遗漏

### 交互动效
- [ ] 工具卡片hover上浮4px+阴影增强+边框变色
- [ ] 调色板色块hover底部滑出信息面板
- [ ] FAQ展开折叠箭头旋转+内容淡入
- [ ] 上传区拖拽悬停态边框实线+背景叠色
- [ ] Toast右下滑入3s后自动消失
- [ ] 导出弹窗遮罩淡入+内容缩放弹出，ESC可关闭
- [ ] 键盘快捷键面板展开折叠

### 响应式
- [ ] Desktop 3列网格+侧边广告
- [ ] Tablet 2列+侧边广告隐藏
- [ ] Mobile 单列+调色板竖排+固定底部操作栏
- [ ] 触摸友好点击区域≥44px
