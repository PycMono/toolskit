'use strict';
// size analyzer
function initToolOptions() {}
function processJson() {
  clearErrorPanel();
  const raw = getInput().trim(); const parsed = parseInput(); if (parsed === null) return;
  const stats = analyzeSize(parsed);
  const rawSize = new Blob([raw]).size;
  const minSize = new Blob([JSON.stringify(parsed)]).size;
  const container = document.getElementById('sizeOutput');
  container.innerHTML = `
    <div class="jt-size-grid">
      <div class="jt-size-stat"><span class="jt-size-label">原始大小</span><span class="jt-size-value">${formatBytes(rawSize)}</span></div>
      <div class="jt-size-stat"><span class="jt-size-label">压缩大小</span><span class="jt-size-value">${formatBytes(minSize)}</span></div>
      <div class="jt-size-stat"><span class="jt-size-label">最大深度</span><span class="jt-size-value">${stats.maxDepth}</span></div>
      <div class="jt-size-stat"><span class="jt-size-label">总节点数</span><span class="jt-size-value">${stats.totalNodes}</span></div>
    </div>
    <div class="jt-size-bar-list">
      <div class="jt-size-bar-item"><span class="jt-size-bar-label">对象 ${stats.objects}</span>
        <div class="jt-size-bar-track"><div class="jt-size-bar-fill" style="width:${stats.objects/stats.totalNodes*100}%"></div></div>
        <span class="jt-size-bar-pct">${Math.round(stats.objects/stats.totalNodes*100)}%</span></div>
      <div class="jt-size-bar-item"><span class="jt-size-bar-label">数组 ${stats.arrays}</span>
        <div class="jt-size-bar-track"><div class="jt-size-bar-fill" style="width:${stats.arrays/stats.totalNodes*100}%"></div></div>
        <span class="jt-size-bar-pct">${Math.round(stats.arrays/stats.totalNodes*100)}%</span></div>
      <div class="jt-size-bar-item"><span class="jt-size-bar-label">字符串 ${stats.strings}</span>
        <div class="jt-size-bar-track"><div class="jt-size-bar-fill" style="width:${stats.strings/stats.totalNodes*100}%"></div></div>
        <span class="jt-size-bar-pct">${Math.round(stats.strings/stats.totalNodes*100)}%</span></div>
      <div class="jt-size-bar-item"><span class="jt-size-bar-label">数字 ${stats.numbers}</span>
        <div class="jt-size-bar-track"><div class="jt-size-bar-fill" style="width:${stats.numbers/stats.totalNodes*100}%"></div></div>
        <span class="jt-size-bar-pct">${Math.round(stats.numbers/stats.totalNodes*100)}%</span></div>
    </div>`;
}
function analyzeSize(obj, depth=0) {
  const stats = { maxDepth:depth, totalNodes:1, objects:0, arrays:0, strings:0, numbers:0, booleans:0, nulls:0 };
  if (obj === null) { stats.nulls=1; return stats; }
  if (typeof obj === 'boolean') { stats.booleans=1; return stats; }
  if (typeof obj === 'number')  { stats.numbers=1; return stats; }
  if (typeof obj === 'string')  { stats.strings=1; return stats; }
  if (Array.isArray(obj)) {
    stats.arrays = 1;
    obj.forEach(v => {
      const sub = analyzeSize(v, depth+1);
      stats.maxDepth = Math.max(stats.maxDepth, sub.maxDepth);
      stats.totalNodes += sub.totalNodes;
      stats.objects += sub.objects; stats.arrays += sub.arrays;
      stats.strings += sub.strings; stats.numbers += sub.numbers;
      stats.booleans += sub.booleans; stats.nulls += sub.nulls;
    });
    return stats;
  }
  stats.objects = 1;
  Object.values(obj).forEach(v => {
    const sub = analyzeSize(v, depth+1);
    stats.maxDepth = Math.max(stats.maxDepth, sub.maxDepth);
    stats.totalNodes += sub.totalNodes;
    stats.objects += sub.objects; stats.arrays += sub.arrays;
    stats.strings += sub.strings; stats.numbers += sub.numbers;
    stats.booleans += sub.booleans; stats.nulls += sub.nulls;
  });
  return stats;
}
