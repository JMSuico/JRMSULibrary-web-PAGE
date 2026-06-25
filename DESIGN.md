---
name: Academic Excellence & Tradition
colors:
  surface: '#faf8ff'
  surface-dim: '#dad9e1'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3fa'
  surface-container: '#eeedf5'
  surface-container-high: '#e8e7ef'
  surface-container-highest: '#e3e2e9'
  on-surface: '#1a1b21'
  on-surface-variant: '#444651'
  inverse-surface: '#2f3036'
  inverse-on-surface: '#f1f0f8'
  outline: '#747683'
  outline-variant: '#c4c6d3'
  surface-tint: '#3d5aad'
  primary: '#001851'
  on-primary: '#ffffff'
  primary-container: '#002b7f'
  on-primary-container: '#7c97ef'
  inverse-primary: '#b5c4ff'
  secondary: '#755b00'
  on-secondary: '#ffffff'
  secondary-container: '#fed977'
  on-secondary-container: '#785d00'
  tertiary: '#191e27'
  on-tertiary: '#ffffff'
  tertiary-container: '#2e333d'
  on-tertiary-container: '#969ba7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b5c4ff'
  on-primary-fixed: '#00174c'
  on-primary-fixed-variant: '#224194'
  secondary-fixed: '#ffe08f'
  secondary-fixed-dim: '#e6c364'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#584400'
  tertiary-fixed: '#dee2ef'
  tertiary-fixed-dim: '#c2c6d3'
  on-tertiary-fixed: '#171c25'
  on-tertiary-fixed-variant: '#424751'
  background: '#faf8ff'
  on-background: '#1a1b21'
  surface-variant: '#e3e2e9'
  navy-dark: '#001655'
  navy-mid: '#1A3A7A'
  gold-light: '#F0D97A'
  gold-pale: '#FDF6E0'
  warm-white: '#F8F7F2'
  text-muted: '#4B5563'
  success: '#22C55E'
  danger: '#EF4444'
typography:
  display-hero:
    fontFamily: Playfair Display
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.05em
  ui-nav:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.0'
  status-clock:
    fontFamily: JetBrains Mono
    fontSize: 56px
    fontWeight: '600'
    lineHeight: '1.0'
  status-clock-mobile:
    fontFamily: JetBrains Mono
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  section-py-desktop: 80px
  section-py-mobile: 48px
  gutter: 24px
  margin-mobile: 16px
  max-width: 1200px
---

# JRMSU Katipunan Campus Library — Design System
> Version 1.0 | For Google Stitch UI Generation

---

## 1. PROJECT BRIEF

**Product:** Official Library Landing Page — JRMSU Katipunan Campus Library  
**Institution:** Jose Rizal Memorial State University – Katipunan Campus  
**Address:** National Highway, Barangay Dos, Katipunan, Zamboanga del Norte, Philippines  
**Audience:** Students, Faculty, Staff, Alumni, External Researchers  
**Page Purpose:** Single-page informational landing page with real-time library status, service guide, about section, feedback mechanism, and contact information.  
**Tone:** Professional, modern, academic — clean and dignified; not corporate-generic.

---

## 2. BRAND IDENTITY

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

## 3. TYPOGRAPHY

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

## 4. LAYOUT SYSTEM

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

## 5. NAVIGATION

- **Type:** Fixed top navbar, full-width
- **Background:** `--navy` solid; transitions to `rgba(0,43,127,0.95)` with `backdrop-filter: blur(12px)` after 60px scroll
- **Height:** 64px desktop, 56px mobile
- **Logo:** JRMSU circular emblem (gold circle with "J") + wordmark "JRMSU Library" in Playfair Display + sub-label "KATIPUNAN CAMPUS" in Inter 10px
- **Nav Links:** `HOME | ABOUT | SERVICES | FILE SERVICES | ONLINE ACCESS` — uppercase, 13px, letter-spacing 0.05em, color white; underline animation on hover/active in gold
- **Mobile:** Hamburger icon (☰/✕), slide-down drawer with navy-dark background
- **Border-bottom on scroll:** `1px solid rgba(201,168,76,0.3)` — subtle gold separator

---

## 6. SECTION ARCHITECTURE

### Section 1 — HERO (id="home")
- **Layout:** Full-viewport (`100vh`), centered content, dark navy gradient background
- **Background:** `linear-gradient(160deg, #001655 0%, #002B7F 55%, #1A3A7A 100%)`
- **Texture overlay:** Subtle grid pattern at 4% opacity (white lines)
- **Content stack (centered):**
  1. Library hours badge pill — gold bordered, rounded, uppercase: `📚 Library Hours: Monday–Friday | 7:00 AM – 7:00 PM`
  2. H1 headline: `Welcome to JRMSU Katipunan Campus Library` — Playfair Display 56px, white
  3. Subheadline paragraph: italic tagline, 18px, rgba(white,0.72)
  4. **⭐ SIGNATURE ELEMENT: Real-Time Clock Widget** (see below)
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

**7 Services:**
1. Signing of Library Clearance — Online Transaction (EXTERNAL | Students | 18 min | Free)
2. Circulation – Borrowing Service — Automated (INTERNAL/EXTERNAL | Students/Faculty/Staff | 23 min | Free)
3. Circulation – Borrowing Service — Manual (INTERNAL/EXTERNAL | 26 min | Free)
4. Circulation – Returning Service — Automated (INTERNAL/EXTERNAL | 23 min | PHP 10/hr overdue)
5. Circulation – Returning Service — Manual (INTERNAL/EXTERNAL | 27 min | PHP 10/hr overdue)
6. E-Library Services (INTERNAL/EXTERNAL | All users | 19 min | Free)
7. Signing of Library Clearance — Manual (INTERNAL/EXTERNAL | Faculty & Staff | 13 min | Free)

### Section 5 — FILE SERVICES (id="file-services")
- **Layout:** 3-column card grid
- **Cards:** Library forms, CSM feedback form link, clearance request
- **Icons:** Document/file icons in navy
- **CTA:** Download/Access buttons in gold outline

### Section 6 — ONLINE ACCESS (id="online-access")
- **Layout:** 2×2 card grid or horizontal scroll row
- **Links:**
  - JRMSU ARMS Online: `https://jrmsu-arms.online/`
  - Online Library Clearance: `https://www.jrmsu-clearance.online/`
  - Customer Satisfaction Feedback: `https://www.jrmsu.online/feedback`
  - University Website: `https://katipunan.jrmsu.edu.ph/`
- **Card style:** Navy gradient bg, gold icon, white text, external link badge

### Section 7 — FEEDBACK & COMPLAINTS (id="feedback")
- **Layout:** Centered form card (max 640px), on light-blue background
- **Fields:** Name (text) | Email (email) | Category (select: Borrowing / Returning / E-Library / Clearance / General / Complaint) | Message (textarea) | Submit button (gold)
- **CSM Link note:** Also link to official CSM form at www.jrmsu.online/feedback
- **Section heading:** `Feedback & Complaints Mechanism`

### Section 8 — CONTACT (id="contact")
- **Layout:** Two columns — contact info left, social card right
- **Contact info:**
  - Institution name: JRMSU-Katipunan Campus Library
  - Email: `katipunan.library@jrmsu.edu.ph`
  - Hours: Monday–Friday, 7:00 AM – 7:00 PM
  - Address: National Highway, Barangay Dos, Katipunan, Zamboanga del Norte
- **Social card:** Facebook link `https://www.facebook.com/JRMSUkatipunanlibrary/` with icon

### Section 9 — FOOTER
- **Background:** `--navy-dark`
- **Layout:** 3 columns — Logo/tagline | Quick links | Contact summary
- **Gold top border:** 2px solid gold
- **Copyright:** `© [YEAR] JRMSU-Katipunan Campus Library. All rights reserved.`
- **Sub-links:** JRMSU Main | GOV.PH | Data Privacy

---

## 7. MOTION & ANIMATION

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

## 8. COMPONENT SPECIFICATIONS

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

## 9. ACCESSIBILITY

- All color combinations meet WCAG 2.1 AA contrast (min 4.5:1 for body text, 3:1 for large text)
- Navy `#002B7F` on white `#FFFFFF`: ratio 8.6:1 ✅
- Gold `#C9A84C` on navy `#002B7F`: ratio 5.2:1 ✅
- White on navy: ratio 8.6:1 ✅
- Keyboard navigation: all interactive elements focusable
- `aria-label` on icon buttons, `aria-expanded` on accordion headers
- `prefers-reduced-motion`: disable animations, keep opacity transitions only
- Alt text on all images and decorative SVGs

---

## 10. SIGNATURE ELEMENT SUMMARY

**The Real-Time Philippine Library Status Clock** placed in the hero section is the single most memorable component. It communicates:
- Live awareness (the library is a living, responsive institution)
- Current time in Philippine Time (Asia/Manila timezone, UTC+8)
- Instant open/closed status with animated indicator
- Professional monospace type contrasting with the elegant serif headline

No other academic library landing page in the region features a real-time status clock as the hero centerpiece. This is the element visitors will remember and return for.

---

## 11. UNIVERSITY LIBRARIES LINKS

| Campus | URL |
|--------|-----|
| Main Campus (Dapitan) | https://jrmsu.edu.ph/library/ |
| Dipolog Campus | http://dipolog.jrmsu.edu.ph/ |
| Tampilisan Campus | http://tampilisan.jrmsu.edu.ph/ |
| Siocon Campus | http://siocon.jrmsu.edu.ph/ |
| **Katipunan Campus (This Library)** | *(current page)* |

---

## 12. EXTERNAL ACCESS LINKS

| Service | URL |
|---------|-----|
| JRMSU ARMS (Clearance) | https://jrmsu-arms.online/ |
| Online Library Clearance | https://www.jrmsu-clearance.online/ |
| Feedback Form (CSM) | https://www.jrmsu.online/feedback |
| JRMSU Katipunan Campus | https://katipunan.jrmsu.edu.ph/ |

---

*End of DESIGN.md*