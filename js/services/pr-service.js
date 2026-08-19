import { getExerciseHistory } from "./progression-service.js";

export class PRService {
  constructor(repository) {
    this.repository = repository;
  }

  getRecords(workoutId, slotId) {
    const history = getExerciseHistory(this.repository, workoutId, slotId);
    const sets = history.flatMap(({ session, exercise }) => exercise.sets
      .filter((set) => set.type === "working" && set.completedAt)
      .map((set) => ({
        ...set,
        sessionId: session.id,
        completedAt: session.completedAt,
        exerciseName: exercise.exerciseName,
      }))
    );

    if (sets.length === 0) {
      return {
        loadRecordSupported: supportsLoadRecord(workoutId, slotId),
        heaviestLoad: null,
        repRecord: null,
        bestSetVolume: null,
      };
    }

    const loadRecordSupported = supportsLoadRecord(workoutId, slotId);
    const heaviestLoad = loadRecordSupported
      ? [...sets].sort((a, b) => (b.weight - a.weight) || (b.reps - a.reps) || (Date.parse(b.completedAt) - Date.parse(a.completedAt)))[0]
      : null;
    const repRecord = [...sets].sort((a, b) => (b.reps - a.reps) || (b.weight - a.weight) || (Date.parse(b.completedAt) - Date.parse(a.completedAt)))[0];
    const bestSetVolume = loadRecordSupported
      ? [...sets].sort((a, b) => ((b.weight * b.reps) - (a.weight * a.reps)) || (b.weight - a.weight))[0]
      : null;

    return {
      loadRecordSupported,
      heaviestLoad: heaviestLoad ? toRecord(heaviestLoad, heaviestLoad.weight) : null,
      repRecord: repRecord ? toRecord(repRecord, repRecord.reps) : null,
      bestSetVolume: bestSetVolume ? toRecord(bestSetVolume, bestSetVolume.weight * bestSetVolume.reps) : null,
    };
  }

  countNewRecords(session) {
    if (!session || session.status !== "completed" || !session.completedAt) return 0;

    const cutoff = Date.parse(session.completedAt);
    if (!Number.isFinite(cutoff)) return 0;

    const priorSessions = this.repository.listSessions()
      .filter((s) => s.status === "completed" && s.completedAt && Date.parse(s.completedAt) < cutoff);

    let count = 0;

    for (const exercise of session.exercises) {
      const completedSets = exercise.sets.filter((set) => set.type === "working" && set.completedAt);
      if (completedSets.length === 0) continue;

      const loadSupported = supportsLoadRecord(session.workoutId, exercise.slotId);
      const priorSets = priorSessions.flatMap((s) =>
        (s.exercises.find((e) => e.slotId === exercise.slotId)?.sets ?? [])
          .filter((set) => set.type === "working" && set.completedAt)
      );
      if (priorSets.length === 0) continue;

      for (const set of completedSets) {
        const isNewRecord = loadSupported
          ? priorSets.every((p) => set.weight > p.weight || (set.weight === p.weight && set.reps > p.reps))
          : priorSets.every((p) => set.reps > p.reps);
        if (isNewRecord) count += 1;
      }
    }

    return count;
  }
}

function toRecord(set, value) {
  return {
    value,
    weight: set.weight,
    reps: set.reps,
    rir: set.rir,
    completedAt: set.completedAt,
    sessionId: set.sessionId,
  };
}

function supportsLoadRecord(workoutId, slotId) {
  if (workoutId === "upper-b" && slotId === "upper-b-02") return false;
  if (workoutId === "lower-b" && slotId === "lower-b-07") return false;
  return true;
}
