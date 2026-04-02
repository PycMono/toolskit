/**
 * password-checker.js — Password Strength Checker
 * Pure client-side analysis
 */
(function () {
  'use strict';

  var COMMON = ['password','123456','12345678','qwerty','abc123','monkey','1234567','letmein','trustno1','dragon','baseball','iloveyou','master','sunshine','ashley','bailey','shadow','passw0rd','password1','princess','football','charlie','access','hello','thunder','admin','login','welcome','qwerty123','123qwe'];

  function analyze(pwd) {
    if (!pwd) return { score: 0, label: '', color: '', crackTime: '', checks: [] };

    var len = pwd.length;
    var hasLower = /[a-z]/.test(pwd);
    var hasUpper = /[A-Z]/.test(pwd);
    var hasDigit = /[0-9]/.test(pwd);
    var hasSymbol = /[^a-zA-Z0-9]/.test(pwd);

    var poolSize = 0;
    if (hasLower) poolSize += 26;
    if (hasUpper) poolSize += 26;
    if (hasDigit) poolSize += 10;
    if (hasSymbol) poolSize += 33;

    var entropy = len > 0 ? Math.floor(Math.log(Math.pow(poolSize, len)) / Math.log(2)) : 0;

    var score = 0;
    var checks = [];

    // Length scoring
    if (len >= 8) score += 1;
    if (len >= 12) score += 1;
    if (len >= 16) score += 1;
    checks.push({ label: 'Length (' + len + ')', pass: len >= 8, tip: 'Use at least 8 characters' });

    checks.push({ label: 'Lowercase (a-z)', pass: hasLower, tip: 'Add lowercase letters' });
    checks.push({ label: 'Uppercase (A-Z)', pass: hasUpper, tip: 'Add uppercase letters' });
    checks.push({ label: 'Numbers (0-9)', pass: hasDigit, tip: 'Add numbers' });
    checks.push({ label: 'Symbols (!@#$)', pass: hasSymbol, tip: 'Add special characters' });

    // Sequential check
    var sequential = 0;
    for (var i = 0; i < len - 2; i++) {
      if (pwd.charCodeAt(i) + 1 === pwd.charCodeAt(i+1) && pwd.charCodeAt(i+1) + 1 === pwd.charCodeAt(i+2)) sequential++;
    }
    var hasSequential = sequential > 0;
    if (hasSequential) score = Math.max(0, score - 1);
    checks.push({ label: 'No sequential chars', pass: !hasSequential, tip: 'Avoid sequences like abc or 123' });

    // Repeated check
    var repeated = /(.)\1{2,}/.test(pwd);
    if (repeated) score = Math.max(0, score - 1);
    checks.push({ label: 'No repeated chars', pass: !repeated, tip: 'Avoid repeating characters' });

    // Common password check
    var isCommon = COMMON.indexOf(pwd.toLowerCase()) !== -1;
    if (isCommon) score = 0;
    checks.push({ label: 'Not a common password', pass: !isCommon, tip: 'Avoid common passwords' });

    score = Math.max(0, score);
    if (entropy > 40) score = Math.min(4, score + 1);
    if (entropy > 60) score = Math.min(4, score + 1);

    var label, color, crackTime;
    if (isCommon) { label = 'Very Weak'; color = '#e74c3c'; crackTime = '< 1 second'; }
    else if (score <= 1) { label = 'Weak'; color = '#e67e22'; crackTime = 'Minutes to hours'; }
    else if (score <= 2) { label = 'Fair'; color = '#f39c12'; crackTime = 'Days to months'; }
    else if (score <= 3) { label = 'Strong'; color = '#27ae60'; crackTime = 'Years to centuries'; }
    else { label = 'Very Strong'; color = '#2ecc71'; crackTime = 'Centuries to millennia'; }

    if (!isCommon && len > 0) {
      var guesses = Math.pow(poolSize, len);
      var seconds = guesses / 1e10; // 10 billion guesses/sec
      if (seconds < 60) crackTime = Math.ceil(seconds) + ' seconds';
      else if (seconds < 3600) crackTime = Math.ceil(seconds / 60) + ' minutes';
      else if (seconds < 86400) crackTime = Math.ceil(seconds / 3600) + ' hours';
      else if (seconds < 86400 * 365) crackTime = Math.ceil(seconds / 86400) + ' days';
      else if (seconds < 86400 * 365 * 1000) crackTime = Math.ceil(seconds / (86400 * 365)) + ' years';
      else if (seconds < 86400 * 365 * 1e6) crackTime = Math.ceil(seconds / (86400 * 365 * 1000)) + ' thousand years';
      else crackTime = 'Millions of years+';
    }

    return { score: score, label: label, color: color, crackTime: crackTime, entropy: entropy, checks: checks };
  }

  function render(result) {
    var meter = document.getElementById('strengthMeter');
    var label = document.getElementById('strengthLabel');
    var crack = document.getElementById('crackTime');
    var entropy = document.getElementById('entropyValue');
    var checks = document.getElementById('checks');

    if (!result.score) {
      meter.style.width = '0%';
      meter.style.backgroundColor = '#ddd';
      label.textContent = '';
      crack.textContent = '';
      entropy.textContent = '';
      checks.innerHTML = '';
      return;
    }

    meter.style.width = (result.score / 4 * 100) + '%';
    meter.style.backgroundColor = result.color;
    label.textContent = result.label;
    label.style.color = result.color;
    crack.textContent = result.crackTime;
    entropy.textContent = result.entropy + ' bits';

    checks.innerHTML = '';
    result.checks.forEach(function (c) {
      var div = document.createElement('div');
      div.className = 'pc-check' + (c.pass ? ' pass' : ' fail');
      div.innerHTML = '<span class="pc-icon">' + (c.pass ? '✅' : '❌') + '</span>' +
        '<span class="pc-text">' + c.label + '</span>' +
        '<span class="pc-tip">' + (!c.pass ? c.tip : '') + '</span>';
      checks.appendChild(div);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    var input = document.getElementById('pwdInput');
    var toggle = document.getElementById('pwdToggle');
    var generateBtn = document.getElementById('genBtn');

    input.addEventListener('input', function () { render(analyze(this.value)); });
    toggle.addEventListener('click', function () {
      input.type = input.type === 'password' ? 'text' : 'password';
      this.textContent = input.type === 'password' ? '👁' : '🔒';
    });

    generateBtn.addEventListener('click', function () {
      var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
      var arr = new Uint32Array(20);
      crypto.getRandomValues(arr);
      var pwd = '';
      for (var i = 0; i < 20; i++) pwd += chars[arr[i] % chars.length];
      input.value = pwd;
      input.type = 'text';
      toggle.textContent = '🔒';
      render(analyze(pwd));
    });
  }
})();
