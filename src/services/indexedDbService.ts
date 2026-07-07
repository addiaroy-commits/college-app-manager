// indexedDbService.ts
// Low-level IndexedDB operations — open, read, write, delete files.

const DB_NAME = "cogapp-files";
const DB_VERSION = 1;
const STORE_NAME = "files";

interface FileRecord {
  id: string;
  data: string; // base64
  type: string; // mime type
  name: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function storeFile(id: string, data: string, type: string, name: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put({ id, data, type, name } as FileRecord);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    db.close();
  });
}

export async function getFile(id: string): Promise<FileRecord | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
    db.close();
  });
}

export async function deleteFile(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    db.close();
  });
}

export async function getAllFiles(): Promise<FileRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
    db.close();
  });
}

export async function fileExists(id: string): Promise<boolean> {
  const f = await getFile(id);
  return f !== null;
}

export async function clearAllFiles(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    db.close();
  });
}
