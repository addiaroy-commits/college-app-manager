import type { User } from "firebase/auth";
import {
  getLegacyUserId,
  loadUserDataRecord,
  saveUserData,
} from "./firebaseService";
import { BACKUP_KEYS } from "./syncKeys";

const migrations = new Map<string, Promise<void>>();

function migrateLocalData(uid: string, legacyId: string) {
  const legacyPrefix = `user-${legacyId}-`;
  const uidPrefix = `user-${uid}-`;

  const oldKeys = Array.from({ length: localStorage.length }, (_, index) =>
    localStorage.key(index),
  ).filter((key): key is string => Boolean(key?.startsWith(legacyPrefix)));
  for (const oldKey of oldKeys) {
    const newKey = uidPrefix + oldKey.slice(legacyPrefix.length);
    if (localStorage.getItem(newKey) !== null) continue;
    const value = localStorage.getItem(oldKey);
    if (value === null) continue;
    try {
      localStorage.setItem(newKey, value);
      localStorage.removeItem(oldKey);
    } catch {
      // Large legacy attachments can fill localStorage. Move the record while
      // retaining an in-memory copy so a failed write can be rolled back.
      localStorage.removeItem(oldKey);
      try {
        localStorage.setItem(newKey, value);
      } catch (error) {
        localStorage.setItem(oldKey, value);
        throw error;
      }
    }
  }

  const legacyGlobals: Record<string, string> = {
    "applywise-theme-dark": "theme-dark",
    "applywise-theme-color": "theme-color",
    "applywise-removed-scholarships": "removed-scholarships",
    "applywise-brag-custom-tabs": "brag-custom-tabs",
  };
  for (const [oldKey, dataKey] of Object.entries(legacyGlobals)) {
    const newKey = `${uidPrefix}${dataKey}`;
    let value = localStorage.getItem(oldKey);
    if (dataKey === "theme-color" && value && !value.startsWith('"')) {
      value = JSON.stringify(value);
    }
    if (value !== null && localStorage.getItem(newKey) === null) {
      localStorage.setItem(newKey, value);
    }
  }
}

async function migrateCloudData(uid: string, legacyId: string) {
  const results = await Promise.all(BACKUP_KEYS.map(async (key) => {
    try {
      const existing = await loadUserDataRecord(uid, key);
      if (existing) return true;
      const legacy = await loadUserDataRecord(legacyId, key);
      if (legacy) await saveUserData(uid, key, legacy.value, legacy.updatedAt);
      return true;
    } catch {
      // A locked-down deployment may reject the old username path. Local data
      // still migrates and will be uploaded to the UID path by the sync engine.
      return false;
    }
  }));
  return results.every(Boolean);
}

export function prepareUserIdentity(user: User): Promise<void> {
  const running = migrations.get(user.uid);
  if (running) return running;

  const migration = (async () => {
    const legacyId = getLegacyUserId(user);
    if (legacyId && legacyId !== user.uid) {
      migrateLocalData(user.uid, legacyId);
      localStorage.setItem("applywise-session", user.uid);
      const marker = `user-${user.uid}-__uid-cloud-migrated`;
      if (localStorage.getItem(marker) !== "true") {
        if (await migrateCloudData(user.uid, legacyId)) {
          localStorage.setItem(marker, "true");
        }
      }
    }
    localStorage.setItem("applywise-session", user.uid);
  })();

  migrations.set(user.uid, migration);
  return migration;
}
