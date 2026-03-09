// Turkish translations — all strings with proper Turkish characters
const tr = {
    // ─── Common ─────────────────────────────────────────────
    common: {
        save: 'KAYDET',
        cancel: 'İptal',
        edit: 'Düzenle',
        done: 'Bitti',
        add: 'Ekle',
        delete: 'Sil',
        confirm: 'Onayla',
        back: '←',
        next: 'Devam Et',
        start: 'Başlayalım!',
        great: 'HARİKA!',
        nextBadge: 'SONRAKİ →',
        kcal: 'kcal',
        protein: 'Protein',
        carbs: 'Karbonhidrat',
        fat: 'Yağ',
        or: 'veya detaylı gir',
    },

    // ─── Splash ─────────────────────────────────────────────
    splash: {
        tagline: 'AKILLI BESİN TAKİBİ',
        motto: 'Sağlıklı yaşam, her lokmada 🌿',
    },

    // ─── Welcome ────────────────────────────────────────────
    welcome: {
        title: "NutriTrack'e Hoş Geldin",
        subtitle: 'Akıllı beslenme asistanın',
        selectLanguage: 'Dilini seç',
        enterName: 'Sana ne diyelim?',
        namePlaceholder: 'Adın',
        getStarted: 'Hadi Başlayalım',
    },

    // ─── Onboarding ─────────────────────────────────────────
    onboarding: {
        steps: [
            { title: 'Hedefini Belirle', subtitle: 'Sana en uygun planı oluşturalım' },
            { title: 'Vücut Tipini Seç', subtitle: 'Metabolizma hızını anlamamıza yardımcı olur' },
            { title: 'Kendini Tanıt', subtitle: 'Doğru hesaplama için bize biraz bilgi ver' },
            { title: 'Ölçülerini Gir', subtitle: 'Kişiselleştirilmiş hedefler için gerekli' },
            { title: 'Aktivite Seviyeni Seç', subtitle: 'Günlük enerji ihtiyacını hesaplayalım' },
            { title: 'Avatar Seç', subtitle: 'Uygulamada nasıl görünmek istersin?' },
        ],
        stepIcons: ['🎯', '🧬', '👤', '📏', '⚡', '🎨'],
        goals: {
            lose: { label: 'Kilo Ver', desc: 'Sağlıklı şekilde kilo ver' },
            maintain: { label: 'Kilonu Koru', desc: 'Mevcut kilomu korumak istiyorum' },
            gain: { label: 'Kilo Al', desc: 'Kas kütlesi ve kilo kazanımı' },
        },
        bodyTypes: {
            ectomorph: { label: 'Ektomorf', desc: 'Kilo almakta zorlanıyorum' },
            mesomorph: { label: 'Mezomorf', desc: 'Kolayca kilo alıp verebiliyorum' },
            endomorph: { label: 'Endomorf', desc: 'Kilo vermekte zorlanıyorum' },
            unsure: { label: 'Yeniyim', desc: 'Bu işte yeniyim ve bilmiyorum' },
        },
        gender: 'Cinsiyet',
        male: 'Erkek',
        female: 'Kadın',
        age: 'Yaş',
        ageUnit: 'yıl',
        height: 'Boy',
        heightUnit: 'cm',
        weight: 'Kilo',
        weightUnit: 'kg',
        targetWeight: 'Hedef Kilo',
        celebration: 'Harika!',
        preparing: 'Planın hazırlanıyor...',
        avatarTitle: 'Bir avatar seç veya kendi fotoğrafını yükle',
    },

    // ─── Activity Levels ────────────────────────────────────
    activity: {
        label: 'Aktivite',
        sedentary: { label: 'Hareketsiz', desc: 'Masa başı iş, az hareket' },
        light: { label: 'Hafif Aktif', desc: 'Hafif yürüyüş, hafif egzersiz' },
        moderate: { label: 'Orta Aktif', desc: 'Haftada 3-5 gün egzersiz' },
        active: { label: 'Çok Aktif', desc: 'Yoğun günlük antrenman' },
        extra: { label: 'Profesyonel', desc: 'Günde 2+ saat yoğun spor' },
    },

    // ─── Dashboard ──────────────────────────────────────────
    dashboard: {
        greetingMorning: 'Günaydın',
        greetingAfternoon: 'İyi öğleden sonra',
        greetingEvening: 'İyi akşamlar',
        todaySummary: 'Bugünün Özeti',
        target: 'Hedef',
        remaining: 'Kalan',
        eaten: 'yenildi',
        meals: 'Öğünler',
        addMeal: '+ Öğün Ekle',
        aiScan: '📸 AI ile Tara',
        noMeals: 'Henüz öğün eklenmedi',
        deleteMeal: 'Öğünü silmek istediğinize emin misiniz?',
        motivation: {
            low: 'Güne enerjik başla! 💪',
            mid: 'Harika gidiyorsun! 🔥',
            high: 'Hedefe çok yakınsın! 🎯',
            done: 'Günlük hedefini tamamladın! 🎉',
            over: 'Hedefi aştın, dikkatli ol! ⚠️',
        },
        goalReachedDesc: 'Günlük hedefini tamamladın. İstikrarını koru!',
    },

    // ─── Tabs ───────────────────────────────────────────────
    tabs: {
        daily: 'Günlük',
        water: 'Su',
        calendar: 'Takvim',
        profile: 'Profil',
    },

    // ─── Water Tracker ──────────────────────────────────────
    water: {
        title: 'Su Takibi',
        glasses: 'bardak',
        mlDrank: 'ml içildi',
        mlLeft: 'ml kaldı',
        messages: {
            start: 'Hadi ilk bardağını iç! 🥛',
            low: 'İyi başlangıç, devam et!',
            mid: 'Harika gidiyorsun! 💪',
            high: 'Yarısından fazlasını içtin!',
            almost: 'Neredeyse hedefe ulaştın! 🎯',
            done: 'Günlük hedefini tamamladın! 🎉',
        },
    },

    // ─── Calendar ───────────────────────────────────────────
    calendar: {
        title: 'Takvim',
        subtitle: 'Geçmiş günlerin öğünlerini gör ve düzenle',
        today: 'Bugün',
        addMeal: 'Öğün Ekle',
        quickAdd: 'Hızlı Ekle',
        noRecord: 'Bu güne kayıt yok.\nÖğün ekleyebilirsin.',
        futureDate: 'Gelecek tarihe kayıt eklenemez.',
        mealName: 'Yemek adı',
        dayNames: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
        monthNames: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
            'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
    },

    // ─── Manual Entry ───────────────────────────────────────
    manual: {
        title: 'Öğün Ekle',
        search: '🔍 Yemek ara...',
        results: 'Sonuçlar',
        noResults: 'Sonuç bulunamadı',
        favorites: '❤️ Favoriler',
        popular: 'Popüler',
        mealName: 'Yemek Adı',
        caloriesLabel: 'Kalori (kcal) *',
        proteinLabel: 'Protein (g)',
        carbsLabel: 'Karb. (g)',
        fatLabel: 'Yağ (g)',
        addButton: 'ÖĞÜNÜ EKLE ✓',
        added: '✓ Eklendi!',
        meals: 'öğün',
        portion: 'porsiyon',
        selectPortion: 'Porsiyon Seç',
        mealCategory: 'Öğün',
        example: 'Örn: Izgara Tavuk',
    },

    // ─── Camera / AI ────────────────────────────────────────
    camera: {
        title: 'AI ile Tara',
        scanning: 'Analiz ediliyor...',
        takePhoto: 'Fotoğraf Çek',
        retake: 'Tekrar Çek',
        gallery: 'Galeri',
        analyze: 'Analiz Et',
        aiRecognition: 'AI Yemek Tanıma',
        frameFood: 'Yemeği çerçeveye al',
        detecting: 'Yemek ve porsiyon tespit ediliyor',
        cameraLoading: 'Kamera yükleniyor...',
        cameraPermission: 'Kamera İzni Gerekli',
        cameraPermissionDesc: 'Yediğin yemeği AI ile tanımak için kamerana ihtiyacımız var.',
        grantAccess: 'Kamera İzni Ver',
        pickGallery: 'Galeriden Seç',
        goBack: 'Geri Dön',
        apiMissing: 'API Anahtarı Eksik',
        apiMissingDesc: 'Google AI API anahtarı .env dosyasında bulunamadı.',
        timeout: 'Zaman Aşımı',
        timeoutDesc: 'AI servisi 30 saniye içinde yanıt vermedi. Lütfen tekrar deneyin.',
        aiError: 'AI Analiz Hatası',
        aiErrorDesc: 'Google AI servisine bağlanırken hata oluştu.',
        error: 'Hata',
        cameraError: 'Kamera hatası oluştu. Galeriden seçmeyi deneyin.',
        photoError: 'Fotoğraf çekilemedi. Galeriden seçmeyi deneyin.',
        galleryError: 'Galeri açılamadı.',
        prompt: `Sen esprili ve samimi bir diyetisyensin. Bu fotoğraftaki yemeği tanı ve besin değerlerini (ortalama porsiyon) döndür.
SADECE JSON FORMATINDA YANIT VER. Markdown kullanma, sadece geçerli bir JSON objesi döndür.
Eğer fotoğrafta yemek yoksa "Belirsiz" yaz, değerlere 0 ver ve comment'te ne gördüğünü esprili şekilde açıkla.
comment alanında kısa, esprili ve samimi bir yorum yap (emoji kullanabilirsin). Abartma ama eğlenceli ol.
Tüm yanıtı TÜRKÇE olarak ver.
Beklenen JSON formatı:
{
  "name": "Yemek Adı",
  "calories": 400,
  "protein": 20,
  "carbs": 30,
  "fat": 15,
  "comment": "Esprili ve samimi bir AI yorumu 😋"
}`,
    },

    // ─── Meal Detail ────────────────────────────────────────
    mealDetail: {
        aiComment: '🤖 AI Yorumu',
        nutrients: 'Besin Değerleri',
        addToLog: 'Öğüne Ekle',
        close: 'Kapat',
        aiDetection: 'AI Tespiti',
        mediumPortion: 'Orta Porsiyon',
        noPhoto: 'Fotoğraf Yok',
        fallbackName: 'Yemek analiz edildi.',
    },

    // ─── Profile ────────────────────────────────────────────
    profile: {
        title: 'Profil',
        dayStreak: 'Gün Seri',
        badges: 'Rozet',
        meals: 'Öğün',
        dailyTarget: 'Günlük Kalori Hedefi',
        calculated: 'Fiziksel özelliklerine göre hesaplandı',
        achievements: 'Başarımlar',
        editInfo: 'Bilgilerini Düzenle',
        language: 'Dil Seçimi',
        turkish: 'Türkçe',
        english: 'English',
        changeAvatar: 'Avatarı Değiştir',
        chooseFromGallery: 'Galeriden Seç',
    },

    // ─── Badges ─────────────────────────────────────────────
    badges: {
        newBadge: 'Yeni Rozet!',
        first_meal: { name: 'İlk Adım', desc: 'İlk yemeğini kaydettin!' },
        streak_3: { name: 'İstikrarlı', desc: '3 gün üst üste takip' },
        streak_7: { name: 'Hafta Savaşçısı', desc: '7 günlük seri!' },
        streak_14: { name: 'Alışkanlık Ustası', desc: '14 gün aralıksız takip' },
        streak_30: { name: 'Demir İrade', desc: '30 gün boyunca her gün!' },
        streak_60: { name: 'Altın Seri', desc: '60 gün aralıksız! Efsane oluyorsun' },
        streak_90: { name: 'Platin Seri', desc: '90 günlük seri — gerçek bir şampiyon!' },
        protein_master: { name: 'Protein Şefi', desc: 'Günlük protein hedefini tamamla' },
        carb_loader: { name: 'Enerji Deposu', desc: 'Karbonhidrat hedefini doldur' },
        fat_balance: { name: 'Yağ Dengesi', desc: 'Yağ hedefini yakala' },
        macro_perfect: { name: 'Mükemmel Denge', desc: 'Tüm makro hedeflerini aynı gün tamamla' },
        cal_500: { name: 'Başlangıç', desc: 'Bir günde 500+ kcal kaydet' },
        cal_1000: { name: 'Bilinçli Beslenme', desc: 'Bir günde 1000+ kcal kaydet' },
        cal_1500: { name: 'Takip Uzmanı', desc: 'Bir günde 1500+ kcal takip et' },
        cal_2000: { name: 'Tam Gaz', desc: 'Bir günde 2000+ kcal kayıt' },
        goal_reached: { name: 'Hedefe Ulaştın!', desc: 'Günlük kalori hedefini doldur' },
        early_bird: { name: 'Erken Kuş', desc: "Sabah 8'den önce öğün ekle" },
        night_owl: { name: 'Gece Kuşu', desc: "Gece 22'den sonra kayıt yap" },
        water_champ: { name: 'Su Şampiyonu', desc: 'Günde 8 bardak su iç' },
        meal_logger_5: { name: 'Kayıt Meraklısı', desc: 'Bir günde 5 öğün kaydet' },
        variety_king: { name: 'Çeşitlilik Kralı', desc: '4 farklı öğün kategorisi kullan' },
        weekend_warrior: { name: 'Hafta Sonu Savaşçısı', desc: 'Hafta sonu da takip et' },
        breakfast_lover: { name: 'Kahvaltı Aşığı', desc: "Sabah 10'dan önce öğün ekle" },
        light_eater: { name: 'Hafif Öğün', desc: '300 kcal altı bir öğün kaydet' },
    },

    // ─── Meal Categories ────────────────────────────────────
    mealCategories: {
        breakfast: 'Kahvaltı',
        lunch: 'Öğle',
        dinner: 'Akşam',
        snack: 'Atıştırma',
    },

    // ─── Food Database Categories ───────────────────────────
    foodCategories: {
        breakfast: 'Kahvaltılık',
        protein: 'Protein',
        carbs: 'Tahıllar',
        dairy: 'Süt Ürünleri',
        fruits: 'Meyveler',
        vegetables: 'Sebzeler',
        soups: 'Çorbalar',
        snacks: 'Atıştırmalık',
        drinks: 'İçecekler',
        fastfood: 'Fast Food',
        desserts: 'Tatlılar',
        salads: 'Salatalar',
        seafood: 'Deniz Ürünleri',
        international: 'Dünya Mutfağı',
        sauces: 'Soslar & Ekstra',
    },

    // ─── Weekly Chart ───────────────────────────────────────
    weeklyChart: {
        title: 'Haftalık Özet',
        average: 'Haftalık Ort:',
        dayLabels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
    },

    // ─── Streak Labels ──────────────────────────────────────
    streak: {
        legendary: 'Efsanevi',
        super: 'Süper',
        hot: 'Ateşli',
        good: 'İyi',
    },

    // ─── Fallback meal name ─────────────────────────────────
    fallback: {
        mealName: 'Öğün',
        manualEntry: 'Manuel Giriş',
    },
};

export default tr;
export type TranslationKeys = typeof tr;
