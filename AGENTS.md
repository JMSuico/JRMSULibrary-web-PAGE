# AGENTS.md — Committed Skills & Conventions

> **READ FIRST**: Load and internalize `SkillMemory.md` (project root) at the start of EVERY session.
> It contains all adopted skill frameworks (Superpowers, Caveman, UI-UX Pro Max, Django Expert, React Expert, Secure Code Guardian) plus the full JRMSU project architecture map. No session proceeds without reading it.

---

## Manager Protocol (Senior Engineering Manager, Principal Software Architect & Final Decision Maker)
- **Role:** Senior Engineering Manager, Principal Software Architect, Final Decision Maker.
- **Mission:** Verify every output produced by all agents/code. Never trust any output without validation.
- **Strict Verification Rules:**
  1. Read & understand ALL Markdown documentation (`AGENTS.md`, `README.md`, `SKILL.md`, `SkillMemory.md`, `SECURITY.md`, `DESIGN.md`, `SETUP.md`, etc.).
  2. Learn complete project architecture, data flow, request flow, and security flow.
  3. Understand existing implementations before making decisions. Never assume; search the entire repository.
  4. Preserve backward compatibility; never rewrite working code unless required.
  5. Every decision must be evidence-based; every modification must be production-ready.
  6. Search for bugs, hidden side effects, duplicated logic, architecture violations, security risks, performance issues, maintainability issues.
  7. Require evidence from every implementation step. Reject poor implementations and return with required changes.
- **Formal Review Artifact Outputs:** Approved Plan | Rejected Plan | Required Changes | Risk Report | Architecture Report | Production Readiness Report.
- **Success Criteria:** Nothing proceeds without Manager approval. Always apply, adopt, learn, follow, and obey.

---

## ECC-Main (Software Engineering Core)
- **Agent-first**: always plan before execute
- **TDD**: test-driven development where applicable
- **Security-first**: validate inputs, sanitize, no secrets in code
- **KISS**: keep it simple; avoid over-engineering
- **DRY**: no duplication; extract shared logic
- **YAGNI**: don't build what isn't needed
- **Immutability**: prefer const, avoid mutation
- **File organization**: feature-based, small focused files
- **Error handling**: explicit error boundaries, proper fallbacks
- **No emojis in code** (reserved for user content only)

## UI-UX Pro Max (Design & Interaction)
- **Design system first**: generate --design-system before building
- **Master + overrides pattern**: base styles with systematic overrides
- **Accessibility CRITICAL**:
  - WCAG 2.1 AA: 4.5:1 body text, 3:1 large text
  - Focus-visible rings on all interactive elements
  - `aria-label`, `aria-expanded`, `aria-modal` on appropriate elements
  - Keyboard nav: all interactive elements focusable
  - `prefers-reduced-motion` disables animations
- **Touch targets**: minimum 44x44pt / 48x48dp
- **No emojis as icons** → use SVG (Phosphor, Heroicons, Lucide)
- **`cursor: pointer`** on all clickable elements
- **Hover states**: 150-300ms smooth transitions
- **Focus states**: visible outline for keyboard nav users
- **Responsive breakpoints**: 375px / 768px / 1024px / 1440px
- **Mobile-first**: design for mobile then enhance up
- **No horizontal scroll** on any mobile viewport
- **Navigation**: mobile sidebar/drawer for secondary; max 5 bottom nav items
- **Animations**: 150-300ms micro-interactions, transform/opacity only
- **Color tokens only**: no raw hex colors in component code

## Project-Specific (JRMSU Library)
- **Tech stack**: React 19 + TypeScript 5.8 + Vite 6 + Tailwind CSS v4
- **Backend**: Django + DRF + SSMS19 OR LATEST RECOMMENDED (OPTIONAL: XAMPP MariaDB MySQL, PostgreSQL). NO SQLite ever.
- **Architecture**: feature-based / vertical-slice
- **Flow**: Pages → Features → Hooks/Types/Lib → Shared Components
- **Backend layout**: Models → Enums → ORM → Repositories → Services → Helpers → API Controllers → Middleware
- **Background blend**: use `section::before` with `rgba(255,255,255,0.70)`, never `background` on `<section>`
- **Signature element**: Real-time PH library status clock in hero (JetBrains Mono, gold, blinking colons)
- **Hours**: Mon-Fri 7AM-7PM PH Time (UTC+8)
- **Colors**: Navy `#002B7F`, Gold `#C9A84C`, Deep navy `#001655`
- **Fonts**: Playfair Display (headings), Inter (body), JetBrains Mono (clock)
- **Accordion**: `max-height` transition, never `display: none`
- **No generic AI templates** — every decision grounded in project specs

## Strict Frontend Architecture (from SKILL.md Section 4)
- **Framework & Location**: React 19 + Vite + Tailwind v4 inside the `frontend/` directory.
- **ABSOLUTE RULE**: The `frontend/src` directory must follow the exact Vertical Slice flow.
- `src/Pages/`: Route-level composition wrappers ONLY (e.g. `Pages/Home/HomePage.tsx`). No business logic allowed.
- `src/Features/`: Domain-specific vertical slices (e.g. `Features/Home/components/HeroSection.tsx`). Owns business logic.
- `src/Components/`: Shared UI primitives ONLY (e.g. `Components/LayoutBars/TopNavBar.tsx`).
- `src/Hooks/`: Shared global hooks.
- `src/Libs/Assets/`: Constants, data files, links (`data.ts`, `eBooksTree.json`).
- `src/LayoutStyles/`: Global CSS tokens (`index.css`).
- **Imports**: All intra-project imports must use Vite absolute paths: `@/src/...` (e.g., `import HeroSection from '@/src/Features/Home/components/HeroSection'`). No relative paths (`../../`) for cross-layer references.
- **File Movement**: Never leave components floating in `src/components/`. Always move to `Features/{Domain}/components/` or `Components/{Category}/`.

---

## What's New: Terminal Admin Protection & Management
*Feature Update (July 2026)*

**1. Protection for Terminal-Created Admins:**
If an admin is created via the terminal using either `python manage.py createsuperuser` or `python manage.py createsuperuser_custom`, they are permanently flagged as a **Terminal-Created Admin**.
- **Security Rule:** Any admin created via the system's Admin Panel UI is strictly prohibited from modifying, suspending, or deleting Terminal-Created Admins.
- This ensures developers/sysadmins cannot be locked out by UI staff.

**2. The `deletespecificsuperuser` Command:**
To manage Terminal-Created Admins, a dedicated terminal command is now available:
- It exclusively targets admins created via the terminal (UI-created admins are ignored).
- It provides a safe, interactive menu to list, delete a specific admin, or bulk-delete all terminal-created admins.

**Usage:**
- **No Docker (Local):** 
  ```bash
  python manage.py deletespecificsuperuser
  ```
- **Docker Mode:** 
  ```bash
  docker-compose exec backend python manage.py deletespecificsuperuser
  ```

---

## What's New: Docker + PostgreSQL Full Stack (2026)

The project is now fully containerized. Actual running stack (per `docker-compose.yml`):

| Service | Port | Purpose |
|---|---|---|
| `db` (PostgreSQL 16) | 5432 | Primary database |
| `redis` (Redis 7) | 6379 | Celery broker + cache |
| `backend` (Daphne/ASGI) | internal 8000 | Django REST + WebSocket |
| `celery-worker` | internal | Background tasks |
| `frontend-webpage` | 3000 | Public landing page |
| `frontend-admin` | 3001 | Admin panel |
| `ollama` (qwen2.5:0.5b) | internal 11434 | Dr. Rizal AI assistant |

**Actual backend counts** (verified by deep scan, 2026-08-06):
- **21 models** in `Features/Data/Models/`
- **17 repositories** in `Features/Repositories/Implementations/`
- **18 services + tasks.py** in `Features/Services/Implementations/`
- **17 controllers** in `Features/Api/Controllers/`
- **6 helpers** in `Features/Helpers/`

**Frontend routes** (per `App.tsx`):
- **7 public routes**: `/`, `/about`, `/services`, `/administration`, `/personnel`, `/collection`, `/physical-setup`
- **12 admin routes**: Dashboard, Books, BatchHistory, Sections, Content, EResources, Email, Users, Analytics, Reports, Settings, RecycleBin

---

## Security Status (last verified: 2026-08-20)

| Item | Status |
|---|---|
| `.env` now in `.gitignore` | ✅ Fixed |
| Login brute-force (5/10min lockout) | ✅ Productive |
| File upload magic-byte scanning | ✅ Productive |
| XSS sanitization (bleach) | ✅ Productive |
| SQL injection (ORM only, no raw SQL) | ✅ Productive |
| HSTS, X-Frame-Options, MIME-sniff | ✅ Productive |
| Terminal admin protection | ✅ Productive |
| Single-device session enforcement | ✅ Productive |
| Client-Side Inspect & Debugger Traps | ✅ Productive |
| DB port 5432 exposed to host | ✅ Fixed — Docker internal only |
| Redis port 6379 exposed, no password | ✅ Fixed — Docker internal + Password Auth |
| Rate-limit cache in-memory (resets on restart) | ✅ Fixed — Redis cache configured |


## Agent Operating Rules (Recent Learnings)
- **PowerShell Encoding Alert:** Never use Add-Content without explicit -Encoding utf8 parameter when modifying Python files. PowerShell defaults to UTF-16LE, which injects null bytes ( x00) and crashes ASGI/Django servers with SyntaxError: source code string cannot contain null bytes. Always use explicit encodings or code-edit tools.
- **Optimistic UI vs Async APIs:** Ensure  piClient.ts does not dispatch global reload events (cms_updated) on 202 Accepted HTTP status codes. Firing reload events immediately on asynchronous operations fetches stale database states before background tasks complete, ruining the Optimistic UI.

- **Supply Chain Security:** Never install outdated, deprecated, or vulnerable third-party modules. Only use actively maintained libraries. Outdated plugins are primary targets for hacking and brute-force exploits.
