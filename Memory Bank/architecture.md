# ApplyWise — Architecture Map

> Cheat sheet: what every file does, in plain English.

---

## 📂 Root Files

| File | What It Does |
|------|-------------|
| `index.html` | The starting point — browser loads this first |
| `package.json` | List of all tools and libraries installed |
| `vite.config.ts` | Engine config — makes the app run on your computer |
| `tsconfig.json` / `tsconfig.app.json` | TypeScript rules — like spell-check for code |
| `AGENTS.md` | Notes for AI assistants (me!) — project location, commands |

---

## 📂 `src/` — The Main App

| File | What It Does |
|------|-------------|
| `main.ts` | Starts the app — plugs in Router, Pinia, and CSS |
| `App.vue` | The shell: shows sidebar + page content. Guest pages (login) show without sidebar |
| `style.css` | Global styles: colors, fonts, dark/light mode CSS variables |

---

## 📂 `src/router/`

| File | What It Does |
|------|-------------|
| `index.ts` | All page URLs and their matching components. Guards redirect to login if not signed in |

### Routes:
| URL | Page | Who Can See |
|-----|------|-------------|
| `/login` | LoginPage | 👥 Anyone |
| `/signup` | SignupPage | 👥 Anyone |
| `/` | Dashboard | 🔒 Logged in |
| `/colleges` | CollegeList | 🔒 Logged in |
| `/essays` | EssayTracker | 🔒 Logged in |
| `/essays/college/:id` | CollegeEssaysPage | 🔒 Logged in |
| `/essays/college/:id/essay/:id` | EssayDetailPage | 🔒 Logged in |
| `/documents` | DocumentVault | 🔒 Logged in |
| `/stats` | StatsPage | 🔒 Logged in |
| `/goals` | GoalsPage | 🔒 Logged in |

---

## 📂 `src/stores/` — The "Brains" (Pinia Stores)

| File | What It Stores |
|------|---------------|
| `userStore.ts` | User accounts — signup, login, logout, session |
| `userKey.ts` | Helper: creates user-specific localStorage keys so data stays separate |
| `collegeStore.ts` | College list — add, edit, delete, save to localStorage |
| `essayStore.ts` | Essays — add, edit, delete, save to localStorage |
| `documentStore.ts` | Uploaded files — save as base64 in localStorage |
| `goalStore.ts` | Personal goals — targets for budget, essays, colleges |
| `themeStore.ts` | Dark/light mode toggle — saved in localStorage |

### How Data Flow Works:
