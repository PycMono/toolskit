# Block A-02 · AI 内容检测器 — Hero 区域 UI

> **所属模块**：AI 内容检测器（/ailab/detector）  
> **竞品参考**：https://gptzero.me（深色渐变 Hero）  
> **预估工时**：2h  
> **依赖**：A-01（路由与 i18n 已配置）  
> **交付粒度**：仅负责 Hero 视觉区域的 HTML + CSS，无交互逻辑

---

## 1. 竞品截图分析（gptzero.me Hero）

| 元素 | 竞品实现 | 我们的实现 |
|------|---------|----------|
| 背景 | 深紫蓝渐变（#1e1b4b → #4f46e5） | 完全一致 |
| 标题 | 白色大字 + Shield 图标 | 完全一致 |
| 副标题 | 灰白色小字 | 完全一致 |
| 信任徽章 | 3个横排徽章（Users / Accuracy / Free） | 完全一致 |
| 间距 | 上下 padding 60px/40px | 完全一致 |

---

## 2. HTML 模板

```html
<!-- templates/ailab/detector.html — Hero 区域 -->

<section class="detector-hero">
  <div class="container">

    <!-- 图标 + 标题 -->
    <div class="detector-hero__header">
      <div class="detector-hero__icon">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
             xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7l-9-5z"
                fill="rgba(255,255,255,0.2)" stroke="white" stroke-width="2"/>
          <path d="M9 12l2 2 4-4" stroke="white" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h1 class="detector-hero__title">
        {{ t .Lang "ailab.detector.hero.title" }}
      </h1>
    </div>

    <!-- 副标题 -->
    <p class="detector-hero__subtitle">
      {{ t .Lang "ailab.detector.hero.subtitle" }}
    </p>

    <!-- 信任徽章 -->
    <div class="detector-hero__badges">
      <div class="trust-badge">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3z"/>
        </svg>
        {{ t .Lang "ailab.detector.hero.badge1" }}
      </div>
      <div class="trust-badge">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
        </svg>
        {{ t .Lang "ailab.detector.hero.badge2" }}
      </div>
      <div class="trust-badge">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
        </svg>
        {{ t .Lang "ailab.detector.hero.badge3" }}
      </div>
    </div>

  </div>
</section>
```

---

## 3. CSS 样式

```css
/* static/css/detector.css */

/* ── Hero 区域 ─────────────────────────────────── */
.detector-hero {
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #4f46e5 100%);
  padding: 64px 0 48px;
  color: #ffffff;
  text-align: center;
  position: relative;
  overflow: hidden;
}

/* 背景装饰光晕（参考 gptzero 背景效果） */
.detector-hero::before {
  content: '';
  position: absolute;
  top: -120px;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%);
  pointer-events: none;
}

.detector-hero__header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-bottom: 16px;
}

.detector-hero__icon {
  width: 52px;
  height: 52px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.2);
}

.detector-hero__title {
  font-size: 2.5rem;       /* 40px */
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #ffffff;
  margin: 0;
  line-height: 1.15;
}

.detector-hero__subtitle {
  font-size: 1.125rem;     /* 18px */
  color: rgba(255, 255, 255, 0.75);
  max-width: 560px;
  margin: 0 auto 32px;
  line-height: 1.6;
}

/* 信任徽章 */
.detector-hero__badges {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}

.trust-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  padding: 6px 16px;
  font-size: 0.875rem;   /* 14px */
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  white-space: nowrap;
}

/* ── 响应式 ─────────────────────────────────────── */
@media (max-width: 640px) {
  .detector-hero {
    padding: 40px 16px 32px;
  }
  .detector-hero__title {
    font-size: 1.75rem;
  }
  .detector-hero__header {
    flex-direction: column;
    gap: 10px;
  }
  .detector-hero__badges {
    gap: 10px;
  }
  .trust-badge {
    font-size: 0.8rem;
    padding: 5px 12px;
  }
}
```

---

## 4. i18n 翻译 Key（本 Block 新增）

### locales/zh.json

```json
{
  "ailab.detector.hero.title":    "AI 内容检测器",
  "ailab.detector.hero.subtitle": "使用先进的 AI 技术，精准检测文本是否由 AI 生成，支持 ChatGPT、GPT-4、Gemini、Claude 等主流模型",
  "ailab.detector.hero.badge1":   "1000 万+ 用户信赖",
  "ailab.detector.hero.badge2":   "99% 准确率",
  "ailab.detector.hero.badge3":   "完全免费"
}
```

### locales/en.json

```json
{
  "ailab.detector.hero.title":    "AI Content Detector",
  "ailab.detector.hero.subtitle": "Accurately detect AI-generated text from ChatGPT, GPT-4, Gemini, Claude and more with sentence-level analysis",
  "ailab.detector.hero.badge1":   "10M+ Users Trust Us",
  "ailab.detector.hero.badge2":   "99% Accuracy",
  "ailab.detector.hero.badge3":   "Always Free"
}
```

---

## 5. 验收标准

- [ ] Hero 区域紫蓝渐变背景正确显示
- [ ] Shield 图标显示在标题左侧
- [ ] 3 个信任徽章横排显示，带半透明背景
- [ ] 中英文切换后徽章文字正确变化
- [ ] 移动端（<640px）标题自动缩小，徽章自动换行
- [ ] 背景光晕装饰元素不影响文字可读性

