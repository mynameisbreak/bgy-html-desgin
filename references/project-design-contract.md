# 项目级设计契约

同一项目一页一页生成 HTML 时，必须先建立项目级设计契约。不要让每页临场决定主题色、字体、组件圆角、阴影和文字颜色。

## 适用场景

- 用户明确说“新建项目”“一个项目分多页生成”“保持整套 PPT 风格一致”。
- 预计同一项目会分多次生成页面。
- 后续需要导出可编辑 PPTX。
- 用户抱怨颜色、组件、字体、阴影每页不一致。

## 推荐目录

```text
<project>/
  bgy.project.json
  project-config.html
  project-style-board.html
  presets/
  deck.json
  index.html
  shared/
    tokens.css
    components.css
    模版底图/
  slides/
  output/
```

## 初始化命令

```bash
npm --prefix <bgy-skill-root>/scripts run init-project -- \
  --dir <project> \
  --title "<项目标题>" \
  --preset management-report \
  --locked
```

可用 preset：

- `management-report`
- `monthly-review`
- `proposal`
- `maintenance`
- `quality-improvement`
- `fire-safety`

## 配置页面

用服务器模式打开根目录配置页：

```bash
npm --prefix <bgy-skill-root>/scripts run serve -- \
  --root <project> \
  --entry project-config.html \
  --project-api \
  --port auto \
  --open
```

`project-config.html` 可以选择 preset、调整颜色、圆角、阴影、图标包和锁定状态。使用 `--project-api` 打开时，保存会直接写回：

- `bgy.project.json`
- `shared/tokens.css`
- `shared/components.css`
- `project-config.html`
- `project-style-board.html`

如果只是双击 HTML 或普通静态预览，页面只能下载 `bgy.project.json`，不能直接写回文件。

## 同步命令

修改 `bgy.project.json` 后，用同步命令重建共享样式和看板：

```bash
npm --prefix <bgy-skill-root>/scripts run sync-project -- --root <project>
```

## 页面生成规则

每个 `slides/*.html` 必须：

- 引入 `../shared/tokens.css`
- 引入 `../shared/components.css`
- 使用 `bgy.project.json` 的主题和组件规则
- 优先使用 `.bgy-card`、`.bgy-panel`、`.bgy-metric-card`、`.bgy-table`、`.bgy-status-tag`、`.bgy-divider` 等共享组件类
- 不直接发明新 hex 颜色、字体、阴影、圆角
- 不使用远程 icon 库
- 表格必须使用真实 `<table>`
- 需要稳定层级时使用 `data-ppt-layer`

## 导出命令

```bash
npm --prefix <bgy-skill-root>/scripts run export-bgy-pptx -- \
  --slides-dir <project>/slides \
  --project-root <project> \
  --out <project>/output/<name>.pptx \
  --mode normal
```

`export-bgy-pptx` 会把项目配置传给 preflight，并自动把 BGY 组件 selector 交给 `pptx-design`，减少普通卡片、指标卡、标签被误转为截图的概率。

## 预检拦截

项目根目录存在 `bgy.project.json` 时，`pptx-preflight` 会检查：

- 项目主题是否锁定
- slide 是否引入 `tokens.css` 和 `components.css`
- 是否出现项目外颜色
- 是否出现项目外字体
- 是否出现项目外圆角或阴影
- 是否出现远程 icon、SVG 图片 icon、div 假表格、复杂 SVG 或截图误用

最终交付前使用 strict：

```bash
npm --prefix <bgy-skill-root>/scripts run pptx-preflight -- \
  --slides-dir <project>/slides \
  --project-root <project> \
  --strict
```
