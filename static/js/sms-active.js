// SMS 活跃订单管理 - S-07 (轮询版本，无 WebSocket)

let activePollers = {};   // { orderId: intervalId }
let activeTimers  = {};   // { orderId: intervalId }

/* ── 加载活跃订单列表 ──────────────────────── */
async function loadActiveOrders() {
  try {
    const resp = await fetch('/api/sms/orders/active');
    const data = await resp.json();

    const orders = data.orders || [];
    const list   = document.getElementById('active-list');
    const empty  = document.getElementById('active-empty');

    if (orders.length === 0) {
      if (empty) empty.style.display = 'flex';
      if (list)  list.innerHTML = '';
      return;
    }

    if (empty) empty.style.display = 'none';
    if (list)  list.innerHTML = '';

    orders.forEach(order => {
      const card = buildActiveOrderCard(order);
      list.appendChild(card);
      startActivePoller(order.id);
    });
  } catch (err) {
    console.error('加载活跃订单失败:', err);
    showToast('加载订单失败', 'error');
  }
}

/* ── 构建订单卡片 ──────────────────────────── */
function buildActiveOrderCard(order) {
  const card = document.createElement('div');
  card.className = 'active-order-card';
  card.id = `active-card-${order.id}`;

  const expiry  = new Date(order.expires_at);
  const secLeft = Math.max(0, Math.floor((expiry - Date.now()) / 1000));

  card.innerHTML = `
    <div class="active-card__header">
      <div class="active-service-icon" id="active-icon-${order.id}">${order.icon || '📱'}</div>
      <div class="active-card__info">
        <span class="active-card__service">${order.product || 'Unknown'}</span>
        <span class="active-card__country">${order.country_flag || ''} ${order.country || ''}</span>
      </div>
      <div class="active-card__timer" id="timer-${order.id}">${formatTime(secLeft)}</div>
    </div>

    <div class="active-card__number">
      <span class="active-number-text">${formatPhoneNumber(order.phone)}</span>
      <button onclick="copyActiveNumber('${order.phone}', this)" class="copy-btn-sm">复制</button>
    </div>

    <div class="active-otp" id="active-otp-${order.id}" style="display:none">
      <span class="active-otp__code" id="active-otp-code-${order.id}">—</span>
      <button onclick="copyActiveOTP('${order.id}')" class="copy-btn-sm copy-btn-sm--green">复制验证码</button>
    </div>

    <div class="active-waiting" id="active-waiting-${order.id}">
      <div class="waiting-dots-sm"><span></span><span></span><span></span></div>
      <span>等待验证码...</span>
    </div>

    <div class="active-card__actions">
      <button onclick="cancelActiveOrder('${order.id}')" class="active-btn active-btn--cancel">取消</button>
      <button onclick="finishActiveOrder('${order.id}')" class="active-btn active-btn--finish"
              id="finish-btn-${order.id}" style="display:none">完成</button>
    </div>
  `;

  startActiveTimer(order.id, secLeft);
  return card;
}

/* ── 轮询订单状态（每 3 秒）──────────────── */
function startActivePoller(orderId) {
  if (activePollers[orderId]) return;
  let lastSMSCount = 0;

  activePollers[orderId] = setInterval(async () => {
    if (!document.getElementById(`active-card-${orderId}`)) {
      clearInterval(activePollers[orderId]);
      delete activePollers[orderId];
      return;
    }

    try {
      const resp = await fetch(`/api/sms/order/${orderId}`);
      if (!resp.ok) return;
      const data = await resp.json();

      // 新 SMS
      if (data.sms && data.sms.length > lastSMSCount) {
        for (let i = lastSMSCount; i < data.sms.length; i++) {
          const sms = data.sms[i];
          const otp = sms.code || sms.text?.match(/\b(\d{4,8})\b/)?.[1];
          if (otp) {
            const otpArea = document.getElementById(`active-otp-${orderId}`);
            if (otpArea) otpArea.style.display = 'flex';

            const otpCode = document.getElementById(`active-otp-code-${orderId}`);
            if (otpCode) otpCode.textContent = otp;

            const waitingArea = document.getElementById(`active-waiting-${orderId}`);
            if (waitingArea) waitingArea.style.display = 'none';

            const finishBtn = document.getElementById(`finish-btn-${orderId}`);
            if (finishBtn) finishBtn.style.display = 'inline-block';

            const card = document.getElementById(`active-card-${orderId}`);
            if (card) card.classList.add('active-order-card--received');

            if (typeof playBeep === 'function') playBeep();
            showToast('收到验证码！', 'success');
          }
        }
        lastSMSCount = data.sms.length;
      }

      // 终态
      if (['RECEIVED', 'CANCELED', 'TIMEOUT', 'BANNED'].includes(data.status)) {
        clearInterval(activePollers[orderId]);
        delete activePollers[orderId];
        if (data.status !== 'RECEIVED') {
          setTimeout(() => removeActiveCard(orderId), 3000);
        }
      }
    } catch (err) {
      console.warn(`轮询出错 [${orderId}]:`, err);
    }
  }, 3000);
}

/* ── 倒计时管理 ────────────────────────────── */
function startActiveTimer(orderId, seconds) {
  let s = seconds;
  const el = document.getElementById(`timer-${orderId}`);
  if (!el) return;

  const iv = setInterval(() => {
    s--;
    if (!document.getElementById(`active-card-${orderId}`)) {
      clearInterval(iv);
      delete activeTimers[orderId];
      return;
    }
    el.textContent  = formatTime(s);
    el.style.color  = s <= 60 ? '#ef4444' : s <= 300 ? '#f59e0b' : '#374151';

    if (s <= 0) {
      clearInterval(iv);
      delete activeTimers[orderId];
      el.textContent = '已超时';
      setTimeout(() => removeActiveCard(orderId), 3000);
    }
  }, 1000);

  activeTimers[orderId] = iv;
}

/* ── 订单操作 ──────────────────────────────── */
async function cancelActiveOrder(orderId) {
  if (!confirm('确定取消此订单？')) return;
  try {
    const resp = await fetch(`/api/sms/order/${orderId}/cancel`, { method: 'POST' });
    if (!resp.ok) throw new Error('取消失败');
    showToast('订单已取消', 'success');
    removeActiveCard(orderId);
  } catch (err) {
    showToast(err.message || '取消失败', 'error');
  }
}

async function finishActiveOrder(orderId) {
  try {
    const resp = await fetch(`/api/sms/order/${orderId}/finish`, { method: 'POST' });
    if (!resp.ok) throw new Error('完成失败');
    showToast('订单已完成', 'success');
    removeActiveCard(orderId);
  } catch (err) {
    showToast(err.message || '完成失败', 'error');
  }
}

function removeActiveCard(orderId) {
  if (activePollers[orderId]) {
    clearInterval(activePollers[orderId]);
    delete activePollers[orderId];
  }
  if (activeTimers[orderId]) {
    clearInterval(activeTimers[orderId]);
    delete activeTimers[orderId];
  }

  const card = document.getElementById(`active-card-${orderId}`);
  if (card) card.remove();

  const list  = document.getElementById('active-list');
  const empty = document.getElementById('active-empty');
  if (list && list.children.length === 0 && empty) {
    empty.style.display = 'flex';
  }
}

/* ── 复制操作 ──────────────────────────────── */
function copyActiveNumber(number, btn) {
  navigator.clipboard.writeText(number.replace(/\s/g, '')).then(() => {
    const original = btn.textContent;
    btn.textContent = '已复制 ✓';
    setTimeout(() => { btn.textContent = original; }, 2000);
    showToast('号码已复制', 'success');
  }).catch(() => showToast('复制失败', 'error'));
}

function copyActiveOTP(orderId) {
  const otpEl = document.getElementById(`active-otp-code-${orderId}`);
  if (!otpEl) return;
  navigator.clipboard.writeText(otpEl.textContent).then(() => {
    showToast('验证码已复制', 'success');
  }).catch(() => showToast('复制失败', 'error'));
}

/* ── 工具函数 ──────────────────────────────── */
function formatTime(s) {
  if (s <= 0) return '00:00';
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;
}

function formatPhoneNumber(phone) {
  if (!phone) return '';
  return phone.replace(/(\+\d{1,3})(\d{3})(\d{3})(\d{4,})/, '$1 $2 $3 $4');
}

function showToast(msg, type) {
  const d = document.createElement('div');
  d.className = `toast toast--${type || 'info'}`;
  d.textContent = msg;
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 3000);
}

/* ── 页面加载 ──────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  loadActiveOrders();
  setInterval(loadActiveOrders, 30000);
});

/* ── 页面卸载清理 ──────────────────────────── */
window.addEventListener('beforeunload', () => {
  Object.values(activePollers).forEach(iv => clearInterval(iv));
  activePollers = {};
  Object.values(activeTimers).forEach(iv => clearInterval(iv));
  activeTimers = {};
});
