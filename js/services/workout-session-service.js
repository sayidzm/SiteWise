import { PROGRAM } from "../data/program-data.js";
import { createWorkoutSession } from "../models/workout-session.js";

export class WorkoutSessionService {
  constructor(repository, { program = PROGRAM } = {}) {
    this.repository = repository;
    this.program = program;
  }

  start(workoutId, options) {
    const session = createWorkoutSession(this.program, workoutId, options);
    return this.repository.createSession(session);
  }

  resume() {
    return this.repository.getActiveSession();
  }

  saveSetDraft(sessionId, slotId, setNumber, patch) {
    const normalizedPatch = normalizeSetPatch(patch);

    return this.repository.updateSession(sessionId, (session) => {
      const exercise = session.exercises.find((item) => item.slotId === slotId);
      if (!exercise) throw new Error(`Unknown exercise slot: ${slotId}`);

      const set = exercise.sets.find((item) => item.setNumber === setNumber && item.type === "working");
      if (!set) throw new Error(`Unknown working set ${setNumber} for ${slotId}.`);
      if (set.completedAt) throw new Error("A completed set cannot be edited as a draft.");

      if ("weight" in normalizedPatch) set.weight = normalizedPatch.weight;
      if ("reps" in normalizedPatch) set.reps = normalizedPatch.reps;
      if ("rir" in normalizedPatch) set.rir = normalizedPatch.rir;
      return session;
    });
  }

  completeSet(sessionId, slotId, setNumber, {
    weight,
    reps,
    rir,
    completedAt = new Date().toISOString(),
    restSeconds = null,
  }) {
    const normalized = normalizeSetInput({ weight, reps, rir });

    return this.repository.updateSession(sessionId, (session) => {
      const exerciseIndex = session.exercises.findIndex((item) => item.slotId === slotId);
      if (exerciseIndex === -1) throw new Error(`Unknown exercise slot: ${slotId}`);

      const exercise = session.exercises[exerciseIndex];
      const set = exercise.sets.find((item) => item.setNumber === setNumber && item.type === "working");
      if (!set) throw new Error(`Unknown working set ${setNumber} for ${slotId}.`);
      if (set.completedAt) throw new Error("This set is already completed.");

      set.weight = normalized.weight;
      set.reps = normalized.reps;
      set.rir = normalized.rir;
      set.completedAt = completedAt;

      const targetRest = restSeconds ?? exercise.prescriptionSnapshot.restSeconds.min;
      if (!Number.isInteger(targetRest) || targetRest < 0) throw new Error("restSeconds must be a non-negative integer.");

      set.restStartedAt = completedAt;
      set.restEndsAt = new Date(Date.parse(completedAt) + targetRest * 1000).toISOString();

      session.currentExerciseIndex = exerciseIndex;
      return session;
    });
  }

  setCurrentExercise(sessionId, exerciseIndex) {
    return this.repository.updateSession(sessionId, (session) => {
      if (!Number.isInteger(exerciseIndex) || exerciseIndex < 0 || exerciseIndex >= session.exercises.length) {
        throw new Error("exerciseIndex is outside the workout.");
      }
      session.currentExerciseIndex = exerciseIndex;
      return session;
    });
  }

  adjustRest(sessionId, slotId, setNumber, deltaSeconds) {
    if (!Number.isInteger(deltaSeconds)) throw new Error("deltaSeconds must be an integer.");

    return this.repository.updateSession(sessionId, (session) => {
      const set = findCompletedWorkingSet(session, slotId, setNumber);
      const base = Date.parse(set.restEndsAt ?? set.completedAt);
      const effectiveBase = deltaSeconds >= 0 ? Math.max(Date.now(), base) : base;
      set.restEndsAt = new Date(Math.max(Date.now(), effectiveBase + deltaSeconds * 1000)).toISOString();
      if (!set.restStartedAt) set.restStartedAt = set.completedAt;
      return session;
    });
  }

  skipRest(sessionId, slotId, setNumber, skippedAt = new Date().toISOString()) {
    return this.repository.updateSession(sessionId, (session) => {
      const set = findCompletedWorkingSet(session, slotId, setNumber);
      set.restEndsAt = skippedAt;
      if (!set.restStartedAt) set.restStartedAt = set.completedAt;
      return session;
    });
  }

  setExerciseVariation(sessionId, slotId, selectedVariation) {
    return this.repository.updateSession(sessionId, (session) => {
      const exercise = session.exercises.find((item) => item.slotId === slotId);
      if (!exercise) throw new Error(`Unknown exercise slot: ${slotId}`);
      exercise.selectedVariation = selectedVariation === null ? null : String(selectedVariation).trim() || null;
      return session;
    });
  }

  setExerciseNotes(sessionId, slotId, { notes, painOrDiscomfort }) {
    return this.repository.updateSession(sessionId, (session) => {
      const exercise = session.exercises.find((item) => item.slotId === slotId);
      if (!exercise) throw new Error(`Unknown exercise slot: ${slotId}`);
      if (notes !== undefined) exercise.notes = String(notes).trim();
      if (painOrDiscomfort !== undefined) exercise.painOrDiscomfort = String(painOrDiscomfort).trim();
      return session;
    });
  }

  complete(sessionId, completedAt) {
    return this.repository.completeSession(sessionId, completedAt);
  }

  discard(sessionId, discardedAt) {
    return this.repository.discardSession(sessionId, discardedAt);
  }
}

function normalizeSetPatch(patch = {}) {
  const normalized = {};

  if (Object.prototype.hasOwnProperty.call(patch, "weight")) {
    const weight = numberOrNull(patch.weight);
    if (weight !== null && weight < 0) throw new Error("Weight cannot be negative.");
    normalized.weight = weight;
  }

  if (Object.prototype.hasOwnProperty.call(patch, "reps")) {
    const reps = integerOrNull(patch.reps);
    if (reps !== null && reps < 0) throw new Error("Reps cannot be negative.");
    normalized.reps = reps;
  }

  if (Object.prototype.hasOwnProperty.call(patch, "rir")) {
    const rir = integerOrNull(patch.rir);
    if (rir !== null && (rir < 0 || rir > 10)) throw new Error("RIR must be between 0 and 10.");
    normalized.rir = rir;
  }

  return normalized;
}

function normalizeSetInput({ weight, reps, rir }) {
  const normalized = {
    weight: numberOrNull(weight),
    reps: integerOrNull(reps),
    rir: integerOrNull(rir),
  };

  if (normalized.weight === null || normalized.weight < 0) throw new Error("Weight is required and cannot be negative.");
  if (normalized.reps === null || normalized.reps < 0) throw new Error("Reps are required and cannot be negative.");
  if (normalized.rir === null || normalized.rir < 0 || normalized.rir > 10) throw new Error("RIR must be between 0 and 10.");

  return normalized;
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function integerOrNull(value) {
  const number = numberOrNull(value);
  return Number.isInteger(number) ? number : null;
}

function findCompletedWorkingSet(session, slotId, setNumber) {
  const exercise = session.exercises.find((item) => item.slotId === slotId);
  if (!exercise) throw new Error(`Unknown exercise slot: ${slotId}`);

  const set = exercise.sets.find((item) => item.setNumber === setNumber && item.type === "working");
  if (!set) throw new Error(`Unknown working set ${setNumber} for ${slotId}.`);
  if (!set.completedAt) throw new Error("Rest can only be changed after completing the set.");
  return set;
}
