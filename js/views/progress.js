import { DATA } from "../services/app-data.js";

export function renderProgress(route = "progress") {
  const encodedKey = route.startsWith("progress/") ? route.slice("progress/".length) : null;
  if (encodedKey) return renderExerciseProgress(decodeURIComponent(encodedKey));
  return renderProgressOverview();
}

function renderProgressOverview() {
  const tracked = DATA.progress.listTrackedExercises();
  const phase = DATA.progress.getTrackingPhase();

  return `
    <section class="page">
      <header class="page-header">
        <p class="eyebrow">Progress</p>
        <h1 class="page-title">İlerleme</h1>
        <p class="page-subtitle">Yalnızca tamamlanmış gerçek workout kayıtlarından hesaplanır.</p>
      </header>

      ${tracked.length === 0 ? renderEmptyProgress() : `
        ${renderTrackingPhase(phase)}

        <section class="section" aria-labelledby="tracked-exercises-title">
          <div class="section-header">
            <h2 id="tracked-exercises-title" class="section-title">Takip edilen egzersizler</h2>
            <span class="section-caption">${tracked.length}</span>
          </div>
          <div class="progress-exercise-list">
            ${tracked.map(renderProgressExerciseItem).join("")}
          </div>
        </section>
      `}
    </section>
  `;
}

function renderExerciseProgress(key) {
  const detail = DATA.progress.getExercise(key);
  if (!detail) {
    return `
      <section class="page">
        <header class="detail-header"><a class="back-link" href="#progress">← İlerleme</a></header>
        <div class="empty-state">
          <h2>Egzersiz verisi bulunamadı</h2>
          <p>Bu egzersiz için tamamlanmış gerçek performans kaydı yok.</p>
          <a class="button button-secondary" href="#progress">İlerlemeye dön</a>
        </div>
      </section>
    `;
  }

  const p = detail.prescription;
  const metric = detail.records.loadRecordSupported ? "weight" : "reps";

  return `
    <section class="page progress-detail-page">
      <header class="detail-header">
        <a class="back-link" href="#progress">← İlerleme</a>
        <p class="eyebrow">${escapeHtml(detail.workoutName)}</p>
        <h1 class="page-title">${escapeHtml(detail.exerciseName)}</h1>
        <p class="page-subtitle">${p.workingSets} × ${p.reps.min}–${p.reps.max}${p.reps.perSide ? " / bacak" : ""} • RIR ${formatRange(p.rir.min, p.rir.max)}</p>
      </header>

      ${renderProgressionCard(detail.progression)}

      <section class="section" aria-labelledby="records-title">
        <div class="section-header"><h2 id="records-title" class="section-title">Kayıtlar / PR</h2></div>
        ${renderRecordGrid(detail.records)}
      </section>

      <section class="section" aria-labelledby="trend-title">
        <div class="section-header">
          <h2 id="trend-title" class="section-title">Son performanslar</h2>
          <span class="section-caption">${detail.performances.length} seans</span>
        </div>
        ${renderTrend(detail.performances, metric)}
      </section>

      <section class="section" aria-labelledby="performance-history-title">
        <div class="section-header"><h2 id="performance-history-title" class="section-title">Performans geçmişi</h2></div>
        <div class="performance-history-list">
          ${[...detail.performances].reverse().map((performance) => renderPerformanceItem(performance, p.reps.perSide)).join("")}
        </div>
      </section>
    </section>
  `;
}

function renderTrackingPhase(phase) {
  return `
    <article class="card tracking-phase-card">
      <div>
        <p class="eyebrow">8–12 hafta takibi</p>
        <h2>${escapeHtml(phase.label)}</h2>
      </div>
      <span class="tracking-week">${phase.week > 0 ? `Hafta ${phase.week}` : "—"}</span>
      <p>${escapeHtml(phase.message)}</p>
    </article>
  `;
}

function renderProgressExerciseItem(item) {
  const load = item.records.heaviestLoad;
  const rep = item.records.repRecord;
  const recordText = item.records.loadRecordSupported && load
    ? `${formatWeight(load.weight)} × ${load.reps}`
    : rep
      ? `${rep.reps} tekrar`
      : "—";

  return `
    <a class="progress-exercise-item" href="#progress/${encodeURIComponent(item.key)}">
      <div class="progress-exercise-main">
        <p class="eyebrow">${escapeHtml(item.workoutName)}</p>
        <h2>${escapeHtml(item.exerciseName)}</h2>
        <p>${item.sessionCount} seans • ${item.completedSetCount} set</p>
      </div>
      <div class="progress-exercise-side">
        <span class="progress-status status-${escapeHtml(item.progression.status)}">${escapeHtml(shortStatus(item.progression.status))}</span>
        <strong>${escapeHtml(recordText)}</strong>
        <span class="chevron">›</span>
      </div>
    </a>
  `;
}

function renderProgressionCard(progression) {
  const checks = progression.checks;
  return `
    <article class="progression-card status-${escapeHtml(progression.status)}">
      <div class="progression-heading">
        <div>
          <p class="eyebrow">Double progression</p>
          <h2>${escapeHtml(progression.title)}</h2>
        </div>
        <span class="progress-status status-${escapeHtml(progression.status)}">${escapeHtml(shortStatus(progression.status))}</span>
      </div>
      <p class="progression-message">${escapeHtml(progression.message)}</p>

      ${progression.status !== "no-data" ? `
        <div class="progression-checks" aria-label="Progresyon kontrolleri">
          ${renderCheck("Planlanan setler tamamlandı", checks.allPlannedSetsCompleted)}
          ${renderCheck("Tüm setler üst tekrar sınırında", checks.allAtUpperRepLimit)}
          ${renderCheck("Hedef RIR korundu", checks.targetRirMaintained)}
          ${renderCheck("Kayıtlı rahatsızlık notu yok", checks.noRecordedPainOrDiscomfort)}
          ${renderManualCheck("Teknik aynı kalitede")}
          ${renderManualCheck("Savurma / momentum yok")}
          ${renderManualCheck("Eklem ağrısı yok")}
        </div>
      ` : ""}

      ${progression.candidateForLoadChange ? `
        <div class="manual-gate-note">
          Uygulama otomatik kilo değiştirmez. Son üç manuel koşulu da yalnızca sen doğrulayabilirsin.
        </div>
      ` : ""}
    </article>
  `;
}

function renderRecordGrid(records) {
  const loadCard = records.loadRecordSupported
    ? renderRecordCard("En yüksek KG", records.heaviestLoad ? formatWeight(records.heaviestLoad.weight) : "—", records.heaviestLoad)
    : `
      <article class="card record-card">
        <span>KG rekoru</span>
        <strong>—</strong>
        <p>Yardım/bodyweight içeren bu hareket için yüksek KG otomatik olarak daha iyi performans anlamına gelmeyebilir.</p>
      </article>
    `;

  return `
    <div class="record-grid">
      ${loadCard}
      ${renderRecordCard("Tek set tekrar", records.repRecord ? `${records.repRecord.reps}` : "—", records.repRecord)}
      ${records.loadRecordSupported
        ? renderRecordCard("En yüksek set hacmi", records.bestSetVolume ? `${trimNumber(records.bestSetVolume.value)} kg·rep` : "—", records.bestSetVolume)
        : ""}
    </div>
    <p class="record-disclaimer">Bunlar gerçek kayıtlardan türetilen performans rekorlarıdır; 1RM tahmini yapılmaz.</p>
  `;
}

function renderRecordCard(label, value, record) {
  return `
    <article class="card record-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <p>${record ? `${escapeHtml(formatShortDate(record.completedAt))} • ${escapeHtml(formatSet(record))}` : "Henüz veri yok"}</p>
    </article>
  `;
}

function renderTrend(performances, metric) {
  const recent = performances.slice(-8);
  const values = recent.map((item) => metric === "weight" ? item.bestWeight : item.maxReps).filter(Number.isFinite);
  const max = values.length ? Math.max(...values) : 0;

  if (max <= 0) {
    return `<div class="empty-state compact-empty"><h2>Trend için veri yok</h2><p>Yeterli sayısal performans kaydı oluştuğunda burada görünecek.</p></div>`;
  }

  return `
    <div class="trend-card" aria-label="Son ${recent.length} performansın ${metric === "weight" ? "en yüksek KG" : "tekrar"} trendi">
      <div class="trend-bars">
        ${recent.map((item) => {
          const value = metric === "weight" ? item.bestWeight : item.maxReps;
          const height = Number.isFinite(value) ? Math.max(8, Math.round((value / max) * 100)) : 0;
          const label = metric === "weight" ? formatWeight(value) : `${value} tekrar`;
          return `
            <div class="trend-point" title="${escapeHtml(label)}">
              <span class="trend-value">${escapeHtml(metric === "weight" ? trimNumber(value) : String(value))}</span>
              <div class="trend-bar-wrap"><span class="trend-bar" style="height:${height}%"></span></div>
              <span class="trend-date">${escapeHtml(formatTinyDate(item.completedAt))}</span>
            </div>
          `;
        }).join("")}
      </div>
      <p class="trend-caption">${metric === "weight" ? "Her seanstaki en yüksek kayıtlı çalışma ağırlığı." : "Bu harekette yük yönü belirsiz olduğu için tekrar trendi gösteriliyor."}</p>
    </div>
  `;
}

function renderPerformanceItem(performance, perSide) {
  return `
    <a class="performance-item" href="#history/${encodeURIComponent(performance.sessionId)}">
      <div class="performance-item-heading">
        <div>
          <strong>${escapeHtml(formatFullDate(performance.completedAt))}</strong>
          <span>${performance.completedSetCount}/${performance.plannedSetCount} set</span>
        </div>
        <span class="chevron">›</span>
      </div>
      <div class="performance-set-list">
        ${performance.sets.map((set) => `<span>Set ${set.setNumber}: ${escapeHtml(formatSet(set, perSide))}</span>`).join("")}
      </div>
      ${performance.painOrDiscomfort ? `<p class="performance-warning">Rahatsızlık: ${escapeHtml(performance.painOrDiscomfort)}</p>` : ""}
    </a>
  `;
}

function renderCheck(label, passed) {
  return `<div class="progression-check"><span class="check-icon ${passed ? "is-pass" : "is-fail"}">${passed ? "✓" : "–"}</span><span>${escapeHtml(label)}</span></div>`;
}

function renderManualCheck(label) {
  return `<div class="progression-check"><span class="check-icon is-manual">?</span><span>${escapeHtml(label)} <em>manuel</em></span></div>`;
}

function renderEmptyProgress() {
  return `
    <div class="empty-state">
      <h2>Henüz veri yok</h2>
      <p>İlk workout tamamlandıktan sonra gerçek performans, PR ve double progression durumu burada oluşacak.</p>
    </div>
  `;
}

function shortStatus(status) {
  return {
    "no-data": "Veri yok",
    "pain-review": "Dikkat",
    partial: "Eksik",
    "technique-phase": "Teknik",
    hold: "Koru",
    candidate: "Aday",
    "build-reps": "Tekrar",
    review: "Kontrol",
  }[status] ?? "Takip";
}

function formatSet(set, perSide = false) {
  return `${formatWeight(set.weight)} × ${Number.isInteger(set.reps) ? set.reps : "—"}${perSide ? "/bacak" : ""} • RIR ${Number.isInteger(set.rir) ? set.rir : "—"}`;
}

function formatWeight(value) {
  return Number.isFinite(value) ? `${trimNumber(value)} kg` : "— kg";
}

function trimNumber(value) {
  if (!Number.isFinite(value)) return "—";
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
}

function formatRange(min, max) {
  return min === max ? String(min) : `${min}–${max}`;
}

function formatShortDate(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function formatFullDate(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

function formatTinyDate(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit" }).format(date);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
