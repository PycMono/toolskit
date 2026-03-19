# Block A-03 · AI 内容检测器 — 文本输入区组件

> **所属模块**：AI 内容检测器（/ailab/detector）  
> **竞品参考**：https://gptzero.me 输入区  
> **预估工时**：2h  
> **依赖**：A-02（页面骨架已存在）  
> **交付粒度**：仅负责输入区 UI + 字数计数 + 按钮禁用逻辑 + 示例文本，不含后端调用

---

## 1. 竞品分析（gptzero.me 输入区）

| 特性 | 竞品 | 本次实现 |
|------|------|---------|
| Tab 切换（文本/文件/URL） | ✅ 三个 Tab | ✅ 实现 |
| 大文本框，高度可拖拽 | ✅ | ✅ |
| 右下角字数计数 | ✅ | ✅ |
| 检测按钮禁用（字数不足） | ✅ 需 250+ 字 | ✅ 需 50+ 字 |
| 「Try an example」链接 | ✅ | ✅ |
| 拖拽上传文件区 | ✅ | ✅（仅 UI，无上传逻辑） |

---

## 2. HTML 模板

```html
<!-- templates/ailab/detector.html — 输入区 -->

<div class="detector-input-panel">

  <!-- Tab 切换：粘贴文本 / 上传文件 / 粘贴 URL -->
  <div class="input-tabs" role="tablist">
    <button class="input-tab input-tab--active"
            role="tab" data-tab="text"
            onclick="switchTab('text', this)">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
      {{ t .Lang "ailab.detector.input.tab_text" }}
    </button>
    <button class="input-tab"
            role="tab" data-tab="file"
            onclick="switchTab('file', this)">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
      </svg>
      {{ t .Lang "ailab.detector.input.tab_file" }}
    </button>
    <button class="input-tab"
            role="tab" data-tab="url"
            onclick="switchTab('url', this)">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
      {{ t .Lang "ailab.detector.input.tab_url" }}
    </button>
  </div>

  <!-- Tab 内容：粘贴文本 -->
  <div id="tab-text" class="tab-content tab-content--active">
    <div class="textarea-wrapper">
      <textarea
        id="detect-input"
        class="detect-textarea"
        placeholder="{{ t .Lang "ailab.detector.input.placeholder" }}"
        maxlength="5000"
        oninput="onInputChange(this)"
      ></textarea>
      <div class="textarea-footer">
        <span id="char-count" class="char-count">0 / 5000</span>
      </div>
    </div>
  </div>

  <!-- Tab 内容：上传文件（仅 UI） -->
  <div id="tab-file" class="tab-content" style="display:none">
    <div class="upload-zone" id="upload-zone"
         ondragover="event.preventDefault(); this.classList.add('drag-over')"
         ondragleave="this.classList.remove('drag-over')"
         ondrop="handleFileDrop(event)">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
      <p class="upload-zone__text">{{ t .Lang "ailab.detector.input.upload_hint" }}</p>
      <p class="upload-zone__formats">{{ t .Lang "ailab.detector.input.upload_formats" }}</p>
      <input type="file" id="file-input" accept=".txt,.pdf,.docx" style="display:none"
             onchange="handleFileSelect(this)">
      <button class="btn-secondary" onclick="document.getElementById('file-input').click()">
        {{ t .Lang "ailab.detector.input.upload_btn" }}
      </button>
    </div>
  </div>

  <!-- Tab 内容：粘贴 URL（仅 UI） -->
  <div id="tab-url" class="tab-content" style="display:none">
    <div class="url-input-wrapper">
      <input type="url" id="url-input" class="url-input"
             placeholder="{{ t .Lang "ailab.detector.input.url_placeholder" }}">
      <button class="btn-secondary" onclick="fetchURL()">
        {{ t .Lang "ailab.detector.input.url_fetch_btn" }}
      </button>
    </div>
  </div>

  <!-- 操作按钮区 -->
  <div class="input-actions">
    <button
      id="btn-detect"
      class="btn-primary btn-detect"
      disabled
      onclick="startDetection()"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <span id="btn-detect-text">{{ t .Lang "ailab.detector.btn.check" }}</span>
    </button>

    <button class="btn-example" onclick="fillExample()">
      {{ t .Lang "ailab.detector.btn.example" }}
    </button>
  </div>

</div>
```

---

## 3. CSS 样式

```css
/* static/css/detector.css — 输入区 */

/* ── 输入面板容器 ───────────────────────────────── */
.detector-input-panel {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

/* ── Tab 栏 ─────────────────────────────────────── */
.input-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.input-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 12px 20px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}

.input-tab:hover {
  color: #374151;
}

.input-tab--active {
  color: #4f46e5;
  border-bottom-color: #4f46e5;
  background: #ffffff;
}

/* ── Textarea ───────────────────────────────────── */
.textarea-wrapper {
  position: relative;
}

.detect-textarea {
  width: 100%;
  min-height: 240px;
  padding: 20px;
  font-size: 0.9375rem;   /* 15px */
  line-height: 1.7;
  color: #111827;
  background: #ffffff;
  border: none;
  outline: none;
  resize: vertical;
  font-family: inherit;
  box-sizing: border-box;
}

.detect-textarea::placeholder {
  color: #9ca3af;
}

.textarea-footer {
  display: flex;
  justify-content: flex-end;
  padding: 8px 20px 12px;
  border-top: 1px solid #f3f4f6;
}

.char-count {
  font-size: 0.8125rem;
  color: #9ca3af;
  font-variant-numeric: tabular-nums;
}

.char-count--warning {
  color: #ef4444;
  font-weight: 600;
}

/* ── 上传区域 ───────────────────────────────────── */
.upload-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 240px;
  padding: 32px;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  margin: 16px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.upload-zone:hover,
.upload-zone.drag-over {
  border-color: #4f46e5;
  background: #f5f3ff;
}

.upload-zone__text {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #374151;
  margin: 0;
}

.upload-zone__formats {
  font-size: 0.8125rem;
  color: #9ca3af;
  margin: 0;
}

/* ── URL 输入 ───────────────────────────────────── */
.url-input-wrapper {
  display: flex;
  gap: 10px;
  padding: 20px;
  align-items: center;
}

.url-input {
  flex: 1;
  height: 44px;
  padding: 0 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
}

.url-input:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79,70,229,0.1);
}

/* ── 操作按钮区 ─────────────────────────────────── */
.input-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px 20px;
  border-top: 1px solid #f3f4f6;
}

.btn-detect {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  padding: 0 28px;
  background: #4f46e5;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s, opacity 0.2s;
}

.btn-detect:hover:not(:disabled) {
  background: #4338ca;
  transform: translateY(-1px);
}

.btn-detect:active:not(:disabled) {
  transform: translateY(0);
}

.btn-detect:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn-secondary {
  height: 44px;
  padding: 0 18px;
  background: #f9fafb;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-secondary:hover {
  background: #f3f4f6;
}

.btn-example {
  background: transparent;
  border: none;
  color: #6b7280;
  font-size: 0.875rem;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
  padding: 0;
}

.btn-example:hover {
  color: #4f46e5;
}
```

---

## 4. JavaScript 逻辑

```javascript
// static/js/detector.js

const MIN_CHARS = 50;   // 最小字数才能检测
const MAX_CHARS = 5000;

// 切换 Tab
function switchTab(tabName, btn) {
  // 隐藏所有 tab 内容
  document.querySelectorAll('.tab-content').forEach(el => {
    el.style.display = 'none';
    el.classList.remove('tab-content--active');
  });
  // 取消所有 tab 激活态
  document.querySelectorAll('.input-tab').forEach(el => {
    el.classList.remove('input-tab--active');
  });
  // 显示目标 tab
  document.getElementById('tab-' + tabName).style.display = 'block';
  btn.classList.add('input-tab--active');
}

// 输入变化：更新字数 + 按钮状态
function onInputChange(textarea) {
  const len = textarea.value.length;
  const counter = document.getElementById('char-count');
  counter.textContent = len + ' / ' + MAX_CHARS;
  counter.classList.toggle('char-count--warning', len >= MAX_CHARS * 0.9);

  // 超出限制截断
  if (len > MAX_CHARS) {
    textarea.value = textarea.value.substring(0, MAX_CHARS);
  }

  // 更新按钮状态
  const btn = document.getElementById('btn-detect');
  btn.disabled = textarea.value.trim().length < MIN_CHARS;
}

// 填入示例文本（AI 生成的段落）
function fillExample() {
  const example = `Artificial intelligence has emerged as one of the most transformative technologies of the twenty-first century, fundamentally reshaping how humans interact with information, make decisions, and organize their daily lives. The development of large language models has enabled machines to generate coherent text, answer complex questions, and assist with creative tasks in ways that were previously unimaginable. These systems are trained on vast corpora of text data, learning patterns and relationships between words and concepts to produce highly sophisticated outputs. As AI capabilities continue to advance, researchers and policymakers are increasingly focused on understanding both the potential benefits and the significant risks associated with widespread deployment of these technologies.`;

  const textarea = document.getElementById('detect-input');
  textarea.value = example;
  onInputChange(textarea);

  // 切换到文本 Tab（如果不在）
  switchTab('text', document.querySelector('[data-tab="text"]'));
}

// 文件拖放（仅 UI，不含上传逻辑）
function handleFileDrop(e) {
  e.preventDefault();
  document.getElementById('upload-zone').classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) {
    console.log('File dropped:', file.name); // 后续 Block 实现上传
  }
}

function handleFileSelect(input) {
  const file = input.files[0];
  if (file) {
    console.log('File selected:', file.name); // 后续 Block 实现上传
  }
}

// URL 抓取（仅占位，后续 Block 实现）
function fetchURL() {
  const url = document.getElementById('url-input').value;
  console.log('Fetch URL:', url); // 后续 Block 实现
}

// startDetection 由 A-06 Block 实现，这里仅占位
function startDetection() {
  console.log('Detection triggered — implement in Block A-06');
}
```

---

## 5. i18n 翻译 Key（本 Block 新增）

### locales/zh.json

```json
{
  "ailab.detector.input.tab_text":       "粘贴文本",
  "ailab.detector.input.tab_file":       "上传文件",
  "ailab.detector.input.tab_url":        "粘贴 URL",
  "ailab.detector.input.placeholder":    "粘贴或输入你想检测的文本（最少 50 个字符）...",
  "ailab.detector.input.upload_hint":    "拖放文件到此处，或点击选择",
  "ailab.detector.input.upload_formats": "支持 .txt · .pdf · .docx，最大 5MB",
  "ailab.detector.input.upload_btn":     "选择文件",
  "ailab.detector.input.url_placeholder":"粘贴网页 URL，自动提取文本...",
  "ailab.detector.input.url_fetch_btn":  "提取文本",
  "ailab.detector.btn.check":            "检测 AI 内容",
  "ailab.detector.btn.example":          "查看示例"
}
```

### locales/en.json

```json
{
  "ailab.detector.input.tab_text":       "Paste Text",
  "ailab.detector.input.tab_file":       "Upload File",
  "ailab.detector.input.tab_url":        "Paste URL",
  "ailab.detector.input.placeholder":    "Paste or type the text you want to check (min. 50 chars)...",
  "ailab.detector.input.upload_hint":    "Drag & drop your file here, or click to browse",
  "ailab.detector.input.upload_formats": "Supports .txt · .pdf · .docx · Max 5MB",
  "ailab.detector.input.upload_btn":     "Browse File",
  "ailab.detector.input.url_placeholder":"Paste a webpage URL to extract text...",
  "ailab.detector.input.url_fetch_btn":  "Fetch Text",
  "ailab.detector.btn.check":            "Check for AI",
  "ailab.detector.btn.example":          "Try an Example"
}
```

---

## 6. 验收标准

- [ ] 三个 Tab（粘贴文本 / 上传文件 / 粘贴 URL）切换正常，互斥显示
- [ ] 文本框字数计数实时更新，`0 / 5000` 格式
- [ ] 输入不足 50 字时「检测」按钮为灰色 disabled 状态
- [ ] 输入达到 50 字后按钮变为蓝色可点击
- [ ] 接近 5000 字时字数显示变红色警告
- [ ] 点击「查看示例」填入示例文本并自动激活文本 Tab
- [ ] 上传文件拖拽区域 hover/drag-over 时边框变蓝
- [ ] 移动端布局不错位

