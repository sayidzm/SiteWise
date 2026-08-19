# Claude Project Instructions — Workout Tracker

Bu repo için ana agent sözleşmesi `AGENTS.md` dosyasıdır. **Önce onu ve orada listelenen belgeleri oku.**

Kod üretmeden önce özellikle şunları unutma:

- Proje Vanilla HTML/CSS/JavaScript'tir; framework'e migrate etme.
- `sources/workout-program-source.md` workout reçetesinin tek doğru kaynağıdır.
- `program-data.js` reçeteyi, `program-content.js` rehber içeriğini taşır; user data ile karıştırma.
- Active Workout mobile-first kalmalı.
- Fake history/PR/previous oluşturma.
- Storage ve import invariant'larını bozma.
- Büyük rewrite yerine küçük, test edilebilir patch yap.
- Tam regresyon için `node tests/run-all.mjs` çalıştır.

Detaylı başlangıç promptu: `prompts/MAIN-AGENT-PROMPT.md`.
