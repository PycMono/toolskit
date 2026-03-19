<!-- img-toolbox-I-04_结果列表UI.md -->

# 图片处理工具箱 · 结果列表 UI

---

## 1. 竞品结果区 UI 对标表

| UI 元素 | iLoveIMG | 本次实现 | 差异说明 |
|---------|----------|----------|----------|
| 结果布局 | 横向列表，缩略图 + 文件名 + 下载按钮 | 三列 Grid 卡片：缩略图 64px / 文件信息弹性 / 操作按钮组 | 布局信息密度更高 |
| 大小对比显示 | 仅显示输出大小 | 原始大小 → 输出大小 + 节省率 badge | 直观展示压缩收益 |
| 处理状态 | 简单文字提示 | 左侧 3px 彩色状态条 + 进度条动画 | 视觉区分度更高 |
| 进度条 | 加载动画 | 伪进度 0→85% 随机递增，完成跳 100% | 体验更流畅 |
| Before/After | ❌ 无 | ✅ 滑块对比弹窗（点击缩略图触发） | **差异化核心亮点** |
| 批量操作 | 单独下载按钮 | 底部固定批量操作栏（全部下载/清空） | 操作更集中 |
| 错误重试 | 页面刷新 | 卡片内「重试」按钮，仅重处理当前文件 | 体验更精细 |
| 格式转换角标 | ❌ 无 | ✅ 输出格式不同时显示格式角标 | 用户一目了然 |
| 移动端适配 | 简单响应式 | 缩略图缩小为 48px，按钮折叠为图标 | 移动端空间利用率更高 |

---

## 2. 结果卡片渲染说明

### `upsertResultCard(entry)` 设计规则

```javascript
function upsertResultCard(entry) {
  const list = document.getElementById('resultsList');
  let card = document.getElementById(`card-${entry.id}`);

  if (!card) {
    // 首次插入：创建 DOM + 入场动画
    card = buildCardDOM(entry);
    card.style.opacity = '0';
    card.style.transform = 'translateY(12px)';
    list.appendChild(card);
    // 触发入场动画
    requestAnimationFrame(() => {
      card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    });
  } else {
    // 更新现有卡片内容
    updateCardDOM(card, entry);
  }
}
```

### 卡片布局：三列 Grid

```html
<!-- 卡片 DOM 结构 -->
<div class="result-card" id="card-{id}" data-status="{status}" role="listitem">
  <!-- 左侧状态条（3px 竖线） -->
  <div class="result-card__status-bar"></div>

  <!-- 缩略图区（64×64px） -->
  <div class="result-card__thumb">
    <img src="{originalURL}" alt="{name}" loading="lazy"
         onclick="openPreview('{id}')" title="点击查看前后对比">
    <!-- 格式转换角标（仅输出扩展名不同于原始时显示） -->
    <span class="result-card__format-badge" hidden>{outputExt}</span>
  </div>

  <!-- 文件信息区（flex 弹性宽度） -->
  <div class="result-card__info">
    <p class="result-card__name">{name}</p>

    <!-- waiting 态 -->
    <p class="result-card__status-text status--waiting">等待处理</p>

    <!-- processing 态：进度条 -->
    <div class="result-card__progress" hidden>
      <div class="progress-bar">
        <div class="progress-bar__fill" id="progress-{id}" style="width:0%"></div>
      </div>
      <span class="progress-bar__pct" id="progressPct-{id}">0%</span>
    </div>

    <!-- done 态：大小对比 + 节省率 -->
    <div class="result-card__size-info" hidden>
      <span class="size-original">{originalSize}</span>
      <span class="size-arrow">→</span>
      <span class="size-output">{outputSize}</span>
      <span class="size-saved-badge" id="savedBadge-{id}">{savedPct}%</span>
    </div>

    <!-- error 态 -->
    <p class="result-card__error-text status--error" hidden>{errorMsg}</p>
  </div>

  <!-- 操作按钮组 -->
  <div class="result-card__actions">
    <!-- done 态按钮 -->
    <button class="btn-icon btn-icon--download" onclick="downloadOne('{id}')" title="下载" hidden>
      <svg><!-- download icon --></svg>
    </button>
    <button class="btn-icon btn-icon--preview" onclick="openPreview('{id}')" title="预览对比" hidden>
      <svg><!-- eye icon --></svg>
    </button>
    <!-- error 态按钮 -->
    <button class="btn-icon btn-icon--retry" onclick="retryOne('{id}')" title="重试" hidden>
      <svg><!-- retry icon --></svg>
    </button>
    <!-- 通用移除按钮 -->
    <button class="btn-icon btn-icon--remove" onclick="removeCard('{id}')" title="移除">
      <svg><!-- x icon --></svg>
    </button>
  </div>
</div>
```

### 四种状态的 DOM 表现

| 状态 | 状态条颜色 | 显示元素 | 隐藏元素 |
|------|-----------|----------|----------|
| `waiting` | `--color-border` 灰色 | status-text | progress, size-info, error-text, download/preview/retry btn |
| `processing` | `--color-primary` 橙色 | progress（进度条动画） | status-text, size-info, error-text, download/preview btn |
| `done` | `--color-success` 绿色 | size-info, download btn, preview btn（若有原图URL） | status-text, progress, error-text, retry btn |
| `error` | `--color-error` 红色 | error-text, retry btn | status-text, progress, size-info, download/preview btn |

### 节省率 Badge 颜色规则

```javascript
function getSavedBadgeClass(savedPct) {
  if (savedPct >= 50) return 'badge--green';   // 节省 ≥ 50%，深绿
  if (savedPct >= 20) return 'badge--orange';  // 节省 20-49%，橙色
  if (savedPct > 0)   return 'badge--gray';    // 节省 < 20%，灰色
  return 'badge--red';                          // 文件变大（负节省），红色提示
}
```

### 格式转换角标显示逻辑

```javascript
function shouldShowFormatBadge(entry) {
  return entry.ext !== mimeToExt(entry.outputMime);
}
```

### 进度条：伪进度动画实现

```javascript
function setCardProgress(id, pct) {
  const fill = document.getElementById(`progress-${id}`);
  const label = document.getElementById(`progressPct-${id}`);
  if (fill) fill.style.width = `${pct}%`;
  if (label) label.textContent = `${pct}%`;
}
```

### 移除动画

```javascript
function removeCard(id) {
  const card = document.getElementById(`card-${id}`);
  if (!card) return;
  // 向右滑出 + 淡出
  card.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
  card.style.opacity = '0';
  card.style.transform = 'translateX(60px)';
  card.addEventListener('transitionend', () => {
    card.remove();
    // 从 STATE.files 中移除
    STATE.files = STATE.files.filter(f => f.id !== id);
    updateSummaryStats();
  }, { once: true });
}
```

---

## 3. Before/After 弹窗说明

### `openPreview(id)` 实现规则

```javascript
function openPreview(id) {
  const entry = STATE.files.find(f => f.id === id);
  if (!entry || entry.status !== 'done') return;

  const modal = document.getElementById('previewModal');
  const beforeImg = document.getElementById('beforeImg');
  const afterImg = document.getElementById('afterImg');
  const beforeWrap = document.getElementById('beforeWrap');

  // 填充数据
  beforeImg.src = entry.originalURL;
  afterImg.src = entry.outputURL;
  document.getElementById('beforeSizeLabel').textContent = `原图 ${formatFileSize(entry.size)}`;
  document.getElementById('afterSizeLabel').textContent = `处理后 ${formatFileSize(entry.outputSize)}`;
  document.getElementById('modalDownloadBtn').onclick = () => downloadOne(entry);

  // 初始化分割线位置（50%）
  beforeWrap.style.width = '50%';
  document.getElementById('compareDivider').style.left = '50%';

  // 绑定拖拽事件
  bindCompareEvents();

  modal.hidden = false;
}

// 分割线拖拽逻辑
function bindCompareEvents() {
  const area = document.getElementById('compareArea');
  const divider = document.getElementById('compareDivider');
  const beforeWrap = document.getElementById('beforeWrap');

  let dragging = false;

  function onMove(clientX) {
    const rect = area.getBoundingClientRect();
    let pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    beforeWrap.style.width = `${pct * 100}%`;
    divider.style.left = `${pct * 100}%`;
  }

  // 鼠标拖拽
  divider.addEventListener('mousedown', (e) => { dragging = true; e.preventDefault(); });
  document.addEventListener('mousemove', (e) => { if (dragging) onMove(e.clientX); });
  document.addEventListener('mouseup', () => { dragging = false; });

  // 点击快速跳位
  area.addEventListener('click', (e) => { if (!dragging) onMove(e.clientX); });

  // 触摸拖拽（移动端）
  divider.addEventListener('touchstart', (e) => { dragging = true; e.preventDefault(); }, { passive: false });
  document.addEventListener('touchmove', (e) => { if (dragging) onMove(e.touches[0].clientX); }, { passive: false });
  document.addEventListener('touchend', () => { dragging = false; });

  // ESC 关闭
  document._escHandler = (e) => { if (e.key === 'Escape') closePreview(); };
  document.addEventListener('keydown', document._escHandler);
}

function closePreview(e) {
  // 点击遮罩关闭（非模态框内部）
  if (e && e.target !== document.getElementById('previewModal')) return;
  document.getElementById('previewModal').hidden = true;
  document.removeEventListener('keydown', document._escHandler);
  // 不释放 ObjectURL，由 clearAll() 统一处理
}
```

---

## 4. CSS 规范

### 结果卡片样式

```css
/* 卡片容器 */
.results-list { display: flex; flex-direction: column; gap: var(--space-sm); }

.result-card {
  display: grid;
  grid-template-columns: 4px 64px 1fr auto; /* 状态条 / 缩略图 / 信息 / 操作 */
  align-items: center;
  gap: var(--space-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-base);
  overflow: hidden;
}
.result-card:hover { box-shadow: var(--shadow-card); }

/* 状态条 */
.result-card__status-bar {
  width: 4px; height: 100%;
  border-radius: 4px 0 0 4px;
  background: var(--color-border);
  align-self: stretch;
  margin: calc(-1 * var(--space-md));
  margin-right: 0;
  transition: background var(--transition-base);
}
.result-card[data-status="processing"] .result-card__status-bar { background: var(--color-primary); }
.result-card[data-status="done"]       .result-card__status-bar { background: var(--color-success); }
.result-card[data-status="error"]      .result-card__status-bar { background: var(--color-error); }

/* 缩略图 */
.result-card__thumb { position: relative; width: 64px; height: 64px; flex-shrink: 0; }
.result-card__thumb img {
  width: 64px; height: 64px; object-fit: cover;
  border-radius: var(--radius-sm); cursor: pointer;
  transition: transform var(--transition-fast);
}
.result-card__thumb img:hover { transform: scale(1.05); }

/* 格式角标 */
.result-card__format-badge {
  position: absolute; bottom: -4px; right: -4px;
  background: var(--color-primary); color: #fff;
  font-size: 10px; font-weight: 700; padding: 1px 5px;
  border-radius: var(--radius-xs); text-transform: uppercase;
}

/* 节省率 badge */
.size-saved-badge {
  display: inline-block; padding: 2px 8px;
  border-radius: var(--radius-xs); font-size: 12px; font-weight: 700;
}
.badge--green  { background: #DCFCE7; color: #166534; }
.badge--orange { background: #FFF3ED; color: #9A3412; }
.badge--gray   { background: #F3F4F6; color: #6B7280; }
.badge--red    { background: #FEE2E2; color: #991B1B; }

/* 进度条 */
.progress-bar { height: 4px; background: #E5E7EB; border-radius: 4px; overflow: hidden; width: 100%; }
.progress-bar__fill {
  height: 100%; border-radius: 4px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
  transition: width 0.2s ease;
}
.progress-bar__pct { font-size: 12px; color: var(--color-text-secondary); margin-left: 8px; }

/* 操作按钮 */
.btn-icon {
  width: 36px; height: 36px; border: none; border-radius: var(--radius-sm);
  background: #F3F4F6; cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: background var(--transition-fast), transform var(--transition-fast);
  flex-shrink: 0;
}
.btn-icon:hover { background: var(--color-border); transform: scale(1.1); }
.btn-icon--download { color: var(--color-primary); }
.btn-icon--retry    { color: var(--color-warning); }
.btn-icon--remove   { color: var(--color-error); }

/* 批量操作栏 */
.results-actions {
  display: flex; gap: var(--space-md); justify-content: center;
  padding: var(--space-lg) 0;
  border-top: 1px solid var(--color-border);
  margin-top: var(--space-md);
}
```

### Before/After 弹窗样式

```css
/* 遮罩层 */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999; /* 高于所有内容 */
  backdrop-filter: blur(4px);
}

/* 模态框 */
.modal {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  width: min(90vw, 860px);
  max-height: 90vh;
  overflow: hidden;
  box-shadow: var(--shadow-modal);
  display: flex; flex-direction: column;
}
.modal__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--color-border);
}
.modal__close {
  width: 32px; height: 32px; border: none; background: #F3F4F6;
  border-radius: 50%; cursor: pointer; font-size: 18px; line-height: 1;
}

/* 滑块对比区域 */
.modal__compare {
  position: relative; overflow: hidden; flex: 1;
  cursor: col-resize; user-select: none;
}
.compare__before-wrap {
  position: absolute; inset: 0; overflow: hidden;
  width: 50%; /* JS 动态修改此值 */
}
.compare__before-wrap img { width: 100%; height: 100%; object-fit: contain; }
.compare__after-wrap { position: absolute; inset: 0; }
.compare__after-wrap img { width: 100%; height: 100%; object-fit: contain; }

/* 分割线 + 拖柄 */
.compare__divider {
  position: absolute; top: 0; bottom: 0; left: 50%;
  width: 2px; background: #fff;
  transform: translateX(-50%);
  cursor: col-resize;
}
.compare__divider::after {
  content: '⟺';
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 36px; height: 36px;
  background: #fff; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(0,0,0,.15);
}

/* 标签 */
.compare__label {
  position: absolute; bottom: 12px;
  background: rgba(0,0,0,.55); color: #fff;
  padding: 2px 10px; border-radius: var(--radius-xs); font-size: 12px;
}
.compare__label--before { left: 12px; }
.compare__label--after  { right: 12px; }

/* 移动端适配 */
@media (max-width: 768px) {
  .result-card { grid-template-columns: 4px 48px 1fr auto; }
  .result-card__thumb, .result-card__thumb img { width: 48px; height: 48px; }
  .modal { width: 95vw; }
  .btn-icon { width: 32px; height: 32px; }
}
```

---

## 5. 完整数据流 & 函数调用图

```
用户上传文件
    │
    ▼
addFiles(fileList)
    │── 校验（格式/大小/数量/去重）
    │── createFileEntry(file)  ──→  STATE.files.push(entry)
    │── URL.createObjectURL()  ──→  STATE.objectURLs.push(url)
    └── upsertResultCard(entry)  ──→  渲染 waiting 占位卡片（入场动画）
              │
              ▼
    [用户配置选项，点击「开始处理」]
              │
              ▼
startProcess()
    │── collectOptions()  ──→  读取选项面板参数
    │── pending = files.filter(waiting)
    └── runConcurrent(pending, opts, 3)  ──→  并发调度
              │
        ┌─────┴─────┐
        │ Worker×3  │
        └─────┬─────┘
              │
              ▼
processOne(entry, opts)
    │── entry.status = 'processing'
    │── upsertResultCard(entry)  ──→  显示进度条
    │── startFakeProgress(id)    ──→  0→85% 伪动画
    │── switch(CURRENT_TOOL):
    │       processCrop / processToJpg / processJpgTo
    │       processEditor / processRemoveBg
    │       processWatermark / processRotate
    │── URL.createObjectURL(outputBlob)  ──→  STATE.objectURLs.push()
    │── entry.status = 'done'
    │── entry.outputURL / outputSize 赋值
    │── stopFakeProgress(id, 100)  ──→  进度跳 100%
    └── upsertResultCard(entry)    ──→  更新为 done 态（大小对比+节省率badge）
              │
              ▼
updateSummaryStats()  ──→  更新「共处理N个·平均节省X」文案
              │
              ▼
    [用户点击「预览对比」]
              │
              ▼
openPreview(id)
    │── 填充 beforeImg.src / afterImg.src
    │── beforeWrap.style.width = '50%'
    │── bindCompareEvents()
    └── modal.hidden = false
              │
    [拖拽分割线]
              │
              ▼
onMove(clientX)  ──→  beforeWrap.width% 实时更新
              │
    [用户点击下载]
              │
    ┌─────────┴─────────┐
    │                   │
    ▼                   ▼
downloadOne(id)    downloadAll()
    │                   │── JSZip 打包所有 done 文件
    └── <a>.click()     └── saveAs(zip, filename)
              │
    [用户点击「清空全部」]
              │
              ▼
clearAll()
    │── STATE.objectURLs.forEach(URL.revokeObjectURL)  // 释放所有 ObjectURL
    │── STATE.files = []
    │── STATE.results.clear()
    │── resultsList.innerHTML = ''
    └── 重置 UI 状态
```

---

## 6. 验收标准 Checklist

### 卡片 UI

- [ ] 卡片初次出现时有 opacity 0→1 + translateY 12px→0 的入场动画（0.3s）
- [ ] waiting 态：左侧状态条为灰色，显示「等待处理」文字
- [ ] processing 态：左侧状态条为橙色，显示进度条，进度条有平滑动画
- [ ] done 态：左侧状态条为绿色，显示「原始大小 → 输出大小 节省率badge」
- [ ] error 态：左侧状态条为红色，显示错误文字 + 「重试」按钮
- [ ] 节省率 badge 颜色随节省幅度变化（≥50% 绿 / 20-49% 橙 / <20% 灰 / 负值 红）
- [ ] 输出格式与原始不同时，缩略图右下角显示格式角标（如「PNG」）
- [ ] 点击缩略图可触发 openPreview()
- [ ] 点击移除按钮：卡片向右滑出后从 DOM 删除
- [ ] 移动端（<768px）缩略图缩小为 48px，操作按钮不溢出

### Before/After 弹窗

- [ ] 弹窗打开时，分割线初始在 50% 位置
- [ ] 拖拽分割线左右移动，before/after 图片裁切实时变化
- [ ] 点击对比区域（非拖柄）可快速跳转分割位置
- [ ] 移动端触摸拖拽正常（touch 事件无 passive 阻止）
- [ ] 按 ESC 键关闭弹窗
- [ ] 点击遮罩层（弹窗外部）关闭弹窗
- [ ] 关闭弹窗后移除 ESC 事件监听（不泄漏）
- [ ] 弹窗内下载按钮可正常下载处理后文件
- [ ] 弹窗顶部显示「原图 XXkB / 处理后 XXkB」大小对比

### 批量下载

- [ ] 「全部下载（ZIP）」按钮在有 done 文件时可点击
- [ ] 点击后显示「正在打包 ZIP...」Toast
- [ ] ZIP 文件名格式为 `img-toolbox-{timestamp}.zip`
- [ ] ZIP 内文件名与各卡片输出文件名一致
- [ ] 下载完成后 Toast 自动消失

### 边界情况

- [ ] 所有文件都是 error 态时，「全部下载」按钮 disabled
- [ ] 混合状态（部分 done / 部分 error），ZIP 只包含 done 的文件
- [ ] 处理中途清空，不再执行回调更新已删除卡片的 DOM
- [ ] 连续多次点击「开始处理」，第二次点击无效（STATE.processing 锁）
- [ ] 结果区为空时，统计文案不显示
