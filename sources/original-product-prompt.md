# 2. MOBILE-FIRST — TELEFON ANA PLATFORM

Bu uygulamanın ana kullanım cihazı **telefon** olacaktır.

Desktop ikinci plandadır.

Uygulamayı tasarlarken temel kabul:

> Kullanıcı bu uygulamayı spor salonunda, çoğunlukla tek eliyle ve telefon ekranından kullanacaktır.

Bu nedenle bütün UI/UX kararlarını önce mobil ekran için ver.

## Ana hedef ekran genişlikleri

Özellikle şu genişliklerde kusursuz çalışmalıdır:

```text
360px
375px
390px
393px
412px
430px
```

Minimum destek:

```text
320px
```

Tablet ve desktop desteği daha sonra responsive olarak genişletilebilir.

---

## MOBILE-FIRST CSS

CSS'i desktop'tan küçültme mantığıyla yazma.

Önce mobil tasarla:

```css
/* Mobile base styles */
.component {
}

/* Tablet */
@media (min-width: 768px) {
}

/* Desktop */
@media (min-width: 1024px) {
}
```

Ana CSS varsayılan olarak telefon görünümünü temsil etsin.

---

# TELEFONDA YATAY TAŞMA YASAK

Normal kullanım sırasında:

```text
horizontal scrolling
```

olmamalıdır.

Özellikle:

- Active Workout
- set satırları
- dashboard
- history
- exercise cards
- modals
- charts

360px ekrana düzgün sığmalıdır.

`width: 100vw` yüzünden taşma oluşturmamaya dikkat et.

Gerekirse:

```css
box-sizing: border-box;
max-width: 100%;
min-width: 0;
```

kullan.

---

# ACTIVE WORKOUT MOBİL TASARIMI

Uygulamanın en önemli ekranı Active Workout olduğu için bu ekran özellikle telefon için optimize edilmelidir.

Mobil görünüm örneği:

```text
←       UPPER A         ⋮

Exercise 2 / 8
████████░░░░

LAT PULLDOWN

3 × 8–12
RIR 2–3
Rest 2–3 min

LAST TIME
30 × 10
30 × 9
30 × 9

SET 1

KG
[ − ] [ 30 ] [ + ]

REPS
[ − ] [ 10 ] [ + ]

RIR
[ 3 ] [ 2 ] [ 1 ]

[ ✓ COMPLETE SET ]

Rest Timer
02:30
```

360px ekranda sıkışık bir Excel tablosu oluşturmaktansa gerektiğinde her seti ayrı mobil kart olarak göster.

---

# DESKTOP TABLOSU MOBİLE ZORLA SIĞDIRILMAMALI

Desktop'ta:

```text
SET | PREVIOUS | KG | REPS | RIR | ✓
```

tablosu kullanılabilir.

Ancak küçük telefonda bu tablo okunmaz hale geliyorsa responsive olarak kart düzenine dönüşsün.

Örneğin:

```text
SET 2

Previous
30kg × 9

Weight
[ - ] 30kg [ + ]

Reps
[ - ] 10 [ + ]

RIR
[ 2 ]

[ COMPLETE ]
```

Amaç desktop düzenini küçültmek değil, gerçekten mobil kullanım için yeniden düzenlemektir.

---

# TEK ELLE KULLANIM

En sık kullanılan kontroller ekranın özellikle alt ve orta bölümünde olsun.

Önemli aksiyonları ekranın en üst köşelerine koyma.

Özellikle:

```text
Complete Set
Start Workout
Next Exercise
Finish Workout
Rest Timer controls
```

başparmakla kolay erişilebilmelidir.

---

# TOUCH TARGET

Tıklanabilir alanlar minimum:

```text
44 × 44 px
```

tercihen ana aksiyonlarda:

```text
48–56 px
```

yüksekliğinde olsun.

Çok küçük:

```text
+
-
✓
```

ikonları yapma.

Butonun görsel ikonu küçük olabilir ancak touch alanı büyük olmalıdır.

---

# INPUT TASARIMI

Kullanıcı spor salonunda hızlı veri girecek.

Bu nedenle küçük klasik HTML inputlar kullanma.

Örneğin:

```text
WEIGHT

[ − ]      30 kg      [ + ]
```

ve:

```text
REPS

[ − ]       10        [ + ]
```

gibi büyük kontroller tercih et.

Input'a dokununca mobil numeric keyboard açılsın.

Uygun yerlerde:

```html
inputmode="decimal"
```

veya:

```html
inputmode="numeric"
```

kullan.

---

# MOBİL KLAVYE

Klavyenin ekranın yarısını kaplayabileceğini hesaba kat.

Input focus olduğunda:

- Complete Set butonu tamamen kaybolmamalı
- aktif input görünür kalmalı
- sayfa anlamsız şekilde zıplamamalı

Gerekirse aktif input:

```javascript
element.scrollIntoView({
  behavior: "smooth",
  block: "center"
});
```

mantığıyla görünür tutulabilir.

---

# BOTTOM NAVIGATION

Telefonda ana navigation alt tarafta sabit olsun.

Örneğin:

```text
Home
Workout
History
Progress
Program
```

Icon + kısa label kullan.

Bottom navigation:

- kolay ulaşılabilir
- safe-area uyumlu
- içerikle çakışmayan

olmalıdır.

---

# SAFE AREA

Modern telefonlarda notch ve gesture bar alanlarını hesaba kat.

Örneğin:

```css
padding-bottom:
calc(16px + env(safe-area-inset-bottom));
```

gibi safe-area desteği kullan.

Özellikle:

- bottom navigation
- sticky Complete Set
- Finish Workout
- modal / bottom sheet

alanlarında.

---

# STICKY WORKOUT ACTION

Active Workout ekranında ana aksiyon gerektiğinde ekranın altında sticky olabilir.

Örneğin:

```text
┌─────────────────────────┐
│     ✓ COMPLETE SET      │
└─────────────────────────┘
```

Kullanıcının her sette ekranın altına/üstüne scroll yapması gerekmesin.

---

# BOTTOM SHEET KULLAN

Telefonda küçük popup yerine mümkün olduğunda bottom sheet tercih et.

Örneğin:

- exercise info
- exercise alternatives
- notes
- machine settings
- RIR açıklaması
- workout options

alttan açılan panel şeklinde gösterilebilir.

---

# MODAL BOYUTLARI

Mobil modal hiçbir zaman ekran dışına taşmamalıdır.

Maksimum:

```css
max-height: 85dvh;
overflow-y: auto;
```

gibi bir sistem kullanılabilir.

`100vh` yerine uygun yerlerde modern:

```text
dvh
svh
```

birimleri değerlendir.

---

# MOBİL HEADER

Header sade olsun.

Örneğin:

```text
← Upper A            ⋮
```

Büyük desktop navbar'ını telefona sıkıştırma.

---

# SCROLL DAVRANIŞI

Bir workout sırasında kullanıcı gereksiz yere sürekli yukarı/aşağı kaydırmak zorunda kalmamalı.

Mevcut egzersiz ekranın ana odağı olsun.

Tamamlanan egzersizler gerekirse collapse edilsin.

---

# GYM MODE

Gym Mode telefon deneyimine özel optimize edilsin.

Gym Mode açıkken:

- bottom navigation gizlenebilir
- büyük font kullan
- mevcut egzersizi merkeze al
- büyük KG / REPS kontrolleri göster
- büyük Complete Set butonu göster
- ekran karmaşasını azalt
- ekranın uykuya geçmesini engellemek için destek varsa Wake Lock API değerlendir

Örneğin:

```javascript
navigator.wakeLock
```

desteklenmiyorsa uygulama hata vermemeli.

---

# TELEFONDA FONT BOYUTLARI

Okunabilirlik öncelikli.

Yaklaşık:

```text
Body:           15–16px
Secondary:      13–14px
Input values:   20–28px
Exercise title: 20–24px
Primary CTA:    16–18px
```

10–11px gibi aşırı küçük metin kullanma.

---

# VIEWPORT

HTML'de doğru viewport bulunmalı:

```html
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, viewport-fit=cover"
/>
```

---

# RESPONSIVE CHARTS

Progress grafiklerinin genişliği:

```text
width: 100%
```

olmalı.

Grafik 360px cihazda taşmamalıdır.

Etiket sayısı fazlaysa bütün tarihleri aynı anda göstermeye çalışma.

---

# HISTORY MOBİL TASARIMI

History satırlarını tablo haline getirme.

Mobil kart/list item kullan.

Örneğin:

```text
17 AUG

Upper A
17 sets • 71 min

Completed
>
```

---

# DASHBOARD MOBİL TASARIMI

Mobil dashboard bir desktop analytics paneline benzememeli.

Öncelik:

```text
Today's Workout

Upper A
8 exercises

[ START WORKOUT ]
```

Sonrasında:

```text
Weekly Progress
Last Workout
Recent Progress
```

gelsin.

Ana CTA ilk ekran yüksekliğinde görünür olsun.

---

# PERFORMANCE HEDEFİ

Orta seviye Android telefonlarda akıcı çalışmalıdır.

Bu nedenle:

- gereksiz blur kullanma
- çok ağır box-shadow kullanma
- onlarca eşzamanlı animasyon kullanma
- sürekli çalışan JavaScript animation loop kullanma

CSS transition tercih et.

---

# MOBİL TEST ZORUNLULUĞU

Projeyi tamamlamadan önce özellikle şu viewportlarda test et:

```text
360 × 800
390 × 844
393 × 873
412 × 915
430 × 932
```

Her birinde kontrol et:

- horizontal overflow var mı?
- navigation doğru mu?
- Complete Set kolay erişiliyor mu?
- inputs rahat kullanılabiliyor mu?
- keyboard UI'ı bozuyor mu?
- modal ekrandan taşıyor mu?
- bottom navigation içerikle çakışıyor mu?
- text kesiliyor mu?
- Active Workout tek elle kullanılabilir mi?

Desktop görünümünün düzgün olması tek başına kabul kriteri değildir.

**Mobil görünüm kusursuz değilse uygulama tamamlanmış sayılmamalıdır.**

---

# EN ÖNEMLİ MOBILE UX PRENSİBİ

Bu uygulamayı:

> “Desktop web sitesi telefonda da açılıyor.”

şeklinde tasarlama.

Şu şekilde tasarla:

> “Bu bir telefon workout uygulaması; desktop desteği sonradan eklenmiş.”

Her tasarım kararında önce:

```text
Bu özellik 390px genişliğindeki telefonda,
spor salonunda tek elle rahat kullanılabilir mi?
```

sorusunu sor.

Cevap hayırsa tasarımı değiştir.