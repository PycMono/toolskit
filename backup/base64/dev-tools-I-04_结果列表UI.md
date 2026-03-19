# Developer Tools Suite — I-04 结果区 UI

---

## 1. 竞品结果区 UI 对标表

| UI 要素 | md5hashgenerator | base64encode.org | wordcounter.net | **本次实现** |
|--------|:----------------:|:----------------:|:---------------:|------------|
| 多算法并排 | ❌ | ❌ | ❌ | ✅ Hash 卡片列表（5 算法卡片） |
| 彩色算法标识 | ❌ | ❌ | ❌ | ✅ 左侧彩色边框区分算法强度 |
| 复制单个 | ✅（按钮） | ✅ | ❌ | ✅ 每卡片独立复制按钮 + Tooltip |
| 复制全部 | ❌ | ❌ | ❌ | ✅ "Copy All" 一键复制全部算法 |
| 下载结果 | ❌ | ✅ | ❌ | ✅ 下载 .txt |
| 字符统计面板 | ❌ | ❌ | ✅（复杂） | ✅ 数字卡片网格 + 大号数字 |
| 关键词图表 | ❌ | ❌ | ✅（慢，需会员详情） | ✅ Chart.js 横向柱状图，实时更新 |
| 可读性仪表盘 | ❌ | ❌ | ✅ | ✅ Flesch 分数 + 等级文字 + 色块 |
| 地图嵌入 | ❌ | ❌ | ❌ | ✅ Leaflet 地图（IP 工具） |
| Whois 双视图 | ❌ | ❌ | ❌ | ✅ 结构化 Tab + 原始文本 Tab |
| 历史记录 | ❌ | ❌ | ❌ | ✅ Whois 工具最近 10 条记录 |
| 复制动效 | ❌ | ❌ | ❌ | ✅ 按钮变绿 + Toast 飞入 |
| 实时更新 | ❌ | ❌ | ✅ | ✅ 全部工具实时更新 |

---

## 2. 各工具结果区 UI 说明

### 2.1 Hash 结果区

每个算法对应一张"算法卡片"，采用二行三列 Grid：

```
┌──────────────────────────────────────────────────┐
│  [•MD5]  128-bit  ⚠️                    [Copy]   │
│  5d41402abc4b2a76b9719d911017c592                │
├──────────────────────────────────────────────────┤
│  [•SHA-256] ✅ Recommended             [Copy]    │
│  2cf24dba5fb0a30e26...                           │
├──────────────────────────────────────────────────┤
│  [Copy All]  [Download .txt]                     │
└──────────────────────────────────────────────────┘
```

**卡片四种状态**：

| 状态 | 视觉表现 |
|------|---------|
| idle（等待输入） | `hash-value` 显示 `—`，灰色 |
| computing | `hash-value` 显示滚动骨架屏（shimmer animation） |
| done | 显示实际 hex 字符串，copyBtn 可点击 |
| uppercase | 值转大写，卡片 header 显示"UPPER"badge |

**复制按钮交互流程**：
1. 点击后 SVG icon 替换为 ✓ checkmark，按钮背景变 `--color-success`
2. 1.5s 后恢复原始状态（通过 `setTimeout` 控制）
3. Toast：`showToast('Copied!', 'success')` 从右下角飞入，3s 后飞出

---

### 2.2 Base64 结果区

```
┌────────────────────────────────────────────────┐
│  Output                    1234 characters     │
│ ┌──────────────────────────────────────────┐  │
│ │ SGVsbG8gV29ybGQ=                         │  │
│ │ ...（等宽字体，word-break: break-all）    │  │
│ └──────────────────────────────────────────┘  │
│  [Copy Output]  [Download .txt]  [Clear]       │
└────────────────────────────────────────────────┘
```

- 输出区使用 `<pre><code>` 标签，`white-space: pre-wrap`，`word-break: break-all`
- 字符计数实时更新，`gray` 小字排右对齐
- `Download .txt` 触发 `URL.createObjectURL` + `a.click()` 下载

---

### 2.3 URL 编解码结果区

**普通模式**：
```
┌───────────────────────────────────────────────┐
│  Result                                       │
│  Hello%20World%21                [Copy]       │
│                                               │
│  ● Diff view:                                 │
│  Hello[%20]World[%21]                         │
│  (蓝色高亮 = 已被编码的字符)                   │
└───────────────────────────────────────────────┘
```

**批量模式**：
```
┌───────────────────────────────────────────────┐
│  Batch Results (3 items)          [Copy All]  │
│  ─────────────────────────────────            │
│  1. https%3A%2F%2Fexample.com                 │
│  2. hello+world → [ERROR]                     │
│  3. foo%20bar                                 │
└───────────────────────────────────────────────┘
```

差异高亮 CSS：
```css
.diff-encoded {
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
  border-radius: 2px;
  padding: 0 2px;
  font-weight: 600;
}
.diff-same { color: var(--color-text-primary); }
```

---

### 2.4 IP 查询结果区

```
┌──────────────────────────────────────────────────────────────────┐
│  Your IP: 203.0.113.42 (IPv4)  |  2001:db8::1 (IPv6)  [Refresh] │
├─────────────────────────────────┬────────────────────────────────┤
│  Country:   United States 🇺🇸   │                                │
│  Region:    California          │    [Leaflet Map - 280px high]  │
│  City:      Los Angeles 90210   │                                │
│  ISP:       AS15169 Google LLC  │    marker at (34.05, -118.24)  │
│  ASN:       AS15169             │                                │
│  Timezone:  America/Los_Angeles │                                │
│  Lat/Lon:   34.0522, -118.2437  │                                │
└─────────────────────────────────┴────────────────────────────────┘
```

**布局规则**：
- 桌面端：左信息列（1fr）+ 右地图列（1fr），`min-height: 280px`
- 移动端：信息列在上，地图在下（`grid-template-columns: 1fr`）
- 地图卡片圆角 `var(--radius-lg)`，`overflow: hidden`

信息行 CSS：
```css
.ip-field {
  display: flex;
  justify-content: space-between;
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--color-border);
  font-size: 14px;
}
.ip-field__label { color: var(--color-text-secondary); font-weight: 500; }
.ip-field__value {
  color: var(--color-text-primary);
  font-family: 'JetBrains Mono', monospace;
}
```

---

### 2.5 Whois 结果区

```
┌────────────────────────────────────────────────────┐
│  [Structured View]  [Raw Data]    example.com      │
├────────────────────────────────────────────────────┤
│  Registrar:    GoDaddy.com, LLC                    │
│  Created:      2023-08-15 00:00:00 UTC             │
│  Expires:      2026-08-15 00:00:00 UTC [6 mo left] │
│  Updated:      2025-01-10 00:00:00 UTC             │
│  Status:       clientTransferProhibited            │
│  Nameservers:  ns1.example.com                     │
│                ns2.example.com                     │
├────────────────────────────────────────────────────┤
│  Recent:  example.com  google.com  github.com  …   │
└────────────────────────────────────────────────────┘
```

**Tab 切换实现**：
```javascript
function switchTab(tab) {
  ['structured', 'raw'].forEach(t => {
    const btn   = document.getElementById(`tab-${t}`);
    const panel = document.getElementById(`panel-${t}`);
    const active = t === tab;
    btn.setAttribute('aria-selected', String(active));
    panel.hidden = !active;
  });
}
```

**到期 Badge 逻辑**：
```javascript
function expiryBadge(expiresAt) {
  const days = Math.floor((new Date(expiresAt) - Date.now()) / 86400000);
  if (days < 0)  return `<span class="badge badge--error">Expired</span>`;
  if (days < 30) return `<span class="badge badge--error">${days}d left</span>`;
  if (days < 90) return `<span class="badge badge--warning">${Math.round(days/30)} mo left</span>`;
  return `<span class="badge badge--success">${Math.round(days/365)} yr left</span>`;
}
```

**历史记录持久化（localStorage）**：
```javascript
function saveHistory(domain) {
  const key = 'whois_history';
  let hist = JSON.parse(localStorage.getItem(key) || '[]');
  hist = [domain, ...hist.filter(d => d !== domain)].slice(0, 10);
  localStorage.setItem(key, JSON.stringify(hist));
  renderHistory(hist);
}
```

---

### 2.6 Word Counter 结果区

```
┌──────────────────────────────────────────────────────────┐
│  Statistics                                              │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │
│  │ 1024 │ │ 5630 │ │  47  │ │  12  │ │ 2min │ │  78  │ │
│  │Words │ │Chars │ │Sent. │ │Para. │ │ Read │ │Flesch│ │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ │
│                                                          │
│  Flesch:  78  ████████████░░░  (Standard)               │
│                                                          │
│  Keyword Density (Top 10):                               │
│  [Chart.js 横向柱状图 — 实时更新]                         │
│                                                          │
│  Flow Score:                                             │
│  [色带 — 每段代表一个句子，颜色代表句长区间]               │
└──────────────────────────────────────────────────────────┘
```

---

## 3. CSS 规范

### 统计数字卡片
```css
.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: var(--space-sm);
}
.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  text-align: center;
  transition: box-shadow var(--transition-fast);
}
.stat-card:hover { box-shadow: var(--shadow-md); }
.stat-card__number {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1.2;
}
.stat-card__number--updated {
  animation: numberPop 300ms ease-out;
}
.stat-card__label {
  font-size: 11px;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 4px;
}
@keyframes numberPop {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.15); color: var(--color-success); }
  100% { transform: scale(1); }
}
```

### Flesch 进度条
```css
.flesch-bar {
  height: 8px;
  background: var(--color-surface-alt);
  border-radius: var(--radius-full);
  overflow: hidden;
}
.flesch-fill {
  height: 100%;
  border-radius: var(--radius-full);
  background: linear-gradient(90deg,
    var(--color-error) 0%,
    var(--color-warning) 40%,
    var(--color-success) 80%);
  transition: width var(--transition-base);
}
```

### Flow Score 色带
```css
.flow-bar  { display: flex; height: 12px; border-radius: var(--radius-full); overflow: hidden; }
.flow-seg  { height: 100%; }
.flow-1    { background: #6366F1; }  /* 1词   — 强调 */
.flow-6    { background: #3B82F6; }  /* 2-6词  — 简短 */
.flow-15   { background: #10B981; }  /* 7-15词 — 标准 */
.flow-25   { background: #F59E0B; }  /* 16-25词 — 复杂 */
.flow-39   { background: #EF4444; }  /* 26-39词 — 长 */
.flow-40   { background: #7C3AED; }  /* 40+词  — 极长 */
```

### Whois Tab 样式
```css
.whois-tabs {
  display: flex;
  gap: 0;
  border-bottom: 2px solid var(--color-border);
  margin-bottom: var(--space-md);
}
.whois-tab {
  padding: var(--space-sm) var(--space-md);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  cursor: pointer;
  background: none;
  border-top: none;
  border-left: none;
  border-right: none;
  transition: color var(--transition-fast), border-color var(--transition-fast);
}
.whois-tab[aria-selected="true"] {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}
.whois-raw pre {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  overflow-x: auto;
  white-space: pre;
  line-height: 1.6;
  background: var(--color-surface-alt);
  padding: var(--space-md);
  border-radius: var(--radius-md);
}
```

### 历史记录标签
```css
.history-tag {
  display: inline-flex;
  align-items: center;
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: 12px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.history-tag:hover {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
  color: var(--color-primary);
}
```

---

## 4. 完整数据流 & 函数调用图

```
用户输入文字 / 选择文件
        │
        ▼
   onInputChange() / onFileSelect()
        │ debounce(300ms)
        ▼
   compute() / computeFromBuffer()
        │
   ┌────┼──────────────────────┐
   │    │                      │
   ▼    ▼                      ▼
 MD5  Web Crypto.digest()   HMAC (crypto-js)
(CryptoJS) [SHA-1/256/512]
   │    │                      │
   └────┴──────────────────────┘
        │
        ▼
   renderResults(results)
        │
   ┌────┼──────────────────────────────┐
   │    │                              │
   ▼    ▼                              ▼
 更新  hash-value 文字内容          更新 statusDot
 卡片  (cardEnter 入场动画)          "Ready"
        │
        ▼
   GA: gaTrackProcessDone()
        │
   ──────────────────────────────────────────────
   用户点击 [Copy] / [Copy All]
        │
        ▼
   navigator.clipboard.writeText()
   → 按钮变绿 ✓ (1.5s 后恢复)
   → showToast('Copied!', 'success')
   → GA: gaTrackDownload()
        │
   ──────────────────────────────────────────────
   用户点击 [Download .txt]
        │
        ▼
   buildBlob(results)
   URL.createObjectURL(blob)
   a.click()
   setTimeout(revokeObjectURL, 60000)  ← 内存安全释放
```

**Word Counter 数据流**：
```
textarea.input
        │ debounce(200ms)
        ▼
   worker.postMessage(text)
        │  [Web Worker 线程，不阻塞 UI]
        ▼
   analyze(text)
        ├─ countWords()          → wordCount, uniqueWords
        ├─ countSentences()      → sentences, avgSentenceLen
        ├─ calculateFlesch()     → fleschScore, fleschLevel
        ├─ buildKeywordMap()     → keywords[{ word, count, pct }]
        └─ buildFlowData()       → flowData[sentenceWordCounts]
        │
   worker.postMessage(stats)  [回主线程]
        │
        ▼
   renderStats(stats)
        ├─ 更新 6 个 stat-card 数字（numberPop 动画）
        ├─ 更新 fleschFill 进度条宽度（CSS transition）
        ├─ chart.destroy() + new Chart() 重绘关键词横向柱图
        └─ renderFlowHighlight() 色带实时更新

**IP 数据流**：
   DOMContentLoaded
        │
        ▼
   DevIP.loadMyIP()
        ├─ fetch('https://api.ipify.org')      → IPv4
        ├─ fetch('https://api64.ipify.org')    → IPv6（可选）
        └─ lookupIP(ipv4)
              ├─ fetch('http://ip-api.com/json/{ip}')
              ├─ renderIPData(data)
              │    ├─ 填充 .ip-field__value 各字段
              │    └─ updateMap(lat, lon, city, country)
              │         ├─ initMap() → L.map + OSM tile
              │         ├─ L.marker().bindPopup().openPopup()
              │         └─ map.flyTo(coords, zoom=10, 1.5s)
              └─ setStatus('')
```

---

## 5. 验收标准 Checklist

### 卡片 UI
- [ ] Hash 卡片 `md5` 左边框为橙色（`#F59E0B`）
- [ ] Hash 卡片 `sha256` 背景为浅绿，标注"✅ Recommended"
- [ ] 空输入时所有 hash-value 显示 `—`，copyBtn 处于 disabled 状态
- [ ] 计算中时 hash-value 显示骨架屏 shimmer 动画
- [ ] 字符数超过 64 时 hash-value 文字自动换行（`word-break: break-all`）
- [ ] 暗黑模式下卡片背景为 `#1E293B`，边框为 `#334155`

### 复制与 Toast
- [ ] 点击单个复制按钮：按钮变绿 + icon 变 ✓ + Toast 1 条
- [ ] "Copy All" 一次性复制所有非空算法，Toast 显示"All hashes copied!"
- [ ] Toast 从右下飞入，3s 后自动飞出（不堆积超过 3 条）
- [ ] 快速连续复制不产生重复 Toast（250ms 去重）

### IP 地图
- [ ] 页面加载后 Leaflet 地图容器渲染正常，无白屏
- [ ] flyTo 动画在 1.5s 内平滑移动到目标坐标
- [ ] marker popup 显示城市名和国家名
- [ ] 移动端地图高度 200px（桌面端 280px）

### Whois
- [ ] Tab 切换动画 150ms fade
- [ ] 到期日 < 30 天显示红色 badge
- [ ] 历史记录最多显示 10 条，已查询的域名排序到最前
- [ ] Raw 文本区域可横向滚动（`overflow-x: auto`）
- [ ] 刷新页面后历史记录持久化（localStorage）

### Word Counter 结果
- [ ] 输入文字后 stat-card 数字有 `numberPop` 动画
- [ ] Flesch 进度条宽度 = `fleschScore / 100 * 100%`
- [ ] 关键词图表最多显示 20 条，实时重绘（旧 chart 先销毁）
- [ ] Flow 色带随文字变化实时更新，短句为蓝色，长句为红色
- [ ] 纯中文文字：字符数正确计算，英文词数为 0
- [ ] 500 字以上文字统计在 200ms 内完成（Web Worker 不阻塞 UI）

### 批量下载
- [ ] Base64 下载 .txt 包含完整 base64 输出
- [ ] Hash 下载 .txt 格式为 `MD5: xxx\nSHA-1: xxx\n...`
- [ ] ObjectURL 在下载触发后 60s 内被 `revokeObjectURL` 释放

### 边界情况
- [ ] Base64 decode 非法字符串：显示 toast，输出区清空
- [ ] Whois 查询超时（10s）：显示"Request timed out."
- [ ] IP 查询结果 status=fail：显示 ip-api 返回的 message
- [ ] Word counter 输入 1,000,000 字符：无卡顿（Worker 隔离）
- [ ] 历史记录中点击域名：自动填入输入框并触发查询
- [ ] 所有工具在 iOS Safari 15+ 上可正常使用
