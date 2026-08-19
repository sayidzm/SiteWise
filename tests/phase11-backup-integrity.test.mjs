import assert from "node:assert/strict";
import { createWorkoutDataLayer } from "../js/storage/index.js";
import { STORAGE_KEYS } from "../js/storage/schema.js";
import {
  BACKUP_APP_VERSION,
  BACKUP_FORMAT,
  BACKUP_FORMAT_VERSION,
  MAX_IMPORT_BYTES,
} from "../js/services/data-portability-service.js";

class MemoryStorage {
  constructor() { this.map = new Map(); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
}

class ControlledStorage extends MemoryStorage {
  failPreImport = false;
  failPrimary = false;

  setItem(key, value) {
    if (this.failPreImport && key === STORAGE_KEYS.preImport) throw quotaError();
    if (this.failPrimary && key === STORAGE_KEYS.primary) throw quotaError();
    super.setItem(key, value);
  }
}

const NOW = "2026-08-20T00:30:00.000Z";
const now = () => NOW;
let id = 0;
const ids = (prefix) => `${prefix}_phase11_${++id}`;

// Build a realistic export: one completed workout + one resumable active workout.
const sourceBackend = new MemoryStorage();
const source = createWorkoutDataLayer({ backend: sourceBackend, now });
source.settings.set("keepScreenAwake", false);

const completed = source.workouts.start("upper-a", { idFactory: ids, now });
source.workouts.completeSet(completed.id, "upper-a-01", 1, {
  weight: 25,
  reps: 10,
  rir: 3,
  completedAt: "2026-08-20T00:35:00.000Z",
  restSeconds: 120,
});
source.workouts.complete(completed.id, "2026-08-20T01:20:00.000Z");

const active = source.workouts.start("lower-a", { idFactory: ids, now: () => "2026-08-20T02:00:00.000Z" });
source.workouts.saveSetDraft(active.id, "lower-a-01", 1, { weight: 50, reps: 10, rir: 3 });

const envelope = source.portability.createExportEnvelope();
assert.equal(envelope.format, BACKUP_FORMAT);
assert.equal(envelope.formatVersion, BACKUP_FORMAT_VERSION);
assert.equal(envelope.appVersion, BACKUP_APP_VERSION);
assert.equal(envelope.appSchemaVersion, 1);
assert.equal(envelope.exportedAt, NOW);
assert.equal(envelope.summary.completedSessions, 1);
assert.equal(envelope.summary.inProgressSessions, 1);
assert.equal(envelope.summary.activeSessionId, active.id);

const exportText = source.portability.createExportText();
const inspection = source.portability.inspectImportText(exportText);
assert.equal(inspection.summary.completedSessions, 1);
assert.equal(inspection.summary.inProgressSessions, 1);
assert.equal(inspection.summary.completedSets, 1);
assert.equal(inspection.sourceSchemaVersion, 1);
assert.equal(inspection.targetSchemaVersion, 1);

// Older v1 backups without optional Phase 11 metadata remain importable.
const legacyEnvelope = JSON.parse(exportText);
delete legacyEnvelope.appVersion;
delete legacyEnvelope.summary;
assert.equal(source.portability.inspectImportText(JSON.stringify(legacyEnvelope)).appVersion, null);

// Round trip into a device that already contains unrelated data. Import must
// preserve a dedicated pre-import recovery snapshot.
const targetBackend = new MemoryStorage();
const target = createWorkoutDataLayer({ backend: targetBackend, now });
target.settings.set("restTimerVibration", false);
const oldSession = target.workouts.start("lower-b", { idFactory: ids, now });
target.workouts.complete(oldSession.id, "2026-08-20T01:00:00.000Z");
const beforeImport = target.sessions.getState();

const imported = target.portability.importText(exportText);
assert.equal(imported.activeSessionId, active.id);
assert.equal(target.settings.get("keepScreenAwake"), false);
assert.equal(target.sessions.getActiveSession().workoutId, "lower-a");
assert.equal(target.sessions.listSessions({ includeDiscarded: true }).length, 2);
assert.deepEqual(target.sessions.getState().sessions, source.sessions.getState().sessions);
assert.deepEqual(target.history.listCompleted(), source.history.listCompleted());
assert.deepEqual(target.progress.listTrackedExercises(), source.progress.listTrackedExercises());
assert.equal(target.portability.hasPreImportRecovery(), true);
assert.deepEqual(target.portability.getPreImportRecoverySummary(), {
  sessions: 1,
  completedSessions: 1,
  inProgressSessions: 0,
  discardedSessions: 0,
  workingSets: 15,
  completedSets: 0,
  activeSessionId: null,
  activeWorkoutName: null,
});

// Explicit undo restores the exact logical pre-import content. Revision and
// updatedAt are intentionally allowed to advance because restore is a new save.
const restored = target.portability.restorePreImport();
assert.equal(target.portability.hasPreImportRecovery(), false);
assert.equal(restored.activeSessionId, beforeImport.activeSessionId);
assert.deepEqual(restored.sessions, beforeImport.sessions);
assert.deepEqual(restored.settings, beforeImport.settings);

// Re-import for invalid-file mutation checks below.
target.portability.importText(exportText);
const stableBeforeInvalid = target.sessions.getState();

assertRejectsWithoutMutation(target, corrupt(exportText, (e) => {
  e.appSchemaVersion = 2;
  e.data.schemaVersion = 2;
}), /daha yeni bir veri şeması/i, stableBeforeInvalid);

assertRejectsWithoutMutation(target, corrupt(exportText, (e) => {
  const existing = Object.values(e.data.sessions)[0];
  e.data.sessions["wrong-map-key"] = structuredClone(existing);
}), /map key must match session\.id|Duplicate session id/i, stableBeforeInvalid);

assertRejectsWithoutMutation(target, corrupt(exportText, (e) => {
  const session = Object.values(e.data.sessions)[0];
  session.exercises[0].sets[1].id = session.exercises[0].sets[0].id;
}), /Duplicate set id/i, stableBeforeInvalid);

assertRejectsWithoutMutation(target, corrupt(exportText, (e) => {
  const existingActive = e.data.sessions[e.data.activeSessionId];
  const clone = structuredClone(existingActive);
  clone.id = "session_second_active";
  e.data.sessions[clone.id] = clone;
}), /Only one in-progress session/i, stableBeforeInvalid);

assertRejectsWithoutMutation(target, corrupt(exportText, (e) => {
  const session = Object.values(e.data.sessions).find((s) => s.status === "completed");
  const set = session.exercises[0].sets[0];
  set.rir = null;
}), /completed working set must have weight, reps and rir/i, stableBeforeInvalid);

assertRejectsWithoutMutation(target, corrupt(exportText, (e) => {
  const session = Object.values(e.data.sessions).find((s) => s.status === "completed");
  const set = session.exercises[0].sets[0];
  set.restEndsAt = "2026-08-20T00:34:00.000Z";
}), /restEndsAt cannot be earlier than restStartedAt/i, stableBeforeInvalid);

assertRejectsWithoutMutation(target, corrupt(exportText, (e) => {
  const session = Object.values(e.data.sessions).find((s) => s.status === "completed");
  session.completedAt = null;
}), /completed session must have completedAt/i, stableBeforeInvalid);

assert.throws(
  () => target.portability.inspectImportText("x".repeat(MAX_IMPORT_BYTES + 1)),
  /En fazla 5 MB/i,
);

// If the dedicated safety snapshot cannot be written, import must abort before
// replacing the user's current primary state.
{
  const backend = new ControlledStorage();
  const data = createWorkoutDataLayer({ backend, now });
  data.settings.set("keepScreenAwake", false);
  const before = data.sessions.getState();
  backend.failPreImport = true;

  assert.throws(() => data.portability.importText(exportText), (error) => error?.code === "PREIMPORT_SNAPSHOT_QUOTA");
  assert.deepEqual(data.sessions.getState(), before);
}

// If the final primary write fails after the safety/rolling backups are made,
// the old primary must still be readable and no incoming state is partially committed.
{
  const backend = new ControlledStorage();
  const data = createWorkoutDataLayer({ backend, now });
  data.settings.set("keepScreenAwake", false);
  const before = data.sessions.getState();
  backend.failPrimary = true;

  assert.throws(() => data.portability.importText(exportText), (error) => error?.code === "QUOTA_EXCEEDED");
  backend.failPrimary = false;
  assert.deepEqual(data.sessions.getState(), before);
  assert.equal(data.portability.hasPreImportRecovery(), true);
}

// Reset must erase the import rollback snapshot too.
target.store.reset();
assert.equal(target.portability.hasPreImportRecovery(), false);

console.log("FAZ 11 backup/import/export integrity tests passed.");

function corrupt(text, mutate) {
  const envelope = JSON.parse(text);
  mutate(envelope);
  return JSON.stringify(envelope);
}

function assertRejectsWithoutMutation(data, text, pattern, expectedState) {
  assert.throws(() => data.portability.importText(text), pattern);
  assert.deepEqual(data.sessions.getState(), expectedState);
}

function quotaError() {
  const error = new Error("quota exceeded");
  error.name = "QuotaExceededError";
  error.code = 22;
  return error;
}
