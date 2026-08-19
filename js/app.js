import { startRouter, navigate, getRoute } from "./router.js";
import { renderBottomNav } from "./components/bottom-nav.js";
import { renderHome } from "./views/home.js";
import {
  renderWorkout,
  getWorkoutNotesSheet,
  getWorkoutTechniqueSheet,
  getWorkoutAlternativesSheet,
} from "./views/workout.js";
import { renderHistory } from "./views/history.js";
import { renderProgress } from "./views/progress.js";
import { renderProgram, getProgramExerciseSheet, getProgramGuideSheet } from "./views/program.js";
import { DATA } from "./services/app-data.js";
import { PROGRAM } from "./data/program-data.js";
import { getScheduledWorkout } from "./utils/dates.js";
import { WakeLockService } from "./services/wake-lock-service.js";
import { renderSettings } from "./views/settings.js";
import { PWA } from "./services/pwa-service.js";

const content = document.querySelector("#app-content");
const nav = document.querySelector("#bottom-nav");
let restTimerInterval = null;
let draftSaveTimer = null;
let programSheetTrigger = null;
let workoutSheetTrigger = null;
const notifiedRestTimers = new Set();
const wakeLock = new WakeLockService();

const routes = {
  home: renderHome,
  workout: renderWorkout,
  history: renderHistory,
  progress: renderProgress,
  program: renderProgram,
  settings: renderSettings,
};

content.addEventListener("click", handleActionClick);
content.addEventListener("input", handleWorkoutInput);
content.addEventListener("change", handleWorkoutInput);
content.addEventListener("change", handleSettingsChange);
content.addEventListener("change", handleImportFileChange);
content.addEventListener("focusin", handleWorkoutFocus);
content.addEventListener("focusout", handleWorkoutBlur);
document.addEventListener("visibilitychange", handleVisibilityChange);
window.visualViewport?.addEventListener("resize", syncVisualViewport);
window.visualViewport?.addEventListener("scroll", syncVisualViewport);
window.addEventListener("pwa-install-available", refreshSettingsIfOpen);
window.addEventListener("pwa-installed", refreshSettingsIfOpen);

startRouter(renderRoute);
void PWA.register().then(refreshSettingsIfOpen);

function renderRoute(route) {
  stopRestTimer();
  document.body.classList.remove("sheet-open");

  const rootRoute = route.split("/")[0];
  const renderer = routes[rootRoute] ?? routes.home;

  try {
    content.innerHTML = renderer(route);
  } catch (error) {
    console.error(error);
    content.innerHTML = renderFatalState(error);
  }

  const gymMode = rootRoute === "workout" && Boolean(DATA.sessions.getActiveSession()) && !route.startsWith("workout/completed/");
  document.body.classList.toggle("gym-mode", gymMode);
  if (!gymMode) {
    document.body.classList.remove("keyboard-focus", "keyboard-open");
  }
  nav.hidden = gymMode;

  renderBottomNav(nav, rootRoute === "settings" ? "program" : rootRoute);
  document.title = `${titleFor(rootRoute)} • SiteWise`;
  content.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "auto" });

  if (gymMode) startRestTimer();
  syncVisualViewport();
  const keepScreenAwake = DATA.settings.get("keepScreenAwake");
  void syncWakeLock(gymMode && keepScreenAwake, { disabledBySetting: gymMode && !keepScreenAwake });
}

function handleActionClick(event) {
  const actionElement = event.target.closest("[data-action]");
  if (!actionElement) return;

  event.preventDefault();
  const action = actionElement.dataset.action;

  try {
    switch (action) {
      case "start-workout":
        startWorkout(actionElement);
        break;
      case "open-program-exercise-info":
        openProgramSheet(getProgramExerciseSheet(actionElement.dataset.slotId));
        break;
      case "open-program-guide":
        openProgramSheet(getProgramGuideSheet(actionElement.dataset.guideId));
        break;
      case "close-program-sheet":
        closeProgramSheet();
        break;
      case "open-workout-exercise-info":
        openWorkoutSheet(getProgramExerciseSheet(actionElement.dataset.slotId));
        break;
      case "open-workout-notes":
        openWorkoutSheet(getWorkoutNotesSheet(requireActiveSession(), actionElement.dataset.slotId));
        break;
      case "open-workout-technique":
        openWorkoutSheet(getWorkoutTechniqueSheet(actionElement.dataset.slotId));
        break;
      case "open-workout-alternatives":
        openWorkoutSheet(getWorkoutAlternativesSheet(requireActiveSession(), actionElement.dataset.slotId));
        break;
      case "save-exercise-notes":
        saveExerciseNotes(actionElement);
        break;
      case "save-exercise-variation":
        saveExerciseVariation(actionElement);
        break;
      case "open-workout-options":
        openWorkoutSheet(getWorkoutOptionsSheet());
        break;
      case "open-workout-guide":
        openWorkoutSheet(getProgramGuideSheet(actionElement.dataset.guideId));
        break;
      case "close-workout-sheet":
        closeWorkoutSheet();
        break;
      case "adjust-value":
        adjustValue(actionElement);
        break;
      case "select-rir":
        selectRir(actionElement);
        break;
      case "use-previous":
        usePrevious(actionElement);
        break;
      case "complete-set":
        completeCurrentSet(actionElement);
        break;
      case "next-exercise":
        moveExercise(1);
        break;
      case "previous-exercise":
        moveExercise(-1);
        break;
      case "go-exercise":
        goExercise(Number(actionElement.dataset.exerciseIndex));
        break;
      case "add-rest":
        addRest(Number(actionElement.dataset.seconds));
        break;
      case "skip-rest":
        skipRest();
        break;
      case "finish-workout":
        finishWorkout();
        break;
      case "confirm-finish-workout":
        finishWorkout(true);
        break;
      case "request-discard-workout":
        openWorkoutSheet(getDiscardConfirmationSheet());
        break;
      case "confirm-discard-workout":
        discardWorkout();
        break;
      case "export-data":
        exportData();
        break;
      case "choose-import":
        chooseImportFile();
        break;
      case "restore-pre-import":
        restorePreImport();
        break;
      case "reset-all-data":
        resetAllData();
        break;
      case "install-pwa":
        void installPwa();
        break;
      case "reload-app":
        window.location.reload();
        break;
      default:
        break;
    }
  } catch (error) {
    console.error(error);
    showInlineError(error instanceof Error ? error.message : "İşlem tamamlanamadı.");
  }
}

function handleWorkoutInput(event) {
  const field = event.target.closest(".active-set-card [data-field]");
  if (!field || field.type === "hidden") return;

  const card = field.closest(".active-set-card");
  if (!card) return;

  clearTimeout(draftSaveTimer);
  draftSaveTimer = setTimeout(() => {
    try {
      saveDraftField(card, field.dataset.field, field.value);
    } catch (error) {
      console.error(error);
      showInlineError(error instanceof Error ? error.message : "Set taslağı kaydedilemedi.");
    }
  }, 180);
}

function handleSettingsChange(event) {
  const input = event.target.closest("[data-setting-key]");
  if (!input) return;

  try {
    DATA.settings.set(input.dataset.settingKey, Boolean(input.checked));
  } catch (error) {
    input.checked = !input.checked;
    console.error(error);
    showInlineError(error instanceof Error ? error.message : "Ayar kaydedilemedi.");
  }
}

async function handleImportFileChange(event) {
  const input = event.target.closest("[data-import-file]");
  if (!input) return;

  const [file] = input.files ?? [];
  if (!file) return;

  try {
    const text = await file.text();
    const inspection = DATA.portability.inspectImportText(text);
    const summary = inspection.summary;

    const lines = [
      "Yedek doğrulandı. İçe aktarma cihazdaki mevcut Workout Tracker verilerinin tamamını değiştirecek.",
      "",
      `Tamamlanan workout: ${summary.completedSessions}`,
      `Aktif workout: ${summary.inProgressSessions}`,
      `Tamamlanan set: ${summary.completedSets}`,
      `Yedek tarihi: ${new Date(inspection.exportedAt).toLocaleString("tr-TR")}`,
      "",
      "Mevcut verinin içe aktarma öncesi güvenlik kopyası cihazda tutulacak ve Ayarlar'dan geri alınabilecek.",
      "",
      "Devam etmek istiyor musun?",
    ];

    if (!window.confirm(lines.join("\n"))) return;

    DATA.portability.importText(text);
    void wakeLock.release();
    renderRoute("settings");
    showInlineNotice("Yedek başarıyla içe aktarıldı. Önceki veriler geri alma yedeğinde tutuluyor.");
  } catch (error) {
    console.error(error);
    showInlineError(error instanceof Error ? error.message : "Yedek içe aktarılamadı.");
  } finally {
    input.value = "";
  }
}

function exportData() {
  const text = DATA.portability.createExportText();
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);

  anchor.href = url;
  anchor.download = `workout-tracker-backup-${date}.json`;
  anchor.hidden = true;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  showInlineNotice("Yedek dosyası oluşturuldu.");
}

function chooseImportFile() {
  const input = content.querySelector("[data-import-file]");
  input?.click();
}

function restorePreImport() {
  const summary = DATA.portability.getPreImportRecoverySummary();
  if (!summary) throw new Error("Geri alınabilecek içe aktarma öncesi yedek bulunamadı.");

  const accepted = window.confirm(
    `Son içe aktarmadan önceki verilere dönmek istiyor musun?\n\n` +
    `Tamamlanan workout: ${summary.completedSessions}\n` +
    `Aktif workout: ${summary.inProgressSessions}\n` +
    `Tamamlanan set: ${summary.completedSets}\n\n` +
    `Şu anki içe aktarılmış durum normal rolling backup'a alınacak.`,
  );
  if (!accepted) return;

  DATA.portability.restorePreImport();
  void wakeLock.release();
  renderRoute("settings");
  showInlineNotice("İçe aktarma geri alındı ve önceki yerel veriler geri yüklendi.");
}

function resetAllData() {
  const active = DATA.sessions.getActiveSession();
  const accepted = window.confirm("Tüm workout geçmişini, aktif workout'u ve ayarları bu cihazdan silmek istiyor musun? Bu işlem geri alınamaz.");
  if (!accepted) return;

  if (active && !window.confirm("Şu anda devam eden bir workout var. Onu da kalıcı olarak silmek istediğine emin misin?")) return;

  DATA.store.reset();
  void wakeLock.release();
  renderRoute("settings");
  showInlineNotice("Yerel Workout Tracker verileri sıfırlandı.");
}

async function installPwa() {
  try {
    const result = await PWA.promptInstall();
    renderRoute("settings");
    if (!result.available) {
      showInlineError("Tarayıcı şu anda uygulama yükleme istemi sunmuyor.");
      return;
    }
    if (result.outcome === "accepted") showInlineNotice("Uygulama yükleme işlemi başlatıldı.");
    else showInlineNotice("Uygulama yükleme işlemi iptal edildi.");
  } catch (error) {
    console.error(error);
    showInlineError("Uygulama yükleme istemi açılamadı.");
  }
}

function refreshSettingsIfOpen() {
  if (getRoute().split("/")[0] === "settings") renderRoute(getRoute());
}

function handleWorkoutFocus(event) {
  const input = event.target.closest(".active-set-card input");
  if (!input) return;

  document.body.classList.add("keyboard-focus");
  syncVisualViewport();
  window.setTimeout(() => {
    input.scrollIntoView({ behavior: preferredScrollBehavior(), block: "center" });
    syncVisualViewport();
  }, 120);
}

function handleWorkoutBlur(event) {
  if (!event.target.closest(".active-set-card input")) return;
  window.setTimeout(() => {
    if (!content.querySelector(".active-set-card input:focus")) {
      document.body.classList.remove("keyboard-focus");
      syncVisualViewport();
    }
  }, 140);
}

function startWorkout(button) {
  if (button.disabled) return;

  const workoutId = button.dataset.workoutId;
  const scheduled = getScheduledWorkout(PROGRAM);

  if (!workoutId || workoutId !== scheduled.workoutId) {
    showInlineError("Bugünün programıyla eşleşmeyen bir workout başlatılamaz.");
    return;
  }

  const active = DATA.sessions.getActiveSession();
  if (active) {
    navigate("workout");
    return;
  }

  button.disabled = true;
  button.textContent = "Başlatılıyor…";
  DATA.workouts.start(workoutId);
  navigate("workout");
}

function adjustValue(button) {
  const card = button.closest(".active-set-card");
  const fieldName = button.dataset.field;
  const input = card?.querySelector(`input[data-field="${fieldName}"]`);
  if (!card || !input) return;

  const delta = Number(button.dataset.delta);
  const current = input.value === "" ? 0 : Number(input.value);
  const min = fieldName === "reps" ? 1 : 0;
  const next = Math.max(min, current + delta);
  input.value = formatInputNumber(next);
  saveDraftField(card, fieldName, input.value);
}

function selectRir(button) {
  const card = button.closest(".active-set-card");
  if (!card) return;

  const rir = Number(button.dataset.rir);
  const input = card.querySelector('[data-field="rir"]');
  if (!input || !Number.isInteger(rir)) return;

  input.value = String(rir);
  card.querySelectorAll(".rir-option").forEach((option) => {
    const selected = Number(option.dataset.rir) === rir;
    option.classList.toggle("is-selected", selected);
    option.setAttribute("aria-pressed", String(selected));
  });
  saveDraftField(card, "rir", rir);
}

function saveDraftField(card, field, rawValue) {
  const session = requireActiveSession();
  const slotId = card.dataset.slotId;
  const setNumber = Number(card.dataset.setNumber);
  const value = rawValue === "" ? null : Number(rawValue);

  DATA.workouts.saveSetDraft(session.id, slotId, setNumber, { [field]: value });
}

function usePrevious(button) {
  const card = content.querySelector(".active-set-card");
  if (!card) return;

  const values = {
    weight: Number(button.dataset.weight),
    reps: Number(button.dataset.reps),
    rir: Number(button.dataset.rir),
  };
  if (!Number.isFinite(values.weight) || !Number.isInteger(values.reps) || !Number.isInteger(values.rir)) {
    throw new Error("Önceki set verisi kullanılamadı.");
  }

  const session = requireActiveSession();
  DATA.workouts.saveSetDraft(session.id, card.dataset.slotId, Number(card.dataset.setNumber), values);
  renderRoute(getRoute());
}

function saveExerciseNotes(button) {
  const form = button.closest("[data-slot-id]");
  if (!form) return;
  const session = requireActiveSession();
  const notes = form.querySelector("[data-exercise-notes]")?.value ?? "";
  const painOrDiscomfort = form.querySelector("[data-exercise-pain]")?.value ?? "";
  DATA.workouts.setExerciseNotes(session.id, form.dataset.slotId, { notes, painOrDiscomfort });
  closeWorkoutSheet();
  renderRoute(getRoute());
  showInlineNotice("Egzersiz notları kaydedildi.");
}

function saveExerciseVariation(button) {
  const list = button.closest("[data-variation-list]");
  if (!list) return;
  const selected = list.querySelector('input[name="exercise-variation"]:checked');
  if (!selected) throw new Error("Bir egzersiz seç.");
  const session = requireActiveSession();
  DATA.workouts.setExerciseVariation(session.id, list.dataset.slotId, selected.value || null);
  closeWorkoutSheet();
  renderRoute(getRoute());
  showInlineNotice("Egzersiz seçimi bu workout'a kaydedildi.");
}

function completeCurrentSet(button) {
  const card = button.closest(".active-set-card");
  if (!card) return;

  clearTimeout(draftSaveTimer);
  draftSaveTimer = null;
  const session = requireActiveSession();
  const slotId = card.dataset.slotId;
  const setNumber = Number(card.dataset.setNumber);
  const weight = readNumericField(card, "weight");
  const reps = readNumericField(card, "reps");
  const rir = readNumericField(card, "rir");

  if (weight === null || weight < 0) throw new Error("KG değerini gir.");
  if (!Number.isInteger(reps) || reps < 1) throw new Error("Tekrar sayısını gir.");
  if (!Number.isInteger(rir) || rir < 0 || rir > 10) throw new Error("RIR değerini seç.");

  button.disabled = true;
  button.textContent = "Kaydediliyor…";

  const updated = DATA.workouts.completeSet(session.id, slotId, setNumber, { weight, reps, rir });
  const exerciseIndex = updated.exercises.findIndex((exercise) => exercise.slotId === slotId);
  const exerciseDone = updated.exercises[exerciseIndex]?.sets.every((set) => Boolean(set.completedAt));

  if (exerciseDone) {
    const nextIncomplete = updated.exercises.findIndex((exercise, index) =>
      index > exerciseIndex && exercise.sets.some((set) => !set.completedAt)
    );
    if (nextIncomplete !== -1) DATA.workouts.setCurrentExercise(session.id, nextIncomplete);
  }

  renderRoute(getRoute());
}

function moveExercise(delta) {
  const session = requireActiveSession();
  const next = Math.min(Math.max(session.currentExerciseIndex + delta, 0), session.exercises.length - 1);
  DATA.workouts.setCurrentExercise(session.id, next);
  renderRoute(getRoute());
}

function goExercise(index) {
  const session = requireActiveSession();
  DATA.workouts.setCurrentExercise(session.id, index);
  renderRoute(getRoute());
}

function addRest(seconds) {
  const timer = content.querySelector(".rest-timer-card");
  if (!timer || !Number.isInteger(seconds)) return;

  const session = requireActiveSession();
  DATA.workouts.adjustRest(session.id, timer.dataset.restSlotId, Number(timer.dataset.restSetNumber), seconds);
  renderRoute(getRoute());
}

function skipRest() {
  const timer = content.querySelector(".rest-timer-card");
  if (!timer) return;

  const session = requireActiveSession();
  DATA.workouts.skipRest(session.id, timer.dataset.restSlotId, Number(timer.dataset.restSetNumber));
  renderRoute(getRoute());
}

function finishWorkout(force = false) {
  const session = requireActiveSession();
  const incomplete = session.exercises
    .flatMap((exercise) => exercise.sets)
    .filter((set) => set.type === "working" && !set.completedAt).length;

  if (!force && incomplete > 0 && DATA.settings.get("confirmIncompleteFinish")) {
    openWorkoutSheet(getFinishConfirmationSheet(incomplete));
    return;
  }

  closeWorkoutSheet();
  const completed = DATA.workouts.complete(session.id);
  navigate(`workout/completed/${completed.id}`);
}

function discardWorkout() {
  const session = requireActiveSession();
  closeWorkoutSheet();
  DATA.workouts.discard(session.id);
  void wakeLock.release();
  navigate("home");
}

function getFinishConfirmationSheet(incomplete) {
  return {
    eyebrow: "Eksik workout",
    title: "Workout'u bitir?",
    body: `
      <section class="sheet-section sheet-callout warning-callout">
        <h3>${incomplete} çalışma seti tamamlanmadı</h3>
        <p>Tamamlanan setler gerçek haliyle Geçmiş'e kaydedilecek.</p>
      </section>
      <div class="confirmation-actions">
        <button class="button" type="button" data-action="close-workout-sheet">Workout'a dön</button>
        <button class="button button-secondary" type="button" data-action="confirm-finish-workout">Yine de bitir</button>
      </div>
    `,
  };
}

function getDiscardConfirmationSheet() {
  return {
    eyebrow: "Geri alınamaz",
    title: "Workout'u iptal et?",
    body: `
      <section class="sheet-section danger-callout">
        <h3>Aktif workout silinecek</h3>
        <p>Bu session'daki set girişleri Geçmiş'e eklenmez. Program tanımı etkilenmez.</p>
      </section>
      <div class="confirmation-actions">
        <button class="button" type="button" data-action="close-workout-sheet">Workout'a dön</button>
        <button class="button danger-button" type="button" data-action="confirm-discard-workout">Workout'u iptal et</button>
      </div>
    `,
  };
}

function openProgramSheet(sheetData) {
  if (!sheetData) {
    showInlineError("Program bilgisi bulunamadı.");
    return;
  }

  const dialog = content.querySelector("#program-sheet");
  if (!dialog) return;

  const opening = !dialog.open;
  if (opening) programSheetTrigger = getFocusedElement();

  const heading = dialog.querySelector("[data-program-sheet-heading]");
  const body = dialog.querySelector("[data-program-sheet-body]");
  if (!heading || !body) return;

  heading.innerHTML = `
    <p class="eyebrow">${escapeHtml(sheetData.eyebrow)}</p>
    <h2 id="program-sheet-title">${escapeHtml(sheetData.title)}</h2>
  `;
  body.innerHTML = sheetData.body;

  document.body.classList.add("sheet-open");
  if (opening) {
    dialog.addEventListener("close", () => {
      document.body.classList.remove("sheet-open");
      restoreFocus(programSheetTrigger);
      programSheetTrigger = null;
    }, { once: true });
  }

  if (typeof dialog.showModal === "function") {
    if (!dialog.open) dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
  }

  dialog.querySelector(".bottom-sheet-close")?.focus({ preventScroll: true });
}

function closeProgramSheet() {
  const dialog = content.querySelector("#program-sheet");
  if (!dialog) return;

  if (typeof dialog.close === "function" && dialog.open) dialog.close();
  else {
    dialog.removeAttribute("open");
    document.body.classList.remove("sheet-open");
    restoreFocus(programSheetTrigger);
    programSheetTrigger = null;
  }
}

function openWorkoutSheet(sheetData) {
  if (!sheetData) {
    showInlineError("Workout bilgisi bulunamadı.");
    return;
  }

  const dialog = content.querySelector("#workout-sheet");
  if (!dialog) return;

  const opening = !dialog.open;
  if (opening) workoutSheetTrigger = getFocusedElement();

  const heading = dialog.querySelector("[data-workout-sheet-heading]");
  const body = dialog.querySelector("[data-workout-sheet-body]");
  if (!heading || !body) return;

  heading.innerHTML = `
    <p class="eyebrow">${escapeHtml(sheetData.eyebrow)}</p>
    <h2 id="workout-sheet-title">${escapeHtml(sheetData.title)}</h2>
  `;
  body.innerHTML = sheetData.body;

  document.body.classList.add("sheet-open");
  if (opening) {
    dialog.addEventListener("close", () => {
      document.body.classList.remove("sheet-open");
      restoreFocus(workoutSheetTrigger);
      workoutSheetTrigger = null;
    }, { once: true });
  }

  if (typeof dialog.showModal === "function") {
    if (!dialog.open) dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
  }

  dialog.querySelector(".bottom-sheet-close")?.focus({ preventScroll: true });
}

function closeWorkoutSheet() {
  const dialog = content.querySelector("#workout-sheet");
  if (!dialog) return;

  if (typeof dialog.close === "function" && dialog.open) dialog.close();
  else {
    dialog.removeAttribute("open");
    document.body.classList.remove("sheet-open");
    restoreFocus(workoutSheetTrigger);
    workoutSheetTrigger = null;
  }
}

function getWorkoutOptionsSheet() {
  return {
    eyebrow: "Gym Mode",
    title: "Workout seçenekleri",
    body: `
      <section class="sheet-section sheet-callout">
        <h3>Workout sırasında</h3>
        <p>Bu seçenekler programı veya kayıtlı setlerini değiştirmez.</p>
      </section>

      <section class="sheet-section">
        <h3>Hızlı rehberler</h3>
        <div class="sheet-action-list">
          <button type="button" data-action="open-workout-guide" data-guide-id="warmup">
            <span><strong>Isınma sistemi</strong><small>Genel + hareket spesifik hazırlık</small></span><b aria-hidden="true">›</b>
          </button>
          <button type="button" data-action="open-workout-guide" data-guide-id="safety">
            <span><strong>Güvenlik</strong><small>Teknik, RIR ve ağrı kuralları</small></span><b aria-hidden="true">›</b>
          </button>
          <button type="button" data-action="open-workout-guide" data-guide-id="recovery">
            <span><strong>Recovery & Deload</strong><small>Toparlanma ve hacim azaltma rehberi</small></span><b aria-hidden="true">›</b>
          </button>
        </div>
      </section>

      <section class="sheet-section">
        <h3>Workout</h3>
        <div class="sheet-action-list workout-option-actions">
          <button type="button" data-action="finish-workout">
            <span><strong>Workout'u bitir</strong><small>Tamamlanan setleri Geçmiş'e kaydet</small></span><b aria-hidden="true">✓</b>
          </button>
          <button class="destructive-sheet-action" type="button" data-action="request-discard-workout">
            <span><strong>Workout'u iptal et</strong><small>Bu aktif session'ı kaydetmeden kapat</small></span><b aria-hidden="true">×</b>
          </button>
        </div>
      </section>
    `,
  };
}

function requireActiveSession() {
  const session = DATA.sessions.getActiveSession();
  if (!session) throw new Error("Aktif workout bulunamadı.");
  return session;
}

function readNumericField(card, field) {
  const input = card.querySelector(`input[data-field="${field}"]`);
  if (!input || input.value === "") return null;
  const value = Number(input.value);
  return Number.isFinite(value) ? value : null;
}

function startRestTimer() {
  const timer = content.querySelector(".rest-timer-card");
  if (!timer) return;

  updateRestTimerDisplay(timer);
  restTimerInterval = window.setInterval(() => updateRestTimerDisplay(timer), 1000);
}

function updateRestTimerDisplay(timer) {
  if (!timer.isConnected) return stopRestTimer();

  const display = timer.querySelector("[data-rest-display]");
  const progress = timer.querySelector("[data-rest-progress]");
  const status = timer.querySelector("[data-rest-status]");
  const announcement = timer.querySelector("[data-rest-announcement]");
  if (!display) return;

  const remaining = Math.max(0, Math.ceil((Date.parse(timer.dataset.restEndsAt) - Date.now()) / 1000));
  const total = Math.max(1, Number(timer.dataset.restTotalSeconds) || remaining || 1);
  const percent = Math.min(100, Math.max(0, Math.round((remaining / total) * 100)));

  display.textContent = formatClock(remaining);
  if (progress) progress.style.width = `${percent}%`;
  if (status) status.textContent = remaining === 0 ? "Hazır" : "Dinlen";
  timer.classList.toggle("is-finished", remaining === 0);

  if (remaining === 0) {
    timer.setAttribute("aria-label", "Dinlenme süresi tamamlandı");
    if (announcement && !announcement.textContent) announcement.textContent = "Dinlenme süresi tamamlandı.";
    notifyRestComplete(timer);
    stopRestTimer();
  }
}

function notifyRestComplete(timer) {
  const key = `${timer.dataset.restSlotId ?? ""}:${timer.dataset.restSetNumber ?? ""}:${timer.dataset.restEndsAt ?? ""}`;
  if (notifiedRestTimers.has(key)) return;
  notifiedRestTimers.add(key);

  const endedAt = Date.parse(timer.dataset.restEndsAt);
  if (!Number.isFinite(endedAt) || Math.abs(Date.now() - endedAt) > 15000) return;
  if (!DATA.settings.get("restTimerVibration")) return;
  if (typeof navigator.vibrate !== "function") return;

  try {
    navigator.vibrate([120, 60, 120]);
  } catch {
    // Vibration API is optional; timer behavior must continue without it.
  }
}

function stopRestTimer() {
  if (restTimerInterval !== null) {
    window.clearInterval(restTimerInterval);
    restTimerInterval = null;
  }
}

async function syncWakeLock(enabled, { disabledBySetting = false } = {}) {
  if (!enabled) {
    await wakeLock.release();
    updateWakeStatus({ supported: wakeLock.supported, active: false, disabledBySetting });
    return;
  }

  if (document.visibilityState !== "visible") {
    updateWakeStatus({ supported: wakeLock.supported, active: false, disabledBySetting: false });
    return;
  }

  const result = await wakeLock.acquire();
  if (!document.body.classList.contains("gym-mode")) {
    await wakeLock.release();
    return;
  }
  updateWakeStatus({ ...result, disabledBySetting: false });
}

function updateWakeStatus({ supported, active, disabledBySetting = false }) {
  const label = content.querySelector("[data-wake-status]");
  if (!label) return;
  if (active) {
    label.textContent = "Gym Mode • ekran açık";
    label.classList.add("is-active");
    label.title = "";
  } else {
    label.textContent = disabledBySetting ? "Gym Mode • ekran kilidi normal" : "Gym Mode";
    label.classList.remove("is-active");
    if (disabledBySetting) label.title = "Ekranı açık tut ayarı kapalı.";
    else if (!supported) label.title = "Wake Lock bu tarayıcıda desteklenmiyor.";
    else label.title = "";
  }
}

function handleVisibilityChange() {
  const gymMode = document.body.classList.contains("gym-mode");
  const keepScreenAwake = DATA.settings.get("keepScreenAwake");
  if (document.visibilityState === "visible") {
    void syncWakeLock(gymMode && keepScreenAwake, { disabledBySetting: gymMode && !keepScreenAwake });
  } else {
    void wakeLock.release();
  }
}

function syncVisualViewport() {
  const viewport = window.visualViewport;
  if (!viewport) {
    document.documentElement.style.setProperty("--keyboard-inset", "0px");
    return;
  }

  const bottomInset = Math.max(0, window.innerHeight - (viewport.height + viewport.offsetTop));
  const keyboardLikely = document.body.classList.contains("keyboard-focus") && (bottomInset > 80 || viewport.height < window.innerHeight * 0.82);
  document.documentElement.style.setProperty("--keyboard-inset", `${Math.round(bottomInset)}px`);
  document.body.classList.toggle("keyboard-open", keyboardLikely);
}

function showInlineError(message) {
  content.querySelectorAll(".inline-error, .inline-notice").forEach((item) => item.remove());

  const error = document.createElement("div");
  error.className = "inline-error";
  error.setAttribute("role", "alert");
  error.textContent = message;
  content.prepend(error);
  error.scrollIntoView({ behavior: preferredScrollBehavior(), block: "nearest" });
}

function showInlineNotice(message) {
  content.querySelectorAll(".inline-error, .inline-notice").forEach((item) => item.remove());

  const notice = document.createElement("div");
  notice.className = "inline-notice";
  notice.setAttribute("role", "status");
  notice.textContent = message;
  content.prepend(notice);
  notice.scrollIntoView({ behavior: preferredScrollBehavior(), block: "nearest" });
}

function renderFatalState(error) {
  const message = error instanceof Error ? error.message : "Uygulama verisi okunamadı.";
  return `
    <section class="page">
      <header class="page-header"><p class="eyebrow">Workout Tracker</p><h1 class="page-title">Veri açılamadı</h1></header>
      <div class="empty-state">
        <h2>Yerel veri hatası</h2>
        <p>${escapeHtml(message)}</p>
        <button class="button button-secondary" type="button" data-action="reload-app">Tekrar dene</button>
      </div>
    </section>
  `;
}

function preferredScrollBehavior() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

function getFocusedElement() {
  return document.activeElement instanceof HTMLElement ? document.activeElement : null;
}

function restoreFocus(element) {
  if (element?.isConnected && typeof element.focus === "function") {
    element.focus({ preventScroll: true });
  }
}

function titleFor(route) {
  return { home: "Home", workout: "Workout", history: "History", progress: "Progress", program: "Program", settings: "Ayarlar" }[route] ?? "Home";
}

function formatInputNumber(value) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
}

function formatClock(seconds) {
  const safe = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
