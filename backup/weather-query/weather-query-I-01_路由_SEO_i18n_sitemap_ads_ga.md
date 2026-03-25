<!-- weather-query-I-01_路由_SEO_i18n_sitemap_ads_ga.md -->

# Weather Query · 天气查询工具 — 路由 / SEO / i18n / Sitemap / 广告 / GA

---

## 1. Go 路由注册

```go
// routes/weather.go
package routes

import (
    "toolboxnova/handlers"
    "toolboxnova/middleware"

    "github.com/gin-gonic/gin"
)

func RegisterWeatherRoutes(rg *gin.RouterGroup) {
    // 实用工具 + 开发工具双归属，主路由挂 /weather 下
    weather := rg.Group("/weather", middleware.LangDetect(), middleware.SEOHeaders())
    {
        weather.GET("/query", handlers.WeatherQueryHandler)
    }
}
```

```go
// main.go（片段）
api := r.Group("/")
routes.RegisterWeatherRoutes(api)
```

---

## 2. 页面 Handler

```go
// handlers/weather_query.go
package handlers

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

type WeatherQueryFAQ struct {
    Q string `json:"q"`
    A string `json:"a"`
}

func WeatherQueryHandler(c *gin.Context) {
    lang := c.GetString("lang") // 由 LangDetect 中间件注入，"zh" 或 "en"

    seoData := map[string]interface{}{
        "Title":           i18n(lang, "seo.title"),
        "Description":     i18n(lang, "seo.description"),
        "Keywords":        i18n(lang, "seo.keywords"),
        "OGTitle":         i18n(lang, "seo.og_title"),
        "OGDescription":   i18n(lang, "seo.og_description"),
        "CanonicalURL":    "https://toolboxnova.com/weather/query",
        "HreflangZH":      "https://toolboxnova.com/weather/query?lang=zh",
        "HreflangEN":      "https://toolboxnova.com/weather/query?lang=en",
        "Lang":            lang,
        "AdsEnabled":      getEnvBool("ADS_ENABLED"),
        "AdsClientID":     getEnv("ADS_CLIENT_ID", "ca-pub-0000000000000000"),
        "GAEnabled":       getEnvBool("GA_ENABLED"),
        "GAID":            getEnv("GA_ID", "G-XXXXXXXXXX"),
        "FAQs":            getWeatherFAQs(lang),
        "DefaultCity":     "Beijing",   // 服务端可根据IP注入
    }

    c.HTML(http.StatusOK, "weather/query.html", seoData)
}

func getWeatherFAQs(lang string) []WeatherQueryFAQ {
    if lang == "en" {
        return []WeatherQueryFAQ{
            {Q: "Is this weather tool completely free?", A: "Yes, toolboxnova.com weather query is completely free. It uses the Open-Meteo public API which requires no API key or registration."},
            {Q: "How accurate are the weather forecasts?", A: "We use data from ECMWF and GFS global models, updated every 1-6 hours. Accuracy is highest within 48 hours and remains reliable up to 7 days."},
            {Q: "What air quality data is provided?", A: "We display the AQI index along with detailed pollutants including PM2.5, PM10, O3 (ozone), NO2, SO2, and CO sourced from the Copernicus CAMS model."},
            {Q: "Can I check historical weather data?", A: "Yes, you can view weather data for the past 30 days using the history tab. For longer archives, we display data from the Open-Meteo Archive API."},
            {Q: "How do I share weather information?", A: "Click the 'Share Snapshot' button to generate a beautiful weather image card that you can save or share on social media."},
        }
    }
    return []WeatherQueryFAQ{
        {Q: "天气查询工具是免费的吗？", A: "是的，toolboxnova.com 天气查询工具完全免费，使用 Open-Meteo 公共 API，无需注册账号或 API Key。"},
        {Q: "天气预报的精准度如何？", A: "我们使用 ECMWF 和 GFS 全球气象模型数据，每 1-6 小时更新一次。48小时内精准度最高，7天内预报仍具参考价值。"},
        {Q: "提供哪些空气质量数据？", A: "我们展示 AQI 指数以及 PM2.5、PM10、O3（臭氧）、NO2、SO2、CO 等详细污染物浓度，数据来源于 Copernicus CAMS 模型。"},
        {Q: "可以查询历史天气吗？", A: "可以，切换到「历史」标签可查询近30天的天气数据，通过 Open-Meteo Archive API 免费获取。"},
        {Q: "如何分享天气信息？", A: "点击「生成天气快照」按钮，即可生成精美的天气图片卡片，可保存到手机相册或分享至社交媒体。"},
    }
}
```

---

## 3. SEO `<head>` 模板

```html
{{/* templates/weather/query.html — head 部分 */}}
{{ define "extraHead" }}

{{/* ① AdSense SDK 条件加载 */}}
{{ if .AdsEnabled }}
<script async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={{ .AdsClientID }}"
  crossorigin="anonymous"></script>
{{ end }}

<title>{{ .Title }}</title>
<meta name="description" content="{{ .Description }}">
<meta name="keywords" content="{{ .Keywords }}">
<meta name="robots" content="index, follow">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- Open Graph -->
<meta property="og:title" content="{{ .OGTitle }}">
<meta property="og:description" content="{{ .OGDescription }}">
<meta property="og:type" content="website">
<meta property="og:url" content="{{ .CanonicalURL }}">
<meta property="og:image" content="https://toolboxnova.com/static/og/weather-query.png">
<meta property="og:site_name" content="ToolboxNova">
<meta property="og:locale" content="{{ if eq .Lang "zh" }}zh_CN{{ else }}en_US{{ end }}">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{ .OGTitle }}">
<meta name="twitter:description" content="{{ .OGDescription }}">
<meta name="twitter:image" content="https://toolboxnova.com/static/og/weather-query.png">

<!-- Canonical & hreflang -->
<link rel="canonical" href="{{ .CanonicalURL }}">
<link rel="alternate" hreflang="zh-CN" href="{{ .HreflangZH }}">
<link rel="alternate" hreflang="en" href="{{ .HreflangEN }}">
<link rel="alternate" hreflang="x-default" href="{{ .CanonicalURL }}">

<!-- JSON-LD: SoftwareApplication -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "{{ .Title }}",
  "description": "{{ .Description }}",
  "url": "{{ .CanonicalURL }}",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "2341",
    "bestRating": "5"
  },
  "provider": {
    "@type": "Organization",
    "name": "ToolboxNova",
    "url": "https://toolboxnova.com"
  }
}
</script>

<!-- JSON-LD: FAQPage -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {{ range $i, $faq := .FAQs }}
    {{ if $i }},{{ end }}
    {
      "@type": "Question",
      "name": "{{ $faq.Q }}",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "{{ $faq.A }}"
      }
    }
    {{ end }}
  ]
}
</script>

{{ end }}
```

---

## 4. 广告接入 & GA 事件追踪

### 广告位插入（三段式）

```html
{{/* ② 顶部横幅 — Hero 搜索区下方 */}}
{{- template "partials/ad_slot.html" dict
    "SlotID" "weather-query-top" "Size" "728x90" "Mobile" "320x50"
    "ClientID" .AdsClientID "Enabled" .AdsEnabled }}

{{/* ③ 侧边栏 — 天气面板右侧（移动端隐藏） */}}
{{- template "partials/ad_slot.html" dict
    "SlotID" "weather-query-sidebar" "Size" "300x250" "MobileHide" true
    "ClientID" .AdsClientID "Enabled" .AdsEnabled }}

{{/* ④ 底部横幅 — FAQ 区域下方 */}}
{{- template "partials/ad_slot.html" dict
    "SlotID" "weather-query-bottom" "Size" "728x90" "Mobile" "320x50"
    "ClientID" .AdsClientID "Enabled" .AdsEnabled }}
```

### GA 事件追踪

```javascript
{{ define "extraScript" }}
(function () {
  var TOOL = 'weather-query'; // 与 SlotID 前缀一致

  // 搜索城市
  window.gaTrackWeatherSearch = function(cityName, method) {
    gaTrackSettingChange(TOOL, 'search_method', method); // 'text' | 'geolocation' | 'url_param'
    gaTrack(TOOL, 'search', cityName);
  };

  // 完成天气数据加载
  window.gaTrackWeatherLoaded = function(cityName, durationMs) {
    gaTrackProcessDone(TOOL, 1, durationMs);
  };

  // 图层切换（地图）
  window.gaTrackLayerSwitch = function(layerName) {
    gaTrackSettingChange(TOOL, 'map_layer', layerName);
    // layerName: 'temperature' | 'precipitation' | 'wind' | 'clouds'
  };

  // 预报 Tab 切换
  window.gaTrackForecastTab = function(tabName) {
    gaTrackSettingChange(TOOL, 'forecast_tab', tabName);
    // tabName: 'hourly24' | 'daily14' | 'history'
  };

  // 单位切换
  window.gaTrackUnitChange = function(unitType, value) {
    gaTrackSettingChange(TOOL, 'unit_' + unitType, value);
  };

  // 天气快照生成
  window.gaTrackSnapshot = function() {
    gaTrackDownload(TOOL, 'image/png');
  };

  // 加载错误
  window.gaTrackWeatherError = function(errType, errMsg) {
    gaTrackError(TOOL, errType, errMsg);
    // errType: 'api_fail' | 'geo_denied' | 'city_not_found'
  };

  // AQI 展开查看
  window.gaTrackAQIExpand = function() {
    gaTrackSettingChange(TOOL, 'aqi_detail', 'expanded');
  };
})();
{{ end }}
```

### 三段式 Block 说明

| Block | 放置位置 | 放置内容 |
|-------|---------|---------|
| `extraHead` | `<head>` 内 | AdSense SDK 条件加载、SEO meta、JSON-LD、ECharts/Leaflet CSS |
| `content` | `<body>` 主内容区 | 搜索区、天气卡片、预报面板、地图、AQI、生活指数、FAQ、广告位 |
| `extraScript` | `</body>` 前 | ECharts/Leaflet 初始化、天气引擎 JS、GA 事件绑定函数 |

---

## 5. 全量 i18n Key

### 英文：`i18n/en/weather-query.json`

```json
{
  "seo.title": "Weather Query - Real-Time Global Weather Forecast | ToolboxNova",
  "seo.description": "Free online weather tool with real-time conditions, 14-day forecasts, air quality index, UV index, wind maps and weather snapshots for any city worldwide. No registration required.",
  "seo.keywords": "weather query, real-time weather, weather forecast, air quality, AQI, UV index, wind map, 14-day forecast, free weather tool",
  "seo.og_title": "Weather Query — Real-Time Weather for Any City",
  "seo.og_description": "Instant weather data: temperature, humidity, wind, AQI, UV index, 14-day forecast and interactive maps. Free, no sign-up needed.",

  "hero.title": "Real-Time Global Weather",
  "hero.subtitle": "Instant temperature, forecast, air quality & maps for any city in the world",
  "hero.badge_free": "Free Forever",
  "hero.badge_no_key": "No API Key",
  "hero.badge_realtime": "Live Data",
  "hero.badge_global": "Global Coverage",

  "search.placeholder": "Search city, e.g. Tokyo, London, New York…",
  "search.btn_locate": "Locate Me",
  "search.locating": "Locating…",
  "search.recent": "Recent Searches",
  "search.no_result": "City not found. Please try another name.",
  "search.error_geo": "Location access denied. Please search manually.",
  "search.error_api": "Failed to load weather data. Please try again.",

  "current.feels_like": "Feels Like",
  "current.humidity": "Humidity",
  "current.wind": "Wind",
  "current.pressure": "Pressure",
  "current.visibility": "Visibility",
  "current.uv_index": "UV Index",
  "current.dew_point": "Dew Point",
  "current.cloud_cover": "Cloud Cover",
  "current.precipitation": "Precipitation",
  "current.sunrise": "Sunrise",
  "current.sunset": "Sunset",
  "current.moonrise": "Moonrise",
  "current.moonset": "Moonset",
  "current.moon_phase": "Moon Phase",
  "current.last_updated": "Updated",

  "forecast.tab_hourly": "24-Hour",
  "forecast.tab_daily": "14-Day",
  "forecast.tab_history": "30-Day History",
  "forecast.chart_temp": "Temperature (°C)",
  "forecast.chart_precip": "Precipitation (mm)",
  "forecast.chart_wind": "Wind Speed (km/h)",
  "forecast.chart_humidity": "Humidity (%)",
  "forecast.high": "High",
  "forecast.low": "Low",
  "forecast.precip_prob": "Rain Chance",
  "forecast.model_gfs": "GFS Model",
  "forecast.model_ecmwf": "ECMWF Model",
  "forecast.model_compare": "Compare Models",

  "aqi.title": "Air Quality Index",
  "aqi.level_good": "Good",
  "aqi.level_fair": "Fair",
  "aqi.level_moderate": "Moderate",
  "aqi.level_poor": "Poor",
  "aqi.level_very_poor": "Very Poor",
  "aqi.level_hazardous": "Hazardous",
  "aqi.pm25": "PM2.5",
  "aqi.pm10": "PM10",
  "aqi.o3": "Ozone (O₃)",
  "aqi.no2": "Nitrogen Dioxide (NO₂)",
  "aqi.so2": "Sulfur Dioxide (SO₂)",
  "aqi.co": "Carbon Monoxide (CO)",
  "aqi.advice_good": "Air quality is satisfactory. Enjoy outdoor activities.",
  "aqi.advice_fair": "Acceptable air quality. Sensitive individuals should limit prolonged outdoor exertion.",
  "aqi.advice_moderate": "Unhealthy for sensitive groups. Consider reducing outdoor time.",
  "aqi.advice_poor": "Unhealthy. Avoid prolonged outdoor activities, especially for children and elderly.",
  "aqi.advice_very_poor": "Very unhealthy. Stay indoors. Wear N95 mask if going outside.",
  "aqi.advice_hazardous": "Hazardous. Health emergency. Avoid all outdoor activities.",

  "map.title": "Weather Map",
  "map.layer_temp": "Temperature",
  "map.layer_precip": "Precipitation",
  "map.layer_wind": "Wind",
  "map.layer_clouds": "Clouds",
  "map.layer_pressure": "Pressure",

  "life.title": "Daily Life Index",
  "life.dressing": "Dressing",
  "life.uv_protection": "UV Protection",
  "life.exercise": "Exercise",
  "life.car_wash": "Car Wash",
  "life.allergy": "Allergy Risk",
  "life.comfort": "Comfort",

  "share.btn": "Save Weather Snapshot",
  "share.generating": "Generating image…",
  "share.success": "Image saved! Check your downloads.",
  "share.error": "Failed to generate snapshot. Please try again.",

  "units.celsius": "°C",
  "units.fahrenheit": "°F",
  "units.kmh": "km/h",
  "units.mph": "mph",
  "units.ms": "m/s",
  "units.hpa": "hPa",
  "units.inhg": "inHg",
  "units.mm": "mm",
  "units.inches": "in",
  "units.km": "km",
  "units.miles": "mi",

  "error.city_not_found": "City not found. Please check spelling or try coordinates.",
  "error.api_timeout": "Request timed out. Please check your network.",
  "error.api_error": "Failed to fetch weather data. Please try again later.",
  "error.geo_permission": "Geolocation permission denied by browser.",
  "error.geo_unavailable": "Geolocation is not available on this device.",

  "feature.accurate_title": "Meteorologically Accurate",
  "feature.accurate_desc": "Powered by ECMWF and GFS global models — the same data used by professional meteorologists.",
  "feature.fast_title": "Lightning Fast",
  "feature.fast_desc": "Results in under 1 second. No server round-trip — weather data loaded directly from Open-Meteo CDN.",
  "feature.free_title": "Always Free",
  "feature.free_desc": "No registration, no API key, no usage limits. Open-Meteo is a non-commercial, open-source API.",

  "faq.q1": "Is this weather tool completely free?",
  "faq.a1": "Yes, toolboxnova.com weather query is completely free. It uses the Open-Meteo public API which requires no API key or registration.",
  "faq.q2": "How accurate are the weather forecasts?",
  "faq.a2": "We use data from ECMWF and GFS global models, updated every 1-6 hours. Accuracy is highest within 48 hours and remains reliable up to 7 days.",
  "faq.q3": "What air quality data is provided?",
  "faq.a3": "We display the AQI index along with detailed pollutants including PM2.5, PM10, O3 (ozone), NO2, SO2, and CO sourced from the Copernicus CAMS model.",
  "faq.q4": "Can I check historical weather data?",
  "faq.a4": "Yes, you can view weather data for the past 30 days using the history tab. Data is sourced from the Open-Meteo Archive API.",
  "faq.q5": "How do I share weather information?",
  "faq.a5": "Click the 'Save Weather Snapshot' button to generate a beautiful weather image card that you can save or share on social media.",

  "nav.weather_query": "Weather Query"
}
```

### 中文：`i18n/zh/weather-query.json`

```json
{
  "seo.title": "天气查询 - 全球实时天气预报工具 | ToolboxNova",
  "seo.description": "免费在线天气查询工具，提供全球任意城市实时天气、14天预报、空气质量指数、UV指数、风速地图和天气快照分享，无需注册。",
  "seo.keywords": "天气查询, 实时天气, 天气预报, 空气质量, AQI指数, 紫外线指数, 风速地图, 14天预报, 免费天气工具",
  "seo.og_title": "天气查询 — 全球任意城市实时天气",
  "seo.og_description": "即时获取温度、湿度、风速、空气质量、紫外线指数、14天预报和交互地图，免费使用，无需注册。",

  "hero.title": "全球实时天气查询",
  "hero.subtitle": "立即获取全球任意城市的温度、预报、空气质量与气象地图",
  "hero.badge_free": "永久免费",
  "hero.badge_no_key": "无需API Key",
  "hero.badge_realtime": "实时数据",
  "hero.badge_global": "全球覆盖",

  "search.placeholder": "搜索城市，如：北京、上海、纽约…",
  "search.btn_locate": "定位我的位置",
  "search.locating": "定位中…",
  "search.recent": "最近搜索",
  "search.no_result": "未找到该城市，请尝试其他名称。",
  "search.error_geo": "位置权限被拒绝，请手动搜索城市。",
  "search.error_api": "天气数据加载失败，请稍后重试。",

  "current.feels_like": "体感温度",
  "current.humidity": "相对湿度",
  "current.wind": "风速风向",
  "current.pressure": "大气压",
  "current.visibility": "能见度",
  "current.uv_index": "紫外线指数",
  "current.dew_point": "露点温度",
  "current.cloud_cover": "云量",
  "current.precipitation": "降水量",
  "current.sunrise": "日出",
  "current.sunset": "日落",
  "current.moonrise": "月出",
  "current.moonset": "月落",
  "current.moon_phase": "月相",
  "current.last_updated": "更新于",

  "forecast.tab_hourly": "24小时",
  "forecast.tab_daily": "14天预报",
  "forecast.tab_history": "近30天历史",
  "forecast.chart_temp": "温度 (°C)",
  "forecast.chart_precip": "降水量 (mm)",
  "forecast.chart_wind": "风速 (km/h)",
  "forecast.chart_humidity": "湿度 (%)",
  "forecast.high": "最高",
  "forecast.low": "最低",
  "forecast.precip_prob": "降水概率",
  "forecast.model_gfs": "GFS模型",
  "forecast.model_ecmwf": "ECMWF模型",
  "forecast.model_compare": "模型对比",

  "aqi.title": "空气质量指数",
  "aqi.level_good": "优",
  "aqi.level_fair": "良",
  "aqi.level_moderate": "轻度污染",
  "aqi.level_poor": "中度污染",
  "aqi.level_very_poor": "重度污染",
  "aqi.level_hazardous": "严重污染",
  "aqi.pm25": "PM2.5",
  "aqi.pm10": "PM10",
  "aqi.o3": "臭氧 (O₃)",
  "aqi.no2": "二氧化氮 (NO₂)",
  "aqi.so2": "二氧化硫 (SO₂)",
  "aqi.co": "一氧化碳 (CO)",
  "aqi.advice_good": "空气质量令人满意，户外活动无限制。",
  "aqi.advice_fair": "空气质量可接受，敏感人群减少长时间户外剧烈运动。",
  "aqi.advice_moderate": "空气质量对敏感人群不健康，建议减少户外时间。",
  "aqi.advice_poor": "空气质量不健康，避免长时间户外活动，老人儿童尤其注意。",
  "aqi.advice_very_poor": "空气质量非常不健康，留在室内，外出需佩戴N95口罩。",
  "aqi.advice_hazardous": "空气质量达到危险级别，避免一切户外活动。",

  "map.title": "天气地图",
  "map.layer_temp": "温度",
  "map.layer_precip": "降水",
  "map.layer_wind": "风速",
  "map.layer_clouds": "云量",
  "map.layer_pressure": "气压",

  "life.title": "生活指数",
  "life.dressing": "穿衣指数",
  "life.uv_protection": "紫外线防护",
  "life.exercise": "运动指数",
  "life.car_wash": "洗车指数",
  "life.allergy": "过敏风险",
  "life.comfort": "舒适度",

  "share.btn": "保存天气快照",
  "share.generating": "生成图片中…",
  "share.success": "图片已保存，请查看下载目录。",
  "share.error": "生成快照失败，请稍后重试。",

  "units.celsius": "°C",
  "units.fahrenheit": "°F",
  "units.kmh": "km/h",
  "units.mph": "mph",
  "units.ms": "m/s",
  "units.hpa": "百帕",
  "units.inhg": "英寸汞柱",
  "units.mm": "毫米",
  "units.inches": "英寸",
  "units.km": "公里",
  "units.miles": "英里",

  "error.city_not_found": "未找到该城市，请检查拼写或尝试输入经纬度坐标。",
  "error.api_timeout": "请求超时，请检查网络连接后重试。",
  "error.api_error": "天气数据获取失败，请稍后重试。",
  "error.geo_permission": "浏览器定位权限被拒绝。",
  "error.geo_unavailable": "该设备不支持地理定位功能。",

  "feature.accurate_title": "气象级别精准",
  "feature.accurate_desc": "采用 ECMWF 和 GFS 全球气象模型，与专业气象机构使用相同数据源。",
  "feature.fast_title": "极速响应",
  "feature.fast_desc": "1秒内返回结果，前端直连 Open-Meteo CDN，无额外服务器延迟。",
  "feature.free_title": "永久免费",
  "feature.free_desc": "无需注册、无需API Key、无使用次数限制。基于 Open-Meteo 开源非商业API。",

  "faq.q1": "天气查询工具是免费的吗？",
  "faq.a1": "是的，toolboxnova.com 天气查询工具完全免费，使用 Open-Meteo 公共 API，无需注册账号或 API Key。",
  "faq.q2": "天气预报的精准度如何？",
  "faq.a2": "我们使用 ECMWF 和 GFS 全球气象模型数据，每 1-6 小时更新一次。48小时内精准度最高，7天内预报仍具参考价值。",
  "faq.q3": "提供哪些空气质量数据？",
  "faq.a3": "我们展示 AQI 指数以及 PM2.5、PM10、O3（臭氧）、NO2、SO2、CO 等详细污染物浓度，数据来源于 Copernicus CAMS 模型。",
  "faq.q4": "可以查询历史天气吗？",
  "faq.a4": "可以，切换到「近30天历史」标签可查询历史天气数据，通过 Open-Meteo Archive API 免费获取。",
  "faq.q5": "如何分享天气信息？",
  "faq.a5": "点击「保存天气快照」按钮，即可生成精美的天气图片卡片，可保存到本地或分享至社交媒体。",

  "nav.weather_query": "天气查询"
}
```

---

## 6. sitemap 新增条目

```xml
<url>
  <loc>https://toolboxnova.com/weather/query</loc>
  <lastmod>2025-08-15</lastmod>
  <changefreq>daily</changefreq>
  <priority>0.9</priority>
</url>
<url>
  <loc>https://toolboxnova.com/weather/query?lang=zh</loc>
  <lastmod>2025-08-15</lastmod>
  <changefreq>daily</changefreq>
  <priority>0.8</priority>
</url>
<url>
  <loc>https://toolboxnova.com/weather/query?lang=en</loc>
  <lastmod>2025-08-15</lastmod>
  <changefreq>daily</changefreq>
  <priority>0.8</priority>
</url>
```

---

## 7. Header 导航新增子项

```html
<!-- partials/header.html — 在「实用工具」和「开发工具」导航分类下各新增一项 -->

<!-- ① 实用工具分类下 -->
<li class="nav-sub-item">
  <a href="/weather/query" class="nav-sub-link" data-i18n="nav.weather_query">
    <svg class="nav-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 2a10 10 0 0 1 10 10c0 3.5-1.8 6.6-4.5 8.5"/>
      <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
      <circle cx="9" cy="9" r="1" fill="currentColor"/>
      <circle cx="15" cy="9" r="1" fill="currentColor"/>
      <path d="M3 7c2-3 5.5-5 9-5"/>
    </svg>
    <span data-i18n="nav.weather_query">天气查询</span>
    <span class="nav-badge nav-badge--new">New</span>
  </a>
</li>

<!-- ② 开发工具分类下（API工具子项） -->
<li class="nav-sub-item">
  <a href="/weather/query" class="nav-sub-link" data-i18n="nav.weather_query">
    <svg class="nav-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
    </svg>
    <span data-i18n="nav.weather_query">天气查询</span>
  </a>
</li>
```

---

## 8. 主页模块新增子项

```html
<!-- index.html — 实用工具模块下新增天气查询工具卡片 -->
<div class="tool-card tool-card--weather" data-category="utility">
  <a href="/weather/query" class="tool-card__link">
    <div class="tool-card__icon-wrap tool-card__icon-wrap--sky">
      <svg viewBox="0 0 48 48" width="36" height="36" fill="none">
        <!-- 太阳 -->
        <circle cx="24" cy="20" r="7" fill="#fbbf24"/>
        <g stroke="#fbbf24" stroke-width="2" stroke-linecap="round">
          <line x1="24" y1="8" x2="24" y2="5"/>
          <line x1="24" y1="35" x2="24" y2="32"/>
          <line x1="12" y1="20" x2="9" y2="20"/>
          <line x1="39" y1="20" x2="36" y2="20"/>
          <line x1="15.5" y1="11.5" x2="13.4" y2="9.4"/>
          <line x1="34.6" y1="30.6" x2="32.5" y2="28.5"/>
          <line x1="32.5" y1="11.5" x2="34.6" y2="9.4"/>
          <line x1="13.4" y1="30.6" x2="15.5" y2="28.5"/>
        </g>
        <!-- 云 -->
        <path d="M34 38H16a6 6 0 0 1-1-11.9A8 8 0 0 1 31 24a6 6 0 0 1 3 11Z" fill="#e0f2fe" stroke="#93c5fd" stroke-width="1.5"/>
      </svg>
    </div>
    <div class="tool-card__body">
      <h3 class="tool-card__title" data-i18n="nav.weather_query">天气查询</h3>
      <p class="tool-card__desc">全球实时天气 · 14天预报 · AQI · 风速地图</p>
      <div class="tool-card__tags">
        <span class="tag tag--blue">实时</span>
        <span class="tag tag--green">免费</span>
        <span class="tag tag--new">New</span>
      </div>
    </div>
    <div class="tool-card__arrow">
      <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
        <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/>
      </svg>
    </div>
  </a>
</div>
```
