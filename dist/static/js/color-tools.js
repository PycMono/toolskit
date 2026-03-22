/* ============================================================
   color-tools.js — Color Tools Suite Front-end Engine
   ToolboxNova | v1.0
   I-03: Color conversion, palette, contrast, gradient, image
   I-04: Result cards, export, blindness compare, events
   ============================================================ */

/* ── Global State ─────────────────────────────────────────── */
var State = {
  palette: {
    colors: [],        // [{hex, locked, id}]
    harmony: 'random',
    count: 5,
    history: [],       // undo stack (max 50)
    historyIndex: -1
  },
  picker: {
    currentColor: '#6366f1',
    hue: 248, sat: 0.65, val: 0.95
  },
  imagePicker: {
    imageLoaded: false,
    imageData: null,
    canvasCtx: null,
    dominantColors: [],
    algorithm: 'kmeans',
    colorCount: 6
  },
  contrast: { fg: '#000000', bg: '#ffffff' },
  gradient: {
    stops: [
      { color: '#6366f1', position: 0 },
      { color: '#ec4899', position: 100 }
    ],
    type: 'linear',
    angle: 90,
    colorSpace: 'oklch'
  },
  ui: {
    darkMode: false,
    exportFormat: 'css',
    exportColors: []
  },
  objectURLs: []
};

/* ── Helper: T() translation ──────────────────────────────── */
var _pageEl = document.querySelector('.ct-page');
var _lang   = _pageEl ? _pageEl.dataset.lang : 'en';
var _tool   = _pageEl ? _pageEl.dataset.tool : 'tools';

/* ── Init on DOMContentLoaded ─────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  ctInitQuickPicker();

  if (_tool === 'picker')       ctInitPicker();
  if (_tool === 'palette')      ctInitPalette();
  if (_tool === 'wheel')        ctInitWheel();
  if (_tool === 'converter')    ctInitConverter();
  if (_tool === 'contrast')     ctInitContrast();
  if (_tool === 'gradient')     ctInitGradient();
  if (_tool === 'image-picker') ctInitImagePicker();
  if (_tool === 'blindness')    ctInitBlindness();
  if (_tool === 'names')        ctInitNames();
  if (_tool === 'mixer')        ctInitMixer();
  if (_tool === 'tailwind')     ctInitTailwind();

  ctInitFaqAccordion();
  ctInitKeyboard();
  ctInitCompareSlider();
  ctRestoreFromHash();

  // Dark-mode sync
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
});

/* ================================================================
   I. UTILITY
   ================================================================ */

function ctRandomHex() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

function ctGenId() {
  return 'c_' + Math.random().toString(36).substr(2, 9);
}

function ctTextColor(hex) {
  if (typeof chroma === 'undefined') return '#fff';
  return chroma(hex).luminance() > 0.35 ? '#000' : '#fff';
}

function ctIsValidHex(h) {
  return /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(h.trim());
}

function ctNormalizeHex(h) {
  h = h.trim();
  if (!h.startsWith('#')) h = '#' + h;
  if (h.length === 4) h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
  return h.toUpperCase();
}

function ctCopyToClipboard(text) {
  var p = navigator.clipboard
    ? navigator.clipboard.writeText(text)
    : Promise.reject();
  p.then(function () {
    ctShowToast(_lang === 'zh' ? '已复制！' : 'Copied!', 'success');
  }).catch(function () {
    var ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    ctShowToast(_lang === 'zh' ? '已复制！' : 'Copied!', 'success');
  });
}

function ctShowToast(msg, type) {
  type = type || 'info';
  var c = document.getElementById('ctToastContainer');
  if (!c) return;
  var el = document.createElement('div');
  el.className = 'ct-toast ct-toast--' + type;
  el.textContent = msg;
  c.appendChild(el);
  requestAnimationFrame(function () { el.classList.add('ct-toast--visible'); });
  setTimeout(function () {
    el.classList.remove('ct-toast--visible');
    el.addEventListener('transitionend', function () { el.remove(); }, { once: true });
  }, 2800);
}

/* ================================================================
   II. QUICK PICKER (hero)
   ================================================================ */
function ctInitQuickPicker() {
  var swatch = document.getElementById('quickSwatch');
  var input  = document.getElementById('quickHex');
  if (!swatch || !input) return;

  input.addEventListener('input', function () {
    var v = this.value.trim();
    if (!v.startsWith('#')) v = '#' + v;
    if (/^#[0-9A-Fa-f]{6}$/.test(v)) swatch.style.background = v;
  });
}

function ctRandomColor() {
  var hex = ctRandomHex();
  var sw  = document.getElementById('quickSwatch');
  var inp = document.getElementById('quickHex');
  if (sw)  sw.style.background = hex;
  if (inp) inp.value = hex;
}

/* ================================================================
   III. COLOR CONVERSION ENGINE (I-03)
   ================================================================ */

/** Convert using chroma.js */
function ctGetAllFormats(hexOrChroma) {
  if (typeof chroma === 'undefined') return null;
  try {
    var c = (typeof hexOrChroma === 'string') ? chroma(hexOrChroma) : hexOrChroma;
    var rgb  = c.rgb();
    var hsl  = c.hsl();
    var hsv  = c.hsv();

    // CMYK (ICC-approximated)
    var r = rgb[0]/255, g = rgb[1]/255, b2 = rgb[2]/255;
    var k = 1 - Math.max(r, g, b2);
    var cmyk = k === 1
      ? [0, 0, 0, 100]
      : [(1-r-k)/(1-k)*100, (1-g-k)/(1-k)*100, (1-b2-k)/(1-k)*100, k*100].map(function(v){ return Math.round(v); });

    // HWB
    var h2   = (hsl[0] || 0);
    var white = Math.min(r, g, b2) * 100;
    var black = (1 - Math.max(r, g, b2)) * 100;

    // LAB / LCH via chroma
    var lab = c.lab();
    var lch = c.lch();

    // OKLCH / XYZ via Color.js if available
    var oklchStr = '', xyzStr = '';
    if (typeof Color !== 'undefined') {
      try {
        var cjs = new Color(hexOrChroma);
        var ok  = cjs.to('oklch');
        oklchStr = 'oklch(' + round2(ok.coords[0]*100) + '% ' + round2(ok.coords[1]) + ' ' + round2(ok.coords[2]) + ')';
        var xyz = cjs.to('xyz-d65');
        xyzStr  = 'color(xyz-d65 ' + xyz.coords.map(round4).join(' ') + ')';
      } catch(e) {}
    }

    return {
      hex:   c.hex().toUpperCase(),
      rgb:   'rgb(' + rgb.map(Math.round).join(', ') + ')',
      hsl:   'hsl(' + Math.round(hsl[0]||0) + ', ' + round1(hsl[1]*100) + '%, ' + round1(hsl[2]*100) + '%)',
      hsv:   'hsv(' + Math.round(hsv[0]||0) + ', ' + round1(hsv[1]*100) + '%, ' + round1(hsv[2]*100) + '%)',
      cmyk:  'cmyk(' + cmyk[0] + '%, ' + cmyk[1] + '%, ' + cmyk[2] + '%, ' + cmyk[3] + '%)',
      lab:   'lab(' + round2(lab[0]) + ' ' + round2(lab[1]) + ' ' + round2(lab[2]) + ')',
      lch:   'lch(' + round2(lch[0]) + ' ' + round2(lch[1]) + ' ' + round2(lch[2]) + ')',
      hwb:   'hwb(' + Math.round(h2) + ' ' + round1(white) + '% ' + round1(black) + '%)',
      oklch: oklchStr || ('oklch(~' + round2(lab[0]/100) + ' - -)'),
      xyz:   xyzStr   || ('xyz(~' + round4(r*0.4124) + ' ' + round4(g*0.7152) + ' ' + round4(b2*0.0722) + ')')
    };
  } catch (e) { return null; }
}

function round1(v) { return Math.round(v * 10) / 10; }
function round2(v) { return Math.round(v * 100) / 100; }
function round4(v) { return Math.round(v * 10000) / 10000; }

/* ── WCAG 2.1 + APCA Contrast ─────────────────────────────── */
function ctCalcContrastValues(fg, bg) {
  if (typeof chroma === 'undefined') return null;
  try {
    var frgb = chroma(fg).rgb();
    var brgb = chroma(bg).rgb();

    function sRGBtoLin(c) {
      c /= 255;
      return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    }
    function lum(rgb) {
      return 0.2126 * sRGBtoLin(rgb[0]) + 0.7152 * sRGBtoLin(rgb[1]) + 0.0722 * sRGBtoLin(rgb[2]);
    }

    var L1 = lum(frgb), L2 = lum(brgb);
    var wcag = Math.round(((Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)) * 100) / 100;

    // APCA v0.98G-4g
    function sRGBtoY(rgb) {
      return Math.pow(rgb[0]/255, 2.4) * 0.2126729
           + Math.pow(rgb[1]/255, 2.4) * 0.7151522
           + Math.pow(rgb[2]/255, 2.4) * 0.0721750;
    }
    var tY = sRGBtoY(frgb), bY = sRGBtoY(brgb);
    var apca;
    if (bY > tY) apca = (Math.pow(bY, 0.56) - Math.pow(tY, 0.57)) * 1.14 * 100;
    else         apca = (Math.pow(bY, 0.65) - Math.pow(tY, 0.62)) * 1.14 * 100;
    apca = Math.round(Math.abs(apca) * 100) / 100;

    return {
      wcag: wcag,
      apca: apca,
      aa:   { normal: wcag >= 4.5, large: wcag >= 3 },
      aaa:  { normal: wcag >= 7,   large: wcag >= 4.5 }
    };
  } catch (e) { return null; }
}

/* ── Color Blindness Simulation (Brettel matrices) ────────── */
var BLIND_MATRICES = {
  protanopia:    [[0.152286,1.052583,-0.204868],[-0.114503,0.786281,0.328216],[0.004733,-0.048116,1.043382]],
  deuteranopia:  [[0.367322,0.860646,-0.227968],[0.280085,0.672501,0.047413],[-0.011820,0.042940,0.968881]],
  tritanopia:    [[1.255528,-0.076749,-0.178779],[-0.078411,0.930809,0.147602],[0.004733,0.691367,0.303900]],
  protanomaly:   [[0.458064,0.679578,-0.137642],[-0.062780,0.882803,0.179977],[0.002363,-0.024082,1.021719]],
  deuteranomaly: [[0.547494,0.607765,-0.155259],[0.181693,0.781742,0.036565],[-0.010410,0.027275,0.983136]],
  tritanomaly:   [[0.926670,0.092514,-0.019184],[-0.021191,0.964503,0.056688],[0.008437,0.054813,0.936750]],
  achromatopsia: [[0.2126,0.7152,0.0722],[0.2126,0.7152,0.0722],[0.2126,0.7152,0.0722]]
};

function ctSimulateBlind(hex, type) {
  if (type === 'normal' || typeof chroma === 'undefined') return hex;
  try {
    var rgb = chroma(hex).rgb().map(function(v){ return v/255; });
    function lin(v)   { return v <= 0.04045 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); }
    function delin(v) { return v <= 0.0031308 ? v*12.92 : 1.055*Math.pow(v, 1/2.4)-0.055; }
    var l  = rgb.map(lin);
    var m  = BLIND_MATRICES[type];
    if (!m) return hex;
    var r2 = [
      m[0][0]*l[0]+m[0][1]*l[1]+m[0][2]*l[2],
      m[1][0]*l[0]+m[1][1]*l[1]+m[1][2]*l[2],
      m[2][0]*l[0]+m[2][1]*l[1]+m[2][2]*l[2]
    ];
    return chroma(r2.map(function(v){ return Math.round(delin(Math.max(0,Math.min(1,v)))*255); }), 'rgb').hex();
  } catch(e) { return hex; }
}

/* ── Harmony Generators ───────────────────────────────────── */
function ctGenHarmony(rule, count) {
  if (typeof chroma === 'undefined') {
    var out = [];
    for (var i = 0; i < count; i++) out.push({ hex: ctRandomHex(), locked: false, id: ctGenId() });
    return out;
  }
  var baseHue = Math.random() * 360;
  var locked  = State.palette.colors.filter(function(c){ return c.locked; });
  if (locked.length) baseHue = chroma(locked[0].hex).get('hsl.h') || baseHue;

  function hslColor(h, s, l) {
    return { hex: chroma.hsl(h % 360, s, l).hex().toUpperCase(), locked: false, id: ctGenId() };
  }
  function expand(hues, n) {
    return Array.from({ length: n }, function(_, i) {
      return hslColor(hues[i % hues.length], 0.6 + Math.random()*0.2, 0.45 + (i/n)*0.25 + (Math.random()-.5)*.08);
    });
  }

  switch (rule) {
    case 'complementary':     return expand([baseHue, baseHue+180], count);
    case 'triadic':           return expand([baseHue, baseHue+120, baseHue+240], count);
    case 'splitComplementary':return expand([baseHue, baseHue+150, baseHue+210], count);
    case 'square':            return expand([baseHue, baseHue+90, baseHue+180, baseHue+270], count);
    case 'analogous': {
      var hues = [];
      for (var i=0; i<count; i++) hues.push(baseHue + (i - Math.floor(count/2)) * 28);
      return hues.map(function(h){ return hslColor(h, 0.65, 0.5 + Math.random()*.15); });
    }
    case 'monochromatic':
      return Array.from({ length: count }, function(_, i) {
        return hslColor(baseHue, 0.5 + Math.random()*.3, 0.2 + (0.6/(count-1))*i);
      });
    default: // random
      return Array.from({ length: count }, function(){ return { hex: ctRandomHex(), locked: false, id: ctGenId() }; });
  }
}

/* ── Gradient Generation ──────────────────────────────────── */
function ctBuildGradientCSS(stops, type, angle, space) {
  // Use Color.js for perceptual interpolation if available
  var cssStops;
  if (typeof Color !== 'undefined' && stops.length >= 2) {
    try {
      var samples = 20;
      var pts = [];
      for (var i = 0; i < stops.length - 1; i++) {
        var from = new Color(stops[i].color);
        var to   = new Color(stops[i+1].color);
        var rng  = from.range(to, { space: space, hue: 'shorter' });
        for (var j = 0; j <= samples; j++) {
          var t   = j / samples;
          var pos = stops[i].position + t * (stops[i+1].position - stops[i].position);
          var col = rng(t).to('srgb').toString({ format: 'hex' });
          pts.push(col + ' ' + Math.round(pos) + '%');
        }
      }
      cssStops = pts.join(', ');
    } catch(e) {
      cssStops = stops.map(function(s){ return s.color + ' ' + s.position + '%'; }).join(', ');
    }
  } else {
    cssStops = stops.map(function(s){ return s.color + ' ' + s.position + '%'; }).join(', ');
  }

  switch (type) {
    case 'radial': return 'radial-gradient(circle, ' + cssStops + ')';
    case 'conic':  return 'conic-gradient(from ' + angle + 'deg, ' + cssStops + ')';
    default:       return 'linear-gradient(' + angle + 'deg, ' + cssStops + ')';
  }
}

/* ── Export Formats ───────────────────────────────────────── */
function ctFormatExport(colors, fmt) {
  switch (fmt) {
    case 'css':
      return colors.map(function(h, i){ return '--color-' + (i+1) + ': ' + h + ';'; }).join('\n');
    case 'scss':
      return colors.map(function(h, i){ return '$color-' + (i+1) + ': ' + h + ';'; }).join('\n');
    case 'json':
      return JSON.stringify(colors.map(function(h, i){
        return { name: 'color-' + (i+1), hex: h };
      }), null, 2);
    case 'tailwind':
      var obj = {};
      colors.forEach(function(h, i){ obj['color-' + (i+1)] = h; });
      return 'module.exports = {\n  theme: {\n    extend: {\n      colors: ' +
        JSON.stringify(obj, null, 6).replace(/^/gm, '      ').trim() + '\n    }\n  }\n}';
    case 'svg': {
      var w = 80, h2 = 80;
      var rects = colors.map(function(h, i){
        return '<rect x="' + (i*w) + '" y="0" width="' + w + '" height="' + h2 + '" fill="' + h + '"/>';
      }).join('\n  ');
      return '<?xml version="1.0"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="' + (colors.length*w) + '" height="' + h2 + '">\n  ' + rects + '\n</svg>';
    }
    case 'gpl':
      return 'GIMP Palette\nName: ToolboxNova Palette\n#\n' +
        colors.map(function(h, i){
          if (typeof chroma === 'undefined') return h;
          var rgb = chroma(h).rgb().map(Math.round);
          return rgb.join('\t') + '\tColor ' + (i+1);
        }).join('\n');
    default: return colors.join('\n');
  }
}

/* ── K-means for image color extraction ──────────────────── */
function ctKMeans(pixels, k, maxIter) {
  k = Math.min(k, pixels.length);
  // init: pick k random pixels as centroids
  var centroids = [];
  var used = {};
  while (centroids.length < k) {
    var idx = Math.floor(Math.random() * pixels.length);
    if (!used[idx]) { used[idx] = true; centroids.push(pixels[idx].slice()); }
  }

  var assignments = new Array(pixels.length).fill(0);
  for (var iter = 0; iter < maxIter; iter++) {
    var changed = false;
    // assign
    for (var i = 0; i < pixels.length; i++) {
      var best = 0, bestDist = Infinity;
      for (var j = 0; j < k; j++) {
        var dr = pixels[i][0]-centroids[j][0],
            dg = pixels[i][1]-centroids[j][1],
            db = pixels[i][2]-centroids[j][2];
        var d = dr*dr + dg*dg + db*db;
        if (d < bestDist) { bestDist = d; best = j; }
      }
      if (assignments[i] !== best) { assignments[i] = best; changed = true; }
    }
    if (!changed) break;
    // update centroids
    var sums = Array.from({ length: k }, function(){ return [0,0,0,0]; });
    for (var i = 0; i < pixels.length; i++) {
      var c = assignments[i];
      sums[c][0] += pixels[i][0];
      sums[c][1] += pixels[i][1];
      sums[c][2] += pixels[i][2];
      sums[c][3]++;
    }
    for (var j = 0; j < k; j++) {
      if (sums[j][3] > 0) {
        centroids[j] = [
          Math.round(sums[j][0]/sums[j][3]),
          Math.round(sums[j][1]/sums[j][3]),
          Math.round(sums[j][2]/sums[j][3])
        ];
      }
    }
  }
  return centroids;
}

function ctSamplePixels(imageData, step) {
  var px = [], data = imageData.data;
  for (var i = 0; i < data.length; i += step * 4) {
    if (data[i+3] < 128) continue; // skip transparent
    px.push([data[i], data[i+1], data[i+2]]);
  }
  return px;
}

function rgbToHex(r, g, b) {
  return '#' + [r,g,b].map(function(v){ return v.toString(16).padStart(2,'0'); }).join('').toUpperCase();
}

/* ── Tailwind scale generation ────────────────────────────── */
function ctGenTailwindScale(baseHex, name) {
  if (typeof chroma === 'undefined') return null;
  var steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  var result = {};
  try {
    var base = chroma(baseHex);
    var baseL = base.get('hsl.l');
    steps.forEach(function(step) {
      var t = 1 - step / 1000;
      var lightness = 0.05 + t * 0.9;
      var sat = base.get('hsl.s') * (0.6 + t * 0.4);
      var h   = base.get('hsl.h') || 0;
      result[step] = chroma.hsl(h, Math.min(sat, 1), lightness).hex().toUpperCase();
    });
  } catch(e) {
    steps.forEach(function(s){ result[s] = baseHex; });
  }
  return result;
}

/* ================================================================
   IV. SUB-TOOL INIT
   ================================================================ */

/* ── Color Picker ─────────────────────────────────────────── */
function ctInitPicker() {
  var canvas = document.getElementById('spectrumGradient');
  var cursor = document.getElementById('spectrumCursor');
  var hueSlider = document.getElementById('hueSlider');
  if (!canvas) return;

  function drawSpectrum(hue) {
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    // White → hue gradient (horizontal)
    var gH = ctx.createLinearGradient(0, 0, W, 0);
    gH.addColorStop(0, 'white');
    gH.addColorStop(1, 'hsl(' + hue + ',100%,50%)');
    ctx.fillStyle = gH;
    ctx.fillRect(0, 0, W, H);
    // Transparent → black gradient (vertical)
    var gV = ctx.createLinearGradient(0, 0, 0, H);
    gV.addColorStop(0, 'transparent');
    gV.addColorStop(1, 'black');
    ctx.fillStyle = gV;
    ctx.fillRect(0, 0, W, H);
  }

  function pickFromCanvas(e) {
    var rect = canvas.getBoundingClientRect();
    var x = Math.max(0, Math.min(canvas.width,  (e.clientX - rect.left) * (canvas.width  / rect.width)));
    var y = Math.max(0, Math.min(canvas.height, (e.clientY - rect.top)  * (canvas.height / rect.height)));
    cursor.style.left = (x / canvas.width  * 100) + '%';
    cursor.style.top  = (y / canvas.height * 100) + '%';
    var pct = 100 / rect.width;
    var imgData = canvas.getContext('2d').getImageData(Math.round(x), Math.round(y), 1, 1).data;
    var hex = rgbToHex(imgData[0], imgData[1], imgData[2]);
    ctUpdatePickerColor(hex);
  }

  var dragging = false;
  canvas.addEventListener('mousedown', function(e){ dragging = true; pickFromCanvas(e); });
  document.addEventListener('mousemove', function(e){ if (dragging) pickFromCanvas(e); });
  document.addEventListener('mouseup',   function(){ dragging = false; });
  canvas.addEventListener('touchstart', function(e){ e.preventDefault(); pickFromCanvas(e.touches[0]); }, { passive: false });
  document.addEventListener('touchmove', function(e){ if (dragging) pickFromCanvas(e.touches[0]); });
  document.addEventListener('touchend',  function(){ dragging = false; });

  hueSlider.addEventListener('input', function() {
    drawSpectrum(this.value);
    var rect = cursor.getBoundingClientRect();
    // keep cursor, recompute color
  });

  drawSpectrum(248);
  ctUpdatePickerColor('#6366f1');
}

function ctUpdatePickerColor(hex) {
  var sw = document.getElementById('swatchPreview');
  if (sw) { sw.style.background = hex; sw.title = hex; }
  ctRenderFormatsList(hex, 'formatsList');
}

function ctRenderFormatsList(hex, containerId) {
  var c = document.getElementById(containerId);
  if (!c || typeof chroma === 'undefined') return;
  try {
    var fmts = ctGetAllFormats(hex);
    if (!fmts) return;
    var labels = ['hex','rgb','hsl','hsv','cmyk','lab','lch','hwb','oklch','xyz'];
    c.innerHTML = labels.map(function(k) {
      return '<div class="ct-format-row">' +
        '<span class="ct-format-row__label">' + k.toUpperCase() + '</span>' +
        '<span class="ct-format-row__value">' + (fmts[k] || '—') + '</span>' +
        '<button class="ct-format-row__copy" onclick="ctCopyToClipboard(\'' + (fmts[k]||'').replace(/'/g,"\\'") + '\')" title="Copy">📋</button>' +
        '</div>';
    }).join('');
  } catch(e) {}
}

/* ── Palette Generator ────────────────────────────────────── */
function ctInitPalette() {
  // Restore from URL hash
  ctRestoreFromHash();
  if (!State.palette.colors.length) ctGeneratePalette();

  // Harmony + count change
  var harmSel = document.getElementById('harmonySelect');
  var countIn = document.getElementById('paletteCount');
  if (harmSel) harmSel.addEventListener('change', function(){ State.palette.harmony = this.value; ctGeneratePalette(); });
  if (countIn) countIn.addEventListener('change', function(){ State.palette.count = parseInt(this.value) || 5; ctGeneratePalette(); });
}

function ctGeneratePalette() {
  var harmony = State.palette.harmony || 'random';
  var sel = document.getElementById('harmonySelect');
  if (sel) harmony = sel.value;
  var count = State.palette.count || 5;
  var cin   = document.getElementById('paletteCount');
  if (cin) count = parseInt(cin.value) || 5;

  var locked = State.palette.colors.filter(function(c){ return c.locked; });
  var newColors = ctGenHarmony(harmony, count);

  // merge locked
  var merged = State.palette.colors.map(function(c, i) {
    return c.locked ? c : (newColors[i] || { hex: ctRandomHex(), locked: false, id: ctGenId() });
  });
  while (merged.length < count) {
    merged.push({ hex: ctRandomHex(), locked: false, id: ctGenId() });
  }
  State.palette.colors = merged.slice(0, count);
  ctPushHistory();
  ctRenderPaletteBar();
  ctUpdateUrlHash();
}

function ctRenderPaletteBar() {
  var bar = document.getElementById('paletteBar');
  if (!bar) return;

  bar.innerHTML = State.palette.colors.map(function(c, i) {
    var txt = ctTextColor(c.hex);
    return '<div class="ct-palette-swatch' + (c.locked ? ' ct-palette-swatch--locked' : '') + '"' +
      ' style="background:' + c.hex + '" data-idx="' + i + '">' +
      '<div class="ct-palette-swatch__info">' +
        '<span class="ct-palette-swatch__hex" style="color:' + txt + '">' + c.hex + '</span>' +
        '<button class="ct-palette-swatch__btn" onclick="ctCopyToClipboard(\'' + c.hex + '\')" title="Copy">📋</button>' +
        '<button class="ct-palette-swatch__btn" onclick="ctToggleLock(' + i + ')" title="Lock">🔒</button>' +
        '<button class="ct-palette-swatch__btn" onclick="ctRemoveColor(' + i + ')" title="Remove">✕</button>' +
      '</div>' +
      '</div>';
  }).join('');

  // Init Sortable.js if available
  if (typeof Sortable !== 'undefined') {
    Sortable.create(bar, {
      animation: 150,
      onEnd: function(evt) {
        var moved = State.palette.colors.splice(evt.oldIndex, 1)[0];
        State.palette.colors.splice(evt.newIndex, 0, moved);
        ctUpdateUrlHash();
      }
    });
  }

  // export colors
  State.ui.exportColors = State.palette.colors.map(function(c){ return c.hex; });
}

function ctToggleLock(i) {
  State.palette.colors[i].locked = !State.palette.colors[i].locked;
  ctRenderPaletteBar();
}

function ctRemoveColor(i) {
  State.palette.colors.splice(i, 1);
  ctRenderPaletteBar();
  ctUpdateUrlHash();
}

function ctPushHistory() {
  var snap = JSON.stringify(State.palette.colors);
  State.palette.history = State.palette.history.slice(0, State.palette.historyIndex + 1);
  State.palette.history.push(snap);
  if (State.palette.history.length > 50) State.palette.history.shift();
  State.palette.historyIndex = State.palette.history.length - 1;
}

function ctUpdateUrlHash() {
  if (!State.palette.colors.length) return;
  history.replaceState(null, '', '#' + State.palette.colors.map(function(c){ return c.hex.replace('#',''); }).join('-'));
}

function ctRestoreFromHash() {
  var hash = location.hash.slice(1);
  if (!hash || _tool !== 'palette') return;
  var parts = hash.split('-');
  if (!parts.length) return;
  State.palette.colors = parts.map(function(p) {
    var h = ctNormalizeHex(p.startsWith('#') ? p : '#' + p);
    return ctIsValidHex(h) ? { hex: h, locked: false, id: ctGenId() } : null;
  }).filter(Boolean);
}

function ctShareUrl() {
  ctCopyToClipboard(location.href);
  ctShowToast(_lang === 'zh' ? '分享链接已复制！' : 'Share URL copied!', 'success');
}

/* ── Color Wheel ──────────────────────────────────────────── */
function ctInitWheel() {
  var canvas = document.getElementById('colorWheelCanvas');
  if (!canvas) return;
  ctDrawColorWheel(canvas);
  ctDrawWheelHarmony();

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var cx   = rect.width  / 2, cy = rect.height / 2;
    var x    = e.clientX - rect.left - cx;
    var y    = e.clientY - rect.top  - cy;
    var r    = Math.sqrt(x*x + y*y);
    if (r > rect.width/2) return;
    var hue  = ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
    var sat  = r / (rect.width / 2);
    var hex  = typeof chroma !== 'undefined' ? chroma.hsl(hue, Math.min(sat, 1), 0.5).hex() : ctRandomHex();
    var inp  = document.getElementById('wheelBaseColor');
    if (inp) { inp.value = hex; }
    ctDrawWheelHarmony();
  });

  var inp = document.getElementById('wheelBaseColor');
  if (inp) inp.addEventListener('input', ctDrawWheelHarmony);
}

function ctDrawColorWheel(canvas) {
  var ctx = canvas.getContext('2d');
  var W = canvas.width, H = canvas.height;
  var cx = W/2, cy = H/2, r = Math.min(cx, cy) - 2;
  for (var angle = 0; angle < 360; angle++) {
    var startAngle = (angle - 1) * Math.PI / 180;
    var endAngle   = (angle + 1) * Math.PI / 180;
    var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0,   'white');
    grad.addColorStop(0.5, 'hsl(' + angle + ',100%,50%)');
    grad.addColorStop(1,   'hsl(' + angle + ',100%,10%)');
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
  }
}

function ctDrawWheelHarmony() {
  var inp = document.getElementById('wheelBaseColor');
  var sel = document.getElementById('wheelHarmony');
  var res = document.getElementById('wheelResult');
  var out = document.getElementById('wheelCssOutput');
  if (!inp || !sel || !res) return;

  var baseHex = inp.value;
  if (!ctIsValidHex(baseHex) || typeof chroma === 'undefined') return;

  var baseHue = chroma(baseHex).get('hsl.h') || 0;
  var harmony = sel ? sel.value : 'complementary';
  var genColors = ctGenHarmony(harmony, 5).map(function(c){ return c.hex; });
  genColors[0] = baseHex;

  res.innerHTML = genColors.map(function(h) {
    return '<div style="display:inline-flex;flex-direction:column;align-items:center;gap:4px;margin:4px">' +
      '<div style="width:48px;height:48px;border-radius:8px;background:' + h + ';border:1px solid #e2e8f0;cursor:pointer" onclick="ctCopyToClipboard(\'' + h + '\')"></div>' +
      '<span style="font-size:11px;font-family:monospace">' + h + '</span>' +
      '</div>';
  }).join('');

  if (out) {
    out.textContent = genColors.map(function(h, i){ return '--wheel-' + (i+1) + ': ' + h + ';'; }).join('\n');
  }
}

/* ── Converter ────────────────────────────────────────────── */
function ctInitConverter() {
  ctConvertAll('#6366f1');
}

function ctConvertAll(val) {
  var c = document.getElementById('converterSwatch');
  var f = document.getElementById('converterFormats');
  if (!val) val = (document.getElementById('converterInput') || {}).value || '#6366f1';
  var hex = val.trim();
  if (!hex.startsWith('#')) hex = '#' + hex;
  if (!ctIsValidHex(hex) || typeof chroma === 'undefined') return;
  hex = ctNormalizeHex(hex);
  if (c) c.style.background = hex;
  if (!f) return;

  var fmts = ctGetAllFormats(hex);
  if (!fmts) return;

  var labels = { hex:'HEX', rgb:'RGB', hsl:'HSL', hsv:'HSV', cmyk:'CMYK', lab:'LAB', lch:'LCH', hwb:'HWB', oklch:'OKLCH', xyz:'XYZ' };
  f.innerHTML = Object.keys(labels).map(function(k) {
    return '<div class="ct-format-row">' +
      '<span class="ct-format-row__label">' + labels[k] + '</span>' +
      '<span class="ct-format-row__value">' + (fmts[k]||'—') + '</span>' +
      '<button class="ct-format-row__copy" onclick="ctCopyToClipboard(\'' + (fmts[k]||'').replace(/'/g,"\\'") + '\')">📋</button>' +
      '</div>';
  }).join('');
}

/* ── Contrast Checker ─────────────────────────────────────── */
function ctInitContrast() {
  ctCalcContrast();
}

function ctCalcContrast() {
  var fgTxt = document.getElementById('contrastFgText');
  var bgTxt = document.getElementById('contrastBgText');
  var fgPick = document.getElementById('contrastFg');
  var bgPick = document.getElementById('contrastBg');
  if (!fgTxt || !bgTxt) return;

  // sync pickers ↔ text
  if (document.activeElement === fgPick && fgPick) fgTxt.value = fgPick.value;
  if (document.activeElement === bgPick && bgPick) bgTxt.value = bgPick.value;
  if (fgPick && /^#[0-9A-Fa-f]{6}$/.test(fgTxt.value)) fgPick.value = fgTxt.value;
  if (bgPick && /^#[0-9A-Fa-f]{6}$/.test(bgTxt.value)) bgPick.value = bgTxt.value;

  var fg = fgTxt.value, bg = bgTxt.value;
  var prev = document.getElementById('contrastPreview');
  var prevTxt = document.getElementById('contrastPreviewText');
  if (prev)    prev.style.cssText    = 'background:' + bg + ';color:' + fg;

  var res = ctCalcContrastValues(fg, bg);
  if (!res) return;

  var el = document.getElementById('contrastResults');
  if (!el) return;

  var passLabel = _lang === 'zh' ? '通过' : 'Pass';
  var failLabel = _lang === 'zh' ? '未通过' : 'Fail';

  function badge(ok) {
    return '<span class="ct-contrast-card__badge ct-contrast-card__badge--' + (ok?'pass':'fail') + '">' + (ok?passLabel:failLabel) + '</span>';
  }

  el.innerHTML =
    ctContrastCard('WCAG Ratio', res.wcag + ':1', null) +
    ctContrastCard('WCAG AA Normal', res.wcag.toFixed(2), badge(res.aa.normal)) +
    ctContrastCard('WCAG AA Large', res.wcag.toFixed(2), badge(res.aa.large)) +
    ctContrastCard('WCAG AAA Normal', res.wcag.toFixed(2), badge(res.aaa.normal)) +
    ctContrastCard('WCAG AAA Large', res.wcag.toFixed(2), badge(res.aaa.large)) +
    ctContrastCard('APCA Score', res.apca, badge(res.apca >= 45));
}

function ctContrastCard(label, value, badgeHtml) {
  return '<div class="ct-contrast-card">' +
    '<div class="ct-contrast-card__label">' + label + '</div>' +
    '<div class="ct-contrast-card__value">' + value + '</div>' +
    (badgeHtml || '') +
    '</div>';
}

function ctSwapContrast() {
  var fg = document.getElementById('contrastFgText');
  var bg = document.getElementById('contrastBgText');
  if (!fg || !bg) return;
  var tmp = fg.value; fg.value = bg.value; bg.value = tmp;
  var fgP = document.getElementById('contrastFg');
  var bgP = document.getElementById('contrastBg');
  if (fgP) fgP.value = fg.value;
  if (bgP) bgP.value = bg.value;
  ctCalcContrast();
}

/* ── Gradient Generator ───────────────────────────────────── */
function ctInitGradient() {
  ctRenderGradientStops();
  ctUpdateGradient();
}

function ctRenderGradientStops() {
  var c = document.getElementById('gradientStops');
  if (!c) return;
  c.innerHTML = State.gradient.stops.map(function(s, i) {
    return '<div class="ct-gradient-stop">' +
      '<input type="color" value="' + s.color + '" onchange="ctUpdateStopColor(' + i + ',this.value)">' +
      '<input type="range" min="0" max="100" value="' + s.position + '" class="ct-range" style="flex:1" oninput="ctUpdateStopPos(' + i + ',this.value)">' +
      '<span style="width:36px;font-size:13px;text-align:right">' + s.position + '%</span>' +
      '<button class="ct-btn ct-btn--ghost ct-btn--sm" onclick="ctRemoveStop(' + i + ')">✕</button>' +
      '</div>';
  }).join('');
}

function ctUpdateStopColor(i, v) { State.gradient.stops[i].color = v; ctUpdateGradient(); }
function ctUpdateStopPos(i, v)   { State.gradient.stops[i].position = parseInt(v); ctUpdateGradient(); }

function ctRemoveStop(i) {
  if (State.gradient.stops.length <= 2) return;
  State.gradient.stops.splice(i, 1);
  ctRenderGradientStops();
  ctUpdateGradient();
}

function ctAddGradientStop() {
  State.gradient.stops.push({ color: ctRandomHex(), position: 50 });
  ctRenderGradientStops();
  ctUpdateGradient();
}

function ctUpdateGradient() {
  var typeEl  = document.getElementById('gradientType');
  var angleEl = document.getElementById('gradientAngle');
  var spaceEl = document.getElementById('gradientSpace');
  var prev    = document.getElementById('gradientPreview');
  var cssEl   = document.getElementById('gradientCss');

  var type  = typeEl  ? typeEl.value  : 'linear';
  var angle = angleEl ? parseInt(angleEl.value) || 90 : 90;
  var space = spaceEl ? spaceEl.value : 'oklch';

  var css = ctBuildGradientCSS(State.gradient.stops, type, angle, space);
  if (prev)  prev.style.background = css;
  if (cssEl) cssEl.textContent = 'background: ' + css + ';';
}

function ctCopyGradientCss() {
  var el = document.getElementById('gradientCss');
  if (el) ctCopyToClipboard(el.textContent);
}

/* ── Image Picker ─────────────────────────────────────────── */
function ctInitImagePicker() {
  document.addEventListener('paste', function(e) {
    if (_tool !== 'image-picker') return;
    var items = e.clipboardData ? e.clipboardData.items : [];
    for (var i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        ctAddFiles([items[i].getAsFile()]);
        break;
      }
    }
  });
}

function ctDragOver(e) {
  e.preventDefault();
  document.getElementById('uploadDefault').style.display = 'none';
  document.getElementById('uploadHover').style.display   = 'flex';
  document.getElementById('uploadZone').classList.add('ct-upload-zone--hovering');
}

function ctDragLeave(e) {
  e.preventDefault();
  if (document.getElementById('uploadZone').contains(e.relatedTarget)) return;
  document.getElementById('uploadDefault').style.display = 'flex';
  document.getElementById('uploadHover').style.display   = 'none';
  document.getElementById('uploadZone').classList.remove('ct-upload-zone--hovering');
}

function ctDrop(e) {
  e.preventDefault();
  document.getElementById('uploadZone').classList.remove('ct-upload-zone--hovering');
  ctAddFiles(e.dataTransfer.files);
}

function ctHandleFile(e) { ctAddFiles(e.target.files); }

function ctAddFiles(files) {
  var file = files[0];
  if (!file) return;
  var allowed = ['image/jpeg','image/png','image/webp','image/svg+xml','image/gif'];
  if (!allowed.includes(file.type)) { ctShowToast('Unsupported format', 'error'); return; }
  if (file.size > 10 * 1024 * 1024) { ctShowToast('File too large (max 10MB)', 'error'); return; }

  var url = URL.createObjectURL(file);
  State.objectURLs.push(url);
  ctLoadImageToCanvas(url);
}

function ctLoadImageToCanvas(url) {
  var img = new Image();
  img.onload = function() {
    var wrapper = document.getElementById('imageCanvasWrapper');
    var canvas  = document.getElementById('imageCanvas');
    var upDef   = document.getElementById('uploadDefault');
    if (!canvas) return;

    var maxW = Math.min(img.naturalWidth, 900);
    var scale = maxW / img.naturalWidth;
    canvas.width  = maxW;
    canvas.height = img.naturalHeight * scale;

    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    State.imagePicker.imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    State.imagePicker.canvasCtx = ctx;
    State.imagePicker.imageLoaded = true;

    if (wrapper) wrapper.style.display = 'block';
    if (upDef)   upDef.style.display   = 'none';
    document.getElementById('uploadZone').style.minHeight = '0';

    ctBindCanvasPixelPicker(canvas);
    ctExtractDominant(State.imagePicker.colorCount || 6);
  };
  img.src = url;
}

function ctBindCanvasPixelPicker(canvas) {
  var loupe = document.getElementById('colorLoupe');
  var loupeCanvas = document.getElementById('loupeCanvas');
  var loupeLabel  = document.getElementById('loupeLabel');

  canvas.addEventListener('mousemove', function(e) {
    var rect = canvas.getBoundingClientRect();
    var x = Math.round((e.clientX - rect.left) * (canvas.width / rect.width));
    var y = Math.round((e.clientY - rect.top)  * (canvas.height / rect.height));
    var d = State.imagePicker.canvasCtx.getImageData(x, y, 1, 1).data;
    var hex = rgbToHex(d[0], d[1], d[2]);

    if (loupe) {
      loupe.style.display = 'block';
      loupe.style.left    = (e.offsetX + 20) + 'px';
      loupe.style.top     = (e.offsetY - 60) + 'px';
      if (loupeCanvas) {
        var lctx = loupeCanvas.getContext('2d');
        lctx.fillStyle = hex;
        lctx.fillRect(0, 0, 100, 80);
      }
      if (loupeLabel) loupeLabel.textContent = hex;
    }
  });

  canvas.addEventListener('mouseleave', function() {
    if (loupe) loupe.style.display = 'none';
  });

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var x = Math.round((e.clientX - rect.left) * (canvas.width / rect.width));
    var y = Math.round((e.clientY - rect.top)  * (canvas.height / rect.height));
    var d = State.imagePicker.canvasCtx.getImageData(x, y, 1, 1).data;
    ctCopyToClipboard(rgbToHex(d[0], d[1], d[2]));
  });
}

function ctExtractDominant(count) {
  if (!State.imagePicker.imageData) return;
  var pixels = ctSamplePixels(State.imagePicker.imageData, 4);
  if (!pixels.length) return;

  // Run K-means in a micro-async fashion to not block UI
  setTimeout(function() {
    var centroids = ctKMeans(pixels, count, 10);
    State.imagePicker.dominantColors = centroids.map(function(c){ return rgbToHex(c[0], c[1], c[2]); });
    ctRenderDominantColors();
  }, 10);
}

function ctRenderDominantColors() {
  var c = document.getElementById('dominantColors');
  if (!c) return;
  c.innerHTML = State.imagePicker.dominantColors.map(function(hex) {
    var txt = ctTextColor(hex);
    return '<div style="display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer" onclick="ctCopyToClipboard(\'' + hex + '\')">' +
      '<div style="width:64px;height:64px;border-radius:10px;background:' + hex + ';border:1px solid rgba(0,0,0,.1)"></div>' +
      '<span style="font-size:11px;font-family:monospace">' + hex + '</span>' +
      '</div>';
  }).join('');
}

/* ── Color Blindness ──────────────────────────────────────── */
function ctInitBlindness() {
  ctSimulateBlindness();
}

function ctSimulateBlindness() {
  var typeEl  = document.getElementById('blindnessType');
  var palInp  = document.getElementById('blindnessPaletteInput');
  var origEl  = document.getElementById('blindnessOriginal');
  var simEl   = document.getElementById('blindnessSimulated');
  var lblEl   = document.getElementById('blindnessTypeLabel');
  if (!typeEl || !palInp) return;

  var type    = typeEl.value;
  var hexList = palInp.value.trim().split(/\s+/).filter(Boolean).map(ctNormalizeHex).filter(ctIsValidHex);
  if (!hexList.length) return;

  if (lblEl) lblEl.textContent = typeEl.options[typeEl.selectedIndex].text;

  function renderStrip(el, colors) {
    el.innerHTML = colors.map(function(hex) {
      return '<div class="ct-palette-strip-swatch" style="background:' + hex + '">' +
        '<span>' + hex + '</span></div>';
    }).join('');
  }

  if (origEl) renderStrip(origEl, hexList);
  if (simEl) {
    var simColors = hexList.map(function(h){ return ctSimulateBlind(h, type); });
    renderStrip(simEl, simColors);
  }
}

/* ── Color Names (140 CSS + extended) ────────────────────── */
var CT_CSS_COLORS = [
  {name:'AliceBlue',hex:'#F0F8FF'},{name:'AntiqueWhite',hex:'#FAEBD7'},{name:'Aqua',hex:'#00FFFF'},
  {name:'Aquamarine',hex:'#7FFFD4'},{name:'Azure',hex:'#F0FFFF'},{name:'Beige',hex:'#F5F5DC'},
  {name:'Bisque',hex:'#FFE4C4'},{name:'Black',hex:'#000000'},{name:'BlanchedAlmond',hex:'#FFEBCD'},
  {name:'Blue',hex:'#0000FF'},{name:'BlueViolet',hex:'#8A2BE2'},{name:'Brown',hex:'#A52A2A'},
  {name:'BurlyWood',hex:'#DEB887'},{name:'CadetBlue',hex:'#5F9EA0'},{name:'Chartreuse',hex:'#7FFF00'},
  {name:'Chocolate',hex:'#D2691E'},{name:'Coral',hex:'#FF7F50'},{name:'CornflowerBlue',hex:'#6495ED'},
  {name:'Cornsilk',hex:'#FFF8DC'},{name:'Crimson',hex:'#DC143C'},{name:'Cyan',hex:'#00FFFF'},
  {name:'DarkBlue',hex:'#00008B'},{name:'DarkCyan',hex:'#008B8B'},{name:'DarkGoldenRod',hex:'#B8860B'},
  {name:'DarkGray',hex:'#A9A9A9'},{name:'DarkGreen',hex:'#006400'},{name:'DarkKhaki',hex:'#BDB76B'},
  {name:'DarkMagenta',hex:'#8B008B'},{name:'DarkOliveGreen',hex:'#556B2F'},{name:'DarkOrange',hex:'#FF8C00'},
  {name:'DarkOrchid',hex:'#9932CC'},{name:'DarkRed',hex:'#8B0000'},{name:'DarkSalmon',hex:'#E9967A'},
  {name:'DarkSeaGreen',hex:'#8FBC8F'},{name:'DarkSlateBlue',hex:'#483D8B'},{name:'DarkSlateGray',hex:'#2F4F4F'},
  {name:'DarkTurquoise',hex:'#00CED1'},{name:'DarkViolet',hex:'#9400D3'},{name:'DeepPink',hex:'#FF1493'},
  {name:'DeepSkyBlue',hex:'#00BFFF'},{name:'DimGray',hex:'#696969'},{name:'DodgerBlue',hex:'#1E90FF'},
  {name:'FireBrick',hex:'#B22222'},{name:'FloralWhite',hex:'#FFFAF0'},{name:'ForestGreen',hex:'#228B22'},
  {name:'Fuchsia',hex:'#FF00FF'},{name:'Gainsboro',hex:'#DCDCDC'},{name:'GhostWhite',hex:'#F8F8FF'},
  {name:'Gold',hex:'#FFD700'},{name:'GoldenRod',hex:'#DAA520'},{name:'Gray',hex:'#808080'},
  {name:'Green',hex:'#008000'},{name:'GreenYellow',hex:'#ADFF2F'},{name:'HoneyDew',hex:'#F0FFF0'},
  {name:'HotPink',hex:'#FF69B4'},{name:'IndianRed',hex:'#CD5C5C'},{name:'Indigo',hex:'#4B0082'},
  {name:'Ivory',hex:'#FFFFF0'},{name:'Khaki',hex:'#F0E68C'},{name:'Lavender',hex:'#E6E6FA'},
  {name:'LavenderBlush',hex:'#FFF0F5'},{name:'LawnGreen',hex:'#7CFC00'},{name:'LemonChiffon',hex:'#FFFACD'},
  {name:'LightBlue',hex:'#ADD8E6'},{name:'LightCoral',hex:'#F08080'},{name:'LightCyan',hex:'#E0FFFF'},
  {name:'LightGoldenRodYellow',hex:'#FAFAD2'},{name:'LightGray',hex:'#D3D3D3'},{name:'LightGreen',hex:'#90EE90'},
  {name:'LightPink',hex:'#FFB6C1'},{name:'LightSalmon',hex:'#FFA07A'},{name:'LightSeaGreen',hex:'#20B2AA'},
  {name:'LightSkyBlue',hex:'#87CEFA'},{name:'LightSlateGray',hex:'#778899'},{name:'LightSteelBlue',hex:'#B0C4DE'},
  {name:'LightYellow',hex:'#FFFFE0'},{name:'Lime',hex:'#00FF00'},{name:'LimeGreen',hex:'#32CD32'},
  {name:'Linen',hex:'#FAF0E6'},{name:'Magenta',hex:'#FF00FF'},{name:'Maroon',hex:'#800000'},
  {name:'MediumAquaMarine',hex:'#66CDAA'},{name:'MediumBlue',hex:'#0000CD'},{name:'MediumOrchid',hex:'#BA55D3'},
  {name:'MediumPurple',hex:'#9370DB'},{name:'MediumSeaGreen',hex:'#3CB371'},{name:'MediumSlateBlue',hex:'#7B68EE'},
  {name:'MediumSpringGreen',hex:'#00FA9A'},{name:'MediumTurquoise',hex:'#48D1CC'},{name:'MediumVioletRed',hex:'#C71585'},
  {name:'MidnightBlue',hex:'#191970'},{name:'MintCream',hex:'#F5FFFA'},{name:'MistyRose',hex:'#FFE4E1'},
  {name:'Moccasin',hex:'#FFE4B5'},{name:'NavajoWhite',hex:'#FFDEAD'},{name:'Navy',hex:'#000080'},
  {name:'OldLace',hex:'#FDF5E6'},{name:'Olive',hex:'#808000'},{name:'OliveDrab',hex:'#6B8E23'},
  {name:'Orange',hex:'#FFA500'},{name:'OrangeRed',hex:'#FF4500'},{name:'Orchid',hex:'#DA70D6'},
  {name:'PaleGoldenRod',hex:'#EEE8AA'},{name:'PaleGreen',hex:'#98FB98'},{name:'PaleTurquoise',hex:'#AFEEEE'},
  {name:'PaleVioletRed',hex:'#DB7093'},{name:'PapayaWhip',hex:'#FFEFD5'},{name:'PeachPuff',hex:'#FFDAB9'},
  {name:'Peru',hex:'#CD853F'},{name:'Pink',hex:'#FFC0CB'},{name:'Plum',hex:'#DDA0DD'},
  {name:'PowderBlue',hex:'#B0E0E6'},{name:'Purple',hex:'#800080'},{name:'RebeccaPurple',hex:'#663399'},
  {name:'Red',hex:'#FF0000'},{name:'RosyBrown',hex:'#BC8F8F'},{name:'RoyalBlue',hex:'#4169E1'},
  {name:'SaddleBrown',hex:'#8B4513'},{name:'Salmon',hex:'#FA8072'},{name:'SandyBrown',hex:'#F4A460'},
  {name:'SeaGreen',hex:'#2E8B57'},{name:'SeaShell',hex:'#FFF5EE'},{name:'Sienna',hex:'#A0522D'},
  {name:'Silver',hex:'#C0C0C0'},{name:'SkyBlue',hex:'#87CEEB'},{name:'SlateBlue',hex:'#6A5ACD'},
  {name:'SlateGray',hex:'#708090'},{name:'Snow',hex:'#FFFAFA'},{name:'SpringGreen',hex:'#00FF7F'},
  {name:'SteelBlue',hex:'#4682B4'},{name:'Tan',hex:'#D2B48C'},{name:'Teal',hex:'#008080'},
  {name:'Thistle',hex:'#D8BFD8'},{name:'Tomato',hex:'#FF6347'},{name:'Turquoise',hex:'#40E0D0'},
  {name:'Violet',hex:'#EE82EE'},{name:'Wheat',hex:'#F5DEB3'},{name:'White',hex:'#FFFFFF'},
  {name:'WhiteSmoke',hex:'#F5F5F5'},{name:'Yellow',hex:'#FFFF00'},{name:'YellowGreen',hex:'#9ACD32'}
];

function ctInitNames() {
  ctRenderNamesGrid(CT_CSS_COLORS);
}

function ctFilterNames(q) {
  q = q.toLowerCase().trim();
  var filtered = q ? CT_CSS_COLORS.filter(function(c) {
    return c.name.toLowerCase().includes(q) || c.hex.toLowerCase().includes(q);
  }) : CT_CSS_COLORS;
  ctRenderNamesGrid(filtered);
}

function ctRenderNamesGrid(list) {
  var c = document.getElementById('namesGrid');
  var n = document.getElementById('namesCount');
  if (!c) return;
  if (n) n.textContent = list.length + ' colors';
  if (!list.length) { c.innerHTML = '<p style="color:var(--ct-text-2);grid-column:1/-1">No colors found.</p>'; return; }
  c.innerHTML = list.map(function(col) {
    return '<div class="ct-name-swatch" onclick="ctCopyToClipboard(\'' + col.hex + '\')" title="' + col.hex + '">' +
      '<div class="ct-name-swatch__color" style="background:' + col.hex + '"></div>' +
      '<div class="ct-name-swatch__info">' +
        '<span class="ct-name-swatch__name">' + col.name + '</span>' +
        '<span class="ct-name-swatch__hex">' + col.hex + '</span>' +
      '</div>' +
      '</div>';
  }).join('');
}

/* ── Color Mixer ──────────────────────────────────────────── */
function ctInitMixer() {
  ctMixColors();
  // sync text → color pickers
  var inputs = [
    { txt: 'mixerColor1Text', pick: 'mixerColor1' },
    { txt: 'mixerColor2Text', pick: 'mixerColor2' }
  ];
  inputs.forEach(function(pair) {
    var txt  = document.getElementById(pair.txt);
    var pick = document.getElementById(pair.pick);
    if (txt && pick) {
      pick.addEventListener('change', function(){ txt.value  = pick.value; ctMixColors(); });
      txt.addEventListener('input',   function(){ if (/^#[0-9A-Fa-f]{6}$/.test(txt.value)) { pick.value = txt.value; ctMixColors(); } });
    }
  });
}

function ctMixColors() {
  var c1  = (document.getElementById('mixerColor1') || {}).value  || '#6366f1';
  var c2  = (document.getElementById('mixerColor2') || {}).value  || '#ec4899';
  var rat = parseInt((document.getElementById('mixerRatio') || {}).value || 50) / 100;
  var res = document.getElementById('mixerResult');
  var rvEl = document.getElementById('ratioVal');
  if (rvEl) rvEl.textContent = Math.round(rat * 100);
  if (!res || typeof chroma === 'undefined') return;

  var steps = 7;
  var html  = '';
  for (var i = 0; i <= steps; i++) {
    var t   = i / steps;
    var hex = chroma.mix(c1, c2, t, 'rgb').hex().toUpperCase();
    html += '<div class="ct-mixer-step">' +
      '<div class="ct-mixer-step__swatch" style="background:' + hex + '"></div>' +
      '<span class="ct-mixer-step__label">' + hex + '</span>' +
      '</div>';
  }
  res.innerHTML = html;
}

/* ── Tailwind Generator ───────────────────────────────────── */
function ctInitTailwind() {
  ctGenTailwind();
  // sync text ↔ picker
  var pick = document.getElementById('twBaseColor');
  var txt  = document.getElementById('twBaseText');
  if (pick && txt) {
    pick.addEventListener('change', function(){ txt.value = pick.value; ctGenTailwind(); });
    txt.addEventListener('input',   function(){ if (/^#[0-9A-Fa-f]{6}$/.test(txt.value)) { pick.value = txt.value; ctGenTailwind(); } });
  }
}

function ctGenTailwind() {
  var baseHex  = (document.getElementById('twBaseColor') || {}).value || '#6366f1';
  var name     = (document.getElementById('twColorName') || {}).value || 'primary';
  var scaleEl  = document.getElementById('twScale');
  var cfgEl    = document.getElementById('twConfig');

  var scale = ctGenTailwindScale(baseHex, name);
  if (!scale || !scaleEl) return;

  var steps = [50,100,200,300,400,500,600,700,800,900,950];
  scaleEl.innerHTML = steps.map(function(s) {
    var hex = scale[s] || baseHex;
    var txt = ctTextColor(hex);
    return '<div class="ct-tw-shade" style="background:' + hex + ';color:' + txt + '">' +
      '<span class="ct-tw-shade__step">' + s + '</span>' +
      '<span class="ct-tw-shade__hex">' + hex + '</span>' +
      '</div>';
  }).join('');

  if (cfgEl) {
    var obj = {};
    steps.forEach(function(s){ obj[s] = scale[s] || baseHex; });
    cfgEl.textContent = "module.exports = {\n  theme: {\n    extend: {\n      colors: {\n        '" +
      name + "': " + JSON.stringify(obj, null, 8).replace(/^/gm, '        ').trim() + "\n      }\n    }\n  }\n}";
  }
}

function ctCopyTwConfig() {
  var el = document.getElementById('twConfig');
  if (el) ctCopyToClipboard(el.textContent);
}

/* ================================================================
   V. EXPORT MODAL (I-04)
   ================================================================ */
function ctOpenExportModal() {
  var colors = State.ui.exportColors.length ? State.ui.exportColors : State.palette.colors.map(function(c){ return c.hex; });
  if (!colors.length) { ctShowToast('No palette to export', 'error'); return; }

  var modal   = document.getElementById('exportModal');
  var tabsEl  = document.getElementById('exportTabs');
  var codeEl  = document.getElementById('exportCode');
  if (!modal) return;

  var formats = ['css','scss','json','tailwind','svg','gpl'];
  State.ui.exportFormat = 'css';
  State.ui.exportColors = colors;

  tabsEl.innerHTML = formats.map(function(f) {
    return '<button class="ct-export-tab' + (f==='css'?' ct-export-tab--active':'') + '" onclick="ctSwitchExportTab(\'' + f + '\')">' + f.toUpperCase() + '</button>';
  }).join('');

  codeEl.textContent = ctFormatExport(colors, 'css');
  modal.style.display = 'flex';
}

function ctSwitchExportTab(fmt) {
  State.ui.exportFormat = fmt;
  document.querySelectorAll('.ct-export-tab').forEach(function(b) {
    b.classList.toggle('ct-export-tab--active', b.textContent.toLowerCase() === fmt);
  });
  var el = document.getElementById('exportCode');
  if (el) el.textContent = ctFormatExport(State.ui.exportColors, fmt);
}

function ctCopyExportCode() {
  var el = document.getElementById('exportCode');
  if (el) ctCopyToClipboard(el.textContent);
}

function ctDownloadExport() {
  var fmt  = State.ui.exportFormat;
  var data = ctFormatExport(State.ui.exportColors, fmt);
  var mimes = { css:'text/css', scss:'text/x-scss', json:'application/json', tailwind:'application/javascript', svg:'image/svg+xml', gpl:'text/plain' };
  var exts  = { css:'css', scss:'scss', json:'json', tailwind:'js', svg:'svg', gpl:'gpl' };
  var blob  = new Blob([data], { type: mimes[fmt] || 'text/plain' });
  if (typeof saveAs !== 'undefined') {
    saveAs(blob, 'palette.' + (exts[fmt] || 'txt'));
  } else {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'palette.' + (exts[fmt] || 'txt');
    a.click();
    URL.revokeObjectURL(a.href);
  }
  ctShowToast('Export complete!', 'success');
}

function ctCloseExportModal() {
  var modal = document.getElementById('exportModal');
  if (modal) modal.style.display = 'none';
}

/* ================================================================
   VI. BEFORE/AFTER COMPARE SLIDER (I-04)
   ================================================================ */
function ctInitCompareSlider() {
  var container = document.getElementById('previewCompare');
  var divider   = document.getElementById('compareDivider');
  var afterWrap = document.getElementById('compareAfter');
  if (!container || !divider) return;

  var dragging = false;

  function update(clientX) {
    var rect = container.getBoundingClientRect();
    var pct  = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
    divider.style.left  = pct + '%';
    if (afterWrap) {
      afterWrap.style.width = (100 - pct) + '%';
      afterWrap.style.left  = pct + '%';
    }
  }

  divider.addEventListener('mousedown', function(e){ dragging = true; e.preventDefault(); });
  document.addEventListener('mousemove', function(e){ if (dragging) update(e.clientX); });
  document.addEventListener('mouseup',   function(){ dragging = false; });

  divider.addEventListener('touchstart', function(e){ dragging = true; e.preventDefault(); }, { passive: false });
  document.addEventListener('touchmove', function(e){ if (dragging) update(e.touches[0].clientX); });
  document.addEventListener('touchend',  function(){ dragging = false; });

  container.addEventListener('click', function(e) {
    if (divider.contains(e.target)) return;
    update(e.clientX);
  });
}

function ctClosePreview() {
  var modal = document.getElementById('previewModal');
  if (modal) modal.style.display = 'none';
}

/* ================================================================
   VII. KEYBOARD SHORTCUTS (I-03)
   ================================================================ */
function ctInitKeyboard() {
  document.addEventListener('keydown', function(e) {
    if (['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) return;
    switch (e.code) {
      case 'Space':
        if (_tool === 'palette') { e.preventDefault(); ctGeneratePalette(); }
        break;
      case 'Escape':
        ctCloseExportModal();
        ctClosePreview();
        break;
    }
  });
}

/* ================================================================
   VIII. FAQ ACCORDION
   ================================================================ */
function ctInitFaqAccordion() {
  document.querySelectorAll('.ct-faq__item').forEach(function(item) {
    item.addEventListener('toggle', function() {
      if (item.open) {
        document.querySelectorAll('.ct-faq__item').forEach(function(o) {
          if (o !== item) o.removeAttribute('open');
        });
      }
    });
  });
}

/* ================================================================
   IX. KEYBOARD HINTS TOGGLE
   ================================================================ */
function ctToggleKbd() {
  var panel = document.getElementById('kbdPanel');
  if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

/* ================================================================
   X. CLEANUP
   ================================================================ */
window.addEventListener('beforeunload', function() {
  State.objectURLs.forEach(function(u) { try { URL.revokeObjectURL(u); } catch(e){} });
});

