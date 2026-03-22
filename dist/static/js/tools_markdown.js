/* ==================================================
   Tool Box Nova - Markdown 编辑器 JS
   ================================================== */

const editor = document.getElementById('mdEditor');
const preview = document.getElementById('mdPreview');
const wordCount = document.getElementById('wordCount');
let syncScroll = true;

// Configure marked
if (typeof marked !== 'undefined') {
  marked.setOptions({ breaks: true, gfm: true });
  if (typeof hljs !== 'undefined') {
    marked.setOptions({
      highlight: (code, lang) => {
        if (lang && hljs.getLanguage(lang)) {
          return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
      }
    });
  }
}

function renderMarkdown() {
  const text = editor.value;
  if (typeof marked !== 'undefined') {
    preview.innerHTML = marked.parse(text);
    if (typeof hljs !== 'undefined') {
      preview.querySelectorAll('pre code').forEach(el => hljs.highlightElement(el));
    }
  } else {
    // Fallback basic renderer
    preview.innerHTML = text
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }
  // Word count
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const chars = text.length;
  wordCount.textContent = `${words} 词 / ${chars} 字符`;
}

// Toolbar actions
const toolbarActions = {
  bold: () => wrapSelection('**', '**', '粗体文本'),
  italic: () => wrapSelection('*', '*', '斜体文本'),
  heading: () => wrapLine('## ', '标题'),
  ul: () => wrapLine('- ', '列表项'),
  ol: () => wrapLine('1. ', '列表项'),
  link: () => wrapSelection('[', '](url)', '链接文本'),
  image: () => wrapSelection('![', '](image-url)', '图片描述'),
  code: () => wrapSelection('`', '`', 'code'),
  codeblock: () => wrapSelection('```\n', '\n```', 'code block'),
  table: () => insertText('\n| 列 1 | 列 2 | 列 3 |\n|------|------|------|\n| A    | B    | C    |\n'),
  hr: () => insertText('\n---\n'),
  quote: () => wrapLine('> ', '引用文本'),
};

document.querySelectorAll('.md-btn[data-action]').forEach(btn => {
  btn.addEventListener('click', () => {
    const action = toolbarActions[btn.dataset.action];
    if (action) { action(); editor.focus(); renderMarkdown(); }
  });
});

function wrapSelection(before, after, placeholder) {
  const start = editor.selectionStart, end = editor.selectionEnd;
  const selected = editor.value.slice(start, end) || placeholder;
  const newText = before + selected + after;
  editor.setRangeText(newText, start, end, 'select');
}

function wrapLine(prefix, placeholder) {
  const start = editor.selectionStart;
  const lineStart = editor.value.lastIndexOf('\n', start - 1) + 1;
  editor.setRangeText(prefix, lineStart, lineStart, 'end');
}

function insertText(text) {
  const pos = editor.selectionStart;
  editor.setRangeText(text, pos, pos, 'end');
}

// Sync scroll
document.getElementById('syncScrollBtn')?.addEventListener('click', function () {
  syncScroll = !syncScroll;
  this.classList.toggle('active', syncScroll);
});

editor.addEventListener('scroll', () => {
  if (!syncScroll) return;
  const ratio = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
  const previewEl = document.getElementById('previewPane');
  previewEl.scrollTop = ratio * (previewEl.scrollHeight - previewEl.clientHeight);
});

// Export HTML
document.getElementById('exportHtmlBtn')?.addEventListener('click', () => {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Markdown Export</title><style>body{max-width:800px;margin:40px auto;font-family:sans-serif;line-height:1.6}pre{background:#f4f4f4;padding:16px;border-radius:6px;overflow:auto}code{background:#f4f4f4;padding:2px 4px;border-radius:3px}</style></head><body>${preview.innerHTML}</body></html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'markdown-export.html' });
  a.click(); URL.revokeObjectURL(a.href);
});

document.getElementById('copyMdBtn')?.addEventListener('click', function () {
  navigator.clipboard.writeText(editor.value).then(() => {
    this.textContent = '✅ 已复制'; setTimeout(() => { this.textContent = '📋 复制'; }, 2000);
  });
});

document.getElementById('clearMdBtn')?.addEventListener('click', () => {
  editor.value = ''; renderMarkdown();
});

// Full preview
document.getElementById('fullPreviewBtn')?.addEventListener('click', function () {
  const layout = document.getElementById('markdownLayout');
  const editorPane = document.getElementById('editorPane');
  const previewPane = document.getElementById('previewPane');
  const isFullPreview = editorPane.style.display === 'none';
  editorPane.style.display = isFullPreview ? '' : 'none';
  previewPane.style.flex = isFullPreview ? '' : '1';
  this.textContent = isFullPreview ? '👁 预览' : '✏️ 编辑';
});

// Live render on input
editor.addEventListener('input', renderMarkdown);

// Init
renderMarkdown();

