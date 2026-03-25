Weather Dashboard Layout
· typescript
export default function WeatherDashboardLayout() {
const hourly = [
{ time: '12 a.m', temp: 16, rain: 0 },
{ time: '1 a.m', temp: 16, rain: 0 },
{ time: '2 a.m', temp: 15, rain: 0 },
{ time: '3 a.m', temp: 15, rain: 0 },
{ time: '4 a.m', temp: 15, rain: 0 },
{ time: '5 a.m', temp: 15, rain: 0 },
{ time: '6 a.m', temp: 15, rain: 0 },
{ time: '7 a.m', temp: 15, rain: 0 },
{ time: '8 a.m', temp: 16, rain: 0 },
];


const daily = [
{ day: 'Today', temp: 22 },
{ day: 'Wed', temp: 17 },
{ day: 'Thu', temp: 23 },
{ day: 'Fri', temp: 19 },
{ day: 'Sat', temp: 19 },
{ day: 'Sun', temp: 18, active: true },
{ day: 'Mon', temp: 18 },
{ day: 'Tue', temp: 16 },
];


const metrics = [
['Wind', '2 m/s WSW'],
['Humidity', '67%'],
['Visibility', '10 km'],
['Pressure', '1008 hPa'],
['UV Index', '4 UV'],
['Dew Point', '11°C'],
];


return (
<div
className="min-h-screen bg-cover bg-center text-zinc-900"
style={{
backgroundImage:
"linear-gradient(rgba(28,33,45,0.35), rgba(28,33,45,0.45)), url('https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=1600&auto=format&fit=crop')",
}}
>
<div className="mx-auto max-w-6xl px-6 py-10">
<header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
<div>
<h1 className="text-4xl font-bold tracking-tight text-white">Weather forecast</h1>
<p className="mt-2 text-sm text-white/75">Global real-time weather for any city</p>
</div>


          <div className="flex w-full max-w-xl items-center gap-3 rounded-2xl border border-white/20 bg-white/85 px-4 py-3 shadow-lg backdrop-blur-md">
            <span className="text-lg">🔎</span>
            <input
              className="w-full bg-transparent text-base outline-none placeholder:text-zinc-500"
              placeholder="Search city"
              defaultValue="Chengdu"
            />
          </div>
        </header>


        <div className="mb-6 flex flex-wrap gap-3">
          <div className="inline-flex rounded-full bg-white/80 p-1 backdrop-blur-md shadow-md">
            <button className="rounded-full bg-white px-4 py-2 text-sm font-semibold shadow">°C</button>
            <button className="rounded-full px-4 py-2 text-sm text-zinc-500">°F</button>
          </div>


          <div className="flex min-w-0 flex-1 gap-3 overflow-x-auto pb-1">
            {daily.map((item) => (
              <div
                key={item.day}
                className={`min-w-[110px] rounded-2xl border px-4 py-3 shadow-md backdrop-blur-md ${
                  item.active
                    ? 'border-orange-400 bg-orange-500 text-white'
                    : 'border-white/20 bg-white/20 text-white'
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-sm font-medium">
                  <span>{item.day}</span>
                  <span>{item.temp}°</span>
                </div>
                <div className="mt-2 text-xs opacity-90">⛅ Partly cloudy</div>
              </div>
            ))}
          </div>
        </div>


        <main className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <section className="rounded-[28px] bg-white/90 p-4 shadow-2xl backdrop-blur-xl">
            <div className="relative overflow-hidden rounded-[24px]">
              <img
                src="https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=1200&auto=format&fit=crop"
                alt="Rainy weather"
                className="h-72 w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/5" />
              <div className="absolute left-5 right-5 top-5 flex justify-end text-white/90">
                <div className="text-sm font-medium">Sun, Mar 29</div>

对，这个问题本质不是“天气数据展示不出来”，而是信息层级和布局结构错了。

你现在图二的问题主要有这几个：

整个页面按单列往下堆
导致用户第一眼看不到重点，温度、天气状态、小时预报都被拉成长页面。

主信息区没有做左右分栏
OpenWeather 那种舒服感，核心就是：

左边：当前天气卡片

右边：小时预报 / 趋势

上面：搜索 + 单位切换 + 未来几天 tabs

卡片之间没有明确主次
当前温度应该最大最抢眼，附属指标像湿度、风速、气压应该退到次级视觉层。

页面宽度利用不够
你的内容其实适合做成一个居中的 dashboard，而不是一整列通栏往下排。

我已经按你想要的方向做了一个参考版布局，结构就是照着你发的第一张那种思路去组织的：

顶部：标题 + 搜索框

第二行：摄氏/华氏切换 + 日预报横向 tabs

主体：左侧当前天气大卡片，右侧小时预报卡片

左卡片下方：风速、湿度、能见度、气压、UV、露点做成网格小卡片

右卡片：折线趋势 + 小时卡片横排

我把这个做成了一个可直接改的 React 版画布，你可以直接在旁边看结构，然后把你现有页面替换成同样的布局骨架。

你接下来改页面时，建议直接按这个布局原则落地：

Page
├─ Header
│  ├─ Title
│  └─ Search
├─ Toolbar
│  ├─ Unit Switch
│  └─ Daily Forecast Tabs
└─ Main Grid
├─ Left: Current Weather Card
│  ├─ Hero Image / Background
│  ├─ Temperature
│  ├─ Condition
│  └─ Metrics Grid
└─ Right: Hourly Forecast Card
├─ Title
├─ Trend Chart
└─ Hourly Items Grid


你现在最该改的不是颜色，而是这几个 CSS / 布局点：

.main {
display: grid;
grid-template-columns: 360px 1fr;
gap: 24px;
}

@media (max-width: 1200px) {
.main {
grid-template-columns: 1fr;
}
}

.daily-tabs {
display: flex;
gap: 12px;
overflow-x: auto;
}

.metrics-grid {
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: 12px;
}

.hourly-grid {
display: grid;
grid-template-columns: repeat(9, minmax(90px, 1fr));
gap: 12px;
}


视觉上你也可以直接照这个方向统一：

背景图保留，但加一层深色蒙版，别让背景抢内容

内容卡片统一大圆角，比如 24px~28px

主卡片白色半透明，带一点模糊

当前温度字号最大

指标卡片用浅米色 / 浅灰做弱对比

日预报做成横向 pill tab，而不是纵向列表

如果你愿意，我下一步可以直接帮你把你现有页面代码改成这种布局。你把当前的 HTML/CSS/React/Vue 代码贴给我，我可以按你这个目标样式直接改。