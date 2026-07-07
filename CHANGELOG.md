# Changelog

All notable changes to CogApp will be documented in this file.

## [Unreleased]

### Added
- Scholarship tracker with match scoring, materials checklist, AI assistant, document/essay linking
- SAT/ACT tab in Brag Sheet with superscore calculation, test history, target scores
- GPA scale selection (4.0, 5.0, 100-point, custom) for weighted & unweighted
- Scholarship money tracking in Costs tab and Goals page
- "Your Scholarships" view with remove-from-yours persistence
- Confetti animation on scholarship wins
- Scholarship deadlines on Dashboard calendar
- Essay picker modal for scholarship essay linking
- Document picker modal with multi-select checkboxes
- AP Score color badges (5=pink, 4=orange, 3/2=brown, 1=grey)
- Sports league badges (Varsity=gold, JV=silver, rest=bronze)
- Custom majors with required category
- Scholarship/Other essay types in Essay Tracker

### Fixed
- Common App Essays card click not opening
- Scholarship essays disappearing on save
- Dashboard blank page (missing scholarshipDeadlinesByDate computed)
- CSS blocks deleted during automated edits
- Removed-from-yours not persisting across tab switches
- Popup modal overlap (z-index stacking)
- Goals "Add" button silent failure
- Dashboard showing past deadlines in upcoming list
- Scholarship deadlines from untouched sample scholarships appearing

### Changed
- Sidebar order: Dashboard → College List → Majors → Brag Sheet → Essays → Costs → Goals → Scholarships → Stats → Documents
- Onboarding steps synced with sidebar tab order
- Upcoming deadlines now show top 10 (was 5) and only future dates

## [1.0.0] - 2026-07-03

### Added
- Initial release with Dashboard, College List, Essay Tracker, Document Vault
- College Scorecard API integration for college search
- User accounts with localStorage isolation
- Theme system (Lilac, Ocean, Forest, Rose)
- Onboarding tutorial
- Goals page with progress tracking
- Stats page with charts and analytics
- Cost tracker with auto-fill tuition data
- Brag Sheet with GPA, Courses, AP Scores, Clubs, Sports, Volunteer, Awards, Portfolio, Skills, Family tabs
- Majors & Minors explorer
