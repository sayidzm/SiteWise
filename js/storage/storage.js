import { STORAGE_KEYS, createEmptyState, validateState } from "./schema.js";
import { migrateState } from "./migrations.js";

export class StorageError extends Error {
  constructor(message, cause, { code = "STORAGE_ERROR" } = {}) {
    super(message);
    this.name = "StorageError";
    this.cause = cause;
    this.code = code;
  }
}

export class LocalStateStore {
  constructor({ backend = globalThis.localStorage, now = () => new Date().toISOString() } = {}) {
    if (!backend || typeof backend.getItem !== "function" || typeof backend.setItem !== "function") {
      throw new TypeError("A Web Storage-compatible backend is required.");
    }

    this.backend = backend;
    this.now = now;
  }

  load() {
    const primary = this.#readKey(STORAGE_KEYS.primary);
    if (primary.ok) return primary.state;

    const backup = this.#readKey(STORAGE_KEYS.backup);
    if (backup.ok) {
      // Reading a valid backup must still succeed when the browser temporarily
      // refuses writes (quota/private-mode/security restrictions). Repair the
      // primary copy when possible, but never make recovery depend on it.
      try {
        this.#writeRaw(STORAGE_KEYS.primary, JSON.stringify(backup.state));
      } catch {
        // The next successful save can repair the primary state.
      }
      return clone(backup.state);
    }

    if (!primary.exists && !backup.exists) {
      return createEmptyState(this.now());
    }

    throw new StorageError("Workout data is unreadable and no valid backup is available.", primary.error ?? backup.error);
  }

  save(nextState) {
    const now = this.now();
    const current = this.#readKey(STORAGE_KEYS.primary);
    const normalized = clone(nextState);

    normalized.revision = Number.isInteger(normalized.revision) ? normalized.revision + 1 : 1;
    normalized.updatedAt = now;

    const validation = validateState(normalized);
    if (!validation.valid) {
      throw new StorageError(`Refusing to save invalid state: ${validation.errors.join(" ")}`);
    }

    try {
      if (current.ok) {
        this.#writeRaw(STORAGE_KEYS.backup, JSON.stringify(current.state));
      }
      this.#writeRaw(STORAGE_KEYS.primary, JSON.stringify(normalized));
      return clone(normalized);
    } catch (error) {
      if (isQuotaExceededError(error)) {
        throw new StorageError(
          "Cihazdaki yerel depolama alanı dolu. Veriyi kaydetmeden önce tarayıcı depolamasında yer aç veya mevcut yedeğini dışa aktar.",
          error,
          { code: "QUOTA_EXCEEDED" },
        );
      }
      throw new StorageError("Workout verisi cihazda kalıcı olarak kaydedilemedi.", error);
    }
  }

  update(mutator) {
    if (typeof mutator !== "function") throw new TypeError("mutator must be a function.");

    const draft = clone(this.load());
    const result = mutator(draft);
    return this.save(result ?? draft);
  }

  reset() {
    try {
      this.backend.removeItem(STORAGE_KEYS.primary);
      this.backend.removeItem(STORAGE_KEYS.backup);
    } catch (error) {
      throw new StorageError("Unable to reset workout data.", error);
    }
    return createEmptyState(this.now());
  }

  #readKey(key) {
    let raw;
    try {
      raw = this.backend.getItem(key);
    } catch (error) {
      return { ok: false, exists: true, error };
    }

    if (raw === null) return { ok: false, exists: false, error: null };

    try {
      const parsed = JSON.parse(raw);
      const migrated = migrateState(parsed);
      const validation = validateState(migrated);
      if (!validation.valid) {
        return {
          ok: false,
          exists: true,
          error: new Error(`Invalid state: ${validation.errors.join(" ")}`),
        };
      }
      return { ok: true, exists: true, state: migrated };
    } catch (error) {
      return { ok: false, exists: true, error };
    }
  }

  #writeRaw(key, value) {
    this.backend.setItem(key, value);
  }
}

function isQuotaExceededError(error) {
  if (!error || typeof error !== "object") return false;
  return error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED" || error.code === 22 || error.code === 1014;
}

function clone(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}
