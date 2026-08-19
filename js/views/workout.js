import { PROGRAM } from "../data/program-data.js";
import { getExerciseDetail } from "../data/program-content.js";
import { DATA } from "../services/app-data.js";
import { getScheduledWorkout } from "../utils/dates.js";

const ICONS = {
  check: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>`,
  close: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>`,
  info: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>`,
  more: `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>`,
  note: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h6"/></svg>`,
  swap: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7 7 3-3 3 3M10 4v13M17 17l-3 3-3-3M14 20V7"/></svg>`,
  timer: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M9 2h6M12 9v4l2.5 1.5"/></svg>`,
};

export function renderWorkout(route = "workout") {
  const completedId = route.startsWith("workout/completed/")
    ? route.slice("workout/completed/".length)
    : null;

  if (completedId) return renderCompletedSummary(completedId);

  const activeSession = DATA.sessions.getActiveSession();
  if (activeSession) return renderActiveWorkout(activeSession);

  const { workout } = getScheduledWorkout(PROGRAM);
  if (!workout) return renderRestDay();
  return renderScheduledWorkout(workout);
}

function renderActiveWorkout(session) {
  const currentIndex = normalizeExerciseIndex(session);
  const exercise = session.exercises[currentIndex];
  const progress = getSessionProgress(session);
  const activeSet = getFirstIncompleteSet(exercise);
  const previous = DATA.previous.getPreviousExercise(session, exercise.slotId);
  const rest = getLatestRest(session);

  return `
    <section class="page active-workout-page" data-session-id="${session.id}" data-current-exercise-index="${currentIndex}">
      <header class="active-workout-header">
        <div>
          <h1 class="active-workout-title">${escapeHtml(session.workoutName)}</h1>
          <p class="active-workout-position">Egzersiz ${currentIndex + 1} / ${session.exercises.length}</p>
        </div>
        <div class="active-workout-header-actions">
          <span class="gym-mode-status" data-wake-status>Gym Mode</span>
          <button class="icon-button workout-menu-button" type="button" data-action="open-workout-options" aria-label="Workout seçenekleri">${ICONS.more}</button>
        </div>
      </header>

      <div class="workout-progress-row">
        <span>Workout ilerlemesi</span>
        <span>${progress.completed} / ${progress.total} set</span>
      </div>
      <div class="progress-track" role="progressbar" aria-label="Workout ilerlemesi" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress.percent}">
        <span style="width:${progress.percent}%"></span>
      </div>

      ${rest ? renderRestTimer(rest) : ""}

      <section class="active-exercise" aria-labelledby="active-exercise-title">
        <div class="active-exercise-heading">
          <div>
            <p class="eyebrow">Aktif egzersiz</p>
            <h2 id="active-exercise-title">${escapeHtml(exercise.selectedVariation || exercise.exerciseName)}</h2>
            ${exercise.selectedVariation ? `<p class="active-exercise-canonical">Program: ${escapeHtml(exercise.exerciseName)}</p>` : ""}
            <p class="active-exercise-muscles">${escapeHtml(exercise.targetMuscles)}</p>
          </div>
          ${renderActivePrescription(exercise, activeSet)}
        </div>

        ${renderPrevious(previous, exercise.prescriptionSnapshot.reps.perSide, activeSet)}
        ${activeSet ? renderActiveSetCard(exercise, activeSet) : renderExerciseComplete(exercise, currentIndex, session.exercises.length)}
        ${renderQuickActions(exercise)}
        ${renderSetOverview(exercise, activeSet)}
      </section>

      <nav class="exercise-navigation" aria-label="Egzersizler arası geçiş">
        <button class="button button-secondary" type="button" data-action="previous-exercise" ${currentIndex === 0 ? "disabled" : ""}>← Önceki</button>
        <button class="button button-secondary" type="button" data-action="next-exercise" ${currentIndex >= session.exercises.length - 1 ? "disabled" : ""}>Sonraki →</button>
      </nav>

      <section class="section workout-exercise-list" aria-labelledby="workout-list-title">
        <div class="section-header">
          <h2 id="workout-list-title" class="section-title">Workout</h2>
        </div>
        <div class="compact-exercise-list">
          ${session.exercises.map((item, index) => renderExerciseNavigator(item, index, currentIndex)).join("")}
        </div>
      </section>

      ${renderWorkoutSheet()}
    </section>
  `;
}

function renderActiveSetCard(exercise, set) {
  const p = exercise.prescriptionSnapshot;
  const repTarget = `${p.reps.min}–${p.reps.max}${p.reps.perSide ? " / bacak" : ""}`;
  const rirTarget = p.rir.min === p.rir.max ? String(p.rir.min) : `${p.rir.min}–${p.rir.max}`;

  return `
    <article class="active-set-card" data-slot-id="${exercise.slotId}" data-set-number="${set.setNumber}">
      <div class="active-set-topline">
        <div>
          <p class="eyebrow">Hızlı kayıt</p>
          <h3>Set ${set.setNumber}</h3>
        </div>
        <div class="target-badge">${repTarget} • RIR ${rirTarget}</div>
      </div>

      <div class="workout-fields">
      <div class="workout-input-group">
        <label for="weight-input">Ağırlık <span>kg</span></label>
        <div class="stepper-control">
          <button type="button" data-action="adjust-value" data-field="weight" data-delta="-0.5" aria-label="Ağırlığı 0,5 kg azalt">−</button>
          <input id="weight-input" data-field="weight" type="number" min="0" step="0.5" inputmode="decimal" placeholder="—" value="${valueOrEmpty(set.weight)}" autocomplete="off">
          <button type="button" data-action="adjust-value" data-field="weight" data-delta="0.5" aria-label="Ağırlığı 0,5 kg artır">+</button>
        </div>
      </div>

      <div class="workout-input-group">
        <label for="reps-input">Tekrar <span>${repTarget}</span></label>
        <div class="stepper-control">
          <button type="button" data-action="adjust-value" data-field="reps" data-delta="-1" aria-label="Tekrarı azalt">−</button>
          <input id="reps-input" data-field="reps" type="number" min="1" step="1" inputmode="numeric" placeholder="—" value="${valueOrEmpty(set.reps)}" autocomplete="off">
          <button type="button" data-action="adjust-value" data-field="reps" data-delta="1" aria-label="Tekrarı artır">+</button>
        </div>
      </div>
      </div>

      <fieldset class="rir-fieldset">
        <legend><span>RIR · Zorluk</span> <small>Hedef ${rirTarget}</small></legend>
        <div class="rir-options">
          ${[5,4,3,2,1,0].map((rir) => `
            <button type="button" class="rir-option${set.rir === rir ? " is-selected" : ""}${rir >= p.rir.min && rir <= p.rir.max ? " is-target" : ""}" data-action="select-rir" data-rir="${rir}" aria-pressed="${set.rir === rir}">${rir}</button>
          `).join("")}
        </div>
        <input data-field="rir" type="hidden" value="${valueOrEmpty(set.rir)}">
      </fieldset>

      <p class="set-safety-note">Technique &gt; Weight. Form bozulursa veya ağrı olursa seti bitir.</p>

      <div class="sticky-set-action">
        <button class="button complete-set-button" type="button" data-action="complete-set">${ICONS.check} Seti tamamla</button>
      </div>
    </article>
  `;
}

function renderSetOverview(exercise, activeSet) {
  return `
    <section class="set-overview" aria-labelledby="set-overview-title">
      <h3 id="set-overview-title">Setler</h3>
      ${exercise.sets.map((set) => {
        const isCurrent = activeSet?.setNumber === set.setNumber;
        const current = set.completedAt
          ? formatSet(set, exercise.prescriptionSnapshot.reps.perSide)
          : isCurrent && (set.weight !== null || set.reps !== null || set.rir !== null)
            ? formatSet(set, exercise.prescriptionSnapshot.reps.perSide)
            : "—";
        return `
          <div class="set-overview-row${set.completedAt ? " is-complete" : ""}${isCurrent ? " is-current" : ""}">
            <span class="set-number">${set.setNumber}</span>
            <span class="set-current">${escapeHtml(current)}</span>
            ${set.completedAt ? `<span class="set-state is-done" aria-label="Tamamlandı">${ICONS.check}</span>` : isCurrent ? `<span class="set-state">Şu an</span>` : `<span class="set-state">Bekliyor</span>`}
          </div>
        `;
      }).join("")}
    </section>
  `;
}

function renderPrevious(previous, perSide, activeSet) {
  if (!previous) {
    return `
      <article class="previous-card">
        <div>
          <p class="eyebrow">Önceki</p>
          <strong>Henüz veri yok</strong>
        </div>
        <span>—</span>
      </article>
    `;
  }

  const matchingSet = activeSet
    ? previous.sets.find((set) => set.setNumber === activeSet.setNumber) ?? previous.sets[0]
    : previous.sets[0];
  return `
    <article class="previous-card">
      <div>
        <p class="eyebrow">Önceki</p>
        <strong>${matchingSet ? escapeHtml(formatSet(matchingSet, perSide)) : "—"}</strong>
      </div>
      ${matchingSet && activeSet ? `<button class="previous-use-button" type="button" data-action="use-previous" data-weight="${matchingSet.weight}" data-reps="${matchingSet.reps}" data-rir="${matchingSet.rir}">Öncekini kullan</button>` : ""}
    </article>
  `;
}

function renderRestTimer(rest) {
  const startsAt = rest.restStartedAt ?? rest.completedAt;
  const total = Math.max(1, Math.round((Date.parse(rest.restEndsAt) - Date.parse(startsAt)) / 1000));
  const remaining = Math.max(0, Math.ceil((Date.parse(rest.restEndsAt) - Date.now()) / 1000));
  const percent = Math.min(100, Math.max(0, Math.round((remaining / total) * 100)));
  const finished = remaining === 0;

  return `
    <section class="rest-timer-card${finished ? " is-finished" : ""}" data-rest-slot-id="${rest.slotId}" data-rest-set-number="${rest.setNumber}" data-rest-started-at="${startsAt}" data-rest-ends-at="${rest.restEndsAt}" data-rest-total-seconds="${total}" aria-label="Dinlenme sayacı">
      <div class="rest-timer-main">
        <div class="rest-timer-label-row">
          <p class="eyebrow">${ICONS.timer} Dinlenme</p>
          <span class="rest-status" data-rest-status>${finished ? "Hazır" : "Dinlen"}</span>
        </div>
        <div class="rest-time" data-rest-display role="timer" aria-label="Kalan dinlenme süresi">${formatClock(remaining)}</div>
        <span class="visually-hidden" data-rest-announcement aria-live="polite">${finished ? "Dinlenme süresi tamamlandı." : ""}</span>
        <div class="rest-progress" aria-hidden="true"><span data-rest-progress style="width:${percent}%"></span></div>
      </div>
      <div class="rest-actions">
        <button type="button" data-action="add-rest" data-seconds="30">+30 sn</button>
        <button type="button" data-action="skip-rest">Geç</button>
      </div>
    </section>
  `;
}

function renderWorkoutSheet() {
  return `
    <dialog class="bottom-sheet" id="workout-sheet" aria-labelledby="workout-sheet-title" aria-modal="true">
      <div class="bottom-sheet-panel">
        <div class="bottom-sheet-handle" aria-hidden="true"></div>
        <div class="bottom-sheet-header">
          <div class="bottom-sheet-heading" data-workout-sheet-heading></div>
          <button class="bottom-sheet-close" type="button" aria-label="Kapat" data-action="close-workout-sheet">${ICONS.close}</button>
        </div>
        <div class="bottom-sheet-body" data-workout-sheet-body></div>
      </div>
    </dialog>
  `;
}

function renderQuickActions(exercise) {
  const hasNotes = Boolean(exercise.notes || exercise.painOrDiscomfort);
  const hasVariation = Boolean(exercise.selectedVariation);
  return `
    <div class="workout-quick-actions" aria-label="Egzersiz hızlı aksiyonları">
      <button type="button" data-action="open-workout-notes" data-slot-id="${escapeHtml(exercise.slotId)}">${ICONS.note}<span>Not${hasNotes ? `<small> Kayıtlı</small>` : ""}</span></button>
      <button type="button" data-action="open-workout-technique" data-slot-id="${escapeHtml(exercise.slotId)}">${ICONS.info}<span>Teknik</span></button>
      <button type="button" data-action="open-workout-alternatives" data-slot-id="${escapeHtml(exercise.slotId)}">${ICONS.swap}<span>Alternatif${hasVariation ? `<small> Seçili</small>` : ""}</span></button>
    </div>
  `;
}

function renderActivePrescription(exercise, activeSet) {
  const p = exercise.prescriptionSnapshot;
  const reps = `${p.reps.min}–${p.reps.max}${p.reps.perSide ? " / bacak" : ""}`;
  const rir = p.rir.min === p.rir.max ? `${p.rir.min}` : `${p.rir.min}–${p.rir.max}`;
  return `<p class="active-prescription">Set ${activeSet?.setNumber ?? p.workingSets} / ${p.workingSets} <span>•</span> ${reps} tekrar <span>•</span> RIR ${rir}</p>`;
}

export function getWorkoutNotesSheet(session, slotId) {
  const exercise = session?.exercises.find((item) => item.slotId === slotId);
  if (!exercise) return null;
  return {
    eyebrow: "Aktif egzersiz",
    title: "Egzersiz notları",
    body: `
      <form class="sheet-form" data-slot-id="${escapeHtml(slotId)}">
        <label for="exercise-notes">Egzersiz notu <span>Opsiyonel</span></label>
        <textarea id="exercise-notes" data-exercise-notes rows="4" placeholder="Makine ayarı, form hatırlatması…">${escapeHtml(exercise.notes)}</textarea>
        <label for="exercise-pain">Rahatsızlık <span>Opsiyonel</span></label>
        <input id="exercise-pain" data-exercise-pain type="text" value="${escapeHtml(exercise.painOrDiscomfort)}" placeholder="Ağrı veya rahatsızlık" />
        <p class="sheet-form-note">Ağrı kaydı progression değerlendirmesinde manuel kontrol gerektirir.</p>
        <button class="button" type="button" data-action="save-exercise-notes">Kaydet</button>
      </form>
    `,
  };
}

export function getWorkoutTechniqueSheet(slotId) {
  const detail = getExerciseDetail(slotId);
  if (!detail) return null;
  return {
    eyebrow: "Teknik",
    title: detail.techniqueSections[0]?.title ?? "Egzersiz tekniği",
    body: detail.techniqueSections.map((section) => `
      <section class="sheet-section">
        <h3>${escapeHtml(section.title)}</h3>
        <ul class="sheet-bullet-list">${section.tips.map((tip) => `<li>${escapeHtml(tip)}</li>`).join("")}</ul>
      </section>
    `).join(""),
  };
}

export function getWorkoutAlternativesSheet(session, slotId) {
  const exercise = session?.exercises.find((item) => item.slotId === slotId);
  const detail = getExerciseDetail(slotId);
  if (!exercise || !detail) return null;
  const choices = [{ value: "", label: exercise.exerciseName }, ...detail.alternatives.map((item) => ({ value: item, label: item }))];
  return {
    eyebrow: "Bu workout için",
    title: "Alternatif egzersiz",
    body: `
      <p class="sheet-intro">Seçim yalnızca aktif session'a kaydedilir; program tanımı değişmez.</p>
      <div class="variation-list" data-variation-list data-slot-id="${escapeHtml(slotId)}">
        ${choices.map((choice, index) => {
          const selected = choice.value ? exercise.selectedVariation === choice.value : !exercise.selectedVariation;
          return `<label class="variation-option${selected ? " is-selected" : ""}"><input type="radio" name="exercise-variation" value="${escapeHtml(choice.value)}" ${selected ? "checked" : ""}><span><strong>${escapeHtml(choice.label)}</strong>${index === 0 ? "<small>Programdaki hareket</small>" : ""}</span>${selected ? ICONS.check : ""}</label>`;
        }).join("")}
        <button class="button" type="button" data-action="save-exercise-variation">Seçimi kullan</button>
      </div>
    `,
  };
}

function renderExerciseComplete(exercise, currentIndex, totalExercises) {
  const isLast = currentIndex === totalExercises - 1;
  return `
    <div class="exercise-complete-card">
      <strong>Egzersiz tamamlandı</strong>
      <p>${exercise.prescriptionSnapshot.workingSets} çalışma setinin tamamı kaydedildi.</p>
      ${isLast
        ? '<button class="button" type="button" data-action="finish-workout">Workout\'u bitir</button>'
        : '<button class="button" type="button" data-action="next-exercise">Sonraki egzersiz →</button>'}
    </div>
  `;
}

function renderExerciseNavigator(exercise, index, currentIndex) {
  const completed = exercise.sets.filter((set) => set.completedAt).length;
  const total = exercise.sets.length;
  return `
    <button class="compact-exercise-item${index === currentIndex ? " is-current" : ""}${completed === total ? " is-complete" : ""}" type="button" data-action="go-exercise" data-exercise-index="${index}">
      <span>${index + 1}. ${escapeHtml(exercise.exerciseName)}</span>
      <strong>${completed}/${total}</strong>
    </button>
  `;
}

function renderCompletedSummary(sessionId) {
  const session = DATA.sessions.getSession(sessionId);
  if (!session || session.status !== "completed") {
    return `
      <section class="page">
        <div class="empty-state">
          <h2>Workout bulunamadı</h2>
          <p>Bu tamamlanmış workout yerel veride mevcut değil.</p>
          <a class="button button-secondary" href="#home">Ana sayfa</a>
        </div>
      </section>
    `;
  }

  const progress = getSessionProgress(session);
  const durationMinutes = Math.max(1, Math.round((Date.parse(session.completedAt) - Date.parse(session.startedAt)) / 60000));

  return `
    <section class="page completion-page">
      <div class="completion-mark">✓</div>
      <p class="eyebrow">Workout tamamlandı</p>
      <h1 class="page-title">${escapeHtml(session.workoutName)}</h1>
      <p class="page-subtitle">Gerçek kaydedilen setlerin yerel cihazında saklandı.</p>

      <div class="completion-stats">
        <article class="card"><span>Süre</span><strong>${durationMinutes} dk</strong></article>
        <article class="card"><span>Set</span><strong>${progress.completed}</strong></article>
        <article class="card"><span>Egzersiz</span><strong>${countTouchedExercises(session)}</strong></article>
      </div>

      <section class="section">
        <div class="stack">
          ${session.exercises.map((exercise) => {
            const done = exercise.sets.filter((set) => set.completedAt);
            if (done.length === 0) return "";
            return `
              <article class="card exercise-card">
                <h2 class="exercise-name">${escapeHtml(exercise.exerciseName)}</h2>
                <div class="completed-set-list">
                  ${done.map((set) => `<span>Set ${set.setNumber}: ${escapeHtml(formatSet(set, exercise.prescriptionSnapshot.reps.perSide))}</span>`).join("")}
                </div>
              </article>
            `;
          }).join("")}
        </div>
      </section>

      <div class="workout-primary-action completion-actions">
        <a class="button" href="#history/${encodeURIComponent(session.id)}">Geçmişte görüntüle</a>
        <a class="button button-secondary" href="#home">Ana sayfa</a>
      </div>
    </section>
  `;
}

function renderScheduledWorkout(workout) {
  return `
    <section class="page">
      <header class="page-header">
        <p class="eyebrow">Bugünkü workout</p>
        <h1 class="page-title">${escapeHtml(workout.name)}</h1>
        <p class="page-subtitle">${escapeHtml(workout.focus)}</p>
      </header>

      <div class="meta-row">
        <span class="meta-chip">${workout.exercises.length} egzersiz</span>
        <span class="meta-chip">${workout.estimatedDuration.min}–${workout.estimatedDuration.max} dk</span>
      </div>

      <div class="workout-primary-action">
        <button class="button" type="button" data-action="start-workout" data-workout-id="${workout.id}">Workout başlat</button>
      </div>

      <section class="section" aria-labelledby="workout-exercises-title">
        <div class="section-header"><h2 id="workout-exercises-title" class="section-title">Egzersizler</h2></div>
        <div class="stack">${workout.exercises.map(renderExerciseCard).join("")}</div>
      </section>
    </section>
  `;
}

function renderRestDay() {
  return `
    <section class="page">
      <header class="page-header">
        <p class="eyebrow">Workout</p>
        <h1 class="page-title">Dinlenme günü</h1>
        <p class="page-subtitle">Bugün programda workout bulunmuyor.</p>
      </header>
      <div class="empty-state">
        <h2>Planlı dinlenme</h2>
        <p>Haftalık programı görüntüleyebilir veya sonraki workout'u kontrol edebilirsin.</p>
        <a class="button button-secondary" href="#program">Programı aç</a>
      </div>
    </section>
  `;
}

function renderExerciseCard(exercise, index) {
  return `
    <article class="card exercise-card">
      <div class="exercise-topline">
        <div class="exercise-index">${index + 1}</div>
        <div><h3 class="exercise-name">${escapeHtml(exercise.name)}</h3><p class="list-item-subtitle">${escapeHtml(exercise.targetMuscles)}</p></div>
      </div>
      ${renderPrescription(exercise.prescription)}
    </article>
  `;
}

function renderPrescription(p) {
  const reps = `${p.reps.min}–${p.reps.max}${p.reps.perSide ? " / bacak" : ""}`;
  const rir = p.rir.min === p.rir.max ? `${p.rir.min}` : `${p.rir.min}–${p.rir.max}`;
  const rest = p.restSeconds.min === p.restSeconds.max ? formatRest(p.restSeconds.min) : `${formatRest(p.restSeconds.min)}–${formatRest(p.restSeconds.max)}`;
  return `<div class="exercise-prescription"><span class="meta-chip">${p.workingSets} set</span><span class="meta-chip">${reps}</span><span class="meta-chip">RIR ${rir}</span><span class="meta-chip">${rest}</span></div>`;
}

function getFirstIncompleteSet(exercise) {
  return exercise.sets.find((set) => set.type === "working" && !set.completedAt) ?? null;
}

function normalizeExerciseIndex(session) {
  return Math.min(Math.max(session.currentExerciseIndex, 0), session.exercises.length - 1);
}

function getLatestRest(session) {
  const completed = session.exercises.flatMap((exercise) => exercise.sets
    .filter((set) => set.completedAt && set.restEndsAt)
    .map((set) => ({ ...set, slotId: exercise.slotId }))
  );
  completed.sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt));
  return completed[0] ?? null;
}

function getSessionProgress(session) {
  const sets = session.exercises.flatMap((exercise) => exercise.sets.filter((set) => set.type === "working"));
  const completed = sets.filter((set) => Boolean(set.completedAt)).length;
  const total = sets.length;
  return { completed, total, percent: total === 0 ? 0 : Math.round((completed / total) * 100) };
}

function countTouchedExercises(session) {
  return session.exercises.filter((exercise) => exercise.sets.some((set) => set.completedAt)).length;
}

function formatSet(set, perSide = false) {
  const weight = Number.isFinite(set.weight) ? `${trimNumber(set.weight)} kg` : "— kg";
  const reps = Number.isInteger(set.reps) ? `${set.reps}${perSide ? "/bacak" : ""}` : "—";
  const rir = Number.isInteger(set.rir) ? `RIR ${set.rir}` : "RIR —";
  return `${weight} × ${reps} • ${rir}`;
}

function trimNumber(value) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
}

function valueOrEmpty(value) {
  return value === null || value === undefined ? "" : String(value);
}

function formatRest(seconds) {
  if (seconds % 60 === 0) return `${seconds / 60} dk`;
  if (seconds > 60) return `${Math.floor(seconds / 60)} dk ${seconds % 60} sn`;
  return `${seconds} sn`;
}

function formatClock(seconds) {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
