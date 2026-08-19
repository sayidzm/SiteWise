# Workout Tracker — AI Agent Operating Manual

Bu dosya, projede çalışan **her AI coding agent için ilk okunması gereken kısa sözleşmedir**.

## Başlamadan önce

Aşağıdaki dosyaları sırayla oku:

1. `docs/00-START-HERE.md`
2. `docs/01-SOURCE-OF-TRUTH.md`
3. `docs/02-PRODUCT-VISION.md`
4. `docs/03-CURRENT-STATE.md`
5. `docs/04-ARCHITECTURE.md`
6. `docs/06-DATA-MODEL.md`
7. `docs/07-STORAGE-AND-INTEGRITY.md`
8. `docs/08-WORKOUT-DOMAIN-RULES.md`
9. `docs/11-MOBILE-UI-UX.md`
10. `docs/14-TESTING-QA.md`
11. `docs/15-CODING-STANDARDS.md`
12. `docs/16-CHANGE-PROTOCOL.md`

Ana workout kaynağı: `sources/workout-program-source.md`.
Ana ürün gereksinimi: `sources/original-product-prompt.md`.

## Değiştirilemez temel kurallar

- Framework ekleme: **yasak**. React/Vue/Angular/Next.js yok.
- Backend/auth/Firebase/Supabase ekleme: kullanıcı açıkça istemedikçe **yasak**.
- Ana platform: **telefon**. 390 px merkez hedef; 360–430 px kritik aralık.
- Active Workout ürünün en önemli ekranıdır.
- Fake `Previous`, `History`, `Progress`, `PR`, `Last Workout` verisi üretme.
- Workout programındaki set/tekrar/RIR/rest/alternatif/teknik kurallarını kafana göre değiştirme.
- Program definition ile user workout data birbirinden ayrı kalmalı.
- Bir buton görünüyorsa çalışmalı; placeholder action/TODO bırakma.
- Kullanıcının kayıtlı verisini sessizce silme veya yeniden biçimlendirme.
- Import/storage değişikliklerinde schema validation ve recovery mekanizmasını koru.
- Progressive overload kullanıcı adına otomatik kilo değiştirmez.
- Technique > Weight.
- Warm-up setleri working volume sayılmaz.

## Çalışma biçimi

1. İstenen görevi mevcut mimariye göre analiz et.
2. İlgili dosyaları oku; tahminle kod yazma.
3. En küçük güvenli değişikliği yap.
4. Var olan mimariyi yeniden yazma; gerekmedikçe yeni abstraction ekleme.
5. İlgili testleri ekle/güncelle.
6. `node tests/run-all.mjs` çalıştır.
7. Gerçek browser/device testi çalışmadıysa geçmiş gibi raporlama.
8. Değişiklik program reçetesine dokunuyorsa kaynak `.md` ile parity kontrolü yap.
9. Sonuçta değişen dosyaları, davranışı ve test sonucunu net raporla.

## Öncelik sırası

```text
Reliability > Features
Usability > Decoration
Mobile UX > Desktop UX
Real Data > Placeholder Data
Technique > Weight
Working Features > Visual Mockups
```

Bu sözleşme diğer özet belgelerle çelişirse `docs/01-SOURCE-OF-TRUTH.md` içindeki öncelik sırası uygulanır.
