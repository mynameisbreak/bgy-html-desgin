# 碧桂园服务 HTML Deck 工作流

本文件说明如何用 `bgy-html-design` 制作多页 HTML 幻灯片，并从同一套 HTML 交付浏览器演示版、缩略图概览和 PDF。

## 适用场景

优先使用多文件 HTML deck：

- 页数大于 3 页的管理汇报、月报、季报、项目提案。
- 需要逐页调试、逐页截图或后续导出 PDF。
- 需要保留碧桂园服务模板框架，同时每页有不同内容结构。

只有在 1-3 页极简演示、且不需要概览页时，才考虑只输出单个 HTML 文件。

## 开工前确认交付格式

先确认交付格式，再开始写 HTML。默认遵循 HTML-first：

- **只要浏览器演示**：交付 `index.html + slides/*.html`，视觉自由度最高。
- **还要 PDF**：仍先做 HTML deck，再用 `scripts/export_deck_pdf.mjs` 导出。
- **还要可编辑 PPTX**：不要只靠本技能硬转。先说明会转入 `pptx-design`，并从一开始控制 HTML 结构，避免复杂渐变、Web Component、复杂 SVG 和不可编辑文字。

如果用户没有指定格式，默认先做 HTML 聚合演示版；需要发送、归档、打印时再追加 PDF。

开工时可以这样确认：

```text
我会先做可浏览器演讲的 HTML 聚合版（index.html + slides/*.html）。你还需要额外导出 PDF 或可编辑 PPTX 吗？如果需要 PPTX，我会按 PPTX 友好的结构控制 HTML，避免后期返工。
```

## 架构选择

默认使用多文件架构：

| 维度 | 多文件 `index.html + slides/*.html` | 单文件 HTML |
|---|---|---|
| 适合页数 | 3 页以上，尤其是月报/季报/经营汇报 | 1-3 页极简演示 |
| CSS 风险 | 每页隔离，互不污染 | 全局样式容易互相影响 |
| 调试方式 | 单页可独立打开和截图 | 需要在同一文件里切页 |
| 交付扩展 | 方便导出 PDF、生成缩略图 | 适合轻量预览 |

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
  deck.json
  index.html
  shared/
    tokens.css
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
    <project-name>.pdf
```

说明：

- `deck.json` 是内容事实来源。
- `index.html` 从 `assets/deck_index.html` 复制而来，只需要改 `window.DECK_MANIFEST`。
- `shared/tokens.css` 放跨页共用的品牌色、字号、画布和标题栏样式。
- `shared/模版底图/` 复制内置模板图片，供每页 HTML 相对引用。
- `slides/` 每页一个完整 HTML 文件，天然隔离 CSS。
- `thumbs/` 只在需要画廊概览时生成。
- `output/` 放最终 PDF 或其他交付文件。

## 初始化步骤

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
  font-family: "Microsoft YaHei", "Noto Sans SC", Arial, sans-serif;
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
      font-family: "DengXian", "Microsoft YaHei", sans-serif;
    }
  </style>
</head>
<body>
  <img class="brand-watermark" src="../shared/模版底图/image5.png" alt="">
  <img class="brand-logo" src="../shared/模版底图/image1.png" alt="碧桂园服务">
  <div class="title-bar"><span class="slide-number">02</span>经营摘要</div>

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
npm --prefix <skill-root>/scripts install
npm --prefix <skill-root>/scripts run gen-deck-thumbs -- --slides <project-name>/slides --out <project-name>/thumbs --width 1600 --canvas-w 1280 --canvas-h 720
```

缩略图生成后，在 `index.html` 的 manifest 中补充 `thumb` 字段。

## 导出 PDF

从项目根目录运行：

```bash
npm --prefix <skill-root>/scripts install
npm --prefix <skill-root>/scripts run export-deck-pdf -- --slides <project-name>/slides --out <project-name>/output/<project-name>.pdf --width 1280 --height 720
```

如果 slide 使用 `1920 x 1080` 画布，则改为：

```bash
npm --prefix <skill-root>/scripts run export-deck-pdf -- --slides <project-name>/slides --out <project-name>/output/<project-name>.pdf --width 1920 --height 1080
```

PDF 是高保真、可搜索文本的交付物；如需可编辑 PPTX，应交给 `pptx-design` 的 HTML-to-PPTX 或 PPTX 原生工作流处理。

## 验证

基础验证：

```bash
python <skill-root>/scripts/verify.py index.html --viewports 1280x720 --wait 2000
```

逐页验证建议：

- 直接打开 `slides/*.html` 检查单页。
- 打开 `index.html` 后用方向键逐页翻看。
- 检查 logo、水印、标题栏是否正常。
- 检查是否有横向/纵向溢出。
- 检查表格和图表在投影尺寸下是否可读。

交付前必须确认：

- `index.html` 能打开且所有 iframe 页面不白屏。
- 所有模板图片路径有效。
- 每页都保持 16:9。
- 页面标题是结论式表达。
- 不含 `TODO`、`placeholder`、假数据或未说明的占位图。
