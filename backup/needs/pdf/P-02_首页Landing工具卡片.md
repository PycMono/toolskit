# Block P-02 · PDF 工具 — 首页 Landing + 工具卡片网格

> **所属模块**：PDF 工具（/pdf）  
> **竞品参考**：https://pdfhouse.com 首页  
> **预估工时**：3h  
> **依赖**：P-01（路由已注册）  
> **交付粒度**：首页完整 UI — Hero上传区 / 工具卡片网格（分类Tab）/ 三特性 / FAQ

---

## 1. 竞品分析（pdfhouse.com 首页）

| 区域 | 竞品特点 | 本次实现 |
|------|---------|---------|
| Hero | 白色简洁 + 大标题 + 中央上传区（拖拽）+ 工具搜索 | ✅ |
| 工具卡片 | 网格排列 + 图标 + 名称 + 简短描述 + 悬停高亮 | ✅ |
| 分类 Tab | "Edit & Sign" / "Convert from PDF" / "Convert to PDF" | ✅ |
| 安全说明 | 100% Safe + HTTPS + 文件自动删除 | ✅ |
| 特性三列 | 安全 / 快速 / 免费 | ✅ |
| FAQ | 折叠手风琴 + JSON-LD | ✅ |

---

## 2. HTML 模板

```html
<!-- templates/pdf/landing.html -->
{{- template "pdf/layout.html" . }}

{{- define "pdf-content" }}

<!-- ── 顶部导航 ──────────────────────────────── -->
<nav class="pdf-navbar">
  <div class="pdf-container">
    <a class="pdf-logo" href="/pdf">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="9" y1="15" x2="15" y2="15"/>
        <line x1="9" y1="11" x2="15" y2="11"/>
      </svg>
      <span>PDF Tools</span>
    </a>
    <div class="pdf-navbar__search">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input type="text" placeholder="{{ t .Lang "pdf.search.placeholder" }}"
             oninput="searchTools(this.value)" id="nav-search">
    </div>
    <div class="pdf-navbar__lang">
      <a href="?lang=zh" class="{{ if eq .Lang "zh" }}active{{ end }}">中文</a>
      <span>/</span>
      <a href="?lang=en" class="{{ if eq .Lang "en" }}active{{ end }}">EN</a>
    </div>
  </div>
</nav>

<!-- ── Hero 区域 ──────────────────────────────── -->
<section class="pdf-hero">
  <div class="pdf-container">
    <h1 class="pdf-hero__title">{{ t .Lang "pdf.hero.title" }}</h1>
    <p  class="pdf-hero__subtitle">{{ t .Lang "pdf.hero.subtitle" }}</p>

    <div class="pdf-hero__badges">
      <span class="pdf-badge">🛠 {{ t .Lang "pdf.hero.badge1" }}</span>
      <span class="pdf-badge">🔒 {{ t .Lang "pdf.hero.badge2" }}</span>
      <span class="pdf-badge">✅ {{ t .Lang "pdf.hero.badge3" }}</span>
    </div>

    <!-- 快速上传区 -->
    <div class="pdf-hero__upload" id="hero-upload-area"
         ondragover="heroOnDragOver(event)"
         ondragleave="heroOnDragLeave(event)"
         ondrop="heroOnDrop(event)">
      <div class="hero-upload__icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/>
          <polyline points="9 15 12 12 15 15"/>
        </svg>
      </div>
      <p class="hero-upload__title">{{ t .Lang "pdf.upload.title" }}</p>
      <p class="hero-upload__or">{{ t .Lang "pdf.upload.or" }}</p>
      <label class="hero-upload__btn">
        {{ t .Lang "pdf.upload.btn" }}
        <input type="file" id="hero-file-input"
               accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.txt"
               multiple style="display:none" onchange="heroOnFileSelect(this)">
      </label>
      <p class="hero-upload__hint">{{ t .Lang "pdf.upload.hint" }}</p>
    </div>
  </div>
</section>

<!-- ── 工具网格 ────────────────────────────────── -->
<section class="pdf-tools-section">
  <div class="pdf-container">

    <!-- 分类 Tab -->
    <div class="pdf-category-tabs">
      <button class="cat-tab cat-tab--active" data-cat="all"
              onclick="filterByCategory('all', this)">
        {{ t .Lang "pdf.categories.all" }}
      </button>
      <button class="cat-tab" data-cat="edit"
              onclick="filterByCategory('edit', this)">
        {{ t .Lang "pdf.categories.edit" }}
      </button>
      <button class="cat-tab" data-cat="from_pdf"
              onclick="filterByCategory('from_pdf', this)">
        {{ t .Lang "pdf.categories.from_pdf" }}
      </button>
      <button class="cat-tab" data-cat="to_pdf"
              onclick="filterByCategory('to_pdf', this)">
        {{ t .Lang "pdf.categories.to_pdf" }}
      </button>
    </div>

    <!-- 工具卡片网格 -->
    <div class="pdf-tools-grid" id="tools-grid">

      <!-- ── 编辑工具（data-cat="edit"）── -->
      {{- template "pdf/tool_card.html" dict "Name" "merge"     "Cat" "edit"    "Color" "#e53e3e" "Lang" .Lang }}
      {{- template "pdf/tool_card.html" dict "Name" "split"     "Cat" "edit"    "Color" "#d69e2e" "Lang" .Lang }}
      {{- template "pdf/tool_card.html" dict "Name" "compress"  "Cat" "edit"    "Color" "#38a169" "Lang" .Lang }}
      {{- template "pdf/tool_card.html" dict "Name" "rotate"    "Cat" "edit"    "Color" "#3182ce" "Lang" .Lang }}
      {{- template "pdf/tool_card.html" dict "Name" "watermark" "Cat" "edit"    "Color" "#805ad5" "Lang" .Lang }}
      {{- template "pdf/tool_card.html" dict "Name" "encrypt"   "Cat" "edit"    "Color" "#e53e3e" "Lang" .Lang }}
      {{- template "pdf/tool_card.html" dict "Name" "decrypt"   "Cat" "edit"    "Color" "#38a169" "Lang" .Lang }}
      {{- template "pdf/tool_card.html" dict "Name" "ocr"       "Cat" "edit"    "Color" "#d69e2e" "Lang" .Lang }}

      <!-- ── PDF 转出（data-cat="from_pdf"）── -->
      {{- template "pdf/tool_card.html" dict "Name" "to-word"   "Cat" "from_pdf" "Color" "#2b6cb0" "Lang" .Lang }}
      {{- template "pdf/tool_card.html" dict "Name" "to-excel"  "Cat" "from_pdf" "Color" "#276749" "Lang" .Lang }}
      {{- template "pdf/tool_card.html" dict "Name" "to-ppt"    "Cat" "from_pdf" "Color" "#c05621" "Lang" .Lang }}
      {{- template "pdf/tool_card.html" dict "Name" "to-jpg"    "Cat" "from_pdf" "Color" "#d53f8c" "Lang" .Lang }}
      {{- template "pdf/tool_card.html" dict "Name" "to-png"    "Cat" "from_pdf" "Color" "#6b46c1" "Lang" .Lang }}
      {{- template "pdf/tool_card.html" dict "Name" "to-txt"    "Cat" "from_pdf" "Color" "#4a5568" "Lang" .Lang }}
      {{- template "pdf/tool_card.html" dict "Name" "to-html"   "Cat" "from_pdf" "Color" "#e53e3e" "Lang" .Lang }}

      <!-- ── 转入 PDF（data-cat="to_pdf"）── -->
      {{- template "pdf/tool_card.html" dict "Name" "from-word"  "Cat" "to_pdf" "Color" "#2b6cb0" "Lang" .Lang }}
      {{- template "pdf/tool_card.html" dict "Name" "from-excel" "Cat" "to_pdf" "Color" "#276749" "Lang" .Lang }}
      {{- template "pdf/tool_card.html" dict "Name" "from-ppt"   "Cat" "to_pdf" "Color" "#c05621" "Lang" .Lang }}
      {{- template "pdf/tool_card.html" dict "Name" "from-jpg"   "Cat" "to_pdf" "Color" "#d53f8c" "Lang" .Lang }}
      {{- template "pdf/tool_card.html" dict "Name" "from-png"   "Cat" "to_pdf" "Color" "#6b46c1" "Lang" .Lang }}
      {{- template "pdf/tool_card.html" dict "Name" "from-txt"   "Cat" "to_pdf" "Color" "#4a5568" "Lang" .Lang }}

    </div>
  </div>
</section>

<!-- ── 三特性 ─────────────────────────────────── -->
<section class="pdf-features-section">
  <div class="pdf-container">
    <div class="pdf-features-grid">
      <div class="feature-card">
        <div class="feature-card__icon feature-card__icon--green">🔒</div>
        <h3>{{ t .Lang "pdf.feature.safe.title" }}</h3>
        <p>{{ t .Lang "pdf.feature.safe.desc" }}</p>
      </div>
      <div class="feature-card">
        <div class="feature-card__icon feature-card__icon--blue">⚡</div>
        <h3>{{ t .Lang "pdf.feature.fast.title" }}</h3>
        <p>{{ t .Lang "pdf.feature.fast.desc" }}</p>
      </div>
      <div class="feature-card">
        <div class="feature-card__icon feature-card__icon--purple">🎁</div>
        <h3>{{ t .Lang "pdf.feature.free.title" }}</h3>
        <p>{{ t .Lang "pdf.feature.free.desc" }}</p>
      </div>
    </div>
  </div>
</section>

<!-- ── FAQ ────────────────────────────────────── -->
<section class="pdf-faq-section">
  <div class="pdf-container">
    <h2 class="pdf-section-title">{{ t .Lang "pdf.faq.title" }}</h2>
    <div class="faq-list">
      {{- range $i, $faq := .FAQs }}
      <div class="faq-item" id="pdf-faq-{{ $i }}">
        <button class="faq-question" onclick="toggleFAQ('pdf-faq-{{ $i }}')">
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
  </div>
</section>
{{- end }}
```

### 工具卡片局部模板

```html
<!-- templates/pdf/tool_card.html -->
{{- define "pdf/tool_card.html" }}
<a class="tool-card" href="/pdf/{{ .Name }}" data-cat="{{ .Cat }}">
  <div class="tool-card__icon" style="background: {{ .Color }}1a; color: {{ .Color }}">
    {{ t .Lang (printf "pdf.tool.%s.icon" .Name) | default (toolEmoji .Name) }}
  </div>
  <div class="tool-card__body">
    <h3 class="tool-card__name">{{ t .Lang (printf "pdf.tool.%s.name" .Name) }}</h3>
    <p  class="tool-card__desc">{{ t .Lang (printf "pdf.tool.%s.desc" .Name) }}</p>
  </div>
  <div class="tool-card__arrow">→</div>
</a>
{{- end }}
```

---

## 3. CSS

```css
/* static/css/pdf-landing.css */

/* ── 全局 ─────────────────────────────────────── */
.pdf-container {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 20px;
}

.pdf-section-title {
  font-size: 1.625rem;
  font-weight: 800;
  color: #1a202c;
  text-align: center;
  margin: 0 0 32px;
}

/* ── 导航 ─────────────────────────────────────── */
.pdf-navbar {
  position: sticky;
  top: 0;
  z-index: 200;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.pdf-navbar > .pdf-container {
  display: flex;
  align-items: center;
  height: 56px;
  gap: 20px;
}

.pdf-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #e53e3e;
  text-decoration: none;
  font-size: 1.0625rem;
  font-weight: 800;
  flex-shrink: 0;
}

.pdf-navbar__search {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 7px 12px;
  max-width: 400px;
}

.pdf-navbar__search svg { color: #9ca3af; flex-shrink: 0; }
.pdf-navbar__search input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.875rem;
  color: #111827;
}

.pdf-navbar__lang {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8125rem;
  color: #9ca3af;
  flex-shrink: 0;
}
.pdf-navbar__lang a { color: #374151; text-decoration: none; font-weight: 500; }
.pdf-navbar__lang a.active { color: #e53e3e; font-weight: 700; }

/* ── Hero ─────────────────────────────────────── */
.pdf-hero {
  background: linear-gradient(180deg, #fff5f5 0%, #ffffff 100%);
  padding: 56px 0 48px;
  text-align: center;
  border-bottom: 1px solid #f7fafc;
}

.pdf-hero__title {
  font-size: 2.625rem;
  font-weight: 900;
  color: #1a202c;
  margin: 0 0 14px;
  letter-spacing: -0.03em;
  line-height: 1.15;
}

.pdf-hero__subtitle {
  font-size: 1.0625rem;
  color: #718096;
  max-width: 520px;
  margin: 0 auto 24px;
  line-height: 1.65;
}

.pdf-hero__badges {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.pdf-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 14px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  color: #4a5568;
  font-size: 0.8125rem;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}

/* 上传区 */
.pdf-hero__upload {
  max-width: 560px;
  margin: 0 auto;
  background: #ffffff;
  border: 2px dashed #cbd5e0;
  border-radius: 16px;
  padding: 36px 24px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
}

.pdf-hero__upload:hover,
.pdf-hero__upload--dragover {
  border-color: #e53e3e;
  background: #fff5f5;
}

.hero-upload__icon { color: #e53e3e; margin-bottom: 14px; }

.hero-upload__title {
  font-size: 1.0625rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 6px;
}

.hero-upload__or {
  font-size: 0.875rem;
  color: #a0aec0;
  margin: 0 0 14px;
}

.hero-upload__btn {
  display: inline-flex;
  align-items: center;
  height: 42px;
  padding: 0 24px;
  background: #e53e3e;
  color: #ffffff;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
  box-shadow: 0 3px 10px rgba(229,62,62,0.3);
}
.hero-upload__btn:hover { background: #c53030; }

.hero-upload__hint {
  font-size: 0.8rem;
  color: #a0aec0;
  margin: 12px 0 0;
}

/* ── 工具网格 ─────────────────────────────────── */
.pdf-tools-section {
  background: #f7fafc;
  padding: 48px 0 56px;
}

/* 分类 Tab */
.pdf-category-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.cat-tab {
  height: 36px;
  padding: 0 18px;
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4a5568;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.cat-tab:hover { border-color: #e53e3e; color: #e53e3e; }

.cat-tab--active {
  background: #e53e3e;
  border-color: #e53e3e;
  color: #ffffff;
  font-weight: 700;
}

/* 工具卡片网格 */
.pdf-tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
}

/* 工具卡片 */
.tool-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  text-decoration: none;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.tool-card:hover {
  border-color: #e53e3e;
  box-shadow: 0 8px 24px rgba(229,62,62,0.12);
  transform: translateY(-2px);
}

.tool-card[style*="display:none"] { display: none !important; }

.tool-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.375rem;
  flex-shrink: 0;
}

.tool-card__body { flex: 1; }

.tool-card__name {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 5px;
  line-height: 1.3;
}

.tool-card__desc {
  font-size: 0.8125rem;
  color: #718096;
  margin: 0;
  line-height: 1.5;
}

.tool-card__arrow {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #e2e8f0;
  font-size: 1rem;
  transition: color 0.2s, right 0.2s;
}

.tool-card:hover .tool-card__arrow {
  color: #e53e3e;
  right: 12px;
}

/* ── 三特性 ───────────────────────────────────── */
.pdf-features-section {
  background: #ffffff;
  padding: 56px 0;
  border-top: 1px solid #f7fafc;
}

.pdf-features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.feature-card {
  text-align: center;
  padding: 32px 24px;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
}

.feature-card__icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.feature-card__icon--green  { background: #f0fff4; }
.feature-card__icon--blue   { background: #ebf8ff; }
.feature-card__icon--purple { background: #faf5ff; }

.feature-card h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 8px;
}

.feature-card p {
  font-size: 0.875rem;
  color: #718096;
  margin: 0;
  line-height: 1.65;
}

/* ── FAQ ──────────────────────────────────────── */
.pdf-faq-section {
  background: #f7fafc;
  padding: 56px 0;
}

.faq-list { max-width: 720px; margin: 0 auto; display: flex; flex-direction: column; gap: 8px; }

.faq-item {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.faq-question {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: none;
  border: none;
  text-align: left;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #2d3748;
  cursor: pointer;
  gap: 12px;
}

.faq-chevron { flex-shrink: 0; transition: transform 0.2s; }
.faq-item--open .faq-chevron { transform: rotate(180deg); }

.faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.faq-item--open .faq-answer { max-height: 300px; }

.faq-answer p {
  padding: 0 20px 16px;
  font-size: 0.875rem;
  color: #718096;
  margin: 0;
  line-height: 1.7;
}

/* ── 响应式 ───────────────────────────────────── */
@media (max-width: 768px) {
  .pdf-hero__title     { font-size: 1.875rem; }
  .pdf-tools-grid      { grid-template-columns: repeat(2, 1fr); }
  .pdf-features-grid   { grid-template-columns: 1fr; }
  .pdf-navbar__search  { display: none; }
}

@media (max-width: 480px) {
  .pdf-tools-grid { grid-template-columns: 1fr; }
}

/* 搜索无结果 */
.tools-no-result {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: #a0aec0;
  font-size: 0.9375rem;
}
```

---

## 4. JavaScript

```javascript
// static/js/pdf-landing.js

/* ── Hero 拖拽上传 ────────────────────────────── */
function heroOnDragOver(e) {
  e.preventDefault();
  document.getElementById('hero-upload-area').classList.add('pdf-hero__upload--dragover');
}

function heroOnDragLeave(e) {
  document.getElementById('hero-upload-area').classList.remove('pdf-hero__upload--dragover');
}

function heroOnDrop(e) {
  e.preventDefault();
  heroOnDragLeave(e);
  const files = e.dataTransfer.files;
  if (files.length > 0) routeByFileType(files[0]);
}

function heroOnFileSelect(input) {
  if (input.files.length > 0) routeByFileType(input.files[0]);
}

// 根据文件类型自动跳转对应工具
function routeByFileType(file) {
  const ext  = file.name.split('.').pop().toLowerCase();
  const name = encodeURIComponent(file.name);
  const map  = {
    'pdf':         '/pdf/merge',      // 默认 PDF → 合并工具
    'doc':         '/pdf/from-word',
    'docx':        '/pdf/from-word',
    'xls':         '/pdf/from-excel',
    'xlsx':        '/pdf/from-excel',
    'ppt':         '/pdf/from-ppt',
    'pptx':        '/pdf/from-ppt',
    'jpg':         '/pdf/from-jpg',
    'jpeg':        '/pdf/from-jpg',
    'png':         '/pdf/from-png',
    'txt':         '/pdf/from-txt',
  };
  const route = map[ext];
  if (route) {
    // 先把文件暂存 sessionStorage 再跳转
    sessionStorage.setItem('pendingFileName', file.name);
    sessionStorage.setItem('pendingFileExt', ext);
    window.location.href = route;
  } else {
    showPDFToast('不支持的文件格式，请上传 PDF / Word / Excel / PPT / JPG / PNG', 'error');
  }
}

/* ── 工具搜索（本地过滤）─────────────────────── */
const toolData = []; // 由 Go 模板注入工具数据
let   activeCategory = 'all';

function searchTools(query) {
  const q     = query.toLowerCase().trim();
  const cards = document.querySelectorAll('.tool-card');
  let   found = 0;

  cards.forEach(card => {
    const name = card.querySelector('.tool-card__name')?.textContent.toLowerCase() || '';
    const desc = card.querySelector('.tool-card__desc')?.textContent.toLowerCase() || '';
    const cat  = card.dataset.cat;

    const catMatch   = activeCategory === 'all' || cat === activeCategory;
    const queryMatch = !q || name.includes(q) || desc.includes(q);

    if (catMatch && queryMatch) {
      card.style.display = '';
      found++;
    } else {
      card.style.display = 'none';
    }
  });

  // 无结果提示
  const noResult = document.getElementById('tools-no-result');
  if (noResult) noResult.style.display = found === 0 ? 'block' : 'none';
}

function filterByCategory(cat, btn) {
  activeCategory = cat;
  document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('cat-tab--active'));
  btn.classList.add('cat-tab--active');
  searchTools(document.getElementById('nav-search')?.value || '');
}

/* ── FAQ 折叠 ─────────────────────────────────── */
function toggleFAQ(id) {
  const item = document.getElementById(id);
  const isOpen = item.classList.contains('faq-item--open');
  document.querySelectorAll('.faq-item--open').forEach(i => i.classList.remove('faq-item--open'));
  if (!isOpen) item.classList.add('faq-item--open');
}

/* ── Toast ────────────────────────────────────── */
function showPDFToast(msg, type = 'info') {
  const t = document.createElement('div');
  t.className = `pdf-toast pdf-toast--${type}`;
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('pdf-toast--show'));
  setTimeout(() => {
    t.classList.remove('pdf-toast--show');
    setTimeout(() => t.remove(), 300);
  }, 3000);
}
```

---

## 5. FAQ 数据（Go Handler 注入）

```go
// internal/handler/pdf_faq.go

type PDFFAQ struct { Q, A string }

func getLandingFAQs(lang string) []PDFFAQ {
    if lang == "en" {
        return []PDFFAQ{
            {Q: "Is it free to use?",
             A: "Yes, all tools are completely free. No signup required and no hidden fees."},
            {Q: "Is my file secure?",
             A: "All files are automatically deleted within 1 hour of processing. All transfers use HTTPS encryption."},
            {Q: "What file size is supported?",
             A: "Each file can be up to 50MB. For merging, total size across all files should be under 200MB."},
            {Q: "What formats can I convert to/from PDF?",
             A: "We support Word, Excel, PowerPoint, JPG, PNG, TXT, HTML and more. See individual tool pages for details."},
            {Q: "Can I use it on mobile?",
             A: "Yes, all tools are fully responsive and work on any device including smartphones and tablets."},
        }
    }
    return []PDFFAQ{
        {Q: "这些工具需要付费吗？",
         A: "完全免费，所有工具无需注册，无隐藏收费。"},
        {Q: "我的文件安全吗？",
         A: "所有上传文件在处理完成后 1 小时内自动删除，传输过程全程 HTTPS 加密。"},
        {Q: "支持多大的文件？",
         A: "单个文件最大 50MB，合并工具总大小不超过 200MB。"},
        {Q: "支持哪些转换格式？",
         A: "支持 Word、Excel、PPT、JPG、PNG、TXT、HTML 等格式与 PDF 互转。"},
        {Q: "可以在手机上使用吗？",
         A: "可以，所有工具完全适配移动端，支持手机和平板访问。"},
    }
}
```

---

## 6. 验收标准

- [ ] 导航栏固定顶部，LOGO 红色，搜索框在中间
- [ ] Hero 区浅红渐变背景，上传区拖拽边框变红
- [ ] 拖拽 `.pdf` 文件到 Hero → 跳转 `/pdf/merge`；拖拽 `.docx` → 跳转 `/pdf/from-word`
- [ ] 工具卡片默认全部展示（22 张），分类 Tab 点击后过滤
- [ ] 导航搜索框输入后实时过滤卡片，无结果显示提示文字
- [ ] 工具卡片悬停：轻微上浮 + 红色边框 + 右箭头移动
- [ ] 三特性区域图标背景色各不同（绿/蓝/紫）
- [ ] FAQ 折叠：点击展开/收起，同时只能展开一条
- [ ] 移动端（<768px）卡片变两列，导航搜索隐藏
