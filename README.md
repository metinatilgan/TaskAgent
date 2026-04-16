# TaskAgent Mobil

TaskAgent artık tek TypeScript kod tabanından iOS ve Android'de çalışan bir Expo + React Native uygulaması. Firebase anahtarları yoksa demo çalışma alanı açılır; `EXPO_PUBLIC_FIREBASE_*` değerleri girildiğinde Firebase Authentication + Cloud Firestore akışına geçer.

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
- Firebase Storage

Firebase Authentication oturumu React Native AsyncStorage ile cihazda kalıcı tutulur. Giriş ekranında email/şifre ile kayıt, giriş ve şifre sıfırlama akışları bulunur.

Uygulama kullanıcı verisini şu yollarda tutar:

- `users/{uid}`
- `users/{uid}/categories/{categoryId}`
- `users/{uid}/tasks/{taskId}`

Firebase Storage dosya yolları:

- `users/{uid}/avatars/{fileName}`
- `users/{uid}/tasks/{taskId}/{fileName}`

Üretim verisi kullanmadan önce `firebase/firestore.rules` ve `firebase/storage.rules` dosyalarındaki kuralları deploy et.

## Güncel Mobil Özellikler

- iOS ve Android Expo yapılandırması
- Firebase hazır email ile giriş, kayıt, kalıcı oturum ve şifre sıfırlama akışı
- Firebase env değerleri yoksa çevrimdışı demo çalışma alanı
- Odak ilerlemesini gösteren dashboard
- Görev listesi, arama, tamamlandı işaretleme, görev oluşturma/düzenleme/silme
- Her gün tekrarlanan görevler ve günlük otomatik yenileme
- Tamamlanan ve tamamlanmayan geçmiş görev günlüğü
- Kategori yönetimi
- Premium durum ekranı
- Profil ayarları, dil, bildirim ve gece modu tercihleri
- Firebase Storage yüklemeli yerel avatar seçici ve eski avatar temizliği
- Görev dosyaları için yerel belge seçici ve görev silinince Storage temizliği
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

App Store Connect içinde kullanılacak özet kontrol listesi `docs/app-store-checklist.html` dosyasında bulunur. Ücretli aboneliği App Store'a göndermeden önce App Store Connect'te auto-renewable subscription ürünleri oluşturulmalı ve gerçek satın alma akışı StoreKit/In-App Purchase ile bağlanmalıdır.

## Notlar

Expo Go uygulamanın büyük bölümünü hızlıca önizleyebilir. Bildirim davranışı development build içinde daha güvenilirdir; çünkü Expo Go, `expo-notifications` özelliklerinin bir kısmını sınırlar.
