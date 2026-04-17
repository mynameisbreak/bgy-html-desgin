# Layouts catalog

基于 `lewislulu/html-ppt-skill` 的 `31 single-page layouts` 整理，适配到当前 `ppt-design` skill。

来源：
- README 单页布局总表
- `references/layouts.md`

用途：
- 当用户要更强网页感、发布会感、Pitch Deck 感时，用这里的精确布局名
- 当基础 11 类 `slide type` 不够表达时，用这里的扩展 `type`
- 当需要从 `html-ppt-skill` 迁移页面时，直接按这里的命名落地

## 选择规则

- 开场页优先：`cover` -> `toc` -> `section-divider`
- 常规正文优先：`bullets`、`two-column`、`three-column`
- 数据页优先：`stat-highlight`、`kpi-grid`、`table`、`chart-*`
- 流程/架构页优先：`flow-diagram`、`arch-diagram`、`process-steps`、`mindmap`
- 结束页优先：`cta` -> `thanks`
- 一页只选一个主布局；不要把 `gantt`、`mindmap`、`comparison` 这类强结构页混搭

## 开场与转场

| type | 中文定位 | 适合内容 | 备注 |
|---|---|---|---|
| `cover` | 封面页 | 标题、副标题、标签、主视觉 | 对应本 skill 的 `cover` |
| `toc` | 目录页 | 2×3 或卡片式议程总览 | 对应 `agenda` |
| `section-divider` | 章节分隔页 | 大章节编号、主题切换 | 对应 `section` |

## 文本与观点页

| type | 中文定位 | 适合内容 | 备注 |
|---|---|---|---|
| `bullets` | 要点页 | 3-5 条 bullet，适合汇报正文 | 对应 `title-bullets` |
| `two-column` | 双栏页 | 左右对照、概念+案例 | 对应 `two-column` |
| `three-column` | 三栏页 | 三个同级支柱、三种能力、三项策略 | 基础类型不够时直接用扩展 `type` |
| `big-quote` | 大引言页 | 金句、客户引言、品牌主张 | 对应 `quote` |
| `comparison` | 对比页 | Before/After、方案 A/B | 对应 `comparison` |
| `pros-cons` | 利弊页 | 正反分析、取舍评估 | 可视为 `comparison` 的特化 |
| `todo-checklist` | 清单页 | Done / Todo / 风险清单 | 适合项目推进页 |
| `cta` | 行动召唤页 | 下一步、注册、联系、申请支持 | 强结束动作页 |
| `thanks` | 致谢页 | 演讲结束、答疑前停顿 | 最终收束页 |

## 数字与图表页

| type | 中文定位 | 适合内容 | 备注 |
|---|---|---|---|
| `stat-highlight` | 单指标页 | 一个大数字 + 一句解释 | 高冲击 KPI |
| `kpi-grid` | KPI 网格页 | 4 个核心指标并列 | 管理层摘要 |
| `table` | 表格页 | 结构化指标对比、排期表、名单 | 对应 `table` |
| `chart-bar` | 柱状图页 | 类目对比、阶段对比 | 对应 `chart` |
| `chart-line` | 折线图页 | 趋势变化、增长曲线 | 对应 `chart` |
| `chart-pie` | 饼图页 | 构成占比 | 对应 `chart` |
| `chart-radar` | 雷达图页 | 多维能力对比 | 对应 `chart` |

## 代码与技术页

| type | 中文定位 | 适合内容 | 备注 |
|---|---|---|---|
| `code` | 代码页 | 单段代码、示例片段、讲解重点 | 基础 schema 无自然等价，直接用扩展 `type` |
| `diff` | 差异页 | 改前改后、 patch、重构收益 | 适合技术分享 |
| `terminal` | 终端页 | 命令行输出、日志、agent boot 流 | 适合 cyber/engineering 风格 |

## 结构、流程与计划页

| type | 中文定位 | 适合内容 | 备注 |
|---|---|---|---|
| `flow-diagram` | 流程图页 | 线性流程、处理管线 | 高结构页面 |
| `arch-diagram` | 架构图页 | 三层或多层系统架构 | 适合技术方案 |
| `process-steps` | 步骤页 | 1-4 步流程、执行步骤 | 对应流程页 |
| `mindmap` | 思维导图页 | 中心主题发散 | 适合策略拆解 |
| `timeline` | 时间线页 | 历史进程、里程碑 | 对应 `timeline` |
| `roadmap` | 路线图页 | Now / Next / Later / Vision | 中长期规划 |
| `gantt` | 甘特页 | 周计划、并行项目跟踪 | 计划管理专用 |

## 视觉页

| type | 中文定位 | 适合内容 | 备注 |
|---|---|---|---|
| `image-hero` | 大图主视觉页 | 产品大图、活动海报、摄影作品 | 对应 `image-text` 的强视觉版本 |
| `image-grid` | 图片网格页 | 多张图组合、作品集、案例合集 | 适合展示型内容 |

## 推荐组合

- 商业汇报：`cover` -> `toc` -> `section-divider` -> `bullets` / `two-column` -> `chart-bar` / `kpi-grid` -> `cta`
- 产品发布：`cover` -> `section-divider` -> `image-hero` -> `comparison` -> `process-steps` -> `thanks`
- 技术分享：`cover` -> `toc` -> `arch-diagram` -> `flow-diagram` -> `code` / `terminal` / `diff` -> `roadmap` -> `thanks`
- 项目复盘：`cover` -> `timeline` -> `comparison` -> `pros-cons` -> `todo-checklist` -> `cta`

## 落地约束

- 即使用扩展 `type`，也必须继续满足本 skill 的 16:9、安全边距、文本预算、显式坐标约束
- `code`、`terminal`、`diff` 页优先减少装饰，确保代码可读性高于视觉表演
- `gantt`、`table`、`kpi-grid` 页优先对齐和节奏，不要给数字页强行加花哨背景
- `image-hero`、`thanks`、`cta` 是最适合叠加重氛围动画的页面；其余页面要克制
