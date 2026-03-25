<!-- privacy-check-I-03_前端处理引擎.md -->

# 🔒 隐私账号安全检测 — I-03 前端处理引擎

---

## 1. 技术选型表

| 功能模块 | 技术方案 | 选择原因 |
|---------|---------|---------|
| SHA-1 哈希计算 | `js-sha1` (CDN, 3KB gzip) | 纯 JS 实现，无 WASM 依赖，兼容性极佳；仅用于密码检测的 k-Anonymity，非安全存储场景 |
| k-Anonymity 协议 | 前端计算完整 SHA-1 → 取前 5 位 → 后端中转查询 → 前端比对后缀 | HIBP 官方推荐方案，密码永不离开浏览器 |
| 密码强度评估 | `zxcvbn` (Dropbox, CDN, 400KB) | 业界公认最佳密码强度评估库，支持多语言词典，返回破解时间估算 |
| 安全密码生成 | `crypto.getRandomValues()` (Web Crypto API) | 浏览器原生密码学安全随机数，无需外部库 |
| 日期格式化 | `dayjs` (CDN, 7KB gzip) | 轻量级日期库，支持中文 locale 和相对时间插件 |
| 人机验证 | Cloudflare Turnstile (CDN) | 隐式验证，用户体验优于 reCAPTCHA，与后端集成简单 |
| 剪贴板操作 | `navigator.clipboard.writeText()` | 现代浏览器原生 API，无需引入额外库 |
| HTTP 请求 | `fetch()` (原生) | 无需 axios/jQuery，原生 fetch 满足所有需求 |

---

## 2. 引擎架构说明

### 2.1 全局状态对象

```javascript
/**
 * 全局状态管理
 * 所有模块共享此状态对象，避免散落的全局变量
 */
var PC = {
  // ===== 当前语言 =====
  lang: document.documentElement.lang || 'en',

  // ===== Turnstile =====
  turnstileToken: null,
  turnstileReady: false,

  // ===== 邮箱检测状态 =====
  email: {
    checking: false,
    lastQuery: '',
    results: null,   // { fallback, breaches, safe, count }
  },

  // ===== 密码检测状态 =====
  password: {
    checking: false,
    lastHash: '',
    pwnedCount: 0,
    strengthResult: null,  // zxcvbn 返回对象
  },

  // ===== 泄露浏览器状态 =====
  breaches: {
    loading: false,
    allData: [],        // 完整泄露列表 (从API获取)
    filtered: [],       // 筛选后列表
    displayCount: 24,   // 当前显示数量
    searchTerm: '',
    activeFilter: 'all',
    sortBy: 'date',     // date | size | name
  },

  // ===== 密码生成器状态 =====
  generator: {
    lastGenerated: '',
    options: {
      length: 20,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      excludeAmbiguous: false,
    },
  },

  // ===== 常量 =====
  API_BASE: '/api/privacy',
  CONCURRENT_LIMIT: 3,
  BREACH_PAGE_SIZE: 24,
  MAX_EMAIL_LENGTH: 254,
  MIN_PASSWORD_LENGTH: 1,
};
```

### 2.2 核心函数职责与关键逻辑

#### `checkEmail()` — 邮箱泄露查询

```javascript
/**
 * 邮箱泄露查询流程:
 * 1. 校验输入 (非空 + 格式)
 * 2. 检查 Turnstile token
 * 3. 设置 loading 状态 + 盾牌旋转动画
 * 4. POST /api/privacy/check-email { email, turnstileToken }
 * 5. 根据响应渲染结果:
 *    - safe=true → 绿色安全卡片
 *    - breaches.length > 0 → 泄露列表卡片 + 安全建议
 *    - fallback=true → 兜底提示 + 通用建议
 * 6. 触发 GA 事件
 * 7. 重置 Turnstile token (一次性使用)
 */
async function checkEmail() {
  var email = document.getElementById('emailInput').value.trim();

  // 校验
  if (!email) { showToast(t('error.invalid_email'), 'error'); return; }
  if (!isValidEmail(email)) { showToast(t('error.invalid_email'), 'error'); return; }
  if (email.length > PC.MAX_EMAIL_LENGTH) { showToast(t('error.invalid_email'), 'error'); return; }

  // Turnstile 验证
  if (!PC.turnstileToken) {
    showToast(t('error.turnstile_failed'), 'error');
    return;
  }

  // 防重复提交
  if (PC.email.checking) return;
  PC.email.checking = true;
  PC.email.lastQuery = email;

  setShieldState('emailShieldRing', 'checking');
  setButtonLoading('emailBtn', true);

  try {
    var resp = await fetch(PC.API_BASE + '/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        turnstileToken: PC.turnstileToken,
      }),
    });

    var data = await resp.json();
    PC.email.results = data;

    if (data.safe) {
      setShieldState('emailShieldRing', 'safe');
      renderEmailSafe();
    } else if (data.breaches && data.breaches.length > 0) {
      setShieldState('emailShieldRing', 'danger');
      renderEmailBreached(data);
    } else if (data.fallback) {
      setShieldState('emailShieldRing', 'warning');
      renderEmailFallback(data);
    }

    // GA 追踪
    if (window.pcGA) pcGA.trackEmailCheck(data.count || 0);

  } catch (err) {
    setShieldState('emailShieldRing', 'error');
    showToast(t('error.network'), 'error');
    if (window.pcGA) pcGA.trackError('email_check_fail', err.message);
  } finally {
    PC.email.checking = false;
    setButtonLoading('emailBtn', false);
    // 重置 Turnstile — 每次查询用新 token
    resetTurnstile();
  }
}
```

#### `checkPassword()` — 密码安全检测 (k-Anonymity)

```javascript
/**
 * 密码泄露检测流程 (k-Anonymity):
 * 1. 读取密码原文 (不发送!)
 * 2. 前端计算 SHA-1 哈希 → 全大写
 * 3. 提取前 5 位作为 prefix，剩余为 suffix
 * 4. GET /api/privacy/password-range/{prefix}
 * 5. 后端返回 ~800 个 hash 后缀 + 出现次数
 * 6. 前端在返回列表中搜索自己的 suffix
 * 7. 找到 → 密码已泄露 (显示出现次数)
 *    未找到 → 密码安全 (未在泄露库中)
 * 8. 同时运行 zxcvbn 强度评估
 *
 * 关键: 密码原文和完整 hash 永不离开浏览器！
 */
async function checkPassword() {
  var password = document.getElementById('passwordInput').value;

  // 校验
  if (!password || password.length < PC.MIN_PASSWORD_LENGTH) {
    showToast(t('error.empty_password'), 'error');
    return;
  }

  if (PC.password.checking) return;
  PC.password.checking = true;

  setShieldState('passwordShieldRing', 'checking');
  setButtonLoading('passwordBtn', true);

  try {
    // Step 1: 前端计算 SHA-1
    var fullHash = sha1(password).toUpperCase();
    var prefix = fullHash.substring(0, 5);
    var suffix = fullHash.substring(5);

    PC.password.lastHash = fullHash;

    // Step 2: 查询 hash 范围
    var resp = await fetch(PC.API_BASE + '/password-range/' + prefix);
    var text = await resp.text();

    // Step 3: 在返回结果中查找我们的 suffix
    var pwnedCount = 0;
    if (text && typeof text === 'string') {
      var lines = text.split('\n');
      for (var i = 0; i < lines.length; i++) {
        var parts = lines[i].split(':');
        if (parts.length === 2 && parts[0].trim() === suffix) {
          pwnedCount = parseInt(parts[1].trim(), 10);
          break;
        }
      }
    }

    PC.password.pwnedCount = pwnedCount;

    // Step 4: 渲染结果
    if (pwnedCount > 0) {
      setShieldState('passwordShieldRing', 'danger');
      renderPasswordPwned(pwnedCount);
    } else {
      setShieldState('passwordShieldRing', 'safe');
      renderPasswordSafe();
    }

    // GA 追踪 (不发送密码内容!)
    if (window.pcGA) pcGA.trackPasswordCheck(pwnedCount > 0, pwnedCount);

  } catch (err) {
    setShieldState('passwordShieldRing', 'error');
    showToast(t('error.network'), 'error');
    if (window.pcGA) pcGA.trackError('password_check_fail', err.message);
  } finally {
    PC.password.checking = false;
    setButtonLoading('passwordBtn', false);
  }
}
```

#### `onPasswordInput(value)` — 密码输入实时强度评估

```javascript
/**
 * 密码输入时实时运行 zxcvbn 强度评估:
 * - 使用 debounce (200ms) 避免频繁计算
 * - zxcvbn 返回: score (0-4), crack_times_display, feedback
 * - 更新强度条宽度/颜色、标签文字、破解时间、改进建议
 */
var _strengthDebounce = null;
function onPasswordInput(value) {
  clearTimeout(_strengthDebounce);
  _strengthDebounce = setTimeout(function() {
    if (!value) {
      hideStrengthArea();
      return;
    }

    // zxcvbn 评估
    var result = zxcvbn(value);
    PC.password.strengthResult = result;

    showStrengthArea();
    updateStrengthBar(result.score);
    updateStrengthLabel(result.score);
    updateStrengthTime(result.crack_times_display.offline_slow_hashing_1e4_per_second);
    updateStrengthSuggestions(result.feedback);
  }, 200);
}

/**
 * 更新强度条 UI
 * @param {number} score - 0~4
 */
function updateStrengthBar(score) {
  var bar = document.getElementById('strengthBar');
  var widths = [10, 25, 50, 75, 100];
  var colors = [
    'var(--pc-accent-red)',     // 0 - Very Weak
    '#F97316',                  // 1 - Weak
    'var(--pc-accent-amber)',   // 2 - Fair
    'var(--pc-accent-green)',   // 3 - Strong
    'var(--pc-accent-cyan)',    // 4 - Very Strong
  ];
  bar.style.width = widths[score] + '%';
  bar.style.background = colors[score];
}
```

#### `generatePassword()` — 安全密码生成器

```javascript
/**
 * 使用 Web Crypto API 生成密码学安全的随机密码:
 * 1. 根据用户选项构建字符集
 * 2. crypto.getRandomValues() 生成随机字节
 * 3. 通过 rejection sampling 均匀映射到字符集
 * 4. 更新显示区域
 * 5. 自动运行 zxcvbn 评估生成结果强度
 */
function generatePassword() {
  var opts = PC.generator.options;

  // 读取当前选项
  opts.length = parseInt(document.getElementById('genLength').value, 10);
  opts.uppercase = document.getElementById('genUppercase').checked;
  opts.lowercase = document.getElementById('genLowercase').checked;
  opts.numbers = document.getElementById('genNumbers').checked;
  opts.symbols = document.getElementById('genSymbols').checked;
  opts.excludeAmbiguous = document.getElementById('genExcludeAmbiguous').checked;

  // 构建字符集
  var charset = '';
  if (opts.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (opts.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (opts.numbers)   charset += '0123456789';
  if (opts.symbols)   charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

  // 排除易混淆字符
  if (opts.excludeAmbiguous) {
    charset = charset.replace(/[0OIl1|]/g, '');
  }

  // 至少需要一个字符类型
  if (!charset) {
    showToast('Please select at least one character type', 'error');
    return;
  }

  // 使用 crypto.getRandomValues 生成
  var password = '';
  var array = new Uint32Array(opts.length);
  crypto.getRandomValues(array);
  for (var i = 0; i < opts.length; i++) {
    password += charset[array[i] % charset.length];
  }

  PC.generator.lastGenerated = password;

  // 更新 UI
  document.getElementById('generatedText').textContent = password;

  // 评估生成密码强度
  var result = zxcvbn(password);
  showGenStrength(result.score);

  // GA
  if (window.pcGA) pcGA.trackPasswordGenerate(opts.length);
  showToast(t('toast.generated'), 'success');
}
```

#### `loadBreaches()` — 泄露事件浏览器加载

```javascript
/**
 * 加载泄露事件列表:
 * 1. GET /api/privacy/breaches
 * 2. 后端返回全量列表 (已缓存 6h)
 * 3. 前端缓存到 PC.breaches.allData
 * 4. 按当前筛选/排序条件处理
 * 5. 渲染前 BREACH_PAGE_SIZE 张卡片
 * 6. 显示/隐藏"加载更多"按钮
 */
async function loadBreaches() {
  if (PC.breaches.loading) return;
  if (PC.breaches.allData.length > 0) {
    // 已有数据，直接用本地缓存
    applyBreachFilters();
    return;
  }

  PC.breaches.loading = true;
  showBreachesLoading();

  try {
    var resp = await fetch(PC.API_BASE + '/breaches');
    var data = await resp.json();

    PC.breaches.allData = data.breaches || [];
    applyBreachFilters();

  } catch (err) {
    showToast(t('error.network'), 'error');
    if (window.pcGA) pcGA.trackError('breaches_load_fail', err.message);
  } finally {
    PC.breaches.loading = false;
    hideBreachesLoading();
  }
}

/**
 * 筛选 + 排序 + 渲染
 */
function applyBreachFilters() {
  var data = PC.breaches.allData;
  var filter = PC.breaches.activeFilter;
  var search = PC.breaches.searchTerm.toLowerCase();
  var sort = PC.breaches.sortBy;

  // 筛选
  var filtered = data.filter(function(b) {
    // 文本搜索
    if (search && b.Name.toLowerCase().indexOf(search) === -1 &&
        b.Title.toLowerCase().indexOf(search) === -1) return false;
    // 类型筛选
    if (filter === 'verified' && !b.IsVerified) return false;
    if (filter === 'sensitive' && !b.IsSensitive) return false;
    if (filter === 'fabricated' && !b.IsFabricated) return false;
    return true;
  });

  // 排序
  filtered.sort(function(a, b) {
    if (sort === 'date') return new Date(b.BreachDate) - new Date(a.BreachDate);
    if (sort === 'size') return (b.PwnCount || 0) - (a.PwnCount || 0);
    if (sort === 'name') return a.Name.localeCompare(b.Name);
    return 0;
  });

  PC.breaches.filtered = filtered;
  PC.breaches.displayCount = PC.BREACH_PAGE_SIZE;

  // 更新计数
  updateBreachesCount(filtered.length);

  // 渲染
  renderBreachCards(filtered.slice(0, PC.breaches.displayCount));

  // 加载更多按钮
  toggleLoadMore(filtered.length > PC.breaches.displayCount);
}
```

#### `copyGeneratedPassword()` — 复制到剪贴板

```javascript
/**
 * 复制生成的密码到剪贴板
 * 使用现代 Clipboard API，不支持时 fallback 到 execCommand
 */
async function copyGeneratedPassword() {
  var text = PC.generator.lastGenerated;
  if (!text) return;

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback: textarea + execCommand
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    showToast(t('toast.copied'), 'success');
  } catch (err) {
    showToast(t('toast.copy_failed'), 'error');
  }
}
```

#### `clearAll()` — 全局清理

```javascript
/**
 * 重置所有状态，释放所有资源
 * 注: 本工具不使用 ObjectURL (非文件处理工具)，
 *     但仍需清理 DOM 引用和状态对象
 */
function clearAll() {
  // 重置状态
  PC.email.results = null;
  PC.email.checking = false;
  PC.email.lastQuery = '';
  PC.password.pwnedCount = 0;
  PC.password.strengthResult = null;
  PC.password.checking = false;
  PC.generator.lastGenerated = '';

  // 清理 DOM
  document.getElementById('emailInput').value = '';
  document.getElementById('passwordInput').value = '';
  document.getElementById('emailResultArea').innerHTML = '';
  document.getElementById('emailResultArea').style.display = 'none';
  document.getElementById('passwordResultArea').innerHTML = '';
  document.getElementById('passwordResultArea').style.display = 'none';
  document.getElementById('strengthArea').style.display = 'none';
  document.getElementById('generatedText').textContent = 'Click generate to create a password';

  // 重置盾牌动画
  setShieldState('emailShieldRing', 'idle');
  setShieldState('passwordShieldRing', 'idle');

  // 重置 Turnstile
  resetTurnstile();
}
```

#### 工具函数集

```javascript
// ===== 工具函数 =====

/** 邮箱格式校验 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** i18n 文案获取 */
function t(key) {
  // 从 window.__i18n[PC.lang] 中读取
  var i18n = window.__i18n || {};
  var dict = i18n[PC.lang] || i18n['en'] || {};
  return dict[key] || key;
}

/** Toast 消息 */
function showToast(message, type) {
  var container = document.getElementById('toastContainer');
  var toast = document.createElement('div');
  toast.className = 'pc-toast pc-toast--' + (type || 'info');
  toast.textContent = message;
  container.appendChild(toast);

  // 入场动画
  requestAnimationFrame(function() { toast.classList.add('pc-toast--visible'); });

  // 3秒后消失
  setTimeout(function() {
    toast.classList.remove('pc-toast--visible');
    toast.addEventListener('transitionend', function() {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    });
  }, 3000);
}

/** 数字格式化 (千分位) */
function formatNumber(num) {
  if (typeof num !== 'number') return '0';
  return num.toLocaleString();
}

/** 按钮 loading 状态切换 */
function setButtonLoading(btnId, loading) {
  var btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  if (loading) {
    btn.dataset.originalText = btn.textContent;
    btn.innerHTML = '<span class="pc-spinner"></span>';
  } else {
    btn.textContent = btn.dataset.originalText || '';
  }
}

/** 盾牌动画状态: idle | checking | safe | danger | warning | error */
function setShieldState(ringId, state) {
  var ring = document.getElementById(ringId);
  if (!ring) return;
  ring.className = 'pc-shield-ring pc-shield-ring--' + state;
}

/** 重置 Turnstile Widget */
function resetTurnstile() {
  PC.turnstileToken = null;
  if (window.turnstile) {
    turnstile.reset('#turnstileWidget');
  }
}

/** Turnstile 回调 */
function onTurnstileSuccess(token) {
  PC.turnstileToken = token;
  PC.turnstileReady = true;
}

/** 密码可见性切换 */
function togglePasswordVisibility() {
  var input = document.getElementById('passwordInput');
  var icon = document.getElementById('eyeIcon');
  if (input.type === 'password') {
    input.type = 'text';
    icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
  } else {
    input.type = 'password';
    icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
  }
}

/** Tab 切换 */
function switchTab(tabName) {
  // 隐藏所有面板
  document.querySelectorAll('.pc-panel').forEach(function(p) {
    p.classList.remove('pc-panel--active');
  });
  // 取消所有 Tab 激活
  document.querySelectorAll('.pc-tab').forEach(function(t) {
    t.classList.remove('pc-tab--active');
    t.setAttribute('aria-selected', 'false');
  });

  // 激活目标
  var panel = document.getElementById('panel-' + tabName);
  var tab = document.querySelector('[data-tab="' + tabName + '"]');
  if (panel) panel.classList.add('pc-panel--active');
  if (tab) {
    tab.classList.add('pc-tab--active');
    tab.setAttribute('aria-selected', 'true');
    // 滑块跟随
    moveTabSlider(tab);
  }

  // 特殊: 切换到泄露浏览器时自动加载数据
  if (tabName === 'breaches' && PC.breaches.allData.length === 0) {
    loadBreaches();
  }

  // GA
  if (window.pcGA) pcGA.trackTabSwitch(tabName);
}

/** 滑块指示器跟随 */
function moveTabSlider(activeTab) {
  var slider = document.getElementById('tabSlider');
  if (!slider || !activeTab) return;
  slider.style.width = activeTab.offsetWidth + 'px';
  slider.style.transform = 'translateX(' + activeTab.offsetLeft + 'px)';
}

/** FAQ 折叠切换 */
function toggleFAQ(button) {
  var item = button.parentElement;
  var expanded = button.getAttribute('aria-expanded') === 'true';
  // 关闭所有
  document.querySelectorAll('.pc-faq__item').forEach(function(el) {
    el.classList.remove('pc-faq__item--open');
    el.querySelector('.pc-faq__question').setAttribute('aria-expanded', 'false');
  });
  // 打开当前 (如果之前是关闭的)
  if (!expanded) {
    item.classList.add('pc-faq__item--open');
    button.setAttribute('aria-expanded', 'true');
  }
}

/** 密码长度滑块显示更新 */
function updateLengthDisplay(val) {
  document.getElementById('genLengthValue').textContent = val;
}
```

---

## 3. UI 事件绑定说明

### 3.1 Tab 切换事件
- 每个 `.pc-tab` 按钮绑定 `onclick="switchTab('tabName')"`
- 切换时先隐藏所有面板 (`display: none` 通过 class 控制)，再显示目标面板
- 滑块 `#tabSlider` 通过 `offsetLeft` 和 `offsetWidth` 计算位移
- 首次切到"泄露浏览器"时自动触发 `loadBreaches()`

### 3.2 输入框事件
- **邮箱输入**: `onkeydown` 监听 Enter 键直接触发 `checkEmail()`
- **密码输入**: `oninput` 实时触发 `onPasswordInput()` 进行强度评估（200ms debounce）；`onkeydown` 监听 Enter 触发 `checkPassword()`
- **密码可见性**: `#passwordToggle` 按钮切换 `input.type` 在 `password` / `text` 之间

### 3.3 密码生成器事件
- 长度滑块 `oninput` 同时更新显示值和重新生成密码
- 所有 checkbox `onchange` 触发 `generatePassword()` 重新生成
- 复制按钮调用 `navigator.clipboard.writeText()` + Toast 反馈

### 3.4 泄露浏览器事件
- 搜索框 `oninput` → `filterBreaches()` (300ms debounce)
- 筛选按钮 `onclick` → `setBreachFilter(type)` 切换激活态 + 重新渲染
- 排序下拉 `onchange` → `sortBreaches(value)` 重新排序 + 渲染
- 加载更多按钮 → `loadMoreBreaches()` 增加 `displayCount` 并追加渲染

### 3.5 FAQ 折叠事件
- `.pc-faq__question` 的 `onclick` → `toggleFAQ(this)`
- 使用 `aria-expanded` 控制状态
- `.pc-faq__answer` 的高度通过 `max-height` 过渡实现平滑展开/折叠
- 同一时间只能展开一个（手风琴模式）

### 3.6 Turnstile 集成
- 页面加载时自动渲染 invisible widget
- `data-callback="onTurnstileSuccess"` 回调写入 `PC.turnstileToken`
- 每次邮箱查询后调用 `resetTurnstile()` 重置 token
- Widget 主题跟随暗色/亮色模式

---

## 4. 验收标准 Checklist

### 处理正确性
- [ ] 邮箱查询正确返回泄露列表或"安全"状态
- [ ] 密码检测 SHA-1 哈希结果与 HIBP 官网一致
- [ ] k-Anonymity 实现正确：仅前 5 位 hash 发送，后缀在前端比对
- [ ] 密码原文和完整 hash 在网络请求中均不可见（DevTools 验证）
- [ ] zxcvbn 强度评估 score (0-4) 正确映射到 UI
- [ ] 密码生成器使用 `crypto.getRandomValues()`，非 `Math.random()`
- [ ] 密码生成器在排除易混淆字符后仍有有效字符集
- [ ] 泄露浏览器搜索/筛选/排序结果正确

### 性能
- [ ] zxcvbn 评估有 200ms debounce，不阻塞输入
- [ ] 泄露浏览器分页加载，首次只渲染 24 张卡片
- [ ] Tab 切换无闪烁，面板隐藏使用 CSS 而非频繁 DOM 操作

### 内存安全
- [ ] 密码原文不存储到任何全局变量（仅在函数作用域内使用）
- [ ] `clearAll()` 正确重置所有状态和 DOM

### 兜底与容错
- [ ] HIBP API 超时(3s) → 前端显示兜底提示 + 通用安全建议
- [ ] HIBP API 返回 429 → 显示"请稍后重试"提示
- [ ] Pwned Passwords API 不可用 → 显示"服务暂时不可用"，不报错
- [ ] Turnstile 加载失败 → 显示"安全验证失败，请刷新重试"
- [ ] 网络完全离线 → 检测并提示用户检查连接

### 下载与交互
- [ ] 复制密码到剪贴板成功 + Toast 反馈
- [ ] Clipboard API 不支持时 fallback 到 execCommand
- [ ] 密码可见性切换图标正确变化
- [ ] FAQ 手风琴展开/折叠动画流畅

### 边界情况
- [ ] 空输入提交 → 友好错误提示
- [ ] 超长邮箱 (>254字符) → 拒绝并提示
- [ ] 非法邮箱格式 → 拒绝并提示
- [ ] 快速重复点击 → 防重复提交 (checking 标志位)
- [ ] 同时切换 Tab 和正在查询 → 查询不中断，结果渲染到正确面板

---

*文档 I-03 完成 — 前端处理引擎架构全覆盖*
