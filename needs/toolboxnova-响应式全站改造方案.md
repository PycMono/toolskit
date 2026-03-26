# Tool Box Nova — 全站响应式改造方案

> **版本：** v1.0  
> **目标：** 手机（360px+）/ 平板（768px+）/ 桌面（1024px+）全终端兼容  
> **原则：** 最小化侵入、统一规范、分层改造、一次性落地  
> **改动范围：** `main.css` 全局补全 + 各工具 CSS 追加 + `base.html` 结构微调 + JS 两处 resize 适配

---

## 目录

1. [问题总览诊断](#一问题总览诊断)
2. [改造分层架构](#二改造分层架构)
3. [第一层：base.html 结构调整](#三第一层basehtml-结构调整)
4. [第二层：main.css 全局响应式基准](#四第二层maincss-全局响应式基准)
5. [第三层：各工具 CSS 响应式补全](#五第三层各工具-css-响应式补全)
6. [第四层：JS 适配（极简）](#六第四层js-适配极简)
7. [改造文件清单与工时](#七改造文件清单与工时)
8. [验收 Checklist](#八验收-checklist)

---

## 一、问题总览诊断

### 全站共性问题（所有工具页面均存在）

| 问题类别 | 具体表现 | 影响设备 |
|---|---|---|
| **视口未保护** | 部分子页面未继承正确 viewport meta | 所有移动端 |
| **导航栏溢出** | desktop 导航 dropdown 在手机端无法触达 | <768px |
| **双栏 Grid 不折叠** | 工具区 `.tool-layout` / `.aid-tool__grid` 在平板无法正确折叠 | 768~1024px |
| **固定宽度元素** | `aid-gauge-wrap: 220px`、各种 `width: 160px` 等硬编码 | <480px |
| **字号不缩放** | 标题 `clamp()` 未全局统一，部分页面仍用 px | <480px |
| **表单/按钮触控目标过小** | 按钮高度 <44px，不满足 WCAG 触控标准 | 所有触控设备 |
| **横向溢出** | 无 `overflow-x: hidden` 保护，内容超出屏幕宽度 | <768px |
| **Toast/浮层位置** | `bottom: 24px; right: 24px` 在手机端被键盘/导航栏遮盖 | iOS/Android |
| **广告位不适配** | 728x90 横幅在手机端溢出，需切换为 320x50 | <768px |
| **主题色在多工具间不统一** | 各工具 CSS 变量命名不一致，暗色主题下部分工具显示异常 | 暗色主题 |

### AI Detector 专项问题（来自代码审查）

| 问题 | 位置 | 严重程度 |
|---|---|---|
| `aid-gauge-wrap` 固定 220px | `.css:L` | 🔴 高 |
| `aid-detector-bar-track` 隐藏后无替代展示 | `.css` + `.js` | 🟡 中 |
| `aid-stats-row` 三列在 320px 下挤压 | `.css` | 🟡 中 |
| `aid-input-tabs` 无横向滚动 | `.css` | 🟡 中 |
| `aid-highlight-para` 左侧 padding 44px 在小屏遮字 | `.css` | 🟡 中 |
| Sticky 操作栏与 Toast 容器重叠 | `.css` | 🟡 中 |

### IP 查询页专项问题（dev-ip.html）

| 问题 | 位置 |
|---|---|
| Leaflet 地图高度固定，小屏不适配 | `dev-tools.css` |
| `.ip-panel` 双栏在手机端不折叠 | `dev-tools.css` |
| `.ip-lookup-row` flex 行在 320px 溢出 | `dev-tools.css` |

---

## 二、改造分层架构

```
┌─────────────────────────────────────────────────────┐
│  第一层：base.html                                    │
│  - viewport meta 确认                                │
│  - 汉堡菜单 HTML 结构补充                            │
│  - 导航响应式切换逻辑                                │
└───────────────────┬─────────────────────────────────┘
                    │ 继承
┌───────────────────▼─────────────────────────────────┐
│  第二层：main.css（全局基准）                         │
│  - CSS 变量响应式补全                                │
│  - 导航栏手机端样式                                  │
│  - .container 宽度自适应                             │
│  - 通用按钮 44px 触控最小高度                        │
│  - 通用 .tool-layout 响应式规则                      │
│  - 全局 overflow-x 保护                              │
└───────────────────┬─────────────────────────────────┘
                    │ 覆盖
┌───────────────────▼─────────────────────────────────┐
│  第三层：各工具专属 CSS（ai-detector.css / dev-tools.css / ...）│
│  - 工具级响应式断点追加                              │
│  - 固定宽度元素改为 min() / clamp() / %             │
│  - 组件折叠规则                                     │
└───────────────────┬─────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────┐
│  第四层：各工具 JS（极少改动）                        │
│  - Chart.js gauge resize                            │
│  - Leaflet 地图 invalidateSize                      │
└─────────────────────────────────────────────────────┘
```

---

## 三、第一层：base.html 结构调整

### 3.1 确认 viewport meta（`<head>` 中）

```html
<!-- 如果 base.html 中没有以下这行，必须添加 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

> `viewport-fit=cover` 解决 iPhone 刘海屏安全区问题。

### 3.2 导航栏补充汉堡菜单结构

在 `base.html` 的 `<nav>` 中，找到桌面导航容器，**在其同级末尾**追加：

```html
<!-- 汉堡按钮（移动端显示，桌面端隐藏） -->
<button class="nav-hamburger" id="navHamburger"
        aria-label="打开菜单" aria-expanded="false"
        aria-controls="navMobileMenu">
  <span></span><span></span><span></span>
</button>

<!-- 移动端全屏菜单（复制导航链接，保持语言参数） -->
<div class="nav-mobile-menu" id="navMobileMenu" aria-hidden="true">
  <div class="nav-mobile-inner">
    <!-- 导航分类 -->
    <div class="nav-mobile-group">
      <span class="nav-mobile-group__label">隐私账号</span>
      <!-- 从 desktop dropdown 复制对应 <a> 列表 -->
    </div>
    <div class="nav-mobile-group">
      <span class="nav-mobile-group__label">开发工具</span>
    </div>
    <div class="nav-mobile-group">
      <span class="nav-mobile-group__label">多媒体</span>
    </div>
    <div class="nav-mobile-group">
      <span class="nav-mobile-group__label">实时查询</span>
    </div>
    <div class="nav-mobile-group">
      <span class="nav-mobile-group__label">AI 实验室</span>
    </div>
  </div>
</div>
```

### 3.3 base.html extraScript 末尾追加汉堡菜单逻辑

```html
<script>
(function() {
  var btn  = document.getElementById('navHamburger');
  var menu = document.getElementById('navMobileMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', function() {
    var isOpen = menu.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(isOpen));
    menu.setAttribute('aria-hidden', String(!isOpen));
    document.body.classList.toggle('nav-open', isOpen);
  });

  // 点击遮罩关闭
  menu.addEventListener('click', function(e) {
    if (e.target === menu) {
      menu.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('nav-open');
    }
  });

  // ESC 关闭
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      btn.click();
    }
  });
})();
</script>
```

---

## 四、第二层：main.css 全局响应式基准

在 `main.css` 末尾**追加**以下内容（不修改原有规则）：

```css
/* ============================================================
   全站响应式基准补全 — 追加至 main.css 末尾
   不修改原有规则，仅覆盖和补充
   ============================================================ */

/* ── 全局保护 ── */
*, *::before, *::after { box-sizing: border-box; }
html { overflow-x: hidden; }
body { overflow-x: hidden; }
img, video, canvas, svg { max-width: 100%; height: auto; }

/* ── iOS 安全区适配（刘海屏）── */
.nav,
.tool-wrapper,
.aid-actions,
.toast-container {
  padding-left:  max(var(--space-md, 16px), env(safe-area-inset-left));
  padding-right: max(var(--space-md, 16px), env(safe-area-inset-right));
}

/* ── 通用容器自适应 ── */
.container {
  width: 100%;
  max-width: var(--container-max, 1200px);
  margin-left: auto;
  margin-right: auto;
  padding-left:  clamp(12px, 4vw, 24px);
  padding-right: clamp(12px, 4vw, 24px);
}

/* ── 通用按钮触控最小高度（WCAG 2.5.5）── */
.btn, button, [role="button"] {
  min-height: 44px;
  min-width: 44px;
}

/* ── 通用工具布局（.tool-layout）── */
.tool-layout {
  display: grid;
  grid-template-columns: 1fr 300px;  /* 主区 + 侧边广告 */
  gap: 24px;
  align-items: flex-start;
}

/* ── 汉堡按钮（桌面端隐藏）── */
.nav-hamburger {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 44px; height: 44px;
  padding: 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  gap: 5px;
}
.nav-hamburger span {
  display: block;
  height: 2px;
  background: var(--color-text, #1a1a2e);
  border-radius: 2px;
  transition: transform 0.25s, opacity 0.25s;
}
.nav-hamburger[aria-expanded="true"] span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.nav-hamburger[aria-expanded="true"] span:nth-child(2) { opacity: 0; }
.nav-hamburger[aria-expanded="true"] span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

/* ── 移动端全屏菜单 ── */
.nav-mobile-menu {
  display: none; /* JS 控制 is-open */
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 8000;
  backdrop-filter: blur(4px);
}
.nav-mobile-menu.is-open { display: flex; }
.nav-mobile-inner {
  background: var(--color-surface, #fff);
  width: min(320px, 85vw);
  height: 100%;
  overflow-y: auto;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.nav-mobile-group__label {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted, #9ca3af);
  margin-bottom: 8px;
}
.nav-mobile-group a {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  color: var(--color-text, #1a1a2e);
  text-decoration: none;
  transition: background 0.2s;
  min-height: 44px;
}
.nav-mobile-group a:hover,
.nav-mobile-group a.active { background: var(--color-surface-2, #f3f2ff); color: var(--color-primary, #6c63ff); }
/* 滚动锁定 */
body.nav-open { overflow: hidden; }

/* ── 平板端 768~1024px ── */
@media (max-width: 1024px) {
  .tool-layout {
    grid-template-columns: 1fr; /* 隐藏侧边广告列 */
  }
  .tool-layout > [class*="sidebar"],
  .tool-layout > [class*="ad-slot"][class*="sidebar"] {
    display: none;
  }
}

/* ── 手机端 <768px ── */
@media (max-width: 768px) {
  /* 显示汉堡按钮，隐藏桌面导航 */
  .nav-hamburger { display: flex; }
  .nav-desktop-links,
  .nav-dropdown-group { display: none; }

  /* Hero 字号 */
  .hero__title,
  .hero-title {
    font-size: clamp(1.4rem, 6vw, 2rem);
  }

  /* 特性卡片：单列 */
  .features__grid,
  .tool-features,
  .feature-cards {
    grid-template-columns: 1fr !important;
  }

  /* FAQ */
  .faq-list { padding: 0; }

  /* Toast 容器 */
  .toast-container {
    left: 12px !important;
    right: 12px !important;
    bottom: 80px !important; /* 避开底部 sticky 栏 */
  }
  .toast {
    min-width: 0 !important;
    width: 100% !important;
  }
}

/* ── 小手机端 <480px ── */
@media (max-width: 480px) {
  .container {
    padding-left: 12px;
    padding-right: 12px;
  }
  /* 广告横幅：超出隐藏 */
  .ad-slot[data-size="728x90"] {
    overflow: hidden;
    max-width: 100%;
  }
}
```

---

## 五、第三层：各工具 CSS 响应式补全

每个工具的 CSS 文件**末尾追加**对应内容，不修改原有规则。

---

### 5.1 AI Detector（`ai-detector.css` / `aid.css`）追加内容

```css
/* ============================================================
   AI Detector 响应式补全 — 追加至文件末尾
   ============================================================ */

/* ── 通用：防止横向溢出 ── */
.aid-page * { box-sizing: border-box; }
.aid-page   { overflow-x: hidden; }

/* ── 平板端 768~1024px ── */
@media (max-width: 1024px) {
  .aid-tool__grid {
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .aid-sidebar { display: none; } /* 隐藏广告侧边栏 */
  .aid-hero { padding: 32px 16px 24px; }
}

/* ── 手机端 <768px ── */
@media (max-width: 768px) {

  /* 1. 单栏布局，结果区置顶 */
  .aid-tool__grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .aid-panel--result { order: -1; }

  /* 2. Gauge 宽度自适应 */
  .aid-gauge-wrap {
    width: min(220px, 68vw);
    height: auto;
    aspect-ratio: 220 / 130;
  }
  .aid-gauge-score { font-size: 2.2rem; }

  /* 3. 检测器列表：隐藏进度条，保留名称+分数 */
  .aid-detector-bar-track { display: none; }
  .aid-detector-item {
    justify-content: space-between;
    padding: 8px 12px;
  }
  .aid-detector-name {
    flex: 1;
    font-size: 0.85rem;
  }
  .aid-detector-score {
    flex: 0 0 auto;
    font-size: 0.85rem;
  }

  /* 4. 统计三格 */
  .aid-stats-row {
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }
  .aid-stat-card { padding: 8px; gap: 6px; }
  .aid-stat-val  { font-size: 0.8rem; }
  .aid-stat-lbl  { font-size: 0.65rem; }

  /* 5. 操作按钮 sticky 底部 */
  .aid-actions {
    position: sticky;
    bottom: 0;
    z-index: 100;
    background: var(--aid-surface);
    padding: 12px 16px;
    margin: 0 -20px -20px;
    border-top: 1px solid var(--aid-border);
    box-shadow: 0 -4px 16px rgba(0,0,0,0.08);
    border-radius: 0 0 var(--aid-radius-lg) var(--aid-radius-lg);
  }

  /* 6. 输入 Tab 横向滚动 */
  .aid-input-tabs {
    overflow-x: auto;
    flex-wrap: nowrap;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding-bottom: 4px;
  }
  .aid-input-tabs::-webkit-scrollbar { display: none; }

  /* 7. 高亮文本段落：修复左侧 padding 遮字 */
  .aid-highlight-para {
    padding-left: 8px;
    padding-top: 28px;
  }
  .aid-para-label {
    position: static;
    display: inline-flex;
    margin-bottom: 6px;
  }
  .aid-highlight-text { max-height: 240px; }

  /* 8. Toast 避开 sticky 操作栏 */
  .aid-toast-container {
    left: 12px;
    right: 12px;
    bottom: 76px;
  }
  .aid-toast { min-width: 0; width: 100%; }

  /* 9. 主题按钮避开操作栏 */
  .aid-theme-toggle { bottom: 86px; }

  /* 10. Editorial 区 */
  .aid-ed-grid  { grid-template-columns: 1fr; }
  .aid-ed-stats { grid-template-columns: repeat(2, 1fr); }
  .aid-ed-card--wide { grid-column: auto; }
  .aid-cta-banner {
    flex-direction: column;
    padding: 20px 16px;
    text-align: center;
  }

  /* 11. 断点标签 */
  .aid-breakdown__lbl { font-size: 0.72rem; }
}

/* ── 小手机端 <480px ── */
@media (max-width: 480px) {

  /* 统计改为两列 */
  .aid-stats-row { grid-template-columns: repeat(2, 1fr); }

  /* 选项面板：单列 */
  .aid-opt-row { grid-template-columns: 1fr; }

  /* Purpose Tab 横向滚动 */
  .aid-purpose-tabs {
    overflow-x: auto;
    flex-wrap: nowrap;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .aid-purpose-tabs::-webkit-scrollbar { display: none; }

  /* Gauge 分数 */
  .aid-gauge-score { font-size: 1.8rem; }

  /* Textarea 最小高度 */
  .aid-textarea { min-height: 180px; }

  /* Hero */
  .aid-hero { padding: 20px 12px 14px; }
  .aid-tool { padding: 0 12px 24px; }

  /* 选项面板 padding */
  .aid-panel--input { padding: 14px; }
}
```

---

### 5.2 IP 查询页（`dev-tools.css`）追加内容

```css
/* ============================================================
   dev-tools（IP 查询）响应式补全 — 追加至文件末尾
   ============================================================ */

/* ── 手机端 <768px ── */
@media (max-width: 768px) {

  /* IP 面板：双栏变单栏 */
  .ip-panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* Leaflet 地图高度限制 */
  #ipMap {
    height: 240px !important;
    width: 100%;
    border-radius: 12px;
  }

  /* 查询行：换行排列 */
  .ip-lookup-row {
    flex-wrap: wrap;
    gap: 8px;
  }
  .ip-lookup-row input { width: 100%; flex: none; }
  .ip-lookup-row .btn  { flex: 1; min-width: 0; }

  /* IP 大号显示 */
  .ip-my-value { font-size: 1.4rem; word-break: break-all; }
}

/* ── 小手机端 <480px ── */
@media (max-width: 480px) {
  #ipMap { height: 180px !important; }
  .ip-field {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .ip-field__value { font-size: 0.875rem; word-break: break-all; }
}
```

---

### 5.3 所有工具页通用 FAQ 样式补全（追加至 `main.css`）

```css
/* ── FAQ 手风琴响应式 ── */
@media (max-width: 768px) {
  .faq-item summary,
  .aid-faq-question,
  .faq-question {
    font-size: 0.9rem;
    padding: 14px 16px;
    min-height: 44px;
  }
  .faq-answer p,
  .aid-faq-answer p {
    font-size: 0.85rem;
    padding: 12px 16px;
  }
}
```

---

### 5.4 新工具页 CSS 通用模板（新建工具时直接套用）

每个新工具的 CSS 文件按以下结构组织，响应式规则始终写在文件末尾：

```css
/* static/css/{工具名}.css */

/* === 1. CSS 变量（继承 main.css，仅声明工具专属变量）=== */
:root {
  --{工具名}-accent: var(--color-primary);
  /* 工具专属变量 */
}

/* === 2. 桌面端布局（默认）=== */
.page-{工具名} { ... }

/* === 3. 平板端 @media (max-width: 1024px) === */
@media (max-width: 1024px) { ... }

/* === 4. 手机端 @media (max-width: 768px) === */
@media (max-width: 768px) { ... }

/* === 5. 小手机端 @media (max-width: 480px) === */
@media (max-width: 480px) { ... }

/* === 6. 暗色/主题覆盖 === */
[data-theme="dark"] .page-{工具名} { ... }
```

---

## 六、第四层：JS 适配（极简）

### 6.1 AI Detector JS（`ai-detector.js`）

在 `updateGauge()` 函数末尾追加一行，在 `toggleTheme()` 末尾追加两行：

```javascript
// updateGauge() 末尾追加：
if (State.gaugeChart) {
  State.gaugeChart.resize();
}

// toggleTheme() 末尾追加：
if (State.gaugeChart) {
  setTimeout(function() { State.gaugeChart.resize(); }, 300);
}
```

### 6.2 IP 查询 JS（`dev-ip.js`）

在 Leaflet 地图初始化成功后追加：

```javascript
// 在地图 marker setView 之后追加：
setTimeout(function() {
  if (window._ipMap) window._ipMap.invalidateSize();
}, 400);

// 同时监听窗口 resize（防止地图瓦片错位）：
window.addEventListener('resize', function() {
  if (window._ipMap) window._ipMap.invalidateSize();
});
```

### 6.3 通用：所有带 Chart.js 的工具

在窗口 resize 时触发图表重绘（在工具 JS 的初始化末尾追加）：

```javascript
// 在 init() 末尾追加
window.addEventListener('resize', function() {
  // 遍历所有 Chart.js 实例并重绘
  if (typeof Chart !== 'undefined') {
    Object.values(Chart.instances || {}).forEach(function(chart) {
      chart.resize();
    });
  }
});
```

---

## 七、改造文件清单与工时

| 文件 | 改动类型 | 改动方式 | 预估工时 |
|---|---|---|---|
| `templates/base.html` | 汉堡菜单 HTML + JS | 追加结构 | 1.5h |
| `static/css/main.css` | 全局响应式基准 | 追加至末尾 | 1h |
| `static/css/ai-detector.css` | AI Detector 响应式 | 追加至末尾 | 0.5h |
| `static/css/dev-tools.css` | IP 查询响应式 | 追加至末尾 | 0.5h |
| `static/css/{其他工具}.css` | 各工具响应式 | 参照 5.4 模板 | 0.5h/个 |
| `static/js/ai-detector.js` | gauge resize | 追加 3 行 | 0.1h |
| `static/js/dev-ip.js` | map invalidateSize | 追加 5 行 | 0.1h |
| **合计（10 个工具估算）** | | | **≈ 9h** |

> **重要原则：所有改动均为「追加」，不修改原有代码行，Git diff 清晰，回滚成本极低。**

---

## 八、验收 Checklist

### 全站

- [ ] Chrome DevTools → 切换至 iPhone SE（375px）、iPad（768px）、Galaxy S8（360px），无横向滚动条
- [ ] 导航汉堡菜单在手机端正常展开/收起，ESC 可关闭
- [ ] 所有按钮/链接 touch target ≥ 44×44px（DevTools Accessibility 面板检查）
- [ ] 5 种主题（light/dark/forest/ocean/sunset）在手机端均正常显示，无色彩异常
- [ ] Toast 提示不被底部导航栏/键盘遮挡
- [ ] viewport meta 存在且包含 `viewport-fit=cover`
- [ ] iOS Safari 刘海屏无内容裁切

### AI Detector 专项

- [ ] Gauge 半圆图在 360px 设备上完整显示，不溢出
- [ ] 操作按钮（检测/人性化）sticky 固定在底部，滚动时不消失
- [ ] 检测器列表在手机端只显示名称+分数，排版整洁
- [ ] 高亮段落标签不遮挡正文文字
- [ ] 输入 Tab 和 Purpose Tab 可横向滑动选择
- [ ] 主题切换后 Gauge 正确重绘，不出现空白

### IP 查询专项

- [ ] Leaflet 地图在手机端高度为 240px，无瓦片错位
- [ ] 查询输入框和按钮在 360px 下换行排列，不溢出
- [ ] 窗口 resize 后地图自动修复尺寸

### 新工具接入

- [ ] 新工具 CSS 遵循第 5.4 节模板，响应式规则写在文件末尾
- [ ] 新工具 JS 在 init() 末尾包含 Chart.js resize 监听（如有图表）
- [ ] 新工具通过 DevTools 在 375px 下验收后方可上线

---

## 附录：断点速查表

| 断点名 | 范围 | 典型设备 | 对应变量（可选）|
|---|---|---|---|
| `xs` | ≤ 360px | 旧款 Android | `--bp-xs: 360px` |
| `sm` | ≤ 480px | 小屏手机 | `--bp-sm: 480px` |
| `md` | ≤ 768px | 手机/小平板 | `--bp-md: 768px` |
| `lg` | ≤ 1024px | iPad / 小笔记本 | `--bp-lg: 1024px` |
| `xl` | ≤ 1280px | 标准桌面 | `--bp-xl: 1280px` |
| `2xl` | > 1280px | 宽屏桌面 | `--bp-2xl: 1440px` |

---

*文档生成时间：2026-03-25 | 版本 v1.0*
