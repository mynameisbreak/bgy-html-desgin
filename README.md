# 碧桂园服务 PPT HTML 设计

碧桂园服务体系 PPT 专用 HTML 设计技能。用于创建具有碧桂园服务品牌风格的 PPT 式 HTML 幻灯片预览，支持管理汇报、经营复盘、月报/季报、项目提案等多种业务场景。

## 核心特性

- **品牌一致性**：内置碧桂园服务视觉规范，包含品牌主色、字体、Logo、水印等完整品牌资产
- **16:9 固定画布**：默认 1280×720px，确保演示文稿比例统一
- **多文件 HTML Deck**：支持 `index.html + slides/*.html + shared/` 多页聚合演示结构
- **项目级设计契约**：可在项目根目录生成 `bgy.project.json`、Project Studio 工作台和共享组件 CSS，保证逐页生成时主题色、字体、组件样式一致
- **汇报组件库**：内置 KPI、Card、Chart、Progress、Comparison、Ranking、Process、Timeline、Risk、Image/Case 等 PPT 友好组件
- **服务器预览**：内置零依赖本地静态服务器，适合检查相对路径、中文路径和 iframe 聚合页
- **本地视觉资产库**：内置 PPT 友好的线性 icon、状态 icon、物业业务 icon、流程 SVG、空状态和克制纹理，避免远程 CDN 和临场乱画
- **场景模板丰富**：覆盖管理汇报、经营分析、节能降本、维修/公维资金、社区运营等常见场景
- **交付质量可控**：内置 preflight、缩略图生成和可编辑 PPTX 交接检查

## 品牌视觉

| 项目 | 取值 | 用途 |
|---|---|---|
| 品牌主蓝 | `#006D9A` | 标题、章节编号、关键线条、图表强调 |
| 深蓝 | `#004B6B` | 高强调标题、深色文字点缀 |
| 警示红 | `#C00000` | 风险、逾期、负向偏差 |
| 成效绿 | `#2E7D32` | 改善、完成、正向经营结果 |
| 正文深灰 | `#1F2933` | 正文与说明文字 |

字体：默认全篇使用 `Microsoft YaHei` / `微软雅黑`，英文、数字、表格和页码也跟随微软雅黑；只有用户明确要求时才使用特殊数字字体或品牌字体。

## 项目结构

```text
bgy-html-design/
├── assets/
│   ├── deck_index.html            # 多页 HTML deck 聚合演示器
│   ├── deck_stage.js              # 1-4 页轻量单文件演示组件
│   ├── design_canvas.jsx          # 封面/重点页多方案对比组件
│   ├── icon-gallery.html          # 本地图标/SVG 资产预览页
│   ├── project-presets/           # 项目级主题 preset
│   ├── icons/                     # 本地 PPT 友好图标库
│   ├── svg/                       # 本地 SVG 视觉组件库
│   └── ppt-base-template/         # 内置 PPT 基础模板及底图
├── references/
│   ├── basic-layout-variants.md   # 基础版式变体说明
│   ├── layouts.md                 # 扩展版式目录
│   ├── components.md              # deck.json 组件规范
│   ├── html-deck-workflow.md      # 多文件 HTML Deck 工作流程
│   ├── project-design-contract.md # 项目级设计契约
│   ├── pptx-authoring-profile.md  # PPTX 友好 HTML 作者规范
│   ├── local-visual-assets.md     # 本地 icon/SVG 资产使用规范
│   ├── animations.md              # HTML 动画效果目录
│   ├── interactive-components.md  # 交互组件说明
│   ├── brand-asset-checklist.md   # 品牌资产自检清单
│   └── delivery-review-checklist.md # 交付校验清单
├── scripts/
│   ├── gen_deck_thumbs.mjs        # 幻灯片缩略图生成
│   ├── serve_deck.mjs             # 本地 HTML 预览服务器
│   ├── init_bgy_project.mjs       # 初始化项目级配置与共享组件
│   ├── sync_bgy_project.mjs       # 从 bgy.project.json 同步共享 CSS/配置页
│   ├── project_config.mjs         # 项目配置读取、合并、token 生成
│   ├── project_files.mjs          # Project Studio/样例页生成
│   ├── pptx_preflight.mjs         # PPTX 转换前结构检查
│   ├── export_bgy_pptx.mjs        # 转为可编辑 PPTX
│   ├── build_icon_assets.mjs      # 生成本地图标/SVG 资产
│   ├── build_icon_gallery.mjs     # 生成图标预览页
│   ├── runtime.mjs                # 共享运行时/依赖定位
│   └── verify_html.mjs            # Playwright 截图校验
└── SKILL.md                       # 技能说明文档
```

## 工作流程

1. **判断场景**：管理汇报、月度/季度复盘、项目提案、经营分析等
2. **锁定项目主题**：项目型任务先生成或同步 `bgy.project.json`，确认 preset、颜色、字体、圆角、阴影和组件样式
3. **整理大纲**：将用户素材整理成页面大纲，每页标题优先表达结论
4. **选择版式**：为每页选择页面类型（cover、agenda、title-bullets 等）和布局变体
5. **创建 deck.json**：作为内容事实来源
6. **生成 HTML**：基于固定 16:9 画布、项目级 shared CSS 和内置模板资产生成 HTML 幻灯片
7. **交付校验**：检查品牌一致性、视觉层级、内容完整性

## 页面类型

支持以下基础页面类型：

- `cover` — 封面
- `agenda` — 目录
- `section` — 章节页
- `title-bullets` — 标题+要点
- `two-column` — 双栏
- `image-text` — 图文混排
- `comparison` — 对比
- `timeline` — 时间线
- `table` — 表格
- `chart` — 图表
- `quote` — 引用

## 适用场景

- 📊 管理汇报与经营复盘
- 📋 月报 / 季报 / 年报
- 🏗️ 项目提案与方案汇报
- 💡 节能降本专题汇报
- 🔧 维修、公维资金、消防维保台账
- 🏘️ 社区运营与客户服务汇报
- 📈 品质提升与经营分析

## 项目级配置

新建或规范一个项目时，优先使用内置脚本生成项目根目录：

```bash
npm --prefix <bgy-html-design>/scripts run init-project -- --dir <project> --title "<项目标题>" --preset management-report --locked
```

用服务器模式打开 Project Studio，可以直接保存到 `bgy.project.json` 并同步共享样式：

```bash
npm --prefix <bgy-html-design>/scripts run serve -- --root <project> --entry project-config.html --project-api --port auto --open
```

`project-config.html` 是主入口：采用浅色 Photoshop/Slidev 式工作台，左侧是工作区导航和组件分类目录，中间按“画布 / 组件 / 主题”切换唯一主工作区，右侧只显示当前模式相关的属性检查器。先选择 preset，必要时切到自定义主题调整颜色、圆角、阴影、图标包和表格密度；主题变化会实时作用到画布和组件预览。

`project-style-board.html` 是兼容入口：打开同一个 Project Studio，但默认进入组件面板。按 KPI、Card、Chart、Progress、Comparison、Ranking、Process、Timeline、Risk、Image/Case 滚动展示组件预览。新增组件时应同步加入这里，避免后续页面临场发明样式。

组件库默认优先服务 HTML 转 PPTX：卡片、指标、进度、流程、时间线、风险矩阵用真实 DOM/CSS 转原生形状；表格使用真实 `<table>`；图片使用真实 `<img>`；柱状图、折线图、饼图用 `data-ppt-chart` 携带数据；雷达图、瀑布图、复杂组合图先用 `data-ppt-placeholder` 保留坐标，不从视觉反推数据。

修改配置后可重新同步：

```bash
npm --prefix <bgy-html-design>/scripts run sync-project -- --root <project>
```

可用 preset：`management-report`、`monthly-review`、`proposal`、`maintenance`、`quality-improvement`、`fire-safety`。

## 使用要求

- 使用 `lang="zh-CN"` 和 UTF-8 编码
- 每页使用固定尺寸容器，设置 `overflow: hidden`
- 模板图片路径必须相对 HTML 文件有效
- 标题写结论，不写泛泛标签（如用"5月消防维保完成率保持100%"而非"消防维保情况"）
- 数据必须配解释，不堆砌指标

## 许可证

本项目为碧桂园服务内部使用工具。
