#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { absolutePath } from "./runtime.mjs";

function usage() {
  console.log(`
Usage:
  node pptx_preflight.mjs --slides-dir <slides/> [--strict]
  node pptx_preflight.mjs --html <slide.html> [--strict]
`);
}

function parseArgs() {
  const opts = { html: "", slidesDir: "", strict: false };
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
    const ordinary = /\b(card|panel|metric|kpi|tag|divider|line|circle|title-bar|summary|status)\b/.test(identity);
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
  const results = htmlInputs(opts).map(file => scanFile(file, opts));
  const errors = results.flatMap(result => result.errors.map(text => ({ file: result.file, text })));
  const warnings = results.flatMap(result => result.warnings.map(text => ({ file: result.file, text })));

  console.log("BGY PPTX preflight");
  console.log(`Files: ${results.length}`);
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
