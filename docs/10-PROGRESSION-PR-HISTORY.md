# 10 — Previous, History, Progression, PR ve Progress

## History

History kaynağı yalnızca persisted session'lar.

Default listede:

- `completed` görünür,
- `in_progress` görünmez,
- `discarded` görünmez.

History detail gerçek setleri gösterir. Partial completed workout tam yapılmış gibi sunulmaz; completed/planned ayrımı korunur.

## Previous Performance

Aynı `workoutId + slotId` için en uygun geçmiş completed session kullanılır. Display name identity değildir.

Hiç veri yoksa null/empty state.

## ProgressionService status'leri

### `no-data`
Gerçek completed set yok.

### `pain-review`
Son exercise kaydında `painOrDiscomfort` var. Load progression zorlanmaz.

### `partial`
Planned working setlerin hepsi tamamlanmamış.

### `technique-phase`
İlk completed history ile latest arasındaki takip yaşı 14 günden az. Öncelik teknik.

### `hold`
Rep minimum altında veya hedef RIR'dan daha düşük RIR kaydı var.

### `candidate`
Bütün planned setler tamamlandı + hepsi upper rep limitte + target RIR korunuyor. Bu **otomatik weight increase değildir**.

### `build-reps`
Tüm setler rep range içinde fakat upper limit tamamlanmadı. Aynı yükle reps geliştir.

### `review`
Diğer belirsiz durum.

## Manual checks

Progression engine şu üç şeyi sensörle ölçemez ve otomatik true saymaz:

```text
techniqueQuality
noMomentumBreakdown
noJointPain
```

UI bunları manuel kontrol olarak göstermelidir.

## Assistance-sensitive hareket

`upper-b / upper-b-02` Assisted Pull-Up / Pull-Up özel durumdur. Daha yüksek "weight" her zaman daha iyi performans anlamına gelmeyebilir; bu nedenle load direction otomatik yorumlanmaz.

## PRService

PR'lar persistent ayrı tablo değildir; completed working setlerden **türetilir**.

Records:

- heaviest load,
- rep record,
- best set volume (`weight * reps`).

### Load record desteklenmeyen slotlar

- `upper-b-02` Assisted Pull-Up / Pull-Up
- `lower-b-07` Hanging Knee Raise / Captain's Chair

Bu slotlarda load-based PR üretilmez.

## Tahmini 1RM

Projede yoktur ve domain hedefi değildir. Agent otomatik eklememelidir.

## Progress

Progress ekranı History/Progression/PR read model'lerinden türetilir. Fake chart noktaları veya başlangıç sample data kullanılmaz.
