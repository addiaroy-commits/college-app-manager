# MUST DOS BEFORE PUBLIC LAUNCH

This checklist contains work that must be completed and verified before CogApp is promoted as a fully public product.

## Performance

### Lazy-load Firebase services

- [ ] Keep Firebase Authentication available during initial app startup so login state and protected routing continue to work.
- [ ] Stop initializing Firestore on the public marketing homepage.
- [ ] Load Firestore only after a signed-in user enters the application.
- [ ] Load Firebase Storage only when a user uploads, downloads, previews, restores, or deletes a document.
- [ ] Split Firebase Auth, Firestore, and Storage into separate production chunks instead of forcing everything into one `firebase` bundle.
- [ ] Confirm the public homepage no longer preloads the Firestore and Storage chunks.
- [ ] Rebuild the app and record the before-and-after initial download sizes.

### Regression checks after Firebase splitting

- [ ] Signup, login, logout, and remembered sessions still work.
- [ ] Account data still loads and saves correctly.
- [ ] Local-first saving and offline recovery still work.
- [ ] Document upload, preview, download, deletion, backup, and restore still work.
- [ ] A temporary Firebase or network failure does not crash the app.
- [ ] The production build completes without the large Firebase bundle warning.

## Current Baseline

- Firebase bundle before optimization: approximately 580 KB minified and 172 KB compressed.
- The current warning is a performance warning, not a build error.
- Do not hide the problem by only increasing Vite's `chunkSizeWarningLimit`.
