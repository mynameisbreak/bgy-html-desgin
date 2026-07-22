# 碧桂园服务 HTML Deck 交付评审

仅在页数多、正式对外交付、用户要求评审，或页面含密集表格/复杂图表/外部素材时读取本文件。默认交付只按 `SKILL.md` 的轻量校验执行。

## 风险门控

按问题严重程度评审，不做逐项打分：

| 风险 | 需要拦截的表现 | 优先修复 |
|---|---|---|
| P0 不可交付 | HTML/PPTX 打不开，`index.html` 无法加载页面，图片路径失效，页面明显越界 | 修路径、重导出、恢复 16:9 |
| P1 影响阅读 | 标题不是结论句，页面过满，表格/图表投影不可读，logo/水印遮挡正文 | 拆页、减字、调字号与留白 |
| P1 事实/素材风险 | 假数据、未说明占位图、编造项目照片/截图/评价，外部 logo 来源不明 | 改为真实素材或明确 `待补素材` |
| P1 PPTX 不可编辑 | 可编辑 PPTX 里普通卡片/线条/表格/icon 被整页或大面积图片化，或把 `index.html` 聚合页截图成 PPT | 用 `export_bgy_pptx.mjs --slides-dir`，检查 manifest/audit，恢复原生 shape/table/image/text/icon |
| P2 品牌走样 | 丢失碧桂园服务 logo/水印/品牌蓝，风格变成通用 SaaS/营销页 | 回到内置模板和品牌色 |
| P2 细节粗糙 | 对齐、间距、状态色、组件样式跨页不一致 | 统一 token、复用组件样式 |

## 最小检查

- 打开 `index.html`，确认所有 slide 非白屏。
- 抽查 1-3 页：logo、水印、标题栏、16:9、无明显溢出。
- 检查标题是否表达结论，数据是否有业务解释。
- 有 PPTX 交付时，确认使用 `slides/*.html` 而不是 `index.html` 输入；运行 `pptx_preflight.mjs`、`audit-pptx --strict` 或查看 manifest，确认 `native-shape`、`native-table`、`native-image`、`native-icon`、`editable-text` 占主导，`maxSnapshotCoverage` 接近 0。

## 报告格式

```markdown
总体判断：可交付 / 需小修 / 需重做

阻塞问题：
1. [P0/P1/P2] 问题 - 修复方式

已验证：
- HTML/PPTX 打开情况
- PPTX 转换方式、audit/manifest 结果
- 抽查页范围
- 未执行项及原因
```
