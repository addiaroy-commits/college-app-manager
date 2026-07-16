# CogApp Netlify Deployment Guide

This guide records the deployment process for later. Following these steps will publish CogApp to Netlify, connect it to the existing Firebase project, and optionally attach a custom domain.

Do not begin deployment until the production build passes and the intended changes are committed to `main`.

## Stop: Cloud Sync Must Be Hardened Before Deployment

**This is a deployment blocker. Do not connect or publish the production site until the requirements below are implemented and verified.**

CogApp saves locally first and then synchronizes to Firebase. If Firebase is unavailable, data may remain only in the original browser's storage. A user can then sign in on another browser, device, hostname, or deployed domain and see an empty workspace even though the original local copy still exists.

Required before deployment:

- [ ] Display persistent **Saved locally**, **Syncing**, **Synced**, and **Sync failed** states.
- [ ] Include both structured records and uploaded files in sync status.
- [ ] Add a manual **Sync now** button with visible success or failure feedback.
- [ ] Prevent empty or stale devices from overwriting newer cloud records.
- [ ] Establish and test conflict resolution for edits from multiple devices.
- [ ] Verify every category in `SYNC_KEYS` across browsers and devices.
- [ ] Verify every uploaded document and attachment can be retrieved elsewhere.
- [ ] Test the same account in two browsers and on two physical devices.
- [ ] Test offline saving, reconnection, queued uploads, reloads, and failed Firebase connections.
- [ ] Add automatic recovery snapshots or versioned backups.
- [ ] Preserve and test the manual Dashboard backup and restore flow.
- [ ] Show Firebase and file-sync failures in the interface rather than only in developer logs.
- [ ] Complete a documented final cross-device data audit.

Account access and storage requirements:

- [ ] Add and test Google/Gmail sign-in.
- [ ] Add and test a secure **Forgot password** and reset-email flow.
- [ ] Define how Google sign-in links to an existing Addia account without creating a second empty profile or losing data.
- [ ] Audit browser local storage, IndexedDB, Firestore, Firebase Storage, exports, and recovery snapshots.
- [ ] Verify per-user Firestore and Firebase Storage security rules.
- [ ] Review file limits, supported types, deletion, retention, Firebase quotas, costs, and alerts.
- [ ] Verify complete data and file recovery from backups on another browser and device.

If the user asks to deploy, review every blocker in this section with them before performing any Netlify, Firebase Hosting, domain, or other production action. This includes cloud sync, Google/Gmail sign-in, password recovery, and storage review. Do not proceed merely because the production build succeeds.

## How Publishing Works

```text
Local development
    -> push a commit to GitHub
GitHub repository
    -> Netlify builds the project
Netlify website URL
    -> visitors use CogApp
Firebase
    -> accounts and personalized cloud data
```

The application code is stored on GitHub. Netlify downloads that code, runs the production build, and serves the resulting website. Firebase remains responsible for authentication, cloud data, and uploaded files.

## 1. Add SPA Routing Support

CogApp is a Vue single-page application. Netlify must return `index.html` when a visitor opens or refreshes an application route such as `/login`, `/applications`, or `/essays`.

Before deployment, add a file named `public/_redirects` containing:

```text
/*    /index.html    200
```

Without this rule, direct links and browser refreshes may display a Netlify 404 page.

Reference: [Netlify page-not-found and SPA routing guide](https://docs.netlify.com/resources/troubleshooting/page-not-found-error-guide/)

## 2. Verify the Release

Before publishing:

1. Confirm all intended changes are committed.
2. Confirm the current branch is `main`.
3. Run `npm run build`.
4. Resolve all build failures before continuing.
5. Confirm no secrets, private exports, or temporary files are included.

## 3. Connect GitHub to Netlify

1. Sign in at [Netlify](https://app.netlify.com/).
2. Select **Add new project**.
3. Select **Import an existing project**.
4. Choose **GitHub** and authorize the requested repository access.
5. Select the `college-app-manager` repository.
6. Configure the project with these values:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Base directory | Leave blank |
| Build command | `npm run build` |
| Publish directory | `dist` |

7. Review the settings.
8. Select **Deploy** only when ready to make the site public.

Netlify will produce an address similar to:

```text
https://your-cogapp-name.netlify.app
```

The generated Netlify address receives HTTPS automatically.

Reference: [Netlify HTTPS documentation](https://docs.netlify.com/manage/domains/secure-domains-with-https/https-ssl/)

## 4. Authorize the Netlify Domain in Firebase

CogApp uses the Firebase project `cog-app-2702j`. The new website hostname must be authorized before deployed login flows are tested.

1. Open [Firebase Console](https://console.firebase.google.com/).
2. Select the `cog-app-2702j` project.
3. Open **Authentication**.
4. Open **Settings**.
5. Find **Authorized domains**.
6. Add the Netlify hostname without `https://` or a trailing path.

Example:

```text
your-cogapp-name.netlify.app
```

If a custom domain is added later, add that hostname to Firebase Authorized Domains as well.

The deployed build must continue using the same Firebase project configuration. This allows the same CogApp accounts and cloud-synchronized data to work on localhost, Netlify, and other authorized domains.

## 5. Test the Netlify Deployment

Use a test account and verify all of the following:

- The public welcome page loads.
- Signup and login work.
- Logout works.
- Refreshing `/login`, `/applications`, and other routes does not show a 404.
- Existing colleges and application data load after login.
- New changes synchronize to Firebase.
- The same account loads those changes in another browser or device.
- Documents and other uploaded files can be downloaded on another device.
- The unified calendar and Due Next list show saved deadlines.
- Mobile navigation and the collapsible desktop sidebar work.
- Browser console errors are reviewed.

## 6. Automatic Deployment Warning

When Netlify is connected to GitHub, pushes to `main` normally trigger new production deployments automatically:

```text
edit -> test -> commit -> push main -> Netlify rebuilds and publishes
```

If every push should not become public automatically, disable automatic production deploys in Netlify and manually publish approved deployments. Decide this before connecting the production branch.

## 7. Optional Custom Domain

The generated `.netlify.app` address is sufficient for launch. A purchased domain is optional.

To add a domain such as `cogapp.com`:

1. Open the Netlify project's **Domain management** page.
2. Select **Add a domain**.
3. Enter the domain.
4. Follow Netlify's customized DNS instructions.
5. Update the DNS records at the domain registrar or DNS provider.
6. Wait for DNS verification and HTTPS certificate provisioning.
7. Add the custom hostname to Firebase Authorized Domains.
8. Test both the main domain and `www` configuration.

DNS changes can take several hours to propagate. Netlify automatically attempts to provision and renew an HTTPS certificate after the domain is configured correctly.

References:

- [Configure external DNS for Netlify](https://docs.netlify.com/manage/domains/configure-domains/configure-external-dns/)
- [Get started with Netlify domains](https://docs.netlify.com/manage/domains/get-started-with-domains/)

## Recommended Deployment Order

1. Add `public/_redirects`.
2. Run and verify `npm run build`.
3. Commit the routing change and any approved release work.
4. Connect the GitHub repository to Netlify.
5. Configure `main`, `npm run build`, and `dist`.
6. Deploy when ready.
7. Add the Netlify hostname to Firebase Authorized Domains.
8. Test authentication, routing, storage, and cross-device synchronization.
9. Configure a custom domain only after the Netlify address works correctly.

## Deployment Boundary

Writing or updating this guide does not deploy CogApp. Deployment occurs only when someone explicitly starts a Netlify deploy or enables an automatic deployment connection.
