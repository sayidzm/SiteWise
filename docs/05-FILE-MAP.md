# 05 — File Map

## Root

| Dosya | Görev |
|---|---|
| `index.html` | App root, viewport, PWA metadata |
| `manifest.webmanifest` | PWA manifest |
| `sw.js` | App-shell cache ve offline fetch stratejisi |
| `README.md` | Detaylı insan dokümantasyonu |
| `QA_REPORT.md` | QA durumu ve sınırlamalar |

## CSS

| Dosya | Görev |
|---|---|
| `css/tokens.css` | spacing, typography, radius vb. design tokens |
| `css/base.css` | reset/base element davranışı |
| `css/layout.css` | app shell, responsive layout |
| `css/components.css` | kart, button, workout, sheet gibi component stilleri |

## Core JS

| Dosya | Görev |
|---|---|
| `js/app.js` | Ana UI controller ve event delegation |
| `js/router.js` | Hash router |
| `js/components/bottom-nav.js` | Mobile bottom nav render |
| `js/utils/dates.js` | Day mapping / scheduled workout / tarih formatı |

## Data

| Dosya | Görev |
|---|---|
| `js/data/program-data.js` | 4 workout'un canonical prescription verisi |
| `js/data/program-content.js` | 30 exercise slot için teknik/alternatif ve rehber metinleri |

## Models

| Dosya | Görev |
|---|---|
| `js/models/workout-session.js` | Session/exercise/set başlangıç snapshot'ı |

## Storage

| Dosya | Görev |
|---|---|
| `js/storage/schema.js` | State/session/set validation ve storage key'leri |
| `js/storage/migrations.js` | Schema migration pipeline |
| `js/storage/storage.js` | LocalStorage primary/backup/pre-import, recovery, quota handling |
| `js/storage/index.js` | Data layer composition root |

## Services

| Dosya | Görev |
|---|---|
| `services/app-data.js` | Singleton data layer (`DATA`) |
| `session-repository.js` | Session CRUD + lifecycle |
| `workout-session-service.js` | Start, draft, complete set, rest, notes, complete/discard |
| `previous-performance-service.js` | Önceki gerçek performansı bulur |
| `history-service.js` | Completed session read model |
| `progression-service.js` | Double progression değerlendirmesi |
| `pr-service.js` | Gerçek setlerden PR türetir |
| `progress-service.js` | Progress overview/detail read model |
| `settings-service.js` | Boolean settings |
| `data-portability-service.js` | Export/import/preflight/recovery |
| `wake-lock-service.js` | Wake Lock progressive enhancement |
| `pwa-service.js` | SW registration + install prompt state |

## Views

| Dosya | Görev |
|---|---|
| `views/home.js` | Today's Workout / active workout hero |
| `views/workout.js` | Scheduled + Active Workout + completion summary |
| `views/history.js` | History list/detail |
| `views/progress.js` | Progress overview/exercise detail |
| `views/program.js` | Program workout detail + guide sheets |
| `views/settings.js` | Settings/data/PWA UI |

## Tests

`tests/run-all.mjs` bütün faz testlerini zincirler. Feature değişikliğinde yalnız ilgili testi çalıştırmak yeterli değildir; finalde full regression çalıştır.
