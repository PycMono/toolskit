# cookie-consent-I-03_consent-engine_JS.md

---

## 1. 技术选型

| 功能 | 方案 | 原因 |
|---|---|---|
| Cookie 读写 | 原生 `document.cookie` | 零依赖，兼容性好 |
| 同意状态存储 | Cookie（非 localStorage） | 服务端可读，Go 中间件可在 SSR 时注入 |
| Google Consent Mode v2 | `gtag('consent','update',{})` | 官方 API，自动与 GA/Ads 联动 |
| GA 动态加载 | 动态创建 `<script>` 标签 | 未同意时完全不加载 GA，隐私更安全 |
| 模块化 | IIFE + `window.CKY` | 无构建工具，直接 CDN/静态引入 |

---

## 2. 完整 consent-engine.js

```javascript
/**
 * consent-engine.js
 * Cookie Consent 同意引擎 + Google Consent Mode v2 集成
 * 依赖：base.html 中已初始化 window.dataLayer 和 gtag()
 */
(function () {
  'use strict';

  // ─── 配置（由 Go 模板注入 window.CKY_CONFIG）────────────────────────
  var CFG = window.CKY_CONFIG || {
    cookieName:  'cky_consent',
    gaEnabled:   false,
    gaId:        '',
    adsEnabled:  false,
    hasDecision: false,
    analytics:   'denied',
    ads:         'denied'
  };

  var COOKIE_MAX_AGE = 365 * 24 * 3600; // 1 年（秒）
  var COOKIE_NAME    = CFG.cookieName;

  // ─── 状态对象 ────────────────────────────────────────────────────────
  var state = {
    analytics: CFG.analytics, // 'granted' | 'denied'
    ads:       CFG.ads,
    decided:   CFG.hasDecision
  };

  // ─── Cookie 工具 ─────────────────────────────────────────────────────

  /**
   * 写入同意 Cookie
   * 格式: "necessary:granted,analytics:granted,ads:denied"
   */
  function saveConsentCookie(analytics, ads) {
    var val = [
      'necessary:granted',
      'analytics:' + analytics,
      'ads:' + ads
    ].join(',');

    var expires = new Date(Date.now() + COOKIE_MAX_AGE * 1000).toUTCString();
    // SameSite=Lax：允许跨站 GET 导航携带，防止 CSRF
    document.cookie = [
      COOKIE_NAME + '=' + encodeURIComponent(val),
      'max-age=' + COOKIE_MAX_AGE,
      'expires=' + expires,
      'path=/',
      'SameSite=Lax'
    ].join('; ');
  }

  /**
   * 读取同意 Cookie，返回 { analytics, ads } 或 null
   */
  function readConsentCookie() {
    var match = document.cookie.split(';').find(function (c) {
      return c.trim().startsWith(COOKIE_NAME + '=');
    });
    if (!match) return null;
    var raw = decodeURIComponent(match.split('=').slice(1).join('='));
    var result = { analytics: 'denied', ads: 'denied' };
    raw.split(',').forEach(function (part) {
      var kv = part.split(':');
      if (kv[0] === 'analytics') result.analytics = kv[1];
      if (kv[0] === 'ads')       result.ads       = kv[1];
    });
    return result;
  }

  // ─── Consent Mode v2 ─────────────────────────────────────────────────

  /**
   * 更新 Google Consent Mode v2
   * 必须在用户做出选择后立即调用
   */
  function updateConsentMode(analytics, ads) {
    if (typeof gtag !== 'function') return;
    gtag('consent', 'update', {
      ad_storage:              ads,
      ad_user_data:            ads,
      ad_personalization:      ads,
      analytics_storage:       analytics,
      functionality_storage:   'granted',
      security_storage:        'granted'
    });
  }

  // ─── GA 动态加载 ──────────────────────────────────────────────────────

  var gaLoaded = false;

  /**
   * 在用户同意分析 Cookie 后动态加载 GA 脚本
   * 若脚本已加载，仅发送 page_view 事件
   */
  function loadGA() {
    if (!CFG.gaEnabled || !CFG.gaId) return;
    if (gaLoaded) {
      // 已加载，补发 page_view
      if (typeof gtag === 'function') {
        gtag('event', 'page_view');
      }
      return;
    }
    gaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src   = 'https://www.googletagmanager.com/gtag/js?id=' + CFG.gaId;
    document.head.appendChild(s);
  }

  // ─── Banner / Modal DOM 操作 ──────────────────────────────────────────

  var banner = document.getElementById('cky-banner');
  var modal  = document.getElementById('cky-modal');
  var toast  = document.getElementById('cky-toast');

  function hideBanner() {
    if (!banner) return;
    banner.style.transition = 'opacity 0.25s, transform 0.25s';
    banner.style.opacity    = '0';
    banner.style.transform  = 'translateY(100%)';
    setTimeout(function () { banner.style.display = 'none'; }, 260);
  }

  function openModal() {
    if (!modal) return;
    // 同步 Toggle 状态到当前 state
    var anaToggle = document.getElementById('cky-toggle-analytics');
    var adsToggle = document.getElementById('cky-toggle-ads');
    if (anaToggle) anaToggle.checked = (state.analytics === 'granted');
    if (adsToggle) adsToggle.checked = (state.ads       === 'granted');

    modal.hidden = false;
    // 焦点管理：将焦点移入弹窗
    var firstBtn = modal.querySelector('button, [tabindex="0"]');
    if (firstBtn) firstBtn.focus();

    // ESC 关闭
    document.addEventListener('keydown', handleModalKeydown);
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.removeEventListener('keydown', handleModalKeydown);
  }

  function handleModalKeydown(e) {
    if (e.key === 'Escape') closeModal();
  }

  function showToast() {
    if (!toast) return;
    toast.hidden = false;
    // 下一帧触发过渡
    requestAnimationFrame(function () {
      toast.classList.add('cky-toast--show');
    });
    setTimeout(function () {
      toast.classList.remove('cky-toast--show');
      setTimeout(function () { toast.hidden = true; }, 220);
    }, 2500);
  }

  // ─── 核心同意操作 ─────────────────────────────────────────────────────

  /**
   * 应用同意状态：写 Cookie → 更新 Consent Mode → 按需加载 GA → 更新 UI
   */
  function applyConsent(analytics, ads) {
    state.analytics = analytics;
    state.ads       = ads;
    state.decided   = true;

    saveConsentCookie(analytics, ads);
    updateConsentMode(analytics, ads);

    if (analytics === 'granted') {
      loadGA();
    }

    hideBanner();
    closeModal();
    showToast();
  }

  function acceptAll() {
    applyConsent('granted', 'granted');
  }

  function rejectAll() {
    applyConsent('denied', 'denied');
  }

  function savePreferences() {
    var anaToggle = document.getElementById('cky-toggle-analytics');
    var adsToggle = document.getElementById('cky-toggle-ads');
    var analytics = (anaToggle && anaToggle.checked) ? 'granted' : 'denied';
    var ads       = (adsToggle && adsToggle.checked) ? 'granted' : 'denied';
    applyConsent(analytics, ads);
  }

  // ─── Footer "重新管理偏好" 按钮 ───────────────────────────────────────

  var reopenBtn = document.getElementById('cky-reopen-btn');
  if (reopenBtn) {
    reopenBtn.addEventListener('click', function (e) {
      e.preventDefault();
      // 显示 Banner（如果已隐藏）
      if (banner) {
        banner.style.display = '';
        banner.style.opacity = '';
        banner.style.transform = '';
      }
      openModal();
    });
  }

  // ─── 初始化 ──────────────────────────────────────────────────────────

  function init() {
    // 若 Go 中间件已检测到有效 Cookie，直接应用状态（不弹 Banner）
    if (CFG.hasDecision) {
      updateConsentMode(CFG.analytics, CFG.ads);
      if (CFG.analytics === 'granted') {
        loadGA();
      }
      return;
    }

    // 首次访问：Banner 已由 Go 模板控制显示
    // 兜底：若 Cookie 存在但 Go 端未读到（CDN 缓存等情况），前端重新读取
    var existing = readConsentCookie();
    if (existing) {
      updateConsentMode(existing.analytics, existing.ads);
      if (existing.analytics === 'granted') loadGA();
      hideBanner();
    }
  }

  // ─── 暴露公共 API ─────────────────────────────────────────────────────

  window.CKY = {
    acceptAll:       acceptAll,
    rejectAll:       rejectAll,
    openModal:       openModal,
    closeModal:      closeModal,
    savePreferences: savePreferences
  };

  // DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
```

---

## 3. ga-events.js 与同意集成说明

现有的 `gaTrack*` 函数无需修改，Consent Mode v2 会自动决定是否发送数据：

```javascript
// ga-events.js（现有文件，无需改动）
// Consent Mode v2 在底层拦截：
//   analytics_storage: 'denied' → gtag 事件被静默丢弃，不发送到 GA
//   analytics_storage: 'granted' → 正常发送

function gaTrackUpload(tool, fileCount, sizeMB) {
  if (typeof gtag !== 'function') return;
  gtag('event', 'file_upload', {
    event_category: tool,
    file_count: fileCount,
    size_mb: sizeMB
  });
}
// ... 其他 gaTrack* 函数保持不变
```

---

## 4. 函数调用关系图

```
用户行为
   │
   ├── 点击"接受全部"─────────────────► acceptAll()
   │                                        │
   ├── 点击"拒绝全部"─────────────────► rejectAll()
   │                                        │
   └── 点击"保存偏好" ─► savePreferences() ─┘
                                            │
                                            ▼
                                     applyConsent(analytics, ads)
                                     ┌──────────────────────────┐
                                     │ saveConsentCookie()      │ ─► document.cookie
                                     │ updateConsentMode()      │ ─► gtag('consent','update')
                                     │ loadGA()（条件）         │ ─► <script> 动态注入
                                     │ hideBanner()             │ ─► #cky-banner 淡出
                                     │ closeModal()             │ ─► #cky-modal hidden
                                     │ showToast()              │ ─► #cky-toast 显示
                                     └──────────────────────────┘


页面初始化（DOMContentLoaded）
   │
   └── init()
       ├── CFG.hasDecision = true  → updateConsentMode() + loadGA()（跳过 Banner）
       └── CFG.hasDecision = false
           ├── readConsentCookie() 有值 → 同上（CDN 缓存兜底）
           └── 无 Cookie → Banner 显示，等待用户操作
```

---

## 5. 验收标准 Checklist

### 核心逻辑
- [ ] 点击"接受全部"：Cookie 写入 `necessary:granted,analytics:granted,ads:granted`
- [ ] 点击"拒绝全部"：Cookie 写入 `necessary:granted,analytics:denied,ads:denied`
- [ ] 自定义保存：Cookie 值与 Toggle 状态完全对应
- [ ] Cookie 过期时间为 1 年
- [ ] Cookie 有 `SameSite=Lax; path=/`

### Consent Mode v2
- [ ] 同意前：`gtag('consent','default')` 中 analytics/ads 均为 `denied`
- [ ] 同意后：`gtag('consent','update')` 立即更新
- [ ] GA Network 请求：同意前无任何 GA 请求（DevTools Network 验证）
- [ ] GA Network 请求：同意后 GA 请求正常发出

### GA 动态加载
- [ ] analytics 拒绝时：`gtm.js` / `analytics.js` 不加载
- [ ] analytics 授权后：GA 脚本动态注入，`page_view` 事件触发
- [ ] 已同意用户刷新页面：Go 中间件读取 Cookie，页面加载即触发 GA

### 重新管理偏好
- [ ] Footer "管理 Cookie 偏好" 链接点击后弹出 Modal
- [ ] Modal 中 Toggle 状态反映当前已保存的同意状态
- [ ] 修改后点击保存，Cookie 更新，Consent Mode 实时更新

### 边界情况
- [ ] Cookie 被用户手动删除：下次访问重新弹出 Banner
- [ ] CDN 缓存导致 `ConsentHasDecision=false` 但 Cookie 存在：JS 前端兜底读取
- [ ] gtag 未加载时调用 `gaTrack*`：静默不报错
- [ ] ESC 键关闭 Modal 不触发保存
- [ ] Modal 打开时页面不可滚动（`body overflow: hidden`）
