import assert from "node:assert/strict";
import { PROGRAM } from "../js/data/program-data.js";
import { createWorkoutSession } from "../js/models/workout-session.js";
import { LocalStateStore } from "../js/storage/storage.js";
import { STORAGE_KEYS } from "../js/storage/schema.js";
import { SessionRepository } from "../js/services/session-repository.js";
import { WorkoutSessionService } from "../js/services/workout-session-service.js";

class MemoryStorage {
  #data = new Map();
  getItem(key) { return this.#data.has(key) ? this.#data.get(key) : null; }
  setItem(key, value) { this.#data.set(key, String(value)); }
  removeItem(key) { this.#data.delete(key); }
}

let tick = 0;
const now = () => new Date(Date.UTC(2026, 7, 19, 20, 0, tick++)).toISOString();
const ids = (() => {
  let i = 0;
  return (prefix) => `${prefix}_test_${++i}`;
})();

const backend = new MemoryStorage();
const store = new LocalStateStore({ backend, now });
const repo = new SessionRepository(store);
const service = new WorkoutSessionService(repo, { program: PROGRAM });

const empty = store.load();
assert.equal(empty.schemaVersion, 1);
assert.equal(empty.activeSessionId, null);
assert.deepEqual(empty.sessions, {});

const raw = createWorkoutSession(PROGRAM, "upper-a", { idFactory: ids, now });
assert.equal(raw.exercises.length, 8);
assert.equal(raw.exercises[0].sets.length, 3);
assert.equal(raw.exercises[0].sets[0].weight, null);
assert.equal(raw.exercises[0].sets[0].reps, null);
assert.equal(raw.exercises[0].sets[0].rir, null);

const started = repo.createSession(raw);
assert.equal(repo.getActiveSession().id, started.id);
assert.equal(store.load().revision, 1);

service.completeSet(started.id, "upper-a-01", 1, {
  weight: 25,
  reps: 10,
  rir: 3,
  completedAt: "2026-08-19T20:05:00.000Z",
  restSeconds: 150,
});

service.saveSetDraft(started.id, "upper-a-01", 2, { weight: 25 });
const draftSet = repo.getActiveSession().exercises[0].sets[1];
assert.equal(draftSet.weight, 25);
assert.equal(draftSet.reps, null);
assert.equal(draftSet.rir, null);

const afterSet = repo.getActiveSession();
const set = afterSet.exercises[0].sets[0];
assert.equal(set.weight, 25);
assert.equal(set.reps, 10);
assert.equal(set.rir, 3);
assert.equal(set.restStartedAt, "2026-08-19T20:05:00.000Z");
assert.equal(set.restEndsAt, "2026-08-19T20:07:30.000Z");

assert.throws(() => service.completeSet(started.id, "upper-a-01", 1, {
  weight: 25,
  reps: 10,
  rir: 3,
}), /already completed/);

assert.throws(() => service.start("lower-a", { idFactory: ids, now }), /active workout already exists/i);

const completed = service.complete(started.id, "2026-08-19T21:00:00.000Z");
assert.equal(completed.status, "completed");
assert.equal(repo.getActiveSession(), null);
assert.equal(repo.listSessions().length, 1);

// Corrupt primary: load must recover from the last valid backup.
backend.setItem(STORAGE_KEYS.primary, "{broken json");
const recovered = store.load();
assert.equal(recovered.schemaVersion, 1);
assert.ok(recovered.sessions[started.id]);

console.log("FAZ 2 storage tests passed.");
