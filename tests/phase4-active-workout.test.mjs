import assert from "node:assert/strict";
import { PROGRAM } from "../js/data/program-data.js";
import { LocalStateStore } from "../js/storage/storage.js";
import { SessionRepository } from "../js/services/session-repository.js";
import { WorkoutSessionService } from "../js/services/workout-session-service.js";
import { PreviousPerformanceService } from "../js/services/previous-performance-service.js";

class MemoryStorage {
  #data = new Map();
  getItem(key) { return this.#data.has(key) ? this.#data.get(key) : null; }
  setItem(key, value) { this.#data.set(key, String(value)); }
  removeItem(key) { this.#data.delete(key); }
}

let id = 0;
const idFactory = (prefix) => `${prefix}_phase4_${++id}`;
let tick = 0;
const firstNow = () => new Date(Date.UTC(2026, 7, 17, 8, 0, tick++)).toISOString();

const store = new LocalStateStore({ backend: new MemoryStorage(), now: firstNow });
const repo = new SessionRepository(store);
const workouts = new WorkoutSessionService(repo, { program: PROGRAM });
const previous = new PreviousPerformanceService(repo);

const first = workouts.start("upper-a", { idFactory, now: firstNow });
workouts.completeSet(first.id, "upper-a-01", 1, {
  weight: 25,
  reps: 10,
  rir: 3,
  completedAt: "2026-08-17T08:10:00.000Z",
  restSeconds: 120,
});
workouts.completeSet(first.id, "upper-a-01", 2, {
  weight: 25,
  reps: 9,
  rir: 2,
  completedAt: "2026-08-17T08:13:00.000Z",
  restSeconds: 120,
});
workouts.complete(first.id, "2026-08-17T09:00:00.000Z");

let secondTick = 0;
const secondNow = () => new Date(Date.UTC(2026, 7, 19, 8, 0, secondTick++)).toISOString();
const second = workouts.start("upper-a", { idFactory, now: secondNow });

const last = previous.getPreviousExercise(second, "upper-a-01");
assert.ok(last, "Previous performance should come from a real completed session.");
assert.equal(last.sessionId, first.id);
assert.deepEqual(last.sets.map(({ weight, reps, rir }) => ({ weight, reps, rir })), [
  { weight: 25, reps: 10, rir: 3 },
  { weight: 25, reps: 9, rir: 2 },
]);
assert.equal(previous.getPreviousExercise(second, "upper-a-02"), null, "No fake previous data should be created.");

workouts.saveSetDraft(second.id, "upper-a-01", 1, { weight: 27, reps: 10, rir: 3 });
workouts.setExerciseNotes(second.id, "upper-a-01", {
  notes: "Koltuk ayarı 4",
  painOrDiscomfort: "",
});
workouts.setExerciseVariation(second.id, "upper-a-01", "Dumbbell bench press");
let active = repo.getActiveSession();
let draft = active.exercises[0].sets[0];
assert.equal(draft.weight, 27);
assert.equal(draft.completedAt, null);
assert.equal(active.exercises[0].notes, "Koltuk ayarı 4");
assert.equal(active.exercises[0].painOrDiscomfort, "");
assert.equal(active.exercises[0].selectedVariation, "Dumbbell bench press");

const completedAt = new Date(Date.now() + 60_000).toISOString();
workouts.completeSet(second.id, "upper-a-01", 1, {
  weight: 27,
  reps: 10,
  rir: 3,
  completedAt,
  restSeconds: 120,
});
active = repo.getActiveSession();
let completedSet = active.exercises[0].sets[0];
assert.equal(completedSet.weight, 27);
assert.equal(Date.parse(completedSet.restEndsAt) - Date.parse(completedSet.restStartedAt), 120_000);

const beforeExtension = Date.parse(completedSet.restEndsAt);
workouts.adjustRest(second.id, "upper-a-01", 1, 30);
completedSet = repo.getActiveSession().exercises[0].sets[0];
assert.ok(Date.parse(completedSet.restEndsAt) >= beforeExtension + 30_000);

const skipAt = new Date(Date.parse(completedAt) + 10_000).toISOString();
workouts.skipRest(second.id, "upper-a-01", 1, skipAt);
completedSet = repo.getActiveSession().exercises[0].sets[0];
assert.equal(completedSet.restEndsAt, skipAt);

workouts.setCurrentExercise(second.id, 1);
assert.equal(repo.getActiveSession().currentExerciseIndex, 1);

const finished = workouts.complete(second.id, new Date(Date.now() + 120_000).toISOString());
assert.equal(finished.status, "completed");
assert.equal(repo.getActiveSession(), null);

assert.throws(
  () => workouts.saveSetDraft(second.id, "upper-a-01", 1, { weight: 30 }),
  /Only in-progress sessions can be edited/,
  "A stale draft write after completion must be rejected, not written into the finished session."
);

const third = workouts.start("upper-a", { idFactory, now: secondNow });
const discarded = workouts.discard(third.id, "2026-08-20T09:00:00.000Z");
assert.equal(discarded.status, "discarded");
assert.equal(repo.getActiveSession(), null);

assert.throws(
  () => workouts.saveSetDraft(third.id, "upper-a-01", 1, { weight: 30 }),
  /Only in-progress sessions can be edited/,
  "A stale draft write after discard must be rejected."
);

console.log("FAZ 4 active-workout tests passed.");
