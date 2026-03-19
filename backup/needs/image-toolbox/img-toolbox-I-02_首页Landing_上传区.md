<!-- img-toolbox-I-02_首页Landing_上传区.md -->

# 图片处理工具箱 · 首页 Landing & 上传区

---

## 1. 竞品 UI 对标表

| UI 区域 | iLoveIMG | 本次实现 | 差异说明 |
|---------|----------|----------|----------|
| 页面头部 Hero | 大标题 + 副标题，橙红主色 | 大标题 + 副标题 + Badge 组（免费/无需上传/批量），橙色主色 #FF6B35 | 新增 Badge 信任强化 |
| 上传区大小 | 占页面 ~40% | 占页面 ~45%，最小高度 220px | 更大更突出 |
| 上传区拖拽反馈 | 虚线边框变色 | 虚线变实线 + 背景色变化 + scale 微缩放 + 图标抖动 | 多层反馈更生动 |
| 选项面板 | 工具按钮独立 | 内联折叠面板，选项紧跟上传区下方 | 减少页面跳转 |
| 处理按钮 | 独立 CTA 按钮 | 大橙色 CTA 按钮 + 键盘 Enter 快捷键支持 | 体验优化 |
| 结果区 | 简单列表 | 带缩略图的卡片列表 + 状态色条 + 节省率 badge | 视觉信息更丰富 |
| Before/After | ❌ 无 | ✅ 滑块对比弹窗 | **差异化亮点** |
| 特性卡片 | 3 图标卡片 | 3 大图标卡片（隐私/速度/免费），带渐变边框 | 更醒目 |
| FAQ | 手风琴 | 手风琴 + 平滑动效 | 相同但动效更流畅 |
| 移动端 | 响应式 | 全响应式，移动端上传区充满全宽，按钮全宽 | 移动体验强化 |

---

## 2. 完整 HTML 模板结构

> 以裁剪工具（`/img/crop`）为例，其他工具页面结构相同，仅选项面板区域不同。

```html
<!-- templates/img/crop.html -->
{{ template "base" . }}

{{ define "extraHead" }}
  <!-- AdSense SDK 条件加载 -->
  {{ if .AdsEnabled }}
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
    data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
  {{ end }}
  <!-- Cropper.js CSS -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.css">
  <!-- SEO head -->
  {{ template "seoHead" . }}
{{ end }}

{{ define "content" }}
<main class="tool-page" data-tool="img-toolbox-crop">

  <!-- ① 顶部横幅广告位 (728×90 / 移动 320×50) -->
  <div class="ad-banner ad-banner--top">
    {{ template "adSlot" dict "AdsEnabled" .AdsEnabled "SlotID" "img-toolbox-crop-top" "Format" "horizontal" }}
  </div>

  <!-- ② Hero 区 -->
  <section class="hero">
    <div class="container">
      <h1 class="hero__title">{{ t "hero.crop.title" }}</h1>
      <p class="hero__subtitle">{{ t "hero.crop.subtitle" }}</p>
      <div class="hero__badges">
        <span class="badge badge--green">✔ {{ t "hero.crop.badge1" }}</span>
        <span class="badge badge--blue">🔒 {{ t "hero.crop.badge2" }}</span>
        <span class="badge badge--orange">⚡ {{ t "hero.crop.badge3" }}</span>
      </div>
    </div>
  </section>

  <!-- ③ 超大拖拽上传区 -->
  <section class="upload-section container">
    <div
      id="uploadZone"
      class="upload-zone"
      ondragover="handleDragOver(event)"
      ondragleave="handleDragLeave(event)"
      ondrop="handleDrop(event)"
      onclick="document.getElementById('fileInput').click()"
      role="button"
      tabindex="0"
      aria-label="{{ t "upload.common.drag_hint" }}"
    >
      <!-- 默认态 -->
      <div class="upload-zone__idle" id="uploadIdle">
        <div class="upload-zone__icon">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <rect width="64" height="64" rx="16" fill="#FFF3ED"/>
            <path d="M32 20v16M24 28l8-8 8 8" stroke="#FF6B35" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M20 44h24" stroke="#FF6B35" stroke-width="2" stroke-linecap="round" opacity=".4"/>
          </svg>
        </div>
        <p class="upload-zone__text">
          {{ t "upload.common.drag_hint" }}
          <span class="upload-zone__browse">{{ t "upload.common.browse_btn" }}</span>
        </p>
        <p class="upload-zone__hint">{{ t "upload.common.support_hint" }}</p>
      </div>
      <!-- 拖拽悬停态（JS 切换 class） -->
      <div class="upload-zone__drop-active" id="uploadDropActive" hidden>
        <div class="upload-zone__drop-icon">📂</div>
        <p>{{ t "upload.common.drop_active" }}</p>
      </div>
      <input
        type="file"
        id="fileInput"
        multiple
        accept="image/*"
        style="display:none"
        onchange="addFiles(this.files)"
      >
    </div>
  </section>

  <!-- ④ 选项面板（裁剪工具专属） -->
  <section class="options-panel container" id="optionsPanel" hidden>
    <div class="options-panel__inner">
      <h2 class="options-panel__title">裁剪设置</h2>

      <!-- 裁剪模式选择 -->
      <div class="form-group">
        <label class="form-label">{{ t "options.crop.mode_label" }}</label>
        <div class="segmented-control" id="cropMode">
          <button class="seg-btn seg-btn--active" data-value="free"
            onclick="setCropMode('free')">{{ t "options.crop.mode_free" }}</button>
          <button class="seg-btn" data-value="ratio"
            onclick="setCropMode('ratio')">{{ t "options.crop.mode_ratio" }}</button>
          <button class="seg-btn" data-value="custom"
            onclick="setCropMode('custom')">{{ t "options.crop.mode_custom" }}</button>
        </div>
      </div>

      <!-- 固定比例选项（mode=ratio 时显示） -->
      <div class="form-group" id="ratioGroup" hidden>
        <label class="form-label">比例</label>
        <select id="cropRatio" class="form-select" onchange="gaTrackOptionChange('crop_ratio', this.value)">
          <option value="1/1">{{ t "options.crop.ratio_1_1" }}</option>
          <option value="4/3">{{ t "options.crop.ratio_4_3" }}</option>
          <option value="16/9">{{ t "options.crop.ratio_16_9" }}</option>
        </select>
      </div>

      <!-- 自定义像素输入（mode=custom 时显示） -->
      <div class="form-group form-group--row" id="customSizeGroup" hidden>
        <div class="form-field">
          <label class="form-label">{{ t "options.crop.width_label" }}</label>
          <input type="number" id="cropWidth" class="form-input" placeholder="e.g. 800" min="1"
            onchange="gaTrackOptionChange('crop_width', this.value)">
        </div>
        <span class="form-sep">×</span>
        <div class="form-field">
          <label class="form-label">{{ t "options.crop.height_label" }}</label>
          <input type="number" id="cropHeight" class="form-input" placeholder="e.g. 600" min="1"
            onchange="gaTrackOptionChange('crop_height', this.value)">
        </div>
      </div>

      <!-- Cropper.js 预览区（单文件时显示） -->
      <div class="crop-preview-wrap" id="cropPreviewWrap" hidden>
        <img id="cropPreviewImg" src="" alt="crop preview">
      </div>

      <!-- 开始处理按钮 -->
      <button
        id="processBtn"
        class="btn btn--primary btn--lg"
        onclick="startProcess()"
        disabled
      >
        开始裁剪
      </button>
    </div>
  </section>

  <!-- ⑤ 结果区占位 -->
  <section class="results-section container" id="resultsSection" hidden>
    <!-- 结果区标题 & 统计 -->
    <div class="results-header" id="resultsHeader">
      <h2 class="results-header__title">{{ t "result.common.header" }}</h2>
      <p class="results-header__summary" id="summaryStats"></p>
    </div>
    <!-- 结果卡片列表 -->
    <div class="results-list" id="resultsList" role="list"></div>
    <!-- 批量操作栏 -->
    <div class="results-actions" id="resultsActions">
      <button class="btn btn--primary" onclick="downloadAll()">
        {{ t "download.common.all_btn" }}
      </button>
      <button class="btn btn--ghost" onclick="clearAll()">
        {{ t "download.common.clear_btn" }}
      </button>
    </div>
  </section>

  <!-- ⑥ 侧边广告位（桌面端） -->
  <aside class="sidebar-ad" aria-hidden="true">
    {{ template "adSlot" dict "AdsEnabled" .AdsEnabled "SlotID" "img-toolbox-crop-sidebar" "Format" "rectangle" }}
  </aside>

  <!-- ⑦ 三特性卡片 -->
  <section class="features container">
    <div class="features__grid">
      <div class="feature-card">
        <div class="feature-card__icon">🔒</div>
        <h3 class="feature-card__title">{{ t "feature.common.privacy_title" }}</h3>
        <p class="feature-card__desc">{{ t "feature.common.privacy_desc" }}</p>
      </div>
      <div class="feature-card">
        <div class="feature-card__icon">⚡</div>
        <h3 class="feature-card__title">{{ t "feature.common.speed_title" }}</h3>
        <p class="feature-card__desc">{{ t "feature.common.speed_desc" }}</p>
      </div>
      <div class="feature-card">
        <div class="feature-card__icon">🎁</div>
        <h3 class="feature-card__title">{{ t "feature.common.free_title" }}</h3>
        <p class="feature-card__desc">{{ t "feature.common.free_desc" }}</p>
      </div>
    </div>
  </section>

  <!-- ⑧ FAQ 手风琴 -->
  <section class="faq-section container">
    <h2 class="faq-section__title">常见问题</h2>
    <div class="faq-list" id="faqList">
      {{ range $i, $faq := .FAQs }}
      <div class="faq-item" id="faq-{{ $i }}">
        <button
          class="faq-item__question"
          onclick="toggleFAQ({{ $i }})"
          aria-expanded="false"
          aria-controls="faq-answer-{{ $i }}"
        >
          {{ $faq.Question }}
          <span class="faq-item__arrow">▾</span>
        </button>
        <div class="faq-item__answer" id="faq-answer-{{ $i }}" hidden>
          <p>{{ $faq.Answer }}</p>
        </div>
      </div>
      {{ end }}
    </div>
  </section>

  <!-- ⑨ 底部广告位 -->
  <div class="ad-banner ad-banner--bottom container">
    {{ template "adSlot" dict "AdsEnabled" .AdsEnabled "SlotID" "img-toolbox-crop-bottom" "Format" "horizontal" }}
  </div>

  <!-- ⑩ Toast 容器 -->
  <div class="toast-container" id="toastContainer" aria-live="polite"></div>

  <!-- Before/After 弹窗（初始隐藏，JS 动态填充） -->
  <div class="modal-overlay" id="previewModal" hidden onclick="closePreview(event)">
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modal__header">
        <span class="modal__title">原图 vs 处理后</span>
        <button class="modal__close" onclick="closePreview()">&times;</button>
      </div>
      <div class="modal__size-labels">
        <span id="beforeSizeLabel"></span>
        <span id="afterSizeLabel"></span>
      </div>
      <div class="modal__compare" id="compareArea">
        <div class="compare__before-wrap" id="beforeWrap">
          <img id="beforeImg" src="" alt="原图">
          <span class="compare__label compare__label--before">原图</span>
        </div>
        <div class="compare__after-wrap">
          <img id="afterImg" src="" alt="处理后">
          <span class="compare__label compare__label--after">处理后</span>
        </div>
        <div class="compare__divider" id="compareDivider"></div>
      </div>
      <div class="modal__actions">
        <button class="btn btn--primary" id="modalDownloadBtn">下载处理后</button>
      </div>
    </div>
  </div>

</main>
{{ end }}

{{ define "extraScript" }}
<!-- Cropper.js -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.js"></script>
<!-- JSZip -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
<!-- 工具主逻辑 -->
<script src="/static/js/img-crop.js"></script>
<!-- GA 事件追踪 -->
<script>
  const TOOL = 'img-toolbox-crop';
  // ... GA 事件函数（详见 I-01）
</script>
{{ end }}
```

---

## 3. CSS 规范

### CSS 变量定义

```css
/* static/css/variables.css */
:root {
  /* 主色系 */
  --color-primary:        #FF6B35;
  --color-primary-light:  #FF8C5A;
  --color-primary-dark:   #E55A26;
  --color-primary-bg:     rgba(255, 107, 53, 0.06);

  /* 中性色 */
  --color-bg:             #F9FAFB;
  --color-surface:        #FFFFFF;
  --color-border:         #E5E7EB;
  --color-border-active:  #FF6B35;
  --color-text-primary:   #111827;
  --color-text-secondary: #6B7280;
  --color-text-placeholder: #9CA3AF;

  /* 状态色 */
  --color-success:        #10B981;
  --color-error:          #EF4444;
  --color-warning:        #F59E0B;
  --color-info:           #3B82F6;

  /* 阴影 */
  --shadow-sm:    0 1px 2px rgba(0,0,0,.05);
  --shadow-card:  0 1px 3px rgba(0,0,0,.08), 0 4px 12px rgba(0,0,0,.05);
  --shadow-modal: 0 20px 60px rgba(0,0,0,.15);

  /* 圆角 */
  --radius-xl:  20px;
  --radius-lg:  16px;
  --radius-md:  10px;
  --radius-sm:   6px;
  --radius-xs:   4px;

  /* 间距 */
  --space-xs:   4px;
  --space-sm:   8px;
  --space-md:  16px;
  --space-lg:  24px;
  --space-xl:  40px;

  /* 动效 */
  --transition-fast:  0.15s ease;
  --transition-base:  0.25s ease;
  --transition-slow:  0.4s ease;
}
```

### 关键模块样式规则

**Hero 区**
```css
.hero { padding: 48px 0 32px; text-align: center; background: var(--color-surface); }
.hero__title { font-size: clamp(28px, 5vw, 48px); font-weight: 800; color: var(--color-text-primary); }
.hero__subtitle { font-size: 18px; color: var(--color-text-secondary); margin-top: 12px; max-width: 560px; margin-inline: auto; }
.hero__badges { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-top: 20px; }
.badge { padding: 4px 12px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 500; }
.badge--green  { background: #DCFCE7; color: #166534; }
.badge--blue   { background: #DBEAFE; color: #1E40AF; }
.badge--orange { background: #FFF3ED; color: #C2410C; }
```

**上传区**
```css
.upload-zone {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  min-height: 220px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: border-color var(--transition-base), background var(--transition-base), transform var(--transition-base);
  user-select: none;
}
/* 拖拽悬停态 */
.upload-zone--drag-over {
  border-color: var(--color-primary);
  border-style: solid;
  background: var(--color-primary-bg);
  transform: scale(1.01);
}
.upload-zone--drag-over .upload-zone__icon { animation: shake 0.4s ease; }
@keyframes shake {
  0%,100% { transform: translateY(0); }
  25% { transform: translateY(-4px); }
  75% { transform: translateY(4px); }
}
.upload-zone__browse { color: var(--color-primary); font-weight: 600; text-decoration: underline; }
.upload-zone__hint { font-size: 13px; color: var(--color-text-placeholder); margin-top: 8px; }
```

**选项面板**
```css
.options-panel { margin-top: 24px; }
.options-panel__inner {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
}
.segmented-control { display: flex; border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; }
.seg-btn { flex: 1; padding: 8px 16px; border: none; background: transparent; cursor: pointer; font-size: 14px; transition: background var(--transition-fast); }
.seg-btn--active { background: var(--color-primary); color: #fff; font-weight: 600; }
```

**CTA 按钮**
```css
.btn--primary {
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast);
  box-shadow: 0 4px 14px rgba(255,107,53,.35);
}
.btn--primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(255,107,53,.45);
}
.btn--primary:disabled { opacity: .5; cursor: not-allowed; transform: none; box-shadow: none; }
.btn--lg { width: 100%; margin-top: var(--space-lg); }
```

**特性卡片**
```css
.features__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-lg); margin-top: var(--space-xl); }
.feature-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  text-align: center;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
  position: relative;
  overflow: hidden;
}
.feature-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
}
.feature-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-card); }
.feature-card__icon { font-size: 40px; margin-bottom: 12px; }
```

**FAQ 手风琴**
```css
.faq-item { border-bottom: 1px solid var(--color-border); }
.faq-item__question {
  width: 100%; background: none; border: none; text-align: left;
  padding: 16px 0; font-size: 15px; font-weight: 600; cursor: pointer;
  display: flex; justify-content: space-between; align-items: center;
  color: var(--color-text-primary);
}
.faq-item__arrow { transition: transform var(--transition-base); }
.faq-item--open .faq-item__arrow { transform: rotate(180deg); }
.faq-item__answer { overflow: hidden; max-height: 0; transition: max-height var(--transition-slow); }
.faq-item__answer p { padding: 0 0 16px; color: var(--color-text-secondary); line-height: 1.7; }
.faq-item--open .faq-item__answer { max-height: 300px; }
```

**响应式断点**
```css
/* 平板：768px */
@media (max-width: 768px) {
  .features__grid { grid-template-columns: 1fr; gap: var(--space-md); }
  .sidebar-ad { display: none; }
  .hero__title { font-size: 28px; }
  .upload-zone { min-height: 180px; }
}
/* 手机：480px */
@media (max-width: 480px) {
  .container { padding-inline: var(--space-md); }
  .btn--lg { padding: 14px var(--space-md); }
  .hero__badges { gap: 6px; }
  .badge { font-size: 12px; padding: 3px 10px; }
}
```

---

## 4. 验收标准 Checklist

### 视觉还原

- [ ] Hero 区大标题字号 clamp(28px, 5vw, 48px)，字重 800
- [ ] 三个 Badge 颜色分别为绿/蓝/橙，与设计规范一致
- [ ] 上传区默认态虚线边框 `#E5E7EB`，最小高度 220px
- [ ] 主色按钮 `#FF6B35`，带橙色阴影 `rgba(255,107,53,.35)`
- [ ] 特性卡片顶部渐变色条正确显示
- [ ] FAQ 箭头旋转方向正确（展开时旋转 180°）
- [ ] 广告位在 `AdsEnabled=false` 时显示灰色占位块，无报错
- [ ] 各工具选项面板内容与工具功能匹配

### 交互动效

- [ ] 拖拽文件到上传区时，边框变橙色实线，背景出现浅橙遮罩，上传区 scale(1.01)
- [ ] 上传区图标拖拽时触发 shake 动画（0.4s）
- [ ] 拖拽离开（非子元素触发）时，上传区恢复默认态
- [ ] 处理按钮在无文件时 disabled，有文件时 enabled
- [ ] 选项面板中切换裁剪模式，对应选项组显示/隐藏正常
- [ ] FAQ 手风琴展开/收起平滑动效（max-height 过渡）
- [ ] Toast 提示从底部淡入，3 秒后淡出消失
- [ ] 按钮 hover 时上移 1px，阴影加深

### 响应式

- [ ] 768px 以下，三特性卡片切换为单列布局
- [ ] 768px 以下，侧边广告位隐藏
- [ ] 480px 以下，Hero 标题字号不小于 26px
- [ ] 480px 以下，所有按钮全宽显示
- [ ] 移动端上传区点击触发系统文件选择器
- [ ] 移动端拖拽区域支持 touch 事件
- [ ] 各分辨率下页面横向无滚动条
