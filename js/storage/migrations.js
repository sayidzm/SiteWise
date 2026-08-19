import { CURRENT_SCHEMA_VERSION } from "./schema.js";

export function migrateState(state) {
  if (!state || typeof state !== "object") {
    throw new Error("Cannot migrate an invalid state value.");
  }

  const sourceVersion = Number(state.schemaVersion);
  if (!Number.isInteger(sourceVersion) || sourceVersion < 1) {
    throw new Error("Stored data has no supported schemaVersion.");
  }

  if (sourceVersion > CURRENT_SCHEMA_VERSION) {
    throw new Error(`Stored schema v${sourceVersion} is newer than this app supports (v${CURRENT_SCHEMA_VERSION}).`);
  }

  let migrated = structuredCloneSafe(state);

  // Future migrations are deliberately sequential:
  // if (migrated.schemaVersion === 1) migrated = migrateV1ToV2(migrated);

  return migrated;
}

function structuredCloneSafe(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}
