#!/usr/bin/env node
import http from "http";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { absolutePath } from "./runtime.mjs";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".htm": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml; charset=utf-8",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
};

function usage() {
  console.log(`
Usage:
  node serve_deck.mjs [--root <project-dir>] [--entry <index.html>] [--port <n|auto>] [--host <host>]

Options:
  --root <dir>       Static root. Default: current working directory.
  --entry <file>     Entry file served at /. Default: index.html.
  --port <n|auto>    Port. Default: 4173. Use 0 for an OS-assigned port.
  --host <host>      Host. Default: 127.0.0.1.
  --open             Open the entry URL in the default browser.
  --no-cache         Send no-store headers. Default for preview.
  --cache            Allow normal browser caching.
  --smoke            Start, fetch the entry URL once, print PASS/FAIL, then exit.
`);
}

function parseArgs() {
  const opts = {
    root: process.cwd(),
    entry: "index.html",
    port: "4173",
    host: "127.0.0.1",
    open: false,
    noCache: true,
    smoke: false,
  };
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const key = args[i];
    const next = args[i + 1];
    if (key === "--help" || key === "-h") {
      usage();
      process.exit(0);
    } else if (key === "--root" && next) {
      opts.root = next; i++;
    } else if (key === "--entry" && next) {
      opts.entry = next; i++;
    } else if (key === "--port" && next) {
      opts.port = next; i++;
    } else if (key === "--host" && next) {
      opts.host = next; i++;
    } else if (key === "--open") {
      opts.open = true;
    } else if (key === "--no-cache") {
      opts.noCache = true;
    } else if (key === "--cache") {
      opts.noCache = false;
    } else if (key === "--smoke") {
      opts.smoke = true;
    } else {
      throw new Error(`Unknown argument: ${key}`);
    }
  }

  opts.root = absolutePath(opts.root);
  opts.entry = String(opts.entry || "index.html").replace(/^[/\\]+/, "");
  if (!fs.existsSync(opts.root) || !fs.statSync(opts.root).isDirectory()) {
    throw new Error(`Preview root not found: ${opts.root}`);
  }
  opts.root = fs.realpathSync.native(opts.root);
  const entryPath = safeResolve(opts.root, opts.entry);
  if (!fs.existsSync(entryPath) || !fs.statSync(entryPath).isFile()) {
    throw new Error(`Preview entry not found: ${entryPath}`);
  }
  return opts;
}

function normalizeForCompare(filePath) {
  return path.resolve(filePath).toLowerCase();
}

function safeResolve(root, urlPath) {
  const decoded = decodeURIComponent(String(urlPath || "").split("?")[0].split("#")[0]);
  const clean = decoded.replace(/^[/\\]+/, "") || "index.html";
  const resolved = path.resolve(root, clean);
  const rootResolved = fs.realpathSync.native(root);
  const resolvedForCompare = fs.existsSync(resolved) ? fs.realpathSync.native(resolved) : resolved;
  const resolvedLower = normalizeForCompare(resolvedForCompare);
  const rootLower = normalizeForCompare(rootResolved);
  if (resolvedLower !== rootLower && !resolvedLower.startsWith(rootLower + path.sep.toLowerCase())) {
    throw new Error("Path escapes preview root.");
  }
  return resolvedForCompare;
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    ...headers,
  });
  res.end(body);
}

function createServer(opts) {
  return http.createServer((req, res) => {
    try {
      const requestUrl = new URL(req.url || "/", `http://${opts.host}`);
      let rel = requestUrl.pathname === "/" ? opts.entry : requestUrl.pathname;
      let filePath = safeResolve(opts.root, rel);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = safeResolve(filePath, "index.html");
      }
      if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        send(res, 404, "Not found");
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
        ...(opts.noCache ? { "Cache-Control": "no-store, max-age=0" } : {}),
      });
      fs.createReadStream(filePath).pipe(res);
    } catch (err) {
      send(res, 400, err.message || String(err));
    }
  });
}

function listen(server, host, requestedPort) {
  const numeric = requestedPort === "auto" ? 4173 : Number(requestedPort);
  if (!Number.isFinite(numeric) || numeric < 0 || numeric > 65535) {
    throw new Error("--port must be a number, 0, or auto.");
  }
  const maxAttempts = requestedPort === "auto" ? 50 : 1;

  return new Promise((resolve, reject) => {
    let attempt = 0;
    function tryPort(port) {
      const onError = (err) => {
        server.off("listening", onListening);
        if (err.code === "EADDRINUSE" && attempt < maxAttempts - 1 && port > 0) {
          attempt += 1;
          tryPort(port + 1);
          return;
        }
        reject(err);
      };
      const onListening = () => {
        server.off("error", onError);
        const addr = server.address();
        resolve(typeof addr === "object" ? addr.port : port);
      };
      server.once("error", onError);
      server.once("listening", onListening);
      server.listen(port, host);
    }
    tryPort(numeric);
  });
}

function entryUrl(host, port, entry) {
  const safeHost = host === "0.0.0.0" ? "127.0.0.1" : host;
  const encoded = entry.split(/[\\/]+/).map(part => encodeURIComponent(part)).join("/");
  return `http://${safeHost}:${port}/${encoded}`;
}

function openBrowser(url) {
  if (process.platform === "win32") {
    const child = spawn("cmd.exe", ["/c", "start", "", url], {
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    });
    child.unref();
    return;
  }
  const opener = process.platform === "darwin" ? "open" : "xdg-open";
  const child = spawn(opener, [url], { detached: true, stdio: "ignore" });
  child.unref();
}

async function smokeFetch(url) {
  const response = await fetch(url);
  const text = await response.text();
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  if (!/<html[\s>]/i.test(text) && !/<!doctype html>/i.test(text)) {
    throw new Error("Entry response does not look like HTML.");
  }
}

async function main() {
  const opts = parseArgs();
  const server = createServer(opts);
  const port = await listen(server, opts.host, opts.port);
  const url = entryUrl(opts.host, port, opts.entry);

  if (opts.smoke) {
    try {
      await smokeFetch(url);
      console.log(`Smoke: PASS ${url}`);
    } finally {
      server.close();
    }
    return;
  }

  console.log("BGY HTML preview server");
  console.log(`Root:  ${opts.root}`);
  console.log(`Entry: ${opts.entry}`);
  console.log(`URL:   ${url}`);
  console.log("Press Ctrl+C to stop.");
  if (opts.open) openBrowser(url);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
