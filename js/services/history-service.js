export class HistoryService {
  constructor(repository) {
    this.repository = repository;
  }

  listCompleted() {
    return this.repository
      .listSessions()
      .filter((session) => session.status === "completed" && session.completedAt)
      .sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt))
      .map((session) => summarizeSession(session));
  }

  getCompleted(sessionId) {
    if (!sessionId) return null;
    const session = this.repository.getSession(sessionId);
    if (!session || session.status !== "completed" || !session.completedAt) return null;
    return {
      session,
      summary: summarizeSession(session),
    };
  }
}

export function summarizeSession(session) {
  const workingSets = session.exercises.flatMap((exercise) =>
    exercise.sets.filter((set) => set.type === "working")
  );
  const completedSets = workingSets.filter((set) => Boolean(set.completedAt));
  const touchedExercises = session.exercises.filter((exercise) =>
    exercise.sets.some((set) => set.type === "working" && set.completedAt)
  );

  const start = Date.parse(session.startedAt);
  const end = Date.parse(session.completedAt);
  const durationSeconds = Number.isFinite(start) && Number.isFinite(end)
    ? Math.max(0, Math.round((end - start) / 1000))
    : null;

  return {
    id: session.id,
    workoutId: session.workoutId,
    workoutName: session.workoutName,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    durationSeconds,
    completedSetCount: completedSets.length,
    plannedSetCount: workingSets.length,
    touchedExerciseCount: touchedExercises.length,
    plannedExerciseCount: session.exercises.length,
    completedExerciseCount: session.exercises.filter((exercise) => {
      const sets = exercise.sets.filter((set) => set.type === "working");
      return sets.length > 0 && sets.every((set) => Boolean(set.completedAt));
    }).length,
  };
}
