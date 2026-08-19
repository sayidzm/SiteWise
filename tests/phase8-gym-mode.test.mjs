import assert from "node:assert/strict";
import fs from "node:fs";
import { WakeLockService } from "../js/services/wake-lock-service.js";

class MemoryStorage {
  #data = new Map();
  getItem(key) { return this.#data.has(key) ? this.#data.get(key) : null; }
  setItem(key, value) { this.#data.set(key, String(value)); }
  removeItem(key) { this.#data.delete(key); }
}

globalThis.localStorage = new MemoryStorage();

const { DATA } = await import("../js/services/app-data.js");
const { renderWorkout } = await import("../js/views/workout.js");

let counter = 0;
DATA.workouts.start("upper-a", {
  idFactory: (prefix) => `${prefix}_phase8_${++counter}`,
  now: () => "2026-08-17T08:00:00.000Z",
});

let html = renderWorkout("workout");
assert.match(html, /data-action="open-workout-exercise-info"/);
assert.match(html, /data-action="open-workout-options"/);
assert.match(html, /id="workout-sheet"/);
assert.match(html, /Gym Mode/);

const active = DATA.sessions.getActiveSession();
DATA.workouts.completeSet(active.id, "upper-a-01", 1, {
  weight: 25,
  reps: 10,
  rir: 3,
  completedAt: new Date(Date.now() + 60_000).toISOString(),
  restSeconds: 120,
});

html = renderWorkout("workout");
assert.match(html, /data-rest-progress/);
assert.match(html, /data-rest-status/);
assert.match(html, /\+30 sn/);
assert.match(html, />Geç</);

const unsupported = new WakeLockService({});
assert.deepEqual(await unsupported.acquire(), { supported: false, active: false });
assert.equal(unsupported.active, false);

let requestCount = 0;
let releaseCount = 0;
const sentinel = {
  released: false,
  addEventListener() {},
  async release() {
    this.released = true;
    releaseCount += 1;
  },
};
const supported = new WakeLockService({
  wakeLock: {
    async request(type) {
      assert.equal(type, "screen");
      requestCount += 1;
      return sentinel;
    },
  },
});

assert.deepEqual(await supported.acquire(), { supported: true, active: true });
assert.equal(supported.active, true);
await supported.acquire();
assert.equal(requestCount, 1, "Wake Lock should not be requested twice while active.");
await supported.release();
assert.equal(releaseCount, 1);
assert.equal(supported.active, false);

const appSource = fs.readFileSync(new URL("../js/app.js", import.meta.url), "utf8");
const cssSource = fs.readFileSync(new URL("../css/components.css", import.meta.url), "utf8");
assert.match(appSource, /visualViewport/);
assert.match(appSource, /syncWakeLock/);
assert.match(cssSource, /keyboard-focus \.sticky-set-action/);
assert.match(cssSource, /\.gym-mode \.rest-timer-card/);

console.log("FAZ 8 gym-mode UX tests passed.");
