---
name: daily-tech-trends
description: >-
  每日科技趋势榜单抓取与信息图生成。从 Product Hunt、GitHub Trending、iOS App Store
  三个平台抓取每日/昨日热门产品与项目数据，整理为中英双语榜单，并生成可直接发布到社交平台的
  高质量信息图（HTML → PNG）。触发词：每日趋势、日报、tech trends、trending、
  抓取榜单、Product Hunt、GitHub trending、App Store 趋势、热门项目、
  做趋势图、科技日报、榜单信息图。
---

# 每日科技趋势榜单 · Daily Tech Trends

从三大平台抓取趋势数据，生成社交媒体信息图。

## 数据源与抓取方法

### 1. GitHub Trending（完整度最高）

**URL**: `https://github.com/trending?since=daily`

**抓取方式**: `WebFetch` 直接获取页面，解析结构化数据。

**提取字段**:
| 字段 | 来源 |
|------|------|
| 仓库名 | `owner/repo` 格式 |
| 简介(EN) | 页面原文 |
| 简介(CN) | 翻译 |
| 今日星标增量 | "N stars today" |
| 总星标数 | 页面显示 |
| 主语言 | 语言标签 |

**备用**: 如 WebFetch 失败，用 `WebSearch "GitHub trending repositories daily"` 获取摘要。

### 2. Product Hunt Daily（部分数据受限）

**主 URL**: `https://hunted.space/overview/YYYY/Mon/DD`（第三方追踪，免费可用）

**抓取方式**: `WebFetch` hunted.space 页面 + `WebSearch` 补充产品详情。

**提取字段**:
| 字段 | 来源 |
|------|------|
| 产品名 | hunted.space 排行 |
| 排名 | 当日 upvote 排序 |
| 类别 | 搜索补充 |
| 介绍(EN) | 产品官网/PH 页面 |
| 介绍(CN) | 翻译 |
| Upvotes | hunted.space 数据 |

**已知限制**: hunted.space 免费版可能不显示完整 top 10（部分排名位仅在图表中可见）。处理方式：
- 优先展示已确认排名的产品
- 标注数据来源为 "hunted.space"
- 不要编造缺失的排名数据

**备用**: `WebSearch "producthunt.com [日期] top products"` 或 `WebFetch https://www.producthunt.com/leaderboard/daily/YYYY/M/D`（可能 403）。

### 3. iOS App Store Trending（排名飙升榜）

**主 URL**: `https://clonechart.io/chart/velocity`

**抓取方式**: `WebFetch` 获取 7 日排名变动数据。

**提取字段**:
| 字段 | 来源 |
|------|------|
| App 名称 | 页面列表 |
| 类别 | 括号内标注 |
| 开发者 | 页面显示 |
| 评分 | ★ 分数 |
| 排名变动 | +N ranks in 7d |
| 当前/原始排名 | #X ← was #Y |
| 简介(EN/CN) | 搜索补充或根据 App 功能翻译 |

**备用数据源**:
- `https://apptail.io/top-iphone-apps` — 总下载榜
- `WebSearch "iOS App Store top trending apps [月份] [年份]"` — 摘要数据

## 信息图设计规范

### 输出规格

- **尺寸**: 1080×1350px（4:5 比例，适配 Instagram/小红书/微博）
- **截图**: @2x 高清（实际输出 2160×2700px）
- **格式**: HTML 源文件 + PNG 截图

### 三张图的设计系统（统一黑底）

所有图片使用 **同一背景色 `#0d1117`**，通过各自的强调色区分平台身份：

| 平台 | 背景 | 强调色 | 数据标注色 | 风格关键词 |
|------|------|--------|-----------|-----------|
| GitHub | `#0d1117` | `#3fb950` 绿 | `#58a6ff` 蓝（repo名） | 终端感、星标增长 |
| Product Hunt | `#0d1117` | `#ff6154` 珊瑚 | `#ff6154`（upvote数） | Upvote 排行 |
| App Store | `#0d1117` | `#0a84ff` 蓝 | `#0a84ff`（排名变动） | 排名飙升 |

**统一结构**:
- Container: `padding: 56px 48px 44px`
- Item grid: `32px 1fr auto`，`gap: 2px`
- Top 3 条目：accent 色高亮背景 + 边框
- 排名编号：`JetBrains Mono`，top 3 用强调色，其余 `#484f58`
- 文字层级：名称 14px/600 白色 → 描述 12px `#7d8590` → 分类 11px `#484f58`

### 设计原则（继承 huashu-design 反 AI slop）

- 不用紫色渐变、emoji 图标、圆角+左 border accent
- 字体：`Inter`（正文）+ `JetBrains Mono`（数据/排名/代码）
- 每张图底部加「趋势洞察」一句话摘要（accent 色标签 + 灰色文字）
- Footer 包含数据来源和日期，布局 `justify-content: space-between`
- 所有图统一 `#0d1117` 背景，不做渐变，保持纯净暗色
- Top 3 条目使用 accent 色 4% 透明度背景 + 12% 透明度边框
- 其余条目使用白色 2% 透明度背景 + 4% 透明度边框

### HTML 模板结构

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: 1080px; height: 1350px; background: #0d1117; font-family: 'Inter', -apple-system, sans-serif; color: #e6edf3; overflow: hidden; }
    .container { width: 100%; height: 100%; padding: 56px 48px 44px; display: flex; flex-direction: column; }
    .header { margin-bottom: 36px; }
    .header-top { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
    .header-label { font-size: 13px; font-weight: 600; color: VAR_ACCENT; letter-spacing: 0.08em; text-transform: uppercase; }
    .header-title { font-size: 32px; font-weight: 800; color: #ffffff; letter-spacing: -0.03em; }
    .header-date { font-size: 13px; color: #484f58; margin-top: 6px; font-family: 'JetBrains Mono', monospace; }
    .list { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .item { display: grid; grid-template-columns: 32px 1fr auto; align-items: center; gap: 14px; padding: 14px 16px; border-radius: 8px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); }
    .item:nth-child(-n+3) { background: rgba(VAR_ACCENT_RGB, 0.04); border-color: rgba(VAR_ACCENT_RGB, 0.12); }
    .rank { font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 600; color: #484f58; text-align: center; }
    .item:nth-child(-n+3) .rank { color: VAR_ACCENT; }
    .insight { margin-top: 18px; padding: 12px 16px; background: rgba(VAR_ACCENT_RGB, 0.04); border-radius: 8px; border: 1px solid rgba(VAR_ACCENT_RGB, 0.1); display: flex; align-items: center; gap: 12px; }
    .footer { margin-top: 20px; display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.06); }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><!-- 平台 icon + label + 标题 + 日期 --></div>
    <div class="list"><!-- 10 条排行条目 --></div>
    <div class="insight"><!-- 趋势洞察标签 + 文字 --></div>
    <div class="footer"><!-- 数据来源 + 日期 --></div>
  </div>
</body>
</html>
```

其中 `VAR_ACCENT` 和 `VAR_ACCENT_RGB` 根据平台替换：
- GitHub: `#3fb950` / `63, 185, 80`
- Product Hunt: `#ff6154` / `255, 97, 84`
- App Store: `#0a84ff` / `10, 132, 255`

## 截图脚本

将 HTML 转为 PNG 的 Node.js 脚本（需要系统 Chrome）:

```bash
node screenshot.js
```

脚本内容见 `scripts/screenshot.js`。依赖 `puppeteer-core`，使用系统 Chrome 作为浏览器引擎。

如果 puppeteer 不可用，告诉用户用浏览器开发者工具截图：
1. Chrome 打开 HTML
2. F12 → Ctrl+Shift+P → "Capture full size screenshot"

## 完整工作流

```
用户触发 → 确认日期
    ↓
┌──────────────────────────────────┐
│ 并行抓取三个平台数据（WebFetch/WebSearch）│
└──────────────────────────────────┘
    ↓
整理数据：翻译、归类、排序
    ↓
生成四个 HTML 文件：
  ├── github-trending.html（单图）
  ├── producthunt-trending.html（单图）
  ├── appstore-trending.html（单图）
  └── combined-trending.html（三合一长图）
    ↓
运行 screenshot.js 导出 4 张 PNG
    ↓
输出 ~140 字趋势点评文本
    ↓
交付：4 张图文件路径 + 点评文案
```

### Step 1: 确认参数

默认值（用户不指定时使用）：
- 日期：昨天
- 平台：全部三个
- 输出目录：`~/tech-trends-MMDD/`
- @handle：`@YourHandle`（提醒用户替换）

### Step 2: 并行数据抓取

同时发起三个 WebFetch/WebSearch 请求，不要串行等待。

### Step 3: 数据整理

每个平台整理为结构化数据：
```
{rank, name, category, desc_en, desc_cn, metric_label, metric_value}
```

中文翻译原则：
- 技术术语保留英文（AI Agent, LLM, SSH, API）
- 产品名不翻译
- 描述翻译力求简洁，一行以内

### Step 4: 生成 HTML（4 个文件）

用对应平台的设计模板填充数据，写入以下文件：

1. **`github-trending.html`** — GitHub 星标增长 Top 10 单图（1080×1350px）
2. **`producthunt-trending.html`** — Product Hunt Upvote Top 10 单图（1080×1350px）
3. **`appstore-trending.html`** — App Store 排名飙升 Top 10 单图（1080×1350px）
4. **`combined-trending.html`** — 三合一长图（1080px 宽，高度自适应）

合并长图结构：
```
┌─────────────────────────┐
│  GitHub 星标增长 Top 10   │ ← section-gh（绿色）
├─────────────────────────┤
│  PH Upvote Top 10       │ ← section-ph（珊瑚色）
├─────────────────────────┤
│  App Store 飙升 Top 10   │ ← section-as（蓝色）
├─────────────────────────┤
│  Footer（日期 + 数据源）  │
└─────────────────────────┘
```

每个 section 使用 `.section + .section { border-top: 1px solid rgba(255,255,255,0.06) }` 分隔，各自保留 insight 洞察。

### Step 5: 导出 PNG（4 张）

运行截图脚本导出 4 张图。单图使用固定 1080×1350 viewport，合并长图使用 `fullPage: true` 自适应高度。

如沙箱限制无法启动浏览器，输出脚本路径让用户自行运行。

### Step 6: 趋势点评（文本输出）

在信息图之外，额外输出一段 **~140 字的趋势点评文本**，供用户直接作为社交平台文案或朋友圈配文。

**写作要求**:
- 字数：120–160 字，不超过 3 句话
- 从当日三个榜单中挑出 2-3 个最值得关注的项目/App
- 说明亮点（为什么值得关注）+ 行业趋势判断（一句话）
- 语气：信息密度高、有观点、不水话
- 不用 emoji、不用 hashtag、不用"建议关注"等公众号套话
- 可以点名具体项目

**模板结构**:
```
[项目A] + 亮点一句话；[项目B] + 亮点一句话。趋势判断一句话。
```

**示例**:
```
Ruflo 用 2400+ 星登顶 GitHub，Claude 多智能体编排正从概念走向生产级工具；
App Store 端 Love and Deepspace 一周飙升 1400 位，AI + 情感陪伴类应用的商业化
正在加速。整体看，AI Agent 基础设施和终端消费场景两端同时爆发。
```

输出位置：在三张信息图交付之后，以纯文本形式输出点评，方便用户直接复制。

## 异常处理

| 场景 | 处理 |
|------|------|
| WebFetch 超时/403 | 降级为 WebSearch 获取摘要数据 |
| 某平台数据不足 10 条 | 展示已获取的数据，不编造填充 |
| 字体加载失败 | HTML 已设 fallback：`-apple-system, sans-serif` |
| 沙箱无法启动 Chrome | 输出 `screenshot.js` 路径，提示用户终端执行 |
| 用户要求特定平台 | 只抓该平台，只生成一张图 |

## 定制选项

用户可要求调整：
- **平台选择**: 只做其中一个或两个
- **语言**: 纯中文 / 纯英文 / 中英双语（默认双语）
- **@handle**: 替换为用户真实社交账号
- **配色**: 用户有品牌色可替换默认色板
- **额外平台**: 可扩展 Hacker News、ProductHunt AI 等
