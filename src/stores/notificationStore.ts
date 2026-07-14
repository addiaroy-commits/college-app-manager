import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { useRouter } from "vue-router";
import { useCollegeStore } from "./collegeStore";
import { useApplicationStore } from "./applicationStore";
import { useScholarshipStore } from "./scholarshipStore";
import { useResearchStore } from "./researchStore";
import { usePreferenceStore } from "./preferenceStore";
import { getUserKey } from "./userKey";
import { isDemoMode } from "../services/demoMode";

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
  const colleges = useCollegeStore();
  const applications = useApplicationStore();
  const scholarships = useScholarshipStore();
  const research = useResearchStore();
  const preferences = usePreferenceStore();
  const readIds = ref<string[]>(readIdsFromStorage());

  const notifications = computed<AppNotification[]>(() => {
    if (!preferences.preferences.notificationsEnabled) return [];
    const reminderDays = preferences.preferences.reminderDays;
    const items: AppNotification[] = [];
    const add = (
      id: string,
      title: string,
      detail: string,
      date: string,
      route: string,
    ) => {
      if (!date) return;
      const daysAway = dayDifference(date);
      if (daysAway > reminderDays || daysAway < -30) return;
      items.push({ id, title, detail, date, daysAway, urgency: urgency(daysAway), route });
    };

    colleges.colleges.forEach((college) => {
      const application = applications.applications.find(
        (item) => item.collegeId === college.id,
      );
      if (["Submitted", "Accepted", "Waitlisted", "Rejected", "Withdrawn"].includes(application?.status || "")) return;
      add(
        `college-${college.id}-${college.deadline}`,
        `${college.name} deadline`,
        `${college.applicationType || college.category} application`,
        college.deadline,
        "/applications",
      );
    });

    applications.tasks.forEach((task) => {
      if (task.status === "Done") return;
      const college = colleges.colleges.find((item) => item.id === task.collegeId);
      add(
        `task-${task.id}-${task.dueDate}`,
        task.title,
        college?.name || task.type,
        task.dueDate,
        "/applications",
      );
    });

    applications.recommendations.forEach((recommendation) => {
      if (["Submitted", "Declined"].includes(recommendation.status)) return;
      add(
        `recommendation-${recommendation.id}-${recommendation.dueDate}`,
        `${recommendation.name}'s recommendation`,
        recommendation.role || "Recommendation letter",
        recommendation.dueDate,
        "/applications",
      );
    });

    scholarships.scholarships.forEach((scholarship) => {
      const isActive = !scholarship.isSample || scholarship.status !== "Not Started";
      if (!isActive || ["Won", "Rejected"].includes(scholarship.status)) return;
      add(
        `scholarship-${scholarship.id}-${scholarship.deadline}`,
        scholarship.name,
        `$${scholarship.awardAmount.toLocaleString()} scholarship deadline`,
        scholarship.deadline,
        "/scholarships",
      );
    });

    research.visits.forEach((visit) => {
      if (dayDifference(visit.date) < 0) return;
      const college = colleges.colleges.find((item) => item.id === visit.collegeId);
      add(
        `visit-${visit.id}-${visit.date}`,
        `${college?.name || "College"}: ${visit.type}`,
        visit.contact || "Visit or interview",
        visit.date,
        "/research",
      );
    });

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
