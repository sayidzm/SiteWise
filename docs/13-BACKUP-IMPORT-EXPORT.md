# 13 — Backup / Import / Export Contract

## Backup envelope

```json
{
  "format": "workout-tracker-backup",
  "formatVersion": 1,
  "appVersion": "0.11.0",
  "exportedAt": "ISO_DATE",
  "appSchemaVersion": 1,
  "summary": {},
  "data": {}
}
```

## Import size

Maximum text byte size:

```text
5 MB
```

UI kontrolüne ek olarak servis seviyesi koruma vardır. Agent yalnız file input attribute'a güvenmemelidir.

## Preflight

`inspectImportText()` state değiştirmez.

Akış:

```text
text non-empty
→ size check
→ JSON.parse
→ envelope validate
→ future schema reject
→ migrate clone
→ validateState
→ metadata schema == migrated schema
→ summary return
```

## Future schema

Backup'ın `appSchemaVersion > CURRENT_SCHEMA_VERSION` ise import reddedilir. Daha yeni veriyi sessizce kırpma/tahmin etme yok.

## Atomicity/recovery yaklaşımı

Valid incoming data kanıtlandıktan sonra:

1. Current state için dedicated pre-import snapshot.
2. Replace sırasında rolling backup.
3. New primary write.

Pre-import snapshot oluşmazsa import iptal edilir.

## Undo last import

`restorePreImport()` son import öncesi snapshot'a döner ve recovery key'i temizlemeye çalışır.

## Integrity

Import yalnız parse edilebilir JSON olduğu için kabul edilmez. Full schema invariant'ları geçmelidir.

Özellikle:

- duplicate IDs,
- multiple active sessions,
- bad activeSessionId,
- invalid status timestamps,
- bad set counts,
- bad rest ordering

reddedilir.

## Round-trip acceptance

Minimum acceptance:

```text
Export A
→ farklı state B
→ Import A
→ History aynı
→ Progress/PR aynı
→ active workout aynı
→ settings aynı
→ undo import
→ B geri gelir
```

## Export derived data

History/PR/Progress ayrı persisted tables değildir; root state geri geldiğinde servisler aynı derived sonucu üretmelidir. Round-trip testinde bu davranış kontrol edilmelidir.
