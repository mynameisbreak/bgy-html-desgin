#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const ICON_ROOT = path.join(ROOT, "assets", "icons");
const SVG_ROOT = path.join(ROOT, "assets", "svg");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function attrs(extra = "") {
  return `fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"${extra ? ` ${extra}` : ""}`;
}

function svg(body, extra = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"${extra ? ` ${extra}` : ""}>\n${body}\n</svg>\n`;
}

function solidSvg(body, extra = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"${extra ? ` ${extra}` : ""}>\n${body}\n</svg>\n`;
}

function pathEl(d) {
  return `  <path ${attrs()} d="${d}"/>`;
}

function circle(cx, cy, r) {
  return `  <circle ${attrs()} cx="${cx}" cy="${cy}" r="${r}"/>`;
}

function rect(x, y, w, h, rx = 2) {
  return `  <rect ${attrs()} x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>`;
}

function line(x1, y1, x2, y2) {
  return `  <line ${attrs()} x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
}

function polyline(points) {
  return `  <polyline ${attrs()} points="${points}"/>`;
}

const lineIcons = {
  check: [polyline("20 6 9 17 4 12")],
  alert: [pathEl("M12 3 22 20H2L12 3Z"), line(12, 9, 12, 13), line(12, 17, 12.01, 17)],
  trendUp: [polyline("3 17 9 11 13 15 21 7"), polyline("15 7 21 7 21 13")],
  trendDown: [polyline("3 7 9 13 13 9 21 17"), polyline("15 17 21 17 21 11")],
  calendar: [rect(3, 5, 18, 16, 2), line(8, 3, 8, 7), line(16, 3, 16, 7), line(3, 10, 21, 10)],
  clock: [circle(12, 12, 9), polyline("12 7 12 12 16 14")],
  fileText: [pathEl("M6 3h8l4 4v14H6V3Z"), pathEl("M14 3v5h5"), line(8, 12, 16, 12), line(8, 16, 16, 16)],
  clipboard: [rect(5, 4, 14, 17, 2), pathEl("M9 4a3 3 0 0 1 6 0"), line(9, 10, 15, 10), line(9, 14, 15, 14)],
  users: [circle(9, 8, 3), pathEl("M3 20a6 6 0 0 1 12 0"), circle(17, 9, 2.5), pathEl("M14.5 18.5A5 5 0 0 1 21 20")],
  building: [rect(4, 3, 16, 18, 1.5), line(8, 7, 8, 7.01), line(12, 7, 12, 7.01), line(16, 7, 16, 7.01), line(8, 12, 8, 12.01), line(12, 12, 12, 12.01), line(16, 12, 16, 12.01), pathEl("M10 21v-4h4v4")],
  wrench: [pathEl("M20 7.5a5 5 0 0 1-6.5 6.5L7 20.5 3.5 17l6.5-6.5A5 5 0 0 1 16.5 4L14 6.5 17.5 10 20 7.5Z")],
  shield: [pathEl("M12 3 20 6v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6l8-3Z"), polyline("8.5 12 11 14.5 16 9.5")],
  phone: [pathEl("M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"), line(11, 18, 13, 18)],
  search: [circle(11, 11, 7), line(16, 16, 21, 21)],
  mapPin: [pathEl("M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z"), circle(12, 10, 2.5)],
  database: [pathEl("M5 6c0-2 14-2 14 0s-14 2-14 0Z"), pathEl("M5 6v6c0 2 14 2 14 0V6"), pathEl("M5 12v6c0 2 14 2 14 0v-6")],
  chartBar: [line(4, 20, 20, 20), rect(6, 11, 3, 7, 1), rect(11, 7, 3, 11, 1), rect(16, 4, 3, 14, 1)],
  chartLine: [line(4, 20, 20, 20), line(4, 20, 4, 4), polyline("6 16 10 11 14 13 19 7")],
  pie: [pathEl("M12 3v9h9A9 9 0 1 1 12 3Z"), pathEl("M15 3.5A9 9 0 0 1 20.5 9H15V3.5Z")],
  send: [pathEl("M21 3 10 14"), pathEl("M21 3 14 21 10 14 3 10 21 3Z")],
};

const businessIcons = {
  workOrder: [rect(4, 4, 16, 16, 2), line(8, 8, 16, 8), line(8, 12, 16, 12), polyline("8 16 10 18 16 14")],
  engineering: [pathEl("M4 20h16"), pathEl("M7 20V9l5-4 5 4v11"), pathEl("M10 20v-5h4v5"), line(8, 12, 16, 12)],
  patrol: [pathEl("M12 3 20 7v5c0 4.5-3.2 7.5-8 9-4.8-1.5-8-4.5-8-9V7l8-4Z"), pathEl("M9 12l2 2 4-5")],
  fire: [pathEl("M12 21c4 0 7-2.7 7-6.7 0-3.2-2-5-4-7.3-.3 2-1.2 3.2-2.3 4.2.2-3.3-1.4-6.1-4.7-8.2.3 4.3-3 6.2-3 11.2C5 18.3 8 21 12 21Z")],
  customer: [circle(12, 8, 3.5), pathEl("M5 20a7 7 0 0 1 14 0"), pathEl("M17 7h3v5l-2-1.5")],
  community: [pathEl("M4 20V9l4-3 4 3v11"), pathEl("M12 20V9l4-3 4 3v11"), line(7, 12, 9, 12), line(15, 12, 17, 12)],
  fee: [circle(12, 12, 8), pathEl("M8.5 9h7"), pathEl("M8.5 12h6"), pathEl("M12 9v8"), pathEl("M9 17h6")],
  energy: [pathEl("M13 2 5 13h6l-1 9 8-12h-6l1-8Z")],
  quality: [pathEl("M12 3 20 7v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4Z"), circle(12, 12, 3), pathEl("M12 9v3l2 1")],
  parking: [rect(4, 4, 16, 16, 3), pathEl("M9 17V7h4a3 3 0 0 1 0 6H9")],
  elevator: [rect(6, 3, 12, 18, 2), polyline("10 8 12 6 14 8"), polyline("10 16 12 18 14 16"), line(6, 11, 18, 11)],
  inspection: [rect(5, 3, 14, 18, 2), pathEl("M9 7h6"), pathEl("M8 12l2 2 4-4"), pathEl("M8 17h7")],
};

const solidIcons = {
  statusDone: `  <circle fill="currentColor" cx="12" cy="12" r="10"/>\n  <path d="M7 12.3 10.3 15.5 17.5 8.5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
  statusRisk: `  <path fill="currentColor" d="M12 3 22 20H2L12 3Z"/>\n  <path d="M12 9v4" stroke="#fff" stroke-width="2" stroke-linecap="round"/>\n  <circle fill="#fff" cx="12" cy="17" r="1.2"/>`,
  statusPending: `  <circle fill="currentColor" cx="12" cy="12" r="10"/>\n  <path d="M8 12h8" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`,
  statusProgress: `  <circle fill="currentColor" cx="12" cy="12" r="10"/>\n  <path d="M12 6v6l4 2" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
  statusCoordinate: `  <rect fill="currentColor" x="4" y="4" width="16" height="16" rx="4"/>\n  <path d="M8 12h8M12 8v8" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`,
};

const diagrams = {
  processArrow: svg([
    line(3, 12, 19, 12),
    polyline("15 7 20 12 15 17"),
  ].join("\n")),
  closedLoop: svg([
    pathEl("M7 6a8 8 0 0 1 11 3"),
    polyline("18 4 18 9 13 9"),
    pathEl("M17 18a8 8 0 0 1-11-3"),
    polyline("6 20 6 15 11 15"),
  ].join("\n")),
  milestoneAxis: svg([
    line(3, 12, 21, 12),
    circle(5, 12, 1.5),
    circle(12, 12, 1.5),
    circle(19, 12, 1.5),
  ].join("\n")),
  matrixFrame: svg([
    rect(4, 4, 16, 16, 1),
    line(12, 4, 12, 20),
    line(4, 12, 20, 12),
  ].join("\n")),
};

const emptyStates = {
  missingMaterial: svg([
    rect(5, 4, 14, 16, 2),
    pathEl("M9 4v5h6"),
    line(8, 14, 16, 14),
    line(8, 17, 13, 17),
  ].join("\n")),
  noData: svg([
    pathEl("M5 6c0-2 14-2 14 0s-14 2-14 0Z"),
    pathEl("M5 6v8c0 2 14 2 14 0V6"),
    line(8, 19, 16, 11),
  ].join("\n")),
  screenshotPlaceholder: svg([
    rect(4, 5, 16, 12, 2),
    line(8, 20, 16, 20),
    line(12, 17, 12, 20),
    polyline("7 14 10 11 12 13 15 9 18 14"),
  ].join("\n")),
};

const patterns = {
  bgyGridDots: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80">\n  <g fill="currentColor" opacity="0.18">\n    <circle cx="12" cy="12" r="1.2"/><circle cx="36" cy="12" r="1.2"/><circle cx="60" cy="12" r="1.2"/><circle cx="84" cy="12" r="1.2"/><circle cx="108" cy="12" r="1.2"/>\n    <circle cx="24" cy="34" r="1.2"/><circle cx="48" cy="34" r="1.2"/><circle cx="72" cy="34" r="1.2"/><circle cx="96" cy="34" r="1.2"/>\n    <circle cx="12" cy="56" r="1.2"/><circle cx="36" cy="56" r="1.2"/><circle cx="60" cy="56" r="1.2"/><circle cx="84" cy="56" r="1.2"/><circle cx="108" cy="56" r="1.2"/>\n  </g>\n</svg>\n`,
  bgyCornerFrame: svg([
    pathEl("M4 10V4h6"),
    pathEl("M20 14v6h-6"),
    line(4, 20, 9, 20),
    line(20, 4, 15, 4),
  ].join("\n")),
};

function writeCollection(dirName, icons, mode = "line") {
  const dir = path.join(ICON_ROOT, dirName);
  ensureDir(dir);
  Object.entries(icons).forEach(([name, body]) => {
    const content = Array.isArray(body)
      ? svg(body.join("\n"))
      : solidSvg(body);
    fs.writeFileSync(path.join(dir, `${name}.svg`), content, "utf8");
  });
}

function writeSvgCollection(dirName, items) {
  const dir = path.join(SVG_ROOT, dirName);
  ensureDir(dir);
  Object.entries(items).forEach(([name, content]) => {
    fs.writeFileSync(path.join(dir, `${name}.svg`), content, "utf8");
  });
}

function buildSprite() {
  const symbols = [];
  const addSymbols = (prefix, icons) => {
    Object.entries(icons).forEach(([name, body]) => {
      const content = Array.isArray(body) ? body.join("\n").replace(/^/gm, "    ") : body.replace(/^/gm, "    ");
      symbols.push(`  <symbol id="bgy-${prefix}-${name}" viewBox="0 0 24 24">\n${content}\n  </symbol>`);
    });
  };
  addSymbols("line", lineIcons);
  addSymbols("business", businessIcons);
  addSymbols("solid", solidIcons);
  const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n${symbols.join("\n")}\n</svg>\n`;
  const dir = path.join(ICON_ROOT, "inline");
  ensureDir(dir);
  fs.writeFileSync(path.join(dir, "bgy-icon-sprite.svg"), sprite, "utf8");
}

writeCollection("line", lineIcons);
writeCollection("bgy-business", businessIcons);
writeCollection("solid", solidIcons, "solid");
writeSvgCollection("diagrams", diagrams);
writeSvgCollection("empty-states", emptyStates);
writeSvgCollection("patterns", patterns);
buildSprite();

console.log("BGY icon/SVG assets generated.");
