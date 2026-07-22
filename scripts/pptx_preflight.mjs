#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { absolutePath } from "./runtime.mjs";
import {
  collectProjectStyleExpectations,
  inferProjectRootFromInput,
  readProjectConfig,
} from "./project_config.mjs";

function usage() {
  console.log(`
Usage:
  node pptx_preflight.mjs --slides-dir <slides/> [--strict]
  node pptx_preflight.mjs --html <slide.html> [--strict]

Options:
  --project-root <dir>   BGY project root with bgy.project.json. Default: auto-detect.
`);
}

function parseArgs() {
  const opts = { html: "", slidesDir: "", projectRoot: "", strict: false };
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const key = args[i];
    const next = args[i + 1];
    if (key === "--help" || key === "-h") {
      usage();
      process.exit(0);
    } else if (key === "--html" && next) {
      opts.html = next; i++;
    } else if ((key === "--slides-dir" || key === "--slides") && next) {
      opts.slidesDir = next; i++;
    } else if (key === "--project-root" && next) {
      opts.projectRoot = next; i++;
    } else if (key === "--strict") {
      opts.strict = true;
    } else {
      throw new Error(`Unknown argument: ${key}`);
    }
  }
  if (!opts.html && !opts.slidesDir) throw new Error("Missing --html or --slides-dir.");
  if (opts.html && opts.slidesDir) throw new Error("Use either --html or --slides-dir, not both.");
  return opts;
}

function htmlInputs(opts) {
  if (opts.html) {
    const file = absolutePath(opts.html);
    if (!fs.existsSync(file)) throw new Error(`HTML input not found: ${file}`);
    return [file];
  }
  const dir = absolutePath(opts.slidesDir);
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    throw new Error(`Slides directory not found: ${dir}`);
  }
  const files = fs.readdirSync(dir)
    .filter(name => /\.html?$/i.test(name))
    .sort((a, b) => a.localeCompare(b, "zh-CN", { numeric: true, sensitivity: "base" }))
    .map(name => path.join(dir, name));
  if (files.length === 0) throw new Error(`Slides directory has no .html files: ${dir}`);
  return files;
}

function attrValue(attrs, name) {
  const match = attrs.match(new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, "i"));
  return match ? match[1] : "";
}

function hasAttr(attrs, name) {
  return new RegExp(`\\b${name}(?:\\s*=|\\b)`, "i").test(attrs);
}

function descriptor(tag, attrs) {
  const id = attrValue(attrs, "id");
  const cls = attrValue(attrs, "class").trim().replace(/\s+/g, ".");
  return `${tag}${id ? `#${id}` : ""}${cls ? `.${cls}` : ""}`;
}

function findTagEnd(html, openEnd) {
  let quote = "";
  for (let i = openEnd; i < html.length; i++) {
    const ch = html[i];
    if (quote) {
      if (ch === quote) quote = "";
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === ">") {
      return i;
    }
  }
  return -1;
}

function elementInnerHtmlAt(html, openStart) {
  const openMatch = /^<([a-z][\w:-]*)\b/i.exec(html.slice(openStart));
  if (!openMatch) return "";
  const tag = openMatch[1].toLowerCase();
  const openEnd = findTagEnd(html, openStart);
  if (openEnd < 0 || /\/\s*>$/.test(html.slice(openStart, openEnd + 1))) return "";

  const re = new RegExp(`<\\/?${tag}\\b[^>]*>`, "gi");
  re.lastIndex = openEnd + 1;
  let depth = 1;
  let match;
  while ((match = re.exec(html))) {
    if (match[0][1] === "/") depth -= 1;
    else if (!/\/\s*>$/.test(match[0])) depth += 1;
    if (depth === 0) return html.slice(openEnd + 1, match.index);
  }
  return "";
}

function hasDirectTitleText(html) {
  const titleBarRe = /<div\b([^>]*\bclass\s*=\s*["'][^"']*\btitle-bar\b[^"']*["'][^>]*)>([\s\S]*?)<\/div>/gi;
  let match;
  while ((match = titleBarRe.exec(html))) {
    const body = match[2] || "";
    if (/^(\s|<!--[\s\S]*?-->)*[^<\s]/.test(body)) return true;
    if (/<\/(?:span|strong|em|b|i|small|p|h[1-6])>\s*[^<\s]/i.test(body)) return true;
  }
  return false;
}

function stripComments(html) {
  return html.replace(/<!--[\s\S]*?-->/g, "");
}

function styleBlocks(html) {
  const blocks = [];
  const re = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
  let match;
  while ((match = re.exec(html))) blocks.push(match[1] || "");
  return blocks;
}

function linkedStyleBlocks(html, file, warnings) {
  const blocks = [];
  const linkRe = /<link\b([^>]*)>/gi;
  let match;
  while ((match = linkRe.exec(html))) {
    const attrs = match[1] || "";
    const rel = attrValue(attrs, "rel").toLowerCase();
    const href = attrValue(attrs, "href");
    if (!/\bstylesheet\b/.test(rel) || !href) continue;
    if (/^(?:https?:)?\/\//i.test(href)) {
      warnings.push(`External stylesheet "${href}" is not self-contained; PPTX-bound HTML should use local CSS.`);
      continue;
    }
    if (/^(?:data|javascript):/i.test(href) || href.startsWith("#")) continue;
    const hrefPath = href.split(/[?#]/)[0];
    const decoded = (() => {
      try {
        return decodeURI(hrefPath);
      } catch (_) {
        return hrefPath;
      }
    })();
    const cssPath = path.resolve(path.dirname(file), decoded);
    if (!fs.existsSync(cssPath) || !fs.statSync(cssPath).isFile()) {
      warnings.push(`Stylesheet not found: ${href}`);
      continue;
    }
    blocks.push(fs.readFileSync(cssPath, "utf8"));
  }
  return blocks;
}

function remoteAssetHost(value) {
  const raw = String(value || "").trim();
  if (!/^(?:https?:)?\/\//i.test(raw)) return "";
  try {
    const url = raw.startsWith("//") ? new URL(`https:${raw}`) : new URL(raw);
    return url.hostname.toLowerCase();
  } catch (_) {
    return raw.toLowerCase();
  }
}

function iconLibraryName(value) {
  const raw = String(value || "").toLowerCase();
  const host = remoteAssetHost(raw);
  const haystack = `${host} ${raw}`;
  if (/\blucide\b|lucide-static|lucide-react/.test(haystack)) return "lucide";
  if (/fontawesome|font-awesome|kit\.fontawesome/.test(haystack)) return "font-awesome";
  if (/iconfont|at\.alicdn|alicdn\.com\/t\/font_/.test(haystack)) return "iconfont";
  if (/remixicon/.test(haystack)) return "remixicon";
  if (/bootstrap-icons/.test(haystack)) return "bootstrap-icons";
  if (/heroicons/.test(haystack)) return "heroicons";
  if (/phosphor-icons|phosphoricons/.test(haystack)) return "phosphor";
  if (/boxicons/.test(haystack)) return "boxicons";
  return "";
}

function checkIconLibraries(html, warnings) {
  const libraries = new Set();
  const remoteRefs = [];
  const tagRe = /<(script|link|use|img)\b([^>]*)>/gi;
  let match;
  while ((match = tagRe.exec(html))) {
    const tag = match[1].toLowerCase();
    const attrs = match[2] || "";
    const src = attrValue(attrs, tag === "link" ? "href" : "src") || attrValue(attrs, "href") || attrValue(attrs, "xlink:href");
    const lib = iconLibraryName(src);
    if (lib) libraries.add(lib);
    if (tag === "script" && remoteAssetHost(src)) remoteRefs.push(src);
    if (tag === "link" && remoteAssetHost(src)) remoteRefs.push(src);
    if (tag === "use" && /^https?:\/\//i.test(src)) remoteRefs.push(src);
    if (tag === "img" && /\.svg(?:[?#].*)?$/i.test(src)) {
      warnings.push(`${descriptor(tag, attrs)} references SVG as an image; copy local SVG inline for editable PPT icons.`);
    }
  }

  libraries.forEach(lib => {
    warnings.push(`External icon library detected (${lib}); use local BGY icons from assets/icons and inline SVG for PPTX-bound HTML.`);
  });
  if (libraries.size > 1) {
    warnings.push(`Multiple icon libraries detected (${Array.from(libraries).join(", ")}); keep one local BGY icon style per slide/deck.`);
  }
  if (remoteRefs.length > 0 && libraries.size > 0) {
    const sample = remoteRefs.slice(0, 3).join(", ");
    warnings.push(`Remote icon/script/style references detected (${sample}); PPTX-bound BGY pages should be self-contained.`);
  }

  const classLibs = new Set();
  const classRe = /\bclass\s*=\s*["']([^"']*)["']/gi;
  while ((match = classRe.exec(html))) {
    const cls = match[1].toLowerCase();
    if (/\b(?:fa|fas|far|fab|fa-solid|fa-regular|fa-brands)\b/.test(cls)) classLibs.add("font-awesome");
    if (/\b(?:ri-[\w-]+)\b/.test(cls)) classLibs.add("remixicon");
    if (/\b(?:bi-[\w-]+)\b/.test(cls)) classLibs.add("bootstrap-icons");
    if (/\biconfont\b|\biconfont-[\w-]+\b/.test(cls)) classLibs.add("iconfont");
  }
  classLibs.forEach(lib => warnings.push(`Icon-font class pattern detected (${lib}); use local inline SVG instead of font icons.`));
}

function normalizeHexColor(value) {
  const raw = String(value || "").trim();
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(raw);
  if (!match) return "";
  let hex = match[1].toLowerCase();
  if (hex.length === 3) hex = hex.split("").map(ch => ch + ch).join("");
  if (hex.length === 8) hex = hex.slice(0, 6);
  return `#${hex}`;
}

function normalizeCssValue(value) {
  return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function hasStylesheetLink(html, name) {
  const re = /<link\b([^>]*)>/gi;
  let match;
  while ((match = re.exec(html))) {
    const attrs = match[1] || "";
    const rel = attrValue(attrs, "rel").toLowerCase();
    const href = attrValue(attrs, "href").replace(/\\/g, "/").toLowerCase();
    if (/\bstylesheet\b/.test(rel) && href.endsWith(name.toLowerCase())) return true;
  }
  return false;
}

function directHexColors(source) {
  const found = new Set();
  const re = /#[0-9a-f]{3,8}\b/gi;
  let match;
  while ((match = re.exec(source))) {
    const color = normalizeHexColor(match[0]);
    if (color) found.add(color);
  }
  return Array.from(found);
}

function cssFontFamilies(css) {
  const values = [];
  const re = /\bfont-family\s*:\s*([^;{}]+)/gi;
  let match;
  while ((match = re.exec(css))) values.push(match[1].trim());
  return values;
}

function cssRadiusValues(css) {
  const values = [];
  const re = /\bborder-radius\s*:\s*([^;{}]+)/gi;
  let match;
  while ((match = re.exec(css))) values.push(match[1].trim());
  return values;
}

function cssShadowValues(css) {
  const values = [];
  const re = /\bbox-shadow\s*:\s*([^;{}]+)/gi;
  let match;
  while ((match = re.exec(css))) values.push(match[1].trim());
  return values;
}

function projectCss(html, file) {
  return [...styleBlocks(html), ...linkedStyleBlocks(html, file, [])].join("\n");
}

function checkProjectContract(html, file, project, warnings) {
  if (!project) return;
  const expectations = collectProjectStyleExpectations(project.config);
  const css = projectCss(html, file);
  const fullSource = `${html}\n${css}`;
  const relFile = path.relative(project.root, file).replace(/\\/g, "/");

  if (project.missingConfig) {
    warnings.push(`Project root has no bgy.project.json; initialize or sync the project before generating PPT pages.`);
  }
  if (!project.config.locked) {
    warnings.push(`Project theme is not locked in bgy.project.json; lock it before batch-generating or final exporting slides.`);
  }
  if (/^slides\//i.test(relFile)) {
    if (!hasStylesheetLink(html, "shared/tokens.css") && !hasStylesheetLink(html, "../shared/tokens.css")) {
      warnings.push(`Slide does not link shared/tokens.css; project-level colors and font rules may drift.`);
    }
    if (!hasStylesheetLink(html, "shared/components.css") && !hasStylesheetLink(html, "../shared/components.css")) {
      warnings.push(`Slide does not link shared/components.css; component styles may drift across pages.`);
    }
  }

  if (!project.config.rules.allowDirectHexOutsideTokens) {
    const allowedColors = new Set(expectations.colors.map(normalizeHexColor).filter(Boolean));
    const badColors = directHexColors(fullSource)
      .filter(color => !allowedColors.has(color))
      .filter(color => color !== "#000000" || expectations.colors.some(item => normalizeHexColor(item) === "#000000"));
    if (badColors.length > 0) {
      warnings.push(`Project theme drift: direct color(s) not declared in bgy.project.json: ${badColors.slice(0, 8).join(", ")}.`);
    }
  }

  const allowedFonts = expectations.fonts.map(font => font.toLowerCase());
  cssFontFamilies(css).forEach(value => {
    const normalized = value.toLowerCase();
    if (/var\(--bgy-font-family\)/.test(normalized)) return;
    const candidates = normalized.split(",").map(item => item.trim().replace(/^['"]|['"]$/g, ""));
    const firstRealFont = candidates.find(font => !["arial", "sans-serif", "serif", "monospace"].includes(font)) || candidates[0] || "";
    const ok = allowedFonts.includes(firstRealFont);
    if (!ok) warnings.push(`Project theme drift: font-family "${value}" is not allowed by bgy.project.json.`);
  });

  const allowedRadii = new Set(expectations.radii.map(value => Number(value)));
  cssRadiusValues(css).forEach(value => {
    if (/var\(--bgy-[\w-]+radius\)/i.test(value)) return;
    const numbers = value.match(/-?\d+(?:\.\d+)?px/g) || [];
    const bad = numbers
      .map(item => Number(item.replace(/px/i, "")))
      .filter(number => number !== 0 && !allowedRadii.has(number));
    if (bad.length > 0) {
      warnings.push(`Project theme drift: border-radius "${value}" is outside configured component radii.`);
    }
  });

  const allowedShadows = new Set(expectations.shadows.map(normalizeCssValue));
  cssShadowValues(css).forEach(value => {
    const normalized = normalizeCssValue(value);
    if (/var\(--bgy-(?:card|panel)-shadow\)/i.test(value) || normalized === "none") return;
    if (!allowedShadows.has(normalized)) {
      warnings.push(`Project theme drift: box-shadow "${value}" is not declared in bgy.project.json.`);
    }
  });
}

function splitCssList(value) {
  const parts = [];
  let start = 0;
  let depth = 0;
  for (let i = 0; i < value.length; i++) {
    const ch = value[i];
    if (ch === "(") depth += 1;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    else if (ch === "," && depth === 0) {
      parts.push(value.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(value.slice(start).trim());
  return parts.filter(Boolean);
}

function styleOf(attrs) {
  return attrValue(attrs, "style").toLowerCase();
}

function isSnapshotIntent(attrs) {
  return hasAttr(attrs, "data-ppt-force-snapshot") ||
    hasAttr(attrs, "data-ppt-snapshot") ||
    hasAttr(attrs, "data-ppt-component") ||
    hasAttr(attrs, "data-ppt-module") ||
    hasAttr(attrs, "data-ppt-background");
}

function attrPairs(attrs, names) {
  return names
    .filter(name => hasAttr(attrs, name))
    .map(name => ({ name, value: attrValue(attrs, name) }));
}

function checkGlobalCss(html, file, warnings) {
  const css = [...styleBlocks(html), ...linkedStyleBlocks(html, file, warnings)].join("\n").toLowerCase();
  if (!css) return;

  if (/\b(?:font-size|width|height|left|top|right|bottom|margin|padding)\s*:[^;{}]*(?:vw|vh|vmin|vmax)\b/.test(css)) {
    warnings.push("CSS uses viewport units in sizing/positioning; PPTX export is more stable with fixed px values on a 1280x720 canvas.");
  }
  if (/\bzoom\s*:/.test(css)) {
    warnings.push("CSS uses zoom; use explicit px sizing instead so editable PPT text and shapes stay aligned.");
  }
  if (/\bposition\s*:\s*(?:fixed|sticky)\b/.test(css)) {
    warnings.push("CSS uses fixed/sticky positioning; PPTX-bound slides should use absolute/static geometry inside the 1280x720 slide.");
  }
  if (/\btransform\s*:[^;{}]*(?:scale|skew)\s*\(/.test(css)) {
    warnings.push("CSS uses transform scale/skew; PPTX supports simple rotate best, so scale/skew can misalign editable overlays.");
  }
  if (/\b(?:mix-blend-mode\s*:\s*(?!normal\b)|isolation\s*:\s*isolate|transform-style\s*:\s*preserve-3d|perspective\s*:)/.test(css)) {
    warnings.push("CSS creates a complex stacking/blending context; keep PPTX-bound layers as simple siblings and use numeric data-ppt-layer when order matters.");
  }
  if (/\b(?:background|background-image)\s*:[^;{}]*url\s*\(/.test(css)) {
    warnings.push("CSS background images detected; use real <img> elements, or mark only intentional non-editable backgrounds with data-ppt-background.");
  }
  if (/\b(?:linear-gradient|radial-gradient|conic-gradient)\s*\(/.test(css)) {
    warnings.push("CSS gradients detected; PPTX native gradient mapping is not general-purpose, so use flat fills or explicit snapshot exceptions.");
  }
  if (/\b(?:filter|backdrop-filter|clip-path|mask|mask-image|-webkit-mask|-webkit-box-reflect|box-reflect)\s*:/.test(css)) {
    warnings.push("CSS filter/mask/clip-path/reflection detected; these require a snapshot or a simpler native-friendly approximation.");
  }
  if (/(^|[^\w-])(?:animation|transition)(?:-[\w-]+)?\s*:|@keyframes\b/.test(css)) {
    warnings.push("CSS animation/transition detected; PPTX export is static, so animation should be preview-only.");
  }
  if (/::(?:before|after)\b/.test(css)) {
    warnings.push("CSS pseudo-element visuals detected; create real DOM elements for PPTX-bound shapes/icons/text.");
  }
  const zIndexRules = css.match(/\bz-index\s*:[^;{}]+/g) || [];
  zIndexRules.forEach(rule => {
    const value = rule.split(":").slice(1).join(":").trim();
    if (!/^(?:auto|inherit|initial|unset|-?\d+)$/i.test(value)) {
      warnings.push(`CSS z-index "${value}" is not a plain number; use numeric data-ppt-layer for deterministic PPT layer order.`);
    }
  });

  const shadowRules = css.match(/\bbox-shadow\s*:[^;{}]+/g) || [];
  shadowRules.forEach(rule => {
    const value = rule.split(":").slice(1).join(":");
    if (/\binset\b/.test(value) || splitCssList(value).length > 1) {
      warnings.push("Complex box-shadow detected; only a single simple outer shadow maps reliably to native PPT.");
    }
  });
  const textShadowRules = css.match(/\btext-shadow\s*:[^;{}]+/g) || [];
  textShadowRules.forEach(rule => {
    const value = rule.split(":").slice(1).join(":");
    if (splitCssList(value).length > 1) {
      warnings.push("Multiple text-shadow layers detected; use a single simple shadow/glow for editable PPT text.");
    }
  });
}

function checkTags(html, warnings) {
  const tagRe = /<([a-z][\w:-]*)\b([^>]*)>/gi;
  let match;
  while ((match = tagRe.exec(html))) {
    const tag = match[1].toLowerCase();
    const attrs = match[2] || "";
    const ident = `${attrValue(attrs, "id")} ${attrValue(attrs, "class")} ${attrValue(attrs, "role")}`.toLowerCase();
    const style = styleOf(attrs);
    const desc = descriptor(tag, attrs);
    const snapshotIntent = isSnapshotIntent(attrs);

    if (/^(div|section|article|aside|header|footer|figure)$/i.test(tag)) {
      if (/\b(?:background|background-image)\s*:[^;]*url\s*\(/.test(style) && !snapshotIntent) {
        warnings.push(`${desc} uses a CSS background image; use <img>, or data-ppt-background for intentional non-editable backgrounds.`);
      }
      if (/\b(?:linear-gradient|radial-gradient|conic-gradient)\s*\(/.test(style) && !snapshotIntent) {
        warnings.push(`${desc} uses a CSS gradient; use flat fill for native PPT shapes, or mark an explicit snapshot exception.`);
      }
      if (/\b(?:filter|backdrop-filter|clip-path|mask|mask-image|-webkit-mask|-webkit-box-reflect|box-reflect)\s*:/.test(style) && !snapshotIntent) {
        warnings.push(`${desc} uses filter/mask/clip-path/reflection; this will not become a clean native PPT shape.`);
      }
      if (/\btransform\s*:[^;]*(?:scale|skew)\s*\(/.test(style)) {
        warnings.push(`${desc} uses transform scale/skew; use fixed geometry instead for PPTX-bound slides.`);
      }
      if (/\bposition\s*:\s*(?:fixed|sticky)\b/.test(style)) {
        warnings.push(`${desc} uses fixed/sticky positioning; use absolute/static geometry inside the slide.`);
      }
      if (/\b(?:mix-blend-mode\s*:\s*(?!normal\b)|isolation\s*:\s*isolate|transform-style\s*:\s*preserve-3d|perspective\s*:)/.test(style)) {
        warnings.push(`${desc} creates a complex stacking/blending context; prefer simple sibling layers for PPTX export.`);
      }
      if (/\b(table|data-table|grid-table|matrix)\b/.test(ident) && tag !== "table") {
        warnings.push(`${desc} looks like a table built from layout divs; use semantic <table> so PPTX receives a native table.`);
      }
      if (/\b(chart|echart|graph|plot|trend|donut|bar-chart|line-chart)\b/.test(ident) &&
          !hasAttr(attrs, "data-ppt-placeholder") && !hasAttr(attrs, "data-ppt-chart") && !snapshotIntent) {
        warnings.push(`${desc} looks like a chart area; add data-ppt-chart with explicit data, data-ppt-placeholder, or mark data-ppt-snapshot if it should be an image.`);
      }
    }

    if (tag === "img") {
      if (/\bobject-fit\s*:\s*(cover|contain|scale-down)\b/.test(style) ||
          /\bborder-radius\s*:/.test(style) ||
          /\b(?:filter|clip-path|mask|mask-image|-webkit-mask|-webkit-box-reflect|box-reflect)\s*:/.test(style) ||
          /\bborder(?:-[\w-]+)?\s*:/.test(style)) {
        warnings.push(`${desc} has CSS crop/radius/filter/mask/reflection/border; it remains a PPT picture object but may require an element screenshot, which is slower.`);
      }
      if (/\.svg(?:[?#].*)?["']?$/i.test(attrValue(attrs, "src"))) {
        warnings.push(`${desc} references an SVG image file; inline simple SVG if the icon should become editable native shapes.`);
      }
    }

    if (tag === "canvas" || tag === "video") {
      warnings.push(`${desc} is ${tag}; PPTX export will need a snapshot or a native placeholder replacement.`);
    }

    if (hasAttr(attrs, "data-ppt-placeholder") && !attrValue(attrs, "data-ppt-placeholder") && !attrValue(attrs, "id")) {
      warnings.push(`${desc} has an unnamed data-ppt-placeholder; add a stable id or data-ppt-placeholder value.`);
    }
    if (hasAttr(attrs, "data-ppt-chart")) {
      const chartType = (attrValue(attrs, "data-ppt-chart") || attrValue(attrs, "data-ppt-chart-type")).toLowerCase();
      if (!/^(bar|column|line|pie)$/.test(chartType)) {
        warnings.push(`${desc} has unsupported data-ppt-chart="${chartType}"; use bar, line, or pie.`);
      }
      const innerHtml = elementInnerHtmlAt(html, match.index);
      if (!attrValue(attrs, "data-ppt-chart-data") && !/<script\b[^>]*type\s*=\s*["']application\/(?:json|pptx-chart\+json)["']/i.test(innerHtml)) {
        warnings.push(`${desc} has data-ppt-chart but no data-ppt-chart-data or inner chart JSON script.`);
      }
    }

    const arrowAttrs = attrPairs(attrs, [
      "data-ppt-line-start",
      "data-ppt-line-end",
      "data-ppt-begin-arrow",
      "data-ppt-end-arrow",
      "data-ppt-arrow-start",
      "data-ppt-arrow-end",
    ]);
    const invalidArrow = arrowAttrs.find(item => !/^(|none|arrow|triangle|stealth|diamond|oval)$/i.test(item.value));
    if (invalidArrow) {
      warnings.push(`${desc} has unsupported ${invalidArrow.name}="${invalidArrow.value}"; use none, arrow, triangle, stealth, diamond, or oval.`);
    }

    const dashAttrs = attrPairs(attrs, ["data-ppt-line-dash"]);
    const invalidDash = dashAttrs.find(item => !/^(|solid|dash|dashed|dot|dotted|sysdot|sysdash|dashdot|lgdash|longdash|lgdashdot|lgdashdotdot)$/i.test(item.value));
    if (invalidDash) {
      warnings.push(`${desc} has unsupported data-ppt-line-dash="${invalidDash.value}"; use solid, dash, dot, dashDot, or lgDash.`);
    }

    const layerAttrs = attrPairs(attrs, ["data-ppt-layer", "data-ppt-z", "data-ppt-z-index"]);
    const invalidLayer = layerAttrs.find(item => item.value === "" || !Number.isFinite(Number(item.value)));
    if (invalidLayer) {
      warnings.push(`${desc} has invalid ${invalidLayer.name}="${invalidLayer.value}"; use a numeric value so PPTX layer order is deterministic.`);
    }
  }
}

function checkSvg(html, warnings) {
  const svgRe = /<svg\b([^>]*)>([\s\S]*?)<\/svg>/gi;
  let match;
  while ((match = svgRe.exec(html))) {
    const attrs = match[1] || "";
    const body = match[2] || "";
    const desc = descriptor("svg", attrs);
    if (/<(?:filter|mask|clipPath|linearGradient|radialGradient|pattern|image|foreignObject)\b/i.test(body) ||
        /\b(?:fill|stroke)\s*=\s*["']url\(/i.test(body) ||
        /\b(?:fill|stroke)\s*:\s*url\(/i.test(body)) {
      warnings.push(`${desc} uses SVG effects/gradients/images; it will fall back to a picture, not native icon shapes.`);
    }
    if (/<text\b/i.test(body)) {
      warnings.push(`${desc} contains SVG text; keep text in normal DOM nodes for editable PPT text.`);
    }
    const primitiveCount = (body.match(/<(?:line|polyline|polygon|rect|circle|ellipse|path)\b/gi) || []).length;
    if (primitiveCount > 24) {
      warnings.push(`${desc} has ${primitiveCount} SVG primitives; complex artwork may be slower or less editable than a deliberate image.`);
    }
  }
}

function checkTables(html, warnings) {
  const tableRe = /<table\b([^>]*)>([\s\S]*?)<\/table>/gi;
  let match;
  while ((match = tableRe.exec(html))) {
    const attrs = match[1] || "";
    const body = match[2] || "";
    const desc = descriptor("table", attrs);
    if (!/<tr\b/i.test(body)) {
      warnings.push(`${desc} has no <tr>; native PPT table conversion expects semantic rows and cells.`);
    }
    if (!/<(?:td|th)\b/i.test(body)) {
      warnings.push(`${desc} has no <td>/<th>; native PPT table conversion expects semantic cells.`);
    }
    if (/\b(?:colspan|rowspan)\s*=\s*["']?[2-9]/i.test(body)) {
      warnings.push(`${desc} uses merged cells; supported, but verify the exported native table alignment.`);
    }
    if (/<(?:img|svg|canvas)\b/i.test(body)) {
      warnings.push(`${desc} contains media; native PPT tables preserve text/styles best, while embedded media should usually sit outside the table.`);
    }
  }
}

function checkSnapshotMarkers(html, warnings) {
  const markerRe = /<([a-z][\w:-]*)\b([^>]*(?:\bdata-ppt-(?:component|module|snapshot)\b|\bppt-(?:component|module|snapshot)\b)[^>]*)>/gi;
  let match;
  while ((match = markerRe.exec(html))) {
    const tag = match[1].toLowerCase();
    const attrs = match[2] || "";
    if (hasAttr(attrs, "data-ppt-force-snapshot")) continue;
    const identity = `${attrValue(attrs, "id")} ${attrValue(attrs, "class")}`.toLowerCase();
    const ordinary = /\b(card|panel|metric|kpi|tag|divider|line|circle|title-bar|summary|status|progress|ranking|timeline|process|comparison|compare|target|delta|milestone|risk|problem|conclusion)\b/.test(identity);
    const explicitComplex = /\b(chart|canvas|map|photo|image|screenshot|complex|heatmap)\b/.test(identity);
    if (/^(div|section|article|aside|span|hr)$/i.test(tag) && ordinary && !explicitComplex) {
      warnings.push(`${descriptor(tag, attrs)} has a screenshot marker; ordinary BGY shapes should stay native PPT shapes.`);
    }
    if (/^(body|main|section)$/i.test(tag) && /(?:slide|page|canvas)/i.test(identity) && !hasAttr(attrs, "data-ppt-allow-large-snapshot")) {
      warnings.push(`${descriptor(tag, attrs)} may become a large screenshot; only allow this with data-ppt-allow-large-snapshot after accepting editability loss.`);
    }
  }
}

function checkManualBullets(html, warnings) {
  const blockRe = /<(p|div|span|h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let match;
  while ((match = blockRe.exec(html))) {
    const raw = match[2].replace(/<[^>]+>/g, "").trimStart();
    if (/^(?:[-*]|\u2022|\u25cf|\u25cb|\u25a0|\u25aa|\u2713)\s+/.test(raw)) {
      warnings.push(`<${match[1].toLowerCase()}> starts with a manual bullet; use <ul><li> so PPTX exports native bullets.`);
    }
  }
}

function scanFile(file, opts) {
  const html = fs.readFileSync(file, "utf8");
  const cleanHtml = stripComments(html);
  const lowerName = path.basename(file).toLowerCase();
  const errors = [];
  const warnings = [];

  if (opts.html && (lowerName === "index.html" || lowerName === "index.htm" || /<iframe\b/i.test(cleanHtml))) {
    errors.push("Do not convert the iframe/index overview into PPTX; pass --slides-dir <project>/slides instead.");
  }
  if (!opts.html && /<iframe\b/i.test(cleanHtml)) {
    warnings.push("Slide file contains an iframe; PPTX conversion usually needs the actual slide HTML, not embedded pages.");
  }

  checkSnapshotMarkers(cleanHtml, warnings);
  checkGlobalCss(cleanHtml, file, warnings);
  checkIconLibraries(cleanHtml, warnings);
  checkProjectContract(cleanHtml, file, opts.project, warnings);
  checkTags(cleanHtml, warnings);
  checkSvg(cleanHtml, warnings);
  checkTables(cleanHtml, warnings);
  checkManualBullets(cleanHtml, warnings);

  if (hasDirectTitleText(cleanHtml)) {
    warnings.push("title-bar contains direct text; wrap page number and title in child spans/headings for stable PPTX text boxes.");
  }

  return { file, errors, warnings };
}

function main() {
  const opts = parseArgs();
  const projectRoot = absolutePath(opts.projectRoot) ||
    inferProjectRootFromInput(opts.slidesDir || opts.html);
  if (projectRoot) {
    const configFile = path.join(projectRoot, "bgy.project.json");
    opts.project = {
      root: projectRoot,
      config: readProjectConfig(projectRoot),
      missingConfig: !fs.existsSync(configFile),
    };
  } else {
    opts.project = null;
  }
  const results = htmlInputs(opts).map(file => scanFile(file, opts));
  const errors = results.flatMap(result => result.errors.map(text => ({ file: result.file, text })));
  const warnings = results.flatMap(result => result.warnings.map(text => ({ file: result.file, text })));

  console.log("BGY PPTX preflight");
  console.log(`Files: ${results.length}`);
  if (opts.project) {
    console.log(`Project: ${opts.project.root}`);
    console.log(`Preset: ${opts.project.config.project.preset}; locked=${opts.project.config.locked ? "yes" : "no"}`);
  }
  warnings.forEach(item => console.warn(`Warning: ${item.file}: ${item.text}`));
  errors.forEach(item => console.error(`Error: ${item.file}: ${item.text}`));
  if (errors.length > 0 || (opts.strict && warnings.length > 0)) {
    console.error(`Result: FAIL (${errors.length} error(s), ${warnings.length} warning(s))`);
    process.exit(1);
  }
  console.log(`Result: PASS (${warnings.length} warning(s))`);
}

try {
  main();
} catch (err) {
  console.error(err.message || err);
  process.exit(1);
}
