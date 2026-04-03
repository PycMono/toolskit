'use strict';
// jwt decoder + signature verification
function initToolOptions() {
  const target = document.getElementById('inputOptions') || document.getElementById('toolOptions');
  if (!target) return;
  target.innerHTML =
    '<span class="jt-options-label">' + (i18n('json.jwt.secret') || '签名密钥') + '</span>' +
    '<input id="jwtSecret" type="text" placeholder="' + (i18n('json.jwt.secret_placeholder') || '可选：输入密钥验证签名') + '" class="jt-options-input" style="width:260px">';
}

function processJson() {
  clearErrorPanel();
  const raw = getInput().trim().replace(/^Bearer\s+/i, ''); if (!raw) return;
  const parts = raw.split('.');
  if (parts.length < 2) { showToast(i18n('json.jwt.invalid') || '无效 JWT（需含至少 2 段）', 'error'); return; }
  try {
    const b64 = s => s.replace(/-/g, '+').replace(/_/g, '/');
    const header  = JSON.parse(atob(b64(parts[0])));
    const payload = JSON.parse(atob(b64(parts[1])));
    const now = Math.floor(Date.now() / 1000);
    const exp = payload.exp, iat = payload.iat;
    const isExpired = exp && exp < now;

    const result = {
      header, payload,
      signature: parts[2] || '',
      meta: {
        algorithm: header.alg,
        type: header.typ,
        issuedAt:  iat ? new Date(iat * 1000).toISOString() : null,
        expiresAt: exp ? new Date(exp * 1000).toISOString() : null,
        isExpired,
        timeLeft: exp && !isExpired ? fmtDur(exp - now) : null
      }
    };
    setOutput(JSON.stringify(result, null, 2));
    renderJwtPanel(result, parts);

    // Verify signature if secret is provided
    const secret = document.getElementById('jwtSecret')?.value;
    if (secret) {
      verifyJwtSignature(parts, secret, header.alg);
    }
  } catch(e) { showToast(i18n('json.jwt.parse_error') || 'JWT 解析失败：' + e.message, 'error'); }
}

function renderJwtPanel(jwt, parts) {
  const panel = document.getElementById('jwtPanel'); if (!panel) return;
  const { meta } = jwt;

  // Colorize header/payload with syntax highlighting
  const headerHtml = syntaxHighlight(JSON.stringify(jwt.header, null, 2));
  const payloadHtml = syntaxHighlight(JSON.stringify(jwt.payload, null, 2));

  let algoWarning = '';
  if (meta.algorithm === 'none') {
    algoWarning = '<div style="background:#fef3c7;border:1px solid #fbbf24;padding:8px 12px;border-radius:6px;color:#92400e;font-size:0.8125rem;margin-bottom:12px">⚠️ ' + (i18n('json.jwt.alg_none') || '算法为 none，签名未加密！') + '</div>';
  } else if (meta.algorithm === 'HS256' || meta.algorithm === 'HS384' || meta.algorithm === 'HS512') {
    algoWarning = '<div style="background:#dbeafe;border:1px solid #93c5fd;padding:8px 12px;border-radius:6px;color:#1e40af;font-size:0.8125rem;margin-bottom:12px">ℹ️ ' + (i18n('json.jwt.can_verify') || '输入密钥可验证 HMAC 签名') + '</div>';
  }

  panel.innerHTML =
    algoWarning +
    '<div class="jt-jwt-grid">' +
      '<div class="jt-jwt-section"><h3>Header</h3><pre>' + headerHtml + '</pre></div>' +
      '<div class="jt-jwt-section"><h3>Payload</h3><pre>' + payloadHtml + '</pre></div>' +
    '</div>' +
    '<div class="jt-jwt-meta">' +
      '<span>' + (i18n('json.jwt.algorithm') || '算法') + '：<strong>' + (meta.algorithm || '—') + '</strong></span>' +
      (meta.issuedAt  ? '<span>' + (i18n('json.jwt.issued') || '签发') + '：' + meta.issuedAt + '</span>' : '') +
      (meta.expiresAt ? '<span class="' + (meta.isExpired ? 'jt-jwt-expired' : '') + '">' + (meta.isExpired ? '⚠️ ' + (i18n('json.jwt.expired') || 'Token 已过期') : (i18n('json.jwt.expires') || '有效期至') + ' ' + meta.expiresAt + '（' + (i18n('json.jwt.remaining') || '剩余') + ' ' + meta.timeLeft + '）') + '</span>' : '') +
    '</div>' +
    '<div id="jwtVerifyResult"></div>';
  panel.style.display = 'block';
}

// Syntax highlight JSON for display
function syntaxHighlight(json) {
  return json
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"([^"]+)"(?=\s*:)/g, '<span style="color:#7c3aed">"$1"</span>')
    .replace(/:\s*"([^"]*)"/g, ': <span style="color:#16a34a">"$1"</span>')
    .replace(/:\s*(-?\d+\.?\d*)/g, ': <span style="color:#b45309">$1</span>')
    .replace(/:\s*(true|false)/g, ': <span style="color:#7c3aed">$1</span>')
    .replace(/:\s*(null)/g, ': <span style="color:#9ca3af">$1</span>');
}

// Verify HMAC signature using Web Crypto API
async function verifyJwtSignature(parts, secret, algorithm) {
  const resultEl = document.getElementById('jwtVerifyResult');
  if (!resultEl) return;

  const algMap = {
    'HS256': { name: 'HMAC', hash: 'SHA-256' },
    'HS384': { name: 'HMAC', hash: 'SHA-384' },
    'HS512': { name: 'HMAC', hash: 'SHA-512' },
  };

  const alg = algMap[algorithm];
  if (!alg) {
    resultEl.innerHTML = '<div style="margin-top:12px;padding:8px 12px;border-radius:6px;font-size:0.8125rem;background:#fef3c7;color:#92400e">⚠️ ' +
      (i18n('json.jwt.unsupported_alg') || '不支持验证此算法') + '：' + algorithm + '</div>';
    return;
  }

  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey('raw', keyData, alg, false, ['verify']);

    const signingInput = parts[0] + '.' + parts[1];
    const b64 = s => s.replace(/-/g, '+').replace(/_/g, '/');
    const pad = s => s + '='.repeat((4 - s.length % 4) % 4);
    const signatureStr = atob(pad(b64(parts[2] || '')));
    const signatureData = new Uint8Array([...signatureStr].map(c => c.charCodeAt(0)));

    const isValid = await crypto.subtle.verify('HMAC', key, signatureData, encoder.encode(signingInput));

    if (isValid) {
      resultEl.innerHTML = '<div style="margin-top:12px;padding:10px 14px;border-radius:6px;font-size:0.8125rem;background:#d1fae5;color:#065f46;font-weight:600">✅ ' +
        (i18n('json.jwt.signature_valid') || '签名验证通过！密钥匹配。') + '</div>';
    } else {
      resultEl.innerHTML = '<div style="margin-top:12px;padding:10px 14px;border-radius:6px;font-size:0.8125rem;background:#fee2e2;color:#991b1b;font-weight:600">❌ ' +
        (i18n('json.jwt.signature_invalid') || '签名验证失败！密钥不匹配。') + '</div>';
    }
  } catch(e) {
    resultEl.innerHTML = '<div style="margin-top:12px;padding:8px 12px;border-radius:6px;font-size:0.8125rem;background:#fee2e2;color:#991b1b">❌ ' +
      (i18n('json.jwt.verify_error') || '验证出错') + '：' + escapeHtml(e.message) + '</div>';
  }
}

function fmtDur(s) {
  if (s < 60) return s + (i18n('json.jwt.seconds') || '秒');
  if (s < 3600) return Math.floor(s / 60) + (i18n('json.jwt.minutes') || '分钟');
  if (s < 86400) return Math.floor(s / 3600) + (i18n('json.jwt.hours') || '小时');
  return Math.floor(s / 86400) + (i18n('json.jwt.days') || '天');
}
