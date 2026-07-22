# 碧桂园服务 PPT HTML 设计

碧桂园服务体系 PPT 专用 HTML 设计技能。用于创建具有碧桂园服务品牌风格的 PPT 式 HTML 幻灯片预览，支持管理汇报、经营复盘、月报/季报、项目提案等多种业务场景。

## 核心特性

- **品牌一致性**：内置碧桂园服务视觉规范，包含品牌主色、字体、Logo、水印等完整品牌资产
- **16:9 固定画布**：默认 1280×720px，确保演示文稿比例统一
- **多文件 HTML Deck**：支持 `index.html + slides/*.html + shared/` 多页聚合演示结构
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
│   ├── icons/                     # 本地 PPT 友好图标库
│   ├── svg/                       # 本地 SVG 视觉组件库
│   └── ppt-base-template/         # 内置 PPT 基础模板及底图
├── references/
│   ├── basic-layout-variants.md   # 基础版式变体说明
│   ├── layouts.md                 # 扩展版式目录
│   ├── components.md              # deck.json 组件规范
│   ├── html-deck-workflow.md      # 多文件 HTML Deck 工作流程
│   ├── pptx-authoring-profile.md  # PPTX 友好 HTML 作者规范
│   ├── local-visual-assets.md     # 本地 icon/SVG 资产使用规范
│   ├── animations.md              # HTML 动画效果目录
│   ├── interactive-components.md  # 交互组件说明
│   ├── brand-asset-checklist.md   # 品牌资产自检清单
│   └── delivery-review-checklist.md # 交付校验清单
├── scripts/
│   ├── gen_deck_thumbs.mjs        # 幻灯片缩略图生成
│   ├── serve_deck.mjs             # 本地 HTML 预览服务器
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
2. **整理大纲**：将用户素材整理成页面大纲，每页标题优先表达结论
3. **选择版式**：为每页选择页面类型（cover、agenda、title-bullets 等）和布局变体
4. **创建 deck.json**：作为内容事实来源
5. **生成 HTML**：基于固定 16:9 画布和内置模板资产生成 HTML 幻灯片
6. **交付校验**：检查品牌一致性、视觉层级、内容完整性

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

## 使用要求

- 使用 `lang="zh-CN"` 和 UTF-8 编码
- 每页使用固定尺寸容器，设置 `overflow: hidden`
- 模板图片路径必须相对 HTML 文件有效
- 标题写结论，不写泛泛标签（如用"5月消防维保完成率保持100%"而非"消防维保情况"）
- 数据必须配解释，不堆砌指标

## 许可证

本项目为碧桂园服务内部使用工具。
