# 11 — Mobile UI/UX Contract

## Ana platform

Telefon. Desktop secondary.

Kritik widths:

```text
320 minimum
360
375
390 ← merkez hedef
393
412
430
```

QA viewport hedefleri:

```text
360×800
390×844
393×873
412×915
430×932
```

## Tasarım yaklaşımı

Desktop layout'u küçültme. Mobile base CSS yaz; tablet/desktop yalnız genişletme.

SiteWise redesign koyu, yüksek kontrastlı ve düşük cognitive load odaklıdır. Merkezi surface, border, spacing, radius ve typography tokenları kullanılır. Görsel değişiklikler gerçek data/service katmanından ayrıdır; demo performans verisi üretmez.

## Horizontal overflow

Normal kullanımda horizontal scroll yasak.

Özellikle kontrol et:

- Active Workout,
- set cards,
- History,
- Progress charts,
- bottom sheets,
- navigation.

`100vw` kullanımı dikkatle ele alınmalı; mevcut QA 100vw kullanımını istemez.

## Touch targets

Minimum:

```text
44×44 px
```

Ana actions tercih:

```text
48–56 px height
```

Küçük görünen icon olabilir; hit area küçük olamaz.

## Input UX

Weight:

- `inputmode="decimal"`
- büyük +/- controls
- büyük value

Reps:

- `inputmode="numeric"`

Keyboard açıldığında:

- focused input görünür,
- Complete Set kaybolmamalı,
- VisualViewport desteği progressive enhancement olarak kullanılabilir.

## Bottom navigation

Normal screens:

```text
Home / Workout / History / Progress / Program
```

Safe-area uyumlu.

Active Workout Gym Mode'da nav gizlenebilir.

## Sticky CTA

Active Workout ana action (`Seti tamamla`) alt bölgede kolay erişilebilir olmalıdır. CTA safe-area ve VisualViewport tabanlı keyboard inset ile konumlanır.

## Bottom sheets

Tercih edilen alanlar:

- technique,
- alternatives,
- notes ve discomfort,
- workout options,
- incomplete finish confirmation,
- destructive discard confirmation,
- warm-up/safety bilgileri.

Sheet max viewport'u aşmamalı; scrollable olmalı; close sonrası focus opener'a dönmeli.

## Typography

Yaklaşık hedefler:

```text
Body: 15–16px
Secondary: 13–14px
Input value: 20–28px
Exercise title: 20–24px
Primary CTA: 16–18px
```

10–11px kritik text kullanma.

## Safe area

Bottom nav, sticky CTA ve sheetlerde `env(safe-area-inset-bottom)` dikkate alınmalı.

## Reduced motion

`prefers-reduced-motion: reduce` desteklenir. Zorunlu smooth scroll/animation yapılmaz.

## Accessibility

- semantic buttons,
- keyboard focus,
- focus return from modal/sheet,
- `dialog` ve `aria-modal` semantiği,
- `aria-current` ve `aria-pressed` durumları,
- progressbar semantics,
- minimum 44×44 px touch target,
- timer her saniye live region spam yapmamalı.

## Performans

- ağır blur/shadow spam yok,
- continuous JS animation loop yok,
- CSS transitions tercih,
- orta seviye Android hedef.
