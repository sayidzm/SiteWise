export const PROGRAM = Object.freeze({
  schemaVersion: 1,
  id: "upper-lower-15",
  name: "15 Yaş İçin Upper / Lower Programı",
  subtitle: "Kas gelişimi + güç + teknik + uzun vadeli ilerleme",
  schedule: {
    monday: "upper-a",
    tuesday: "lower-a",
    wednesday: null,
    thursday: "upper-b",
    friday: "lower-b",
    saturday: null,
    sunday: null,
  },
  workouts: {
    "upper-a": {
      id: "upper-a",
      name: "Upper A",
      focus: "Horizontal push + vertical pull + upper back + omuzlar + kollar",
      estimatedDuration: { min: 65, max: 80 },
      exercises: [
        ex("upper-a-01", "Machine Chest Press", 3, 8, 12, 2, 3, 120, 180, "Göğüs, triceps, front delt"),
        ex("upper-a-02", "Neutral/Wide Lat Pulldown", 3, 8, 12, 2, 3, 120, 180, "Lat, biceps"),
        ex("upper-a-03", "Chest-Supported Row / Seated Row", 3, 8, 12, 2, 3, 120, 180, "Upper back, lat, rear delt"),
        ex("upper-a-04", "Machine Shoulder Press", 2, 8, 12, 2, 3, 120, 120, "Front/side delt, triceps"),
        ex("upper-a-05", "Cable Lateral Raise", 2, 12, 15, 1, 2, 60, 90, "Side delt"),
        ex("upper-a-06", "Reverse Pec Deck / Rear-Delt Fly", 2, 12, 15, 1, 2, 60, 90, "Rear delt, upper back"),
        ex("upper-a-07", "Rope Triceps Pushdown", 1, 10, 15, 1, 2, 60, 90, "Triceps"),
        ex("upper-a-08", "Dumbbell Hammer Curl", 1, 10, 15, 1, 2, 60, 90, "Biceps, brachialis"),
      ],
    },
    "lower-a": {
      id: "lower-a",
      name: "Lower A",
      focus: "Quad + hip hinge + hamstring + tek bacak + calf + adductor + core",
      estimatedDuration: { min: 65, max: 80 },
      exercises: [
        ex("lower-a-01", "Leg Press", 3, 8, 12, 2, 3, 120, 180, "Quadriceps, glute"),
        ex("lower-a-02", "Dumbbell Romanian Deadlift", 3, 8, 12, 3, 3, 120, 180, "Hamstring, glute"),
        ex("lower-a-03", "Lying / Seated Leg Curl", 2, 10, 15, 2, 2, 90, 120, "Hamstring"),
        ex("lower-a-04", "Reverse Lunge", 2, 8, 12, 2, 3, 90, 120, "Quad, glute", true),
        ex("lower-a-05", "Seated Calf Raise / Calf Machine", 2, 10, 15, 2, 2, 60, 90, "Calf"),
        ex("lower-a-06", "Adductor Machine / Cable Adduction", 1, 12, 15, 2, 2, 60, 90, "Adductor"),
        ex("lower-a-07", "ABS / Ab Crunch Machine", 2, 10, 15, 2, 2, 60, 90, "Core / abs"),
      ],
    },
    "upper-b": {
      id: "upper-b",
      name: "Upper B",
      focus: "Farklı göğüs açısı + bodyweight/vertical pull + horizontal pull + omuz stabilizasyonu",
      estimatedDuration: { min: 65, max: 80 },
      exercises: [
        ex("upper-b-01", "Incline Dumbbell Press", 3, 8, 12, 2, 3, 120, 180, "Upper chest, triceps, front delt"),
        ex("upper-b-02", "Assisted Pull-Up / Pull-Up", 3, 6, 10, 2, 3, 120, 180, "Lat, upper back, biceps"),
        ex("upper-b-03", "Wide/Neutral Seated Cable Row", 3, 8, 12, 2, 3, 120, 180, "Upper back, lat, rear delt"),
        ex("upper-b-04", "Landmine Press / Machine Shoulder Press", 2, 8, 12, 2, 3, 120, 120, "Front/side delt, serratus, triceps"),
        ex("upper-b-05", "Cable Lateral Raise", 2, 12, 15, 1, 2, 60, 90, "Side delt"),
        ex("upper-b-06", "Face Pull", 2, 12, 15, 2, 2, 60, 90, "Rear delt, external rotators, upper back"),
        ex("upper-b-07", "Overhead Rope Triceps Extension", 1, 10, 15, 1, 2, 60, 90, "Triceps"),
        ex("upper-b-08", "Incline Dumbbell Curl / Machine Curl", 1, 10, 15, 1, 2, 60, 90, "Biceps"),
      ],
    },
    "lower-b": {
      id: "lower-b",
      name: "Lower B",
      focus: "Squat varyasyonu + glute + hamstring + unilateral + calf + core",
      estimatedDuration: { min: 65, max: 80 },
      exercises: [
        ex("lower-b-01", "Hack Squat veya Goblet Squat", 3, 8, 12, 2, 3, 120, 180, "Quadriceps, glute"),
        ex("lower-b-02", "Hip Thrust Machine / Glute Bridge", 2, 8, 12, 2, 3, 120, 120, "Glute"),
        ex("lower-b-03", "Seated Leg Curl", 3, 10, 15, 2, 2, 90, 120, "Hamstring"),
        ex("lower-b-04", "Supported Bulgarian Split Squat", 2, 8, 12, 2, 3, 90, 120, "Quad, glute", true),
        ex("lower-b-05", "Standing Calf Raise", 2, 10, 15, 2, 2, 60, 90, "Calf"),
        ex("lower-b-06", "Adductor Machine", 1, 12, 15, 2, 2, 60, 90, "Adductor"),
        ex("lower-b-07", "Hanging Knee Raise / Captain's Chair", 2, 8, 15, 2, 2, 60, 90, "Abs / hip flexors / core"),
      ],
    },
  },
});

function ex(slotId, name, sets, repMin, repMax, rirMin, rirMax, restMin, restMax, targetMuscles, perSide = false) {
  return Object.freeze({
    slotId,
    name,
    prescription: Object.freeze({
      workingSets: sets,
      reps: Object.freeze({ min: repMin, max: repMax, perSide }),
      rir: Object.freeze({ min: rirMin, max: rirMax }),
      restSeconds: Object.freeze({ min: restMin, max: restMax }),
    }),
    targetMuscles,
  });
}

export const WEEK_DAYS = Object.freeze([
  { key: "monday", short: "Pzt", label: "Pazartesi" },
  { key: "tuesday", short: "Sal", label: "Salı" },
  { key: "wednesday", short: "Çar", label: "Çarşamba" },
  { key: "thursday", short: "Per", label: "Perşembe" },
  { key: "friday", short: "Cum", label: "Cuma" },
  { key: "saturday", short: "Cmt", label: "Cumartesi" },
  { key: "sunday", short: "Paz", label: "Pazar" },
]);
