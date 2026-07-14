import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import "./style.css";
import App from "./App.vue";
import { onAuthChange } from "./services/firebaseService";
import { cloudLoadRecord, cloudSave } from "./services/cloudStorage";
import { runMigration } from "./services/storageService";

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount("#app");

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch(() => {});
}

// ── Cross-Device Cloud Sync Engine ──
const SYNC_KEYS = [
  "colleges",
  "essays",
  "documents",
  "brag",
  "costs",
  "scholarships",
  "scholarship-goals",
  "goals",
  "top-picks",
  "custom-majors",
  "sat-act",
  "essay-targets",
  "command-center",
];

let currentUserId: string | null = null;
let syncInterval: number | null = null;
let isApplyingRemoteData = false;
let isWatchingLocalChanges = false;

function syncMetaKey(userId: string): string {
  return `user-${userId}-__sync-meta`;
}

function readSyncMeta(userId: string): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(syncMetaKey(userId)) || "{}");
  } catch {
    return {};
  }
}

function writeSyncMeta(userId: string, meta: Record<string, number>) {
  localStorage.setItem(syncMetaKey(userId), JSON.stringify(meta));
}

function getLocalUpdatedAt(userId: string, key: string): number {
  return readSyncMeta(userId)[key] || 0;
}

function markLocalUpdated(userId: string, key: string, updatedAt = Date.now()) {
  const meta = readSyncMeta(userId);
  meta[key] = updatedAt;
  writeSyncMeta(userId, meta);
  return updatedAt;
}

// Push ALL localStorage data to cloud for the current user
async function pushAllToCloud() {
  if (!currentUserId) return;
  for (const key of SYNC_KEYS) {
    const local = localStorage.getItem(`user-${currentUserId}-${key}`);
    if (local !== null) {
      try {
        const updatedAt =
          getLocalUpdatedAt(currentUserId, key) ||
          markLocalUpdated(currentUserId, key);
        await cloudSave(key, JSON.parse(local), {
          skipLocalBackup: true,
          updatedAt,
        });
      } catch {}
    }
  }
}

// Pull cloud data only when it is newer than the local copy.
async function syncFromCloud() {
  if (!currentUserId) return;
  let pulled = 0;
  for (const key of SYNC_KEYS) {
    try {
      const cloudRecord = await cloudLoadRecord(key);
      const localStorageKey = `user-${currentUserId}-${key}`;
      const local = localStorage.getItem(localStorageKey);
      const localUpdatedAt = getLocalUpdatedAt(currentUserId, key);

      if (cloudRecord === null) {
        if (local !== null) {
          const updatedAt = localUpdatedAt || markLocalUpdated(currentUserId, key);
          await cloudSave(key, JSON.parse(local), {
            skipLocalBackup: true,
            updatedAt,
          });
        }
        continue;
      }

      if (local === null || cloudRecord.updatedAt >= localUpdatedAt) {
        isApplyingRemoteData = true;
        localStorage.setItem(localStorageKey, JSON.stringify(cloudRecord.value));
        markLocalUpdated(currentUserId, key, cloudRecord.updatedAt || Date.now());
        isApplyingRemoteData = false;
        pulled++;
      } else {
        await cloudSave(key, JSON.parse(local), {
          skipLocalBackup: true,
          updatedAt: localUpdatedAt,
        });
      }
    } catch {
      isApplyingRemoteData = false;
    }
  }
  return pulled;
}

// Monitor localStorage changes and push to cloud
function watchLocalChanges() {
  if (isWatchingLocalChanges) return;
  isWatchingLocalChanges = true;
  const originalSetItem = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function (key: string, value: string) {
    originalSetItem(key, value);
    if (isApplyingRemoteData) return;
    // If this is user data being saved, push to cloud
    if (currentUserId && key.startsWith(`user-${currentUserId}-`)) {
      const dataKey = key.replace(`user-${currentUserId}-`, "");
      if (SYNC_KEYS.includes(dataKey)) {
        try {
          const updatedAt = markLocalUpdated(currentUserId, dataKey);
          void cloudSave(dataKey, JSON.parse(value), {
            skipLocalBackup: true,
            updatedAt,
          });
        } catch {}
      }
    }
  };
}

// Initialize sync engine on auth change
onAuthChange(async (user) => {
  if (user) {
    const uid = user.email?.split("@")[0] || user.uid;
    currentUserId = uid;
    localStorage.setItem("applywise-session", uid);

    const pulled = await syncFromCloud();
    await runMigration();

    // Stores load synchronously from localStorage, so refresh after remote data arrives.
    if (pulled && pulled > 0) {
      window.location.reload();
      return;
    }

    // Push local data to cloud (in case this device has newer data)
    await pushAllToCloud();

    // Periodic sync every 5 minutes (not 15 seconds — saves quota)
    if (syncInterval) clearInterval(syncInterval);
    syncInterval = window.setInterval(pushAllToCloud, 5 * 60 * 1000);

    // Start watching localStorage changes
    watchLocalChanges();
  } else {
    currentUserId = null;
    if (syncInterval) clearInterval(syncInterval);
    syncInterval = null;
  }
});
