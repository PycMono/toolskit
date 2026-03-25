<!-- weather-query-I-04_结果面板UI.md -->

# Weather Query · 天气查询工具 — 结果面板 UI

---

## 1. 竞品结果区 UI 对标表

| UI 区域 | OpenWeatherMap | Windy.com | AccuWeather | Meteoblue | **本次实现** |
|---------|:--------------:|:---------:|:-----------:|:---------:|:------------:|
| 当前温度字号 | 中等 (2rem) | 地图标注 | 大 (3.5rem) | 中等 | 超大 clamp(4rem,10vw,7rem) |
| 天气图标风格 | 静态 PNG | 无独立 | 动画 Lottie | SVG | SVG 动画（CSS 关键帧） |
| 指标数量/布局 | 8项单列 | 侧边浮层 | 10项双列 | 8项表格 | **12项 4×3 Grid** |
| 日出日落 | 文字时间 | 无 | 图标+时间 | 有 | **SVG 弧线动画** |
| 月相显示 | ❌ | ❌ | ✅ 简单 | ✅ | ✅ Emoji+百分比+名称 |
| 预报图表类型 | 表格+折线 | 地图时间轴 | 折线 | 折线+柱状 | **ECharts 折线+降水柱状 双Y轴** |
| 逐日卡片 | 列表行 | ❌ | 卡片格 | 列表行 | **横向滚动卡片 + 温度色温条** |
| AQI 展示 | 数字+颜色 | 图层叠加 | 卡片数字 | ❌ | **环形仪表盘 + 6污染物进度条** |
| 地图集成 | 独立页面 | 主界面 | ❌ | ❌ | **页面内嵌 Leaflet + 5图层** |
| 生活指数 | ❌ | ❌ | 单独列表 | ❌ | **6项图标卡片网格** |
| 天气预警 | 侧边栏 | 顶部覆盖 | 红色条 | ❌ | **顶部 amber banner + 可关闭** |
| 分享/保存 | ❌ | ❌ | ❌ | ❌ | **html2canvas 快照 + 水印** |
| 骨架屏 | ❌ | 加载圈 | 骨架屏 | ❌ | **三段骨架屏 + shimmer 动画** |

---

## 2. 各面板渲染规则

### ❶ 骨架屏（加载状态）

```javascript
function showSkeleton() {
  document.getElementById('loadingSkeleton').classList.remove('hidden');
  document.getElementById('currentWeatherCard').classList.add('hidden');
  document.getElementById('forecastPanel').classList.add('hidden');
  document.getElementById('aqiPanel').classList.add('hidden');
}
function hideSkeleton() {
  document.getElementById('loadingSkeleton').classList.add('hidden');
}
```

**骨架屏 DOM 表现**
```html
<div class="wq-skeleton">
  <!-- 主卡片骨架 -->
  <div class="wq-skeleton__card wq-skeleton--shimmer">
    <div class="wq-sk-row wq-sk-row--title"></div>
    <div class="wq-sk-big-temp"></div>
    <div class="wq-sk-grid">
      <div class="wq-sk-cell" style="--i:0"></div>
      <div class="wq-sk-cell" style="--i:1"></div>
      <!-- 12 格 -->
    </div>
  </div>
  <!-- 图表骨架 -->
  <div class="wq-skeleton__card wq-skeleton__card--chart wq-skeleton--shimmer"></div>
  <!-- AQI 骨架 -->
  <div class="wq-skeleton__card wq-skeleton__card--sm wq-skeleton--shimmer"></div>
</div>
```

**Shimmer CSS 动画**
```css
@keyframes shimmer {
  from { background-position: -200% 0; }
  to   { background-position:  200% 0; }
}
.wq-skeleton--shimmer {
  background: linear-gradient(90deg,
    rgba(255,255,255,0.03) 25%,
    rgba(255,255,255,0.08) 50%,
    rgba(255,255,255,0.03) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
}
```

---

### ❷ 当前天气卡片 — 状态与动效

**卡片入场动画**
```css
.wq-current {
  animation: cardSlideIn 0.4s cubic-bezier(0.22,1,0.36,1) forwards;
}
@keyframes cardSlideIn {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* 数据更新时温度数字弹跳 */
.wq-current__temp.updated {
  animation: numBounce 0.4s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes numBounce {
  from { transform: scale(0.9); }
  to   { transform: scale(1); }
}
```

**天气图标 SVG 动画（按 WMO 天气码分类）**

| 天气状态 | WMO 码 | SVG 动画效果 |
|---------|--------|------------|
| 晴天 | 0 | 太阳旋转光芒（CSS rotate 无限） |
| 少云 | 1-2 | 云朵左右漂移（translateX sin） |
| 阴天 | 3 | 静态厚云 |
| 薄雾 | 45,48 | 横线透明度呼吸 |
| 毛毛雨 | 51-57 | 小雨滴下落（CSS keyframes） |
| 中雨 | 61-67 | 中雨滴下落（多根线错位） |
| 大雪 | 71-77 | 雪花旋转下落 |
| 雷暴 | 95-99 | 闪电闪烁 + 雨滴 |

```javascript
// WMO → SVG 映射关键逻辑（返回 SVG 字符串）
function getWeatherIconSVG(code) {
  const theme = getWeatherTheme(code);
  // 根据 theme 返回对应 SVG，此处省略完整 SVG 代码
  // 实际实现中预定义 5 套 SVG 模板，用 CSS 动画激活
  return SVG_ICONS[theme] || SVG_ICONS['cloudy'];
}
```

---

### ❸ 逐日预报卡片列表（daily14 Tab）

```javascript
function renderDailyList() {
  const daily = WeatherStore.dailyForecast;
  const list = document.getElementById('dailyForecastList');
  
  // 温度色温条：计算14天内全局最高/最低用于归一化
  const globalMax = Math.max(...daily.temperature_2m_max);
  const globalMin = Math.min(...daily.temperature_2m_min);
  const globalRange = globalMax - globalMin || 1;

  list.innerHTML = daily.time.map((dateStr, i) => {
    const high = Math.round(convertTemp(daily.temperature_2m_max[i]));
    const low  = Math.round(convertTemp(daily.temperature_2m_min[i]));
    const rain = daily.precipitation_probability_max[i];
    const wmoCode = daily.weather_code[i];
    
    // 色温条：相对14天数据做归一化
    const barLeft  = ((daily.temperature_2m_min[i] - globalMin) / globalRange * 100).toFixed(1);
    const barWidth = ((daily.temperature_2m_max[i] - daily.temperature_2m_min[i]) / globalRange * 100).toFixed(1);
    const barColor = getTempColor((daily.temperature_2m_max[i] + daily.temperature_2m_min[i]) / 2);

    return `
      <div class="wq-day-card" style="--anim-delay:${i * 40}ms">
        <span class="day-name">${i === 0 ? '今天' : dayjs(dateStr).locale(getLang()).format('ddd')}</span>
        <div class="day-icon">${getWeatherIconSVG(wmoCode)}</div>
        <span class="day-desc">${getWeatherDesc(wmoCode)}</span>
        <div class="day-temp-row">
          <span class="day-low">${low}°</span>
          <div class="day-temp-track">
            <div class="day-temp-fill"
              style="left:${barLeft}%;width:${barWidth}%;background:${barColor}">
            </div>
          </div>
          <span class="day-high">${high}°</span>
        </div>
        ${rain > 0 ? `<span class="day-rain">💧 ${rain}%</span>` : ''}
      </div>
    `;
  }).join('');

  list.classList.remove('hidden');
}
```

**逐日卡片布局与动效**
```css
.wq-daily-list {
  display: grid;
  grid-template-columns: repeat(7, 1fr);  /* 桌面7列 */
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}
@media (max-width: 768px) {
  .wq-daily-list {
    grid-template-columns: repeat(4, minmax(80px, 1fr));
  }
}
.wq-day-card {
  background: var(--wq-card-bg);
  border: 1px solid var(--wq-card-border);
  border-radius: 12px;
  padding: 0.75rem 0.5rem;
  text-align: center;
  /* 交错入场 */
  animation: cardSlideIn 0.4s ease var(--anim-delay, 0ms) both;
}
.wq-day-card:hover {
  background: var(--wq-card-bg-hover);
  transform: translateY(-2px);
  transition: transform 0.2s ease, background 0.2s ease;
}
/* 温度色温轨道 */
.wq-day-temp-track {
  position: relative; height: 4px; background: rgba(255,255,255,0.1);
  border-radius: 2px; margin: 4px 0;
}
.wq-day-temp-fill {
  position: absolute; height: 100%; border-radius: 2px;
  /* JS 注入 left/width/background */
}
```

---

### ❹ AQI 环形仪表盘 — 详细规格

**仪表盘 ECharts 配置完整规则**

```javascript
function getAQIGradient() {
  // ECharts gauge axisLine color 渐变段
  return [
    [50/300,  '#22c55e'],  // 0-50   优
    [100/300, '#84cc16'],  // 51-100 良
    [150/300, '#eab308'],  // 101-150 轻度
    [200/300, '#f97316'],  // 151-200 中度
    [250/300, '#ef4444'],  // 201-250 重度
    [1,       '#a855f7'],  // 251-300 严重
  ];
}
```

**健康建议气泡颜色**
```css
.wq-aqi__advice {
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border-left: 4px solid var(--aqi-color, #22c55e);
  background: rgba(34, 197, 94, 0.08); /* JS 动态替换颜色 */
}
```

**6项污染物进度条颜色规则**
```javascript
function getPollutantColor(pct) {
  if (pct < 33)  return 'var(--aqi-good)';
  if (pct < 66)  return 'var(--aqi-moderate)';
  return 'var(--aqi-poor)';
}
```

---

### ❺ 生活指数计算规则

| 指数 | 算法 | 等级划分 |
|------|------|---------|
| 穿衣 | 基于体感温度 | ≤0°C极寒/1-10羽绒/11-16大衣/17-22秋装/23-28薄衫/≥29短袖 |
| UV防护 | UV指数 | 0-2低/3-5中/6-7高/8-10很高/11+极端 |
| 运动 | 体感温度 + AQI | 20-25°C且AQI<100=优 |
| 洗车 | 今日降水概率 | <20%=适宜/20-60%=较适宜/≥60%=不适宜 |
| 过敏 | PM2.5 + 风速 | PM2.5>75或风速>30km/h=高风险 |
| 舒适度 | 体感温度 + 湿度 | 温度20-26且湿度40-65=舒适 |

```javascript
function getDressingLevel(temp, wind, humidity) {
  const at = temp - (wind / 10);   // 近似体感
  const levels = [
    { max: 0,  class: 'extreme-cold', label: '极寒', tip: '建议厚羽绒服+手套+帽子' },
    { max: 10, class: 'cold',         label: '寒冷', tip: '羽绒服或厚棉衣' },
    { max: 16, class: 'cool',         label: '凉爽', tip: '大衣或厚外套' },
    { max: 22, class: 'mild',         label: '舒适', tip: '轻薄外套或秋装' },
    { max: 28, class: 'warm',         label: '温暖', tip: '薄衫或T恤' },
    { max: Infinity, class: 'hot',   label: '炎热', tip: '短袖短裤，注意防晒' },
  ];
  return levels.find(l => at <= l.max);
}
```

---

### ❻ 天气预警 Banner

```javascript
function showAlertBanner(alert) {
  const banner = document.getElementById('weatherAlertBanner');
  document.getElementById('alertTitle').textContent = alert.event || '天气预警';
  document.getElementById('alertDesc').textContent  = alert.description?.slice(0, 200) + '…' || '';
  
  // 按严重程度设置颜色
  const severityClass = {
    'minor':    'alert--yellow',
    'moderate': 'alert--orange',
    'severe':   'alert--red',
    'extreme':  'alert--purple',
  }[alert.severity] || 'alert--yellow';
  
  banner.className = `wq-alert ${severityClass}`;
  banner.classList.remove('hidden');
}
```

**预警 Banner CSS**
```css
.wq-alert {
  display: flex; align-items: flex-start; gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-radius: 10px;
  margin-bottom: 1rem;
  animation: slideDown 0.3s ease;
}
.wq-alert--yellow { background: rgba(234,179,8,0.15); border-left: 4px solid #eab308; }
.wq-alert--orange { background: rgba(249,115,22,0.15); border-left: 4px solid #f97316; }
.wq-alert--red    { background: rgba(239,68,68,0.15);  border-left: 4px solid #ef4444; }
.wq-alert--purple { background: rgba(168,85,247,0.15); border-left: 4px solid #a855f7; }
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

---

### ❼ 天气地图面板 — 图层样式

**图层按钮激活样式**
```css
.wq-map-layer {
  padding: 0.375rem 0.875rem;
  border-radius: 20px;
  background: rgba(255,255,255,0.08);
  color: var(--wq-text-secondary);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}
.wq-map-layer.active,
.wq-map-layer:hover {
  background: var(--wq-primary);
  color: #fff;
  border-color: var(--wq-primary-light);
  box-shadow: 0 0 12px var(--wq-primary-glow);
}
```

**Leaflet 地图样式覆盖**
```css
#weatherMap {
  border-radius: 12px;
  overflow: hidden;
  z-index: 0;
}
/* 修复 Leaflet 控件样式 */
.leaflet-control-zoom a {
  background: rgba(15,23,42,0.8) !important;
  color: #f1f5f9 !important;
  border: 1px solid rgba(255,255,255,0.15) !important;
}
```

---

## 3. CSS 规范

### 完整 CSS 变量补充

```css
/* 逐日卡片温度色谱（蓝→绿→黄→红） */
.day-temp-fill { background: var(--temp-color, #38bdf8); }

/* 生活指数等级色 */
--life-excellent: #22c55e;
--life-good:      #84cc16;
--life-fair:      #eab308;
--life-poor:      #f97316;
--life-bad:       #ef4444;

/* Toast */
--toast-bg-info:    rgba(14,165,233,0.95);
--toast-bg-success: rgba(34,197,94,0.95);
--toast-bg-warn:    rgba(234,179,8,0.95);
--toast-bg-error:   rgba(239,68,68,0.95);
```

### 结果面板关键样式

```css
/* 生活指数卡片 */
.wq-life__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}
@media (max-width: 640px) {
  .wq-life__grid { grid-template-columns: repeat(2, 1fr); }
}
.wq-life-card {
  text-align: center;
  padding: 1rem 0.5rem;
  border-radius: 12px;
  background: var(--wq-card-bg);
  border: 1px solid var(--wq-card-border);
}
.wq-life-card__icon { font-size: 2rem; display: block; margin-bottom: 0.25rem; }
.wq-life-card__name { font-size: 0.75rem; color: var(--wq-text-secondary); }
.wq-life-card__level {
  font-size: 0.875rem; font-weight: 600;
  color: var(--life-excellent); /* JS 动态替换 CSS var */
}
.wq-life-card__tip { font-size: 0.7rem; color: var(--wq-text-muted); margin-top: 0.25rem; }

/* Toast 容器 */
.wq-toast-container {
  position: fixed; bottom: 24px; right: 24px;
  z-index: 9999; display: flex; flex-direction: column; gap: 8px;
  pointer-events: none;
}
.wq-toast {
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  font-size: 0.875rem;
  color: #fff;
  opacity: 0;
  transform: translateX(20px);
  transition: opacity 0.3s ease, transform 0.3s ease;
  pointer-events: auto;
  max-width: 320px;
}
.wq-toast.show { opacity: 1; transform: translateX(0); }
.wq-toast--info    { background: var(--toast-bg-info); }
.wq-toast--success { background: var(--toast-bg-success); }
.wq-toast--warn    { background: var(--toast-bg-warn); }
.wq-toast--error   { background: var(--toast-bg-error); }

/* 搜索下拉列表 */
.wq-search__dropdown {
  position: absolute; top: calc(100% + 8px); left: 0; right: 0;
  background: rgba(15,23,42,0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 16px;
  overflow: hidden;
  z-index: 1000;
  list-style: none;
  max-height: 320px;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}
.wq-search__item {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  cursor: pointer;
  transition: background 0.15s;
}
.wq-search__item:hover,
.wq-search__item.focused {
  background: rgba(255,255,255,0.08);
}
.city-flag { font-size: 1.25rem; }
.city-name { font-weight: 500; color: var(--wq-text-primary); }
.city-country { font-size: 0.8rem; color: var(--wq-text-muted); margin-left: auto; }

/* 快照按钮 */
.wq-share-btn {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 20px;
  background: var(--wq-primary);
  color: #fff;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  margin-top: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}
.wq-share-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px var(--wq-primary-glow);
}
.wq-share-btn:disabled { opacity: 0.6; cursor: not-allowed; }

/* 定位按钮脉冲 */
.wq-search__locate {
  background: none; border: none; cursor: pointer;
  color: var(--wq-text-secondary);
  padding: 0 0.75rem;
  transition: color 0.2s;
}
.wq-search__locate:hover { color: var(--wq-primary-light); }
.wq-search__locate.loading {
  animation: locatePulse 1s ease infinite;
}
@keyframes locatePulse {
  0%, 100% { color: var(--wq-text-secondary); }
  50%       { color: var(--wq-primary-light); }
}
```

---

## 4. 移动端适配规则

```css
@media (max-width: 640px) {
  /* 逐日预报横向滚动 */
  .wq-daily-list {
    grid-template-columns: repeat(14, minmax(72px, 1fr));
    overflow-x: auto;
    padding-bottom: 0.75rem;
    scrollbar-width: none;
  }
  .wq-daily-list::-webkit-scrollbar { display: none; }

  /* AQI 面板垂直堆叠 */
  .wq-aqi__main {
    flex-direction: column;
    align-items: center;
  }

  /* 生活指数 2 列 */
  .wq-life__grid { grid-template-columns: repeat(2, 1fr); }

  /* Toast 位置 */
  .wq-toast-container {
    bottom: 16px; right: 16px; left: 16px;
  }
  .wq-toast { max-width: none; }

  /* 地图高度 */
  #weatherMap { height: 250px !important; }

  /* 图层按钮横向滚动 */
  .wq-map__layers {
    overflow-x: auto; white-space: nowrap;
    padding-bottom: 0.5rem;
    scrollbar-width: none;
  }

  /* 单位切换换行 */
  .wq-units {
    flex-wrap: wrap; gap: 0.25rem;
  }
}
```

---

## 5. 完整数据流 & 函数调用图

```
用户操作
  │
  ├── 输入城市名 → onSearchInput() → [debounce 300ms] → fetchGeocodingResults()
  │                                                          │
  │                                              renderDropdown(results)
  │                                                          │
  │                                          用户点击城市 → searchByCity(lat,lon)
  │
  ├── 点击定位 → locateUser() → [GPS成功] → loadWeatherByCoords(lat,lon)
  │                           ↘ [GPS失败] → locateByIP() → loadWeatherByCoords(lat,lon)
  │
  └── URL参数/历史记录 → initEngine() → loadWeatherByCoords(lat,lon)
                                              │
                              ┌───────────────┴────────────────┐
                              ▼                                 ▼
                 fetchCurrentAndForecast()          fetchAQIData()  [并发]
                              │                                 │
                     ┌────────▼──────────┐           WeatherStore.aqiData
                     │ WeatherStore 更新  │
                     │ .currentWeather   │
                     │ .hourlyForecast   │
                     │ .dailyForecast    │
                     └────────┬──────────┘
                              │
            ┌─────────────────┼──────────────────────────────┐
            ▼                 ▼                              ▼
  renderCurrentWeather()  renderForecastPanel()      renderAQIPanel()
            │                 │                              │
     ┌──────┴──────┐    ┌─────┴──────┐             ┌────────┴────────┐
     │ DOM 更新    │    │ ECharts 渲染│             │ ECharts Gauge   │
     │ 温度/指标   │    │ 折线+柱状  │             │ + 污染物进度条  │
     │ 日出/月相   │    │ (hourly24) │             └─────────────────┘
     └─────────────┘    └────────────┘
            │
  updateWeatherBackground()   ← 切换背景主题+粒子
  updatePageURL()             ← history.replaceState
  saveRecentCity()            ← localStorage
  observeMapPanel()           ← IntersectionObserver

  ━━━ 懒触发 ━━━
  Tab切换 → switchForecastTab('daily14')
              │
              ├── renderDailyList()  ← DOM 卡片
              └── renderForecastChart('daily14')  ← ECharts 重绘

  Tab切换 → switchForecastTab('history')
              │
              └── fetchHistoryData() [首次才请求]
                      │
                  renderHistoryChart()

  图层切换 → switchMapLayer('wind')
              │
              ├── map.removeLayer(旧图层)
              └── loadWindVelocityLayer()  ← Leaflet-Velocity

  用户点击快照 → saveSnapshot()
              │
              └── html2canvas(currentWeatherCard)
                      │
                  canvas → dataURL → <a> download
```

---

## 6. 验收标准 Checklist

### 当前天气卡片
- [ ] 天气图标按 WMO 天气码正确映射（晴/阴/雨/雪/雷暴各有不同图标）
- [ ] 大温度数字更新时有弹跳动画 `numBounce`
- [ ] 太阳弧线上的太阳图标在日间时段实时标注当前位置
- [ ] 12项指标全部正确填充（无 `--` 残留）
- [ ] 月相 Emoji 与数值（0-1）对应正确
- [ ] 体感温度标注，偏差 ≥3°C 时加醒目颜色

### 骨架屏
- [ ] 加载时骨架屏 shimmer 动画正常
- [ ] 数据加载完成后骨架屏消失、卡片以入场动画显示
- [ ] 网络慢（3G模拟）环境下骨架屏显示 ≥ 500ms

### 逐日预报卡片
- [ ] 14个日卡片依次以 40ms stagger 入场动画显示
- [ ] 温度色温条左边界和宽度基于14天全局最高/最低归一化计算正确
- [ ] 降水概率 0 时不显示雨滴标签
- [ ] 移动端横向滚动流畅，隐藏滚动条

### AQI 仪表盘
- [ ] 环形仪表盘颜色段位与 AQI 数值区间精确对应
- [ ] 健康建议文字内容与等级匹配
- [ ] 6项污染物进度条宽度比例正确（各自有独立最大值基准）
- [ ] AQI API 失败时整个 AQI 面板隐藏，无 JS 错误

### 地图
- [ ] 地图使用 IntersectionObserver 懒初始化（滚动到视口才渲染）
- [ ] 5个图层切换正常，按钮高亮状态同步
- [ ] 风速粒子图层加载完成前显示 loading 遮罩
- [ ] 地图在移动端可触摸缩放、平移

### 生活指数
- [ ] 6项指数算法符合规范（参见算法表）
- [ ] 等级颜色正确（优绿/良浅绿/一般黄/差橙/极差红）
- [ ] 悬停时卡片轻微上浮

### Toast
- [ ] 成功/警告/错误三种类型颜色正确
- [ ] Toast 3.5秒后自动消失，带 fade+slide 动画
- [ ] 多个 Toast 垂直堆叠不重叠

### 天气快照
- [ ] html2canvas 截图包含城市名、温度、天气图标、日期
- [ ] 截图不包含广告元素
- [ ] 下载文件名格式：`weather-{城市名}-{YYYY-MM-DD}.png`
- [ ] 截图 scale=2 高清（200%分辨率）
- [ ] 图片右下角有 `toolboxnova.com` 水印
- [ ] 移动端 Safari 截图下载正常（使用 `<a>` download 方式）

### 天气预警
- [ ] 有预警时顶部显示 amber/red Banner
- [ ] 无预警时 Banner 隐藏，无布局偏移
- [ ] 点击关闭按钮后 Banner 消失

### 搜索下拉
- [ ] 城市名旁显示国旗 Emoji
- [ ] 键盘上下导航不会 scroll 整页
- [ ] 点击列表外部关闭下拉
- [ ] 最近5城市 chips 点击直接加载天气
