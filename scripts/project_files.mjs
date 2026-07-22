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
<body>
  <div class="app">
    <aside>
      <h1>项目配置</h1>
      <p>一旦锁定，后续每页 HTML 都应读取同一份 bgy.project.json。</p>

      <h2>基础信息</h2>
      <label>项目标题 <input id="projectTitle" type="text"></label>
      <label>项目名称 <input id="projectName" type="text"></label>
      <label>项目类型 <input id="projectType" type="text"></label>
      <label>Preset
        <select id="projectPreset">${defaultPresetOptions}</select>
      </label>
      <div class="inline"><input id="locked" type="checkbox"><span>锁定项目主题</span></div>

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
        <label>线条 <input id="line" type="color"></label>
      </div>

      <h2>组件</h2>
      <div class="row">
        <label>卡片圆角 <input id="cardRadius" type="number" min="0" max="24"></label>
        <label>标签圆角 <input id="tagRadius" type="number" min="0" max="24"></label>
        <label>图片圆角 <input id="imageRadius" type="number" min="0" max="24"></label>
        <label>边线宽度 <input id="borderWidth" type="number" min="0" max="4" step="0.5"></label>
      </div>
      <label>卡片阴影 <input id="cardShadow" type="text"></label>
      <label>图标包
        <select id="iconPack">
          <option value="line">line</option>
          <option value="solid">solid</option>
          <option value="bgy-business">bgy-business</option>
        </select>
      </label>

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
      "danger", "dangerBg", "info", "infoBg", "text", "muted", "panel", "line"
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

    function applyToForm() {
      document.getElementById("projectTitle").value = config.project.title || "";
      document.getElementById("projectName").value = config.project.name || "";
      document.getElementById("projectType").value = config.project.type || "";
      document.getElementById("projectPreset").value = config.project.preset || "management-report";
      document.getElementById("locked").checked = Boolean(config.locked);
      for (const key of fieldIds) document.getElementById(key).value = normalizeHex(config.theme[key], "#000000");
      document.getElementById("cardRadius").value = config.components.cardRadius ?? 8;
      document.getElementById("tagRadius").value = config.components.tagRadius ?? 4;
      document.getElementById("imageRadius").value = config.components.imageRadius ?? 6;
      document.getElementById("borderWidth").value = config.components.borderWidth ?? 1;
      document.getElementById("cardShadow").value = config.components.cardShadow || "";
      document.getElementById("iconPack").value = config.components.iconPack || "line";
      renderPreview();
    }

    function readForm() {
      config.project.title = document.getElementById("projectTitle").value.trim();
      config.project.name = document.getElementById("projectName").value.trim();
      config.project.type = document.getElementById("projectType").value.trim();
      config.project.preset = document.getElementById("projectPreset").value;
      config.locked = document.getElementById("locked").checked;
      for (const key of fieldIds) config.theme[key] = document.getElementById(key).value.toUpperCase();
      config.components.cardRadius = Number(document.getElementById("cardRadius").value || 8);
      config.components.tagRadius = Number(document.getElementById("tagRadius").value || 4);
      config.components.imageRadius = Number(document.getElementById("imageRadius").value || 6);
      config.components.borderWidth = Number(document.getElementById("borderWidth").value || 1);
      config.components.cardShadow = document.getElementById("cardShadow").value.trim();
      config.components.iconPack = document.getElementById("iconPack").value;
      renderPreview();
      return config;
    }

    function renderPreview() {
      const slide = document.getElementById("previewSlide");
      const theme = config.theme || {};
      const components = config.components || {};
      slide.style.setProperty("--cfg-brand", theme.brand);
      slide.style.setProperty("--cfg-deep", theme.deepBrand);
      slide.style.setProperty("--cfg-success", theme.success);
      slide.style.setProperty("--cfg-success-bg", theme.successBg);
      slide.style.setProperty("--cfg-warning", theme.warning);
      slide.style.setProperty("--cfg-warning-bg", theme.warningBg);
      slide.style.setProperty("--cfg-danger", theme.danger);
      slide.style.setProperty("--cfg-danger-bg", theme.dangerBg);
      slide.style.setProperty("--cfg-info", theme.info);
      slide.style.setProperty("--cfg-info-bg", theme.infoBg);
      slide.style.setProperty("--cfg-text", theme.text);
      slide.style.setProperty("--cfg-muted", theme.muted);
      slide.style.setProperty("--cfg-panel", theme.panel);
      slide.style.setProperty("--cfg-surface", theme.surface || "#FFFFFF");
      slide.style.setProperty("--cfg-line", theme.line);
      slide.style.setProperty("--cfg-page-bg", theme.pageBg || "#FFFFFF");
      slide.style.setProperty("--cfg-card-radius", (components.cardRadius ?? 8) + "px");
      slide.style.setProperty("--cfg-tag-radius", (components.tagRadius ?? 4) + "px");
      slide.style.setProperty("--cfg-card-shadow", components.cardShadow || "0 4px 14px rgba(0,0,0,0.08)");
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
      try {
        const response = await fetch("/__bgy/project-config", { cache: "no-store" });
        if (response.ok) {
          config = await response.json();
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
        if (response.ok) config = await response.json();
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
      config.project = { ...currentProject, type: preset.projectType || presetId, preset: presetId };
      config.locked = currentLocked;
      applyToForm();
      setStatus("已应用 preset，保存后会同步 bgy.project.json 和 shared 样式。");
    }

    document.querySelectorAll("input, select").forEach(el => {
      el.addEventListener("input", () => { readForm(); });
      el.addEventListener("change", () => { readForm(); });
    });
    document.getElementById("applyPreset").addEventListener("click", applyPreset);
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
  const chart = normalized.theme.chart;
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

    <h2>组件</h2>
    <section class="grid">
      <div class="bgy-metric-card">
        <p class="bgy-metric-value">96.4%</p>
        <p class="bgy-metric-label">重点任务完成率</p>
      </div>
      <div class="bgy-metric-card">
        <p class="bgy-metric-value">12项</p>
        <p class="bgy-metric-label">本月闭环事项</p>
      </div>
      <div class="bgy-metric-card">
        <p class="bgy-metric-value">0起</p>
        <p class="bgy-metric-label">重大风险事件</p>
      </div>
    </section>

    <h2>状态标签</h2>
    <p>
      <span class="bgy-status-tag is-success">已完成</span>
      <span class="bgy-status-tag is-warning">推进中</span>
      <span class="bgy-status-tag is-danger">需协调</span>
      <span class="bgy-status-tag is-info">待确认</span>
    </p>

    <h2>表格</h2>
    <table class="bgy-table">
      <thead><tr><th>事项</th><th>状态</th><th>责任部门</th><th>完成时间</th></tr></thead>
      <tbody>
        <tr><td>消防维保巡检</td><td>已完成</td><td>工程部</td><td>7月20日</td></tr>
        <tr><td>客户诉求闭环</td><td>推进中</td><td>客服部</td><td>7月31日</td></tr>
        <tr><td>品质问题复查</td><td>需协调</td><td>品质部</td><td>8月05日</td></tr>
      </tbody>
    </table>

    <h2>图表配色</h2>
    <div class="chart-bars">
      ${chart.map((color, index) => `<div class="bar" style="height:${45 + index * 16}px;background:${color}"></div>`).join("")}
    </div>
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
