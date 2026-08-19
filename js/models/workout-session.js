export function createWorkoutSession(program, workoutId, {
  idFactory = createId,
  now = () => new Date().toISOString(),
} = {}) {
  const workout = program?.workouts?.[workoutId];
  if (!workout) throw new Error(`Unknown workout: ${workoutId}`);

  const timestamp = now();

  return {
    id: idFactory("session"),
    programId: program.id,
    programSchemaVersion: program.schemaVersion,
    workoutId: workout.id,
    workoutName: workout.name,
    workoutSnapshot: {
      focus: workout.focus,
      estimatedDuration: { ...workout.estimatedDuration },
    },
    status: "in_progress",
    startedAt: timestamp,
    updatedAt: timestamp,
    completedAt: null,
    discardedAt: null,
    currentExerciseIndex: 0,
    notes: "",
    exercises: workout.exercises.map((exercise) => createExerciseSession(exercise, idFactory)),
  };
}

function createExerciseSession(exercise, idFactory) {
  const prescription = exercise.prescription;

  return {
    slotId: exercise.slotId,
    exerciseName: exercise.name,
    targetMuscles: exercise.targetMuscles,
    selectedVariation: null,
    notes: "",
    painOrDiscomfort: "",
    prescriptionSnapshot: {
      workingSets: prescription.workingSets,
      reps: { ...prescription.reps },
      rir: { ...prescription.rir },
      restSeconds: { ...prescription.restSeconds },
    },
    sets: Array.from({ length: prescription.workingSets }, (_, index) => ({
      id: idFactory("set"),
      setNumber: index + 1,
      type: "working",
      weight: null,
      reps: null,
      rir: null,
      completedAt: null,
      restStartedAt: null,
      restEndsAt: null,
    })),
  };
}

function createId(prefix) {
  if (globalThis.crypto?.randomUUID) return `${prefix}_${globalThis.crypto.randomUUID()}`;
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
