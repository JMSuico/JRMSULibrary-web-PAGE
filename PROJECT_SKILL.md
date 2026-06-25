# PROJECT_SKILL.md — JRMSU Katipunan Campus Library
> Unified Project Architecture, Design System, Frontend Rules & Backend Skill
> Merged from: BACKENDSKILL.md, Frontend Structure rules.md, DESIGN.md, SKILL.md
> Version 3.0

---

# ═══════════════════════════════════════════════════════════════
# PART A — REUSABLE ARCHITECTURE FRAMEWORK (from BACKENDSKILL.md)
# ═══════════════════════════════════════════════════════════════

You are a **Senior Full-Stack Software Architect** and **Project Structure Designer**.

This document is the same reusable framework from the base architecture prompt, applied to the JRMSU Library Landing Page project. Per the base framework's own rule — *"use this framework as the default reusable architecture rule set for future projects unless a new project explicitly overrides a section"* — every universal section below is reused unchanged. Only the sections this project explicitly overrides are different:

| Section | Status |
|---|---|
| Universal rules, philosophy, security, file comments, reminders, mindset, final rule | **Reused unchanged** |
| Cross-platform scope | **Overridden** — Web-only for this project (React + Vite) |
| Frontend example project structure | **Overridden** — accurately maps the JRMSU Library Landing Page structure |
| Backend example project structure | **Overridden** — Django backend for Landing Page CMS/Contact features |
| Database scheme example | **Overridden** — Landing Page specific (Feedback, Contacts, Services) |
| Domain-specific flow example | **New addition** — Contact Form / Feedback Submission Flow |

Do not change the chain flow unless the user explicitly changes it.
Do not create spaghetti code.
Do not mix responsibilities.
Do not place code randomly.
Do not skip layers.

---

## A.1) Core reusable framework

The reusable framework is:

- **Frontend:** feature-based / vertical slice architecture
- **Backend:** layered model-first architecture
- **Database:** strict relational structure with defined ownership
- **Flow chain:** fixed order, no alternate paths, no skipped layers
- **Rules:** no spaghetti code, no mixed responsibilities, no random placement
- **Structure:** commented folders/files so every part shows what belongs where
- **Security:** role-based access, secure auth, audit logs, validation, logging, and protected APIs
- **Cross-platform (this project):** web-focused responsive design
- **Database rule:** ⛔ NEVER use SQLite — not as primary, not as fallback, not for development, not for testing. ALWAYS use a proper relational database: **MySQL, PostgreSQL, or SQL Server (SSMS)** ONLY. This is non-negotiable.

This is not just a style guide. It is the architecture rule set for:

- where code goes
- how layers talk
- what gets protected
- what never gets mixed
- what must remain isolated
- how this project — and future ones — should be organized

---

## A.2) Main goals of the framework

Use this framework to ensure the landing page project is:

- production-ready
- scalable
- modular
- maintainable
- reusable
- secure
- easy to extend (e.g., adding dynamic backend CMS)
- easy to reason about
- easy to hand off to another developer

---

## A.3) Universal rules

### Always follow these rules

- No spaghetti code.
- No mixed responsibilities.
- No hidden dependencies.
- No shortcut implementations.
- No random file placement.
- No monolithic feature implementation.
- No bypass of the architecture layers.
- Every layer must only handle its own responsibility.
- Do not duplicate logic unnecessarily.
- Do not place feature logic inside shared layers.
- Do not place infrastructure logic inside UI layers.

### Database rules (MANDATORY)

- ⛔ **NEVER use SQLite** — not as a primary database, not as a fallback, not for development, not for testing.
- ✅ **ONLY use proper relational databases:** MySQL, PostgreSQL, or SQL Server (SSMS).
- This applies to Django `settings.py` `DATABASES` config, any migration scripts, any seed scripts, and any test setup.
- If a developer or AI agent attempts to use SQLite for any reason, it must be rejected and replaced with an approved database engine.

### Project-specific extension of this rule set

- The Landing Page must cleanly separate presentational pages from functional features.
- If a backend is added for Contact/Feedback forms, all submissions must pass through validation services before reaching the database.
- Static assets (images) must remain organized in `assets/` and properly typed in the frontend.

---

## A.4) Project structure philosophy

The structure must make it obvious:

- what each folder is for
- what each file does
- where code belongs
- what code is allowed there

If a file exists, it must belong to a layer.
If a layer exists, it must own a responsibility.

---

## A.5) Flow chain rules

The system must always follow the exact flow chain. Never skip layers.

### Frontend Flow

```txt
Pages
   ↓
Features
   ↓
Hooks / Types / Lib
   ↓
Shared Components
```

#### Frontend meaning

* **Pages** compose layouts and connect features (e.g., `HomePage` composes `HeroSection` and `LocationSection`).
* **Features** own domain-specific UI and logic (e.g., `Hero`, `Contact`, `Services`).
* **Hooks / Types / Lib** manage reusable logic, types, and assets.
* **Shared Components** remain presentation-focused (e.g., `TopNavBar`, `Footer`).

---

### Backend Flow

```txt
Models
↓
Enums
↓
Django ORM
↓
Repository Implementation
↓
Repository Interface
↓
Service Implementation
↓
Service Interface
↓
Helpers
↓
API Controllers
↓
Middleware
```

---

### Contact Form Flow (Domain-specific)

```txt
Visitor submits Contact Form
↓
Django Middleware (rate limit, CSRF)
↓
ContactController (receives request)
↓
ContactService (validates input, sanitizes text, sends email notification)
↓
ContactRepository (persists the inquiry)
↓
Database (ContactMessages)
```

---

### Backend flow warnings
* No database queries inside middleware.
* No business logic inside controllers.
* All public form submissions (Contact, Feedback) must pass through `input_sanitizer` to prevent XSS.

---

# ═══════════════════════════════════════════════════════════════
# PART B — FRONTEND STRUCTURE RULES (from Frontend Structure rules.md)
# ═══════════════════════════════════════════════════════════════

## B.1) Goal

Reorganise the flat `src/components/` folder into a **feature-based / vertical-slice architecture** matching the rules in this document, and fix the background image blend so the library building is clearly visible behind sections.

## B.2) Background Blend Fix

The current CSS uses `background: linear-gradient(rgba(255,255,255,0.90), …)` on every `<section>`.
A CSS `background` shorthand on the child **completely covers** the parent's background-image — it is not blending; it is painting a near-opaque white rectangle on top.
**Fix:** Remove `background` from `section` and instead use a `::before` pseudo-element with `rgba(255,255,255,0.10)` so the library image shows through.

## B.3) Frontend placement rules

### Pages
Use pages for route-level composition and connecting features to layouts.
Pages must not hold heavy business logic or API logic.

### Features
Use features for specific domain sections of the landing page (Hero, About, Services, Contact).
Each feature slice should contain its own components and hooks.

### Shared Components
Use shared components for reusable UI like Navigation Bars and Footers.

### LayoutStyles
Use for global theme tokens and custom CSS.

## B.4) Changes checklist

### 1. Background CSS Fix (index.css)
- Remove the opaque `background` from `section { }`
- Add a `section::before` pseudo-element at `rgba(255,255,255,0.10)` so 90% of the library image shows through
- Keep footer background as-is (solid navy)

### 2. Move files into feature-based folders
All existing component files get moved; imports updated accordingly.

### 3. Extract clock hook
`useLibraryClock.ts` pulled out of HeroSection for clean separation.

### 4. Verification
- `npm run dev` — confirm the site renders
- Visually verify the library building image is **clearly visible** behind all sections

---

# ═══════════════════════════════════════════════════════════════
# PART C — DESIGN SYSTEM (from DESIGN.md)
# ═══════════════════════════════════════════════════════════════

---
name: Academic Excellence & Tradition
---

## C.1) PROJECT BRIEF

**Product:** Official Library Landing Page — JRMSU Katipunan Campus Library
**Institution:** Jose Rizal Memorial State University – Katipunan Campus
**Address:** National Highway, Barangay Dos, Katipunan, Zamboanga del Norte, Philippines
**Audience:** Students, Faculty, Staff, Alumni, External Researchers
**Page Purpose:** Single-page informational landing page with real-time library status, service guide, about section, feedback mechanism, and contact information.
**Tone:** Professional, modern, academic — clean and dignified; not corporate-generic.

---

## C.2) BRAND IDENTITY

### Official JRMSU Colors (confirmed from university seal & Wikipedia)
| Token | Hex | Name | Symbolism |
|-------|-----|------|-----------|
| `--navy` | `#002B7F` | JRMSU Navy Blue | Trustworthiness, dependability, committed leadership |
| `--navy-dark` | `#001655` | Deep Navy | Depth, authority — for footer, hero gradient |
| `--navy-mid` | `#1A3A7A` | Medium Navy | Mid-tone for gradients, section backgrounds |
| `--gold` | `#C9A84C` | JRMSU Gold | Creative thought, promise of positive future |
| `--gold-light` | `#F0D97A` | Light Gold | Hover states, soft highlights |
| `--gold-pale` | `#FDF6E0` | Pale Gold | Subtle tints, quote block backgrounds |
| `--white` | `#FFFFFF` | White | Card surfaces, primary text on dark |
| `--warm-white` | `#F8F7F2` | Warm White | Page background — evokes library paper |
| `--light-blue` | `#EEF2FF` | Light Blue | Alternating section tints, info blocks |
| `--text` | `#111827` | Near-black | Primary body text |
| `--text-mid` | `#4B5563` | Mid Gray | Secondary text, descriptions |
| `--text-light` | `#9CA3AF` | Light Gray | Captions, timestamps, labels |
| `--border` | `#E2E8F0` | Border | Card borders, dividers |
| `--success` | `#22C55E` | Green | Library OPEN status indicator |
| `--danger` | `#EF4444` | Red | Library CLOSED status indicator |

---

## C.3) TYPOGRAPHY

| Role | Font Family | Weight | Size Range | Usage |
|------|-------------|--------|------------|-------|
| Display / Hero | `Playfair Display`, serif | 700 | 36–64px | Page title, section headings |
| Subheading | `Playfair Display`, serif | 600 | 22–32px | Section sub-titles, librarian name |
| Body | `Inter`, sans-serif | 400 | 14–16px | Paragraphs, step descriptions |
| Label / Eyebrow | `Inter`, sans-serif | 600 | 10–12px | UPPERCASE section labels, badges |
| UI / Nav | `Inter`, sans-serif | 500 | 13–14px | Navigation links, buttons |
| Clock / Timestamp | `JetBrains Mono`, monospace | 500–600 | 32–56px | Real-time clock display |
| Caption | `Inter`, sans-serif | 400 | 11–12px | Table captions, footer links |

### Google Fonts Import String:
```
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
```

---

## C.4) LAYOUT SYSTEM

| Property | Value |
|----------|-------|
| Max content width | `1200px` |
| Section padding (desktop) | `80px 24px` |
| Section padding (mobile) | `48px 16px` |
| Card border radius | `12px` |
| Button border radius | `8px` |
| Input border radius | `6px` |
| Card shadow | `0 4px 24px rgba(0,43,127,0.08)` |
| Card hover shadow | `0 12px 40px rgba(0,43,127,0.16)` |
| Grid system | CSS Grid, 12-column, `gap: 24px` |
| Breakpoints | Mobile: <640px, Tablet: 640–1024px, Desktop: >1024px |

---

## C.5) NAVIGATION

- **Type:** Fixed top navbar, full-width
- **Background:** `--navy` solid; transitions to `rgba(0,43,127,0.95)` with `backdrop-filter: blur(12px)` after 60px scroll
- **Height:** 64px desktop, 56px mobile
- **Logo:** JRMSU circular emblem (gold circle with "J") + wordmark "JRMSU Library" in Playfair Display + sub-label "KATIPUNAN CAMPUS" in Inter 10px
- **Nav Links:** `HOME | ABOUT | SERVICES | FILE SERVICES | ONLINE ACCESS` — uppercase, 13px, letter-spacing 0.05em, color white; underline animation on hover/active in gold
- **Mobile:** Hamburger icon (☰/✕), slide-down drawer with navy-dark background
- **Border-bottom on scroll:** `1px solid rgba(201,168,76,0.3)` — subtle gold separator

---

## C.6) SECTION ARCHITECTURE

### Section 1 — HERO (id="home")
- **Layout:** Full-viewport (`100vh`), centered content, dark navy gradient background
- **Background:** `linear-gradient(160deg, #001655 0%, #002B7F 55%, #1A3A7A 100%)`
- **Texture overlay:** Subtle grid pattern at 4% opacity (white lines)
- **Content stack (centered):**
  1. Library hours badge pill — gold bordered, rounded, uppercase: `📚 Library Hours: Monday–Friday | 7:00 AM – 7:00 PM`
  2. H1 headline: `Welcome to JRMSU Katipunan Campus Library` — Playfair Display 56px, white
  3. Subheadline paragraph: italic tagline, 18px, rgba(white,0.72)
  4. **⭐ SIGNATURE ELEMENT: Real-Time Clock Widget** (see PART D Section 6.2)
  5. CTA Buttons: `View Our Services` (gold fill) + `Learn More` (ghost white)
  6. Scroll indicator: ↓ SCROLL, animated pulse, bottom-center absolute

#### Real-Time Clock Widget (SIGNATURE ELEMENT)
> This is the unique, memorable element of the entire page.
- Container: frosted glass card — `rgba(255,255,255,0.07)` bg, `backdrop-filter: blur(12px)`, gold border `rgba(201,168,76,0.3)`, border-radius 16px
- Time display: `HH:MM:SS AM/PM` — JetBrains Mono, 56px, gold color (`#C9A84C`)
  - Colons `:` blink at 1s interval via CSS animation
- Date display: `MM-DD-YYYY` format — JetBrains Mono, 14px, white/50% below the time
- Status indicator: animated pulsing dot + text
  - Green dot + `LIBRARY IS NOW OPEN` → during Mon–Fri 7:00AM–7:00PM Philippines Time
  - Red dot + `LIBRARY IS CLOSED` → all other times
  - Dot animation: radial pulse using box-shadow keyframe

### Section 2 — LIBRARIAN'S CORNER (id="librarian")
- **Layout:** Card centered (max 760px), split horizontally: dark navy avatar panel left, content right
- **Avatar panel:** Navy-dark gradient, circular initials avatar (KK) in gold, name + title
- **Content panel:** White bg
  - Italic quote in gold-pale block with gold left border
  - Library mission paragraph
  - Secondary paragraph about continuous improvement
- **Section label:** `LIBRARIAN'S CORNER` gold eyebrow
- **Entry animation:** `fade-in-up` on scroll

### Section 3 — ABOUT (id="about")
- **Layout:** Two-column (1200px max): text column left, Google Maps embed right
- **Text column content:**
  - Gold eyebrow label: `ABOUT THE LIBRARY`
  - H2 heading: Playfair Display
  - Mission text block
  - "Padayon, JRMSUans!" closing message — styled in italics, gold accent
  - External Library Links row (University Libraries + External Services links)
- **Map column:**
  - Google Maps iframe embed — location: JRMSU Katipunan Campus, National Highway, Barangay Dos, Katipunan, Zamboanga del Norte
  - Border-radius 12px, border gold 2px, shadow
  - Label: "Find Us Here" with pin icon
- **Background:** `--warm-white`

### Section 4 — SERVICES (id="services")
- **Layout:** Accordion/expandable cards, max 900px centered
- **Section heading:** `Our Library Services`
- **Tab filter row:** `ALL | BORROWING | RETURNING | E-LIBRARY | CLEARANCE` — pill tabs, gold active state
- **Each service card:**
  - Header row (clickable): Service title + subtitle badge + total time chip + chevron icon
  - Badge color-coded: External (green), Internal/External (navy), E-Library (purple)
  - Expanded panel: requirement checklist + step-by-step table
  - Step table columns: `#` | `CLIENT STEP` | `AGENCY ACTION` | `FEES` | `TIME` | `PERSON`
  - Overdue fee rows highlighted in amber/yellow tint
  - Smooth `max-height` transition for open/close

### Section 5 — FILE SERVICES (id="file-services")
- **Layout:** 3-column card grid
- **Cards:** Library forms, CSM feedback form link, clearance request
- **Icons:** Document/file icons in navy
- **CTA:** Download/Access buttons in gold outline

### Section 6 — ONLINE ACCESS (id="online-access")
- **Layout:** 2×2 card grid or horizontal scroll row
- **Card style:** Navy gradient bg, gold icon, white text, external link badge

### Section 7 — FEEDBACK & COMPLAINTS (id="feedback")
- **Layout:** Centered form card (max 640px), on light-blue background
- **Fields:** Name | Email | Category (select) | Message (textarea) | Submit button (gold)

### Section 8 — CONTACT (id="contact")
- **Layout:** Two columns — contact info left, social card right

### Section 9 — FOOTER
- **Background:** `--navy-dark`
- **Layout:** 3 columns — Logo/tagline | Quick links | Contact summary
- **Gold top border:** 2px solid gold
- **Copyright:** `© [YEAR] JRMSU-Katipunan Campus Library. All rights reserved.`

---

## C.7) MOTION & ANIMATION

| Effect | Trigger | Properties | Duration |
|--------|---------|------------|----------|
| `fade-in-up` | Scroll into view (IntersectionObserver) | `opacity 0→1`, `translateY 28px→0` | 700ms ease |
| `card-lift` | Hover | `translateY 0→-6px`, shadow increase | 250ms ease |
| `colon-blink` | Every 1 second (CSS) | `opacity 1→0→1` on clock colons | 1s infinite |
| `status-pulse` | Continuous | radial `box-shadow` pulse on status dot | 2s infinite |
| Accordion open | Click | `max-height 0→auto`, `opacity 0→1` | 400ms ease |
| Navbar blur | After 60px scroll | `backdrop-filter blur(12px)` | 300ms ease |
| Hero text | Page load | Stagger fade-in-up: badge → H1 → subtitle → clock → CTAs | 80ms stagger |
| Section stagger | Scroll | Cards stagger with 60ms delay per item | 600ms ease |

**No heavy loops or bounce animations.** Keep it professional and purposeful.

---

## C.8) COMPONENT SPECIFICATIONS

### Button Types
```
Primary:   bg=#C9A84C, text=#002B7F, border-radius=8px, padding=12px 28px, font-weight=600
Secondary: bg=transparent, text=white, border=1px solid rgba(white,0.3), same shape
Ghost:     bg=transparent, text=#002B7F, border=1px solid #002B7F
Link:      no bg/border, underline on hover, text=#002B7F or #C9A84C
```

### Badge/Chip Types
```
External:          bg=#059669, text=white, rounded-full
Internal/External: bg=#002B7F, text=white, rounded-full
E-Library:         bg=#7C3AED, text=white, rounded-full
Overdue Fee:       bg=#D97706, text=white, rounded-full
Free:              bg=#E8F5E9, text=#15803D, rounded-full
```

### Service Step Table Row Colors
```
Normal row:    bg=white (odd) / #EEF2FF (even)
Overdue row:   bg=#FFFBEB, border-left=3px solid #D97706
Total row:     bg=#002B7F, text=white, font-weight=700
```

---

## C.9) ACCESSIBILITY

- All color combinations meet WCAG 2.1 AA contrast (min 4.5:1 for body text, 3:1 for large text)
- Navy `#002B7F` on white `#FFFFFF`: ratio 8.6:1 ✅
- Gold `#C9A84C` on navy `#002B7F`: ratio 5.2:1 ✅
- White on navy: ratio 8.6:1 ✅
- Keyboard navigation: all interactive elements focusable
- `aria-label` on icon buttons, `aria-expanded` on accordion headers
- `prefers-reduced-motion`: disable animations, keep opacity transitions only
- Alt text on all images and decorative SVGs

---

## C.10) SIGNATURE ELEMENT SUMMARY

**The Real-Time Philippine Library Status Clock** placed in the hero section is the single most memorable component. It communicates:
- Live awareness (the library is a living, responsive institution)
- Current time in Philippine Time (Asia/Manila timezone, UTC+8)
- Instant open/closed status with animated indicator
- Professional monospace type contrasting with the elegant serif headline

No other academic library landing page in the region features a real-time status clock as the hero centerpiece. This is the element visitors will remember and return for.

---

## C.11) UNIVERSITY LIBRARIES LINKS

| Campus | URL |
|--------|-----|
| Main Campus (Dapitan) | https://jrmsu.edu.ph/library/ |
| Dipolog Campus | http://dipolog.jrmsu.edu.ph/ |
| Tampilisan Campus | http://tampilisan.jrmsu.edu.ph/ |
| Siocon Campus | http://siocon.jrmsu.edu.ph/ |
| **Katipunan Campus (This Library)** | *(current page)* |

---

## C.12) EXTERNAL ACCESS LINKS

| Service | URL |
|---------|-----|
| JRMSU ARMS (Clearance) | https://jrmsu-arms.online/ |
| Online Library Clearance | https://www.jrmsu-clearance.online/ |
| Feedback Form (CSM) | https://www.jrmsu.online/feedback |
| JRMSU Katipunan Campus | https://katipunan.jrmsu.edu.ph/ |

---

# ═══════════════════════════════════════════════════════════════
# PART D — FULL-STACK BUILD SPECIFICATION (from SKILL.md)
# ═══════════════════════════════════════════════════════════════

## AGENT IDENTITY INSTRUCTIONS

You are building the **official web application** for JRMSU Katipunan Campus Library. You have full context of the design system, content, architecture, and interaction rules. Follow every rule here exactly. Do not invent patterns not specified. Do not apply generic AI frontend templates. Every decision must be deliberate and grounded in this document.

---

## D.1) PROJECT IDENTITY

| Field | Value |
|---|---|
| Product Name | JRMSU Katipunan Campus Library — Official Web App |
| Institution | Jose Rizal Memorial State University – Katipunan Campus |
| Address | National Highway, Barangay Dos, Katipunan, Zamboanga del Norte, Philippines |
| Audience | Students, Faculty, Staff, Alumni, External Researchers |
| Tech Stack | React 19 + TypeScript 5.8 + Vite 6 + Tailwind CSS v4 (Frontend) / Django + DRF + MySQL (Backend) |
| Tone | Professional, modern, academic — clean and dignified. NOT corporate-generic. NOT generic AI template. |
| Primary Contact Email 1 | katipunan.library@jrmsu.edu.ph |
| Primary Contact Email 2 | jrmsukclibrary@gmail.com |
| Facebook | https://www.facebook.com/JRMSUkatipunanlibrary |
| Library Hours | Monday – Friday, 7:00 AM – 7:00 PM (Philippine Time, UTC+8) |

---

## D.2) ANTI-PATTERN RULES (READ FIRST, ALWAYS ENFORCE)

These patterns are BANNED. Reject them even if they seem convenient.

### BANNED UI PATTERNS
- ❌ Generic hero with a single centered stock-photo card
- ❌ Three-column feature cards with emoji icons and "Lorem ipsum" filler
- ❌ Flat color sections alternating white/gray with no visual language
- ❌ Cookie-cutter testimonial carousels
- ❌ `box-shadow` applied uniformly to every element
- ❌ Blue CTA buttons (`#007BFF`, `#0D6EFD`) — use accent (`#ADD8E6` / light blue) or gold instead
- ❌ Rounded pill navbar with hamburger that drops down in a centered overlay
- ❌ Footer with 5 identical icon columns
- ❌ `display: none` toggle for accordions (use `max-height` transition instead)
- ❌ Gradient backgrounds that look like SaaS landing pages

### BANNED CSS PATTERNS
- ❌ `section { background: linear-gradient(rgba(255,255,255,0.90), ...) }` — this paints a near-opaque white rect on top of the body background image, KILLING the visibility
- ❌ Setting `background` shorthand on `<section>` elements that sit on top of a body background-image
- ❌ `transition: all 0.3s` — always specify exact properties
- ❌ `!important` unless absolutely necessary for overrides
- ❌ Inline styles for layout — use CSS classes

### BANNED DATABASE PATTERNS
- ❌ **SQLite** — NEVER use SQLite in any form. Not as primary, not as fallback, not for development, not for testing.
- ❌ `'ENGINE': 'django.db.backends.sqlite3'` — this line must NEVER appear in `settings.py`.
- ✅ ONLY use: MySQL (`django.db.backends.mysql`), PostgreSQL (`django.db.backends.postgresql`), or SQL Server.

### CORRECT BACKGROUND BLEND APPROACH
```css
/* WRONG — covers the background image completely */
section {
  background: linear-gradient(rgba(255,255,255,0.90), rgba(255,255,255,0.90));
}

/* CORRECT — 70% white overlay via ::before so 30% of library image shows through */
section {
  position: relative;
}
section::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.70);
  pointer-events: none;
  z-index: 0;
}
section > * {
  position: relative;
  z-index: 1;
}
/* Exception: footer keeps solid bg */
footer {
  background: var(--navy-dark);
}
```

---

## D.3) DESIGN SYSTEM (CSS Custom Properties)

### Google Fonts (import in index.css, FIRST LINE)
```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
```

### CSS Custom Properties (define in `:root` inside index.css)
```css
:root {
  /* === JRMSU Brand Colors === */
  --navy:             #002B7F;
  --navy-dark:        #001655;
  --navy-mid:         #1A3A7A;
  --gold:             #C9A84C;
  --gold-light:       #F0D97A;
  --gold-pale:        #FDF6E0;

  /* === Surface Colors === */
  --white:            #FFFFFF;
  --warm-white:       #F8F7F2;
  --light-blue:       #EEF2FF;

  /* === Accent Color === */
  --accent:           #ADD8E6;

  /* === Text Colors === */
  --text:             #111827;
  --text-mid:         #4B5563;
  --text-light:       #9CA3AF;

  /* === Utility === */
  --border:           #E2E8F0;
  --success:          #22C55E;
  --danger:           #EF4444;

  /* === Typography === */
  --font-display:     'Playfair Display', serif;
  --font-body:        'Inter', sans-serif;
  --font-mono:        'JetBrains Mono', monospace;

  /* === Spacing === */
  --section-py:       80px;
  --section-px:       24px;
  --gutter:           24px;
  --max-width:        1200px;

  /* === Shape === */
  --radius-card:      12px;
  --radius-btn:       8px;
  --radius-input:     6px;
  --radius-pill:      9999px;

  /* === Shadows === */
  --shadow-card:      0 4px 24px rgba(0, 43, 127, 0.08);
  --shadow-hover:     0 12px 40px rgba(0, 43, 127, 0.16);
  --shadow-glass:     0 8px 32px rgba(0, 43, 127, 0.12);
}

@media (max-width: 640px) {
  :root {
    --section-py: 48px;
    --section-px: 16px;
  }
}
```

---

# ═══════════════════════════════════════════════════════════════
# PART E — ACTUAL PROJECT STRUCTURE (Verified against filesystem)
# ═══════════════════════════════════════════════════════════════

## E.1) Frontend project structure (actual)

```txt
src/
├── App.tsx                              # Root router: /, /about/*, /services/*, /e-resources, /admin
├── main.tsx                             # Vite entry point, mounts App and imports index.css
├── vite-env.d.ts                        # Vite TypeScript environment declarations
│
├── Pages/                               # Route-level page assemblies only
│   ├── HomePage/
│   │   └── HomePage.tsx                 # Composes HeroSection + LocationSection
│   ├── AboutPage/
│   │   └── pages/
│   │       ├── OrgStructurePage.tsx     # Organizational structure page
│   │       ├── HistoryPage.tsx          # JRMSU History page
│   │       └── QualityObjectivesPage.tsx # Quality objectives page
│   ├── ServicesPage/
│   │   ├── ServicesPage.tsx             # Composes library services
│   │   └── pages/
│   │       ├── FeedbackPage.tsx         # Feedback & complaints page
│   │       └── ExternalServicesPage.tsx # External services gallery
│   ├── EResourcesPage/
│   │   └── EResourcesPage.tsx          # Dynamic departments + online access tables
│   ├── AdminPage/
│   │   └── AdminPage.tsx               # JWT login + admin dashboard (links to Django admin)
│   └── LandingPage/
│       └── LandingPage.tsx             # Full single-page composer (if used)
│
├── Features/                            # Feature-specific vertical slices
│   ├── Hero/
│   │   ├── components/
│   │   │   └── HeroSection.tsx         # Hero with clock widget + CTA buttons
│   │   └── hooks/
│   │       └── useLibraryClock.ts      # Clock tick + PH timezone + open/closed logic
│   ├── Gateway/
│   │   └── components/
│   │       └── GatewaySection.tsx      # Campus intro / welcome panel
│   ├── Personnel/
│   │   └── components/
│   │       └── PersonnelSection.tsx    # Librarian's Corner with Ma'am Kiara photo
│   ├── Services/
│   │   └── components/
│   │       └── ServicesSection.tsx     # Library service cards (accordion)
│   ├── About/
│   │   └── components/
│   │       └── AboutSection.tsx        # About content component
│   ├── Location/
│   │   └── components/
│   │       └── LocationSection.tsx     # Google Maps embed + address
│   ├── Contact/
│   │   └── components/
│   │       └── ContactSection.tsx      # Contact info + feedback form
│   ├── FileServices/
│   │   └── components/
│   │       └── FileServicesSection.tsx # Google Sheet iframe + resource links
│   ├── NewlyAcquired/
│   │   └── components/
│   │       └── NewlyAcquiredSection.tsx # Fetches /api/books — carousel + view-all modal
│   └── Gallery/
│       └── components/
│           └── LibraryGallery.tsx      # Fetches /api/gallery — carousel + lightbox
│
├── Components/                          # Shared reusable UI primitives
│   ├── LayoutBars/
│   │   ├── TopNavBar.tsx               # Fixed top navbar with dropdown + mobile drawer
│   │   └── Footer.tsx                  # Footer with iso-sidebar + quick links + contact
│   └── Shared/
│       ├── FacebookModal.tsx           # Facebook page iframe modal
│       └── ChatBubble.tsx              # Floating AI assistant / message-us bubble
│
├── LayoutStyles/                        # Global styling
│   └── index.css                       # Tailwind @theme tokens + CSS animations + backgrounds
│
├── hooks/                               # Shared reusable hooks
│   └── useIntersectionObserver.ts      # Reveal-on-scroll observer
│
├── Lib/                                 # Infrastructure utilities
│   └── assets/
│       └── data.ts                     # CDN asset URLs, link lists, service data
│
├── Types/                               # Shared TypeScript types
│   └── landing.types.ts                # Section/service interfaces
│
└── assets/                              # Static image assets (Vite-resolved)
    ├── PHYSICAL SET-UP 2026/           # Library interior photos
    ├── Library pic/                     # Additional library photos
    ├── maam kiaras.png                 # Librarian portrait
    ├── iso-sidebar.png                 # ISO certification sidebar image
    └── uopac qr code.png              # UOPAC QR code image
```

## E.2) Backend project structure (actual — Django)

```txt
backend/                                  # Root backend application
├── manage.py                            # Django management entry point
├── db.sqlite3                           # ⚠️ MUST BE REPLACED with MySQL/PostgreSQL
├── venv/                                # Python virtual environment
│
├── core/                                # Django project configuration
│   ├── __init__.py                     # pymysql.install_as_MySQLdb() initialization
│   ├── settings.py                     # Django settings (DB, Auth, CORS, JWT, SMTP)
│   ├── urls.py                         # Root URL config: /admin/ + /api/ + /assets/
│   ├── asgi.py                         # ASGI config
│   ├── wsgi.py                         # WSGI config
│   └── middleware/                     # Custom middleware
│       └── rate_limit_middleware.py    # Prevents form submission spam
│
└── Features/                            # Domain vertical slices (Django app)
    ├── __init__.py
    ├── apps.py                         # FeaturesConfig
    ├── models.py                       # Re-exports all models from Data/Models/
    ├── management/
    │   └── commands/
    │       └── seed_assets.py          # Asset crawler: seeds DB from local /assets/ folder
    ├── migrations/                     # Django migration files
    │
    ├── Data/                           # Model-first foundation
    │   ├── Models/
    │   │   ├── __init__.py             # Exports all models
    │   │   ├── account_model.py        # Account (extends AbstractUser: is_librarian, is_guest)
    │   │   ├── contact_message_model.py # Entity for submitted contact forms
    │   │   ├── feedback_model.py       # Entity for visitor feedback
    │   │   ├── personnel_model.py      # CMS entity for library staff list
    │   │   ├── newly_acquired_book_model.py  # Books with cover images + metadata
    │   │   ├── eresource_model.py      # EResourceDepartment + EResourceFile (multi-level)
    │   │   └── library_interior_image_model.py # Gallery images with categories
    │   └── Enums/
    │       ├── inquiry_status.py       # Enum: new, read, replied
    │       └── feedback_rating.py      # Enum: 1 to 5 stars
    │
    ├── Repositories/                   # Data access layer
    │   ├── Interfaces/
    │   │   ├── contact_repository_interface.py
    │   │   └── feedback_repository_interface.py
    │   └── Implementations/
    │       ├── contact_repository.py
    │       └── feedback_repository.py
    │
    ├── Services/                       # Business logic layer
    │   ├── Interfaces/
    │   │   └── contact_service_interface.py
    │   └── Implementations/
    │       ├── contact_service.py      # Validates form, prevents spam, saves to repo
    │       └── feedback_service.py     # Handles feedback submission rules
    │
    ├── Helpers/                        # Reusable utilities
    │   └── input_sanitizer.py         # Cleans public form submissions
    │
    ├── Api/                            # REST API layer
    │   ├── Controllers/
    │   │   ├── contact_controller.py   # POST /api/contact
    │   │   ├── feedback_controller.py  # POST /api/feedback
    │   │   ├── personnel_controller.py # GET /api/personnel
    │   │   └── cms_controller.py       # CRUD: /api/books, /api/departments, /api/resources, /api/gallery
    │   ├── Serializers/
    │   │   ├── contact_serializer.py
    │   │   ├── feedback_serializer.py
    │   │   ├── personnel_serializer.py
    │   │   └── cms_serializers.py      # Book, Department, EResource, Gallery serializers
    │   └── Routes/
    │       └── api_router.py           # All URL patterns: auth, contact, feedback, cms
    │
    └── Infrastructure/
        ├── Database/
        └── EmailClient/                # Sends notifications to library staff
```

---

# ═══════════════════════════════════════════════════════════════
# PART F — FULL CONTENT, DATA & VERIFICATION (from SKILL.md)
# ═══════════════════════════════════════════════════════════════

## F.1) LIBRARY SERVICES TEXT CONTENT

### Library Services List (ServicesSection.tsx)
1. **Library User Education** — formal/informal orientation for first year and transferees; instruction in OPAC use
2. **Informal Reference Service** — one-on-one assistance for information queries
3. **Readers Advisory Services** — helps users locate, retrieve, and access information
4. **Technical Services** — mechanical/technical processing: cataloging (DDC), accessioning, ILS encoding, materials forwarding
5. **Audio-Visual Services** — AV facilities for events and teaching/learning; faculty coordinates with librarian
6. **Circulation Services** — borrowing, returning, renewal, reservation, overdue fines; librarian may exclude some materials
7. **Ask-a-Librarian / #AskRIZAL** — online queries via FB Messenger, IG, Twitter, email, webpage; answered during office hours
8. **Photo/Scan Me Service** — limited page photography/scanning using personal gadgets
9. **OPAC Service** — Online Public Access Catalog at strategic library locations
10. **Printing Service** — hard copy printing for a minimal fee
11. **Property Counter Service** — baggage area near entrance/exit doors
12. **Selective Dissemination of Information (SDI)** — newly acquired resources by field
13. **Current Awareness Services** — library news, resources, events via social media (FB, IG, Twitter), webpage
14. **Referral Information Service (RIS)** — referral letters for other libraries, issued by Campus Librarian
15. **File Transfer Service** — digitization of print materials for faculty/students
16. **Internet / e-Library / Free Wi-Fi** — internet access for all bona fide students and faculty
17. **Online Databases Service** — e-books, e-journals, market research, legal databases, encyclopaedias, e-magazines, e-newspapers; credentials via email

### Campus Contact Details Table
| Campus | Email | Social Media | Contact |
|---|---|---|---|
| Main Campus | main.library@jrmsu.edu.ph | JRMSU Main Campus Library | 09215903198 / 09353404868 |
| Dipolog Campus | dipolog.library@jrmsu.edu.ph | FB: JRMSU Dipolog Campus Library; IG & Twitter: @jrmsudiplibrary | (065) 917 8171 / (065) 918 0268 |
| Katipunan Campus | katipunan.library@jrmsu.edu.ph | JRMSU Katipunan Campus Library | (065) 918 0141 |
| Tampilisan Campus | jrmsutampilisan.library@jrmsu.edu.ph | JRMSU Tampilisan Campus Library | 09165537813 |
| Siocon Campus | siocon.library@jrmsu.edu.ph | JRMSU Siocon Campus Library | 09976177595 |

---

## F.2) ONLINE ACCESS RESOURCES

### Open Access Journals
| Resource | URL |
|---|---|
| Agriculture | https://www.mdpi.com/journal/agriculture |
| List of Scientific Journal | https://en.wikipedia.org/wiki/Lists_of_academic_journals |
| List of Academic Journal | https://en.wikipedia.org/wiki/Lists_of_academic_journals |
| Worldcat | https://search.worldcat.org/ |
| Google Book | https://books.google.com/?hl=en |
| Online Free E-Books | https://www.free-ebooks.net/ |
| Gutenberg | https://www.gutenberg.org/ |
| Scribd | https://www.scribd.com/ |
| GetFreeEbooks | https://getfreeebooks.com/ |
| DOST Publication | https://www.dost.gov.ph/index.php?option=com_content&task=view&id=712&Itemid=201 |
| Highwire Press | https://www.highwirepress.com/ |
| IPL Magazines | https://www.ipl.org/ |

### Resources
| Resource | URL |
|---|---|
| Science Direct | https://www.sciencedirect.com/ |
| Philippine Elib | https://www.elib.gov.ph/ |
| ERIC Educ. Res. Info. Center | https://eric.ed.gov/ |
| Gale Database | https://link.gale.com/apps/menu?userGroupName=phusm&prodId=MENU |
| Philippine E-Journals | https://ejournals.ph/ |
| Springer Nature Link | https://link.springer.com/ |
| E-Library USA | https://docs.google.com/forms/d/e/1FAIpQLSdK93TrYAkWrl32xWxlOItfYFTTgUQPY_Ws2ZhxfuVMvojpiA/viewform |
| Seameo-innotech eBooks | *(URL to be provided — leave placeholder)* |
| ProQuest | https://www.proquest.com/ |
| Student Handbooks | https://drive.google.com/file/d/18erQ6LSfT3Jia84n77WBPOb1JfzI-tQj/view |

### Acquired E-Resources
| Resource | URL |
|---|---|
| Bookshelf | https://www.vitalsource.com/ |
| Scholaar | https://scholaar.com/ |

---

## F.3) ASSETS REFERENCE TABLE

| Asset Name | Path in Project | Usage |
|---|---|---|
| Librarian Photo | `src/assets/maam kiaras.png` | PersonnelSection — Librarian's Corner |
| ISO Sidebar Image | `src/assets/iso-sidebar.png` | Footer — left column |
| UOPAC QR Code | `src/assets/uopac qr code.png` | UOPAC registration section |
| Library Interior Photos | `assets/PHYSICAL SET-UP 2026/` | Gallery section (served via Django `/assets/`) |
| Library Pics | `assets/Library pic/` | Additional gallery images |
| E-Books | `assets/eBooks/eBooks/Department/` | E-Resource file downloads (served via Django `/assets/`) |

---

## F.4) ACCESSIBILITY REQUIREMENTS

| Rule | Implementation |
|---|---|
| WCAG 2.1 AA minimum | Navy on white 8.6:1 ✅, Gold on navy 5.2:1 ✅, White on navy 8.6:1 ✅ |
| `<h1>` once per page | Hero headline only |
| Heading hierarchy | H1 → H2 → H3, never skip levels |
| Keyboard nav | All interactive elements focusable; no `tabindex="-1"` on links |
| Focus ring | `outline: 2px solid var(--gold); outline-offset: 2px` on `:focus-visible` |
| Accordion | `<button aria-expanded="true/false">` — never `<div>` with click |
| Icons | `aria-label` on all icon-only buttons |
| Images | `alt` text on all `<img>` |
| Iframes | `title` attribute required on Google Maps and Google Sheet iframes |
| Modal | `role="dialog"`, `aria-modal="true"`, focus trapped inside, ESC closes |
| Forms | `<label for="">` paired with every `<input>` and `<textarea>` |
| Motion | `@media (prefers-reduced-motion: reduce)` disables all transform animations |

---

## F.5) VERIFICATION CHECKLIST

Before marking any feature complete, verify:

- [ ] Background library image is **visibly clear** behind all sections (not covered by white overlay)
- [ ] `section::before` pseudo-element at `rgba(255,255,255,0.70)` is applied, NOT `background` on `section`
- [ ] Clock ticks every second, shows PH time (UTC+8), colons blink
- [ ] Open/closed status flips correctly based on PH day/hour
- [ ] Navbar blurs at 60px scroll, gold border appears
- [ ] Mobile hamburger opens slide-down drawer, closes on link tap
- [ ] About dropdown shows sub-sections
- [ ] All 7 service accordions expand/collapse with `max-height` transition (NOT `display:none`)
- [ ] Feedback dropdown expands to show image cards, clickable to fullscreen modal
- [ ] External Services dropdown expands to show image cards, clickable to fullscreen modal
- [ ] Modals trap focus, close on ESC or ✕
- [ ] Footer left shows iso-sidebar.png
- [ ] Footer center shows Quick Links including Facebook
- [ ] Footer right shows both email addresses + Facebook link
- [ ] All external links open in `target="_blank"` with `rel="noopener noreferrer"`
- [ ] `npm run build` produces no TypeScript errors
- [ ] Lighthouse accessibility score ≥ 90
- [ ] ⛔ **NO SQLite** anywhere in the project — only MySQL, PostgreSQL, or SQL Server

---

*PROJECT_SKILL.md v3.0 — JRMSU Katipunan Campus Library*
*Merged from: BACKENDSKILL.md, Frontend Structure rules.md, DESIGN.md, SKILL.md*
