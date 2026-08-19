import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.webmanifest"), "utf8"));
const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8");
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "js/app.js"), "utf8");

assert.equal(manifest.display, "standalone");
assert.equal(manifest.start_url, "./#home");
assert.ok(manifest.icons.some((icon) => icon.sizes === "192x192"));
assert.ok(manifest.icons.some((icon) => icon.sizes === "512x512"));
assert.match(index, /rel="manifest" href="\.\/manifest\.webmanifest"/);
assert.match(app, /PWA\.register\(\)/);
assert.match(sw, /caches\.open\(CACHE_NAME\)/);
assert.match(sw, /request\.mode === "navigate"/);

for (const icon of manifest.icons) {
  const iconPath = path.resolve(root, icon.src.replace(/^\.\//, ""));
  assert.ok(fs.existsSync(iconPath), `Missing manifest icon: ${icon.src}`);
}

const shellMatch = sw.match(/const APP_SHELL = \[([\s\S]*?)\];/);
assert.ok(shellMatch, "APP_SHELL not found");
const assets = [...shellMatch[1].matchAll(/"(\.\/[^\"]*)"/g)].map((m) => m[1]);
assert.ok(assets.length > 20, "Expected a complete app-shell cache list");
for (const asset of assets) {
  if (asset === "./") continue;
  const assetPath = path.resolve(root, asset.replace(/^\.\//, ""));
  assert.ok(fs.existsSync(assetPath), `Service worker cache entry missing: ${asset}`);
}

console.log("FAZ 9 PWA asset tests passed.");
