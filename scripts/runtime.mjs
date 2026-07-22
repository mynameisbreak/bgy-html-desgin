import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const requireFromHere = createRequire(import.meta.url);

export function absolutePath(value, base = process.cwd()) {
  if (!value || String(value).trim() === "") return "";
  return path.isAbsolute(value) ? value : path.resolve(base, value);
}

export function resolvePptxRoot(input = "", base = process.cwd()) {
  const candidates = [];
  if (input) candidates.push(absolutePath(input, base));
  candidates.push(path.resolve(scriptDir, "..", "..", "pptx-design"));
  if (process.env.USERPROFILE) {
    candidates.push(path.join(process.env.USERPROFILE, ".codex", "skills", "pptx-design"));
  }

  for (const candidate of candidates) {
    if (candidate && fs.existsSync(path.join(candidate, "scripts", "html-to-pptx.js"))) {
      return candidate;
    }
  }
  throw new Error("Cannot locate pptx-design. Pass --pptx-root <dir>.");
}

export function loadPlaywright(pptxRoot = "") {
  const resolvedPptxRoot = resolvePptxRoot(pptxRoot);
  const searchPaths = [
    path.join(resolvedPptxRoot, "scripts"),
    process.cwd(),
    scriptDir,
  ];
  try {
    const pkgPath = requireFromHere.resolve("playwright", { paths: searchPaths });
    return requireFromHere(pkgPath);
  } catch (err) {
    throw new Error(
      "Playwright is required. Install it once in pptx-design scripts with " +
      "`npm --prefix <pptx-design>/scripts install`, or pass --pptx-root to a configured pptx-design skill."
    );
  }
}

export async function launchBrowser({ browserChannel = "", pptxRoot = "", headless = true } = {}) {
  const { chromium } = loadPlaywright(pptxRoot);
  const candidates = browserChannel ? [browserChannel] : [undefined, "msedge", "chrome"];
  const errors = [];
  for (const channel of candidates) {
    try {
      return await chromium.launch({
        ...(channel ? { channel } : {}),
        headless,
      });
    } catch (err) {
      errors.push(`${channel || "bundled chromium"}: ${err.message.split("\n")[0]}`);
    }
  }
  throw new Error(`Unable to launch a Chromium browser. Tried ${errors.join("; ")}`);
}
