# 09 — Active Workout Contract

## Neden en kritik ekran?

Uygulamanın asıl kullanım anı spor salonudur. Bu ekranın amacı kullanıcıyı birkaç saniyede şu döngüden geçirmek:

```text
Previous → Weight → Reps → RIR → Complete Set → Rest
```

## Session start

`WorkoutSessionService.start(workoutId)`:

- canonical programdan session yaratır,
- prescription snapshot alır,
- tüm working set draftlarını oluşturur,
- `activeSessionId` ayarlar,
- aynı anda ikinci aktif session'a izin vermez.

## Draft autosave

Weight/Reps/RIR girişleri set tamamlanmadan da kaydedilebilir.

Draft kuralları:

- weight >= 0 veya null,
- reps integer >= 0 veya null,
- RIR integer 0–10 veya null,
- completed set draft olarak edit edilemez.

## Complete Set

Tamamlama sırasında:

- weight/reps/RIR validate edilir,
- completedAt yazılır,
- restStartedAt = completedAt,
- default rest = prescription minimum rest,
- restEndsAt timestamp hesaplanır,
- aynı set ikinci kez tamamlanamaz.

## Rest Timer

Timer state'i sadece UI `setInterval` değildir.

Canonical timing:

```text
completedAt
restStartedAt
restEndsAt
```

UI kalan süreyi timestamp'ten türetir. Reload/uyku sonrası doğru kalabilmesinin nedeni budur.

Rest actions:

- +30s gibi delta ayarı,
- skip rest,
- `restEndsAt < restStartedAt` olamaz.

## Previous

Previous yalnızca gerçek completed session'lardan gelir. Aynı workout + slot identity üzerinden eşleşir. History yoksa UI `—`/`Henüz veri yok` gösterir.

Hard-code Previous kesinlikle yasaktır.

## Exercise navigation

`currentExerciseIndex` session state içindedir. Kullanıcı önceki/sonraki veya listeden exercise seçebilir. Navigation, set verisini silmez.

## Finish Workout

Workout tamamlanırken:

- eksik setler varsa setting'e göre confirmation,
- status `completed`,
- completedAt yazılır,
- activeSessionId temizlenir,
- partial workout yapılmış setlerle history'de gerçek haliyle görünür.

## Discard

Discard edilen workout History default listesinde görünmez. Verinin lifecycle bilgisi korunur.

## Gym Mode

Active Workout sırasında:

- bottom nav gizlenebilir,
- büyük controls,
- sticky Complete Set,
- Wake Lock destekliyse kullanılabilir,
- unsupported/denied Wake Lock uygulamayı bozmamalı,
- keyboard/VisualViewport CTA erişimini bozmamalı.

## Sheet bilgi sistemi

Active Workout içinden teknik/alternatif/warm-up/safety rehberi bottom sheet olarak açılabilir. Rehber `program-content.js` kaynağından gelir; workout data ile birleşmez.
