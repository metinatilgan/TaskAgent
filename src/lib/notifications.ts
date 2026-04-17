import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

import { Task, TaskDraft } from "../types";

export class NotificationPermissionDeniedError extends Error {
  constructor() {
    super("Notification permission was denied.");
    this.name = "NotificationPermissionDeniedError";
  }
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

function notificationDateForTask(task: Pick<Task | TaskDraft, "dueDate" | "dueTime" | "reminderTime">) {
  if (!task.dueDate) {
    return null;
  }

  const time = task.reminderTime || task.dueTime || "09:00";
  const scheduledAt = new Date(`${task.dueDate}T${time}:00`);

  if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() <= Date.now()) {
    return null;
  }

  return scheduledAt;
}

export const isNotificationPermissionDeniedError = (cause: unknown) => cause instanceof NotificationPermissionDeniedError;

export async function requestTaskNotificationPermission() {
  const existingPermission = await Notifications.getPermissionsAsync();

  if (existingPermission.granted) {
    return;
  }

  const permission = await Notifications.requestPermissionsAsync();

  if (!permission.granted) {
    throw new NotificationPermissionDeniedError();
  }
}

export async function scheduleTaskReminder(task: Pick<Task | TaskDraft, "title" | "dueDate" | "dueTime" | "reminderTime">) {
  const scheduledAt = notificationDateForTask(task);

  if (!scheduledAt) {
    return null;
  }

  await requestTaskNotificationPermission();

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("taskagent-reminders", {
      name: "TaskAgent hatırlatmaları",
      importance: Notifications.AndroidImportance.DEFAULT
    });
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: "TaskAgent hatırlatması",
      body: task.title || "Bekleyen bir odak noktan var."
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: scheduledAt,
      channelId: Platform.OS === "android" ? "taskagent-reminders" : undefined
    }
  });
}

export async function cancelTaskReminder(notificationId?: string | null) {
  if (!notificationId) {
    return;
  }

  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export async function cancelAllTaskReminders(notificationIds: Array<string | null | undefined>) {
  await Promise.all(notificationIds.filter((notificationId): notificationId is string => Boolean(notificationId)).map(cancelTaskReminder));
}
