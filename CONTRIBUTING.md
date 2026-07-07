# Contributing to CogApp

## Getting Started

```bash
# Clone the repo
git clone <repo-url>
cd college-app-manager

# Install dependencies
npm install

# Start dev server
npm run dev
```

## Git Workflow

### Branches

| Branch | Purpose |
|--------|---------|
| `main` | Stable production code. Never commit directly. |
| `develop` | Latest stable development. Feature branches merge here. |
| `feature/*` | Individual features (e.g. `feature/scholarships`) |
| `bugfix/*` | Bug fixes (e.g. `bugfix/document-upload`) |
| `hotfix/*` | Critical production fixes |

### Workflow

1. Create a feature branch from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/my-feature
   ```

2. Commit frequently with clear messages.

3. Push your branch and create a Pull Request to `develop`.

4. After review and testing, merge into `develop`.

5. Periodically, `develop` is merged into `main` for releases.

## Commit Conventions

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <description>

[optional body]
```

### Types

| Type | Usage |
|------|-------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code restructuring without feature changes |
| `style` | CSS, formatting, whitespace (no logic changes) |
| `docs` | Documentation updates |
| `chore` | Build, dependencies, tooling |
| `test` | Adding or updating tests |
| `perf` | Performance improvements |

### Examples

```
feat: add scholarship tracker page
fix: resolve document upload error on Safari
refactor: simplify dashboard deadline computation
style: improve sidebar spacing on mobile
docs: update README with setup instructions
chore: upgrade Vue to 3.5
```

### Commit Frequency

- **Commit early and often** — at least once per logical change
- Commit whenever you finish a self-contained piece of work
- Push at the end of each coding session
- Create feature branches for any work spanning more than 1-2 commits

## Coding Guidelines

### Vue Components

- Use `<script setup lang="ts">` syntax
- Use Composition API (`ref`, `computed`, `watch`)
- Keep components focused — one responsibility per component
- Use Pinia stores for shared state
- Use `getUserKey()` for localStorage keys to support multi-user

### TypeScript

- Define interfaces for all data structures
- Avoid `any` where possible
- Use type assertions sparingly

### CSS

- Use scoped styles (`<style scoped>`)
- Use CSS variables from the theme system (`var(--bg-card)`, `var(--text-primary)`, etc.)
- Follow existing class naming conventions

### File Naming

- Components: PascalCase (`AppSidebar.vue`, `ScholarshipsPage.vue`)
- Stores: camelCase with `Store` suffix (`essayStore.ts`, `scholarshipStore.ts`)
- Services: camelCase (`scholarshipMatcher.ts`)

## Pull Request Checklist

- [ ] Code compiles without errors (`npm run build`)
- [ ] No existing functionality is broken
- [ ] New features follow existing patterns
- [ ] localStorage keys use `getUserKey()` for user isolation
- [ ] TypeScript interfaces are defined for new data structures
