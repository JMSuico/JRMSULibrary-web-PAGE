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
- **Backend**: Django + DRF + MySQL (NO SQLite ever)
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
