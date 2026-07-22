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
      deepBrand: "#003E57",
      warning: "#B86A00",
      chart: ["#006D9A", "#2E7D32", "#C00000", "#B86A00", "#5F6D7A"],
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
      panel: "#F7FAFC",
      chart: ["#006D9A", "#2B6CB0", "#2E7D32", "#C97400", "#64748B"],
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
      deepBrand: "#00405A",
      chart: ["#006D9A", "#2E7D32", "#C00000", "#5F6D7A", "#C97400"],
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
      success: "#2F7D3D",
      chart: ["#006D9A", "#2F7D3D", "#C97400", "#C00000", "#64748B"],
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
      danger: "#B00000",
      warning: "#B86A00",
      chart: ["#006D9A", "#B00000", "#2E7D32", "#C97400", "#64748B"],
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
  const density = "16px";
  return `/* Auto-generated by bgy-html-design. Do not edit by hand. */\n.bgy-card,\n.bgy-panel {\n  position: relative;\n  background: var(--bgy-surface);\n  border: var(--bgy-border-width) solid var(--bgy-line);\n  border-radius: var(--bgy-panel-radius);\n  box-shadow: var(--bgy-panel-shadow);\n  overflow: hidden;\n}\n\n.bgy-card {\n  box-shadow: var(--bgy-card-shadow);\n  border-radius: var(--bgy-card-radius);\n}\n\n.bgy-card__hd,\n.bgy-panel__hd {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 12px;\n  padding: 14px 16px 10px;\n}\n\n.bgy-card__body,\n.bgy-panel__body {\n  padding: 16px;\n}\n\n.bgy-card__title,\n.bgy-panel__title,\n.bgy-section-title {\n  margin: 0;\n  font-size: 18px;\n  line-height: 1.2;\n  color: var(--bgy-text);\n  font-weight: 600;\n}\n\n.bgy-section-title {\n  font-size: 16px;\n}\n\n.bgy-metric-card {\n  position: relative;\n  background: var(--bgy-surface);\n  border: var(--bgy-border-width) solid var(--bgy-line);\n  border-radius: var(--bgy-metric-radius);\n  box-shadow: var(--bgy-card-shadow);\n  padding: 16px;\n}\n\n.bgy-metric-value {\n  margin: 0;\n  font-size: 28px;\n  line-height: 1.05;\n  color: var(--bgy-deep-brand);\n  font-weight: 700;\n}\n\n.bgy-metric-label {\n  margin: 6px 0 0;\n  font-size: 16px;\n  color: var(--bgy-muted);\n}\n\n.bgy-status-tag {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  padding: 5px 10px;\n  border-radius: var(--bgy-tag-radius);\n  border: 1px solid transparent;\n  font-size: 16px;\n  line-height: 1;\n  font-weight: 600;\n  white-space: nowrap;\n}\n\n.bgy-status-tag.is-success {\n  color: var(--bgy-success);\n  background: var(--bgy-success-bg);\n  border-color: var(--bgy-success-bg);\n}\n\n.bgy-status-tag.is-warning {\n  color: var(--bgy-warning);\n  background: var(--bgy-warning-bg);\n  border-color: var(--bgy-warning-bg);\n}\n\n.bgy-status-tag.is-danger {\n  color: var(--bgy-danger);\n  background: var(--bgy-danger-bg);\n  border-color: var(--bgy-danger-bg);\n}\n\n.bgy-status-tag.is-info {\n  color: var(--bgy-info);\n  background: var(--bgy-info-bg);\n  border-color: var(--bgy-info-bg);\n}\n\n.bgy-divider {\n  width: 100%;\n  height: 1px;\n  background: var(--bgy-line);\n}\n\n.bgy-callout {\n  padding: 14px 16px;\n  background: var(--bgy-panel);\n  border-left: 4px solid var(--bgy-brand);\n  border-radius: var(--bgy-panel-radius);\n}\n\n.bgy-callout__title {\n  margin: 0 0 6px;\n  font-size: 16px;\n  color: var(--bgy-deep-brand);\n  font-weight: 600;\n}\n\n.bgy-callout__text {\n  margin: 0;\n  font-size: 16px;\n  line-height: 1.6;\n  color: var(--bgy-text);\n}\n\n.bgy-icon-chip {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 32px;\n  height: 32px;\n  border-radius: var(--bgy-tag-radius);\n  border: 1px solid var(--bgy-line);\n  background: var(--bgy-panel);\n  color: var(--bgy-brand);\n}\n\n.bgy-image-frame {\n  border-radius: var(--bgy-image-radius);\n  border: 1px solid var(--bgy-line);\n  overflow: hidden;\n  background: var(--bgy-panel);\n}\n\n.bgy-image-frame > img {\n  display: block;\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\n\n.bgy-table {\n  width: 100%;\n  border-collapse: collapse;\n  font-size: ${density};\n  color: var(--bgy-text);\n}\n\n.bgy-table th,\n.bgy-table td {\n  padding: 10px 12px;\n  border-bottom: 1px solid var(--bgy-table-border);\n  vertical-align: middle;\n}\n\n.bgy-table thead th {\n  background: var(--bgy-table-header-bg);\n  color: var(--bgy-muted);\n  font-weight: 600;\n  text-align: left;\n}\n\n.bgy-table tbody tr:nth-child(even) td {\n  background: var(--bgy-table-row-alt);\n}\n\n.bgy-stack {\n  display: flex;\n  flex-direction: column;\n  gap: var(--bgy-section-gap);\n}\n\n.bgy-grid {\n  display: grid;\n  gap: var(--bgy-section-gap);\n}\n\n.bgy-grid.cols-2 {\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n}\n\n.bgy-grid.cols-3 {\n  grid-template-columns: repeat(3, minmax(0, 1fr));\n}\n\n.bgy-surface {\n  background: var(--bgy-surface);\n  border: var(--bgy-border-width) solid var(--bgy-line);\n  box-shadow: var(--bgy-panel-shadow);\n}\n`;
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
