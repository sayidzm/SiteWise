export const CURRENT_SCHEMA_VERSION = 1;

export const STORAGE_KEYS = Object.freeze({
  primary: "workout-tracker:state",
  backup: "workout-tracker:state:backup",
});

export function createEmptyState(now = new Date().toISOString()) {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    revision: 0,
    createdAt: now,
    updatedAt: now,
    activeSessionId: null,
    sessions: {},
    settings: {},
  };
}

export function validateState(state) {
  const errors = [];

  if (!state || typeof state !== "object" || Array.isArray(state)) {
    return { valid: false, errors: ["State must be an object."] };
  }

  if (!Number.isInteger(state.schemaVersion) || state.schemaVersion < 1) {
    errors.push("schemaVersion must be a positive integer.");
  }

  if (!Number.isInteger(state.revision) || state.revision < 0) {
    errors.push("revision must be a non-negative integer.");
  }

  if (!isIsoDate(state.createdAt)) errors.push("createdAt must be an ISO date string.");
  if (!isIsoDate(state.updatedAt)) errors.push("updatedAt must be an ISO date string.");

  if (state.activeSessionId !== null && typeof state.activeSessionId !== "string") {
    errors.push("activeSessionId must be null or a string.");
  }

  if (!state.sessions || typeof state.sessions !== "object" || Array.isArray(state.sessions)) {
    errors.push("sessions must be an object map.");
  }

  if (!state.settings || typeof state.settings !== "object" || Array.isArray(state.settings)) {
    errors.push("settings must be an object.");
  } else {
    for (const key of ["keepScreenAwake", "restTimerVibration", "confirmIncompleteFinish"]) {
      if (key in state.settings && typeof state.settings[key] !== "boolean") {
        errors.push(`settings.${key} must be boolean when present.`);
      }
    }
  }

  if (state.sessions && typeof state.sessions === "object" && !Array.isArray(state.sessions)) {
    for (const [sessionId, session] of Object.entries(state.sessions)) {
      const result = validateWorkoutSession(session);
      for (const error of result.errors) errors.push(`sessions.${sessionId}: ${error}`);
    }
  }

  if (state.activeSessionId && state.sessions && !state.sessions[state.activeSessionId]) {
    errors.push("activeSessionId must reference an existing session.");
  }

  if (state.activeSessionId && state.sessions?.[state.activeSessionId]?.status !== "in_progress") {
    errors.push("activeSessionId must reference an in-progress session.");
  }

  return { valid: errors.length === 0, errors };
}

export function validateWorkoutSession(session) {
  const errors = [];

  if (!session || typeof session !== "object" || Array.isArray(session)) {
    return { valid: false, errors: ["Session must be an object."] };
  }

  requiredString(session.id, "id", errors);
  requiredString(session.programId, "programId", errors);
  requiredString(session.workoutId, "workoutId", errors);
  requiredString(session.workoutName, "workoutName", errors);

  if (!Number.isInteger(session.programSchemaVersion) || session.programSchemaVersion < 1) {
    errors.push("programSchemaVersion must be a positive integer.");
  }

  if (!["in_progress", "completed", "discarded"].includes(session.status)) {
    errors.push("status is invalid.");
  }

  if (!isIsoDate(session.startedAt)) errors.push("startedAt must be an ISO date string.");
  if (!isIsoDate(session.updatedAt)) errors.push("updatedAt must be an ISO date string.");

  if (session.completedAt !== null && !isIsoDate(session.completedAt)) {
    errors.push("completedAt must be null or an ISO date string.");
  }

  if (session.discardedAt !== null && !isIsoDate(session.discardedAt)) {
    errors.push("discardedAt must be null or an ISO date string.");
  }

  if (!Number.isInteger(session.currentExerciseIndex) || session.currentExerciseIndex < 0) {
    errors.push("currentExerciseIndex must be a non-negative integer.");
  }

  if (!Array.isArray(session.exercises)) {
    errors.push("exercises must be an array.");
  } else {
    session.exercises.forEach((exercise, exerciseIndex) => {
      validateExerciseSession(exercise, errors, exerciseIndex);
    });

    if (session.exercises.length > 0 && session.currentExerciseIndex >= session.exercises.length) {
      errors.push("currentExerciseIndex is outside the exercise list.");
    }
  }

  return { valid: errors.length === 0, errors };
}

function validateExerciseSession(exercise, errors, exerciseIndex) {
  const path = `exercises[${exerciseIndex}]`;
  requiredString(exercise?.slotId, `${path}.slotId`, errors);
  requiredString(exercise?.exerciseName, `${path}.exerciseName`, errors);

  if (exercise?.selectedVariation !== null && typeof exercise?.selectedVariation !== "string") {
    errors.push(`${path}.selectedVariation must be null or a string.`);
  }

  if (!Array.isArray(exercise?.sets)) {
    errors.push(`${path}.sets must be an array.`);
    return;
  }

  exercise.sets.forEach((set, setIndex) => validateSetRecord(set, errors, `${path}.sets[${setIndex}]`));
}

function validateSetRecord(set, errors, path) {
  requiredString(set?.id, `${path}.id`, errors);

  if (!Number.isInteger(set?.setNumber) || set.setNumber < 1) {
    errors.push(`${path}.setNumber must be a positive integer.`);
  }

  if (!['working', 'warmup'].includes(set?.type)) {
    errors.push(`${path}.type must be working or warmup.`);
  }

  nullableFiniteNumber(set?.weight, `${path}.weight`, errors, 0);
  nullableInteger(set?.reps, `${path}.reps`, errors, 0);
  nullableInteger(set?.rir, `${path}.rir`, errors, 0, 10);

  if (set?.completedAt !== null && !isIsoDate(set?.completedAt)) {
    errors.push(`${path}.completedAt must be null or an ISO date string.`);
  }

  if (set?.restStartedAt !== null && !isIsoDate(set?.restStartedAt)) {
    errors.push(`${path}.restStartedAt must be null or an ISO date string.`);
  }

  if (set?.restEndsAt !== null && !isIsoDate(set?.restEndsAt)) {
    errors.push(`${path}.restEndsAt must be null or an ISO date string.`);
  }
}

function requiredString(value, path, errors) {
  if (typeof value !== "string" || value.trim() === "") errors.push(`${path} must be a non-empty string.`);
}

function nullableFiniteNumber(value, path, errors, min) {
  if (value === null) return;
  if (typeof value !== "number" || !Number.isFinite(value) || value < min) {
    errors.push(`${path} must be null or a finite number >= ${min}.`);
  }
}

function nullableInteger(value, path, errors, min, max = Number.MAX_SAFE_INTEGER) {
  if (value === null) return;
  if (!Number.isInteger(value) || value < min || value > max) {
    errors.push(`${path} must be null or an integer from ${min} to ${max}.`);
  }
}

function isIsoDate(value) {
  if (typeof value !== "string" || value.trim() === "") return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
}
