# ApplyWise — Tech Stack

**Version:** 1.0  
**Date:** July 3, 2026  

---

## What We Use (with Simple Explanations)

### Already Installed ✅

| Tool | What It Does | Version |
|------|-------------|---------|
| **Vue 3** | Builds everything the user sees and interacts with | 3.5.39 |
| **Vite** | Runs the app on your computer while you build it | 8.1.1 |
| **TypeScript** | JavaScript with spell-check — catches mistakes before they happen | 6.0.2 |

### Need to Install 🔧

| Tool | What It Does | Why We Need It |
|------|-------------|----------------|
| **Vue Router** | Lets users click between pages (Dashboard, Colleges, Essays, Documents) | Like tabs in a binder |
| **Pinia** | A shared whiteboard — every page sees the same data | Add a college on one page, the dashboard sees it instantly |

### No Install Needed (Built Into the Browser) 🌐

| Tool | What It Does | Why We Need It |
|------|-------------|----------------|
| **localStorage** | Saves all your data inside your browser | Your colleges, essays, and documents stay even after you close the app |
| **CSS** | Colors, fonts, and layout | Makes the app look clean and friendly |

---

## Why This Stack?

- **Simplest possible setup** — Only 2 new tools to install
- **No backend needed** — Everything runs in the browser
- **No database needed** — Data saved with localStorage
- **Fast to build** — We can focus on features, not setup
- **Easy to upgrade later** — If we want user accounts or a real database later, Vue + Pinia make it easy

---

## What We DON'T Need (Yet)

| Tool | Why Not Now |
|------|------------|
| Database (SQL, MongoDB) | No user accounts, so no shared data needed |
| Backend/Server (.NET, Express) | Everything runs in the browser |
| CSS Framework (Tailwind, Bootstrap) | Plain CSS is simpler and you learn more |
| Authentication (Login/Signup) | V1 is single-user |
