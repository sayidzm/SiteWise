# 12 — PWA ve Offline Architecture

## Mevcut durum

PWA altyapısı implement edilmiştir; formal FAZ 12 offline-validation/hardening halen ayrı iş olarak görülebilir.

## Manifest

`manifest.webmanifest`:

- name: Workout Tracker
- display: standalone
- orientation: portrait-primary
- start_url: `./#home`
- scope: `./`
- 192 ve 512 PNG icons

## Registration

`PWAService.register()` yalnız:

- `https:`
- localhost / 127.0.0.1 / ::1 üzerinde `http:`

koşullarında register etmeye çalışır.

`file://` üzerinde Service Worker beklenmez; core app yine çalışabilir.

## Service Worker

Mevcut cache name:

```text
workout-tracker-phase10-v1
```

APP_SHELL root HTML/CSS/JS/manifest/icons içerir.

### Install

`cache.addAll(APP_SHELL)` ve `skipWaiting()`.

### Activate

Mevcut cache dışındaki cache key'leri siler ve `clients.claim()`.

### Fetch

- non-GET: dokunma.
- cross-origin: dokunma.
- navigation: network-first, failure → cached `index.html`.
- static asset: stale-while-revalidate.
- cache/network ikisi de yoksa 503 Offline response.

## User data nerede?

Service Worker cache user workout data taşımaz.

```text
App files → Cache Storage
Workout data → LocalStorage
```

Bu ayrımı bozma.

## Offline validation senaryoları

Resmi hardening için:

1. Online first load → SW install.
2. Offline reload → app shell açılır.
3. Offline workout start/log/complete.
4. Offline History görüntüleme.
5. Offline Progress görüntüleme.
6. Browser close/open offline.
7. Cache version update → user LocalStorage korunur.
8. Failed SW registration → core app çalışır.
9. Old cache cleanup.
10. Update sırasında stale/new asset mismatch testleri.

## SW değişiklik protokolü

Bir runtime asset eklenirse/rename edilirse:

- APP_SHELL güncelle,
- cache version strategy kontrol et,
- `phase9-pwa-assets` ve `phase10-service-worker` testlerini güncelle,
- offline navigation test et.
