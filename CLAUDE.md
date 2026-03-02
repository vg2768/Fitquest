# FitQuest — Claude Code Guide

## Project Overview
Gamified fitness tracker PWA built with React (CRA). Single-page app with dark/light theme, Firebase auth, localStorage persistence, and custom program builder.

## Stack
- **React 18** (CRA / react-scripts 5) — no router, tab state managed in App
- **Firebase 12** — Google + Facebook OAuth only (no Firestore, auth only)
- **Inline styles** throughout — no CSS modules, no Tailwind
- **localStorage** for all persistence (no backend)

## Dev Workflow

### Preview server
The CRA dev server (`npm start`) crashes in the preview tool. Always use the static build approach:
```
preview_start → "FitQuest Dev"   # serves build/ on port 3001
```
After editing code, rebuild before previewing:
```bash
node "C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js" run build
```
Then reload: `preview_eval → window.location.reload()`

### Build
```bash
npm run build        # production build (CI=false to suppress warnings-as-errors)
npm run test:ci      # run tests non-interactively
npm run lint         # ESLint check
npm audit --audit-level=high   # dependency security audit
```

## Architecture

### File layout
```
src/
  App.jsx      # entire app (~1600 lines) — all components in one file
  firebase.js  # Firebase init, reads from REACT_APP_* env vars
  index.js     # ReactDOM.createRoot entry point
public/
  index.html   # fonts (DM Serif Display + Outfit), meta, title
.github/workflows/
  ci.yml       # build + test + audit on push/PR to main
  deploy.yml   # build + Vercel deploy on push to main
  security.yml # weekly CodeQL + dependency audit
vercel.json    # SPA routing + security headers (CSP, HSTS, X-Frame-Options, etc.)
.env           # local Firebase credentials (gitignored — never commit)
.env.example   # safe template showing required REACT_APP_* vars
```

### Theme system
```js
const ThemeContext = createContext();
// All components: const { t } = useContext(ThemeContext);
// DARK and LIGHT objects with ~25 color tokens each
// Toggle stored in localStorage key "fq_theme"
```

### Key localStorage keys
| Key | Content |
|-----|---------|
| `fq_user` | `{ name, gender, goal, level, uid?, email?, photoURL?, authProvider? }` |
| `fq_stats` | `{ xp, streak, bestStreak, totalWorkouts, totalVolume }` |
| `fq_history` | Array of completed workout objects |
| `fq_program` | Active program object (full copy) |
| `fq_custom_programs` | Array of user-created programs |
| `fq_theme` | `"dark"` or `"light"` |

### Components (all in App.jsx)
- `ErrorBoundary` — class component, wraps entire app
- `App` — shell, theme + state init, tab routing, reset/signout dialogs
- `Onboarding` → `LoginScreen` — auth flow
- `Home` — dashboard with XP bar, stats, active program
- `Programs` — program list with filters, custom program CRUD
- `CreateProgramScreen` — 4-step form for custom programs
- `WorkoutLogger` — set/rep logging with rest timer
- `Progress` — weekly calendar + all-time stats
- `Achievements` — badge grid
- `ProfileScreen` — user info, theme toggle, sign-out, reset

### Data
- `PROGRAMS` — built-in program array (hardcoded in App.jsx, lines ~30–254)
- `ACHIEVEMENTS` — badge definitions
- `LEVELS` — XP rank thresholds (Rookie → Legend)

## Security Rules
- **Never hardcode Firebase credentials** — use `REACT_APP_*` env vars from `.env`
- **Never use `window.confirm()`** — use React state modal dialogs instead
- **Sanitize all user input** before storing — use `sanitize(str, maxLen)` helper in App.jsx
- Firebase keys belong in **GitHub Secrets** for CI/CD (`REACT_APP_FIREBASE_*`)
- For Vercel deploys: set the same `REACT_APP_*` vars in Vercel project environment settings

## CI/CD Setup (GitHub Actions → Vercel)

### Required GitHub Secrets
```
REACT_APP_FIREBASE_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN
REACT_APP_FIREBASE_PROJECT_ID
REACT_APP_FIREBASE_STORAGE_BUCKET
REACT_APP_FIREBASE_MESSAGING_SENDER_ID
REACT_APP_FIREBASE_APP_ID
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

### Deploy alias
After each Vercel deploy, re-apply the alias:
```bash
vercel alias set <deployment-url> fitquest-vijay.vercel.app
```

## Coding Conventions
- All color tokens via `t.xxx` (from ThemeContext) — never hardcode theme colors
- Program-specific accent colors (pink, orange, blue, etc.) are kept on the data objects, not themed
- Input sanitization: always call `sanitize()` before saving user-provided strings to state/localStorage
- Error boundaries: wrap new async screens in `<ErrorBoundary>` if added as separate components
- ESLint: `no-unused-vars` and `react-hooks/exhaustive-deps` are set to **warn** (not error)
- Hooks must not be called conditionally or after early returns (rules-of-hooks enforced)

## Common Pitfalls
- `useLocalStorage` setter supports functional updates: `set(prev => [...prev, item])` ✓
- `useMemo` / `useCallback` calls must be before any early `return` in the component
- The Google Fonts `<link>` is in `public/index.html` — do NOT add it again in JSX
- `src/.env` must not exist — env vars belong at the repo root in `.env`
