#!/usr/bin/env node
import { spawnSync } from "child_process";
import path from "path";
import { absolutePath, resolvePptxRoot, scriptDir } from "./runtime.mjs";

const RUN_CWD = process.cwd();

function usage() {
  console.log(`
Usage:
  node export_bgy_pptx.mjs --slides-dir <slides/> --out <deck.pptx> [--mode draft|normal|final]
  node export_bgy_pptx.mjs --html <deck.html> --out <deck.pptx> [--mode draft|normal|final]

Modes:
  draft   fastest: lower screenshot scale, no PPTX zip validation, no audit
  normal  default: fast native-object conversion plus built-in PPTX validation
  final   delivery: strict authoring plus audit-pptx --strict

Options:
  --pptx-root <dir>          Path to pptx-design root. Default: sibling ../pptx-design.
  --template-pptx <file>     Match a target PPTX slide size.
  --browser-channel <name>   Playwright browser channel, e.g. msedge.
  --audit                    Run audit-pptx after conversion.
  --strict-audit             Make audit warnings fail.
  --strict-authoring         Fail on HTML patterns that do not convert cleanly.
  --no-preflight             Skip BGY static PPTX authoring checks.
  --debug-overlay            Emit element routing overlay images.
  --keep-assets              Keep temporary screenshots for diagnosis.
`);
}

function parseArgs() {
  const opts = {
    html: "",
    slidesDir: "",
    out: "",
    mode: "normal",
    width: "1280",
    height: "720",
    pptxRoot: "",
    templatePptx: "",
    browserChannel: "",
    forceFontFace: "",
    waitUntil: "",
    settle: "",
    imageDecodeTimeout: "",
    screenshotScale: "",
    audit: false,
    strictAudit: false,
    strictAuthoring: false,
    debugOverlay: false,
    keepAssets: false,
    noNativeSafety: false,
    allowLargeSnapshots: false,
    noValidate: false,
    preflight: true,
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
    } else if ((key === "--slides-dir" || key === "--slides") && next) {
      opts.slidesDir = next; i++;
    } else if (key === "--out" && next) {
      opts.out = next; i++;
    } else if (key === "--mode" && next) {
      opts.mode = next; i++;
    } else if (key === "--width" && next) {
      opts.width = next; i++;
    } else if (key === "--height" && next) {
      opts.height = next; i++;
    } else if (key === "--pptx-root" && next) {
      opts.pptxRoot = next; i++;
    } else if (key === "--template-pptx" && next) {
      opts.templatePptx = next; i++;
    } else if (key === "--browser-channel" && next) {
      opts.browserChannel = next; i++;
    } else if (key === "--force-font-face" && next) {
      opts.forceFontFace = next; i++;
    } else if (key === "--wait-until" && next) {
      opts.waitUntil = next; i++;
    } else if (key === "--settle" && next) {
      opts.settle = next; i++;
    } else if (key === "--image-decode-timeout" && next) {
      opts.imageDecodeTimeout = next; i++;
    } else if (key === "--screenshot-scale" && next) {
      opts.screenshotScale = next; i++;
    } else if (key === "--audit") {
      opts.audit = true;
    } else if (key === "--strict-audit") {
      opts.audit = true; opts.strictAudit = true;
    } else if (key === "--strict-authoring") {
      opts.strictAuthoring = true;
    } else if (key === "--no-preflight") {
      opts.preflight = false;
    } else if (key === "--debug-overlay") {
      opts.debugOverlay = true;
    } else if (key === "--keep-assets") {
      opts.keepAssets = true;
    } else if (key === "--no-native-safety") {
      opts.noNativeSafety = true;
    } else if (key === "--allow-large-snapshots") {
      opts.allowLargeSnapshots = true;
    } else if (key === "--no-validate") {
      opts.noValidate = true;
    } else {
      throw new Error(`Unknown argument: ${key}`);
    }
  }

  opts.mode = String(opts.mode || "normal").toLowerCase();
  if (!["draft", "normal", "final"].includes(opts.mode)) {
    throw new Error("--mode must be draft, normal, or final.");
  }
  if (!opts.html && !opts.slidesDir) throw new Error("Missing --html or --slides-dir.");
  if (opts.html && opts.slidesDir) throw new Error("Use either --html or --slides-dir, not both.");
  if (!opts.out) throw new Error("Missing --out.");

  if (opts.mode === "draft") {
    opts.noValidate = true;
    if (!opts.screenshotScale) opts.screenshotScale = "1";
    if (!opts.waitUntil) opts.waitUntil = "domcontentloaded";
    if (!opts.imageDecodeTimeout) opts.imageDecodeTimeout = "3000";
    if (!opts.settle) opts.settle = "0";
  } else if (opts.mode === "normal") {
    if (!opts.screenshotScale) opts.screenshotScale = "1";
    if (!opts.waitUntil) opts.waitUntil = "domcontentloaded";
    if (!opts.imageDecodeTimeout) opts.imageDecodeTimeout = "3000";
    if (!opts.settle) opts.settle = "0";
  } else if (opts.mode === "final") {
    if (!opts.screenshotScale) opts.screenshotScale = "1.25";
    if (!opts.waitUntil) opts.waitUntil = "load";
    if (!opts.imageDecodeTimeout) opts.imageDecodeTimeout = "10000";
    if (!opts.settle) opts.settle = "100";
    opts.audit = true;
    opts.strictAudit = true;
    opts.strictAuthoring = true;
  }
  return opts;
}

function pushPair(args, key, value) {
  if (value !== undefined && value !== null && String(value).trim() !== "") {
    args.push(key, String(value));
  }
}

function runStep(label, scriptPath, args, cwd) {
  const started = Date.now();
  console.log(`\n${label}`);
  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    cwd,
    env: { ...process.env, INIT_CWD: RUN_CWD },
    stdio: "inherit",
    windowsHide: true,
  });
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  console.log(`${label} elapsed: ${seconds}s`);
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

const opts = parseArgs();
const pptxRoot = resolvePptxRoot(opts.pptxRoot, RUN_CWD);
const pptxScripts = path.join(pptxRoot, "scripts");
const convertScript = path.join(pptxScripts, "html-to-pptx.js");
const auditScript = path.join(pptxScripts, "audit-pptx.js");
const preflightScript = path.join(scriptDir, "pptx_preflight.mjs");
opts.html = absolutePath(opts.html, RUN_CWD);
opts.slidesDir = absolutePath(opts.slidesDir, RUN_CWD);
opts.out = absolutePath(opts.out, RUN_CWD);
opts.templatePptx = absolutePath(opts.templatePptx, RUN_CWD);

const convertArgs = [];
if (opts.slidesDir) pushPair(convertArgs, "--slides-dir", opts.slidesDir);
else pushPair(convertArgs, "--html", opts.html);
pushPair(convertArgs, "--out", opts.out);
pushPair(convertArgs, "--width", opts.width);
pushPair(convertArgs, "--height", opts.height);
pushPair(convertArgs, "--wait-until", opts.waitUntil);
pushPair(convertArgs, "--image-decode-timeout", opts.imageDecodeTimeout);
pushPair(convertArgs, "--settle", opts.settle);
pushPair(convertArgs, "--screenshot-scale", opts.screenshotScale);
pushPair(convertArgs, "--template-pptx", opts.templatePptx);
pushPair(convertArgs, "--browser-channel", opts.browserChannel);
pushPair(convertArgs, "--force-font-face", opts.forceFontFace);
if (opts.strictAuthoring) convertArgs.push("--strict-authoring");
if (opts.debugOverlay) convertArgs.push("--debug-overlay");
if (opts.keepAssets) convertArgs.push("--keep-assets");
if (opts.noNativeSafety) convertArgs.push("--no-native-safety");
if (opts.allowLargeSnapshots) convertArgs.push("--allow-large-snapshots");
if (opts.noValidate) convertArgs.push("--no-validate");

console.log(`BGY PPTX export mode: ${opts.mode}`);
console.log(`pptx-design: ${pptxRoot}`);
const totalStarted = Date.now();

if (opts.preflight) {
  const preflightArgs = [];
  if (opts.slidesDir) pushPair(preflightArgs, "--slides-dir", opts.slidesDir);
  else pushPair(preflightArgs, "--html", opts.html);
  if (opts.mode === "final" || opts.strictAuthoring) preflightArgs.push("--strict");
  runStep("Preflight BGY PPTX HTML", preflightScript, preflightArgs, scriptDir);
}

runStep("Convert HTML to PPTX", convertScript, convertArgs, pptxScripts);

if (opts.audit) {
  const auditArgs = [opts.out];
  if (opts.strictAudit) auditArgs.push("--strict");
  runStep("Audit PPTX", auditScript, auditArgs, pptxScripts);
}

console.log(`\nDone. Total elapsed: ${((Date.now() - totalStarted) / 1000).toFixed(1)}s`);
