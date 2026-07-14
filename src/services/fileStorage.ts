import {
  deleteFile,
  fileExists,
  getAllFiles,
  getFile,
  storeFile,
  type FileRecord,
} from "./indexedDbService";
import {
  deleteFileFromCloud,
  downloadFileFromCloud,
  uploadFileToCloud,
} from "./cloudFileStorage";
import { getUserId } from "./firebaseService";

export interface StoredFile {
  id: string;
  data: string;
  type: string;
  name: string;
  updatedAt: number;
  syncStatus: "pending" | "synced";
}

export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

export function validateFileSize(file: File): string | null {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "Files must be 20 MB or smaller.";
  }
  return null;
}

async function syncFile(record: FileRecord): Promise<boolean> {
  if (!record.userId || getUserId() !== record.userId) return false;
  try {
    await uploadFileToCloud(
      record.id,
      record.data,
      record.type,
      record.name,
      record.updatedAt,
    );
    if (getUserId() !== record.userId) return true;
    await storeFile(
      record.id,
      record.data,
      record.type,
      record.name,
      "synced",
      record.updatedAt,
    );
    return true;
  } catch (error) {
    console.warn("File is saved locally and waiting for cloud sync:", record.id, error);
    return false;
  }
}

export async function saveFile(
  id: string,
  data: string,
  type: string,
  name: string,
): Promise<void> {
  const userId = getUserId();
  if (!userId) throw new Error("Sign in before saving files.");
  const updatedAt = Date.now();
  await storeFile(id, data, type, name, "pending", updatedAt);
  void syncFile({
    key: "",
    userId,
    id,
    data,
    type,
    name,
    updatedAt,
    syncStatus: "pending",
  });
}

export async function loadFile(id: string): Promise<StoredFile | null> {
  const userId = getUserId();
  if (!userId) return null;
  const local = await getFile(id);
  if (local) return local;

  try {
    const cloud = await downloadFileFromCloud(id);
    if (getUserId() !== userId) return null;
    await storeFile(
      cloud.id,
      cloud.data,
      cloud.type,
      cloud.name,
      "synced",
      cloud.updatedAt,
    );
    return { ...cloud, syncStatus: "synced" };
  } catch (error) {
    console.warn("File could not be loaded from cloud:", id, error);
    return null;
  }
}

export async function removeFile(id: string): Promise<void> {
  const userId = getUserId();
  if (!userId) return;
  await deleteFile(id);
  if (getUserId() !== userId) return;
  try {
    await deleteFileFromCloud(id);
  } catch (error: any) {
    if (error?.code !== "storage/object-not-found") {
      console.warn("Cloud file deletion will be retried manually:", id, error);
    }
  }
}

export async function hasFile(id: string): Promise<boolean> {
  if (await fileExists(id)) return true;
  return (await loadFile(id)) !== null;
}

export async function syncPendingFiles(): Promise<number> {
  let synced = 0;
  try {
    const pending = (await getAllFiles()).filter(
      (file) => file.syncStatus !== "synced",
    );
    for (const file of pending) {
      if (await syncFile(file)) synced++;
    }
  } catch (error) {
    console.warn("Pending files could not be synced:", error);
  }
  return synced;
}

export function getStoredFiles(): Promise<FileRecord[]> {
  return getAllFiles();
}

export async function restoreStoredFile(file: StoredFile): Promise<void> {
  const userId = getUserId();
  if (!userId) throw new Error("Sign in before restoring files.");
  await storeFile(
    file.id,
    file.data,
    file.type,
    file.name,
    "pending",
    file.updatedAt || Date.now(),
  );
  void syncFile({ ...file, key: "", userId, syncStatus: "pending" });
}

export function parseFileString(
  raw: string,
): { name: string; data: string; type: string } | null {
  if (!raw || !raw.startsWith("FILE:")) return null;
  const parts = raw.split("|");
  if (parts.length < 4) return null;
  return {
    name: parts[1] || "",
    data: parts[2] || "",
    type: parts[3] || "application/octet-stream",
  };
}

export function createFileRef(name: string, type: string): string {
  return `FILE:|${name}||${type}`;
}
