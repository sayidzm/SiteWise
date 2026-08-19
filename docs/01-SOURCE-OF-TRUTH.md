# 01 — Source of Truth ve Öncelik Sırası

Bu proje farklı zamanlarda üretilmiş promptlar, README'ler, kod ve testlerden oluşur. Agent çelişki gördüğünde aşağıdaki öncelik sırasını kullanmalıdır.

## 1. Workout programı için en yüksek otorite

`sources/workout-program-source.md`

Bu dosya şunların tek doğru kaynağıdır:

- haftalık program,
- egzersizler,
- set sayıları,
- tekrar aralıkları,
- RIR hedefleri,
- dinlenme süreleri,
- egzersiz alternatifleri,
- teknik/form notları,
- double progression,
- warm-up sistemi,
- recovery/deload yaklaşımı,
- güvenlik kuralları.

Agent bu alanları kendi bilgisiyle "düzeltmemeli" veya değiştirmemelidir. Bir ürün özelliği programla çelişiyorsa ürün özelliği programa uydurulur.

## 2. Ürün ve mobil UX için otorite

`sources/original-product-prompt.md`

Özellikle:

- mobile-first,
- 360–430 px hedefler,
- Active Workout önceliği,
- tek-elle kullanım,
- 44 px minimum touch target,
- sticky actions,
- bottom navigation,
- safe-area,
- horizontal overflow yasağı,
- fake data yasağı

bu dosyadan gelir.

## 3. Gerçekte çalışan sistem için otorite

**Mevcut kod ve testler.**

Özet dokümanlar stale olabilir. Bir servis davranışını değiştirmeden önce gerçek implementasyonu oku.

Önemli dosyalar:

- `js/data/program-data.js`
- `js/data/program-content.js`
- `js/models/workout-session.js`
- `js/storage/schema.js`
- `js/storage/storage.js`
- `js/services/*`
- `js/views/*`
- `tests/*`

## 4. Güncel proje açıklaması

`sources/current-project-readme.md`

Detaylı referanstır; fakat koddan üstün değildir.

## 5. Bu AI handoff dokümanları

`docs/*.md`, `memory-bank/*.md`, `prompts/*.md`

Bunlar agentı hızlandırmak için hazırlanmıştır. Kod veya primary source ile çelişirse primary source/kod kazanır.

## Çelişki çözüm prosedürü

1. Çelişen alanın türünü belirle: workout domain mi, UI gereksinimi mi, implementasyon davranışı mı?
2. Yukarıdaki otorite sırasını uygula.
3. Sessizce reconcile etme.
4. Gerekirse değişiklik notuna "doküman-kod farkı" yaz.
5. Workout domain değişikliği gerekiyorsa kullanıcı açıkça istemeden yapma.

## Değişmez program çekirdeği

Haftalık yapı:

```text
Pazartesi  — Upper A
Salı       — Lower A
Çarşamba   — Dinlenme
Perşembe   — Upper B
Cuma       — Lower B
Cumartesi  — Dinlenme
Pazar      — Dinlenme
```

Temel güvenlik:

```text
Technique > Weight
1RM / maksimum kaldırış denemesi yok
Sürekli failure yok
Çoğu set 2–3 RIR
İzolasyonlar gerektiğinde 1–2 RIR
Form bozulduğunda set biter
Ağrı üzerinden çalışılmaz
```
