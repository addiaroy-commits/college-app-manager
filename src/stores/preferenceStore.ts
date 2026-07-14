import { defineStore } from "pinia";
import { ref } from "vue";

export interface AccountPreferences {
  notificationsEnabled: boolean;
  browserNotifications: boolean;
  reminderDays: number;
  reviewShowFinancials: boolean;
  reviewMessage: string;
}

const defaults: AccountPreferences = {
  notificationsEnabled: true,
  browserNotifications: false,
  reminderDays: 14,
  reviewShowFinancials: false,
  reviewMessage: "",
};

function preferenceKey(): string {
  const userId = localStorage.getItem("applywise-session");
  return userId ? `user-${userId}-preferences` : "applywise-preferences";
}

export const usePreferenceStore = defineStore("preferences", () => {
  const preferences = ref<AccountPreferences>({ ...defaults });

  try {
    const saved = localStorage.getItem(preferenceKey());
    if (saved) preferences.value = { ...defaults, ...JSON.parse(saved) };
  } catch {
    preferences.value = { ...defaults };
  }

  function save() {
    localStorage.setItem(preferenceKey(), JSON.stringify(preferences.value));
  }

  function update(updates: Partial<AccountPreferences>) {
    preferences.value = { ...preferences.value, ...updates };
    save();
  }

  return { preferences, update };
});

