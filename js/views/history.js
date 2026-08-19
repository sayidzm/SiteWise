import { DATA } from "../services/app-data.js";

const CHEVRON_ICON = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>`;
const BACK_ICON = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>`;
const TIMER_ICON = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/></svg>`;

const FILTERS = [
  { key: "all", label: "Tümü", href: "#history" },
  { key: "upper", label: "Upper", href: "#history?filter=upper" },
  { key: "lower", label: "Lower", href: "#history?filter=lower" },
  { key: "30g", label: "30 gün", href: "#history?filter=30g" },
];

export function renderHistory(route = "history") {
  const [path, query = ""] = route.split("?");
  const filter = new URLSearchParams(query).get("filter") ?? "all";
  const sessionId = path.startsWith("history/") ? path.slice("history/".length) : null;
  if (sessionId) return renderWorkoutDetail(sessionId);
  return renderHistoryList(filter);
}

function renderHistoryList(filter) {
  const sessions = filterSessions(DATA.history.listCompleted(), filter);
  const monthGroups = groupSessionsByMonth(sessions);

  return `
    <section class="page history-page">
      <header class="page-header">
        <p class="eyebrow">SiteWise kayıtları</p>
        <h1 class="page-title">Geçmiş</h1>
        <p class="page-subtitle">Tamamladığın gerçek workout kayıtları, en yeniden eskiye.</p>
      </header>

      <nav class="filter-row" aria-label="Geçmiş filtresi">
        ${FILTERS.map((item) => `
          <a class="filter-pill${filter === item.key ? " is-active" : ""}" href="${item.href}"${filter === item.key ? ' aria-current="page"' : ""}>${item.label}</a>
        `).join("")}
      </nav>

      ${sessions.length === 0 ? renderEmptyHistory() : monthGroups.map(renderHistoryMonth).join("")}
    </section>
  `;
}

function filterSessions(sessions, filter) {
  if (filter === "upper") return sessions.filter((summary) => summary.workoutId?.startsWith("upper"));
  if (filter === "lower") return sessions.filter((summary) => summary.workoutId?.startsWith("lower"));
  if (filter === "30g") {
    const cutoff = Date.now() - 30 * 86400000;
    return sessions.filter((summary) => Date.parse(summary.completedAt) >= cutoff);
  }
  return sessions;
}

function renderHistoryMonth(group) {
  return `
    <section class="section history-month" aria-labelledby="${escapeHtml(group.headingId)}">
      <div class="section-header">
        <h2 id="${escapeHtml(group.headingId)}" class="section-title">${escapeHtml(group.label)}</h2>
        <span class="section-caption">${group.sessions.length} workout</span>
      </div>
      <div class="history-list" aria-label="${escapeHtml(`${group.label} workout kayıtları`)}">
        ${group.sessions.map(renderHistoryItem).join("")}
      </div>
    </section>
  `;
}

function renderHistoryItem(summary) {
  const prCount = getSessionPrCount(summary.id);
  return `
    <a class="history-item" href="#history/${encodeURIComponent(summary.id)}">
      <div class="history-item-topline">
        <h2>${escapeHtml(summary.workoutName)}</h2>
        ${prCount > 0 ? `<span class="pr-badge">${prCount} PR</span>` : ""}
      </div>
      <p class="history-item-date">${escapeHtml(formatHistoryDate(summary.completedAt))}</p>
      <div class="history-meta">
        <span>${TIMER_ICON} ${escapeHtml(formatDuration(summary.durationSeconds))}</span>
        <span>${summary.completedSetCount} set</span>
        <span>${summary.touchedExerciseCount} egzersiz</span>
      </div>
      <span class="chevron" aria-hidden="true">${CHEVRON_ICON}</span>
    </a>
  `;
}

function getSessionPrCount(sessionId) {
  const detail = DATA.history.getCompleted(sessionId);
  if (!detail) return 0;
  return DATA.prs.countNewRecords(detail.session);
}

function renderWorkoutDetail(sessionId) {
  const result = DATA.history.getCompleted(decodeURIComponent(sessionId));
  if (!result) {
    return `
      <section class="page">
        <header class="detail-header">
          <a class="back-link" href="#history"><span aria-hidden="true">${BACK_ICON}</span> Geçmiş</a>
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
        <a class="back-link is-circle" href="#history" aria-label="Geçmişe dön"><span aria-hidden="true">${BACK_ICON}</span> Geçmiş</a>
        <p class="eyebrow">Workout detayı</p>
        <h1 class="page-title">${escapeHtml(session.workoutName)}</h1>
        <p class="page-subtitle">${escapeHtml(formatFullTimestamp(session.completedAt))}</p>
      </header>

      <div class="history-summary-grid" aria-label="Workout özeti">
        <article class="card history-stat"><span>Süre</span><strong>${escapeHtml(formatDuration(summary.durationSeconds))}</strong></article>
        <article class="card history-stat"><span>Tamamlanan</span><strong>${summary.completedSetCount}/${summary.plannedSetCount}</strong></article>
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

      ${exercise.selectedVariation ? `
        <div class="history-exercise-notes">
          <p><strong>Varyasyon:</strong> ${escapeHtml(exercise.selectedVariation)}</p>
        </div>
      ` : ""}

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
      <p class="eyebrow">Kayıtlar</p>
      <h2>Henüz workout yok</h2>
      <p>İlk gerçek workout tamamlandığında burada görünecek.</p>
    </div>
  `;
}

function groupSessionsByMonth(sessions) {
  const groups = [];
  const byKey = new Map();

  for (const session of sessions) {
    const date = new Date(session.completedAt);
    const valid = !Number.isNaN(date.getTime());
    const key = valid ? `${date.getFullYear()}-${date.getMonth()}` : "unknown";
    let group = byKey.get(key);

    if (!group) {
      group = {
        headingId: `history-month-${key}`,
        label: valid
          ? new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" }).format(date)
          : "Tarihi bilinmeyen",
        sessions: [],
      };
      byKey.set(key, group);
      groups.push(group);
    }

    group.sessions.push(session);
  }

  return groups;
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

function formatHistoryDate(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "—";
  const month = new Intl.DateTimeFormat("tr-TR", { month: "short" }).format(date).replace(".", "");
  const day = new Intl.DateTimeFormat("tr-TR", { day: "numeric" }).format(date);
  const weekday = new Intl.DateTimeFormat("tr-TR", { weekday: "long" }).format(date);
  return `${day} ${month}, ${weekday}`;
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