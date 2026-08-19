import { CURRENT_SCHEMA_VERSION, isIsoDate, validateState } from "../storage/schema.js";
import { migrateState } from "../storage/migrations.js";

export const BACKUP_FORMAT = "workout-tracker-backup";
export const BACKUP_FORMAT_VERSION = 1;
export const BACKUP_APP_VERSION = "0.11.0";
export const MAX_IMPORT_BYTES = 5 * 1024 * 1024;

export class DataPortabilityService {
  constructor(store, { now = () => new Date().toISOString() } = {}) {
    this.store = store;
    this.now = now;
  }

  createExportEnvelope() {
    const data = this.store.load();
    return {
      format: BACKUP_FORMAT,
      formatVersion: BACKUP_FORMAT_VERSION,
      appVersion: BACKUP_APP_VERSION,
      exportedAt: this.now(),
      appSchemaVersion: CURRENT_SCHEMA_VERSION,
      summary: summarizeState(data),
      data,
    };
  }

  createExportText() {
    return JSON.stringify(this.createExportEnvelope(), null, 2);
  }

  /**
   * Parses, migrates and fully validates a backup without modifying device data.
   * This is intentionally separate from import so the UI can show a trustworthy
   * summary before asking the user to replace their current state.
   */
  inspectImportText(text) {
    assertImportText(text);

    let envelope;
    try {
      envelope = JSON.parse(text);
    } catch {
      throw new Error("Yedek dosyası geçerli JSON değil.");
    }

    validateEnvelope(envelope);

    const migrated = migrateState(clone(envelope.data));
    const validation = validateState(migrated);
    if (!validation.valid) {
      throw new Error(`Yedek verisi doğrulanamadı: ${validation.errors.join(" ")}`);
    }

    if (envelope.appSchemaVersion !== migrated.schemaVersion) {
      throw new Error(
        `Yedek metadata schema sürümü (${envelope.appSchemaVersion}) ile veri schema sürümü (${migrated.schemaVersion}) eşleşmiyor.`,
      );
    }

    return Object.freeze({
      format: envelope.format,
      formatVersion: envelope.formatVersion,
      appVersion: typeof envelope.appVersion === "string" ? envelope.appVersion : null,
      exportedAt: envelope.exportedAt,
      sourceSchemaVersion: envelope.appSchemaVersion,
      targetSchemaVersion: migrated.schemaVersion,
      summary: summarizeState(migrated),
      migratedState: clone(migrated),
    });
  }

  importText(text) {
    const inspection = this.inspectImportText(text);

    // A dedicated snapshot is created only after the incoming file is proven
    // valid, but before the current state is replaced. If snapshot creation
    // fails, the import is aborted rather than risking an un-undoable replace.
    this.store.createPreImportSnapshot();

    try {
      return this.store.replace(inspection.migratedState, { backupCurrent: true });
    } catch (error) {
      // Keep the pre-import snapshot for recovery even when the replacement
      // itself fails. No valid incoming state is ever partially committed.
      throw error;
    }
  }

  hasPreImportRecovery() {
    return this.store.hasPreImportSnapshot();
  }

  getPreImportRecoverySummary() {
    const state = this.store.getPreImportSnapshot();
    return state ? summarizeState(state) : null;
  }

  restorePreImport() {
    return this.store.restorePreImportSnapshot();
  }
}

function validateEnvelope(envelope) {
  if (!envelope || typeof envelope !== "object" || Array.isArray(envelope)) {
    throw new Error("Yedek dosyası geçersiz.");
  }
  if (envelope.format !== BACKUP_FORMAT) {
    throw new Error("Bu dosya Workout Tracker yedeği değil.");
  }
  if (envelope.formatVersion !== BACKUP_FORMAT_VERSION) {
    throw new Error(`Bu yedek formatı desteklenmiyor. Desteklenen format sürümü: ${BACKUP_FORMAT_VERSION}.`);
  }
  if (!Number.isInteger(envelope.appSchemaVersion) || envelope.appSchemaVersion < 1) {
    throw new Error("Yedek appSchemaVersion bilgisi geçersiz.");
  }
  if (envelope.appSchemaVersion > CURRENT_SCHEMA_VERSION) {
    throw new Error(
      `Bu yedek daha yeni bir veri şeması kullanıyor (v${envelope.appSchemaVersion}). Bu uygulama en fazla v${CURRENT_SCHEMA_VERSION} destekliyor.`,
    );
  }
  if (!isIsoDate(envelope.exportedAt)) {
    throw new Error("Yedek exportedAt bilgisi geçerli bir ISO tarih değil.");
  }
  if (!envelope.data || typeof envelope.data !== "object" || Array.isArray(envelope.data)) {
    throw new Error("Yedek içerisinde uygulama verisi bulunamadı.");
  }
}

function assertImportText(text) {
  if (typeof text !== "string" || text.trim() === "") {
    throw new Error("Yedek dosyası boş.");
  }

  const byteLength = new TextEncoder().encode(text).byteLength;
  if (byteLength > MAX_IMPORT_BYTES) {
    throw new Error(`Yedek dosyası beklenenden büyük. En fazla ${Math.floor(MAX_IMPORT_BYTES / 1024 / 1024)} MB yedek destekleniyor.`);
  }
}

function summarizeState(state) {
  const sessions = Object.values(state?.sessions ?? {});
  const completed = sessions.filter((session) => session.status === "completed");
  const inProgress = sessions.filter((session) => session.status === "in_progress");
  const discarded = sessions.filter((session) => session.status === "discarded");

  let workingSets = 0;
  let completedSets = 0;
  for (const session of sessions) {
    for (const exercise of session.exercises ?? []) {
      for (const set of exercise.sets ?? []) {
        if (set.type !== "working") continue;
        workingSets += 1;
        if (set.completedAt) completedSets += 1;
      }
    }
  }

  const active = state?.activeSessionId ? state.sessions?.[state.activeSessionId] : null;
  return Object.freeze({
    sessions: sessions.length,
    completedSessions: completed.length,
    inProgressSessions: inProgress.length,
    discardedSessions: discarded.length,
    workingSets,
    completedSets,
    activeSessionId: state?.activeSessionId ?? null,
    activeWorkoutName: active?.workoutName ?? null,
  });
}

function clone(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}
