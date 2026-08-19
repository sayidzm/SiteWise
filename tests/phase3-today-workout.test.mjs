import assert from "node:assert/strict";
import { PROGRAM } from "../js/data/program-data.js";
import { getDayKey, getScheduledWorkout } from "../js/utils/dates.js";
import { createWorkoutDataLayer } from "../js/storage/index.js";

class MemoryStorage {
  constructor() { this.map = new Map(); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
}

const monday = new Date("2026-08-17T12:00:00+03:00");
const wednesday = new Date("2026-08-19T12:00:00+03:00");
const friday = new Date("2026-08-21T12:00:00+03:00");

assert.equal(getDayKey(monday), "monday");
assert.equal(getScheduledWorkout(PROGRAM, monday).workoutId, "upper-a");
assert.equal(getScheduledWorkout(PROGRAM, wednesday).workoutId, null);
assert.equal(getScheduledWorkout(PROGRAM, friday).workoutId, "lower-b");

const backend = new MemoryStorage();
const data = createWorkoutDataLayer({ backend, now: () => "2026-08-17T09:00:00.000Z" });

assert.equal(data.sessions.getActiveSession(), null);
const session = data.workouts.start("upper-a", {
  idFactory: (prefix) => `${prefix}_${Math.random().toString(36).slice(2)}`,
  now: () => "2026-08-17T09:00:00.000Z",
});
assert.equal(session.workoutId, "upper-a");
assert.equal(data.sessions.getActiveSession().id, session.id);
assert.throws(() => data.workouts.start("lower-a"), /active workout already exists/i);

const reloaded = createWorkoutDataLayer({ backend, now: () => "2026-08-17T09:01:00.000Z" });
assert.equal(reloaded.sessions.getActiveSession().id, session.id);
assert.equal(reloaded.sessions.getActiveSession().status, "in_progress");

console.log("FAZ 3 today-workout tests passed.");
