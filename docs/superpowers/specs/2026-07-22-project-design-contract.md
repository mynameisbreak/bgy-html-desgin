# 项目级设计契约

## 目标

解决同一项目内多页 HTML 反复生成时的主题漂移问题，避免出现：

- 主题色每页不同
- 组件圆角、阴影、线条、文字颜色不统一
- 图标库和 SVG 写法不一致
- PPTX 导出时可编辑性和还原度波动

## 核心思路

把“项目设计”从“页面生成”中拆出来，形成固定顺序：

1. 新建项目时先生成 `bgy.project.json`
2. 通过根目录 `project-config.html` Project Studio 选 preset、微调主题、锁定项目
3. 生成 `shared/tokens.css` 和 `shared/components.css`
4. 每一页 HTML 只能复用项目 token 和组件类
5. `pptx_preflight` 在导出前检查是否偏离项目契约

## 目录结构

```text
<project>/
  bgy.project.json
  project-config.html      # Project Studio 主入口
  project-style-board.html # Project Studio 兼容入口，默认打开组件面板
  presets/
  shared/
    tokens.css
    components.css
    模版底图/
  deck.json
  index.html
  slides/
  output/
```

## 配置内容

`bgy.project.json` 负责锁定以下内容：

- 项目标题、项目类型、preset
- 是否已锁定主题
- 主色、辅色、语义色、正文色、背景色
- 字体栈
- 卡片圆角、阴影、边线、标签样式
- 图标库偏好
- PPTX 可编辑优先级

原则：

- 允许手动确认一次
- 锁定后全项目复用
- 不允许每页临场换色

## 内置 preset

至少提供这些预设：

- `management-report`
- `monthly-review`
- `proposal`
- `maintenance`
- `quality-improvement`
- `fire-safety`

每个 preset 都必须包含：

- 默认色板
- 默认字体
- 默认组件风格
- 默认图标包
- 默认表格密度

## 控制台页面

`project-config.html` 负责：

- 选择 preset
- 调整主题色与字体
- 调整组件圆角、阴影、边线
- 以浅色 Photoshop/Slidev 式工作台分别承载画布、组件展廊和主题效果板
- 预览标题、卡片、表格、指标、标签、图标
- 导出或写回 `bgy.project.json`
- 生成或同步 `shared/tokens.css`、`shared/components.css`

`project-style-board.html` 负责：

- 打开同一套 Project Studio，并默认进入组件面板
- 提供当前项目主题下的滚动组件预览
- 作为页面生成前的视觉确认页和后续组件插入功能的数据入口

## 生成规则

页面生成时遵守：

- 优先读取 `bgy.project.json`
- 只使用项目 token，不临时新增颜色
- 只使用项目组件类，不自己拼新的圆角/阴影风格
- 图标优先使用本地 inline SVG
- PPTX-bound 页面继续遵守 `pptx-authoring-profile.md`

## 校验规则

`pptx_preflight` 需要增加项目级检查：

- 是否存在 `bgy.project.json`
- 是否已锁定项目主题
- 是否引用了 `shared/tokens.css` 和 `shared/components.css`
- 是否出现未声明的颜色、字体、阴影、圆角
- 是否使用远程 icon 库
- 是否出现 div 假表格、复杂 SVG、伪元素图形、截图误用

## 预期效果

- 同一项目所有页面的颜色、字体、组件样式稳定一致
- 新项目开工只需选 preset，不必每页重新定主题
- PPTX 导出时更容易保持原生形状、文本、表格和图标
- 减少 AI 临场判断，降低漂色、漂样式、漂组件的问题
