# Workout Tracker — FAZ 10 QA Report

## Sonuç

Bu paket **release-candidate** kalite fazıdır. Yeni workout özelliği eklemek yerine mevcut FAZ 2–9 davranışları regresyon testine alınmış ve mobil/accessibility/storage/PWA dayanıklılığı güçlendirilmiştir.

## Otomatik kabul sonucu

Aşağıdaki kontroller geçmektedir:

- FAZ 2 storage/session regresyonu
- FAZ 3 Today / Start / Resume regresyonu
- FAZ 4 Active Workout regresyonu
- FAZ 5 History regresyonu
- FAZ 6 Progress / PR / progression regresyonu
- FAZ 7 program içerik parity testi
- FAZ 8 Gym Mode / Wake Lock regresyonu
- FAZ 9 Settings / backup / PWA asset regresyonu
- FAZ 10 storage quota / backup recovery testleri
- FAZ 10 Service Worker offline davranış mock testi
- FAZ 10 rendered-view semantic sözleşme testi
- FAZ 10 mobile/accessibility release audit
- bütün JS/MJS dosyalarında `node --check`
- bütün relative JS importlarının dosya çözümlemesi
- bütün CSS dosyalarında brace dengesi

Tek komut:

```bash
node tests/run-all.mjs
```

## Mobil viewport sözleşmesi

Kontrol edilen hedef genişlikler:

```text
320
360
375
390
393
412
430
```

Statik layout sözleşmesinde:

- `100vw` kullanılmıyor.
- `viewport-fit=cover` mevcut.
- yatay taşma global olarak engelleniyor.
- bottom navigation ve sticky workout aksiyonu safe-area kullanıyor.
- 320–359px için week grid, RIR ve Active Workout düzenlerinde özel dar-ekran davranışı var.
- hesaplanan RIR touch alanı bütün hedef genişliklerde en az 44px.
- Active Workout numeric input alanı bütün hedef genişliklerde kullanılabilir genişlikte kalıyor.

## Accessibility düzeltmeleri

FAZ 10'da:

- bottom-sheet kapanınca odak açan kontrole geri dönüyor.
- bottom-sheet'lerde modal semantiği açıkça belirtiliyor.
- Active Workout progress göstergesinde `role="progressbar"` ve değer bilgileri var.
- rest timer her saniye `aria-live` ile okunmuyor; yalnızca süre tamamlandığında ayrı live region duyuru yapıyor.
- `prefers-reduced-motion: reduce` destekleniyor.
- programatik import file input tab sırasından çıkarıldı.
- fatal-state reload işlemi inline JavaScript yerine normal action sisteminden çalışıyor.

## Storage dayanıklılığı

Ek test edilen edge-case'ler:

1. Primary state bozuk + backup geçerli + browser write işlemini reddediyor:
   - geçerli backup yine okunabiliyor.
2. LocalStorage quota dolu:
   - `QUOTA_EXCEEDED` kodlu kontrollü hata oluşuyor.
   - kullanıcıya anlaşılır depolama mesajı veriliyor.
3. Save sırasında backup yazıldıktan sonra primary write başarısız:
   - son geçerli primary korunuyor.
   - backup bozulmuyor.

## PWA / offline

Service Worker runtime mock ile doğrulandı:

- install sırasında app-shell cache listesi alınır.
- eski FAZ 9 cache'i activate sırasında temizlenir.
- offline navigation cached `index.html`'e düşer.
- cached same-origin asset offline kullanılabilir.
- cross-origin istekler Service Worker tarafından ele geçirilmez.

Cache adı:

```text
workout-tracker-phase10-v1
```

## Gerçek Chromium viewport testi — ortam kısıtı

Gerçek Chromium/Playwright testi ayrıca denendi ancak bu çalışma ortamı hem `localhost` hem `file://` navigasyonlarını tarayıcı seviyesinde:

```text
ERR_BLOCKED_BY_ADMINISTRATOR
```

ile engelliyor.

Bu nedenle gerçek-browser screenshot/overflow kontrolü **geçmiş sayılmadı**. Bu bir uygulama test sonucu değil, çalışma ortamı kısıtıdır.

Yerel makinede final manuel kabul için:

1. `python -m http.server 8080`
2. Chrome DevTools Device Toolbar aç.
3. Şu viewportlarda Home, Active Workout, History, Progress, Program, Settings ekranlarını kontrol et:
   - 360×800
   - 390×844
   - 393×873
   - 412×915
   - 430×932
4. Active Workout sırasında numeric keyboard açarak sticky `Seti tamamla` erişimini kontrol et.
5. DevTools Network → Offline ile uygulamayı yenileyip app-shell'in açıldığını doğrula.
6. Keyboard ile Tab/Shift+Tab ve bottom-sheet Escape/focus-return davranışını kontrol et.

## Program bütünlüğü

FAZ 10 program reçetesini veya rehber içeriğini değiştirmez. `program-data.js` ve `program-content.js`, FAZ 9 paketindeki halleriyle korunmuştur.
