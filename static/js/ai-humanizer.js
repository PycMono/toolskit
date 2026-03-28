/* =============================================================
   AI Humanizer — ai-humanizer.js
   Frontend processing engine (strategy + factory pattern)
   ============================================================= */
(function () {
'use strict';

// ─── State ────────────────────────────────────────────────────
var STATE = {
  inputText:        '',
  inputWordCount:   0,
  inputAIScore:     null,
  mode:             'standard',
  tone:             'neutral',
  outputLang:       'en',
  preserveFormat:   true,
  outputText:       '',
  outputWordCount:  0,
  outputAIScore:    null,
  readabilityScore: null,
  isProcessing:     false,
  isDetecting:      false,
  abortController:  null,
  streamBuffer:     '',
  history:          [],
  themeMode:        'dark',
  historyOpen:      false,
  chartInput:       null,
  chartOutput:      null,
};

var MAX_WORDS     = 10000;
var MAX_FILE_SIZE = 10 * 1024 * 1024;
var HISTORY_LIMIT = 10;

// ─── i18n helper ─────────────────────────────────────────────
function t(key) {
  return (window.__i18n__ && window.__i18n__[key]) || key;
}

// ─── Word counter (CJK aware) ─────────────────────────────────
function countWords(text) {
  if (!text || !text.trim()) return 0;
  var cjk = (text.match(/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g) || []).length;
  var en  = text.replace(/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g, ' ')
                .trim().split(/\s+/).filter(Boolean).length;
  return cjk + en;
}

function fmtWords(n) {
  return n + ' ' + (n === 1 ? 'word' : 'words');
}

// ─── XSS / escaping ──────────────────────────────────────────
function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function escRx(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// ─── Mode descriptions ───────────────────────────────────────
var MODE_DESC = {
  free:       function(){ return t('ah.mode.free.desc'); },
  standard:   function(){ return t('ah.mode.standard.desc'); },
  smart:      function(){ return t('ah.mode.smart.desc'); },
  easy:       function(){ return t('ah.mode.easy.desc'); },
  creative:   function(){ return t('ah.mode.creative.desc'); },
  academic:   function(){ return t('ah.mode.academic.desc'); },
  formal:     function(){ return t('ah.mode.formal.desc'); },
  casual:     function(){ return t('ah.mode.casual.desc'); },
  aggressive: function(){ return t('ah.mode.aggressive.desc'); },
  ultra:      function(){ return t('ah.mode.ultra.desc'); },
};

// ─── Public API ───────────────────────────────────────────────
var AIHumanizer = {

  // ── Init ──────────────────────────────────────────────────
  init: function() {
    // Restore theme — use unified 'tbn-theme' key (migrate legacy 'ah-theme')
    var savedTheme = localStorage.getItem('tbn-theme')
      || localStorage.getItem('ah-theme')
      || 'light';
    STATE.themeMode = savedTheme;
    // The FOUC script in base.html already set data-theme; just sync the local icon
    var sunIcon  = document.getElementById('ah-icon-sun');
    var moonIcon = document.getElementById('ah-icon-moon');
    if (sunIcon)  sunIcon.style.display  = savedTheme === 'dark' ? '' : 'none';
    if (moonIcon) moonIcon.style.display = savedTheme === 'dark' ? 'none' : '';

    // Restore output language
    var savedLang = localStorage.getItem('ah-lang') || window.__lang__ || 'en';
    STATE.outputLang = savedLang;
    var langSel = document.getElementById('ah-lang-sel');
    if (langSel) langSel.value = savedLang;

    // Load history
    loadHistory();

    // Cross-tool prefill: if navigated from AI Detector
    try {
      var prefill = sessionStorage.getItem('ah_prefill_text');
      if (prefill) {
        sessionStorage.removeItem('ah_prefill_text');
        var taP = document.getElementById('ah-input');
        if (taP) {
          taP.value = prefill;
          AIHumanizer.onInputChange({ target: taP });
        }
      }
    } catch(e) {}

    // Apply i18n to data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      var k = el.getAttribute('data-i18n');
      var v = t(k);
      if (v && v !== k) el.textContent = v;
    });

    // Apply i18n placeholder
    var ta = document.getElementById('ah-input');
    if (ta) ta.placeholder = t('ah.input.placeholder');

    // Set active mode button slider
    setModeSlider(STATE.mode);

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        AIHumanizer.closeSynonymPanel();
        AIHumanizer.closeHistory();
        closeDropdown();
      }
    });
    // Click outside closes menus
    document.addEventListener('click', function(e) {
      if (!e.target.closest('#ah-synonym-panel') && !e.target.closest('.ah-word--syn')) {
        AIHumanizer.closeSynonymPanel();
      }
      if (!e.target.closest('#ah-dl-dropdown') && !e.target.closest('[data-dl-toggle]')) {
        closeDropdown();
      }
    });
  },

  // ── Input change ─────────────────────────────────────────
  onInputChange: function(e) {
    STATE.inputText      = e.target.value;
    STATE.inputWordCount = countWords(STATE.inputText);
    var wcEl = document.getElementById('ah-input-wc');
    if (wcEl) wcEl.textContent = fmtWords(STATE.inputWordCount);
    if (STATE.inputWordCount > MAX_WORDS) {
      showToast(t('ah.error.too_long'), 'error');
    }
    if (STATE.inputAIScore !== null) {
      STATE.inputAIScore = null;
      updateScoreRing('input', null);
    }
  },

  // ── Mode select ──────────────────────────────────────────
  setMode: function(mode) {
    STATE.mode = mode;
    document.querySelectorAll('.ah-mode-btn').forEach(function(b) {
      b.classList.toggle('active', b.dataset.mode === mode);
    });
    var descEl = document.getElementById('ah-mode-desc');
    if (descEl) descEl.textContent = MODE_DESC[mode] ? MODE_DESC[mode]() : '';
    setModeSlider(mode);
  },

  // ── Drag-and-drop ────────────────────────────────────────
  onDragOver: function(e) {
    e.preventDefault();
    document.getElementById('ah-panel-input').classList.add('drag-over');
  },
  onDragLeave: function(e) {
    var panel = document.getElementById('ah-panel-input');
    if (!panel.contains(e.relatedTarget)) panel.classList.remove('drag-over');
  },
  onDrop: function(e) {
    e.preventDefault();
    document.getElementById('ah-panel-input').classList.remove('drag-over');
    var file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  },
  onFileSelect: function(e) {
    var file = e.target.files[0];
    if (file) parseFile(file);
    e.target.value = '';
  },

  // ── Tone / Lang / Options ────────────────────────────────
  onToneChange: function(e) { STATE.tone = e.target.value; },
  onLangChange: function(e) {
    STATE.outputLang = e.target.value;
    localStorage.setItem('ah-lang', STATE.outputLang);
  },
  onPreserveChange: function(e) { STATE.preserveFormat = e.target.checked; },

  // ── Main humanize ────────────────────────────────────────
  humanize: function(isRetry) {
    if (!STATE.inputText.trim()) {
      showToast(t('ah.error.empty_input'), 'error'); return;
    }
    if (STATE.isProcessing) return;

    STATE.isProcessing   = true;
    STATE.streamBuffer   = '';
    STATE._sseError      = false;  // reset error flag for each new run
    STATE.abortController = new AbortController();

    setBtnState('loading');
    showOutputStreaming();
    startProgressBar();
    var startTime = Date.now();

    var body = JSON.stringify({
      text:            STATE.inputText,
      mode:            STATE.mode,
      tone:            STATE.tone,
      output_lang:     STATE.outputLang,
      preserve_format: STATE.preserveFormat,
    });

    fetch('/api/ai/humanize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: STATE.abortController.signal,
      body: body,
    }).then(function(resp) {
      if (!resp.ok) {
        return resp.text().then(function(txt) {
          var msg = 'API error ' + resp.status;
          try { msg = JSON.parse(txt).message || msg; } catch(_) {}
          throw new Error(msg);
        });
      }
      // Read SSE stream
      var reader  = resp.body.getReader();
      var decoder = new TextDecoder('utf-8');
      var buf     = '';
      var done    = false; // Track if [DONE] was received

      function read() {
        reader.read().then(function(r) {
          if (r.done || done) {
            if (!done) finishHumanize(startTime);
            return;
          }
          buf += decoder.decode(r.value, { stream: true });
          var lines = buf.split('\n');
          buf = lines.pop(); // keep incomplete line
          lines.forEach(function(line) {
            // ⚠️ Critical: stop processing ANY lines after [DONE] is received
            // Without this guard, tokens after [DONE] in the same buffer chunk
            // would call renderStreamOutput('') and wipe the final output.
            if (done) return;

            // Track SSE event type
            if (line.startsWith('event:')) {
              if (line.indexOf('event: error') !== -1) {
                STATE._sseError = true;
              }
              return;
            }
            if (!line.startsWith('data: ')) return;
            var token = line.slice(6);
            if (token === '[DONE]') {
              done = true;
              finishHumanize(startTime);
              return;
            }
            // If we saw an error event, this data line contains the error message
            if (STATE._sseError) {
              try { var errMsg = JSON.parse(token); showToast(errMsg.msg || errMsg.message || 'Server error', 'error'); } catch(_) { showToast(token, 'error'); }
              resetProcessing();
              return;
            }
            // Unescape newlines the backend escapes as \\n
            token = token.replace(/\\n/g, '\n');
            STATE.streamBuffer += token;
            renderStreamOutput(STATE.streamBuffer);
            updateProgressBar(estimateProgress(STATE.streamBuffer.length, STATE.inputText.length));
          });
          if (!done) read();
        }).catch(function(err) {
          if (err.name !== 'AbortError') {
            showToast(t('ah.error.api_fail'), 'error');
            document.dispatchEvent(new CustomEvent('humanize:error', { detail: { message: err.message } }));
          }
          resetProcessing();
        });
      }
      read();

    }).catch(function(err) {
      if (err.name !== 'AbortError') {
        showToast(t('ah.error.api_fail'), 'error');
        document.dispatchEvent(new CustomEvent('humanize:error', { detail: { message: err.message } }));
      }
      resetProcessing();
    });
  },

  // ── Detect AI ────────────────────────────────────────────
  detectAI: function(panel) {
    panel = panel || 'input';
    var text = panel === 'input' ? STATE.inputText : STATE.outputText;
    if (!text.trim()) return;
    if (panel === 'input') {
      STATE.isDetecting = true;
      var btn = document.getElementById('ah-detect-btn');
      if (btn) { btn._orig = btn.innerHTML; btn.innerHTML = '<span class="ah-spin"></span>'; btn.disabled = true; }
    }
    fetch('/api/ai/detect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text }),
    }).then(function(r) { return r.json(); }).then(function(data) {
      // API returns { score: 0-100, verdict, ... } — use data.score directly
      var score = typeof data.score === 'number' ? data.score
                : Math.round((data.ai_score || 0) * 100); // legacy fallback
      if (panel === 'input') {
        STATE.inputAIScore = score;
        animateScoreRing('input', score);
      } else {
        STATE.outputAIScore = score;
        animateScoreRing('output', score);
        showImproveBadge();
      }
      document.dispatchEvent(new CustomEvent('detect:done', { detail: { score: score, panel: panel } }));
    }).catch(function() {
      showToast(t('ah.error.api_fail'), 'error');
    }).finally(function() {
      if (panel === 'input') {
        STATE.isDetecting = false;
        var btn = document.getElementById('ah-detect-btn');
        if (btn && btn._orig) { btn.innerHTML = btn._orig; btn.disabled = false; }
      }
    });
  },

  // ── Copy ─────────────────────────────────────────────────
  copyOutput: function() {
    if (!STATE.outputText) return;
    var write = navigator.clipboard
      ? navigator.clipboard.writeText(STATE.outputText)
      : Promise.resolve(legacyCopy(STATE.outputText));
    write.then(function() {
      showToast(t('ah.action.copy.done'), 'success');
      var btn = document.getElementById('ah-copy-btn');
      if (btn) { var orig = btn.textContent; btn.textContent = t('ah.action.copy.done'); setTimeout(function() { btn.textContent = orig; }, 1500); }
    }).catch(function() { showToast(t('ah.error.api_fail'), 'error'); });
  },

  // ── Download TXT ─────────────────────────────────────────
  downloadTxt: function() {
    if (!STATE.outputText) return;
    var blob = new Blob([STATE.outputText], { type: 'text/plain;charset=utf-8' });
    triggerDownload(URL.createObjectURL(blob), 'humanized.txt');
  },

  // ── Download DOCX ────────────────────────────────────────
  downloadDocx: function() {
    if (!STATE.outputText || typeof docx === 'undefined') {
      showToast('DOCX library not loaded', 'error'); return;
    }
    var paragraphs = STATE.outputText.split('\n').map(function(line) {
      return new docx.Paragraph({ children: [new docx.TextRun({ text: line, size: 24 })] });
    });
    var doc = new docx.Document({ sections: [{ children: paragraphs }] });
    docx.Packer.toBlob(doc).then(function(blob) {
      triggerDownload(URL.createObjectURL(blob), 'humanized.docx');
    });
  },

  // ── Clear ────────────────────────────────────────────────
  clearAll: function() {
    if (STATE.abortController) STATE.abortController.abort();
    STATE.inputText = ''; STATE.outputText = '';
    STATE.inputAIScore = null; STATE.outputAIScore = null;
    STATE.isProcessing = false; STATE.streamBuffer = '';
    if (STATE.chartInput)  { STATE.chartInput.destroy();  STATE.chartInput  = null; }
    if (STATE.chartOutput) { STATE.chartOutput.destroy(); STATE.chartOutput = null; }
    var ta = document.getElementById('ah-input');
    if (ta) ta.value = '';
    var wcEl = document.getElementById('ah-input-wc');
    if (wcEl) wcEl.textContent = fmtWords(0);
    showOutputEmpty();
    updateScoreRing('input',  null);
    updateScoreRing('output', null);
    hideImproveBadge();
    resetProcessing();
  },
  clearInput: function() {
    var ta = document.getElementById('ah-input');
    if (ta) { ta.value = ''; AIHumanizer.onInputChange({ target: ta }); }
  },

  // ── Theme ────────────────────────────────────────────────
  toggleTheme: function() {
    // Delegate to global applyTheme (base.html) for site-wide switching
    if (typeof window.applyTheme === 'function') {
      var cur = document.documentElement.getAttribute('data-theme') || 'light';
      window.applyTheme(cur === 'dark' ? 'light' : 'dark');
      return;
    }
    // Fallback: local toggle
    STATE.themeMode = STATE.themeMode === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', STATE.themeMode);
    localStorage.setItem('tbn-theme', STATE.themeMode);
    var sunIcon  = document.getElementById('ah-icon-sun');
    var moonIcon = document.getElementById('ah-icon-moon');
    if (sunIcon)  sunIcon.style.display  = STATE.themeMode === 'dark' ? '' : 'none';
    if (moonIcon) moonIcon.style.display = STATE.themeMode === 'dark' ? 'none' : '';
  },

  // ── History drawer ───────────────────────────────────────
  toggleHistory: function() {
    STATE.historyOpen = !STATE.historyOpen;
    var drawer  = document.getElementById('ah-history-drawer');
    var overlay = document.getElementById('ah-history-overlay');
    if (drawer)  drawer.classList.toggle('open', STATE.historyOpen);
    if (overlay) overlay.classList.toggle('visible', STATE.historyOpen);
  },
  closeHistory: function() {
    STATE.historyOpen = false;
    var drawer  = document.getElementById('ah-history-drawer');
    var overlay = document.getElementById('ah-history-overlay');
    if (drawer)  drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('visible');
  },
  clearHistory: function() {
    STATE.history = [];
    localStorage.removeItem('ah-history');
    renderHistoryList();
  },
  restoreHistory: function(id) {
    var item = STATE.history.find(function(h) { return h.id === id; });
    if (!item) return;
    var ta = document.getElementById('ah-input');
    if (ta) { ta.value = item.fullInput; AIHumanizer.onInputChange({ target: ta }); }
    if (item.output) {
      STATE.outputText = item.output;
      finalizeOutput();
    }
    AIHumanizer.closeHistory();
  },

  // ── Download dropdown ────────────────────────────────────
  toggleDownloadMenu: function() {
    var dd = document.getElementById('ah-dl-dropdown');
    if (dd) dd.classList.toggle('open');
  },

  // ── Synonym panel ────────────────────────────────────────
  closeSynonymPanel: function() {
    var p = document.getElementById('ah-synonym-panel');
    if (p) p.style.display = 'none';
  },
  applySynonym: function(original, replacement) {
    var rx = new RegExp('\\b' + escRx(original) + '\\b', 'i');
    STATE.outputText = STATE.outputText.replace(rx, replacement);
    renderFinalOutput(STATE.outputText);
    AIHumanizer.closeSynonymPanel();
    showToast('"' + original + '" → "' + replacement + '"', 'success', 2000);
  },

  // ── FAQ ──────────────────────────────────────────────────
  toggleFAQ: function(btn) {
    var item = btn.parentElement;
    var isOpen = item.classList.contains('open');
    document.querySelectorAll('.ah-faq-item').forEach(function(el) {
      el.classList.remove('open');
      el.querySelector('.ah-faq-q').setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) { item.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
  },

  // ── Cross-tool: send humanized text to AI Detector ───────
  goToDetector: function() {
    var text = STATE.outputText || '';
    if (!text.trim()) return;
    try {
      sessionStorage.setItem('aid_prefill_text', text);
    } catch(e) {}
    var lang = window.__lang__ || 'en';
    var url = '/ai/detector' + (lang && lang !== 'en' ? '?lang=' + lang : '');
    window.location.href = url;
  },
};

// ─── Internal helpers ─────────────────────────────────────────

function setModeSlider(mode) {
  var activeBtn = document.querySelector('.ah-mode-btn[data-mode="' + mode + '"]');
  var descEl    = document.getElementById('ah-mode-desc');
  if (descEl) descEl.textContent = MODE_DESC[mode] ? MODE_DESC[mode]() : '';
}

function showOutputEmpty() {
  el('ah-output-empty') && show(el('ah-output-empty'));
  el('ah-output-text')  && hide(el('ah-output-text'));
  el('ah-output-proc')  && hide(el('ah-output-proc'));
}
function showOutputStreaming() {
  el('ah-output-empty') && hide(el('ah-output-empty'));
  el('ah-output-proc')  && show(el('ah-output-proc'));
  el('ah-output-text')  && hide(el('ah-output-text'));
}
function renderStreamOutput(text) {
  var div = el('ah-output-text');
  if (!div) return;
  hide(el('ah-output-empty'));
  hide(el('ah-output-proc'));
  show(div);
  div.innerHTML = esc(text) + '<span class="ah-cursor"></span>';
  div.scrollTop = div.scrollHeight;
}
function finalizeOutput() {
  var div = el('ah-output-text');
  if (!div) return;
  hide(el('ah-output-empty'));
  hide(el('ah-output-proc'));
  show(div);
  renderFinalOutput(STATE.outputText);
  STATE.outputWordCount = countWords(STATE.outputText);
  var wcEl = el('ah-output-wc');
  if (wcEl) wcEl.textContent = fmtWords(STATE.outputWordCount);
  updateReadability(STATE.outputText);
  var btn = el('ah-humanize-again');
  if (btn) show(btn);
  // Show cross-tool button
  var detBtn = el('ah-goto-detector');
  if (detBtn) show(detBtn);
  div.scrollTop = 0;
}
function renderFinalOutput(text) {
  var div = el('ah-output-text');
  if (!div) return;
  var html = esc(text).replace(/\n/g, '<br>');
  // Wrap long English words with synonym capability
  html = html.replace(/\b([A-Za-z]{4,})\b/g, function(match) {
    return getSynonyms(match).length > 0
      ? '<span class="ah-word--syn" data-word="' + match + '">' + match + '</span>'
      : match;
  });
  div.innerHTML = html;
  // Bind synonym click
  div.querySelectorAll('.ah-word--syn').forEach(function(span) {
    span.addEventListener('click', function(e) {
      e.stopPropagation();
      var word = span.dataset.word;
      var syns = getSynonyms(word);
      if (syns.length) showSynonymPanel(e, word, syns);
    });
  });
}

function finishHumanize(startTime) {
  STATE.outputText   = STATE.streamBuffer;
  STATE.streamBuffer = '';
  finalizeOutput();
  finishProgressBar();
  // Auto-detect output score
  AIHumanizer.detectAI('output');
  saveHistory();
  var durationMs = Date.now() - startTime;
  document.dispatchEvent(new CustomEvent('humanize:done', {
    detail: { durationMs: durationMs, aiScoreAfter: STATE.outputAIScore }
  }));
  resetProcessing();
  showToast(t('ah.status.done'), 'success');
}
function resetProcessing() {
  STATE.isProcessing = false;
  setBtnState('idle');
}
function setBtnState(state) {
  var btn = el('ah-humanize-btn');
  if (!btn) return;
  if (state === 'loading') {
    btn.disabled = true;
    btn.innerHTML = '<span class="ah-spin"></span>';
  } else {
    btn.disabled = false;
    btn.innerHTML = '<span class="ah-btn-humanize__icon">🧬</span>' + t('ah.action.humanize');
  }
}

// ─── Score Ring (Chart.js) ─────────────────────────────────────
function getScoreColor(score) {
  if (score > 70) return '#ef4444';
  if (score > 40) return '#f59e0b';
  return '#22c55e';
}
function updateScoreRing(panel, score) {
  var valueId = 'ah-score-' + panel + '-val';
  var valEl   = el(valueId);
  if (!valEl) return;
  valEl.textContent = score === null ? '—' : score + '%';
}
function animateScoreRing(panel, score) {
  var canvasId = 'ah-chart-' + panel;
  var chartKey = panel === 'input' ? 'chartInput' : 'chartOutput';
  var canvas   = el(canvasId);
  if (!canvas || typeof Chart === 'undefined') {
    updateScoreRing(panel, score); return;
  }
  var color = getScoreColor(score);
  if (STATE[chartKey]) STATE[chartKey].destroy();
  var ctx = canvas.getContext('2d');
  STATE[chartKey] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [score, 100 - score],
        backgroundColor: [color, 'rgba(255,255,255,0.05)'],
        borderWidth: 0, borderRadius: 3,
      }]
    },
    options: {
      cutout: '72%',
      animation: { duration: 1200, easing: 'easeInOutQuart' },
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
    }
  });
  animNumber(el('ah-score-' + panel + '-val'), 0, score, 1200, '%');
}
function animNumber(el, from, to, dur, suffix) {
  if (!el) return;
  var start = performance.now();
  function step(now) {
    var p = Math.min((now - start) / dur, 1);
    var v = Math.round(from + (to - from) * easeInOut(p));
    el.textContent = v + (suffix || '');
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
function easeInOut(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }

function showImproveBadge() {
  if (STATE.inputAIScore === null || STATE.outputAIScore === null) return;
  var diff  = STATE.inputAIScore - STATE.outputAIScore;
  var badge = el('ah-improve');
  var textEl = el('ah-improve-text');
  if (!badge || !textEl) return;
  textEl.textContent = (diff > 0 ? '↓ -' : '↑ +') + Math.abs(diff) + '% AI';
  badge.className = 'ah-improve ah-improve--' + (diff > 0 ? 'good' : 'bad');
  show(badge);
}
function hideImproveBadge() {
  var badge = el('ah-improve');
  if (badge) hide(badge);
}

// ─── Readability (Flesch-Kincaid approx) ─────────────────────
function fleschKincaid(text) {
  var sentences = (text.match(/[.!?]+/g) || []).length || 1;
  var words     = text.trim().split(/\s+/).filter(Boolean).length || 1;
  var syllables = countSyllables(text);
  var score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
  return Math.max(0, Math.min(100, Math.round(score)));
}
function countSyllables(text) {
  return text.toLowerCase().replace(/[^a-z]/g,'')
    .replace(/[^aeiou]/g,'').length || 1;
}
function readabilityGrade(score) {
  if (score >= 90) return { label:'Very Easy', color:'#22c55e' };
  if (score >= 70) return { label:'Easy',      color:'#84cc16' };
  if (score >= 60) return { label:'Standard',  color:'#f59e0b' };
  if (score >= 50) return { label:'Fairly Diff',color:'#f97316'};
  return               { label:'Difficult',   color:'#ef4444' };
}
function updateReadability(text) {
  var score = fleschKincaid(text);
  STATE.readabilityScore = score;
  var g   = readabilityGrade(score);
  var rdEl = el('ah-readability');
  var valEl = el('ah-readability-val');
  if (!rdEl || !valEl) return;
  valEl.textContent  = g.label;
  valEl.style.color  = g.color;
  show(rdEl);
}

// ─── File parsing ─────────────────────────────────────────────
function parseFile(file) {
  if (file.size > MAX_FILE_SIZE) {
    showToast(t('ah.error.file_too_large'), 'error'); return;
  }
  var ext = file.name.split('.').pop().toLowerCase();
  if (ext === 'txt') {
    file.text().then(fillInput).catch(function() { showToast(t('ah.error.api_fail'), 'error'); });
  } else if (ext === 'pdf') {
    if (typeof pdfjsLib === 'undefined') { showToast('PDF.js not loaded', 'error'); return; }
    file.arrayBuffer().then(function(buf) {
      return pdfjsLib.getDocument({ data: buf }).promise;
    }).then(function(pdf) {
      var pages = [];
      for (var i = 1; i <= pdf.numPages; i++) pages.push(i);
      return Promise.all(pages.map(function(n) {
        return pdf.getPage(n).then(function(page) {
          return page.getTextContent().then(function(c) {
            return c.items.map(function(it) { return it.str; }).join(' ');
          });
        });
      }));
    }).then(function(texts) { fillInput(texts.join('\n').trim()); })
      .catch(function() { showToast(t('ah.error.api_fail'), 'error'); });
  } else if (ext === 'docx') {
    if (typeof mammoth === 'undefined') { showToast('mammoth.js not loaded', 'error'); return; }
    file.arrayBuffer().then(function(buf) {
      return mammoth.extractRawText({ arrayBuffer: buf });
    }).then(function(r) { fillInput(r.value.trim()); })
      .catch(function() { showToast(t('ah.error.api_fail'), 'error'); });
  } else {
    showToast(t('ah.error.unsupported_format'), 'error');
  }
}
function fillInput(text) {
  var ta = document.getElementById('ah-input');
  if (!ta) return;
  ta.value = text;
  AIHumanizer.onInputChange({ target: ta });
  showToast('File loaded ✓', 'success');
}

// ─── Progress bar ─────────────────────────────────────────────
var _progInterval = null;
function startProgressBar() {
  var bar = el('ah-progress'); var fill = el('ah-progress-fill');
  if (!bar || !fill) return;
  show(bar); fill.style.width = '0%';
  var progress = 0;
  _progInterval = setInterval(function() {
    progress += Math.random() * 3;
    if (progress >= 85) { clearInterval(_progInterval); progress = 85; }
    fill.style.width = progress + '%';
  }, 200);
}
function finishProgressBar() {
  clearInterval(_progInterval);
  var bar = el('ah-progress'); var fill = el('ah-progress-fill');
  if (!bar || !fill) return;
  fill.style.width = '100%';
  setTimeout(function() { hide(bar); fill.style.width = '0%'; }, 600);
}
function updateProgressBar(pct) {
  var fill = el('ah-progress-fill');
  if (fill) fill.style.width = Math.min(pct, 84) + '%';
}
function estimateProgress(outputLen, inputLen) {
  return inputLen > 0 ? Math.round((outputLen / inputLen) * 80) : 0;
}

// ─── History ──────────────────────────────────────────────────
function saveHistory() {
  var item = {
    id:        Date.now(),
    mode:      STATE.mode,
    inputText: STATE.inputText.slice(0, 200) + (STATE.inputText.length > 200 ? '…' : ''),
    fullInput: STATE.inputText,
    output:    STATE.outputText,
    scoreBefore: STATE.inputAIScore,
    scoreAfter:  STATE.outputAIScore,
    createdAt: new Date().toISOString(),
  };
  STATE.history.unshift(item);
  if (STATE.history.length > HISTORY_LIMIT) STATE.history.pop();
  localStorage.setItem('ah-history', JSON.stringify(STATE.history));
  renderHistoryList();
}
function loadHistory() {
  try {
    STATE.history = JSON.parse(localStorage.getItem('ah-history') || '[]');
  } catch(_) { STATE.history = []; }
  renderHistoryList();
}
function renderHistoryList() {
  var list = el('ah-history-list');
  if (!list) return;
  if (!STATE.history.length) {
    list.innerHTML = '<li class="ah-history-empty">' + esc(t('ah.history.empty')) + '</li>'; return;
  }
  list.innerHTML = STATE.history.map(function(item) {
    var scoreStr = (item.scoreBefore !== null && item.scoreAfter !== null)
      ? item.scoreBefore + '% → ' + item.scoreAfter + '%' : '';
    return '<li class="ah-history-item">'
      + '<div class="ah-history-item__meta">'
      + '<span class="ah-history-item__mode">' + esc(item.mode) + '</span>'
      + '<span class="ah-history-item__time">' + timeAgo(item.createdAt) + '</span>'
      + (scoreStr ? '<span class="ah-history-item__score">' + esc(scoreStr) + '</span>' : '')
      + '</div>'
      + '<p class="ah-history-item__preview">' + esc(item.inputText) + '</p>'
      + '<button class="ah-btn ah-btn--ghost ah-btn--sm" onclick="AIHumanizer.restoreHistory(' + item.id + ')">'
      + esc(t('ah.history.restore')) + '</button>'
      + '</li>';
  }).join('');
}
function timeAgo(iso) {
  var diff = Date.now() - new Date(iso).getTime();
  var m = Math.round(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return m + 'm ago';
  var h = Math.round(m / 60);
  if (h < 24) return h + 'h ago';
  return Math.round(h / 24) + 'd ago';
}

// ─── Synonym panel ────────────────────────────────────────────
var SYNONYM_MAP = {
  'utilize':['use','employ','apply','leverage'],
  'implement':['carry out','execute','apply','introduce'],
  'facilitate':['help','support','enable','assist'],
  'demonstrate':['show','prove','display','reveal'],
  'significant':['important','major','key','substantial'],
  'comprehensive':['thorough','complete','detailed','full'],
  'leverage':['use','apply','employ','tap'],
  'innovative':['new','fresh','creative','original'],
  'streamline':['simplify','improve','optimize','refine'],
  'paramount':['crucial','vital','essential','critical'],
  'delve':['explore','examine','investigate','look into'],
  'nuanced':['subtle','complex','layered','refined'],
  'robust':['strong','solid','reliable','powerful'],
  'seamlessly':['smoothly','easily','effortlessly'],
  'intricate':['complex','detailed','elaborate','involved'],
  'commendable':['praiseworthy','admirable','notable'],
  'pivotal':['key','central','crucial','critical'],
  'tailor':['customize','adapt','adjust','modify'],
  'foster':['promote','encourage','support','nurture'],
  'harness':['use','employ','leverage','tap into'],
};
function getSynonyms(word) {
  return SYNONYM_MAP[(word || '').toLowerCase().replace(/[.,!?;:'"]/g,'')] || [];
}
function showSynonymPanel(e, word, synonyms) {
  var panel = el('ah-synonym-panel');
  if (!panel) return;
  var wordEl = el('ah-synonym-word');
  var listEl = el('ah-synonym-list');
  if (wordEl) wordEl.textContent = word;
  if (listEl) listEl.innerHTML = synonyms.map(function(s) {
    return '<div class="ah-synonym-item" onclick="AIHumanizer.applySynonym(\'' + esc(word) + '\',\'' + esc(s) + '\')">' + esc(s) + '</div>';
  }).join('');
  var rect = e.target.getBoundingClientRect();
  var x = rect.left + window.scrollX;
  var y = rect.bottom + window.scrollY + 6;
  if (x + 220 > window.innerWidth - 16) x = window.innerWidth - 236;
  panel.style.left = x + 'px';
  panel.style.top  = y + 'px';
  panel.style.display = 'block';
}

// ─── Toast ────────────────────────────────────────────────────
function showToast(msg, type, dur) {
  dur = dur || 3200;
  var container = el('ah-toast-container');
  if (!container) return;
  var t = document.createElement('div');
  t.className = 'ah-toast ah-toast--' + (type || 'info');
  t.textContent = msg;
  container.appendChild(t);
  requestAnimationFrame(function() { t.classList.add('show'); });
  setTimeout(function() {
    t.classList.remove('show');
    t.addEventListener('transitionend', function() { if (t.parentNode) t.parentNode.removeChild(t); }, { once: true });
  }, dur);
}

// ─── Utilities ────────────────────────────────────────────────
function el(id) { return document.getElementById(id); }
function show(e) { if (e) e.style.display = ''; }
function hide(e) { if (e) e.style.display = 'none'; }
function closeDropdown() {
  var dd = el('ah-dl-dropdown');
  if (dd) dd.classList.remove('open');
}
function triggerDownload(url, name) {
  var a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(function() { URL.revokeObjectURL(url); }, 5000);
}
function legacyCopy(text) {
  var ta = document.createElement('textarea');
  ta.value = text; ta.style.cssText = 'position:fixed;left:-9999px';
  document.body.appendChild(ta); ta.select();
  document.execCommand('copy'); document.body.removeChild(ta);
}

// Expose global
window.AIHumanizer = AIHumanizer;

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', AIHumanizer.init.bind(AIHumanizer));
} else {
  AIHumanizer.init();
}

})();

