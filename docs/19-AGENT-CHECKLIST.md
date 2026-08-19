# 19 — Agent Checklist

## Göreve başlamadan

- [ ] `AGENTS.md` okudum.
- [ ] Source-of-truth sırasını biliyorum.
- [ ] İlgili gerçek kod dosyalarını okudum.
- [ ] İlgili test dosyalarını okudum.
- [ ] Program reçetesine dokunup dokunmadığımı belirledim.
- [ ] Storage/schema riski olup olmadığını belirledim.

## Kodlamadan önce

- [ ] Sorunun root cause'unu biliyorum.
- [ ] Minimum patch sınırını belirledim.
- [ ] Korunacak invariant'ları listeledim.
- [ ] Fake data eklemeyeceğim.
- [ ] Mobile-first davranışı koruyacağım.

## Kodlama sırasında

- [ ] Framework/dependency eklemedim.
- [ ] View'den raw storage mutate etmedim.
- [ ] Persistent identity'leri bozmadım.
- [ ] User history'yi silmedim.
- [ ] Error/recovery yolunu düşündüm.
- [ ] Unsupported Web API fallback var.

## Test

- [ ] Regression test ekledim/güncelledim.
- [ ] Targeted test geçti.
- [ ] `node tests/run-all.mjs` geçti.
- [ ] UI değiştiyse mobile widths kontrol edildi.
- [ ] Browser testi çalışmadıysa bunu açıkça belirttim.

## Teslim

- [ ] Değişen dosyaları söyledim.
- [ ] Behavior değişikliğini özetledim.
- [ ] Test sonucunu söyledim.
- [ ] Bilinen sınırlamayı gizlemedim.
- [ ] İlgili dokümantasyonu güncelledim.
