export class ProgressionService {
  constructor(repository) {
    this.repository = repository;
  }

  evaluate(workoutId, slotId) {
    const history = getExerciseHistory(this.repository, workoutId, slotId);
    if (history.length === 0) {
      return {
        status: "no-data",
        title: "Henüz değerlendirme yok",
        message: "Bu egzersiz için tamamlanmış gerçek set bulunmuyor.",
        candidateForLoadChange: false,
        latest: null,
        checks: emptyChecks(),
      };
    }

    const latest = history.at(-1);
    const prescription = latest.exercise.prescriptionSnapshot;
    const completedSets = latest.exercise.sets.filter((set) => set.type === "working" && set.completedAt);
    const allPlannedSetsCompleted = completedSets.length === prescription.workingSets;
    const allAtUpperRepLimit = allPlannedSetsCompleted && completedSets.every((set) => set.reps >= prescription.reps.max);
    const allInsideRepRange = allPlannedSetsCompleted && completedSets.every((set) => set.reps >= prescription.reps.min && set.reps <= prescription.reps.max);
    const targetRirMaintained = allPlannedSetsCompleted && completedSets.every((set) => set.rir >= prescription.rir.min && set.rir <= prescription.rir.max);
    const anyBelowRepRange = completedSets.some((set) => set.reps < prescription.reps.min);
    const anyBelowTargetRir = completedSets.some((set) => set.rir < prescription.rir.min);
    const recordedPainOrDiscomfort = Boolean(latest.exercise.painOrDiscomfort?.trim());
    const trackingAgeDays = Math.max(0, Math.floor((Date.parse(latest.session.completedAt) - Date.parse(history[0].session.completedAt)) / 86400000));
    const inTechniquePeriod = trackingAgeDays < 14;

    const checks = {
      allPlannedSetsCompleted,
      allInsideRepRange,
      allAtUpperRepLimit,
      targetRirMaintained,
      noRecordedPainOrDiscomfort: !recordedPainOrDiscomfort,
      techniqueQuality: "manual-check-required",
      noMomentumBreakdown: "manual-check-required",
      noJointPain: "manual-check-required",
    };

    if (recordedPainOrDiscomfort) {
      return result("pain-review", "Progresyonu zorlama", "Son kayıtta ağrı/rahatsızlık notu var. Yük artışı önermek yerine hareketi ve tekniği gözden geçir.", false, latest, checks);
    }

    if (!allPlannedSetsCompleted) {
      return result("partial", "Önce mevcut setleri tamamla", "Son kayıtta planlanan bütün çalışma setleri tamamlanmamış. Bu kayda göre yük artışı değerlendirilmez.", false, latest, checks);
    }

    if (inTechniquePeriod) {
      return result("technique-phase", "Teknik dönemi", "İlk 1–2 haftada öncelik cihaz ayarı, hareket kalitesi ve doğru RIR tahminidir. Ağırlık artırmak öncelik değil.", false, latest, checks);
    }

    if (anyBelowRepRange || anyBelowTargetRir) {
      return result("hold", "Aynı yükte kal veya gerekirse azalt", "Son performans hedef tekrar/RIR koşullarının altında. Ağırlığı zorla artırma; aynı yükü korumak veya gerekirse küçük azaltım yapmak daha uygundur.", false, latest, checks);
    }

    if (allAtUpperRepLimit && targetRirMaintained) {
      const assistedMovement = isLoadSensitiveSlot(workoutId, slotId);
      const message = assistedMovement
        ? "Tüm çalışma setleri üst tekrar sınırına ulaştı ve hedef RIR korundu. Bu hareket yardım/bodyweight içerebildiği için uygulama yük yönünü otomatik belirlemez; teknik aynı kalitedeyse bir sonraki küçük zorluk adımını manuel değerlendir."
        : "Tüm çalışma setleri üst tekrar sınırına ulaştı ve hedef RIR korundu. Teknik aynı kalitedeyse, eklem ağrısı yoksa ve tekrarlar savrulmadan yapıldıysa mevcut en küçük yük artışını değerlendirebilirsin.";
      return result(
        "candidate",
        assistedMovement ? "Zorluk artışı için aday" : "Ağırlık artışı için aday",
        message,
        !assistedMovement,
        latest,
        checks,
      );
    }

    if (allInsideRepRange) {
      return result("build-reps", "Aynı yükle tekrarları geliştir", "Double progression gereği aynı yükte kalıp setleri yavaşça üst tekrar sınırına yaklaştır.", false, latest, checks);
    }

    return result("review", "Kaydı kontrol et", "Setler tamamlandı ancak progresyon için gerekli tekrar ve RIR koşulları net biçimde sağlanmıyor.", false, latest, checks);
  }
}

export function getExerciseHistory(repository, workoutId, slotId) {
  return repository
    .listSessions()
    .filter((session) => session.status === "completed" && session.completedAt && session.workoutId === workoutId)
    .map((session) => ({
      session,
      exercise: session.exercises.find((exercise) => exercise.slotId === slotId) ?? null,
    }))
    .filter(({ exercise }) => exercise && exercise.sets.some((set) => set.type === "working" && set.completedAt))
    .sort((a, b) => Date.parse(a.session.completedAt) - Date.parse(b.session.completedAt));
}

function result(status, title, message, candidateForLoadChange, latest, checks) {
  return { status, title, message, candidateForLoadChange, latest, checks };
}

function emptyChecks() {
  return {
    allPlannedSetsCompleted: false,
    allInsideRepRange: false,
    allAtUpperRepLimit: false,
    targetRirMaintained: false,
    noRecordedPainOrDiscomfort: true,
    techniqueQuality: "manual-check-required",
    noMomentumBreakdown: "manual-check-required",
    noJointPain: "manual-check-required",
  };
}

export function isLoadSensitiveSlot(workoutId, slotId) {
  if (workoutId === "upper-b" && slotId === "upper-b-02") return true;
  if (workoutId === "lower-b" && slotId === "lower-b-07") return true;
  return false;
}
