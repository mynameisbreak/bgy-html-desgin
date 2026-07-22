# 碧桂园服务 HTML Deck 工作流

本文件说明如何用 `bgy-html-design` 制作多页 HTML 幻灯片，并从同一套 HTML 交付浏览器演示版、缩略图概览和可编辑 PPTX。

## 适用场景

优先使用多文件 HTML deck：

- 页数大于 3 页的管理汇报、月报、季报、项目提案。
- 需要逐页调试、逐页截图或后续转为可编辑 PPTX。
- 需要保留碧桂园服务模板框架，同时每页有不同内容结构。

只有在 1-3 页极简演示、且不需要概览页时，才考虑只输出单个 HTML 文件。

## 开工前确认交付格式

先确认交付格式，再开始写 HTML。默认遵循 HTML-first：

- **只要浏览器演示**：交付 `index.html + slides/*.html`，视觉自由度最高。
- **还要可编辑 PPTX**：不要只靠本技能硬转。先说明会转入 `pptx-design`，并从一开始读取 [pptx-authoring-profile.md](pptx-authoring-profile.md) 控制 HTML 结构，避免复杂渐变、Web Component、复杂 SVG 和不可编辑文字。PPTX 交接时保持 `1280 x 720` HTML 画布，对应标准宽屏 `13.333 x 7.5` 英寸；不要改成 `960 x 540` 或 `10 x 5.625`，否则复制到公司模板后会显小。

如果用户没有指定格式，默认先做 HTML 聚合演示版；需要可编辑文件时再追加 PPTX。

同一项目如果会分多次、逐页或批量生成，开工前还必须先建立项目级设计契约，具体见 [project-design-contract.md](project-design-contract.md)。主题、字体、组件圆角、阴影、状态色和文字颜色应由 `bgy.project.json` 决定，不要每页临场发挥。

开工时可以这样确认：

```text
我会先做可浏览器演讲的 HTML 聚合版（index.html + slides/*.html）。你还需要额外导出可编辑 PPTX 吗？如果需要，我会按 PPTX 友好的结构控制 HTML，避免后期返工。
```

## 架构选择

默认使用多文件架构：

| 维度 | 多文件 `index.html + slides/*.html` | 单文件 HTML |
|---|---|---|
| 适合页数 | 3 页以上，尤其是月报/季报/经营汇报 | 1-3 页极简演示 |
| CSS 风险 | 每页隔离，互不污染 | 全局样式容易互相影响 |
| 调试方式 | 单页可独立打开和截图 | 需要在同一文件里切页 |
| 交付扩展 | 方便生成缩略图和转可编辑 PPTX | 适合轻量预览 |

碧桂园管理汇报、节能降本、消防维保、公维资金、月报/季报等场景，默认都走多文件架构。

如果确实只有 1-4 页，并且用户只需要一个轻量单文件演示，可按需读取 [interactive-components.md](interactive-components.md)，使用 `assets/deck_stage.js`。页数达到 5 页时，不要使用 `deck_stage.js`，改回多文件架构。

## 批量制作前先做 2 页 showcase

当 deck 预计不少于 5 页时，不要从第一页一路写到底。先做 2 页视觉差异最大的 showcase，确认版式语法后再批量展开。

推荐组合：

| Deck 类型 | showcase 页 |
|---|---|
| 月报/季报 | 封面 + 经营摘要页 |
| 经营分析 | 指标总览页 + 问题风险页 |
| 节能降本 | 成果总览页 + 措施明细页 |
| 消防维保/公维资金 | 项目清单页 + 风险/待协调页 |
| 项目提案 | 方案总览页 + 实施路径页 |

showcase 通过后，后续页面只复用已确认的标题栏、字号、色彩、表格、指标卡和留白规则，避免整套 deck 风格漂移。

如果用户希望同时比较多个封面或重点页方向，可按需读取 [interactive-components.md](interactive-components.md)，用 `assets/design_canvas.jsx` 做 2-3 个方案对比。对比画布只用于选方向，不作为最终交付页。

## 推荐目录结构

在用户项目目录下创建文件，不要写到 skill 根目录：

```text
<project-name>/
  bgy.project.json
  project-config.html
  project-style-board.html
  deck.json
  index.html
  presets/
  shared/
    tokens.css
    components.css
    模版底图/
      image1.png
      image5.png
  slides/
    01-cover.html
    02-summary.html
    03-detail.html
  thumbs/
    01-cover.jpg
    02-summary.jpg
  output/
    <project-name>.pptx
```

说明：

- `bgy.project.json` 是项目级设计契约，锁定主题色、字体、组件、图标包、圆角和阴影。
- `project-config.html` 是可视化配置页；用 `serve --project-api` 打开时可以直接写回配置。
- `project-style-board.html` 是只读风格看板，用于确认本项目组件效果。
- `deck.json` 是内容事实来源。
- `index.html` 从 `assets/deck_index.html` 复制而来，只需要改 `window.DECK_MANIFEST`。
- `shared/tokens.css` 放跨页共用的品牌色、字号、画布和标题栏样式。
- `shared/components.css` 放跨页共用的 PPTX 友好组件样式，如 `.bgy-card`、`.bgy-table`、`.bgy-status-tag`。
- `shared/模版底图/` 复制内置模板图片，供每页 HTML 相对引用。
- `slides/` 每页一个完整 HTML 文件，天然隔离 CSS。
- `thumbs/` 只在需要画廊概览时生成。
- `output/` 放最终 PPTX 或其他交付文件。

## 初始化步骤

优先使用脚本一次性初始化项目结构：

```bash
npm --prefix <bgy-skill-root>/scripts run init-project -- \
  --dir <project-name> \
  --title "<项目标题>" \
  --preset management-report \
  --locked
```

脚本会生成 `bgy.project.json`、`project-config.html`、`project-style-board.html`、`shared/tokens.css`、`shared/components.css`、`index.html`、`deck.json` 和一张 `slides/01-style-board.html` 风格验证页。之后逐页生成时，只新增或替换 `slides/*.html`，不要改散落的颜色和组件样式。

如果 `bgy.project.json` 已经存在，修改配置后用：

```bash
npm --prefix <bgy-skill-root>/scripts run sync-project -- --root <project-name>
```

手工初始化只在脚本不可用时使用：

1. 复制聚合器：

```bash
copy <skill-root>/assets/deck_index.html <project-name>/index.html
```

2. 复制品牌底图：

```bash
copy <skill-root>/assets/ppt-base-template/模版底图/image1.png <project-name>/shared/模版底图/image1.png
copy <skill-root>/assets/ppt-base-template/模版底图/image5.png <project-name>/shared/模版底图/image5.png
```

3. 创建 `shared/tokens.css`，至少锁定画布：

```css
html,
body {
  margin: 0;
  width: 1280px;
  height: 720px;
  overflow: hidden;
  font-family: "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  background: #ffffff;
}

:root {
  --bgy-blue: #006d9a;
  --bgy-deep-blue: #004b6b;
  --bgy-red: #c00000;
  --bgy-green: #2e7d32;
  --text-main: #1f2933;
  --text-muted: #64748b;
  --panel: #f5f8fa;
  --line: #d8e3ea;
}
```

4. 每页 HTML 引入共享样式：

```html
<link rel="stylesheet" href="../shared/tokens.css">
<link rel="stylesheet" href="../shared/components.css">
```

## 单页 HTML 基础骨架

每个 slide 文件都是完整 HTML，`body` 本身就是 16:9 画布：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>02 经营摘要</title>
  <link rel="stylesheet" href="../shared/tokens.css">
  <link rel="stylesheet" href="../shared/components.css">
  <style>
    .brand-logo {
      position: absolute;
      left: 1059px;
      top: 24px;
      width: 190px;
      height: 46px;
      object-fit: fill;
    }
    .brand-watermark {
      position: absolute;
      left: 889px;
      top: 341px;
      width: 391px;
      height: 379px;
      object-fit: fill;
      pointer-events: none;
    }
    .title-bar {
      position: absolute;
      left: 80px;
      top: 70px;
      font-size: 34px;
      color: var(--bgy-blue);
      font-weight: 600;
    }
    .slide-number {
      font-size: 49px;
      margin-right: 44px;
      font-family: "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
    }
    .slide-title {
      display: inline-block;
    }
  </style>
</head>
<body>
  <img class="brand-watermark" src="../shared/模版底图/image5.png" alt="">
  <img class="brand-logo" src="../shared/模版底图/image1.png" alt="碧桂园服务">
  <div class="title-bar"><span class="slide-number">02</span><span class="slide-title">经营摘要</span></div>

  <!-- 页面主体内容放在标题栏下方 -->
</body>
</html>
```

## 配置 index.html

打开从 `assets/deck_index.html` 复制出来的 `index.html`，修改 `window.DECK_MANIFEST`：

```js
window.DECK_MANIFEST = [
  { file: "slides/01-cover.html", label: "封面" },
  { file: "slides/02-summary.html", label: "经营摘要" },
  { file: "slides/03-detail.html", label: "重点工作" }
];
```

如果已经生成缩略图，可加 `thumb`：

```js
{ file: "slides/02-summary.html", label: "经营摘要", thumb: "thumbs/02-summary.jpg" }
```

## 生成缩略图

需要画廊概览时使用：

```bash
npm --prefix <skill-root>/scripts run gen-deck-thumbs -- --slides <project-name>/slides --out <project-name>/thumbs --width 1280 --canvas-w 1280 --canvas-h 720 --wait 500
```

缩略图生成后，在 `index.html` 的 manifest 中补充 `thumb` 字段。
如果页面依赖远程图片或异步渲染，再提高 `--wait` 或传 `--wait-until networkidle`；不要默认长时间等待。
如果本机未下载 Playwright Chromium，BGY 浏览器脚本会自动尝试系统 Edge/Chrome；也可追加 `--browser-channel msedge` 显式指定。
BGY 脚本不需要单独安装 npm 依赖；浏览器运行时复用 `pptx-design` 的 Playwright。

## 服务器预览

直接双击 HTML 可以快速查看单页，但正式检查多文件 deck 时优先使用本地服务器模式，避免浏览器对 `file://`、相对资源、中文路径或 iframe 的限制影响预览：

```bash
npm --prefix <bgy-skill-root>/scripts run serve -- --root <project-name> --entry index.html --port auto
```

常用参数：

- `--root <project-name>`：项目根目录，通常包含 `index.html`、`slides/`、`shared/`。
- `--entry index.html`：默认入口，也可以指向某个 `slides/01-cover.html` 做单页预览。
- `--port auto`：从 4173 开始自动寻找可用端口。
- `--open`：启动后打开默认浏览器。
- `--smoke`：启动后自检入口 URL，成功后退出，适合自动验证脚本。
- `--project-api`：启用本地配置读写接口，打开 `project-config.html` 时可直接保存 `bgy.project.json` 并同步共享样式。

编辑项目主题时使用：

```bash
npm --prefix <bgy-skill-root>/scripts run serve -- --root <project-name> --entry project-config.html --project-api --port auto --open
```

## 导出可编辑 PPTX

多文件 BGY deck 不要把 `index.html` 聚合页直接截图成 PPT。使用 `export_bgy_pptx.mjs`
把 `slides/*.html` 逐页交给 `pptx-design`，这样每页都会走同一套 native-object 转换逻辑：

```bash
npm --prefix <bgy-skill-root>/scripts run export-bgy-pptx -- \
  --slides-dir <project-name>/slides \
  --project-root <project-name> \
  --out <project-name>/output/<project-name>.pptx \
  --mode normal
```

`export_bgy_pptx.mjs` 会先运行 `pptx_preflight.mjs`，用静态规则检查常见误转风险。
项目根目录有 `bgy.project.json` 时，导出脚本会读取项目字体、主题锁定状态和 BGY 组件 selector，并把 `--project-root` 传给 preflight；这会拦截项目外颜色、字体、圆角和阴影漂移。BGY 脚本不需要单独安装 npm 依赖；PPTX 转换所需依赖由 `pptx-design` 提供。
开始写 PPTX-bound HTML 前先读取 [pptx-authoring-profile.md](pptx-authoring-profile.md)，该文件定义了 `bgy-card`、`bgy-table`、`data-ppt-line-end`、`data-ppt-placeholder` 等可由转换器稳定识别的结构契约。

模式选择：

- `--mode draft`：最快，用于版式草稿；降低截图倍率，跳过 PPTX zip 复查和 audit。
- `--mode normal`：默认迭代模式；使用快速等待参数，保留 native-object safety 和基础 PPTX 验证。
- `--mode final`：最终交付；使用更保守的加载/图片等待参数，启用 strict authoring，并运行 `audit-pptx --strict`。

PPTX 友好 HTML 规则：

- 普通卡片、面板、分割线、圆角矩形、圆形、状态标签不要加 `data-ppt-component`。
- 表格使用 `<table>`，图片使用 `<img>`，文字保留真实 DOM 文本。
- 简单线性 SVG icon 可保留为 inline SVG；复杂 SVG/filter/mask/canvas 才作为显式截图例外。
- 线条箭头使用 `data-ppt-line-start`、`data-ppt-line-end` 显式声明；不要用图片或 SVG marker 让转换器猜。
- 图表没有明确数据时用 `data-ppt-placeholder` 保留坐标；有明确数据时使用 `data-ppt-chart="bar|line|pie"` 和 `data-ppt-chart-data` JSON 直接导出原生 PPT 图表，不从视觉 HTML/canvas/SVG 反推数据。
- 不要使用 `--auto-snapshots` 或 `--no-module-screenshots` 做常规交付。

## 验证

默认轻量验证：

```bash
npm --prefix <skill-root>/scripts run verify-html -- index.html --viewports 1280x720 --wait 2000
```

交付前必须确认：

- `index.html` 能打开且所有 iframe 页面不白屏。
- 模板图片路径有效，logo/水印/标题栏正常。
- 页面保持 16:9，标题是结论式表达。
- 不含 `TODO`、`placeholder`、假数据或未说明的占位图。

只有在页数多、正式对外交付、表格/图表密集或用户要求时，才逐页打开 `slides/*.html` 检查溢出、可读性和素材显示。
