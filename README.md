# 🍏 NutriTrack - AI Destekli Kalori ve Sağlık Takipçisi

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/AI_Powered-Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

NutriTrack, kullanıcıların günlük kalori, makro besin (protein, karbonhidrat, yağ) ve su tüketimlerini takip etmelerini sağlayan, yapay zeka destekli modern bir sağlık ve beslenme uygulamasıdır. Gelişmiş dil desteği sayesinde (İngilizce 🇬🇧 / Türkçe 🇹🇷) arayüzde kolayca gezinebilirsiniz.

Kullanıcılar kamera ile yemeklerini çekerek anında saniyeler içinde kalori ve makro değerlerini öğrenebilir, günlük hedeflerine ulaştıkça rozetler kazanarak oyunlaştırma (gamification) dinamikleriyle (animasyonlu su bardakları, yanıp sönen alev serileri vb.) sürekli motive olabilirler. Eğlenceli galeri üzerinden kendilerine özel avatarlar seçerek uygulamayı tamamen kişiselleştirebilirler.

---

## ✨ Öne Çıkan Özellikler

- **🤖 AI Kamera ile Yemek Tanıma:** Yemeğinizin fotoğrafını çekin veya galeriden seçin, yapay zeka yemeğin adını ve besin değerlerini (Kalori, Protein, Karb, Yağ) otomatik çıkarsın. (Google Gemini 2.5 Flash modeli tabanlıdır).
- **🌍 Çift Dil Desteği:** Türkçe ve İngilizce dil seçenekleriyle anında diller arası geçiş yapabilirsiniz. Menüler, veri analizleri, sabit besin içerikleri seçtiğiniz dile göre yerelleştirilir.
- **🎨 Zengin Avatar Galerisi:** Onboarding sürecinde cinsiyete özel ve eğlenceli hazır avatarlar ile başlangıç yapabilir, veya profil sayfası üzerinden doğrudan kendi fotoğrafınızı yükleyebilirsiniz.
- **📊 Gelişmiş Dashboard:** Makro besin halkaları, günlük kalan kalori hedefleri ve haftalık grafiksel özet ile tüm verilerinizi tek ekranda görün. Menüler sekmesinden doğrudan öğüne (Kahvaltı, Öğle, vs.) kolayca manuel ekleme yapın.
- **🎯 BMR & Hedef Hesaplama (Mifflin-St Jeor):** Boy, kilo ve aktivite seviyenize göre en bilimsel bazal metabolizma hızıyla TDEE ihtiyacınızı hedeflerinize uygun şekilde (Kilo ver/Koru/Al) otomatik hesaplar.
- **💧 Dinamik Su Takipcisi:** `react-native-reanimated` kütüphanesi ile tasarlanmış sıvı dolu bardak grafiğinden bardak bardağına tüketiminizi yönetin.
- **🏆 Oyunlaştırma & Rozetler:** Serinizi (Streak) bozmadıkça veya hedefleri tutturdukça özel efektli alev (🔥) animasyonları ve pop-up animasyonlu rozetler kazanın.
- **📅 Geçmiş Günlük Takvimi:** Geçmiş günleri takvimden seçerek o günkü beslenme ve su istatistiklerinize geri dönün.

---

## 🛠️ Kullanılan Teknolojiler (Tech Stack)

### ⚛️ Frontend & Altyapı
- **[React Native]** & **[Expo]** (v54): Çapraz platform mobil geliştirme altyapısı.
- **[TypeScript]**: Güvenli kodlama mimarisi ve tip denetimi.
- **[NativeWind (Tailwind CSS)]**: Gelişmiş ve standartlaştırılmış arayüz stili tasarımı.
- **[AsyncStorage]**: Cihaz üzerinde internetsiz (lokal) veri kalıcılığını sağlayan küçük veri tabanı.

### 🧩 Kritik Kütüphaneler & Araçlar
- **Navigasyon:** `@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/native-stack`
- **Tasarım & Animasyon:** `react-native-reanimated`, React Native `Animated` API, `react-native-svg` (dairesel grafikler, su dalgası efektleri ve flame (alev) ikonu için).
- **Yapay Zeka (AI):** `Google Gemini API` (*gemini-2.5-flash* modeli) — SDK bağımlılığı olmadan doğrudan REST API entegrasyonu.
- **Çoklu Dil (i18n):** Özel geliştirilmiş Context tabanlı asenkron dil yönetim mimarisi.
- **Expo API'leri:** `expo-camera`, `expo-image-picker`, `expo-file-system`, `expo-haptics` (hissiyat/titreşim).

---

## 🚀 Kurulum & Çalıştırma

### Ön Gereksinimler
- Bilgisayarınızda [Node.js](https://nodejs.org/) kurulu olmalıdır.
- Telefonunuzda test edebilmek için iOS App Store veya Google Play Store'dan **"Expo Go"** uygulamasını indirmelisiniz.

### Kurulum Adımları

1. **Projeyi klonlayın ve klasör içine girin:**
   ```bash
   git clone <repo-url>
   cd NutriTrack
   ```

2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

3. **Çevresel Değişkenleri ayarlayın:**
   Projenin ana dizinine bir `.env` dosyası oluşturun ve Google AI API anahtarınızı girin:
   ```env
   EXPO_PUBLIC_GOOGLE_AI_KEY=sizin_google_ai_api_anahtariniz
   ```

4. **Uygulamayı başlatın:**
   ```bash
   npx expo start --clear
   ```

5. **Test Edin:** Ekranda beliren QR kodu cihazınızdaki telefonun kamerasıyla veya Expo Go uygulamasının içinden okutarak uygulamayı telefonunuzda çalıştırın.

---

## 📁 Mimari & Klasör Yapısı

```text
src/
├── components/      # Butonlar, BadgeCards, ErrorBoundary gibi ortak UI parçaları
├── constants/       # Yemek veritabanı, avatar dosyaları (avatars.ts), kategori sabitleri
├── context/         # CalorieContext (Proje Data Kalbi & Yönetimi)
├── i18n/            # LanguageContext, Türkçe (tr.ts) ve İngilizce (en.ts) çeviriler
├── navigation/      # Stack ve Alt Menü Yönlendirmeleri
├── screens/         # Dashboard, Camera, Profile, Calendar gibi Ana Ekranlar
└── utils/           # Haptics (Titreşim motoru) gibi yardımcı senaryolar
App.tsx              # Uygulamanın Başlangıç Dosyası
```

---

## 🔒 Güvenlik Notu
Uygulama arka planda hiçbir veritabanı veya bulut servisi kullanmaz; tamamen yerel cihaz odaklı çalışır (Kullanıcı verileri cihaza özel AsyncStorage ile şifresiz ve lokal ortamda saklanır). Fotoğraf analizi işlemi sırasında görüntüler, yapay zeka çıktısı üretilebilmesi için geçici olarak Google Gemini API'ye iletilir.
