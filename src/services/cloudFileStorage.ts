import {
  deleteObject,
  getBytes,
  getMetadata,
  ref,
  uploadString,
} from "firebase/storage";
import { doc, getDoc, writeBatch } from "firebase/firestore";
import { db, getUserId, storage } from "./firebaseService";

const MAX_FILE_BYTES = 20 * 1024 * 1024;
const FIRESTORE_CHUNK_SIZE = 700_000;

function requireUserId(): string {
  const userId = getUserId();
  if (!userId) throw new Error("Sign in before accessing files.");
  return userId;
}

function fileRef(id: string) {
  return ref(storage, `users/${requireUserId()}/files/${encodeURIComponent(id)}`);
}

function fallbackRef(userId: string, id: string) {
  return doc(db, "users", userId, "files", encodeURIComponent(id));
}

async function deleteFirestoreFallback(userId: string, id: string) {
  const metadataRef = fallbackRef(userId, id);
  const metadata = await getDoc(metadataRef);
  if (!metadata.exists()) return;
  const chunkCount = Number(metadata.data().chunkCount) || 0;
  const batch = writeBatch(db);
  for (let index = 0; index < chunkCount; index++) {
    batch.delete(doc(metadataRef, "chunks", String(index).padStart(3, "0")));
  }
  batch.delete(metadataRef);
  await batch.commit();
}

async function uploadFirestoreFallback(
  userId: string,
  id: string,
  data: string,
  type: string,
  name: string,
  updatedAt: number,
) {
  const metadataRef = fallbackRef(userId, id);
  const previous = await getDoc(metadataRef);
  const previousChunks = previous.exists()
    ? Number(previous.data().chunkCount) || 0
    : 0;
  const chunks: string[] = [];
  for (let index = 0; index < data.length; index += FIRESTORE_CHUNK_SIZE) {
    chunks.push(data.slice(index, index + FIRESTORE_CHUNK_SIZE));
  }

  const batch = writeBatch(db);
  for (let index = chunks.length; index < previousChunks; index++) {
    batch.delete(doc(metadataRef, "chunks", String(index).padStart(3, "0")));
  }
  chunks.forEach((chunk, index) => {
    batch.set(doc(metadataRef, "chunks", String(index).padStart(3, "0")), {
      data: chunk,
      index,
    });
  });
  batch.set(metadataRef, {
    id,
    name,
    type: type || "application/octet-stream",
    updatedAt,
    chunkCount: chunks.length,
    byteLength: Math.floor((data.length * 3) / 4),
  });
  await batch.commit();
}

async function downloadFirestoreFallback(userId: string, id: string) {
  const metadata = await getDoc(fallbackRef(userId, id));
  if (!metadata.exists()) throw new Error("Cloud file not found.");
  const raw = metadata.data();
  const chunkCount = Number(raw.chunkCount) || 0;
  const chunks = await Promise.all(
    Array.from({ length: chunkCount }, (_, index) =>
      getDoc(
        doc(
          metadata.ref,
          "chunks",
          String(index).padStart(3, "0"),
        ),
      ),
    ),
  );
  if (chunks.some((chunk) => !chunk.exists())) {
    throw new Error("Cloud file is incomplete.");
  }
  return {
    id,
    data: chunks.map((chunk) => chunk.data()!.data as string).join(""),
    type: raw.type || "application/octet-stream",
    name: raw.name || id,
    updatedAt: Number(raw.updatedAt) || Date.now(),
  };
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

export async function uploadFileToCloud(
  id: string,
  data: string,
  type: string,
  name: string,
  updatedAt: number,
): Promise<void> {
  const userId = requireUserId();
  try {
    await uploadString(fileRef(id), data, "base64", {
      contentType: type || "application/octet-stream",
      customMetadata: { originalName: name, updatedAt: String(updatedAt) },
    });
    void deleteFirestoreFallback(userId, id).catch(() => {});
  } catch {
    await uploadFirestoreFallback(userId, id, data, type, name, updatedAt);
  }
}

export async function downloadFileFromCloud(id: string) {
  const userId = requireUserId();
  try {
    const target = fileRef(id);
    const [metadata, bytes] = await Promise.all([
      getMetadata(target),
      getBytes(target, MAX_FILE_BYTES),
    ]);
    return {
      id,
      data: bytesToBase64(new Uint8Array(bytes)),
      type: metadata.contentType || "application/octet-stream",
      name: metadata.customMetadata?.originalName || id,
      updatedAt: Number(metadata.customMetadata?.updatedAt) || Date.now(),
    };
  } catch {
    return downloadFirestoreFallback(userId, id);
  }
}

export async function deleteFileFromCloud(id: string): Promise<void> {
  const userId = requireUserId();
  const results = await Promise.allSettled([
    deleteObject(fileRef(id)),
    deleteFirestoreFallback(userId, id),
  ]);
  if (results.every((result) => result.status === "rejected")) {
    throw (results[1] as PromiseRejectedResult).reason;
  }
}
