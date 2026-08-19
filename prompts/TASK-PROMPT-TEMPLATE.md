# Genel Task Prompt Template

```text
AGENTS.md ve ai-agent docs paketini okuyarak mevcut Workout Tracker kod tabanı üzerinde çalış.

GÖREV:
[Görevi yaz]

KISITLAR:
- Mevcut Vanilla JS mimarisini koru.
- Program source-of-truth'u değiştirme.
- Fake data ekleme.
- Mobile-first davranışı koru.
- Mevcut user data/schema invariant'larını koru.
- Büyük rewrite yapma.

ÇALIŞMA ŞEKLİ:
1. İlgili kod/testleri incele.
2. Root cause veya implementation planını yaz.
3. Minimum patch uygula.
4. Regression test ekle/güncelle.
5. node tests/run-all.mjs çalıştır.
6. Değişen dosyaları ve test sonucunu raporla.
```
