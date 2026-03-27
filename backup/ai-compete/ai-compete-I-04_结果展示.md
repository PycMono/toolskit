# ai-compete · 结果展示（I-04）

---

## 1. 竞品结果区 UI 对标表

| UI 区域 | Competely.ai | 本次实现 | 差异化 |
|---|---|---|---|
| 维度导航 | 顶部 Tab 切换 | Accordion（全部展开，可折叠） | 可同时阅读多维度，无需反复切换 |
| 竞品排列 | 每维度独立卡片 | 同一维度内竖排各竞品 | 便于同维度纵向对比 |
| SWOT | 文字列表 | 四象限 Grid 卡片 | 视觉一目了然 |
| 定价展示 | 纯文字 | 定价层级卡片行 | 结构化更清晰 |
| 产品特性 | Markdown 文字 | 有无对比表格（✅/❌） | 快速判断覆盖差距 |
| 导出 | PDF（付费）| Markdown 剪贴板 + 文件下载 | 免费，兼容所有文档工具 |
| 实时感 | 轮询+整体 loading | SSE 流式，维度逐个渲染 | 无焦虑等待 |

---

## 2. 七大维度结果渲染规则

### ① 营销策略（marketing）

```
渲染结构：
  竞品名称（h3，主色）
  ├── Tagline    → 引用块 <blockquote>
  ├── UVP        → 段落
  ├── Keywords   → Tag Badge 行
  ├── Channels   → 列表
  ├── Social     → 段落
  └── Positioning→ 段落
```

### ② 产品特性（product）

```
渲染结构：
  对比表格（.compare-table）：
  ┌──────────────┬──────────────┬──────────────┐
  │   Feature    │  My Product  │ Competitor A │
  ├──────────────┼──────────────┼──────────────┤
  │ SSO          │     ✅       │     ✅       │
  │ API Access   │     ✅       │     ❌       │
  │ Mobile App   │     ❌       │     ✅       │
  └──────────────┴──────────────┴──────────────┘
  （features 数据由 JS 合并所有竞品并去重后构建）
```

### ③ 定价模型（pricing）

```
渲染结构：
  竞品名称（h3）
  ├── 商业模式 badge（SaaS/一次性/Freemium 等）
  ├── 定价层级卡片行（.pricing-tiers）：
  │   ┌─────────┬─────────┬─────────┐
  │   │  Free   │  Pro    │ Business│
  │   │  $0/mo  │ $29/mo  │ $99/mo  │
  │   │ feature │ feature │ feature │
  │   └─────────┴─────────┴─────────┘
  └── 免费试用标签（有/无）
```

### ④ 目标受众（audience）

```
渲染结构：
  竞品名称（h3）
  ├── 用户角色 (personas)    → Badge 行
  ├── 行业 (industries)      → Badge 行
  ├── 公司规模 (company_sizes)→ Badge 行
  └── 购买者角色 (buyer_roles)→ Badge 行
```

### ⑤ 用户口碑（sentiment）

```
渲染结构：
  竞品名称（h3）
  ├── 总体情感 badge：🟢 Positive / 🟡 Mixed / 🔴 Negative
  ├── 优点 (pros) → 绿色 ✅ 列表
  ├── 缺点 (cons) → 红色 ❌ 列表
  └── 数据来源 (sources) → 灰色 badge 行
```

### ⑥ 公司信息（company）

```
渲染结构：
  竞品名称（h3）
  └── 信息网格（2列）：
      成立年份 | 公司规模
      融资情况 | 总部位置
      核心亮点（段落）
```

### ⑦ SWOT 分析（swot）—— 核心差异化

```
渲染结构（.swot-grid 2×2）：
  ┌─────────────────┬──────────────────┐
  │ 💪 优势          │ 🔧 劣势          │
  │ (green bg)      │ (red bg)         │
  │ • Item 1        │ • Item 1         │
  │ • Item 2        │ • Item 2         │
  ├─────────────────┼──────────────────┤
  │ 🚀 机遇          │ ⚠️ 威胁          │
  │ (amber bg)      │ (indigo bg)      │
  │ • Item 1        │ • Item 1         │
  │ • Item 2        │ • Item 2         │
  └─────────────────┴──────────────────┘
```

---

## 3. 完整数据流 & 函数调用图

```
用户点击「开始分析」
       │
       ▼
startAnalysis()
  ├── 校验 product + competitors
  ├── showProgressSection(dimensions)     ← 展示进度条
  ├── 重置 state.results / DOM
  └── fetch POST /api/ai-compete/analyze（SSE）
             │
             ▼
        processStream(body)               ← ReadableStream 逐行读
             │
             │  解析到 "DIMENSION:{...}" 行
             ▼
        handleDimensionData(dimData)
          ├── state.results[comp][dim] = data
          └── upsertDimSection(dim)
                ├── （新建）创建 <details> + 入场动画
                └── renderDimBody(dim)
                      ├── dim === 'swot'  → renderSwot(body)
                      └── dim !== 'swot'  → renderGenericDim(dim, body)
                                              └── dataToMarkdown → marked.parse → DOMPurify → innerHTML

             │  updateProgress(ratio, dim, comp) ← 维度 tag 状态切换
             ▼
        流结束 / AbortError
          ├── 正常结束 → hideProgressSection() → elResultsSection.hidden = false
          │             → gaTrackProcessDone(TOOL, n, durationMs)
          └── AbortError → 静默
               其他错误 → showToast(error) + gaTrackError

用户「导出 Markdown」
  └── exportMarkdown()
        ├── 构建完整 Markdown 字符串（state.results 遍历）
        ├── Clipboard API → 成功 → showToast('Copied') + gaTrackExport
        └── 失败 → <a download="competitive-analysis.md"> → gaTrackExport

用户「复制结果」
  └── copyResult()
        └── innerText → Clipboard → 按钮变 "✓ Copied" 2s 后恢复 + gaTrackShare

用户「清空」
  └── clearAll()
        ├── controller.abort()           ← 中止进行中的 SSE 请求
        ├── state = 初始值
        └── 清空所有 DOM
```

---

## 4. 产品特性对比表构建逻辑（JS 实现重点）

```javascript
// 在 renderGenericDim('product', body) 中特殊处理
function renderProductDim(body) {
  // 1. 收集所有竞品的 features 数组，合并去重
  var allFeatures = {};
  state.competitors.forEach(function (comp) {
    var data = (state.results[comp] || {}).product;
    if (!data) return;
    Object.values(data.features || {}).forEach(function (list) {
      (list || []).forEach(function (f) { allFeatures[f] = true; });
    });
  });
  var featureList = Object.keys(allFeatures);

  // 2. 构建表格 DOM
  var table = document.createElement('table');
  table.className = 'compare-table';

  // 表头
  var thead = document.createElement('thead');
  var headRow = document.createElement('tr');
  var thFeature = document.createElement('th');
  thFeature.textContent = 'Feature';
  headRow.appendChild(thFeature);
  state.competitors.forEach(function (comp) {
    var th = document.createElement('th');
    th.textContent = comp;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  // 表体
  var tbody = document.createElement('tbody');
  featureList.forEach(function (feature) {
    var tr = document.createElement('tr');
    var tdName = document.createElement('td');
    tdName.textContent = feature;
    tr.appendChild(tdName);
    state.competitors.forEach(function (comp) {
      var data = (state.results[comp] || {}).product;
      var td = document.createElement('td');
      var compFeatures = data && data.features && (data.features[comp] || []);
      td.textContent = compFeatures.indexOf(feature) !== -1 ? '✅' : '❌';
      td.style.textAlign = 'center';
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  body.appendChild(table);
}
```

---

## 5. 移动端结果区适配（必须实现）

```css
@media (max-width: 768px) {
  .page-ai-compete .dim-section summary {
    font-size: 0.9rem;
    padding: 14px 16px;
    min-height: 52px;
  }
  .page-ai-compete .dim-body {
    padding: 0 12px 16px;
  }

  /* SWOT 四象限：手机端变单列 */
  .page-ai-compete .swot-grid {
    grid-template-columns: 1fr;
  }

  /* 定价层级：手机端横向滚动 */
  .page-ai-compete .pricing-tiers {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding-bottom: 8px;
    -webkit-overflow-scrolling: touch;
  }
  .page-ai-compete .pricing-tier-card {
    min-width: 140px;
    flex-shrink: 0;
  }

  /* 产品对比表：横向滚动 */
  .page-ai-compete .compare-table {
    display: block;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    white-space: nowrap;
  }
  .page-ai-compete .compare-table th,
  .page-ai-compete .compare-table td {
    padding: 8px 12px;
    font-size: 0.8rem;
  }

  /* 结果区操作按钮 */
  .page-ai-compete .results-actions {
    flex-wrap: wrap;
    gap: 6px;
  }
  .page-ai-compete .results-actions .btn {
    flex: 1;
    min-height: 44px;
    font-size: 0.85rem;
  }
}

/* 定价卡片基础样式 */
.page-ai-compete .pricing-tiers {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 10px;
}
.page-ai-compete .pricing-tier-card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 14px 16px;
  min-width: 160px;
}
.page-ai-compete .pricing-tier-card .tier-name  { font-weight: 700; font-size: 0.9rem; }
.page-ai-compete .pricing-tier-card .tier-price {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--ac-accent);
  margin: 4px 0;
}
.page-ai-compete .pricing-tier-card ul {
  margin: 8px 0 0;
  padding-left: 16px;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  line-height: 1.7;
}

/* 情感 Badge */
.page-ai-compete .sentiment-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 12px;
}
.page-ai-compete .sentiment-badge.positive { background: rgba(34,197,94,0.15);  color: var(--ac-green); }
.page-ai-compete .sentiment-badge.mixed    { background: rgba(245,158,11,0.15); color: var(--ac-amber); }
.page-ai-compete .sentiment-badge.negative { background: rgba(239,68,68,0.15);  color: var(--ac-red); }

/* 受众 Badge 行 */
.page-ai-compete .badge-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}
.page-ai-compete .badge-chip {
  background: var(--ac-accent-light);
  color: var(--ac-accent-dark);
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
}

/* Markdown 正文排版 */
.page-ai-compete .dim-markdown h1,
.page-ai-compete .dim-markdown h2,
.page-ai-compete .dim-markdown h3 { margin: 12px 0 6px; }
.page-ai-compete .dim-markdown ul  { padding-left: 18px; line-height: 1.7; }
.page-ai-compete .dim-markdown p   { margin: 6px 0; line-height: 1.7; }
.page-ai-compete .dim-markdown strong { color: var(--color-text); }
```

---

## 6. CSS 关键规则

| 样式目标 | CSS 规则 |
|---|---|
| 维度卡片顶部色条 | `border-top: 3px solid var(--ac-accent)` |
| SWOT 颜色区分 | `.strengths` green / `.weaknesses` red / `.opportunities` amber / `.threats` indigo |
| 进度条动画 | `transition: width 0.4s ease` |
| 维度 tag pulse | `@keyframes pulse { 50%{ opacity:0.65 } }` |
| 模态层级 | `z-index: 9000`（Toast 容器） |
| 移动端按钮 touch target | `min-height: 44px; min-width: 44px` |
| 定价表 / 对比表横滚 | `overflow-x: auto; -webkit-overflow-scrolling: touch` |

---

## 7. 验收标准 Checklist

- [ ] 七大维度 Accordion 均正确渲染，有内容时默认展开，无内容时不显示 section
- [ ] SWOT 四象限颜色（绿/红/橙/紫）正确，items 以 `<ul><li>` 渲染
- [ ] 产品特性对比表：features 正确合并去重，✅/❌ 对齐，手机端横向滚动
- [ ] 定价卡片：层级名称 + 价格 + 特性列表正确渲染，免费试用标签显示
- [ ] 用户口碑：情感 badge（Positive/Mixed/Negative）颜色正确，数据来源 badge 显示
- [ ] 公司信息：成立年份/规模/融资/总部/亮点全部显示
- [ ] SSE 流式：每个维度解析完成后立即渲染，不等全部完成
- [ ] 进度维度 tag：waiting（灰）→ active（紫动画）→ done（紫实色）状态切换正确
- [ ] 导出 Markdown：内容完整（所有竞品 × 所有维度），Clipboard 优先，失败降级下载
- [ ] 复制按钮：点击后文字变「✓ Copied」2s 后恢复
- [ ] 移动端（375px）：SWOT 单列，定价卡横滚，对比表横滚，按钮 ≥44px
- [ ] clearAll 后：DOM 清空，state.results 清空，进行中 fetch 被 abort
- [ ] 无竞品数据的维度：section 不创建，不报错
