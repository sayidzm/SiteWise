import { DATA } from "../services/app-data.js";
import { PWA } from "../services/pwa-service.js";

export function renderSettings() {
  const settings = DATA.settings.getAll();
  const state = DATA.sessions.getState();
  const pwa = PWA.getStatus();
  const sessions = Object.values(state.sessions);
  const completed = sessions.filter((session) => session.status === "completed").length;
  const inProgress = sessions.filter((session) => session.status === "in_progress").length;
  const storageBytes = new Blob([JSON.stringify(state)]).size;
  const importRecovery = DATA.portability.getPreImportRecoverySummary();

  return `
    <section class="page settings-page">
      <header class="page-header settings-header">
        <p class="eyebrow"><a href="#program">← Program</a></p>
        <h1 class="page-title">Ayarlar & Veri</h1>
        <p class="page-subtitle">Gym Mode tercihleri, yerel yedek ve offline kullanım.</p>
      </header>

      <section class="settings-section" aria-labelledby="gym-settings-title">
        <div class="section-header">
          <h2 class="section-title" id="gym-settings-title">Gym Mode</h2>
        </div>
        <div class="settings-list">
          ${renderToggle({
            key: "keepScreenAwake",
            title: "Ekranı açık tut",
            description: "Desteklenen tarayıcılarda aktif workout sırasında Wake Lock kullanır.",
            checked: settings.keepScreenAwake,
          })}
          ${renderToggle({
            key: "restTimerVibration",
            title: "Dinlenme bitince titreşim",
            description: "Cihaz destekliyorsa rest timer tamamlandığında kısa titreşim verir.",
            checked: settings.restTimerVibration,
          })}
          ${renderToggle({
            key: "confirmIncompleteFinish",
            title: "Eksik setlerde onay iste",
            description: "Tamamlanmamış setler varken workout'u bitirmeden önce doğrulama gösterir.",
            checked: settings.confirmIncompleteFinish,
          })}
        </div>
      </section>

      <section class="settings-section" aria-labelledby="offline-title">
        <div class="section-header">
          <h2 class="section-title" id="offline-title">Offline & PWA</h2>
        </div>
        <article class="card pwa-status-card">
          <div class="settings-row-copy">
            <strong>${offlineTitle(pwa)}</strong>
            <p>${offlineDescription(pwa)}</p>
          </div>
          <div class="meta-row">
            <span class="meta-chip">${pwa.serviceWorkerSupported ? "Service Worker destekli" : "Service Worker yok"}</span>
            <span class="meta-chip">${pwa.installed ? "Yüklü" : "Tarayıcıda"}</span>
          </div>
          ${pwa.installAvailable && !pwa.installed ? `
            <button class="button button-secondary" type="button" data-action="install-pwa">Uygulamayı yükle</button>
          ` : ""}
        </article>
      </section>

      <section class="settings-section" aria-labelledby="data-title">
        <div class="section-header">
          <h2 class="section-title" id="data-title">Verilerim</h2>
        </div>

        <article class="card data-summary-card">
          <div class="data-summary-grid">
            <div><span>Tamamlanan</span><strong>${completed}</strong></div>
            <div><span>Aktif</span><strong>${inProgress}</strong></div>
            <div><span>Yerel veri</span><strong>${formatBytes(storageBytes)}</strong></div>
          </div>
          <p class="settings-note">Workout geçmişi cihazında yerel olarak saklanır. Sunucu veya hesap sistemi kullanılmaz.</p>
        </article>

        <div class="settings-action-stack">
          <button class="settings-action-card" type="button" data-action="export-data">
            <span>
              <strong>Yedeği dışa aktar</strong>
              <small>Tüm workout geçmişini ve ayarları JSON dosyasına kaydet.</small>
            </span>
            <b aria-hidden="true">↓</b>
          </button>

          <button class="settings-action-card" type="button" data-action="choose-import">
            <span>
              <strong>Yedekten içe aktar</strong>
              <small>Geçerli Workout Tracker yedeğiyle cihazdaki veriyi değiştir.</small>
            </span>
            <b aria-hidden="true">↑</b>
          </button>
          <input class="visually-hidden" type="file" accept="application/json,.json" data-import-file tabindex="-1" aria-hidden="true" />

          ${importRecovery ? `
            <button class="settings-action-card recovery-action-card" type="button" data-action="restore-pre-import">
              <span>
                <strong>Son içe aktarmayı geri al</strong>
                <small>İçe aktarmadan hemen önceki yerel duruma dön. ${importRecovery.completedSessions} tamamlanan workout içeren güvenlik yedeği hazır.</small>
              </span>
              <b aria-hidden="true">↶</b>
            </button>
          ` : ""}
        </div>
      </section>

      <section class="settings-section danger-zone" aria-labelledby="danger-title">
        <div class="section-header">
          <h2 class="section-title" id="danger-title">Tehlikeli alan</h2>
        </div>
        <article class="card danger-card">
          <strong>Tüm yerel veriyi sıfırla</strong>
          <p>Workout geçmişi, aktif workout ve ayarlar bu cihazdan silinir. Bu işlem geri alınamaz.</p>
          <button class="button danger-button" type="button" data-action="reset-all-data">Tüm veriyi sil</button>
        </article>
      </section>
    </section>
  `;
}

function renderToggle({ key, title, description, checked }) {
  return `
    <label class="settings-toggle-row">
      <span class="settings-row-copy">
        <strong>${title}</strong>
        <small>${description}</small>
      </span>
      <span class="switch-control">
        <input type="checkbox" data-setting-key="${key}" ${checked ? "checked" : ""} />
        <span aria-hidden="true"></span>
      </span>
    </label>
  `;
}

function offlineTitle(status) {
  if (status.installed) return "Uygulama olarak çalışıyor";
  if (status.registered || status.controlled) return "Offline önbellek hazır";
  if (!status.serviceWorkerSupported) return "Tarayıcı offline PWA'yı desteklemiyor";
  if (!status.secureContext) return "PWA için localhost veya HTTPS gerekli";
  if (status.registrationError) return "Offline önbellek başlatılamadı";
  return "Offline önbellek hazırlanıyor";
}

function offlineDescription(status) {
  if (status.installed) return "Workout Tracker standalone görünümde açılıyor ve uygulama kabuğu offline kullanılabilir.";
  if (status.registered || status.controlled) return "HTML, CSS ve JavaScript uygulama dosyaları cihaz önbelleğine kaydedildi.";
  if (!status.serviceWorkerSupported) return "Workout kayıtların LocalStorage'da çalışmaya devam eder; yalnızca uygulama dosyalarının offline cache'i kullanılamaz.";
  if (!status.secureContext) return "Dosyayı doğrudan file:// ile açmak yerine yerel bir HTTP sunucusu veya HTTPS kullan.";
  if (status.registrationError) return "Workout kayıtların etkilenmedi. Sayfayı yenileyerek tekrar deneyebilirsin.";
  return "Service Worker kayıt işlemi tamamlandığında uygulama kabuğu offline kullanılabilir hale gelir.";
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
