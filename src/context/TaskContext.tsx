import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
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
import { cancelTaskReminder, scheduleTaskReminder } from "../lib/notifications";
import { deleteStoredFile, uploadAvatar, uploadTaskAttachment } from "../lib/storage";
import { Attachment, Category, PickedFile, Task, TaskDraft, TaskHistoryEntry, UserProfile } from "../types";
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
  uploadProfileAvatar: (file: PickedFile) => Promise<void>;
  addTaskAttachment: (taskId: string, file: PickedFile) => Promise<void>;
  removeTaskAttachment: (taskId: string, attachmentId: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

const dateString = () => new Date().toISOString();
const cleanId = () => Math.random().toString(36).slice(2, 10);
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
  attachments: Array.isArray(value.attachments) ? (value.attachments as Task["attachments"]) : [],
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

export function TaskProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(demoProfile);
  const [tasks, setTasks] = useState<Task[]>(demoTasks);
  const [categories, setCategories] = useState<Category[]>(demoCategories);
  const [loading, setLoading] = useState(false);

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
      setProfile({
        ...demoProfile,
        uid: user.uid,
        email: user.email || demoProfile.email,
        fullName: user.displayName || demoProfile.fullName,
        avatarUrl: user.photoURL || ""
      });
      setTasks(nextTasks);
      setCategories(recalculateCategories(demoCategories, nextTasks));
      return undefined;
    }

    const firestore = db;
    setLoading(true);
    const profileRef = doc(firestore, "users", user.uid);
    const tasksQuery = query(collection(firestore, "users", user.uid, "tasks"), orderBy("createdAt", "desc"));
    const categoriesQuery = query(collection(firestore, "users", user.uid, "categories"), orderBy("createdAt", "asc"));

    const unsubProfile = onSnapshot(profileRef, (snapshot) => {
      if (snapshot.exists()) {
        setProfile({ ...demoProfile, ...(snapshot.data() as Partial<UserProfile>), uid: user.uid });
      }
    });

    const unsubTasks = onSnapshot(tasksQuery, (snapshot) => {
      const loadedTasks = snapshot.docs.map((item) => toTask(item.id, item.data()));
      const { nextTasks, changedTasks } = renewDailyTasks(loadedTasks);
      setTasks(nextTasks);
      setLoading(false);

      changedTasks.forEach((task) => {
        updateDoc(doc(firestore, "users", user.uid, "tasks", task.id), {
          dueDate: task.dueDate,
          isCompleted: task.isCompleted,
          lastDailyRefresh: task.lastDailyRefresh,
          subtasks: task.subtasks,
          completionHistory: task.completionHistory,
          updatedAt: serverTimestamp()
        });
      });
    });

    const unsubCategories = onSnapshot(categoriesQuery, (snapshot) => {
      setCategories(snapshot.docs.map((item) => toCategory(item.id, item.data())));
    });

    return () => {
      unsubProfile();
      unsubTasks();
      unsubCategories();
    };
  }, [user]);

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
            updateDoc(doc(firestore, "users", user.uid, "tasks", task.id), {
              dueDate: task.dueDate,
              isCompleted: task.isCompleted,
              lastDailyRefresh: task.lastDailyRefresh,
              subtasks: task.subtasks,
              completionHistory: task.completionHistory,
              updatedAt: serverTimestamp()
            });
          });
        }

        return nextTasks;
      });
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  const actions = useMemo(
    () => ({
      addTask: async (task: TaskDraft) => {
        const preparedTask = prepareTaskDraft(task);
        const notificationId = profile.pushNotifications ? await scheduleTaskReminder(preparedTask) : null;

        if (db && user && !user.isDemo) {
          const created = await addDoc(collection(db, "users", user.uid, "tasks"), {
            ...preparedTask,
            subtasks: preparedTask.subtasks || [],
            attachments: preparedTask.attachments || [],
            completionHistory: preparedTask.completionHistory || [],
            notificationId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          return created.id;
        }

        const id = `task-${cleanId()}`;
        const nextTask: Task = {
          ...preparedTask,
          id,
          subtasks: preparedTask.subtasks || [],
          attachments: preparedTask.attachments || [],
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
        const nextNotificationId =
          mergedTask && profile.pushNotifications ? await scheduleTaskReminder(mergedTask) : task.notificationId ?? existing?.notificationId ?? null;

        if (existing?.notificationId && existing.notificationId !== nextNotificationId) {
          await cancelTaskReminder(existing.notificationId);
        }

        if (db && user && !user.isDemo) {
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
          return;
        }

        setTasks((current) =>
          current.map((item) =>
            item.id === taskId && mergedTask ? { ...item, ...mergedTask, notificationId: nextNotificationId, updatedAt: dateString() } : item
          )
        );
      },
      deleteTask: async (taskId: string) => {
        const existing = tasks.find((item) => item.id === taskId);
        await cancelTaskReminder(existing?.notificationId);

        if (db && user && !user.isDemo) {
          await deleteDoc(doc(db, "users", user.uid, "tasks", taskId));
          await Promise.all((existing?.attachments || []).map((attachment) => deleteStoredFile(attachment.storagePath)));
          return;
        }

        await Promise.all((existing?.attachments || []).map((attachment) => deleteStoredFile(attachment.storagePath)));
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
          await updateDoc(doc(db, "users", user.uid, "tasks", taskId), {
            isCompleted,
            completionHistory,
            updatedAt: serverTimestamp()
          });
          return;
        }

        setTasks((current) => current.map((item) => (item.id === taskId ? { ...item, isCompleted, completionHistory, updatedAt: dateString() } : item)));
      },
      addCategory: async (name: string) => {
        const normalized = name.trim();
        if (!normalized) {
          return;
        }

        if (db && user && !user.isDemo) {
          await addDoc(collection(db, "users", user.uid, "categories"), {
            name: normalized,
            icon: "folder",
            color: "primary",
            taskCount: 0,
            createdAt: serverTimestamp()
          });
          return;
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
        const nextProfile = { ...profile, ...partial, updatedAt: dateString() };
        if (db && user && !user.isDemo) {
          await setDoc(doc(db, "users", user.uid), nextProfile, { merge: true });
        }
        setProfile(nextProfile);
      },
      uploadProfileAvatar: async (file: PickedFile) => {
        if (db && user && !user.isDemo) {
          const result = await uploadAvatar(user.uid, file);
          const nextProfile = { ...profile, avatarUrl: result.fileUrl, avatarStoragePath: result.storagePath, updatedAt: dateString() };

          try {
            await setDoc(doc(db, "users", user.uid), nextProfile, { merge: true });
            await deleteStoredFile(profile.avatarStoragePath);
            setProfile(nextProfile);
          } catch (cause) {
            await deleteStoredFile(result.storagePath);
            throw cause;
          }
          return;
        }

        setProfile((current) => ({ ...current, avatarUrl: file.uri, updatedAt: dateString() }));
      },
      addTaskAttachment: async (taskId: string, file: PickedFile) => {
        const existing = tasks.find((item) => item.id === taskId);
        if (!existing) {
          return;
        }

        let uploaded = {
          fileUrl: file.uri,
          storagePath: ""
        };

        if (db && user && !user.isDemo) {
          uploaded = await uploadTaskAttachment(user.uid, taskId, file);
        }

        const attachment: Attachment = {
          id: `attachment-${cleanId()}`,
          fileUrl: uploaded.fileUrl,
          fileName: file.name,
          fileType: file.mimeType || "application/octet-stream",
          storagePath: uploaded.storagePath,
          createdAt: dateString()
        };
        const attachments = [...existing.attachments, attachment];

        if (db && user && !user.isDemo) {
          try {
            await updateDoc(doc(db, "users", user.uid, "tasks", taskId), {
              attachments,
              updatedAt: serverTimestamp()
            });
          } catch (cause) {
            await deleteStoredFile(uploaded.storagePath);
            throw cause;
          }
          return;
        }

        setTasks((current) => current.map((item) => (item.id === taskId ? { ...item, attachments, updatedAt: dateString() } : item)));
      },
      removeTaskAttachment: async (taskId: string, attachmentId: string) => {
        const existing = tasks.find((item) => item.id === taskId);
        const attachment = existing?.attachments.find((item) => item.id === attachmentId);

        if (!existing || !attachment) {
          return;
        }

        await deleteStoredFile(attachment.storagePath);
        const attachments = existing.attachments.filter((item) => item.id !== attachmentId);

        if (db && user && !user.isDemo) {
          await updateDoc(doc(db, "users", user.uid, "tasks", taskId), {
            attachments,
            updatedAt: serverTimestamp()
          });
          return;
        }

        setTasks((current) => current.map((item) => (item.id === taskId ? { ...item, attachments, updatedAt: dateString() } : item)));
      }
    }),
    [profile, tasks, user]
  );

  const value = useMemo<TaskContextValue>(
    () => ({
      profile,
      tasks,
      categories: recalculateCategories(categories, tasks),
      loading,
      ...actions
    }),
    [actions, categories, loading, profile, tasks]
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
