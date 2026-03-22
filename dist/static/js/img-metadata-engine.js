/**
 * img-metadata-engine.js
 * 图片元数据解析引擎（基于 exifr.js）
 * 架构：文件 → exifr.parse → 五大分类 → 格式化输出
 */

'use strict';

/* ═══════════════════════════════════════════════
   全局状态
═══════════════════════════════════════════════ */
const IMState = {
  files:    [],    // 原始 File 对象
  results:  {},    // { fileId: ParsedResult }
  activeId: null,  // 当前显示的文件 ID
};

const IM_MAX_FILES   = 10;
const IM_MAX_SIZE_MB = 20;

/* ═══════════════════════════════════════════════
   文件校验 & 入队
═══════════════════════════════════════════════ */
function addFiles(fileList) {
  const allowed = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
    'image/tiff', 'image/heic', 'image/heif',
  ];
  let added = 0;

  for (const file of Array.from(fileList)) {
    if (IMState.files.length >= IM_MAX_FILES) {
      showToast(`最多同时分析 ${IM_MAX_FILES} 张图片`, 'error'); break;
    }
    const typeOk = allowed.includes(file.type) ||
      /\.(jpe?g|png|webp|tiff?|heic|heif)$/i.test(file.name);
    if (!typeOk) {
      showToast(`${file.name}：不支持的格式`, 'error'); continue;
    }
    if (file.size > IM_MAX_SIZE_MB * 1024 * 1024) {
      showToast(`${file.name} 超过 ${IM_MAX_SIZE_MB}MB 限制`, 'error'); continue;
    }
    const key = `${file.name}-${file.size}`;
    if (IMState.files.some(f => `${f.name}-${f.size}` === key)) continue;

    file._imId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    IMState.files.push(file);
    added++;
  }

  if (added > 0) processNewFiles();
}

/* ═══════════════════════════════════════════════
   处理新加入的文件（串行队列）
═══════════════════════════════════════════════ */
async function processNewFiles() {
  showResultsSection();

  const pending = IMState.files.filter(f => !IMState.results[f._imId]);

  for (const file of pending) {
    addFileItem(file, 'processing');
    try {
      const result = await parseMetadata(file);
      IMState.results[file._imId] = result;
      updateFileItem(file._imId, 'done');
      if (!IMState.activeId) selectFile(file._imId);
    } catch (err) {
      IMState.results[file._imId] = { error: err.message, file };
      updateFileItem(file._imId, 'error');
    }
  }
}

/* ═══════════════════════════════════════════════
   核心解析：exifr.js
═══════════════════════════════════════════════ */
async function parseMetadata(file) {
  let raw = {};

  // 主解析：启用全部段
  try {
    const main = await exifr.parse(file, {
      tiff: true, exif: true, gps: true,
      iptc: true, xmp: true,
      icc: false, jfif: true, ihdr: true,
      multiSegment: true,
      mergeOutput: true,
      translateKeys: true,
      translateValues: true,
      reviveValues: true,
      sanitize: false,
    });
    if (main) Object.assign(raw, main);
  } catch (e) { /* ignore */ }

  // 补充 GPS（mergeOutput 有时会丢失纬度/经度）
  try {
    const gps = await exifr.gps(file);
    if (gps && gps.latitude != null) {
      raw.latitude  = gps.latitude;
      raw.longitude = gps.longitude;
    }
  } catch (e) { /* ignore */ }

  // 读取图片原始尺寸
  const dims = await getImageDimensions(file);

  return {
    id:       file._imId,
    file,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type || guessType(file.name),
    width:    dims.w,
    height:   dims.h,
    raw,
    thumbUrl: URL.createObjectURL(file),
    sections: buildSections(file, dims, raw),
  };
}

/* ═══════════════════════════════════════════════
   构建五大分类数据
═══════════════════════════════════════════════ */
function buildSections(file, dims, raw) {
  return {
    basic:  buildBasic(file, dims, raw),
    camera: buildCamera(raw),
    gps:    buildGPS(raw),
    iptc:   buildIPTC(raw),
    xmp:    buildXMP(raw),
  };
}

function buildBasic(file, dims, raw) {
  const fields = [];
  push(fields, '文件名',    file.name);
  push(fields, '文件大小',  formatFileSize(file.size));
  push(fields, '文件类型',  file.type || guessType(file.name));
  if (dims.w && dims.h) {
    push(fields, '图片尺寸', `${dims.w} × ${dims.h} px`, true);
  }
  push(fields, '色彩空间',  raw.ColorSpace === 1 ? 'sRGB' : (raw.ColorSpace === 65535 ? 'Uncalibrated' : raw.ColorSpace));
  push(fields, '位深度',    raw.BitsPerSample ? `${raw.BitsPerSample} bit` : null);
  push(fields, '方向',      formatOrientation(raw.Orientation));
  push(fields, '相机品牌',  raw.Make);
  push(fields, '相机型号',  raw.Model);
  push(fields, '拍摄时间',  formatDate(raw.DateTimeOriginal || raw.DateTime));
  return fields;
}

function buildCamera(raw) {
  const fields = [];
  push(fields, '快门速度',  formatShutter(raw.ExposureTime));
  push(fields, '光圈值',    raw.FNumber ? `f/${raw.FNumber.toFixed(1)}` : null, true);
  push(fields, 'ISO 感光度', raw.ISOSpeedRatings ? String(raw.ISOSpeedRatings) : (raw.ISO ? String(raw.ISO) : null), true);
  push(fields, '焦距',      raw.FocalLength ? `${raw.FocalLength} mm` : null);
  push(fields, '等效焦距',  raw.FocalLengthIn35mmFilm ? `${raw.FocalLengthIn35mmFilm} mm` : null);
  push(fields, '镜头型号',  raw.LensModel || raw.LensID || raw.Lens);
  push(fields, '闪光灯',    formatFlash(raw.Flash));
  push(fields, '白平衡',    formatWhiteBalance(raw.WhiteBalance));
  push(fields, '测光模式',  formatMeteringMode(raw.MeteringMode));
  push(fields, '曝光模式',  formatExposureMode(raw.ExposureMode));
  push(fields, '曝光补偿',  raw.ExposureBiasValue != null ? `${raw.ExposureBiasValue > 0 ? '+' : ''}${raw.ExposureBiasValue} EV` : null);
  push(fields, '软件',      raw.Software);
  return fields;
}

function buildGPS(raw) {
  const fields = [];
  const lat = raw.latitude  || raw.GPSLatitude;
  const lng = raw.longitude || raw.GPSLongitude;
  const alt = raw.GPSAltitude;
  const dir = raw.GPSImgDirection;
  const spd = raw.GPSSpeed;

  push(fields, '纬度',      lat  != null ? lat.toFixed(7) : null, true);
  push(fields, '经度',      lng  != null ? lng.toFixed(7) : null, true);
  push(fields, '海拔',      alt  != null ? `${alt.toFixed(1)} m` : null);
  push(fields, '拍摄方向',  dir  != null ? `${dir.toFixed(1)}°` : null);
  push(fields, 'GPS 速度',  spd  != null ? `${spd.toFixed(1)} km/h` : null);

  return { fields, lat, lng };
}

function buildIPTC(raw) {
  const fields = [];
  push(fields, '版权',      raw.Copyright);
  push(fields, '作者',      raw.Artist || raw['Creator'] || raw.By_line || raw['By-line']);
  push(fields, '图片说明',  raw.ImageDescription || raw.Caption || raw['Caption-Abstract']);
  push(fields, '关键词',    Array.isArray(raw.Keywords) ? raw.Keywords.join(', ') : raw.Keywords);
  push(fields, '来源',      raw.Credit);
  push(fields, '信息来源',  raw.Source);
  push(fields, '城市',      raw.City);
  push(fields, '省/州',     raw['Province-State']);
  push(fields, '国家',      raw.Country || raw['Country-PrimaryLocationName']);
  push(fields, '类别',      raw.Category);
  return fields;
}

function buildXMP(raw) {
  const fields = [];
  const rating = raw.Rating || raw['xmp:Rating'];
  push(fields, '评级',      rating != null ? '⭐'.repeat(Math.max(0, Math.min(5, parseInt(rating)))) + ` (${rating})` : null);
  push(fields, '创建工具',  raw.CreatorTool || raw['xmp:CreatorTool']);
  push(fields, '修改工具',  raw.HistorySoftwareAgent);
  push(fields, '标签颜色',  raw.Label || raw['xmp:Label']);
  push(fields, 'DPI（水平）', raw.XResolution ? `${raw.XResolution} DPI` : null);
  push(fields, 'DPI（垂直）', raw.YResolution ? `${raw.YResolution} DPI` : null);
  push(fields, '色彩配置文件', raw.ProfileDescription);
  return fields;
}

/* ═══════════════════════════════════════════════
   字段 push 工具
═══════════════════════════════════════════════ */
function push(arr, label, value, highlight = false) {
  if (value == null || value === '' || value === undefined) return;
  arr.push({ label, value: String(value), highlight });
}

/* ═══════════════════════════════════════════════
   格式化工具函数
═══════════════════════════════════════════════ */
function getImageDimensions(file) {
  return new Promise(resolve => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload  = () => { URL.revokeObjectURL(url); resolve({ w: img.naturalWidth, h: img.naturalHeight }); };
    img.onerror = () => { URL.revokeObjectURL(url); resolve({ w: null, h: null }); };
    img.src = url;
  });
}

function formatShutter(val) {
  if (val == null) return null;
  if (val >= 1) return `${val}s`;
  return `1/${Math.round(1 / val)}s`;
}

function formatDate(val) {
  if (!val) return null;
  if (val instanceof Date) {
    return val.toLocaleString('zh-CN', { hour12: false });
  }
  // EXIF 格式: "2023:06:15 14:30:00"
  if (typeof val === 'string') {
    return val.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1/$2/$3');
  }
  return String(val);
}

function formatOrientation(val) {
  const map = {
    1: '正常', 2: '水平翻转', 3: '旋转 180°', 4: '垂直翻转',
    5: '顺时针 90° + 水平翻转', 6: '顺时针 90°',
    7: '逆时针 90° + 水平翻转', 8: '逆时针 90°',
  };
  return val ? (map[val] || `值 ${val}`) : null;
}

function formatFlash(val) {
  if (val == null) return null;
  return (val & 0x1) ? '已闪光' : '未闪光';
}

function formatWhiteBalance(val) {
  if (val == null) return null;
  return val === 0 ? '自动' : (val === 1 ? '手动' : `值 ${val}`);
}

function formatMeteringMode(val) {
  const map = { 0:'未知', 1:'平均', 2:'中央重点', 3:'点测光', 4:'多点', 5:'多分区', 6:'局部' };
  return val != null ? (map[val] || `值 ${val}`) : null;
}

function formatExposureMode(val) {
  const map = { 0:'自动曝光', 1:'手动曝光', 2:'自动包围曝光' };
  return val != null ? (map[val] || `值 ${val}`) : null;
}

function guessType(filename) {
  const ext = filename.split('.').pop()?.toLowerCase();
  const map = { jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png',
                webp:'image/webp', tif:'image/tiff', tiff:'image/tiff',
                heic:'image/heic', heif:'image/heif' };
  return map[ext] || 'image/*';
}

function formatFileSize(bytes) {
  if (!bytes)              return '0 B';
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/* ═══════════════════════════════════════════════
   导出：JSON / CSV / TXT
═══════════════════════════════════════════════ */
function exportData(format) {
  const result = IMState.results[IMState.activeId];
  if (!result || result.error) { showToast('无可导出的数据', 'info'); return; }

  const base = result.fileName.replace(/\.[^.]+$/, '');

  if (format === 'json') {
    const blob = new Blob([JSON.stringify(result.raw, null, 2)], { type: 'application/json' });
    saveAs(blob, `${base}-metadata.json`);

  } else if (format === 'csv') {
    const rows = [['Category', 'Field', 'Value']];
    const { basic, camera, gps, iptc, xmp } = result.sections;
    const allSections = [
      ['Basic',  basic ],
      ['Camera', camera],
      ['GPS',    Array.isArray(gps) ? gps : gps.fields],
      ['IPTC',   iptc  ],
      ['XMP',    xmp   ],
    ];
    for (const [cat, fields] of allSections) {
      if (!fields) continue;
      for (const f of fields) {
        rows.push([cat, f.label, `"${f.value.replace(/"/g, '""')}"`]);
      }
    }
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `${base}-metadata.csv`);

  } else if (format === 'txt') {
    const lines = [
      `图片元数据报告`,
      `文件：${result.fileName}`,
      `生成时间：${new Date().toLocaleString('zh-CN')}`,
      '═'.repeat(50),
      '',
    ];
    const sectionNames = { basic:'基础信息', camera:'相机参数', gps:'GPS 位置', iptc:'版权信息（IPTC）', xmp:'XMP 数据' };
    for (const [key, name] of Object.entries(sectionNames)) {
      let fields = result.sections[key];
      if (key === 'gps') fields = fields.fields;
      if (!fields || fields.length === 0) continue;
      lines.push(`【${name}】`);
      for (const f of fields) {
        lines.push(`  ${f.label.padEnd(14)}${f.value}`);
      }
      lines.push('');
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `${base}-metadata.txt`);
  }

  showToast(`已导出 ${format.toUpperCase()}`, 'success');
}

/* ═══════════════════════════════════════════════
   批量 ZIP 导出
═══════════════════════════════════════════════ */
async function exportAll() {
  const done = Object.values(IMState.results).filter(r => !r.error);
  if (done.length === 0) { showToast('没有可导出的数据', 'info'); return; }

  const btn = document.querySelector('.im-btn-download-all');
  if (btn) { btn.disabled = true; btn.textContent = '打包中...'; }

  try {
    const zip = new JSZip();
    for (const r of done) {
      const base = r.fileName.replace(/\.[^.]+$/, '');
      zip.file(`${base}-metadata.json`, JSON.stringify(r.raw, null, 2));
    }
    const ts = new Date().toISOString().slice(0, 10);
    const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE',
      compressionOptions: { level: 1 } });
    saveAs(zipBlob, `image-metadata-${ts}.zip`);
    showToast(`已打包 ${done.length} 张图片的元数据`, 'success');
  } catch (err) {
    showToast('打包失败：' + err.message, 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '⬇ 打包下载全部（ZIP）'; }
  }
}

/* ═══════════════════════════════════════════════
   清空
═══════════════════════════════════════════════ */
function clearAll() {
  for (const r of Object.values(IMState.results)) {
    if (r.thumbUrl) URL.revokeObjectURL(r.thumbUrl);
  }
  IMState.files = []; IMState.results = {}; IMState.activeId = null;
  document.getElementById('fileList').innerHTML       = '';
  document.getElementById('resultsSection').style.display = 'none';
  document.getElementById('bulkExport').style.display     = 'none';
  showToast('已清空全部', 'info');
}

