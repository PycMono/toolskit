<!-- color-tools-I-00_总览索引.md -->

# 🎨 Color Tools — 总览索引 (I-00)

> **工具名称**：`color-tools`
> **工具路由**：`/color/tools`（Hub 页）+ 12 子工具独立路由
> **主色调**：星空靛蓝 `#6366F1`（Indigo-500），搭配彩虹渐变 Accent
> **网站域名**：`toolboxnova.com`
> **分类归属**：多媒体（Multimedia）
> **功能描述**：全球最全面的纯前端颜色工具套件——集调色板生成器、拾色器、色轮、颜色转换器、对比度检查器、渐变生成器、图片取色器、色盲模拟器、颜色名称库、颜色混合器、Tailwind 颜色生成器、调色板可视化预览于一体。
> **技术约束**：纯前端处理 / CDN 依赖 / Go（Gin + Go Template）后端

---

## 一、产品架构图

```
┌──────────────────────────────────────────────────────────────────────┐
│                 toolboxnova.com/color/tools  (Hub 入口)              │
│                        ┌────────────┐                                │
│                        │  Hub 导航页  │                                │
│                        └─────┬──────┘                                │
│   ┌──────┬──────┬──────┬─────┼─────┬──────┬──────┐                  │
│   ▼      ▼      ▼      ▼     ▼     ▼      ▼      ▼                  │
│ ┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐                 │
│ │Pick ││Palet││Wheel││Conve││Contr││Gradi││Image│                 │
│ │拾色 ││生成 ││色轮 ││转换 ││对比 ││渐变 ││取色 │                 │
│ └──┬──┘└──┬──┘└──┬──┘└──┬──┘└──┬──┘└──┬──┘└──┬──┘                 │
│    └───┬──┘      │      │      │      │      │                      │
│   ┌────┼─────┬───┴───┬──┴──┬───┴──┐                                 │
│   ▼    ▼     ▼       ▼     ▼      ▼                                  │
│ ┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐                                │
│ │Blind││Names││Mixer││Tailw││Visua│                                │
│ │色盲 ││名称 ││混合 ││ind  ││lize │                                │
│ └──┬──┘└──┬──┘└──┬──┘└──┬──┘└──┬──┘                                │
│    └──────┴──────┴───┬──┴──────┘                                     │
│                      ▼                                                │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │          纯前端处理引擎层（Canvas / Web Worker）                │   │
│  │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │   │
│  │ │色彩空间  │ │色彩理论  │ │图像处理  │ │无障碍    │         │   │
│  │ │转换引擎  │ │和谐算法  │ │Canvas    │ │WCAG/APCA │         │   │
│  │ │HEX/RGB/  │ │互补/三角 │ │像素采样  │ │对比度    │         │   │
│  │ │HSL/HSV/  │ │类比/分裂 │ │K-means   │ │色盲矩阵  │         │   │
│  │ │CMYK/LAB/ │ │单色/方形 │ │聚类提取  │ │Brettel   │         │   │
│  │ │OKLCH/HWB │ │随机      │ │          │ │变换      │         │   │
│  │ └──────────┘ └──────────┘ └──────────┘ └──────────┘         │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                      ▼                                                │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │                 结果展示 & 导出层                               │   │
│  │  ● 实时色块预览          ● CSS/SCSS/Tailwind 代码一键复制      │   │
│  │  ● ASE/GPL 调色板导出    ● PNG/SVG 图片导出                    │   │
│  │  ● JSON/CSS Vars 批量导出 ● URL Hash 分享                     │   │
│  └───────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 二、竞品功能对标表

> 竞品：A = Coolors.co | B = HTMLColorCodes.com | C = Adobe Color | D = Paletton | E = ColorKit | F = oklch.com

| 功能点 | A(Coolors) | B(HTMLColor) | C(Adobe) | D(Paletton) | E(ColorKit) | F(oklch) | **本次实现** | 差异化说明 |
|--------|:---------:|:----------:|:-------:|:---------:|:---------:|:------:|:----------:|-----------|
| **拾色器(Color Picker)** | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | 支持10+色彩空间含OKLCH/LAB/HWB |
| **调色板生成(空格键)** | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | 空格键+和谐规则+URL分享三合一 |
| **色轮和谐(Color Wheel)** | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | 6种和谐规则+实时CSS输出 |
| **颜色转换器** | 部分 | ✅(2种) | 部分 | ❌ | ❌ | ✅ | ✅ | **10种格式全互转**(独家OKLCH/HWB/XYZ) |
| **WCAG对比度检查** | ✅ | ✅ | ✅AA/AAA | ✅ | ✅ | ❌ | ✅ | WCAG 2.1 + **APCA双标准**(独家) |
| **渐变生成器** | ✅基础 | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | **8种色彩空间插值**(OKLCH消除死区) |
| **图片取色** | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | K-means聚类+像素精确取色双模式 |
| **色盲模拟** | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | **8种色觉缺陷模拟**(含全色盲) |
| **颜色名称库** | ✅列表 | ✅(140) | ❌ | ❌ | ❌ | ❌ | ✅ | **2000+命名颜色**模糊搜索 |
| **颜色混合器** | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ | 多种混合模式(加色/减色/正片叠底) |
| **Tailwind颜色** | ✅NEW | ✅图表 | ❌ | ❌ | ❌ | ❌ | ✅ | base→50-950色阶+实时UI组件预览 |
| **调色板可视化** | ✅Pro | ❌ | ❌ | ✅基础 | ❌ | ❌ | ✅ | **免费**真实UI模板预览 |
| **AI色彩助手** | ✅Pro | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | 文本描述→调色板(纯前端prompt) |
| **批量导出格式** | ✅PDF/PNG/SVG | ❌ | ✅ASE | ❌ | ❌ | ❌ | ✅ | CSS/SCSS/JSON/ASE/GPL/PNG/SVG/TW全覆盖 |
| **URL分享调色板** | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | URL hash编码一键分享 |
| **键盘快捷键** | ✅空格 | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | 完整快捷键Space/L/C/←→/Del |
| **Dark Mode** | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ | 自动跟随系统+手动切换 |
| **OKLCH色彩空间** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | **独家完整支持CSS Color Level 4** |
| **APCA对比度** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | **全网独家**WCAG 3.0候选标准 |
| **感知均匀渐变** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | **全网独家**OKLCH插值消灭灰色死区 |
| **纯前端/零上传** | ❌(有后端) | ✅ | ❌(需登录) | ✅ | ❌ | ✅ | ✅ | 100%浏览器端处理零追踪 |
| **拖拽排序调色板** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | Sortable.js触摸友好 |

---

## 三、Block 清单

| 文件名 | 核心内容 | 预估工时 |
|--------|---------|---------|
| `color-tools-I-00_总览索引.md` | 架构图、竞品对标、依赖清单、设计定调 | 4h |
| `color-tools-I-01_路由_SEO_i18n_sitemap_ads_ga.md` | Go路由、SEO Head、广告位、GA、全量中英文i18n | 8h |
| `color-tools-I-02_首页Landing_上传区.md` | Hub Landing页完整HTML/CSS、12工具卡片、图片取色上传区 | 14h |
| `color-tools-I-03_前端处理引擎.md` | 色彩转换核心、和谐算法、Canvas取色、WCAG/APCA计算、渐变插值 | 22h |
| `color-tools-I-04_结果列表UI.md` | 调色板横条渲染、导出弹窗、色盲Before/After对比、数据流图 | 12h |
| **总计** | | **60h** |

---

## 四、路由规划

| 路由 | 说明 | 语言变体 |
|------|------|---------|
| `/color/tools` | Hub首页 | `?lang=zh` / `?lang=en` |
| `/color/picker` | 高级拾色器 | `?lang=zh` / `?lang=en` |
| `/color/palette` | 调色板生成器 | `?lang=zh` / `?lang=en` |
| `/color/wheel` | 色轮 | `?lang=zh` / `?lang=en` |
| `/color/converter` | 颜色转换器 | `?lang=zh` / `?lang=en` |
| `/color/contrast` | 对比度检查器 | `?lang=zh` / `?lang=en` |
| `/color/gradient` | 渐变生成器 | `?lang=zh` / `?lang=en` |
| `/color/image-picker` | 图片取色器 | `?lang=zh` / `?lang=en` |
| `/color/blindness` | 色盲模拟器 | `?lang=zh` / `?lang=en` |
| `/color/names` | 颜色名称库 | `?lang=zh` / `?lang=en` |
| `/color/mixer` | 颜色混合器 | `?lang=zh` / `?lang=en` |
| `/color/tailwind` | Tailwind颜色生成器 | `?lang=zh` / `?lang=en` |
| `/color/visualizer` | 调色板可视化 | `?lang=zh` / `?lang=en` |

> 无独立 API 路由，所有计算在浏览器端完成。

---

## 五、🔧 前端依赖

| 库 | 版本 | 用途 | CDN 地址 |
|----|------|------|---------|
| chroma.js | 2.6.0 | 色彩空间转换/插值/混合核心 | `https://cdnjs.cloudflare.com/ajax/libs/chroma-js/2.6.0/chroma.min.js` |
| colorjs.io | 0.5.2 | OKLCH/LAB/CSS Color Level 4 | `https://cdn.jsdelivr.net/npm/colorjs.io@0.5.2/dist/color.global.min.js` |
| FileSaver.js | 2.0.5 | 客户端文件下载(导出PNG/SVG/JSON) | `https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js` |
| JSZip | 3.10.1 | 批量导出ZIP打包 | `https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js` |
| html2canvas | 1.4.1 | 调色板截图导出PNG | `https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js` |
| Sortable.js | 1.15.3 | 调色板拖拽排序 | `https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.3/Sortable.min.js` |

---

## 六、i18n Key 前缀清单

| 前缀 | 覆盖范围 |
|------|---------|
| `seo.*` | 页面title/description/OG |
| `hero.*` | Hero区标题/副标题/Badge |
| `nav.*` | Hub导航标签 |
| `picker.*` | 拾色器模块 |
| `palette.*` | 调色板生成器模块 |
| `wheel.*` | 色轮模块 |
| `converter.*` | 转换器模块 |
| `contrast.*` | 对比度检查模块 |
| `gradient.*` | 渐变生成器模块 |
| `imagepicker.*` | 图片取色模块 |
| `blindness.*` | 色盲模拟模块 |
| `names.*` | 颜色名称库模块 |
| `mixer.*` | 颜色混合器模块 |
| `tailwind.*` | Tailwind生成器模块 |
| `visualizer.*` | 可视化预览模块 |
| `export.*` | 导出相关 |
| `error.*` | 错误提示 |
| `feature.*` | 三特性卡片 |
| `faq.*` | FAQ |
| `status.*` | 处理状态 |
| `toast.*` | Toast通知 |
| `keyboard.*` | 键盘快捷键提示 |

---

## 七、sitemap 新增条目

```xml
<url>
  <loc>https://toolboxnova.com/color/tools</loc>
  <lastmod>2025-09-15</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>
</url>
<url>
  <loc>https://toolboxnova.com/color/tools?lang=zh</loc>
  <lastmod>2025-09-15</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
<url>
  <loc>https://toolboxnova.com/color/tools?lang=en</loc>
  <lastmod>2025-09-15</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
<url>
  <loc>https://toolboxnova.com/color/picker</loc>
  <lastmod>2025-07-20</lastmod><changefreq>weekly</changefreq><priority>0.9</priority>
</url>
<url>
  <loc>https://toolboxnova.com/color/palette</loc>
  <lastmod>2025-06-11</lastmod><changefreq>weekly</changefreq><priority>0.9</priority>
</url>
<url>
  <loc>https://toolboxnova.com/color/contrast</loc>
  <lastmod>2025-04-03</lastmod><changefreq>weekly</changefreq><priority>0.8</priority>
</url>
<url>
  <loc>https://toolboxnova.com/color/gradient</loc>
  <lastmod>2024-11-28</lastmod><changefreq>weekly</changefreq><priority>0.8</priority>
</url>
<url>
  <loc>https://toolboxnova.com/color/converter</loc>
  <lastmod>2024-08-15</lastmod><changefreq>weekly</changefreq><priority>0.8</priority>
</url>
<url>
  <loc>https://toolboxnova.com/color/tailwind</loc>
  <lastmod>2025-03-22</lastmod><changefreq>weekly</changefreq><priority>0.8</priority>
</url>
<url>
  <loc>https://toolboxnova.com/color/image-picker</loc>
  <lastmod>2024-10-05</lastmod><changefreq>weekly</changefreq><priority>0.8</priority>
</url>
<url>
  <loc>https://toolboxnova.com/color/wheel</loc>
  <lastmod>2024-05-18</lastmod><changefreq>monthly</changefreq><priority>0.7</priority>
</url>
<url>
  <loc>https://toolboxnova.com/color/blindness</loc>
  <lastmod>2024-06-07</lastmod><changefreq>monthly</changefreq><priority>0.7</priority>
</url>
<url>
  <loc>https://toolboxnova.com/color/names</loc>
  <lastmod>2024-02-19</lastmod><changefreq>monthly</changefreq><priority>0.7</priority>
</url>
<url>
  <loc>https://toolboxnova.com/color/mixer</loc>
  <lastmod>2023-11-14</lastmod><changefreq>monthly</changefreq><priority>0.7</priority>
</url>
<url>
  <loc>https://toolboxnova.com/color/visualizer</loc>
  <lastmod>2025-01-09</lastmod><changefreq>monthly</changefreq><priority>0.7</priority>
</url>
```

---

## 八、设计风格定调

### 色值体系

| 用途 | 色值 | 说明 |
|------|------|------|
| 主色(Primary) | `#6366F1` | Indigo-500，沉稳不抢颜色展示 |
| 主色Hover | `#4F46E5` | Indigo-600 |
| 主色浅底 | `#EEF2FF` | Indigo-50，卡片浅背景 |
| 成功色 | `#10B981` | Emerald-500, WCAG Pass |
| 警告色 | `#F59E0B` | Amber-500, WCAG AA Only |
| 错误色 | `#EF4444` | Red-500, WCAG Fail |
| 背景色(Light) | `#FAFBFC` | 近白 |
| 背景色(Dark) | `#0F172A` | Slate-900 |
| 卡片(Light) | `#FFFFFF` | 纯白 |
| 卡片(Dark) | `#1E293B` | Slate-800 |
| 边框色 | `#E2E8F0` | Slate-200 |
| 文本主色 | `#0F172A` | Slate-900 |
| 文本次色 | `#64748B` | Slate-500 |
| 阴影 | `0 1px 3px rgba(0,0,0,.08), 0 4px 16px rgba(0,0,0,.04)` | 柔和双层 |
| 圆角 | `12px`(卡片) / `8px`(按钮) / `50%`(色块) | — |

### 上传区交互风格（图片取色子工具）

- 彩虹渐变虚线边框：`conic-gradient` 旋转彩虹 + dashed，传达"颜色"品牌
- 拖拽悬停态：虚线→实线 + 半透明主色叠加 + 脉冲动画
- 三种输入：拖拽 / 点击上传 / 剪贴板粘贴（Ctrl+V）
- 上传后图片铺满，鼠标变放大镜十字准心

### 结果列表布局

- Hub页：3×4 网格卡片展示12个子工具入口
- 子工具页：左操作+右预览双栏（移动端堆叠）
- 调色板结果：全宽横条色条+悬停展开信息行

### 🎨 差异化设计亮点

1. **彩虹微光 Hero 背景**：极淡`conic-gradient`彩虹+`backdrop-filter:blur(80px)`磨砂质感——一眼"颜色工具"
2. **色彩空间芯片标签**：色块右下微型芯片显示格式(HEX/RGB…)，点击切换带flip动效
3. **键盘提示浮层**：右下角常驻半透明快捷键条(Space=生成/L=锁定/←→=微调)
4. **OKLCH 感知均匀渐变**：渐变生成器独家OKLCH插值，消除传统HSL灰暗死区
5. **APCA+WCAG 双轨对比度**：同时展示WCAG 2.1比值&APCA新标准分数
6. **Dark Mode 全局自适应**：自动`prefers-color-scheme`+手动切换，颜色展示带gamma校正
