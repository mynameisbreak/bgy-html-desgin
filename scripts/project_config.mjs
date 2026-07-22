import fs from "fs";
import path from "path";
import { absolutePath, scriptDir } from "./runtime.mjs";

const ROOT_DIR = path.resolve(scriptDir, "..");
const ASSETS_DIR = path.join(ROOT_DIR, "assets");
const PRESETS_DIR = path.join(ASSETS_DIR, "project-presets");

export const DEFAULT_FONT_FAMILY = '"Microsoft YaHei", "微软雅黑", Arial, sans-serif';

export const PRESET_ALIASES = {
  管理汇报: "management-report",
  月报: "monthly-review",
  季报: "monthly-review",
  项目提案: "proposal",
  维保巡检: "maintenance",
  品质提升: "quality-improvement",
  消防维保: "fire-safety",
};

const BASE_THEME = {
  brand: "#006D9A",
  deepBrand: "#004B6B",
  success: "#2E7D32",
  successBg: "#EAF5EB",
  warning: "#C97400",
  warningBg: "#FFF3E3",
  danger: "#C00000",
  dangerBg: "#FDECEC",
  info: "#2B6CB0",
  infoBg: "#EAF3FB",
  text: "#1F2933",
  muted: "#64748B",
  panel: "#F5F8FA",
  surface: "#FFFFFF",
  pageBg: "#FFFFFF",
  line: "#D8E3EA",
  white: "#FFFFFF",
  black: "#000000",
  chart: ["#006D9A", "#2E7D32", "#C00000", "#C97400", "#64748B"],
};

const BASE_COMPONENTS = {
  cardRadius: 8,
  panelRadius: 8,
  tagRadius: 4,
  metricRadius: 8,
  imageRadius: 6,
  borderWidth: 1,
  cardShadow: "0 4px 14px rgba(0,0,0,0.08)",
  panelShadow: "0 2px 8px rgba(0,0,0,0.05)",
  tableHeaderBg: "#F5F8FA",
  tableRowAlt: "#FAFCFD",
  tableBorder: "#D8E3EA",
  titleBarHeight: 72,
  sectionGap: 24,
  iconPack: "line",
  tableDensity: "compact",
};

const BASE_RULES = {
  fontFamily: DEFAULT_FONT_FAMILY,
  allowedFonts: [DEFAULT_FONT_FAMILY, "Arial", "sans-serif"],
  allowRemoteIcons: false,
  allowDirectHexOutsideTokens: false,
  preferInlineSvgIcons: true,
  pptxEditablePriority: "high",
  strictTheme: true,
};

const FALLBACK_PRESETS = {
  "management-report": {
    id: "management-report",
    label: "管理汇报",
    description: "稳重、克制、适合经营管理与复盘汇报。",
    projectType: "management-report",
    theme: {
      ...BASE_THEME,
      chart: ["#006D9A", "#2E7D32", "#C00000", "#C97400", "#64748B"],
    },
    components: {
      ...BASE_COMPONENTS,
      iconPack: "line",
      tableDensity: "compact",
    },
    rules: {
      ...BASE_RULES,
    },
  },
  "monthly-review": {
    id: "monthly-review",
    label: "月报季报",
    description: "指标先行，适合复盘、趋势和结果汇报。",
    projectType: "monthly-review",
    theme: {
      ...BASE_THEME,
      brand: "#0F766E",
      deepBrand: "#134E4A",
      success: "#15803D",
      successBg: "#EAF7EF",
      warning: "#B7791F",
      warningBg: "#FFF7E6",
      danger: "#B91C1C",
      dangerBg: "#FEF2F2",
      info: "#2563EB",
      infoBg: "#EFF6FF",
      text: "#1E293B",
      panel: "#F0FDFA",
      line: "#CCE7E2",
      chart: ["#0F766E", "#2563EB", "#15803D", "#B7791F", "#64748B"],
    },
    components: {
      ...BASE_COMPONENTS,
      iconPack: "line",
      tableDensity: "compact",
    },
    rules: {
      ...BASE_RULES,
    },
  },
  proposal: {
    id: "proposal",
    label: "项目提案",
    description: "更开放的版式，但仍保留品牌克制感。",
    projectType: "proposal",
    theme: {
      ...BASE_THEME,
      brand: "#2563EB",
      deepBrand: "#1E3A8A",
      success: "#059669",
      warning: "#D97706",
      danger: "#DC2626",
      info: "#7C3AED",
      infoBg: "#F3E8FF",
      panel: "#F8FAFF",
      line: "#D8E2F3",
      chart: ["#2563EB", "#7C3AED", "#059669", "#D97706", "#64748B"],
    },
    components: {
      ...BASE_COMPONENTS,
      cardRadius: 10,
      panelRadius: 10,
      imageRadius: 8,
      cardShadow: "0 5px 16px rgba(0,0,0,0.08)",
      panelShadow: "0 3px 10px rgba(0,0,0,0.05)",
      iconPack: "bgy-business",
      tableDensity: "comfortable",
    },
    rules: {
      ...BASE_RULES,
    },
  },
  maintenance: {
    id: "maintenance",
    label: "维保巡检",
    description: "表格、台账和状态分层更强，适合工程巡检类页面。",
    projectType: "maintenance",
    theme: {
      ...BASE_THEME,
      brand: "#0E7490",
      deepBrand: "#164E63",
      warning: "#B45309",
      danger: "#B91C1C",
      info: "#475569",
      infoBg: "#F1F5F9",
      panel: "#F1F5F9",
      line: "#CBD5E1",
      chart: ["#0E7490", "#475569", "#2E7D32", "#B45309", "#B91C1C"],
    },
    components: {
      ...BASE_COMPONENTS,
      cardRadius: 6,
      panelRadius: 6,
      metricRadius: 6,
      imageRadius: 4,
      cardShadow: "0 3px 10px rgba(0,0,0,0.07)",
      iconPack: "bgy-business",
      tableDensity: "dense",
    },
    rules: {
      ...BASE_RULES,
    },
  },
  "quality-improvement": {
    id: "quality-improvement",
    label: "品质提升",
    description: "突出改善成效、前后对比与闭环动作。",
    projectType: "quality-improvement",
    theme: {
      ...BASE_THEME,
      brand: "#15803D",
      deepBrand: "#14532D",
      success: "#16A34A",
      warning: "#CA8A04",
      danger: "#B91C1C",
      info: "#0E7490",
      panel: "#F2FBF4",
      line: "#CFE8D5",
      chart: ["#15803D", "#16A34A", "#0E7490", "#CA8A04", "#64748B"],
    },
    components: {
      ...BASE_COMPONENTS,
      cardRadius: 8,
      imageRadius: 6,
      iconPack: "solid",
      tableDensity: "compact",
    },
    rules: {
      ...BASE_RULES,
    },
  },
  "fire-safety": {
    id: "fire-safety",
    label: "消防维保",
    description: "风险、整改、闭环和状态标签更醒目。",
    projectType: "fire-safety",
    theme: {
      ...BASE_THEME,
      brand: "#B91C1C",
      deepBrand: "#7F1D1D",
      success: "#15803D",
      warning: "#C2410C",
      danger: "#991B1B",
      info: "#475569",
      infoBg: "#F1F5F9",
      panel: "#FFF7F7",
      line: "#F1D4D4",
      chart: ["#B91C1C", "#C2410C", "#991B1B", "#475569", "#64748B"],
    },
    components: {
      ...BASE_COMPONENTS,
      cardRadius: 6,
      panelRadius: 6,
      imageRadius: 4,
      cardShadow: "0 3px 10px rgba(0,0,0,0.07)",
      iconPack: "solid",
      tableDensity: "compact",
    },
    rules: {
      ...BASE_RULES,
    },
  },
};

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function deepMerge(base, patch) {
  if (Array.isArray(base) && Array.isArray(patch)) return clone(patch);
  if (!isPlainObject(base) || !isPlainObject(patch)) {
    return patch === undefined ? clone(base) : clone(patch);
  }
  const result = clone(base);
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      result[key] = clone(value);
    } else if (isPlainObject(value) && isPlainObject(result[key])) {
      result[key] = deepMerge(result[key], value);
    } else {
      result[key] = clone(value);
    }
  }
  return result;
}

function normalizePresetName(value) {
  const raw = String(value || "").trim();
  if (!raw) return "management-report";
  return PRESET_ALIASES[raw] || raw.toLowerCase();
}

function normalizeHex(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const match = /^#([0-9a-f]{3,8})$/i.exec(raw);
  if (!match) return raw;
  let hex = match[1].toLowerCase();
  if (hex.length === 3 || hex.length === 4) {
    hex = hex.split("").map(ch => ch + ch).join("");
  }
  return `#${hex}`;
}

function normalizeColorList(values, fallback) {
  const list = Array.isArray(values) ? values : [];
  const normalized = list.map(normalizeHex).filter(Boolean);
  if (normalized.length > 0) return normalized;
  return fallback.map(normalizeHex);
}

function normalizeFontFamily(value) {
  const raw = String(value || "").trim();
  return raw || DEFAULT_FONT_FAMILY;
}

function normalizeAllowedFonts(values) {
  const list = Array.isArray(values) ? values : [];
  const normalized = list.map(item => String(item || "").trim()).filter(Boolean);
  if (!normalized.some(item => item === DEFAULT_FONT_FAMILY)) {
    normalized.unshift(DEFAULT_FONT_FAMILY);
  }
  return Array.from(new Set(normalized));
}

function normalizeNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  const raw = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(raw)) return true;
  if (["0", "false", "no", "off"].includes(raw)) return false;
  return fallback;
}

function slugifyName(value, fallback = "project") {
  const raw = String(value || "").trim().toLowerCase();
  const ascii = raw
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return ascii || fallback;
}

function createBaseConfig() {
  return {
    version: 1,
    locked: false,
    project: {
      title: "",
      name: "",
      type: "management-report",
      preset: "management-report",
      themeMode: "preset",
      ratio: "16:9",
      editablePptx: true,
    },
    theme: clone(BASE_THEME),
    components: clone(BASE_COMPONENTS),
    rules: clone(BASE_RULES),
  };
}

export function loadBuiltinPresets() {
  const result = {};
  if (fs.existsSync(PRESETS_DIR)) {
    for (const entry of fs.readdirSync(PRESETS_DIR, { withFileTypes: true })) {
      if (!entry.isFile() || !/\.json$/i.test(entry.name)) continue;
      const name = entry.name.replace(/\.json$/i, "");
      const file = path.join(PRESETS_DIR, entry.name);
      try {
        const raw = JSON.parse(fs.readFileSync(file, "utf8"));
        result[name] = raw;
      } catch (err) {
        throw new Error(`Failed to read preset ${file}: ${err.message}`);
      }
    }
  }

  if (Object.keys(result).length === 0) {
    for (const [name, preset] of Object.entries(FALLBACK_PRESETS)) {
      result[name] = clone(preset);
    }
  }
  return result;
}

export function getBuiltinPreset(name = "management-report") {
  const presets = loadBuiltinPresets();
  const normalized = normalizePresetName(name);
  return presets[normalized] || presets["management-report"] || clone(FALLBACK_PRESETS["management-report"]);
}

export function buildDefaultProjectConfig({
  title = "",
  projectName = "",
  preset = "management-report",
  type = "",
  locked = false,
  editablePptx = true,
} = {}) {
  const presetName = normalizePresetName(preset || type);
  const presetConfig = getBuiltinPreset(presetName);
  const config = deepMerge(createBaseConfig(), presetConfig);
  config.project.title = String(title || config.project.title || presetConfig.label || presetName).trim();
  config.project.name = String(projectName || slugifyName(config.project.title || presetName, presetName)).trim();
  config.project.type = String(type || presetConfig.projectType || presetName).trim();
  config.project.preset = presetName;
  config.project.themeMode = "preset";
  config.project.ratio = "16:9";
  config.project.editablePptx = normalizeBoolean(editablePptx, true);
  config.locked = normalizeBoolean(locked, false);
  return normalizeProjectConfig(config);
}

export function normalizeProjectConfig(input = {}) {
  const raw = isPlainObject(input) ? input : {};
  const base = createBaseConfig();
  const presetName = normalizePresetName(raw.project?.preset || raw.project?.type || base.project.preset);
  const presetConfig = getBuiltinPreset(presetName);
  let config = deepMerge(base, presetConfig);
  config = deepMerge(config, raw);

  config.version = normalizeNumber(config.version, 1);
  config.locked = normalizeBoolean(config.locked, false);
  config.project = isPlainObject(config.project) ? config.project : {};
  config.theme = isPlainObject(config.theme) ? config.theme : {};
  config.components = isPlainObject(config.components) ? config.components : {};
  config.rules = isPlainObject(config.rules) ? config.rules : {};

  config.project.title = String(config.project.title || "").trim();
  config.project.name = String(config.project.name || "").trim() || slugifyName(config.project.title || presetName, presetName);
  config.project.type = String(config.project.type || presetName).trim() || presetName;
  config.project.preset = normalizePresetName(config.project.preset || config.project.type || presetName);
  config.project.themeMode = String(config.project.themeMode || "preset").trim().toLowerCase() === "custom"
    ? "custom"
    : "preset";
  config.project.ratio = String(config.project.ratio || "16:9").trim() || "16:9";
  config.project.editablePptx = normalizeBoolean(config.project.editablePptx, true);

  config.theme = {
    ...clone(BASE_THEME),
    ...config.theme,
  };
  config.theme.brand = normalizeHex(config.theme.brand || BASE_THEME.brand);
  config.theme.deepBrand = normalizeHex(config.theme.deepBrand || BASE_THEME.deepBrand);
  config.theme.success = normalizeHex(config.theme.success || BASE_THEME.success);
  config.theme.successBg = normalizeHex(config.theme.successBg || BASE_THEME.successBg);
  config.theme.warning = normalizeHex(config.theme.warning || BASE_THEME.warning);
  config.theme.warningBg = normalizeHex(config.theme.warningBg || BASE_THEME.warningBg);
  config.theme.danger = normalizeHex(config.theme.danger || BASE_THEME.danger);
  config.theme.dangerBg = normalizeHex(config.theme.dangerBg || BASE_THEME.dangerBg);
  config.theme.info = normalizeHex(config.theme.info || BASE_THEME.info);
  config.theme.infoBg = normalizeHex(config.theme.infoBg || BASE_THEME.infoBg);
  config.theme.text = normalizeHex(config.theme.text || BASE_THEME.text);
  config.theme.muted = normalizeHex(config.theme.muted || BASE_THEME.muted);
  config.theme.panel = normalizeHex(config.theme.panel || BASE_THEME.panel);
  config.theme.surface = normalizeHex(config.theme.surface || BASE_THEME.surface);
  config.theme.pageBg = normalizeHex(config.theme.pageBg || BASE_THEME.pageBg);
  config.theme.line = normalizeHex(config.theme.line || BASE_THEME.line);
  config.theme.white = normalizeHex(config.theme.white || BASE_THEME.white);
  config.theme.black = normalizeHex(config.theme.black || BASE_THEME.black);
  config.theme.chart = normalizeColorList(config.theme.chart, BASE_THEME.chart);

  config.components = {
    ...clone(BASE_COMPONENTS),
    ...config.components,
  };
  config.components.cardRadius = normalizeNumber(config.components.cardRadius, BASE_COMPONENTS.cardRadius);
  config.components.panelRadius = normalizeNumber(config.components.panelRadius, config.components.cardRadius);
  config.components.tagRadius = normalizeNumber(config.components.tagRadius, BASE_COMPONENTS.tagRadius);
  config.components.metricRadius = normalizeNumber(config.components.metricRadius, BASE_COMPONENTS.metricRadius);
  config.components.imageRadius = normalizeNumber(config.components.imageRadius, BASE_COMPONENTS.imageRadius);
  config.components.borderWidth = normalizeNumber(config.components.borderWidth, BASE_COMPONENTS.borderWidth);
  config.components.cardShadow = String(config.components.cardShadow || BASE_COMPONENTS.cardShadow).trim();
  config.components.panelShadow = String(config.components.panelShadow || BASE_COMPONENTS.panelShadow).trim();
  config.components.tableHeaderBg = normalizeHex(config.components.tableHeaderBg || BASE_COMPONENTS.tableHeaderBg);
  config.components.tableRowAlt = normalizeHex(config.components.tableRowAlt || BASE_COMPONENTS.tableRowAlt);
  config.components.tableBorder = normalizeHex(config.components.tableBorder || BASE_COMPONENTS.tableBorder);
  config.components.titleBarHeight = normalizeNumber(config.components.titleBarHeight, BASE_COMPONENTS.titleBarHeight);
  config.components.sectionGap = normalizeNumber(config.components.sectionGap, BASE_COMPONENTS.sectionGap);
  config.components.iconPack = String(config.components.iconPack || BASE_COMPONENTS.iconPack).trim() || BASE_COMPONENTS.iconPack;
  config.components.tableDensity = String(config.components.tableDensity || BASE_COMPONENTS.tableDensity).trim() || BASE_COMPONENTS.tableDensity;

  config.rules = {
    ...clone(BASE_RULES),
    ...config.rules,
  };
  config.rules.fontFamily = normalizeFontFamily(config.rules.fontFamily || BASE_RULES.fontFamily);
  config.rules.allowedFonts = normalizeAllowedFonts(config.rules.allowedFonts);
  config.rules.allowRemoteIcons = normalizeBoolean(config.rules.allowRemoteIcons, false);
  config.rules.allowDirectHexOutsideTokens = normalizeBoolean(config.rules.allowDirectHexOutsideTokens, false);
  config.rules.preferInlineSvgIcons = normalizeBoolean(config.rules.preferInlineSvgIcons, true);
  config.rules.strictTheme = normalizeBoolean(config.rules.strictTheme, true);
  config.rules.pptxEditablePriority = String(config.rules.pptxEditablePriority || "high").trim() || "high";

  return config;
}

export function readProjectConfig(projectRoot) {
  const root = absolutePath(projectRoot);
  const file = path.join(root, "bgy.project.json");
  if (!fs.existsSync(file)) {
    return buildDefaultProjectConfig({
      title: path.basename(root) || "BGY 项目",
      projectName: slugifyName(path.basename(root) || "project", "project"),
    });
  }
  try {
    const raw = JSON.parse(fs.readFileSync(file, "utf8"));
    return normalizeProjectConfig(raw);
  } catch (err) {
    throw new Error(`Failed to read project config ${file}: ${err.message}`);
  }
}

export function writeJsonFile(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function writeTextFile(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value, "utf8");
}

export function copyFile(source, target) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

export function collectProjectThemeTokens(config) {
  const normalized = normalizeProjectConfig(config);
  return Array.from(new Set([
    normalized.theme.brand,
    normalized.theme.deepBrand,
    normalized.theme.success,
    normalized.theme.successBg,
    normalized.theme.warning,
    normalized.theme.warningBg,
    normalized.theme.danger,
    normalized.theme.dangerBg,
    normalized.theme.info,
    normalized.theme.infoBg,
    normalized.theme.text,
    normalized.theme.muted,
    normalized.theme.panel,
    normalized.theme.surface,
    normalized.theme.pageBg,
    normalized.theme.line,
    normalized.theme.white,
    normalized.theme.black,
    normalized.components.tableHeaderBg,
    normalized.components.tableRowAlt,
    normalized.components.tableBorder,
    ...normalized.theme.chart,
  ]));
}

export function collectProjectFontFamilies(config) {
  const normalized = normalizeProjectConfig(config);
  const fonts = [];
  for (const item of normalized.rules.allowedFonts) {
    for (const part of String(item || "").split(",")) {
      const cleaned = part.trim().replace(/^['"]|['"]$/g, "");
      if (cleaned) fonts.push(cleaned);
    }
  }
  for (const part of String(normalized.rules.fontFamily || "").split(",")) {
    const cleaned = part.trim().replace(/^['"]|['"]$/g, "");
    if (cleaned) fonts.push(cleaned);
  }
  fonts.push("Arial", "sans-serif");
  return Array.from(new Set(fonts));
}

export function collectProjectRadiusValues(config) {
  const normalized = normalizeProjectConfig(config);
  return Array.from(new Set([
    normalized.components.cardRadius,
    normalized.components.panelRadius,
    normalized.components.tagRadius,
    normalized.components.metricRadius,
    normalized.components.imageRadius,
  ].filter(value => Number.isFinite(Number(value))).map(value => Number(value))));
}

export function collectProjectShadowValues(config) {
  const normalized = normalizeProjectConfig(config);
  return Array.from(new Set([
    String(normalized.components.cardShadow || "").trim(),
    String(normalized.components.panelShadow || "").trim(),
  ].filter(Boolean)));
}

export function buildTokensCss(config) {
  const normalized = normalizeProjectConfig(config);
  const chart = normalized.theme.chart;
  return `/* Auto-generated by bgy-html-design. Do not edit by hand. */\n:root {\n  --bgy-brand: ${normalized.theme.brand};\n  --bgy-deep-brand: ${normalized.theme.deepBrand};\n  --bgy-success: ${normalized.theme.success};\n  --bgy-success-bg: ${normalized.theme.successBg};\n  --bgy-warning: ${normalized.theme.warning};\n  --bgy-warning-bg: ${normalized.theme.warningBg};\n  --bgy-danger: ${normalized.theme.danger};\n  --bgy-danger-bg: ${normalized.theme.dangerBg};\n  --bgy-info: ${normalized.theme.info};\n  --bgy-info-bg: ${normalized.theme.infoBg};\n  --bgy-text: ${normalized.theme.text};\n  --bgy-muted: ${normalized.theme.muted};\n  --bgy-panel: ${normalized.theme.panel};\n  --bgy-surface: ${normalized.theme.surface};\n  --bgy-page-bg: ${normalized.theme.pageBg};\n  --bgy-line: ${normalized.theme.line};\n  --bgy-white: ${normalized.theme.white};\n  --bgy-black: ${normalized.theme.black};\n  --bgy-font-family: ${normalized.rules.fontFamily};\n  --bgy-card-radius: ${normalized.components.cardRadius}px;\n  --bgy-panel-radius: ${normalized.components.panelRadius}px;\n  --bgy-tag-radius: ${normalized.components.tagRadius}px;\n  --bgy-metric-radius: ${normalized.components.metricRadius}px;\n  --bgy-image-radius: ${normalized.components.imageRadius}px;\n  --bgy-border-width: ${normalized.components.borderWidth}px;\n  --bgy-card-shadow: ${normalized.components.cardShadow};\n  --bgy-panel-shadow: ${normalized.components.panelShadow};\n  --bgy-table-header-bg: ${normalized.components.tableHeaderBg};\n  --bgy-table-row-alt: ${normalized.components.tableRowAlt};\n  --bgy-table-border: ${normalized.components.tableBorder};\n  --bgy-title-bar-height: ${normalized.components.titleBarHeight}px;\n  --bgy-section-gap: ${normalized.components.sectionGap}px;\n  --bgy-chart-1: ${chart[0]};\n  --bgy-chart-2: ${chart[1]};\n  --bgy-chart-3: ${chart[2]};\n  --bgy-chart-4: ${chart[3]};\n  --bgy-chart-5: ${chart[4]};\n}\n\nhtml,\nbody {\n  margin: 0;\n  width: 1280px;\n  height: 720px;\n  overflow: hidden;\n  font-family: var(--bgy-font-family);\n  color: var(--bgy-text);\n  background: var(--bgy-page-bg);\n  letter-spacing: 0;\n  -webkit-font-smoothing: antialiased;\n  text-rendering: optimizeLegibility;\n}\n\n* {\n  box-sizing: border-box;\n}\n\nbody {\n  position: relative;\n}\n\n.slide,\n.ppt-slide {\n  position: relative;\n  width: 1280px;\n  height: 720px;\n  overflow: hidden;\n  background: var(--bgy-page-bg);\n}\n`;
}

export function buildComponentsCss(config) {
  const normalized = normalizeProjectConfig(config);
  const density = normalized.components.tableDensity === "dense"
    ? "13px"
    : normalized.components.tableDensity === "comfortable"
      ? "16px"
      : "15px";
  const cellPadding = normalized.components.tableDensity === "dense"
    ? "7px 9px"
    : normalized.components.tableDensity === "comfortable"
      ? "12px 14px"
      : "9px 11px";
  return `/* Auto-generated by bgy-html-design. Do not edit by hand. */
.bgy-card,
.bgy-panel,
.bgy-data-card,
.bgy-project-card,
.bgy-highlight-card,
.bgy-risk-card,
.bgy-problem-card,
.bgy-bright-card,
.bgy-conclusion-card,
.bgy-kpi-card,
.bgy-progress-panel,
.bgy-ranking-card,
.bgy-image-card,
.bgy-case-card,
.bgy-chart-frame {
  position: relative;
  background: var(--bgy-surface);
  border: var(--bgy-border-width) solid var(--bgy-line);
  border-radius: var(--bgy-panel-radius);
  box-shadow: var(--bgy-panel-shadow);
  overflow: hidden;
}

.bgy-card,
.bgy-kpi-card,
.bgy-data-card,
.bgy-project-card,
.bgy-highlight-card,
.bgy-risk-card,
.bgy-problem-card,
.bgy-bright-card,
.bgy-conclusion-card,
.bgy-image-card,
.bgy-case-card {
  border-radius: var(--bgy-card-radius);
  box-shadow: var(--bgy-card-shadow);
}

.bgy-card__hd,
.bgy-panel__hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px 10px;
}

.bgy-card__body,
.bgy-panel__body {
  padding: 16px;
}

.bgy-card__title,
.bgy-panel__title,
.bgy-section-title {
  margin: 0;
  font-size: 18px;
  line-height: 1.2;
  color: var(--bgy-text);
  font-weight: 600;
}

.bgy-card__text,
.bgy-callout__text,
.bgy-kpi-card__note,
.bgy-project-card p,
.bgy-risk-card p,
.bgy-conclusion-card p,
.bgy-image-card p,
.bgy-case-card p {
  margin: 0;
  font-size: 15px;
  line-height: 1.55;
  color: var(--bgy-muted);
}

.bgy-card__eyebrow {
  margin: 0 0 7px;
  color: var(--bgy-brand);
  font-size: 13px;
  font-weight: 700;
}

.bgy-section-title {
  font-size: 16px;
}

.bgy-metric-card,
.bgy-kpi-card {
  position: relative;
  background: var(--bgy-surface);
  border: var(--bgy-border-width) solid var(--bgy-line);
  border-radius: var(--bgy-metric-radius);
  box-shadow: var(--bgy-card-shadow);
  padding: 16px;
}

.bgy-metric-value,
.bgy-kpi-card__value {
  margin: 0;
  font-size: 28px;
  line-height: 1.05;
  color: var(--bgy-deep-brand);
  font-weight: 700;
}

.bgy-kpi-card--hero .bgy-kpi-card__value {
  font-size: 42px;
}

.bgy-metric-label,
.bgy-kpi-card__label,
.bgy-kpi-card__unit {
  margin: 6px 0 0;
  font-size: 16px;
  color: var(--bgy-muted);
}

.bgy-kpi-card__unit {
  color: var(--bgy-deep-brand);
  font-weight: 700;
}

.bgy-kpi-card__row,
.bgy-project-card,
.bgy-ranking-card > div,
.bgy-progress-list > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.bgy-kpi-card__trend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.bgy-kpi-card__trend span,
.bgy-risk-level,
.bgy-status-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: var(--bgy-tag-radius);
  font-weight: 600;
  white-space: nowrap;
}

.bgy-kpi-card__trend span {
  padding: 5px 8px;
  color: var(--bgy-success);
  background: var(--bgy-success-bg);
  font-size: 13px;
}

.bgy-status-tag {
  padding: 5px 10px;
  border: 1px solid transparent;
  font-size: 16px;
  line-height: 1;
}

.bgy-status-tag.is-success {
  color: var(--bgy-success);
  background: var(--bgy-success-bg);
  border-color: var(--bgy-success-bg);
}

.bgy-status-tag.is-warning {
  color: var(--bgy-warning);
  background: var(--bgy-warning-bg);
  border-color: var(--bgy-warning-bg);
}

.bgy-status-tag.is-danger {
  color: var(--bgy-danger);
  background: var(--bgy-danger-bg);
  border-color: var(--bgy-danger-bg);
}

.bgy-status-tag.is-info {
  color: var(--bgy-info);
  background: var(--bgy-info-bg);
  border-color: var(--bgy-info-bg);
}

.bgy-data-card,
.bgy-highlight-card,
.bgy-risk-card,
.bgy-problem-card,
.bgy-bright-card,
.bgy-conclusion-card {
  padding: 16px;
}

.bgy-data-card strong,
.bgy-highlight-card strong,
.bgy-risk-card strong,
.bgy-problem-card strong,
.bgy-bright-card strong,
.bgy-conclusion-card strong,
.bgy-case-card strong {
  display: block;
  color: var(--bgy-deep-brand);
  font-size: 18px;
  line-height: 1.35;
}

.bgy-data-card span,
.bgy-project-card span,
.bgy-highlight-card span,
.bgy-conclusion-card span {
  color: var(--bgy-muted);
  font-size: 14px;
}

.bgy-highlight-card {
  border-left: 5px solid var(--bgy-brand);
}

.bgy-conclusion-card {
  background: var(--bgy-panel);
}

.bgy-risk-card {
  border-left: 5px solid var(--bgy-danger);
}

.bgy-risk-card__level {
  display: inline-flex;
  margin-bottom: 9px;
  padding: 5px 8px;
  border-radius: var(--bgy-tag-radius);
  color: var(--bgy-danger);
  background: var(--bgy-danger-bg);
  font-size: 13px;
  font-weight: 700;
}

.bgy-risk-card__level.is-medium {
  color: var(--bgy-warning);
  background: var(--bgy-warning-bg);
}

.bgy-divider {
  width: 100%;
  height: 1px;
  background: var(--bgy-line);
}

.bgy-line {
  height: 2px;
  background: var(--bgy-brand);
}

.bgy-callout {
  padding: 14px 16px;
  background: var(--bgy-panel);
  border-left: 4px solid var(--bgy-brand);
  border-radius: var(--bgy-panel-radius);
}

.bgy-callout__title {
  margin: 0 0 6px;
  font-size: 16px;
  color: var(--bgy-deep-brand);
  font-weight: 600;
}

.bgy-icon-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--bgy-tag-radius);
  border: 1px solid var(--bgy-line);
  background: var(--bgy-panel);
  color: var(--bgy-brand);
}

.bgy-image-frame {
  border-radius: var(--bgy-image-radius);
  border: 1px solid var(--bgy-line);
  overflow: hidden;
  background: var(--bgy-panel);
}

.bgy-image-frame > img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bgy-image-placeholder {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  min-height: 92px;
  color: var(--bgy-muted);
  background: var(--bgy-panel);
  font-size: 14px;
  font-weight: 600;
}

.bgy-table {
  width: 100%;
  border-collapse: collapse;
  font-size: ${density};
  color: var(--bgy-text);
}

.bgy-table th,
.bgy-table td {
  padding: ${cellPadding};
  border-bottom: 1px solid var(--bgy-table-border);
  vertical-align: middle;
}

.bgy-table thead th {
  background: var(--bgy-table-header-bg);
  color: var(--bgy-muted);
  font-weight: 600;
  text-align: left;
}

.bgy-table tbody tr:nth-child(even) td {
  background: var(--bgy-table-row-alt);
}

.bgy-stack {
  display: flex;
  flex-direction: column;
  gap: var(--bgy-section-gap);
}

.bgy-grid {
  display: grid;
  gap: var(--bgy-section-gap);
}

.bgy-grid.cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.bgy-grid.cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.bgy-surface {
  background: var(--bgy-surface);
  border: var(--bgy-border-width) solid var(--bgy-line);
  box-shadow: var(--bgy-panel-shadow);
}

.bgy-progress,
.bgy-progress__track {
  display: block;
  width: 100%;
}

.bgy-progress {
  margin-top: 10px;
}

.bgy-progress__track {
  height: 9px;
  overflow: hidden;
  border-radius: var(--bgy-tag-radius);
  background: var(--bgy-panel);
  border: 1px solid var(--bgy-line);
}

.bgy-progress__bar {
  display: block;
  height: 100%;
  border-radius: var(--bgy-tag-radius);
  background: var(--bgy-brand);
}

.bgy-progress__bar.is-warning {
  background: var(--bgy-warning);
}

.bgy-progress-list {
  display: grid;
  gap: 10px;
}

.bgy-progress-list > div {
  display: grid;
  grid-template-columns: 82px 44px 1fr;
  align-items: center;
  gap: 10px;
  color: var(--bgy-text);
  font-size: 14px;
}

.bgy-ring-progress {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  border: 1px solid var(--bgy-line);
  border-radius: var(--bgy-card-radius);
  background: var(--bgy-surface);
}

.bgy-ring-progress__svg {
  width: 76px;
  height: 76px;
  color: var(--bgy-brand);
}

.bgy-ring-progress strong,
.bgy-ring-progress__value {
  display: block;
  color: var(--bgy-deep-brand);
  font-size: 24px;
  line-height: 1.1;
  font-weight: 700;
}

.bgy-ring-progress span {
  color: var(--bgy-muted);
  font-size: 14px;
}

.bgy-stage-progress,
.bgy-milestone-list,
.bgy-roadmap,
.bgy-delta-grid,
.bgy-comparison,
.bgy-before-after,
.bgy-chart-split,
.bgy-advanced-chart-grid,
.bgy-image-text,
.bgy-image-grid {
  display: grid;
  gap: 12px;
}

.bgy-delta-grid,
.bgy-comparison,
.bgy-before-after,
.bgy-chart-split,
.bgy-image-text {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.bgy-advanced-chart-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.bgy-image-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.bgy-stage-progress {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.bgy-stage-progress span,
.bgy-milestone-list > div,
.bgy-roadmap > div,
.bgy-compare-card,
.bgy-before-after > div,
.bgy-delta-card,
.bgy-risk-action > div {
  padding: 12px;
  border: 1px solid var(--bgy-line);
  border-radius: var(--bgy-panel-radius);
  background: var(--bgy-surface);
}

.bgy-delta-card {
  display: grid;
  gap: 4px;
  align-items: start;
}

.bgy-delta-card strong {
  color: var(--bgy-text);
  font-size: 15px;
}

.bgy-delta-card p {
  margin: 0;
  color: var(--bgy-muted);
  font-size: 13px;
  line-height: 1.35;
}

.bgy-stage-progress span {
  text-align: center;
  color: var(--bgy-muted);
  font-size: 14px;
  font-weight: 700;
}

.bgy-stage-progress .is-done {
  color: var(--bgy-success);
  background: var(--bgy-success-bg);
}

.bgy-stage-progress .is-active {
  color: var(--bgy-brand);
  border-color: var(--bgy-brand);
}

.bgy-milestone-list,
.bgy-roadmap {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.bgy-milestone-list strong,
.bgy-roadmap strong,
.bgy-compare-card strong,
.bgy-before-after strong,
.bgy-delta-card span,
.bgy-target-card strong {
  display: block;
  color: var(--bgy-deep-brand);
  font-size: 20px;
  line-height: 1.2;
}

.bgy-milestone-list span,
.bgy-roadmap span,
.bgy-compare-card span,
.bgy-before-after span,
.bgy-target-card span {
  color: var(--bgy-muted);
  font-size: 14px;
}

.bgy-target-card {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  padding: 14px;
  border: 1px solid var(--bgy-line);
  border-radius: var(--bgy-card-radius);
  background: var(--bgy-surface);
}

.bgy-target-card--wide {
  min-height: 118px;
}

.bgy-target-card .is-success,
.bgy-delta-card.is-up span {
  color: var(--bgy-success);
}

.bgy-delta-card.is-down span {
  color: var(--bgy-danger);
}

.bgy-compare-card.is-primary {
  border-color: var(--bgy-brand);
  background: var(--bgy-panel);
}

.bgy-chart-frame {
  min-height: 118px;
  padding: 14px;
  box-shadow: var(--bgy-panel-shadow);
}

.bgy-chart-bars {
  display: flex;
  align-items: end;
  gap: 10px;
  width: 100%;
  height: 112px;
}

.bgy-chart-bars--horizontal {
  display: grid;
  align-items: center;
  height: auto;
  gap: 9px;
}

.bgy-chart-bar {
  display: block;
  flex: 1;
  min-width: 0;
  border-radius: 4px 4px 0 0;
  background: var(--bgy-brand);
}

.bgy-chart-bars--horizontal .bgy-chart-bar {
  height: 18px;
  border-radius: var(--bgy-tag-radius);
}

.bgy-chart-bar i {
  display: block;
  padding-left: 8px;
  color: var(--bgy-white);
  font-style: normal;
  font-size: 12px;
  line-height: 18px;
}

.bgy-chart-line-visual {
  width: 100%;
  height: 118px;
  color: var(--bgy-brand);
}

.bgy-chart-area-band {
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: 16px;
  height: 36px;
  border-radius: var(--bgy-panel-radius);
  background: var(--bgy-info-bg);
}

.bgy-chart-pie-legend,
.bgy-chart-placeholder {
  display: grid;
  place-items: center;
  min-height: 90px;
  color: var(--bgy-muted);
  text-align: center;
}

.bgy-chart-pie-legend strong {
  color: var(--bgy-deep-brand);
  font-size: 28px;
}

.bgy-chart-placeholder {
  min-height: 118px;
  border-style: dashed;
  font-weight: 700;
}

.bgy-ranking-list {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.bgy-ranking-list li {
  display: grid;
  grid-template-columns: 34px 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border: 1px solid var(--bgy-line);
  border-radius: var(--bgy-panel-radius);
  background: var(--bgy-surface);
}

.bgy-ranking-list strong {
  color: var(--bgy-brand);
  font-size: 18px;
}

.bgy-ranking-list span {
  color: var(--bgy-text);
  font-size: 14px;
  font-weight: 600;
}

.bgy-ranking-list em {
  color: var(--bgy-deep-brand);
  font-style: normal;
  font-weight: 700;
}

.bgy-process {
  display: grid;
  gap: 10px;
  align-items: center;
}

.bgy-process--horizontal {
  grid-template-columns: 1fr 32px 1fr 32px 1fr;
}

.bgy-process--vertical {
  grid-template-columns: 1fr;
}

.bgy-process-step,
.bgy-pdca > div {
  display: grid;
  place-items: center;
  min-height: 56px;
  padding: 10px;
  border: 1px solid var(--bgy-line);
  border-radius: var(--bgy-panel-radius);
  background: var(--bgy-surface);
  color: var(--bgy-text);
  text-align: center;
}

.bgy-process-step strong,
.bgy-pdca strong {
  color: var(--bgy-deep-brand);
  font-size: 16px;
}

.bgy-process-step span,
.bgy-pdca span {
  color: var(--bgy-muted);
  font-size: 13px;
}

.bgy-process-line {
  display: block;
  width: 32px;
  height: 2px;
  background: var(--bgy-brand);
}

.bgy-process-loop,
.bgy-pdca {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.bgy-timeline {
  display: grid;
  gap: 10px;
}

.bgy-timeline-item {
  display: grid;
  grid-template-columns: 20px 52px 1fr;
  align-items: start;
  gap: 9px;
  padding: 10px;
  border: 1px solid var(--bgy-line);
  border-radius: var(--bgy-panel-radius);
  background: var(--bgy-surface);
}

.bgy-timeline-dot {
  width: 13px;
  height: 13px;
  margin-top: 4px;
  border-radius: 50%;
  background: var(--bgy-brand);
}

.bgy-timeline-item strong {
  color: var(--bgy-deep-brand);
}

.bgy-timeline-item p {
  margin: 0;
  color: var(--bgy-muted);
}

.bgy-risk-levels {
  display: flex;
  gap: 10px;
  align-items: center;
}

.bgy-risk-level {
  justify-content: center;
  min-width: 54px;
  padding: 8px 10px;
  border: 1px solid var(--bgy-line);
  background: var(--bgy-surface);
}

.bgy-risk-level.is-low {
  color: var(--bgy-success);
  background: var(--bgy-success-bg);
}

.bgy-risk-level.is-medium {
  color: var(--bgy-warning);
  background: var(--bgy-warning-bg);
}

.bgy-risk-level.is-high {
  color: var(--bgy-danger);
  background: var(--bgy-danger-bg);
}

.bgy-risk-matrix {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.bgy-risk-cell {
  display: grid;
  place-items: center;
  min-height: 42px;
  border-radius: var(--bgy-panel-radius);
  border: 1px solid var(--bgy-line);
  font-weight: 700;
}

.bgy-risk-cell.is-low {
  color: var(--bgy-success);
  background: var(--bgy-success-bg);
}

.bgy-risk-cell.is-medium {
  color: var(--bgy-warning);
  background: var(--bgy-warning-bg);
}

.bgy-risk-cell.is-high {
  color: var(--bgy-danger);
  background: var(--bgy-danger-bg);
}

.bgy-risk-action {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.bgy-risk-action strong {
  color: var(--bgy-deep-brand);
}

.bgy-risk-action span {
  display: block;
  margin-top: 6px;
  color: var(--bgy-muted);
}

.bgy-image-card,
.bgy-case-card {
  display: grid;
  gap: 10px;
  padding: 12px;
}

.bgy-image-card .bgy-image-frame,
.bgy-case-card .bgy-image-frame,
.bgy-image-grid .bgy-image-frame,
.bgy-before-after--images .bgy-image-frame {
  min-height: 82px;
}

.bgy-image-text {
  grid-template-columns: 1.2fr 1fr;
  align-items: stretch;
}

.bgy-image-text > div:last-child {
  padding: 12px;
  border: 1px solid var(--bgy-line);
  border-radius: var(--bgy-panel-radius);
  background: var(--bgy-surface);
}

.bgy-case-card > div:last-child {
  display: grid;
  gap: 8px;
}
`;
}

export function collectProjectStyleExpectations(config) {
  const normalized = normalizeProjectConfig(config);
  return {
    colors: collectProjectThemeTokens(normalized),
    fonts: collectProjectFontFamilies(normalized),
    shadows: collectProjectShadowValues(normalized),
    radii: collectProjectRadiusValues(normalized),
    iconPack: normalized.components.iconPack,
    locked: normalized.locked,
  };
}

export function inferProjectRootFromInput(input = "") {
  const absolute = absolutePath(input);
  if (!absolute) return "";
  const stat = fs.existsSync(absolute) ? fs.statSync(absolute) : null;
  let dir = stat && stat.isDirectory() ? absolute : path.dirname(absolute);
  while (dir && dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, "bgy.project.json")) || fs.existsSync(path.join(dir, "project-config.html"))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return "";
}

export function projectTemplatePath(name) {
  return path.join(ASSETS_DIR, "project-starter", name);
}

export function projectPresetPath(name) {
  return path.join(PRESETS_DIR, `${normalizePresetName(name)}.json`);
}
