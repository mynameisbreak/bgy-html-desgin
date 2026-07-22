---
name: bgy-html-design
description: 碧桂园服务/碧桂园体系 PPT 专用 HTML 设计技能。适用于创建、改写、润色或转换带有碧桂园服务品牌风格的 PPT、HTML 幻灯片预览、管理汇报、经营复盘、物业服务汇报、项目提案、月报/季报/年报、品质提升、节能降本、公维资金、消防维保、社区运营、客户服务、经营分析等文稿；凡是需要沿用内置碧桂园服务 PPT 模板和品牌视觉体系的演示文稿，都应使用本技能。
---

# 碧桂园服务 PPT HTML 设计

使用本技能生成具有碧桂园服务品牌风格的 PPT 式 HTML 幻灯片。主要交付物是固定 16:9 比例的 HTML deck：多页项目默认输出 `index.html + slides/*.html` 聚合演示版；单页任务可只输出一个 HTML 文件。HTML 可直接预览，也可作为后续制作可编辑 PPTX 的视觉与内容来源。

## 核心定位

以碧桂园服务企业汇报设计师的标准工作：页面要符合内部管理汇报气质，层级清晰、视觉克制、结论明确、证据充分，并持续保持品牌资产一致。

除非用户明确提供其他模板，默认使用技能内置的碧桂园服务基础模板：

- `assets/ppt-base-template/PPT基础模版.html`
- `assets/ppt-base-template/模版底图/image1.png`
- `assets/ppt-base-template/模版底图/image5.png`
- `assets/deck_index.html`，多页 HTML deck 的默认聚合演示器
- `assets/icons/line/`、`assets/icons/solid/`、`assets/icons/bgy-business/`，PPT 友好的本地图标库
- `assets/svg/diagrams/`、`assets/svg/patterns/`、`assets/svg/empty-states/`，克制的本地 SVG 视觉组件库
- `assets/icon-gallery.html`，本地图标与 SVG 资产预览页

右上角小 logo 与右下角浅色水印属于默认品牌框架。除封面、章节页或用户明确要求更换母版外，应保留其位置与视觉关系。

涉及外部项目照片、现场图、设备图、数据截图、合作方 logo 或用户提供的新品牌模板时，先读取 [references/brand-asset-checklist.md](references/brand-asset-checklist.md) 做资产自检。
涉及 HTML deck 交付、后续 PPTX 转换、或需要按 huashu-design 标准做反 AI slop 审查时，读取 [references/huashu-quality-gates.md](references/huashu-quality-gates.md)。
凡是后续需要导出可编辑 PPTX，必须先读取 [references/pptx-authoring-profile.md](references/pptx-authoring-profile.md)，按其中的 DOM、类名和 `data-ppt-*` 契约生成 HTML。
凡是页面需要图标、流程箭头、空状态、框架图或轻量装饰 SVG，必须先读取 [references/local-visual-assets.md](references/local-visual-assets.md)，优先复用本地资产，不要默认加载远程 icon CDN。

## 工作流程

1. 判断文稿场景：管理汇报、月度/季度复盘、项目提案、经营分析、品质服务、节能降本、维修/公维资金、培训课件或客户沟通。
2. 将用户素材整理成页面大纲，每页标题必须优先表达结论。
3. 为每页选择一个 `slide type` 和一个 `layoutVariant`。
4. 创建或更新 `deck.json`，作为内容事实来源。
5. 页数大于 1 页时，优先按 [references/html-deck-workflow.md](references/html-deck-workflow.md) 创建多文件 HTML deck。
6. 如果要导出 PPTX，按 [references/pptx-authoring-profile.md](references/pptx-authoring-profile.md) 控制 HTML 结构，减少 AI 判断和截图兜底。
7. 基于固定 16:9 画布和内置模板资产生成 HTML。
8. 交付前检查页面边界、文字密度、品牌一致性和本地资源路径。

只有在缺失信息会阻塞输出时才追问，例如受众未知、页数要求未知、关键数据缺失等。

## 品牌视觉体系

默认使用以下视觉规范：

| 项目 | 取值 | 用途 |
|---|---|---|
| 品牌主蓝 | `#006D9A` | 标题、章节编号、关键线条、图表强调 |
| 深蓝 | `#004B6B` | 高强调标题、深色文字点缀 |
| 警示红 | `#C00000` | 风险、逾期、负向偏差、紧急事项 |
| 成效绿 | `#2E7D32` | 改善、完成、正向经营结果 |
| 正文深灰 | `#1F2933` | 正文与说明文字 |
| 辅助灰 | `#64748B` | 注释、辅助标签、说明信息 |
| 浅底色 | `#F5F8FA` | 表头、浅色信息面板 |
| 分隔线 | `#D8E3EA` | 表格线、分割线、弱边框 |

字体规则：

- 默认全篇使用 `Microsoft YaHei` / `微软雅黑`，包括中文、英文、数字、图表标签和页码。
- 不要默认引入 `Oswald`、`DIN`、`Noto Sans SC`、`DengXian` 或系统 UI 字体；只有用户明确要求特殊数字字体或品牌字体时才可使用，并需在交付说明中注明。
- HTML 根节点、`body`、`.slide`、表格、指标卡、页码和标题栏都应继承同一套微软雅黑字体栈：`"Microsoft YaHei", "微软雅黑", Arial, sans-serif`。
- 加粗只用于页面标题、章节标签、关键指标和短句强调。

表达语气：

- 使用企业管理汇报语言，准确、克制、面向行动。
- 标题写结论，不写泛泛标签。例如用 `5月消防维保完成率保持100%`，不要只写 `消防维保情况`。
- 数据必须配解释。不要只堆指标而不说明业务含义。

## 版式规则

使用固定 16:9 画布。内置 HTML 模板为 `1280 x 720px`；如果制作高清独立 HTML，可使用 `1920 x 1080px`，但必须保持同一比例。

`deck.json` 使用 PowerPoint 英寸坐标：

- 画布：`13.333 x 7.5`
- 左右安全边距：至少 `0.75`
- 顶部安全边距：至少 `0.6`
- 底部安全边距：至少 `0.5`
- 除封面和章节页外，正文内容应位于标题栏下方。
- 每个组件必须显式给出 `x`、`y`、`w`、`h`。

文字密度：

| 元素 | 限制 |
|---|---|
| 封面标题 | 尽量不超过 18 个汉字 |
| 页面标题 | 一个结论句，通常 16-28 个汉字 |
| 单页要点 | 不超过 5 条 |
| 单条要点 | 不超过 24 个汉字 |
| 正文总量 | 单页尽量不超过 90 个汉字 |
| 表格 | 优先控制在 3-6 列、3-8 行 |

如果内容过密，应拆页处理，不要通过缩小字号解决可读性问题。

## 页面类型

优先使用以下基础页面类型：

- `cover`
- `agenda`
- `section`
- `title-bullets`
- `two-column`
- `image-text`
- `comparison`
- `timeline`
- `table`
- `chart`
- `quote`

选择基础 `layoutVariant` 时，按需读取 [references/basic-layout-variants.md](references/basic-layout-variants.md)。

只有当基础类型无法表达页面时，才读取 [references/layouts.md](references/layouts.md)，例如甘特图、流程图、行动号召页、致谢页、代码/演示页或网页感展示页。

一页只保留一个主布局，不要把多个互不相关的布局硬拼到同一页。

## deck.json 规范

`deck.json` 是内容事实来源。HTML 应从同一数据结构渲染，或至少内嵌同一份数据。

顶层结构：

```json
{
  "meta": {
    "title": "5月节能降本工作汇报",
    "theme": "bgy-services",
    "template": "bgy-services-base",
    "archetype": "operation-report",
    "ratio": "16:9",
    "mode": "html-preview"
  },
  "slides": []
}
```

单页结构：

```json
{
  "id": "slide-01",
  "label": "封面",
  "type": "cover",
  "layoutVariant": "hero-left",
  "components": []
}
```

每个组件必须包含：

- `id`
- `type`
- `x`
- `y`
- `w`
- `h`

常用组件类型：

- `title`
- `subtitle`
- `text`
- `bullet-list`
- `image`
- `table`
- `chart`
- `quote-block`
- `divider`
- `shape`
- `metric-card`
- `status-tag`

编写或修复组件 JSON 时，按需读取 [references/components.md](references/components.md)。

## HTML 规则

默认输出可直接预览的 HTML 文件。多页项目优先使用 `index.html + slides/*.html + shared/` 结构；单页任务可输出单个 HTML。本地图片资源应复制到相对路径可访问的位置，或保持与 HTML 文件匹配的相对引用。

多页 HTML deck 规则：

- 先读取 [references/html-deck-workflow.md](references/html-deck-workflow.md)。
- 从 `assets/deck_index.html` 复制生成项目的 `index.html`。
- 每页独立保存到 `slides/`，避免跨页 CSS 污染。
- 共用品牌 token、logo、水印和模板底图放到 `shared/`。
- 在 `index.html` 的 `window.DECK_MANIFEST` 中登记每页路径和标题。
- 需要画廊缩略图时使用 `scripts/gen_deck_thumbs.mjs`。

可选组件规则：

- 用户需要封面或重点页多方案对比时，读取 [references/interactive-components.md](references/interactive-components.md)，使用 `assets/design_canvas.jsx`。
- 只有 1-4 页轻量单文件演示时，才可读取 [references/interactive-components.md](references/interactive-components.md)，使用 `assets/deck_stage.js`。
- `assets/deck_stage.js` 不作为默认架构；5 页及以上必须回到多文件 HTML deck。

本地视觉资产规则：

- 图标和装饰性 SVG 必须优先使用本地资产库，选择规则见 [references/local-visual-assets.md](references/local-visual-assets.md)。
- PPTX-bound 页面中，图标优先复制本地 SVG 内容为 inline SVG，并保持 `path/line/polyline/rect/circle/ellipse` 等简单元素，便于 `pptx-design` 转成原生 icon 形状。
- 不要在 PPTX-bound HTML 中加载 Lucide、Font Awesome、Iconfont、Remix、Bootstrap Icons 等远程图标库。
- 不要把本地 icon 作为 `<img src="*.svg">` 使用，除非明确接受它在 PPT 中成为图片。

强制要求：

- 使用 `lang="zh-CN"` 和 UTF-8。
- 每页使用固定尺寸的 `.slide` 或 `.ppt-slide` 容器。
- 每页设置 `overflow: hidden`。
- 对高保真页面使用绝对定位摆放组件。
- 用 `<script type="application/json" id="deckData">` 内嵌演示数据。
- 模板图片路径必须相对 HTML 文件有效。
- 幻灯片内容不要使用视口单位字号。
- 不添加无关渐变、光斑、装饰插画或混用图标库。
- 不编造 KPI、客户评价、项目照片、系统截图或现场素材；缺素材时使用标注清楚的 `待补素材` 占位。
- 不用 CSS/SVG 重画真实 logo、设备、项目现场、建筑或产品图。

复用内置模板时必须保留：

- 右上角碧桂园服务 logo。
- 右下角浅色品牌水印。
- 标题栏位置和品牌蓝。
- 白底页面和适度投影的浏览器预览效果。

## 场景处理

经营管理汇报：

- 先给管理结论。
- 内容按 `目标 / 完成情况 / 问题风险 / 下一步动作` 组织。
- 项目清单用表格，趋势或完成率对比用图表。
- 异常用红色、完成用绿色、核心指标用品牌蓝。

月报或季报：

- 封面后设置经营摘要页。
- 先展示 3-5 个核心指标，再展开详细页面。
- 一页只讲一个主题，例如安全、服务、品质、成本、收入、社区、风险、下月计划。

项目提案：

- 按 `背景痛点 / 目标方案 / 实施路径 / 资源需求 / 预期收益 / 风险控制` 组织。
- 每页都要回答一个决策者关心的问题。

节能降本：

- 区分 `已完成降本`、`进行中措施`、`待协调事项`。
- 必须展示基准值、当前值、变化量和业务解释。

维修、公维资金、消防维保：

- 优先使用表格，字段包括项目名称、责任人、状态、金额/日期、风险说明。
- 状态标签统一为 `已完成`、`推进中`、`待审批`、`需协调`、`逾期风险`。

## 动画

动画仅用于 HTML 预览或演示 Demo，保持克制。

默认可用效果：

- `fade-up`
- `rise-in`
- `wipe-right`
- `count-up`
- `shimmer-sweep`，仅用于封面或章节页

只有当用户明确需要动画或演示效果时，才读取 [references/animations.md](references/animations.md)。必须尊重 `prefers-reduced-motion: reduce`。

## 工具脚本

按需使用以下内置脚本：

- `scripts/gen_deck_thumbs.mjs`：为 `slides/*.html` 生成 `thumbs/*.jpg` 缩略图，用于 `deck_index.html` 的画廊概览。
- `scripts/serve_deck.mjs`：启动零依赖本地静态服务器预览 `index.html + slides/*.html`。
- `scripts/pptx_preflight.mjs`：静态检查 PPTX 转换前的常见结构风险，减少误截图和聚合页误转。
- `scripts/export_bgy_pptx.mjs`：调用 `pptx-design` 将 BGY HTML 转为可编辑 PPTX。
- `scripts/verify_html.mjs`：用 `pptx-design` 的 Playwright 环境打开 HTML、截图并收集控制台错误。
- `scripts/build_icon_assets.mjs` / `scripts/build_icon_gallery.mjs`：生成本地图标/SVG 资产和 `assets/icon-gallery.html` 图库页。
- `assets/design_canvas.jsx`：封面/重点页多方案对比组件。
- `assets/deck_stage.js`：1-4 页轻量单文件演示组件，不用于正式多页 deck。
- `assets/icon-gallery.html`：本地图标与 SVG 视觉资产预览页。
- `references/local-visual-assets.md`：本地图标、业务 SVG、流程 SVG、空状态资产的选择和 PPTX 转换约束。
- `references/pptx-authoring-profile.md`：BGY HTML 与 `pptx-design` 的结构契约，规定形状、图片、文字、表格、图标、图表占位和截图例外。
- `references/huashu-quality-gates.md`：复制兼容、品牌资产、组件纪律、反 AI slop 和交付评审门禁。

BGY 脚本自身不声明 npm 依赖；需要浏览器时复用 `pptx-design` 的 Playwright 环境。不要把 `node_modules` 写入 skill 根目录。

## 禁止事项

禁止：

- 把视觉风格改成通用 SaaS、科技风或营销网页风。
- 用纯文字替代碧桂园服务 logo。
- 单页使用超过三种辅助色。
- 用低对比度灰色呈现关键经营数据。
- 在浅色水印上堆放影响阅读的正文。
- 在密集汇报页使用过大的海报式标题。
- 用长段落填满页面。
- 输出不含内嵌或配套 `deck.json` 数据的 HTML。

## PPTX 交接补充规范

需要可编辑 PPTX 时，优先使用 `scripts/export_bgy_pptx.mjs`，不要把 `index.html` 的 iframe 聚合页直接截图成 PPT。
开始写 HTML 前先读取 [references/pptx-authoring-profile.md](references/pptx-authoring-profile.md)，避免普通元素被误标为截图模块。

- 多文件 deck 用 `--slides-dir <project>/slides` 交给 `pptx-design`；每个 `slides/*.html` 应是一页完整 `1280 x 720` HTML。
- 普通卡片、面板、分割线、圆形、状态标签、指标框用真实 DOM/CSS 表达，不要加 `data-ppt-component`；让 `pptx-design` 转成原生 PPT 形状。
- 表格必须使用语义化 `<table>`；图片必须使用真实 `<img>`；文字必须保留真实 DOM 文本；线性 SVG icon 优先使用简单 `line/path/rect/circle`，便于转成 PPT 原生 icon 形状。
- 线条/箭头使用 `data-ppt-line-start`、`data-ppt-line-end` 和 `data-ppt-line-dash` 显式声明，不要用图片或 SVG marker 猜测箭头。
- 堆叠视觉用简单兄弟元素逐层表达，DOM 按底层到上层排列；需要稳定层级时使用数字 `data-ppt-layer`、`data-ppt-z` 或 `data-ppt-z-index`，不要依赖复杂嵌套 `z-index`、伪元素或混合模式。
- 图表没有明确数据时用 `data-ppt-placeholder` 记录坐标；有明确数据时使用 `data-ppt-chart="bar|line|pie"` 和 `data-ppt-chart-data` JSON 直接转为原生 PPT 图表，不从视觉 HTML/canvas/SVG 反推数据。
- 只有 canvas 图表、复杂 SVG、复杂滤镜/遮罩/倒影、无法原生还原的复合视觉模块，才允许显式截图；大面积截图必须先确认用户接受不可编辑风险。
- 默认不要使用 `--auto-snapshots`、`--no-module-screenshots`、`--debug-overlay`、`--keep-assets` 或 `--wait-until networkidle`；这些只用于诊断或明确的高保真截图例外。
- 普通迭代用 `npm --prefix <skill-root>/scripts run export-bgy-pptx -- --slides-dir <project>/slides --out <project>/output/<deck>.pptx --mode normal`。
- 最终交付用 `--mode final`，它会触发 `pptx-design` 的 strict authoring 和 `audit-pptx --strict`。
- 开发快速预览用 `--mode draft`，它会降低截图倍率并跳过 PPTX zip 复查和 audit。
- 导出前默认运行 `pptx_preflight.mjs`，用代码检查 `index.html` 误转、普通卡片截图标记、标题栏裸文本等常见问题。
- 如果 Playwright 的 Chromium 未安装，BGY 浏览器脚本会自动尝试系统 Edge/Chrome；也可追加 `--browser-channel msedge` 显式指定。

## 交付校验

默认只做轻量校验；当页数较多、要对外正式交付、用户要求评审，或页面存在密集表格/复杂图表/外部素材时，再读取 [references/delivery-review-checklist.md](references/delivery-review-checklist.md) 做完整评审。

完成前必须确认：

- HTML 可打开；多页 deck 的 `index.html` 能加载所有 `slides/*.html`。
- 本地品牌图片路径有效；默认模板的 logo 和水印正常显示。
- 页面保持 16:9，内容未明显越界，标题是结论式表达。
- 可运行且风险较高时，用 `scripts/verify_html.mjs` 截图抽查 1-3 页；不要为简单单页默认做全量截图。
- 无法执行的校验步骤必须在最终回复中说明。
