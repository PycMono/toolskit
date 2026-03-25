<!-- weather-query-I-02_首页Landing_搜索区.md -->

# Weather Query · 天气查询工具 — 首页 Landing & 搜索区

---

## 1. 竞品 UI 对标表

| UI 区域 | OpenWeatherMap | Windy.com | AccuWeather | **本次实现** | **差异点** |
|---------|:--------------:|:---------:|:-----------:|:------------:|-----------|
| 搜索框样式 | 普通输入框，顶部导航 | 无独立搜索，地图点击 | 中等搜索框，首屏 | 超大居中搜索框，毛玻璃 | 更突出，移动友好 |
| 城市补全 | ✅ 实时下拉 | ❌ | ✅ | ✅ debounce 300ms | 补全显示国家旗帜 |
| 当前天气展示 | 文字+图标 | 地图主导 | 卡片式 | 大字号温度+动画天气图标 | 体感温度偏差说明 |
| 背景动态效果 | 静态 | 动态地图 | 静态图片 | ✅ 按天气状态切换渐变+粒子 | 晴/阴/雨/雪4套主题 |
| 数据指标数量 | 8个 | 基础 | 10个 | 12个 mini 卡片 | 新增露点/月相/降水 |
| 预报图表 | 折线表格 | 地图时间轴 | 折线图 | ECharts 交互折线+柱状 | 双模型对比线 |
| 空气质量面板 | 付费/分开页面 | 简单颜色 | 卡片形式 | 环形仪表盘+6项污染物 | 健康建议气泡 |
| 地图集成 | 独立地图页 | 地图即主页 | 无 | Leaflet 嵌入+5图层切换 | 无需跳转 |
| 生活指数 | ❌ | ❌ | ✅ 单独展示 | ✅ 6项图标卡片 | 全汇聚一页 |
| 分享功能 | ❌ | ❌ | ❌ | ✅ html2canvas快照 | 行业独有功能 |
| 单位切换位置 | 设置页 | 全局设置 | 顶部 | 天气面板内嵌切换按钮 | 即改即生效 |
| 移动端适配 | 一般 | 较差 | 良好 | ✅ 专项优化 | 卡片堆叠布局 |

---

## 2. 完整 HTML 模板结构

```html
{{/* templates/weather/query.html */}}
{{ define "content" }}

<!-- ████████ 主容器 ████████ -->
<div class="wq-page" id="weatherQueryPage" data-lang="{{ .Lang }}">

  <!-- ① 动态背景层（JS 动态切换 class） -->
  <div class="wq-bg wq-bg--clear" id="wqBackground">
    <div class="wq-bg__particles" id="wqParticles"></div>
    <div class="wq-bg__gradient"></div>
  </div>

  <!-- ② 顶部广告位 -->
  {{- template "partials/ad_slot.html" dict
    "SlotID" "weather-query-top"
    "Size" "728x90" "Mobile" "320x50"
    "ClientID" .AdsClientID "Enabled" .AdsEnabled }}

  <!-- ③ HERO 区 — 搜索核心 -->
  <section class="wq-hero" aria-label="Weather Search">
    <div class="wq-hero__inner">
      <!-- 标题 -->
      <h1 class="wq-hero__title" data-i18n="hero.title">全球实时天气查询</h1>
      <p class="wq-hero__subtitle" data-i18n="hero.subtitle">
        立即获取全球任意城市的温度、预报、空气质量与气象地图
      </p>

      <!-- Badge 组 -->
      <div class="wq-hero__badges" role="list">
        <span class="wq-badge" data-i18n="hero.badge_free">永久免费</span>
        <span class="wq-badge" data-i18n="hero.badge_no_key">无需API Key</span>
        <span class="wq-badge" data-i18n="hero.badge_realtime">实时数据</span>
        <span class="wq-badge" data-i18n="hero.badge_global">全球覆盖</span>
      </div>

      <!-- ◉ 超大搜索框 -->
      <div class="wq-search" role="search">
        <div class="wq-search__box" id="searchBox">
          <svg class="wq-search__icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="search"
            id="citySearchInput"
            class="wq-search__input"
            placeholder="{{ i18n .Lang "search.placeholder" }}"
            autocomplete="off"
            autocorrect="off"
            spellcheck="false"
            aria-label="{{ i18n .Lang "search.placeholder" }}"
            oninput="WeatherEngine.onSearchInput(this.value)"
            onkeydown="WeatherEngine.onSearchKeydown(event)"
          />
          <!-- 定位按钮 -->
          <button
            class="wq-search__locate"
            id="locateBtn"
            title="{{ i18n .Lang "search.btn_locate" }}"
            onclick="WeatherEngine.locateUser()"
            aria-label="{{ i18n .Lang "search.btn_locate" }}"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
          </button>
          <!-- 清除按钮 -->
          <button
            class="wq-search__clear hidden"
            id="searchClearBtn"
            onclick="WeatherEngine.clearSearch()"
            aria-label="Clear"
          >✕</button>
        </div>

        <!-- 下拉补全列表 -->
        <ul class="wq-search__dropdown hidden" id="searchDropdown" role="listbox">
          <!-- JS 动态渲染：template#cityItemTpl -->
        </ul>

        <!-- 最近搜索 -->
        <div class="wq-search__recent" id="recentSearches">
          <span class="wq-search__recent-label" data-i18n="search.recent">最近搜索</span>
          <div class="wq-search__recent-chips" id="recentChips">
            <!-- JS 动态渲染 -->
          </div>
        </div>
      </div><!-- /.wq-search -->

    </div><!-- /.wq-hero__inner -->
  </section><!-- /.wq-hero -->

  <!-- ④ 主内容区 — 两列 Grid -->
  <div class="wq-layout" id="weatherLayout">

    <!-- 左列：天气数据 -->
    <main class="wq-main" id="weatherMain">

      <!-- ❶ 当前天气主卡片 -->
      <section class="wq-card wq-current hidden" id="currentWeatherCard" aria-live="polite">
        <div class="wq-current__header">
          <div class="wq-current__location">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7zm0 9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
            </svg>
            <span id="cityName">--</span>
            <span id="countryCode" class="wq-current__country"></span>
            <span id="localTime" class="wq-current__time"></span>
          </div>
          <!-- 单位切换 -->
          <div class="wq-units" id="unitSwitcher">
            <button class="wq-units__btn active" data-unit-temp="celsius" onclick="WeatherEngine.setUnit('temp','celsius')">°C</button>
            <button class="wq-units__btn" data-unit-temp="fahrenheit" onclick="WeatherEngine.setUnit('temp','fahrenheit')">°F</button>
            <span class="wq-units__sep">|</span>
            <button class="wq-units__btn active" data-unit-wind="kmh" onclick="WeatherEngine.setUnit('wind','kmh')">km/h</button>
            <button class="wq-units__btn" data-unit-wind="mph" onclick="WeatherEngine.setUnit('wind','mph')">mph</button>
            <button class="wq-units__btn" data-unit-wind="ms" onclick="WeatherEngine.setUnit('wind','ms')">m/s</button>
          </div>
        </div>

        <!-- 温度大字区 -->
        <div class="wq-current__main">
          <div class="wq-current__temp-wrap">
            <div class="wq-current__weather-icon" id="currentWeatherIcon">
              <!-- JS 注入 SVG 动画天气图标 -->
            </div>
            <div class="wq-current__temp-group">
              <span class="wq-current__temp" id="currentTemp">--</span>
              <span class="wq-current__temp-unit">°C</span>
              <div class="wq-current__feels">
                <span data-i18n="current.feels_like">体感温度</span>
                <strong id="feelsLike">--</strong>
              </div>
            </div>
          </div>
          <div class="wq-current__desc-group">
            <p class="wq-current__desc" id="weatherDesc">--</p>
            <p class="wq-current__high-low">
              <span id="tempHigh" class="high">↑ --</span>
              <span id="tempLow" class="low">↓ --</span>
            </p>
          </div>
        </div>

        <!-- 日出日落弧线 SVG -->
        <div class="wq-sun-arc" id="sunArcWrap">
          <svg class="wq-sun-arc__svg" viewBox="0 0 320 100" aria-hidden="true">
            <path class="wq-sun-arc__track" d="M 20 90 Q 160 -30 300 90" fill="none"/>
            <path class="wq-sun-arc__progress" id="sunArcProgress" d="M 20 90 Q 160 -30 300 90" fill="none"/>
            <circle class="wq-sun-arc__sun" id="sunDot" cx="20" cy="90" r="8"/>
          </svg>
          <div class="wq-sun-arc__labels">
            <span id="sunriseTime">--:--</span>
            <span id="sunsetTime">--:--</span>
          </div>
        </div>

        <!-- 12 项数据 mini 卡片 -->
        <div class="wq-metrics" id="metricsGrid">
          <div class="wq-metric" id="m-humidity">
            <span class="wq-metric__icon">💧</span>
            <span class="wq-metric__label" data-i18n="current.humidity">湿度</span>
            <strong class="wq-metric__val" id="val-humidity">--%</strong>
          </div>
          <div class="wq-metric" id="m-wind">
            <span class="wq-metric__icon">🌬️</span>
            <span class="wq-metric__label" data-i18n="current.wind">风速</span>
            <strong class="wq-metric__val" id="val-wind">-- km/h</strong>
            <small class="wq-metric__sub" id="val-wind-dir"></small>
          </div>
          <div class="wq-metric" id="m-pressure">
            <span class="wq-metric__icon">🔽</span>
            <span class="wq-metric__label" data-i18n="current.pressure">气压</span>
            <strong class="wq-metric__val" id="val-pressure">-- hPa</strong>
          </div>
          <div class="wq-metric" id="m-visibility">
            <span class="wq-metric__icon">👁️</span>
            <span class="wq-metric__label" data-i18n="current.visibility">能见度</span>
            <strong class="wq-metric__val" id="val-visibility">-- km</strong>
          </div>
          <div class="wq-metric" id="m-uv">
            <span class="wq-metric__icon">☀️</span>
            <span class="wq-metric__label" data-i18n="current.uv_index">紫外线</span>
            <strong class="wq-metric__val" id="val-uv">--</strong>
            <small class="wq-metric__sub" id="val-uv-level"></small>
          </div>
          <div class="wq-metric" id="m-clouds">
            <span class="wq-metric__icon">☁️</span>
            <span class="wq-metric__label" data-i18n="current.cloud_cover">云量</span>
            <strong class="wq-metric__val" id="val-clouds">--%</strong>
          </div>
          <div class="wq-metric" id="m-dew">
            <span class="wq-metric__icon">🌡️</span>
            <span class="wq-metric__label" data-i18n="current.dew_point">露点</span>
            <strong class="wq-metric__val" id="val-dew">--°C</strong>
          </div>
          <div class="wq-metric" id="m-precip">
            <span class="wq-metric__icon">🌧️</span>
            <span class="wq-metric__label" data-i18n="current.precipitation">降水量</span>
            <strong class="wq-metric__val" id="val-precip">-- mm</strong>
          </div>
          <div class="wq-metric" id="m-moonphase">
            <span class="wq-metric__icon" id="moonPhaseIcon">🌕</span>
            <span class="wq-metric__label" data-i18n="current.moon_phase">月相</span>
            <strong class="wq-metric__val" id="val-moonphase">--</strong>
          </div>
          <div class="wq-metric" id="m-moonrise">
            <span class="wq-metric__icon">🌙</span>
            <span class="wq-metric__label" data-i18n="current.moonrise">月出</span>
            <strong class="wq-metric__val" id="val-moonrise">--:--</strong>
          </div>
          <div class="wq-metric" id="m-moonset">
            <span class="wq-metric__icon">🌑</span>
            <span class="wq-metric__label" data-i18n="current.moonset">月落</span>
            <strong class="wq-metric__val" id="val-moonset">--:--</strong>
          </div>
          <div class="wq-metric" id="m-updated">
            <span class="wq-metric__icon">🔄</span>
            <span class="wq-metric__label" data-i18n="current.last_updated">更新</span>
            <strong class="wq-metric__val" id="val-updated">--</strong>
          </div>
        </div><!-- /.wq-metrics -->

        <!-- 快照按钮 -->
        <button class="wq-share-btn" id="shareSnapshotBtn" onclick="WeatherEngine.saveSnapshot()" data-i18n="share.btn">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
            <polyline points="16 6 12 2 8 6"/>
            <line x1="12" y1="2" x2="12" y2="15"/>
          </svg>
          保存天气快照
        </button>
      </section><!-- /.wq-current -->

      <!-- ❷ 天气预警 Banner（有预警时显示） -->
      <div class="wq-alert hidden" id="weatherAlertBanner" role="alert">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2L1 21h22L12 2zm0 3.5L21 19H3L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/></svg>
        <div class="wq-alert__content">
          <strong id="alertTitle"></strong>
          <p id="alertDesc"></p>
        </div>
        <button onclick="this.parentElement.classList.add('hidden')">✕</button>
      </div>

      <!-- ❸ 预报面板 -->
      <section class="wq-card wq-forecast hidden" id="forecastPanel">
        <!-- Tab 切换 -->
        <div class="wq-tabs" role="tablist">
          <button class="wq-tab active" role="tab" data-tab="hourly24"
            onclick="WeatherEngine.switchForecastTab('hourly24')"
            data-i18n="forecast.tab_hourly">24小时</button>
          <button class="wq-tab" role="tab" data-tab="daily14"
            onclick="WeatherEngine.switchForecastTab('daily14')"
            data-i18n="forecast.tab_daily">14天预报</button>
          <button class="wq-tab" role="tab" data-tab="history"
            onclick="WeatherEngine.switchForecastTab('history')"
            data-i18n="forecast.tab_history">近30天历史</button>
          <!-- 模型对比切换 -->
          <label class="wq-model-compare" for="modelCompareToggle">
            <input type="checkbox" id="modelCompareToggle"
              onchange="WeatherEngine.toggleModelCompare(this.checked)">
            <span data-i18n="forecast.model_compare">模型对比</span>
          </label>
        </div>

        <!-- 图表容器 -->
        <div class="wq-chart-wrap">
          <div id="forecastChart" class="wq-chart" style="height:300px"></div>
        </div>

        <!-- 14天每日卡片列表（daily14 tab专用） -->
        <div class="wq-daily-list hidden" id="dailyForecastList">
          <!-- JS 动态渲染 DayCard -->
        </div>
      </section>

      <!-- ❹ 空气质量面板 -->
      <section class="wq-card wq-aqi hidden" id="aqiPanel">
        <h2 class="wq-card__title" data-i18n="aqi.title">空气质量指数</h2>
        <div class="wq-aqi__main">
          <!-- 环形仪表盘 -->
          <div class="wq-aqi__gauge-wrap">
            <canvas id="aqiGaugeChart" width="180" height="180"></canvas>
            <div class="wq-aqi__gauge-center">
              <span class="wq-aqi__value" id="aqiValue">--</span>
              <span class="wq-aqi__label" id="aqiLevel">--</span>
            </div>
          </div>
          <!-- 健康建议 -->
          <div class="wq-aqi__advice" id="aqiAdvice">
            <p id="aqiAdviceText"></p>
          </div>
        </div>
        <!-- 6项污染物 -->
        <div class="wq-pollutants" id="pollutantsGrid">
          <div class="wq-pollutant" data-key="pm25">
            <span class="wq-pollutant__name" data-i18n="aqi.pm25">PM2.5</span>
            <div class="wq-pollutant__bar"><div class="wq-pollutant__fill" id="bar-pm25"></div></div>
            <span class="wq-pollutant__val" id="val-pm25">--</span>
          </div>
          <div class="wq-pollutant" data-key="pm10">
            <span class="wq-pollutant__name" data-i18n="aqi.pm10">PM10</span>
            <div class="wq-pollutant__bar"><div class="wq-pollutant__fill" id="bar-pm10"></div></div>
            <span class="wq-pollutant__val" id="val-pm10">--</span>
          </div>
          <div class="wq-pollutant" data-key="o3">
            <span class="wq-pollutant__name" data-i18n="aqi.o3">臭氧 O₃</span>
            <div class="wq-pollutant__bar"><div class="wq-pollutant__fill" id="bar-o3"></div></div>
            <span class="wq-pollutant__val" id="val-o3">--</span>
          </div>
          <div class="wq-pollutant" data-key="no2">
            <span class="wq-pollutant__name" data-i18n="aqi.no2">NO₂</span>
            <div class="wq-pollutant__bar"><div class="wq-pollutant__fill" id="bar-no2"></div></div>
            <span class="wq-pollutant__val" id="val-no2">--</span>
          </div>
          <div class="wq-pollutant" data-key="so2">
            <span class="wq-pollutant__name" data-i18n="aqi.so2">SO₂</span>
            <div class="wq-pollutant__bar"><div class="wq-pollutant__fill" id="bar-so2"></div></div>
            <span class="wq-pollutant__val" id="val-so2">--</span>
          </div>
          <div class="wq-pollutant" data-key="co">
            <span class="wq-pollutant__name" data-i18n="aqi.co">CO</span>
            <div class="wq-pollutant__bar"><div class="wq-pollutant__fill" id="bar-co"></div></div>
            <span class="wq-pollutant__val" id="val-co">--</span>
          </div>
        </div>
      </section>

      <!-- ❺ 天气地图 -->
      <section class="wq-card wq-map hidden" id="weatherMapPanel">
        <h2 class="wq-card__title" data-i18n="map.title">天气地图</h2>
        <!-- 图层切换 -->
        <div class="wq-map__layers" role="group" aria-label="Map Layers">
          <button class="wq-map-layer active" data-layer="temperature" onclick="WeatherEngine.switchMapLayer('temperature')" data-i18n="map.layer_temp">温度</button>
          <button class="wq-map-layer" data-layer="precipitation" onclick="WeatherEngine.switchMapLayer('precipitation')" data-i18n="map.layer_precip">降水</button>
          <button class="wq-map-layer" data-layer="wind" onclick="WeatherEngine.switchMapLayer('wind')" data-i18n="map.layer_wind">风速</button>
          <button class="wq-map-layer" data-layer="clouds" onclick="WeatherEngine.switchMapLayer('clouds')" data-i18n="map.layer_clouds">云量</button>
          <button class="wq-map-layer" data-layer="pressure" onclick="WeatherEngine.switchMapLayer('pressure')" data-i18n="map.layer_pressure">气压</button>
        </div>
        <div id="weatherMap" class="wq-map__container" style="height:400px"></div>
      </section>

      <!-- ❻ 生活指数 -->
      <section class="wq-card wq-life hidden" id="lifeIndexPanel">
        <h2 class="wq-card__title" data-i18n="life.title">生活指数</h2>
        <div class="wq-life__grid" id="lifeIndexGrid">
          <!-- JS 动态渲染 6 个生活指数卡片 -->
        </div>
      </section>

    </main><!-- /.wq-main -->

    <!-- 右列：侧边广告 -->
    <aside class="wq-sidebar" id="weatherSidebar">
      {{- template "partials/ad_slot.html" dict
        "SlotID" "weather-query-sidebar" "Size" "300x250" "MobileHide" true
        "ClientID" .AdsClientID "Enabled" .AdsEnabled }}
    </aside>

  </div><!-- /.wq-layout -->

  <!-- ⑤ 三特性卡片 -->
  <section class="wq-features" aria-label="Features">
    <div class="wq-features__grid">
      <div class="wq-feature-card">
        <div class="wq-feature-card__icon">🎯</div>
        <h3 data-i18n="feature.accurate_title">气象级别精准</h3>
        <p data-i18n="feature.accurate_desc">采用 ECMWF 和 GFS 全球气象模型</p>
      </div>
      <div class="wq-feature-card">
        <div class="wq-feature-card__icon">⚡</div>
        <h3 data-i18n="feature.fast_title">极速响应</h3>
        <p data-i18n="feature.fast_desc">1秒内返回结果，直连 Open-Meteo CDN</p>
      </div>
      <div class="wq-feature-card">
        <div class="wq-feature-card__icon">🆓</div>
        <h3 data-i18n="feature.free_title">永久免费</h3>
        <p data-i18n="feature.free_desc">无需注册，无需 API Key，无次数限制</p>
      </div>
    </div>
  </section>

  <!-- ⑥ FAQ 手风琴 -->
  <section class="wq-faq" aria-label="FAQ">
    <div class="wq-faq__inner">
      <h2 class="wq-faq__title">常见问题</h2>
      {{ range .FAQs }}
      <details class="wq-faq__item">
        <summary class="wq-faq__q">{{ .Q }}</summary>
        <div class="wq-faq__a"><p>{{ .A }}</p></div>
      </details>
      {{ end }}
    </div>
  </section>

  <!-- ⑦ 底部广告 -->
  {{- template "partials/ad_slot.html" dict
    "SlotID" "weather-query-bottom" "Size" "728x90" "Mobile" "320x50"
    "ClientID" .AdsClientID "Enabled" .AdsEnabled }}

  <!-- Toast 容器 -->
  <div class="wq-toast-container" id="toastContainer" aria-live="assertive"></div>

  <!-- 骨架屏 -->
  <div class="wq-skeleton hidden" id="loadingSkeleton" aria-busy="true">
    <div class="wq-skeleton__card"></div>
    <div class="wq-skeleton__card wq-skeleton__card--sm"></div>
    <div class="wq-skeleton__card wq-skeleton__card--sm"></div>
  </div>

  <!-- 模板片段（JS 使用） -->
  <template id="cityItemTpl">
    <li class="wq-search__item" role="option" tabindex="-1">
      <span class="city-flag"></span>
      <span class="city-name"></span>
      <span class="city-country"></span>
    </li>
  </template>

  <template id="recentChipTpl">
    <button class="wq-recent-chip" onclick="WeatherEngine.searchByName(this.dataset.city)">
      <span class="chip-name"></span>
    </button>
  </template>

  <template id="dayCardTpl">
    <div class="wq-day-card">
      <span class="day-name"></span>
      <span class="day-icon"></span>
      <span class="day-desc"></span>
      <div class="day-temps">
        <span class="day-high"></span>
        <div class="day-temp-bar"><div class="day-temp-fill"></div></div>
        <span class="day-low"></span>
      </div>
      <span class="day-rain"></span>
    </div>
  </template>

</div><!-- /.wq-page -->
{{ end }}
```

---

## 3. CSS 规范

### CSS 变量定义

```css
/* styles/weather-query.css */
:root {
  /* 主色系 */
  --wq-primary:        #1a6fb5;
  --wq-primary-light:  #0ea5e9;
  --wq-primary-glow:   rgba(14, 165, 233, 0.35);

  /* 天气主题背景（JS 动态切换 data-theme） */
  --wq-bg-clear:   linear-gradient(160deg, #1e4070 0%, #1a6fb5 50%, #38bdf8 100%);
  --wq-bg-cloudy:  linear-gradient(160deg, #1e293b 0%, #334155 50%, #475569 100%);
  --wq-bg-rainy:   linear-gradient(160deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
  --wq-bg-snowy:   linear-gradient(160deg, #e2e8f0 0%, #cbd5e1 50%, #94a3b8 100%);
  --wq-bg-storm:   linear-gradient(160deg, #1a0533 0%, #2d1b69 50%, #1e3a5f 100%);

  /* 卡片 */
  --wq-card-bg:     rgba(255, 255, 255, 0.08);
  --wq-card-bg-hover: rgba(255, 255, 255, 0.12);
  --wq-card-border: rgba(255, 255, 255, 0.12);
  --wq-card-radius: 16px;
  --wq-card-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.1);

  /* 文字 */
  --wq-text-primary:  #f1f5f9;
  --wq-text-secondary: #94a3b8;
  --wq-text-muted:    #64748b;

  /* AQI 颜色 */
  --aqi-good:       #22c55e;
  --aqi-fair:       #84cc16;
  --aqi-moderate:   #eab308;
  --aqi-poor:       #f97316;
  --aqi-very-poor:  #ef4444;
  --aqi-hazardous:  #a855f7;

  /* 搜索框 */
  --wq-search-height: 60px;
  --wq-search-radius: 30px;
  --wq-search-shadow: 0 20px 60px rgba(0,0,0,0.3);
  --wq-search-glow:   0 0 0 4px var(--wq-primary-glow);

  /* 响应式断点 */
  --bp-mobile: 640px;
  --bp-tablet: 1024px;
}
```

### 关键样式规则

**搜索框（`.wq-search__box`）**
```css
.wq-search__box {
  height: var(--wq-search-height);
  border-radius: var(--wq-search-radius);
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(20px);
  border: 1.5px solid rgba(255,255,255,0.25);
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}
.wq-search__box:focus-within {
  box-shadow: var(--wq-search-glow);
  border-color: var(--wq-primary-light);
  background: rgba(255,255,255,0.2);
}
/* 输入框：去掉原生样式 */
.wq-search__input {
  background: transparent;
  border: none;
  outline: none;
  color: var(--wq-text-primary);
  font-size: 1.1rem;
  width: 100%;
}
```

**天气背景动效**
```css
/* JS 通过切换 class 触发动画 */
.wq-bg { transition: background 1.5s ease; }
.wq-bg--clear   { background: var(--wq-bg-clear); }
.wq-bg--cloudy  { background: var(--wq-bg-cloudy); }
.wq-bg--rainy   { background: var(--wq-bg-rainy); }
.wq-bg--snowy   { background: var(--wq-bg-snowy); }
.wq-bg--storm   { background: var(--wq-bg-storm); }

/* 粒子层（雨/雪动画） */
.wq-bg__particles {
  position: absolute; inset: 0;
  pointer-events: none;
  overflow: hidden;
}
```

**卡片（`.wq-card`）**
```css
.wq-card {
  background: var(--wq-card-bg);
  backdrop-filter: blur(16px);
  border: 1px solid var(--wq-card-border);
  border-radius: var(--wq-card-radius);
  box-shadow: var(--wq-card-shadow);
  padding: 1.5rem;
  /* 入场动画 */
  animation: cardSlideIn 0.4s ease forwards;
}
@keyframes cardSlideIn {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

**大温度字（`.wq-current__temp`）**
```css
.wq-current__temp {
  font-size: clamp(4rem, 10vw, 7rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
  color: var(--wq-text-primary);
  /* 数字跳动动画 */
  transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
}
```

**太阳弧线（`.wq-sun-arc`）**
```css
.wq-sun-arc__track   { stroke: rgba(255,255,255,0.15); stroke-width: 3; }
.wq-sun-arc__progress { stroke: #fbbf24; stroke-width: 3; stroke-linecap: round; }
.wq-sun-arc__sun {
  fill: #fbbf24;
  filter: drop-shadow(0 0 6px #fbbf24);
  /* JS 通过 cx/cy 属性动态更新位置 */
}
```

**12宫格数据（`.wq-metrics`）**
```css
.wq-metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 桌面4列 */
  gap: 0.75rem;
}
@media (max-width: 640px) {
  .wq-metrics { grid-template-columns: repeat(3, 1fr); }
}
```

**响应式断点**
```css
/* 主布局 — 桌面双列 */
.wq-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
}
/* 平板 — 单列 */
@media (max-width: 1024px) {
  .wq-layout { grid-template-columns: 1fr; }
  .wq-sidebar { display: none; }
}
/* 移动端 — padding 缩减 */
@media (max-width: 640px) {
  .wq-layout { padding: 0.75rem; }
  .wq-card   { padding: 1rem; border-radius: 12px; }
}
```

---

## 4. 验收标准 Checklist

### 视觉还原
- [ ] Hero 区背景渐变按晴/阴/雨/雪/风暴5个状态动态切换
- [ ] 搜索框聚焦时蓝色光晕扩散动画正常
- [ ] 大温度数字使用 clamp 自适应字号，移动端不溢出
- [ ] 太阳弧线 SVG 按日出日落时间实时定位太阳图标位置
- [ ] 12 项 mini 指标卡片桌面4列、移动端3列布局正确
- [ ] AQI 环形仪表盘颜色与分级标准对应（绿/黄/橙/红/紫）
- [ ] 天气快照（html2canvas）生成图片比例为 2:1，无截断
- [ ] 三特性卡片移动端堆叠为单列

### 交互动效
- [ ] 输入 debounce 300ms 后触发城市补全请求
- [ ] 补全列表最多显示 8 条，键盘上下可导航
- [ ] 单位切换后所有数值即时换算更新（无需重新请求API）
- [ ] 预报 Tab 切换时图表以 300ms fade 动画过渡
- [ ] 天气主题背景切换使用 1.5s 渐变过渡
- [ ] FAQ `<details>` 展开收起有平滑高度动画
- [ ] 卡片入场动画 `cardSlideIn` 0.4s，多卡片依次 stagger 延迟

### 响应式
- [ ] 1024px 以下隐藏右侧边栏广告
- [ ] 640px 以下搜索框高度降为 50px，字号降为 1rem
- [ ] 天气地图在移动端高度降为 250px
- [ ] 生活指数在移动端为 2 列网格
- [ ] 底部广告移动端使用 320x50 尺寸
