#!/usr/bin/env node
/**
 * gen_deck_thumbs.mjs — 为多文件 deck 每页生成缩略图（给 deck_index.html 的「无限画廊」概览用）。
 *
 * 背景：deck_index.html 有两种概览——
 *   · 网格 grid（默认 60%）：用 iframe 渲染真实子页面，清晰、所见即所得，无需缩略图。
 *   · 无限画廊 gallery（40%）：把所有页无缝无限平铺 + 缓慢漂移，几十~上百个瓦片若都用 iframe 会很卡，
 *     所以画廊改用 <img> 缩略图——同一张图复用多次浏览器只解码一次，流畅。
 *   本脚本就是给画廊准备这批缩略图。grid 模式不需要它。
 *
 * 用法：
 *   node gen_deck_thumbs.mjs --slides slides --out thumbs [--width 1280] [--quality 86]
 *     [--canvas-w 1280] [--canvas-h 720] [--wait 500] [--wait-until load]
 *     [--browser-channel msedge] [--pptx-root ../pptx-design]
 *
 * 然后在 index.html 的 MANIFEST 给每项加 thumb（与 file 同名 .jpg）：
 *   { file: "slides/01-cover.html", thumb: "thumbs/01-cover.jpg", label: "封面" }
 * deck_index.html 仅在画廊模式用 thumb；网格模式始终用 file(iframe)。没有 thumb 时画廊回退 iframe。
 *
 * 提示：正式画廊需要更高清时，可传 --width 1600；远程资源较多时再提高 --wait 或改用 networkidle。
 */
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { launchBrowser } from './runtime.mjs';

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : d; };
const slidesDir = arg('slides', 'slides');
const outDir = arg('out', 'thumbs');
const width = parseInt(arg('width', '1280'), 10);
const quality = parseInt(arg('quality', '86'), 10);
const W = parseInt(arg('canvas-w', '1280'), 10);
const H = parseInt(arg('canvas-h', '720'), 10);
const waitMs = Math.max(0, parseInt(arg('wait', '500'), 10));
const waitUntil = arg('wait-until', 'load');
const browserChannel = arg('browser-channel', '');
const pptxRoot = arg('pptx-root', '');

if (!fs.existsSync(slidesDir)) { console.error('找不到 slides 目录: ' + slidesDir); process.exit(1); }
fs.mkdirSync(outDir, { recursive: true });
const files = fs.readdirSync(slidesDir)
  .filter(f => /\.html?$/i.test(f))
  .sort((a, b) => a.localeCompare(b, 'zh-CN', { numeric: true, sensitivity: 'base' }));
if (!files.length) { console.error('slides 目录里没有 .html'); process.exit(1); }

const browser = await launchBrowser({ browserChannel, pptxRoot });
const thumbScale = Math.min(2, Math.max(0.1, width / W));
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: thumbScale });
async function waitForStablePaint(page) {
  await page.evaluate(() => {
    if (!document.fonts || !document.fonts.ready) return true;
    return Promise.race([
      document.fonts.ready.then(() => true),
      new Promise(resolve => setTimeout(() => resolve(false), 1000)),
    ]);
  }).catch(() => {});
  if (waitMs > 0) await page.waitForTimeout(waitMs);
}

let ok = 0;
for (const f of files) {
  const base = f.replace(/\.html?$/i, '');
  const out = path.join(outDir, base + '.jpg');
  try {
    await page.goto(pathToFileURL(path.resolve(slidesDir, f)).href, { waitUntil });
    await waitForStablePaint(page);
    await page.screenshot({
      path: out,
      type: 'jpeg',
      quality,
      clip: { x: 0, y: 0, width: W, height: H },
    });
    ok++; console.log('[ok] ' + out);
  } catch (e) { console.error('[FAIL] ' + f + ': ' + e.message); }
}
await browser.close();
console.log(`\n=== ${ok}/${files.length} 张缩略图 → ${outDir}/ ===`);
console.log('在 index.html 的 MANIFEST 每项加 thumb: "' + outDir + '/<同名>.jpg"（仅画廊模式用到）');
