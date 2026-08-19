# Feature Agent Prompt

```text
Workout Tracker'a şu özelliği ekle:

FEATURE:
[buraya]

Önce AGENTS.md, source-of-truth ve görevle ilgili architecture/domain docs dosyalarını oku.

Feature'ı mevcut mimariye entegre et; paralel ikinci state sistemi kurma.

Kontrol et:
- Feature mobile-first mi?
- Offline çalışıyor mu?
- Fake data üretiyor mu?
- Persistent state gerekiyor mu?
- Schema migration gerekiyor mu?
- History/Progress/Previous etkileniyor mu?
- Active Workout friction artıyor mu?
- PWA app-shell asset listesi etkileniyor mu?

Önce implementation planı ve etkilenen dosyaları yaz.
Sonra minimum fakat production-quality implementation yap.
Test ekle ve full regression çalıştır.
```
