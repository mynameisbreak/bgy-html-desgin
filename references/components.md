# Components and output examples

这份文件保存 `ppt-design` 的常用组件 schema 示例，以及单页输出示例。

用途：
- 当需要生成或修正 `deck.json` 组件结构时读取
- 当需要具体组件字段示例而不是高层规则时读取

## 组件最小规则

每个组件都必须包含：
- `id`
- `type`
- `x`
- `y`
- `w`
- `h`

建议额外包含：
- `label`
- `style`

## 项目级 HTML 组件库

同一项目生成页面时，优先复用 `shared/components.css` 中的 `.bgy-*` 组件类。新增页面不要在单页里重新发明圆角、阴影、表格、进度条或风险标签样式。

### MVP 组件分类

| 类别 | 推荐组件类 | PPTX 规则 |
|---|---|---|
| KPI 指标 | `.bgy-kpi-card`、`.bgy-metric-card`、`.bgy-target-card`、`.bgy-delta-card` | 真实 DOM 文本 + 原生形状 |
| Card 卡片 | `.bgy-card`、`.bgy-data-card`、`.bgy-project-card`、`.bgy-highlight-card`、`.bgy-risk-card`、`.bgy-conclusion-card` | 不加截图标记 |
| Chart 图表 | `.bgy-chart-frame` | 有数据用 `data-ppt-chart="bar|line|pie"`；雷达/瀑布/环形先用 `data-ppt-placeholder` |
| Progress 进度 | `.bgy-progress`、`.bgy-progress__track`、`.bgy-progress__bar`、`.bgy-ring-progress`、`.bgy-stage-progress`、`.bgy-milestone-list` | 进度条转形状；环形进度文字必须留 DOM |
| Comparison 对比 | `.bgy-comparison`、`.bgy-compare-card`、`.bgy-before-after`、`.bgy-target-card` | 对比项用兄弟 DOM，避免合成大图 |
| Ranking 排名 | `.bgy-ranking-list`、`.bgy-ranking-card` | 使用 `<ol><li>`，排名和数值保持文本 |
| Process 流程 | `.bgy-process`、`.bgy-process-step`、`.bgy-process-line`、`.bgy-process-loop`、`.bgy-pdca` | 箭头用 `data-ppt-line-end="triangle"` 等属性 |
| Timeline 时间轴 | `.bgy-timeline`、`.bgy-timeline-item`、`.bgy-timeline-dot`、`.bgy-roadmap` | 节点和文本分开写，层级按 DOM 顺序 |
| Risk / Problem | `.bgy-risk-card`、`.bgy-risk-level`、`.bgy-risk-matrix`、`.bgy-risk-action` | 风险等级用语义色 token |
| Image / Case | `.bgy-image-frame`、`.bgy-image-placeholder`、`.bgy-image-card`、`.bgy-case-card`、`.bgy-image-grid`、`.bgy-image-text` | 真实素材用 `<img>`；缺素材用占位，文字不要进图片 |

### 原生图表示例

```html
<div
  class="bgy-chart-frame"
  data-ppt-chart="bar"
  data-ppt-chart-data='{"labels":["一区","二区","三区"],"series":[{"name":"完成率","values":[82,91,96]}],"colors":["006D9A","2E7D32","C97400"]}'>
  <div class="bgy-chart-bars" aria-hidden="true">
    <span class="bgy-chart-bar" style="height:82%"></span>
    <span class="bgy-chart-bar" style="height:91%"></span>
    <span class="bgy-chart-bar" style="height:96%"></span>
  </div>
</div>
```

### 复杂图表占位示例

```html
<div class="bgy-chart-frame bgy-chart-placeholder" data-ppt-placeholder="radar-risk-profile">
  雷达图占位
</div>
```

雷达图、瀑布图、复杂组合图、canvas 图表不要让转换器从视觉反推数据。需要可编辑时，先提供明确数据并在 PPT 原生阶段处理；没有数据时保留占位坐标。

### 流程箭头示例

```html
<div class="bgy-process bgy-process--horizontal">
  <div class="bgy-process-step"><strong>发现</strong><span>问题</span></div>
  <span class="bgy-process-line" data-ppt-line-end="triangle"></span>
  <div class="bgy-process-step"><strong>分析</strong><span>原因</span></div>
</div>
```

## 常用组件示例

### title

```json
{
  "id": "s01-title",
  "label": "封面标题",
  "type": "title",
  "text": "演示标题",
  "x": 0.9,
  "y": 0.9,
  "w": 8.5,
  "h": 0.7,
  "style": {
    "fontSize": 28,
    "bold": true,
    "color": "#0F172A"
  }
}
```

### bullet-list

```json
{
  "id": "s02-bullets",
  "label": "背景要点",
  "type": "bullet-list",
  "items": ["要点1", "要点2", "要点3"],
  "x": 0.95,
  "y": 1.8,
  "w": 5.3,
  "h": 3.2,
  "style": {
    "fontSize": 18,
    "color": "#111827"
  }
}
```

### image

```json
{
  "id": "s02-image",
  "label": "项目封面图",
  "type": "image",
  "src": "./assets/preview/placeholder-graphic.svg",
  "fit": "contain",
  "x": 7.9,
  "y": 1.4,
  "w": 4.0,
  "h": 3.6
}
```

### table

```json
{
  "id": "s03-table",
  "label": "数据表格",
  "type": "table",
  "rows": [
    ["指标", "Q1", "Q2"],
    ["收入", "18", "26"],
    ["利润", "5", "8"]
  ],
  "x": 0.9,
  "y": 1.7,
  "w": 6.8,
  "h": 3.2
}
```

### chart

```json
{
  "id": "s04-chart",
  "label": "季度增长",
  "type": "chart",
  "kind": "bar",
  "text": "季度增长",
  "categories": ["Q1", "Q2", "Q3"],
  "series": [
    {
      "name": "收入",
      "values": [18, 26, 31]
    }
  ],
  "x": 0.9,
  "y": 1.7,
  "w": 6.5,
  "h": 3.5
}
```

## 其他支持组件

- `subtitle`
- `text`
- `quote-block`
- `divider`
- `shape`：`rect`、`roundedRect`、`circle`

## 单页输出示例

```markdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【P序号】页面标题
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 核心内容：
[一句话核心观点]
• 支撑要点 1
• 支撑要点 2
• 支撑要点 3

📐 布局方案：
slide type: [类型] | layoutVariant: [版式变体]

📊 数据可视化：
图表数据已内嵌在HTML的<script>标签中

🖼️ 配图资源：
• unDraw 插画：[名称] - https://undraw.co/search?q=[关键词]
• 图标：[Font Awesome / Lucide 图标名]

📝 格式标注：
• 标题：微软雅黑 / 24pt / 加粗 / #006D9A
• 正文：微软雅黑 / 16pt / 常规 / #000000

📏 16:9比例检查：
• PPT页面尺寸：1920px × 1080px ✓
• 安全边距：≥0.75in（左右）/ ≥0.6in（上）/ ≥0.5in（下） ✓
• 组件坐标：所有组件已指定 x/y/w/h ✓
• 溢出检查：无 ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
