# AGENTS.md — Committed Skills & Conventions

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
