# Block B-02 · AI 人性化工具 — Hero 区域 + 写作模式选择器

> **所属模块**：AI 人性化工具（/ailab/humanize）  
> **竞品参考**：https://www.humanizeai.pro（白色简洁 Hero + 模式 Tab）  
> **预估工时**：2h  
> **依赖**：B-01（路由与 i18n 已配置）  
> **交付粒度**：仅负责 Hero 视觉区域 + 5 种写作模式 Tab 选择器的 HTML + CSS，无后端

---

## 1. 竞品分析（humanizeai.pro Hero）

| 元素 | 竞品 | 本次实现 |
|------|------|---------|
| 背景色 | 白色/浅灰渐变（与检测器深色形成对比） | ✅ 浅色背景 |
| 图标 | ✍️ 铅笔/写作相关 | ✅ |
| 副标题 | 简洁一句话 | ✅ |
| 信任徽章 | 3 个功能亮点 | ✅ |
| 模式选择器 | 横排 5 个 Tab（Standard/Formal/...） | ✅ |

---

## 2. HTML 模板

```html
<!-- templates/ailab/humanize.html — Hero + 模式选择器 -->

<!-- Hero 区域 -->
<section class="humanize-hero">
  <div class="container">

    <div class="humanize-hero__header">
      <div class="humanize-hero__icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
             stroke="#4f46e5" stroke-width="2" stroke-linecap="round">
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
      </div>
      <h1 class="humanize-hero__title">
        {{ t .Lang "ailab.humanize.hero.title" }}
      </h1>
    </div>

    <p class="humanize-hero__subtitle">
      {{ t .Lang "ailab.humanize.hero.subtitle" }}
    </p>

    <!-- 功能徽章 -->
    <div class="humanize-hero__badges">
      <span class="feature-badge feature-badge--green">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        {{ t .Lang "ailab.humanize.hero.badge1" }}
      </span>
      <span class="feature-badge feature-badge--blue">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        {{ t .Lang "ailab.humanize.hero.badge2" }}
      </span>
      <span class="feature-badge feature-badge--purple">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        {{ t .Lang "ailab.humanize.hero.badge3" }}
      </span>
    </div>

  </div>
</section>

<!-- 写作模式选择器（Hero 下方，紧贴主操作区） -->
<div class="mode-selector-wrapper">
  <div class="container">
    <div class="mode-selector" role="tablist" id="mode-selector">

      <button class="mode-tab mode-tab--active"
              role="tab" data-mode="standard"
              onclick="selectMode('standard', this)">
        <span class="mode-tab__icon">📝</span>
        <span class="mode-tab__name">{{ t .Lang "ailab.humanize.mode.standard" }}</span>
        <span class="mode-tab__desc">{{ t .Lang "ailab.humanize.mode.standard_desc" }}</span>
      </button>

      <button class="mode-tab"
              role="tab" data-mode="formal"
              onclick="selectMode('formal', this)">
        <span class="mode-tab__icon">💼</span>
        <span class="mode-tab__name">{{ t .Lang "ailab.humanize.mode.formal" }}</span>
        <span class="mode-tab__desc">{{ t .Lang "ailab.humanize.mode.formal_desc" }}</span>
      </button>

      <button class="mode-tab"
              role="tab" data-mode="casual"
              onclick="selectMode('casual', this)">
        <span class="mode-tab__icon">💬</span>
        <span class="mode-tab__name">{{ t .Lang "ailab.humanize.mode.casual" }}</span>
        <span class="mode-tab__desc">{{ t .Lang "ailab.humanize.mode.casual_desc" }}</span>
      </button>

      <button class="mode-tab"
              role="tab" data-mode="academic"
              onclick="selectMode('academic', this)">
        <span class="mode-tab__icon">🎓</span>
        <span class="mode-tab__name">{{ t .Lang "ailab.humanize.mode.academic" }}</span>
        <span class="mode-tab__desc">{{ t .Lang "ailab.humanize.mode.academic_desc" }}</span>
      </button>

      <button class="mode-tab"
              role="tab" data-mode="creative"
              onclick="selectMode('creative', this)">
        <span class="mode-tab__icon">🎨</span>
        <span class="mode-tab__name">{{ t .Lang "ailab.humanize.mode.creative" }}</span>
        <span class="mode-tab__desc">{{ t .Lang "ailab.humanize.mode.creative_desc" }}</span>
      </button>

    </div>
  </div>
</div>
```

---

## 3. CSS 样式

```css
/* static/css/humanize.css */

/* ── Hero 区域（浅色，与检测器深色形成对比） ─────── */
.humanize-hero {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e2e8f0;
  padding: 52px 0 36px;
  text-align: center;
}

.humanize-hero__header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 14px;
}

.humanize-hero__icon {
  width: 48px;
  height: 48px;
  background: #eef2ff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #c7d2fe;
}

.humanize-hero__title {
  font-size: 2.25rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.02em;
}

.humanize-hero__subtitle {
  font-size: 1.0625rem;
  color: #64748b;
  max-width: 520px;
  margin: 0 auto 28px;
  line-height: 1.6;
}

/* 功能徽章（彩色，与检测器白色徽章区分） */
.humanize-hero__badges {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.feature-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 14px;
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 500;
}

.feature-badge--green {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.feature-badge--blue {
  background: #dbeafe;
  color: #1e40af;
  border: 1px solid #bfdbfe;
}

.feature-badge--purple {
  background: #ede9fe;
  color: #5b21b6;
  border: 1px solid #ddd6fe;
}

/* ── 模式选择器 ──────────────────────────────────── */
.mode-selector-wrapper {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 0;
  position: sticky;
  top: 0;               /* 滚动时吸顶 */
  z-index: 100;
}

.mode-selector {
  display: flex;
  gap: 0;
  overflow-x: auto;     /* 移动端可横向滚动 */
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.mode-selector::-webkit-scrollbar {
  display: none;
}

.mode-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 14px 24px;
  min-width: 120px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  flex-shrink: 0;
}

.mode-tab:hover {
  background: #f8fafc;
  border-bottom-color: #c7d2fe;
}

.mode-tab--active {
  background: #fafafa;
  border-bottom-color: #4f46e5;
}

.mode-tab__icon {
  font-size: 1.25rem;
  line-height: 1;
}

.mode-tab__name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
}

.mode-tab--active .mode-tab__name {
  color: #4f46e5;
}

.mode-tab__desc {
  font-size: 0.75rem;
  color: #9ca3af;
  white-space: nowrap;
}

/* ── 响应式 ─────────────────────────────────────── */
@media (max-width: 768px) {
  .humanize-hero {
    padding: 36px 16px 28px;
  }
  .humanize-hero__title {
    font-size: 1.75rem;
  }
  .humanize-hero__header {
    flex-direction: column;
    gap: 8px;
  }
  .mode-tab {
    padding: 12px 16px;
    min-width: 100px;
  }
  .mode-tab__desc {
    display: none;  /* 移动端隐藏模式描述 */
  }
}
```

---

## 4. JavaScript — 模式切换

```javascript
// static/js/humanize.js

let currentMode = 'standard';  // 全局变量，B-04 后端接口会读取

function selectMode(mode, btn) {
  currentMode = mode;

  // 更新 Tab 激活状态
  document.querySelectorAll('.mode-tab').forEach(el => {
    el.classList.remove('mode-tab--active');
    el.removeAttribute('aria-selected');
  });
  btn.classList.add('mode-tab--active');
  btn.setAttribute('aria-selected', 'true');

  // 清空输出区（模式切换后输出失效）
  clearOutput();
}

function clearOutput() {
  const output = document.getElementById('humanize-output');
  if (output) output.textContent = '';
  // 隐藏统计信息
  const stats = document.getElementById('humanize-stats');
  if (stats) stats.style.display = 'none';
}

// 从 sessionStorage 读取检测器传来的文本（A-07 联调）
window.addEventListener('DOMContentLoaded', () => {
  const prefill = sessionStorage.getItem('humanize_input');
  if (prefill) {
    const input = document.getElementById('humanize-input');
    if (input) {
      input.value = prefill;
      onHumanizeInputChange(input);
      sessionStorage.removeItem('humanize_input');
    }
  }
});
```

---

## 5. i18n 翻译 Key（本 Block 新增）

### i18n/zh.json

```json
{
  "ailab.humanize.mode.standard":      "标准",
  "ailab.humanize.mode.standard_desc": "通用自然风格",
  "ailab.humanize.mode.formal":        "正式",
  "ailab.humanize.mode.formal_desc":   "商务/邮件",
  "ailab.humanize.mode.casual":        "口语",
  "ailab.humanize.mode.casual_desc":   "轻松对话风",
  "ailab.humanize.mode.academic":      "学术",
  "ailab.humanize.mode.academic_desc": "论文/研究",
  "ailab.humanize.mode.creative":      "创意",
  "ailab.humanize.mode.creative_desc": "生动表达"
}
```

### i18n/en.json

```json
{
  "ailab.humanize.mode.standard":      "Standard",
  "ailab.humanize.mode.standard_desc": "Natural & balanced",
  "ailab.humanize.mode.formal":        "Formal",
  "ailab.humanize.mode.formal_desc":   "Business / Emails",
  "ailab.humanize.mode.casual":        "Casual",
  "ailab.humanize.mode.casual_desc":   "Conversational",
  "ailab.humanize.mode.academic":      "Academic",
  "ailab.humanize.mode.academic_desc": "Essays / Research",
  "ailab.humanize.mode.creative":      "Creative",
  "ailab.humanize.mode.creative_desc": "Vivid & expressive"
}
```

---

## 6. 验收标准

- [ ] Hero 区域浅色背景，与检测器深色形成视觉区分
- [ ] 标题、副标题、3 个彩色徽章正确显示（非原始 key）
- [ ] 5 个模式 Tab 横排显示，默认选中「标准」
- [ ] 点击其他 Tab 激活态（蓝色下边线）切换正确
- [ ] 模式 Tab 在移动端可横向滚动，不换行
- [ ] 从检测器页面跳转时（sessionStorage 传值），输入框自动填入文本

