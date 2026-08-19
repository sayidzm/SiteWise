import assert from "node:assert/strict";
import { createWorkoutDataLayer } from "../js/storage/index.js";
import { BACKUP_FORMAT, BACKUP_FORMAT_VERSION } from "../js/services/data-portability-service.js";

class MemoryStorage {
  constructor() { this.map = new Map(); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
}

const now = () => "2026-08-19T21:00:00.000Z";
const backend = new MemoryStorage();
const data = createWorkoutDataLayer({ backend, now });

assert.deepEqual(data.settings.getAll(), {
  keepScreenAwake: true,
  restTimerVibration: true,
  confirmIncompleteFinish: true,
});

data.settings.set("keepScreenAwake", false);
data.settings.set("restTimerVibration", false);
assert.equal(data.settings.get("keepScreenAwake"), false);
assert.equal(data.settings.get("restTimerVibration"), false);
assert.throws(() => data.settings.set("unknown", true), /Unknown setting/);
assert.throws(() => data.settings.set("keepScreenAwake", "yes"), /must be boolean/);

const session = data.workouts.start("upper-a", {
  idFactory: (() => { let i = 0; return (prefix) => `${prefix}_phase9_${++i}`; })(),
  now,
});
assert.equal(data.sessions.getActiveSession().id, session.id);

const exported = data.portability.createExportEnvelope();
assert.equal(exported.format, BACKUP_FORMAT);
assert.equal(exported.formatVersion, BACKUP_FORMAT_VERSION);
assert.equal(exported.data.settings.keepScreenAwake, false);
assert.equal(exported.data.activeSessionId, session.id);

const exportText = data.portability.createExportText();
assert.match(exportText, /workout-tracker-backup/);

const importedBackend = new MemoryStorage();
const imported = createWorkoutDataLayer({ backend: importedBackend, now });
const importedState = imported.portability.importText(exportText);
assert.equal(importedState.activeSessionId, session.id);
assert.equal(imported.settings.get("keepScreenAwake"), false);
assert.equal(imported.sessions.getActiveSession().workoutId, "upper-a");

const beforeInvalid = imported.sessions.getState();
assert.throws(() => imported.portability.importText('{"format":"wrong","data":{}}'), /Workout Tracker yedeği değil/);
assert.deepEqual(imported.sessions.getState(), beforeInvalid);
assert.throws(() => imported.portability.importText("not json"), /geçerli JSON değil/);

const corrupted = JSON.parse(exportText);
corrupted.data.settings.keepScreenAwake = "false";
assert.throws(() => imported.portability.importText(JSON.stringify(corrupted)), /settings.keepScreenAwake must be boolean/);

globalThis.localStorage = new MemoryStorage();
const { renderSettings } = await import("../js/views/settings.js");
const html = renderSettings();
assert.match(html, /Ekranı açık tut/);
assert.match(html, /Yedeği dışa aktar/);
assert.match(html, /Yedekten içe aktar/);
assert.match(html, /Tüm veriyi sil/);
assert.match(html, /data-setting-key="keepScreenAwake"/);

imported.store.reset();
assert.equal(imported.sessions.getActiveSession(), null);
assert.deepEqual(imported.sessions.getState().sessions, {});
assert.equal(imported.settings.get("keepScreenAwake"), true);

console.log("FAZ 9 settings/backup tests passed.");
