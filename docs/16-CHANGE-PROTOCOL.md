# 16 — Change Protocol

Bu dosya bir agentın projede değişiklik yaparken izlemesi gereken operasyonel akıştır.

## A. Görevi sınıflandır

- UI polish
- Bugfix
- Domain logic
- Storage/schema
- Backup/import
- PWA/offline
- Program data/content
- New feature

## B. Risk seviyesini belirle

### Low
Pure styling/copy, persistent data yok.

### Medium
View/service davranışı, schema değişmiyor.

### High
Storage schema, migration, import, session lifecycle, program prescription, progression logic, Service Worker cache/update.

High risk tasklerde ilgili dokümanları eksiksiz oku.

## C. Önce mevcut implementasyonu bul

Tahmin etme. `grep`, testler ve ilgili service/view dosyasını oku.

## D. Invariant listesi çıkar

Örneğin Complete Set değişikliği:

- completed set duplicate olamaz,
- rest timestamp zorunlu,
- previous fake olamaz,
- autosave bozulmamalı,
- active session korunmalı.

## E. Minimum patch

Tüm ekranı veya servisi baştan yazmak yerine problemi doğrudan çözen en küçük patch.

## F. Test

- regression test ekle,
- targeted test çalıştır,
- `node tests/run-all.mjs`.

## G. Manual check

UI ise kritik mobile widths.
PWA ise real offline.
Storage ise reload/recovery.

## H. Dokümantasyon

Behavior/contracts değiştiyse ilgili agent docs + README güncellenmeli.

## Program değişikliği özel protokolü

Kullanıcı açıkça workout programını değiştirmediyse agent programı optimize etmez.

Program source değiştirildiyse:

1. `sources/workout-program-source.md` yeni source olmalı.
2. `program-data.js` güncelle.
3. `program-content.js` güncelle.
4. parity tests güncelle.
5. historical snapshot davranışını düşün.

## Schema değişikliği özel protokolü

1. Yeni schema version.
2. Migration.
3. Validation.
4. Old fixture.
5. Import compatibility.
6. Backup recovery.
7. Full regression.

## Service Worker değişikliği özel protokolü

1. APP_SHELL audit.
2. Cache version/update strategy.
3. install/activate/fetch tests.
4. offline manual validation.
5. User LocalStorage isolation check.
