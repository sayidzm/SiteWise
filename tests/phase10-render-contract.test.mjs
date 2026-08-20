import assert from "node:assert/strict";

class MemoryStorage {
  #data = new Map();
  getItem(key) { return this.#data.has(key) ? this.#data.get(key) : null; }
  setItem(key, value) { this.#data.set(key, String(value)); }
  removeItem(key) { this.#data.delete(key); }
}

globalThis.localStorage = new MemoryStorage();

const { DATA } = await import("../js/services/app-data.js");
const { renderHome } = await import("../js/views/home.js");
const { renderWorkout } = await import("../js/views/workout.js");
const { renderHistory } = await import("../js/views/history.js");
const { renderProgress } = await import("../js/views/progress.js");
const { renderProgram } = await import("../js/views/program.js");
const { renderSettings } = await import("../js/views/settings.js");

let id = 0;
DATA.workouts.start("upper-a", {
  idFactory: (prefix) => `${prefix}_phase10_${++id}`,
  now: () => "2026-08-20T08:00:00.000Z",
});

const views = new Map([
  ["home", renderHome()],
  ["workout", renderWorkout("workout")],
  ["history", renderHistory("history")],
  ["progress", renderProgress("progress")],
  ["program", renderProgram("program")],
  ["settings", renderSettings()],
]);

for (const [name, html] of views) {
  assert.ok(html.includes('<section class="page'), `${name}: missing page landmark`);
  assert.doesNotMatch(html, /<table\b/i, `${name}: mobile UI should not depend on desktop tables`);

  for (const match of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)) {
    const attrs = match[1];
    const body = match[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    assert.match(attrs, /\btype="button"/, `${name}: every button must declare type=button`);
    assert.ok(body.length > 0 || /aria-label="[^"]+"/.test(attrs), `${name}: button has no accessible name`);
  }
}

const workout = views.get("workout");
assert.match(workout, /Henüz veri yok/);
assert.match(workout, /role="progressbar"/);
assert.match(workout, /aria-modal="true"/);
assert.match(workout, /data-rest-announcement|id="workout-sheet"/);
assert.match(workout, /data-action="open-workout-notes"/);
assert.match(workout, /data-action="open-workout-technique"/);
assert.match(workout, /data-action="open-workout-alternatives"/);

const settings = views.get("settings");
assert.match(settings, /data-import-file tabindex="-1" aria-hidden="true"/);

const malformedHistory = renderHistory("history/%zz");
assert.match(malformedHistory, /Workout bulunamadı/, "Malformed percent-encoding must degrade to the not-found state, not throw.");
const malformedProgress = renderProgress("progress/%zz");
assert.match(malformedProgress, /Egzersiz verisi bulunamadı/, "Malformed percent-encoding must degrade to a graceful empty state.");

console.log("FAZ 10 rendered-view contract tests passed.");
