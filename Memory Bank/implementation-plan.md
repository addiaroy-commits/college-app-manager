# ApplyWise — Implementation Plan

**Version:** 1.0  
**Date:** July 3, 2026  

---

## How This Plan Works

- Each step is small — you can finish it in one session
- Each step has a **TEST** — if the test passes, the step is done
- **NEVER move to the next step** until the current test passes
- After each step: update `progress.md` and `architecture.md`

---

## Phase 1: Project Setup 🏗️

### Step 1 — Install New Tools
Install Vue Router (for page navigation) and Pinia (for shared data).

**TEST:** Run `npm run dev` — the app should still start without errors.

---

### Step 2 — Set Up Pages & Navigation
Create four empty pages (Dashboard, College List, Essay Tracker, Document Vault) and a sidebar that lets you click between them.

**TEST:** Click each sidebar link — the page should change. The URL in the browser should update too (e.g., `/colleges`, `/essays`).

---

### Step 3 — Create the App Layout
Build a simple layout with a sidebar on the left and the main content area on the right. Add the app name "ApplyWise" at the top of the sidebar.

**TEST:** The app should have a sidebar visible on all pages, and the main area should change when you click different sidebar links.

---

## Phase 2: College List 🏫

### Step 4 — Create the College Data Store
Set up a Pinia store for colleges. It should hold a list of colleges and save/load them from localStorage. Start with the ability to add a college.

**TEST:** Open the browser's developer tools (F12), go to the "Application" tab → "Local Storage". Add a college through some test code — you should see it appear in localStorage.

---

### Step 5 — Build the College List Page (View Only)
Show all colleges in a list. Each college shows: name, category badge (Reach/Target/Safety with different colors), and deadline.

**TEST:** Add 2-3 test colleges to localStorage manually. They should appear on the College List page as cards or rows.

---

### Step 6 — Build the "Add College" Form
Create a form with fields: College Name, Category (dropdown: Reach/Target/Safety), Deadline (date picker), Application Fee ($), and Notes. A "Save" button adds the college to the list.

**TEST:** Fill out the form, click Save. The new college should appear on the list immediately. Refresh the page — it should still be there (saved in localStorage).

---

### Step 7 — Build Edit & Delete
Add an "Edit" button on each college that opens the form pre-filled. Add a "Delete" button with a confirmation (popup asking "Are you sure?").

**TEST:** 
- Edit a college, change its name, click Save — the list updates.
- Delete a college, confirm — it disappears.
- Refresh the page — changes are permanent.

---

### Step 8 — Add Filters & Search
Add category filter buttons (All / Reach / Target / Safety) and a search bar at the top of the college list.

**TEST:** 
- Click "Reach" — only Reach schools show.
- Type part of a college name — the list filters as you type.
- Clear the search — all colleges reappear.

---

## Phase 3: Essay Tracker ✍️

### Step 9 — Create the Essay Data Store
Set up a Pinia store for essays. Each essay has: title, college it belongs to, prompt, target word count, current word count, status (Not Started/Drafting/Done), and the essay text. Save/load from localStorage.

**TEST:** Add a test essay to localStorage. Verify it appears with all fields intact after a page refresh.

---

### Step 10 — Build the Essay List Page
Show all essays in a list/table. Each row shows: title, college name, word count (e.g., "450 / 650"), and status badge (color-coded).

**TEST:** Add 2-3 test essays to localStorage. They should appear as a list with correct status colors.

---

### Step 11 — Build the Essay Editor
Clicking an essay opens a full-page editor with: the essay prompt at the top, a text area to write in, a live word counter that updates as you type, a target word count display, and a status dropdown.

**TEST:** 
- Type in the editor — word count updates in real time.
- Change status to "Drafting" — badge updates.
- Go back to the essay list — the word count and status are saved.
- Refresh — everything is still there.

---

### Step 12 — Add New Essay Form
Create a form to add a new essay. Dropdown to pick which college it belongs to (loaded from the college store), text fields for title and prompt, number field for target word count. Status starts as "Not Started."

**TEST:** Add an essay for a specific college. It appears on the essay list. Open it — the editor is blank and the word count shows "0 / [target]".

---

## Phase 4: Document Vault 📁

### Step 13 — Create the Document Data Store
Set up a Pinia store for documents. Each document has: file name, description, type (Transcript/Resume/Portfolio/Recommendation/Other), linked colleges (multi-select), and the file data (stored as base64 text). Save/load from localStorage.

**TEST:** Add a test document to localStorage. Refresh — it should still be there with all fields.

---

### Step 14 — Build the Document Vault Page
Show all documents as cards or a list. Each shows: file name, type badge, linked colleges, and a download button.

**TEST:** Add test documents to localStorage. They should appear on the page with correct type badges and college links.

---

### Step 15 — Build File Upload
Create an upload section with: a file picker button, fields for name/description/type/colleges, and an "Upload" button. The file is converted to text and saved in localStorage.

**TEST:** 
- Click upload, pick a file (PDF or image), fill in the details, click Upload.
- The document appears in the vault.
- Click Download — the file should download.
- Refresh — document is still there.

---

### Step 16 — Add Delete for Documents
Add a delete button on each document card with confirmation.

**TEST:** Delete a document, confirm — it disappears. Refresh — still gone.

---

## Phase 5: Dashboard 📊

### Step 17 — Build the Dashboard Page
The homepage shows summary cards:
- A card for Colleges (total count + Reach/Target/Safety breakdown)
- A card for Essays (count by status: Not Started, Drafting, Done)
- A card for Upcoming Deadlines (next 3 deadlines, sorted by date)
- A card for Recent Documents (last 3 uploaded)
- Quick-add buttons that navigate to the right page

**TEST:** 
- Add data in all three sections (colleges, essays, docs).
- Go to Dashboard — all numbers should be correct.
- Click a quick-add button — it should take you to the right page.

---

## Phase 6: Polish ✨

### Step 18 — Style Everything
Apply consistent colors, fonts, and spacing across all pages. Make buttons, cards, forms, and badges look clean and friendly.

**TEST:** The app should look visually consistent. No ugly unstyled elements. Colors should match a cohesive theme.

---

### Step 19 — Final Testing
Go through ALL tests from Steps 1-18 one more time. Fix anything that's broken.

**TEST:** Every single test from every previous step must pass. The app is ready to use.

---

## Summary

| Phase | Steps | What You Build |
|-------|-------|---------------|
| 1. Setup | 1-3 | Install tools, create pages and navigation |
| 2. Colleges | 4-8 | Full college list with add, edit, delete, filter, search |
| 3. Essays | 9-12 | Essay list, editor with word counter, add new essays |
| 4. Documents | 13-16 | Upload, view, download, and delete documents |
| 5. Dashboard | 17 | Home page with summary cards |
| 6. Polish | 18-19 | Make it pretty, final testing |
