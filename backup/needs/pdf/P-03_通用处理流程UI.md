# Block P-03 · PDF 工具 — 通用处理流程 UI 组件（所有工具复用）

> **所属模块**：PDF 工具（全工具共用）  
> **竞品参考**：https://pdfhouse.com 各工具处理页  
> **预估工时**：3h  
> **依赖**：P-01  
> **交付粒度**：所有 20 个工具页面复用的上传→配置→处理→下载完整 UI 组件，含拖拽上传、进度条、结果卡片

---

## 1. 通用工具页模板

```html
<!-- templates/pdf/tool.html  （所有工具页都用此模板）-->
{{- template "pdf/layout.html" . }}

{{- define "pdf-content" }}

<!-- 面包屑 -->
<nav class="pdf-breadcrumb">
  <div class="pdf-container">
    <a href="/pdf">PDF 工具</a>
    <span>›</span>
    <span>{{ t .Lang (printf "pdf.tool.%s.name" .ToolName) }}</span>
  </div>
</nav>

<!-- 广告位：顶部横幅 -->
{{- template "partials/ad_slot.html" dict "SlotID" "pdf-top" "Size" "728x90" "Mobile" "320x50" }}

<div class="tool-page">
  <div class="pdf-container">
    <div class="tool-layout">

      <!-- ── 主操作区 ── -->
      <div class="tool-main">

        <!-- Hero 标题 -->
        <div class="tool-hero"
             style="background: linear-gradient(135deg, {{ index (split .Color ",") 0 }}18, {{ index (split .Color ",") 1 }}08)">
          <div class="tool-hero__icon"
               style="background: {{ index (split .Color ",") 0 }}20; color: {{ index (split .Color ",") 0 }}">
            {{ .Icon }}
          </div>
          <div>
            <h1 class="tool-hero__title">{{ t .Lang (printf "pdf.tool.%s.name" .ToolName) }}</h1>
            <p  class="tool-hero__desc">{{ .Desc }}</p>
          </div>
        </div>

        <!-- ── STEP 1: 上传区 ── -->
        <div class="tool-step" id="step-upload">
          <div class="step-num">1</div>

          <div class="upload-zone" id="upload-zone"
               ondragover="onDragOver(event)"
               ondragleave="onDragLeave(event)"
               ondrop="onDrop(event)">
            <div class="upload-zone__content">
              <svg class="upload-zone__icon" width="48" height="48" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <p class="upload-zone__title">{{ t .Lang "pdf.upload.title" }}</p>
              <p class="upload-zone__or">{{ t .Lang "pdf.upload.or" }}</p>
              <label class="upload-zone__btn">
                {{ t .Lang "pdf.upload.btn" }}
                <input type="file" id="file-input" accept="{{ .Accept }}"
                       {{ if .Multi }}multiple{{ end }}
                       style="display:none" onchange="onFileSelect(this)">
              </label>
              <p class="upload-zone__hint">{{ t .Lang "pdf.upload.hint" }}</p>
            </div>

            <!-- 拖拽悬浮层 -->
            <div class="upload-zone__drop-overlay">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2">
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span>{{ t .Lang "pdf.upload.drop_active" }}</span>
            </div>
          </div>

          <!-- 已选文件列表 -->
          <div class="selected-files" id="selected-files" style="display:none">
            <div class="selected-files__list" id="file-list"></div>
            {{ if .Multi }}
            <button class="add-more-btn" onclick="document.getElementById('file-input').click()">
              {{ t .Lang "pdf.merge.add_more" }}
            </button>
            {{ end }}
          </div>
        </div>

        <!-- ── STEP 2: 配置参数（各工具注入不同内容）── -->
        <div class="tool-step" id="step-config" style="display:none">
          <div class="step-num">2</div>
          <div class="tool-config-panel" id="tool-config">
            <!-- 由 P-04~P-09 各工具注入专属配置 UI -->
            {{- block "tool-config" . }}{{- end }}
          </div>
        </div>

        <!-- ── STEP 3: 处理按钮 + 进度 ── -->
        <div class="tool-step tool-step--action" id="step-action" style="display:none">
          <button class="process-btn" id="process-btn" onclick="startProcess()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            <span id="process-btn-text">{{ t .Lang "pdf.process.btn" }}</span>
          </button>
        </div>

        <!-- 进度条（处理中显示）-->
        <div class="progress-area" id="progress-area" style="display:none">
          <div class="progress-bar-wrap">
            <div class="progress-bar" id="progress-bar" style="width:0%"></div>
          </div>
          <p class="progress-text" id="progress-text">{{ t .Lang "pdf.process.uploading" }}</p>
        </div>

        <!-- ── 结果区 ── -->
        <div class="result-area" id="result-area" style="display:none">
          <div class="result-card">
            <div class="result-card__success-icon">✅</div>
            <h2 class="result-card__title">{{ t .Lang "pdf.process.done" }}</h2>

            <!-- 文件信息对比 -->
            <div class="result-stats" id="result-stats"></div>

            <!-- 广告位：结果下方高曝光 -->
            {{- template "partials/ad_slot.html" dict "SlotID" "pdf-result" "Size" "300x250" }}

            <div class="result-actions">
              <a class="download-btn" id="download-btn" href="#" download>
                ⬇ {{ t .Lang "pdf.result.download" }}
              </a>
              <button class="process-new-btn" onclick="resetTool()">
                {{ t .Lang "pdf.result.process_new" }}
              </button>
            </div>
          </div>
        </div>

        <!-- FAQ 区域 -->
        {{ if .FAQs }}
        <section class="tool-faq">
          <h2 class="pdf-section-title">{{ t .Lang "pdf.faq.title" }}</h2>
          <div class="faq-list">
            {{- range $i, $faq := .FAQs }}
            <div class="faq-item" id="tool-faq-{{ $i }}">
              <button class="faq-question" onclick="toggleFAQ('tool-faq-{{ $i }}')">
                <span>{{ $faq.Q }}</span>
                <svg class="faq-chevron" width="16" height="16" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              <div class="faq-answer"><p>{{ $faq.A }}</p></div>
            </div>
            {{- end }}
          </div>
        </section>
        {{ end }}

      </div><!-- /tool-main -->

      <!-- ── 右侧广告 + 相关工具 ── -->
      <div class="tool-sidebar">
        {{- template "partials/ad_slot.html" dict "SlotID" "pdf-sidebar" "Size" "300x250" "MobileHide" true }}
        <div class="related-tools" id="related-tools">
          <!-- JS 动态注入相关工具链接 -->
        </div>
      </div>

    </div><!-- /tool-layout -->
  </div><!-- /pdf-container -->
</div><!-- /tool-page -->

{{- end }}
```

---

## 2. CSS — 通用处理流程

```css
/* static/css/pdf-tool.css */

/* ── 面包屑 ───────────────────────────────────── */
.pdf-breadcrumb {
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  padding: 10px 0;
  font-size: 0.8125rem;
  color: #a0aec0;
}

.pdf-breadcrumb .pdf-container {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pdf-breadcrumb a { color: #718096; text-decoration: none; }
.pdf-breadcrumb a:hover { color: #e53e3e; }
.pdf-breadcrumb span:last-child { color: #2d3748; font-weight: 500; }

/* ── 页面布局 ─────────────────────────────────── */
.tool-page {
  background: #f7fafc;
  min-height: calc(100vh - 56px - 40px);
  padding: 28px 0 56px;
}

.tool-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 24px;
  align-items: start;
}

/* ── 工具 Hero 标题区 ─────────────────────────── */
.tool-hero {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px 24px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.tool-hero__icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.tool-hero__title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #1a202c;
  margin: 0 0 4px;
}

.tool-hero__desc {
  font-size: 0.875rem;
  color: #718096;
  margin: 0;
  line-height: 1.5;
}

/* ── 步骤容器 ─────────────────────────────────── */
.tool-step {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 24px;
  margin-bottom: 16px;
  position: relative;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.step-num {
  position: absolute;
  top: -12px;
  left: 20px;
  width: 24px;
  height: 24px;
  background: #e53e3e;
  color: #fff;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(229,62,62,0.35);
}

/* ── 上传区 ───────────────────────────────────── */
.upload-zone {
  border: 2px dashed #cbd5e0;
  border-radius: 12px;
  padding: 40px 24px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  position: relative;
  overflow: hidden;
}

.upload-zone:hover,
.upload-zone--dragover { border-color: #e53e3e; background: #fff5f5; }

.upload-zone__icon   { color: #cbd5e0; margin-bottom: 14px; transition: color 0.2s; }
.upload-zone:hover .upload-zone__icon { color: #e53e3e; }

.upload-zone__title  { font-size: 1rem; font-weight: 700; color: #2d3748; margin: 0 0 6px; }
.upload-zone__or     { font-size: 0.8125rem; color: #a0aec0; margin: 0 0 12px; }

.upload-zone__btn {
  display: inline-flex;
  align-items: center;
  height: 40px;
  padding: 0 20px;
  background: #e53e3e;
  color: #fff;
  border-radius: 9px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
  box-shadow: 0 3px 10px rgba(229,62,62,0.25);
}
.upload-zone__btn:hover { background: #c53030; }
.upload-zone__hint { font-size: 0.75rem; color: #a0aec0; margin: 10px 0 0; }

/* 拖拽悬浮层 */
.upload-zone__drop-overlay {
  position: absolute;
  inset: 0;
  background: rgba(229,62,62,0.08);
  border-radius: 10px;
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #e53e3e;
  font-size: 1rem;
  font-weight: 700;
  pointer-events: none;
}
.upload-zone--dragover .upload-zone__drop-overlay { display: flex; }

/* ── 已选文件列表 ─────────────────────────────── */
.selected-files { margin-top: 16px; }

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 9px;
  margin-bottom: 8px;
  cursor: grab;
}

.file-item__icon {
  width: 32px;
  height: 32px;
  background: #fee2e2;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e53e3e;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.file-item__info { flex: 1; min-width: 0; }
.file-item__name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #2d3748;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.file-item__meta { font-size: 0.75rem; color: #a0aec0; }

.file-item__remove {
  width: 24px;
  height: 24px;
  background: #fee2e2;
  color: #e53e3e;
  border: none;
  border-radius: 50%;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s;
}
.file-item__remove:hover { background: #fecaca; }

.file-item__drag-handle {
  color: #cbd5e0;
  cursor: grab;
  font-size: 1rem;
}

.add-more-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  height: 38px;
  background: transparent;
  border: 1.5px dashed #cbd5e0;
  border-radius: 9px;
  font-size: 0.875rem;
  color: #718096;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
  margin-top: 4px;
}
.add-more-btn:hover { border-color: #e53e3e; color: #e53e3e; }

/* ── 处理按钮 ─────────────────────────────────── */
.tool-step--action { background: transparent; border: none; box-shadow: none; padding: 0; }

.process-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  height: 52px;
  background: linear-gradient(135deg, #e53e3e, #c53030);
  color: #ffffff;
  border: none;
  border-radius: 13px;
  font-size: 1.0625rem;
  font-weight: 800;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
  box-shadow: 0 6px 20px rgba(229,62,62,0.35);
}

.process-btn:hover:not(:disabled)  { opacity: 0.92; transform: translateY(-1px); }
.process-btn:active:not(:disabled) { transform: translateY(0); }
.process-btn:disabled {
  background: #e2e8f0;
  color: #a0aec0;
  cursor: not-allowed;
  box-shadow: none;
}

/* ── 进度条 ───────────────────────────────────── */
.progress-area {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 24px;
  margin-bottom: 16px;
}

.progress-bar-wrap {
  height: 8px;
  background: #edf2f7;
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #e53e3e, #fc8181);
  border-radius: 999px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  color: #718096;
  text-align: center;
  margin: 0;
}

/* ── 结果区 ───────────────────────────────────── */
.result-area {
  margin-bottom: 16px;
  animation: slideInUp 0.3s ease;
}

@keyframes slideInUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.result-card {
  background: #fff;
  border: 1px solid #c6f6d5;
  border-radius: 16px;
  padding: 28px 24px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
}

.result-card__success-icon { font-size: 2.5rem; margin-bottom: 12px; }
.result-card__title { font-size: 1.25rem; font-weight: 800; color: #1a202c; margin: 0 0 16px; }

.result-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.result-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.result-stat__label { font-size: 0.75rem; color: #a0aec0; }
.result-stat__value { font-size: 1rem; font-weight: 700; color: #2d3748; }
.result-stat__value--green { color: #38a169; }

.result-stat-arrow { font-size: 1.2rem; color: #cbd5e0; }

.result-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 20px;
}

.download-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  padding: 0 28px;
  background: linear-gradient(135deg, #38a169, #276749);
  color: #ffffff;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 4px 14px rgba(56,161,105,0.3);
  transition: opacity 0.15s;
}
.download-btn:hover { opacity: 0.9; }

.process-new-btn {
  height: 48px;
  padding: 0 24px;
  background: #f7fafc;
  color: #4a5568;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.process-new-btn:hover { background: #edf2f7; }

/* ── 右侧栏 ───────────────────────────────────── */
.tool-sidebar { position: sticky; top: 80px; }

.related-tools {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px;
  margin-top: 16px;
}

.related-tools__title {
  font-size: 0.8125rem;
  font-weight: 700;
  color: #a0aec0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 12px;
}

.related-tool-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  text-decoration: none;
  color: #2d3748;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.1s;
}
.related-tool-link:hover { background: #f7fafc; color: #e53e3e; }

/* ── 工具配置面板 ─────────────────────────────── */
.config-group {
  margin-bottom: 18px;
}

.config-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
}

.config-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.config-option {
  height: 36px;
  padding: 0 16px;
  background: #f7fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #4a5568;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  white-space: nowrap;
}
.config-option:hover { border-color: #e53e3e; }
.config-option--active {
  border-color: #e53e3e;
  background: #fff5f5;
  color: #e53e3e;
  font-weight: 600;
}

.config-input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 9px;
  font-size: 0.9rem;
  color: #2d3748;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.config-input:focus { border-color: #e53e3e; box-shadow: 0 0 0 3px rgba(229,62,62,0.1); }

/* ── 响应式 ───────────────────────────────────── */
@media (max-width: 900px) {
  .tool-layout { grid-template-columns: 1fr; }
  .tool-sidebar { display: none; }
}
```

---

## 3. JavaScript — 通用流程逻辑

```javascript
// static/js/pdf-tool-core.js
// 所有工具页都引入此文件，各工具通过 window.PDFToolConfig 注入专属配置

/* ── 全局状态 ────────────────────────────────── */
let uploadedFiles = [];    // 已选文件数组
let currentTaskId = null;  // 当前处理任务 ID
let pollTimer     = null;  // 进度轮询定时器

/* ── 拖拽上传 ────────────────────────────────── */
function onDragOver(e) {
  e.preventDefault();
  document.getElementById('upload-zone').classList.add('upload-zone--dragover');
}

function onDragLeave() {
  document.getElementById('upload-zone').classList.remove('upload-zone--dragover');
}

function onDrop(e) {
  e.preventDefault();
  onDragLeave();
  addFiles(e.dataTransfer.files);
}

function onFileSelect(input) {
  addFiles(input.files);
  input.value = ''; // 允许重复选相同文件
}

function addFiles(fileList) {
  const config    = window.PDFToolConfig || {};
  const maxFiles  = config.maxFiles  || 10;
  const maxSizeMB = config.maxSizeMB || 50;

  for (const file of fileList) {
    if (uploadedFiles.length >= maxFiles) {
      showPDFToast(`最多同时处理 ${maxFiles} 个文件`, 'error');
      break;
    }

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      showPDFToast(`${file.name} 超过 ${maxSizeMB}MB 限制`, 'error');
      continue;
    }

    // 检查格式
    const accept = document.getElementById('file-input')?.accept || '';
    if (accept && !isAcceptedFile(file, accept)) {
      showPDFToast(`不支持 ${file.name.split('.').pop()} 格式`, 'error');
      continue;
    }

    uploadedFiles.push(file);
  }

  renderFileList();
  updateActionVisibility();
}

function renderFileList() {
  const listEl   = document.getElementById('file-list');
  const wrapEl   = document.getElementById('selected-files');

  if (uploadedFiles.length === 0) {
    wrapEl.style.display = 'none';
    return;
  }

  wrapEl.style.display = 'block';
  listEl.innerHTML = uploadedFiles.map((f, i) => `
    <div class="file-item" draggable="true"
         ondragstart="dragStart(${i})" ondragover="dragOver(event,${i})"
         ondrop="dragDropFile(event,${i})">
      <span class="file-item__drag-handle">⠿</span>
      <div class="file-item__icon">📄</div>
      <div class="file-item__info">
        <div class="file-item__name" title="${f.name}">${f.name}</div>
        <div class="file-item__meta">${formatFileSize(f.size)}</div>
      </div>
      <button class="file-item__remove" onclick="removeFile(${i})" title="移除">×</button>
    </div>
  `).join('');
}

function removeFile(idx) {
  uploadedFiles.splice(idx, 1);
  renderFileList();
  updateActionVisibility();
}

function updateActionVisibility() {
  const hasFiles = uploadedFiles.length > 0;
  document.getElementById('step-config').style.display  = hasFiles ? 'block' : 'none';
  document.getElementById('step-action').style.display  = hasFiles ? 'block' : 'none';
}

/* ── 文件拖拽排序 ────────────────────────────── */
let dragSourceIdx = null;

function dragStart(idx)               { dragSourceIdx = idx; }
function dragOver(e, idx)             { e.preventDefault(); }
function dragDropFile(e, targetIdx)   {
  e.preventDefault();
  if (dragSourceIdx === null || dragSourceIdx === targetIdx) return;
  const moved = uploadedFiles.splice(dragSourceIdx, 1)[0];
  uploadedFiles.splice(targetIdx, 0, moved);
  dragSourceIdx = null;
  renderFileList();
}

/* ── 上传 + 处理 ─────────────────────────────── */
async function startProcess() {
  if (uploadedFiles.length === 0) {
    showPDFToast('请先上传文件', 'error');
    return;
  }

  const btn = document.getElementById('process-btn');
  btn.disabled = true;

  showProgress('uploading', 0);

  try {
    // 1. 上传所有文件
    const fileIds = await uploadAllFiles();

    // 2. 获取工具配置参数
    const params = window.PDFToolConfig?.getParams?.() || {};

    // 3. 提交处理任务
    showProgress('processing', 30);
    const taskId = await submitTask(fileIds, params);
    currentTaskId = taskId;

    // 4. 轮询任务状态
    pollTaskStatus(taskId);

  } catch (err) {
    showError(err.message || '处理失败，请重试');
    btn.disabled = false;
  }
}

async function uploadAllFiles() {
  const fileIds = [];
  for (let i = 0; i < uploadedFiles.length; i++) {
    const pct = Math.floor((i / uploadedFiles.length) * 25);
    updateProgress(pct, `上传中... (${i + 1}/${uploadedFiles.length})`);

    const fd = new FormData();
    fd.append('file', uploadedFiles[i]);

    const resp = await fetch('/api/pdf/upload', { method: 'POST', body: fd });
    const data = await resp.json();

    if (!resp.ok) throw new Error(data.error || '上传失败');
    fileIds.push(data.fileId);
  }
  return fileIds;
}

async function submitTask(fileIds, params) {
  const config = window.PDFToolConfig || {};
  const resp = await fetch('/api/pdf/process', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      tool:    config.toolName,
      fileIds: fileIds,
      params:  params,
    }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error || '任务创建失败');
  return data.taskId;
}

function pollTaskStatus(taskId) {
  let attempts = 0;
  const maxAttempts = 120; // 最多等 2 分钟

  pollTimer = setInterval(async () => {
    attempts++;
    if (attempts > maxAttempts) {
      clearInterval(pollTimer);
      showError('处理超时，请重试');
      return;
    }

    try {
      const resp = await fetch(`/api/pdf/task/${taskId}`);
      const data = await resp.json();

      if (data.status === 'done') {
        clearInterval(pollTimer);
        showResult(data);
      } else if (data.status === 'error') {
        clearInterval(pollTimer);
        showError(data.error || '处理失败');
      } else {
        // 仍在处理中
        updateProgress(30 + Math.min(attempts * 2, 60), data.message || '处理中...');
      }
    } catch {
      // 网络抖动，继续重试
    }
  }, 1000);
}

/* ── UI 状态更新 ─────────────────────────────── */
function showProgress(state, pct) {
  document.getElementById('step-upload').style.display   = 'none';
  document.getElementById('step-config').style.display   = 'none';
  document.getElementById('step-action').style.display   = 'none';
  document.getElementById('progress-area').style.display = 'block';
  document.getElementById('result-area').style.display   = 'none';
  updateProgress(pct, state === 'uploading' ? '上传中...' : '处理中...');
}

function updateProgress(pct, text) {
  document.getElementById('progress-bar').style.width = `${pct}%`;
  document.getElementById('progress-text').textContent = text;
}

function showResult(data) {
  document.getElementById('progress-area').style.display = 'none';
  document.getElementById('result-area').style.display   = 'block';

  // 下载链接
  const dlBtn = document.getElementById('download-btn');
  dlBtn.href     = `/api/pdf/download/${data.taskId}`;
  dlBtn.download = data.outputFileName || 'result.pdf';

  // 文件大小对比
  renderResultStats(data);

  // 滚动到结果
  document.getElementById('result-area').scrollIntoView({ behavior: 'smooth' });
}

function renderResultStats(data) {
  const el = document.getElementById('result-stats');
  if (!data.inputSize && !data.outputSize) { el.innerHTML = ''; return; }

  const saved    = data.inputSize - data.outputSize;
  const savedPct = Math.round((saved / data.inputSize) * 100);

  el.innerHTML = `
    <div class="result-stat">
      <span class="result-stat__label">处理前</span>
      <span class="result-stat__value">${formatFileSize(data.inputSize)}</span>
    </div>
    <span class="result-stat-arrow">→</span>
    <div class="result-stat">
      <span class="result-stat__label">处理后</span>
      <span class="result-stat__value">${formatFileSize(data.outputSize)}</span>
    </div>
    ${saved > 0 ? `
    <div class="result-stat">
      <span class="result-stat__label">节省</span>
      <span class="result-stat__value result-stat__value--green">-${savedPct}%</span>
    </div>` : ''}
    ${data.pages ? `
    <div class="result-stat">
      <span class="result-stat__label">页数</span>
      <span class="result-stat__value">${data.pages} 页</span>
    </div>` : ''}
  `;
}

function showError(msg) {
  document.getElementById('progress-area').style.display = 'none';
  document.getElementById('step-upload').style.display   = 'block';
  document.getElementById('step-config').style.display   = uploadedFiles.length > 0 ? 'block' : 'none';
  document.getElementById('step-action').style.display   = uploadedFiles.length > 0 ? 'block' : 'none';
  document.getElementById('process-btn').disabled = false;
  showPDFToast(msg, 'error');
}

function resetTool() {
  uploadedFiles = [];
  currentTaskId = null;
  if (pollTimer) clearInterval(pollTimer);
  document.getElementById('file-list').innerHTML   = '';
  document.getElementById('selected-files').style.display = 'none';
  document.getElementById('step-upload').style.display    = 'block';
  document.getElementById('step-config').style.display    = 'none';
  document.getElementById('step-action').style.display    = 'none';
  document.getElementById('progress-area').style.display  = 'none';
  document.getElementById('result-area').style.display    = 'none';
  document.getElementById('process-btn').disabled = false;
}

/* ── 工具函数 ─────────────────────────────────── */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function isAcceptedFile(file, accept) {
  const exts = accept.split(',').map(a => a.trim().toLowerCase());
  const ext  = '.' + file.name.split('.').pop().toLowerCase();
  return exts.includes(ext) || exts.includes('*');
}

function showPDFToast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className   = `pdf-toast pdf-toast--${type}`;
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('pdf-toast--show'));
  setTimeout(() => { el.classList.remove('pdf-toast--show'); setTimeout(() => el.remove(), 300); }, 3500);
}

// FAQ 折叠（与首页共用）
function toggleFAQ(id) {
  const item = document.getElementById(id);
  const isOpen = item.classList.contains('faq-item--open');
  document.querySelectorAll('.faq-item--open').forEach(i => i.classList.remove('faq-item--open'));
  if (!isOpen) item.classList.add('faq-item--open');
}
```

---

## 4. Toast CSS

```css
/* static/css/pdf-toast.css */
.pdf-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #fff;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  z-index: 9999;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.25s, transform 0.25s;
  max-width: 320px;
}
.pdf-toast--show  { opacity: 1; transform: translateY(0); }
.pdf-toast--info  { background: #4a5568; }
.pdf-toast--success { background: #38a169; }
.pdf-toast--error { background: #e53e3e; }
```

---

## 5. 验收标准

- [ ] 拖拽文件到上传区，边框变红，松开后文件出现在列表
- [ ] 文件列表显示文件名 + 大小，可点 × 移除
- [ ] 多文件模式下，列表项可拖拽排序（交换顺序）
- [ ] 上传文件后，STEP 2 配置面板和 STEP 3 按钮自动显示
- [ ] 点击「开始处理」后，上传/处理进度条逐步推进
- [ ] 处理成功后，绿色结果卡出现，显示前后文件大小和节省率
- [ ] 下载链接有效，点击触发下载，文件名正确
- [ ] 「处理新文件」重置全部状态
- [ ] 超过 50MB 文件选中时给出 Toast 错误，不进入列表
- [ ] 移动端（<900px）右侧栏隐藏，主内容全宽
