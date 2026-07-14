# CogApp — College Application Manager

Your all-in-one college application organizer. Every college, every essay, every deadline, every document — all in one place.

## Features

- **Dashboard** — Summary cards and one compact agenda for the closest application, task, recommendation, and scholarship deadlines
- **College List** — Search 7,000+ US colleges, categorize (Reach/Target/Safety), set deadlines (ED/EA/RD)
- **Application Command Center** — Per-college checklists, application statuses, linked tasks, recommendation letters, and one combined deadline calendar
- **Majors & Minors** — Browse 100+ majors, rank top 3 picks, add custom majors
- **Brag Sheet** — SAT/ACT scores with superscore, GPA with selectable scales, AP scores, clubs, sports, awards, volunteering, skills, family
- **Essay Tracker** — College essays, Common App prompts (7), Scholarship & Other essays with word count, status tracking, document attachments
- **Scholarships** — Find, organize, prioritize with match scoring, materials checklist, AI assistant, document & essay linking, confetti on wins
- **Costs Tracker** — Tuition auto-fill from government data, aid/loan tracking, scholarship money won
- **Goals** — Set targets for tuition, applications, essays, scholarships, SAT/ACT scores with auto-progress bars
- **Stats** — Charts, progress rings, scholarship analytics, SAT/ACT stats
- **Document Vault** — Upload, preview, download files from all sources (Vault, Essays, Brag Sheet, Scholarships)
- **Cloud Sync** — Firebase-backed login and Firestore data sync across devices, with local backup
- **Installable App** — PWA manifest and production service worker for install/offline support

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| Vue 3 + Composition API | UI framework |
| TypeScript | Type safety |
| Vite | Build tool |
| Pinia | State management |
| Vue Router | Client-side routing |
| Firebase Auth | User signup, login, logout, and sessions |
| Firestore | Cloud data sync |
| localStorage | Per-user local cache and backup |
| IndexedDB | Larger file storage |
| Service Worker | Production offline/install support |

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/     # Reusable UI components (AppSidebar.vue)
├── router/         # Vue Router configuration
├── services/       # Firebase, cloud sync, storage, backup, matching helpers
├── stores/         # Pinia stores (essay, college, scholarship, etc.)
├── views/          # Page components
├── App.vue         # Root component
├── main.ts         # Entry point + cloud sync engine
└── style.css       # Global styles
```

## Screenshots

> _Add screenshots of Dashboard, Scholarships, Essay Tracker, and Brag Sheet here_

## Roadmap

- [x] IndexedDB migration for larger file data
- [x] Firebase login and cloud data sync
- [x] Export/Import backups (JSON)
- [x] Application command center with checklists, tasks, recommendations, reminders, and calendar
- [ ] AI counselor with real API integration
- [ ] Calendar improvements (drag & drop, recurring tasks)
- [ ] CSV export/import
- [ ] Notifications for upcoming deadlines
- [ ] Scholarship matching via external APIs
- [ ] Mobile optimization
- [ ] Performance optimization (lazy loading, code splitting)
- [ ] Accessibility improvements (WCAG 2.1)
- [ ] Settings page (profile, preferences, data export)
- [ ] Demo mode with pre-populated data

## License

MIT
