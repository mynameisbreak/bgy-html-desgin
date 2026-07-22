#!/usr/bin/env node
import path from "path";
import { absolutePath } from "./runtime.mjs";
import { buildDefaultProjectConfig } from "./project_config.mjs";
import { writeProjectFiles } from "./project_files.mjs";

function usage() {
  console.log(`
Usage:
  node init_bgy_project.mjs --dir <project-dir> --title <title> [--preset management-report] [--locked]

Options:
  --dir <dir>       Project root to create.
  --title <title>   Project title.
  --name <name>     Stable project name. Default: directory name.
  --type <type>     Project type. Default: preset name.
  --preset <id>     Built-in preset: management-report, monthly-review, proposal,
                   maintenance, quality-improvement, fire-safety.
  --locked          Create bgy.project.json as locked.
  --preview-only    Mark project as HTML preview first, not editable PPTX.
`);
}

function parseArgs() {
  const opts = {
    dir: "",
    title: "",
    name: "",
    type: "",
    preset: "management-report",
    locked: false,
    editablePptx: true,
  };
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const key = args[i];
    const next = args[i + 1];
    if (key === "--help" || key === "-h") {
      usage();
      process.exit(0);
    } else if (key === "--dir" && next) {
      opts.dir = next; i++;
    } else if (key === "--title" && next) {
      opts.title = next; i++;
    } else if (key === "--name" && next) {
      opts.name = next; i++;
    } else if (key === "--type" && next) {
      opts.type = next; i++;
    } else if (key === "--preset" && next) {
      opts.preset = next; i++;
    } else if (key === "--locked") {
      opts.locked = true;
    } else if (key === "--preview-only") {
      opts.editablePptx = false;
    } else if (!key.startsWith("--") && !opts.dir) {
      opts.dir = key;
    } else {
      throw new Error(`Unknown argument: ${key}`);
    }
  }

  if (!opts.dir) throw new Error("Missing --dir.");
  opts.dir = absolutePath(opts.dir);
  if (!opts.title) opts.title = path.basename(opts.dir);
  if (!opts.name) opts.name = path.basename(opts.dir);
  return opts;
}

try {
  const opts = parseArgs();
  const config = buildDefaultProjectConfig({
    title: opts.title,
    projectName: opts.name,
    preset: opts.preset,
    type: opts.type,
    locked: opts.locked,
    editablePptx: opts.editablePptx,
  });
  const result = writeProjectFiles(opts.dir, config);
  console.log("BGY project initialized");
  console.log(`Root: ${opts.dir}`);
  console.log(`Preset: ${config.project.preset}`);
  console.log(`Locked: ${config.locked ? "yes" : "no"}`);
  result.files.forEach(file => console.log(`  ${file}`));
  console.log("\nPreview/config:");
  console.log(`  npm --prefix <bgy-html-design>/scripts run serve -- --root "${opts.dir}" --entry project-config.html --project-api --open`);
} catch (err) {
  console.error(err.message || err);
  process.exit(1);
}
