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
    if (primary.ok) return clone(primary.state);

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
    return this.replace(nextState, { backupCurrent: true });
  }

  /**
   * Replaces the primary application state only after the replacement has
   * passed full schema/integrity validation. The last readable state is copied
   * to the normal rolling backup before the primary write.
   */
  replace(nextState, { backupCurrent = true } = {}) {
    const now = this.now();
    const currentPrimary = this.#readKey(STORAGE_KEYS.primary);
    const currentBackup = this.#readKey(STORAGE_KEYS.backup);
    const normalized = clone(nextState);

    normalized.revision = Number.isInteger(normalized.revision) ? normalized.revision + 1 : 1;
    normalized.updatedAt = now;

    const validation = validateState(normalized);
    if (!validation.valid) {
      throw new StorageError(`Refusing to save invalid state: ${validation.errors.join(" ")}`);
    }

    const bestCurrent = currentPrimary.ok ? currentPrimary : currentBackup.ok ? currentBackup : null;

    try {
      if (backupCurrent && bestCurrent) {
        try {
          this.#writeRaw(STORAGE_KEYS.backup, JSON.stringify(bestCurrent.state));
        } catch (backupError) {
          // The rolling backup is a best-effort recovery copy. Near the storage
          // quota its write (a full copy) can fail while the primary write still
          // fits; aborting the save then would lock every later write behind a
          // ~2x-space requirement. Keep the previous backup as a one-version-
          // stale recovery point and let the primary write proceed. A failing
          // primary write below still aborts the save as before.
        }
      }
      this.#writeRaw(STORAGE_KEYS.primary, JSON.stringify(normalized));
      return clone(normalized);
    } catch (error) {
      // Web Storage setItem is atomic per key. The primary write is the final
      // operation, so a failed replacement leaves the previous primary intact.
      // If the rolling backup write succeeded first, keeping that valid copy is
      // safer than trying to remove it during error recovery.
      throw wrapWriteError(error);
    }
  }

  update(mutator) {
    if (typeof mutator !== "function") throw new TypeError("mutator must be a function.");

    const draft = clone(this.load());
    const result = mutator(draft);
    return this.save(result ?? draft);
  }

  /**
   * Creates a dedicated one-level snapshot immediately before an import.
   * Unlike the rolling backup, this key is not overwritten by ordinary saves,
   * so the user can explicitly undo the latest successful import.
   */
  createPreImportSnapshot() {
    const current = this.load();
    const validation = validateState(current);
    if (!validation.valid) {
      throw new StorageError(`Cannot create pre-import snapshot from invalid state: ${validation.errors.join(" ")}`);
    }

    try {
      this.#writeRaw(STORAGE_KEYS.preImport, JSON.stringify(current));
      return clone(current);
    } catch (error) {
      if (isQuotaExceededError(error)) {
        throw new StorageError(
          "İçe aktarma öncesi güvenlik yedeği oluşturulamadı çünkü yerel depolama alanı dolu. Önce mevcut verini dışa aktar veya depolamada yer aç.",
          error,
          { code: "PREIMPORT_SNAPSHOT_QUOTA" },
        );
      }
      throw new StorageError("İçe aktarma öncesi güvenlik yedeği oluşturulamadı.", error, { code: "PREIMPORT_SNAPSHOT_FAILED" });
    }
  }

  hasPreImportSnapshot() {
    return this.#readKey(STORAGE_KEYS.preImport).ok;
  }

  getPreImportSnapshot() {
    const snapshot = this.#readKey(STORAGE_KEYS.preImport);
    return snapshot.ok ? clone(snapshot.state) : null;
  }

  restorePreImportSnapshot() {
    const snapshot = this.#readKey(STORAGE_KEYS.preImport);
    if (!snapshot.ok) {
      throw new StorageError("Geri alınabilecek geçerli bir içe aktarma öncesi yedek bulunamadı.", snapshot.error, { code: "NO_PREIMPORT_SNAPSHOT" });
    }

    const restored = this.replace(snapshot.state, { backupCurrent: true });
    try {
      this.backend.removeItem(STORAGE_KEYS.preImport);
    } catch {
      // Restored data is already safe. A stale recovery key is harmless and
      // can be overwritten by the next import snapshot.
    }
    return restored;
  }

  clearPreImportSnapshot() {
    try {
      this.backend.removeItem(STORAGE_KEYS.preImport);
    } catch (error) {
      throw new StorageError("İçe aktarma geri alma yedeği silinemedi.", error);
    }
  }

  reset() {
    try {
      this.backend.removeItem(STORAGE_KEYS.primary);
      this.backend.removeItem(STORAGE_KEYS.backup);
      this.backend.removeItem(STORAGE_KEYS.preImport);
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

function wrapWriteError(error) {
  if (isQuotaExceededError(error)) {
    return new StorageError(
      "Cihazdaki yerel depolama alanı dolu. Veriyi kaydetmeden önce tarayıcı depolamasında yer aç veya mevcut yedeğini dışa aktar.",
      error,
      { code: "QUOTA_EXCEEDED" },
    );
  }
  return new StorageError("Workout verisi cihazda kalıcı olarak kaydedilemedi.", error);
}

function isQuotaExceededError(error) {
  if (!error || typeof error !== "object") return false;
  return error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED" || error.code === 22 || error.code === 1014;
}

function clone(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}
