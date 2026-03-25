/**
 * weather-engine.js — Weather Query Tool Engine v2
 * Route: /weather/query
 * APIs: Open-Meteo (weather/AQI/geocoding/archive) | bigdatacloud (reverse-geo) | ip-api.com HTTP (IP loc)
 *
 * BUG FIXES v2:
 *  1. Removed moonrise/moonset/moon_phase from daily params (invalid in Open-Meteo forecast API)
 *  2. ip-api.com: use HTTP not HTTPS (HTTPS returns empty {})
 *  3. Replaced broken Nominatim with bigdatacloud reverse geocoding (CORS-open, free)
 *  4. Fixed Day.js plugin registration (window.dayjs.plugin.utc etc., not global vars)
 *  5. Removed invalid hourly_forecast_hours param (not a valid Open-Meteo param)
 *  6. Added race-condition guard (loadSeq) to prevent stale responses overwriting fresh data
 *  7. Auto-retry with 3-second delay on network failure
 *  8. Better error messages distinguish "city not found" vs "network error"
 */

'use strict';

// ── Day.js Setup ─────────────────────────────────────────────────
// Plugins are loaded as separate <script> tags, exposed on window.dayjs.plugin.*
(function initDayjs() {
  if (typeof dayjs === 'undefined') return;
  try {
    if (dayjs.extend) {
      // Day.js CDN plugin scripts expose via window.dayjs_plugin_* or dayjs.plugin.*
      const plugins = ['utc', 'timezone', 'relativeTime', 'localizedFormat'];
      plugins.forEach(name => {
        const plugin = window['dayjs_plugin_' + name] || (dayjs.plugin && dayjs.plugin[name]);
        if (plugin) try { dayjs.extend(plugin); } catch(e) {}
      });
    }
  } catch(e) {}
})();

// ── i18n ─────────────────────────────────────────────────────────
const WQI = window.WQ_I18N || {};
function i18n(key) { return WQI[key] || key; }
function isZH() { return (WQI.lang || 'zh') === 'zh'; }

// ── Global Store ─────────────────────────────────────────────────
const WeatherStore = {
  city: { name: '', country: '', lat: null, lon: null, timezone: '', utcOffset: 0 },
  currentWeather: null,
  hourlyForecast: null,
  dailyForecast:  null,
  aqiData:        null,
  historyData:    null,
  unitTemp:     'celsius',
  unitWind:     'kmh',
  unitPressure: 'hpa',
  recentCities: [],
  activeForecastTab: 'hourly24',
  activeMapLayer:    'temperature',
  modelCompareEnabled: false,
  isLoading: false,
  loadSeq: 0,          // race-condition guard
  forecastChartInstance: null,
  aqiGaugeInstance:      null,
  mapInstance:    null,
  mapLayerTile:   null,
};

// ── WMO Code Table ───────────────────────────────────────────────
const WMO = {
  0:  { zh:'晴',       en:'Clear sky' },
  1:  { zh:'大部晴朗', en:'Mainly clear' },
  2:  { zh:'多云',     en:'Partly cloudy' },
  3:  { zh:'阴',       en:'Overcast' },
  45: { zh:'雾',       en:'Foggy' },
  48: { zh:'冻雾',     en:'Icy fog' },
  51: { zh:'细雨',     en:'Light drizzle' },
  53: { zh:'毛毛雨',   en:'Drizzle' },
  55: { zh:'强毛毛雨', en:'Heavy drizzle' },
  61: { zh:'小雨',     en:'Light rain' },
  63: { zh:'中雨',     en:'Rain' },
  65: { zh:'大雨',     en:'Heavy rain' },
  66: { zh:'冻雨',     en:'Freezing rain' },
  67: { zh:'强冻雨',   en:'Heavy freezing rain' },
  71: { zh:'小雪',     en:'Light snow' },
  73: { zh:'中雪',     en:'Snow' },
  75: { zh:'大雪',     en:'Heavy snow' },
  77: { zh:'米雪',     en:'Snow grains' },
  80: { zh:'小阵雨',   en:'Slight showers' },
  81: { zh:'阵雨',     en:'Showers' },
  82: { zh:'强阵雨',   en:'Heavy showers' },
  85: { zh:'阵雪',     en:'Snow showers' },
  86: { zh:'强阵雪',   en:'Heavy snow showers' },
  95: { zh:'雷暴',     en:'Thunderstorm' },
  96: { zh:'雷暴+冰雹',en:'Thunderstorm w/ hail' },
  99: { zh:'强雷暴',   en:'Severe thunderstorm' },
};
function getWeatherDesc(code) {
  const d = WMO[code] || WMO[0];
  return isZH() ? d.zh : d.en;
}
function getWeatherTheme(code) {
  if (code === 0 || code === 1) return 'clear';
  if (code <= 3)  return 'cloudy';
  if (code >= 45 && code <= 48) return 'cloudy';
  if (code >= 51 && code <= 67) return 'rainy';
  if (code >= 71 && code <= 77) return 'snowy';
  if (code >= 80 && code <= 82) return 'rainy';
  if (code >= 85 && code <= 86) return 'snowy';
  if (code >= 95) return 'storm';
  return 'cloudy';
}

// ── Weather Icon SVGs ─────────────────────────────────────────────
const SVG_CLEAR = `<svg viewBox="0 0 72 72" width="72" height="72">
  <style>.sun-spin{transform-origin:36px 36px;animation:sunSpin 12s linear infinite}@keyframes sunSpin{to{transform:rotate(360deg)}}</style>
  <g class="sun-spin">
    <circle cx="36" cy="36" r="14" fill="#fbbf24"/>
    ${[0,45,90,135,180,225,270,315].map(a=>{const r=a*Math.PI/180,x1=36+20*Math.cos(r),y1=36+20*Math.sin(r),x2=36+28*Math.cos(r),y2=36+28*Math.sin(r);return`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>`;}).join('')}
  </g>
</svg>`;
const SVG_CLOUDY = `<svg viewBox="0 0 72 72" width="72" height="72">
  <style>@keyframes cf{0%,100%{transform:translateX(0)}50%{transform:translateX(5px)}}</style>
  <circle cx="26" cy="32" r="13" fill="#94a3b8" style="animation:cf 5s ease-in-out infinite"/>
  <circle cx="42" cy="28" r="16" fill="#94a3b8" style="animation:cf 5s ease-in-out infinite .3s"/>
  <circle cx="54" cy="33" r="11" fill="#94a3b8" style="animation:cf 5s ease-in-out infinite .1s"/>
  <rect x="13" y="35" width="45" height="15" rx="7" fill="#94a3b8" style="animation:cf 5s ease-in-out infinite"/>
</svg>`;
const SVG_RAINY = `<svg viewBox="0 0 72 72" width="72" height="72">
  <style>@keyframes rd{0%{opacity:0;transform:translateY(-6px)}60%{opacity:1}100%{opacity:0;transform:translateY(10px)}}</style>
  <circle cx="22" cy="26" r="11" fill="#64748b"/>
  <circle cx="38" cy="22" r="14" fill="#64748b"/>
  <circle cx="52" cy="27" r="10" fill="#64748b"/>
  <rect x="11" y="28" width="44" height="13" rx="6" fill="#64748b"/>
  <line x1="22" y1="46" x2="19" y2="58" stroke="#7dd3fc" stroke-width="2.5" stroke-linecap="round" style="animation:rd 1.1s ease infinite 0s"/>
  <line x1="33" y1="46" x2="30" y2="58" stroke="#7dd3fc" stroke-width="2.5" stroke-linecap="round" style="animation:rd 1.1s ease infinite .25s"/>
  <line x1="44" y1="46" x2="41" y2="58" stroke="#7dd3fc" stroke-width="2.5" stroke-linecap="round" style="animation:rd 1.1s ease infinite .5s"/>
  <line x1="27" y1="52" x2="24" y2="64" stroke="#7dd3fc" stroke-width="2" stroke-linecap="round" style="animation:rd 1.1s ease infinite .15s"/>
  <line x1="38" y1="52" x2="35" y2="64" stroke="#7dd3fc" stroke-width="2" stroke-linecap="round" style="animation:rd 1.1s ease infinite .4s"/>
</svg>`;
const SVG_SNOWY = `<svg viewBox="0 0 72 72" width="72" height="72">
  <style>@keyframes sf{0%,100%{opacity:.4;transform:translateY(0)}50%{opacity:1;transform:translateY(4px)}}</style>
  <circle cx="22" cy="24" r="11" fill="#cbd5e1"/>
  <circle cx="38" cy="20" r="14" fill="#cbd5e1"/>
  <circle cx="52" cy="25" r="10" fill="#cbd5e1"/>
  <rect x="11" y="26" width="44" height="13" rx="6" fill="#cbd5e1"/>
  <text x="16" y="62" font-size="13" style="animation:sf 2s ease infinite 0s">❄</text>
  <text x="30" y="66" font-size="11" style="animation:sf 2s ease infinite .4s">❄</text>
  <text x="44" y="62" font-size="13" style="animation:sf 2s ease infinite .8s">❄</text>
</svg>`;
const SVG_STORM = `<svg viewBox="0 0 72 72" width="72" height="72">
  <style>@keyframes bl{0%,100%{opacity:1}20%,70%{opacity:.2}40%{opacity:1}}</style>
  <circle cx="22" cy="24" r="11" fill="#334155"/>
  <circle cx="38" cy="20" r="14" fill="#334155"/>
  <circle cx="52" cy="25" r="10" fill="#334155"/>
  <rect x="11" y="26" width="44" height="13" rx="6" fill="#334155"/>
  <polygon points="38,42 30,56 37,56 29,68 46,50 39,50" fill="#fbbf24" style="animation:bl 2s ease infinite"/>
</svg>`;

const SVG_ICONS = { clear: SVG_CLEAR, cloudy: SVG_CLOUDY, rainy: SVG_RAINY, snowy: SVG_SNOWY, storm: SVG_STORM };
function getWeatherIconSVG(code) { return SVG_ICONS[getWeatherTheme(code)] || SVG_CLOUDY; }

// ── Helpers ───────────────────────────────────────────────────────
const WIND_DIRS = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
function getWindDir(deg) { return WIND_DIRS[Math.round((deg||0) / 22.5) % 16]; }

function getUVLabel(uv) {
  if (uv <= 2) return isZH() ? '低' : 'Low';
  if (uv <= 5) return isZH() ? '中等' : 'Moderate';
  if (uv <= 7) return isZH() ? '高' : 'High';
  if (uv <= 10) return isZH() ? '很高' : 'Very High';
  return isZH() ? '极端' : 'Extreme';
}

function getTempColor(t) {
  if (t < 0)  return '#38bdf8';
  if (t < 10) return '#7dd3fc';
  if (t < 20) return '#86efac';
  if (t < 30) return '#fde68a';
  if (t < 36) return '#fb923c';
  return '#ef4444';
}

// ── Unit Converters ───────────────────────────────────────────────
function cvtTemp(v)  { return WeatherStore.unitTemp === 'fahrenheit' ? v * 9/5 + 32 : v; }
function cvtWind(v)  {
  switch (WeatherStore.unitWind) {
    case 'mph': return +(v * 0.621371).toFixed(1);
    case 'ms':  return +(v / 3.6).toFixed(1);
    default:    return +Number(v).toFixed(1);
  }
}
function cvtPres(v)  { return WeatherStore.unitPressure === 'inhg' ? (v * 0.02953).toFixed(2) : Number(v).toFixed(0); }
function unitLabel(type) {
  const m = { temp:{celsius:'°C',fahrenheit:'°F'}, wind:{kmh:'km/h',mph:'mph',ms:'m/s'}, pressure:{hpa:'hPa',inhg:'inHg'} };
  const storeKey = 'unit' + type[0].toUpperCase() + type.slice(1);
  return (m[type]||{})[WeatherStore[storeKey]] || '';
}

// ── Fetch ──────────────────────────────────────────────────────────
function fetchTimed(url, ms = 10000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(t));
}

// ── Time ──────────────────────────────────────────────────────────
function fmtTime(isoStr) {
  if (!isoStr) return '--:--';
  try {
    // isoStr from Open-Meteo looks like "2026-03-24T06:23" (local time already)
    const d = new Date(isoStr.includes('T') ? isoStr : isoStr + 'T00:00');
    return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
  } catch { return '--:--'; }
}

function getLocalTimeStr(timezone) {
  try {
    if (typeof dayjs !== 'undefined' && dayjs.tz) {
      return dayjs().tz(timezone).format('HH:mm');
    }
    return new Date().toLocaleTimeString('en', { hour:'2-digit', minute:'2-digit', hour12:false, timeZone: timezone });
  } catch {
    return new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
  }
}

// ── Sun Arc ───────────────────────────────────────────────────────
function updateSunArc(sunriseISO, sunsetISO) {
  if (!sunriseISO || !sunsetISO) return;
  const now  = Date.now() / 1000;
  // Open-Meteo sunrise/sunset are local ISO strings like "2026-03-24T06:23"
  const rise = new Date(sunriseISO.includes('T') ? sunriseISO : sunriseISO + 'T00:00').getTime() / 1000;
  const set  = new Date(sunsetISO.includes('T')  ? sunsetISO  : sunsetISO  + 'T00:00').getTime() / 1000;
  const pct  = Math.max(0, Math.min(1, (now - rise) / (set - rise)));
  const t    = pct;
  const cx   = (1-t)*(1-t)*20 + 2*(1-t)*t*160 + t*t*300;
  const cy   = (1-t)*(1-t)*90 + 2*(1-t)*t*(-30) + t*t*90;
  const dot  = document.getElementById('sunDot');
  if (dot) { dot.setAttribute('cx', cx.toFixed(1)); dot.setAttribute('cy', cy.toFixed(1)); }
}

// ── Particles ─────────────────────────────────────────────────────
let _particleTimer = null;
function stopParticles() {
  clearInterval(_particleTimer); _particleTimer = null;
  const c = document.getElementById('wqParticles');
  if (c) c.innerHTML = '';
}
function startRain() {
  stopParticles();
  const c = document.getElementById('wqParticles');
  if (!c) return;
  _particleTimer = setInterval(() => {
    const el = document.createElement('div');
    el.className = 'wq-rain-drop';
    el.style.cssText = `left:${Math.random()*100}%;top:-20px;animation-duration:${0.5+Math.random()*0.7}s;animation-delay:${Math.random()*0.4}s`;
    c.appendChild(el);
    setTimeout(() => el.remove(), 1800);
  }, 55);
}
function startSnow() {
  stopParticles();
  const c = document.getElementById('wqParticles');
  if (!c) return;
  _particleTimer = setInterval(() => {
    const el = document.createElement('div');
    el.className = 'wq-snow-flake';
    const sz = 4 + Math.random()*6;
    el.style.cssText = `left:${Math.random()*100}%;top:-10px;width:${sz}px;height:${sz}px;animation-duration:${3+Math.random()*4}s;animation-delay:${Math.random()*2}s`;
    c.appendChild(el);
    setTimeout(() => el.remove(), 8000);
  }, 180);
}

// ── Background ────────────────────────────────────────────────────
function updateBg() {
  if (!WeatherStore.currentWeather) return;
  const theme = getWeatherTheme(WeatherStore.currentWeather.weather_code);
  const bg = document.getElementById('wqBackground');
  if (bg) bg.className = `wq-bg wq-bg--${theme}`;
  if (theme === 'rainy') startRain();
  else if (theme === 'snowy') startSnow();
  else stopParticles();
}

// ── Toast ──────────────────────────────────────────────────────────
function toast(msg, type = 'info', ms = 4000) {
  const c = document.getElementById('toastContainer');
  if (!c) return;
  const el = document.createElement('div');
  el.className = `wq-toast wq-toast--${type}`;
  el.textContent = msg;
  c.appendChild(el);
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 400); }, ms);
}

// ── Recent Cities ─────────────────────────────────────────────────
function loadRecents() {
  try { WeatherStore.recentCities = JSON.parse(localStorage.getItem('wq_recent_cities') || '[]'); }
  catch { WeatherStore.recentCities = []; }
}
function saveRecent() {
  const c = { name: WeatherStore.city.name, lat: WeatherStore.city.lat, lon: WeatherStore.city.lon, country: WeatherStore.city.country };
  if (!c.name) return;
  let list = (WeatherStore.recentCities || []).filter(x => x.name !== c.name);
  list.unshift(c);
  WeatherStore.recentCities = list.slice(0, 5);
  try { localStorage.setItem('wq_recent_cities', JSON.stringify(WeatherStore.recentCities)); } catch {}
  renderRecentChips();
}
function renderRecentChips() {
  const wrap = document.getElementById('recentChips');
  const box  = document.getElementById('recentSearches');
  if (!wrap) return;
  const list = WeatherStore.recentCities || [];
  if (!list.length) { box?.classList.remove('visible'); return; }
  box?.classList.add('visible');
  wrap.innerHTML = '';
  list.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'wq-recent-chip';
    btn.textContent = c.name;
    btn.addEventListener('click', () => loadByCoords(c.lat, c.lon, c.name, c.country));
    wrap.appendChild(btn);
  });
}

// ── Prefs ─────────────────────────────────────────────────────────
function loadPrefs() {
  try {
    WeatherStore.unitTemp     = localStorage.getItem('wq_unit_temp')     || 'celsius';
    WeatherStore.unitWind     = localStorage.getItem('wq_unit_wind')     || 'kmh';
    WeatherStore.unitPressure = localStorage.getItem('wq_unit_pressure') || 'hpa';
  } catch {}
}
function syncUnitBtns() {
  document.querySelectorAll('[data-unit-temp]').forEach(b => b.classList.toggle('active', b.dataset.unitTemp === WeatherStore.unitTemp));
  document.querySelectorAll('[data-unit-wind]').forEach(b => b.classList.toggle('active', b.dataset.unitWind === WeatherStore.unitWind));
}

// ── Page URL ──────────────────────────────────────────────────────
function pushURL() {
  try {
    const u = new URL(location.href);
    u.searchParams.set('lat', WeatherStore.city.lat.toFixed(4));
    u.searchParams.set('lon', WeatherStore.city.lon.toFixed(4));
    u.searchParams.delete('city');
    history.replaceState(null, '', u.toString());
  } catch {}
}

// ── AQI ───────────────────────────────────────────────────────────
function aqiLevel(v) {
  if (v <= 50)  return { key:'good',      color:'#22c55e' };
  if (v <= 100) return { key:'fair',      color:'#84cc16' };
  if (v <= 150) return { key:'moderate',  color:'#eab308' };
  if (v <= 200) return { key:'poor',      color:'#f97316' };
  if (v <= 300) return { key:'very_poor', color:'#ef4444' };
  return               { key:'hazardous', color:'#a855f7' };
}
const AQI_LABEL = { good:'aqiGood', fair:'aqiFair', moderate:'aqiModerate', poor:'aqiPoor', very_poor:'aqiVeryPoor', hazardous:'aqiHazardous' };
const AQI_ADV   = { good:'aqiAdvGood', fair:'aqiAdvFair', moderate:'aqiAdvModerate', poor:'aqiAdvPoor', very_poor:'aqiAdvVeryPoor', hazardous:'aqiAdvHazardous' };
function aqiGradient() {
  return [[50/300,'#22c55e'],[100/300,'#84cc16'],[150/300,'#eab308'],[200/300,'#f97316'],[250/300,'#ef4444'],[1,'#a855f7']];
}
function pollutantColor(pct) { return pct < 33 ? '#22c55e' : pct < 66 ? '#eab308' : '#ef4444'; }

// ── Life Index ────────────────────────────────────────────────────
function lifeDressing(t) {
  const z = isZH();
  if (t <= 0)  return { cls:'extreme-cold', lbl: z?'极寒':'Extreme Cold', tip: z?'厚羽绒服+手套':'Heavy coat + gloves' };
  if (t <= 10) return { cls:'cold',         lbl: z?'寒冷':'Cold',         tip: z?'羽绒服或厚棉衣':'Down jacket or heavy coat' };
  if (t <= 16) return { cls:'cool',         lbl: z?'凉爽':'Cool',         tip: z?'轻便外套':'Light jacket' };
  if (t <= 22) return { cls:'mild',         lbl: z?'舒适':'Mild',         tip: z?'轻薄外套或秋装':'Light layer or casual wear' };
  if (t <= 28) return { cls:'warm',         lbl: z?'温暖':'Warm',         tip: z?'薄衫或T恤':'T-shirt' };
  return               { cls:'hot',         lbl: z?'炎热':'Hot',          tip: z?'短袖短裤，注意防晒':'Shorts, use sunscreen' };
}
function lifeUV(uv) {
  const z = isZH();
  if (uv <= 2) return  { cls:'good',     lbl:z?'低':'Low',       tip:z?'无需特别防护':'No protection needed' };
  if (uv <= 5) return  { cls:'fair',     lbl:z?'中等':'Moderate', tip:z?'建议防晒霜':'Apply sunscreen' };
  if (uv <= 7) return  { cls:'moderate', lbl:z?'高':'High',       tip:z?'防晒+帽子':'Sunscreen & hat' };
  if (uv <= 10) return { cls:'poor',     lbl:z?'很高':'Very High', tip:z?'减少日晒时间':'Limit sun exposure' };
  return               { cls:'bad',      lbl:z?'极端':'Extreme',  tip:z?'避免户外活动':'Avoid outdoors' };
}
function lifeExercise(feels, aqi) {
  const z = isZH(); const a = aqi||0;
  if (feels >= 18 && feels <= 26 && a < 100) return { cls:'good', lbl:z?'优':'Excellent', tip:z?'适合各类运动':'Perfect for exercise' };
  if (a > 200)   return { cls:'bad',  lbl:z?'不宜':'Avoid', tip:z?'空气差，避免户外':'Poor air quality' };
  if (feels < 5 || feels > 35) return { cls:'poor', lbl:z?'较差':'Poor', tip:z?'温度极端':'Extreme temperatures' };
  return { cls:'fair', lbl:z?'尚可':'Fair', tip:z?'适量运动，注意补水':'Stay hydrated' };
}
function lifeCarWash(p) {
  const z = isZH(); p = p||0;
  if (p < 20) return { cls:'good',     lbl:z?'适宜':'Good',   tip:z?'适合洗车':'Good day to wash' };
  if (p < 60) return { cls:'moderate', lbl:z?'较适宜':'Fair',  tip:z?'有降雨风险':'Rain risk possible' };
  return             { cls:'bad',      lbl:z?'不适宜':'Avoid', tip:z?'不适合洗车':'Skip car wash' };
}
function lifeAllergy(pm25, wind) {
  const z = isZH(); pm25=pm25||0; wind=wind||0;
  if (pm25>75 || wind>30) return { cls:'bad',  lbl:z?'高风险':'High Risk',  tip:z?'过敏患者注意防护':'Allergy sufferers beware' };
  if (pm25>35 || wind>15) return { cls:'poor', lbl:z?'较高':'Elevated',    tip:z?'适当防护':'Some precautions' };
  return                         { cls:'good', lbl:z?'低':'Low',           tip:z?'过敏风险低':'Low allergy risk' };
}
function lifeComfort(feels, hum) {
  const z = isZH();
  if (feels>=18 && feels<=26 && hum>=40 && hum<=65) return { cls:'good', lbl:z?'舒适':'Comfortable', tip:z?'温湿度均佳':'Perfect conditions' };
  if (hum > 80) return { cls:'poor', lbl:z?'闷热':'Muggy', tip:z?'湿度较大':'High humidity' };
  if (hum < 30) return { cls:'fair', lbl:z?'干燥':'Dry',   tip:z?'空气干燥，注意补水':'Dry air, stay hydrated' };
  return               { cls:'fair', lbl:z?'一般':'Fair',   tip:z?'体感尚可':'Acceptable' };
}
const LIFE_COLOR = {
  'extreme-cold':'#38bdf8','cold':'#60a5fa','cool':'#84cc16','mild':'#22c55e',
  'warm':'#f97316','hot':'#ef4444','good':'#22c55e','fair':'#eab308',
  'moderate':'#eab308','poor':'#f97316','bad':'#ef4444'
};

// ── setEl helper ──────────────────────────────────────────────────
function setEl(id, val) { const e=document.getElementById(id); if(e) e.textContent=val; }

// ── API: Geocoding ────────────────────────────────────────────────
// Supports multilingual search: zh, en, ja, ko, es and more
// Open-Meteo geocoding API accepts &language= for localized results
async function geocodeSearch(query) {
  try {
    // Map page lang to Open-Meteo supported language codes
    const langMap = { zh: 'zh', en: 'en', ja: 'ja', ko: 'ko', spa: 'es' };
    const apiLang = langMap[WQI.lang] || 'en';
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=${apiLang}&format=json`;
    const res = await fetchTimed(url, 6000);
    if (!res.ok) return [];
    const d = await res.json();
    return d.results || [];
  } catch { return []; }
}

// ── API: Reverse Geocode (bigdatacloud — CORS open, no key) ───────
// BUG FIX: Nominatim was blocked (HTTP 000). bigdatacloud works.
async function reverseGeocode(lat, lon) {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const res = await fetchTimed(url, 5000);
    if (!res.ok) return null;
    const d = await res.json();
    const name = d.city || d.locality || d.principalSubdivision || '';
    const country = d.countryCode || '';
    return { name, country_code: country };
  } catch { return null; }
}

// ── API: Weather + Forecast ───────────────────────────────────────
// BUG FIX: Removed moonrise, moonset, moon_phase — NOT valid in Open-Meteo forecast API
// BUG FIX: Removed hourly_forecast_hours — NOT a valid param
async function fetchWeather(lat, lon) {
  const params = new URLSearchParams({
    latitude:  lat,
    longitude: lon,
    current: [
      'temperature_2m','relative_humidity_2m','apparent_temperature',
      'weather_code','wind_speed_10m','wind_direction_10m',
      'surface_pressure','visibility','cloud_cover',
      'precipitation','uv_index','dew_point_2m'
    ].join(','),
    hourly: [
      'temperature_2m','precipitation_probability','precipitation',
      'weather_code','wind_speed_10m','relative_humidity_2m',
      'apparent_temperature','uv_index'
    ].join(','),
    daily: [
      'temperature_2m_max','temperature_2m_min','weather_code',
      'precipitation_sum','precipitation_probability_max',
      'wind_speed_10m_max','uv_index_max','sunrise','sunset'
    ].join(','),
    forecast_days: 14,
    timezone: 'auto',
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm',
  });
  const res = await fetchTimed(`https://api.open-meteo.com/v1/forecast?${params}`, 12000);
  if (!res.ok) throw new Error('weather_' + res.status);
  const data = await res.json();
  if (data.error) throw new Error(data.reason || 'weather_api_error');
  return data;
}

// ── API: AQI ──────────────────────────────────────────────────────
async function fetchAQI(lat, lon) {
  const params = new URLSearchParams({
    latitude:  lat,
    longitude: lon,
    current: ['us_aqi','pm2_5','pm10','ozone','nitrogen_dioxide','sulphur_dioxide','carbon_monoxide'].join(','),
    forecast_days: 1,
    timezone: 'auto',
  });
  const res = await fetchTimed(`https://air-quality-api.open-meteo.com/v1/air-quality?${params}`, 8000);
  if (!res.ok) throw new Error('aqi_' + res.status);
  return res.json();
}

// ── API: History ──────────────────────────────────────────────────
async function fetchHistory(lat, lon) {
  if (WeatherStore.historyData) return;
  const today  = new Date().toISOString().slice(0,10);
  const past30 = new Date(Date.now() - 30*86400*1000).toISOString().slice(0,10);
  const params = new URLSearchParams({
    latitude: lat, longitude: lon,
    start_date: past30, end_date: today,
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code',
    timezone: 'auto',
  });
  const res = await fetchTimed(`https://archive-api.open-meteo.com/v1/archive?${params}`, 14000);
  if (!res.ok) throw new Error('history_' + res.status);
  WeatherStore.historyData = await res.json();
}

// ── API: IP Geolocation ───────────────────────────────────────────
// BUG FIX v2: ip-api.com HTTPS returns empty {} and HTTP is blocked by browsers
// as mixed content on HTTPS pages. Use ipwho.is (HTTPS, free, no key) instead.
async function locateByIP() {
  // Primary: ipwho.is — HTTPS, free, no API key needed
  try {
    const res = await fetchTimed('https://ipwho.is/', 6000);
    const d = await res.json();
    if (d.success !== false && d.latitude && d.longitude) {
      await loadByCoords(d.latitude, d.longitude, d.city || '', d.country_code || '');
      return;
    }
  } catch {}
  // Fallback: ip.sb — also HTTPS, free
  try {
    const res = await fetchTimed('https://api.ip.sb/geoip', 5000);
    const d = await res.json();
    if (d.latitude && d.longitude) {
      await loadByCoords(d.latitude, d.longitude, d.city || '', d.country_code || '');
      return;
    }
  } catch {}
  // Final fallback: use WQ_CITY from server (Go handler sets DefaultCity)
  const defaultCity = window.WQ_CITY;
  if (defaultCity) {
    const results = await geocodeSearch(defaultCity);
    if (results.length) {
      const r = results[0];
      await loadByCoords(r.latitude, r.longitude, r.name, r.country_code);
      return;
    }
  }
  // Hardcoded last resort
  await loadByCoords(39.9042, 116.4074, 'Beijing', 'CN');
}

// ── Render: Current Weather ───────────────────────────────────────
function renderCurrent() {
  const d = WeatherStore.currentWeather;
  const daily = WeatherStore.dailyForecast;
  if (!d) return;

  const temp  = cvtTemp(d.temperature_2m);
  const feels = cvtTemp(d.apparent_temperature);

  const tempEl = document.getElementById('currentTemp');
  if (tempEl) {
    tempEl.textContent = Math.round(temp);
    tempEl.classList.remove('updated');
    void tempEl.offsetWidth; // reflow to retrigger animation
    tempEl.classList.add('updated');
  }
  const unitEl = document.getElementById('currentTempUnit');
  if (unitEl) unitEl.textContent = unitLabel('temp');
  setEl('feelsLike', Math.round(feels) + unitLabel('temp'));

  // Icon + description
  const iconEl = document.getElementById('currentWeatherIcon');
  if (iconEl) iconEl.innerHTML = getWeatherIconSVG(d.weather_code);
  setEl('weatherDesc', getWeatherDesc(d.weather_code));

  // Location + local time
  setEl('cityName', WeatherStore.city.name || '--');
  setEl('countryCode', WeatherStore.city.country ? ' · ' + WeatherStore.city.country : '');
  if (WeatherStore.city.timezone) {
    setEl('localTime', getLocalTimeStr(WeatherStore.city.timezone));
  }

  // 12 metrics
  setEl('val-humidity',    d.relative_humidity_2m + '%');
  setEl('val-wind',        cvtWind(d.wind_speed_10m) + ' ' + unitLabel('wind'));
  setEl('val-wind-dir',    getWindDir(d.wind_direction_10m));
  setEl('val-pressure',    cvtPres(d.surface_pressure) + ' ' + unitLabel('pressure'));
  setEl('val-visibility',  ((d.visibility||0)/1000).toFixed(1) + ' km');
  setEl('val-uv',          d.uv_index ?? '--');
  setEl('val-uv-level',    getUVLabel(d.uv_index));
  setEl('val-clouds',      (d.cloud_cover ?? '--') + '%');
  setEl('val-dew',         Math.round(cvtTemp(d.dew_point_2m)) + unitLabel('temp'));
  setEl('val-precip',      (d.precipitation||0) + ' mm');
  setEl('val-updated',     new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}));

  // Moon: compute from current date (no API needed)
  const moonData = calcMoonPhase(new Date());
  const moonIconEl = document.getElementById('moonPhaseIcon');
  if (moonIconEl) moonIconEl.textContent = moonData.emoji;
  setEl('val-moonphase', moonData.name);
  setEl('val-moonrise', '--');
  setEl('val-moonset',  '--');

  // High / Low + sun arc from daily[0]
  if (daily && daily.temperature_2m_max) {
    setEl('tempHigh', '↑ ' + Math.round(cvtTemp(daily.temperature_2m_max[0])) + unitLabel('temp'));
    setEl('tempLow',  '↓ ' + Math.round(cvtTemp(daily.temperature_2m_min[0])) + unitLabel('temp'));
    if (daily.sunrise && daily.sunset) {
      setEl('sunriseTime', fmtTime(daily.sunrise[0]));
      setEl('sunsetTime',  fmtTime(daily.sunset[0]));
      updateSunArc(daily.sunrise[0], daily.sunset[0]);
    }
  }

  // wqMain visibility is controlled by showSkeleton/hideSkeleton
}

// Simple moon phase calculation (no API needed)
function calcMoonPhase(date) {
  // Synodic period = 29.53 days; reference new moon 2000-01-06
  const ref = new Date('2000-01-06T18:14:00Z');
  const syno = 29.530588853;
  const daysSince = (date - ref) / 86400000;
  const phase = ((daysSince % syno) + syno) % syno; // 0-29.53
  const frac  = phase / syno; // 0-1
  const icons  = ['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'];
  const namesZH = ['新月','娥眉月','上弦月','盈凸月','满月','亏凸月','下弦月','残月'];
  const namesEN = ['New Moon','Waxing Crescent','First Quarter','Waxing Gibbous','Full Moon','Waning Gibbous','Last Quarter','Waning Crescent'];
  const idx = Math.round(frac * 8) % 8;
  return { emoji: icons[idx], name: isZH() ? namesZH[idx] : namesEN[idx] };
}

// ── Render: Forecast ──────────────────────────────────────────────
function renderForecast() {
  // forecastPanel is always visible inside wqMain
  drawForecastChart(WeatherStore.activeForecastTab);
}

// Render hourly cards (OpenWeatherMap-style horizontal scroll)
function renderHourlyCards() {
  const h = WeatherStore.hourlyForecast;
  const wrap = document.getElementById('hourlyCards');
  if (!h || !wrap) return;

  const nowISO = new Date().toISOString().slice(0, 13);
  let startIdx = h.time.findIndex(t => t >= nowISO);
  if (startIdx < 0) startIdx = 0;

  const cards = [];
  for (let i = startIdx; i < Math.min(startIdx + 48, h.time.length); i++) {
    const time   = h.time[i].slice(11, 16);
    const temp   = Math.round(cvtTemp(h.temperature_2m[i]));
    const wmo    = h.weather_code ? h.weather_code[i] : 0;
    const rain   = h.precipitation_probability ? (h.precipitation_probability[i] || 0) : 0;
    const isNow  = i === startIdx;
    cards.push(`<div class="wq-hour-card${isNow ? ' wq-hour-card--now' : ''}">
      <span class="wq-hour-card__time">${isNow ? (isZH() ? '现在' : 'Now') : time}</span>
      <div class="wq-hour-card__icon">${getWeatherIconSVG(wmo)}</div>
      <span class="wq-hour-card__temp">${temp}${unitLabel('temp')}</span>
      ${rain > 5 ? `<span class="wq-hour-card__rain">💧${rain}%</span>` : ''}
    </div>`);
  }
  wrap.innerHTML = cards.join('');
}

function drawForecastChart(tab) {
  const chartEl   = document.getElementById('forecastChart');
  const chartWrap = document.getElementById('forecastChartWrap');
  const dailyList = document.getElementById('dailyForecastList');
  const hourlyScroll = document.getElementById('hourlyScroll');
  if (!chartEl) return;

  if (tab === 'daily14') {
    renderDailyCards();
    dailyList?.classList.remove('hidden');
    if (chartWrap) chartWrap.style.display = 'none';
    if (hourlyScroll) hourlyScroll.style.display = 'none';
    return;
  }

  dailyList?.classList.add('hidden');
  if (chartWrap) chartWrap.style.display = '';
  if (hourlyScroll) hourlyScroll.style.display = '';

  // Render hourly cards when on hourly24 tab
  if (tab === 'hourly24') renderHourlyCards();

  if (typeof echarts === 'undefined') return;
  if (!WeatherStore.forecastChartInstance) {
    WeatherStore.forecastChartInstance = echarts.init(chartEl, null, { renderer: 'svg' });
    new ResizeObserver(() => WeatherStore.forecastChartInstance?.resize()).observe(chartEl);
  }

  let option;
  if (tab === 'hourly24') option = buildHourlyOpt();
  else if (tab === 'history') option = buildHistoryOpt();
  else option = buildHourlyOpt();

  if (option) WeatherStore.forecastChartInstance.setOption(option, { notMerge: true });
  WeatherStore.forecastChartInstance.resize();
}

function chartBase() {
  return {
    backgroundColor: 'transparent',
    textStyle: { color: '#94a3b8', fontSize: 12 },
    tooltip: { trigger:'axis', backgroundColor:'rgba(15,23,42,0.96)', borderColor:'rgba(255,255,255,0.1)', textStyle:{color:'#f1f5f9'}, axisPointer:{lineStyle:{color:'rgba(255,255,255,0.2)'}} },
    grid: { left:52, right:52, top:36, bottom:56, containLabel:false },
  };
}

function buildHourlyOpt() {
  const h = WeatherStore.hourlyForecast;
  if (!h || !h.time) return null;
  // Take next 48 hours from now
  const nowISO = new Date().toISOString().slice(0,13);
  let startIdx = h.time.findIndex(t => t >= nowISO);
  if (startIdx < 0) startIdx = 0;
  const slice = (arr, s, len=48) => (arr||[]).slice(s, s+len);

  const times  = slice(h.time, startIdx).map(t => { try { return t.slice(11,16); } catch { return t; } });
  const temps  = slice(h.temperature_2m, startIdx).map(v => +(cvtTemp(v)).toFixed(1));
  const precip = slice(h.precipitation_probability, startIdx).map(v => v??0);

  return {
    ...chartBase(),
    xAxis: { type:'category', data:times, axisLine:{lineStyle:{color:'rgba(255,255,255,0.1)'}}, axisTick:{show:false}, axisLabel:{color:'#64748b', interval:5} },
    yAxis: [
      { type:'value', name:unitLabel('temp'), position:'left', splitLine:{lineStyle:{color:'rgba(255,255,255,0.06)'}}, axisLabel:{color:'#64748b', formatter:v=>v+unitLabel('temp')}, nameTextStyle:{color:'#64748b'} },
      { type:'value', name:'%', position:'right', max:100, splitLine:{show:false}, axisLabel:{color:'#64748b', formatter:v=>v+'%'} },
    ],
    series: [
      { name: isZH()?'温度':'Temp', type:'line', yAxisIndex:0, data:temps, smooth:true, symbol:'none', lineStyle:{width:2.5,color:'#38bdf8'}, areaStyle:{opacity:0.15,color:{type:'linear',x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:'rgba(56,189,248,.5)'},{offset:1,color:'rgba(56,189,248,0)'}]}} },
      { name: isZH()?'降水概率':'Rain%', type:'bar', yAxisIndex:1, data:precip, barMaxWidth:6, itemStyle:{color:'rgba(99,179,237,0.45)',borderRadius:2} },
    ],
    legend: { top:6, right:8, textStyle:{color:'#94a3b8'}, itemWidth:12, itemHeight:8 },
  };
}

function buildHistoryOpt() {
  const h = WeatherStore.historyData;
  if (!h || !h.daily) return buildHourlyOpt();
  const dates = h.daily.time.map(t => { try { return t.slice(5); } catch { return t; } });
  const highs = (h.daily.temperature_2m_max||[]).map(v => +cvtTemp(v).toFixed(1));
  const lows  = (h.daily.temperature_2m_min||[]).map(v => +cvtTemp(v).toFixed(1));
  return {
    ...chartBase(),
    xAxis: { type:'category', data:dates, axisLine:{lineStyle:{color:'rgba(255,255,255,0.1)'}}, axisTick:{show:false}, axisLabel:{color:'#64748b', rotate:30} },
    yAxis: { type:'value', name:unitLabel('temp'), splitLine:{lineStyle:{color:'rgba(255,255,255,0.06)'}}, axisLabel:{color:'#64748b', formatter:v=>v+unitLabel('temp')} },
    series: [
      { name:isZH()?'最高':'High', type:'line', data:highs, smooth:true, symbol:'none', lineStyle:{color:'#f97316',width:2}, areaStyle:{opacity:0.1,color:'#f97316'} },
      { name:isZH()?'最低':'Low',  type:'line', data:lows,  smooth:true, symbol:'none', lineStyle:{color:'#38bdf8',width:2} },
    ],
    legend: { top:6, right:8, textStyle:{color:'#94a3b8'}, itemWidth:12, itemHeight:8 },
  };
}

function renderDailyCards() {
  const d    = WeatherStore.dailyForecast;
  const list = document.getElementById('dailyForecastList');
  if (!d || !list) return;
  const gMax  = Math.max(...d.temperature_2m_max);
  const gMin  = Math.min(...d.temperature_2m_min);
  const range = (gMax - gMin) || 1;
  list.innerHTML = d.time.map((dateStr, i) => {
    const high  = Math.round(cvtTemp(d.temperature_2m_max[i]));
    const low   = Math.round(cvtTemp(d.temperature_2m_min[i]));
    const rain  = d.precipitation_probability_max ? (d.precipitation_probability_max[i] || 0) : 0;
    const wmo   = d.weather_code[i];
    const left  = (((d.temperature_2m_min[i] - gMin) / range) * 100).toFixed(1);
    const width = (((d.temperature_2m_max[i] - d.temperature_2m_min[i]) / range) * 100).toFixed(1);
    const color = getTempColor((d.temperature_2m_max[i] + d.temperature_2m_min[i]) / 2);
    let label;
    try {
      if (i === 0) label = isZH() ? '今天' : 'Today';
      else if (i === 1) label = isZH() ? '明天' : 'Tomorrow';
      else {
        const days = isZH()
          ? ['周日','周一','周二','周三','周四','周五','周六']
          : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        label = days[new Date(dateStr + 'T12:00').getDay()];
      }
    } catch { label = dateStr.slice(5); }
    return `<div class="wq-day-row">
      <span class="wq-day-row__name">${label}</span>
      <div class="wq-day-row__icon">${getWeatherIconSVG(wmo)}</div>
      <div class="wq-day-row__desc">${getWeatherDesc(wmo)}</div>
      <div class="wq-day-row__bar-wrap"><div class="wq-day-row__bar" style="left:${left}%;width:${width}%;background:${color}"></div></div>
      <span class="wq-day-row__rain">${rain > 0 ? '💧' + rain + '%' : ''}</span>
      <span class="wq-day-row__high">${high}°</span>
      <span class="wq-day-row__low">${low}°</span>
    </div>`;
  }).join('');
}

// ── Render: AQI ───────────────────────────────────────────────────
function renderAQI() {
  const aqi = WeatherStore.aqiData;
  if (!aqi?.current) return;
  const val   = aqi.current.us_aqi || 0;
  const level = aqiLevel(val);

  if (typeof echarts !== 'undefined') {
    const el = document.getElementById('aqiGaugeChart');
    if (el) {
      if (!WeatherStore.aqiGaugeInstance) WeatherStore.aqiGaugeInstance = echarts.init(el, null, {renderer:'svg'});
      WeatherStore.aqiGaugeInstance.setOption({
        backgroundColor: 'transparent',
        series: [{
          type:'gauge', startAngle:210, endAngle:-30, min:0, max:300,
          data:[{value:val}],
          axisLine:{ lineStyle:{ width:12, color:aqiGradient() } },
          pointer:{show:false}, detail:{show:false},
          axisTick:{show:false}, splitLine:{show:false}, axisLabel:{show:false},
        }],
      });
    }
  }

  setEl('aqiValue', val);
  const lblEl = document.getElementById('aqiLevel');
  if (lblEl) { lblEl.textContent = i18n(AQI_LABEL[level.key]); lblEl.style.color = level.color; }
  const advEl = document.getElementById('aqiAdvice');
  if (advEl) { advEl.style.borderLeftColor = level.color; advEl.style.background = level.color + '18'; }
  setEl('aqiAdviceText', i18n(AQI_ADV[level.key]));

  const pollutants = [
    { id:'pm25', v:aqi.current.pm2_5,           max:150 },
    { id:'pm10', v:aqi.current.pm10,             max:350 },
    { id:'o3',   v:aqi.current.ozone,            max:200 },
    { id:'no2',  v:aqi.current.nitrogen_dioxide, max:200 },
    { id:'so2',  v:aqi.current.sulphur_dioxide,  max:350 },
    { id:'co',   v:(aqi.current.carbon_monoxide||0)/1000, max:15 },
  ];
  pollutants.forEach(p => {
    setEl('val-'+p.id, p.v != null ? +Number(p.v).toFixed(1) : '--');
    const pct = p.v != null ? Math.min(100,(p.v/p.max)*100) : 0;
    const fill = document.getElementById('bar-'+p.id);
    if (fill) { fill.style.width = pct+'%'; fill.style.background = pollutantColor(pct); }
  });

  document.getElementById('aqiPanel')?.classList.remove('hidden');
}

// ── Render: Life Index ────────────────────────────────────────────
function renderLife() {
  const d = WeatherStore.currentWeather;
  const daily = WeatherStore.dailyForecast;
  const grid = document.getElementById('lifeIndexGrid');
  if (!d || !grid) return;

  const aqiVal    = WeatherStore.aqiData?.current?.us_aqi;
  const pm25      = WeatherStore.aqiData?.current?.pm2_5;
  const precipMax = daily?.precipitation_probability_max?.[0] ?? 0;

  const items = [
    { key:'lifeDressing', icon:'👕', lv: lifeDressing(d.apparent_temperature) },
    { key:'lifeUV',       icon:'🕶️', lv: lifeUV(d.uv_index) },
    { key:'lifeExercise', icon:'🏃', lv: lifeExercise(d.apparent_temperature, aqiVal) },
    { key:'lifeCarWash',  icon:'🚗', lv: lifeCarWash(precipMax) },
    { key:'lifeAllergy',  icon:'🤧', lv: lifeAllergy(pm25, d.wind_speed_10m) },
    { key:'lifeComfort',  icon:'😊', lv: lifeComfort(d.apparent_temperature, d.relative_humidity_2m) },
  ];

  grid.innerHTML = items.map(it => {
    const color = LIFE_COLOR[it.lv.cls] || '#22c55e';
    return `<div class="wq-life-card">
      <span class="wq-life-card__icon">${it.icon}</span>
      <div class="wq-life-card__body">
        <span class="wq-life-card__name">${i18n(it.key)}</span>
        <span class="wq-life-card__level" style="color:${color}">${it.lv.lbl}</span>
        <p class="wq-life-card__tip">${it.lv.tip}</p>
      </div>
    </div>`;
  }).join('');

  document.getElementById('lifeIndexPanel')?.classList.remove('hidden');
}

// ── Map ───────────────────────────────────────────────────────────
function observeMap() {
  const panel = document.getElementById('weatherMapPanel');
  if (!panel) return;
  panel.classList.remove('hidden');
  if (!('IntersectionObserver' in window)) {
    initMap(WeatherStore.city.lat, WeatherStore.city.lon);
  } else {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { obs.disconnect(); initMap(WeatherStore.city.lat, WeatherStore.city.lon); }
    }, { threshold: 0.05 });
    obs.observe(panel);
  }
  // Sync world map to newly loaded city
  if (WorldMap.instance) {
    WorldMap.instance.setView([WeatherStore.city.lat, WeatherStore.city.lon], 6, { animate: true });
    setWorldMapMarker(WeatherStore.city.lat, WeatherStore.city.lon);
  }
}
function initMap(lat, lon) {
  if (typeof L === 'undefined') return;
  if (WeatherStore.mapInstance) { WeatherStore.mapInstance.setView([lat,lon], 8); return; }
  const map = L.map('weatherMap', { center:[lat,lon], zoom:8, zoomControl:true, attributionControl:false });
  WeatherStore.mapInstance = map;
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:18, opacity:0.65 }).addTo(map);
  L.circleMarker([lat,lon], { radius:8, color:'#38bdf8', fillColor:'#38bdf8', fillOpacity:0.9, weight:2 }).addTo(map);
  switchMapLayer('temperature');
}
function switchMapLayer(layer) {
  WeatherStore.activeMapLayer = layer;
  const map = WeatherStore.mapInstance;
  if (!map || typeof L === 'undefined') return;
  if (WeatherStore.mapLayerTile) { map.removeLayer(WeatherStore.mapLayerTile); WeatherStore.mapLayerTile = null; }
  const layers = { temperature:'temp_new', precipitation:'precipitation_new', clouds:'clouds_new', pressure:'pressure_new', wind:'wind_new' };
  WeatherStore.mapLayerTile = L.tileLayer(
    `https://tile.openweathermap.org/map/${layers[layer]||'temp_new'}/{z}/{x}/{y}.png?appid=439d4b804bc8187953eb36d2a8c26a02`,
    { opacity:0.65, maxZoom:18 }
  ).addTo(map);
  document.querySelectorAll('.wq-map-layer').forEach(b => b.classList.toggle('active', b.dataset.layer === layer));
  if (typeof gaTrackLayerSwitch === 'function') gaTrackLayerSwitch(layer);
}

// ── World Interactive Map ──────────────────────────────────────
const WorldMap = {
  instance:    null,
  layerTile:   null,
  clickMarker: null,
  activeLayer: 'temperature',
  isLoading:   false,
  currentLat:  null,
  currentLon:  null,
};

function initWorldMap() {
  if (typeof L === 'undefined') return;
  if (WorldMap.instance) return;

  const mapEl = document.getElementById('worldMap');
  if (!mapEl) return;

  // Initialize Leaflet world map centered on a neutral position
  const map = L.map('worldMap', {
    center: [20, 10],
    zoom: 2,
    zoomControl: true,
    attributionControl: false,
    minZoom: 1,
    maxZoom: 14,
  });
  WorldMap.instance = map;

  // Base tile layer (dark OpenStreetMap style)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    opacity: 0.85,
  }).addTo(map);

  // Default weather overlay
  switchWorldMapLayer('temperature');

  // Click handler
  map.on('click', function(e) {
    const { lat, lng } = e.latlng;
    WorldMap.currentLat = lat;
    WorldMap.currentLon = lng;
    showWorldMapPopup(lat, lng);
    loadWorldMapWeather(lat, lng);
  });

  // Sync the initial city marker if weather is loaded
  if (WeatherStore.city.lat && WeatherStore.city.lon) {
    setWorldMapMarker(WeatherStore.city.lat, WeatherStore.city.lon);
    map.setView([WeatherStore.city.lat, WeatherStore.city.lon], 5);
  }
}

function setWorldMapMarker(lat, lon) {
  if (!WorldMap.instance || typeof L === 'undefined') return;
  if (WorldMap.clickMarker) WorldMap.instance.removeLayer(WorldMap.clickMarker);
  WorldMap.clickMarker = L.circleMarker([lat, lon], {
    radius: 7, color: '#38bdf8', fillColor: '#38bdf8',
    fillOpacity: 0.9, weight: 2,
  }).addTo(WorldMap.instance);
}

function switchWorldMapLayer(layer) {
  WorldMap.activeLayer = layer;
  const map = WorldMap.instance;
  if (!map || typeof L === 'undefined') return;
  if (WorldMap.layerTile) { map.removeLayer(WorldMap.layerTile); WorldMap.layerTile = null; }
  const layerNames = {
    temperature:  'temp_new',
    precipitation:'precipitation_new',
    wind:         'wind_new',
    clouds:       'clouds_new',
    pressure:     'pressure_new',
  };
  WorldMap.layerTile = L.tileLayer(
    `https://tile.openweathermap.org/map/${layerNames[layer] || 'temp_new'}/{z}/{x}/{y}.png?appid=439d4b804bc8187953eb36d2a8c26a02`,
    { opacity: 0.70, maxZoom: 18 }
  ).addTo(map);
  document.querySelectorAll('.wq-wm-layer').forEach(b => b.classList.toggle('active', b.dataset.wmLayer === layer));
}

function showWorldMapPopup(lat, lon) {
  const popup = document.getElementById('wmPopup');
  if (!popup || !WorldMap.instance) return;

  // Position popup relative to the map container
  const mapEl = document.getElementById('worldMap');
  const point = WorldMap.instance.latLngToContainerPoint([lat, lon]);

  // Clamp to keep within map boundaries
  const popupW = 260, popupH = 220;
  const mapW = mapEl.offsetWidth, mapH = mapEl.offsetHeight;
  let x = Math.max(popupW / 2 + 10, Math.min(mapW - popupW / 2 - 10, point.x));
  let y = Math.max(popupH + 24, Math.min(mapH - 10, point.y));

  popup.style.left = x + 'px';
  popup.style.top  = y + 'px';
  popup.classList.remove('hidden');
  popup.querySelector('#wmPopupLoading').classList.remove('hidden');
  popup.querySelector('#wmPopupContent').classList.add('hidden');

  setWorldMapMarker(lat, lon);
}

async function loadWorldMapWeather(lat, lon) {
  if (WorldMap.isLoading) return;
  WorldMap.isLoading = true;
  try {
    const [wRes, gRes] = await Promise.allSettled([
      fetchWeather(lat, lon),
      reverseGeocode(lat, lon),
    ]);

    // Check if the popup still corresponds to this click
    if (WorldMap.currentLat !== lat || WorldMap.currentLon !== lon) return;

    const popup = document.getElementById('wmPopup');
    if (!popup || popup.classList.contains('hidden')) return;

    popup.querySelector('#wmPopupLoading').classList.add('hidden');
    popup.querySelector('#wmPopupContent').classList.remove('hidden');

    if (wRes.status === 'fulfilled') {
      const w = wRes.value;
      const c = w.current;
      const daily = w.daily;
      const tempC = c.temperature_2m;
      const tempDisplay = WeatherStore.unitTemp === 'fahrenheit'
        ? Math.round(tempC * 9/5 + 32) + '°F'
        : Math.round(tempC) + '°C';

      // Location name
      let locName = `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
      if (gRes.status === 'fulfilled' && gRes.value?.name) {
        locName = gRes.value.name + (gRes.value.country_code ? `, ${gRes.value.country_code}` : '');
      }
      const locEl = document.getElementById('wmPopupLocation');
      if (locEl) {
        locEl.innerHTML = `<svg viewBox="0 0 20 20" width="11" height="11" fill="currentColor"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg> ${locName}`;
      }

      const iconEl = document.getElementById('wmPopupIcon');
      if (iconEl) iconEl.innerHTML = getWeatherIconSVG(c.weather_code);
      const el = id => document.getElementById(id);
      if (el('wmPopupTemp')) el('wmPopupTemp').textContent = tempDisplay;
      if (el('wmPopupDesc')) el('wmPopupDesc').textContent = getWeatherDesc(c.weather_code);
      if (el('wmPopupWind')) el('wmPopupWind').textContent = cvtWind(c.wind_speed_10m) + ' ' + unitLabel('wind');
      if (el('wmPopupHumidity')) el('wmPopupHumidity').textContent = c.relative_humidity_2m + '%';
      if (el('wmPopupAqi')) el('wmPopupAqi').textContent = '--'; // AQI loads separately

      // Full forecast button
      const fullBtn = document.getElementById('wmPopupFullBtn');
      if (fullBtn) {
        fullBtn._lat = lat; fullBtn._lon = lon;
        fullBtn._name = gRes.status === 'fulfilled' && gRes.value?.name ? gRes.value.name : '';
        fullBtn._country = gRes.status === 'fulfilled' && gRes.value?.country_code ? gRes.value.country_code : '';
      }
    } else {
      // Error state
      const contentEl = document.getElementById('wmPopupContent');
      if (contentEl) contentEl.innerHTML = `<p style="color:var(--wq-text3);font-size:.8rem;text-align:center;padding:.5rem 0">Failed to load weather</p>`;
    }
  } catch (err) {
    const loadingEl = document.getElementById('wmPopupLoading');
    const contentEl = document.getElementById('wmPopupContent');
    if (loadingEl) loadingEl.classList.add('hidden');
    if (contentEl) {
      contentEl.classList.remove('hidden');
      contentEl.innerHTML = `<p style="color:var(--wq-text3);font-size:.8rem;text-align:center;padding:.5rem 0">Failed to load weather</p>`;
    }
  } finally {
    WorldMap.isLoading = false;
  }
}

function closeWorldMapPopup() {
  document.getElementById('wmPopup')?.classList.add('hidden');
  WorldMap.currentLat = null;
  WorldMap.currentLon = null;
}

// ── Snapshot ──────────────────────────────────────────────────────
async function saveSnapshot() {
  if (typeof html2canvas === 'undefined') { toast(i18n('shareError'),'error'); return; }
  const btn = document.getElementById('shareSnapshotBtn');
  if (btn) { btn.disabled = true; btn.textContent = i18n('shareGenerating'); }
  try {
    const canvas = await html2canvas(document.getElementById('currentWeatherCard'), {
      backgroundColor: null, scale: 2, useCORS: true, logging: false,
      ignoreElements: el => el.classList.contains('adsbygoogle') || el.classList.contains('ad-slot'),
    });
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = `${Math.floor(canvas.width*0.022)}px system-ui, sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillText('toolboxnova.com', canvas.width-12, canvas.height-10);
    const a = document.createElement('a');
    const dt = new Date().toISOString().slice(0,10);
    a.href = canvas.toDataURL('image/png');
    a.download = `weather-${WeatherStore.city.name||'snapshot'}-${dt}.png`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    toast(i18n('shareSuccess'), 'success');
    if (typeof gaTrackSnapshot === 'function') gaTrackSnapshot();
  } catch(e) {
    toast(i18n('shareError'), 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg> ${i18n('shareBtn')}`;
    }
  }
}

// ── Search ────────────────────────────────────────────────────────
let _searchTimer = null;
function onSearchInput(query) {
  query = (query||'').trim();
  document.getElementById('searchClearBtn')?.classList.toggle('hidden', !query);
  if (query.length < 2) { hideDropdown(); return; }
  clearTimeout(_searchTimer);
  _searchTimer = setTimeout(async () => {
    showSearchSpinner(true);
    const results = await geocodeSearch(query);
    showSearchSpinner(false);
    renderDropdown(results);
  }, 300);
}

function showSearchSpinner(on) {
  const icon = document.querySelector('.wq-search__icon');
  if (icon) icon.style.opacity = on ? '0.3' : '1';
}

function renderDropdown(results) {
  const list = document.getElementById('searchDropdown');
  if (!list) return;
  list.innerHTML = '';
  if (!results.length) {
    list.innerHTML = `<li class="wq-search__item wq-search__no-result">🔍 ${i18n('searchNoResult')}</li>`;
    list.classList.remove('hidden');
    return;
  }
  // Build a 2-column grid of city result cards
  const grid = document.createElement('div');
  grid.className = 'wq-search__grid';
  results.slice(0,8).forEach((r, idx) => {
    const card = document.createElement('div');
    card.className = 'wq-search__card';
    card.setAttribute('role','option');
    card.setAttribute('tabindex', '0');
    card.dataset.idx = idx;
    const flag   = r.country_code ? countryFlag(r.country_code) : '🌍';
    const sub    = [r.admin1, r.country].filter(Boolean).join(', ');
    const elev   = r.elevation != null ? `${Math.round(r.elevation)}m` : '';
    const pop    = r.population ? fmtPop(r.population) : '';
    card.innerHTML = `
      <div class="wq-sc__flag">${flag}</div>
      <div class="wq-sc__body">
        <div class="wq-sc__name">${r.name}</div>
        <div class="wq-sc__sub">${sub}</div>
        ${elev || pop ? `<div class="wq-sc__meta">${[elev, pop].filter(Boolean).join(' · ')}</div>` : ''}
      </div>
      <div class="wq-sc__arrow">→</div>`;
    const select = () => {
      const inp = document.getElementById('citySearchInput');
      if (inp) inp.value = r.name;
      hideDropdown();
      loadByCoords(r.latitude, r.longitude, r.name, r.country_code);
      if (typeof gaTrackWeatherSearch === 'function') gaTrackWeatherSearch(r.name, 'text');
    };
    card.addEventListener('click', select);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(); } });
    grid.appendChild(card);
  });
  list.appendChild(grid);
  list.classList.remove('hidden');
}

function fmtPop(n) {
  if (n >= 1e6) return (n/1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n/1e3).toFixed(0) + 'K';
  return String(n);
}

function countryFlag(code) {
  if (!code || code.length !== 2) return '🌍';
  return String.fromCodePoint(...[...code.toUpperCase()].map(c => 127397 + c.charCodeAt(0)));
}
function hideDropdown() { document.getElementById('searchDropdown')?.classList.add('hidden'); }
function clearSearch() {
  const inp = document.getElementById('citySearchInput');
  if (inp) inp.value = '';
  document.getElementById('searchClearBtn')?.classList.add('hidden');
  hideDropdown();
}

function onSearchKeydown(e) {
  const list = document.getElementById('searchDropdown');
  if (!list || list.classList.contains('hidden')) {
    if (e.key === 'Enter') { const v = document.getElementById('citySearchInput')?.value?.trim(); if (v) searchByName(v); }
    return;
  }
  const cards = [...list.querySelectorAll('.wq-search__card')];
  if (!cards.length) {
    if (e.key === 'Escape') hideDropdown();
    return;
  }
  const fi = cards.findIndex(x => x.classList.contains('focused'));
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    const ni = (fi + 1) % cards.length;
    cards[fi]?.classList.remove('focused'); cards[ni].classList.add('focused'); cards[ni].focus();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    const ni = fi <= 0 ? cards.length - 1 : fi - 1;
    cards[fi]?.classList.remove('focused'); cards[ni].classList.add('focused'); cards[ni].focus();
  } else if (e.key === 'Enter') {
    if (fi >= 0) cards[fi].click();
    else { const v = document.getElementById('citySearchInput')?.value?.trim(); if (v) searchByName(v); }
  } else if (e.key === 'Escape') { hideDropdown(); }
}

async function searchByName(name) {
  if (!name) return;
  const results = await geocodeSearch(name);
  if (results.length) {
    const r = results[0];
    await loadByCoords(r.latitude, r.longitude, r.name, r.country_code);
  } else {
    toast(i18n('errCityNotFound'), 'warn');
  }
}

// ── Geolocation ───────────────────────────────────────────────────
async function locateUser() {
  const btn = document.getElementById('locateBtn');
  btn?.classList.add('loading');
  if (!navigator.geolocation) { btn?.classList.remove('loading'); await locateByIP(); return; }
  navigator.geolocation.getCurrentPosition(
    async ({ coords }) => {
      btn?.classList.remove('loading');
      await loadByCoords(coords.latitude, coords.longitude);
      if (typeof gaTrackWeatherSearch === 'function') gaTrackWeatherSearch('', 'geolocation');
    },
    async (err) => {
      btn?.classList.remove('loading');
      if (err.code === 1) toast(i18n('searchErrGeo'), 'warn');
      await locateByIP();
    },
    { timeout: 10000, maximumAge: 300000 }
  );
}

// ── Skeleton ──────────────────────────────────────────────────────
function showSkeleton() {
  document.getElementById('loadingSkeleton')?.classList.remove('hidden');
  document.getElementById('wqMain')?.classList.add('hidden');
}
function hideSkeleton() {
  document.getElementById('loadingSkeleton')?.classList.add('hidden');
  document.getElementById('wqMain')?.classList.remove('hidden');
}

// ── Main Load ─────────────────────────────────────────────────────
async function loadByCoords(lat, lon, nameOverride, countryCode) {
  if (WeatherStore.isLoading) return;
  WeatherStore.isLoading = true;
  const seq = ++WeatherStore.loadSeq;
  const t0  = performance.now();
  showSkeleton();

  try {
    // Parallel: weather + AQI + reverse-geocode (skip reverse if name provided)
    const [wRes, aRes, gRes] = await Promise.allSettled([
      fetchWeather(lat, lon),
      fetchAQI(lat, lon),
      nameOverride ? Promise.resolve(null) : reverseGeocode(lat, lon),
    ]);

    // Guard against stale responses from rapid city switches
    if (seq !== WeatherStore.loadSeq) return;

    if (wRes.status !== 'fulfilled') {
      throw new Error(i18n('errApiError'));
    }
    const w = wRes.value;
    WeatherStore.currentWeather = w.current;
    WeatherStore.hourlyForecast = w.hourly;
    WeatherStore.dailyForecast  = w.daily;
    WeatherStore.city.timezone  = w.timezone  || '';
    WeatherStore.city.utcOffset = w.utc_offset_seconds || 0;

    if (aRes.status === 'fulfilled') WeatherStore.aqiData = aRes.value;
    else WeatherStore.aqiData = null;

    if (nameOverride) {
      WeatherStore.city.name    = nameOverride;
      WeatherStore.city.country = countryCode || '';
    } else if (gRes.status === 'fulfilled' && gRes.value?.name) {
      WeatherStore.city.name    = gRes.value.name;
      WeatherStore.city.country = gRes.value.country_code || '';
    } else {
      WeatherStore.city.name    = `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`;
      WeatherStore.city.country = '';
    }
    WeatherStore.city.lat = lat;
    WeatherStore.city.lon = lon;
    WeatherStore.historyData = null; // reset on city change

    renderCurrent();
    renderForecast();
    renderAQI();
    renderLife();
    updateBg();
    pushURL();
    saveRecent();
    observeMap();

    if (typeof gaTrackWeatherLoaded === 'function') gaTrackWeatherLoaded(WeatherStore.city.name, performance.now()-t0);

  } catch(err) {
    if (seq !== WeatherStore.loadSeq) return;
    const msg = err.message?.includes('weather_') ? i18n('errApiError') : (err.message || i18n('errApiError'));
    toast(msg, 'error', 5000);
    if (typeof gaTrackWeatherError === 'function') gaTrackWeatherError('api_fail', err.message);
  } finally {
    if (seq === WeatherStore.loadSeq) {
      WeatherStore.isLoading = false;
      hideSkeleton();
    }
  }
}

// ── Unit Switcher ─────────────────────────────────────────────────
function setUnit(type, value) {
  WeatherStore['unit'+type[0].toUpperCase()+type.slice(1)] = value;
  try { localStorage.setItem('wq_unit_'+type, value); } catch {}
  syncUnitBtns();
  if (WeatherStore.currentWeather) renderCurrent();
  if (WeatherStore.hourlyForecast) drawForecastChart(WeatherStore.activeForecastTab);
  if (typeof gaTrackUnitChange === 'function') gaTrackUnitChange(type, value);
}

// ── Forecast Tab ──────────────────────────────────────────────────
async function switchTab(tab) {
  WeatherStore.activeForecastTab = tab;
  document.querySelectorAll('.wq-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  if (tab === 'history' && !WeatherStore.historyData) {
    const btn = document.querySelector(`.wq-tab[data-tab="history"]`);
    if (btn) btn.textContent = '⏳';
    await fetchHistory(WeatherStore.city.lat, WeatherStore.city.lon).catch(() => {});
    if (btn) btn.textContent = i18n('forecastHistory');
  }
  drawForecastChart(tab);
  if (typeof gaTrackForecastTab === 'function') gaTrackForecastTab(tab);
}

// ── Init ──────────────────────────────────────────────────────────
async function initEngine() {
  loadPrefs();
  loadRecents();
  renderRecentChips();
  syncUnitBtns();

  // Search
  const inp = document.getElementById('citySearchInput');
  if (inp) {
    inp.addEventListener('input',   e => onSearchInput(e.target.value));
    inp.addEventListener('keydown', onSearchKeydown);
  }

  // Buttons
  document.getElementById('locateBtn')?.addEventListener('click', locateUser);
  document.getElementById('searchClearBtn')?.addEventListener('click', clearSearch);
  document.getElementById('shareSnapshotBtn')?.addEventListener('click', saveSnapshot);

  // Unit buttons
  document.querySelectorAll('[data-unit-temp]').forEach(b => b.addEventListener('click', () => setUnit('temp', b.dataset.unitTemp)));
  document.querySelectorAll('[data-unit-wind]').forEach(b => b.addEventListener('click', () => setUnit('wind', b.dataset.unitWind)));

  // Forecast tabs
  document.querySelectorAll('.wq-tab').forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)));

  // Map layers (small card)
  document.querySelectorAll('.wq-map-layer').forEach(b => b.addEventListener('click', () => switchMapLayer(b.dataset.layer)));

  // World map layer buttons
  document.querySelectorAll('.wq-wm-layer').forEach(b => b.addEventListener('click', () => switchWorldMapLayer(b.dataset.wmLayer)));

  // World map popup close
  document.getElementById('wmPopupClose')?.addEventListener('click', closeWorldMapPopup);

  // World map popup full forecast button
  document.getElementById('wmPopupFullBtn')?.addEventListener('click', function() {
    const lat  = this._lat,  lon = this._lon;
    const name = this._name, country = this._country;
    if (lat == null || lon == null) return;
    closeWorldMapPopup();
    loadByCoords(lat, lon, name || undefined, country || undefined);
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (typeof gaTrackWeatherSearch === 'function') gaTrackWeatherSearch(name || `${lat},${lon}`, 'map_click');
  });

  // Model compare
  document.getElementById('modelCompareToggle')?.addEventListener('change', e => { WeatherStore.modelCompareEnabled = e.target.checked; });

  // Close dropdown on outside click
  document.addEventListener('click', e => { if (!e.target.closest('.wq-search')) hideDropdown(); });

  // Local time ticker
  setInterval(() => {
    if (WeatherStore.city.timezone) setEl('localTime', getLocalTimeStr(WeatherStore.city.timezone));
  }, 30000);

  // FAQ accordion
  document.querySelectorAll('.wq-faq__item').forEach(d => {
    d.addEventListener('toggle', () => {
      const a = d.querySelector('.wq-faq__a');
      if (a) a.style.maxHeight = d.open ? a.scrollHeight + 'px' : '0';
    });
  });

  // ── World map: lazy init via IntersectionObserver ────────────
  const worldMapSection = document.getElementById('worldMapSection');
  if (worldMapSection) {
    const wmObsCallback = (entries, observer) => {
      if (entries[0].isIntersecting) {
        observer.disconnect();
        // Wait for Leaflet to be available (it's loaded async)
        const tryInit = (attempts) => {
          if (typeof L !== 'undefined') {
            initWorldMap();
          } else if (attempts > 0) {
            setTimeout(() => tryInit(attempts - 1), 300);
          }
        };
        tryInit(20); // try up to 6 seconds
      }
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(wmObsCallback, { threshold: 0.05 }).observe(worldMapSection);
    } else {
      setTimeout(() => initWorldMap(), 1500);
    }
  }

  // Determine initial city
  const params = new URLSearchParams(location.search);
  const urlCity = params.get('city');
  const urlLat  = parseFloat(params.get('lat'));
  const urlLon  = parseFloat(params.get('lon'));

  if (urlCity) {
    await searchByName(urlCity);
  } else if (!isNaN(urlLat) && !isNaN(urlLon)) {
    await loadByCoords(urlLat, urlLon);
  } else if (WeatherStore.recentCities.length) {
    const r = WeatherStore.recentCities[0];
    await loadByCoords(r.lat, r.lon, r.name, r.country);
  } else {
    await locateByIP();
  }
}

// ── Boot ──────────────────────────────────────────────────────────
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initEngine);
else initEngine();

// Public API for inline fallback
window.WeatherEngine = {
  searchByName, locateUser, clearSearch,
  setUnit, switchTab, switchMapLayer, saveSnapshot,
  onSearchInput, onSearchKeydown,
  initWorldMap, switchWorldMapLayer,
};

