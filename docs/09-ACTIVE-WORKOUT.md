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

Weight/Reps/RIR girişleri set tamamlanmadan da kaydedilebilir. Weight ve reps alanları büyük stepper kontrollerine ek olarak doğrudan klavye girişini korur. Set tamamlama başlamadan bekleyen debounce temizlenir; böylece tamamlanan set gecikmiş draft yazımıyla tekrar düzenlenmez.

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

`Öncekini kullan` aksiyonu eşleşen gerçek setin weight/reps/RIR değerlerini mevcut drafta doldurur. Kullanıcı seti tamamlamadan önce değerleri değiştirebilir.

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

Discard edilen workout History default listesinde görünmez. Verinin lifecycle bilgisi korunur. Workout seçenekleri, bitirme ve iptal işlemleri accessible custom bottom sheet üzerinden çalışır. İptal tek dokunuşla gerçekleşmez; destructive confirmation gerekir.

## Gym Mode

Active Workout sırasında:

- bottom nav gizlenebilir,
- büyük controls,
- sticky Complete Set,
- Wake Lock destekliyse kullanılabilir,
- unsupported/denied Wake Lock uygulamayı bozmamalı,
- keyboard/VisualViewport CTA erişimini bozmamalı.

## Sheet bilgi sistemi

Active Workout içinden not, teknik ve alternatif aksiyonları bottom sheet olarak açılır.

- Teknik ve alternatif içerikleri `program-content.js` kaynağından gelir.
- Not ve rahatsızlık alanları aktif session exercise verisine kaydedilir.
- Alternatif seçimi `selectedVariation` olarak yalnızca aktif session'a yazılır; canonical program tanımını değiştirmez.
- Sheet kapanınca odak açan kontrole döner.
