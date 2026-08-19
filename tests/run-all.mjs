import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

const tests = [
  "phase2-storage.test.mjs",
  "phase3-today-workout.test.mjs",
  "phase4-active-workout.test.mjs",
  "phase5-history.test.mjs",
  "phase6-progress-view.test.mjs",
  "phase6-progress.test.mjs",
  "phase7-program-content.test.mjs",
  "phase8-gym-mode.test.mjs",
  "phase9-settings-backup.test.mjs",
  "phase9-pwa-assets.test.mjs",
  "phase10-storage-resilience.test.mjs",
  "phase10-service-worker.test.mjs",
  "phase10-render-contract.test.mjs",
  "phase10-release-audit.test.mjs",
];

for (const test of tests) run(process.execPath, [path.join(here, test)]);

for (const file of walk(root).filter((file) => /\.(?:js|mjs)$/.test(file))) {
  run(process.execPath, ["--check", file], { quiet: true });
}

for (const file of walk(path.join(root, "js")).filter((file) => file.endsWith(".js"))) {
  const source = fs.readFileSync(file, "utf8");
  for (const match of source.matchAll(/(?:from\s+|import\s*\()(["'])(\.{1,2}\/[^"']+)\1/g)) {
    const specifier = match[2];
    const resolved = path.resolve(path.dirname(file), specifier);
    if (!fs.existsSync(resolved)) throw new Error(`Broken relative import: ${path.relative(root, file)} -> ${specifier}`);
  }
}

for (const cssFile of walk(path.join(root, "css")).filter((file) => file.endsWith(".css"))) {
  const css = fs.readFileSync(cssFile, "utf8");
  const opens = (css.match(/\{/g) ?? []).length;
  const closes = (css.match(/\}/g) ?? []).length;
  if (opens !== closes) throw new Error(`Unbalanced CSS braces: ${path.relative(root, cssFile)} (${opens}/${closes})`);
}

console.log("All Phase 10 regression, syntax, import and CSS checks passed.");

function run(command, args, { quiet = false } = {}) {
  const result = spawnSync(command, args, { cwd: root, encoding: "utf8" });
  if (!quiet && result.stdout) process.stdout.write(result.stdout);
  if (result.status !== 0) {
    if (result.stdout) process.stderr.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    process.exit(result.status ?? 1);
  }
}

function walk(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}
