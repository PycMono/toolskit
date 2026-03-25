# cookie-consent-I-02_Banner_UI_模板.md

---

## 1. 竞品 UI 对标表

| UI 区域 | Cookiebot | CookieYes | 本次实现 | 差异化 |
|---|---|---|---|---|
| 横幅位置 | 底部固定 | 底部/顶部 | 底部固定滑入 | 动效更流畅 |
| 按钮数量 | 2～3 个 | 2～3 个 | 3 个（拒绝/自定义/接受） | GDPR 同等易用性 |
| 接受按钮样式 | 品牌色填充 | 品牌色填充 | 主色填充高亮 | 视觉引导合规 |
| 自定义 Modal | 独立弹窗 | 独立弹窗 | Toggle Switch 风格 | 现代感更强 |
| 必要 Cookie | 锁定不可改 | 锁定不可改 | 锁定 + 禁用态明显 | 合规且清晰 |
| 品牌水印 | 有（付费去除） | 有（付费去除） | 无 | 完全自主 |
| 深色模式 | 有限 | 无 | CSS 变量自适应 | 跟随系统 |
| 移动端 | 全宽固定 | 全宽固定 | 全宽 + 竖向按钮堆叠 | 体验更好 |

---

## 2. 完整 HTML 模板：partials/cookie-consent.html

```html
{{/* ─── Cookie Consent Banner & Modal ──────────────────────────────── */}}
{{/* 仅在用户尚未做出选择时显示（ConsentHasDecision = false）         */}}

<!-- ① Cookie Banner（底部固定栏）-->
<div
  id="cky-banner"
  class="cky-banner"
  role="dialog"
  aria-live="polite"
  aria-label="{{ t "consent.banner.title" }}"
  style="{{ if .ConsentHasDecision }}display:none;{{ end }}"
>
  <div class="cky-banner__inner">
    <!-- 文案区 -->
    <div class="cky-banner__content">
      <p class="cky-banner__title">{{ t "consent.banner.title" }}</p>
      <p class="cky-banner__desc">
        {{ t "consent.banner.desc" }}
        <a
          href="{{ t "consent.banner.privacy_link" }}"
          class="cky-banner__link"
          target="_blank"
          rel="noopener"
        >{{ t "consent.banner.learnmore" }}</a>
      </p>
    </div>

    <!-- 按钮组 -->
    <div class="cky-banner__actions">
      <!-- 拒绝全部：幽灵按钮，视觉上不突出但易用 -->
      <button
        id="cky-btn-reject"
        class="cky-btn cky-btn--ghost"
        onclick="CKY.rejectAll()"
        aria-label="{{ t "consent.btn.reject_all" }}"
      >
        {{ t "consent.btn.reject_all" }}
      </button>

      <!-- 自定义偏好：幽灵按钮 -->
      <button
        id="cky-btn-customize"
        class="cky-btn cky-btn--ghost"
        onclick="CKY.openModal()"
        aria-label="{{ t "consent.btn.customize" }}"
      >
        {{ t "consent.btn.customize" }}
      </button>

      <!-- 接受全部：主色填充，最显眼 -->
      <button
        id="cky-btn-accept"
        class="cky-btn cky-btn--primary"
        onclick="CKY.acceptAll()"
        aria-label="{{ t "consent.btn.accept_all" }}"
      >
        {{ t "consent.btn.accept_all" }}
      </button>
    </div>
  </div>
</div>

<!-- ② 自定义偏好 Modal -->
<div
  id="cky-modal"
  class="cky-modal"
  role="dialog"
  aria-modal="true"
  aria-labelledby="cky-modal-title"
  hidden
>
  <!-- 遮罩层 -->
  <div class="cky-modal__backdrop" onclick="CKY.closeModal()"></div>

  <!-- 弹窗主体 -->
  <div class="cky-modal__box">
    <!-- 标题栏 -->
    <div class="cky-modal__header">
      <h2 id="cky-modal-title" class="cky-modal__title">
        {{ t "consent.modal.title" }}
      </h2>
      <button
        class="cky-modal__close"
        onclick="CKY.closeModal()"
        aria-label="{{ t "consent.btn.close" }}"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <!-- 说明文字 -->
    <p class="cky-modal__desc">{{ t "consent.modal.desc" }}</p>

    <!-- Cookie 分类列表 -->
    <div class="cky-modal__categories">

      <!-- 必要 Cookie（锁定，不可关闭）-->
      <div class="cky-category">
        <div class="cky-category__row">
          <div class="cky-category__info">
            <span class="cky-category__name">{{ t "consent.category.necessary.name" }}</span>
            <span class="cky-category__badge cky-category__badge--locked">
              <svg width="12" height="12" viewBox="0 0 12 12"><path d="M9 5V3.5a3 3 0 0 0-6 0V5H2v6h8V5H9zm-4-1.5a1 1 0 0 1 2 0V5H5V3.5z" fill="currentColor"/></svg>
              Always Active
            </span>
          </div>
          <!-- 锁定的 Toggle（禁用态）-->
          <div class="cky-toggle cky-toggle--locked" aria-disabled="true">
            <div class="cky-toggle__track cky-toggle__track--on">
              <div class="cky-toggle__thumb"></div>
            </div>
          </div>
        </div>
        <p class="cky-category__desc">{{ t "consent.category.necessary.desc" }}</p>
      </div>

      <!-- 分析 Cookie -->
      <div class="cky-category">
        <div class="cky-category__row">
          <div class="cky-category__info">
            <span class="cky-category__name">{{ t "consent.category.analytics.name" }}</span>
          </div>
          <label class="cky-toggle" aria-label="{{ t "consent.category.analytics.name" }}">
            <input
              type="checkbox"
              id="cky-toggle-analytics"
              class="cky-toggle__input"
              name="analytics"
            />
            <div class="cky-toggle__track">
              <div class="cky-toggle__thumb"></div>
            </div>
          </label>
        </div>
        <p class="cky-category__desc">{{ t "consent.category.analytics.desc" }}</p>
      </div>

      <!-- 广告 Cookie -->
      <div class="cky-category">
        <div class="cky-category__row">
          <div class="cky-category__info">
            <span class="cky-category__name">{{ t "consent.category.ads.name" }}</span>
          </div>
          <label class="cky-toggle" aria-label="{{ t "consent.category.ads.name" }}">
            <input
              type="checkbox"
              id="cky-toggle-ads"
              class="cky-toggle__input"
              name="ads"
            />
            <div class="cky-toggle__track">
              <div class="cky-toggle__thumb"></div>
            </div>
          </label>
        </div>
        <p class="cky-category__desc">{{ t "consent.category.ads.desc" }}</p>
      </div>

    </div><!-- /.cky-modal__categories -->

    <!-- Modal 底部操作 -->
    <div class="cky-modal__footer">
      <button
        class="cky-btn cky-btn--ghost"
        onclick="CKY.rejectAll()"
      >
        {{ t "consent.btn.reject_all" }}
      </button>
      <button
        class="cky-btn cky-btn--primary"
        onclick="CKY.savePreferences()"
      >
        {{ t "consent.btn.save" }}
      </button>
    </div>
  </div>
</div>

<!-- ③ Toast 提示（保存成功）-->
<div id="cky-toast" class="cky-toast" aria-live="assertive" hidden>
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8l3.5 3.5L13 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>
  <span>{{ t "consent.toast.saved" }}</span>
</div>

{{/* 传递给 consent-engine.js 的配置 */}}
<script>
  window.CKY_CONFIG = {
    cookieName:  '{{ .ConsentCookieName }}',
    gaEnabled:   {{ .GAEnabled }},
    gaId:        '{{ .GATrackingID }}',
    adsEnabled:  {{ .AdsEnabled }},
    hasDecision: {{ .ConsentHasDecision }},
    analytics:   '{{ .ConsentAnalytics }}',
    ads:         '{{ .ConsentAds }}'
  };
</script>
```

---

## 3. CSS 规范（加入 /static/css/consent.css）

### CSS 变量

```css
:root {
  /* 复用站点主色 */
  --cky-primary:        var(--color-primary, #1a9b6c);
  --cky-primary-hover:  #158a5e;

  /* Banner 专属 */
  --cky-bg:             #1e1e2e;
  --cky-text:           #f0f0f0;
  --cky-text-muted:     #a0a0b0;
  --cky-border:         rgba(255, 255, 255, 0.1);
  --cky-radius-sm:      8px;
  --cky-radius-md:      12px;
  --cky-shadow-banner:  0 -4px 24px rgba(0, 0, 0, 0.3);
  --cky-shadow-modal:   0 8px 40px rgba(0, 0, 0, 0.5);

  /* Toggle */
  --cky-toggle-w:       44px;
  --cky-toggle-h:       24px;
  --cky-toggle-off:     #4a4a5a;
  --cky-toggle-on:      var(--cky-primary);
  --cky-toggle-thumb:   #ffffff;

  /* z-index */
  --cky-z-banner:       9000;
  --cky-z-modal:        9001;
  --cky-z-toast:        9002;
}
```

### 关键样式规则

**Banner（底部固定，滑入动效）：**
```css
.cky-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: var(--cky-z-banner);
  background: var(--cky-bg);
  border-top: 1px solid var(--cky-border);
  box-shadow: var(--cky-shadow-banner);
  /* 滑入动效 */
  animation: cky-slide-up 0.3s ease-out;
}
@keyframes cky-slide-up {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}
.cky-banner__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 24px;
  /* 移动端改为纵向 */
}
```

**按钮规则：**
```css
.cky-btn {
  padding: 10px 20px;
  border-radius: var(--cky-radius-sm);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  white-space: nowrap;
}
.cky-btn--primary {
  background: var(--cky-primary);
  color: #fff;
  border: 2px solid var(--cky-primary);
}
.cky-btn--primary:hover { background: var(--cky-primary-hover); }

.cky-btn--ghost {
  background: transparent;
  color: var(--cky-text);
  border: 2px solid var(--cky-border);
}
.cky-btn--ghost:hover { border-color: var(--cky-text-muted); }
```

**Toggle Switch：**
```css
.cky-toggle__input { display: none; }
.cky-toggle__track {
  width: var(--cky-toggle-w);
  height: var(--cky-toggle-h);
  background: var(--cky-toggle-off);
  border-radius: 999px;
  position: relative;
  transition: background 0.2s;
  cursor: pointer;
}
.cky-toggle__thumb {
  position: absolute;
  top: 2px; left: 2px;
  width: calc(var(--cky-toggle-h) - 4px);
  height: calc(var(--cky-toggle-h) - 4px);
  background: var(--cky-toggle-thumb);
  border-radius: 50%;
  transition: transform 0.2s;
}
.cky-toggle__input:checked + .cky-toggle__track {
  background: var(--cky-toggle-on);
}
.cky-toggle__input:checked + .cky-toggle__track .cky-toggle__thumb {
  transform: translateX(calc(var(--cky-toggle-w) - var(--cky-toggle-h)));
}
.cky-toggle--locked .cky-toggle__track { opacity: 0.5; cursor: not-allowed; }
.cky-toggle__track--on { background: var(--cky-toggle-on) !important; }
```

**Modal：**
```css
.cky-modal {
  position: fixed;
  inset: 0;
  z-index: var(--cky-z-modal);
  display: flex;
  align-items: flex-end;   /* 移动端从底部弹出 */
  justify-content: center;
}
@media (min-width: 640px) {
  .cky-modal { align-items: center; } /* 桌面端居中 */
}
.cky-modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(2px);
}
.cky-modal__box {
  position: relative;
  background: var(--cky-bg);
  border-radius: var(--cky-radius-md) var(--cky-radius-md) 0 0;
  box-shadow: var(--cky-shadow-modal);
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px;
}
@media (min-width: 640px) {
  .cky-modal__box { border-radius: var(--cky-radius-md); }
}
```

**Toast：**
```css
.cky-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: var(--cky-z-toast);
  background: var(--cky-primary);
  color: #fff;
  padding: 10px 16px;
  border-radius: var(--cky-radius-sm);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.2s, transform 0.2s;
}
.cky-toast--show {
  opacity: 1;
  transform: translateY(0);
}
```

**响应式断点：**
```css
@media (max-width: 639px) {
  .cky-banner__inner {
    flex-direction: column;
    align-items: stretch;
  }
  .cky-banner__actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .cky-btn { width: 100%; text-align: center; }
}
```

---

## 4. 隐私政策页模板（privacy.html）

```html
{{ template "base.html" . }}

{{ define "content" }}
<main class="privacy-page">
  <div class="container">
    <h1>{{ .SEO.Title }}</h1>
    <p class="privacy-page__updated">Last updated: {{ .SEO.LastUpdated }}</p>

    {{ range .Sections }}
    <section class="privacy-section">
      <h2>{{ .Title }}</h2>
      <p>{{ .Content }}</p>
    </section>
    {{ end }}

    <!-- 重新管理 Cookie 偏好 -->
    <section class="privacy-section">
      <h2>{{ t "consent.modal.title" }}</h2>
      <p>{{ t "consent.modal.desc" }}</p>
      <button class="cky-btn cky-btn--primary" onclick="CKY.openModal()" style="margin-top:12px">
        {{ t "consent.btn.customize" }}
      </button>
    </section>
  </div>

  {{- template "partials/ad_slot.html" dict
      "SlotID"  "privacy-bottom"
      "Size"    "728x90"
      "Mobile"  "320x50"
      "ClientID" .AdsClientID
      "Enabled"  .AdsEnabled }}
</main>
{{ end }}
```

---

## 5. 验收标准 Checklist

### 视觉还原
- [ ] Banner 背景色、文字色、边框与设计规范完全一致
- [ ] 接受按钮使用主色，拒绝/自定义为幽灵按钮
- [ ] Modal 从底部弹出（移动端）/ 居中弹出（桌面端）
- [ ] 必要 Cookie Toggle 显示锁定图标且不可交互
- [ ] 分析/广告 Toggle 默认关闭（未同意状态）

### 交互动效
- [ ] Banner 首次出现有 `translateY(100%) → 0` 滑入动画
- [ ] 点击任意按钮后 Banner 淡出消失
- [ ] Toast 出现后 2.5 秒自动消失
- [ ] Modal 打开时背景有 backdrop-filter blur
- [ ] ESC 键可关闭 Modal

### 响应式
- [ ] 移动端按钮竖向堆叠，全宽
- [ ] Modal 在移动端从底部弹出，最大高度 90vh 可滚动
- [ ] Toast 在移动端位置不覆盖操作区域

### 无障碍
- [ ] Banner 有 `role="dialog"` 和 `aria-live="polite"`
- [ ] Modal 有 `aria-modal="true"` 和 `aria-labelledby`
- [ ] 所有按钮有 `aria-label`
- [ ] Tab 键可在 Modal 内循环焦点
