# Block C-02 · 文件转换工具集 — 公共上传 UI + 进度 + 下载

> **文件**：`templates/convert/tool.html` + `/static/css/convert.css` + `/static/js/convert-upload.js`  
> **预估工时**：3h  
> **依赖**：C-01（路由/Handler）  
> **交付粒度**：所有 38 个工具共用同一套 HTML/CSS/JS 组件框架，通过模板变量 `.Slug` / `.Category` 区分行为

---

## 1. 竞品对标（freeconvert.com UI）

| 区域 | 竞品 | 本次实现 | 差异化 |
|------|------|---------|------|
| 上传区 | 超大虚线拖拽框 + 格式说明 | ✅ 同，靛青主色 | — |
| 多文件 | ✅ 支持批量 | ✅ 同 | — |
| 格式选择 | 上传后出现下拉 | ✅ **上传前即可选择** | 差异化 |
| 进度条 | 每文件独立进度 | ✅ 同 | — |
| 进度推送 | 轮询 | ✅ SSE（更实时）| 差异化 |
| 完成后 | 同页显示下载按钮 | ✅ 同 | — |
| 打包下载 | ✅ ZIP | ✅ ZIP | — |
| 广告位 | 上传区下方 | ✅ 同 | — |

---

## 2. 统一页面 HTML（`templates/convert/tool.html`）

```html
<!DOCTYPE html>
<html lang="{{ .Lang }}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ .Title }}</title>
  <meta name="description" content="{{ .Desc }}">
  <!-- SEO（见 C-01）-->
  <link rel="stylesheet" href="/static/css/convert.css">
</head>
<body class="cv-page cv-page--{{ .Category }}">

<!-- ── 导航 ──────────────────────────────────── -->
<nav class="cv-navbar">
  <div class="cv-container">
    <a class="cv-logo" href="/convert">
      <span class="cv-logo__icon">🔄</span>
      <span class="cv-logo__text">DevToolBox</span>
    </a>
    <!-- 分类导航 -->
    <div class="cv-navbar__cats">
      <a href="/convert/video"   class="{{ if eq .Category "video" }}active{{ end }}">🎬 Video</a>
      <a href="/convert/image"   class="{{ if eq .Category "image" }}active{{ end }}">🖼️ Image</a>
      <a href="/convert/pdf"     class="{{ if eq .Category "pdf" }}active{{ end }}">📄 PDF</a>
      <a href="/convert/video-to-gif" class="{{ if eq .Category "gif" }}active{{ end }}">🎞️ GIF</a>
      <a href="/convert/unit"    class="{{ if eq .Category "other" }}active{{ end }}">⚙️ Other</a>
    </div>
    <div class="cv-lang-switch">
      <a href="?lang=zh" class="{{ if eq .Lang "zh" }}active{{ end }}">中文</a>
      <span>/</span>
      <a href="?lang=en" class="{{ if eq .Lang "en" }}active{{ end }}">EN</a>
    </div>
  </div>
</nav>

<!-- 广告位：顶部 -->
{{- template "partials/ad_slot.html" dict "SlotID" "cv-top" "Size" "728x90" "Mobile" "320x50" }}

<!-- ── Hero ──────────────────────────────────── -->
<section class="cv-hero">
  <div class="cv-container">
    <h1 class="cv-hero__title">{{ .Meta.TitleZh }}</h1>
    <p class="cv-hero__desc">{{ .Desc }}</p>
  </div>
</section>

<!-- ── 主工作区 ────────────────────────────────── -->
<section class="cv-workspace">
  <div class="cv-container">

    <!-- 格式选择（上传前）-->
    {{ if not .FrontendOnly }}
    <div class="cv-format-bar" id="formatBar">
      <label class="cv-format-bar__label">转换为：</label>
      <div class="cv-format-pills" id="formatPills">
        <!-- 由 JS 根据 .Slug 动态渲染 -->
      </div>
    </div>
    {{ end }}

    <!-- ── 超大拖拽上传区 ── -->
    <div class="cv-upload-zone" id="uploadZone"
         ondragover="onDragOver(event)"
         ondragleave="onDragLeave(event)"
         ondrop="onDrop(event)">

      <!-- 默认态 -->
      <div class="cv-upload-zone__idle" id="uploadIdle">
        <div class="cv-upload-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <p class="cv-upload-zone__title">拖拽文件到此处</p>
        <p class="cv-upload-zone__accept" id="acceptHint">
          <!-- 由 JS 注入支持格式 -->
        </p>
        <label class="cv-upload-btn">
          选择文件
          <input type="file" id="fileInput" multiple style="display:none"
                 onchange="onFileSelect(this)">
        </label>
        <p class="cv-upload-zone__limit" id="limitHint">
          <!-- 由 JS 注入大小限制 -->
        </p>
      </div>

      <!-- 拖拽激活遮罩 -->
      <div class="cv-upload-zone__drop-mask" id="dropMask">
        <div class="cv-drop-icon">📂</div>
        <p>松开鼠标开始上传</p>
      </div>

    </div><!-- /cv-upload-zone -->

    <!-- ── 文件队列 + 进度（上传后显示）── -->
    <div class="cv-queue" id="fileQueue" style="display:none">

      <!-- 整体操作栏 -->
      <div class="cv-queue__actions">
        <button class="cv-btn-convert" id="convertAllBtn" onclick="convertAll()">
          🔄 <span id="convertBtnText">开始转换</span>
        </button>
        <button class="cv-btn-add" onclick="document.getElementById('fileInputAdd').click()">
          + 添加更多文件
          <input type="file" id="fileInputAdd" multiple style="display:none"
                 onchange="onFileSelect(this)">
        </button>
        <button class="cv-btn-clear" onclick="clearAll()">🗑 清空</button>
      </div>

      <!-- 文件列表 -->
      <div class="cv-file-list" id="fileList">
        <!-- 每行一个 .cv-file-item，由 JS 动态插入 -->
      </div>

      <!-- 全部完成后：打包下载 -->
      <div class="cv-download-all" id="downloadAllBar" style="display:none">
        <button class="cv-btn-download-all" onclick="downloadAll()">
          ⬇ 打包下载全部 (ZIP)
        </button>
        <p class="cv-download-all__hint">文件将在 1 小时后自动删除</p>
      </div>

    </div><!-- /cv-queue -->

  </div><!-- /cv-container -->
</section>

<!-- 广告位：中部 -->
{{- template "partials/ad_slot.html" dict "SlotID" "cv-mid" "Size" "728x90" "Mobile" "320x50" }}

<!-- ── 工具特性介绍 ────────────────────────────── -->
<section class="cv-features-section">
  <div class="cv-container">
    <div class="cv-features-grid">
      <div class="cv-feature-card">
        <div class="cv-feature-icon">🔒</div>
        <h3>安全可靠</h3>
        <p>HTTPS 加密传输，文件 1 小时后自动删除，不用于任何其他用途</p>
      </div>
      <div class="cv-feature-card">
        <div class="cv-feature-icon">⚡</div>
        <h3>快速转换</h3>
        <p>服务器端高性能处理，大文件也能快速完成</p>
      </div>
      <div class="cv-feature-card">
        <div class="cv-feature-icon">🎁</div>
        <h3>完全免费</h3>
        <p>无需注册，无需登录，无隐藏收费，永久免费</p>
      </div>
    </div>
  </div>
</section>

<!-- ── FAQ ────────────────────────────────────── -->
<section class="cv-faq-section">
  <div class="cv-container">
    <h2 class="cv-section-title">常见问题</h2>
    <div class="cv-faq-list">
      {{- range $i, $faq := .FAQs }}
      <div class="cv-faq-item" id="faq-{{ $i }}">
        <button class="cv-faq-question" onclick="toggleFAQ('faq-{{ $i }}')">
          <span>{{ $faq.Q }}</span>
          <svg class="cv-faq-chevron" width="16" height="16" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        <div class="cv-faq-answer"><p>{{ $faq.A }}</p></div>
      </div>
      {{- end }}
    </div>
  </div>
</section>

<!-- 广告位：底部 -->
{{- template "partials/ad_slot.html" dict "SlotID" "cv-bottom" "Size" "728x90" "Mobile" "320x50" }}

<div id="toastContainer"></div>

<!-- 页面配置（服务端注入）-->
<script>
  window.CV_CONFIG = {
    slug:         "{{ .Slug }}",
    category:     "{{ .Category }}",
    frontendOnly: {{ .FrontendOnly }},
    maxSizeMB:    {{ .Meta.MaxSizeMB }},
    accept:       {{ .Meta.Accept | json }},
    lang:         "{{ .Lang }}",
  };
</script>
<script src="/static/js/convert-upload.js"></script>
<script src="/static/js/convert-formats.js"></script>
{{ if .FrontendOnly }}
<script src="/static/js/convert-frontend.js"></script>
{{ else }}
<script src="/static/js/convert-api.js"></script>
{{ end }}
</body>
</html>
```

---

## 3. 格式选项配置（`/static/js/convert-formats.js`）

```javascript
// /static/js/convert-formats.js
// 每个 slug 可选的输出格式

'use strict';

const FORMAT_MAP = {
  // Video
  'video':          ['mp4','mkv','avi','mov','webm','flv','wmv','3gp'],
  'mp4':            ['mp4','mkv','avi','mov','webm','flv','wmv'],
  'mov-to-mp4':     ['mp4'],
  'mp4-to-mp3':     ['mp3'],
  'video-to-mp3':   ['mp3'],
  'mp3-to-ogg':     ['ogg'],
  // Audio
  'audio':          ['mp3','aac','ogg','wav','flac','wma','m4a','aiff'],
  'mp3':            ['mp3','aac','ogg','wav','flac','wma','m4a'],
  // Image
  'image':          ['jpg','png','webp','gif','bmp','tiff','ico'],
  'webp-to-png':    ['png'],
  'jfif-to-png':    ['png'],
  'webp-to-jpg':    ['jpg'],
  'png-to-svg':     ['svg'],
  'heic-to-jpg':    ['jpg'],
  'heic-to-png':    ['png'],
  'svg-converter':  ['png','jpg','webp'],
  // PDF
  'pdf':            ['docx','jpg','png','html','txt'],
  'document':       ['docx','odt','rtf','txt','pdf'],
  'ebook':          ['epub','mobi','azw3','fb2','txt','pdf'],
  'pdf-to-word':    ['docx'],
  'pdf-to-jpg':     ['jpg'],
  'pdf-to-epub':    ['epub'],
  'epub-to-pdf':    ['pdf'],
  'heic-to-pdf':    ['pdf'],
  'docx-to-pdf':    ['pdf'],
  'jpg-to-pdf':     ['pdf'],
  // GIF
  'video-to-gif':   ['gif'],
  'mp4-to-gif':     ['gif'],
  'webm-to-gif':    ['gif'],
  'apng-to-gif':    ['gif'],
  'gif-to-mp4':     ['mp4'],
  'gif-to-apng':    ['apng'],
  'image-to-gif':   ['gif'],
  'mov-to-gif':     ['gif'],
  'avi-to-gif':     ['gif'],
  // Archive
  'archive':        ['zip','7z','tar.gz','tar.bz2'],
};

// 格式 label 映射
const FORMAT_LABELS = {
  'mp4':   'MP4', 'mkv': 'MKV', 'avi': 'AVI', 'mov': 'MOV',
  'webm':  'WEBM', 'flv': 'FLV', 'wmv': 'WMV', '3gp': '3GP',
  'mp3':   'MP3', 'aac': 'AAC', 'ogg': 'OGG', 'wav': 'WAV',
  'flac':  'FLAC', 'wma': 'WMA', 'm4a': 'M4A', 'aiff': 'AIFF',
  'jpg':   'JPG', 'png': 'PNG', 'webp': 'WEBP', 'gif': 'GIF',
  'bmp':   'BMP', 'tiff': 'TIFF', 'ico': 'ICO', 'svg': 'SVG',
  'apng':  'APNG',
  'docx':  'DOCX', 'odt': 'ODT', 'rtf': 'RTF', 'txt': 'TXT',
  'pdf':   'PDF', 'html': 'HTML', 'epub': 'EPUB', 'mobi': 'MOBI',
  'azw3':  'AZW3', 'fb2': 'FB2',
  'zip':   'ZIP', '7z': '7Z', 'tar.gz': 'TAR.GZ', 'tar.bz2': 'TAR.BZ2',
};

// 默认输出格式（每个工具的推荐格式）
const FORMAT_DEFAULT = {
  'video': 'mp4', 'audio': 'mp3', 'mp3': 'mp3', 'image': 'jpg',
  'pdf': 'docx', 'document': 'docx', 'ebook': 'epub', 'archive': 'zip',
};

/* ─── 初始化格式选择 Pills ──────────────────── */
function initFormatPills() {
  const slug    = window.CV_CONFIG?.slug || '';
  const formats = FORMAT_MAP[slug] || [];
  const pills   = document.getElementById('formatPills');
  const bar     = document.getElementById('formatBar');

  if (!pills) return;

  // 只有一种输出格式时，隐藏格式选择栏
  if (formats.length <= 1) {
    if (bar) bar.style.display = 'none';
    window.CV_SELECTED_FORMAT = formats[0] || '';
    return;
  }

  const defaultFmt = FORMAT_DEFAULT[slug] || formats[0];

  pills.innerHTML = formats.map(fmt => `
    <label class="cv-format-pill ${fmt === defaultFmt ? 'cv-format-pill--active' : ''}">
      <input type="radio" name="outputFormat" value="${fmt}"
             ${fmt === defaultFmt ? 'checked' : ''}
             onchange="onFormatChange('${fmt}')">
      ${FORMAT_LABELS[fmt] || fmt.toUpperCase()}
    </label>
  `).join('');

  window.CV_SELECTED_FORMAT = defaultFmt;
}

function onFormatChange(fmt) {
  window.CV_SELECTED_FORMAT = fmt;
  document.querySelectorAll('.cv-format-pill').forEach(p => {
    p.classList.toggle('cv-format-pill--active',
      p.querySelector('input')?.value === fmt);
  });
}

document.addEventListener('DOMContentLoaded', initFormatPills);
```

---

## 4. 上传与任务管理 JS（`/static/js/convert-upload.js`）

```javascript
// /static/js/convert-upload.js
'use strict';

/* ── 全局状态 ────────────────────────────────── */
const CVState = {
  files: [],      // { id, file, status, jobId, progress, resultUrl, resultName }
  isConverting: false,
};

/* ── 拖拽事件 ────────────────────────────────── */
function onDragOver(e) {
  e.preventDefault();
  document.getElementById('uploadZone')?.classList.add('cv-upload-zone--dragover');
}

function onDragLeave(e) {
  if (!e.currentTarget.contains(e.relatedTarget)) {
    document.getElementById('uploadZone')?.classList.remove('cv-upload-zone--dragover');
  }
}

function onDrop(e) {
  e.preventDefault();
  document.getElementById('uploadZone')?.classList.remove('cv-upload-zone--dragover');
  if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
}

function onFileSelect(input) {
  if (input.files?.length) {
    addFiles(input.files);
    input.value = '';
  }
}

/* ── 文件入队 ─────────────────────────────────── */
function addFiles(fileList) {
  const cfg    = window.CV_CONFIG || {};
  const maxMB  = cfg.maxSizeMB || 100;
  const maxB   = maxMB * 1024 * 1024;

  for (const file of Array.from(fileList)) {
    if (file.size > maxB) {
      showToast(`${file.name}：文件超过 ${maxMB}MB 限制`, 'error');
      continue;
    }

    const key = `${file.name}-${file.size}`;
    if (CVState.files.some(f => `${f.file.name}-${f.file.size}` === key)) continue;

    const item = {
      id:      `${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
      file,
      status:  'pending',   // pending|uploading|processing|done|error
      jobId:   null,
      progress: 0,
      resultUrl: null,
      resultName: null,
      error:   null,
    };

    CVState.files.push(item);
    renderFileItem(item);
  }

  if (CVState.files.length > 0) {
    document.getElementById('uploadZone').style.display = 'none';
    document.getElementById('fileQueue').style.display  = 'block';
  }
}

/* ── 渲染文件行 ───────────────────────────────── */
function renderFileItem(item) {
  const list = document.getElementById('fileList');
  if (!list) return;

  const el = document.createElement('div');
  el.className = 'cv-file-item';
  el.id = `item-${item.id}`;
  el.innerHTML = `
    <div class="cv-file-item__icon">${getFileIcon(item.file.type)}</div>
    <div class="cv-file-item__info">
      <p class="cv-file-item__name" title="${escHtml(item.file.name)}">${escHtml(item.file.name)}</p>
      <p class="cv-file-item__size">${fmtSize(item.file.size)}</p>
      <div class="cv-file-item__progress" id="progress-${item.id}" style="display:none">
        <div class="cv-progress-bar">
          <div class="cv-progress-bar__fill" id="bar-${item.id}" style="width:0%"></div>
        </div>
        <span class="cv-progress-pct" id="pct-${item.id}">0%</span>
      </div>
    </div>
    <div class="cv-file-item__status" id="status-${item.id}">
      <span class="cv-status-badge cv-status-badge--pending">待转换</span>
    </div>
    <div class="cv-file-item__actions" id="actions-${item.id}">
      <button class="cv-btn-remove" onclick="removeFile('${item.id}')" title="移除">✕</button>
    </div>
  `;

  // 入场动画
  el.style.opacity = '0';
  list.appendChild(el);
  requestAnimationFrame(() => {
    el.style.transition = 'opacity 0.25s, transform 0.25s';
    el.style.opacity = '1';
  });
}

/* ── 更新文件行状态 ───────────────────────────── */
function updateFileItem(id, patch) {
  const item = CVState.files.find(f => f.id === id);
  if (!item) return;
  Object.assign(item, patch);

  const statusEl  = document.getElementById(`status-${id}`);
  const actionsEl = document.getElementById(`actions-${id}`);
  const progressEl= document.getElementById(`progress-${id}`);
  const barEl     = document.getElementById(`bar-${id}`);
  const pctEl     = document.getElementById(`pct-${id}`);

  if (patch.progress !== undefined && barEl && pctEl) {
    barEl.style.width  = patch.progress + '%';
    pctEl.textContent  = patch.progress + '%';
  }

  switch (patch.status) {
    case 'uploading':
      if (progressEl) progressEl.style.display = 'flex';
      if (statusEl) statusEl.innerHTML = `<span class="cv-status-badge cv-status-badge--uploading">上传中</span>`;
      break;
    case 'processing':
      if (statusEl) statusEl.innerHTML = `<span class="cv-status-badge cv-status-badge--processing"><span class="cv-spinner"></span> 转换中</span>`;
      break;
    case 'done':
      if (progressEl) progressEl.style.display = 'none';
      if (statusEl) statusEl.innerHTML = `<span class="cv-status-badge cv-status-badge--done">✓ 完成</span>`;
      if (actionsEl) actionsEl.innerHTML = `
        <a class="cv-btn-download" href="${item.resultUrl}" download="${escHtml(item.resultName || '')}">
          ⬇ 下载
        </a>
        <button class="cv-btn-remove" onclick="removeFile('${id}')" title="移除">✕</button>
      `;
      checkAllDone();
      break;
    case 'error':
      if (progressEl) progressEl.style.display = 'none';
      if (statusEl) statusEl.innerHTML = `<span class="cv-status-badge cv-status-badge--error" title="${escHtml(item.error || '')}">✗ 失败</span>`;
      if (actionsEl) actionsEl.innerHTML = `
        <button class="cv-btn-retry" onclick="retryFile('${id}')">重试</button>
        <button class="cv-btn-remove" onclick="removeFile('${id}')" title="移除">✕</button>
      `;
      break;
  }
}

/* ── 检查是否全部完成 ─────────────────────────── */
function checkAllDone() {
  const doneAll = CVState.files.every(f => f.status === 'done' || f.status === 'error');
  if (doneAll && CVState.files.some(f => f.status === 'done')) {
    document.getElementById('downloadAllBar').style.display = 'flex';
  }
}

/* ── 移除 / 清空 ─────────────────────────────── */
function removeFile(id) {
  CVState.files = CVState.files.filter(f => f.id !== id);
  const el = document.getElementById(`item-${id}`);
  if (el) {
    el.style.transition = 'opacity 0.2s, transform 0.2s';
    el.style.opacity    = '0';
    el.style.transform  = 'translateX(20px)';
    setTimeout(() => el.remove(), 220);
  }
  if (CVState.files.length === 0) {
    document.getElementById('uploadZone').style.display = 'flex';
    document.getElementById('fileQueue').style.display  = 'none';
  }
}

function clearAll() {
  CVState.files = [];
  document.getElementById('fileList').innerHTML     = '';
  document.getElementById('downloadAllBar').style.display = 'none';
  document.getElementById('fileQueue').style.display       = 'none';
  document.getElementById('uploadZone').style.display      = 'flex';
}

/* ── 工具函数 ────────────────────────────────── */
function fmtSize(bytes) {
  if (bytes < 1024)            return `${bytes} B`;
  if (bytes < 1024 * 1024)     return `${(bytes/1024).toFixed(1)} KB`;
  if (bytes < 1024**3)         return `${(bytes/1024**2).toFixed(2)} MB`;
  return `${(bytes/1024**3).toFixed(2)} GB`;
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function getFileIcon(mime) {
  if (mime?.startsWith('video/'))       return '🎬';
  if (mime?.startsWith('audio/'))       return '🎵';
  if (mime?.startsWith('image/'))       return '🖼️';
  if (mime === 'application/pdf')       return '📄';
  if (mime?.includes('word') || mime?.includes('document')) return '📝';
  if (mime?.includes('zip') || mime?.includes('compressed')) return '📦';
  return '📎';
}

function showToast(msg, type = 'info') {
  const c  = document.getElementById('toastContainer');
  if (!c) return;
  const el = document.createElement('div');
  el.className   = `cv-toast cv-toast--${type}`;
  el.textContent = msg;
  c.appendChild(el);
  requestAnimationFrame(() => el.classList.add('cv-toast--show'));
  setTimeout(() => { el.classList.remove('cv-toast--show'); setTimeout(() => el.remove(), 300); }, 3500);
}

function toggleFAQ(id) {
  const item   = document.getElementById(id);
  const isOpen = item.classList.contains('cv-faq-item--open');
  document.querySelectorAll('.cv-faq-item--open').forEach(i => i.classList.remove('cv-faq-item--open'));
  if (!isOpen) item.classList.add('cv-faq-item--open');
}

document.addEventListener('DOMContentLoaded', () => {
  // 注入接受格式提示
  const cfg = window.CV_CONFIG || {};
  const hint = document.getElementById('acceptHint');
  if (hint && cfg.acceptLabel) hint.textContent = cfg.acceptLabel;
  const lmt = document.getElementById('limitHint');
  if (lmt) lmt.textContent = `单文件最大 ${cfg.maxSizeMB || 100}MB`;
  // 设置 fileInput accept
  const fi = document.getElementById('fileInput');
  if (fi && cfg.accept?.length) fi.accept = cfg.accept.join(',');
});
```

---

## 5. 后端 API 调用 JS（`/static/js/convert-api.js`）

```javascript
// /static/js/convert-api.js
// 负责：上传 → 轮询状态 → 下载（所有需要后端的工具共用）

'use strict';

const POLL_INTERVAL = 1500; // ms

/* ── 一键全部转换 ────────────────────────────── */
async function convertAll() {
  if (CVState.isConverting) return;
  const pending = CVState.files.filter(f => f.status === 'pending' || f.status === 'error');
  if (pending.length === 0) return;

  CVState.isConverting = true;
  document.getElementById('convertAllBtn').disabled = true;
  document.getElementById('convertBtnText').textContent = '转换中...';

  const fmt = window.CV_SELECTED_FORMAT || '';

  // 并发处理（最多 3 个）
  const CONCURRENT = 3;
  const queue = [...pending];
  const workers = [];
  for (let i = 0; i < Math.min(CONCURRENT, queue.length); i++) {
    workers.push((async () => {
      while (queue.length) {
        const item = queue.shift();
        if (item) await processFile(item, fmt);
      }
    })());
  }
  await Promise.all(workers);

  CVState.isConverting = false;
  document.getElementById('convertAllBtn').disabled = false;
  document.getElementById('convertBtnText').textContent = '开始转换';
}

/* ── 单文件处理流程 ──────────────────────────── */
async function processFile(item, fmt) {
  try {
    // 1. 上传
    updateFileItem(item.id, { status: 'uploading', progress: 0 });
    const jobId = await uploadFile(item);
    updateFileItem(item.id, { jobId, status: 'processing', progress: 100 });

    // 2. 轮询转换状态（或监听 SSE）
    const result = await pollJob(item.id, jobId, fmt);

    // 3. 完成
    updateFileItem(item.id, {
      status: 'done',
      resultUrl:  result.downloadUrl,
      resultName: result.filename,
    });
  } catch (err) {
    updateFileItem(item.id, { status: 'error', error: err.message });
    showToast(`${item.file.name}：${err.message}`, 'error');
  }
}

/* ── 文件上传（XHR，带进度）───────────────────── */
function uploadFile(item) {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append('file',   item.file);
    fd.append('slug',   window.CV_CONFIG?.slug || '');
    fd.append('format', window.CV_SELECTED_FORMAT || '');

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/convert/api/upload');

    xhr.upload.onprogress = e => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 90); // 留 10% 给处理
        updateFileItem(item.id, { progress: pct });
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const resp = JSON.parse(xhr.responseText);
        resolve(resp.jobId);
      } else {
        reject(new Error(JSON.parse(xhr.responseText)?.error || '上传失败'));
      }
    };

    xhr.onerror  = () => reject(new Error('网络错误'));
    xhr.ontimeout= () => reject(new Error('上传超时'));
    xhr.timeout  = 30 * 60 * 1000; // 30 分钟超时
    xhr.send(fd);
  });
}

/* ── 轮询任务状态 ────────────────────────────── */
async function pollJob(fileId, jobId, fmt) {
  const maxWait = 30 * 60 * 1000; // 最长等 30 分钟
  const start   = Date.now();

  while (Date.now() - start < maxWait) {
    await sleep(POLL_INTERVAL);

    const resp = await fetch(`/convert/api/status/${jobId}`);
    if (!resp.ok) throw new Error('状态查询失败');

    const data = await resp.json();

    // 更新进度（processing 阶段 progress 从 100 开始标记）
    if (data.progress !== undefined) {
      updateFileItem(fileId, { progress: data.progress });
    }

    if (data.status === 'done') {
      return {
        downloadUrl: `/convert/api/download/${jobId}`,
        filename:    data.filename || `output.${fmt}`,
      };
    }

    if (data.status === 'error') {
      throw new Error(data.error || '转换失败');
    }
  }

  throw new Error('转换超时，请尝试更小的文件');
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/* ── 重试 ────────────────────────────────────── */
async function retryFile(id) {
  const item = CVState.files.find(f => f.id === id);
  if (!item) return;
  item.status = 'pending';
  updateFileItem(id, { status: 'pending', progress: 0, error: null });
  await processFile(item, window.CV_SELECTED_FORMAT || '');
}

/* ── 打包下载全部 ────────────────────────────── */
async function downloadAll() {
  const doneItems = CVState.files.filter(f => f.status === 'done' && f.jobId);
  if (doneItems.length === 0) return;

  // 多个文件：请求后端打 ZIP
  if (doneItems.length === 1) {
    const item = doneItems[0];
    const a = document.createElement('a');
    a.href = item.resultUrl;
    a.download = item.resultName || 'output';
    a.click();
    return;
  }

  const jobIds = doneItems.map(f => f.jobId);
  const resp = await fetch('/convert/api/download-zip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobIds }),
  });

  if (!resp.ok) { showToast('打包下载失败', 'error'); return; }

  const blob = await resp.blob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `converted-${Date.now()}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
```

---

## 6. CSS（`/static/css/convert.css`）

```css
/* ══════════════════════════════════════════════
   文件转换工具集 — 完整样式
   主色：靛青 #0ea5e9
   背景：米白 #fafaf8
════════════════════════════════════════════════ */
:root {
  --cv-sky:         #0ea5e9;
  --cv-sky-dark:    #0284c7;
  --cv-sky-light:   #e0f2fe;
  --cv-bg:          #fafaf8;
  --cv-surface:     #ffffff;
  --cv-border:      #e2e8f0;
  --cv-text:        #1a1a1a;
  --cv-text-muted:  #64748b;
  --cv-shadow-sm:   0 1px 3px rgba(0,0,0,0.06);
  --cv-shadow-md:   0 4px 16px rgba(0,0,0,0.08);
  --cv-radius-sm:   8px;
  --cv-radius-md:   14px;
  --cv-radius-lg:   20px;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body.cv-page {
  font-family: 'PingFang SC', 'Hiragino Sans GB', system-ui, sans-serif;
  background: var(--cv-bg);
  color: var(--cv-text);
  line-height: 1.6;
}

.cv-container { max-width: 960px; margin: 0 auto; padding: 0 20px; }
.cv-section-title { font-size: 1.5rem; font-weight: 800; text-align: center; margin-bottom: 28px; }

/* ── 导航 ──────────────────────────────────── */
.cv-navbar {
  background: var(--cv-surface);
  border-bottom: 1px solid var(--cv-border);
  position: sticky; top: 0; z-index: 100;
  box-shadow: var(--cv-shadow-sm);
}
.cv-navbar > .cv-container {
  display: flex; align-items: center; justify-content: space-between; height: 54px;
}
.cv-logo {
  display: flex; align-items: center; gap: 8px;
  text-decoration: none; font-weight: 800; color: var(--cv-sky);
}
.cv-navbar__cats {
  display: flex; gap: 4px; font-size: 0.8125rem;
}
.cv-navbar__cats a {
  padding: 4px 10px; border-radius: 6px;
  text-decoration: none; color: var(--cv-text-muted);
  transition: background 0.15s, color 0.15s;
}
.cv-navbar__cats a:hover, .cv-navbar__cats a.active {
  background: var(--cv-sky-light); color: var(--cv-sky-dark); font-weight: 600;
}
.cv-lang-switch { display: flex; align-items: center; gap: 6px; font-size: 0.8125rem; color: var(--cv-text-muted); }
.cv-lang-switch a { color: var(--cv-text-muted); text-decoration: none; font-weight: 500; }
.cv-lang-switch a.active { color: var(--cv-sky); font-weight: 700; }

/* ── Hero ──────────────────────────────────── */
.cv-hero { padding: 40px 0 32px; background: linear-gradient(180deg, #f0f9ff 0%, var(--cv-bg) 100%); }
.cv-hero__title { font-size: 2rem; font-weight: 900; margin-bottom: 10px; letter-spacing: -0.02em; }
.cv-hero__desc { font-size: 1rem; color: var(--cv-text-muted); max-width: 600px; }

/* ── 格式 Pills ────────────────────────────── */
.cv-format-bar {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 16px; flex-wrap: wrap;
}
.cv-format-bar__label { font-size: 0.875rem; font-weight: 600; color: var(--cv-text-muted); white-space: nowrap; }
.cv-format-pills { display: flex; gap: 6px; flex-wrap: wrap; }
.cv-format-pill input { display: none; }
.cv-format-pill {
  display: inline-flex; align-items: center; height: 32px; padding: 0 14px;
  border: 1.5px solid var(--cv-border); border-radius: 999px;
  font-size: 0.8125rem; font-weight: 600; cursor: pointer;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
  color: var(--cv-text-muted);
}
.cv-format-pill:hover { border-color: var(--cv-sky); color: var(--cv-sky); }
.cv-format-pill--active {
  border-color: var(--cv-sky); background: var(--cv-sky-light); color: var(--cv-sky-dark);
}

/* ── 上传区 ────────────────────────────────── */
.cv-workspace { padding: 0 0 40px; }
.cv-upload-zone {
  position: relative; background: var(--cv-surface);
  border: 2.5px dashed var(--cv-border); border-radius: var(--cv-radius-lg);
  padding: 60px 32px; text-align: center; cursor: pointer;
  transition: border-color 0.2s, background 0.2s, transform 0.15s;
  box-shadow: var(--cv-shadow-md); display: flex; align-items: center; justify-content: center;
  min-height: 260px;
}
.cv-upload-zone:hover { border-color: var(--cv-sky); background: var(--cv-sky-light); transform: translateY(-2px); }
.cv-upload-zone--dragover { border-color: var(--cv-sky) !important; background: var(--cv-sky-light) !important; transform: scale(1.01) !important; }

.cv-upload-zone__idle { display: flex; flex-direction: column; align-items: center; gap: 12px; pointer-events: none; }
.cv-upload-icon { color: var(--cv-sky); }
.cv-upload-zone__title { font-size: 1.25rem; font-weight: 700; }
.cv-upload-zone__accept { font-size: 0.875rem; color: var(--cv-text-muted); }

.cv-upload-btn {
  display: inline-flex; align-items: center; height: 44px; padding: 0 28px;
  background: var(--cv-sky); color: #fff; border-radius: 11px;
  font-size: 0.9375rem; font-weight: 700; cursor: pointer;
  box-shadow: 0 4px 14px rgba(14,165,233,0.35); pointer-events: all;
  transition: background 0.15s;
}
.cv-upload-btn:hover { background: var(--cv-sky-dark); }
.cv-upload-zone__limit { font-size: 0.75rem; color: #a8a49e; }

.cv-upload-zone__drop-mask {
  position: absolute; inset: 0; background: rgba(14,165,233,0.1);
  border-radius: calc(var(--cv-radius-lg) - 2px);
  display: none; flex-direction: column; align-items: center; justify-content: center; gap: 12px;
  pointer-events: none;
}
.cv-upload-zone--dragover .cv-upload-zone__drop-mask { display: flex; }
.cv-drop-icon { font-size: 3rem; }

/* ── 文件队列 ──────────────────────────────── */
.cv-queue { margin-top: 16px; }
.cv-queue__actions {
  display: flex; align-items: center; gap: 10px; margin-bottom: 14px; flex-wrap: wrap;
}

.cv-btn-convert {
  height: 44px; padding: 0 24px;
  background: linear-gradient(135deg, var(--cv-sky), var(--cv-sky-dark));
  color: #fff; border: none; border-radius: 11px;
  font-size: 0.9375rem; font-weight: 700; cursor: pointer;
  box-shadow: 0 4px 14px rgba(14,165,233,0.35);
  transition: opacity 0.15s;
}
.cv-btn-convert:hover:not(:disabled) { opacity: 0.9; }
.cv-btn-convert:disabled { background: #e2e8f0; color: #94a3b8; box-shadow: none; cursor: not-allowed; }

.cv-btn-add {
  height: 38px; padding: 0 16px;
  background: transparent; border: 1.5px dashed var(--cv-border);
  border-radius: 9px; font-size: 0.875rem; color: var(--cv-text-muted);
  cursor: pointer; transition: border-color 0.15s, color 0.15s;
}
.cv-btn-add:hover { border-color: var(--cv-sky); color: var(--cv-sky); }

.cv-btn-clear {
  height: 36px; padding: 0 14px;
  background: transparent; border: 1px solid var(--cv-border);
  border-radius: 8px; font-size: 0.8125rem; color: var(--cv-text-muted);
  cursor: pointer; transition: background 0.15s;
}
.cv-btn-clear:hover { background: #fef2f2; color: #dc2626; border-color: #fecaca; }

/* ── 文件行 ────────────────────────────────── */
.cv-file-list { display: flex; flex-direction: column; gap: 8px; }
.cv-file-item {
  display: grid; grid-template-columns: 36px 1fr auto auto;
  gap: 12px; align-items: center;
  background: var(--cv-surface); border: 1px solid var(--cv-border);
  border-radius: var(--cv-radius-sm); padding: 12px 16px;
  box-shadow: var(--cv-shadow-sm);
}
.cv-file-item__icon { font-size: 1.5rem; text-align: center; }
.cv-file-item__name { font-size: 0.875rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cv-file-item__size { font-size: 0.75rem; color: var(--cv-text-muted); }
.cv-file-item__progress { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
.cv-progress-bar { flex: 1; height: 4px; background: #e2e8f0; border-radius: 999px; overflow: hidden; }
.cv-progress-bar__fill { height: 100%; background: linear-gradient(90deg, var(--cv-sky), var(--cv-sky-dark)); border-radius: 999px; transition: width 0.3s ease; }
.cv-progress-pct { font-size: 0.6875rem; color: var(--cv-text-muted); white-space: nowrap; }

/* ── 状态徽章 ──────────────────────────────── */
.cv-status-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; white-space: nowrap; }
.cv-status-badge--pending    { background: #f1f5f9; color: #64748b; }
.cv-status-badge--uploading  { background: #eff6ff; color: #2563eb; }
.cv-status-badge--processing { background: #fef9c3; color: #92400e; }
.cv-status-badge--done       { background: #dcfce7; color: #166534; }
.cv-status-badge--error      { background: #fef2f2; color: #dc2626; }

.cv-spinner { display: inline-block; width: 10px; height: 10px; border: 2px solid #fde68a; border-top-color: #92400e; border-radius: 50%; animation: cv-spin 0.7s linear infinite; }
@keyframes cv-spin { to { transform: rotate(360deg); } }

/* ── 操作按钮 ──────────────────────────────── */
.cv-btn-download { height: 30px; padding: 0 14px; background: var(--cv-sky); color: #fff; border-radius: 7px; font-size: 0.8125rem; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; }
.cv-btn-retry    { height: 30px; padding: 0 12px; background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; border-radius: 7px; font-size: 0.75rem; font-weight: 600; cursor: pointer; }
.cv-btn-remove   { width: 26px; height: 26px; background: transparent; border: 1px solid var(--cv-border); border-radius: 50%; color: var(--cv-text-muted); font-size: 0.7rem; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.cv-btn-remove:hover { background: #fef2f2; color: #dc2626; border-color: #fecaca; }

/* ── 打包下载栏 ────────────────────────────── */
.cv-download-all { display: flex; align-items: center; gap: 14px; padding: 14px 0; flex-wrap: wrap; }
.cv-btn-download-all { height: 42px; padding: 0 24px; background: linear-gradient(135deg, var(--cv-sky), var(--cv-sky-dark)); color: #fff; border: none; border-radius: 10px; font-size: 0.9375rem; font-weight: 700; cursor: pointer; box-shadow: 0 4px 14px rgba(14,165,233,0.3); }
.cv-download-all__hint { font-size: 0.8125rem; color: var(--cv-text-muted); }

/* ── 特性卡片 ──────────────────────────────── */
.cv-features-section { background: var(--cv-surface); padding: 48px 0; border-top: 1px solid var(--cv-border); }
.cv-features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.cv-feature-card { text-align: center; padding: 28px 20px; background: var(--cv-bg); border: 1px solid var(--cv-border); border-radius: var(--cv-radius-md); }
.cv-feature-icon { font-size: 2rem; margin-bottom: 12px; }
.cv-feature-card h3 { font-size: 1rem; font-weight: 700; margin-bottom: 6px; }
.cv-feature-card p  { font-size: 0.875rem; color: var(--cv-text-muted); }

/* ── FAQ ───────────────────────────────────── */
.cv-faq-section { background: var(--cv-bg); padding: 48px 0; }
.cv-faq-list { max-width: 700px; margin: 0 auto; display: flex; flex-direction: column; gap: 8px; }
.cv-faq-item { background: var(--cv-surface); border: 1px solid var(--cv-border); border-radius: var(--cv-radius-sm); overflow: hidden; }
.cv-faq-question { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; background: none; border: none; text-align: left; font-size: 0.9375rem; font-weight: 600; cursor: pointer; gap: 12px; }
.cv-faq-chevron { flex-shrink: 0; transition: transform 0.2s; color: var(--cv-text-muted); }
.cv-faq-item--open .cv-faq-chevron { transform: rotate(180deg); color: var(--cv-sky); }
.cv-faq-answer { max-height: 0; overflow: hidden; transition: max-height 0.3s ease; }
.cv-faq-item--open .cv-faq-answer { max-height: 300px; }
.cv-faq-answer p { padding: 0 20px 16px; font-size: 0.875rem; color: var(--cv-text-muted); line-height: 1.7; }

/* ── Toast ─────────────────────────────────── */
#toastContainer { position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 8px; }
.cv-toast { padding: 12px 18px; border-radius: 10px; font-size: 0.875rem; font-weight: 500; color: #fff; box-shadow: 0 8px 24px rgba(0,0,0,0.15); opacity: 0; transform: translateX(20px); transition: opacity 0.25s, transform 0.25s; max-width: 300px; }
.cv-toast--show    { opacity: 1; transform: translateX(0); }
.cv-toast--success { background: #16a34a; }
.cv-toast--error   { background: #dc2626; }
.cv-toast--info    { background: #374151; }

/* ── 响应式 ────────────────────────────────── */
@media (max-width: 768px) {
  .cv-hero__title   { font-size: 1.5rem; }
  .cv-features-grid { grid-template-columns: 1fr; }
  .cv-navbar__cats  { display: none; }
  .cv-file-item     { grid-template-columns: 28px 1fr auto; }
  .cv-file-item__actions { grid-column: 1 / -1; }
}
@media (max-width: 480px) {
  .cv-upload-zone { padding: 40px 16px; min-height: 200px; }
  .cv-queue__actions { flex-direction: column; align-items: flex-start; }
}
```

---

## 7. 验收标准

- [ ] 拖拽文件到上传区：边框变蓝，遮罩出现「松开鼠标开始上传」
- [ ] 选择文件后：上传区隐藏，文件队列显示，每行含文件名、大小、状态徽章、移除按钮
- [ ] 格式 Pills 自动根据当前工具 slug 渲染（只有一种格式时不显示格式栏）
- [ ] 点击「开始转换」：并发（最多 3 个）处理，进度条实时更新
- [ ] 文件完成：状态变绿「✓ 完成」，操作区出现「⬇ 下载」按钮
- [ ] 文件失败：状态变红「✗ 失败」，出现「重试」按钮
- [ ] 全部完成后：底部出现「打包下载全部 (ZIP)」
- [ ] 移动端（<768px）：布局正常，导航分类收起
