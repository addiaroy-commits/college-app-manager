# CogApp — College Application Manager

Your all-in-one college application organizer. Every college, every essay, every deadline, every document — all in one place.

## Features

- **Dashboard** — Calendar, upcoming deadlines, summary cards for colleges, essays, documents, and scholarships
- **College List** — Search 7,000+ US colleges, categorize (Reach/Target/Safety), set deadlines (ED/EA/RD)
- **Majors & Minors** — Browse 100+ majors, rank top 3 picks, add custom majors
- **Brag Sheet** — SAT/ACT scores with superscore, GPA with selectable scales, AP scores, clubs, sports, awards, volunteering, skills, family
- **Essay Tracker** — College essays, Common App prompts (7), Scholarship & Other essays with word count, status tracking, document attachments
- **Scholarships** — Find, organize, prioritize with match scoring, materials checklist, AI assistant, document & essay linking, confetti on wins
- **Costs Tracker** — Tuition auto-fill from government data, aid/loan tracking, scholarship money won
- **Goals** — Set targets for tuition, applications, essays, scholarships, SAT/ACT scores with auto-progress bars
- **Stats** — Charts, progress rings, scholarship analytics, SAT/ACT stats
- **Document Vault** — Upload, preview, download files from all sources (Vault, Essays, Brag Sheet, Scholarships)

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| Vue 3 + Composition API | UI framework |
| TypeScript | Type safety |
| Vite | Build tool |
| Pinia | State management |
| Vue Router | Client-side routing |
| localStorage | Data persistence (per-user keys) |

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
├── services/       # Business logic & API placeholders
├── stores/         # Pinia stores (essay, college, scholarship, etc.)
├── views/          # Page components
├── App.vue         # Root component
├── main.ts         # Entry point
└── style.css       # Global styles
```

## Screenshots

> _Add screenshots of Dashboard, Scholarships, Essay Tracker, and Brag Sheet here_

## Roadmap

- [ ] IndexedDB migration for larger data sets
- [ ] AI counselor with real API integration
- [ ] Calendar improvements (drag & drop, recurring deadlines)
- [ ] Export/Import backups (JSON, CSV)
- [ ] Notifications for upcoming deadlines
- [ ] Scholarship matching via external APIs
- [ ] Mobile optimization
- [ ] Performance optimization (lazy loading, code splitting)
- [ ] Accessibility improvements (WCAG 2.1)
- [ ] Settings page (profile, preferences, data export)
- [ ] Demo mode with pre-populated data
- [ ] Recommendation letter tracker

## License

MIT
