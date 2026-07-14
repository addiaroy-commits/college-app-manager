# CogApp — Tech Stack

**Updated:** July 9, 2026

## What We Use

| Tool | What It Does |
|------|-------------|
| Vue 3 + Composition API | Builds the app interface |
| TypeScript | Catches code mistakes before runtime |
| Vite | Runs and builds the app |
| Vue Router | Handles pages like Dashboard, Essays, Documents, and Login |
| Pinia | Keeps page state organized in stores |
| Firebase Auth | Handles real user signup, login, logout, and persisted sessions |
| Firestore | Stores user app data in the cloud for cross-device sync |
| localStorage | Keeps a per-user local backup and fast startup cache |
| IndexedDB | Stores larger uploaded file data outside localStorage |
| Service Worker + Web App Manifest | Enables production PWA install and same-origin offline caching |

## Current Data Model

CogApp is now a local-first app with Firebase cloud sync:

1. Users sign in with Firebase Auth.
2. Pinia stores read and write per-user localStorage keys.
3. The sync engine in `src/main.ts` mirrors selected user keys to Firestore.
4. Local writes get per-key timestamps so newer local data is not blindly overwritten by older cloud data.
5. Larger file payloads are migrated to IndexedDB through `storageService.ts`.

## Important Rules

- Do not trust `applywise-session` alone as proof of login. Firebase Auth is the source of truth.
- Keep user data keys per-user through `getUserKey(...)`.
- Avoid global localStorage keys for user-specific state.
- Do not add generated `.js` files beside TypeScript or Vue source files.
- Be careful with service worker changes because stale caches can make old app versions appear.

## Known Technical Debt

- Firebase increases the main bundle size; future work should code-split Firebase-heavy code.
- Firestore stores each app section as a JSON document value, which is simple but limits querying and partial updates.
- Conflict handling is timestamp-based, not a full merge system.
