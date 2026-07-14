# Learn CogApp By Building It

This file is a learning map for growing from "I can ask AI to build features" into "I understand what is happening, can make better product decisions, and can debug with confidence."

CogApp is a great learning project because it touches a lot of real app ideas: frontend screens, state, routing, login, cloud sync, file storage, offline behavior, data modeling, product design, and deployment.

## How To Use This

Do not try to learn everything at once. Pick one topic, read the files listed, then make one tiny experiment.

Good learning loop:

1. Read the concept.
2. Find where it appears in CogApp.
3. Change something small.
4. Run the app.
5. Explain back what happened in your own words.

## The Big Picture

CogApp is currently:

- A Vue app: the user interface lives in `.vue` files.
- A TypeScript app: most logic has typed data shapes.
- A Vite app: Vite runs the development server and builds the production app.
- A Pinia app: stores keep data organized across pages.
- A Firebase app: Firebase handles real login and cloud data sync.
- A local-first app: data is still cached in the browser for speed and backup.
- A PWA-style app: it has install/offline pieces through a manifest and service worker.

Main files to know:

- `src/main.ts`: starts the app and runs cloud sync.
- `src/router/index.ts`: controls which page appears for each URL.
- `src/App.vue`: wraps the whole app layout.
- `src/components/AppSidebar.vue`: sidebar navigation.
- `src/stores/userStore.ts`: login state.
- `src/services/firebaseService.ts`: Firebase setup.
- `src/services/cloudStorage.ts`: cloud/local data helpers.
- `src/stores/*Store.ts`: app data.
- `src/views/*.vue`: actual app pages.

## Level 1: Web App Foundations

### HTML, CSS, And JavaScript

What to learn:

- HTML gives the page structure.
- CSS controls the look.
- JavaScript/TypeScript controls behavior.

Where it appears:

- `index.html`
- `src/style.css`
- Any `.vue` file

Mini experiments:

- Change the app title in `index.html`.
- Change a color variable in `src/style.css`.
- Change a button label in one page.

You understand this when:

- You can point to where text, style, and behavior each live.

## Level 2: Vue Components

Vue components are reusable pieces of interface. A `.vue` file usually has:

- `<script setup>` for logic.
- `<template>` for HTML-like layout.
- `<style scoped>` for component-specific CSS.

Where it appears:

- `src/App.vue`
- `src/components/AppSidebar.vue`
- `src/components/ToastContainer.vue`
- every file in `src/views/`

Mini experiments:

- Add a new sidebar label.
- Add a small helper paragraph to the Dashboard.
- Find a `v-if` and explain what condition makes something show.

Concepts to learn:

- `ref`
- `computed`
- `v-if`
- `v-for`
- `v-model`
- event handlers like `@click`

You understand this when:

- You can explain why changing a `ref` updates the screen.

## Level 3: Routing

Routing is how the app decides which page to show for each URL.

Where it appears:

- `src/router/index.ts`
- `src/components/AppSidebar.vue`

Important ideas:

- `/login` shows Login.
- `/signup` shows Signup.
- `/` shows Dashboard.
- Protected pages require login.
- Onboarding can redirect first-time users.

Mini experiments:

- Find the route for `/scholarships`.
- Add a pretend route on paper before coding it.
- Explain what happens when a logged-out user visits `/documents`.

You understand this when:

- You can follow a sidebar click from link to route to page component.

## Level 4: State Management With Pinia

State is the app's memory while it is running. Pinia stores organize that memory.

Where it appears:

- `src/stores/collegeStore.ts`
- `src/stores/essayStore.ts`
- `src/stores/documentStore.ts`
- `src/stores/bragStore.ts`
- `src/stores/scholarshipStore.ts`
- `src/stores/userStore.ts`

Common pattern:

```ts
const items = ref([]);

function addItem(item) {
  items.value.push(item);
  save();
}
```

What to learn:

- Store data shape
- Add/update/delete functions
- How pages import and use stores
- Why shared state lets Dashboard know what was added on another page

Mini experiments:

- Trace how adding a college updates the College List.
- Trace how Dashboard gets the college count.
- Find one delete function and explain how it works.

You understand this when:

- You can tell which store owns each kind of data.

## Level 5: Browser Storage

CogApp uses browser storage so data does not vanish on refresh.

Storage types:

- `localStorage`: small key/value data, like essays and settings.
- `IndexedDB`: bigger file data, like uploaded documents.

Where it appears:

- `src/stores/userKey.ts`
- `src/services/storageService.ts`
- `src/services/fileStorage.ts`
- `src/services/indexedDbService.ts`

Important idea:

User data should use `getUserKey(...)` so different users do not overwrite each other.

Mini experiments:

- Find where colleges are saved.
- Find where SAT/ACT data is saved.
- Explain why global keys can be dangerous in a multi-user app.

You understand this when:

- You can explain the difference between app memory, localStorage, and IndexedDB.

## Level 6: Firebase And Backend Thinking

Firebase gives CogApp backend features without you running your own server.

Firebase pieces:

- Firebase Auth: signup, login, logout.
- Firestore: cloud database.

Where it appears:

- `src/services/firebaseService.ts`
- `src/services/cloudStorage.ts`
- `src/stores/userStore.ts`
- `src/main.ts`

Important ideas:

- The frontend sends signup/login requests to Firebase.
- Firebase confirms who the user is.
- Firestore stores each user's data.
- Local data and cloud data must be kept in sync carefully.

Questions to learn:

- What is a backend?
- What is authentication?
- What is a database?
- What is a user ID?
- What can go wrong with cloud sync?

Mini experiments:

- Read `signupUser`.
- Read `loginUser`.
- Find where `applywise-session` is set.
- Explain why old local sessions should not be trusted without Firebase.

You understand this when:

- You can explain why signup can fail if Firebase/network is unavailable.

## Level 7: Cloud Sync

Cloud sync means data can move between browser storage and Firestore.

Where it appears:

- `src/main.ts`
- `src/services/cloudStorage.ts`
- `src/services/firebaseService.ts`

Important ideas:

- Local changes get pushed to cloud.
- Cloud data can be pulled into localStorage.
- Timestamps help decide which copy is newer.
- Sync needs guards to avoid infinite save loops.

Things to watch:

- Which source wins: local or cloud?
- What happens if two devices edit at once?
- What happens while offline?
- How do deletes sync?

Mini experiments:

- Find `SYNC_KEYS` in `src/main.ts`.
- Add a fake key on paper and decide whether it should sync.
- Explain what `skipLocalBackup` protects against.

You understand this when:

- You can describe the journey of one essay from editor to localStorage to Firestore.

## Level 8: Data Modeling

Data modeling means deciding what shape your app's information should have.

Examples:

- A College has a name, category, deadline, fee, notes.
- An Essay has a prompt, word count, status, content.
- A Scholarship has amount, deadline, checklist, docs, essays.

Where it appears:

- TypeScript interfaces in `src/stores/*.ts`

Questions to ask:

- What fields are required?
- What fields are optional?
- What should be a list?
- What should link by ID instead of copying data?
- What happens when data changes shape later?

Mini experiments:

- Pick one interface and explain every field.
- Find a place where one feature links to another by ID.
- Design a new `RecommendationLetter` interface on paper.

You understand this when:

- You can design the data before designing the screen.

## Level 9: Product Design

Product design is deciding what the app should do and how it should feel.

CogApp product questions:

- What does a stressed college applicant need first?
- What should be one click away?
- What data should be shown on Dashboard?
- What should be hidden until needed?
- What should feel serious vs fun?

Where it appears:

- `src/views/Dashboard.vue`
- `src/components/AppSidebar.vue`
- `src/views/OnboardingPage.vue`

Mini experiments:

- Sketch a better Dashboard before coding.
- Write the top 5 user actions CogApp should make easy.
- Pick one page and remove anything that feels noisy.

You understand this when:

- You can explain not just what a feature does, but why it belongs.

## Level 10: Debugging

Debugging is the skill of asking: "What do I know, what changed, and where could this be breaking?"

Common app problems:

- Page does not load.
- Button does nothing.
- Data saves but disappears on refresh.
- Signup fails.
- Cloud data overwrites local data.
- Old app version appears because of cache.

Debugging checklist:

1. Can the project build?
2. Is there a browser console error?
3. Is the route correct?
4. Is the store loaded?
5. Did localStorage save the data?
6. Did Firebase accept the request?
7. Is the service worker showing stale files?

Useful commands:

```bash
npm run dev
npm run build
git status --short
git diff --stat
```

You understand this when:

- You can narrow a bug to page, store, storage, auth, or sync.

## Level 11: Git And Collaboration

Git is the safety net. It lets you save good versions and compare changes.

Important ideas:

- `git status` shows changed files.
- `git diff` shows exactly what changed.
- A commit is a checkpoint.
- Branches let you work without damaging the main version.

Mini experiments:

- Run `git status --short`.
- Read one diff.
- Write a commit message in plain English before committing.

Good commit style:

```text
fix: stabilize Firebase auth and cloud sync
feat: add recommendation letter tracker
docs: update architecture notes
```

You understand this when:

- You are not scared to experiment because you know how to see and save changes.

## Level 12: Performance

Performance is how fast and smooth the app feels.

Current performance facts:

- The app builds successfully.
- The app code is chunked.
- Firebase is still a large vendor chunk.

Where it appears:

- `vite.config.ts`
- build output from `npm run build`

Ideas to learn:

- Bundle size
- Code splitting
- Lazy loading
- Network requests
- Caching

Mini experiments:

- Compare build output before and after adding a dependency.
- Find which pages are lazy-loaded in the router.
- Think about which features do not need to load immediately.

You understand this when:

- You can explain why adding a library can make the app slower.

## Level 13: Security And Privacy

CogApp stores sensitive student information, so security matters.

Sensitive data examples:

- Essays
- Scores
- Family information
- Documents
- Scholarship info
- College plans

Things to learn:

- Authentication
- Authorization
- Firestore rules
- Password handling
- Data export
- Privacy expectations

Important principle:

The frontend cannot be trusted to protect data by itself. Firebase security rules matter.

Mini experiments:

- Write plain-English rules: "A user can only read and write their own data."
- Identify which pages contain the most sensitive information.
- Decide what should require confirmation before deleting.

You understand this when:

- You know the difference between hiding a button and securing data.

## Level 14: Testing

Testing means proving the app still works after changes.

Manual test flows:

- Sign up.
- Complete onboarding.
- Add a college.
- Add an essay.
- Upload a document.
- Add scholarship links.
- Log out and log back in.
- Refresh and confirm data stays.

Future automated testing ideas:

- Unit tests for stores.
- Integration tests for save/load.
- Browser tests for critical flows.

You understand this when:

- You can name the flows that must never break.

## Level 15: Feature Planning

Before building a feature, answer:

- Who is this for?
- What problem does it solve?
- What data does it need?
- Where does the data live?
- What page owns it?
- What other pages should reflect it?
- What could go wrong?

Example: Recommendation Letter Tracker

Data:

- recommender name
- email
- college
- deadline
- status
- notes
- document link

Pages affected:

- new tracker page
- Dashboard deadlines
- Document Vault
- Stats
- maybe Goals

You understand this when:

- You can predict the ripple effects before coding.

## Suggested Learning Path

Week 1: Vue basics

- Components
- `ref`
- `computed`
- `v-if`
- `v-for`
- `v-model`

Week 2: App structure

- Router
- Sidebar
- Views
- Stores

Week 3: Data

- TypeScript interfaces
- localStorage
- IndexedDB
- backup/export

Week 4: Backend

- Firebase Auth
- Firestore
- cloud sync
- security rules

Week 5: Product thinking

- Dashboard design
- user flows
- onboarding
- feature planning

Week 6: Quality

- debugging
- performance
- testing
- Git workflow

## Tiny Projects Inside CogApp

Use these as learning exercises:

1. Add a "last updated" label to one page.
2. Add a new filter to College List.
3. Add a new goal type.
4. Add a new document type.
5. Add a "Needs Review" essay status.
6. Add an empty-state message to a page.
7. Add a tiny setting to toggle confetti.
8. Add a mock Recommendation Letter Tracker.
9. Add a Dashboard card for one existing data type.
10. Add a privacy note to Signup.

## Vocabulary To Learn

- Component
- State
- Store
- Route
- Prop
- Event
- Ref
- Computed
- Interface
- LocalStorage
- IndexedDB
- Authentication
- Authorization
- Database
- API
- Cloud sync
- Cache
- Service worker
- PWA
- Bundle
- Build
- Deployment
- Commit
- Merge
- Conflict

## The North Star

The point is not to memorize every file.

The point is to build a mental map:

- Screens show things.
- Stores remember things.
- Services talk to outside systems.
- Router chooses screens.
- Firebase handles identity and cloud data.
- Browser storage keeps local copies.
- Git protects your progress.

Once that map clicks, adding features becomes way less mysterious.
