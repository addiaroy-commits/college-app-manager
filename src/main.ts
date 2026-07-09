import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import "./style.css";
import App from "./App.vue";
import { onAuthChange } from "./services/firebaseService";
import { cloudLoad, cloudSave } from "./services/cloudStorage";

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount("#app");

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
];

let currentUserId: string | null = null;
let syncInterval: number | null = null;

// Push ALL localStorage data to cloud for the current user
async function pushAllToCloud() {
  if (!currentUserId) return;
  for (const key of SYNC_KEYS) {
    const local = localStorage.getItem(`user-${currentUserId}-${key}`);
    if (local !== null) {
      try {
        await cloudSave(key, JSON.parse(local));
      } catch {}
    }
  }
}

// Pull ALL cloud data into localStorage, overwriting local if cloud has data
async function pullAllFromCloud() {
  if (!currentUserId) return;
  let pulled = 0;
  for (const key of SYNC_KEYS) {
    try {
      const cloudData = await cloudLoad(key);
      if (cloudData !== null) {
        localStorage.setItem(
          `user-${currentUserId}-${key}`,
          JSON.stringify(cloudData),
        );
        pulled++;
      }
    } catch {}
  }
  return pulled;
}

// Monitor localStorage changes and push to cloud
function watchLocalChanges() {
  const originalSetItem = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function (key: string, value: string) {
    originalSetItem(key, value);
    // If this is user data being saved, push to cloud
    if (currentUserId && key.startsWith(`user-${currentUserId}-`)) {
      const dataKey = key.replace(`user-${currentUserId}-`, "");
      if (SYNC_KEYS.includes(dataKey)) {
        try {
          cloudSave(dataKey, JSON.parse(value));
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

    // ALWAYS pull from cloud on login — cloud is source of truth
    const pulled = await pullAllFromCloud();

    // If we pulled data or this is first login, reload to apply
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
