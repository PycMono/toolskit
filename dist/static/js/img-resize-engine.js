/**
 * img-resize-engine.js
 * 纯客户端图片调整大小引擎（Canvas API）
 *
 * 导出接口（全局函数）：
 *   IREngine.resizeFile(file, options) → Promise<Result>
 *   IREngine.resizeBatch(files, options, onProgress) → Promise<Result[]>
 *
 * options: {
 *   mode: 'pixel' | 'percent' | 'preset',
 *   width: number,      // pixel / preset 模式目标宽
 *   height: number,     // pixel / preset 模式目标高
 *   percent: number,    // percent 模式缩放比例 (10-200)
 *   lockRatio: boolean, // 锁定宽高比（pixel 模式）
 *   format: string,     // 'original' | 'image/jpeg' | 'image/png' | 'image/webp'
 *   quality: number,    // 0.20 - 1.00
 * }
 *
 * Result: {
 *   id: string,
 *   file: File,           // 原文件引用
 *   blob: Blob,           // 输出结果
 *   url: string,          // object URL
 *   origW: number,
 *   origH: number,
 *   outW: number,
 *   outH: number,
 *   origSize: number,
 *   outSize: number,
 *   outMime: string,
 *   outExt: string,
 *   outName: string,
 * }
 */

;(function () {
  'use strict';

  /* ── 辅助函数 ── */
  function uid() {
    return Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
  }

  /**
   * 将 File → HTMLImageElement（已加载）
   */
  function loadImage(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () { resolve({ img: img, url: url }); };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('图片加载失败')); };
      img.src = url;
    });
  }

  /**
   * 根据 options 计算目标尺寸
   */
  function calcDimensions(origW, origH, options) {
    var mode = options.mode || 'pixel';
    var outW, outH;

    if (mode === 'percent') {
      var pct = Math.max(10, Math.min(200, options.percent || 100)) / 100;
      outW = Math.round(origW * pct);
      outH = Math.round(origH * pct);
    } else if (mode === 'pixel') {
      var tw = options.width  || origW;
      var th = options.height || origH;
      if (options.lockRatio) {
        // 以宽度为准，高度按比例
        var ratio = origH / origW;
        if (options._changedField === 'height') {
          outH = th;
          outW = Math.round(th / ratio);
        } else {
          outW = tw;
          outH = Math.round(tw * ratio);
        }
      } else {
        outW = tw;
        outH = th;
      }
    } else if (mode === 'preset') {
      // preset 固定尺寸，不锁定比例（填充裁剪模式与用户选择相同）
      outW = options.width  || origW;
      outH = options.height || origH;
    } else {
      outW = origW;
      outH = origH;
    }

    return {
      w: Math.max(1, Math.min(10000, outW)),
      h: Math.max(1, Math.min(10000, outH)),
    };
  }

  /**
   * 高质量下采样（Lanczos-like：分步缩放）
   * 若目标尺寸 < 原尺寸的一半，多步缩放以减少锯齿
   */
  function drawHQ(img, outW, outH) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    var srcW = img.naturalWidth;
    var srcH = img.naturalHeight;
    var curW = srcW;
    var curH = srcH;

    // 逐步缩小（每步不超过 50%）
    var steps = [];
    while (curW / 2 > outW || curH / 2 > outH) {
      curW = Math.ceil(curW / 2);
      curH = Math.ceil(curH / 2);
      steps.push({ w: curW, h: curH });
    }
    steps.push({ w: outW, h: outH });

    var prevCanvas = null;
    steps.forEach(function (step, i) {
      var c = document.createElement('canvas');
      c.width  = step.w;
      c.height = step.h;
      var cx = c.getContext('2d');
      cx.imageSmoothingEnabled  = true;
      cx.imageSmoothingQuality  = 'high';
      if (i === 0) {
        cx.drawImage(img, 0, 0, step.w, step.h);
      } else {
        cx.drawImage(prevCanvas, 0, 0, step.w, step.h);
      }
      prevCanvas = c;
    });

    return prevCanvas;
  }

  /**
   * canvas → Blob（Promise）
   */
  function canvasToBlob(canvas, mime, quality) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(
        function (blob) {
          if (blob) { resolve(blob); }
          else { reject(new Error('toBlob 失败，格式可能不受支持')); }
        },
        mime,
        quality
      );
    });
  }

  /**
   * 由 MIME 推导文件扩展名
   */
  function mimeToExt(mime) {
    var map = {
      'image/jpeg': 'jpg',
      'image/jpg':  'jpg',
      'image/png':  'png',
      'image/webp': 'webp',
    };
    return map[mime] || 'jpg';
  }

  /**
   * 根据用户选择的格式和原文件 MIME 确定输出 MIME
   */
  function resolveOutputMime(file, formatOption) {
    if (!formatOption || formatOption === 'original') {
      var t = file.type;
      // 如果原格式不支持 toBlob，退到 jpeg
      if (t === 'image/jpeg' || t === 'image/png' || t === 'image/webp') return t;
      return 'image/jpeg';
    }
    return formatOption; // 'image/jpeg' / 'image/png' / 'image/webp'
  }

  /**
   * 构建输出文件名
   */
  function buildOutName(origName, outMime) {
    var ext = mimeToExt(outMime);
    var base = origName.replace(/\.[^.]+$/, '');
    return base + '_resized.' + ext;
  }

  /* ═════════════════════════════════════════
     核心：单文件处理
     ═════════════════════════════════════════ */
  async function resizeFile(file, options) {
    var id = uid();
    var loaded;
    try {
      loaded = await loadImage(file);
    } catch (e) {
      throw new Error(file.name + '：' + e.message);
    }

    var img  = loaded.img;
    var srcUrl = loaded.url;
    var origW = img.naturalWidth;
    var origH = img.naturalHeight;

    var dim    = calcDimensions(origW, origH, options);
    var outMime = resolveOutputMime(file, options.format);
    var quality = Math.max(0.2, Math.min(1.0, options.quality || 0.9));

    // PNG 不使用 quality（强制 1.0，浏览器忽略此参数）
    var q = outMime === 'image/png' ? 1.0 : quality;

    var canvas;
    try {
      canvas = drawHQ(img, dim.w, dim.h);
    } finally {
      URL.revokeObjectURL(srcUrl);
    }

    var blob = await canvasToBlob(canvas, outMime, q);
    var outUrl = URL.createObjectURL(blob);

    return {
      id:       id,
      file:     file,
      blob:     blob,
      url:      outUrl,
      origW:    origW,
      origH:    origH,
      outW:     dim.w,
      outH:     dim.h,
      origSize: file.size,
      outSize:  blob.size,
      outMime:  outMime,
      outExt:   mimeToExt(outMime),
      outName:  buildOutName(file.name, outMime),
    };
  }

  /* ═════════════════════════════════════════
     批量处理（串行，避免内存溢出）
     ═════════════════════════════════════════ */
  async function resizeBatch(files, options, onProgress) {
    var results = [];
    for (var i = 0; i < files.length; i++) {
      try {
        var result = await resizeFile(files[i], options);
        results.push({ ok: true, data: result });
      } catch (e) {
        results.push({ ok: false, file: files[i], error: e.message });
      }
      if (typeof onProgress === 'function') {
        onProgress(i + 1, files.length, results[results.length - 1]);
      }
    }
    return results;
  }

  /* ═════════════════════════════════════════
     格式化工具（给 UI 使用）
     ═════════════════════════════════════════ */
  function fmtSize(bytes) {
    if (bytes < 1024)       return bytes + ' B';
    if (bytes < 1024*1024)  return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  }

  function fmtSavingPct(origSize, outSize) {
    if (!origSize) return '';
    var pct = ((origSize - outSize) / origSize * 100);
    if (pct > 0) return '节省 ' + pct.toFixed(0) + '%';
    if (pct < 0) return '增大 ' + Math.abs(pct).toFixed(0) + '%';
    return '大小不变';
  }

  /* ── 暴露全局接口 ── */
  window.IREngine = {
    resizeFile:    resizeFile,
    resizeBatch:   resizeBatch,
    calcDimensions: calcDimensions,
    fmtSize:       fmtSize,
    fmtSavingPct:  fmtSavingPct,
  };

})();

