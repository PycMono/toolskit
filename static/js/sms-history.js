// SMS 历史记录 - S-08 (支持1000条虚拟数据，每页20条)

const HISTORY_KEY = 'sms_history';
let currentStatus = 'all';
let currentPage = 1;
const PAGE_SIZE = 20;
let allHistoryData = [];

/* ── 生成虚拟历史数据 ─────────────────────── */
function generateMockHistory() {
  const platforms = ['WhatsApp', 'Telegram', 'Google', 'Facebook', 'Instagram', 'Twitter', 'TikTok', 'Discord', 'Line', 'Viber'];
  const countries = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'India', 'China', 'Japan', 'Brazil'];
  const flags = ['🇺🇸', '🇬🇧', '🇨🇦', '🇦🇺', '🇩🇪', '🇫🇷', '🇮🇳', '🇨🇳', '🇯🇵', '🇧🇷'];
  const statuses = ['已使用', '已取消', '已超时'];
  
  const mockData = [];
  for (let i = 0; i < 1000; i++) {
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const countryIdx = Math.floor(Math.random() * countries.length);
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const hasCode = status === '已使用' && Math.random() > 0.1;
    
    // 生成时间（最近30天内）
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(Math.floor(Math.random() * 24));
    date.setMinutes(Math.floor(Math.random() * 60));
    
    mockData.push({
      id: 'H-' + (1000000 + i),
      number: `+1 ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000 + 1000)}`,
      platform: platform,
      country: countries[countryIdx],
      flag: flags[countryIdx],
      code: hasCode ? String(Math.floor(Math.random() * 900000 + 100000)) : '',
      status: status,
      time: date.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    });
  }
  
  // 按时间倒序排序
  return mockData.sort((a, b) => new Date(b.time) - new Date(a.time));
}

/* ── localStorage 操作 ─────────────────────── */
function getHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
    // 如果localStorage为空，生成虚拟数据
    const mockData = generateMockHistory();
    saveHistory(mockData);
    return mockData;
  } catch (e) {
    console.warn('读取历史失败，使用虚拟数据:', e);
    return generateMockHistory();
  }
}

function saveHistory(list) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('保存历史失败:', e);
  }
}

/**
 * 添加一条历史记录（从 sms-order.js 调用）
 * @param {object} record { number, platform, country, code, status }
 */
function addHistoryRecord(record) {
  const list = getHistory();
  list.unshift({
    id:       'H-' + Date.now(),
    number:   record.number   || '',
    platform: record.platform || '',
    country:  record.country  || '',
    flag:     record.flag     || '',
    code:     record.code     || '',
    status:   record.status   || '已使用',
    time:     new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
  });
  // 最多保留 1000 条
  if (list.length > 1000) list.splice(1000);
  saveHistory(list);
}

/* ── 筛选 ──────────────────────────────────── */
function filterByStatus(status, btn) {
  currentStatus = status;
  currentPage   = 1;
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('filter-tab--active'));
  if (btn) btn.classList.add('filter-tab--active');
  loadHistory(); // async，不需要 await
}

/* ── 加载并渲染（优先后端API，失败回退本地）─── */
async function loadHistory() {
  const tbody = document.getElementById('history-tbody');
  if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="empty-cell">⏳ 加载中...</td></tr>';

  // 状态映射：前端tab → 后端参数
  const statusMap = { all: '', received: 'RECEIVED', canceled: 'CANCELED', timeout: 'TIMEOUT' };
  const statusParam = statusMap[currentStatus] || '';

  try {
    const params = new URLSearchParams({ page: currentPage, size: PAGE_SIZE });
    if (statusParam) params.set('status', statusParam);

    const resp = await fetch(`/api/sms/orders/history?${params}`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const data = await resp.json();
    const orders = (data.orders || []).map(o => ({
      id:       o.id,
      platform: o.product_name || o.product || '—',
      number:   o.phone || '—',
      country:  o.country || '—',
      flag:     o.flag || '',
      code:     o.code || '',
      status:   statusLabel(o.status),
      time:     o.created_at ? new Date(o.created_at).toLocaleString('zh-CN') : '—',
    }));

    renderHistoryTable(orders);
    renderPagination(data.total || 0, data.total_pages || 1);
    return;
  } catch (err) {
    console.warn('后端历史接口失败，回退本地数据:', err);
  }

  // 回退：使用本地 localStorage 数据
  allHistoryData = getHistory();
  let filtered = allHistoryData;
  if (currentStatus !== 'all') {
    const map = { received: '已使用', canceled: '已取消', timeout: '已超时' };
    const target = map[currentStatus];
    if (target) filtered = filtered.filter(r => r.status === target);
  }
  const total = filtered.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const pageData = filtered.slice(startIdx, startIdx + PAGE_SIZE);
  renderHistoryTable(pageData);
  renderPagination(total, totalPages);
}

function statusLabel(st) {
  const map = { RECEIVED: '已使用', CANCELED: '已取消', TIMEOUT: '已超时' };
  return map[(st||'').toUpperCase()] || st || '—';
}

/* ── 渲染表格 ───────────────────────────────── */
function renderHistoryTable(orders) {
  const tbody = document.getElementById('history-tbody');
  if (!tbody) return;

  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-cell">📭 暂无使用记录</td></tr>';
    return;
  }

  tbody.innerHTML = orders.map(o => {
    const statusClass = { '已使用': 'received', '已取消': 'canceled', '已超时': 'timeout' }[o.status] || 'pending';
    const iconHtml = (typeof PlatformIconRegistry !== 'undefined')
      ? PlatformIconRegistry.render(o.platform, 24)
      : `<img src="/static/icons/sms/${(o.platform||'').toLowerCase()}.png" width="20" onerror="this.style.display='none'">`;
    return `
      <tr>
        <td>
          <div class="history-service">
            ${iconHtml}
            <span>${o.platform || '—'}</span>
          </div>
        </td>
        <td class="mono">${o.number || '—'}</td>
        <td>${o.flag || ''} ${o.country || '—'}</td>
        <td class="otp-cell">${o.code || '—'}</td>
        <td><span class="status-pill status-pill--${statusClass}">${o.status || '—'}</span></td>
        <td class="time-cell">${o.time || '—'}</td>
      </tr>
    `;
  }).join('');
}

/* ── 渲染分页 ───────────────────────────────── */
function renderPagination(total, totalPages) {
  const pag = document.getElementById('pagination');
  if (!pag) return;

  if (totalPages <= 1) { pag.innerHTML = ''; return; }

  const fmtNum = n => (n || 0).toLocaleString('zh-CN');

  // 统计信息
  const info = `<span class="pg-info">共 <strong>${fmtNum(total)}</strong> 条记录 · 第 ${currentPage} / ${fmtNum(totalPages)} 页</span>`;

  // 页码按钮
  let btns = '';
  if (currentPage > 1)          btns += `<button onclick="gotoPage(1)"                   class="pg-btn">首页</button>`;
  if (currentPage > 1)          btns += `<button onclick="gotoPage(${currentPage - 1})"  class="pg-btn">‹ 上一页</button>`;

  const from = Math.max(1, currentPage - 2);
  const to   = Math.min(totalPages, currentPage + 2);
  for (let i = from; i <= to; i++) {
    btns += `<button onclick="${i === currentPage ? 'void 0' : `gotoPage(${i})`}" class="pg-btn${i === currentPage ? ' pg-btn--active' : ''}">${i}</button>`;
  }

  if (currentPage < totalPages) btns += `<button onclick="gotoPage(${currentPage + 1})"  class="pg-btn">下一页 ›</button>`;
  if (currentPage < totalPages) btns += `<button onclick="gotoPage(${totalPages})"        class="pg-btn">末页</button>`;

  pag.innerHTML = `<div class="pg-bar">${info}<div class="pg-btns">${btns}</div></div>`;
}

function gotoPage(p) {
  currentPage = p;
  loadHistory();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── 清空历史 ───────────────────────────────── */
function clearHistory() {
  if (!confirm('确定清空所有历史记录？此操作不可恢复。')) return;
  localStorage.removeItem(HISTORY_KEY);
  loadHistory();
  showToast('历史记录已清空', 'info');
}

/* ── 导出 CSV ───────────────────────────────── */
function exportCSV() {
  const list = getHistory();
  if (list.length === 0) {
    showToast('没有可导出的数据', 'error');
    return;
  }
  let csv = '平台,号码,国家,验证码,状态,时间\n';
  list.forEach(o => {
    const row = [o.platform, o.number, o.country, o.code, o.status, o.time]
      .map(v => `"${(v || '').replace(/"/g, '""')}"`);
    csv += row.join(',') + '\n';
  });
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `sms-history-${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('CSV 导出成功', 'success');
}

/* ── Toast ──────────────────────────────────── */
function showToast(msg, type) {
  const d = document.createElement('div');
  d.className = `toast toast--${type || 'info'}`;
  d.textContent = msg;
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 3000);
}

/* ── 页面初始化 ──────────────────────────── */
document.addEventListener('DOMContentLoaded', loadHistory);
