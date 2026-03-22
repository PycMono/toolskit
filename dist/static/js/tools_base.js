/* ==================================================
   Tool Box Nova - 进制转换器 JS
   ================================================== */

const inputs = { bin: 'inputBin', oct: 'inputOct', dec: 'inputDec', hex: 'inputHex' };
const bases  = { bin: 2, oct: 8, dec: 10, hex: 16 };

Object.entries(inputs).forEach(([key, id]) => {
  document.getElementById(id)?.addEventListener('input', function () {
    convertFrom(key, this.value.trim());
  });
});

function convertFrom(source, raw) {
  const errorEl = document.getElementById('baseError');
  if (!raw) {
    Object.values(inputs).forEach(id => { if (inputs[source] !== id) document.getElementById(id).value = ''; });
    document.getElementById('bitView').innerHTML = '';
    document.getElementById('bitOpResults').innerHTML = '';
    errorEl.classList.add('hidden');
    return;
  }

  let decimal;
  try {
    decimal = parseInt(raw, bases[source]);
    if (isNaN(decimal)) throw new Error(`"${raw}" 不是合法的${source}进制数`);
  } catch (e) {
    errorEl.textContent = '❌ ' + e.message;
    errorEl.classList.remove('hidden');
    return;
  }
  errorEl.classList.add('hidden');

  Object.entries(inputs).forEach(([key, id]) => {
    if (key !== source) {
      document.getElementById(id).value = decimal.toString(bases[key]).toUpperCase();
    }
  });

  // Bit view
  renderBitView(decimal);
  // Bit operations
  renderBitOps(decimal);
}

function renderBitView(n) {
  const bits = (n >>> 0).toString(2).padStart(32, '0');
  const groups = [];
  for (let i = 0; i < 32; i += 8) groups.push(bits.slice(i, i + 8));
  const html = groups.map((g, gi) =>
    `<div class="bit-group">${g.split('').map((b, bi) =>
      `<span class="bit ${b === '1' ? 'bit-1' : 'bit-0'}">${b}</span>`
    ).join('')}</div>`
  ).join('');
  document.getElementById('bitView').innerHTML =
    `<div class="bit-row">${html}</div><div class="bit-label">Bit 31 ←──────────────── Bit 0</div>`;
}

function renderBitOps(a) {
  const bVal = parseInt(document.getElementById('bitOpB')?.value || '13');
  const b = isNaN(bVal) ? 0 : bVal;
  const ops = [
    ['AND (&)', a & b],
    ['OR (|)', a | b],
    ['XOR (^)', a ^ b],
    ['NOT (~)', ~a],
    ['左移 << 1', a << 1],
    ['右移 >> 1', a >> 1],
    ['无符号右移 >>> 1', a >>> 1],
  ];
  document.getElementById('bitOpResults').innerHTML = ops.map(([name, val]) =>
    `<div class="bitop-row">
      <span class="bitop-name">${name}</span>
      <span class="bitop-dec">${val}</span>
      <span class="bitop-hex">0x${(val >>> 0).toString(16).toUpperCase().padStart(8, '0')}</span>
      <span class="bitop-bin">${(val >>> 0).toString(2).padStart(16, '0')}</span>
    </div>`
  ).join('');
}

// Copy buttons
document.querySelectorAll('.copy-base-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    const val = document.getElementById(this.dataset.target)?.value;
    if (!val) return;
    navigator.clipboard.writeText(val).then(() => {
      const old = this.textContent; this.textContent = '✅';
      setTimeout(() => { this.textContent = old; }, 1500);
    });
  });
});

// Bit ops re-render when operand B changes
document.getElementById('bitOpA')?.addEventListener('input', function () {
  const n = parseInt(this.value);
  if (!isNaN(n)) renderBitOps(n);
});
document.getElementById('bitOpB')?.addEventListener('input', function () {
  const a = parseInt(document.getElementById('inputDec')?.value || '0');
  if (!isNaN(a)) renderBitOps(a);
});

// Init with example
document.getElementById('inputDec').value = '255';
convertFrom('dec', '255');

