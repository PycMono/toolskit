'use strict';

/**
 * ga-events.js — Google Analytics 4 事件追踪公共库
 * EnableGA=false 时 window.gtag 不存在，所有函数静默忽略，不影响业务逻辑。
 * 引入顺序：ga-events.js 必须在业务 JS 之前加载。
 */

/**
 * 安全封装 gtag 调用 — 当 gtag 不存在时静默忽略
 * @param {string} eventName
 * @param {Object} params
 */
function trackEvent(eventName, params = {}) {
  if (typeof gtag !== 'function') return;
  gtag('event', eventName, params);
}

/* ══════════════════════════════════════════
   通用事件：所有工具页面共用
══════════════════════════════════════════ */

/**
 * 文件上传
 * @param {string} toolName       工具名，如 'img-compress'
 * @param {number} fileCount      文件数量
 * @param {number} totalSizeMB    总大小（MB）
 */
function gaTrackUpload(toolName, fileCount, totalSizeMB) {
  trackEvent('file_upload', {
    event_category: toolName,
    file_count:     fileCount,
    total_size_mb:  parseFloat(totalSizeMB.toFixed(2)),
  });
}

/**
 * 处理完成
 * @param {string} toolName
 * @param {number} fileCount
 * @param {number} durationMs     处理耗时（毫秒）
 */
function gaTrackProcessDone(toolName, fileCount, durationMs) {
  trackEvent('process_complete', {
    event_category: toolName,
    file_count:     fileCount,
    duration_ms:    durationMs,
  });
}

/**
 * 文件下载（单张）
 * @param {string} toolName
 * @param {string} fileType       MIME type，如 'image/jpeg'
 */
function gaTrackDownload(toolName, fileType) {
  trackEvent('file_download', {
    event_category: toolName,
    file_type:      fileType,
  });
}

/**
 * 批量打包下载（ZIP）
 * @param {string} toolName
 * @param {number} fileCount
 */
function gaTrackDownloadAll(toolName, fileCount) {
  trackEvent('download_all_zip', {
    event_category: toolName,
    file_count:     fileCount,
  });
}

/**
 * 导出格式（JSON / CSV / TXT 等）
 * @param {string} toolName
 * @param {string} format         导出格式，如 'csv'
 */
function gaTrackExport(toolName, format) {
  trackEvent('export', {
    event_category: toolName,
    export_format:  format,
  });
}

/**
 * 工具参数变更（如压缩质量、输出格式等）
 * @param {string} toolName
 * @param {string} settingName    设置项名称，如 'quality'
 * @param {*}      value          新值
 */
function gaTrackSettingChange(toolName, settingName, value) {
  trackEvent('setting_change', {
    event_category: toolName,
    setting_name:   settingName,
    setting_value:  String(value),
  });
}

/**
 * 错误发生
 * @param {string} toolName
 * @param {string} errorType      错误类型标识
 * @param {string} errorMsg       错误信息（自动截断至 100 字符）
 */
function gaTrackError(toolName, errorType, errorMsg) {
  trackEvent('tool_error', {
    event_category: toolName,
    error_type:     errorType,
    error_message:  String(errorMsg).slice(0, 100),
  });
}

/**
 * 分享 / 复制
 * @param {string} toolName
 * @param {string} method         'copy_link' | 'copy_field' | 'native_share'
 */
function gaTrackShare(toolName, method) {
  trackEvent('share', {
    event_category: toolName,
    method:         method,
  });
}

