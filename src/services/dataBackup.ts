import { cloudSave } from "./cloudStorage";
import { getUserId } from "./firebaseService";
import {
  getStoredFiles,
  loadFile,
  restoreStoredFile,
  type StoredFile,
} from "./fileStorage";
import { BACKUP_KEYS } from "./syncKeys";
import { getUserKey } from "../stores/userKey";

export interface BackupData {
  version: string;
  exportedAt: string;
  accountId: string;
  keys: Record<string, any>;
  files: StoredFile[];
}

async function cacheReferencedFiles(keys: Record<string, any>) {
  const ids = new Set<string>();
  if (Array.isArray(keys.documents)) {
    keys.documents.forEach((document: any) => document?.id && ids.add(document.id));
  }
  if (Array.isArray(keys.essays)) {
    keys.essays.forEach((essay: any) => {
      if (essay?.content?.startsWith("FILE:")) ids.add(`essay-${essay.id}`);
    });
  }
  if (Array.isArray(keys.brag)) {
    keys.brag.forEach((item: any) => {
      Object.entries(item?.data || {}).forEach(([field, value]) => {
        if (typeof value === "string" && value.startsWith("FILE:")) {
          ids.add(`brag-${item.id}-${field}`);
        }
      });
    });
  }
  await Promise.all([...ids].map((id) => loadFile(id)));
}

export async function exportAllData(): Promise<void> {
  const accountId = getUserId();
  if (!accountId) throw new Error("Sign in before creating a backup.");

  const keys: Record<string, any> = {};
  for (const key of BACKUP_KEYS) {
    const raw = localStorage.getItem(getUserKey(key));
    if (raw === null) continue;
    try {
      keys[key] = JSON.parse(raw);
    } catch {
      keys[key] = raw;
    }
  }

  await cacheReferencedFiles(keys);
  const files = (await getStoredFiles()).map(({ key: _key, userId: _userId, ...file }) => file);
  const backup: BackupData = {
    version: "2.0",
    exportedAt: new Date().toISOString(),
    accountId,
    keys,
    files,
  };

  const blob = new Blob([JSON.stringify(backup)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `cogapp-full-backup-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function importAllData(file: File): Promise<number> {
  const accountId = getUserId();
  if (!accountId) throw new Error("Sign in before restoring a backup.");

  const backup = JSON.parse(await file.text()) as Partial<BackupData>;
  if (!backup.keys || !backup.version || typeof backup.keys !== "object") {
    throw new Error("This is not a valid CogApp backup file.");
  }

  let count = 0;
  for (const [key, value] of Object.entries(backup.keys)) {
    if (!(BACKUP_KEYS as readonly string[]).includes(key)) continue;
    localStorage.setItem(
      getUserKey(key),
      typeof value === "string" ? value : JSON.stringify(value),
    );
    await cloudSave(key, value);
    count++;
  }

  if (Array.isArray(backup.files)) {
    for (const storedFile of backup.files) {
      if (!storedFile?.id || !storedFile?.data) continue;
      await restoreStoredFile(storedFile);
      count++;
    }
  }

  return count;
}
