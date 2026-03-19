<!-- color-tools-I-04_结果列表UI.md -->

# Color Tools — 结果列表 UI (I-04)

---

## 1. 竞品结果区 UI 对标表

| UI 区域 | Coolors | HTMLColorCodes | Adobe Color | **本次实现** | 差异化 |
|---------|---------|----------------|-------------|:----------:|--------|
| **调色板色条** | 全宽5色竖条等宽 | 无调色板横条 | 5色横条+标签 | 全宽等比色条+悬停展开+拖拽+锁定 | 更丰富信息面板 |
| **颜色信息** | 悬停HEX，点击展开 | 内联HEX/RGB/HSL表格 | 滑杆+RGB/HSB | 悬停10格式信息条+一键复制 | 10种格式同时展示 |
| **操作按钮** | 锁定/调整/复制/删除 | 复制 | 保存/编辑 | 锁定/复制/删除/微调/拖拽 | 微调±5°色相 |
| **导出** | PDF/PNG/SVG(Pro付费) | 无批量 | CC Library+ASE | 8种格式全免费 | 零付费墙 |
| **统计** | 无 | 无 | 无 | 色数+明度分布+冷暖比 | **独家**统计 |
| **色盲对比** | 无 | 无 | 独立页面 | 内嵌Before/After滑块 | 不离开页面 |
| **渐变预览** | 简单两色条 | 无 | 无 | 全屏渐变+8空间+CSS代码 | 专业级 |

---

## 2. 结果卡片渲染说明

### `upsertResultCard(data)` 设计规则

#### 卡片布局（三列 grid）

```
┌──────────────────────────────────────────────────┐
│ ┌──────┐  ┌──────────────────────┐  ┌──────────┐│
│ │ 64px │  │ Color Name / HEX     │  │ 🔒 📋 ✕ ││
│ │ 色块 │  │ RGB: 99, 102, 241    │  │  操作    ││
│ │ 圆角 │  │ [HEX][RGB][HSL][▾]  │  │  按钮组  ││
│ └──────┘  └──────────────────────┘  └──────────┘│
└──────────────────────────────────────────────────┘
```

#### 四种状态 DOM

| 状态 | class | 视觉表现 |
|------|-------|---------|
| waiting | `.result-card--waiting` | 色块`?`占位，"等待处理…"，`opacity:0.6` |
| processing | `.result-card--processing` | 进度条动画，脉冲"处理中…" |
| done | `.result-card--done` | 实际颜色，全格式，按钮可用 |
| error | `.result-card--error` | ⚠️图标，红色错误文字+重试 |

#### 伪进度条动画

```javascript
function startFakeProgress(cardId) {
  const bar = document.querySelector(`#${cardId} .progress-bar__fill`);
  let p = 0;
  const iv = setInterval(() => {
    p = Math.min(85, p + 2 + Math.random()*6);
    bar.style.width = p+'%';
    if(p>=85) clearInterval(iv);
  }, 200);
  return function complete() {
    clearInterval(iv);
    bar.style.width = '100%';
    bar.style.transition = 'width 200ms ease';
    setTimeout(()=>bar.parentElement.style.display='none', 300);
  };
}
```

#### 格式转换角标

```html
<!-- 仅输出格式与原始不同时显示 -->
<div class="result-card__badge-convert" data-show-if="formatChanged">
  <span class="badge badge--tiny badge--accent">→ tailwind.config</span>
</div>
```

#### 卡片进入动画

```css
.result-card { animation: cardEnter 300ms ease both; }
@keyframes cardEnter { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
.result-card:nth-child(1) { animation-delay: 0ms; }
.result-card:nth-child(2) { animation-delay: 50ms; }
/* ... 递增 */
```

#### 移除动画

```javascript
function removeCard(cardId) {
  const card = document.getElementById(cardId);
  card.style.transition = 'all 300ms ease';
  card.style.transform = 'translateX(100%)';
  card.style.opacity = '0';
  card.addEventListener('transitionend', () => { card.remove(); updateSummaryStats(); }, {once:true});
}
```

---

## 3. Before/After 弹窗说明

### `openPreview(originalColors, simulationType)` 规则

#### 弹窗结构

```
┌──────────────────────────────────────────────────────┐
│  色盲模拟对比   正常 ◄──┤──► 红色盲 (Protanopia)  ✕ │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌─────────────────┬─────────────────┐              │
│  │  Original       │  Simulated      │              │
│  │  ██ ██ ██ ██   ┃  ██ ██ ██ ██   │              │
│  │  #6366F1 ...    ┃  #5C6BEB ...    │              │
│  │                 ┃ ← 拖拽分割线     │              │
│  └─────────────────┴─────────────────┘              │
│                                                      │
│  类型：[▼ 选择缺陷类型]    [导出对比图]    [关闭]    │
└──────────────────────────────────────────────────────┘
```

#### 滑块对比原理

```javascript
function initCompareSlider() {
  const container = document.getElementById('previewCompare');
  const divider = document.getElementById('compareDivider');
  const afterWrap = document.getElementById('compareAfter');
  let dragging = false;

  function update(clientX) {
    const rect = container.getBoundingClientRect();
    let pct = ((clientX-rect.left)/rect.width)*100;
    pct = Math.max(5, Math.min(95, pct));
    divider.style.left = pct+'%';
    afterWrap.style.width = (100-pct)+'%';
    afterWrap.style.left = pct+'%';
  }

  // 鼠标拖拽
  divider.addEventListener('mousedown', e => { dragging=true; e.preventDefault(); });
  document.addEventListener('mousemove', e => { if(dragging) update(e.clientX); });
  document.addEventListener('mouseup', () => dragging=false);

  // 触摸拖拽
  divider.addEventListener('touchstart', e => { dragging=true; e.preventDefault(); });
  document.addEventListener('touchmove', e => { if(dragging) update(e.touches[0].clientX); });
  document.addEventListener('touchend', () => dragging=false);

  // 点击跳位
  container.addEventListener('click', e => {
    if(e.target===divider||divider.contains(e.target)) return;
    update(e.clientX);
  });

  // ESC 关闭
  document.addEventListener('keydown', e => { if(e.key==='Escape') closePreview(); });
}
```

#### 关闭时清理

```javascript
function closePreview() {
  document.getElementById('previewModal').style.display='none';
  if(window._previewAbort) { window._previewAbort.abort(); window._previewAbort=null; }
  // ⚠️ 不释放 ObjectURL — 由 clearAll() 统一处理
}
```

---

## 4. CSS 规范

### 结果卡片

```css
.result-card {
  display: grid;
  grid-template-columns: 64px 1fr auto;
  gap: 12px; align-items: center;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  transition: all var(--transition-normal);
}
.result-card__swatch {
  width:64px; height:64px; border-radius:var(--radius-md);
  cursor:pointer; transition:transform var(--transition-fast);
}
.result-card__swatch:hover { transform:scale(1.05); }
.badge--tiny { font-size:10px; padding:2px 6px; border-radius:var(--radius-full); font-weight:600; }
.badge--success { background:var(--color-success-light); color:var(--color-success); }
.badge--warning { background:var(--color-warning-light); color:var(--color-warning); }
.badge--error   { background:var(--color-error-light);   color:var(--color-error); }
```

### 弹窗

```css
.preview-modal { z-index:1000; }
.preview-modal__overlay { position:fixed; inset:0; background:rgba(0,0,0,.6); backdrop-filter:blur(4px); }
.preview-modal__dialog {
  position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
  width:min(90vw,800px); max-height:90vh;
  background:var(--color-bg-card); border-radius:var(--radius-xl);
  box-shadow:var(--shadow-xl); overflow:hidden;
  animation:modalEnter 300ms cubic-bezier(.34,1.56,.64,1);
}
@keyframes modalEnter { from{opacity:0;transform:translate(-50%,-50%) scale(.95)} to{opacity:1;transform:translate(-50%,-50%) scale(1)} }
.divider__handle {
  width:36px; height:36px; border-radius:50%;
  background:#fff; box-shadow:0 2px 8px rgba(0,0,0,.2);
  display:flex; align-items:center; justify-content:center;
  cursor:ew-resize; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); z-index:10;
}
.preview-compare__divider {
  position:absolute; top:0; bottom:0; width:3px;
  background:#fff; box-shadow:0 0 8px rgba(0,0,0,.3); z-index:5; cursor:ew-resize;
}
```

### 移动端适配

```css
@media(max-width:767px) {
  .result-card { grid-template-columns:48px 1fr; gap:8px; }
  .result-card__actions { grid-column:1/-1; display:flex; justify-content:flex-end; gap:8px; padding-top:8px; border-top:1px solid var(--color-border); }
  .preview-modal__dialog { width:95vw; max-height:95vh; }
  .divider__handle { width:28px; height:28px; }
  .palette-bar { flex-direction:column; }
  .palette-bar .palette-swatch { min-height:60px; flex:none; }
}
```

---

## 5. 完整数据流 & 函数调用图

```
用户操作                 函数调用链                       UI 更新
═══════                 ══════════                       ════════

按 Space              → generatePalette()
                        ├─ 读取 State.palette
                        ├─ 计算和谐色相
                        ├─ chroma.hsl() 生成
                        ├─ 合并锁定色
                        ├─ pushHistory()
                        ├─ renderPaletteBar()           → 色条重绘
                        │   ├─ 遍历 colors[]
                        │   ├─ 创建/更新色块 DOM
                        │   ├─ 设背景+文字色(textColorForBg)
                        │   └─ 绑定悬停事件
                        ├─ updateUrlHash()              → URL 更新
                        └─ gaTrackPaletteGenerate()

点击色块复制           → copyToClipboard(hex)
                        ├─ clipboard.writeText()
                        └─ showToast('已复制')           → Toast 弹出

点击导出              → openExportModal()
                        ├─ 显示 modal
                        ├─ 读取 palette.colors
                        ├─ formatExport(colors, fmt)
                        └─ 渲染代码到 <pre>             → 弹窗显示

切换导出格式           → switchExportTab(fmt)
                        ├─ State.ui.exportFormat = fmt
                        ├─ formatExport()
                        └─ 更新 <pre>                   → 代码块刷新

点击下载              → downloadAll()
                        ├─ html2canvas() / genSVG() / Blob
                        ├─ saveAs()
                        └─ gaTrackPaletteExport()

拖拽图片              → handleDrop()
                        ├─ addFiles(fileList)
                        │   ├─ 校验格式/大小
                        │   ├─ URL.createObjectURL()
                        │   └─ loadImageToCanvas(url)
                        │       ├─ Image 加载
                        │       ├─ Canvas drawImage()
                        │       └─ getImageData()       → Canvas 显示
                        └─ gaTrackImageUpload()

提取调色板             → extractColorsFromImage()
                        ├─ 创建 Web Worker
                        ├─ worker.postMessage(pixels)
                        ├─ worker.onmessage
                        │   ├─ 接收聚类结果
                        │   └─ renderDominantColors()   → 主色列表
                        └─ worker.terminate()

色盲预览              → openPreview(colors, type)
                        ├─ simulateColorBlindness() × N
                        ├─ renderOriginalPalette()      → 左原始
                        ├─ renderSimulatedPalette()     → 右模拟
                        └─ initCompareSlider()          → 滑块

清除全部              → clearAll()
                        ├─ objectURLs.forEach(revoke)
                        ├─ 重置 State
                        ├─ 清空 Canvas
                        └─ 隐藏结果区                   → 回初始态
```

---

## 6. 验收标准 Checklist

### 卡片 UI
- [ ] 色块 64×64 圆角正确
- [ ] 三列 grid 对齐良好
- [ ] 10 种格式一键复制正常
- [ ] 进入动画 opacity 0→1 + translateY 12→0，延迟递增
- [ ] 移除动画右滑后 DOM 删除
- [ ] 格式角标仅需时显示
- [ ] Dark Mode 卡片正确

### Before/After 弹窗
- [ ] 遮罩 `backdrop-filter:blur(4px)`
- [ ] 弹窗 `scale(0.95)→1` 流畅
- [ ] 滑块拖拽跟随无延迟
- [ ] 触摸拖拽移动端正常
- [ ] 点击跳位正常
- [ ] ESC 关闭
- [ ] 切换缺陷类型实时更新
- [ ] 关闭移除事件监听
- [ ] 分割线 5%-95% 范围内

### 批量导出
- [ ] 8 种格式 Tab 切换正确
- [ ] CSS 变量 `--color-1: #xxx;`
- [ ] SCSS `$color-1: #xxx;`
- [ ] JSON 2 空格缩进
- [ ] Tailwind Config 完整 `module.exports`
- [ ] PNG 2x Retina
- [ ] SVG 带色值标注
- [ ] "全部复制"复制当前 Tab 完整内容

### 调色板横条
- [ ] 5 色等宽正确
- [ ] 悬停滑出信息条（HEX+操作）
- [ ] 锁定色块 🔒 + 微暗遮罩
- [ ] 拖拽排序正常(Sortable.js)
- [ ] 拖动中 opacity:0.5 + 占位虚线
- [ ] 移动端横条变竖排
- [ ] HEX 文字自动适应背景

### 边界情况
- [ ] 空调色板导出/分享 disabled
- [ ] 单色 Before/After 正常
- [ ] 10 色弹窗不溢出
- [ ] 超长颜色名不换行溢出
- [ ] 不支持 `backdrop-filter` 优雅降级
- [ ] 无图片时"提取调色板" disabled
- [ ] URL hash 10 色不超长度限制
