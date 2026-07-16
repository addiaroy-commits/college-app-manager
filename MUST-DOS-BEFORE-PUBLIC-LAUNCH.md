# MUST DOS BEFORE PUBLIC LAUNCH

This checklist contains work that must be completed and verified before CogApp is promoted as a fully public product.

## Deployment Blocker: Cloud Sync Reliability

**Do not deploy CogApp publicly until every item in this section is implemented and verified.**

The app currently saves locally first and synchronizes to Firebase afterward. If Firebase cannot connect, a user's changes can remain available only in that browser's local storage. The app does not currently make that state clear enough. This creates a risk that a user signs in on another browser, device, hostname, or deployed domain and sees an empty workspace because the original data never completed its cloud upload.

- [ ] Add a persistent, visible sync indicator with distinct states: **Saved locally**, **Syncing**, **Synced**, and **Sync failed**.
- [ ] Ensure the indicator reflects both structured account data and uploaded-file synchronization.
- [ ] Add a user-accessible **Sync now** control.
- [ ] Give failed synchronization a clear recovery action instead of relying only on console warnings.
- [ ] Prevent an empty or stale new device from overwriting newer cloud data.
- [ ] Define and test conflict resolution when two devices edit the same data.
- [ ] Confirm every key in `SYNC_KEYS` uploads, downloads, and reloads correctly.
- [ ] Confirm every uploaded document and attachment can be recovered on another device.
- [ ] Test signup, login, editing, logout, and relogin using two browsers on the same computer.
- [ ] Test the same account on two physical devices.
- [ ] Test synchronization between localhost and the intended production domain without treating origin-local storage as cloud proof.
- [ ] Test offline edits, reconnection, pending upload recovery, and forced refreshes.
- [ ] Add automatic recovery snapshots or versioned backups that cannot be silently replaced by an empty workspace.
- [ ] Keep the manual Dashboard export/restore flow working and document it for users.
- [ ] Verify Firestore and Firebase Storage failures are visible in the interface.
- [ ] Complete a final cross-device data audit before enabling public signup.

## Deployment Blocker: Account Access And Storage

**Complete and test these account and storage requirements before public deployment.**

- [ ] Add Google/Gmail account sign-in alongside the existing Addia username and password flow.
- [ ] Add a clear **Forgot password** flow that sends a secure Firebase password-reset email.
- [ ] Test signup, Google sign-in, standard login, password reset, logout, and account recovery from beginning to end.
- [ ] Decide how an existing Addia account and a Google account with the same person should be linked without splitting or losing their data.
- [ ] Review every place the app stores information: browser local storage, IndexedDB, Firestore, Firebase Storage, and backup exports.
- [ ] Confirm Firestore and Firebase Storage security rules isolate every user's data and files.
- [ ] Review storage limits, file-size limits, supported file types, failed uploads, deletion, retention, and Firebase cost or quota alerts.
- [ ] Confirm deleting or replacing a file does not leave inaccessible copies or break another record.
- [ ] Verify backups and recovery snapshots contain every expected data category and uploaded file.
- [ ] Document what is stored locally, what is stored in Firebase, and what users should expect across browsers and devices.

### Mandatory Deployment Reminder

If deployment is requested, stop before any hosting action and review both deployment-blocker sections with the user. Deployment must not proceed until the user confirms that cloud synchronization, Google/Gmail sign-in, password recovery, storage security, backups, and cross-device tests have been completed.

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
