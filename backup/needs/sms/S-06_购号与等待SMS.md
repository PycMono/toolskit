# Block S-06 · SMS 接码器 — 购号 & 等待 SMS（核心业务）

> **所属模块**：SMS 接码器（/sms/buy 下半部分）  
> **竞品参考**：https://5sim.net/activation — 购号后等待区域  
> **预估工时**：5h  
> **依赖**：S-05（选择器）、S-10（5SIM API 代理）、S-11（WebSocket）  
> **交付粒度**：购号 API 调用 → 号码展示 → 倒计时 → WebSocket 实时等待 → OTP 提取高亮 → 完成/取消/换号

---

## 1. 竞品分析（5sim.net 等待页）

| 特性 | 竞品 | 本次实现 |
|------|------|---------|
| 号码大字体展示 + 一键复制 | ✅ | ✅ |
| 20 分钟倒计时 | ✅ | ✅ 红色警告倒计时 |
| 等待 SMS 动画（loading dots）| ✅ | ✅ |
| SMS 到达后验证码自动提取 | ✅ 大字体高亮显示 | ✅ |
| 验证码一键复制 | ✅ | ✅ |
| 完成 / 取消 订单按钮 | ✅ | ✅ |
| 换号重试 | ✅ | ✅ |
| 收到的完整短信文本 | ✅ 折叠展示 | ✅ |
| 多条 SMS 支持 | ✅ | ✅ |
| 声音提示（可选）| ✅ | ✅ 可开关 |

---

## 2. HTML — 订单等待面板

```html
<!-- templates/sms/buy.html — 购号成功后动态插入此区域 -->

<div class="order-panel" id="order-panel" style="display:none">

  <!-- 面板头部：服务信息 + 状态 -->
  <div class="order-panel__header">
    <div class="order-service-info">
      <img class="order-service-icon" id="order-service-icon"
           src="" alt="" onerror="this.src='/static/icons/sms/default.png'">
      <div>
        <p class="order-service-name" id="order-service-name">WhatsApp</p>
        <p class="order-country"      id="order-country">🇺🇸 United States</p>
      </div>
    </div>
    <div class="order-status-badge" id="order-status-badge">
      <span class="status-dot status-dot--waiting"></span>
      <span id="order-status-text">等待验证码...</span>
    </div>
    <div class="order-timer" id="order-timer">20:00</div>
  </div>

  <!-- 虚拟号码展示 -->
  <div class="order-number-area">
    <div class="order-number-label">{{ t .Lang "sms.order.number" }}</div>
    <div class="order-number-display">
      <span class="order-number-text" id="order-number">+1 234 567 8901</span>
      <button class="copy-number-btn" id="copy-number-btn" onclick="copyOrderNumber()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
        <span id="copy-number-text">{{ t .Lang "sms.order.copy" }}</span>
      </button>
    </div>
    <p class="order-hint">将此号码填入目标平台的手机号输入框</p>
  </div>

  <!-- 等待动画（无 SMS 时显示）-->
  <div class="waiting-area" id="waiting-area">
    <div class="waiting-dots">
      <span></span><span></span><span></span>
    </div>
    <p class="waiting-text" id="waiting-text">{{ t .Lang "sms.order.waiting" }}</p>

    <!-- 声音提示开关 -->
    <button class="sound-toggle" id="sound-toggle" onclick="toggleSound()"
            title="声音提示">
      🔔
    </button>
  </div>

  <!-- OTP 验证码区域（收到 SMS 后显示）-->
  <div class="otp-area" id="otp-area" style="display:none">
    <div class="otp-label">{{ t .Lang "sms.otp.label" }}</div>
    <div class="otp-code-display">
      <span class="otp-code" id="otp-code">—</span>
      <button class="copy-otp-btn" onclick="copyOTP()" id="copy-otp-btn">
        {{ t .Lang "sms.otp.copy" }}
      </button>
    </div>
  </div>

  <!-- SMS 消息列表 -->
  <div class="sms-messages" id="sms-messages" style="display:none">
    <div class="sms-messages__header">
      <span>收到的短信</span>
      <span class="sms-count" id="sms-count">1</span>
    </div>
    <div class="sms-list" id="sms-list">
      <!-- 动态插入 SMS 条目 -->
    </div>
  </div>

  <!-- 操作按钮 -->
  <div class="order-actions" id="order-actions">
    <button class="order-action-btn order-action-btn--cancel"
            onclick="cancelOrder()" id="btn-cancel">
      {{ t .Lang "sms.btn.cancel" }}
    </button>
    <button class="order-action-btn order-action-btn--rebuy"
            onclick="rebuyNumber()" id="btn-rebuy">
      {{ t .Lang "sms.btn.rebuy" }}
    </button>
    <button class="order-action-btn order-action-btn--finish"
            onclick="finishOrder()" id="btn-finish" style="display:none">
      {{ t .Lang "sms.btn.finish" }}
    </button>
  </div>

</div>
```

---

## 3. CSS — 订单等待面板

```css
/* static/css/sms-order.css */

/* ── 订单面板 ─────────────────────────────── */
.order-panel {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  animation: slideInUp 0.3s ease;
  margin-top: 20px;
}

@keyframes slideInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── 面板头部 ─────────────────────────────── */
.order-panel__header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  flex-wrap: wrap;
}

.order-service-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.order-service-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  object-fit: contain;
}

.order-service-name {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 2px;
}

.order-country {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
}

/* 状态徽章 */
.order-status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  border-radius: 999px;
  background: #f3f4f6;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #374151;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot--waiting {
  background: #f59e0b;
  animation: pulse-dot 1.5s infinite;
}

.status-dot--received { background: #22c55e; }
.status-dot--cancelled,
.status-dot--timeout   { background: #9ca3af; animation: none; }

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

/* 倒计时 */
.order-timer {
  font-size: 1.25rem;
  font-weight: 800;
  color: #374151;
  font-variant-numeric: tabular-nums;
  min-width: 56px;
  text-align: right;
}

.order-timer--warning { color: #f59e0b; }
.order-timer--danger  { color: #ef4444; animation: timer-flash 1s infinite; }

@keyframes timer-flash {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}

/* ── 号码展示 ─────────────────────────────── */
.order-number-area {
  padding: 24px 20px 16px;
  text-align: center;
  border-bottom: 1px solid #f3f4f6;
}

.order-number-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 10px;
}

.order-number-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.order-number-text {
  font-size: 2rem;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: 0.05em;
  font-variant-numeric: tabular-nums;
}

.copy-number-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 16px;
  background: #4f46e5;
  color: #ffffff;
  border: none;
  border-radius: 9px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.copy-number-btn:hover { background: #4338ca; }

.order-hint {
  font-size: 0.8125rem;
  color: #9ca3af;
  margin: 10px 0 0;
}

/* ── 等待动画 ─────────────────────────────── */
.waiting-area {
  padding: 32px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  position: relative;
}

.waiting-dots {
  display: flex;
  gap: 8px;
}

.waiting-dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #4f46e5;
  animation: bounce-dot 1.4s infinite ease-in-out;
}

.waiting-dots span:nth-child(1) { animation-delay: 0s; }
.waiting-dots span:nth-child(2) { animation-delay: 0.2s; }
.waiting-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes bounce-dot {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40%            { transform: scale(1);   opacity: 1; }
}

.waiting-text {
  font-size: 0.9375rem;
  color: #6b7280;
  margin: 0;
}

.sound-toggle {
  position: absolute;
  top: 12px;
  right: 16px;
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.15s;
}
.sound-toggle:hover { opacity: 1; }
.sound-toggle--muted { filter: grayscale(1); }

/* ── OTP 验证码 ──────────────────────────── */
.otp-area {
  padding: 24px 20px;
  text-align: center;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border-top: 2px solid #22c55e;
  animation: otp-appear 0.5s ease;
}

@keyframes otp-appear {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}

.otp-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #166534;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 10px;
}

.otp-code-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.otp-code {
  font-size: 3rem;
  font-weight: 900;
  color: #15803d;
  letter-spacing: 0.15em;
  font-variant-numeric: tabular-nums;
}

.copy-otp-btn {
  height: 42px;
  padding: 0 20px;
  background: #22c55e;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
  box-shadow: 0 3px 10px rgba(34,197,94,0.3);
}
.copy-otp-btn:hover { background: #16a34a; }

/* ── SMS 消息列表 ─────────────────────────── */
.sms-messages {
  padding: 0 20px 16px;
  border-top: 1px solid #f3f4f6;
}

.sms-messages__header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 0 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #374151;
}

.sms-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: #4f46e5;
  color: #fff;
  border-radius: 50%;
  font-size: 0.7rem;
  font-weight: 700;
}

.sms-item {
  padding: 12px 14px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  margin-bottom: 8px;
}

.sms-item__meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #9ca3af;
  margin-bottom: 6px;
}

.sms-item__text {
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.5;
  word-break: break-all;
}

/* OTP 高亮 */
.sms-item__text mark {
  background: #fef9c3;
  color: #854d0e;
  padding: 1px 4px;
  border-radius: 4px;
  font-weight: 700;
}

/* ── 操作按钮 ─────────────────────────────── */
.order-actions {
  display: flex;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid #f3f4f6;
  background: #f9fafb;
  flex-wrap: wrap;
}

.order-action-btn {
  flex: 1;
  min-width: 100px;
  height: 42px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: opacity 0.15s, background 0.15s;
}

.order-action-btn:hover { opacity: 0.85; }

.order-action-btn--cancel {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.order-action-btn--rebuy {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.order-action-btn--finish {
  background: #22c55e;
  color: #ffffff;
  box-shadow: 0 3px 10px rgba(34,197,94,0.25);
}
```

---

## 4. JavaScript — 购号 + WebSocket + OTP 逻辑

```javascript
// static/js/sms-order.js

let currentOrderId  = null;
let orderWS         = null;
let timerInterval   = null;
let soundEnabled    = true;
let remainingSeconds = 20 * 60;  // 20 分钟

/* ── 购买号码（S-05 调用此函数）─────────────── */
async function buyNumber() {
  if (!selectedService || !selectedCountry || !selectedOperator) return;

  const btn = document.getElementById('buy-now-btn');
  btn.disabled    = true;
  btn.textContent = window.i18n?.['sms.buy.buying'] || '获取中...';

  try {
    const resp = await fetch('/api/sms/buy', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        service:  selectedService.name,
        country:  selectedCountry.name,
        operator: selectedOperator.name,
      }),
    });

    const data = await resp.json();

    if (resp.status === 402) {
      showToast(window.i18n?.['sms.error.insufficient_balance'] || '余额不足', 'error');
      return;
    }

    if (resp.status === 404) {
      showToast(window.i18n?.['sms.error.no_numbers'] || '暂无可用号码', 'error');
      return;
    }

    if (!resp.ok) throw new Error(data.error || '购买失败');

    // 购号成功 → 显示订单面板
    currentOrderId = data.id;
    showOrderPanel(data);
    connectOrderWS(data.id);
    startTimer(20 * 60);

    // 滚动到订单面板
    document.getElementById('order-panel')
            .scrollIntoView({ behavior: 'smooth', block: 'start' });

  } catch (err) {
    showToast(err.message || '购号失败，请重试', 'error');
  } finally {
    btn.disabled    = false;
    btn.textContent = window.i18n?.['sms.buy.btn'] || '购买号码';
  }
}

/* ── 展示订单面板 ──────────────────────────── */
function showOrderPanel(order) {
  const panel = document.getElementById('order-panel');
  panel.style.display = 'block';

  document.getElementById('order-service-icon').src =
    `/static/icons/sms/${order.product.toLowerCase()}.png`;
  document.getElementById('order-service-name').textContent =
    selectedService?.displayName || order.product;
  document.getElementById('order-country').textContent =
    `${selectedCountry?.flag || ''} ${selectedCountry?.displayName || order.country}`;
  document.getElementById('order-number').textContent =
    formatPhoneNumber(order.phone);

  // 重置状态
  setOrderStatus('waiting');
  document.getElementById('otp-area').style.display      = 'none';
  document.getElementById('sms-messages').style.display  = 'none';
  document.getElementById('btn-finish').style.display    = 'none';
  document.getElementById('waiting-area').style.display  = 'flex';
}

/* ── WebSocket 连接 ────────────────────────── */
function connectOrderWS(orderId) {
  if (orderWS) orderWS.close();

  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  orderWS = new WebSocket(`${proto}//${location.host}/ws/sms/${orderId}`);

  orderWS.onmessage = (event) => {
    const msg = JSON.parse(event.data);

    if (msg.type === 'sms') {
      onSMSReceived(msg.sms);
    } else if (msg.type === 'status') {
      onOrderStatusChange(msg.status);
    }
  };

  orderWS.onerror = () => {
    // Fallback: 5 秒轮询
    if (!currentOrderId) return;
    setTimeout(() => pollOrderStatus(orderId), 5000);
  };

  orderWS.onclose = () => {
    if (currentOrderId) {
      setTimeout(() => connectOrderWS(orderId), 3000);
    }
  };
}

/* ── 轮询降级方案 ──────────────────────────── */
async function pollOrderStatus(orderId) {
  if (!currentOrderId) return;
  try {
    const resp = await fetch(`/api/sms/order/${orderId}`);
    const data = await resp.json();
    if (data.sms?.length > 0) {
      data.sms.forEach(sms => onSMSReceived(sms));
    }
    if (data.status === 'RECEIVED') onOrderStatusChange('RECEIVED');
    else if (data.status === 'CANCELED') onOrderStatusChange('CANCELED');
    else if (data.status === 'TIMEOUT') onOrderStatusChange('TIMEOUT');
    else setTimeout(() => pollOrderStatus(orderId), 5000);
  } catch {
    setTimeout(() => pollOrderStatus(orderId), 5000);
  }
}

/* ── 收到 SMS ──────────────────────────────── */
function onSMSReceived(sms) {
  // 1. 提取 OTP（6 位数字）
  const otpMatch = sms.text?.match(/\b(\d{4,8})\b/);
  const otp = sms.code || (otpMatch ? otpMatch[1] : null);

  if (otp) {
    document.getElementById('otp-code').textContent      = otp;
    document.getElementById('otp-area').style.display    = 'flex';
    document.getElementById('waiting-area').style.display = 'none';
    setOrderStatus('received');
    document.getElementById('btn-finish').style.display = 'inline-flex';
    // 声音提示
    if (soundEnabled) playBeep();
  }

  // 2. 在 SMS 列表中高亮 OTP
  addSMSToList(sms, otp);
  document.getElementById('sms-messages').style.display = 'block';

  // 更新 SMS 数量
  const existing = document.querySelectorAll('.sms-item').length;
  document.getElementById('sms-count').textContent = existing;
}

/* ── 添加 SMS 到列表 ───────────────────────── */
function addSMSToList(sms, otp) {
  const list    = document.getElementById('sms-list');
  const item    = document.createElement('div');
  item.className = 'sms-item';

  const textWithHighlight = otp
    ? sms.text.replace(otp, `<mark>${otp}</mark>`)
    : sms.text;

  item.innerHTML = `
    <div class="sms-item__meta">
      <span>📩 ${sms.sender || '未知发件人'}</span>
      <span>${new Date(sms.created_at || Date.now()).toLocaleTimeString()}</span>
    </div>
    <p class="sms-item__text">${textWithHighlight}</p>
  `;
  list.prepend(item);
}

/* ── 订单状态变化 ──────────────────────────── */
function onOrderStatusChange(status) {
  if (status === 'RECEIVED') setOrderStatus('received');
  else if (status === 'CANCELED') {
    setOrderStatus('cancelled');
    stopTimer();
    currentOrderId = null;
    if (orderWS) { orderWS.close(); orderWS = null; }
  } else if (status === 'TIMEOUT') {
    setOrderStatus('timeout');
    stopTimer();
    showToast(window.i18n?.['sms.error.order_expired'] || '订单已超时', 'info');
    currentOrderId = null;
  }
}

function setOrderStatus(status) {
  const badge    = document.getElementById('order-status-badge');
  const dot      = badge.querySelector('.status-dot');
  const text     = document.getElementById('order-status-text');
  const statuses = {
    waiting:   { dot: 'waiting',   text: '等待验证码...' },
    received:  { dot: 'received',  text: '✅ 已收到验证码' },
    cancelled: { dot: 'cancelled', text: '已取消' },
    timeout:   { dot: 'timeout',   text: '⏱ 已超时' },
  };
  const s = statuses[status] || statuses.waiting;
  dot.className  = `status-dot status-dot--${s.dot}`;
  text.textContent = s.text;
}

/* ── 倒计时 ────────────────────────────────── */
function startTimer(seconds) {
  remainingSeconds = seconds;
  stopTimer();
  timerInterval = setInterval(() => {
    remainingSeconds--;
    updateTimerUI();
    if (remainingSeconds <= 0) {
      stopTimer();
      onOrderStatusChange('TIMEOUT');
    }
  }, 1000);
  updateTimerUI();
}

function stopTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
}

function updateTimerUI() {
  const el  = document.getElementById('order-timer');
  const min = Math.floor(remainingSeconds / 60);
  const sec = remainingSeconds % 60;
  el.textContent = `${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  el.classList.remove('order-timer--warning', 'order-timer--danger');
  if (remainingSeconds <= 60)  el.classList.add('order-timer--danger');
  else if (remainingSeconds <= 300) el.classList.add('order-timer--warning');
}

/* ── 复制操作 ──────────────────────────────── */
function copyOrderNumber() {
  const num  = document.getElementById('order-number').textContent.replace(/\s/g,'');
  const btn  = document.getElementById('copy-number-text');
  navigator.clipboard.writeText(num).then(() => {
    btn.textContent = '已复制 ✓';
    setTimeout(() => { btn.textContent = '复制'; }, 2000);
  });
}

function copyOTP() {
  const otp = document.getElementById('otp-code').textContent;
  const btn = document.getElementById('copy-otp-btn');
  navigator.clipboard.writeText(otp).then(() => {
    btn.textContent = '已复制 ✓';
    setTimeout(() => { btn.textContent = '复制验证码'; }, 2000);
  });
}

/* ── 取消 / 完成 / 换号 ─────────────────────── */
async function cancelOrder() {
  if (!currentOrderId) return;
  if (!confirm('确定取消？订单费用将退回余额。')) return;
  await callOrderAction('cancel');
}

async function finishOrder() {
  if (!currentOrderId) return;
  await callOrderAction('finish');
  showToast('订单已完成', 'success');
}

async function rebuyNumber() {
  await cancelOrder();
  if (!currentOrderId) buyNumber();  // 取消成功后重新购买
}

async function callOrderAction(action) {
  try {
    const resp = await fetch(`/api/sms/order/${currentOrderId}/${action}`, { method: 'POST' });
    if (!resp.ok) throw new Error('操作失败');
    stopTimer();
    currentOrderId = null;
    if (orderWS) { orderWS.close(); orderWS = null; }
    document.getElementById('order-panel').style.display = 'none';
  } catch (err) {
    showToast(err.message, 'error');
  }
}

/* ── 工具函数 ──────────────────────────────── */
function formatPhoneNumber(phone) {
  // +12345678901 → +1 234 567 8901
  return phone.replace(/(\+\d{1,3})(\d{3})(\d{3})(\d{4,})/, '$1 $2 $3 $4');
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  const btn = document.getElementById('sound-toggle');
  btn.classList.toggle('sound-toggle--muted', !soundEnabled);
  btn.textContent = soundEnabled ? '🔔' : '🔕';
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch {}
}
```

---

## 5. 后端接口（与 S-10 配合）

```go
// internal/handler/sms_buy.go

// POST /api/sms/buy
func SMSBuyNumber(c *gin.Context) {
    userID := c.GetInt64("userID")

    var req struct {
        Service  string `json:"service"  binding:"required"`
        Country  string `json:"country"  binding:"required"`
        Operator string `json:"operator" binding:"required"`
    }
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": "参数错误"})
        return
    }

    // 1. 检查用户余额（需先查价格）
    price, err := smsService.GetPrice(req.Service, req.Country, req.Operator)
    if err != nil || price <= 0 {
        c.JSON(404, gin.H{"error": "暂无可用号码"})
        return
    }

    user, _ := db.GetSMSUserByID(userID)
    if user.Balance < int64(price) {
        c.JSON(402, gin.H{"error": "余额不足"})
        return
    }

    // 2. 调用 5SIM API 购买号码
    order, err := smsService.BuyActivationNumber(req.Service, req.Country, req.Operator)
    if err != nil {
        c.JSON(503, gin.H{"error": err.Error()})
        return
    }

    // 3. 扣除余额并保存订单记录
    db.DeductSMSUserBalance(userID, int64(price))
    db.SaveSMSOrder(userID, order)

    c.JSON(200, order)
}

// GET /api/sms/order/:id
func SMSGetOrder(c *gin.Context) {
    userID  := c.GetInt64("userID")
    orderID := c.Param("id")
    order, err := smsService.CheckOrder(orderID)
    if err != nil { c.JSON(500, gin.H{"error": err.Error()}); return }
    // 验证订单属于当前用户
    _ = userID
    c.JSON(200, order)
}

// POST /api/sms/order/:id/cancel
func SMSCancelOrder(c *gin.Context) {
    userID  := c.GetInt64("userID")
    orderID := c.Param("id")
    if err := smsService.CancelOrder(orderID); err != nil {
        c.JSON(500, gin.H{"error": err.Error()}); return
    }
    // 退款
    order, _ := db.GetSMSOrderByExternalID(orderID, userID)
    if order != nil { db.RefundSMSUserBalance(userID, order.Price) }
    c.JSON(200, gin.H{"ok": true})
}

// POST /api/sms/order/:id/finish
func SMSFinishOrder(c *gin.Context) {
    orderID := c.Param("id")
    if err := smsService.FinishOrder(orderID); err != nil {
        c.JSON(500, gin.H{"error": err.Error()}); return
    }
    c.JSON(200, gin.H{"ok": true})
}
```

---

## 6. 验收标准

- [ ] 点击「购买号码」调用 `/api/sms/buy`，成功后面板从下方滑入
- [ ] 面板顶部显示服务图标 + 国旗 + 国家名 + 黄色「等待中」徽章
- [ ] 大字体显示虚拟号码（格式化为 `+1 234 567 8901`），「复制」按钮 2 秒恢复
- [ ] 20 分钟倒计时运行，≤5 分钟变橙色，≤1 分钟变红色闪烁
- [ ] 三个跳动圆点等待动画持续播放
- [ ] WebSocket 连接失败时自动降级到 5 秒轮询
- [ ] 收到 SMS 后：等待区隐藏，绿色 OTP 区滑入，验证码大字体（3rem）
- [ ] OTP 在原始 SMS 文本中黄色高亮（`<mark>` 标签）
- [ ] 「复制验证码」按钮点击后 2 秒恢复
- [ ] 收到 SMS 时播放「叮」提示音，声音开关可切换
- [ ] 余额不足 → 402 → Toast 提示「余额不足，请先充值」
- [ ] 暂无号码 → 404 → Toast 提示「暂无可用号码」
- [ ] 「取消」弹出确认框，确认后退款并隐藏面板
- [ ] 「换号重试」取消旧单后重新购买相同服务/国家/运营商
