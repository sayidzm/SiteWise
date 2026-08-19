import assert from "node:assert/strict";
import { LocalStateStore, StorageError } from "../js/storage/storage.js";
import { STORAGE_KEYS, createEmptyState } from "../js/storage/schema.js";

class ControlledStorage {
  #data = new Map();
  failPrimaryWrites = false;
  failAllWrites = false;

  getItem(key) {
    return this.#data.has(key) ? this.#data.get(key) : null;
  }

  setItem(key, value) {
    if (this.failAllWrites || (this.failPrimaryWrites && key === STORAGE_KEYS.primary)) {
      const error = new Error("quota exceeded");
      error.name = "QuotaExceededError";
      error.code = 22;
      throw error;
    }
    this.#data.set(key, String(value));
  }

  removeItem(key) {
    this.#data.delete(key);
  }

  seed(key, value) {
    this.#data.set(key, String(value));
  }
}

const NOW = "2026-08-20T00:00:00.000Z";

// A valid backup remains readable even if repairing the corrupt primary copy is impossible.
{
  const backend = new ControlledStorage();
  const backupState = createEmptyState(NOW);
  backupState.revision = 7;
  backend.seed(STORAGE_KEYS.primary, "{not-json");
  backend.seed(STORAGE_KEYS.backup, JSON.stringify(backupState));
  backend.failPrimaryWrites = true;

  const store = new LocalStateStore({ backend, now: () => NOW });
  const recovered = store.load();
  assert.equal(recovered.revision, 7);
  assert.equal(recovered.schemaVersion, 1);
}

// Quota errors get a stable, user-readable error code/message instead of corrupting data.
{
  const backend = new ControlledStorage();
  backend.failPrimaryWrites = true;
  const store = new LocalStateStore({ backend, now: () => NOW });

  assert.throws(
    () => store.save(createEmptyState(NOW)),
    (error) => {
      assert.ok(error instanceof StorageError);
      assert.equal(error.code, "QUOTA_EXCEEDED");
      assert.match(error.message, /yerel depolama alanı dolu/i);
      return true;
    },
  );
}

// If a save fails after the backup write, the last valid primary remains readable and backup is valid.
{
  const backend = new ControlledStorage();
  const oldState = createEmptyState(NOW);
  oldState.revision = 3;
  oldState.settings = { keepScreenAwake: true };
  backend.seed(STORAGE_KEYS.primary, JSON.stringify(oldState));
  backend.failPrimaryWrites = true;

  const store = new LocalStateStore({ backend, now: () => "2026-08-20T00:05:00.000Z" });
  const nextState = structuredClone(oldState);
  nextState.settings.restTimerVibration = true;

  assert.throws(() => store.save(nextState), (error) => error?.code === "QUOTA_EXCEEDED");

  const primary = JSON.parse(backend.getItem(STORAGE_KEYS.primary));
  const backup = JSON.parse(backend.getItem(STORAGE_KEYS.backup));
  assert.equal(primary.revision, 3);
  assert.deepEqual(backup, oldState);
  assert.equal(store.load().revision, 3);
}

console.log("FAZ 10 storage resilience tests passed.");
