/* ==================================================
   Tool Box Nova - 大小写转换器 JS
   ================================================== */

const formats = [
  { key: 'camel',          label: 'camelCase',           example: 'helloWorldFoo',         color: '#3b82f6' },
  { key: 'pascal',         label: 'PascalCase',          example: 'HelloWorldFoo',          color: '#8b5cf6' },
  { key: 'snake',          label: 'snake_case',          example: 'hello_world_foo',        color: '#10b981' },
  { key: 'screaming',      label: 'SCREAMING_SNAKE_CASE',example: 'HELLO_WORLD_FOO',        color: '#ef4444' },
  { key: 'kebab',          label: 'kebab-case',          example: 'hello-world-foo',        color: '#f97316' },
  { key: 'train',          label: 'Train-Case',          example: 'Hello-World-Foo',        color: '#f59e0b' },
  { key: 'upper',          label: 'UPPER CASE',          example: 'HELLO WORLD FOO',        color: '#6366f1' },
  { key: 'lower',          label: 'lower case',          example: 'hello world foo',        color: '#64748b' },
  { key: 'title',          label: 'Title Case',          example: 'Hello World Foo',        color: '#0ea5e9' },
  { key: 'sentence',       label: 'Sentence case',       example: 'Hello world foo',        color: '#14b8a6' },
  { key: 'dot',            label: 'dot.case',            example: 'hello.world.foo',        color: '#a855f7' },
  { key: 'path',           label: 'path/case',           example: 'hello/world/foo',        color: '#ec4899' },
  { key: 'constant',       label: 'CONSTANT_CASE',       example: 'HELLO_WORLD_FOO',        color: '#dc2626' },
  { key: 'swap',           label: 'sWAP cASE',           example: 'hELLO wORLD fOO',        color: '#7c3aed' },
];

function toWords(text) {
  return text
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/[-_./]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

const converters = {
  camel:     words => words.map((w, i) => i === 0 ? w.toLowerCase() : cap(w)).join(''),
  pascal:    words => words.map(cap).join(''),
  snake:     words => words.map(w => w.toLowerCase()).join('_'),
  screaming: words => words.map(w => w.toUpperCase()).join('_'),
  kebab:     words => words.map(w => w.toLowerCase()).join('-'),
  train:     words => words.map(cap).join('-'),
  upper:     words => words.join(' ').toUpperCase(),
  lower:     words => words.join(' ').toLowerCase(),
  title:     words => words.map(cap).join(' '),
  sentence:  words => { const ws = words.map(w => w.toLowerCase()); if (ws.length) ws[0] = cap(ws[0]); return ws.join(' '); },
  dot:       words => words.map(w => w.toLowerCase()).join('.'),
  path:      words => words.map(w => w.toLowerCase()).join('/'),
  constant:  words => words.map(w => w.toUpperCase()).join('_'),
  swap:      words => words.join(' ').split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join(''),
};

function cap(w) { return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(); }

function renderCards(text) {
  const words = text ? toWords(text) : null;
  const grid = document.getElementById('caseGrid');
  grid.innerHTML = formats.map(f => {
    const result = words ? converters[f.key](words) : f.example;
    return `<div class="case-card" style="--card-color:${f.color}">
      <div class="case-card-label">${f.label}</div>
      <div class="case-card-value" id="case-${f.key}">${result || '—'}</div>
      <button class="case-copy-btn" data-key="${f.key}" title="复制">📋 复制</button>
    </div>`;
  }).join('');
  attachCopyEvents();
}

function attachCopyEvents() {
  document.querySelectorAll('.case-copy-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const val = document.getElementById('case-' + this.dataset.key)?.textContent;
      if (!val || val === '—') return;
      navigator.clipboard.writeText(val).then(() => {
        const old = this.textContent; this.textContent = '✅ 已复制';
        setTimeout(() => { this.textContent = old; }, 1500);
      });
    });
  });
}

document.getElementById('caseInput')?.addEventListener('input', function () {
  renderCards(this.value);
});

document.getElementById('clearCaseBtn')?.addEventListener('click', function () {
  document.getElementById('caseInput').value = '';
  renderCards('');
});

document.getElementById('copyAllCaseBtn')?.addEventListener('click', function () {
  const input = document.getElementById('caseInput').value;
  const words = input ? toWords(input) : null;
  if (!words) return alert('请先输入文本');
  const result = {};
  formats.forEach(f => { result[f.label] = converters[f.key](words); });
  navigator.clipboard.writeText(JSON.stringify(result, null, 2)).then(() => {
    this.textContent = '✅ 已全部复制'; setTimeout(() => { this.textContent = '📋 全部复制（JSON）'; }, 2000);
  });
});

// Init with example
renderCards('hello world foo bar');
document.getElementById('caseInput').value = 'hello world foo bar';

