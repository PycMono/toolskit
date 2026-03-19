# Block A-04 · AI 内容检测器 — 结果面板 UI（圆形仪表盘 + 统计）

> **所属模块**：AI 内容检测器（/ailab/detector）  
> **竞品参考**：https://gptzero.me 右侧结果面板  
> **预估工时**：3h  
> **依赖**：A-02（页面骨架存在）  
> **交付粒度**：仅结果面板 UI + SVG 圆形仪表盘动画 + Mock 数据展示，不含后端调用

---

## 1. 竞品分析（gptzero.me 结果面板）

| 元素 | 竞品 | 本次实现 |
|------|------|---------|
| 圆形 SVG 仪表盘 + 百分比数字 | ✅ | ✅ SVG stroke-dashoffset 动画 |
| 数字从 0 滚动到最终值 | ✅ | ✅ requestAnimationFrame |
| 颜色根据分数变化（绿/黄/红） | ✅ | ✅ |
| 总体评估文字 | ✅ | ✅ |
| 词数/句数统计 | ✅ | ✅ |
| 导出 PDF 按钮 | ✅ | ✅（功能在 A-07 实现） |
| 跳转人性化工具按钮 | ✅ | ✅ |

---

## 2. HTML 模板

```html
<!-- templates/ailab/detector.html — 右侧结果面板 -->

<div class="result-panel" id="result-panel">

    <!-- 空态（检测前） -->
    <div class="result-empty" id="result-empty">
        <div class="result-empty__icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                 stroke="#d1d5db" stroke-width="1.5">
                <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7l-9-5z"/>
            </svg>
        </div>
        <h3 class="result-empty__title">{{ t .Lang "ailab.detector.result.empty_title" }}</h3>
        <p class="result-empty__desc">{{ t .Lang "ailab.detector.result.empty_desc" }}</p>

        <!-- 支持检测的模型列表 -->
        <div class="result-empty__models">
            <p class="models-label">{{ t .Lang "ailab.detector.supported_models" }}</p>
            <ul class="models-list">
                <li>✓ ChatGPT / GPT-4 / GPT-4o</li>
                <li>✓ Google Gemini 1.5 / 2.0</li>
                <li>✓ Anthropic Claude</li>
                <li>✓ Meta Llama 3</li>
                <li>✓ DeepSeek V3</li>
                <li>✓ Mistral / Mixtral</li>
            </ul>
        </div>
    </div>

    <!-- 结果态（检测后，初始隐藏） -->
    <div class="result-content" id="result-content" style="display:none">

        <!-- 圆形仪表盘 -->
        <div class="gauge-wrapper">
            <svg class="gauge-svg" viewBox="0 0 120 120" width="140" height="140">
                <!-- 背景圆环 -->
                <circle class="gauge-bg"
                        cx="60" cy="60" r="50"
                        fill="none" stroke="#f3f4f6" stroke-width="10"/>
                <!-- 进度圆环 -->
                <circle class="gauge-progress" id="gauge-progress"
                        cx="60" cy="60" r="50"
                        fill="none" stroke="#ef4444" stroke-width="10"
                        stroke-linecap="round"
                        stroke-dasharray="314.16"
                        stroke-dashoffset="314.16"
                        transform="rotate(-90 60 60)"/>
            </svg>
            <!-- 中心数字 -->
            <div class="gauge-center">
                <span class="gauge-percent" id="gauge-percent">0%</span>
                <span class="gauge-label" id="gauge-label">AI</span>
            </div>
        </div>

        <!-- 总体评估 -->
        <div class="assessment-box" id="assessment-box">
            <span class="assessment-icon" id="assessment-icon">🔴</span>
            <p class="assessment-text" id="assessment-text"></p>
        </div>

        <!-- 统计数据 -->
        <div class="stats-grid">
            <div class="stat-item">
                <span class="stat-label">{{ t .Lang "ailab.detector.result.words" }}</span>
                <span class="stat-value" id="stat-words">—</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">{{ t .Lang "ailab.detector.result.sentences" }}</span>
                <span class="stat-value" id="stat-sentences">—</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">{{ t .Lang "ailab.detector.result.ai_sentences" }}</span>
                <span class="stat-value stat-value--red" id="stat-ai-sent">—</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">{{ t .Lang "ailab.detector.result.human_sentences" }}</span>
                <span class="stat-value stat-value--green" id="stat-human-sent">—</span>
            </div>
        </div>

        <!-- AI vs Human 进度条 -->
        <div class="breakdown-bar">
            <div class="breakdown-bar__fill breakdown-bar__fill--ai"
                 id="breakdown-ai" style="width:0%"></div>
            <div class="breakdown-bar__fill breakdown-bar__fill--human"
                 id="breakdown-human" style="width:0%"></div>
        </div>
        <div class="breakdown-legend">
      <span class="legend-item legend-item--ai">
        <span class="legend-dot legend-dot--red"></span>
        {{ t .Lang "ailab.detector.legend.ai_high" }}
      </span>
            <span class="legend-item legend-item--medium">
        <span class="legend-dot legend-dot--yellow"></span>
        {{ t .Lang "ailab.detector.legend.ai_medium" }}
      </span>
            <span class="legend-item legend-item--human">
        <span class="legend-dot legend-dot--green"></span>
        {{ t .Lang "ailab.detector.legend.human" }}
      </span>
        </div>

        <!-- 操作按钮 -->
        <div class="result-actions">
            <button class="btn-result-secondary" onclick="exportPDF()">
                📄 {{ t .Lang "ailab.detector.result.export_pdf" }}
            </button>
            <a class="btn-result-primary" href="/ailab/humanize" id="btn-humanize">
                🔄 {{ t .Lang "ailab.detector.result.humanize_btn" }}
            </a>
        </div>

    </div>
</div>
```

---

## 3. CSS 样式

```css
/* static/css/detector.css — 结果面板 */

/* ── 面板容器 ────────────────────────────────────── */
.result-panel {
    background: #ffffff;
    border-radius: 16px;
    border: 1px solid #e5e7eb;
    padding: 28px 24px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    min-height: 400px;
    display: flex;
    flex-direction: column;
}

/* ── 空态 ────────────────────────────────────────── */
.result-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    flex: 1;
    padding: 16px 0;
}

.result-empty__icon {
    margin-bottom: 16px;
}

.result-empty__title {
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
    margin: 0 0 8px;
}

.result-empty__desc {
    font-size: 0.875rem;
    color: #9ca3af;
    margin: 0 0 24px;
}

.models-label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: #6b7280;
    margin: 0 0 10px;
    text-align: left;
}

.models-list {
    list-style: none;
    padding: 0;
    margin: 0;
    text-align: left;
}

.models-list li {
    font-size: 0.8125rem;
    color: #6b7280;
    padding: 3px 0;
}

/* ── 圆形仪表盘 ─────────────────────────────────── */
.gauge-wrapper {
    position: relative;
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
}

.gauge-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    pointer-events: none;
}

.gauge-percent {
    display: block;
    font-size: 1.75rem;
    font-weight: 800;
    color: #111827;
    line-height: 1;
    font-variant-numeric: tabular-nums;
}

.gauge-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 500;
    color: #9ca3af;
    margin-top: 2px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
}

/* 仪表盘颜色状态（JS 动态切换 class） */
.gauge-progress.score-low    { stroke: #22c55e; }  /* 0–40%  绿 */
.gauge-progress.score-medium { stroke: #eab308; }  /* 40–70% 黄 */
.gauge-progress.score-high   { stroke: #ef4444; }  /* 70–100% 红 */

/* ── 总体评估框 ─────────────────────────────────── */
.assessment-box {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 10px;
    padding: 12px 14px;
    margin-bottom: 20px;
}

.assessment-box.assessment-human {
    background: #f0fdf4;
    border-color: #bbf7d0;
}

.assessment-box.assessment-mixed {
    background: #fefce8;
    border-color: #fde68a;
}

.assessment-icon {
    font-size: 1.1rem;
    line-height: 1.4;
    flex-shrink: 0;
}

.assessment-text {
    font-size: 0.875rem;
    color: #374151;
    margin: 0;
    line-height: 1.5;
}

/* ── 统计网格 ────────────────────────────────────── */
.stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 18px;
}

.stat-item {
    background: #f9fafb;
    border-radius: 8px;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.stat-label {
    font-size: 0.75rem;
    color: #9ca3af;
}

.stat-value {
    font-size: 1.125rem;
    font-weight: 700;
    color: #111827;
    font-variant-numeric: tabular-nums;
}

.stat-value--red   { color: #ef4444; }
.stat-value--green { color: #22c55e; }

/* ── 进度条 ─────────────────────────────────────── */
.breakdown-bar {
    height: 8px;
    border-radius: 999px;
    background: #f3f4f6;
    overflow: hidden;
    display: flex;
    margin-bottom: 10px;
}

.breakdown-bar__fill {
    height: 100%;
    transition: width 0.8s ease;
}

.breakdown-bar__fill--ai    { background: #ef4444; }
.breakdown-bar__fill--human { background: #22c55e; }

/* ── 图例 ───────────────────────────────────────── */
.breakdown-legend {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-bottom: 20px;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.8125rem;
    color: #6b7280;
}

.legend-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
}

.legend-dot--red    { background: #ef4444; }
.legend-dot--yellow { background: #eab308; }
.legend-dot--green  { background: #22c55e; }

/* ── 操作按钮 ───────────────────────────────────── */
.result-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: auto;
}

.btn-result-primary {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 42px;
    background: #4f46e5;
    color: #ffffff;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    text-decoration: none;
    transition: background 0.15s;
}

.btn-result-primary:hover {
    background: #4338ca;
}

.btn-result-secondary {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 42px;
    background: #f9fafb;
    color: #374151;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s;
}

.btn-result-secondary:hover {
    background: #f3f4f6;
}
```

---

## 4. JavaScript — 仪表盘动画

```javascript
// static/js/detector.js（追加）

const CIRCUMFERENCE = 314.16; // 2 * π * r(50)

/**
 * 渲染结果面板（接受后端数据或 mock 数据）
 * @param {Object} data - DetectResponse 格式
 */
function renderResult(data) {
    // 切换显示状态
    document.getElementById('result-empty').style.display   = 'none';
    document.getElementById('result-content').style.display = 'block';

    const score = Math.round(data.overall_score); // 0–100

    // 1. 仪表盘动画
    animateGauge(score);

    // 2. 总体评估
    renderAssessment(score, data.assessment);

    // 3. 统计数据
    document.getElementById('stat-words').textContent     = data.word_count || 0;
    document.getElementById('stat-sentences').textContent = data.sentence_count || 0;

    const aiCount    = data.sentences ? data.sentences.filter(s => s.label !== 'human').length : 0;
    const humanCount = data.sentences ? data.sentences.filter(s => s.label === 'human').length  : 0;
    document.getElementById('stat-ai-sent').textContent    = aiCount;
    document.getElementById('stat-human-sent').textContent = humanCount;

    // 4. 进度条
    const total = aiCount + humanCount || 1;
    document.getElementById('breakdown-ai').style.width    = (aiCount    / total * 100) + '%';
    document.getElementById('breakdown-human').style.width = (humanCount / total * 100) + '%';

    // 5. 人性化按钮携带文本（通过 sessionStorage 传递）
    const inputText = document.getElementById('detect-input').value;
    sessionStorage.setItem('humanize_input', inputText);
}

function animateGauge(targetScore) {
    const progress  = document.getElementById('gauge-progress');
    const percentEl = document.getElementById('gauge-percent');

    // 设置颜色
    progress.className = 'gauge-progress';
    if      (targetScore < 40) progress.classList.add('score-low');
    else if (targetScore < 70) progress.classList.add('score-medium');
    else                       progress.classList.add('score-high');

    // stroke-dashoffset 动画（从满圆到目标值）
    const targetOffset = CIRCUMFERENCE * (1 - targetScore / 100);
    let   startTime    = null;
    const duration     = 1000; // 1秒

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed  = timestamp - startTime;
        const t        = Math.min(elapsed / duration, 1);
        const eased    = 1 - Math.pow(1 - t, 3); // ease-out cubic

        // 圆弧进度
        progress.style.strokeDashoffset = CIRCUMFERENCE - (CIRCUMFERENCE - targetOffset) * eased;

        // 数字从 0 滚动到目标值
        percentEl.textContent = Math.round(targetScore * eased) + '%';

        if (t < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}

function renderAssessment(score, assessment) {
    const box  = document.getElementById('assessment-box');
    const icon = document.getElementById('assessment-icon');
    const text = document.getElementById('assessment-text');

    // i18n key → 从 window.i18n 对象获取（由后端注入 JS 变量）
    const msgs = window.i18n || {};

    box.className = 'assessment-box';
    if (assessment === 'likely_ai') {
        box.classList.add('assessment-ai');
        icon.textContent = '🔴';
        text.textContent = msgs['ailab.detector.result.assessment.likely_ai']
            || `This text is likely AI-generated (${score}% confidence)`;
    } else if (assessment === 'likely_human') {
        box.classList.add('assessment-human');
        icon.textContent = '🟢';
        text.textContent = msgs['ailab.detector.result.assessment.likely_human']
            || 'This text appears to be human-written';
    } else {
        box.classList.add('assessment-mixed');
        icon.textContent = '🟡';
        text.textContent = msgs['ailab.detector.result.assessment.mixed']
            || 'This text contains a mix of AI and human writing';
    }
}

// 点击「查看示例」后自动展示 mock 结果
function fillExample() {
    /* ... 原有逻辑 ... */
    // 延迟 500ms 后展示 mock 结果（模拟检测流程）
    setTimeout(() => {
        renderResult({
            overall_score:  87,
            assessment:     'likely_ai',
            word_count:     342,
            sentence_count: 18,
            sentences: [
                { text: 'Artificial intelligence has emerged...', ai_score: 92, label: 'ai_high' },
                { text: 'Many experts believe...',                ai_score: 65, label: 'ai_medium' },
                { text: "But honestly, I'm not sure...",          ai_score: 18, label: 'human' },
            ]
        });
    }, 500);
}

// exportPDF 占位（A-07 实现）
function exportPDF() {
    console.log('Export PDF — implement in Block A-07');
}
```

---

## 5. i18n 翻译 Key（本 Block 新增）

### locales/zh.json

```json
{
  "ailab.detector.result.empty_title":             "检测结果",
  "ailab.detector.result.empty_desc":              "输入文本后，在这里查看详细的 AI 检测结果",
  "ailab.detector.supported_models":               "支持检测以下 AI 模型",
  "ailab.detector.result.words":                   "分析词数",
  "ailab.detector.result.sentences":               "分析句数",
  "ailab.detector.result.ai_sentences":            "AI 句子",
  "ailab.detector.result.human_sentences":         "人工句子",
  "ailab.detector.result.assessment.likely_ai":    "该文本极可能由 AI 生成",
  "ailab.detector.result.assessment.likely_human": "该文本极可能由人工撰写",
  "ailab.detector.result.assessment.mixed":        "该文本包含 AI 和人工混合内容",
  "ailab.detector.legend.ai_high":                 "高度 AI 特征 (>80%)",
  "ailab.detector.legend.ai_medium":               "混合/不确定 (40–80%)",
  "ailab.detector.legend.human":                   "人工撰写 (<40%)",
  "ailab.detector.result.export_pdf":              "导出 PDF 报告",
  "ailab.detector.result.humanize_btn":            "将此文本人性化 →"
}
```

### locales/en.json

```json
{
  "ailab.detector.result.empty_title":             "Your Results",
  "ailab.detector.result.empty_desc":              "Enter text above to see your detailed AI detection results here",
  "ailab.detector.supported_models":               "Detects content from",
  "ailab.detector.result.words":                   "Words Analyzed",
  "ailab.detector.result.sentences":               "Sentences Analyzed",
  "ailab.detector.result.ai_sentences":            "AI Sentences",
  "ailab.detector.result.human_sentences":         "Human Sentences",
  "ailab.detector.result.assessment.likely_ai":    "Your text is likely written by AI",
  "ailab.detector.result.assessment.likely_human": "Your text appears to be human-written",
  "ailab.detector.result.assessment.mixed":        "Your text contains a mix of AI and human writing",
  "ailab.detector.legend.ai_high":                 "Highly AI-like (>80%)",
  "ailab.detector.legend.ai_medium":               "Mixed / Uncertain (40–80%)",
  "ailab.detector.legend.human":                   "Human-like (<40%)",
  "ailab.detector.result.export_pdf":              "Export PDF Report",
  "ailab.detector.result.humanize_btn":            "Humanize This Text →"
}
```

---

## 6. 验收标准

- [ ] 检测前显示空态面板（支持检测的模型列表）
- [ ] 调用 `renderResult(mockData)` 后结果面板正确显示
- [ ] SVG 圆形仪表盘从 `0%` 动画到目标值（1秒）
- [ ] 分数 <40% → 绿色，40–70% → 黄色，70–100% → 红色
- [ ] 总体评估框颜色随分数变化
- [ ] 统计数据 4 格正确展示
- [ ] AI/Human 双色进度条宽度正确
- [ ] 「将此文本人性化」按钮链接到 `/ailab/humanize`

