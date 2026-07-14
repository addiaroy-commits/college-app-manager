// dataBackup.ts — Export/Import all user data as JSON

import { getUserKey } from "../stores/userKey";

const ALL_KEYS = [
  "colleges", "essays", "documents", "brag", "costs",
  "scholarships", "scholarship-goals", "goals", "top-picks",
  "custom-majors", "sat-act", "essay-targets", "brag-custom-tabs",
  "command-center", "onboarded",
];

export interface BackupData {
  version: string;
  exportedAt: string;
  keys: Record<string, any>;
}

/** Export all user data as a downloadable JSON file */
export function exportAllData(): void {
  const keys: Record<string, any> = {};
  for (const k of ALL_KEYS) {
    const raw = localStorage.getItem(getUserKey(k));
    if (raw) {
      try { keys[k] = JSON.parse(raw); } catch { keys[k] = raw; }
    }
  }

  const backup: BackupData = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    keys,
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `cogapp-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Import user data from a JSON file. Returns count of restored keys. */
export function importAllData(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const backup: BackupData = JSON.parse(reader.result as string);
        if (!backup.keys || !backup.version) {
          reject(new Error("Invalid backup file format."));
          return;
        }
        let count = 0;
        for (const [k, val] of Object.entries(backup.keys)) {
          const key = getUserKey(k);
          localStorage.setItem(key, typeof val === "string" ? val : JSON.stringify(val));
          count++;
        }
        resolve(count);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
