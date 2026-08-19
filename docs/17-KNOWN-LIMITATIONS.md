# 17 — Known Limitations

## 1. Gerçek device/browser visual QA formal olarak tamamlanmış değil

Static contract ve mock testler var; ancak önceki tool ortamında Chromium navigation yönetici politikasıyla engellendi. Final responsive release için gerçek browser/telefon testi gerekir.

## 2. PWA formal FAZ 12 hardening açık

Manifest/SW implementasyonu var. Aşağıdaki lifecycle'lar gerçek environment'ta ayrıca doğrulanmalı:

- first install,
- offline reopen,
- update,
- old cache cleanup,
- stale/new asset consistency.

## 3. LocalStorage kapasitesi sınırlı

JSON backup ile recovery var; yine de çok uzun kullanımda browser quota etkisi mümkündür. Şu an IndexedDB kullanılmıyor.

## 4. Cloud sync yok

Veri cihaz-local. Cihaz/tarayıcı data temizlenirse external JSON backup yoksa kayıp olabilir.

## 5. Authentication yok

Bilinçli scope kararı.

## 6. PR sınırlamaları

Assisted/bodyweight-sensitive hareketlerde load PR bilinçli olarak kapalı olabilir. Estimated 1RM yok.

## 7. Teknik kalite otomatik ölçülmez

Progression motoru technique/momentum/joint pain'i otomatik doğrulayamaz. Manual checks kalır.

## 8. Exercise variant identity

`selectedVariation` string olarak session'da tutulur. Full canonical variant taxonomy her slot için ayrı normalized entity değildir.

## 9. Warm-up tracking

Domain guide ve schema warmup type'ı desteklese de ana Active Workout akışı working set odaklıdır; warm-up logging ayrı first-class UX değildir.

## 10. Desktop secondary

Desktop kullanılabilir olabilir fakat ürün kabul kriteri mobile-first'tır.
