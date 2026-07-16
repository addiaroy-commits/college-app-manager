import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { useRouter } from "vue-router";
import { usePreferenceStore } from "./preferenceStore";
import { getUserKey } from "./userKey";
import { isDemoMode } from "../services/demoMode";
import { useDeadlineTimeline } from "../composables/useDeadlineTimeline";

export type NotificationUrgency = "overdue" | "urgent" | "soon" | "upcoming";

export interface AppNotification {
  id: string;
  title: string;
  detail: string;
  date: string;
  daysAway: number;
  urgency: NotificationUrgency;
  route: string;
}

function dayDifference(value: string): number {
  const due = new Date(`${value}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / 86400000);
}

function urgency(days: number): NotificationUrgency {
  if (days < 0) return "overdue";
  if (days <= 3) return "urgent";
  if (days <= 7) return "soon";
  return "upcoming";
}

function readIdsFromStorage(): string[] {
  try {
    return JSON.parse(localStorage.getItem(getUserKey("notification-read")) || "[]");
  } catch {
    return [];
  }
}

export const useNotificationStore = defineStore("notifications", () => {
  const router = useRouter();
  const preferences = usePreferenceStore();
  const { events: timelineEvents } = useDeadlineTimeline();
  const readIds = ref<string[]>(readIdsFromStorage());

  const notifications = computed<AppNotification[]>(() => {
    if (!preferences.preferences.notificationsEnabled) return [];
    const reminderDays = preferences.preferences.reminderDays;
    const items: AppNotification[] = [];
    for (const event of timelineEvents.value) {
      const daysAway = dayDifference(event.date);
      const eventWindow = event.reminderDays ?? reminderDays;
      if (daysAway > eventWindow || daysAway < -30) continue;
      items.push({
        id: `${event.id}-${event.date}`,
        title: event.title,
        detail: event.detail,
        date: event.date,
        daysAway,
        urgency: urgency(daysAway),
        route: event.route,
      });
    }

    return items.sort((a, b) => a.daysAway - b.daysAway || a.title.localeCompare(b.title));
  });

  const unreadCount = computed(
    () => notifications.value.filter((item) => !readIds.value.includes(item.id)).length,
  );

  function saveReadIds() {
    const activeIds = new Set(notifications.value.map((item) => item.id));
    readIds.value = readIds.value.filter((id) => activeIds.has(id));
    localStorage.setItem(getUserKey("notification-read"), JSON.stringify(readIds.value));
  }

  function markRead(id: string) {
    if (!readIds.value.includes(id)) readIds.value.push(id);
    saveReadIds();
  }

  function markAllRead() {
    readIds.value = notifications.value.map((item) => item.id);
    saveReadIds();
  }

  async function openNotification(item: AppNotification) {
    markRead(item.id);
    await router.push(item.route);
  }

  async function requestBrowserPermission(): Promise<NotificationPermission | "unsupported"> {
    if (!("Notification" in window)) return "unsupported";
    const permission = await Notification.requestPermission();
    preferences.update({ browserNotifications: permission === "granted" });
    return permission;
  }

  function deliverBrowserNotifications() {
    if (
      isDemoMode() ||
      !preferences.preferences.notificationsEnabled ||
      !preferences.preferences.browserNotifications ||
      !("Notification" in window) ||
      Notification.permission !== "granted"
    ) return;

    const dateKey = new Date().toISOString().slice(0, 10);
    const storageKey = getUserKey("browser-notifications-sent");
    let sent: string[] = [];
    try {
      sent = JSON.parse(localStorage.getItem(storageKey) || "[]");
    } catch {}

    notifications.value
      .filter((item) => item.daysAway <= 3)
      .slice(0, 3)
      .forEach((item) => {
        const token = `${dateKey}:${item.id}`;
        if (sent.includes(token)) return;
        const label = item.daysAway < 0
          ? `${Math.abs(item.daysAway)} days overdue`
          : item.daysAway === 0
            ? "Due today"
            : `Due in ${item.daysAway} days`;
        const notification = new Notification(item.title, {
          body: `${label}. ${item.detail}`,
          tag: item.id,
        });
        notification.onclick = () => {
          window.focus();
          void openNotification(item);
          notification.close();
        };
        sent.push(token);
      });
    localStorage.setItem(storageKey, JSON.stringify(sent.slice(-100)));
  }

  return {
    notifications,
    unreadCount,
    readIds,
    markRead,
    markAllRead,
    openNotification,
    requestBrowserPermission,
    deliverBrowserNotifications,
  };
});
