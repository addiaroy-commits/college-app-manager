import { createFileRef, parseFileString, saveFile } from "./fileStorage";
import { getUserKey } from "../stores/userKey";

const MIGRATION_KEY = "__file-storage-v2-migrated";

export function isMigrated(): boolean {
  return localStorage.getItem(getUserKey(MIGRATION_KEY)) === "true";
}

function markMigrated(): void {
  localStorage.setItem(getUserKey(MIGRATION_KEY), "true");
}

export async function runMigration(): Promise<void> {
  if (isMigrated()) return;

  let migrated = 0;
  let failed = false;

  try {
    const storageKey = getUserKey("documents");
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const documents = JSON.parse(raw);
      let changed = false;
      for (const document of documents) {
        if (document.fileData?.length > 100) {
          await saveFile(
            document.id,
            document.fileData,
            document.fileType || "application/octet-stream",
            document.fileName || "document",
          );
          document.fileData = "";
          changed = true;
          migrated++;
        }
      }
      if (changed) localStorage.setItem(storageKey, JSON.stringify(documents));
    }
  } catch (error) {
    failed = true;
    console.warn("Document migration failed:", error);
  }

  try {
    const storageKey = getUserKey("essays");
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const essays = JSON.parse(raw);
      let changed = false;
      for (const essay of essays) {
        const parsed = parseFileString(essay.content);
        if (parsed?.data && parsed.data.length > 100) {
          await saveFile(`essay-${essay.id}`, parsed.data, parsed.type, parsed.name);
          essay.content = createFileRef(parsed.name, parsed.type);
          changed = true;
          migrated++;
        }
      }
      if (changed) localStorage.setItem(storageKey, JSON.stringify(essays));
    }
  } catch (error) {
    failed = true;
    console.warn("Essay attachment migration failed:", error);
  }

  try {
    const storageKey = getUserKey("brag");
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const items = JSON.parse(raw);
      let changed = false;
      for (const item of items) {
        for (const [field, value] of Object.entries(item.data || {})) {
          if (typeof value !== "string") continue;
          const parsed = parseFileString(value);
          if (parsed?.data && parsed.data.length > 100) {
            await saveFile(
              `brag-${item.id}-${field}`,
              parsed.data,
              parsed.type,
              parsed.name,
            );
            item.data[field] = createFileRef(parsed.name, parsed.type);
            changed = true;
            migrated++;
          }
        }
      }
      if (changed) localStorage.setItem(storageKey, JSON.stringify(items));
    }
  } catch (error) {
    failed = true;
    console.warn("Brag Sheet attachment migration failed:", error);
  }

  if (!failed) markMigrated();
  if (migrated) console.info(`Migrated ${migrated} attachments to durable storage.`);
}
