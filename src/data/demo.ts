import { Category, Task, UserProfile } from "../types";

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);

const formatDate = (value: Date) => value.toISOString().slice(0, 10);
const now = today.toISOString();

export const demoProfile: UserProfile = {
  uid: "demo-user",
  email: "demo@taskagent.app",
  fullName: "TaskAgent Demo",
  avatarUrl: "",
  avatarStoragePath: "",
  jobTitle: "Editoryal Çalışma Alanı",
  language: "tr",
  pushNotifications: true,
  isPremium: false,
  premiumPlan: null,
  premiumExpiresAt: null,
  createdAt: now,
  updatedAt: now
};

export const demoCategories: Category[] = [
  {
    id: "work",
    name: "İş",
    icon: "work-outline",
    color: "primary",
    taskCount: 2,
    createdAt: now
  },
  {
    id: "personal",
    name: "Kişisel",
    icon: "person-outline",
    color: "secondary",
    taskCount: 1,
    createdAt: now
  },
  {
    id: "health",
    name: "Sağlık",
    icon: "favorite-outline",
    color: "tertiary",
    taskCount: 1,
    createdAt: now
  }
];

export const demoTasks: Task[] = [
  {
    id: "task-1",
    categoryId: "work",
    categoryName: "İş",
    title: "Ürün yol haritası notlarını hazırla",
    notes: "En etkili fikirleri topla ve planı inceleme için yeterince sade tut.",
    priority: "high",
    isCompleted: false,
    dueDate: formatDate(today),
    dueTime: "09:30",
    reminderTime: "09:00",
    repeat: "none",
    lastDailyRefresh: null,
    subtasks: [
      {
        id: "subtask-1",
        title: "İkinci çeyrek temalarını çıkar",
        isCompleted: true,
        sortOrder: 1,
        createdAt: now
      },
      {
        id: "subtask-2",
        title: "Teslimat risklerini ekle",
        isCompleted: false,
        sortOrder: 2,
        createdAt: now
      }
    ],
    completionHistory: [],
    createdAt: now,
    updatedAt: now
  },
  {
    id: "task-2",
    categoryId: "personal",
    categoryName: "Kişisel",
    title: "Hafta sonu yolculuğunu planla",
    notes: "Bilet almadan önce tren ve uçuş saatlerini karşılaştır.",
    priority: "medium",
    isCompleted: false,
    dueDate: formatDate(today),
    dueTime: "18:00",
    reminderTime: "17:00",
    repeat: "none",
    lastDailyRefresh: null,
    subtasks: [],
    completionHistory: [],
    createdAt: now,
    updatedAt: now
  },
  {
    id: "task-3",
    categoryId: "health",
    categoryName: "Sağlık",
    title: "Otuz dakikalık toparlanma yürüyüşü",
    notes: "Hafif tempoda kal ve gün batmadan bitir.",
    priority: "low",
    isCompleted: true,
    dueDate: formatDate(today),
    dueTime: "19:30",
    reminderTime: null,
    repeat: "daily",
    lastDailyRefresh: formatDate(today),
    subtasks: [],
    completionHistory: [
      {
        id: `history-task-3-${formatDate(yesterday)}`,
        taskId: "task-3",
        taskTitle: "Otuz dakikalık toparlanma yürüyüşü",
        categoryName: "Sağlık",
        date: formatDate(yesterday),
        completed: true,
        completedAt: now,
        repeat: "daily"
      }
    ],
    createdAt: now,
    updatedAt: now
  },
  {
    id: "task-4",
    categoryId: "work",
    categoryName: "İş",
    title: "Tasarım değerlendirme özetini gönder",
    notes: "Bir paragraflık özet ve açık kalan iki soru.",
    priority: "medium",
    isCompleted: false,
    dueDate: formatDate(yesterday),
    dueTime: "11:00",
    reminderTime: "10:30",
    repeat: "none",
    lastDailyRefresh: null,
    subtasks: [],
    completionHistory: [],
    createdAt: now,
    updatedAt: now
  }
];
