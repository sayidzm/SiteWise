import assert from "node:assert/strict";
import { PROGRAM } from "../js/data/program-data.js";
import { LocalStateStore } from "../js/storage/storage.js";
import { SessionRepository } from "../js/services/session-repository.js";
import { WorkoutSessionService } from "../js/services/workout-session-service.js";
import { ProgressionService } from "../js/services/progression-service.js";
import { PRService } from "../js/services/pr-service.js";
import { ProgressService, exerciseKey } from "../js/services/progress-service.js";

class MemoryStorage {
  #data = new Map();
  getItem(key) { return this.#data.has(key) ? this.#data.get(key) : null; }
  setItem(key, value) { this.#data.set(key, String(value)); }
  removeItem(key) { this.#data.delete(key); }
}

let id = 0;
const idFactory = (prefix) => `${prefix}_phase6_${++id}`;
const store = new LocalStateStore({ backend: new MemoryStorage(), now: () => "2026-08-01T08:00:00.000Z" });
const repo = new SessionRepository(store);
const workouts = new WorkoutSessionService(repo, { program: PROGRAM });
const progression = new ProgressionService(repo);
const prs = new PRService(repo);
const progress = new ProgressService(repo, progression, prs);

assert.deepEqual(progress.listTrackedExercises(), [], "Progress must start empty; fake data is forbidden.");
assert.equal(progression.evaluate("upper-a", "upper-a-01").status, "no-data");
assert.equal(progress.getTrackingPhase(new Date("2026-08-01T08:00:00.000Z")).id, "not-started");

const first = workouts.start("upper-a", { idFactory, now: () => "2026-08-01T08:00:00.000Z" });
completeExercise(workouts, first.id, "upper-a-01", [
  [25, 10, 3],
  [25, 9, 2],
  [25, 9, 2],
], "2026-08-01");
workouts.complete(first.id, "2026-08-01T09:00:00.000Z");

assert.equal(prs.countNewRecords(repo.getSession(first.id)), 0, "First session has nothing to beat, so it cannot be counted as new records.");

let evaluation = progression.evaluate("upper-a", "upper-a-01");
assert.equal(evaluation.status, "technique-phase", "First 1–2 weeks must prioritize technique, not load increases.");
assert.equal(evaluation.candidateForLoadChange, false);

let records = prs.getRecords("upper-a", "upper-a-01");
assert.equal(records.heaviestLoad.weight, 25);
assert.equal(records.repRecord.reps, 10);
assert.equal(records.bestSetVolume.value, 250);

const second = workouts.start("upper-a", { idFactory, now: () => "2026-08-22T08:00:00.000Z" });
completeExercise(workouts, second.id, "upper-a-01", [
  [25, 12, 3],
  [25, 12, 2],
  [25, 12, 2],
], "2026-08-22");
workouts.complete(second.id, "2026-08-22T09:00:00.000Z");

evaluation = progression.evaluate("upper-a", "upper-a-01");
assert.equal(evaluation.status, "candidate");
assert.equal(evaluation.candidateForLoadChange, true);
assert.equal(evaluation.checks.allAtUpperRepLimit, true);
assert.equal(evaluation.checks.targetRirMaintained, true);
assert.equal(evaluation.checks.techniqueQuality, "manual-check-required", "Technique must never be fabricated as verified.");

assert.equal(prs.countNewRecords(repo.getSession(second.id)), 3, "All three 25×12 sets beat the previous 25×9/10 record.");

const weeklyAfterSecond = progress.getWeeklyStats(new Date("2026-08-23T12:00:00.000Z"));
assert.deepEqual(weeklyAfterSecond, { workoutCount: 1, completedSetCount: 3, newRecordCount: 3, candidateCount: 1 }, "Weekly stats must count only sessions in the last 7 days, with real new records and real candidates.");

const tracked = progress.listTrackedExercises();
const chest = tracked.find((item) => item.key === exerciseKey("upper-a", "upper-a-01"));
assert.ok(chest);
assert.equal(chest.sessionCount, 2);
assert.equal(chest.completedSetCount, 6);
assert.equal(chest.progression.status, "candidate");

const detail = progress.getExercise(exerciseKey("upper-a", "upper-a-01"));
assert.ok(detail);
assert.equal(detail.performances.length, 2);
assert.equal(detail.performances[1].bestWeight, 25);
assert.equal(detail.performances[1].maxReps, 12);
assert.equal(detail.performances[1].totalVolume, 900);

const third = workouts.start("upper-a", { idFactory, now: () => "2026-08-29T08:00:00.000Z" });
completeExercise(workouts, third.id, "upper-a-01", [
  [27.5, 8, 1],
  [27.5, 8, 1],
  [27.5, 7, 1],
], "2026-08-29");
workouts.complete(third.id, "2026-08-29T09:00:00.000Z");

evaluation = progression.evaluate("upper-a", "upper-a-01");
assert.equal(evaluation.status, "hold", "Below-range reps or too-low RIR must not trigger progression.");
assert.equal(evaluation.candidateForLoadChange, false);
records = prs.getRecords("upper-a", "upper-a-01");
assert.equal(records.heaviestLoad.weight, 27.5, "PR must come from real completed sets.");
assert.equal(records.repRecord.reps, 12);

const weeklyAfterFirst = progress.getWeeklyStats(new Date("2026-08-02T12:00:00.000Z"));
assert.deepEqual(weeklyAfterFirst, { workoutCount: 1, completedSetCount: 3, newRecordCount: 0, candidateCount: 0 }, "Weekly stats must reflect only real completed sessions within the last 7 days.");

const assisted = workouts.start("upper-b", { idFactory, now: () => "2026-09-05T08:00:00.000Z" });
completeExercise(workouts, assisted.id, "upper-b-02", [
  [30, 8, 3],
  [30, 8, 2],
  [30, 7, 2],
], "2026-09-05");
workouts.complete(assisted.id, "2026-09-05T09:00:00.000Z");
const assistedRecords = prs.getRecords("upper-b", "upper-b-02");
assert.equal(assistedRecords.loadRecordSupported, false, "Assisted/bodyweight slot must not pretend that higher recorded KG is automatically a better PR.");
assert.equal(assistedRecords.heaviestLoad, null);
assert.equal(assistedRecords.repRecord.reps, 8);

const painful = workouts.start("lower-a", { idFactory, now: () => "2026-09-06T08:00:00.000Z" });
completeExercise(workouts, painful.id, "lower-a-01", [
  [60, 12, 2],
  [60, 12, 2],
  [60, 12, 2],
], "2026-09-06");
workouts.setExerciseNotes(painful.id, "lower-a-01", { painOrDiscomfort: "Dizde keskin rahatsızlık" });
workouts.complete(painful.id, "2026-09-06T09:00:00.000Z");
assert.equal(progression.evaluate("lower-a", "lower-a-01").status, "pain-review");

assert.equal(progress.getTrackingPhase(new Date("2026-08-08T08:00:00.000Z")).id, "technique");
assert.equal(progress.getTrackingPhase(new Date("2026-08-29T08:00:00.000Z")).id, "double-progression");
assert.equal(progress.getTrackingPhase(new Date("2026-09-19T08:00:00.000Z")).id, "checkpoint");
assert.equal(progress.getTrackingPhase(new Date("2026-10-03T08:00:00.000Z")).id, "small-adjustments");

console.log("FAZ 6 progress/progression/PR tests passed.");

function completeExercise(service, sessionId, slotId, sets, datePrefix) {
  sets.forEach(([weight, reps, rir], index) => {
    const minute = String(10 + index * 3).padStart(2, "0");
    service.completeSet(sessionId, slotId, index + 1, {
      weight,
      reps,
      rir,
      completedAt: `${datePrefix}T08:${minute}:00.000Z`,
      restSeconds: 120,
    });
  });
}
