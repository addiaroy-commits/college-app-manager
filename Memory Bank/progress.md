# CogApp — Progress Log

## Core Setup
- Vue 3 + TypeScript + Vite + Pinia + Vue Router
- localStorage with user-specific data keys (`getUserKey`)
- Sidebar navigation, dark/light themes, login/signup, onboarding

## Pages & Features

### Dashboard
- Summary cards: Colleges, Essays, and application command-center progress
- Compact Next Up agenda for colleges, tasks, recommendations, and scholarships
- Full calendar lives in Applications to avoid duplicate calendar experiences
- Quick stats: reach/target/safety, essay status breakdown

### College List
- Search 7,000+ colleges via College Scorecard database
- Add manually or search, categorize (Reach/Target/Safety), set deadlines (ED/EA/RD)
- Filter, search, organize

### Application Command Center
- Automatic per-college application checklists with custom requirements and due dates
- Essay and recommendation checklist progress comes directly from their real trackers
- Checklist dates inherit the college deadline unless the user sets a custom override
- Application pipeline from Not Started through submission and final decisions
- Readiness suggestions and incomplete-checklist warnings keep status and progress aligned
- Applicant portal details, submission dates, decision dates, and notes
- Task manager with links to existing essays, checklist items, recommendations, and documents
- Linked tasks automatically complete when their source work is complete
- Recommendation tracker with request/submission dates, college assignments, and thank-you status
- Combined calendar for college, checklist, task, recommendation, and scholarship deadlines
- Data syncs through Firebase and is included in JSON backup/restore

### Majors & Minors
- Browse 100+ majors across categories
- Set top 3 major/minor picks with ranking, notes, career goals
- Add custom majors with required category
- Delete custom majors

### Brag Sheet
- **SAT / ACT** tab (first tab): current scores, test history with multiple attempts, superscore calculation, target scores with progress bars
- **GPA** tab: independent scale selection (4.0/5.0/100/custom) for weighted & unweighted
- AP Scores with colored score badges (5=pink, 4=orange, 3/2=brown, 1=grey)
- Sports with league badges (Varsity=gold, JV=silver, rest=bronze)
- Courses, Clubs, Volunteer/Shadow/Jobs, Awards, Portfolio, Skills, Family tabs
- Custom tabs support, file attachments

### Essay Tracker
- College essays (linked to colleges with essay targets)
- Common App Essays card (7 prompts with toggle)
- **Scholarship / Awards / Other Essays** section: Scholarship vs Other (custom name), separate display
- Full editor with word counter, status tracking, document attachments
- Confetti on "Done" status

### Scholarships
- Dashboard cards: Total, Possible Awards, Won, Applied, Pending, Due in 30 Days, Strong Matches, Missing Materials
- **Your Scholarships** / All Scholarships toggle tabs
- User-created scholarships always at top; "Added by You" badge
- Sample scholarships with "Customized Sample" badge + "Remove from Your Scholarships"
- 18 seed scholarships (Coca-Cola, Gates, Dell, Elks, etc.)
- Filter by status, type, match score, effort, deadline; sort by deadline/amount/match/effort/priority
- Detail modal with 5 tabs: Overview, Materials Checklist, Docs, Essays, AI Help
- Materials checklist (click to cycle status, add custom items)
- Document linking with **picker modal** (checkboxes, multi-select)
- Essay linking with picker modal (only scholarship essays shown)
- AI Assistant panel (mock): explain, qualify, prioritize, outline, reuse
- Quick actions: Mark Submitted / Won (confetti!) / Rejected
- Scam detection badges + warnings
- Match scoring (0-100) from GPA, majors, colleges, activities
- Service files: scholarshipMatcher.ts, scholarshipService.ts, collegeScorecardAidService.ts

### Costs Tracker
- Tuition, aid, loans per college with auto-fill from government data
- Summary row: Total Aid, Total Loans
- **Scholarship Money Won** section showing total won amount (only when > $0)

### Goals
- Goal types: Tuition Budget, App Fee Budget, College Applications, Essays, Scholarship Money Won, SAT Score, ACT Score, Custom
- Progress bars auto-fill from actual data (scholarship money, SAT superscore, ACT best, etc.)
- Validation with clear alerts

### Stats
- Colleges: total, reach/target/safety breakdown, pie chart
- Essays: total, status breakdown, progress ring
- Documents by type
- **Scholarship analytics**: total, submitted, won amount, total possible
- **SAT/ACT stats**: highest SAT, superscore, highest ACT, attempts, goal progress

### Document Vault
- Upload files, tag by type, link to colleges
- Unified doc list: Vault + Essay attachments + Brag Sheet + **Scholarship links**
- Search, preview, download

### Onboarding
- Steps follow sidebar tab order: College List → Applications → Majors → Brag Sheet → Essays → Costs → Goals & Stats → Documents → Scholarships

## Cross-Page Integrations
- Application Command Center totals and shortcut on the Dashboard
- College List entries automatically receive application checklists
- Scholarship deadlines on Dashboard calendar + upcoming list
- Scholarship money in Costs tab
- Scholarship goals with auto-progress in Goals page
- Scholarship analytics in Stats page
- Scholarship-linked documents in Document Vault
- SAT/ACT goals flow between Goals page and Brag Sheet
- Essay linking between Essay Tracker and Scholarships

## Sidebar Order
- Dashboard
- Applications: College List, Applications, Essays
- Profile: Majors, Brag Sheet, Documents
- Money: Costs, Scholarships
- Progress: Goals, Stats

## Bug Fixes
- Essay Tracker: Common App card click not opening (missing `showCommonApp` ref)
- Essay Tracker: scholarship essays disappearing (wrong save function routing)
- Dashboard: blank page (missing `scholarshipDeadlinesByDate` computed)
- Essay Tracker + Scholarships page: entire CSS blocks deleted by Python scripts
- Scholarships: removed-from-yours not persisting across tab switches
- Scholarships: popup overlap (z-index stacking)
- Goals: Add button silent failure (missing validation alerts)
- Dashboard: past deadlines showing in upcoming list
- Dashboard: scholarship deadlines from untouched samples showing
- Auth: protected routes now wait for Firebase Auth before deciding login state
- Auth: legacy localStorage sessions are no longer trusted as proof of login
- Cloud Sync: localStorage watcher no longer recursively triggers Firestore writes
- Cloud Sync: per-key timestamps prevent older cloud data from blindly overwriting newer local data
- Storage: IndexedDB migration is per-user and runs after authenticated sync setup
- Brag Sheet: custom tabs now save per user instead of globally
- Onboarding: completion now saves per user instead of globally
- Scholarships: match scoring now reads the real Brag Sheet storage key
- PWA: service worker registration is production-only and cache strategy is less stale-prone
- Cleanup: removed generated JavaScript copies from `src/`
