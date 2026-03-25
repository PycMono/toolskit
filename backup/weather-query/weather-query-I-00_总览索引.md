<!-- weather-query-I-00_总览索引.md -->

# Weather Query · 天气查询工具 — 总览索引

> **工具标识符**：`weather-query`  
> **路由**：`/weather/query`  
> **网站**：toolboxnova.com  
> **主色调**：天空蓝 `#1a6fb5` · 渐变辅色 `#0ea5e9`  
> **分类归属**：导航 → 实用工具 / 开发工具（双归属）

---

## 1. 产品架构图

```
用户入口
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  搜索入口层                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ 城市名称搜索  │  │  IP自动定位  │  │  经纬度坐标输入   │  │
│  └──────┬───────┘  └──────┬───────┘  └─────────┬─────────┘  │
└─────────┼─────────────────┼───────────────────-┼────────────┘
          └─────────────────▼─────────────────────┘
                            │
                     Geocoding API
                   (Open-Meteo / OWM)
                            │
                     ┌──────▼──────┐
                     │ 坐标解析层  │
                     │  lat / lon  │
                     └──────┬──────┘
                            │
          ┌─────────────────┼─────────────────────┐
          ▼                 ▼                     ▼
   ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐
   │ 实时天气引擎 │  │  预报数据引擎 │  │  空气质量引擎    │
   │ Open-Meteo  │  │  Open-Meteo  │  │  Open-Meteo AQI  │
   │ current     │  │  hourly/daily│  │  + WAQI fallback  │
   └──────┬──────┘  └──────┬───────┘  └────────┬─────────┘
          │                │                   │
          └────────────────▼───────────────────┘
                           │
                    ┌──────▼──────┐
                    │  数据聚合层  │
                    │ WeatherStore│
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────────┐
          ▼                ▼                    ▼
  ┌──────────────┐  ┌────────────────┐  ┌──────────────┐
  │  当前天气卡片 │  │  预报图表面板   │  │  AQI 仪表盘  │
  │  温度/湿度   │  │  ECharts折线图  │  │  PM2.5/O3   │
  │  风速/气压   │  │  24h + 14day   │  │  颜色分级环  │
  └──────────────┘  └────────────────┘  └──────────────┘
          │                │                    │
          └────────────────▼────────────────────┘
                           │
          ┌────────────────┼───────────────────┐
          ▼                ▼                   ▼
  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐
  │  天气地图层   │  │  生活指数面板  │  │  分享/导出   │
  │  Leaflet.js  │  │  穿衣/UV/运动  │  │  截图/链接   │
  │  OWM Tiles   │  │  洗车/路况    │  │              │
  └──────────────┘  └───────────────┘  └──────────────┘
```

---

## 2. 竞品功能对标表

| 功能点 | OpenWeatherMap | Windy.com | AccuWeather | Meteoblue | **本次实现** | **差异化说明** |
|--------|:--------------:|:---------:|:-----------:|:---------:|:------------:|:-------------|
| 当前实时天气 | ✅ | ✅ | ✅ | ✅ | ✅ | 额外展示体感温度偏差原因 |
| 24小时逐小时预报 | ✅ | ✅ | ✅ | ✅ | ✅ | ECharts 动态折线 + 区域填充 |
| 7天每日预报 | ✅ | ✅ | ✅ | ✅ | ✅ 14天 | 对标 Meteoblue 延伸至14天 |
| 逐分钟降水预报 | ✅(付费) | ❌ | ✅(付费) | ❌ | ✅ | Open-Meteo 免费提供 |
| 空气质量 AQI | ✅(付费) | ✅ | ✅ | ❌ | ✅ | 免费展示 PM2.5/PM10/O3/NO2 |
| UV 指数 | ✅ | ✅ | ✅ | ✅ | ✅ | 每日 UV 曲线图 + 防晒建议 |
| 风速动画地图 | ❌ | ✅(核心) | ❌ | ❌ | ✅ | Leaflet + 风速粒子图层 |
| 气象图层叠加 | ✅(付费) | ✅ | ❌ | ✅ | ✅ | 温度/降水/云量/风速4图层切换 |
| 多模型对比 | ❌ | ✅ | ❌ | ✅ | ✅ | GFS + ECMWF双模型对比 |
| 历史天气数据 | ✅(付费) | ❌ | ✅(付费) | ✅(ERA5) | ✅ 近30天 | Open-Meteo Archive API免费 |
| 生活指数 | ❌ | ❌ | ✅ | ❌ | ✅ | 穿衣/UV/运动/洗车/过敏 5项 |
| 天气预警 | ✅ | ✅ | ✅ | ❌ | ✅ | 国家气象预警 banner |
| IP自动定位 | ✅ | ✅ | ✅ | ✅ | ✅ | + HTML5 Geolocation精定位 |
| 城市收藏/历史 | ❌ | ❌ | ✅(App) | ❌ | ✅ | localStorage 持久化最近5城市 |
| 单位自由切换 | ✅ | ✅ | ✅ | ✅ | ✅ | ℃/℉ + km/h·mph·m/s + hPa·inHg |
| 日出日落 + 月相 | ✅ | ✅ | ✅ | ✅ | ✅ | SVG 太阳弧线动画 + 月相图标 |
| 分享功能 | ❌ | ❌ | ❌ | ❌ | ✅ **独有** | 生成天气快照图片可分享 |
| 无广告纯净体验 | ❌(有广告) | ❌(有广告) | ❌(有广告) | ❌(有广告) | ✅ **独有** | 无需注册、无需API Key |
| 多语言支持 | ✅ | ✅ | ✅ | ✅ | ✅ | 中/英双语 URL 切换 |
| 响应式移动端 | ✅ | 一般 | ✅ | 一般 | ✅ | 移动端卡片式布局优化 |

**差异化核心优势**：
1. **零注册零密钥** — 基于 Open-Meteo 免费 API，用户无需任何账号
2. **天气快照分享** — html2canvas 截图生成精美天气卡片，可保存分享
3. **双数值模型对比** — GFS vs ECMWF 温度预报差异可视化（竞品普遍缺失）

---

## 3. Block 清单

| 文件编号 | 文件名 | 核心内容 | 预估工时 |
|----------|--------|----------|---------|
| I-00 | `weather-query-I-00_总览索引.md` | 架构图、竞品对标、路由、依赖清单 | 1h |
| I-01 | `weather-query-I-01_路由_SEO_i18n_sitemap_ads_ga.md` | Go路由、Handler、SEO head、广告位、GA事件、全量i18n | 4h |
| I-02 | `weather-query-I-02_首页Landing_搜索区.md` | HTML骨架、Hero搜索区、天气面板、CSS规范 | 6h |
| I-03 | `weather-query-I-03_前端数据引擎.md` | API封装、数据处理、图表渲染、状态管理、地图引擎 | 10h |
| I-04 | `weather-query-I-04_结果面板UI.md` | 天气卡片渲染、预报图表、AQI仪表盘、快照分享 | 8h |

**总计预估工时：29 小时**

---

## 4. 路由规划

| 路由 | 说明 |
|------|------|
| `GET /weather/query` | 主页（默认中文，IP自动定位） |
| `GET /weather/query?lang=zh` | 中文强制指定 |
| `GET /weather/query?lang=en` | 英文版本 |
| `GET /weather/query?city=Beijing` | 直接带城市参数打开 |
| `GET /weather/query?lat=39.9&lon=116.4` | 经纬度直链 |

> **无独立 API 路由**，所有天气数据均由前端直接调用 Open-Meteo 公共 API（CORS 已开放）。

---

## 5. 前端依赖（CDN）

```html
<!-- ECharts 5 — 图表渲染（逐小时/14天折线、AQI环形） -->
<script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>

<!-- Leaflet.js — 天气地图 -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css">
<script src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js"></script>

<!-- Leaflet Velocity — 风速粒子图层 -->
<script src="https://cdn.jsdelivr.net/npm/leaflet-velocity@2.1.0/dist/leaflet-velocity.min.js"></script>

<!-- html2canvas — 天气快照生成 -->
<script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>

<!-- Day.js — 日期时间处理 -->
<script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/plugin/utc.js"></script>
<script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/plugin/timezone.js"></script>
<script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/plugin/relativeTime.js"></script>
```

> **Open-Meteo API**：`https://api.open-meteo.com/v1/forecast`（无需 CDN，前端直调）  
> **Open-Meteo AQI**：`https://air-quality-api.open-meteo.com/v1/air-quality`  
> **Open-Meteo Geocoding**：`https://geocoding-api.open-meteo.com/v1/search`  
> **Open-Meteo Archive**：`https://archive-api.open-meteo.com/v1/archive`（近30天历史）

---

## 6. i18n Key 前缀清单

| 命名空间前缀 | 覆盖内容 |
|-------------|---------|
| `seo.*` | title、description、keywords、OG 文案 |
| `hero.*` | 搜索框标题、副标题、placeholder、Badge文案 |
| `search.*` | 搜索状态文案、错误提示、定位按钮 |
| `current.*` | 当前天气各字段标签（温度/湿度/气压等） |
| `forecast.*` | 预报面板标题、tab文案、图表标签 |
| `aqi.*` | 空气质量分级文案、各污染物名称 |
| `map.*` | 地图图层标签、工具提示 |
| `life.*` | 生活指数各项名称和建议文案 |
| `share.*` | 快照分享按钮、Toast提示 |
| `units.*` | 单位切换标签（摄氏度/华氏度等） |
| `error.*` | 各类错误提示文案 |
| `faq.*` | FAQ 问答文案 |
| `feature.*` | 三特性卡片文案（准确/快速/免费） |
| `nav.*` | 导航栏相关文案 |

---

## 7. sitemap 新增条目

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

## 8. 设计风格定调

### 色彩系统

| 用途 | 色值 | 说明 |
|------|------|------|
| 主色（晴天蓝） | `#1a6fb5` | 按钮、强调元素 |
| 渐变辅色 | `#0ea5e9` | Hero背景渐变终点 |
| 深色背景 | `#0f172a` | 页面背景（暗色调，如夜空） |
| 卡片背景 | `rgba(255,255,255,0.08)` | 毛玻璃卡片 |
| 卡片边框 | `rgba(255,255,255,0.12)` | 微妙的光感边框 |
| 文字主色 | `#f1f5f9` | 主要内容 |
| 文字次色 | `#94a3b8` | 标签、辅助信息 |
| 晴天渐变 | `linear-gradient(135deg, #1e4070, #1a6fb5, #38bdf8)` | Hero区 |
| 阴天渐变 | `linear-gradient(135deg, #1e293b, #334155, #475569)` | 动态切换 |
| 雨天渐变 | `linear-gradient(135deg, #0f2027, #203a43, #2c5364)` | 动态切换 |
| AQI优良 | `#22c55e` | 绿色 |
| AQI轻度 | `#eab308` | 黄色 |
| AQI中度 | `#f97316` | 橙色 |
| AQI重度 | `#ef4444` | 红色 |
| AQI严重 | `#a855f7` | 紫色 |

### 搜索区交互风格
- 超大搜索框（高度 56px），毛玻璃背景，聚焦时蓝色光晕扩散动画
- 输入时实时下拉城市补全列表（debounce 300ms）
- 支持键盘上下选择 + Enter 确认
- 定位按钮内嵌搜索框右侧，脉冲动画提示可点击

### 天气面板布局
- **主卡片**：左侧大温度数字 + 天气图标（SVG 动画，如旋转太阳、飘落雨滴）
- **数据栅格**：6 格 mini 卡片展示湿度/气压/风速/能见度/UV/露点
- **预报区**：Tab 切换（逐小时24h / 逐日14天），ECharts 折线图带渐变填充
- **地图区**：Leaflet 嵌入，左侧图层控制面板（温度/降水/云量/风速）

### 差异化设计亮点（≥3条）
1. **动态天气背景** — 根据当前天气实时切换 Hero 渐变色和粒子动效（晴天光晕/雨天水滴/雪天飘雪）
2. **天气快照卡片** — 点击分享按钮生成精美天气图片（城市名+温度+天气+预报缩略），可直接保存到手机
3. **双模型温度对比** — 折叠展开区域显示 GFS 与 ECMWF 模型预报差异，用阴影带表示不确定性
4. **太阳弧线动画** — SVG 绘制当日日出到日落弧线，小太阳图标实时标注当前位置
5. **AQI 健康仪表盘** — 环形进度图 + 颜色分级 + 健康建议气泡，用户友好度远超竞品
