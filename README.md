# TaskAgent Mobil

TaskAgent artık tek TypeScript kod tabanından iOS ve Android'de çalışan bir Expo + React Native uygulaması. `EXPO_PUBLIC_FIREBASE_*` değerleri girildiğinde Firebase Authentication + Cloud Firestore akışına geçer.

## Çalıştırma

```bash
npm install
npm run start
```

Ardından iOS Simulator için `i`, Android Emulator için `a` tuşuna basabilir veya Expo Go ile QR kodu okutabilirsin.

Doğrudan başlatmak için:

```bash
npm run ios
npm run android
```

## Firebase

`.env.example` dosyasını `.env` olarak kopyala ve Firebase client değerlerini doldur:

```bash
cp .env.example .env
```

Bu Firebase servislerini etkinleştir:

- Authentication: Email/Password
- Cloud Firestore

Firebase Authentication oturumu React Native AsyncStorage ile cihazda kalıcı tutulur. Giriş ekranında email/şifre ile kayıt, giriş ve şifre sıfırlama akışları bulunur.

Uygulama kullanıcı verisini şu yollarda tutar:

- `users/{uid}`
- `users/{uid}/categories/{categoryId}`
- `users/{uid}/tasks/{taskId}`

Üretim verisi kullanmadan önce `firebase/firestore.rules` dosyasındaki kuralları deploy et.

## RevenueCat

Premium abonelik akışı `react-native-purchases` SDK'sı ile RevenueCat'e bağlıdır. `.env` dosyasına platform public SDK key değerlerini ekle:

```bash
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_your-revenuecat-ios-public-sdk-key
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=goog_your-revenuecat-android-public-sdk-key
EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID=premium
```

RevenueCat Dashboard tarafında:

- iOS ve Android uygulamalarını oluştur.
- App Store Connect ve Google Play abonelik ürünlerini RevenueCat ürünlerine bağla.
- Entitlement ID değerini varsayılan olarak `premium` kullan ya da `.env` içindeki `EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID` ile aynı yap.
- Current offering içine aylık ve yıllık package ekle. Uygulama RevenueCat package type olarak `MONTHLY` ve `ANNUAL` paketlerini arar.
- Aylık ürün fiyatını USD $2.99, yıllık ürün fiyatını USD $29.99 olarak ayarla.
- 3 günlük ücretsiz denemeyi uygulama içinde değil, App Store Connect subscription introductory offer olarak tanımla. RevenueCat entitlement aktif olduğu sürece uygulama açılır.

Gerçek satın alma testi Expo Go içinde değil, native development build veya cihaz build içinde yapılmalıdır.

## Güncel Mobil Özellikler

- iOS ve Android Expo yapılandırması
- Firebase hazır email ile giriş, kayıt, kalıcı oturum ve şifre sıfırlama akışı
- Odak ilerlemesini gösteren dashboard
- Görev listesi, arama, tamamlandı işaretleme, görev oluşturma/düzenleme/silme
- Her gün tekrarlanan görevler ve günlük otomatik yenileme
- Tamamlanan ve tamamlanmayan geçmiş görev günlüğü
- Kategori yönetimi
- RevenueCat ile Premium satın alma, abonelik geri yükleme ve premium durum eşitleme
- Profil ayarları, dil ve bildirim tercihleri
- App Store için gizlilik, kullanım şartları, abonelik şartları, destek ve hesap silme bağlantıları
- Expo Notifications ile yerel görev hatırlatmaları

## App Store ve GitHub Pages

GitHub Pages için statik yasal sayfalar `docs/` klasöründe hazır:

- Privacy Policy: `https://metinatilgan.github.io/TaskAgent/privacy.html`
- Terms of Use: `https://metinatilgan.github.io/TaskAgent/terms.html`
- Subscription Terms: `https://metinatilgan.github.io/TaskAgent/subscription-terms.html`
- Support: `https://metinatilgan.github.io/TaskAgent/support.html`
- Account/Data Deletion: `https://metinatilgan.github.io/TaskAgent/account-deletion.html`

`.github/workflows/pages.yml` dosyası, repo `main` branch'ine push edildiğinde `docs/` içeriğini GitHub Pages'e yayınlayacak şekilde hazırlandı. GitHub tarafında Pages kaynağını GitHub Actions olarak etkinleştirmek gerekir.

App Store Connect içinde kullanılacak özet kontrol listesi `docs/app-store-checklist.html` dosyasında bulunur. Ücretli aboneliği App Store'a göndermeden önce App Store Connect'te auto-renewable subscription ürünleri oluşturulmalı, RevenueCat ürünleriyle eşleştirilmeli ve sandbox satın alma testi yapılmalıdır.

## Notlar

Expo Go uygulamanın büyük bölümünü hızlıca önizleyebilir. Bildirim davranışı development build içinde daha güvenilirdir; çünkü Expo Go, `expo-notifications` özelliklerinin bir kısmını sınırlar.
