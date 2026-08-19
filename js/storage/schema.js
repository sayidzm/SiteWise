export const CURRENT_SCHEMA_VERSION = 1;

export const STORAGE_KEYS = Object.freeze({
  primary: "workout-tracker:state",
  backup: "workout-tracker:state:backup",
  preImport: "workout-tracker:state:pre-import",
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
  if (isIsoDate(state.createdAt) && isIsoDate(state.updatedAt) && Date.parse(state.updatedAt) < Date.parse(state.createdAt)) {
    errors.push("updatedAt cannot be earlier than createdAt.");
  }

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

  const sessionIds = new Set();
  const setIds = new Set();
  const inProgressIds = [];

  if (state.sessions && typeof state.sessions === "object" && !Array.isArray(state.sessions)) {
    for (const [sessionKey, session] of Object.entries(state.sessions)) {
      const result = validateWorkoutSession(session);
      for (const error of result.errors) errors.push(`sessions.${sessionKey}: ${error}`);

      if (session?.id !== sessionKey) {
        errors.push(`sessions.${sessionKey}: map key must match session.id.`);
      }

      if (typeof session?.id === "string") {
        if (sessionIds.has(session.id)) errors.push(`Duplicate session id detected: ${session.id}.`);
        sessionIds.add(session.id);
      }

      if (session?.status === "in_progress") inProgressIds.push(sessionKey);

      for (const exercise of Array.isArray(session?.exercises) ? session.exercises : []) {
        for (const set of Array.isArray(exercise?.sets) ? exercise.sets : []) {
          if (typeof set?.id !== "string") continue;
          if (setIds.has(set.id)) errors.push(`Duplicate set id detected: ${set.id}.`);
          setIds.add(set.id);
        }
      }
    }
  }

  if (inProgressIds.length > 1) {
    errors.push("Only one in-progress session may exist at a time.");
  }

  if (state.activeSessionId && state.sessions && !state.sessions[state.activeSessionId]) {
    errors.push("activeSessionId must reference an existing session.");
  }

  if (state.activeSessionId && state.sessions?.[state.activeSessionId]?.status !== "in_progress") {
    errors.push("activeSessionId must reference an in-progress session.");
  }

  if (inProgressIds.length === 1 && state.activeSessionId !== inProgressIds[0]) {
    errors.push("The in-progress session must be referenced by activeSessionId.");
  }

  if (inProgressIds.length === 0 && state.activeSessionId !== null) {
    errors.push("activeSessionId must be null when no in-progress session exists.");
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

  if (!session.workoutSnapshot || typeof session.workoutSnapshot !== "object" || Array.isArray(session.workoutSnapshot)) {
    errors.push("workoutSnapshot must be an object.");
  } else {
    requiredString(session.workoutSnapshot.focus, "workoutSnapshot.focus", errors);
    validateRange(session.workoutSnapshot.estimatedDuration, "workoutSnapshot.estimatedDuration", errors, { minValue: 0 });
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

  validateSessionLifecycle(session, errors);

  if (!Number.isInteger(session.currentExerciseIndex) || session.currentExerciseIndex < 0) {
    errors.push("currentExerciseIndex must be a non-negative integer.");
  }

  if (typeof session.notes !== "string") errors.push("notes must be a string.");

  if (!Array.isArray(session.exercises)) {
    errors.push("exercises must be an array.");
  } else {
    const slotIds = new Set();

    session.exercises.forEach((exercise, exerciseIndex) => {
      validateExerciseSession(exercise, errors, exerciseIndex, session);
      if (typeof exercise?.slotId === "string") {
        if (slotIds.has(exercise.slotId)) errors.push(`Duplicate exercise slotId detected: ${exercise.slotId}.`);
        slotIds.add(exercise.slotId);
      }
    });

    if (session.exercises.length > 0 && session.currentExerciseIndex >= session.exercises.length) {
      errors.push("currentExerciseIndex is outside the exercise list.");
    }
  }

  return { valid: errors.length === 0, errors };
}

function validateSessionLifecycle(session, errors) {
  if (session.status === "in_progress") {
    if (session.completedAt !== null) errors.push("in-progress session completedAt must be null.");
    if (session.discardedAt !== null) errors.push("in-progress session discardedAt must be null.");
  }

  if (session.status === "completed") {
    if (!isIsoDate(session.completedAt)) errors.push("completed session must have completedAt.");
    if (session.discardedAt !== null) errors.push("completed session discardedAt must be null.");
  }

  if (session.status === "discarded") {
    if (!isIsoDate(session.discardedAt)) errors.push("discarded session must have discardedAt.");
    if (session.completedAt !== null) errors.push("discarded session completedAt must be null.");
  }

  if (isIsoDate(session.startedAt) && isIsoDate(session.updatedAt) && Date.parse(session.updatedAt) < Date.parse(session.startedAt)) {
    errors.push("updatedAt cannot be earlier than startedAt.");
  }

  for (const [field, value] of [["completedAt", session.completedAt], ["discardedAt", session.discardedAt]]) {
    if (isIsoDate(session.startedAt) && isIsoDate(value) && Date.parse(value) < Date.parse(session.startedAt)) {
      errors.push(`${field} cannot be earlier than startedAt.`);
    }
  }
}

function validateExerciseSession(exercise, errors, exerciseIndex, session) {
  const path = `exercises[${exerciseIndex}]`;
  requiredString(exercise?.slotId, `${path}.slotId`, errors);
  requiredString(exercise?.exerciseName, `${path}.exerciseName`, errors);

  if (typeof exercise?.targetMuscles !== "string" || exercise.targetMuscles.trim() === "") {
    errors.push(`${path}.targetMuscles must be a non-empty string.`);
  }

  if (exercise?.selectedVariation !== null && typeof exercise?.selectedVariation !== "string") {
    errors.push(`${path}.selectedVariation must be null or a string.`);
  }

  if (typeof exercise?.notes !== "string") errors.push(`${path}.notes must be a string.`);
  if (typeof exercise?.painOrDiscomfort !== "string") errors.push(`${path}.painOrDiscomfort must be a string.`);

  const prescription = exercise?.prescriptionSnapshot;
  if (!prescription || typeof prescription !== "object" || Array.isArray(prescription)) {
    errors.push(`${path}.prescriptionSnapshot must be an object.`);
  } else {
    if (!Number.isInteger(prescription.workingSets) || prescription.workingSets < 1) {
      errors.push(`${path}.prescriptionSnapshot.workingSets must be a positive integer.`);
    }
    validateRange(prescription.reps, `${path}.prescriptionSnapshot.reps`, errors, { minValue: 0, integers: true });
    if (prescription?.reps && typeof prescription.reps.perSide !== "boolean") {
      errors.push(`${path}.prescriptionSnapshot.reps.perSide must be boolean.`);
    }
    validateRange(prescription.rir, `${path}.prescriptionSnapshot.rir`, errors, { minValue: 0, maxValue: 10, integers: true });
    validateRange(prescription.restSeconds, `${path}.prescriptionSnapshot.restSeconds`, errors, { minValue: 0, integers: true });
  }

  if (!Array.isArray(exercise?.sets)) {
    errors.push(`${path}.sets must be an array.`);
    return;
  }

  const setNumbersByType = new Set();
  let workingSetCount = 0;

  exercise.sets.forEach((set, setIndex) => {
    validateSetRecord(set, errors, `${path}.sets[${setIndex}]`, session);
    const key = `${set?.type}:${set?.setNumber}`;
    if (setNumbersByType.has(key)) errors.push(`${path} has duplicate ${set?.type} setNumber ${set?.setNumber}.`);
    setNumbersByType.add(key);
    if (set?.type === "working") workingSetCount += 1;
  });

  if (Number.isInteger(prescription?.workingSets) && workingSetCount !== prescription.workingSets) {
    errors.push(`${path} working set count must match prescriptionSnapshot.workingSets.`);
  }
}

function validateSetRecord(set, errors, path, session) {
  requiredString(set?.id, `${path}.id`, errors);

  if (!Number.isInteger(set?.setNumber) || set.setNumber < 1) {
    errors.push(`${path}.setNumber must be a positive integer.`);
  }

  if (!["working", "warmup"].includes(set?.type)) {
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

  if (set?.completedAt === null) {
    if (set?.restStartedAt !== null || set?.restEndsAt !== null) {
      errors.push(`${path} cannot have rest timestamps before completion.`);
    }
  } else {
    if (set?.type === "working") {
      if (set?.weight === null || set?.reps === null || set?.rir === null) {
        errors.push(`${path} completed working set must have weight, reps and rir.`);
      }
      if (!isIsoDate(set?.restStartedAt) || !isIsoDate(set?.restEndsAt)) {
        errors.push(`${path} completed working set must have valid restStartedAt and restEndsAt.`);
      }
    }
    if (isIsoDate(set.completedAt) && isIsoDate(set.restStartedAt) && Date.parse(set.restStartedAt) < Date.parse(set.completedAt)) {
      errors.push(`${path}.restStartedAt cannot be earlier than completedAt.`);
    }
    if (isIsoDate(set.restStartedAt) && isIsoDate(set.restEndsAt) && Date.parse(set.restEndsAt) < Date.parse(set.restStartedAt)) {
      errors.push(`${path}.restEndsAt cannot be earlier than restStartedAt.`);
    }
  }

  if (isIsoDate(session?.startedAt) && isIsoDate(set?.completedAt) && Date.parse(set.completedAt) < Date.parse(session.startedAt)) {
    errors.push(`${path}.completedAt cannot be earlier than session.startedAt.`);
  }
  if (session?.status === "completed" && isIsoDate(session.completedAt) && isIsoDate(set?.completedAt) && Date.parse(set.completedAt) > Date.parse(session.completedAt)) {
    errors.push(`${path}.completedAt cannot be later than session.completedAt.`);
  }
}

function validateRange(value, path, errors, { minValue = 0, maxValue = Number.MAX_SAFE_INTEGER, integers = true } = {}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    errors.push(`${path} must be an object with min and max.`);
    return;
  }

  const validNumber = (number) => typeof number === "number" && Number.isFinite(number) && (!integers || Number.isInteger(number));
  if (!validNumber(value.min) || value.min < minValue || value.min > maxValue) {
    errors.push(`${path}.min is invalid.`);
  }
  if (!validNumber(value.max) || value.max < minValue || value.max > maxValue) {
    errors.push(`${path}.max is invalid.`);
  }
  if (validNumber(value.min) && validNumber(value.max) && value.min > value.max) {
    errors.push(`${path}.min cannot be greater than max.`);
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

export function isIsoDate(value) {
  if (typeof value !== "string" || value.trim() === "") return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
}
