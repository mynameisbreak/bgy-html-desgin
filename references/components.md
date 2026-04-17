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
