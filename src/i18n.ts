import { Priority, RouteName, UserProfile } from "./types";

export type Language = UserProfile["language"];

export interface AppCopy {
  common: {
    active: string;
    back: string;
    completed: string;
    inbox: string;
    missed: string;
    noDate: string;
    operationFailed: string;
    premium: string;
    retry: string;
    task: string;
  };
  legal: {
    accountDeletion: string;
    linkErrorBody: string;
    linkErrorTitle: string;
    manageSubscription: string;
    privacyPolicy: string;
    purchaseSetupBody: string;
    purchaseSetupTitle: string;
    restoreBody: string;
    restorePurchases: string;
    restoreTitle: string;
    subscriptionTerms: string;
    support: string;
    termsOfUse: string;
    title: string;
  };
  tabs: Record<RouteName, string>;
  priority: Record<Priority, string>;
  a11y: {
    openTab: (label: string) => string;
    openTask: (title: string) => string;
    toggleTask: (title: string, completed: boolean) => string;
    selectCategory: (name: string) => string;
    selectPremiumPlan: (title: string) => string;
    editAvatar: string;
    deleteTask: string;
    addSubtask: string;
    searchTasks: string;
    switchToLogin: string;
    switchToSignup: string;
  };
  topBar: {
    focusArea: string;
    newTask: string;
  };
  auth: {
    loginTitle: string;
    signupTitle: string;
    loginSubtitle: string;
    signupSubtitle: string;
    firebaseNotice: string;
    fullName: string;
    email: string;
    password: string;
    loginButton: string;
    signupButton: string;
    forgotPassword: string;
    signupLink: string;
    loginLink: string;
    resetNeedsEmail: string;
    resetSent: string;
  };
  dashboard: {
    eyebrow: string;
    hello: (firstName: string) => string;
    subtitle: string;
    focusFlow: string;
    openTaskLabel: string;
    todayFocus: string;
    taskCount: (count: number) => string;
    noTodayTitle: string;
    noTodayBody: string;
    quickAreas: string;
  };
  tasks: {
    eyebrow: string;
    title: string;
    newButton: string;
    searchPlaceholder: string;
    progress: string;
    openRemaining: (count: number) => string;
    noMatchTitle: string;
    noMatchBody: string;
  };
  history: {
    eyebrow: string;
    title: string;
    subtitle: string;
    dailyNote: string;
    oneTimeNote: string;
    completedLabel: string;
    missedLabel: string;
    emptyTitle: string;
    emptyBody: string;
  };
  categories: {
    eyebrow: string;
    title: string;
    subtitle: string;
    addTitle: string;
    nameLabel: string;
    createButton: string;
    activeTaskCount: (count: number) => string;
  };
  premium: {
    eyebrow: string;
    heroTitle: string;
    subtitle: string;
    paywallSubtitle: string;
    paywallTitle: string;
    paywallBody: string;
    choosePlan: string;
    summary: string;
    activeBadge: string;
    loadingPlans: string;
    revenueCatMissingTitle: string;
    revenueCatMissingBody: string;
    plansUnavailableTitle: string;
    plansUnavailableBody: string;
    purchaseSuccessTitle: string;
    purchaseSuccessBody: string;
    purchaseErrorTitle: string;
    purchaseErrorBody: string;
    restoreSuccessTitle: string;
    restoreSuccessBody: string;
    restoreInactiveTitle: string;
    restoreInactiveBody: string;
    restoreErrorTitle: string;
    restoreErrorBody: string;
    disclosureBody: string;
    disclosureTitle: string;
    plans: {
      monthly: {
        title: string;
        price: string;
        detail: string;
        badge: string;
      };
      yearly: {
        title: string;
        price: string;
        detail: string;
        badge: string;
      };
    };
    features: [
      { title: string; body: string },
      { title: string; body: string },
      { title: string; body: string },
      { title: string; body: string }
    ];
  };
  settings: {
    fullName: string;
    jobTitle: string;
    saveProfile: string;
    premiumActive: string;
    premiumInactive: string;
    openPremium: string;
    upgradePremium: string;
    notifications: string;
    notificationsBody: string;
    notificationPermissionDenied: string;
    deleteAccountBody: string;
    deleteAccountCancel: string;
    deleteAccountConfirmBody: string;
    deleteAccountConfirmButton: string;
    deleteAccountConfirmTitle: string;
    deleteAccountFailure: string;
    deleteAccountPasswordLabel: string;
    deleteAccountPasswordRequired: string;
    deleteAccountRecentLogin: string;
    deleteAccountSuccessBody: string;
    deleteAccountSuccessTitle: string;
    deleteAccountWrongPassword: string;
    english: string;
    turkish: string;
    logout: string;
  };
  editor: {
    editTitle: string;
    newTitle: string;
    editEyebrow: string;
    draftEyebrow: string;
    taskName: string;
    taskPlaceholder: string;
    notes: string;
    notesPlaceholder: string;
    priority: string;
    category: string;
    date: string;
    time: string;
    reminder: string;
    dailyTitle: string;
    dailyBody: string;
    subtasks: string;
    newSubtask: string;
    subtaskPlaceholder: string;
    saveChanges: string;
    addTask: string;
    untitledTask: string;
  };
  taskCard: {
    daily: string;
  };
}

const plural = (count: number, singular: string, pluralValue: string) => (count === 1 ? singular : pluralValue);

export const translations: Record<Language, AppCopy> = {
  tr: {
    common: {
      active: "Aktif",
      back: "Geri",
      completed: "Tamamlandı",
      inbox: "Gelen Kutusu",
      missed: "Yapılmadı",
      noDate: "Tarih yok",
      operationFailed: "İşlem tamamlanamadı. Lütfen tekrar dene.",
      premium: "Premium",
      retry: "Tekrar Dene",
      task: "Görev"
    },
    legal: {
      accountDeletion: "Hesap ve Veri Silme",
      linkErrorBody: "Bağlantı açılamadı. Lütfen daha sonra tekrar dene.",
      linkErrorTitle: "Bağlantı açılamadı",
      manageSubscription: "Aboneliği Yönet",
      privacyPolicy: "Gizlilik Politikası",
      purchaseSetupBody: "App Store Connect abonelik ürünleri ve StoreKit satın alma akışı bağlandığında satın alma burada başlayacak.",
      purchaseSetupTitle: "Satın alma yakında",
      restoreBody: "App Store abonelikleri StoreKit ile etkinleştiğinde satın alımlarını buradan geri yükleyebileceksin.",
      restorePurchases: "Satın Alımları Geri Yükle",
      restoreTitle: "Geri yükleme yakında",
      subscriptionTerms: "Abonelik Şartları",
      support: "Destek",
      termsOfUse: "Kullanım Şartları (EULA)",
      title: "Yasal"
    },
    tabs: {
      dashboard: "Bugün",
      tasks: "Görevler",
      history: "Geçmiş",
      categories: "Alanlar",
      premium: "Premium",
      settings: "Profil"
    },
    priority: {
      high: "Yüksek",
      medium: "Orta",
      low: "Düşük"
    },
    a11y: {
      openTab: (label) => `${label} sekmesini aç`,
      openTask: (title) => `${title} görevini aç`,
      toggleTask: (title, completed) => `${title} görevini ${completed ? "tamamlanmadı" : "tamamlandı"} olarak işaretle`,
      selectCategory: (name) => `${name} kategorisini seç`,
      selectPremiumPlan: (title) => `${title} premium planını seç`,
      editAvatar: "Profil görselini düzenle",
      deleteTask: "Görevi sil",
      addSubtask: "Alt görev ekle",
      searchTasks: "Görev ara",
      switchToLogin: "Giriş ekranına geç",
      switchToSignup: "Kayıt ekranına geç"
    },
    topBar: {
      focusArea: "Odak Alanı",
      newTask: "Yeni görev"
    },
    auth: {
      loginTitle: "Tekrar Hoş Geldin.",
      signupTitle: "Odak Alanı Oluştur.",
      loginSubtitle: "Odağını yeniden bul.",
      signupSubtitle: "Daha sakin bir görev alanıyla başla.",
      firebaseNotice: "Firebase anahtarları henüz ayarlı değil. Giriş yapmak için Firebase yapılandırması gerekli.",
      fullName: "Ad soyad",
      email: "Email",
      password: "Şifre",
      loginButton: "Email ile Devam Et",
      signupButton: "Hesap Oluştur",
      forgotPassword: "Şifremi Unuttum",
      signupLink: "Hesabın yok mu? Kayıt ol",
      loginLink: "Zaten hesabın var mı? Giriş yap",
      resetNeedsEmail: "Şifre sıfırlama bağlantısı için email adresini yaz.",
      resetSent: "Şifre sıfırlama bağlantısı email adresine gönderildi."
    },
    dashboard: {
      eyebrow: "Çalışma Alanı / Bugün",
      hello: (firstName) => `Merhaba, ${firstName}.`,
      subtitle: "Sıradaki önemli işleri daha sakin gör.",
      focusFlow: "Odak Akışı",
      openTaskLabel: "Açık Görev",
      todayFocus: "Bugünün Odağı",
      taskCount: (count) => `${count} görev`,
      noTodayTitle: "Bugün için görev yok",
      noTodayBody: "Yeni bir görev oluşturabilir ya da boş alanın tadını çıkarabilirsin.",
      quickAreas: "Hızlı Alanlar"
    },
    tasks: {
      eyebrow: "Günlük Odak",
      title: "Görevler",
      newButton: "Yeni",
      searchPlaceholder: "Başlığa göre ara",
      progress: "İlerleme",
      openRemaining: (count) => `${count} aktif görev kaldı.`,
      noMatchTitle: "Eşleşen görev yok",
      noMatchBody: "Aramayı değiştir veya yeni bir odak noktası oluştur."
    },
    history: {
      eyebrow: "Geçmiş",
      title: "Görev Günlüğü",
      subtitle: "Tamamlanan ve tamamlanmadan kalan günleri birlikte gör.",
      dailyNote: "Her gün yapılacaklardan",
      oneTimeNote: "Tek seferlik görev",
      completedLabel: "Tamamlanan",
      missedLabel: "Tamamlanmayan",
      emptyTitle: "Henüz geçmiş yok",
      emptyBody: "Görevler tamamlandıkça veya günlük işler yenilendikçe burada görünecek."
    },
    categories: {
      eyebrow: "Düzenle",
      title: "Alanlar",
      subtitle: "Kategoriler günü daha okunur tutar.",
      addTitle: "Alan Ekle",
      nameLabel: "Kategori adı",
      createButton: "Kategori Oluştur",
      activeTaskCount: (count) => `${count} aktif görev`
    },
    premium: {
      eyebrow: "Premium",
      heroTitle: "Dijital Odağın İçin Sakin Alan",
      subtitle: "Sınırsız alan, daha derin ilerleme sinyalleri ve öncelikli destek.",
      paywallSubtitle: "Premium Gerekli",
      paywallTitle: "3 Gün Ücretsiz Dene",
      paywallBody: "TaskAgent'i kullanmak için App Store üzerinden Premium planını başlat. Deneme süren Apple tarafından yönetilir; satın alımlarını buradan geri yükleyebilirsin.",
      choosePlan: "Planını Seç",
      summary: "Aylık plan 2.99 dolar. Yıllık plan 29.99 dolardır.",
      activeBadge: "Aktif",
      loadingPlans: "RevenueCat planları yükleniyor.",
      revenueCatMissingTitle: "RevenueCat yapılandırması eksik",
      revenueCatMissingBody: "Satın alma için RevenueCat public API key değerlerini yapılandırman gerekiyor.",
      plansUnavailableTitle: "Plan bulunamadı",
      plansUnavailableBody: "RevenueCat offering içinde aylık veya yıllık paket bulunamadı. Dashboard ürün ve entitlement ayarlarını kontrol et.",
      purchaseSuccessTitle: "Premium aktif",
      purchaseSuccessBody: "Satın alma tamamlandı ve Premium durumun güncellendi.",
      purchaseErrorTitle: "Satın alma tamamlanamadı",
      purchaseErrorBody: "RevenueCat satın alma akışında hata oluştu. Ürünlerin App Store Connect ve RevenueCat üzerinde aktif olduğundan emin ol.",
      restoreSuccessTitle: "Satın alımlar geri yüklendi",
      restoreSuccessBody: "Premium aboneliğin bulundu ve hesabına işlendi.",
      restoreInactiveTitle: "Aktif abonelik bulunamadı",
      restoreInactiveBody: "Bu mağaza hesabında TaskAgent Premium için aktif abonelik bulunamadı.",
      restoreErrorTitle: "Geri yükleme tamamlanamadı",
      restoreErrorBody: "Satın alımlar geri yüklenirken hata oluştu. Daha sonra tekrar dene.",
      disclosureTitle: "Abonelik Bilgileri",
      disclosureBody:
        "TaskAgent Premium otomatik yenilenen bir aboneliktir. Ödeme Apple ID hesabından alınır; abonelik iptal edilmezse mevcut dönemin bitiminden en az 24 saat önce yenilenir. Aboneliklerini App Store hesap ayarlarından yönetebilir veya iptal edebilirsin.",
      plans: {
        monthly: {
          title: "Aylık",
          price: "$2.99",
          detail: "Ayda 2.99 dolar · istediğin zaman geçiş yap",
          badge: "Esnek plan"
        },
        yearly: {
          title: "Yıllık",
          price: "$29.99",
          detail: "Yılda 29.99 dolar · yaklaşık 2 ay avantaj",
          badge: "Tasarruflu"
        }
      },
      features: [
        { title: "Sınırsız Görev", body: "İhtiyacın kadar odak noktası, alt görev ve alan oluştur." },
        { title: "Bulut Eşitleme", body: "iOS ve Android cihazlarını Firebase ile aynı tut." },
        { title: "Derin İçgörüler", body: "İlerleme, geciken işler ve öncelik dengesini izle." },
        { title: "Öncelikli Destek", body: "Çalışma alanın kritik olduğunda daha hızlı yardım al." }
      ]
    },
    settings: {
      fullName: "Ad soyad",
      jobTitle: "Unvan",
      saveProfile: "Profili Kaydet",
      premiumActive: "Premium özelliklerin aktif.",
      premiumInactive: "Sınırsız görev ve gelişmiş içgörüler için planı incele.",
      openPremium: "Premium Sayfasını Aç",
      upgradePremium: "Premium'a Geç",
      notifications: "Bildirimler",
      notificationsBody: "Görev hatırlatmaları için cihaz bildirimlerini kullan.",
      notificationPermissionDenied: "Bildirim izni verilmedi. Cihaz ayarlarından TaskAgent bildirimlerini açman gerekiyor.",
      deleteAccountBody:
        "Hesabını silmek; profilini, görevlerini, alanlarını, alt görevlerini ve geçmişini kalıcı olarak siler. Apple aboneliğin varsa faturalandırma App Store üzerinden yönetilmeye devam eder; aboneliğini ayrıca iptal etmelisin.",
      deleteAccountCancel: "Vazgeç",
      deleteAccountConfirmBody: "Bu işlem geri alınamaz. TaskAgent hesabın ve uygulama verilerin kalıcı olarak silinecek.",
      deleteAccountConfirmButton: "Kalıcı Olarak Sil",
      deleteAccountConfirmTitle: "Hesabı sil?",
      deleteAccountFailure: "Hesap silinemedi. Lütfen bağlantını kontrol edip tekrar dene.",
      deleteAccountPasswordLabel: "Şifren",
      deleteAccountPasswordRequired: "Hesabını silmek için şifreni yazmalısın.",
      deleteAccountRecentLogin: "Güvenlik için tekrar giriş yapıp hesabı silmeyi yeniden dene.",
      deleteAccountSuccessBody: "Hesabın ve TaskAgent verilerin silindi.",
      deleteAccountSuccessTitle: "Hesap silindi",
      deleteAccountWrongPassword: "Şifre hatalı. Lütfen tekrar dene.",
      english: "İngilizce",
      turkish: "Türkçe",
      logout: "Çıkış Yap"
    },
    editor: {
      editTitle: "Geçerli Odak",
      newTitle: "Yeni Odak",
      editEyebrow: "Çalışma Alanı / Düzenle",
      draftEyebrow: "Çalışma Alanı / Taslak",
      taskName: "Görev adı",
      taskPlaceholder: "Yeni bir odak noktası oluştur.",
      notes: "Notlar",
      notesPlaceholder: "Gerekli bağlamı ekle",
      priority: "Öncelik",
      category: "Kategori",
      date: "Tarih",
      time: "Saat",
      reminder: "Hatırlatma",
      dailyTitle: "Her Gün Tekrarla",
      dailyBody: "Bu görev her yeni günde yeniden açık hale gelir; önceki gün tamamlandıysa ya da tamamlanmadıysa geçmişe yazılır.",
      subtasks: "Alt Görevler",
      newSubtask: "Yeni alt görev",
      subtaskPlaceholder: "Alt görev ekle",
      saveChanges: "Değişiklikleri Kaydet",
      addTask: "Görevi Ekle",
      untitledTask: "Adsız Odak Noktası"
    },
    taskCard: {
      daily: "Her gün"
    }
  },
  en: {
    common: {
      active: "Active",
      back: "Back",
      completed: "Completed",
      inbox: "Inbox",
      missed: "Missed",
      noDate: "No date",
      operationFailed: "The action could not be completed. Please try again.",
      premium: "Premium",
      retry: "Try Again",
      task: "Task"
    },
    legal: {
      accountDeletion: "Account and Data Deletion",
      linkErrorBody: "The link could not be opened. Please try again later.",
      linkErrorTitle: "Could not open link",
      manageSubscription: "Manage Subscription",
      privacyPolicy: "Privacy Policy",
      purchaseSetupBody: "When App Store Connect subscription products and the StoreKit purchase flow are connected, purchases will start here.",
      purchaseSetupTitle: "Purchase coming soon",
      restoreBody: "When App Store subscriptions are enabled with StoreKit, you will be able to restore purchases here.",
      restorePurchases: "Restore Purchases",
      restoreTitle: "Restore coming soon",
      subscriptionTerms: "Subscription Terms",
      support: "Support",
      termsOfUse: "Terms of Use (EULA)",
      title: "Legal"
    },
    tabs: {
      dashboard: "Today",
      tasks: "Tasks",
      history: "History",
      categories: "Areas",
      premium: "Premium",
      settings: "Profile"
    },
    priority: {
      high: "High",
      medium: "Medium",
      low: "Low"
    },
    a11y: {
      openTab: (label) => `Open ${label} tab`,
      openTask: (title) => `Open ${title} task`,
      toggleTask: (title, completed) => `Mark ${title} as ${completed ? "not completed" : "completed"}`,
      selectCategory: (name) => `Select ${name} category`,
      selectPremiumPlan: (title) => `Select ${title} premium plan`,
      editAvatar: "Edit profile image",
      deleteTask: "Delete task",
      addSubtask: "Add subtask",
      searchTasks: "Search tasks",
      switchToLogin: "Switch to login",
      switchToSignup: "Switch to sign up"
    },
    topBar: {
      focusArea: "Focus Area",
      newTask: "New task"
    },
    auth: {
      loginTitle: "Welcome Back.",
      signupTitle: "Create Your Focus Space.",
      loginSubtitle: "Find your focus again.",
      signupSubtitle: "Start with a calmer task space.",
      firebaseNotice: "Firebase keys are not configured yet. Firebase configuration is required to sign in.",
      fullName: "Full name",
      email: "Email",
      password: "Password",
      loginButton: "Continue with Email",
      signupButton: "Create Account",
      forgotPassword: "Forgot Password",
      signupLink: "No account yet? Sign up",
      loginLink: "Already have an account? Log in",
      resetNeedsEmail: "Enter your email address to receive a password reset link.",
      resetSent: "Password reset link was sent to your email address."
    },
    dashboard: {
      eyebrow: "Workspace / Today",
      hello: (firstName) => `Hello, ${firstName}.`,
      subtitle: "See the next important work with more calm.",
      focusFlow: "Focus Flow",
      openTaskLabel: "Open Tasks",
      todayFocus: "Today's Focus",
      taskCount: (count) => `${count} ${plural(count, "task", "tasks")}`,
      noTodayTitle: "No tasks for today",
      noTodayBody: "Create a new task or enjoy the open space.",
      quickAreas: "Quick Areas"
    },
    tasks: {
      eyebrow: "Daily Focus",
      title: "Tasks",
      newButton: "New",
      searchPlaceholder: "Search by title",
      progress: "Progress",
      openRemaining: (count) => `${count} active ${plural(count, "task", "tasks")} left.`,
      noMatchTitle: "No matching tasks",
      noMatchBody: "Change the search or create a new focus point."
    },
    history: {
      eyebrow: "History",
      title: "Task Journal",
      subtitle: "See completed and missed days together.",
      dailyNote: "Part of daily tasks",
      oneTimeNote: "One-time task",
      completedLabel: "Completed",
      missedLabel: "Missed",
      emptyTitle: "No history yet",
      emptyBody: "Completed tasks and renewed daily tasks will appear here."
    },
    categories: {
      eyebrow: "Organize",
      title: "Areas",
      subtitle: "Categories keep the day easier to scan.",
      addTitle: "Add Area",
      nameLabel: "Category name",
      createButton: "Create Category",
      activeTaskCount: (count) => `${count} active ${plural(count, "task", "tasks")}`
    },
    premium: {
      eyebrow: "Premium",
      heroTitle: "A Calm Space for Your Digital Focus",
      subtitle: "Unlimited areas, deeper progress signals, and priority support.",
      paywallSubtitle: "Premium Required",
      paywallTitle: "Start Your 3-Day Free Trial",
      paywallBody: "Start a Premium plan through the App Store to use TaskAgent. Your trial is managed by Apple, and you can restore purchases here.",
      choosePlan: "Choose Your Plan",
      summary: "Monthly plan is 2.99 dollars. Yearly plan is 29.99 dollars.",
      activeBadge: "Active",
      loadingPlans: "Loading RevenueCat plans.",
      revenueCatMissingTitle: "RevenueCat configuration is missing",
      revenueCatMissingBody: "Configure the RevenueCat public API keys before purchases can start.",
      plansUnavailableTitle: "No plan found",
      plansUnavailableBody: "The RevenueCat offering does not include a monthly or yearly package. Check the dashboard products and entitlement setup.",
      purchaseSuccessTitle: "Premium active",
      purchaseSuccessBody: "The purchase is complete and your Premium status was updated.",
      purchaseErrorTitle: "Purchase could not be completed",
      purchaseErrorBody: "RevenueCat returned an error. Make sure products are active in App Store Connect and RevenueCat.",
      restoreSuccessTitle: "Purchases restored",
      restoreSuccessBody: "Your Premium subscription was found and applied to your account.",
      restoreInactiveTitle: "No active subscription found",
      restoreInactiveBody: "No active TaskAgent Premium subscription was found for this store account.",
      restoreErrorTitle: "Restore could not be completed",
      restoreErrorBody: "There was an error restoring purchases. Please try again later.",
      disclosureTitle: "Subscription Information",
      disclosureBody:
        "TaskAgent Premium is an auto-renewable subscription. Payment is charged to your Apple ID account; the subscription renews unless canceled at least 24 hours before the current period ends. You can manage or cancel subscriptions in your App Store account settings.",
      plans: {
        monthly: {
          title: "Monthly",
          price: "$2.99",
          detail: "2.99 dollars per month · switch anytime",
          badge: "Flexible"
        },
        yearly: {
          title: "Yearly",
          price: "$29.99",
          detail: "29.99 dollars per year · roughly 2 months saved",
          badge: "Best value"
        }
      },
      features: [
        { title: "Unlimited Tasks", body: "Create as many focus points, subtasks, and areas as you need." },
        { title: "Cloud Sync", body: "Keep your iOS and Android devices aligned with Firebase." },
        { title: "Deeper Insights", body: "Track progress, overdue work, and priority balance." },
        { title: "Priority Support", body: "Get faster help when your workspace is critical." }
      ]
    },
    settings: {
      fullName: "Full name",
      jobTitle: "Title",
      saveProfile: "Save Profile",
      premiumActive: "Premium features are active.",
      premiumInactive: "Review the plan for unlimited tasks and advanced insights.",
      openPremium: "Open Premium Page",
      upgradePremium: "Go Premium",
      notifications: "Notifications",
      notificationsBody: "Use device notifications for task reminders.",
      notificationPermissionDenied: "Notification permission was denied. Turn on TaskAgent notifications in device settings.",
      deleteAccountBody:
        "Deleting your account permanently removes your profile, tasks, areas, subtasks, and history. If you have an Apple subscription, billing is still managed through the App Store and must be canceled separately.",
      deleteAccountCancel: "Cancel",
      deleteAccountConfirmBody: "This cannot be undone. Your TaskAgent account and app data will be permanently deleted.",
      deleteAccountConfirmButton: "Delete Permanently",
      deleteAccountConfirmTitle: "Delete account?",
      deleteAccountFailure: "The account could not be deleted. Check your connection and try again.",
      deleteAccountPasswordLabel: "Password",
      deleteAccountPasswordRequired: "Enter your password to delete your account.",
      deleteAccountRecentLogin: "For security, sign in again and retry account deletion.",
      deleteAccountSuccessBody: "Your account and TaskAgent data were deleted.",
      deleteAccountSuccessTitle: "Account deleted",
      deleteAccountWrongPassword: "The password is incorrect. Please try again.",
      english: "English",
      turkish: "Turkish",
      logout: "Sign Out"
    },
    editor: {
      editTitle: "Current Focus",
      newTitle: "New Focus",
      editEyebrow: "Workspace / Edit",
      draftEyebrow: "Workspace / Draft",
      taskName: "Task name",
      taskPlaceholder: "Create a new focus point.",
      notes: "Notes",
      notesPlaceholder: "Add the needed context",
      priority: "Priority",
      category: "Category",
      date: "Date",
      time: "Time",
      reminder: "Reminder",
      dailyTitle: "Repeat Every Day",
      dailyBody: "This task reopens each new day; the previous day is written to history whether completed or missed.",
      subtasks: "Subtasks",
      newSubtask: "New subtask",
      subtaskPlaceholder: "Add subtask",
      saveChanges: "Save Changes",
      addTask: "Add Task",
      untitledTask: "Untitled Focus Point"
    },
    taskCard: {
      daily: "Every day"
    }
  }
};

export function getCopy(language: Language | null | undefined) {
  return translations[language === "en" ? "en" : "tr"];
}
