import assert from "node:assert/strict";

class MemoryStorage {
  #data = new Map();
  getItem(key) { return this.#data.has(key) ? this.#data.get(key) : null; }
  setItem(key, value) { this.#data.set(key, String(value)); }
  removeItem(key) { this.#data.delete(key); }
}

globalThis.localStorage = new MemoryStorage();

const { DATA } = await import("../js/services/app-data.js");
const { renderProgress } = await import("../js/views/progress.js");

let id = 0;
const session = DATA.workouts.start("upper-a", {
  idFactory: (prefix) => `${prefix}_view_${++id}`,
  now: () => "2026-08-01T08:00:00.000Z",
});

[
  [25, 10, 3],
  [25, 10, 2],
  [25, 9, 2],
].forEach(([weight, reps, rir], index) => {
  DATA.workouts.completeSet(session.id, "upper-a-01", index + 1, {
    weight,
    reps,
    rir,
    completedAt: `2026-08-01T08:${String(10 + index * 3).padStart(2, "0")}:00.000Z`,
    restSeconds: 120,
  });
});
DATA.workouts.complete(session.id, "2026-08-01T09:00:00.000Z");

const overview = renderProgress("progress");
assert.match(overview, /Machine Chest Press/);
assert.match(overview, /Takip edilen egzersizler/);

const detail = renderProgress(`progress/${encodeURIComponent("upper-a:upper-a-01")}`);
assert.match(detail, /Double progression/);
assert.match(detail, /Kayıtlar \/ PR/);
assert.match(detail, /Performans geçmişi/);
assert.match(detail, /Teknik dönemi/);

console.log("FAZ 6 progress view smoke test passed.");
