// SMS 订单等待面板 — 匹配 sms_buy.html 真实 DOM

/* ── 订单状态变量 ──────────────────────────── */
let currentOrderId   = null;
let currentOrderData = null;
let pollInterval     = null;
let timerInterval    = null;
let soundEnabled     = true;
let remainingSeconds = 20 * 60;
let lastSMSCount     = 0;

/* ════════════════════════════════════════════
   核心入口：点击"获取号码"
   ════════════════════════════════════════════ */
async function buyNumber() {
  if (!selectedService) { showToast('请先选择服务平台', 'error'); return; }
  if (!selectedCountry) { showToast('请先选择国家', 'error');     return; }

  const btn = document.getElementById('buy-now-btn');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ 获取中...'; }

  try {
    const resp = await fetch('/api/sms/buy', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service:  selectedService.id   || selectedService.name,
        country:  selectedCountry.code || selectedCountry.name,
        operator: selectedOperator
          ? (selectedOperator.operator || selectedOperator.name || 'any')
          : 'any',
      }),
    });

    const data = await resp.json();

    /* 明确的无库存错误 */
    if (data.error === 'no numbers available') {
      showToast('当前选择暂无可用号码，请更换平台或国家后重试', 'error');
      if (btn) { btn.disabled = false; btn.textContent = '🛒 获取号码'; }
      return;
    }

    /* 其他业务错误 */
    if (data.error) {
      showToast(data.detail || data.error, 'error');
      if (btn) { btn.disabled = false; btn.textContent = '🛒 获取号码'; }
      return;
    }

    /* ── 成功 ── */
    currentOrderId   = String(data.id);
    currentOrderData = data;
    lastSMSCount     = 0;

    showOrderPanel(data);   // 渲染结果面板
    startTimer(20 * 60);    // 倒计时

    /* Mock 订单用本地模拟，避免打真实 API 触发 429 */
    if (data.source === 'mock') {
      simulateMockSMS(data);
    } else {
      startPolling(currentOrderId);
    }

    /* 滚动到订单面板 */
    setTimeout(() => {
      document.getElementById('order-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);

  } catch (err) {
    console.error('获取号码失败:', err);
    showToast('网络异常，请检查网络后重试', 'error');
    if (btn) { btn.disabled = false; btn.textContent = '🛒 获取号码'; }
  }
}

/* ════════════════════════════════════════════
   渲染订单面板（对齐 sms_buy.html 真实 ID）
   ════════════════════════════════════════════ */
function showOrderPanel(order) {
  /* 切换布局：隐藏三步选择区，显示订单结果区 */
  const buyLayout    = document.getElementById('buy-layout');
  const stepsBar     = document.getElementById('steps-indicator');
  const orderLayout  = document.getElementById('order-layout');
  if (buyLayout)   buyLayout.style.display   = 'none';
  if (stepsBar)    stepsBar.style.display    = 'none';
  if (orderLayout) orderLayout.style.display = 'grid';

  /* ── 平台图标 ── */
  const iconEl = document.getElementById('order-service-icon');
  if (iconEl) {
    const pid = selectedService?.id || order.product || '';
    iconEl.innerHTML = (typeof PlatformIconRegistry !== 'undefined')
      ? PlatformIconRegistry.render(pid, 36)
      : `<span style="font-size:1.75rem;line-height:1">${selectedService?.icon || '📱'}</span>`;
  }

  /* ── 平台名称 ── */
  const nameEl = document.getElementById('order-service-name');
  if (nameEl) nameEl.textContent = selectedService?.name || order.product || '—';

  /* ── 国家 ── */
  const countryEl = document.getElementById('order-country');
  if (countryEl) {
    const flag = selectedCountry?.flag || '';
    const name = selectedCountry?.name || order.country || '—';
    countryEl.textContent = `${flag} ${name}`.trim();
  }

  /* ── 运营商 ── */
  const opEl = document.getElementById('order-operator');
  if (opEl) opEl.textContent = selectedOperator?.operator || selectedOperator?.name || order.operator || '—';

  /* ── 虚拟号码 ── */
  const numEl = document.getElementById('order-number');
  if (numEl) numEl.textContent = formatPhoneNumber(order.phone);

  /* ── 订单号 ── */
  const idEl = document.getElementById('order-id');
  if (idEl) idEl.textContent = order.id || '—';

  /* ── 有效期 ── */
  const expiryEl = document.getElementById('order-expiry');
  if (expiryEl && order.expires_at) {
    expiryEl.textContent = new Date(order.expires_at).toLocaleTimeString();
  }

  /* ── 费用 ── */
  const priceEl = document.getElementById('order-price');
  if (priceEl) {
    priceEl.textContent = (order.price && order.price > 0)
      ? `¥${Number(order.price).toFixed(2)}` : '免费';
  }

  /* ── 重置状态区域 ── */
  setOrderStatus('waiting');
  const waitingArea = document.getElementById('waiting-area');
  const otpArea     = document.getElementById('otp-area');
  const smsArea     = document.getElementById('sms-messages');
  const smsList     = document.getElementById('sms-list');
  const finishBtn   = document.getElementById('btn-finish');
  if (waitingArea) waitingArea.style.display = 'flex';
  if (otpArea)     otpArea.style.display     = 'none';
  if (smsArea)     smsArea.style.display     = 'none';
  if (smsList)     smsList.innerHTML         = '';
  if (finishBtn)   finishBtn.style.display   = 'none';

  /* 滚动到顶部 */
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ════════════════════════════════════════════
   订单状态文字 + 圆点样式
   ════════════════════════════════════════════ */
function setOrderStatus(status) {
  const badge  = document.getElementById('order-status-badge');
  const textEl = document.getElementById('order-status-text');
  const dotEl  = document.getElementById('order-status-dot');

  const MAP = {
    waiting:   { cls: 'op-status-dot--waiting',   text: '等待验证码...',   bg: '#fff7ed', color: '#92400e' },
    received:  { cls: 'op-status-dot--received',  text: '✅ 已收到验证码', bg: '#f0fdf4', color: '#166534' },
    cancelled: { cls: 'op-status-dot--cancelled', text: '已取消',          bg: '#f3f4f6', color: '#6b7280' },
    timeout:   { cls: 'op-status-dot--timeout',   text: '⏱ 已超时',       bg: '#fff7ed', color: '#92400e' },
    finished:  { cls: 'op-status-dot--received',  text: '✅ 已完成',       bg: '#f0fdf4', color: '#166534' },
  };
  const s = MAP[status] || MAP.waiting;

  if (textEl) textEl.textContent = s.text;
  if (badge)  { badge.style.background = s.bg; badge.style.color = s.color; }
  if (dotEl)  dotEl.className = `op-status-dot ${s.cls}`;
}

/* ════════════════════════════════════════════
   收到 SMS / OTP
   ════════════════════════════════════════════ */
function onSMSReceived(sms) {
  const otpMatch = sms.text?.match(/\b(\d{4,8})\b/);
  const otp = sms.code || (otpMatch ? otpMatch[1] : null);

  if (otp) {
    const otpCodeEl  = document.getElementById('otp-code');
    const otpArea    = document.getElementById('otp-area');      // ← 正确 ID
    const waitingArea = document.getElementById('waiting-area'); // ← 正确 ID
    const finishBtn  = document.getElementById('btn-finish');

    if (otpCodeEl)   otpCodeEl.textContent    = otp;
    if (otpArea)     otpArea.style.display     = 'block';
    if (waitingArea) waitingArea.style.display = 'none';
    if (finishBtn)   finishBtn.style.display   = 'inline-flex';

    setOrderStatus('received');
    if (soundEnabled) playBeep();
    saveToHistory(otp, '已使用');
  }

  addSMSToList(sms, otp);

  const smsArea = document.getElementById('sms-messages');
  if (smsArea) smsArea.style.display = 'block';
}

/* ════════════════════════════════════════════
   轮询（真实订单，5s 间隔，避免 429）
   ════════════════════════════════════════════ */
function startPolling(orderId) {
  stopPolling();
  pollInterval = setInterval(() => pollOrderStatus(orderId), 5000);
}

function stopPolling() {
  if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
}

async function pollOrderStatus(orderId) {
  if (!currentOrderId) return;
  try {
    const resp = await fetch(`/api/sms/order/${orderId}`);
    if (!resp.ok) return;
    const data = await resp.json();

    if (data.sms && data.sms.length > lastSMSCount) {
      for (let i = lastSMSCount; i < data.sms.length; i++) onSMSReceived(data.sms[i]);
      lastSMSCount = data.sms.length;
    }

    switch (data.status) {
      case 'RECEIVED': onOrderStatusChange('RECEIVED'); stopPolling(); break;
      case 'CANCELED': onOrderStatusChange('CANCELED'); stopPolling(); break;
      case 'TIMEOUT':  onOrderStatusChange('TIMEOUT');  stopPolling(); break;
    }
  } catch (err) { console.warn('轮询出错:', err); }
}

/* ════════════════════════════════════════════
   Mock 模拟（8~15 秒后触发验证码，不调 5SIM）
   ════════════════════════════════════════════ */
function simulateMockSMS(order) {
  const delay = 8000 + Math.random() * 7000;
  setTimeout(() => {
    if (String(order.id) !== currentOrderId) return;
    const code = String(Math.floor(100000 + Math.random() * 900000));
    onSMSReceived({
      sender:     order.product || 'Service',
      text:       `Your verification code is: ${code}. Do not share.`,
      code,
      created_at: new Date().toISOString(),
    });
    showToast('✅ 验证码已到达！', 'success');
  }, delay);
}

/* ════════════════════════════════════════════
   状态变化处理
   ════════════════════════════════════════════ */
function onOrderStatusChange(status) {
  if (status === 'RECEIVED') {
    setOrderStatus('received');
  } else if (status === 'CANCELED') {
    setOrderStatus('cancelled');
    stopTimer(); stopPolling();
    saveToHistory('', '已取消');
    currentOrderId = null;
    showToast('订单已取消', 'info');
  } else if (status === 'TIMEOUT') {
    setOrderStatus('timeout');
    stopTimer(); stopPolling();
    saveToHistory('', '已超时');
    currentOrderId = null;
    showToast('订单已超时', 'info');
  }
}

/* ════════════════════════════════════════════
   倒计时（对齐 #order-timer）
   ════════════════════════════════════════════ */
function startTimer(seconds) {
  remainingSeconds = seconds;
  stopTimer();
  timerInterval = setInterval(() => {
    remainingSeconds--;
    updateTimerUI();
    if (remainingSeconds <= 0) { stopTimer(); onOrderStatusChange('TIMEOUT'); }
  }, 1000);
  updateTimerUI();
}

function stopTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
}

function updateTimerUI() {
  const el = document.getElementById('order-timer');
  if (!el) return;
  const m = Math.floor(remainingSeconds / 60);
  const s = remainingSeconds % 60;
  el.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  el.classList.remove('op-meta-val--warning', 'op-meta-val--danger');
  if (remainingSeconds <= 60)       el.classList.add('op-meta-val--danger');
  else if (remainingSeconds <= 300) el.classList.add('op-meta-val--warning');
}

/* ════════════════════════════════════════════
   SMS 列表渲染
   ════════════════════════════════════════════ */
function addSMSToList(sms, otp) {
  const list = document.getElementById('sms-list');
  if (!list) return;

  let textHTML = sms.text || '';
  if (otp) textHTML = textHTML.replace(new RegExp(otp, 'g'), `<mark>${otp}</mark>`);
  const time = sms.created_at
    ? new Date(sms.created_at).toLocaleTimeString()
    : new Date().toLocaleTimeString();

  const item = document.createElement('div');
  item.className = 'op-sms-item';
  item.innerHTML = `
    <div class="op-sms-item__meta">
      <span class="op-sms-item__sender">📩 ${sms.sender || '未知发件人'}</span>
      <span class="op-sms-item__time">${time}</span>
    </div>
    <p class="op-sms-item__text">${textHTML}</p>`;
  list.prepend(item);

  const countEl = document.getElementById('sms-count');
  if (countEl) countEl.textContent = list.querySelectorAll('.op-sms-item').length;
}

/* ════════════════════════════════════════════
   操作按钮
   ════════════════════════════════════════════ */
async function cancelOrder() {
  if (!currentOrderId) return;
  if (!confirm('确定取消此订单？')) return;
  try {
    await fetch(`/api/sms/order/${currentOrderId}/cancel`, { method: 'POST' });
    onOrderStatusChange('CANCELED');
  } catch (err) {
    showToast('取消失败，请重试', 'error');
  }
}

async function finishOrder() {
  if (!currentOrderId) return;
  try {
    await fetch(`/api/sms/order/${currentOrderId}/finish`, { method: 'POST' });
    stopPolling(); stopTimer();
    saveToHistory(document.getElementById('otp-code')?.textContent || '', '已使用');
    setOrderStatus('finished');
    showToast('订单已完成 ✅', 'success');
    currentOrderId = null;
  } catch (err) {
    showToast('完成失败，请重试', 'error');
  }
}

async function rebuyNumber() {
  if (!selectedService || !selectedCountry) {
    showToast('请重新选择服务和国家', 'error'); return;
  }
  stopPolling(); stopTimer();
  currentOrderId = null;
  backToSelection();
  await buyNumber();
}

/* 返回选号界面（侧边栏"重新选号"按钮 & rebuy 共用）*/
function backToSelection() {
  stopPolling(); stopTimer();
  currentOrderId = null;
  const buyLayout   = document.getElementById('buy-layout');
  const stepsBar    = document.getElementById('steps-indicator');
  const orderLayout = document.getElementById('order-layout');
  if (orderLayout) orderLayout.style.display = 'none';
  if (buyLayout)   buyLayout.style.display   = '';
  if (stepsBar)    stepsBar.style.display    = '';
}

/* ════════════════════════════════════════════
   复制操作
   ════════════════════════════════════════════ */
function copyOrderNumber() {
  const el = document.getElementById('order-number'); // ← 正确 ID
  if (!el) return;
  navigator.clipboard.writeText(el.textContent.replace(/\s/g, '')).then(() => {
    const t = document.getElementById('copy-number-text');
    if (t) { const orig = t.textContent; t.textContent = '已复制 ✓'; setTimeout(() => t.textContent = orig, 2000); }
    showToast('号码已复制', 'success');
  }).catch(() => showToast('复制失败', 'error'));
}

function copyOTP() {
  const el = document.getElementById('otp-code');
  if (!el) return;
  navigator.clipboard.writeText(el.textContent.trim()).then(() => {
    showToast('验证码已复制', 'success');
  }).catch(() => showToast('复制失败', 'error'));
}

/* ════════════════════════════════════════════
   声音
   ════════════════════════════════════════════ */
function toggleSound() {
  soundEnabled = !soundEnabled;
  const btn = document.getElementById('sound-toggle');
  if (btn) btn.textContent = soundEnabled ? '🔔' : '🔕';
  showToast(soundEnabled ? '声音提示已开启' : '声音提示已关闭', 'info');
}

function playBeep() {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 880; osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5);
  } catch (_) {}
}

/* ════════════════════════════════════════════
   历史记录（localStorage）
   ════════════════════════════════════════════ */
const SMS_HISTORY_KEY = 'sms_history';

function saveToHistory(code, status) {
  try {
    const list = JSON.parse(localStorage.getItem(SMS_HISTORY_KEY) || '[]');
    list.unshift({
      id:       'H-' + Date.now(),
      number:   currentOrderData?.phone   || '',
      platform: selectedService?.name     || currentOrderData?.product || '',
      country:  selectedCountry?.name     || currentOrderData?.country || '',
      operator: selectedOperator?.operator || currentOrderData?.operator || '',
      code:     code || '',
      status:   status || '已使用',
      time:     new Date().toLocaleString(),
    });
    if (list.length > 200) list.splice(200);
    localStorage.setItem(SMS_HISTORY_KEY, JSON.stringify(list));
  } catch (_) {}
}

/* ════════════════════════════════════════════
   工具函数
   ════════════════════════════════════════════ */
function formatPhoneNumber(phone) {
  if (!phone) return '—';
  const s = String(phone).trim();
  return s.startsWith('+') ? s : '+' + s;
}

function showToast(msg, type) {
  const d = document.createElement('div');
  d.className = `toast toast--${type || 'info'}`;
  d.textContent = msg;
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 3000);
}

/* ── 页面卸载清理 ── */
window.addEventListener('beforeunload', () => { stopPolling(); stopTimer(); });
