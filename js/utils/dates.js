const DAY_KEYS = Object.freeze([
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
]);

export function getDayKey(date = new Date()) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new TypeError("A valid Date is required.");
  }
  return DAY_KEYS[date.getDay()];
}

export function getScheduledWorkout(program, date = new Date()) {
  const dayKey = getDayKey(date);
  const workoutId = program?.schedule?.[dayKey] ?? null;
  return {
    dayKey,
    workoutId,
    workout: workoutId ? program?.workouts?.[workoutId] ?? null : null,
  };
}

export function formatSessionStart(isoDate, locale = "tr-TR") {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
