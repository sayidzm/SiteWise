import { PROGRAM, WEEK_DAYS } from "../data/program-data.js";
import { DATA } from "../services/app-data.js";
import { getScheduledWorkout, formatSessionStart } from "../utils/dates.js";

export function renderHome() {
  const { dayKey: todayKey, workout } = getScheduledWorkout(PROGRAM);
  const activeSession = DATA.sessions.getActiveSession();

  return `
    <section class="page">
      <header class="page-header">
        <p class="eyebrow">Workout Tracker</p>
        <h1 class="page-title">Bugün</h1>
        <p class="page-subtitle">Programın bugünkü bölümünü hızlıca kontrol et.</p>
      </header>

      ${activeSession ? activeWorkoutHero(activeSession) : workout ? workoutHero(workout) : restHero()}

      <section class="section" aria-labelledby="week-title">
        <div class="section-header">
          <h2 id="week-title" class="section-title">Bu hafta</h2>
        </div>
        <div class="week-grid">
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
        <p class="muted">${formatSessionStart(session.startedAt)} tarihinde başlatıldı.</p>
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
      <button class="button" type="button" data-action="start-workout" data-workout-id="${workout.id}">
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
        <p class="muted">Bugün programda ağır antrenman yok.</p>
      </div>
      <a class="button button-secondary" href="#program">Haftalık programı gör</a>
    </article>
  `;
}

function dayChip(day, todayKey) {
  const workoutId = PROGRAM.schedule[day.key];
  const label = workoutId ? PROGRAM.workouts[workoutId].name : "Rest";
  return `
    <div class="day-chip${day.key === todayKey ? " is-today" : ""}" title="${day.label}: ${label}">
      <div class="day-name">${day.short}</div>
      <div class="day-plan">${label}</div>
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
