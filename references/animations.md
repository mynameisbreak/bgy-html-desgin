# Animations catalog

基于 `lewislulu/html-ppt-skill` 的 `27 CSS animations + 20 Canvas FX` 整理，适配到当前 `ppt-design` skill。

来源：
- README 动画总表
- `references/animations.md`
- `assets/animations/animations.css`

使用总规则：
- 默认先选 CSS 动画，再考虑 Canvas FX
- 内容页最多 1-2 种动画；强氛围页最多 1 个 Canvas FX + 1 个标题入场
- 若无明确要求，优先稳、轻、短，不做炫技堆叠
- 必须尊重 `prefers-reduced-motion: reduce`

## CSS 动画

使用方式：
- `animation.effect` 直接写名称，例如 `fade-up`
- 或在 HTML/CSS 实现中映射到 `anim-<name>` / `data-anim="<name>"`

### Directional fades

| effect | 作用 | 适合场景 |
|---|---|---|
| `fade-up` | 从下上移并淡入 | 默认正文、卡片、段落入场 |
| `fade-down` | 从上落下并淡入 | 页眉、横幅、章节标记 |
| `fade-left` | 从左移入 | 双栏左侧内容 |
| `fade-right` | 从右移入 | 双栏右侧内容 |

### Dramatic entries

| effect | 作用 | 适合场景 |
|---|---|---|
| `rise-in` | 上升 + 轻微模糊消散 | 大标题、Hero headline |
| `drop-in` | 下落 + 轻缩放 | 警示条、醒目横条 |
| `zoom-pop` | 0.6 到 1.04 再回弹 | KPI 数字、按钮、CTA |
| `blur-in` | 重模糊到清晰 | 封面揭示、过渡页 |
| `glitch-in` | 裁切抖动式入场 | Tech / cyber / error 状态 |

### Text effects

| effect | 作用 | 适合场景 |
|---|---|---|
| `typewriter` | 打字机式出现 | slogan、命令行、单句标题 |
| `neon-glow` | 霓虹辉光脉冲 | terminal、dracula、cyberpunk 主题 |
| `shimmer-sweep` | 高光扫过 | 高级卡片、按钮、奖项页 |
| `gradient-flow` | 渐变文字流动 | 品牌字标、主题词 |

### Lists & numbers

| effect | 作用 | 适合场景 |
|---|---|---|
| `stagger-list` | 子项逐个入场 | bullet、卡片网格、流程步骤 |
| `counter-up` | 数字从 0 增长到目标值 | `stat-highlight`、`kpi-grid` |

### SVG & geometry

| effect | 作用 | 适合场景 |
|---|---|---|
| `path-draw` | 路径描边生成 | 箭头、流程线、架构连接线 |
| `morph-shape` | SVG 形状缓慢变形 | 背景有机形、装饰图形 |

### 3D & perspective

| effect | 作用 | 适合场景 |
|---|---|---|
| `parallax-tilt` | 悬停 3D 倾斜 | 产品卡片、主视觉卡 |
| `card-flip-3d` | 卡片 Y 轴翻转 | before/after、正反面信息 |
| `cube-rotate-3d` | 立方体侧面旋入 | 章节切换、封面转场 |
| `page-turn-3d` | 左侧翻页 | 杂志感、故事流页面 |
| `perspective-zoom` | 从远景透视拉近 | 封面开场、章节揭示 |

### Ambient & continuous

| effect | 作用 | 适合场景 |
|---|---|---|
| `marquee-scroll` | 横向连续滚动 | 客户 Logo、合作伙伴带 |
| `kenburns` | 慢速镜头推进 | 大图背景、封面照片 |
| `confetti-burst` | 纸屑/粒子爆开 | 致谢、庆祝、上线页 |
| `spotlight` | 聚光灯揭示 | 主标题、Big reveal |
| `ripple-reveal` | 波纹扩散揭示 | 章节转场、局部强调 |

## Canvas FX

使用方式：
- `animation.effect` 使用 `fx:<name>` 约定，例如 `fx:starfield`
- 这类效果适合整页背景、整块容器，不适合正文每个小组件

| effect | 视觉效果 | 适合场景 |
|---|---|---|
| `fx:particle-burst` | 中心粒子爆发，周期复现 | 关键数字、揭晓时刻 |
| `fx:confetti-cannon` | 双角礼花喷射 | 致谢页、成功页 |
| `fx:firework` | 底部升空烟花 | 发布、庆祝、上线 |
| `fx:starfield` | 3D 星空穿梭 | 科技、太空、愿景封面 |
| `fx:matrix-rain` | 绿色字符雨 | 安全、终端、数据感主题 |
| `fx:knowledge-graph` | 力导向知识图谱 | RAG、知识库、网络结构 |
| `fx:neural-net` | 神经网络脉冲流动 | AI、模型结构、推理流程 |
| `fx:constellation` | 漂浮点线星座 | 柔和科技背景 |
| `fx:orbit-ring` | 多重同心轨道 | 层级系统、平台能力圈 |
| `fx:galaxy-swirl` | 银河旋涡粒子 | 封面、序章、愿景页 |
| `fx:word-cascade` | 词语下落堆叠 | 概念云、关键词瀑布 |
| `fx:letter-explode` | 标题字母从四周飞入 | Hero 标题、活动页 |
| `fx:chain-react` | 连锁脉冲波 | 管线、顺序流程、传播机制 |
| `fx:magnetic-field` | 粒子曲线拖尾 | 能量、场、抽象流动背景 |
| `fx:data-stream` | 十六进制/二进制流 | API、数据、日志、安全 |
| `fx:gradient-blob` | 模糊渐变团漂移 | 柔和背景、品牌封面 |
| `fx:sparkle-trail` | 闪烁轨迹跟随 | 互动揭示、轻量点缀 |
| `fx:shockwave` | 中心冲击波环扩散 | 影响、发射、警示时刻 |
| `fx:typewriter-multi` | 多行同步打字 | Terminal、Agent 启动日志 |
| `fx:counter-explosion` | 数字增长后粒子爆开 | 纪录、峰值 KPI、战报页 |

## 选型建议

- 低风险默认：`fade-up`、`fade-right`、`stagger-list`
- 封面默认：`rise-in` 或 `blur-in`，必要时叠加 `fx:gradient-blob` / `fx:starfield`
- 数据页默认：`counter-up`、`zoom-pop`
- 技术页默认：`typewriter`、`glitch-in`、`fx:matrix-rain`、`fx:data-stream`
- 架构/流程页默认：`path-draw`、`fx:knowledge-graph`、`fx:neural-net`
- 收尾页默认：`confetti-burst` 或 `fx:confetti-cannon`

## 禁止事项

- 不要在一页同时放多个 Canvas FX
- 不要把连续背景特效盖在大段正文后面，影响阅读
- `glitch-in`、`matrix-rain`、`firework` 只在风格匹配时使用，不能滥用
- 数字页不要为了“酷”而牺牲可读性；图表和表格页应优先稳定、清晰
