import assert from "node:assert/strict";
import { PROGRAM } from "../js/data/program-data.js";
import { LocalStateStore } from "../js/storage/storage.js";
import { SessionRepository } from "../js/services/session-repository.js";
import { WorkoutSessionService } from "../js/services/workout-session-service.js";
import { HistoryService } from "../js/services/history-service.js";

class MemoryStorage {
  #data = new Map();
  getItem(key) { return this.#data.has(key) ? this.#data.get(key) : null; }
  setItem(key, value) { this.#data.set(key, String(value)); }
  removeItem(key) { this.#data.delete(key); }
}

let id = 0;
const idFactory = (prefix) => `${prefix}_phase5_${++id}`;
const store = new LocalStateStore({ backend: new MemoryStorage(), now: () => "2026-08-17T08:00:00.000Z" });
const repo = new SessionRepository(store);
const workouts = new WorkoutSessionService(repo, { program: PROGRAM });
const history = new HistoryService(repo);

assert.deepEqual(history.listCompleted(), [], "History must start empty; no fake sessions are allowed.");

const first = workouts.start("upper-a", { idFactory, now: () => "2026-08-17T08:00:00.000Z" });
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
workouts.complete(first.id, "2026-08-17T09:05:00.000Z");

const firstSummary = history.listCompleted()[0];
assert.equal(firstSummary.id, first.id);
assert.equal(firstSummary.workoutName, "Upper A");
assert.equal(firstSummary.durationSeconds, 3900);
assert.equal(firstSummary.completedSetCount, 2);
assert.equal(firstSummary.touchedExerciseCount, 1);
assert.equal(firstSummary.plannedExerciseCount, 8);
assert.ok(firstSummary.completedSetCount < firstSummary.plannedSetCount, "Early-finished workout must be represented as partial history, not fabricated as complete.");

const firstDetail = history.getCompleted(first.id);
assert.ok(firstDetail);
assert.equal(firstDetail.session.exercises[0].sets[0].weight, 25);
assert.equal(firstDetail.session.exercises[0].sets[0].reps, 10);
assert.equal(firstDetail.session.exercises[0].sets[0].rir, 3);
assert.equal(history.getCompleted("missing-session"), null);

const second = workouts.start("lower-a", { idFactory, now: () => "2026-08-18T08:00:00.000Z" });
workouts.completeSet(second.id, "lower-a-01", 1, {
  weight: 50,
  reps: 10,
  rir: 2,
  completedAt: "2026-08-18T08:05:00.000Z",
  restSeconds: 120,
});
workouts.complete(second.id, "2026-08-18T08:45:00.000Z");

const ordered = history.listCompleted();
assert.equal(ordered.length, 2);
assert.equal(ordered[0].id, second.id, "Newest completed workout must appear first.");
assert.equal(ordered[1].id, first.id);

const third = workouts.start("upper-b", { idFactory, now: () => "2026-08-19T08:00:00.000Z" });
assert.equal(history.listCompleted().length, 2, "In-progress sessions must not appear in History.");
workouts.discard(third.id, "2026-08-19T08:10:00.000Z");
assert.equal(history.listCompleted().length, 2, "Discarded sessions must not appear in History.");

console.log("FAZ 5 history tests passed.");
