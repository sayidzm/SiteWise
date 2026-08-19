export class PreviousPerformanceService {
  constructor(repository) {
    this.repository = repository;
  }

  getPreviousExercise(activeSession, slotId) {
    if (!activeSession?.id || !slotId) return null;

    const currentExercise = activeSession.exercises.find((exercise) => exercise.slotId === slotId);
    if (!currentExercise) return null;

    const previousSession = this.repository
      .listSessions()
      .find((session) => {
        if (session.id === activeSession.id || session.status !== "completed") return false;
        if (session.workoutId !== activeSession.workoutId) return false;
        if (Date.parse(session.startedAt) >= Date.parse(activeSession.startedAt)) return false;

        const exercise = session.exercises.find((item) => item.slotId === slotId);
        if (!exercise) return false;

        const previousVariation = exercise.selectedVariation;
        const currentVariation = currentExercise.selectedVariation;
        if (previousVariation && currentVariation && previousVariation !== currentVariation) return false;

        return exercise.sets.some((set) => set.type === "working" && set.completedAt);
      });

    if (!previousSession) return null;

    const exercise = previousSession.exercises.find((item) => item.slotId === slotId);
    return {
      sessionId: previousSession.id,
      completedAt: previousSession.completedAt,
      sets: exercise.sets
        .filter((set) => set.type === "working" && set.completedAt)
        .map((set) => ({
          setNumber: set.setNumber,
          weight: set.weight,
          reps: set.reps,
          rir: set.rir,
        })),
    };
  }
}
