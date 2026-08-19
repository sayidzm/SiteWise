import { PROGRAM, WEEK_DAYS } from "../data/program-data.js";
import { DATA } from "../services/app-data.js";
import { getScheduledWorkout, formatSessionStart } from "../utils/dates.js";

const SETTINGS_ICON = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.01A1.7 1.7 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.01a1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1.03Z"/></svg>`;

export function renderHome() {
  const { dayKey: todayKey, workout } = getScheduledWorkout(PROGRAM);
  const activeSession = DATA.sessions.getActiveSession();
  const plannedWorkoutCount = Object.values(PROGRAM.schedule).filter(Boolean).length;
  const completedDates = completedDateKeys(DATA.history.listCompleted());
  const weekDays = currentWeekDays();

  return `
    <section class="page home-page">
      <header class="home-header">
        <div>
          <h1 class="home-title">SiteWise</h1>
          <p class="home-subtitle">Bugün, ${escapeHtml(formatToday(new Date()))}</p>
        </div>
        <a class="home-settings-link" href="#settings" aria-label="Ayarlar">${SETTINGS_ICON}</a>
      </header>

      ${activeSession ? activeWorkoutHero(activeSession) : workout ? workoutHero(workout) : restHero()}

      <section class="section" aria-labelledby="week-title">
        <div class="section-header">
          <div>
            <p class="eyebrow">Upper / Lower</p>
            <h2 id="week-title" class="section-title">Bu Hafta</h2>
          </div>
          <span class="section-caption">${plannedWorkoutCount} workout</span>
        </div>
        <div class="week-grid" aria-label="Bu haftanın programı">
          ${WEEK_DAYS.map((day, index) => dayChip(day, index, weekDays[index], todayKey, completedDates)).join("")}
        </div>
      </section>
    </section>
  `;
}

function activeWorkoutHero(session) {
  const progress = getSessionProgress(session);
  return `
    <article class="hero-card hero-card-active">
      <div>
        <p class="eyebrow">Aktif workout</p>
        <h2 class="hero-title">${escapeHtml(session.workoutName)}</h2>
        <p class="muted">${escapeHtml(formatSessionStart(session.startedAt))} tarihinde başlatıldı.</p>
        <div class="meta-row">
          <span class="meta-chip">${session.exercises.length} egzersiz</span>
          <span class="meta-chip">${progress.completed}/${progress.total} set tamamlandı</span>
        </div>
      </div>
      <a class="button" href="#workout">Workout'a devam et</a>
    </article>
  `;
}

function workoutHero(workout) {
  return `
    <article class="hero-card">
      <div>
        <p class="eyebrow">Bugünkü workout</p>
        <h2 class="hero-title">${escapeHtml(workout.name)}</h2>
        <p class="muted">${escapeHtml(workout.focus)}</p>
        <div class="meta-row">
          <span class="meta-chip">${workout.exercises.length} egzersiz</span>
          <span class="meta-chip">${workout.estimatedDuration.min}–${workout.estimatedDuration.max} dk</span>
        </div>
      </div>
      <button class="button" type="button" data-action="start-workout" data-workout-id="${escapeHtml(workout.id)}">
        Workout'u başlat
      </button>
    </article>
  `;
}

function restHero() {
  return `
    <article class="hero-card">
      <div>
        <p class="eyebrow">Bugünkü plan</p>
        <h2 class="hero-title">Dinlenme günü</h2>
        <p class="muted">Bugün programda ağır antrenman yok. Toparlanma ve sonraki seansa hazırlık zamanı.</p>
      </div>
      <a class="button button-secondary" href="#program">Haftalık programı gör</a>
    </article>
  `;
}

function dayChip(day, index, date, todayKey, completedDates) {
  const workoutId = PROGRAM.schedule[day.key];
  const label = workoutId ? PROGRAM.workouts[workoutId].name : "Dinlenme";
  const isToday = day.key === todayKey;
  const isComplete = completedDates.has(dateKey(date));
  return `
    <div class="day-chip${isToday ? " is-today" : ""}" title="${escapeHtml(`${day.label}, ${date.getDate()} ${formatMonth(date)}: ${label}`)}"${isToday ? ' aria-current="date"' : ""}>
      <div class="day-name">${escapeHtml(day.short)}</div>
      <div class="day-number">${date.getDate()}</div>
      <div class="day-dot${isComplete ? " is-complete" : ""}" aria-hidden="true"></div>
    </div>
  `;
}

function getSessionProgress(session) {
  const sets = session.exercises.flatMap((exercise) => exercise.sets);
  return {
    completed: sets.filter((set) => Boolean(set.completedAt)).length,
    total: sets.length,
  };
}

function currentWeekDays() {
  const now = new Date();
  const dayIndex = (now.getDay() + 6) % 7; // 0 = Monday
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayIndex);
  return WEEK_DAYS.map((_, index) => new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index));
}

function completedDateKeys(summaries) {
  const keys = new Set();
  for (const summary of summaries) {
    const date = new Date(summary.completedAt);
    if (!Number.isNaN(date.getTime())) keys.add(dateKey(date));
  }
  return keys;
}

function dateKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function formatToday(date) {
  return `${date.getDate()} ${formatMonth(date)}`;
}

function formatMonth(date) {
  return new Intl.DateTimeFormat("tr-TR", { month: "short" }).format(date).replace(".", "");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}