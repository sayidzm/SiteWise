import { getExerciseHistory } from "./progression-service.js";

export class ProgressService {
  constructor(repository, progression, prs) {
    this.repository = repository;
    this.progression = progression;
    this.prs = prs;
  }

  listTrackedExercises() {
    const groups = new Map();

    for (const session of this.repository.listSessions()) {
      if (session.status !== "completed" || !session.completedAt) continue;

      for (const exercise of session.exercises) {
        const completedSets = exercise.sets.filter((set) => set.type === "working" && set.completedAt);
        if (completedSets.length === 0) continue;

        const key = exerciseKey(session.workoutId, exercise.slotId);
        const existing = groups.get(key) ?? {
          key,
          workoutId: session.workoutId,
          workoutName: session.workoutName,
          slotId: exercise.slotId,
          exerciseName: exercise.exerciseName,
          sessionCount: 0,
          completedSetCount: 0,
          lastPerformedAt: null,
        };

        existing.sessionCount += 1;
        existing.completedSetCount += completedSets.length;
        if (!existing.lastPerformedAt || Date.parse(session.completedAt) > Date.parse(existing.lastPerformedAt)) {
          existing.lastPerformedAt = session.completedAt;
          existing.exerciseName = exercise.exerciseName;
        }
        groups.set(key, existing);
      }
    }

    return [...groups.values()]
      .map((summary) => ({
        ...summary,
        progression: this.progression.evaluate(summary.workoutId, summary.slotId),
        records: this.prs.getRecords(summary.workoutId, summary.slotId),
      }))
      .sort((a, b) => Date.parse(b.lastPerformedAt) - Date.parse(a.lastPerformedAt));
  }

  getExercise(key) {
    const parsed = parseExerciseKey(key);
    if (!parsed) return null;

    const history = getExerciseHistory(this.repository, parsed.workoutId, parsed.slotId);
    if (history.length === 0) return null;

    const performances = history.map(({ session, exercise }) => summarizePerformance(session, exercise));
    const latest = performances.at(-1);

    return {
      key: exerciseKey(parsed.workoutId, parsed.slotId),
      workoutId: parsed.workoutId,
      workoutName: history.at(-1).session.workoutName,
      slotId: parsed.slotId,
      exerciseName: history.at(-1).exercise.exerciseName,
      prescription: history.at(-1).exercise.prescriptionSnapshot,
      performances,
      latest,
      progression: this.progression.evaluate(parsed.workoutId, parsed.slotId),
      records: this.prs.getRecords(parsed.workoutId, parsed.slotId),
    };
  }

  getWeeklyStats(now = new Date()) {
    const reference = now instanceof Date ? now : new Date(now);
    const cutoff = reference.getTime() - 6 * 86400000;

    let workoutCount = 0;
    let completedSetCount = 0;
    let newRecordCount = 0;

    for (const session of this.repository.listSessions()) {
      if (session.status !== "completed" || !session.completedAt) continue;
      const completedAt = Date.parse(session.completedAt);
      if (!Number.isFinite(completedAt) || completedAt < cutoff) continue;

      workoutCount += 1;
      completedSetCount += session.exercises.reduce((sum, exercise) => {
        const done = exercise.sets.filter((set) => set.type === "working" && set.completedAt).length;
        return sum + done;
      }, 0);
      newRecordCount += this.prs.countNewRecords(session);
    }

    const candidateCount = this.listTrackedExercises()
      .filter((item) => item.progression.status === "candidate").length;

    return { workoutCount, completedSetCount, newRecordCount, candidateCount };
  }

  getTrackingPhase(now = new Date()) {
    const completed = this.repository.listSessions()
      .filter((session) => session.status === "completed" && session.completedAt)
      .sort((a, b) => Date.parse(a.completedAt) - Date.parse(b.completedAt));

    if (completed.length === 0) {
      return { id: "not-started", label: "Takip başlamadı", week: 0, message: "İlk workout tamamlandığında 8–12 haftalık takip dönemi başlayacak." };
    }

    const start = Date.parse(completed[0].completedAt);
    const end = now instanceof Date ? now.getTime() : Date.parse(now);
    const elapsedDays = Math.max(0, Math.floor((end - start) / 86400000));
    const week = Math.floor(elapsedDays / 7) + 1;

    if (week <= 2) return { id: "technique", label: "Teknik dönemi", week, message: "Cihaz ayarları, hareket açıklığı ve doğru RIR tahmini öncelikli." };
    if (week <= 6) return { id: "double-progression", label: "Double progression", week, message: "Aynı egzersizleri koruyup tekrarları kontrollü biçimde artır." };
    if (week <= 8) return { id: "checkpoint", label: "Kontrol noktası", week, message: "Teknik, performans, süre, eklem rahatlığı ve toparlanmayı değerlendir." };
    if (week <= 12) return { id: "small-adjustments", label: "Küçük ayarlamalar", week, message: "Yalnızca ihtiyaç varsa güvenli alternatif veya küçük hacim ayarı düşün." };
    return { id: "continue", label: "İstikrarlı devam", week, message: "Program işe yarıyorsa sırf süre geçti diye değiştirmek gerekmez." };
  }
}

export function exerciseKey(workoutId, slotId) {
  return `${workoutId}:${slotId}`;
}

export function parseExerciseKey(key) {
  if (typeof key !== "string") return null;
  const separator = key.indexOf(":");
  if (separator <= 0 || separator === key.length - 1) return null;
  return { workoutId: key.slice(0, separator), slotId: key.slice(separator + 1) };
}

function summarizePerformance(session, exercise) {
  const completedSets = exercise.sets.filter((set) => set.type === "working" && set.completedAt);
  const bestWeight = completedSets.length ? Math.max(...completedSets.map((set) => set.weight)) : null;
  const maxReps = completedSets.length ? Math.max(...completedSets.map((set) => set.reps)) : null;
  const totalVolume = completedSets.reduce((sum, set) => sum + (set.weight * set.reps), 0);

  return {
    sessionId: session.id,
    completedAt: session.completedAt,
    completedSetCount: completedSets.length,
    plannedSetCount: exercise.prescriptionSnapshot.workingSets,
    bestWeight,
    maxReps,
    totalVolume,
    sets: completedSets.map((set) => ({
      setNumber: set.setNumber,
      weight: set.weight,
      reps: set.reps,
      rir: set.rir,
    })),
    notes: exercise.notes,
    painOrDiscomfort: exercise.painOrDiscomfort,
  };
}
