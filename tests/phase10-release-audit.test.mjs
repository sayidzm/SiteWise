import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");

const index = read("index.html");
const base = read("css/base.css");
const layout = read("css/layout.css");
const components = read("css/components.css");
const css = `${base}\n${layout}\n${components}`;
const app = read("js/app.js");
const workout = read("js/views/workout.js");
const settings = read("js/views/settings.js");
const program = read("js/views/program.js");
const sw = read("sw.js");

const requiredViewports = [320, 360, 375, 390, 393, 412, 430];

// Mobile-first / overflow contract.
assert.match(index, /width=device-width, initial-scale=1, viewport-fit=cover/);
assert.match(base, /html\s*\{[\s\S]*?min-width:\s*320px/);
assert.match(base, /body\s*\{[\s\S]*?overflow-x:\s*hidden/);
assert.doesNotMatch(css, /\b100vw\b/);
assert.match(layout, /env\(safe-area-inset-bottom\)/);
assert.match(components, /\.bottom-nav[\s\S]*?env\(safe-area-inset-bottom\)/);
assert.match(components, /\.sticky-set-action[\s\S]*?env\(safe-area-inset-bottom\)/);
assert.match(components, /@media \(max-width: 359px\)[\s\S]*?\.rir-options[\s\S]*?repeat\(3/);
assert.match(components, /@media \(max-width: 359px\)[\s\S]*?\.week-grid[\s\S]*?repeat\(4/);

// Calculate the tightest Active Workout controls for every required width.
for (const width of requiredViewports) {
  const appPadding = width <= 359 ? 12 : 16;
  const activeCardPadding = 16;
  const inner = width - (appPadding * 2) - (activeCardPadding * 2);
  const stepButton = width <= 359 ? 52 : 58;
  const stepInput = inner - (stepButton * 2) - 16; // two 8px gaps
  const rirColumns = width <= 359 ? 3 : 6;
  const rirWidth = (inner - ((rirColumns - 1) * 6)) / rirColumns;

  assert.ok(stepInput >= 120, `${width}px: numeric input is too narrow (${stepInput}px)`);
  assert.ok(rirWidth >= 44, `${width}px: RIR touch target width is below 44px (${rirWidth}px)`);
}

// Touch-target contract for frequent actions.
assert.match(components, /\.nav-item[\s\S]*?min-height:\s*56px/);
assert.match(components, /\.complete-set-button[\s\S]*?min-height:\s*58px/);
assert.match(components, /\.stepper-control button[\s\S]*?min-height:\s*58px/);
assert.match(components, /\.rir-option[\s\S]*?min-height:\s*50px/);
assert.match(components, /\.bottom-sheet-close[\s\S]*?width:\s*48px[\s\S]*?height:\s*48px/);
assert.match(components, /\.back-link[\s\S]*?min-height:\s*44px/);

// Accessibility/focus/reduced-motion hardening.
assert.match(base, /prefers-reduced-motion:\s*reduce/);
assert.match(app, /preferredScrollBehavior/);
assert.match(app, /restoreFocus\(programSheetTrigger\)/);
assert.match(app, /restoreFocus\(workoutSheetTrigger\)/);
assert.match(workout, /aria-modal="true"/);
assert.match(program, /aria-modal="true"/);
assert.match(workout, /role="progressbar"/);
assert.match(workout, /aria-valuenow="\$\{progress\.percent\}"/);
assert.match(workout, /data-rest-announcement aria-live="polite"/);
assert.doesNotMatch(workout, /data-rest-display role="timer" aria-live="polite"/);
assert.match(settings, /data-import-file tabindex="-1" aria-hidden="true"/);
assert.doesNotMatch(app, /onclick=/);
assert.match(app, /data-action="reload-app"/);
assert.match(app, /querySelector\(`input\[data-field="\$\{fieldName\}"\]`\)/);
assert.match(app, /querySelector\(`input\[data-field="\$\{field\}"\]`\)/);

// Release hygiene.
assert.match(sw, /workout-tracker-sitewise-redesign-v1/);
for (const file of fs.readdirSync(path.join(root, "js"), { recursive: true })) {
  if (typeof file !== "string" || !file.endsWith(".js")) continue;
  const source = read(path.join("js", file));
  assert.doesNotMatch(source, /\bTODO\b|\bFIXME\b/, `Unresolved marker in ${file}`);
}

console.log("FAZ 10 release/mobile/accessibility audit passed.");
