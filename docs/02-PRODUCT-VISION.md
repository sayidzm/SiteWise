# 02 — Product Vision

## Ürün problemi

Spor salonunda set kaydı yapmak çoğu uygulamada gereğinden fazla dokunma, kaydırma veya menü gezintisi gerektirir. Bu ürünün amacı kullanıcıyı içerikle oyalamak değil, **aktif workout sırasında veri girişini mümkün olduğunca hızlı ve güvenilir hale getirmektir**.

## Core loop

```text
Uygulamayı aç
→ Bugünkü workout'u gör
→ Workout başlat / devam et
→ Aktif egzersiz
→ Gerçek previous
→ KG / Reps / RIR gir
→ Complete Set
→ Rest Timer
→ Sonraki set / egzersiz
→ Finish Workout
→ History
→ Progress / PR / progression
```

## Ürün dışı alanlar

Bu proje varsayılan olarak şunlar değildir:

- sosyal fitness ağı,
- influencer/content platformu,
- kalori/nutrition tracker,
- AI coach,
- cloud account sistemi,
- multiplayer/leaderboard uygulaması,
- bodybuilding yarışma uygulaması.

Bu alanlar, kullanıcı açıkça ürün yönünü değiştirmedikçe eklenmemelidir.

## Başarı ölçütü

Bir özellik şu soruya olumlu yanıt vermelidir:

> 390px genişliğindeki telefonda, spor salonunda, tek elle, birkaç saniye içinde kullanılabiliyor mu?

## Ürün öncelikleri

```text
Reliability > Features
Usability > Decoration
Mobile UX > Desktop UX
Real Data > Placeholder Data
Technique > Weight
Working Features > Visual Mockups
```

## Veri felsefesi

Kullanıcıya performansmış gibi görünen hiçbir şey uydurulmaz.

Gerçek veri yoksa:

```text
—
Henüz veri yok
İlk workout'unu tamamladığında burada görünecek
```

kullanılır.

Özellikle fake veri yasak alanları:

- Previous
- Last Workout
- History
- Progress
- PR
- progression recommendation

## Offline-first tanımı

Offline-first burada şunu ifade eder:

- workout sırasında network gerekli değildir,
- user data cihazda saklanır,
- app shell PWA cache ile offline açılabilir,
- kayıt işlemi server round-trip beklemez,
- network failure workout kaydını engellememelidir.

## Tasarım karakteri

- profesyonel,
- sade,
- yüksek okunabilirlik,
- gym ortamında hızlı kullanım,
- gereksiz neon/cyberpunk yok,
- desktop dashboard görünümünü telefona sıkıştırma yok,
- dekorasyon işlevin önüne geçmez.
