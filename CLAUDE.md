# CLAUDE.md — Seguimiento (IETS Gestión Integral)

## Project Overview

**IETS — Gestión Integral** is a single-page, client-side institutional management application for tracking organizational activities, objectives, employee performance, and meetings. It is a prototype/demo system written entirely in a single HTML file with no backend.

- **Language**: Spanish (es-ES) — all UI text, labels, and data are in Spanish
- **Stack**: Vanilla JavaScript (ES6+), HTML5, CSS3 — no frameworks, no build tools, no dependencies
- **Architecture**: Single-file SPA (`IETS_v3_funcional.html`, ~988 lines, ~90 KB)
- **Data storage**: Browser `localStorage` (no server, no database)
- **Authentication**: Demo-mode only — user selection from a dropdown, no real auth

## Repository Structure

```
Seguimiento/
├── IETS_v3_funcional.html   # Entire application (HTML + CSS + JS)
├── CLAUDE.md                # This file
└── .git/                    # Git version control
```

There is no `package.json`, no build configuration, no test framework, no CI/CD, and no linting setup.

## Application Architecture

The file is organized into clearly delimited sections marked with comment banners (`// ===...===`):

### CSS (lines 8–340)
Inline `<style>` block with CSS custom properties (`:root` variables). Key design tokens:
- `--accent: #2563EB` (primary blue)
- `--green: #059669`, `--red: #DC2626`, `--yellow: #D97706`, `--purple: #7C3AED`
- Dark sidebar theme (`#0F1117`)
- Fonts: Source Sans 3 (body), Libre Baskerville (headings) via Google Fonts CDN

### HTML Structure (lines ~341–360)
- `#loginScreen` — Demo login with user selector dropdown
- `#app` — Main app shell with sidebar (`.sb`) and content area (`.mn`)
- `#modal` — Reusable modal overlay
- `#toastC` — Toast notification container

### JavaScript (lines ~361–988)

#### Data Layer
- **`LS`** object (line ~363): localStorage wrapper with `get(key, default)` and `set(key, value)` methods. All keys are prefixed with `iets_`.
- **`seed()`** function (lines ~367–438): Pre-populates localStorage with demo data on first load.
- **`D`** object (lines 443–455): Data accessors that always read fresh from localStorage. Methods: `users()`, `depts()`, `objs()`, `procs()`, `acts()`, `meets()`, `evals()`, `u(id)`, `dept(id)`, `obj(id)`, `proc(id)`.

#### localStorage Keys
| Key | Type | Description |
|-----|------|-------------|
| `iets_users` | Array | User objects `{id, name, pos, email, dept, role, av, color}` |
| `iets_departments` | Array | Department objects `{id, name, parent, code}` |
| `iets_objectives` | Array | Objective objects `{id, name, type, pri, quarter, dept, owner}` |
| `iets_processes` | Array | Process objects `{id, code, name, dept}` |
| `iets_activities` | Array | Activity objects `{id, month, week, desc, resp, by, status, prog, pri, obs, pend, dl, objId, procId, dragged}` |
| `iets_meetings` | Array | Meeting objects `{id, type, title, leader, parts[], date, status, notes, items[]}` |
| `iets_evaluations` | Array | Evaluation objects `{id, userId, period, type, dims{...}, by, date}` |
| `iets_nextActId` | Number | Auto-increment counter for activities |
| `iets_nextMeetId` | Number | Auto-increment counter for meetings |
| `iets_nextEvalId` | Number | Auto-increment counter for evaluations |
| `iets_seeded` | Boolean | Flag indicating demo data has been loaded |

#### App State
- **`S`** object (line 460): Global state `{user, page}` — holds current logged-in user and active page.

#### Navigation & Pages
- **`NAV`** array (lines 496–501): Defines sidebar menu structure with role-based visibility.
- **`go(page)`**: Router function that shows/hides page containers and calls render functions.

#### Render Functions (pages)
| Function | Page | Description |
|----------|------|-------------|
| `rDash()` | Dashboard | Overview stats, weekly chart, recent activities |
| `rMyActs()` | My Activities | User's assigned activities with filters |
| `rMeets()` | Meetings | 1:1 and N-1 meeting management |
| `rObjs()` | Objectives | Strategic, operational, and mission objectives |
| `rProcs()` | Processes | Institutional process map |
| `rOrg()` | Organization | Hierarchical department/employee structure |
| `rAllActs()` | All Activities | Master list (Admin/Gestor only) |
| `rUsers()` | Users | User management and evaluations |
| `rEvals()` | Evaluations | Performance evaluations (5 dimensions) |
| `rRanking()` | Ranking | Employee performance ranking |
| `rReports()` | Reports | Metrics and indicators |
| `rSettings()` | Settings | System config (Admin only) |
| `rAlerts()` | Alerts | Notification history |

#### CRUD Operations
- Activities: `openActForm()`, `saveAct()`, `deleteAct()`
- Meetings: `openMeetForm()`, `saveMeet()`, `deleteMeet()`
- Objectives: `openObjForm()`, `saveObj()`, `deleteObj()`
- Evaluations: `openEvalForm()`, `saveEval()`
- Roles: `chRole(userId, newRole)`

#### Helpers
- `stBadge(status)` — Returns status badge HTML
- `progHTML(value)` — Returns progress bar HTML
- `priBadge(priority)` — Returns priority badge HTML
- `avH(user, size)` — Returns user avatar HTML
- `toast(type, message)` — Shows toast notification (`'s'` = success, `'e'` = error)
- `openModal(html)` / `closeModal()` — Modal dialog management
- `calcObjProgress(objId)` — Calculates objective completion from linked activities
- `calcEvalScore(eval)` — Weighted evaluation score (cumplimiento 25%, calidad 25%, puntualidad 20%, colaboracion 15%, iniciativa 15%)

## Roles & Permissions

| Role | Access |
|------|--------|
| `Administrador` | Full access — all pages, all CRUD, settings, role changes |
| `Gestor` | Management pages (All Activities, Users, Evaluations, Ranking, Reports) |
| `Lector` | Read-only access to management pages |
| `Usuario` | Dashboard, My Activities, Meetings, Objectives, Processes, Organization |

## Development Workflow

### Running Locally
Open `IETS_v3_funcional.html` directly in a browser. No server or build step required.

### Making Changes
Since the entire application is in a single file, all changes — CSS, HTML, and JS — are made to `IETS_v3_funcional.html`.

### Testing
There is no automated test suite. Manual testing in a browser is the only verification method. To reset demo data, clear `localStorage` keys prefixed with `iets_`.

### Linting / Formatting
No linting or formatting tools are configured. The codebase uses a compact/minified coding style with short variable names and minimal whitespace.

## Coding Conventions

- **Short variable names**: `S` (state), `D` (data), `LS` (localStorage), `h` (HTML string builder)
- **Functions prefixed by purpose**: `r` for render (`rDash`, `rMyActs`), `open...Form` / `save...` / `delete...` for CRUD
- **HTML built as strings**: All UI is constructed by concatenating HTML strings (no templating engine or virtual DOM)
- **DOM manipulation**: Direct `getElementById` / `querySelector`, `innerHTML` assignment
- **CSS class naming**: Short, abbreviated (`sb` = sidebar, `mn` = main, `pg` = page, `ct` = container, `hd` = header)
- **Comment banners**: Major sections delimited with `// ====...====` dividers

## Key Considerations for AI Assistants

1. **Single-file constraint**: All code lives in one HTML file. Respect this structure unless explicitly asked to refactor into multiple files.
2. **No build tools**: Changes take effect immediately — no compilation, transpilation, or bundling step.
3. **Spanish language**: All user-facing text must be in Spanish. Do not introduce English strings in the UI.
4. **Client-side only**: There is no backend. All data persists in `localStorage`. Do not introduce server-side code unless explicitly requested.
5. **Demo data**: The `seed()` function provides initial data. Changes to data models must update both `seed()` and the corresponding `D` accessor.
6. **Compact style**: The codebase favors brevity. Match the existing coding style — short names, minimal whitespace, inline logic.
7. **Role checks**: When adding new pages or features, ensure proper role-based access control using the existing `NAV` permission pattern and the user's `S.user.role`.
8. **No dependencies**: Do not add npm packages or external JS libraries unless explicitly requested. The application is intentionally dependency-free.
