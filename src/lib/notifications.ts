import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

import { Task, TaskDraft } from "../types";

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

export async function scheduleTaskReminder(task: Pick<Task | TaskDraft, "title" | "dueDate" | "dueTime" | "reminderTime">) {
  const scheduledAt = notificationDateForTask(task);

  if (!scheduledAt) {
    return null;
  }

  const permission = await Notifications.requestPermissionsAsync();

  if (!permission.granted) {
    return null;
  }

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
