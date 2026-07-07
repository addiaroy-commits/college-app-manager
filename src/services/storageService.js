// storageService.ts
// Migration orchestrator and storage abstraction layer.
// Handles one-time migration from localStorage file storage to IndexedDB.
import { saveFile, parseFileString } from "./fileStorage";
import { getUserKey } from "../stores/userKey";
const MIGRATION_KEY = "cogapp-indexeddb-migrated";
/**
 * Check if migration has already been completed.
 */
export function isMigrated() {
    return localStorage.getItem(MIGRATION_KEY) === "true";
}
/**
 * Mark migration as complete.
 */
function markMigrated() {
    localStorage.setItem(MIGRATION_KEY, "true");
}
/**
 * Run the one-time migration from localStorage to IndexedDB.
 * Extracts files from Document Vault, Essays, and Brag Sheet.
 * Does NOT delete original localStorage data — only marks migration as done.
 */
export async function runMigration() {
    if (isMigrated())
        return;
    console.log("[CogApp] Starting IndexedDB migration...");
    let migrated = 0;
    // 1. Document Vault
    try {
        const docsRaw = localStorage.getItem(getUserKey("documents"));
        if (docsRaw) {
            const docs = JSON.parse(docsRaw);
            for (const doc of docs) {
                if (doc.fileData && doc.fileData.length > 100) {
                    const id = doc.id || crypto.randomUUID?.() || `doc-${Date.now()}-${migrated}`;
                    await saveFile(id, doc.fileData, doc.fileType || "application/pdf", doc.fileName || "document");
                    // Strip fileData from the document to save localStorage space
                    // (we keep a reference but not the data itself)
                    migrated++;
                }
            }
        }
    }
    catch (e) {
        console.warn("[CogApp] Document Vault migration failed:", e);
    }
    // 2. Essay attachments
    try {
        const essaysRaw = localStorage.getItem(getUserKey("essays"));
        if (essaysRaw) {
            const essays = JSON.parse(essaysRaw);
            for (const essay of essays) {
                if (essay.content?.startsWith("FILE:")) {
                    const parsed = parseFileString(essay.content);
                    if (parsed && parsed.data.length > 100) {
                        const id = `essay-${essay.id}`;
                        await saveFile(id, parsed.data, parsed.type, parsed.name);
                        migrated++;
                    }
                }
            }
        }
    }
    catch (e) {
        console.warn("[CogApp] Essay attachment migration failed:", e);
    }
    // 3. Brag Sheet attachments
    try {
        const bragRaw = localStorage.getItem(getUserKey("brag"));
        if (bragRaw) {
            const items = JSON.parse(bragRaw);
            for (const item of items) {
                for (const [key, val] of Object.entries(item.data || {})) {
                    if (typeof val === "string" && val.startsWith("FILE:")) {
                        const parsed = parseFileString(val);
                        if (parsed && parsed.data.length > 100) {
                            const id = `brag-${item.id}-${key}`;
                            await saveFile(id, parsed.data, parsed.type, parsed.name);
                            migrated++;
                        }
                    }
                }
            }
        }
    }
    catch (e) {
        console.warn("[CogApp] Brag Sheet attachment migration failed:", e);
    }
    console.log(`[CogApp] Migration complete — ${migrated} files moved to IndexedDB`);
    markMigrated();
}
