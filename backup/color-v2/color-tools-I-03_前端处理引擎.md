<!-- color-tools-I-03_前端处理引擎.md -->

# Color Tools — 前端处理引擎 (I-03)

---

## 1. 技术选型表

| 场景 | 方案 | 原因 |
|------|------|------|
| HEX/RGB/HSL/HSV 互转 | chroma.js | 成熟稳定，gzip 14KB |
| OKLCH/LAB/XYZ/LCH | colorjs.io (Color.js) | CSS Color Level 4 标准实现 |
| CMYK 转换 | 自研函数(ICC 近似) | chroma CMYK 精度不足 |
| HWB 转换 | 自研函数 | 轻量，CSS Level 4 规范 |
| 色轮和谐算法 | 自研(HSL 角度) | 6 种规则直接角度计算 |
| 调色板生成 | chroma.js scale + 种子 | 平滑色阶+可复现 |
| 图片像素采样 | Canvas 2D `getImageData()` | 原生高性能 |
| K-means 颜色聚类 | 自研 Web Worker | 不阻塞主线程 |
| WCAG 对比度 | 自研(W3C 相对亮度) | 5 行代码精确 |
| APCA 对比度 | 自研(APCAv4/SAPC) | Myndex 公开规范 |
| 色盲模拟 | 自研(Brettel/Viénot 矩阵) | 8 种缺陷精确矩阵 |
| 渐变插值 | colorjs.io `range()` | OKLCH/LCH 感知均匀 |
| 导出 PNG/SVG | html2canvas + SVG 模板 | 简单快捷 |
| 批量 ZIP | JSZip | 成熟稳定 |
| 拖拽排序 | Sortable.js | 触摸友好+动画 |
| 剪贴板 | Clipboard API + fallback | 现代优先旧浏览器回退 |

---

## 2. 引擎架构说明

### 2.1 全局状态对象

```javascript
const State = {
  palette: {
    colors: [],          // [{hex, locked, id}]
    harmony: 'random',
    count: 5,
    history: [],         // 撤销栈（max 50）
    historyIndex: -1,
  },
  picker: {
    currentColor: '#6366F1',
    formats: {},         // {hex,rgb,hsl,hsv,cmyk,lab,lch,oklch,hwb,xyz}
    recentColors: [],    // 最近 20 个
  },
  imagePicker: {
    imageLoaded: false,
    imageData: null,
    canvasCtx: null,
    dominantColors: [],
    pickedColor: null,
    algorithm: 'kmeans',
    colorCount: 6,
  },
  contrast: {
    fg: '#000000', bg: '#FFFFFF',
    wcagRatio: 21, apcaScore: 108,
    wcagAA: {normalText:true, largeText:true},
    wcagAAA: {normalText:true, largeText:true},
  },
  gradient: {
    stops: [{color:'#6366F1',position:0},{color:'#EC4899',position:100}],
    type: 'linear', angle: 90,
    colorSpace: 'oklch', longWay: false,
  },
  ui: {
    darkMode: false, activeSubTool: null,
    exportFormat: 'css', toastQueue: [],
  },
  objectURLs: [],
};
```

### 2.2 核心函数

#### `addFiles(fileList)` — 图片取色文件添加

```javascript
function addFiles(fileList) {
  const file = fileList[0];
  if (!file) return;
  const ALLOWED = ['image/jpeg','image/png','image/webp','image/svg+xml'];
  if (!ALLOWED.includes(file.type)) { showToast(T('error.unsupportedFormat'),'error'); return; }
  if (file.size > 10*1024*1024) { showToast(T('error.fileTooLarge'),'error'); return; }
  const url = URL.createObjectURL(file);
  State.objectURLs.push(url);
  loadImageToCanvas(url);
  gaTrackImageUpload(file.size/(1024*1024));
}
```

#### `generatePalette()` — 调色板生成

```javascript
function generatePalette() {
  const {harmony, count, colors} = State.palette;
  const locked = colors.filter(c=>c.locked);
  const baseHue = locked.length ? chroma(locked[0].hex).get('hsl.h') : Math.random()*360;

  let newColors;
  switch(harmony) {
    case 'complementary': newColors = genComplementary(baseHue, count); break;
    case 'analogous':     newColors = genAnalogous(baseHue, count);     break;
    case 'triadic':       newColors = genTriadic(baseHue, count);       break;
    case 'splitComplementary': newColors = genSplitComp(baseHue, count); break;
    case 'square':        newColors = genSquare(baseHue, count);        break;
    case 'monochromatic': newColors = genMonochromatic(baseHue, count); break;
    default:              newColors = genRandom(count);
  }
  // 合并锁定色
  const merged = colors.map((c,i) => c.locked ? c : {hex:newColors[i]?.hex||randomHex(), locked:false, id:genId()});
  while (merged.length < count) merged.push({hex:randomHex(), locked:false, id:genId()});
  State.palette.colors = merged.slice(0, count);
  pushHistory(); renderPaletteBar(); updateUrlHash();
  gaTrackPaletteGenerate(harmony, count);
}
```

#### `convertColor(input, fromSpace, toSpace)` — 色彩空间转换

```javascript
function convertColor(input, fromSpace, toSpace) {
  let color;
  try {
    switch(fromSpace) {
      case 'hex': color = chroma(input); break;
      case 'rgb': color = chroma(...parseRgb(input),'rgb'); break;
      case 'hsl': color = chroma(...parseHsl(input),'hsl'); break;
      case 'oklch': case 'hwb': case 'xyz':
        color = new Color(fromSpace, parseVals(input, fromSpace)); break;
      default: color = chroma(input);
    }
  } catch(e) { return {error: T('error.invalidHex')}; }
  if (toSpace === 'all') return getAllFormats(color);
  return formatTo(color, toSpace);
}

function getAllFormats(color) {
  const c = ensureChroma(color), cjs = ensureColorJS(color);
  return {
    hex: c.hex(), rgb: `rgb(${c.rgb().join(', ')})`,
    hsl: formatHsl(c), hsv: formatHsv(c), cmyk: formatCmyk(c),
    lab: `lab(${c.lab().map(v=>Math.round(v*100)/100).join(' ')})`,
    lch: `lch(${c.lch().map(v=>Math.round(v*100)/100).join(' ')})`,
    oklch: formatOklch(cjs), hwb: formatHwb(cjs), xyz: formatXyz(cjs),
  };
}
```

#### `calculateContrast(fg, bg)` — WCAG + APCA

```javascript
function calculateContrast(fg, bg) {
  const fgRgb = chroma(fg).rgb(), bgRgb = chroma(bg).rgb();

  // WCAG 2.1 相对亮度
  function sRGBtoLin(c) { c/=255; return c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4); }
  function lum(rgb) { return 0.2126*sRGBtoLin(rgb[0])+0.7152*sRGBtoLin(rgb[1])+0.0722*sRGBtoLin(rgb[2]); }
  const L1=lum(fgRgb), L2=lum(bgRgb);
  const wcagRatio = (Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);

  // APCA v4
  function sRGBtoY(rgb) {
    return Math.pow(rgb[0]/255,2.4)*0.2126729 + Math.pow(rgb[1]/255,2.4)*0.7151522 + Math.pow(rgb[2]/255,2.4)*0.0721750;
  }
  const txtY=sRGBtoY(fgRgb), bgY_=sRGBtoY(bgRgb);
  let apca;
  if(bgY_>txtY) apca=(Math.pow(bgY_,0.56)-Math.pow(txtY,0.57))*1.14*100;
  else apca=(Math.pow(bgY_,0.65)-Math.pow(txtY,0.62))*1.14*100;
  apca=Math.round(Math.abs(apca)*100)/100;

  return {
    wcagRatio: Math.round(wcagRatio*100)/100, apcaScore: apca,
    wcagAA: {normalText:wcagRatio>=4.5, largeText:wcagRatio>=3},
    wcagAAA: {normalText:wcagRatio>=7, largeText:wcagRatio>=4.5},
  };
}
```

#### `extractColorsFromImage()` — K-means 聚类（Web Worker）

```javascript
function extractColorsFromImage(imageData, count, algo) {
  return new Promise(resolve => {
    const workerCode = `
      self.onmessage = function(e) {
        const {pixels,count,algo} = e.data;
        const result = algo==='kmeans' ? kMeans(pixels,count,10) : medianCut(pixels,count);
        self.postMessage(result);
      };
      function kMeans(pixels,k,maxIter){/*...聚类实现...*/}
      function medianCut(pixels,k){/*...中切量化...*/}
    `;
    const blob = new Blob([workerCode],{type:'application/javascript'});
    const url = URL.createObjectURL(blob);
    State.objectURLs.push(url);
    const w = new Worker(url);
    w.onmessage = e => { resolve(e.data); w.terminate(); };
    w.postMessage({pixels:samplePixels(imageData,4), count, algo});
  });
}
```

#### `generateGradient()` — 感知均匀渐变

```javascript
function generateGradient(stops, type, angle, colorSpace, longWay) {
  const SAMPLES = 20;
  const intermediates = [];
  for(let i=0; i<stops.length-1; i++) {
    const from = new Color(stops[i].color), to = new Color(stops[i+1].color);
    const range = from.range(to, {space:colorSpace, hue:longWay?'longer':'shorter'});
    for(let j=0; j<=SAMPLES; j++) {
      const t=j/SAMPLES;
      const pos = stops[i].position + t*(stops[i+1].position-stops[i].position);
      intermediates.push({color:range(t).to('srgb').toString({format:'hex'}), position:pos});
    }
  }
  const cssStops = intermediates.map(s=>`${s.color} ${s.position}%`).join(', ');
  let css;
  switch(type) {
    case 'linear': css=`linear-gradient(${angle}deg, ${cssStops})`; break;
    case 'radial': css=`radial-gradient(circle, ${cssStops})`; break;
    case 'conic':  css=`conic-gradient(from ${angle}deg, ${cssStops})`; break;
  }
  return {css, intermediates};
}
```

#### `simulateColorBlindness(hex, type)` — 色盲模拟

```javascript
function simulateColorBlindness(hex, type) {
  const rgb = chroma(hex).rgb().map(v=>v/255);
  const lin = v => v<=0.04045?v/12.92:Math.pow((v+0.055)/1.055,2.4);
  const delin = v => v<=0.0031308?v*12.92:1.055*Math.pow(v,1/2.4)-0.055;
  const l = rgb.map(lin);

  const M = {
    protanopia:    [[0.152286,1.052583,-0.204868],[-0.114503,0.786281,0.328216],[0.004733,-0.048116,1.043382]],
    deuteranopia:  [[0.367322,0.860646,-0.227968],[0.280085,0.672501,0.047413],[-0.011820,0.042940,0.968881]],
    tritanopia:    [[1.255528,-0.076749,-0.178779],[-0.078411,0.930809,0.147602],[0.004733,0.691367,0.303900]],
    protanomaly:   [[0.458064,0.679578,-0.137642],[-0.062780,0.882803,0.179977],[0.002363,-0.024082,1.021719]],
    deuteranomaly: [[0.547494,0.607765,-0.155259],[0.181693,0.781742,0.036565],[-0.010410,0.027275,0.983136]],
    tritanomaly:   [[0.926670,0.092514,-0.019184],[-0.021191,0.964503,0.056688],[0.008437,0.054813,0.936750]],
    achromatopsia: [[0.2126,0.7152,0.0722],[0.2126,0.7152,0.0722],[0.2126,0.7152,0.0722]],
  };
  const m = M[type]; if(!m) return hex;
  const r = [m[0][0]*l[0]+m[0][1]*l[1]+m[0][2]*l[2], m[1][0]*l[0]+m[1][1]*l[1]+m[1][2]*l[2], m[2][0]*l[0]+m[2][1]*l[1]+m[2][2]*l[2]];
  return chroma(r.map(v=>Math.round(delin(Math.max(0,Math.min(1,v)))*255)),'rgb').hex();
}
```

#### `runConcurrent(tasks, limit=4)` — 并发控制

```javascript
async function runConcurrent(tasks, limit=4) {
  const results=[]; let idx=0;
  async function next() { while(idx<tasks.length) { const i=idx++; results[i]=await tasks[i](); } }
  await Promise.all(Array.from({length:Math.min(limit,tasks.length)},()=>next()));
  return results;
}
```

#### `downloadOne()` / `downloadAll()`

```javascript
function downloadOne(hex, format) {
  const c = formatExport([hex], format);
  saveAs(new Blob([c.data],{type:c.mime}), c.filename);
}
async function downloadAll() {
  const fmt = State.ui.exportFormat;
  const colors = State.palette.colors.map(c=>c.hex);
  if(fmt==='png') { const cv=await html2canvas(document.getElementById('paletteBar')); cv.toBlob(b=>saveAs(b,'palette.png')); }
  else if(fmt==='svg') { saveAs(new Blob([genSVG(colors)],{type:'image/svg+xml'}),'palette.svg'); }
  else { const c=formatExport(colors,fmt); saveAs(new Blob([c.data],{type:c.mime}),c.filename); }
  gaTrackPaletteExport(fmt, colors.length);
}
```

#### `clearAll()` — ⚠️ 释放所有 ObjectURL

```javascript
function clearAll() {
  State.objectURLs.forEach(u => { try{URL.revokeObjectURL(u)}catch(e){} });
  State.objectURLs = [];
  State.imagePicker = {imageLoaded:false,imageData:null,canvasCtx:null,dominantColors:[],pickedColor:null,algorithm:'kmeans',colorCount:6};
  const cv = document.getElementById('imageCanvas');
  if(cv) cv.getContext('2d').clearRect(0,0,cv.width,cv.height);
  document.getElementById('imageCanvasWrapper').style.display='none';
  document.getElementById('uploadDefault').style.display='flex';
}
```

#### 工具函数

```javascript
function formatFileSize(b) { if(!b) return '0 B'; const k=1024,s=['B','KB','MB']; const i=Math.floor(Math.log(b)/Math.log(k)); return (b/Math.pow(k,i)).toFixed(1)+' '+s[i]; }
function randomHex() { return '#'+Math.floor(Math.random()*16777215).toString(16).padStart(6,'0'); }
function genId() { return 'c_'+Math.random().toString(36).substr(2,9); }
function textColorForBg(hex) { return chroma(hex).luminance()>0.4?'#000':'#FFF'; }
function updateUrlHash() { history.replaceState(null,'','#'+State.palette.colors.map(c=>c.hex.replace('#','')).join('-')); }
function showToast(msg, type='info') {
  const el=document.createElement('div'); el.className='toast toast--'+type; el.textContent=msg;
  document.getElementById('toastContainer').appendChild(el);
  requestAnimationFrame(()=>el.classList.add('toast--visible'));
  setTimeout(()=>{el.classList.remove('toast--visible');el.addEventListener('transitionend',()=>el.remove())},3000);
}
function copyToClipboard(text) {
  (navigator.clipboard?.writeText(text) || Promise.reject()).then(()=>showToast(T('toast.copied'),'success'))
  .catch(()=>{const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);showToast(T('toast.copied'),'success');});
}
```

---

## 3. UI 事件绑定说明

### 拖拽事件（图片上传区）

```javascript
function handleDragOver(e) { e.preventDefault(); e.stopPropagation();
  document.getElementById('uploadDefault').style.display='none';
  document.getElementById('uploadHover').style.display='flex';
  document.getElementById('uploadZone').classList.add('upload-zone--hovering');
}
function handleDragLeave(e) { e.preventDefault(); e.stopPropagation();
  // ⚠️ 关键：排除子元素触发
  if(document.getElementById('uploadZone').contains(e.relatedTarget)) return;
  document.getElementById('uploadDefault').style.display='flex';
  document.getElementById('uploadHover').style.display='none';
  document.getElementById('uploadZone').classList.remove('upload-zone--hovering');
}
function handleDrop(e) { e.preventDefault(); e.stopPropagation();
  document.getElementById('uploadZone').classList.remove('upload-zone--hovering');
  addFiles(e.dataTransfer.files);
}
```

### 剪贴板粘贴

```javascript
document.addEventListener('paste', e => {
  if(State.ui.activeSubTool!=='image-picker') return;
  for(const item of (e.clipboardData?.items||[]))
    if(item.type.startsWith('image/')) { addFiles([item.getAsFile()]); break; }
});
```

### 键盘快捷键

```javascript
document.addEventListener('keydown', e => {
  if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) return;
  switch(e.code) {
    case 'Space': e.preventDefault(); generatePalette(); break;
    case 'KeyL': toggleLockActiveColor(); break;
    case 'KeyC': copyActiveColor(); break;
    case 'ArrowLeft': e.preventDefault(); adjustActiveHue(-5); break;
    case 'ArrowRight': e.preventDefault(); adjustActiveHue(5); break;
    case 'Delete': case 'Backspace': removeActiveColor(); break;
    case 'Escape': closeExportModal(); break;
  }
});
```

### 色轮和谐算法

```javascript
function genComplementary(h,n) { return expand([h,(h+180)%360],n); }
function genAnalogous(h,n) { const a=[]; for(let i=0;i<n;i++) a.push((h+(i-Math.floor(n/2))*30+360)%360); return huesToColors(a); }
function genTriadic(h,n) { return expand([h,(h+120)%360,(h+240)%360],n); }
function genSplitComp(h,n) { return expand([h,(h+150)%360,(h+210)%360],n); }
function genSquare(h,n) { return expand([h,(h+90)%360,(h+180)%360,(h+270)%360],n); }
function genMonochromatic(h,n) { return Array.from({length:n},(_,i)=>({hex:chroma.hsl(h,(50+Math.random()*30)/100,(20+(60/(n-1))*i)/100).hex()})); }
function expand(hues,n) { return Array.from({length:n},(_,i)=>({hex:chroma.hsl(hues[i%hues.length],(60+Math.random()*25)/100,(45+(i/n)*30+(Math.random()-.5)*10)/100).hex()})); }
```

### FAQ 手风琴（单展开）

```javascript
document.querySelectorAll('.faq__item').forEach(item => {
  item.addEventListener('toggle', () => {
    if(item.open) document.querySelectorAll('.faq__item').forEach(o=>{if(o!==item)o.removeAttribute('open');});
  });
});
```

---

## 4. 验收标准 Checklist

### 处理正确性
- [ ] HEX↔RGB转换精确（误差±1以内）
- [ ] HSL/HSV 环绕（0°=360°）处理正确
- [ ] CMYK 与 Adobe Illustrator 偏差 < 5%
- [ ] OKLCH/LAB/XYZ 使用 colorjs.io 精确计算
- [ ] WCAG 对比度与 WebAIM 一致
- [ ] APCA 与 Myndex 工具偏差 < 0.5
- [ ] 色盲模拟与 Adobe Color 视觉对比一致
- [ ] OKLCH 渐变无灰暗死区
- [ ] K-means 10 次迭代内收敛

### 性能
- [ ] 调色板生成 < 50ms（5 色）
- [ ] 颜色转换 10 格式同时 < 10ms
- [ ] 图片K-means(1000px图) < 500ms(Web Worker)
- [ ] 渐变生成 20 采样点 < 30ms
- [ ] 并发 Web Worker ≤ 4

### 内存安全
- [ ] `clearAll()` 释放全部 ObjectURL（含 Worker Blob）
- [ ] 切换子工具释放前工具资源
- [ ] 加载新图释放旧图 ObjectURL
- [ ] objectURLs 数组不无限增长

### 下载/导出
- [ ] CSS/SCSS/JSON/Tailwind 格式正确
- [ ] PNG 导出 2x Retina
- [ ] SVG 色值精确
- [ ] ASE 可被 Adobe 软件读取
- [ ] GPL 可被 GIMP 导入
- [ ] URL 分享可正确还原调色板

### 边界情况
- [ ] #000000 和 #FFFFFF 所有格式正确
- [ ] 无效输入(#GGGGGG)明确错误提示
- [ ] 10 色调色板不溢出
- [ ] 空调色板导出按钮 disabled
- [ ] 0 字节/损坏图片给出错误
- [ ] URL hash 无效颜色优雅降级
