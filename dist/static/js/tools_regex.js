/* ==================================================
   Tool Box Nova - 正则测试器 JS
   ================================================== */

const patternInput = document.getElementById('regexPattern');
const flagsInput = document.getElementById('regexFlags');
const testStr = document.getElementById('regexTestStr');
const highlightLayer = document.getElementById('regexHighlight');
const matchCountEl = document.getElementById('matchCount');
const matchDetails = document.getElementById('matchDetails');
const regexError = document.getElementById('regexError');
const regexExplain = document.getElementById('regexExplain');

let currentMode = 'match';

// ===== Flag toggle buttons =====
document.querySelectorAll('.flag-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    this.classList.toggle('active');
    const flags = [...document.querySelectorAll('.flag-btn.active')].map(b => b.dataset.flag).join('');
    flagsInput.value = flags;
    runRegex();
  });
});

// Sync flag buttons ↔ input
flagsInput.addEventListener('input', () => {
  document.querySelectorAll('.flag-btn').forEach(btn => {
    btn.classList.toggle('active', flagsInput.value.includes(btn.dataset.flag));
  });
  runRegex();
});

// ===== Mode Tabs =====
document.querySelectorAll('.mode-tab').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.mode-tab').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    currentMode = this.dataset.mode;
    document.getElementById('replaceArea').classList.toggle('hidden', currentMode !== 'replace');
    document.getElementById('splitArea').classList.toggle('hidden', currentMode !== 'split');
    runRegex();
  });
});

// ===== Pattern presets =====
document.querySelectorAll('.pattern-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    patternInput.value = this.dataset.pattern;
    if (this.dataset.test) testStr.value = this.dataset.test;
    runRegex();
  });
});

// ===== Core: run regex =====
function runRegex() {
  const pattern = patternInput.value;
  const flags = flagsInput.value;
  const text = testStr.value;

  regexError.classList.add('hidden');
  if (!pattern) {
    highlightLayer.innerHTML = escHtml(text);
    matchCountEl.textContent = '0 个匹配';
    matchDetails.innerHTML = '<p class="no-match-hint">请输入正则表达式</p>';
    return;
  }

  let re;
  try {
    re = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
  } catch (e) {
    regexError.textContent = '❌ ' + e.message;
    regexError.classList.remove('hidden');
    highlightLayer.innerHTML = escHtml(text);
    matchCountEl.textContent = '语法错误';
    return;
  }

  const matches = [...text.matchAll(re)];
  matchCountEl.textContent = matches.length + ' 个匹配';

  // Highlight
  let highlighted = '';
  let lastIdx = 0;
  const colors = ['#bfdbfe', '#bbf7d0', '#fde68a', '#fce7f3', '#e0e7ff'];
  matches.forEach((m, i) => {
    highlighted += escHtml(text.slice(lastIdx, m.index));
    highlighted += `<mark class="rx-match" style="background:${colors[i % colors.length]}" title="匹配 ${i + 1}">${escHtml(m[0])}</mark>`;
    lastIdx = m.index + m[0].length;
  });
  highlighted += escHtml(text.slice(lastIdx));
  highlightLayer.innerHTML = highlighted;

  // Match details
  if (matches.length === 0) {
    matchDetails.innerHTML = '<p class="no-match-hint">无匹配结果</p>';
  } else {
    matchDetails.innerHTML = matches.map((m, i) => `
      <div class="match-item">
        <div class="match-item-header">
          <span class="match-num">#${i + 1}</span>
          <span class="match-pos">位置 ${m.index}–${m.index + m[0].length}</span>
        </div>
        <div class="match-full"><code>${escHtml(m[0])}</code></div>
        ${m.slice(1).map((g, gi) => g !== undefined ? `<div class="match-group"><span>组 ${gi + 1}:</span> <code>${escHtml(g)}</code></div>` : '').join('')}
      </div>`).join('');
  }

  // Replace mode
  if (currentMode === 'replace') {
    const repl = document.getElementById('replaceStr').value;
    try {
      const result = text.replace(re, repl);
      document.getElementById('replaceResult').textContent = result;
    } catch (e) {
      document.getElementById('replaceResult').textContent = '替换错误: ' + e.message;
    }
  }

  // Split mode
  if (currentMode === 'split') {
    const parts = text.split(re);
    document.getElementById('splitResult').innerHTML = parts.map((p, i) =>
      `<span class="split-item"><span class="split-index">[${i}]</span> ${escHtml(p)}</span>`
    ).join('');
  }

  // Explain
  explainRegex(pattern);
}

function explainRegex(pattern) {
  const rules = [
    [/^\^/, '^ 匹配字符串开头'],
    [/\$$/, '$ 匹配字符串结尾'],
    [/\\d/g, '\\d 匹配数字 [0-9]'],
    [/\\w/g, '\\w 匹配单词字符 [a-zA-Z0-9_]'],
    [/\\s/g, '\\s 匹配空白字符'],
    [/\.\*/g, '.* 贪婪匹配任意字符（0或多）'],
    [/\.\+/g, '.+ 贪婪匹配任意字符（1或多）'],
    [/\.\?/g, '.? 匹配任意字符（0或1）'],
    [/\(\?=/g, '(?=...) 正向先行断言'],
    [/\(\?!/g, '(?!...) 负向先行断言'],
    [/\(\?:/g, '(?:...) 非捕获分组'],
    [/\(/g, '(...) 捕获分组'],
    [/\[/g, '[...] 字符类'],
    [/\\b/g, '\\b 单词边界'],
    [/\{(\d+),?(\d*)\}/g, '{n,m} 量词'],
  ];
  const found = [];
  rules.forEach(([rx, desc]) => { if (rx.test(pattern)) found.push(desc); });
  regexExplain.innerHTML = found.length
    ? found.map(f => `<div class="explain-item">• ${f}</div>`).join('')
    : '<p class="no-match-hint">未识别到特殊模式</p>';
}

// Sync scroll
testStr.addEventListener('scroll', () => {
  highlightLayer.scrollTop = testStr.scrollTop;
  highlightLayer.scrollLeft = testStr.scrollLeft;
});

// Live update
[patternInput, testStr, document.getElementById('replaceStr')].forEach(el => {
  el?.addEventListener('input', runRegex);
});

function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Init
runRegex();

