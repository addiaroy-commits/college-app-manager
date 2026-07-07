# ApplyWise — Product Requirements Document (PRD)

**Version:** 1.0  
**Created:** July 3, 2026  
**Author:** Addia Roy (with DeepSeek AI via Zed)  
**Status:** Draft — Awaiting Review  

---

## 1. What Is ApplyWise?

ApplyWise is a web application that helps **any student** manage their college application process — all in one place. Instead of juggling spreadsheets, sticky notes, and scattered folders, students get a single, organized dashboard to track everything that matters.

---

## 2. Who Is It For?

- **Primary User:** High school students applying to college
- **Goal:** Help students who feel overwhelmed by the application process stay organized and confident

---

## 3. Core Problem

College applications involve tracking multiple schools, writing dozens of essays, managing deadlines, and keeping documents organized. Most students use a messy mix of Google Docs, spreadsheets, and email — and things fall through the cracks.

**ApplyWise solves this** by putting everything in one, easy-to-use dashboard.

---

## 4. MVP Features (Version 1.0)

The first version of ApplyWise focuses on **three core features**:

---

### 4.1 🏫 College List Tracker

Students can build and manage their list of colleges.

**Data tracked per college:**
- College name
- Category (Reach / Target / Safety)
- Application deadline
- Application fee (dollar amount)
- Required essays (linked to the Essay Tracker)
- Personal notes

**What the user can do:**
- Add a new college
- Edit college details
- Delete a college
- See the full list at a glance
- Filter by category (Reach, Target, Safety)
- Search by name

---

### 4.2 ✍️ Essay Tracker

Students can manage every essay they need to write, right inside the app.

**Data tracked per essay:**
- Title or short description
- Which college it belongs to
- The essay prompt (the question being answered)
- Word count target (e.g., 650 words)
- Current word count
- Status (Not Started / Drafting / Done)
- The actual essay text (write inside the app)

**What the user can do:**
- Add a new essay
- Write and edit the essay text directly in the app
- See a live word counter as they type
- Change the status
- View all essays, or filter by college / status
- Delete an essay

---

### 4.3 📁 Document Vault (Transcripts & Portfolio)

Students can store and organize all important application documents.

**What the user can do:**
- Upload files (PDFs, images, Word docs)
- Add a file name and description
- Tag a document with a type (Transcript, Resume, Portfolio, Recommendation Letter, Other)
- Link a document to one or more colleges (e.g., "Sent this transcript to NYU and Boston University")
- View all documents, or filter by college
- Download uploaded files
- Delete files

---

## 5. Home Screen: The Dashboard

When a student opens ApplyWise, they see a **Dashboard** — a command center with everything at a glance.

**Dashboard shows:**
- Total number of colleges on their list (with Reach/Target/Safety breakdown)
- Number of essays and their statuses (Not Started / Drafting / Done)
- Upcoming deadlines (next 2-3 weeks)
- Recent documents uploaded
- Quick-add buttons (Add College, Add Essay, Upload Document)

---

## 6. What Is NOT in Version 1.0

These ideas are saved for future versions — but NOT the MVP:

- ❌ GPA & test score tracking
- ❌ Activities & awards log
- ❌ Recommender tracker
- ❌ Scholarship tracker
- ❌ Calendar/timeline view
- ❌ User accounts (login/signup)
- ❌ Multiple student profiles

**Why?** The Vibe Coding methodology says: build the core, test it, then add more. Starting small means a working app faster, with fewer bugs.

---

## 7. Design Principles

- **Simple and clean** — No clutter, no confusion
- **Fast** — Everything should feel snappy
- **Friendly** — Colorful but professional, aimed at students
- **Accessible** — Works on laptop screens (responsive design can come later)

---

## 8. Success Measurements

The MVP is a success when a student can:
1. Add, edit, and delete colleges with all required details
2. Write an essay, see its word count, and change its status
3. Upload a document, tag it, and link it to a college
4. See everything summarized on the dashboard

---

## 9. Next Steps (Per Vibe Coding Method)

1. ✅ PRD written (this document)
2. ⏳ Create `tech-stack.md` — Document the tools/languages we'll use
3. ⏳ Create `implementation-plan.md` — Step-by-step build recipe
4. ⏳ Start building, one step at a time
5. ⏳ Update `progress.md` and `architecture.md` after each step

---

*This PRD was written collaboratively between Addia Roy and DeepSeek AI, following the Vibe Coding methodology.*
