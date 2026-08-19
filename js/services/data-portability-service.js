import { CURRENT_SCHEMA_VERSION, validateState } from "../storage/schema.js";
import { migrateState } from "../storage/migrations.js";

export const BACKUP_FORMAT = "workout-tracker-backup";
export const BACKUP_FORMAT_VERSION = 1;

export class DataPortabilityService {
  constructor(store, { now = () => new Date().toISOString() } = {}) {
    this.store = store;
    this.now = now;
  }

  createExportEnvelope() {
    return {
      format: BACKUP_FORMAT,
      formatVersion: BACKUP_FORMAT_VERSION,
      exportedAt: this.now(),
      appSchemaVersion: CURRENT_SCHEMA_VERSION,
      data: this.store.load(),
    };
  }

  createExportText() {
    return JSON.stringify(this.createExportEnvelope(), null, 2);
  }

  importText(text) {
    if (typeof text !== "string" || text.trim() === "") {
      throw new Error("Yedek dosyası boş.");
    }

    let envelope;
    try {
      envelope = JSON.parse(text);
    } catch {
      throw new Error("Yedek dosyası geçerli JSON değil.");
    }

    if (!envelope || typeof envelope !== "object" || Array.isArray(envelope)) {
      throw new Error("Yedek dosyası geçersiz.");
    }
    if (envelope.format !== BACKUP_FORMAT) {
      throw new Error("Bu dosya Workout Tracker yedeği değil.");
    }
    if (envelope.formatVersion !== BACKUP_FORMAT_VERSION) {
      throw new Error("Bu yedek formatı desteklenmiyor.");
    }
    if (!envelope.data || typeof envelope.data !== "object" || Array.isArray(envelope.data)) {
      throw new Error("Yedek içerisinde uygulama verisi bulunamadı.");
    }

    const migrated = migrateState(clone(envelope.data));
    const validation = validateState(migrated);
    if (!validation.valid) {
      throw new Error(`Yedek verisi doğrulanamadı: ${validation.errors.join(" ")}`);
    }

    return this.store.save(migrated);
  }
}

function clone(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}
