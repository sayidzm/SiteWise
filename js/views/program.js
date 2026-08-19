import { PROGRAM } from "../data/program-data.js";
import { getExerciseDetail, getGuideList, getGuideSection } from "../data/program-content.js";

const CHEVRON_ICON = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>`;
const BACK_ICON = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>`;
const CLOSE_ICON = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>`;

export function renderProgram(route) {
  const [, workoutId] = route.split("/");
  if (workoutId && PROGRAM.workouts[workoutId]) {
    return renderWorkoutDetail(PROGRAM.workouts[workoutId]);
  }

  return `
    <section class="page program-page">
      <header class="page-header">
        <p class="eyebrow">SiteWise programı</p>
        <h1 class="page-title">Upper / Lower</h1>
        <p class="page-subtitle">Antrenman planı, teknik rehber, ısınma, progresyon ve güvenlik tek yerde.</p>
      </header>

      <section class="program-guide-section" aria-labelledby="program-guide-title">
        <div class="section-header">
          <h2 class="section-title" id="program-guide-title">Program Rehberi</h2>
        </div>
        <div class="program-guide-grid">
          ${getGuideList().map(renderGuideCard).join("")}
        </div>
      </section>

      <a class="settings-entry-card" href="#settings">
        <span>
          <small>Ayarlar & Veri</small>
          <strong>Offline, yedek ve Gym Mode tercihleri</strong>
        </span>
        <b aria-hidden="true">${CHEVRON_ICON}</b>
      </a>

      <section class="section" aria-labelledby="program-workouts-title">
        <div class="section-header">
          <h2 class="section-title" id="program-workouts-title">Workoutlar</h2>
        </div>
        <div class="list">
          ${Object.values(PROGRAM.workouts).map((workout) => `
            <a class="list-item" href="#program/${workout.id}">
              <div class="list-item-main">
                <p class="list-item-title">${escapeHtml(workout.name)}</p>
                <p class="list-item-subtitle">${workout.exercises.length} egzersiz • ${workout.estimatedDuration.min}–${workout.estimatedDuration.max} dk</p>
              </div>
              <span class="chevron" aria-hidden="true">${CHEVRON_ICON}</span>
            </a>
          `).join("")}
        </div>
      </section>

      ${renderProgramSheet()}
    </section>
  `;
}

function renderWorkoutDetail(workout) {
  return `
    <section class="page program-page">
      <header class="page-header">
        <a class="back-link" href="#program"><span aria-hidden="true">${BACK_ICON}</span> Program</a>
        <p class="eyebrow">Workout planı</p>
        <h1 class="page-title">${escapeHtml(workout.name)}</h1>
        <p class="page-subtitle">${escapeHtml(workout.focus)}</p>
        <div class="meta-row program-workout-meta">
          <span class="meta-chip">${workout.exercises.length} egzersiz</span>
          <span class="meta-chip">${workout.estimatedDuration.min}–${workout.estimatedDuration.max} dk</span>
        </div>
      </header>

      <div class="stack">
        ${workout.exercises.map((exercise, index) => renderExerciseCard(exercise, index)).join("")}
      </div>

      ${renderProgramSheet()}
    </section>
  `;
}

function renderExerciseCard(exercise, index) {
  const p = exercise.prescription;
  const rir = p.rir.min === p.rir.max ? `${p.rir.min}` : `${p.rir.min}–${p.rir.max}`;
  const reps = `${p.reps.min}–${p.reps.max}${p.reps.perSide ? " / bacak" : ""}`;
  const detail = getExerciseDetail(exercise.slotId);
  const alternativePreview = detail?.alternatives?.slice(0, 2).join(" • ") ?? "—";

  return `
    <article class="card exercise-card program-exercise-card">
      <div class="exercise-topline">
        <div class="exercise-index">${index + 1}</div>
        <div class="program-exercise-main">
          <h2 class="exercise-name">${escapeHtml(exercise.name)}</h2>
          <p class="list-item-subtitle">${escapeHtml(exercise.targetMuscles)}</p>
        </div>
      </div>

      <div class="exercise-prescription">
        <span class="meta-chip">${p.workingSets} × ${reps}</span>
        <span class="meta-chip">RIR ${rir}</span>
        <span class="meta-chip">${formatRestRange(p.restSeconds)} dinlenme</span>
      </div>

      <div class="program-alternative-preview">
        <span>Alternatif</span>
        <strong>${escapeHtml(alternativePreview)}</strong>
      </div>

      <button
        class="program-info-button"
        type="button"
        data-action="open-program-exercise-info"
        data-slot-id="${escapeHtml(exercise.slotId)}"
      >
        Teknik & alternatifler
        <span aria-hidden="true">${CHEVRON_ICON}</span>
      </button>
    </article>
  `;
}

function renderGuideCard(guide) {
  return `
    <button
      class="program-guide-card"
      type="button"
      data-action="open-program-guide"
      data-guide-id="${escapeHtml(guide.id)}"
    >
      <span class="program-guide-eyebrow">${escapeHtml(guide.eyebrow)}</span>
      <strong>${escapeHtml(guide.title)}</strong>
      <span class="program-guide-chevron" aria-hidden="true">${CHEVRON_ICON}</span>
    </button>
  `;
}

function renderProgramSheet() {
  return `
    <dialog class="bottom-sheet" id="program-sheet" aria-labelledby="program-sheet-title" aria-modal="true">
      <div class="bottom-sheet-panel">
        <div class="bottom-sheet-handle" aria-hidden="true"></div>
        <div class="bottom-sheet-header">
          <div class="bottom-sheet-heading" data-program-sheet-heading></div>
          <button
            class="bottom-sheet-close"
            type="button"
            aria-label="Kapat"
            data-action="close-program-sheet"
          >${CLOSE_ICON}</button>
        </div>
        <div class="bottom-sheet-body" data-program-sheet-body></div>
      </div>
    </dialog>
  `;
}

export function getProgramExerciseSheet(slotId) {
  const exercise = findExerciseBySlotId(slotId);
  const detail = getExerciseDetail(slotId);
  if (!exercise || !detail) return null;

  return {
    eyebrow: "Egzersiz rehberi",
    title: exercise.name,
    body: `
      <section class="sheet-prescription" aria-label="Program reçetesi">
        ${renderPrescription(exercise)}
      </section>

      <section class="sheet-section">
        <h3>Alternatifler</h3>
        ${renderBulletList(detail.alternatives)}
      </section>

      ${detail.notes?.length ? `
        <section class="sheet-section sheet-callout">
          <h3>Not</h3>
          ${renderBulletList(detail.notes)}
        </section>
      ` : ""}

      ${detail.techniqueSections.map((section) => `
        <section class="sheet-section">
          <h3>${section.title}</h3>
          ${renderBulletList(section.tips)}
        </section>
      `).join("")}

      <p class="sheet-source-note">Programdaki teknik notlar değiştirilmeden uygulama rehberine taşınmıştır.</p>
    `,
  };
}

export function getProgramGuideSheet(guideId) {
  const guide = getGuideSection(guideId);
  if (!guide) return null;

  return {
    eyebrow: guide.eyebrow,
    title: guide.title,
    body: guide.sections.map(renderGuideSection).join(""),
  };
}

function renderGuideSection(section) {
  return `
    <section class="sheet-section">
      <h3>${section.title}</h3>
      ${section.intro ? `<p>${section.intro}</p>` : ""}
      ${section.bullets ? renderBulletList(section.bullets) : ""}
      ${section.codeLines ? `<div class="guide-sequence">${section.codeLines.map((line) => `<div>${line}</div>`).join("")}</div>` : ""}
      ${section.subgroups ? section.subgroups.map((group) => `
        <div class="sheet-subgroup">
          <h4>${group.title}</h4>
          ${renderBulletList(group.bullets)}
        </div>
      `).join("") : ""}
      ${section.outro ? `<p>${section.outro}</p>` : ""}
    </section>
  `;
}

function renderPrescription(exercise) {
  const p = exercise.prescription;
  const rir = p.rir.min === p.rir.max ? `${p.rir.min}` : `${p.rir.min}–${p.rir.max}`;
  const reps = `${p.reps.min}–${p.reps.max}${p.reps.perSide ? " / bacak" : ""}`;
  return `
    <span class="meta-chip">${p.workingSets} × ${reps}</span>
    <span class="meta-chip">RIR ${rir}</span>
    <span class="meta-chip">${formatRestRange(p.restSeconds)} dinlenme</span>
  `;
}

function renderBulletList(items) {
  if (!items?.length) return `<p class="muted">—</p>`;
  return `<ul class="sheet-bullet-list">${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}

function findExerciseBySlotId(slotId) {
  for (const workout of Object.values(PROGRAM.workouts)) {
    const exercise = workout.exercises.find((item) => item.slotId === slotId);
    if (exercise) return exercise;
  }
  return null;
}

function formatRestRange(rest) {
  const f = (seconds) => seconds % 60 === 0 ? `${seconds / 60} dk` : `${seconds} sn`;
  return rest.min === rest.max ? f(rest.min) : `${f(rest.min)}–${f(rest.max)}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
