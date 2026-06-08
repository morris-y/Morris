---
title: "feat: Apply sahor.work Visual Style and Design Tokens"
date: 2026-06-08
status: active
origin: docs/brainstorms/2026-06-07-portfolio-mode-switcher-requirements.md
---

# Apply sahor.work Visual Style and Design Tokens

## Problem Frame

Morris portfolio 目前使用 Geist Sans 作為全站字型，缺乏視覺差異化。sahor.work 以 Bricolage Grotesque（display heading）+ Instrument Serif italic（accent）+ 極緊 letter-spacing（-0.05em ~ -0.08em）打造強烈的排版個性。本計劃將這套字型設計語言移植到 Morris portfolio 的 app window 內容層，同時保留 macOS Tahoe 桌面殼層的現有玻璃材質系統不變。

## Scope Boundaries

**納入：**
- 新增 Bricolage Grotesque + Instrument Serif 字型載入
- `globals.css` 新增 display/heading font CSS 變數與排版 token
- 將新字型應用到 app window 內容區塊（notes-app、netflix-app、about-app、contact-app 的 heading/display 元素）

**排除（preserve unchanged）：**
- macOS 桌面殼層：`desktop.tsx`、`menubar.tsx`、`dock.tsx`、`wallpaper.tsx`、`window-frame.tsx` — 繼續使用 `font-system`（SF Pro）
- `terminal-app.tsx` — 繼續使用 `font-mono`
- `--radius` token — 維持 `0.625rem`（user decision）
- Body/UI 字型 — 維持 Geist Sans（user decision）
- 全站顏色 token — dark bg `oklch(0.145 0 0)` ≈ sahor `#181818`，已高度吻合，無需修改

## Design Token Reference（從 sahor.work 提取）

| Token | sahor.work 值 | 對應 OKLCH / CSS |
|---|---|---|
| Background | `#181818` | `oklch(0.145 0 0)` ← 已有 |
| Text / White | `#ffffff` | `oklch(0.985 0 0)` ← 已有 |
| Secondary text | `#c2c2c2` | `oklch(0.789 0 0)` |
| Muted text | `#5c5c5c` | `oklch(0.439 0 0)` |
| Display font | Bricolage Grotesque | 新增 |
| Serif accent | Instrument Serif italic | 新增 |
| Display letter-spacing | `-0.06em`（heading）`-0.08em`（hero） | 新增 token |
| Display line-height | `0.88`（heading）`0.80`（hero） | 新增 token |
| Body letter-spacing | `-0.01em` | 輕微調整 |

## Implementation Units

### U1 — Font Loading (`src/app/layout.tsx`)

**What:** 新增 `Bricolage_Grotesque` 和 `Instrument_Serif` 的 `next/font/google` 實例，注入 CSS 變數到 `<html>` className。

**How:**
```
import { Bricolage_Grotesque, Instrument_Serif } from 'next/font/google'

const bricolageGrotesque = Bricolage_Grotesque({
  variable: '--font-bricolage',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
})

const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  subsets: ['latin'],
  style: ['italic'],
  weight: '400',
})
```
`<html>` className 新增 `${bricolageGrotesque.variable} ${instrumentSerif.variable}`。

**Pattern:** 與現有 `geistSans` / `geistMono` 結構完全相同。

### U2 — CSS Token Layer (`src/app/globals.css`)

**What:** 在 `@theme inline` 區塊新增三個字型 token，並新增 display typography utilities layer。

**Changes:**

1. 在 `@theme inline` 的 `--font-heading: var(--font-sans)` 行後插入：
   ```css
   --font-display: var(--font-bricolage);
   --font-serif-accent: var(--font-instrument-serif);
   --font-heading: var(--font-display);
   ```
   （`--font-heading` 從 `var(--font-sans)` 改為 `var(--font-display)`）

2. 在 `:root` 區塊新增排版 token（sahor 值）：
   ```css
   --tracking-display: -0.06em;
   --tracking-display-tight: -0.08em;
   --leading-display: 0.88;
   --leading-display-tight: 0.80;
   ```

3. `@layer utilities` 新增工具 class（供 app 元件直接使用，不影響 macOS shell）：
   ```css
   @layer utilities {
     .font-display { font-family: var(--font-display); }
     .font-serif-accent { font-family: var(--font-serif-accent); font-style: italic; }
     .tracking-display { letter-spacing: var(--tracking-display); }
     .tracking-display-tight { letter-spacing: var(--tracking-display-tight); }
     .leading-display { line-height: var(--leading-display); }
     .leading-display-tight { line-height: var(--leading-display-tight); }
   }
   ```

**Risk:** `--font-heading` 改為 Bricolage Grotesque 後，任何使用 `font-heading` 的地方都會自動更新。確認 macOS shell 元件使用的是 `font-system` 而非 `font-heading`（已確認：`desktop.tsx` 的 root div 有 `font-system` class）。

### U3 — About App (`src/components/apps/about-app.tsx`)

**What:** 將姓名、職稱、section 標題等 heading 換成 Bricolage Grotesque，保留 body text 用 Geist Sans。

**Pattern:**
- `text-2xl` 以上的 heading：加 `font-display tracking-display leading-display`
- 若有 Instrument Serif 的 accent 用途（如引言句）：加 `font-serif-accent`

### U4 — Notes App (`src/components/apps/notes-app.tsx`, `src/components/notes/notes-layout.tsx`)

**What:** 筆記標題（列表項目標題、筆記詳細頁標題）用 Bricolage Grotesque。body 文字維持 Geist Sans（符合 Notes 的閱讀性需求）。

**Pattern:**
- 筆記列表中的 note title：`font-display tracking-display`
- 筆記內容頁的大標題：`font-display tracking-display leading-display`
- `notes-content` 段落文字：維持不變

### U5 — Netflix / Projects App (`src/components/apps/netflix-app.tsx`, `src/components/netflix/netflix-header.tsx`)

**What:** Netflix header 的大標題（hero text）使用 Bricolage Grotesque + tight tracking，卡片標題使用 tracking-display。

**Pattern:**
- Hero / 大型 display heading：`font-display tracking-display-tight leading-display-tight text-5xl+`
- Row section label（如 "Projects"）：`font-display tracking-display`
- Card title：`font-display`（無需 tracking-display，小字體緊縮效果不明顯）

### U6 — Contact App (`src/components/apps/contact-app.tsx`)

**What:** Section heading 換用 Bricolage Grotesque。

**Pattern:** 同 U3 模式，`text-xl` 以上的 heading 加 `font-display tracking-display`。

## Sequencing

```
U1 (layout.tsx) → U2 (globals.css) → U3–U6 (parallel, independent)
```

U1 + U2 必須先完成（建立 CSS 變數）；U3–U6 可同時進行。

## Test Scenarios

**T1 — 字型正確載入**
- 瀏覽器 DevTools → Elements → 任一 `.font-display` 元素，computed font-family 顯示 "Bricolage Grotesque"，而非 Geist Sans
- `<html>` element 有 `--font-bricolage` 和 `--font-instrument-serif` CSS 變數

**T2 — macOS shell 不受影響**
- Menubar、Dock 文字、桌面 icon label、視窗標題列（traffic light 區域）仍使用 SF Pro（-apple-system）
- WindowFrame 的 drag handle 文字維持 font-system

**T3 — About App headings**
- 開啟 About app，name/title heading 字型為 Bricolage Grotesque，緊縮間距可見
- Body text（bio 段落）仍為 Geist Sans

**T4 — Notes App headings**
- 開啟 Notes app，筆記列表標題字型為 Bricolage Grotesque
- 筆記內文段落維持 Geist Sans，可讀性不受影響

**T5 — Netflix App hero**
- 開啟 Projects/Netflix app，header 大標題為 Bricolage Grotesque，letter-spacing 明顯緊縮
- 卡片 body description 仍為 Geist Sans

**T6 — Terminal 不受影響**
- 開啟 Terminal app，字型仍為 Geist Mono

**T7 — Instrument Serif accent**（若有在任一 app 使用）
- 相關 accent 文字呈現 italic serif 樣式

## Dependencies

- Next.js `next/font/google` 自動從 Google Fonts 下載並最佳化，build time 完成，無 runtime 外部請求
- Bricolage Grotesque 在 Google Fonts 有 variable font 支援，weights 400/500/600 均可用
- Instrument Serif italic 在 Google Fonts 只有 weight 400，style italic — 限用於此 weight/style

## Risks

| Risk | Severity | Mitigation |
|---|---|---|
| `--font-heading` 覆寫影響 shadcn UI 元件 | Low | shadcn 大多使用 `font-sans`（Geist）而非 `font-heading`；受影響的只有明確用 `heading` 類別的 shadcn 元件 |
| Bricolage Grotesque 的 optical size 在小字（< 14px）時過重 | Low | 只在 `text-xl` 以上的 heading 套用 `font-display`；body text 維持 Geist Sans |
| next/font 新增兩個字型增加 bundle | Negligible | next/font 做字型子集化，Latin subset 約 20-40KB per family，已最佳化 |

## Deferred

- Instrument Serif 的具體使用位置（landing quote、特定 callout）— 留給實作時依視覺效果決定
- 色彩 token 微調（`--muted-foreground` 暗色模式 oklch 差值 ≈ 0.08）— 目前吻合度已夠，待整體視覺 review 後決定是否調整
- Netflix card hover 的大字型動畫 — Phase 2 scope
