// SMS 购买页面 - 三级联动选择器（服务 → 国家 → 运营商）

// ── 状态管理 ──────────────────────────────────
let selectedService  = null;
let selectedCountry  = null;
let selectedOperator = null;
let allServices      = [];
let allCountries     = [];
let allOperators     = [];

let loadingPlatform = false;
let loadingCountry  = false;
let loadingCarrier  = false;

/* ── Step 1: 加载服务列表 ──────────────────── */
async function loadServices() {
  loadingPlatform = true;
  try {
    const resp = await fetch('/api/sms/products');
    if (!resp.ok) throw new Error('加载服务失败');
    const data = await resp.json();
    allServices = data.products || [];
    renderServices(allServices);
  } catch (err) {
    showError('service-grid', '加载服务失败', () => loadServices());
  } finally {
    loadingPlatform = false;
  }
}

function renderServices(services) {
  const grid    = document.getElementById('service-grid');
  const loading = document.getElementById('service-loading');
  if (loading) loading.remove();
  if (!grid) return;

  if (services.length === 0) {
    grid.innerHTML = '<p class="empty-hint">未找到相关平台</p>';
    return;
  }

  grid.innerHTML = services.map(s => {
    const iconHtml = (typeof PlatformIconRegistry !== 'undefined')
      ? PlatformIconRegistry.render(s.id || s.name, 44)
      : `<div style="font-size:28px;line-height:1;">${s.icon || '📱'}</div>`;
    return `
      <div class="service-card ${s.id === selectedService?.id ? 'service-card--active' : ''}"
           onclick='selectService(${JSON.stringify(s).replace(/'/g, "\\'")})'
           data-id="${s.id}">
        <div class="service-card__icon">${iconHtml}</div>
        <span class="service-card__name">${s.name}</span>
      </div>`;
  }).join('');
}

function filterServices(query) {
  const q = query.trim().toLowerCase();
  renderServices(q ? allServices.filter(s =>
    s.name.toLowerCase().includes(q) || (s.id && s.id.toLowerCase().includes(q))
  ) : allServices);
}

function selectService(service) {
  selectedService  = service;
  selectedCountry  = null;
  selectedOperator = null;
  allCountries     = [];
  allOperators     = [];
  updateSummary();
  updateStepIndicator(2);
  updateBuyButton();
  showPanel('country');
  loadCountries(service.id);
}

/* ── Step 2: 加载国家列表 ──────────────────── */
async function loadCountries(serviceName) {
  const list = document.getElementById('country-list');
  if (!list) return;
  loadingCountry = true;
  list.innerHTML = '<div class="loading-hint">🔄 加载中...</div>';
  try {
    const resp = await fetch(`/api/sms/countries?service=${serviceName}`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    allCountries = data.countries || [];
    allCountries.length === 0
      ? showEmpty('country-list', '当前平台暂无可用国家')
      : renderCountries(allCountries);
  } catch (err) {
    showError('country-list', '加载国家失败，请重试', () => loadCountries(serviceName));
  } finally {
    loadingCountry = false;
  }
}

function renderCountries(countries) {
  const list = document.getElementById('country-list');
  if (!list) return;
  if (countries.length === 0) { list.innerHTML = '<p class="empty-hint">暂无可用国家</p>'; return; }
  list.innerHTML = countries.map(c => {
    const stockClass = c.count > 100 ? 'high' : (c.count > 0 ? 'normal' : 'none');
    return `
      <div class="country-item ${c.code === selectedCountry?.code ? 'country-item--active' : ''}"
           onclick='selectCountry(${JSON.stringify(c).replace(/'/g, "\\'")})'
           data-code="${c.code}">
        <span class="country-flag">${c.flag || '🌐'}</span>
        <span class="country-name">${c.name}</span>
        <span class="country-stock country-stock--${stockClass}">${c.count} 个</span>
      </div>`;
  }).join('');
}

function filterCountries(query) {
  const q = query.trim().toLowerCase();
  renderCountries(q ? allCountries.filter(c => c.name.toLowerCase().includes(q)) : allCountries);
}

function selectCountry(country) {
  selectedCountry  = country;
  selectedOperator = null;
  allOperators     = [];
  updateSummary();
  updateStepIndicator(3);
  updateBuyButton();
  showPanel('operator');
  loadOperators(selectedService.id, country.code);
}

/* ── Step 3: 加载运营商列表 ────────────────── */
async function loadOperators(serviceName, countryCode) {
  const tbody = document.getElementById('operator-list');
  if (!tbody) return;
  loadingCarrier = true;
  tbody.innerHTML = '<tr><td colspan="4" class="loading-hint">🔄 加载中...</td></tr>';
  try {
    const resp = await fetch(`/api/sms/operators?service=${serviceName}&country=${countryCode}`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    allOperators = data.operators || [];
    allOperators.length === 0
      ? tbody.innerHTML = '<tr><td colspan="4" class="empty-hint">当前国家暂无可用运营商</td></tr>'
      : renderOperators(allOperators);
  } catch (err) {
    tbody.innerHTML = `
      <tr><td colspan="4" class="error-hint">
        <p>❌ 加载运营商失败</p>
        <button onclick="loadOperators('${serviceName}','${countryCode}')" class="retry-btn">重试</button>
      </td></tr>`;
  } finally {
    loadingCarrier = false;
  }
}

function renderOperators(operators) {
  const tbody = document.getElementById('operator-list');
  if (!tbody) return;
  if (operators.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty-hint">暂无可用运营商</td></tr>';
    return;
  }
  tbody.innerHTML = operators.map(op => {
    const name       = op.operator || op.name || 'any';
    const count      = op.count ?? op.stock ?? 0;
    const stockClass = count > 50 ? 'in' : (count > 0 ? 'low' : 'out');
    const disabled   = count === 0 ? 'disabled' : '';
    return `
      <tr>
        <td><span class="operator-name">${name}</span></td>
        <td><span class="operator-price" style="color:#16a34a;font-weight:600;">免费</span></td>
        <td><span class="stock-badge stock-badge--${stockClass}">${count > 0 ? count + ' 个' : '无库存'}</span></td>
        <td>
          <button class="select-operator-btn" ${disabled}
                  onclick='selectOperator(${JSON.stringify(op).replace(/'/g, "\\'")})'>
            选择
          </button>
        </td>
      </tr>`;
  }).join('');
}

function selectOperator(operator) {
  selectedOperator = operator;
  updateSummary();
  updateBuyButton();
}

/* ── 购买按钮状态 ──────────────────────────── */
function updateBuyButton() {
  const btn = document.getElementById('buy-now-btn');
  if (!btn) return;
  const canBuy   = selectedService && selectedCountry && selectedOperator;
  const hasStock = selectedOperator && (selectedOperator.count > 0 || selectedOperator.stock > 0);
  btn.disabled = !canBuy || !hasStock;
  if      (!selectedService)  btn.textContent = '请选择服务';
  else if (!selectedCountry)  btn.textContent = '请选择国家';
  else if (!selectedOperator) btn.textContent = '请选择运营商';
  else if (!hasStock)         btn.textContent = '暂无库存';
  else                        btn.textContent = '🛒 获取号码';
}

/* ── 工具组件 ──────────────────────────────── */
function showError(containerId, message, retryFn) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `
    <div class="error-state">
      <div class="error-icon">❌</div>
      <p class="error-message">${message}</p>
      <button class="retry-btn">重试</button>
    </div>`;
  if (retryFn) el.querySelector('.retry-btn').onclick = retryFn;
}

function showEmpty(containerId, message) {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = `<div class="empty-state"><div class="empty-icon">📭</div><p class="empty-message">${message}</p></div>`;
}

function showPanel(name) {
  ['service', 'country', 'operator'].forEach(p => {
    const panel = document.getElementById(`panel-${p}`);
    if (panel) panel.style.display = p === name ? 'block' : 'none';
  });
}

function goBackToStep(step) {
  if (step === 1) {
    selectedService = selectedCountry = selectedOperator = null;
    updateStepIndicator(1);
    showPanel('service');
    renderServices(allServices);
  } else if (step === 2) {
    selectedCountry = selectedOperator = null;
    updateStepIndicator(2);
    showPanel('country');
    renderCountries(allCountries);
  }
  updateSummary();
}

function updateStepIndicator(activeStep) {
  document.querySelectorAll('.step-indicator').forEach((el, idx) => {
    const step = idx + 1;
    el.classList.remove('step-indicator--active', 'step-indicator--done');
    if (step < activeStep)   el.classList.add('step-indicator--done');
    if (step === activeStep) el.classList.add('step-indicator--active');
  });
}

function updateSummary() {
  const show = (id, val) => {
    const row   = document.getElementById(`summary-${id}`);
    const valEl = document.getElementById(`summary-${id}-val`);
    if (val && row && valEl) { row.style.display = 'flex'; valEl.textContent = val; }
    else if (row)            { row.style.display = 'none'; }
  };
  show('service',  selectedService?.name);
  show('country',  selectedCountry ? `${selectedCountry.flag || '🌐'} ${selectedCountry.name}` : null);
  show('operator', selectedOperator?.operator || selectedOperator?.name);
  updateBuyButton();
}

/* ── 初始化 ────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  loadServices();
  updateStepIndicator(1);
  showPanel('service');
  updateBuyButton();

  // URL 参数预选服务 ?service=whatsapp
  const preService = new URLSearchParams(location.search).get('service');
  if (preService) {
    const input = document.getElementById('service-search');
    if (input) {
      input.value = preService;
      setTimeout(() => {
        filterServices(preService);
        const matched = allServices.find(s => s.id?.toLowerCase() === preService.toLowerCase());
        if (matched) selectService(matched);
      }, 500);
    }
  }
});
