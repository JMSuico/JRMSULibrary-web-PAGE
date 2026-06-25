# SKILL: JRMSU Katipunan Campus Library — Web Application
> AI Agent Skill File for OpenCode + DeepSeek V4 Flash
> Version 2.0 — Full-Stack Build Specification

---

## AGENT IDENTITY INSTRUCTIONS

You are building the **official web application** for JRMSU Katipunan Campus Library. You have full context of the design system, content, architecture, and interaction rules. Follow every rule here exactly. Do not invent patterns not specified. Do not apply generic AI frontend templates. Every decision must be deliberate and grounded in this document.

---

## PART 1 — PROJECT IDENTITY

| Field | Value |
|---|---|
| Product Name | JRMSU Katipunan Campus Library — Official Web App |
| Institution | Jose Rizal Memorial State University – Katipunan Campus |
| Address | National Highway, Barangay Dos, Katipunan, Zamboanga del Norte, Philippines |
| Audience | Students, Faculty, Staff, Alumni, External Researchers |
| Tech Stack | React 18 + TypeScript + Vite + Tailwind CSS |
| Tone | Professional, modern, academic — clean and dignified. NOT corporate-generic. NOT generic AI template. |
| Primary Contact Email 1 | katipunan.library@jrmsu.edu.ph |
| Primary Contact Email 2 | jrmsukclibrary@gmail.com |
| Facebook | https://www.facebook.com/JRMSUkatipunanlibrary |
| Library Hours | Monday – Friday, 7:00 AM – 7:00 PM (Philippine Time, UTC+8) |

---

## PART 2 — ANTI-PATTERN RULES (READ FIRST, ALWAYS ENFORCE)

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

## PART 3 — DESIGN SYSTEM

### 3.1 Google Fonts (import in index.css, FIRST LINE)
```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
```

### 3.2 CSS Custom Properties (define in `:root` inside index.css)
```css
:root {
  /* === JRMSU Brand Colors === */
  --navy:             #002B7F;   /* JRMSU Navy Blue — primary brand */
  --navy-dark:        #001655;   /* Deep Navy — footer, hero gradient start */
  --navy-mid:         #1A3A7A;   /* Medium Navy — gradient mid, section bg */
  --gold:             #C9A84C;   /* JRMSU Gold — CTAs, accents, active states */
  --gold-light:       #F0D97A;   /* Light Gold — hover highlights */
  --gold-pale:        #FDF6E0;   /* Pale Gold — quote block backgrounds */

  /* === Surface Colors === */
  --white:            #FFFFFF;   /* Cards, primary text on dark */
  --warm-white:       #F8F7F2;   /* Page background — library paper feel */
  --light-blue:       #EEF2FF;   /* Alternating section tints, info blocks */

  /* === Accent Color (used on dark backgrounds) === */
  --accent:           #ADD8E6;   /* Light blue — nav links, hero text, card headings on navy */

  /* === Text Colors === */
  --text:             #111827;   /* Near-black — primary body text */
  --text-mid:         #4B5563;   /* Mid gray — secondary text, descriptions */
  --text-light:       #9CA3AF;   /* Light gray — captions, timestamps, labels */

  /* === Utility === */
  --border:           #E2E8F0;   /* Card borders, dividers */
  --success:          #22C55E;   /* Library OPEN indicator */
  --danger:           #EF4444;   /* Library CLOSED indicator */

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

### 3.3 Typography System
| Role | Font | Weight | Size | Usage |
|---|---|---|---|---|
| Display / H1 Hero | Playfair Display | 700 | `clamp(36px, 5vw, 64px)` | Hero headline |
| H2 Section | Playfair Display | 700 | `clamp(28px, 3vw, 40px)` | Section titles |
| H3 Sub | Playfair Display | 600 | 22–26px | Cards, librarian name |
| Body LG | Inter | 400 | 18px | Lead paragraphs |
| Body MD | Inter | 400 | 15–16px | Standard body copy |
| Label / Eyebrow | Inter | 600 | 11–12px | UPPERCASE, letter-spacing 0.1em |
| UI / Nav | Inter | 500 | 13–14px | Nav links, buttons |
| Clock Digits | JetBrains Mono | 600 | `clamp(32px, 5vw, 56px)` | Live clock |
| Caption | Inter | 400 | 11–12px | Table captions, footer links |

### 3.4 Component Specifications

#### Buttons
```css
/* Primary — gold fill */
.btn-primary {
  background: var(--gold);
  color: var(--navy-dark);
  border: none;
  border-radius: var(--radius-btn);
  padding: 12px 28px;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background 200ms ease, transform 150ms ease;
}
.btn-primary:hover { background: var(--gold-light); transform: translateY(-1px); }

/* Secondary — ghost white (on dark bg) */
.btn-secondary {
  background: transparent;
  color: var(--white);
  border: 1px solid rgba(255,255,255,0.35);
  border-radius: var(--radius-btn);
  padding: 12px 28px;
  font-family: var(--font-body);
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 200ms ease, background 200ms ease;
}
.btn-secondary:hover { border-color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.08); }

/* Ghost — outlined navy (on light bg) */
.btn-ghost {
  background: transparent;
  color: var(--navy);
  border: 1px solid var(--navy);
  border-radius: var(--radius-btn);
  padding: 10px 24px;
  font-family: var(--font-body);
  font-weight: 500;
  cursor: pointer;
  transition: background 200ms ease;
}
.btn-ghost:hover { background: var(--navy); color: var(--white); }
```

#### Badges & Chips
```css
.badge { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: var(--radius-pill); font-family: var(--font-body); font-weight: 600; font-size: 11px; letter-spacing: 0.06em; }
.badge-external       { background: #059669; color: #fff; }
.badge-internal-ext   { background: var(--navy); color: #fff; }
.badge-elibrary       { background: #7C3AED; color: #fff; }
.badge-internal       { background: var(--navy-mid); color: #fff; }
.chip-free            { background: #E8F5E9; color: #15803D; padding: 4px 10px; border-radius: var(--radius-pill); font-size: 11px; font-weight: 600; }
.chip-overdue         { background: #FEF3C7; color: #D97706; padding: 4px 10px; border-radius: var(--radius-pill); font-size: 11px; font-weight: 600; }
```

#### Service Step Table Row Colors
```css
.step-row-normal-odd  { background: #FFFFFF; }
.step-row-normal-even { background: #EEF2FF; }
.step-row-overdue     { background: #FFFBEB; border-left: 3px solid #D97706; }
.step-row-total       { background: var(--navy); color: white; font-weight: 700; }
```

#### Glass Card
```css
.glass-card {
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(201, 168, 76, 0.3);
  border-radius: 16px;
}
```

### 3.5 Animation Definitions
```css
/* Keyframes */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes colonBlink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}
@keyframes statusPulseGreen {
  0%   { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
  70%  { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}
@keyframes statusPulseRed {
  0%   { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  70%  { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}
@keyframes scrollBounce {
  0%, 100% { transform: translateY(0); opacity: 0.5; }
  50%       { transform: translateY(6px); opacity: 1; }
}

/* Scroll-reveal utility */
.reveal {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 700ms ease, transform 700ms ease;
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
.reveal:nth-child(2) { transition-delay: 60ms; }
.reveal:nth-child(3) { transition-delay: 120ms; }
.reveal:nth-child(4) { transition-delay: 180ms; }
.reveal:nth-child(5) { transition-delay: 240ms; }

/* Card hover lift */
.card-lift {
  transition: transform 250ms ease, box-shadow 250ms ease;
}
.card-lift:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-hover);
}

/* Reduced motion override */
@media (prefers-reduced-motion: reduce) {
  .reveal, .card-lift { transition: opacity 300ms ease !important; transform: none !important; }
  .clock-colon { animation: none !important; }
}
```

### 3.6 Animation Rules
| Effect | Trigger | Properties | Duration |
|---|---|---|---|
| `fade-in-up` | Scroll → IntersectionObserver | `opacity 0→1`, `translateY 28→0` | 700ms ease |
| `card-lift` | Hover | `translateY 0→-6px`, shadow increase | 250ms ease |
| `colon-blink` | Every 1s CSS | clock colons opacity cycle | 1s infinite step-end |
| `status-pulse` | Continuous | radial `box-shadow` expansion | 2s infinite |
| Accordion open/close | Click | `max-height 0→scrollHeight`, `opacity 0→1` | 400ms ease |
| Navbar blur | >60px scroll | `backdrop-filter blur(12px)` | 300ms ease |
| Hero stagger | Page load | badge→H1→tagline→clock→CTAs | 80ms stagger |
| Modal slide-in | Click | `translateX(100%)→translateX(0)` or scale | 350ms ease-out |

**Rule:** No bounce. No loop. No elastic. Professional and purposeful only.

---

## PART 4 — PROJECT ARCHITECTURE (FEATURE-BASED / VERTICAL-SLICE)

### 4.1 Full Folder Structure
```
src/
├── App.tsx                              # Root router — composes all pages
├── main.tsx                             # Vite entry point
│
├── Pages/                               # Route-level page assemblies only
│   ├── Home/
│   │   └── HomePage.tsx                 # Assembles Hero + Personnel + Location
│   ├── About/
│   │   └── AboutPage.tsx                # About dropdown tabs + org chart + history + quality objectives
│   ├── Services/
│   │   └── ServicesPage.tsx             # Library Services + Feedback dropdown + External Services dropdown
│   ├── FileServices/
│   │   └── FileServicesPage.tsx         # Google Sheet embed + E-Books + Student Handbooks
│   └── OnlineAccess/
│       └── OnlineAccessPage.tsx         # Open Access + Resources + Acquired E-Resources
│
├── Features/                            # Feature-specific vertical slices
│   ├── Hero/
│   │   ├── components/
│   │   │   └── HeroSection.tsx          # Hero with clock widget + CTA buttons
│   │   └── hooks/
│   │       └── useLibraryClock.ts       # Clock tick + PH timezone + open/closed logic
│   ├── Gateway/
│   │   └── components/
│   │       └── GatewaySection.tsx       # Campus intro / welcome panel
│   ├── Personnel/
│   │   └── components/
│   │       └── PersonnelSection.tsx     # Librarian's Corner with Ma'am Kiara photo
│   ├── Services/
│   │   └── components/
│   │       ├── ServicesSection.tsx      # Library service cards (accordion)
│   │       ├── FeedbackDropdown.tsx     # Dropdown + 10 sliding modal cards
│   │       └── ExternalServicesDropdown.tsx  # Dropdown + 20 sliding modal cards
│   ├── Location/
│   │   └── components/
│   │       └── LocationSection.tsx      # Google Maps embed + address
│   ├── About/
│   │   └── components/
│   │       ├── OrgStructure.tsx         # Organizational chart
│   │       ├── History.tsx              # JRMSU history content
│   │       └── QualityObjectives.tsx    # Library quality objectives
│   ├── FileServices/
│   │   └── components/
│   │       └── FileServicesSection.tsx  # Google Sheet iframe + resource links
│   ├── OnlineAccess/
│   │   └── components/
│   │       ├── OpenAccessJournals.tsx   # Open access links grid
│   │       ├── Resources.tsx            # Resources links grid
│   │       └── AcquiredEResources.tsx   # Acquired e-resources links
│   └── Contact/
│       └── components/
│           └── ContactSection.tsx       # Contact info + feedback form
│
├── Components/                          # Shared reusable UI primitives
│   ├── LayoutBars/
│   │   ├── TopNavBar.tsx                # Fixed top navbar with dropdown + mobile drawer
│   │   └── Footer.tsx                   # Footer with iso-sidebar + quick links + contact
│   ├── Shared/
│   │   ├── GlassSurface.tsx             # Frosted glass panel wrapper
│   │   ├── SectionEyebrow.tsx           # Gold uppercase label
│   │   ├── Badge.tsx                    # Colored badge/chip
│   │   ├── AccordionCard.tsx            # Reusable max-height accordion
│   │   ├── ModalCard.tsx                # Sliding modal card overlay
│   │   └── RevealWrapper.tsx            # IntersectionObserver fade-in-up wrapper
│   └── Icons/
│       └── icons.tsx                    # SVG icon components (no external icon lib)
│
├── LayoutStyles/                        # Global styling
│   ├── index.css                        # CSS tokens, animations, backgrounds, resets
│   └── Colors.ts                        # TypeScript palette constants
│
├── Hooks/                               # Shared reusable hooks
│   ├── useIntersectionObserver.ts       # Reveal-on-scroll observer
│   └── useScrolledNav.ts               # Tracks scroll > 60px for navbar blur
│
├── Lib/
│   └── assets/
│       └── data.ts                      # CDN asset URLs, link lists, service data
│
└── Types/
    └── landing.types.ts                 # TypeScript interfaces for all data shapes
```

### 4.2 TypeScript Types (landing.types.ts)
```typescript
export interface ServiceStep {
  clientStep: string;
  agencyAction: string;
  fees: string;
  time: string;
  person: string;
  isOverdue?: boolean;
}

export interface LibraryService {
  id: string;
  title: string;
  subtitle: string;
  category: 'borrowing' | 'returning' | 'e-library' | 'clearance';
  badgeType: 'external' | 'internal-ext' | 'e-library' | 'internal';
  whoMayAvail: string;
  totalTime: string;
  totalFee: string;
  requirements: { item: string; whereToSecure?: string }[];
  steps: ServiceStep[];
}

export interface OnlineResource {
  name: string;
  url: string;
  category: 'open-access' | 'resources' | 'acquired';
}

export interface NavItem {
  label: string;
  href: string;
  dropdown?: { label: string; href: string }[];
}

export interface ContactInfo {
  email1: string;
  email2: string;
  facebook: string;
  hours: string;
  address: string;
}
```

### 4.3 Background Blend Fix (index.css — CRITICAL)
```css
/* Body background — library building image */
body {
  background-image: url('/assets/library-building.jpg'); /* use actual asset */
  background-size: cover;
  background-attachment: fixed;
  background-position: center;
  min-height: 100vh;
}

/* Section overlay — 70% white so 30% of library building shows through */
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

/* Footer — solid bg exception */
footer {
  background: var(--navy-dark) !important;
}
footer::before { display: none; }
```

---

## PART 5 — NAVIGATION

### 5.1 TopNavBar.tsx Rules
- Fixed top, full width, `z-index: 1000`
- Height: 64px desktop / 56px mobile
- Default: `background: var(--navy)`
- After 60px scroll: `background: rgba(0,43,127,0.95)`, `backdrop-filter: blur(12px)`, `border-bottom: 1px solid rgba(201,168,76,0.3)`

### 5.2 Logo (left side)
```
[SVG gold circle "J"] + "JRMSU Library" (Playfair Display 18px white)
                         "KATIPUNAN CAMPUS" (Inter 10px gold, uppercase, letter-spacing 0.1em)
```

### 5.3 Nav Links (right side, desktop)
Order: `HOME | ABOUT | SERVICES | FILE SERVICES | ONLINE ACCESS`
- Inter 500, 13px, UPPERCASE, letter-spacing 0.05em, color white
- Hover/active: gold underline animation (scaleX 0→1, transform-origin left)
- ABOUT has a dropdown:

```
ABOUT ▾
├── Organizational Structure    → /about#org-structure
├── History of JRMSU            → /about#history
└── JRMSU Library Quality Objectives → /about#quality-objectives
```

### 5.4 Mobile Nav (< 768px)
- Show hamburger ☰ icon (white, 24px)
- Click opens slide-down drawer: `background: var(--navy-dark)`, 100% width
- Links stack vertically, 48px height, gold bottom border
- ✕ closes drawer; tapping a link closes it and navigates

---

## PART 6 — HOME PAGE

### 6.1 Hero Section (HeroSection.tsx)

**Layout:** Full viewport (`100vh`), flexbox column, `align-items: center`, `justify-content: center`, `text-align: center`

**Background:**
```css
.hero {
  background: linear-gradient(160deg, #001655 0%, #002B7F 55%, #1A3A7A 100%);
  position: relative;
}
.hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40L40 0M-5 5L5-5M35 45L45 35' stroke='white' stroke-width='0.5' fill='none'/%3E%3C/svg%3E");
  opacity: 0.04;
  pointer-events: none;
}
```

**Content stack (staggered fade-in-up on mount, 80ms delay per item):**

1. Library hours badge pill:
   ```
   📚  Library Hours: Monday – Friday  |  7:00 AM – 7:00 PM
   ```
   Style: `border: 1px solid rgba(201,168,76,0.4)`, `background: rgba(255,255,255,0.06)`, `border-radius: 99px`, padding `8px 20px`, Inter 600 12px uppercase, color `var(--gold)`

2. H1: **"Welcome to JRMSU Katipunan Campus Library"**
   Playfair Display 700, `clamp(36px,5vw,64px)`, color white

3. Tagline (italic, Playfair Display 400, 18px, `rgba(255,255,255,0.72)`):
   *"From pages to possibilities — knowledge, research, and lifelong learning."*

4. **⭐ REAL-TIME CLOCK WIDGET** (see 6.2 below)

5. CTA Buttons:
   - `View Our Services` → `btn-primary`, navigates to `/services`
   - `Learn More` → `btn-secondary`, navigates to `/about`

6. Scroll indicator (absolute, bottom 48px, center):
   ```
   ↓  SCROLL
   ```
   Inter 11px uppercase, `rgba(255,255,255,0.4)`, animation: `scrollBounce 2s ease-in-out infinite`

### 6.2 Real-Time Clock Widget (useLibraryClock.ts)

**This is the signature element — build it perfectly.**

```typescript
// useLibraryClock.ts
import { useState, useEffect } from 'react';

interface ClockState {
  timeStr: string;      // "HH:MM:SS AM/PM"
  dateStr: string;      // "MM – DD – YYYY"
  isOpen: boolean;      // true = library is open
}

export function useLibraryClock(): ClockState {
  const [state, setState] = useState<ClockState>({ timeStr: '', dateStr: '', isOpen: false });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const phOptions = { timeZone: 'Asia/Manila' } as const;

      // Time string — HH:MM:SS AM/PM
      const timeStr = new Intl.DateTimeFormat('en-PH', {
        ...phOptions,
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
      }).format(now);

      // Date string — MM – DD – YYYY
      const p = new Intl.DateTimeFormat('en-PH', {
        ...phOptions,
        month: '2-digit', day: '2-digit', year: 'numeric'
      }).formatToParts(now);
      const m = p.find(x => x.type === 'month')?.value ?? '';
      const d = p.find(x => x.type === 'day')?.value ?? '';
      const y = p.find(x => x.type === 'year')?.value ?? '';
      const dateStr = `${m} – ${d} – ${y}`;

      // Open/closed — Mon–Fri 7:00 AM to 7:00 PM PH Time
      const phNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
      const day = phNow.getDay();   // 0=Sun, 1=Mon … 5=Fri, 6=Sat
      const hour = phNow.getHours();
      const isOpen = day >= 1 && day <= 5 && hour >= 7 && hour < 19;

      setState({ timeStr, dateStr, isOpen });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return state;
}
```

**Clock widget JSX structure (inside HeroSection.tsx):**
```tsx
<div className="glass-card clock-widget">
  <div className="clock-time">
    {/* Split timeStr into parts so colons get .clock-colon class */}
    {renderTimeWithBlinkingColons(timeStr)}
  </div>
  <div className="clock-date">{dateStr}</div>
  <div className={`status-dot ${isOpen ? 'open' : 'closed'}`}>
    <span className="dot-pulse" />
    <span className="status-text">
      {isOpen ? 'LIBRARY IS NOW OPEN' : 'LIBRARY IS CLOSED'}
    </span>
  </div>
</div>
```

```css
.clock-widget { padding: 28px 48px; text-align: center; }
.clock-time { font-family: var(--font-mono); font-size: clamp(32px,5vw,56px); font-weight: 600; color: var(--gold); }
.clock-colon { animation: colonBlink 1s step-end infinite; }
.clock-date { font-family: var(--font-mono); font-size: 14px; color: rgba(255,255,255,0.5); margin-top: 4px; }
.status-dot { display: flex; align-items: center; gap: 8px; justify-content: center; margin-top: 16px; }
.dot-pulse { width: 10px; height: 10px; border-radius: 50%; }
.status-dot.open .dot-pulse { background: var(--success); animation: statusPulseGreen 2s infinite; }
.status-dot.closed .dot-pulse { background: var(--danger); animation: statusPulseRed 2s infinite; }
.status-text { font-family: var(--font-body); font-size: 12px; font-weight: 600; letter-spacing: 0.1em; }
.status-dot.open .status-text { color: var(--success); }
.status-dot.closed .status-text { color: var(--danger); }
```

### 6.3 Librarian's Corner (PersonnelSection.tsx)

Layout: Centered card, max-width 760px, two-column horizontal split:
- **Left panel** (min-width 220px): `background: linear-gradient(180deg, var(--navy-dark), var(--navy))`
  - Center: real photo of Ma'am Kiara — `import maamKiara from '/assets/maam_kiaras.png'`
  - Image: `width: 120px`, `height: 140px`, `object-fit: cover`, `border-radius: 8px`, `border: 2px solid var(--gold)`
  - Name: **"Kiara Keren M. Alavanza"** — Playfair Display 600 16px white
  - Title: **"Campus Librarian"** — Inter 400 12px `var(--gold)` uppercase
  - Decorative line: `width: 40px`, `border-top: 2px solid rgba(201,168,76,0.4)`, centered
- **Right panel** (white bg, padding 36px):
  - Eyebrow: `LIBRARIAN'S CORNER` — Inter 600 11px `var(--gold)` uppercase
  - Quote block (gold-pale bg, gold left border 4px):
    *"From pages to possibilities—the JRMSU Library fosters knowledge, research, and lifelong learning in pursuit of excellence."*
  - Mission text (Inter 400 15px `var(--text-mid)`, line-height 1.7):
    Full library mission paragraphs (see Part 9 for full content)
  - Closing italic (Playfair Display 400 italic 16px `var(--gold)`):
    *"Thank you for making the library part of your journey. Padayon, JRMSUans!"*

### 6.4 Location Section (LocationSection.tsx)

- Eyebrow: `📍 FIND US HERE`
- Google Maps iframe embed for JRMSU Katipunan Campus:
  ```html
  <iframe
    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d..."
    width="100%" height="380"
    style="border:0; border-radius:12px; border: 2px solid var(--gold);"
    allowfullscreen loading="lazy"
    title="JRMSU Katipunan Campus Location"
  />
  ```
  Location: National Highway, Barangay Dos, Katipunan, Zamboanga del Norte, Philippines
- Address line: Inter 400 14px `var(--text-mid)`

---

## PART 7 — ABOUT PAGE

### 7.1 Tab/Dropdown Selections
The About page has a tab switcher or dropdown selector at the top:

| Tab Label | Component |
|---|---|
| Organizational Structure | `OrgStructure.tsx` — org chart flowchart |
| History of JRMSU | `History.tsx` — text content block |
| JRMSU Library Quality Objectives | `QualityObjectives.tsx` — objectives list |
| Staff / Personnel | `PersonnelSection.tsx` — transferred here from old location |

Active tab state tracked in `AboutPage.tsx` via `useState`.
Default active: "Organizational Structure".

---

## PART 8 — SERVICES PAGE

### 8.1 Library Services Section
Full text services list — render each as a styled card. See Part 10 for full text.

### 8.2 Citizens Charter — 7 Accordion Service Cards
Tab filter row: `ALL | BORROWING | RETURNING | E-LIBRARY | CLEARANCE` (pill tabs, gold active)

Each card: header (clickable, `aria-expanded`) → expanded panel with requirements + step table.
Use `AccordionCard.tsx` with `max-height` transition.

Full service data is defined in `data.ts` — see Part 11.

### 8.3 Feedback and Complaints Mechanism — FeedbackDropdown.tsx
- **Trigger:** Dropdown button/header (accordion style)
- **On expand:** Render 10 sliding modal cards in a horizontal scroll or swipe carousel
- **Each card:** displays one image from `assets/Feedback and complains mechanism/`
  - Image naming pattern: `feedback-01.jpg` through `feedback-10.jpg` (use actual filenames)
  - Card: `width: 320px`, `border-radius: 12px`, `overflow: hidden`, shadow
  - Modal overlay: clicking a card opens it fullscreen with ESC/✕ close
- **Slide animation:** `transform: translateX(100%) → translateX(0)`, 350ms ease-out
- **Navigation arrows:** prev/next inside the gallery

### 8.4 External Services — ExternalServicesDropdown.tsx
- **Trigger:** Dropdown button/header (accordion style)
- **On expand:** Render 20 sliding modal cards in a horizontal scroll carousel
- **Each card:** displays one image from `assets/Library External Services/`
  - Image naming pattern: `external-01.jpg` through `external-20.jpg` (use actual filenames)
  - Same card style as Feedback cards
  - Clicking opens fullscreen modal overlay with ESC/✕ close
- **Total:** Exactly 20 cards, 20 images

---

## PART 9 — FILE SERVICES PAGE

- **Google Sheet embed** (primary content):
  ```html
  <iframe
    src="[GOOGLE_SHEET_PUBLISHED_URL]"
    width="100%" height="600"
    style="border: 1px solid var(--border); border-radius: 12px;"
    title="Library File Services"
  />
  ```
- **E-Books and Journals** card:
  - Button → `https://drive.google.com/drive/folders/1yFnMsT2s5o_t4pZgbIFzi2c1o2xb6YEG?usp=sharing`
- **Student Handbooks** card (in Resources section):
  - Button → `https://drive.google.com/file/d/18erQ6LSfT3Jia84n77WBPOb1JfzI-tQj/view`

---

## PART 10 — ONLINE ACCESS PAGE

### 10.1 Open Access Journals
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

### 10.2 Resources
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

### 10.3 Acquired E-Resources
| Resource | URL |
|---|---|
| Bookshelf | https://www.vitalsource.com/ |
| Scholaar | https://scholaar.com/ |

---

## PART 11 — LIBRARY SERVICES TEXT CONTENT

### 11.1 Library Services List (ServicesSection.tsx)
Render each service as a styled service card:

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

### 11.2 Campus Contact Details Table (inside Ask-a-Librarian)
| Campus | Email | Social Media | Contact |
|---|---|---|---|
| Main Campus | main.library@jrmsu.edu.ph | JRMSU Main Campus Library | 09215903198 / 09353404868 |
| Dipolog Campus | dipolog.library@jrmsu.edu.ph | FB: JRMSU Dipolog Campus Library; IG & Twitter: @jrmsudiplibrary | (065) 917 8171 / (065) 918 0268 |
| Katipunan Campus | katipunan.library@jrmsu.edu.ph | JRMSU Katipunan Campus Library | (065) 918 0141 |
| Tampilisan Campus | jrmsutampilisan.library@jrmsu.edu.ph | JRMSU Tampilisan Campus Library | 09165537813 |
| Siocon Campus | siocon.library@jrmsu.edu.ph | JRMSU Siocon Campus Library | 09976177595 |

---

## PART 12 — CITIZENS CHARTER — 7 SERVICES DATA (data.ts)

```typescript
// src/Lib/assets/data.ts — partial (services array)
export const libraryServices: LibraryService[] = [
  {
    id: 'clearance-online',
    title: 'Signing of Library Clearance',
    subtitle: 'Online Transaction',
    category: 'clearance',
    badgeType: 'external',
    whoMayAvail: 'Students',
    totalTime: '18 minutes',
    totalFee: 'None',
    requirements: [
      { item: 'Clearance' },
      { item: 'Borrower\'s Card / Clear Record in the Integrated Library System (ILS)' },
    ],
    steps: [
      { clientStep: 'Log in to https://jrmsu-arms.online/ and click the student portal', agencyAction: '1.1 Log in to https://jrmsu-arms.online/ and click the designee portal', fees: 'None', time: '5 min', person: 'Librarian / Library Staff' },
      { clientStep: 'Request for online clearance signing', agencyAction: '2.1 View and check Students Clearance Request', fees: 'None', time: '3 min', person: 'Librarian / Library Staff' },
      { clientStep: 'Wait for the designee to process and approve the clearance', agencyAction: '3.1 Check students\' records and process online clearance', fees: 'None', time: '3 min', person: 'Librarian / Library Staff' },
      { clientStep: 'Accomplish the customer feedback form', agencyAction: '4.1 Provide client with CSM form or using the link: www.jrmsu.online/feedback', fees: 'None', time: '5 min', person: 'Librarian / Library Staff' },
    ],
  },
  {
    id: 'borrowing-automated',
    title: 'Circulation — Borrowing Service',
    subtitle: 'Automated Transaction',
    category: 'borrowing',
    badgeType: 'internal-ext',
    whoMayAvail: 'Students, Faculty, and Staff',
    totalTime: '23 minutes',
    totalFee: 'None',
    requirements: [
      { item: 'For Students: Validated Student\'s ID', whereToSecure: 'Office of Student Affairs and Services (OSAS)' },
      { item: 'For Students: EDP', whereToSecure: 'Registrar\'s Office' },
      { item: 'For Faculty and Staff: Faculty/Staff ID', whereToSecure: 'OSAS' },
      { item: 'For Faculty: Teacher\'s Load', whereToSecure: 'Registrar\'s Office' },
    ],
    steps: [
      { clientStep: 'Select book(s) or materials using the Online Public Access Catalog (OPAC)', agencyAction: '1.1 Assists the library customers in locating the book(s) or materials', fees: 'None', time: '10 min', person: 'Circulation in-Charge / Librarian' },
      { clientStep: 'Present ID and selected materials to the circulation in-charge for proper recording', agencyAction: '2.1 Check and verify ID and selected materials; 2.2 Login in ILS circulation module; 2.3 Scan barcode of borrowers\' ID and book(s); 2.4 Print receipt', fees: 'None', time: '5 min', person: 'Circulation in-Charge / Librarian' },
      { clientStep: 'Receive the borrowed book(s) or materials', agencyAction: '3.1 Release the borrowed book(s) or materials to the borrower', fees: 'None', time: '3 min', person: 'Circulation in-Charge / Librarian' },
      { clientStep: 'Accomplish the customer feedback form', agencyAction: '4.1 Provide client with CSM form or using the link: www.jrmsu.online/feedback', fees: 'None', time: '5 min', person: 'Circulation in-Charge / Librarian' },
    ],
  },
  {
    id: 'borrowing-manual',
    title: 'Circulation — Borrowing Service',
    subtitle: 'Manual Transaction',
    category: 'borrowing',
    badgeType: 'internal-ext',
    whoMayAvail: 'Students, Faculty, and Staff',
    totalTime: '26 minutes',
    totalFee: 'None',
    requirements: [
      { item: 'For Students: Validated Student\'s ID', whereToSecure: 'OSAS' },
      { item: 'For Students: EDP', whereToSecure: 'Registrar\'s Office' },
      { item: 'For Faculty and Staff: Faculty/Staff ID', whereToSecure: 'OSAS' },
      { item: 'For Faculty: Teacher\'s Load', whereToSecure: 'Registrar\'s Office' },
    ],
    steps: [
      { clientStep: 'Select book(s) or materials using the OPAC', agencyAction: '1.1 Assists library customers in locating the book(s) or materials', fees: 'None', time: '10 min', person: 'Circulation in-Charge / Librarian' },
      { clientStep: 'Present ID and selected materials to the circulation in-charge', agencyAction: '2.1 Check and verify the ID and selected materials', fees: 'None', time: '5 min', person: 'Circulation in-Charge / Librarian' },
      { clientStep: 'Fill-out the book card and borrowers\' card', agencyAction: '3.1 Check the signed book card and borrowers\' card', fees: 'None', time: '3 min', person: 'Circulation in-Charge / Librarian' },
      { clientStep: 'Receive the borrowed book(s) or materials', agencyAction: '4.1 Release the borrowed book(s) or materials; 4.2 Keep the borrowers\' card with signed book card', fees: 'None', time: '3 min', person: 'Circulation in-Charge / Librarian' },
      { clientStep: 'Accomplish the customer feedback form', agencyAction: '5.1 Provide client with CSM form or using the link: www.jrmsu.online/feedback', fees: 'None', time: '5 min', person: 'Circulation in-Charge / Librarian' },
    ],
  },
  {
    id: 'returning-automated',
    title: 'Circulation — Returning Service',
    subtitle: 'Automated Transaction',
    category: 'returning',
    badgeType: 'internal-ext',
    whoMayAvail: 'Students, Faculty, and Staff',
    totalTime: '23 minutes',
    totalFee: 'PHP 10 × no. of hours (overdue)',
    requirements: [
      { item: 'Borrowed Book(s) or materials', whereToSecure: 'Library' },
      { item: 'For Overdue: Official Receipt (OR)', whereToSecure: 'Cashier\'s Office' },
    ],
    steps: [
      { clientStep: 'Present the borrowed book(s) or materials to the circulation in-charge', agencyAction: '1.1 Scan or swipe the book\'s barcode in the ILS circulation module return dashboard', fees: 'None', time: '3 min', person: 'Circulation in-Charge / Librarian' },
      { clientStep: 'For Overdue: 2a. Proceed to cashier\'s office; 2b. Present Official Receipt (OR) as proof of payment; 2c. Acknowledge receipt of OR', agencyAction: '2.1.1 Instruct borrower to proceed to cashier\'s office to pay overdue fines; 2.1.2 Record OR number in logbook; 2.1.3 Return OR to borrower', fees: 'PHP 10.00/office hour (excl. weekends & holidays)', time: '15 min', person: 'Circulation in-Charge / Librarian', isOverdue: true },
      { clientStep: 'Accomplish the customer feedback form', agencyAction: '3.1 Provide client with CSM form or using the link: www.jrmsu.online/feedback', fees: 'None', time: '5 min', person: 'Circulation in-Charge / Librarian' },
    ],
  },
  {
    id: 'returning-manual',
    title: 'Circulation — Returning Service',
    subtitle: 'Manual Transaction',
    category: 'returning',
    badgeType: 'internal-ext',
    whoMayAvail: 'Students, Faculty, and Staff',
    totalTime: '27 minutes',
    totalFee: 'PHP 10 × no. of hours (overdue)',
    requirements: [
      { item: 'Borrowed Book(s) or materials', whereToSecure: 'Library' },
      { item: 'For Overdue: Official Receipt (OR)', whereToSecure: 'Cashier\'s Office' },
    ],
    steps: [
      { clientStep: 'Present the borrowed book(s) or materials to the circulation in-charge', agencyAction: '1.1 Receive and check the borrowed book(s); 1.2 Retrieve borrower\'s card and book card, record return date; 1.3 Place book card back into book pocket', fees: 'None', time: '5 min', person: 'Circulation in-Charge / Librarian' },
      { clientStep: 'For Overdue: 2a. Proceed to cashier\'s office; 2b. Present OR as proof; 2c. Acknowledge receipt', agencyAction: '2.1.1 Calculate fines; 2.1.2 Instruct borrower to proceed to cashier\'s office; 2.1.3 Record OR number in logbook; 2.1.4 Return OR to borrower', fees: 'PHP 10.00/office hour (excl. weekends & holidays)', time: '15 min', person: 'Circulation in-Charge / Librarian', isOverdue: true },
      { clientStep: 'Receive the borrower\'s card', agencyAction: '3.1 Release the borrowers\' card to the borrower', fees: 'None', time: '2 min', person: 'Circulation in-Charge / Librarian' },
      { clientStep: 'Accomplish the customer feedback form', agencyAction: '4.1 Provide client with CSM form or using the link: www.jrmsu.online/feedback', fees: 'None', time: '5 min', person: 'Circulation in-Charge / Librarian' },
    ],
  },
  {
    id: 'e-library',
    title: 'E-Library Services',
    subtitle: '',
    category: 'e-library',
    badgeType: 'e-library',
    whoMayAvail: 'Students, Faculty, Staff, Alumni, and External Researchers',
    totalTime: '19 minutes',
    totalFee: 'None',
    requirements: [
      { item: 'A. For Students: Student\'s ID' },
      { item: 'B. For Faculty and Employees: Employee\'s ID' },
      { item: 'C. Alumni: Alumni\'s ID' },
      { item: 'D. External Researchers: Referral Letter / Endorsement Letter', whereToSecure: 'External Library / Agency / Institution' },
    ],
    steps: [
      { clientStep: 'Present school ID for logbook recording, then swipe ID at the barcode reader', agencyAction: '1.1 Verify ID validity', fees: 'None', time: '3 min', person: 'IT / E-Library in-Charge' },
      { clientStep: 'First-time users: obtain a username and password', agencyAction: '2.1 Issue username and password (30 hours per semester)', fees: 'None', time: '5 min', person: 'IT / E-Library in-Charge' },
      { clientStep: 'Proceed to the designated workstation', agencyAction: '3.1 Assist and monitor the client as needed', fees: 'None', time: '3 min', person: 'IT / E-Library in-Charge' },
      { clientStep: 'Log out the user\'s account', agencyAction: '4.1 Instruct user to organize workstation and ensure it is ready for next user', fees: 'None', time: '3 min', person: 'IT / E-Library in-Charge' },
      { clientStep: 'Accomplish the customer feedback form', agencyAction: '5.1 Provide client with CSM form or using the link: www.jrmsu.online/feedback', fees: 'None', time: '5 min', person: 'IT / E-Library in-Charge' },
    ],
  },
  {
    id: 'clearance-manual',
    title: 'Signing of Library Clearance',
    subtitle: 'Manual Transaction',
    category: 'clearance',
    badgeType: 'internal',
    whoMayAvail: 'Faculty and Staff',
    totalTime: '13 minutes',
    totalFee: 'None',
    requirements: [
      { item: 'Shall return all borrowed book(s) or materials', whereToSecure: 'Library' },
      { item: 'Faculty / Staff clearance', whereToSecure: 'Library' },
    ],
    steps: [
      { clientStep: 'Present customers\' clearance', agencyAction: '1.1 Check the records of the faculty/staff in the library record or in the Integrated Library System (ILM)', fees: 'None', time: '5 min', person: 'Librarian / Library Staff' },
      { clientStep: 'Wait for the assigned library personnel to process and approve the clearance', agencyAction: '2.1 Release the customer\'s clearance', fees: 'None', time: '3 min', person: 'Librarian / Library Staff' },
      { clientStep: 'Accomplish the customer feedback form', agencyAction: '3.1 Provide client with CSM form or using the link: www.jrmsu.online/feedback', fees: 'None', time: '5 min', person: 'Librarian / Library Staff' },
    ],
  },
];
```

---

## PART 13 — QUICK LINKS & FOOTER

### 13.1 Quick Links (in Footer center column + sidebar)
```
Library Policies        → /library-policies
Contact Support         → navigates to #contact section
Privacy Policy          → /privacy-policy
Facebook Page           → https://www.facebook.com/JRMSUkatipunanlibrary
```

### 13.2 Footer Layout (3-column, `background: var(--navy-dark)`)

**Gold top border:** `border-top: 2px solid var(--gold)`

**Left column:**
- Display `iso-sidebar.png` — `import isoSidebar from '/assets/iso-sidebar.png'`
- `width: 180px`, `object-fit: contain`

**Center column:**
- Heading: `QUICK LINKS` (Inter 600 11px var(--gold) uppercase)
- Links: Library Policies | Contact Support | Privacy Policy | Facebook Page

**Right column:**
- Heading: `CONTACT US` (Inter 600 11px var(--gold) uppercase)
- Email 1: katipunan.library@jrmsu.edu.ph
- Email 2: jrmsukclibrary@gmail.com
- Facebook: https://www.facebook.com/JRMSUkatipunanlibrary

**Bottom bar:**
```
© {new Date().getFullYear()} JRMSU-Katipunan Campus Library. All rights reserved.
                                        JRMSU Main | GOV.PH | Data Privacy
```

---

## PART 14 — ACCESSIBILITY REQUIREMENTS

| Rule | Implementation |
|---|---|
| WCAG 2.1 AA minimum | Navy on white 8.6:1 ✅, Gold on navy 5.2:1 ✅, White on navy 8.6:1 ✅ |
| `<h1>` once per page | Hero headline only |
| Heading hierarchy | H1 → H2 → H3, never skip levels |
| Keyboard nav | All interactive elements focusable; no `tabindex="-1"` on links |
| Focus ring | `outline: 2px solid var(--gold); outline-offset: 2px` on `:focus-visible` |
| Accordion | `<button aria-expanded="true/false">` — never `<div>` with click |
| Icons | `aria-label` on all icon-only buttons |
| Images | `alt` text on all `<img>` — including Ma'am Kiara's photo: `alt="Kiara Keren M. Alavanza, Campus Librarian"` |
| Iframes | `title` attribute required on Google Maps and Google Sheet iframes |
| Modal | `role="dialog"`, `aria-modal="true"`, focus trapped inside, ESC closes |
| Forms | `<label for="">` paired with every `<input>` and `<textarea>` |
| Motion | `@media (prefers-reduced-motion: reduce)` disables all transform animations |

---

## PART 15 — EXTERNAL LINKS (ALL VERIFIED)

### University Libraries
| Campus | URL |
|---|---|
| Main Campus (Dapitan) | https://jrmsu.edu.ph/library/ |
| Dipolog Campus | http://dipolog.jrmsu.edu.ph/ |
| Tampilisan Campus | http://tampilisan.jrmsu.edu.ph/ |
| Siocon Campus | http://siocon.jrmsu.edu.ph/ |
| Katipunan Campus | *(current page)* |

### External Systems
| Service | URL |
|---|---|
| JRMSU ARMS Online | https://jrmsu-arms.online/ |
| Online Library Clearance | https://www.jrmsu-clearance.online/ |
| CSM Feedback Form | https://www.jrmsu.online/feedback |
| JRMSU Katipunan Campus Website | https://katipunan.jrmsu.edu.ph/ |

### File Services Resources
| Resource | URL |
|---|---|
| E-Books and Journals (Drive) | https://drive.google.com/drive/folders/1yFnMsT2s5o_t4pZgbIFzi2c1o2xb6YEG?usp=sharing |
| Student Handbooks (Drive) | https://drive.google.com/file/d/18erQ6LSfT3Jia84n77WBPOb1JfzI-tQj/view |

---

## PART 16 — ASSETS REFERENCE TABLE

| Asset Name | Path in Project | Usage |
|---|---|---|
| Librarian Photo | `/public/assets/maam_kiaras.png` | PersonnelSection — Librarian's Corner |
| ISO Sidebar Image | `/public/assets/iso-sidebar.png` | Footer — left column |
| Feedback Cards (10) | `/public/assets/feedback/feedback-01.jpg` … `feedback-10.jpg` | FeedbackDropdown modal cards |
| External Services (20) | `/public/assets/external/external-01.jpg` … `external-20.jpg` | ExternalServicesDropdown modal cards |
| Library Building | `/public/assets/library-building.jpg` | Body background-image (must show through sections) |

---

## PART 17 — VERIFICATION CHECKLIST

Before marking any feature complete, verify:

- [ ] Background library image is **visibly clear** behind all sections (not covered by white overlay)
- [ ] `section::before` pseudo-element at `rgba(255,255,255,0.70)` is applied, NOT `background` on `section`
- [ ] Clock ticks every second, shows PH time (UTC+8), colons blink
- [ ] Open/closed status flips correctly based on PH day/hour
- [ ] Navbar blurs at 60px scroll, gold border appears
- [ ] Mobile hamburger opens slide-down drawer, closes on link tap
- [ ] About dropdown shows 4 sub-sections
- [ ] All 7 service accordions expand/collapse with `max-height` transition (NOT `display:none`)
- [ ] Feedback dropdown expands to show 10 image cards, clickable to fullscreen modal
- [ ] External Services dropdown expands to show 20 image cards, clickable to fullscreen modal
- [ ] Modals trap focus, close on ESC or ✕
- [ ] Footer left shows iso-sidebar.png
- [ ] Footer center shows all 4 Quick Links including Facebook
- [ ] Footer right shows both email addresses + Facebook link
- [ ] All external links open in `target="_blank"` with `rel="noopener noreferrer"`
- [ ] `npm run build` produces no TypeScript errors
- [ ] Lighthouse accessibility score ≥ 90

---

*SKILL.md v2.0 — JRMSU Katipunan Campus Library*
*Compiled from: DESIGN.md, Frontend_Structure_rules.md, INSTRUCTIONS_PROMPT.md, service charter photos*
