# 06 — Data Model

## Root State

Storage root yaklaşık şu şekildedir:

```js
{
  schemaVersion: 1,
  revision: 0,
  createdAt: "ISO_DATE",
  updatedAt: "ISO_DATE",
  activeSessionId: null,
  sessions: {},
  settings: {}
}
```

### Root invariant'ları

- `schemaVersion` pozitif integer.
- `revision` non-negative integer.
- `createdAt` / `updatedAt` geçerli ISO date.
- `updatedAt >= createdAt`.
- `sessions` object map.
- En fazla bir `in_progress` session.
- `activeSessionId`, varsa tam olarak o `in_progress` session'ı gösterir.

## WorkoutSession

Yeni workout başladığında `createWorkoutSession()` ile oluşturulur.

```js
{
  id,
  programId,
  programSchemaVersion,
  workoutId,
  workoutName,
  workoutSnapshot: {
    focus,
    estimatedDuration: { min, max }
  },
  status: "in_progress" | "completed" | "discarded",
  startedAt,
  updatedAt,
  completedAt,
  discardedAt,
  currentExerciseIndex,
  notes,
  exercises: []
}
```

### Neden snapshot var?

Eski workout'un reçetesi, ileride static program değişse bile geçmişteki haliyle yorumlanabilsin diye prescription/session metadata snapshot olarak saklanır.

## ExerciseSession

```js
{
  slotId,
  exerciseName,
  targetMuscles,
  selectedVariation: null,
  notes: "",
  painOrDiscomfort: "",
  prescriptionSnapshot: {
    workingSets,
    reps: { min, max, perSide },
    rir: { min, max },
    restSeconds: { min, max }
  },
  sets: []
}
```

`slotId` historical identity için kritik anahtardır. Display name yerine identity olarak slot ID kullanılır.

## SetRecord

```js
{
  id,
  setNumber,
  type: "working" | "warmup",
  weight: null,
  reps: null,
  rir: null,
  completedAt: null,
  restStartedAt: null,
  restEndsAt: null
}
```

Şu an session creation doğrudan working setleri yaratır. Warm-up modeli schema tarafından desteklenir ancak warm-up çalışma hacmi değildir.

## Draft vs completed set

Draft set:

- weight/reps/rir kısmen dolu olabilir,
- `completedAt === null`,
- rest timestamp yoktur.

Completed working set:

- weight zorunlu,
- reps zorunlu,
- rir zorunlu,
- `completedAt` zorunlu,
- `restStartedAt` ve `restEndsAt` zorunlu.

## Lifecycle

```text
in_progress
   ├─ complete → completed
   └─ discard  → discarded
```

Completed session:

```text
completedAt != null
discardedAt == null
```

Discarded session:

```text
discardedAt != null
completedAt == null
```

## Identity

- Session ID global unique olmalı.
- Set ID global unique olmalı.
- Bir session içinde exercise `slotId` duplicate olamaz.
- Aynı exercise içinde aynı `type + setNumber` duplicate olamaz.

## User data olmayan şeyler

Aşağıdakiler static program definition'dır ve root user state'e yazılmaz:

- ana haftalık schedule,
- exercise prescription source,
- form tips,
- alternatives,
- warm-up guide,
- recovery guide.
