<!-- privacy-check-I-04_结果列表UI.md -->

# 🔒 隐私账号安全检测 — I-04 结果列表 UI

---

## 1. 竞品结果区 UI 对标表

| UI 要素 | HIBP | Mozilla Monitor | DeHashed | LeakCheck | **本次实现 (ToolboxNova)** |
|---------|------|-----------------|----------|-----------|---------------------------|
| **结果概览** | 纯文字数量统计 | 仪表盘风格卡片 | 表格行 | 表格行 | 安全仪表盘：风险环形图 + 数量统计 + 时间线 |
| **泄露卡片** | Logo + 名称 + 描述文字 | 品牌色标 + 步骤指引 | 表格一行 | 表格一行 | 三栏卡片：Logo/图标 + 信息列 + 操作按钮 + 严重性 Badge |
| **数据类型标签** | 纯文字列表 | 文字列表 | ❌ 无 | ❌ 无 | 彩色 Pill 标签 + 图标（密码/邮箱/电话/姓名/地址等） |
| **安全建议** | 页脚通用文案 | 每条泄露有步骤指引 | ❌ 无 | ❌ 无 | 智能建议面板：根据泄露数据类型动态推荐操作 |
| **风险等级** | ❌ 无分级 | ❌ 无分级 | ❌ 无分级 | ❌ 无分级 | 四级风险标签：Critical/High/Medium/Low + 对应色值 |
| **泄露详情弹窗** | 点击展开描述 | 跳转详情页 | 付费查看 | 付费查看 | 模态弹窗：完整描述 + 数据类型 + 时间线 + 行动指南 |
| **密码结果** | 数字计数 + 红色/绿色文字 | ❌ 无 | 表格 | 表格 | 盾牌动画 + 大字数字 + 强度条 + 建议面板 |
| **泄露浏览器卡片** | 简洁列表页 | ❌ 无 | ❌ 无 | ❌ 无 | 热力色网格卡片 + Logo + 规模标签 + 数据类型 Pill |
| **动画效果** | 无动画 | 简单淡入 | 无动画 | 无动画 | stagger 淡入 + 卡片 hover 浮起 + 风险脉冲 |

---

## 2. 结果卡片渲染说明

### 2.1 邮箱查询结果 — `renderEmailResults(data)`

#### 安全结果（无泄露）

```javascript
/**
 * 渲染"安全"结果卡片
 * 布局: 居中绿色盾牌图标 + 标题 + 说明 + 安全习惯建议
 */
function renderEmailSafe() {
  var area = document.getElementById('emailResultArea');
  area.style.display = 'block';
  area.innerHTML = `
    <div class="pc-result-safe" data-anim="fade-up">
      <div class="pc-result-safe__icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
             stroke="var(--pc-accent-green)" stroke-width="1.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="M9 12l2 2 4-4" stroke-width="2"/>
        </svg>
      </div>
      <h3 class="pc-result-safe__title">${t('email.safe_title')}</h3>
      <p class="pc-result-safe__desc">${t('email.safe_desc')}</p>
    </div>
  `;
  animateIn(area);
}
```

#### 泄露结果

```javascript
/**
 * 渲染泄露结果:
 * 1. 顶部概览区: 风险统计 + 泄露数量 + 最早/最晚泄露日期
 * 2. 泄露卡片列表: 逐张 stagger 渲染
 * 3. 底部安全建议面板
 *
 * @param {Object} data - { breaches: [...], count: N }
 */
function renderEmailBreached(data) {
  var area = document.getElementById('emailResultArea');
  area.style.display = 'block';

  var breaches = data.breaches || [];
  var riskLevel = calcRiskLevel(breaches);

  // ===== 概览区 =====
  var overviewHTML = `
    <div class="pc-result-overview" data-anim="fade-up">
      <div class="pc-result-overview__header">
        <div class="pc-risk-badge pc-risk-badge--${riskLevel.key}">
          ${t('result.risk_' + riskLevel.key)}
        </div>
        <h3 class="pc-result-overview__title">
          ${t('email.pwned_title')}
        </h3>
        <p class="pc-result-overview__desc">
          ${t('email.pwned_desc').replace('{count}', breaches.length)}
        </p>
      </div>
      <div class="pc-result-overview__stats">
        <div class="pc-stat">
          <span class="pc-stat__number">${breaches.length}</span>
          <span class="pc-stat__label">${t('email.breach_card_date')}</span>
        </div>
        <div class="pc-stat">
          <span class="pc-stat__number">${formatNumber(totalRecords(breaches))}</span>
          <span class="pc-stat__label">${t('email.breach_card_records')}</span>
        </div>
        <div class="pc-stat">
          <span class="pc-stat__number">${uniqueDataClasses(breaches)}</span>
          <span class="pc-stat__label">${t('email.breach_card_data')}</span>
        </div>
      </div>
    </div>
  `;

  // ===== 泄露卡片列表 =====
  var cardsHTML = '<div class="pc-breach-list">';
  breaches.forEach(function(breach, index) {
    cardsHTML += buildBreachCard(breach, index);
  });
  cardsHTML += '</div>';

  // ===== 安全建议面板 =====
  var adviceHTML = buildAdvicePanel(breaches);

  area.innerHTML = overviewHTML + cardsHTML + adviceHTML;
  staggerAnimateIn(area.querySelectorAll('[data-anim]'));
}
```

### 2.2 泄露卡片 — `buildBreachCard(breach, index)`

```javascript
/**
 * 单张泄露事件卡片
 *
 * 布局: 三栏 grid
 * ┌──────────┬──────────────────────────┬──────────┐
 * │  64x64   │ 名称 / 日期 / 记录数     │ 详情按钮  │
 * │  Logo    │ 数据类型 Pill 标签组      │ 风险Badge │
 * └──────────┴──────────────────────────┴──────────┘
 *
 * 进入动画: opacity 0→1 + translateY(12px→0)
 * 延迟: index * 80ms (stagger)
 */
function buildBreachCard(breach, index) {
  var logoURL = breach.LogoPath
    ? 'https://haveibeenpwned.com' + breach.LogoPath
    : null;

  var riskClass = getBreachRiskClass(breach);
  var dateStr = formatBreachDate(breach.BreachDate);
  var pillsHTML = buildDataClassPills(breach.DataClasses || []);

  return `
    <div class="pc-breach-card" data-anim="fade-up"
         style="animation-delay: ${index * 80}ms"
         onclick="openBreachDetail('${breach.Name}')">

      <!-- 列1: Logo -->
      <div class="pc-breach-card__logo">
        ${logoURL
          ? '<img src="' + logoURL + '" alt="' + breach.Title + '" width="48" height="48" loading="lazy">'
          : '<div class="pc-breach-card__logo-placeholder">' + breach.Name.charAt(0).toUpperCase() + '</div>'
        }
      </div>

      <!-- 列2: 信息 -->
      <div class="pc-breach-card__info">
        <h4 class="pc-breach-card__name">${escapeHTML(breach.Title || breach.Name)}</h4>
        <div class="pc-breach-card__meta">
          <span class="pc-breach-card__date">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            ${dateStr}
          </span>
          <span class="pc-breach-card__count">
            ${formatNumber(breach.PwnCount || 0)} records
          </span>
        </div>
        <div class="pc-breach-card__pills">${pillsHTML}</div>
      </div>

      <!-- 列3: 操作 -->
      <div class="pc-breach-card__actions">
        <span class="pc-risk-badge pc-risk-badge--${riskClass}">
          ${t('result.risk_' + riskClass)}
        </span>
        <button class="pc-btn pc-btn--ghost pc-btn--sm"
                onclick="event.stopPropagation(); openBreachDetail('${breach.Name}')">
          ${t('common.learn_more')}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </div>
  `;
}
```

### 2.3 四种卡片状态 (泄露浏览器卡片)

| 状态 | DOM 表现 | 视觉特征 |
|------|---------|---------|
| **loading** | 骨架屏占位：灰色矩形 `pulse` 动画 | 3 个骨架卡片行，Logo/标题/Pill 位置用灰色块占位 |
| **normal** | 完整卡片渲染（见 buildBreachCard） | 白色/暗色卡片 + Logo + 信息 + Pills |
| **hover** | `transform: translateY(-4px)` + `box-shadow` 增强 | 微浮起效果 + 阴影加深 |
| **error** | 错误提示卡片 + 重试按钮 | 红色边框 + 错误图标 + "重试"按钮 |

### 2.4 数据类型 Pill 标签

```javascript
/**
 * 将 HIBP DataClasses 数组转为彩色 Pill 标签
 * 每种数据类型有对应图标和颜色
 */
var DATA_CLASS_MAP = {
  'Passwords':        { icon: '🔑', color: 'red' },
  'Email addresses':  { icon: '📧', color: 'cyan' },
  'Phone numbers':    { icon: '📱', color: 'amber' },
  'Names':            { icon: '👤', color: 'blue' },
  'IP addresses':     { icon: '🌐', color: 'purple' },
  'Physical addresses': { icon: '📍', color: 'green' },
  'Dates of birth':   { icon: '🎂', color: 'pink' },
  'Usernames':        { icon: '🏷️', color: 'teal' },
  'Credit cards':     { icon: '💳', color: 'red' },
  'Social security numbers': { icon: '🆔', color: 'red' },
};

function buildDataClassPills(classes) {
  return classes.slice(0, 5).map(function(cls) {
    var meta = DATA_CLASS_MAP[cls] || { icon: '📄', color: 'gray' };
    return '<span class="pc-pill pc-pill--' + meta.color + '">'
      + meta.icon + ' ' + escapeHTML(cls)
      + '</span>';
  }).join('') + (classes.length > 5
    ? '<span class="pc-pill pc-pill--gray">+' + (classes.length - 5) + '</span>'
    : '');
}
```

### 2.5 风险等级计算

```javascript
/**
 * 根据泄露事件列表计算综合风险等级
 * 规则:
 * - 任何泄露含 Passwords/Credit cards/SSN → Critical
 * - 泄露数 >= 5 或 任一泄露 PwnCount > 1亿 → High
 * - 泄露数 >= 2 → Medium
 * - 其他 → Low
 */
function calcRiskLevel(breaches) {
  var hasCriticalData = breaches.some(function(b) {
    var classes = b.DataClasses || [];
    return classes.indexOf('Passwords') !== -1
      || classes.indexOf('Credit cards') !== -1
      || classes.indexOf('Social security numbers') !== -1;
  });

  if (hasCriticalData) return { key: 'critical', score: 4 };

  var hasLargeBreach = breaches.some(function(b) {
    return (b.PwnCount || 0) > 100000000;
  });

  if (breaches.length >= 5 || hasLargeBreach) return { key: 'high', score: 3 };
  if (breaches.length >= 2) return { key: 'medium', score: 2 };
  return { key: 'low', score: 1 };
}
```

### 2.6 卡片进入动画

```css
/* stagger 淡入动画 */
[data-anim="fade-up"] {
  opacity: 0;
  transform: translateY(12px);
  animation: pcFadeUp 0.4s ease forwards;
}

@keyframes pcFadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* JS 中通过 animation-delay 实现 stagger */
```

```javascript
function staggerAnimateIn(elements) {
  elements.forEach(function(el, i) {
    el.style.animationDelay = (i * 80) + 'ms';
  });
}
```

---

## 3. 泄露详情弹窗 — `openBreachDetail(breachName)`

### 3.1 弹窗结构

```javascript
/**
 * 泄露事件详情弹窗
 *
 * 结构:
 * ┌─────────────────────────────────────────┐
 * │ [遮罩层 - 点击关闭]                      │
 * │  ┌───────────────────────────────────┐  │
 * │  │ 标题栏: Logo + 名称 + 关闭按钮    │  │
 * │  ├───────────────────────────────────┤  │
 * │  │ 概览区:                           │  │
 * │  │ - 泄露日期 / 收录日期 / 记录数     │  │
 * │  │ - 风险等级 Badge                  │  │
 * │  │ - 验证/敏感/伪造 状态标签          │  │
 * │  ├───────────────────────────────────┤  │
 * │  │ 数据类型标签组 (Pill)              │  │
 * │  ├───────────────────────────────────┤  │
 * │  │ 事件描述 (HTML渲染)               │  │
 * │  ├───────────────────────────────────┤  │
 * │  │ 安全建议 (根据数据类型动态生成)     │  │
 * │  ├───────────────────────────────────┤  │
 * │  │ 底部: 关闭按钮                     │  │
 * │  └───────────────────────────────────┘  │
 * └─────────────────────────────────────────┘
 *
 * 打开动画: 遮罩 opacity 0→1, 模态框 scale(0.95)→scale(1) + opacity
 * 关闭: ESC 键 / 点击遮罩 / 点击关闭按钮
 */
function openBreachDetail(breachName) {
  // 从缓存或当前结果中查找泄露数据
  var breach = findBreachByName(breachName);
  if (!breach) return;

  var modal = document.createElement('div');
  modal.className = 'pc-modal-overlay';
  modal.id = 'breachDetailModal';
  modal.onclick = function(e) {
    if (e.target === modal) closeBreachDetail();
  };

  var riskClass = getBreachRiskClass(breach);
  var pillsHTML = buildDataClassPills(breach.DataClasses || []);
  var adviceItems = generateAdviceForBreach(breach);

  modal.innerHTML = `
    <div class="pc-modal" role="dialog" aria-modal="true">
      <!-- 标题栏 -->
      <div class="pc-modal__header">
        <div class="pc-modal__header-left">
          ${breach.LogoPath
            ? '<img src="https://haveibeenpwned.com' + breach.LogoPath + '" width="40" height="40" alt="">'
            : '<div class="pc-breach-card__logo-placeholder pc-breach-card__logo-placeholder--lg">'
              + breach.Name.charAt(0) + '</div>'}
          <h2 class="pc-modal__title">${escapeHTML(breach.Title || breach.Name)}</h2>
        </div>
        <button class="pc-modal__close" onclick="closeBreachDetail()" aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- 概览区 -->
      <div class="pc-modal__overview">
        <div class="pc-modal__meta-grid">
          <div class="pc-modal__meta-item">
            <span class="pc-modal__meta-label">${t('email.breach_card_date')}</span>
            <span class="pc-modal__meta-value">${formatBreachDate(breach.BreachDate)}</span>
          </div>
          <div class="pc-modal__meta-item">
            <span class="pc-modal__meta-label">${t('email.breach_card_records')}</span>
            <span class="pc-modal__meta-value">${formatNumber(breach.PwnCount || 0)}</span>
          </div>
          <div class="pc-modal__meta-item">
            <span class="pc-modal__meta-label">${t('result.risk_level')}</span>
            <span class="pc-risk-badge pc-risk-badge--${riskClass}">
              ${t('result.risk_' + riskClass)}
            </span>
          </div>
        </div>
        <div class="pc-modal__status-tags">
          ${breach.IsVerified ? '<span class="pc-status-tag pc-status-tag--green">Verified</span>' : ''}
          ${breach.IsSensitive ? '<span class="pc-status-tag pc-status-tag--amber">Sensitive</span>' : ''}
          ${breach.IsFabricated ? '<span class="pc-status-tag pc-status-tag--red">Fabricated</span>' : ''}
          ${breach.IsSpamList ? '<span class="pc-status-tag pc-status-tag--gray">Spam List</span>' : ''}
        </div>
      </div>

      <!-- 数据类型 -->
      <div class="pc-modal__section">
        <h3 class="pc-modal__section-title">${t('email.breach_card_data')}</h3>
        <div class="pc-modal__pills">${pillsHTML}</div>
      </div>

      <!-- 描述 -->
      <div class="pc-modal__section">
        <h3 class="pc-modal__section-title">${t('email.breach_card_desc')}</h3>
        <div class="pc-modal__description">${breach.Description || ''}</div>
      </div>

      <!-- 安全建议 -->
      <div class="pc-modal__section pc-modal__section--advice">
        <h3 class="pc-modal__section-title">${t('result.action_title')}</h3>
        <ul class="pc-advice-list">
          ${adviceItems.map(function(a) {
            return '<li class="pc-advice-item"><span class="pc-advice-icon">' + a.icon + '</span>'
              + '<span>' + a.text + '</span></li>';
          }).join('')}
        </ul>
      </div>

      <!-- 底部 -->
      <div class="pc-modal__footer">
        <button class="pc-btn pc-btn--outline" onclick="closeBreachDetail()">
          ${t('common.close')}
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // 打开动画
  requestAnimationFrame(function() {
    modal.classList.add('pc-modal-overlay--visible');
  });

  // ESC 关闭
  document.addEventListener('keydown', _modalEscHandler);
}

function closeBreachDetail() {
  var modal = document.getElementById('breachDetailModal');
  if (!modal) return;
  modal.classList.remove('pc-modal-overlay--visible');
  modal.addEventListener('transitionend', function() {
    if (modal.parentNode) modal.parentNode.removeChild(modal);
  });
  document.removeEventListener('keydown', _modalEscHandler);
}

function _modalEscHandler(e) {
  if (e.key === 'Escape') closeBreachDetail();
}
```

### 3.2 智能安全建议生成

```javascript
/**
 * 根据泄露的数据类型动态生成安全建议
 * 不同数据类型触发不同的建议组合
 */
function generateAdviceForBreach(breach) {
  var classes = breach.DataClasses || [];
  var advice = [];

  // 密码泄露 → 最高优先级
  if (classes.indexOf('Passwords') !== -1) {
    advice.push({ icon: '🔑', text: t('advice.change_password') });
    advice.push({ icon: '🔐', text: t('advice.enable_2fa') });
    advice.push({ icon: '🔄', text: t('advice.check_reuse') });
    advice.push({ icon: '🗄️', text: t('advice.use_manager') });
  }

  // 邮箱泄露
  if (classes.indexOf('Email addresses') !== -1) {
    advice.push({ icon: '🎣', text: t('advice.phishing_alert') });
  }

  // 金融数据泄露
  if (classes.indexOf('Credit cards') !== -1 ||
      classes.indexOf('Bank account numbers') !== -1) {
    advice.push({ icon: '🏦', text: t('advice.freeze_credit') });
  }

  // 通用建议
  advice.push({ icon: '👁️', text: t('advice.monitor_account') });

  // 去重并限制最多 6 条
  return advice.slice(0, 6);
}
```

---

## 4. 密码检测结果 UI

### 4.1 密码已泄露

```javascript
function renderPasswordPwned(count) {
  var area = document.getElementById('passwordResultArea');
  area.style.display = 'block';
  area.innerHTML = `
    <div class="pc-result-pwned" data-anim="fade-up">
      <div class="pc-result-pwned__icon">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none"
             stroke="var(--pc-accent-red)" stroke-width="1.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <h3 class="pc-result-pwned__title">${t('password.pwned_title')}</h3>
      <div class="pc-result-pwned__count">
        <span class="pc-result-pwned__number">${formatNumber(count)}</span>
        <span class="pc-result-pwned__unit">times</span>
      </div>
      <p class="pc-result-pwned__desc">
        ${t('password.pwned_desc').replace('{count}', formatNumber(count))}
      </p>
      <div class="pc-result-pwned__advice">
        <div class="pc-advice-item"><span>🔑</span> ${t('advice.change_password')}</div>
        <div class="pc-advice-item"><span>🔐</span> ${t('advice.enable_2fa')}</div>
        <div class="pc-advice-item"><span>🔄</span> ${t('advice.check_reuse')}</div>
      </div>
      <button class="pc-btn pc-btn--primary pc-btn--large"
              onclick="switchTab('generator')">
        ${t('generator.generate_btn')} →
      </button>
    </div>
  `;
  animateIn(area);
}
```

### 4.2 密码安全

```javascript
function renderPasswordSafe() {
  var area = document.getElementById('passwordResultArea');
  area.style.display = 'block';
  area.innerHTML = `
    <div class="pc-result-safe" data-anim="fade-up">
      <div class="pc-result-safe__icon">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none"
             stroke="var(--pc-accent-green)" stroke-width="1.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="M9 12l2 2 4-4" stroke-width="2"/>
        </svg>
      </div>
      <h3 class="pc-result-safe__title">${t('password.safe_title')}</h3>
      <p class="pc-result-safe__desc">${t('password.safe_desc')}</p>
    </div>
  `;
  animateIn(area);
}
```

---

## 5. 泄露浏览器卡片 — 网格渲染

```javascript
/**
 * 渲染泄露浏览器的网格卡片
 * 每张卡片背景热力色根据泄露规模计算
 *
 * @param {Array} breaches - 泄露事件列表(已筛选+排序)
 */
function renderBreachCards(breaches) {
  var grid = document.getElementById('breachesGrid');

  if (breaches.length === 0) {
    grid.innerHTML = '<div class="pc-empty-state">'
      + '<p>' + t('breaches.no_results') + '</p></div>';
    return;
  }

  grid.innerHTML = breaches.map(function(b, i) {
    var heatAlpha = Math.min((b.PwnCount || 0) / 100000000, 0.25);
    var heatBg = 'rgba(239, 68, 68, ' + heatAlpha.toFixed(3) + ')';
    var logoHTML = b.LogoPath
      ? '<img src="https://haveibeenpwned.com' + b.LogoPath + '" width="40" height="40" loading="lazy" alt="">'
      : '<div class="pc-breach-grid-card__initial">' + b.Name.charAt(0) + '</div>';

    return `
      <div class="pc-breach-grid-card" data-anim="fade-up"
           style="animation-delay:${i * 50}ms; background: linear-gradient(135deg, var(--pc-surface) 0%, ${heatBg} 100%);"
           onclick="openBreachDetail('${b.Name}')">
        <div class="pc-breach-grid-card__header">
          ${logoHTML}
          <div>
            <h4 class="pc-breach-grid-card__name">${escapeHTML(b.Title || b.Name)}</h4>
            <span class="pc-breach-grid-card__date">${formatBreachDate(b.BreachDate)}</span>
          </div>
        </div>
        <div class="pc-breach-grid-card__count">
          ${formatCompactNumber(b.PwnCount || 0)} accounts
        </div>
        <div class="pc-breach-grid-card__pills">
          ${buildDataClassPills((b.DataClasses || []).slice(0, 3))}
        </div>
      </div>
    `;
  }).join('');
}

/** 大数字压缩 (1200000 → 1.2M) */
function formatCompactNumber(num) {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return String(num);
}
```

---

## 6. CSS 规范 (结果区 + 弹窗)

### 结果卡片

```
.pc-breach-card:
  display: grid
  grid-template-columns: 56px 1fr auto
  gap: 16px
  padding: 16px 20px
  background: var(--pc-surface)
  border: 1px solid var(--pc-border)
  border-radius: var(--pc-radius-md)
  cursor: pointer
  transition: transform var(--pc-transition-fast), box-shadow var(--pc-transition-fast)

  &:hover:
    transform: translateY(-2px)
    box-shadow: var(--pc-shadow-md)

.pc-risk-badge:
  display: inline-flex
  padding: 2px 10px
  border-radius: var(--pc-radius-full)
  font-size: 0.75rem
  font-weight: 600

  --critical: bg rgba(239,68,68,0.15) + text #EF4444
  --high:     bg rgba(245,158,11,0.15) + text #F59E0B
  --medium:   bg rgba(6,182,212,0.15)  + text #06B6D4
  --low:      bg rgba(16,185,129,0.15) + text #10B981

.pc-pill:
  display: inline-flex
  align-items: center
  gap: 4px
  padding: 2px 8px
  border-radius: var(--pc-radius-full)
  font-size: 0.7rem
  background: var(--pc-bg-tertiary)
  white-space: nowrap
```

### 弹窗

```
.pc-modal-overlay:
  position: fixed
  inset: 0
  z-index: 1000
  background: rgba(0,0,0,0.7)
  backdrop-filter: blur(4px)
  display: flex
  align-items: center
  justify-content: center
  opacity: 0
  transition: opacity 0.25s ease

  &--visible:
    opacity: 1
    .pc-modal:
      transform: scale(1)
      opacity: 1

.pc-modal:
  background: var(--pc-bg-secondary)
  border: 1px solid var(--pc-border)
  border-radius: var(--pc-radius-lg)
  max-width: 640px
  width: 90vw
  max-height: 85vh
  overflow-y: auto
  padding: 24px
  transform: scale(0.95)
  opacity: 0
  transition: transform 0.25s ease, opacity 0.25s ease
```

### 泄露浏览器卡片网格

```
.pc-breaches-grid:
  display: grid
  grid-template-columns: repeat(3, 1fr)    /* 桌面 */
  gap: 16px

  @media (max-width: 1024px):
    grid-template-columns: repeat(2, 1fr)  /* 平板 */

  @media (max-width: 640px):
    grid-template-columns: 1fr             /* 手机 */

.pc-breach-grid-card:
  padding: 16px
  border: 1px solid var(--pc-border)
  border-radius: var(--pc-radius-md)
  cursor: pointer
  transition: transform var(--pc-transition-fast), box-shadow var(--pc-transition-fast)

  &:hover:
    transform: translateY(-4px)
    box-shadow: var(--pc-shadow-lg)
```

---

## 7. 完整数据流 & 函数调用图

### 7.1 邮箱查询数据流

```
用户输入邮箱 → [Enter] / 点击按钮
  │
  ├─ isValidEmail() 校验
  │   └─ 失败 → showToast(错误) → END
  │
  ├─ 检查 PC.turnstileToken
  │   └─ 无 → showToast(验证失败) → END
  │
  ├─ setShieldState('checking') → setButtonLoading(true)
  │
  ├─ fetch POST /api/privacy/check-email
  │   │
  │   ├─[Go后端]→ 校验 Turnstile Token
  │   ├─[Go后端]→ RateLimit 检查
  │   ├─[Go后端]→ 调用 HIBP API v3
  │   │   ├─ 200 → 返回 { breaches: [...] }
  │   │   ├─ 404 → 返回 { safe: true }
  │   │   ├─ 429 → 返回 { fallback: true, retryAfter }
  │   │   └─ 超时/5xx → 返回 { fallback: true, advice: [...] }
  │   │
  │   └─ 返回前端
  │
  ├─ 解析响应:
  │   ├─ safe=true → setShieldState('safe') → renderEmailSafe()
  │   ├─ breaches.length > 0 → setShieldState('danger') → renderEmailBreached()
  │   │   ├─ calcRiskLevel() → 概览区
  │   │   ├─ buildBreachCard() × N → 卡片列表
  │   │   └─ buildAdvicePanel() → 安全建议
  │   └─ fallback=true → setShieldState('warning') → renderEmailFallback()
  │
  ├─ pcGA.trackEmailCheck()
  │
  └─ setButtonLoading(false) → resetTurnstile()
```

### 7.2 密码检测数据流

```
用户输入密码 → oninput (实时)
  │
  ├─ onPasswordInput() [200ms debounce]
  │   └─ zxcvbn(password) → updateStrengthBar/Label/Time/Suggestions
  │
  └─ [Enter] / 点击按钮 → checkPassword()
       │
       ├─ sha1(password) → fullHash (前端计算, 密码不出浏览器!)
       ├─ prefix = fullHash[0:5], suffix = fullHash[5:]
       │
       ├─ fetch GET /api/privacy/password-range/{prefix}
       │   │
       │   ├─[Go后端]→ 校验 prefix 格式 (5位hex)
       │   ├─[Go后端]→ 调用 api.pwnedpasswords.com/range/{prefix}
       │   │   └─ 返回 ~800 行 "SUFFIX:COUNT"
       │   └─ 原样返回前端 (text/plain)
       │
       ├─ 遍历返回行，查找 suffix 匹配
       │   ├─ 找到 → pwnedCount = N → renderPasswordPwned(N)
       │   └─ 未找到 → pwnedCount = 0 → renderPasswordSafe()
       │
       └─ pcGA.trackPasswordCheck()
```

### 7.3 泄露浏览器数据流

```
用户切换到 "Breach Browser" Tab
  │
  ├─ switchTab('breaches')
  │   └─ PC.breaches.allData 为空 → loadBreaches()
  │
  ├─ fetch GET /api/privacy/breaches
  │   ├─[Go后端]→ 检查内存缓存 (6h TTL)
  │   │   ├─ 命中 → 返回缓存
  │   │   └─ 未命中 → 调用 HIBP /api/v3/breaches → 写缓存 → 返回
  │   └─ 失败 → 返回本地兜底数据
  │
  ├─ PC.breaches.allData = response.breaches
  │
  ├─ applyBreachFilters()
  │   ├─ 文本搜索过滤
  │   ├─ 类型筛选过滤 (verified/sensitive/fabricated)
  │   ├─ 排序 (date/size/name)
  │   ├─ 截取前 BREACH_PAGE_SIZE 条
  │   └─ renderBreachCards(filtered)
  │
  └─ 用户操作:
      ├─ 搜索输入 → filterBreaches() [300ms debounce]
      ├─ 筛选点击 → setBreachFilter() → applyBreachFilters()
      ├─ 排序变更 → sortBreaches() → applyBreachFilters()
      ├─ 加载更多 → displayCount += PAGE_SIZE → 追加渲染
      └─ 点击卡片 → openBreachDetail(name) → 弹窗
```

---

## 8. 验收标准 Checklist

### 邮箱结果 UI
- [ ] 安全结果显示绿色盾牌 + 鼓励文案
- [ ] 泄露结果显示概览区（数量/总记录/数据类型统计）
- [ ] 风险等级 Badge 根据泄露内容动态计算（Critical/High/Medium/Low）
- [ ] 泄露卡片三栏布局正确：Logo + 信息 + 操作
- [ ] 数据类型 Pill 标签颜色和图标正确对应
- [ ] 卡片 stagger 淡入动画流畅，延迟递增
- [ ] 安全建议根据泄露数据类型动态生成

### 密码结果 UI
- [ ] 已泄露结果显示红色盾牌 + 出现次数大字
- [ ] 提供跳转到密码生成器的按钮
- [ ] 安全结果显示绿色盾牌 + 提示文案
- [ ] 强度条 5 段色值和标签正确

### 泄露详情弹窗
- [ ] 弹窗包含完整信息：概览/数据类型/描述/建议
- [ ] 打开动画 scale(0.95→1) + opacity 流畅
- [ ] ESC 键可关闭
- [ ] 点击遮罩层可关闭
- [ ] 关闭后 DOM 正确移除
- [ ] 弹窗内容可滚动（max-height: 85vh）
- [ ] 移动端弹窗宽度 90vw 正确适配

### 泄露浏览器
- [ ] 网格卡片 3/2/1 列响应式正确
- [ ] 热力色根据 PwnCount 正确计算深浅
- [ ] 搜索框实时过滤（300ms debounce）
- [ ] 筛选按钮切换激活态 + 重新渲染
- [ ] 排序（日期/规模/名称）结果正确
- [ ] "加载更多"按钮正确显示/隐藏
- [ ] 无结果时显示空状态提示
- [ ] 总数量计数更新正确

### 批量下载 & 交互
- [ ] 复制密码到剪贴板 + Toast 反馈
- [ ] 所有按钮防重复点击
- [ ] 弱网环境下 loading 状态正确显示
- [ ] 所有 XSS 风险点使用 `escapeHTML()` 过滤

### 边界情况
- [ ] HIBP 返回空描述 → 不渲染描述区域
- [ ] Logo 加载失败 → 显示首字母占位符
- [ ] 超过 500 个泄露事件 → 分页加载不卡顿
- [ ] 数据类型超过 5 个 → 显示 "+N" 折叠标签
- [ ] 兜底数据 → 正确显示通用建议面板

---

*文档 I-04 完成 — 结果列表 UI 全覆盖*
