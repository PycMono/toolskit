'use strict';
// stringify
function initToolOptions() {}
function processJson() {
  const parsed = parseInput(); if (parsed === null) return;
  setOutput(JSON.stringify(JSON.stringify(parsed)), 'plaintext');
}

