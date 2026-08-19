# 15 — Coding Standards

## Stack

Allowed core:

- HTML5
- CSS3
- Vanilla JavaScript ES Modules
- LocalStorage
- Web APIs (Service Worker, Wake Lock, Vibration, VisualViewport) progressive enhancement olarak

Framework ekleme yok.

## JavaScript

- ES Modules kullan.
- UI eventleri mümkün olduğunca central delegation ile yönet.
- State mutation service/repository üzerinden geçsin.
- View içinde raw LocalStorage write yapma.
- Persistent state'e Date object yazma; ISO string kullan.
- User-facing numeric inputları normalize/validate et.
- IDs stable identity olarak korunmalı.
- Hard-coded historical performance yok.

## Error handling

- Storage failure silent swallow edilmemeli.
- User'a recovery/actionable message ver.
- Unsupported browser API core app'i crash ettirmemeli.
- Validation error ile internal programming error'ı mümkün olduğunca ayır.

## CSS

- Mobile base first.
- Design tokens kullan.
- `box-sizing: border-box` sözleşmesini koru.
- Horizontal overflow yaratma.
- Safe-area aware sticky/fixed elements.
- Touch target >= 44px.
- Reduced motion destekle.
- Ağır animation loop yok.

## HTML/accessibility

- Clickable div yerine button/link tercih.
- Modal/sheet semantics.
- Focus return.
- Form input labels/accessible names.
- Progress için semantic role.
- Live regions spam yapmamalı.

## Naming

- Workout IDs: `upper-a`, `lower-a`, ...
- Slot IDs: `upper-a-01`, ...
- Persistent identity display name'den bağımsız.

## Feature ekleme

Bir feature üç katmanı etkiliyorsa hepsini açıkça ele al:

```text
Domain/data
Service/state
UI
Tests
```

UI ekleyip persistence'ı TODO bırakma.

## Kopya logic

Aynı domain hesabı View + Service içinde ayrı ayrı oluşuyorsa service/read-model'e taşı. Ancak küçük helper için gereksiz abstraction yaratma.

## Yorumlar

"what" yerine "why" açıklayan yorum tercih et. Özellikle data recovery, timestamp ve safety decision'larında rationale değerli.
