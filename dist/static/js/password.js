/* ============================================
   Tool Box Nova - Password Generator JS
   Uses window.crypto.getRandomValues for security
   ============================================ */

const CHARS = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  ambiguous: '0O1lI'
};

function buildCharset() {
  let charset = '';
  if (document.getElementById('useUpper').checked) charset += CHARS.upper;
  if (document.getElementById('useLower').checked) charset += CHARS.lower;
  if (document.getElementById('useNumbers').checked) charset += CHARS.numbers;
  if (document.getElementById('useSymbols').checked) charset += CHARS.symbols;
  if (document.getElementById('excludeAmbiguous').checked) {
    for (const ch of CHARS.ambiguous) {
      charset = charset.split(ch).join('');
    }
  }
  return charset;
}

function generateOnePassword(length, charset) {
  if (!charset) return '';
  const arr = new Uint32Array(length);
  window.crypto.getRandomValues(arr);
  return Array.from(arr).map(v => charset[v % charset.length]).join('');
}

function getStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (password.length >= 20) score++;
  return score;
}

const strengthInfo = [
  { label: 'Weak', color: '#ef4444', pct: 15 },
  { label: 'Weak', color: '#f97316', pct: 25 },
  { label: 'Fair', color: '#f59e0b', pct: 40 },
  { label: 'Fair', color: '#eab308', pct: 55 },
  { label: 'Good', color: '#84cc16', pct: 68 },
  { label: 'Good', color: '#22c55e', pct: 78 },
  { label: 'Strong', color: '#10b981', pct: 88 },
  { label: 'Very Strong', color: '#059669', pct: 100 },
  { label: 'Very Strong', color: '#047857', pct: 100 },
];

function updateStrength(password) {
  const score = Math.min(getStrength(password), strengthInfo.length - 1);
  const info = strengthInfo[score];
  const fill = document.getElementById('strengthFill');
  const label = document.getElementById('strengthLabel');
  if (fill) { fill.style.width = info.pct + '%'; fill.style.background = info.color; }
  if (label) { label.textContent = info.label; label.style.color = info.color; }
}

function generatePasswords() {
  const length = parseInt(document.getElementById('lengthSlider').value, 10);
  const quantity = parseInt(document.getElementById('quantity').value, 10);
  const charset = buildCharset();

  if (!charset) {
    showToast('Please select at least one character type!');
    return;
  }

  const passwords = Array.from({ length: quantity }, () => generateOnePassword(length, charset));

  // Show first password in main output
  const output = document.getElementById('passwordOutput');
  if (output) {
    output.value = passwords[0];
    updateStrength(passwords[0]);
  }

  // Show batch list if quantity > 1
  const batchDiv = document.getElementById('batchResults');
  if (batchDiv) {
    if (quantity > 1) {
      batchDiv.style.display = 'block';
      batchDiv.innerHTML = passwords.map((p, i) => `
        <div class="batch-item">
          <span style="color:#94a3b8;font-size:12px;min-width:24px">#${i + 1}</span>
          <span style="flex:1;word-break:break-all">${p}</span>
          <button class="btn btn-outline btn-xs" onclick="navigator.clipboard.writeText('${p}');showToast('Copied!')">📋</button>
        </div>
      `).join('');
    } else {
      batchDiv.style.display = 'none';
    }
  }
}

function copyPassword() {
  const output = document.getElementById('passwordOutput');
  if (output && output.value && output.value !== 'Click Generate to create password') {
    navigator.clipboard.writeText(output.value).then(() => showToast('Password copied!'));
  }
}

// Keyboard shortcuts
document.addEventListener('keydown', function (e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    generatePasswords();
  }
});

// Auto-generate on page load
window.addEventListener('DOMContentLoaded', function () {
  // Only run on password page
  if (document.getElementById('passwordOutput')) {
    generatePasswords();
  }
});

