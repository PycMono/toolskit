/* ==================================================
   Tool Box Nova - 时间戳转换器 JS
   ================================================== */

// ===== 实时时钟 =====
function updateClock() {
  const now = Date.now();
  const sec = Math.floor(now / 1000);
  document.getElementById('tsNow').textContent = sec;
  document.getElementById('tsNowMs').textContent = now;
  document.getElementById('tsNowHuman').textContent = new Date().toLocaleString('zh-CN');
}
setInterval(updateClock, 1000);
updateClock();

document.getElementById('copyTsNow')?.addEventListener('click', function () {
  navigator.clipboard.writeText(document.getElementById('tsNow').textContent).then(() => {
    this.textContent = '✅ 已复制'; setTimeout(() => { this.textContent = '📋 复制'; }, 2000);
  });
});

// ===== 时间戳 → 日期 =====
document.getElementById('ts2dateBtn')?.addEventListener('click', ts2date);
document.getElementById('ts2dateInput')?.addEventListener('keydown', e => { if (e.key === 'Enter') ts2date(); });

function ts2date() {
  const raw = document.getElementById('ts2dateInput').value.trim();
  const unit = document.getElementById('ts2dateUnit').value;
  if (!raw) return;
  const ms = unit === 'ms' ? parseInt(raw) : parseInt(raw) * 1000;
  if (isNaN(ms)) return alert('无效的时间戳');
  const d = new Date(ms);
  document.getElementById('ts2dateLocal').textContent = d.toLocaleString('zh-CN');
  document.getElementById('ts2dateUtc').textContent = d.toUTCString();
  document.getElementById('ts2dateIso').textContent = d.toISOString();
  document.getElementById('ts2dateRelative').textContent = relativeTime(ms);
  document.getElementById('ts2dateResult').classList.remove('hidden');
}

// ===== 日期 → 时间戳 =====
// 设置默认值为当前时间
const now = new Date();
const pad = n => String(n).padStart(2, '0');
document.getElementById('date2tsInput').value =
  `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

document.getElementById('date2tsBtn')?.addEventListener('click', date2ts);

function date2ts() {
  const val = document.getElementById('date2tsInput').value;
  if (!val) return;
  const d = new Date(val);
  const sec = Math.floor(d.getTime() / 1000);
  const ms = d.getTime();
  document.getElementById('date2tsSec').textContent = sec;
  document.getElementById('date2tsMs').textContent = ms;
  document.getElementById('date2tsUtc').textContent = d.toUTCString();
  document.getElementById('date2tsResult').classList.remove('hidden');
}

// Copy buttons in result table
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    const val = this.closest('tr').querySelector('td:nth-child(2)').textContent;
    navigator.clipboard.writeText(val).then(() => {
      const old = this.textContent; this.textContent = '✅';
      setTimeout(() => { this.textContent = old; }, 1500);
    });
  });
});

// ===== 时区转换 =====
function updateTz() {
  const from = document.getElementById('tzFrom').value;
  const to = document.getElementById('tzTo').value;
  const d = new Date();
  try {
    const fromStr = d.toLocaleString('zh-CN', { timeZone: from });
    const toStr = d.toLocaleString('zh-CN', { timeZone: to });
    document.getElementById('tzNowResult').innerHTML =
      `<strong>${from}</strong>: ${fromStr}<br><strong>${to}</strong>: ${toStr}`;
  } catch (e) {
    document.getElementById('tzNowResult').textContent = '时区转换错误: ' + e.message;
  }
}
document.getElementById('tzFrom')?.addEventListener('change', updateTz);
document.getElementById('tzTo')?.addEventListener('change', updateTz);
updateTz();
setInterval(updateTz, 10000);

// ===== 批量转换 =====
document.getElementById('batchTsBtn')?.addEventListener('click', function () {
  const lines = document.getElementById('batchTsInput').value.split('\n').filter(l => l.trim());
  const html = lines.map(line => {
    const ts = parseInt(line.trim());
    if (isNaN(ts)) return `<tr><td class="text-danger">${line}</td><td>无效</td><td></td></tr>`;
    const ms = String(ts).length > 10 ? ts : ts * 1000;
    const d = new Date(ms);
    return `<tr><td><code>${ts}</code></td><td>${d.toLocaleString('zh-CN')}</td><td>${d.toISOString()}</td></tr>`;
  }).join('');
  document.getElementById('batchTsResult').innerHTML =
    `<table class="ts-result-table"><thead><tr><th>时间戳</th><th>本地时间</th><th>ISO 8601</th></tr></thead><tbody>${html}</tbody></table>`;
  document.getElementById('batchTsResult').classList.remove('hidden');
});

// ===== Helper =====
function relativeTime(ms) {
  const diff = Date.now() - ms;
  const abs = Math.abs(diff);
  const future = diff < 0;
  const s = Math.floor(abs / 1000);
  if (s < 60) return future ? `${s} 秒后` : `${s} 秒前`;
  const m = Math.floor(s / 60);
  if (m < 60) return future ? `${m} 分钟后` : `${m} 分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return future ? `${h} 小时后` : `${h} 小时前`;
  const d = Math.floor(h / 24);
  return future ? `${d} 天后` : `${d} 天前`;
}

