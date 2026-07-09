// cloudStorage.ts — replaces localStorage with Firestore for per-user data persistence
// Every store that uses getUserKey() will use this instead for cloud sync

import { saveUserData, loadUserData, getUserId } from "./firebaseService";

// Cache layer — keeps recently loaded data in memory for instant access
const cache = new Map<string, any>();

/**
 * Get the current user's ID. Returns null if not logged in.
 * For backward compatibility, falls back to localStorage session.
 */
export function getCloudUserId(): string | null {
  // Try Firebase first
  const fbId = getUserId();
  if (fbId) return fbId;
  // Fall back to localStorage session
  const session = localStorage.getItem("applywise-session");
  return session || null;
}

/**
 * Save data to Firestore for the current user.
 * Also saves to localStorage for offline/backup.
 */
export async function cloudSave(key: string, data: any): Promise<void> {
  const userId = getCloudUserId();
  if (!userId) return;
  cache.set(`${userId}:${key}`, data);
  // Always save to localStorage as backup
  localStorage.setItem(`user-${userId}-${key}`, JSON.stringify(data));
  // Also save to Firestore
  try {
    await saveUserData(userId, key, data);
  } catch (e) {
    console.warn("Firestore save failed (offline?):", key, e);
  }
}

/**
 * Load data from Firestore for the current user.
 * Falls back to localStorage if Firestore fails or user is offline.
 */
export async function cloudLoad(key: string): Promise<any | null> {
  const userId = getCloudUserId();
  if (!userId) return null;

  // Check cache first
  const cacheKey = `${userId}:${key}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  // Try Firestore
  try {
    const data = await loadUserData(userId, key);
    if (data !== null) {
      cache.set(cacheKey, data);
      return data;
    }
  } catch (e) {
    console.warn("Firestore load failed:", key, e);
  }

  // Fall back to localStorage
  const local = localStorage.getItem(`user-${userId}-${key}`);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      cache.set(cacheKey, parsed);
      return parsed;
    } catch {
      return local;
    }
  }

  return null;
}

/**
 * Initialize cloud sync for a store.
 * Loads data from Firestore (or localStorage as fallback).
 */
export async function initCloudStore(key: string): Promise<any | null> {
  return cloudLoad(key);
}
