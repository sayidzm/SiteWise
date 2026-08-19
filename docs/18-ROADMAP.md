# 18 — Roadmap

## Şu an

FAZ 11 tamamlanmış snapshot.

## FAZ 12 — PWA + Service Worker / Offline Validation

Hedef:

- installability,
- real offline reopen,
- offline workout logging,
- offline History/Progress,
- update lifecycle,
- cache versioning,
- old cache cleanup,
- SW failure fallback,
- LocalStorage data isolation.

Bu faz mevcut PWA'yı sıfırdan yazmak değildir; var olan implementasyonu audit/harden etmektir.

## FAZ 13 — Final Mobile QA + Edge Cases + Data Integrity

Viewportlar:

```text
360×800
390×844
393×873
412×915
430×932
```

Ek:

- 320 minimum,
- keyboard,
- safe area,
- landscape graceful behavior,
- long labels,
- rapid interactions,
- storage corruption/quota,
- clock changes,
- session integrity,
- import integrity.

## Final polish / release

FAZ 12–13 sonrası önerilen release işleri:

- bugfix-only pass,
- dead code/import cleanup,
- version naming,
- Service Worker cache version align,
- final README/QA,
- changelog,
- v1.0.0 candidate,
- real phone test,
- v1.0.0 final.

## Scope discipline

Roadmap sırasında "madem buradayız" feature creep yapma. Sosyal, nutrition, AI coach, cloud sync gibi büyük alanlar ayrı product decision olmalıdır.
