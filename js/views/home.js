import { PROGRAM, WEEK_DAYS } from "../data/program-data.js";
import { DATA } from "../services/app-data.js";
import { getScheduledWorkout, formatSessionStart } from "../utils/dates.js";

export function renderHome() {
  const { dayKey: todayKey, workout } = getScheduledWorkout(PROGRAM);
  const activeSession = DATA.sessions.getActiveSession();
  const plannedWorkoutCount = Object.values(PROGRAM.schedule).filter(Boolean).length;

  return `
    <section class="page home-page">
      <header class="page-header home-header">
        <p class="eyebrow">SiteWise</p>
        <h1 class="page-title">Bugün</h1>
        <p class="page-subtitle">${escapeHtml(formatToday(new Date()))}</p>
      </header>

      ${activeSession ? activeWorkoutHero(activeSession) : workout ? workoutHero(workout) : restHero()}

      <section class="section" aria-labelledby="week-title">
        <div class="section-header">
          <div>
            <p class="eyebrow">Upper / Lower</p>
            <h2 id="week-title" class="section-title">Haftalık program</h2>
          </div>
          <span class="section-caption">${plannedWorkoutCount} workout</span>
        </div>
        <div class="week-grid" aria-label="Bu haftanın programı">
          ${WEEK_DAYS.map((day) => dayChip(day, todayKey)).join("")}
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
        Workout başlat
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

function dayChip(day, todayKey) {
  const workoutId = PROGRAM.schedule[day.key];
  const label = workoutId ? PROGRAM.workouts[workoutId].name : "Dinlenme";
  const isToday = day.key === todayKey;
  return `
    <div class="day-chip${isToday ? " is-today" : ""}" title="${escapeHtml(`${day.label}: ${label}`)}"${isToday ? ' aria-current="date"' : ""}>
      <div class="day-name">${escapeHtml(day.short)}</div>
      <div class="day-plan">${escapeHtml(label)}</div>
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

function formatToday(date) {
  return new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
