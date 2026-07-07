// fileStorage.ts
// High-level file storage abstraction.
// The rest of the app uses ONLY this service for file operations.
// Internally, it delegates to IndexedDB.
import { storeFile, getFile, deleteFile, fileExists } from "./indexedDbService";
/**
 * Save a file to IndexedDB.
 * The `id` should be the document/attachment ID from the app.
 */
export async function saveFile(id, data, type, name) {
    await storeFile(id, data, type, name);
}
/**
 * Retrieve a file from IndexedDB.
 * Returns null if the file doesn't exist.
 */
export async function loadFile(id) {
    return getFile(id);
}
/**
 * Delete a file from IndexedDB.
 */
export async function removeFile(id) {
    await deleteFile(id);
}
/**
 * Check if a file exists in IndexedDB.
 */
export async function hasFile(id) {
    return fileExists(id);
}
/**
 * Extract file metadata from a "FILE:" formatted string.
 * Format: "FILE:|name|base64data|mimeType"
 */
export function parseFileString(raw) {
    if (!raw || !raw.startsWith("FILE:"))
        return null;
    const parts = raw.split("|");
    if (parts.length < 4)
        return null;
    return { name: parts[1] || "", data: parts[2] || "", type: parts[3] || "application/octet-stream" };
}
/**
 * Create a "FILE:" reference string (without the base64 data).
 * Format: "FILE:|name||mimeType" — the actual data lives in IndexedDB.
 */
export function createFileRef(name, type) {
    return `FILE:|${name}||${type}`;
}
