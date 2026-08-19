# 07 — Storage ve Data Integrity

## Storage engine

Ana persistence: `LocalStorage`.

Storage key'leri:

```text
workout-tracker:state
workout-tracker:state:backup
workout-tracker:state:pre-import
```

## Primary + rolling backup

Normal save sırasında mevcut geçerli state korunarak yeni state yazılır. Storage layer JSON parse, migration ve validation uygular.

Amaç:

- yarım/bozuk write'a karşı recovery,
- corrupt primary olduğunda backup'a düşebilme,
- invalid state'i sessizce kabul etmeme.

## Pre-import snapshot

`workout-tracker:state:pre-import`, normal rolling backup'tan farklıdır.

Yalnızca import öncesi oluşturulur ve son başarılı import'u kullanıcı tarafından geri alma amacı taşır.

Import akışı:

```text
incoming text
→ parse
→ envelope validation
→ migration
→ full state validation
→ pre-import snapshot
→ rolling backup
→ primary replace
```

Pre-import snapshot oluşturulamazsa import başlamamalıdır.

## Schema validation

`validateState()` sadece tip kontrolü yapmaz; cross-entity invariant da kontrol eder:

- session map key = session.id,
- duplicate session ID yok,
- duplicate set ID yok,
- maksimum 1 in-progress,
- activeSessionId tutarlı,
- status/timestamp ilişkisi geçerli,
- prescription working set count ile gerçek working set sayısı eşleşir,
- completed working set alanları tamdır,
- rest timestamp sıralaması geçerlidir.

## Timestamp invariant'ları

Genel:

```text
state.updatedAt >= state.createdAt
session.updatedAt >= session.startedAt
completedAt/discardedAt >= startedAt
```

Set:

```text
restEndsAt >= restStartedAt >= completedAt >= session.startedAt
```

Completed session'da set completion session completion sonrasına taşamaz.

## Quota handling

LocalStorage quota dolduğunda özel `StorageError` code kullanılır:

```text
QUOTA_EXCEEDED
PREIMPORT_SNAPSHOT_QUOTA
```

Agent quota hatasını generic "başarısız" durumuna indirgememeli; user recovery yolu korunmalıdır.

## Revision

State mutationlarında `revision` artar. Agent doğrudan raw LocalStorage yazarak bu mekanizmayı bypass etmemelidir.

## Migration

Schema shape değişecekse:

1. `CURRENT_SCHEMA_VERSION` planlanır.
2. `migrations.js` deterministic migration eklenir.
3. Eski state fixture/test eklenir.
4. Import ve normal load migration davranışı birlikte test edilir.
5. Migration olmadan schema field rename/delete yapılmaz.

## Data integrity değişikliğinde minimum test

- valid state kabul,
- invalid state ret,
- primary recovery,
- backup recovery,
- activeSession invariant,
- duplicate IDs,
- round-trip export/import,
- full `tests/run-all.mjs`.
