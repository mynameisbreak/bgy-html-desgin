#!/usr/bin/env node
import path from "path";
import { absolutePath } from "./runtime.mjs";
import { readProjectConfig } from "./project_config.mjs";
import { writeProjectFiles } from "./project_files.mjs";

function usage() {
  console.log(`
Usage:
  node sync_bgy_project.mjs --root <project-dir>

Regenerates:
  shared/tokens.css
  shared/components.css
  project-config.html
  project-style-board.html
`);
}

function parseArgs() {
  const opts = { root: "" };
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const key = args[i];
    const next = args[i + 1];
    if (key === "--help" || key === "-h") {
      usage();
      process.exit(0);
    } else if ((key === "--root" || key === "--dir" || key === "--project") && next) {
      opts.root = next; i++;
    } else if (!key.startsWith("--") && !opts.root) {
      opts.root = key;
    } else {
      throw new Error(`Unknown argument: ${key}`);
    }
  }
  if (!opts.root) throw new Error("Missing --root.");
  opts.root = absolutePath(opts.root);
  return opts;
}

try {
  const opts = parseArgs();
  const config = readProjectConfig(opts.root);
  const result = writeProjectFiles(opts.root, config, {
    copyPresets: true,
    copyTemplate: true,
    writeIndex: false,
    writeDeck: false,
    writeStarterSlide: false,
  });
  console.log("BGY project synchronized");
  console.log(`Root: ${path.resolve(opts.root)}`);
  result.files.forEach(file => console.log(`  ${file}`));
} catch (err) {
  console.error(err.message || err);
  process.exit(1);
}
