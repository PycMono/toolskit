// SMS 价格列表 - 角标分页 + 搜索防抖 + 国家筛选
'use strict';

let priceCurrentPage = 1;
let priceTotalPages  = 1;
let priceTotalCount  = 0;
let priceIsLoading   = false;
let priceSearchTimer = null;
let priceHistory     = {};
const PRICE_PAGE_SIZE = 20;

/* ── 历史走势数据（用于弹窗）─────────────── */
function generatePriceHistory() {
  const platforms = ['whatsapp','telegram','google','facebook','instagram'];
  const ctys      = ['united states','united kingdom','germany','france','india'];
  const hist = {};
  platforms.forEach(p => {
    ctys.forEach(c => {
      const key = `${p}-${c}`;
      hist[key] = [];
      let base = 0.10 + Math.random() * 0.40;
      for (let i = 29; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        base = Math.max(0.05, base * (1 + (Math.random() - 0.5) * 0.1));
        hist[key].push({ date: d.toISOString().split('T')[0], price: parseFloat(base.toFixed(4)) });
      }
    });
  });
  return hist;
}

/* ── 填充国家下拉（调专用接口）────────────── */
async function loadCountryOptions() {
  const sel = document.getElementById('country-filter');
  if (!sel || sel.dataset.loaded) return;
  sel.dataset.loaded = '1';

  try {
    const resp = await fetch('/api/sms/price-countries');
    if (!resp.ok) throw new Error('failed');
    const data = await resp.json();
    const clist = data.countries || [];
    clist.forEach(c => {
      const opt = document.createElement('option');
      opt.value = (c.code || '').toLowerCase();
      opt.textContent = `${c.flag || ''} ${c.name || c.code}`;
      sel.appendChild(opt);
    });
  } catch (e) {
    console.warn('加载国家下拉失败:', e);
  }
}

/* ── 加载指定页数据 ───────────────────────── */
async function loadPricePage(page) {
  if (priceIsLoading) return;
  priceIsLoading = true;
  priceCurrentPage = page;
  showPriceLoading();

  const q       = (document.getElementById('price-search')?.value || '').trim();
  const country = document.getElementById('country-filter')?.value || '';

  const params = new URLSearchParams({ page, size: PRICE_PAGE_SIZE });
  if (q)       params.set('q', q);
  if (country) params.set('country', country);

  try {
    const resp = await fetch(`/api/sms/prices?${params}`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();

    priceTotalPages  = data.total_pages || 1;
    priceTotalCount  = data.total       || 0;

    renderPricesTable(data.prices || []);
    renderPricePagination();
    updatePriceMeta();
  } catch (err) {
    console.error('加载价格失败:', err);
    showPriceError(err.message);
  } finally {
    priceIsLoading = false;
  }
}

/* ── 表格渲染 ─────────────────────────────── */
function renderPricesTable(prices) {
  const tbody = document.getElementById('prices-tbody');
  if (!tbody) return;

  if (prices.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-cell">📭 没有找到匹配的价格数据</td></tr>';
    return;
  }

  const rows = prices.map(p => {
    const priceKey  = `${(p.product||'').toLowerCase()}-${(p.country||'').toLowerCase()}`;
    const hist      = priceHistory[priceKey] || [];
    const trend     = getTrend(hist);
    const rateClass = p.rate >= 80 ? 'high' : p.rate >= 50 ? 'medium' : 'low';
    const stockCls  = p.count > 50 ? 'in' : p.count > 0 ? 'low' : 'out';
    const pid       = (p.product || '').toLowerCase();
    const iconHtml  = (typeof PlatformIconRegistry !== 'undefined')
      ? PlatformIconRegistry.render(pid, 22)
      : `<img src="/static/icons/sms/${pid}.png" width="20" onerror="this.style.display='none'">`;

    return `<tr>
      <td><div class="price-service">${iconHtml}<span>${p.product||'—'}</span></div></td>
      <td>${smsservice_displayCountry(p.country)}</td>
      <td>${p.operator||'any'}</td>
      <td class="price-val">
        <span>${p.cost > 0 ? '¥'+(p.cost/100).toFixed(4) : '免费'}</span>
        ${hist.length > 1 ? `<span class="price-trend price-trend--${trend}">${getTrendIcon(trend)}</span>` : ''}
      </td>
      <td><span class="stock-badge stock-badge--${stockCls}">${p.count??0}</span></td>
      <td><span class="rate-${rateClass}">${p.rate??0}%</span></td>
      <td>
        ${hist.length>1 ? `<button onclick="showPriceHistory('${priceKey}')" class="history-btn">📊</button>` : ''}
        <a href="/sms/buy?service=${pid}" class="buy-link-btn">购买</a>
      </td>
    </tr>`;
  });
  tbody.innerHTML = rows.join('');
}

function smsservice_displayCountry(code) {
  if (!code) return '—';
  // 首字母大写
  return code.charAt(0).toUpperCase() + code.slice(1).toLowerCase();
}

function getTrend(history) {
  if (!history || history.length < 2) return 'flat';
  const r = history.slice(-7);
  const chg = (r[r.length-1].price - r[0].price) / r[0].price * 100;
  return chg > 5 ? 'up' : chg < -5 ? 'down' : 'flat';
}

function getTrendIcon(t) { return t==='up'?'📈':t==='down'?'📉':'➡️'; }

/* ── 角标分页渲染 ─────────────────────────── */
function renderPricePagination() {
  const wrap = document.getElementById('price-pagination');
  if (!wrap) return;

  const tp  = priceTotalPages;
  const cur = priceCurrentPage;

  if (tp <= 1) { wrap.innerHTML = ''; return; }

  // 统计区 + 分页按钮整合在一个 flex 容器
  let info = `<span class="pg-info">共 <strong>${fmtNum(priceTotalCount)}</strong> 条 · 第 ${cur} / ${tp} 页</span>`;

  let btns = '';
  if (cur > 1)  btns += `<button class="pg-btn" onclick="gotoPrice(1)">首页</button>`;
  if (cur > 1)  btns += `<button class="pg-btn" onclick="gotoPrice(${cur-1})">‹ 上一页</button>`;

  const from = Math.max(1, cur-2), to = Math.min(tp, cur+2);
  for (let i = from; i <= to; i++) {
    btns += `<button class="pg-btn${i===cur?' pg-btn--active':''}" onclick="gotoPrice(${i})">${i}</button>`;
  }

  if (cur < tp) btns += `<button class="pg-btn" onclick="gotoPrice(${cur+1})">下一页 ›</button>`;
  if (cur < tp) btns += `<button class="pg-btn" onclick="gotoPrice(${tp})">末页</button>`;

  wrap.innerHTML = `<div class="pg-bar">${info}<div class="pg-btns">${btns}</div></div>`;
}

function gotoPrice(p) {
  if (p < 1 || p > priceTotalPages || p === priceCurrentPage) return;
  loadPricePage(p);
  document.querySelector('.prices-table-wrap')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function fmtNum(n) {
  return (n||0).toLocaleString('zh-CN');
}

/* ── 元信息 ───────────────────────────────── */
function updatePriceMeta() {
  const el = document.getElementById('prices-update-time');
  if (el) el.textContent = `已加载 ${PRICE_PAGE_SIZE} / ${fmtNum(priceTotalCount)} 条 · 更新于 ${new Date().toLocaleTimeString('zh-CN')}`;
}

/* ── 加载/错误态 ──────────────────────────── */
function showPriceLoading() {
  const tbody = document.getElementById('prices-tbody');
  if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="padding:40px;text-align:center;color:#9ca3af;">⏳ 加载中...</td></tr>';
}

function showPriceError(msg) {
  const tbody = document.getElementById('prices-tbody');
  if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:40px;">
    <p style="color:#ef4444;margin:0 0 12px">❌ ${msg||'加载失败'}</p>
    <button onclick="loadPricePage(1)" class="retry-btn">重试</button>
  </td></tr>`;
}

/* ── 搜索防抖 ─────────────────────────────── */
function onPriceSearch() {
  clearTimeout(priceSearchTimer);
  priceSearchTimer = setTimeout(() => loadPricePage(1), 350);
}

/* ── 价格历史弹窗 ─────────────────────────── */
function showPriceHistory(priceKey) {
  const hist = priceHistory[priceKey];
  if (!hist || hist.length === 0) return;
  const [platform, ...cp] = priceKey.split('-');
  const country = cp.join('-');
  const prices  = hist.map(h => h.price);
  const maxP=Math.max(...prices), minP=Math.min(...prices);
  const avgP=prices.reduce((a,b)=>a+b,0)/prices.length;
  const cur=prices[prices.length-1];

  document.getElementById('price-history-modal')?.remove();
  const modal = document.createElement('div');
  modal.id = 'price-history-modal';
  modal.className = 'price-history-modal';
  modal.onclick = e => { if(e.target===modal) modal.remove(); };
  modal.innerHTML = `
    <div class="price-history-content">
      <div class="price-history-header">
        <h3>${platform} · ${country}</h3>
        <button onclick="document.getElementById('price-history-modal').remove()" class="close-btn">✕</button>
      </div>
      <div class="price-history-stats">
        <div class="price-stat"><span class="price-stat-label">当前</span><span class="price-stat-value">¥${cur.toFixed(4)}</span></div>
        <div class="price-stat"><span class="price-stat-label">最高</span><span class="price-stat-value" style="color:#ef4444">¥${maxP.toFixed(4)}</span></div>
        <div class="price-stat"><span class="price-stat-label">最低</span><span class="price-stat-value" style="color:#22c55e">¥${minP.toFixed(4)}</span></div>
        <div class="price-stat"><span class="price-stat-label">均价</span><span class="price-stat-value">¥${avgP.toFixed(4)}</span></div>
      </div>
      <table class="ph-table">
        <thead><tr><th>日期</th><th>价格</th><th>变化</th></tr></thead>
        <tbody>${hist.slice(-14).reverse().map((h,i,arr)=>{
          const prev=arr[i+1];
          const chg=prev?((h.price-prev.price)/prev.price*100).toFixed(1):0;
          const cls=chg>0?'up':chg<0?'down':'flat';
          return `<tr><td>${h.date}</td><td>¥${h.price.toFixed(4)}</td><td class="price-change price-change--${cls}">${chg>0?'+':''}${chg}%</td></tr>`;
        }).join('')}</tbody>
      </table>
    </div>`;
  document.body.appendChild(modal);
}

/* ── 页面初始化 ───────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  priceHistory = generatePriceHistory();

  const searchEl = document.getElementById('price-search');
  if (searchEl) {
    searchEl.addEventListener('input', onPriceSearch);
    searchEl.addEventListener('keydown', e => { if(e.key==='Enter'){ clearTimeout(priceSearchTimer); loadPricePage(1); } });
  }

  const countryEl = document.getElementById('country-filter');
  if (countryEl) countryEl.addEventListener('change', () => loadPricePage(1));

  loadCountryOptions();
  loadPricePage(1);

  // 每5分钟刷新当前页
  setInterval(() => loadPricePage(priceCurrentPage), 5 * 60 * 1000);
});
