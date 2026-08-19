# 08 — Workout Domain Rules

Bu dosya uygulama logic'inde değiştirilemeyecek workout kurallarının özetidir. Ayrıntıda her zaman `sources/workout-program-source.md` kazanır.

## Haftalık plan

```text
Pazartesi  Upper A
Salı       Lower A
Çarşamba   Rest
Perşembe   Upper B
Cuma       Lower B
Cumartesi  Rest
Pazar      Rest
```

## Upper A

| Egzersiz | Set | Tekrar | RIR | Rest |
|---|---:|---:|---:|---:|
| Machine Chest Press | 3 | 8–12 | 2–3 | 120–180s |
| Neutral/Wide Lat Pulldown | 3 | 8–12 | 2–3 | 120–180s |
| Chest-Supported Row / Seated Row | 3 | 8–12 | 2–3 | 120–180s |
| Machine Shoulder Press | 2 | 8–12 | 2–3 | 120s |
| Cable Lateral Raise | 2 | 12–15 | 1–2 | 60–90s |
| Reverse Pec Deck / Rear-Delt Fly | 2 | 12–15 | 1–2 | 60–90s |
| Rope Triceps Pushdown | 1 | 10–15 | 1–2 | 60–90s |
| Dumbbell Hammer Curl | 1 | 10–15 | 1–2 | 60–90s |

## Lower A

| Egzersiz | Set | Tekrar | RIR | Rest |
|---|---:|---:|---:|---:|
| Leg Press | 3 | 8–12 | 2–3 | 120–180s |
| Dumbbell Romanian Deadlift | 3 | 8–12 | 3 | 120–180s |
| Lying / Seated Leg Curl | 2 | 10–15 | 2 | 90–120s |
| Reverse Lunge | 2 | 8–12 / bacak | 2–3 | 90–120s |
| Seated Calf Raise / Calf Machine | 2 | 10–15 | 2 | 60–90s |
| Adductor Machine / Cable Adduction | 1 | 12–15 | 2 | 60–90s |
| ABS / Ab Crunch Machine | 2 | 10–15 | 2 | 60–90s |

## Upper B

| Egzersiz | Set | Tekrar | RIR | Rest |
|---|---:|---:|---:|---:|
| Incline Dumbbell Press | 3 | 8–12 | 2–3 | 120–180s |
| Assisted Pull-Up / Pull-Up | 3 | 6–10 | 2–3 | 120–180s |
| Wide/Neutral Seated Cable Row | 3 | 8–12 | 2–3 | 120–180s |
| Landmine Press / Machine Shoulder Press | 2 | 8–12 | 2–3 | 120s |
| Cable Lateral Raise | 2 | 12–15 | 1–2 | 60–90s |
| Face Pull | 2 | 12–15 | 2 | 60–90s |
| Overhead Rope Triceps Extension | 1 | 10–15 | 1–2 | 60–90s |
| Incline Dumbbell Curl / Machine Curl | 1 | 10–15 | 1–2 | 60–90s |

## Lower B

| Egzersiz | Set | Tekrar | RIR | Rest |
|---|---:|---:|---:|---:|
| Hack Squat veya Goblet Squat | 3 | 8–12 | 2–3 | 120–180s |
| Hip Thrust Machine / Glute Bridge | 2 | 8–12 | 2–3 | 120s |
| Seated Leg Curl | 3 | 10–15 | 2 | 90–120s |
| Supported Bulgarian Split Squat | 2 | 8–12 / bacak | 2–3 | 90–120s |
| Standing Calf Raise | 2 | 10–15 | 2 | 60–90s |
| Adductor Machine | 1 | 12–15 | 2 | 60–90s |
| Hanging Knee Raise / Captain's Chair | 2 | 8–15 | 2 | 60–90s |

## Double progression

Temel mantık:

1. Aynı yükle tekrarları yükselt.
2. Bütün planned working setler üst tekrar sınırına geldiğinde hedef RIR da korunuyorsa load-change **candidate** oluşabilir.
3. Teknik aynı kalitede olmalı.
4. Eklem ağrısı olmamalı.
5. Momentum/savurma olmamalı.
6. Uygulama otomatik kilo değiştirmez.

## İlk 1–2 hafta

Teknik dönemi:

- cihaz ayarlarını öğren,
- hareket kalitesi,
- doğru ROM,
- doğru RIR tahmini,
- kilo artırmak öncelik değil.

## Warm-up

- 5–10 dk genel ısınma,
- 3–5 dk movement-specific hazırlık,
- ilk compound için 2–3 preparation set,
- preparation setler haftalık working volume değildir,
- failure'a yaklaşmaz.

## Deload

Otomatik her 4 haftada deload **yoktur**. Gerekli belirtiler birkaç workout sürerse yaklaşık 1 hafta working setleri %30–50 azaltma yaklaşımı vardır.

## Safety

- Technique > Weight.
- 1RM yok.
- Sürekli failure yok.
- Form belirgin bozulursa set biter.
- Keskin/alışılmadık ağrıda devam edilmez.
- Yeni/karmaşık harekette uygun gözetim önemlidir.
