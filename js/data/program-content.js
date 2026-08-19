const exerciseDetails = {
  "upper-a-01": {
    alternatives: ["Dumbbell bench press", "Push-up"],
    techniqueSections: [{
      title: "Machine Chest Press",
      tips: [
        "Koltuğu tutacaklar yaklaşık orta göğüs hizasına gelecek şekilde ayarla.",
        "Ayakların tamamen yerde olsun.",
        "Kürek kemiklerini hafifçe geriye ve aşağı al.",
        "Dirsekleri tamamen yana açma; gövdeye yaklaşık 30–60° açı uygun.",
        "Ağırlığı iterken omuzlarını öne fırlatma.",
        "Dönüşü kontrollü yap.",
        "Göğsünü makineden koparıp belini aşırı kavislendirme.",
      ],
    }],
  },
  "upper-a-02": {
    alternatives: ["Assisted pull-up", "Band-assisted pull-up"],
    techniqueSections: [{
      title: "Lat Pulldown",
      tips: [
        "Göğsünü hafif yukarı kaldır.",
        "Omuzları kulaklardan uzak tut.",
        "Barı göğsüne çarptırma.",
        "Dirsekleri aşağıya ve hafif arkaya sür.",
        "Gövdeyi geriye savurarak momentum üretme.",
        "Üstte latların uzamasına izin ver ama omuz kontrolünü kaybetme.",
      ],
    }],
  },
  "upper-a-03": {
    alternatives: ["One-arm cable row", "Chest-supported dumbbell row"],
    techniqueSections: [{
      title: "Chest-Supported Row / Seated Row",
      tips: [
        "Göğüs destekliyse göğsünü pad'den kaldırma.",
        "Dirsekleri hareket amacına göre yaklaşık 30–60° açıyla geriye çek.",
        "Omuzları kulaklara yükseltme.",
        "En geride kürek kemiklerini kontrollü yaklaştır.",
        "Belden geriye sallanma.",
        "Negatif kısmı kontrollü yap.",
      ],
    }],
  },
  "upper-a-04": {
    alternatives: ["Neutral-grip dumbbell shoulder press", "Landmine press"],
    techniqueSections: [{
      title: "Machine Shoulder Press",
      tips: [
        "Koltuk yüksekliğini tutacaklar yaklaşık omuz hizasından başlayacak şekilde ayarla.",
        "Karnını hafif sık.",
        "Belini aşırı kavislendirme.",
        "Dirsekleri tamamen yana açmak yerine hafif önde tut.",
        "Üstte ağırlıkları çarpıştırma.",
        "Ağrısız ve kontrol edebildiğin hareket açıklığını kullan.",
      ],
    }],
  },
  "upper-a-05": {
    alternatives: ["Dumbbell lateral raise"],
    techniqueSections: [{
      title: "Cable Lateral Raise",
      tips: [
        "Hafif ağırlık seç.",
        "Omzu yukarı silkmeden kolu yana kaldır.",
        "Dirseği çok hafif bükülü tut.",
        "Ağırlığı savurma.",
        "Yaklaşık omuz hizasına kadar kontrollü kaldırmak çoğu kişi için yeterlidir.",
        "Trapezi gereksiz yere baskın hale getirmemeye çalış.",
      ],
    }],
  },
  "upper-a-06": {
    alternatives: ["Cable rear-delt fly", "Face pull"],
    techniqueSections: [{
      title: "Reverse Pec Deck",
      tips: [
        "Göğsünü pad'e sabitle.",
        "Omuzları aşağıda tut.",
        "Kollarla geriye savurmak yerine arka omuzu kullan.",
        "Çok ağır kilo seçme.",
        "Hareket sonunda boynu öne uzatma.",
      ],
    }],
  },
  "upper-a-07": {
    alternatives: ["Single-arm cable pushdown"],
    techniqueSections: [{
      title: "Rope Triceps Pushdown",
      tips: [
        "Dirsekleri gövdenin yanında sabit tut.",
        "Omuzla bastırma.",
        "Aşağıda dirseği kontrollü aç.",
        "Gövdeyi ağırlığın üzerine yığma.",
      ],
    }],
  },
  "upper-a-08": {
    alternatives: ["Cable hammer curl"],
    techniqueSections: [{
      title: "Dumbbell Hammer Curl",
      tips: [
        "Dirsekleri gövde yanında tut.",
        "Belden sallanma.",
        "Bilekleri nötr tut.",
        "Ağırlığı yukarı fırlatmak yerine kontrollü kaldır.",
      ],
    }],
  },

  "lower-a-01": {
    alternatives: ["Hack squat", "Goblet squat"],
    techniqueSections: [{
      title: "Leg Press",
      tips: [
        "Kalçanı ve belini pad'e sabit tut.",
        "Dizlerin ayak parmaklarının yönünü takip etsin.",
        "Dizleri içeri düşürme.",
        "Kontrol edemediğin kadar derine inme.",
        "Alt noktada belin yuvarlanıyorsa hareket açıklığını azalt.",
        "Dizleri tepede sert biçimde kilitleme.",
        "Ağırlığı sekerek kaldırma.",
      ],
    }],
  },
  "lower-a-02": {
    alternatives: ["Cable pull-through", "Hafif barbell RDL (teknik gözetimiyle)"],
    techniqueSections: [{
      title: "Dumbbell Romanian Deadlift",
      tips: [
        "Dizleri hafif bük.",
        "Hareketi dizleri çömelterek değil, kalçayı geriye göndererek yap.",
        "Dumbbellları bacağa yakın tut.",
        "Sırtını nötr ve kontrollü tut.",
        "Hamstringlerde gerilmeyi hissettiğin, nötr omurgayı koruyabildiğin noktada dur.",
        "Belden yuvarlanıp daha aşağı inmeye çalışma.",
        "İlk haftalarda ağırlığı özellikle konservatif tut.",
      ],
    }],
  },
  "lower-a-03": {
    alternatives: ["Swiss-ball leg curl"],
    techniqueSections: [{
      title: "Leg Curl",
      tips: [
        "Makinenin pivot noktasını diz ekleminle hizala.",
        "Kalçayı pad'den kaldırma.",
        "Tekrarı kontrollü yap.",
        "Ağırlığı hızla bırakma.",
      ],
    }],
  },
  "lower-a-04": {
    alternatives: ["Step-up", "Supported split squat"],
    techniqueSections: [{
      title: "Reverse Lunge",
      tips: [
        "Geriye kontrollü adım at.",
        "Ön ayak tamamen yerde kalsın.",
        "Ön diz ayak parmaklarının yönünde ilerlesin.",
        "Denge için gerekirse bir destekten hafifçe tutun.",
        "Ağırlıktan önce denge ve teknik.",
      ],
    }],
  },
  "lower-a-05": {
    alternatives: ["Leg-press calf raise"],
    techniqueSections: [{
      title: "Calf Raise",
      tips: [
        "Topuğu kontrollü aşağı indir.",
        "Altta kısa bir gerilme hisset.",
        "Yukarıda kontrollü yüksel.",
        "Zıplama yapma.",
      ],
    }],
  },
  "lower-a-06": {
    alternatives: ["Cable hip adduction"],
    techniqueSections: [{
      title: "Adductor",
      tips: [
        "Kalçayı koltukta sabit tut.",
        "Kontrollü hareket et.",
        "Aşırı hareket açıklığına zorlamadan rahat aralığı kullan.",
      ],
    }],
  },
  "lower-a-07": {
    alternatives: ["Dragon Fly abdominal/core makinesi", "Mat üzerinde dead bug"],
    techniqueSections: [{
      title: "ABS / Ab Crunch Machine",
      tips: [
        "Önce cihazın boyuna uygun ayarlandığından emin ol.",
        "Hareketi kalçadan sallanarak değil karın kaslarını sıkarak başlat.",
        "Boynu öne çekme.",
        "Çok ağır yük kullanma.",
        "Dragon Fly makinesinin mekanizması farklıysa ilk kullanımda salon görevlisinden doğru ayarı göstermesini iste.",
      ],
    }],
  },

  "upper-b-01": {
    alternatives: ["Incline machine chest press"],
    techniqueSections: [{
      title: "Incline Dumbbell Press",
      tips: [
        "Bench açısını aşırı dik yapma; yaklaşık düşük-orta incline kullan.",
        "Ayakları yerde sabitle.",
        "Omuzları hafifçe geriye/aşağı al.",
        "Dumbbellları kontrollü indir.",
        "Dirsekleri tamamen yana açma.",
        "Dumbbellları tepede sertçe çarpıştırma.",
      ],
    }],
  },
  "upper-b-02": {
    alternatives: ["Neutral-grip lat pulldown"],
    techniqueSections: [{
      title: "Assisted Pull-Up / Pull-Up",
      tips: [
        "Yardım makinesi varsa tekrarları düzgün yapmak için yeterli destek kullan.",
        "Omuzları kulaklardan uzaklaştır.",
        "Göğsünü bara doğru taşımayı düşün.",
        "Bacakları savurarak momentum kullanma.",
        "Boynunu bara uzatmaya çalışma.",
        "Tam kontrol kayboluyorsa seti bitir.",
      ],
    }],
  },
  "upper-b-03": {
    alternatives: ["Chest-supported row machine"],
    techniqueSections: [{
      title: "Seated Cable Row",
      tips: [
        "Gövdeyi mümkün olduğunca sabit tut.",
        "Belden ileri-geri sallanma.",
        "Dirsekleri geriye çek.",
        "Omuzları tepede silkme.",
        "Kontrollü uzama + kontrollü çekiş.",
      ],
    }],
  },
  "upper-b-04": {
    alternatives: ["Machine shoulder press"],
    techniqueSections: [{
      title: "Landmine Press",
      tips: [
        "Hafif-orta yük kullan.",
        "Kaburgaları aşırı yukarı kaldırma.",
        "Karnı hafif sık.",
        "Kolu öne-yukarı doğru kontrollü it.",
        "Omuzda sıkışma hissedersen hareket açısını değiştir veya makine press'e geç.",
      ],
    }],
  },
  "upper-b-05": {
    alternatives: ["Dumbbell lateral raise"],
    techniqueSections: [{
      title: "Cable Lateral Raise",
      tips: [
        "Hafif yük.",
        "Savurma yok.",
        "Omzu kulağa doğru çekme.",
        "Hareketi side delt ile başlat.",
      ],
    }],
  },
  "upper-b-06": {
    alternatives: ["Cable rear-delt fly"],
    techniqueSections: [{
      title: "Face Pull",
      tips: [
        "Halatı yüzün üst tarafına doğru çek.",
        "Dirsekleri kontrollü dışarı aç.",
        "Omuzları aşağıda tut.",
        "Belden geriye yaslanıp ağırlığı çekme.",
        "Çok ağır yük kullanma; amaç kontrol ve omuz çevresi kaslarıdır.",
      ],
    }],
  },
  "upper-b-07": {
    alternatives: ["Cable pushdown"],
    techniqueSections: [{
      title: "Overhead Rope Triceps Extension",
      tips: [
        "Dirsekleri mümkün olduğunca sabit tut.",
        "Belini aşırı kavislendirme.",
        "Kontrollü gerilme kullan.",
        "Dirsekte rahatsızlık varsa pushdown tercih et.",
      ],
    }],
  },
  "upper-b-08": {
    alternatives: ["Preacher curl", "Machine curl"],
    techniqueSections: [{
      title: "Incline Dumbbell Curl",
      tips: [
        "Omuzları geride ve rahat tut.",
        "Dirsekleri öne kaçırma.",
        "Ağırlığı savurma.",
        "Tam kontrol kaybolmadan seti bitir.",
      ],
    }],
  },

  "lower-b-01": {
    alternatives: ["Goblet squat", "Leg press"],
    notes: ["Hack squat yoksa leg press'i farklı bir kontrollü ayak pozisyonuyla tekrar kullanabilir veya goblet squat yapabilirsin."],
    techniqueSections: [
      {
        title: "Hack Squat",
        tips: [
          "Ayakları platformda rahat ve simetrik yerleştir.",
          "Dizleri ayak parmaklarıyla aynı yönde takip ettir.",
          "Bel/kalça pad'den ayrılmasın.",
          "Kontrol kaybolduğu derinliğe inme.",
          "Altta sekme yapma.",
        ],
      },
      {
        title: "Goblet Squat kullanıyorsan",
        tips: [
          "Dumbbellı göğse yakın tut.",
          "Ayak tabanını yerde tut.",
          "Dizlerin ayak parmakları yönünde ilerlesin.",
          "Gövdeyi kontrollü tut.",
          "Ağırlık yüzünden tekniği bozma.",
        ],
      },
    ],
  },
  "lower-b-02": {
    alternatives: ["Bodyweight glute bridge", "Dumbbell glute bridge"],
    techniqueSections: [{
      title: "Hip Thrust Machine",
      tips: [
        "Pad'i kalça kemiğinin hemen üstündeki rahat bölgeye ayarla.",
        "Yukarı çıkarken beli aşırı arkaya atma.",
        "Üst noktada kalçayı sık.",
        "Kaburgaları kontrol altında tut.",
        "Hareketi belden değil kalçadan tamamla.",
      ],
    }],
  },
  "lower-b-03": {
    alternatives: ["Lying leg curl"],
    techniqueSections: [{
      title: "Seated Leg Curl",
      tips: [
        "Diz ve makine pivotunu hizala.",
        "Kalçayı koltuktan kaldırma.",
        "Ağırlığı kontrollü indir.",
        "Hızlı/ballistik tekrar yapma.",
      ],
    }],
  },
  "lower-b-04": {
    alternatives: ["Step-up", "Split squat"],
    techniqueSections: [{
      title: "Supported Bulgarian Split Squat",
      tips: [
        "Denge için bir direğe veya makineye hafifçe tutunabilirsin.",
        "Ön ayak sağlam basmalı.",
        "Diz, ayak parmaklarının yönünde ilerlemeli.",
        "Arka bacağı gereksiz yükseğe koyma.",
        "Önce hareket kontrolü, sonra ağırlık.",
      ],
    }],
  },
  "lower-b-05": {
    alternatives: ["Leg-press calf raise"],
    techniqueSections: [{
      title: "Standing Calf Raise",
      tips: [
        "Tam kontrollü tekrar.",
        "Tepede kısa sıkma.",
        "Altta kontrollü gerilme.",
        "Zıplama yapma.",
      ],
    }],
  },
  "lower-b-06": {
    alternatives: ["Cable adduction"],
    techniqueSections: [{
      title: "Adductor Machine",
      tips: [
        "Rahat hareket açıklığı kullan.",
        "Kalçayı koltuktan çevirmeden hareket et.",
        "Ağır yük yerine kontrol.",
      ],
    }],
  },
  "lower-b-07": {
    alternatives: ["Dead bug", "Mat reverse crunch", "ABS machine"],
    techniqueSections: [{
      title: "Hanging Knee Raise / Captain's Chair",
      tips: [
        "Omuzlarını kulaklardan uzak tut.",
        "Bacakları savurma.",
        "Dizleri kontrollü kaldır.",
        "Belini kontrol et.",
        "Tutuş yorulması tekniği bozuyorsa captain's chair veya mat egzersizine geç.",
      ],
    }],
  },
};

const guideSections = {
  principles: {
    id: "principles",
    title: "Program İlkeleri & RIR",
    eyebrow: "Temel yaklaşım",
    sections: [
      {
        title: "Programın kısa mantığı",
        bullets: [
          "Her büyük kas grubunu haftada yaklaşık 2 kez çalıştırır.",
          "Çoğu çalışma setini 2–3 RIR ile bitirir.",
          "İzolasyonlarda gerektiğinde 1–2 RIR'a yaklaşır.",
          "Failure zorunlu değildir ve düzenli kullanılmaz.",
          "1RM / maksimum kaldırış denemesi içermez.",
          "Makine, cable ve dumbbell hareketlerini önceliklendirir.",
          "Bel, omuz ve dirseğe gereksiz yorgunluk ekleyen tekrarları azaltır.",
          "Aynı kas için çok sayıda benzer izolasyon yerine temel hareket modellerini kapsar.",
          "Her antrenmanı yaklaşık 60–90 dakika içinde tutmayı hedefler.",
          "İlk amaç ağırlık değil, hareket kalitesi ve tekrar edilebilir tekniktir.",
        ],
      },
      {
        title: "RIR nedir?",
        bullets: [
          "3 RIR: Form bozulmadan yaklaşık 3 tekrar daha yapabilirdin.",
          "2 RIR: Yaklaşık 2 tekrar daha yapabilirdin.",
          "1 RIR: Yaklaşık 1 tekrar daha yapabilirdin.",
          "0 RIR: Failure.",
          "Bu programın büyük kısmında 2–3 RIR kullan.",
        ],
      },
      {
        title: "Seti ne zaman bitirmelisin?",
        intro: "Hedef tekrar sayısına ulaşmamış olsan bile aşağıdakilerden biri varsa seti bitir:",
        bullets: [
          "Hareket açısı belirgin biçimde bozuluyorsa.",
          "Ağırlığı savurmaya başlıyorsan.",
          "Bel/omuz pozisyonunu koruyamıyorsan.",
          "Tekrar hızı aniden çöküyorsa.",
          "Eklemde keskin ağrı oluşuyorsa.",
        ],
      },
    ],
  },
  progression: {
    id: "progression",
    title: "Progressive Overload",
    eyebrow: "Double progression",
    sections: [
      {
        title: "Sistem",
        intro: "3 × 8–12 örneğinde önce aynı ağırlıkla tekrarları kontrollü şekilde yükselt:",
        codeLines: ["10 kg → 9 / 9 / 8", "10 kg → 10 / 10 / 9", "10 kg → 11 / 10 / 10", "10 kg → 12 / 11 / 10", "10 kg → 12 / 12 / 12"],
        outro: "Tüm çalışma setlerinde üst sınıra ulaştığında ve hâlâ hedef RIR'ı koruduğunda mevcut en küçük ağırlık artışını yap; sonra yeni ağırlıkla yaklaşık alt tekrar aralığına dön ve yeniden ilerle.",
      },
      {
        title: "Ağırlık artırma koşulları",
        bullets: [
          "Tüm setler hedef tekrar aralığında.",
          "Teknik aynı kalitede.",
          "Hedef RIR korunuyor.",
          "Eklem ağrısı yok.",
          "Son tekrarlar savrularak yapılmıyor.",
        ],
      },
      {
        title: "Konservatif progresyon",
        bullets: [
          "Üst vücut hareketlerinde en küçük mevcut ağırlık artışı yeterlidir.",
          "Alt vücut makinelerinde sırf makine izin veriyor diye büyük sıçrama yapma.",
          "Ağırlık artıramıyorsan önce tekrar, tempo ve teknik kalitesini geliştir.",
          "Her antrenmanda ağırlık artırmak zorunda değilsin.",
          "Aynı kiloda birkaç hafta kalmak başarısızlık değildir.",
        ],
      },
      {
        title: "Bir gün performans düşükse",
        intro: "Ağırlığı zorla artırma. Şunlardan biri uygulanabilir:",
        bullets: ["Aynı ağırlığı koru.", "1–2 tekrar daha az yap.", "Gerekirse küçük bir ağırlık azaltımı yap."],
      },
    ],
  },
  warmup: {
    id: "warmup",
    title: "Isınma Sistemi",
    eyebrow: "Workout öncesi",
    sections: [
      {
        title: "A) Genel ısınma — 5–10 dakika",
        intro: "Amaç yorulmak değil, vücudu antrenmana hazırlamaktır.",
        bullets: ["Yürüyüş.", "Hafif bisiklet.", "Hafif eliptik."],
      },
      {
        title: "B) Hareket spesifik hazırlık — 3–5 dakika",
        subgroups: [
          { title: "Upper günleri", bullets: ["Hafif shoulder circles.", "Çok hafif cable/band external rotation.", "Hafif row/pulldown hareketi.", "İlk press hareketinin boş/hafif versiyonu."] },
          { title: "Lower günleri", bullets: ["Bodyweight squat.", "Kontrollü hip hinge.", "Birkaç reverse lunge.", "Hafif calf raise."] },
        ],
        outro: "Uzun ve yorucu bir mobilite rutini gerekli değildir.",
      },
      {
        title: "C) İlk compound için 2–3 hazırlık seti",
        intro: "Örneğin çalışma ağırlığın 30 kg chest press ise:",
        codeLines: ["Hazırlık 1: çok hafif × 10", "Hazırlık 2: orta-hafif × 6–8", "Hazırlık 3: çalışma ağırlığına yakın × 3–5", "Sonra çalışma setleri"],
        bullets: [
          "Hazırlık setleri haftalık hacme dahil değildir.",
          "Hazırlık setlerinde failure'a yaklaşma.",
          "İkinci büyük compound hareket için gerekirse 1–2 kısa hazırlık seti yeterlidir.",
        ],
      },
    ],
  },
  recovery: {
    id: "recovery",
    title: "Recovery & Deload",
    eyebrow: "Toparlanma",
    sections: [
      {
        title: "Aynı kas grubunun toparlanması",
        bullets: ["Upper → yaklaşık 72 saat → Upper.", "Lower → yaklaşık 72 saat → Lower.", "Pazartesi/Perşembe ve Salı/Cuma düzeni toparlanma açısından kullanışlıdır."],
      },
      {
        title: "Uyku",
        bullets: ["Düzenli uyku saatine önem ver.", "Gece uykusunu antrenman uğruna kısaltma.", "Birkaç gece kötü uyuduysan o gün progresyon zorlamamak mantıklıdır."],
      },
      {
        title: "Dinlenme günleri",
        intro: "Çarşamba, Cumartesi ve Pazar günleri:",
        bullets: ["Normal günlük hareket.", "Rahat yürüyüş.", "Hafif mobilite."],
        outro: "Dinlenme günlerini ikinci bir ağır antrenmana çevirmek zorunda değilsin.",
      },
      {
        title: "Ne zaman hacmi azaltmalısın?",
        intro: "Aşağıdakiler birkaç antrenman üst üste devam ederse 1 hafta boyunca çalışma setlerini yaklaşık %30–50 azalt ve ağırlıkları zorlamadan çalış:",
        bullets: [
          "Aynı hareketlerde belirgin performans düşüşü.",
          "Normalden uzun süren kas yorgunluğu.",
          "Sürekli ağır/bitkin hissetme.",
          "Motivasyonda belirgin düşüş.",
          "Eklem veya tendon hassasiyeti.",
          "Teknik kalitesinde gerileme.",
        ],
        outro: "Her 4 haftada otomatik deload zorunlu değildir; ihtiyaca göre yapılabilir.",
      },
      {
        title: "Normal kas yorgunluğu vs. ağrı",
        subgroups: [
          { title: "Genellikle normal olabilen", bullets: ["Kas içinde yaygın yorgunluk.", "Hafif/orta kas hassasiyeti.", "Antrenmandan sonraki kas sertliği."] },
          { title: "Seti durdurman gereken", bullets: ["Keskin/batma şeklinde ağrı.", "Eklem içinde ağrı.", "Ani bel ağrısı.", "Uyuşma.", "Hareketle giderek artan alışılmadık ağrı."] },
        ],
        outro: "Bu tür ağrılarda hareketi zorlayarak devam etme. Devam eden veya ciddi ağrıyı bir ebeveyn/veliyle paylaş ve uygun sağlık profesyoneline değerlendirt.",
      },
      {
        title: "Beslenme yaklaşımı",
        bullets: [
          "Agresif bulk/cut yapma.",
          "Aşırı kalori kısıtlama.",
          "Hızlı kilo değiştirmeye çalışma.",
          "Düzenli ve yeterli öğünler ye.",
          "Büyüme ve günlük aktiviteler için yeterli enerji al.",
          "Çeşitli protein kaynakları, karbonhidratlar, sağlıklı yağlar, meyve/sebze ve sıvı tüket.",
        ],
        outro: "Kilo veya görüntü hedefi uğruna büyümeyi ve okul/günlük enerjiyi bozacak diyet uygulanmamalıdır.",
      },
    ],
  },
  safety: {
    id: "safety",
    title: "Güvenlik",
    eyebrow: "Temel kurallar",
    sections: [{
      title: "Temel güvenlik prensipleri",
      bullets: [
        "Teknik > ağırlık.",
        "Maksimum kaldırış denemesi yok.",
        "Sürekli failure yok.",
        "Çoğu set 2–3 RIR.",
        "İzolasyonlarda gerektiğinde 1–2 RIR.",
        "Form bozulduğunda set biter.",
        "Ağrı üzerinden çalışılmaz.",
        "Yeni/karmaşık hareketlerin ilk uygulamalarında uygun gözetim önemlidir.",
        "Bir hareket sana uygun değilse aynı hareket modelindeki güvenli alternatifi seç.",
        "Uzun vadeli gelişim, tek bir antrenmanda ne kadar yorulduğundan daha önemlidir.",
      ],
    }, {
      title: "Kaynak çerçevesi",
      intro: "Programın güvenlik yaklaşımı; gençlerde uygun gözetim, yaşa uygun direnç antrenmanı, teknik önceliği ve maksimum kaldırışlardan kaçınma konularında ACSM, NSCA ve AAP / HealthyChildren.org tarafından yayımlanan genç direnç antrenmanı rehberleriyle uyumlu olacak şekilde hazırlanmıştır.",
      outro: "Bu program kişisel tıbbi değerlendirme yerine geçmez. Bilinen bir sağlık sorunun, önceki ciddi sakatlığın veya egzersizle ortaya çıkan ağrın varsa antrenmana uygunluk için ebeveyn/veli ve uygun bir sağlık profesyoneliyle görüş.",
    }],
  },
};

export const PROGRAM_CONTENT = deepFreeze({ exerciseDetails, guideSections });

export function getExerciseDetail(slotId) {
  return PROGRAM_CONTENT.exerciseDetails[slotId] ?? null;
}

export function getGuideSection(guideId) {
  return PROGRAM_CONTENT.guideSections[guideId] ?? null;
}

export function getGuideList() {
  return Object.values(PROGRAM_CONTENT.guideSections);
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}
