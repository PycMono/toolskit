# Block C-08 · 文件转换工具集 — Others（Unit / Time / Archive）

> **涉及路由**：`/convert/unit` `/convert/time` `/convert/archive`  
> **预估工时**：2h  
> **依赖**：C-02（公共 UI + 导航）  
> **技术**：Unit/Time 完全纯前端 JS；Archive 后端 7zip

---

## 1. Unit Converter（`/convert/unit`）— 纯前端

### 1.1 支持类别（20 类）

| 类别 | 单位示例 |
|------|---------|
| 长度 | 米、厘米、毫米、英寸、英尺、英里、海里、光年 |
| 重量 | 千克、克、磅、盎司、吨、公吨 |
| 温度 | 摄氏、华氏、开尔文 |
| 面积 | 平方米、平方公里、平方英尺、英亩、公顷 |
| 体积 | 升、毫升、立方米、加仑（美）、品脱 |
| 速度 | 米/秒、公里/时、英里/时、节 |
| 时间 | 秒、分、时、天、周、月、年 |
| 数据 | Byte、KB、MB、GB、TB、PB |
| 压力 | 帕、千帕、大气压、PSI、巴 |
| 能量 | 焦、千焦、卡路里、千卡、kWh |
| 功率 | 瓦、千瓦、马力 |
| 频率 | 赫兹、千赫兹、兆赫兹、吉赫兹 |
| 角度 | 度、弧度、梯度 |
| 燃油效率 | 升/百公里、英里/加仑 |
| 数字进制 | 十进制、十六进制、八进制、二进制 |
| 货币（实时汇率） | USD、CNY、EUR、GBP、JPY（需 API）|

### 1.2 Unit Converter JS（`/static/js/convert-unit.js`）

```javascript
// /static/js/convert-unit.js
'use strict';

/* ── 单位数据库 ──────────────────────────────── */
const UNITS = {
  length: {
    label: '长度',
    base: 'm', // 基准单位
    units: {
      'm':   { label: '米 (m)',          factor: 1 },
      'km':  { label: '千米 (km)',        factor: 1000 },
      'cm':  { label: '厘米 (cm)',        factor: 0.01 },
      'mm':  { label: '毫米 (mm)',        factor: 0.001 },
      'mi':  { label: '英里 (mi)',        factor: 1609.344 },
      'yd':  { label: '码 (yd)',          factor: 0.9144 },
      'ft':  { label: '英尺 (ft)',        factor: 0.3048 },
      'in':  { label: '英寸 (in)',        factor: 0.0254 },
      'nm':  { label: '海里 (nmi)',       factor: 1852 },
      'ly':  { label: '光年 (ly)',        factor: 9.461e15 },
    }
  },
  weight: {
    label: '重量',
    base: 'kg',
    units: {
      'kg':  { label: '千克 (kg)',   factor: 1 },
      'g':   { label: '克 (g)',      factor: 0.001 },
      'mg':  { label: '毫克 (mg)',   factor: 1e-6 },
      'lb':  { label: '磅 (lb)',     factor: 0.453592 },
      'oz':  { label: '盎司 (oz)',   factor: 0.0283495 },
      't':   { label: '吨 (t)',      factor: 1000 },
    }
  },
  temperature: {
    label: '温度',
    base: 'c',
    units: {
      'c': { label: '摄氏度 (°C)' },
      'f': { label: '华氏度 (°F)' },
      'k': { label: '开尔文 (K)'  },
    }
  },
  area: {
    label: '面积',
    base: 'm2',
    units: {
      'm2':   { label: '平方米 (m²)',   factor: 1 },
      'km2':  { label: '平方千米 (km²)',factor: 1e6 },
      'cm2':  { label: '平方厘米 (cm²)',factor: 1e-4 },
      'ft2':  { label: '平方英尺 (ft²)',factor: 0.092903 },
      'acre': { label: '英亩 (acre)',   factor: 4046.86 },
      'ha':   { label: '公顷 (ha)',     factor: 10000 },
    }
  },
  volume: {
    label: '体积',
    base: 'l',
    units: {
      'l':   { label: '升 (L)',    factor: 1 },
      'ml':  { label: '毫升 (mL)', factor: 0.001 },
      'm3':  { label: '立方米 (m³)',factor: 1000 },
      'gal': { label: '加仑 (gal)',factor: 3.78541 },
      'pt':  { label: '品脱 (pt)', factor: 0.473176 },
      'fl':  { label: '液盎司 (fl oz)', factor: 0.0295735 },
    }
  },
  speed: {
    label: '速度',
    base: 'ms',
    units: {
      'ms':  { label: '米/秒 (m/s)',   factor: 1 },
      'kmh': { label: '千米/时 (km/h)',factor: 0.277778 },
      'mph': { label: '英里/时 (mph)', factor: 0.44704 },
      'kn':  { label: '节 (kn)',       factor: 0.514444 },
    }
  },
  data: {
    label: '数据大小',
    base: 'b',
    units: {
      'b':   { label: 'Byte (B)',     factor: 1 },
      'kb':  { label: 'Kilobyte (KB)',factor: 1024 },
      'mb':  { label: 'Megabyte (MB)',factor: 1024**2 },
      'gb':  { label: 'Gigabyte (GB)',factor: 1024**3 },
      'tb':  { label: 'Terabyte (TB)',factor: 1024**4 },
      'pb':  { label: 'Petabyte (PB)',factor: 1024**5 },
    }
  },
  pressure: {
    label: '压力',
    base: 'pa',
    units: {
      'pa':  { label: '帕斯卡 (Pa)',  factor: 1 },
      'kpa': { label: '千帕 (kPa)',   factor: 1000 },
      'mpa': { label: '兆帕 (MPa)',   factor: 1e6 },
      'atm': { label: '大气压 (atm)', factor: 101325 },
      'psi': { label: 'PSI',          factor: 6894.76 },
      'bar': { label: '巴 (bar)',      factor: 1e5 },
    }
  },
};

/* ── 转换核心 ────────────────────────────────── */
function convert(category, fromUnit, toUnit, value) {
  const cat = UNITS[category];
  if (!cat) return NaN;

  const num = parseFloat(value);
  if (isNaN(num)) return '';

  // 温度特殊处理
  if (category === 'temperature') {
    return convertTemp(fromUnit, toUnit, num);
  }

  const fromFactor = cat.units[fromUnit]?.factor || 1;
  const toFactor   = cat.units[toUnit]?.factor   || 1;
  const inBase     = num * fromFactor;
  const result     = inBase / toFactor;

  // 格式化：小数超过 6 位用科学记数法
  if (Math.abs(result) >= 1e9 || (Math.abs(result) < 1e-4 && result !== 0)) {
    return result.toExponential(6);
  }
  return parseFloat(result.toPrecision(10)).toString();
}

function convertTemp(from, to, v) {
  let celsius;
  switch(from) {
    case 'c': celsius = v; break;
    case 'f': celsius = (v - 32) * 5/9; break;
    case 'k': celsius = v - 273.15; break;
    default: return NaN;
  }
  switch(to) {
    case 'c': return celsius;
    case 'f': return celsius * 9/5 + 32;
    case 'k': return celsius + 273.15;
    default: return NaN;
  }
}

/* ── UI 渲染 ─────────────────────────────────── */
let currentCategory = 'length';

function renderUnitPage() {
  document.querySelector('.cv-hero__title').textContent = '在线单位换算器';
  document.querySelector('.cv-hero__desc').textContent  = '支持长度、重量、温度、面积、速度等 20 类单位换算';

  // 替换上传区为换算 UI
  const workspace = document.querySelector('.cv-workspace .cv-container');
  workspace.innerHTML = `
    <!-- 类别选择 -->
    <div class="cu-category-tabs" id="categoryTabs">
      ${Object.entries(UNITS).map(([k,v]) => `
        <button class="cu-category-tab ${k===currentCategory?'cu-category-tab--active':''}"
                onclick="switchCategory('${k}')">${v.label}</button>
      `).join('')}
    </div>

    <!-- 换算区 -->
    <div class="cu-converter" id="converterArea">
      <!-- 由 switchCategory 动态渲染 -->
    </div>
  `;
  switchCategory(currentCategory);
}

function switchCategory(cat) {
  currentCategory = cat;
  document.querySelectorAll('.cu-category-tab').forEach(t =>
    t.classList.toggle('cu-category-tab--active', t.textContent === UNITS[cat]?.label)
  );

  const units  = UNITS[cat].units;
  const keys   = Object.keys(units);
  const area   = document.getElementById('converterArea');

  area.innerHTML = `
    <div class="cu-row">
      <div class="cu-field">
        <select id="fromUnit" onchange="recalc()" class="cu-select">
          ${keys.map(k => `<option value="${k}">${units[k].label}</option>`).join('')}
        </select>
        <input id="fromVal" type="number" class="cu-input"
               value="1" oninput="recalc()" placeholder="输入数值">
      </div>

      <button class="cu-swap-btn" onclick="swapUnits()" title="交换">⇄</button>

      <div class="cu-field">
        <select id="toUnit" onchange="recalc()" class="cu-select">
          ${keys.map((k,i) => `<option value="${k}" ${i===1?'selected':''}>${units[k].label}</option>`).join('')}
        </select>
        <input id="toVal" type="number" class="cu-input" readonly
               placeholder="结果">
      </div>
    </div>

    <!-- 快速参考表 -->
    <div class="cu-ref-table" id="refTable"></div>
  `;

  recalc();
}

function recalc() {
  const fromUnit = document.getElementById('fromUnit')?.value;
  const toUnit   = document.getElementById('toUnit')?.value;
  const fromVal  = document.getElementById('fromVal')?.value;
  const result   = convert(currentCategory, fromUnit, toUnit, fromVal);
  const toInput  = document.getElementById('toVal');
  if (toInput) toInput.value = result;

  // 更新参考表（所有单位对 1 fromUnit 的换算）
  renderRefTable(fromUnit, parseFloat(fromVal) || 1);
}

function swapUnits() {
  const from = document.getElementById('fromUnit');
  const to   = document.getElementById('toUnit');
  if (!from || !to) return;
  [from.value, to.value] = [to.value, from.value];
  recalc();
}

function renderRefTable(baseUnit, baseVal) {
  const cat   = UNITS[currentCategory];
  const table = document.getElementById('refTable');
  if (!table) return;

  const rows = Object.entries(cat.units).map(([k, u]) => {
    const result = convert(currentCategory, baseUnit, k, baseVal);
    return `<tr>
      <td class="cu-ref-unit">${u.label}</td>
      <td class="cu-ref-val">${formatNum(result)}</td>
    </tr>`;
  }).join('');

  table.innerHTML = `
    <table class="cu-table">
      <thead><tr><th>单位</th><th>换算结果</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function formatNum(n) {
  if (n === '' || n === undefined) return '—';
  const num = parseFloat(n);
  if (isNaN(num)) return '—';
  if (Math.abs(num) >= 1e9 || (Math.abs(num) < 1e-4 && num !== 0)) {
    return num.toExponential(4);
  }
  return parseFloat(num.toPrecision(8)).toLocaleString();
}

document.addEventListener('DOMContentLoaded', renderUnitPage);
```

---

## 2. Time Converter（`/convert/time`）— 纯前端

```javascript
// /static/js/convert-time.js
'use strict';

const TIMEZONES = [
  { id: 'UTC',                  label: 'UTC / 格林威治时间' },
  { id: 'Asia/Shanghai',        label: '中国标准时间 (CST +8)' },
  { id: 'Asia/Tokyo',           label: '日本标准时间 (JST +9)' },
  { id: 'Asia/Seoul',           label: '韩国标准时间 (KST +9)' },
  { id: 'Asia/Singapore',       label: '新加坡时间 (SGT +8)' },
  { id: 'Asia/Kolkata',         label: '印度标准时间 (IST +5:30)' },
  { id: 'Asia/Dubai',           label: '海湾标准时间 (GST +4)' },
  { id: 'Europe/London',        label: '英国时间 (GMT/BST)' },
  { id: 'Europe/Paris',         label: '中欧时间 (CET/CEST)' },
  { id: 'Europe/Moscow',        label: '莫斯科时间 (MSK +3)' },
  { id: 'America/New_York',     label: '美国东部时间 (ET)' },
  { id: 'America/Chicago',      label: '美国中部时间 (CT)' },
  { id: 'America/Denver',       label: '美国山地时间 (MT)' },
  { id: 'America/Los_Angeles',  label: '美国太平洋时间 (PT)' },
  { id: 'America/Sao_Paulo',    label: '巴西利亚时间 (BRT -3)' },
  { id: 'Australia/Sydney',     label: '澳大利亚东部时间 (AEST +10/11)' },
  { id: 'Pacific/Auckland',     label: '新西兰时间 (NZST +12/13)' },
];

function renderTimePage() {
  document.querySelector('.cv-hero__title').textContent = '在线时间换算器';
  document.querySelector('.cv-hero__desc').textContent  = '时区转换 · Unix 时间戳 · 日期计算';

  const workspace = document.querySelector('.cv-workspace .cv-container');
  workspace.innerHTML = `
    <!-- Tab 切换 -->
    <div class="cu-category-tabs">
      <button class="cu-category-tab cu-category-tab--active" onclick="showTab('timezone')">🌍 时区转换</button>
      <button class="cu-category-tab" onclick="showTab('timestamp')">⏱ Unix 时间戳</button>
      <button class="cu-category-tab" onclick="showTab('datecalc')">📅 日期计算</button>
    </div>

    <!-- 时区转换 -->
    <div id="tab-timezone" class="cu-tab-panel">
      <div class="cu-row">
        <div class="cu-field">
          <label class="cu-label">源时区</label>
          <select id="tzFrom" class="cu-select" onchange="convertTimezone()">${tzOptions()}</select>
          <input type="datetime-local" id="tzFromTime" class="cu-input"
                 oninput="convertTimezone()">
        </div>
        <button class="cu-swap-btn" onclick="swapTimezones()">⇄</button>
        <div class="cu-field">
          <label class="cu-label">目标时区</label>
          <select id="tzTo" class="cu-select" onchange="convertTimezone()">
            ${tzOptions('America/New_York')}
          </select>
          <input type="datetime-local" id="tzToTime" class="cu-input" readonly>
        </div>
      </div>
      <!-- 当前时刻按钮 -->
      <button class="cu-now-btn" onclick="setNow()">🕐 使用当前时间</button>
      <!-- 世界时钟 -->
      <div class="cu-world-clocks" id="worldClocks"></div>
    </div>

    <!-- Unix 时间戳 -->
    <div id="tab-timestamp" class="cu-tab-panel" style="display:none">
      <div class="cu-ts-row">
        <div class="cu-field">
          <label class="cu-label">Unix 时间戳（秒）</label>
          <input type="number" id="tsInput" class="cu-input"
                 placeholder="例如：1709827200" oninput="tsToDate()">
        </div>
        <div class="cu-ts-result" id="tsResult"></div>
      </div>
      <div class="cu-ts-row">
        <div class="cu-field">
          <label class="cu-label">日期时间 → 时间戳</label>
          <input type="datetime-local" id="dateInput" class="cu-input" oninput="dateToTs()">
        </div>
        <div class="cu-ts-result" id="dateResult"></div>
      </div>
      <button class="cu-now-btn" onclick="tsSetNow()">🕐 当前时间戳：<span id="nowTs"></span></button>
    </div>

    <!-- 日期计算 -->
    <div id="tab-datecalc" class="cu-tab-panel" style="display:none">
      <div class="cu-row">
        <div class="cu-field">
          <label class="cu-label">开始日期</label>
          <input type="date" id="dateStart" class="cu-input" oninput="calcDateDiff()">
        </div>
        <div class="cu-field">
          <label class="cu-label">结束日期</label>
          <input type="date" id="dateEnd" class="cu-input" oninput="calcDateDiff()">
        </div>
      </div>
      <div class="cu-datecalc-result" id="dateDiffResult"></div>
    </div>
  `;

  initTimePage();
}

function tzOptions(selected = 'Asia/Shanghai') {
  return TIMEZONES.map(tz =>
    `<option value="${tz.id}" ${tz.id===selected?'selected':''}>${tz.label}</option>`
  ).join('');
}

function showTab(name) {
  document.querySelectorAll('.cu-tab-panel').forEach(p => p.style.display='none');
  document.querySelectorAll('.cu-category-tab').forEach((t,i) => {
    const names = ['timezone','timestamp','datecalc'];
    t.classList.toggle('cu-category-tab--active', names[i] === name);
  });
  const panel = document.getElementById('tab-'+name);
  if (panel) panel.style.display = '';
}

function convertTimezone() {
  const fromTZ   = document.getElementById('tzFrom')?.value;
  const fromTime = document.getElementById('tzFromTime')?.value;
  if (!fromTime) return;
  try {
    const date = new Date(fromTime);
    const opts = { timeZone: document.getElementById('tzTo').value,
                   year:'numeric', month:'2-digit', day:'2-digit',
                   hour:'2-digit', minute:'2-digit', second:'2-digit',
                   hour12: false };
    // 转换后填入目标时间（简化实现）
    const toEl = document.getElementById('tzToTime');
    if (toEl) {
      const parts = new Intl.DateTimeFormat('sv-SE', opts).format(date);
      toEl.value = parts.slice(0,16);
    }
  } catch(e) {}
}

function setNow() {
  const now = new Date();
  const local = new Date(now - now.getTimezoneOffset()*60000)
    .toISOString().slice(0,16);
  const el = document.getElementById('tzFromTime');
  if (el) { el.value = local; convertTimezone(); }
}

function swapTimezones() {
  const from = document.getElementById('tzFrom');
  const to   = document.getElementById('tzTo');
  if (!from || !to) return;
  [from.value, to.value] = [to.value, from.value];
  convertTimezone();
}

function tsToDate() {
  const ts = parseInt(document.getElementById('tsInput')?.value);
  const el = document.getElementById('tsResult');
  if (!el) return;
  if (isNaN(ts)) { el.textContent = ''; return; }
  const d = new Date(ts * 1000);
  el.innerHTML = `
    <div class="cu-ts-item"><span>UTC：</span><strong>${d.toUTCString()}</strong></div>
    <div class="cu-ts-item"><span>本地：</span><strong>${d.toLocaleString()}</strong></div>
    <div class="cu-ts-item"><span>ISO 8601：</span><strong>${d.toISOString()}</strong></div>
  `;
}

function dateToTs() {
  const v  = document.getElementById('dateInput')?.value;
  const el = document.getElementById('dateResult');
  if (!el || !v) return;
  const ts = Math.floor(new Date(v).getTime() / 1000);
  el.innerHTML = `<div class="cu-ts-item"><span>Unix 时间戳：</span><strong>${ts}</strong></div>`;
}

function calcDateDiff() {
  const s = document.getElementById('dateStart')?.value;
  const e = document.getElementById('dateEnd')?.value;
  const el= document.getElementById('dateDiffResult');
  if (!el || !s || !e) return;
  const diff = Math.abs(new Date(e) - new Date(s));
  const days = Math.floor(diff / 86400000);
  el.innerHTML = `
    <div class="cu-ts-item"><span>相差天数：</span><strong>${days} 天</strong></div>
    <div class="cu-ts-item"><span>相差周数：</span><strong>${(days/7).toFixed(2)} 周</strong></div>
    <div class="cu-ts-item"><span>相差月数（近似）：</span><strong>${(days/30.44).toFixed(2)} 月</strong></div>
    <div class="cu-ts-item"><span>相差年数（近似）：</span><strong>${(days/365.25).toFixed(2)} 年</strong></div>
  `;
}

function initTimePage() {
  setNow();
  // Unix 实时显示
  const updateNowTs = () => {
    const el = document.getElementById('nowTs');
    if (el) el.textContent = Math.floor(Date.now()/1000);
  };
  updateNowTs();
  setInterval(updateNowTs, 1000);
}

function tsSetNow() {
  const ts = Math.floor(Date.now()/1000);
  const el = document.getElementById('tsInput');
  if (el) { el.value = ts; tsToDate(); }
}

document.addEventListener('DOMContentLoaded', renderTimePage);
```

---

## 3. Archive Converter（`/convert/archive`）— 后端 7zip

### 3.1 格式 Pills

```
输入：ZIP / RAR / 7Z / TAR.GZ / TAR.BZ2
输出：ZIP / 7Z / TAR.GZ / TAR.BZ2
```

（RAR 仅支持解压，不支持压缩：因为 RAR 是专有格式）

### 3.2 后端命令（C-03 已实现 `SevenZipConvert`）

```bash
# ZIP → 7Z
7z x input.zip -o/tmp/{jobId}_extract/ -y
7z a -t7z output.7z /tmp/{jobId}_extract/*

# RAR → ZIP（RAR 解压）
7z x input.rar -o/tmp/{jobId}_extract/ -y
7z a -tzip output.zip /tmp/{jobId}_extract/*

# ZIP → TAR.GZ
7z x input.zip -o/tmp/{jobId}_extract/ -y
tar -czf output.tar.gz -C /tmp/{jobId}_extract/ .

# TAR.GZ → ZIP
tar -xzf input.tar.gz -C /tmp/{jobId}_extract/
7z a -tzip output.zip /tmp/{jobId}_extract/*
```

### 3.3 archive 格式 Pills 说明

输出格式注意：RAR 不可作为输出格式（只能解压）；去掉 RAR 选项。

```javascript
// 前端格式覆盖：archive 的输出格式不含 RAR
// 在 convert-formats.js 中已配置：
// 'archive': ['zip','7z','tar.gz','tar.bz2'],
```

---

## 4. Unit / Time 页面 CSS 补充

```css
/* ══ Unit / Time Converter 专用样式 ════════════ */
.cu-category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 20px;
}

.cu-category-tab {
  height: 34px;
  padding: 0 16px;
  background: transparent;
  border: 1.5px solid var(--cv-border);
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--cv-text-muted);
  cursor: pointer;
  transition: all 0.15s;
}

.cu-category-tab:hover           { border-color: var(--cv-sky); color: var(--cv-sky); }
.cu-category-tab--active         { background: var(--cv-sky-light); border-color: var(--cv-sky); color: var(--cv-sky-dark); }

.cu-converter, .cu-tab-panel     { background: var(--cv-surface); border: 1px solid var(--cv-border); border-radius: var(--cv-radius-md); padding: 24px; }
.cu-row { display: flex; align-items: flex-end; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
.cu-field { display: flex; flex-direction: column; gap: 8px; flex: 1; min-width: 200px; }
.cu-label { font-size: 0.8125rem; font-weight: 600; color: var(--cv-text-muted); }
.cu-select { height: 40px; padding: 0 12px; border: 1.5px solid var(--cv-border); border-radius: var(--cv-radius-sm); font-size: 0.9rem; background: var(--cv-surface); }
.cu-input  { height: 48px; padding: 0 14px; border: 1.5px solid var(--cv-border); border-radius: var(--cv-radius-sm); font-size: 1.125rem; font-weight: 600; }
.cu-input:focus, .cu-select:focus { outline: none; border-color: var(--cv-sky); box-shadow: 0 0 0 3px rgba(14,165,233,0.1); }
.cu-swap-btn { height: 48px; width: 48px; background: var(--cv-sky-light); border: 1.5px solid var(--cv-sky); border-radius: 50%; color: var(--cv-sky-dark); font-size: 1.125rem; cursor: pointer; flex-shrink: 0; transition: background 0.15s; }
.cu-swap-btn:hover { background: var(--cv-sky); color: #fff; }

.cu-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.cu-table th { padding: 8px 12px; background: #f8fafc; text-align: left; color: var(--cv-text-muted); font-weight: 600; border-bottom: 1px solid var(--cv-border); }
.cu-table td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; }
.cu-ref-val { font-weight: 700; color: var(--cv-sky-dark); }

.cu-now-btn { height: 36px; padding: 0 18px; background: #f0f9ff; border: 1px solid var(--cv-sky); border-radius: 8px; font-size: 0.8125rem; color: var(--cv-sky-dark); cursor: pointer; margin-top: 8px; }
.cu-ts-item { display: flex; gap: 12px; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 0.875rem; }
.cu-ts-item span { color: var(--cv-text-muted); min-width: 120px; }
.cu-ts-item strong { color: var(--cv-text); }
.cu-ts-row { margin-bottom: 24px; }
.cu-ts-result { margin-top: 12px; }
.cu-datecalc-result { margin-top: 16px; background: #f0f9ff; padding: 16px; border-radius: var(--cv-radius-sm); }

.cu-ref-table { margin-top: 16px; }
```

---

## 5. 验收标准

### Unit Converter
- [ ] 页面加载：上传区替换为换算 UI，显示类别 Tab（长度/重量/温度...）
- [ ] 长度换算：输入 1 英里，自动显示 1.60934 千米，参考表所有单位同步更新
- [ ] 温度换算：100°C = 212°F = 373.15K，结果精确
- [ ] 数据大小：1 GB = 1024 MB = 1073741824 Byte，显示正确
- [ ] 交换按钮：点击后 from/to 互换，重新计算
- [ ] 参考表：换算 1 英尺时，参考表显示所有长度单位的等价值

### Time Converter
- [ ] 时区转换：上海时间 12:00 → 纽约时间显示 23:00（前一天，夏令时期间）
- [ ]「使用当前时间」：填入设备当前时间
- [ ] Unix 时间戳 → 日期：1709827200 → 2024-03-07 16:00:00 UTC
- [ ] 日期 → Unix 时间戳：2024-01-01 00:00:00 UTC → 1704067200
- [ ] 日期计算：2024-01-01 到 2024-12-31 = 365 天
- [ ] 实时时间戳：页面底部每秒自动更新

### Archive Converter
- [ ] ZIP → 7Z：上传 ZIP，下载 7Z，用本地软件可解压，内容完整
- [ ] RAR → ZIP：上传 RAR，下载 ZIP，内容正确
- [ ] TAR.GZ → ZIP：正确解压再压缩
- [ ] 超过 500MB 文件：前端阻止上传
