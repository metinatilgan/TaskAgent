import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { FirebaseError } from "firebase/app";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";

import { demoCategories, demoProfile, demoTasks } from "../data/demo";
import { db } from "../lib/firebase";
import {
  cancelAllTaskReminders,
  cancelTaskReminder,
  isNotificationPermissionDeniedError,
  requestTaskNotificationPermission,
  scheduleTaskReminder
} from "../lib/notifications";
import { AppUser, Category, Task, TaskDraft, TaskHistoryEntry, UserProfile } from "../types";
import { useAuth } from "./AuthContext";

interface TaskContextValue {
  profile: UserProfile;
  tasks: Task[];
  categories: Category[];
  loading: boolean;
  addTask: (task: TaskDraft) => Promise<string>;
  updateTask: (taskId: string, task: Partial<TaskDraft>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  notificationPermissionDenied: boolean;
  clearNotificationWarning: () => void;
}

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

type ReminderTask = Pick<Task | TaskDraft, "title" | "dueDate" | "dueTime" | "reminderTime">;

const dateString = () => new Date().toISOString();
const cleanId = () => Math.random().toString(36).slice(2, 10);
const nameFromEmail = (email: string | null) => {
  const localPart = email?.split("@")[0]?.trim();

  if (!localPart) {
    return "";
  }

  return localPart
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
const localDateKey = (value = new Date()) => {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const addDays = (date: string, days: number) => {
  const parts = date.split("-").map(Number);
  const year = parts[0] || new Date().getFullYear();
  const month = parts[1] || 1;
  const day = parts[2] || 1;
  const value = new Date(year, month - 1, day);
  value.setDate(value.getDate() + days);
  return localDateKey(value);
};

const normalizeDate = (value: unknown): string | null => {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  if (typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().toISOString().slice(0, 10);
  }

  return null;
};

const normalizeProfileDate = (value: unknown, fallback: string) => {
  if (typeof value === "string" && !Number.isNaN(new Date(value).getTime())) {
    return value;
  }

  if (typeof value === "object" && value && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }

  return fallback;
};

const recalculateCategories = (categories: Category[], tasks: Task[]) =>
  categories.map((category) => ({
    ...category,
    taskCount: tasks.filter((task) => task.categoryId === category.id && !task.isCompleted).length
  }));

const sortHistory = (history: TaskHistoryEntry[]) => [...history].sort((left, right) => right.date.localeCompare(left.date));

const normalizeHistory = (taskId: string, value: unknown): TaskHistoryEntry[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return sortHistory(
    value
      .map((entry) => {
        if (!entry || typeof entry !== "object") {
          return null;
        }

        const source = entry as Record<string, unknown>;
        const date = normalizeDate(source.date);

        if (!date) {
          return null;
        }

        return {
          id: typeof source.id === "string" ? source.id : `history-${taskId}-${date}`,
          taskId: typeof source.taskId === "string" ? source.taskId : taskId,
          taskTitle: typeof source.taskTitle === "string" ? source.taskTitle : "Görev",
          categoryName: typeof source.categoryName === "string" ? source.categoryName : null,
          date,
          completed: Boolean(source.completed),
          completedAt: typeof source.completedAt === "string" ? source.completedAt : null,
          repeat: source.repeat === "daily" ? "daily" : "none"
        };
      })
      .filter((entry): entry is TaskHistoryEntry => Boolean(entry))
  );
};

const historyEntryForTask = (task: Task, date: string, completed: boolean): TaskHistoryEntry => ({
  id: `history-${task.id}-${date}`,
  taskId: task.id,
  taskTitle: task.title,
  categoryName: task.categoryName,
  date,
  completed,
  completedAt: completed ? dateString() : null,
  repeat: task.repeat
});

const upsertHistoryEntry = (task: Task, date: string, completed: boolean) => {
  const nextEntry = historyEntryForTask(task, date, completed);
  const others = task.completionHistory.filter((entry) => !(entry.taskId === task.id && entry.date === date));
  return sortHistory([nextEntry, ...others]);
};

const rollDailyTask = (task: Task, today = localDateKey()): { task: Task; changed: boolean } => {
  if (task.repeat !== "daily") {
    return { task, changed: false };
  }

  const anchorDate = task.lastDailyRefresh || task.dueDate || today;

  if (anchorDate >= today) {
    return {
      task: {
        ...task,
        dueDate: task.dueDate || today,
        lastDailyRefresh: task.lastDailyRefresh || anchorDate
      },
      changed: !task.dueDate || !task.lastDailyRefresh
    };
  }

  let cursor = anchorDate;
  let firstOpenDay = true;
  let completionHistory = task.completionHistory;

  while (cursor < today) {
    const hasEntry = completionHistory.some((entry) => entry.taskId === task.id && entry.date === cursor);
    if (!hasEntry) {
      completionHistory = sortHistory([historyEntryForTask(task, cursor, firstOpenDay ? task.isCompleted : false), ...completionHistory]);
    }
    cursor = addDays(cursor, 1);
    firstOpenDay = false;
  }

  return {
    task: {
      ...task,
      isCompleted: false,
      dueDate: today,
      lastDailyRefresh: today,
      subtasks: task.subtasks.map((subtask) => ({ ...subtask, isCompleted: false })),
      completionHistory,
      updatedAt: dateString()
    },
    changed: true
  };
};

const renewDailyTasks = (tasks: Task[]) => {
  const changedTasks: Task[] = [];
  const nextTasks = tasks.map((task) => {
    const result = rollDailyTask(task);
    if (result.changed) {
      changedTasks.push(result.task);
    }
    return result.task;
  });

  return { nextTasks, changedTasks };
};

const prepareTaskDraft = (task: TaskDraft): TaskDraft => {
  const repeat = task.repeat === "daily" ? "daily" : "none";
  const dueDate = task.dueDate || (repeat === "daily" ? localDateKey() : null);

  return {
    ...task,
    repeat,
    dueDate,
    lastDailyRefresh: repeat === "daily" ? task.lastDailyRefresh || dueDate || localDateKey() : null,
    completionHistory: task.completionHistory || []
  };
};

const isFirestoreOfflineError = (cause: unknown) =>
  cause instanceof FirebaseError &&
  (cause.code === "unavailable" || cause.message.toLowerCase().includes("client is offline"));

const warnFirestoreSyncFailure = (operation: string, cause: unknown) => {
  console.warn(`${operation} could not be synced to Firestore.`, cause);
};

const defaultProfileForUser = (user: AppUser): UserProfile => {
  const now = dateString();

  return {
    uid: user.uid,
    email: user.email || "",
    fullName: user.displayName || nameFromEmail(user.email),
    avatarUrl: user.photoURL || "",
    avatarStoragePath: "",
    jobTitle: "",
    language: demoProfile.language,
    pushNotifications: true,
    isPremium: false,
    premiumPlan: null,
    premiumExpiresAt: null,
    createdAt: now,
    updatedAt: now
  };
};

const profileForAuthenticatedUser = (user: AppUser, value: Partial<UserProfile> = {}) => {
  const fallback = defaultProfileForUser(user);
  const nextProfile: UserProfile = { ...fallback, ...value, uid: user.uid };
  nextProfile.createdAt = normalizeProfileDate(value.createdAt, fallback.createdAt);
  nextProfile.updatedAt = normalizeProfileDate(value.updatedAt, fallback.updatedAt);

  if (nextProfile.email === demoProfile.email) {
    nextProfile.email = fallback.email;
  }

  if (nextProfile.fullName === demoProfile.fullName || !nextProfile.fullName.trim()) {
    nextProfile.fullName = fallback.fullName || fallback.email || "Kullanıcı";
  }

  if (nextProfile.jobTitle === demoProfile.jobTitle) {
    nextProfile.jobTitle = "";
  }

  if (!nextProfile.avatarUrl && fallback.avatarUrl) {
    nextProfile.avatarUrl = fallback.avatarUrl;
  }

  return nextProfile;
};

const profileRepairPatch = (source: Partial<UserProfile>, sanitized: UserProfile) => {
  const patch: Partial<UserProfile> = {};

  if (source.email === demoProfile.email) {
    patch.email = sanitized.email;
  }

  if (source.fullName === demoProfile.fullName || !source.fullName?.trim()) {
    patch.fullName = sanitized.fullName;
  }

  if (source.jobTitle === demoProfile.jobTitle) {
    patch.jobTitle = "";
  }

  if (!source.avatarUrl && sanitized.avatarUrl) {
    patch.avatarUrl = sanitized.avatarUrl;
  }

  return patch;
};

const hasProfileRepairPatch = (patch: Partial<UserProfile>) => Object.keys(patch).length > 0;

const toTask = (id: string, value: Record<string, unknown>): Task => ({
  id,
  categoryId: typeof value.categoryId === "string" ? value.categoryId : null,
  categoryName: typeof value.categoryName === "string" ? value.categoryName : null,
  title: typeof value.title === "string" ? value.title : "Adsız görev",
  notes: typeof value.notes === "string" ? value.notes : "",
  priority: value.priority === "high" || value.priority === "medium" || value.priority === "low" ? value.priority : "medium",
  isCompleted: Boolean(value.isCompleted),
  dueDate: normalizeDate(value.dueDate),
  dueTime: typeof value.dueTime === "string" ? value.dueTime : null,
  reminderTime: typeof value.reminderTime === "string" ? value.reminderTime : null,
  repeat: value.repeat === "daily" ? "daily" : "none",
  lastDailyRefresh: normalizeDate(value.lastDailyRefresh),
  notificationId: typeof value.notificationId === "string" ? value.notificationId : null,
  subtasks: Array.isArray(value.subtasks) ? (value.subtasks as Task["subtasks"]) : [],
  completionHistory: normalizeHistory(id, value.completionHistory),
  createdAt: normalizeDate(value.createdAt) || dateString(),
  updatedAt: normalizeDate(value.updatedAt) || dateString()
});

const toCategory = (id: string, value: Record<string, unknown>): Category => ({
  id,
  name: typeof value.name === "string" ? value.name : "Kategori",
  icon: typeof value.icon === "string" ? value.icon : "folder",
  color: value.color === "primary" || value.color === "secondary" || value.color === "tertiary" ? value.color : "primary",
  taskCount: typeof value.taskCount === "number" ? value.taskCount : 0,
  createdAt: normalizeDate(value.createdAt) || dateString()
});

const seedCategoryIds = new Set(demoCategories.map((category) => category.id));
const categoryKey = (category: Category) => category.name.trim().toLocaleLowerCase("tr-TR");
const categorySortValue = (category: Category) => `${category.createdAt}-${category.id}`;

const chooseCanonicalCategory = (group: Category[], tasks: Task[]) => {
  const withReferences = group.map((category) => ({
    category,
    references: tasks.filter((task) => task.categoryId === category.id).length
  }));
  const maxReferences = Math.max(...withReferences.map((item) => item.references));
  const candidates = withReferences.filter((item) => item.references === maxReferences).map((item) => item.category);
  const seeded = candidates.find((category) => seedCategoryIds.has(category.id));

  if (seeded) {
    return seeded;
  }

  return [...candidates].sort((left, right) => categorySortValue(left).localeCompare(categorySortValue(right)))[0] || group[0]!;
};

const duplicateCategoryGroups = (categories: Category[], tasks: Task[]) => {
  const groups = new Map<string, Category[]>();

  categories.forEach((category) => {
    const key = categoryKey(category);
    groups.set(key, [...(groups.get(key) || []), category]);
  });

  return Array.from(groups.values())
    .filter((group) => group.length > 1)
    .map((group) => {
      const canonical = chooseCanonicalCategory(group, tasks);
      return {
        canonical,
        duplicates: group.filter((category) => category.id !== canonical.id)
      };
    })
    .filter((group) => group.duplicates.length > 0);
};

const categoryCanonicalMap = (categories: Category[], tasks: Task[]) => {
  const map = new Map<string, Category>();

  duplicateCategoryGroups(categories, tasks).forEach(({ canonical, duplicates }) => {
    duplicates.forEach((duplicate) => map.set(duplicate.id, canonical));
  });

  return map;
};

const reassignDuplicateCategoryTasks = (tasks: Task[], canonicalMap: Map<string, Category>) =>
  tasks.map((task) => {
    const canonical = task.categoryId ? canonicalMap.get(task.categoryId) : null;

    if (!canonical) {
      return task;
    }

    return {
      ...task,
      categoryId: canonical.id,
      categoryName: canonical.name
    };
  });

const uniqueCategories = (categories: Category[], tasks: Task[]) => {
  const canonicalMap = categoryCanonicalMap(categories, tasks);
  const duplicateIds = new Set(canonicalMap.keys());
  const nextCategories = categories.filter((category) => !duplicateIds.has(category.id));
  return recalculateCategories(nextCategories, reassignDuplicateCategoryTasks(tasks, canonicalMap));
};

export function TaskProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(demoProfile);
  const [tasks, setTasks] = useState<Task[]>(demoTasks);
  const [categories, setCategories] = useState<Category[]>(demoCategories);
  const [loading, setLoading] = useState(false);
  const [notificationPermissionDenied, setNotificationPermissionDenied] = useState(false);
  const categoryCleanupKeyRef = useRef("");

  const clearNotificationWarning = useCallback(() => setNotificationPermissionDenied(false), []);

  const handleNotificationFailure = useCallback((cause: unknown) => {
    if (isNotificationPermissionDeniedError(cause)) {
      setNotificationPermissionDenied(true);
      return;
    }

    console.warn("Notification scheduling failed.", cause);
  }, []);

  const scheduleReminderForTask = useCallback(
    async (task: ReminderTask, shouldSchedule = profile.pushNotifications) => {
      if (!shouldSchedule) {
        return null;
      }

      try {
        return await scheduleTaskReminder(task);
      } catch (cause) {
        handleNotificationFailure(cause);
        return null;
      }
    },
    [handleNotificationFailure, profile.pushNotifications]
  );

  const syncDailyTaskRefresh = useCallback(
    async (task: Task, firestore: typeof db, uid?: string, shouldSchedule = profile.pushNotifications) => {
      if (task.notificationId) {
        try {
          await cancelTaskReminder(task.notificationId);
        } catch (cause) {
          console.warn("Failed to cancel stale daily reminder.", cause);
        }
      }

      const notificationId = await scheduleReminderForTask(task, shouldSchedule);

      if (firestore && uid) {
        try {
          await updateDoc(doc(firestore, "users", uid, "tasks", task.id), {
            dueDate: task.dueDate,
            isCompleted: task.isCompleted,
            lastDailyRefresh: task.lastDailyRefresh,
            subtasks: task.subtasks,
            completionHistory: task.completionHistory,
            notificationId,
            updatedAt: serverTimestamp()
          });
        } catch (cause) {
          warnFirestoreSyncFailure("Daily task refresh", cause);
        }
      }

      setTasks((current) => current.map((item) => (item.id === task.id ? { ...item, notificationId } : item)));
    },
    [profile.pushNotifications, scheduleReminderForTask]
  );

  useEffect(() => {
    if (!user) {
      const { nextTasks } = renewDailyTasks(demoTasks);
      setProfile(demoProfile);
      setTasks(nextTasks);
      setCategories(recalculateCategories(demoCategories, nextTasks));
      return undefined;
    }

    if (!db || user.isDemo) {
      const { nextTasks } = renewDailyTasks(demoTasks);
      setProfile(user.isDemo ? demoProfile : profileForAuthenticatedUser(user));
      setTasks(nextTasks);
      setCategories(recalculateCategories(demoCategories, nextTasks));
      return undefined;
    }

    const firestore = db;
    setLoading(true);
    const localProfile = profileForAuthenticatedUser(user);
    const profileRef = doc(firestore, "users", user.uid);
    const tasksQuery = query(collection(firestore, "users", user.uid, "tasks"), orderBy("createdAt", "desc"));
    const categoriesQuery = query(collection(firestore, "users", user.uid, "categories"), orderBy("createdAt", "asc"));
    const handleSnapshotError = (cause: unknown) => {
      console.warn("Firestore sync failed.", cause);
      setLoading(false);

      if (isFirestoreOfflineError(cause)) {
        setProfile(localProfile);
        setTasks((current) => (current.length ? current : renewDailyTasks(demoTasks).nextTasks));
        setCategories((current) => (current.length ? current : recalculateCategories(demoCategories, demoTasks)));
      }
    };
    let syncedProfile: UserProfile | null = null;
    let pendingDailyRefreshes: Task[] = [];
    const flushDailyRefreshes = () => {
      if (!syncedProfile || !pendingDailyRefreshes.length) {
        return;
      }

      const queuedTasks = pendingDailyRefreshes;
      pendingDailyRefreshes = [];

      queuedTasks.forEach((task) => {
        void syncDailyTaskRefresh(task, firestore, user.uid, syncedProfile?.pushNotifications ?? false);
      });
    };

    const unsubProfile = onSnapshot(
      profileRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const sourceProfile = snapshot.data() as Partial<UserProfile>;
          const sanitizedProfile = profileForAuthenticatedUser(user, sourceProfile);
          const repairPatch = profileRepairPatch(sourceProfile, sanitizedProfile);

          syncedProfile = sanitizedProfile;
          setProfile(sanitizedProfile);

          if (hasProfileRepairPatch(repairPatch)) {
            setDoc(
              profileRef,
              {
                uid: user.uid,
                ...repairPatch,
                updatedAt: serverTimestamp()
              },
              { merge: true }
            ).catch((cause) => warnFirestoreSyncFailure("Profile repair", cause));
          }
        } else {
          syncedProfile = localProfile;
          setProfile(localProfile);
        }

        flushDailyRefreshes();
      },
      handleSnapshotError
    );

    const unsubTasks = onSnapshot(
      tasksQuery,
      (snapshot) => {
        const loadedTasks = snapshot.docs.map((item) => toTask(item.id, item.data()));
        const { nextTasks, changedTasks } = renewDailyTasks(loadedTasks);
        setTasks(nextTasks);
        setLoading(false);

        pendingDailyRefreshes = [...pendingDailyRefreshes, ...changedTasks];
        flushDailyRefreshes();
      },
      handleSnapshotError
    );

    const unsubCategories = onSnapshot(
      categoriesQuery,
      (snapshot) => {
        setCategories(snapshot.docs.map((item) => toCategory(item.id, item.data())));
      },
      handleSnapshotError
    );

    return () => {
      unsubProfile();
      unsubTasks();
      unsubCategories();
    };
  }, [syncDailyTaskRefresh, user]);

  useEffect(() => {
    if (!db || !user || user.isDemo || categories.length < 2) {
      categoryCleanupKeyRef.current = "";
      return;
    }

    const duplicateGroups = duplicateCategoryGroups(categories, tasks);

    if (!duplicateGroups.length) {
      categoryCleanupKeyRef.current = "";
      return;
    }

    const cleanupKey = duplicateGroups
      .map((group) => `${group.canonical.id}:${group.duplicates.map((category) => category.id).sort().join(",")}`)
      .sort()
      .join("|");

    if (categoryCleanupKeyRef.current === cleanupKey) {
      return;
    }

    categoryCleanupKeyRef.current = cleanupKey;

    const firestore = db;
    const canonicalMap = categoryCanonicalMap(categories, tasks);
    const duplicateIds = new Set(canonicalMap.keys());

    tasks.forEach((task) => {
      const canonical = task.categoryId ? canonicalMap.get(task.categoryId) : null;

      if (!canonical) {
        return;
      }

      updateDoc(doc(firestore, "users", user.uid, "tasks", task.id), {
        categoryId: canonical.id,
        categoryName: canonical.name,
        updatedAt: serverTimestamp()
      }).catch((cause) => warnFirestoreSyncFailure("Duplicate category task repair", cause));
    });

    duplicateGroups.forEach((group) => {
      group.duplicates.forEach((category) => {
        deleteDoc(doc(firestore, "users", user.uid, "categories", category.id)).catch((cause) =>
          warnFirestoreSyncFailure("Duplicate category deletion", cause)
        );
      });
    });

    setTasks((current) => reassignDuplicateCategoryTasks(current, canonicalMap));
    setCategories((current) => current.filter((category) => !duplicateIds.has(category.id)));
  }, [categories, tasks, user]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((current) => {
        const { nextTasks, changedTasks } = renewDailyTasks(current);

        if (!changedTasks.length) {
          return current;
        }

        const firestore = db;

        if (firestore && user && !user.isDemo) {
          changedTasks.forEach((task) => {
            void syncDailyTaskRefresh(task, firestore, user.uid);
          });
        } else {
          changedTasks.forEach((task) => {
            void syncDailyTaskRefresh(task, null, undefined, Boolean(user && !user.isDemo));
          });
        }

        return nextTasks;
      });
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [syncDailyTaskRefresh, user]);

  const actions = useMemo(
    () => ({
      addTask: async (task: TaskDraft) => {
        const preparedTask = prepareTaskDraft(task);
        const notificationId = await scheduleReminderForTask(preparedTask);

        if (db && user && !user.isDemo) {
          try {
            const created = await addDoc(collection(db, "users", user.uid, "tasks"), {
              ...preparedTask,
              subtasks: preparedTask.subtasks || [],
              completionHistory: preparedTask.completionHistory || [],
              notificationId,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            return created.id;
          } catch (cause) {
            warnFirestoreSyncFailure("Task creation", cause);
          }
        }

        const id = `task-${cleanId()}`;
        const nextTask: Task = {
          ...preparedTask,
          id,
          subtasks: preparedTask.subtasks || [],
          completionHistory: preparedTask.completionHistory || [],
          lastDailyRefresh: preparedTask.lastDailyRefresh || null,
          notificationId,
          createdAt: dateString(),
          updatedAt: dateString()
        };
        setTasks((current) => [nextTask, ...current]);
        setCategories((current) => recalculateCategories(current, [nextTask, ...tasks]));
        return id;
      },
      updateTask: async (taskId: string, task: Partial<TaskDraft>) => {
        const existing = tasks.find((item) => item.id === taskId);
        const repeat = task.repeat || existing?.repeat || "none";
        const mergedTask = existing
          ? prepareTaskDraft({
              ...existing,
              ...task,
              repeat,
              lastDailyRefresh: repeat === "daily" ? task.lastDailyRefresh || existing.lastDailyRefresh || task.dueDate || existing.dueDate || localDateKey() : null
            })
          : null;
        const nextNotificationId = mergedTask ? await scheduleReminderForTask(mergedTask) : null;

        if (existing?.notificationId && existing.notificationId !== nextNotificationId) {
          try {
            await cancelTaskReminder(existing.notificationId);
          } catch (cause) {
            console.warn("Failed to cancel replaced task reminder.", cause);
          }
        }

        if (db && user && !user.isDemo) {
          try {
            await updateDoc(doc(db, "users", user.uid, "tasks", taskId), {
              ...task,
              ...(mergedTask
                ? {
                    repeat: mergedTask.repeat,
                    dueDate: mergedTask.dueDate,
                    lastDailyRefresh: mergedTask.lastDailyRefresh,
                    completionHistory: mergedTask.completionHistory || existing?.completionHistory || []
                  }
                : {}),
              notificationId: nextNotificationId,
              updatedAt: serverTimestamp()
            });
          } catch (cause) {
            warnFirestoreSyncFailure("Task update", cause);
          }
        }

        setTasks((current) =>
          current.map((item) =>
            item.id === taskId && mergedTask ? { ...item, ...mergedTask, notificationId: nextNotificationId, updatedAt: dateString() } : item
          )
        );
      },
      deleteTask: async (taskId: string) => {
        const existing = tasks.find((item) => item.id === taskId);
        try {
          await cancelTaskReminder(existing?.notificationId);
        } catch (cause) {
          console.warn("Failed to cancel deleted task reminder.", cause);
        }

        if (db && user && !user.isDemo) {
          try {
            await deleteDoc(doc(db, "users", user.uid, "tasks", taskId));
          } catch (cause) {
            warnFirestoreSyncFailure("Task deletion", cause);
          }
        }

        setTasks((current) => current.filter((item) => item.id !== taskId));
      },
      toggleTask: async (taskId: string) => {
        const task = tasks.find((item) => item.id === taskId);
        if (!task) {
          return;
        }

        const isCompleted = !task.isCompleted;
        const historyDate = task.dueDate || localDateKey();
        const completionHistory = upsertHistoryEntry(task, historyDate, isCompleted);

        if (db && user && !user.isDemo) {
          try {
            await updateDoc(doc(db, "users", user.uid, "tasks", taskId), {
              isCompleted,
              completionHistory,
              updatedAt: serverTimestamp()
            });
          } catch (cause) {
            warnFirestoreSyncFailure("Task completion", cause);
          }
        }

        setTasks((current) => current.map((item) => (item.id === taskId ? { ...item, isCompleted, completionHistory, updatedAt: dateString() } : item)));
      },
      addCategory: async (name: string) => {
        const normalized = name.trim();
        if (!normalized) {
          return;
        }

        if (db && user && !user.isDemo) {
          try {
            await addDoc(collection(db, "users", user.uid, "categories"), {
              name: normalized,
              icon: "folder",
              color: "primary",
              taskCount: 0,
              createdAt: serverTimestamp()
            });
            return;
          } catch (cause) {
            warnFirestoreSyncFailure("Category creation", cause);
          }
        }

        setCategories((current) => [
          ...current,
          {
            id: `category-${cleanId()}`,
            name: normalized,
            icon: "folder",
            color: "primary",
            taskCount: 0,
            createdAt: dateString()
          }
        ]);
      },
      updateProfile: async (partial: Partial<UserProfile>) => {
        let nextPartial = partial;

        if (partial.pushNotifications === true) {
          try {
            await requestTaskNotificationPermission();
          } catch (cause) {
            handleNotificationFailure(cause);
            nextPartial = { ...partial, pushNotifications: false };
          }
        }

        if (nextPartial.pushNotifications === false) {
          try {
            await cancelAllTaskReminders(tasks.map((task) => task.notificationId));
          } catch (cause) {
            console.warn("Failed to cancel task reminders.", cause);
          }

          setTasks((current) => current.map((task) => (task.notificationId ? { ...task, notificationId: null } : task)));

          if (db && user && !user.isDemo) {
            const firestore = db;
            await Promise.all(
              tasks
                .filter((task) => task.notificationId)
                .map((task) =>
                  updateDoc(doc(firestore, "users", user.uid, "tasks", task.id), {
                    notificationId: null,
                    updatedAt: serverTimestamp()
                  }).catch((cause) => warnFirestoreSyncFailure("Task reminder cancellation", cause))
                )
            );
          }
        }

        if (nextPartial.pushNotifications === true) {
          const notificationUpdates = new Map<string, string | null>();

          for (const task of tasks) {
            if (task.notificationId) {
              try {
                await cancelTaskReminder(task.notificationId);
              } catch (cause) {
                console.warn("Failed to replace task reminder.", cause);
              }
            }

            notificationUpdates.set(task.id, await scheduleReminderForTask(task, true));
          }

          setTasks((current) =>
            current.map((task) =>
              notificationUpdates.has(task.id) ? { ...task, notificationId: notificationUpdates.get(task.id) ?? null } : task
            )
          );

          if (db && user && !user.isDemo) {
            const firestore = db;
            await Promise.all(
              Array.from(notificationUpdates.entries()).map(([taskId, notificationId]) =>
                updateDoc(doc(firestore, "users", user.uid, "tasks", taskId), {
                  notificationId,
                  updatedAt: serverTimestamp()
                }).catch((cause) => warnFirestoreSyncFailure("Task reminder setup", cause))
              )
            );
          }
        }

        const nextProfile =
          user && !user.isDemo
            ? profileForAuthenticatedUser(user, { ...profile, ...nextPartial, updatedAt: dateString() })
            : { ...profile, ...nextPartial, updatedAt: dateString() };
        setProfile(nextProfile);

        if (db && user && !user.isDemo) {
          try {
            await setDoc(doc(db, "users", user.uid), nextProfile, { merge: true });
          } catch (cause) {
            warnFirestoreSyncFailure("Profile update", cause);
          }
        }
      }
    }),
    [handleNotificationFailure, profile, scheduleReminderForTask, tasks, user]
  );

  const value = useMemo<TaskContextValue>(
    () => ({
      profile,
      tasks,
      categories: uniqueCategories(categories, tasks),
      loading,
      notificationPermissionDenied,
      clearNotificationWarning,
      ...actions
    }),
    [actions, categories, clearNotificationWarning, loading, notificationPermissionDenied, profile, tasks]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTaskAgent() {
  const context = useContext(TaskContext);

  if (!context) {
    throw new Error("useTaskAgent must be used inside TaskProvider");
  }

  return context;
}
