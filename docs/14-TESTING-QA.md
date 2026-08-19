# 14 — Testing ve QA

## Ana komut

Proje kökünde:

```bash
node tests/run-all.mjs
```

## Mevcut test seti

```text
phase2-storage.test.mjs
phase3-today-workout.test.mjs
phase4-active-workout.test.mjs
phase5-history.test.mjs
phase6-progress-view.test.mjs
phase6-progress.test.mjs
phase7-program-content.test.mjs
phase8-gym-mode.test.mjs
phase9-pwa-assets.test.mjs
phase9-settings-backup.test.mjs
phase10-storage-resilience.test.mjs
phase10-service-worker.test.mjs
phase10-render-contract.test.mjs
phase10-release-audit.test.mjs
phase11-backup-integrity.test.mjs
```

## Test politikası

Feature patch:

1. ilgili hedef test,
2. mümkünse yeni regression test,
3. en sonunda `run-all`.

Bug fix:

1. önce bug'ı fail eden test oluştur,
2. minimum patch,
3. test green,
4. full regression.

## Browser testi gerçeği

Önceki çalışma ortamında Chromium navigation `ERR_BLOCKED_BY_ADMINISTRATOR` ile engellendi. Bu nedenle bazı mobile viewport kontrolleri static/render-contract düzeyinde yapılmıştır.

Agent:

- browser çalıştırmadıysa "browser test passed" yazmamalı,
- screenshot görmediyse visual pixel-level QA tamamlandı dememeli.

## Final viewport matrix

```text
360×800
390×844
393×873
412×915
430×932
```

Ek:

```text
320 min
375 width
```

Her viewportta:

- horizontal overflow,
- bottom nav,
- sticky Complete Set,
- keyboard behavior,
- sheet overflow,
- text clipping,
- Previous long content,
- rest timer,
- safe-area

kontrol edilir.

## Edge-case matrix

- rapid double Complete Set,
- reload during rest,
- close browser with active workout,
- partial finish,
- invalid/malformed LocalStorage,
- quota exceeded,
- bad backup JSON,
- future schema backup,
- duplicate IDs,
- midnight-crossing workout,
- system clock rollback,
- Wake Lock unsupported/denied,
- Service Worker unavailable,
- offline logging.

## Data parity

Workout prescription/content değiştiyse kaynak programla 30/30 slot parity testi zorunludur.
