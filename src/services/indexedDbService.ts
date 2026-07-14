import { getUserId } from "./firebaseService";

const DB_NAME = "cogapp-files";
const DB_VERSION = 2;
const LEGACY_STORE_NAME = "files";
const STORE_NAME = "user-files";

export type FileSyncStatus = "pending" | "synced";

export interface FileRecord {
  key: string;
  userId: string;
  id: string;
  data: string;
  type: string;
  name: string;
  updatedAt: number;
  syncStatus: FileSyncStatus;
}

function requireUserId(): string {
  const userId = getUserId();
  if (!userId) throw new Error("Sign in before accessing files.");
  return userId;
}

function recordKey(userId: string, id: string): string {
  return `${userId}:${id}`;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(LEGACY_STORE_NAME)) {
        db.createObjectStore(LEGACY_STORE_NAME, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "key" });
        store.createIndex("userId", "userId", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function storeFile(
  id: string,
  data: string,
  type: string,
  name: string,
  syncStatus: FileSyncStatus = "pending",
  updatedAt = Date.now(),
): Promise<void> {
  const userId = requireUserId();
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put({
      key: recordKey(userId, id),
      userId,
      id,
      data,
      type,
      name,
      updatedAt,
      syncStatus,
    } satisfies FileRecord);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

async function getScopedFile(id: string): Promise<FileRecord | null> {
  const userId = requireUserId();
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).get(recordKey(userId, id));
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

async function claimLegacyFile(id: string): Promise<FileRecord | null> {
  const db = await openDB();
  if (!db.objectStoreNames.contains(LEGACY_STORE_NAME)) {
    db.close();
    return null;
  }
  const legacy = await new Promise<any>((resolve, reject) => {
    const tx = db.transaction(LEGACY_STORE_NAME, "readonly");
    const request = tx.objectStore(LEGACY_STORE_NAME).get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
  if (!legacy) return null;

  await storeFile(
    id,
    legacy.data,
    legacy.type || "application/octet-stream",
    legacy.name || "document",
    "pending",
  );
  const copied = await getScopedFile(id);

  const cleanupDb = await openDB();
  await new Promise<void>((resolve) => {
    const tx = cleanupDb.transaction(LEGACY_STORE_NAME, "readwrite");
    tx.objectStore(LEGACY_STORE_NAME).delete(id);
    tx.oncomplete = () => {
      cleanupDb.close();
      resolve();
    };
    tx.onerror = () => {
      cleanupDb.close();
      resolve();
    };
  });
  return copied;
}

export async function getFile(id: string): Promise<FileRecord | null> {
  return (await getScopedFile(id)) || claimLegacyFile(id);
}

export async function deleteFile(id: string): Promise<void> {
  const userId = requireUserId();
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(recordKey(userId, id));
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export async function getAllFiles(): Promise<FileRecord[]> {
  const userId = requireUserId();
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx
      .objectStore(STORE_NAME)
      .index("userId")
      .getAll(IDBKeyRange.only(userId));
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

export async function fileExists(id: string): Promise<boolean> {
  return (await getFile(id)) !== null;
}

export async function clearAllFiles(): Promise<void> {
  const files = await getAllFiles();
  await Promise.all(files.map((file) => deleteFile(file.id)));
}
