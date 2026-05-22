# NeuroTrace — See what your screen time is doing to your brain
# NeuroTrace — 看见屏幕时间正在对你的大脑做什么

> **Hackathon Demo · 原型演示**
> Frontend-only prototype. All analysis is rule-based simulation. Not medical advice.
> 纯前端原型，所有分析为规则模拟，不构成医疗建议。

---

## The Idea · 核心思想

We all track screen time. Nobody understands it.

Numbers like "4h 23min on Instagram" tell you *what happened* — not *what it cost*.

NeuroTrace translates raw screen behavior into a cognitive signal: **Dopamine Load**, **Control Score**, and a **30-day attention forecast**. Not to be clinically precise. To make you feel something real about a problem you've been ignoring.

---

我们都在记录屏幕时间，但没有人真正理解它。

"Instagram 使用 4 小时 23 分钟"告诉你*发生了什么*——却没有告诉你*代价是什么*。

NeuroTrace 将原始屏幕行为转化为认知信号：**多巴胺负荷**、**控制力评分**、**30 天注意力预测**。目标不是临床精度，而是让你对一个你一直在忽视的问题，真正感受到什么。

---

## How It Works · 工作原理

```
Upload screenshot → Pattern match apps → Score engine → Render dashboard
上传截图 → 应用模式匹配 → 评分引擎 → 渲染仪表盘
```

1. **Upload** — User drops a screen time screenshot (any iOS/Android format)
   **上传** — 用户拖放屏幕时间截图（支持 iOS/Android 格式）

2. **Detect** — App names extracted via filename + demo data pattern matching
   **识别** — 通过文件名与演示数据模式匹配提取应用名称

3. **Score** — Two weighted metrics computed from app category × duration
   **评分** — 基于应用类别 × 使用时长，计算两项加权指标

4. **Classify** — Five brain states mapped from (dopamine, control) coordinates:
   **分类** — 从（多巴胺, 控制力）坐标映射到五种大脑状态：
   - `Dopamine Loop` · 多巴胺循环 — high stimulation, low control
   - `Hyperfocus` · 超聚焦 — high stimulation, high control
   - `Deep Flow` · 深度心流 — low stimulation, high control
   - `Mental Fog` · 脑雾状态 — low stimulation, low control
   - `Scattered Focus` · 注意力分散 — the middle ground

5. **Forecast** — 30-day behavioral projection with a concrete recommendation
   **预测** — 30 天行为外推 + 具体行动建议

---

## Tech Stack · 技术栈

| Layer | Implementation |
|-------|---------------|
| **Language** | Vanilla JavaScript (ES5-compatible, zero dependencies) |
| **Styling** | Pure CSS3 — CSS custom properties, `@keyframes`, SVG gradients |
| **Rendering** | DOM manipulation, SVG arc gauges, animated progress bars |
| **i18n** | Custom two-language object store (EN / 中文), instant toggle with DOM re-render |
| **Analysis engine** | Rule-based scoring with seeded randomness — `generateData()` → `getBrainState()` → `generatePrediction()` |
| **Animations** | `requestAnimationFrame` counter loop + CSS `cubic-bezier(.16,1,.3,1)` easing |
| **Hosting** | Static HTML — deployable to any CDN, no backend required |

**Zero build tools. Zero frameworks. Zero external dependencies.**
**零构建工具，零框架，零外部依赖。**

The entire product is three files: `index.html` · `style.css` · `script.js`

---

## Why Rule-Based, Not ML · 为什么选择规则而非机器学习

This is a deliberate choice, not a limitation.

The goal of NeuroTrace is not to predict your future with precision. It's to give you a **narrative framework** — grounded in behavioral science — that makes the invisible visible.

A score of `82 / 100` on Dopamine Load doesn't need to be statistically exact. It needs to make you pause.

Behavioral science tells us: **awareness precedes change**. You don't need a clinician's report. You need a signal that creates a moment of friction in an otherwise frictionless habit.

That's what NeuroTrace does.

---

这是主动选择，不是技术限制。

NeuroTrace 的目标不是精确预测你的未来，而是提供一套基于行为科学的**叙事框架**，让不可见的东西变得可感知。

多巴胺负荷 `82 / 100` 不需要统计上的精确，它只需要让你停下来想一想。

行为科学告诉我们：**意识先于改变**。你不需要一份临床报告，你需要一个信号——在本来毫无摩擦的习惯中制造一点摩擦。

这就是 NeuroTrace 做的事。

---

## Limitations · 局限性（请务必阅读）

| What it is | What it isn't |
|------------|--------------|
| Rule-based simulation · 规则模拟 | Real ML/AI · 真实机器学习 |
| Behavioral narrative · 行为叙事 | Clinical diagnosis · 临床诊断 |
| Pattern-matched app detection · 模式匹配识别 | OCR / actual image parsing · 真实图像解析 |
| Linear 30-day projection · 线性外推 | Predictive analytics · 预测性分析 |
| Single-session prototype · 单次会话原型 | Long-term tracking · 长期追踪 |

**Scores are not medically validated. This is an educational prototype.**
**评分未经医学验证，本项目为教育性原型。**

---

## Run Locally · 本地运行

```bash
git clone https://github.com/startupRS-lab/neurotrace
cd neurotrace
# Open index.html in any browser. No server needed.
# 用任意浏览器打开 index.html，无需服务器。
open index.html
```

---

## License · 许可

MIT — 2026 NeuroTrace · startupRS-lab
