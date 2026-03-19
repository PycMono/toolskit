# Block B-03 · AI 人性化工具 — 左右双栏输入输出 UI

> **所属模块**：AI 人性化工具（/ailab/humanize）  
> **竞品参考**：https://www.humanizeai.pro 左右双栏主体  
> **预估工时**：2h  
> **依赖**：B-02（Hero 与模式选择器存在）  
> **交付粒度**：仅负责左右双栏的 HTML + CSS 结构，不含后端调用

---

## 1. 竞品分析（humanizeai.pro 双栏）

| 特性 | 竞品 | 本次实现 |
|------|------|---------|
| 左侧输入（AI 文本） | 50% 宽度，大文本框 | ✅ |
| 右侧输出（人性化结果） | 50% 宽度，只读显示 | ✅ |
| 操作按钮在左侧底部 | 「立即人性化」大按钮 | ✅ |
| 右侧底部操作 | 复制 / 再次改写 / 检测分数 | ✅ |
| 字数显示 | 左侧输入框右下角 | ✅ |
| 修改百分比统计 | 输出后显示 | ✅ |
| 移动端上下堆叠 | ✅ | ✅ |

---

## 2. HTML 模板

```html
<!-- templates/ailab/humanize.html — 双栏主体 -->

<section class="humanize-workspace">
  <div class="container">
    <div class="humanize-columns">

      <!-- ── 左侧：输入区 ──────────────────────────── -->
      <div class="humanize-col humanize-col--input">

        <div class="col-header">
          <span class="col-header__label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M7 8h10M7 12h10M7 16h6"/>
            </svg>
            {{ t .Lang "ailab.humanize.input.label" }}
          </span>
          <span class="col-header__badge col-header__badge--gray">AI</span>
        </div>

        <div class="textarea-box">
          <textarea
            id="humanize-input"
            class="humanize-textarea"
            placeholder="{{ t .Lang "ailab.humanize.input.placeholder" }}"
            maxlength="5000"
            oninput="onHumanizeInputChange(this)"
          ></textarea>
          <div class="textarea-counter">
            <span id="humanize-char-count">0 / 5000</span>
          </div>
        </div>

        <!-- 「立即人性化」主操作按钮 -->
        <button
          id="btn-humanize"
          class="btn-humanize-primary"
          disabled
          onclick="startHumanize()"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          <span id="btn-humanize-text">{{ t .Lang "ailab.humanize.btn.humanize" }}</span>
        </button>

      </div>

      <!-- 分割线（仅桌面端） -->
      <div class="humanize-divider" aria-hidden="true">
        <div class="divider-line"></div>
        <div class="divider-arrow">→</div>
        <div class="divider-line"></div>
      </div>

      <!-- ── 右侧：输出区 ──────────────────────────── -->
      <div class="humanize-col humanize-col--output">

        <div class="col-header">
          <span class="col-header__label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2">
              <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"/>
              <polygon points="18 2 22 6 12 16 8 16 8 12 18 2"/>
            </svg>
            {{ t .Lang "ailab.humanize.output.label" }}
          </span>
          <span class="col-header__badge col-header__badge--green">Human</span>
        </div>

        <!-- 输出内容区 -->
        <div class="output-box" id="output-box">
          <!-- 空态 -->
          <div class="output-empty" id="output-empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                 stroke="#d1d5db" stroke-width="1.5">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            <p>{{ t .Lang "ailab.humanize.output.empty" }}</p>
          </div>
          <!-- 输出文本（检测完成后显示） -->
          <div class="output-text" id="humanize-output" style="display:none"></div>
        </div>

        <!-- 统计行（输出后显示） -->
        <div class="output-stats" id="humanize-stats" style="display:none">
          <span class="stat-changed">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
            </svg>
            <span id="stat-changed-text">—</span>
          </span>
          <span class="stat-ai-score" id="stat-ai-score" style="display:none">
            AI 率: <strong id="stat-ai-score-val">—</strong>
          </span>
        </div>

        <!-- 输出操作按钮 -->
        <div class="output-actions" id="output-actions" style="display:none">
          <button class="btn-output-action" onclick="copyOutput()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            <span id="btn-copy-text">{{ t .Lang "ailab.humanize.btn.copy" }}</span>
          </button>

          <button class="btn-output-action" onclick="startHumanize()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
            </svg>
            {{ t .Lang "ailab.humanize.btn.again" }}
          </button>

          <a class="btn-output-action btn-output-action--link"
             href="/ailab/detector" id="btn-check-ai-score">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2">
              <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7l-9-5z"/>
            </svg>
            {{ t .Lang "ailab.humanize.btn.check_score" }}
          </a>
        </div>

      </div>
    </div>
  </div>
</section>
```

---

## 3. CSS 样式

```css
/* static/css/humanize.css — 双栏主体 */

/* ── 工作区容器 ─────────────────────────────────── */
.humanize-workspace {
  padding: 32px 0 48px;
  background: #ffffff;
}

.humanize-columns {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 0;
  min-height: 480px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 6px rgba(0,0,0,0.06);
}

/* ── 单列通用 ───────────────────────────────────── */
.humanize-col {
  display: flex;
  flex-direction: column;
  padding: 0;
}

/* ── 列标题行 ───────────────────────────────────── */
.col-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid #f3f4f6;
  background: #f9fafb;
}

.col-header__label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.col-header__badge {
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.col-header__badge--gray {
  background: #f3f4f6;
  color: #6b7280;
}

.col-header__badge--green {
  background: #dcfce7;
  color: #166534;
}

/* ── 输入区 Textarea ────────────────────────────── */
.textarea-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

.humanize-textarea {
  flex: 1;
  width: 100%;
  min-height: 280px;
  padding: 18px;
  font-size: 0.9375rem;
  line-height: 1.7;
  color: #111827;
  background: #ffffff;
  border: none;
  outline: none;
  resize: none;
  font-family: inherit;
  box-sizing: border-box;
}

.humanize-textarea::placeholder {
  color: #9ca3af;
}

.textarea-counter {
  padding: 6px 18px 10px;
  text-align: right;
  font-size: 0.8rem;
  color: #9ca3af;
  border-top: 1px solid #f3f4f6;
}

/* ── 「立即人性化」按钮 ──────────────────────────── */
.btn-humanize-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: calc(100% - 36px);
  height: 50px;
  margin: 14px 18px 18px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
  box-shadow: 0 4px 14px rgba(79,70,229,0.3);
}

.btn-humanize-primary:hover:not(:disabled) {
  opacity: 0.92;
  transform: translateY(-1px);
}

.btn-humanize-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-humanize-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}

/* ── 分割线 ─────────────────────────────────────── */
.humanize-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 6px;
  background: #f9fafb;
  border-left: 1px solid #e5e7eb;
  border-right: 1px solid #e5e7eb;
}

.divider-line {
  flex: 1;
  width: 1px;
  background: #e5e7eb;
}

.divider-arrow {
  font-size: 1.25rem;
  color: #9ca3af;
  user-select: none;
}

/* ── 输出区 ─────────────────────────────────────── */
.output-box {
  flex: 1;
  position: relative;
  min-height: 280px;
}

.output-empty {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #9ca3af;
  font-size: 0.875rem;
}

.output-text {
  padding: 18px;
  font-size: 0.9375rem;
  line-height: 1.7;
  color: #111827;
  white-space: pre-wrap;
  word-break: break-word;
}

/* ── 统计行 ─────────────────────────────────────── */
.output-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 18px;
  border-top: 1px solid #f3f4f6;
  font-size: 0.8125rem;
}

.stat-changed {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #059669;
  font-weight: 500;
}

.stat-ai-score {
  color: #6b7280;
}

/* ── 输出操作按钮 ────────────────────────────────── */
.output-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px 18px;
  flex-wrap: wrap;
}

.btn-output-action {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 36px;
  padding: 0 14px;
  background: #f9fafb;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.15s;
}

.btn-output-action:hover {
  background: #f3f4f6;
}

.btn-output-action--link {
  color: #4f46e5;
  border-color: #c7d2fe;
  background: #eef2ff;
}

.btn-output-action--link:hover {
  background: #e0e7ff;
}

/* ── 响应式：移动端上下堆叠 ──────────────────────── */
@media (max-width: 768px) {
  .humanize-columns {
    grid-template-columns: 1fr;
  }
  .humanize-divider {
    display: none;
  }
  .humanize-col--input {
    border-bottom: 2px solid #4f46e5;
  }
}
```

---

## 4. JavaScript — 基础交互

```javascript
// static/js/humanize.js（追加）

const HUMANIZE_MAX_CHARS = 5000;
const HUMANIZE_MIN_CHARS = 20;

function onHumanizeInputChange(textarea) {
  const len     = textarea.value.length;
  const counter = document.getElementById('humanize-char-count');
  counter.textContent = len + ' / ' + HUMANIZE_MAX_CHARS;

  // 更新按钮状态
  const btn = document.getElementById('btn-humanize');
  btn.disabled = textarea.value.trim().length < HUMANIZE_MIN_CHARS;
}

function copyOutput() {
  const outputEl = document.getElementById('humanize-output');
  const text     = outputEl.textContent || '';
  if (!text) return;

  navigator.clipboard.writeText(text).then(() => {
    const btnText = document.getElementById('btn-copy-text');
    const original = btnText.textContent;
    btnText.textContent = '✓ 已复制';
    setTimeout(() => { btnText.textContent = original; }, 2000);
  });
}

// startHumanize 由 B-05 实现，这里仅占位
function startHumanize() {
  console.log('Humanize triggered — implement in Block B-05');
}
```

---

## 5. i18n 翻译 Key（本 Block 新增）

### locales/zh.json

```json
{
  "ailab.humanize.input.label":       "AI 文本输入",
  "ailab.humanize.input.placeholder": "粘贴你的 AI 生成文本...",
  "ailab.humanize.output.label":      "人性化输出",
  "ailab.humanize.output.empty":      "点击「立即人性化」后，改写结果将显示在这里",
  "ailab.humanize.btn.humanize":      "✨ 立即人性化",
  "ailab.humanize.btn.copy":          "复制文本",
  "ailab.humanize.btn.again":         "再次改写",
  "ailab.humanize.btn.check_score":   "检测 AI 分数 →"
}
```

### locales/en.json

```json
{
  "ailab.humanize.input.label":       "AI Text Input",
  "ailab.humanize.input.placeholder": "Paste your AI-generated text here...",
  "ailab.humanize.output.label":      "Humanized Output",
  "ailab.humanize.output.empty":      "Your humanized text will appear here after clicking Humanize Now",
  "ailab.humanize.btn.humanize":      "✨ Humanize Now",
  "ailab.humanize.btn.copy":          "Copy Text",
  "ailab.humanize.btn.again":         "Humanize Again",
  "ailab.humanize.btn.check_score":   "Check AI Score →"
}
```

---

## 6. 验收标准

- [ ] 左右双栏等宽布局，中间有分割箭头
- [ ] 左侧输入框字数计数实时更新
- [ ] 输入不足 20 字时「立即人性化」按钮 disabled
- [ ] 右侧空态提示文字居中显示
- [ ] 移动端自动变为上下堆叠布局
- [ ] 「检测 AI 分数」按钮样式为蓝色（区别于其他按钮）

