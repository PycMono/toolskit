'use strict';
// jwt decoder
function initToolOptions() {}
function processJson() {
  clearErrorPanel();
  const raw = getInput().trim().replace(/^Bearer\s+/i,''); if (!raw) return;
  const parts = raw.split('.');
  if (parts.length < 2) { showToast('无效 JWT（需含至少 2 段）','error'); return; }
  try {
    const b64 = s => s.replace(/-/g,'+').replace(/_/g,'/');
    const header  = JSON.parse(atob(b64(parts[0])));
    const payload = JSON.parse(atob(b64(parts[1])));
    const now = Math.floor(Date.now()/1000);
    const exp = payload.exp, iat = payload.iat;
    const isExpired = exp && exp < now;
    const result = { header, payload, signature:parts[2]||'',
      meta:{ algorithm:header.alg, type:header.typ,
        issuedAt:  iat ? new Date(iat*1000).toISOString() : null,
        expiresAt: exp ? new Date(exp*1000).toISOString() : null,
        isExpired, timeLeft: exp && !isExpired ? fmtDur(exp-now) : null }};
    setOutput(JSON.stringify(result, null, 2));
    renderJwtPanel(result);
  } catch(e) { showToast('JWT 解析失败：'+e.message,'error'); }
}
function renderJwtPanel(jwt) {
  const panel = document.getElementById('jwtPanel'); if (!panel) return;
  const { meta } = jwt;
  panel.innerHTML = `
    <div class="jt-jwt-grid">
      <div class="jt-jwt-section"><h3>Header</h3><pre>${escapeHtml(JSON.stringify(jwt.header,null,2))}</pre></div>
      <div class="jt-jwt-section"><h3>Payload</h3><pre>${escapeHtml(JSON.stringify(jwt.payload,null,2))}</pre></div>
    </div>
    <div class="jt-jwt-meta">
      <span>算法：<strong>${meta.algorithm||'—'}</strong></span>
      ${meta.issuedAt  ? `<span>签发：${meta.issuedAt}</span>` : ''}
      ${meta.expiresAt ? `<span class="${meta.isExpired?'jt-jwt-expired':''}">${meta.isExpired ? '⚠️ Token 已过期' : `有效期至 ${meta.expiresAt}（剩余 ${meta.timeLeft}）`}</span>` : ''}
    </div>`;
  panel.style.display = 'block';
}
function fmtDur(s) {
  if (s<60) return `${s}秒`; if (s<3600) return `${Math.floor(s/60)}分钟`;
  if (s<86400) return `${Math.floor(s/3600)}小时`; return `${Math.floor(s/86400)}天`;
}
