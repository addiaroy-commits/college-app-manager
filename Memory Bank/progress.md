# CogApp — Progress Log

## Core Setup
- Vue 3 + TypeScript + Vite + Pinia + Vue Router
- localStorage with user-specific data keys (`getUserKey`)
- Sidebar navigation, dark/light themes, login/signup, onboarding

## Pages & Features

### Dashboard
- Summary cards: Colleges, Essays, Documents, Scholarships
- Upcoming deadlines panel (colleges + scholarships, future-only, top 10)
- Calendar view with college deadlines + scholarship dots
- Quick stats: reach/target/safety, essay status breakdown

### College List
- Search 7,000+ colleges via College Scorecard database
- Add manually or search, categorize (Reach/Target/Safety), set deadlines (ED/EA/RD)
- Filter, search, organize

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
- Steps follow sidebar tab order: College List → Majors → Brag Sheet → Essays → Costs → Goals & Stats → Documents → Scholarships

## Cross-Page Integrations
- Scholarship deadlines on Dashboard calendar + upcoming list
- Scholarship money in Costs tab
- Scholarship goals with auto-progress in Goals page
- Scholarship analytics in Stats page
- Scholarship-linked documents in Document Vault
- SAT/ACT goals flow between Goals page and Brag Sheet
- Essay linking between Essay Tracker and Scholarships

## Sidebar Order
Dashboard → College List → Majors → Brag Sheet → Essays → Costs → Goals → Scholarships → Stats → Documents

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
