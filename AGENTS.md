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

---

# AI Agent Context Pack

Bu paket, Workout Tracker kod tabanını başka AI coding agentlara öğretmek/delege etmek için hazırlanmıştır.

## En hızlı kullanım

Yeni agenta proje kodunu ve bu klasörü birlikte ver. Ardından `prompts/MAIN-AGENT-PROMPT.md` içeriğini başlangıç promptu olarak gönder. Agent'ın ilk dosyası bu `AGENTS.md`'dir.

## Paket yapısı

```text
AGENTS.md                 Universal agent sözleşmesi (tek giriş noktası)

docs/                     Derin teknik/domain dokümantasyon
memory-bank/              Cline/Cursor benzeri memory-bank formatı
prompts/                  Copy-paste agent promptları
sources/                  Orijinal source-of-truth ve güncel README/QA
```

Eski `CLAUDE.md`, `CODEX.md`, `GEMINI.md`, `AI_CONTEXT_README.md` ve `AI_HANDOFF_MANIFEST.md` dosyaları içerikleri buraya birleştirilerek kaldırılmıştır.

## Ana giriş noktaları

- `AGENTS.md` — universal agent operating manual
- `prompts/MAIN-AGENT-PROMPT.md` — yeni agente verilecek ana prompt
- `sources/workout-program-source.md` — workout program source of truth
- `sources/original-product-prompt.md` — product/mobile UX source

## Handoff kullanımı

1. Bu proje klasörünü agente aç.
2. `AGENTS.md` dosyasını okumasını zorunlu tut.
3. `prompts/MAIN-AGENT-PROMPT.md` içeriğini başlangıç promptu olarak gönder.
4. Promptun en altındaki `[BURAYA YENİ GÖREVİ YAZ]` alanını yeni işle değiştir.

## Önemli

Bu paket kodun yerine geçmez. Agent göreve başlamadan ilgili gerçek source ve test dosyalarını da okumalıdır.
