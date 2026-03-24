/**
 * AI Detector Frontend Engine
 * Namespace: AID (AI Detector)
 */
(function () {
  'use strict';

  const I18N = window.__AID_I18N__ || {};
  const CFG  = window.__AID_CONFIG__ || { freeLimit: 15000, lang: 'en' };

  function t(key, vars) {
    let text = I18N[key] || key;
    if (vars) Object.entries(vars).forEach(([k,v]) => { text = text.replace('{' + k + '}', v); });
    return text;
  }

  // ─── State ───────────────────────────────────────────────
  const State = {
    inputMode: 'text',
    inputText: '',
    isDetecting: false,
    isHumanizing: false,
    detectResult: null,
    humanizeResult: null,
    activeCompareTab: 'humanized',
    purpose: 'general',
    tone: 'standard',
    mode: 'balanced',
    language: 'auto',
    gaugeChart: null,
    history: [],
  };

  // ─── DOM helpers ──────────────────────────────────────────
  function $id(id) { return document.getElementById(id); }
  function esc(str) {
    return String(str)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;');
  }

  // ─── Input Handling ───────────────────────────────────────
  function handleTextInput(el) {
    const text = el.value;
    State.inputText = text;
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const counter = $id('aidCharCounter');
    const clearBtn = $id('aidClearBtn');
    const detectBtn = $id('aidDetectBtn');

    counter.textContent = chars + ' / 15,000';
    $id('aidWordCounter').textContent = words + ' words';
    counter.classList.toggle('aid-counter--error', chars > CFG.freeLimit);
    clearBtn.style.display = chars > 0 ? 'flex' : 'none';
    detectBtn.disabled = chars < 50 || chars > CFG.freeLimit;
  }

  function setInputMode(mode) {
    State.inputMode = mode;
    ['text','file','url'].forEach(m => {
      const el = $id('aidMode-' + m);
      if (el) el.style.display = m === mode ? 'flex' : 'none';
    });
    document.querySelectorAll('.aid-input-tab').forEach(btn => {
      btn.classList.toggle('aid-input-tab--active', btn.dataset.tab === mode);
    });
  }

  function clearInput() {
    State.inputText = '';
    State.detectResult = null;
    State.humanizeResult = null;
    const ta = $id('aidInputText');
    if (ta) ta.value = '';
    handleTextInput(ta || { value: '' });
    $id('aidHumanizeBtn').style.display = 'none';
    $id('aidEmpty').style.display = 'flex';
    $id('aidResult').style.display = 'none';
    $id('aidCompare').style.display = 'none';
  }

  function loadSample() {
    const SAMPLES = [
      'Artificial intelligence has transformed the landscape of modern technology in unprecedented ways. The development of large language models has enabled machines to engage in complex reasoning tasks that were previously thought to require human intelligence. These systems demonstrate remarkable capabilities in natural language understanding, code generation, and creative problem-solving. Furthermore, they have significant implications for various industries and sectors of society.',
      'Space exploration represents one of humanity\'s most ambitious endeavors. Since the first Moon landing in 1969, scientists and engineers have continued pushing the boundaries of what is possible in aerospace technology. The prospect of establishing permanent settlements on Mars has become increasingly realistic as private companies invest billions of dollars in rocket development. Additionally, international cooperation has played a crucial role in advancing space science.'
    ];
    const sample = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
    const ta = $id('aidInputText');
    ta.value = sample;
    State.inputText = sample;
    handleTextInput(ta);
    if (typeof gsap !== 'undefined') gsap.from(ta, { opacity: 0.5, duration: 0.3 });
  }

  // ─── Drag & Drop ─────────────────────────────────────────
  function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    const zone = $id('aidDropZone');
    zone.classList.add('aid-drop-zone--active');
    const overlay = $id('aidDropOverlay');
    overlay.style.display = 'flex';
  }

  function handleDragLeave(event) {
    const zone = $id('aidDropZone');
    if (!zone.contains(event.relatedTarget)) {
      zone.classList.remove('aid-drop-zone--active');
      $id('aidDropOverlay').style.display = 'none';
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    handleDragLeave(event);
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      addFiles(files);
    } else if (event.dataTransfer.types.includes('text/plain')) {
      const text = event.dataTransfer.getData('text/plain');
      const ta = $id('aidInputText');
      ta.value = text;
      State.inputText = text;
      handleTextInput(ta);
    }
  }

  function handleFileDragOver(event) { event.preventDefault(); $id('aidFileZone').style.borderColor = 'var(--aid-primary)'; }
  function handleFileDragLeave(event) { $id('aidFileZone').style.borderColor = ''; }
  function handleFileDrop(event) {
    event.preventDefault();
    handleFileDragLeave(event);
    addFiles(event.dataTransfer.files);
  }

  function handleFileSelect(input) {
    if (input.files.length > 0) addFiles(input.files);
  }

  function addFiles(fileList) {
    const MAX_SIZE = 10 * 1024 * 1024;
    const file = fileList[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    const allowedExts = ['txt', 'pdf', 'docx'];
    if (!allowedExts.includes(ext)) {
      showToast('Only .txt, .pdf, .docx files are supported.', 'error');
      return;
    }
    if (file.size > MAX_SIZE) {
      showToast('File size exceeds 10MB limit.', 'error');
      return;
    }

    if (ext === 'docx' && typeof mammoth !== 'undefined') {
      const reader = new FileReader();
      reader.onload = e => {
        mammoth.extractRawText({ arrayBuffer: e.target.result }).then(result => {
          const text = result.value;
          setInputMode('text');
          const ta = $id('aidInputText');
          ta.value = text;
          State.inputText = text;
          handleTextInput(ta);
          showToast('DOCX text extracted successfully!', 'success');
        }).catch(() => {
          showToast('Could not read DOCX. Please copy and paste text.', 'error');
        });
      };
      reader.readAsArrayBuffer(file);
      return;
    }

    if (ext === 'pdf') {
      showToast('PDF not supported. Please copy and paste text.', 'error');
      return;
    }

    // TXT
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target.result;
      setInputMode('text');
      const ta = $id('aidInputText');
      ta.value = text;
      State.inputText = text;
      handleTextInput(ta);
    };
    reader.readAsText(file);
  }

  function removeFile() {
    State.inputText = '';
    $id('aidFileInput').value = '';
    $id('aidFileInfo').style.display = 'none';
    $id('aidDetectBtn').disabled = true;
  }

  // ─── URL Fetch ────────────────────────────────────────────
  async function fetchURL() {
    const url = $id('aidUrlInput').value.trim();
    if (!url.startsWith('http')) { showToast('Please enter a valid URL', 'error'); return; }
    try {
      const res = await fetch('/api/ai/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (data.text) {
        const ta = $id('aidInputText');
        ta.value = data.text;
        State.inputText = data.text;
        handleTextInput(ta);
        setInputMode('text');
      }
    } catch (e) {
      showToast(t('error.network'), 'error');
    }
  }

  // ─── Options ─────────────────────────────────────────────
  function toggleOptions() {
    const body = $id('aidOptionsBody');
    const chevron = $id('aidOptionsChevron');
    const isOpen = body.style.display !== 'none';
    if (typeof gsap !== 'undefined') {
      if (isOpen) {
        gsap.to(body, { height: 0, opacity: 0, duration: 0.25, onComplete: () => { body.style.display = 'none'; } });
        gsap.to(chevron, { rotation: 0, duration: 0.25 });
      } else {
        body.style.display = 'flex';
        body.style.height = '0px';
        gsap.to(body, { height: 'auto', opacity: 1, duration: 0.25 });
        gsap.to(chevron, { rotation: 180, duration: 0.25 });
      }
    } else {
      body.style.display = isOpen ? 'none' : 'flex';
      chevron.style.transform = isOpen ? '' : 'rotate(180deg)';
    }
  }

  // ─── Detect ───────────────────────────────────────────────
  async function startDetect(isRecheck) {
    if (State.isDetecting) return;
    const text = State.inputText.trim();
    if (text.length < 50) { showToast(t('error.too_short'), 'error'); return; }
    if (text.length > CFG.freeLimit) { showToast(t('error.too_long'), 'error'); return; }

    State.isDetecting = true;
    const _detectStart = Date.now();
    setDetectBtnState('loading');

    try {
      const res = await fetch('/api/ai/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: State.language })
      });

      if (!res.ok) throw new Error(res.status === 429 ? 'rate_limit' : 'api_failed');
      const result = await res.json();
      State.detectResult = result;

      renderDetectionResults(result);
      if (!isRecheck) showHumanizeButton();
      saveHistory({ text: text.slice(0, 200), score: result.score, verdict: result.verdict });
      showToast(t('toast.detect_success'), 'success');

      // GA event
      document.dispatchEvent(new CustomEvent('detect:done', { detail: {
        score: result.score,
        language: result.language || 'auto',
        charCount: text.length,
        durationMs: Date.now() - _detectStart
      }}));

    } catch (err) {
      showToast(t('error.api_failed'), 'error');
    } finally {
      State.isDetecting = false;
      setDetectBtnState('idle');
    }
  }

  function setDetectBtnState(state) {
    const btn = $id('aidDetectBtn');
    const txt = $id('aidDetectBtnText');
    const spin = $id('aidDetectSpinner');
    if (state === 'loading') {
      btn.disabled = true;
      txt.textContent = t('btn.detecting');
      spin.style.display = 'inline-flex';
    } else {
      btn.disabled = State.inputText.length < 50;
      txt.textContent = t('btn.detect');
      spin.style.display = 'none';
    }
  }

  function showHumanizeButton() {
    const btn = $id('aidHumanizeBtn');
    btn.style.display = 'flex';
  }

  // ─── Humanize ─────────────────────────────────────────────
  async function startHumanize() {
    if (State.isHumanizing) return;
    const text = State.inputText.trim();
    State.isHumanizing = true;
    const _humanizeStart = Date.now();
    setHumanizeBtnState('loading');

    try {
      const res = await fetch('/api/ai/humanize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          purpose: State.purpose,
          tone: State.tone,
          mode: State.mode,
          language: State.language
        })
      });

      if (!res.ok) throw new Error('api_failed');
      const result = await res.json();
      State.humanizeResult = result;

      renderCompare(text, result.humanized_text || result.humanizedText || '');
      State.inputText = result.humanized_text || result.humanizedText || text;
      await startDetect(true);
      showToast(t('toast.humanize_success'), 'success');

      // GA event
      document.dispatchEvent(new CustomEvent('humanize:done', { detail: {
        purpose: State.purpose,
        tone: State.tone,
        mode: State.mode,
        wordsChanged: result.words_changed || 0,
        durationMs: Date.now() - _humanizeStart
      }}));

    } catch (err) {
      showToast(t('error.api_failed'), 'error');
    } finally {
      State.isHumanizing = false;
      setHumanizeBtnState('idle');
    }
  }

  function setHumanizeBtnState(state) {
    const btn = $id('aidHumanizeBtn');
    const txt = $id('aidHumanizeBtnText');
    const spin = $id('aidHumanizeSpinner');
    if (state === 'loading') {
      btn.disabled = true;
      txt.textContent = t('btn.humanizing');
      spin.style.display = 'inline-flex';
    } else {
      btn.disabled = false;
      txt.textContent = t('btn.rehumanize');
      spin.style.display = 'none';
    }
  }

  // ─── Render Results ───────────────────────────────────────
  function renderDetectionResults(result) {
    $id('aidEmpty').style.display = 'none';
    $id('aidResult').style.display = 'flex';

    updateGauge(result.score, result.verdict);
    renderDetectorScores(result.detectors || {});
    renderHighlightedText(result.sentences || []);

    $id('aidReadability').textContent = (result.readability && result.readability.grade) ? result.readability.grade : '--';
    $id('aidWordCountResult').textContent = result.word_count || '--';
    $id('aidLangResult').textContent = (result.language || '--').toUpperCase();

    if (typeof gsap !== 'undefined') {
      gsap.from('#aidResult', { opacity: 0, y: 20, duration: 0.4, ease: 'power2.out' });
    }
  }

  function updateGauge(score, verdict) {
    const color = score <= 15 ? '#10B981'
                : score <= 45 ? '#3DD68C'
                : score <= 70 ? '#F59E0B'
                :               '#EF4444';
    const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--aid-border').trim() || '#E5E3FF';

    const data = {
      datasets: [{
        data: [score, 100 - score],
        backgroundColor: [color, borderColor],
        borderWidth: 0,
        circumference: 180,
        rotation: 270,
      }]
    };

    if (!State.gaugeChart) {
      State.gaugeChart = new Chart($id('aidGaugeChart'), {
        type: 'doughnut',
        data,
        options: {
          plugins: { tooltip: { enabled: false }, legend: { display: false } },
          cutout: '72%',
          animation: { duration: 800 }
        }
      });
    } else {
      State.gaugeChart.data = data;
      State.gaugeChart.update('active');
    }

    // CountUp animation
    if (typeof CountUp !== 'undefined') {
      new CountUp.CountUp('aidGaugeScore', score, { duration: 1.2, suffix: '' }).start();
    } else {
      $id('aidGaugeScore').textContent = score + '%';
    }

    // Verdict
    const verdictMap = {
      human: 'verdict.human',
      mixed: 'verdict.mixed',
      ai: 'verdict.ai'
    };
    const v = verdict || (score <= 45 ? 'human' : score <= 70 ? 'mixed' : 'ai');
    const confidence = (State.detectResult && State.detectResult.confidence) ? State.detectResult.confidence : 90;
    $id('aidVerdict').innerHTML = `
      <span class="aid-verdict-badge aid-verdict-badge--${v}">${t(verdictMap[v] || 'verdict.mixed')}</span>
      <span class="aid-confidence-text">${t('result.confidence', { pct: confidence })}</span>
    `;
  }

  function renderDetectorScores(detectors) {
    const list = $id('aidDetectorList');
    const ORDER = ['gptzero','turnitin','copyleaks','zerogpt','writer','sapling','originality','winston'];
    const html = ORDER.map(key => {
      const score = detectors[key] !== undefined ? detectors[key] : 0;
      const color = score <= 30 ? 'var(--aid-success)' : score <= 60 ? 'var(--aid-warning)' : 'var(--aid-danger)';
      return `
        <div class="aid-detector-item">
          <span class="aid-detector-name">${t('detector.' + key)}</span>
          <div class="aid-detector-bar-track">
            <div class="aid-detector-bar" style="background:${color}" data-target="${score}"></div>
          </div>
          <span class="aid-detector-score" data-target="${score}">0%</span>
        </div>`;
    }).join('');
    list.innerHTML = html;

    // Stagger animation
    requestAnimationFrame(() => {
      list.querySelectorAll('.aid-detector-bar').forEach((bar, i) => {
        const target = parseInt(bar.dataset.target);
        setTimeout(() => {
          bar.style.width = target + '%';
          const scoreEl = bar.closest('.aid-detector-item').querySelector('.aid-detector-score');
          if (typeof CountUp !== 'undefined') {
            new CountUp.CountUp(scoreEl, target, { duration: 0.8, suffix: '%' }).start();
          } else {
            scoreEl.textContent = target + '%';
          }
        }, i * 80);
      });
    });
  }

  function renderHighlightedText(sentences) {
    const container = $id('aidHighlightText');
    if (!sentences || sentences.length === 0) {
      container.textContent = State.inputText;
      $id('aidHighlightFooter').textContent = '';
      return;
    }
    container.innerHTML = sentences.map(s => {
      const cls = 'sentence sentence--' + (s.type || 'human');
      const opacity = s.type === 'ai' ? Math.max(0.15, (s.score || 50) / 100 * 0.5)
                    : s.type === 'mixed' ? 0.25 : 0.12;
      const rgb = s.type === 'ai' ? '239,68,68' : s.type === 'mixed' ? '245,158,11' : '16,185,129';
      return `<span class="${cls}" style="background:rgba(${rgb},${opacity})" title="AI: ${Math.round(s.score || 0)}%">${esc(s.text)} </span>`;
    }).join('');
    $id('aidHighlightFooter').textContent = t('result.sentences', { count: sentences.length });
  }

  // ─── Compare ──────────────────────────────────────────────
  function renderCompare(originalText, humanizedText) {
    const compareSection = $id('aidCompare');
    compareSection.style.display = 'block';

    if (typeof diff_match_patch !== 'undefined') {
      const dmp = new diff_match_patch();
      const diffs = dmp.diff_main(originalText, humanizedText);
      dmp.diff_cleanupSemantic(diffs);

      let added = 0, removed = 0;
      const diffHtml = diffs.map(([op, text]) => {
        const escaped = esc(text);
        if (op === 1)  { added   += text.split(/\s+/).length; return `<ins class="diff-ins">${escaped}</ins>`; }
        if (op === -1) { removed += text.split(/\s+/).length; return `<del class="diff-del">${escaped}</del>`; }
        return escaped;
      }).join('');

      $id('aidCompareStats').innerHTML = `
        <span class="aid-stat-pill aid-stat-pill--green">+${added} words</span>
        <span class="aid-stat-pill aid-stat-pill--red">-${removed} words</span>
      `;

      const body = $id('aidCompareBody');
      body.dataset.humanized = humanizedText;
      body.dataset.diff = diffHtml;
    } else {
      const body = $id('aidCompareBody');
      body.dataset.humanized = humanizedText;
      body.dataset.diff = esc(humanizedText);
    }

    showCompareTab(State.activeCompareTab);

    if (typeof gsap !== 'undefined') {
      gsap.from('#aidCompare', { opacity: 0, y: 16, duration: 0.4 });
    }
  }

  function showCompareTab(tab) {
    State.activeCompareTab = tab;
    const body = $id('aidCompareBody');
    if (tab === 'humanized') {
      body.innerHTML = `<div class="aid-compare-text">${esc(body.dataset.humanized || '')}</div>`;
    } else {
      body.innerHTML = `<div class="aid-compare-text diff-view">${body.dataset.diff || ''}</div>`;
    }
    document.querySelectorAll('.aid-compare-tab').forEach(t => {
      t.classList.toggle('aid-compare-tab--active', t.dataset.tab === tab);
    });
  }

  // ─── Download / Copy ─────────────────────────────────────
  function copyHumanized() {
    const text = (State.humanizeResult && (State.humanizeResult.humanized_text || State.humanizeResult.humanizedText)) || State.inputText;
    navigator.clipboard.writeText(text).then(() => {
      showToast(t('toast.copy_success'), 'success');
    }).catch(() => {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast(t('toast.copy_success'), 'success');
    });
  }

  function downloadTxt() {
    const text = (State.humanizeResult && (State.humanizeResult.humanized_text || State.humanizeResult.humanizedText)) || State.inputText;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'humanized-text.txt';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // ─── History ─────────────────────────────────────────────
  const HISTORY_KEY = 'aid-history';
  const MAX_HISTORY = 20;

  function loadHistory() {
    try { State.history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { State.history = []; }
  }

  function saveHistory(entry) {
    loadHistory();
    State.history.unshift({
      id: Date.now(),
      preview: entry.text.slice(0, 80) + (entry.text.length > 80 ? '…' : ''),
      score: entry.score,
      verdict: entry.verdict,
      timestamp: Date.now()
    });
    State.history = State.history.slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(State.history));
    renderHistory();
  }

  function renderHistory() {
    loadHistory();
    const list = $id('aidHistoryList');
    if (!State.history.length) {
      list.innerHTML = `<p class="aid-history__empty">${t('history.empty')}</p>`;
      return;
    }
    list.innerHTML = State.history.map(item => {
      const v = item.verdict || 'mixed';
      return `
        <div class="aid-history-item">
          <span class="aid-history-item__text">${esc(item.preview)}</span>
          <div class="aid-history-item__meta">
            <span class="aid-history-score aid-verdict-badge--${v}">${item.score}%</span>
            <span class="aid-history-time">${formatTime(item.timestamp)}</span>
          </div>
        </div>`;
    }).join('');
  }

  function clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
    State.history = [];
    renderHistory();
  }

  function formatTime(ts) {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    return new Date(ts).toLocaleDateString();
  }

  // ─── FAQ Accordion ────────────────────────────────────────
  function toggleFAQ(index) {
    const item = $id('faq-' + index);
    const answer = $id('faq-answer-' + index);
    const isOpen = item.classList.contains('aid-faq-item--open');

    // close all
    document.querySelectorAll('.aid-faq-item--open').forEach(el => {
      el.classList.remove('aid-faq-item--open');
      el.querySelector('.aid-faq-answer').style.maxHeight = '0';
      el.querySelector('.aid-faq-question').setAttribute('aria-expanded', 'false');
    });

    if (!isOpen) {
      item.classList.add('aid-faq-item--open');
      answer.style.maxHeight = answer.scrollHeight + 'px';
      item.querySelector('.aid-faq-question').setAttribute('aria-expanded', 'true');
    }
  }

  // ─── Theme ───────────────────────────────────────────────
  function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('aid-theme', newTheme);
    const icon = $id('aidThemeIcon');
    if (icon) icon.className = newTheme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    // Refresh gauge colors if visible
    if (State.detectResult && State.gaugeChart) {
      updateGauge(State.detectResult.score, State.detectResult.verdict);
    }
  }

  function initTheme() {
    const saved = localStorage.getItem('aid-theme')
      || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      const icon = $id('aidThemeIcon');
      if (icon) icon.className = 'fa-solid fa-sun';
    }
  }

  // ─── Toast ───────────────────────────────────────────────
  function showToast(msg, type) {
    type = type || 'info';
    const container = $id('aidToastContainer');
    const toast = document.createElement('div');
    toast.className = 'aid-toast aid-toast--' + type;
    const iconMap = { success: 'fa-check-circle', error: 'fa-circle-xmark', info: 'fa-circle-info' };
    toast.innerHTML = `<i class="fa-solid ${iconMap[type] || 'fa-circle-info'}"></i><span>${msg}</span>`;
    container.appendChild(toast);

    if (typeof gsap !== 'undefined') {
      gsap.from(toast, { x: 100, opacity: 0, duration: 0.3 });
      setTimeout(() => {
        gsap.to(toast, { x: 100, opacity: 0, duration: 0.3, onComplete: () => toast.remove() });
      }, 3000);
    } else {
      setTimeout(() => toast.remove(), 3000);
    }
  }

  // ─── Init ─────────────────────────────────────────────────
  function init() {
    initTheme();
    loadHistory();
    renderHistory();

    // Purpose tabs
    const purposeTabs = $id('aidPurposeTabs');
    if (purposeTabs) {
      purposeTabs.addEventListener('click', function (e) {
        const tab = e.target.closest('.aid-purpose-tab');
        if (!tab) return;
        purposeTabs.querySelectorAll('.aid-purpose-tab').forEach(t => t.classList.remove('aid-purpose-tab--active'));
        tab.classList.add('aid-purpose-tab--active');
        State.purpose = tab.dataset.value;
      });
    }

    // Selects
    const toneSelect = $id('aidToneSelect');
    if (toneSelect) toneSelect.addEventListener('change', e => State.tone = e.target.value);
    const modeSelect = $id('aidModeSelect');
    if (modeSelect) modeSelect.addEventListener('change', e => State.mode = e.target.value);
    const langSelect = $id('aidLangSelect');
    if (langSelect) langSelect.addEventListener('change', e => State.language = e.target.value);
  }

  // ─── Public API ───────────────────────────────────────────
  window.AID = {
    setInputMode,
    handleTextInput,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileDragOver,
    handleFileDragLeave,
    handleFileDrop,
    handleFileSelect,
    removeFile,
    fetchURL,
    loadSample,
    clearInput,
    toggleOptions,
    startDetect,
    startHumanize,
    showCompareTab,
    copyHumanized,
    downloadTxt,
    clearHistory,
    toggleFAQ,
    toggleTheme,
  };

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

