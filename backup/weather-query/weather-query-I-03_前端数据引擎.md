<!-- weather-query-I-03_前端数据引擎.md -->

# Weather Query · 天气查询工具 — 前端数据引擎

---

## 1. 技术选型表

| 功能场景 | 选型方案 | 选型原因 |
|---------|---------|---------|
| 天气数据源 | **Open-Meteo API** | 免费无限次，CORS开放，ECMWF+GFS双模型，覆盖全球 |
| 空气质量数据 | **Open-Meteo AQI API** | 同源免费，包含PM2.5/PM10/O3/NO2/SO2/CO全项 |
| 历史天气 | **Open-Meteo Archive API** | 免费提供近30天历史数据，ERA5重分析数据 |
| 城市地理编码 | **Open-Meteo Geocoding API** | 免费，支持全球城市名称→坐标转换 |
| 地图渲染 | **Leaflet.js** | 开源轻量，生态丰富，移动端表现好 |
| 地图天气图层 | **OpenWeatherMap Tiles + Leaflet-Velocity** | OWM提供温度/降水/云量/气压图层；Leaflet-Velocity渲染风速粒子 |
| 图表渲染 | **ECharts 5** | 折线图+柱状图+环形图一站式，动画流畅，响应式支持好 |
| 天气快照 | **html2canvas** | 前端截图无需服务器，生成高清图片卡片 |
| 日期处理 | **Day.js** | 轻量（2KB），支持时区、相对时间、本地化 |
| IP定位 | **ip-api.com（免费版）** | 免费IP地理定位，CORS开放 |
| 精确定位 | **HTML5 Geolocation API** | 浏览器原生，精度高 |
| 本地缓存 | **localStorage** | 搜索历史（最近5城市）、用户单位偏好持久化 |

---

## 2. 引擎架构说明

### 全局状态对象

```javascript
// js/weather-engine.js

const WeatherStore = {
  // 当前城市信息
  city: {
    name: '',       // 城市名
    country: '',    // 国家代码
    lat: null,      // 纬度
    lon: null,      // 经度
    timezone: '',   // 时区字符串（如 "Asia/Shanghai"）
    utcOffset: 0,   // UTC偏移秒数
  },

  // 天气数据（原始 API 响应）
  currentWeather: null,      // Open-Meteo current 字段
  hourlyForecast: null,      // Open-Meteo hourly（48小时）
  dailyForecast: null,       // Open-Meteo daily（14天）
  aqiData: null,             // Open-Meteo AQI current + hourly
  historyData: null,         // Open-Meteo Archive（近30天，懒加载）
  alerts: [],                // 天气预警列表

  // 用户配置（localStorage 持久化）
  unitTemp: 'celsius',       // 'celsius' | 'fahrenheit'
  unitWind: 'kmh',           // 'kmh' | 'mph' | 'ms'
  unitPressure: 'hpa',       // 'hpa' | 'inhg'
  unitPrecip: 'mm',          // 'mm' | 'inches'
  recentCities: [],          // 最近5个城市 [{name, lat, lon, country}]

  // UI 状态
  activeForecastTab: 'hourly24',
  activeMapLayer: 'temperature',
  modelCompareEnabled: false,
  isLoading: false,
  currentTheme: 'clear',     // 背景主题

  // 图表/地图实例（生命周期管理）
  forecastChartInstance: null,
  aqiGaugeInstance: null,
  mapInstance: null,
  mapLayerTile: null,
  mapVelocityLayer: null,
};
```

### 核心函数职责说明

---

### `initEngine()`
**职责**：页面加载时初始化引擎。

```javascript
async function initEngine() {
  loadUserPreferences();     // 从 localStorage 恢复单位设置
  renderRecentChips();       // 渲染最近搜索
  
  // 优先级：URL 参数 → localStorage 上次城市 → IP定位
  const urlCity = new URLSearchParams(location.search).get('city');
  const urlLat  = parseFloat(new URLSearchParams(location.search).get('lat'));
  const urlLon  = parseFloat(new URLSearchParams(location.search).get('lon'));

  if (urlCity) {
    await searchByName(urlCity);
  } else if (!isNaN(urlLat) && !isNaN(urlLon)) {
    await loadWeatherByCoords(urlLat, urlLon);
  } else {
    const lastCity = getLastCity();
    if (lastCity) await loadWeatherByCoords(lastCity.lat, lastCity.lon, lastCity.name);
    else await locateByIP();
  }
}
```

---

### `onSearchInput(query)` 
**职责**：处理搜索框输入，debounce 300ms 后调用地理编码 API。

```javascript
let searchDebounceTimer = null;
async function onSearchInput(query) {
  query = query.trim();
  if (query.length < 2) { hideDropdown(); return; }

  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(async () => {
    const results = await fetchGeocodingResults(query);
    renderDropdown(results);
  }, 300);
}

// 关键校验：格式白名单（只接受字母/汉字/空格/连字符/逗号）
function isValidQuery(q) {
  return /^[\p{L}\p{N}\s\-,\.]+$/u.test(q) && q.length <= 100;
}
```

---

### `loadWeatherByCoords(lat, lon, cityNameOverride?)`
**职责**：核心数据加载函数，并发请求3个 API，聚合结果更新 Store。

```javascript
async function loadWeatherByCoords(lat, lon, nameOverride) {
  WeatherStore.isLoading = true;
  showSkeleton();
  
  try {
    // 并发请求：天气 + AQI（同时发出，加速加载）
    const [weatherResp, aqiResp, reverseGeoResp] = await Promise.allSettled([
      fetchCurrentAndForecast(lat, lon),
      fetchAQIData(lat, lon),
      nameOverride ? Promise.resolve(null) : fetchReverseGeocode(lat, lon),
    ]);

    // 解析天气
    if (weatherResp.status === 'fulfilled') {
      const data = weatherResp.value;
      WeatherStore.currentWeather = data.current;
      WeatherStore.hourlyForecast = data.hourly;
      WeatherStore.dailyForecast  = data.daily;
      WeatherStore.city.timezone  = data.timezone;
      WeatherStore.city.utcOffset = data.utc_offset_seconds;
    } else throw new Error('weather_api_fail');

    // 解析 AQI（允许失败，静默降级）
    if (aqiResp.status === 'fulfilled') {
      WeatherStore.aqiData = aqiResp.value;
    }

    // 解析城市名
    if (reverseGeoResp.status === 'fulfilled' && reverseGeoResp.value) {
      WeatherStore.city.name    = reverseGeoResp.value.name;
      WeatherStore.city.country = reverseGeoResp.value.country_code;
    } else if (nameOverride) {
      WeatherStore.city.name = nameOverride;
    }

    WeatherStore.city.lat = lat;
    WeatherStore.city.lon = lon;

    // 渲染所有面板
    renderCurrentWeather();
    renderForecastPanel();
    renderAQIPanel();
    renderLifeIndex();
    updateWeatherBackground();
    updatePageURL();
    saveRecentCity();
    
    // 地图懒初始化（首次进入视口再初始化）
    observeMapPanel();
    
    // 历史数据懒加载（Tab 切换时才请求）
    
    gaTrackWeatherLoaded(WeatherStore.city.name, performance.now() - loadStart);
    
  } catch (err) {
    showError(err.message);
    gaTrackWeatherError('api_fail', err.message);
  } finally {
    WeatherStore.isLoading = false;
    hideSkeleton();
  }
}
```

---

### `fetchCurrentAndForecast(lat, lon)`
**职责**：调用 Open-Meteo forecast API，一次请求获取当前+逐小时+逐日+两套模型数据。

```javascript
async function fetchCurrentAndForecast(lat, lon) {
  const BASE = 'https://api.open-meteo.com/v1/forecast';
  const params = new URLSearchParams({
    latitude: lat, longitude: lon,
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
      'wind_speed_10m_max','uv_index_max',
      'sunrise','sunset','moonrise','moonset','moon_phase'
    ].join(','),
    // ECMWF 模型对比（用于 model_compare 模式）
    models: WeatherStore.modelCompareEnabled ? 'ecmwf_ifs025,gfs025' : 'best_match',
    forecast_days: 14,
    hourly_forecast_hours: 48,
    timezone: 'auto',
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm',
  });

  const res = await fetchWithTimeout(`${BASE}?${params}`, 8000);
  if (!res.ok) throw new Error('weather_api_error_' + res.status);
  return res.json();
}
```

---

### `fetchAQIData(lat, lon)`
**职责**：调用 Open-Meteo AQI API，获取当前和未来5天空气质量。

```javascript
async function fetchAQIData(lat, lon) {
  const BASE = 'https://air-quality-api.open-meteo.com/v1/air-quality';
  const params = new URLSearchParams({
    latitude: lat, longitude: lon,
    current: ['us_aqi','pm2_5','pm10','ozone','nitrogen_dioxide','sulphur_dioxide','carbon_monoxide'].join(','),
    hourly: ['us_aqi','pm2_5','pm10'].join(','),
    forecast_days: 3,
    timezone: 'auto',
  });
  const res = await fetchWithTimeout(`${BASE}?${params}`, 6000);
  if (!res.ok) throw new Error('aqi_api_fail');
  return res.json();
}
```

---

### `fetchHistoryData(lat, lon)` （懒加载）
**职责**：切换到「历史」Tab 时才调用，获取近30天历史天气。

```javascript
async function fetchHistoryData(lat, lon) {
  if (WeatherStore.historyData) return; // 已缓存，不重复请求

  const today = dayjs().format('YYYY-MM-DD');
  const past30 = dayjs().subtract(30, 'day').format('YYYY-MM-DD');
  
  const BASE = 'https://archive-api.open-meteo.com/v1/archive';
  const params = new URLSearchParams({
    latitude: lat, longitude: lon,
    start_date: past30, end_date: today,
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code',
    timezone: 'auto',
  });

  const res = await fetchWithTimeout(`${BASE}?${params}`, 10000);
  if (!res.ok) throw new Error('history_api_fail');
  WeatherStore.historyData = await res.json();
  renderHistoryChart();
}
```

---

### `locateUser()`
**职责**：尝试 HTML5 GPS 精确定位，失败降级到 IP 定位。

```javascript
async function locateUser() {
  const btn = document.getElementById('locateBtn');
  btn.classList.add('loading');
  
  if (!navigator.geolocation) {
    await locateByIP();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async ({ coords }) => {
      btn.classList.remove('loading');
      await loadWeatherByCoords(coords.latitude, coords.longitude);
      gaTrackWeatherSearch('', 'geolocation');
    },
    async (err) => {
      btn.classList.remove('loading');
      if (err.code === 1) {
        showToast(i18n('search.error_geo'), 'warn');
        gaTrackWeatherError('geo_denied', err.message);
      }
      await locateByIP(); // 降级
    },
    { timeout: 10000, maximumAge: 300000 }
  );
}

async function locateByIP() {
  try {
    const res = await fetchWithTimeout('https://ip-api.com/json/?fields=lat,lon,city,countryCode', 5000);
    const data = await res.json();
    if (data.lat && data.lon) {
      await loadWeatherByCoords(data.lat, data.lon, data.city);
    }
  } catch {
    // IP定位也失败，显示默认城市（北京）
    await loadWeatherByCoords(39.9042, 116.4074, 'Beijing');
  }
}
```

---

### `renderCurrentWeather()`
**职责**：将 `WeatherStore.currentWeather` 渲染到 DOM，包括单位转换。

```javascript
function renderCurrentWeather() {
  const d = WeatherStore.currentWeather;
  const daily = WeatherStore.dailyForecast;
  
  // 温度（单位转换）
  const temp = convertTemp(d.temperature_2m);
  const feelsLike = convertTemp(d.apparent_temperature);
  document.getElementById('currentTemp').textContent = Math.round(temp);
  document.getElementById('feelsLike').textContent = Math.round(feelsLike) + getUnitLabel('temp');

  // 天气图标（按 WMO 天气码映射到 SVG 动画图标）
  const iconEl = document.getElementById('currentWeatherIcon');
  iconEl.innerHTML = getWeatherIconSVG(d.weather_code);

  // 指标填充
  setMetric('humidity', d.relative_humidity_2m + '%');
  setMetric('wind', convertWind(d.wind_speed_10m) + ' ' + getUnitLabel('wind'));
  setMetric('wind-dir', getWindDirection(d.wind_direction_10m));
  setMetric('pressure', convertPressure(d.surface_pressure) + ' ' + getUnitLabel('pressure'));
  setMetric('visibility', (d.visibility / 1000).toFixed(1) + ' km');
  setMetric('uv', d.uv_index);
  setMetric('uv-level', getUVLevel(d.uv_index));
  setMetric('clouds', d.cloud_cover + '%');
  setMetric('dew', convertTemp(d.dew_point_2m) + getUnitLabel('temp'));
  setMetric('precip', d.precipitation + ' mm');

  // 日出日落（取 daily[0]）
  if (daily) {
    document.getElementById('sunriseTime').textContent = formatLocalTime(daily.sunrise[0], WeatherStore.city.utcOffset);
    document.getElementById('sunsetTime').textContent  = formatLocalTime(daily.sunset[0],  WeatherStore.city.utcOffset);
    updateSunArcPosition(daily.sunrise[0], daily.sunset[0]);
    
    // 月相
    const moonPhase = daily.moon_phase[0]; // 0-1
    document.getElementById('moonPhaseIcon').textContent = getMoonPhaseEmoji(moonPhase);
    document.getElementById('val-moonphase').textContent = getMoonPhaseName(moonPhase);
    document.getElementById('val-moonrise').textContent = formatLocalTime(daily.moonrise[0], WeatherStore.city.utcOffset);
    document.getElementById('val-moonset').textContent  = formatLocalTime(daily.moonset[0],  WeatherStore.city.utcOffset);
  }

  // 最高/最低温
  if (daily) {
    document.getElementById('tempHigh').textContent = '↑ ' + Math.round(convertTemp(daily.temperature_2m_max[0])) + getUnitLabel('temp');
    document.getElementById('tempLow').textContent  = '↓ ' + Math.round(convertTemp(daily.temperature_2m_min[0])) + getUnitLabel('temp');
  }

  // 预警
  if (WeatherStore.alerts.length > 0) showAlertBanner(WeatherStore.alerts[0]);

  // 显示卡片
  document.getElementById('currentWeatherCard').classList.remove('hidden');
}
```

---

### `renderForecastChart(tab)`
**职责**：用 ECharts 渲染 hourly24 / daily14 / history 三个 Tab 的图表。

```javascript
function renderForecastChart(tab) {
  const chartEl = document.getElementById('forecastChart');
  if (!WeatherStore.forecastChartInstance) {
    WeatherStore.forecastChartInstance = echarts.init(chartEl, null, { renderer: 'svg' });
  }
  const chart = WeatherStore.forecastChartInstance;

  let option;
  switch (tab) {
    case 'hourly24': option = buildHourlyOption(); break;
    case 'daily14':  option = buildDailyOption();  break;
    case 'history':  option = buildHistoryOption(); break;
  }
  chart.setOption(option, { notMerge: true });
  
  // 响应式
  const resizeObs = new ResizeObserver(() => chart.resize());
  resizeObs.observe(chartEl);
}

function buildHourlyOption() {
  const h = WeatherStore.hourlyForecast;
  const times = h.time.slice(0, 48).map(t => dayjs(t).format('HH:mm'));
  const temps  = h.temperature_2m.slice(0, 48).map(v => Math.round(convertTemp(v)));
  const precip = h.precipitation_probability.slice(0, 48);

  // 模型对比：若启用，叠加第二条线（ECMWF vs GFS）
  const series = [{
    name: i18n('forecast.chart_temp'),
    type: 'line',
    data: temps,
    smooth: true,
    symbol: 'none',
    areaStyle: { opacity: 0.2 },
    lineStyle: { width: 2.5, color: '#38bdf8' },
    itemStyle: { color: '#38bdf8' },
  }];

  if (WeatherStore.modelCompareEnabled && WeatherStore.forecastModelB) {
    series.push({
      name: i18n('forecast.model_ecmwf'),
      type: 'line',
      data: WeatherStore.forecastModelB.hourly.temperature_2m.slice(0,48).map(v => Math.round(convertTemp(v))),
      smooth: true, symbol: 'none',
      lineStyle: { width: 1.5, color: '#f97316', type: 'dashed' },
      itemStyle: { color: '#f97316' },
    });
  }

  return {
    backgroundColor: 'transparent',
    textStyle: { color: '#94a3b8' },
    grid: { left: 40, right: 20, top: 30, bottom: 60 },
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(15,23,42,0.9)', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#f1f5f9' } },
    xAxis: { type: 'category', data: times, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } }, axisLabel: { color: '#64748b', interval: 5 } },
    yAxis: { type: 'value', name: getUnitLabel('temp'), nameTextStyle: { color: '#64748b' }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, axisLabel: { color: '#64748b' } },
    series,
    // 降水概率柱状图（双 Y 轴）
    yAxis: [
      { type: 'value', name: getUnitLabel('temp'), position: 'left', axisLabel: { color: '#64748b', formatter: v => v + getUnitLabel('temp') } },
      { type: 'value', name: '%', position: 'right', max: 100, axisLabel: { color: '#64748b', formatter: v => v + '%' } }
    ],
  };
}
```

---

### `renderAQIPanel()`
**职责**：渲染空气质量环形仪表盘 + 6项污染物进度条。

```javascript
function renderAQIPanel() {
  const aqi = WeatherStore.aqiData;
  if (!aqi) return;
  
  const aqiVal = aqi.current.us_aqi;
  const level  = getAQILevel(aqiVal);   // {label, color, advice, key}

  // ECharts 环形仪表盘
  if (!WeatherStore.aqiGaugeInstance) {
    WeatherStore.aqiGaugeInstance = echarts.init(document.getElementById('aqiGaugeChart'), null, { renderer: 'svg' });
  }
  WeatherStore.aqiGaugeInstance.setOption({
    series: [{
      type: 'gauge',
      startAngle: 200, endAngle: -20,
      min: 0, max: 300,
      data: [{ value: aqiVal, name: '' }],
      axisLine: { lineStyle: { width: 15, color: getAQIGradient() } },
      pointer: { show: false },
      detail: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
    }],
    backgroundColor: 'transparent',
  });

  document.getElementById('aqiValue').textContent = aqiVal;
  document.getElementById('aqiLevel').textContent  = i18n('aqi.level_' + level.key);
  document.getElementById('aqiAdviceText').textContent = i18n('aqi.advice_' + level.key);

  // 污染物进度条
  const pollutants = [
    { key: 'pm25', val: aqi.current.pm2_5,            max: 150 },
    { key: 'pm10', val: aqi.current.pm10,              max: 350 },
    { key: 'o3',   val: aqi.current.ozone,             max: 200 },
    { key: 'no2',  val: aqi.current.nitrogen_dioxide,  max: 200 },
    { key: 'so2',  val: aqi.current.sulphur_dioxide,   max: 350 },
    { key: 'co',   val: aqi.current.carbon_monoxide,   max: 10000 },
  ];
  pollutants.forEach(p => {
    document.getElementById('val-' + p.key).textContent = p.val?.toFixed(1) ?? '--';
    const pct = Math.min(100, (p.val / p.max) * 100);
    const fill = document.getElementById('bar-' + p.key);
    if (fill) { fill.style.width = pct + '%'; fill.style.background = getPollutantColor(pct); }
  });

  document.getElementById('aqiPanel').classList.remove('hidden');
}
```

---

### `renderLifeIndex()`
**职责**：根据天气数据计算6项生活指数，渲染图标卡片。

```javascript
function renderLifeIndex() {
  const d = WeatherStore.currentWeather;
  const daily = WeatherStore.dailyForecast;
  
  const indices = [
    {
      key: 'dressing',
      icon: '👕',
      level: getDressingLevel(d.temperature_2m, d.wind_speed_10m, d.relative_humidity_2m),
    },
    {
      key: 'uv_protection',
      icon: '🕶️',
      level: getUVProtectionLevel(d.uv_index),
    },
    {
      key: 'exercise',
      icon: '🏃',
      level: getExerciseLevel(d.apparent_temperature, WeatherStore.aqiData?.current?.us_aqi),
    },
    {
      key: 'car_wash',
      icon: '🚗',
      level: getCarWashLevel(daily?.precipitation_probability_max[0]),
    },
    {
      key: 'allergy',
      icon: '🤧',
      level: getAllergyLevel(WeatherStore.aqiData?.current?.pm2_5, d.wind_speed_10m),
    },
    {
      key: 'comfort',
      icon: '😊',
      level: getComfortLevel(d.apparent_temperature, d.relative_humidity_2m),
    },
  ];

  const grid = document.getElementById('lifeIndexGrid');
  grid.innerHTML = indices.map(idx => `
    <div class="wq-life-card wq-life-card--${idx.level.class}">
      <span class="wq-life-card__icon">${idx.icon}</span>
      <span class="wq-life-card__name">${i18n('life.' + idx.key)}</span>
      <span class="wq-life-card__level">${idx.level.label}</span>
      <p class="wq-life-card__tip">${idx.level.tip}</p>
    </div>
  `).join('');
  
  document.getElementById('lifeIndexPanel').classList.remove('hidden');
}
```

---

### `initWeatherMap(lat, lon)`
**职责**：初始化 Leaflet 地图，设置 OWM 图层和风速粒子层。

```javascript
function initWeatherMap(lat, lon) {
  if (WeatherStore.mapInstance) {
    WeatherStore.mapInstance.setView([lat, lon], 8);
    return;
  }

  const map = L.map('weatherMap', {
    center: [lat, lon], zoom: 8,
    zoomControl: true, attributionControl: false,
  });
  WeatherStore.mapInstance = map;

  // 底图：OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18, opacity: 0.6,
  }).addTo(map);

  // 当前城市标记
  L.circleMarker([lat, lon], { radius: 8, color: '#38bdf8', fillOpacity: 0.9 }).addTo(map);

  // 默认加载温度图层
  switchMapLayer('temperature');
}

function switchMapLayer(layerName) {
  WeatherStore.activeMapLayer = layerName;
  const map = WeatherStore.mapInstance;
  if (!map) return;
  
  // 移除旧图层
  if (WeatherStore.mapLayerTile) map.removeLayer(WeatherStore.mapLayerTile);
  if (WeatherStore.mapVelocityLayer && layerName !== 'wind') {
    map.removeLayer(WeatherStore.mapVelocityLayer);
    WeatherStore.mapVelocityLayer = null;
  }

  if (layerName === 'wind') {
    // 风速粒子：Leaflet-Velocity（使用 Open-Meteo 风场数据转换 GeoJSON wind）
    loadWindVelocityLayer(map);
  } else {
    // OWM Tile 图层（温度/降水/云量/气压）
    const OWM_LAYER_MAP = {
      temperature: 'temp_new',
      precipitation: 'precipitation_new',
      clouds: 'clouds_new',
      pressure: 'pressure_new',
    };
    const owmKey = OWM_LAYER_MAP[layerName];
    // 注意：OWM免费图层无需API Key对基础图层
    WeatherStore.mapLayerTile = L.tileLayer(
      `https://tile.openweathermap.org/map/${owmKey}/{z}/{x}/{y}.png?appid=DEMO_KEY`,
      { opacity: 0.7, maxZoom: 18 }
    ).addTo(map);
  }

  // 更新按钮激活状态
  document.querySelectorAll('.wq-map-layer').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.layer === layerName);
  });
  gaTrackLayerSwitch(layerName);
}
```

---

### `saveSnapshot()`
**职责**：用 html2canvas 截取天气卡片，生成可下载的精美图片。

```javascript
async function saveSnapshot() {
  const btn = document.getElementById('shareSnapshotBtn');
  btn.disabled = true;
  btn.textContent = i18n('share.generating');
  showToast(i18n('share.generating'), 'info');

  try {
    const target = document.getElementById('currentWeatherCard');
    const canvas = await html2canvas(target, {
      backgroundColor: null,     // 透明背景
      scale: 2,                  // 2x 高清
      useCORS: true,
      logging: false,
      // 剔除广告元素
      ignoreElements: el => el.classList.contains('adsbygoogle'),
    });
    
    // 添加品牌水印
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '14px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('toolboxnova.com', canvas.width - 12, canvas.height - 10);

    // 触发下载
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `weather-${WeatherStore.city.name}-${dayjs().format('YYYY-MM-DD')}.png`;
    a.click();

    showToast(i18n('share.success'), 'success');
    gaTrackSnapshot();
  } catch (err) {
    showToast(i18n('share.error'), 'error');
    gaTrackWeatherError('snapshot_fail', err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<svg>...</svg> ${i18n('share.btn')}`;
  }
}
```

---

### 单位转换工具函数

```javascript
// 温度
function convertTemp(val) {
  if (WeatherStore.unitTemp === 'fahrenheit') return val * 9/5 + 32;
  return val;
}
// 风速
function convertWind(val) { // 输入 km/h
  switch (WeatherStore.unitWind) {
    case 'mph': return (val * 0.621371).toFixed(1);
    case 'ms':  return (val / 3.6).toFixed(1);
    default:    return val.toFixed(1);
  }
}
// 气压
function convertPressure(val) { // 输入 hPa
  return WeatherStore.unitPressure === 'inhg' ? (val * 0.02953).toFixed(2) : val.toFixed(0);
}
// 单位标签
function getUnitLabel(type) {
  const labels = {
    temp:     { celsius: '°C', fahrenheit: '°F' },
    wind:     { kmh: 'km/h', mph: 'mph', ms: 'm/s' },
    pressure: { hpa: 'hPa', inhg: 'inHg' },
  };
  return labels[type][WeatherStore['unit' + type.charAt(0).toUpperCase() + type.slice(1)]] ?? '';
}
```

---

### 其他工具函数

```javascript
// 天气码 → WMO 描述 + 背景主题
function getWeatherTheme(wmoCode) {
  if (wmoCode === 0) return 'clear';
  if (wmoCode <= 3) return 'cloudy';
  if (wmoCode >= 51 && wmoCode <= 67) return 'rainy';
  if (wmoCode >= 71 && wmoCode <= 77) return 'snowy';
  if (wmoCode >= 95) return 'storm';
  return 'cloudy';
}

// 更新动态背景
function updateWeatherBackground() {
  const theme = getWeatherTheme(WeatherStore.currentWeather.weather_code);
  const bg = document.getElementById('wqBackground');
  bg.className = `wq-bg wq-bg--${theme}`;
  WeatherStore.currentTheme = theme;
  // 触发粒子效果（雨/雪）
  if (theme === 'rainy') startRainParticles();
  else if (theme === 'snowy') startSnowParticles();
  else stopParticles();
}

// 太阳弧线位置计算
function updateSunArcPosition(sunriseISO, sunsetISO) {
  const now    = Date.now() / 1000;
  const rise   = dayjs(sunriseISO).unix();
  const set    = dayjs(sunsetISO).unix();
  const pct    = Math.max(0, Math.min(1, (now - rise) / (set - rise)));
  // 沿贝塞尔曲线 M20,90 Q160,-30 300,90 插值
  const t = pct;
  const cx = 2*(1-t)*t*160 + t*t*300 + (1-t)*(1-t)*20;
  const cy = 2*(1-t)*t*(-30) + t*t*90 + (1-t)*(1-t)*90;
  const dot = document.getElementById('sunDot');
  if (dot) { dot.setAttribute('cx', cx); dot.setAttribute('cy', cy); }
}

// Toast
function showToast(msg, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `wq-toast wq-toast--${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 3500);
}

// 搜索历史持久化
function saveRecentCity() {
  const city = { name: WeatherStore.city.name, lat: WeatherStore.city.lat, lon: WeatherStore.city.lon, country: WeatherStore.city.country };
  let recents = WeatherStore.recentCities.filter(c => c.name !== city.name);
  recents.unshift(city);
  WeatherStore.recentCities = recents.slice(0, 5);
  localStorage.setItem('wq_recent_cities', JSON.stringify(WeatherStore.recentCities));
  renderRecentChips();
}

// 带超时的 fetch
function fetchWithTimeout(url, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

// 更新页面 URL（不刷新）
function updatePageURL() {
  const url = new URL(location.href);
  url.searchParams.set('lat', WeatherStore.city.lat.toFixed(4));
  url.searchParams.set('lon', WeatherStore.city.lon.toFixed(4));
  url.searchParams.delete('city');
  history.replaceState(null, '', url.toString());
}
```

---

## 3. UI 事件绑定说明

### 拖拽事件（无需，搜索工具不涉及文件拖拽）

此工具为搜索查询型工具，无文件处理。但需注意：

**触摸事件（地图交互）**
- Leaflet 内置移动端 touch 支持，无需额外绑定
- 风速粒子动画层需要监听 `touchstart/touchmove` 以避免手势冲突

**搜索框键盘导航**
```javascript
function onSearchKeydown(e) {
  const list = document.getElementById('searchDropdown');
  const items = list.querySelectorAll('.wq-search__item');
  let focused = list.querySelector('.focused');
  
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    const next = focused ? focused.nextElementSibling : items[0];
    if (next) { focused?.classList.remove('focused'); next.classList.add('focused'); next.focus(); }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    const prev = focused?.previousElementSibling;
    if (prev) { focused.classList.remove('focused'); prev.classList.add('focused'); prev.focus(); }
    else { focused?.classList.remove('focused'); document.getElementById('citySearchInput').focus(); }
  } else if (e.key === 'Enter') {
    if (focused) { focused.click(); }
    else { searchByName(document.getElementById('citySearchInput').value); }
  } else if (e.key === 'Escape') {
    hideDropdown();
  }
}
```

**单位切换 — 即时换算（不重新请求 API）**
```javascript
function setUnit(type, value) {
  WeatherStore['unit' + type.charAt(0).toUpperCase() + type.slice(1)] = value;
  localStorage.setItem('wq_unit_' + type, value);
  
  // 更新按钮状态
  document.querySelectorAll(`[data-unit-${type}]`).forEach(btn => {
    btn.classList.toggle('active', btn.dataset[`unit${type.charAt(0).toUpperCase()+type.slice(1)}`] === value);
  });

  // 重新渲染（不重新请求，数据已在 Store）
  if (WeatherStore.currentWeather) renderCurrentWeather();
  if (WeatherStore.hourlyForecast) renderForecastChart(WeatherStore.activeForecastTab);
  
  gaTrackUnitChange(type, value);
}
```

**FAQ 折叠动画（CSS `<details>` + JS 高度动画增强）**
```javascript
document.querySelectorAll('.wq-faq__item').forEach(details => {
  details.addEventListener('toggle', () => {
    if (details.open) {
      const content = details.querySelector('.wq-faq__a');
      content.style.maxHeight = content.scrollHeight + 'px';
    }
  });
});
```

---

## 4. 验收标准 Checklist

### 数据正确性
- [ ] 温度数据切换 °C/°F 时所有温度值正确换算（包括图表、指标、高低温）
- [ ] 风速切换 km/h/mph/m/s 数值正确，精度保留1位小数
- [ ] 气压切换 hPa/inHg 数值正确
- [ ] AQI 分级色彩与国际标准（US AQI）一致
- [ ] 14天预报 ECharts 折线图X轴日期显示正确（本地时区）
- [ ] 太阳弧线太阳位置在日间时间段内正确插值
- [ ] 月相图标与数值（0-1）对应正确（0/1=新月，0.5=满月）

### API & 并发
- [ ] `loadWeatherByCoords` 中天气API和AQI API并发请求，非串行
- [ ] AQI API 失败时不影响天气主卡片渲染（降级处理）
- [ ] 历史数据 API 仅在切换到「历史」Tab 时才发起请求（懒加载）
- [ ] 多次快速切换城市不会产生竞态条件（前一个请求未完成时取消）
- [ ] `fetchWithTimeout` 8秒超时后显示 `error.api_timeout` Toast

### 内存 & 性能
- [ ] 切换城市时旧的 ECharts/Leaflet 实例复用（不重复创建）
- [ ] 地图仅在进入视口后初始化（IntersectionObserver）
- [ ] 搜索 debounce 300ms，不会每次输入都请求
- [ ] 单位切换不重新调用 API，只重新渲染

### 边界情况
- [ ] 城市名包含特殊字符（圣保罗 São Paulo）时搜索正常
- [ ] 南极洲/北极极端纬度（±90°）输入不崩溃
- [ ] 网络离线时显示 `error.api_error` 而非白屏
- [ ] IP定位失败时静默降级到默认城市（Beijing）
- [ ] URL 参数 `lat/lon` 非数字时忽略参数不崩溃

### 快照功能
- [ ] html2canvas 截图包含天气图标、温度、城市名
- [ ] 截图不包含广告元素（`ignoreElements` 过滤）
- [ ] 下载文件名格式为 `weather-{城市名}-{日期}.png`
- [ ] 移动端 Safari 快照保存兼容
