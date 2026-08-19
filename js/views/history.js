import { DATA } from "../services/app-data.js";

export function renderHistory(route = "history") {
  const sessionId = route.startsWith("history/") ? route.slice("history/".length) : null;
  if (sessionId) return renderWorkoutDetail(sessionId);
  return renderHistoryList();
}

function renderHistoryList() {
  const sessions = DATA.history.listCompleted();

  return `
    <section class="page">
      <header class="page-header">
        <p class="eyebrow">History</p>
        <h1 class="page-title">Geçmiş</h1>
        <p class="page-subtitle">Tamamladığın gerçek workout kayıtları.</p>
      </header>

      ${sessions.length === 0 ? renderEmptyHistory() : `
        <div class="history-list" aria-label="Tamamlanan workout'lar">
          ${sessions.map(renderHistoryItem).join("")}
        </div>
      `}
    </section>
  `;
}

function renderHistoryItem(summary) {
  return `
    <a class="history-item" href="#history/${encodeURIComponent(summary.id)}">
      <div class="history-date" aria-hidden="true">
        <strong>${escapeHtml(formatDay(summary.completedAt))}</strong>
        <span>${escapeHtml(formatMonth(summary.completedAt))}</span>
      </div>
      <div class="history-item-main">
        <div class="history-item-topline">
          <h2>${escapeHtml(summary.workoutName)}</h2>
          <span class="chevron">›</span>
        </div>
        <p>${escapeHtml(formatHistoryTimestamp(summary.completedAt))}</p>
        <div class="history-meta">
          <span>${escapeHtml(formatDuration(summary.durationSeconds))}</span>
          <span>${summary.completedSetCount} set</span>
          <span>${summary.touchedExerciseCount} egzersiz</span>
        </div>
      </div>
    </a>
  `;
}

function renderWorkoutDetail(sessionId) {
  const result = DATA.history.getCompleted(decodeURIComponent(sessionId));
  if (!result) {
    return `
      <section class="page">
        <header class="detail-header">
          <a class="back-link" href="#history">← Geçmiş</a>
        </header>
        <div class="empty-state">
          <h2>Workout bulunamadı</h2>
          <p>Bu tamamlanmış workout yerel geçmişte mevcut değil.</p>
          <a class="button button-secondary" href="#history">Geçmişe dön</a>
        </div>
      </section>
    `;
  }

  const { session, summary } = result;

  return `
    <section class="page history-detail-page">
      <header class="detail-header">
        <a class="back-link" href="#history">← Geçmiş</a>
        <p class="eyebrow">Workout detail</p>
        <h1 class="page-title">${escapeHtml(session.workoutName)}</h1>
        <p class="page-subtitle">${escapeHtml(formatFullTimestamp(session.completedAt))}</p>
      </header>

      <div class="history-summary-grid" aria-label="Workout özeti">
        <article class="card history-stat"><span>Süre</span><strong>${escapeHtml(formatDuration(summary.durationSeconds))}</strong></article>
        <article class="card history-stat"><span>Set</span><strong>${summary.completedSetCount}</strong></article>
        <article class="card history-stat"><span>Egzersiz</span><strong>${summary.touchedExerciseCount}</strong></article>
      </div>

      ${summary.completedSetCount < summary.plannedSetCount ? `
        <div class="history-partial-note" role="note">
          Bu workout ${summary.completedSetCount}/${summary.plannedSetCount} planlı çalışma seti tamamlanarak bitirilmiş.
        </div>
      ` : ""}

      <section class="section" aria-labelledby="history-exercises-title">
        <div class="section-header">
          <h2 id="history-exercises-title" class="section-title">Egzersizler</h2>
          <span class="section-caption">${summary.touchedExerciseCount}/${summary.plannedExerciseCount}</span>
        </div>
        <div class="history-exercise-stack">
          ${session.exercises.map(renderExerciseDetail).join("")}
        </div>
      </section>

      ${session.notes ? `
        <section class="section" aria-labelledby="workout-notes-title">
          <div class="section-header"><h2 id="workout-notes-title" class="section-title">Workout notu</h2></div>
          <article class="card history-notes">${escapeHtml(session.notes)}</article>
        </section>
      ` : ""}
    </section>
  `;
}

function renderExerciseDetail(exercise, index) {
  const workingSets = exercise.sets.filter((set) => set.type === "working");
  const completedSets = workingSets.filter((set) => set.completedAt);
  const p = exercise.prescriptionSnapshot;
  const prescription = `${p.workingSets} × ${p.reps.min}–${p.reps.max}${p.reps.perSide ? " / bacak" : ""} • RIR ${formatRange(p.rir.min, p.rir.max)}`;

  return `
    <article class="history-exercise-card${completedSets.length === 0 ? " is-skipped" : ""}">
      <div class="history-exercise-heading">
        <div class="exercise-index">${index + 1}</div>
        <div class="history-exercise-title-wrap">
          <h3>${escapeHtml(exercise.exerciseName)}</h3>
          <p>${escapeHtml(exercise.targetMuscles || "")}</p>
        </div>
        <span class="history-set-count">${completedSets.length}/${workingSets.length}</span>
      </div>

      <div class="history-prescription">${escapeHtml(prescription)}</div>

      ${completedSets.length > 0 ? `
        <div class="history-set-list" aria-label="${escapeHtml(exercise.exerciseName)} setleri">
          ${completedSets.map((set) => renderCompletedSet(set, p.reps.perSide)).join("")}
        </div>
      ` : `<p class="history-skipped-text">Bu egzersizde tamamlanmış set yok.</p>`}

      ${exercise.notes || exercise.painOrDiscomfort ? `
        <div class="history-exercise-notes">
          ${exercise.notes ? `<p><strong>Not:</strong> ${escapeHtml(exercise.notes)}</p>` : ""}
          ${exercise.painOrDiscomfort ? `<p><strong>Rahatsızlık:</strong> ${escapeHtml(exercise.painOrDiscomfort)}</p>` : ""}
        </div>
      ` : ""}
    </article>
  `;
}

function renderCompletedSet(set, perSide) {
  return `
    <div class="history-set-row">
      <span class="history-set-number">${set.setNumber}</span>
      <strong>${escapeHtml(formatWeight(set.weight))}</strong>
      <span>× ${Number.isInteger(set.reps) ? set.reps : "—"}${perSide ? "/bacak" : ""}</span>
      <span class="history-set-rir">RIR ${Number.isInteger(set.rir) ? set.rir : "—"}</span>
    </div>
  `;
}

function renderEmptyHistory() {
  return `
    <div class="empty-state">
      <h2>Henüz workout yok</h2>
      <p>İlk gerçek workout tamamlandığında burada görünecek.</p>
    </div>
  `;
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) return "—";
  if (seconds < 60) return "<1 dk";
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${minutes} dk`;
  return rest === 0 ? `${hours} sa` : `${hours} sa ${rest} dk`;
}

function formatDay(isoDate) {
  const date = new Date(isoDate);
  return Number.isNaN(date.getTime()) ? "—" : String(date.getDate()).padStart(2, "0");
}

function formatMonth(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("tr-TR", { month: "short" }).format(date).replace(".", "").toLocaleUpperCase("tr-TR");
}

function formatHistoryTimestamp(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("tr-TR", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatFullTimestamp(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatWeight(value) {
  if (!Number.isFinite(value)) return "— kg";
  return `${Number.isInteger(value) ? value : Number(value.toFixed(2))} kg`;
}

function formatRange(min, max) {
  return min === max ? String(min) : `${min}–${max}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
