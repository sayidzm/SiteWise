# Workout Tracker — Offline-First Mobile Upper / Lower Tracker

> Gerçek spor salonu kullanımına odaklanan, **mobile-first**, **offline-first**, framework kullanmayan bir workout takip uygulaması.
>
> Teknoloji: **HTML5 + CSS3 + Vanilla JavaScript + LocalStorage + Service Worker / PWA**

---

## İçindekiler

1. [Proje özeti](#proje-özeti)
2. [Ürünün ana amacı](#ürünün-ana-amacı)
3. [Temel ürün prensipleri](#temel-ürün-prensipleri)
4. [Mevcut geliştirme durumu](#mevcut-geliştirme-durumu)
5. [Ana kullanıcı akışı](#ana-kullanıcı-akışı)
6. [Özellikler](#özellikler)
7. [Ekranlar ve navigation](#ekranlar-ve-navigation)
8. [Antrenman programı](#antrenman-programı)
9. [Active Workout mimarisi](#active-workout-mimarisi)
10. [Previous sistemi](#previous-sistemi)
11. [Rest Timer](#rest-timer)
12. [Progressive Overload sistemi](#progressive-overload-sistemi)
13. [PR sistemi](#pr-sistemi)
14. [History sistemi](#history-sistemi)
15. [Program rehberi](#program-rehberi)
16. [Gym Mode](#gym-mode)
17. [Ayarlar](#ayarlar)
18. [Backup / Export / Import](#backup--export--import)
19. [PWA ve offline mimarisi](#pwa-ve-offline-mimarisi)
20. [Veri modeli](#veri-modeli)
21. [LocalStorage mimarisi](#localstorage-mimarisi)
22. [Veri bütünlüğü kuralları](#veri-bütünlüğü-kuralları)
23. [Proje mimarisi](#proje-mimarisi)
24. [Dosya yapısı](#dosya-yapısı)
25. [Modül referansı](#modül-referansı)
26. [Kurulum ve çalıştırma](#kurulum-ve-çalıştırma)
27. [Uygulamanın kullanımı](#uygulamanın-kullanımı)
28. [Mobil UI / responsive sözleşmesi](#mobil-ui--responsive-sözleşmesi)
29. [Accessibility](#accessibility)
30. [Test altyapısı](#test-altyapısı)
31. [Manuel QA kontrol listesi](#manuel-qa-kontrol-listesi)
32. [Edge-case davranışları](#edge-case-davranışları)
33. [Privacy ve güvenlik yaklaşımı](#privacy-ve-güvenlik-yaklaşımı)
34. [Bilinen sınırlamalar](#bilinen-sınırlamalar)
35. [Roadmap](#roadmap)
36. [Geliştirme kuralları](#geliştirme-kuralları)
37. [Sorun giderme](#sorun-giderme)
38. [Release checklist](#release-checklist)

---

# Proje özeti

Workout Tracker, telefonun spor salonunda aktif olarak kullanılacağı varsayımıyla tasarlanmış bir **offline-first workout tracking web app**'tir.

Uygulama bir egzersiz listesinden ibaret değildir. Ana hedef, kullanıcının gerçek bir antrenman sırasında birkaç saniye içinde set kaydedebilmesi ve zaman içinde gerçek performansını takip edebilmesidir.

Uygulamanın çekirdek kullanım senaryosu:

```text
Uygulamayı aç
→ Bugünkü antrenmanı gör
→ Workout başlat
→ Aktif egzersizi gör
→ Önceki gerçek performansı gör
→ KG / tekrar / RIR gir
→ Seti tamamla
→ Rest timer başlasın
→ Sonraki sete geç
→ Egzersizler arasında ilerle
→ Workout'u bitir
→ History'de kaydı gör
→ Progress ekranında gelişimi takip et
```

Uygulama:

- backend gerektirmez,
- kullanıcı hesabı gerektirmez,
- authentication kullanmaz,
- Firebase / Supabase kullanmaz,
- React / Vue / Angular / Next.js kullanmaz,
- workout geçmişini kullanıcının cihazında saklar,
- PWA olarak kurulabilir,
- Service Worker üzerinden uygulama kabuğunu offline açabilir.

---

# Ürünün ana amacı

Ana amaç spor salonunda kullanılabilecek kadar hızlı, sade ve güvenilir bir workout logger oluşturmaktır.

Ürün şu soruya göre tasarlanır:

> “390px genişliğindeki bir telefonda, spor salonunda, çoğunlukla tek elle bu işlem rahat yapılabiliyor mu?”

Bu nedenle uygulamanın en önemli ekranı **Active Workout** ekranıdır.

Desktop görünümü desteklenebilir; fakat ürünün tasarım merkezi desktop değildir.

---

# Temel ürün prensipleri

Projede aşağıdaki öncelik sırası korunur:

```text
Reliability > Features
Usability > Decoration
Mobile UX > Desktop UX
Real Data > Placeholder Data
Technique > Weight
Working Features > Visual Mockups
```

Ek olarak:

- Görünen bir aksiyon mümkün olduğunca gerçekten çalışmalıdır.
- Fake `Previous`, `Last Workout`, `PR`, `History` veya `Progress` verisi kullanılmaz.
- Gerçek kullanıcı verisi yoksa arayüz bunu açıkça belirtir.
- Program reçetesi kullanıcı geçmişinden ayrıdır.
- Antrenman programı kullanıcı performansı nedeniyle sessizce değiştirilmez.
- Progressive overload motoru kullanıcı adına otomatik ağırlık değiştirmez.
- Teknik kalitesi, eklem ağrısı veya momentum gibi uygulamanın otomatik ölçemediği şartlar “manuel kontrol” olarak kalır.

---

# Mevcut geliştirme durumu

Bu README, **FAZ 10 kod tabanının mevcut durumunu** belgeler.

## Tamamlanan geliştirme aşamaları

### FAZ 0 — Program veri mimarisi

- Upper A / Lower A / Upper B / Lower B programı structured data olarak tanımlandı.
- Set, tekrar, RIR ve dinlenme reçeteleri ayrıştırıldı.
- Program verisi ile kullanıcı geçmişi ayrıldı.
- Egzersiz slot kimlikleri oluşturuldu.

### FAZ 1 — App Shell

- Mobile-first temel CSS
- Hash router
- Bottom navigation
- Home / Workout / History / Progress / Program ekran iskeleti

### FAZ 2 — Persistent Storage

- Versioned LocalStorage state
- WorkoutSession modeli
- SetRecord modeli
- Autosave altyapısı
- Active session recovery
- Primary + backup storage
- State validation
- Migration altyapısı

### FAZ 3 — Today's Workout

- Gerçek haftalık programa göre bugünkü workout tespiti
- Dinlenme günü davranışı
- Workout başlatma
- Aktif workout resume
- Aynı anda ikinci workout başlatmayı engelleme

### FAZ 4 — Active Workout

- KG
- Reps
- RIR
- Complete Set
- Draft autosave
- Rest timer
- Exercise navigation
- Finish Workout
- Gerçek Previous

### FAZ 5 — History

- Tamamlanmış workout listesi
- Workout detail
- Süre
- Tamamlanan / planlanan set sayıları
- Egzersiz bazlı gerçek kayıtlar

### FAZ 6 — Progress

- Double progression motoru
- Gerçek PR sistemi
- Egzersiz bazlı performans geçmişi
- Tracking phase
- Trend görünümü

### FAZ 7 — Program rehberi

- Teknik/form notları
- Alternatif hareketler
- Warm-up
- Progressive overload rehberi
- Recovery / deload
- Güvenlik içeriği
- Bottom-sheet bilgi sistemi

### FAZ 8 — Gym Mode

- Wake Lock progressive enhancement
- Active Workout UX iyileştirmeleri
- Keyboard-aware sticky CTA
- Rest timer UX
- Workout options bottom-sheet

### FAZ 9 — Settings / veri taşıma / PWA temel implementasyonu

Bu aşamada roadmap'in daha sonraki bazı özellikleri erken uygulanmıştır:

- Settings
- JSON export
- JSON import
- Full reset
- Manifest
- Service Worker
- Offline app-shell cache

### FAZ 10 — Release Candidate QA

- Accessibility düzeltmeleri
- Focus return
- Reduced motion
- Storage quota handling
- Backup recovery edge-case'leri
- PWA offline runtime mock testleri
- Mobile layout contract testleri
- Full regression runner

### FAZ 11 — Backup / Import / Export Hardening

- Export envelope metadata ve özet alanları
- Import öncesi read-only preflight doğrulaması
- 5 MB servis-seviyesi import limiti
- Future schema reddi
- Session map key / `session.id` bütünlüğü
- Duplicate session / set ID kontrolleri
- Tek `in_progress` session invariant'ı
- Completed session / set timestamp bütünlüğü
- Working set prescription/set-count eşleşmesi
- Dedicated `pre-import` recovery snapshot
- Son içe aktarmayı Ayarlar ekranından geri alma
- Snapshot oluşturulamıyorsa import'u başlamadan durdurma
- Primary write başarısızlığında eski primary state'i koruma
- Export → import → restore round-trip integrity testleri

## Önemli roadmap notu

FAZ 11 artık formal olarak harden edilmiş ve testlerle kapatılmıştır. PWA / Service Worker altyapısı kod tabanında mevcut olsa da FAZ 12 ayrı bir offline-validation ve update-lifecycle hardening aşaması olarak hâlâ tamamlanmalıdır.

FAZ 13 için statik mobil sözleşme ve edge-case testlerinin önemli bölümü vardır; fakat gerçek cihaz / gerçek Chromium viewport doğrulaması çalışma ortamı kısıtı nedeniyle henüz formal olarak tamamlanmamıştır.

---

# Ana kullanıcı akışı

## Normal başlangıç

```text
Home
  ↓
Today's Workout
  ↓
Workout Başlat
  ↓
WorkoutSession oluştur
  ↓
Active Workout
  ↓
Set kayıtları
  ↓
Finish Workout
  ↓
History
  ↓
Progress
```

## Aktif workout varken

```text
Uygulama kapanır / yenilenir
  ↓
LocalStorage state yüklenir
  ↓
activeSessionId bulunur
  ↓
Aktif Workout geri yüklenir
  ↓
Kullanıcı kaldığı yerden devam eder
```

## Dinlenme günü

Program günü workout ile eşleşmiyorsa kullanıcıya yeni antrenman başlatılacakmış gibi sahte bir CTA gösterilmez.

---

# Özellikler

## Gerçek workout logging

Her çalışma seti için:

- ağırlık,
- tekrar,
- RIR,
- tamamlanma zamanı,
- rest timer başlangıcı,
- rest timer bitişi

saklanabilir.

## Draft autosave

Kullanıcı KG / tekrar / RIR alanlarını doldururken veriler yalnızca `Complete Set` butonuna basınca oluşmaz.

Tamamlanmamış setin geçici değerleri de session içinde saklanabilir.

Bu sayede sayfa yenilenmesi gibi durumlarda girilmiş değerlerin kaybolma riski azaltılır.

## Tek aktif workout

Aynı anda yalnızca bir `in_progress` workout bulunabilir.

Yeni session oluşturulmadan önce mevcut aktif session bitirilmeli veya discard edilmelidir.

## Gerçek Previous

Previous değeri yalnızca daha önce tamamlanmış gerçek session'lardan türetilir.

Geçmiş yoksa fake veri gösterilmez.

## Timestamp tabanlı rest timer

Timer yalnızca ekranda her saniye azalan bir JavaScript değişkeni değildir.

Set üzerinde:

```text
restStartedAt
restEndsAt
```

saklanır.

Bu nedenle sayfa yenilendiğinde kalan süre yeniden hesaplanabilir.

## History

Sadece `completed` workoutlar History içinde normal geçmiş kaydı olarak listelenir.

## Progress

Egzersiz bazında gerçek geçmiş performanslardan:

- en yüksek yük,
- en yüksek tekrar,
- en iyi set hacmi,
- performans trendi,
- progression durumu

hesaplanır.

## Program rehberi

Workout programının yalnızca sayısal reçetesi değil:

- teknik/form tüyoları,
- alternatif hareketler,
- warm-up sistemi,
- recovery / deload yaklaşımı,
- RIR açıklamaları,
- güvenlik kuralları

uygulama içinden erişilebilir.

## Offline-first

Workout verileri sunucu yerine cihazın LocalStorage alanında saklanır.

PWA Service Worker uygulama kabuğunu cache'leyebilir.

---

# Ekranlar ve navigation

Ana bottom navigation:

```text
Home
Workout
History
Progress
Program
```

Ayarlar, Program ekranından erişilen ayrı bir route'tur.

Hash route yapısı kullanılır.

Örnekler:

```text
#home
#workout
#history
#history/<sessionId>
#progress
#progress/<exerciseKey>
#program
#program/<workoutId>
#settings
```

## Home

Home ekranı:

- bugünün gününü,
- bugünkü workout'u,
- haftalık programı,
- aktif workout varsa resume durumunu

gösterir.

## Workout

Workout route'u iki ana durumda davranabilir:

1. Aktif workout yoksa bugünkü workout / dinlenme günü görünümü.
2. Aktif workout varsa Gym Mode / Active Workout görünümü.

## History

- tamamlanmış workout listesi,
- workout detail route'u,
- gerçek session özetleri

sunulur.

## Progress

İki temel görünüm vardır:

- tracked exercise overview,
- exercise progress detail.

## Program

- dört workout şablonu,
- workout detayları,
- exercise prescription,
- teknik bilgiler,
- alternatifler,
- rehber bölümleri

sunulur.

## Settings

- Gym Mode tercihleri,
- offline/PWA bilgisi,
- export/import,
- destructive reset

burada bulunur.

---

# Antrenman programı

Program kimliği:

```text
upper-lower-15
```

Program schema sürümü:

```text
1
```

Program adı:

```text
15 Yaş İçin Upper / Lower Programı
```

Alt başlık:

```text
Kas gelişimi + güç + teknik + uzun vadeli ilerleme
```

## Haftalık düzen

| Gün | Program |
|---|---|
| Pazartesi | Upper A |
| Salı | Lower A |
| Çarşamba | Dinlenme |
| Perşembe | Upper B |
| Cuma | Lower B |
| Cumartesi | Dinlenme |
| Pazar | Dinlenme |

---

## Upper A

**Odak:** Horizontal push + vertical pull + upper back + omuzlar + kollar  
**Tahmini süre:** 65–80 dakika

| Egzersiz | Set | Tekrar | RIR | Dinlenme |
|---|---:|---:|---:|---:|
| Machine Chest Press | 3 | 8–12 | 2–3 | 120–180 sn |
| Neutral/Wide Lat Pulldown | 3 | 8–12 | 2–3 | 120–180 sn |
| Chest-Supported Row / Seated Row | 3 | 8–12 | 2–3 | 120–180 sn |
| Machine Shoulder Press | 2 | 8–12 | 2–3 | 120 sn |
| Cable Lateral Raise | 2 | 12–15 | 1–2 | 60–90 sn |
| Reverse Pec Deck / Rear-Delt Fly | 2 | 12–15 | 1–2 | 60–90 sn |
| Rope Triceps Pushdown | 1 | 10–15 | 1–2 | 60–90 sn |
| Dumbbell Hammer Curl | 1 | 10–15 | 1–2 | 60–90 sn |

---

## Lower A

**Odak:** Quad + hip hinge + hamstring + tek bacak + calf + adductor + core  
**Tahmini süre:** 65–80 dakika

| Egzersiz | Set | Tekrar | RIR | Dinlenme |
|---|---:|---:|---:|---:|
| Leg Press | 3 | 8–12 | 2–3 | 120–180 sn |
| Dumbbell Romanian Deadlift | 3 | 8–12 | 3 | 120–180 sn |
| Lying / Seated Leg Curl | 2 | 10–15 | 2 | 90–120 sn |
| Reverse Lunge | 2 | 8–12 / bacak | 2–3 | 90–120 sn |
| Seated Calf Raise / Calf Machine | 2 | 10–15 | 2 | 60–90 sn |
| Adductor Machine / Cable Adduction | 1 | 12–15 | 2 | 60–90 sn |
| ABS / Ab Crunch Machine | 2 | 10–15 | 2 | 60–90 sn |

---

## Upper B

**Odak:** Farklı göğüs açısı + bodyweight/vertical pull + horizontal pull + omuz stabilizasyonu  
**Tahmini süre:** 65–80 dakika

| Egzersiz | Set | Tekrar | RIR | Dinlenme |
|---|---:|---:|---:|---:|
| Incline Dumbbell Press | 3 | 8–12 | 2–3 | 120–180 sn |
| Assisted Pull-Up / Pull-Up | 3 | 6–10 | 2–3 | 120–180 sn |
| Wide/Neutral Seated Cable Row | 3 | 8–12 | 2–3 | 120–180 sn |
| Landmine Press / Machine Shoulder Press | 2 | 8–12 | 2–3 | 120 sn |
| Cable Lateral Raise | 2 | 12–15 | 1–2 | 60–90 sn |
| Face Pull | 2 | 12–15 | 2 | 60–90 sn |
| Overhead Rope Triceps Extension | 1 | 10–15 | 1–2 | 60–90 sn |
| Incline Dumbbell Curl / Machine Curl | 1 | 10–15 | 1–2 | 60–90 sn |

---

## Lower B

**Odak:** Squat varyasyonu + glute + hamstring + unilateral + calf + core  
**Tahmini süre:** 65–80 dakika

| Egzersiz | Set | Tekrar | RIR | Dinlenme |
|---|---:|---:|---:|---:|
| Hack Squat veya Goblet Squat | 3 | 8–12 | 2–3 | 120–180 sn |
| Hip Thrust Machine / Glute Bridge | 2 | 8–12 | 2–3 | 120 sn |
| Seated Leg Curl | 3 | 10–15 | 2 | 90–120 sn |
| Supported Bulgarian Split Squat | 2 | 8–12 / bacak | 2–3 | 90–120 sn |
| Standing Calf Raise | 2 | 10–15 | 2 | 60–90 sn |
| Adductor Machine | 1 | 12–15 | 2 | 60–90 sn |
| Hanging Knee Raise / Captain's Chair | 2 | 8–15 | 2 | 60–90 sn |

---

# Active Workout mimarisi

Active Workout uygulamanın en kritik ekranıdır.

## Session başlangıcı

Workout başlatılınca program verisinden bir `WorkoutSession` snapshot'ı oluşturulur.

Bu snapshot'ın amacı, ileride program tanımı değişse bile eski workout geçmişinin o günkü reçeteyi korumasıdır.

Session oluşturulurken:

- `programId`
- `programSchemaVersion`
- `workoutId`
- `workoutName`
- workout focus
- estimated duration
- tüm exercise prescription snapshot'ları

session içine alınır.

## Set oluşturma

Her planlı çalışma seti başlangıçta oluşturulur:

```js
{
  id: "set_...",
  setNumber: 1,
  type: "working",
  weight: null,
  reps: null,
  rir: null,
  completedAt: null,
  restStartedAt: null,
  restEndsAt: null
}
```

Fake başlangıç performansı doldurulmaz.

## Draft editing

Tamamlanmamış set:

- KG,
- reps,
- RIR

alanlarında düzenlenebilir.

Tamamlanmış set draft olarak tekrar düzenlenemez.

## Complete Set

`Complete Set` işlemi:

```text
inputları normalize et
→ gerçek set kaydına yaz
→ completedAt yaz
→ restStartedAt yaz
→ restEndsAt hesapla
→ session updatedAt güncelle
→ LocalStorage'a persist et
```

Aynı set ikinci kez tamamlanamaz.

## Exercise navigation

Session içinde:

```text
currentExerciseIndex
```

saklanır.

Kullanıcı önceki / sonraki egzersize geçebilir veya navigator üzerinden belirli egzersizi açabilir.

---

# Previous sistemi

Previous sistemi fake data kullanmaz.

## Eşleşme mantığı

Aktif session ve egzersiz slotu için sistem:

1. Mevcut session'ı hariç tutar.
2. Yalnızca `completed` session'ları inceler.
3. Aynı `workoutId` içindeki geçmiş kayıtları arar.
4. Aktif session'dan daha eski kayıtları kullanır.
5. Aynı `slotId` eşleşmesini arar.
6. Tamamlanmış çalışma seti olmayan egzersizi kabul etmez.
7. İki tarafta da variation bilgisi varsa ve varyasyonlar farklıysa kayıt eşleşmez.

## Sonuç

Geçmiş varsa:

```text
Previous
30 kg × 10 — RIR 3
30 kg × 9  — RIR 2
30 kg × 9  — RIR 2
```

Geçmiş yoksa:

```text
Henüz veri yok
```

---

# Rest Timer

Rest timer set bazlı timestamp kullanır.

## Başlangıç

Set tamamlanınca varsayılan rest süresi egzersizin reçetesindeki minimum dinlenme süresidir.

Örnek:

```text
Rest 120–180 sn
```

ise başlangıç timer'ı:

```text
120 sn
```

olur.

## Saklanan alanlar

```text
restStartedAt
restEndsAt
```

## +30 saniye

Kullanıcı timer'a 30 saniye ekleyebilir.

## Skip

Kullanıcı dinlenmeyi erken bitirebilir.

## Reload davranışı

Sayfa yenilendiğinde kalan süre:

```text
restEndsAt - currentTime
```

üzerinden yeniden hesaplanır.

## Bildirim

Timer tamamlandığında UI durumunu günceller.

`restTimerVibration` açık ve cihaz/tarayıcı Vibration API'yi destekliyorsa titreşim kullanılabilir.

Screen reader'ın her saniyeyi okumasını önlemek için rest timer sürekli `aria-live` olarak çalışmaz; tamamlanma olayı ayrı duyurulur.

---

# Progressive Overload sistemi

Progression motoru kaynak programdaki **double progression** yaklaşımını temel alır.

## Ana mantık

Örneğin reçete:

```text
3 × 8–12
RIR 2–3
```

ise amaç önce aynı yükte tekrarları artırmaktır.

Örnek gelişim:

```text
9 / 9 / 8
10 / 10 / 9
11 / 10 / 10
12 / 11 / 10
12 / 12 / 12
```

## Uygulamanın kontrol ettiği koşullar

Motor son tamamlanmış performansta şunları kontrol eder:

```text
allPlannedSetsCompleted
allInsideRepRange
allAtUpperRepLimit
targetRirMaintained
noRecordedPainOrDiscomfort
```

## Uygulamanın otomatik doğrulayamadığı koşullar

Aşağıdakiler manuel kontrol olarak kalır:

```text
techniqueQuality
noMomentumBreakdown
noJointPain
```

Uygulama bunları sahte şekilde `true` kabul etmez.

## Progression durumları

### `no-data`

Henüz gerçek tamamlanmış set yoktur.

### `pain-review`

Son exercise kaydında `painOrDiscomfort` notu vardır.

Uygulama yük artışı önermek yerine progresyonu zorlamama mesajı verir.

### `partial`

Planlanan bütün çalışma setleri tamamlanmamıştır.

Bu performansa göre yük artışı değerlendirilmez.

### `technique-phase`

İlk kayıt ile en son kayıt arasındaki süre 14 günden azsa teknik dönemi öncelik kazanır.

Ağırlık artırmak öncelik olarak gösterilmez.

### `hold`

Bir veya daha fazla set:

- minimum tekrarın altındaysa veya
- minimum hedef RIR'ın altındaysa

aynı yükü koruma / gerekirse azaltma mesajı gösterilir.

### `candidate`

Şunlar sağlanırsa:

```text
bütün planlı setler tamamlandı
+
bütün setler üst tekrar sınırında
+
hedef RIR korundu
```

sonuç:

```text
Ağırlık artışı için aday
```

olur.

**Bu otomatik ağırlık artışı değildir.**

Teknik, momentum ve eklem ağrısı hâlâ kullanıcı tarafından kontrol edilmelidir.

### `build-reps`

Bütün setler tekrar aralığındadır fakat henüz üst sınıra ulaşmamıştır.

Aynı yükte tekrar geliştirme önerilir.

### `review`

Veri vardır fakat koşullar net şekilde diğer kategorilere girmiyorsa kayıt gözden geçirilir.

## Assisted Pull-Up özel davranışı

`Upper B / Assisted Pull-Up / Pull-Up` slotunda “yüksek KG = daha iyi” varsayımı güvenilir değildir.

Assistance makinesinde daha fazla sayı daha fazla yardım anlamına gelebilir.

Bu nedenle progression mesajı bir sonraki küçük **zorluk adımını** manuel değerlendirmeyi ister.

---

# PR sistemi

PR kayıtları ayrı bir fake PR tablosunda saklanmaz.

Her açılışta gerçek tamamlanmış çalışma setlerinden türetilir.

## Hesaplanan kayıtlar

### Heaviest Load

Desteklenen hareketlerde en yüksek kayıtlı ağırlık.

Tie-break:

1. daha yüksek weight,
2. daha yüksek reps,
3. daha yeni tarih.

### Rep Record

En yüksek tekrar sayısı.

Tie-break:

1. daha yüksek reps,
2. daha yüksek weight,
3. daha yeni tarih.

### Best Set Volume

```text
weight × reps
```

ile hesaplanır.

## Load PR desteklenmeyen özel slotlar

Şu hareketlerde uygulama yük PR'ını güvenilir kabul etmez:

```text
Upper B — Assisted Pull-Up / Pull-Up
Lower B — Hanging Knee Raise / Captain's Chair
```

Bu slotlarda `loadRecordSupported = false` olur.

## 1RM

Tahmini veya gerçek 1RM sistemi yoktur.

---

# History sistemi

History yalnızca gerçek tamamlanmış workoutlardan oluşur.

## Listeleme

Session:

```text
status === "completed"
```

ve `completedAt` varsa History'ye dahil edilir.

En yeni workout en üstte gösterilir.

## Summary metrikleri

Her tamamlanmış session için:

```text
durationSeconds
completedSetCount
plannedSetCount
touchedExerciseCount
plannedExerciseCount
completedExerciseCount
```

hesaplanır.

## Erken bitirilmiş workout

Kullanıcı workout'u eksik setlerle bitirirse History bunu tam yapılmış gibi göstermez.

Örneğin:

```text
12 / 17 set tamamlandı
```

şeklinde gerçek durum korunur.

---

# Program rehberi

Sayısal workout reçetesi:

```text
js/data/program-data.js
```

rehber / açıklama verisi ise:

```text
js/data/program-content.js
```

altında ayrılmıştır.

Bu ayrım sayesinde program çalıştırma verisi ile uzun form rehber içeriği birbirine karışmaz.

## Exercise detail

30/30 program slotu için rehber içeriği bulunur.

İçerik türleri:

- alternatifler,
- teknik/form tüyoları,
- bazı hareketlerde varyasyon bazlı özel açıklamalar.

## Guide bölümleri

Program ekranında rehber bölümleri bulunur:

```text
principles
progression
warmup
recovery
safety
```

## Bottom-sheet

Uzun açıklamalar mobilde küçük popup yerine bottom-sheet içinde gösterilir.

---

# Gym Mode

Aktif workout sırasında normal uygulama navigation'ı azaltılır ve workout odaklı deneyim kullanılır.

## Gym Mode özellikleri

- büyük KG / reps kontrolleri,
- büyük RIR target'ları,
- sticky Complete Set,
- exercise progress,
- teknik bilgi bottom-sheet,
- workout options,
- rest timer,
- Wake Lock durumu.

---

# Ayarlar

Varsayılan ayarlar:

```js
{
  keepScreenAwake: true,
  restTimerVibration: true,
  confirmIncompleteFinish: true
}
```

## `keepScreenAwake`

Aktif workout sırasında ekranı açık tutmak için Wake Lock denenir.

## `restTimerVibration`

Rest timer tamamlandığında destek varsa titreşim kullanılabilir.

## `confirmIncompleteFinish`

Eksik çalışma setleri varken workout bitirilmek istenirse kullanıcıdan onay istenir.

## Settings validation

Ayar anahtarları whitelist ile sınırlıdır.

Bilinmeyen setting key kabul edilmez.

Değerlerin boolean olması zorunludur.

---

# Backup / Export / Import

FAZ 11 itibarıyla bu katman yalnızca “çalışan JSON import/export” değildir; import öncesi doğrulama, bütünlük denetimi ve geri alma snapshot'ı ile harden edilmiştir.

## Export formatı

Export edilen dosya bir JSON envelope'dur.

```json
{
  "format": "workout-tracker-backup",
  "formatVersion": 1,
  "appVersion": "0.11.0",
  "exportedAt": "2026-...",
  "appSchemaVersion": 1,
  "summary": {
    "sessions": 3,
    "completedSessions": 2,
    "inProgressSessions": 1,
    "discardedSessions": 0,
    "workingSets": 49,
    "completedSets": 31,
    "activeSessionId": "session_...",
    "activeWorkoutName": "Lower A"
  },
  "data": {
    "schemaVersion": 1,
    "revision": 42,
    "createdAt": "...",
    "updatedAt": "...",
    "activeSessionId": "session_...",
    "sessions": {},
    "settings": {}
  }
}
```

`summary` kullanıcı state'inin yerine geçmez; yalnızca yedek içeriğini import öncesi açıklamak için türetilmiş metadata'dır. Gerçek kaynak `data` alanıdır.

## Import preflight

Dosya kullanıcı verisini değiştirmeden önce `inspectImportText()` tarafından incelenir.

Sıra:

```text
Text boş mu?
→ byte size <= 5 MB mi?
→ JSON parse
→ envelope object mi?
→ format doğru mu?
→ formatVersion destekleniyor mu?
→ appSchemaVersion geçerli mi?
→ future schema mı?
→ exportedAt geçerli ISO tarih mi?
→ data object var mı?
→ migrateState()
→ validateState()
→ metadata schema == migrated data schema mı?
→ import özeti oluştur
```

Bu aşamada LocalStorage'a hiçbir replacement write yapılmaz.

## State integrity kontrolleri

FAZ 11 doğrulaması yalnızca alan tiplerine bakmaz. Şunlar da kontrol edilir:

- `sessions` map key'i `session.id` ile aynı mı,
- duplicate session ID var mı,
- duplicate set ID var mı,
- aynı workout session içinde duplicate `slotId` var mı,
- bir exercise içinde duplicate `type + setNumber` var mı,
- aynı anda birden fazla `in_progress` session var mı,
- tek in-progress session `activeSessionId` tarafından işaretleniyor mu,
- completed / discarded / in-progress timestamp alanları status ile uyumlu mu,
- completed working set KG / reps / RIR içeriyor mu,
- completed working set rest timestamp'leri var mı,
- `restEndsAt >= restStartedAt >= completedAt` mı,
- set completion session başlamadan önce mi,
- completed session içindeki set session bitişinden sonra mı,
- working set sayısı prescription snapshot ile eşleşiyor mu,
- reps / RIR / rest aralık snapshot'ları geçerli mi.

## Dedicated pre-import recovery

Geçerli bir import yazılmadan hemen önce mevcut state ayrı bir key'e kaydedilir:

```text
workout-tracker:state:pre-import
```

Bu, normal rolling backup'tan ayrıdır. Ordinary workout save işlemleri bu snapshot'ı overwrite etmez.

Import başarıyla bittikten sonra Ayarlar ekranında:

```text
Son içe aktarmayı geri al
```

aksiyonu görünür. Bu işlem pre-import state'i geri yükler.

Snapshot oluşturulamazsa import **başlamaz**. Özellikle storage quota durumunda mevcut veri riske atılmaz.

## Atomic replacement yaklaşımı

Web Storage gerçek multi-key transaction sunmaz. Buna rağmen replacement sırası veri kaybını önleyecek şekilde tasarlanmıştır:

```text
Incoming state tamamen validate edilir
→ dedicated pre-import snapshot yazılır
→ mevcut okunabilir state rolling backup'a yazılır
→ primary state son işlem olarak yazılır
```

`localStorage.setItem()` tek key için atomiktir. Primary write başarısız olursa eski primary state yerinde kalır; incoming state kısmen commit edilmiş sayılmaz.

## Backward / future version davranışı

- Aynı `formatVersion: 1` içindeki eski backup'larda `appVersion` ve `summary` alanlarının olmaması kabul edilir.
- `appSchemaVersion > CURRENT_SCHEMA_VERSION` ise backup reddedilir.
- Daha yeni veri sessizce kırpılmaz veya tahmin edilerek dönüştürülmez.
- Migration yalnızca uygulamada açıkça tanımlı sequential migration bulunduğunda yapılabilir.

## Backup format sabitleri

```text
BACKUP_FORMAT = workout-tracker-backup
BACKUP_FORMAT_VERSION = 1
BACKUP_APP_VERSION = 0.11.0
MAX_IMPORT_BYTES = 5 MB
```

---

# PWA ve offline mimarisi

> Not: PWA / Service Worker implementasyonu mevcut olsa da roadmap açısından FAZ 12 ayrıca formal offline-validation aşaması olarak planlanmaktadır.

## Manifest

`manifest.webmanifest`:

```text
name: Workout Tracker
short_name: Workout
lang: tr
start_url: ./#home
scope: ./
display: standalone
orientation: portrait-primary
```

Tema:

```text
background_color: #0f1115
theme_color: #0f1115
```

Iconlar:

```text
192 × 192
512 × 512
```

## Service Worker registration

Service Worker yalnızca uygun context'te register edilir:

```text
https://
http://localhost
http://127.0.0.1
http://[::1]
```

`file://` için Service Worker kullanılmaz.

## Cache adı

```text
workout-tracker-sitewise-redesign-v5
```

## App shell cache

Cache içine:

- index.html,
- manifest,
- CSS,
- JS modülleri,
- program data,
- iconlar

alınır.

## Navigation strategy

Navigation request:

```text
Network first
→ network başarısızsa cached index.html
```

## Statik asset strategy

Same-origin GET asset'lerde:

```text
Stale While Revalidate
```

yaklaşımı kullanılır.

Akış:

```text
cache varsa hemen dön
+
ağdan güncel halini çekmeye çalış
+
başarılıysa cache'i güncelle
```

Cache ve network ikisi de yoksa:

```text
503 Offline
```

response döner.

## Cross-origin

Service Worker cross-origin istekleri ele geçirmez.

## Workout verisi cache'e yazılmaz

Service Worker yalnızca uygulama dosyalarıyla ilgilenir.

Workout geçmişinin source-of-truth'u LocalStorage state'tir.

---

# Veri modeli

## Root state

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

## WorkoutSession

Örnek yapı:

```js
{
  id: "session_...",
  programId: "upper-lower-15",
  programSchemaVersion: 1,
  workoutId: "upper-a",
  workoutName: "Upper A",

  workoutSnapshot: {
    focus: "...",
    estimatedDuration: {
      min: 65,
      max: 80
    }
  },

  status: "in_progress",

  startedAt: "ISO_DATE",
  updatedAt: "ISO_DATE",
  completedAt: null,
  discardedAt: null,

  currentExerciseIndex: 0,
  notes: "",

  exercises: []
}
```

## Session status

Desteklenen değerler:

```text
in_progress
completed
discarded
```

## ExerciseSession

```js
{
  slotId: "upper-a-01",
  exerciseName: "Machine Chest Press",
  targetMuscles: "Göğüs, triceps, front delt",

  selectedVariation: null,
  notes: "",
  painOrDiscomfort: "",

  prescriptionSnapshot: {
    workingSets: 3,
    reps: {
      min: 8,
      max: 12,
      perSide: false
    },
    rir: {
      min: 2,
      max: 3
    },
    restSeconds: {
      min: 120,
      max: 180
    }
  },

  sets: []
}
```

## SetRecord

```js
{
  id: "set_...",
  setNumber: 1,
  type: "working",
  weight: 30,
  reps: 10,
  rir: 2,
  completedAt: "ISO_DATE",
  restStartedAt: "ISO_DATE",
  restEndsAt: "ISO_DATE"
}
```

## Set type

Schema şu iki tipi kabul eder:

```text
working
warmup
```

Mevcut program session creation akışı planlanan çalışma setlerini `working` olarak oluşturur.

Warm-up veri tipi schema seviyesinde desteklenmektedir; warm-up'ın ayrı bir tam logging akışı şu an Active Workout ana akışının parçası değildir.

---

# LocalStorage mimarisi

Storage anahtarları:

```text
workout-tracker:state
workout-tracker:state:backup
```

## Primary

Ana uygulama state'i:

```text
workout-tracker:state
```

## Backup

Son geçerli state'in kurtarma kopyası:

```text
workout-tracker:state:backup
```

## Load davranışı

Genel yaklaşım:

```text
Primary oku
→ geçerliyse kullan
→ primary bozuksa backup oku
→ backup geçerliyse recovery için kullan
→ mümkünse primary'yi backup'tan onar
```

Primary onarma write'ı tarayıcı tarafından engellense bile geçerli backup okunabilir durumda kalır.

## Save davranışı

Yeni state yazılırken:

1. Mevcut geçerli primary backup'a alınabilir.
2. Yeni state primary'ye yazılır.
3. Revision / timestamps normalize edilir.
4. State validation uygulanır.

## Storage quota

Tarayıcı LocalStorage quota hatası üretirse uygulama bunu kontrollü:

```text
QUOTA_EXCEEDED
```

StorageError koduna dönüştürebilir.

Amaç düşük seviyeli DOMException mesajını kullanıcıya doğrudan vermemektir.

---

# Veri bütünlüğü kuralları

State kabul edilmeden önce schema validation uygulanır.

## Root invariants

- `schemaVersion` pozitif integer olmalı.
- `revision` negatif olmayan integer olmalı.
- `createdAt` ISO date olmalı.
- `updatedAt` ISO date olmalı.
- `activeSessionId` null veya string olmalı.
- `sessions` object map olmalı.
- `settings` object olmalı.

## Active session invariants

`activeSessionId` doluysa:

- gerçekten `sessions` içinde bulunmalı,
- referans verilen session'ın `status` değeri `in_progress` olmalı.

## WorkoutSession invariants

- id boş olamaz.
- programId boş olamaz.
- workoutId boş olamaz.
- workoutName boş olamaz.
- programSchemaVersion pozitif integer olmalı.
- status yalnızca desteklenen üç değerden biri olmalı.
- currentExerciseIndex geçerli aralıkta olmalı.

## Set invariants

- id zorunlu.
- setNumber >= 1.
- type = `working` veya `warmup`.
- weight null veya >= 0 finite number.
- reps null veya >= 0 integer.
- RIR null veya 0–10 integer.
- timestamp alanları null veya ISO date.

## Tek aktif workout invariant'ı

Repository yeni session yaratırken mevcut `activeSessionId` varsa ikinci session başlatmayı reddeder.

## Completed session immutable davranışı

Repository yalnızca `in_progress` session'ların düzenlenmesine izin verir.

Tamamlanmış veya discard edilmiş session normal update flow üzerinden değiştirilemez.

---

# Proje mimarisi

Uygulama katmanları:

```text
┌───────────────────────────────┐
│             Views             │
│ Home / Workout / History ...  │
└───────────────┬───────────────┘
                │
┌───────────────▼───────────────┐
│           app.js              │
│ Event orchestration / UI flow │
└───────────────┬───────────────┘
                │
┌───────────────▼───────────────┐
│           Services            │
│ Workout / History / Progress  │
│ Previous / Settings / PWA ... │
└───────────────┬───────────────┘
                │
┌───────────────▼───────────────┐
│      SessionRepository        │
└───────────────┬───────────────┘
                │
┌───────────────▼───────────────┐
│        LocalStateStore        │
│ validation / backup / quota   │
└───────────────┬───────────────┘
                │
┌───────────────▼───────────────┐
│          LocalStorage         │
└───────────────────────────────┘
```

Program tarafı ayrı akar:

```text
program-data.js
    │
    ├─ workout prescription
    │
    └─ session snapshot creation

program-content.js
    │
    └─ teknik / alternatif / rehber UI
```

---

# Dosya yapısı

```text
workout-tracker-phase11/
│
├── index.html
├── manifest.webmanifest
├── sw.js
├── README.md
├── QA_REPORT.md
│
├── assets/
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
│
├── css/
│   ├── tokens.css
│   ├── base.css
│   ├── layout.css
│   └── components.css
│
├── js/
│   ├── app.js
│   ├── router.js
│   │
│   ├── components/
│   │   └── bottom-nav.js
│   │
│   ├── data/
│   │   ├── program-data.js
│   │   └── program-content.js
│   │
│   ├── models/
│   │   └── workout-session.js
│   │
│   ├── services/
│   │   ├── app-data.js
│   │   ├── data-portability-service.js
│   │   ├── history-service.js
│   │   ├── pr-service.js
│   │   ├── previous-performance-service.js
│   │   ├── progress-service.js
│   │   ├── progression-service.js
│   │   ├── pwa-service.js
│   │   ├── session-repository.js
│   │   ├── settings-service.js
│   │   ├── wake-lock-service.js
│   │   └── workout-session-service.js
│   │
│   ├── storage/
│   │   ├── index.js
│   │   ├── migrations.js
│   │   ├── schema.js
│   │   └── storage.js
│   │
│   ├── utils/
│   │   └── dates.js
│   │
│   └── views/
│       ├── history.js
│       ├── home.js
│       ├── program.js
│       ├── progress.js
│       ├── settings.js
│       └── workout.js
│
└── tests/
    ├── phase2-storage.test.mjs
    ├── phase3-today-workout.test.mjs
    ├── phase4-active-workout.test.mjs
    ├── phase5-history.test.mjs
    ├── phase6-progress-view.test.mjs
    ├── phase6-progress.test.mjs
    ├── phase7-program-content.test.mjs
    ├── phase8-gym-mode.test.mjs
    ├── phase9-pwa-assets.test.mjs
    ├── phase9-settings-backup.test.mjs
    ├── phase10-storage-resilience.test.mjs
    ├── phase10-service-worker.test.mjs
    ├── phase10-render-contract.test.mjs
    ├── phase10-release-audit.test.mjs
    ├── phase11-backup-integrity.test.mjs
    └── run-all.mjs
```

---

# Modül referansı

## `js/app.js`

Uygulamanın ana orchestration katmanıdır.

Sorumluluklar:

- route render,
- bottom navigation state,
- action event delegation,
- workout input handling,
- settings event handling,
- import/export tetikleme,
- workout start,
- set stepper,
- RIR seçimi,
- draft autosave,
- Complete Set,
- exercise navigation,
- rest timer,
- Finish Workout,
- Program bottom-sheet,
- Workout bottom-sheet,
- Wake Lock sync,
- VisualViewport / keyboard sync,
- inline notice/error,
- fatal state.

## `js/router.js`

Hash route helper.

Ana görevler:

- mevcut route'u bulmak,
- route navigate etmek,
- hash değişimlerini render fonksiyonuna bağlamak.

## `js/data/program-data.js`

Canonical workout prescription.

Burada:

- schedule,
- workout metadata,
- exercise slot,
- set sayısı,
- reps,
- RIR,
- rest,
- target muscle

saklanır.

## `js/data/program-content.js`

Uzun rehber içeriği.

- exercise details,
- alternatives,
- form tips,
- guide sections.

## `js/models/workout-session.js`

Program tanımından gerçek session snapshot üretir.

## `js/storage/schema.js`

Root state ve WorkoutSession validation kuralları.

Ayrıca:

```text
CURRENT_SCHEMA_VERSION
STORAGE_KEYS
createEmptyState
validateState
validateWorkoutSession
```

buradadır.

## `js/storage/migrations.js`

Schema migration entry point.

Şu an schema version 1 olduğu için gerçek version-to-version migration henüz yoktur; yapı gelecekte:

```text
v1 → v2
v2 → v3
```

migrasyonları eklenebilecek şekilde hazırlanmıştır.

## `js/storage/storage.js`

LocalStorage adapter.

Sorumluluklar:

- primary load,
- backup recovery,
- save,
- update,
- clear,
- validation,
- quota error normalization.

## `js/services/session-repository.js`

Session persistence domain katmanı.

Sorumluluklar:

- active session,
- session lookup,
- session list,
- create,
- update,
- complete,
- discard.

## `js/services/workout-session-service.js`

Workout business actions.

Sorumluluklar:

- start,
- resume,
- saveSetDraft,
- completeSet,
- setCurrentExercise,
- adjustRest,
- skipRest,
- setExerciseVariation,
- setExerciseNotes,
- complete,
- discard.

## `js/services/previous-performance-service.js`

Gerçek Previous eşleşmesi.

## `js/services/history-service.js`

Completed workout summary/detail.

## `js/services/progression-service.js`

Double progression değerlendirme motoru.

## `js/services/pr-service.js`

Gerçek setlerden PR türetme.

## `js/services/progress-service.js`

Progress ekranı için aggregate data.

Ayrıca 8–12 haftalık takip fazını hesaplar.

## `js/services/settings-service.js`

Boolean application preferences.

## `js/services/data-portability-service.js`

JSON export/import.

## `js/services/pwa-service.js`

- Service Worker registration,
- install prompt,
- PWA status.

## `js/services/wake-lock-service.js`

Screen Wake Lock API wrapper.

Wake Lock bir progressive enhancement'tır; desteklenmemesi workout akışını bozmaz.

## `js/services/app-data.js`

Global data layer instance:

```js
export const DATA = createWorkoutDataLayer();
```

## View dosyaları

### `home.js`

Today's Workout + weekly schedule + active workout hero.

### `workout.js`

Active Workout / scheduled workout / rest day / workout completion UI.

### `history.js`

History list + detail.

### `progress.js`

Progress overview + exercise progress detail.

### `program.js`

Workout program + guides + bottom-sheet content.

### `settings.js`

Settings + PWA + data management UI.

---

# Kurulum ve çalıştırma

Bu proje build step gerektirmez.

## Gereksinimler

Temel kullanım için:

- modern bir browser,
- statik HTTP server.

Testler için ayrıca:

- Node.js

gerekir.

## Önerilen yöntem — Python HTTP server

Proje klasöründe:

```bash
cd workout-tracker-phase11
python -m http.server 8080
```

Sonra browser:

```text
http://localhost:8080
```

## Alternatif — Node tabanlı static server

Elinde uygun bir static server varsa proje kökünü servis edebilirsin.

Önemli olan `index.html`, JS modülleri ve Service Worker'ın aynı origin altında erişilebilir olmasıdır.

## Neden dosyaya çift tıklamak önerilmiyor?

`file://` ile temel HTML/JS davranışı browser'a göre çalışabilir; ancak Service Worker register edilmez.

PWA / offline app-shell davranışını test etmek için:

```text
localhost veya HTTPS
```

kullan.

---

# Uygulamanın kullanımı

## 1. Uygulamayı aç

Home ekranı bugünkü günü haftalık programa eşler.

## 2. Workout günüyse workout'u başlat

Start işlemi gerçek session yaratır.

## 3. İlk egzersizi aç

Active Workout ekranında:

- reçete,
- Previous,
- set numarası,
- KG,
- reps,
- RIR

görülür.

## 4. Set verisini gir

Ağırlık ve tekrar alanlarında mobil numeric input kullanılır.

## 5. RIR seç

Programın hedef RIR aralığı rehber olarak görünür.

## 6. Complete Set

Set tamamlanır ve rest timer başlar.

## 7. Rest

- bekle,
- +30 sn ekle,
- veya rest'i skip et.

## 8. Sonraki set / egzersiz

Workout navigator kullanılabilir.

## 9. Teknik bilgiye ihtiyaç varsa

Active Workout içinden ilgili egzersizin teknik/alternatif bottom-sheet'i açılabilir.

## 10. Workout bitir

Eksik set varsa ve setting açıksa kullanıcıdan confirmation istenir.

## 11. History

Tamamlanan workout gerçek geçmişe eklenir.

## 12. Progress

Egzersiz bazlı performans, PR ve progression durumu gerçek geçmişten hesaplanır.

---

# Mobil UI / responsive sözleşmesi

Uygulama desktop-first değildir.

Ana hedef genişlikler:

```text
360px
375px
390px
393px
412px
430px
```

Minimum hedef:

```text
320px
```

FAZ 10 statik audit aşağıdaki genişlikleri kontrol eder:

```text
320
360
375
390
393
412
430
```

## Temel mobil kurallar

- Normal kullanımda horizontal scroll olmamalı.
- `100vw` ile gereksiz taşma oluşturulmamalı.
- Box sizing global olarak kontrol edilir.
- Bottom navigation safe-area ile uyumludur.
- Sticky workout CTA safe-area dikkate alır.
- Active Workout klasik desktop tabloya zorlanmaz.
- Ana touch target'lar küçük ikon boyutuna indirgenmez.
- Dar viewportlarda özel fallback kuralları vardır.

## Keyboard davranışı

Mobil numeric keyboard açıldığında:

- aktif input görünür tutulmaya çalışılır,
- `VisualViewport` destekleniyorsa keyboard viewport değişimi izlenir,
- sticky Complete Set keyboard inset ile uyumlu davranır.

## Safe area

Modern gesture bar / notch cihazlarında alt aksiyonların içerikle çakışmasını azaltmak için `env(safe-area-inset-bottom)` kullanılır.

---

# Accessibility

FAZ 10 erişilebilirlik geliştirmeleri içerir.

## Bottom-sheet focus return

Bottom-sheet kapatılınca focus onu açan elemente geri taşınır.

## Modal semantics

Bottom-sheet modal semantiğini açık şekilde taşır.

## Workout progress

Progress göstergesi:

```text
role="progressbar"
aria-valuemin
aria-valuemax
aria-valuenow
```

kullanır.

## Rest timer

Timer her saniye screen reader live announcement üretmez.

Tamamlandığında ayrı bir live announcement yapılır.

## Reduced motion

```css
prefers-reduced-motion: reduce
```

desteklenir.

Kod tarafında smooth scrolling de kullanıcı reduced-motion tercihine göre azaltılabilir.

## Import input

Programatik kullanılan file input gereksiz tab sırasına eklenmez.

## Inline JS

Fatal state reload gibi aksiyonlarda inline `onclick` yerine normal uygulama event sistemi kullanılır.

---

# Test altyapısı

Testler `tests/` klasöründedir.

## Tüm testler

```bash
node tests/run-all.mjs
```

Runner:

- faz testlerini çalıştırır,
- JavaScript syntax check yapar,
- relative import çözümlemesini kontrol eder,
- CSS brace kontrolü yapar.

## Faz testleri

### FAZ 2

```bash
node tests/phase2-storage.test.mjs
```

Kapsam:

- storage,
- session creation,
- activeSessionId,
- autosave,
- backup recovery,
- complete/discard lifecycle.

### FAZ 3

```bash
node tests/phase3-today-workout.test.mjs
```

Kapsam:

- gün → workout mapping,
- rest day,
- start,
- resume,
- single active session.

### FAZ 4

```bash
node tests/phase4-active-workout.test.mjs
```

Kapsam:

- Previous,
- draft,
- Complete Set,
- rest,
- exercise navigation,
- finish.

### FAZ 5

```bash
node tests/phase5-history.test.mjs
```

Kapsam:

- completed filtering,
- summary,
- duration,
- partial workout,
- detail.

### FAZ 6

```bash
node tests/phase6-progress.test.mjs
node tests/phase6-progress-view.test.mjs
```

Kapsam:

- progression,
- technique period,
- candidate logic,
- PR,
- pain review,
- Progress view contract.

### FAZ 7

```bash
node tests/phase7-program-content.test.mjs
```

Kapsam:

- 30/30 slot content parity,
- guides,
- alternatives,
- form sections.

### FAZ 8

```bash
node tests/phase8-gym-mode.test.mjs
```

Kapsam:

- Gym Mode,
- exercise info,
- workout options,
- rest UX,
- Wake Lock fallback,
- VisualViewport.

### FAZ 9

```bash
node tests/phase9-settings-backup.test.mjs
node tests/phase9-pwa-assets.test.mjs
```

Kapsam:

- settings,
- persistence,
- export/import,
- invalid backup,
- reset,
- manifest,
- SW cache assets.

### FAZ 10

```bash
node tests/phase10-storage-resilience.test.mjs
node tests/phase10-service-worker.test.mjs
node tests/phase10-render-contract.test.mjs
node tests/phase10-release-audit.test.mjs
node tests/phase11-backup-integrity.test.mjs
```

Kapsam:

- quota handling,
- backup recovery edge-case,
- Service Worker runtime behavior,
- rendered semantic contract,
- mobile layout contract,
- accessibility audit.

---

# Manuel QA kontrol listesi

Gerçek cihaz / browser üzerinde final test için aşağıdaki kontroller yapılmalıdır.

## Server

```bash
python -m http.server 8080
```

## Viewportlar

```text
360 × 800
390 × 844
393 × 873
412 × 915
430 × 932
```

Ek minimum:

```text
320px genişlik
```

## Her viewportta kontrol et

### Home

- horizontal overflow var mı?
- Today's Workout doğru mu?
- weekly chips düzgün mü?
- CTA ekran dışına taşıyor mu?

### Workout

- KG input kullanılabilir mi?
- reps input kullanılabilir mi?
- RIR target'ları en az rahat dokunulabilir mi?
- Complete Set görünür mü?
- sticky CTA gesture bar ile çakışıyor mu?
- keyboard açılınca CTA kayboluyor mu?
- rest timer taşma yapıyor mu?
- teknik bottom-sheet ekrandan taşıyor mu?

### History

- kartlar horizontal scroll oluşturuyor mu?
- uzun workout adı kırılıyor mu?
- detay sayfası okunabilir mi?

### Progress

- trend taşma yapıyor mu?
- PR kartları dar ekranda sıkışıyor mu?
- progression metni kırılıyor mu?

### Program

- workout listesi okunabilir mi?
- rehber bottom-sheet maksimum viewport yüksekliğini aşıyor mu?
- uzun teknik maddeler düzgün wrap oluyor mu?

### Settings

- toggle target'ları yeterince büyük mü?
- import/export aksiyonları çalışıyor mu?
- danger zone yanlışlıkla tetiklenebilir mi?

---

# Edge-case davranışları

## İkinci workout başlatma

Aktif session varken ikinci session oluşturulamaz.

## Sayfa yenilenmesi

`activeSessionId` sayesinde aktif workout geri bulunabilir.

## Completed set'e tekrar basma

Aynı set ikinci kez tamamlanmaya çalışılırsa servis reddeder.

## Tamamlanmış session update

Repository yalnızca `in_progress` session düzenlenmesine izin verir.

## Eksik workout finish

Setting açıksa eksik setler olduğunda confirmation gerekir.

## Bozuk primary LocalStorage

Geçerli backup varsa recovery yapılabilir.

## Primary repair başarısız

Browser write işlemini reddetse bile geçerli backup üzerinden state okunabilir.

## LocalStorage quota

Kontrollü `QUOTA_EXCEEDED` error path kullanılır.

## Geçersiz JSON import

Import reddedilir.

## Yanlış backup formatı

Workout Tracker backup formatı değilse import reddedilir.

## Desteklenmeyen backup version

Import reddedilir.

## Invalid state

Schema validation başarısızsa import gerçekleşmez.

## Wake Lock desteklenmiyor

Workout normal şekilde devam eder.

## Wake Lock request reddediliyor

Workout normal şekilde devam eder.

## Service Worker desteklenmiyor

Temel workout uygulaması yine kullanılabilir; PWA cache avantajı olmaz.

## Offline static asset

Cache varsa Service Worker asset'i cache'den verebilir.

## Offline navigation

Cache kurulmuşsa navigation cached `index.html`'e düşebilir.

---

# Privacy ve güvenlik yaklaşımı

## Hesap yok

Uygulama kullanıcı hesabı gerektirmez.

## Backend yok

Workout geçmişi varsayılan olarak bir backend'e gönderilmez.

## Yerel veri

Ana workout state'i browser LocalStorage alanında tutulur.

## Export kullanıcı kontrollü

JSON backup kullanıcı aksiyonuyla oluşturulur.

## Import kullanıcı kontrollü

Bir backup dosyası kullanıcı seçmeden içe alınmaz.

## Authentication yok

Bu nedenle uygulama cihazı kullanan kişiler arasında kullanıcı izolasyonu sağlamaz.

Paylaşılan bir cihazda browser profile/local storage erişimi olan biri workout verisini görebilir.

## Medical app değildir

Uygulama workout tracking ve program rehberi sağlar; kişisel tıbbi değerlendirme yerine geçmez.

---

# Bilinen sınırlamalar

## 1. Gerçek browser viewport otomasyonu tamamlanmadı

Geliştirme ortamındaki Chromium:

```text
ERR_BLOCKED_BY_ADMINISTRATOR
```

ile `localhost` ve `file://` navigation'larını engelledi.

Bu nedenle FAZ 10'da gerçek screenshot/overflow testi “geçti” olarak işaretlenmemiştir.

Statik layout contract testleri vardır; fakat gerçek cihaz QA hâlâ önemlidir.

## 2. FAZ 11 backup/import/export hardening tamamlandı

FAZ 11 formal audit kapatıldı. Backup katmanında hâlâ cloud sync veya multi-device otomatik yedekleme yoktur; bunlar ürün kapsamı dışındadır.

## 3. FAZ 12 formal offline validation henüz kapanmadı

PWA ve Service Worker vardır; fakat gerçek browser üzerinde:

- first install,
- first offline launch,
- update lifecycle,
- cache upgrade,
- offline workout logging,
- full reload offline

formal olarak ayrıca doğrulanmalıdır.

## 4. FAZ 13 gerçek cihaz QA bekliyor

Statik contract ve birçok edge-case testi mevcut olsa da final viewport/device QA tamamlanmalıdır.

## 5. Backend sync yok

Cihazlar arası otomatik sync yoktur.

## 6. Cloud backup yok

Export edilen JSON dosyası kullanıcı tarafından ayrıca saklanmalıdır.

## 7. Multi-user profile yok

Tek browser storage alanı tek local kullanıcı state'i olarak davranır.

## 8. Warm-up full logger yok

Schema `warmup` set tipini kabul eder; fakat Active Workout ana UI'sında ayrı detaylı warm-up set logging sistemi henüz tam bir ürün özelliği değildir.

## 9. Grafik kütüphanesi yok

Progress görünümü hafif ve framework/library bağımsız tutulmuştur. Ağır chart dependency kullanılmaz.

---

# Roadmap

## FAZ 11 — Backup / Import / Export hardening ✅

Tamamlandı. Formal acceptance kapsamı:

- export envelope kesin sözleşmesi,
- preflight import validation,
- malformed / oversized JSON,
- partially valid state,
- corrupted session/set graph,
- duplicate session/set ID,
- invalid activeSessionId,
- birden fazla in-progress session,
- lifecycle timestamp integrity,
- future schema version rejection,
- unsupported backup format version,
- dedicated pre-import safety snapshot,
- import rollback UI,
- primary write failure safety,
- export/import/restore round-trip test coverage.

## FAZ 12 — PWA + Service Worker + Offline Validation

Mevcut Service Worker harden edilecek.

Plan:

- PWA installability audit,
- first install,
- second launch,
- full offline reload,
- offline workout logging,
- refresh while offline,
- SW update lifecycle,
- cache version migration,
- stale cache cleanup,
- failed install fallback,
- failed activation fallback,
- manifest validation,
- installed standalone mode QA.

## FAZ 13 — Final mobile / edge-case / integrity QA

Viewportlar:

```text
360
390
393
412
430
```

Ek olarak:

```text
320 minimum
375
```

Test alanları:

- horizontal overflow,
- safe area,
- keyboard,
- focus,
- sticky CTA,
- bottom-sheet,
- rapid double click,
- partial set,
- interrupted workout,
- reload,
- timer recovery,
- malformed LocalStorage,
- quota exceeded,
- corrupted backup,
- incomplete finish,
- discarded session,
- Progress data integrity,
- PR integrity,
- Previous variation matching,
- full regression suite.

---

# Geliştirme kuralları

Bu projede yeni geliştirme yaparken aşağıdaki kurallar korunmalıdır.

## 1. Programı UI içine tekrar hard-code etme

Workout reçetesi için source-of-truth:

```text
js/data/program-data.js
```

olmalıdır.

## 2. Teknik içeriği workout history içine yazma

Teknik rehber source-of-truth:

```text
js/data/program-content.js
```

olmalıdır.

## 3. Fake user performance ekleme

Yasak örnek:

```js
previous: "30 kg × 10"
```

Program data veya view dosyasına demo performance yazılmamalıdır.

## 4. Session snapshot'ını koru

Geçmiş workoutlar current program objesine canlı referans vermemelidir.

Prescription snapshot korunmalıdır.

## 5. Storage schema değişirse migration ekle

Schema version artırıldığında:

```text
CURRENT_SCHEMA_VERSION
```

güncellenmeli ve `migrations.js` gerçek migration içermelidir.

## 6. State validation'ı bypass etme

Import veya storage write için raw object'i validation olmadan persist etme.

## 7. Completed workout'u sessizce mutate etme

Geçmiş veri immutable kabul edilmelidir.

## 8. Timer'ı yalnızca setInterval state'ine bağlama

Timestamp source-of-truth korunmalıdır.

## 9. “Ağırlık artır” kararını fazla otomatikleştirme

Progression candidate sonucu bile:

- teknik,
- momentum,
- eklem ağrısı

manual check gerektirir.

## 10. Mobile-first kal

Yeni UI önce 390px civarında çözülmeli.

Desktop için tasarlayıp sonra küçültme yaklaşımından kaçınılmalıdır.

## 11. Touch target küçültme

Görsel ikon küçük olabilir; etkileşim alanı küçük olmamalıdır.

## 12. PWA cache ile user data'yı karıştırma

Service Worker cache statik app-shell içindir.

Workout state LocalStorage domain'inde kalmalıdır.

---

# Sorun giderme

## Uygulama açılıyor ama PWA çalışmıyor

Muhtemel sebep:

```text
file://
```

ile açmış olman.

Çözüm:

```bash
python -m http.server 8080
```

ve:

```text
http://localhost:8080
```

kullan.

## Service Worker eski dosya gösteriyor

Cache adı faz bazında değişir.

Browser DevTools → Application → Service Workers / Cache Storage üzerinden eski cache durumunu kontrol edebilirsin.

FAZ 10 cache adı:

```text
workout-tracker-sitewise-redesign-v5
```

## Workout verisi kayboldu sanıyorum

Önce aynı browser profile/origin'i kullandığından emin ol.

LocalStorage origin bazlıdır.

Örneğin:

```text
http://localhost:8080
```

ile:

```text
http://127.0.0.1:8080
```

aynı storage origin değildir.

## Başka workout başlatamıyorum

Muhtemelen aktif bir `in_progress` session vardır.

Mevcut workout'u resume et, bitir veya discard et.

## Previous görünmüyor

Olası sebepler:

- aynı workout için daha eski completed session yok,
- ilgili egzersizde tamamlanmış set yok,
- session mevcut session'dan daha yeni,
- variation eşleşmesi uygun değil.

## PR görünmüyor

Olası sebepler:

- gerçek completed set yok,
- ilgili slot load record desteklemiyor.

## Wake Lock çalışmıyor

Wake Lock browser / platform desteğine ve izin durumuna bağlıdır.

Bu özellik progressive enhancement olduğu için workout yine çalışmalıdır.

## Import reddediliyor

Dosya:

- JSON olmayabilir,
- Workout Tracker backup formatında olmayabilir,
- formatVersion desteklenmiyor olabilir,
- state validation başarısız olabilir.

## LocalStorage dolu

Uygulama quota hatasını kontrollü şekilde ele almaya çalışır.

Eski gereksiz site verilerini temizlemek veya workout backup'ı dışarı aktardıktan sonra storage yönetimi yapmak gerekebilir.

---

# Release checklist

Aşağıdaki liste gerçek release öncesinde tamamlanmalıdır.

## Program integrity

- [ ] Upper A reçetesi source program ile eşleşiyor.
- [ ] Lower A reçetesi source program ile eşleşiyor.
- [ ] Upper B reçetesi source program ile eşleşiyor.
- [ ] Lower B reçetesi source program ile eşleşiyor.
- [ ] 30/30 rehber slotu mevcut.
- [ ] Form notları doğru slotta.
- [ ] Alternatifler doğru slotta.

## Storage

- [ ] Fresh install state açılıyor.
- [ ] Active session reload oluyor.
- [ ] Completed session history'de korunuyor.
- [ ] Primary corruption backup'tan recover oluyor.
- [ ] Quota error kontrollü.
- [ ] Export → reset → import roundtrip geçiyor.

## Active Workout

- [ ] Weight input.
- [ ] Reps input.
- [ ] RIR input.
- [ ] Draft autosave.
- [ ] Complete Set.
- [ ] Double-click protection.
- [ ] Rest timer.
- [ ] +30 saniye.
- [ ] Skip rest.
- [ ] Exercise navigation.
- [ ] Finish Workout.
- [ ] Incomplete finish confirmation.

## Previous / History / Progress

- [ ] Empty state fake data göstermiyor.
- [ ] Previous gerçek history'den geliyor.
- [ ] History yalnızca completed session gösteriyor.
- [ ] Partial workout doğru sayılıyor.
- [ ] Progress gerçek completed setlerden türetiliyor.
- [ ] PR gerçek setlerden türetiliyor.
- [ ] Assisted Pull-Up load PR varsayımı yapılmıyor.
- [ ] Progression manual technique checks korunuyor.

## Mobile

- [ ] 360 × 800.
- [ ] 390 × 844.
- [ ] 393 × 873.
- [ ] 412 × 915.
- [ ] 430 × 932.
- [ ] 320px minimum.
- [ ] Horizontal overflow yok.
- [ ] Numeric keyboard testi.
- [ ] Sticky CTA erişilebilir.
- [ ] Safe-area doğru.
- [ ] Bottom-sheet taşmıyor.

## Accessibility

- [ ] Keyboard navigation.
- [ ] Focus return.
- [ ] Progressbar semantics.
- [ ] Rest completion announcement.
- [ ] Reduced motion.
- [ ] Touch targets.

## PWA / Offline

- [ ] Manifest yükleniyor.
- [ ] Service Worker register oluyor.
- [ ] Install prompt uygun cihazda çalışıyor.
- [ ] Offline reload çalışıyor.
- [ ] Static cache update çalışıyor.
- [ ] Eski cache siliniyor.
- [ ] Offline workout logging LocalStorage ile devam ediyor.
- [ ] Online geri dönüşte app normal açılıyor.

## Test suite

- [ ] `node tests/run-all.mjs` tamamen geçiyor.
- [ ] Gerçek cihaz manuel QA tamamlandı.

---

# Son durum özeti

Workout Tracker'ın mevcut FAZ 11 sürümü:

- gerçek workout session oluşturabilir,
- gerçek set kaydedebilir,
- KG / reps / RIR saklayabilir,
- draft autosave yapabilir,
- rest timer çalıştırabilir,
- aktif workout'u reload sonrası geri getirebilir,
- gerçek Previous gösterebilir,
- tamamlanmış workout geçmişini tutabilir,
- Progress ve PR hesaplayabilir,
- double progression değerlendirmesi yapabilir,
- teknik/form rehberini gösterebilir,
- Gym Mode kullanabilir,
- destek varsa Wake Lock kullanabilir,
- local settings saklayabilir,
- JSON export/import yapabilir,
- PWA app-shell cache kullanabilir,
- storage corruption / quota edge-case'lerinin önemli kısmını yönetebilir,
- geniş regresyon test paketine sahiptir.

Buna rağmen proje henüz “tam final release” olarak değerlendirilmemelidir.

FAZ 11 backup/import/export hardening tamamlanmıştır. Roadmap'e göre sıradaki formal aşamalar:

```text
FAZ 12
PWA + Service Worker
Offline validation

FAZ 13
360 / 390 / 393 / 412 / 430 px gerçek viewport testleri
Edge-case testleri
Data integrity final audit
```

Bu üç aşama tamamlandıktan sonra proje gerçek bir **final release candidate** olarak değerlendirilmelidir.
