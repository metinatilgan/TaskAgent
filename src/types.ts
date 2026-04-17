export type Priority = "high" | "medium" | "low";
export type RepeatRule = "none" | "daily";
export type RouteName = "dashboard" | "tasks" | "history" | "categories" | "premium" | "settings";

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  avatarStoragePath: string;
  jobTitle: string;
  language: "en" | "tr";
  pushNotifications: boolean;
  isPremium: boolean;
  premiumPlan: "monthly" | "yearly" | null;
  premiumExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: "primary" | "secondary" | "tertiary";
  taskCount: number;
  createdAt: string;
}

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface TaskHistoryEntry {
  id: string;
  taskId: string;
  taskTitle: string;
  categoryName: string | null;
  date: string;
  completed: boolean;
  completedAt: string | null;
  repeat: RepeatRule;
}

export interface Task {
  id: string;
  categoryId: string | null;
  categoryName: string | null;
  title: string;
  notes: string;
  priority: Priority;
  isCompleted: boolean;
  dueDate: string | null;
  dueTime: string | null;
  reminderTime: string | null;
  repeat: RepeatRule;
  lastDailyRefresh: string | null;
  notificationId?: string | null;
  subtasks: Subtask[];
  completionHistory: TaskHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export type TaskDraft = Omit<Task, "id" | "createdAt" | "updatedAt" | "subtasks" | "completionHistory" | "lastDailyRefresh"> & {
  subtasks?: Subtask[];
  completionHistory?: TaskHistoryEntry[];
  lastDailyRefresh?: string | null;
};

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isDemo: boolean;
}
