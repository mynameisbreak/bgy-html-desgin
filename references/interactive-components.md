# 交互组件与小型演示

本文件说明 `bgy-html-design` 中两个可选组件的使用边界：

- `assets/design_canvas.jsx`：封面/重点页多方案对比。
- `assets/deck_stage.js`：小于 5 页的单文件 HTML 演示。

这两个组件都是辅助能力，不改变默认规则：碧桂园服务多页汇报默认仍使用 `index.html + slides/*.html` 多文件架构。

## design_canvas.jsx

用于展示 2-3 个静态设计方向，让用户快速选择封面或关键页的视觉方案。

适用：

- 封面页方向不确定。
- 经营摘要页有两种信息结构可选。
- 重点数据页需要比较“指标卡版 / 图表版 / 表格版”。
- 用户明确要求“给几个版本看看”。

不适用：

- 常规批量页面。
- 已经明确套用碧桂园模板的普通内容页。
- 用来展示过多风格，导致偏离品牌一致性。

使用规则：

- 控制在 2-3 个变体。
- 每个变体必须仍然使用碧桂园服务 logo、品牌蓝和汇报气质。
- 变体差异应来自信息组织、版式重心、图表表达，不要变成不同品牌风格。
- 用户选定后，把最终方案落到正式 `slides/*.html`，不要把对比画布当最终交付页。

React/Babel 使用示例：

```html
<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script type="text/babel" src="./assets/design_canvas.jsx"></script>
<script type="text/babel">
  function App() {
    return (
      <DesignCanvas title="封面方案对比" subtitle="选择一个方向后再批量制作">
        <Variation label="稳健汇报版" description="模板感最强">
          <div>方案 A</div>
        </Variation>
        <Variation label="指标聚焦版" description="突出核心经营数据">
          <div>方案 B</div>
        </Variation>
      </DesignCanvas>
    );
  }
  ReactDOM.createRoot(document.getElementById("root")).render(<App />);
</script>
```

## deck_stage.js

用于小于 5 页的单文件演示。它提供固定画布、自动缩放、键盘翻页、页码和 localStorage。

适用：

- 1-4 页的快速单文件汇报。
- 临时演示 Demo。
- 不需要 `index.html` 概览页和逐页文件隔离的场景。

不适用：

- 5 页及以上 deck。
- 月报、季报、经营汇报、节能降本、公维资金、消防维保等正式多页文稿。
- 需要多人或多 agent 并行制作的 deck。
- 后续需要按页截图、逐页修订、转为可编辑 PPTX 的正式交付。

使用规则：

- `<script src="deck_stage.js">` 放在 `</deck-stage>` 之后，或使用 `defer`。
- 每页必须是 `deck-stage` 的直接子级 `<section>`。
- 不要在 `deck-stage > section` 上直接写 `display: flex/grid`，避免覆盖切页显示逻辑。
- 把布局写在内部 wrapper 上，例如 `<div class="slide-content">`。
- 页数达到 5 页时，改用多文件架构。

基础示例：

```html
<deck-stage width="1280" height="720">
  <section>
    <div class="slide-content">第一页</div>
  </section>
  <section>
    <div class="slide-content">第二页</div>
  </section>
</deck-stage>
<script src="./assets/deck_stage.js"></script>
```

CSS 建议：

```css
deck-stage > section {
  background: #fff;
  overflow: hidden;
  position: relative;
}

deck-stage > section:not(.active) {
  display: none !important;
}

.slide-content {
  width: 100%;
  height: 100%;
  position: relative;
}
```

## 选择规则

| 需求 | 使用 |
|---|---|
| 多页正式汇报 | `assets/deck_index.html` 多文件架构 |
| 1-4 页快速演示 | `assets/deck_stage.js` |
| 封面/重点页要比选 | `assets/design_canvas.jsx` |
