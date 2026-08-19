# Bugfix Agent Prompt

```text
Workout Tracker projesindeki aşağıdaki hatayı düzelt:

HATA / LOG / REPRO:
[buraya]

Önce AGENTS.md ve ilgili ai-agent docs dosyalarını oku.

Kurallar:
- Tüm kodu baştan yazma.
- Önce root cause'u bul.
- Spesifik hatalı fonksiyon/satır/contract'ı tespit et.
- Minimum patch yap.
- User data kaybı yaratma.
- Program reçetesini değiştirme.
- Fake data ile sorunu gizleme.
- Regression test yaz.
- İlgili test + node tests/run-all.mjs çalıştır.

Çıktıda:
1. Root cause
2. Değişen dosyalar
3. Yapılan fix
4. Eklenen test
5. Test sonucu
6. Kalan limitation
```
