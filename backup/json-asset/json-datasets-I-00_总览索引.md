<!-- json-datasets-I-00_总览索引.md -->

# json-datasets · I-00 总览索引

---

## 产品架构图

```
用户访问 /json/datasets
        │
        ▼
┌─────────────────────────────────────────────────────┐
│               分类导航栏 (Tab Filter)                 │
│  All │ Geographic │ Reference │ Config │ Testing     │
│  API Mocks │ Finance │ Science │ Sports │ DevOps     │
│  AI/ML │ Government │ Social │ IoT                   │
└─────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────┐
│             搜索栏 + 排序控件（记录数/大小/热度）       │
└─────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────┐
│             数据集卡片网格 (3列响应式)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ 分类角标  │  │ 分类角标  │  │ 分类角标  │          │
│  │ 数据集名  │  │ 数据集名  │  │ 数据集名  │          │
│  │ 描述文字  │  │ 描述文字  │  │ 描述文字  │          │
│  │ 字段预览  │  │ 字段预览  │  │ 字段预览  │          │
│  │ 大小/记录 │  │ 大小/记录 │  │ 大小/记录 │          │
│  │ Copy │ ✓ │  │ Copy │ ✓ │  │ Copy │ ✓ │          │
│  │ Download │  │ Download │  │ Download │          │
│  └──────────┘  └──────────┘  └──────────┘          │
└─────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────┐
│   点击卡片 → 详情侧边抽屉（Drawer）                    │
│   ├── 完整字段说明 + 类型                              │
│   ├── JSON 预览（语法高亮，可折叠）                     │
│   ├── 使用场景标签                                    │
│   ├── 相关数据集推荐                                   │
│   └── Copy / Validate / Download / API URL          │
└─────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────┐
│        底部工具推荐区（交叉引流到其他 JSON 工具）        │
└─────────────────────────────────────────────────────┘
```

---

## 竞品功能对标表

| 功能点 | JSONLint Datasets | 本次实现 | 差异化优势 |
|--------|-------------------|----------|------------|
| 数据集总数 | 47 个 | **85 个** | 新增 Finance、AI/ML、IoT、Government、Science、DevOps 等分类，覆盖更广 |
| 分类数量 | 6 类 | **14 类** | 细化分类，开发者可精准定位 |
| 搜索功能 | 无 | **实时全文搜索** | 按名称/描述/字段名即时过滤 |
| 排序功能 | 无 | **按大小/记录数/热度排序** | 提升大文件查找效率 |
| 字段预览 | 仅列名 | **字段名+类型+示例值** | 不下载就能评估数据质量 |
| 详情抽屉 | 无（跳转独立页） | **侧边 Drawer（不离页）** | 保持浏览上下文，体验更流畅 |
| JSON 在线预览 | 无 | **Drawer 内嵌语法高亮预览** | 所见即所得，减少不必要下载 |
| 相关推荐 | 无 | **基于分类的相关数据集推荐** | 引导用户发现更多数据 |
| API URL 直取 | 无 | **每个数据集提供 raw JSON URL** | CI/CD 场景可直接 fetch |
| 验证跳转 | Validate 按钮 → 独立页 | **Validate 按钮 → 直接在 JSON Validator 中打开** | 一键验证无需复制粘贴 |
| 分享 | 无 | **一键复制数据集 URL** | 便于团队分享 |
| 数据记录数展示 | 有 | **有，并注明数组/对象结构** | 避免误解单对象 config 类型 |
| 贡献入口 | GitHub Issue | GitHub Issue + PR 模板 | 降低贡献门槛 |
| 移动端适配 | 基础响应式 | **全面移动优化，卡片单列** | 移动开发场景友好 |
| 暗色模式 | 无 | **跟随系统 prefers-color-scheme** | 现代开发环境标配 |
| i18n | 仅英文 | **中文 + 英文** | 覆盖中国开发者市场 |

---

## Block 清单

| 文件名 | 核心内容 | 预估工时 |
|--------|----------|----------|
| `json-datasets-I-00_总览索引.md` | 架构图、竞品对标、路由规划、依赖、i18n Key 前缀、Sitemap | 2h |
| `json-datasets-I-01_路由_SEO_i18n_sitemap_ads_ga.md` | Go 路由、Handler、SEO head、广告位、GA 事件、i18n 全量 Key、sitemap | 4h |
| `json-datasets-I-02_首页Landing_数据集列表区.md` | HTML 骨架、分类 Tab、搜索栏、卡片网格、详情 Drawer、CSS 规范、验收标准 | 5h |
| `json-datasets-I-03_前端处理引擎.md` | 数据加载、过滤/搜索/排序引擎、Drawer 渲染、Copy/Download 逻辑、全量数据集定义 | 6h |
| `json-datasets-I-04_数据集定义与详情UI.md` | 85 个数据集完整元数据定义、字段 schema、卡片/Drawer UI 规范、验收标准 | 8h |

**总计工时：约 25 小时**

---

## 路由规划

```
主路由：
  GET /json/datasets                    → 数据集列表页（默认英文）
  GET /json/datasets?lang=zh            → 数据集列表页（中文）
  GET /json/datasets?lang=en            → 数据集列表页（英文，显式）
  GET /json/datasets/:slug              → 单个数据集详情页（SEO 独立 URL）
  GET /json/datasets/:slug?lang=zh      → 单个数据集详情页（中文）

静态资源（数据 JSON 文件）：
  GET /static/datasets/:slug.json       → 原始 JSON 文件直链（供 API URL 使用）

注：无独立 API 路由，数据集 JSON 通过静态文件服务提供
```

---

## 🔧 前端依赖

| 库 | 用途 | CDN 地址 |
|----|------|----------|
| highlight.js | Drawer 内 JSON 语法高亮 | `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js` |
| highlight.js CSS (github-dark) | 高亮主题 | `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css` |
| JSZip（可选） | 批量下载多个数据集为 ZIP | `https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js` |
| Fuse.js | 前端全文搜索（轻量、零依赖） | `https://cdnjs.cloudflare.com/ajax/libs/fuse.js/7.0.0/fuse.min.js` |

---

## i18n Key 前缀清单

| 命名空间前缀 | 说明 |
|-------------|------|
| `seo.*` | title、description、og:title、og:description |
| `hero.*` | 页面大标题、副标题、统计角标（总数/分类数） |
| `filter.*` | 分类 Tab 标签、搜索占位符、排序选项 |
| `card.*` | 字段标签、记录数、文件大小、Copy/Download/Validate 按钮 |
| `drawer.*` | 侧边抽屉标题、字段类型标签、API URL 标签、相关推荐标题 |
| `badge.*` | 分类标签文字（Geographic、Reference 等） |
| `status.*` | 复制成功提示、下载中、加载中 |
| `error.*` | 数据集加载失败、搜索无结果 |
| `contribute.*` | 贡献入口文字、GitHub 链接 |
| `faq.*` | FAQ 问题与答案 |
| `cta.*` | 底部工具推荐区文字 |
| `footer.*` | 页脚文字 |

---

## sitemap 新增条目

```xml
<!-- 列表页 -->
<url>
  <loc>https://toolboxnova.com/json/datasets</loc>
  <lastmod>2025-11-01</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>
</url>
<url>
  <loc>https://toolboxnova.com/json/datasets?lang=zh</loc>
  <lastmod>2025-11-01</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
<url>
  <loc>https://toolboxnova.com/json/datasets?lang=en</loc>
  <lastmod>2025-11-01</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>

<!-- 代表性数据集详情页（高流量关键词页） -->
<url>
  <loc>https://toolboxnova.com/json/datasets/http-status-codes</loc>
  <lastmod>2024-06-15</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.7</priority>
</url>
<url>
  <loc>https://toolboxnova.com/json/datasets/countries</loc>
  <lastmod>2024-03-20</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.7</priority>
</url>
<url>
  <loc>https://toolboxnova.com/json/datasets/programming-languages</loc>
  <lastmod>2024-09-10</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.7</priority>
</url>
<url>
  <loc>https://toolboxnova.com/json/datasets/mock-users</loc>
  <lastmod>2023-07-18</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.6</priority>
</url>
<url>
  <loc>https://toolboxnova.com/json/datasets/crypto-coins</loc>
  <lastmod>2025-02-28</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.7</priority>
</url>
```

---

## 设计风格定调

**主色系：**
```css
--color-primary:       #f59e0b;   /* 琥珀黄 - JSON 黄色调，呼应 JSON 语法着色 */
--color-primary-dark:  #d97706;
--color-primary-light: #fde68a;
--color-bg:            #0f0f0f;   /* 深黑背景，开发者偏好 */
--color-bg-card:       #1a1a1a;
--color-bg-card-hover: #242424;
--color-border:        #2e2e2e;
--color-text-primary:  #f5f5f5;
--color-text-muted:    #888;
--color-success:       #22c55e;
--color-info:          #3b82f6;
```

**分类角标配色（14 类各有独立色）：**
Geographic → 绿、Reference → 蓝、Config → 橙、Testing → 红、API Mocks → 紫、Finance → 金、Science → 青、Sports → 草绿、DevOps → 灰蓝、AI/ML → 玫红、Government → 深蓝、Social → 浅蓝、IoT → 橙红、Healthcare → 薄荷绿

**上传/交互区风格：** 无上传区（纯展示型页面），主交互为搜索 + 过滤 Tab。搜索框宽度占满 Hero 下方，带动态 placeholder 轮播（展示不同字段名作为示例搜索词）。

**结果列表布局：** 3 列 Card Grid，≤768px 降至 1 列，768px~1024px 为 2 列。卡片等高，底部操作栏对齐。

**差异化设计亮点：**
1. **JSON 语法色彩系** — 主色琥珀黄取自 JSON 字符串的经典高亮色，整套配色呼应代码编辑器 Dark 主题。
2. **分类角标渐变徽章** — 每个分类用独立渐变色徽章，卡片左上角显示，扫一眼即知数据类型。
3. **Drawer 零跳转体验** — 详情从右侧滑入，背景列表模糊但不消失，大大降低"迷路感"。
4. **动态占位搜索提示** — 搜索框 placeholder 每 2 秒切换为不同示例词（如 `Try "http status"` → `Try "mock users"` → `Try "crypto"`），引导发现。
5. **字段 Schema 可视化** — Drawer 内字段列表用彩色类型标签（string/number/boolean/array）区分，开发者一目了然。
