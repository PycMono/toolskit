# Block QR-03 · 二维码生成工具 — 内容输入面板（8 种类型）

> **文件**：`/static/js/media-qr-forms.js`  
> **预估工时**：2.5h  
> **依赖**：QR-02（页面布局）  
> **交付粒度**：8 种类型的完整表单 HTML 渲染 + 内容编码逻辑（按 QR 标准格式化字符串）

---

## 1. 竞品分析（各类型字段对标）

| 类型 | 竞品字段 | 本次实现 | 差异化 |
|------|---------|---------|------|
| URL | 网址输入 | ✅ + 协议自动补全 | 自动补 https:// |
| vCard | 姓名/电话/邮件/公司/职位/网站/地址 | ✅ 全部字段 | — |
| 文本 | 多行文本 + 字数统计 | ✅ | 实时字数统计 |
| SMS | 号码 + 内容 | ✅ | — |
| Email | 收件人 + 主题 + 正文 | ✅ | — |
| WiFi | SSID + 密码 + 加密类型 + 隐藏网络 | ✅ | — |
| Twitter | 推文内容 + 字数限制 | ✅ | 280 字限制提示 |
| Bitcoin | 钱包地址 + 金额 + 币种 + 备注 | ✅ | 支持 BTC/ETH/LTC |

---

## 2. 表单渲染 JS（`/static/js/media-qr-forms.js`）

```javascript
// /static/js/media-qr-forms.js
// 负责：各类型表单 HTML 渲染 + 内容编码

'use strict';

/* ══════════════════════════════════════════════
   表单渲染入口
════════════════════════════════════════════════ */
function renderForm(type) {
  const container = document.getElementById('formContainer');
  if (!container) return;

  const forms = {
    url:     renderURLForm,
    vcard:   renderVCardForm,
    text:    renderTextForm,
    sms:     renderSMSForm,
    email:   renderEmailForm,
    wifi:    renderWiFiForm,
    twitter: renderTwitterForm,
    bitcoin: renderBitcoinForm,
  };

  const fn = forms[type];
  if (fn) {
    container.innerHTML = fn();
    bindFormEvents(type);
  }
}

/* ══════════════════════════════════════════════
   1. URL 表单
════════════════════════════════════════════════ */
function renderURLForm() {
  return `
    <div class="qr-form-group">
      <label class="qr-form-label">网址 <span class="qr-required">*</span></label>
      <div class="qr-input-wrap">
        <span class="qr-input-prefix">🌐</span>
        <input type="url" id="field_url" class="qr-input qr-input--prefix"
               placeholder="https://example.com"
               autocomplete="off"
               oninput="onFormChange()">
      </div>
      <p class="qr-form-hint">支持 http://、https://、ftp:// 等协议前缀</p>
    </div>
  `;
}

function encodeURL() {
  let url = getValue('field_url').trim();
  if (!url) return null;
  // 自动补全 https://
  if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(url)) {
    url = 'https://' + url;
    document.getElementById('field_url').value = url;
  }
  // 基础 URL 校验
  try { new URL(url); } catch(e) {
    showToast('请输入合法的网址', 'error');
    return null;
  }
  return url;
}

/* ══════════════════════════════════════════════
   2. vCard 表单
════════════════════════════════════════════════ */
function renderVCardForm() {
  return `
    <div class="qr-form-grid-2">
      <div class="qr-form-group">
        <label class="qr-form-label">名 <span class="qr-required">*</span></label>
        <input type="text" id="field_vcard_firstname" class="qr-input"
               placeholder="张" oninput="onFormChange()">
      </div>
      <div class="qr-form-group">
        <label class="qr-form-label">姓</label>
        <input type="text" id="field_vcard_lastname" class="qr-input"
               placeholder="三" oninput="onFormChange()">
      </div>
    </div>

    <div class="qr-form-group">
      <label class="qr-form-label">手机号码</label>
      <input type="tel" id="field_vcard_phone" class="qr-input"
             placeholder="+86 138 0000 0000" oninput="onFormChange()">
    </div>

    <div class="qr-form-group">
      <label class="qr-form-label">电子邮件</label>
      <input type="email" id="field_vcard_email" class="qr-input"
             placeholder="zhangsan@example.com" oninput="onFormChange()">
    </div>

    <div class="qr-form-group">
      <label class="qr-form-label">公司</label>
      <input type="text" id="field_vcard_company" class="qr-input"
             placeholder="公司名称" oninput="onFormChange()">
    </div>

    <div class="qr-form-group">
      <label class="qr-form-label">职位</label>
      <input type="text" id="field_vcard_jobtitle" class="qr-input"
             placeholder="产品经理" oninput="onFormChange()">
    </div>

    <div class="qr-form-group">
      <label class="qr-form-label">网站</label>
      <input type="url" id="field_vcard_website" class="qr-input"
             placeholder="https://example.com" oninput="onFormChange()">
    </div>

    <div class="qr-form-section-title">地址（可选）</div>
    <div class="qr-form-group">
      <label class="qr-form-label">街道</label>
      <input type="text" id="field_vcard_street" class="qr-input"
             placeholder="中关村大街 1 号" oninput="onFormChange()">
    </div>

    <div class="qr-form-grid-3">
      <div class="qr-form-group">
        <label class="qr-form-label">城市</label>
        <input type="text" id="field_vcard_city" class="qr-input"
               placeholder="北京" oninput="onFormChange()">
      </div>
      <div class="qr-form-group">
        <label class="qr-form-label">邮编</label>
        <input type="text" id="field_vcard_zip" class="qr-input"
               placeholder="100000" oninput="onFormChange()">
      </div>
      <div class="qr-form-group">
        <label class="qr-form-label">国家</label>
        <input type="text" id="field_vcard_country" class="qr-input"
               placeholder="中国" oninput="onFormChange()">
      </div>
    </div>
  `;
}

function encodeVCard() {
  const firstname = getValue('field_vcard_firstname').trim();
  if (!firstname) { showToast('请填写姓名', 'error'); return null; }

  const fields = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${esc(getValue('field_vcard_lastname'))};${esc(firstname)};;;`,
    `FN:${esc(firstname)} ${esc(getValue('field_vcard_lastname'))}`.trim(),
  ];

  const phone   = getValue('field_vcard_phone').trim();
  const email   = getValue('field_vcard_email').trim();
  const company = getValue('field_vcard_company').trim();
  const title   = getValue('field_vcard_jobtitle').trim();
  const website = getValue('field_vcard_website').trim();
  const street  = getValue('field_vcard_street').trim();
  const city    = getValue('field_vcard_city').trim();
  const zip     = getValue('field_vcard_zip').trim();
  const country = getValue('field_vcard_country').trim();

  if (phone)   fields.push(`TEL;TYPE=CELL:${phone}`);
  if (email)   fields.push(`EMAIL:${email}`);
  if (company) fields.push(`ORG:${esc(company)}`);
  if (title)   fields.push(`TITLE:${esc(title)}`);
  if (website) fields.push(`URL:${website}`);
  if (street || city || zip || country) {
    fields.push(`ADR:;;${esc(street)};${esc(city)};;${esc(zip)};${esc(country)}`);
  }

  fields.push('END:VCARD');
  return fields.join('\n');
}

/* ══════════════════════════════════════════════
   3. 纯文本表单
════════════════════════════════════════════════ */
function renderTextForm() {
  return `
    <div class="qr-form-group">
      <div class="qr-form-label-row">
        <label class="qr-form-label">文字内容 <span class="qr-required">*</span></label>
        <span class="qr-char-count" id="textCharCount">0 / 300</span>
      </div>
      <textarea id="field_text" class="qr-textarea" rows="5"
                placeholder="请输入要编码的文字内容（最多 300 字符）"
                maxlength="300"
                oninput="onTextInput(this)"></textarea>
    </div>
  `;
}

function onTextInput(el) {
  const count = el.value.length;
  const countEl = document.getElementById('textCharCount');
  if (countEl) {
    countEl.textContent = `${count} / 300`;
    countEl.style.color = count > 280 ? '#dc2626' : '';
  }
  onFormChange();
}

function encodeText() {
  const text = getValue('field_text').trim();
  if (!text) { showToast('请输入文字内容', 'error'); return null; }
  if (text.length > 300) { showToast('文字内容不能超过 300 字符', 'error'); return null; }
  return text;
}

/* ══════════════════════════════════════════════
   4. SMS 表单
════════════════════════════════════════════════ */
function renderSMSForm() {
  return `
    <div class="qr-form-group">
      <label class="qr-form-label">手机号码 <span class="qr-required">*</span></label>
      <input type="tel" id="field_sms_phone" class="qr-input"
             placeholder="+86 138 0000 0000" oninput="onFormChange()">
    </div>
    <div class="qr-form-group">
      <label class="qr-form-label">短信内容（可选）</label>
      <textarea id="field_sms_message" class="qr-textarea" rows="3"
                placeholder="输入预填短信内容" oninput="onFormChange()"></textarea>
    </div>
  `;
}

function encodeSMS() {
  const phone = getValue('field_sms_phone').trim();
  if (!phone) { showToast('请填写手机号码', 'error'); return null; }
  const message = getValue('field_sms_message').trim();
  // SMS URI 格式：SMSTO:+8613800000000:消息内容
  return message
    ? `SMSTO:${phone}:${message}`
    : `SMSTO:${phone}`;
}

/* ══════════════════════════════════════════════
   5. Email 表单
════════════════════════════════════════════════ */
function renderEmailForm() {
  return `
    <div class="qr-form-group">
      <label class="qr-form-label">收件人邮箱 <span class="qr-required">*</span></label>
      <input type="email" id="field_email_to" class="qr-input"
             placeholder="recipient@example.com" oninput="onFormChange()">
    </div>
    <div class="qr-form-group">
      <label class="qr-form-label">邮件主题（可选）</label>
      <input type="text" id="field_email_subject" class="qr-input"
             placeholder="邮件主题" oninput="onFormChange()">
    </div>
    <div class="qr-form-group">
      <label class="qr-form-label">邮件正文（可选）</label>
      <textarea id="field_email_body" class="qr-textarea" rows="4"
                placeholder="邮件正文内容" oninput="onFormChange()"></textarea>
    </div>
  `;
}

function encodeEmail() {
  const to = getValue('field_email_to').trim();
  if (!to) { showToast('请填写收件人邮箱', 'error'); return null; }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
    showToast('请输入合法的邮箱地址', 'error'); return null;
  }
  const subject = getValue('field_email_subject').trim();
  const body    = getValue('field_email_body').trim();

  let mailto = `mailto:${encodeURIComponent(to)}`;
  const params = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body)    params.push(`body=${encodeURIComponent(body)}`);
  if (params.length) mailto += '?' + params.join('&');
  return mailto;
}

/* ══════════════════════════════════════════════
   6. WiFi 表单
════════════════════════════════════════════════ */
function renderWiFiForm() {
  return `
    <div class="qr-form-group">
      <label class="qr-form-label">WiFi 名称（SSID）<span class="qr-required">*</span></label>
      <input type="text" id="field_wifi_ssid" class="qr-input"
             placeholder="我的 WiFi 名称" oninput="onFormChange()">
    </div>

    <div class="qr-form-group">
      <label class="qr-form-label">加密类型</label>
      <select id="field_wifi_encryption" class="qr-select" onchange="onWiFiEncChange()">
        <option value="WPA">WPA / WPA2</option>
        <option value="WEP">WEP</option>
        <option value="nopass">无密码（开放网络）</option>
      </select>
    </div>

    <div class="qr-form-group" id="wifiPasswordGroup">
      <label class="qr-form-label">密码</label>
      <div class="qr-input-wrap">
        <input type="password" id="field_wifi_password" class="qr-input qr-input--prefix"
               placeholder="WiFi 密码" oninput="onFormChange()">
        <button type="button" class="qr-input-toggle-pw"
                onclick="togglePasswordVisibility('field_wifi_password', this)">👁</button>
      </div>
    </div>

    <div class="qr-form-group">
      <label class="qr-form-checkbox">
        <input type="checkbox" id="field_wifi_hidden" onchange="onFormChange()">
        <span>隐藏网络（Hidden Network）</span>
      </label>
    </div>
  `;
}

function onWiFiEncChange() {
  const enc = getValue('field_wifi_encryption');
  const pwGroup = document.getElementById('wifiPasswordGroup');
  if (pwGroup) pwGroup.style.display = enc === 'nopass' ? 'none' : 'block';
  onFormChange();
}

function togglePasswordVisibility(fieldId, btn) {
  const input = document.getElementById(fieldId);
  if (!input) return;
  input.type  = input.type === 'password' ? 'text' : 'password';
  btn.textContent = input.type === 'password' ? '👁' : '🙈';
}

function encodeWiFi() {
  const ssid = getValue('field_wifi_ssid').trim();
  if (!ssid) { showToast('请填写 WiFi 名称', 'error'); return null; }

  const enc    = getValue('field_wifi_encryption') || 'WPA';
  const pwd    = getValue('field_wifi_password').trim();
  const hidden = document.getElementById('field_wifi_hidden')?.checked ? 'true' : 'false';

  // WiFi QR 格式：WIFI:T:WPA;S:ssid;P:password;H:false;;
  const ssidEsc = wifiEscape(ssid);
  const pwdEsc  = wifiEscape(pwd);

  return `WIFI:T:${enc};S:${ssidEsc};P:${pwdEsc};H:${hidden};;`;
}

// WiFi 字符串转义（特殊字符 ; " \ 需要转义）
function wifiEscape(str) {
  return str.replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/"/g,'\\"').replace(/,/g,'\\,');
}

/* ══════════════════════════════════════════════
   7. Twitter/X 表单
════════════════════════════════════════════════ */
function renderTwitterForm() {
  return `
    <div class="qr-form-group">
      <div class="qr-form-label-row">
        <label class="qr-form-label">推文内容 <span class="qr-required">*</span></label>
        <span class="qr-char-count" id="tweetCharCount">0 / 280</span>
      </div>
      <textarea id="field_tweet" class="qr-textarea" rows="4"
                placeholder="输入推文内容（最多 280 字符）"
                maxlength="280"
                oninput="onTweetInput(this)"></textarea>
    </div>
    <p class="qr-form-hint">扫码后将在 Twitter/X App 中打开预填推文界面</p>
  `;
}

function onTweetInput(el) {
  const count = el.value.length;
  const countEl = document.getElementById('tweetCharCount');
  if (countEl) {
    countEl.textContent = `${count} / 280`;
    countEl.style.color = count > 260 ? '#dc2626' : '';
  }
  onFormChange();
}

function encodeTwitter() {
  const tweet = getValue('field_tweet').trim();
  if (!tweet) { showToast('请填写推文内容', 'error'); return null; }
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`;
}

/* ══════════════════════════════════════════════
   8. Bitcoin / 加密货币表单
════════════════════════════════════════════════ */
function renderBitcoinForm() {
  return `
    <div class="qr-form-group">
      <label class="qr-form-label">币种</label>
      <div class="qr-crypto-tabs" id="cryptoTabs">
        <button class="qr-crypto-tab active" data-coin="bitcoin" onclick="switchCoin(this, 'bitcoin')">₿ Bitcoin</button>
        <button class="qr-crypto-tab" data-coin="ethereum" onclick="switchCoin(this, 'ethereum')">Ξ Ethereum</button>
        <button class="qr-crypto-tab" data-coin="litecoin" onclick="switchCoin(this, 'litecoin')">Ł Litecoin</button>
      </div>
    </div>

    <div class="qr-form-group">
      <label class="qr-form-label">钱包地址 <span class="qr-required">*</span></label>
      <input type="text" id="field_crypto_address" class="qr-input"
             placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf..." oninput="onFormChange()">
    </div>

    <div class="qr-form-group">
      <label class="qr-form-label">金额（可选）</label>
      <div class="qr-input-wrap">
        <input type="number" id="field_crypto_amount" class="qr-input"
               placeholder="0.001" min="0" step="any" oninput="onFormChange()">
        <span class="qr-input-suffix" id="cryptoUnit">BTC</span>
      </div>
    </div>

    <div class="qr-form-group">
      <label class="qr-form-label">备注（可选）</label>
      <input type="text" id="field_crypto_message" class="qr-input"
             placeholder="付款说明" oninput="onFormChange()">
    </div>
  `;
}

let currentCoin = 'bitcoin';

function switchCoin(btn, coin) {
  currentCoin = coin;
  document.querySelectorAll('.qr-crypto-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const units = { bitcoin:'BTC', ethereum:'ETH', litecoin:'LTC' };
  const unitEl = document.getElementById('cryptoUnit');
  if (unitEl) unitEl.textContent = units[coin] || 'BTC';
  onFormChange();
}

function encodeBitcoin() {
  const address = getValue('field_crypto_address').trim();
  if (!address) { showToast('请填写钱包地址', 'error'); return null; }

  const amount  = getValue('field_crypto_amount').trim();
  const message = getValue('field_crypto_message').trim();

  // Bitcoin URI 格式：bitcoin:ADDRESS?amount=0.001&message=备注
  // Ethereum：ethereum:ADDRESS
  const schemes = { bitcoin:'bitcoin', ethereum:'ethereum', litecoin:'litecoin' };
  const scheme  = schemes[currentCoin] || 'bitcoin';

  let uri = `${scheme}:${address}`;
  const params = [];
  if (amount)  params.push(`amount=${encodeURIComponent(amount)}`);
  if (message) params.push(`message=${encodeURIComponent(message)}`);
  if (params.length) uri += '?' + params.join('&');
  return uri;
}

/* ══════════════════════════════════════════════
   内容编码入口
════════════════════════════════════════════════ */
function getQRContent(type) {
  const encoders = {
    url:     encodeURL,
    vcard:   encodeVCard,
    text:    encodeText,
    sms:     encodeSMS,
    email:   encodeEmail,
    wifi:    encodeWiFi,
    twitter: encodeTwitter,
    bitcoin: encodeBitcoin,
  };
  return (encoders[type] || (() => null))();
}

/* ══════════════════════════════════════════════
   工具函数
════════════════════════════════════════════════ */
function getValue(id) {
  return document.getElementById(id)?.value || '';
}

function esc(str) {
  // vCard 特殊字符转义
  return str.replace(/\\/g,'\\\\').replace(/,/g,'\\,').replace(/;/g,'\\;').replace(/\n/g,'\\n');
}

// 表单变更时自动预览（可选：启用自动生成）
let autoPreviewTimer = null;
function onFormChange() {
  clearTimeout(autoPreviewTimer);
  // 600ms 防抖自动生成
  autoPreviewTimer = setTimeout(() => {
    if (window.QR_AUTO_PREVIEW) generateQR();
  }, 600);
}

function bindFormEvents(type) {
  // 各类型特殊初始化
  if (type === 'wifi') onWiFiEncChange();
}
```

---

## 3. 表单样式（追加到 `media-qr.css`）

```css
/* ── 表单通用 ─────────────────────────────────── */
.qr-form-group {
  margin-bottom: 16px;
}

.qr-form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--qr-text);
  margin-bottom: 6px;
}

.qr-form-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.qr-required {
  color: #dc2626;
  font-weight: 700;
}

.qr-form-hint {
  font-size: 0.75rem;
  color: var(--qr-text-muted);
  margin-top: 5px;
}

.qr-form-section-title {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--qr-text-muted);
  padding: 6px 0;
  border-bottom: 1px solid var(--qr-border);
  margin-bottom: 12px;
}

.qr-char-count {
  font-size: 0.75rem;
  color: var(--qr-text-muted);
  font-variant-numeric: tabular-nums;
}

/* 输入框 */
.qr-input, .qr-select, .qr-textarea {
  width: 100%;
  padding: 9px 12px;
  border: 1.5px solid var(--qr-border);
  border-radius: var(--qr-radius-sm);
  font-size: 0.9rem;
  color: var(--qr-text);
  background: var(--qr-surface);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  font-family: inherit;
}

.qr-input:focus, .qr-select:focus, .qr-textarea:focus {
  border-color: var(--qr-indigo);
  box-shadow: 0 0 0 3px rgba(79,70,229,0.1);
}

.qr-textarea { resize: vertical; min-height: 80px; line-height: 1.5; }

/* 输入框前缀/后缀 */
.qr-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.qr-input-prefix {
  position: absolute;
  left: 10px;
  font-size: 1rem;
  pointer-events: none;
  z-index: 1;
}

.qr-input--prefix { padding-left: 34px; }

.qr-input-suffix {
  position: absolute;
  right: 10px;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--qr-text-muted);
  pointer-events: none;
}

.qr-input-toggle-pw {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 4px;
}

/* 两列 / 三列网格 */
.qr-form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.qr-form-grid-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
}

/* Checkbox */
.qr-form-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: var(--qr-text);
  cursor: pointer;
  user-select: none;
}

.qr-form-checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--qr-indigo);
  cursor: pointer;
}

/* 加密货币 Tab */
.qr-crypto-tabs {
  display: flex;
  gap: 6px;
}

.qr-crypto-tab {
  flex: 1;
  padding: 8px;
  background: var(--qr-surface);
  border: 1.5px solid var(--qr-border);
  border-radius: var(--qr-radius-sm);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--qr-text-muted);
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}

.qr-crypto-tab.active {
  border-color: var(--qr-indigo);
  color: var(--qr-indigo);
  background: var(--qr-indigo-light);
}

/* 移动端表单布局 */
@media (max-width: 480px) {
  .qr-form-grid-2, .qr-form-grid-3 { grid-template-columns: 1fr; }
}
```

---

## 4. 验收标准

### URL
- [ ] 输入无协议的网址（如 `example.com`），自动补全 `https://example.com`
- [ ] 输入非法 URL，点生成时提示错误，不生成

### vCard
- [ ] 只填姓名，生成合法 vCard 3.0 字符串
- [ ] 填写全部字段，扫码后手机显示联系人保存界面（含地址字段）
- [ ] 特殊字符（逗号、分号）被正确转义

### 文本
- [ ] 超过 280 字时字数变红色警告
- [ ] 300 字时不可继续输入（`maxlength="300"` 生效）

### SMS
- [ ] 格式：`SMSTO:+8613800000000:消息内容`，扫码后打开短信 App

### Email
- [ ] 格式：`mailto:user@example.com?subject=主题&body=正文`，扫码后打开邮件 App

### WiFi
- [ ] 选择「无密码」时，密码输入框消失
- [ ] WiFi 名称和密码中含有 `;`、`\` 等特殊字符时正确转义
- [ ] 格式：`WIFI:T:WPA;S:MyWifi;P:password123;H:false;;`

### Twitter
- [ ] 超过 260 字时字数变红色警告，超过 280 字无法继续输入
- [ ] 生成 URL 格式：`https://twitter.com/intent/tweet?text=...`

### Bitcoin
- [ ] 三种币种切换（BTC/ETH/LTC），金额单位随之更新
- [ ] 格式：`bitcoin:1A1zP1...?amount=0.001&message=备注`
