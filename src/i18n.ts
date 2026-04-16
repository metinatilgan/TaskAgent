import { Priority, RouteName, UserProfile } from "./types";

export type Language = UserProfile["language"];

export interface AppCopy {
  common: {
    active: string;
    addAttachment: string;
    back: string;
    completed: string;
    inbox: string;
    missed: string;
    noDate: string;
    premium: string;
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
    removeAttachment: (fileName: string) => string;
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
    demoButton: string;
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
    choosePlan: string;
    summary: string;
    activeBadge: string;
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
    darkMode: string;
    darkModeBody: string;
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
    attachments: string;
    noAttachments: string;
    saveBeforeAttachment: string;
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
      addAttachment: "Ek ekle",
      back: "Geri",
      completed: "Tamamlandı",
      inbox: "Gelen Kutusu",
      missed: "Yapılmadı",
      noDate: "Tarih yok",
      premium: "Premium",
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
      termsOfUse: "Kullanım Şartları",
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
      removeAttachment: (fileName) => `${fileName} ekini kaldır`,
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
      firebaseNotice: "Firebase anahtarları henüz ayarlı değil. Demo modu iOS ve Android'de kullanılabilir.",
      fullName: "Ad soyad",
      email: "Email",
      password: "Şifre",
      loginButton: "Email ile Devam Et",
      signupButton: "Hesap Oluştur",
      forgotPassword: "Şifremi Unuttum",
      demoButton: "Demo Alanını Aç",
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
      choosePlan: "Planını Seç",
      summary: "Aylık plan 5 dolar. Yıllık planı tercih edersen toplam maliyet düşer.",
      activeBadge: "Aktif",
      disclosureTitle: "Abonelik Bilgileri",
      disclosureBody:
        "TaskAgent Premium otomatik yenilenen bir aboneliktir. Ödeme Apple ID hesabından alınır; abonelik iptal edilmezse mevcut dönemin bitiminden en az 24 saat önce yenilenir. Aboneliklerini App Store hesap ayarlarından yönetebilir veya iptal edebilirsin.",
      plans: {
        monthly: {
          title: "Aylık",
          price: "$5",
          detail: "Ayda 5 dolar · istediğin zaman geçiş yap",
          badge: "Esnek plan"
        },
        yearly: {
          title: "Yıllık",
          price: "$49.99",
          detail: "Yılda 49.99 dolar · yaklaşık 2 ay avantaj",
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
      darkMode: "Gece Modu",
      darkModeBody: "Görsel tercihini Firebase üzerinde sakla.",
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
      attachments: "Ekler",
      noAttachments: "Henüz ek yok.",
      saveBeforeAttachment: "Önce görevi kaydet, sonra bu cihazdan dosya ekle.",
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
      addAttachment: "Add attachment",
      back: "Back",
      completed: "Completed",
      inbox: "Inbox",
      missed: "Missed",
      noDate: "No date",
      premium: "Premium",
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
      termsOfUse: "Terms of Use",
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
      removeAttachment: (fileName) => `Remove ${fileName} attachment`,
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
      firebaseNotice: "Firebase keys are not configured yet. Demo mode works on iOS and Android.",
      fullName: "Full name",
      email: "Email",
      password: "Password",
      loginButton: "Continue with Email",
      signupButton: "Create Account",
      forgotPassword: "Forgot Password",
      demoButton: "Open Demo Space",
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
      choosePlan: "Choose Your Plan",
      summary: "Monthly plan is 5 dollars. The yearly plan lowers the total cost.",
      activeBadge: "Active",
      disclosureTitle: "Subscription Information",
      disclosureBody:
        "TaskAgent Premium is an auto-renewable subscription. Payment is charged to your Apple ID account; the subscription renews unless canceled at least 24 hours before the current period ends. You can manage or cancel subscriptions in your App Store account settings.",
      plans: {
        monthly: {
          title: "Monthly",
          price: "$5",
          detail: "5 dollars per month · switch anytime",
          badge: "Flexible"
        },
        yearly: {
          title: "Yearly",
          price: "$49.99",
          detail: "49.99 dollars per year · roughly 2 months saved",
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
      darkMode: "Dark Mode",
      darkModeBody: "Store your visual preference in Firebase.",
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
      attachments: "Attachments",
      noAttachments: "No attachments yet.",
      saveBeforeAttachment: "Save the task first, then add a file from this device.",
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
