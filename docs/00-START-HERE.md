# 00 — Start Here

## Bu paket ne işe yarar?

Bu klasör, Workout Tracker projesini başka bir AI coding agentına devretmek için hazırlanmış **self-contained handoff / memory bank paketidir**. Amaç, yeni agentın kod tabanını yanlış varsayımlarla yeniden tasarlamadan mevcut ürün kararlarını, domain kurallarını, veri sözleşmelerini ve test disiplinini öğrenmesidir.

## Projenin tek cümlelik tanımı

**Workout Tracker**, spor salonunda telefondan tek elle hızlı set kaydı için tasarlanmış; HTML5, CSS3 ve Vanilla JavaScript kullanan; LocalStorage tabanlı, PWA destekli, offline-first bir Upper/Lower workout takip uygulamasıdır.

## Agent ilk olarak ne yapmalı?

1. `AGENTS.md` oku.
2. `docs/01-SOURCE-OF-TRUTH.md` ile hangi bilginin hangi sırada otorite olduğunu öğren.
3. `sources/workout-program-source.md` içindeki programı oku.
4. `sources/original-product-prompt.md` içindeki ürün/UI gereksinimlerini oku.
5. `docs/03-CURRENT-STATE.md` ile şu anda neyin gerçekten implement edildiğini öğren.
6. Göreve göre ilgili domain dokümanını oku.
7. Kod deposunda ilgili gerçek dosyaları aç; sadece bu dokümanlara güvenerek patch yazma.
8. Önce plan, sonra minimum patch, sonra test.

## Repo konumu varsayımı

Bu paket, proje köküne `ai-agent-pack/` gibi eklenebilir veya repo yanında tutulabilir. Belgelerde geçen proje yolları, Workout Tracker proje köküne göredir:

```text
index.html
css/
js/
assets/
tests/
manifest.webmanifest
sw.js
```

## Agent için hızlı görev yönlendirmesi

| Görev | Önce oku |
|---|---|
| Active Workout UI | `09-ACTIVE-WORKOUT.md`, `11-MOBILE-UI-UX.md` |
| Storage bug | `06-DATA-MODEL.md`, `07-STORAGE-AND-INTEGRITY.md` |
| History/Previous | `10-PROGRESSION-PR-HISTORY.md` |
| Progress/PR | `08-WORKOUT-DOMAIN-RULES.md`, `10-PROGRESSION-PR-HISTORY.md` |
| Backup/import | `13-BACKUP-IMPORT-EXPORT.md` |
| PWA/offline | `12-PWA-OFFLINE.md` |
| Responsive/UI | `11-MOBILE-UI-UX.md`, `14-TESTING-QA.md` |
| Yeni feature | `15-CODING-STANDARDS.md`, `16-CHANGE-PROTOCOL.md` |
| Bugfix | `prompts/BUGFIX-PROMPT-TEMPLATE.md` |
| Code review | `prompts/CODE-REVIEW-PROMPT.md` |

## En kritik anti-pattern'ler

- Tüm projeyi yeniden yazmak.
- React/Next.js'e geçirmek.
- Fake workout geçmişi eklemek.
- `Previous` alanını hard-code etmek.
- PR için tahmini 1RM eklemek.
- Programdaki set/RIR/rest değerlerini "iyileştirmek".
- Storage state'i doğrudan view içinden manipüle etmek.
- `localStorage.setItem` çağrılarını rastgele modüllere yaymak.
- Browser testi çalışmadan "mobil test geçti" yazmak.
- Data migration olmadan schema değiştirmek.
- Service Worker cache adını güncelleyip asset listesini unutmak veya tam tersi.

## Çıkış kriteri

Bir agent görevi, yalnızca kod derlenince değil, ilgili davranış testleri ve regresyonlar geçince tamamlanmış sayılır.
