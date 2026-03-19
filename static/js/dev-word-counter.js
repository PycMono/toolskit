// dev-word-counter.js — Word Counter & Text Analyzer (Web Worker)

const DevWordCounter = (() => {
  let worker = null;
  let chart  = null;
  const STATE = { debounceTimer: null };

  function init() {
    // Inline worker as blob to avoid separate file serving
    const workerCode = `
self.onmessage = function(e) { self.postMessage(analyze(e.data)); };

function analyze(text) {
  if (!text || !text.trim()) return emptyStats();
  var words = text.trim().split(/\\s+/).filter(function(w){ return w.length > 0; });
  var wordCount = words.length;
  var charCount = text.length;
  var charNoSpace = text.replace(/\\s/g,'').length;
  var cjkCount = (text.match(/[\\u4e00-\\u9fff\\u3400-\\u4dbf]/g) || []).length;

  var sentenceTexts = text.split(/(?<![A-Z][a-z]\\.|Dr\\.|Mr\\.|Ms\\.|Mrs\\.|etc\\.|vs\\.)[.!?]+/).filter(function(s){ return s.trim().length > 0; });
  var sentences = sentenceTexts.length || 1;
  var paragraphs = text.split(/\\n\\s*\\n/).filter(function(p){ return p.trim().length > 0; }).length || 1;

  var readingMin  = (wordCount + cjkCount * 0.5) / 238;
  var speakingMin = (wordCount + cjkCount * 0.5) / 130;

  var syllables = countSyllables(words);
  var avgSentenceLen = wordCount / sentences;
  var avgSyllablesPerWord = syllables / Math.max(wordCount, 1);
  var fleschScore = Math.round(206.835 - 1.015 * avgSentenceLen - 84.6 * avgSyllablesPerWord);
  fleschScore = Math.max(0, Math.min(100, fleschScore));
  var fleschLevel = getFleschLevel(fleschScore);

  var uniqueWords = (new Set(words.map(function(w){ return w.toLowerCase().replace(/[^a-z0-9]/g,''); }))).size;

  var stopWords = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','is','are','was','were','be','been','have','has','had','do','does','did','will','would','could','should','may','might','it','this','that','they','we','you','he','she','i','my','your']);
  var freqMap = {};
  words.forEach(function(w) {
    var clean = w.toLowerCase().replace(/[^a-z0-9]/g,'');
    if (clean.length > 2 && !stopWords.has(clean)) freqMap[clean] = (freqMap[clean]||0) + 1;
  });
  var keywords = Object.entries(freqMap)
    .sort(function(a,b){ return b[1]-a[1]; })
    .slice(0,20)
    .map(function(e){ return {word:e[0],count:e[1],pct:(e[1]/wordCount*100).toFixed(1)}; });

  var flowData = sentenceTexts.map(function(s){ return s.trim().split(/\\s+/).length; });

  return {
    wordCount:wordCount, charCount:charCount, charNoSpace:charNoSpace, cjkCount:cjkCount,
    sentences:sentences, paragraphs:paragraphs, readingMin:readingMin, speakingMin:speakingMin,
    fleschScore:fleschScore, fleschLevel:fleschLevel, uniqueWords:uniqueWords,
    avgSentenceLen:avgSentenceLen.toFixed(1), keywords:keywords, flowData:flowData
  };
}
function countSyllables(words){
  return words.reduce(function(acc,word){
    var clean=word.toLowerCase().replace(/[^a-z]/g,'');
    if(!clean) return acc;
    var vowels=clean.match(/[aeiouy]+/g);
    var count=vowels?vowels.length:1;
    if(clean.endsWith('e')&&count>1) count--;
    return acc+Math.max(1,count);
  },0);
}
function getFleschLevel(score){
  if(score>=90) return 'Very Easy';
  if(score>=80) return 'Easy';
  if(score>=70) return 'Fairly Easy';
  if(score>=60) return 'Standard';
  if(score>=50) return 'Fairly Difficult';
  if(score>=30) return 'Difficult';
  return 'Very Confusing';
}
function emptyStats(){
  return {wordCount:0,charCount:0,charNoSpace:0,cjkCount:0,sentences:0,paragraphs:0,
    readingMin:0,speakingMin:0,fleschScore:0,fleschLevel:'—',uniqueWords:0,
    avgSentenceLen:'0',keywords:[],flowData:[]};
}
`;
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    worker = new Worker(URL.createObjectURL(blob));
    worker.onmessage = ({ data }) => renderStats(data);

    const ta = document.getElementById('wcInput');
    if (ta) {
      ta.addEventListener('input', () => {
        clearTimeout(STATE.debounceTimer);
        STATE.debounceTimer = setTimeout(() => {
          worker.postMessage(ta.value);
          const cc = document.getElementById('wcCharCount');
          if (cc) cc.textContent = ta.value.length.toLocaleString() + ' chars';
        }, 200);
      });
    }
  }

  function renderStats(stats) {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('stat-words',      stats.wordCount.toLocaleString());
    set('stat-chars',      stats.charCount.toLocaleString());
    set('stat-chars-ns',   stats.charNoSpace.toLocaleString());
    set('stat-sentences',  stats.sentences.toLocaleString());
    set('stat-paragraphs', stats.paragraphs.toLocaleString());
    set('stat-unique',     stats.uniqueWords.toLocaleString());
    set('stat-reading',    formatTime(stats.readingMin));
    set('stat-speaking',   formatTime(stats.speakingMin));
    set('stat-flesch',     stats.fleschScore);
    set('stat-level',      stats.fleschLevel);
    set('stat-avg-sent',   stats.avgSentenceLen);

    // numberPop animation
    document.querySelectorAll('.stat-card__number').forEach(el => {
      el.classList.remove('stat-card__number--updated');
      void el.offsetWidth; // reflow
      el.classList.add('stat-card__number--updated');
    });

    updateFleschBar(stats.fleschScore);
    renderKeywordChart(stats.keywords);
    renderFlowBar(stats.flowData);
  }

  function updateFleschBar(score) {
    const fill = document.getElementById('fleschFill');
    if (fill) fill.style.width = Math.max(0, Math.min(100, score)) + '%';
  }

  function renderKeywordChart(keywords) {
    const ctx = document.getElementById('kwChart');
    if (!ctx || typeof Chart === 'undefined') return;
    if (chart) { chart.destroy(); chart = null; }
    if (!keywords || !keywords.length) return;
    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: keywords.map(k => k.word),
        datasets: [{
          label: 'Count',
          data: keywords.map(k => k.count),
          backgroundColor: 'rgba(37,99,235,0.6)',
          borderColor: 'rgba(37,99,235,1)',
          borderWidth: 1,
        }],
      },
      options: {
        responsive: true,
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: { x: { beginAtZero: true, ticks: { precision: 0 } } },
        animation: { duration: 150 },
      },
    });
  }

  function renderFlowBar(flowData) {
    const bar = document.getElementById('flowBar');
    if (!bar) return;
    bar.innerHTML = (flowData || []).map(n => {
      const cls = n <= 1 ? 'flow-1' : n <= 6 ? 'flow-6' : n <= 15 ? 'flow-15' :
                  n <= 25 ? 'flow-25' : n <= 39 ? 'flow-39' : 'flow-40';
      return '<div class="flow-seg ' + cls + '" title="' + n + ' words" style="flex:' + n + '"></div>';
    }).join('');
  }

  function formatTime(minutes) {
    if (!minutes || minutes < 0.01) return '—';
    if (minutes < 1) return '< 1 min';
    const m = Math.floor(minutes);
    const s = Math.round((minutes - m) * 60);
    return s > 0 ? m + ' min ' + s + ' sec' : m + ' min';
  }

  function reset() {
    if (worker) worker.postMessage('');
    const cc = document.getElementById('wcCharCount');
    if (cc) cc.textContent = '0 chars';
  }

  return { init, reset };
})();

document.addEventListener('DOMContentLoaded', () => DevWordCounter.init());

