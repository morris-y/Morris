---
date: 2026-06-07
topic: portfolio-mode-switcher
---

# Portfolio Mode Switcher

## Summary

将现有标准多页作品集重新设计为三入口沉浸式体验。落地页呈现三张身份卡片，访客选择后进入对应的专属视觉模式：Apple Notes 风格（文字阅读）、Netflix 风格（项目展示）、TikTok 风格（动画与视频混搭）。第一阶段交付落地页 + Notes + Netflix；TikTok 模式占位，第二阶段独立迭代。

---

## Problem Frame

当前作品集是标准多页结构（Home / About / Projects / Experience / Contact），视觉语言通用，没有差异化的入场体验。不同类型的访客（招聘者、读者、对 Morris 感兴趣的人）在同一套导航下看到同样的信息密度，缺乏针对性。divyavenn.com 展示了一种可行模式：用"选择身份"的仪式感作为入口，让每类访客进入一个专属的视觉世界，信息组织和 UI 语言完全匹配其意图。

---

## Key Decisions

**三入口架构替换现有路由结构。** 现有 `/about`、`/projects`、`/experience`、`/contact` 路由被重构，内容分别归入三种模式。落地页 `/` 不含传统导航栏，只有身份选择。这是核心设计决策，使每种模式可以有完全独立的视觉语言。

**第一阶段 TikTok 模式占位。** TikTok 模式的框架在落地页中存在（第三张卡片），但标记为"即将推出"，路由 `/reel` 显示占位页。TikTok 内容生产和具体动画实现在第二阶段完成。这样可以更快发布可用版本，且不因内容未备好而拖延整体发布。

**保留 Next.js 15 + Tailwind v4，新增 Framer Motion。** 现有技术栈继续使用。Framer Motion 用于 TikTok 模式的全屏过渡动画（第二阶段），以及全站页面切换。styled-components 不引入，保持 Tailwind 体系一致。

**Notes 内容双来源并存。** 仓库内 `.md` 文件（手动维护的私人笔记/想法）+ Medium RSS 拉取（已发布文章），两类内容在同一个 Notes 界面内以不同"文件夹"呈现。

**身份卡片名称采用方向 C（直接 + 自知）：**
- Netflix 模式入口：`headhunters`（直接点破招聘者身份）
- Notes 模式入口：`overthinkers`（喜欢读长文的同类人）
- TikTok 模式入口：`the algorithm sent me`（自嘲式 TikTok 梗，路人感）

---

## Actors

A1. 访客（招聘者）— 目标：快速了解 Morris 的产品产出，进入 Netflix 模式。
A2. 读者 — 目标：阅读 Morris 的文字和思考，进入 Notes 模式。
A3. 感兴趣的人 — 目标：以轻量方式了解 Morris，进入 TikTok 模式（第一阶段为占位）。

---

## Requirements

**落地页**

- R1. 落地页显示三张身份选择卡，每张包含配图、身份名称和一行描述。
- R2. 点击卡片分别路由至 `/notes`（Notes 模式）、`/projects`（Netflix 模式）、`/reel`（TikTok 模式）。
- R3. TikTok 模式对应的卡片（第三张）标记为"即将推出"，点击不跳转或跳至占位页。
- R4. 落地页不含传统导航栏。
- R5. 三张卡片身份名称：Netflix 入口为 `headhunters`，Notes 入口为 `overthinkers`，TikTok 入口为 `the algorithm sent me`。

**Notes 模式（`/notes`）**

- R6. Notes 模式采用 macOS Notes 深色风格三栏布局：文件夹列表（左侧栏）/ 笔记列表（中栏）/ 笔记内容（右栏）。
- R7. 内容来源一：仓库内 `.md` 文件，手动维护，作为独立文件夹分类呈现。
- R8. 内容来源二：Medium RSS 拉取，作为独立文件夹呈现，与仓库内容并列。
- R9. 笔记内容支持 Markdown 渲染（标题、正文、链接、代码块）。
- R10. 移动端三栏折叠为单栏，用户在文件夹 → 笔记列表 → 内容之间顺序导航，支持返回上一级。
- R11. Notes 模式内有返回落地页的入口。

**Netflix 模式（`/projects`）**

- R12. Netflix 模式使用深色背景，卡片行横向滚动展示项目。
- R13. 内容来自 `src/lib/content.ts` 的 `projects` 和 `experience` 数据，不需要新建数据源。
- R14. 固定顶部导航栏：初始为渐变背景，页面向下滚动后切换为纯色背景。
- R15. 项目卡片 hover 时展示项目描述和技术栈；视频预览为可选（第二阶段）。
- R16. Netflix 模式内有返回落地页的入口。

**TikTok 模式第二阶段（`/reel`，规划参考）**

- R17. TikTok 模式为全屏垂直滚动，每屏一个内容块，占满视口高度。
- R18. 屏间切换使用 Framer Motion 动画过渡效果（非即切，有明显的运动感）。
- R19. 内容块支持两种形式：纯动画卡片（文字 + CSS/Framer 动画）和视频嵌入（`autoplay muted loop`）。
- R20. TikTok 模式内有返回落地页的入口。

---

## Key Flows

- F1. **身份选择入场**
  - **Trigger:** 访客进入 `divyavenn.com`（类比：`morrisyang.com`）
  - **Actors:** A1 / A2 / A3
  - **Steps:** 落地页展示三张卡片 → 访客点击对应身份 → 路由至对应模式
  - **Covers:** R1, R2, R3, R4

- F2. **Notes 模式阅读**
  - **Trigger:** 访客点击 Notes 入口卡片
  - **Actors:** A2
  - **Steps:** 进入 `/notes` → 左栏显示文件夹列表（仓库笔记 + Medium）→ 点击文件夹展示对应笔记列表 → 点击笔记在右栏渲染内容
  - **Covers:** R6, R7, R8, R9, R10

- F3. **Netflix 模式浏览项目**
  - **Trigger:** 访客点击 Netflix 入口卡片
  - **Actors:** A1
  - **Steps:** 进入 `/projects` → 看到横向滚动的项目行 → hover 卡片展示描述 → 点击进入项目详情（或外链）
  - **Covers:** R12, R13, R14, R15

---

## Scope Boundaries

**延后到第二阶段**
- TikTok 模式的完整实现（R17–R20）
- Netflix 模式项目卡片视频预览
- Notes 模式音频笔记支持

**不在此次范围内**
- CMS 或后台管理界面（内容通过文件和 Medium 维护）
- 身份卡片的 A/B 测试或个性化
- 现有 `/experience`、`/contact`、`/about` 页面路由保留兼容（可重定向或直接删除）

---

## Dependencies / Assumptions

- Medium RSS feed 可公开访问，无需认证，可在构建时或客户端拉取。
- 现有 `src/lib/content.ts` 数据结构直接用于 Netflix 模式，无需新建 API。
- TikTok 模式所需的视频素材和动画内容由用户在第二阶段前自行准备。
- 部署平台为 Vercel，静态生成（SSG）方式不变。

---

## Outstanding Questions

**规划时明确：**
- Medium RSS 拉取方式：构建时静态（`getStaticProps` / `generateStaticParams`）还是客户端实时拉取？
- Notes 模式的文件夹分类结构：仓库 `.md` 文件按什么维度分文件夹？（话题、时间、类型？）
- 路由 `/about`、`/experience`、`/contact` 是保留重定向还是直接废弃？

---

## Sources

- divyavenn.com 技术栈：Vite + React SPA，React Router v6，styled-components，React.lazy 代码分割，CSS-only 过渡，约 200KB bundle。
- divyavenn.com 三入口数据（bundle 中直接可见）：`{name:"demo watchers", url:"/tech"}`、`{name:"growth hackers", url:"/content"}`、`{name:"stalkers", url:"/about/intro"}`。
- divyavenn.com Notes 实现：三栏 flex 布局，移动端以 `useState("folders"|"noteList"|"noteContent")` 状态机控制单栏导航，SF Pro Text 字体，颜色值 `#1e1e1e` / `#2c2c2e` / `#3a3a3c` / `#d4a036`。
- divyavenn.com Netflix 实现：背景 `#141414`，hover 颜色 `#e50914`，`.scrolled` class 切换导航栏状态，视频卡片使用 `autoPlay muted loop`。
- 现有数据：`src/lib/content.ts`（projects、experience、skills、siteConfig 已完整定义）。
