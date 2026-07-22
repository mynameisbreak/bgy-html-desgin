# BGY PPTX 友好 HTML 作者规范

本规范用于 `bgy-html-design` 与 `pptx-design` 的衔接。目标是让 HTML 预览尽量接近原生 PPT，同时在导出 PPTX 时保留可编辑对象：形状转形状，表格转表格，图片转图片，文字转文字，简单 icon 转原生形状。

## 总原则

- PPTX-bound 页面固定使用 `1280 x 720` 画布，标准宽屏输出为 `13.333 x 7.5` 英寸。
- 每页一个完整 HTML 文件，优先放在 `slides/*.html`，导出时传 `--slides-dir`，不要传 iframe 聚合页 `index.html`。
- 文字必须保留真实 DOM 文本，不要把文字放进图片、SVG `<text>`、canvas 或背景图。
- 形状使用真实 DOM/CSS 表达，普通卡片、面板、分割线、圆角矩形、圆形、状态标签不要加 `data-ppt-component`。
- 只有复杂图表、canvas、复杂 SVG、遮罩、滤镜、倒影、复杂渐变或用户接受不可编辑时，才显式标记截图。
- 普通模式用于迭代，最终交付使用 `--mode final`，让 preflight 与 audit 严格拦截误截图和低文字提升率。

## 页面骨架

```html
<section class="slide" data-slide data-bgy-slide data-slide-id="slide-02">
  <img class="brand-watermark" src="../shared/模版底图/image5.png" alt="" data-ppt-no-edit>
  <img class="brand-logo" src="../shared/模版底图/image1.png" alt="碧桂园服务" data-ppt-no-edit>
  <div class="title-bar">
    <span class="slide-number">02</span>
    <span class="slide-title">经营指标保持稳中有进</span>
  </div>
  <main class="slide-body">
    ...
  </main>
</section>
```

推荐类名：

| 元素 | HTML 写法 | PPTX 路由 |
|---|---|---|
| 普通卡片 | `.bgy-card`, `.bgy-panel`, `.bgy-metric-card` | native-shape + editable-text |
| 状态标签 | `.bgy-status-tag` | native-shape + editable-text |
| 分割线 | `.bgy-divider`, `.bgy-line`, `<hr>` | native-shape line |
| 圆点/圆形 | `.bgy-dot`, `.bgy-circle` | native-shape oval |
| 图片 | `<img class="bgy-image">` | native-image |
| 表格 | `<table class="bgy-table">` | native-table |
| 简单 icon | `<svg class="bgy-icon">`，只含 `line/path/rect/circle` 等基础元素 | native-icon |
| 图表占位 | `.chart-frame[data-ppt-placeholder]` | placeholder 坐标记录 |
| 原生图表 | `.chart-frame[data-ppt-chart]` + JSON 数据 | native-chart |
| 复杂视觉 | `[data-ppt-snapshot]` 或 `[data-ppt-force-snapshot]` | screenshot |

## 层级和堆叠

PPTX-bound 页面不要依赖复杂浏览器层叠上下文。普通堆叠视觉应拆成同一层级下的兄弟元素，按“底层先写、上层后写”的 DOM 顺序排列；需要强制顺序时，给视觉元素加数字 `data-ppt-layer`。

```html
<div class="bgy-card" data-ppt-layer="10"></div>
<img class="bgy-image" src="../images/site.jpg" alt="项目现场" data-ppt-layer="20">
<svg class="bgy-icon" data-ppt-layer="30" aria-hidden="true">...</svg>
```

`pptx-design` 会按 `data-ppt-layer`、`data-ppt-z`、`data-ppt-z-index`、数值 CSS `z-index`、DOM 顺序依次确定形状、图片、icon、截图模块、表格和文字写入 PPT 的顺序。子级文字、表格和 icon 会继承最近父级的显式 `data-ppt-layer`，所以一张卡片只需要在外层 wrapper 上标层级，内部文字仍会在卡片形状之上。

避免：

- 嵌套多层 `z-index`、`transform`、`opacity`、`isolation:isolate` 或 `mix-blend-mode` 制造复杂层叠。
- 用 `::before`/`::after` 画需要进入 PPT 的图形。
- 把多个本应可编辑的卡片合成一张大图。

## 形状

推荐使用真实 CSS 属性：

```html
<div class="bgy-card">
  <h3>消防维保完成率保持 100%</h3>
  <p>本月已完成 12 个项目巡检，未发现重大隐患。</p>
</div>
```

```css
.bgy-card {
  position: absolute;
  left: 80px;
  top: 156px;
  width: 340px;
  height: 148px;
  background: #ffffff;
  border: 1px solid #d8e3ea;
  border-radius: 8px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
}
```

可稳定原生化的效果：

- 填充色和透明度。
- 线条颜色、宽度、虚线。
- 圆角矩形、圆形、细水平线、细垂直线。
- 单层简单外阴影。
- 简单旋转。

需要避免或显式截图的效果：

- 多层阴影、内阴影、倒影、复杂发光。
- CSS `filter`、`backdrop-filter`、`mask`、`clip-path`。
- 伪元素视觉，如 `::before`、`::after` 画出来的装饰。
- 大面积复杂渐变背景。

## 线条和箭头

普通水平/垂直线可以使用细 DOM 元素：

```html
<div class="bgy-line" data-ppt-line-end="triangle"></div>
```

```css
.bgy-line {
  position: absolute;
  left: 180px;
  top: 390px;
  width: 280px;
  height: 2px;
  background: #006d9a;
}
```

支持的箭头属性：

- `data-ppt-line-start="arrow|triangle|stealth|diamond|oval|none"`
- `data-ppt-line-end="arrow|triangle|stealth|diamond|oval|none"`
- 兼容别名：`data-ppt-begin-arrow`、`data-ppt-end-arrow`、`data-ppt-arrow-start`、`data-ppt-arrow-end`
- 可选虚线：`data-ppt-line-dash="solid|dash|dot|dashDot|lgDash"`

不要让模型用三角形图片或 SVG marker 来假装箭头。需要箭头时，优先用上述 data 属性。

## 文字

- 页面标题、正文、指标、标签必须是 DOM 文本。
- 多段落需要合并成一个 PPT 文本框时，在容器加 `data-pptx-merge="true"`，内部仍用 `h1`、`p`、`li`。
- 列表使用 `<ul><li>` 或 `<ol><li>`，不要手打 `-`、`*`、`•`。
- 字体使用 `"Microsoft YaHei", "微软雅黑", Arial, sans-serif`，不要用 viewport 单位控制字号。
- 字体颜色、粗体、斜体、透明度、简单文字阴影或发光会按 computed style 输出为 PPT 文本属性。

## 图片

使用真实 `<img>`：

```html
<img class="bgy-image" src="../shared/project-site.jpg" alt="项目现场">
```

快速原生图片路径：

- 本地文件、file URL、data raster 图片。
- 无 `border-radius`、border、filter、mask、clip-path。
- `object-fit: fill`、`cover`、`contain` 或 `scale-down`。

需要圆角、滤镜、遮罩、复杂裁剪时，转换器会截图该图片元素以保持视觉，但仍按图片对象放入 PPT。这比把整页截图快，也更可控。

## 表格

所有业务清单、项目台账、指标明细都必须使用语义表格：

```html
<table class="bgy-table">
  <thead>
    <tr><th>项目</th><th>状态</th><th>责任人</th><th>完成时间</th></tr>
  </thead>
  <tbody>
    <tr><td>消防维保</td><td>已完成</td><td>工程部</td><td>5月31日</td></tr>
  </tbody>
</table>
```

不要用一组 div 模拟表格。简单 `colspan` 可保留为 native table；`rowspan` 或每行有效列数不一致的复杂合并表在 strict/final 导出中会被拦截。确实需要复杂视觉还原时，先简化表格结构，或显式使用 `--visual-tables` 并接受不可编辑风险。

## 图标

默认使用 `assets/icons/line/`、`assets/icons/solid/`、`assets/icons/bgy-business/` 中的本地图标。PPTX-bound 页面不要加载远程图标库，也不要把本地 icon 当作 `<img src="*.svg">` 引用。需要可编辑时，把本地 SVG 内容复制为 inline SVG。

简单线性 icon 可以转为原生形状：

```html
<svg class="bgy-icon" viewBox="0 0 24 24" aria-hidden="true">
  <path d="M20 6 9 17l-5-5" fill="none" stroke="#2e7d32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

可原生化元素：`line`、`polyline`、`polygon`、`rect`、`circle`、`ellipse`、常见 stroked `path`。

会转为图片的 SVG：包含 `filter`、`mask`、`clipPath`、`linearGradient`、`radialGradient`、`pattern`、`image`、`foreignObject`、复杂填充图形或 SVG 文本。

选择本地图标时按 [local-visual-assets.md](local-visual-assets.md) 执行：

- 管理汇报默认用 `icons/line`。
- 状态标签用 `icons/solid`，且一页不要超过 2 种状态色。
- 物业/工程/客服/消防/巡检/收费/工单等业务场景用 `icons/bgy-business`。
- 流程箭头、闭环、矩阵和里程碑轴用 `assets/svg/diagrams`，但真实文本必须留在 DOM 文本节点中。

## 图表

不要从视觉 HTML 自动反推原生 PPT 图表。需要保留图表编辑能力时，先放图表占位：

```html
<div class="chart-frame" data-ppt-placeholder="completion-trend"></div>
```

导出日志和 manifest 会记录该占位的 PPT 坐标。没有数据或只是预览效果时，可以把图表模块标记为 `data-ppt-snapshot`，但要接受它在 PPT 中不可编辑。

有明确数据时，直接使用原生图表契约：

```html
<div
  class="chart-frame"
  data-ppt-chart="bar"
  data-ppt-chart-data='{"labels":["1月","2月","3月"],"series":[{"name":"完成率","values":[82,91,96]}],"colors":["006D9A"]}'>
</div>
```

当前支持 `bar`、`line`、`pie`。不要从 canvas/SVG 视觉图自动反推数据；复杂图表必须提供显式 JSON 数据、使用占位，或作为明确截图例外。

## 动画和交互

动画只服务 HTML 预览。PPTX 导出是静态结果：

- 可保留 `prefers-reduced-motion` 兼容写法。
- 不要让关键状态只存在于动画中。
- 最终 PPTX 需要动画时，应在原生 PPT 阶段显式添加，当前 HTML 转换不自动生成 PPT 动画。

## 预检命令

```bash
npm --prefix <bgy-skill-root>/scripts run pptx-preflight -- --slides-dir <project>/slides
npm --prefix <bgy-skill-root>/scripts run pptx-preflight -- --slides-dir <project>/slides --strict
```

普通模式用于提示风险；`--strict` 用于最终交付前拦截风险。常见拦截点包括 iframe/index 误转、普通卡片误标截图、背景图滥用、伪元素、viewport 单位、复杂 SVG、手打项目符号、div 模拟表格、未命名图表占位等。
