#!/usr/bin/env node
import fs from "fs";
import path from "path";
import readline from "readline";
import { pathToFileURL } from "url";
import { absolutePath, launchBrowser } from "./runtime.mjs";

function usage() {
  console.log(`
Usage:
  node verify_html.mjs <html-or-url> [--viewports 1280x720] [--slides <n>]
  node verify_html.mjs --html <html-or-url> [--output screenshots]

Options:
  --html <path|url>          HTML file path or http(s)/file URL. Positional input is also accepted.
  --viewports <list>         Comma-separated viewport list. Default: 1280x720.
  --slides <n>               Capture the first N slides by pressing ArrowRight.
  --output <dir>             Screenshot output directory. Default: <html-dir>/screenshots.
  --show                     Run a headed browser and wait for Enter before closing.
  --wait <ms>                Extra wait after load. Default: 500.
  --wait-until <state>       load, domcontentloaded, or networkidle. Default: load.
  --scale <n>                Device scale factor. Default: 1.
  --full-page                Also capture full-page screenshots for non-slide mode.
  --browser-channel <name>   Browser channel, e.g. msedge.
  --pptx-root <dir>          pptx-design root that provides Playwright.
`);
}

function parseViewport(value) {
  const match = String(value || "").trim().match(/^(\d+)x(\d+)$/i);
  if (!match) throw new Error(`Invalid viewport: ${value}`);
  return { width: Number(match[1]), height: Number(match[2]) };
}

function parseArgs() {
  const opts = {
    html: "",
    viewports: "1280x720",
    slides: 0,
    output: "",
    show: false,
    wait: 500,
    waitUntil: "load",
    scale: 1,
    fullPage: false,
    browserChannel: "",
    pptxRoot: "",
  };
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const key = args[i];
    const next = args[i + 1];
    if (key === "--help" || key === "-h") {
      usage();
      process.exit(0);
    } else if (key === "--html" && next) {
      opts.html = next; i++;
    } else if (key === "--viewports" && next) {
      opts.viewports = next; i++;
    } else if (key === "--slides" && next) {
      opts.slides = Math.max(0, Number(next) || 0); i++;
    } else if (key === "--output" && next) {
      opts.output = next; i++;
    } else if (key === "--show") {
      opts.show = true;
    } else if (key === "--wait" && next) {
      opts.wait = Math.max(0, Number(next) || 0); i++;
    } else if (key === "--wait-until" && next) {
      opts.waitUntil = next; i++;
    } else if (key === "--scale" && next) {
      opts.scale = Math.max(0.1, Number(next) || 1); i++;
    } else if (key === "--full-page") {
      opts.fullPage = true;
    } else if (key === "--browser-channel" && next) {
      opts.browserChannel = next; i++;
    } else if (key === "--pptx-root" && next) {
      opts.pptxRoot = next; i++;
    } else if (!key.startsWith("--") && !opts.html) {
      opts.html = key;
    } else {
      throw new Error(`Unknown argument: ${key}`);
    }
  }
  if (!opts.html) throw new Error("Missing HTML input.");
  if (!["load", "domcontentloaded", "networkidle"].includes(opts.waitUntil)) {
    throw new Error("--wait-until must be load, domcontentloaded, or networkidle.");
  }
  opts.viewportList = opts.viewports.split(",").filter(Boolean).map(parseViewport);
  return opts;
}

function inputInfo(value) {
  if (/^https?:\/\//i.test(value) || /^file:\/\//i.test(value)) {
    const url = value;
    const parsed = new URL(url);
    const stem = path.basename(parsed.pathname || "page").replace(/\.[^.]+$/, "") || "page";
    return { url, stem, outputBase: process.cwd() };
  }

  const file = absolutePath(value);
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    throw new Error(`HTML file not found: ${file}`);
  }
  return {
    url: pathToFileURL(file).href,
    file,
    stem: path.basename(file, path.extname(file)),
    outputBase: path.dirname(file),
  };
}

function waitForEnter() {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question("Browser window is open. Press Enter to close...", () => {
      rl.close();
      resolve();
    });
  });
}

async function waitForStablePaint(page, waitMs) {
  await page.evaluate(() => {
    if (!document.fonts || !document.fonts.ready) return true;
    return Promise.race([
      document.fonts.ready.then(() => true),
      new Promise(resolve => setTimeout(() => resolve(false), 1000)),
    ]);
  }).catch(() => {});
  if (waitMs > 0) await page.waitForTimeout(waitMs);
}

async function verifyHtml(opts) {
  const input = inputInfo(opts.html);
  const outputDir = absolutePath(opts.output || path.join(input.outputBase, "screenshots"));
  fs.mkdirSync(outputDir, { recursive: true });

  const consoleMessages = [];
  const pageErrors = [];
  const browser = await launchBrowser({
    browserChannel: opts.browserChannel,
    pptxRoot: opts.pptxRoot,
    headless: !opts.show,
  });

  try {
    for (const viewport of opts.viewportList) {
      const context = await browser.newContext({
        viewport,
        deviceScaleFactor: opts.scale,
      });
      const page = await context.newPage();
      page.on("console", msg => {
        if (msg.type() === "error" || msg.type() === "warning") {
          consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
        }
      });
      page.on("pageerror", err => pageErrors.push(err.message || String(err)));

      console.log(`Open ${input.url} @ ${viewport.width}x${viewport.height}`);
      await page.goto(input.url, { waitUntil: opts.waitUntil, timeout: 60000 });
      await waitForStablePaint(page, opts.wait);

      if (opts.slides > 0) {
        for (let index = 0; index < opts.slides; index++) {
          const screenshotPath = path.join(outputDir, `${input.stem}-slide-${String(index + 1).padStart(2, "0")}.png`);
          await page.screenshot({ path: screenshotPath, fullPage: false, animations: "disabled" });
          console.log(`  [ok] slide ${index + 1} -> ${path.basename(screenshotPath)}`);
          if (index < opts.slides - 1) {
            await page.keyboard.press("ArrowRight");
            await page.waitForTimeout(300);
          }
        }
      } else {
        const suffix = opts.viewportList.length > 1 ? `-${viewport.width}x${viewport.height}` : "";
        const screenshotPath = path.join(outputDir, `${input.stem}${suffix}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: false, animations: "disabled" });
        console.log(`  [ok] screenshot -> ${path.basename(screenshotPath)}`);

        if (opts.fullPage) {
          const fullPath = path.join(outputDir, `${input.stem}${suffix}-full.png`);
          await page.screenshot({ path: fullPath, fullPage: true, animations: "disabled" });
          console.log(`  [ok] full page -> ${path.basename(fullPath)}`);
        }
      }

      if (opts.show) await waitForEnter();
      await context.close();
    }
  } finally {
    await browser.close();
  }

  console.log("\nVerification report");
  console.log("=".repeat(50));
  if (pageErrors.length > 0) {
    console.log(`Page errors (${pageErrors.length}):`);
    pageErrors.forEach(error => console.log(`  - ${error}`));
  } else {
    console.log("No JavaScript page errors.");
  }

  if (consoleMessages.length > 0) {
    console.log(`Console warnings/errors (${consoleMessages.length}):`);
    consoleMessages.slice(0, 20).forEach(message => console.log(`  - ${message}`));
    if (consoleMessages.length > 20) console.log(`  ... ${consoleMessages.length - 20} more`);
  } else {
    console.log("Console is clean.");
  }
  console.log(`Screenshots: ${outputDir}`);
  return pageErrors.length > 0 ? 1 : 0;
}

try {
  const opts = parseArgs();
  const exitCode = await verifyHtml(opts);
  process.exit(exitCode);
} catch (err) {
  console.error(err.message || err);
  process.exit(1);
}
