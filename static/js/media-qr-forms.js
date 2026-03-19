// /static/js/media-qr-forms.js
// Handles: form rendering for 8 QR types + content encoding

'use strict';

/* ══ Form Render Entry ═══════════════════════ */
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

/* ══ 1. URL ══════════════════════════════════ */
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
  if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(url)) {
    url = 'https://' + url;
    const el = document.getElementById('field_url');
    if (el) el.value = url;
  }
  try { new URL(url); } catch(e) {
    showToast('请输入合法的网址', 'error');
    return null;
  }
  return url;
}

/* ══ 2. vCard ════════════════════════════════ */
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

/* ══ 3. Plain Text ═══════════════════════════ */
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

/* ══ 4. SMS ══════════════════════════════════ */
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
  return message ? `SMSTO:${phone}:${message}` : `SMSTO:${phone}`;
}

/* ══ 5. Email ════════════════════════════════ */
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

/* ══ 6. WiFi ═════════════════════════════════ */
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
        <input type="password" id="field_wifi_password" class="qr-input"
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
  input.type = input.type === 'password' ? 'text' : 'password';
  btn.textContent = input.type === 'password' ? '👁' : '🙈';
}

function encodeWiFi() {
  const ssid = getValue('field_wifi_ssid').trim();
  if (!ssid) { showToast('请填写 WiFi 名称', 'error'); return null; }

  const enc    = getValue('field_wifi_encryption') || 'WPA';
  const pwd    = getValue('field_wifi_password').trim();
  const hidden = document.getElementById('field_wifi_hidden')?.checked ? 'true' : 'false';

  const ssidEsc = wifiEscape(ssid);
  const pwdEsc  = wifiEscape(pwd);
  return `WIFI:T:${enc};S:${ssidEsc};P:${pwdEsc};H:${hidden};;`;
}

function wifiEscape(str) {
  return str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/"/g, '\\"').replace(/,/g, '\\,');
}

/* ══ 7. Twitter/X ════════════════════════════ */
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

/* ══ 8. Bitcoin / Crypto ═════════════════════ */
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
  const units = { bitcoin: 'BTC', ethereum: 'ETH', litecoin: 'LTC' };
  const unitEl = document.getElementById('cryptoUnit');
  if (unitEl) unitEl.textContent = units[coin] || 'BTC';
  onFormChange();
}

function encodeBitcoin() {
  const address = getValue('field_crypto_address').trim();
  if (!address) { showToast('请填写钱包地址', 'error'); return null; }

  const amount  = getValue('field_crypto_amount').trim();
  const message = getValue('field_crypto_message').trim();

  const schemes = { bitcoin: 'bitcoin', ethereum: 'ethereum', litecoin: 'litecoin' };
  const scheme  = schemes[currentCoin] || 'bitcoin';

  let uri = `${scheme}:${address}`;
  const params = [];
  if (amount)  params.push(`amount=${encodeURIComponent(amount)}`);
  if (message) params.push(`message=${encodeURIComponent(message)}`);
  if (params.length) uri += '?' + params.join('&');
  return uri;
}

/* ══ Content Encoder Entry ═══════════════════ */
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

/* ══ Utilities ═══════════════════════════════ */
function getValue(id) {
  return document.getElementById(id)?.value || '';
}

function esc(str) {
  return str.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
}

let autoPreviewTimer = null;
function onFormChange() {
  clearTimeout(autoPreviewTimer);
  autoPreviewTimer = setTimeout(() => {
    if (window.QR_AUTO_PREVIEW) generateQR();
  }, 600);
}

function bindFormEvents(type) {
  if (type === 'wifi') onWiFiEncChange();
}

