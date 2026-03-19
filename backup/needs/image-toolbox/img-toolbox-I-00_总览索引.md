<!-- img-toolbox-I-00_总览索引.md -->

# 图片处理工具箱 · 总览索引

> 工具集标识符：`img-toolbox`  
> 网站域名：toolboxnova.com  
> 竞品参考：https://www.iloveimg.com/  
> 主色调：`#FF6B35`（活力橙）  
> 技术栈：纯前端 + CDN + Go（Gin + Go Template）

---

## 一、产品架构图

```
用户入口
  │
  ├─ /img/crop           裁剪图片
  ├─ /img/convert-to-jpg 转换为 JPG
  ├─ /img/jpg-to-image   JPG 转其他格式
  ├─ /img/photo-editor   图片编辑器
  ├─ /img/remove-bg      移除背景
  ├─ /img/watermark      添加水印
  └─ /img/rotate         旋转/翻转图片
         │
         ▼
  ┌─────────────────────────────┐
  │     文件上传 & 格式识别      │
  │  (File API / Drag & Drop)   │
  └──────────────┬──────────────┘
                 │
         ┌───────▼────────┐
         │   处理引擎分发   │
         └───────┬────────┘
                 │
   ┌─────────────┼─────────────┐
   │             │             │
   ▼             ▼             ▼
Canvas API    WASM 引擎    第三方 CDN 库
(裁剪/旋转/    (remove.bg   (Cropper.js /
 水印/转换)     替代方案)    Fabric.js)
   │             │             │
   └─────────────┴─────────────┘
                 │
         ┌───────▼────────┐
         │   结果展示区    │
         │  (卡片列表/     │
         │   Before&After) │
         └───────┬────────┘
                 │
         ┌───────▼────────┐
         │  下载输出       │
         │ (单文件 / JSZip │
         │  批量打包)      │
         └────────────────┘
```

---

## 二、竞品功能对标表

| 功能点 | iLoveIMG | 本次实现 | 差异化说明 |
|--------|----------|----------|------------|
| 裁剪图片（crop） | ✅ 支持比例/自由裁剪 | ✅ 完整支持 + 自定义像素输入 | 新增像素精确输入框 |
| 转换为 JPG（to-jpg） | ✅ 多格式→JPG | ✅ 支持 PNG/WEBP/GIF/BMP/SVG→JPG | 新增质量滑块实时预览 |
| JPG 转其他格式 | ✅ JPG→PNG/GIF/BMP等 | ✅ 同等支持 + WEBP 输出 | 新增 WEBP 格式支持 |
| 图片编辑器（photo-editor） | ✅ 基础调整 | ✅ 亮度/对比度/饱和度/锐化/模糊 | 新增实时 Canvas 预览 |
| 移除背景（remove-bg） | ✅ AI 抠图（需联网） | ✅ 纯前端 WASM 抠图 | **完全本地处理，隐私更安全** |
| 添加水印（watermark） | ✅ 文字/图片水印 | ✅ 文字+图片双模式 + 位置矩阵 | 新增 9 宫格位置选择器 |
| 旋转/翻转（rotate） | ✅ 90°旋转 + 翻转 | ✅ 任意角度 + 水平/垂直翻转 | 新增任意角度输入 |
| 批量处理 | ✅ 支持 | ✅ 支持（并发数 3） | 相同 |
| 本地处理（无上传） | ✅ | ✅ | 相同，隐私原则一致 |
| 批量下载（ZIP） | ✅ | ✅ JSZip 打包 | 相同 |
| 多语言（i18n） | ✅ 多语言 | ✅ 中/英双语 | 相同 |
| 广告接入 | ✅ AdSense | ✅ AdSense（AdsEnabled 开关） | 相同 |
| Before/After 预览 | ❌ 无 | ✅ 滑块对比弹窗 | **差异化亮点** |
| 处理进度条 | ✅ 简单进度 | ✅ 伪进度动画 0→100% | 体验更流畅 |
| 移动端适配 | ✅ | ✅ 响应式布局 | 相同 |

---

## 三、Block 清单

| 文件名 | 核心内容 | 预估工时 |
|--------|----------|----------|
| `img-toolbox-I-00_总览索引.md` | 架构图、竞品对标、路由规划、依赖清单、i18n前缀、sitemap、设计风格 | 2h |
| `img-toolbox-I-01_路由_SEO_i18n_sitemap_ads_ga.md` | Go路由、Handler、SEO head模板、广告、GA、i18n全量key、sitemap XML、导航新增 | 6h |
| `img-toolbox-I-02_首页Landing_上传区.md` | 竞品UI对标、完整HTML骨架、CSS规范、验收Checklist | 8h |
| `img-toolbox-I-03_前端处理引擎.md` | 技术选型、引擎架构、各工具处理函数、并发调度、下载逻辑 | 12h |
| `img-toolbox-I-04_结果列表UI.md` | 结果卡片渲染、Before/After弹窗、CSS规范、数据流图、验收Checklist | 6h |

**总计预估工时：34h**

---

## 四、路由规划

| 路由 | 说明 | 语言变体 |
|------|------|----------|
| `/img/crop` | 裁剪图片 | `?lang=zh` / `?lang=en` |
| `/img/convert-to-jpg` | 转换为 JPG | `?lang=zh` / `?lang=en` |
| `/img/jpg-to-image` | JPG 转其他格式 | `?lang=zh` / `?lang=en` |
| `/img/photo-editor` | 图片编辑器 | `?lang=zh` / `?lang=en` |
| `/img/remove-bg` | 移除图片背景 | `?lang=zh` / `?lang=en` |
| `/img/watermark` | 添加水印 | `?lang=zh` / `?lang=en` |
| `/img/rotate` | 旋转/翻转图片 | `?lang=zh` / `?lang=en` |

> 无独立 API 路由，全部为纯前端处理。

---

## 五、前端依赖（CDN）

| 库名 | 用途 | CDN 地址 |
|------|------|----------|
| Cropper.js | 裁剪图片交互 | `https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.js` |
| Cropper.js CSS | 裁剪样式 | `https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.css` |
| Fabric.js | 图片编辑器（photo-editor） | `https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js` |
| JSZip | 批量下载打包 | `https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js` |
| @imgly/background-removal | 浏览器端 AI 移除背景 | `https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.4.5/dist/browser/index.js` |

---

## 六、i18n Key 前缀清单

每个子工具共享以下命名空间前缀，工具名用具体路由标识替换 `{tool}`：

| 前缀 | 说明 |
|------|------|
| `seo.{tool}.*` | title / description / keywords |
| `hero.{tool}.*` | 页面标题、副标题、badge文案 |
| `upload.{tool}.*` | 上传区文案、按钮、提示 |
| `options.{tool}.*` | 选项面板各控件标签 |
| `status.{tool}.*` | 处理状态文案（等待/处理中/完成/失败） |
| `result.{tool}.*` | 结果区标题、统计文案 |
| `download.{tool}.*` | 下载按钮、批量下载文案 |
| `error.{tool}.*` | 各类错误提示 |
| `feature.{tool}.*` | 三特性卡片文案 |
| `faq.{tool}.*` | FAQ 问题与答案 |

工具标识符对应关系：
- 裁剪 → `crop`
- 转JPG → `to_jpg`
- JPG转换 → `jpg_to`
- 编辑器 → `editor`
- 移除背景 → `remove_bg`
- 水印 → `watermark`
- 旋转 → `rotate`

---

## 七、Sitemap 新增条目

```xml
<!-- 裁剪图片 -->
<url>
  <loc>https://toolboxnova.com/img/crop</loc>
  <lastmod>2024-06-15</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>
</url>
<url>
  <loc>https://toolboxnova.com/img/crop?lang=zh</loc>
  <lastmod>2024-06-15</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
<url>
  <loc>https://toolboxnova.com/img/crop?lang=en</loc>
  <lastmod>2024-06-15</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>

<!-- 转换为 JPG -->
<url>
  <loc>https://toolboxnova.com/img/convert-to-jpg</loc>
  <lastmod>2023-09-20</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>
</url>
<url>
  <loc>https://toolboxnova.com/img/convert-to-jpg?lang=zh</loc>
  <lastmod>2023-09-20</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
<url>
  <loc>https://toolboxnova.com/img/convert-to-jpg?lang=en</loc>
  <lastmod>2023-09-20</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>

<!-- JPG 转其他格式 -->
<url>
  <loc>https://toolboxnova.com/img/jpg-to-image</loc>
  <lastmod>2025-03-10</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>
</url>
<url>
  <loc>https://toolboxnova.com/img/jpg-to-image?lang=zh</loc>
  <lastmod>2025-03-10</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
<url>
  <loc>https://toolboxnova.com/img/jpg-to-image?lang=en</loc>
  <lastmod>2025-03-10</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>

<!-- 图片编辑器 -->
<url>
  <loc>https://toolboxnova.com/img/photo-editor</loc>
  <lastmod>2024-11-05</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>
</url>
<url>
  <loc>https://toolboxnova.com/img/photo-editor?lang=zh</loc>
  <lastmod>2024-11-05</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
<url>
  <loc>https://toolboxnova.com/img/photo-editor?lang=en</loc>
  <lastmod>2024-11-05</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>

<!-- 移除背景 -->
<url>
  <loc>https://toolboxnova.com/img/remove-bg</loc>
  <lastmod>2023-07-18</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>
</url>
<url>
  <loc>https://toolboxnova.com/img/remove-bg?lang=zh</loc>
  <lastmod>2023-07-18</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
<url>
  <loc>https://toolboxnova.com/img/remove-bg?lang=en</loc>
  <lastmod>2023-07-18</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>

<!-- 添加水印 -->
<url>
  <loc>https://toolboxnova.com/img/watermark</loc>
  <lastmod>2025-08-22</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>
</url>
<url>
  <loc>https://toolboxnova.com/img/watermark?lang=zh</loc>
  <lastmod>2025-08-22</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
<url>
  <loc>https://toolboxnova.com/img/watermark?lang=en</loc>
  <lastmod>2025-08-22</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>

<!-- 旋转图片 -->
<url>
  <loc>https://toolboxnova.com/img/rotate</loc>
  <lastmod>2024-02-14</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>
</url>
<url>
  <loc>https://toolboxnova.com/img/rotate?lang=zh</loc>
  <lastmod>2024-02-14</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
<url>
  <loc>https://toolboxnova.com/img/rotate?lang=en</loc>
  <lastmod>2024-02-14</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
```

---

## 八、设计风格定调

### 色彩体系

| 变量名 | 色值 | 用途 |
|--------|------|------|
| `--color-primary` | `#FF6B35` | 主色，CTA按钮、强调元素 |
| `--color-primary-light` | `#FF8C5A` | 悬浮态、渐变起点 |
| `--color-primary-dark` | `#E55A26` | 按下态 |
| `--color-bg` | `#F9FAFB` | 页面背景 |
| `--color-surface` | `#FFFFFF` | 卡片/面板背景 |
| `--color-border` | `#E5E7EB` | 边框、分隔线 |
| `--color-text-primary` | `#111827` | 主要文字 |
| `--color-text-secondary` | `#6B7280` | 次要文字 |
| `--color-success` | `#10B981` | 处理成功态 |
| `--color-error` | `#EF4444` | 错误态 |
| `--color-warning` | `#F59E0B` | 警告态 |
| `--shadow-card` | `0 1px 3px rgba(0,0,0,.08), 0 4px 12px rgba(0,0,0,.05)` | 卡片阴影 |
| `--radius-lg` | `16px` | 大圆角（卡片） |
| `--radius-md` | `10px` | 中圆角（按钮） |
| `--radius-sm` | `6px` | 小圆角（badge） |

### 上传区交互风格

- 默认态：`2px dashed --color-border`，虚线边框，居中图标 + 文字引导
- 拖拽悬停态：边框变为 `--color-primary`，背景 `rgba(255,107,53,.06)`，scale 微动效 1.01
- 已选文件态：边框实线，显示文件数量 badge

### 结果列表布局

- 三列 Grid 卡片：缩略图（64×64px）/ 文件信息（文件名+大小对比+节省率）/ 操作按钮组
- 状态色条：左侧 3px 竖线区分 waiting（灰）/ processing（橙）/ done（绿）/ error（红）
- 批量操作栏固定在结果区底部，含"全部下载 ZIP"和"清空"按钮

### 差异化设计亮点

1. **Before/After 滑块对比弹窗**：点击结果卡片缩略图，弹出左右滑块对比原图与处理结果，iLoveIMG 无此功能
2. **9 宫格水印位置选择器**：水印工具提供可视化 3×3 位置矩阵，点击即选，体验优于下拉菜单
3. **实时 Canvas 预览**：photo-editor 工具的亮度/对比度/饱和度调节，调整滑块时实时渲染 500ms 防抖预览
4. **纯本地 AI 移除背景**：使用 `@imgly/background-removal` WASM 方案，完全在浏览器运行，无需联网调用外部 AI API，隐私更安全
5. **处理进度伪动画**：0→85% 随机递增，完成跳 100%，配合橙色进度条动效，体验流畅不卡顿
