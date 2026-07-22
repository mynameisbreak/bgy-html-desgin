import fs from "fs";
import path from "path";
import {
  buildComponentsCss,
  buildDefaultProjectConfig,
  buildTokensCss,
  copyFile,
  ensureDir,
  loadBuiltinPresets,
  normalizeProjectConfig,
  projectPresetPath,
  writeJsonFile,
  writeTextFile,
} from "./project_config.mjs";
import { scriptDir } from "./runtime.mjs";

const ROOT_DIR = path.resolve(scriptDir, "..");
const ASSETS_DIR = path.join(ROOT_DIR, "assets");
const TEMPLATE_DIR = path.join(ASSETS_DIR, "ppt-base-template", "模版底图");

function jsonForScript(value) {
  return JSON.stringify(value, null, 2).replace(/<\/script/gi, "<\\/script");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function jsonForAttr(value) {
  return escapeHtml(JSON.stringify(value));
}

function cleanHex(value) {
  return String(value || "").replace(/^#/, "");
}

function chartAttrs(type, data) {
  return `data-ppt-chart="${escapeHtml(type)}" data-ppt-chart-data="${jsonForAttr(data)}"`;
}

const PRESET_ORDER = [
  "management-report",
  "monthly-review",
  "proposal",
  "maintenance",
  "quality-improvement",
  "fire-safety",
];

const COMPONENT_GROUPS = [
  {
    id: "kpi",
    title: "KPI 指标",
    summary: "经营汇报最高频组件，优先保留为文本、形状和进度条。",
    items: [
      { id: "kpi-card", title: "KPI Card", summary: "标题、数值、说明三层信息。", preview: "kpi-basic" },
      { id: "kpi-big-number", title: "大数字指标", summary: "用于单页核心结论或封面指标。", preview: "kpi-big-number" },
      { id: "kpi-trend", title: "指标 + 趋势", summary: "展示同比、环比和趋势方向。", preview: "kpi-trend" },
      { id: "kpi-cycle", title: "同比 / 环比", summary: "同一指标的两种变化口径。", preview: "kpi-cycle" },
      { id: "kpi-target", title: "指标 + 目标", summary: "目标值、实际值和偏差一起展示。", preview: "kpi-target" },
      { id: "kpi-progress", title: "指标 + 完成率", summary: "用真实进度条表达达成比例。", preview: "kpi-progress" },
    ],
  },
  {
    id: "card",
    title: "Card 卡片",
    summary: "承载结论、问题、亮点、项目和风险信息。",
    items: [
      { id: "card-normal", title: "普通 Card", summary: "正文信息承载容器。", preview: "card-normal" },
      { id: "card-data", title: "数据 Card", summary: "指标与解释组合。", preview: "card-data" },
      { id: "card-project", title: "项目 Card", summary: "项目名称、状态、责任人。", preview: "card-project" },
      { id: "card-highlight", title: "重点 Card", summary: "强调结论或关键动作。", preview: "card-highlight" },
      { id: "card-risk", title: "风险 Card", summary: "用于风险提示和逾期事项。", preview: "card-risk" },
      { id: "card-conclusion", title: "结论 Card", summary: "适合页面右侧管理结论。", preview: "card-conclusion" },
    ],
  },
  {
    id: "chart",
    title: "Chart 图表",
    summary: "有数据时使用 data-ppt-chart，复杂图形先用占位契约。",
    items: [
      { id: "chart-bar", title: "柱状图", summary: "显式数据，可转原生图表。", preview: "chart-bar" },
      { id: "chart-horizontal", title: "横向柱状图", summary: "适合项目或区域对比。", preview: "chart-horizontal-bar" },
      { id: "chart-line", title: "折线图", summary: "适合月度趋势。", preview: "chart-line" },
      { id: "chart-area", title: "面积图", summary: "作为 line 数据图表的预览变体。", preview: "chart-area" },
      { id: "chart-pie-donut", title: "饼图 / 环形图", summary: "饼图可原生；环形先保留占位。", preview: "chart-pie-donut" },
      { id: "chart-advanced", title: "雷达 / 组合 / 瀑布", summary: "先占位，避免从视觉反推数据。", preview: "chart-advanced" },
    ],
  },
  {
    id: "progress",
    title: "Progress 进度",
    summary: "项目进度、目标达成率、阶段节点和里程碑。",
    items: [
      { id: "progress-bar", title: "进度条", summary: "最稳定的 PPT 友好进度表达。", preview: "progress-bar" },
      { id: "progress-ring", title: "环形进度", summary: "用于完成率概览，文字仍为 DOM。", preview: "progress-ring" },
      { id: "progress-completion", title: "完成率", summary: "状态标签加进度条组合。", preview: "progress-completion" },
      { id: "progress-target", title: "目标达成率", summary: "目标值、实际值、达成率。", preview: "progress-target" },
      { id: "progress-stage", title: "阶段进度", summary: "用于多阶段项目推进。", preview: "progress-stage" },
      { id: "progress-milestone", title: "里程碑", summary: "节点、责任和日期。", preview: "progress-milestone" },
    ],
  },
  {
    id: "comparison",
    title: "Comparison 对比",
    summary: "同比、环比、目标实际、计划完成和前后对比。",
    items: [
      { id: "compare-yoy", title: "同比 / 环比", summary: "变化方向和幅度同屏展示。", preview: "compare-yoy" },
      { id: "compare-target", title: "目标 vs 实际", summary: "管理汇报常用结果判断。", preview: "compare-target-actual" },
      { id: "compare-plan", title: "计划 vs 完成", summary: "适合任务推进复盘。", preview: "compare-plan-finish" },
      { id: "compare-before-after", title: "Before / After", summary: "改善前后对比。", preview: "compare-before-after" },
      { id: "compare-ab", title: "A vs B", summary: "方案、项目或区域比较。", preview: "compare-ab" },
    ],
  },
  {
    id: "ranking",
    title: "Ranking 排名",
    summary: "区域、城市、项目和指标排名。",
    items: [
      { id: "ranking-top3", title: "TOP 3", summary: "前三名重点突出。", preview: "ranking-top3" },
      { id: "ranking-list", title: "TOP 5 / TOP 10", summary: "适合经营指标列表。", preview: "ranking-list" },
      { id: "ranking-project", title: "项目 / 城市排名", summary: "带指标值和趋势标记。", preview: "ranking-project" },
    ],
  },
  {
    id: "process",
    title: "Process 流程",
    summary: "管理逻辑、业务闭环、横纵流程和 PDCA。",
    items: [
      { id: "process-horizontal", title: "横向流程", summary: "用真实线条和箭头连接。", preview: "process-horizontal" },
      { id: "process-vertical", title: "纵向流程", summary: "适合整改链路和审批链路。", preview: "process-vertical" },
      { id: "process-loop", title: "业务闭环", summary: "问题到验收的闭环表达。", preview: "process-loop" },
      { id: "process-pdca", title: "PDCA", summary: "计划、执行、检查、处理。", preview: "process-pdca" },
    ],
  },
  {
    id: "timeline",
    title: "Timeline 时间轴",
    summary: "项目过程、月度计划和路线图。",
    items: [
      { id: "timeline-project", title: "项目时间轴", summary: "展示关键节点和责任。", preview: "timeline-project" },
      { id: "timeline-month", title: "月度时间轴", summary: "适合月报计划。", preview: "timeline-month" },
      { id: "timeline-roadmap", title: "Roadmap", summary: "跨阶段规划。", preview: "timeline-roadmap" },
    ],
  },
  {
    id: "risk",
    title: "Risk / Problem 风险问题",
    summary: "风险等级、问题清单、风险矩阵和整改进度。",
    items: [
      { id: "risk-card", title: "风险 / 问题 Card", summary: "单项风险说明。", preview: "risk-card" },
      { id: "risk-level", title: "风险等级", summary: "低、中、高等级标签。", preview: "risk-level" },
      { id: "risk-matrix", title: "风险矩阵", summary: "影响和概率二维判断。", preview: "risk-matrix" },
      { id: "risk-list", title: "问题清单", summary: "问题、责任、期限。", preview: "risk-list" },
      { id: "risk-action", title: "风险 -> 措施", summary: "风险与动作闭环。", preview: "risk-action" },
    ],
  },
  {
    id: "image",
    title: "Image / Case 图片案例",
    summary: "项目照片、系统截图、案例卡和前后对比。",
    items: [
      { id: "image-single", title: "单图 + 文字", summary: "真实图片走 img，文字走 DOM。", preview: "image-single" },
      { id: "image-text", title: "左右图文", summary: "左图右文或左文右图。", preview: "image-text" },
      { id: "image-gallery", title: "三图 / 四图卡片", summary: "适合现场照片墙。", preview: "image-gallery" },
      { id: "image-before-after", title: "Before / After", summary: "工程整改前后对比。", preview: "image-before-after" },
      { id: "case-card", title: "案例 Card", summary: "图片、结论、标签组合。", preview: "case-card" },
    ],
  },
];

function orderedPresets(presets) {
  return Object.values(presets).sort((a, b) => {
    const aId = a?.id || a?.project?.preset || a?.projectType || "";
    const bId = b?.id || b?.project?.preset || b?.projectType || "";
    const aIndex = PRESET_ORDER.indexOf(aId);
    const bIndex = PRESET_ORDER.indexOf(bId);
    if (aIndex !== -1 || bIndex !== -1) {
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    }
    return String(a?.label || aId).localeCompare(String(b?.label || bId), "zh-CN");
  });
}

function renderColorStrip(colors, className = "color-strip") {
  return `<div class="${className}">${colors
    .filter(Boolean)
    .map(color => `<span style="background:${escapeHtml(color)}"></span>`)
    .join("")}</div>`;
}

function renderPresetCard(preset, selectedPreset) {
  const normalizedPreset = normalizeProjectConfig({
    project: { preset: preset.id || preset.projectType || "management-report" },
    ...preset,
  });
  const id = normalizedPreset.project.preset;
  const selected = id === selectedPreset;
  const colors = [
    normalizedPreset.theme.brand,
    normalizedPreset.theme.deepBrand,
    normalizedPreset.theme.success,
    normalizedPreset.theme.warning,
    normalizedPreset.theme.danger,
  ];
  return `<button type="button" class="preset-card${selected ? " is-active" : ""}" data-preset="${escapeHtml(id)}">
    <span class="preset-card__label">${escapeHtml(normalizedPreset.label || id)}</span>
    <span class="preset-card__desc">${escapeHtml(normalizedPreset.description || "项目主题预设")}</span>
    ${renderColorStrip(colors, "preset-card__colors")}
    <span class="preset-card__meta">${escapeHtml(normalizedPreset.project.type)} · ${escapeHtml(normalizedPreset.components.iconPack)} · ${escapeHtml(normalizedPreset.components.tableDensity)}</span>
  </button>`;
}

function renderPresetCards(presets, selectedPreset) {
  return `${orderedPresets(presets)
    .map(preset => renderPresetCard(preset, selectedPreset))
    .join("")}
    <button type="button" class="preset-card preset-card--custom" data-theme-mode-card="custom">
      <span class="preset-card__label">自定义主题</span>
      <span class="preset-card__desc">以当前预设为底，再调整品牌色、语义色、圆角、阴影和表格密度。</span>
      ${renderColorStrip(["#0f172a", "#475569", "#94a3b8", "#e2e8f0", "#ffffff"], "preset-card__colors")}
      <span class="preset-card__meta">custom · editable · project tokens</span>
    </button>`;
}

function renderThemeSwatches(normalized) {
  const items = [
    ["主色", normalized.theme.brand],
    ["深主色", normalized.theme.deepBrand],
    ["成功", normalized.theme.success],
    ["警示", normalized.theme.warning],
    ["风险", normalized.theme.danger],
    ["信息", normalized.theme.info],
    ["正文", normalized.theme.text],
    ["线条", normalized.theme.line],
  ];
  return items.map(([label, color]) => `<div class="theme-swatch">
    <span class="theme-swatch__color" style="background:${escapeHtml(color)}"></span>
    <span class="theme-swatch__label">${escapeHtml(label)}</span>
    <span class="theme-swatch__value">${escapeHtml(color)}</span>
  </div>`).join("");
}

function iconSvg(name) {
  const icons = {
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l4 4L19 6"/></svg>',
    clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/></svg>',
    alert: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4l9 16H3L12 4z"/><path d="M12 9v4M12 17h.01"/></svg>',
    chart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19V9M12 19V5M19 19v-7"/></svg>',
  };
  return icons[name] || icons.check;
}

function componentPreviewMarkup(type, normalized) {
  const chart = normalized.theme.chart;
  const title = escapeHtml(normalized.project.title || "项目主题预览");
  const chartColors = chart.map(cleanHex);
  const barData = {
    labels: ["一区", "二区", "三区", "四区"],
    series: [{ name: "完成率", values: [82, 91, 96, 88] }],
    colors: chartColors,
  };
  const lineData = {
    labels: ["4月", "5月", "6月", "7月"],
    series: [{ name: "闭环率", values: [78, 84, 90, 96] }],
    colors: [chartColors[0]],
  };
  const pieData = {
    labels: ["已完成", "推进中", "待协调"],
    series: [{ name: "事项", values: [62, 26, 12] }],
    colors: [chartColors[0], chartColors[1], chartColors[3]],
  };
  switch (type) {
    case "kpi-basic":
      return `<div class="bgy-kpi-card">
        <p class="bgy-kpi-card__label">重点任务完成率</p>
        <p class="bgy-kpi-card__value">96.4%</p>
        <p class="bgy-kpi-card__note">较计划进度高 3.2pct</p>
      </div>`;
    case "kpi-big-number":
      return `<div class="bgy-kpi-card bgy-kpi-card--hero">
        <p class="bgy-kpi-card__label">本月闭环事项</p>
        <p class="bgy-kpi-card__value">128</p>
        <p class="bgy-kpi-card__unit">项</p>
      </div>`;
    case "kpi-trend":
      return `<div class="bgy-kpi-card">
        <p class="bgy-kpi-card__label">客户诉求闭环率</p>
        <p class="bgy-kpi-card__value">92.8%</p>
        <div class="bgy-kpi-card__trend is-up"><span>同比 +4.6%</span><span>环比 +1.8%</span></div>
      </div>`;
    case "kpi-cycle":
      return `<div class="bgy-delta-grid">
        <div class="bgy-delta-card is-up"><strong>同比</strong><span>+6.2%</span><p>品质问题下降</p></div>
        <div class="bgy-delta-card is-down"><strong>环比</strong><span>-1.4%</span><p>能耗略有回升</p></div>
      </div>`;
    case "kpi-target":
      return `<div class="bgy-target-card">
        <div><span>目标</span><strong>95%</strong></div>
        <div><span>实际</span><strong>96.4%</strong></div>
        <div><span>偏差</span><strong class="is-success">+1.4pct</strong></div>
      </div>`;
    case "kpi-progress":
      return `<div class="bgy-kpi-card">
        <div class="bgy-kpi-card__row"><span>年度目标达成</span><strong>78%</strong></div>
        <div class="bgy-progress" role="img" aria-label="年度目标达成 78%">
          <span class="bgy-progress__track"><span class="bgy-progress__bar" style="width:78%"></span></span>
        </div>
        <p class="bgy-kpi-card__note">剩余 22% 将在四季度完成。</p>
      </div>`;
    case "card-normal":
      return `<article class="bgy-card">
        <div class="bgy-card__body">
          <h3 class="bgy-card__title">普通 Card</h3>
          <p class="bgy-card__text">用于承载说明、摘要、责任项和小型信息组。</p>
        </div>
      </article>`;
    case "card-data":
      return `<article class="bgy-data-card">
        <p class="bgy-card__eyebrow">经营数据</p>
        <strong>收入完成率 101.2%</strong>
        <span>重点项目贡献 42%</span>
      </article>`;
    case "card-project":
      return `<article class="bgy-project-card">
        <div><h3>凤凰城项目</h3><p>责任：工程部</p></div>
        <span class="bgy-status-tag is-warning">推进中</span>
      </article>`;
    case "card-highlight":
      return `<article class="bgy-highlight-card">
        <p class="bgy-card__eyebrow">本页重点</p>
        <strong>客户诉求平均闭环时长缩短 18%</strong>
      </article>`;
    case "card-risk":
      return `<article class="bgy-risk-card">
        <span class="bgy-risk-card__level is-high">高风险</span>
        <strong>消防整改仍有 2 项需协调</strong>
        <p>建议本周完成复核并更新台账。</p>
      </article>`;
    case "card-conclusion":
      return `<article class="bgy-conclusion-card">
        <p class="bgy-card__eyebrow">管理结论</p>
        <strong>总体进度可控，需压实跨部门协同动作。</strong>
      </article>`;
    case "chart-bar":
      return `<div class="bgy-chart-frame bgy-chart-frame--bar" ${chartAttrs("bar", barData)}>
        <div class="bgy-chart-bars" aria-hidden="true">
          ${barData.series[0].values.map((value, index) => `<span class="bgy-chart-bar" style="height:${value}%;background:${escapeHtml(chart[index % chart.length])}"></span>`).join("")}
        </div>
      </div>`;
    case "chart-horizontal-bar":
      return `<div class="bgy-chart-frame bgy-chart-frame--bar" ${chartAttrs("bar", barData)}>
        <div class="bgy-chart-bars bgy-chart-bars--horizontal" aria-hidden="true">
          ${barData.series[0].values.map((value, index) => `<span class="bgy-chart-bar" style="width:${value}%;background:${escapeHtml(chart[index % chart.length])}"><i>${escapeHtml(barData.labels[index])}</i></span>`).join("")}
        </div>
      </div>`;
    case "chart-line":
      return `<div class="bgy-chart-frame bgy-chart-frame--line" ${chartAttrs("line", lineData)}>
        <svg class="bgy-chart-line-visual" viewBox="0 0 220 112" aria-hidden="true">
          <polyline points="8,86 72,64 136,42 212,20" fill="none" stroke="currentColor" stroke-width="3"/>
          <circle cx="8" cy="86" r="4"/><circle cx="72" cy="64" r="4"/><circle cx="136" cy="42" r="4"/><circle cx="212" cy="20" r="4"/>
        </svg>
      </div>`;
    case "chart-area":
      return `<div class="bgy-chart-frame bgy-chart-frame--area" ${chartAttrs("line", lineData)}>
        <div class="bgy-chart-area-band" aria-hidden="true"></div>
        <svg class="bgy-chart-line-visual" viewBox="0 0 220 112" aria-hidden="true">
          <polygon points="8,86 72,64 136,42 212,20 212,104 8,104" fill="currentColor" opacity="0.14"/>
          <polyline points="8,86 72,64 136,42 212,20" fill="none" stroke="currentColor" stroke-width="3"/>
        </svg>
      </div>`;
    case "chart-pie-donut":
      return `<div class="bgy-chart-split">
        <div class="bgy-chart-frame bgy-chart-frame--pie" ${chartAttrs("pie", pieData)}>
          <div class="bgy-chart-pie-legend"><span>已完成</span><strong>62%</strong></div>
        </div>
        <div class="bgy-chart-frame bgy-chart-frame--donut" data-ppt-placeholder="donut-progress">
          <svg class="bgy-ring-progress__svg" viewBox="0 0 80 80" aria-hidden="true">
            <circle cx="40" cy="40" r="28" fill="none" stroke="currentColor" stroke-width="8" opacity="0.18"/>
            <path d="M40 12a28 28 0 1 1 -24.2 42" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round"/>
          </svg>
          <span class="bgy-ring-progress__value">78%</span>
        </div>
      </div>`;
    case "chart-advanced":
      return `<div class="bgy-advanced-chart-grid">
        <div class="bgy-chart-frame bgy-chart-placeholder" data-ppt-placeholder="radar-chart">雷达图占位</div>
        <div class="bgy-chart-frame bgy-chart-placeholder" data-ppt-placeholder="combo-chart">组合图占位</div>
        <div class="bgy-chart-frame bgy-chart-placeholder" data-ppt-placeholder="waterfall-chart">瀑布图占位</div>
      </div>`;
    case "progress-bar":
      return `<div class="bgy-progress-panel">
        <div class="bgy-kpi-card__row"><span>项目推进</span><strong>84%</strong></div>
        <div class="bgy-progress"><span class="bgy-progress__track"><span class="bgy-progress__bar" style="width:84%"></span></span></div>
      </div>`;
    case "progress-ring":
      return `<div class="bgy-ring-progress" role="img" aria-label="完成率 78%">
        <svg class="bgy-ring-progress__svg" viewBox="0 0 80 80" aria-hidden="true">
          <circle cx="40" cy="40" r="28" fill="none" stroke="currentColor" stroke-width="8" opacity="0.18"/>
          <path d="M40 12a28 28 0 1 1 -24.2 42" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round"/>
        </svg>
        <div><strong>78%</strong><span>完成率</span></div>
      </div>`;
    case "progress-completion":
      return `<div class="bgy-progress-list">
        <div><span>工程巡检</span><strong>100%</strong><span class="bgy-progress__track"><span class="bgy-progress__bar" style="width:100%"></span></span></div>
        <div><span>客户闭环</span><strong>92%</strong><span class="bgy-progress__track"><span class="bgy-progress__bar" style="width:92%"></span></span></div>
        <div><span>整改复核</span><strong>76%</strong><span class="bgy-progress__track"><span class="bgy-progress__bar is-warning" style="width:76%"></span></span></div>
      </div>`;
    case "progress-target":
      return `<div class="bgy-target-card bgy-target-card--wide">
        <div><span>目标</span><strong>120项</strong></div>
        <div><span>实际</span><strong>128项</strong></div>
        <div><span>达成率</span><strong class="is-success">106.7%</strong></div>
      </div>`;
    case "progress-stage":
      return `<div class="bgy-stage-progress">
        <span class="is-done">立项</span><span class="is-done">执行</span><span class="is-active">复核</span><span>归档</span>
      </div>`;
    case "progress-milestone":
      return `<div class="bgy-milestone-list">
        <div><strong>07.20</strong><span>完成巡检</span></div>
        <div><strong>07.28</strong><span>问题复核</span></div>
        <div><strong>08.05</strong><span>验收归档</span></div>
      </div>`;
    case "compare-yoy":
      return `<div class="bgy-delta-grid">
        <div class="bgy-delta-card is-up"><strong>同比</strong><span>+8.4%</span><p>收入提升</p></div>
        <div class="bgy-delta-card is-down"><strong>环比</strong><span>-2.1%</span><p>投诉下降</p></div>
      </div>`;
    case "compare-target-actual":
      return `<div class="bgy-comparison">
        <div class="bgy-compare-card"><span>目标</span><strong>95%</strong></div>
        <div class="bgy-compare-card is-primary"><span>实际</span><strong>96.4%</strong></div>
      </div>`;
    case "compare-plan-finish":
      return `<table class="bgy-table demo-table">
        <thead><tr><th>事项</th><th>计划</th><th>完成</th></tr></thead>
        <tbody><tr><td>巡检</td><td>40</td><td>42</td></tr><tr><td>整改</td><td>18</td><td>16</td></tr></tbody>
      </table>`;
    case "compare-before-after":
      return `<div class="bgy-before-after">
        <div><span>Before</span><strong>流程分散</strong><p>跨部门沟通慢</p></div>
        <div><span>After</span><strong>统一闭环</strong><p>责任节点清晰</p></div>
      </div>`;
    case "compare-ab":
      return `<div class="bgy-comparison">
        <div class="bgy-compare-card"><span>A 方案</span><strong>投入低</strong><p>周期较长</p></div>
        <div class="bgy-compare-card"><span>B 方案</span><strong>见效快</strong><p>需资源协同</p></div>
      </div>`;
    case "ranking-top3":
      return `<ol class="bgy-ranking-list bgy-ranking-list--top3">
        <li><strong>01</strong><span>凤凰城</span><em>98.2</em></li>
        <li><strong>02</strong><span>云山府</span><em>96.8</em></li>
        <li><strong>03</strong><span>湖畔苑</span><em>95.1</em></li>
      </ol>`;
    case "ranking-list":
      return `<ol class="bgy-ranking-list">
        <li><strong>1</strong><span>一区</span><em>101.2%</em></li>
        <li><strong>2</strong><span>二区</span><em>98.6%</em></li>
        <li><strong>3</strong><span>三区</span><em>94.8%</em></li>
        <li><strong>4</strong><span>四区</span><em>91.3%</em></li>
      </ol>`;
    case "ranking-project":
      return `<div class="bgy-ranking-card">
        <div><strong>TOP 项目</strong><span class="bgy-status-tag is-success">上升</span></div>
        <ol class="bgy-ranking-list"><li><strong>1</strong><span>凤凰城</span><em>+4.2%</em></li><li><strong>2</strong><span>云山府</span><em>+2.8%</em></li></ol>
      </div>`;
    case "process-horizontal":
      return `<div class="bgy-process bgy-process--horizontal">
        <div class="bgy-process-step"><strong>发现</strong><span>问题</span></div><span class="bgy-process-line" data-ppt-line-end="triangle"></span>
        <div class="bgy-process-step"><strong>分析</strong><span>原因</span></div><span class="bgy-process-line" data-ppt-line-end="triangle"></span>
        <div class="bgy-process-step"><strong>执行</strong><span>措施</span></div>
      </div>`;
    case "process-vertical":
      return `<div class="bgy-process bgy-process--vertical">
        <div class="bgy-process-step"><strong>提交</strong><span>工单</span></div>
        <div class="bgy-process-step"><strong>处理</strong><span>整改</span></div>
        <div class="bgy-process-step"><strong>验收</strong><span>闭环</span></div>
      </div>`;
    case "process-loop":
      return `<div class="bgy-process-loop">
        <div class="bgy-process-step">发现问题</div><div class="bgy-process-step">制定措施</div>
        <div class="bgy-process-step">执行复核</div><div class="bgy-process-step">验收闭环</div>
      </div>`;
    case "process-pdca":
      return `<div class="bgy-pdca">
        <div><strong>P</strong><span>计划</span></div><div><strong>D</strong><span>执行</span></div><div><strong>C</strong><span>检查</span></div><div><strong>A</strong><span>处理</span></div>
      </div>`;
    case "timeline-project":
      return `<div class="bgy-timeline">
        <div class="bgy-timeline-item"><span class="bgy-timeline-dot"></span><strong>7月</strong><p>主题锁定</p></div>
        <div class="bgy-timeline-item"><span class="bgy-timeline-dot"></span><strong>8月</strong><p>页面复用</p></div>
        <div class="bgy-timeline-item"><span class="bgy-timeline-dot"></span><strong>9月</strong><p>PPTX 交付</p></div>
      </div>`;
    case "timeline-month":
      return `<div class="bgy-milestone-list">
        <div><strong>第1周</strong><span>问题梳理</span></div>
        <div><strong>第2周</strong><span>整改推进</span></div>
        <div><strong>第4周</strong><span>复盘归档</span></div>
      </div>`;
    case "timeline-roadmap":
      return `<div class="bgy-roadmap">
        <div><strong>Q3</strong><span>标准化</span></div>
        <div><strong>Q4</strong><span>全面复制</span></div>
        <div><strong>Q1</strong><span>效果评估</span></div>
      </div>`;
    case "risk-card":
      return `<article class="bgy-risk-card">
        <span class="bgy-risk-card__level is-medium">中风险</span>
        <strong>外包维保响应时效不足</strong>
        <p>需明确 SLA 并按周复核。</p>
      </article>`;
    case "risk-level":
      return `<div class="bgy-risk-levels">
        <span class="bgy-risk-level is-low">低</span><span class="bgy-risk-level is-medium">中</span><span class="bgy-risk-level is-high">高</span>
      </div>`;
    case "risk-matrix":
      return `<div class="bgy-risk-matrix">
        <span class="bgy-risk-cell is-low">低</span><span class="bgy-risk-cell is-medium">中</span><span class="bgy-risk-cell is-high">高</span>
        <span class="bgy-risk-cell is-medium">中</span><span class="bgy-risk-cell is-high">高</span><span class="bgy-risk-cell is-high">高</span>
      </div>`;
    case "risk-list":
      return `<table class="bgy-table demo-table">
        <thead><tr><th>问题</th><th>责任</th><th>期限</th></tr></thead>
        <tbody><tr><td>台账缺项</td><td>工程</td><td>7.28</td></tr><tr><td>复核滞后</td><td>品质</td><td>8.05</td></tr></tbody>
      </table>`;
    case "risk-action":
      return `<div class="bgy-risk-action">
        <div><strong>风险</strong><span>整改时效不足</span></div>
        <div><strong>措施</strong><span>按周复核并通报</span></div>
      </div>`;
    case "image-single":
      return `<article class="bgy-image-card">
        <div class="bgy-image-frame"><div class="bgy-image-placeholder">项目照片</div></div>
        <p>图片为真实 img；缺素材时使用占位。</p>
      </article>`;
    case "image-text":
      return `<div class="bgy-image-text">
        <div class="bgy-image-frame"><div class="bgy-image-placeholder">现场图</div></div>
        <div><strong>整改完成</strong><p>现场标识、动线和台账同步更新。</p></div>
      </div>`;
    case "image-gallery":
      return `<div class="bgy-image-grid">
        <div class="bgy-image-frame"><div class="bgy-image-placeholder">图1</div></div>
        <div class="bgy-image-frame"><div class="bgy-image-placeholder">图2</div></div>
        <div class="bgy-image-frame"><div class="bgy-image-placeholder">图3</div></div>
        <div class="bgy-image-frame"><div class="bgy-image-placeholder">图4</div></div>
      </div>`;
    case "image-before-after":
      return `<div class="bgy-before-after bgy-before-after--images">
        <div><span>Before</span><div class="bgy-image-frame"><div class="bgy-image-placeholder">整改前</div></div></div>
        <div><span>After</span><div class="bgy-image-frame"><div class="bgy-image-placeholder">整改后</div></div></div>
      </div>`;
    case "case-card":
      return `<article class="bgy-case-card">
        <div class="bgy-image-frame"><div class="bgy-image-placeholder">案例图</div></div>
        <div><span class="bgy-status-tag is-success">已闭环</span><strong>电梯机房隐患整改</strong></div>
      </article>`;
    case "hero":
      return `<div class="demo-hero">
        <span>01</span>
        <div>
          <h3>${title}</h3>
          <p>主题、字体、组件和间距来自同一份 bgy.project.json。</p>
        </div>
      </div>`;
    default:
      return `<div class="demo-panel bgy-panel"><p>组件预览</p></div>`;
  }
}

function renderComponentCard(item, normalized) {
  return `<article class="component-card" id="component-${escapeHtml(item.id)}">
    <div class="component-card__head">
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.summary)}</p>
    </div>
    <div class="component-card__preview">${componentPreviewMarkup(item.preview, normalized)}</div>
  </article>`;
}

function renderComponentSections(normalized, groups = COMPONENT_GROUPS) {
  return groups.map(group => `<section class="component-section" id="${escapeHtml(group.id)}">
    <div class="component-section__head">
      <div>
        <h2>${escapeHtml(group.title)}</h2>
        <p>${escapeHtml(group.summary)}</p>
      </div>
    </div>
    <div class="component-grid">
      ${group.items.map(item => renderComponentCard(item, normalized)).join("")}
    </div>
  </section>`).join("");
}

function compactComponentCards(normalized) {
  const compactItems = [
    COMPONENT_GROUPS[0].items[0],
    COMPONENT_GROUPS[1].items[3],
    COMPONENT_GROUPS[2].items[0],
    COMPONENT_GROUPS[3].items[0],
    COMPONENT_GROUPS[4].items[0],
    COMPONENT_GROUPS[9].items[1],
  ];
  return compactItems.map(item => renderComponentCard(item, normalized)).join("");
}

export function buildDeckJson(config) {
  const normalized = normalizeProjectConfig(config);
  return {
    meta: {
      title: normalized.project.title,
      theme: "bgy-services",
      template: "bgy-services-base",
      archetype: normalized.project.type,
      preset: normalized.project.preset,
      ratio: "16:9",
      mode: normalized.project.editablePptx ? "html-to-pptx" : "html-preview",
      projectConfig: "bgy.project.json",
    },
    slides: [
      {
        id: "slide-01",
        label: "风格看板",
        type: "style-board",
        layoutVariant: "project-contract",
        file: "slides/01-style-board.html",
        components: [],
      },
    ],
  };
}

export function buildProjectConfigHtml(config, presets = loadBuiltinPresets()) {
  const normalized = normalizeProjectConfig(config);
  const presetList = Object.values(presets).map(preset => normalizeProjectConfig({
    project: { preset: preset.id || preset.projectType || "management-report" },
    ...preset,
  }));
  const defaultPresetOptions = presetList
    .map(item => `<option value="${escapeHtml(item.project.preset)}">${escapeHtml(item.label || item.project.preset)}</option>`)
    .join("");
  const presetCards = renderPresetCards(presets, normalized.project.preset);
  const quickComponents = compactComponentCards(normalized);

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BGY 项目配置 - ${escapeHtml(normalized.project.title)}</title>
  <style>
    :root {
      --page: #f3f6f8;
      --surface: #ffffff;
      --text: #1f2933;
      --muted: #64748b;
      --line: #d8e3ea;
      --brand: ${normalized.theme.brand};
      --deep: ${normalized.theme.deepBrand};
      --radius: 8px;
      --bgy-brand: ${normalized.theme.brand};
      --bgy-deep-brand: ${normalized.theme.deepBrand};
      --bgy-success: ${normalized.theme.success};
      --bgy-success-bg: ${normalized.theme.successBg};
      --bgy-warning: ${normalized.theme.warning};
      --bgy-warning-bg: ${normalized.theme.warningBg};
      --bgy-danger: ${normalized.theme.danger};
      --bgy-danger-bg: ${normalized.theme.dangerBg};
      --bgy-info: ${normalized.theme.info};
      --bgy-info-bg: ${normalized.theme.infoBg};
      --bgy-text: ${normalized.theme.text};
      --bgy-muted: ${normalized.theme.muted};
      --bgy-panel: ${normalized.theme.panel};
      --bgy-surface: ${normalized.theme.surface};
      --bgy-page-bg: ${normalized.theme.pageBg};
      --bgy-line: ${normalized.theme.line};
      --bgy-white: ${normalized.theme.white};
      --bgy-black: ${normalized.theme.black};
      --bgy-font-family: ${normalized.rules.fontFamily};
      --bgy-card-radius: ${normalized.components.cardRadius}px;
      --bgy-panel-radius: ${normalized.components.panelRadius}px;
      --bgy-tag-radius: ${normalized.components.tagRadius}px;
      --bgy-metric-radius: ${normalized.components.metricRadius}px;
      --bgy-image-radius: ${normalized.components.imageRadius}px;
      --bgy-border-width: ${normalized.components.borderWidth}px;
      --bgy-card-shadow: ${normalized.components.cardShadow};
      --bgy-panel-shadow: ${normalized.components.panelShadow};
      --bgy-table-header-bg: ${normalized.components.tableHeaderBg};
      --bgy-table-row-alt: ${normalized.components.tableRowAlt};
      --bgy-table-border: ${normalized.components.tableBorder};
      --bgy-section-gap: ${normalized.components.sectionGap}px;
      --bgy-chart-1: ${normalized.theme.chart[0]};
      --bgy-chart-2: ${normalized.theme.chart[1]};
      --bgy-chart-3: ${normalized.theme.chart[2]};
      --bgy-chart-4: ${normalized.theme.chart[3]};
      --bgy-chart-5: ${normalized.theme.chart[4]};
      font-family: "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: var(--text);
      background: var(--page);
      font-family: "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
      letter-spacing: 0;
    }
    .app {
      display: grid;
      grid-template-columns: 420px minmax(0, 1fr);
      min-height: 100vh;
    }
    aside {
      background: var(--surface);
      border-right: 1px solid var(--line);
      padding: 22px;
      overflow: auto;
    }
    main {
      padding: 26px;
      overflow: auto;
    }
    h1 {
      margin: 0 0 6px;
      font-size: 22px;
      color: var(--deep);
    }
    h2 {
      margin: 24px 0 12px;
      font-size: 15px;
      color: var(--text);
    }
    p {
      margin: 0;
      color: var(--muted);
      line-height: 1.6;
      font-size: 13px;
    }
    label {
      display: grid;
      gap: 7px;
      margin: 12px 0;
      color: var(--muted);
      font-size: 12px;
      font-weight: 600;
    }
    input,
    select,
    textarea {
      width: 100%;
      border: 1px solid var(--line);
      border-radius: 6px;
      padding: 9px 10px;
      background: #fff;
      color: var(--text);
      font: inherit;
      font-size: 13px;
    }
    input[type="color"] {
      height: 38px;
      padding: 4px;
    }
    input[type="checkbox"] {
      width: 16px;
      height: 16px;
    }
    .row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }
    .inline {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 14px 0;
      color: var(--text);
      font-size: 13px;
      font-weight: 600;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 18px;
    }
    .actions-top {
      position: sticky;
      top: 0;
      z-index: 5;
      margin: 16px 0 0;
      padding: 12px 0;
      background: var(--surface);
      border-top: 1px solid var(--line);
      border-bottom: 1px solid var(--line);
    }
    button {
      border: 0;
      border-radius: 6px;
      padding: 9px 13px;
      background: var(--brand);
      color: #fff;
      font: inherit;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    button.secondary {
      background: #e9f2f6;
      color: var(--deep);
    }
    button.ghost {
      background: #fff;
      color: var(--text);
      border: 1px solid var(--line);
    }
    .status {
      margin-top: 14px;
      padding: 10px 12px;
      border-radius: 6px;
      background: #f5f8fa;
      color: var(--muted);
      font-size: 12px;
      line-height: 1.5;
      white-space: pre-wrap;
    }
    .theme-mode {
      margin-top: 18px;
      padding-top: 18px;
      border-top: 1px solid var(--line);
    }
    .mode-toggle {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
      margin: 12px 0 14px;
      padding: 4px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #f6f9fb;
    }
    .mode-toggle button {
      background: transparent;
      color: var(--muted);
      border-radius: 5px;
      padding: 8px 10px;
    }
    body[data-theme-mode="preset"] .mode-toggle [data-mode-toggle="preset"],
    body[data-theme-mode="custom"] .mode-toggle [data-mode-toggle="custom"] {
      background: var(--brand);
      color: #fff;
    }
    .preset-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }
    .preset-card {
      display: grid;
      gap: 8px;
      min-height: 142px;
      padding: 12px;
      color: var(--text);
      text-align: left;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fff;
    }
    .preset-card.is-active {
      border-color: var(--brand);
      box-shadow: 0 0 0 2px rgba(0, 109, 154, 0.14);
    }
    body[data-theme-mode="custom"] .preset-card--custom {
      border-color: var(--brand);
      box-shadow: 0 0 0 2px rgba(0, 109, 154, 0.14);
    }
    .preset-card__label {
      color: var(--deep);
      font-size: 14px;
      font-weight: 700;
    }
    .preset-card__desc,
    .preset-card__meta {
      color: var(--muted);
      font-size: 11px;
      line-height: 1.45;
    }
    .preset-card__colors,
    .color-strip {
      display: flex;
      gap: 4px;
      height: 18px;
    }
    .preset-card__colors span,
    .color-strip span {
      flex: 1;
      min-width: 0;
      border-radius: 3px;
      border: 1px solid rgba(15, 23, 42, 0.08);
    }
    .custom-editor {
      margin-top: 20px;
      padding-top: 18px;
      border-top: 1px solid var(--line);
    }
    body[data-theme-mode="preset"] .custom-editor {
      display: none;
    }
    .component-preview {
      margin-top: 26px;
    }
    .component-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
      margin-top: 14px;
    }
    .component-card {
      min-height: 220px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fff;
      overflow: hidden;
    }
    .component-card__head {
      padding: 12px 14px 8px;
      border-bottom: 1px solid var(--line);
    }
    .component-card__head h3 {
      margin: 0 0 5px;
      color: var(--deep);
      font-size: 14px;
    }
    .component-card__head p {
      font-size: 12px;
    }
    .component-card__preview {
      min-height: 135px;
      padding: 14px;
      background: #fbfdfe;
    }
    .bgy-metric-card,
    .bgy-panel,
    .bgy-card {
      background: var(--cfg-surface, #fff);
      border: 1px solid var(--cfg-line, #d8e3ea);
      border-radius: var(--cfg-card-radius, 8px);
      overflow: hidden;
    }
    .bgy-panel {
      border-radius: var(--cfg-panel-radius, var(--cfg-card-radius, 8px));
      box-shadow: var(--cfg-panel-shadow, 0 2px 8px rgba(0,0,0,0.05));
    }
    .bgy-card,
    .bgy-metric-card {
      box-shadow: var(--cfg-card-shadow, 0 4px 14px rgba(0,0,0,0.08));
    }
    .bgy-metric-card {
      padding: 14px;
      border-radius: var(--cfg-metric-radius, var(--cfg-card-radius, 8px));
    }
    .bgy-metric-value {
      margin: 0;
      color: var(--cfg-deep, #004b6b);
      font-size: 24px;
      line-height: 1;
      font-weight: 700;
    }
    .bgy-metric-label {
      margin: 6px 0 0;
      color: var(--cfg-muted, #64748b);
      font-size: 12px;
    }
    .bgy-status-tag {
      display: inline-flex;
      align-items: center;
      padding: 5px 9px;
      border-radius: var(--cfg-tag-radius, 4px);
      font-size: 12px;
      line-height: 1;
      font-weight: 700;
      white-space: nowrap;
    }
    .bgy-status-tag.is-success { color: var(--cfg-success, #2e7d32); background: var(--cfg-success-bg, #eaf5eb); }
    .bgy-status-tag.is-warning { color: var(--cfg-warning, #c97400); background: var(--cfg-warning-bg, #fff3e3); }
    .bgy-status-tag.is-danger { color: var(--cfg-danger, #c00000); background: var(--cfg-danger-bg, #fdecec); }
    .bgy-status-tag.is-info { color: var(--cfg-info, #2b6cb0); background: var(--cfg-info-bg, #eaf3fb); }
    .bgy-callout {
      padding: 14px;
      background: var(--cfg-panel, #f5f8fa);
      border-left: 4px solid var(--cfg-brand, #006d9a);
      border-radius: var(--cfg-card-radius, 8px);
    }
    .bgy-callout__title {
      margin: 0 0 6px;
      color: var(--cfg-deep, #004b6b);
      font-size: 14px;
      font-weight: 700;
    }
    .bgy-callout__text {
      margin: 0;
      color: var(--cfg-text, #1f2933);
      font-size: 12px;
      line-height: 1.6;
    }
    .bgy-table {
      width: 100%;
      border-collapse: collapse;
      color: var(--cfg-text, #1f2933);
      font-size: 12px;
    }
    .bgy-table th,
    .bgy-table td {
      padding: 7px 8px;
      border-bottom: 1px solid var(--cfg-line, #d8e3ea);
      text-align: left;
    }
    .bgy-table th {
      color: var(--cfg-muted, #64748b);
      background: var(--cfg-panel, #f5f8fa);
    }
    .demo-metrics {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }
    .demo-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    ${buildComponentsCss(normalized)}
    .component-card__preview .bgy-table {
      font-size: 12px;
    }
    .component-card__preview .bgy-table th,
    .component-card__preview .bgy-table td {
      padding: 6px 7px;
    }
    .component-card__preview .bgy-kpi-card,
    .component-card__preview .bgy-card,
    .component-card__preview .bgy-data-card,
    .component-card__preview .bgy-highlight-card,
    .component-card__preview .bgy-risk-card,
    .component-card__preview .bgy-conclusion-card,
    .component-card__preview .bgy-progress-panel,
    .component-card__preview .bgy-image-card,
    .component-card__preview .bgy-case-card {
      padding: 12px;
    }
    .component-card__preview .bgy-kpi-card__value,
    .component-card__preview .bgy-metric-value {
      font-size: 24px;
    }
    .component-card__preview .bgy-kpi-card--hero .bgy-kpi-card__value {
      font-size: 34px;
    }
    .component-card__preview .bgy-card__title,
    .component-card__preview .bgy-data-card strong,
    .component-card__preview .bgy-highlight-card strong,
    .component-card__preview .bgy-risk-card strong,
    .component-card__preview .bgy-conclusion-card strong,
    .component-card__preview .bgy-case-card strong {
      font-size: 15px;
    }
    .component-card__preview .bgy-card__text,
    .component-card__preview .bgy-kpi-card__note,
    .component-card__preview .bgy-image-card p {
      font-size: 12px;
    }
    .component-card__preview .bgy-status-tag {
      font-size: 12px;
      padding: 4px 7px;
    }
    .component-card__preview .bgy-chart-frame {
      min-height: 120px;
      padding: 10px;
    }
    .preview-shell {
      max-width: 1120px;
      margin: 0 auto;
    }
    .preview-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }
    .preview {
      width: 960px;
      height: 540px;
      background: #fff;
      border: 1px solid var(--line);
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
      transform-origin: top left;
      overflow: hidden;
      position: relative;
    }
    .slide {
      position: absolute;
      inset: 0;
      padding: 54px 60px;
      background: var(--cfg-page-bg, #fff);
      color: var(--cfg-text, #1f2933);
      font-family: "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
    }
    .title {
      display: flex;
      align-items: baseline;
      gap: 22px;
      color: var(--cfg-brand, #006d9a);
      font-weight: 700;
      font-size: 25px;
    }
    .title span:first-child {
      font-size: 35px;
    }
    .preview-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
      margin-top: 34px;
    }
    .card {
      border: 1px solid var(--cfg-line, #d8e3ea);
      border-radius: var(--cfg-card-radius, 8px);
      box-shadow: var(--cfg-card-shadow, 0 4px 14px rgba(0,0,0,0.08));
      background: var(--cfg-surface, #fff);
      padding: 16px;
      height: 120px;
    }
    .metric {
      font-size: 24px;
      line-height: 1;
      color: var(--cfg-deep, #004b6b);
      font-weight: 700;
    }
    .label {
      margin-top: 8px;
      color: var(--cfg-muted, #64748b);
      font-size: 12px;
    }
    .tag-row {
      display: flex;
      gap: 8px;
      margin: 24px 0 14px;
    }
    .tag {
      padding: 6px 10px;
      border-radius: var(--cfg-tag-radius, 4px);
      font-size: 12px;
      font-weight: 700;
    }
    .success { color: var(--cfg-success, #2e7d32); background: var(--cfg-success-bg, #eaf5eb); }
    .warning { color: var(--cfg-warning, #c97400); background: var(--cfg-warning-bg, #fff3e3); }
    .danger { color: var(--cfg-danger, #c00000); background: var(--cfg-danger-bg, #fdecec); }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    th,
    td {
      padding: 8px 10px;
      border-bottom: 1px solid var(--cfg-line, #d8e3ea);
      text-align: left;
    }
    th {
      color: var(--cfg-muted, #64748b);
      background: var(--cfg-panel, #f5f8fa);
    }
    .palette {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 8px;
      margin-top: 18px;
    }
    .swatch {
      height: 32px;
      border-radius: 5px;
      border: 1px solid rgba(0,0,0,0.08);
    }
    @media (max-width: 980px) {
      .app { grid-template-columns: 1fr; }
      aside { border-right: 0; border-bottom: 1px solid var(--line); }
      .preview { width: 100%; height: auto; aspect-ratio: 16 / 9; }
    }
  </style>
</head>
<body data-theme-mode="${escapeHtml(normalized.project.themeMode)}">
  <div class="app">
    <aside>
      <h1>项目配置</h1>
      <p>一旦锁定，后续每页 HTML 都应读取同一份 bgy.project.json。</p>
      <div class="actions actions-top">
        <button id="saveTop">保存配置</button>
        <button id="downloadTop" class="ghost">下载 JSON</button>
      </div>

      <section class="theme-mode">
        <h2>选择主题</h2>
        <p>先选一个预设主题；只有选择自定义时，下面才展开完整颜色和组件细节。</p>
        <div class="mode-toggle" role="group" aria-label="主题模式">
          <button type="button" data-mode-toggle="preset">预设主题</button>
          <button type="button" data-mode-toggle="custom">自定义主题</button>
        </div>
        <div class="preset-grid">${presetCards}</div>
      </section>

      <h2>基础信息</h2>
      <label>项目标题 <input id="projectTitle" type="text"></label>
      <label>项目名称 <input id="projectName" type="text"></label>
      <label>项目类型 <input id="projectType" type="text"></label>
      <label>当前预设
        <select id="projectPreset">${defaultPresetOptions}</select>
      </label>
      <div class="inline"><input id="locked" type="checkbox"><span>锁定项目主题</span></div>

      <div id="customEditor" class="custom-editor">
      <h2>自定义主题</h2>
      <p>这些设置会写入项目 token，后续每页 HTML 和 PPTX 转换都应复用它们。</p>

      <h2>主题色</h2>
      <div class="row">
        <label>主色 <input id="brand" type="color"></label>
        <label>深主色 <input id="deepBrand" type="color"></label>
        <label>成功 <input id="success" type="color"></label>
        <label>成功底 <input id="successBg" type="color"></label>
        <label>警示 <input id="warning" type="color"></label>
        <label>警示底 <input id="warningBg" type="color"></label>
        <label>风险 <input id="danger" type="color"></label>
        <label>风险底 <input id="dangerBg" type="color"></label>
        <label>信息 <input id="info" type="color"></label>
        <label>信息底 <input id="infoBg" type="color"></label>
        <label>正文 <input id="text" type="color"></label>
        <label>辅助字 <input id="muted" type="color"></label>
        <label>浅底 <input id="panel" type="color"></label>
        <label>卡片背景 <input id="surface" type="color"></label>
        <label>页面背景 <input id="pageBg" type="color"></label>
        <label>线条 <input id="line" type="color"></label>
      </div>

      <h2>组件</h2>
      <div class="row">
        <label>卡片圆角 <input id="cardRadius" type="number" min="0" max="24"></label>
        <label>面板圆角 <input id="panelRadius" type="number" min="0" max="24"></label>
        <label>标签圆角 <input id="tagRadius" type="number" min="0" max="24"></label>
        <label>指标圆角 <input id="metricRadius" type="number" min="0" max="24"></label>
        <label>图片圆角 <input id="imageRadius" type="number" min="0" max="24"></label>
        <label>边线宽度 <input id="borderWidth" type="number" min="0" max="4" step="0.5"></label>
      </div>
      <label>卡片阴影 <input id="cardShadow" type="text"></label>
      <label>面板阴影 <input id="panelShadow" type="text"></label>
      <label>图标包
        <select id="iconPack">
          <option value="line">line</option>
          <option value="solid">solid</option>
          <option value="bgy-business">bgy-business</option>
        </select>
      </label>
      <label>表格密度
        <select id="tableDensity">
          <option value="dense">dense</option>
          <option value="compact">compact</option>
          <option value="comfortable">comfortable</option>
        </select>
      </label>
      </div>

      <div class="actions">
        <button id="applyPreset" class="secondary">应用 preset</button>
        <button id="save">保存配置</button>
        <button id="download" class="ghost">下载 JSON</button>
      </div>
      <div id="status" class="status">等待载入配置。</div>
    </aside>

    <main>
      <div class="preview-shell">
        <div class="preview-header">
          <div>
            <h1 id="previewTitle">项目风格预览</h1>
            <p>这个预览只看设计契约，不参与 PPTX 转换。</p>
          </div>
          <button id="openBoard" class="secondary">打开风格看板</button>
        </div>
        <div class="preview">
          <section class="slide" id="previewSlide">
            <div class="title"><span>01</span><span>经营指标保持稳中有进</span></div>
            <div class="preview-grid">
              <div class="card"><div class="metric">96.4%</div><div class="label">重点任务完成率</div></div>
              <div class="card"><div class="metric">12项</div><div class="label">本月闭环事项</div></div>
              <div class="card"><div class="metric">0起</div><div class="label">重大风险事件</div></div>
            </div>
            <div class="tag-row">
              <span class="tag success">已完成</span>
              <span class="tag warning">推进中</span>
              <span class="tag danger">需协调</span>
            </div>
            <table>
              <thead><tr><th>事项</th><th>状态</th><th>责任部门</th><th>完成时间</th></tr></thead>
              <tbody>
                <tr><td>消防维保巡检</td><td>已完成</td><td>工程部</td><td>7月20日</td></tr>
                <tr><td>客户诉求闭环</td><td>推进中</td><td>客服部</td><td>7月31日</td></tr>
              </tbody>
            </table>
            <div class="palette" id="palette"></div>
          </section>
        </div>
        <section class="component-preview">
          <div class="preview-header">
            <div>
              <h1>组件预览</h1>
              <p>这些组件会跟随当前主题 token 变化；完整组件库请打开风格看板。</p>
            </div>
          </div>
          <div class="component-grid">${quickComponents}</div>
        </section>
      </div>
    </main>
  </div>

  <script id="embeddedConfig" type="application/json">${jsonForScript(normalized)}</script>
  <script id="embeddedPresets" type="application/json">${jsonForScript(presets)}</script>
  <script>
    const embeddedConfig = JSON.parse(document.getElementById("embeddedConfig").textContent);
    const presets = JSON.parse(document.getElementById("embeddedPresets").textContent);
    let config = structuredClone(embeddedConfig);
    let apiAvailable = false;

    const fieldIds = [
      "brand", "deepBrand", "success", "successBg", "warning", "warningBg",
      "danger", "dangerBg", "info", "infoBg", "text", "muted", "panel", "surface", "pageBg", "line"
    ];

    function setStatus(text) {
      document.getElementById("status").textContent = text;
    }

    function clone(value) {
      return JSON.parse(JSON.stringify(value));
    }

    function normalizeHex(value, fallback) {
      const raw = String(value || "").trim();
      return /^#[0-9a-f]{6}$/i.test(raw) ? raw.toUpperCase() : fallback;
    }

    function merge(base, patch) {
      const out = clone(base);
      for (const [key, value] of Object.entries(patch || {})) {
        if (value && typeof value === "object" && !Array.isArray(value) && out[key] && typeof out[key] === "object") {
          out[key] = merge(out[key], value);
        } else {
          out[key] = clone(value);
        }
      }
      return out;
    }

    function normalizeConfig(value) {
      const merged = merge(embeddedConfig, value || {});
      merged.project = merged.project || {};
      merged.theme = merged.theme || {};
      merged.components = merged.components || {};
      merged.project.themeMode = merged.project.themeMode === "custom" ? "custom" : "preset";
      merged.project.preset = merged.project.preset || "management-report";
      return merged;
    }

    function currentThemeMode() {
      return config.project?.themeMode === "custom" ? "custom" : "preset";
    }

    function setThemeMode(mode) {
      config.project.themeMode = mode === "custom" ? "custom" : "preset";
      updateThemeModeUI();
      renderPreview();
    }

    function updateThemeModeUI() {
      const mode = currentThemeMode();
      document.body.dataset.themeMode = mode;
      document.querySelectorAll("[data-mode-toggle]").forEach(button => {
        button.setAttribute("aria-pressed", button.dataset.modeToggle === mode ? "true" : "false");
      });
      document.querySelectorAll("[data-preset]").forEach(button => {
        button.classList.toggle("is-active", mode === "preset" && button.dataset.preset === config.project.preset);
      });
      document.querySelectorAll("[data-theme-mode-card='custom']").forEach(button => {
        button.classList.toggle("is-active", mode === "custom");
      });
    }

    function setThemeVars(target, theme, components) {
      const chart = theme.chart || [];
      target.style.setProperty("--cfg-brand", theme.brand);
      target.style.setProperty("--cfg-deep", theme.deepBrand);
      target.style.setProperty("--cfg-success", theme.success);
      target.style.setProperty("--cfg-success-bg", theme.successBg);
      target.style.setProperty("--cfg-warning", theme.warning);
      target.style.setProperty("--cfg-warning-bg", theme.warningBg);
      target.style.setProperty("--cfg-danger", theme.danger);
      target.style.setProperty("--cfg-danger-bg", theme.dangerBg);
      target.style.setProperty("--cfg-info", theme.info);
      target.style.setProperty("--cfg-info-bg", theme.infoBg);
      target.style.setProperty("--cfg-text", theme.text);
      target.style.setProperty("--cfg-muted", theme.muted);
      target.style.setProperty("--cfg-panel", theme.panel);
      target.style.setProperty("--cfg-surface", theme.surface || "#FFFFFF");
      target.style.setProperty("--cfg-line", theme.line);
      target.style.setProperty("--cfg-page-bg", theme.pageBg || "#FFFFFF");
      target.style.setProperty("--cfg-card-radius", (components.cardRadius ?? 8) + "px");
      target.style.setProperty("--cfg-panel-radius", (components.panelRadius ?? components.cardRadius ?? 8) + "px");
      target.style.setProperty("--cfg-tag-radius", (components.tagRadius ?? 4) + "px");
      target.style.setProperty("--cfg-metric-radius", (components.metricRadius ?? components.cardRadius ?? 8) + "px");
      target.style.setProperty("--cfg-card-shadow", components.cardShadow || "0 4px 14px rgba(0,0,0,0.08)");
      target.style.setProperty("--cfg-panel-shadow", components.panelShadow || "0 2px 8px rgba(0,0,0,0.05)");
      target.style.setProperty("--bgy-brand", theme.brand);
      target.style.setProperty("--bgy-deep-brand", theme.deepBrand);
      target.style.setProperty("--bgy-success", theme.success);
      target.style.setProperty("--bgy-success-bg", theme.successBg);
      target.style.setProperty("--bgy-warning", theme.warning);
      target.style.setProperty("--bgy-warning-bg", theme.warningBg);
      target.style.setProperty("--bgy-danger", theme.danger);
      target.style.setProperty("--bgy-danger-bg", theme.dangerBg);
      target.style.setProperty("--bgy-info", theme.info);
      target.style.setProperty("--bgy-info-bg", theme.infoBg);
      target.style.setProperty("--bgy-text", theme.text);
      target.style.setProperty("--bgy-muted", theme.muted);
      target.style.setProperty("--bgy-panel", theme.panel);
      target.style.setProperty("--bgy-surface", theme.surface || "#FFFFFF");
      target.style.setProperty("--bgy-page-bg", theme.pageBg || "#FFFFFF");
      target.style.setProperty("--bgy-line", theme.line);
      target.style.setProperty("--bgy-white", theme.white || "#FFFFFF");
      target.style.setProperty("--bgy-black", theme.black || "#000000");
      target.style.setProperty("--bgy-card-radius", (components.cardRadius ?? 8) + "px");
      target.style.setProperty("--bgy-panel-radius", (components.panelRadius ?? components.cardRadius ?? 8) + "px");
      target.style.setProperty("--bgy-tag-radius", (components.tagRadius ?? 4) + "px");
      target.style.setProperty("--bgy-metric-radius", (components.metricRadius ?? components.cardRadius ?? 8) + "px");
      target.style.setProperty("--bgy-image-radius", (components.imageRadius ?? 6) + "px");
      target.style.setProperty("--bgy-border-width", (components.borderWidth ?? 1) + "px");
      target.style.setProperty("--bgy-card-shadow", components.cardShadow || "0 4px 14px rgba(0,0,0,0.08)");
      target.style.setProperty("--bgy-panel-shadow", components.panelShadow || "0 2px 8px rgba(0,0,0,0.05)");
      target.style.setProperty("--bgy-table-header-bg", components.tableHeaderBg || theme.panel);
      target.style.setProperty("--bgy-table-row-alt", components.tableRowAlt || "#FAFCFD");
      target.style.setProperty("--bgy-table-border", components.tableBorder || theme.line);
      target.style.setProperty("--bgy-section-gap", (components.sectionGap ?? 24) + "px");
      target.style.setProperty("--bgy-chart-1", chart[0] || theme.brand);
      target.style.setProperty("--bgy-chart-2", chart[1] || theme.success);
      target.style.setProperty("--bgy-chart-3", chart[2] || theme.danger);
      target.style.setProperty("--bgy-chart-4", chart[3] || theme.warning);
      target.style.setProperty("--bgy-chart-5", chart[4] || theme.muted);
    }

    function applyToForm() {
      config = normalizeConfig(config);
      document.getElementById("projectTitle").value = config.project.title || "";
      document.getElementById("projectName").value = config.project.name || "";
      document.getElementById("projectType").value = config.project.type || "";
      document.getElementById("projectPreset").value = config.project.preset || "management-report";
      document.getElementById("locked").checked = Boolean(config.locked);
      for (const key of fieldIds) document.getElementById(key).value = normalizeHex(config.theme[key], "#000000");
      document.getElementById("cardRadius").value = config.components.cardRadius ?? 8;
      document.getElementById("panelRadius").value = config.components.panelRadius ?? 8;
      document.getElementById("tagRadius").value = config.components.tagRadius ?? 4;
      document.getElementById("metricRadius").value = config.components.metricRadius ?? 8;
      document.getElementById("imageRadius").value = config.components.imageRadius ?? 6;
      document.getElementById("borderWidth").value = config.components.borderWidth ?? 1;
      document.getElementById("cardShadow").value = config.components.cardShadow || "";
      document.getElementById("panelShadow").value = config.components.panelShadow || "";
      document.getElementById("iconPack").value = config.components.iconPack || "line";
      document.getElementById("tableDensity").value = config.components.tableDensity || "compact";
      updateThemeModeUI();
      renderPreview();
    }

    function readForm() {
      config.project.title = document.getElementById("projectTitle").value.trim();
      config.project.name = document.getElementById("projectName").value.trim();
      config.project.type = document.getElementById("projectType").value.trim();
      config.project.preset = document.getElementById("projectPreset").value;
      config.project.themeMode = currentThemeMode();
      config.locked = document.getElementById("locked").checked;
      for (const key of fieldIds) config.theme[key] = document.getElementById(key).value.toUpperCase();
      config.components.cardRadius = Number(document.getElementById("cardRadius").value || 8);
      config.components.panelRadius = Number(document.getElementById("panelRadius").value || 8);
      config.components.tagRadius = Number(document.getElementById("tagRadius").value || 4);
      config.components.metricRadius = Number(document.getElementById("metricRadius").value || 8);
      config.components.imageRadius = Number(document.getElementById("imageRadius").value || 6);
      config.components.borderWidth = Number(document.getElementById("borderWidth").value || 1);
      config.components.cardShadow = document.getElementById("cardShadow").value.trim();
      config.components.panelShadow = document.getElementById("panelShadow").value.trim();
      config.components.iconPack = document.getElementById("iconPack").value;
      config.components.tableDensity = document.getElementById("tableDensity").value;
      renderPreview();
      return config;
    }

    function renderPreview() {
      const slide = document.getElementById("previewSlide");
      const theme = config.theme || {};
      const components = config.components || {};
      setThemeVars(document.documentElement, theme, components);
      setThemeVars(slide, theme, components);
      document.documentElement.style.setProperty("--brand", theme.brand || "#006D9A");
      document.documentElement.style.setProperty("--deep", theme.deepBrand || "#004B6B");
      document.getElementById("previewTitle").textContent = config.project.title || "项目风格预览";
      const palette = document.getElementById("palette");
      palette.innerHTML = "";
      [theme.brand, theme.deepBrand, theme.success, theme.warning, theme.danger, theme.info].forEach(color => {
        const swatch = document.createElement("div");
        swatch.className = "swatch";
        swatch.style.background = color;
        palette.appendChild(swatch);
      });
    }

    async function loadConfig() {
      if (window.location.protocol === "file:") {
        apiAvailable = false;
        config = normalizeConfig(embeddedConfig);
        setStatus("静态预览模式：当前使用页面内嵌配置。需要直接保存到项目文件时，请用 serve --project-api 打开。");
        applyToForm();
        return;
      }
      try {
        const response = await fetch("/__bgy/project-config", { cache: "no-store" });
        if (response.ok) {
          config = normalizeConfig(await response.json());
          apiAvailable = true;
          setStatus("已连接本地配置服务，可以直接保存到 bgy.project.json。");
          applyToForm();
          return;
        }
      } catch (_) {
        apiAvailable = false;
      }
      try {
        const response = await fetch("bgy.project.json", { cache: "no-store" });
        if (response.ok) config = normalizeConfig(await response.json());
        setStatus("静态预览模式：可以编辑和下载 JSON；如需直接写回文件，请用 serve --project-api 打开。");
      } catch (_) {
        setStatus("使用页面内置初始配置。");
      }
      applyToForm();
    }

    async function saveConfig() {
      readForm();
      if (!apiAvailable) {
        downloadJson();
        setStatus("当前不是配置服务模式，已下载 bgy.project.json。需要手动替换项目根目录文件，或用 serve --project-api 重新打开。");
        return;
      }
      const response = await fetch("/__bgy/project-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });
      if (!response.ok) throw new Error(await response.text());
      const result = await response.json();
      setStatus("已保存配置并同步共享样式：\\n" + result.files.join("\\n"));
    }

    function downloadJson() {
      readForm();
      const blob = new Blob([JSON.stringify(config, null, 2) + "\\n"], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "bgy.project.json";
      link.click();
      URL.revokeObjectURL(url);
    }

    function applyPreset() {
      const presetId = document.getElementById("projectPreset").value;
      const preset = presets[presetId] || presets["management-report"];
      const currentProject = clone(config.project || {});
      const currentLocked = Boolean(config.locked);
      config = merge(config, preset);
      config.project = { ...currentProject, type: preset.projectType || presetId, preset: presetId, themeMode: "preset" };
      config.locked = currentLocked;
      applyToForm();
      setStatus("已应用 preset，保存后会同步 bgy.project.json 和 shared 样式。");
    }

    document.querySelectorAll("input, select").forEach(el => {
      el.addEventListener("input", () => { readForm(); });
      el.addEventListener("change", () => { readForm(); });
    });
    document.querySelectorAll("[data-mode-toggle]").forEach(button => {
      button.addEventListener("click", () => {
        readForm();
        setThemeMode(button.dataset.modeToggle);
        setStatus(button.dataset.modeToggle === "custom"
          ? "已切换到自定义主题，可以调整颜色、圆角、阴影和图标包。"
          : "已切换到预设主题，建议通过上方主题卡片统一切换。");
      });
    });
    document.querySelectorAll("[data-preset]").forEach(button => {
      button.addEventListener("click", () => {
        document.getElementById("projectPreset").value = button.dataset.preset;
        applyPreset();
      });
    });
    document.querySelectorAll("[data-theme-mode-card='custom']").forEach(button => {
      button.addEventListener("click", () => {
        readForm();
        setThemeMode("custom");
        setStatus("已切换到自定义主题，可以在下方调整项目色板和组件细节。");
      });
    });
    document.getElementById("projectPreset").addEventListener("change", applyPreset);
    document.getElementById("applyPreset").addEventListener("click", applyPreset);
    document.getElementById("saveTop").addEventListener("click", () => saveConfig().catch(err => setStatus("保存失败：" + err.message)));
    document.getElementById("downloadTop").addEventListener("click", downloadJson);
    document.getElementById("save").addEventListener("click", () => saveConfig().catch(err => setStatus("保存失败：" + err.message)));
    document.getElementById("download").addEventListener("click", downloadJson);
    document.getElementById("openBoard").addEventListener("click", () => window.open("project-style-board.html", "_blank"));
    loadConfig();
  </script>
</body>
</html>
`;
}

export function buildProjectStyleBoardHtml(config) {
  const normalized = normalizeProjectConfig(config);
  const componentNav = COMPONENT_GROUPS.map(group => `<a href="#${escapeHtml(group.id)}">${escapeHtml(group.title)}</a>`).join("");
  const componentSections = renderComponentSections(normalized);
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(normalized.project.title)} - 项目风格看板</title>
  <link rel="stylesheet" href="shared/tokens.css">
  <link rel="stylesheet" href="shared/components.css">
  <style>
    body {
      width: auto;
      min-height: 100vh;
      height: auto;
      overflow: auto;
      background: #eef3f6;
      padding: 28px;
    }
    .board {
      width: 1120px;
      margin: 0 auto;
      background: var(--bgy-page-bg);
      border: 1px solid var(--bgy-line);
      box-shadow: 0 8px 24px rgba(15,23,42,0.12);
      padding: 34px;
    }
    .board-head {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      border-bottom: 1px solid var(--bgy-line);
      padding-bottom: 22px;
      margin-bottom: 24px;
    }
    h1 {
      margin: 0 0 10px;
      color: var(--bgy-deep-brand);
      font-size: 30px;
    }
    h2 {
      margin: 30px 0 14px;
      color: var(--bgy-text);
      font-size: 18px;
    }
    p {
      margin: 0;
      color: var(--bgy-muted);
      line-height: 1.6;
      font-size: 14px;
    }
    .meta {
      color: var(--bgy-muted);
      font-size: 13px;
      text-align: right;
      line-height: 1.7;
    }
    .palette {
      display: grid;
      grid-template-columns: repeat(8, minmax(0, 1fr));
      gap: 10px;
    }
    .swatch {
      border: 1px solid var(--bgy-line);
      border-radius: var(--bgy-panel-radius);
      overflow: hidden;
      background: var(--bgy-surface);
    }
    .swatch-color {
      height: 54px;
    }
    .swatch-label {
      padding: 8px;
      font-size: 12px;
      color: var(--bgy-muted);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 18px;
    }
    .chart-bars {
      display: flex;
      align-items: end;
      gap: 12px;
      height: 130px;
      padding: 18px;
      border: 1px solid var(--bgy-line);
      border-radius: var(--bgy-panel-radius);
      background: var(--bgy-surface);
    }
    .bar {
      flex: 1;
      border-radius: 4px 4px 0 0;
    }
    .component-nav {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin: 28px 0 12px;
      padding: 14px 0;
      border-top: 1px solid var(--bgy-line);
      border-bottom: 1px solid var(--bgy-line);
    }
    .component-nav a {
      display: inline-flex;
      align-items: center;
      min-height: 30px;
      padding: 6px 11px;
      border: 1px solid var(--bgy-line);
      border-radius: var(--bgy-tag-radius);
      color: var(--bgy-deep-brand);
      background: var(--bgy-surface);
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
    }
    .component-section {
      margin-top: 34px;
    }
    .component-section__head {
      margin-bottom: 14px;
    }
    .component-section__head h2 {
      margin: 0 0 6px;
    }
    .component-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px;
    }
    .component-card {
      min-height: 260px;
      border: 1px solid var(--bgy-line);
      border-radius: var(--bgy-card-radius);
      background: var(--bgy-surface);
      box-shadow: var(--bgy-panel-shadow);
      overflow: hidden;
    }
    .component-card__head {
      min-height: 96px;
      padding: 16px 16px 12px;
      border-bottom: 1px solid var(--bgy-line);
    }
    .component-card__head h3 {
      margin: 0 0 7px;
      color: var(--bgy-deep-brand);
      font-size: 17px;
    }
    .component-card__preview {
      min-height: 160px;
      padding: 16px;
      background: var(--bgy-panel);
    }
    .component-card__preview .bgy-table {
      font-size: 12px;
    }
    .component-card__preview .bgy-table th,
    .component-card__preview .bgy-table td {
      padding: 6px 7px;
    }
    .component-card__preview .bgy-card,
    .component-card__preview .bgy-kpi-card,
    .component-card__preview .bgy-data-card,
    .component-card__preview .bgy-highlight-card,
    .component-card__preview .bgy-risk-card,
    .component-card__preview .bgy-conclusion-card,
    .component-card__preview .bgy-progress-panel,
    .component-card__preview .bgy-image-card,
    .component-card__preview .bgy-case-card {
      padding: 12px;
    }
    .component-card__preview .bgy-card__title,
    .component-card__preview .bgy-data-card strong,
    .component-card__preview .bgy-highlight-card strong,
    .component-card__preview .bgy-risk-card strong,
    .component-card__preview .bgy-conclusion-card strong,
    .component-card__preview .bgy-case-card strong {
      font-size: 15px;
    }
    .component-card__preview .bgy-kpi-card__value,
    .component-card__preview .bgy-metric-value {
      font-size: 24px;
    }
    .component-card__preview .bgy-kpi-card--hero .bgy-kpi-card__value {
      font-size: 34px;
    }
    .component-card__preview .bgy-status-tag {
      font-size: 12px;
      padding: 4px 7px;
    }
    .component-card__preview .bgy-chart-frame {
      min-height: 118px;
      padding: 10px;
    }
    .demo-panel {
      padding: 14px;
    }
    .demo-panel__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 10px;
      color: var(--bgy-deep-brand);
    }
    .demo-stack {
      display: grid;
      gap: 10px;
    }
    .demo-stack__item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 11px 12px;
      border: 1px solid var(--bgy-line);
      border-radius: var(--bgy-panel-radius);
      background: var(--bgy-surface);
      color: var(--bgy-text);
      font-size: 13px;
    }
    .demo-stack__item span {
      color: var(--bgy-muted);
    }
    .demo-divider {
      display: grid;
      gap: 14px;
      padding: 12px;
      border: 1px solid var(--bgy-line);
      border-radius: var(--bgy-panel-radius);
      background: var(--bgy-surface);
    }
    .demo-metrics {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }
    .demo-tags,
    .demo-icons {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;
    }
    .demo-chart {
      display: flex;
      align-items: end;
      gap: 10px;
      height: 128px;
      padding: 14px;
      border: 1px solid var(--bgy-line);
      border-radius: var(--bgy-panel-radius);
      background: var(--bgy-surface);
    }
    .demo-chart span {
      flex: 1;
      min-width: 0;
      border-radius: 4px 4px 0 0;
    }
    .demo-image-frame {
      height: 128px;
    }
    .demo-image-placeholder,
    .demo-mini-image {
      display: grid;
      place-items: center;
      width: 100%;
      height: 100%;
      color: var(--bgy-muted);
      background: repeating-linear-gradient(135deg, #f8fafc 0, #f8fafc 8px, #eef3f6 8px, #eef3f6 16px);
      font-size: 13px;
      font-weight: 600;
    }
    .bgy-icon-chip svg {
      width: 18px;
      height: 18px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .demo-hero {
      display: flex;
      gap: 16px;
      padding: 18px;
      border-left: 5px solid var(--bgy-brand);
      border-radius: var(--bgy-panel-radius);
      background: var(--bgy-surface);
    }
    .demo-hero > span {
      color: var(--bgy-brand);
      font-size: 30px;
      font-weight: 700;
    }
    .demo-hero h3 {
      margin: 0 0 8px;
      color: var(--bgy-deep-brand);
      font-size: 20px;
    }
    .demo-two-col,
    .demo-comparison {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }
    .demo-two-col > div,
    .demo-comparison > div {
      min-height: 118px;
      padding: 13px;
      border: 1px solid var(--bgy-line);
      border-radius: var(--bgy-panel-radius);
      background: var(--bgy-surface);
    }
    .demo-timeline {
      display: grid;
      gap: 12px;
    }
    .demo-timeline > div {
      position: relative;
      padding-left: 28px;
    }
    .demo-timeline span {
      position: absolute;
      left: 0;
      top: 4px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--bgy-brand);
      box-shadow: 0 0 0 4px var(--bgy-info-bg);
    }
    @media (max-width: 980px) {
      .board { width: 100%; }
      .component-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <main class="board">
    <section class="board-head">
      <div>
        <h1>${escapeHtml(normalized.project.title || "BGY PPT 项目")}</h1>
        <p>项目级设计契约已${normalized.locked ? "锁定" : "未锁定"}，preset：${escapeHtml(normalized.project.preset)}。</p>
      </div>
      <div class="meta">
        <div>项目类型：${escapeHtml(normalized.project.type)}</div>
        <div>图标包：${escapeHtml(normalized.components.iconPack)}</div>
        <div>PPTX 可编辑优先级：${escapeHtml(normalized.rules.pptxEditablePriority)}</div>
      </div>
    </section>

    <h2>主题色</h2>
    <section class="palette">
      ${[
        ["主色", normalized.theme.brand],
        ["深主色", normalized.theme.deepBrand],
        ["成功", normalized.theme.success],
        ["警示", normalized.theme.warning],
        ["风险", normalized.theme.danger],
        ["信息", normalized.theme.info],
        ["正文", normalized.theme.text],
        ["线条", normalized.theme.line],
      ].map(([label, color]) => `<div class="swatch"><div class="swatch-color" style="background:${color}"></div><div class="swatch-label">${label}<br>${color}</div></div>`).join("")}
    </section>

    <h2>组件库</h2>
    <p>以下按组件类型展示当前主题下的可复用样式，生成 PPT 页面时优先复用这些结构和 class。</p>
    <nav class="component-nav">${componentNav}</nav>
    ${componentSections}
  </main>
</body>
</html>
`;
}

export function buildStarterSlideHtml(config) {
  const normalized = normalizeProjectConfig(config);
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>01 风格看板</title>
  <link rel="stylesheet" href="../shared/tokens.css">
  <link rel="stylesheet" href="../shared/components.css">
  <style>
    .brand-logo {
      position: absolute;
      left: 1059px;
      top: 24px;
      width: 190px;
      height: 46px;
      object-fit: fill;
    }
    .brand-watermark {
      position: absolute;
      left: 889px;
      top: 341px;
      width: 391px;
      height: 379px;
      object-fit: fill;
      pointer-events: none;
    }
    .title-bar {
      position: absolute;
      left: 80px;
      top: 70px;
      display: flex;
      align-items: baseline;
      gap: 44px;
      color: var(--bgy-brand);
      font-weight: 600;
    }
    .slide-number {
      font-size: 49px;
    }
    .slide-title {
      font-size: 34px;
    }
    .body {
      position: absolute;
      left: 80px;
      top: 150px;
      width: 1050px;
      height: 460px;
    }
    .metrics {
      position: absolute;
      left: 0;
      top: 0;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 22px;
      width: 760px;
    }
    .status-row {
      position: absolute;
      left: 0;
      top: 150px;
      display: flex;
      gap: 10px;
    }
    .records-panel {
      position: absolute;
      left: 0;
      top: 205px;
      width: 760px;
      height: 210px;
    }
    .note {
      position: absolute;
      right: 0;
      top: 0;
      width: 245px;
      height: 415px;
    }
  </style>
</head>
<body>
  <section class="slide" data-slide data-bgy-slide data-slide-id="slide-01">
    <img class="brand-watermark" src="../shared/模版底图/image5.png" alt="" data-ppt-no-edit>
    <img class="brand-logo" src="../shared/模版底图/image1.png" alt="碧桂园服务" data-ppt-no-edit>
    <div class="title-bar"><span class="slide-number">01</span><span class="slide-title">项目风格已统一锁定</span></div>
    <main class="body">
      <div class="metrics">
        <div class="bgy-metric-card"><p class="bgy-metric-value">96.4%</p><p class="bgy-metric-label">重点任务完成率</p></div>
        <div class="bgy-metric-card"><p class="bgy-metric-value">12项</p><p class="bgy-metric-label">本月闭环事项</p></div>
        <div class="bgy-metric-card"><p class="bgy-metric-value">0起</p><p class="bgy-metric-label">重大风险事件</p></div>
      </div>
      <div class="status-row">
        <span class="bgy-status-tag is-success">已完成</span>
        <span class="bgy-status-tag is-warning">推进中</span>
        <span class="bgy-status-tag is-danger">需协调</span>
        <span class="bgy-status-tag is-info">待确认</span>
      </div>
      <div class="records-panel bgy-panel">
        <table class="bgy-table">
          <thead><tr><th>事项</th><th>状态</th><th>责任部门</th><th>完成时间</th></tr></thead>
          <tbody>
            <tr><td>消防维保巡检</td><td>已完成</td><td>工程部</td><td>7月20日</td></tr>
            <tr><td>客户诉求闭环</td><td>推进中</td><td>客服部</td><td>7月31日</td></tr>
            <tr><td>品质问题复查</td><td>需协调</td><td>品质部</td><td>8月05日</td></tr>
          </tbody>
        </table>
      </div>
      <aside class="note bgy-card">
        <div class="bgy-card__body">
          <h3 class="bgy-card__title">${escapeHtml(normalized.project.title || "BGY 项目")}</h3>
          <p class="bgy-callout__text">此页用于验证同一项目内颜色、文字、组件、表格和状态标签是否继承同一套 bgy.project.json。</p>
        </div>
      </aside>
    </main>
  </section>
</body>
</html>
`;
}

export function writeProjectFiles(projectRoot, config, {
  copyPresets = true,
  copyTemplate = true,
  writeIndex = true,
  writeDeck = true,
  writeStarterSlide = true,
} = {}) {
  const root = path.resolve(projectRoot);
  const normalized = normalizeProjectConfig(config || buildDefaultProjectConfig({
    title: path.basename(root),
    projectName: path.basename(root),
  }));
  const written = [];

  ensureDir(root);
  ensureDir(path.join(root, "shared"));
  ensureDir(path.join(root, "slides"));
  ensureDir(path.join(root, "output"));

  const configPath = path.join(root, "bgy.project.json");
  writeJsonFile(configPath, normalized);
  written.push(configPath);

  const tokensPath = path.join(root, "shared", "tokens.css");
  writeTextFile(tokensPath, buildTokensCss(normalized));
  written.push(tokensPath);

  const componentsPath = path.join(root, "shared", "components.css");
  writeTextFile(componentsPath, buildComponentsCss(normalized));
  written.push(componentsPath);

  const configHtmlPath = path.join(root, "project-config.html");
  writeTextFile(configHtmlPath, buildProjectConfigHtml(normalized));
  written.push(configHtmlPath);

  const boardPath = path.join(root, "project-style-board.html");
  writeTextFile(boardPath, buildProjectStyleBoardHtml(normalized));
  written.push(boardPath);

  if (copyPresets) {
    const presets = loadBuiltinPresets();
    for (const name of Object.keys(presets)) {
      const source = projectPresetPath(name);
      const target = path.join(root, "presets", `${name}.json`);
      if (fs.existsSync(source)) {
        copyFile(source, target);
      } else {
        writeJsonFile(target, presets[name]);
      }
      written.push(target);
    }
  }

  if (copyTemplate) {
    const outDir = path.join(root, "shared", "模版底图");
    ensureDir(outDir);
    for (const name of ["image1.png", "image5.png"]) {
      const source = path.join(TEMPLATE_DIR, name);
      const target = path.join(outDir, name);
      if (fs.existsSync(source)) {
        copyFile(source, target);
        written.push(target);
      }
    }
  }

  if (writeIndex) {
    const indexPath = path.join(root, "index.html");
    if (!fs.existsSync(indexPath)) {
      copyFile(path.join(ASSETS_DIR, "deck_index.html"), indexPath);
      written.push(indexPath);
    }
  }

  if (writeDeck) {
    const deckPath = path.join(root, "deck.json");
    if (!fs.existsSync(deckPath)) {
      writeJsonFile(deckPath, buildDeckJson(normalized));
      written.push(deckPath);
    }
  }

  if (writeStarterSlide) {
    const slidePath = path.join(root, "slides", "01-style-board.html");
    if (!fs.existsSync(slidePath)) {
      writeTextFile(slidePath, buildStarterSlideHtml(normalized));
      written.push(slidePath);
    }
  }

  return { config: normalized, files: written };
}
