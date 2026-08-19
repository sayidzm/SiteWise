# 03 — Current State Snapshot

## Snapshot

Bu agent paketi **FAZ 11 kod tabanını** esas alır.

### Tamamlanan ana kabiliyetler

- Program structured data
- Mobile app shell + hash router
- Bottom navigation
- Today's Workout
- Workout start/resume
- Active Workout
- KG/Reps/RIR draft autosave
- Complete Set
- Timestamp-based Rest Timer
- Real Previous
- Finish/discard lifecycle
- History + Workout Detail
- Progress
- Double progression evaluation
- Real PR derivation
- Program guide / technique / alternatives
- Gym Mode
- Wake Lock progressive enhancement
- Settings
- Backup / Export / Import
- Pre-import recovery snapshot
- PWA manifest + Service Worker app-shell cache
- Accessibility hardening
- Storage quota/recovery hardening
- Regression test suite
- SiteWise mobile-first premium UI redesign
- Active Workout numeric steppers, quick actions ve set overview
- Session-backed exercise notes, discomfort ve selected variation
- Accessible custom finish/discard confirmations
- Türkçe ay bazlı History gruplama

## Faz geçmişi

| Faz | Ana çıktı |
|---|---|
| 0 | Program domain/data modeli |
| 1 | App shell, router, mobile foundation |
| 2 | Persistent storage, session model, autosave |
| 3 | Today's Workout ve start/resume |
| 4 | Active Workout |
| 5 | History |
| 6 | Progression + PR + Progress |
| 7 | Program rehberi |
| 8 | Gym Mode / UX polish |
| 9 | Settings + temel backup/PWA |
| 10 | Release-candidate QA hardening |
| 11 | Backup/import/export integrity hardening |

## Henüz resmi olarak kapanmamış alanlar

### FAZ 12
PWA + Service Worker hardening.

Chromium'da Service Worker registration/controller ve cached app-shell ile offline reload doğrulandı. Update lifecycle, install/update prompt davranışı ve gerçek cihaz standalone PWA testi hâlâ formal QA gerektirir.

### FAZ 13
Gerçek cihaz/browser üzerinde:

- 360 px
- 390 px
- 393 px
- 412 px
- 430 px

viewport testleri; final edge-case ve data-integrity audit.

Chromium/Playwright ile 360, 390, 393, 412 ve 430 px genişliklerde yatay taşma kontrolü yapıldı. Active Workout temel set kayıt/rest/options akışı ve 390 px ana ekran renderları doğrulandı. Gerçek mobil cihaz, yazılım klavyesi ve standalone PWA testi henüz tamamlanmadı.

## Şu anki storage/app version bilgileri

```text
State schemaVersion: 1
Backup formatVersion: 1
Backup appVersion: 0.11.0
```

Service Worker cache adı:

```text
workout-tracker-sitewise-redesign-v1
```

Redesign sırasında aktif CSS app-shell'e eklendi. Cache adı asset değişikliğini yaymak için versionlandı; LocalStorage ve backup identifier'ları değiştirilmedi.
